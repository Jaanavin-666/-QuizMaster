import React, { useState } from 'react';
import {
  Award,
  Calendar,
  Clock,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Filter,
  BarChart3,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { QuizAttempt, Subject } from '../../types/index.ts';
import { formatDuration } from '../../utils/quiz-engine.ts';

interface Props {
  attempts: QuizAttempt[];
  subjects: Subject[];
  onOpenAttemptReview: (attempt: QuizAttempt) => void;
  onRetakeSubject: (subjectId: string) => void;
}

export const MyResultsView: React.FC<Props> = ({
  attempts,
  subjects,
  onOpenAttemptReview,
  onRetakeSubject,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');

  const filteredAttempts = attempts.filter((a) => {
    return selectedSubjectId === 'ALL' || a.subjectId === selectedSubjectId;
  });

  const totalAttempts = attempts.length;
  const avgPercentage = totalAttempts > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalAttempts)
    : 0;
  const bestScore = totalAttempts > 0
    ? Math.max(...attempts.map((a) => a.percentage))
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Examination History & Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review past quiz performances, analyze accuracy across subjects, and re-attempt exams.
          </p>
        </div>

        {/* Filter by Subject */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
          >
            <option value="ALL">All Subjects ({attempts.length})</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Attempts</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalAttempts}</div>
            <div className="text-xs text-slate-400 mt-0.5">Recorded submissions</div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Performance</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{avgPercentage}%</div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">Overall student score</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Personal Best</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{bestScore}%</div>
            <div className="text-xs text-slate-400 mt-0.5">Peak achievement</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Attempt History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {filteredAttempts.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black text-sm shrink-0 ${
                    attempt.percentage >= 75
                      ? 'bg-emerald-100 text-emerald-800'
                      : attempt.percentage >= 50
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    <span>{attempt.percentage}%</span>
                    <span className="text-[9px] font-normal leading-none opacity-80">Score</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{attempt.subjectName}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(attempt.submittedAt).toLocaleDateString()} at{' '}
                        {new Date(attempt.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(attempt.timeTakenSeconds)}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-700">
                        {attempt.correctAnswers}/{attempt.totalQuestions} Correct
                      </span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                        {attempt.selectedLanguage === 'ta' ? 'தமிழ்' : 'English'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => onRetakeSubject(attempt.subjectId)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>

                  <button
                    onClick={() => onOpenAttemptReview(attempt)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No examination attempts found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {selectedSubjectId !== 'ALL'
                ? 'No attempts recorded for this subject yet. Select another subject or take a quiz now!'
                : 'You have not submitted any quizzes yet. Explore subjects to take your first test.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
