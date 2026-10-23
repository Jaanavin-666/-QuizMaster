import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateQuizScore,
  calculatePaletteStats,
  formatDuration,
  formatTimeRemaining,
  filterQuestions,
  getPerformanceAppraisal,
} from './quiz-engine.ts';
import { Question } from '../types/index.ts';

const mockQuestions: Question[] = [
  {
    id: 'q1',
    subjectId: 'sub-gk',
    questionEn: 'What is the capital of India?',
    questionTa: 'இந்தியாவின் தலைநகரம் எது?',
    optionsEn: ['Chennai', 'New Delhi', 'Mumbai', 'Kolkata'],
    optionsTa: ['சென்னை', 'புது டெல்லி', 'மும்பை', 'கொல்கத்தா'],
    correctAnswerIndex: 1,
    difficulty: 'EASY',
    marks: 1,
    explanationEn: 'New Delhi is the official capital of India.',
    explanationTa: 'புது டெல்லி இந்தியாவின் அதிகாரப்பூர்வ தலைநகரமாகும்.',
    active: true,
  },
  {
    id: 'q2',
    subjectId: 'sub-gk',
    questionEn: 'Which is the longest river in India?',
    questionTa: 'இந்தியாவின் மிக நீளமான நதி எது?',
    optionsEn: ['Yamuna', 'Ganges', 'Godavari', 'Brahmaputra'],
    optionsTa: ['யமுனை', 'கங்கை', 'கோதாவரி', 'பிரம்மபுத்திரா'],
    correctAnswerIndex: 1,
    difficulty: 'MEDIUM',
    marks: 2,
    explanationEn: 'The Ganges is the longest river in India.',
    explanationTa: 'கங்கை இந்தியாவின் மிக நீளமான நதியாகும்.',
    active: true,
  },
  {
    id: 'q3',
    subjectId: 'sub-gk',
    questionEn: 'Who is known as the father of Indian Constitution?',
    questionTa: 'இந்திய அரசியலமைப்பின் தந்தை என அழைக்கப்படுபவர் யார்?',
    optionsEn: ['Mahatma Gandhi', 'Dr. B.R. Ambedkar', 'Jawaharlal Nehru', 'Sardar Patel'],
    optionsTa: ['மகாத்மா காந்தி', 'டாக்டர் பி.ஆர். அம்பேத்கர்', 'ஜவஹர்லால் நேரு', 'சர்தார் படேல்'],
    correctAnswerIndex: 1,
    difficulty: 'HARD',
    marks: 2,
    explanationEn: 'Dr. B.R. Ambedkar was the chief architect of the Indian Constitution.',
    explanationTa: 'டாக்டர் பி.ஆர். அம்பேத்கர் இந்திய அரசியலமைப்பின் தலைமை சிற்பி ஆவார்.',
    active: true,
  },
];

test('calculateQuizScore with all correct answers', () => {
  const answers = { q1: 1, q2: 1, q3: 1 };
  const res = calculateQuizScore(mockQuestions, answers, false);

  assert.equal(res.totalQuestions, 3);
  assert.equal(res.correctAnswers, 3);
  assert.equal(res.incorrectAnswers, 0);
  assert.equal(res.unansweredQuestions, 0);
  assert.equal(res.score, 5); // 1 + 2 + 2
  assert.equal(res.maxScore, 5);
  assert.equal(res.percentage, 100);
});

test('calculateQuizScore with incorrect and unanswered, negative marking enabled', () => {
  // q1 correct (1 mark), q2 wrong (-0.5 marks), q3 unanswered (0)
  const answers = { q1: 1, q2: 0 };
  const res = calculateQuizScore(mockQuestions, answers, true, 0.25);

  assert.equal(res.totalQuestions, 3);
  assert.equal(res.correctAnswers, 1);
  assert.equal(res.incorrectAnswers, 1);
  assert.equal(res.unansweredQuestions, 1);
  assert.equal(res.score, 0.5); // 1 - 2*0.25 = 0.5
  assert.equal(res.maxScore, 5);
  assert.equal(res.percentage, 10);
});

test('calculatePaletteStats tracks answered, unanswered, and marked flags', () => {
  const answers = { q1: 1, q2: null };
  const marked = { q2: true, q3: true };
  const stats = calculatePaletteStats(mockQuestions, answers, marked);

  assert.equal(stats.answered, 1); // q1 answered
  assert.equal(stats.unanswered, 0); // all others are marked
  assert.equal(stats.marked, 2); // q2 and q3 marked for review without answer
  assert.equal(stats.total, 3);
});

test('formatDuration and formatTimeRemaining work accurately', () => {
  assert.equal(formatDuration(0), '0s');
  assert.equal(formatDuration(45), '45s');
  assert.equal(formatDuration(120), '2m');
  assert.equal(formatDuration(155), '2m 35s');

  assert.equal(formatTimeRemaining(0), '00:00');
  assert.equal(formatTimeRemaining(65), '01:05');
  assert.equal(formatTimeRemaining(600), '10:00');
});

test('filterQuestions respects subject and difficulty filters', () => {
  const filtered = filterQuestions(mockQuestions, {
    subjectId: 'sub-gk',
    language: 'en',
    questionCount: 2,
    difficulty: 'EASY',
    timeLimitMinutes: 10,
    shuffleQuestions: false,
    negativeMarking: false,
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'q1');
});

test('getPerformanceAppraisal assigns correct tiers', () => {
  assert.equal(getPerformanceAppraisal(95).grade, 'A+');
  assert.equal(getPerformanceAppraisal(80).grade, 'A');
  assert.equal(getPerformanceAppraisal(60).grade, 'B');
  assert.equal(getPerformanceAppraisal(40).grade, 'C');
});
