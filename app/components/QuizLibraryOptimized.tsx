"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useRouter } from 'next/navigation';
import { 
  Search, Filter, TrendingUp, Clock, Users, Star, 
  ChevronRight, Grid3x3, List, Loader2, AlertCircle,
  BookOpen, Trophy, Target, Zap, X, ChevronDown,
  Sparkles, Brain, Heart, Stethoscope, Activity,
  FlaskConical, Microscope, Pill, Syringe, FileText,
  BarChart3, Hash, Calendar, Award, Bookmark,
  ArrowUpRight, ArrowDownRight, Minus, TrendingDown
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

// Category icons mapping
const categoryIcons: Record<string, any> = {
  'Cardiology': Heart,
  'Neurology': Brain,
  'Surgery': Stethoscope,
  'Pediatrics': Activity,
  'Chemistry': FlaskConical,
  'Biology': Microscope,
  'Pharmacology': Pill,
  'Anatomy': Syringe,
  'Pathology': FileText,
  'Default': BookOpen
};

// Quick filter presets
const quickFilters = [
  { id: 'all', label: 'All Quizzes', icon: Grid3x3, filter: {} },
  { id: 'free', label: 'Free', icon: Sparkles, filter: { requiredTier: 'free' } },
  { id: 'trending', label: 'Trending', icon: TrendingUp, filter: { sortBy: 'popularity' } },
  { id: 'new', label: 'Recently Added', icon: Calendar, filter: { sortBy: 'lastUpdated' } },
  { id: 'beginner', label: 'Beginner', icon: Award, filter: { difficulty: 'Beginner' } },
  { id: 'quick', label: 'Quick (≤10 questions)', icon: Zap, filter: { maxQuestions: 10 } },
];

export default function QuizLibraryOptimized() {
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'title' | 'questionCount' | 'lastUpdated'>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  
  // Derived data
  const [categories, setCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    avgRating: 0,
    popularCategory: ''
  });

  // Search suggestions
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate statistics from quiz data
  const calculateStats = useCallback((quizData: QuizIndexEntry[]) => {
    if (quizData.length === 0) return;

    const totalQuestions = quizData.reduce((sum, q) => sum + q.questionCount, 0);
    const avgRating = quizData.reduce((sum, q) => sum + q.rating, 0) / quizData.length;
    
    // Find most popular category
    const categoryCounts = quizData.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const popularCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    setStats({
      totalQuizzes: quizData.length,
      totalQuestions,
      avgRating,
      popularCategory
    });
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
      if (selectedTags.length > 0) filter.tags = selectedTags;
      
      // Fetch quiz index
      const quizData = await getQuizIndex(filter, sortBy, 200);
      setQuizzes(quizData);
      setFilteredQuizzes(quizData);
      
      // Extract metadata
      const uniqueCategories = Array.from(new Set(quizData.map(q => q.category))).sort();
      const uniqueTags = Array.from(new Set(quizData.flatMap(q => q.tags || []))).sort();
      
      setCategories(uniqueCategories);
      setAllTags(uniqueTags);
      calculateStats(quizData);
      
      // Generate search suggestions
      const suggestions = [
        ...uniqueCategories,
        ...uniqueTags,
        ...Array.from(new Set(quizData.map(q => q.title.split(' ')[0])))
      ].slice(0, 20);
      setSearchSuggestions(suggestions);
      
      // Load user stats if logged in
      if (user) {
        const stats = await getUserStats(user.uid);
        setUserStats(stats);
      }
      
    } catch (err) {
      console.error('Error loading quizzes:', err);
      setError('Failed to load quiz library. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    if (mounted) {
      loadQuizzes();
    }
  }, [mounted, user, selectedCategory, selectedDifficulty, selectedTier, sortBy, selectedTags]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        const filtered = quizzes.filter(quiz => 
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredQuizzes(filtered);
      } else {
        setFilteredQuizzes(quizzes);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, quizzes]);

  // Quick filter handler
  const applyQuickFilter = (filterId: string) => {
    setActiveQuickFilter(filterId);
    const preset = quickFilters.find(f => f.id === filterId);
    
    if (preset?.filter.requiredTier) {
      setSelectedTier(preset.filter.requiredTier as string);
    } else {
      setSelectedTier('');
    }
    
    if (preset?.filter.difficulty) {
      setSelectedDifficulty(preset.filter.difficulty as string);
    } else {
      setSelectedDifficulty('');
    }
    
    if (preset?.filter.sortBy) {
      setSortBy(preset.filter.sortBy as any);
    }
    
    if (preset?.filter.maxQuestions) {
      const filtered = quizzes.filter(q => q.questionCount <= 10);
      setFilteredQuizzes(filtered);
    }
  };

  const handleStartQuiz = (quizId: string) => {
    router.push(`/quiz?id=${quizId}`);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSelectedTier('');
    setSelectedTags([]);
    setSortBy('popularity');
    setActiveQuickFilter('all');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedDifficulty || selectedTier || selectedTags.length > 0;

  const getTierBadge = (tier: string) => {
    const styles = {
      premium: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      pro: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      free: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    };
    return styles[tier as keyof typeof styles] || styles.free;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'Beginner': 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      'Intermediate': 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
      'Advanced': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
    };
    return colors[difficulty as keyof typeof colors] || 'text-gray-600 dark:text-gray-400';
  };

  const getPopularityTrend = (popularity: number) => {
    if (popularity > 80) return { icon: TrendingUp, color: 'text-green-500', label: 'Hot' };
    if (popularity > 50) return { icon: ArrowUpRight, color: 'text-blue-500', label: 'Rising' };
    if (popularity > 20) return { icon: Minus, color: 'text-gray-500', label: 'Stable' };
    return { icon: TrendingDown, color: 'text-gray-400', label: 'New' };
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">Loading Quiz Library</p>
          <p className="text-gray-600 dark:text-gray-400">Optimizing your learning experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unable to Load Quizzes</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadQuizzes}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Quiz Library</h1>
              <p className="text-blue-100">
                Explore {stats.totalQuizzes} quizzes with {stats.totalQuestions.toLocaleString()} questions
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.avgRating.toFixed(1)}</p>
                <p className="text-sm text-blue-100">Avg Rating</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{categories.length}</p>
                <p className="text-sm text-blue-100">Categories</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.popularCategory}</p>
                <p className="text-sm text-blue-100">Top Category</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, category, tags, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm 
                       placeholder-blue-200 text-white border border-white/20
                       focus:outline-none focus:ring-2 focus:ring-white/30 text-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-5 w-5 text-blue-200 hover:text-white" />
              </button>
            )}
            
            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                <p className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                  Suggestions
                </p>
                {searchSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchTerm(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                             text-gray-700 dark:text-gray-300 text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Stats Bar */}
      {userStats && (
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completed:</span>
                  <span className="font-bold">{userStats.quizzesCompleted}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Score:</span>
                  <span className="font-bold">{userStats.averageScore}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rank:</span>
                  <span className="font-bold">{userStats.rank}</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${getTierBadge(userStats.tier || 'free')}`}>
                {userStats.tier?.toUpperCase() || 'FREE'} TIER
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {quickFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => applyQuickFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all
                  ${activeQuickFilter === filter.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{filter.label}</span>
              </button>
            );
          })}
        </div>

        {/* Advanced Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium"
            >
              <Filter className="h-5 w-5" />
              Advanced Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
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
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              {/* Tier Filter */}
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Access Levels</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="lastUpdated">Recently Updated</option>
                <option value="title">Alphabetical</option>
                <option value="questionCount">Question Count</option>
              </select>

              {/* View Mode */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-1.5 rounded ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-600 shadow-sm' 
                      : ''
                  }`}
                >
                  <Grid3x3 className="h-4 w-4 mx-auto" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-1.5 rounded ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-gray-600 shadow-sm' 
                      : ''
                  }`}
                >
                  <List className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>
          )}

          {/* Active Filters Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t dark:border-gray-700">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 
                               text-blue-700 dark:text-blue-300 rounded-full text-sm">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 
                               text-green-700 dark:text-green-300 rounded-full text-sm">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedDifficulty && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 
                               text-yellow-700 dark:text-yellow-300 rounded-full text-sm">
                  {selectedDifficulty}
                  <button onClick={() => setSelectedDifficulty('')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedTier && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 
                               text-purple-700 dark:text-purple-300 rounded-full text-sm">
                  {selectedTier} tier
                  <button onClick={() => setSelectedTier('')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Showing <span className="font-bold text-gray-900 dark:text-white">{filteredQuizzes.length}</span> of {quizzes.length} quizzes
          </p>
          {filteredQuizzes.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredQuizzes.reduce((sum, q) => sum + q.questionCount, 0).toLocaleString()} total questions
            </p>
          )}
        </div>

        {/* Quiz Grid/List */}
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'space-y-4'
        }>
          {filteredQuizzes.map((quiz) => {
            const CategoryIcon = categoryIcons[quiz.category] || categoryIcons.Default;
            const trend = getPopularityTrend(quiz.popularity);
            const TrendIcon = trend.icon;
            
            return (
              <div
                key={quiz.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl 
                         transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => handleStartQuiz(quiz.id)}
              >
                {/* Card Header */}
                <div className="p-4 border-b dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <CategoryIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{quiz.category}</p>
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 
                                     group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {quiz.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendIcon className={`h-4 w-4 ${trend.color}`} />
                      <span className={`text-xs ${trend.color}`}>{trend.label}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {quiz.description || 'Practice your knowledge with this comprehensive quiz.'}
                  </p>

                  {/* Tags */}
                  {quiz.tags && quiz.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {quiz.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 
                                   text-gray-600 dark:text-gray-400 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {quiz.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{quiz.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Quiz Metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                      <p className="font-bold text-gray-900 dark:text-white">{quiz.questionCount}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="font-bold text-gray-900 dark:text-white">{quiz.duration}m</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {quiz.rating > 0 ? quiz.rating.toFixed(1) : 'New'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getTierBadge(quiz.requiredTier)}`}>
                        {quiz.requiredTier.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {quiz.attempts}
                      </span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredQuizzes.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No quizzes found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or search for something else
            </p>
            <button
              onClick={clearAllFilters}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}