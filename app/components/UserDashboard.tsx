"use client";

import React, { useState, useEffect } from 'react';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [quizzes, setQuizzes] = useState([]);
  const [userStats, setUserStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    completedTopics: 0,
    currentStreak: 0
  });

  // Mock quiz data - replace with Firebase data
  const mockQuizzes = [
    {
      id: 'MSQ Quiz 4',
      title: 'Cytokines and Interleukins in Immune Response',
      specialty: 'Immunology',
      questionCount: 25,
      difficulty: 'Advanced',
      completed: true,
      lastScore: 85,
      progress: 100
    },
    {
      id: 'CARDIO-101',
      title: 'Basic Cardiac Physiology',
      specialty: 'Cardiology', 
      questionCount: 30,
      difficulty: 'Intermediate',
      completed: false,
      lastScore: null,
      progress: 0
    },
    {
      id: 'NEURO-205',
      title: 'Neurological Pathways and Disorders',
      specialty: 'Neurology',
      questionCount: 40,
      difficulty: 'Advanced',
      completed: false,
      lastScore: 72,
      progress: 60
    },
    {
      id: 'PHARM-150',
      title: 'Pharmacokinetics and Drug Interactions',
      specialty: 'Pharmacology',
      questionCount: 35,
      difficulty: 'Intermediate',
      completed: true,
      lastScore: 92,
      progress: 100
    }
  ];

  const specialties = [
    { name: 'All Topics', count: 150, icon: '📚' },
    { name: 'Immunology', count: 25, icon: '🦠' },
    { name: 'Cardiology', count: 30, icon: '❤️' },
    { name: 'Neurology', count: 20, icon: '🧠' },
    { name: 'Pharmacology', count: 28, icon: '💊' },
    { name: 'Pathology', count: 22, icon: '🔬' },
    { name: 'Anatomy', count: 25, icon: '🫀' }
  ];

  const recentActivity = [
    { quiz: 'Cytokines Quiz', score: 85, date: '2 hours ago', specialty: 'Immunology' },
    { quiz: 'Cardiac Cycle', score: 78, date: '1 day ago', specialty: 'Cardiology' },
    { quiz: 'Drug Metabolism', score: 92, date: '3 days ago', specialty: 'Pharmacology' },
    { quiz: 'Neural Pathways', score: 81, date: '5 days ago', specialty: 'Neurology' }
  ];

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Track your progress and continue your medical studies</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'browse', name: 'Browse Quizzes', icon: '📚' },
              { id: 'progress', name: 'Progress', icon: '📈' },
              { id: 'analytics', name: 'Analytics', icon: '🎯' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🎯</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">23</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">📊</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-blue-600">84%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🏆</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Topics Mastered</p>
                    <p className="text-2xl font-bold text-green-600">8</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🔥</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Streak</p>
                    <p className="text-2xl font-bold text-orange-600">7 days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{activity.quiz}</p>
                        <p className="text-sm text-gray-500">{activity.specialty} • {activity.date}</p>
                      </div>
                      <div className={`text-lg font-bold ${getScoreColor(activity.score)}`}>
                        {activity.score}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    🚀 Continue Last Quiz
                  </button>
                  <button 
                    onClick={() => setActiveTab('browse')}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    📚 Browse All Quizzes
                  </button>
                  <button className="w-full bg-green-100 text-green-700 py-3 px-4 rounded-lg font-medium hover:bg-green-200 transition-colors">
                    🎯 Practice Weak Areas
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Browse Quizzes Tab */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Specialty Filter */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Medical Specialties</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {specialties.map((specialty, index) => (
                  <button
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg text-center hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-2xl mb-2">{specialty.icon}</div>
                    <div className="font-medium text-sm text-gray-900">{specialty.name}</div>
                    <div className="text-xs text-gray-500">{specialty.count} quizzes</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quiz List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Available Quizzes</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option>All Specialties</option>
                      <option>Immunology</option>
                      <option>Cardiology</option>
                      <option>Neurology</option>
                    </select>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option>All Difficulties</option>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {mockQuizzes.map((quiz) => (
                    <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                              {quiz.difficulty}
                            </span>
                            {quiz.completed && <span className="text-green-500 text-sm">✅ Completed</span>}
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>📚 {quiz.specialty}</span>
                            <span>❓ {quiz.questionCount} questions</span>
                            {quiz.lastScore && (
                              <span className={`font-medium ${getScoreColor(quiz.lastScore)}`}>
                                Last Score: {quiz.lastScore}%
                              </span>
                            )}
                          </div>
                          {quiz.progress > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{quiz.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${quiz.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="ml-6">
                          <a
                            href={`/quiz/${quiz.id}`}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                          >
                            {quiz.progress > 0 ? 'Continue' : 'Start Quiz'}
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Learning Progress by Specialty</h3>
              <div className="space-y-6">
                {specialties.slice(1).map((specialty, index) => {
                  const progress = Math.floor(Math.random() * 100);
                  const avgScore = Math.floor(Math.random() * 40) + 60;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{specialty.icon}</span>
                          <span className="font-medium">{specialty.name}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className={`font-medium ${getScoreColor(avgScore)}`}>Avg: {avgScore}%</span>
                          <span className="ml-3">{progress}% Complete</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-green-700">💪 Your Strengths</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>💊 Pharmacology</span>
                    <span className="font-bold text-green-600">94% avg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🫀 Anatomy</span>
                    <span className="font-bold text-green-600">89% avg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🦠 Immunology</span>
                    <span className="font-bold text-green-600">87% avg</span>
                  </div>
                </div>
              </div>

              {/* Areas to Improve */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-orange-700">🎯 Focus Areas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>🧠 Neurology</span>
                    <span className="font-bold text-orange-600">68% avg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🔬 Pathology</span>
                    <span className="font-bold text-orange-600">72% avg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>❤️ Cardiology</span>
                    <span className="font-bold text-orange-600">75% avg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Recommendations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">📚 Personalized Study Recommendations</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium text-blue-900 mb-2">🧠 Focus on Neurology</h4>
                  <p className="text-sm text-blue-700">You've scored below 70% in recent neurology quizzes. Try reviewing neural pathways.</p>
                  <button className="mt-3 text-sm bg-blue-600 text-white px-3 py-1 rounded">Study Now</button>
                </div>
                
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <h4 className="font-medium text-green-900 mb-2">💊 Keep up Pharmacology</h4>
                  <p className="text-sm text-green-700">Excellent work! You're consistently scoring above 90% in pharmacology.</p>
                  <button className="mt-3 text-sm bg-green-600 text-white px-3 py-1 rounded">Advanced Quiz</button>
                </div>
                
                <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <h4 className="font-medium text-yellow-900 mb-2">🔄 Review Cardiology</h4>
                  <p className="text-sm text-yellow-700">It's been 5 days since your last cardiology quiz. Time for a refresher!</p>
                  <button className="mt-3 text-sm bg-yellow-600 text-white px-3 py-1 rounded">Take Quiz</button>
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