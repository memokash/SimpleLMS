'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserStats, UserStats as CourseServiceUserStats } from '../../lib/courseService';
import {
  BookOpenCheck,
  FileText,
  GraduationCap,
  Sparkles,
  Lightbulb,
  Stethoscope,
  BrainCircuit,
  BookOpen,
  Gauge,
  UserCog,
  Loader2,
  Sun,
  Moon,
  TrendingUp,
  Award,
  Target,
  Zap,
  Calendar,
  Activity,
  Brain,
  BarChart3,
  MessageSquare,
  Users,
  Library,
  UserCheck,
  MapPin,
  Clipboard,
  AlertCircle,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

interface UserStats {
  totalCourses: number;
  completed: number;
  inProgress: number;
  avgScore: number;
}

export default function UserDashboard() {
  const { user } = useAuth();
  
  // Production-safe state management
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalCourses: 12,
    completed: 8,
    inProgress: 4,
    avgScore: 87.5
  });

  // View density state
  const [viewDensity, setViewDensity] = useState<'compact' | 'comfortable' | 'spacious'>('compact');

  // Safe theme state with fallback
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => {
    try {
      setIsDark(!isDark);
      // Save to localStorage if available
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
      }
    } catch (error) {
      console.warn('Theme toggle failed:', error);
    }
  };

  // Load initial theme and density from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
          setIsDark(true);
        }
        const savedDensity = localStorage.getItem('viewDensity') as 'compact' | 'comfortable' | 'spacious';
        if (savedDensity) {
          setViewDensity(savedDensity);
        }
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
  }, []);

  // Safe hook alternatives with error handling
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setMounted(true);
        setError(null);

        // Load real user stats from Firebase
        try {
          if (user?.uid) {
            const realStats = await getUserStats(user.uid);
            if (realStats) {
              setStats({
                totalCourses: (realStats.coursesStarted + realStats.coursesCompleted) || 0,
                completed: realStats.coursesCompleted || 0,
                inProgress: realStats.coursesStarted || 0,
                avgScore: realStats.averageScore || 0
              });
            }
          }
        } catch (statsError) {
          console.warn('Failed to load user stats, using defaults:', statsError);
          // Use default empty stats instead of random mock data
          setStats({
            totalCourses: 0,
            completed: 0,
            inProgress: 0,
            avgScore: 0
          });
        }

      } catch (error) {
        console.error('Dashboard initialization failed:', error);
        setError('Failed to load dashboard data. Using offline mode.');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [user]);

  // Error retry function
  const retryLoad = () => {
    setError(null);
    setLoading(true);
    // Re-run initialization
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Don't render until mounted (prevents SSR issues)
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="flex items-center text-gray-600 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <Loader2 className="animate-spin h-6 w-6 mr-3" />
          <span className="text-lg font-medium">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  // Error boundary component
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard Error
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
              <Link
                href="/courses-dashboard"
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
              >
                Go to Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      href: '/courses-dashboard',
      icon: GraduationCap,
      title: 'Continue Learning',
      description: 'Pick up where you left off with your medical studies',
      color: 'indigo',
      stats: 'active courses',
      badge: 'Continue'
    },
    {
      href: '/question-bank',
      icon: Lightbulb,
      title: 'Generate Questions',
      description: 'Create custom practice questions using AI',
      color: 'yellow',
      stats: 'AI powered',
      badge: 'Create'
    },
    {
      href: '/enhanced-quiz-display',
      icon: BrainCircuit,
      title: 'Take Quiz',
      description: 'Start an interactive quiz session',
      color: 'purple',
      stats: '156 questions ready',
      badge: 'Study'
    }
  ];

  const studyTools = [
    {
      href: '/dashboard/etutor',
      icon: Sparkles,
      title: 'AI Tutor',
      description: 'Personalized explanations and comprehensive study guides tailored to your learning',
      stats: 'tutoring available',
      isNew: true,
      color: 'pink',
      badge: 'Continue'
    },
    {
      href: '/rounding-tools',
      icon: Stethoscope,
      title: 'Rounding Tools',
      description: 'Clinical tools for H&P, progress notes, and procedures',
      stats: '8 cases available',
      color: 'red',
      badge: 'Continue'
    },
    {
      href: '/reading-resources',
      icon: FileText,
      title: 'Reading Resources',
      description: 'Save and annotate medical articles and studies',
      stats: 'Save articles here',
      color: 'green',
      badge: 'Continue'
    },
    {
      href: '/enhanced-quiz-display',
      icon: BookOpen,
      title: 'Enhanced Quiz',
      description: 'Interactive quiz system with detailed explanations',
      stats: '> 15000 questions available',
      color: 'blue',
      badge: 'Continue'
    }
  ];

  const communityTools = [
    {
      href: '/question-bank',
      icon: BookOpen,
      title: 'Community Question Bank',
      description: 'Collaborative repository of medical education questions generated with well trained medcicine models and shared by peers',
      stats: 'Community generated questions available',
      color: 'green',
      badge: 'Community'
    },
    {
      href: '/study-groups',
      icon: Users,
      title: 'Study Groups',
      description: 'Join or create study groups with fellow medical students and residents',
      stats: 'active groups',
      color: 'purple',
      badge: 'Collaborate'
    },
    {
      href: '/messages',
      icon: MessageSquare,
      title: 'Messages & Chat',
      description: 'Internal messaging system for peer communication and collaboration',
      stats: '3 new messages',
      color: 'indigo',
      badge: 'Chat',
      isNew: true
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      indigo: 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30',
      yellow: 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30',
      purple: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30',
      green: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30',
      blue: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
      red: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30',
      pink: 'text-pink-700 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30'
    };
    return colorMap[color] || 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/30';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="w-full px-3 sm:px-4 lg:px-6 pr-3 sm:pr-4 lg:pr-8 py-4 lg:py-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Medical Student'}! 👋
            </h1>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Ready to continue your medical education journey?
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Density Toggle */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <button
                onClick={() => { setViewDensity('compact'); localStorage.setItem('viewDensity', 'compact'); }}
                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-l-lg transition-colors ${
                  viewDensity === 'compact' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Compact
              </button>
              <button
                onClick={() => { setViewDensity('comfortable'); localStorage.setItem('viewDensity', 'comfortable'); }}
                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  viewDensity === 'comfortable' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => { setViewDensity('spacious'); localStorage.setItem('viewDensity', 'spacious'); }}
                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-r-lg transition-colors ${
                  viewDensity === 'spacious' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Spacious
              </button>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200"
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

        {/* Stats Overview */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 ${
          viewDensity === 'compact' ? 'gap-2 sm:gap-3 mb-4' : 
          viewDensity === 'comfortable' ? 'gap-4 mb-6' : 
          'gap-6 mb-8'
        }`}>
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${
            viewDensity === 'compact' ? 'p-3' : viewDensity === 'comfortable' ? 'p-4' : 'p-6'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`rounded-lg ${getColorClasses('blue')} ${
                viewDensity === 'compact' ? 'p-1.5' : viewDensity === 'comfortable' ? 'p-2' : 'p-3'
              }`}>
                <BookOpen className={viewDensity === 'compact' ? 'h-4 w-4' : viewDensity === 'comfortable' ? 'h-5 w-5' : 'h-6 w-6'} />
              </div>
              {viewDensity !== 'compact' && <TrendingUp className="h-4 w-4 text-green-500" />}
            </div>
            <h3 className={`font-bold text-gray-900 dark:text-white ${
              viewDensity === 'compact' ? 'text-xl mb-1' : viewDensity === 'comfortable' ? 'text-2xl mb-1' : 'text-3xl mb-2'
            }`}>{stats.totalCourses}</h3>
            <p className={`text-gray-700 dark:text-gray-300 font-medium ${
              viewDensity === 'compact' ? 'text-sm' : 'text-base'
            }`}>Total Courses</p>
          </div>

          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${
            viewDensity === 'compact' ? 'p-3' : viewDensity === 'comfortable' ? 'p-4' : 'p-6'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`rounded-lg ${getColorClasses('green')} ${
                viewDensity === 'compact' ? 'p-1.5' : viewDensity === 'comfortable' ? 'p-2' : 'p-3'
              }`}>
                <Award className={viewDensity === 'compact' ? 'h-4 w-4' : viewDensity === 'comfortable' ? 'h-5 w-5' : 'h-6 w-6'} />
              </div>
              {viewDensity !== 'compact' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">+5</span>}
            </div>
            <h3 className={`font-bold text-gray-900 dark:text-white ${
              viewDensity === 'compact' ? 'text-xl mb-1' : viewDensity === 'comfortable' ? 'text-2xl mb-1' : 'text-3xl mb-2'
            }`}>{stats.completed}</h3>
            <p className={`text-gray-700 dark:text-gray-300 font-medium ${
              viewDensity === 'compact' ? 'text-sm' : 'text-base'
            }`}>Completed</p>
          </div>

          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${
            viewDensity === 'compact' ? 'p-3' : viewDensity === 'comfortable' ? 'p-4' : 'p-6'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`rounded-lg ${getColorClasses('purple')} ${
                viewDensity === 'compact' ? 'p-1.5' : viewDensity === 'comfortable' ? 'p-2' : 'p-3'
              }`}>
                <Target className={viewDensity === 'compact' ? 'h-4 w-4' : viewDensity === 'comfortable' ? 'h-5 w-5' : 'h-6 w-6'} />
              </div>
              {viewDensity !== 'compact' && <Activity className="h-4 w-4 text-blue-500" />}
            </div>
            <h3 className={`font-bold text-gray-900 dark:text-white ${
              viewDensity === 'compact' ? 'text-xl mb-1' : viewDensity === 'comfortable' ? 'text-2xl mb-1' : 'text-3xl mb-2'
            }`}>{stats.inProgress}</h3>
            <p className={`text-gray-700 dark:text-gray-300 font-medium ${
              viewDensity === 'compact' ? 'text-sm' : 'text-base'
            }`}>In Progress</p>
          </div>

          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${
            viewDensity === 'compact' ? 'p-3' : viewDensity === 'comfortable' ? 'p-4' : 'p-6'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`rounded-lg ${getColorClasses('yellow')} ${
                viewDensity === 'compact' ? 'p-1.5' : viewDensity === 'comfortable' ? 'p-2' : 'p-3'
              }`}>
                <Gauge className={viewDensity === 'compact' ? 'h-4 w-4' : viewDensity === 'comfortable' ? 'h-5 w-5' : 'h-6 w-6'} />
              </div>
              {viewDensity !== 'compact' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">↗ 8%</span>}
            </div>
            <h3 className={`font-bold text-gray-900 dark:text-white ${
              viewDensity === 'compact' ? 'text-xl mb-1' : viewDensity === 'comfortable' ? 'text-2xl mb-1' : 'text-3xl mb-2'
            }`}>{Math.round(stats.avgScore)}%</h3>
            <p className={`text-gray-700 dark:text-gray-300 font-medium ${
              viewDensity === 'compact' ? 'text-sm' : 'text-base'
            }`}>Avg Score</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 ${
          viewDensity === 'compact' ? 'gap-4' : viewDensity === 'comfortable' ? 'gap-6' : 'gap-8'
        }`}>
          
          {/* Left Column */}
          <div className={viewDensity === 'compact' ? 'space-y-4' : viewDensity === 'comfortable' ? 'space-y-6' : 'space-y-8'}>
            {/* Quick Actions */}
            <div>
              <h2 className={`gradient-title-primary flex items-center gap-2 ${
                viewDensity === 'compact' ? 'text-lg mb-3' : viewDensity === 'comfortable' ? 'text-xl mb-4' : 'text-2xl mb-6'
              }`}>
                <Zap className={viewDensity === 'compact' ? 'h-4 w-4' : 'h-5 w-5'} />
                Quick Actions
              </h2>
              <div className={`grid grid-cols-1 ${
                viewDensity === 'compact' ? 'gap-2' : viewDensity === 'comfortable' ? 'gap-3' : 'gap-4'
              }`}>
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <Link key={action.href} href={action.href}>
                      <div className={`group bg-white dark:bg-gray-800 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 ${
                        viewDensity === 'compact' ? 'p-3' : viewDensity === 'comfortable' ? 'p-4' : 'p-6'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`rounded-lg ${getColorClasses(action.color)} group-hover:scale-110 transition-transform duration-300 ${
                            viewDensity === 'compact' ? 'p-2' : viewDensity === 'comfortable' ? 'p-2.5' : 'p-3'
                          }`}>
                            <IconComponent className={viewDensity === 'compact' ? 'h-4 w-4' : viewDensity === 'comfortable' ? 'h-5 w-5' : 'h-6 w-6'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-gray-900 dark:text-white ${
                              viewDensity === 'compact' ? 'text-base mb-0.5' : viewDensity === 'comfortable' ? 'text-lg mb-1' : 'text-xl mb-2'
                            }`}>
                              {action.title}
                            </h3>
                            {viewDensity !== 'compact' && (
                              <p className={`text-gray-700 dark:text-gray-300 line-clamp-1 ${
                                viewDensity === 'comfortable' ? 'text-sm' : 'text-base'
                              }`}>
                                {action.description}
                              </p>
                            )}
                          </div>
                          <ChevronRight className={`text-gray-400 flex-shrink-0 ${
                            viewDensity === 'compact' ? 'h-4 w-4' : 'h-5 w-5'
                          }`} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Study Tools */}
            <div>
              <h2 className={`font-bold text-gray-900 dark:text-white flex items-center gap-2 ${
                viewDensity === 'compact' ? 'text-lg mb-3' : viewDensity === 'comfortable' ? 'text-xl mb-4' : 'text-2xl mb-6'
              }`}>
                <Brain className={viewDensity === 'compact' ? 'h-4 w-4' : 'h-5 w-5'} />
                Study Tools
              </h2>
              <div className={`grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-1 ${
                viewDensity === 'compact' ? 'gap-2' : viewDensity === 'comfortable' ? 'gap-3' : 'gap-4'
              }`}>
                {studyTools.map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <Link key={tool.href} href={tool.href}>
                      <div className={`group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                        viewDensity === 'compact' ? 'p-3' : viewDensity === 'comfortable' ? 'p-4' : 'p-6'
                      }`}>
                        <div className={`flex items-center ${
                          viewDensity === 'compact' ? 'gap-2' : 'gap-3'
                        }`}>
                          <div className={`rounded-lg ${getColorClasses(tool.color)} group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ${
                            viewDensity === 'compact' ? 'p-2' : viewDensity === 'comfortable' ? 'p-2.5' : 'p-3'
                          }`}>
                            <IconComponent className={viewDensity === 'compact' ? 'h-4 w-4' : viewDensity === 'comfortable' ? 'h-5 w-5' : 'h-6 w-6'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className={`font-bold text-gray-900 dark:text-white line-clamp-1 ${
                                viewDensity === 'compact' ? 'text-base' : viewDensity === 'comfortable' ? 'text-lg' : 'text-xl'
                              }`}>
                                {tool.title}
                              </h3>
                              {tool.isNew && viewDensity !== 'compact' && (
                                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                                  New
                                </span>
                              )}
                            </div>
                            {viewDensity !== 'compact' && (
                              <p className={`text-gray-700 dark:text-gray-300 line-clamp-2 mt-1 ${
                                viewDensity === 'comfortable' ? 'text-sm' : 'text-base'
                              }`}>
                                {tool.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={viewDensity === 'compact' ? 'space-y-4' : viewDensity === 'comfortable' ? 'space-y-6' : 'space-y-8'}>
            {/* Community Tools */}
            <div>
              <h2 className={`gradient-title-secondary flex items-center gap-2 ${
                viewDensity === 'compact' ? 'text-lg mb-3' : viewDensity === 'comfortable' ? 'text-xl mb-4' : 'text-2xl mb-6'
              }`}>
                <Users className={viewDensity === 'compact' ? 'h-4 w-4' : 'h-5 w-5'} />
                Community Tools
              </h2>
              <div className={`grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-1 ${
                viewDensity === 'compact' ? 'gap-2' : viewDensity === 'comfortable' ? 'gap-3' : 'gap-4'
              }`}>
                {communityTools.map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <Link key={tool.href} href={tool.href}>
                      <div className={`group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                        viewDensity === 'compact' ? 'p-3' : viewDensity === 'comfortable' ? 'p-4' : 'p-6'
                      }`}>
                        <div className={`flex items-center ${
                          viewDensity === 'compact' ? 'gap-2' : 'gap-3'
                        }`}>
                          <div className={`rounded-lg ${getColorClasses(tool.color)} group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ${
                            viewDensity === 'compact' ? 'p-2' : viewDensity === 'comfortable' ? 'p-2.5' : 'p-3'
                          }`}>
                            <IconComponent className={viewDensity === 'compact' ? 'h-4 w-4' : viewDensity === 'comfortable' ? 'h-5 w-5' : 'h-6 w-6'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className={`font-bold text-gray-900 dark:text-white line-clamp-1 ${
                                viewDensity === 'compact' ? 'text-base' : viewDensity === 'comfortable' ? 'text-lg' : 'text-xl'
                              }`}>
                                {tool.title}
                              </h3>
                              {viewDensity !== 'compact' && (
                                <>
                                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                                    {tool.badge}
                                  </span>
                                  {tool.isNew && (
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                                      New
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                            {viewDensity !== 'compact' && (
                              <p className={`text-gray-700 dark:text-gray-300 line-clamp-2 mt-1 ${
                                viewDensity === 'comfortable' ? 'text-sm' : 'text-base'
                              }`}>
                                {tool.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Performance & Settings */}
            <div>
              <h2 className={`font-bold text-gray-900 dark:text-white flex items-center gap-2 ${
                viewDensity === 'compact' ? 'text-lg mb-3' : viewDensity === 'comfortable' ? 'text-xl mb-4' : 'text-2xl mb-6'
              }`}>
                <BarChart3 className={viewDensity === 'compact' ? 'h-4 w-4' : 'h-5 w-5'} />
                Performance & Settings
              </h2>
              <div className={`grid grid-cols-1 ${
                viewDensity === 'compact' ? 'gap-2' : viewDensity === 'comfortable' ? 'gap-3' : 'gap-4'
              }`}>
                <Link href="/performance-analytics">
                  <div className={`group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    viewDensity === 'compact' ? 'p-3' : viewDensity === 'comfortable' ? 'p-4' : 'p-6'
                  }`}>
                    <div className={`flex items-center ${
                      viewDensity === 'compact' ? 'gap-2' : 'gap-3'
                    }`}>
                      <div className={`rounded-lg ${getColorClasses('green')} ${
                        viewDensity === 'compact' ? 'p-2' : viewDensity === 'comfortable' ? 'p-2.5' : 'p-3'
                      }`}>
                        <BarChart3 className={viewDensity === 'compact' ? 'h-4 w-4' : viewDensity === 'comfortable' ? 'h-5 w-5' : 'h-6 w-6'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-gray-900 dark:text-white ${
                          viewDensity === 'compact' ? 'text-base' : viewDensity === 'comfortable' ? 'text-lg mb-1' : 'text-xl mb-2'
                        }`}>
                          Performance Analytics
                        </h3>
                        {viewDensity !== 'compact' && (
                          <p className={`text-gray-700 dark:text-gray-300 line-clamp-2 ${
                            viewDensity === 'comfortable' ? 'text-sm' : 'text-base'
                          }`}>
                            Detailed insights into your learning progress
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/settings">
                  <div className={`group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    viewDensity === 'compact' ? 'p-3' : viewDensity === 'comfortable' ? 'p-4' : 'p-6'
                  }`}>
                    <div className={`flex items-center ${
                      viewDensity === 'compact' ? 'gap-2' : 'gap-3'
                    }`}>
                      <div className={`rounded-lg ${getColorClasses('blue')} ${
                        viewDensity === 'compact' ? 'p-2' : viewDensity === 'comfortable' ? 'p-2.5' : 'p-3'
                      }`}>
                        <UserCog className={viewDensity === 'compact' ? 'h-4 w-4' : viewDensity === 'comfortable' ? 'h-5 w-5' : 'h-6 w-6'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-gray-900 dark:text-white ${
                          viewDensity === 'compact' ? 'text-base' : viewDensity === 'comfortable' ? 'text-lg mb-1' : 'text-xl mb-2'
                        }`}>
                          Account Settings
                        </h3>
                        {viewDensity !== 'compact' && (
                          <p className={`text-gray-700 dark:text-gray-300 line-clamp-2 ${
                            viewDensity === 'comfortable' ? 'text-sm' : 'text-base'
                          }`}>
                            Manage your profile and preferences
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Production Status */}
        {error && (
          <div className="mt-8 text-center">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <p className="text-yellow-700 dark:text-yellow-300">
                ⚠️ Some features may be limited. Dashboard running in safe mode.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}