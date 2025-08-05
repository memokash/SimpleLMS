// components/DashboardNavigation.tsx - Enhanced with better spacing and signout
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  Brain,
  GraduationCap,
  Zap,
  MessageSquare,
  Calendar,
  Stethoscope,
  Library,
  UserCheck,
  FileText,
  Award,
  LogOut,
  Crown,
  ChevronDown,
  User
} from 'lucide-react';

const DashboardNavigation = () => {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and analytics'
    },
    {
      name: 'MedicalSchoolQuizzes',
      href: '/courses',
      icon: BookOpen,
      description: 'Take quizzes and track progress',
    },
    // NEW: Community & Educational Tools
    {
      name: 'Question Bank',
      href: '/dashboard/question-bank',
      icon: BookOpen,
      description: 'Community question repository',
      badge: 'Community'
    },
    {
      name: 'Study Groups',
      href: '/dashboard/study-groups',
      icon: Users,
      description: 'Join or create study groups'
    },
    {
      name: 'Messages',
      href: '/dashboard/messages',
      icon: MessageSquare,
      description: 'Internal messaging system',
      badge: '3'
    },
    // NEW: Clinical & Professional Tools
    {
      name: 'Calendar & Rotations',
      href: '/dashboard/calendar',
      icon: Calendar,
      description: 'Rotation schedules and calendar'
    },
    {
      name: 'Rounding Tools',
      href: '/dashboard/rounding',
      icon: Stethoscope,
      description: 'H&P, Progress Notes, Procedures'
    },
    {
      name: 'Reading & Resources',
      href: '/dashboard/reading',
      icon: Library,
      description: 'Save and annotate articles'
    },
    // NEW: Discussion Forums
    {
      name: 'Student Rotations',
      href: '/dashboard/student-rotations',
      icon: GraduationCap,
      description: 'Student rotation discussions'
    },
    {
      name: 'Residency Rotations',
      href: '/dashboard/residency-rotations',
      icon: UserCheck,
      description: 'Residency rotation discussions'
    },
    {
      name: 'General Residency',
      href: '/dashboard/general-residency',
      icon: FileText,
      description: 'General residency discussions'
    },
    // Existing items
    {
      name: 'Students',
      href: '/students',
      icon: Users,
      description: 'Student management'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Performance insights'
    },
    {
      name: 'AI Operations',
      href: '/ai/categorize-course',
      icon: Brain,
      description: 'AI-powered enhancements',
      badge: 'New',
      submenu: [
        {
          name: 'Course Categorization',
          description: 'Auto-categorize medical courses',
          icon: BookOpen
        },
        {
          name: 'Explanation Enhancement',
          description: 'Generate teaching explanations',
          icon: GraduationCap
        }
      ]
    },
    // NEW: CEUs
    {
      name: 'CEUs',
      href: '/dashboard/ceus',
      icon: Award,
      description: 'Continuing Education Units',
      badge: 'Soon'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'System configuration'
    }
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  const handleSignOut = () => {
    // Add your signout logic here
    console.log('Signing out...');
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">MedEd LMS</span>
              </div>
            </div>
            
            {/* Navigation Links - Scrollable for mobile */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-1 overflow-x-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <div key={item.name} className="relative group flex-shrink-0">
                    <Link
                      href={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                        active
                          ? 'bg-purple-100 text-purple-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                      {item.badge && (
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.badge === 'New' || item.badge === 'Community'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                            : item.badge === 'Soon' 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                            : /^\d+$/.test(item.badge) 
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                    
                    {/* Dropdown for AI Operations */}
                    {item.submenu && (
                      <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="p-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <Zap className="h-4 w-4 mr-2 text-purple-600" />
                            AI-Powered Features
                          </h3>
                          <div className="space-y-3">
                            {item.submenu.map((subItem) => {
                              const SubIcon = subItem.icon;
                              return (
                                <div
                                  key={subItem.name}
                                  className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex-shrink-0">
                                    <SubIcon className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900">
                                      {subItem.name}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                      {subItem.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                              Transform your medical quizzes with AI-generated explanations and automatic categorization.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Right side - User menu, notifications, unread messages indicator */}
          <div className="flex items-center space-x-4">
            {/* Messages indicator */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">3 unread</span>
            </div>
            
            {/* Status indicator for AI operations */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">AI Ready</span>
            </div>
            
            {/* User Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">U</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Dr. Sarah Johnson</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-gray-500">Medical Student</p>
                          <Link 
                            href="/dashboard/subscription"
                            className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-medium rounded-full hover:from-yellow-500 hover:to-orange-600 transition-all"
                          >
                            <Crown className="h-3 w-3" />
                            <span>Pro</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile Settings
                    </Link>
                    
                    <Link
                      href="/dashboard/subscription"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Crown className="h-4 w-4 mr-3" />
                      Upgrade Subscription
                    </Link>
                    
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleSignOut();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="sm:hidden max-h-96 overflow-y-auto">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 text-base font-medium rounded-lg ${
                  active
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                  {item.badge && (
                    <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.badge === 'New' || item.badge === 'Community'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : item.badge === 'Soon' 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                        : /^\d+$/.test(item.badge) 
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 text-center">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavigation;