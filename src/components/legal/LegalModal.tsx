import React from 'react';
import { X, Shield, FileText, Info, HelpCircle } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | 'about' | 'faq' | null;

interface Props {
  type: LegalModalType;
  onClose: () => void;
}

export const LegalModal: React.FC<Props> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            {type === 'privacy' && <Shield className="w-5 h-5 text-indigo-600" />}
            {type === 'terms' && <FileText className="w-5 h-5 text-indigo-600" />}
            {type === 'about' && <Info className="w-5 h-5 text-indigo-600" />}
            {type === 'faq' && <HelpCircle className="w-5 h-5 text-indigo-600" />}
            <h2 className="text-lg font-bold text-slate-900 capitalize">
              {type === 'privacy' && 'Privacy Policy'}
              {type === 'terms' && 'Terms of Service'}
              {type === 'about' && 'About QuizMaster'}
              {type === 'faq' && 'Frequently Asked Questions (FAQ)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-600 text-sm leading-relaxed">
          {type === 'privacy' && (
            <>
              <p>
                <strong>Privacy Notice:</strong> QuizMaster uses <strong>Google OAuth 2.0 / OpenID Connect</strong> strictly for verifying your academic identity. We only request identity scopes: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">openid</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">email</code>, and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">profile</code>.
              </p>
              <h4 className="font-semibold text-slate-800">1. Data Collected</h4>
              <p>
                We store your Google Subject ID (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">sub</code>), full name, email address, profile avatar URL, and your quiz examination answers and scores. We never ask for or store your Google password.
              </p>
              <h4 className="font-semibold text-slate-800">2. Examination Records</h4>
              <p>
                Your quiz submissions, time spent, selected answers, and performance metrics are saved to allow personalized progress tracking and academic analytics.
              </p>
              <h4 className="font-semibold text-slate-800">3. Third-Party Sharing</h4>
              <p>
                We do not sell, rent, or trade your personal information. Authentication is delegated directly to Google Identity Services.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p>
                Welcome to <strong>QuizMaster</strong>. By accessing or taking examinations on this portal, you agree to abide by these academic guidelines.
              </p>
              <h4 className="font-semibold text-slate-800">1. Academic Integrity</h4>
              <p>
                QuizMaster is designed to support honest learning and assessment. Users must not attempt to tamper with timers, duplicate question submissions, or circumvent role permissions.
              </p>
              <h4 className="font-semibold text-slate-800">2. Authentication Responsibility</h4>
              <p>
                You are responsible for maintaining the security of your Google account. All exam attempts initiated from your authenticated identity are recorded as your work.
              </p>
              <h4 className="font-semibold text-slate-800">3. Evaluation Accuracy</h4>
              <p>
                Quiz scoring is calculated deterministically based on verified answer keys. Negative marking penalties, if configured, are applied automatically.
              </p>
            </>
          )}

          {type === 'about' && (
            <>
              <p className="font-medium text-slate-800">
                QuizMaster is a college-level Multilingual Online Examination & Assessment System built for students, competitive exam aspirants, and academic institutions.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <div className="font-bold text-indigo-900 text-sm">Bilingual Questions</div>
                  <div className="text-xs text-indigo-700 mt-1">Instant seamless toggle between English & தமிழ் without losing quiz progress.</div>
                </div>
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <div className="font-bold text-indigo-900 text-sm">Real Google OIDC</div>
                  <div className="text-xs text-indigo-700 mt-1">Genuine OpenID Connect authentication with stable subject identifiers.</div>
                </div>
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <div className="font-bold text-indigo-900 text-sm">13 Disciplines</div>
                  <div className="text-xs text-indigo-700 mt-1">Comprehensive question bank covering Programming, Math, Science & GK.</div>
                </div>
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <div className="font-bold text-indigo-900 text-sm">Full-Stack Blueprint</div>
                  <div className="text-xs text-indigo-700 mt-1">Production Java 21 Spring Boot 3 + MySQL database architecture.</div>
                </div>
              </div>
            </>
          )}

          {type === 'faq' && (
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">How does the English & Tamil language switch work?</h4>
                <p className="text-xs text-slate-600 mt-1">
                  The UI chrome remains in English for clean consistency, while the question text, multiple choice options, and explanations can be switched back and forth between English and தமிழ் anytime during the active examination without resetting your timer or chosen answers.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Why is Google Sign-In required?</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Google Sign-In provides cryptographic proof of student identity, prevents password breaches, and ensures that exam attempts and performance history belong strictly to the authenticated account.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">How is negative marking calculated?</h4>
                <p className="text-xs text-slate-600 mt-1">
                  When enabled, correct answers award full question marks (e.g. +1 or +2), while incorrect answers incur a 25% penalty (-0.25 * marks). Unanswered questions incur 0 penalty.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Who has Administrator privileges?</h4>
                <p className="text-xs text-slate-600 mt-1">
                  By default, designated faculty emails (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">jaanavin03@gmail.com</code>) receive Admin status to create, edit, and delete bilingual questions in the Question Bank.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
