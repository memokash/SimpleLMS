'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import EnhancedQuizDisplay from './EnhancedQuizDisplay';
import { 
  getQuestionBankStats, 
  searchQuestions, 
  generateQuizFromBank,
  QuestionBankQuestion,
  QuestionBankStats as QuestionBankServiceStats
} from '../../lib/questionBankService';
import { 
  Database, 
  Search, 
  Filter, 
  Plus, 
  Shuffle, 
  Brain,
  TrendingUp,
  Award,
  Users,
  Clock,
  BookOpen,
  Target,
  Play,
  Eye,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Settings,
  Download,
  Share2,
  Lightbulb,
  Zap,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Sun,
  Moon,
  Sparkles,
  BarChart3
} from 'lucide-react';

interface ExtendedQuestionBankStats extends QuestionBankServiceStats {
  bySpecialty: Record<string, number>;
  byDifficulty: Record<string, number>;
  byTopic: Record<string, number>;
  byCategory: Record<string, number>;
  // Additional variables for comprehensive stats
  totalUsers: number;
  averageQualityScore: number;
  totalQuizzes: number;
  popularQuestions: QuestionBankQuestion[];
  aiGeneratedCount: number;
  userGeneratedCount: number;
  questionsByMonth: Record<string, number>;
  topContributors: Array<{userId: string; name: string; count: number}>;
  mostUsedQuestions: QuestionBankQuestion[];
  lastUpdated: Date;
}

// Using QuestionBankQuestion from service

const QuestionBankDashboard = () => {
  const { user } = useAuth();
  

  const { isDark, toggleTheme } = useTheme(); // Uncomment if you have ThemeContext
  
  // Critical: Add mounted state to prevent SSR issues
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<ExtendedQuestionBankStats | null>(null);
  const [questions, setQuestions] = useState<QuestionBankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'browse' | 'generate' | 'upload' | 'preview'>('upload');
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [selectedPreviewAnswer, setSelectedPreviewAnswer] = useState<number | undefined>();
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  
  // Upload and generation states
  const [uploadedContent, setUploadedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  
  // Generation settings
  const [generationSettings, setGenerationSettings] = useState({
    specialty: 'General Medicine',
    difficulty: 'Intermediate',
    category: 'Medical Knowledge',
    questionCount: 10,
    topic: ''
  });

  // Quiz generation preferences
  const [quizPrefs, setQuizPrefs] = useState({
    specialty: 'all',
    difficulty: 'all',
    category: 'all',
    topics: [] as string[],
    questionCount: 20
  });

  // Mock data fallbacks
  const mockStats: ExtendedQuestionBankStats = {
    totalQuestions: 1247,
    bySpecialty: {
      'General Medicine': 245,
      'Cardiology': 186,
      'Emergency Medicine': 203,
      'Pediatrics': 178,
      'Surgery': 156,
      'Internal Medicine': 279
    },
    byDifficulty: {
      'Beginner': 412,
      'Intermediate': 567,
      'Advanced': 268
    },
    byTopic: {
      'Diagnosis': 298,
      'Treatment': 267,
      'Pharmacology': 234,
      'Anatomy': 189,
      'Pathophysiology': 159,
      'Clinical Skills': 100
    },
    byCategory: {
      'Medical Knowledge': 456,
      'Clinical Skills': 298,
      'Diagnostic Reasoning': 267,
      'Treatment Planning': 145,
      'Pharmacology': 81
    },
    recentlyAdded: 23,
    categories: {
      'Medical Knowledge': 456,
      'Clinical Skills': 298,
      'Diagnostic Reasoning': 267,
      'Treatment Planning': 145,
      'Pharmacology': 81
    },
    difficulties: {
      'Easy': 412,
      'Medium': 567,
      'Hard': 268
    },
    communityContributions: 1247,
    // Additional mock data for new variables
    totalUsers: 156,
    averageQualityScore: 8.2,
    totalQuizzes: 89,
    popularQuestions: [], // Will be populated with mockQuestions
    aiGeneratedCount: 687,
    userGeneratedCount: 560,
    questionsByMonth: {
      '2024-01': 45,
      '2024-02': 52,
      '2024-03': 67,
      '2024-04': 71,
      '2024-05': 89,
      '2024-06': 94
    },
    topContributors: [
      { userId: 'user1', name: 'Dr. Sarah Chen', count: 67 },
      { userId: 'user2', name: 'Dr. Michael Rodriguez', count: 54 },
      { userId: 'user3', name: 'Dr. Emily Thompson', count: 42 },
      { userId: 'ai', name: 'AI Generator', count: 687 }
    ],
    mostUsedQuestions: [], // Will be populated with mockQuestions
    lastUpdated: new Date()
  };

  const mockQuestions: QuestionBankQuestion[] = [
    {
      id: '1',
      question: 'A 45-year-old patient presents with chest pain radiating to the left arm. What is the most appropriate initial diagnostic test?',
      options: ['Chest X-ray', 'ECG', 'Echocardiogram', 'Cardiac catheterization'],
      correctAnswer: 1,
      explanation: 'ECG is the most appropriate initial test for suspected acute coronary syndrome, providing immediate information about cardiac rhythm and potential ST changes.',
      category: 'Diagnostic Reasoning',
      specialty: 'Cardiology',
      difficulty: 'Medium',
      tags: ['cardiology', 'diagnosis'],
      source: 'Community',
      createdBy: 'Dr. Smith',
      createdAt: new Date(),
      upvotes: 89,
      downvotes: 2,
      verified: true,
      reportCount: 0
    },
    {
      id: '2',
      question: 'Which medication is contraindicated in patients with severe heart failure?',
      options: ['ACE inhibitors', 'Beta-blockers', 'NSAIDs', 'Diuretics'],
      correctAnswer: 2,
      explanation: 'NSAIDs are contraindicated in severe heart failure as they can worsen fluid retention and reduce the effectiveness of ACE inhibitors and diuretics.',
      category: 'Pharmacology',
      specialty: 'Cardiology',
      difficulty: 'Hard',
      tags: ['cardiology', 'pharmacology'],
      source: 'AI Generated',
      createdBy: 'AI Generator',
      createdAt: new Date(),
      upvotes: 67,
      downvotes: 1,
      verified: true,
      reportCount: 0
    },
    {
      id: '3',
      question: 'What is the most common cause of community-acquired pneumonia in adults?',
      options: ['Haemophilus influenzae', 'Streptococcus pneumoniae', 'Mycoplasma pneumoniae', 'Legionella pneumophila'],
      correctAnswer: 1,
      explanation: 'Streptococcus pneumoniae remains the most common bacterial cause of community-acquired pneumonia in adults, especially in those over 65.',
      category: 'Medical Knowledge',
      specialty: 'Internal Medicine',
      difficulty: 'Easy',
      tags: ['internal medicine', 'infectious disease'],
      source: 'Community',
      createdBy: 'Dr. Johnson',
      createdAt: new Date(),
      upvotes: 156,
      downvotes: 3,
      verified: true,
      reportCount: 0
    }
  ];

  // Handle mounting to prevent SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced function to load data with Firebase + fallback
  const loadData = async () => {
    if (!mounted) {
      return;
    }

    try {
      setError(null);
      
      // Try Firebase first
      console.log('🔥 Attempting to load data from Firebase...');
      
      const bankStats = await getQuestionBankStats();
      console.log('✅ Firebase stats loaded:', bankStats);
      // Convert to ExtendedQuestionBankStats
      const extendedStats: ExtendedQuestionBankStats = {
        ...bankStats,
        bySpecialty: bankStats.categories,
        byDifficulty: bankStats.difficulties,
        byTopic: {},
        byCategory: bankStats.categories,
        totalUsers: 0,
        averageQualityScore: 0,
        totalQuizzes: 0,
        popularQuestions: [],
        aiGeneratedCount: 0,
        userGeneratedCount: bankStats.communityContributions,
        questionsByMonth: {},
        topContributors: [],
        mostUsedQuestions: [],
        lastUpdated: new Date()
      };
      setStats(extendedStats);

      const initialQuestions = await searchQuestions('', {});
      console.log('✅ Firebase questions loaded:', initialQuestions.length);
      setQuestions(initialQuestions);

    } catch (error) {
      console.warn('⚠️ Firebase failed, initializing with empty data:', error);
      
      // Initialize with empty data structure
      const emptyStats: ExtendedQuestionBankStats = {
        totalQuestions: 0,
        bySpecialty: {},
        byDifficulty: {},
        byTopic: {},
        byCategory: {},
        recentlyAdded: 0,
        categories: {},
        difficulties: {},
        communityContributions: 0,
        totalUsers: 0,
        averageQualityScore: 0,
        totalQuizzes: 0,
        popularQuestions: [],
        aiGeneratedCount: 0,
        userGeneratedCount: 0,
        questionsByMonth: {},
        topContributors: [],
        mostUsedQuestions: [],
        lastUpdated: new Date()
      };
      
      // Use empty data structure
      setStats(emptyStats);
      setQuestions([]);
      
      // Set error message for no data available
      setError('No data available. Please ensure Firebase is properly configured.');
      
      // Clear error after 8 seconds
      setTimeout(() => setError(null), 8000);
      
    } finally {
      setLoading(false);
    }
  };

  // Load data only after mounting
  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted]);

  // Enhanced search with Firebase + fallback
  const handleSearch = async () => {
    if (!mounted) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        specialty: selectedSpecialty || undefined,
        difficulty: selectedDifficulty ? [selectedDifficulty] : undefined,
        topic: selectedTopic || undefined,
        category: selectedCategory || undefined
      };
      
      // Try Firebase search first
      console.log('🔍 Searching Firebase with filters:', filters);
      const results = await searchQuestions(searchTerm, filters);
      console.log('✅ Firebase search results:', results.length);
      setQuestions(results);
      
    } catch (error) {
      console.warn('⚠️ Firebase search failed, using local filtering:', error);
      
      // Fallback to local filtering of mock data
      let filteredQuestions = mockQuestions;
      
      if (searchTerm) {
        filteredQuestions = filteredQuestions.filter(q => 
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
          q.explanation.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedSpecialty) {
        filteredQuestions = filteredQuestions.filter(q => q.specialty === selectedSpecialty);
      }
      
      if (selectedDifficulty) {
        filteredQuestions = filteredQuestions.filter(q => q.difficulty === selectedDifficulty);
      }
      
      if (selectedCategory) {
        filteredQuestions = filteredQuestions.filter(q => q.category === selectedCategory);
      }
      
      setQuestions(filteredQuestions);
      setError('Search performed offline. Connect to internet for full results.');
      setTimeout(() => setError(null), 3000);
      
    } finally {
      setLoading(false);
    }
  };

  // Enhanced content generation with better error handling
  const handleGenerateFromContent = async () => {
    if (!uploadedContent.trim()) {
      alert('Please enter some content first');
      return;
    }

    if (!user?.uid) {
      alert('Please sign in to generate questions');
      return;
    }

    setIsGenerating(true);
    setGenerationResult(null);

    try {
      console.log('🔍 Generating questions from content...');
      
      const response = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: uploadedContent,
          specialty: generationSettings.specialty,
          difficulty: generationSettings.difficulty,
          category: generationSettings.category,
          questionCount: generationSettings.questionCount,
          topic: generationSettings.topic,
          userId: user.uid,
          filename: 'User Content Upload'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Questions generated successfully:', data);
        setGenerationResult({
          success: true,
          questions: data.questions,
          message: data.bankMessage || `Generated ${data.questions.length} questions!`,
          savedToBank: data.savedToBank
        });
        
        // Refresh stats and questions to show new data
        await loadData();
        
      } else {
        throw new Error(data.error || 'Failed to generate questions');
      }

    } catch (error) {
      console.error('❌ Question generation failed:', error);
      
      // Provide mock generation result for demo purposes
      setGenerationResult({
        success: false,
        message: `Generation failed: ${
          error instanceof Error ? error.message : String(error)
        }. Try again or check your connection.`,
        fallbackAvailable: true
      });
      
    } finally {
      setIsGenerating(false);
    }
  };

  // Enhanced quiz generation with Firebase + fallback
  const handleGenerateQuiz = async () => {
    if (!user?.uid) {
      alert('Please sign in to generate quizzes');
      return;
    }

    setIsGeneratingQuiz(true);
    try {
      console.log('🎯 Generating quiz from question bank...');
      
      const preferences = {
        ...quizPrefs,
        userId: user.uid,
        excludeUsedRecently: true
      };

      const generatedQuiz = await generateQuizFromBank(
        quizPrefs.category,
        quizPrefs.questionCount,
        quizPrefs.difficulty !== 'all' ? quizPrefs.difficulty : undefined
      );
      console.log('✅ Quiz generated:', generatedQuiz);
      
      alert(`✅ Quiz generated successfully!\n\n📝 ${generatedQuiz.questions.length} questions\n📊 ${quizPrefs.difficulty !== 'all' ? quizPrefs.difficulty : 'All Difficulties'} difficulty`);
      
    } catch (error) {
      console.warn('⚠️ Firebase quiz generation failed, using fallback:', error);
      
      // Fallback quiz generation using local data
      const availableQuestions = mockQuestions.filter(q => {
        if (quizPrefs.specialty !== 'all' && q.specialty !== quizPrefs.specialty) {
          return false;
        }
        if (quizPrefs.difficulty !== 'all' && q.difficulty !== quizPrefs.difficulty) {
          return false;
        }
        if (quizPrefs.category !== 'all' && q.category !== quizPrefs.category) {
          return false;
        }
        return true;
      });

      const shuffled = availableQuestions.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(quizPrefs.questionCount, shuffled.length));
      
      alert(`✅ Offline quiz generated!\n\n📝 ${selected.length} questions\n🎯 ${quizPrefs.specialty}\n📊 ${quizPrefs.difficulty} difficulty\n\n⚠️ Connect to internet for full question bank access.`);
      
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Auto-search when filters change
  useEffect(() => {
    if (mounted) {
      handleSearch();
    }
  }, [selectedSpecialty, selectedDifficulty, selectedTopic, selectedCategory, mounted]);

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
      green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
      blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
      orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
      red: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
      yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
      indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30'
    };
    return colorMap[color] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
  };

  // Section Separator Component
  const SectionSeparator = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
    <div className="relative my-12">
      <div className="absolute inset-0 flex items-center">
        <div className={`w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent dark:via-yellow-400/60 rounded-full`}></div>
      </div>
      <div className="relative flex justify-center">
        <div className={`px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-yellow-500/30 shadow-lg dark:shadow-yellow-500/20`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${getColorClasses(color)}`}>
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
        </div>
      </div>
    </div>
  );

  // Don't render until mounted (prevents SSR issues)
  if (!mounted) {
    return null;
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="flex items-center text-gray-600 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <Brain className="animate-pulse h-6 w-6 mr-3 text-purple-500" />
          <span className="text-lg font-medium">Loading question bank...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      
      {/* Enhanced Header with Firebase Status */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">AI Question Generator 🧠</h1>
                <p className="text-purple-100 text-xl">Upload your medical content and let AI create practice questions</p>
                {error && (
                  <div className="mt-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3">
                    <p className="text-yellow-100 text-sm">⚠️ {error}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-3xl font-bold">{stats?.totalQuestions || 0}</div>
                  <p className="text-purple-100 text-sm">Total Questions</p>
                </div>
                <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-3xl font-bold">{stats?.recentlyAdded || 0}</div>
                  <p className="text-purple-100 text-sm">Added This Week</p>
                </div>
                
                {/* Firebase Connection Status */}
                <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${error ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`}></div>
                    <span className="text-sm font-medium">{error ? 'Offline' : 'Online'}</span>
                  </div>
                  <p className="text-purple-100 text-xs">{error ? 'Using cached data' : 'Live Firebase data'}</p>
                </div>
                
                <button
                  onClick={toggleTheme}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200"
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <Sun className="h-6 w-6 text-yellow-300" />
                  ) : (
                    <Moon className="h-6 w-6 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mode Toggle */}
        <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setViewMode('upload')}
              className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center ${
                viewMode === 'upload'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              <Upload className="w-6 h-6" />
              <span>Upload Content</span>
            </button>
            <button
              onClick={() => setViewMode('browse')}
              className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center ${
                viewMode === 'browse'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              <Database className="w-6 h-6" />
              <span>My Generated Questions</span>
            </button>
            <button
              onClick={() => setViewMode('generate')}
              className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center ${
                viewMode === 'generate'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              <Brain className="w-6 h-6" />
              <span>Create Quiz from Questions</span>
            </button>
          </div>
        </div>

        {viewMode === 'upload' ? (
          // Generate Questions Mode (keeping full implementation)
          <div className="max-w-5xl mx-auto">
            <SectionSeparator title="Generate Questions from Content" icon={Upload} color="purple" />
            
            <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg p-8">
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 ${getColorClasses('purple')}`}>
                  <Upload className="w-10 h-10" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-lg">Upload your study material and AI will generate questions for the community bank</p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Paste your content here
                  </label>
                  <textarea
                    value={uploadedContent}
                    onChange={(e) => setUploadedContent(e.target.value)}
                    placeholder="Paste your study material, lecture notes, textbook content, etc..."
                    className="w-full h-64 p-6 border border-purple-200/50 dark:border-yellow-500/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base"
                  />
                </div>

                {/* Generation Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-purple-50/50 dark:bg-purple-900/20 rounded-2xl border border-purple-200/30 dark:border-purple-700/30">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Category</label>
                    <select
                      value={generationSettings.category}
                      onChange={(e) => setGenerationSettings({...generationSettings, category: e.target.value})}
                      className="w-full border border-purple-200/50 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Medical Knowledge">Medical Knowledge</option>
                      <option value="Clinical Skills">Clinical Skills</option>
                      <option value="Diagnostic Reasoning">Diagnostic Reasoning</option>
                      <option value="Treatment Planning">Treatment Planning</option>
                      <option value="Pharmacology">Pharmacology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Specialty</label>
                    <select
                      value={generationSettings.specialty}
                      onChange={(e) => setGenerationSettings({...generationSettings, specialty: e.target.value})}
                      className="w-full border border-purple-200/50 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="Internal Medicine">Internal Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Emergency Medicine">Emergency Medicine</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Surgery">Surgery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Difficulty</label>
                    <select
                      value={generationSettings.difficulty}
                      onChange={(e) => setGenerationSettings({...generationSettings, difficulty: e.target.value})}
                      className="w-full border border-purple-200/50 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Number of Questions</label>
                    <input
                      type="number"
                      min="5"
                      max="25"
                      value={generationSettings.questionCount}
                      onChange={(e) => setGenerationSettings({...generationSettings, questionCount: Number(e.target.value)})}
                      className="w-full border border-purple-200/50 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Specific Topic (Optional)</label>
                    <input
                      type="text"
                      value={generationSettings.topic}
                      onChange={(e) => setGenerationSettings({...generationSettings, topic: e.target.value})}
                      placeholder="e.g., Myocardial Infarction, Diabetes Management, etc."
                      className="w-full border border-purple-200/50 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleGenerateFromContent}
                    disabled={isGenerating || !uploadedContent.trim()}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto shadow-lg hover:shadow-xl"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Brain className="w-6 h-6 mr-3" />
                        Generate & Save Questions
                      </>
                    )}
                  </button>
                </div>

                {/* Enhanced Generation Results */}
                {generationResult && (
                  <div className={`p-6 rounded-2xl border-2 ${
                    generationResult.success 
                      ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' 
                      : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
                  }`}>
                    <div className="flex items-center mb-4">
                      {generationResult.success ? (
                        <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                      )}
                      <span className={`font-semibold text-lg ${
                        generationResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                      }`}>
                        {generationResult.message}
                      </span>
                    </div>
                    
                    {generationResult.success && generationResult.questions && (
                      <div className="mt-6">
                        <p className="text-sm text-green-700 dark:text-green-300 mb-4 font-medium">
                          🎉 Generated {generationResult.questions.length} questions successfully!
                        </p>
                        <div className="flex gap-4">
                          <button
                            onClick={() => {
                              setPreviewQuestions(generationResult.questions);
                              setCurrentPreviewIndex(0);
                              setSelectedPreviewAnswer(undefined);
                              setViewMode('preview');
                            }}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            <Eye className="w-5 h-5" />
                            Preview Questions
                          </button>
                          <button
                            onClick={() => {
                              setQuestions(generationResult.questions);
                              setViewMode('browse');
                            }}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            <Database className="w-5 h-5" />
                            View in Bank
                          </button>
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            💡 Your questions have been saved. You can preview them with AI-enhanced explanations or view them in your question bank.
                          </p>
                        </div>
                      </div>
                    )}

                    {generationResult.fallbackAvailable && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          💡 <strong>Tip:</strong> Check your internet connection and try again. You can also try with shorter content or different settings.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        ) : viewMode === 'browse' ? (
          // Browse Questions Mode - Enhanced with Firebase data + search
          <>
            {/* Empty State Message for Community Questions */}
            {stats && stats.totalQuestions === 0 && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl mb-8 shadow-lg">
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Welcome to the AI Question Generator!</h3>
                    <p className="text-blue-100">
                      Upload your medical study materials (PDFs, notes, textbooks) and our AI will generate high-quality practice questions.
                      The AI model is trained by medical education professionals to create clinically relevant questions from your content.
                    </p>
                    <div className="mt-4 flex gap-4">
                      <button
                        onClick={() => setViewMode('generate')}
                        className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                      >
                        Generate Questions with AI
                      </button>
                      <button
                        onClick={() => setViewMode('upload')}
                        className="bg-white/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/40"
                      >
                        Upload Your Questions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stats Overview */}
            {stats && stats.totalQuestions > 0 && (
              <>
                <SectionSeparator title="Question Bank Overview" icon={BarChart3} color="blue" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                  <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 p-8 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${getColorClasses('purple')}`}>
                      <Database className="w-8 h-8" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalQuestions}</div>
                    <div className="text-gray-600 dark:text-gray-300 font-medium">Total Questions</div>
                  </div>
                  
                  <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 p-8 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${getColorClasses('green')}`}>
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{Object.keys(stats.bySpecialty).length}</div>
                    <div className="text-gray-600 dark:text-gray-300 font-medium">Specialties</div>
                  </div>
                  
                  <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 p-8 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${getColorClasses('blue')}`}>
                      <Brain className="w-8 h-8" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{Object.keys(stats.byCategory || {}).length}</div>
                    <div className="text-gray-600 dark:text-gray-300 font-medium">Categories</div>
                  </div>
                  
                  <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 p-8 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${getColorClasses('orange')}`}>
                      <Zap className="w-8 h-8" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.recentlyAdded}</div>
                    <div className="text-gray-600 dark:text-gray-300 font-medium">Added This Week</div>
                  </div>
                </div>
                
                {/* Extended Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                  <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${getColorClasses('indigo')}`}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalUsers || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Users</div>
                  </div>
                  
                  <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${getColorClasses('yellow')}`}>
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.averageQualityScore?.toFixed(1) || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Avg Quality</div>
                  </div>
                  
                  <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${getColorClasses('green')}`}>
                      <Play className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalQuizzes || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Quizzes Created</div>
                  </div>
                  
                  <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${getColorClasses('purple')}`}>
                      <Brain className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.aiGeneratedCount || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">AI Generated</div>
                  </div>
                  
                  <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${getColorClasses('red')}`}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.userGeneratedCount || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">User Generated</div>
                  </div>
                </div>
              </>
            )}

            <SectionSeparator title="Search & Browse Questions" icon={Search} color="indigo" />

            {/* Enhanced Search and Filters */}
            <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg p-8 mb-8">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-6 py-4 border border-purple-200/50 dark:border-yellow-500/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
                  />
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-purple-200/50 dark:border-yellow-500/30 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white min-w-[150px]"
                  >
                    <option value="">All Categories</option>
                    {stats && Object.keys(stats.byCategory || {}).map(category => (
                      <option key={category} value={category}>
                        {category} ({stats.byCategory[category]})
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="border border-purple-200/50 dark:border-yellow-500/30 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white min-w-[150px]"
                  >
                    <option value="">All Specialties</option>
                    {stats && Object.keys(stats.bySpecialty).map(specialty => (
                      <option key={specialty} value={specialty}>
                        {specialty} ({stats.bySpecialty[specialty]})
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="border border-purple-200/50 dark:border-yellow-500/30 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white min-w-[150px]"
                  >
                    <option value="">All Difficulties</option>
                    {stats && Object.keys(stats.byDifficulty).map(difficulty => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty} ({stats.byDifficulty[difficulty]})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Questions List with Enhanced Display */}
            <div className="space-y-6">
              {questions.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg p-12 max-w-md mx-auto">
                    <Database className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No questions found</h3>
                    <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria or generate some questions!</p>
                    <button
                      onClick={() => setViewMode('upload')}
                      className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Generate Questions
                    </button>
                  </div>
                </div>
              ) : (
                questions.map(question => (
                  <div key={question.id} className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-[1.01] p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-3 mb-4">
                          <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                            question.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            question.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {question.difficulty}
                          </span>
                          <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full font-medium">
                            {question.specialty}
                          </span>
                          {question.tags && question.tags.length > 0 && (
                            <span className="text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full font-medium">
                              {question.tags[0]}
                            </span>
                          )}
                          {question.category && (
                            <span className="text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full font-medium flex items-center">
                              📂 {question.category}
                            </span>
                          )}
                          {question.source === 'AI Generated' && (
                            <span className="text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full font-medium flex items-center">
                              <Brain className="w-4 h-4 mr-1" />
                              AI Generated
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg leading-relaxed">{question.question}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          {question.options.map((option, index) => (
                            <div
                              key={index}
                              className={`p-4 rounded-xl border text-sm font-medium ${
                                index === question.correctAnswer
                                  ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200'
                                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                              {option}
                            </div>
                          ))}
                        </div>

                        {question.explanation && (
                          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-4 rounded-xl mb-4">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>💡 Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 flex-wrap gap-6">
                          <span className="flex items-center">👍 {question.upvotes} upvotes</span>
                          <span className="flex items-center">👎 {question.downvotes} downvotes</span>
                          <span className="flex items-center">👤 {question.createdBy}</span>
                          <span className="flex items-center">📅 {question.createdAt?.toLocaleDateString?.() || new Date(question.createdAt).toLocaleDateString()}</span>
                          {question.verified && <span className="flex items-center text-green-600 dark:text-green-400">✓ Verified</span>}
                        </div>
                      </div>

                      <div className="ml-6 flex flex-col gap-3">
                        <button className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-colors shadow-lg">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg">
                          <ThumbsUp className="w-5 h-5" />
                        </button>
                        <button className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 p-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors shadow-lg">
                          <Bookmark className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          // Generate Quiz Mode
          <div className="max-w-5xl mx-auto">
            <SectionSeparator title="Generate Custom Quiz" icon={Shuffle} color="green" />
            
            <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg p-8">
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 ${getColorClasses('green')}`}>
                  <Shuffle className="w-10 h-10" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-lg">Create a personalized quiz from the community question bank</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">Category</label>
                  <select
                    value={quizPrefs.category}
                    onChange={(e) => setQuizPrefs({...quizPrefs, category: e.target.value})}
                    className="w-full border border-purple-200/50 dark:border-yellow-500/30 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                  >
                    <option value="all">All Categories</option>
                    {stats && Object.keys(stats.byCategory || {}).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">Specialty</label>
                  <select
                    value={quizPrefs.specialty}
                    onChange={(e) => setQuizPrefs({...quizPrefs, specialty: e.target.value})}
                    className="w-full border border-purple-200/50 dark:border-yellow-500/30 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                  >
                    <option value="all">All Specialties</option>
                    {stats && Object.keys(stats.bySpecialty).map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">Difficulty</label>
                  <select
                    value={quizPrefs.difficulty}
                    onChange={(e) => setQuizPrefs({...quizPrefs, difficulty: e.target.value})}
                    className="w-full border border-purple-200/50 dark:border-yellow-500/30 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                  >
                    <option value="all">All Difficulties</option>
                    {stats && Object.keys(stats.byDifficulty).map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">Number of Questions</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={quizPrefs.questionCount}
                    onChange={(e) => setQuizPrefs({...quizPrefs, questionCount: Number(e.target.value)})}
                    className="w-full border border-purple-200/50 dark:border-yellow-500/30 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                  />
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto shadow-lg hover:shadow-xl"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-6 h-6 mr-3" />
                      Generate Smart Quiz
                    </>
                  )}
                </button>
              </div>

              {/* Available Questions Summary */}
              {stats && (
                <div className="mt-8 p-6 bg-purple-50/50 dark:bg-purple-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/30">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-4 text-lg">Available Questions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <span className="text-purple-600 dark:text-purple-400 font-medium">Total:</span>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalQuestions}</div>
                    </div>
                    <div className="text-center">
                      <span className="text-purple-600 dark:text-purple-400 font-medium">Categories:</span>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(stats.byCategory || {}).length}</div>
                    </div>
                    <div className="text-center">
                      <span className="text-purple-600 dark:text-purple-400 font-medium">Specialties:</span>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(stats.bySpecialty).length}</div>
                    </div>
                    <div className="text-center">
                      <span className="text-purple-600 dark:text-purple-400 font-medium">Topics:</span>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(stats.byTopic).length}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBankDashboard;