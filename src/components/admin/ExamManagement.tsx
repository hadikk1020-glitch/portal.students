import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Exam, SubjectConfig } from '../../types';
import {
  CalendarDays,
  Plus,
  Trash2,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X
} from 'lucide-react';

interface ExamManagementProps {
  onGoToMarksEntry: (examId: string) => void;
}

export const ExamManagement: React.FC<ExamManagementProps> = ({ onGoToMarksEntry }) => {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Exam Form
  const [examName, setExamName] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [className, setClassName] = useState('Class 10');
  const [division, setDivision] = useState('A');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [subjects, setSubjects] = useState<SubjectConfig[]>([
    { id: 'sub-eng', name: 'English', maxMarks: 100, passMarks: 40 },
    { id: 'sub-math', name: 'Mathematics', maxMarks: 100, passMarks: 40 },
    { id: 'sub-sci', name: 'Science', maxMarks: 100, passMarks: 40 },
    { id: 'sub-soc', name: 'Social Studies', maxMarks: 100, passMarks: 40 },
    { id: 'sub-mal', name: 'Malayalam / Second Lang', maxMarks: 100, passMarks: 40 },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExams();
  }, [token]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/exams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExams(data);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubjectRow = () => {
    const newId = `sub-custom-${Date.now()}`;
    setSubjects([...subjects, { id: newId, name: '', maxMarks: 100, passMarks: 40 }]);
  };

  const handleRemoveSubjectRow = (index: number) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleSubjectChange = (index: number, field: keyof SubjectConfig, value: any) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], [field]: value };
    setSubjects(updated);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || subjects.length === 0) {
      setError('Please provide an exam name and at least one valid subject.');
      return;
    }

    // Verify valid subject names
    const invalidSub = subjects.some((s) => !s.name.trim() || s.maxMarks <= 0);
    if (invalidSub) {
      setError('All subjects must have a valid name and max marks > 0.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: examName.trim(),
          academicYear,
          className,
          division,
          examDate,
          subjects,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create exam');
        setSubmitting(false);
        return;
      }

      setShowCreateModal(false);
      setExamName('');
      setSubmitting(false);
      fetchExams();
    } catch (err: any) {
      setError(err.message || 'Error occurred');
      setSubmitting(false);
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this examination and all its recorded marks?')) return;
    try {
      await fetch(`/api/admin/exams/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchExams();
    } catch {
      //
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.examManagementTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.examManagementSubtitle}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.createExamBtn}</span>
        </button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-semibold text-xs">
            {t.loading}
          </div>
        ) : exams.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-semibold text-xs">
            No examinations configured yet.
          </div>
        ) : (
          exams.map((ex) => (
            <div
              key={ex.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-400 dark:hover:border-purple-600 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                    {ex.academicYear}
                  </span>
                  <button
                    onClick={() => handleDeleteExam(ex.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Exam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {ex.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Standard: <strong className="text-slate-800 dark:text-slate-200">{ex.className} ({ex.division})</strong>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Conducted: {ex.examDate}
                  </p>
                </div>

                {/* Subjects Pill List */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Configured Subjects ({ex.subjects.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ex.subjects.map((sub) => (
                      <span
                        key={sub.id}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                      >
                        {sub.name} ({sub.maxMarks})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onGoToMarksEntry(ex.id)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{t.marksEntry}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE EXAM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {t.createExamBtn}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set exam parameters, syllabus subjects, and passing threshold.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.examName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. First Term Examination 2025"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.className} *
                  </label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.division}
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="All">All Divisions</option>
                    <option value="A">Division A</option>
                    <option value="B">Division B</option>
                    <option value="C">Division C</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.academicYear}
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.examDate}
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              {/* Subjects Builder */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    {t.subjectsConfig}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSubjectRow}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    {t.addSubjectRow}
                  </button>
                </div>

                <div className="space-y-2">
                  {subjects.map((sub, idx) => (
                    <div key={sub.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Subject Name (e.g. Mathematics)"
                        value={sub.name}
                        onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                      <input
                        type="number"
                        min="1"
                        max="500"
                        title="Max Marks"
                        placeholder="Max Marks"
                        value={sub.maxMarks}
                        onChange={(e) => handleSubjectChange(idx, 'maxMarks', parseInt(e.target.value, 10) || 100)}
                        className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                      <input
                        type="number"
                        min="1"
                        max={sub.maxMarks}
                        title="Pass Marks"
                        placeholder="Pass Marks"
                        value={sub.passMarks}
                        onChange={(e) => handleSubjectChange(idx, 'passMarks', parseInt(e.target.value, 10) || 40)}
                        className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSubjectRow(idx)}
                        disabled={subjects.length <= 1}
                        className="p-2 text-rose-500 hover:text-rose-700 disabled:opacity-30 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-60"
                >
                  {submitting ? t.loading : t.saveExamBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
