import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Languages,
  Send,
  HelpCircle,
  X,
} from 'lucide-react';
import { Question, QuestionLanguage, QuizConfig, QuizAttempt } from '../../types/index.ts';
import { formatTimeRemaining, calculatePaletteStats } from '../../utils/quiz-engine.ts';

interface Props {
  questions: Question[];
  config: QuizConfig;
  subjectName: string;
  onFinishQuiz: (
    answers: Record<string, number | null>,
    markedForReview: Record<string, boolean>,
    timeTakenSeconds: number,
    finalLanguage: QuestionLanguage
  ) => void;
  onExitQuiz: () => void;
}

export const ExamInterface: React.FC<Props> = ({
  questions,
  config,
  subjectName,
  onFinishQuiz,
  onExitQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [currentLanguage, setCurrentLanguage] = useState<QuestionLanguage>(config.language);
  const [timeRemaining, setTimeRemaining] = useState<number>(config.timeLimitMinutes * 60);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto submission when timer hits zero
  const triggerSubmission = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const timeSpent = Math.max(1, config.timeLimitMinutes * 60 - timeRemaining);
    onFinishQuiz(answers, markedForReview, timeSpent, currentLanguage);
  }, [isSubmitting, config.timeLimitMinutes, timeRemaining, answers, markedForReview, currentLanguage, onFinishQuiz]);

  // Countdown Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          triggerSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [triggerSubmission]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSubmitModal || showExitConfirm) return;
      if (['1', '2', '3', '4'].includes(e.key)) {
        const optionIndex = parseInt(e.key, 10) - 1;
        handleSelectOption(optionIndex);
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') {
        if (currentIndex < totalQuestions - 1) setCurrentIndex((p) => p + 1);
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'p') {
        if (currentIndex > 0) setCurrentIndex((p) => p - 1);
      } else if (e.key.toLowerCase() === 'm') {
        toggleMarkForReview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalQuestions, showSubmitModal, showExitConfirm, currentQuestion]);

  const handleSelectOption = (index: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: prev[currentQuestion.id] === index ? null : index, // click again deselects
    }));
  };

  const toggleMarkForReview = () => {
    if (!currentQuestion) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const paletteStats = calculatePaletteStats(questions, answers, markedForReview);

  // Time warning styling (< 2 min = yellow, < 30 sec = pulse red)
  const isUrgent = timeRemaining <= 30;
  const isWarning = timeRemaining <= 120 && !isUrgent;

  if (!currentQuestion) {
    return <div className="p-8 text-center text-slate-500">Loading examination...</div>;
  }

  // Active question text and options based on current language
  const questionText = currentLanguage === 'ta' ? currentQuestion.questionTa : currentQuestion.questionEn;
  const options = currentLanguage === 'ta' ? currentQuestion.optionsTa : currentQuestion.optionsEn;
  const selectedOptionIndex = answers[currentQuestion.id] ?? null;
  const isMarked = Boolean(markedForReview[currentQuestion.id]);

  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Top Examination HUD */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-20 z-30">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            Active Examination
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">{subjectName}</h2>
        </div>

        {/* Center: Language Switch (English / தமிழ்) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCurrentLanguage('en')}
              className={`px-3 py-1 rounded-lg transition-all ${
                currentLanguage === 'en'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setCurrentLanguage('ta')}
              className={`px-3 py-1 rounded-lg font-tamil transition-all ${
                currentLanguage === 'ta'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>

        {/* Right: Countdown Timer & Submit */}
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base ${
              isUrgent
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : isWarning
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-slate-50 text-slate-800 border-slate-200'
            }`}
            title="Time remaining"
          >
            <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-500'}`} />
            <span>{formatTimeRemaining(timeRemaining)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Quiz</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Main Examination Grid: Question on Left, Palette on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Question & Options (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            
            {/* Question Counter & Meta */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  [{currentQuestion.difficulty} • {currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}]
                </span>
              </div>

              <button
                type="button"
                onClick={toggleMarkForReview}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  isMarked
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isMarked ? 'fill-purple-600 text-purple-600' : 'text-slate-400'}`} />
                <span>{isMarked ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed min-h-[60px] font-tamil">
              {questionText}
            </div>

            {/* Multiple Choice Options (A, B, C, D) */}
            <div className="space-y-3 pt-2">
              {options.map((optText, idx) => {
                const isSelected = selectedOptionIndex === idx;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 group cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm sm:text-base font-tamil font-medium pt-0.5 leading-normal">
                      {optText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs text-slate-400 hidden sm:block">
                Press <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded font-mono text-[10px]">1-4</kbd> to answer, <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded font-mono text-[10px]">N</kbd> next
              </div>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((p) => Math.min(totalQuestions - 1, p + 1))}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Quiz</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Question Palette & Legend (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-sm">Question Navigation Palette</h3>

            {/* Palette Buttons Grid */}
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
                const isMark = Boolean(markedForReview[q.id]);
                const isCurrent = currentIndex === idx;

                let btnStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'; // unanswered

                if (isMark && isAnswered) {
                  btnStyle = 'bg-purple-600 text-white font-bold ring-2 ring-emerald-400';
                } else if (isMark) {
                  btnStyle = 'bg-purple-500 text-white font-bold';
                } else if (isAnswered) {
                  btnStyle = 'bg-emerald-600 text-white font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center transition-all relative ${btnStyle} ${
                      isCurrent ? 'ring-3 ring-indigo-500/50 scale-105 shadow-sm' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isMark && isAnswered && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-300"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Palette Status Legend */}
            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-600"></span>
                  <span className="text-slate-600">Answered</span>
                </div>
                <span className="font-bold text-slate-800">{paletteStats.answered + paletteStats.markedAndAnswered}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-slate-200"></span>
                  <span className="text-slate-600">Unanswered</span>
                </div>
                <span className="font-bold text-slate-800">{paletteStats.unanswered}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-purple-500"></span>
                  <span className="text-slate-600">Marked for Review</span>
                </div>
                <span className="font-bold text-slate-800">{paletteStats.marked}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-purple-600 ring-1 ring-emerald-400"></span>
                  <span className="text-slate-600">Marked & Answered</span>
                </div>
                <span className="font-bold text-slate-800">{paletteStats.markedAndAnswered}</span>
              </div>
            </div>

            {/* Exit Early Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(true)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-center"
              >
                Quit Examination Early
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Confirm Final Submission</h3>
              <p className="text-xs text-slate-500">
                Are you ready to submit your answers? Review your progress below.
              </p>
            </div>

            {/* Summary statistics */}
            <div className="grid grid-cols-3 gap-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
              <div>
                <div className="text-lg font-black text-emerald-600">
                  {paletteStats.answered + paletteStats.markedAndAnswered}
                </div>
                <div className="text-[11px] text-slate-500">Answered</div>
              </div>
              <div>
                <div className="text-lg font-black text-slate-600">{paletteStats.unanswered}</div>
                <div className="text-[11px] text-slate-500">Unanswered</div>
              </div>
              <div>
                <div className="text-lg font-black text-purple-600">
                  {paletteStats.marked + paletteStats.markedAndAnswered}
                </div>
                <div className="text-[11px] text-slate-500">Marked</div>
              </div>
            </div>

            {paletteStats.unanswered > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>You have <strong>{paletteStats.unanswered}</strong> unanswered question{paletteStats.unanswered > 1 ? 's' : ''}.</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              >
                Back to Exam
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={triggerSubmission}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors"
              >
                {isSubmitting ? 'Evaluating...' : 'Yes, Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quit Early Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Discard Current Exam?</h3>
            <p className="text-xs text-slate-500">
              Exiting now will cancel this attempt and return you to the dashboard without recording a score.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
              >
                Keep Going
              </button>
              <button
                onClick={onExitQuiz}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
