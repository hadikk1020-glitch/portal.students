import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldAlert, 
  GraduationCap, 
  KeyRound, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  BookOpen, 
  Award, 
  FileCheck2 
} from 'lucide-react';

export const HomeLogin: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();

  // Admin form state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Student form state
  const [studentAdmissionNo, setStudentAdmissionNo] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);
    const result = await login(adminUsername, adminPassword);
    setAdminLoading(false);
    if (!result.success) {
      setAdminError(result.error || 'Failed to authenticate administrator');
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError(null);
    setStudentLoading(true);
    const result = await login(studentAdmissionNo, studentPassword);
    setStudentLoading(false);
    if (!result.success) {
      setStudentError(result.error || 'Failed to authenticate student');
    }
  };

  const autofillAdmin = () => {
    setAdminUsername('admin');
    setAdminPassword('admin123');
    setAdminError(null);
  };

  const autofillStudent = (username = 'Muhammad Hadi', admissionNo = 'HADI-2025-001') => {
    setStudentAdmissionNo(username);
    setStudentPassword(admissionNo);
    setStudentError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-indigo-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      {/* Hero Header */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wide mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>HADI HADI Academy Academic Portal 2025–2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {t.portalTitle}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
          {t.homeHeroSubtitle}
        </p>
      </div>

      {/* Two Large Distinct Login Cards */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* CARD 1: ADMIN LOGIN */}
        <div className="relative group bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-indigo-100 dark:border-indigo-900/60 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 flex flex-col justify-between">
          {/* Subtle Top Gradient Accent */}
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-t-3xl" />

          <div>
            {/* Header Badge & Title */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Lock className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Staff & Admin
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {t.adminLoginTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
              {t.adminLoginDesc}
            </p>

            {/* Error Message */}
            {adminError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            {/* Admin Form */}
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder={t.usernamePlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={adminLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 active:scale-[0.99] transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {adminLoading ? (
                  <span>{t.loading}</span>
                ) : (
                  <>
                    <span>{t.loginAsAdmin}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick autofill helper for Admin */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t.demoAdminCredentials}
            </span>
            <button
              type="button"
              onClick={autofillAdmin}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-2 cursor-pointer"
            >
              {t.quickFill}
            </button>
          </div>
        </div>

        {/* CARD 2: STUDENT LOGIN */}
        <div className="relative group bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-cyan-100 dark:border-cyan-900/60 hover:border-cyan-400 dark:hover:border-cyan-600 transition-all duration-300 flex flex-col justify-between">
          {/* Subtle Top Gradient Accent */}
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 rounded-t-3xl" />

          <div>
            {/* Header Badge & Title */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                Students
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {t.studentLoginTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
              {t.studentLoginDesc}
            </p>

            {/* Error Message */}
            {studentError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{studentError}</span>
              </div>
            )}

            {/* Student Form */}
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {t.studentUsernameLabel || "Student Full Name"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={studentAdmissionNo}
                    onChange={(e) => setStudentAdmissionNo(e.target.value)}
                    placeholder={t.admissionNoPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {t.studentPasswordLabel || "Admission Number"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder={t.studentPasswordPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-medium uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={studentLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 active:scale-[0.99] transition-all shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {studentLoading ? (
                  <span>{t.loading}</span>
                ) : (
                  <>
                    <span>{t.loginAsStudent}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick autofill helper for Student */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t.demoStudentCredentials}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => autofillStudent('Muhammad Hadi', 'HADI-2025-001')}
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 underline underline-offset-2 cursor-pointer"
              >
                {t.quickFill}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Feature Highlights Banner */}
      <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xs">
          <BookOpen className="w-5 h-5 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Admissions & Roster</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Complete student profile records with class & division management</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xs">
          <Award className="w-5 h-5 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Automated Grading</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Automatic computation of grades, percentages, pass/fail & class ranks</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xs">
          <FileCheck2 className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Printable Mark Sheets</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Official certificate formats with school seal & signature lines</p>
        </div>
      </div>
    </div>
  );
};
