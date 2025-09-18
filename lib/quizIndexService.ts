// Quiz Index Service - Firebase integration
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export interface QuizIndexEntry {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionCount: number;
  tags: string[];
  popularity: number;
  lastUpdated: Date;
  averageRating?: number;
  completions?: number;
  estimatedTime?: number;
  hasExplanations?: boolean;
}

export interface QuizFilter {
  category?: string;
  difficulty?: string;
  tags?: string[];
  hasExplanations?: boolean;
  minQuestions?: number;
  maxQuestions?: number;
}

export async function getQuizIndex(): Promise<QuizIndexEntry[]> {
  try {
    const coursesRef = collection(db, 'courses');
    const snapshot = await getDocs(coursesRef);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || data.courseName || '',
        description: data.description || '',
        category: data.category || 'general',
        difficulty: data.difficulty || 'Intermediate',
        questionCount: data.questionCount || 0,
        tags: data.tags || [],
        popularity: data.popularity || 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        averageRating: data.averageRating,
        completions: data.completions,
        estimatedTime: data.estimatedTime,
        hasExplanations: data.hasExplanations
      };
    });
  } catch (error) {
    console.error('Error fetching quiz index:', error);
    return [];
  }
}

export async function getPopularQuizzes(limitCount: number = 10): Promise<QuizIndexEntry[]> {
  try {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, orderBy('popularity', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || data.courseName || '',
        description: data.description || '',
        category: data.category || 'general',
        difficulty: data.difficulty || 'Intermediate',
        questionCount: data.questionCount || 0,
        tags: data.tags || [],
        popularity: data.popularity || 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        averageRating: data.averageRating,
        completions: data.completions,
        estimatedTime: data.estimatedTime,
        hasExplanations: data.hasExplanations
      };
    });
  } catch (error) {
    console.error('Error fetching popular quizzes:', error);
    return [];
  }
}

export async function getRecentQuizzes(limitCount: number = 10): Promise<QuizIndexEntry[]> {
  try {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, orderBy('lastUpdated', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || data.courseName || '',
        description: data.description || '',
        category: data.category || 'general',
        difficulty: data.difficulty || 'Intermediate',
        questionCount: data.questionCount || 0,
        tags: data.tags || [],
        popularity: data.popularity || 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        averageRating: data.averageRating,
        completions: data.completions,
        estimatedTime: data.estimatedTime,
        hasExplanations: data.hasExplanations
      };
    });
  } catch (error) {
    console.error('Error fetching recent quizzes:', error);
    return [];
  }
}

export async function searchQuizzes(searchTerm: string, filter?: QuizFilter): Promise<QuizIndexEntry[]> {
  const allQuizzes = await getQuizIndex();
  
  return allQuizzes.filter(quiz => {
    // Text search
    const matchesSearch = searchTerm ? 
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    
    // Apply filters
    const matchesCategory = !filter?.category || quiz.category === filter.category;
    const matchesDifficulty = !filter?.difficulty || quiz.difficulty === filter.difficulty;
    const matchesExplanations = filter?.hasExplanations === undefined || quiz.hasExplanations === filter.hasExplanations;
    const matchesMinQuestions = !filter?.minQuestions || quiz.questionCount >= filter.minQuestions;
    const matchesMaxQuestions = !filter?.maxQuestions || quiz.questionCount <= filter.maxQuestions;
    
    return matchesSearch && matchesCategory && matchesDifficulty && 
           matchesExplanations && matchesMinQuestions && matchesMaxQuestions;
  });
}

export default { getQuizIndex, getPopularQuizzes, getRecentQuizzes, searchQuizzes };
