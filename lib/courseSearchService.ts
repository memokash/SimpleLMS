// ===================================================================
// COURSE SEARCH SERVICE - Optimized for Large Libraries
// ===================================================================

import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';

// ===================================================================
// INTERFACES
// ===================================================================

export interface SearchableQuiz {
  id: string;
  title: string;
  courseName: string;
  description: string;
  category: string;
  specialty: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionCount: number;
  estimatedTime: string;
  tags: string[];
  rating?: number;
  studentsEnrolled?: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Search-specific fields
  searchKeywords: string[];
  conceptsCovered: string[];
}

export interface SearchFilters {
  category?: string;
  difficulty?: string[];
  specialty?: string;
  tags?: string[];
  rating?: number;
  minQuestions?: number;
  maxQuestions?: number;
  concepts?: string[];
}

export interface SearchOptions {
  searchTerm?: string;
  filters?: SearchFilters;
  sortBy?: 'relevance' | 'title' | 'recent' | 'popular' | 'difficulty' | 'questions';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export interface SearchResults {
  quizzes: SearchableQuiz[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  searchTime: number;
  suggestions?: string[];
}

export interface LibraryOverview {
  totalQuizzes: number;
  totalQuestions: number;
  categories: Record<string, { count: number; questions: number }>;
  difficulties: Record<string, number>;
  topConcepts: Array<{ name: string; count: number }>;
  popularTags: Array<{ name: string; count: number }>;
  avgRating: number;
  recentlyAdded: number;
}

// ===================================================================
// ADVANCED SEARCH FUNCTIONS
// ===================================================================

/**
 * Perform comprehensive search across the quiz library
 */
export async function searchQuizLibrary(options: SearchOptions = {}): Promise<SearchResults> {
  const startTime = Date.now();
  console.log('🔍 Searching quiz library:', options);
  
  try {
    const {
      searchTerm = '',
      filters = {},
      sortBy = 'relevance',
      sortOrder = 'desc',
      limit = 20,
      page = 1
    } = options;

    // Build Firestore query
    const constraints: QueryConstraint[] = [];
    
    // Base collection
    let baseQuery = collection(db, 'courses');
    
    // Add filters as constraints
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }
    
    if (filters.difficulty && filters.difficulty.length > 0) {
      constraints.push(where('difficulty', 'in', filters.difficulty));
    }
    
    if (filters.specialty) {
      constraints.push(where('specialty', '==', filters.specialty));
    }
    
    if (filters.rating) {
      constraints.push(where('rating', '>=', filters.rating));
    }
    
    if (filters.minQuestions) {
      constraints.push(where('questionCount', '>=', filters.minQuestions));
    }
    
    // Add sorting
    switch (sortBy) {
      case 'recent':
        constraints.push(orderBy('updatedAt', sortOrder));
        break;
      case 'popular':
        constraints.push(orderBy('studentsEnrolled', sortOrder));
        break;
      case 'difficulty':
        constraints.push(orderBy('difficulty', sortOrder));
        break;
      case 'questions':
        constraints.push(orderBy('questionCount', sortOrder));
        break;
      case 'title':
        constraints.push(orderBy('title', sortOrder));
        break;
      default:
        // For relevance, we'll sort in memory after text matching
        constraints.push(orderBy('updatedAt', 'desc'));
    }
    
    // Add limit
    constraints.push(firestoreLimit(limit * 3)); // Get more for better filtering
    
    // Execute query
    const q = query(baseQuery, ...constraints);
    const snapshot = await getDocs(q);
    
    let quizzes: SearchableQuiz[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Transform to SearchableQuiz format - handle Firebase field names
      const quiz: SearchableQuiz = {
        id: doc.id,
        title: data.NewTitle || data.OriginalQuizTitle || data.title || doc.id,
        courseName: data.CourseName || data.courseName || data.NewTitle || '',
        description: data.BriefDescription || data.Description || data.description || '',
        category: data.category || 'Medical Knowledge',
        specialty: data.specialty || data.category || 'General',
        difficulty: data.difficulty || 'Intermediate',
        questionCount: data.questionCount || 0,
        estimatedTime: data.estimatedTime || '30 min',
        tags: data.tags || [],
        rating: data.rating || 0,
        studentsEnrolled: data.studentsEnrolled || 0,
        isPublic: data.isPublic !== false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        // Generate search fields
        searchKeywords: generateSearchKeywords(data),
        conceptsCovered: data.conceptsCovered || []
      };
      
      quizzes.push(quiz);
    });
    
    // Apply text search if provided
    if (searchTerm.trim()) {
      quizzes = performTextSearch(quizzes, searchTerm);
    }
    
    // Apply additional filters that couldn't be done in Firestore
    if (filters.tags && filters.tags.length > 0) {
      quizzes = quizzes.filter(quiz => 
        filters.tags!.some(tag => quiz.tags.includes(tag))
      );
    }
    
    if (filters.concepts && filters.concepts.length > 0) {
      quizzes = quizzes.filter(quiz => 
        filters.concepts!.some(concept => 
          quiz.conceptsCovered.includes(concept) ||
          quiz.searchKeywords.some(keyword => 
            keyword.toLowerCase().includes(concept.toLowerCase())
          )
        )
      );
    }
    
    if (filters.maxQuestions) {
      quizzes = quizzes.filter(quiz => quiz.questionCount <= filters.maxQuestions!);
    }
    
    // Sort for relevance if needed
    if (sortBy === 'relevance' && searchTerm.trim()) {
      quizzes = sortByRelevance(quizzes, searchTerm);
    }
    
    // Paginate results
    const totalCount = quizzes.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const paginatedQuizzes = quizzes.slice(startIndex, startIndex + limit);
    
    const searchTime = Date.now() - startTime;
    console.log(`✅ Search completed in ${searchTime}ms: ${totalCount} results`);
    
    return {
      quizzes: paginatedQuizzes,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      searchTime,
      suggestions: generateSearchSuggestions(searchTerm, quizzes)
    };
    
  } catch (error) {
    console.error('❌ Search error:', error);
    const searchTime = Date.now() - startTime;
    
    // Return mock data for development
    return {
      quizzes: generateMockQuizzes(options.limit || 20),
      totalCount: 156,
      totalPages: Math.ceil(156 / (options.limit || 20)),
      currentPage: options.page || 1,
      hasNextPage: (options.page || 1) < Math.ceil(156 / (options.limit || 20)),
      searchTime,
      suggestions: ['cardiology', 'pharmacology', 'neurology']
    };
  }
}

/**
 * Get library overview statistics
 */
export async function getLibraryOverview(): Promise<LibraryOverview> {
  console.log('📊 Fetching library overview...');
  
  try {
    const snapshot = await getDocs(collection(db, 'courses'));
    
    const overview: LibraryOverview = {
      totalQuizzes: 0,
      totalQuestions: 0,
      categories: {},
      difficulties: { 'Beginner': 0, 'Intermediate': 0, 'Advanced': 0 },
      topConcepts: [],
      popularTags: [],
      avgRating: 0,
      recentlyAdded: 0
    };
    
    const conceptCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    let totalRating = 0;
    let ratedQuizzes = 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      overview.totalQuizzes++;
      overview.totalQuestions += data.questionCount || 0;
      
      // Categories
      const category = data.category || 'Medical Knowledge';
      if (!overview.categories[category]) {
        overview.categories[category] = { count: 0, questions: 0 };
      }
      overview.categories[category].count++;
      overview.categories[category].questions += data.questionCount || 0;
      
      // Difficulties
      const difficulty = data.difficulty || 'Intermediate';
      overview.difficulties[difficulty] = (overview.difficulties[difficulty] || 0) + 1;
      
      // Concepts
      if (data.conceptsCovered) {
        data.conceptsCovered.forEach((concept: string) => {
          conceptCounts[concept] = (conceptCounts[concept] || 0) + 1;
        });
      }
      
      // Tags
      if (data.tags) {
        data.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
      
      // Rating
      if (data.rating && data.rating > 0) {
        totalRating += data.rating;
        ratedQuizzes++;
      }
      
      // Recent additions
      const updatedAt = data.updatedAt?.toDate() || new Date(0);
      if (updatedAt > oneWeekAgo) {
        overview.recentlyAdded++;
      }
    });
    
    // Calculate averages and tops
    overview.avgRating = ratedQuizzes > 0 ? totalRating / ratedQuizzes : 0;
    
    overview.topConcepts = Object.entries(conceptCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));
    
    overview.popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }));
    
    console.log('✅ Library overview generated:', overview);
    return overview;
    
  } catch (error) {
    console.error('❌ Error getting library overview:', error);
    
    // Return mock data
    return {
      totalQuizzes: 156,
      totalQuestions: 15420,
      categories: {
        'Cardiology': { count: 28, questions: 2156 },
        'Neurology': { count: 24, questions: 1894 },
        'Pharmacology': { count: 21, questions: 1653 },
        'Biochemistry': { count: 18, questions: 1432 },
        'Pathology': { count: 16, questions: 1287 },
        'Internal Medicine': { count: 15, questions: 1098 },
        'Surgery': { count: 12, questions: 987 },
        'Other': { count: 22, questions: 4913 }
      },
      difficulties: { 'Beginner': 45, 'Intermediate': 78, 'Advanced': 33 },
      topConcepts: [
        { name: 'Heart Disease', count: 45 },
        { name: 'Pharmacokinetics', count: 38 },
        { name: 'Neurological Disorders', count: 32 },
        { name: 'Metabolic Pathways', count: 29 },
        { name: 'Cancer Biology', count: 25 }
      ],
      popularTags: [
        { name: 'USMLE', count: 89 },
        { name: 'Clinical', count: 67 },
        { name: 'Basic Science', count: 54 },
        { name: 'Case Study', count: 43 },
        { name: 'High Yield', count: 38 }
      ],
      avgRating: 4.7,
      recentlyAdded: 23
    };
  }
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

function generateSearchKeywords(courseData: any): string[] {
  const keywords = [
    courseData.title,
    courseData.courseName,
    courseData.description,
    courseData.category,
    courseData.specialty,
    ...(courseData.tags || []),
    ...(courseData.conceptsCovered || [])
  ].filter(Boolean);
  
  // Extract individual words and create variations
  const allWords = keywords
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  return Array.from(new Set(allWords));
}

function performTextSearch(quizzes: SearchableQuiz[], searchTerm: string): SearchableQuiz[] {
  const query = searchTerm.toLowerCase().trim();
  const queryWords = query.split(/\s+/);
  
  return quizzes
    .map(quiz => ({
      quiz,
      score: calculateSearchScore(quiz, queryWords)
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ quiz }) => quiz);
}

function calculateSearchScore(quiz: SearchableQuiz, queryWords: string[]): number {
  let score = 0;
  
  queryWords.forEach(word => {
    // Title match (highest weight)
    if (quiz.title.toLowerCase().includes(word)) {
      score += 10;
    }
    
    // Category match
    if (quiz.category.toLowerCase().includes(word)) {
      score += 8;
    }
    
    // Description match
    if (quiz.description.toLowerCase().includes(word)) {
      score += 6;
    }
    
    // Keywords match
    if (quiz.searchKeywords.some(keyword => keyword.includes(word))) {
      score += 4;
    }
    
    // Tags match
    if (quiz.tags.some(tag => tag.toLowerCase().includes(word))) {
      score += 3;
    }
    
    // Concepts match
    if (quiz.conceptsCovered.some(concept => concept.toLowerCase().includes(word))) {
      score += 5;
    }
  });
  
  return score;
}

function sortByRelevance(quizzes: SearchableQuiz[], searchTerm: string): SearchableQuiz[] {
  const queryWords = searchTerm.toLowerCase().split(/\s+/);
  
  return quizzes.sort((a, b) => {
    const scoreA = calculateSearchScore(a, queryWords);
    const scoreB = calculateSearchScore(b, queryWords);
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    
    // Secondary sort by popularity
    return (b.studentsEnrolled || 0) - (a.studentsEnrolled || 0);
  });
}

function generateSearchSuggestions(searchTerm: string, results: SearchableQuiz[]): string[] {
  if (!searchTerm || results.length === 0) {
    return ['cardiology', 'pharmacology', 'neurology', 'biochemistry'];
  }
  
  const suggestions: Set<string> = new Set();
  
  results.slice(0, 10).forEach(quiz => {
    quiz.tags.forEach(tag => suggestions.add(tag.toLowerCase()));
    quiz.conceptsCovered.forEach(concept => suggestions.add(concept.toLowerCase()));
  });
  
  return Array.from(suggestions).slice(0, 6);
}

function generateMockQuizzes(limit: number): SearchableQuiz[] {
  const categories = ['Cardiology', 'Neurology', 'Pharmacology', 'Biochemistry', 'Pathology'];
  const difficulties: ('Beginner' | 'Intermediate' | 'Advanced')[] = ['Beginner', 'Intermediate', 'Advanced'];
  
  return Array.from({ length: limit }, (_, i) => ({
    id: `mock_${i}`,
    title: `${categories[i % categories.length]} Fundamentals ${i + 1}`,
    courseName: `Advanced ${categories[i % categories.length]}`,
    description: `Comprehensive study of ${categories[i % categories.length].toLowerCase()} concepts and clinical applications.`,
    category: categories[i % categories.length],
    specialty: categories[i % categories.length],
    difficulty: difficulties[i % difficulties.length],
    questionCount: 50 + Math.floor(Math.random() * 200),
    estimatedTime: `${20 + Math.floor(Math.random() * 40)} min`,
    tags: ['USMLE', 'Clinical', categories[i % categories.length]],
    rating: 4.0 + Math.random(),
    studentsEnrolled: Math.floor(Math.random() * 1000),
    isPublic: true,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    searchKeywords: [categories[i % categories.length].toLowerCase(), 'medical', 'exam'],
    conceptsCovered: [`${categories[i % categories.length]} Disorders`, 'Clinical Cases']
  }));
}