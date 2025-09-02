import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc,
  addDoc,
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  writeBatch,
  DocumentData
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { stripe } from '../lib/stripe';

// Import types from consolidated types file
import type { 
  User, 
  Course, 
  Question, 
  Progress, 
  QuizAttempt 
} from '../types';

export class MainService {
  // ===================================================================
  // AI ENHANCEMENT METHODS
  // ===================================================================

  /**
   * Categorize a course using AI
   */
  static async categorizeCourse(courseId: string): Promise<{
    success: boolean;
    category?: string;
    confidence?: string;
  }> {
    try {
      const course = await this.getCourseById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      const response = await fetch('/api/ai/categorize-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: course.title,
          description: course.description,
          courseName: course.courseName
        })
      });

      if (!response.ok) {
        throw new Error(`Categorization failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update course with AI category
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        Category: result.category,
        categorySource: 'openai',
        categoryConfidence: result.confidence,
        categoryGeneratedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        category: result.category,
        confidence: result.confidence
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error categorizing course:', error);
      }
      return { success: false };
    }
  }

  /**
   * Enhance quiz explanations using AI
   */
  static async enhanceQuizExplanations(
    courseId: string,
    questionId: string
  ): Promise<{
    success: boolean;
    correctExplanation?: string;
    incorrectExplanation?: string;
  }> {
    try {
      const questions = await this.getQuizQuestions(courseId);
      const question = questions.find(q => q.id === questionId);
      
      if (!question) {
        throw new Error('Question not found');
      }

      const response = await fetch('/api/ai/enhance-quiz-explanations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          category: question.category
        })
      });

      if (!response.ok) {
        throw new Error(`Enhancement failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update question with enhanced explanations
      const questionRef = doc(db, 'courses', courseId, 'questions', questionId);
      await updateDoc(questionRef, {
        correctExplanation: result.correctExplanation,
        incorrectExplanation: result.incorrectExplanation,
        teachingElements: result.teachingElements,
        aiEnhanced: true,
        enhancedBy: 'openai',
        enhancedAt: serverTimestamp(),
        confidence: result.confidence
      });

      return {
        success: true,
        correctExplanation: result.correctExplanation,
        incorrectExplanation: result.incorrectExplanation
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error enhancing explanations:', error);
      }
      return { success: false };
    }
  }

  /**
   * Batch categorize all uncategorized courses
   */
  static async batchCategorizeCourses(
    progressCallback?: (progress: {
      total: number;
      processed: number;
      categorized: number;
      failed: number;
    }) => void
  ): Promise<{
    success: boolean;
    categorized: number;
    failed: number;
  }> {
    try {
      const courses = await this.getAllCourses();
      const uncategorized = courses.filter(c => !c.category || c.category === 'General Medicine');
      
      let categorized = 0;
      let failed = 0;
      
      for (let i = 0; i < uncategorized.length; i++) {
        const course = uncategorized[i];
        
        if (progressCallback) {
          progressCallback({
            total: uncategorized.length,
            processed: i + 1,
            categorized,
            failed
          });
        }
        
        const result = await this.categorizeCourse(course.id);
        if (result.success) {
          categorized++;
        } else {
          failed++;
        }
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      return { success: true, categorized, failed };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Batch categorization error:', error);
      }
      return { success: false, categorized: 0, failed: 0 };
    }
  }

  // ===================================================================
  // UPLOADED CONTENT HANDLING
  // ===================================================================

  static async saveUploadedContent(
    userId: string,
    content: {
      filename: string;
      content: string;
      fileSize: number;
      analysisResult?: any;
    }
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'uploadedContent'), {
        ...content,
        uploadedBy: userId,
        uploadedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving uploaded content:', error);
      }
      throw error;
    }
  }

  static async getUploadedContent(
    documentId: string,
    userId?: string
  ): Promise<any> {
    try {
      const docRef = doc(db, 'uploadedContent', documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Document not found');
      }
      
      const data = docSnap.data();
      
      // Check if user has access
      if (userId && data.uploadedBy !== userId && !data.isPublic) {
        throw new Error('Access denied');
      }
      
      return {
        id: docSnap.id,
        ...data,
        uploadedAt: data.uploadedAt?.toDate()
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching uploaded content:', error);
      }
      throw error;
    }
  }
  // ===================================================================
  // USER & AUTHENTICATION
  // ===================================================================
  
  static async getOrCreateUser(
    uid: string, 
    email: string, 
    displayName?: string
  ): Promise<User> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return this.formatUserData(userSnap.data());
      }

      // Create new user with Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email,
        name: displayName,
        metadata: { firebaseUid: uid }
      });

      const newUser: Partial<User> = {
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        stripeCustomerId: stripeCustomer.id,
        subscriptionTier: 'free',
        totalStudyTime: 0,
        quizzesCompleted: 0,
        coursesCompleted: 0,
        averageScore: 0,
        studyStreak: 0,
        lastActive: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });

      return newUser as User;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in getOrCreateUser:', error);
      }
      throw error;
    }
  }

  static async updateUserSubscription(
    uid: string, 
    subscriptionData: Partial<User>
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...subscriptionData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating user subscription:', error);
      }
      throw error;
    }
  }

  static async checkUserAccess(
    uid: string, 
    requiredTier: 'free' | 'pro' | 'premium'
  ): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return false;
      }

      const userData = userSnap.data();
      const userTier = userData.subscriptionTier || 'free';
      
      // Check subscription status
      if (userData.subscriptionStatus !== 'active' && userTier !== 'free') {
        return false;
      }

      // Check tier hierarchy
      const tierHierarchy: Record<string, number> = { free: 0, pro: 1, premium: 2 };
      return (tierHierarchy[userTier] ?? 0) >= (tierHierarchy[requiredTier] ?? 0);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error checking user access:', error);
      }
      return false;
    }
  }

  // ===================================================================
  // COURSES
  // ===================================================================

  static async getAllCourses(userId?: string): Promise<Course[]> {
    try {
      const coursesRef = collection(db, 'courses');
      const querySnapshot = await getDocs(coursesRef);
      
      const courses: Course[] = [];
      
      // Performance: Batch question count queries to avoid N+1
      const questionCountPromises = querySnapshot.docs.map(async (courseDoc) => {
        const courseId = courseDoc.id;
        const questionsRef = collection(db, 'courses', courseId, 'questions');
        const questionsSnapshot = await getDocs(questionsRef);
        
        return {
          courseId,
          questionCount: questionsSnapshot.size,
          firstQuestionData: questionsSnapshot.empty ? null : questionsSnapshot.docs[0].data()
        };
      });
      
      // Execute all queries in parallel
      const questionCounts = await Promise.all(questionCountPromises);
      const questionCountMap = new Map(
        questionCounts.map(item => [item.courseId, item])
      );
      
      for (const courseDoc of querySnapshot.docs) {
        const data = courseDoc.data();
        const courseId = courseDoc.id;
        const questionData = questionCountMap.get(courseId);
        
        // Get category from first question if not set
        let category = data.Category;
        if (!category && questionData?.firstQuestionData) {
          category = questionData.firstQuestionData.Category || 
                    questionData.firstQuestionData.category || 
                    'General Medicine';
        }
        
        const course: Course = {
          id: courseId,
          title: data.NewTitle || data.OriginalQuizTitle || data.CourseName || 'Untitled',
          courseName: data.CourseName || '',
          description: data.BriefDescription || data.Description || '',
          category: category || 'General Medicine',
          specialty: data.specialty || category || 'General Medicine',
          difficulty: this.inferDifficulty(data.NewTitle || data.CourseName || ''),
          instructor: data.instructor,
          questionCount: questionData?.questionCount || 0,
          estimatedTime: `${Math.round((questionData?.questionCount || 0) * 1.5)} min`,
          thumbnailUrl: data.thumbnailUrl,
          isPublic: data.isPublic !== false,
          isPremium: data.isPremium || false,
          requiredTier: data.requiredTier || 'free',
          rating: data.rating,
          enrolledStudents: data.enrolledStudents || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
        
        // Add user progress if userId provided
        if (userId) {
          const progress = await this.getUserCourseProgress(userId, courseId);
          if (progress) {
            course.progress = progress.progress;
            course.completed = progress.completed;
            course.lastScore = progress.lastScore ?? undefined;
            course.attempts = progress.attempts;
            course.lastAccessed = progress.lastAccessed;
          }
        }
        
        courses.push(course);
      }
      
      return courses.sort((a, b) => a.title.localeCompare(b.title));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching courses:', error);
      }
      throw error;
    }
  }

  static async getCourseById(courseId: string, userId?: string): Promise<Course | null> {
    try {
      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);
      
      if (!courseSnap.exists()) {
        return null;
      }

      const data = courseSnap.data();
      
      // Check user access for premium content
      if (userId && data.isPremium) {
        const hasAccess = await this.checkUserAccess(userId, data.requiredTier || 'pro');
        if (!hasAccess) {
          throw new Error('Premium subscription required');
        }
      }

      // Get questions for count
      const questionsRef = collection(db, 'courses', courseId, 'questions');
      const questionsSnapshot = await getDocs(questionsRef);
      
      const course: Course = {
        id: courseId,
        title: data.NewTitle || data.CourseName || 'Untitled',
        courseName: data.CourseName || '',
        description: data.BriefDescription || '',
        category: data.Category || 'General Medicine',
        specialty: data.specialty || 'General Medicine',
        difficulty: this.inferDifficulty(data.NewTitle || ''),
        questionCount: questionsSnapshot.size,
        estimatedTime: `${Math.round(questionsSnapshot.size * 1.5)} min`,
        isPublic: data.isPublic !== false,
        isPremium: data.isPremium || false,
        requiredTier: data.requiredTier || 'free',
        enrolledStudents: data.enrolledStudents || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };

      if (userId) {
        const progress = await this.getUserCourseProgress(userId, courseId);
        if (progress) {
          course.progress = progress.progress;
          course.completed = progress.completed;
          course.lastScore = progress.lastScore ?? undefined;
        }
      }

      return course;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching course:', error);
      }
      throw error;
    }
  }

  // ===================================================================
  // QUESTIONS & QUIZZES
  // ===================================================================

  static async getQuizQuestions(
    courseId: string, 
    userId?: string
  ): Promise<Question[]> {
    try {
      // Check access if user provided
      if (userId) {
        const course = await this.getCourseById(courseId);
        if (course?.isPremium) {
          const hasAccess = await this.checkUserAccess(userId, course.requiredTier);
          if (!hasAccess) {
            throw new Error('Premium subscription required for this content');
          }
        }
      }

      const questionsRef = collection(db, 'courses', courseId, 'questions');
      const querySnapshot = await getDocs(questionsRef);
      
      const questions: Question[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Parse options from various formats
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
        
        if (answerLetter && options.length > 0) {
          const letterIndex = optionLetters.indexOf(answerLetter);
          if (letterIndex !== -1 && letterIndex < options.length) {
            correctIndex = letterIndex;
          }
        }
        
        if (options.length > 0) {
          questions.push({
            id: doc.id,
            question: data.Question || '',
            options,
            correctAnswer: correctIndex,
            correctExplanation: data.correctExplanation || data.CorrectExplanation,
            incorrectExplanation: data.incorrectExplanation || data.IncorrectExplanation,
            hintMessage: data.hintMessage || data['Hint Message'],
            category: data.Category || data.category || 'General',
            specialty: data.specialty,
            topic: data.topic,
            difficulty: data.difficulty,
            tags: data.tags || [],
            aiEnhanced: !!data.explanationEnhancedBy,
            enhancedBy: data.explanationEnhancedBy,
            enhancedAt: data.enhancedAt?.toDate(),
            confidence: data.confidence,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          });
        }
      });
      
      return questions.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching quiz questions:', error);
      }
      throw error;
    }
  }

  // ===================================================================
  // PROGRESS TRACKING
  // ===================================================================

  static async getUserCourseProgress(
    userId: string, 
    courseId: string
  ): Promise<Progress | null> {
    try {
      const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`);
      const progressSnap = await getDoc(progressRef);
      
      if (!progressSnap.exists()) {
        return null;
      }

      const data = progressSnap.data();
      return {
        userId: data.userId,
        courseId: data.courseId,
        progress: data.progress || 0,
        completed: data.completed || false,
        lastScore: data.lastScore || null,
        bestScore: data.bestScore || null,
        averageScore: data.averageScore || null,
        attempts: data.attempts || 0,
        totalTimeSpent: data.totalTimeSpent || 0,
        startedAt: data.startedAt?.toDate() || null,
        completedAt: data.completedAt?.toDate() || null,
        lastAccessed: data.lastAccessed?.toDate() || new Date(),
        completedQuestions: data.completedQuestions || [],
        incorrectQuestions: data.incorrectQuestions || [],
        flaggedQuestions: data.flaggedQuestions || [],
        notes: data.notes || {}
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching progress:', error);
      }
      return null;
    }
  }

  static async updateProgress(
    userId: string,
    courseId: string,
    progressUpdate: Partial<Progress>
  ): Promise<void> {
    try {
      const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`);
      
      const existingProgress = await this.getUserCourseProgress(userId, courseId);
      
      const updateData: any = {
        userId,
        courseId,
        ...progressUpdate,
        lastAccessed: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Set startedAt if first attempt
      if (!existingProgress || !existingProgress.startedAt) {
        updateData.startedAt = serverTimestamp();
      }
      
      // Set completedAt if just completed
      if (progressUpdate.completed && (!existingProgress || !existingProgress.completed)) {
        updateData.completedAt = serverTimestamp();
      }
      
      // Update best score
      if (progressUpdate.lastScore) {
        const currentBest = existingProgress?.bestScore || 0;
        if (progressUpdate.lastScore > currentBest) {
          updateData.bestScore = progressUpdate.lastScore;
        }
      }
      
      await setDoc(progressRef, updateData, { merge: true });
      
      // Update user stats
      if (progressUpdate.completed) {
        await this.updateUserStats(userId, courseId, progressUpdate.lastScore || 0);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating progress:', error);
      }
      throw error;
    }
  }

  static async saveQuizAttempt(attempt: Omit<QuizAttempt, 'id'>): Promise<string> {
    try {
      // Check user has access to the course
      const hasAccess = await this.checkUserAccess(attempt.userId, 'free');
      if (!hasAccess) {
        throw new Error('User authentication required');
      }

      const attemptData = {
        ...attempt,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'quizAttempts'), attemptData);
      
      // Update progress
      await this.updateProgress(attempt.userId, attempt.courseId, {
        lastScore: attempt.percentage,
        completed: attempt.percentage >= 70,
        progress: 100,
        attempts: increment(1) as any,
        totalTimeSpent: increment(attempt.timeSpent) as any
      });
      
      return docRef.id;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving quiz attempt:', error);
      }
      throw error;
    }
  }

  // ===================================================================
  // PAYMENT & SUBSCRIPTION
  // ===================================================================

  static async createCheckoutSession(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    try {
      const user = await this.getOrCreateUser(userId, '', '');
      
      if (!user.stripeCustomerId) {
        throw new Error('Stripe customer not found');
      }

      const session = await stripe.checkout.sessions.create({
        customer: user.stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          firebaseUserId: userId
        }
      });

      return session.url || '';
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating checkout session:', error);
      }
      throw error;
    }
  }

  static async cancelSubscription(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('User not found');
      }

      const userData = userSnap.data();
      if (!userData.subscriptionId) {
        throw new Error('No active subscription');
      }

      await stripe.subscriptions.update(userData.subscriptionId, {
        cancel_at_period_end: true
      });

      await updateDoc(userRef, {
        subscriptionStatus: 'canceled',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error canceling subscription:', error);
      }
      throw error;
    }
  }

  // ===================================================================
  // HELPER METHODS
  // ===================================================================

  private static inferDifficulty(title: string): 'Beginner' | 'Intermediate' | 'Advanced' {
    const lower = title.toLowerCase();
    if (lower.includes('basic') || lower.includes('intro') || lower.includes('fundamental')) {
      return 'Beginner';
    }
    if (lower.includes('advanced') || lower.includes('expert') || lower.includes('board')) {
      return 'Advanced';
    }
    return 'Intermediate';
  }

  private static formatUserData(data: DocumentData): User {
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      stripeCustomerId: data.stripeCustomerId,
      subscriptionId: data.subscriptionId,
      subscriptionStatus: data.subscriptionStatus,
      subscriptionTier: data.subscriptionTier || 'free',
      subscriptionEndDate: data.subscriptionEndDate?.toDate(),
      medicalStatus: data.medicalStatus,
      yearLevel: data.yearLevel,
      currentRotation: data.currentRotation,
      institution: data.institution,
      specialty: data.specialty,
      totalStudyTime: data.totalStudyTime || 0,
      quizzesCompleted: data.quizzesCompleted || 0,
      coursesCompleted: data.coursesCompleted || 0,
      averageScore: data.averageScore || 0,
      studyStreak: data.studyStreak || 0,
      lastActive: data.lastActive?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }

  private static async updateUserStats(
    userId: string, 
    courseId: string, 
    score: number
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const completedCount = userData.quizzesCompleted || 0;
        const currentAvg = userData.averageScore || 0;
        const newAvg = ((currentAvg * completedCount) + score) / (completedCount + 1);
        
        await updateDoc(userRef, {
          quizzesCompleted: increment(1),
          averageScore: newAvg,
          lastActive: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating user stats:', error);
      }
    }
  }
}
