import { Question, QuizConfig, QuizAttempt } from '../types/index.ts';

/**
 * Calculates score, correct/incorrect/unanswered tallies, and percentage for a quiz attempt.
 */
export function calculateQuizScore(
  questions: Question[],
  answers: Record<string, number | null>,
  negativeMarking: boolean = false,
  negativePenaltyRatio: number = 0.25
): {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  score: number;
  maxScore: number;
  percentage: number;
} {
  const totalQuestions = questions.length;
  if (totalQuestions === 0) {
    return {
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      unansweredQuestions: 0,
      score: 0,
      maxScore: 0,
      percentage: 0,
    };
  }

  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unansweredQuestions = 0;
  let rawScore = 0;
  let maxScore = 0;

  for (const q of questions) {
    const marks = q.marks > 0 ? q.marks : 1;
    maxScore += marks;
    const selected = answers[q.id];

    if (selected === undefined || selected === null) {
      unansweredQuestions++;
    } else if (selected === q.correctAnswerIndex) {
      correctAnswers++;
      rawScore += marks;
    } else {
      incorrectAnswers++;
      if (negativeMarking) {
        rawScore -= marks * negativePenaltyRatio;
      }
    }
  }

  // Raw score should not dip below 0
  const finalScore = Math.max(0, Math.round(rawScore * 100) / 100);
  const percentage = maxScore > 0 ? Math.max(0, Math.min(100, Math.round((finalScore / maxScore) * 1000) / 10)) : 0;

  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    unansweredQuestions,
    score: finalScore,
    maxScore,
    percentage,
  };
}

/**
 * Calculates navigation palette counts:
 * - answered
 * - unanswered
 * - markedForReview
 * - markedAndAnswered
 */
export function calculatePaletteStats(
  questions: Question[],
  answers: Record<string, number | null>,
  markedForReview: Record<string, boolean>
) {
  let answered = 0;
  let unanswered = 0;
  let marked = 0;
  let markedAndAnswered = 0;

  for (const q of questions) {
    const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
    const isMarked = !!markedForReview[q.id];

    if (isMarked && isAnswered) {
      markedAndAnswered++;
    } else if (isMarked) {
      marked++;
    } else if (isAnswered) {
      answered++;
    } else {
      unanswered++;
    }
  }

  return {
    answered,
    unanswered,
    marked,
    markedAndAnswered,
    total: questions.length,
  };
}

/**
 * Format duration into "Xm Ys" or "Xs"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

/**
 * Format time remaining in "MM:SS"
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Filter questions based on configuration (subject, difficulty, count, shuffle)
 */
export function filterQuestions(
  allQuestions: Question[],
  config: QuizConfig
): Question[] {
  let filtered = allQuestions.filter(
    (q) => q.active && q.subjectId === config.subjectId
  );

  if (config.difficulty !== 'ALL') {
    filtered = filtered.filter((q) => q.difficulty === config.difficulty);
  }

  if (config.shuffleQuestions) {
    filtered = shuffleArray([...filtered]);
  }

  if (config.questionCount > 0 && filtered.length > config.questionCount) {
    filtered = filtered.slice(0, config.questionCount);
  }

  return filtered;
}

/**
 * Fisher-Yates array shuffle
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Decodes Google OpenID Connect JWT payload safely without external dependencies
 */
export function decodeGoogleJwt(jwtToken: string): {
  sub?: string;
  name?: string;
  email?: string;
  picture?: string;
  email_verified?: boolean;
} | null {
  try {
    const parts = jwtToken.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT payload:', e);
    return null;
  }
}

/**
 * Determine letter grade and appraisal message
 */
export function getPerformanceAppraisal(percentage: number): {
  grade: string;
  status: 'OUTSTANDING' | 'EXCELLENT' | 'GOOD' | 'NEEDS_PRACTICE';
  message: string;
  badgeColor: string;
} {
  if (percentage >= 90) {
    return {
      grade: 'A+',
      status: 'OUTSTANDING',
      message: 'Mastery achieved! Flawless knowledge and outstanding precision.',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
  } else if (percentage >= 75) {
    return {
      grade: 'A',
      status: 'EXCELLENT',
      message: 'Great job! Strong command of the concepts and topics tested.',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    };
  } else if (percentage >= 50) {
    return {
      grade: 'B',
      status: 'GOOD',
      message: 'Passing score achieved. Review the explanations to reinforce weaker areas.',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    };
  } else {
    return {
      grade: 'C',
      status: 'NEEDS_PRACTICE',
      message: 'Keep going! Re-read the question explanations and try another round.',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    };
  }
}
