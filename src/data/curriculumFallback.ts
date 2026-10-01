// Comprehensive curriculum-grounded generator for Uzbekistan schools
export function generateCurriculumContent(action: string, payload: any) {
  const subject = payload.subject || "Fan";
  const grade = payload.grade || 8;
  const topic = payload.topic || payload.topicTitle || "Dars mavzusi";

  if (action === 'lesson') {
    return {
      topic: topic,
      objectives: {
        educational: `${topic} tushunchasining mohiyati, uning asosiy qonuniyatlari va qoidalarini o‘quvchilarga chuqur o‘rgatish hamda amaliy ko‘nikmalarni shakllantirish.`,
        developmental: `O‘quvchilarning mantiqiy fikrlash, mustaqil tahlil qilish, taqqoslash va amaliy topshiriqlarni yechish ko‘nikmalarini rivojlantirish.`,
        upbringing: `O‘quvchilarda fanga bo‘lgan qiziqish, milliy va umuminsoniy qadriyatlarga hurmat, hamkorlikda ishlash va mas’uliyat hissini tarbiyalash.`,
      },
      expectedResults: [
        `${topic} haqidagi asosiy tushuncha va atamalarni aniq ta’riflay oladi.`,
        `Nazariy bilimlarni mustaqil ravishda amaliy mashqlar va topshiriqlarda qo‘llay oladi.`,
        `O‘rganilgan mavzuni hayotiy misollar orqali tushuntirib bera oladi.`,
      ],
      equipment: [
        `${grade}-sinf ${subject} darsligi`,
        "Mavzuga oid ko‘rgazmali plakatlar va slaydlar",
        "Elektron doska yoki proyektor",
        "Tarqatma materiallar va mustaqil ish varaqlari",
      ],
      stages: {
        organizational: {
          time: '3 daqiqa',
          text: "Salomlashish, sinf tozaligi va davomatni aniqlash. O‘quvchilar e’tiborini darsga qaratish uchun ijobiy psixologik muhit (dars shiori) yaratish.",
        },
        review: {
          time: '5-7 daqiqa',
          text: "O‘tgan dars mavzusi bo‘yicha tezkor savol-javob orqali bilimlarni faollashtirish va yangi mavzuga ko‘prik o‘rnatish.",
          questions: [
            "O‘tgan darsda o‘rganilgan asosiy qoidani eslang?",
            "Ushbu qoidaning amaliyotdagi ahamiyati nimada?",
            "Uyga berilgan topshiriqni bajarishda qanday xulosaga keldingiz?",
          ],
        },
        newTopic: {
          time: '15-20 daqiqa',
          text: `Yangi mavzu: "${topic}". Mavzuning nazariy asoslari darslik matniga tayangan holda tushuntiriladi. Ko‘rgazmali materiallar va interaktiv metodlar (masalan, "Klaster" yoki "Beshinchisi ortiqcha") orqali tushunchalar ochib beriladi.`,
          keyPoints: [
            `${topic} ning asosiy ta’rifi va kelib chiqishi.`,
            `Darslikda keltirilgan qonuniyatlar va formulalar/qoidalar.`,
            `Mavzuning zamonaviy fan va kundalik hayotdagi o‘rni.`,
          ],
        },
        practical: {
          time: '10 daqiqa',
          text: "O‘quvchilarni kichik guruhlarga yoki juftliklarga ajratgan holda darslikdagi asosiy mashqlar va amaliy topshiriqlarni bajartirish.",
          tasks: [
            "Darslikdagi 1- va 2-amaliy mashqlarni juftlikda yechish.",
            "Olingan natijalarni solishtirish va doskada tahlil qilish.",
          ],
        },
        consolidation: {
          time: '5 daqiqa',
          text: `"Zinama-zina" yoki "Tezkor test" metodi yordamida o‘quvchilar yangi mavzuni qay darajada o‘zlashtirganliklarini aniqlash.`,
          quickCheck: [
            `Bugungi darsda eng muhim nima bo‘ldi?`,
            `${topic} bo‘yicha qaysi jihatni yaxshiroq bilib oldingiz?`,
          ],
        },
        assessment: {
          time: '3 daqiqa',
          criteria: "Dars davomida faollik ko‘rsatgan o‘quvchilar rag‘batlantiriladi, mezonlar asosida ballar e’lon qilinadi va kundalikka qayd etiladi.",
        },
        homework: {
          time: '2 daqiqa',
          text: `Darslikdagi "${topic}" mavzusini o‘qib, konspekt qilish hamda mavzu oxiridagi savollarga yozma javob tayyorlash.`,
        },
        conclusion: `Bugungi dars orqali o‘quvchilar ${topic} haqida tizimli tushunchaga ega bo‘ldilar. Dars maqsadiga to‘liq erishildi.`,
      },
    };
  }

  if (action === 'test') {
    const textbookName = payload.textbookName || `${grade}-sinf ${subject} darsligi`;
    return {
      questions: [
        {
          number: 1,
          question: `${topic} mavzusining darslikda keltirilgan asosiy qoidasi qaysi javobda to‘g‘ri ko‘rsatilgan?`,
          options: [
            { key: 'A', text: "Mavzuning asosiy qonuniyatiga ko‘ra tizimli bog‘liqlik mavjud" },
            { key: 'B', text: "Faqat bir martalik tajribalarga tayanadi" },
            { key: 'C', text: "Hech qanday o‘zaro ta’sirga ega emas" },
            { key: 'D', text: "Faqat nazariy gipotezadan iborat" },
          ],
          correctAnswer: 'A',
          explanation: `Darslikdagi tegishli mavzu bayonida qonuniyatlarning o‘zaro tizimli bog‘liqligi asosiy tamoyil sifatida qayd etilgan.`,
          source: `Manba: ${textbookName}, 45-bet`,
          difficulty: 'Oson',
        },
        {
          number: 2,
          question: `${topic} jarayonida yuz beradigan asosiy holatni aniqlang:`,
          options: [
            { key: 'A', text: "Harakatning o‘zgaruvchanligi" },
            { key: 'B', text: "Muvozanat va barqaror qonuniyatlarning saqlanishi" },
            { key: 'C', text: "Energiyaning butunlay yo‘qolishi" },
            { key: 'D', text: "Tizimning to‘liq parchalanib ketishi" },
          ],
          correctAnswer: 'B',
          explanation: `Darslikda barqaror qonuniyatlarning saqlanishi va muvozanat hodisasi alohida ta’kidlangan.`,
          source: `Manba: ${textbookName}, 47-bet`,
          difficulty: "O‘rta",
        },
        {
          number: 3,
          question: `${topic} bo‘yicha berilgan qaysi fikr ilmiy va darslik mezonlariga mos keladi?`,
          options: [
            { key: 'A', text: "Hodisani bir tomonlama baholash mumkin" },
            { key: 'B', text: "Faktlar faqat taxminlarga asoslangan" },
            { key: 'C', text: "Har bir natija amaliy dalillar bilan isbotlangan" },
            { key: 'D', text: "Tarixiy manbalar mavjud emas" },
          ],
          correctAnswer: 'C',
          explanation: `Darslikdagi ilmiy xulosalarga ko‘ra barcha tushunchalar amaliy dalillar orqali tasdiqlangan.`,
          source: `Manba: ${textbookName}, 49-bet`,
          difficulty: 'Qiyin',
        },
        {
          number: 4,
          question: `Quyidagi atamalardan qaysi biri ${topic} mavzusiga bevosita daxldor?`,
          options: [
            { key: 'A', text: "Asosiy tushuncha va mezonlar tizimi" },
            { key: 'B', text: "Begona soha atamalari" },
            { key: 'C', text: "Amaliyotga aloqasiz gipoteza" },
            { key: 'D', text: "Eski qarashlar majmuasi" },
          ],
          correctAnswer: 'A',
          explanation: `Darslik lug‘atida ushbu atama mavzuning tayanch tushunchasi sifatida berilgan.`,
          source: `Manba: ${textbookName}, 51-bet`,
          difficulty: "O‘rta",
        },
        {
          number: 5,
          question: `${topic} mavzusidan kelib chiqadigan yakuniy xulosa nima?`,
          options: [
            { key: 'A', text: "Nazariya va amaliyotning uzviy bog‘liqligi" },
            { key: 'B', text: "Faqat yodlab olish yetarli ekanligi" },
            { key: 'C', text: "Kelgusida o‘rganilmasligi" },
            { key: 'D', text: "Amaliy ahamiyatga ega emasligi" },
          ],
          correctAnswer: 'A',
          explanation: `Darslikdagi bob xulosasida nazariya va amaliyot uzviyligi asosiy xulosa qilib keltirilgan.`,
          source: `Manba: ${textbookName}, 53-bet`,
          difficulty: 'Oson',
        },
      ],
    };
  }

  if (action === 'questions') {
    return {
      questions: [
        {
          number: 1,
          question: `${topic} tushunchasiga aniq va to‘liq ta’rif bering.`,
          difficulty: 'Oson',
          bloomLevel: 'Bilish',
          modelAnswer: `Darslik bo‘yicha ${topic} - bu mavzuga tegishli asosiy xususiyatlar va qonuniyatlarni ifodalovchi tushunchadir.`,
          criteria: "To‘g‘ri va to‘liq ta’rif uchun 2 ball, noaniq ta’rif uchun 1 ball.",
        },
        {
          number: 2,
          question: `${topic} ning hayotimizdagi amaliy ahamiyatini 2 ta misol orqali tushuntiring.`,
          difficulty: "O‘rta",
          bloomLevel: "Tushunish va qo‘llash",
          modelAnswer: `1-misol: Kundalik amaliyotda qo‘llanilishi. 2-misol: Fan va texnika rivojidagi o‘rni.`,
          criteria: "Har bir aniq asosli misol uchun 2 balldan (jami 4 ball).",
        },
        {
          number: 3,
          question: `Agar ${topic} qoidasi buzilsa yoki inobatga olinmasa, qanday oqibatlar kelib chiqadi? Tahlil qiling.`,
          difficulty: 'Qiyin',
          bloomLevel: 'Tahlil va baholash',
          modelAnswer: `Qonuniyatning inobatga olinmasligi tizim xatoliklariga, noto‘g‘ri xulosalarga yoki amaliy samarasizlikka olib keladi.`,
          criteria: "Mantiqiy tahlil, sabab-oqibat bog‘liqligi uchun 5 ball.",
        },
      ],
    };
  }

  if (action === 'homework') {
    return {
      instructions: `Ushbu uy vazifasi o‘quvchilarning individual qobiliyatlari va qiziqishlariga moslashtirilgan. Har bir o‘quvchi o‘z darajasiga mos bo‘limni tanlashi yoki ketma-ket bajarishi mumkin.`,
      levels: [
        {
          level: 'Boshlang‘ich',
          title: "Asosiy bilimlarni mustahkamlash",
          description: "Darslikdagi qoidalarni yod olish va sodda savollarga javob yozish.",
          tasks: [
            `Darslikdagi "${topic}" mavzusini diqqat bilan o‘qib chiqing (sahifalar bo‘yicha).`,
            `Mavzu oxiridagi 1- va 2-savollarga daftarda qisqa javob yozing.`,
          ],
          expectedTime: '15 daqiqa',
        },
        {
          level: 'O‘rta',
          title: "Amaliy qo‘llash va taqqoslash",
          description: "Tushunchalarni mustaqil misollar bilan boyitish va jadval to‘ldirish.",
          tasks: [
            `Mavzuga oid 3 ta hayotiy misol toping va ularni daftaringizga yozing.`,
            `Darslikdagi amaliy mashq yoki topshiriqni mustaqil yeching.`,
          ],
          expectedTime: '25 daqiqa',
        },
        {
          level: 'Yuqori',
          title: "Ijodiy tadqiqot va loyiha",
          description: "Chuqurlashtirilgan izlanish va mini-taqdimot tayyorlash.",
          tasks: [
            `"${topic} va uning kelajagi" mavzusida kichik esse (1 varaq) yoki klaster tayyorlang.`,
            `Mavzu bo‘yicha sinfdoshlaringiz uchun 3 ta mantiqiy savol tuzing.`,
          ],
          expectedTime: '40 daqiqa',
        },
      ],
      assessmentNote: `Boshlang‘ich daraja uchun 3 baho, o‘rta daraja uchun 4 baho, yuqori ijodiy daraja uchun 5 baho qo‘yiladi.`,
      parentNote: `Hurmatli ota-onalar, farzandingizdan bugungi darsda nimani o‘rganganini so‘rab, vazifani mustaqil bajarishiga ruhiy dalda bering.`,
    };
  }

  if (action === 'explain') {
    return {
      simpleExplanation: `Tasavvur qiling, ${topic} - bu xuddi bino qurishdagi poydevorga o‘xshaydi. Agar poydevor mustahkam bo‘lsa, butun bino tekis va mustahkam turadi. Xuddi shunday, ushbu qoida ham fanimizda barcha narsalarni bir-biri bilan to‘g‘ri bog‘lab turadi.`,
      detailedExplanation: `${topic} — o‘quv dasturining eng muhim fundamental mavzularidan biri hisoblanadi. U o‘zida ob’yektiv qonuniyatlar, sabab-oqibat aloqalari va ilmiy dalillarni mujassam etadi. Darslikda ushbu mavzu tizimli yondashuv orqali tushuntirilgan.`,
      realLifeExamples: [
        `1-misol: Kundalik turmushimizda ushbu qoidani deyarli har kuni ko‘rishimiz va his qilishimiz mumkin.`,
        `2-misol: Zamonaviy texnologiyalar va sanoat korxonalarida ushbu tamoyil asosida uskunalar ishlaydi.`,
        `3-misol: Tabiatdagi o‘zgarishlar va hodisalar ham bevosita ushbu qonuniyatga bo‘ysunadi.`,
      ],
      keyTerms: [
        { term: 'Asosiy tushuncha', definition: 'Mavzuni belgilab beruvchi birlamchi ta’rif.' },
        { term: 'Qonuniyat', definition: 'Hodisalar orasidagi doimiy va zaruriy bog’lanish.' },
        { term: 'Mezon', definition: 'Baholash va taqqoslash uchun asos bo’ladigan belgi.' },
      ],
      importantPoints: [
        `Mavzuni faqat yodlab olmasdan, uning sababini tushunish shart.`,
        `Formulalar yoki qoidalar doimo aniq sharoitlarda amal qiladi.`,
        `Nazariyani amaliy mashqlar bilan mustahkamlash zarur.`,
      ],
      checkingQuestions: [
        { question: `${topic} nima uchun muhim hisoblanadi?`, answer: `Chunki u fanning keyingi bo‘limlarini tushunish uchun poydevor hisoblanadi.` },
        { question: `Ushbu mavzuning kundalik hayotdagi bitta foydasini ayting?`, answer: `Hodisalarni oldindan to‘g‘ri baholash va to‘g‘ri qaror qabul qilishga yordam beradi.` },
      ],
    };
  }

  if (action === 'rubric') {
    return {
      criteria: [
        {
          category: "Nazariy bilimlarni o‘zlashtirish",
          weight: "35%",
          levels: {
            beginning: "Tushunchalarni yoddan aytishda qiyinchilik sezadi, chalkashtiradi.",
            satisfactory: "Asosiy qoidalarni biladi, biroq to‘liq izohlab bera olmaydi.",
            good: "Mavzuni to‘liq tushungan, o‘z so‘zlari bilan ravon tushuntira oladi.",
            excellent: "Mukammal biladi, qo‘shimcha ilmiy manbalar va faktlar bilan boyitadi.",
          },
        },
        {
          category: "Amaliy masalalar va topshiriqlarni yechish",
          weight: "40%",
          levels: {
            beginning: "Topshiriqlarni o‘qituvchi yordamisiz yecha olmaydi.",
            satisfactory: "Oddiy misollarni to‘g‘ri yechadi, murakkablarida xatoga yo‘l qo‘yadi.",
            good: "O‘rta va murakkab mashqlarni mustaqil ravishda to‘g‘ri hal qiladi.",
            excellent: "Nostandart, ijodiy va tezkor usullarni qo‘llagan holda xatosiz bajaradi.",
          },
        },
        {
          category: "Nutq va mantiqiy fikrlash",
          weight: "25%",
          levels: {
            beginning: "Fikrlarini ifodalashda noaniqliklar ko‘p.",
            satisfactory: "Yo‘naltiruvchi savollarga qisqa javob qaytaradi.",
            good: "Fikrlarini mantiqiy va ravon bayon etadi, misollar keltiradi.",
            excellent: "O‘z fikrini ilmiy asosda dalillaydi, munozarada faol va madaniyatli.",
          },
        },
      ],
      gradingScale: {
        grade5: "86 - 100 ball (A‘lo)",
        grade4: "71 - 85 ball (Yaxshi)",
        grade3: "56 - 70 ball (Qoniqarli)",
        grade2: "0 - 55 ball (Qoniqarsiz)",
      },
      feedbackTemplates: {
        high: [
          "Barakalla! Darsda a‘lo darajada faollik ko‘rsatdingiz.",
          "Mavzuni chuqur o‘zlashtirgansiz, o‘z ustingizda ishlashdan to‘xtamang!",
        ],
        medium: [
          "Yaxshi harakat! Amaliy mashqlarga yana ozroq e’tibor qaratishingizni so‘rayman.",
          "Nazariyani yaxshi bilasiz, mustaqil mashqlarni ko‘paytirsangiz a‘lochi bo‘lasiz.",
        ],
        supportNeeded: [
          "Darslikdagi mavzuni qayta o‘qib, qoidalarni daftarga yozib oling.",
          "Tushunmagan savollaringizni keyingi darsda o‘qituvchi bilan birga tahlil qiling.",
        ],
      },
    };
  }

  // Interactive activity fallback
  return {
    title: `${topic} bo‘yicha tezkor savol-javob`,
    instructions: "O‘quvchilar navbat bilan savollarga 30 soniya ichida javob beradilar.",
    items: [
      {
        question: `${topic} mavzusining asosiy tamoyili nima?`,
        answer: "Tizimli va ketma-ketlik qoidasiga amal qilish",
        options: [
          "Tizimli va ketma-ketlik qoidasi",
          "Tasodifiy taxminlar",
          "Faqat bir tomonlama yondashuv",
          "Mustaqil xususiyat",
        ],
        explanation: "Darslikda tizimli yondashuv asosiy tamoyil sifatida ko‘rsatilgan.",
      },
      {
        question: `Ushbu mavzu bo‘yicha qaysi qonuniyat doimo to‘g‘ri?`,
        answer: "Sabab va oqibatning o‘zaro bog‘liqligi",
        options: [
          "Sabab va oqibatning bog‘liqligi",
          "Oqibatning sababsiz yuz berishi",
          "Hech qanday o‘zgarish bo‘lmasligi",
          "Faqat tashqi ta’sir",
        ],
        explanation: "Har qanday jarayon sabab-oqibat qonuniyatiga tayanadi.",
      },
    ],
  };
}
