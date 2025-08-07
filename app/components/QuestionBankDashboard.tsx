'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
// import { useTheme } from './ThemeContext'; // Comment out if this doesn't exist
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

interface QuestionBankStats {
  totalQuestions: number;
  bySpecialty: Record<string, number>;
  byDifficulty: Record<string, number>;
  byTopic: Record<string, number>;
  byCategory: Record<string, number>;
  recentlyAdded: number;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  specialty: string;
  difficulty: string;
  category: string;
  createdBy: string;
  createdAt: any;
  timesUsed: number;
  qualityScore: number;
  aiGenerated: boolean;
}

const QuestionBankDashboard = () => {
  const { user } = useAuth();
  
  // Remove useTheme if it doesn't exist, or provide a fallback
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(!isDark);
  // const { isDark, toggleTheme } = useTheme(); // Use this if ThemeContext exists
  
  // Critical: Add mounted state to prevent SSR issues
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<QuestionBankStats | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'browse' | 'generate' | 'upload'>('browse');
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

  // Handle mounting to prevent SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe function to load data (only on client)
  const loadData = async () => {
    if (!mounted) {
      return;
    }

    try {
      setError(null);
      
      // Mock data for now - replace with actual service calls when ready
      const mockStats: QuestionBankStats = {
        totalQuestions: 150,
        bySpecialty: {
          'General Medicine': 45,
          'Cardiology': 25,
          'Emergency Medicine': 30,
          'Pediatrics': 20,
          'Surgery': 30
        },
        byDifficulty: {
          'Beginner': 50,
          'Intermediate': 70,
          'Advanced': 30
        },
        byTopic: {
          'Diagnosis': 40,
          'Treatment': 35,
          'Pharmacology': 30,
          'Anatomy': 25,
          'Pathophysiology': 20
        },
        byCategory: {
          'Medical Knowledge': 60,
          'Clinical Skills': 40,
          'Diagnostic Reasoning': 30,
          'Treatment Planning': 20
        },
        recentlyAdded: 12
      };

      setStats(mockStats);

      // Mock questions data
      const mockQuestions: Question[] = [
        {
          id: '1',
          question: 'What is the most common cause of chest pain in young adults?',
          options: ['Myocardial infarction', 'Costochondritis', 'Pulmonary embolism', 'Aortic dissection'],
          correctAnswer: 1,
          explanation: 'Costochondritis is inflammation of the cartilage connecting ribs to the breastbone, commonly seen in young adults.',
          topic: 'Chest Pain',
          specialty: 'General Medicine',
          difficulty: 'Beginner',
          category: 'Medical Knowledge',
          createdBy: 'system',
          createdAt: { toDate: () => new Date() },
          timesUsed: 25,
          qualityScore: 8,
          aiGenerated: true
        },
        {
          id: '2',
          question: 'Which medication is first-line treatment for acute myocardial infarction?',
          options: ['Aspirin', 'Nitroglycerin', 'Morphine', 'Beta-blockers'],
          correctAnswer: 0,
          explanation: 'Aspirin is the first-line antiplatelet therapy for acute MI, reducing mortality when given early.',
          topic: 'Myocardial Infarction',
          specialty: 'Cardiology',
          difficulty: 'Intermediate',
          category: 'Treatment Planning',
          createdBy: 'user123',
          createdAt: { toDate: () => new Date() },
          timesUsed: 42,
          qualityScore: 9,
          aiGenerated: false
        }
      ];

      setQuestions(mockQuestions);

    } catch (error) {
      console.error('Error loading question bank data:', error);
      setError('Failed to load question bank data. Please try again.');
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

  const handleSearch = async () => {
    if (!mounted) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Filter mock data based on search criteria
      let filteredQuestions = questions;
      
      if (searchTerm) {
        filteredQuestions = filteredQuestions.filter(q => 
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.topic.toLowerCase().includes(searchTerm.toLowerCase())
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
      
    } catch (error) {
      console.error('Error searching questions:', error);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful generation
      setGenerationResult({
        success: true,
        questions: [
          { question: 'Mock generated question 1 based on your content...' },
          { question: 'Mock generated question 2 based on your content...' },
          { question: 'Mock generated question 3 based on your content...' }
        ],
        message: `Generated 3 questions successfully!`,
        savedToBank: true
      });
      
      // Refresh data
      await loadData();
      
    } catch (error) {
      console.error('Error generating questions:', error);
      setGenerationResult({
        success: false,
        message: `Failed to generate questions: ${error.message}`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!user?.uid) {
      alert('Please sign in to generate quizzes');
      return;
    }

    setIsGeneratingQuiz(true);
    try {
      // Simulate quiz generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`✅ Quiz generated successfully!\n\n📝 ${quizPrefs.questionCount} questions\n🎯 ${quizPrefs.specialty}\n📊 ${quizPrefs.difficulty} difficulty`);
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert(`❌ Failed to generate quiz: ${error.message}`);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadData();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">Community Question Bank 🏦</h1>
                <p className="text-purple-100 text-xl">User-generated questions powered by AI</p>
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
              onClick={() => setViewMode('browse')}
              className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center ${
                viewMode === 'browse'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              <Database className="w-6 h-6" />
              <span>Browse Questions</span>
            </button>
            <button
              onClick={() => setViewMode('upload')}
              className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center ${
                viewMode === 'upload'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              <Upload className="w-6 h-6" />
              <span>Generate Questions</span>
            </button>
            <button
              onClick={() => setViewMode('generate')}
              className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center ${
                viewMode === 'generate'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              <Shuffle className="w-6 h-6" />
              <span>Generate Quiz</span>
            </button>
          </div>
        </div>

        {/* Rest of the component content remains the same but with proper error handling */}
        {viewMode === 'browse' && stats && (
          <div className="text-center py-20">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg p-12 max-w-md mx-auto">
              <Brain className="w-20 h-20 text-purple-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Question Bank Ready</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {stats.totalQuestions} questions available across {Object.keys(stats.bySpecialty).length} specialties
              </p>
            </div>
          </div>
        )}

        {viewMode === 'upload' && (
          <div className="text-center py-20">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg p-12 max-w-md mx-auto">
              <Upload className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Generate Questions</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upload your study material and AI will generate questions
              </p>
              <div className="mt-6">
                <textarea
                  value={uploadedContent}
                  onChange={(e) => setUploadedContent(e.target.value)}
                  placeholder="Paste your content here..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleGenerateFromContent}
                  disabled={isGenerating}
                  className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate Questions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'generate' && (
          <div className="text-center py-20">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg p-12 max-w-md mx-auto">
              <Shuffle className="w-20 h-20 text-blue-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Generate Quiz</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create a custom quiz from available questions
              </p>
              <button
                onClick={handleGenerateQuiz}
                disabled={isGeneratingQuiz}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isGeneratingQuiz ? 'Generating...' : 'Generate Quiz'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBankDashboard;