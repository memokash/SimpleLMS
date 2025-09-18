'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserStats, UserStats as CourseServiceUserStats } from '../../lib/courseService';
import {
  BookOpenCheck,
  FileText,
  GraduationCap,
  Sparkles,
  Lightbulb,
  Stethoscope,
  BrainCircuit,
  BookOpen,
  Gauge,
  UserCog,
  Loader2,
  TrendingUp,
  Award,
  Target,
  Calendar,
  Activity,
  Brain,
  BarChart3,
  MessageSquare,
  Users,
  ChevronRight,
  Bell,
  Clock,
  Video,
  Mic,
  Settings,
  HelpCircle,
  Clipboard,
  Heart,
  Thermometer,
  Shield,
  Database,
  Mail,
  Home,
  MapPin,
  DollarSign,
  Plane,
  Coffee,
  Car,
  Utensils,
  Dumbbell,
  Music,
  ShoppingCart,
  Building,
  School,
  Briefcase,
  HeartHandshake,
  Flame,
  Package,
  MessageCircle
} from 'lucide-react';

interface UserStats {
  totalCourses: number;
  completed: number;
  inProgress: number;
  avgScore: number;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalCourses: 12,
    completed: 8,
    inProgress: 4,
    avgScore: 87.5
  });

  // Study streak tracking
  const [studyStreak, setStudyStreak] = useState(7);
  const [weeklyGoal, setWeeklyGoal] = useState({ current: 15, target: 20 });
  const [weakTopics, setWeakTopics] = useState(['Pharmacology', 'Pathology']);

  // Get current date info
  const today = new Date();
  const currentMonth = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentDay = today.getDate();
  
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setMounted(true);
        if (user?.uid) {
          const realStats = await getUserStats(user.uid);
          if (realStats) {
            setStats({
              totalCourses: (realStats.coursesStarted + realStats.coursesCompleted) || 0,
              completed: realStats.coursesCompleted || 0,
              inProgress: realStats.coursesStarted || 0,
              avgScore: realStats.averageScore || 0
            });
          }
        }
      } catch (error) {
        console.warn('Failed to load user stats:', error);
      } finally {
        setLoading(false);
      }
    };
    initializeDashboard();
  }, [user]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="flex items-center text-primary bg-white rounded-xl p-6 shadow-lg">
          <Loader2 className="animate-spin h-6 w-6 mr-3" />
          <span className="text-lg font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Calendar days generation
  const generateCalendarDays = () => {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  
  // Sample events for calendar
  const eventsOnDays = [5, 12, 15, 22, 28];

  // Institutional affiliations
  const userInstitution = 'Johns Hopkins School of Medicine';
  const userResidency = 'Internal Medicine - PGY-2';
  const userHospital = 'Johns Hopkins Hospital';

  return (
    <div className="min-h-screen bg-light">
      <div className="container mx-auto px-4 py-6">
        
        {/* Top Section - Profile & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'S'}
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-primary">
                {user?.displayName || user?.email?.split('@')[0] || 'Medical Student'}
              </h1>
              <p className="text-sm text-primary opacity-75">Ready to continue learning</p>
            </div>
            <Link href="/settings">
              <Settings className="h-5 w-5 text-primary opacity-60 hover:opacity-100 cursor-pointer" />
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="stat-card">
              <div className="stat-number">{stats.totalCourses}</div>
              <div className="stat-label">Courses</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Complete</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.inProgress}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{Math.round(stats.avgScore)}%</div>
              <div className="stat-label">Score</div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex gap-2">
            <Link href="/messages" className="flex-1">
              <div className="kardex-tile flex items-center justify-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">3 New</span>
              </div>
            </Link>
            <Link href="/study-groups" className="flex-1">
              <div className="kardex-tile flex items-center justify-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Groups</span>
              </div>
            </Link>
            <Link href="/notifications" className="flex-1">
              <div className="kardex-tile flex items-center justify-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Alerts</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left Column - Quick Access Tools */}
          <div className="space-y-4">
            
            {/* Study & Performance Analytics */}
            <div className="dashboard-tile">
              <h2 className="text-sm font-bold text-primary mb-3">Performance Analytics</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-medium">Study Streak</span>
                  </div>
                  <span className="text-sm font-bold text-orange-600">{studyStreak} days 🔥</span>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-primary">Weekly Goal</span>
                    <span className="text-primary">{weeklyGoal.current}/{weeklyGoal.target} hrs</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(weeklyGoal.current / weeklyGoal.target) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="p-2 bg-red-50 rounded-lg">
                  <div className="text-xs font-medium text-red-700 mb-1">Weak Topics</div>
                  <div className="flex gap-1 flex-wrap">
                    {weakTopics.map(topic => (
                      <span key={topic} className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Actions - Kardex Style */}
            <div>
              <h2 className="text-sm font-bold text-primary mb-2">Quick Start</h2>
              <div className="kardex-grid">
                <Link href="/courses-dashboard">
                  <div className="kardex-tile">
                    <div className="icon-box-blue rounded p-2 mb-2">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-medium text-primary">Continue Learning</div>
                  </div>
                </Link>
                
                <Link href="/question-bank">
                  <div className="kardex-tile">
                    <div className="icon-box-yellow rounded p-2 mb-2">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-medium text-primary">Questions</div>
                  </div>
                </Link>
                
                <Link href="/enhanced-quiz-display">
                  <div className="kardex-tile">
                    <div className="icon-box-purple rounded p-2 mb-2">
                      <BrainCircuit className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-medium text-primary">Take Quiz</div>
                  </div>
                </Link>
                
                <Link href="/dashboard/etutor">
                  <div className="kardex-tile">
                    <div className="icon-box-pink rounded p-2 mb-2">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-medium text-primary">AI Tutor</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Clinical Tools - From Rounding Tools */}
            <div>
              <h2 className="text-sm font-bold text-primary mb-2">Clinical Tools</h2>
              <div className="space-y-2">
                <Link href="/rounding-tools">
                  <div className="dashboard-tile flex items-center gap-3">
                    <div className="icon-box-red rounded p-2">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-primary">Rounding Tools</div>
                      <div className="text-xs text-primary opacity-75">H&P, Progress Notes</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-primary opacity-50" />
                  </div>
                </Link>
                
                <Link href="/patient-tracker">
                  <div className="dashboard-tile flex items-center gap-3">
                    <div className="icon-box-green rounded p-2">
                      <Clipboard className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-primary">Patient Tracker</div>
                      <div className="text-xs text-primary opacity-75">8 active cases</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-primary opacity-50" />
                  </div>
                </Link>
                
                <Link href="/procedures">
                  <div className="dashboard-tile flex items-center gap-3">
                    <div className="icon-box-blue rounded p-2">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-primary">Procedures Log</div>
                      <div className="text-xs text-primary opacity-75">Track procedures</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-primary opacity-50" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Study Resources */}
            <div>
              <h2 className="text-sm font-bold text-primary mb-2">Resources</h2>
              <div className="kardex-grid">
                <Link href="/reading-resources">
                  <div className="kardex-tile">
                    <FileText className="h-4 w-4 text-primary mb-1" />
                    <div className="text-xs font-medium text-primary">Articles</div>
                  </div>
                </Link>
                
                <Link href="/video-library">
                  <div className="kardex-tile">
                    <Video className="h-4 w-4 text-primary mb-1" />
                    <div className="text-xs font-medium text-primary">Videos</div>
                  </div>
                </Link>
                
                <Link href="/recordings">
                  <div className="kardex-tile">
                    <Mic className="h-4 w-4 text-primary mb-1" />
                    <div className="text-xs font-medium text-primary">Recordings</div>
                  </div>
                </Link>
                
                <Link href="/database">
                  <div className="kardex-tile">
                    <Database className="h-4 w-4 text-primary mb-1" />
                    <div className="text-xs font-medium text-primary">Database</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Center Column - Main Content */}
          <div className="space-y-4">
            
            {/* Today's Schedule */}
            <div className="dashboard-tile">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-primary">Today's Schedule</h2>
                <Clock className="h-4 w-4 text-primary opacity-60" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green" />
                  <span className="font-medium">9:00 AM</span>
                  <span className="text-primary opacity-75">Morning Rounds</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="font-medium">2:00 PM</span>
                  <span className="text-primary opacity-75">Study Group - Cardiology</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium">4:30 PM</span>
                  <span className="text-primary opacity-75">Quiz Review Session</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-yellow" />
                  <span className="font-medium">6:00 PM</span>
                  <span className="text-primary opacity-75">AI Tutor Session</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-tile">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-primary">Recent Activity</h2>
                <Activity className="h-4 w-4 text-primary opacity-60" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="icon-box-green rounded p-1.5">
                    <Award className="h-3 w-3" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-primary">Quiz Completed</div>
                    <div className="text-xs text-primary opacity-75">Scored 92% in Anatomy</div>
                  </div>
                  <span className="text-xs text-primary opacity-50">2h ago</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="icon-box-blue rounded p-1.5">
                    <BookOpen className="h-3 w-3" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-primary">Course Progress</div>
                    <div className="text-xs text-primary opacity-75">Completed Module 3</div>
                  </div>
                  <span className="text-xs text-primary opacity-50">5h ago</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="icon-box-purple rounded p-1.5">
                    <Users className="h-3 w-3" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-primary">Joined Study Group</div>
                    <div className="text-xs text-primary opacity-75">Neurology Review</div>
                  </div>
                  <span className="text-xs text-primary opacity-50">1d ago</span>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="dashboard-tile">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-primary">Performance</h2>
                <Link href="/performance-analytics">
                  <BarChart3 className="h-4 w-4 text-primary opacity-60 hover:opacity-100" />
                </Link>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-primary">Overall Progress</span>
                    <span className="text-primary">{Math.round((stats.completed / stats.totalCourses) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.completed / stats.totalCourses) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-primary">Quiz Average</span>
                    <span className="text-primary">{Math.round(stats.avgScore)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats.avgScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Calendar & Community */}
          <div className="space-y-4">
            
            {/* Mini Calendar */}
            <div className="calendar-widget">
              <h2 className="text-sm font-bold text-primary mb-3">{currentMonth}</h2>
              <div className="grid grid-cols-7 gap-1 text-xs mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <div key={day} className="text-center font-medium text-primary opacity-60">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`calendar-day ${
                      day === currentDay ? 'today' : ''
                    } ${
                      day && eventsOnDays.includes(day) ? 'has-event' : ''
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Global Medical Communities - International */}
            <div className="dashboard-tile">
              <h2 className="text-sm font-bold text-primary mb-3">Global Communities 🌍</h2>
              <div className="space-y-2">
                <Link href="/community/level/medical-students">
                  <div className="flex items-center justify-between p-2 hover:bg-light rounded transition-colors">
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-medium text-primary">Medical Students</span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">45k global</span>
                  </div>
                </Link>
                
                <Link href="/community/level/residents">
                  <div className="flex items-center justify-between p-2 hover:bg-light rounded transition-colors">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-purple-500" />
                      <span className="text-xs font-medium text-primary">Residents/House Officers</span>
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">23k online</span>
                  </div>
                </Link>
                
                <Link href="/community/level/fellows">
                  <div className="flex items-center justify-between p-2 hover:bg-light rounded transition-colors">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs font-medium text-primary">Fellows/Registrars</span>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">12k members</span>
                  </div>
                </Link>

                <Link href="/community/level/attendings">
                  <div className="flex items-center justify-between p-2 hover:bg-light rounded transition-colors">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium text-primary">Consultants/Attendings</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">8k experts</span>
                  </div>
                </Link>

                <Link href="/community/country">
                  <div className="flex items-center justify-between p-2 hover:bg-light rounded transition-colors">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="text-xs font-medium text-primary">By Country/Region</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-primary opacity-50" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Life & Lifestyle - Real World Needs */}
            <div className="dashboard-tile">
              <h2 className="text-sm font-bold text-primary mb-3">Life & Lifestyle 🌎</h2>
              <div className="grid grid-cols-3 gap-2">
                <Link href="/housing">
                  <div className="kardex-tile text-center bg-orange-50 hover:bg-orange-100">
                    <Home className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                    <div className="text-xs text-orange-700 font-medium">Housing</div>
                    <div className="text-xs text-orange-600">5 new</div>
                  </div>
                </Link>
                
                <Link href="/vacation-swap">
                  <div className="kardex-tile text-center bg-blue-50 hover:bg-blue-100">
                    <Plane className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                    <div className="text-xs text-blue-700 font-medium">Vacation</div>
                    <div className="text-xs text-blue-600">Swap</div>
                  </div>
                </Link>
                
                <Link href="/meal-prep">
                  <div className="kardex-tile text-center bg-green-50 hover:bg-green-100">
                    <Utensils className="h-4 w-4 text-green-600 mx-auto mb-1" />
                    <div className="text-xs text-green-700 font-medium">Meal</div>
                    <div className="text-xs text-green-600">Share</div>
                  </div>
                </Link>
                
                <Link href="/fitness">
                  <div className="kardex-tile text-center bg-purple-50 hover:bg-purple-100">
                    <Dumbbell className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                    <div className="text-xs text-purple-700 font-medium">Gym</div>
                    <div className="text-xs text-purple-600">Buddy</div>
                  </div>
                </Link>
                
                <Link href="/marketplace">
                  <div className="kardex-tile text-center bg-yellow-50 hover:bg-yellow-100">
                    <ShoppingCart className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
                    <div className="text-xs text-yellow-700 font-medium">Market</div>
                    <div className="text-xs text-yellow-600">Buy/Sell</div>
                  </div>
                </Link>
                
                <Link href="/dating">
                  <div className="kardex-tile text-center bg-pink-50 hover:bg-pink-100">
                    <HeartHandshake className="h-4 w-4 text-pink-600 mx-auto mb-1" />
                    <div className="text-xs text-pink-700 font-medium">Dating</div>
                    <div className="text-xs text-pink-600">Med</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Research & Virtual Conferences Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          {/* Research Hub */}
          <div className="dashboard-tile bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-primary">Research & Innovation 🔬</h2>
              <div className="flex gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Beta</span>
                <Lightbulb className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
            <div className="space-y-2">
              <Link href="/research/submit">
                <div className="p-2 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-primary">Submit Research</div>
                      <div className="text-xs text-gray-600">Share your findings globally</div>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/research/peer-review">
                <div className="p-2 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-primary">Peer Review Network</div>
                      <div className="text-xs text-gray-600">Collaborative review process</div>
                    </div>
                  </div>
                </div>
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <Link href="/research/trending">
                  <div className="p-2 bg-white rounded text-center hover:bg-gray-50">
                    <TrendingUp className="h-3 w-3 text-green-500 mx-auto mb-1" />
                    <span className="text-xs">Trending Papers</span>
                  </div>
                </Link>
                <Link href="/research/collaborate">
                  <div className="p-2 bg-white rounded text-center hover:bg-gray-50">
                    <HeartHandshake className="h-3 w-3 text-red-500 mx-auto mb-1" />
                    <span className="text-xs">Find Collaborators</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Virtual Conferences - Future Monetization */}
          <div className="dashboard-tile bg-gradient-to-br from-green-50 to-blue-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-primary">Virtual Conferences 🌐</h2>
              <div className="flex gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Coming Soon</span>
                <Video className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-white rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-primary">Book Virtual Conference Room</p>
                  <p className="text-xs text-gray-600 mt-1">Host international medical conferences</p>
                  <div className="mt-2 text-xs text-gray-500">
                    • Up to 500 participants<br/>
                    • Screen sharing & recording<br/>
                    • Real-time translation<br/>
                    • CME credit tracking
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-yellow-50 rounded text-center">
                  <span className="text-xs font-medium text-yellow-700">🔜 Grand Rounds</span>
                </div>
                <div className="p-2 bg-purple-50 rounded text-center">
                  <span className="text-xs font-medium text-purple-700">🔜 Case Studies</span>
                </div>
              </div>

              <div className="p-2 bg-blue-50 rounded text-center">
                <span className="text-xs text-blue-700">Premium feature • Pay-per-conference model</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Global Teaching Platform & More Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          
          {/* Peer Teaching Videos - Global Platform */}
          <div className="dashboard-tile bg-gradient-to-br from-purple-50 to-blue-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-primary">Global Peer Teaching 🌐</h2>
              <Video className="h-4 w-4 text-purple-600" />
            </div>
            <div className="space-y-2">
              <Link href="/teach/record">
                <div className="p-2 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-100 rounded">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-primary">Record Teaching Video</div>
                      <div className="text-xs text-gray-600">Share your knowledge globally</div>
                    </div>
                  </div>
                </div>
              </Link>
              
              <div className="grid grid-cols-2 gap-2">
                <Link href="/videos/trending">
                  <div className="p-2 bg-white rounded text-center hover:bg-gray-50">
                    <TrendingUp className="h-3 w-3 text-orange-500 mx-auto mb-1" />
                    <span className="text-xs">Trending</span>
                  </div>
                </Link>
                <Link href="/videos/by-country">
                  <div className="p-2 bg-white rounded text-center hover:bg-gray-50">
                    <MapPin className="h-3 w-3 text-green-500 mx-auto mb-1" />
                    <span className="text-xs">By Region</span>
                  </div>
                </Link>
              </div>
              
              <div className="text-xs text-gray-600 text-center">
                🎆 <span className="font-medium">12.3k</span> teaching videos from <span className="font-medium">89</span> countries
              </div>
            </div>
          </div>

          {/* Daily Clinical Pearl */}
          <div className="dashboard-tile bg-gradient-to-br from-blue-50 to-green-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-primary">Daily Clinical Pearl 💎</h2>
              <Brain className="h-4 w-4 text-blue-600" />
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-primary font-medium mb-2">
                "The absence of a leukocytosis does not rule out appendicitis. Up to 30% of patients with acute appendicitis have a normal WBC count."
              </p>
              <p className="text-xs text-gray-600">- Emergency Medicine</p>
            </div>
            <div className="flex justify-between items-center mt-3">
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Previous Pearls</button>
              <button className="text-xs text-green-600 hover:text-green-700 font-medium">Share Globally</button>
            </div>
          </div>

          {/* Quick Reference & International Resources */}
          <div className="dashboard-tile">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-primary">International Resources 🌍</h2>
              <FileText className="h-4 w-4 text-primary opacity-60" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Link href="/guidelines/who">
                <div className="p-2 bg-blue-50 rounded text-center hover:bg-blue-100 transition-colors">
                  <span className="text-xs font-medium text-blue-700">WHO</span>
                </div>
              </Link>
              <Link href="/guidelines/nice">
                <div className="p-2 bg-purple-50 rounded text-center hover:bg-purple-100 transition-colors">
                  <span className="text-xs font-medium text-purple-700">NICE</span>
                </div>
              </Link>
              <Link href="/guidelines/cdc">
                <div className="p-2 bg-green-50 rounded text-center hover:bg-green-100 transition-colors">
                  <span className="text-xs font-medium text-green-700">CDC</span>
                </div>
              </Link>
              <Link href="/exams/usmle">
                <div className="p-2 bg-red-50 rounded text-center hover:bg-red-100 transition-colors">
                  <span className="text-xs font-medium text-red-700">USMLE</span>
                </div>
              </Link>
              <Link href="/exams/plab">
                <div className="p-2 bg-yellow-50 rounded text-center hover:bg-yellow-100 transition-colors">
                  <span className="text-xs font-medium text-yellow-700">PLAB</span>
                </div>
              </Link>
              <Link href="/exams/amc">
                <div className="p-2 bg-pink-50 rounded text-center hover:bg-pink-100 transition-colors">
                  <span className="text-xs font-medium text-pink-700">AMC</span>
                </div>
              </Link>
            </div>
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <div className="text-xs text-gray-600 text-center">
                Resources from <span className="font-medium">120+</span> countries available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}