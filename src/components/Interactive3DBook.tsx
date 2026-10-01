import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Lock,
  ChevronRight,
  Flame,
  Star,
  Award,
} from 'lucide-react';
import { Textbook, TextbookChapter } from '../types';
import { playChime } from '../utils/audio';

interface Props {
  textbook: Textbook;
  selectedTopicTitle?: string;
  onStartTopic: (topicTitle: string, chapterTitle: string) => void;
  onExploreChapters?: () => void;
}

export const Interactive3DBook: React.FC<Props> = ({
  textbook,
  selectedTopicTitle,
  onStartTopic,
  onExploreChapters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // 0: cover, 1: chapter overview, 2: active topic
  const [isLaunching, setIsLaunching] = useState(false);

  const activeChapter = textbook.chapters[0];
  const activeTopic = activeChapter?.topics[0];
  const displayTopic = selectedTopicTitle || activeTopic?.title || 'Mavzu tahlili';

  const handleOpenBook = () => {
    playChime('pageTurn');
    setIsOpen(true);
    setCurrentPage(1);
  };

  const handleLaunch = () => {
    playChime('pop');
    setIsLaunching(true);

    // Cinematic 1.2s transition: Book folds into glowing learning card, then triggers start
    setTimeout(() => {
      playChime('combo');
    }, 400);

    setTimeout(() => {
      onStartTopic(displayTopic, activeChapter?.title || 'Bob');
      setIsLaunching(false);
      setIsOpen(false);
    }, 1100);
  };

  return (
    <div className="relative py-4 select-none">
      {/* Cinematic Launching Overlay */}
      {isLaunching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="text-center p-8 rounded-3xl bg-gradient-to-tr from-slate-900 to-emerald-950 border border-emerald-400/40 shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-400">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/30 animate-ping" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/40">
                <BookOpen className="w-10 h-10 animate-bounce" />
              </div>
            </div>
            <p className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-1">
              Darslik bilimlari yuklanmoqda...
            </p>
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
              {displayTopic}
            </h3>
            <p className="text-xs text-slate-300">
              {textbook.grade}-sinf {textbook.subjectName}
            </p>
          </div>
        </div>
      )}

      {/* Main 3D Book Container */}
      <div className="w-full max-w-4xl mx-auto" style={{ perspective: '1400px' }}>
        {!isOpen ? (
          /* Closed 3D Book State */
          <div
            onClick={handleOpenBook}
            className="group relative cursor-pointer mx-auto max-w-md rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white shadow-2xl border border-emerald-500/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-emerald-900/30 hover:border-emerald-400/60"
            style={{
              transformStyle: 'preserve-3d',
              boxShadow: '0 25px 50px -12px rgba(6, 78, 59, 0.35), 0 0 0 1px rgba(16, 185, 129, 0.2)',
            }}
          >
            {/* Book spine simulation on the left */}
            <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-emerald-950 to-emerald-800 rounded-l-2xl border-r border-emerald-400/20" />

            {/* Golden Ribbon Bookmark */}
            <div className="absolute -top-1 right-8 w-6 h-12 bg-gradient-to-b from-amber-400 to-amber-600 rounded-b-md shadow-md shadow-amber-900/30 flex items-end justify-center pb-1">
              <Star className="w-3 h-3 text-amber-950 fill-current" />
            </div>

            <div className="pl-6">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Raqamli interaktiv darslik</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight mb-1">
                {textbook.title}
              </h3>
              <p className="text-xs text-emerald-200/80 mb-4">
                Mualliflar: {textbook.authors} ({textbook.year}-yil rasmiy nashr)
              </p>

              {/* Verified badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-medium mb-6">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{textbook.chapters.length} ta bob · {textbook.grade}-sinf to‘liq dasturi</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-emerald-800/60">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Darslikni ochish uchun bosing</span>
                </span>
                <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold group-hover:scale-105 transition-transform flex items-center gap-1">
                  <span>Ochish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Opened 3D Book with 2 Spread Pages */
          <div
            className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 transition-all duration-500 animate-in zoom-in-95"
            style={{
              background: 'linear-gradient(90deg, #fdfbf7 0%, #ffffff 48%, #e2e8f0 50%, #ffffff 52%, #fdfbf7 100%)',
            }}
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                <BookMarked className="w-4 h-4 text-emerald-600" />
                <span>{textbook.subjectName} · {textbook.grade}-sinf</span>
              </div>
              <button
                onClick={() => {
                  playChime('pageTurn');
                  setIsOpen(false);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Kitobni yopish ✕
              </button>
            </div>

            {/* Two Page Spread */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-72">
              {/* Left Page: Chapter Overview & Facts */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border border-amber-100/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200/70 text-amber-900">
                    {activeChapter?.number || 1}-BOB TAVSIFI
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-2 mb-1">
                    {activeChapter?.title}
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Sahifalar: {activeChapter?.pages} · {textbook.publisher}
                  </p>

                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-700">Darslikdagi tayanch faktlar:</p>
                    {activeTopic?.keyPoints?.map((kp, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{kp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-amber-200/60 mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>Sahifa: {activeTopic?.page || 45}</span>
                  <span className="font-semibold text-emerald-700">✓ DTS Tasdiqlangan</span>
                </div>
              </div>

              {/* Right Page: Selected Topic & Launch Action */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/30 border border-emerald-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900">
                      O‘RGANILADIGAN MAVZU
                    </span>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>+50 XP</span>
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold font-heading text-slate-900 mb-2">
                    {displayTopic}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Ushbu mavzuni to‘liq o‘zlashtirish uchun darslik asosidagi interaktiv test va tahliliy savollarni boshlang.
                  </p>

                  {/* Topic stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                      <span className="text-slate-400 block text-[10px]">Savollar soni:</span>
                      <span className="font-bold text-slate-800">5–10 ta test</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                      <span className="text-slate-400 block text-[10px]">O‘rtacha vaqt:</span>
                      <span className="font-bold text-slate-800">5 daqiqa</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-200/60 space-y-2">
                  <button
                    onClick={handleLaunch}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                  >
                    <span>🚀 BOSHLASH</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {onExploreChapters && (
                    <button
                      onClick={onExploreChapters}
                      className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 text-center transition-colors"
                    >
                      Barcha boblar va mavzular xaritasini ko‘rish →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
