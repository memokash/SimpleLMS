// User & Profile Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  // Stripe Integration
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  subscriptionTier: 'free' | 'pro' | 'premium';
  subscriptionEndDate?: Date;
  // Medical Profile
  medicalStatus?: 'Medical Student' | 'Resident' | 'Fellow' | 'Attending' | 'Other';
  yearLevel?: string;
  currentRotation?: string;
  institution?: string;
  specialty?: string;
  // Stats
  totalStudyTime: number;
  quizzesCompleted: number;
  coursesCompleted: number;
  averageScore: number;
  studyStreak: number;
  lastActive: Date;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Course Types
export interface Course {
  id: string;
  title: string;
  courseName: string;
  description: string;
  category: string;
  specialty: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor?: string;
  // Content
  questionCount: number;
  estimatedTime: string;
  thumbnailUrl?: string;
  // Access Control
  isPublic: boolean;
  isPremium: boolean;
  requiredTier: 'free' | 'pro' | 'premium';
  // Stats
  rating?: number;
  enrolledStudents: number;
  // User Progress (when joined with user data)
  progress?: number;
  completed?: boolean;
  lastScore?: number;
  attempts?: number;
  lastAccessed?: Date;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Question Types (Unified)
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  // Explanations
  correctExplanation?: string;
  incorrectExplanation?: string;
  hintMessage?: string;
  // Categorization
  category: string;
  specialty?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  // AI Enhancement
  aiEnhanced?: boolean;
  enhancedBy?: 'openai' | 'manual';
  enhancedAt?: Date;
  confidence?: 'high' | 'medium' | 'low';
  // Stats
  timesUsed?: number;
  averageCorrectRate?: number;
  // Metadata
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Quiz/Course Progress
export interface Progress {
  userId: string;
  courseId: string;
  progress: number; // 0-100
  completed: boolean;
  // Scores
  lastScore: number | null;
  bestScore: number | null;
  averageScore: number | null;
  attempts: number;
  // Timing
  totalTimeSpent: number; // seconds
  startedAt: Date | null;
  completedAt: Date | null;
  lastAccessed: Date;
  // Detailed Progress
  completedQuestions: string[];
  incorrectQuestions: string[];
  flaggedQuestions: string[];
  notes: Record<string, string>;
}

// Quiz Attempt
export interface QuizAttempt {
  id: string;
  userId: string;
  courseId: string;
  // Results
  score: number;
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
  // Timing
  startedAt: Date;
  completedAt: Date;
  timeSpent: number; // seconds
  // Mode
  mode: 'study' | 'test' | 'flashcard';
  // Detailed Answers
  answers: Array<{
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent?: number;
  }>;
}

// User Statistics
export interface UserStats {
  totalStudyTime: number;
  quizzesCompleted: number;
  coursesCompleted: number;
  coursesAvailable: number;
  coursesInProgress: number;
  averageScore: number;
  studyStreak: number;
  lastActive: Date;
  totalQuestions: number;
  correctAnswers: number;
  weeklyGoal?: number;
  monthlyGoal?: number;
}
