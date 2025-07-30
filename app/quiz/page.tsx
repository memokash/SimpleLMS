"use client";

import { useAuth } from '../components/AuthContext';
import { useState, Suspense } from 'react';
import QuizApp from '../components/QuizApp';
import AuthModal from '../components/AuthModal';
import { useSearchParams } from 'next/navigation';

function QuizContent() {
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const searchParams = useSearchParams();
  const quizId = searchParams.get('id') || 'MSQ Quiz 4';

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🏥</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Sign Up to Start This Quiz
            </h1>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
    <div className="min-h-screen bg-gray-100 py-8">
      <QuizApp quizId={quizId} />
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}