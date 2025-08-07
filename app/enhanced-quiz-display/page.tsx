// app/enhanced-quiz-display/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import QuizApp from '../components/QuizApp';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../components/AuthContext';
import {
  Brain,
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Play,
  Clock,
  Target,
  Zap
} from 'lucide-react';

interface QuizSummary {
  id: string;
  title: string;
  description: string;
  category: string;
  questionCount: number;
  difficulty: string;
  estimatedTime: number;
  tags: string[];
}

export default function EnhancedQuizDisplayPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get quiz ID from URL params
  const quizIdFromUrl = searchParams?.get('quizId');

  useEffect(() => {
    if (quizIdFromUrl) {
      setSelectedQuizId(quizIdFromUrl);
    } else {
      fetchAvailableQuizzes();
    }
  }, [quizIdFromUrl]);

  const fetchAvailableQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch quiz summaries from Firebase
      const quizzesRef = collection(db, 'quizzes');
      const q = query(quizzesRef, limit(20)); // Limit to 20 for performance
      const querySnapshot = await getDocs(q);

      const quizzes: QuizSummary[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        quizzes.push({
          id: doc.id,
          title: data.title || 'Untitled Quiz',
          description: data.description || 'No description available',
          category: data.category || 'General',
          questionCount: data.questions?.length || 0,
          difficulty: data.difficulty || 'Medium',
          estimatedTime: data.estimatedTime || 20,
          tags: data.tags || []
        });
      });

      setAvailableQuizzes(quizzes);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cardiology':
        return <Brain className="h-5 w-5" />;
      case 'anatomy':
        return <BookOpen className="h-5 w-5" />;
      case 'usmle':
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  if (selectedQuizId) {
    return <QuizApp quizId={selectedQuizId} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex items-center text-gray-600 bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <Brain className="animate-pulse h-6 w-6 mr-3 text-blue-500" />
          <span className="text-lg font-medium">Loading available quizzes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl p-8 shadow-lg text-center">
          <div className="text-red-500 mb-4">
            <Brain className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Quizzes</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchAvailableQuizzes}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Brain className="h-16 w-16" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Enhanced Quiz Platform</h1>
            <p className="text-purple-100 text-xl">
              Choose from thousands of medical education quizzes with AI-enhanced explanations
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{availableQuizzes.length}</h3>
                <p className="text-gray-600">Available Quizzes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">15+</h3>
                <p className="text-gray-600">Categories</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">AI</h3>
                <p className="text-gray-600">Enhanced</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">20m</h3>
                <p className="text-gray-600">Avg Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Quizzes</h2>
          
          {availableQuizzes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Quizzes Available</h3>
              <p className="text-gray-600 mb-6">
                It looks like no quizzes are currently available. Please check back later.
              </p>
              <button
                onClick={fetchAvailableQuizzes}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedQuizId(quiz.id)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getCategoryIcon(quiz.category)}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-blue-600">
                            {quiz.category}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {quiz.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {quiz.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {quiz.questionCount} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {quiz.estimatedTime} min
                        </span>
                      </div>
                    </div>

                    {quiz.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {quiz.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {quiz.tags.length > 3 && (
                          <span className="text-gray-500 text-xs">
                            +{quiz.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 group"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuizId(quiz.id);
                      }}
                    >
                      <Play className="h-4 w-4" />
                      Start Quiz
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}