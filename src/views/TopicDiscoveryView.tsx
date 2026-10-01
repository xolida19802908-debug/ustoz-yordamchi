import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Trophy,
  Flame,
  Star,
  ChevronRight,
  Landmark,
  Globe,
  Atom,
  Dna,
  Calculator,
  Languages,
  Cpu,
  Feather,
} from 'lucide-react';
import { OFFICIAL_TEXTBOOKS, SUBJECTS } from '../data/textbooks';
import { Textbook, TextbookChapter } from '../types';
import { getGamificationProgress, completeTopic } from '../utils/gamification';
import { playChime } from '../utils/audio';

interface Props {
  onStartTopic: (subjectName: string, grade: number, topicTitle: string, chapterTitle: string) => void;
  initialSubject?: string;
}

export const TopicDiscoveryView: React.FC<Props> = ({ onStartTopic, initialSubject }) => {
  const [selectedSubjectName, setSelectedSubjectName] = useState(initialSubject || "O'zbekiston tarixi");
  const [selectedGrade, setSelectedGrade] = useState<number>(8);

  const progress = getGamificationProgress();

  const matchingTextbook = OFFICIAL_TEXTBOOKS.find(
    (tb) => tb.subjectName === selectedSubjectName && tb.grade === selectedGrade
  ) || OFFICIAL_TEXTBOOKS[0];

  const [selectedTopic, setSelectedTopic] = useState<{
    id: string;
    title: string;
    chapterTitle: string;
    page: number;
    keyPoints?: string[];
  } | null>(null);

  // Subject-specific theme and icons (Requirement #13)
  const getSubjectVisual = (subjectName: string) => {
    switch (subjectName) {
      case "O'zbekiston tarixi":
      case 'Jahon tarixi':
        return {
          icon: Landmark,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          accent: 'from-amber-600 to-yellow-500',
          badge: '🏛 Tarixiy manbalar',
        };
      case 'Geografiya':
        return {
          icon: Globe,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          accent: 'from-emerald-600 to-teal-500',
          badge: '🌍 Xaritalar va mintaqalar',
        };
      case 'Fizika':
        return {
          icon: Atom,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          accent: 'from-blue-600 to-indigo-500',
          badge: '⚡ Qonuniyatlar va energiya',
        };
      case 'Biologiya':
        return {
          icon: Dna,
          bg: 'bg-green-50 text-green-700 border-green-200',
          accent: 'from-green-600 to-emerald-500',
          badge: '🌱 Tirik tabiat',
        };
      case 'Matematika':
      case 'Algebra':
      case 'Geometriya':
        return {
          icon: Calculator,
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          accent: 'from-purple-600 to-violet-500',
          badge: '➗ Aniq hisoblar',
        };
      case 'Informatika':
        return {
          icon: Cpu,
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          accent: 'from-cyan-600 to-blue-500',
          badge: '💻 Raqamli texnologiyalar',
        };
      default:
        return {
          icon: Feather,
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          accent: 'from-rose-600 to-pink-500',
          badge: '📖 Adabiyot va til',
        };
    }
  };

  const visual = getSubjectVisual(selectedSubjectName);
  const SubjectIcon = visual.icon;

  // Calculate completion percentage
  const totalTopicsInBook = matchingTextbook?.chapters.reduce((sum, ch) => sum + ch.topics.length, 0) || 1;
  const completedInThisBook = matchingTextbook?.chapters.reduce(
    (sum, ch) => sum + ch.topics.filter((t) => progress.completedTopics.includes(t.id)).length,
    0
  ) || 0;
  const progressPercent = Math.min(100, Math.round((completedInThisBook / totalTopicsInBook) * 100));

  const handleSelectTopic = (
    topicId: string,
    topicTitle: string,
    chapterTitle: string,
    page: number,
    keyPoints?: string[]
  ) => {
    playChime('click');
    setSelectedTopic({
      id: topicId,
      title: topicTitle,
      chapterTitle,
      page,
      keyPoints,
    });
  };

  const handleStart = () => {
    if (!selectedTopic) return;
    playChime('pop');
    onStartTopic(selectedSubjectName, selectedGrade, selectedTopic.title, selectedTopic.chapterTitle);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Subject & Grade Filter Bar */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${visual.bg}`}>
              {visual.badge}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {matchingTextbook.title} ({matchingTextbook.year}-yil nashr)
            </span>
          </div>
          <h2 className="text-xl font-extrabold font-heading text-slate-900 flex items-center gap-2.5">
            <SubjectIcon className="w-6 h-6 text-emerald-600" />
            <span>Darslik bo‘yicha bilim xaritasi</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSubjectName}
            onChange={(e) => {
              setSelectedSubjectName(e.target.value);
              setSelectedTopic(null);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(Number(e.target.value));
              setSelectedTopic(null);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {[5, 6, 7, 8, 9, 10, 11].map((g) => (
              <option key={g} value={g}>
                {g}-sinf
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overall Book Progress Bar (Requirement #11) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Darslikni o‘zlashtirish darajasi:</span>
          </span>
          <span className="text-emerald-700 font-extrabold tabular-nums">
            {completedInThisBook} / {totalTopicsInBook} mavzu ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Two Column Layout: Journey Map & Active Topic Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Chapters Journey (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {matchingTextbook.chapters.map((chapter, cIdx) => (
            <div
              key={chapter.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4"
            >
              {/* Chapter Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 text-xs font-extrabold flex items-center justify-center">
                    {chapter.number}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {chapter.title}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Darslik sahifalari: {chapter.pages}
                    </p>
                  </div>
                </div>
              </div>

              {/* Topics Path */}
              <div className="space-y-3 relative pl-6 before:content-[''] before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {chapter.topics.map((t, tIdx) => {
                  const isCompleted = progress.completedTopics.includes(t.id);
                  const isSelected = selectedTopic?.id === t.id;
                  const isCurrent = !isCompleted && (tIdx === 0 || progress.completedTopics.includes(chapter.topics[tIdx - 1]?.id));

                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTopic(t.id, t.title, chapter.title, t.page, t.keyPoints)}
                      className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                          : isCompleted
                          ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80 text-slate-700'
                          : isCurrent
                          ? 'bg-white border-emerald-300 shadow-2xs hover:shadow-xs'
                          : 'bg-slate-50/40 border-slate-200/60 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* Node circle on timeline */}
                      <span
                        className={`absolute -left-6.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : isSelected
                            ? 'bg-emerald-500 border-white text-white ring-2 ring-emerald-500 animate-pulse'
                            : isCurrent
                            ? 'bg-white border-emerald-500 text-emerald-600'
                            : 'bg-slate-100 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          tIdx + 1
                        )}
                      </span>

                      <div className="pr-4">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold text-slate-400">
                            {t.page}-bet
                          </span>
                          {isCompleted && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              O‘zlashtirildi
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-1">
                              <Flame className="w-3 h-3 fill-current" />
                              Hozirgi mavzu
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {t.title}
                        </h4>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>+50 XP</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Topic Details & "Boshlash" Panel (1 Col) */}
        <div className="space-y-4">
          <div className="sticky top-20 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Tanlangan mavzu
              </span>
              <h3 className="text-base font-extrabold font-heading text-slate-900 mt-2 mb-1">
                {selectedTopic ? selectedTopic.title : matchingTextbook.chapters[0]?.topics[0]?.title}
              </h3>
              <p className="text-xs text-slate-500">
                {matchingTextbook.grade}-sinf · {matchingTextbook.subjectName} · Sahifa:{' '}
                {selectedTopic ? selectedTopic.page : matchingTextbook.chapters[0]?.topics[0]?.page}
              </p>
            </div>

            {/* Key textbook points */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <p className="font-bold text-slate-800">Darslikdagi asosiy faktlar:</p>
              <ul className="space-y-1.5 text-slate-600">
                {(selectedTopic?.keyPoints || matchingTextbook.chapters[0]?.topics[0]?.keyPoints || [
                  'Darslikdagi qonuniyatlar va sanalar tahlil qilinadi.',
                  'Har bir savol tasdiqlangan manbaga tayanadi.',
                ]).map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Launch Button */}
            <button
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <span>🚀 BOSHLASH</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-center text-slate-400">
              Ushbu mavzuni yakunlab +50 XP va yutuqlarni qo‘lga kiriting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
