// types/database.types.ts
// Central type definitions for the entire application
// No duplicate interfaces should be created elsewhere

// User and Profile Types
export interface MedicalProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  bio?: string;
  medicalStatus: MedicalStatus;
  yearLevel: string;
  currentRotation: string;
  rotationLocation: string;
  institution: string;
  location: string;
  interests: string[];
  privacy: PrivacySettings;
  isActive: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrivacySettings {
  showEmail: PrivacyLevel;
  showPhone: PrivacyLevel;
  showLocation: PrivacyLevel;
  showRotation: PrivacyLevel;
  showRotationLocation: PrivacyLevel;
  showInstitution: PrivacyLevel;
  showStatus: PrivacyLevel;
}

export type PrivacyLevel = 'public' | 'colleagues' | 'private';

export type MedicalStatus = 
  | 'Pre-Med Student'
  | 'Medical Student' 
  | 'Resident'
  | 'Fellow'
  | 'Attending Physician'
  | 'Nurse Practitioner'
  | 'Physician Assistant'
  | 'Other Healthcare Professional';

// Invitation and Referral Types
export interface Invitation {
  id: string;
  senderUserId: string;
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  message: string;
  referralCode: string;
  status: 'pending' | 'sent' | 'failed' | 'accepted';
  sentAt: Date;
  acceptedAt?: Date;
}

export interface ReferralStats {
  userId: string;
  totalInvitesSent: number;
  totalAccepted: number;
  referralCode: string;
  createdAt: Date;
}

// Device Management Types
export interface DeviceSession {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  lastActive: Date;
  createdAt: Date;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress?: string;
}

// Course and Quiz Types
export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: DifficultyLevel;
  duration: number;
  topics: string[];
  prerequisites?: string[];
  objectives?: string[];
  imageUrl?: string;
  enrollmentCount?: number;
  rating?: number;
  instructor?: string;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CourseCategory = 
  | 'Anatomy'
  | 'Physiology'
  | 'Biochemistry'
  | 'Pathology'
  | 'Pharmacology'
  | 'Microbiology'
  | 'Clinical Skills'
  | 'Medical Ethics'
  | 'Surgery'
  | 'Internal Medicine'
  | 'Pediatrics'
  | 'Obstetrics & Gynecology'
  | 'Psychiatry'
  | 'Emergency Medicine'
  | 'Radiology';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
  attempts?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  category?: string;
  difficulty?: DifficultyLevel;
  imageUrl?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: Answer[];
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface Answer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  points: number;
}

// Analytics Types
export interface UserStats {
  userId: string;
  totalQuizzes: number;
  averageScore: number;
  totalTimeSpent: number;
  streakDays: number;
  lastActive: Date;
  coursesCompleted: number;
  certificatesEarned: number;
  rank?: number;
  badges?: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  criteria: string;
  earnedAt: Date;
}

// Study Group Types
export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  memberIds: string[];
  maxMembers: number;
  category: CourseCategory;
  meetingSchedule?: string;
  isPrivate: boolean;
  joinCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Discussion Forum Types
export interface ForumPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  category: ForumCategory;
  tags: string[];
  upvotes: number;
  downvotes: number;
  viewCount: number;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ForumCategory = 
  | 'General Discussion'
  | 'Study Tips'
  | 'Course Questions'
  | 'Clinical Cases'
  | 'Research'
  | 'Career Advice'
  | 'Exam Preparation'
  | 'Resources';

export interface ForumReply {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  isAcceptedAnswer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject?: string;
  content: string;
  isRead: boolean;
  attachments?: Attachment[];
  createdAt: Date;
  readAt?: Date;
}

export interface Attachment {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'pro';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export type NotificationType = 
  | 'quiz_result'
  | 'course_update'
  | 'message'
  | 'invitation'
  | 'achievement'
  | 'reminder'
  | 'system';

// AI/OpenAI Types
export interface AITutorSession {
  id: string;
  userId: string;
  quizId?: string;
  questionId?: string;
  messages: AIMessage[];
  context?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface QuizGenerationRequest {
  courseId?: string;
  topic: string;
  difficulty: DifficultyLevel;
  questionCount: number;
  questionTypes: string[];
  userId: string;
}

// Calendar/Schedule Types
export interface ScheduleEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: EventType;
  startTime: Date;
  endTime: Date;
  location?: string;
  isRecurring: boolean;
  recurringPattern?: string;
  reminders?: Reminder[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventType = 'rotation' | 'exam' | 'study_session' | 'meeting' | 'deadline' | 'other';

export interface Reminder {
  id: string;
  minutes: number;
  type: 'email' | 'push' | 'sms';
}

// Settings Types
export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: NotificationSettings;
  pushNotifications: NotificationSettings;
  privacy: PrivacySettings;
  studyGoals: StudyGoals;
  updatedAt: Date;
}

export interface NotificationSettings {
  enabled: boolean;
  quizResults: boolean;
  courseUpdates: boolean;
  messages: boolean;
  reminders: boolean;
  marketing: boolean;
}

export interface StudyGoals {
  dailyMinutes: number;
  weeklyQuizzes: number;
  targetScore: number;
}