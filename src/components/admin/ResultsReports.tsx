import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Exam, StudentMarksEntry } from '../../types';
import {
  BarChart3,
  Award,
  Download,
  Printer,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';

export const ResultsReports: React.FC = () => {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, [token]);

  useEffect(() => {
    if (selectedExamId) {
      loadReport(selectedExamId);
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/admin/exams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExams(data);
        if (data.length > 0) {
          setSelectedExamId(data[0].id);
        }
      }
    } catch {
      //
    }
  };

  const loadReport = async (examId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/reports/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!selectedExamId) return;
    window.location.href = `/api/admin/export/marks.csv?examId=${selectedExamId}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.reportsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.reportsSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-hidden"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.className} - {ex.division})
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportCsvBtn}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printReportBtn}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 font-semibold text-xs">
          {t.loading}
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Printable Report Header */}
          <div className="hidden print:block text-center border-b pb-4 mb-6">
            <h1 className="text-2xl font-black">HADI HADI ACADEMY & HIGHER SECONDARY SCHOOL</h1>
            <p className="text-sm">CONSOLIDATED EXAMINATION EVALUATION REPORT</p>
            <p className="text-xs text-gray-600 mt-1">
              Examination: {reportData.exam?.name} | Standard: {reportData.exam?.className} ({reportData.exam?.division}) | Academic Year: {reportData.exam?.academicYear}
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 no-print">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Evaluated
              </span>
              <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {reportData.totalStudents}
              </div>
              <span className="text-xs text-slate-500 font-medium">Students enrolled</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Passed Students
              </span>
              <div className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {reportData.passedStudents}
              </div>
              <span className="text-xs text-emerald-600 font-semibold">Cleared passing threshold</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Needs Improvement
              </span>
              <div className="mt-2 text-3xl font-black text-rose-600 dark:text-rose-400">
                {reportData.failedStudents}
              </div>
              <span className="text-xs text-rose-500 font-semibold">Below 35% or failed subject</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.classPassRate}
              </span>
              <div className="mt-2 text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {reportData.passRate}%
              </div>
              <span className="text-xs text-indigo-500 font-semibold">Cumulative Success Rate</span>
            </div>
          </div>

          {/* Top Rankers Podium */}
          {reportData.toppers && reportData.toppers.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {t.toppersList}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {reportData.toppers.map((top: StudentMarksEntry, idx: number) => (
                  <div
                    key={top.id}
                    className={`p-4 rounded-2xl border ${
                      idx === 0
                        ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500 text-white">
                        Rank #{top.rank}
                      </span>
                      <span className="text-xs font-bold text-slate-500">{top.admissionNo}</span>
                    </div>
                    {/* STRICT RULE: No profile photos, avatars, or avatar placeholders */}
                    <div className="mt-3 font-black text-base text-slate-900 dark:text-white">
                      {top.studentName}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Total: <strong className="text-slate-800 dark:text-slate-200">{top.totalMarks}</strong> / {top.maxTotalMarks} ({top.percentage}%)
                    </div>
                    <div className="mt-2">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                        Grade {top.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consolidated Student Mark Sheet Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Consolidated Student Results
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    <th className="py-3 px-4">{t.rank}</th>
                    <th className="py-3 px-4">{t.admissionNo}</th>
                    <th className="py-3 px-4">{t.fullName}</th>
                    <th className="py-3 px-4">{t.rollNo}</th>
                    {reportData.exam?.subjects.map((sub: any) => (
                      <th key={sub.id} className="py-3 px-3 text-center">{sub.name}</th>
                    ))}
                    <th className="py-3 px-4 text-center">{t.totalMarks}</th>
                    <th className="py-3 px-4 text-center">{t.percentage}</th>
                    <th className="py-3 px-4 text-center">{t.grade}</th>
                    <th className="py-3 px-4 text-center">{t.result}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {reportData.marks && reportData.marks.length > 0 ? (
                    reportData.marks.map((m: StudentMarksEntry) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-black text-indigo-600">
                          {m.rank ? `#${m.rank}` : '-'}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-600 dark:text-slate-400">
                          {m.admissionNo}
                        </td>
                        {/* STRICT RULE: No profile photos, avatars, or avatar placeholders */}
                        <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                          {m.studentName}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-500">{m.rollNo}</td>
                        {reportData.exam?.subjects.map((sub: any) => (
                          <td key={sub.id} className="py-3 px-3 text-center font-bold">
                            {m.marks[sub.id] ?? '-'}
                          </td>
                        ))}
                        <td className="py-3 px-4 text-center font-black">
                          {m.totalMarks} / {m.maxTotalMarks}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-indigo-600">
                          {m.percentage}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-slate-100 dark:bg-slate-800">
                            {m.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-extrabold">
                          {m.passFail === 'PASS' ? (
                            <span className="text-emerald-600">PASS</span>
                          ) : (
                            <span className="text-rose-600">FAIL</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        No evaluated marks found for this exam.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
