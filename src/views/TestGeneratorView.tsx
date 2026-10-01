import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Sparkles,
  BookOpen,
  AlertTriangle,
  Upload,
  Search,
  Globe,
  CheckCircle,
  Eye,
  EyeOff,
  Edit2,
  Save,
  Printer,
  RotateCcw,
  Play,
  HelpCircle,
  BookMarked,
  Info,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Layers,
  Award,
  Check,
  Plus,
  Compass,
  FileText,
  Sliders,
} from 'lucide-react';
import { SUBJECTS, OFFICIAL_TEXTBOOKS, getAllTextbooks } from '../data/textbooks';
import { Textbook, TextbookChapter, TestQuestion, TestSet } from '../types';
import { callAIGenerator } from '../services/api';
import { useToast } from '../components/Toast';
import { AILoadingIndicator } from '../components/AILoadingIndicator';
import { PrintHeader } from '../components/PrintHeader';
import { CurriculumStepper } from '../components/CurriculumStepper';
import { playChime } from '../utils/audio';

interface Props {
  onSave: (data: any, title: string, subject: string, grade: number, topic: string) => void;
  onStartTakingTest: (testSet: TestSet) => void;
  initialSubject?: string;
}

export const TestGeneratorView: React.FC<Props> = ({
  onSave,
  onStartTakingTest,
  initialSubject,
}) => {
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

  // Test parameters (Step 6)
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>("O‘rta");
  const [questionType, setQuestionType] = useState<string>("4 variantli yopiq test");
  const [testPurpose, setTestPurpose] = useState<string>("Darsni mustahkamlash");

  // Fallback / missing textbook modal states
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [showPdfUploadModal, setShowPdfUploadModal] = useState(false);
  const [uploadedPdfText, setUploadedPdfText] = useState('');
  const [allowGeneralKnowledge, setAllowGeneralKnowledge] = useState(false);

  // Generated state
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [testSet, setTestSet] = useState<TestSet | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [revealAll, setRevealAll] = useState(false);

  // Calculate completed steps
  const completedSteps: number[] = [];
  if (selectedSubject) completedSteps.push(1);
  if (selectedGrade) completedSteps.push(2);
  if (selectedTextbookId || uploadedPdfText) completedSteps.push(3);
  if (selectedChapterId || uploadedPdfText) completedSteps.push(4);
  if (selectedTopicId || customTopic.trim() || uploadedPdfText) completedSteps.push(5);
  if (questionCount && difficulty && questionType) completedSteps.push(6);
  if (testSet) completedSteps.push(7);

  const toggleAnswer = (num: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const toggleRevealAll = () => {
    const next = !revealAll;
    setRevealAll(next);
    if (testSet) {
      const updated: Record<number, boolean> = {};
      testSet.questions.forEach((q) => {
        updated[q.number] = next;
      });
      setRevealedAnswers(updated);
    }
  };

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

  const handleGenerate = async (forceGeneral = false) => {
    if ((!currentTextbook || !currentTextbook.available) && !allowGeneralKnowledge && !forceGeneral && !uploadedPdfText) {
      setShowMissingModal(true);
      return;
    }

    const topicTitle = useCustomTopic && customTopic.trim()
      ? customTopic.trim()
      : currentTopic?.title || currentChapter?.title || `${selectedGrade}-sinf ${selectedSubject} umumiy mavzusi`;

    if (!topicTitle) {
      showToast('Iltimos, mavzuni tanlang yoki kiriting', 'error');
      setCurrentStep(5);
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);

    const sourceInfo = currentTextbook?.available && currentTopic
      ? `Manba: ${currentTextbook.title}, ${currentTopic.page}-bet`
      : uploadedPdfText
      ? "Manba: O‘qituvchi yuklagan PDF darslik matni asosida"
      : `${selectedGrade}-sinf ${selectedSubject} rasmiy dasturi`;

    try {
      const result = await callAIGenerator('test', {
        subject: selectedSubject,
        grade: selectedGrade,
        textbookName: currentTextbook?.title || `${selectedGrade}-sinf ${selectedSubject} darsligi`,
        chapterTitle: currentChapter?.title || "Umumiy bo‘lim",
        topicTitle,
        count: questionCount,
        difficulty,
        questionType,
        sourceInfo,
        contextText: uploadedPdfText || (currentTopic?.keyPoints?.join('. ') ?? ''),
        isTextbookBased: Boolean(currentTextbook?.available || uploadedPdfText),
      });

      const newTestSet: TestSet = {
        id: `test-${Date.now()}`,
        title: `${selectedGrade}-sinf ${selectedSubject}: ${topicTitle}`,
        subject: selectedSubject,
        grade: selectedGrade,
        textbookName: currentTextbook?.title || `${selectedGrade}-sinf darsligi`,
        chapterTitle: currentChapter?.title,
        topicTitle,
        difficulty,
        questionType,
        isTextbookBased: Boolean(currentTextbook?.available || uploadedPdfText),
        createdAt: new Date().toISOString(),
        questions: result.questions || [],
      };

      setTestSet(newTestSet);
      setIsSuccess(true);
      setRevealedAnswers({});
      setRevealAll(false);
      showToast('Material muvaffaqiyatli yaratildi! ✓', 'success');
      playChime('celebrate');
      setTimeout(() => setIsSuccess(false), 2500);
    } catch (error: any) {
      showToast(error.message || 'Test yaratishda xatolik yuz berdi.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!testSet) return;
    onSave(
      testSet,
      testSet.title,
      testSet.subject,
      testSet.grade,
      testSet.topicTitle
    );
    showToast('✓ Test muvaffaqiyatli saqlandi', 'success');
    playChime('success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleQuestionEdit = (qId: string, updatedFields: Partial<TestQuestion>) => {
    if (!testSet) return;
    const updatedQuestions = testSet.questions.map((q) =>
      q.id === qId ? { ...q, ...updatedFields } : q
    );
    setTestSet({ ...testSet, questions: updatedQuestions });
    setEditingQuestionId(null);
    showToast('✓ Savol muvaffaqiyatli tahrirlandi', 'success');
  };

  const selectedSubjectObj = SUBJECTS.find((s) => s.name === selectedSubject);

  return (
    <div className="space-y-6">
      {/* Printable Header */}
      <PrintHeader
        documentTitle={`Nazorat Testi: ${testSet?.topicTitle || 'Darslik testi'}`}
        subject={selectedSubject}
        grade={selectedGrade}
        topic={testSet?.topicTitle}
      />

      {/* 7-BOSQICHLI PROFESSIONAL WIZARD STEPPER */}
      <CurriculumStepper
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={(step) => {
          playChime('click');
          setCurrentStep(step);
        }}
        title="Darslik asosidagi test yaratish markazi"
        subtitle="Fan, sinf, darslik, bob va aniq mavzular bo‘yicha sifatli nazorat testi tuzing"
      />

      {/* STEP CONTENT CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs no-print">
        {/* BOSQICH 01 — FAN */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">
                    01
                  </span>
                  <span>Fanni tanlang</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Test yaratmoqchi bo‘lgan o‘quv fanini tanlang
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
                        ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md scale-102'
                        : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 shadow-2xs'}`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
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
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
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
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">
                    02
                  </span>
                  <span>Sinfni tanlang</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Tanlangan fan: <strong className="text-emerald-700 font-bold">{selectedSubject}</strong>
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
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md scale-102 cursor-pointer'
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
                        countMatching > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
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
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <span>Keyingi: Darslikni tanlash</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* BOSQICH 03 — DARSLIK (PROFESSIONAL CARD/GRID LAYOUT) */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">
                    03
                  </span>
                  <span>Darslikni tanlash</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {selectedGrade}-sinf {selectedSubject} uchun vazirlik tasdiqlagan darsliklar ro‘yxati
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPdfUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Upload className="w-4 h-4" />
                <span>O‘z darsligingizni / PDF matnini yuklash</span>
              </button>
            </div>

            {uploadedPdfText && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-600 text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-900">
                      Maxsus darslik parchasi yuklangan ({uploadedPdfText.length} belgi)
                    </h4>
                    <p className="text-[11px] text-blue-700">
                      AI ushbu kiritilgan matnga asoslanib savollar tuzadi
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedPdfText('')}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
                >
                  O‘chirish
                </button>
              </div>
            )}

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
                          ? 'bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border-emerald-500 ring-2 ring-emerald-500/25 shadow-lg scale-101'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:-translate-y-1'
                      }`}
                    >
                      <div>
                        {/* Header Badges */}
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
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <span>✓ PDF tahlil qilingan</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              Elektron matn
                            </span>
                          )}
                        </div>

                        {/* Title & Authors */}
                        <h4 className="text-base font-extrabold font-heading text-slate-900 group-hover:text-emerald-700 transition-colors mb-2 leading-snug">
                          📚 {tb.title}
                        </h4>

                        <div className="space-y-1 text-xs text-slate-600 mb-4">
                          <p>
                            <strong className="text-slate-700">Mualliflar:</strong> {tb.authors}
                          </p>
                          <p>
                            <strong className="text-slate-700">Nashriyot:</strong> {tb.publisher}
                          </p>
                          {tb.year && (
                            <p className="flex items-center gap-1 text-slate-500">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Nashr yili: <strong>{tb.year}-yil</strong> ({tb.edition || 'Rasmiy nashr'})</span>
                            </p>
                          )}
                          <p className="text-emerald-800 font-semibold text-[11px] pt-1">
                            Boblari soni: {tb.chapters.length} ta bob · {tb.chapters.reduce((acc, c) => acc + c.topics.length, 0)} ta mavzu
                          </p>
                        </div>
                      </div>

                      {/* Selection Action Button */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-mono">ID: {tb.id}</span>
                        <div
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700'
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
              <div className="p-8 rounded-3xl bg-amber-50/80 border border-amber-200 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-amber-900">
                    {selectedGrade}-sinf {selectedSubject} uchun tasdiqlangan elektron darslik qidirilmoqda
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto">
                    Siz ushbu darslik matnini yoki PDF nusxasini yuklashingiz yoxud umumiy ta’lim dasturi asosida test yaratishingiz mumkin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPdfUploadModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm"
                >
                  📤 PDF yuklash yoki matn kiritish
                </button>
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
                disabled={!selectedTextbookId && !uploadedPdfText}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
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
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">
                    04
                  </span>
                  <span>Bobni tanlang</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Darslik: <strong>{currentTextbook?.title}</strong>
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
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
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
                          Ushbu bobda <strong>{ch.topics.length} ta dars mavzusi</strong> mavjud
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {ch.topics.map((t) => t.title).slice(0, 2).join(', ')}...
                        </span>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-xl ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700'
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
                  Ushbu darslik uchun alohida boblar ajratilmagan, to‘g‘ridan-to‘g‘ri umumiy dastur bo‘yicha davom etishingiz mumkin.
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
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
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
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">
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
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline self-start sm:self-auto"
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
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-500">
                  AI ushbu kiritilgan mavzu bo‘yicha milliy standartlar asosida savollar tuzadi.
                </p>
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
                          ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {t.number}-mavzu
                          </span>
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            📖 {t.page}-bet
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                          {t.title}
                        </h4>

                        {t.keyPoints && t.keyPoints.length > 0 && (
                          <div className="space-y-1 mb-3">
                            {t.keyPoints.slice(0, 2).map((kp, idx) => (
                              <p key={idx} className="text-[11px] text-slate-600 line-clamp-1 flex items-start gap-1">
                                <span className="text-emerald-600">•</span>
                                <span>{kp}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          Sahifalar: {t.pagesRange || `${t.page}-bet`}
                        </span>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-xl ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700'
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
                <p className="text-xs text-slate-500 mb-3">
                  Ushbu bo‘lim uchun mavzular ro‘yxati topilmadi. Mavzuni qo‘lda kiriting:
                </p>
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
                disabled={!selectedTopicId && !customTopic.trim() && !uploadedPdfText}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <span>Keyingi: Test sozlamalari</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* BOSQICH 06 — TEST SOZLAMALARI */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">
                    06
                  </span>
                  <span>Test parametrlarini sozlang</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Savollar soni, murakkablik va test formatini tanlang
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Savollar soni */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <label className="block text-xs font-extrabold text-slate-800">
                  Savollar soni
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[5, 10, 15, 20].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        questionCount === cnt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cnt} ta savol
                    </button>
                  ))}
                </div>
              </div>

              {/* Qiyinlik darajasi */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <label className="block text-xs font-extrabold text-slate-800">
                  Qiyinlik darajasi
                </label>
                <div className="space-y-1.5">
                  {['Oson', 'O‘rta', 'Qiyin', 'Aralash daraja'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                        difficulty === lvl
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{lvl}</span>
                      {difficulty === lvl && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Savol turi */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <label className="block text-xs font-extrabold text-slate-800">
                  Savol turi
                </label>
                <div className="space-y-1.5">
                  {[
                    '4 variantli yopiq test',
                    'To‘g‘ri / Noto‘g‘ri test',
                    'Ochiq va mantiqiy savollar',
                  ].map((qt) => (
                    <button
                      key={qt}
                      type="button"
                      onClick={() => setQuestionType(qt)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                        questionType === qt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="line-clamp-1">{qt}</span>
                      {questionType === qt && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test maqsadi */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <label className="block text-xs font-extrabold text-slate-800">
                  Test maqsadi
                </label>
                <div className="space-y-1.5">
                  {[
                    'Darsni mustahkamlash',
                    'BSB (Bo‘lim baholash)',
                    'CHSB (Choraklik nazorat)',
                    'Fan olimpiadasi',
                  ].map((purp) => (
                    <button
                      key={purp}
                      type="button"
                      onClick={() => setTestPurpose(purp)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                        testPurpose === purp
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{purp}</span>
                      {testPurpose === purp && <Check className="w-3.5 h-3.5" />}
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
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
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
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">
                    07
                  </span>
                  <span>Test yaratish va natijalar</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Tanlangan parametrlar asosida darslikka asoslangan test generatsiyasi
                </p>
              </div>
            </div>

            {/* Selection Summary Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                  Tanlangan darslik va mavzu ma’lumotlari
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20">
                  {testPurpose}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Fan va sinf:</span>
                  <strong className="text-white text-sm font-heading">{selectedSubject} ({selectedGrade}-sinf)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Darslik:</span>
                  <strong className="text-emerald-300 line-clamp-1">{currentTextbook?.title || 'Umumiy darslik'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Mavzu:</span>
                  <strong className="text-white line-clamp-1">
                    {useCustomTopic ? customTopic : (currentTopic?.title || currentChapter?.title)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Sozlamalar:</span>
                  <strong className="text-slate-200">
                    {questionCount} ta savol · {difficulty} · {questionType}
                  </strong>
                </div>
              </div>

              {!isLoading && !testSet && (
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-300">
                    Barcha bosqichlar to‘ldirildi. Testni yaratishga tayyormisiz?
                  </span>
                  <button
                    type="button"
                    onClick={() => handleGenerate(false)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>🚀 USTOZ AI bilan test yaratish</span>
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

            {/* TEST SET GENERATED RESULTS */}
            {testSet && !isLoading && (
              <div className="space-y-6 pt-2">
                {/* Result Action Bar */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Material muvaffaqiyatli yaratildi! ({testSet.questions.length} ta savol)</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onStartTakingTest(testSet)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Testni talabalar bilan ishlash</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleRevealAll}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                    >
                      {revealAll ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{revealAll ? 'Javoblarni yashirish' : 'Javoblarni ko‘rsatish'}</span>
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
                      onClick={() => handleGenerate(false)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Qayta yaratish</span>
                    </button>
                  </div>
                </div>

                {/* Questions Cards */}
                <div className="space-y-4">
                  {testSet.questions.map((q) => {
                    const isRevealed = revealedAnswers[q.number] || revealAll;

                    return (
                      <div
                        key={q.number}
                        className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all print-card"
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-extrabold flex items-center justify-center shrink-0 border border-emerald-200">
                              {q.number}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 leading-snug">
                              {q.question}
                            </h3>
                          </div>

                          <div className="flex items-center gap-1.5 no-print shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleAnswer(q.number)}
                              className="text-xs text-slate-500 hover:text-emerald-700 font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 transition-colors"
                            >
                              {isRevealed ? 'Javobni yashirish' : 'Javobni ko‘rsatish'}
                            </button>
                          </div>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-11 mb-3">
                          {q.options.map((opt) => {
                            const isCorrect = opt.key === q.correctAnswer;
                            const showHighlight = isRevealed && isCorrect;

                            return (
                              <div
                                key={opt.key}
                                className={`p-3.5 rounded-2xl border text-xs sm:text-sm transition-all ${
                                  showHighlight
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs'
                                    : 'bg-slate-50/70 border-slate-200/80 text-slate-700'
                                }`}
                              >
                                <span className="font-extrabold mr-2 text-slate-500">
                                  {opt.key})
                                </span>
                                <span>{opt.text}</span>
                                {showHighlight && (
                                  <span className="ml-2 text-[10px] text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                                    ✓ To‘g‘ri javob
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation & Source (Revealed) */}
                        {isRevealed && (
                          <div className="ml-11 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs space-y-1 animate-in fade-in duration-200">
                            <p className="text-slate-800 leading-relaxed">
                              <strong>Pedagogik izoh:</strong> {q.explanation}
                            </p>
                            <p className="text-blue-900 font-bold text-[11px] pt-1">
                              {q.source}
                            </p>
                          </div>
                        )}

                        <div className="print-only text-[9pt] text-gray-600 mt-2 pl-11">
                          {q.source}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Missing Textbook Modal */}
      {showMissingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold font-heading text-slate-900">
                Tanlangan darslikning elektron nusxasi topilmadi.
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Ushbu darslikning to‘liq matni hozircha raqamlashtirilmagan. Siz o‘zingizdagi darslik parchasini yuklashingiz yoki boshqa darslikni tanlashingiz mumkin.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowMissingModal(false);
                  setShowPdfUploadModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>📤 PDF yuklash / Matn kiritish</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMissingModal(false);
                  setCurrentStep(3);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>🔎 Boshqa darslikni tanlash</span>
              </button>

              <a
                href="https://edu.uz"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Globe className="w-4 h-4 text-slate-500" />
                <span>🌐 Rasmiy manbadan qidirish (edu.uz)</span>
              </a>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-800 mb-2">
                “Darslik manbasi mavjud emas. Umumiy bilim asosida test yaratilsinmi?”
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAllowGeneralKnowledge(true);
                    setShowMissingModal(false);
                    handleGenerate(true);
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Ha, umumiy bilim asosida tuzilsin
                </button>
                <button
                  type="button"
                  onClick={() => setShowMissingModal(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Yo‘q
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Upload / Excerpt Paste Modal */}
      {showPdfUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Darslik matni yoki PDF parchasini kiritish</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPdfUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Darslikdan nusxa olingan matnni yoki konspektni shu yerga joylashtiring. USTOZ AI aynan shu matndagi faktlar asosida test tuzadi.
            </p>

            <textarea
              rows={6}
              value={uploadedPdfText}
              onChange={(e) => setUploadedPdfText(e.target.value)}
              placeholder="Darslikdagi matnni, bob yoki mavzuni shu yerga kiriting..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPdfUploadModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPdfUploadModal(false);
                  showToast('✓ Darslik matni muvaffaqiyatli saqlandi', 'success');
                  setCurrentStep(6);
                }}
                disabled={!uploadedPdfText.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                Matnni qo‘llash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
