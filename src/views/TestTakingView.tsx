import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Award,
  BookOpen,
  Sparkles,
  Flame,
  Star,
  Check,
  Zap,
  Trophy,
} from 'lucide-react';
import { TestSet } from '../types';
import { playChime } from '../utils/audio';
import { recordQuestionAnswer, completeTopic, Achievement } from '../utils/gamification';

interface Props {
  testSet: TestSet;
  onBackToEditor: () => void;
}

export const TestTakingView: React.FC<Props> = ({ testSet, onBackToEditor }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [answeredState, setAnsweredState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [comboCount, setComboCount] = useState(0);
  const [currentXPBonus, setCurrentXPBonus] = useState<number | null>(null);
  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions = testSet.questions;
  const currentQuestion = questions[currentIndex];
  const total = questions.length;

  // Reset answer state when index changes
  useEffect(() => {
    setAnsweredState('idle');
    setCurrentXPBonus(null);
  }, [currentIndex]);

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    if (answeredState !== 'idle' || isSubmitted) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.number]: key,
    }));

    const isCorrect = key === currentQuestion.correctAnswer;
    const isDifficult = currentQuestion.difficulty === 'Qiyin';

    // Record gamification stats
    const { xpGained, newCombo, newAchievements } = recordQuestionAnswer(isCorrect, isDifficult);

    setComboCount(newCombo);

    if (isCorrect) {
      setAnsweredState('correct');
      setCurrentXPBonus(xpGained);
      playChime(newCombo >= 3 ? 'combo' : 'correct');
    } else {
      setAnsweredState('incorrect');
      playChime('incorrect');
    }

    if (newAchievements.length > 0) {
      setActiveAchievement(newAchievements[0]);
      setTimeout(() => setActiveAchievement(null), 3500);
    }
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    completeTopic(testSet.id);
    playChime('celebrate');
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setAnsweredState('idle');
    setComboCount(0);
    setIsSubmitted(false);
    setCurrentIndex(0);
  };

  // Calculate score
  let correctCount = 0;
  questions.forEach((q) => {
    if (selectedAnswers[q.number] === q.correctAnswer) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / total) * 100);
  const incorrectCount = total - correctCount;

  // Grade classification
  const getGradeTitle = (pct: number) => {
    if (pct >= 86)
      return {
        grade: "5 (A‘lo)",
        color: "text-emerald-600",
        bg: "bg-emerald-50 border-emerald-200",
        message: "Juda yaxshi natija! Mavzuni a’lo darajada o‘zlashtirdingiz!",
      };
    if (pct >= 71)
      return {
        grade: "4 (Yaxshi)",
        color: "text-blue-600",
        bg: "bg-blue-50 border-blue-200",
        message: "Yaxshi natija! O‘zlashtirishingiz yuqori darajada!",
      };
    if (pct >= 56)
      return {
        grade: "3 (Qoniqarli)",
        color: "text-amber-600",
        bg: "bg-amber-50 border-amber-200",
        message: "Bugun yangi narsalarni o‘rgandingiz. Yana bir marta urinib ko‘ring! 💪",
      };
    return {
      grade: "2 (Qoniqarsiz)",
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-200",
      message: "Darslikdagi mavzuni qayta ko‘rib chiqib, qayta ishlab ko‘ring. Bilim takrorlash bilan mustahkamlanadi! 📖",
    };
  };

  const gradeInfo = getGradeTitle(percentage);

  // If submitted, show results screen with DISCOVER moment
  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-400">
        {/* Result Header Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-xl text-center relative overflow-hidden">
          {/* Subtle celebration aura */}
          <div className="absolute inset-0 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            {percentage >= 70 ? (
              <Trophy className="w-8 h-8 animate-bounce" />
            ) : (
              <BookOpen className="w-8 h-8" />
            )}
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Test yakunlandi
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 mt-2 mb-1">
            {percentage >= 86
              ? '🎉 Ajoyib g‘alaba va yuksak bilim!'
              : percentage >= 70
              ? '👏 Juda yaxshi natija!'
              : '💪 Yaxshi urinish, bilimingiz oshayapti!'}
          </h2>

          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
            {gradeInfo.message}
          </p>

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto mb-8">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {correctCount} / {total}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">To‘g‘ri javoblar</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-2xl font-extrabold text-emerald-600 tabular-nums">
                {percentage}%
              </p>
              <p className="text-[11px] text-slate-500 font-medium">O‘zlashtirish</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-2xl font-extrabold text-amber-600 tabular-nums flex items-center justify-center gap-1">
                <span>+{correctCount * 10}</span>
                <Star className="w-4 h-4 fill-current" />
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Yig‘ilgan XP</p>
            </div>

            <div className={`p-3.5 rounded-2xl border ${gradeInfo.bg}`}>
              <p className={`text-2xl font-extrabold tabular-nums ${gradeInfo.color}`}>
                {gradeInfo.grade.split(' ')[0]}
              </p>
              <p className="text-[11px] text-slate-600 font-medium">Baho</p>
            </div>
          </div>

          {/* DISCOVER Moment (Requirement #14): 3 Verified Textbook Facts */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-left mb-6 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>✨ Siz yangi bilimni kashf qildingiz! (Darslikdagi muhim faktlar)</span>
            </div>
            <ul className="space-y-1.5 text-xs text-amber-950">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">1.</span>
                <span>{testSet.questions[0]?.explanation || 'Mavzuning asosiy qonuniyati darslikda isbotlangan.'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">2.</span>
                <span>{testSet.questions[1]?.explanation || 'Faktlar bevosita darslik manbasiga tayanadi.'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">3.</span>
                <span>{testSet.questions[2]?.explanation || 'Ushbu tushuncha fanning keyingi bo‘limlariga poydevor hisoblanadi.'}</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Qaytadan ishlash</span>
            </button>

            <button
              onClick={onBackToEditor}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Test tahririga qaytish</span>
            </button>
          </div>
        </div>

        {/* Detailed Breakdown Review */}
        <div className="space-y-4">
          <h3 className="text-base font-bold font-heading text-slate-900">
            Savollar tahlili va darslik izohlari
          </h3>

          {questions.map((q) => {
            const userAnswer = selectedAnswers[q.number];
            const isCorrect = userAnswer === q.correctAnswer;

            return (
              <div
                key={q.number}
                className={`p-5 rounded-2xl bg-white border shadow-xs transition-all ${
                  isCorrect ? 'border-emerald-200/90' : 'border-rose-200/90'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {q.number}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                      {q.question}
                    </h4>
                  </div>
                  {isCorrect ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>To‘g‘ri</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded shrink-0">
                      <XCircle className="w-4 h-4" />
                      <span>Xato</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9 mb-3">
                  {q.options.map((opt) => {
                    const isSelected = userAnswer === opt.key;
                    const isAnsCorrect = opt.key === q.correctAnswer;

                    return (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border text-xs ${
                          isAnsCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                            : isSelected
                            ? 'bg-rose-50 border-rose-300 text-rose-950'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="font-bold mr-1.5">{opt.key})</span>
                        <span>{opt.text}</span>
                        {isAnsCorrect && (
                          <span className="ml-1.5 text-[10px] text-emerald-700 font-bold">
                            (To‘g‘ri javob)
                          </span>
                        )}
                        {isSelected && !isAnsCorrect && (
                          <span className="ml-1.5 text-[10px] text-rose-700 font-bold">
                            (Siz tanladingiz)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="ml-9 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <p className="text-slate-700">
                    <strong>Darslik izohi:</strong> {q.explanation}
                  </p>
                  <p className="text-blue-700 font-medium text-[11px]">
                    {q.source}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Interactive Test-Taking Mode
  const currentAnswer = selectedAnswers[currentQuestion.number];
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Achievement Unlocked Notification Banner (Requirement #9) */}
      {activeAchievement && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeAchievement.icon}</span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-950">
                🏆 Yangi yutuq ochildi!
              </p>
              <h4 className="text-xs font-black">{activeAchievement.title}</h4>
              <p className="text-[11px] text-amber-900">{activeAchievement.description}</p>
            </div>
          </div>
          <span className="text-xs font-black px-2.5 py-1 bg-white/40 rounded-lg">
            +50 XP
          </span>
        </div>
      )}

      {/* Top Header with Progress & Streak Badges */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-800">
            Savol {currentIndex + 1} / {total}
          </span>

          {/* Combo Badge (Requirement #7) */}
          {comboCount >= 3 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-extrabold animate-pulse shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>
                {comboCount >= 10
                  ? '🏆 10 ta ketma-ket!'
                  : comboCount >= 5
                  ? '⚡ 5 ta ketma-ket!'
                  : '🔥 3 ta ketma-ket!'}
              </span>
            </span>
          )}
        </div>

        <button
          onClick={onBackToEditor}
          className="text-xs font-semibold text-slate-400 hover:text-slate-800 transition-colors"
        >
          Chiqish
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden -mt-2">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card with Entry Animation (Requirement #4) */}
      <div
        key={currentIndex}
        className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300 relative overflow-hidden"
      >
        <div className="flex items-start gap-3 mb-6">
          <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold flex items-center justify-center shrink-0">
            {currentQuestion.number}
          </span>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
              {currentQuestion.difficulty}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mt-1">
              {currentQuestion.question}
            </h3>
          </div>
        </div>

        {/* Options Staggered Entrance (Requirement #4) */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((opt, optIdx) => {
            const isSelected = currentAnswer === opt.key;
            const isCorrect = opt.key === currentQuestion.correctAnswer;
            const hasAnswered = answeredState !== 'idle';

            let btnClass = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

            if (hasAnswered) {
              if (isCorrect) {
                btnClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
              } else if (isSelected && !isCorrect) {
                btnClass = 'bg-rose-50 border-rose-300 text-rose-950 font-medium';
              } else {
                btnClass = 'bg-slate-50/50 border-slate-200/50 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={opt.key}
                onClick={() => handleSelectOption(opt.key)}
                disabled={hasAnswered}
                style={{ animationDelay: `${optIdx * 50}ms` }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all animate-in fade-in slide-in-from-bottom-1 cursor-pointer ${btnClass}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                      hasAnswered && isCorrect
                        ? 'bg-emerald-600 text-white'
                        : hasAnswered && isSelected && !isCorrect
                        ? 'bg-rose-500 text-white'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="text-sm">{opt.text}</span>
                </div>

                {hasAnswered && isCorrect && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Messages (Requirements #5 & #6) */}
        {answeredState === 'correct' && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between mb-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>To‘g‘ri! Barakalla! Davom eting! 🔥</span>
            </div>
            {currentXPBonus && (
              <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>+{currentXPBonus} XP</span>
              </span>
            )}
          </div>
        )}

        {answeredState === 'incorrect' && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs font-medium space-y-1 mb-4 animate-in zoom-in-95 duration-200">
            <p className="font-bold text-amber-900">
              Bu safar xato bo‘ldi. Darslikdagi mavzuni yana bir bor ko‘rib chiqing. 📖
            </p>
            <p className="text-slate-600 text-[11px]">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-xs font-semibold text-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Oldingi</span>
          </button>

          {currentIndex === total - 1 ? (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <span>Testni yakunlash</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
            >
              <span>Keyingi savol</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
