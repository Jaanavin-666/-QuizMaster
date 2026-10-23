import React, { useState } from 'react';
import {
  X,
  Play,
  Clock,
  HelpCircle,
  Shuffle,
  ShieldAlert,
  Layers,
  Languages,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
} from 'lucide-react';
import { Subject, QuizConfig, QuestionDifficulty, QuestionLanguage, Question } from '../../types/index.ts';

interface Props {
  isOpen: boolean;
  subject: Subject | null;
  allQuestions: Question[];
  onClose: () => void;
  onStartQuiz: (config: QuizConfig) => void;
  initialLanguage: QuestionLanguage;
}

export const QuizConfigModal: React.FC<Props> = ({
  isOpen,
  subject,
  allQuestions,
  onClose,
  onStartQuiz,
  initialLanguage,
}) => {
  if (!isOpen || !subject) return null;

  const subjectQuestions = allQuestions.filter((q) => q.subjectId === subject.id && q.active);

  const [language, setLanguage] = useState<QuestionLanguage>(initialLanguage);
  const [questionCount, setQuestionCount] = useState<number>(Math.min(5, subjectQuestions.length || 5));
  const [difficulty, setDifficulty] = useState<'ALL' | QuestionDifficulty>('ALL');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(5);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [negativeMarking, setNegativeMarking] = useState<boolean>(false);

  // Compute matching questions count based on current difficulty
  const availableQuestions = subjectQuestions.filter(
    (q) => difficulty === 'ALL' || q.difficulty === difficulty
  );

  const maxSelectable = availableQuestions.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (availableQuestions.length === 0) return;

    const finalCount = questionCount === -1 ? availableQuestions.length : Math.min(questionCount, availableQuestions.length);

    onStartQuiz({
      subjectId: subject.id,
      language,
      questionCount: finalCount,
      difficulty,
      timeLimitMinutes,
      shuffleQuestions,
      negativeMarking,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-indigo-100 text-[10px] font-bold uppercase tracking-wider mb-1">
              Examination Setup
            </div>
            <h2 className="text-xl font-bold">{subject.name}</h2>
            {subject.nameTa && (
              <p className="text-xs text-indigo-100 font-tamil mt-0.5">{subject.nameTa}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close configuration modal"
            className="p-2 text-indigo-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Question Language */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-indigo-600" />
              <span>Initial Question Language</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  language === 'en'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>English</span>
                {language === 'en' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold font-tamil transition-all flex items-center justify-center gap-2 ${
                  language === 'ta'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>தமிழ் (Tamil)</span>
                {language === 'ta' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              You can still toggle between English and <span className="font-tamil font-semibold text-indigo-600">தமிழ்</span> at any second during the examination.
            </p>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Question Difficulty</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'ALL', label: 'All Levels' },
                { id: 'EASY', label: 'Easy' },
                { id: 'MEDIUM', label: 'Medium' },
                { id: 'HARD', label: 'Hard' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => {
                    setDifficulty(diff.id as any);
                  }}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    difficulty === diff.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileQuestion className="w-4 h-4 text-indigo-600" />
                <span>Number of Questions</span>
              </label>
              <span className="text-xs text-slate-500 font-medium">
                Pool Available: <strong className="text-indigo-600">{maxSelectable}</strong>
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, -1].map((count) => {
                const isAll = count === -1;
                const label = isAll ? 'All' : count.toString();
                const isSelected = questionCount === count;
                const isDisabled = !isAll && count > maxSelectable && maxSelectable > 0;

                return (
                  <button
                    key={label}
                    type="button"
                    disabled={isDisabled || maxSelectable === 0}
                    onClick={() => setQuestionCount(count)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                        : isDisabled
                        ? 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {isAll ? `All (${maxSelectable})` : `${count} Qs`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Time Limit</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTimeLimitMinutes(mins)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    timeLimitMinutes === mins
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {mins} mins
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Toggles: Randomize & Negative Marking */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">Randomize Question Order</span>
              </div>
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200/60">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-700">Negative Marking (-0.25 penalty)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Deducts 25% marks for incorrect attempts.</p>
              </div>
              <input
                type="checkbox"
                checked={negativeMarking}
                onChange={(e) => setNegativeMarking(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Validation Notice */}
          {maxSelectable === 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>No questions found matching the selected difficulty level.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={maxSelectable === 0}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>Start Examination</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
