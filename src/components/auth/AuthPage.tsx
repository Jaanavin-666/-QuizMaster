import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Settings,
  ChevronLeft,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { authService } from '../../services/auth-service.ts';
import { User } from '../../types/index.ts';
import { ParticleBackground } from './ParticleBackground.tsx';
import { GoogleSetupGuideModal } from '../google-oauth/GoogleSetupGuideModal.tsx';
import { LegalModal, LegalModalType } from '../legal/LegalModal.tsx';

interface Props {
  onLoginSuccess: (user: User) => void;
}

type AuthMode = 'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD';

export const AuthPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('SIGN_IN');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modals
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);
  const [clientIdInput, setClientIdInput] = useState(authService.getClientId());

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Google GSI initialization
  useEffect(() => {
    const isCustom = authService.hasCustomClientId();
    if (!isCustom) return;

    const clientId = authService.getClientId();
    const initGoogleIdentity = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false,
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: 320,
            });
          }
        } catch (e) {
          console.warn('Google Identity initialization notice:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleIdentity();
    } else {
      const timer = setTimeout(initGoogleIdentity, 800);
      return () => clearTimeout(timer);
    }
  }, [clientIdInput]);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      setErrorMsg('Google authentication was cancelled or returned an empty response.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const user = await authService.processGoogleCredential(response.credential);
      setSuccessMsg('Google identity verified! Redirecting to dashboard...');
      setTimeout(() => onLoginSuccess(user), 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google OpenID Connect verification failed.');
      setLoading(false);
    }
  };

  const handleDirectGoogleSignIn = () => {
    if (!authService.hasCustomClientId()) {
      setErrorMsg('Please configure your Google Cloud Client ID using the settings icon, or select an Evaluator Demo Session below.');
      setShowConfigModal(true);
      return;
    }

    if (window.google?.accounts?.oauth2) {
      try {
        setLoading(true);
        setErrorMsg(null);
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: authService.getClientId(),
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setLoading(false);
              setErrorMsg(`Google OAuth error: ${tokenResponse.error}`);
              return;
            }
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const profile = await res.json();
              const now = new Date().toISOString();
              const isAdmin = authService.getAdminEmails().some((a) => a.toLowerCase() === profile.email.toLowerCase());
              
              const user: User = {
                id: 'usr-' + profile.sub.slice(-8),
                googleSub: profile.sub,
                authProvider: 'google',
                name: profile.name || profile.email.split('@')[0],
                email: profile.email,
                picture: profile.picture,
                emailVerified: Boolean(profile.email_verified),
                role: isAdmin ? 'ADMIN' : 'STUDENT',
                createdAt: now,
                lastLogin: now,
                accountStatus: 'ACTIVE',
                themePreference: 'system',
              };

              authService.establishSession(user);
              setSuccessMsg('Signed in with Google!');
              setTimeout(() => onLoginSuccess(user), 500);
            } catch (e: any) {
              setLoading(false);
              setErrorMsg('Failed to retrieve user profile from Google.');
            }
          },
        });
        client.requestAccessToken();
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err?.message || 'Failed to initiate Google OAuth popup.');
      }
    } else {
      setErrorMsg('Google Identity Services script is still loading. Please try again.');
    }
  };

  // Email/Password Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'SIGN_IN') {
      try {
        setLoading(true);
        const user = await authService.loginWithEmail(email, password, rememberMe);
        setSuccessMsg(`Welcome back, ${user.name}!`);
        setTimeout(() => onLoginSuccess(user), 500);
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err.message || 'Failed to sign in. Please check your credentials.');
      }
    } else if (mode === 'SIGN_UP') {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }
      try {
        setLoading(true);
        const user = await authService.registerWithEmail(name, email, password);
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => onLoginSuccess(user), 600);
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err.message || 'Registration failed.');
      }
    } else if (mode === 'FORGOT_PASSWORD') {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      try {
        setLoading(true);
        await authService.resetPassword(email, password);
        setSuccessMsg('Password has been securely reset! You may now sign in.');
        setLoading(false);
        setTimeout(() => {
          setMode('SIGN_IN');
          setPassword('');
          setConfirmPassword('');
        }, 1500);
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err.message || 'Password reset failed.');
      }
    }
  };

  // Evaluator Quick Session Launch
  const handleQuickSession = async (role: 'STUDENT' | 'ADMIN') => {
    setLoading(true);
    setErrorMsg(null);
    const emailToUse = role === 'ADMIN' ? 'admin@quizmaster.edu' : 'student@quizmaster.edu';
    try {
      const user = await authService.loginWithEmail(emailToUse, 'Admin@123', true);
      setSuccessMsg(`Logged in as ${user.name}`);
      setTimeout(() => onLoginSuccess(user), 400);
    } catch {
      // Direct session fallback
      const users = authService.getRegisteredUsers();
      const user = users.find((u) => u.email === emailToUse) || users[0];
      authService.establishSession(user);
      onLoginSuccess(user);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* Interactive Animated Particle Background */}
      <ParticleBackground />

      {/* Top Header Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white drop-shadow-xs">
              Quiz<span className="text-indigo-400">Master</span>
            </span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-white/15 backdrop-blur-md">
              Examination System
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl border border-white/15 backdrop-blur-md transition-all shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">OAuth Guide</span>
          </button>
          <button
            onClick={() => setShowConfigModal(true)}
            className="p-1.5 text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl border border-white/15 backdrop-blur-md transition-all shadow-xs"
            title="Configure Google Client ID"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Centered Login / Register / Forgot Password Card */}
      <main className="relative z-10 w-full max-w-lg mx-auto px-4 py-8 sm:py-12 flex-1 flex items-center justify-center">
        <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-7 sm:p-9 shadow-2xl shadow-indigo-950/40 border border-white/40 dark:border-slate-800/80 transition-all duration-300">
          
          {/* Top Decorative Pill */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <GraduationCap className="w-7 h-7" />
            </div>
          </div>

          {/* Heading with smooth subtle micro-animations */}
          <div className="text-center space-y-1.5 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight animate-in fade-in duration-500">
              {mode === 'SIGN_IN' && 'Welcome to QuizMaster'}
              {mode === 'SIGN_UP' && 'Create Your Account'}
              {mode === 'FORGOT_PASSWORD' && 'Reset Your Password'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 animate-in fade-in duration-700">
              {mode === 'SIGN_IN' && 'Sign in to continue your learning journey.'}
              {mode === 'SIGN_UP' && 'Join QuizMaster to take tests and track your academic progress.'}
              {mode === 'FORGOT_PASSWORD' && 'Enter your registered email and choose a new password.'}
            </p>
          </div>

          {/* Alert messages */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name field (Sign Up only) */}
            {mode === 'SIGN_UP' && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anandha Krishnan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Address field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Password field with Show/Hide toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {mode === 'FORGOT_PASSWORD' ? 'New Password' : 'Password'}
                </label>
                {mode === 'SIGN_IN' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('FORGOT_PASSWORD');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password field (Sign Up & Forgot Password) */}
            {(mode === 'SIGN_UP' || mode === 'FORGOT_PASSWORD') && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me Checkbox (Sign In mode) */}
            {mode === 'SIGN_IN' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Remember Me</span>
                </label>
              </div>
            )}

            {/* Primary Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>
                      {mode === 'SIGN_IN' && 'Sign In'}
                      {mode === 'SIGN_UP' && 'Create Account'}
                      {mode === 'FORGOT_PASSWORD' && 'Update Password'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* OR Divider (Sign In / Sign Up) */}
          {mode !== 'FORGOT_PASSWORD' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-semibold tracking-wider">
                    OR
                  </span>
                </div>
              </div>

              {/* Official Google Sign-In Button */}
              <button
                type="button"
                onClick={handleDirectGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs hover:shadow-md transition-all active:scale-[0.99] group cursor-pointer"
              >
                {/* Official Google SVG Logo */}
                <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </>
          )}

          {/* Toggle between Sign In / Sign Up / Forgot Password */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
            {mode === 'SIGN_IN' && (
              <p className="text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('SIGN_UP');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Create Account
                </button>
              </p>
            )}

            {mode === 'SIGN_UP' && (
              <p className="text-slate-600 dark:text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('SIGN_IN');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}

            {mode === 'FORGOT_PASSWORD' && (
              <button
                type="button"
                onClick={() => {
                  setMode('SIGN_IN');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            )}
          </div>

          {/* Quick Evaluator Demo Session Buttons */}
          <div className="mt-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-medium">
              <span>Quick Test Access:</span>
              <button
                onClick={() => setShowGuideModal(true)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                OAuth Guide
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickSession('STUDENT')}
                className="py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 font-semibold border border-slate-200 dark:border-slate-600 text-center transition-colors"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickSession('ADMIN')}
                className="py-1.5 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-semibold border border-indigo-200 dark:border-indigo-800 text-center transition-colors"
              >
                Faculty Admin
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Privacy Policy and Terms of Service */}
      <footer className="relative z-10 w-full border-t border-white/10 py-5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
          <div>
            &copy; {new Date().getFullYear()} QuizMaster Examination Portal. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 font-medium">
            <button
              onClick={() => setLegalModalType('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setLegalModalType('terms')}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setLegalModalType('about')}
              className="hover:text-white transition-colors"
            >
              About QuizMaster
            </button>
            <button
              onClick={() => setLegalModalType('faq')}
              className="hover:text-white transition-colors"
            >
              Help & FAQ
            </button>
          </div>
        </div>
      </footer>

      {/* Google Setup Guide Modal */}
      <GoogleSetupGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Legal Modals */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Google Client ID Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-lg">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Google OAuth Client ID</h3>
                  <p className="text-xs text-slate-500">Google Cloud Console Settings</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Google Client ID (<code className="font-mono">.apps.googleusercontent.com</code>)
                </label>
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="e.g. 1048291823901-...apps.googleusercontent.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    authService.setClientId(clientIdInput.trim());
                    setShowConfigModal(false);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
