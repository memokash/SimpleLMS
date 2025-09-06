"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../components/AuthContext';
import {
  Brain, Clock, CheckCircle, XCircle, ChevronRight, ChevronLeft,
  Lightbulb, Award, TrendingUp, AlertCircle, BookOpen, RefreshCw,
  Play, Home, BarChart3
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
  correctExplanation?: string;
  incorrectExplanation?: string;
  hintMessage?: string;
  category?: string;
}

interface QuizState {
  currentQuestion: number;
  answers: Record<number, number>;
  showExplanation: boolean;
  isComplete: boolean;
  score: number;
  startTime: Date;
  endTime?: Date;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    answers: {},
    showExplanation: false,
    isComplete: false,
    score: 0,
    startTime: new Date()
  });

  // Load quiz from Firebase courses collection
  useEffect(() => {
    const loadQuiz = async () => {
      if (!quizId) return;
      
      try {
        setLoading(true);
        setError(null);

        // First try courses collection (where the 15K+ quizzes are)
        const courseDoc = await getDoc(doc(db, 'courses', quizId));
        
        if (courseDoc.exists()) {
          const quizData = courseDoc.data();
          setQuiz({
            id: courseDoc.id,
            title: quizData.title || quizData.courseName || 'Medical Quiz',
            description: quizData.description || 'Test your medical knowledge',
            ...quizData
          });

          // Load questions from subcollection
          const questionsRef = collection(db, 'courses', quizId, 'questions');
          const questionsSnapshot = await getDocs(questionsRef);
          
          const loadedQuestions: Question[] = [];
          questionsSnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Parse options from the Firebase structure
            const options: string[] = [];
            const optionLetters = ['a', 'b', 'c', 'd', 'e'];
            
            optionLetters.forEach(letter => {
              const optionKey = `Option (${letter})`;
              if (data[optionKey] && data[optionKey] !== 'NaN') {
                options.push(data[optionKey]);
              }
            });

            // Find correct answer index
            const answerLetter = data.Answer?.toLowerCase();
            let correctIndex = 0;
            if (answerLetter) {
              correctIndex = optionLetters.indexOf(answerLetter);
              if (correctIndex === -1) correctIndex = 0;
            }

            if (options.length > 0) {
              loadedQuestions.push({
                id: doc.id,
                question: data.Question || 'No question text',
                options,
                correct: correctIndex,
                correctExplanation: data.CorrectExplanation || data['Correct Answer Message'],
                incorrectExplanation: data.IncorrectExplanation || data['Incorrect Answer Message'],
                hintMessage: data['Hint Message'],
                category: data.Category || 'General'
              });
            }
          });

          setQuestions(loadedQuestions.sort((a, b) => a.id.localeCompare(b.id)));
        } else {
          setError('Quiz not found. Please check the quiz ID.');
        }
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  const handleAnswer = (answerIndex: number) => {
    if (quizState.showExplanation) return;
    
    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [prev.currentQuestion]: answerIndex },
      showExplanation: true
    }));
  };

  const handleNext = () => {
    if (quizState.currentQuestion < questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        showExplanation: false
      }));
    } else {
      // Complete quiz
      const correctAnswers = Object.entries(quizState.answers).filter(
        ([index, answer]) => questions[parseInt(index)].correct === answer
      ).length;
      
      setQuizState(prev => ({
        ...prev,
        isComplete: true,
        score: (correctAnswers / questions.length) * 100,
        endTime: new Date()
      }));

      // Save progress if user is logged in
      if (user) {
        saveProgress(correctAnswers);
      }
    }
  };

  const handlePrevious = () => {
    if (quizState.currentQuestion > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
        showExplanation: false
      }));
    }
  };

  const saveProgress = async (correctAnswers: number) => {
    if (!user) return;
    
    try {
      await setDoc(doc(db, 'users', user.uid, 'quizProgress', quizId), {
        quizId,
        quizTitle: quiz?.title,
        completedAt: new Date(),
        score: (correctAnswers / questions.length) * 100,
        totalQuestions: questions.length,
        correctAnswers,
        timeSpent: Math.round((quizState.endTime?.getTime() || Date.now() - quizState.startTime.getTime()) / 1000)
      });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Quiz</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/courses')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Questions Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">This quiz doesn't have any questions yet.</p>
          <button
            onClick={() => router.push('/courses')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[quizState.currentQuestion];
  const userAnswer = quizState.answers[quizState.currentQuestion];
  const isCorrect = userAnswer === currentQ.correct;

  if (quizState.isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Quiz Complete!</h1>
            
            <div className="grid grid-cols-2 gap-4 my-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {quizState.score.toFixed(1)}%
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Correct</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Object.entries(quizState.answers).filter(
                    ([idx, ans]) => questions[parseInt(idx)].correct === ans
                  ).length} / {questions.length}
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/courses')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Courses
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/courses')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Home className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{quiz?.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Question {quizState.currentQuestion + 1} of {questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round((Date.now() - quizState.startTime.getTime()) / 60000)} min
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((quizState.currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Question */}
          <div className="mb-8">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {quizState.currentQuestion + 1}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {currentQ.question}
                </h2>
                {currentQ.hintMessage && !quizState.showExplanation && (
                  <div className="flex items-start space-x-2 mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">{currentQ.hintMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQ.options.map((option, index) => {
              const isSelected = userAnswer === index;
              const showResult = quizState.showExplanation;
              const isCorrectOption = index === currentQ.correct;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={quizState.showExplanation}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 
                    ${!showResult ? (
                      isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 
                      'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    ) : (
                      isCorrectOption ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                      isSelected ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                      'border-gray-200 dark:border-gray-600 opacity-50'
                    )}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-white">{option}</span>
                    {showResult && (
                      isCorrectOption ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                      isSelected ? <XCircle className="w-5 h-5 text-red-600" /> : null
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {quizState.showExplanation && (
            <div className={`p-4 rounded-lg mb-8 ${
              isCorrect ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
              'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start space-x-3">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                )}
                <div>
                  <p className={`font-semibold mb-2 ${
                    isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {isCorrect ? currentQ.correctExplanation : currentQ.incorrectExplanation}
                  </p>
                  {!isCorrect && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      The correct answer is: <span className="font-semibold">{currentQ.options[currentQ.correct]}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={quizState.currentQuestion === 0}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={userAnswer === undefined}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {quizState.currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}