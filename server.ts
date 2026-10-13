import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, hashPassword, verifyPassword, StudentRecord } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'hadi-hadi-portal-secret-key-2025-secure';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple & Secure Token implementation using crypto HMAC
interface AuthTokenPayload {
  userId: string;
  username: string;
  role: 'admin' | 'student';
  studentId?: string;
  exp: number;
}

function createToken(payload: Omit<AuthTokenPayload, 'exp'>, expiresInSeconds = 86400): string {
  const fullPayload: AuthTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function verifyToken(tokenStr: string): AuthTokenPayload | null {
  try {
    const [body, signature] = tokenStr.split('.');
    if (!body || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(body).digest('base64url');
    if (signature !== expectedSig) return null;

    const payload: AuthTokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

// Custom request interface
interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

// Authentication Middleware
function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized: Token has expired or is invalid' });
    return;
  }

  req.user = payload;
  next();
}

// Role Middlewares
function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }
  next();
}

function requireStudent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'student') {
    res.status(403).json({ error: 'Forbidden: Student access required' });
    return;
  }
  next();
}

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// Login endpoint: handles both Admin and Student
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const authResult = db.authenticateUser(String(username), String(password));
  if (!authResult) {
    res.status(401).json({
      error: 'Invalid credentials. Students: please enter your registered Full Name as Username and Admission Number as Password.',
    });
    return;
  }

  const { user, studentProfile } = authResult;

  const token = createToken({
    userId: user.id,
    username: user.username,
    role: user.role,
    studentId: user.studentId,
  });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      studentId: user.studentId,
      studentProfile,
    },
  });
});

// Current user profile
app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = db.findUserById(req.user!.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  let studentProfile: StudentRecord | undefined;
  if (user.role === 'student' && user.studentId) {
    studentProfile = db.getStudentById(user.studentId);
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      studentId: user.studentId,
      studentProfile,
    },
  });
});

// Change Password
app.post('/api/auth/change-password', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required' });
    return;
  }

  if (newPassword.length < 4) {
    res.status(400).json({ error: 'New password must be at least 4 characters long' });
    return;
  }

  const user = db.findUserById(req.user!.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const isValid = verifyPassword(currentPassword, user.passwordHash, user.salt);
  if (!isValid) {
    res.status(400).json({ error: 'Current password does not match' });
    return;
  }

  const { hash, salt } = hashPassword(newPassword);
  db.updateUserPassword(user.id, hash, salt);

  res.json({ success: true, message: 'Password updated successfully' });
});

// ==========================================
// 2. ADMIN ROUTES
// ==========================================

// Dashboard Statistics & Overview
app.get('/api/admin/stats', authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  const students = db.getStudents();
  const classes = db.getClasses();
  const exams = db.getExams();
  const marks = db.getMarksForExam('ex-001'); // latest or all marks

  // Extract unique subjects across exams
  const subjectsSet = new Set<string>();
  exams.forEach((ex) => ex.subjects.forEach((s) => subjectsSet.add(s.name)));

  // Recent 5 students
  const recentlyAddedStudents = [...students]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Overall pass percentage calculation
  const allMarks = exams.flatMap((ex) => db.getMarksForExam(ex.id));
  const totalEntries = allMarks.length;
  const passedEntries = allMarks.filter((m) => m.passFail === 'PASS').length;
  const passRate = totalEntries > 0 ? Math.round((passedEntries / totalEntries) * 100) : 0;

  // Recent exams summary
  const recentExams = [...exams]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((ex) => {
      const exMarks = db.getMarksForExam(ex.id);
      const passed = exMarks.filter((m) => m.passFail === 'PASS').length;
      const passPercent = exMarks.length > 0 ? Math.round((passed / exMarks.length) * 100) : 0;
      const topScore = exMarks.length > 0 ? Math.max(...exMarks.map((m) => m.percentage)) : 0;
      return {
        id: ex.id,
        name: ex.name,
        className: ex.className,
        division: ex.division,
        examDate: ex.examDate,
        totalStudentsEvaluated: exMarks.length,
        passPercentage: passPercent,
        highestPercentage: topScore,
      };
    });

  res.json({
    totalStudents: students.length,
    totalClasses: classes.length,
    totalExams: exams.length,
    totalSubjects: subjectsSet.size || 6,
    overallPassRate: passRate,
    recentlyAddedStudents,
    recentExams,
  });
});

// All Students (Search, Filter, Pagination, Sorting)
app.get('/api/admin/students', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  let list = db.getStudents();

  const search = String(req.query.search || '').trim().toLowerCase();
  const className = String(req.query.className || '').trim();
  const division = String(req.query.division || '').trim();
  const sortBy = String(req.query.sortBy || 'admissionNo');
  const sortOrder = String(req.query.sortOrder || 'asc');
  const page = parseInt(String(req.query.page || '1'), 10);
  const limit = parseInt(String(req.query.limit || '10'), 10);

  // Filters
  if (search) {
    list = list.filter(
      (s) =>
        s.fullName.toLowerCase().includes(search) ||
        s.admissionNo.toLowerCase().includes(search) ||
        s.rollNo.toLowerCase().includes(search) ||
        s.fatherName.toLowerCase().includes(search) ||
        s.studentPhone.toLowerCase().includes(search)
    );
  }

  if (className && className !== 'All') {
    list = list.filter((s) => s.className === className);
  }

  if (division && division !== 'All') {
    list = list.filter((s) => s.division === division);
  }

  // Sorting
  list.sort((a, b) => {
    let valA = (a as Record<string, any>)[sortBy] || '';
    let valB = (b as Record<string, any>)[sortBy] || '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const total = list.length;
  const startIndex = (page - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit);

  res.json({
    students: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

// Add New Student
app.post('/api/admin/students', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      fullName,
      fatherName,
      motherName,
      dob,
      gender,
      address,
      studentPhone,
      parentPhone,
      admissionNo,
      rollNo,
      className,
      division,
      academicYear,
      admissionDate,
    } = req.body;

    // Strict validation
    if (!fullName || !admissionNo || !className || !division) {
      res.status(400).json({ error: 'Full Name, Admission Number, Class, and Division are required.' });
      return;
    }

    // Check duplicate admission number
    const existing = db.getStudentByAdmissionNo(admissionNo);
    if (existing) {
      res.status(400).json({ error: `Admission Number '${admissionNo}' already exists in the system!` });
      return;
    }

    const created = db.addStudent({
      fullName: fullName.trim(),
      fatherName: (fatherName || '').trim(),
      motherName: (motherName || '').trim(),
      dob: dob || '',
      gender: gender || 'Male',
      address: (address || '').trim(),
      studentPhone: (studentPhone || '').trim(),
      parentPhone: (parentPhone || '').trim(),
      admissionNo: admissionNo.trim(),
      rollNo: (rollNo || '').trim(),
      className: className.trim(),
      division: division.trim(),
      academicYear: (academicYear || '2025-2026').trim(),
      admissionDate: admissionDate || new Date().toISOString().split('T')[0],
    });

    res.status(201).json({
      success: true,
      student: created,
      message: `Student '${created.fullName}' successfully enrolled! Student Login: Username is '${created.fullName}', Password is '${created.admissionNo}'.`,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to add student' });
  }
});

// Update Student
app.put('/api/admin/students/:id', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateStudent(id, req.body);
    res.json({ success: true, student: updated, message: 'Student records updated successfully.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update student' });
  }
});

// Delete Student
app.delete('/api/admin/students/:id', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = db.deleteStudent(id);
  if (!ok) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }
  res.json({ success: true, message: 'Student and related records deleted successfully.' });
});

// Reset student password to default '1000'
app.post('/api/admin/students/:id/reset-password', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const student = db.getStudentById(id);
  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  const newPass = req.body.password || '1000';
  db.resetStudentPassword(student.admissionNo, newPass);
  res.json({ success: true, message: `Password for ${student.admissionNo} has been reset to '${newPass}'.` });
});

// Classes & Divisions
app.get('/api/admin/classes', authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  const classes = db.getClasses();
  const students = db.getStudents();

  // Augment with student counts
  const augmented = classes.map((c) => {
    const count = students.filter((s) => s.className === c.name && s.division === c.division).length;
    return { ...c, studentCount: count };
  });

  res.json(augmented);
});

app.post('/api/admin/classes', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  const { name, division, classTeacher, academicYear } = req.body;
  if (!name || !division) {
    res.status(400).json({ error: 'Class Name and Division are required.' });
    return;
  }

  const created = db.addClass({
    name: name.trim(),
    division: division.trim(),
    classTeacher: (classTeacher || '').trim(),
    academicYear: (academicYear || '2025-2026').trim(),
  });

  res.status(201).json(created);
});

app.delete('/api/admin/classes/:id', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  db.deleteClass(id);
  res.json({ success: true });
});

// Exams Management
app.get('/api/admin/exams', authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  const exams = db.getExams();
  res.json(exams);
});

app.post('/api/admin/exams', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  const { name, academicYear, className, division, examDate, subjects } = req.body;

  if (!name || !className || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
    res.status(400).json({ error: 'Exam Name, Class, and at least one Subject are required.' });
    return;
  }

  const created = db.addExam({
    name: name.trim(),
    academicYear: academicYear || '2025-2026',
    className: className.trim(),
    division: division || 'All',
    examDate: examDate || new Date().toISOString().split('T')[0],
    subjects,
    status: 'published',
  });

  res.status(201).json(created);
});

app.put('/api/admin/exams/:id', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateExam(id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/admin/exams/:id', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  db.deleteExam(id);
  res.json({ success: true });
});

// Marks Entry & Retrieval
app.get('/api/admin/marks/:examId', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  const { examId } = req.params;
  const exam = db.getExamById(examId);
  if (!exam) {
    res.status(404).json({ error: 'Exam not found' });
    return;
  }

  const marks = db.getMarksForExam(examId);
  // Get eligible students for this class/division
  let eligibleStudents = db.getStudents().filter((s) => s.className === exam.className);
  if (exam.division !== 'All') {
    eligibleStudents = eligibleStudents.filter((s) => s.division === exam.division);
  }

  res.json({
    exam,
    marks,
    eligibleStudents,
  });
});

app.post('/api/admin/marks/:examId', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const { entries } = req.body;

    if (!Array.isArray(entries)) {
      res.status(400).json({ error: 'Entries must be an array of student marks' });
      return;
    }

    const updated = db.saveMarksBatch(examId, entries);
    res.json({ success: true, marks: updated, message: 'Marks recorded and ranks recalculated successfully!' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to save marks' });
  }
});

app.delete('/api/admin/marks/:examId/:studentId', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  const { examId, studentId } = req.params;
  const ok = db.deleteMarksForStudent(examId, studentId);
  res.json({ success: ok });
});

// Consolidated Results & Reports
app.get('/api/admin/reports/:examId', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  const { examId } = req.params;
  const exam = db.getExamById(examId);
  if (!exam) {
    res.status(404).json({ error: 'Exam not found' });
    return;
  }

  const marks = db.getMarksForExam(examId);
  const totalStudents = marks.length;
  const passedStudents = marks.filter((m) => m.passFail === 'PASS').length;
  const failedStudents = totalStudents - passedStudents;
  const passRate = totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0;

  // Grade distributions
  const gradeCounts: Record<string, number> = { 'A+': 0, A: 0, 'B+': 0, B: 0, 'C+': 0, C: 0, D: 0, F: 0 };
  marks.forEach((m) => {
    gradeCounts[m.grade] = (gradeCounts[m.grade] || 0) + 1;
  });

  // Subject-wise average scores
  const subjectAverages: Record<string, { name: string; avg: number; max: number; passRate: number }> = {};
  exam.subjects.forEach((sub) => {
    let sum = 0;
    let count = 0;
    let passed = 0;

    marks.forEach((m) => {
      const mark = m.marks[sub.id];
      if (mark !== undefined) {
        sum += mark;
        count++;
        if (mark >= sub.passMarks) passed++;
      }
    });

    subjectAverages[sub.id] = {
      name: sub.name,
      avg: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
      max: sub.maxMarks,
      passRate: count > 0 ? Math.round((passed / count) * 100) : 0,
    };
  });

  // Top 3 Toppers
  const toppers = [...marks]
    .filter((m) => m.passFail === 'PASS')
    .sort((a, b) => (a.rank || 999) - (b.rank || 999))
    .slice(0, 3);

  res.json({
    exam,
    totalStudents,
    passedStudents,
    failedStudents,
    passRate,
    gradeCounts,
    subjectAverages,
    toppers,
    marks,
  });
});

// Database Backup JSON
app.get('/api/admin/backup', authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  const jsonBackup = db.exportBackup();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="hadi_student_portal_backup_${Date.now()}.json"`);
  res.send(jsonBackup);
});

// Database Restore JSON
app.post('/api/admin/restore', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  const { backupData } = req.body;
  if (!backupData) {
    res.status(400).json({ error: 'Missing backup data' });
    return;
  }

  const success = db.importBackup(typeof backupData === 'string' ? backupData : JSON.stringify(backupData));
  if (!success) {
    res.status(400).json({ error: 'Invalid backup structure. Restore failed.' });
    return;
  }

  res.json({ success: true, message: 'Database restored successfully!' });
});

// CSV Export: Students
app.get('/api/admin/export/students.csv', authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  const students = db.getStudents();
  const headers = [
    'Admission Number',
    'Roll Number',
    'Full Name',
    'Father Name',
    'Mother Name',
    'Class',
    'Division',
    'Gender',
    'Date of Birth',
    'Student Phone',
    'Parent Phone',
    'Address',
    'Academic Year',
  ];

  const rows = students.map((s) => [
    `"${s.admissionNo}"`,
    `"${s.rollNo}"`,
    `"${s.fullName}"`,
    `"${s.fatherName}"`,
    `"${s.motherName}"`,
    `"${s.className}"`,
    `"${s.division}"`,
    `"${s.gender}"`,
    `"${s.dob}"`,
    `"${s.studentPhone}"`,
    `"${s.parentPhone}"`,
    `"${s.address.replace(/"/g, '""')}"`,
    `"${s.academicYear}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="students_roster.csv"');
  res.send(csv);
});

// CSV Export: Marks
app.get('/api/admin/export/marks.csv', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  const examId = String(req.query.examId || 'ex-001');
  const exam = db.getExamById(examId);
  const marks = db.getMarksForExam(examId);

  const subjectNames = (exam ? exam.subjects : []).map((s) => s.name);
  const headers = ['Admission No', 'Roll No', 'Student Name', 'Class', 'Division', ...subjectNames, 'Total Marks', 'Max Marks', 'Percentage', 'Grade', 'Result', 'Rank'];

  const rows = marks.map((m) => {
    const subMarks = (exam ? exam.subjects : []).map((s) => m.marks[s.id] ?? '-');
    return [
      `"${m.admissionNo}"`,
      `"${m.rollNo}"`,
      `"${m.studentName}"`,
      `"${m.className}"`,
      `"${m.division}"`,
      ...subMarks,
      m.totalMarks,
      m.maxTotalMarks,
      `${m.percentage}%`,
      m.grade,
      m.passFail,
      m.rank || '-',
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="exam_marks_${examId}.csv"`);
  res.send(csv);
});

// Reset to Seed
app.post('/api/admin/reset-seed', authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  db.resetToSeed();
  res.json({ success: true, message: 'Database reset to default sample data successfully.' });
});

// Update School Settings
app.put('/api/admin/settings', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

app.get('/api/admin/settings', authMiddleware, (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

// ==========================================
// 3. STUDENT ROUTES (Strictly private)
// ==========================================

// Student Profile (Accessible only to the logged-in student)
app.get('/api/student/profile', authMiddleware, requireStudent, (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user!.studentId;
  if (!studentId) {
    res.status(404).json({ error: 'Student profile not associated with this account' });
    return;
  }

  const student = db.getStudentById(studentId);
  if (!student) {
    res.status(404).json({ error: 'Student record not found' });
    return;
  }

  res.json({ student });
});

// Student Results & Exam History (Strictly for the logged-in student)
app.get('/api/student/results', authMiddleware, requireStudent, (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user!.studentId;
  if (!studentId) {
    res.status(404).json({ error: 'Student profile not found' });
    return;
  }

  const student = db.getStudentById(studentId);
  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  const studentMarks = db.getMarksForStudent(studentId);
  const exams = db.getExams();

  const augmentedResults = studentMarks.map((m) => {
    const exam = exams.find((e) => e.id === m.examId);
    return {
      markEntry: m,
      exam,
    };
  });

  res.json({
    student,
    results: augmentedResults,
  });
});

// Official Printable Marksheet data
app.get('/api/student/marksheet/:examId', authMiddleware, requireStudent, (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user!.studentId;
  const { examId } = req.params;

  const student = db.getStudentById(studentId!);
  const exam = db.getExamById(examId);
  const markEntry = db.getMarksForStudentAndExam(studentId!, examId);
  const settings = db.getSettings();

  if (!student || !exam || !markEntry) {
    res.status(404).json({ error: 'Result not found for this examination' });
    return;
  }

  res.json({
    student,
    exam,
    markEntry,
    school: settings,
    issuedDate: new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  });
});

// ==========================================
// 4. FRONTEND SERVING & DEV INTEGRATION
// ==========================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HADI HADI Student Portal Pro running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
