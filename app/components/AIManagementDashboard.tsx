// app/components/AIManagementDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  BookOpen, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText,
  GraduationCap,
  Target,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Eye,
  Zap,
  Activity,
  Award
} from 'lucide-react';

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'error';
  components: {
    firebase: { status: 'healthy' | 'warning' | 'error'; message: string };
    openai: { status: 'healthy' | 'warning' | 'error'; message: string };
    categories: { status: 'healthy' | 'warning' | 'error'; message: string };
    explanations: { status: 'healthy' | 'warning' | 'error'; message: string };
  };
}

interface OperationStatus {
  categorization: {
    running: boolean;
    progress?: any;
    lastResult?: any;
  };
  enhancement: {
    running: boolean;
    progress?: any;
    lastResult?: any;
  };
}

export default function AIManagementDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus>({
    categorization: { running: false },
    enhancement: { running: false }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setIsLoading(true);
      
      // Mock system status
      setSystemStatus({
        overall: 'healthy',
        components: {
          firebase: { status: 'healthy', message: 'Firebase connection successful' },
          openai: { status: 'healthy', message: 'OpenAI API key is valid' },
          categories: { status: 'warning', message: '58 courses need categorization' },
          explanations: { status: 'warning', message: '708 questions need enhancement' }
        }
      });
      
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runCategorization = async () => {
    try {
      setOperationStatus(prev => ({
        ...prev,
        categorization: { running: true, progress: { processed: 0, total: 100 } }
      }));
      
      // Simulate progress
      let processed = 0;
      const interval = setInterval(() => {
        processed += Math.random() * 10;
        if (processed >= 100) {
          processed = 100;
          clearInterval(interval);
          setOperationStatus(prev => ({
            ...prev,
            categorization: { 
              running: false, 
              lastResult: { categorizedCount: 95, duration: 300000 }
            }
          }));
        } else {
          setOperationStatus(prev => ({
            ...prev,
            categorization: { 
              running: true, 
              progress: { processed: Math.round(processed), total: 100 }
            }
          }));
        }
      }, 1000);
      
    } catch (error) {
      console.error('Categorization failed:', error);
      setOperationStatus(prev => ({
        ...prev,
        categorization: { running: false }
      }));
    }
  };

  const runEnhancement = async () => {
    try {
      setOperationStatus(prev => ({
        ...prev,
        enhancement: { running: true, progress: { processedQuestions: 0, totalQuestions: 500 } }
      }));
      
      // Simulate progress
      let processed = 0;
      const interval = setInterval(() => {
        processed += Math.random() * 25;
        if (processed >= 500) {
          processed = 500;
          clearInterval(interval);
          setOperationStatus(prev => ({
            ...prev,
            enhancement: { 
              running: false, 
              lastResult: { enhancedQuestions: 485, duration: 600000 }
            }
          }));
        } else {
          setOperationStatus(prev => ({
            ...prev,
            enhancement: { 
              running: true, 
              progress: { processedQuestions: Math.round(processed), totalQuestions: 500 }
            }
          }));
        }
      }, 1000);
      
    } catch (error) {
      console.error('Enhancement failed:', error);
      setOperationStatus(prev => ({
        ...prev,
        enhancement: { running: false }
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5" />;
      case 'warning': return <AlertCircle className="h-5 w-5" />;
      case 'error': return <AlertCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Management Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Management Dashboard</h1>
                <p className="text-gray-600">Monitor and manage AI-powered quiz enhancements</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {systemStatus && (
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${getStatusColor(systemStatus.overall)}`}>
                  {getStatusIcon(systemStatus.overall)}
                  <span className="text-sm font-medium capitalize">{systemStatus.overall}</span>
                </div>
              )}
              
              <button
                onClick={loadSystemData}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Health Cards */}
        {systemStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Object.entries(systemStatus.components).map(([key, component]) => (
              <div key={key} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 capitalize">{key}</h3>
                  <div className={`p-2 rounded-lg ${getStatusColor(component.status)}`}>
                    {getStatusIcon(component.status)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{component.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Course Categorization */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-purple-100 rounded-xl mr-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Course Categorization</h3>
                <p className="text-gray-600">Auto-categorize medical courses using AI</p>
              </div>
            </div>

            {operationStatus.categorization.running ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-purple-600">
                  <Pause className="h-5 w-5" />
                  <span className="font-medium">Categorization in progress...</span>
                </div>
                
                {operationStatus.categorization.progress && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress: {operationStatus.categorization.progress.processed} / {operationStatus.categorization.progress.total}</span>
                      <span>{Math.round((operationStatus.categorization.progress.processed / operationStatus.categorization.progress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(operationStatus.categorization.progress.processed / operationStatus.categorization.progress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {operationStatus.categorization.lastResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Last Operation Complete</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Categorized {operationStatus.categorization.lastResult.categorizedCount} courses in {formatTime(operationStatus.categorization.lastResult.duration)}
                    </p>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={runCategorization}
                    className="flex-1 flex items-center justify-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Categorization
                  </button>
                  <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Explanation Enhancement */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Explanation Enhancement</h3>
                <p className="text-gray-600">Generate comprehensive teaching explanations</p>
              </div>
            </div>

            {operationStatus.enhancement.running ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-blue-600">
                  <Pause className="h-5 w-5" />
                  <span className="font-medium">Enhancement in progress...</span>
                </div>
                
                {operationStatus.enhancement.progress && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Questions: {operationStatus.enhancement.progress.processedQuestions} / {operationStatus.enhancement.progress.totalQuestions}</span>
                      <span>{Math.round((operationStatus.enhancement.progress.processedQuestions / operationStatus.enhancement.progress.totalQuestions) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(operationStatus.enhancement.progress.processedQuestions / operationStatus.enhancement.progress.totalQuestions) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {operationStatus.enhancement.lastResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Last Operation Complete</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Enhanced {operationStatus.enhancement.lastResult.enhancedQuestions} questions in {formatTime(operationStatus.enhancement.lastResult.duration)}
                    </p>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={runEnhancement}
                    className="flex-1 flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Start Enhancement
                  </button>
                  <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/ai/quality-review"
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Award className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Quality Review</span>
            </a>
            
            <a
              href="/ai/analytics"
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">Analytics</span>
            </a>
            
            <a
              href="/ai/batch-operations"
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Target className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">Batch Operations</span>
            </a>
            
            <a
              href="/ai/system-health"
              className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Activity className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-900">System Health</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}