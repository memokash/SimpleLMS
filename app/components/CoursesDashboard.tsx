"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCoursesWithProgress, getUserStats } from '../../lib/courseService';
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
  Circle,
  Trophy,
  Zap,
  Brain,
  Sparkles,
  ArrowRight,
  RotateCcw,
  PauseCircle,
  PlayCircle,
  Download,
  Share2,
  Bookmark
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
  estimatedTime: string;
  instructor: string;
  rating: number;
  studentsEnrolled: number;
  lastAccessed?: Date;
}

interface UserStats {
  questionsContributed: number;
  quizzesCompleted: number;
  totalScore: number;
  averageScore: number;
  streak: number;
  rank: string;
}

const CoursesDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, in-progress, completed, new
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Load courses with user progress if user is logged in
      const coursesData = user?.uid 
        ? await getCoursesWithProgress(user.uid)
        : await getCoursesWithProgress(null);
      setCourses(coursesData);

      // Load user stats if user is logged in
      if (user?.uid) {
        const stats = await getUserStats(user.uid);
        setUserStats({
          questionsContributed: stats.questionsContributed || 0,
          quizzesCompleted: stats.coursesCompleted || 0,
          totalScore: stats.totalScore || 0,
          averageScore: stats.averageScore || 0,
          streak: stats.streak || 0,
          rank: stats.rank || 'Beginner'
        });
      }
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
    
    let matchesFilter = true;
    if (selectedFilter === 'completed') {
      matchesFilter = course.completed;
    }
    else if (selectedFilter === 'in-progress') {
      matchesFilter = course.progress > 0 && !course.completed;
    }
    else if (selectedFilter === 'new') {
      matchesFilter = course.progress === 0;
    }
    
    return matchesSearch && matchesSpecialty && matchesDifficulty && matchesFilter;
  });

  const specialties = Array.from(new Set(courses.map(course => course.specialty)));
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  // Calculate enhanced stats
  const stats = {
    totalCourses: courses.length,
    completed: courses.filter(c => c.completed).length,
    inProgress: courses.filter(c => c.progress > 0 && !c.completed).length,
    avgScore: courses.filter(c => c.lastScore !== null).reduce((sum, c) => sum + (c.lastScore || 0), 0) / courses.filter(c => c.lastScore !== null).length || 0,
    completionRate: courses.length > 0 ? (courses.filter(c => c.completed).length / courses.length) * 100 : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <div className="space-y-2">
            <div className="h-4 bg-blue-200 rounded-full w-48 mx-auto animate-pulse"></div>
            <div className="h-3 bg-blue-100 rounded-full w-32 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">MedicalSchoolQuizzes</h1>
                  <p className="text-blue-100 text-lg">Master your medical knowledge with expert-crafted assessments that coach and train</p>
                </div>
              </div>
              
              {userStats && (
                <div className="hidden lg:flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{userStats.averageScore}%</div>
                    <p className="text-blue-100 text-sm">Average Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{userStats.quizzesCompleted}</div>
                    <p className="text-blue-100 text-sm">Completed</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold px-3 py-1 rounded-full border-2 ${
                      userStats.rank === 'Master' ? 'border-yellow-300 text-yellow-200' :
                      userStats.rank === 'Expert' ? 'border-purple-300 text-purple-200' :
                      userStats.rank === 'Advanced' ? 'border-blue-300 text-blue-200' :
                      'border-gray-300 text-gray-200'
                    }`}>
                      {userStats.rank}
                    </div>
                    <p className="text-blue-100 text-sm">Rank</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-blue-200/50 border border-white/50 p-6 hover:shadow-2xl hover:shadow-blue-300/30 transition-all duration-500 hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <Sparkles className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalCourses}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
            <div className="mt-2 text-xs text-blue-600">+2 this week</div>
          </div>
          
          <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-emerald-200/50 border border-white/50 p-6 hover:shadow-2xl hover:shadow-emerald-300/30 transition-all duration-500 hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <Trophy className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
            <div className="mt-2 text-xs text-emerald-600">{Math.round(stats.completionRate)}% completion rate</div>
          </div>
          
          <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-amber-200/50 border border-white/50 p-6 hover:shadow-2xl hover:shadow-amber-300/30 transition-all duration-500 hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <Zap className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
            <div className="mt-2 text-xs text-amber-600">Keep going!</div>
          </div>
          
          <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-purple-200/50 border border-white/50 p-6 hover:shadow-2xl hover:shadow-purple-300/30 transition-all duration-500 hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Award className="w-6 h-6 text-white" />
              </div>
              <Brain className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{Math.round(stats.avgScore)}%</div>
            <div className="text-sm text-gray-600">Average Score</div>
            <div className="mt-2 text-xs text-purple-600">Excellent work!</div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-blue-200/50 border border-white/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by title, specialty, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-0 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Filter chips */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                {['all', 'new', 'in-progress', 'completed'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedFilter === filter
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
              
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="border-0 bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                <option value="all">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="border-0 bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                <option value="all">All Levels</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>

              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Book className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Courses Display */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-blue-200/50 border border-white/50 p-12 max-w-md mx-auto">
              <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No courses found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or explore our featured courses</p>
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all">
                Browse All Courses
              </button>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            : "space-y-6"
          }>
            {filteredCourses.map(course => (
              <div key={course.id} className={`group bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-200/30 border border-white/60 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-300/40 hover:-translate-y-3 ${
                viewMode === 'list' ? 'flex items-center p-6' : 'p-8'
              }`}>
                
                {viewMode === 'grid' ? (
                  // Enhanced Grid View
                  <>
                    {/* Course Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-xl ${
                          course.completed ? 'bg-emerald-100 text-emerald-600' :
                          course.progress > 0 ? 'bg-amber-100 text-amber-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {course.completed ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : course.progress > 0 ? (
                            <PlayCircle className="w-6 h-6" />
                          ) : (
                            <Circle className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            course.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
                            course.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {course.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{course.rating || 4.8}</span>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="mb-6">
                      <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            {course.specialty}
                          </span>
                          <span className="flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            {course.questionCount} questions
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {course.estimatedTime || '45 min'}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {course.studentsEnrolled || 1247} enrolled
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {course.progress > 0 && (
                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-2 rounded-full transition-all duration-1000 bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Last Score */}
                    {course.lastScore && (
                      <div className="mb-6">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          course.lastScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                          course.lastScore >= 60 ? 'bg-amber-100 text-amber-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          <Award className="w-4 h-4 mr-1" />
                          Last Score: {course.lastScore}%
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center group">
                        <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        {course.progress > 0 ? 'Continue' : 'Start Course'}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                      
                      <div className="flex space-x-2">
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-xl transition-all hover:scale-105">
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-xl transition-all hover:scale-105">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  // Enhanced List View
                  <>
                    <div className="flex-1 flex items-center space-x-6">
                      <div className={`p-4 rounded-xl ${
                        course.completed ? 'bg-emerald-100 text-emerald-600' :
                        course.progress > 0 ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {course.completed ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : course.progress > 0 ? (
                          <PlayCircle className="w-8 h-8" />
                        ) : (
                          <Circle className="w-8 h-8" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                            {course.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{course.rating || 4.8}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>{course.specialty}</span>
                          <span>{course.questionCount} questions</span>
                          <span>{course.estimatedTime || '45 min'}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            course.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
                            course.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {course.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        {course.progress > 0 && (
                          <div className="w-32">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{course.progress}% complete</span>
                          </div>
                        )}

                        {course.lastScore && (
                          <span className={`text-sm font-semibold ${
                            course.lastScore >= 80 ? 'text-emerald-600' :
                            course.lastScore >= 60 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {course.lastScore}%
                          </span>
                        )}

                        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center">
                          <Play className="w-4 h-4 mr-2" />
                          {course.progress > 0 ? 'Continue' : 'Start'}
                          <ArrowRight className="w-4 h-4 ml-2" />
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