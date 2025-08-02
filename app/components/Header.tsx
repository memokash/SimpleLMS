"use client";

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import AuthModal from './AuthModal';

const Header = () => {
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      {/* Enhanced Navigation */}
      <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                🩺 MedicalSchoolQuizzes
              </a>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/#features" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Features</a>
                <a href="/#specialties" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Specialties</a>
                <a href="/#pricing" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Pricing</a>
                <a href="/quiz" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Try Quiz</a>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <a href="/dashboard" className="bg-blue-100 text-blue-700 px-3 py-2 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors">
                      Dashboard
                    </a>
                    <span className="text-sm text-gray-600">Hi, {user.displayName || user.email}</span>
                    <button 
                      onClick={logout}
                      className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setShowAuthModal(true)}
                      className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => setShowAuthModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-green-700 transition-all shadow-lg"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              {user ? (
                <a href="/dashboard" className="bg-blue-100 text-blue-700 px-3 py-2 text-sm font-medium rounded-lg">
                  Dashboard
                </a>
              ) : (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="text-gray-600 px-2 py-1 text-sm font-medium"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

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

export default Header;