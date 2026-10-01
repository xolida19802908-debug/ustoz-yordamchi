import React, { useState } from 'react';
import {
  Home,
  Sparkles,
  Copy,
  Save,
  Printer,
  Clock,
  HeartHandshake,
  CheckCircle,
  Award,
} from 'lucide-react';
import { SUBJECTS } from '../data/textbooks';
import { HomeworkSet } from '../types';
import { callAIGenerator } from '../services/api';
import { useToast } from '../components/Toast';
import { AILoadingIndicator } from '../components/AILoadingIndicator';
import { PrintHeader } from '../components/PrintHeader';

interface Props {
  onSave: (data: any, title: string, subject: string, grade: number, topic: string) => void;
  initialSubject?: string;
}

export const HomeworkGeneratorView: React.FC<Props> = ({ onSave, initialSubject }) => {
  const { showToast } = useToast();

  const [subject, setSubject] = useState(initialSubject || 'Ona tili');
  const [grade, setGrade] = useState<number>(7);
  const [topic, setTopic] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [homework, setHomework] = useState<HomeworkSet | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      showToast('Iltimos, mavzuni kiriting', 'error');
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);

    try {
      const result = await callAIGenerator('homework', {
        subject,
        grade,
        topic,
      });

      const newHw: HomeworkSet = {
        id: `hw-${Date.now()}`,
        title: `${grade}-sinf ${subject}: ${topic} (Uy vazifasi)`,
        subject,
        grade,
        topic,
        createdAt: new Date().toISOString(),
        instructions: result.instructions || "O‘quvchilar o‘z darajasiga mos vazifani bajaradilar.",
        levels: result.levels || [],
        assessmentNote: result.assessmentNote || "",
        parentNote: result.parentNote || "",
      };

      setHomework(newHw);
      setIsSuccess(true);
      showToast('✓ Uy vazifasi muvaffaqiyatli yaratildi!', 'success');
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (error: any) {
      showToast(error.message || 'Uy vazifasi yaratishda xatolik yuz berdi.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!homework) return;
    const text = `TABAQALASHTIRILGAN UY VAZIFASI
Fan: ${homework.subject} (${homework.grade}-sinf)
Mavzu: ${homework.topic}

Yo‘riqnoma: ${homework.instructions}

${homework.levels
  .map(
    (lvl) =>
      `[${lvl.level.toUpperCase()} DARAJA - ${lvl.title}] (Taxminiy vaqt: ${lvl.expectedTime})\n${lvl.description}\nTopshiriqlar:\n${lvl.tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
  )
  .join('\n\n')}

Baholash mezonlari: ${homework.assessmentNote}
Ota-onalarga eslatma: ${homework.parentNote}
`;
    navigator.clipboard.writeText(text);
    showToast('✓ Uy vazifasi nusxalandi', 'success');
  };

  const handleSave = () => {
    if (!homework) return;
    onSave(
      homework,
      homework.title,
      homework.subject,
      homework.grade,
      homework.topic
    );
    showToast('✓ Uy vazifasi muvaffaqiyatli saqlandi', 'success');
  };

  return (
    <div className="space-y-6">
      <PrintHeader
        documentTitle={`Uy Vazifasi: ${topic || 'Tabaqalashtirilgan topshiriqlar'}`}
        subject={subject}
        grade={grade}
        topic={topic}
      />

      {/* Generator Form */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs no-print">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900">
              3 darajali tabaqalashtirilgan uy vazifasi
            </h2>
            <p className="text-xs text-slate-500">
              Boshlang‘ich, o‘rta va yuqori darajadagi o‘quvchilar uchun moslashtirilgan individual topshiriqlar
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Fan <span className="text-rose-500">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              >
                {SUBJECTS.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Sinf <span className="text-rose-500">*</span>
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((g) => (
                  <option key={g} value={g}>
                    {g}-sinf
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mavzu nomi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Masalan: Fe’l nisbatlari va ularning ma’nosi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-98 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Tayyorlanmoqda...' : 'Uy vazifasini yaratish'}</span>
            </button>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <AILoadingIndicator text="Uy vazifasi moslashtirilmoqda..." />
        </div>
      )}

      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <AILoadingIndicator isSuccess={true} />
        </div>
      )}

      {/* Generated Homework Details */}
      {homework && !isLoading && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800">
                3 daraja tayyor
              </span>
              <span className="text-xs text-slate-500">
                {homework.grade}-sinf · {homework.subject}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Nusxalash</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Saqlash</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Chop etish</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6 print-card">
            {/* Instruction */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-800 mb-1">O‘quvchilar uchun yo‘riqnoma:</p>
              <p className="text-xs text-slate-600 leading-relaxed">{homework.instructions}</p>
            </div>

            {/* 3 Level Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {homework.levels.map((lvl, idx) => {
                const colors = [
                  { badge: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-200' },
                  { badge: 'bg-blue-100 text-blue-800', border: 'border-blue-200' },
                  { badge: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
                ][idx] || { badge: 'bg-slate-100 text-slate-800', border: 'border-slate-200' };

                return (
                  <div
                    key={lvl.level}
                    className={`p-5 rounded-2xl border ${colors.border} bg-white shadow-2xs space-y-3 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                          {lvl.level} daraja
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{lvl.expectedTime}</span>
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">{lvl.title}</h4>
                      <p className="text-xs text-slate-500 mb-3">{lvl.description}</p>
                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <p className="text-[11px] font-bold text-slate-700">Topshiriqlar:</p>
                        {lvl.tasks.map((task, tIdx) => (
                          <div key={tIdx} className="flex items-start gap-2 text-xs text-slate-700">
                            <span className="font-bold text-slate-400 shrink-0">{tIdx + 1}.</span>
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Assessment Note & Parent Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1">
                <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-700" />
                  <span>Baholash tartibi</span>
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {homework.assessmentNote}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-emerald-700" />
                  <span>Ota-onalar uchun tavsiya</span>
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {homework.parentNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
