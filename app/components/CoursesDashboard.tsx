// components/CoursesDashboard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getAllCourses } from '../../lib/courseService';
import { 
  Book, 
  Search, 
  Filter, 
  Play, 
  Clock, 
  Award, 
  TrendingUp,
  BookOpen,
  Target,
  Star,
  ChevronRight,
  BarChart3,
  Users,
  Calendar,
  CheckCircle,
  Circle
} from 'lucide-react';

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

const CoursesDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const coursesData = await getAllCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || course.specialty === selectedSpecialty;
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    return matchesSearch && matchesSpecialty && matchesDifficulty;
  });

  const specialties = Array.from(new Set(courses.map(course => course.specialty)));
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  // Calculate stats
  const stats = {
    totalCourses: courses.length,
    completed: courses.filter(c => c.completed).length,
    inProgress: courses.filter(c => c.progress > 0 && !c.completed).length,
    avgScore: courses.filter(c => c.lastScore !== null).reduce((sum, c) => sum + (c.lastScore || 0), 0) / courses.filter(c => c.lastScore !== null).length || 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Quiz-Driven Courses 📚</h1>
                <p className="text-blue-100 mt-2">Structured learning paths with comprehensive assessments</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.completed}/{stats.totalCourses}</div>
                  <p className="text-blue-100 text-sm">Courses Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6 text-center">
            <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-green-100/50 border border-green-100/30 p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-orange-100/50 border border-orange-100/30 p-6 text-center">
            <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-100/50 border border-purple-100/30 p-6 text-center">
            <Award className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{Math.round(stats.avgScore)}%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              />
            </div>
            
            <div className="flex space-x-3">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="border border-blue-200/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              >
                <option value="all">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="border border-blue-200/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              >
                <option value="all">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>

              <div className="flex border border-blue-200/50 rounded-lg bg-white/80">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-3 rounded-l-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-blue-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-3 rounded-r-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-blue-50'
                  }`}
                >
                  <Book className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid/List */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {filteredCourses.map(course => (
              <div key={course.id} className={`bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 transition-all hover:shadow-xl hover:scale-105 ${
                viewMode === 'list' ? 'flex items-center p-4' : 'p-6'
              }`}>
                
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        {course.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        ) : course.progress > 0 ? (
                          <Clock className="w-5 h-5 text-orange-500 mr-2" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 mr-2" />
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          course.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                          course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {course.difficulty}
                        </span>
                      </div>
                      <Star className="w-5 h-5 text-gray-400 hover:text-yellow-500 cursor-pointer" />
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>🏥 {course.specialty}</span>
                      <span>❓ {course.questionCount} questions</span>
                    </div>

                    {course.progress > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {course.lastScore && (
                      <div className="mb-4 text-sm">
                        <span className="text-gray-600">Last Score: </span>
                        <span className={`font-medium ${
                          course.lastScore >= 80 ? 'text-green-600' :
                          course.lastScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {course.lastScore}%
                        </span>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                        <Play className="w-4 h-4 mr-2" />
                        {course.progress > 0 ? 'Continue' : 'Start Course'}
                      </button>
                      <button className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  // List View
                  <>
                    <div className="flex-1 flex items-center space-x-4">
                      {course.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : course.progress > 0 ? (
                        <Clock className="w-6 h-6 text-orange-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-600">{course.specialty} • {course.questionCount} questions</p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          course.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                          course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {course.difficulty}
                        </span>

                        {course.progress > 0 && (
                          <div className="w-24">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {course.lastScore && (
                          <span className={`text-sm font-medium ${
                            course.lastScore >= 80 ? 'text-green-600' :
                            course.lastScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {course.lastScore}%
                          </span>
                        )}

                        <button className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
                          <Play className="w-4 h-4 mr-2" />
                          {course.progress > 0 ? 'Continue' : 'Start'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesDashboard;