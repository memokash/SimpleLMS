// lib/questionBankService.ts

import { db } from './firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  DocumentData
} from 'firebase/firestore';

// Type definitions
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  specialty: string;
  difficulty: string;
  category: string;
  createdBy: string;
  createdAt: Timestamp;
  timesUsed: number;
  qualityScore: number;
  aiGenerated: boolean;
}

export interface QuestionBankStats {
  totalQuestions: number;
  bySpecialty: Record<string, number>;
  byDifficulty: Record<string, number>;
  byTopic: Record<string, number>;
  byCategory: Record<string, number>;
  recentlyAdded: number;
}

// Fetch statistics about the question bank
export async function getQuestionBankStats(): Promise<QuestionBankStats> {
  const snapshot = await getDocs(collection(db, 'questionBank'));

  const stats: QuestionBankStats = {
    totalQuestions: 0,
    bySpecialty: {},
    byDifficulty: {},
    byTopic: {},
    byCategory: {},
    recentlyAdded: 0
  };

  const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  snapshot.forEach(doc => {
    const data = doc.data() as Question;
    stats.totalQuestions++;

    if (data.specialty) {
      stats.bySpecialty[data.specialty] = (stats.bySpecialty[data.specialty] || 0) + 1;
    }
    if (data.difficulty) {
      stats.byDifficulty[data.difficulty] = (stats.byDifficulty[data.difficulty] || 0) + 1;
    }
    if (data.topic) {
      stats.byTopic[data.topic] = (stats.byTopic[data.topic] || 0) + 1;
    }
    if (data.category) {
      stats.byCategory[data.category] = (stats.byCategory[data.category] || 0) + 1;
    }

    if (data.createdAt?.toMillis?.() > oneWeekAgo.toMillis()) {
      stats.recentlyAdded++;
    }
  });

  return stats;
}

// Search the question bank with optional filters
export async function searchQuestions(
  searchTerm: string,
  filters: Partial<{ specialty: string; difficulty: string; topic: string; category: string }>
): Promise<Question[]> {
  let q = collection(db, 'questionBank') as any;

  if (filters.specialty) {
    q = query(q, where('specialty', '==', filters.specialty));
  }
  if (filters.difficulty) {
    q = query(q, where('difficulty', '==', filters.difficulty));
  }
  if (filters.topic) {
    q = query(q, where('topic', '==', filters.topic));
  }
  if (filters.category) {
    q = query(q, where('category', '==', filters.category));
  }

  const snapshot = await getDocs(q);
  const questions: Question[] = [];

  snapshot.forEach(doc => {
    const data = doc.data() as Question;
    if (!searchTerm || data.question.toLowerCase().includes(searchTerm.toLowerCase())) {
      questions.push({ ...data, id: doc.id });
    }
  });

  return questions;
}

// Generate quiz based on preferences from the bank
export async function generateQuizFromBank(preferences: {
  specialty?: string;
  difficulty?: string;
  category?: string;
  topics?: string[];
  questionCount?: number;
  excludeUsedRecently?: boolean;
  userId: string;
}): Promise<{ questions: Question[]; metadata: any }> {
  let q = collection(db, 'questionBank') as any;

  if (preferences.specialty && preferences.specialty !== 'all') {
    q = query(q, where('specialty', '==', preferences.specialty));
  }
  if (preferences.difficulty && preferences.difficulty !== 'all') {
    q = query(q, where('difficulty', '==', preferences.difficulty));
  }
  if (preferences.category && preferences.category !== 'all') {
    q = query(q, where('category', '==', preferences.category));
  }
  if (preferences.topics && preferences.topics.length > 0) {
    q = query(q, where('topic', 'in', preferences.topics));
  }
  if (preferences.excludeUsedRecently) {
    q = query(q, orderBy('createdAt', 'desc'));
  }

  const snapshot = await getDocs(q);
  let questions: Question[] = [];

  snapshot.forEach(doc => {
    const data = doc.data() as Question;
    questions.push({ ...data, id: doc.id });
  });

  // Randomize and limit
  questions = questions.sort(() => 0.5 - Math.random()).slice(0, preferences.questionCount || 20);

  return {
    questions,
    metadata: {
      specialty: preferences.specialty || 'Mixed',
      difficulty: preferences.difficulty || 'Mixed',
      category: preferences.category || 'Mixed'
    }
  };
}
