'use client';

import Link from 'next/link';
import React, { useState } from 'react';
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
  BarChart3,
  MessageSquare,
  Users,
  Library,
  UserCheck,
  MapPin,
  Clipboard
} from 'lucide-react';

export default function UserDashboard() {
  const { stats, loading } = useUserStats();
  const { isDark, toggleTheme } = useTheme();

  // Section ordering state - Split into two columns
  const [leftColumnSections] = useState([
    'msq-platform',
    'study-tools',
    'clinical-tools',
    'performance-settings'
  ]);

  const [rightColumnSections] = useState([
    'quick-actions', 
    'community-tools',
    'discussion-forums'
  ]);

  const [showSectionControls, setShowSectionControls] = useState(false);

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

  const moveSectionUp = (index: number) => {
    // Disabled for two-column layout
  };

  const moveSectionDown = (index: number) => {
    // Disabled for two-column layout
  };

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

  // NEW: Enhanced Educational & Community Tools
  const communityTools = [
    {
      href: '/dashboard/question-bank',
      icon: BookOpen,
      title: 'Community Question Bank',
      description: 'Collaborative repository of medical education questions shared by peers',
      stats: '1,247 questions available',
      color: 'green',
      badge: 'Community'
    },
    {
      href: '/dashboard/study-groups',
      icon: Users,
      title: 'Study Groups',
      description: 'Join or create study groups with fellow medical students and residents',
      stats: '23 active groups',
      color: 'purple',
      badge: 'Collaborate'
    },
    {
      href: '/dashboard/messages',
      icon: MessageSquare,
      title: 'Messages & Chat',
      description: 'Internal messaging system for peer communication and collaboration',
      stats: '3 new messages',
      color: 'indigo',
      badge: 'Chat',
      isNew: true
    }
  ];

  // NEW: Clinical & Professional Tools
  const clinicalTools = [
    {
      href: '/dashboard/calendar',
      icon: Calendar,
      title: 'Calendar & Rotations',
      description: 'Manage rotation schedules, upload rotation lists, and track clinical requirements',
      stats: 'Internal Medicine - Week 3',
      color: 'orange',
      subItems: ['Rotation Schedule', 'Upload Documents', 'Team Calendar']
    },
    {
      href: '/dashboard/reading',
      icon: Library,
      title: 'Reading & Resources',
      description: 'Save articles, studies, books, and PDFs with highlighting and annotation features',
      stats: '45 saved articles',
      color: 'teal'
    }
  ];

  // NEW: Discussion Forums
  const discussionForums = [
    {
      href: '/dashboard/student-rotations',
      icon: GraduationCap,
      title: 'Student Rotations',
      description: 'Discuss rotations nationally and internationally, find opportunities',
      stats: '89 active discussions',
      color: 'pink'
    },
    {
      href: '/dashboard/residency-rotations',
      icon: UserCheck,
      title: 'Residency Rotations',
      description: 'Residency rotation discussions and experiences sharing',
      stats: '156 posts this week',
      color: 'cyan'
    },
    {
      href: '/dashboard/general-residency',
      icon: FileText,
      title: 'General Residency',
      description: 'General residency discussions organized in a Kardex-like manner',
      stats: '203 ongoing threads',
      color: 'amber'
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
    },
    {
      href: '/dashboard/ceus',
      icon: Award,
      title: 'CEUs',
      description: 'Continuing Education Units tracking and certification management',
      value: 'Coming Soon',
      color: 'purple',
      badge: 'Soon',
      comingSoon: true
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
      pink: 'text-pink-600 dark:text-pink-300 bg-pink-100 dark:bg-pink-900/40',
      teal: 'text-teal-600 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/40',
      cyan: 'text-cyan-600 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-900/40',
      amber: 'text-amber-600 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40',
      orange: 'text-orange-600 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/40'
    };
    return colorMap[color] || 'text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-gray-900/40';
  };

  // Section Separator Component - Simplified for two-column layout
  const SectionSeparator = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => {
    return (
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className={`w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent dark:via-yellow-400/60 rounded-full`}></div>
        </div>
        <div className="relative flex justify-center">
          <div className={`px-2 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md border border-white/40 dark:border-yellow-500/30 shadow-lg dark:shadow-yellow-500/20`}>
            <div className="flex items-center gap-2">
              <div className={`p-0.5 rounded-sm ${getColorClasses(color)}`}>
                <Icon className="h-3 w-3" />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const sections = {
    'msq-platform': (
      <div key="msq-platform">
        <SectionSeparator title="MSQ Platform" icon={Brain} color="purple" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-md ${getColorClasses('blue')}`}>
                <BookOpen className="h-4 w-4" />
              </div>
              <TrendingUp className="h-3 w-3 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{stats.totalCourses}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-200 font-medium">Quizzes Started</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-md ${getColorClasses('green')}`}>
                <Award className="h-4 w-4" />
              </div>
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full font-medium">+5</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{stats.completed}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-200 font-medium">Completed</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-md ${getColorClasses('purple')}`}>
                <Target className="h-4 w-4" />
              </div>
              <Activity className="h-3 w-3 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{stats.inProgress}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-200 font-medium">In Progress</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-md ${getColorClasses('yellow')}`}>
                <Gauge className="h-4 w-4" />
              </div>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium">↗ 8%</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{Math.round(stats.avgScore)}%</h3>
            <p className="text-xs text-gray-600 dark:text-gray-200 font-medium">Avg Score</p>
          </div>
        </div>
      </div>
    ),

    'quick-actions': (
      <div key="quick-actions">
        <SectionSeparator title="Quick Actions" icon={Zap} color="blue" />
        <div className="grid grid-cols-1 gap-2 mb-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <div className="group relative bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden min-h-[80px]">
                  <div className="relative z-10 h-full flex">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-1.5 rounded-md ${getColorClasses(action.color)} group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-200 text-xs leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white whitespace-nowrap`}>
                        {action.badge}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    ),

    'study-tools': (
      <div key="study-tools">
        <SectionSeparator title="Study Tools" icon={Brain} color="purple" />
        <div className="grid grid-cols-1 gap-2 mb-3">
          {studyTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link key={tool.href} href={tool.href}>
                <div className="group bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-102 cursor-pointer min-h-[70px]">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${getColorClasses(tool.color)} group-hover:scale-110 transition-all duration-300`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          {tool.title}
                        </h3>
                        {tool.isNew && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full font-medium">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-200 text-xs leading-relaxed">
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
    ),

    'community-tools': (
      <div key="community-tools">
        <SectionSeparator title="Community Tools" icon={Users} color="green" />
        <div className="grid grid-cols-1 gap-2 mb-3">
          {communityTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link key={tool.href} href={tool.href}>
                <div className="group bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 cursor-pointer min-h-[70px]">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${getColorClasses(tool.color)} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors duration-300">
                          {tool.title}
                        </h3>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white`}>
                          {tool.badge}
                        </span>
                        {tool.isNew && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-1.5 py-0.5 rounded-full font-medium">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-200 text-xs leading-relaxed">
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
    ),

    'clinical-tools': (
      <div key="clinical-tools">
        <SectionSeparator title="Clinical Tools" icon={Stethoscope} color="red" />
        <div className="grid grid-cols-1 gap-2 mb-3">
          {clinicalTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link key={tool.href} href={tool.href}>
                <div className="group bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-102 cursor-pointer min-h-[70px]">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${getColorClasses(tool.color)} group-hover:scale-110 transition-all duration-300`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                        {tool.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-200 text-xs leading-relaxed mb-1">
                        {tool.description}
                      </p>
                      {tool.subItems && (
                        <div className="text-xs text-gray-500 dark:text-gray-300">
                          {tool.subItems.join(' • ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    ),

    'discussion-forums': (
      <div key="discussion-forums">
        <SectionSeparator title="Discussion Forums" icon={MessageSquare} color="indigo" />
        <div className="grid grid-cols-1 gap-2 mb-3">
          {discussionForums.map((forum) => {
            const IconComponent = forum.icon;
            return (
              <Link key={forum.href} href={forum.href}>
                <div className="group bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 cursor-pointer min-h-[70px]">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${getColorClasses(forum.color)} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors duration-300">
                        {forum.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-200 text-xs leading-relaxed">
                        {forum.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    ),

    'performance-settings': (
      <div key="performance-settings">
        <SectionSeparator title="Performance & Settings" icon={Activity} color="green" />
        <div className="grid grid-cols-1 gap-2">
          {performanceData.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`group bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-102 cursor-pointer min-h-[70px] ${item.comingSoon ? 'opacity-75' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${getColorClasses(item.color)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                        {item.badge && (
                          <span className={`text-xs font-medium text-white px-1.5 py-0.5 rounded-full ${
                            item.badge === 'Soon' 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                              : item.badge === 'Trending Up'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-200 text-xs leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 py-4">
        
        {/* Header Section - REMOVED DUPLICATE NAVIGATION ELEMENTS */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back! 👋
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-200">
              Ready to continue your medicine education journey?
            </p>
          </div>
          
          {/* Simple controls - removed section controls */}
          <div className="flex items-center gap-3">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/20 dark:border-yellow-500/30 shadow-lg dark:shadow-yellow-500/20">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                <span className="text-gray-700 dark:text-gray-200 font-medium">Today: 3 sessions</span>
              </div>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-white/20 dark:border-yellow-500/30 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-yellow-500/20"
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

        {/* Personalized Quick Access Widget */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20 dark:border-yellow-500/30 shadow-lg dark:shadow-yellow-500/20">
          {/* Daily AI Motivation */}
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-100 dark:border-purple-700/30">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-200">Daily AI Insight</h3>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-200 leading-relaxed">
                  "Today's medical knowledge builds tomorrow's healing hands. Every question you answer brings you closer to saving lives. Keep going, future doctor! 🩺"
                </p>
              </div>
            </div>
          </div>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* My Groups */}
            <Link href="/dashboard/my-groups" className="group">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-700/30 hover:shadow-md transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">My Groups</h4>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-emerald-700 dark:text-emerald-300">Study Group Alpha</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">Class of 2025</div>
                  <div className="text-xs text-emerald-500 dark:text-emerald-500">+2 more</div>
                </div>
              </div>
            </Link>

            {/* Inbox */}
            <Link href="/dashboard/inbox" className="group">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-700/30 hover:shadow-md transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-200">Inbox</h4>
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-blue-700 dark:text-blue-300">Dr. Smith: Rotation feedback</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Quiz results available</div>
                  <div className="text-xs text-blue-500 dark:text-blue-500">Group chat mention</div>
                </div>
              </div>
            </Link>

            {/* Today's Schedule */}
            <Link href="/dashboard/calendar" className="group">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-700/30 hover:shadow-md transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-200">Today</h4>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-amber-700 dark:text-amber-300">9:00 AM - Morning rounds</div>
                  <div className="text-xs text-amber-600 dark:text-amber-400">2:00 PM - Case study</div>
                  <div className="text-xs text-amber-500 dark:text-amber-500">6:00 PM - Study group</div>
                </div>
              </div>
            </Link>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-rose-100 dark:border-rose-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <h4 className="text-xs font-semibold text-rose-800 dark:text-rose-200">Quick Actions</h4>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <Link href="/dashboard/flashcards" className="text-xs text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 p-1 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
                  📚 Review
                </Link>
                <Link href="/dashboard/generator" className="text-xs text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 p-1 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
                  ⚡ Generate
                </Link>
                <Link href="/dashboard/notes" className="text-xs text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 p-1 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
                  📝 Notes
                </Link>
                <Link href="/dashboard/ai-chat" className="text-xs text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 p-1 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
                  🤖 AI Chat
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {leftColumnSections.map(sectionId => sections[sectionId])}
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            {rightColumnSections.map(sectionId => sections[sectionId])}
          </div>
        </div>
      </div>
    </div>
  );
}