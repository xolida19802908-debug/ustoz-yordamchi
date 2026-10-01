export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  targetCount: number;
}

export interface UserProgress {
  totalXP: number;
  streakDays: number;
  lastActiveDate: string;
  completedTopics: string[]; // topic IDs
  completedChapters: string[]; // chapter IDs
  questionsAnswered: number;
  correctAnswers: number;
  currentCombo: number;
  maxCombo: number;
  soundEnabled: boolean;
  unlockedAchievements: string[];
  dailyMission: {
    date: string;
    targetQuestions: number;
    answeredToday: number;
    completed: boolean;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-topic',
    title: 'Birinchi mavzu',
    description: 'Birinchi darslik mavzusini to‘liq o‘rganib chiqdingiz',
    icon: '📚',
    targetCount: 1,
  },
  {
    id: 'streak-5',
    title: '5 ta ketma-ket to‘g‘ri javob',
    description: 'Ketma-ket 5 ta savolga xatosiz javob berdingiz',
    icon: '🔥',
    targetCount: 5,
  },
  {
    id: 'perfect-score',
    title: '100% natija',
    description: 'Testdagi barcha savollarni 100% to‘g‘ri yechdingiz',
    icon: '🎯',
    targetCount: 1,
  },
  {
    id: 'first-chapter',
    title: 'Birinchi bob tugadi',
    description: 'Darslikning butun bir bobini to‘liq yakunladingiz',
    icon: '🏆',
    targetCount: 1,
  },
  {
    id: 'century-questions',
    title: '100 ta savol ishladi',
    description: 'Jami 100 ta nazorat savolini tahlil qildingiz',
    icon: '🧠',
    targetCount: 100,
  },
  {
    id: 'week-streak',
    title: '7 kunlik o‘qish',
    description: 'Ketma-ket 7 kun davomida bilim oldingiz',
    icon: '⭐',
    targetCount: 7,
  },
];

const GAMIFICATION_STORAGE_KEY = 'ustoz_ai_gamification_v2';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

const DEFAULT_PROGRESS: UserProgress = {
  totalXP: 240,
  streakDays: 3,
  lastActiveDate: getTodayString(),
  completedTopics: ['hist-8-ch1-t1', 'hist-8-ch1-t2'],
  completedChapters: [],
  questionsAnswered: 18,
  correctAnswers: 16,
  currentCombo: 0,
  maxCombo: 5,
  soundEnabled: true,
  unlockedAchievements: ['first-topic', 'streak-5'],
  dailyMission: {
    date: getTodayString(),
    targetQuestions: 10,
    answeredToday: 6,
    completed: false,
  },
};

export function getGamificationProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(GAMIFICATION_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(DEFAULT_PROGRESS));
      return DEFAULT_PROGRESS;
    }
    const parsed = JSON.parse(raw);
    const today = getTodayString();

    // Check if daily mission needs reset for a new day
    if (parsed.dailyMission?.date !== today) {
      parsed.dailyMission = {
        date: today,
        targetQuestions: 10,
        answeredToday: 0,
        completed: false,
      };
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load gamification progress:', error);
    return DEFAULT_PROGRESS;
  }
}

export function saveGamificationProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(progress));
    // Trigger custom event so header, dashboard, and test modes react instantly
    window.dispatchEvent(new CustomEvent('ustoz_progress_updated', { detail: progress }));
  } catch (e) {
    console.error('Failed to save gamification progress:', e);
  }
}

export function addXP(amount: number, reason?: string): { newTotal: number; added: number } {
  const current = getGamificationProgress();
  current.totalXP += amount;
  saveGamificationProgress(current);
  return { newTotal: current.totalXP, added: amount };
}

export function recordQuestionAnswer(isCorrect: boolean, isDifficult = false): {
  xpGained: number;
  newCombo: number;
  newAchievements: Achievement[];
  missionCompletedJustNow: boolean;
} {
  const current = getGamificationProgress();
  const today = getTodayString();
  let xpGained = 0;
  const newAchievements: Achievement[] = [];
  let missionCompletedJustNow = false;

  // Streak logic based on date
  if (current.lastActiveDate !== today) {
    const lastDate = new Date(current.lastActiveDate);
    const currDate = new Date(today);
    const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      current.streakDays += 1;
    } else if (diffDays > 1) {
      current.streakDays = 1;
    }
    current.lastActiveDate = today;
  }

  current.questionsAnswered += 1;

  // Update Daily Mission
  if (!current.dailyMission || current.dailyMission.date !== today) {
    current.dailyMission = {
      date: today,
      targetQuestions: 10,
      answeredToday: 0,
      completed: false,
    };
  }

  current.dailyMission.answeredToday += 1;
  if (
    current.dailyMission.answeredToday >= current.dailyMission.targetQuestions &&
    !current.dailyMission.completed
  ) {
    current.dailyMission.completed = true;
    missionCompletedJustNow = true;
    current.totalXP += 50; // Daily mission bonus
  }

  if (isCorrect) {
    current.correctAnswers += 1;
    current.currentCombo += 1;
    if (current.currentCombo > current.maxCombo) {
      current.maxCombo = current.currentCombo;
    }

    // Award XP
    xpGained = isDifficult ? 20 : 10;
    current.totalXP += xpGained;

    // Check 5 in a row achievement
    if (current.currentCombo >= 5 && !current.unlockedAchievements.includes('streak-5')) {
      current.unlockedAchievements.push('streak-5');
      const ach = ACHIEVEMENTS.find((a) => a.id === 'streak-5');
      if (ach) newAchievements.push(ach);
    }
  } else {
    current.currentCombo = 0;
  }

  // Check 100 questions achievement
  if (current.questionsAnswered >= 100 && !current.unlockedAchievements.includes('century-questions')) {
    current.unlockedAchievements.push('century-questions');
    const ach = ACHIEVEMENTS.find((a) => a.id === 'century-questions');
    if (ach) newAchievements.push(ach);
  }

  // Check 7 day streak achievement
  if (current.streakDays >= 7 && !current.unlockedAchievements.includes('week-streak')) {
    current.unlockedAchievements.push('week-streak');
    const ach = ACHIEVEMENTS.find((a) => a.id === 'week-streak');
    if (ach) newAchievements.push(ach);
  }

  saveGamificationProgress(current);

  return {
    xpGained,
    newCombo: current.currentCombo,
    newAchievements,
    missionCompletedJustNow,
  };
}

export function completeTopic(topicId: string): { xpGained: number; newAchievements: Achievement[] } {
  const current = getGamificationProgress();
  let xpGained = 0;
  const newAchievements: Achievement[] = [];

  if (!current.completedTopics.includes(topicId)) {
    current.completedTopics.push(topicId);
    xpGained = 50;
    current.totalXP += xpGained;

    if (!current.unlockedAchievements.includes('first-topic')) {
      current.unlockedAchievements.push('first-topic');
      const ach = ACHIEVEMENTS.find((a) => a.id === 'first-topic');
      if (ach) newAchievements.push(ach);
    }

    saveGamificationProgress(current);
  }

  return { xpGained, newAchievements };
}

export function completeChapter(chapterId: string): { xpGained: number; newAchievements: Achievement[] } {
  const current = getGamificationProgress();
  let xpGained = 0;
  const newAchievements: Achievement[] = [];

  if (!current.completedChapters.includes(chapterId)) {
    current.completedChapters.push(chapterId);
    xpGained = 100;
    current.totalXP += xpGained;

    if (!current.unlockedAchievements.includes('first-chapter')) {
      current.unlockedAchievements.push('first-chapter');
      const ach = ACHIEVEMENTS.find((a) => a.id === 'first-chapter');
      if (ach) newAchievements.push(ach);
    }

    saveGamificationProgress(current);
  }

  return { xpGained, newAchievements };
}

export function toggleSound(): boolean {
  const current = getGamificationProgress();
  current.soundEnabled = !current.soundEnabled;
  saveGamificationProgress(current);
  return current.soundEnabled;
}
