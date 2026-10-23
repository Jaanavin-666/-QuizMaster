import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, ShieldCheck, Key, Globe, Terminal, Server } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSetupGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const redirectUriSpring = 'http://localhost:8080/login/oauth2/code/google';
  const jsOriginDev = window.location.origin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-indigo-100" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Google Cloud OAuth 2.0 & Backend Setup Guide</h2>
              <p className="text-xs text-indigo-100">Step-by-step instructions for genuine Google OpenID Connect integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close setup guide"
            className="p-2 text-indigo-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-slate-700 text-sm">
          {/* Quick Notice */}
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start space-x-3">
            <Key className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 leading-relaxed">
              <strong>QuizMaster Authentication Philosophy:</strong> We use authentic Google OpenID Connect (OIDC) identity tokens. Real authentication validates the user's Google subject identifier (<code className="bg-indigo-100 px-1 py-0.5 rounded font-mono">sub</code>) and provides single sign-on without storing passwords.
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              Create a Google Cloud Project
            </h3>
            <p className="text-slate-600 pl-8">
              Navigate to the <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3.5 h-3.5" /></a> and create or select an existing project named <strong>QuizMaster</strong>.
            </p>

            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pt-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Configure OAuth Consent Screen
            </h3>
            <div className="pl-8 space-y-2 text-slate-600">
              <p>Go to <strong>APIs & Services</strong> &gt; <strong>OAuth consent screen</strong>:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Choose <strong>External</strong> User Type.</li>
                <li>Set App name: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">QuizMaster</code></li>
                <li>Set User support email: your personal Gmail account.</li>
                <li>Scopes required: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">openid</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">.../auth/userinfo.email</code>, and <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">.../auth/userinfo.profile</code>.</li>
                <li>Add test users (e.g. your email address) while the app is in testing mode.</li>
              </ul>
            </div>

            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pt-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              Create OAuth 2.0 Web Client Credentials
            </h3>
            <div className="pl-8 space-y-3">
              <p className="text-slate-600">Go to <strong>APIs & Services</strong> &gt; <strong>Credentials</strong> &gt; <strong>Create Credentials</strong> &gt; <strong>OAuth client ID</strong> (Web application):</p>
              
              {/* Authorized JS Origins */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Authorized JavaScript origins:
                </label>
                <div className="flex items-center justify-between bg-slate-900 text-slate-200 px-3 py-2 rounded-lg font-mono text-xs">
                  <span>{jsOriginDev}</span>
                  <button
                    onClick={() => copyToClipboard(jsOriginDev, 'origin')}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                  >
                    {copiedKey === 'origin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'origin' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Authorized Redirect URIs */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Authorized redirect URIs (Spring Security OAuth2 Callback):
                </label>
                <div className="flex items-center justify-between bg-slate-900 text-slate-200 px-3 py-2 rounded-lg font-mono text-xs">
                  <span>{redirectUriSpring}</span>
                  <button
                    onClick={() => copyToClipboard(redirectUriSpring, 'redirect')}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                  >
                    {copiedKey === 'redirect' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'redirect' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pt-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">4</span>
              Local Development vs. Production HTTPS
            </h3>
            <div className="pl-8 space-y-2 text-slate-600">
              <p>
                <strong>Local Development:</strong> Google allows <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">http://localhost</code> and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">http://127.0.0.1</code> over plain HTTP for local prototyping.
              </p>
              <p>
                <strong>Production Deployment:</strong> In production, Google strictly mandates a valid <strong>HTTPS</strong> domain (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">https://quizmaster.yourdomain.com</code>) with a trusted SSL/TLS certificate.
              </p>
            </div>

            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pt-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">5</span>
              Spring Boot & MySQL Connection
            </h3>
            <div className="pl-8 space-y-2 text-slate-600">
              <p>Export your Google credentials and MySQL settings before running Maven:</p>
              <pre className="bg-slate-950 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
{`export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export MYSQL_HOST="localhost"
export MYSQL_DATABASE="quizmaster_db"
export MYSQL_USER="root"
export MYSQL_PASSWORD="your_password"`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Server className="w-4 h-4 text-indigo-500" />
            <span>Ready for Java 21 & Spring Boot 3</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
