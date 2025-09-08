"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useRouter } from 'next/navigation';
import { 
  Search, Filter, TrendingUp, Clock, Users, Star, 
  ChevronRight, Grid, List, Loader2, AlertCircle,
  BookOpen, Trophy, Target, Zap
} from 'lucide-react';
import { 
  getQuizIndex, 
  getPopularQuizzes, 
  getRecentQuizzes,
  searchQuizzes,
  QuizIndexEntry,
  QuizFilter
} from '@/lib/quizIndexService';
import { getUserStats } from '@/lib/courseService';

interface UserStats {
  coursesStarted: number;
  coursesCompleted: number;
  averageScore: number;
  quizzesCompleted: number;
  tier?: 'free' | 'pro' | 'premium';
  rank: string;
}

export default function CoursesDashboardIndexed() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  
  // State management
  const [mounted, setMounted] = useState(false);
  const [quizzes, setQuizzes] = useState<QuizIndexEntry[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizIndexEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'title' | 'questionCount'>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [viewDensity, setViewDensity] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  
  // Categories for filter dropdown
  const [categories, setCategories] = useState<string[]>([]);
  
  useEffect(() => {
    setMounted(true);
    const density = localStorage.getItem('coursesDensity') as any || 'comfortable';
    setViewDensity(density);
  }, []);

  // Load quiz index data
  const loadQuizzes = async () => {
    if (!mounted) return;
    
    try {
      setError(null);
      setLoading(true);
      
      // Build filter object
      const filter: QuizFilter = {};
      if (selectedCategory) filter.category = selectedCategory;
      if (selectedDifficulty) filter.difficulty = selectedDifficulty as any;
      if (selectedTier) filter.requiredTier = selectedTier as any;
      if (searchTerm) filter.searchTerm = searchTerm;
      
      // Fetch quiz index (lightweight)
      const quizData = await getQuizIndex(filter, sortBy, 100);
      setQuizzes(quizData);
      setFilteredQuizzes(quizData);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(quizData.map(q => q.category)));
      setCategories(uniqueCategories);
      
      // Load user stats if logged in
      if (user) {
        const stats = await getUserStats(user.uid);
        setUserStats(stats);
      }
      
    } catch (err) {
      console.error('Error loading quizzes:', err);
      setError('Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    if (mounted) {
      loadQuizzes();
    }
  }, [mounted, user, selectedCategory, selectedDifficulty, selectedTier, sortBy]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchQuizzes(searchTerm).then(results => {
          setFilteredQuizzes(results);
        });
      } else {
        setFilteredQuizzes(quizzes);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, quizzes]);

  const handleStartQuiz = (quizId: string) => {
    try {
      router.push(`/quiz?id=${quizId}`);
    } catch (error) {
      console.error('Navigation failed:', error);
      alert('Failed to start quiz. Please try again.');
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'pro': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 dark:text-green-400';
      case 'Intermediate': return 'text-yellow-600 dark:text-yellow-400';
      case 'Advanced': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          <span className="text-xl font-semibold">Loading quiz index...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">Error Loading Quizzes</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadQuizzes}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Quiz Library</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredQuizzes.length} quizzes available
          </p>
        </div>

        {/* Stats Bar */}
        {userStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
              </div>
              <p className="text-2xl font-bold">{userStats.quizzesCompleted}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Score</span>
              </div>
              <p className="text-2xl font-bold">{userStats.averageScore}%</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Rank</span>
              </div>
              <p className="text-2xl font-bold">{userStats.rank}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Tier</span>
              </div>
              <p className="text-2xl font-bold capitalize">{userStats.tier || 'Free'}</p>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            {/* Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Tiers</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Alphabetical</option>
              <option value="questionCount">Question Count</option>
            </select>

            {/* View Toggle */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600' : ''}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600' : ''}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quiz Grid/List */}
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'space-y-4'
        }>
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleStartQuiz(quiz.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold line-clamp-2">{quiz.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${getTierColor(quiz.requiredTier)} text-white`}>
                  {quiz.requiredTier.toUpperCase()}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {quiz.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {quiz.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                  {quiz.questionCount} questions
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {quiz.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {quiz.rating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {quiz.attempts}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">No quizzes found</p>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search term
            </p>
          </div>
        )}
      </div>
    </div>
  );
}