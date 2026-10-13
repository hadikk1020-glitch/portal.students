export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  studentId?: string;
  studentProfile?: Student;
}

export interface Student {
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

export interface Exam {
  id: string;
  name: string;
  academicYear: string;
  className: string;
  division: string;
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
  marks: Record<string, number>;
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  grade: string;
  passFail: 'PASS' | 'FAIL';
  rank?: number;
  remarks?: string;
  updatedAt: string;
}

export interface ClassDivision {
  id: string;
  name: string;
  division: string;
  classTeacher: string;
  academicYear: string;
  studentCount?: number;
}

export interface AdminStats {
  totalStudents: number;
  totalClasses: number;
  totalExams: number;
  totalSubjects: number;
  overallPassRate: number;
  recentlyAddedStudents: Student[];
  recentExams: Array<{
    id: string;
    name: string;
    className: string;
    division: string;
    examDate: string;
    totalStudentsEvaluated: number;
    passPercentage: number;
    highestPercentage: number;
  }>;
}

export interface SchoolSettings {
  schoolName: string;
  schoolTagline: string;
  schoolAddress: string;
  schoolCode: string;
  currentAcademicYear: string;
}
