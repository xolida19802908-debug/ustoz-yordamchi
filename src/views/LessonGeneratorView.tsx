import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Copy,
  Save,
  Printer,
  Edit3,
  Check,
  RotateCcw,
  Target,
  Clock,
  Layers,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Upload,
  BookMarked,
  FileText,
} from 'lucide-react';
import { SUBJECTS, OFFICIAL_TEXTBOOKS, getAllTextbooks } from '../data/textbooks';
import { callAIGenerator } from '../services/api';
import { useToast } from '../components/Toast';
import { AILoadingIndicator } from '../components/AILoadingIndicator';
import { LessonPlan } from '../types';
import { PrintHeader } from '../components/PrintHeader';
import { CurriculumStepper } from '../components/CurriculumStepper';
import { playChime } from '../utils/audio';

interface Props {
  onSave: (data: any, title: string, subject: string, grade: number, topic: string) => void;
  initialSubject?: string;
}

export const LessonGeneratorView: React.FC<Props> = ({ onSave, initialSubject }) => {
  const { showToast } = useToast();

  // Wizard state: 1 to 7
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selections
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || "O'zbekiston tarixi");
  const [selectedGrade, setSelectedGrade] = useState<number>(8);

  const allTextbooks = getAllTextbooks();
  const matchingTextbooks = allTextbooks.filter(
    (tb) => tb.subjectName === selectedSubject && tb.grade === selectedGrade
  );

  const [selectedTextbookId, setSelectedTextbookId] = useState<string>(
    matchingTextbooks[0]?.id || ''
  );

  // Sync textbook selection when subject or grade changes
  useEffect(() => {
    const matched = allTextbooks.find(
      (tb) => tb.subjectName === selectedSubject && tb.grade === selectedGrade
    );
    if (matched) {
      setSelectedTextbookId(matched.id);
    } else {
      setSelectedTextbookId('');
    }
  }, [selectedSubject, selectedGrade]);

  const currentTextbook = allTextbooks.find((tb) => tb.id === selectedTextbookId);

  // Chapter & topic selection
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [useCustomTopic, setUseCustomTopic] = useState<boolean>(false);

  const currentChapter = currentTextbook?.chapters.find((ch) => ch.id === selectedChapterId);
  const currentTopic = currentChapter?.topics.find((t) => t.id === selectedTopicId);

  // Set default chapter when textbook changes
  useEffect(() => {
    if (currentTextbook && currentTextbook.chapters.length > 0) {
      setSelectedChapterId(currentTextbook.chapters[0].id);
      if (currentTextbook.chapters[0].topics.length > 0) {
        setSelectedTopicId(currentTextbook.chapters[0].topics[0].id);
      }
    } else {
      setSelectedChapterId('');
      setSelectedTopicId('');
    }
  }, [selectedTextbookId]);

  // Set default topic when chapter changes
  useEffect(() => {
    if (currentChapter && currentChapter.topics.length > 0) {
      setSelectedTopicId(currentChapter.topics[0].id);
    } else {
      setSelectedTopicId('');
    }
  }, [selectedChapterId]);

  // Lesson parameters (Step 6)
  const [duration, setDuration] = useState('45 daqiqa');
  const [lessonType, setLessonType] = useState('Aralash dars');
  const [pedagogicalMethod, setPedagogicalMethod] = useState('FSMU va Klaster');
  const [studentLevel, setStudentLevel] = useState("O‘rta daraja");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan['content'] | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Calculate completed steps
  const completedSteps: number[] = [];
  if (selectedSubject) completedSteps.push(1);
  if (selectedGrade) completedSteps.push(2);
  if (selectedTextbookId) completedSteps.push(3);
  if (selectedChapterId) completedSteps.push(4);
  if (selectedTopicId || customTopic.trim()) completedSteps.push(5);
  if (duration && lessonType && pedagogicalMethod) completedSteps.push(6);
  if (lessonPlan) completedSteps.push(7);

  const handleNextStep = () => {
    playChime('click');
    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    playChime('click');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleGenerate = async () => {
    const topicTitle = useCustomTopic && customTopic.trim()
      ? customTopic.trim()
      : currentTopic?.title || currentChapter?.title || `${selectedGrade}-sinf ${selectedSubject} umumiy mavzusi`;

    if (!topicTitle) {
      showToast('Iltimos, dars mavzusini tanlang yoki kiriting', 'error');
      setCurrentStep(5);
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);

    try {
      const result = await callAIGenerator('lesson', {
        subject: selectedSubject,
        grade: selectedGrade,
        topic: topicTitle,
        duration,
        lessonType: `${lessonType} (${pedagogicalMethod})`,
        studentLevel,
        textbookName: currentTextbook?.title,
        chapterTitle: currentChapter?.title,
        keyPoints: currentTopic?.keyPoints,
      });

      setLessonPlan(result);
      setIsSuccess(true);
      showToast('Material muvaffaqiyatli yaratildi! ✓', 'success');
      playChime('celebrate');
      setTimeout(() => setIsSuccess(false), 2500);
    } catch (error: any) {
      showToast(error.message || 'Dars yaratishda xatolik yuz berdi.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!lessonPlan) return;
    const textToCopy = `DARS ISHLANMASI (KONSPEKT)
Fan: ${selectedSubject} (${selectedGrade}-sinf)
Mavzu: ${lessonPlan.topic}
Dars davomiyligi: ${duration}
Dars turi: ${lessonType}
Metodlar: ${pedagogicalMethod}

1. DARS MAQSADI:
- Ta'limiy: ${lessonPlan.objectives.educational}
- Rivojlantiruvchi: ${lessonPlan.objectives.developmental}
- Tarbiyaviy: ${lessonPlan.objectives.upbringing}

2. KUTILAYOTGAN NATIJALAR:
${lessonPlan.expectedResults?.map((o) => '- ' + o).join('\n') || ''}

3. JIHOZLAR VA VOSITALAR:
${lessonPlan.equipment?.map((e) => '- ' + e).join('\n') || ''}

4. DARSNING TEXNOLOGIK XARITASI (BOSQICHLAR):
- Tashkiliy qism (${lessonPlan.stages.organizational.time}): ${lessonPlan.stages.organizational.text}
- Takrorlash (${lessonPlan.stages.review.time}): ${lessonPlan.stages.review.text}
- Yangi mavzu bayoni (${lessonPlan.stages.newTopic.time}): ${lessonPlan.stages.newTopic.text}
- Amaliy mashg‘ulot (${lessonPlan.stages.practical.time}): ${lessonPlan.stages.practical.text}
- Mustahkamlash (${lessonPlan.stages.consolidation.time}): ${lessonPlan.stages.consolidation.text}
- Baholash (${lessonPlan.stages.assessment.time}): ${lessonPlan.stages.assessment.criteria}
- Uy vazifasi (${lessonPlan.stages.homework.time}): ${lessonPlan.stages.homework.text}
- Xulosa: ${lessonPlan.stages.conclusion}
    `;

    navigator.clipboard.writeText(textToCopy);
    showToast('✓ Dars ishlanmasi nusxalandi', 'success');
  };

  const handleSave = () => {
    if (!lessonPlan) return;
    onSave(
      lessonPlan,
      `Dars reja: ${lessonPlan.topic}`,
      selectedSubject,
      selectedGrade,
      lessonPlan.topic
    );
    showToast('✓ Dars muvaffaqiyatli saqlandi', 'success');
    playChime('success');
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedSubjectObj = SUBJECTS.find((s) => s.name === selectedSubject);

  return (
    <div className="space-y-6">
      {/* Printable Document Header */}
      <PrintHeader
        documentTitle={`Dars Ishlanmasi: ${lessonPlan?.topic || 'Dars konspekti'}`}
        subject={selectedSubject}
        grade={selectedGrade}
        topic={lessonPlan?.topic}
      />

      {/* 7-BOSQICHLI PROFESSIONAL WIZARD STEPPER */}
      <CurriculumStepper
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={(step) => {
          playChime('click');
          setCurrentStep(step);
        }}
        title="Darslik asosidagi 12 bosqichli dars ishlanmasi"
        subtitle="O‘zbekiston DTS va milliy o‘quv dasturi talablari asosida to‘liq konspekt tayyorlang"
      />

      {/* STEP CONTENT CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs no-print">
        {/* BOSQICH 01 — FAN */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 text-xs font-extrabold flex items-center justify-center">
                    01
                  </span>
                  <span>Fanni tanlang</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Dars konspekti yaratmoqchi bo‘lgan fanni tanlang
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
                {SUBJECTS.length} ta umumta’lim fani
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {SUBJECTS.map((sub) => {
                const isSelected = selectedSubject === sub.name;
                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      playChime('click');
                      setSelectedSubject(sub.name);
                    }}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-md scale-102'
                        : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 shadow-2xs'}`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">
                        {sub.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {sub.grades[0]}–{sub.grades[sub.grades.length - 1]}-sinflar
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <span>Keyingi: Sinfni tanlash</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* BOSQICH 02 — SINF */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 text-xs font-extrabold flex items-center justify-center">
                    02
                  </span>
                  <span>Sinfni tanlang</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Tanlangan fan: <strong className="text-blue-700 font-bold">{selectedSubject}</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((g) => {
                const isSelected = selectedGrade === g;
                const isAvailable = selectedSubjectObj?.grades.includes(g) ?? true;
                const countMatching = allTextbooks.filter(
                  (tb) => tb.subjectName === selectedSubject && tb.grade === g
                ).length;

                return (
                  <div
                    key={g}
                    onClick={() => {
                      if (isAvailable) {
                        playChime('click');
                        setSelectedGrade(g);
                      }
                    }}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      !isAvailable
                        ? 'opacity-40 bg-slate-100/50 border-slate-200 cursor-not-allowed'
                        : isSelected
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-md scale-102 cursor-pointer'
                        : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 cursor-pointer'
                    }`}
                  >
                    <div className="text-2xl font-extrabold font-heading text-slate-900 mb-1">
                      {g}
                    </div>
                    <div className="text-xs font-bold text-slate-700 mb-2">
                      {g}-sinf
                    </div>
                    {isAvailable ? (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                        countMatching > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {countMatching > 0 ? `${countMatching} ta darslik` : 'Dastur mavjud'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        O‘qitilmaydi
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Orqaga: Fan</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <span>Keyingi: Darslikni tanlash</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* BOSQICH 03 — DARSLIK */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 text-xs font-extrabold flex items-center justify-center">
                    03
                  </span>
                  <span>Darslikni tanlash</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {selectedGrade}-sinf {selectedSubject} uchun vazirlik tasdiqlagan darsliklar
                </p>
              </div>
            </div>

            {matchingTextbooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchingTextbooks.map((tb) => {
                  const isSelected = selectedTextbookId === tb.id;

                  return (
                    <div
                      key={tb.id}
                      onClick={() => {
                        playChime('click');
                        setSelectedTextbookId(tb.id);
                      }}
                      className={`group relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-br from-blue-50/90 to-indigo-50/50 border-blue-500 ring-2 ring-blue-500/25 shadow-lg scale-101'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:-translate-y-1'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                              🎓 {tb.grade}-sinf
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                              📖 {tb.subjectName}
                            </span>
                          </div>

                          {tb.hasPdf ? (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                              ✓ PDF mavjud
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              Elektron dastur
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-extrabold font-heading text-slate-900 group-hover:text-blue-700 transition-colors mb-2 leading-snug">
                          📚 {tb.title}
                        </h4>

                        <div className="space-y-1 text-xs text-slate-600 mb-4">
                          <p><strong className="text-slate-700">Mualliflar:</strong> {tb.authors}</p>
                          <p><strong className="text-slate-700">Nashriyot:</strong> {tb.publisher}</p>
                          {tb.year && (
                            <p className="flex items-center gap-1 text-slate-500">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Nashr yili: <strong>{tb.year}-yil</strong> ({tb.edition || 'Rasmiy'})</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-mono">ID: {tb.id}</span>
                        <div
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-700'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>✓ Tanlandi</span>
                            </>
                          ) : (
                            <span>Tanlash</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <p className="text-xs text-slate-600">
                  Ushbu sinf uchun darslik katalogi qidirilmoqda. Siz erkin mavzu kiritishingiz mumkin.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Orqaga: Sinf</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <span>Keyingi: Bobni tanlash</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* BOSQICH 04 — BOB */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 text-xs font-extrabold flex items-center justify-center">
                    04
                  </span>
                  <span>Bobni tanlang</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Darslik: <strong>{currentTextbook?.title || 'Umumiy darslik'}</strong>
                </p>
              </div>
            </div>

            {currentTextbook && currentTextbook.chapters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTextbook.chapters.map((ch) => {
                  const isSelected = selectedChapterId === ch.id;

                  return (
                    <div
                      key={ch.id}
                      onClick={() => {
                        playChime('click');
                        setSelectedChapterId(ch.id);
                      }}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 hover:-translate-y-0.5'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                            {ch.number}-bob
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            📖 {ch.pages}-betlar
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                          {ch.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {ch.topics.length} ta dars mavzusi
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-end">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-xl ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isSelected ? '✓ Tanlandi' : 'Tanlash'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 text-center">
                <p className="text-xs text-slate-600">
                  Ushbu darslik uchun bevosita mavzuni kiritish orqali davom etishingiz mumkin.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Orqaga: Darslik</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <span>Keyingi: Mavzuni tanlash</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* BOSQICH 05 — MAVZU */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 text-xs font-extrabold flex items-center justify-center">
                    05
                  </span>
                  <span>Mavzuni tanlang</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {currentChapter?.title || 'Darslik mavzulari'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setUseCustomTopic(!useCustomTopic)}
                className="text-xs font-bold text-blue-700 hover:text-blue-800 underline self-start sm:self-auto"
              >
                {useCustomTopic ? 'Mavzular ro‘yxatiga qaytish' : '✍️ O‘z mavzuingizni kiritish'}
              </button>
            </div>

            {useCustomTopic ? (
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Dars mavzusini erkin shaklda kiriting:
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Masalan: Mirzo Ulug‘bek davrida madaniyat va rasadxona..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : currentChapter && currentChapter.topics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {currentChapter.topics.map((t) => {
                  const isSelected = selectedTopicId === t.id;

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        playChime('click');
                        setSelectedTopicId(t.id);
                        setUseCustomTopic(false);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {t.number}-mavzu
                          </span>
                          <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                            📖 {t.page}-bet
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                          {t.title}
                        </h4>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-xl ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isSelected ? '✓ Tanlandi' : 'Tanlash'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 text-center">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Dars mavzusini kiriting..."
                  className="w-full max-w-md px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Orqaga: Bob</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!selectedTopicId && !customTopic.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <span>Keyingi: Dars sozlamalari</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* BOSQICH 06 — DARS SOZLAMALARI */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 text-xs font-extrabold flex items-center justify-center">
                    06
                  </span>
                  <span>Dars parametrlari va metodlari</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Dars davomiyligi, turi, pedagogik metodlar va o‘quvchilar darajasi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Dars davomiyligi */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <label className="block text-xs font-extrabold text-slate-800">
                  Dars davomiyligi
                </label>
                <div className="space-y-1.5">
                  {['45 daqiqa (Standart dars)', '80 daqiqa (Qo‘shaloq para)', '35 daqiqa (Boshlang‘ich)'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                        duration === d
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="line-clamp-1">{d}</span>
                      {duration === d && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dars turi */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <label className="block text-xs font-extrabold text-slate-800">
                  Dars turi
                </label>
                <div className="space-y-1.5">
                  {[
                    'Aralash dars (kombinatsiyalangan)',
                    'Yangi bilim beruvchi dars',
                    'Mustahkamlovchi dars',
                    'Amaliy mashg‘ulot darsi',
                  ].map((lt) => (
                    <button
                      key={lt}
                      type="button"
                      onClick={() => setLessonType(lt)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                        lessonType === lt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="line-clamp-1">{lt}</span>
                      {lessonType === lt && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pedagogik metodlar */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <label className="block text-xs font-extrabold text-slate-800">
                  Pedagogik metod
                </label>
                <div className="space-y-1.5">
                  {[
                    'FSMU va Klaster',
                    'Ven diagrammasi',
                    'Sinkveyn va Aqliy hujum',
                    'B-B-B va Insert metodi',
                  ].map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPedagogicalMethod(pm)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                        pedagogicalMethod === pm
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="line-clamp-1">{pm}</span>
                      {pedagogicalMethod === pm && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* O‘quvchilar darajasi */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <label className="block text-xs font-extrabold text-slate-800">
                  O‘quvchilar darajasi
                </label>
                <div className="space-y-1.5">
                  {[
                    'O‘rta daraja (Standart sinf)',
                    'Kuchli / Ixtisoslashtirilgan',
                    'Boshlang‘ich / Qo‘shimcha yordam',
                    'Turlicha qobiliyatli (inklyuziv)',
                  ].map((sl) => (
                    <button
                      key={sl}
                      type="button"
                      onClick={() => setStudentLevel(sl)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                        studentLevel === sl
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="line-clamp-1">{sl}</span>
                      {studentLevel === sl && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Orqaga: Mavzu</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <span>Keyingi: Yaratish xulosasi</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* BOSQICH 07 — YARATISH VA NATIJA */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 text-xs font-extrabold flex items-center justify-center">
                    07
                  </span>
                  <span>Dars konspektini yaratish va ko‘rish</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  DTS talablariga mos 12 qismli dars ishlanmasi
                </p>
              </div>
            </div>

            {/* Selection Summary */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">
                  Dars konspekti ma’lumotlari
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20">
                  {duration} · {pedagogicalMethod}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Fan va sinf:</span>
                  <strong className="text-white text-sm font-heading">{selectedSubject} ({selectedGrade}-sinf)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Darslik:</span>
                  <strong className="text-blue-300 line-clamp-1">{currentTextbook?.title || 'Umumiy darslik'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Mavzu:</span>
                  <strong className="text-white line-clamp-1">
                    {useCustomTopic ? customTopic : (currentTopic?.title || currentChapter?.title)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Dars turi:</span>
                  <strong className="text-slate-200 line-clamp-1">{lessonType}</strong>
                </div>
              </div>

              {!isLoading && !lessonPlan && (
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-300">
                    Barcha parametrlar tanlandi. DTS dars ishlanmasini yaratishni boshlaysizmi?
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>🚀 USTOZ AI bilan dars yaratish</span>
                  </button>
                </div>
              )}
            </div>

            {/* AI LOADING ANIMATION */}
            {isLoading && (
              <div className="py-12">
                <AILoadingIndicator
                  text="USTOZ AI ishlamoqda..."
                  isSuccess={isSuccess}
                />
              </div>
            )}

            {/* GENERATED 12-PART LESSON PLAN */}
            {lessonPlan && !isLoading && (
              <div className="space-y-6 pt-2">
                {/* Result Action Bar */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>12 qismli dars konspekti muvaffaqiyatli yaratildi! ✓</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isEditing
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'Tahrirni yakunlash' : 'Tahrirlash'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Nusxalash</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Saqlash</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Chop etish</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerate}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Qayta yaratish</span>
                    </button>
                  </div>
                </div>

                {/* 12-Section Content */}
                <div className="space-y-5">
                  {/* 1. Dars maqsadi */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                    <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span>1. Dars maqsadi (Uchlik maqsad)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                        <span className="font-extrabold text-blue-900 block mb-1">A) Ta’limiy maqsad:</span>
                        <p className="text-slate-700 leading-relaxed">{lessonPlan.objectives.educational}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                        <span className="font-extrabold text-emerald-900 block mb-1">B) Rivojlantiruvchi maqsad:</span>
                        <p className="text-slate-700 leading-relaxed">{lessonPlan.objectives.developmental}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                        <span className="font-extrabold text-purple-900 block mb-1">C) Tarbiyaviy maqsad:</span>
                        <p className="text-slate-700 leading-relaxed">{lessonPlan.objectives.upbringing}</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Kutilayotgan natijalar va Jihozlar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                      <h4 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>2. Kutilayotgan natijalar</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {lessonPlan.expectedResults?.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                      <h4 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-600" />
                        <span>3. Dars jihozlari va vositalari</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {lessonPlan.equipment?.map((eq, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-purple-500 font-bold">•</span>
                            <span>{eq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 4. Texnologik xarita (Dars bosqichlari) */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                    <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      <span>4. Darsning texnologik xaritasi (Bosqichma-bosqich reja)</span>
                    </h3>

                    <div className="space-y-3 text-xs">
                      {/* Tashkiliy qism */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-slate-900">1. Tashkiliy qism</span>
                          <span className="font-bold text-blue-700">{lessonPlan.stages.organizational.time}</span>
                        </div>
                        <p className="text-slate-600">{lessonPlan.stages.organizational.text}</p>
                      </div>

                      {/* O'tgan mavzuni takrorlash */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-slate-900">2. O‘tgan mavzuni mustahkamlash va faollashtirish</span>
                          <span className="font-bold text-blue-700">{lessonPlan.stages.review.time}</span>
                        </div>
                        <p className="text-slate-600 mb-2">{lessonPlan.stages.review.text}</p>
                        {lessonPlan.stages.review.questions && (
                          <ul className="pl-4 list-disc space-y-1 text-slate-700">
                            {lessonPlan.stages.review.questions.map((q, idx) => (
                              <li key={idx}>{q}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Yangi mavzu bayoni */}
                      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-blue-950">3. Yangi mavzu bayoni</span>
                          <span className="font-bold text-blue-700">{lessonPlan.stages.newTopic.time}</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed mb-2 font-serif">{lessonPlan.stages.newTopic.text}</p>
                        {lessonPlan.stages.newTopic.keyPoints && (
                          <div className="pt-2 border-t border-blue-100 flex flex-wrap gap-2">
                            {lessonPlan.stages.newTopic.keyPoints.map((kp, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-100/70 text-blue-900 font-semibold text-[11px]">
                                • {kp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Amaliy mashg'ulot */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-slate-900">4. Amaliy mashg‘ulot va mustaqil ish</span>
                          <span className="font-bold text-blue-700">{lessonPlan.stages.practical.time}</span>
                        </div>
                        <p className="text-slate-600 mb-2">{lessonPlan.stages.practical.text}</p>
                        {lessonPlan.stages.practical.tasks && (
                          <ul className="pl-4 list-disc space-y-1 text-slate-700">
                            {lessonPlan.stages.practical.tasks.map((task, idx) => (
                              <li key={idx}>{task}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Mustahkamlash */}
                      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-emerald-950">5. Darsni mustahkamlash</span>
                          <span className="font-bold text-emerald-700">{lessonPlan.stages.consolidation.time}</span>
                        </div>
                        <p className="text-slate-700 mb-2">{lessonPlan.stages.consolidation.text}</p>
                        {lessonPlan.stages.consolidation.quickCheck && (
                          <ul className="pl-4 list-disc space-y-1 text-emerald-900">
                            {lessonPlan.stages.consolidation.quickCheck.map((qc, idx) => (
                              <li key={idx}>{qc}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Baholash va Uyga vazifa */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-extrabold text-amber-950">6. Baholash va rag‘batlantirish</span>
                            <span className="font-bold text-amber-700">{lessonPlan.stages.assessment.time}</span>
                          </div>
                          <p className="text-amber-900">{lessonPlan.stages.assessment.criteria}</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-extrabold text-purple-950">7. Uyga vazifa</span>
                            <span className="font-bold text-purple-700">{lessonPlan.stages.homework.time}</span>
                          </div>
                          <p className="text-purple-900">{lessonPlan.stages.homework.text}</p>
                        </div>
                      </div>

                      {/* Xulosa */}
                      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700">
                        <span className="font-extrabold text-slate-900 block mb-1">8. Dars xulosasi:</span>
                        <p>{lessonPlan.stages.conclusion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
