"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeContext';
import { 
  TrendingUp, Clock, Star, Users, ChevronRight, 
  Sparkles, Zap, Target, BookOpen, Award
} from 'lucide-react';
import { 
  getPopularQuizzes, 
  getRecentQuizzes, 
  getQuizzesByTier,
  QuizIndexEntry 
} from '@/lib/quizIndexService';

export default function QuizQuickAccess() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [popularQuizzes, setPopularQuizzes] = useState<QuizIndexEntry[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<QuizIndexEntry[]>([]);
  const [freeQuizzes, setFreeQuizzes] = useState<QuizIndexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'popular' | 'recent' | 'free'>('popular');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const [popular, recent, free] = await Promise.all([
        getPopularQuizzes(6),
        getRecentQuizzes(6),
        getQuizzesByTier('free')
      ]);
      
      setPopularQuizzes(popular);
      setRecentQuizzes(recent);
      setFreeQuizzes(free.slice(0, 6));
    } catch (error) {
      console.error('Error loading quick access quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizClick = (quizId: string) => {
    router.push(`/quiz?id=${quizId}`);
  };

  const getActiveQuizzes = () => {
    switch (activeTab) {
      case 'recent': return recentQuizzes;
      case 'free': return freeQuizzes;
      default: return popularQuizzes;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-500';
      case 'Intermediate': return 'text-yellow-500';
      case 'Advanced': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <h2 className="text-xl font-bold text-white">Quick Access</h2>
          </div>
          <button
            onClick={() => router.push('/courses')}
            className="text-white/80 hover:text-white text-sm flex items-center gap-1"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('popular')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'popular'
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <TrendingUp className="h-3 w-3 inline mr-1" />
            Popular
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'recent'
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="h-3 w-3 inline mr-1" />
            Recent
          </button>
          <button
            onClick={() => setActiveTab('free')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'free'
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="h-3 w-3 inline mr-1" />
            Free
          </button>
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {getActiveQuizzes().map((quiz) => (
            <button
              key={quiz.id}
              onClick={() => handleQuizClick(quiz.id)}
              className="group relative bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200
                       border border-gray-200 dark:border-gray-600 hover:border-blue-400
                       dark:hover:border-blue-400 text-left"
            >
              {/* Popularity Indicator */}
              {quiz.popularity > 80 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
                              px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Hot
                </div>
              )}

              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-sm text-gray-900 dark:text-white 
                             group-hover:text-blue-600 dark:group-hover:text-blue-400 
                             line-clamp-2 flex-1">
                  {quiz.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span className={getDifficultyColor(quiz.difficulty)}>
                  {quiz.difficulty}
                </span>
                <span>•</span>
                <span>{quiz.category}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {quiz.questionCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {quiz.duration}m
                  </span>
                  {quiz.rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {quiz.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 
                                       dark:group-hover:text-blue-400 
                                       group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        {/* View More Button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/courses')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white 
                     rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <BookOpen className="h-4 w-4" />
            Browse All Quizzes
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}