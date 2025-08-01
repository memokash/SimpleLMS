"use client";

import React, { useState, useEffect } from 'react';
import { getAllCourses } from '../../lib/courseService';

// TypeScript interfaces
interface Course {
  id: string;
  title: string;
  courseName: string;
  description: string;
  specialty: string;
  difficulty: string;
  questionCount: number;
  completed: boolean;
  lastScore: number | null;
  progress: number;
}

interface QuizResult {
  id: string;
  quizTitle: string;
  specialty: string;
  score: number;
  totalQuestions: number;
  dateTaken: Date;
  timeSpent: number; // minutes
  difficulty: string;
}

interface WeakArea {
  specialty: string;
  topic: string;
  accuracy: number;
  questionsAttempted: number;
  recommendation: string;
}

const UserDashboard = () => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCounts, setSelectedCounts] = useState<Record<string, number | string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with real data from your backend
  const [recentQuizzes] = useState<QuizResult[]>([
    {
      id: '1',
      quizTitle: 'Cardiovascular Pathophysiology',
      specialty: 'Cardiology',
      score: 85,
      totalQuestions: 25,
      dateTaken: new Date('2025-07-29'),
      timeSpent: 18,
      difficulty: 'Intermediate'
    },
    {
      id: '2',
      quizTitle: 'Immunology Fundamentals',
      specialty: 'Immunology',
      score: 92,
      totalQuestions: 20,
      dateTaken: new Date('2025-07-28'),
      timeSpent: 15,
      difficulty: 'Advanced'
    },
    {
      id: '3',
      quizTitle: 'Dermatology Conditions',
      specialty: 'Dermatology',
      score: 76,
      totalQuestions: 30,
      dateTaken: new Date('2025-07-27'),
      timeSpent: 22,
      difficulty: 'Intermediate'
    }
  ]);

  const [weakAreas] = useState<WeakArea[]>([
    {
      specialty: 'Cardiology',
      topic: 'Arrhythmia Classification',
      accuracy: 65,
      questionsAttempted: 12,
      recommendation: 'Focus on ECG interpretation and rhythm analysis'
    },
    {
      specialty: 'Pharmacology',
      topic: 'Drug Interactions',
      accuracy: 58,
      questionsAttempted: 15,
      recommendation: 'Review mechanism of action and contraindications'
    },
    {
      specialty: 'Anatomy',
      topic: 'Neuroanatomy',
      accuracy: 72,
      questionsAttempted: 8,
      recommendation: 'Practice with 3D models and cross-sectional anatomy'
    }
  ]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const coursesData = await getAllCourses();
      setAllCourses(coursesData as Course[]);
      
      const defaultCounts: Record<string, number | string> = {};
      coursesData.forEach((course: any) => {
        defaultCounts[course.id] = 25;
      });
      setSelectedCounts(defaultCounts);
      
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCountChange = (courseId: string, count: number | string) => {
    setSelectedCounts({
      ...selectedCounts,
      [courseId]: count
    });
  };

  const getQuizUrl = (courseId: string) => {
    const count = selectedCounts[courseId] || 25;
    return `/quiz?id=${encodeURIComponent(courseId)}&count=${count}`;
  };

  // Calculate dashboard stats
  const totalQuizzesTaken = recentQuizzes.length;
  const averageScore = Math.round(recentQuizzes.reduce((acc, quiz) => acc + quiz.score, 0) / totalQuizzesTaken);
  const totalStudyTime = recentQuizzes.reduce((acc, quiz) => acc + quiz.timeSpent, 0);
  const currentStreak = 5; // Mock data

  const filteredCourses = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Welcome back, Future Attending! 👨‍⚕️</h1>
                <p className="text-blue-100 mt-2">Continue your medical education journey</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{currentStreak} Day Streak 🔥</div>
                <p className="text-blue-100 text-sm">Keep it up!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: '📊 Overview', count: null },
              { id: 'quizzes', label: '📚 Browse Quizzes', count: allCourses.length },
              { id: 'progress', label: '📈 Progress', count: null },
              { id: 'weak-areas', label: '🎯 Weak Areas', count: weakAreas.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Quizzes Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">{totalQuizzesTaken}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-semibold text-gray-900">{averageScore}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Study Time</p>
                    <p className="text-2xl font-semibold text-gray-900">{totalStudyTime}min</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Current Streak</p>
                    <p className="text-2xl font-semibold text-gray-900">{currentStreak} days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Quizzes */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Quizzes</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentQuizzes.slice(0, 3).map((quiz, index) => (
                      <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{quiz.quizTitle}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {quiz.specialty}
                            </span>
                            <span className="text-xs text-gray-500">
                              {quiz.dateTaken.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${
                            quiz.score >= 80 ? 'text-green-600' : quiz.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {quiz.score}%
                          </div>
                          <div className="text-xs text-gray-500">{quiz.timeSpent}min</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All Results →
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-600 text-white rounded-lg mr-3">⚡</div>
                        <div className="text-left">
                          <div className="font-medium">Quick Practice</div>
                          <div className="text-sm text-gray-600">10 random questions</div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <button className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-600 text-white rounded-lg mr-3">🎯</div>
                        <div className="text-left">
                          <div className="font-medium">Target Weak Areas</div>
                          <div className="text-sm text-gray-600">AI-recommended practice</div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <button className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-600 text-white rounded-lg mr-3">📊</div>
                        <div className="text-left">
                          <div className="font-medium">Performance Review</div>
                          <div className="text-sm text-gray-600">Detailed analytics</div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <button 
                      onClick={() => setActiveTab('quizzes')}
                      className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="p-2 bg-orange-600 text-white rounded-lg mr-3">📚</div>
                        <div className="text-left">
                          <div className="font-medium">Browse All Quizzes</div>
                          <div className="text-sm text-gray-600">{allCourses.length} available</div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Quizzes */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">🤖 AI Recommended for You</h3>
                <p className="text-sm text-gray-600 mt-1">Based on your performance and learning patterns</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allCourses.slice(0, 3).map(course => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <h4 className="font-medium text-gray-900 mb-2">{course.title}</h4>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {course.specialty}
                        </span>
                        <span className="text-xs text-gray-500">{course.difficulty}</span>
                      </div>
                      <a
                        href={getQuizUrl(course.id)}
                        className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Start Quiz
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Browse Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search medical quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quiz Library */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Medical Quiz Library ({filteredCourses.length})
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {filteredCourses.map(course => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{course.title}</h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                              🏥 {course.specialty}
                            </span>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              📝 {course.difficulty}
                            </span>
                          </div>
                          {course.description && (
                            <p className="text-sm text-gray-500 mt-2">{course.description}</p>
                          )}
                        </div>
                        
                        <div className="ml-6 flex items-center space-x-4">
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Questions</label>
                            <select
                              value={selectedCounts[course.id] || 25}
                              onChange={(e) => handleCountChange(course.id, e.target.value)}
                              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value={10}>10 Questions</option>
                              <option value={25}>25 Questions</option>
                              <option value="full">Full Quiz</option>
                            </select>
                          </div>

                          <a
                            href={getQuizUrl(course.id)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <span>Start Quiz</span>
                            {selectedCounts[course.id] !== 'full' && (
                              <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full">
                                {selectedCounts[course.id]} Q
                              </span>
                            )}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Analytics</h3>
              
              {/* Performance Chart Placeholder */}
              <div className="bg-gray-50 rounded-lg p-8 text-center mb-6">
                <div className="text-4xl mb-4">📈</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Progress Tracking Coming Soon</h4>
                <p className="text-gray-600">Detailed analytics and progress visualization will be available here</p>
              </div>

              {/* Recent Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Recent Quiz Scores</h4>
                  <div className="space-y-3">
                    {recentQuizzes.map(quiz => (
                      <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{quiz.quizTitle}</div>
                          <div className="text-xs text-gray-500">{quiz.dateTaken.toLocaleDateString()}</div>
                        </div>
                        <div className={`font-semibold ${
                          quiz.score >= 80 ? 'text-green-600' : quiz.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {quiz.score}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Study Streaks</h4>
                  <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">{currentStreak} Days</div>
                    <div className="text-sm text-orange-700">Current study streak</div>
                    <div className="text-xs text-orange-600 mt-2">Keep it up! 🔥</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weak Areas Tab */}
        {activeTab === 'weak-areas' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">🎯 Areas for Improvement</h3>
                <p className="text-sm text-gray-600 mt-1">AI-powered analysis of your performance patterns</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {weakAreas.map((area, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{area.topic}</h4>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {area.specialty}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center">
                              <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    area.accuracy >= 80 ? 'bg-green-500' : 
                                    area.accuracy >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${area.accuracy}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{area.accuracy}%</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {area.questionsAttempted} questions attempted
                            </span>
                          </div>
                          
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <div className="text-xs font-medium text-blue-800 mb-1">💡 AI Recommendation:</div>
                            <div className="text-sm text-blue-700">{area.recommendation}</div>
                          </div>
                        </div>
                        
                        <button className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          Practice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                    🤖 Generate Personalized Study Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;