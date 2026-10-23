import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  LayoutDashboard,
  Filter,
  Languages,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { QuizAttempt, QuestionLanguage, Question } from '../../types/index.ts';
import { formatDuration, getPerformanceAppraisal } from '../../utils/quiz-engine.ts';

interface Props {
  attempt: QuizAttempt;
  onRetakeQuiz: () => void;
  onReturnToDashboard: () => void;
}

export const ResultView: React.FC<Props> = ({
  attempt,
  onRetakeQuiz,
  onReturnToDashboard,
}) => {
  const [reviewLanguage, setReviewLanguage] = useState<QuestionLanguage>(attempt.selectedLanguage);
  const [filterMode, setFilterMode] = useState<'ALL' | 'INCORRECT' | 'CORRECT'>('ALL');
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});

  const appraisal = getPerformanceAppraisal(attempt.percentage);

  // Trigger celebration confetti on high scores
  useEffect(() => {
    if (attempt.percentage >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [attempt.percentage]);

  const toggleExplanation = (id: string) => {
    setExpandedExplanations((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredQuestions = attempt.questionSnapshots.filter((q) => {
    const userSelected = attempt.answers[q.id];
    const isCorrect = userSelected === q.correctAnswerIndex;
    if (filterMode === 'CORRECT') return isCorrect;
    if (filterMode === 'INCORRECT') return !isCorrect;
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* Result Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Assessment Completed • {attempt.subjectName}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Examination Result
            </h1>

            <p className="text-slate-600 text-sm max-w-lg leading-relaxed">
              {appraisal.message}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-slate-400" />
                Time: {formatDuration(attempt.timeTakenSeconds)}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-700">
                Negative Marking: {attempt.negativeMarking ? 'Applied (-25%)' : 'None'}
              </span>
            </div>
          </div>

          {/* Big Score Circular Card */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-200 border-4 border-white">
              <span className="text-4xl font-black tracking-tight">{attempt.percentage}%</span>
              <span className="text-xs text-indigo-100 font-medium">
                Score: {attempt.score} / {attempt.maxScore}
              </span>
            </div>
            <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${appraisal.badgeColor}`}>
              Grade: {appraisal.grade} • {appraisal.status}
            </div>
          </div>
        </div>

        {/* Tallies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
            <div className="text-2xl font-black text-emerald-700">{attempt.correctAnswers}</div>
            <div className="text-xs font-semibold text-emerald-800 mt-0.5 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Correct
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
            <div className="text-2xl font-black text-rose-700">{attempt.incorrectAnswers}</div>
            <div className="text-xs font-semibold text-rose-800 mt-0.5 flex items-center justify-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Incorrect
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-2xl font-black text-slate-700">{attempt.unansweredQuestions}</div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5 flex items-center justify-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Unanswered
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
            <div className="text-2xl font-black text-indigo-700">{attempt.totalQuestions}</div>
            <div className="text-xs font-semibold text-indigo-800 mt-0.5 flex items-center justify-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Total Qs
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onReturnToDashboard}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 flex items-center gap-2 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          <button
            onClick={onRetakeQuiz}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake This Quiz</span>
          </button>
        </div>
      </div>

      {/* Question-by-Question Detailed Answer Review */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Question-by-Question Review</h2>
            <p className="text-xs text-slate-500">
              Verify your submitted answers, inspect correct options, and read detailed bilingual explanations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switch for Review */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setReviewLanguage('en')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  reviewLanguage === 'en'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setReviewLanguage('ta')}
                className={`px-3 py-1 rounded-lg font-tamil transition-all ${
                  reviewLanguage === 'ta'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterMode === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({attempt.questionSnapshots.length})
              </button>
              <button
                onClick={() => setFilterMode('CORRECT')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterMode === 'CORRECT' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Correct ({attempt.correctAnswers})
              </button>
              <button
                onClick={() => setFilterMode('INCORRECT')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterMode === 'INCORRECT' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Missed ({attempt.incorrectAnswers + attempt.unansweredQuestions})
              </button>
            </div>
          </div>
        </div>

        {/* Questions Review List */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const userSelected = attempt.answers[q.id];
            const isCorrect = userSelected === q.correctAnswerIndex;
            const isUnanswered = userSelected === undefined || userSelected === null;

            const questionText = reviewLanguage === 'ta' ? q.questionTa : q.questionEn;
            const options = reviewLanguage === 'ta' ? q.optionsTa : q.optionsEn;
            const explanation = reviewLanguage === 'ta' ? q.explanationTa : q.explanationEn;
            const isExpanded = Boolean(expandedExplanations[q.id]);

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl p-6 border transition-all ${
                  isCorrect
                    ? 'border-emerald-200/80 shadow-xs'
                    : isUnanswered
                    ? 'border-slate-200'
                    : 'border-rose-200/80 shadow-xs'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs text-slate-400">
                      [{q.difficulty} • {q.marks} Mark{q.marks > 1 ? 's' : ''}]
                    </span>
                  </div>

                  <div>
                    {isCorrect && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Correct (+{q.marks})</span>
                      </span>
                    )}
                    {!isCorrect && !isUnanswered && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Incorrect {attempt.negativeMarking ? `(-${q.marks * 0.25})` : '(0)'}</span>
                      </span>
                    )}
                    {isUnanswered && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Unanswered (0)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Question */}
                <div className="font-bold text-slate-900 text-base font-tamil mb-4 leading-relaxed">
                  {questionText}
                </div>

                {/* Options Review */}
                <div className="space-y-2 mb-4">
                  {options.map((optText, optIdx) => {
                    const isUserChoice = userSelected === optIdx;
                    const isTheCorrectAnswer = q.correctAnswerIndex === optIdx;

                    let optionBorder = 'border-slate-200 bg-slate-50/50 text-slate-700';

                    if (isTheCorrectAnswer) {
                      optionBorder = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                    } else if (isUserChoice && !isCorrect) {
                      optionBorder = 'border-rose-400 bg-rose-50 text-rose-950 font-semibold';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs sm:text-sm font-tamil flex items-center justify-between gap-3 ${optionBorder}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                            isTheCorrectAnswer
                              ? 'bg-emerald-600 text-white'
                              : isUserChoice
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{optText}</span>
                        </div>

                        <div className="shrink-0 text-xs font-bold flex items-center gap-1.5">
                          {isTheCorrectAnswer && (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Correct Answer
                            </span>
                          )}
                          {isUserChoice && !isTheCorrectAnswer && (
                            <span className="text-rose-600 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Your Choice
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Toggle */}
                {explanation && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => toggleExplanation(q.id)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Explanation' : 'View Explanation & Notes'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 font-tamil leading-relaxed animate-in fade-in">
                        <strong>Explanation: </strong> {explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
