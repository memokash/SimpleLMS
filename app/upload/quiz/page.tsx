'use client'
import { useEffect, useState } from "react";
import { useTheme } from '../../components/ThemeContext';
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Quiz, Question } from "../../../types/quiz";
import { Sun, Moon, Upload, Sparkles } from 'lucide-react';

export default function QuizPage() {
  const { isDark, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const snapshot = await getDocs(collection(db, "courses"));
        const quizData = snapshot.docs[0]?.data() as Quiz;
        setQuiz(quizData);
      } catch (error) {
        console.error("Error loading quiz:", error);
      }
    };
    loadQuiz();
  }, []);

  if (!mounted) {
    return null;
  }

  if (!quiz) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      } flex items-center justify-center`}>
        <div className="reactive-tile p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white font-medium">Loading quiz...</p>
        </div>
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
      
      <div className="max-w-2xl mx-auto px-6">
        <div className="reactive-tile p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Upload className="w-8 h-8 text-purple-500" />
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          <h1 className="gradient-title text-3xl mb-6">{quiz.title}</h1>
          <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-xl p-6">
            <p className="text-gray-600 dark:text-gray-300 text-lg">Quiz upload and results feature coming soon! 🚀</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Enhanced quiz creation tools with AI assistance are in development.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
}
