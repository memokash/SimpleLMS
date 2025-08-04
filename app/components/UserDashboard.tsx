"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { 
  Book, 
  Search, 
  Play, 
  Clock, 
  Award, 
  BookOpen,
  Target,
  Star,
  BarChart3,
  Users,
  CheckCircle,
  Circle,
  Trophy,
  Sparkles,
  ArrowRight,
  PlayCircle,
  Share2,
  Bookmark,
  Lock,
  Crown
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  courseName: string;
  description: string;
  specialty?: string;
  difficulty?: string;
  questionCount: number;
  completed?: boolean;
  lastScore?: number | null;
  progress?: number;
  estimatedTime?: string;
  rating?: number;
  studentsEnrolled?: number;
  tier?: 'free' | 'pro' | 'premium';
  isPremium?: boolean;
}

interface UserStats {
  questionsContributed?: number;
  quizzesCompleted?: number;
  averageScore?: number;
  tier?: 'free' | 'pro' | 'premium';
}

const CoursesDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ SIMPLIFIED: Basic data loading without complex category logic
  useEffect(() => {
    const loadSimpleData = async () => {
      try {
        setLoading(true);
        
        // Mock data for now - replace with your simple Firebase call
        const mockCourses: Course[] = [
          {
            id: 'MSQ Quiz 4',
            title: 'MSQ Quiz 4',
            courseName: 'MSQ Quiz 4',
            description: 'Medical School Quiz Set 4 - Comprehensive medical knowledge assessment',
            specialty: 'General Medicine',
            difficulty: 'Intermediate',
            questionCount: 45,
            completed: false,
            progress: 0,
            estimatedTime: '45 min',
            rating: 4.8,
            studentsEnrolled: 1247,
            tier: 'free'
          },
          {
            id: 'cardiology-basics',
            title: 'Cardiology Fundamentals',
            courseName: 'Cardiology Fundamentals',
            description: 'Essential cardiology concepts for medical students',
            specialty: 'Cardiology',
            difficulty: 'Beginner',
            questionCount: 30,
            completed: false,
            progress: 0,
            estimatedTime: '30 min',
            rating: 4.9,
            studentsEnrolled: 892,
            tier: 'pro'
          },
          {
            id: 'emergency-medicine',
            title: 'Emergency Medicine Scenarios',
            courseName: 'Emergency Medicine Scenarios',
            description: 'Critical emergency medicine case studies and protocols',
            specialty: 'Emergency Medicine',
            difficulty: 'Advanced',
            questionCount: 60,
            completed: false,
            progress: 0,
            estimatedTime: '60 min',
            rating: 4.7,
            studentsEnrolled: 654,
            tier: 'premium'
          }
        ];

        setCourses(mockCourses);

        // Simple user stats
        if (user) {
          setUserStats({
            questionsContributed: 0,
            quizzesCompleted: 0,
            averageScore: 0,
            tier: 'free'
          });
        }

      } catch (err) {
        console.error('Error loading courses:', err);
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    loadSimpleData();
  }, [user]);

  // ✅ OPTIMIZED: Memoized filtering to prevent re-computation
  const filteredCourses = useMemo(() => {
    if (!searchTerm) {
      return courses;
    }
    
    return courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.specialty && course.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [courses, searchTerm]);

  // ✅ SIMPLIFIED: Basic access check without complex nesting
  const canAccessCourse = (course: Course) => {
    if (!user) {
      return false;
    }
    
    const userTier = userStats?.tier || 'free';
    const courseTier = course.tier || 'free';
    
    if (courseTier === 'free') {
      return true;
    }
    if (courseTier === 'pro' && (userTier === 'pro' || userTier === 'premium')) {
      return true;
    }
    if (courseTier === 'premium' && userTier === 'premium') {
      return true;
    }
    
    return false;
  };

  // ✅ SIMPLIFIED: Direct navigation without complex checks
  const handleCourseClick = (course: Course) => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (!canAccessCourse(course)) {
      alert(`This course requires ${course.tier} tier access. Please upgrade your subscription.`);
      return;
    }

    router.push(`/quiz?id=${encodeURIComponent(course.id)}`);
  };

  // ✅ SIMPLIFIED: Basic stats calculation
  const stats = useMemo(() => ({
    totalCourses: courses.length,
    completed: courses.filter(c => c.completed).length,
    inProgress: courses.filter(c => c.progress && c.progress > 0 && !c.completed).length,
    avgScore: userStats?.averageScore || 0
  }), [courses, userStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
      {/* Simplified Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 p-3 rounded-xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">MedicalSchoolQuizzes</h1>
                <p className="text-blue-100">Master your medical knowledge</p>
              </div>
            </div>
            
            {userStats && (
              <div className="hidden lg:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{userStats.averageScore || 0}%</div>
                  <p className="text-blue-100 text-sm">Average Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{userStats.quizzesCompleted || 0}</div>
                  <p className="text-blue-100 text-sm">Completed</p>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold px-3 py-1 rounded-full ${
                    userStats.tier === 'premium' ? 'bg-purple-500' :
                    userStats.tier === 'pro' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {userStats.tier?.charAt(0).toUpperCase() + userStats.tier?.slice(1) || 'Free'}
                  </div>
                  <p className="text-blue-100 text-sm">Tier</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Simplified Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 p-3 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalCourses}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
          
          <div className="bg-white/80 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-500 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          
          <div className="bg-white/80 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-500 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          
          <div className="bg-white/80 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 p-3 rounded-xl">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{Math.round(stats.avgScore)}%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
        </div>

        {/* Simplified Search */}
        <div className="bg-white/80 rounded-2xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-0 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Simplified Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">Try a different search term</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => {
              const hasAccess = canAccessCourse(course);
              
              return (
                <div key={course.id} className="bg-white/90 rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  
                  {/* Course Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <Circle className="w-5 h-5" />
                      </div>
                      {course.difficulty && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {course.difficulty}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm">{course.rating || 4.8}</span>
                      {course.tier && course.tier !== 'free' && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          course.tier === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {course.tier === 'premium' ? '👑' : '⭐'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Course Content */}
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <span className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      {course.questionCount} questions
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.estimatedTime || '45 min'}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={() => handleCourseClick(course)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center ${
                      hasAccess 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                    disabled={!hasAccess}
                  >
                    {!user ? (
                      <Lock className="w-4 h-4 mr-2" />
                    ) : !hasAccess ? (
                      <Crown className="w-4 h-4 mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {user ? (hasAccess ? 'Start Course' : 'Upgrade Required') : 'Sign In to Access'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesDashboard;