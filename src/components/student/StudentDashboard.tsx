import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Student, Exam, StudentMarksEntry } from '../../types';
import { PrintableMarkSheet } from './PrintableMarkSheet';
import {
  GraduationCap,
  Award,
  BookOpen,
  CalendarDays,
  Printer,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  School,
  TrendingUp,
  X,
  RotateCcw
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const { t } = useLanguage();

  const [student, setStudent] = useState<Student | null>(null);
  const [resultsHistory, setResultsHistory] = useState<Array<{ markEntry: StudentMarksEntry; exam: Exam }>>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Marksheet Modal
  const [showMarkSheetModal, setShowMarkSheetModal] = useState(false);

  // Change Password Modal
  const [showPassModal, setShowPassModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentData();
  }, [token]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/student/results', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
        setResultsHistory(data.results || []);
      } else {
        setError('Failed to load student academic records');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    try {
      setPassLoading(true);
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPassError(data.error || 'Failed to update password');
        setPassLoading(false);
        return;
      }

      setPassSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPassLoading(false);
      setTimeout(() => setShowPassModal(false), 1500);
    } catch (err: any) {
      setPassError(err.message || 'Error updating password');
      setPassLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">{t.loading}</p>
        </div>
      </div>
    );
  }

  const activeResult = resultsHistory[selectedResultIndex];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner (STRICT RULE: No profile photos, avatars, or avatar placeholders) */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold tracking-wide uppercase mb-3">
            <School className="w-3.5 h-3.5" />
            <span>Student Academic Portal · {student?.academicYear}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {student?.fullName}
          </h1>
          <p className="text-indigo-100 text-sm mt-1 font-medium">
            Admission No: <span className="font-mono font-bold text-white">{student?.admissionNo}</span> · Roll No: <span className="font-bold text-white">{student?.rollNo}</span> · Class: <span className="font-bold text-white">{student?.className} ({student?.division})</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchStudentData}
            title="Refresh latest updates from school database"
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Sync Updates</span>
          </button>

          {activeResult && (
            <button
              onClick={() => setShowMarkSheetModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printMarkSheet}</span>
            </button>
          )}

          <button
            onClick={() => setShowPassModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 border border-white/20 text-white font-bold text-xs backdrop-blur-xs transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>{t.changeStudentPassword}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STUDENT BIO CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <UserCheck className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t.studentBioCard}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block font-semibold">{t.fatherName}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{student?.fatherName || '-'}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block font-semibold">{t.motherName}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{student?.motherName || '-'}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block font-semibold">{t.dob}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{student?.dob || '-'}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block font-semibold">{t.gender}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{student?.gender}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block font-semibold">{t.className} & {t.division}</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">{student?.className} - {student?.division}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block font-semibold">{t.academicYear}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{student?.academicYear}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block font-semibold">{t.parentPhone}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{student?.parentPhone || '-'}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block font-semibold">{t.admissionDate}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{student?.admissionDate}</span>
          </div>
        </div>
      </div>

      {/* EXAM HISTORY & RESULTS SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {t.examHistoryTab}
            </h2>
          </div>

          {/* Exam Selector tabs if multiple */}
          {resultsHistory.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {resultsHistory.map((item, idx) => (
                <button
                  key={item.markEntry.id}
                  onClick={() => setSelectedResultIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedResultIndex === idx
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {item.exam?.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeResult ? (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {t.totalMarks}
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {activeResult.markEntry.totalMarks} / {activeResult.markEntry.maxTotalMarks}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {t.percentage}
                </span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                  {activeResult.markEntry.percentage}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {t.grade}
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {activeResult.markEntry.grade}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {t.result}
                </span>
                <span className={`text-2xl font-black mt-1 block ${
                  activeResult.markEntry.passFail === 'PASS' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {activeResult.markEntry.passFail}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center col-span-2 sm:col-span-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {t.rank}
                </span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">
                  {activeResult.markEntry.rank ? `#${activeResult.markEntry.rank}` : 'Passed'}
                </span>
              </div>
            </div>

            {/* Subject-Wise Marks Breakdown Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {t.marksBreakdown} · {activeResult.exam?.name}
                </h3>
                <button
                  onClick={() => setShowMarkSheetModal(true)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.viewMarkSheet}</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      <th className="py-3 px-4">{t.subjectName}</th>
                      <th className="py-3 px-4 text-center">{t.maximumMarks}</th>
                      <th className="py-3 px-4 text-center">{t.passMarks}</th>
                      <th className="py-3 px-4 text-center">{t.marksObtained}</th>
                      <th className="py-3 px-4 text-center">{t.grade}</th>
                      <th className="py-3 px-4 text-center">{t.result}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {activeResult.exam?.subjects.map((sub) => {
                      const mark = activeResult.markEntry.marks[sub.id] ?? 0;
                      const passed = mark >= sub.passMarks;
                      const subPct = Math.round((mark / sub.maxMarks) * 100);
                      let subGrade = 'F';
                      if (subPct >= 90) subGrade = 'A+';
                      else if (subPct >= 80) subGrade = 'A';
                      else if (subPct >= 70) subGrade = 'B+';
                      else if (subPct >= 60) subGrade = 'B';
                      else if (subPct >= 50) subGrade = 'C+';
                      else if (subPct >= 40) subGrade = 'C';
                      else if (subPct >= 35) subGrade = 'D';

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {sub.name}
                          </td>
                          <td className="py-3 px-4 text-center text-slate-500 font-semibold">{sub.maxMarks}</td>
                          <td className="py-3 px-4 text-center text-slate-500 font-semibold">{sub.passMarks}</td>
                          <td className="py-3 px-4 text-center font-black text-indigo-600 dark:text-indigo-400 text-sm">
                            {mark}
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                              {subGrade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-extrabold">
                            {passed ? (
                              <span className="text-emerald-600 dark:text-emerald-400">PASS</span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400">FAIL</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 font-semibold text-xs">
            No examination marks have been published for your profile yet.
          </div>
        )}
      </div>

      {/* PRINTABLE MARK SHEET MODAL */}
      {showMarkSheetModal && student && activeResult && (
        <PrintableMarkSheet
          student={student}
          exam={activeResult.exam}
          markEntry={activeResult.markEntry}
          onClose={() => setShowMarkSheetModal(false)}
        />
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {t.changeStudentPassword}
                </h3>
                <p className="text-xs text-slate-500">
                  Update your password (default is your Admission Number)
                </p>
              </div>
              <button
                onClick={() => setShowPassModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {passError}
              </div>
            )}

            {passSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                {passSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.currentPassword} *
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password (Admission Number)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.newPassword} *
                </label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new secure password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.confirmNewPassword} *
                </label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPassModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-60"
                >
                  {passLoading ? t.loading : t.updatePasswordBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
