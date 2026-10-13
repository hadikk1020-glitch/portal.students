/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { HomeLogin } from './components/HomeLogin';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { AddStudent } from './components/admin/AddStudent';
import { AllStudents } from './components/admin/AllStudents';
import { ClassesDivisions } from './components/admin/ClassesDivisions';
import { ExamManagement } from './components/admin/ExamManagement';
import { MarksEntry } from './components/admin/MarksEntry';
import { ResultsReports } from './components/admin/ResultsReports';
import { SettingsPage } from './components/admin/SettingsPage';
import { StudentDashboard } from './components/student/StudentDashboard';

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [activeExamIdForMarks, setActiveExamIdForMarks] = useState<string | undefined>(undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            HADI HADI Student Portal Pro
          </p>
          <p className="text-xs text-slate-400 mt-1">Loading portal environment...</p>
        </div>
      </div>
    );
  }

  // Not logged in: Show Homepage with the Two Large Login Cards
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1">
          <HomeLogin />
        </main>
      </div>
    );
  }

  // Logged in as Student: Show Student Dashboard
  if (user.role === 'student') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1">
          <StudentDashboard />
        </main>
      </div>
    );
  }

  // Logged in as Admin: Show Admin Dashboard
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
      <Navbar />
      <AdminLayout currentTab={adminTab} onTabChange={setAdminTab}>
        {adminTab === 'dashboard' && (
          <DashboardOverview onNavigate={(tab) => setAdminTab(tab)} />
        )}
        {adminTab === 'add-student' && (
          <AddStudent
            onCancel={() => setAdminTab('all-students')}
            onSuccess={() => setAdminTab('all-students')}
          />
        )}
        {adminTab === 'all-students' && <AllStudents />}
        {adminTab === 'classes' && <ClassesDivisions />}
        {adminTab === 'exams' && (
          <ExamManagement
            onGoToMarksEntry={(examId) => {
              setActiveExamIdForMarks(examId);
              setAdminTab('marks-entry');
            }}
          />
        )}
        {adminTab === 'marks-entry' && (
          <MarksEntry initialExamId={activeExamIdForMarks} />
        )}
        {adminTab === 'reports' && <ResultsReports />}
        {adminTab === 'settings' && <SettingsPage />}
      </AdminLayout>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
