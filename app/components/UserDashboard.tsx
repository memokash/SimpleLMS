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
  Brain,
  BarChart3
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
      description: 'Pick up where you left off with your medical studies',
      color: 'indigo',
      stats: '4 active courses',
      badge: 'Continue'
    },
    {
      href: '/dashboard/generator',
      icon: Lightbulb,
      title: 'Generate Questions',
      description: 'Create custom practice questions using AI',
      color: 'yellow',
      stats: 'AI powered',
      badge: 'Create'
    },
    {
      href: '/dashboard/flashcards',
      icon: BrainCircuit,
      title: 'Quick Review',
      description: 'Smart flashcard session with spaced repetition',
      color: 'purple',
      stats: '156 cards ready',
      badge: 'Study'
    }
  ];

  const studyTools = [
    {
      href: '/dashboard/etutor',
      icon: Sparkles,
      title: 'AI Tutor',
      description: 'Personalized explanations and comprehensive study guides tailored to your learning',
      stats: '12 summaries available',
      isNew: true,
      color: 'pink'
    },
    {
      href: '/dashboard/rounding',
      icon: Stethoscope,
      title: 'Medical Rounding',
      description: 'Simulate real-world clinical scenarios and patient case studies',
      stats: '8 cases available',
      color: 'red'
    },
    {
      href: '/dashboard/notes',
      icon: NotebookText,
      title: 'Smart Notes',
      description: 'AI-enhanced note taking with automatic summarization and organization',
      stats: '24 notes created',
      color: 'green'
    },
    {
      href: '/dashboard/quickreview',
      icon: BookOpen,
      title: 'Rapid Review',
      description: 'High-yield facts and rapid recall sessions for exam preparation',
      stats: '156 facts mastered',
      color: 'blue'
    }
  ];

  const performanceData = [
    {
      href: '/dashboard/results',
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Detailed insights into your learning progress and quiz performance with trends',
      value: `${stats.completed} quizzes completed`,
      trend: '+12% this week',
      color: 'green',
      badge: 'Trending Up'
    },
    {
      href: '/dashboard/profile',
      icon: UserCog,
      title: 'Account & Subscription',
      description: 'Manage your subscription plan, billing, and personal account settings',
      value: 'Pro Member',
      color: 'blue',
      badge: 'Pro'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30',
      yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
      purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
      green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
      blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
      red: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
      pink: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30'
    };
    return colorMap[color] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
  };

  // Section Separator Component
  const SectionSeparator = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
    <div className="relative my-12">
      <div className="absolute inset-0 flex items-center">
        <div className={`w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent dark:via-yellow-400/60 rounded-full`}></div>
      </div>
      <div className="relative flex justify-center">
        <div className={`px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-yellow-500/30 shadow-lg dark:shadow-yellow-500/20`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${getColorClasses(color)}`}>
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-4">
          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              Welcome back! 👋
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Ready to continue your medical journey?
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20 dark:border-yellow-500/30 shadow-lg dark:shadow-yellow-500/20">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Today: 3 sessions completed</span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/20 dark:border-yellow-500/30 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-yellow-500/20"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-6 w-6 text-yellow-500" />
              ) : (
                <Moon className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl ${getColorClasses('blue')}`}>
                <BookOpen className="h-8 w-8" />
              </div>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalCourses}</h3>
            <p className="text-base text-gray-600 dark:text-gray-300 font-medium">Courses Started</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl ${getColorClasses('green')}`}>
                <Award className="h-8 w-8" />
              </div>
              <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-2 rounded-full font-medium">+5</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.completed}</h3>
            <p className="text-base text-gray-600 dark:text-gray-300 font-medium">Completed</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl ${getColorClasses('purple')}`}>
                <Target className="h-8 w-8" />
              </div>
              <Activity className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.inProgress}</h3>
            <p className="text-base text-gray-600 dark:text-gray-300 font-medium">In Progress</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl ${getColorClasses('yellow')}`}>
                <Gauge className="h-8 w-8" />
              </div>
              <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-2 rounded-full font-medium">↗ 8%</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{Math.round(stats.avgScore)}%</h3>
            <p className="text-base text-gray-600 dark:text-gray-300 font-medium">Average Score</p>
          </div>
        </div>

        {/* Quick Actions Section */}
        <SectionSeparator title="Quick Actions" icon={Zap} color="blue" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <div className="group relative bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden min-h-[280px]">
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-5 rounded-3xl ${getColorClasses(action.color)} group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-10 w-10" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white`}>
                          {action.badge}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-4">
                        {action.description}
                      </p>
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {action.stats}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Study Tools Section */}
        <SectionSeparator title="Study Tools" icon={Brain} color="purple" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {studyTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link key={tool.href} href={tool.href}>
                <div className="group bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-102 cursor-pointer min-h-[220px]">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl ${getColorClasses(tool.color)} group-hover:scale-110 transition-all duration-300`}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {tool.title}
                          </h3>
                          {tool.isNew && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-medium">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-3">
                          {tool.description}
                        </p>
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {tool.stats}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Performance & Settings Section */}
        <SectionSeparator title="Performance & Settings" icon={Activity} color="green" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {performanceData.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className="group bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-102 cursor-pointer min-h-[220px]">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-2xl ${getColorClasses(item.color)}`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {item.badge && (
                        <span className="text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {item.trend && (
                        <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                          {item.trend}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-4">
                    {item.description}
                  </p>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}