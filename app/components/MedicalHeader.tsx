"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  Brain, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Stethoscope,
  GraduationCap,
  Heart,
  Activity
} from 'lucide-react';

const MedicalHeader = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Medical specialties for rotating icon
  const [currentIcon, setCurrentIcon] = useState(0);
  const medicalIcons = [Stethoscope, Heart, Brain, Activity];
  const MedIcon = medicalIcons[currentIcon];

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    // Rotate medical icons
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % medicalIcons.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/courses', label: 'Medical School Quizzes', icon: BookOpen },
    { path: '/question-bank', label: 'Community Question Bank', icon: Brain },
    { path: '/study-groups', label: 'Study Groups', icon: Users },
    { path: '/performance-analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 dark:bg-blue-500 rounded-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white dark:bg-gray-800 p-2 rounded-lg border-2 border-blue-600 dark:border-blue-500">
                  <MedIcon className="w-6 h-6 text-blue-600 dark:text-blue-500 transition-all duration-300" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">MedEd LMS</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Medical Education Platform</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg
                    font-medium text-sm transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Beautiful Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="relative group p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className="relative w-14 h-7">
                {/* Toggle Track */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-gray-600 dark:to-gray-700 rounded-full"></div>
                
                {/* Sun and Moon Icons */}
                <Sun className={`
                  absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500
                  transition-all duration-300
                  ${darkMode ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}
                `} />
                <Moon className={`
                  absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300
                  transition-all duration-300
                  ${darkMode ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
                `} />
                
                {/* Toggle Thumb */}
                <div className={`
                  absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg
                  transition-transform duration-300 ease-in-out
                  ${darkMode ? 'translate-x-8' : 'translate-x-1'}
                `}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {darkMode ? (
                      <Moon className="w-3 h-3 text-blue-600" />
                    ) : (
                      <Sun className="w-3 h-3 text-yellow-600" />
                    )}
                  </div>
                </div>
              </div>
            </button>

            {/* User Menu */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.displayName || user.email}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Medical Student</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="lg:hidden px-4 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg
                  font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Medical Specialty Indicator Bar */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-teal-500 to-blue-600 dark:from-blue-500 dark:via-teal-400 dark:to-blue-500"></div>
    </header>
  );
};

export default MedicalHeader;