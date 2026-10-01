import { SavedMaterial } from '../types';

const STORAGE_KEY = 'ustoz_ai_saved_materials_v2';

const INITIAL_MATERIALS: SavedMaterial[] = [
  {
    id: 'mat-init-1',
    type: 'lesson',
    title: 'Mirzo Ulug‘bek davrida madaniyat, ilm-fan va rasadxona',
    subject: "O'zbekiston tarixi",
    grade: 8,
    topic: 'Mirzo Ulug‘bek davrida madaniyat, ilm-fan va rasadxona bunyod etilishi',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    data: {
      topic: 'Mirzo Ulug‘bek davrida madaniyat, ilm-fan va rasadxona bunyod etilishi',
      objectives: {
        educational:
          'O‘quvchilarga Mirzo Ulug‘bekning davlat arbobi va buyuk olim sifatidagi faoliyati, Samarqand rasadxonasi va madrasalarining jahon fani taraqqiyotidagi o‘rnini o‘rgatish.',
        developmental:
          'Tarixiy manbalar bilan ishlash, astronomik kashfiyotlarning ahamiyatini tahlil qilish va umumlashtirish ko‘nikmalarini rivojlantirish.',
        upbringing:
          'Buyuk ajdodlarimizning ilmiy merosi bilan faxrlanish, ilm-fanga intilish va vatanparvarlik tuyg‘ularini shakllantirish.',
      },
      expectedResults: [
        'Mirzo Ulug‘bek rasadxonasining tuzilishi va "Ziji jadidi Ko‘ragoniy" asarining mohiyatini biladi.',
        'Ulug‘bek davrida Samarqandda yashab ijod qilgan olimlar (Qozizoda Rumiy, G‘iyosiddin Jamshid Koshiy, Ali Qushchi) hissasini tushuntiradi.',
        'Mavzu bo‘yicha savollarga darslik materiallariga tayangan holda aniq javob beradi.',
      ],
      equipment: [
        '8-sinf O‘zbekiston tarixi darsligi (A. Muhammadjonov va b.)',
        'Mirzo Ulug‘bek rasadxonasi va madrasasi maketi/suratlari',
        'Ko‘rgazmali xarita va taqdimot slaydlari',
      ],
      stages: {
        organizational: {
          time: '3 daqiqa',
          text: 'Salomlashish, sinf davomatini aniqlash. "Ilm — insoniyatning eng buyuk fazilati" shiori ostida o‘quvchilarni faollashtirish.',
        },
        review: {
          time: '5 daqiqa',
          text: 'Amir Temur davri madaniyati bo‘yicha "Zanjir" metodi orqali o‘tilgan mavzuni takrorlash.',
          questions: [
            'Amir Temur davrida Samarqandda qanday meʼmoriy obidalar qurilgan edi?',
            'Temuriylar renessansi tushunchasini qanday izohlaysiz?',
          ],
        },
        newTopic: {
          time: '20 daqiqa',
          text: '1424–1428-yillarda Ko‘hak tepaligida qurilgan rasadxona va undagi ulkan sekstant asbobi haqida maʼlumot beriladi. Ulug‘bek akademiyasi va 1018 ta yulduz harakati jadvali ko‘rib chiqiladi.',
          keyPoints: [
            '1420-yil Samarqand Registonida Ulug‘bek madrasasi qad ko‘tardi.',
            'Samarqand rasadxonasi uch qavatli silindr shaklidagi bino bo‘lib, radiusi 40 metrlik sekstantga ega edi.',
            'Ali Qushchi — Ulug‘bekning sadoqatli shogirdi va ilmiy maktab davomchisi.',
          ],
        },
        practical: {
          time: '10 daqiqa',
          text: 'O‘quvchilar darslikning 45–48-betlaridagi manbalar bilan ishlaydi va "T-jadval" orqali Ulug‘bekning davlat arbobi va olim sifatidagi yutuqlarini ajratib yozadi.',
          tasks: [
            'Ulug‘bek madrasalari joylashgan 3 ta shaharni xaritadan topish.',
            '"Ziji jadidi Ko‘ragoniy" asarining Yevropa ilm-faniga taʼsirini yozish.',
          ],
        },
        consolidation: {
          time: '4 daqiqa',
          text: '"Tezkor savol-javob" o‘yini: o‘qituvchi aytgan sanaga o‘quvchilar voqeani aytadi (1420, 1424, 1449).',
          quickCheck: [
            'Ulug‘bek rasadxonasi qayerda qurilgan?',
            'Ulug‘bek jadvalida nechta yulduz koordinatasi berilgan?',
          ],
        },
        assessment: {
          time: '2 daqiqa',
          criteria: 'Darsdagi faollik, faktlarni to‘g‘ri aytish va manbalar bilan ishlash darajasiga ko‘ra 5 ballik tizimda baholash.',
        },
        homework: {
          time: '1 daqiqa',
          text: 'Darslikning 45–50-betlarini o‘qish, "Agar men Ulug‘bek davrida yashaganimda..." mavzusida 10 ta jumlali mini-esse yozish.',
        },
        conclusion: 'Mirzo Ulug‘bek jahon fani va Temuriylar renessansiga bebaho hissa qo‘shgan buyuk allomadir.',
      },
    },
  },
  {
    id: 'mat-init-2',
    type: 'test',
    title: 'Amir Temur va Temuriylar davlati (Nazorat testi)',
    subject: "O'zbekiston tarixi",
    grade: 8,
    topic: 'Amir Temur va Temuriylar davlati madaniyati',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    data: {
      questions: [
        {
          number: 1,
          question: 'Samarqanddagi Mirzo Ulug‘bek rasadxonasi qaysi yillarda bunyod etilgan?',
          options: [
            { key: 'A', text: '1424–1428-yillarda' },
            { key: 'B', text: '1410–1415-yillarda' },
            { key: 'C', text: '1440–1445-yillarda' },
            { key: 'D', text: '1395–1400-yillarda' },
          ],
          correctAnswer: 'A',
          explanation: 'Darslikning 45-betiga muvofiq, Mirzo Ulug‘bek rasadxonasi Samarqand yaqinidagi Ko‘hak tepaligida 1424–1428-yillarda barpo etilgan.',
          source: 'Manba: 8-sinf O‘zbekiston tarixi darsligi, 45-bet',
          difficulty: 'Oson',
        },
        {
          number: 2,
          question: 'Mirzo Ulug‘bekning "Ziji jadidi Ko‘ragoniy" fundamental asarida nechta qo‘zg‘almas yulduzning koordinatasi aniqlangan?',
          options: [
            { key: 'A', text: '1018 ta' },
            { key: 'B', text: '500 ta' },
            { key: 'C', text: '1200 ta' },
            { key: 'D', text: '850 ta' },
          ],
          correctAnswer: 'A',
          explanation: 'Darslikning 46-betida "Ziji jadidi Ko‘ragoniy" yulduzlar jadvalida 1018 ta yulduz o‘rni nihoyatda katta aniqlik bilan qayd etilgani taʼkidlangan.',
          source: 'Manba: 8-sinf O‘zbekiston tarixi darsligi, 46-bet',
          difficulty: "O‘rta",
        },
        {
          number: 3,
          question: 'Amir Temur davlatida harbiy qo‘shin qanday tuzilmaga asoslangan edi?',
          options: [
            { key: 'A', text: 'O‘nlik, yuzlik, minglik va tumanlar (o‘n minglik)' },
            { key: 'B', text: 'Faqat yollanma otliqlar otryadi' },
            { key: 'C', text: 'Viloyat hokimlarining mustaqil qismlari' },
            { key: 'D', text: 'Faqat piyoda askarlar bo‘linmasi' },
          ],
          correctAnswer: 'A',
          explanation: '"Temur tuzuklari" va darslik maʼlumotiga binoan sarkarda armiyasi o‘nlik tizimiga asoslanib, intizomli tarzda boshqarilgan.',
          source: 'Manba: 8-sinf O‘zbekiston tarixi darsligi, 28-bet',
          difficulty: "O‘rta",
        },
      ],
    },
  },
  {
    id: 'mat-init-3',
    type: 'homework',
    title: 'Fe’l nisbatlari bo‘yicha tabaqalashtirilgan uy vazifasi',
    subject: 'Ona tili',
    grade: 7,
    topic: 'Fe’l nisbatlari: Aniq, O‘zlik, Majhul, Birgalik, Orttirma',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    data: {
      instructions: 'O‘quvchilar o‘z imkoniyatlari va darajalariga mos vazifani tanlashlari yoki ketma-ket bajarishlari mumkin.',
      levels: [
        {
          level: 'Boshlang‘ich',
          title: 'Asosiy qoidalarni mustahkamlash',
          description: 'Qo‘shimchalarni aniqlash va qoidalarni yodda saqlash.',
          tasks: [
            'Darslikdagi 34-betda berilgan fe’l nisbatlari jadvalini daftaringizga ko‘chiring.',
            'Berilgan 5 ta fe’lning (yozdi, yuvindi, aytildi, kulishdi, yugurtirdi) qaysi nisbatda ekanini belgilang.',
          ],
          expectedTime: '15 daqiqa',
        },
        {
          level: 'O‘rta',
          title: 'Amaliy qo‘llash va matn bilan ishlash',
          description: 'Badiiy matndan fe’l nisbatlarini topish va tahlil qilish.',
          tasks: [
            'O‘qiyotgan adabiy kitobingizdan 5 ta gap ko‘chirib yozing va ulardagi fe’llarning nisbat qo‘shimchalarini ajrating.',
            'O‘zlik va Majhul nisbatdagi fe’llarni bir-biri bilan qiyoslab, 2 ta misol tuzing.',
          ],
          expectedTime: '25 daqiqa',
        },
        {
          level: 'Yuqori',
          title: 'Ijodiy matn yaratish va tahrir',
          description: 'Barcha fe’l nisbatlarini qamrab olgan ijodiy hikoya tuzish.',
          tasks: [
            '"Bahor fasli nafasi" mavzusida 7–8 gapdan iborat matn yozing va unda barcha 5 ta fe’l nisbatidan kamida bittadan foydalaning.',
            'Har bir fe’lning gapdagi uslubiy vazifasini tushuntiring.',
          ],
          expectedTime: '35 daqiqa',
        },
      ],
      assessmentNote: 'Boshlang‘ich topshiriq to‘liq bajarilsa — 3, o‘rta topshiriq — 4, yuqori ijodiy topshiriq — 5 baho.',
      parentNote: 'Hurmatli ota-onalar, farzandingizdan fe’llar harakatini kim bajarganini so‘rab, mustaqil fikrlashiga ko‘maklashing.',
    },
  },
];

export function getSavedMaterials(): SavedMaterial[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MATERIALS));
      return INITIAL_MATERIALS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MATERIALS;
  } catch (error) {
    console.error('Failed to load saved materials:', error);
    return INITIAL_MATERIALS;
  }
}

export function saveMaterial(
  item: Omit<SavedMaterial, 'id' | 'createdAt' | 'updatedAt'>
): SavedMaterial {
  const materials = getSavedMaterials();
  const newItem: SavedMaterial = {
    ...item,
    id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newItem, ...materials];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Storage quota exceeded or error:', e);
  }
  return newItem;
}

export function updateMaterial(
  id: string,
  updates: Partial<SavedMaterial>
): SavedMaterial | null {
  const materials = getSavedMaterials();
  const index = materials.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const updatedItem: SavedMaterial = {
    ...materials[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  materials[index] = updatedItem;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
  } catch (e) {
    console.error('Failed to update storage:', e);
  }
  return updatedItem;
}

export function deleteMaterial(id: string): boolean {
  const materials = getSavedMaterials();
  const filtered = materials.filter((m) => m.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to delete material:', e);
    return false;
  }
}

export function exportMaterialsAsJSON(): string {
  const materials = getSavedMaterials();
  return JSON.stringify(materials, null, 2);
}

export function importMaterialsFromJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      const existing = getSavedMaterials();
      const combined = [...parsed, ...existing];
      // remove duplicate ids
      const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
      return true;
    }
    return false;
  } catch (e) {
    console.error('Invalid import file:', e);
    return false;
  }
}
