import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Types
export interface StudentRecord {
  id: string;
  admissionNo: string;
  rollNo: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  studentPhone: string;
  parentPhone: string;
  className: string;
  division: string;
  academicYear: string;
  admissionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectConfig {
  id: string;
  name: string;
  maxMarks: number;
  passMarks: number;
}

export interface ExamRecord {
  id: string;
  name: string;
  academicYear: string;
  className: string;
  division: string; // 'All' or specific like 'A'
  examDate: string;
  subjects: SubjectConfig[];
  status: 'draft' | 'published' | 'completed';
  createdAt: string;
}

export interface StudentMarksEntry {
  id: string;
  examId: string;
  studentId: string;
  admissionNo: string;
  studentName: string;
  rollNo: string;
  className: string;
  division: string;
  marks: Record<string, number>; // subjectId -> mark obtained
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  grade: string;
  passFail: 'PASS' | 'FAIL';
  rank?: number;
  remarks?: string;
  updatedAt: string;
}

export interface UserRecord {
  id: string;
  username: string; // 'admin' or admissionNo for student
  role: 'admin' | 'student';
  passwordHash: string;
  salt: string;
  name: string;
  studentId?: string;
}

export interface ClassDivisionRecord {
  id: string;
  name: string; // e.g. "Class 10"
  division: string; // "A"
  classTeacher: string;
  academicYear: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  students: StudentRecord[];
  classes: ClassDivisionRecord[];
  exams: ExamRecord[];
  marks: StudentMarksEntry[];
  settings: {
    schoolName: string;
    schoolTagline: string;
    schoolAddress: string;
    schoolCode: string;
    currentAcademicYear: string;
  };
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

// Password hashing utilities using standard node:crypto
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const userSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, userSalt, 64).toString('hex');
  return { hash, salt: userSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computed = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch {
    return false;
  }
}

// Grading system helper
export function calculateGradeAndResult(
  totalMarks: number,
  maxTotalMarks: number,
  subjectMarks: Record<string, number>,
  subjects: SubjectConfig[]
): { percentage: number; grade: string; passFail: 'PASS' | 'FAIL' } {
  if (maxTotalMarks <= 0) return { percentage: 0, grade: 'F', passFail: 'FAIL' };

  const percentage = Math.round((totalMarks / maxTotalMarks) * 1000) / 10;

  // Check if student failed in any subject
  let failedAny = false;
  for (const sub of subjects) {
    const mark = subjectMarks[sub.id] ?? 0;
    if (mark < sub.passMarks) {
      failedAny = true;
      break;
    }
  }

  let grade = 'F';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B+';
  else if (percentage >= 60) grade = 'B';
  else if (percentage >= 50) grade = 'C+';
  else if (percentage >= 40) grade = 'C';
  else if (percentage >= 35) grade = 'D';
  else grade = 'F';

  const passFail: 'PASS' | 'FAIL' = !failedAny && percentage >= 35 ? 'PASS' : 'FAIL';

  return { percentage, grade, passFail };
}

export function calculateRanks(entries: StudentMarksEntry[]): StudentMarksEntry[] {
  // Sort descending by percentage, then by totalMarks
  const sorted = [...entries].sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    return b.totalMarks - a.totalMarks;
  });

  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0) {
      if (sorted[i].percentage < sorted[i - 1].percentage) {
        currentRank = i + 1;
      }
    }
    // Only students who passed receive a numerical rank
    if (sorted[i].passFail === 'PASS') {
      sorted[i].rank = currentRank;
    } else {
      sorted[i].rank = undefined;
    }
  }

  return sorted;
}

// Seed Data Generator
function generateSeedData(): DatabaseSchema {
  const adminAuth = hashPassword('admin123');
  const studentDefaultAuth = hashPassword('1000');

  const classes: ClassDivisionRecord[] = [
    { id: 'cls-10a', name: 'Class 10', division: 'A', classTeacher: 'Mr. Abdul Rahman', academicYear: '2025-2026' },
    { id: 'cls-10b', name: 'Class 10', division: 'B', classTeacher: 'Mrs. Jayalakshmi K', academicYear: '2025-2026' },
    { id: 'cls-9a', name: 'Class 9', division: 'A', classTeacher: 'Mr. Vinod Kumar', academicYear: '2025-2026' },
    { id: 'cls-8a', name: 'Class 8', division: 'A', classTeacher: 'Ms. Safiya Banu', academicYear: '2025-2026' },
    { id: 'cls-12a', name: 'Class 12', division: 'A', classTeacher: 'Dr. Suresh Babu', academicYear: '2025-2026' },
  ];

  const students: StudentRecord[] = [
    {
      id: 'std-001',
      admissionNo: 'HADI-2025-001',
      rollNo: '101',
      fullName: 'Muhammad Hadi',
      fatherName: 'Musthafa Kamal',
      motherName: 'Amina Beegum',
      dob: '2009-04-14',
      gender: 'Male',
      address: 'Hadi Villa, Green Valley Road, Calicut, Kerala',
      studentPhone: '9847123456',
      parentPhone: '9847012345',
      className: 'Class 10',
      division: 'A',
      academicYear: '2025-2026',
      admissionDate: '2025-06-01',
      createdAt: '2025-06-01T09:00:00Z',
      updatedAt: '2025-06-01T09:00:00Z',
    },
    {
      id: 'std-002',
      admissionNo: 'HADI-2025-002',
      rollNo: '102',
      fullName: 'Fathima Zahra',
      fatherName: 'Ibrahim Kutty',
      motherName: 'Suhaiba Rahman',
      dob: '2009-08-22',
      gender: 'Female',
      address: 'Zahra Manzil, Beach Road, Kozhikode, Kerala',
      studentPhone: '9447234567',
      parentPhone: '9447123456',
      className: 'Class 10',
      division: 'A',
      academicYear: '2025-2026',
      admissionDate: '2025-06-01',
      createdAt: '2025-06-01T09:15:00Z',
      updatedAt: '2025-06-01T09:15:00Z',
    },
    {
      id: 'std-003',
      admissionNo: 'HADI-2025-003',
      rollNo: '103',
      fullName: 'Rahul Krishna',
      fatherName: 'Radhakrishnan Nair',
      motherName: 'Bindu R',
      dob: '2009-02-10',
      gender: 'Male',
      address: 'Krishna Kripa, Stadium Bypass, Palakkad, Kerala',
      studentPhone: '9746345678',
      parentPhone: '9746234567',
      className: 'Class 10',
      division: 'A',
      academicYear: '2025-2026',
      admissionDate: '2025-06-02',
      createdAt: '2025-06-02T10:00:00Z',
      updatedAt: '2025-06-02T10:00:00Z',
    },
    {
      id: 'std-004',
      admissionNo: 'HADI-2025-004',
      rollNo: '104',
      fullName: 'Ayesha Banu',
      fatherName: 'Anwar Sadath',
      motherName: 'Ruksana K',
      dob: '2009-11-05',
      gender: 'Female',
      address: 'Garden View, Hill Highway, Wayanad, Kerala',
      studentPhone: '9895456789',
      parentPhone: '9895345678',
      className: 'Class 10',
      division: 'A',
      academicYear: '2025-2026',
      admissionDate: '2025-06-02',
      createdAt: '2025-06-02T10:30:00Z',
      updatedAt: '2025-06-02T10:30:00Z',
    },
    {
      id: 'std-005',
      admissionNo: 'HADI-2025-005',
      rollNo: '105',
      fullName: 'Abhinav Menon',
      fatherName: 'Girish Menon',
      motherName: 'Deepa Menon',
      dob: '2009-05-18',
      gender: 'Male',
      address: 'Menon Estate, Karaparamba, Kozhikode, Kerala',
      studentPhone: '9633567890',
      parentPhone: '9633456789',
      className: 'Class 10',
      division: 'A',
      academicYear: '2025-2026',
      admissionDate: '2025-06-03',
      createdAt: '2025-06-03T11:00:00Z',
      updatedAt: '2025-06-03T11:00:00Z',
    },
    {
      id: 'std-006',
      admissionNo: 'HADI-2025-006',
      rollNo: '106',
      fullName: 'Sneha Varma',
      fatherName: 'Dr. Ravi Varma',
      motherName: 'Parvathi Devi',
      dob: '2009-09-30',
      gender: 'Female',
      address: 'Kovilage, West Hill, Calicut, Kerala',
      studentPhone: '9496678901',
      parentPhone: '9496567890',
      className: 'Class 10',
      division: 'B',
      academicYear: '2025-2026',
      admissionDate: '2025-06-04',
      createdAt: '2025-06-04T09:30:00Z',
      updatedAt: '2025-06-04T09:30:00Z',
    },
    {
      id: 'std-007',
      admissionNo: 'HADI-2025-007',
      rollNo: '107',
      fullName: 'Bilal Ahmed',
      fatherName: 'Sayed Ahmed',
      motherName: 'Naseema K',
      dob: '2009-12-12',
      gender: 'Male',
      address: 'Al-Huda House, Feroke, Kozhikode, Kerala',
      studentPhone: '9846789012',
      parentPhone: '9846678901',
      className: 'Class 10',
      division: 'B',
      academicYear: '2025-2026',
      admissionDate: '2025-06-04',
      createdAt: '2025-06-04T10:15:00Z',
      updatedAt: '2025-06-04T10:15:00Z',
    },
    {
      id: 'std-008',
      admissionNo: 'HADI-2025-008',
      rollNo: '201',
      fullName: 'Ananya Nair',
      fatherName: 'Sreekumar Nair',
      motherName: 'Geetha Kumari',
      dob: '2010-03-25',
      gender: 'Female',
      address: 'Prasanthi, Medical College PO, Kozhikode, Kerala',
      studentPhone: '9567890123',
      parentPhone: '9567789012',
      className: 'Class 9',
      division: 'A',
      academicYear: '2025-2026',
      admissionDate: '2025-06-05',
      createdAt: '2025-06-05T09:00:00Z',
      updatedAt: '2025-06-05T09:00:00Z',
    },
  ];

  const users: UserRecord[] = [
    {
      id: 'usr-admin',
      username: 'admin',
      role: 'admin',
      passwordHash: adminAuth.hash,
      salt: adminAuth.salt,
      name: 'System Administrator',
    },
  ];

  // Create student login user accounts: username is student Full Name, password is Admission Number
  for (const std of students) {
    const stdAuth = hashPassword(std.admissionNo);
    users.push({
      id: `usr-${std.id}`,
      username: std.fullName,
      role: 'student',
      passwordHash: stdAuth.hash,
      salt: stdAuth.salt,
      name: std.fullName,
      studentId: std.id,
    });
  }

  const standardSubjects: SubjectConfig[] = [
    { id: 'sub-eng', name: 'English Language', maxMarks: 100, passMarks: 40 },
    { id: 'sub-math', name: 'Mathematics', maxMarks: 100, passMarks: 40 },
    { id: 'sub-sci', name: 'General Science', maxMarks: 100, passMarks: 40 },
    { id: 'sub-soc', name: 'Social Studies', maxMarks: 100, passMarks: 40 },
    { id: 'sub-mal', name: 'Malayalam / Second Lang', maxMarks: 100, passMarks: 40 },
    { id: 'sub-it', name: 'Computer Science & IT', maxMarks: 100, passMarks: 40 },
  ];

  const exams: ExamRecord[] = [
    {
      id: 'ex-001',
      name: 'First Term Examination 2025',
      academicYear: '2025-2026',
      className: 'Class 10',
      division: 'A',
      examDate: '2025-09-15',
      subjects: standardSubjects,
      status: 'completed',
      createdAt: '2025-09-01T08:00:00Z',
    },
    {
      id: 'ex-002',
      name: 'Mid Term Assessment 2025',
      academicYear: '2025-2026',
      className: 'Class 10',
      division: 'A',
      examDate: '2025-11-20',
      subjects: standardSubjects,
      status: 'completed',
      createdAt: '2025-11-01T08:00:00Z',
    },
    {
      id: 'ex-003',
      name: 'Annual Model Exam 2026',
      academicYear: '2025-2026',
      className: 'Class 10',
      division: 'A',
      examDate: '2026-02-10',
      subjects: standardSubjects,
      status: 'published',
      createdAt: '2026-02-01T08:00:00Z',
    },
  ];

  // Seed realistic marks for Class 10A students in First Term Examination
  const rawMarks10A = [
    {
      studentId: 'std-001',
      admissionNo: 'HADI-2025-001',
      studentName: 'Muhammad Hadi',
      rollNo: '101',
      marks: { 'sub-eng': 94, 'sub-math': 98, 'sub-sci': 96, 'sub-soc': 92, 'sub-mal': 95, 'sub-it': 99 },
    },
    {
      studentId: 'std-002',
      admissionNo: 'HADI-2025-002',
      studentName: 'Fathima Zahra',
      rollNo: '102',
      marks: { 'sub-eng': 96, 'sub-math': 95, 'sub-sci': 94, 'sub-soc': 95, 'sub-mal': 98, 'sub-it': 96 },
    },
    {
      studentId: 'std-003',
      admissionNo: 'HADI-2025-003',
      studentName: 'Rahul Krishna',
      rollNo: '103',
      marks: { 'sub-eng': 88, 'sub-math': 92, 'sub-sci': 90, 'sub-soc': 85, 'sub-mal': 89, 'sub-it': 94 },
    },
    {
      studentId: 'std-004',
      admissionNo: 'HADI-2025-004',
      studentName: 'Ayesha Banu',
      rollNo: '104',
      marks: { 'sub-eng': 85, 'sub-math': 78, 'sub-sci': 82, 'sub-soc': 80, 'sub-mal': 88, 'sub-it': 89 },
    },
    {
      studentId: 'std-005',
      admissionNo: 'HADI-2025-005',
      studentName: 'Abhinav Menon',
      rollNo: '105',
      marks: { 'sub-eng': 76, 'sub-math': 72, 'sub-sci': 70, 'sub-soc': 68, 'sub-mal': 75, 'sub-it': 80 },
    },
  ];

  const marks: StudentMarksEntry[] = [];
  const maxTotalMarks = standardSubjects.reduce((acc, s) => acc + s.maxMarks, 0);

  for (const item of rawMarks10A) {
    const totalMarks = Object.values(item.marks).reduce((a, b) => a + b, 0);
    const { percentage, grade, passFail } = calculateGradeAndResult(
      totalMarks,
      maxTotalMarks,
      item.marks,
      standardSubjects
    );

    marks.push({
      id: `mrk-ex1-${item.studentId}`,
      examId: 'ex-001',
      studentId: item.studentId,
      admissionNo: item.admissionNo,
      studentName: item.studentName,
      rollNo: item.rollNo,
      className: 'Class 10',
      division: 'A',
      marks: item.marks,
      totalMarks,
      maxTotalMarks,
      percentage,
      grade,
      passFail,
      updatedAt: '2025-09-25T14:30:00Z',
    });
  }

  // Calculate ranks for Exam 1
  const ranked = calculateRanks(marks);

  return {
    users,
    students,
    classes,
    exams,
    marks: ranked,
    settings: {
      schoolName: 'HADI HADI ACADEMY & HIGHER SECONDARY SCHOOL',
      schoolTagline: 'Empowering Minds, Inspiring Excellence',
      schoolAddress: 'Knowledge City, Wayanad Road, Calicut, Kerala 673571',
      schoolCode: 'KL-CC-2025',
      currentAcademicYear: '2025-2026',
    },
  };
}

// In-Memory & File-Synchronized Database Engine
class DatabaseEngine {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadFromFile();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private loadFromFile(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.students && parsed.exams) {
          // Synchronize student login accounts: username is Full Name, password is Admission Number
          for (const std of parsed.students) {
            let u = parsed.users.find((user: any) => user.studentId === std.id);
            const stdAuth = hashPassword(std.admissionNo);
            if (!u) {
              parsed.users.push({
                id: `usr-${std.id}`,
                username: std.fullName,
                role: 'student',
                passwordHash: stdAuth.hash,
                salt: stdAuth.salt,
                name: std.fullName,
                studentId: std.id,
              });
            } else {
              u.username = std.fullName;
              u.name = std.fullName;
              u.passwordHash = stdAuth.hash;
              u.salt = stdAuth.salt;
            }
          }
          this.saveToFile(parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading database file, initializing seed:', err);
    }

    const seed = generateSeedData();
    this.saveToFile(seed);
    return seed;
  }

  private saveToFile(state: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(state, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public persist() {
    this.saveToFile(this.data);
  }

  public resetToSeed(): DatabaseSchema {
    this.data = generateSeedData();
    this.persist();
    return this.data;
  }

  public exportBackup(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public importBackup(backupJson: string): boolean {
    try {
      const parsed = JSON.parse(backupJson);
      if (Array.isArray(parsed.students) && Array.isArray(parsed.exams) && Array.isArray(parsed.users)) {
        this.data = parsed;
        this.persist();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // --- Users / Auth ---
  public findUserByUsername(username: string): UserRecord | undefined {
    return this.data.users.find(
      (u) => u.username.trim().toLowerCase() === username.trim().toLowerCase()
    );
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public authenticateUser(usernameInput: string, passwordInput: string): { user: UserRecord; studentProfile?: StudentRecord } | null {
    const trimmedUser = usernameInput.trim();
    const trimmedPass = passwordInput.trim();

    // 1. Admin Authentication
    if (trimmedUser.toLowerCase() === 'admin') {
      const adminUser = this.data.users.find((u) => u.role === 'admin' && u.username.toLowerCase() === 'admin');
      if (adminUser && verifyPassword(trimmedPass, adminUser.passwordHash, adminUser.salt)) {
        return { user: adminUser };
      }
      return null;
    }

    // 2. Student Authentication:
    // Username: The student's full name entered by Admin (or admission number)
    // Password: The student's Admission Number entered by Admin
    const matchedStudent = this.data.students.find(
      (s) =>
        s.fullName.trim().toLowerCase() === trimmedUser.toLowerCase() ||
        s.admissionNo.trim().toLowerCase() === trimmedUser.toLowerCase()
    );

    if (matchedStudent) {
      // Check if password matches student's admission number
      const passMatchesAdmission = matchedStudent.admissionNo.trim().toLowerCase() === trimmedPass.toLowerCase();

      let userRec = this.data.users.find((u) => u.studentId === matchedStudent.id);
      if (!userRec) {
        const auth = hashPassword(matchedStudent.admissionNo);
        userRec = {
          id: `usr-${matchedStudent.id}`,
          username: matchedStudent.fullName,
          role: 'student',
          passwordHash: auth.hash,
          salt: auth.salt,
          name: matchedStudent.fullName,
          studentId: matchedStudent.id,
        };
        this.data.users.push(userRec);
        this.persist();
      }

      const passMatchesHash = verifyPassword(trimmedPass, userRec.passwordHash, userRec.salt);

      if (passMatchesAdmission || passMatchesHash) {
        return { user: userRec, studentProfile: matchedStudent };
      }
    }

    return null;
  }

  public updateUserPassword(userId: string, newHash: string, newSalt: string): boolean {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return false;
    user.passwordHash = newHash;
    user.salt = newSalt;
    this.persist();
    return true;
  }

  public resetStudentPassword(admissionNo: string, newPassword?: string): boolean {
    const student = this.getStudentByAdmissionNo(admissionNo);
    const passToSet = newPassword || (student ? student.admissionNo : '1000');
    const user = this.data.users.find(
      (u) => (student && u.studentId === student.id) || u.username.trim().toLowerCase() === admissionNo.trim().toLowerCase()
    );
    if (!user) return false;
    const { hash, salt } = hashPassword(passToSet);
    user.passwordHash = hash;
    user.salt = salt;
    this.persist();
    return true;
  }

  // --- Students ---
  public getStudents(): StudentRecord[] {
    return [...this.data.students];
  }

  public getStudentById(id: string): StudentRecord | undefined {
    return this.data.students.find((s) => s.id === id);
  }

  public getStudentByAdmissionNo(admissionNo: string): StudentRecord | undefined {
    return this.data.students.find(
      (s) => s.admissionNo.trim().toLowerCase() === admissionNo.trim().toLowerCase()
    );
  }

  public addStudent(studentData: Omit<StudentRecord, 'id' | 'createdAt' | 'updatedAt'>): StudentRecord {
    // Check duplicate admission number
    const existing = this.getStudentByAdmissionNo(studentData.admissionNo);
    if (existing) {
      throw new Error(`Admission number '${studentData.admissionNo}' is already registered.`);
    }

    const id = `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const newStudent: StudentRecord = {
      ...studentData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.data.students.push(newStudent);

    // Create student login account: username = student's full name, password = admission number
    const { hash, salt } = hashPassword(newStudent.admissionNo);
    this.data.users.push({
      id: `usr-${id}`,
      username: newStudent.fullName,
      role: 'student',
      passwordHash: hash,
      salt,
      name: newStudent.fullName,
      studentId: id,
    });

    this.persist();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Omit<StudentRecord, 'id' | 'createdAt'>>): StudentRecord {
    const student = this.data.students.find((s) => s.id === id);
    if (!student) throw new Error('Student not found');

    if (updates.admissionNo && updates.admissionNo !== student.admissionNo) {
      const existing = this.getStudentByAdmissionNo(updates.admissionNo);
      if (existing && existing.id !== id) {
        throw new Error(`Admission number '${updates.admissionNo}' already in use.`);
      }
      // Update password in users table to new admission number
      const user = this.data.users.find((u) => u.studentId === id);
      if (user) {
        const auth = hashPassword(updates.admissionNo);
        user.passwordHash = auth.hash;
        user.salt = auth.salt;
      }
      // Update marks table admission number
      this.data.marks.forEach((m) => {
        if (m.studentId === id) {
          m.admissionNo = updates.admissionNo!;
        }
      });
    }

    if (updates.fullName) {
      const user = this.data.users.find((u) => u.studentId === id);
      if (user) {
        user.name = updates.fullName;
        user.username = updates.fullName;
      }
      // Update marks table student name
      this.data.marks.forEach((m) => {
        if (m.studentId === id) {
          m.studentName = updates.fullName!;
        }
      });
    }

    if (updates.className || updates.division) {
      this.data.marks.forEach((m) => {
        if (m.studentId === id) {
          if (updates.className) m.className = updates.className;
          if (updates.division) m.division = updates.division;
        }
      });
    }

    Object.assign(student, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return student;
  }

  public deleteStudent(id: string): boolean {
    const student = this.getStudentById(id);
    if (!student) return false;

    this.data.students = this.data.students.filter((s) => s.id !== id);
    this.data.users = this.data.users.filter((u) => u.studentId !== id);
    this.data.marks = this.data.marks.filter((m) => m.studentId !== id);

    this.persist();
    return true;
  }

  // --- Classes ---
  public getClasses(): ClassDivisionRecord[] {
    return [...this.data.classes];
  }

  public addClass(data: Omit<ClassDivisionRecord, 'id'>): ClassDivisionRecord {
    const id = `cls-${Date.now()}`;
    const newClass: ClassDivisionRecord = { id, ...data };
    this.data.classes.push(newClass);
    this.persist();
    return newClass;
  }

  public deleteClass(id: string): boolean {
    this.data.classes = this.data.classes.filter((c) => c.id !== id);
    this.persist();
    return true;
  }

  // --- Exams ---
  public getExams(): ExamRecord[] {
    return [...this.data.exams];
  }

  public getExamById(id: string): ExamRecord | undefined {
    return this.data.exams.find((e) => e.id === id);
  }

  public addExam(examData: Omit<ExamRecord, 'id' | 'createdAt'>): ExamRecord {
    const id = `ex-${Date.now()}`;
    const newExam: ExamRecord = {
      ...examData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.exams.push(newExam);
    this.persist();
    return newExam;
  }

  public updateExam(id: string, updates: Partial<Omit<ExamRecord, 'id' | 'createdAt'>>): ExamRecord {
    const exam = this.data.exams.find((e) => e.id === id);
    if (!exam) throw new Error('Exam not found');
    Object.assign(exam, updates);
    this.persist();
    return exam;
  }

  public deleteExam(id: string): boolean {
    this.data.exams = this.data.exams.filter((e) => e.id !== id);
    this.data.marks = this.data.marks.filter((m) => m.examId !== id);
    this.persist();
    return true;
  }

  // --- Marks ---
  public getMarksForExam(examId: string): StudentMarksEntry[] {
    return this.data.marks.filter((m) => m.examId === examId);
  }

  public getMarksForStudent(studentId: string): StudentMarksEntry[] {
    return this.data.marks.filter((m) => m.studentId === studentId);
  }

  public getMarksForStudentAndExam(studentId: string, examId: string): StudentMarksEntry | undefined {
    return this.data.marks.find((m) => m.studentId === studentId && m.examId === examId);
  }

  public saveMarksBatch(
    examId: string,
    entries: Array<{
      studentId: string;
      marks: Record<string, number>;
      remarks?: string;
    }>
  ): StudentMarksEntry[] {
    const exam = this.getExamById(examId);
    if (!exam) throw new Error('Exam not found');

    const maxTotalMarks = exam.subjects.reduce((sum, s) => sum + s.maxMarks, 0);

    for (const entry of entries) {
      const student = this.getStudentById(entry.studentId);
      if (!student) continue;

      // Validate marks
      for (const [subId, mark] of Object.entries(entry.marks)) {
        const sub = exam.subjects.find((s) => s.id === subId);
        if (!sub) continue;
        if (mark < 0 || mark > sub.maxMarks) {
          throw new Error(`Mark for subject ${sub.name} must be between 0 and ${sub.maxMarks}. Received: ${mark}`);
        }
      }

      const totalMarks = Object.values(entry.marks).reduce((acc, m) => acc + (Number(m) || 0), 0);
      const { percentage, grade, passFail } = calculateGradeAndResult(
        totalMarks,
        maxTotalMarks,
        entry.marks,
        exam.subjects
      );

      const existingIndex = this.data.marks.findIndex(
        (m) => m.examId === examId && m.studentId === entry.studentId
      );

      const markRecord: StudentMarksEntry = {
        id: existingIndex >= 0 ? this.data.marks[existingIndex].id : `mrk-${examId}-${entry.studentId}`,
        examId,
        studentId: student.id,
        admissionNo: student.admissionNo,
        studentName: student.fullName,
        rollNo: student.rollNo,
        className: student.className,
        division: student.division,
        marks: entry.marks,
        totalMarks,
        maxTotalMarks,
        percentage,
        grade,
        passFail,
        remarks: entry.remarks || '',
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        this.data.marks[existingIndex] = markRecord;
      } else {
        this.data.marks.push(markRecord);
      }
    }

    // Recalculate ranks for this exam
    const examMarks = this.data.marks.filter((m) => m.examId === examId);
    const ranked = calculateRanks(examMarks);

    for (const r of ranked) {
      const idx = this.data.marks.findIndex((m) => m.id === r.id);
      if (idx >= 0) {
        this.data.marks[idx] = r;
      }
    }

    this.persist();
    return this.getMarksForExam(examId);
  }

  public deleteMarksForStudent(examId: string, studentId: string): boolean {
    const initialLen = this.data.marks.length;
    this.data.marks = this.data.marks.filter(
      (m) => !(m.examId === examId && m.studentId === studentId)
    );

    if (this.data.marks.length !== initialLen) {
      // Recalculate ranks
      const examMarks = this.data.marks.filter((m) => m.examId === examId);
      const ranked = calculateRanks(examMarks);
      for (const r of ranked) {
        const idx = this.data.marks.findIndex((m) => m.id === r.id);
        if (idx >= 0) {
          this.data.marks[idx] = r;
        }
      }
      this.persist();
      return true;
    }
    return false;
  }

  // --- Settings ---
  public getSettings() {
    return { ...this.data.settings };
  }

  public updateSettings(updates: Partial<DatabaseSchema['settings']>) {
    Object.assign(this.data.settings, updates);
    this.persist();
    return { ...this.data.settings };
  }
}

export const db = new DatabaseEngine();
