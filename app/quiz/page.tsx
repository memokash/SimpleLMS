"use client";

import { useAuth } from '../components/AuthContext';
import { useTheme } from '../components/ThemeContext';
import { useState, Suspense, useEffect } from 'react';
import QuizApp from '../components/QuizApp';
import AuthModal from '../components/AuthModal';
import { useSearchParams } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';

function QuizContent() {
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  
  // Security: Sanitize quiz ID parameter
  const rawQuizId = searchParams.get('id') || 'MSQ Quiz 4';
  const quizId = typeof rawQuizId === 'string' && rawQuizId.length < 100 && /^[a-zA-Z0-9\s-_]+$/.test(rawQuizId) 
    ? rawQuizId 
    : 'MSQ Quiz 4';

  if (!user) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      } flex items-center justify-center p-4`}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="fixed top-6 right-6 p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl z-50"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-gray-700" />
          )}
        </button>
        
        <div className="max-w-md w-full">
          <div className="reactive-tile p-8 text-center">
            <div className="text-6xl mb-4">🏥</div>
            <h1 className="gradient-title text-2xl mb-4">
              Sign Up to Start This Quiz
            </h1>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Sign Up Free
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSignInWithEmail={signInWithEmail}
          onSignUpWithEmail={signUpWithEmail}
          onSignInWithGoogle={signInWithGoogle}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    } py-8`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl z-50"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5 text-gray-700" />
        )}
      </button>
      <QuizApp quizId={quizId} />
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="reactive-tile p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white font-medium">Loading quiz...</p>
        </div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}