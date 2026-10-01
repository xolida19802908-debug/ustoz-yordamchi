import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Save,
  Printer,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { SUBJECTS } from '../data/textbooks';
import { TopicExplanation } from '../types';
import { callAIGenerator } from '../services/api';
import { useToast } from '../components/Toast';
import { AILoadingIndicator } from '../components/AILoadingIndicator';
import { PrintHeader } from '../components/PrintHeader';

interface Props {
  onSave: (data: any, title: string, subject: string, grade: number, topic: string) => void;
  initialSubject?: string;
}

export const TopicExplainerView: React.FC<Props> = ({ onSave, initialSubject }) => {
  const { showToast } = useToast();

  const [subject, setSubject] = useState(initialSubject || "Fizika");
  const [grade, setGrade] = useState<number>(9);
  const [topic, setTopic] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [explanation, setExplanation] = useState<TopicExplanation | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      showToast('Iltimos, mavzuni kiriting', 'error');
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);

    try {
      const result = await callAIGenerator('explain', {
        subject,
        grade,
        topic,
      });

      const newExp: TopicExplanation = {
        id: `exp-${Date.now()}`,
        title: `${grade}-sinf ${subject}: ${topic} (Mavzu tushuntirishi)`,
        subject,
        grade,
        topic,
        createdAt: new Date().toISOString(),
        simpleExplanation: result.simpleExplanation || "",
        detailedExplanation: result.detailedExplanation || "",
        realLifeExamples: result.realLifeExamples || [],
        keyTerms: result.keyTerms || [],
        importantPoints: result.importantPoints || [],
        checkingQuestions: result.checkingQuestions || [],
      };

      setExplanation(newExp);
      setIsSuccess(true);
      showToast('✓ Mavzu tushuntirishi yaratildi!', 'success');
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (error: any) {
      showToast(error.message || 'Mavzuni tushuntirishda xatolik yuz berdi.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    const text = `MAVZUNI TUSHUNTIRISH
Fan: ${explanation.subject} (${explanation.grade}-sinf)
Mavzu: ${explanation.topic}

1. ODDIY TILDA TUSHUNTIRISH:
${explanation.simpleExplanation}

2. BATAFSIL ILMIY BAYON:
${explanation.detailedExplanation}

3. HAYOTIY MISOLLAR:
${explanation.realLifeExamples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}

4. ASOSIY ATAMALAR:
${explanation.keyTerms.map((t) => `- ${t.term}: ${t.definition}`).join('\n')}

5. MUHIM QOIDALAR:
${explanation.importantPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

6. MUSTAHKAMLASH SAVOLLARI:
${explanation.checkingQuestions.map((q, i) => `Savol ${i + 1}: ${q.question}\nJavob: ${q.answer}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    showToast('✓ Tushuntirish nusxalandi', 'success');
  };

  const handleSave = () => {
    if (!explanation) return;
    onSave(
      explanation,
      explanation.title,
      explanation.subject,
      explanation.grade,
      explanation.topic
    );
    showToast('✓ Mavzu tushuntirishi saqlandi', 'success');
  };

  return (
    <div className="space-y-6">
      <PrintHeader
        documentTitle={`Mavzuni Tushuntirish: ${topic || 'Nazariy va amaliy qo‘llanma'}`}
        subject={subject}
        grade={grade}
        topic={topic}
      />

      {/* Generator Form */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs no-print">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900">
              Mavzuni tushuntirish yordamchisi
            </h2>
            <p className="text-xs text-slate-500">
              Oddiy tildagi izoh, batafsil ilmiy bayon, hayotiy misollar va tayanch tushunchalar
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
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
                placeholder="Masalan: Nyutonning dinamika qonunlari"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-98 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Tayyorlanmoqda...' : 'Mavzuni tushuntirish'}</span>
            </button>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <AILoadingIndicator text="Mavzu tushuntirilmoqda..." />
        </div>
      )}

      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <AILoadingIndicator isSuccess={true} />
        </div>
      )}

      {/* Generated Explanation Content */}
      {explanation && !isLoading && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-teal-100 text-teal-800">
                To‘liq tushuntirish
              </span>
              <span className="text-xs text-slate-500">
                {explanation.grade}-sinf · {explanation.subject}
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs"
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
            {/* Simple explanation card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-teal-600" />
                <span>Oddiy tilda tushuntirish (yangi boshlovchilar uchun)</span>
              </p>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {explanation.simpleExplanation}
              </p>
            </div>

            {/* Detailed scientific explanation */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1.5">
                Batafsil ilmiy bayon
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {explanation.detailedExplanation}
              </p>
            </div>

            {/* Real life examples */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1.5">
                Hayotiy misollar va analogiyalar
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {explanation.realLifeExamples.map((ex, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-teal-700 block mb-1">Misol {idx + 1}:</span>
                    {ex}
                  </div>
                ))}
              </div>
            </div>

            {/* Key terms */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1.5">
                Asosiy tayanch atamalar
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {explanation.keyTerms.map((term, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs">
                    <span className="font-bold text-slate-900">{term.term}</span> —{' '}
                    <span className="text-slate-600">{term.definition}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important points */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1.5">
                Muhim qoidalar va eslatmalar
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {explanation.importantPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Checking questions */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1.5">
                Mavzuni mustahkamlovchi savollar
              </h3>
              <div className="space-y-2">
                {explanation.checkingQuestions.map((cq, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <p className="font-bold text-slate-900">? {cq.question}</p>
                    <p className="text-teal-800 font-medium">✓ Javob: {cq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
