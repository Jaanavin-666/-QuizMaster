import { Subject, Question, QuizAttempt } from '../types/index.ts';
import { INITIAL_SUBJECTS, INITIAL_QUESTIONS } from '../data/seed-questions.ts';

const STORAGE_KEYS = {
  QUESTIONS: 'qm_questions_v1',
  SUBJECTS: 'qm_subjects_v1',
  ATTEMPTS: 'qm_attempts_v1',
  SETTINGS: 'qm_settings_v1',
};

export const storageService = {
  getSubjects(): Subject[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    let subjects: Subject[] = raw ? JSON.parse(raw) : INITIAL_SUBJECTS;
    
    // Enrich with question counts
    const questions = this.getQuestions();
    subjects = subjects.map((sub) => ({
      ...sub,
      totalQuestions: questions.filter((q) => q.subjectId === sub.id && q.active).length,
    }));
    return subjects;
  },

  saveSubjects(subjects: Subject[]): void {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  },

  getQuestions(): Question[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS;
    }
    return JSON.parse(raw);
  },

  saveQuestions(questions: Question[]): void {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  },

  addQuestion(question: Omit<Question, 'id'>): Question {
    const questions = this.getQuestions();
    const newQuestion: Question = {
      ...question,
      id: 'q-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
    };
    questions.push(newQuestion);
    this.saveQuestions(questions);
    return newQuestion;
  },

  updateQuestion(id: string, updates: Partial<Question>): Question | null {
    const questions = this.getQuestions();
    const index = questions.findIndex((q) => q.id === id);
    if (index === -1) return null;
    questions[index] = { ...questions[index], ...updates };
    this.saveQuestions(questions);
    return questions[index];
  },

  deleteQuestion(id: string): boolean {
    const questions = this.getQuestions();
    const filtered = questions.filter((q) => q.id !== id);
    if (filtered.length === questions.length) return false;
    this.saveQuestions(filtered);
    return true;
  },

  getAttempts(userId?: string): QuizAttempt[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    const attempts: QuizAttempt[] = raw ? JSON.parse(raw) : [];
    if (userId) {
      return attempts.filter((a) => a.userId === userId);
    }
    return attempts;
  },

  saveAttempt(attempt: QuizAttempt): void {
    const attempts = this.getAttempts();
    attempts.unshift(attempt); // newest first
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
  },

  getAttemptById(id: string): QuizAttempt | null {
    const attempts = this.getAttempts();
    return attempts.find((a) => a.id === id) || null;
  },

  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
  },
};
