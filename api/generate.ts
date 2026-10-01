import { GoogleGenAI } from '@google/genai';
import { generateCurriculumContent } from '../src/data/curriculumFallback';

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, payload } = req.body || {};

  if (!action || !payload) {
    return res.status(400).json({ error: "So'rov parametrlari yetarli emas." });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `Siz O'zbekiston Respublikasi Xalq ta'limi tizimi va Maktabgacha va maktab ta'limi vazirligi standartlariga qat'iy rioya qiluvchi, tajribali metodist va o'qituvchi yordamchisi "USTOZ AI" siz.
Barcha javoblarni QAT'IY O'ZBEK LOTIN alifbosida bering. Ruscha yoki inglizcha so'z ishlatmang.
O'zbek maktab darsliklari (DTS va yangi Milliy o'quv dasturi) asosida aniq, faktik jihatdan to'g'ri, pedagogik jihatdan mukammal ma'lumot bering.
Natijani doimo toza JSON formatida bering (hech qanday markdown belgisisiz).`;

      let prompt = '';
      if (action === 'lesson') {
        prompt = `Quyidagi parametrlar asosida to'liq 12 qismli dars ishlanmasi (konspekt) tayyorlang:
Fan: ${payload.subject}
Sinf: ${payload.grade}-sinf
Mavzu: ${payload.topic}
Dars davomiyligi: ${payload.duration || '45 daqiqa'}
Dars turi: ${payload.lessonType || "Aralash dars"}
O'quvchilar darajasi: ${payload.studentLevel || "O'rta"}`;
      } else if (action === 'test') {
        prompt = `Quyidagi darslik va mavzu asosida test savollari tuzing:
Fan: ${payload.subject}
Sinf: ${payload.grade}-sinf
Darslik: ${payload.textbookName || "Maktab darsligi"}
Mavzu: ${payload.topicTitle}
Savollar soni: ${payload.count || 5} ta
Qiyinlik: ${payload.difficulty || "O'rta"}`;
      } else {
        prompt = `Mavzu: ${payload.topic || payload.subject} bo'yicha ${action} tayyorlang.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const rawText = response.text || '';
      try {
        const parsed = JSON.parse(rawText);
        return res.status(200).json({ success: true, data: parsed, source: 'gemini' });
      } catch (err) {
        console.warn('JSON parse fallback in Vercel handler:', err);
      }
    } catch (e: any) {
      console.warn('Gemini API call failed in Vercel serverless handler:', e?.message || e);
    }
  }

  // Curriculum engine fallback guarantees 100% success
  const fallback = generateCurriculumContent(action, payload);
  return res.status(200).json({ success: true, data: fallback, source: 'curriculum-engine' });
}
