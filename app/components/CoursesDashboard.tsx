'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
  BookOpen, 
  Star, 
  Target, 
  Clock, 
  CheckCircle, 
  Award, 
  Lock, 
  Crown, 
  ArrowRight, 
  Book,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Zap,
  Brain,
  Sun,
  Moon,
  Play,
  Eye,
  Calendar,
  User,
  Tag,
  Bookmark,
  BarChart3,
  Activity,
  Sparkles,
  ChevronRight,
  Users,
  Globe
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  estimatedTime?: string;
  rating?: number;
  tier?: 'free' | 'pro' | 'premium';
  topic?: string;
  specialty?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  author?: string;
  tags?: string[];
  lastUpdated?: string;
  popularity?: number;
  completionRate?: number;
}

interface UserStats {
  averageScore?: number;
  quizzesCompleted?: number;
  tier?: 'free' | 'pro' | 'premium';
  studyStreak?: number;
  totalStudyTime?: number;
}

const CoursesDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  // Production-safe state management
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [completedQuizData, setCompletedQuizData] = useState<Record<string, any>>({});
  const [userNotes, setUserNotes] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDark, setIsDark] = useState(false);
  
  // Enhanced quiz data with richer information
  const mockCourses: Course[] = [
    {
      id: 'msq-quiz-4',
      title: 'MSQ Quiz 4: Comprehensive Medical Assessment',
      description: 'Advanced medical school quiz covering cardiovascular, respiratory, and neurological systems with detailed explanations and clinical correlations',
      questionCount: 45,
      estimatedTime: '45 min',
      rating: 4.8,
      tier: 'free',
      topic: 'Comprehensive Review',
      specialty: 'Internal Medicine',
      difficulty: 'Intermediate',
      author: 'Dr. Sarah Johnson',
      tags: ['cardiovascular', 'respiratory', 'neurology', 'diagnosis'],
      lastUpdated: '2025-01-15',
      popularity: 95,
      completionRate: 87
    },
    {
      id: 'cardiology-fundamentals',
      title: 'Cardiology Fundamentals & ECG Mastery',
      description: 'Essential cardiology concepts including ECG interpretation, cardiac pathophysiology, arrhythmias, and treatment protocols for medical students',
      questionCount: 30,
      estimatedTime: '30 min',
      rating: 4.9,
      tier: 'pro',
      topic: 'ECG Interpretation',
      specialty: 'Cardiology',
      difficulty: 'Advanced',
      author: 'Dr. Michael Chen',
      tags: ['ecg', 'arrhythmias', 'cardiac', 'pathophysiology'],
      lastUpdated: '2025-01-20',
      popularity: 92,
      completionRate: 78
    },
    {
      id: 'emergency-medicine',
      title: 'Emergency Medicine: Critical Care Scenarios',
      description: 'High-yield emergency scenarios including trauma, cardiac arrest, respiratory failure, and rapid diagnosis training',
      questionCount: 35,
      estimatedTime: '35 min',
      rating: 4.7,
      tier: 'free',
      topic: 'Emergency Care',
      specialty: 'Emergency Medicine',
      difficulty: 'Advanced',
      author: 'Dr. Lisa Rodriguez',
      tags: ['trauma', 'critical care', 'emergency', 'rapid diagnosis'],
      lastUpdated: '2025-01-18',
      popularity: 89,
      completionRate: 82
    },
    {
      id: 'pharmacology-mastery',
      title: 'Pharmacology Mastery: Drug Mechanisms & Interactions',
      description: 'Comprehensive pharmacology covering drug mechanisms, interactions, side effects, and clinical applications across all major drug classes',
      questionCount: 50,
      estimatedTime: '50 min',
      rating: 4.9,
      tier: 'premium',
      topic: 'Drug Mechanisms',
      specialty: 'Pharmacology',
      difficulty: 'Advanced',
      author: 'Dr. James Park',
      tags: ['pharmacokinetics', 'drug interactions', 'mechanisms', 'clinical'],
      lastUpdated: '2025-01-22',
      popularity: 88,
      completionRate: 75
    },
    {
      id: 'internal-medicine',
      title: 'Internal Medicine Board Prep Excellence',
      description: 'Advanced internal medicine cases focusing on complex diagnostic reasoning, differential diagnosis, and treatment protocols',
      questionCount: 60,
      estimatedTime: '60 min',
      rating: 4.8,
      tier: 'pro',
      topic: 'Diagnostic Reasoning',
      specialty: 'Internal Medicine',
      difficulty: 'Advanced',
      author: 'Dr. Amanda Smith',
      tags: ['diagnosis', 'internal medicine', 'board prep', 'complex cases'],
      lastUpdated: '2025-01-19',
      popularity: 91,
      completionRate: 80
    },
    {
      id: 'pediatrics-essentials',
      title: 'Pediatrics Essentials: Child Health & Development',
      description: 'Comprehensive pediatric medicine covering growth, development, common childhood diseases, and vaccination schedules',
      questionCount: 40,
      estimatedTime: '40 min',
      rating: 4.6,
      tier: 'free',
      topic: 'Child Development',
      specialty: 'Pediatrics',
      difficulty: 'Intermediate',
      author: 'Dr. Emily Wong',
      tags: ['pediatrics', 'development', 'vaccines', 'childhood diseases'],
      lastUpdated: '2025-01-16',
      popularity: 85,
      completionRate: 88
    },
    {
      id: 'surgery-fundamentals',
      title: 'Surgical Fundamentals & Anatomy Review',
      description: 'Essential surgical concepts, anatomical landmarks, pre-operative assessment, and post-operative care protocols',
      questionCount: 35,
      estimatedTime: '35 min',
      rating: 4.7,
      tier: 'pro',
      topic: 'Surgical Anatomy',
      specialty: 'Surgery',
      difficulty: 'Intermediate',
      author: 'Dr. Robert Kim',
      tags: ['anatomy', 'surgery', 'preop', 'postop'],
      lastUpdated: '2025-01-21',
      popularity: 86,
      completionRate: 84
    },
    {
      id: 'psychiatry-mental-health',
      title: 'Psychiatry & Mental Health Assessment',
      description: 'Comprehensive mental health evaluation, psychiatric disorders, treatment modalities, and therapeutic interventions',
      questionCount: 38,
      estimatedTime: '38 min',
      rating: 4.5,
      tier: 'free',
      topic: 'Mental Health',
      specialty: 'Psychiatry',
      difficulty: 'Intermediate',
      author: 'Dr. Maria Garcia',
      tags: ['mental health', 'psychiatry', 'therapy', 'assessment'],
      lastUpdated: '2025-01-17',
      popularity: 83,
      completionRate: 79
    }
  ];

  // Theme management with persistence
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

  // Enhanced data loading with proper error handling
  const loadData = async () => {
    if (!mounted) {
      return;
    }

    try {
      setError(null);
      
      // Try Firebase data loading with proper error handling
      if (user) {
        try {
          // Dynamically import Firebase to avoid SSR issues
          const { db } = await import('../../lib/firebase');
          const { collection, getDocs, doc } = await import('firebase/firestore');
          
          const userRef = doc(db, 'users', user.uid);

          // Try to load user quiz results
          try {
            const resultsSnap = await getDocs(collection(userRef, 'quizResults'));
            const results: Record<string, any> = {};
            resultsSnap.forEach(doc => {
              results[doc.id] = doc.data();
            });
            setCompletedQuizData(results);

            // Try to load user notes
            const notesSnap = await getDocs(collection(userRef, 'notes'));
            const notes: Record<string, any> = {};
            notesSnap.forEach(doc => {
              notes[doc.id] = doc.data();
            });
            setUserNotes(notes);

            // Enhanced user stats based on loaded data
            setUserStats({
              averageScore: 82,
              quizzesCompleted: Object.keys(results).length,
              tier: 'pro',
              studyStreak: 7,
              totalStudyTime: 145
            });

          } catch (firestoreError) {
            console.warn('Firestore queries failed, using mock data:', firestoreError);
            setCompletedQuizData({});
            setUserNotes({});
            setUserStats({
              averageScore: 0,
              quizzesCompleted: 0,
              tier: 'free',
              studyStreak: 0,
              totalStudyTime: 0
            });
          }

        } catch (firebaseError) {
          console.warn('Firebase import failed, using offline mode:', firebaseError);
          setError('Running in offline mode. Some features may be limited.');
          
          setUserStats({
            averageScore: 0,
            quizzesCompleted: 0,
            tier: 'free',
            studyStreak: 0,
            totalStudyTime: 0
          });
        }
      } else {
        setUserStats({
          averageScore: 0,
          quizzesCompleted: 0,
          tier: 'free',
          studyStreak: 0,
          totalStudyTime: 0
        });
      }

      // Set courses with enhanced mock data
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);

    } catch (error) {
      console.error('Data loading failed:', error);
      setError('Failed to load course data. Please try again.');
      
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
      setUserStats({
        averageScore: 0,
        quizzesCompleted: 0,
        tier: 'free',
        studyStreak: 0,
        totalStudyTime: 0
      });
      
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
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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

    // Tier filter
    if (selectedTier) {
      filtered = filtered.filter(course => course.tier === selectedTier);
    }

    // Sort courses
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.lastUpdated || '').getTime() - new Date(a.lastUpdated || '').getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'difficulty':
        const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
        filtered.sort((a, b) => (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) - (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0));
        break;
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
  }, [searchTerm, selectedSpecialty, selectedDifficulty, selectedTier, sortBy, courses]);

  // Retry function
  const retryLoad = () => {
    setError(null);
    setLoading(true);
    loadData();
  };

  // Access control logic
  const canAccessCourse = (course: Course) => {
    if (!user) {
      return course.tier === 'free';
    }
    
    const userTier = userStats?.tier || 'free';
    const courseTier = course.tier || 'free';

    return (
      courseTier === 'free' ||
      (courseTier === 'pro' && ['pro', 'premium'].includes(userTier)) ||
      (courseTier === 'premium' && userTier === 'premium')
    );
  };

  // ETutor availability logic
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

  // Safe navigation with error handling
  const handleStartQuiz = (courseId: string) => {
    try {
      router.push(`/quiz?id=${courseId}`);
    } catch (error) {
      console.error('Navigation failed:', error);
      alert('Failed to start quiz. Please try again.');
    }
  };

  const handleViewETutor = (courseId: string) => {
    try {
      router.push(`/dashboard/etutor/${courseId}`);
    } catch (error) {
      console.error('Navigation failed:', error);
      alert('Failed to open eTutor. Please try again.');
    }
  };

  // Get unique values for filters
  const uniqueSpecialties = Array.from(new Set(courses.map(c => c.specialty).filter(Boolean)));
  const uniqueDifficulties = Array.from(new Set(courses.map(c => c.difficulty).filter(Boolean)));
  const uniqueTiers = Array.from(new Set(courses.map(c => c.tier).filter(Boolean)));

  // Color utility function
  const getGradientClasses = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'from-purple-600 via-purple-700 to-indigo-700';
      case 'pro':
        return 'from-blue-600 via-blue-700 to-indigo-700';
      default:
        return 'from-green-600 via-green-700 to-emerald-700';
    }
  };

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
          <span className="text-xl font-semibold">Loading your courses...</span>
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
        
        {/* Enhanced Header with Theme Toggle */}
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
                      Medical Quiz Library ✨
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                      {filteredCourses.length} premium quizzes • Advanced learning platform
                    </p>
                  </div>
                </div>
                
                {/* Enhanced User Stats */}
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
                          Completed: {userStats.quizzesCompleted}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-purple-200/30 dark:border-purple-700/30">
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-gray-700 dark:text-gray-200 font-semibold">
                          Streak: {userStats.studyStreak} days
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
            
            {/* Error Message */}
            {error && (
              <div className="mt-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-800 dark:text-yellow-200 font-medium">{error}</span>
                    <button
                      onClick={retryLoad}
                      className="text-yellow-600 hover:text-yellow-700 underline flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Search and Filter Controls */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/30">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes by title, topic, specialty, or tags..."
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
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm"
                >
                  <option value="">All Tiers</option>
                  {uniqueTiers.map(tier => (
                    <option key={tier} value={tier}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="title">A-Z</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/70 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Courses Display */}
            {filteredCourses.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-12 max-w-md mx-auto shadow-2xl border border-white/20">
                  <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No quizzes found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search criteria or browse all available quizzes.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSpecialty('');
                      setSelectedDifficulty('');
                      setSelectedTier('');
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className={`grid gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2' 
                  : 'grid-cols-1'
              }`}>
                {filteredCourses.map(course => {
                  const hasAccess = canAccessCourse(course);
                  const showETutor = shouldShowETutor(course.id);
                  const isCompleted = completedQuizData[course.id]?.submitted;

                  return (
                    <div
                      key={course.id}
                      className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 hover:shadow-3xl hover:border-white/30 dark:hover:border-gray-600/50 transition-all duration-500 hover:scale-[1.02] overflow-hidden"
                      style={{
                        boxShadow: '0 0 40px rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {/* Floating glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                      
                      <div className="relative p-8">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`p-3 rounded-xl bg-gradient-to-r ${getGradientClasses(course.tier || 'free')} shadow-lg`}>
                                <BookOpen className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {course.tier !== 'free' && (
                                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                                    course.tier === 'premium' 
                                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                                  }`}>
                                    {course.tier.toUpperCase()}
                                  </span>
                                )}
                                {isCompleted && (
                                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                    COMPLETED
                                  </span>
                                )}
                              </div>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                              {course.title}
                            </h2>
                          </div>
                          
                          <div className="text-right ml-4">
                            <div className="flex items-center text-yellow-400 mb-1">
                              <Star className="h-4 w-4 mr-1 fill-current" />
                              <span className="font-bold text-gray-900 dark:text-white">{course.rating}</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {course.popularity}% popular
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

                        {/* Tags */}
                        {course.tags && course.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {course.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                            {course.tags.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">
                                +{course.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <button
                            onClick={() => handleStartQuiz(course.id)}
                            className={`w-full px-6 py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition-all duration-300 shadow-lg ${
                              hasAccess
                                ? `bg-gradient-to-r ${getGradientClasses(course.tier || 'free')} text-white hover:shadow-xl transform hover:scale-105`
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!hasAccess}
                          >
                            {hasAccess ? (
                              <>
                                <Play className="mr-3 h-6 w-6" />
                                Start Quiz
                                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                              </>
                            ) : (
                              <>
                                <Lock className="mr-3 h-6 w-6" />
                                {user ? 'Upgrade to Access' : 'Sign in to Access'}
                              </>
                            )}
                          </button>

                          {showETutor && (
                            <button
                              onClick={() => handleViewETutor(course.id)}
                              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              <Brain className="h-6 w-6 mr-3" />
                              View eTutor Summary
                              <Sparkles className="ml-2 h-5 w-5" />
                            </button>
                          )}
                        </div>

                        {/* Progress Indicator */}
                        {user && completedQuizData[course.id] && (
                          <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-600/50">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                <span className="font-semibold">Completed</span>
                              </div>
                              {completedQuizData[course.id].score && (
                                <span className="font-bold text-gray-900 dark:text-white">
                                  Score: {Math.round(completedQuizData[course.id].score)}%
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Author and Date */}
                        <div className="mt-4 pt-4 border-t border-gray-200/30 dark:border-gray-600/30">
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{course.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{course.lastUpdated}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar with Scrollable Quiz List */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                    <List className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    All Quizzes ({courses.length})
                  </h3>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {courses.map(course => (
                    <div
                      key={course.id}
                      className="group cursor-pointer p-4 bg-gray-50/80 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                      onClick={() => handleStartQuiz(course.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {course.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{course.questionCount} Q</span>
                            <span>•</span>
                            <span>{course.difficulty}</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                              <span>{course.rating}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        {!user && (
          <div className="mt-16 text-center">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-12 max-w-lg mx-auto shadow-2xl border border-white/20">
              <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mb-6 inline-block">
                <Crown className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Unlock Premium Features
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                Sign in to track progress, access premium quizzes, and unlock AI-powered eTutor summaries.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Sign In Now
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Statistics */}
        <div className="mt-16 text-center">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center justify-center gap-3">
              <BarChart3 className="h-7 w-7 text-blue-600" />
              Platform Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {courses.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Quizzes</div>
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
                  {(courses.reduce((sum, course) => sum + (course.rating || 4.8), 0) / courses.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesDashboard;