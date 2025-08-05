'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import EnhancedQuizDisplay from './EnhancedQuizDisplay';
import { useRouter } from 'next/navigation';

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

interface QuizProgress {
  answers: number[];
  mode: Mode;
  currentQuestionIndex: number;
  startedAt: Date;
  submittedAt?: Date;
  notes: Record<string, string>;
}

interface Props {
  quizId: string;
}

export default function QuizApp({ quizId }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<Mode>('study');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes default
  const [timerActive, setTimerActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const userKey = user?.uid || 'guest';

  const quizDocRef = doc(db, 'quizProgress', `${userKey}_${quizId}`);

  const fetchProgress = async () => {
    const docSnap = await getDoc(quizDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as QuizProgress;
      setSelectedAnswers(data.answers);
      setMode(data.mode);
      setCurrentQuestionIndex(data.currentQuestionIndex);
      setNotes(data.notes || {});
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    // Replace this with your actual Firestore or API call
    const res = await fetch(`/api/quizzes/${quizId}`);
    const data = await res.json();
    setQuestions(data.questions);
    setLoading(false);
  };

  const autosave = useCallback(() => {
    if (!user) {
      return;
    }
    setDoc(quizDocRef, {
      answers: selectedAnswers,
      mode,
      currentQuestionIndex,
      startedAt: new Date(),
      notes,
    });
  }, [selectedAnswers, mode, currentQuestionIndex, notes, user]);

  useEffect(() => {
    if (!user) {
      return;
    }
    fetchProgress();
  }, [user]);

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  useEffect(() => {
    if (mode === 'test') {
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  }, [mode]);

  useEffect(() => {
    if (!timerActive || isSubmitted) {
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
  }, [timerActive, isSubmitted]);

  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      autosave();
    }, 5000);
    return () => clearInterval(autosaveInterval);
  }, [autosave]);

  const handleAnswerSelect = (index: number) => {
    const updated = [...selectedAnswers];
    updated[currentQuestionIndex] = index;
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
      setIsSubmitted(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setIsSubmitted(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    setTimerActive(false);

    if (user) {
      await setDoc(quizDocRef, {
        answers: selectedAnswers,
        mode,
        currentQuestionIndex,
        startedAt: new Date(),
        submittedAt: new Date(),
        notes,
      });
    }

    alert('Test submitted!');
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setSelectedAnswers([]);
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setTimeLeft(1200);
  };

  if (loading) return <div className="p-6 text-center">Loading quiz...</div>;

  const currentAnswer = selectedAnswers[currentQuestionIndex];

  const showExplanations = mode !== 'test' || isSubmitted;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Mode Switcher */}
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          {(['study', 'test', 'flashcard'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-4 py-2 rounded-md font-semibold ${
                mode === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)} Mode
            </button>
          ))}
        </div>
        {mode === 'test' && (
          <div className="text-sm text-gray-600 font-mono">
            ⏱ Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Quiz Display */}
      <EnhancedQuizDisplay
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        selectedAnswer={currentAnswer}
        showExplanations={showExplanations}
        isSubmitted={isSubmitted}
        onAnswerSelect={handleAnswerSelect}
        onNextQuestion={handleNext}
        onPreviousQuestion={handlePrevious}
      />

      {/* Notes */}
      <div className="mt-4">
        <textarea
          placeholder="Write notes for this question..."
          className="w-full p-4 border rounded-lg shadow-sm"
          rows={5}
          value={notes[questions[currentQuestionIndex]?.id] || ''}
          onChange={(e) => handleNoteChange(e.target.value)}
        />
      </div>

      {/* Submission */}
      {mode === 'test' && currentQuestionIndex === questions.length - 1 && !isSubmitted && (
        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-lg mt-4 hover:bg-green-700 transition"
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
}
