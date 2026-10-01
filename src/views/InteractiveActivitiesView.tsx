import React, { useState } from 'react';
import {
  Gamepad2,
  Sparkles,
  Zap,
  CheckCircle,
  XCircle,
  HelpCircle,
  Shuffle,
  Trophy,
  Brain,
  Flame,
  RotateCcw,
  Play,
  Pause,
  Award,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { SUBJECTS } from '../data/textbooks';
import { callAIGenerator } from '../services/api';
import { useToast } from '../components/Toast';
import { AILoadingIndicator } from '../components/AILoadingIndicator';
import { playChime } from '../utils/audio';

type ActivityType =
  | 'tezkor'
  | 'kim-tez'
  | 'togri-notogri'
  | 'moslashtirish'
  | 'tasodifiy'
  | 'viktorina'
  | 'mantiqiy'
  | 'challenge';

interface Props {
  initialSubject?: string;
}

export const InteractiveActivitiesView: React.FC<Props> = ({ initialSubject }) => {
  const { showToast } = useToast();

  const [activeType, setActiveType] = useState<ActivityType>('tezkor');
  const [subject, setSubject] = useState(initialSubject || "O'zbekiston tarixi");
  const [topic, setTopic] = useState('Amir Temur davlati va madaniyati');
  const [isLoading, setIsLoading] = useState(false);

  // Activity 1: Tezkor savol-javob state
  const [tezkorIndex, setTezkorIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [tezkorTimer, setTezkorTimer] = useState(30);
  const [tezkorRunning, setTezkorRunning] = useState(false);

  // Activity 3: To'g'ri / Noto'g'ri state
  const [tfIndex, setTfIndex] = useState(0);
  const [tfScore, setTfScore] = useState(0);
  const [tfAnswered, setTfAnswered] = useState<boolean | null>(null);

  // Activity 4: Moslashtirish state
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);

  // Activity 5: Tasodifiy o'quvchi & savol state
  const [randomStudentNumber, setRandomStudentNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Activity 6: Mini viktorina team scores
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [viktorinaIndex, setViktorinaIndex] = useState(0);
  const [selectedViktorinaAns, setSelectedViktorinaAns] = useState<string | null>(null);

  // Activity 7: Mantiqiy topshiriq clue reveal
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Curated educational content state
  const [content, setContent] = useState({
    tezkor: [
      { q: "Amir Temur qaysi yilda Movarounnahrning oliy hukmdori bo‘ldi?", a: "1370-yil Balx qurultoyida" },
      { q: "Samarqanddagi Ulug‘bek rasadxonasi qaysi tepalikda qurilgan?", a: "Ko‘hak tepaligida (1424–1428)" },
      { q: "Alisher Navoiy turkiy tilda qaysi mashhur dostonlar majmuasini yozdi?", a: "“Xamsa” (1483–1485)" },
      { q: "Mirzo Ulug‘bekning yulduzlar jadvalida nechta yulduz o‘rni aniqlangan?", a: "1018 ta yulduz" },
    ],
    togriNotogri: [
      { text: "Mirzo Ulug‘bek rasadxonasi to‘rt qavatli qilib qurilgan.", isCorrect: false, explanation: "Noto‘g‘ri, rasadxona uch qavatli silindr shaklida qurilgan." },
      { text: "1402-yil Anqara jangida Amir Temur Boyazid Yildirim ustidan g‘alaba qozondi.", isCorrect: true, explanation: "To‘g‘ri, Anqara jangi 1402-yil 20-iyulda bo‘lib o‘tgan." },
      { text: "Zahiriddin Muhammad Bobur Hindistonda Boburiylar saltanatiga asos soldi.", isCorrect: true, explanation: "To‘g‘ri, 1526-yilda Panipat jangidagi g‘alabadan so‘ng asos solgan." },
      { text: "Amir Temur davlatida harbiy qo‘shin o‘nlik tizimiga bo‘linmagan.", isCorrect: false, explanation: "Noto‘g‘ri, qo‘shin o‘nlik, yuzlik, minglik va tumanlarga bo‘lingan." },
    ],
    matching: [
      { id: 1, left: "1370-yil", right: "Amir Temurning taxtga kelishi" },
      { id: 2, left: "1402-yil", right: "Anqara jangi" },
      { id: 3, left: "1420-yil", right: "Registon madrasasi ochilishi" },
      { id: 4, left: "1483-yil", right: "Alisher Navoiy 'Xamsa'ni yoza boshlashi" },
    ],
    viktorina: [
      {
        question: "Quyidagilardan qaysi biri Mirzo Ulug‘bekning shogirdi bo‘lgan?",
        options: ["Ali Qushchi", "Ibn Sino", "Al-Xorazmiy", "Beruniy"],
        correct: "Ali Qushchi",
      },
      {
        question: "“Temur tuzuklari” asari qanday mazmundagi asar hisoblanadi?",
        options: ["Davlat boshqaruvi va qonunlar qoidasi", "Faqat she’rlar to‘plami", "Tibbiyot qo‘llanmasi", "Astronomiya xaritasi"],
        correct: "Davlat boshqaruvi va qonunlar qoidasi",
      },
    ],
    logic: {
      question: "Bu shaxs Samarqandda tug‘ilib, buyuk alloma tarbiyasini oldi. Ustozi vafotidan so‘ng rasadxona ishlarini davom ettirdi va keyinchalik Istanbulda matematika va astronomiyadan dars berdi. U kim?",
      hint: "U o‘z davrining 'Ptolemeyi' deb atalgan va Ulug‘bekning eng yaqin shogirdi bo‘lgan.",
      answer: "Ali Qushchi (Mavlono Alouddin Ali ibn Muhammad Qushchi)",
    },
    challenge: [
      { level: "1-bosqich: Yengil start", task: "Mavzu bo‘yicha 3 ta asosiy sanani ketma-ket ayting." },
      { level: "2-bosqich: Tezkor fikr", task: "Amir Temur davlatining qudrati siri nimada ekanini 30 soniyada isbotlang." },
      { level: "3-bosqich: Master chaqiruv", task: "Agar Ulug‘bek akademiyasi bo‘lmaganida jahon fani qanday o‘zgarardi? 1 daqiqalik nutq so‘zlang." },
    ],
  });

  const handleGenerateAI = async () => {
    if (!topic.trim()) {
      showToast('Mavzuni kiriting', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await callAIGenerator('interactive', {
        subject,
        topic,
        type: activeType,
      });

      if (result.items && result.items.length > 0) {
        if (activeType === 'tezkor') {
          setContent((prev) => ({
            ...prev,
            tezkor: result.items.map((i: any) => ({ q: i.question, a: i.answer })),
          }));
          setTezkorIndex(0);
          setIsFlipped(false);
        } else if (activeType === 'togri-notogri') {
          setContent((prev) => ({
            ...prev,
            togriNotogri: result.items.map((i: any) => ({
              text: i.question,
              isCorrect: i.answer?.toLowerCase().includes('to‘g‘ri') || i.answer?.toLowerCase().includes('ha'),
              explanation: i.explanation || i.answer,
            })),
          }));
          setTfIndex(0);
        }
      }
      showToast('✓ Interaktiv mashg‘ulot yangilandi!', 'success');
    } catch {
      showToast('Mavzu bo‘yicha mashg‘ulot yangilandi', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const spinRandomWheel = () => {
    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      setRandomStudentNumber(Math.floor(Math.random() * 30) + 1);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setIsSpinning(false);
        playChime('celebrate');
      }
    }, 80);
  };

  const handleMatchSelect = (id: number) => {
    if (selectedLeft === null) {
      setSelectedLeft(id);
      playChime('click');
    } else {
      if (selectedLeft === id) {
        setMatchedPairs((prev) => [...prev, id]);
        playChime('success');
        setSelectedLeft(null);
      } else {
        setSelectedLeft(null);
      }
    }
  };

  const activitiesList = [
    { id: 'tezkor' as ActivityType, title: '🎯 Tezkor savol-javob', desc: 'Kartalar & 30 soniyalik taymer' },
    { id: 'kim-tez' as ActivityType, title: '⚡ Kim tez topadi?', desc: 'Buzzer & tezlik sinovi' },
    { id: 'togri-notogri' as ActivityType, title: '✅ To‘g‘ri yoki noto‘g‘ri', desc: 'Mantiqiy haqiqat testi' },
    { id: 'moslashtirish' as ActivityType, title: '🔗 Moslashtirish', desc: 'Sana va voqealarni juftlash' },
    { id: 'tasodifiy' as ActivityType, title: '🎲 Tasodifiy tanlov', desc: 'O‘quvchi va savol g‘ildiragi' },
    { id: 'viktorina' as ActivityType, title: '🏆 Mini viktorina', desc: 'Guruhlararo hisob-kitob' },
    { id: 'mantiqiy' as ActivityType, title: '🧠 Mantiqiy topshiriq', desc: 'Sirli shaxs yoki tushuncha' },
    { id: 'challenge' as ActivityType, title: '🔥 Challenge', desc: '3 darajali dars chaqirig‘i' },
  ];

  return (
    <div className="space-y-6">
      {/* Activity Mode Selector Tabs */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-rose-600" />
              <span>Sinfda o‘tkaziladigan interaktiv mashg‘ulotlar</span>
            </h2>
            <p className="text-xs text-slate-500">
              Doskada yoki proyektorda butun sinf bilan o‘ynaladigan jonli metodlar
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Mavzuni kiriting..."
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs w-48 sm:w-64"
            />
            <button
              onClick={handleGenerateAI}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Yaratish</span>
            </button>
          </div>
        </div>

        {/* 8 Activity Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {activitiesList.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveType(item.id);
                playChime('click');
              }}
              className={`p-3 rounded-xl text-left border transition-all ${
                activeType === item.id
                  ? 'bg-rose-50 border-rose-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <p className="text-xs font-bold text-slate-900">{item.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <AILoadingIndicator text="Interaktiv mashg‘ulot tuzilmoqda..." />
        </div>
      )}

      {/* 1. 🎯 TEZKOR SAVOL-JAVOB */}
      {activeType === 'tezkor' && !isLoading && (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md text-center space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b pb-3">
            <span>Karta {tezkorIndex + 1} / {content.tezkor.length}</span>
            <span className="text-rose-600 font-extrabold flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>30 soniya</span>
            </span>
          </div>

          <div
            onClick={() => {
              setIsFlipped(!isFlipped);
              playChime('pop');
            }}
            className="min-h-52 p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center cursor-pointer shadow-lg hover:scale-101 transition-all select-none"
          >
            <p className="text-[11px] uppercase tracking-wider text-rose-400 font-bold mb-3">
              {isFlipped ? "✓ Javob" : "? Savol (javobni ko‘rish uchun bosing)"}
            </p>
            <h3 className="text-lg sm:text-xl font-bold leading-relaxed">
              {isFlipped
                ? content.tezkor[tezkorIndex].a
                : content.tezkor[tezkorIndex].q}
            </h3>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setTezkorIndex((prev) => (prev > 0 ? prev - 1 : content.tezkor.length - 1));
                setIsFlipped(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
            >
              Oldingi
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs"
            >
              {isFlipped ? "Savolni ko‘rish" : "Javobni ochish"}
            </button>
            <button
              onClick={() => {
                setTezkorIndex((prev) => (prev + 1) % content.tezkor.length);
                setIsFlipped(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-xs"
            >
              Keyingi karta
            </button>
          </div>
        </div>
      )}

      {/* 2. ⚡ KIM TEZ TOPADI? */}
      {activeType === 'kim-tez' && !isLoading && (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900">
            Tezlik sinovi
          </span>
          <h3 className="text-lg font-bold text-slate-900">
            Savol o‘qilgan zahoti qo‘l ko‘taring yoki tugmani bosing!
          </h3>

          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-base">
            "{topic} davrining eng muhim 3 ta shaxsini birinchi bo‘lib ayting!"
          </div>

          <button
            onClick={() => playChime('celebrate')}
            className="w-32 h-32 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 text-white font-black text-xl shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all mx-auto flex items-center justify-center uppercase tracking-wider cursor-pointer"
          >
            TOPDIM!
          </button>
        </div>
      )}

      {/* 3. ✅ TO‘G‘RI YOKI NOTO‘G‘RI */}
      {activeType === 'togri-notogri' && !isLoading && (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md text-center space-y-6">
          <div className="flex justify-between text-xs font-bold text-slate-500 border-b pb-2">
            <span>Savol {tfIndex + 1} / {content.togriNotogri.length}</span>
            <span className="text-emerald-700 font-bold">Ball: {tfScore}</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-base font-bold leading-relaxed">
            {content.togriNotogri[tfIndex].text}
          </div>

          {tfAnswered !== null && (
            <div className={`p-3 rounded-xl text-xs font-bold ${
              tfAnswered === content.togriNotogri[tfIndex].isCorrect
                ? 'bg-emerald-100 text-emerald-900'
                : 'bg-rose-100 text-rose-900'
            }`}>
              {tfAnswered === content.togriNotogri[tfIndex].isCorrect ? '✓ To‘ppa-to‘g‘ri!' : '✕ Xato!'}
              <p className="font-normal mt-1">{content.togriNotogri[tfIndex].explanation}</p>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setTfAnswered(true);
                if (content.togriNotogri[tfIndex].isCorrect) {
                  setTfScore((s) => s + 1);
                  playChime('success');
                }
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xs"
            >
              <CheckCircle className="w-5 h-5" />
              <span>TO‘G‘RI</span>
            </button>
            <button
              onClick={() => {
                setTfAnswered(false);
                if (!content.togriNotogri[tfIndex].isCorrect) {
                  setTfScore((s) => s + 1);
                  playChime('success');
                }
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xs"
            >
              <XCircle className="w-5 h-5" />
              <span>NOTO‘G‘RI</span>
            </button>
          </div>

          {tfAnswered !== null && (
            <button
              onClick={() => {
                setTfAnswered(null);
                setTfIndex((prev) => (prev + 1) % content.togriNotogri.length);
              }}
              className="text-xs font-bold text-slate-900 underline"
            >
              Keyingi savolga o‘tish →
            </button>
          )}
        </div>
      )}

      {/* 4. 🔗 MOSLASHTIRISH */}
      {activeType === 'moslashtirish' && !isLoading && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          <div className="text-center">
            <h3 className="text-base font-bold text-slate-900">
              Sana va voqealarni juftlang
            </h3>
            <p className="text-xs text-slate-500">
              Chap tomondagi sanani tanlang, so‘ng o‘ng tomondagi mos voqeani bosing
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase">Sanalar</p>
              {content.matching.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMatchSelect(item.id)}
                  className={`w-full p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                    matchedPairs.includes(item.id)
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-60'
                      : selectedLeft === item.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {item.left}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase">Voqealar</p>
              {content.matching.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMatchSelect(item.id)}
                  className={`w-full p-3 rounded-xl border text-xs font-medium transition-all text-left ${
                    matchedPairs.includes(item.id)
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-60 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {item.right}
                </button>
              ))}
            </div>
          </div>

          {matchedPairs.length === content.matching.length && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs font-bold text-emerald-800">
              🎉 Barakalla! Barcha juftliklar to‘g‘ri topildi!
            </div>
          )}
        </div>
      )}

      {/* 5. 🎲 TASODIFIY TANLOV (Wheel / Picker) */}
      {activeType === 'tasodifiy' && !isLoading && (
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-slate-200 shadow-md text-center space-y-6">
          <h3 className="text-base font-bold text-slate-900">
            Javob beruvchi o‘quvchini tasodifiy tanlash
          </h3>
          <p className="text-xs text-slate-500">
            Sinf jurnalidagi tartib raqam bo‘yicha adolatli va tezkor tanlov
          </p>

          <div className="w-36 h-36 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black text-5xl flex items-center justify-center mx-auto shadow-xl shadow-purple-500/25">
            {randomStudentNumber !== null ? randomStudentNumber : '🎲'}
          </div>

          {randomStudentNumber !== null && !isSpinning && (
            <p className="text-sm font-bold text-purple-900">
              Sinf jurnalidagi {randomStudentNumber}-o‘quvchi doskaga taklif etiladi!
            </p>
          )}

          <button
            onClick={spinRandomWheel}
            disabled={isSpinning}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs active:scale-98 cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
            <span>{isSpinning ? 'Tanlanmoqda...' : 'G‘ildirakni aylantirish'}</span>
          </button>
        </div>
      )}

      {/* 6. 🏆 MINI VIKTORINA & LEADERBOARD */}
      {activeType === 'viktorina' && !isLoading && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          {/* Team score board */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <p className="text-xs font-bold text-blue-900">1-GURUH (ZUKKOLAR)</p>
              <p className="text-3xl font-extrabold text-blue-700 my-1">{teamAScore}</p>
              <button
                onClick={() => setTeamAScore((s) => s + 1)}
                className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-bold"
              >
                +1 Ball
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs font-bold text-emerald-900">2-GURUH (BILIMDONLAR)</p>
              <p className="text-3xl font-extrabold text-emerald-700 my-1">{teamBScore}</p>
              <button
                onClick={() => setTeamBScore((s) => s + 1)}
                className="px-3 py-1 rounded bg-emerald-600 text-white text-xs font-bold"
              >
                +1 Ball
              </button>
            </div>
          </div>

          {/* Current question */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-bold text-slate-400 mb-1">
              Viktorina savoli {viktorinaIndex + 1}:
            </p>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-4">
              {content.viktorina[viktorinaIndex]?.question}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {content.viktorina[viktorinaIndex]?.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedViktorinaAns(opt)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    selectedViktorinaAns === opt
                      ? opt === content.viktorina[viktorinaIndex].correct
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                        : 'bg-rose-100 border-rose-300 text-rose-950'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. 🧠 MANTIQIY TOPSHIRIQ */}
      {activeType === 'mantiqiy' && !isLoading && (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
            <Brain className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold font-heading text-slate-900">
            Sirli tushuncha / Tarixiy shaxs kim?
          </h3>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed font-medium">
            {content.logic.question}
          </div>

          {showHint && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 animate-in fade-in">
              <strong>Yordamchi maslahat:</strong> {content.logic.hint}
            </div>
          )}

          {showAnswer && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 animate-in fade-in">
              🎉 <strong>Javob:</strong> {content.logic.answer}
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
            >
              {showHint ? "Maslahatni yashirish" : "Maslahat olish"}
            </button>
            <button
              onClick={() => {
                setShowAnswer(!showAnswer);
                if (!showAnswer) playChime('celebrate');
              }}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs"
            >
              {showAnswer ? "Javobni yashirish" : "Javobni ochish"}
            </button>
          </div>
        </div>
      )}

      {/* 8. 🔥 CHALLENGE */}
      {activeType === 'challenge' && !isLoading && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-100 text-rose-900">
              Kunlik dars chaqirig‘i
            </span>
            <h3 className="text-lg font-bold font-heading text-slate-900 mt-2">
              Sinf chempioni bo‘lish uchun 3 bosqich
            </h3>
          </div>

          <div className="space-y-3">
            {content.challenge.map((c, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-0.5">{c.level}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{c.task}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
