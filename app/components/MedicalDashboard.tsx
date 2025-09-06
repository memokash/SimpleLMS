"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import {
  BookOpen,
  Brain,
  Users,
  Target,
  TrendingUp,
  Clock,
  Award,
  Calendar,
  Stethoscope,
  Heart,
  Activity,
  FileText,
  ChevronRight,
  GraduationCap,
  Microscope,
  Pill,
  Syringe,
  AlertCircle
} from 'lucide-react';

// Medical specialty configuration
const medicalSpecialties = [
  { id: 'cardiology', name: 'Cardiology', icon: Heart, color: 'text-red-600 bg-red-50 border-red-200' },
  { id: 'neurology', name: 'Neurology', icon: Brain, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'pediatrics', name: 'Pediatrics', icon: Users, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  { id: 'surgery', name: 'Surgery', icon: Syringe, color: 'text-green-600 bg-green-50 border-green-200' },
  { id: 'internal', name: 'Internal Medicine', icon: Stethoscope, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'pathology', name: 'Pathology', icon: Microscope, color: 'text-amber-600 bg-amber-50 border-amber-200' },
];

const MedicalDashboard = () => {
  const { user } = useAuth();
  
  // Mock stats - replace with real data
  const stats = {
    totalQuizzes: 156,
    completedQuizzes: 42,
    averageScore: 78,
    studyStreak: 7,
    totalQuestions: 2340,
    correctAnswers: 1825,
  };

  const accuracy = Math.round((stats.correctAnswers / stats.totalQuestions) * 100) || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, Dr. {user?.displayName || 'Student'}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Continue your medical education journey
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {stats.studyStreak} day streak
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compact Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Quizzes</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.totalQuizzes}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Completed</p>
                <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedQuizzes}</p>
              </div>
              <Award className="w-8 h-8 text-green-600 dark:text-green-400 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Avg Score</p>
                <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.averageScore}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-600 dark:text-amber-400 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Accuracy</p>
                <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">{accuracy}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-600 dark:text-purple-400 opacity-20" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Medical Specialties */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Medical Specialties</h2>
                <Link href="/courses" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {medicalSpecialties.map((specialty) => {
                  const Icon = specialty.icon;
                  return (
                    <Link
                      key={specialty.id}
                      href={`/courses?specialty=${specialty.id}`}
                      className={`
                        flex items-center space-x-3 p-3 rounded-lg border-2
                        ${specialty.color}
                        hover:shadow-md transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{specialty.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Study Tools */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Study Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/question-bank" className="group">
                  <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">Question Bank</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">AI-generated questions</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                  </div>
                </Link>

                <Link href="/rounding-tools" className="group">
                  <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">Rotation Tools</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Clinical resources</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
                    </div>
                  </div>
                </Link>

                <Link href="/study-groups" className="group">
                  <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                        <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">Study Groups</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Collaborate with peers</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                    </div>
                  </div>
                </Link>

                <Link href="/performance-analytics" className="group">
                  <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">Analytics</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Track progress</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                    <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">Completed Cardiology Quiz</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Score: 85% • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">Started Neurology Module</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Progress: 45% • Yesterday</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded">
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">Joined Study Group</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">USMLE Step 1 • 3 days ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">Pathology Exam</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Tomorrow, 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">Study Group Meeting</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Friday, 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Study Tip</h3>
                  <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                    Review your incorrect answers daily to improve retention and identify knowledge gaps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalDashboard;