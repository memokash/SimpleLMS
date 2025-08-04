// app/components/PerformanceAnalyticsDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Clock, 
  CheckCircle,
  Users,
  BookOpen,
  Brain,
  Award,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Activity
} from 'lucide-react';

interface PerformanceMetrics {
  overview: {
    totalOperations: number;
    successRate: number;
    avgProcessingTime: number;
    costPerOperation: number;
  };
  categorization: {
    totalCourses: number;
    categorizedCourses: number;
    accuracyRate: number;
  };
  enhancement: {
    totalQuestions: number;
    enhancedQuestions: number;
    qualityRating: number;
  };
  userEngagement: {
    activeUsers: number;
    completionRate: number;
    userSatisfaction: number;
  };
}

export default function PerformanceAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadPerformanceMetrics();
  }, [timeRange]);

  const loadPerformanceMetrics = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockMetrics: PerformanceMetrics = {
        overview: {
          totalOperations: 15847,
          successRate: 94.7,
          avgProcessingTime: 3240,
          costPerOperation: 0.0234
        },
        categorization: {
          totalCourses: 1247,
          categorizedCourses: 1189,
          accuracyRate: 96.8
        },
        enhancement: {
          totalQuestions: 14600,
          enhancedQuestions: 13892,
          qualityRating: 4.6
        },
        userEngagement: {
          activeUsers: 2847,
          completionRate: 87.3,
          userSatisfaction: 4.4
        }
      };

      setMetrics(mockMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${Math.round(ms / 60000)}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  if (isLoading || !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
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
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
                <p className="text-gray-600">Monitor AI operations and system performance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              <button
                onClick={loadPerformanceMetrics}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Total Operations</h3>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.overview.totalOperations.toLocaleString()}
            </div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowUp className="h-4 w-4" />
              <span className="ml-1">12.5% vs last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Success Rate</h3>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.overview.successRate}%
            </div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowUp className="h-4 w-4" />
              <span className="ml-1">2.1% vs last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Avg Processing Time</h3>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatDuration(metrics.overview.avgProcessingTime)}
            </div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowDown className="h-4 w-4" />
              <span className="ml-1">8.3% vs last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Cost per Operation</h3>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(metrics.overview.costPerOperation)}
            </div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowDown className="h-4 w-4" />
              <span className="ml-1">5.2% vs last period</span>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Categorization Analytics */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                Course Categorization
              </h3>
              <div className="text-2xl font-bold text-purple-600">
                {metrics.categorization.accuracyRate}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{metrics.categorization.categorizedCourses}</div>
                <div className="text-sm text-gray-600">Categorized</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{metrics.categorization.totalCourses}</div>
                <div className="text-sm text-gray-600">Total Courses</div>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${(metrics.categorization.categorizedCourses / metrics.categorization.totalCourses) * 100}%` }}
              />
            </div>
            <div className="text-center text-sm text-gray-600 mt-2">
              {Math.round((metrics.categorization.categorizedCourses / metrics.categorization.totalCourses) * 100)}% Complete
            </div>
          </div>

          {/* Enhancement Analytics */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Brain className="h-5 w-5 text-blue-600 mr-2" />
                Question Enhancement
              </h3>
              <div className="flex items-center">
                <Award className="h-5 w-5 text-yellow-400 mr-1" />
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.enhancement.qualityRating}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{metrics.enhancement.enhancedQuestions}</div>
                <div className="text-sm text-gray-600">Enhanced</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{metrics.enhancement.totalQuestions}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(metrics.enhancement.enhancedQuestions / metrics.enhancement.totalQuestions) * 100}%` }}
              />
            </div>
            <div className="text-center text-sm text-gray-600 mt-2">
              {Math.round((metrics.enhancement.enhancedQuestions / metrics.enhancement.totalQuestions) * 100)}% Enhanced
            </div>
          </div>
        </div>

        {/* User Engagement */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 text-green-600 mr-2" />
              User Engagement
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{metrics.userEngagement.activeUsers}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{metrics.userEngagement.completionRate}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-6 w-6 text-yellow-400 mr-2" />
                <div className="text-3xl font-bold text-purple-600">{metrics.userEngagement.userSatisfaction}</div>
              </div>
              <div className="text-sm text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}