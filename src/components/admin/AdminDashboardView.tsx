import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Languages,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  HelpCircle,
  Database,
  Layers,
} from 'lucide-react';
import { User, Subject, Question, QuestionDifficulty } from '../../types/index.ts';

interface Props {
  user: User;
  subjects: Subject[];
  questions: Question[];
  onAddQuestion: (question: Omit<Question, 'id'>) => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onDeleteQuestion: (id: string) => void;
  onPromoteToAdmin: () => void;
}

export const AdminDashboardView: React.FC<Props> = ({
  user,
  subjects,
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onPromoteToAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewLanguage, setPreviewLanguage] = useState<'en' | 'ta'>('en');

  // Question Form State
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || 'sub-gk');
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formQuestionEn, setFormQuestionEn] = useState('');
  const [formQuestionTa, setFormQuestionTa] = useState('');
  const [formOptionsEn, setFormOptionsEn] = useState<[string, string, string, string]>(['', '', '', '']);
  const [formOptionsTa, setFormOptionsTa] = useState<[string, string, string, string]>(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = useState<number>(0);
  const [formDifficulty, setFormDifficulty] = useState<QuestionDifficulty>('MEDIUM');
  const [formMarks, setFormMarks] = useState<number>(1);
  const [formExplanationEn, setFormExplanationEn] = useState('');
  const [formExplanationTa, setFormExplanationTa] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // If user is not an Admin, show access denied screen enforcing RBAC
  if (user.role !== 'ADMIN') {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Administrator Access Required</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            You are currently signed in as a <strong>Student ({user.email})</strong>. Role-Based Access Control (RBAC) restricts Question Bank authoring, editing, and deletion exclusively to verified faculty and administrative staff.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-2">
          <div className="font-semibold text-slate-800">Spring Security RBAC Rule:</div>
          <code className="block bg-slate-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[11px]">
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
          </code>
          <p className="text-[11px] text-slate-500">
            Designated faculty accounts (e.g. <code className="font-mono text-indigo-600">jaanavin03@gmail.com</code>) receive automatic Admin roles. For demonstration and project evaluation, you can toggle administrative rights below.
          </p>
        </div>

        <button
          onClick={onPromoteToAdmin}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          Promote Current Session to Faculty Admin
        </button>
      </div>
    );
  }

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSubject = selectedSubjectId === 'ALL' || q.subjectId === selectedSubjectId;
    const matchesDiff = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    const matchesSearch =
      q.questionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.questionTa.includes(searchQuery) ||
      (q.subCategory && q.subCategory.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesDiff && matchesSearch;
  });

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormSubjectId(subjects[0]?.id || 'sub-gk');
    setFormSubCategory('');
    setFormQuestionEn('');
    setFormQuestionTa('');
    setFormOptionsEn(['', '', '', '']);
    setFormOptionsTa(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormDifficulty('MEDIUM');
    setFormMarks(1);
    setFormExplanationEn('');
    setFormExplanationTa('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setFormSubjectId(q.subjectId);
    setFormSubCategory(q.subCategory || '');
    setFormQuestionEn(q.questionEn);
    setFormQuestionTa(q.questionTa);
    setFormOptionsEn([...q.optionsEn]);
    setFormOptionsTa([...q.optionsTa]);
    setFormCorrectIndex(q.correctAnswerIndex);
    setFormDifficulty(q.difficulty);
    setFormMarks(q.marks);
    setFormExplanationEn(q.explanationEn);
    setFormExplanationTa(q.explanationTa);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestionEn.trim() || !formQuestionTa.trim()) {
      setFormError('Both English and Tamil question texts are strictly required.');
      return;
    }
    for (let i = 0; i < 4; i++) {
      if (!formOptionsEn[i].trim() || !formOptionsTa[i].trim()) {
        setFormError(`All 4 options must be completed in both English and Tamil (Option ${String.fromCharCode(65 + i)} is missing).`);
        return;
      }
    }

    setFormError(null);

    const questionData: Omit<Question, 'id'> = {
      subjectId: formSubjectId,
      subCategory: formSubCategory.trim() || undefined,
      questionEn: formQuestionEn.trim(),
      questionTa: formQuestionTa.trim(),
      optionsEn: formOptionsEn.map((o) => o.trim()) as [string, string, string, string],
      optionsTa: formOptionsTa.map((o) => o.trim()) as [string, string, string, string],
      correctAnswerIndex: formCorrectIndex,
      difficulty: formDifficulty,
      marks: formMarks > 0 ? formMarks : 1,
      explanationEn: formExplanationEn.trim(),
      explanationTa: formExplanationTa.trim(),
      active: true,
    };

    if (editingQuestion) {
      onUpdateQuestion(editingQuestion.id, questionData);
    } else {
      onAddQuestion(questionData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1">
            Faculty Admin Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Question Bank Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Author, edit, or purge bilingual questions across all 13 subjects.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bilingual Question</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Questions</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{questions.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Subjects</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{subjects.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Bilingual Coverage</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">100%</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Storage Engine</span>
          <div className="text-sm font-bold text-slate-800 mt-2 font-mono">MySQL / LocalStore</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions in English or தமிழ்..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-5">#</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-5 w-2/5">Question (English & Tamil)</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Correct Answer</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuestions.map((q, idx) => {
                const sub = subjects.find((s) => s.id === q.subjectId);
                const correctOptionEn = q.optionsEn[q.correctAnswerIndex];

                return (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5 font-mono text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="py-4 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {sub?.name || q.subjectId}
                      {q.subCategory && (
                        <span className="block text-[10px] text-slate-400 font-normal">{q.subCategory}</span>
                      )}
                    </td>
                    <td className="py-4 px-5 space-y-1">
                      <div className="font-semibold text-slate-900 line-clamp-1">{q.questionEn}</div>
                      <div className="text-indigo-600 font-tamil text-[11px] line-clamp-1">{q.questionTa}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        q.difficulty === 'EASY'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : q.difficulty === 'MEDIUM'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-emerald-700 font-medium whitespace-nowrap">
                      <span className="w-5 h-5 rounded-md bg-emerald-100 inline-flex items-center justify-center font-bold text-[10px] mr-1.5">
                        {String.fromCharCode(65 + q.correctAnswerIndex)}
                      </span>
                      <span className="truncate max-w-[120px] inline-block align-bottom">{correctOptionEn}</span>
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(q)}
                          aria-label={`Edit question ${idx + 1}`}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Question"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(q.id)}
                          aria-label={`Delete question ${idx + 1}`}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredQuestions.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No questions match the current filter criteria.
          </div>
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {editingQuestion ? 'Edit Bilingual Question' : 'Add New Bilingual Question'}
                </h3>
                <p className="text-xs text-slate-400">
                  Ensure accurate translation between English and தமிழ் options.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 max-h-[75vh] overflow-y-auto space-y-5 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Subject & SubCategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Subject</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Subcategory (Optional)</label>
                  <input
                    type="text"
                    value={formSubCategory}
                    onChange={(e) => setFormSubCategory(e.target.value)}
                    placeholder="e.g. Space & Astronomy, Pointers"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Question Text in English & Tamil */}
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Question (English)</label>
                  <textarea
                    rows={2}
                    value={formQuestionEn}
                    onChange={(e) => setFormQuestionEn(e.target.value)}
                    placeholder="Enter the complete question text in English..."
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-indigo-700 uppercase mb-1 font-tamil">வினா (தமிழ் - Tamil)</label>
                  <textarea
                    rows={2}
                    value={formQuestionTa}
                    onChange={(e) => setFormQuestionTa(e.target.value)}
                    placeholder="வினாவை தமிழில் உள்ளிடவும்..."
                    className="w-full p-3 rounded-xl border border-slate-300 font-tamil focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 4 Options Grid */}
              <div className="space-y-3 pt-2">
                <label className="block font-bold text-slate-800 uppercase tracking-wider">
                  Multiple Choice Options (4 Required) & Select Correct Answer
                </label>

                {[0, 1, 2, 3].map((optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isCorrect = formCorrectIndex === optIdx;

                  return (
                    <div key={optIdx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                            {letter}
                          </span>
                          <span>Option {letter}</span>
                        </span>

                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-emerald-700">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={isCorrect}
                            onChange={() => setFormCorrectIndex(optIdx)}
                            className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span>Set as Correct Answer</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={formOptionsEn[optIdx]}
                          onChange={(e) => {
                            const updated = [...formOptionsEn] as [string, string, string, string];
                            updated[optIdx] = e.target.value;
                            setFormOptionsEn(updated);
                          }}
                          placeholder={`Option ${letter} in English`}
                          className="px-3 py-1.5 bg-white rounded-xl border border-slate-300"
                        />
                        <input
                          type="text"
                          value={formOptionsTa[optIdx]}
                          onChange={(e) => {
                            const updated = [...formOptionsTa] as [string, string, string, string];
                            updated[optIdx] = e.target.value;
                            setFormOptionsTa(updated);
                          }}
                          placeholder={`விருப்பம் ${letter} (தமிழ்)`}
                          className="px-3 py-1.5 bg-white rounded-xl border border-slate-300 font-tamil"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Difficulty & Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Marks Awarded</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formMarks}
                    onChange={(e) => setFormMarks(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Explanations */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Explanation (English)</label>
                  <textarea
                    rows={2}
                    value={formExplanationEn}
                    onChange={(e) => setFormExplanationEn(e.target.value)}
                    placeholder="Explain why the chosen answer is correct..."
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-indigo-700 uppercase mb-1 font-tamil">விளக்கம் (தமிழ்)</label>
                  <textarea
                    rows={2}
                    value={formExplanationTa}
                    onChange={(e) => setFormExplanationTa(e.target.value)}
                    placeholder="சரியான விடைக்கான விளக்கத்தை தமிழில் உள்ளிடவும்..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-tamil"
                  />
                </div>
              </div>

              {/* Save Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  {editingQuestion ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Question?</h3>
            <p className="text-xs text-slate-500">
              This action cannot be undone. The question will be permanently removed from all future tests.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteQuestion(deletingId);
                  setDeletingId(null);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
