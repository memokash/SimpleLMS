'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import {
  BookOpen, Star, Target, Clock, CheckCircle, Award, Lock, Crown, ArrowRight, Book, Sun, Moon,
  Filter, Search, Play, Users, TrendingUp, Zap, Calendar, Brain, Sparkles, BarChart3
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

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
      green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
      purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
      orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
    };
    return colorMap[color] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
  };

  // Section Separator Component
  const SectionSeparator = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
    <div className="relative my-16">
      <div className="absolute inset-0 flex items-center">
        <div className={`w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent dark:via-yellow-400/60 rounded-full`}></div>
      </div>
      <div className="relative flex justify-center">
        <div className={`px-8 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-yellow-500/30 shadow-xl dark:shadow-yellow-500/20`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${getColorClasses(color)}`}>
              <Icon className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
        </div>
      </div>
    </div>
  );

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
      <div className="max-w-7xl mx-auto py-12 px-4">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white flex items-center gap-4">
              📚 Available Courses
              <span className="text-xl font-normal bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full">
                {filteredCourses.length} courses
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Enhance your medical knowledge with our comprehensive quiz library
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20 dark:border-yellow-500/30 shadow-lg dark:shadow-yellow-500/20">
              <div className="flex items-center gap-3 text-base">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Avg Score: {userStats?.averageScore}%</span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/20 dark:border-yellow-500/30 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-yellow-500/20"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-6 w-6 text-yellow-500" />
              ) : (
                <Moon className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <SectionSeparator title="Search & Filter" icon={Search} color="blue" />
        
        <div className="mb-12 bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-12 pr-8 py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[250px] text-gray-900 dark:text-white text-lg"
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

        {/* Courses Section */}
        <SectionSeparator title="Your Courses" icon={BookOpen} color="purple" />
        
        <div className="grid lg:grid-cols-1 gap-8">
          {filteredCourses.map(course => {
            const hasAccess = canAccessCourse(course);
            const showETutor = shouldShowETutor(course.id);
            const isCompleted = completedQuizData[course.id]?.submitted;

            return (
              <div
                key={course.id}
                className="group relative bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-[1.01] overflow-hidden min-h-[300px]"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 p-8">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                          {course.title}
                        </h2>
                        {isCompleted && (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mb-6">
                        {course.tier !== 'free' && (
                          <span className={`text-sm px-4 py-2 rounded-full font-semibold ${getTierBadgeClasses(course.tier)}`}>
                            {course.tier.toUpperCase()}
                          </span>
                        )}
                        <span className={`text-sm px-3 py-1 rounded-full font-semibold ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                        <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full font-semibold">
                          {course.category}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-lg">
                        {course.description}
                      </p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center">
                          <Target className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{course.questionCount}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Questions</div>
                        </div>
                        
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center">
                          <Clock className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{course.estimatedTime}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Duration</div>
                        </div>
                        
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4 text-center">
                          <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{course.rating}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Rating</div>
                        </div>
                        
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 text-center">
                          <Users className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{course.enrolledCount}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Enrolled</div>
                        </div>
                      </div>

                      {/* Last Updated */}
                      <div className="flex items-center gap-3 mb-8 text-base text-gray-500 dark:text-gray-300">
                        <Calendar className="h-5 w-5" />
                        <span>Updated {course.lastUpdated}</span>
                      </div>
                    </div>

                    {/* Action Buttons - Right Side */}
                    <div className="flex flex-col justify-center gap-4 min-w-[200px]">
                      <button
                        onClick={() => router.push(`/quiz?id=${course.id}`)}
                        className={`px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-all duration-300 text-lg ${
                          hasAccess
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!hasAccess}
                      >
                        {hasAccess ? (
                          <>
                            <Play className="mr-3 h-6 w-6" />
                            {isCompleted ? 'Retake Quiz' : 'Start Quiz'}
                            <ArrowRight className="ml-3 h-6 w-6" />
                          </>
                        ) : (
                          <>
                            <Lock className="mr-3 h-6 w-6" />
                            Upgrade Required
                          </>
                        )}
                      </button>

                      {showETutor && (
                        <button
                          onClick={() => router.push(`/dashboard/etutor/${course.id}`)}
                          className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold text-lg"
                        >
                          <Sparkles className="h-6 w-6 mr-3" />
                          AI Tutor
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-12 border border-white/20 dark:border-yellow-500/30 shadow-lg max-w-lg mx-auto">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No courses found</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesDashboard;