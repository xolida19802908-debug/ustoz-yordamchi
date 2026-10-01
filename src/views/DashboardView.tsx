import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileCheck2,
  HelpCircle,
  Home,
  Gamepad2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  Sparkle,
  CheckCircle,
  ChevronRight,
  Printer,
  Eye,
  Flame,
  Star,
  Trophy,
  Target,
  Compass,
} from 'lucide-react';
import { ActiveTab } from '../components/Sidebar';
import { SavedMaterial } from '../types';
import { SUBJECTS, OFFICIAL_TEXTBOOKS } from '../data/textbooks';
import { playChime } from '../utils/audio';
import { Interactive3DBook } from '../components/Interactive3DBook';
import { getGamificationProgress, ACHIEVEMENTS, UserProgress } from '../utils/gamification';

interface Props {
  onNavigateTab: (tab: ActiveTab) => void;
  savedMaterials: SavedMaterial[];
  onOpenMaterial: (material: SavedMaterial) => void;
  onQuickSubjectSelect: (subjectName: string) => void;
  onStartTextbookTopic?: (subjectName: string, grade: number, topicTitle: string, chapterTitle: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  onNavigateTab,
  savedMaterials,
  onOpenMaterial,
  onQuickSubjectSelect,
  onStartTextbookTopic,
}) => {
  const [progress, setProgress] = useState<UserProgress>(getGamificationProgress());

  useEffect(() => {
    const handleProgressUpdate = (e: any) => {
      if (e.detail) setProgress(e.detail);
    };
    window.addEventListener('ustoz_progress_updated', handleProgressUpdate);
    return () => window.removeEventListener('ustoz_progress_updated', handleProgressUpdate);
  }, []);

  const [navigatingCardId, setNavigatingCardId] = useState<string | null>(null);

  const mainFunctionalCards = [
    {
      id: 'lesson' as ActiveTab,
      title: '📚 Dars yaratish',
      desc: '12 bosqichli DTS dars konspekti va zamonaviy interaktiv metodlar',
      icon: BookOpen,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/15',
      borderColor: 'border-blue-200/80',
      badge: 'Eng mashhur',
      actionText: 'Dars yaratish',
    },
    {
      id: 'test' as ActiveTab,
      title: '📝 Test yaratish',
      desc: 'Darslik sahifasiga asoslangan, manbali 4 variantli test tizimi',
      icon: FileCheck2,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/15',
      borderColor: 'border-indigo-200/80',
      badge: 'Darslik manbali',
      actionText: 'Test yaratish',
    },
    {
      id: 'questions' as ActiveTab,
      title: '❓ Savollar yaratish',
      desc: 'Oson, o‘rta, qiyin & Blum taksonomiyasiga mos savollar to‘plami',
      icon: HelpCircle,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/15',
      borderColor: 'border-purple-200/80',
      badge: 'Blum darajalari',
      actionText: 'Savollar yaratish',
    },
    {
      id: 'homework' as ActiveTab,
      title: '🏠 Uy vazifasi',
      desc: '3 darajali tabaqalashtirilgan, amaliy va ijodiy topshiriqlar',
      icon: Home,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-500/10 hover:bg-amber-500/15',
      borderColor: 'border-amber-200/80',
      badge: 'Tabaqalangan',
      actionText: 'Vazifa yaratish',
    },
    {
      id: 'interactive' as ActiveTab,
      title: '🎮 Interaktiv topshiriqlar',
      desc: '8 xil sinf o‘yini, doska viktorinasi va tezkor savol-javoblar',
      icon: Gamepad2,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-500/10 hover:bg-rose-500/15',
      borderColor: 'border-rose-200/80',
      badge: 'Sinfda o‘ynash',
      actionText: 'O‘yinni boshlash',
    },
    {
      id: 'rubric' as ActiveTab,
      title: '📊 Baholash',
      desc: 'BSB, CHSB va dars faoliyatlarini aniq rubrika mezonlarida baholash',
      icon: Award,
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-500/10 hover:bg-teal-500/15',
      borderColor: 'border-teal-200/80',
      badge: 'BSB / CHSB',
      actionText: 'Mezon tuzish',
    },
    {
      id: 'explain' as ActiveTab,
      title: '💡 Mavzuni tushuntirish',
      desc: 'Murakkab mavzularni o‘quvchilar uchun sodda va qiziqarli tilda bayon qilish',
      icon: Sparkles,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/15',
      borderColor: 'border-emerald-200/80',
      badge: 'Pedagogik uslub',
      actionText: 'Tushuntirish olish',
    },
    {
      id: 'saved' as ActiveTab,
      title: '📂 Saqlanganlar',
      desc: 'Barcha yaratilgan dars ishlanmalari, testlar va materiallar arxivi',
      icon: Eye,
      iconColor: 'text-slate-700',
      bgColor: 'bg-slate-500/10 hover:bg-slate-500/15',
      borderColor: 'border-slate-300/80',
      badge: `${savedMaterials.length} ta material`,
      actionText: 'Kutubxonani ochish',
    },
  ];

  const handleCardClick = (tab: ActiveTab) => {
    playChime('click');
    setNavigatingCardId(tab);
    setTimeout(() => {
      onNavigateTab(tab);
      setNavigatingCardId(null);
    }, 180);
  };

  const lessonCount = savedMaterials.filter((m) => m.type === 'lesson').length;
  const testCount = savedMaterials.filter((m) => m.type === 'test').length;

  const missionPercent = Math.min(
    100,
    Math.round(
      (progress.dailyMission.answeredToday / progress.dailyMission.targetQuestions) * 100
    )
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkle className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
            <span>O‘zbekiston milliy maktab ta’limi standarti bilan integratsiya</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight text-white mb-1.5">
            Assalomu alaykum, Ustoz! 👋
          </h2>
          <p className="text-emerald-300 font-bold text-base sm:text-xl mb-3 tracking-wide">
            “Har bir dars uchun aqlli yordamchi”
          </p>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            Darsliklar asosida 12 bosqichli dars konspektlari, manbali testlar, tabaqalangan uy vazifalari va interaktiv metodlarni soniyalarda yarating.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleCardClick('discovery')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Mavzular xaritasini ochish</span>
            </button>
            <button
              onClick={() => handleCardClick('lesson')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition-all hover:scale-102 active:scale-98"
            >
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span>Dars ishlanmasi yaratish</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
      </div>

      {/* 1. INTERACTIVE 3D DIGITAL BOOK HERO (Requirement #1) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Interaktiv 3D Darslik</span>
            </h3>
            <p className="text-xs text-slate-500">
              Darslikni oching, varaqlang va mavzuni boshlang
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('discovery')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Barcha darsliklar</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <Interactive3DBook
          textbook={OFFICIAL_TEXTBOOKS[0]}
          onStartTopic={(topicTitle, chapterTitle) => {
            if (onStartTextbookTopic) {
              onStartTextbookTopic("O'zbekiston tarixi", 8, topicTitle, chapterTitle);
            } else {
              onNavigateTab('test');
            }
          }}
          onExploreChapters={() => onNavigateTab('discovery')}
        />
      </div>

      {/* 2. BUGUNGI MISSIYA & STREAK WIDGETS (Requirements #10 & #12) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Mission Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-800">
                    Bugungi Missiya
                  </h4>
                  <p className="text-xs text-slate-500">
                    10 ta nazorat savoliga javob bering
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>+50 XP</span>
              </span>
            </div>

            {/* Progress */}
            <div className="space-y-1.5 my-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Jarayon:</span>
                <span className="text-purple-700 tabular-nums">
                  {progress.dailyMission.answeredToday} / {progress.dailyMission.targetQuestions} ta savol
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${missionPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            {progress.dailyMission.completed ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>🎉 Bugungi missiya bajarildi!</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Yana {Math.max(0, progress.dailyMission.targetQuestions - progress.dailyMission.answeredToday)} ta savol qoldi
              </span>
            )}
            <button
              onClick={() => onNavigateTab('test')}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              <span>Testga o‘tish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Daily Learning Streak Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-orange-800">
                  Kunlik o‘qish zanjiri
                </h4>
                <p className="text-xs text-slate-500">
                  Har kuni darslik bilan shug‘ullaning
                </p>
              </div>
            </div>
            <span className="text-sm font-extrabold text-orange-600 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-current" />
              <span>{progress.streakDays} kun</span>
            </span>
          </div>

          <div className="flex items-center justify-between py-2 text-center">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const active = day <= progress.streakDays;
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center border transition-all ${
                      active
                        ? 'bg-orange-500 text-white border-orange-500 shadow-xs shadow-orange-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    {active ? '🔥' : day}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {day}-kun
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>🔥 Bugun o‘qidingiz!</span>
            <span className="font-semibold text-slate-700">Rekord: {progress.streakDays} kun</span>
          </div>
        </div>
      </div>

      {/* 3. ACHIEVEMENTS SHELF (Requirement #9) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold font-heading text-slate-900">
              Ta’limiy yutuqlar (Yutuqlar tokchasi)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {progress.unlockedAchievements.length} / {ACHIEVEMENTS.length} ochilgan
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = progress.unlockedAchievements.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/60 border-amber-200 shadow-2xs hover:scale-102'
                    : 'bg-slate-50/50 border-slate-200/60 opacity-50 grayscale'
                }`}
              >
                <div className="text-2xl mb-1">{ach.icon}</div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                  {ach.title}
                </h4>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                  {ach.description}
                </p>
                {isUnlocked && (
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded mt-1.5 inline-block">
                    ✓ Ochildi
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. KATTA FUNKSIONAL KARTALAR (Requirement #1: 8 ta asosiy modul) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold font-heading text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Darsga tayyorgarlik vositalari</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Kerakli modulni tanlang va darslikka asoslangan sifatli material yarating
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            8 ta ta’limiy modul
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainFunctionalCards.map((item) => {
            const Icon = item.icon;
            const isNavigating = navigatingCardId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item.id)}
                className={`group relative p-5 rounded-3xl bg-white border ${item.borderColor} shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden ${
                  isNavigating ? 'scale-98 ring-2 ring-emerald-500' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3.5">
                    <div className={`p-3 rounded-2xl ${item.bgColor} ${item.iconColor} transition-transform group-hover:scale-110 duration-300 shadow-2xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-extrabold font-heading text-slate-900 group-hover:text-emerald-700 transition-colors mb-1.5 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    {isNavigating ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                    ) : null}
                    <span>{item.actionText}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5 text-emerald-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Subject Shortcuts */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold font-heading text-slate-900 mb-3">
          Fanlar bo‘yicha tezkor tanlov
        </h3>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onQuickSubjectSelect(sub.name)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/70 hover:border-emerald-300 text-xs font-medium text-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Pedagogical Tip & Quote */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-amber-900">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
          Kunning pedagogik hikmati
        </p>
        <blockquote className="text-sm font-medium italic leading-relaxed text-amber-950">
          “Tarbiya biz uchun yo hayot — yo mamot, yo najot — yo halokat, yo saodat — yo falokat masalasidir.”
        </blockquote>
        <p className="text-xs text-amber-700 text-right mt-1 font-semibold">
          — Abdulla Avloniy
        </p>
      </div>

      {/* Recently Saved Materials */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold font-heading text-slate-900">
            Yaqinda saqlangan materiallar
          </h3>
          <button
            onClick={() => onNavigateTab('saved')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Barchasini ko‘rish</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {savedMaterials.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-200 text-center">
            <p className="text-sm text-slate-500 mb-3">Hozircha saqlangan materiallar yo‘q.</p>
            <button
              onClick={() => onNavigateTab('lesson')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
            >
              Birinchi darsingizni yaratib ko‘ring
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedMaterials.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenMaterial(item)}
                className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {item.grade}-sinf · {item.subject}
                  </span>
                  <Eye className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  Mavzu: {item.topic}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
