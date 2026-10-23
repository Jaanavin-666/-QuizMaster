import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Key,
  Languages,
  RotateCcw,
  Code2,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Sun,
  Moon,
  Laptop,
  User as UserIcon,
  Camera,
  Palette,
} from 'lucide-react';
import { User, QuestionLanguage } from '../../types/index.ts';
import { authService } from '../../services/auth-service.ts';
import { useTheme } from '../../context/ThemeContext.tsx';

interface Props {
  user: User;
  globalLanguage: QuestionLanguage;
  onToggleGlobalLanguage: (lang: QuestionLanguage) => void;
  onToggleUserRole: () => void;
  onResetFactoryDefaults: () => void;
  onOpenSpringBootModal: () => void;
  onOpenGoogleGuideModal: () => void;
  onNavigateToEditProfile?: () => void;
}

export const SettingsView: React.FC<Props> = ({
  user,
  globalLanguage,
  onToggleGlobalLanguage,
  onToggleUserRole,
  onResetFactoryDefaults,
  onOpenSpringBootModal,
  onOpenGoogleGuideModal,
  onNavigateToEditProfile,
}) => {
  const [clientIdInput, setClientIdInput] = useState(authService.getClientId());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const { theme, setTheme, isDarkMode } = useTheme();

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim()) return;
    authService.setClientId(clientIdInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Preferences & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your appearance theme, identity photo, examination languages, and RBAC roles.
        </p>
      </div>

      {/* Appearance & Theme Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Customizable Appearance & Themes</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose your preferred visual theme across all QuizMaster interfaces</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize">
            Current: {theme} mode
          </span>
        </div>

        {/* 3 Theme Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          {/* Light Mode */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
              theme === 'light'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              {theme === 'light' && <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">Light Mode</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                Crisp, high-contrast bright canvas optimized for well-lit rooms.
              </p>
            </div>
          </button>

          {/* Dark Mode */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
              theme === 'dark'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 dark:bg-slate-700 text-indigo-300 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              {theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">Dark Mode</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                Deep slate palette engineered for low eye fatigue during night study.
              </p>
            </div>
          </button>

          {/* System Default */}
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
              theme === 'system'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              {theme === 'system' && <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">System Default</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                Synchronizes automatically with your OS light/dark schedule.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* User Profile & Avatar Management Shortcut Card */}
      {onNavigateToEditProfile && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <img
              src={user.customAvatarUrl || user.picture}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200 dark:border-indigo-800 shadow-xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`;
              }}
            />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">User Profile & Avatar</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload your picture from your device gallery (<code className="font-mono text-[11px]">.jpg, .png, .webp &lt; 5MB</code>) or change your display name.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToEditProfile}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Edit Profile & Photo</span>
          </button>
        </div>
      )}

      {/* Google Cloud OAuth 2.0 Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Google Cloud OAuth 2.0 Credentials</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configures genuine Google Identity Services in this browser</p>
            </div>
          </div>
          <button
            onClick={onOpenGoogleGuideModal}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors"
          >
            Setup Guide
          </button>
        </div>

        <form onSubmit={handleSaveClientId} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Google Client ID
            </label>
            <input
              type="text"
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              placeholder="YOUR_CLIENT_ID.apps.googleusercontent.com"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Client ID is stored securely in browser storage and injected into Google Identity Services.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <div className="font-semibold text-slate-700 dark:text-slate-300">Authorized JavaScript Origin for Google Console:</div>
            <div className="font-mono text-indigo-600 dark:text-indigo-400 select-all">{window.location.origin}</div>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Google Client ID updated and active!</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Update Google Client ID
            </button>
          </div>
        </form>
      </div>

      {/* Language Preferences Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-xl">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Default Question Language</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Primary language rendered when entering examinations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <button
            type="button"
            onClick={() => onToggleGlobalLanguage('en')}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              globalLanguage === 'en'
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div>
              <div className="font-bold text-sm">English</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Render question text and options in English</div>
            </div>
            {globalLanguage === 'en' && <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          </button>

          <button
            type="button"
            onClick={() => onToggleGlobalLanguage('ta')}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              globalLanguage === 'ta'
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div>
              <div className="font-bold text-sm font-tamil">தமிழ் (Tamil)</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-tamil">வினாக்கள் மற்றும் விருப்பங்களை தமிழில் காட்டு</div>
            </div>
            {globalLanguage === 'ta' && <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Demonstration Switch */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Role-Based Access Control (RBAC)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Toggle between Student and Faculty Administrator rights</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Role:</div>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
              <span>{user.role}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                user.role === 'ADMIN' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              }`}>
                {user.role === 'ADMIN' ? 'Full Access' : 'Exams Only'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Switching to ADMIN unlocks the Question Bank and question authoring tools.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleUserRole}
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer ${
              user.role === 'ADMIN'
                ? 'bg-slate-800 hover:bg-slate-900 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            Switch to {user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN'}
          </button>
        </div>
      </div>

      {/* Developer Blueprint & Reset Defaults Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Backend Blueprints & Maintenance</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Inspect Java Spring Boot 3 code or reset question database</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">Java 21 Spring Boot Backend</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              View complete Spring Security OAuth2 configurations, JPA entities, controllers, and MySQL schema.sql.
            </p>
            <button
              onClick={onOpenSpringBootModal}
              className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect Source Files</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">Reset Question Bank</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Restores all 13 subjects and original bilingual questions to factory defaults.
            </p>
            {resetConfirm ? (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onResetFactoryDefaults();
                    setResetConfirm(false);
                  }}
                  className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-xs"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setResetConfirm(false)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setResetConfirm(true)}
                className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Seed Questions</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
