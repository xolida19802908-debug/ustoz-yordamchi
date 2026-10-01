import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { generateCurriculumContent } from './src/data/curriculumFallback';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini API client according to @google/genai SKILL.md
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(apiKey),
      app: 'USTOZ AI',
      timestamp: new Date().toISOString(),
    });
  });

  // AI Generation Endpoint
  app.post('/api/ai/generate', async (req, res) => {
    const { action, payload } = req.body;

    if (!action || !payload) {
      return res.status(400).json({
        error: "So'rov parametrlari yetarli emas.",
      });
    }

    try {
      if (ai) {
        let systemInstruction = `Siz O'zbekiston Respublikasi Xalq ta'limi tizimi va Maktabgacha va maktab ta'limi vazirligi standartlariga qat'iy rioya qiluvchi, tajribali metodist va o'qituvchi yordamchisi "USTOZ AI" siz.
Barcha javoblarni QAT'IY O'ZBEK LOTIN alifbosida bering. Ruscha yoki inglizcha so'z ishlatmang.
O'zbek maktab darsliklari (DTS va yangi Milliy o'quv dasturi) asosida aniq, faktik jihatdan to'g'ri, pedagogik jihatdan mukammal ma'lumot bering.
Natijani doimo toza JSON formatida bering (hech qanday markdown \`\`\`json belgisiz, faqat to'g'ridan-to'g'ri JSON obyekt).`;

        let prompt = '';

        if (action === 'lesson') {
          prompt = `Quyidagi parametrlar asosida to'liq 12 qismli dars ishlanmasi (konspekt) tayyorlang:
Fan: ${payload.subject}
Sinf: ${payload.grade}-sinf
Mavzu: ${payload.topic}
Dars davomiyligi: ${payload.duration || '45 daqiqa'}
Dars turi: ${payload.lessonType || "Aralash dars"}
O'quvchilar darajasi: ${payload.studentLevel || "O'rta"}

Javobni quyidagi JSON strukturada qaytaring:
{
  "topic": "${payload.topic}",
  "objectives": {
    "educational": "Ta'limiy maqsad",
    "developmental": "Rivojlantiruvchi maqsad",
    "upbringing": "Tarbiyaviy maqsad"
  },
  "expectedResults": ["Natija 1", "Natija 2", "Natija 3"],
  "equipment": ["Jihoz 1", "Jihoz 2", "Jihoz 3"],
  "stages": {
    "organizational": { "time": "3 daqiqa", "text": "Salomlashish, davomatni aniqlash va o'quvchilarni darsga ruhiy tayyorlash." },
    "review": { "time": "5-7 daqiqa", "text": "O'tgan mavzuni mustahkamlash...", "questions": ["Savol 1?", "Savol 2?", "Savol 3?"] },
    "newTopic": { "time": "15-20 daqiqa", "text": "Yangi mavzu batafsil bayoni...", "keyPoints": ["Nuqta 1", "Nuqta 2", "Nuqta 3"] },
    "practical": { "time": "10 daqiqa", "text": "Amaliy mashg'ulot tavsifi...", "tasks": ["Topshiriq 1", "Topshiriq 2"] },
    "consolidation": { "time": "5 daqiqa", "text": "Mustahkamlash o'yini yoki savol-javob...", "quickCheck": ["Savol 1?", "Savol 2?"] },
    "assessment": { "time": "3 daqiqa", "criteria": "Faol qatnashgan o'quvchilarni baholash va rag'batlantirish mezonlari." },
    "homework": { "time": "2 daqiqa", "text": "Uyga vazifa tavsifi va bajarish yo'riqnomasi." },
    "conclusion": "Darsning yakuniy xulosasi va o'qituvchining tavsiyalari."
  }
}`;
        } else if (action === 'test') {
          prompt = `Quyidagi darslik va mavzu asosida aniq faktlarga tayangan test savollari to'plamini tuzing:
Fan: ${payload.subject}
Sinf: ${payload.grade}-sinf
Darslik: ${payload.textbookName || "Davlat ta'lim standarti darsligi"}
Bob: ${payload.chapterTitle || "Asosiy bob"}
Mavzu: ${payload.topicTitle}
Savollar soni: ${payload.count || 5} ta
Qiyinlik darajasi: ${payload.difficulty || "O'rta"}
Manba sahifasi / ko'rsatmasi: ${payload.sourceInfo || `${payload.grade}-sinf ${payload.subject} darsligi`}

TALABLAR:
- Har bir savol darslikdagi real faktga tayansin, asossiz yoki xayoliy faktlar, sanalar bo'lmasin.
- Har bir savolda to'rtta variant (A, B, C, D) bo'lsin.
- To'g'ri javob aniq belgilansin (correctAnswer: "A" | "B" | "C" | "D").
- Manba aniq ko'rsatilsin (masalan: "Manba: ${payload.grade}-sinf ${payload.subject} darsligi, 45-bet").
- Izoh (explanation) qismi darslik mazmunini tushuntirib bersin.

Javobni quyidagi JSON strukturada qaytaring:
{
  "questions": [
    {
      "number": 1,
      "question": "Savol matni?",
      "options": [
        { "key": "A", "text": "Variant A" },
        { "key": "B", "text": "Variant B" },
        { "key": "C", "text": "Variant C" },
        { "key": "D", "text": "Variant D" }
      ],
      "correctAnswer": "A",
      "explanation": "Darslikka ko'ra to'g'ri javob izohi...",
      "source": "Manba: ${payload.grade}-sinf ${payload.subject} darsligi, 45-bet",
      "difficulty": "${payload.difficulty || "O'rta"}"
    }
  ]
}`;
        } else if (action === 'questions') {
          prompt = `Quyidagi mavzu bo'yicha turli qiyinlikdagi savollar to'plamini tuzing:
Fan: ${payload.subject}
Sinf: ${payload.grade}-sinf
Mavzu: ${payload.topic}
Savollar soni: ${payload.count || 6} ta
Qiyinlik toifalari: Oson, O'rta, Qiyin (Blum taksonomiyasi asosida).

Javobni quyidagi JSON formatida bering:
{
  "questions": [
    {
      "number": 1,
      "question": "Savol matni",
      "difficulty": "Oson",
      "bloomLevel": "Bilish / Tushunish",
      "modelAnswer": "Namunaviy to'liq javob",
      "criteria": "Baholash mezoni (1-2 ball)"
    }
  ]
}`;
        } else if (action === 'homework') {
          prompt = `Quyidagi mavzu bo'yicha tabaqalashtirilgan (3 darajali) uy vazifasi tuzing:
Fan: ${payload.subject}
Sinf: ${payload.grade}-sinf
Mavzu: ${payload.topic}

Javobni quyidagi JSON formatida bering:
{
  "instructions": "O'quvchilar uchun umumiy yo'riqnoma",
  "levels": [
    {
      "level": "Boshlang‘ich",
      "title": "Asosiy tushunchalarni mustahkamlash (standart)",
      "description": "Darslikdagi asosiy qoidalarni takrorlash va sodda misollar",
      "tasks": ["Topshiriq 1", "Topshiriq 2"],
      "expectedTime": "15 daqiqa"
    },
    {
      "level": "O‘rta",
      "title": "Amaliy tatbiq va tahlil (kengaytirilgan)",
      "description": "Mavzuni amaliyotda qo'llash va taqqoslash topshiriqlari",
      "tasks": ["Topshiriq 1", "Topshiriq 2"],
      "expectedTime": "25 daqiqa"
    },
    {
      "level": "Yuqori",
      "title": "Ijodiy va tadqiqot loyihasi (chuqurlashtirilgan)",
      "description": "Mustaqil izlanish, taqdimot yoki mini-loyiha",
      "tasks": ["Topshiriq 1", "Topshiriq 2"],
      "expectedTime": "40 daqiqa"
    }
  ],
  "assessmentNote": "Uy vazifasini tekshirish va baholash bo'yicha o'qituvchiga tavsiya",
  "parentNote": "Ota-onalar farzandiga qanday ko'maklashishi mumkinligi haqida eslatma"
}`;
        } else if (action === 'explain') {
          prompt = `Mavzuni pedagogik uslubda tushuntirib bering:
Fan: ${payload.subject}
Sinf: ${payload.grade}-sinf
Mavzu: ${payload.topic}

Javobni quyidagi JSON formatida bering:
{
  "simpleExplanation": "Oddiy, sodda tilda tushuntirish (bolalar va o'quvchilar tushunadigan misollar bilan)",
  "detailedExplanation": "Ilmiy va chuqurlashtirilgan batafsil bayon",
  "realLifeExamples": ["Hayotiy misol 1", "Hayotiy misol 2", "Hayotiy misol 3"],
  "keyTerms": [
    { "term": "Atama 1", "definition": "Uning qisqa va aniq ta'rifi" },
    { "term": "Atama 2", "definition": "Uning qisqa va aniq ta'rifi" }
  ],
  "importantPoints": ["Muhim qoida 1", "Muhim qoida 2", "Muhim eslatma"],
  "checkingQuestions": [
    { "question": "Tushunishni tekshiruvchi savol 1?", "answer": "Qisqa javobi" },
    { "question": "Tushunishni tekshiruvchi savol 2?", "answer": "Qisqa javobi" }
  ]
}`;
        } else if (action === 'rubric') {
          prompt = `Mavzu bo'yicha baholash mezoni va rubrika jadvalini tuzing:
Fan: ${payload.subject}
Sinf: ${payload.grade}-sinf
Mavzu: ${payload.topic}

Javobni quyidagi JSON formatida bering:
{
  "criteria": [
    {
      "category": "Mavzu mazmunini bilish va tushunish",
      "weight": "30%",
      "levels": {
        "beginning": "Faqat umumiy tasavvurga ega, asosiy atamalarni chalkashtiradi.",
        "satisfactory": "Asosiy qoidalarni biladi, biroq to'liq izohlay olmaydi.",
        "good": "Mavzuni yaxshi tushungan, mustaqil misollar keltira oladi.",
        "excellent": "Chuqur va mukammal tushungan, tizimli tahlil qiladi va xulosa chiqaradi."
      }
    },
    {
      "category": "Amaliy ko'nikmalarni qo'llash",
      "weight": "40%",
      "levels": {
        "beginning": "Topshiriqlarni o'qituvchi yordamisiz bajara olmaydi.",
        "satisfactory": "Oddiy andozaviy mashqlarni mustaqil bajara oladi.",
        "good": "Mustaqil ravishda o'rta darajadagi amaliy masalalarni to'g'ri yechadi.",
        "excellent": "Murakkab va nostandart topshiriqlarni tez va to'g'ri bajaradi."
      }
    },
    {
      "category": "Xulosa chiqarish va ifodalash",
      "weight": "30%",
      "levels": {
        "beginning": "Fikrni ifodalashda qiyinchilikka uchraydi.",
        "satisfactory": "Fikrlarini qisqa va yo'naltiruvchi savollar orqali ifodalaydi.",
        "good": "Fikrlarini ravon va aniq ifodalaydi, asosli dalillar keltiradi.",
        "excellent": "Madaniyatli, mantiqiy, ilmiy asoslangan nutq va ijodiy yondashuv."
      }
    }
  ],
  "gradingScale": {
    "grade5": "86 - 100 ball (A'lo)",
    "grade4": "71 - 85 ball (Yaxshi)",
    "grade3": "56 - 70 ball (Qoniqarli)",
    "grade2": "0 - 55 ball (Qoniqarsiz)"
  },
  "feedbackTemplates": {
    "high": [
      "Barakalla! Mavzuni a'lo darajada o'zlashtirdingiz va ijodiy yondashuv ko'rsatdingiz.",
      "Bilimlaringiz puxta va amaliyotda to'g'ri qo'llay olasiz. Shunday davom eting!"
    ],
    "medium": [
      "Yaxshi natija! Nazariyani yaxshi bilasiz, amaliy mashqlarda yana bir oz diqqatliroq bo'ling.",
      "Yana ozgina mustaqil ishlash orqali a'lo natijaga erishishingiz mumkin."
    ],
    "supportNeeded": [
      "Mavzuning asosiy qoidalarini darslikdan qayta o'qib chiqish tavsiya etiladi.",
      "O'qituvchi bilan birgalikda tushunarsiz qolgan tushunchalarni takrorlab olish zarur."
    ]
  }
}`;
        } else if (action === 'interactive') {
          prompt = `Mavzu bo'yicha interaktiv sinf mashg'uloti kontentini tuzing:
Fan: ${payload.subject}
Mavzu: ${payload.topic}
Mashg'ulot turi: ${payload.type || 'tezkor'} (tezkor, kim-tez, togri-notogri, moslashtirish, viktorina, mantiqiy)

Javobni quyidagi JSON formatida bering:
{
  "title": "Mashg'ulot nomi",
  "instructions": "O'yin qoidasi va yo'riqnoma",
  "items": [
    {
      "question": "Savol yoki tasdiq",
      "answer": "To'g'ri javob",
      "options": ["A", "B", "C", "D"],
      "explanation": "Qisqa tushuntirish"
    }
  ]
}`;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.3, // Lower temperature for high factual accuracy
          },
        });

        const rawText = response.text || '';
        try {
          const parsed = JSON.parse(rawText);
          return res.json({ success: true, data: parsed, source: 'gemini' });
        } catch (parseError) {
          console.warn('JSON parsing from Gemini response failed, using sanitized fallback:', parseError);
        }
      }

      // If Gemini API is not configured or failed, use our high quality curriculum generator
      const fallbackData = generateCurriculumContent(action, payload);
      return res.json({ success: true, data: fallbackData, source: 'curriculum-engine' });
    } catch (error: any) {
      console.error('AI generation error:', error?.message || error);
      // Fallback seamlessly so teacher never sees raw breakages
      const fallbackData = generateCurriculumContent(action, payload);
      return res.json({ success: true, data: fallbackData, source: 'curriculum-engine-fallback' });
    }
  });

  // Setup Vite in development or serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`USTOZ AI server running on port ${PORT}`);
  });
}

startServer();
