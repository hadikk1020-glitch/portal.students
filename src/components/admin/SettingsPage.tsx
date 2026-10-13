import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Settings,
  KeyRound,
  Database,
  Building,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { token, user } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'password' | 'backup' | 'school'>('password');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // School settings state
  const [schoolSettings, setSchoolSettings] = useState({
    schoolName: '',
    schoolTagline: '',
    schoolAddress: '',
    schoolCode: '',
    currentAcademicYear: '2025-2026',
  });
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [schoolSuccess, setSchoolSuccess] = useState<string | null>(null);

  // Backup & Restore
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    fetchSchoolSettings();
  }, [token]);

  const fetchSchoolSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSchoolSettings(data);
      }
    } catch {
      //
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
    } catch (err: any) {
      setPassError(err.message || 'Error updating password');
      setPassLoading(false);
    }
  };

  const handleSaveSchoolSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSchoolLoading(true);
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(schoolSettings),
      });

      if (res.ok) {
        setSchoolSuccess('School details saved successfully!');
        setTimeout(() => setSchoolSuccess(null), 3000);
      }
    } catch {
      //
    } finally {
      setSchoolLoading(false);
    }
  };

  const handleDownloadBackup = () => {
    window.location.href = '/api/admin/backup';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const res = await fetch('/api/admin/restore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ backupData: JSON.parse(content) }),
        });

        const data = await res.json();
        if (res.ok) {
          setRestoreStatus('Database successfully restored from JSON backup!');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setRestoreStatus(`Restore failed: ${data.error}`);
        }
      } catch (err: any) {
        setRestoreStatus(`Failed to read file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetToSeed = async () => {
    try {
      const res = await fetch('/api/admin/reset-seed', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRestoreStatus('Database reset to pristine seed sample data!');
        setResetConfirm(false);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch {
      //
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.settingsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.settingsSubtitle}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('password')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'password'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {t.changePasswordTab}
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'backup'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {t.databaseBackupTab}
        </button>
        <button
          onClick={() => setActiveTab('school')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'school'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {t.schoolDetailsTab}
        </button>
      </div>

      {/* TAB 1: PASSWORD CHANGE */}
      {activeTab === 'password' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Admin Password Update
              </h3>
              <p className="text-xs text-slate-400">Keep administrative credentials secure</p>
            </div>
          </div>

          {passError && (
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold mb-4">
              {passError}
            </div>
          )}

          {passSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4">
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
                placeholder="Enter current password (admin123)"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
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
                placeholder="Enter new password"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
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
                placeholder="Confirm new password"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-60"
            >
              {passLoading ? t.loading : t.updatePasswordBtn}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: DATABASE BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="space-y-6 max-w-3xl">
          {restoreStatus && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              {restoreStatus}
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Export & Backup Full Database
                </h3>
                <p className="text-xs text-slate-400">Download complete snapshot including students, classes, and marks</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleDownloadBackup}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadBackupBtn}</span>
              </button>
              <button
                onClick={() => (window.location.href = '/api/admin/export/students.csv')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Students CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Restore from JSON Backup File
                </h3>
                <p className="text-xs text-slate-400">Restore application data from a previously saved JSON backup file</p>
              </div>
            </div>

            <div>
              <label className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Select JSON Backup File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset to Seed Data */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-rose-200 dark:border-rose-900/60 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Reset to Pristine Sample Data
                </h3>
                <p className="text-xs text-slate-400">Restore factory sample students, examinations, and evaluation records</p>
              </div>
            </div>

            {resetConfirm ? (
              <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-xs space-y-3">
                <p className="font-bold">{t.resetSeedConfirm}</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetToSeed}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold cursor-pointer"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm(true)}
                className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer"
              >
                {t.resetSeedDataBtn}
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SCHOOL DETAILS */}
      {activeTab === 'school' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                School Branding & Official Info
              </h3>
              <p className="text-xs text-slate-400">Used on official printable mark sheets & reports</p>
            </div>
          </div>

          {schoolSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4">
              {schoolSuccess}
            </div>
          )}

          <form onSubmit={handleSaveSchoolSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official School Name
              </label>
              <input
                type="text"
                required
                value={schoolSettings.schoolName}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Motto / Tagline
              </label>
              <input
                type="text"
                value={schoolSettings.schoolTagline}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolTagline: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Address
              </label>
              <textarea
                rows={2}
                value={schoolSettings.schoolAddress}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolAddress: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                School Affiliation Code
              </label>
              <input
                type="text"
                value={schoolSettings.schoolCode}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolCode: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={schoolLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-60"
            >
              {schoolLoading ? t.loading : t.save}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
