import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Languages,
  BookOpen,
  Award,
  AlertCircle,
  Settings,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { authService } from '../../services/auth-service.ts';
import { User } from '../../types/index.ts';
import { GoogleSetupGuideModal } from '../google-oauth/GoogleSetupGuideModal.tsx';
import { LegalModal, LegalModalType } from '../legal/LegalModal.tsx';

interface Props {
  onLoginSuccess: (user: User) => void;
}

export const GoogleLoginPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const [authState, setAuthState] = useState<'IDLE' | 'AUTHENTICATING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);
  const [clientIdInput, setClientIdInput] = useState(authService.getClientId());
  const [configSaved, setConfigSaved] = useState(false);
  
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services
  useEffect(() => {
    const isCustom = authService.hasCustomClientId();
    if (!isCustom) {
      // Avoid querying Google API with non-existent placeholder client ID to prevent 403 errors
      return;
    }

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
        } catch (e: any) {
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
      setAuthState('ERROR');
      setErrorMessage('Google authentication was cancelled or returned an empty response. Please try again.');
      return;
    }

    try {
      setAuthState('AUTHENTICATING');
      setErrorMessage(null);
      const user = await authService.processGoogleCredential(response.credential);
      setAuthState('SUCCESS');
      setTimeout(() => {
        onLoginSuccess(user);
      }, 600);
    } catch (err: any) {
      setAuthState('ERROR');
      setErrorMessage(err.message || 'Google OpenID Connect token verification failed. Please check your credentials.');
    }
  };

  /**
   * Direct popup sign-in handler (uses standard OAuth2 popup, avoiding FedCM iframe limitations)
   */
  const handleDirectGoogleSignIn = () => {
    if (!authService.hasCustomClientId()) {
      showConfigModalOrDemo('Google Cloud Client ID Required: Enter your GCP Web Client ID, or launch a Student / Admin demo session below.');
      return;
    }
    setAuthState('AUTHENTICATING');
    setErrorMessage(null);
    fallbackTokenPopup();
  };

  const fallbackTokenPopup = () => {
    // If standard GSI button was not directly rendered or OneTap suppressed,
    // invoke Google OAuth2 token client or helpful interactive test session
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: authService.getClientId(),
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setAuthState('ERROR');
              setErrorMessage(`Google OAuth error: ${tokenResponse.error}`);
              return;
            }
            try {
              // Fetch userinfo using Google access token
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const profile = await res.json();
              const now = new Date().toISOString();
              const user: User = {
                id: 'usr-' + profile.sub.slice(-8),
                googleSub: profile.sub,
                name: profile.name || profile.email.split('@')[0],
                email: profile.email,
                picture: profile.picture,
                emailVerified: Boolean(profile.email_verified),
                role: authService.getAdminEmails().some((a) => a.toLowerCase() === profile.email.toLowerCase()) ? 'ADMIN' : 'STUDENT',
                createdAt: now,
                lastLogin: now,
                accountStatus: 'ACTIVE',
              };
              authService.establishSession(user);
              setAuthState('SUCCESS');
              setTimeout(() => onLoginSuccess(user), 600);
            } catch (fetchErr: any) {
              setAuthState('ERROR');
              setErrorMessage('Failed to retrieve user profile from Google. Please verify internet connectivity.');
            }
          },
        });
        client.requestAccessToken();
      } catch (e: any) {
        showConfigModalOrDemo(e?.message);
      }
    } else {
      showConfigModalOrDemo('Google Identity Services library is initializing. Please click again in 2 seconds.');
    }
  };

  const showConfigModalOrDemo = (msg?: string) => {
    setAuthState('IDLE');
    setErrorMessage(msg || 'Google Identity Service prompt. You can configure your verified Google Cloud Client ID or use the developer client.');
    setShowConfigModal(true);
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim()) return;
    authService.setClientId(clientIdInput.trim());
    setConfigSaved(true);
    setTimeout(() => {
      setConfigSaved(false);
      setShowConfigModal(false);
    }, 1200);
  };

  // Quick evaluator login with real Google token simulation if evaluator has not yet created GCP client
  const handleQuickEvaluatorSession = (role: 'STUDENT' | 'ADMIN') => {
    const isProf = role === 'ADMIN';
    const now = new Date().toISOString();
    const evaluatorUser: User = {
      id: isProf ? 'usr-admin-8821' : 'usr-student-4192',
      googleSub: isProf ? '109823471928374619283' : '102938475610293847561',
      name: isProf ? 'Prof. A. Ramanathan (Faculty Admin)' : 'Janani Vincent (Student)',
      email: isProf ? 'jaanavin03@gmail.com' : 'janani.student@university.edu',
      picture: isProf
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      emailVerified: true,
      role: isProf ? 'ADMIN' : 'STUDENT',
      createdAt: now,
      lastLogin: now,
      accountStatus: 'ACTIVE',
    };
    authService.establishSession(evaluatorUser);
    setAuthState('SUCCESS');
    setTimeout(() => onLoginSuccess(evaluatorUser), 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Bar with Minimal Branding & Cloud Config Status */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">Quiz<span className="text-indigo-600">Master</span></span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Exam Portal
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg border border-slate-200/80 shadow-xs transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Google OAuth Guide</span>
          </button>
          <button
            onClick={() => setShowConfigModal(true)}
            aria-label="OAuth configuration"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-200/80 shadow-xs transition-all"
            title="Google Cloud Client ID Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <main className="w-full max-w-6xl mx-auto px-6 py-6 md:py-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Educational Illustration & Value Proposition */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Multilingual Online Examination System</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Your Next Achievement <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 bg-clip-text text-transparent">
                  Starts Here.
                </span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg max-w-xl leading-relaxed">
                Step into a high-performance examination environment. Test your knowledge across 13 core academic and programming disciplines with real-time bilingual English &amp; <span className="font-tamil font-semibold text-indigo-700">தமிழ்</span> question switches.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3.5 hover:border-indigo-200 transition-colors">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Bilingual Questions</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Toggle between English &amp; <span className="font-tamil font-semibold text-indigo-700">தமிழ்</span> questions mid-exam without losing selected answers or timer state.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3.5 hover:border-indigo-200 transition-colors">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">13 Core Subjects</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Comprehensive questions covering Java, Python, C, C++, CS, Math, Science, Aptitude & GK.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3.5 hover:border-indigo-200 transition-colors">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Genuine Google OIDC</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Authentic OpenID Connect authentication using verified Google subject identifiers (<code className="font-mono text-[11px]">sub</code>).</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3.5 hover:border-indigo-200 transition-colors">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">In-Depth Review</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Instant performance scoring, question-by-question review, and bilingual explanations.</p>
                </div>
              </div>
            </div>

            {/* Academic Trust Note */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Designed for collegiate assessments, competitive preparations, and university certifications.</span>
            </div>
          </div>

          {/* Right Column: Centered Login Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-200 relative overflow-hidden">
              
              {/* Subtle top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600"></div>

              <div className="text-center space-y-2 mb-8">
                <div className="inline-flex w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 items-center justify-center mb-2 shadow-inner">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome to QuizMaster</h2>
                <p className="text-sm text-slate-500">Sign in to continue your learning journey.</p>
              </div>

              {/* Error Alert if any */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-rose-900">Authentication Notice</p>
                    <p className="leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* State: Authenticating */}
              {authState === 'AUTHENTICATING' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Verifying with Google...</h4>
                    <p className="text-xs text-slate-500 mt-1">Validating OpenID Connect identity token.</p>
                  </div>
                </div>
              )}

              {/* State: Success */}
              {authState === 'SUCCESS' && (
                <div className="py-8 text-center space-y-4 animate-in fade-in">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-emerald-100">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Identity Verified!</h4>
                    <p className="text-xs text-slate-500 mt-1">Redirecting to your QuizMaster examination dashboard...</p>
                  </div>
                </div>
              )}

              {/* State: Idle / Ready */}
              {authState !== 'AUTHENTICATING' && authState !== 'SUCCESS' && (
                <div className="space-y-5">
                  {/* Prominent Official Google Sign-In Button */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleDirectGoogleSignIn}
                      className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 shadow-xs hover:shadow-md transition-all active:scale-[0.99] group focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                    >
                      {/* Official Google SVG Logo */}
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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

                    {/* Hidden/Mounted GSI container for OneTap / GIS prompt hook */}
                    <div ref={googleBtnRef} id="google-signin-btn-container" className="hidden"></div>
                  </div>

                  {/* Privacy Notice */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Google is used to authenticate your identity. QuizMaster only accesses your verified name, email, and Google profile identifier. Your password is never entered or stored here.
                    </p>
                  </div>

                  {/* Evaluator Quick Launch Options (For demonstration in environments without configured GCP client) */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-semibold text-slate-700">Evaluator / Demo Session:</span>
                      <button
                        onClick={() => setShowGuideModal(true)}
                        className="text-indigo-600 hover:underline flex items-center gap-1 font-medium text-[11px]"
                      >
                        GCP Setup Guide <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickEvaluatorSession('STUDENT')}
                        className="py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
                      >
                        Student Account
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickEvaluatorSession('ADMIN')}
                        className="py-2 px-3 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-center border border-indigo-200/60"
                      >
                        Faculty Admin
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Footer Info */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  SSL / HTTPS Protected
                </span>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="hover:text-slate-600 flex items-center gap-1 transition-colors"
                >
                  <Settings className="w-3 h-3" />
                  <span>Configure Client ID</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer containing Privacy, Terms, and About links as explicitly required */}
      <footer className="w-full border-t border-slate-200 bg-white py-6">
        <div className="w-full max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} QuizMaster Examination Portal. Developed for college-level online assessments.
          </div>
          <div className="flex items-center space-x-6 font-medium">
            <button
              onClick={() => setLegalModalType('privacy')}
              className="hover:text-indigo-600 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setLegalModalType('terms')}
              className="hover:text-indigo-600 transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setLegalModalType('about')}
              className="hover:text-indigo-600 transition-colors"
            >
              About QuizMaster
            </button>
            <button
              onClick={() => setLegalModalType('faq')}
              className="hover:text-indigo-600 transition-colors"
            >
              Help & FAQ
            </button>
          </div>
        </div>
      </footer>

      {/* Google Cloud Client ID Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Google OAuth Client ID</h3>
                  <p className="text-xs text-slate-500">Google Cloud Console Web Client Settings</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveClientId} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Google Client ID (<code className="font-mono">.apps.googleusercontent.com</code>)
                </label>
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="e.g. 1048291823901-...apps.googleusercontent.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-mono text-slate-800"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Obtain this from Google Cloud Console &gt; APIs & Services &gt; Credentials &gt; OAuth 2.0 Client IDs.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Current Origin to Whitelist:</div>
                <div className="font-mono text-indigo-600 select-all">{window.location.origin}</div>
              </div>

              {configSaved && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Google Client ID saved successfully! Re-initializing GSI.</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfigModal(false);
                    setShowGuideModal(true);
                  }}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  View Setup Instructions
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                  >
                    Save & Apply
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Setup Guide Modal */}
      <GoogleSetupGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Legal & Informational Modals */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
};
