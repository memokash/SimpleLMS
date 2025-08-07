// app/components/EnhancedQuizDisplay.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Zap
} from 'lucide-react';

interface QuestionData {
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

interface Props {
  questions: QuestionData[];
  currentQuestionIndex: number;
  selectedAnswer?: number;
  showExplanations?: boolean;
  isSubmitted?: boolean;
  onAnswerSelect: (answerIndex: number) => void;
  onNextQuestion?: () => void;
  onPreviousQuestion?: () => void;
}

// Sub-component for teaching elements
const TeachingElements = React.memo(({ elements }: { elements: QuestionData['teachingElements'] }) => {
  if (!elements) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Analogies */}
      {elements.analogies && (
        <div className="space-y-2">
          <h5 className="font-medium text-gray-900 flex items-center">
            <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
            Analogies
          </h5>
          <ul className="space-y-1">
            {elements.analogies.map((analogy, index) => (
              <li key={index} className="text-sm text-gray-700 bg-yellow-50 p-2 rounded">
                {analogy}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mnemonics */}
      {elements.mnemonics && (
        <div className="space-y-2">
          <h5 className="font-medium text-gray-900 flex items-center">
            <Brain className="h-4 w-4 mr-1 text-blue-500" />
            Memory Aids
          </h5>
          <ul className="space-y-1">
            {elements.mnemonics.map((mnemonic, index) => (
              <li key={index} className="text-sm text-gray-700 bg-blue-50 p-2 rounded font-mono">
                {mnemonic}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Clinical Examples */}
      {elements.examples && (
        <div className="space-y-2">
          <h5 className="font-medium text-gray-900 flex items-center">
            <BookOpen className="h-4 w-4 mr-1 text-green-500" />
            Clinical Examples
          </h5>
          <ul className="space-y-1">
            {elements.examples.map((example, index) => (
              <li key={index} className="text-sm text-gray-700 bg-green-50 p-2 rounded">
                {example}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

TeachingElements.displayName = 'TeachingElements';

// Sub-component for explanation sections
const ExplanationSection = React.memo(({ 
  type, 
  content, 
  isExpanded, 
  onToggle, 
  hasEnhancedExplanations 
}: {
  type: 'correct' | 'incorrect';
  content: string;
  isExpanded: boolean;
  onToggle: () => void;
  hasEnhancedExplanations: boolean;
}) => {
  const isCorrect = type === 'correct';
  const colorClasses = isCorrect 
    ? 'border-green-200 bg-green-50 text-green-900 text-green-600 bg-green-200 text-green-800'
    : 'border-red-200 bg-red-50 text-red-900 text-red-600 bg-red-200 text-red-800';
  
  const Icon = isCorrect ? CheckCircle : XCircle;
  const title = isCorrect ? 'Why This Answer is Correct' : 'Why Other Options are Incorrect';

  return (
    <div className={`border ${isCorrect ? 'border-green-200' : 'border-red-200'} rounded-lg overflow-hidden`}>
      <div 
        className={`${isCorrect ? 'bg-green-50' : 'bg-red-50'} p-4 cursor-pointer flex items-center justify-between`}
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <Icon className={`h-5 w-5 ${isCorrect ? 'text-green-600' : 'text-red-600'}`} />
          <h4 className={`font-semibold ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>{title}</h4>
          {hasEnhancedExplanations && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
            }`}>
              AI Enhanced
            </span>
          )}
        </div>
        {isExpanded ? 
          <ChevronUp className={`h-5 w-5 ${isCorrect ? 'text-green-600' : 'text-red-600'}`} /> : 
          <ChevronDown className={`h-5 w-5 ${isCorrect ? 'text-green-600' : 'text-red-600'}`} />
        }
      </div>
      
      {isExpanded && (
        <div className={`p-4 bg-white border-t ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      )}
    </div>
  );
});

ExplanationSection.displayName = 'ExplanationSection';

// Sub-component for answer options
const AnswerOption = React.memo(({ 
  option, 
  index, 
  isCorrect, 
  isSelected, 
  isSubmitted, 
  onClick 
}: {
  option: string;
  index: number;
  isCorrect: boolean;
  isSelected: boolean;
  isSubmitted: boolean;
  onClick: () => void;
}) => {
  const getClassName = useCallback(() => {
    let baseClass = "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ";
    
    if (!isSubmitted) {
      if (isSelected) {
        baseClass += "border-blue-500 bg-blue-50 text-blue-900";
      } else {
        baseClass += "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50";
      }
    } else if (isCorrect) {
      baseClass += "border-green-500 bg-green-50 text-green-900";
    } else if (isSelected && !isCorrect) {
      baseClass += "border-red-500 bg-red-50 text-red-900";
    } else {
      baseClass += "border-gray-200 bg-gray-50 text-gray-600";
    }
    
    return baseClass;
  }, [isCorrect, isSelected, isSubmitted]);

  const getIcon = useCallback(() => {
    if (!isSubmitted) {
      return null;
    }
    
    if (isCorrect) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (isSelected) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    return null;
  }, [isCorrect, isSelected, isSubmitted]);

  return (
    <div
      className={getClassName()}
      onClick={isSubmitted ? undefined : onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
            {String.fromCharCode(65 + index)}
          </div>
          <span className="text-sm font-medium">{option}</span>
        </div>
        {getIcon()}
      </div>
    </div>
  );
});

AnswerOption.displayName = 'AnswerOption';

// Main component
export default function EnhancedQuizDisplay({
  questions,
  currentQuestionIndex,
  selectedAnswer,
  showExplanations = false,
  isSubmitted = false,
  onAnswerSelect,
  onNextQuestion,
  onPreviousQuestion
}: Props) {
  const [expandedExplanation, setExpandedExplanation] = useState<'correct' | 'incorrect' | null>(null);
  const [showTeachingElements, setShowTeachingElements] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  
  // Memoized computed values
  const progressPercentage = useMemo(() => 
    ((currentQuestionIndex + 1) / questions.length) * 100, 
    [currentQuestionIndex, questions.length]
  );

  const hasEnhancedExplanations = useMemo(() => 
    currentQuestion?.explanationEnhancedBy === 'openai', 
    [currentQuestion?.explanationEnhancedBy]
  );

  const isFirstQuestion = useMemo(() => 
    currentQuestionIndex === 0, 
    [currentQuestionIndex]
  );

  const isLastQuestion = useMemo(() => 
    currentQuestionIndex === questions.length - 1, 
    [currentQuestionIndex, questions.length]
  );

  // Reset state when question changes
  useEffect(() => {
    setExpandedExplanation(null);
    setShowTeachingElements(false);
  }, [currentQuestionIndex]);

  // Memoized event handlers
  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (!isSubmitted) {
      onAnswerSelect(answerIndex);
    }
  }, [isSubmitted, onAnswerSelect]);

  const toggleCorrectExplanation = useCallback(() => {
    setExpandedExplanation(prev => prev === 'correct' ? null : 'correct');
  }, []);

  const toggleIncorrectExplanation = useCallback(() => {
    setExpandedExplanation(prev => prev === 'incorrect' ? null : 'incorrect');
  }, []);

  const toggleTeachingElements = useCallback(() => {
    setShowTeachingElements(prev => !prev);
  }, []);

  if (!currentQuestion) {
    return <div>No question available</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              {currentQuestion.category && (
                <div className="flex items-center space-x-4 text-sm text-blue-100">
                  <span>{currentQuestion.category}</span>
                  {hasEnhancedExplanations && (
                    <span className="flex items-center bg-yellow-500 bg-opacity-20 px-2 py-1 rounded-full">
                      <Zap className="h-4 w-4 mr-1" />
                      AI Enhanced
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-blue-100 mb-1">Progress</div>
            <div className="w-32 bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 leading-relaxed">
            {currentQuestion.question}
          </h3>
        </div>

        {/* Answer Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => (
            <AnswerOption
              key={index}
              option={option}
              index={index}
              isCorrect={index === currentQuestion.correctAnswer}
              isSelected={index === selectedAnswer}
              isSubmitted={isSubmitted}
              onClick={() => handleAnswerSelect(index)}
            />
          ))}
        </div>

        {/* Enhanced Explanations */}
        {showExplanations && isSubmitted && (
          <div className="space-y-4">
            {/* Correct Answer Explanation */}
            {currentQuestion.correctExplanation && (
              <ExplanationSection
                type="correct"
                content={currentQuestion.correctExplanation}
                isExpanded={expandedExplanation === 'correct'}
                onToggle={toggleCorrectExplanation}
                hasEnhancedExplanations={hasEnhancedExplanations}
              />
            )}

            {/* Incorrect Answer Explanation */}
            {currentQuestion.incorrectExplanation && (
              <ExplanationSection
                type="incorrect"
                content={currentQuestion.incorrectExplanation}
                isExpanded={expandedExplanation === 'incorrect'}
                onToggle={toggleIncorrectExplanation}
                hasEnhancedExplanations={hasEnhancedExplanations}
              />
            )}

            {/* Teaching Elements */}
            {hasEnhancedExplanations && currentQuestion.teachingElements && (
              <div className="border border-purple-200 rounded-lg overflow-hidden">
                <div 
                  className="bg-purple-50 p-4 cursor-pointer flex items-center justify-between"
                  onClick={toggleTeachingElements}
                >
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-900">Advanced Teaching Material</h4>
                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                      AI Generated
                    </span>
                  </div>
                  {showTeachingElements ? 
                    <ChevronUp className="h-5 w-5 text-purple-600" /> : 
                    <ChevronDown className="h-5 w-5 text-purple-600" />
                  }
                </div>
                
                {showTeachingElements && (
                  <div className="p-4 bg-white border-t border-purple-200">
                    <TeachingElements elements={currentQuestion.teachingElements} />
                  </div>
                )}
              </div>
            )}

            {/* Enhancement Information */}
            {hasEnhancedExplanations && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-blue-900 mb-1">AI-Enhanced Learning Experience</h5>
                    <p className="text-sm text-blue-700">
                      This explanation has been enhanced using advanced AI to provide comprehensive teaching material.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onPreviousQuestion}
            disabled={isFirstQuestion}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Take your time to review the explanations</span>
          </div>
          
          <button
            onClick={onNextQuestion}
            disabled={isLastQuestion}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLastQuestion ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}