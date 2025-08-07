// Fixed DashboardNavigation.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
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
  User,
  Database
} from 'lucide-react';

const DashboardNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle mounting to prevent SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and analytics'
    },
    {
      name: 'Smart Quizzes',
      href: '/courses',
      icon: BookOpen,
      description: 'Take quizzes and track progress',
    },
    {
      name: 'Question Bank',
      href: '/question-bank',
      icon: Database,
      description: 'Community question repository',
      badge: 'Community'
    },
    {
      name: 'Study Groups',
      href: '/study-groups',
      icon: Users,
      description: 'Join or create study groups'
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageSquare,
      description: 'Internal messaging system',
      badge: '3'
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      description: 'Rotation schedules and calendar'
    },
    {
      name: 'Rounding Tools',
      href: '/rounding-tools',
      icon: Stethoscope,
      description: 'H&P, Progress Notes, Procedures'
    },
    {
      name: 'Resources',
      href: '/reading-resources',
      icon: Library,
      description: 'Save and annotate articles'
    },
    {
      name: 'Analytics',
      href: '/performance-analytics',
      icon: BarChart3,
      description: 'Performance insights'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'System configuration'
    }
  ];

  const isActive = (href: string) => {
    if (!mounted || !pathname) {
      return false;
    }
    return pathname === href || pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    if (!mounted) {
      return;
    }

    try {
      await logout();
      setShowUserMenu(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  // Don't render until mounted (prevents SSR issues)
  if (!mounted) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">MedEd LMS</span>
              </Link>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-1 overflow-x-auto">
              {navigationItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
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
                        item.badge === 'Community'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : /^\d+$/.test(item.badge) 
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Messages indicator */}
            <Link 
              href="/messages"
              className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">3 unread</span>
            </Link>
            
            {/* User Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                  </span>
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
                        <p className="text-sm font-medium text-gray-900">
                          {user?.displayName || 'Medical Student'}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile Settings
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
                        onClick={handleSignOut}
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
                <div className="flex items-center mb-2">
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                  {item.badge && (
                    <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.badge === 'Community'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : /^\d+$/.test(item.badge) 
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavigation;