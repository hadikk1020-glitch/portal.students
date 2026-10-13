import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AdminStats } from '../../types';
import {
  Users,
  Building2,
  CalendarDays,
  BookOpen,
  Award,
  UserPlus,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigate: (tab: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [token]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setError('Failed to load dashboard statistics');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Session 2025–2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome to HADI HADI Portal
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base mt-1 max-w-xl font-medium">
            Administrative command center for school enrollment, classes, exam evaluations, and academic reporting.
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('add-student')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addStudent}</span>
          </button>
          <button
            onClick={() => onNavigate('marks-entry')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 border border-white/20 text-white font-bold text-xs backdrop-blur-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.marksEntry}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Colourful Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Total Students (Blue/Cyan) */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.statTotalStudents}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {stats?.totalStudents || 0}
          </div>
          <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
            <span>Enrolled Students</span>
          </div>
        </div>

        {/* Total Classes (Purple/Indigo) */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.statTotalClasses}
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {stats?.totalClasses || 0}
          </div>
          <div className="mt-1 text-xs text-purple-600 dark:text-purple-400 font-semibold">
            <span>Class Divisions</span>
          </div>
        </div>

        {/* Total Exams (Amber/Orange) */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.statTotalExams}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {stats?.totalExams || 0}
          </div>
          <div className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
            <span>Evaluations Conducted</span>
          </div>
        </div>

        {/* Total Subjects (Emerald/Teal) */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.statTotalSubjects}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {stats?.totalSubjects || 6}
          </div>
          <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Curriculum Courses</span>
          </div>
        </div>

        {/* Overall Pass Rate (Rose/Crimson) */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.statPassRate}
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {stats?.overallPassRate || 100}%
          </div>
          <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Academic Performance</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recently Added Students & Recent Exam Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section 1: Recently Added Students */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {t.recentStudents}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest student admissions into school
              </p>
            </div>
            <button
              onClick={() => onNavigate('all-students')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>{t.viewAllStudents}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {stats?.recentlyAddedStudents && stats.recentlyAddedStudents.length > 0 ? (
              stats.recentlyAddedStudents.map((std) => (
                <div
                  key={std.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div>
                    {/* STRICT RULE: No profile photos, avatars, or avatar placeholders */}
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {std.fullName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{std.admissionNo}</span>
                      <span className="mx-1.5">·</span>
                      <span>Roll {std.rollNo}</span>
                      <span className="mx-1.5">·</span>
                      <span>{std.className} ({std.division})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                      {std.academicYear}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs font-semibold text-slate-400">
                {t.noRecentStudents}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Recent Exam Results */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {t.recentExams}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluation results and pass percentages
              </p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>{t.resultsAndReports}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {stats?.recentExams && stats.recentExams.length > 0 ? (
              stats.recentExams.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {ex.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{ex.className} ({ex.division})</span>
                      <span className="mx-1.5">·</span>
                      <span>Evaluated: {ex.totalStudentsEvaluated}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Pass: {ex.passPercentage}%
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Top: {ex.highestPercentage}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs font-semibold text-slate-400">
                {t.noRecentExams}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
