// app/components/QuizApp.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import EnhancedQuizDisplay from './EnhancedQuizDisplay';
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  BookOpen,
  Brain,
  GraduationCap,
  Clock,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  Sun,
  Moon,
  Target,
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  FileText,
  Timer,
  BarChart3,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Home
} from 'lucide-react';

type Mode = 'study' | 'test' | 'flashcard';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  correctExplanation?: string;
  incorrectExplanation?: string;
  category?: string;
  explanationEnhancedBy?: string;
  teachingElements?: {
    analogies?: string[];
    mnemonics?: string[];
    examples?: string[];
  };
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[];
  difficulty: string;
  estimatedTime: number;
  tags: string[];
}

interface QuizProgress {
  answers: number[];
  mode: Mode;
  currentQuestionIndex: number;
  startedAt: Date;
  submittedAt?: Date;
  notes: Record<string, string>;
  score?: number;
  completed?: boolean;
}

interface Props {
  quizId: string;
}

export default function QuizApp({ quizId }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  // Quiz data state
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<Mode>('study');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes default
  const [timerActive, setTimerActive] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const userKey = user?.uid || 'guest';
  const quizProgressDocRef = doc(db, 'quizProgress', `${userKey}_${quizId}`);
  const currentQuestion = questions[currentQuestionIndex];

  // Fetch quiz data from Firebase
  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError(null);

      const quizDocRef = doc(db, 'quizzes', quizId);
      const quizSnapshot = await getDoc(quizDocRef);

      if (!quizSnapshot.exists()) {
        throw new Error('Quiz not found');
      }

      const quizData = quizSnapshot.data() as QuizData;
      quizData.id = quizSnapshot.id;

      setQuizData(quizData);
      setQuestions(quizData.questions || []);
      setTimeLeft(quizData.estimatedTime * 60 || 1200); // Convert minutes to seconds

    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved progress
  const fetchProgress = async () => {
    if (!user) {
      return;
    }

    try {
      const docSnap = await getDoc(quizProgressDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as QuizProgress;
        setSelectedAnswers(data.answers || []);
        setMode(data.mode || 'study');
        setCurrentQuestionIndex(data.currentQuestionIndex || 0);
        setNotes(data.notes || {});
        setQuizCompleted(data.completed || false);
        
        if (data.completed) {
          setIsSubmitted(true);
        }
      }
    } catch (err) {
      console.warn('Could not load progress:', err);
    }
  };

  // Auto-save progress
  const autosave = useCallback(async () => {
    if (!user || !quizData) {
      return;
    }

    try {
      const progressData: QuizProgress = {
        answers: selectedAnswers,
        mode,
        currentQuestionIndex,
        startedAt: new Date(),
        notes,
        completed: quizCompleted
      };

      if (quizCompleted) {
        progressData.submittedAt = new Date();
        progressData.score = calculateScore();
      }

      await setDoc(quizProgressDocRef, progressData);
    } catch (err) {
      console.warn('Auto-save failed:', err);
    }
  }, [selectedAnswers, mode, currentQuestionIndex, notes, quizCompleted, user, quizData]);

  // Calculate score
  const calculateScore = () => {
    if (questions.length === 0) {
      return 0;
    }
    
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === questions[index]?.correctAnswer) {
        correct++;
      }
    });
    
    return Math.round((correct / questions.length) * 100);
  };

  // Initialize component
  useEffect(() => {
    setMounted(true);
    fetchQuizData();
  }, [quizId]);

  // Load progress after quiz data is loaded
  useEffect(() => {
    if (quizData && user) {
      fetchProgress();
    }
  }, [quizData, user]);

  // Timer logic
  useEffect(() => {
    if (mode === 'test' && !quizCompleted) {
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  }, [mode, quizCompleted]);

  useEffect(() => {
    if (!timerActive || quizCompleted) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleSubmit();
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, quizCompleted]);

  // Auto-save interval
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      autosave();
    }, 5000);
    return () => clearInterval(autosaveInterval);
  }, [autosave]);

  // Event handlers
  const handleAnswerSelect = (answerIndex: number) => {
    const updated = [...selectedAnswers];
    updated[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(updated);

    if (mode === 'study') {
      setIsSubmitted(true);
    }
  };

  const handleNoteChange = (value: string) => {
    const questionId = questions[currentQuestionIndex]?.id;
    if (!questionId) {
      return;
    }

    const updated = { ...notes, [questionId]: value };
    setNotes(updated);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setIsSubmitted(mode === 'study' && selectedAnswers[currentQuestionIndex + 1] !== undefined);
    } else if (mode !== 'test') {
      // Allow immediate completion for study mode
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setIsSubmitted(mode === 'study' && selectedAnswers[currentQuestionIndex - 1] !== undefined);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    setQuizCompleted(true);
    setTimerActive(false);

    if (user) {
      await autosave();
    }

    // Show completion message
    alert(`Quiz completed! Your score: ${calculateScore()}%`);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setSelectedAnswers([]);
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setQuizCompleted(false);
    setTimeLeft(quizData?.estimatedTime ? quizData.estimatedTime * 60 : 1200);
  };

  const retryQuiz = () => {
    setSelectedAnswers([]);
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setQuizCompleted(false);
    setNotes({});
    setTimeLeft(quizData?.estimatedTime ? quizData.estimatedTime * 60 : 1200);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render until mounted (prevents SSR issues)
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="flex items-center text-gray-600 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <Brain className="animate-pulse h-6 w-6 mr-3 text-blue-500" />
          <span className="text-lg font-medium">Loading quiz...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Quiz Loading Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <button
                onClick={fetchQuizData}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <button
                onClick={() => router.back()}
                className="btn-outline w-full flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-8 shadow-lg">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600 dark:text-gray-400 text-lg mb-4">No questions available in this quiz</div>
          <button
            onClick={() => router.back()}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Quiz completion screen
  if (quizCompleted && mode === 'test') {
    const score = calculateScore();
    const answeredQuestions = selectedAnswers.filter(a => a !== undefined).length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="medical-card p-8 text-center">
            <div className="mb-8">
              <Award className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Quiz Completed!
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {quizData?.title}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="color-internal rounded-2xl p-6">
                <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {score}%
                </h3>
                <p className="text-blue-800 dark:text-blue-300">Final Score</p>
              </div>
              
              <div className="color-surgery rounded-2xl p-6">
                <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {answeredQuestions}/{questions.length}
                </h3>
                <p className="text-green-800 dark:text-green-300">Questions Answered</p>
              </div>
              
              <div className="color-neurology rounded-2xl p-6">
                <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {quizData?.category}
                </h3>
                <p className="text-purple-800 dark:text-purple-300">Category</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={retryQuiz}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                Retake Quiz
              </button>
              
              <button
                onClick={() => router.push('/enhanced-quiz-display')}
                className="btn-outline"
              >
                Choose Another Quiz
              </button>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Home className="h-5 w-5" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 glass rounded-3xl p-8 shadow-lg mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {quizData?.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {quizData?.category} • {questions.length} questions
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {(['study', 'test', 'flashcard'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  disabled={quizCompleted}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                    mode === m
                      ? 'btn-primary'
                      : 'btn-outline'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)} Mode
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {mode === 'test' && !quizCompleted && (
              <div className="flex items-center text-base font-mono bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 px-6 py-3 rounded-2xl">
                <Timer className="h-5 w-5 mr-3 text-red-500" />
                <span className="font-bold text-red-600 dark:text-red-400 text-xl">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-4 glass-strong rounded-2xl hover-glow transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-6 w-6 text-yellow-500" />
              ) : (
                <Moon className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Quiz Display Component */}
        <EnhancedQuizDisplay
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          selectedAnswer={selectedAnswers[currentQuestionIndex]}
          showExplanations={mode !== 'test' || isSubmitted || quizCompleted}
          isSubmitted={isSubmitted || quizCompleted}
          onAnswerSelect={handleAnswerSelect}
          onNextQuestion={handleNext}
          onPreviousQuestion={handlePrevious}
        />

        {/* Notes Section */}
        <div className="glass rounded-3xl p-8 shadow-lg mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Notes for this question
            </h3>
          </div>
          <textarea
            placeholder="Write your notes and thoughts about this question..."
            className="input-field text-lg"
            rows={4}
            value={notes[currentQuestion.id] || ''}
            onChange={(e) => handleNoteChange(e.target.value)}
          />
        </div>

        {/* Submission Button for Test Mode */}
        {mode === 'test' && !quizCompleted && currentQuestionIndex === questions.length - 1 && selectedAnswers[currentQuestionIndex] !== undefined && (
          <div className="text-center mt-8">
            <button
              onClick={handleSubmit}
              className="btn-secondary px-12 py-5 rounded-3xl font-bold text-xl hover-lift"
            >
              🎯 Submit Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}