"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
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
  AlertCircle
} from 'lucide-react';

interface QuestionBankStats {
  totalQuestions: number;
  bySpecialty: Record<string, number>;
  byDifficulty: Record<string, number>;
  byTopic: Record<string, number>;
  byCategory: Record<string, number>; // 🔥 NEW: Category statistics
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
  category: string; // 🔥 NEW: Category field
  createdBy: string;
  createdAt: any;
  timesUsed: number;
  qualityScore: number;
  aiGenerated: boolean;
}

const QuestionBankDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<QuestionBankStats | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // 🔥 NEW: Category filter
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
    category: 'all', // 🔥 NEW: Category preference
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
        category: selectedCategory || undefined // 🔥 NEW: Include category in filters
      };
      
      const results = await searchQuestions(searchTerm, filters);
      setQuestions(results);
    } catch (error) {
      console.error('Error searching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NEW: Generate questions from content and save to bank
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

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question bank...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Community Question Bank 🏦</h1>
                <p className="text-purple-100 mt-2">User-generated questions powered by AI</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats?.totalQuestions || 0}</div>
                  <p className="text-purple-100 text-sm">Total Questions</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats?.recentlyAdded || 0}</div>
                  <p className="text-purple-100 text-sm">Added This Week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Mode Toggle */}
        <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-100/50 border border-purple-100/30 p-4 mb-6">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setViewMode('browse')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                viewMode === 'browse'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Database className="w-5 h-5" />
              <span>Browse Questions</span>
            </button>
            <button
              onClick={() => setViewMode('upload')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                viewMode === 'upload'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span>Generate Questions</span>
            </button>
            <button
              onClick={() => setViewMode('generate')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                viewMode === 'generate'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Shuffle className="w-5 h-5" />
              <span>Generate Quiz</span>
            </button>
          </div>
        </div>

        {viewMode === 'upload' ? (
          // 🔥 NEW: Upload and Generate Mode
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-100/50 border border-purple-100/30 p-8">
              <div className="text-center mb-8">
                <Upload className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Questions from Content</h2>
                <p className="text-gray-600">Upload your study material and AI will generate questions for the community bank</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste your content here
                  </label>
                  <textarea
                    value={uploadedContent}
                    onChange={(e) => setUploadedContent(e.target.value)}
                    placeholder="Paste your study material, lecture notes, textbook content, etc..."
                    className="w-full h-64 p-4 border border-purple-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
                  />
                </div>

                {/* Generation Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-purple-50/50 rounded-lg border border-purple-200/30">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={generationSettings.category}
                      onChange={(e) => setGenerationSettings({...generationSettings, category: e.target.value})}
                      className="w-full border border-purple-200/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                    <select
                      value={generationSettings.specialty}
                      onChange={(e) => setGenerationSettings({...generationSettings, specialty: e.target.value})}
                      className="w-full border border-purple-200/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={generationSettings.difficulty}
                      onChange={(e) => setGenerationSettings({...generationSettings, difficulty: e.target.value})}
                      className="w-full border border-purple-200/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                    <input
                      type="number"
                      min="5"
                      max="25"
                      value={generationSettings.questionCount}
                      onChange={(e) => setGenerationSettings({...generationSettings, questionCount: Number(e.target.value)})}
                      className="w-full border border-purple-200/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specific Topic (Optional)</label>
                    <input
                      type="text"
                      value={generationSettings.topic}
                      onChange={(e) => setGenerationSettings({...generationSettings, topic: e.target.value})}
                      placeholder="e.g., Myocardial Infarction, Diabetes Management, etc."
                      className="w-full border border-purple-200/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleGenerateFromContent}
                    disabled={isGenerating || !uploadedContent.trim()}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-3" />
                        Generate & Save Questions
                      </>
                    )}
                  </button>
                </div>

                {/* Generation Results */}
                {generationResult && (
                  <div className={`p-4 rounded-lg border ${
                    generationResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      {generationResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span className={`font-medium ${
                        generationResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {generationResult.message}
                      </span>
                    </div>
                    
                    {generationResult.success && generationResult.questions && (
                      <div className="mt-4">
                        <p className="text-sm text-green-700 mb-2">
                          Generated {generationResult.questions.length} questions:
                        </p>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                          {generationResult.questions.slice(0, 3).map((q, index) => (
                            <div key={index} className="text-xs text-green-600 bg-green-100 p-2 rounded">
                              {q.question}
                            </div>
                          ))}
                          {generationResult.questions.length > 3 && (
                            <div className="text-xs text-green-600">
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
          // Browse Questions Mode (existing code)
          <>
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-100/50 border border-purple-100/30 p-6 text-center">
                  <Database className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-green-100/50 border border-green-100/30 p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">{Object.keys(stats.bySpecialty).length}</div>
                  <div className="text-sm text-gray-600">Specialties</div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6 text-center">
                  <Brain className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">{Object.keys(stats.byCategory || {}).length}</div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-orange-100/50 border border-orange-100/30 p-6 text-center">
                  <Zap className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">{stats.recentlyAdded}</div>
                  <div className="text-sm text-gray-600">Added This Week</div>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-100/50 border border-purple-100/30 p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 border border-purple-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-purple-200/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
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
                    className="border border-purple-200/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
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
                    className="border border-purple-200/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
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
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or generate some questions!</p>
                </div>
              ) : (
                questions.map(question => (
                  <div key={question.id} className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-100/50 border border-purple-100/30 p-6 hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            question.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                            question.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {question.difficulty}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {question.specialty}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {question.topic}
                          </span>
                          {question.category && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                              📂 {question.category}
                            </span>
                          )}
                          {question.aiGenerated && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center">
                              <Brain className="w-3 h-3 mr-1" />
                              AI Generated
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 mb-3">{question.question}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          {question.options.map((option, index) => (
                            <div
                              key={index}
                              className={`p-2 rounded border text-sm ${
                                index === question.correctAnswer
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-700'
                              }`}
                            >
                              {option}
                            </div>
                          ))}
                        </div>

                        {question.explanation && (
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-3">
                            <p className="text-sm text-blue-800">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>📊 Used {question.timesUsed} times</span>
                          <span>⭐ Quality: {question.qualityScore}/10</span>
                          <span>📅 {question.createdAt?.toDate?.()?.toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col space-y-2">
                        <button className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button className="bg-gray-200 text-gray-600 p-2 rounded hover:bg-gray-300 transition-colors">
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          // Generate Quiz Mode (existing code)
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-100/50 border border-purple-100/30 p-8">
              <div className="text-center mb-8">
                <Shuffle className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Custom Quiz</h2>
                <p className="text-gray-600">Create a personalized quiz from the community question bank</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={quizPrefs.category}
                    onChange={(e) => setQuizPrefs({...quizPrefs, category: e.target.value})}
                    className="w-full border border-purple-200/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Categories</option>
                    {stats && Object.keys(stats.byCategory || {}).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                  <select
                    value={quizPrefs.specialty}
                    onChange={(e) => setQuizPrefs({...quizPrefs, specialty: e.target.value})}
                    className="w-full border border-purple-200/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Specialties</option>
                    {stats && Object.keys(stats.bySpecialty).map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={quizPrefs.difficulty}
                    onChange={(e) => setQuizPrefs({...quizPrefs, difficulty: e.target.value})}
                    className="w-full border border-purple-200/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Difficulties</option>
                    {stats && Object.keys(stats.byDifficulty).map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={quizPrefs.questionCount}
                    onChange={(e) => setQuizPrefs({...quizPrefs, questionCount: Number(e.target.value)})}
                    className="w-full border border-purple-200/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-5 h-5 mr-3" />
                      Generate Smart Quiz
                    </>
                  )}
                </button>
              </div>

              {stats && (
                <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200/50">
                  <h3 className="font-medium text-purple-800 mb-2">Available Questions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-purple-600">Total:</span>
                      <span className="ml-2 font-medium">{stats.totalQuestions}</span>
                    </div>
                    <div>
                      <span className="text-purple-600">Categories:</span>
                      <span className="ml-2 font-medium">{Object.keys(stats.byCategory || {}).length}</span>
                    </div>
                    <div>
                      <span className="text-purple-600">Specialties:</span>
                      <span className="ml-2 font-medium">{Object.keys(stats.bySpecialty).length}</span>
                    </div>
                    <div>
                      <span className="text-purple-600">Topics:</span>
                      <span className="ml-2 font-medium">{Object.keys(stats.byTopic).length}</span>
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