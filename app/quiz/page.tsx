"use client";

import { useAuth } from '../components/AuthContext';
import { useState } from 'react';
import QuizApp from '../components/QuizApp';
import AuthModal from '../components/AuthModal';

export default function QuizPage() {
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Show sign-up prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">���</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Sign Up to Start Your Medical Quiz
            </h1>
            <p className="text-gray-600 mb-6">
              Join thousands of medical students accessing our 15,000+ expert-crafted questions.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What you'll get:</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Free access to sample quizzes</li>
                <li>• Progress tracking across topics</li>
                <li>• Personalized study recommendations</li>
                <li>• Upgrade anytime for full access</li>
              </ul>
            </div>

            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
            >
              Sign Up Free - Start Quiz
            </button>
            
            <p className="text-xs text-gray-500">
              No credit card required • Sign up with Google in seconds
            </p>
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

  // User is authenticated - show the quiz
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <QuizApp />
    </div>
  );
}
