import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ClassDivision } from '../../types';
import {
  Building2,
  Plus,
  Users,
  Trash2,
  CheckCircle2,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export const ClassesDivisions: React.FC = () => {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [classes, setClasses] = useState<ClassDivision[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('Class 10');
  const [division, setDivision] = useState('A');
  const [classTeacher, setClassTeacher] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, [token]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !division) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, division, classTeacher, academicYear }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'Failed to add class');
        setSubmitting(false);
        return;
      }

      setShowAddModal(false);
      setName('Class 10');
      setDivision('A');
      setClassTeacher('');
      setSubmitting(false);
      fetchClasses();
    } catch (err: any) {
      setError(err.message || 'Error occurred');
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class division?')) return;
    try {
      await fetch(`/api/admin/classes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClasses();
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
            {t.classesTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.classesSubtitle}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addClassBtn}</span>
        </button>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-semibold text-xs">
            {t.loading}
          </div>
        ) : classes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-semibold text-xs">
            No classes defined yet.
          </div>
        ) : (
          classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg">
                    {cls.division}
                  </div>
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {cls.name} - Division {cls.division}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Academic Year: <span className="font-semibold text-slate-700 dark:text-slate-300">{cls.academicYear}</span>
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Class Teacher:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {cls.classTeacher || 'Not Assigned'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">{t.enrolledStudents}:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>{cls.studentCount ?? 0}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {t.addClassBtn}
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleAddClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.classNameLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Class 10"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.divisionLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={division}
                  onChange={(e) => setDivision(e.target.value.toUpperCase())}
                  placeholder="e.g. A, B, C"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.classTeacherLabel}
                </label>
                <input
                  type="text"
                  value={classTeacher}
                  onChange={(e) => setClassTeacher(e.target.value)}
                  placeholder="e.g. Mr. Abdul Rahman"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.academicYear}
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2025-2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-60"
                >
                  {submitting ? t.loading : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
