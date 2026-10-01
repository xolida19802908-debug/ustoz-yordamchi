import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Printer,
  Calendar,
  Sparkles,
  Volume2,
  VolumeX,
  Flame,
  Star,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { getGamificationProgress, toggleSound, UserProgress } from '../utils/gamification';
import { playChime } from '../utils/audio';

interface Props {
  activeTab: ActiveTab;
  onOpenMobile: () => void;
  onOpenSearch: () => void;
  onPrint: () => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Bosh sahifa',
    subtitle: 'Bugungi darslaringizni tayyorlashda USTOZ AI sizga yordam beradi.',
  },
  discovery: {
    title: 'Darslik bilimlar xaritasi',
    subtitle: 'Boblar, mavzular va interaktiv ta’lim sayohati.',
  },
  lesson: {
    title: 'Dars ishlanmasi generatori',
    subtitle: '12 bosqichli to‘liq davlat ta’lim standarti (DTS) dars konspekti.',
  },
  test: {
    title: 'Darslik asosidagi test tizimi',
    subtitle: 'Rasmiy maktab darsliklari sahifalariga tayangan ishonchli testlar.',
  },
  'test-take': {
    title: 'Testni ishlash rejimi',
    subtitle: 'O‘quvchilar va amaliyot uchun interaktiv test yechish maydoni.',
  },
  questions: {
    title: 'Savollar to‘plami',
    subtitle: 'Blum taksonomiyasi va turli qiyinlik darajasidagi savollar.',
  },
  homework: {
    title: 'Tabaqalashtirilgan uy vazifasi',
    subtitle: 'Boshlang‘ich, o‘rta va yuqori darajadagi individual topshiriqlar.',
  },
  interactive: {
    title: 'Sinfdagi interaktiv mashg‘ulotlar',
    subtitle: '8 ta qiziqarli sinf faoliyati va tezkor bilim bellashuvlari.',
  },
  explain: {
    title: 'Mavzuni tushuntirish yordamchisi',
    subtitle: 'Oddiy til, chuqur tahlil, hayotiy misollar va tayanch tushunchalar.',
  },
  rubric: {
    title: 'Baholash mezonlari va rubrikalar',
    subtitle: 'Shaffof baholash jadvali, ballar taqsimoti va o‘quvchiga tavsiyalar.',
  },
  saved: {
    title: 'Saqlangan materiallar',
    subtitle: 'Siz tayyorlagan va saqlangan barcha o‘quv-uslubiy ishlanmalar.',
  },
};

export const Header: React.FC<Props> = ({
  activeTab,
  onOpenMobile,
  onOpenSearch,
  onPrint,
}) => {
  const current = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;

  const [progress, setProgress] = useState<UserProgress>(getGamificationProgress());

  useEffect(() => {
    const handleProgressUpdate = (e: any) => {
      if (e.detail) setProgress(e.detail);
    };
    window.addEventListener('ustoz_progress_updated', handleProgressUpdate);
    return () => window.removeEventListener('ustoz_progress_updated', handleProgressUpdate);
  }, []);

  const handleSoundToggle = () => {
    const enabled = toggleSound();
    setProgress((prev) => ({ ...prev, soundEnabled: enabled }));
    if (enabled) playChime('click');
  };

  // Uzbek date formatter
  const today = new Date();
  const months = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
  ];
  const dateStr = `${today.getDate()}-${months[today.getMonth()]}, ${today.getFullYear()}-yil`;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between no-print">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="Menyu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base lg:text-lg font-bold text-slate-900 font-heading leading-tight flex items-center gap-2">
            <span>{current.title}</span>
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Knowledge Points XP Badge (Requirement #8) */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold transition-transform hover:scale-102"
          title="Sizning bilim ballaringiz"
        >
          <Star className="w-4 h-4 text-amber-500 fill-current animate-pulse" />
          <span className="tabular-nums">{progress.totalXP} XP</span>
        </div>

        {/* Learning Streak Badge (Requirement #10) */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-xs font-bold transition-transform hover:scale-102"
          title={`${progress.streakDays} kunlik ketma-ket dars`}
        >
          <Flame className="w-4 h-4 text-orange-500 fill-current" />
          <span>{progress.streakDays} kun</span>
        </div>

        {/* Sound Toggle (Requirement #16) */}
        <button
          onClick={handleSoundToggle}
          className={`p-2 rounded-xl border transition-colors ${
            progress.soundEnabled
              ? 'bg-slate-50 border-slate-200 text-emerald-700 hover:bg-emerald-50'
              : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
          }`}
          title={progress.soundEnabled ? 'Ovoz: Yoqilgan (O‘chirish)' : 'Ovoz: O‘chirilgan (Yoqish)'}
          aria-label="Ovoz sozlamasi"
        >
          {progress.soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium shadow-2xs transition-colors"
          title="Tezkor qidiruv (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Qidiruv</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
            Ctrl K
          </kbd>
        </button>

        {/* Print Button */}
        <button
          onClick={onPrint}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-colors"
          title="Chop etish"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Chop etish</span>
        </button>
      </div>
    </header>
  );
};
