// lib/firebaseServices.ts - Complete Firebase Services
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// User Data Services
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  tier: 'free' | 'pro' | 'premium';
  totalStudyTime: number;
  quizzesCompleted: number;
  averageScore: number;
  studyStreak: number;
  lastActive: Date;
  preferences: {
    theme: 'light' | 'dark';
    difficulty: string;
    specialties: string[];
  };
  stats: {
    totalCourses: number;
    completed: number;
    inProgress: number;
    avgScore: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration: number;
  difficulty: string;
  rating: number;
  enrolledStudents: number;
  thumbnailUrl?: string;
  tags: string[];
  quizCount: number;
  isPublished: boolean;
  progress?: number;
  isEnrolled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quiz {
  id: string;
  courseId?: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: number;
  questions: Question[];
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  correctExplanation?: string;
  incorrectExplanation?: string;
  category?: string;
  explanationEnhancedBy?: string;
  teachingElements?: {
    analogies?: string[];
    mnemonics?: string[];
    examples?: string[];
  };
}

export interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  courseId?: string;
  answers: number[];
  score: number;
  timeSpent: number;
  completedAt: Date;
  mode: 'study' | 'test' | 'flashcard';
  notes: Record<string, string>;
}

export interface QuizProgress {
  answers: number[];
  mode: 'study' | 'test' | 'flashcard';
  currentQuestionIndex: number;
  startedAt: Date;
  submittedAt?: Date;
  notes: Record<string, string>;
  score?: number;
  completed?: boolean;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  meetingTime?: string;
  location?: string;
  nextMeeting?: Date;
  createdBy: string;
  createdByName: string;
  members: string[];
  tags: string[];
  avgRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: string;
  topic: string;
  specialty: string;
  tags: string[];
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  timesUsed: number;
  qualityScore: number;
  isPublic: boolean;
  aiGenerated: boolean;
}

// User Services
export const userService = {
  // Get or create user profile
  async getOrCreateUserProfile(uid: string, email: string, displayName?: string): Promise<UserProfile> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        uid,
        ...data,
        lastActive: data.lastActive?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as UserProfile;
    }

    // Create new user profile
    const newUser: Omit<UserProfile, 'uid'> = {
      email,
      displayName: displayName || email.split('@')[0],
      tier: 'free',
      totalStudyTime: 0,
      quizzesCompleted: 0,
      averageScore: 0,
      studyStreak: 0,
      lastActive: new Date(),
      preferences: {
        theme: 'light',
        difficulty: 'intermediate',
        specialties: []
      },
      stats: {
        totalCourses: 0,
        completed: 0,
        inProgress: 0,
        avgScore: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(userRef, {
      ...newUser,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });

    return { uid, ...newUser };
  },

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  // Update user stats after quiz completion
  async updateUserStats(uid: string, quizResult: Omit<QuizResult, 'id' | 'userId'>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      const newCompletedCount = userData.quizzesCompleted + 1;
      const newAverageScore = ((userData.averageScore * userData.quizzesCompleted) + quizResult.score) / newCompletedCount;

      await updateDoc(userRef, {
        quizzesCompleted: increment(1),
        averageScore: newAverageScore,
        totalStudyTime: increment(quizResult.timeSpent),
        lastActive: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  },

  // Get user's quiz results
  async getUserQuizResults(uid: string): Promise<QuizResult[]> {
    const resultsRef = collection(db, 'quizResults');
    const q = query(
      resultsRef, 
      where('userId', '==', uid), 
      orderBy('completedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      completedAt: doc.data().completedAt?.toDate()
    })) as QuizResult[];
  }
};

// Course Services
export const courseService = {
  // Get all courses
  async getAllCourses(): Promise<Course[]> {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, where('isPublished', '==', true), orderBy('title'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Course[];
  },

  // Get course by ID
  async getCourseById(courseId: string): Promise<Course | null> {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (courseSnap.exists()) {
      return {
        id: courseSnap.id,
        ...courseSnap.data(),
        createdAt: courseSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: courseSnap.data().updatedAt?.toDate() || new Date()
      } as Course;
    }
    
    return null;
  },

  // Get courses by category
  async getCoursesByCategory(category: string): Promise<Course[]> {
    const coursesRef = collection(db, 'courses');
    const q = query(
      coursesRef, 
      where('category', '==', category),
      where('isPublished', '==', true),
      orderBy('rating', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Course[];
  },

  // Enroll user in course
  async enrollUserInCourse(uid: string, courseId: string): Promise<void> {
    const enrollmentRef = doc(db, 'enrollments', `${uid}_${courseId}`);
    await setDoc(enrollmentRef, {
      userId: uid,
      courseId,
      enrolledAt: serverTimestamp(),
      progress: 0,
      lastAccessed: serverTimestamp()
    });

    // Update course enrolled count
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      enrolledStudents: increment(1)
    });
  },

  // Get user's enrolled courses
  async getUserEnrolledCourses(uid: string): Promise<Course[]> {
    const enrollmentsRef = collection(db, 'enrollments');
    const q = query(enrollmentsRef, where('userId', '==', uid));
    const querySnapshot = await getDocs(q);
    
    const courseIds = querySnapshot.docs.map(doc => doc.data().courseId);
    
    if (courseIds.length === 0) {
      return [];
    }

    // Get course details for enrolled courses
    const courses: Course[] = [];
    for (const courseId of courseIds) {
      const course = await this.getCourseById(courseId);
      if (course) {
        courses.push({
          ...course,
          isEnrolled: true,
          progress: 0 // You can implement progress tracking later
        });
      }
    }
    
    return courses;
  }
};

// Quiz Services
export const quizService = {
  // Get all public quizzes
  async getAllQuizzes(): Promise<Quiz[]> {
    const quizzesRef = collection(db, 'quizzes');
    const q = query(quizzesRef, where('isPublic', '==', true), orderBy('title'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Quiz[];
  },

  // Get quiz by ID
  async getQuizById(quizId: string): Promise<Quiz | null> {
    const quizRef = doc(db, 'quizzes', quizId);
    const quizSnap = await getDoc(quizRef);
    
    if (quizSnap.exists()) {
      return {
        id: quizSnap.id,
        ...quizSnap.data(),
        createdAt: quizSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: quizSnap.data().updatedAt?.toDate() || new Date()
      } as Quiz;
    }
    
    return null;
  },

  // Get quizzes by course
  async getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
    const quizzesRef = collection(db, 'quizzes');
    const q = query(
      quizzesRef, 
      where('courseId', '==', courseId),
      where('isPublic', '==', true),
      orderBy('title')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Quiz[];
  },

  // Save quiz result
  async saveQuizResult(uid: string, quizResult: Omit<QuizResult, 'id' | 'userId'>): Promise<string> {
    const resultsRef = collection(db, 'quizResults');
    const docRef = await addDoc(resultsRef, {
      ...quizResult,
      userId: uid,
      completedAt: serverTimestamp()
    });

    // Update user stats
    await userService.updateUserStats(uid, quizResult);

    return docRef.id;
  },

  // Get quiz result
  async getQuizResult(uid: string, quizId: string): Promise<QuizResult | null> {
    const resultsRef = collection(db, 'quizResults');
    const q = query(
      resultsRef,
      where('userId', '==', uid),
      where('quizId', '==', quizId),
      orderBy('completedAt', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt?.toDate()
      } as QuizResult;
    }
    
    return null;
  },

  // Save/Load quiz progress
  async saveQuizProgress(uid: string, quizId: string, progress: Omit<QuizProgress, 'startedAt'>): Promise<void> {
    const progressRef = doc(db, 'quizProgress', `${uid}_${quizId}`);
    await setDoc(progressRef, {
      ...progress,
      startedAt: serverTimestamp(),
      submittedAt: progress.submittedAt ? serverTimestamp() : null
    });
  },

  async getQuizProgress(uid: string, quizId: string): Promise<QuizProgress | null> {
    const progressRef = doc(db, 'quizProgress', `${uid}_${quizId}`);
    const progressSnap = await getDoc(progressRef);
    
    if (progressSnap.exists()) {
      const data = progressSnap.data();
      return {
        ...data,
        startedAt: data.startedAt?.toDate() || new Date(),
        submittedAt: data.submittedAt?.toDate()
      } as QuizProgress;
    }
    
    return null;
  }
};

// Question Bank Services
export const questionBankService = {
  // Get all public questions
  async getAllQuestions(): Promise<GeneratedQuestion[]> {
    const questionsRef = collection(db, 'generatedQuestions');
    const q = query(
      questionsRef, 
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as GeneratedQuestion[];
  },

  // Search questions
  async searchQuestions(searchTerm: string, filters: {
    category?: string;
    difficulty?: string;
    specialty?: string;
    topic?: string;
  }): Promise<GeneratedQuestion[]> {
    let q = query(
      collection(db, 'generatedQuestions'),
      where('isPublic', '==', true)
    );

    // Apply filters
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters.difficulty) {
      q = query(q, where('difficulty', '==', filters.difficulty));
    }
    if (filters.specialty) {
      q = query(q, where('specialty', '==', filters.specialty));
    }

    const querySnapshot = await getDocs(q);
    let questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as GeneratedQuestion[];

    // Filter by search term (client-side for now)
    if (searchTerm) {
      questions = questions.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.explanation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return questions;
  },

  // Get question bank stats
  async getQuestionBankStats(): Promise<{
    totalQuestions: number;
    bySpecialty: Record<string, number>;
    byDifficulty: Record<string, number>;
    byTopic: Record<string, number>;
    byCategory: Record<string, number>;
    recentlyAdded: number;
  }> {
    const questionsRef = collection(db, 'generatedQuestions');
    const q = query(questionsRef, where('isPublic', '==', true));
    const querySnapshot = await getDocs(q);

    const stats = {
      totalQuestions: 0,
      bySpecialty: {} as Record<string, number>,
      byDifficulty: {} as Record<string, number>,
      byTopic: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      recentlyAdded: 0
    };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.totalQuestions++;

      // Count by specialty
      if (data.specialty) {
        stats.bySpecialty[data.specialty] = (stats.bySpecialty[data.specialty] || 0) + 1;
      }

      // Count by difficulty
      if (data.difficulty) {
        stats.byDifficulty[data.difficulty] = (stats.byDifficulty[data.difficulty] || 0) + 1;
      }

      // Count by topic
      if (data.topic) {
        stats.byTopic[data.topic] = (stats.byTopic[data.topic] || 0) + 1;
      }

      // Count by category
      if (data.category) {
        stats.byCategory[data.category] = (stats.byCategory[data.category] || 0) + 1;
      }

      // Count recently added
      const createdAt = data.createdAt?.toDate();
      if (createdAt && createdAt > oneWeekAgo) {
        stats.recentlyAdded++;
      }
    });

    return stats;
  },

  // Add generated question to bank
  async addQuestionToBank(uid: string, question: Omit<GeneratedQuestion, 'id' | 'createdBy' | 'createdByName' | 'createdAt' | 'timesUsed' | 'qualityScore'>): Promise<string> {
    const questionsRef = collection(db, 'generatedQuestions');
    
    // Get user info for createdByName
    const userProfile = await userService.getOrCreateUserProfile(uid, '', '');
    
    const docRef = await addDoc(questionsRef, {
      ...question,
      createdBy: uid,
      createdByName: userProfile.displayName || 'Anonymous',
      createdAt: serverTimestamp(),
      timesUsed: 0,
      qualityScore: 8 // Default quality score
    });

    return docRef.id;
  },

  // Generate quiz from question bank
  async generateQuizFromBank(preferences: {
    specialty?: string;
    difficulty?: string;
    category?: string;
    topics?: string[];
    questionCount: number;
    userId: string;
    excludeUsedRecently?: boolean;
  }): Promise<{
    questions: GeneratedQuestion[];
    metadata: {
      specialty: string;
      difficulty: string;
      category: string;
      generatedAt: Date;
    };
  }> {
    let q = query(
      collection(db, 'generatedQuestions'),
      where('isPublic', '==', true)
    );

    // Apply filters
    if (preferences.specialty && preferences.specialty !== 'all') {
      q = query(q, where('specialty', '==', preferences.specialty));
    }
    if (preferences.difficulty && preferences.difficulty !== 'all') {
      q = query(q, where('difficulty', '==', preferences.difficulty));
    }
    if (preferences.category && preferences.category !== 'all') {
      q = query(q, where('category', '==', preferences.category));
    }

    const querySnapshot = await getDocs(q);
    let questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as GeneratedQuestion[];

    // Shuffle and select requested number
    questions = questions.sort(() => Math.random() - 0.5);
    const selectedQuestions = questions.slice(0, preferences.questionCount);

    return {
      questions: selectedQuestions,
      metadata: {
        specialty: preferences.specialty || 'Mixed',
        difficulty: preferences.difficulty || 'Mixed',
        category: preferences.category || 'Mixed',
        generatedAt: new Date()
      }
    };
  }
};

// Export all services
export const firebaseServices = {
  userService,
  courseService,
  quizService,
  questionBankService
};