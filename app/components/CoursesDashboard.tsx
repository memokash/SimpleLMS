'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import {
  BookOpen, Star, Target, Clock, CheckCircle, Award, Lock, Crown, ArrowRight, Book, Sun, Moon,
  Filter, Search, Play, Users, TrendingUp, Zap, Calendar, Brain, Sparkles
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc } from 'firebase/firestore';

interface Course {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  estimatedTime?: string;
  rating?: number;
  tier?: 'free' | 'pro' | 'premium';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  enrolledCount?: number;
  lastUpdated?: string;
}

interface UserStats {
  averageScore?: number;
  quizzesCompleted?: number;
  tier?: 'free' | 'pro' | 'premium';
}

const CoursesDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [completedQuizData, setCompletedQuizData] = useState<Record<string, any>>({});
  const [userNotes, setUserNotes] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Predefined categories - no dynamic generation
  const predefinedCategories = [
    'all',
    'General Medicine',
    'Cardiology', 
    'Neurology',
    'Emergency Medicine',
    'Pediatrics',
    'Surgery',
    'Psychiatry'
  ];

  const loadData = async () => {
    if (!user) {
      return;
    }

    const userRef = doc(db, 'users', user.uid);

    // Enhanced mock data with predefined categories
    const mockCourses: Course[] = [
      {
        id: 'msq-quiz-4',
        title: 'MSQ Quiz 4',
        description: 'Comprehensive medical knowledge assessment covering multiple body systems and clinical scenarios',
        questionCount: 45,
        estimatedTime: '45 min',
        rating: 4.8,
        tier: 'free',
        difficulty: 'intermediate',
        category: 'General Medicine',
        enrolledCount: 1245,
        lastUpdated: '2 days ago'
      },
      {
        id: 'cardiology-fundamentals',
        title: 'Cardiology Fundamentals',
        description: 'Essential cardiology concepts including ECG interpretation, heart diseases, and treatment protocols',
        questionCount: 30,
        estimatedTime: '30 min',
        rating: 4.9,
        tier: 'pro',
        difficulty: 'intermediate',
        category: 'Cardiology',
        enrolledCount: 892,
        lastUpdated: '1 week ago'
      },
      {
        id: 'neurology-advanced',
        title: 'Advanced Neurology',
        description: 'Complex neurological conditions, brain anatomy, and advanced diagnostic techniques',
        questionCount: 60,
        estimatedTime: '60 min',
        rating: 4.7,
        tier: 'premium',
        difficulty: 'advanced',
        category: 'Neurology',
        enrolledCount: 456,
        lastUpdated: '3 days ago'
      },
      {
        id: 'emergency-medicine',
        title: 'Emergency Medicine Essentials',
        description: 'Critical care scenarios, trauma management, and emergency protocols',
        questionCount: 40,
        estimatedTime: '40 min',
        rating: 4.6,
        tier: 'pro',
        difficulty: 'advanced',
        category: 'Emergency Medicine',
        enrolledCount: 678,
        lastUpdated: '5 days ago'
      },
      {
        id: 'pediatrics-basics',
        title: 'Pediatrics Fundamentals',
        description: 'Child development, pediatric diseases, and age-specific treatment approaches',
        questionCount: 35,
        estimatedTime: '35 min',
        rating: 4.5,
        tier: 'free',
        difficulty: 'beginner',
        category: 'Pediatrics',
        enrolledCount: 923,
        lastUpdated: '1 week ago'
      }
    ];

    try {
      const resultsSnap = await getDocs(collection(userRef, 'quizResults'));
      const results: Record<string, any> = {};
      resultsSnap.forEach(doc => {
        results[doc.id] = doc.data();
      });

      const notesSnap = await getDocs(collection(userRef, 'notes'));
      const notes: Record<string, any> = {};
      notesSnap.forEach(doc => {
        notes[doc.id] = doc.data();
      });

      setCourses(mockCourses);
      setCompletedQuizData(results);
      setUserNotes(notes);

      setUserStats({
        averageScore: 82,
        quizzesCompleted: Object.keys(results).length,
        tier: 'pro'
      });
    } catch (error) {
      console.error('Error loading data:', error);
      // Still set courses even if Firebase fails
      setCourses(mockCourses);
      setUserStats({
        averageScore: 82,
        quizzesCompleted: 0,
        tier: 'pro'
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const canAccessCourse = (course: Course) => {
    if (!user) {
      return false;
    }
    const userTier = userStats?.tier || 'free';
    const courseTier = course.tier || 'free';

    return (
      courseTier === 'free' ||
      (courseTier === 'pro' && ['pro', 'premium'].includes(userTier)) ||
      (courseTier === 'premium' && userTier === 'premium')
    );
  };

  const shouldShowETutor = (quizId: string): boolean => {
    const result = completedQuizData[quizId];
    const notes = userNotes[quizId];
    return !!(
      result?.submitted &&
      result?.wrongQuestions?.length > 0 &&
      notes &&
      Object.keys(notes).length > 0
    );
  };

  const getTierBadgeClasses = (tier: string) => {
    if (tier === 'premium') {
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg';
    } else if (tier === 'pro') {
      return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg';
    }
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'intermediate': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'advanced': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  // Simple client-side filtering - no database calls
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="flex items-center text-gray-600 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <Brain className="animate-pulse h-6 w-6 mr-3 text-blue-500" />
          <span className="text-lg font-medium">Loading your courses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      <div className="max-w-7xl mx-auto py-8 px-4">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              📚 Available Courses
              <span className="text-lg font-normal bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full">
                {filteredCourses.length} courses
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Enhance your medical knowledge with our comprehensive quiz library
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 dark:border-gray-700/50">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-300">Avg Score: {userStats?.averageScore}%</span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[200px]"
              >
                {predefinedCategories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {filteredCourses.map(course => {
            const hasAccess = canAccessCourse(course);
            const showETutor = shouldShowETutor(course.id);
            const isCompleted = completedQuizData[course.id]?.submitted;

            return (
              <div
                key={course.id}
                className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                          {course.title}
                        </h2>
                        {isCompleted && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {course.tier !== 'free' && (
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${getTierBadgeClasses(course.tier)}`}>
                            {course.tier.toUpperCase()}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                          {course.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                      <Target className="h-4 w-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{course.questionCount}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Questions</div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                      <Clock className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{course.estimatedTime}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Duration</div>
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                      <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{course.rating}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Rating</div>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                      <Users className="h-4 w-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{course.enrolledCount}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Enrolled</div>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Updated {course.lastUpdated}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => router.push(`/quiz?id=${course.id}`)}
                      className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 ${
                        hasAccess
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!hasAccess}
                    >
                      {hasAccess ? (
                        <>
                          <Play className="mr-2 h-5 w-5" />
                          {isCompleted ? 'Retake Quiz' : 'Start Quiz'}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-5 w-5" />
                          Upgrade Required
                        </>
                      )}
                    </button>

                    {showETutor && (
                      <button
                        onClick={() => router.push(`/dashboard/etutor/${course.id}`)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <Sparkles className="h-5 w-5 mr-2" />
                        AI Tutor
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-lg max-w-md mx-auto">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesDashboard;