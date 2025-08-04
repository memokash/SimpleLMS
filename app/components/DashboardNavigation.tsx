// components/DashboardNavigation.tsx - Fixed for App Router
'use client';

import React from 'react';
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
  Zap
} from 'lucide-react';

const DashboardNavigation = () => {
  const pathname = usePathname();
  
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and analytics'
    },
    {
      name: 'Courses',
      href: '/courses',
      icon: BookOpen,
      description: 'Manage medical courses'
    },
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
      href: '/ai/categorize-courses',
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
                <span className="font-bold text-xl text-gray-900">MedQuiz AI</span>
              </div>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <div key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        active
                          ? 'bg-purple-100 text-purple-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                      {item.badge && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white">
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
          
          {/* Right side - User menu, notifications, etc. */}
          <div className="flex items-center space-x-4">
            {/* Status indicator for AI operations */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">AI Ready</span>
            </div>
            
            {/* User avatar placeholder */}
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">U</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="sm:hidden">
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
                <div className="flex items-center">
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 ml-8 mt-1">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavigation;