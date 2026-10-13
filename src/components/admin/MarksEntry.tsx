import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Exam, Student, StudentMarksEntry } from '../../types';
import {
  FileSpreadsheet,
  Save,
  CheckCircle2,
  AlertCircle,
  Award,
  Trash2,
  RotateCcw
} from 'lucide-react';

interface MarksEntryProps {
  initialExamId?: string;
}

export const MarksEntry: React.FC<MarksEntryProps> = ({ initialExamId }) => {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(initialExamId || '');
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [marksRecords, setMarksRecords] = useState<StudentMarksEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Local grid marks state: studentId -> { subjectId -> mark }
  const [gridMarks, setGridMarks] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    fetchExamsList();
  }, [token]);

  useEffect(() => {
    if (selectedExamId) {
      loadExamEvaluationSheet(selectedExamId);
    }
  }, [selectedExamId]);

  const fetchExamsList = async () => {
    try {
      const res = await fetch('/api/admin/exams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExams(data);
        if (!selectedExamId && data.length > 0) {
          setSelectedExamId(data[0].id);
        }
      }
    } catch {
      //
    }
  };

  const loadExamEvaluationSheet = async (examId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const res = await fetch(`/api/admin/marks/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentExam(data.exam);
        setStudents(data.eligibleStudents || []);
        setMarksRecords(data.marks || []);

        // Initialize grid state from existing marks or defaults
        const initialMap: Record<string, Record<string, number>> = {};
        for (const std of data.eligibleStudents || []) {
          const existing = (data.marks || []).find((m: StudentMarksEntry) => m.studentId === std.id);
          initialMap[std.id] = {};
          for (const sub of data.exam.subjects) {
            initialMap[std.id][sub.id] = existing && existing.marks[sub.id] !== undefined ? existing.marks[sub.id] : 0;
          }
        }
        setGridMarks(initialMap);
      } else {
        setError('Failed to load examination evaluation sheet.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading marks');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, subjectId: string, val: string, maxMarks: number) => {
    const num = val === '' ? 0 : parseInt(val, 10);
    if (isNaN(num)) return;

    if (num < 0 || num > maxMarks) {
      setError(`Mark cannot exceed maximum marks (${maxMarks}) or be negative.`);
    } else {
      setError(null);
    }

    setGridMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectId]: num,
      },
    }));
  };

  // Live calculation for preview
  const computeStudentStats = (studentId: string) => {
    if (!currentExam) return { total: 0, maxTotal: 0, percentage: 0, grade: 'F', pass: false };

    const studentSubjectMarks = gridMarks[studentId] || {};
    let total = 0;
    let maxTotal = 0;
    let failedAny = false;

    for (const sub of currentExam.subjects) {
      const mark = studentSubjectMarks[sub.id] ?? 0;
      total += mark;
      maxTotal += sub.maxMarks;
      if (mark < sub.passMarks) {
        failedAny = true;
      }
    }

    const percentage = maxTotal > 0 ? Math.round((total / maxTotal) * 1000) / 10 : 0;

    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C+';
    else if (percentage >= 40) grade = 'C';
    else if (percentage >= 35) grade = 'D';
    else grade = 'F';

    const pass = !failedAny && percentage >= 35;

    return { total, maxTotal, percentage, grade, pass };
  };

  const handleSaveAllMarks = async () => {
    if (!currentExam) return;

    // Validate that no mark exceeds its subject maxMarks
    for (const std of students) {
      for (const sub of currentExam.subjects) {
        const mark = gridMarks[std.id]?.[sub.id] ?? 0;
        if (mark < 0 || mark > sub.maxMarks) {
          setError(`Invalid mark (${mark}) for student ${std.fullName} in ${sub.name}. Max is ${sub.maxMarks}.`);
          return;
        }
      }
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const entries = students.map((std) => ({
        studentId: std.id,
        marks: gridMarks[std.id] || {},
      }));

      const res = await fetch(`/api/admin/marks/${currentExam.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ entries }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save marks');
        setSaving(false);
        return;
      }

      setSuccess(t.marksSavedSuccess);
      setMarksRecords(data.marks);
      setSaving(false);

      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving marks');
      setSaving(false);
    }
  };

  const handleDeleteStudentRecord = async (studentId: string) => {
    if (!currentExam) return;
    if (!confirm('Are you sure you want to remove marks for this student?')) return;

    try {
      const res = await fetch(`/api/admin/marks/${currentExam.id}/${studentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadExamEvaluationSheet(currentExam.id);
      }
    } catch {
      //
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.marksEntryTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.marksEntrySubtitle}
          </p>
        </div>

        {/* Exam Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
            {t.selectExam}:
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.className} - {ex.division})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Evaluation Table */}
      {currentExam && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {currentExam.name}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Target Standard: <strong className="text-slate-800 dark:text-slate-200">{currentExam.className} ({currentExam.division})</strong> · Academic Year: {currentExam.academicYear}
              </div>
            </div>

            <button
              onClick={handleSaveAllMarks}
              disabled={saving || students.length === 0}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? t.loading : t.saveMarksBtn}</span>
            </button>
          </div>

          <div className="overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-4">{t.admissionNo}</th>
                  <th className="py-3 px-4">{t.fullName}</th>
                  <th className="py-3 px-4">{t.rollNo}</th>
                  {/* Subject Columns */}
                  {currentExam.subjects.map((sub) => (
                    <th key={sub.id} className="py-3 px-3 text-center min-w-[100px]">
                      <div>{sub.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium lowercase">
                        (max: {sub.maxMarks} / pass: {sub.passMarks})
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center">{t.totalMarks}</th>
                  <th className="py-3 px-4 text-center">{t.percentage}</th>
                  <th className="py-3 px-4 text-center">{t.grade}</th>
                  <th className="py-3 px-4 text-center">{t.result}</th>
                  <th className="py-3 px-4 text-center">{t.rank}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7 + currentExam.subjects.length} className="py-12 text-center text-slate-400 font-semibold">
                      {t.loading}
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7 + currentExam.subjects.length} className="py-12 text-center text-slate-400 font-semibold">
                      No enrolled students found for {currentExam.className} ({currentExam.division}). Please enrol students in this standard first.
                    </td>
                  </tr>
                ) : (
                  students.map((std) => {
                    const stats = computeStudentStats(std.id);
                    const savedEntry = marksRecords.find((m) => m.studentId === std.id);

                    return (
                      <tr
                        key={std.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                          {std.admissionNo}
                        </td>
                        {/* STRICT RULE: No profile photos, avatars, or avatar placeholders */}
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {std.fullName}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-semibold">
                          {std.rollNo || '-'}
                        </td>

                        {/* Subject Marks Inputs */}
                        {currentExam.subjects.map((sub) => {
                          const currentVal = gridMarks[std.id]?.[sub.id] ?? 0;
                          const isInvalid = currentVal < 0 || currentVal > sub.maxMarks;
                          const isFailed = currentVal < sub.passMarks;

                          return (
                            <td key={sub.id} className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                min="0"
                                max={sub.maxMarks}
                                value={currentVal}
                                onChange={(e) =>
                                  handleMarkChange(std.id, sub.id, e.target.value, sub.maxMarks)
                                }
                                className={`w-20 text-center py-1.5 px-2 rounded-xl border text-xs font-bold transition-all focus:outline-hidden focus:ring-2 ${
                                  isInvalid
                                    ? 'border-rose-500 bg-rose-50 text-rose-700 ring-rose-500'
                                    : isFailed
                                    ? 'border-amber-300 bg-amber-50/50 text-amber-800 focus:ring-amber-500'
                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-indigo-500'
                                }`}
                              />
                            </td>
                          );
                        })}

                        {/* Total Marks */}
                        <td className="py-3 px-4 text-center font-extrabold text-slate-900 dark:text-white">
                          {stats.total} / {stats.maxTotal}
                        </td>

                        {/* Percentage */}
                        <td className="py-3 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                          {stats.percentage}%
                        </td>

                        {/* Grade */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                              stats.grade === 'A+' || stats.grade === 'A'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : stats.grade === 'B+' || stats.grade === 'B'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : stats.grade === 'C+' || stats.grade === 'C'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : stats.grade === 'D'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {stats.grade}
                          </span>
                        </td>

                        {/* Pass / Fail */}
                        <td className="py-3 px-4 text-center font-extrabold">
                          {stats.pass ? (
                            <span className="text-emerald-600 dark:text-emerald-400">PASS</span>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400">FAIL</span>
                          )}
                        </td>

                        {/* Rank */}
                        <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                          {savedEntry?.rank ? `#${savedEntry.rank}` : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
