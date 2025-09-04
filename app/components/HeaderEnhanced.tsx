"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import AuthModal from './AuthModal';
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  Brain, 
  DollarSign, 
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  GraduationCap
} from 'lucide-react';

interface HeaderProps {
  onSignInClick: () => void;
  onSignUpClick: () => void;
  isLandingPage?: boolean;
}

const HeaderEnhanced: React.FC<HeaderProps> = ({ onSignInClick, onSignUpClick, isLandingPage = false }) => {
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Features', href: '/#features', icon: Sparkles },
    { label: 'Pricing', href: '/#pricing', icon: DollarSign },
    { label: 'Try Quiz', href: '/quiz', icon: BookOpen, highlight: true },
  ];

  return (
    <>
      {/* Enhanced Navigation with Glass Morphism */}
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full overflow-x-hidden
        ${isLandingPage 
          ? scrolled
            ? 'backdrop-blur-xl bg-white/95 dark:bg-white/95 shadow-lg border-b border-gray-200'
            : 'backdrop-blur-md bg-white/80 dark:bg-white/80'
          : scrolled 
            ? 'backdrop-blur-xl bg-white/85 dark:bg-gray-900/85 shadow-lg border-b border-white/20 dark:border-gray-700/30' 
            : 'backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-white/10 dark:border-gray-700/20'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <span className="text-3xl animate-pulse">🩺</span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
                </div>
                <div className="hidden sm:block">
                  <h1 className={`text-xl lg:text-2xl font-bold ${isLandingPage ? 'text-gray-900' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent'} group-hover:from-blue-500 group-hover:to-cyan-500 transition-all duration-300`}>
                    SimpleLMS
                  </h1>
                  <p className={`text-xs ${isLandingPage ? 'text-gray-700' : 'text-gray-600 dark:text-gray-400'}`}>Your Academic Hub</p>
                </div>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300
                    ${item.highlight 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105' 
                      : isLandingPage
                        ? 'text-gray-800 hover:bg-gray-100 hover:text-blue-700 font-semibold'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 hover:text-blue-600 dark:hover:text-blue-400'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </a>
              ))}
              
              {/* User Section */}
              {user ? (
                <div className="relative ml-4">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <span className="text-gray-700 dark:text-gray-200 font-medium hidden xl:block">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <a
                        href="/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <GraduationCap className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700 dark:text-gray-200">Dashboard</span>
                      </a>
                      <a
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-700 dark:text-gray-200">Profile</span>
                      </a>
                      <hr className="border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span className="text-red-600 dark:text-red-400">Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3 ml-4">
                  <button
                    onClick={onSignInClick}
                    className={`px-4 py-2 font-medium transition-colors ${
                      isLandingPage 
                        ? 'text-gray-800 hover:text-blue-700 font-semibold' 
                        : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onSignUpClick}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                  >
                    Get Started Free
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
            <div className="px-4 py-6 space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${item.highlight 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              ))}
              
              {user ? (
                <>
                  <a
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10"
                  >
                    <GraduationCap className="w-5 h-5 text-indigo-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-200">Dashboard</span>
                  </a>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-red-600 dark:text-red-400">Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="pt-3 space-y-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      onSignInClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      onSignUpClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white font-bold rounded-xl"
                  >
                    Get Started Free
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16 lg:h-20"></div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignInWithEmail={signInWithEmail}
        onSignUpWithEmail={signUpWithEmail}
        onSignInWithGoogle={signInWithGoogle}
      />
    </>
  );
};

export default HeaderEnhanced;