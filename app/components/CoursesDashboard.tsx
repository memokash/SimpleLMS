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
  completed?: boolean;
  lastScore?: number | null;
  progress?: number;
  instructor?: string;
  rating?: number;
  studentsEnrolled?: number;
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
  const [viewDensity, setViewDensity] = useState<'compact' | 'comfortable' | 'spacious'>('compact');
  const [isDark, setIsDark] = useState(false);

  // Theme management
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('courses-theme', newTheme ? 'dark' : 'light');
    }
  };

  // Load theme and density from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedTheme = localStorage.getItem('courses-theme');
      if (savedTheme === 'dark') {
        setIsDark(true);
      }
      const savedDensity = localStorage.getItem('coursesDensity') as 'compact' | 'comfortable' | 'spacious';
      if (savedDensity) {
        setViewDensity(savedDensity);
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
      
      // Use the existing courseService.ts to get courses
      const coursesData = await getAllCoursesWithProgress(user?.uid || null);
      
      setCourses(coursesData);
      setFilteredCourses(coursesData);

      if (user) {
        // Get user statistics
        const stats = await getUserStats(user.uid);
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
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Data loading failed:', error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Navigation failed:', error);
      }
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
        ? 'bg-gray-900' 
        : 'bg-white'
    }`}>
      <div className="w-full px-3 sm:px-4 lg:px-6 pr-3 sm:pr-4 lg:pr-8 py-4 lg:py-6">
        
        {/* Enhanced Header */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-xl backdrop-blur-sm"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Medical Course Library
                    </h1>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {filteredCourses.length} courses available
                    </p>
                  </div>
                </div>
                
                {/* User Stats - Compact */}
                {user && userStats && viewDensity !== 'compact' && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                      Avg: {userStats.averageScore}%
                    </span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                      Started: {userStats.coursesStarted}
                    </span>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                      {userStats.rank}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Density Toggle */}
                <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <button
                    onClick={() => { setViewDensity('compact'); localStorage.setItem('coursesDensity', 'compact'); }}
                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-l-lg transition-colors ${
                      viewDensity === 'compact' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Compact
                  </button>
                  <button
                    onClick={() => { setViewDensity('comfortable'); localStorage.setItem('coursesDensity', 'comfortable'); }}
                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                      viewDensity === 'comfortable' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => { setViewDensity('spacious'); localStorage.setItem('coursesDensity', 'spacious'); }}
                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-r-lg transition-colors ${
                      viewDensity === 'spacious' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Spacious
                  </button>
                </div>
                
                <button
                  onClick={toggleTheme}
                  className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200"
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <Sun className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-gray-700" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm backdrop-blur-sm"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm"
                >
                  <option value="">All Specialties</option>
                  {uniqueSpecialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
                
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm"
                >
                  <option value="">All Levels</option>
                  {uniqueDifficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm"
                >
                  <option value="title">A-Z</option>
                  <option value="rating">Top Rated</option>
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
          <div className={`grid ${
            viewDensity === 'compact' ? 'gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 
            viewDensity === 'comfortable' ? 'gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 
            'gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredCourses.map(course => (
              <div
                key={course.id}
                className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  viewDensity === 'spacious' ? 'hover:scale-[1.02]' : ''
                }`}
              >
                {/* Course content */}
                <div className={`relative ${
                  viewDensity === 'compact' ? 'p-3' : viewDensity === 'comfortable' ? 'p-4' : 'p-6'
                }`}>
                  <div className={`flex items-start justify-between ${
                    viewDensity === 'compact' ? 'mb-2' : 'mb-3'
                  }`}>
                    <div className="flex-1">
                      <h3 className={`font-bold text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 ${
                        viewDensity === 'compact' ? 'text-sm mb-1' : viewDensity === 'comfortable' ? 'text-base mb-2' : 'text-lg mb-2'
                      }`}>
                        {course.title || course.courseName}
                      </h3>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className={`bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold ${
                          viewDensity === 'compact' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs'
                        }`}>
                          {course.specialty || course.category}
                        </span>
                        {viewDensity !== 'compact' && (
                          <span className={`rounded-full font-semibold px-2.5 py-0.5 text-xs ${
                            course.difficulty === 'Beginner' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                            course.difficulty === 'Intermediate' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                            'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}>
                            {course.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                    {viewDensity !== 'compact' && (
                      <div className="text-right ml-2">
                        <div className="flex items-center text-yellow-400">
                          <Star className="h-3 w-3 mr-0.5 fill-current" />
                          <span className="font-bold text-gray-900 dark:text-white text-sm">{course.rating?.toFixed(1) || '4.5'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {viewDensity !== 'compact' && (
                    <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${
                      viewDensity === 'comfortable' ? 'text-sm mb-3 line-clamp-2' : 'text-sm mb-4 line-clamp-3'
                    }`}>
                      {course.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className={`flex justify-between text-xs text-gray-700 dark:text-gray-400 font-medium ${
                    viewDensity === 'compact' ? 'mb-2' : 'mb-3'
                  }`}>
                    <span className="flex items-center">
                      <Target className="h-3 w-3 mr-1" />
                      {course.questionCount} questions
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {course.estimatedTime}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleStartQuiz(course.id)}
                    className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center ${
                      viewDensity === 'compact' ? 'px-3 py-2 text-sm' : viewDensity === 'comfortable' ? 'px-4 py-2.5 text-sm' : 'px-5 py-3 text-base'
                    }`}
                  >
                    <Play className={viewDensity === 'compact' ? 'h-3 w-3 mr-1.5' : 'h-4 w-4 mr-2'} />
                    Start Course
                    {viewDensity !== 'compact' && (
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    )}
                  </button>

                  {/* Progress Indicator */}
                  {(course.progress || 0) > 0 && viewDensity !== 'compact' && (
                    <div className={`border-t border-gray-200/50 dark:border-gray-600/50 ${
                      viewDensity === 'comfortable' ? 'mt-3 pt-3' : 'mt-4 pt-4'
                    }`}>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <Activity className="h-3 w-3" />
                          <span className="font-medium">Progress: {course.progress || 0}%</span>
                        </div>
                        {course.lastScore && (
                          <span className="font-medium text-gray-900 dark:text-white">
                            Score: {course.lastScore}%
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress || 0}%` }}
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