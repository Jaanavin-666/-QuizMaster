import React from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Coffee,
  Terminal,
  Binary,
  Cpu,
  Calculator,
  Atom,
  Server,
  TrendingUp,
  Compass,
  Landmark,
  MapPin,
  Globe,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Subject, QuizAttempt, QuestionLanguage, User } from '../../types/index.ts';

interface Props {
  user: User;
  subjects: Subject[];
  attempts: QuizAttempt[];
  onSelectSubject: (subject: Subject) => void;
  onNavigate: (view: string) => void;
  globalLanguage: QuestionLanguage;
  onToggleLanguage: (lang: QuestionLanguage) => void;
  onOpenAttemptReview: (attempt: QuizAttempt) => void;
}

// Icon mapper for subject cards
const getSubjectIcon = (iconName: string) => {
  switch (iconName) {
    case 'Coffee': return Coffee;
    case 'Terminal': return Terminal;
    case 'Binary': return Binary;
    case 'Cpu': return Cpu;
    case 'Calculator': return Calculator;
    case 'Atom': return Atom;
    case 'Server': return Server;
    case 'BookOpen': return BookOpen;
    case 'TrendingUp': return TrendingUp;
    case 'Compass': return Compass;
    case 'Landmark': return Landmark;
    case 'MapPin': return MapPin;
    default: return Globe;
  }
};

export const DashboardView: React.FC<Props> = ({
  user,
  subjects,
  attempts,
  onSelectSubject,
  onNavigate,
  globalLanguage,
  onToggleLanguage,
  onOpenAttemptReview,
}) => {
  // Aggregate stats
  const totalQuestions = subjects.reduce((sum, s) => sum + (s.totalQuestions || 0), 0);
  const completedCount = attempts.length;
  const avgScore = completedCount > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / completedCount)
    : 0;
  
  const recentAttempts = attempts.slice(0, 3);
  const gkSubject = subjects.find((s) => s.id === 'sub-gk');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-8 sm:p-10 text-white shadow-xl shadow-indigo-500/10">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
          <GraduationCap className="w-full h-full transform translate-x-1/4 -translate-y-1/4" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-indigo-100 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, {user.name.split(' ')[0]}!</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Test Your Knowledge. <br />
            <span className="text-indigo-200">Unlock Your Potential.</span>
          </h1>

          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Sharpen your concepts across computer science, engineering, competitive aptitude, and general knowledge. Seamlessly toggle between English and <span className="font-tamil font-semibold text-indigo-200">தமிழ்</span> at any moment during the test.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('subjects')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              <span>Start a Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('results')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-900/40 hover:bg-indigo-900/60 text-white font-semibold text-sm rounded-xl border border-white/20 backdrop-blur-md transition-all"
            >
              <Award className="w-4 h-4" />
              <span>View Past Results</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Subjects</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{subjects.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">13 Core academic areas</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Question Bank</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{totalQuestions}</div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">100% Bilingual verified</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quizzes Completed</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{completedCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">{completedCount === 0 ? 'Take your first quiz!' : 'Attempts logged'}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Score</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{avgScore}%</div>
            <div className="text-xs text-slate-500 mt-0.5">{completedCount > 0 ? 'Across all subjects' : 'No data yet'}</div>
          </div>
        </div>
      </div>

      {/* Quick-Access General Knowledge Section */}
      {gkSubject && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
              Quick Practice
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-600" />
              <span>General Knowledge & Current Affairs Spotlight</span>
            </h3>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              Fast-paced questions covering Indian Constitution, Space Exploration (Chandrayaan-3), World Geography, Science, and Global Organizations.
            </p>
          </div>
          <button
            onClick={() => onSelectSubject(gkSubject)}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>Start GK Quiz</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Featured Subjects Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Explore Examination Subjects</h2>
            <p className="text-xs text-slate-500">Select any subject to configure questions, difficulty, and timer.</p>
          </div>
          <button
            onClick={() => onNavigate('subjects')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All ({subjects.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subjects.map((subject) => {
            const Icon = getSubjectIcon(subject.iconName);
            const qCount = subject.totalQuestions || 0;
            return (
              <div
                key={subject.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                      {subject.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    {subject.name}
                  </h3>
                  {subject.nameTa && (
                    <div className="text-xs text-indigo-600 font-tamil font-medium">
                      {subject.nameTa}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {subject.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    <strong className="text-slate-800">{qCount}</strong> Questions
                  </span>
                  <button
                    onClick={() => onSelectSubject(subject)}
                    disabled={qCount === 0}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                  >
                    <span>Start</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Quiz Attempts Preview */}
      {recentAttempts.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Recent Activity</h2>
            <button
              onClick={() => onNavigate('results')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              View Full History
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
            {recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    attempt.percentage >= 75
                      ? 'bg-emerald-100 text-emerald-800'
                      : attempt.percentage >= 50
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {attempt.percentage}%
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{attempt.subjectName}</h4>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{attempt.totalQuestions} questions</span>
                      <span>•</span>
                      <span>{new Date(attempt.submittedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-600">{attempt.selectedLanguage === 'ta' ? 'தமிழ்' : 'English'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onOpenAttemptReview(attempt)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl border border-indigo-200 transition-colors"
                  >
                    Review Answers
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
