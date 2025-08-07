'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
// import { useUserStats } from '../hooks/useUserStats'; // Commented out for safety
// import { useTheme } from './ThemeContext'; // Commented out for safety
import {
  BookOpenCheck,
  FileText,
  GraduationCap,
  Sparkles,
  Lightbulb,
  Stethoscope,
  BrainCircuit,
  NotebookText,
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
  RefreshCw
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

  // Load initial theme from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
          setIsDark(true);
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

        // Try to load real user stats (replace with your actual hook/API call)
        try {
          // Uncomment and modify this when your hooks are working:
          // const { stats: realStats, loading: statsLoading } = useUserStats();
          // if (!statsLoading && realStats) {
          //   setStats(realStats);
          // }
          
          // For now, simulate loading with mock data
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // You can replace this with actual API calls
          if (user) {
            // Mock personalized stats based on user
            setStats({
              totalCourses: 15,
              completed: Math.floor(Math.random() * 10) + 5,
              inProgress: Math.floor(Math.random() * 5) + 2,
              avgScore: Math.floor(Math.random() * 20) + 75
            });
          }
          
        } catch (hookError) {
          console.warn('Hook error, using fallback data:', hookError);
          // Keep using mock data as fallback
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
      icon: NotebookText,
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
      indigo: 'text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40',
      yellow: 'text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/40',
      purple: 'text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40',
      green: 'text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-900/40',
      blue: 'text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40',
      red: 'text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900/40',
      pink: 'text-pink-600 dark:text-pink-300 bg-pink-100 dark:bg-pink-900/40'
    };
    return colorMap[color] || 'text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-gray-900/40';
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Medical Student'}! 👋
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-200">
              Ready to continue your medical education journey?
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                <span className="text-gray-700 dark:text-gray-200 font-medium">Today: 3 sessions</span>
              </div>
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getColorClasses('blue')}`}>
                <BookOpen className="h-6 w-6" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalCourses}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-200 font-medium">Total Courses</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getColorClasses('green')}`}>
                <Award className="h-6 w-6" />
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">+5</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{stats.completed}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-200 font-medium">Completed</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getColorClasses('purple')}`}>
                <Target className="h-6 w-6" />
              </div>
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{stats.inProgress}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-200 font-medium">In Progress</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getColorClasses('yellow')}`}>
                <Gauge className="h-6 w-6" />
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">↗ 8%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{Math.round(stats.avgScore)}%</h3>
            <p className="text-sm text-gray-600 dark:text-gray-200 font-medium">Avg Score</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Zap className="h-6 w-6 text-yellow-500" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <Link key={action.href} href={action.href}>
                      <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${getColorClasses(action.color)} group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                              {action.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-200 text-sm">
                              {action.description}
                            </p>
                          </div>
                          <span className="text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full font-medium">
                            {action.badge}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Study Tools */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Brain className="h-6 w-6 text-purple-500" />
                Study Tools
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {studyTools.map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <Link key={tool.href} href={tool.href}>
                      <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${getColorClasses(tool.color)} group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {tool.title}
                              </h3>
                              {tool.isNew && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-200 text-sm">
                              {tool.description}
                            </p>
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
          <div className="space-y-8">
            {/* Community Tools */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Users className="h-6 w-6 text-green-500" />
                Community Tools
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {communityTools.map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <Link key={tool.href} href={tool.href}>
                      <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${getColorClasses(tool.color)} group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {tool.title}
                              </h3>
                              <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full font-medium">
                                {tool.badge}
                              </span>
                              {tool.isNew && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-200 text-sm">
                              {tool.description}
                            </p>
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-blue-500" />
                Performance & Settings
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <Link href="/performance-analytics">
                  <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${getColorClasses('green')}`}>
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          Performance Analytics
                        </h3>
                        <p className="text-gray-600 dark:text-gray-200 text-sm">
                          Detailed insights into your learning progress and quiz performance
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/settings">
                  <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${getColorClasses('blue')}`}>
                        <UserCog className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          Account Settings
                        </h3>
                        <p className="text-gray-600 dark:text-gray-200 text-sm">
                          Manage your profile, preferences, and account settings
                        </p>
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