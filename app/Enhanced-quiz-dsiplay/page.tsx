'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import EnhancedQuizDisplay from '../components/EnhancedQuizDisplay';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../components/AuthContext';

interface QuestionData {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  topic?: string;
}

interface QuizSession {
  questions: QuestionData[];
  currentIndex: number;
  answers: Record<string, string>;
  startTime: number;
}

export default function EnhancedQuizDisplayPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized score calculation
  const { correctCount, score } = useMemo(() => {
    if (questions.length === 0) {
      return { correctCount: 0, score: 0 };
    }
    const correct = questions.filter(q => parseInt(selectedAnswers[q.id]) === q.correctAnswer).length;
    return {
      correctCount: correct,
      score: Math.round((correct / questions.length) * 100)
    };
  }, [questions, selectedAnswers]);

  // Memoized function to load new questions
  const loadNewQuestions = useCallback(async (): Promise<QuestionData[]> => {
    try {
      const snapshot = await getDocs(collection(db, 'questionBank'));
      const data = snapshot.docs.map(doc => {
        const raw = doc.data();
        const options = [
          raw['Option (a)'],
          raw['Option (b)'],
          raw['Option (c)'],
          raw['Option (d)'],
          raw['Option (e)'],
        ].filter(Boolean);

        const answerLetter = (raw['Answer'] || '').toLowerCase();
        const answerIndex = { a: 0, b: 1, c: 2, d: 3, e: 4 }[answerLetter] ?? -1;

        return {
          id: doc.id,
          question: raw['Question'],
          options,
          correctAnswer: answerIndex,
          topic: raw['Category'] || 'General'
        };
      }) as QuestionData[];

      // Shuffle questions
      return [...data].sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error('Error loading questions:', error);
      throw new Error('Failed to load questions');
    }
  }, []);

  // Memoized function to save progress
  const saveProgress = useCallback(async (session: Partial<QuizSession>) => {
    if (!user || showResults) {
      return;
    }

    try {
      await setDoc(doc(db, 'quizSessions', user.uid), {
        questions,
        currentIndex: currentQuestionIndex,
        answers: selectedAnswers,
        startTime,
        ...session
      });
    } catch (error) {
      console.error('Error saving progress:', error);
      // Don't throw here to avoid interrupting quiz flow
    }
  }, [user, questions, currentQuestionIndex, selectedAnswers, startTime, showResults]);

  // Memoized function to save results
  const saveResults = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const topics = questions.map(q => q.topic || 'General');
      const duration = Math.floor((Date.now() - startTime) / 1000);

      await setDoc(doc(db, 'quizResults', `${user.uid}_${Date.now()}`), {
        userId: user.uid,
        timestamp: new Date().toISOString(),
        score,
        correctCount,
        totalQuestions: questions.length,
        duration,
        answers: selectedAnswers,
        topics,
      });
    } catch (error) {
      console.error('Error saving results:', error);
      // Could show user notification here
    }
  }, [user, questions, startTime, score, correctCount, selectedAnswers]);

  // Initial load effect
  useEffect(() => {
    const initializeQuiz = async () => {
      if (!user) {
        return;
      }

      try {
        setError(null);
        
        // Try to load last session
        const lastResultRef = doc(db, 'quizSessions', user.uid);
        const snapshot = await getDoc(lastResultRef);

        if (snapshot.exists()) {
          const data = snapshot.data() as QuizSession;
          if (confirm('Resume your last quiz?')) {
            setQuestions(data.questions);
            setSelectedAnswers(data.answers || {});
            setCurrentQuestionIndex(data.currentIndex || 0);
            setStartTime(data.startTime || Date.now());
            setLoading(false);
            return;
          }
        }

        // Load new questions
        const newQuestions = await loadNewQuestions();
        setQuestions(newQuestions);
        setStartTime(Date.now());
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        
      } catch (error) {
        console.error('Error initializing quiz:', error);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeQuiz();
  }, [user, loadNewQuestions]);

  // Progress saving effect
  useEffect(() => {
    if (questions.length === 0 || showResults) {
      return;
    }

    const timeoutId = setTimeout(() => {
      saveProgress({});
    }, 500); // Debounce saves

    return () => clearTimeout(timeoutId);
  }, [currentQuestionIndex, selectedAnswers, saveProgress, questions.length, showResults]);

  // Results saving effect
  useEffect(() => {
    if (showResults) {
      saveResults();
    }
  }, [showResults, saveResults]);

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    const question = questions[currentQuestionIndex];
    if (!question) {
      return;
    }

    setSelectedAnswers(prev => ({ 
      ...prev, 
      [question.id]: answerIndex.toString() 
    }));

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  }, [questions, currentQuestionIndex]);

  // Reset quiz function
  const resetQuiz = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const newQuestions = await loadNewQuestions();
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowResults(false);
      setStartTime(Date.now());
    } catch (error) {
      setError('Failed to reset quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [loadNewQuestions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center py-12 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          Loading questions...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-red-50 dark:bg-red-900/20 p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2 text-red-600">Error</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={resetQuiz}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-4">Quiz Completed</h2>
          <div className="mb-4">
            <span className="text-lg text-gray-600 dark:text-gray-300">You scored </span>
            <span className="font-bold text-indigo-600 text-2xl">{score}%</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {correctCount} out of {questions.length} correct
          </p>
          <button
            onClick={resetQuiz}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Take New Quiz
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {questions.map((q, index) => {
            const userAnswer = parseInt(selectedAnswers[q.id]);
            const isCorrect = userAnswer === q.correctAnswer;
            
            return (
              <div key={q.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                <div className="space-y-1">
                  <p className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                    Your Answer: {q.options[userAnswer] || '—'} 
                    {isCorrect ? ' ✓' : ' ✗'}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-green-600">
                      Correct Answer: {q.options[q.correctAnswer]}
                    </p>
                  )}
                  {q.topic && (
                    <p className="text-xs text-gray-500">Topic: {q.topic}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <EnhancedQuizDisplay
      questions={questions}
      currentQuestionIndex={currentQuestionIndex}
      onAnswerSelect={handleAnswerSelect}
    />
  );
}