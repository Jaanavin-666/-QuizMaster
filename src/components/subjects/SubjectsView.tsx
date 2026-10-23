import React, { useState } from 'react';
import {
  Globe,
  Coffee,
  Terminal,
  Binary,
  Cpu,
  Calculator,
  Atom,
  Server,
  BookOpen,
  TrendingUp,
  Compass,
  Landmark,
  MapPin,
  Search,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Subject, SubjectCategory } from '../../types/index.ts';

interface Props {
  subjects: Subject[];
  onSelectSubject: (subject: Subject) => void;
}

const getSubjectIcon = (iconName: string) => {
  switch (iconName) {
    case 'Coffee': return Coffee;
    case 'Terminal': return Terminal;
    case 'Binary': return Binary;
    case 'Cpu': return Cpu;
    case 'Calculator': return Calculator;
    case 'Atom': return Atom;
    case 'Server': return Server;
    case 'BookOpen': return BookOpen;
    case 'TrendingUp': return TrendingUp;
    case 'Compass': return Compass;
    case 'Landmark': return Landmark;
    case 'MapPin': return MapPin;
    default: return Globe;
  }
};

export const SubjectsView: React.FC<Props> = ({ subjects, onSelectSubject }) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | SubjectCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: 'ALL' | SubjectCategory; label: string }[] = [
    { id: 'ALL', label: 'All Subjects' },
    { id: 'PROGRAMMING', label: 'Programming & Tech' },
    { id: 'ACADEMICS', label: 'Academics & Science' },
    { id: 'COMPETITIVE', label: 'Aptitude & Reasoning' },
    { id: 'GENERAL', label: 'General & History' },
  ];

  const filteredSubjects = subjects.filter((s) => {
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nameTa && s.nameTa.includes(searchQuery)) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Academic & Examination Subjects</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse through 13 specialized domains. Each subject features fully bilingual English and தமிழ் question sets.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects or topics..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSubjects.map((subject) => {
          const Icon = getSubjectIcon(subject.iconName);
          const qCount = subject.totalQuestions || 0;

          return (
            <div
              key={subject.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                    {subject.category}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                  {subject.name}
                </h3>
                {subject.nameTa && (
                  <div className="text-xs text-indigo-600 font-tamil font-semibold">
                    {subject.nameTa}
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {subject.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  <strong className="text-slate-800">{qCount}</strong> Questions
                </span>
                <button
                  onClick={() => onSelectSubject(subject)}
                  disabled={qCount === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Configure Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No subjects found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search terms or selecting another category.</p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold text-xs rounded-xl hover:bg-indigo-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
