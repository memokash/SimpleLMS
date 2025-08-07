'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
  BookOpen,
  Star,
  Clock,
  Lock,
  Search,
  Sparkles,
  Brain,
  Layers,
  Filter,
  CheckCircle,
  ChevronRight,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  estimatedTime?: string;
  rating?: number;
  tier?: 'free' | 'pro' | 'premium';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  imageURL?: string;
}

const CoursesDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Critical: Add mounted state to prevent SSR issues
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [questionAmount, setQuestionAmount] = useState<Record<string, number>>({});

  // Handle mounting to prevent SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe function to load courses (only on client)
  const loadCourses = async () => {
    if (!mounted) {
      return;
    }

    try {
      setError(null);
      
      // Mock courses data for now - replace with actual Firebase calls when ready
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'Cardiology Fundamentals',
          description: 'Master the essentials of cardiovascular medicine with comprehensive questions covering anatomy, physiology, pathology, and clinical management.',
          questionCount: 250,
          estimatedTime: '3-4 hours',
          rating: 4.9,
          tier: 'free',
          difficulty: 'intermediate',
          category: 'Cardiology'
        },
        {
          id: '2',
          title: 'Emergency Medicine Scenarios',
          description: 'Real-world emergency scenarios and critical decision making. Perfect for medical students and residents preparing for emergency rotations.',
          questionCount: 180,
          estimatedTime: '2-3 hours',
          rating: 4.8,
          tier: 'pro',
          difficulty: 'advanced',
          category: 'Emergency Medicine'
        },
        {
          id: '3',
          title: 'Internal Medicine Boards Prep',
          description: 'Comprehensive internal medicine questions covering all major systems. Designed for board preparation and clinical excellence.',
          questionCount: 400,
          estimatedTime: '5-6 hours',
          rating: 4.9,
          tier: 'premium',
          difficulty: 'advanced',
          category: 'Internal Medicine'
        },
        {
          id: '4',
          title: 'Pediatrics Clinical Cases',
          description: 'Pediatric medicine from newborn to adolescent. Covers development, diseases, and management specific to children.',
          questionCount: 200,
          estimatedTime: '3 hours',
          rating: 4.7,
          tier: 'free',
          difficulty: 'intermediate',
          category: 'Pediatrics'
        },
        {
          id: '5',
          title: 'Neurology Deep Dive',
          description: 'Complex neurological conditions, diagnostic workups, and treatment protocols. For advanced learners.',
          questionCount: 150,
          estimatedTime: '2-3 hours',
          rating: 4.8,
          tier: 'pro',
          difficulty: 'advanced',
          category: 'Neurology'
        },
        {
          id: '6',
          title: 'Psychiatry & Mental Health',
          description: 'Mental health disorders, therapeutic approaches, and psychopharmacology. Essential for well-rounded medical education.',
          questionCount: 175,
          estimatedTime: '2-3 hours',
          rating: 4.6,
          tier: 'free',
          difficulty: 'beginner',
          category: 'Psychiatry'
        },
        {
          id: '7',
          title: 'Surgical Principles',
          description: 'Pre-operative, operative, and post-operative care. Surgical anatomy and common procedures across specialties.',
          questionCount: 220,
          estimatedTime: '3-4 hours',
          rating: 4.9,
          tier: 'pro',
          difficulty: 'advanced',
          category: 'Surgery'
        },
        {
          id: '8',
          title: 'USMLE Step 1 Practice',
          description: 'High-yield USMLE Step 1 questions covering all basic science topics. Perfect for exam preparation.',
          questionCount: 500,
          estimatedTime: '6-8 hours',
          rating: 4.9,
          tier: 'premium',
          difficulty: 'intermediate',
          category: 'USMLE'
        }
      ];

      setCourses(mockCourses);

      // Uncomment below to use real Firebase data once build issues are resolved
      /*
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      const snap = await getDocs(collection(db, 'courses'));
      const data: Course[] = [];
      snap.forEach(doc => {
        const d = doc.data();
        data.push({ id: doc.id, ...d } as Course);
      });
      setCourses(data);
      */

    } catch (error) {
      console.error('Error loading courses:', error);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load courses only after mounting
  useEffect(() => {
    if (mounted) {
      loadCourses();
    }
  }, [mounted]);

  const handleQuizStart = (courseId: string) => {
    if (!mounted) {
      return;
    }

    const count = questionAmount[courseId] || 10;
    router.push(`/quiz?id=${courseId}&limit=${count}`);
  };

  const retryLoad = () => {
    setError(null);
    setLoading(true);
    loadCourses();
  };

  // Filter courses based on search and category
  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                        c.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filter === 'all' || c.category === filter;
    return matchSearch && matchCategory;
  });

  // Don't render until mounted (prevents SSR issues)
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="flex items-center text-gray-600 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <Brain className="animate-pulse h-6 w-6 mr-3 text-purple-500" />
          <span className="text-lg font-medium">Loading courses...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <h3 className="text-lg font-semibold text-red-800">Error Loading Courses</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={retryLoad}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Explore Master-Level Medical Quizzes
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-300 max-w-2xl mx-auto">
            15,000+ questions across all specialties. Built to help you dominate your boards. Choose a course below to start.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            <input
              className="w-full rounded-xl pl-12 pr-4 py-3 border border-gray-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 items-center">
            <Filter className="text-gray-500" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="rounded-xl px-4 py-3 border border-gray-300 bg-white dark:bg-gray-800 text-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="all">All Specialties</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Emergency Medicine">Emergency Medicine</option>
              <option value="Internal Medicine">Internal Medicine</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Psychiatry">Psychiatry</option>
              <option value="Surgery">Surgery</option>
              <option value="USMLE">USMLE</option>
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(course => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02] border border-white/20 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 flex-1">
                    {course.title}
                  </h2>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ml-2 flex-shrink-0 ${
                    course.tier === 'free' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : course.tier === 'pro'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                  }`}>
                    {course.tier?.toUpperCase() || 'FREE'}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>

                <div className="flex flex-wrap text-xs text-gray-500 dark:text-gray-400 mb-4 gap-3">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" /> 
                    {course.questionCount} Qs
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> 
                    {course.estimatedTime || 'Self-paced'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" /> 
                    {course.rating || 4.8}
                  </span>
                </div>

                {/* Difficulty Badge */}
                {course.difficulty && (
                  <div className="mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      course.difficulty === 'beginner' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : course.difficulty === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                    </span>
                  </div>
                )}

                {/* Question Amount Input and Start Button */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="# of questions"
                    min={1}
                    max={course.questionCount}
                    value={questionAmount[course.id] || ''}
                    onChange={e => setQuestionAmount({
                      ...questionAmount,
                      [course.id]: Number(e.target.value)
                    })}
                  />
                  <button
                    onClick={() => handleQuizStart(course.id)}
                    disabled={!questionAmount[course.id] || questionAmount[course.id] <= 0}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Start</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Premium Lock for paid courses */}
                {course.tier !== 'free' && !user && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                    <Lock className="h-3 w-3" />
                    <span>Sign in required for {course.tier} content</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto shadow-lg">
              <XCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Courses Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No courses match your search criteria. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setFilter('all');
                }}
                className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Course Stats */}
        {courses.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Course Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {courses.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {courses.reduce((sum, course) => sum + course.questionCount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {courses.filter(c => c.tier === 'free').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Free Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {new Set(courses.map(c => c.category)).size}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Specialties</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesDashboard;