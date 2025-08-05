'use client';

import Link from 'next/link';
import { useUserStats } from '../hooks/useUserStats';
import { useTheme } from './ThemeContext';
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
  Brain
} from 'lucide-react';

export default function UserDashboard() {
  const { stats, loading } = useUserStats();
  const { isDark, toggleTheme } = useTheme();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="flex items-center text-gray-600 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <Loader2 className="animate-spin h-6 w-6 mr-3" />
          <span className="text-lg font-medium">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      href: '/dashboard/courses',
      icon: GraduationCap,
      title: 'Continue Learning',
      description: 'Pick up where you left off',
      color: 'indigo'
    },
    {
      href: '/dashboard/generator',
      icon: Lightbulb,
      title: 'Generate Questions',
      description: 'Create custom practice',
      color: 'yellow'
    },
    {
      href: '/dashboard/flashcards',
      icon: BrainCircuit,
      title: 'Quick Review',
      description: 'Smart flashcard session',
      color: 'purple'
    }
  ];

  const studyTools = [
    {
      href: '/dashboard/etutor',
      icon: Sparkles,
      title: 'AI Tutor',
      description: 'Personalized explanations and study guides',
      stats: '12 summaries',
      isNew: true
    },
    {
      href: '/dashboard/rounding',
      icon: Stethoscope,
      title: 'Medical Rounding',
      description: 'Real-world clinical scenarios',
      stats: '8 cases available'
    },
    {
      href: '/dashboard/notes',
      icon: NotebookText,
      title: 'Smart Notes',
      description: 'AI-enhanced note taking and summaries',
      stats: '24 notes'
    },
    {
      href: '/dashboard/quickreview',
      icon: BookOpen,
      title: 'Quick Review',
      description: 'High-yield facts and rapid recall',
      stats: '156 facts'
    }
  ];

  const performanceData = [
    {
      href: '/dashboard/results',
      icon: FileText,
      title: 'Quiz History',
      description: 'Track your progress and performance',
      value: `${stats.completed} completed`,
      trend: '+12%',
      color: 'green'
    },
    {
      href: '/dashboard/profile',
      icon: UserCog,
      title: 'Profile & Plan',
      description: 'Manage subscription and settings',
      value: 'Pro Member',
      color: 'blue'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30',
      yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
      purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
      green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
      blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
      red: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
    };
    return colorMap[color] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Welcome back! 👋
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Ready to continue your medical journey?
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 dark:border-gray-700/50">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">Today: 3 sessions</span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getColorClasses('blue')}`}>
                <BookOpen className="h-6 w-6" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCourses}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Courses Started</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getColorClasses('green')}`}>
                <Award className="h-6 w-6" />
              </div>
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">+5</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getColorClasses('purple')}`}>
                <Target className="h-6 w-6" />
              </div>
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getColorClasses('yellow')}`}>
                <Gauge className="h-6 w-6" />
              </div>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">↗ 8%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.avgScore)}%</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <div className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-4 rounded-2xl ${getColorClasses(action.color)} group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="h-8 w-8" />
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Study Tools Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Study Tools</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studyTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link key={tool.href} href={tool.href}>
                  <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-102 cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-300">
                          <IconComponent className="h-6 w-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {tool.title}
                            </h3>
                            {tool.isNew && (
                              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                      {tool.stats && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full">
                          {tool.stats}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Performance & Settings Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Performance & Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {performanceData.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-102 cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${getColorClasses(item.color)}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      {item.trend && (
                        <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          {item.trend}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {item.description}
                    </p>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {item.value}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}