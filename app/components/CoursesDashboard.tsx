'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { getAllCoursesWithProgress, getUserStats } from '../../lib/courseService';
import {
  BookOpen, Star, Target, Clock, CheckCircle, Award, Lock, Crown, 
  ArrowRight, Book, Loader2, AlertCircle, RefreshCw, Sun, Moon,
  TrendingUp, Zap, Brain, BarChart3, Activity, Sparkles, ChevronRight,
  Users, Globe, Play, Eye, Calendar, User, Tag, Bookmark, Search
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  courseName: string;
  description: string;
  category: string;
  specialty: string;
  difficulty: string;
  questionCount: number;
  estimatedTime: string;
  completed: boolean;
  lastScore: number | null;
  progress: number;
  instructor: string;
  rating: number;
  studentsEnrolled: number;
  isPublic: boolean;
}

interface UserStats {
  averageScore?: number;
  quizzesCompleted?: number;
  tier?: 'free' | 'pro' | 'premium';
  coursesStarted: number;
  coursesCompleted: number;
  totalAttempts: number;
  totalScore: number;
  streak: number;
  lastActivity: Date | null;
  rank: string;
}

const CoursesDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  // Production-safe state management
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDark, setIsDark] = useState(false);

  // Theme management
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('courses-theme', newTheme ? 'dark' : 'light');
    }
  };

  // Load theme from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedTheme = localStorage.getItem('courses-theme');
      if (savedTheme === 'dark') {
        setIsDark(true);
      }
    }
  }, []);

  // Handle mounting to prevent SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced data loading with Firebase
  const loadData = async () => {
    if (!mounted) {
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log('🔥 Loading courses from Firebase...');
      
      // Use the existing courseService.ts to get courses
      const coursesData = await getAllCoursesWithProgress(user?.uid);
      console.log('✅ Loaded courses:', coursesData.length);
      
      setCourses(coursesData);
      setFilteredCourses(coursesData);

      if (user) {
        // Get user statistics
        const stats = await getUserStats(user.uid);
        console.log('✅ Loaded user stats:', stats);
        setUserStats(stats);
      } else {
        setUserStats({
          averageScore: 0,
          quizzesCompleted: 0,
          tier: 'free',
          coursesStarted: 0,
          coursesCompleted: 0,
          totalAttempts: 0,
          totalScore: 0,
          streak: 0,
          lastActivity: null,
          rank: 'Beginner'
        });
      }

    } catch (error) {
      console.error('❌ Data loading failed:', error);
      setError('Failed to load course data. Please try again.');
      
      // No fallback to mock data - just show error
      setCourses([]);
      setFilteredCourses([]);
      
    } finally {
      setLoading(false);
    }
  };

  // Enhanced search and filter functionality
  const filterCourses = () => {
    let filtered = courses;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Specialty filter
    if (selectedSpecialty) {
      filtered = filtered.filter(course => course.specialty === selectedSpecialty);
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(course => course.difficulty === selectedDifficulty);
    }

    // Sort courses
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => b.title.localeCompare(a.title)); // Fallback sort
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'difficulty':
        const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
        filtered.sort((a, b) => (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) - (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0));
        break;
      default:
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredCourses(filtered);
  };

  // Load data and set up filtering
  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted, user]);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, selectedSpecialty, selectedDifficulty, sortBy, courses]);

  // Retry function
  const retryLoad = () => {
    setError(null);
    setLoading(true);
    loadData();
  };

  // Safe navigation with error handling
  const handleStartQuiz = (courseId: string) => {
    try {
      router.push(`/quiz?id=${courseId}`);
    } catch (error) {
      console.error('Navigation failed:', error);
      alert('Failed to start quiz. Please try again.');
    }
  };

  // Get unique values for filters
  const uniqueSpecialties = Array.from(new Set(courses.map(c => c.specialty).filter(Boolean)));
  const uniqueDifficulties = Array.from(new Set(courses.map(c => c.difficulty).filter(Boolean)));

  // Don't render until mounted (prevents SSR issues)
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className="flex items-center text-gray-600 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <Loader2 className="animate-spin h-8 w-8 mr-4 text-blue-500" />
          <span className="text-xl font-semibold">Loading courses from Firebase...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Error Loading Courses
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <button
                onClick={retryLoad}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Enhanced Header */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl backdrop-blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      Medical Course Library ✨
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                      {filteredCourses.length} courses • Real Firebase data
                    </p>
                  </div>
                </div>
                
                {/* User Stats */}
                {user && userStats && (
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-green-200/30 dark:border-green-700/30">
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-gray-700 dark:text-gray-200 font-semibold">
                          Avg Score: {userStats.averageScore}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-blue-200/30 dark:border-blue-700/30">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-gray-700 dark:text-gray-200 font-semibold">
                          Started: {userStats.coursesStarted}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-purple-200/30 dark:border-purple-700/30">
                      <div className="flex items-center gap-2 text-sm">
                        <Crown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-gray-700 dark:text-gray-200 font-semibold">
                          Rank: {userStats.rank}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 shadow-lg hover:shadow-xl group"
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <Sun className="h-6 w-6 text-yellow-500 group-hover:rotate-45 transition-transform duration-300" />
                  ) : (
                    <Moon className="h-6 w-6 text-gray-700 group-hover:rotate-12 transition-transform duration-300" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/30">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by title, specialty, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg backdrop-blur-sm"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-4">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm"
                >
                  <option value="">All Specialties</option>
                  {uniqueSpecialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
                
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm"
                >
                  <option value="">All Difficulties</option>
                  {uniqueDifficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm"
                >
                  <option value="title">A-Z</option>
                  <option value="rating">Highest Rated</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Display */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-12 max-w-md mx-auto shadow-2xl border border-white/20">
              <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No courses found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search criteria or check back later.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('');
                  setSelectedDifficulty('');
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map(course => (
              <div
                key={course.id}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 hover:shadow-3xl hover:border-white/30 dark:hover:border-gray-600/50 transition-all duration-500 hover:scale-[1.02] overflow-hidden"
              >
                {/* Course content */}
                <div className="relative p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {course.title || course.courseName}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                          {course.specialty || course.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          course.difficulty === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          course.difficulty === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                          {course.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center text-yellow-400 mb-1">
                        <Star className="h-4 w-4 mr-1 fill-current" />
                        <span className="font-bold text-gray-900 dark:text-white">{course.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed line-clamp-3">
                    {course.description}
                  </p>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50/80 dark:bg-gray-700/50 rounded-xl p-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <Target className="h-4 w-4 mr-2" />
                        Questions
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white">{course.questionCount}</div>
                    </div>
                    <div className="bg-gray-50/80 dark:bg-gray-700/50 rounded-xl p-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <Clock className="h-4 w-4 mr-2" />
                        Duration
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white">{course.estimatedTime}</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleStartQuiz(course.id)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                  >
                    <Play className="mr-3 h-6 w-6" />
                    Start Course
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>

                  {/* Progress Indicator */}
                  {course.progress > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-600/50">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <Activity className="h-4 w-4" />
                          <span className="font-semibold">Progress: {course.progress}%</span>
                        </div>
                        {course.lastScore && (
                          <span className="font-bold text-gray-900 dark:text-white">
                            Last Score: {course.lastScore}%
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Statistics */}
        <div className="mt-16 text-center">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center justify-center gap-3">
              <BarChart3 className="h-7 w-7 text-blue-600" />
              Live Firebase Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {courses.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Courses</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {courses.reduce((sum, course) => sum + course.questionCount, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {uniqueSpecialties.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Specialties</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  ✅
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Live Data</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesDashboard;