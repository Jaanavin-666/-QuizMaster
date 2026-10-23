import React, { useState, useEffect } from 'react';
import { User, Subject, Question, QuizConfig, QuizAttempt, QuestionLanguage } from './types/index.ts';
import { authService } from './services/auth-service.ts';
import { storageService } from './services/storage-service.ts';
import { filterQuestions, calculateQuizScore } from './utils/quiz-engine.ts';

// Views and Modals
import { AuthPage } from './components/auth/AuthPage.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { SubjectsView } from './components/subjects/SubjectsView.tsx';
import { QuizConfigModal } from './components/quiz/QuizConfigModal.tsx';
import { ExamInterface } from './components/quiz/ExamInterface.tsx';
import { ResultView } from './components/quiz/ResultView.tsx';
import { MyResultsView } from './components/results/MyResultsView.tsx';
import { AdminDashboardView } from './components/admin/AdminDashboardView.tsx';
import { UserProfileView } from './components/profile/UserProfileView.tsx';
import { EditProfileView } from './components/profile/EditProfileView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { GoogleSetupGuideModal } from './components/google-oauth/GoogleSetupGuideModal.tsx';
import { SpringBootCodeModal } from './components/backend-docs/SpringBootCodeModal.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [globalLanguage, setGlobalLanguage] = useState<QuestionLanguage>('en');

  // Database State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  // Active Quiz State
  const [configuringSubject, setConfiguringSubject] = useState<Subject | null>(null);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[]>([]);
  const [activeQuizConfig, setActiveQuizConfig] = useState<QuizConfig | null>(null);
  const [activeAttemptResult, setActiveAttemptResult] = useState<QuizAttempt | null>(null);

  // Global Modals
  const [showSpringBootModal, setShowSpringBootModal] = useState(false);
  const [showGoogleGuideModal, setShowGoogleGuideModal] = useState(false);

  // Load initial data
  useEffect(() => {
    const user = authService.getCurrentUser();
    
    // Support ?autostart=1 for headless testing automation (ultra-mode requirement)
    const urlParams = new URLSearchParams(window.location.search);
    if (!user && urlParams.get('autostart') === '1') {
      const autoUser: User = {
        id: 'usr-admin-8821',
        googleSub: '109823471928374619283',
        name: 'Prof. A. Ramanathan (Faculty Admin)',
        email: 'jaanavin03@gmail.com',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        emailVerified: true,
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        accountStatus: 'ACTIVE',
      };
      authService.establishSession(autoUser);
      setCurrentUser(autoUser);
    } else {
      setCurrentUser(user);
    }

    refreshData();
  }, []);

  const refreshData = () => {
    const loadedSubjects = storageService.getSubjects();
    const loadedQuestions = storageService.getQuestions();
    const loadedAttempts = storageService.getAttempts();
    setSubjects(loadedSubjects);
    setQuestions(loadedQuestions);
    setAttempts(loadedAttempts);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
    refreshData();
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView('dashboard');
    setActiveQuizConfig(null);
    setActiveAttemptResult(null);
  };

  const handleSelectSubject = (subject: Subject) => {
    setConfiguringSubject(subject);
  };

  const handleStartQuiz = (config: QuizConfig) => {
    const filtered = filterQuestions(questions, config);
    if (filtered.length === 0) return;

    setActiveQuizQuestions(filtered);
    setActiveQuizConfig(config);
    setConfiguringSubject(null);
    setCurrentView('exam');
  };

  const handleFinishQuiz = (
    userAnswers: Record<string, number | null>,
    markedForReview: Record<string, boolean>,
    timeTakenSeconds: number,
    finalLanguage: QuestionLanguage
  ) => {
    if (!currentUser || !activeQuizConfig) return;

    const subject = subjects.find((s) => s.id === activeQuizConfig.subjectId);
    const scoreResult = calculateQuizScore(activeQuizQuestions, userAnswers, activeQuizConfig.negativeMarking);

    const newAttempt: QuizAttempt = {
      id: 'atm-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      subjectId: activeQuizConfig.subjectId,
      subjectName: subject?.name || 'Subject Exam',
      selectedLanguage: finalLanguage,
      totalQuestions: scoreResult.totalQuestions,
      correctAnswers: scoreResult.correctAnswers,
      incorrectAnswers: scoreResult.incorrectAnswers,
      unansweredQuestions: scoreResult.unansweredQuestions,
      score: scoreResult.score,
      maxScore: scoreResult.maxScore,
      percentage: scoreResult.percentage,
      timeTakenSeconds,
      totalTimeSeconds: activeQuizConfig.timeLimitMinutes * 60,
      startedAt: new Date(Date.now() - timeTakenSeconds * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
      answers: userAnswers,
      markedForReview,
      questionSnapshots: activeQuizQuestions,
      negativeMarking: activeQuizConfig.negativeMarking,
    };

    storageService.saveAttempt(newAttempt);
    setAttempts((prev) => [newAttempt, ...prev]);
    setActiveAttemptResult(newAttempt);
    setCurrentView('result');
  };

  const handleRetakeActiveQuiz = () => {
    if (activeAttemptResult) {
      const subject = subjects.find((s) => s.id === activeAttemptResult.subjectId);
      if (subject) {
        setConfiguringSubject(subject);
      }
    }
  };

  const handleOpenAttemptReview = (attempt: QuizAttempt) => {
    setActiveAttemptResult(attempt);
    setCurrentView('result');
  };

  const handleToggleUserRole = () => {
    if (!currentUser) return;
    const updated = authService.toggleUserRole(currentUser.id);
    if (updated) setCurrentUser({ ...updated });
  };

  const handlePromoteToAdmin = () => {
    if (!currentUser) return;
    authService.addAdminEmail(currentUser.email);
    const updated = authService.toggleUserRole(currentUser.id);
    if (updated) setCurrentUser({ ...updated, role: 'ADMIN' });
  };

  const handleResetFactoryDefaults = () => {
    storageService.resetToDefaults();
    refreshData();
  };

  // If visitor is unauthenticated, show the upgraded AuthPage with interactive particle canvas
  if (!currentUser) {
    return (
      <ThemeProvider>
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        {/* Top Navbar */}
        <Navbar
          user={currentUser}
          currentView={currentView}
          onNavigate={(view) => {
            if (currentView === 'exam') {
              if (window.confirm('Active examination in progress. Exiting will discard your current attempt. Proceed?')) {
                setCurrentView(view);
                setActiveQuizConfig(null);
              }
            } else {
              setCurrentView(view);
            }
          }}
          onLogout={handleLogout}
          globalLanguage={globalLanguage}
          onToggleGlobalLanguage={(lang) => setGlobalLanguage(lang)}
          onOpenSpringBootModal={() => setShowSpringBootModal(true)}
          onOpenGoogleGuideModal={() => setShowGoogleGuideModal(true)}
        />

        {/* Main Body Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* View: Dashboard */}
          {currentView === 'dashboard' && (
            <DashboardView
              user={currentUser}
              subjects={subjects}
              attempts={attempts}
              onSelectSubject={handleSelectSubject}
              onNavigate={(v) => setCurrentView(v)}
              globalLanguage={globalLanguage}
              onToggleLanguage={(l) => setGlobalLanguage(l)}
              onOpenAttemptReview={handleOpenAttemptReview}
            />
          )}

          {/* View: Subjects Directory */}
          {currentView === 'subjects' && (
            <SubjectsView
              subjects={subjects}
              onSelectSubject={handleSelectSubject}
            />
          )}

          {/* View: Active Examination */}
          {currentView === 'exam' && activeQuizConfig && (
            <ExamInterface
              questions={activeQuizQuestions}
              config={activeQuizConfig}
              subjectName={subjects.find((s) => s.id === activeQuizConfig.subjectId)?.name || 'Examination'}
              onFinishQuiz={handleFinishQuiz}
              onExitQuiz={() => {
                setActiveQuizConfig(null);
                setCurrentView('dashboard');
              }}
            />
          )}

          {/* View: Quiz Result & Answer Review */}
          {currentView === 'result' && activeAttemptResult && (
            <ResultView
              attempt={activeAttemptResult}
              onRetakeQuiz={handleRetakeActiveQuiz}
              onReturnToDashboard={() => setCurrentView('dashboard')}
            />
          )}

          {/* View: Results History */}
          {currentView === 'results' && (
            <MyResultsView
              attempts={attempts}
              subjects={subjects}
              onOpenAttemptReview={handleOpenAttemptReview}
              onRetakeSubject={(subId) => {
                const sub = subjects.find((s) => s.id === subId);
                if (sub) setConfiguringSubject(sub);
              }}
            />
          )}

          {/* View: Admin Question Bank */}
          {currentView === 'admin' && (
            <AdminDashboardView
              user={currentUser}
              subjects={subjects}
              questions={questions}
              onAddQuestion={(newQ) => {
                storageService.addQuestion(newQ);
                refreshData();
              }}
              onUpdateQuestion={(id, updates) => {
                storageService.updateQuestion(id, updates);
                refreshData();
              }}
              onDeleteQuestion={(id) => {
                storageService.deleteQuestion(id);
                refreshData();
              }}
              onPromoteToAdmin={handlePromoteToAdmin}
            />
          )}

          {/* View: User Profile */}
          {currentView === 'profile' && (
            <UserProfileView
              user={currentUser}
              attempts={attempts}
              onOpenGoogleGuideModal={() => setShowGoogleGuideModal(true)}
              onNavigateToEditProfile={() => setCurrentView('edit-profile')}
            />
          )}

          {/* View: Edit User Profile & Avatar Gallery Picker */}
          {currentView === 'edit-profile' && (
            <EditProfileView
              user={currentUser}
              onProfileUpdated={(updated) => {
                setCurrentUser(updated);
                setCurrentView('profile');
              }}
              onCancel={() => setCurrentView('profile')}
            />
          )}

          {/* View: System Settings */}
          {currentView === 'settings' && (
            <SettingsView
              user={currentUser}
              globalLanguage={globalLanguage}
              onToggleGlobalLanguage={(l) => setGlobalLanguage(l)}
              onToggleUserRole={handleToggleUserRole}
              onResetFactoryDefaults={handleResetFactoryDefaults}
              onOpenSpringBootModal={() => setShowSpringBootModal(true)}
              onOpenGoogleGuideModal={() => setShowGoogleGuideModal(true)}
              onNavigateToEditProfile={() => setCurrentView('edit-profile')}
            />
          )}
        </main>

        {/* Quiz Configuration Modal */}
        <QuizConfigModal
          isOpen={Boolean(configuringSubject)}
          subject={configuringSubject}
          allQuestions={questions}
          onClose={() => setConfiguringSubject(null)}
          onStartQuiz={handleStartQuiz}
          initialLanguage={globalLanguage}
        />

        {/* Java 21 Spring Boot Code Viewer Modal */}
        <SpringBootCodeModal
          isOpen={showSpringBootModal}
          onClose={() => setShowSpringBootModal(false)}
        />

        {/* Google Cloud OAuth 2.0 Setup Guide Modal */}
        <GoogleSetupGuideModal
          isOpen={showGoogleGuideModal}
          onClose={() => setShowGoogleGuideModal(false)}
        />
      </div>
    </ThemeProvider>
  );
}
