/**
 * Quiz Index Service - Optimized quiz loading with index system
 * 
 * Instead of loading all quiz data, we maintain a lightweight index
 * that contains only essential metadata for listing and filtering.
 */

import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/firebase';

// Lightweight index entry for quiz listing
export interface QuizIndexEntry {
  id: string;
  title: string;
  category: string;
  specialty?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionCount: number;
  duration: number; // in minutes
  requiredTier: 'free' | 'pro' | 'premium';
  isPremium: boolean;
  rating: number;
  attempts: number;
  tags: string[];
  imageUrl?: string;
  description: string;
  lastUpdated: Date | Timestamp;
  popularity: number; // based on attempts and ratings
}

// Full quiz data (loaded only when needed)
export interface QuizData extends QuizIndexEntry {
  questions: any[]; // Full question data
  createdBy?: string;
  createdAt: Date | Timestamp;
}

// Filter options for quiz browsing
export interface QuizFilter {
  category?: string;
  specialty?: string;
  difficulty?: string;
  requiredTier?: string;
  searchTerm?: string;
  tags?: string[];
  minRating?: number;
  maxQuestions?: number;
  minQuestions?: number;
}

// Sort options
export type QuizSortBy = 'title' | 'popularity' | 'rating' | 'difficulty' | 'questionCount' | 'lastUpdated';

export class QuizIndexService {
  private static INDEX_COLLECTION = 'quizIndex';
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static indexCache: Map<string, { data: QuizIndexEntry[], timestamp: number }> = new Map();

  /**
   * Get quiz index with caching
   * This is the main method for loading quiz listings
   */
  static async getQuizIndex(
    filter?: QuizFilter,
    sortBy: QuizSortBy = 'popularity',
    maxResults: number = 100
  ): Promise<QuizIndexEntry[]> {
    const cacheKey = JSON.stringify({ filter, sortBy, maxResults });
    
    // Check cache first
    const cached = this.indexCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('Returning cached quiz index');
      return cached.data;
    }

    try {
      console.log('Fetching quiz index from Firestore');
      
      // Build query
      let q = collection(db, this.INDEX_COLLECTION);
      const constraints: any[] = [];

      // Apply filters
      if (filter?.category) {
        constraints.push(where('category', '==', filter.category));
      }
      if (filter?.specialty) {
        constraints.push(where('specialty', '==', filter.specialty));
      }
      if (filter?.difficulty) {
        constraints.push(where('difficulty', '==', filter.difficulty));
      }
      if (filter?.requiredTier) {
        constraints.push(where('requiredTier', '==', filter.requiredTier));
      }
      if (filter?.minRating) {
        constraints.push(where('rating', '>=', filter.minRating));
      }

      // Apply sorting
      const sortField = this.getSortField(sortBy);
      constraints.push(orderBy(sortField, 'desc'));
      
      // Limit results
      constraints.push(limit(maxResults));

      // Execute query
      const querySnapshot = await getDocs(query(q, ...constraints));
      
      const entries: QuizIndexEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          ...data,
          lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate() : new Date()
        } as QuizIndexEntry);
      });

      // Apply client-side filtering for complex filters
      let filteredEntries = entries;
      
      if (filter?.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        filteredEntries = filteredEntries.filter(entry =>
          entry.title.toLowerCase().includes(searchLower) ||
          entry.description.toLowerCase().includes(searchLower) ||
          entry.category.toLowerCase().includes(searchLower) ||
          entry.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      if (filter?.tags && filter.tags.length > 0) {
        filteredEntries = filteredEntries.filter(entry =>
          filter.tags!.some(tag => entry.tags.includes(tag))
        );
      }

      if (filter?.minQuestions) {
        filteredEntries = filteredEntries.filter(entry =>
          entry.questionCount >= filter.minQuestions!
        );
      }

      if (filter?.maxQuestions) {
        filteredEntries = filteredEntries.filter(entry =>
          entry.questionCount <= filter.maxQuestions!
        );
      }

      // Cache the results
      this.indexCache.set(cacheKey, {
        data: filteredEntries,
        timestamp: Date.now()
      });

      return filteredEntries;
    } catch (error) {
      console.error('Error fetching quiz index:', error);
      throw new Error('Failed to load quiz index');
    }
  }

  /**
   * Get a single quiz's full data (including questions)
   * Use this only when user actually starts a quiz
   */
  static async getQuizData(quizId: string): Promise<QuizData | null> {
    try {
      console.log(`Loading full quiz data for: ${quizId}`);
      
      // First get the index entry
      const indexDoc = await getDoc(doc(db, this.INDEX_COLLECTION, quizId));
      if (!indexDoc.exists()) {
        console.error(`Quiz index not found: ${quizId}`);
        return null;
      }

      const indexData = indexDoc.data() as QuizIndexEntry;
      
      // Then get the questions
      const questionsRef = collection(db, 'courses', quizId, 'questions');
      const questionsSnapshot = await getDocs(questionsRef);
      
      const questions: any[] = [];
      questionsSnapshot.forEach((doc) => {
        questions.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        ...indexData,
        id: quizId,
        questions,
        createdAt: serverTimestamp() as Timestamp
      };
    } catch (error) {
      console.error(`Error loading quiz data for ${quizId}:`, error);
      return null;
    }
  }

  /**
   * Build/rebuild the quiz index from courses collection
   * This should be run periodically or when courses are updated
   */
  static async buildQuizIndex(): Promise<void> {
    try {
      console.log('Building quiz index...');
      
      const coursesRef = collection(db, 'courses');
      const coursesSnapshot = await getDocs(coursesRef);
      
      const batch = writeBatch(db);
      let count = 0;

      for (const courseDoc of coursesSnapshot.docs) {
        const courseData = courseDoc.data();
        const courseId = courseDoc.id;
        
        // Get question count
        const questionsRef = collection(db, 'courses', courseId, 'questions');
        const questionsSnapshot = await getDocs(questionsRef);
        const questionCount = questionsSnapshot.size;
        
        if (questionCount === 0) {
          console.log(`Skipping ${courseId} - no questions`);
          continue;
        }

        // Calculate popularity score
        const popularity = this.calculatePopularity(
          courseData.rating || 0,
          courseData.attempts || 0,
          courseData.completions || 0
        );

        // Create index entry
        const indexEntry: Omit<QuizIndexEntry, 'id'> = {
          title: courseData.title || courseData.courseName || courseId,
          category: courseData.category || 'Uncategorized',
          specialty: courseData.specialty,
          difficulty: courseData.difficulty || 'Intermediate',
          questionCount,
          duration: Math.ceil(questionCount * 1.5), // 1.5 minutes per question
          requiredTier: courseData.requiredTier || 'free',
          isPremium: courseData.isPremium || false,
          rating: courseData.rating || 0,
          attempts: courseData.attempts || 0,
          tags: courseData.tags || [],
          imageUrl: courseData.imageUrl,
          description: courseData.description || '',
          lastUpdated: serverTimestamp() as Timestamp,
          popularity
        };

        // Add to batch
        const indexRef = doc(db, this.INDEX_COLLECTION, courseId);
        batch.set(indexRef, indexEntry);
        count++;

        // Commit batch every 100 documents
        if (count % 100 === 0) {
          await batch.commit();
          console.log(`Indexed ${count} quizzes...`);
        }
      }

      // Commit remaining
      if (count % 100 !== 0) {
        await batch.commit();
      }

      console.log(`Quiz index built successfully! Indexed ${count} quizzes.`);
      
      // Clear cache
      this.indexCache.clear();
    } catch (error) {
      console.error('Error building quiz index:', error);
      throw new Error('Failed to build quiz index');
    }
  }

  /**
   * Update a single quiz in the index
   */
  static async updateQuizIndex(quizId: string, updates: Partial<QuizIndexEntry>): Promise<void> {
    try {
      const indexRef = doc(db, this.INDEX_COLLECTION, quizId);
      await updateDoc(indexRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      });
      
      // Clear cache
      this.indexCache.clear();
    } catch (error) {
      console.error(`Error updating quiz index for ${quizId}:`, error);
      throw error;
    }
  }

  /**
   * Get quiz categories from index
   */
  static async getCategories(): Promise<string[]> {
    try {
      const indexSnapshot = await getDocs(collection(db, this.INDEX_COLLECTION));
      const categories = new Set<string>();
      
      indexSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.category) {
          categories.add(data.category);
        }
      });
      
      return Array.from(categories).sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Get popular quizzes
   */
  static async getPopularQuizzes(limit: number = 10): Promise<QuizIndexEntry[]> {
    return this.getQuizIndex(undefined, 'popularity', limit);
  }

  /**
   * Get recent quizzes
   */
  static async getRecentQuizzes(limit: number = 10): Promise<QuizIndexEntry[]> {
    return this.getQuizIndex(undefined, 'lastUpdated', limit);
  }

  /**
   * Get quizzes by tier
   */
  static async getQuizzesByTier(tier: 'free' | 'pro' | 'premium'): Promise<QuizIndexEntry[]> {
    const filter: QuizFilter = { requiredTier: tier };
    return this.getQuizIndex(filter);
  }

  /**
   * Search quizzes
   */
  static async searchQuizzes(searchTerm: string): Promise<QuizIndexEntry[]> {
    const filter: QuizFilter = { searchTerm };
    return this.getQuizIndex(filter);
  }

  /**
   * Helper: Calculate popularity score
   */
  private static calculatePopularity(
    rating: number,
    attempts: number,
    completions: number
  ): number {
    // Weighted formula: rating * 2 + log(attempts) + completions * 0.5
    const ratingScore = rating * 2;
    const attemptScore = Math.log10(attempts + 1) * 10;
    const completionScore = completions * 0.5;
    
    return Math.round(ratingScore + attemptScore + completionScore);
  }

  /**
   * Helper: Get sort field name
   */
  private static getSortField(sortBy: QuizSortBy): string {
    const fieldMap: Record<QuizSortBy, string> = {
      title: 'title',
      popularity: 'popularity',
      rating: 'rating',
      difficulty: 'difficulty',
      questionCount: 'questionCount',
      lastUpdated: 'lastUpdated'
    };
    
    return fieldMap[sortBy] || 'popularity';
  }

  /**
   * Clear cache (useful after updates)
   */
  static clearCache(): void {
    this.indexCache.clear();
  }
}

// Export convenience functions
export const getQuizIndex = QuizIndexService.getQuizIndex.bind(QuizIndexService);
export const getQuizData = QuizIndexService.getQuizData.bind(QuizIndexService);
export const buildQuizIndex = QuizIndexService.buildQuizIndex.bind(QuizIndexService);
export const updateQuizIndex = QuizIndexService.updateQuizIndex.bind(QuizIndexService);
export const getCategories = QuizIndexService.getCategories.bind(QuizIndexService);
export const getPopularQuizzes = QuizIndexService.getPopularQuizzes.bind(QuizIndexService);
export const getRecentQuizzes = QuizIndexService.getRecentQuizzes.bind(QuizIndexService);
export const searchQuizzes = QuizIndexService.searchQuizzes.bind(QuizIndexService);