// components/DashboardNavigation.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Database, 
  Users, 
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from './AuthContext';

const DashboardNavigation = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navigationItems = [
    {
      href: '/dashboard',
      label: 'Study Hub',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Main dashboard with all tools'
    },
    {
      href: '/courses',
      label: 'Courses',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Quiz-driven learning courses'
    },
    {
      href: '/question-bank',
      label: 'Question Bank',
      icon: <Database className="w-5 h-5" />,
      description: 'Community generated questions'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-gray-900">
              🩺 <span className="text-blue-600">IMEC International Medical Education Centers</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={item.description}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="hidden md:flex items-center text-sm text-gray-700">
                  <User className="w-4 h-4 mr-2" />
                  <span>{user.displayName || user.email}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-1 overflow-x-auto">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavigation;

// UPDATE YOUR USER DASHBOARD TO INCLUDE NAVIGATION
// Add this to the top of your UserDashboard.tsx:

/*
import DashboardNavigation from './DashboardNavigation';

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <>
      <DashboardNavigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50">
        // ... rest of your dashboard content
      </div>
    </>
  );
}
*/

// CREATE PAGE FILES FOR NAVIGATION:

// 1. app/courses/page.tsx
/*
import CoursesDashboard from '../components/CoursesDashboard';
import DashboardNavigation from '../components/DashboardNavigation';

export default function CoursesPage() {
  return (
    <>
      <DashboardNavigation />
      <CoursesDashboard />
    </>
  );
}
*/

// 2. app/question-bank/page.tsx
/*
import QuestionBankDashboard from '../components/QuestionBankDashboard';
import DashboardNavigation from '../components/DashboardNavigation';

export default function QuestionBankPage() {
  return (
    <>
      <DashboardNavigation />
      <QuestionBankDashboard />
    </>
  );
}
*/