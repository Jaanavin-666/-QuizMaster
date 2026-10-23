import React from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Mail,
  Calendar,
  Clock,
  Award,
  Layers,
  Key,
  CheckCircle2,
  ExternalLink,
  Edit,
  Camera,
} from 'lucide-react';
import { User, QuizAttempt } from '../../types/index.ts';

interface Props {
  user: User;
  attempts: QuizAttempt[];
  onOpenGoogleGuideModal: () => void;
  onNavigateToEditProfile?: () => void;
}

export const UserProfileView: React.FC<Props> = ({
  user,
  attempts,
  onOpenGoogleGuideModal,
  onNavigateToEditProfile,
}) => {
  const completedCount = attempts.length;
  const avgScore = completedCount > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / completedCount)
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Student Identity & Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Authentication credentials, identity records, and examination performance metrics.
          </p>
        </div>
        {onNavigateToEditProfile && (
          <button
            type="button"
            onClick={onNavigateToEditProfile}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Edit Profile & Photo</span>
          </button>
        )}
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="relative group cursor-pointer" onClick={onNavigateToEditProfile}>
            <img
              src={user.customAvatarUrl || user.picture}
              alt={user.name}
              className="w-24 h-24 rounded-3xl border-2 border-indigo-200 dark:border-indigo-800 shadow-md object-cover shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`;
              }}
            />
            {onNavigateToEditProfile && (
              <div className="absolute inset-0 rounded-3xl bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                user.role === 'ADMIN'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              }`}>
                {user.role}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{user.authProvider === 'google' ? 'Google Verified' : 'Email Verified'}</span>
              </span>
            </div>

            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center sm:justify-start gap-1.5 font-mono">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user.email}</span>
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Registered: {new Date(user.createdAt).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Last Login: {new Date(user.lastLogin).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Google Identity & Security Details */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Authentication Provider Claims & Security</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-1">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              {user.authProvider === 'google' ? 'Google Subject Identifier (sub)' : 'Internal Account Reference ID'}
            </span>
            <div className="font-mono text-slate-800 dark:text-slate-200 break-all select-all">
              {user.googleSub || user.id}
            </div>
            <p className="text-[10px] text-slate-400">
              Unique, persistent identifier assigned to this identity record.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-1">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Identity Provider
            </span>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              {user.authProvider === 'google' ? 'Google Identity Services (OIDC)' : 'QuizMaster Native Credential Engine'}
            </div>
            <p className="text-[10px] text-slate-400">
              Issuer: <code className="font-mono">{user.authProvider === 'google' ? 'accounts.google.com' : 'auth.quizmaster.edu'}</code>
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Need to connect this to your institution's Google Workspace?</span>
          </div>
          <button
            onClick={onOpenGoogleGuideModal}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shrink-0 cursor-pointer"
          >
            Setup Guide
          </button>
        </div>
      </div>

      {/* Academic Quiz Performance Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Academic Examination Track Record</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-center">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{completedCount}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Quizzes Taken</div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-center">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{avgScore}%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Average Accuracy</div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-center col-span-2 sm:col-span-1">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{user.accountStatus}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Academic Standing</div>
          </div>
        </div>
      </div>
    </div>
  );
};
