import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Compass,
  BookOpen,
  FileCheck2,
  HelpCircle,
  Home,
  Gamepad2,
  Sparkles,
  Award,
  FolderHeart,
  X,
  ChevronRight,
  BookMarked,
} from 'lucide-react';
import { playChime } from '../utils/audio';

export type ActiveTab =
  | 'dashboard'
  | 'discovery'
  | 'lesson'
  | 'test'
  | 'test-take'
  | 'questions'
  | 'homework'
  | 'interactive'
  | 'explain'
  | 'rubric'
  | 'saved';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  savedCount: number;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
  savedCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Bosh sahifa',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'discovery' as ActiveTab,
      label: 'Mavzular xaritasi',
      icon: Compass,
      badge: 'Sayohat',
    },
    {
      id: 'lesson' as ActiveTab,
      label: 'Dars ishlanmasi',
      icon: BookOpen,
      badge: '12 qism',
    },
    {
      id: 'test' as ActiveTab,
      label: 'Darslik testi',
      icon: FileCheck2,
      badge: 'Darslik',
    },
    {
      id: 'questions' as ActiveTab,
      label: 'Savollar to‘plami',
      icon: HelpCircle,
      badge: 'Blum',
    },
    {
      id: 'homework' as ActiveTab,
      label: 'Uy vazifasi',
      icon: Home,
      badge: '3 daraja',
    },
    {
      id: 'interactive' as ActiveTab,
      label: 'Interaktiv mashg‘ulot',
      icon: Gamepad2,
      badge: '8 tur',
    },
    {
      id: 'explain' as ActiveTab,
      label: 'Mavzuni tushuntirish',
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'rubric' as ActiveTab,
      label: 'Baholash mezonlari',
      icon: Award,
      badge: null,
    },
    {
      id: 'saved' as ActiveTab,
      label: 'Saqlangan materiallar',
      icon: FolderHeart,
      badge: savedCount > 0 ? savedCount.toString() : null,
    },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    playChime('click');
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900">
                  USTOZ AI
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Milliy
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-tight">
                Har bir dars uchun aqlli yordamchi
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Menyuni yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Asosiy modullar
          </div>
          {navItems.map((item) => {
            const isActive =
              activeTab === item.id ||
              (item.id === 'test' && activeTab === 'test-take');
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 group-hover:text-slate-600 bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Official Curriculum Banner */}
        <div className="p-4 mx-3 mb-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
            <BookMarked className="w-4 h-4" />
            <span>DTS va Yangi Dastur</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Respublika Ta’lim Markazi tasdiqlagan darsliklar standartlariga to‘liq mos.
          </p>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center border border-emerald-200 text-sm">
              UX
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-slate-800">Ustoz Xolida</p>
              <p className="text-[11px] text-slate-500">Oliy toifali pedagog</p>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500" title="Faol" />
        </div>
      </aside>
    </>
  );
};
