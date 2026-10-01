export type SubjectId =
  | 'ozbekiston-tarixi'
  | 'ona-tili'
  | 'adabiyot'
  | 'matematika'
  | 'algebra'
  | 'geometriya'
  | 'fizika'
  | 'kimyo'
  | 'biologiya'
  | 'geografiya'
  | 'informatika'
  | 'ingliz-tili'
  | 'jahon-tarixi'
  | 'huquq'
  | 'tarbiya';

export interface Subject {
  id: SubjectId;
  name: string;
  iconName: string;
  grades: number[];
  color: string;
}

export interface TextbookTopic {
  id: string;
  number: number;
  title: string;
  page: number;
  endPage?: number;
  pagesRange: string; // e.g. "45–50"
  keyPoints?: string[];
  excerptText?: string; // Genuine textbook passage
}

export interface TextbookChapter {
  id: string;
  number: number;
  title: string;
  pages: string; // e.g. "12–58"
  topics: TextbookTopic[];
}

export interface Textbook {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  grade: number;
  title: string;
  authors: string;
  year: number;
  publisher: string;
  available: boolean;
  hasPdf: boolean;
  edition: string;
  chapters: TextbookChapter[];
  isCustomUploaded?: boolean;
}

export interface QuestionHistoryItem {
  id: string;
  textbookId: string;
  chapterId: string;
  topicId: string;
  questionText: string;
  normalizedQuestion: string;
  questionHash: string;
  createdAt: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  grade: number;
  duration: string;
  lessonType: string;
  studentLevel: string;
  createdAt: string;
  sourceTextbook?: string;
  sourceTopic?: string;
  sourcePages?: string;
  content: {
    topic: string;
    objectives: {
      educational: string;
      developmental: string;
      upbringing: string;
    };
    expectedResults: string[];
    equipment: string[];
    stages: {
      organizational: { time: string; text: string };
      review: { time: string; text: string; questions: string[] };
      newTopic: { time: string; text: string; keyPoints: string[] };
      practical: { time: string; text: string; tasks: string[] };
      consolidation: { time: string; text: string; quickCheck: string[] };
      assessment: { time: string; criteria: string };
      homework: { time: string; text: string };
      conclusion: string;
    };
  };
}

export interface TestOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface TestQuestion {
  id: string;
  number: number;
  question: string;
  options: TestOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  source: string; // e.g. "Manba: 8-sinf O‘zbekiston tarixi darsligi, 45–50-betlar"
  sourcePages?: string;
  difficulty: 'Oson' | 'O‘rta' | 'Qiyin';
}

export interface TestSet {
  id: string;
  title: string;
  subject: string;
  grade: number;
  textbookId?: string;
  textbookName: string;
  chapterTitle?: string;
  topicTitle: string;
  sourcePages?: string;
  difficulty: string;
  questionType: string;
  isTextbookBased: boolean;
  createdAt: string;
  questions: TestQuestion[];
}

export interface QuestionItem {
  id: string;
  number: number;
  question: string;
  difficulty: 'Oson' | 'O‘rta' | 'Qiyin';
  bloomLevel: string;
  modelAnswer: string;
  criteria: string;
}

export interface QuestionSet {
  id: string;
  title: string;
  subject: string;
  grade: number;
  topic: string;
  createdAt: string;
  questions: QuestionItem[];
}

export interface HomeworkLevel {
  level: 'Boshlang‘ich' | 'O‘rta' | 'Yuqori';
  title: string;
  description: string;
  tasks: string[];
  expectedTime: string;
}

export interface HomeworkSet {
  id: string;
  title: string;
  subject: string;
  grade: number;
  topic: string;
  createdAt: string;
  instructions: string;
  levels: HomeworkLevel[];
  assessmentNote: string;
  parentNote: string;
}

export interface TopicExplanation {
  id: string;
  title: string;
  subject: string;
  grade: number;
  topic: string;
  createdAt: string;
  simpleExplanation: string;
  detailedExplanation: string;
  realLifeExamples: string[];
  keyTerms: { term: string; definition: string }[];
  importantPoints: string[];
  checkingQuestions: { question: string; answer: string }[];
}

export interface AssessmentRubric {
  id: string;
  title: string;
  subject: string;
  grade: number;
  topic: string;
  createdAt: string;
  criteria: {
    category: string;
    weight: string;
    levels: {
      beginning: string;
      satisfactory: string;
      good: string;
      excellent: string;
    };
  }[];
  gradingScale: {
    grade5: string;
    grade4: string;
    grade3: string;
    grade2: string;
  };
  feedbackTemplates: {
    high: string[];
    medium: string[];
    supportNeeded: string[];
  };
}

export type MaterialType =
  | 'lesson'
  | 'test'
  | 'questions'
  | 'homework'
  | 'explainer'
  | 'rubric'
  | 'interactive';

export interface SavedMaterial {
  id: string;
  type: MaterialType;
  title: string;
  subject: string;
  grade: number;
  topic: string;
  sourceTextbook?: string;
  sourcePages?: string;
  createdAt: string;
  updatedAt: string;
  data: any;
}
