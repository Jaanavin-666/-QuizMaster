export type UserRole = 'STUDENT' | 'ADMIN';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  googleSub?: string; // Google stable subject identifier (sub claim) if Google login
  authProvider: 'google' | 'email';
  name: string;
  email: string;
  picture: string;
  customAvatarUrl?: string;
  passwordHash?: string;
  passwordSalt?: string;
  emailVerified: boolean;
  role: UserRole;
  createdAt: string;
  lastLogin: string;
  accountStatus: 'ACTIVE' | 'SUSPENDED';
  themePreference?: ThemeMode;
}

export type SubjectCategory = 'PROGRAMMING' | 'ACADEMICS' | 'COMPETITIVE' | 'GENERAL';

export interface Subject {
  id: string;
  name: string;
  nameTa?: string;
  description: string;
  iconName: string;
  category: SubjectCategory;
  active: boolean;
  totalQuestions?: number;
}

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Question {
  id: string;
  subjectId: string;
  subCategory?: string; // e.g. for GK: "Indian GK", "World Geography", "Science"
  questionEn: string;
  questionTa: string;
  optionsEn: [string, string, string, string];
  optionsTa: [string, string, string, string];
  correctAnswerIndex: number; // 0, 1, 2, or 3
  difficulty: QuestionDifficulty;
  marks: number;
  explanationEn: string;
  explanationTa: string;
  active: boolean;
}

export type QuestionLanguage = 'en' | 'ta';

export interface QuizConfig {
  subjectId: string;
  language: QuestionLanguage;
  questionCount: number;
  difficulty: 'ALL' | QuestionDifficulty;
  timeLimitMinutes: number;
  shuffleQuestions: boolean;
  negativeMarking: boolean;
}

export interface QuizAttemptAnswer {
  questionId: string;
  selectedAnswerIndex: number | null; // 0-3 or null
  isMarkedForReview: boolean;
  isCorrect: boolean;
  marksAwarded: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subjectId: string;
  subjectName: string;
  selectedLanguage: QuestionLanguage;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  score: number;
  maxScore: number;
  percentage: number;
  timeTakenSeconds: number;
  totalTimeSeconds: number;
  startedAt: string;
  submittedAt: string;
  answers: Record<string, number | null>;
  markedForReview: Record<string, boolean>;
  questionSnapshots: Question[];
  negativeMarking: boolean;
}

export interface OAuthConfig {
  clientId: string;
  isConfigured: boolean;
  environment: 'development' | 'production';
  redirectUri: string;
}
