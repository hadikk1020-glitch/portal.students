import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { 
  GraduationCap, 
  Sun, 
  Moon, 
  Globe, 
  LogOut, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                HADI HADI
              </span>
              <span className="ml-1.5 font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base hidden sm:inline">
                Student Portal Pro
              </span>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden md:block">
                {t.portalSubtitle}
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Switch language / ഭാഷ മാറ്റുക"
              aria-label="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'en' ? 'മലയാളം' : 'English'}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title={theme === 'dark' ? t.lightMode : t.darkMode}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* User Session Info & Logout */}
            {user && (
              <div className="flex items-center pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-700 space-x-2 sm:space-x-3">
                {/* Role badge (Strict Rule: No photo/avatar placeholder) */}
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-end gap-1">
                    {user.role === 'admin' ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 inline" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 inline" />
                    )}
                    <span>{user.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold tracking-wide uppercase">
                    {user.role === 'admin' ? t.adminRole : `${t.studentRole} · ${user.username}`}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold transition-colors cursor-pointer"
                  title={t.logout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{t.logout}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
