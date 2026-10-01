import React, { useEffect, useState } from 'react';
import { Sparkles, BookOpen, Brain, CheckCircle2 } from 'lucide-react';

interface Props {
  text?: string;
  isSuccess?: boolean;
}

const TIPS = [
  "Darslik sahifalari va rasmiy dastur tahlil qilinmoqda...",
  "DTS va Milliy o‘quv dasturi talablari tekshirilmoqda...",
  "Faktik aniqlik va manbalar muvofiqlashtirilmoqda...",
  "O‘quvchilar darajasi bo‘yicha metodik moslashtirilmoqda...",
  "Dars bosqichlari daqiqalar bo‘yicha taqsimlanmoqda...",
];

export const AILoadingIndicator: React.FC<Props> = ({
  text = 'USTOZ AI ishlamoqda...',
  isSuccess = false,
}) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (isSuccess) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in-95 duration-400">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-sm border border-emerald-200">
          <CheckCircle2 className="w-9 h-9 animate-bounce" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
          Material muvaffaqiyatli yaratildi!
        </h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Siz materialni tahrirlashingiz, nusxalashingiz yoki saqlashingiz mumkin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      {/* Animated glowing container */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-xl animate-pulse" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-400/40">
          <div className="relative">
            <BookOpen className="w-9 h-9 animate-pulse" />
            <Sparkles className="w-5 h-5 absolute -top-2 -right-2 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <span>{text}</span>
      </h3>

      <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium max-w-md shadow-xs transition-all duration-300">
        <Brain className="w-4 h-4 text-emerald-600 shrink-0 animate-pulse" />
        <span className="truncate">{TIPS[tipIndex]}</span>
      </div>

      <p className="text-xs text-slate-400 mt-3">
        Har bir darslik maʼlumoti sinchkovlik bilan qayta ishlanmoqda
      </p>
    </div>
  );
};
