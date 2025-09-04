'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home,
  BookOpen,
  Brain,
  MessageSquare,
  Users,
  Calendar,
  FileText,
  Stethoscope,
  BarChart3,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Target,
  Zap,
  Heart,
  Shield,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
}

const DashboardNavigationEnhanced = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { 
      label: 'Dashboard', 
      href: '/dashboard', 
      icon: Home,
      color: 'from-blue-600 to-blue-500'
    },
    { 
      label: 'Courses', 
      href: '/dashboard/courses', 
      icon: BookOpen,
      color: 'from-indigo-600 to-purple-600',
      badge: 'New'
    },
    { 
      label: 'Quiz Library', 
      href: '/quiz', 
      icon: Brain,
      color: 'from-blue-600 to-indigo-600',
      badge: '15K+'
    },
    { 
      label: 'AI Tutor', 
      href: '/dashboard/etutor', 
      icon: Sparkles,
      color: 'from-purple-600 to-indigo-600'
    },
    { 
      label: 'Study Groups', 
      href: '/study-groups', 
      icon: Users,
      color: 'from-blue-600 to-purple-600'
    },
    { 
      label: 'Messages', 
      href: '/messages', 
      icon: MessageSquare,
      color: 'from-indigo-600 to-blue-600',
      badge: '3'
    },
    { 
      label: 'Resources', 
      href: '/reading-resources', 
      icon: FileText,
      color: 'from-blue-600 to-indigo-600'
    },
    { 
      label: 'Rounding Tools', 
      href: '/rounding-tools', 
      icon: Stethoscope,
      color: 'from-purple-600 to-blue-600'
    },
    { 
      label: 'Analytics', 
      href: '/performance-analytics', 
      icon: BarChart3,
      color: 'from-indigo-600 to-purple-600'
    },
    { 
      label: 'Profile', 
      href: '/profile', 
      icon: User,
      color: 'from-blue-600 to-indigo-600'
    },
    { 
      label: 'Settings', 
      href: '/settings', 
      icon: Settings,
      color: 'from-slate-600 to-slate-700'
    }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-full px-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MedEd Dashboard
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`
        hidden lg:flex flex-col fixed left-0 top-0 h-full z-30
        transition-all duration-300 
        ${collapsed ? 'w-20' : 'w-64'}
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-700
        shadow-lg
      `}>
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <span className="text-3xl">🩺</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MedEd LMS
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Study Dashboard</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-3 rounded-xl
                    transition-all duration-300 group relative
                    ${isActive(item.href)
                      ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-md'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-all duration-300
                    ${isActive(item.href) 
                      ? 'bg-white/20' 
                      : ''
                    }
                  `}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  
                  {!collapsed && (
                    <>
                      <span className="font-medium flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-bold
                          ${isActive(item.href)
                            ? 'bg-white/20 text-white'
                            : 'bg-gradient-to-r ' + item.color + ' text-white'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="
                      absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white
                      rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none
                      transition-opacity duration-200 whitespace-nowrap z-50
                      text-sm font-medium
                    ">
                      {item.label}
                      {item.badge && (
                        <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Medical Student</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Premium Member</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Study Streak</span>
                <span className="font-bold text-orange-500">🔥 7 days</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-80 max-w-full bg-white dark:bg-gray-900 h-full shadow-xl overflow-y-auto">
            {/* Mobile Menu Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🩺</span>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    MedEd Dashboard
                  </h2>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center space-x-3 px-3 py-3 rounded-xl
                        transition-all duration-300
                        ${isActive(item.href)
                          ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-bold
                          ${isActive(item.href)
                            ? 'bg-white/20 text-white'
                            : 'bg-gradient-to-r ' + item.color + ' text-white'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardNavigationEnhanced;