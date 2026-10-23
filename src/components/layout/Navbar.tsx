import React, { useState } from 'react';
import {
  GraduationCap,
  LogOut,
  User as UserIcon,
  Shield,
  Layers,
  Award,
  Database,
  Settings as SettingsIcon,
  Menu,
  X,
  Code2,
  HelpCircle,
  ChevronDown,
  Globe,
  Edit,
  Camera,
  Info,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { User, QuestionLanguage } from '../../types/index.ts';
import { useTheme } from '../../context/ThemeContext.tsx';

interface Props {
  user: User;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  globalLanguage: QuestionLanguage;
  onToggleGlobalLanguage: (lang: QuestionLanguage) => void;
  onOpenSpringBootModal: () => void;
  onOpenGoogleGuideModal: () => void;
}

export const Navbar: React.FC<Props> = ({
  user,
  currentView,
  onNavigate,
  onLogout,
  globalLanguage,
  onToggleGlobalLanguage,
  onOpenSpringBootModal,
  onOpenGoogleGuideModal,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { theme, setTheme, isDarkMode } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'subjects', label: 'Subjects', icon: Globe },
    { id: 'results', label: 'My Results', icon: Award },
    { id: 'admin', label: 'Question Bank', icon: Database, adminOnly: true },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
    setShowUserDropdown(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <button
                onClick={() => handleNavClick('dashboard')}
                className="flex items-center space-x-2.5 text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-950 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                    Quiz<span className="text-indigo-600 dark:text-indigo-400">Master</span>
                  </span>
                  <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Bilingual
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                if (item.adminOnly && user.role !== 'ADMIN') return null;
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 shadow-xs border border-indigo-100 dark:border-indigo-800'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {item.adminOnly && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 uppercase">
                        Admin
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Actions: Theme Toggle, Language Switch & User Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Quick Theme Toggle Button */}
              <button
                type="button"
                onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer"
                title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} mode`}
                aria-label="Toggle theme mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Question Language Switch */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => onToggleGlobalLanguage('en')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    globalLanguage === 'en'
                      ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Display questions in English"
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => onToggleGlobalLanguage('ta')}
                  className={`px-2.5 py-1 rounded-lg font-tamil transition-all cursor-pointer ${
                    globalLanguage === 'ta'
                      ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="வினாக்களை தமிழில் காட்டு"
                >
                  தமிழ்
                </button>
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-left cursor-pointer"
                  aria-expanded={showUserDropdown}
                  aria-label="User account menu"
                >
                  <img
                    src={user.customAvatarUrl || user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-indigo-200 dark:border-indigo-700 object-cover shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`;
                    }}
                  />
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-bold text-slate-800 dark:text-white leading-none truncate max-w-[120px]">
                      {user.name}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        user.role === 'ADMIN'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Polished Dropdown Menu containing all requested items */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95">
                    
                    {/* Header info */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {user.authProvider === 'google' ? 'Google OIDC' : 'Email Verified'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {/* 1. Profile */}
                      <button
                        onClick={() => handleNavClick('profile')}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Profile</span>
                      </button>

                      {/* 2. Edit Profile */}
                      <button
                        onClick={() => handleNavClick('edit-profile')}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <Edit className="w-4 h-4 text-slate-400" />
                        <span>Edit Profile</span>
                      </button>

                      {/* 3. Change Profile Photo */}
                      <button
                        onClick={() => handleNavClick('edit-profile')}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <Camera className="w-4 h-4 text-slate-400" />
                        <span>Change Profile Photo</span>
                      </button>

                      {/* 4. Settings */}
                      <button
                        onClick={() => handleNavClick('settings')}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4 text-slate-400" />
                        <span>Settings</span>
                      </button>

                      {/* 5. Account Information */}
                      <button
                        onClick={() => handleNavClick('profile')}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <Info className="w-4 h-4 text-slate-400" />
                        <span>Account Information</span>
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 font-semibold transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2">
            {navItems.map((item) => {
              if (item.adminOnly && user.role !== 'ADMIN') return null;
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{item.label}</span>
                  </div>
                  {item.adminOnly && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      ADMIN
                    </span>
                  )}
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGoogleGuideModal();
                }}
                className="text-indigo-600 dark:text-indigo-400 py-1.5 font-medium"
              >
                Google OAuth Guide
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSpringBootModal();
                }}
                className="text-slate-600 dark:text-slate-400 py-1.5 font-medium"
              >
                Spring Boot Code
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Sign Out of QuizMaster?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              Your active session will be securely ended. You can sign in again with your credentials or Google account.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
