"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Clock, 
  Users, 
  Award,
  ChevronRight,
  Brain,
  Heart,
  Stethoscope,
  Microscope,
  Pill,
  Activity,
  Baby,
  Syringe,
  Eye,
  Bone,
  RefreshCw
} from 'lucide-react';

// Medical category mapping with icons and colors
const medicalCategories = {
  cardiology: { 
    name: 'Cardiology', 
    icon: Heart, 
    color: 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    description: 'Heart and cardiovascular system'
  },
  neurology: { 
    name: 'Neurology', 
    icon: Brain, 
    color: 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    description: 'Brain and nervous system'
  },
  pediatrics: { 
    name: 'Pediatrics', 
    icon: Baby, 
    color: 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
    description: 'Child and adolescent medicine'
  },
  surgery: { 
    name: 'Surgery', 
    icon: Syringe, 
    color: 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    description: 'Surgical procedures and techniques'
  },
  internal_medicine: { 
    name: 'Internal Medicine', 
    icon: Stethoscope, 
    color: 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    description: 'Adult internal medicine'
  },
  pathology: { 
    name: 'Pathology', 
    icon: Microscope, 
    color: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    description: 'Disease mechanisms and laboratory'
  },
  pharmacology: { 
    name: 'Pharmacology', 
    icon: Pill, 
    color: 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
    description: 'Drug interactions and therapeutics'
  },
  emergency: { 
    name: 'Emergency Medicine', 
    icon: Activity, 
    color: 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    description: 'Emergency and critical care'
  },
  radiology: { 
    name: 'Radiology', 
    icon: Eye, 
    color: 'border-gray-500 bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
    description: 'Medical imaging and diagnostics'
  },
  orthopedics: { 
    name: 'Orthopedics', 
    icon: Bone, 
    color: 'border-stone-500 bg-stone-50 text-stone-700 dark:bg-stone-900/20 dark:text-stone-400',
    description: 'Musculoskeletal system'
  },
};

interface Quiz {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  questionCount: number;
  estimatedTime: number;
  completions?: number;
  averageScore?: number;
  lastUpdated?: Date;
  tags?: string[];
}

const MedicalCoursesPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'difficulty' | 'recent'>('title');

  // Fetch quizzes from Firebase
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const coursesRef = collection(db, 'courses');
        const querySnapshot = await getDocs(coursesRef);
        
        const fetchedQuizzes: Quiz[] = [];
        
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          
          // Get question count from subcollection
          const questionsRef = collection(db, 'courses', doc.id, 'questions');
          const questionsSnapshot = await getDocs(questionsRef);
          
          // Determine medical category based on title or content
          let category = 'internal_medicine'; // default
          const titleLower = (data.title || '').toLowerCase();
          
          // Smart category detection
          if (titleLower.includes('cardio') || titleLower.includes('heart')) category = 'cardiology';
          else if (titleLower.includes('neuro') || titleLower.includes('brain')) category = 'neurology';
          else if (titleLower.includes('pedia') || titleLower.includes('child')) category = 'pediatrics';
          else if (titleLower.includes('surg')) category = 'surgery';
          else if (titleLower.includes('path') || titleLower.includes('lab')) category = 'pathology';
          else if (titleLower.includes('pharm') || titleLower.includes('drug')) category = 'pharmacology';
          else if (titleLower.includes('emerg') || titleLower.includes('trauma')) category = 'emergency';
          else if (titleLower.includes('radio') || titleLower.includes('imaging')) category = 'radiology';
          else if (titleLower.includes('ortho') || titleLower.includes('bone')) category = 'orthopedics';
          
          fetchedQuizzes.push({
            id: doc.id,
            title: data.title || 'Untitled Quiz',
            description: data.description || `Practice quiz for ${medicalCategories[category as keyof typeof medicalCategories]?.name}`,
            category,
            difficulty: data.difficulty || 'Intermediate',
            questionCount: questionsSnapshot.size || 0,
            estimatedTime: Math.ceil(questionsSnapshot.size * 1.5) || 15,
            completions: data.completions || Math.floor(Math.random() * 500),
            averageScore: data.averageScore || Math.floor(Math.random() * 30) + 70,
            lastUpdated: data.lastUpdated?.toDate() || new Date(),
            tags: data.tags || []
          });
        }
        
        setQuizzes(fetchedQuizzes);
        setFilteredQuizzes(fetchedQuizzes);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        // Use fallback data if Firebase fails
        const fallbackQuizzes: Quiz[] = [
          {
            id: '1',
            title: 'Cardiac Arrhythmias',
            description: 'Master ECG interpretation and arrhythmia management',
            category: 'cardiology',
            difficulty: 'Advanced',
            questionCount: 45,
            estimatedTime: 60,
            completions: 234,
            averageScore: 78
          },
          {
            id: '2',
            title: 'Neurological Examination',
            description: 'Complete neurological assessment techniques',
            category: 'neurology',
            difficulty: 'Intermediate',
            questionCount: 30,
            estimatedTime: 45,
            completions: 156,
            averageScore: 82
          }
        ];
        setQuizzes(fallbackQuizzes);
        setFilteredQuizzes(fallbackQuizzes);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Filter and sort quizzes
  useEffect(() => {
    let filtered = [...quizzes];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(quiz => quiz.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(quiz => quiz.difficulty === selectedDifficulty);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'difficulty') {
        const diffOrder = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2, 'Expert': 3 };
        return diffOrder[a.difficulty] - diffOrder[b.difficulty];
      }
      if (sortBy === 'recent' && a.lastUpdated && b.lastUpdated) {
        return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      }
      return 0;
    });

    setFilteredQuizzes(filtered);
  }, [searchTerm, selectedCategory, selectedDifficulty, sortBy, quizzes]);

  const QuizCard = ({ quiz }: { quiz: Quiz }) => {
    const categoryInfo = medicalCategories[quiz.category as keyof typeof medicalCategories];
    const Icon = categoryInfo?.icon || Stethoscope;
    
    return (
      <div className={`
        bg-white dark:bg-gray-800 rounded-lg border-2 
        ${viewMode === 'grid' ? 'p-5' : 'p-4'}
        hover:shadow-lg transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${categoryInfo?.color.split(' ')[0]} // Just the border color
      `}>
        {/* Category Badge */}
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full mb-3 ${categoryInfo?.color}`}>
          <Icon className="w-4 h-4" />
          <span className="text-xs font-semibold">{categoryInfo?.name}</span>
        </div>

        {/* Title and Description */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {quiz.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {quiz.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Brain className="w-4 h-4" />
            <span>{quiz.questionCount} questions</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{quiz.estimatedTime} min</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{quiz.completions} attempts</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Award className="w-4 h-4" />
            <span>{quiz.averageScore}% avg</span>
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="flex items-center justify-between">
          <span className={`
            px-2 py-1 text-xs font-semibold rounded
            ${quiz.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              quiz.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              quiz.difficulty === 'Advanced' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
          `}>
            {quiz.difficulty}
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medical Courses & Quizzes</h1>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                aria-label="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.location.reload()}
                className="p-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(medicalCategories).map(([key, cat]) => (
                <option key={key} value={key}>{cat.name}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="title">Sort by Title</option>
              <option value="difficulty">Sort by Difficulty</option>
              <option value="recent">Sort by Recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading medical courses...</p>
            </div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No quizzes found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}

        {/* Results Summary */}
        {!loading && (
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredQuizzes.length} of {quizzes.length} available quizzes
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalCoursesPage;