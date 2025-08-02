"use client";

import React, { useState, useEffect } from 'react';
import { getAllCourses } from '../../lib/courseService';
import { Upload, FileText, Brain, Users, Clock, Target, Calculator, Book, MessageCircle, Calendar, Zap, TrendingUp, Award, Play, Pause, RotateCcw, Settings, Search, Filter, Video, Mic, Share, BarChart3, PieChart, LineChart, Heart, Activity, AlertCircle, CheckCircle, Star, Globe, Camera, Stethoscope, Microscope, FlaskConical, Pill, BookOpen, GraduationCap, UserPlus, Send, Phone, Mail, ThumbsUp, ThumbsDown, Eye, Download, Bookmark, Lightbulb, Rocket } from 'lucide-react';

// Enhanced interfaces for the complete study hub
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
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hub');
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [studyStreak, setStudyStreak] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quizFilter, setQuizFilter] = useState('all');

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
      specialty: 'Cardiology'
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
      specialty: 'Immunology'
    }
  ]);

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
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Brain className="w-6 h-6 mr-3 text-purple-500" />
                AI-Powered Content Upload & Quiz Generation
              </h3>
              
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Your Study Materials</h4>
                <p className="text-gray-600 mb-4">Drop PDFs, lecture notes, or textbook chapters. Our AI will analyze and create custom quizzes!</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Upload Files
                  </button>
                  <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                    Paste Text Content
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200/50">
                  <div className="text-2xl mb-2">📄</div>
                  <div className="font-medium text-green-800">PDF Analysis</div>
                  <div className="text-sm text-green-600">Extract key concepts automatically</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200/50">
                  <div className="text-2xl mb-2">🤖</div>
                  <div className="font-medium text-purple-800">AI Quiz Generation</div>
                  <div className="text-sm text-purple-600">Create targeted practice questions</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200/50">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium text-blue-800">Smart Difficulty</div>
                  <div className="text-sm text-blue-600">Adaptive to your level</div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Uploaded Content</h3>
              <div className="space-y-4">
                {uploadedContent.map(content => (
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
                          {content.keyTopics.map(topic => (
                            <span key={topic} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
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
                      <div className="ml-4 flex space-x-2">
                        <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">
                          Generate More Quizzes
                        </button>
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                          Practice
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Quiz Library Tab */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search medical quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-blue-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  />
                </div>
                <div className="flex space-x-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-blue-200/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  >
                    <option value="all">All Specialties</option>
                    {quizCategories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <select
                    value={quizFilter}
                    onChange={(e) => setQuizFilter(e.target.value)}
                    className="border border-blue-200/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quiz Categories */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Medical Specialty</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quizCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      selectedCategory === category.id ? 'border-blue-500 bg-blue-50' : 'border-blue-200/50 bg-blue-50/20'
                    }`}
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{category.count} questions</div>
                    <div className="text-xs text-gray-500 mt-2">{category.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quiz Library */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Medical Quiz Library ({filteredCourses.length} quizzes)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.map(course => (
                  <div key={course.id} className="border border-blue-200/50 rounded-lg p-4 hover:border-blue-300 transition-all hover:shadow-md bg-blue-50/20">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex-1">{course.title}</h4>
                      <Bookmark className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-pointer" />
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        🏥 {course.specialty}
                      </span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        📝 {course.difficulty}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        ❓ {course.questionCount} Q
                      </span>
                    </div>
                    
                    {course.description && (
                      <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                    )}
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Start Quiz
                      </button>
                      <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Study Tools Tab */}
        {activeTab === 'study-tools' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Medical Calculators */}
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-green-500" />
                  Medical Calculators
                </h3>
                <div className="space-y-3">
                  <button className="w-full bg-green-50 hover:bg-green-100 p-3 rounded-lg text-left border border-green-200/50 transition-colors">
                    <div className="flex items-center">
                      <Heart className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <div className="font-medium text-green-800">BMI Calculator</div>
                        <div className="text-sm text-green-600">Calculate body mass index</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-left border border-blue-200/50 transition-colors">
                    <div className="flex items-center">
                      <Activity className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <div className="font-medium text-blue-800">GFR Calculator</div>
                        <div className="text-sm text-blue-600">Glomerular filtration rate</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full bg-purple-50 hover:bg-purple-100 p-3 rounded-lg text-left border border-purple-200/50 transition-colors">
                    <div className="flex items-center">
                      <Pill className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <div className="font-medium text-purple-800">Drug Dosage</div>
                        <div className="text-sm text-purple-600">Calculate medication doses</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full bg-red-50 hover:bg-red-100 p-3 rounded-lg text-left border border-red-200/50 transition-colors">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                      <div>
                        <div className="font-medium text-red-800">APACHE Score</div>
                        <div className="text-sm text-red-600">ICU severity assessment</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Study Techniques */}
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-500" />
                  Study Techniques
                </h3>
                <div className="space-y-3">
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200/50">
                    <div className="font-medium text-orange-800">Pomodoro Timer</div>
                    <div className="text-sm text-orange-600 mb-2">25 min focus + 5 min break</div>
                    <div className="text-2xl font-bold text-orange-700 text-center">{formatTime(pomodoroTime)}</div>
                    <div className="flex justify-center mt-2 space-x-2">
                      <button onClick={togglePomodoro} className="p-1 bg-orange-600 text-white rounded">
                        {pomodoroActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button onClick={resetPomodoro} className="p-1 bg-orange-600 text-white rounded">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button className="w-full bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-left border border-blue-200/50 transition-colors">
                    <div className="font-medium text-blue-800">Spaced Repetition</div>
                    <div className="text-sm text-blue-600">AI-optimized review schedule</div>
                  </button>
                  <button className="w-full bg-green-50 hover:bg-green-100 p-3 rounded-lg text-left border border-green-200/50 transition-colors">
                    <div className="font-medium text-green-800">Active Recall</div>
                    <div className="text-sm text-green-600">Test your knowledge</div>
                  </button>
                </div>
              </div>

              {/* Quick References */}
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
                  Quick References
                </h3>
                <div className="space-y-3">
                  <button className="w-full bg-red-50 hover:bg-red-100 p-3 rounded-lg text-left border border-red-200/50 transition-colors">
                    <div className="flex items-center">
                      <FlaskConical className="w-5 h-5 text-red-600 mr-3" />
                      <div>
                        <div className="font-medium text-red-800">Normal Values</div>
                        <div className="text-sm text-red-600">Lab values & vital signs</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full bg-indigo-50 hover:bg-indigo-100 p-3 rounded-lg text-left border border-indigo-200/50 transition-colors">
                    <div className="flex items-center">
                      <Pill className="w-5 h-5 text-indigo-600 mr-3" />
                      <div>
                        <div className="font-medium text-indigo-800">Drug Interactions</div>
                        <div className="text-sm text-indigo-600">Common contraindications</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full bg-teal-50 hover:bg-teal-100 p-3 rounded-lg text-left border border-teal-200/50 transition-colors">
                    <div className="flex items-center">
                      <Stethoscope className="w-5 h-5 text-teal-600 mr-3" />
                      <div>
                        <div className="font-medium text-teal-800">Anatomy Atlas</div>
                        <div className="text-sm text-teal-600">Interactive diagrams</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full bg-purple-50 hover:bg-purple-100 p-3 rounded-lg text-left border border-purple-200/50 transition-colors">
                    <div className="flex items-center">
                      <Microscope className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <div className="font-medium text-purple-800">Pathology Images</div>
                        <div className="text-sm text-purple-600">Histology & radiology</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Tools Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Case Study Simulator */}
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-indigo-500" />
                  Case Study Simulator
                </h3>
                <p className="text-gray-600 mb-4">Practice real patient scenarios with interactive case studies</p>
                <div className="space-y-3">
                  <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200/50">
                    <div className="font-medium text-indigo-800">Emergency Medicine Cases</div>
                    <div className="text-sm text-indigo-600">12 interactive scenarios</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200/50">
                    <div className="font-medium text-green-800">Internal Medicine Cases</div>
                    <div className="text-sm text-green-600">8 complex cases</div>
                  </div>
                  <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                    Start Case Study
                  </button>
                </div>
              </div>

              {/* Medical News & Updates */}
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-green-500" />
                  Medical News & Updates
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200/50">
                    <div className="text-xs text-blue-600 mb-1">Latest Research</div>
                    <div className="font-medium text-blue-800 text-sm">New COVID-19 Variant Discovered</div>
                    <div className="text-xs text-blue-600 mt-1">2 hours ago</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200/50">
                    <div className="text-xs text-green-600 mb-1">Drug Update</div>
                    <div className="font-medium text-green-800 text-sm">FDA Approves New Cancer Treatment</div>
                    <div className="text-xs text-green-600 mt-1">5 hours ago</div>
                  </div>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                    View All Updates
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medical Rounds Tab */}
        {activeTab === 'rounds' && (
          <div className="space-y-6">
            {/* Rounding Teams Overview */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Stethoscope className="w-6 h-6 mr-3 text-blue-500" />
                  Medical Rounds & Team Collaboration
                </h3>
                <div className="flex space-x-3">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Join Team</span>
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Create Team
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {roundingTeams.map(team => (
                  <div key={team.id} className={`border rounded-xl p-6 transition-all hover:shadow-md ${
                    team.isActive ? 'border-green-500 bg-green-50/50' : 'border-blue-200/50 bg-blue-50/20'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 text-lg">{team.name}</h4>
                      {team.isActive && (
                        <span className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center">
                        <GraduationCap className="w-4 h-4 text-purple-600 mr-2" />
                        <span className="text-sm font-medium text-purple-800">Attending:</span>
                        <span className="text-sm text-gray-700 ml-2">{team.attending}</span>
                      </div>
                      <div className="flex items-center">
                        <Stethoscope className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">Senior Resident:</span>
                        <span className="text-sm text-gray-700 ml-2">{team.seniorResident}</span>
                      </div>
                      <div className="flex items-start">
                        <Users className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-green-800">Team Members:</span>
                          <div className="text-sm text-gray-700 ml-2">
                            {[...team.juniorResidents, ...team.medicalStudents].join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <span className="font-medium text-blue-800">Service:</span>
                        <div className="text-blue-700">{team.service}</div>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <span className="font-medium text-purple-800">Floor:</span>
                        <div className="text-purple-700">{team.floor}</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <span className="font-medium text-green-800">Patients:</span>
                        <div className="text-green-700">{team.patientCount} active</div>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <span className="font-medium text-orange-800">Rounds:</span>
                        <div className="text-orange-700">{team.roundingTime}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        View Patients
                      </button>
                      <button className="bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button className="bg-purple-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Patient Rounding Sheets */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-500" />
                Patient Rounding Sheets
              </h3>
              
              <div className="space-y-4">
                {patients.map(patient => (
                  <div key={patient.id} className="border border-blue-200/50 rounded-lg p-4 hover:border-blue-300 transition-colors bg-blue-50/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">Room {patient.roomNumber}</h4>
                          <span className="text-sm text-gray-600">Age: {patient.age}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            patient.status === 'stable' ? 'bg-green-100 text-green-700' :
                            patient.status === 'improving' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {patient.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Diagnosis:</span>
                            <div className="text-sm text-gray-600">{patient.diagnosis}</div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Assigned to:</span>
                            <div className="text-sm text-blue-600">{patient.assignedTo}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Plan:</span>
                            <div className="text-sm text-gray-600">{patient.plan}</div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Labs:</span>
                            <div className="text-sm text-gray-600">{patient.labs}</div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Notes:</span>
                            <div className="text-sm text-gray-600">{patient.notes}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-sm font-medium text-gray-700">Tasks:</span>
                          {patient.tasks.map((task, index) => (
                            <span key={index} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                              {task}
                            </span>
                          ))}
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Last updated: {patient.lastUpdated.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="ml-4 flex space-x-2">
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                          Edit
                        </button>
                        <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Communication & Resources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Communication */}
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
                  Team Communication
                </h3>
                
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {roundingMessages.map(message => (
                    <div key={message.id} className={`p-3 rounded-lg ${
                      message.type === 'announcement' ? 'bg-purple-50 border border-purple-200/50' :
                      message.type === 'update' ? 'bg-blue-50 border border-blue-200/50' :
                      'bg-green-50 border border-green-200/50'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900">{message.sender}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          message.role === 'Attending' ? 'bg-purple-100 text-purple-700' :
                          message.role === 'Senior Resident' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {message.role}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mb-1">{message.message}</div>
                      <div className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Send a message to the team..."
                    className="flex-1 px-3 py-2 border border-blue-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Shared Resources */}
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Share className="w-5 h-5 mr-2 text-green-500" />
                  Shared Resources
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200/50 hover:border-blue-300 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-blue-800 text-sm">Heart Failure Guidelines 2024</div>
                        <div className="text-xs text-blue-600">Shared by Dr. Sarah Johnson</div>
                      </div>
                      <Download className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200/50 hover:border-green-300 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-green-800 text-sm">COPD Management Protocol</div>
                        <div className="text-xs text-green-600">Shared by Dr. Michael Chen</div>
                      </div>
                      <Download className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200/50 hover:border-purple-300 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-purple-800 text-sm">Case Presentation Template</div>
                        <div className="text-xs text-purple-600">Shared by Dr. Jennifer Lee</div>
                      </div>
                      <Download className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Share Resource</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions for Rounds */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Quick Rounding Actions
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105">
                  <FileText className="w-6 h-6 mb-2 mx-auto" />
                  <div className="text-sm font-semibold">New H&P</div>
                </button>
                
                <button className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105">
                  <Activity className="w-6 h-6 mb-2 mx-auto" />
                  <div className="text-sm font-semibold">Progress Note</div>
                </button>
                
                <button className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105">
                  <Calendar className="w-6 h-6 mb-2 mx-auto" />
                  <div className="text-sm font-semibold">Schedule OR</div>
                </button>
                
                <button className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105">
                  <Phone className="w-6 h-6 mb-2 mx-auto" />
                  <div className="text-sm font-semibold">Consult</div>
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Enhanced Study Groups Tab */}
        {activeTab === 'collaboration' && (
          <div className="space-y-6">
            {/* Live Study Sessions */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-blue-500" />
                  Study Groups & Collaboration
                </h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Create Group</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyGroups.map(group => (
                  <div key={group.id} className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                    group.isLive ? 'border-green-500 bg-green-50/50' : 'border-blue-200/50 bg-blue-50/20'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{group.name}</h4>
                      {group.isLive && (
                        <span className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          LIVE
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {group.members} members
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Book className="w-4 h-4 mr-2" />
                        {group.topic}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {group.nextSession.toLocaleDateString()}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                    
                    <div className="flex space-x-2">
                      <button className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        group.isLive 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}>
                        {group.isLive ? 'Join Live' : 'Join Group'}
                      </button>
                      <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collaboration Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Virtual Study Room */}
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-purple-500" />
                  Virtual Study Room
                </h3>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200/50">
                    <div className="font-medium text-purple-800 mb-2">Create Study Room</div>
                    <div className="text-sm text-purple-600 mb-3">Start a video session with screen sharing and collaborative whiteboard</div>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                      Create Room
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200/50">
                      <div>
                        <div className="font-medium text-blue-800 text-sm">Cardiology Review</div>
                        <div className="text-xs text-blue-600">3 participants</div>
                      </div>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">Join</button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200/50">
                      <div>
                        <div className="font-medium text-green-800 text-sm">USMLE Prep Session</div>
                        <div className="text-xs text-green-600">7 participants</div>
                      </div>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Join</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Study Chat & Forums */}
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-green-500" />
                  Study Chat & Forums
                </h3>
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-green-800 text-sm">Question Discussion</div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">24 new</span>
                    </div>
                    <div className="text-xs text-green-600">Get help with challenging questions from peers and experts</div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-blue-800 text-sm">Study Tips</div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">12 new</span>
                    </div>
                    <div className="text-xs text-blue-600">Share and discover effective study strategies</div>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-purple-800 text-sm">Exam Experiences</div>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">8 new</span>
                    </div>
                    <div className="text-xs text-purple-600">Learn from others' exam experiences and insights</div>
                  </div>
                  
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                    Join Discussions
                  </button>
                </div>
              </div>
            </div>

            {/* Peer Tutoring */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-orange-500" />
                Peer Tutoring & Mentorship
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200/50 text-center">
                  <div className="text-2xl mb-2">👨‍🏫</div>
                  <div className="font-medium text-orange-800">Find a Tutor</div>
                  <div className="text-sm text-orange-600 mb-3">Connect with senior students</div>
                  <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                    Browse Tutors
                  </button>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200/50 text-center">
                  <div className="text-2xl mb-2">🎓</div>
                  <div className="font-medium text-blue-800">Become a Tutor</div>
                  <div className="text-sm text-blue-600 mb-3">Help junior students</div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Apply Now
                  </button>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200/50 text-center">
                  <div className="text-2xl mb-2">🤝</div>
                  <div className="font-medium text-purple-800">Study Buddy</div>
                  <div className="text-sm text-purple-600 mb-3">Find your perfect match</div>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                    Find Buddy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6 text-center">
                <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">87%</div>
                <div className="text-sm text-gray-600">Average Score</div>
                <div className="text-xs text-green-600 mt-1">↗ +5% this week</div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6 text-center">
                <PieChart className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">142</div>
                <div className="text-sm text-gray-600">Questions This Week</div>
                <div className="text-xs text-green-600 mt-1">↗ +18% from last week</div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6 text-center">
                <Clock className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">8.5h</div>
                <div className="text-sm text-gray-600">Study Time</div>
                <div className="text-xs text-purple-600 mt-1">Daily avg: 1.2h</div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6 text-center">
                <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">78%</div>
                <div className="text-sm text-gray-600">Improvement Rate</div>
                <div className="text-xs text-orange-600 mt-1">Consistency score</div>
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <LineChart className="w-5 h-5 mr-2 text-blue-500" />
                Weekly Progress Analysis
              </h3>
              <div className="h-64 bg-blue-50/30 rounded-lg p-4 flex items-center justify-center border border-blue-200/50">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <div className="font-medium text-gray-900">Interactive Chart</div>
                  <div className="text-sm text-gray-600">Your weekly performance visualization would display here</div>
                  <div className="text-xs text-gray-500 mt-2">Questions answered, accuracy trends, and study time analysis</div>
                </div>
              </div>
              
              {/* Weekly Stats Grid */}
              <div className="grid grid-cols-7 gap-2 mt-4">
                {analyticsData.weeklyProgress.map((day, index) => (
                  <div key={index} className="bg-blue-50/50 p-3 rounded-lg border border-blue-200/50 text-center">
                    <div className="text-xs font-medium text-gray-700">{day.day}</div>
                    <div className="text-sm font-bold text-blue-600">{day.questions}</div>
                    <div className="text-xs text-gray-600">{day.accuracy}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic Mastery & Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Topic Mastery */}
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-500" />
                  Topic Mastery Analysis
                </h3>
                <div className="space-y-4">
                  {analyticsData.topicMastery.map((topic, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{topic.topic}</span>
                        <span className="text-sm font-bold" style={{ color: topic.color }}>{topic.mastery}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${topic.mastery}%`,
                            backgroundColor: topic.color
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200/50">
                  <div className="text-sm font-medium text-green-800 mb-2">🎯 Recommended Focus Areas</div>
                  <div className="text-sm text-green-700">
                    Based on your performance, prioritize: <strong>Pharmacology</strong> and <strong>Pathology</strong> for maximum improvement.
                  </div>
                </div>
              </div>

              {/* Study Patterns */}
              <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-purple-500" />
                  Study Pattern Insights
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200/50">
                    <div className="font-medium text-purple-800 mb-2">Peak Performance Time</div>
                    <div className="text-sm text-purple-700">You score highest between 2:00 PM - 4:00 PM (avg 91%)</div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200/50">
                    <div className="font-medium text-blue-800 mb-2">Study Session Length</div>
                    <div className="text-sm text-blue-700">Optimal session: 45-60 minutes (avg accuracy 88%)</div>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200/50">
                    <div className="font-medium text-orange-800 mb-2">Weekly Pattern</div>
                    <div className="text-sm text-orange-700">Best performance on Wed-Fri, lower on Mon</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200/50">
                    <div className="font-medium text-green-800 mb-2">Improvement Trend</div>
                    <div className="text-sm text-green-700">Consistent 15% monthly improvement rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                AI Predictive Analytics & Recommendations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200/50">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium text-yellow-800">Exam Readiness</div>
                  <div className="text-2xl font-bold text-yellow-700 my-2">82%</div>
                  <div className="text-sm text-yellow-600">Predicted score: 85-90%</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200/50">
                  <div className="text-2xl mb-2">⏰</div>
                  <div className="font-medium text-blue-800">Time to Target</div>
                  <div className="text-2xl font-bold text-blue-700 my-2">12 days</div>
                  <div className="text-sm text-blue-600">To reach 90% consistency</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border border-green-200/50">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="font-medium text-green-800">Next Milestone</div>
                  <div className="text-2xl font-bold text-green-700 my-2">500</div>
                  <div className="text-sm text-green-600">Questions until mastery</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Target className="w-6 h-6 mr-3 text-purple-500" />
                  Your Study Goals
                </h3>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                  Add New Goal
                </button>
              </div>
              
              <div className="space-y-4">
                {studyGoals.map(goal => (
                  <div key={goal.id} className="border border-purple-200/50 rounded-lg p-4 bg-purple-50/30">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{goal.title}</h4>
                      <span className="text-sm text-gray-500">
                        Due: {goal.deadline.toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(goal.current / goal.target) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        (goal.current / goal.target) >= 0.8 ? 'bg-green-100 text-green-700' :
                        (goal.current / goal.target) >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {Math.round((goal.current / goal.target) * 100)}% Complete
                      </span>
                      <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Showcase */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                Achievement Gallery
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-4 rounded-lg border border-yellow-200/50 text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="font-medium text-yellow-800">Quiz Master</div>
                  <div className="text-sm text-yellow-600">100 quizzes completed</div>
                  <div className="text-xs text-yellow-700 mt-2">Earned: 2 days ago</div>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-4 rounded-lg border border-blue-200/50 text-center">
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="font-medium text-blue-800">Study Streak</div>
                  <div className="text-sm text-blue-600">7 days in a row</div>
                  <div className="text-xs text-blue-700 mt-2">Current streak</div>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-teal-100 p-4 rounded-lg border border-green-200/50 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="font-medium text-green-800">Perfect Score</div>
                  <div className="text-sm text-green-600">100% on Immunology</div>
                  <div className="text-xs text-green-700 mt-2">Earned: 1 week ago</div>
                </div>
              </div>
              
              {/* Progress Towards Next Achievement */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-purple-800">Next Achievement: Anatomy Expert</div>
                  <span className="text-sm text-purple-600">85% complete</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <div className="text-sm text-purple-600 mt-2">Complete 15 more anatomy questions to unlock</div>
              </div>
            </div>

            {/* Goal Templates */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Rocket className="w-5 h-5 mr-2 text-blue-500" />
                Suggested Goals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-blue-200/50 rounded-lg p-4 bg-blue-50/20 hover:border-blue-300 transition-colors cursor-pointer">
                  <div className="font-medium text-gray-900 mb-2">USMLE Step 1 Preparation</div>
                  <div className="text-sm text-gray-600 mb-3">Complete 2000 practice questions over 8 weeks</div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Set This Goal
                  </button>
                </div>
                
                <div className="border border-green-200/50 rounded-lg p-4 bg-green-50/20 hover:border-green-300 transition-colors cursor-pointer">
                  <div className="font-medium text-gray-900 mb-2">Daily Study Consistency</div>
                  <div className="text-sm text-gray-600 mb-3">Study for at least 2 hours daily for 30 days</div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                    Set This Goal
                  </button>
                </div>
                
                <div className="border border-purple-200/50 rounded-lg p-4 bg-purple-50/20 hover:border-purple-300 transition-colors cursor-pointer">
                  <div className="font-medium text-gray-900 mb-2">Specialty Mastery</div>
                  <div className="text-sm text-gray-600 mb-3">Achieve 90% accuracy in Cardiology</div>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                    Set This Goal
                  </button>
                </div>
                
                <div className="border border-orange-200/50 rounded-lg p-4 bg-orange-50/20 hover:border-orange-300 transition-colors cursor-pointer">
                  <div className="font-medium text-gray-900 mb-2">Weak Area Improvement</div>
                  <div className="text-sm text-gray-600 mb-3">Improve Pharmacology score by 20%</div>
                  <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                    Set This Goal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveStudyHub;