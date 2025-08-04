"use client"

import React, { useState, useCallback } from 'react';
import { 
  Brain, 
  BookOpen, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText,
  Lightbulb,
  GraduationCap,
  Target,
  TrendingUp,
  Users,
  BarChart3,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react';

// Enhanced interfaces for both operations
interface CategoryProgress {
  total: number;
  processed: number;
  categorized: number;
  failed: number;
  currentCourse?: string;
  estimatedTimeRemaining?: number;
}

interface EnhancementProgress {
  totalQuizzes: number;
  processedQuizzes: number;
  totalQuestions: number;
  processedQuestions: number;
  enhancedQuestions: number;
  failedQuestions: number;
  currentQuiz?: string;
  currentQuestion?: string;
  estimatedTimeRemaining?: number;
}

interface CategoryResult {
  processedCount: number;
  categorizedCount: number;
  failedCount: number;
  skippedCount: number;
  success: boolean;
  errors: Array<{courseId: string; error: string}>;
  duration: number;
}

interface EnhancementResult {
  processedQuizzes: number;
  processedQuestions: number;
  enhancedQuestions: number;
  failedQuestions: number;
  skippedQuestions: number;
  success: boolean;
  errors: Array<{quizId: string; questionId: string; error: string}>;
  duration: number;
}

export default function OpenAIOperationsRunner() {
  // State for categorization
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress | null>(null);
  const [categoryResult, setCategoryResult] = useState<CategoryResult | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [categoryPreview, setCategoryPreview] = useState<any[]>([]);
  const [showCategoryPreview, setShowCategoryPreview] = useState(false);

  // State for explanation enhancement
  const [enhancementProgress, setEnhancementProgress] = useState<EnhancementProgress | null>(null);
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementPreview, setEnhancementPreview] = useState<any[]>([]);
  const [showEnhancementPreview, setShowEnhancementPreview] = useState(false);

  // State for statistics
  const [categoryStats, setCategoryStats] = useState<any>(null);
  const [enhancementStats, setEnhancementStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'categorize' | 'enhance'>('categorize');

  // Categorization functions
  const handlePreviewCategorization = useCallback(async () => {
    try {
      setShowCategoryPreview(false);
      const { previewOpenAICategorization } = await import('../../lib/openaiCourseCategorizer');
      const preview = await previewOpenAICategorization(10);
      setCategoryPreview(preview);
      setShowCategoryPreview(true);
    } catch (error) {
      console.error('Preview failed:', error);
      alert('Preview failed: ' + (error as Error).message);
    }
  }, []);

  const handleStartCategorization = useCallback(async () => {
    try {
      setIsCategorizing(true);
      setCategoryResult(null);
      setCategoryProgress(null);
      
      const { categorizeCoursesWithOpenAI } = await import('../../lib/openaiCourseCategorizer');
      
      const result = await categorizeCoursesWithOpenAI((progress) => {
        setCategoryProgress(progress);
      });
      
      setCategoryResult(result);
    } catch (error) {
      console.error('Categorization failed:', error);
      alert('Categorization failed: ' + (error as Error).message);
    } finally {
      setIsCategorizing(false);
    }
  }, []);

  // Enhancement functions
  const handlePreviewEnhancement = useCallback(async () => {
    try {
      setShowEnhancementPreview(false);
      const { previewExplanationEnhancements } = await import('../../lib/openaiQuizEnhancer');
      const preview = await previewExplanationEnhancements(10);
      setEnhancementPreview(preview);
      setShowEnhancementPreview(true);
    } catch (error) {
      console.error('Enhancement preview failed:', error);
      alert('Enhancement preview failed: ' + (error as Error).message);
    }
  }, []);

  const handleStartEnhancement = useCallback(async () => {
    try {
      setIsEnhancing(true);
      setEnhancementResult(null);
      setEnhancementProgress(null);
      
      const { enhanceQuizExplanationsWithOpenAI } = await import('../../lib/openaiQuizEnhancer');
      
      const result = await enhanceQuizExplanationsWithOpenAI((progress) => {
        setEnhancementProgress(progress);
      });
      
      setEnhancementResult(result);
    } catch (error) {
      console.error('Enhancement failed:', error);
      alert('Enhancement failed: ' + (error as Error).message);
    } finally {
      setIsEnhancing(false);
    }
  }, []);

  // Statistics functions
  const loadStatistics = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      
      const [categoryModule, enhancementModule] = await Promise.all([
        import('../../lib/openaiCourseCategorizer'),
        import('../../lib/openaiQuizEnhancer')
      ]);
      
      const [catStats, enhStats] = await Promise.all([
        categoryModule.getCategoryStatistics(),
        enhancementModule.getEnhancementStatistics()
      ]);
      
      setCategoryStats(catStats);
      setEnhancementStats(enhStats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Load stats on component mount
  React.useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="h-12 w-12 text-purple-600" />
          <h1 className="text-4xl font-bold text-gray-900">
            AI-Powered Quiz Enhancement
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          Use advanced AI to categorize courses and generate comprehensive explanations that serve as teaching material for medical education.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg shadow-sm border p-1 flex">
          <button
            onClick={() => setActiveTab('categorize')}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === 'categorize'
                ? 'bg-purple-100 text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Course Categorization</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('enhance')}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === 'enhance'
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Explanation Enhancement</span>
            </div>
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Statistics */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
              Categorization Stats
            </h3>
            <button
              onClick={loadStatistics}
              disabled={isLoadingStats}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {categoryStats ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Courses</span>
                <span className="font-semibold text-gray-900">{categoryStats.totalCourses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">✅ Categorized</span>
                <span className="font-semibold text-green-600">{categoryStats.categorized}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">❌ Uncategorized</span>
                <span className="font-semibold text-red-600">{categoryStats.uncategorized}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500">
                  Categories: {Object.keys(categoryStats.categories || {}).length}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              {isLoadingStats ? 'Loading...' : 'No data available'}
            </div>
          )}
        </div>

        {/* Enhancement Statistics */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
              Enhancement Stats
            </h3>
            <button
              onClick={loadStatistics}
              disabled={isLoadingStats}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {enhancementStats ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Questions</span>
                <span className="font-semibold text-gray-900">{enhancementStats.totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">✨ Enhanced</span>
                <span className="font-semibold text-blue-600">
                  {Math.max(enhancementStats.questionsWithCorrectExplanations, enhancementStats.questionsWithIncorrectExplanations)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">🔧 Need Enhancement</span>
                <span className="font-semibold text-orange-600">{enhancementStats.questionsNeedingEnhancement}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500">
                  Progress: {enhancementStats.totalQuestions > 0 ? 
                    Math.round(((enhancementStats.totalQuestions - enhancementStats.questionsNeedingEnhancement) / enhancementStats.totalQuestions) * 100) : 0}%
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              {isLoadingStats ? 'Loading...' : 'No data available'}
            </div>
          )}
        </div>
      </div>

      {/* Course Categorization Tab */}
      {activeTab === 'categorize' && (
        <div className="space-y-6">
          {/* Categorization Controls */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Course Categorization</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Automatically categorize medical courses using AI analysis to improve organization and performance.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handlePreviewCategorization}
                className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Categorization
              </button>
              
              <button
                onClick={handleStartCategorization}
                disabled={isCategorizing}
                className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCategorizing ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Categorizing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Categorization
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Category Progress */}
          {categoryProgress && isCategorizing && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Categorization Progress</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress: {categoryProgress.processed} / {categoryProgress.total}</span>
                  <span>{Math.round((categoryProgress.processed / categoryProgress.total) * 100)}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(categoryProgress.processed / categoryProgress.total) * 100}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{categoryProgress.categorized}</div>
                    <div className="text-gray-500">Categorized</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-red-600">{categoryProgress.failed}</div>
                    <div className="text-gray-500">Failed</div>
                  </div>
                </div>
                
                {categoryProgress.currentCourse && (
                  <div className="text-sm text-gray-600 text-center">
                    Currently processing: <span className="font-medium">{categoryProgress.currentCourse}</span>
                  </div>
                )}
                
                {categoryProgress.estimatedTimeRemaining && (
                  <div className="text-sm text-gray-500 text-center">
                    Estimated time remaining: {formatTime(categoryProgress.estimatedTimeRemaining)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category Preview */}
          {showCategoryPreview && categoryPreview.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorization Preview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Suggested</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryPreview.slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.courseName.substring(0, 40)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.currentCategory}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.aiSuggestedCategory}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.needsUpdate ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {item.needsUpdate ? 'Needs Update' : 'Already Set'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Category Results */}
          {categoryResult && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                {categoryResult.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">Categorization Complete</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{categoryResult.processedCount}</div>
                  <div className="text-sm text-gray-500">Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{categoryResult.categorizedCount}</div>
                  <div className="text-sm text-gray-500">Categorized</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{categoryResult.failedCount}</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{categoryResult.skippedCount}</div>
                  <div className="text-sm text-gray-500">Skipped</div>
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                Duration: {formatTime(categoryResult.duration)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explanation Enhancement Tab */}
      {activeTab === 'enhance' && (
        <div className="space-y-6">
          {/* Enhancement Controls */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Quiz Explanation Enhancement</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Generate comprehensive explanations that serve as advanced teaching material for medical education, including analogies, mnemonics, and clinical examples.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">What This Enhancement Provides:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Deep explanations of correct answers with pathophysiology</li>
                    <li>• Detailed analysis of why incorrect options are wrong</li>
                    <li>• Medical analogies and mnemonics for better retention</li>
                    <li>• Clinical examples and practical applications</li>
                    <li>• Advanced-level teaching material suitable for medical students</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handlePreviewEnhancement}
                className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Enhancement
              </button>
              
              <button
                onClick={handleStartEnhancement}
                disabled={isEnhancing}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isEnhancing ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Start Enhancement
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enhancement Progress */}
          {enhancementProgress && isEnhancing && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Enhancement Progress</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Quizzes: {enhancementProgress.processedQuizzes} / {enhancementProgress.totalQuizzes}</span>
                      <span>{Math.round((enhancementProgress.processedQuizzes / enhancementProgress.totalQuizzes) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(enhancementProgress.processedQuizzes / enhancementProgress.totalQuizzes) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Questions: {enhancementProgress.processedQuestions} / {enhancementProgress.totalQuestions}</span>
                      <span>{Math.round((enhancementProgress.processedQuestions / enhancementProgress.totalQuestions) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(enhancementProgress.processedQuestions / enhancementProgress.totalQuestions) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{enhancementProgress.enhancedQuestions}</div>
                    <div className="text-gray-500">Enhanced</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-red-600">{enhancementProgress.failedQuestions}</div>
                    <div className="text-gray-500">Failed</div>
                  </div>
                </div>
                
                {enhancementProgress.currentQuiz && (
                  <div className="text-sm text-gray-600 text-center">
                    Current quiz: <span className="font-medium">{enhancementProgress.currentQuiz}</span>
                  </div>
                )}
                
                {enhancementProgress.currentQuestion && (
                  <div className="text-sm text-gray-500 text-center">
                    Question: {enhancementProgress.currentQuestion}
                  </div>
                )}
                
                {enhancementProgress.estimatedTimeRemaining && (
                  <div className="text-sm text-gray-500 text-center">
                    Estimated time remaining: {formatTime(enhancementProgress.estimatedTimeRemaining)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhancement Preview */}
          {showEnhancementPreview && enhancementPreview.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enhancement Preview</h3>
              <div className="space-y-6">
                {enhancementPreview.slice(0, 3).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900">{item.quizTitle}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.questionText}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-green-700 mb-2">✅ Correct Explanation</h5>
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <p className="text-green-800">
                            {item.currentCorrectExplanation === 'MISSING' ? (
                              <span className="text-red-600 italic">Missing - Will be generated</span>
                            ) : (
                              item.currentCorrectExplanation.substring(0, 100) + '...'
                            )}
                          </p>
                          {item.aiCorrectExplanation && item.aiCorrectExplanation !== 'COULD_NOT_GENERATE' && (
                            <div className="mt-2 pt-2 border-t border-green-300">
                              <p className="text-xs text-green-600 font-medium">AI Enhanced:</p>
                              <p className="text-green-700 text-xs">{item.aiCorrectExplanation.substring(0, 150)}...</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-red-700 mb-2">❌ Incorrect Explanation</h5>
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <p className="text-red-800">
                            {item.currentIncorrectExplanation === 'MISSING' ? (
                              <span className="text-red-600 italic">Missing - Will be generated</span>
                            ) : (
                              item.currentIncorrectExplanation.substring(0, 100) + '...'
                            )}
                          </p>
                          {item.aiIncorrectExplanation && item.aiIncorrectExplanation !== 'COULD_NOT_GENERATE' && (
                            <div className="mt-2 pt-2 border-t border-red-300">
                              <p className="text-xs text-red-600 font-medium">AI Enhanced:</p>
                              <p className="text-red-700 text-xs">{item.aiIncorrectExplanation.substring(0, 150)}...</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhancement Results */}
          {enhancementResult && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                {enhancementResult.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">Enhancement Complete</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{enhancementResult.processedQuestions}</div>
                  <div className="text-sm text-gray-500">Questions Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{enhancementResult.enhancedQuestions}</div>
                  <div className="text-sm text-gray-500">Enhanced</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{enhancementResult.failedQuestions}</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{enhancementResult.skippedQuestions}</div>
                  <div className="text-sm text-gray-500">Skipped</div>
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                Duration: {formatTime(enhancementResult.duration)} • 
                Success Rate: {Math.round((enhancementResult.enhancedQuestions / enhancementResult.processedQuestions) * 100)}%
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}