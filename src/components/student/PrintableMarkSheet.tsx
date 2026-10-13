import React from 'react';
import { Student, Exam, StudentMarksEntry, SchoolSettings } from '../../types';
import { Printer, X, Award, ShieldCheck, GraduationCap } from 'lucide-react';

interface PrintableMarkSheetProps {
  student: Student;
  exam: Exam;
  markEntry: StudentMarksEntry;
  schoolSettings?: SchoolSettings;
  onClose: () => void;
}

export const PrintableMarkSheet: React.FC<PrintableMarkSheetProps> = ({
  student,
  exam,
  markEntry,
  schoolSettings,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const school = schoolSettings || {
    schoolName: 'HADI HADI ACADEMY & HIGHER SECONDARY SCHOOL',
    schoolTagline: 'Empowering Minds, Inspiring Excellence',
    schoolAddress: 'Knowledge City, Wayanad Road, Calicut, Kerala 673571',
    schoolCode: 'KL-CC-2025',
    currentAcademicYear: '2025-2026',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl max-w-4xl w-full p-4 sm:p-8 shadow-2xl relative my-6">
        {/* Floating Print Controls - Hidden during print */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span className="font-extrabold text-sm text-slate-800">
              Official Examination Mark Sheet
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Mark Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL CERTIFICATE CONTAINER */}
        <div className="printable-area border-4 border-double border-indigo-950 p-6 sm:p-8 bg-white relative">
          
          {/* Watermark Emblem Graphic */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <GraduationCap className="w-96 h-96 text-indigo-900" />
          </div>

          {/* School Header */}
          <div className="text-center border-b-2 border-indigo-900 pb-5 mb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-950 text-white mb-2 shadow-xs">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-indigo-950 uppercase">
              {school.schoolName}
            </h1>
            <p className="text-xs text-indigo-800 font-semibold italic mt-0.5">
              {school.schoolTagline}
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              {school.schoolAddress} · Affiliation Code: {school.schoolCode}
            </p>

            <div className="mt-3 inline-block px-4 py-1 rounded-full bg-indigo-50 border border-indigo-200">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-950">
                Official Statement of Marks · {exam.name}
              </span>
            </div>
          </div>

          {/* Student Profile Info (STRICT RULE: No photo or avatar placeholder) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-5">
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Candidate Name</span>
              <strong className="text-slate-900 block text-sm font-extrabold">{student.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Admission Number</span>
              <strong className="text-indigo-900 block font-mono font-bold">{student.admissionNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Roll Number</span>
              <strong className="text-slate-900 block font-bold">{student.rollNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Class & Division</span>
              <strong className="text-slate-900 block font-bold">{student.className} - {student.division}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Father's Name</span>
              <span className="text-slate-900 block font-medium">{student.fatherName || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Mother's Name</span>
              <span className="text-slate-900 block font-medium">{student.motherName || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Date of Birth</span>
              <span className="text-slate-900 block font-medium">{student.dob || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Academic Year</span>
              <span className="text-slate-900 block font-bold">{student.academicYear}</span>
            </div>
          </div>

          {/* Subject-Wise Marks Table */}
          <div className="mb-5 overflow-hidden border border-slate-300 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-indigo-950 text-white font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Subject Name</th>
                  <th className="py-2.5 px-3 text-center">Maximum Marks</th>
                  <th className="py-2.5 px-3 text-center">Passing Marks</th>
                  <th className="py-2.5 px-3 text-center">Marks Obtained</th>
                  <th className="py-2.5 px-3 text-center">Subject Grade</th>
                  <th className="py-2.5 px-3 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {exam.subjects.map((sub) => {
                  const mark = markEntry.marks[sub.id] ?? 0;
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
                    <tr key={sub.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{sub.name}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-slate-600">{sub.maxMarks}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-slate-600">{sub.passMarks}</td>
                      <td className="py-2.5 px-3 text-center font-black text-indigo-950">{mark}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{subGrade}</td>
                      <td className="py-2.5 px-3 text-center font-extrabold">
                        {passed ? (
                          <span className="text-emerald-700">PASS</span>
                        ) : (
                          <span className="text-rose-700">FAIL</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* Grand Total Row */}
                <tr className="bg-slate-100 font-extrabold border-t-2 border-slate-300">
                  <td className="py-3 px-3 uppercase text-slate-900">Grand Total</td>
                  <td className="py-3 px-3 text-center text-slate-900">{markEntry.maxTotalMarks}</td>
                  <td className="py-3 px-3 text-center text-slate-600">-</td>
                  <td className="py-3 px-3 text-center text-indigo-950 font-black text-sm">{markEntry.totalMarks}</td>
                  <td className="py-3 px-3 text-center text-indigo-950 font-black text-sm">{markEntry.grade}</td>
                  <td className="py-3 px-3 text-center font-black">
                    {markEntry.passFail === 'PASS' ? (
                      <span className="text-emerald-700">PASSED</span>
                    ) : (
                      <span className="text-rose-700">FAILED</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Performance Summary Callout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs mb-8 text-center">
            <div>
              <span className="text-indigo-800 text-[10px] font-bold uppercase block">Percentage</span>
              <strong className="text-indigo-950 text-base font-black">{markEntry.percentage}%</strong>
            </div>
            <div>
              <span className="text-indigo-800 text-[10px] font-bold uppercase block">Overall Grade</span>
              <strong className="text-indigo-950 text-base font-black">{markEntry.grade}</strong>
            </div>
            <div>
              <span className="text-indigo-800 text-[10px] font-bold uppercase block">Result Status</span>
              <strong className="text-emerald-700 text-base font-black">{markEntry.passFail}</strong>
            </div>
            <div>
              <span className="text-indigo-800 text-[10px] font-bold uppercase block">Class Standing</span>
              <strong className="text-indigo-950 text-base font-black">
                {markEntry.rank ? `Rank #${markEntry.rank}` : 'Pass'}
              </strong>
            </div>
          </div>

          {/* Grading Legend */}
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-3 mb-8">
            <span className="font-bold text-slate-700">Grading System: </span>
            A+ (90-100% Outstanding) · A (80-89% Excellent) · B+ (70-79% Very Good) · B (60-69% Good) · C+ (50-59% Above Average) · C (40-49% Average) · D (35-39% Pass) · F (Below 35% Failed).
          </div>

          {/* Official Signatures & Seal Line */}
          <div className="pt-10 flex items-end justify-between text-xs">
            {/* Class Teacher */}
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1" />
              <span className="font-bold text-slate-800 block">Class Teacher</span>
              <span className="text-[10px] text-slate-400">Signature</span>
            </div>

            {/* Official Seal Graphic */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-900/60 flex flex-col items-center justify-center p-1 text-[8px] font-bold uppercase text-indigo-900">
                <ShieldCheck className="w-5 h-5 text-indigo-900 mb-0.5" />
                <span>School Seal</span>
              </div>
            </div>

            {/* Principal */}
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1" />
              <span className="font-bold text-slate-800 block">Head of Institution</span>
              <span className="text-[10px] text-slate-400">Principal Signature</span>
            </div>
          </div>

          {/* Issued Date footer */}
          <div className="mt-8 text-center text-[10px] text-slate-400">
            Issued on: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · HADI HADI Student Portal Pro Official Document
          </div>
        </div>
      </div>
    </div>
  );
};
