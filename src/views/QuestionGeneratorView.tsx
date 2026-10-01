import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Copy,
  Save,
  Printer,
  ChevronDown,
  CheckCircle,
  Award,
  Layers,
} from 'lucide-react';
import { SUBJECTS } from '../data/textbooks';
import { QuestionItem, QuestionSet } from '../types';
import { callAIGenerator } from '../services/api';
import { useToast } from '../components/Toast';
import { AILoadingIndicator } from '../components/AILoadingIndicator';
import { PrintHeader } from '../components/PrintHeader';

interface Props {
  onSave: (data: any, title: string, subject: string, grade: number, topic: string) => void;
  initialSubject?: string;
}

export const QuestionGeneratorView: React.FC<Props> = ({ onSave, initialSubject }) => {
  const { showToast } = useToast();

  const [subject, setSubject] = useState(initialSubject || "O'zbekiston tarixi");
  const [grade, setGrade] = useState<number>(8);
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState<number>(6);
  const [difficulty, setDifficulty] = useState<string>("Barcha darajalar (Aralash)");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [questions, setQuestions] = useState<QuestionItem[] | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      showToast('Iltimos, mavzuni kiriting', 'error');
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);

    try {
      const result = await callAIGenerator('questions', {
        subject,
        grade,
        topic,
        count,
        difficulty,
      });

      setQuestions(result.questions || []);
      setIsSuccess(true);
      setRevealedAnswers({});
      showToast('✓ Savollar muvaffaqiyatli yaratildi!', 'success');
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (error: any) {
      showToast(error.message || 'Savollar yaratishda xatolik yuz berdi.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAnswer = (num: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const handleCopy = () => {
    if (!questions) return;
    const text = questions
      .map(
        (q) =>
          `${q.number}. ${q.question} (${q.difficulty} - ${q.bloomLevel})\nJavob: ${q.modelAnswer}\nMezon: ${q.criteria}\n`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    showToast('✓ Savollar nusxalandi', 'success');
  };

  const handleSave = () => {
    if (!questions) return;
    onSave(
      { questions },
      `${grade}-sinf ${subject}: ${topic} (Savollar to‘plami)`,
      subject,
      grade,
      topic
    );
    showToast('✓ Savollar muvaffaqiyatli saqlandi', 'success');
  };

  return (
    <div className="space-y-6">
      <PrintHeader
        documentTitle={`Savollar to‘plami: ${topic || 'Nazorat savollari'}`}
        subject={subject}
        grade={grade}
        topic={topic}
      />

      {/* Input Form */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs no-print">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900">
              Blum taksonomiyasi bo‘yicha savollar generatori
            </h2>
            <p className="text-xs text-slate-500">
              Oson, o‘rta va qiyin darajadagi tahliliy savollar hamda namunaviy javoblar
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Fan <span className="text-rose-500">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
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
                Savollar soni
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
              >
                <option value={3}>3 ta savol</option>
                <option value={6}>6 ta savol (Blumning har bosqichi uchun)</option>
                <option value={9}>9 ta savol</option>
                <option value={12}>12 ta savol</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Qiyinlik darajasi
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
              >
                <option value="Barcha darajalar (Aralash)">Barcha darajalar (Aralash)</option>
                <option value="Oson">Oson (Bilish va tushunish)</option>
                <option value="O‘rta">O‘rta (Qo‘llash va tahlil)</option>
                <option value="Qiyin">Qiyin (Sintez va baholash)</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mavzu nomi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Masalan: Movarounnahrda temuriylar renessansi va ilmiy muhit"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-98 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Savollar tuzilmoqda...' : 'Savollarni yaratish'}</span>
            </button>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <AILoadingIndicator text="Blum savollari tuzilmoqda..." />
        </div>
      )}

      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <AILoadingIndicator isSuccess={true} />
        </div>
      )}

      {/* Generated Questions List */}
      {questions && !isLoading && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-100 text-purple-800">
                {questions.length} ta savol
              </span>
              <span className="text-xs text-slate-500">
                {grade}-sinf · {subject}
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-xs"
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

          <div className="space-y-3">
            {questions.map((q) => {
              const isRevealed = revealedAnswers[q.number];

              return (
                <div
                  key={q.number}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs print-card"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0 border border-purple-100">
                        {q.number}
                      </span>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                          {q.question}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {q.difficulty}
                          </span>
                          <span className="text-[10px] font-semibold text-purple-700">
                            Blum darajasi: {q.bloomLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleAnswer(q.number)}
                      className="text-xs text-purple-700 hover:text-purple-900 font-medium px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors no-print shrink-0"
                    >
                      {isRevealed ? 'Yashirish' : 'Namunaviy javob'}
                    </button>
                  </div>

                  {isRevealed && (
                    <div className="mt-3 ml-9 p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs space-y-1.5 animate-in fade-in">
                      <p className="text-slate-800">
                        <strong>Namunaviy javob:</strong> {q.modelAnswer}
                      </p>
                      <p className="text-slate-600">
                        <strong>Baholash mezoni:</strong> {q.criteria}
                      </p>
                    </div>
                  )}

                  <div className="print-only text-[10pt] text-gray-700 mt-2 pl-9">
                    <p><strong>Namunaviy javob:</strong> {q.modelAnswer}</p>
                    <p><strong>Mezon:</strong> {q.criteria}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
