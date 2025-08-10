"use client"

import React, { useState, useCallback, useRef } from 'react';
import { 
  categorizeCoursesWithOpenAI, 
  previewOpenAICategorization, 
  getCategoryStatistics,
  validateExistingCategories,
  CategorizationProgress,
  CategorizationResult,
  PreviewResult,
  CategoryStats
} from '../../lib/openaiCourseCategorizer';
import { 
  RefreshCw, 
  Eye, 
  Play, 
  CheckCircle, 
  Brain, 
  Zap, 
  BarChart3, 
  Sparkles, 
  AlertTriangle,
  X,
  Check,
  Clock,
  TrendingUp,
  Shield,
  Pause,
  AlertCircle
} from 'lucide-react';

// Toast notification component  
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'warning' | 'info'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
    type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
    type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
    type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
    'bg-blue-50 border border-blue-200 text-blue-800'
  }`}>
    <div className="flex items-start">
      <div className="flex-shrink-0">
        {type === 'success' && <Check className="w-5 h-5 text-green-500" />}
        {type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
        {type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
        {type === 'info' && <AlertCircle className="w-5 h-5 text-blue-500" />}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button onClick={onClose} className="ml-3 flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Progress bar component
interface ProgressData {
  processed: number;
  total: number;
  categorized: number;
  errors: number;
  failed: number;
  estimatedTimeRemaining?: number;
  currentCourse?: string;
}

interface ToastData {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const ProgressBar = ({ progress, showDetails = true }: { progress: ProgressData; showDetails?: boolean }) => {
  const percentage = Math.round((progress.processed / progress.total) * 100);
  const successRate = progress.processed > 0 ? Math.round((progress.categorized / progress.processed) * 100) : 0;
  
  const formatTime = (ms: number) => {
    if (!ms) {
      return 'Unknown';
    }
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.round(seconds / 60);
    return `${minutes}m`;
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">Processing Progress</h4>
        <span className="text-sm text-gray-600">{percentage}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showDetails && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{progress.processed}</div>
            <div className="text-gray-600">Processed</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">{progress.categorized}</div>
            <div className="text-gray-600">Categorized</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">{progress.failed}</div>
            <div className="text-gray-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">{formatTime(progress.estimatedTimeRemaining || 0)}</div>
            <div className="text-gray-600">ETA</div>
          </div>
        </div>
      )}

      {progress.currentCourse && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
          <span className="text-gray-600">Current: </span>
          <span className="font-medium text-gray-900 truncate">{progress.currentCourse}</span>
        </div>
      )}

      {showDetails && progress.processed > 0 && (
        <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
          <span>Success Rate: {successRate}%</span>
          <span>Remaining: {progress.total - progress.processed}</span>
        </div>
      )}
    </div>
  );
};

const EnhancedOpenAICourseCategorizationRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isGettingStats, setIsGettingStats] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const [results, setResults] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  
  const controllerRef = useRef(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const handleProgressUpdate = useCallback((progressData: any) => {
    setProgress(progressData);
  }, []);

  const handlePreview = async () => {
    setIsPreviewing(true);
    setPreview(null);
    
    try {
      showToast('Starting preview analysis...', 'info');
      const previewResults = await previewOpenAICategorization(5, handleProgressUpdate);
      setPreview(previewResults);
      showToast(`Preview complete! Analyzed ${previewResults.length} courses`, 'success');
    } catch (error) {
      console.error('Preview failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToast(`Preview failed: ${errorMessage}`, 'error');
    } finally {
      setIsPreviewing(false);
      setProgress(null);
    }
  };

  const handleCategorization = async () => {
    if (!window.confirm(
      'Run OpenAI categorization on all courses?\n\n' +
      '⚠️ This will:\n' +
      '• Use OpenAI API credits\n' +
      '• Take several minutes to complete\n' +
      '• Process all uncategorized courses\n\n' +
      'Continue?'
    )) {
      return;
    }

    setIsRunning(true);
    setResults(null);
    setProgress(null);
    
    try {
      showToast('Starting AI categorization process...', 'info');
      
      const categorizationResults = await categorizeCoursesWithOpenAI(handleProgressUpdate);
      setResults(categorizationResults);
      
      if (categorizationResults.success) {
        showToast(
          `Categorization complete! ✅ ${categorizationResults.categorizedCount} courses categorized, ❌ ${categorizationResults.failedCount} failed`,
          'success'
        );
      } else {
        showToast(
          `Categorization completed with issues. ${categorizationResults.categorizedCount} success, ${categorizationResults.failedCount} failed`,
          'warning'
        );
      }
      
      // Auto-refresh stats after categorization
      setTimeout(() => handleGetStats(), 1000);
      
    } catch (error) {
      console.error('Categorization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToast(`Categorization failed: ${errorMessage}`, 'error');
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  };

  const handleGetStats = async () => {
    setIsGettingStats(true);
    try {
      const categoryStats = await getCategoryStatistics();
      setStats(categoryStats);
      showToast('Statistics updated successfully', 'success');
    } catch (error) {
      console.error('Stats failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToast(`Failed to get stats: ${errorMessage}`, 'error');
    } finally {
      setIsGettingStats(false);
    }
  };

  const handleValidateCategories = async () => {
    setIsValidating(true);
    try {
      showToast('Validating existing categories...', 'info');
      const validationResults = await validateExistingCategories();
      
      if (validationResults.fixedCategories > 0) {
        showToast(
          `Validation complete! Fixed ${validationResults.fixedCategories} invalid categories`,
          'success'
        );
        // Refresh stats after validation
        setTimeout(() => handleGetStats(), 1000);
      } else {
        showToast('All categories are valid!', 'success');
      }
    } catch (error) {
      console.error('Validation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToast(`Validation failed: ${errorMessage}`, 'error');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Brain className="w-6 h-6 text-purple-500 mr-2" />
          Enhanced OpenAI Course Categorization
        </h2>
        <p className="text-gray-600 mb-4">
          Advanced AI-powered course categorization with progress tracking, retry logic, and robust error handling.
        </p>
        
        {/* Enhanced benefits showcase */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Smart Retry Logic</div>
              <div className="text-sm text-gray-600">Handles API failures</div>
            </div>
            <div>
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Progress Tracking</div>
              <div className="text-sm text-gray-600">Real-time updates</div>
            </div>
            <div>
              <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Enhanced AI</div>
              <div className="text-sm text-gray-600">Better accuracy</div>
            </div>
            <div>
              <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Error Recovery</div>
              <div className="text-sm text-gray-600">Robust handling</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress display */}
      {progress && (
        <div className="mb-6">
          <ProgressBar progress={progress} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={handlePreview}
          disabled={isPreviewing || isRunning}
          className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPreviewing ? (
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Eye className="w-5 h-5 mr-2" />
          )}
          {isPreviewing ? 'Previewing...' : 'Preview AI Categories'}
        </button>

        <button
          onClick={handleCategorization}
          disabled={isRunning || isPreviewing}
          className="flex items-center justify-center px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? (
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Brain className="w-5 h-5 mr-2" />
          )}
          {isRunning ? 'Processing...' : 'Run AI Categorization'}
        </button>

        <button
          onClick={handleGetStats}
          disabled={isGettingStats || isRunning}
          className="flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGettingStats ? (
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <BarChart3 className="w-5 h-5 mr-2" />
          )}
          {isGettingStats ? 'Loading...' : 'View Statistics'}
        </button>

        <button
          onClick={handleValidateCategories}
          disabled={isValidating || isRunning}
          className="flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isValidating ? (
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Shield className="w-5 h-5 mr-2" />
          )}
          {isValidating ? 'Validating...' : 'Validate Categories'}
        </button>
      </div>

      {preview && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-blue-900">AI Categorization Preview</h3>
            <div className="flex items-center space-x-4 text-sm text-blue-800">
              <div>Courses: {preview.length}</div>
              <div>Need Categories: {preview.filter((p: any) => p.needsUpdate).length}</div>
              <div>Categories: {Array.from(new Set(preview.map((p: any) => p.aiSuggestedCategory))).length}</div>


            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-100 sticky top-0">
                <tr>
                  <th className="text-left p-2">Course</th>
                  <th className="text-left p-2">Current</th>
                  <th className="text-left p-2">AI Suggests</th>
                  <th className="text-left p-2">Confidence</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-blue-200">
                    <td className="p-2">
                      <div className="font-medium max-w-xs truncate">{item.courseName}</div>
                      <div className="text-xs text-blue-600">{item.courseId}</div>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.currentCategory === 'MISSING' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {item.currentCategory}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {item.aiSuggestedCategory}
                      </span>
                    </td>
                    <td className="p-2">
                      {item.confidence && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.confidence === 'high' ? 'bg-green-100 text-green-700' :
                          item.confidence === 'corrected' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.confidence}
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {item.needsUpdate ? (
                        <Brain className="w-4 h-4 text-purple-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results && (
        <div className={`mb-6 p-4 rounded-lg border ${
          results.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-3 ${
            results.success ? 'text-green-900' : 'text-yellow-900'
          }`}>
            Categorization {results.success ? 'Complete!' : 'Completed with Issues'}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{results.processedCount}</div>
              <div className="text-gray-600">Processed</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{results.categorizedCount}</div>
              <div className="text-gray-600">Categorized</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600">{results.failedCount}</div>
              <div className="text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">{Math.round(results.duration / 1000)}s</div>
              <div className="text-gray-600">Duration</div>
            </div>
          </div>

          {results.errors && results.errors.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-red-700 hover:text-red-800">
                View {results.errors.length} Errors
              </summary>
              <div className="mt-2 max-h-40 overflow-y-auto bg-red-50 p-3 rounded border">
                {results.errors.map((error: any, index: number) => (
                  <div key={index} className="text-xs text-red-800 border-b border-red-200 pb-1 mb-1 last:border-b-0">
                    <span className="font-medium">{error.courseId}:</span> {error.error}
                  </div>
                ))}
              </div>
            </details>
          )}

          <div className={`mt-3 text-sm ${
            results.success ? 'text-green-700' : 'text-yellow-700'
          }`}>
            🎉 Categories are now stored at course level! Your CoursesDashboard will load instantly.
          </div>
        </div>
      )}

      {stats && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-purple-900">Category Statistics</h3>
            <div className="text-xs text-purple-600">
              Last updated: {stats.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-purple-800 mb-4">
            <div className="text-center">
              <div className="font-semibold">{stats.totalCourses}</div>
              <div className="text-purple-600">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{stats.categorized}</div>
              <div className="text-purple-600">Categorized</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600">{stats.uncategorized}</div>
              <div className="text-purple-600">Uncategorized</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{Object.keys(stats.categories).length}</div>
              <div className="text-purple-600">Categories</div>
            </div>
          </div>
          
          {stats.totalCourses > 0 && (
            <div className="mb-4">
              <div className="text-sm text-purple-700 mb-2">Completion Progress:</div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.categorized / stats.totalCourses) * 100}%` }}
                />
              </div>
              <div className="text-xs text-purple-600 mt-1">
                {Math.round((stats.categorized / stats.totalCourses) * 100)}% Complete
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">Top Categories:</h4>
              <div className="max-h-40 overflow-y-auto">
                {Object.entries(stats.categories)
                  .sort(([,a], [,b]) => Number(b) - Number(a))
                  .slice(0, 10)
                  .map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center py-1">
                    <span className="text-sm truncate">{category}</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs ml-2">
                      {String(count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">Category Sources:</h4>
              <div className="space-y-1">
                {Object.entries(stats.sources).map(([source, count]) => (
                  <div key={source} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{source.replace('_', ' ')}</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                      {String(count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced How it works section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Enhanced Process:</h4>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>🔍 <strong>Smart Analysis:</strong> Enhanced AI with retry logic</li>
            <li>🎯 <strong>Robust Processing:</strong> Handles failures gracefully</li>
            <li>📊 <strong>Progress Tracking:</strong> Real-time updates and ETA</li>
            <li>💾 <strong>Batch Updates:</strong> Efficient database operations</li>
            <li>✅ <strong>Validation:</strong> Ensures category consistency</li>
          </ol>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">New Features:</h4>
          <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
            <li>🔄 <strong>Retry Logic:</strong> Handles API failures automatically</li>
            <li>📈 <strong>Progress Tracking:</strong> See real-time progress and ETA</li>
            <li>🛡️ <strong>Error Recovery:</strong> Continues despite individual failures</li>
            <li>📋 <strong>Toast Notifications:</strong> Better user feedback</li>
            <li>🔍 <strong>Category Validation:</strong> Ensures data consistency</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-900 mb-2">Enhanced Safety Features:</h4>
        <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
          <li>Automatic retry with exponential backoff for failed API calls</li>
          <li>Progress tracking with estimated time remaining</li>
          <li>Detailed error reporting and recovery</li>
          <li>Category validation to ensure data consistency</li>
          <li>Batch processing to prevent database overload</li>
          <li>Rate limiting to respect API quotas</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedOpenAICourseCategorizationRunner;