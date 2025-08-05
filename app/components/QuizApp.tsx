'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
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
  NotebookText
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
  const { isDark, toggleTheme } = useTheme();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<Mode>('study');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes default
  const [timerActive, setTimerActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedExplanation, setExpandedExplanation] = useState<'correct' | 'incorrect' | null>(null);
  const [showTeachingElements, setShowTeachingElements] = useState(false);

  const userKey = user?.uid || 'guest';
  const quizDocRef = doc(db, 'quizProgress', `${userKey}_${quizId}`);
  const currentQuestion = questions[currentQuestionIndex];

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

  useEffect(() => {
    setExpandedExplanation(null);
    setShowTeachingElements(false);
  }, [currentQuestionIndex]);

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isCorrectAnswer = (optionIndex: number) => optionIndex === currentQuestion?.correctAnswer;
  const isSelectedAnswer = (optionIndex: number) => optionIndex === selectedAnswers[currentQuestionIndex];
  const hasEnhancedExplanations = currentQuestion?.explanationEnhancedBy === 'openai';
  const showExplanations = mode !== 'test' || isSubmitted;

  const getOptionClassName = (optionIndex: number) => {
    let baseClass = "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ";
    
    if (!isSubmitted) {
      if (isSelectedAnswer(optionIndex)) {
        baseClass += "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100";
      } else {
        baseClass += "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700";
      }
    } else if (isCorrectAnswer(optionIndex)) {
      baseClass += "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100";
    } else if (isSelectedAnswer(optionIndex) && !isCorrectAnswer(optionIndex)) {
      baseClass += "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-100";
    } else {
      baseClass += "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
    }
    
    return baseClass;
  };

  const getOptionIcon = (optionIndex: number) => {
    if (!isSubmitted) {
      return null;
    }
    
    if (isCorrectAnswer(optionIndex)) {
      return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
    } else if (isSelectedAnswer(optionIndex)) {
      return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="flex items-center text-gray-600 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <Brain className="animate-pulse h-6 w-6 mr-3 text-blue-500" />
          <span className="text-lg font-medium">Loading quiz...</span>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-8 shadow-lg">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600 dark:text-gray-400 text-lg">No question available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
          <div className="flex flex-wrap gap-3">
            {(['study', 'test', 'flashcard'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  mode === m
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 hover:shadow-md'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)} Mode
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            {mode === 'test' && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-mono bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 px-4 py-2 rounded-xl">
                <Clock className="h-4 w-4 mr-2 text-red-500" />
                <span className="font-bold text-red-600 dark:text-red-400">{formatTime(timeLeft)}</span>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="p-3 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Quiz Content */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
          
          {/* Question Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Brain className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </h2>
                  {currentQuestion.category && (
                    <div className="flex items-center space-x-4 text-sm text-blue-100">
                      <span className="bg-white/20 px-2 py-1 rounded-full">{currentQuestion.category}</span>
                      {hasEnhancedExplanations && (
                        <span className="flex items-center bg-yellow-400/20 px-3 py-1 rounded-full">
                          <Zap className="h-4 w-4 mr-1" />
                          AI Enhanced
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-blue-100 mb-2">Progress</div>
                <div className="w-40 bg-white/20 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-blue-200 mt-1">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% complete
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={getOptionClassName(index)}
                  onClick={() => !isSubmitted && handleAnswerSelect(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-sm font-medium">{option}</span>
                    </div>
                    {getOptionIcon(index)}
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Explanations */}
            {showExplanations && isSubmitted && (
              <div className="space-y-4">
                {/* Correct Answer Explanation */}
                {currentQuestion.correctExplanation && (
                  <div className="border border-green-200 dark:border-green-700 rounded-lg overflow-hidden">
                    <div 
                      className="bg-green-50 dark:bg-green-900/30 p-4 cursor-pointer flex items-center justify-between"
                      onClick={() => setExpandedExplanation(expandedExplanation === 'correct' ? null : 'correct')}
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <h4 className="font-semibold text-green-900 dark:text-green-100">Why This Answer is Correct</h4>
                        {hasEnhancedExplanations && (
                          <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                            AI Enhanced
                          </span>
                        )}
                      </div>
                      {expandedExplanation === 'correct' ? 
                        <ChevronUp className="h-5 w-5 text-green-600 dark:text-green-400" /> : 
                        <ChevronDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                      }
                    </div>
                    
                    {expandedExplanation === 'correct' && (
                      <div className="p-4 bg-white dark:bg-gray-800 border-t border-green-200 dark:border-green-700">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {currentQuestion.correctExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Incorrect Answer Explanation */}
                {currentQuestion.incorrectExplanation && (
                  <div className="border border-red-200 dark:border-red-700 rounded-lg overflow-hidden">
                    <div 
                      className="bg-red-50 dark:bg-red-900/30 p-4 cursor-pointer flex items-center justify-between"
                      onClick={() => setExpandedExplanation(expandedExplanation === 'incorrect' ? null : 'incorrect')}
                    >
                      <div className="flex items-center space-x-3">
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <h4 className="font-semibold text-red-900 dark:text-red-100">Why Other Options are Incorrect</h4>
                        {hasEnhancedExplanations && (
                          <span className="text-xs bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
                            AI Enhanced
                          </span>
                        )}
                      </div>
                      {expandedExplanation === 'incorrect' ? 
                        <ChevronUp className="h-5 w-5 text-red-600 dark:text-red-400" /> : 
                        <ChevronDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                      }
                    </div>
                    
                    {expandedExplanation === 'incorrect' && (
                      <div className="p-4 bg-white dark:bg-gray-800 border-t border-red-200 dark:border-red-700">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {currentQuestion.incorrectExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Teaching Elements */}
                {hasEnhancedExplanations && currentQuestion.teachingElements && (
                  <div className="border border-purple-200 dark:border-purple-700 rounded-lg overflow-hidden">
                    <div 
                      className="bg-purple-50 dark:bg-purple-900/30 p-4 cursor-pointer flex items-center justify-between"
                      onClick={() => setShowTeachingElements(!showTeachingElements)}
                    >
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100">Advanced Teaching Material</h4>
                        <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                          AI Generated
                        </span>
                      </div>
                      {showTeachingElements ? 
                        <ChevronUp className="h-5 w-5 text-purple-600 dark:text-purple-400" /> : 
                        <ChevronDown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      }
                    </div>
                    
                    {showTeachingElements && (
                      <div className="p-4 bg-white dark:bg-gray-800 border-t border-purple-200 dark:border-purple-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Analogies */}
                          {currentQuestion.teachingElements.analogies && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                                <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
                                Analogies
                              </h5>
                              <ul className="space-y-1">
                                {currentQuestion.teachingElements.analogies.map((analogy, index) => (
                                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded">
                                    {analogy}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Mnemonics */}
                          {currentQuestion.teachingElements.mnemonics && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                                <Brain className="h-4 w-4 mr-1 text-blue-500" />
                                Memory Aids
                              </h5>
                              <ul className="space-y-1">
                                {currentQuestion.teachingElements.mnemonics.map((mnemonic, index) => (
                                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/30 p-2 rounded font-mono">
                                    {mnemonic}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Clinical Examples */}
                          {currentQuestion.teachingElements.examples && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                                <BookOpen className="h-4 w-4 mr-1 text-green-500" />
                                Clinical Examples
                              </h5>
                              <ul className="space-y-1">
                                {currentQuestion.teachingElements.examples.map((example, index) => (
                                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/30 p-2 rounded">
                                    {example}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Enhancement Information */}
                {hasEnhancedExplanations && (
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Award className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">AI-Enhanced Learning Experience</h5>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          This explanation has been enhanced using advanced AI to provide comprehensive teaching material.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Take your time to review the explanations</span>
              </div>
              
              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/50 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <NotebookText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notes for this question</h3>
          </div>
          <textarea
            placeholder="Write your notes and thoughts about this question..."
            className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
            rows={4}
            value={notes[currentQuestion.id] || ''}
            onChange={(e) => handleNoteChange(e.target.value)}
          />
        </div>

        {/* Submission Button */}
        {mode === 'test' && currentQuestionIndex === questions.length - 1 && !isSubmitted && (
          <div className="text-center">
            <button
              onClick={handleSubmit}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🎯 Submit Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}