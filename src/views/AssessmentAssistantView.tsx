import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Copy,
  Save,
  Printer,
  Table,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { SUBJECTS } from '../data/textbooks';
import { AssessmentRubric } from '../types';
import { callAIGenerator } from '../services/api';
import { useToast } from '../components/Toast';
import { AILoadingIndicator } from '../components/AILoadingIndicator';
import { PrintHeader } from '../components/PrintHeader';

interface Props {
  onSave: (data: any, title: string, subject: string, grade: number, topic: string) => void;
  initialSubject?: string;
}

export const AssessmentAssistantView: React.FC<Props> = ({ onSave, initialSubject }) => {
  const { showToast } = useToast();

  const [subject, setSubject] = useState(initialSubject || "Matematika");
  const [grade, setGrade] = useState<number>(6);
  const [topic, setTopic] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rubric, setRubric] = useState<AssessmentRubric | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      showToast('Iltimos, mavzuni kiriting', 'error');
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);

    try {
      const result = await callAIGenerator('rubric', {
        subject,
        grade,
        topic,
      });

      const newRubric: AssessmentRubric = {
        id: `rubric-${Date.now()}`,
        title: `${grade}-sinf ${subject}: ${topic} (Baholash rubrikasi)`,
        subject,
        grade,
        topic,
        createdAt: new Date().toISOString(),
        criteria: result.criteria || [],
        gradingScale: result.gradingScale || {
          grade5: "86 - 100 ball (A'lo)",
          grade4: "71 - 85 ball (Yaxshi)",
          grade3: "56 - 70 ball (Qoniqarli)",
          grade2: "0 - 55 ball (Qoniqarsiz)",
        },
        feedbackTemplates: result.feedbackTemplates || {
          high: [],
          medium: [],
          supportNeeded: [],
        },
      };

      setRubric(newRubric);
      setIsSuccess(true);
      showToast('✓ Baholash mezonlari tayyorlandi!', 'success');
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (error: any) {
      showToast(error.message || 'Baholash mezonini yaratishda xatolik yuz berdi.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!rubric) return;
    const text = `BAHOLASH MEZONLARI VA RUBRIKA
Fan: ${rubric.subject} (${rubric.grade}-sinf)
Mavzu: ${rubric.topic}

1. MEZONLAR VA DARAJALAR:
${rubric.criteria
  .map(
    (c) =>
      `[${c.category} - ${c.weight}]\n- Boshlang'ich: ${c.levels.beginning}\n- Qoniqarli: ${c.levels.satisfactory}\n- Yaxshi: ${c.levels.good}\n- A'lo: ${c.levels.excellent}`
  )
  .join('\n\n')}

2. BALLAR TAQSIMOTI:
- 5 baho: ${rubric.gradingScale.grade5}
- 4 baho: ${rubric.gradingScale.grade4}
- 3 baho: ${rubric.gradingScale.grade3}
- 2 baho: ${rubric.gradingScale.grade2}

3. O'QUVCHI UCHUN XULOSA VA TAVSIYALAR:
Yuqori natija: ${rubric.feedbackTemplates.high.join('; ')}
O'rta natija: ${rubric.feedbackTemplates.medium.join('; ')}
Qo'llab-quvvatlash: ${rubric.feedbackTemplates.supportNeeded.join('; ')}
`;
    navigator.clipboard.writeText(text);
    showToast('✓ Rubrika nusxalandi', 'success');
  };

  const handleSave = () => {
    if (!rubric) return;
    onSave(
      rubric,
      rubric.title,
      rubric.subject,
      rubric.grade,
      rubric.topic
    );
    showToast('✓ Baholash rubrikasi saqlandi', 'success');
  };

  return (
    <div className="space-y-6">
      <PrintHeader
        documentTitle={`Baholash Mezonlari va Rubrika: ${topic || 'DTS mezonlari'}`}
        subject={subject}
        grade={grade}
        topic={topic}
      />

      {/* Generator Form */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs no-print">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900">
              Baholash mezonlari va rubrika generatori
            </h2>
            <p className="text-xs text-slate-500">
              Shaffof mezonlar, 4 darajali rubrika, ballar tizimi va o‘quvchilar uchun individual fikr-mulohazalar
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
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
                placeholder="Masalan: Musbat va manfiy sonlar amallari"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-98 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Mezonlar tuzilmoqda...' : 'Rubrikani yaratish'}</span>
            </button>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <AILoadingIndicator text="Baholash mezonlari shakllantirilmoqda..." />
        </div>
      )}

      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <AILoadingIndicator isSuccess={true} />
        </div>
      )}

      {/* Generated Rubric Display */}
      {rubric && !isLoading && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-100 text-rose-800">
                Rubrika tayyor
              </span>
              <span className="text-xs text-slate-500">
                {rubric.grade}-sinf · {rubric.subject}
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs"
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
            {/* Criteria Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Table className="w-4 h-4 text-rose-600" />
                <span>Baholash mezonlari va darajalari rubrikasi</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="p-3 font-bold w-1/4">Mezon yo‘nalishi</th>
                      <th className="p-3 font-bold">1-daraja (Boshlang‘ich)</th>
                      <th className="p-3 font-bold">2-daraja (Qoniqarli)</th>
                      <th className="p-3 font-bold">3-daraja (Yaxshi)</th>
                      <th className="p-3 font-bold">4-daraja (A‘lo)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rubric.criteria.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900 bg-slate-50/70 align-top">
                          {c.category}
                          <span className="block text-[11px] font-medium text-rose-600 mt-0.5">
                            Vazni: {c.weight}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 align-top leading-relaxed">
                          {c.levels.beginning}
                        </td>
                        <td className="p-3 text-slate-600 align-top leading-relaxed">
                          {c.levels.satisfactory}
                        </td>
                        <td className="p-3 text-slate-700 align-top leading-relaxed font-medium">
                          {c.levels.good}
                        </td>
                        <td className="p-3 text-emerald-900 bg-emerald-50/40 align-top leading-relaxed font-semibold">
                          {c.levels.excellent}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grading Scale */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase">
                Ballar va baholash shkalasi
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                  <span className="font-bold text-emerald-700">5 baho (A‘lo):</span>
                  <p className="text-slate-600 mt-0.5">{rubric.gradingScale.grade5}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-blue-200">
                  <span className="font-bold text-blue-700">4 baho (Yaxshi):</span>
                  <p className="text-slate-600 mt-0.5">{rubric.gradingScale.grade4}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-amber-200">
                  <span className="font-bold text-amber-700">3 baho (Qoniqarli):</span>
                  <p className="text-slate-600 mt-0.5">{rubric.gradingScale.grade3}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-rose-200">
                  <span className="font-bold text-rose-700">2 baho (Qoniqarsiz):</span>
                  <p className="text-slate-600 mt-0.5">{rubric.gradingScale.grade2}</p>
                </div>
              </div>
            </div>

            {/* Feedback templates */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase">
                O‘quvchilar uchun tavsiyaviy xulosalar (Feedback)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs">
                  <p className="font-bold text-emerald-800 mb-1">A‘lo natija uchun:</p>
                  <ul className="space-y-1 text-slate-700">
                    {rubric.feedbackTemplates.high?.map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs">
                  <p className="font-bold text-blue-800 mb-1">O‘rta natija uchun:</p>
                  <ul className="space-y-1 text-slate-700">
                    {rubric.feedbackTemplates.medium?.map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs">
                  <p className="font-bold text-amber-800 mb-1">Yordam zarur o‘quvchilar:</p>
                  <ul className="space-y-1 text-slate-700">
                    {rubric.feedbackTemplates.supportNeeded?.map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
