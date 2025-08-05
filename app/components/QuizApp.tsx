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
  NotebookText,
  Timer,
  BarChart3,
  Sparkles,
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
    let baseClass = "p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ";
    
    if (!isSubmitted) {
      if (isSelectedAnswer(optionIndex)) {
        baseClass += "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 transform scale-[1.02]";
      } else {
        baseClass += "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-[1.01]";
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
      return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />;
    } else if (isSelectedAnswer(optionIndex)) {
      return <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />;
    }
    return null;
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
      green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
      purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
      orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
    };
    return colorMap[color] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
  };

  // Section Separator Component
  const SectionSeparator = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
    <div className="relative my-12">
      <div className="absolute inset-0 flex items-center">
        <div className={`w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent dark:via-yellow-400/60 rounded-full`}></div>
      </div>
      <div className="relative flex justify-center">
        <div className={`px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-yellow-500/30 shadow-lg dark:shadow-yellow-500/20`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${getColorClasses(color)}`}>
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
        </div>
      </div>
    </div>
  );

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
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg mb-8">
          <div className="flex flex-wrap gap-4">
            {(['study', 'test', 'flashcard'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 text-lg ${
                  mode === m
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 hover:shadow-md'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)} Mode
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-6">
            {mode === 'test' && (
              <div className="flex items-center text-base font-mono bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 px-6 py-3 rounded-2xl">
                <Timer className="h-5 w-5 mr-3 text-red-500" />
                <span className="font-bold text-red-600 dark:text-red-400 text-xl">{formatTime(timeLeft)}</span>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="p-4 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-yellow-500/30 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-yellow-500/20"
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

        {/* Quiz Progress Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-8 mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Brain className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h1>
                {currentQuestion.category && (
                  <div className="flex items-center gap-4 text-lg text-blue-100">
                    <span className="bg-white/20 px-4 py-2 rounded-full">{currentQuestion.category}</span>
                    {hasEnhancedExplanations && (
                      <span className="flex items-center bg-yellow-400/20 px-4 py-2 rounded-full">
                        <Zap className="h-5 w-5 mr-2" />
                        AI Enhanced
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg text-blue-100 mb-3 font-semibold">Progress</div>
              <div className="w-48 bg-white/20 rounded-full h-4 overflow-hidden mb-2">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
              <div className="text-sm text-blue-200 font-medium">
                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% complete
              </div>
            </div>
          </div>
        </div>

        {/* Question Section */}
        <SectionSeparator title="Question" icon={Target} color="blue" />
        
        <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 overflow-hidden shadow-lg mb-8">
          <div className="p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={getOptionClassName(index)}
                  onClick={() => !isSubmitted && handleAnswerSelect(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-300">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-lg font-medium">{option}</span>
                    </div>
                    {getOptionIcon(index)}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Previous
              </button>
              
              <div className="flex items-center space-x-3 text-base text-gray-500 dark:text-gray-400">
                <Clock className="h-5 w-5" />
                <span>Take your time to review</span>
              </div>
              
              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Explanations */}
        {showExplanations && isSubmitted && (
          <>
            <SectionSeparator title="Explanations" icon={Lightbulb} color="green" />
            
            <div className="space-y-6 mb-8">
              {/* Correct Answer Explanation */}
              {currentQuestion.correctExplanation && (
                <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-green-200 dark:border-green-700 overflow-hidden shadow-lg">
                  <div 
                    className="bg-green-50 dark:bg-green-900/30 p-6 cursor-pointer flex items-center justify-between"
                    onClick={() => setExpandedExplanation(expandedExplanation === 'correct' ? null : 'correct')}
                  >
                    <div className="flex items-center space-x-4">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <h4 className="font-bold text-green-900 dark:text-green-100 text-lg">Why This Answer is Correct</h4>
                      {hasEnhancedExplanations && (
                        <span className="text-sm bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-3 py-1 rounded-full font-medium">
                          AI Enhanced
                        </span>
                      )}
                    </div>
                    {expandedExplanation === 'correct' ? 
                      <ChevronUp className="h-6 w-6 text-green-600 dark:text-green-400" /> : 
                      <ChevronDown className="h-6 w-6 text-green-600 dark:text-green-400" />
                    }
                  </div>
                  
                  {expandedExplanation === 'correct' && (
                    <div className="p-6 bg-white dark:bg-gray-800 border-t border-green-200 dark:border-green-700">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                        {currentQuestion.correctExplanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Incorrect Answer Explanation */}
              {currentQuestion.incorrectExplanation && (
                <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-red-200 dark:border-red-700 overflow-hidden shadow-lg">
                  <div 
                    className="bg-red-50 dark:bg-red-900/30 p-6 cursor-pointer flex items-center justify-between"
                    onClick={() => setExpandedExplanation(expandedExplanation === 'incorrect' ? null : 'incorrect')}
                  >
                    <div className="flex items-center space-x-4">
                      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                      <h4 className="font-bold text-red-900 dark:text-red-100 text-lg">Why Other Options are Incorrect</h4>
                      {hasEnhancedExplanations && (
                        <span className="text-sm bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded-full font-medium">
                          AI Enhanced
                        </span>
                      )}
                    </div>
                    {expandedExplanation === 'incorrect' ? 
                      <ChevronUp className="h-6 w-6 text-red-600 dark:text-red-400" /> : 
                      <ChevronDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                    }
                  </div>
                  
                  {expandedExplanation === 'incorrect' && (
                    <div className="p-6 bg-white dark:bg-gray-800 border-t border-red-200 dark:border-red-700">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                        {currentQuestion.incorrectExplanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Teaching Elements */}
              {hasEnhancedExplanations && currentQuestion.teachingElements && (
                <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-purple-200 dark:border-purple-700 overflow-hidden shadow-lg">
                  <div 
                    className="bg-purple-50 dark:bg-purple-900/30 p-6 cursor-pointer flex items-center justify-between"
                    onClick={() => setShowTeachingElements(!showTeachingElements)}
                  >
                    <div className="flex items-center space-x-4">
                      <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      <h4 className="font-bold text-purple-900 dark:text-purple-100 text-lg">Advanced Teaching Material</h4>
                      <span className="text-sm bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full font-medium">
                        AI Generated
                      </span>
                    </div>
                    {showTeachingElements ? 
                      <ChevronUp className="h-6 w-6 text-purple-600 dark:text-purple-400" /> : 
                      <ChevronDown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    }
                  </div>
                  
                  {showTeachingElements && (
                    <div className="p-6 bg-white dark:bg-gray-800 border-t border-purple-200 dark:border-purple-700">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Analogies */}
                        {currentQuestion.teachingElements.analogies && (
                          <div className="space-y-4">
                            <h5 className="font-bold text-gray-900 dark:text-gray-100 flex items-center text-lg">
                              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                              Analogies
                            </h5>
                            <ul className="space-y-3">
                              {currentQuestion.teachingElements.analogies.map((analogy, index) => (
                                <li key={index} className="text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl border border-yellow-200 dark:border-yellow-700">
                                  {analogy}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Mnemonics */}
                        {currentQuestion.teachingElements.mnemonics && (
                          <div className="space-y-4">
                            <h5 className="font-bold text-gray-900 dark:text-gray-100 flex items-center text-lg">
                              <Brain className="h-5 w-5 mr-2 text-blue-500" />
                              Memory Aids
                            </h5>
                            <ul className="space-y-3">
                              {currentQuestion.teachingElements.mnemonics.map((mnemonic, index) => (
                                <li key={index} className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-700 font-mono">
                                  {mnemonic}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Clinical Examples */}
                        {currentQuestion.teachingElements.examples && (
                          <div className="space-y-4">
                            <h5 className="font-bold text-gray-900 dark:text-gray-100 flex items-center text-lg">
                              <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                              Clinical Examples
                            </h5>
                            <ul className="space-y-3">
                              {currentQuestion.teachingElements.examples.map((example, index) => (
                                <li key={index} className="text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/30 p-4 rounded-xl border border-green-200 dark:border-green-700">
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
                <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-3xl p-6">
                  <div className="flex items-start space-x-4">
                    <Award className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                      <h5 className="font-bold text-blue-900 dark:text-blue-100 mb-2 text-lg">AI-Enhanced Learning Experience</h5>
                      <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                        This explanation has been enhanced using advanced AI to provide comprehensive teaching material.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Notes Section */}
        <SectionSeparator title="Your Notes" icon={NotebookText} color="purple" />
        
        <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 p-8 shadow-lg mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-xl ${getColorClasses('purple')}`}>
              <NotebookText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notes for this question</h3>
          </div>
          <textarea
            placeholder="Write your notes and thoughts about this question..."
            className="w-full p-6 border border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md text-lg"
            rows={5}
            value={notes[currentQuestion.id] || ''}
            onChange={(e) => handleNoteChange(e.target.value)}
          />
        </div>

        {/* Submission Button */}
        {mode === 'test' && currentQuestionIndex === questions.length - 1 && !isSubmitted && (
          <div className="text-center">
            <button
              onClick={handleSubmit}
              className="px-12 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-3xl font-bold text-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🎯 Submit Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}