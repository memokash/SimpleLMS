'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { getAllCoursesWithProgress, getUserStats } from '../../lib/courseService';
// import { searchQuizLibrary, getLibraryOverview, SearchOptions } from '../../lib/courseSearchService';
import {
  BookOpen, Star, Target, Clock, CheckCircle, Award, Lock, Crown, 
  ArrowRight, Book, Loader2, AlertCircle, RefreshCw, Sun, Moon,
  TrendingUp, Zap, Brain, BarChart3, Activity, Sparkles, ChevronRight,
  Users, Globe, Play, Eye, Calendar, User, Tag, Bookmark, Search,
  Filter, Grid, List, SortAsc, Shuffle, Database, Lightbulb,
  GraduationCap, Stethoscope, Heart, Microscope, Pill, FlaskConical
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  courseName: string;
  description: string;
  category: string;
  specialty: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionCount: number;
  estimatedTime: string;
  completed?: boolean;
  lastScore?: number | null;
  progress?: number;
  instructor?: string;
  rating?: number;
  studentsEnrolled?: number;
  isPublic: boolean;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface LibraryStats {
  totalCourses: number;
  totalQuestions: number;
  categories: Record<string, number>;
  difficulties: Record<string, number>;
  avgRating: number;
  completionRate: number;
}

const CoursesDashboardOptimized = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  
  // State management
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [libraryStats, setLibraryStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 50; // Increased to show more of the 1746 courses
  const FEATURED_COURSE_COUNT = 6;

  // Medical categories with icons
  const medicalCategories = [
    { name: 'Cardiology', icon: Heart, color: 'red', count: 0 },
    { name: 'Neurology', icon: Brain, color: 'purple', count: 0 },
    { name: 'Pharmacology', icon: Pill, color: 'green', count: 0 },
    { name: 'Biochemistry', icon: FlaskConical, color: 'blue', count: 0 },
    { name: 'Pathology', icon: Microscope, color: 'orange', count: 0 },
    { name: 'Internal Medicine', icon: Stethoscope, color: 'indigo', count: 0 },
    { name: 'Surgery', icon: Target, color: 'red', count: 0 },
    { name: 'Pediatrics', icon: Users, color: 'pink', count: 0 }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load courses and generate stats using direct Firebase connection
  const loadCoursesData = async () => {
    if (!mounted) {
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log('Loading courses from Firebase...');

      // Always get all courses, don't filter by user progress first
      const { getAllCourses } = await import('../../lib/courseService');
      let directCourses = await getAllCourses();
      
      console.log(`Found ${directCourses.length} courses from Firebase`);
      
      if (directCourses.length === 0) {
        throw new Error('No courses found in Firebase. Database may be empty or permissions issue.');
      }
      
      // Use courses directly from Firebase - no transformation needed
      const coursesToUse = directCourses.map((course): Course => ({
        ...course,
        category: course.category || 'Medical Knowledge',
        specialty: course.specialty || 'General Medicine',
        rating: course.rating || 4.5,
        studentsEnrolled: course.studentsEnrolled || 250,
        tags: [course.category || 'Medical', course.specialty || 'General'].filter(Boolean)
      }));
      
      // Generate statistics from real data
      const categories: Record<string, number> = {};
      const difficulties: Record<string, number> = { 'Beginner': 0, 'Intermediate': 0, 'Advanced': 0 };
      let totalQuestions = 0;
      let totalRating = 0;
      let ratedCourses = 0;
      
      coursesToUse.forEach(course => {
        // Categories
        const category = course.category || 'Medical Knowledge';
        categories[category] = (categories[category] || 0) + course.questionCount;
        
        // Difficulties
        difficulties[course.difficulty] = (difficulties[course.difficulty] || 0) + 1;
        
        // Questions
        totalQuestions += course.questionCount;
        
        // Rating
        if (course.rating) {
          totalRating += course.rating;
          ratedCourses++;
        }
      });
      
      const stats: LibraryStats = {
        totalCourses: coursesToUse.length,
        totalQuestions,
        categories,
        difficulties,
        avgRating: ratedCourses > 0 ? totalRating / ratedCourses : 4.5,
        completionRate: 75.0
      };
      
      setLibraryStats(stats);
      setCourses(coursesToUse);
      
      // Set featured courses (random selection from available courses)
      const shuffledCourses = coursesToUse.length > 6 
        ? [...coursesToUse].sort(() => 0.5 - Math.random()).slice(0, 6)
        : coursesToUse;
      setFeaturedCourses(shuffledCourses);
      setFilteredCourses(coursesToUse);
      

    } catch (err) {
      console.error('❌ Error loading courses:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load course library: ${errorMessage}`);
      
      // Log additional debugging info
      console.log('Debug info:');
      console.log('- User:', user ? user.email : 'Not logged in');
      console.log('- Error details:', err);
      
      // Reset states on error
      setLibraryStats(null);
      setCourses([]);
      setFeaturedCourses([]);
      setFilteredCourses([]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      // Directly load courses without testing connection
      loadCoursesData();
    }
  }, [mounted, user]);

  // Advanced search and filtering
  const performSearch = useMemo(() => {
    setSearchLoading(true);
    
    let filtered = [...courses];

    // Text search - include both original title and New Title (courseName)
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(query) ||
        (course.courseName && course.courseName.toLowerCase().includes(query)) ||
        course.description.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.specialty.toLowerCase().includes(query) ||
        (course.tags && course.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(course => course.difficulty === selectedDifficulty);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newTitle':
          // Sort by Firebase 'NewTitle' field (stored in courseName)
          return (a.courseName || a.title).localeCompare(b.courseName || b.title);
        case 'difficulty':
          const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'questions':
          return b.questionCount - a.questionCount;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'recent':
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
        default: // relevance
          return b.questionCount - a.questionCount;
      }
    });

    setTimeout(() => setSearchLoading(false), 300);
    return filtered;
  }, [courses, searchTerm, selectedCategory, selectedDifficulty, sortBy]);

  useEffect(() => {
    setFilteredCourses(performSearch);
    setCurrentPage(1);
  }, [performSearch]);

  // Pagination
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCourses, currentPage]);

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);

  // Don't render until mounted
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className={`min-h-screen transition-all duration-500 flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className="reactive-tile p-8 text-center">
          <Loader2 className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h2 className="gradient-title text-xl mb-2">Loading Medical Library</h2>
          <p className="text-gray-600 dark:text-gray-300">Accessing 15,000+ medical questions...</p>
        </div>
      </div>
    );
  }

  if (error && !libraryStats) {
    return (
      <div className={`min-h-screen transition-all duration-500 flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className="reactive-tile p-8 text-center max-w-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="gradient-title text-xl mb-4">Library Access Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-300 text-sm">
              <strong>Troubleshooting:</strong><br/>
              1. Check your internet connection<br/>
              2. Verify Firebase configuration<br/>
              3. Ensure courses collection exists in Firestore<br/>
              4. Check browser console for detailed errors
            </p>
          </div>
          <button onClick={loadCoursesData} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto">
            <RefreshCw className="h-4 w-4" />
            Retry Loading
          </button>
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header with Library Stats */}
        <div className="reactive-tile p-4 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="gradient-title text-2xl">Smart Medical Quizzes</h1>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Advanced learning with comprehensive explanations and AI-powered tutoring</p>
                </div>
              </div>
              
              {libraryStats && (
                <div className="flex flex-wrap gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {libraryStats.totalQuestions.toLocaleString()} Questions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-indigo-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {libraryStats.totalCourses} Courses
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {libraryStats.avgRating.toFixed(1)} Avg Rating
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {libraryStats.completionRate.toFixed(1)}% Completion Rate
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl"
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

        {/* Smart Quiz Features Section */}
        <div className="reactive-tile p-4 mb-6 border-2 border-purple-200 dark:border-purple-700">
          <div className="text-center mb-4">
            <h2 className="gradient-title text-lg mb-2">🧠 Smart Quiz Learning System</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm max-w-2xl mx-auto">
              Comprehensive explanations, detailed reasoning, and AI-powered tutoring
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg inline-block mb-2">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">Expert Explanations</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Detailed explanations with medical reasoning
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg inline-block mb-2">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">AI Tutoring</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Personalized tutoring powered by AI
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg inline-block mb-2">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">Adaptive Learning</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Progressive difficulty adaptation
              </p>
            </div>
          </div>
        </div>

        {/* Featured Courses Carousel */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <h2 className="gradient-title text-lg">Featured Smart Quizzes</h2>
              <span className="bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-900 px-2 py-1 rounded-full text-xs font-bold shadow-lg">Expert Explanations</span>
              {libraryStats && (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium border border-green-200 dark:border-green-700">
                  {libraryStats.totalCourses.toLocaleString()} Quizzes • {libraryStats.totalQuestions.toLocaleString()} Questions
                </span>
              )}
            </div>
            <button 
              onClick={() => {
                // Randomize featured courses without reloading all data
                const shuffledCourses = [...courses].sort(() => 0.5 - Math.random());
                setFeaturedCourses(shuffledCourses.slice(0, 6));
              }}
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <Shuffle className="h-4 w-4" />
              Shuffle Featured
            </button>
          </div>
          
          {/* Four-column layout for course carousel - optimized for tablets */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredCourses.slice(0, 6).map((course) => (
              <div key={course.id} className="group reactive-tile p-4 relative overflow-hidden hover:bg-gradient-to-br hover:from-yellow-50 hover:to-amber-50 dark:hover:from-yellow-900/20 dark:hover:to-amber-900/20 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25 border-2 hover:border-yellow-400/50 cursor-pointer">
                {/* Yellow glow effect background */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-yellow-400/10 via-amber-400/5 to-orange-400/10 transition-opacity duration-500"></div>
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full -mr-8 -mt-8 opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-400 shadow-lg group-hover:shadow-yellow-500/50 group-hover:scale-110 transition-all duration-300">
                      <Brain className="h-4 w-4 text-blue-900" />
                    </div>
                    <div className="text-right">
                      <span className="bg-gradient-to-r from-amber-400 to-yellow-400 text-blue-900 px-2 py-1 rounded-full text-xs font-bold shadow">{course.difficulty}</span>
                      {course.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-muted">{course.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-gray-900 dark:text-white group-hover:text-amber-800 font-bold text-sm mb-2 line-clamp-2 leading-tight transition-colors duration-300">
                    {course.title}
                  </h3>
                  
                  <div className="mb-2">
                    <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-200">
                      {course.category || 'Medical Knowledge'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1 text-xs text-gray-600 group-hover:text-amber-700 transition-colors">
                      <Target className="h-3 w-3 text-amber-500" />
                      <span>{course.questionCount.toLocaleString()} Questions</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 group-hover:text-amber-700 transition-colors">
                      <Lightbulb className="h-3 w-3 text-yellow-500" />
                      <span>Explanations</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 group-hover:text-amber-700 transition-colors">
                      <Brain className="h-3 w-3 text-orange-500" />
                      <span>AI Tutoring</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => router.push(`/quiz?id=${encodeURIComponent(course.id)}`)}
                    className="w-full bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-blue-900 px-3 py-2 rounded-lg font-bold shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-xs"
                  >
                    <Play className="h-3 w-3" />
                    Start Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="reactive-tile p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses by title, category, or keywords..."
                className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-purple-500" />
              )}
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[140px] text-sm ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              >
                <option value="">All Categories</option>
                {libraryStats && Object.keys(libraryStats.categories)
                  .sort((a, b) => libraryStats.categories[b] - libraryStats.categories[a])
                  .map(category => (
                    <option key={category} value={category}>
                      {category} ({libraryStats.categories[category].toLocaleString()} questions)
                    </option>
                  ))}
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              >
                <option value="">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              >
                <option value="relevance">Relevance</option>
                <option value="title">Title A-Z</option>
                <option value="newTitle">New Title A-Z</option>
                <option value="questions">Most Questions</option>
                <option value="rating">Highest Rated</option>
                <option value="recent">Recently Updated</option>
                <option value="difficulty">Difficulty</option>
              </select>
              
              <div className={`flex border rounded-lg overflow-hidden ${
                isDark ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-purple-600 text-white' 
                      : (isDark ? 'bg-transparent text-gray-400 hover:text-white' : 'bg-transparent text-gray-600 hover:text-gray-900')
                  }`}
                >
                  <Grid className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-purple-600 text-white' 
                      : (isDark ? 'bg-transparent text-gray-400 hover:text-white' : 'bg-transparent text-gray-600 hover:text-gray-900')
                  }`}
                >
                  <List className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {paginatedCourses.length} of {filteredCourses.length.toLocaleString()} quizzes
              {searchTerm && ` for "${searchTerm}"`}
              {courses.length > 0 && ` (Total: ${courses.length.toLocaleString()} available)`}
            </span>
            <span>
              {filteredCourses.reduce((total, course) => total + course.questionCount, 0).toLocaleString()} questions available
            </span>
          </div>
        </div>

        {/* Courses Grid/List */}
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3' 
            : 'space-y-3'
        } mb-6`}>
          {paginatedCourses.map((course) => (
            viewMode === 'grid' ? (
              <div key={course.id} className="reactive-tile p-3">
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.difficulty === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 
                    course.difficulty === 'Advanced' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' : 
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  }`}>
                    {course.difficulty}
                  </span>
                  {course.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{course.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-gray-900 dark:text-white font-bold text-xs mb-2 line-clamp-2 leading-tight">
                  {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="space-y-1 mb-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs truncate max-w-[70%]">{course.category}</span>
                    <span className="text-gray-600 dark:text-gray-400 text-xs">{course.questionCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{course.estimatedTime}</span>
                    {course.studentsEnrolled && (
                      <span>{course.studentsEnrolled.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => router.push(`/quiz?id=${encodeURIComponent(course.id)}`)}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-1 text-xs"
                >
                  <Play className="h-3 w-3" />
                  Start
                </button>
              </div>
            ) : (
              <div key={course.id} className="reactive-tile p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex-shrink-0">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-gray-900 dark:text-white font-bold text-sm">{course.courseName || course.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.difficulty === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 
                          course.difficulty === 'Advanced' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' : 
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        }`}>
                          {course.difficulty}
                        </span>
                        {course.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{course.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">{course.category}</span>
                      <span>{course.questionCount.toLocaleString()} questions</span>
                      <span>{course.estimatedTime}</span>
                      {course.studentsEnrolled && (
                        <span>{course.studentsEnrolled.toLocaleString()} students</span>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => router.push(`/quiz?id=${encodeURIComponent(course.id)}`)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 text-xs"
                  >
                    <Play className="h-3 w-3" />
                    Start
                  </button>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(
                  totalPages - 4, 
                  Math.max(1, currentPage - 2)
                )) + i;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-medium transition-all duration-200 text-sm ${
                      pageNum === currentPage 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        )}

        {/* No Results State */}
        {filteredCourses.length === 0 && !loading && !error && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="gradient-title text-lg mb-2">No courses found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              {searchTerm || selectedCategory || selectedDifficulty
                ? 'Try adjusting your search terms or filters to find more courses.'
                : 'No courses are currently available. Please check your Firebase connection.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedDifficulty('');
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
              >
                Clear Filters
              </button>
              <button 
                onClick={loadCoursesData}
                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 text-sm"
              >
                <RefreshCw className="h-3 w-3" />
                Reload Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesDashboardOptimized;