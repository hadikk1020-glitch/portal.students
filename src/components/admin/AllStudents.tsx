import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Student } from '../../types';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  KeyRound
} from 'lucide-react';

export const AllStudents: React.FC = () => {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [sortBy, setSortBy] = useState('admissionNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [studentMarksHistory, setStudentMarksHistory] = useState<any[]>([]);
  const [loadingMarksHistory, setLoadingMarksHistory] = useState(false);

  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [resetPassAdmissionNo, setResetPassAdmissionNo] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [token, page, search, selectedClass, selectedDivision, sortBy, sortOrder]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        className: selectedClass,
        division: selectedDivision,
        sortBy,
        sortOrder,
      });

      const res = await fetch(`/api/admin/students?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        setTotal(data.total);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  const handleOpenView = async (std: Student) => {
    setViewStudent(std);
    setLoadingMarksHistory(true);
    try {
      const res = await fetch(`/api/admin/marks/ex-001`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const stdMarks = (data.marks || []).filter((m: any) => m.studentId === std.id);
        setStudentMarksHistory(stdMarks);
      }
    } catch {
      //
    } finally {
      setLoadingMarksHistory(false);
    }
  };

  const handleOpenEdit = (std: Student) => {
    setEditStudent(std);
    setEditForm({ ...std });
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    try {
      setEditLoading(true);
      setEditError(null);

      const res = await fetch(`/api/admin/students/${editStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || 'Failed to update student');
        setEditLoading(false);
        return;
      }

      setEditStudent(null);
      setEditLoading(false);
      fetchStudents();
    } catch (err: any) {
      setEditError(err.message || 'Error updating student');
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/admin/students/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setDeleteId(null);
        fetchStudents();
      }
    } catch {
      //
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResetPassword = async (admissionNo: string, stdId: string) => {
    try {
      const res = await fetch(`/api/admin/students/${stdId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: admissionNo }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccess(data.message || `Password for ${admissionNo} reset to ${admissionNo}`);
        setTimeout(() => setResetSuccess(null), 3000);
      }
    } catch {
      //
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const downloadCsv = () => {
    window.location.href = `/api/admin/export/students.csv`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.studentsListTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.studentsListSubtitle} ({total} enrolled students)
          </p>
        </div>

        <button
          onClick={downloadCsv}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{t.exportCsvBtn}</span>
        </button>
      </div>

      {resetSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          {resetSuccess}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Class Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-hidden"
            >
              <option value="All">{t.allClasses}</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>

          {/* Division Filter */}
          <select
            value={selectedDivision}
            onChange={(e) => {
              setSelectedDivision(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-hidden"
          >
            <option value="All">{t.allDivisions}</option>
            <option value="A">Division A</option>
            <option value="B">Division B</option>
            <option value="C">Division C</option>
            <option value="D">Division D</option>
          </select>
        </div>
      </div>

      {/* Student Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <th
                  onClick={() => handleSort('admissionNo')}
                  className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t.admissionNo}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('rollNo')}
                  className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t.rollNo}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('fullName')}
                  className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t.fullName}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">{t.fatherName}</th>
                <th className="py-3.5 px-4">{t.className}</th>
                <th className="py-3.5 px-4">{t.division}</th>
                <th className="py-3.5 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                    {t.loading}
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                    {t.noStudentsFound}
                  </td>
                </tr>
              ) : (
                students.map((std) => (
                  <tr
                    key={std.id}
                    className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {std.admissionNo}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-300">
                      {std.rollNo || '-'}
                    </td>
                    {/* STRICT RULE: No profile photos, avatars, or avatar placeholders */}
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                      {std.fullName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {std.fatherName || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {std.className}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {std.division}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* View Action */}
                        <button
                          onClick={() => handleOpenView(std)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                          title={t.view}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* Edit Action */}
                        <button
                          onClick={() => handleOpenEdit(std)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                          title={t.edit}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Reset Password to student admission number */}
                        <button
                          onClick={() => handleResetPassword(std.admissionNo, std.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                          title="Reset student password to Admission Number"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        {/* Delete Action */}
                        <button
                          onClick={() => setDeleteId(std.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
          <div>
            {t.showingPage} {page} {t.of} {totalPages} ({total} total)
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW STUDENT DETAILS MODAL */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Student Profile Record
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {viewStudent.fullName}
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Admission No: <strong className="text-slate-800 dark:text-slate-200">{viewStudent.admissionNo}</strong> · Roll: {viewStudent.rollNo}
                </div>
              </div>
              <button
                onClick={() => setViewStudent(null)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bio Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">{t.fatherName}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{viewStudent.fatherName || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">{t.motherName}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{viewStudent.motherName || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">{t.gender}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{viewStudent.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">{t.dob}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{viewStudent.dob || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">{t.className} & {t.division}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">{viewStudent.className} ({viewStudent.division})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">{t.academicYear}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{viewStudent.academicYear}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">{t.studentPhone}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{viewStudent.studentPhone || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">{t.parentPhone}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{viewStudent.parentPhone || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">{t.admissionDate}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{viewStudent.admissionDate}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-slate-400 block font-semibold">{t.address}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{viewStudent.address || '-'}</span>
              </div>
            </div>

            {/* Exam Marks Recorded */}
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                Recent Examination Performance
              </h3>
              {studentMarksHistory.length > 0 ? (
                <div className="space-y-2">
                  {studentMarksHistory.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white">First Term Examination 2025</div>
                        <div className="text-slate-500 mt-0.5">
                          Score: {m.totalMarks} / {m.maxTotalMarks} ({m.percentage}%)
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold mr-1">
                          Grade {m.grade}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-bold">
                          Rank #{m.rank || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No examination scores evaluated yet for this student.</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewStudent(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Update Student Record
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  Edit: {editStudent.fullName}
                </h2>
              </div>
              <button
                onClick={() => setEditStudent(null)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.fullName}
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName || ''}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.admissionNo}
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.admissionNo || ''}
                    onChange={(e) => setEditForm({ ...editForm, admissionNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.rollNo}
                  </label>
                  <input
                    type="text"
                    value={editForm.rollNo || ''}
                    onChange={(e) => setEditForm({ ...editForm, rollNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.fatherName}
                  </label>
                  <input
                    type="text"
                    value={editForm.fatherName || ''}
                    onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.className}
                  </label>
                  <select
                    value={editForm.className || 'Class 10'}
                    onChange={(e) => setEditForm({ ...editForm, className: e.target.value })}
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
                    value={editForm.division || 'A'}
                    onChange={(e) => setEditForm({ ...editForm, division: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="A">Division A</option>
                    <option value="B">Division B</option>
                    <option value="C">Division C</option>
                    <option value="D">Division D</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.studentPhone}
                  </label>
                  <input
                    type="tel"
                    value={editForm.studentPhone || ''}
                    onChange={(e) => setEditForm({ ...editForm, studentPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.parentPhone}
                  </label>
                  <input
                    type="tel"
                    value={editForm.parentPhone || ''}
                    onChange={(e) => setEditForm({ ...editForm, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.address}
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.address || ''}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-60"
                >
                  {editLoading ? t.loading : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {t.deleteStudentConfirmTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t.deleteStudentConfirmDesc}
              </p>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                {deleteLoading ? t.loading : t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
