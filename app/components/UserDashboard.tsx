"use client";
import { useAuth } from './AuthContext';
import React, { useState, useEffect } from 'react';
import { getAllCourses } from '../../lib/courseService';
import { Upload, FileText, Brain, Users, Clock, Target, Calculator, Book, MessageCircle, Calendar, Zap, TrendingUp, Award, Play, Pause, RotateCcw, Settings, Search, Filter, Video, Mic, Share, BarChart3, PieChart, LineChart, Heart, Activity, AlertCircle, CheckCircle, Star, Globe, Camera, Stethoscope, Microscope, FlaskConical, Pill, BookOpen, GraduationCap, UserPlus, Send, Phone, Mail, ThumbsUp, ThumbsDown, Eye, Download, Bookmark, Lightbulb, Rocket } from 'lucide-react';
import { analyzeContent, generateQuizFromContent, generateQuizFromUploadedContent } from '../../lib/aiService';


// Enhanced interfaces fr the complete study hub
interface StudySession {
  id: string;
  date: Date;
  duration: number;
  topic: string;
  questionsAnswered: number;
  score: number;
}

interface UploadedContent {
  id: string;
  filename: string;
  uploadDate: Date;
  type: 'pdf' | 'notes' | 'textbook';
  size: string;
  aiSummary: string;
  generatedQuizzes: number;
  keyTopics: string[];
  difficulty: string;
  specialty: string;
  originalContent?: string;
}

interface StudyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: Date;
  type: 'quizzes' | 'hours' | 'topics';
}

interface StudyGroup {
  id: string;
  name: string;
  members: number;
  topic: string;
  nextSession: Date;
  isLive: boolean;
  description: string;
}

interface QuizCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
  description: string;
}

const ComprehensiveStudyHub = () => {
  // ✅ FIXED - Add useAuth at the top level
  const { user } = useAuth();
  
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hub');
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [studyStreak, setStudyStreak] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quizFilter, setQuizFilter] = useState('all');
  
  // AI Upload States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // Enhanced mock data for complete study hub
  const [studySessions] = useState<StudySession[]>([
    { id: '1', date: new Date(), duration: 45, topic: 'Cardiology', questionsAnswered: 25, score: 88 },
    { id: '2', date: new Date(Date.now() - 86400000), duration: 60, topic: 'Immunology', questionsAnswered: 30, score: 92 },
    { id: '3', date: new Date(Date.now() - 172800000), duration: 35, topic: 'Pharmacology', questionsAnswered: 20, score: 78 },
    { id: '4', date: new Date(Date.now() - 259200000), duration: 55, topic: 'Pathology', questionsAnswered: 28, score: 85 },
  ]);

  const [uploadedContent] = useState<UploadedContent[]>([
    {
      id: '1',
      filename: 'Pathophysiology_Chapter_12.pdf',
      uploadDate: new Date(),
      type: 'pdf',
      size: '2.4 MB',
      aiSummary: 'Covers cardiovascular pathophysiology, heart failure mechanisms, and arrhythmia classifications',
      generatedQuizzes: 3,
      keyTopics: ['Heart Failure', 'Arrhythmias', 'Cardiac Output'],
      difficulty: 'Advanced',
      specialty: 'Cardiology',
      originalContent: 'Heart failure is a complex clinical syndrome characterized by the inability of the heart to pump sufficient blood to meet the metabolic demands of the body...'
    },
    {
      id: '2',
      filename: 'Immunology_Lecture_Notes.pdf',
      uploadDate: new Date(Date.now() - 172800000),
      type: 'notes',
      size: '1.8 MB',
      aiSummary: 'Detailed notes on adaptive immunity, T-cell activation, and autoimmune disorders',
      generatedQuizzes: 2,
      keyTopics: ['T-cells', 'Adaptive Immunity', 'Autoimmune Disorders'],
      difficulty: 'Intermediate',
      specialty: 'Immunology',
      originalContent: 'Adaptive immunity is characterized by specificity, memory, and the ability to distinguish self from non-self antigens...'
    }
  ]);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedContent[]>(uploadedContent);

  const [studyGoals] = useState<StudyGoal[]>([
    { id: '1', title: 'Complete 50 Cardiology Questions', target: 50, current: 32, deadline: new Date(Date.now() + 604800000), type: 'quizzes' },
    { id: '2', title: 'Study 20 Hours This Week', target: 20, current: 14, deadline: new Date(Date.now() + 259200000), type: 'hours' },
    { id: '3', title: 'Master 5 Pharmacology Topics', target: 5, current: 3, deadline: new Date(Date.now() + 1209600000), type: 'topics' },
  ]);

  const [studyGroups] = useState<StudyGroup[]>([
    { id: '1', name: 'Cardiology Study Circle', members: 12, topic: 'Cardiology', nextSession: new Date(Date.now() + 86400000), isLive: false, description: 'Weekly cardiology case discussions and quiz competitions' },
    { id: '2', name: 'USMLE Step 1 Prep', members: 25, topic: 'General Medicine', nextSession: new Date(Date.now() + 3600000), isLive: true, description: 'Intensive USMLE Step 1 preparation with practice questions' },
    { id: '3', name: 'Anatomy Masters', members: 8, topic: 'Anatomy', nextSession: new Date(Date.now() + 172800000), isLive: false, description: 'Interactive anatomy sessions with 3D models and dissection videos' },
  ]);

  // Medical Rounds Data
  const [roundingTeams] = useState([
    {
      id: '1',
      name: 'Internal Medicine Team A',
      attending: 'Dr. Sarah Johnson, MD',
      seniorResident: 'Dr. Michael Chen, PGY-3',
      juniorResidents: ['Dr. Emily Wilson, PGY-1', 'Dr. James Rodriguez, PGY-2'],
      medicalStudents: ['Alex Thompson (MS-3)', 'Lisa Park (MS-4)'],
      service: 'Internal Medicine',
      floor: '7 East',
      patientCount: 12,
      roundingTime: '7:00 AM',
      isActive: true
    },
    {
      id: '2',
      name: 'Cardiology Team',
      attending: 'Dr. Robert Anderson, MD',
      seniorResident: 'Dr. Jennifer Lee, PGY-4',
      juniorResidents: ['Dr. David Kim, PGY-2'],
      medicalStudents: ['Maria Garcia (MS-3)'],
      service: 'Cardiology',
      floor: '6 West',
      patientCount: 8,
      roundingTime: '6:30 AM',
      isActive: true
    }
  ]);

  const [patients] = useState([
    {
      id: '1',
      roomNumber: '701A',
      name: 'Patient A',
      age: 68,
      diagnosis: 'Acute MI, CHF',
      plan: 'Continue metoprolol, start ACE inhibitor',
      status: 'stable',
      assignedTo: 'Dr. Emily Wilson',
      lastUpdated: new Date(),
      notes: 'Patient responding well to treatment. Consider discharge planning.',
      labs: 'Troponin trending down, BNP elevated',
      tasks: ['Echo today', 'Cardio consult', 'PT eval']
    },
    {
      id: '2',
      roomNumber: '702B',
      name: 'Patient B',
      age: 45,
      diagnosis: 'Pneumonia, COPD exacerbation',
      plan: 'Continue antibiotics, steroid taper',
      status: 'improving',
      assignedTo: 'Dr. James Rodriguez',
      lastUpdated: new Date(Date.now() - 3600000),
      notes: 'Breathing improved, oxygen requirements decreased.',
      labs: 'WBC normalizing, procalcitonin down',
      tasks: ['Repeat CXR', 'Pulm consult', 'Home O2 eval']
    }
  ]);

  const [roundingMessages] = useState([
    {
      id: '1',
      sender: 'Dr. Sarah Johnson',
      role: 'Attending',
      message: 'Great job on morning rounds everyone. Remember to update all care plans by 2 PM.',
      timestamp: new Date(Date.now() - 1800000),
      type: 'announcement'
    },
    {
      id: '2',
      sender: 'Dr. Michael Chen',
      role: 'Senior Resident',
      message: 'Patient in 701A ready for discharge. Need social work eval.',
      timestamp: new Date(Date.now() - 3600000),
      type: 'update'
    },
    {
      id: '3',
      sender: 'Alex Thompson',
      role: 'Medical Student',
      message: 'Completed H&P for new admission in 705C. Available for presentation.',
      timestamp: new Date(Date.now() - 5400000),
      type: 'info'
    }
  ]);

  const [quizCategories] = useState<QuizCategory[]>([
    { id: 'cardiology', name: 'Cardiology', icon: '❤️', color: 'bg-red-100 text-red-700', count: 250, description: 'Heart, circulation, and cardiovascular diseases' },
    { id: 'neurology', name: 'Neurology', icon: '🧠', color: 'bg-purple-100 text-purple-700', count: 180, description: 'Brain, nervous system, and neurological disorders' },
    { id: 'immunology', name: 'Immunology', icon: '🛡️', color: 'bg-blue-100 text-blue-700', count: 220, description: 'Immune system, vaccines, and autoimmune diseases' },
    { id: 'pathology', name: 'Pathology', icon: '🔬', color: 'bg-green-100 text-green-700', count: 190, description: 'Disease mechanisms and tissue analysis' },
    { id: 'pharmacology', name: 'Pharmacology', icon: '💊', color: 'bg-yellow-100 text-yellow-700', count: 160, description: 'Drug mechanisms, interactions, and therapeutics' },
    { id: 'anatomy', name: 'Anatomy', icon: '🦴', color: 'bg-pink-100 text-pink-700', count: 200, description: 'Human body structure and organ systems' },
    { id: 'physiology', name: 'Physiology', icon: '⚡', color: 'bg-orange-100 text-orange-700', count: 175, description: 'Body functions and biological processes' },
    { id: 'biochemistry', name: 'Biochemistry', icon: '🧪', color: 'bg-teal-100 text-teal-700', count: 145, description: 'Molecular processes and metabolic pathways' },
  ]);

  const analyticsData = {
    weeklyProgress: [
      { day: 'Mon', questions: 15, accuracy: 85 },
      { day: 'Tue', questions: 22, accuracy: 78 },
      { day: 'Wed', questions: 18, accuracy: 92 },
      { day: 'Thu', questions: 25, accuracy: 88 },
      { day: 'Fri', questions: 20, accuracy: 95 },
      { day: 'Sat', questions: 30, accuracy: 82 },
      { day: 'Sun', questions: 12, accuracy: 90 },
    ],
    topicMastery: [
      { topic: 'Cardiology', mastery: 88, color: '#ef4444' },
      { topic: 'Immunology', mastery: 92, color: '#3b82f6' },
      { topic: 'Pharmacology', mastery: 76, color: '#eab308' },
      { topic: 'Anatomy', mastery: 85, color: '#ec4899' },
      { topic: 'Pathology', mastery: 79, color: '#10b981' },
    ]
  };

  useEffect(() => {
    loadCourses();
    
    let interval: NodeJS.Timeout;
    if (pomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(time => time - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setPomodoroActive(false);
    }
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroTime]);

  // AI File Upload Handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf')) {
      alert('Please upload a PDF, Word document, or text file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setIsAnalyzing(true);
    setUploadProgress(0);
    setAnalysisResult(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 80));
      }, 200);

      // Read file content
      let content = '';
      if (file.type === 'application/pdf') {
        // For PDF files, you might want to use a PDF parsing library
        // For now, we'll prompt user to copy-paste content
        clearInterval(progressInterval);
        setUploadProgress(100);
        alert('PDF upload detected. For best results, please copy and paste the text content using the "Paste Text Content" button below.');
        setIsAnalyzing(false);
        return;
      } else {
        content = await file.text();
      }

      clearInterval(progressInterval);
      setUploadProgress(90);

      // Analyze with AI
      const analysis = await analyzeContent(content, file.name);
      setUploadProgress(100);
      setAnalysisResult(analysis);

      // Add to uploaded content
      const newContent = {
        id: Date.now().toString(),
        filename: file.name,
        uploadDate: new Date(),
        type: file.name.endsWith('.pdf') ? 'pdf' as const : 'notes' as const,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        aiSummary: analysis.summary,
        generatedQuizzes: 0,
        keyTopics: analysis.keyTopics,
        difficulty: analysis.difficulty,
        specialty: analysis.specialty,
        originalContent: content
      };

      setUploadedFiles(prev => [newContent, ...prev]);
      
      // Success notification
      alert(`✅ "${file.name}" analyzed successfully!\n\n📋 Summary: ${analysis.summary}\n\n🎯 Specialty: ${analysis.specialty}\n📈 Difficulty: ${analysis.difficulty}\n🔑 Key Topics: ${analysis.keyTopics.join(', ')}`);

    } catch (error) {
      console.error('Error analyzing file:', error);
      alert('❌ Failed to analyze file. Please try again or contact support.');
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleTextUpload = async (textContent: string) => {
    if (!textContent.trim()) {
      alert('Please enter some text content to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Analyze with AI
      const analysis = await analyzeContent(textContent, 'Pasted Content');
      setAnalysisResult(analysis);

      // Add to uploaded content
      const newContent = {
        id: Date.now().toString(),
        filename: 'Pasted Text Content',
        uploadDate: new Date(),
        type: 'notes' as const,
        size: `${(textContent.length / 1024).toFixed(1)} KB`,
        aiSummary: analysis.summary,
        generatedQuizzes: 0,
        keyTopics: analysis.keyTopics,
        difficulty: analysis.difficulty,
        specialty: analysis.specialty,
        originalContent: textContent
      };

      setUploadedFiles(prev => [newContent, ...prev]);
      
      alert(`✅ Text content analyzed successfully!\n\n📋 Summary: ${analysis.summary}\n\n🎯 Specialty: ${analysis.specialty}\n📈 Difficulty: ${analysis.difficulty}`);

    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('❌ Failed to analyze content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ✅ FIXED handleGenerateQuiz function
  const handleGenerateQuiz = async (content: any, questionCount: number = 10) => {
    console.log('🔥 Generate Quiz clicked for:', content.filename);
    console.log('👤 Current user:', user?.uid); // ✅ Using user from component scope

    setIsGeneratingQuiz(true);

    try {
      // Option A: If content has originalContent (uploaded via your current system)
      if (content.originalContent) {
        console.log('📄 Using content from current upload system');
        const quiz = await generateQuizFromContent(
          content.originalContent,
          content.specialty,
          questionCount,
          user?.uid, // ✅ Using user from component scope
          content.filename
        );
        
        alert(`✅ Quiz generated! ${quiz.questions?.length} questions created.`);
        if (quiz.savedToBank) {
          alert('🏦 Questions saved to community bank!');
        }
      } 
      // Option B: If content is from Firebase (use document ID)
      else if (content.id) {
        console.log('🔍 Retrieving content from Firebase with ID:', content.id);
        const quiz = await generateQuizFromUploadedContent(
          content.id,
          user?.uid, // ✅ Using user from component scope
          questionCount,
          content.specialty
        );
        
        alert(`✅ Quiz generated! ${quiz.questions?.length} questions created.`);
        if (quiz.savedToBank) {
          alert('🏦 Questions saved to community bank!');
        }
      }
      else {
        throw new Error('No content source available');
      }

    } catch (error) {
      console.error('❌ Quiz generation failed:', error);
      alert(`Failed to generate quiz: ${error.message}`);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const showTextUploadDialog = () => {
    const textContent = prompt('Paste your text content here (lecture notes, textbook excerpts, etc.):');
    if (textContent) {
      handleTextUpload(textContent);
    }
  };

  const loadCourses = async () => {
    try {
      const coursesData = await getAllCourses();
      setAllCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePomodoro = () => setPomodoroActive(!pomodoroActive);
  const resetPomodoro = () => { setPomodoroActive(false); setPomodoroTime(25 * 60); };

  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.specialty?.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your comprehensive study hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50">
      {/* Rest of your JSX stays exactly the same - just the component structure and handleGenerateQuiz function are fixed */}
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Your Medical Study Hub 🏥</h1>
                <p className="text-blue-100 mt-2">Everything you need for medical school success</p>
              </div>
              <div className="flex items-center space-x-6">
                {/* Pomodoro Timer */}
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{formatTime(pomodoroTime)}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    <button onClick={togglePomodoro} className="p-1 hover:bg-white/20 rounded">
                      {pomodoroActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button onClick={resetPomodoro} className="p-1 hover:bg-white/20 rounded">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-blue-200 mt-1">Study Timer</div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold">{studyStreak} Day Streak 🔥</div>
                  <p className="text-blue-100 text-sm">Keep it going!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-blue-100 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'hub', label: '🏠 Study Hub', icon: <FileText className="w-4 h-4" /> },
              { id: 'ai-upload', label: '🤖 AI Content', icon: <Brain className="w-4 h-4" /> },
              { id: 'quizzes', label: '📚 Quiz Library', icon: <Book className="w-4 h-4" /> },
              { id: 'study-tools', label: '🛠️ Study Tools', icon: <Calculator className="w-4 h-4" /> },
              { id: 'rounds', label: '🏥 Medical Rounds', icon: <Stethoscope className="w-4 h-4" /> },
              { id: 'collaboration', label: '👥 Study Groups', icon: <Users className="w-4 h-4" /> },
              { id: 'analytics', label: '📊 Analytics', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'goals', label: '🎯 Goals', icon: <Target className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-3 border-b-2 font-medium text-sm transition-all flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ... Rest of your existing JSX content stays exactly the same ... */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Study Hub Tab */}
        {activeTab === 'hub' && (
          <div className="space-y-6">
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <button onClick={() => setActiveTab('ai-upload')} className="bg-gradient-to-br from-purple-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <Brain className="w-8 h-8 mb-3 mx-auto" />
                <div className="font-semibold">Upload & Generate</div>
                <div className="text-xs opacity-90 mt-1">AI-powered quiz creation</div>
              </button>

              <button onClick={() => setActiveTab('rounds')} className="bg-gradient-to-br from-blue-500 to-teal-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <Stethoscope className="w-8 h-8 mb-3 mx-auto" />
                <div className="font-semibold">Medical Rounds</div>
                <div className="text-xs opacity-90 mt-1">Team collaboration</div>
              </button>

              <button onClick={() => setActiveTab('study-tools')} className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <Calculator className="w-8 h-8 mb-3 mx-auto" />
                <div className="font-semibold">Study Tools</div>
                <div className="text-xs opacity-90 mt-1">Calculators & references</div>
              </button>

              <button onClick={() => setActiveTab('collaboration')} className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <Users className="w-8 h-8 mb-3 mx-auto" />
                <div className="font-semibold">Study Groups</div>
                <div className="text-xs opacity-90 mt-1">Collaborate with peers</div>
              </button>

              <button onClick={() => setActiveTab('goals')} className="bg-gradient-to-br from-pink-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <Target className="w-8 h-8 mb-3 mx-auto" />
                <div className="font-semibold">Study Goals</div>
                <div className="text-xs opacity-90 mt-1">Track your progress</div>
              </button>
            </div>

            {/* Today's Focus & AI Assistant */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                    Today's Focus Areas
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200/50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Cardiovascular Pathophysiology</h4>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">High Priority</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Based on your recent quiz performance, focus on arrhythmia classification and heart failure mechanisms.</p>
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">Start Practice</button>
                        <button className="bg-white text-blue-600 border border-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-50">Review Notes</button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200/50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Immunology Review</h4>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Medium Priority</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Continue building on your strong foundation with advanced immunology concepts.</p>
                      <div className="flex space-x-2">
                        <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Continue Learning</button>
                        <button className="bg-white text-green-600 border border-green-600 px-3 py-1 rounded text-xs hover:bg-green-50">View Progress</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  AI Study Assistant
                </h3>
                <div className="space-y-3">
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200/50">
                    <div className="text-sm font-medium text-purple-800 mb-1">💡 Smart Suggestion</div>
                    <div className="text-sm text-purple-700">Based on your study pattern, you're most productive between 2-4 PM. Schedule your hardest topics then!</div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200/50">
                    <div className="text-sm font-medium text-blue-800 mb-1">📚 Recommended Review</div>
                    <div className="text-sm text-blue-700">You haven't reviewed pharmacology in 3 days. Consider a quick 15-minute session.</div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-colors">
                    Chat with AI Tutor
                  </button>
                </div>
              </div>
            </div>

            {/* Study Session Overview */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Study Sessions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {studySessions.map(session => (
                  <div key={session.id} className="bg-blue-50/50 p-4 rounded-lg border border-blue-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{session.topic}</span>
                      <span className={`text-sm font-semibold ${
                        session.score >= 80 ? 'text-green-600' : session.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {session.score}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>⏱️ {session.duration} minutes</div>
                      <div>❓ {session.questionsAnswered} questions</div>
                      <div>📅 {session.date.toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Content Upload Tab */}
        {activeTab === 'ai-upload' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Brain className="w-6 h-6 mr-3 text-purple-500" />
                AI-Powered Content Upload & Quiz Generation
              </h3>
              
              <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isAnalyzing ? 'border-blue-500 bg-blue-50' : 'border-blue-300 hover:border-blue-400'
              }`}>
                <Upload className={`w-12 h-12 mx-auto mb-4 ${isAnalyzing ? 'text-blue-600 animate-pulse' : 'text-blue-500'}`} />
                
                {isAnalyzing ? (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-blue-900">Analyzing Your Content...</h4>
                    <div className="w-full bg-blue-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-blue-700">AI is extracting key concepts and analyzing difficulty level...</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Your Study Materials</h4>
                    <p className="text-gray-600 mb-4">Drop PDFs, lecture notes, or textbook chapters. Our AI will analyze and create custom quizzes!</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <label className={`bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer ${
                    isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.txt,.doc,.docx"
                      className="hidden"
                      disabled={isAnalyzing}
                    />
                    {isAnalyzing ? 'Processing...' : 'Upload Files'}
                  </label>
                  <button 
                    onClick={showTextUploadDialog}
                    disabled={isAnalyzing}
                    className={`border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors ${
                      isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Paste Text Content
                  </button>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  Supported formats: PDF, Word documents, text files (max 10MB)
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200/50">
                  <div className="text-2xl mb-2">📄</div>
                  <div className="font-medium text-green-800">Smart Analysis</div>
                  <div className="text-sm text-green-600">Extract key concepts automatically</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200/50">
                  <div className="text-2xl mb-2">🤖</div>
                  <div className="font-medium text-purple-800">AI Quiz Generation</div>
                  <div className="text-sm text-purple-600">Create targeted practice questions</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200/50">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium text-blue-800">Adaptive Difficulty</div>
                  <div className="text-sm text-blue-600">Questions tailored to your level</div>
                </div>
              </div>

              {/* Analysis Result Display */}
              {analysisResult && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200/50">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Analysis Complete!</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-700">Specialty:</span>
                      <span className="ml-2 text-green-600">{analysisResult.specialty}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Difficulty:</span>
                      <span className="ml-2 text-green-600">{analysisResult.difficulty}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-green-700">Key Topics:</span>
                      <span className="ml-2 text-green-600">{analysisResult.keyTopics.join(', ')}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="font-medium text-green-700">Summary:</span>
                    <p className="text-green-600 mt-1">{analysisResult.summary}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded Content */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Uploaded Content ({uploadedFiles.length})</h3>
              
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No content uploaded yet. Upload some study materials to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadedFiles.map(content => (
                    <div key={content.id} className="border border-blue-200/50 rounded-lg p-4 hover:border-blue-300 transition-colors bg-blue-50/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <h4 className="font-medium text-gray-900">{content.filename}</h4>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{content.type}</span>
                            <span className="text-xs text-gray-500">{content.size}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{content.aiSummary}</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {content.keyTopics.map((topic, index) => (
                              <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                {topic}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>📅 {content.uploadDate.toLocaleDateString()}</span>
                            <span>📝 {content.generatedQuizzes} quizzes generated</span>
                            <span>🎓 {content.difficulty}</span>
                            <span>🏥 {content.specialty}</span>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col space-y-2">
                          <button 
                            onClick={() => handleGenerateQuiz(content, 10)}
                            disabled={isGeneratingQuiz}
                            className={`bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors ${
                              isGeneratingQuiz ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {isGeneratingQuiz ? 'Generating...' : 'Generate Quiz'}
                          </button>
                          <button 
                            onClick={() => handleGenerateQuiz(content, 25)}
                            disabled={isGeneratingQuiz}
                            className={`bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors ${
                              isGeneratingQuiz ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {isGeneratingQuiz ? 'Generating...' : 'Generate 25Q'}
                          </button>
                          <button className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors">
                            Practice
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Generation Status */}
            {isGeneratingQuiz && (
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-purple-100/50 border border-purple-100/30 p-6">
                <div className="flex items-center space-x-3">
                  <Brain className="w-6 h-6 text-purple-600 animate-pulse" />
                  <div>
                    <h4 className="font-medium text-purple-800">Generating Quiz Questions...</h4>
                    <p className="text-sm text-purple-600">AI is creating custom questions based on your content</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rest of your tabs remain the same... */}
      </div>
    </div>
  );
};

export default ComprehensiveStudyHub;