"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { 
  getQuestionBankStats, 
  searchQuestions, 
  generateQuizFromBank 
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
  const { isDark, toggleTheme } = useTheme();
  const [stats, setStats] = useState<QuestionBankStats | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const bankStats = await getQuestionBankStats();
      setStats(bankStats);

      const initialQuestions = await searchQuestions('', {});
      setQuestions(initialQuestions);
    } catch (error) {
      console.error('Error loading question bank data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const filters = {
        specialty: selectedSpecialty || undefined,
        difficulty: selectedDifficulty || undefined,
        topic: selectedTopic || undefined,
        category: selectedCategory || undefined
      };
      
      const results = await searchQuestions(searchTerm, filters);
      setQuestions(results);
    } catch (error) {
      console.error('Error searching questions:', error);
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
      const preferences = {
        ...quizPrefs,
        userId: user.uid,
        excludeUsedRecently: true
      };

      const generatedQuiz = await generateQuizFromBank(preferences);
      
      alert(`✅ Quiz generated successfully!\n\n📝 ${generatedQuiz.questions.length} questions\n🎯 ${generatedQuiz.metadata.specialty}\n📊 ${generatedQuiz.metadata.difficulty} difficulty`);
      
      console.log('Generated quiz:', generatedQuiz);
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert(`❌ Failed to generate quiz: ${error.message}`);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [selectedSpecialty, selectedDifficulty, selectedTopic, selectedCategory]);

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

        {viewMode === 'upload' ? (
          // Generate Questions Mode
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

                {/* Generation Settings */}
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
                      <option value="Pathophysiology">Pathophysiology</option>
                      <option value="Anatomy & Physiology">Anatomy & Physiology</option>
                      <option value="Medical Ethics">Medical Ethics</option>
                      <option value="Public Health">Public Health</option>
                      <option value="Research & Evidence">Research & Evidence</option>
                      <option value="Patient Communication">Patient Communication</option>
                      <option value="Emergency Medicine">Emergency Medicine</option>
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
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Anesthesiology">Anesthesiology</option>
                      <option value="Pathology">Pathology</option>
                      <option value="Family Medicine">Family Medicine</option>
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

                {/* Generation Results */}
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
                          Generated {generationResult.questions.length} questions:
                        </p>
                        <div className="max-h-48 overflow-y-auto space-y-3">
                          {generationResult.questions.slice(0, 3).map((q, index) => (
                            <div key={index} className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800/30 p-4 rounded-xl">
                              {q.question}
                            </div>
                          ))}
                          {generationResult.questions.length > 3 && (
                            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                              ...and {generationResult.questions.length - 3} more questions
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        ) : viewMode === 'browse' ? (
          // Browse Questions Mode
          <>
            {/* Stats Overview */}
            {stats && (
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
              </>
            )}

            <SectionSeparator title="Search & Browse Questions" icon={Search} color="indigo" />

            {/* Search and Filters */}
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

            {/* Questions List */}
            <div className="space-y-6">
              {questions.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg p-12 max-w-md mx-auto">
                    <Database className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No questions found</h3>
                    <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria or generate some questions!</p>
                  </div>
                </div>
              ) : (
                questions.map(question => (
                  <div key={question.id} className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-[1.01] p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-3 mb-4">
                          <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                            question.difficulty === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            question.difficulty === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {question.difficulty}
                          </span>
                          <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full font-medium">
                            {question.specialty}
                          </span>
                          <span className="text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full font-medium">
                            {question.topic}
                          </span>
                          {question.category && (
                            <span className="text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full font-medium flex items-center">
                              📂 {question.category}
                            </span>
                          )}
                          {question.aiGenerated && (
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
                              {option}
                            </div>
                          ))}
                        </div>

                        {question.explanation && (
                          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-4 rounded-xl mb-4">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 flex-wrap gap-6">
                          <span className="flex items-center">📊 Used {question.timesUsed} times</span>
                          <span className="flex items-center">⭐ Quality: {question.qualityScore}/10</span>
                          <span className="flex items-center">📅 {question.createdAt?.toDate?.()?.toLocaleDateString()}</span>
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