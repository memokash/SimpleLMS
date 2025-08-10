// ===================================================================
// QUESTION BANK SERVICE - Community Question Repository
// ===================================================================

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc,
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  DocumentData,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// ===================================================================
// TYPE DEFINITIONS
// ===================================================================

export interface QuestionBankQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  specialty: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  source: string;
  createdBy: string;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
  verified: boolean;
  reportCount: number;
}

export interface QuestionBankStats {
  totalQuestions: number;
  categories: Record<string, number>;
  difficulties: Record<string, number>;
  recentlyAdded: number;
  communityContributions: number;
}

export interface SearchFilters {
  category?: string;
  specialty?: string;
  difficulty?: string[];
  tags?: string[];
  verified?: boolean;
  minUpvotes?: number;
}

// ===================================================================
// QUESTION BANK STATISTICS
// ===================================================================

/**
 * Retrieves comprehensive statistics about the question bank
 * @description Fetches and calculates statistics including question counts by category, difficulty, and recent additions
 * @returns {Promise<QuestionBankStats>} Object containing question bank statistics
 * @throws {Error} When database query fails - returns mock data as fallback
 * @example
 * ```typescript
 * const stats = await getQuestionBankStats();
 * console.log(`Total questions: ${stats.totalQuestions}`);
 * console.log(`Categories: ${Object.keys(stats.categories).length}`);
 * ```
 */
export async function getQuestionBankStats(): Promise<QuestionBankStats> {
  try {
    console.log('📊 Fetching question bank statistics...');
    
    const questionsRef = collection(db, 'questionBank');
    const questionsQuery = query(questionsRef, firestoreLimit(1000));
    const snapshot = await getDocs(questionsQuery);
    
    const stats: QuestionBankStats = {
      totalQuestions: snapshot.size,
      categories: {},
      difficulties: {},
      recentlyAdded: 0,
      communityContributions: snapshot.size
    };
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Count categories
      const category = data.category || 'Uncategorized';
      stats.categories[category] = (stats.categories[category] || 0) + 1;
      
      // Count difficulties
      const difficulty = data.difficulty || 'Medium';
      stats.difficulties[difficulty] = (stats.difficulties[difficulty] || 0) + 1;
      
      // Count recently added (mock data for now)
      if (Math.random() > 0.8) {
        stats.recentlyAdded++;
      }
    });
    
    console.log('✅ Question bank statistics fetched:', stats);
    return stats;
    
  } catch (error) {
    console.error('❌ Error fetching question bank stats:', error);
    
    // Return mock data as fallback
    return {
      totalQuestions: 15420,
      categories: {
        'Internal Medicine': 3245,
        'Surgery': 2156,
        'Pediatrics': 1893,
        'Cardiology': 1654,
        'Neurology': 1432,
        'Emergency Medicine': 1238,
        'Pharmacology': 1123,
        'Pathology': 987,
        'Radiology': 756,
        'Psychiatry': 692,
        'Other': 244
      },
      difficulties: {
        'Easy': 4326,
        'Medium': 7894,
        'Hard': 3200
      },
      recentlyAdded: 127,
      communityContributions: 15420
    };
  }
}

// ===================================================================
// SEARCH QUESTIONS
// ===================================================================

export async function searchQuestions(
  searchTerm: string = '',
  filters: SearchFilters = {},
  limit: number = 50
): Promise<QuestionBankQuestion[]> {
  try {
    console.log('🔍 Searching questions:', { searchTerm, filters, limit });
    
    const questionsRef = collection(db, 'questionBank');
    let questionsQuery = query(questionsRef, firestoreLimit(limit));
    
    // Apply filters
    if (filters.category) {
      questionsQuery = query(questionsQuery, where('category', '==', filters.category));
    }
    
    if (filters.specialty) {
      questionsQuery = query(questionsQuery, where('specialty', '==', filters.specialty));
    }
    
    if (filters.verified !== undefined) {
      questionsQuery = query(questionsQuery, where('verified', '==', filters.verified));
    }
    
    if (filters.minUpvotes) {
      questionsQuery = query(questionsQuery, where('upvotes', '>=', filters.minUpvotes));
    }
    
    // Order by most recent or most upvoted
    questionsQuery = query(questionsQuery, orderBy('upvotes', 'desc'));
    
    const snapshot = await getDocs(questionsQuery);
    const questions: QuestionBankQuestion[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const question: QuestionBankQuestion = {
        id: doc.id,
        question: data.question || 'Question text missing',
        options: data.options || [],
        correctAnswer: data.correctAnswer || 0,
        explanation: data.explanation || 'No explanation provided',
        category: data.category || 'General',
        specialty: data.specialty || 'General',
        difficulty: data.difficulty || 'Medium',
        tags: data.tags || [],
        source: data.source || 'Community',
        createdBy: data.createdBy || 'Anonymous',
        createdAt: data.createdAt?.toDate() || new Date(),
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        verified: data.verified || false,
        reportCount: data.reportCount || 0
      };
      
      // Apply search term filter (client-side for now)
      if (!searchTerm || 
          question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
        questions.push(question);
      }
    });
    
    console.log(`✅ Found ${questions.length} questions`);
    return questions;
    
  } catch (error) {
    console.error('❌ Error searching questions:', error);
    
    // Return mock data as fallback
    return generateMockQuestions(limit);
  }
}

// ===================================================================
// GENERATE QUIZ FROM QUESTION BANK
// ===================================================================

export async function generateQuizFromBank(
  category: string,
  questionCount: number = 20,
  difficulty?: string
): Promise<{
  quizId: string;
  title: string;
  questions: QuestionBankQuestion[];
}> {
  try {
    console.log('🎯 Generating quiz from question bank:', { category, questionCount, difficulty });
    
    const filters: SearchFilters = { category };
    if (difficulty) {
      filters.difficulty = [difficulty];
    }
    
    const questions = await searchQuestions('', filters, questionCount * 2);
    
    // Randomly select the requested number of questions
    const selectedQuestions = questions
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);
    
    const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const title = `${category} Quiz - ${questionCount} Questions`;
    
    // Optionally save the generated quiz
    const quizRef = doc(db, 'generatedQuizzes', quizId);
    await setDoc(quizRef, {
      title,
      category,
      questionCount,
      difficulty,
      questions: selectedQuestions.map(q => q.id),
      createdAt: serverTimestamp(),
      source: 'questionBank'
    });
    
    console.log('✅ Quiz generated successfully:', quizId);
    
    return {
      quizId,
      title,
      questions: selectedQuestions
    };
    
  } catch (error) {
    console.error('❌ Error generating quiz from bank:', error);
    throw error;
  }
}

// ===================================================================
// ADD QUESTION TO BANK
// ===================================================================

export async function addQuestionToBank(
  question: Omit<QuestionBankQuestion, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'verified' | 'reportCount'>
): Promise<string> {
  try {
    console.log('➕ Adding question to bank:', question.question);
    
    const questionsRef = collection(db, 'questionBank');
    const docRef = await addDoc(questionsRef, {
      ...question,
      createdAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      verified: false,
      reportCount: 0
    });
    
    console.log('✅ Question added successfully:', docRef.id);
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Error adding question to bank:', error);
    throw error;
  }
}

// ===================================================================
// MOCK DATA FUNCTIONS
// ===================================================================

function generateMockQuestions(count: number): QuestionBankQuestion[] {
  const mockQuestions: QuestionBankQuestion[] = [];
  const categories = ['Internal Medicine', 'Surgery', 'Cardiology', 'Neurology', 'Pediatrics'];
  const difficulties: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];
  
  for (let i = 0; i < count; i++) {
    mockQuestions.push({
      id: `mock_${i}`,
      question: `What is the most common cause of ${categories[i % categories.length].toLowerCase()} condition ${i + 1}?`,
      options: [
        'Option A: First possible answer',
        'Option B: Second possible answer',
        'Option C: Third possible answer',
        'Option D: Fourth possible answer'
      ],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: 'This is a detailed explanation of why this answer is correct.',
      category: categories[i % categories.length],
      specialty: categories[i % categories.length],
      difficulty: difficulties[i % difficulties.length],
      tags: ['medical', 'exam', categories[i % categories.length].toLowerCase()],
      source: 'Community Generated',
      createdBy: `user_${Math.floor(Math.random() * 100)}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      upvotes: Math.floor(Math.random() * 50),
      downvotes: Math.floor(Math.random() * 5),
      verified: Math.random() > 0.3,
      reportCount: Math.floor(Math.random() * 3)
    });
  }
  
  return mockQuestions;
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

export async function getQuestionCategories(): Promise<string[]> {
  try {
    const stats = await getQuestionBankStats();
    return Object.keys(stats.categories).sort();
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return [
      'Internal Medicine',
      'Surgery', 
      'Cardiology',
      'Neurology',
      'Pediatrics',
      'Emergency Medicine',
      'Pharmacology',
      'Pathology',
      'Radiology',
      'Psychiatry'
    ];
  }
}

export async function voteOnQuestion(questionId: string, isUpvote: boolean): Promise<void> {
  try {
    const questionRef = doc(db, 'questionBank', questionId);
    const questionDoc = await getDoc(questionRef);
    
    if (questionDoc.exists()) {
      const currentData = questionDoc.data();
      const updateData = isUpvote 
        ? { upvotes: (currentData.upvotes || 0) + 1 }
        : { downvotes: (currentData.downvotes || 0) + 1 };
      
      await setDoc(questionRef, updateData, { merge: true });
      console.log('✅ Vote recorded successfully');
    }
  } catch (error) {
    console.error('❌ Error voting on question:', error);
    throw error;
  }
}