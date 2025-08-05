'use client';

import Link from 'next/link';
import { useUserStats } from '../hooks/useUserStats';
import { useTheme } from './ThemeContext';
import { useState } from 'react';
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
  Settings,
  ArrowUp,
  ArrowDown,
  Crown
} from 'lucide-react';

export default function UserDashboard() {
  const { stats, loading } = useUserStats();
  const { isDark, toggleTheme } = useTheme();

  // Section ordering state
  const [sectionOrder, setSectionOrder] = useState([
    'msq-platform',
    'quick-actions',
    'study-tools',
    'community-tools',
    'clinical-tools',
    'discussion-forums',
    'performance-settings'
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
    if (index > 0) {
      const newOrder = [...sectionOrder];
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      setSectionOrder(newOrder);
    }
  };

  const moveSectionDown = (index: number) => {
    if (index < sectionOrder.length - 1) {
      const newOrder = [...sectionOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setSectionOrder(newOrder);
    }
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

  // Section Separator Component
  const SectionSeparator = ({ title, icon: Icon, color, sectionId }: { title: string, icon: any, color: string, sectionId: string }) => {
    const sectionIndex = sectionOrder.indexOf(sectionId);
    
    return (
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className={`w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent dark:via-yellow-400/60 rounded-full`}></div>
        </div>
        <div className="relative flex justify-center">
          <div className={`px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/40 dark:border-yellow-500/30 shadow-lg dark:shadow-yellow-500/20`}>
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${getColorClasses(color)}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
              {showSectionControls && (
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => moveSectionUp(sectionIndex)}
                    disabled={sectionIndex === 0}
                    className="p-1 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveSectionDown(sectionIndex)}
                    disabled={sectionIndex === sectionOrder.length - 1}
                    className="p-1 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const sections = {
    'msq-platform': (
      <div key="msq-platform">
        <SectionSeparator title="MedicalSchoolQuizzes (MSQ) Platform" icon={Brain} color="purple" sectionId="msq-platform" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getColorClasses('blue')}`}>
                <BookOpen className="h-6 w-6" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalCourses}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-200 font-medium">MSQ Quizzes Started</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getColorClasses('green')}`}>
                <Award className="h-6 w-6" />
              </div>
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium">+5</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.completed}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-200 font-medium">MSQ Quizzes Completed</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getColorClasses('purple')}`}>
                <Target className="h-6 w-6" />
              </div>
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.inProgress}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-200 font-medium">MSQ Quizzes In Progress</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getColorClasses('yellow')}`}>
                <Gauge className="h-6 w-6" />
              </div>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">↗ 8%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{Math.round(stats.avgScore)}%</h3>
            <p className="text-sm text-gray-600 dark:text-gray-200 font-medium">MSQ Quizzes Average Score</p>
          </div>
        </div>
      </div>
    ),

    'quick-actions': (
      <div key="quick-actions">
        <SectionSeparator title="Quick Actions" icon={Zap} color="blue" sectionId="quick-actions" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <div className="group relative bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden min-h-[200px]">
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-4 rounded-2xl ${getColorClasses(action.color)} group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-7 w-7" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white`}>
                          {action.badge}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-200 text-sm leading-relaxed mb-3">
                        {action.description}
                      </p>
                      <div className="text-xs text-blue-600 dark:text-blue-300 font-medium">
                        {action.stats}
                      </div>
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
        <SectionSeparator title="Study Tools" icon={Brain} color="purple" sectionId="study-tools" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {studyTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link key={tool.href} href={tool.href}>
                <div className="group bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-102 cursor-pointer min-h-[160px]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${getColorClasses(tool.color)} group-hover:scale-110 transition-all duration-300`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {tool.title}
                          </h3>
                          {tool.isNew && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-200 text-sm leading-relaxed mb-2">
                          {tool.description}
                        </p>
                        <div className="text-xs text-blue-600 dark:text-blue-300 font-medium">
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
      </div>
    ),

    'community-tools': (
      <div key="community-tools">
        <SectionSeparator title="Community & Educational Tools" icon={Users} color="green" sectionId="community-tools" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {communityTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link key={tool.href} href={tool.href}>
                <div className="group bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 cursor-pointer min-h-[180px]">
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${getColorClasses(tool.color)} group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white`}>
                          {tool.badge}
                        </span>
                        {tool.isNew && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full font-medium">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors duration-300">
                        {tool.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-200 text-sm leading-relaxed mb-3">
                        {tool.description}
                      </p>
                      <div className="text-xs text-green-600 dark:text-green-300 font-medium">
                        {tool.stats}
                      </div>
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
        <SectionSeparator title="Clinical & Professional Tools" icon={Stethoscope} color="red" sectionId="clinical-tools" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {clinicalTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link key={tool.href} href={tool.href}>
                <div className="group bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-102 cursor-pointer min-h-[180px]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${getColorClasses(tool.color)} group-hover:scale-110 transition-all duration-300`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {tool.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-200 text-sm leading-relaxed mb-2">
                          {tool.description}
                        </p>
                        <div className="text-xs text-blue-600 dark:text-blue-300 font-medium mb-2">
                          {tool.stats}
                        </div>
                        {tool.subItems && (
                          <div className="space-y-1">
                            {tool.subItems.map((item, idx) => (
                              <div key={idx} className="text-xs text-gray-500 dark:text-gray-300">
                                • {item}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
        <SectionSeparator title="Discussion Forums" icon={MessageSquare} color="indigo" sectionId="discussion-forums" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {discussionForums.map((forum) => {
            const IconComponent = forum.icon;
            return (
              <Link key={forum.href} href={forum.href}>
                <div className="group bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 cursor-pointer min-h-[160px]">
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${getColorClasses(forum.color)} group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors duration-300">
                        {forum.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-200 text-sm leading-relaxed mb-3">
                        {forum.description}
                      </p>
                      <div className="text-xs text-indigo-600 dark:text-indigo-300 font-medium">
                        {forum.stats}
                      </div>
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
        <SectionSeparator title="Performance & Settings" icon={Activity} color="green" sectionId="performance-settings" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {performanceData.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`group bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-102 cursor-pointer min-h-[160px] ${item.comingSoon ? 'opacity-75' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${getColorClasses(item.color)}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {item.badge && (
                        <span className={`text-xs font-medium text-white px-2 py-1 rounded-full ${
                          item.badge === 'Soon' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                            : item.badge === 'Trending Up'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {item.trend && (
                        <span className="text-xs font-medium text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          {item.trend}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-200 text-sm leading-relaxed mb-3">
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
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back! 👋
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-200">
              Ready to continue your medicine education journey?
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20 dark:border-yellow-500/30 shadow-lg dark:shadow-yellow-500/20">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                <span className="text-gray-700 dark:text-gray-200 font-medium">Today: 3 sessions</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowSectionControls(!showSectionControls)}
              className="p-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/20 dark:border-yellow-500/30 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-yellow-500/20"
              title="Rearrange sections"
            >
              <Settings className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/20 dark:border-yellow-500/30 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-yellow-500/20"
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

        {/* Compact Profile Section */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20 dark:border-yellow-500/30 shadow-lg dark:shadow-yellow-500/20">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img
                className="h-12 w-12 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-900/30"
                src="/api/placeholder/48/48"
                alt="Profile"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dr. Sarah Johnson</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600 dark:text-gray-200">Medical Student • 3rd Year</p>
                    <Link 
                      href="/dashboard/subscription"
                      className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-medium rounded-full hover:from-yellow-500 hover:to-orange-600 transition-all"
                    >
                      <Crown className="h-3 w-3" />
                      <span>Pro - Upgrade</span>
                    </Link>
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Edit Profile
                </button>
              </div>
              
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {['Internal Medicine Rotation', 'Study Group Alpha', 'Class of 2025'].map((group, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Controls Notice */}
        {showSectionControls && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Section Reordering Mode:</strong> Use the arrow buttons next to section titles to move sections up or down.
            </p>
          </div>
        )}

        {/* Render sections in custom order */}
        {sectionOrder.map(sectionId => sections[sectionId])}
      </div>
    </div>
  );
}