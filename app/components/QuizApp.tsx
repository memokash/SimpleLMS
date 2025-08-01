"use client";

import React, { useState, useEffect } from 'react';
import { getQuizMetadata, getQuizQuestions } from '../../lib/firebase';

interface QuizAppProps {
  quizId: string;
}

const QuizApp = ({ quizId }: QuizAppProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number | 'full'>('full');

  useEffect(() => {
    // Get question count from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const countParam = urlParams.get('count');
    
    if (countParam && countParam !== 'full') {
      setQuestionCount(parseInt(countParam, 10));
    } else {
      setQuestionCount('full');
    }
  }, []);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const currentQuizId = quizId || 'MSQ Quiz 4';
        
        const [metadata, allQuestions] = await Promise.all([
          getQuizMetadata(currentQuizId),
          getQuizQuestions(currentQuizId)
        ]);

        if (!metadata || allQuestions.length === 0) {
          setError('Quiz not found or has no questions');
          return;
        }

        // Limit questions based on questionCount
        let questionsToUse = allQuestions;
        if (questionCount !== 'full' && typeof questionCount === 'number') {
          // Randomly select questions for variety
          const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
          questionsToUse = shuffled.slice(0, Math.min(questionCount, allQuestions.length));
        }

        setQuizData({
          title: metadata.NewTitle || metadata.CourseName || 'Quiz',
          description: metadata.BriefDescription || 'Test your knowledge',
          questions: questionsToUse,
          totalAvailable: allQuestions.length
        });
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    if (questionCount !== null) {
      loadQuiz();
    }
  }, [quizId, questionCount]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    quizData.questions.forEach((question: any, index: number) => {
      if (selectedAnswers[index] === question.correct) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz: {quizId}</p>
          {questionCount !== 'full' && (
            <p className="text-sm text-gray-500 mt-2">Preparing {questionCount} questions...</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Quiz</h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Quiz ID: {quizId}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <p className="text-gray-600">No quiz data found for: {quizId}</p>
        </div>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  if (showResults) {
    const percentage = Math.round((score / quizData.questions.length) * 100);
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 text-6xl">🏆</div>
          <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
          
          {/* Enhanced Score Display */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6">
            <div className="text-6xl font-bold mb-2 text-blue-600">
              {score}/{quizData.questions.length}
            </div>
            <div className="text-2xl font-semibold text-gray-700 mb-2">
              {percentage}% Correct
            </div>
            
            {/* Quiz Scope Indicator */}
            <div className="text-sm text-gray-600">
              {questionCount === 'full' ? (
                <span>📚 Full Quiz Completed</span>
              ) : (
                <span>⚡ {questionCount} Question Practice • {quizData.totalAvailable} Total Available</span>
              )}
            </div>
            
            {/* Performance Feedback */}
            <div className="mt-3">
              {percentage >= 90 && <span className="text-green-600 font-medium">🌟 Excellent mastery!</span>}
              {percentage >= 75 && percentage < 90 && <span className="text-blue-600 font-medium">👍 Great understanding!</span>}
              {percentage >= 60 && percentage < 75 && <span className="text-yellow-600 font-medium">📖 Good progress, keep studying!</span>}
              {percentage < 60 && <span className="text-red-600 font-medium">📚 Review recommended</span>}
            </div>
          </div>
          
          <div className="flex space-x-4 justify-center mb-8">
            <button
              onClick={resetQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🔄 Take Again
            </button>
            
            {questionCount !== 'full' && (
              <a
                href={`/quiz?id=${encodeURIComponent(quizId)}&count=full`}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                📚 Try Full Quiz
              </a>
            )}
            
            <a
              href="/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              Back to Dashboard
            </a>
          </div>
        </div>

        {/* DETAILED REVIEW WITH EXPLANATIONS */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">📚 Review & Learn</h3>
          
          {quizData.questions.map((question, index) => {
            const isCorrect = selectedAnswers[index] === question.correct;
            const userAnswer = selectedAnswers[index];
            
            return (
              <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                {/* Question Header */}
                <div className="flex items-start space-x-3 mb-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {question.question}
                    </h4>
                    
                    {/* Answer Summary */}
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? '✅ Correct' : '❌ Incorrect'}
                      </span>
                      <span className="text-gray-500">
                        Your answer: {userAnswer !== undefined ? question.options[userAnswer] : 'Not answered'}
                      </span>
                      {!isCorrect && (
                        <span className="text-green-600 font-medium">
                          Correct: {question.options[question.correct]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Explanations */}
                <div className="ml-11 space-y-4">
                  {/* Correct Answer Explanation */}
                  {question.correctExplanation && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">✅ Why this is correct:</h5>
                      <p className="text-green-700 text-sm leading-relaxed">{question.correctExplanation}</p>
                    </div>
                  )}

                  {/* Incorrect Answer Explanation */}
                  {question.incorrectExplanation && !isCorrect && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-semibold text-red-800 mb-2">❌ Why other options are incorrect:</h5>
                      <p className="text-red-700 text-sm leading-relaxed">{question.incorrectExplanation}</p>
                    </div>
                  )}

                  {/* Additional Learning Content */}
                  {question.hintMessage && question.hintMessage !== 'NaN' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">💡 Learning Hint:</h5>
                      <p className="text-blue-700 text-sm leading-relaxed">{question.hintMessage}</p>
                    </div>
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Quiz Header with Count Info */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-800">{quizData.title}</h1>
          <div className="text-right text-sm text-gray-600">
            {questionCount === 'full' ? (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">📚 Full Quiz</span>
            ) : (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">⚡ {questionCount} Questions</span>
            )}
          </div>
        </div>
        <p className="text-gray-600">{quizData.description}</p>
        {questionCount !== 'full' && (
          <p className="text-xs text-gray-500 mt-1">
            Questions randomly selected from {quizData.totalAvailable} available
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} of {quizData.questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(currentQuestion, index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:border-blue-300 ${
                selectedAnswers[currentQuestion] === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedAnswers[currentQuestion] === index && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={selectedAnswers[currentQuestion] === undefined}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentQuestion === quizData.questions.length - 1 ? 'Finish Quiz' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default QuizApp;