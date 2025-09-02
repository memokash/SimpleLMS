// ===================================================================
// COURSE & QUIZ SERVICE - PRODUCTION READY (services/courseService.ts)
// ===================================================================

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc,
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  limit,
  DocumentData,
  Timestamp,
  FieldValue
} from 'firebase/firestore';
import { db } from './firebase';

// ===================================================================
// TYPE DEFINITIONS
// ===================================================================

export interface Course {
  id: string;
  title: string;
  courseName: string;
  description: string;
  category: string;
  specialty: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionCount: number;
  estimatedTime: string;
  instructor?: string;
  rating?: number;
  studentsEnrolled?: number;
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // User-specific fields (populated when userId provided)
  progress?: number;
  completed?: boolean;
  lastScore?: number | null;
  attempts?: number;
  lastAccessed?: Date;
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  progress: number;
  completed: boolean;
  lastScore: number | null;
  attempts: number;
  startedAt: Date | null;
  completedAt: Date | null;
  lastAccessed: Date;
  updatedAt: Date;
  questionScores?: QuestionScore[];
}

export interface QuestionScore {
  questionId: string;
  isCorrect: boolean;
  selectedAnswer: number;
  timeSpent?: number;
}

export interface UserStats {
  userId: string;
  coursesStarted: number;
  coursesCompleted: number;
  totalAttempts: number;
  averageScore: number;
  totalScore: number;
  streak: number;
  lastActivity: Date | null;
  rank: UserRank;
  badges?: string[];
  achievements?: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  earnedAt: Date;
  icon?: string;
}

export type UserRank = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  points: number;
  category: string;
  answerType: 'single' | 'multiple';
  questionTitle?: string;
  correctExplanation?: string | null;
  incorrectExplanation?: string | null;
  hintMessage?: string | null;
  correctAnswerMessage?: string | null;
  incorrectAnswerMessage?: string | null;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface QuizAttempt {
  id?: string;
  userId: string;
  courseId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  answers: QuestionScore[];
  startedAt: Date;
  completedAt: Date;
  timeSpent: number; // in seconds
}

// ===================================================================
// COURSE SERVICE CLASS
// ===================================================================

export class CourseService {
  /**
   * Get all courses with real data from Firestore
   * @description Fetches all available courses from the database with their metadata
   * @returns {Promise<Course[]>} Array of course objects with computed fields
   * @throws {Error} When database connection fails or data is corrupted
   * @example
   * ```typescript
   * const courses = await CourseService.getAllCourses();
   * console.log(`Found ${courses.length} courses`);
   * ```
   */
  static async getAllCourses(): Promise<Course[]> {
    try {
      console.log('CourseService.getAllCourses: Starting...');
      const coursesRef = collection(db, 'courses');
      const querySnapshot = await getDocs(coursesRef);
      
      console.log(`CourseService.getAllCourses: Found ${querySnapshot.size} documents`);
      
      if (querySnapshot.empty) {
        console.log('No courses found in database');
        return [];
      }

      const coursePromises = querySnapshot.docs.map(async (courseDoc) => {
        const data = courseDoc.data();
        const courseId = courseDoc.id;
        
        // Get real category from first question
        let realCategory = await this.getCourseCategory(courseId);
        
        // Get actual question count
        const questionCount = await this.getCourseQuestionCount(courseId);
        
        return {
          id: courseId,
          title: data.NewTitle || data.OriginalQuizTitle || data.CourseName || 'Untitled Course',
          courseName: data.CourseName || '',
          description: data.BriefDescription || data.Description || 'Professional medical course',
          category: realCategory || '', // Empty until OpenAI processing
          specialty: data.specialty || realCategory || 'Medical Education',
          difficulty: this.inferDifficulty(data.NewTitle || data.OriginalQuizTitle || ''),
          questionCount,
          estimatedTime: this.calculateEstimatedTime(questionCount),
          instructor: data.instructor,
          rating: data.rating,
          studentsEnrolled: data.studentsEnrolled,
          isPublic: data.isPublic !== false,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      });
      
      const courses = await Promise.all(coursePromises);
      return courses.sort((a, b) => a.title.localeCompare(b.title));
      
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  /**
   * Get course category from questions - returns empty until OpenAI processing
   */
  private static async getCourseCategory(courseId: string): Promise<string> {
    try {
      const questionsRef = collection(db, 'courses', courseId, 'questions');
      const q = query(questionsRef, limit(1));
      const questionsSnapshot = await getDocs(q);
      
      if (!questionsSnapshot.empty) {
        const firstQuestion = questionsSnapshot.docs[0].data();
        // Return only if OpenAI has already processed and set the category
        return firstQuestion.Category || 
               firstQuestion.category || 
               firstQuestion.CATEGORY ||
               ''; // Empty until OpenAI processing
      }
      
      return ''; // Empty until OpenAI processing
    } catch (error) {
      console.error(`Error getting category for course ${courseId}:`, error);
      return ''; // Empty until OpenAI processing
    }
  }

  /**
   * Get actual question count for a course
   */
  private static async getCourseQuestionCount(courseId: string): Promise<number> {
    try {
      const questionsRef = collection(db, 'courses', courseId, 'questions');
      const questionsSnapshot = await getDocs(questionsRef);
      return questionsSnapshot.size;
    } catch (error) {
      console.error(`Error getting question count for course ${courseId}:`, error);
      return 0;
    }
  }

  /**
   * Get courses by category
   */
  static async getCoursesByCategory(targetCategory: string): Promise<Course[]> {
    try {
      const allCourses = await this.getAllCourses();
      return allCourses.filter(course => 
        course.category.toLowerCase() === targetCategory.toLowerCase()
      );
    } catch (error) {
      console.error('Error fetching courses by category:', error);
      throw new Error('Failed to fetch courses by category');
    }
  }

  /**
   * Get all unique categories
   */
  static async getAllCategories(): Promise<string[]> {
    try {
      const courses = await this.getAllCourses();
      const categories = Array.from(new Set(courses.map(course => course.category)));
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  /**
   * Get courses grouped by category
   */
  static async getCoursesGroupedByCategory(): Promise<Record<string, Course[]>> {
    try {
      const courses = await this.getAllCourses();
      const grouped: Record<string, Course[]> = {};
      
      courses.forEach(course => {
        const category = course.category || 'Other';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(course);
      });
      
      return grouped;
    } catch (error) {
      console.error('Error grouping courses by category:', error);
      throw new Error('Failed to group courses');
    }
  }

  /**
   * Get courses with user progress
   */
  static async getAllCoursesWithProgress(userId: string | null): Promise<Course[]> {
    try {
      const courses = await this.getAllCourses();
      
      if (!userId) {
        return courses;
      }
      
      // Get user progress
      const progressQuery = query(
        collection(db, 'userProgress'),
        where('userId', '==', userId)
      );
      
      const progressSnapshot = await getDocs(progressQuery);
      const progressMap: Record<string, Partial<CourseProgress>> = {};
      
      progressSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.courseId) {
          progressMap[data.courseId] = {
            progress: data.progress || 0,
            completed: data.completed || false,
            lastScore: data.lastScore || null,
            attempts: data.attempts || 0,
            lastAccessed: data.lastAccessed?.toDate()
          };
        }
      });
      
      // Merge progress with courses
      return courses.map(course => ({
        ...course,
        ...progressMap[course.id]
      }));
      
    } catch (error) {
      console.error('Error fetching courses with progress:', error);
      throw new Error('Failed to fetch courses with progress');
    }
  }

  /**
   * Get user course progress
   */
  static async getUserCourseProgress(userId: string, courseId: string): Promise<CourseProgress> {
    try {
      const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        const data = progressDoc.data();
        return {
          userId: data.userId,
          courseId: data.courseId,
          progress: data.progress || 0,
          completed: data.completed || false,
          lastScore: data.lastScore || null,
          attempts: data.attempts || 0,
          startedAt: data.startedAt?.toDate() || null,
          completedAt: data.completedAt?.toDate() || null,
          lastAccessed: data.lastAccessed?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          questionScores: data.questionScores || []
        };
      }
      
      // Return default progress if none exists
      return {
        userId,
        courseId,
        progress: 0,
        completed: false,
        lastScore: null,
        attempts: 0,
        startedAt: null,
        completedAt: null,
        lastAccessed: new Date(),
        updatedAt: new Date(),
        questionScores: []
      };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw new Error('Failed to fetch user progress');
    }
  }

  /**
   * Update user progress
   */
  static async updateUserProgress(
    userId: string, 
    courseId: string, 
    progressData: Partial<CourseProgress>
  ): Promise<void> {
    try {
      const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`);
      
      const existingProgress = await this.getUserCourseProgress(userId, courseId);
      
      const updateData: any = {
        userId,
        courseId,
        ...progressData,
        lastAccessed: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Set startedAt if this is the first attempt
      if (existingProgress.progress === 0 && !existingProgress.startedAt) {
        updateData.startedAt = serverTimestamp();
      }
      
      // Set completedAt if just completed
      if (progressData.completed && !existingProgress.completed) {
        updateData.completedAt = serverTimestamp();
      }
      
      await setDoc(progressRef, updateData, { merge: true });
      
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw new Error('Failed to update user progress');
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      const progressQuery = query(
        collection(db, 'userProgress'),
        where('userId', '==', userId)
      );
      
      const progressSnapshot = await getDocs(progressQuery);
      
      const stats: UserStats = {
        userId,
        coursesStarted: 0,
        coursesCompleted: 0,
        totalAttempts: 0,
        averageScore: 0,
        totalScore: 0,
        streak: 0,
        lastActivity: null,
        rank: 'Beginner',
        badges: [],
        achievements: []
      };
      
      let totalScoreSum = 0;
      let scoredAttempts = 0;
      
      progressSnapshot.forEach((doc) => {
        const data = doc.data();
        
        if (data.progress > 0) {
          stats.coursesStarted++;
        }
        if (data.completed) {
          stats.coursesCompleted++;
        }
        if (data.attempts) {
          stats.totalAttempts += data.attempts;
        }
        
        if (data.lastScore !== null && data.lastScore !== undefined) {
          totalScoreSum += data.lastScore;
          scoredAttempts++;
        }
        
        const lastAccessed = data.lastAccessed?.toDate();
        if (lastAccessed && (!stats.lastActivity || lastAccessed > stats.lastActivity)) {
          stats.lastActivity = lastAccessed;
        }
      });
      
      if (scoredAttempts > 0) {
        stats.averageScore = Math.round(totalScoreSum / scoredAttempts);
        stats.totalScore = totalScoreSum;
      }
      
      stats.rank = this.calculateUserRank(stats.averageScore, stats.coursesCompleted);
      stats.badges = this.calculateBadges(stats);
      
      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  /**
   * Get quiz questions for a course
   */
  static async getQuizQuestions(courseId: string): Promise<QuizQuestion[]> {
    try {
      console.log(`Fetching quiz questions for course: ${courseId}`);
      
      const questionsRef = collection(db, 'courses', courseId, 'questions');
      const querySnapshot = await getDocs(questionsRef);
      
      const questions: QuizQuestion[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Build options array from Firestore structure
        const options: string[] = [];
        const optionLetters = ['a', 'b', 'c', 'd', 'e'];
        
        optionLetters.forEach(letter => {
          const optionKey = `Option (${letter})`;
          const option = data[optionKey];
          if (option && option !== 'NaN' && option.trim() !== '') {
            options.push(option);
          }
        });
        
        // Find correct answer index
        const answerLetter = data.Answer?.toLowerCase();
        let correctIndex = 0;
        
        if (answerLetter) {
          let currentIndex = 0;
          for (let i = 0; i < optionLetters.length; i++) {
            const letter = optionLetters[i];
            const optionKey = `Option (${letter})`;
            const option = data[optionKey];
            
            if (option && option !== 'NaN' && option.trim() !== '') {
              if (letter === answerLetter) {
                correctIndex = currentIndex;
                break;
              }
              currentIndex++;
            }
          }
        }
        
        // Only add questions that have valid options
        if (options.length > 0) {
          questions.push({
            id: doc.id,
            question: data.Question || 'No question text',
            options,
            correct: correctIndex,
            points: data.Points || 1,
            category: data.Category || 'General',
            answerType: data['Answer Type'] || 'single',
            questionTitle: data['Question Title'],
            correctExplanation: data.CorrectExplanation || null,
            incorrectExplanation: data.IncorrectExplanation || null,
            hintMessage: data['Hint Message'] || null,
            correctAnswerMessage: data['Correct Answer Message'] || null,
            incorrectAnswerMessage: data['Incorrect Answer Message'] || null,
            difficulty: data.difficulty,
            tags: data.tags || []
          });
        }
      });
      
      console.log(`Found ${questions.length} valid questions`);
      return questions.sort((a, b) => a.id.localeCompare(b.id));
      
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      throw new Error('Failed to fetch quiz questions');
    }
  }

  /**
   * Save quiz attempt
   */
  static async saveQuizAttempt(attempt: QuizAttempt): Promise<string> {
    try {
      const attemptData: any = {
        ...attempt,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'quizAttempts'), attemptData);
      
      // Update user progress
      await this.updateUserProgress(attempt.userId, attempt.courseId, {
        lastScore: attempt.percentage,
        completed: attempt.percentage >= 70, // 70% passing grade
        progress: 100,
        attempts: 1 // This will be incremented
      });
      
      console.log('Quiz attempt saved:', docRef.id);
      return docRef.id;
      
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      throw new Error('Failed to save quiz attempt');
    }
  }

  /**
   * Get quiz attempts for a user
   */
  static async getUserQuizAttempts(userId: string, courseId?: string): Promise<QuizAttempt[]> {
    try {
      let q = query(
        collection(db, 'quizAttempts'),
        where('userId', '==', userId),
        orderBy('completedAt', 'desc'),
        limit(20)
      );

      if (courseId) {
        q = query(
          collection(db, 'quizAttempts'),
          where('userId', '==', userId),
          where('courseId', '==', courseId),
          orderBy('completedAt', 'desc'),
          limit(20)
        );
      }

      const querySnapshot = await getDocs(q);
      const attempts: QuizAttempt[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        attempts.push({
          id: doc.id,
          userId: data.userId,
          courseId: data.courseId,
          score: data.score,
          totalPoints: data.totalPoints,
          percentage: data.percentage,
          answers: data.answers || [],
          startedAt: data.startedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate() || new Date(),
          timeSpent: data.timeSpent || 0
        });
      });

      return attempts;
    } catch (error) {
      console.error('Error fetching user quiz attempts:', error);
      throw new Error('Failed to fetch quiz attempts');
    }
  }

  // ===================================================================
  // HELPER METHODS
  // ===================================================================

  private static inferDifficulty(title: string): 'Beginner' | 'Intermediate' | 'Advanced' {
    if (!title) {
      return 'Intermediate';
    }
    
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('basic') || 
        lowerTitle.includes('intro') || 
        lowerTitle.includes('fundamental') ||
        lowerTitle.includes('foundation')) {
      return 'Beginner';
    }
    
    if (lowerTitle.includes('advanced') || 
        lowerTitle.includes('expert') || 
        lowerTitle.includes('board') ||
        lowerTitle.includes('comprehensive')) {
      return 'Advanced';
    }
    
    return 'Intermediate';
  }

  private static calculateEstimatedTime(questionCount: number): string {
    const minutes = Math.round(questionCount * 1.5); // 1.5 minutes per question
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}m`;
      } else {
        return `${hours}h`;
      }
    }
  }

  private static calculateUserRank(averageScore: number, coursesCompleted: number): UserRank {
    if (coursesCompleted >= 10 && averageScore >= 95) {
      return 'Master';
    }
    if (coursesCompleted >= 5 && averageScore >= 90) {
      return 'Expert';
    }
    if (coursesCompleted >= 3 && averageScore >= 80) {
      return 'Advanced';
    }
    if (coursesCompleted >= 1 && averageScore >= 70) {
      return 'Intermediate';
    }
    return 'Beginner';
  }

  private static calculateBadges(stats: UserStats): string[] {
    const badges: string[] = [];
    
    if (stats.coursesCompleted >= 1) {
      badges.push('First Course');
    }
    if (stats.coursesCompleted >= 5) {
      badges.push('Course Explorer');
    }
    if (stats.coursesCompleted >= 10) {
      badges.push('Knowledge Seeker');
    }
    if (stats.averageScore >= 90) {
      badges.push('High Achiever');
    }
    if (stats.averageScore === 100 && stats.coursesCompleted > 0) {
      badges.push('Perfectionist');
    }
    if (stats.streak >= 7) {
      badges.push('Week Warrior');
    }
    if (stats.streak >= 30) {
      badges.push('Dedicated Learner');
    }
    
    return badges;
  }
}

// ===================================================================
// LEGACY EXPORTS FOR BACKWARD COMPATIBILITY
// ===================================================================

// Function exports that map to class methods
export const getAllCourses = CourseService.getAllCourses.bind(CourseService);
export const getCoursesByCategory = CourseService.getCoursesByCategory.bind(CourseService);
export const getAllCategories = CourseService.getAllCategories.bind(CourseService);
export const getCoursesGroupedByCategory = CourseService.getCoursesGroupedByCategory.bind(CourseService);
export const getAllCoursesWithProgress = CourseService.getAllCoursesWithProgress.bind(CourseService);
export const getCoursesWithProgress = CourseService.getAllCoursesWithProgress.bind(CourseService); // Alias
export const getUserCourseProgress = CourseService.getUserCourseProgress.bind(CourseService);
export const updateUserProgress = CourseService.updateUserProgress.bind(CourseService);
export const getUserStats = CourseService.getUserStats.bind(CourseService);
export const getQuizQuestions = CourseService.getQuizQuestions.bind(CourseService);
export const saveQuizAttempt = CourseService.saveQuizAttempt.bind(CourseService);
export const getUserQuizAttempts = CourseService.getUserQuizAttempts.bind(CourseService);