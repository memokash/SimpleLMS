"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import {
  GraduationCap,
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  BookOpen,
  Stethoscope,
  Building,
  Shield,
  Settings,
  Download,
  Upload,
  Plus,
  Minus,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Target,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  UserX,
  Group,
  Layers,
  Link,
  Unlink,
  Crown,
  Key,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  institution: string;
  year: 'MS1' | 'MS2' | 'MS3' | 'MS4' | 'Intern' | 'Resident';
  specialty?: string;
  npiNumber?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  joinDate: Date;
  lastActive: Date;
  avatar?: string;
  
  // Academic Info
  gpa?: number;
  examScores: {
    step1?: number;
    step2?: number;
    comlex1?: number;
    comlex2?: number;
  };
  rotations: {
    id: string;
    name: string;
    service: string;
    startDate: Date;
    endDate: Date;
    grade?: string;
    completed: boolean;
  }[];
  
  // Performance Metrics
  metrics: {
    presentationsCompleted: number;
    notesSubmitted: number;
    averageGrade: number;
    attendanceRate: number;
    peerRating: number;
  };
  
  // Groups and Teams
  groups: string[];
  roundingTeams: string[];
  
  // Permissions
  permissions: {
    canCreateGroups: boolean;
    canManageUsers: boolean;
    canAccessAnalytics: boolean;
    canViewAllNotes: boolean;
  };
}

interface Group {
  id: string;
  name: string;
  description: string;
  type: 'class' | 'rotation' | 'study-group' | 'research' | 'custom';
  institution: string;
  createdBy: string;
  createdDate: Date;
  members: string[];
  admins: string[];
  isPrivate: boolean;
  maxMembers?: number;
  settings: {
    allowSelfJoin: boolean;
    requireApproval: boolean;
    allowMemberInvites: boolean;
  };
}

interface RoundingTeam {
  id: string;
  name: string;
  service: string;
  attendingPhysician: string;
  attendingNPI: string;
  residents: string[];
  students: string[];
  nurses: string[];
  pharmacists: string[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  schedule: {
    roundsTime: string;
    location: string;
    frequency: 'daily' | 'weekdays' | 'custom';
  };
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'resident' | 'attending' | 'nurse' | 'admin';
  npiNumber?: string;
  institution: string;
  verified: boolean;
  canManageUsers: boolean;
}

const StudentsManagementPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [roundingTeams, setRoundingTeams] = useState<RoundingTeam[]>([]);
  const [currentView, setCurrentView] = useState<'overview' | 'students' | 'groups' | 'teams' | 'analytics' | 'settings'>('overview');
  
  // User permissions
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [hasNPIAccess, setHasNPIAccess] = useState(false);
  
  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'year' | 'performance' | 'lastActive'>('name');
  
  // Modal States
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check user permissions
    const mockUserProfile: UserProfile = {
      id: user?.uid || '1',
      firstName: user?.displayName?.split(' ')[0] || 'John',
      lastName: user?.displayName?.split(' ')[1] || 'Doe',
      email: user?.email || 'user@example.com',
      role: 'attending', // This would come from user profile
      npiNumber: '1234567890', // This would be from user profile
      institution: 'University Hospital',
      verified: true,
      canManageUsers: true
    };
    
    setUserProfile(mockUserProfile);
    setHasNPIAccess(!!mockUserProfile.npiNumber && mockUserProfile.verified);

    // Mock data
    const mockStudents: Student[] = [
      {
        id: '1',
        firstName: 'Emily',
        lastName: 'Johnson',
        email: 'emily.johnson@med.university.edu',
        phone: '(555) 123-4567',
        institution: 'University Medical School',
        year: 'MS3',
        specialty: 'Internal Medicine',
        status: 'active',
        joinDate: new Date('2024-01-15'),
        lastActive: new Date('2024-08-06'),
        gpa: 3.8,
        examScores: {
          step1: 245,
          step2: 250
        },
        rotations: [
          {
            id: '1',
            name: 'Internal Medicine',
            service: 'General Medicine',
            startDate: new Date('2024-07-01'),
            endDate: new Date('2024-08-30'),
            grade: 'Honors',
            completed: false
          }
        ],
        metrics: {
          presentationsCompleted: 24,
          notesSubmitted: 18,
          averageGrade: 8.5,
          attendanceRate: 95,
          peerRating: 4.6
        },
        groups: ['1', '2'],
        roundingTeams: ['1'],
        permissions: {
          canCreateGroups: false,
          canManageUsers: false,
          canAccessAnalytics: false,
          canViewAllNotes: false
        }
      },
      {
        id: '2',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@med.university.edu',
        institution: 'University Medical School',
        year: 'MS4',
        specialty: 'Emergency Medicine',
        npiNumber: '9876543210',
        status: 'active',
        joinDate: new Date('2023-09-01'),
        lastActive: new Date('2024-08-05'),
        gpa: 3.9,
        examScores: {
          step1: 255,
          step2: 260
        },
        rotations: [
          {
            id: '2',
            name: 'Emergency Medicine',
            service: 'Emergency Department',
            startDate: new Date('2024-06-01'),
            endDate: new Date('2024-07-30'),
            grade: 'High Pass',
            completed: true
          }
        ],
        metrics: {
          presentationsCompleted: 42,
          notesSubmitted: 38,
          averageGrade: 9.1,
          attendanceRate: 98,
          peerRating: 4.8
        },
        groups: ['1', '3'],
        roundingTeams: ['2'],
        permissions: {
          canCreateGroups: true,
          canManageUsers: false,
          canAccessAnalytics: true,
          canViewAllNotes: false
        }
      },
      {
        id: '3',
        firstName: 'Sarah',
        lastName: 'Rodriguez',
        email: 'sarah.rodriguez@med.university.edu',
        institution: 'University Medical School',
        year: 'MS2',
        status: 'active',
        joinDate: new Date('2024-02-01'),
        lastActive: new Date('2024-08-04'),
        gpa: 3.7,
        examScores: {},
        rotations: [],
        metrics: {
          presentationsCompleted: 8,
          notesSubmitted: 12,
          averageGrade: 7.8,
          attendanceRate: 92,
          peerRating: 4.2
        },
        groups: ['2'],
        roundingTeams: [],
        permissions: {
          canCreateGroups: false,
          canManageUsers: false,
          canAccessAnalytics: false,
          canViewAllNotes: false
        }
      }
    ];

    const mockGroups: Group[] = [
      {
        id: '1',
        name: 'Internal Medicine Clerkship - Summer 2024',
        description: 'Third-year medical students rotating through internal medicine',
        type: 'rotation',
        institution: 'University Medical School',
        createdBy: mockUserProfile.id,
        createdDate: new Date('2024-06-01'),
        members: ['1', '2'],
        admins: [mockUserProfile.id],
        isPrivate: false,
        maxMembers: 15,
        settings: {
          allowSelfJoin: false,
          requireApproval: true,
          allowMemberInvites: false
        }
      },
      {
        id: '2',
        name: 'USMLE Step 1 Study Group',
        description: 'Collaborative study group for USMLE Step 1 preparation',
        type: 'study-group',
        institution: 'University Medical School',
        createdBy: '1',
        createdDate: new Date('2024-01-15'),
        members: ['1', '3'],
        admins: ['1'],
        isPrivate: false,
        settings: {
          allowSelfJoin: true,
          requireApproval: false,
          allowMemberInvites: true
        }
      }
    ];

    const mockRoundingTeams: RoundingTeam[] = [
      {
        id: '1',
        name: 'Medicine Team A',
        service: 'Internal Medicine',
        attendingPhysician: 'Dr. Sarah Johnson',
        attendingNPI: '1234567890',
        residents: ['res1'],
        students: ['1'],
        nurses: ['nurse1'],
        pharmacists: ['pharm1'],
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-08-30'),
        isActive: true,
        schedule: {
          roundsTime: '7:00 AM',
          location: 'Medicine Ward',
          frequency: 'weekdays'
        }
      }
    ];

    setStudents(mockStudents);
    setGroups(mockGroups);
    setRoundingTeams(mockRoundingTeams);
    setLoading(false);
  }, [user]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInstitution = selectedInstitution === 'all' || student.institution === selectedInstitution;
    const matchesYear = selectedYear === 'all' || student.year === selectedYear;
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    
    return matchesSearch && matchesInstitution && matchesYear && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getYearColor = (year: string) => {
    switch (year) {
      case 'MS1': return 'bg-blue-100 text-blue-800';
      case 'MS2': return 'bg-green-100 text-green-800';
      case 'MS3': return 'bg-yellow-100 text-yellow-800';
      case 'MS4': return 'bg-purple-100 text-purple-800';
      case 'Intern': return 'bg-orange-100 text-orange-800';
      case 'Resident': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading students management...</p>
        </div>
      </div>
    );
  }

  // Permission Check
  if (!hasNPIAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
            <p className="text-gray-600 mb-6">
              Students management requires a verified NPI number. Please complete your profile with a valid NPI number to access this feature.
            </p>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-2">Required:</h3>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Valid NPI (National Provider Identifier) number</li>
                  <li>• Verified medical professional status</li>
                  <li>• Institution affiliation</li>
                </ul>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors font-semibold">
                Complete Profile Setup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GraduationCap className="h-12 w-12" />
              <div>
                <h1 className="text-4xl font-bold mb-2">Students Management</h1>
                <p className="text-blue-100 text-xl">Manage students, groups, and rounding teams</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-blue-100 text-sm">Total Students</p>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-2xl font-bold text-green-300">
                  {students.filter(s => s.status === 'active').length}
                </div>
                <p className="text-blue-100 text-sm">Active</p>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-2xl font-bold text-yellow-300">
                  {groups.length}
                </div>
                <p className="text-blue-100 text-sm">Groups</p>
              </div>
              <button
                onClick={() => setShowAddStudent(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors font-semibold"
              >
                <UserPlus className="h-5 w-5" />
                Add Student
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 mb-8 bg-white rounded-xl p-1 shadow-lg">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'groups', label: 'Groups', icon: Group },
            { id: 'teams', label: 'Rounding Teams', icon: Stethoscope },
            { id: 'analytics', label: 'Analytics', icon: PieChart },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                currentView === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Dashboard */}
        {currentView === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                    <p className="text-green-600 text-sm mt-1">↑ 12% from last month</p>
                  </div>
                  <Users className="h-12 w-12 text-blue-600 opacity-80" />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Groups</p>
                    <p className="text-3xl font-bold text-gray-900">{groups.length}</p>
                    <p className="text-blue-600 text-sm mt-1">↑ 3 new this week</p>
                  </div>
                  <Group className="h-12 w-12 text-green-600 opacity-80" />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Rounding Teams</p>
                    <p className="text-3xl font-bold text-gray-900">{roundingTeams.filter(t => t.isActive).length}</p>
                    <p className="text-purple-600 text-sm mt-1">Currently active</p>
                  </div>
                  <Stethoscope className="h-12 w-12 text-purple-600 opacity-80" />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Avg Performance</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {(students.reduce((acc, s) => acc + s.metrics.averageGrade, 0) / students.length).toFixed(1)}
                    </p>
                    <p className="text-green-600 text-sm mt-1">↑ 0.3 this semester</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-orange-600 opacity-80" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Student Activity</h3>
                <div className="space-y-4">
                  {students.slice(0, 5).map(student => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-gray-600">{student.year} • Last active {student.lastActive.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{student.metrics.averageGrade}</p>
                        <p className="text-xs text-gray-600">Avg Grade</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Distribution</h3>
                <div className="space-y-4">
                  {['Excellent (9-10)', 'Good (8-8.9)', 'Satisfactory (7-7.9)', 'Needs Improvement (<7)'].map((range, index) => {
                    const count = students.filter(s => {
                      if (index === 0) { return s.metrics.averageGrade >= 9; }
                      if (index === 1) { return s.metrics.averageGrade >= 8 && s.metrics.averageGrade < 9; }
                      if (index === 2) { return s.metrics.averageGrade >= 7 && s.metrics.averageGrade < 8; }
                      return s.metrics.averageGrade < 7;
                    }).length;
                    const percentage = (count / students.length) * 100;
                    
                    return (
                      <div key={range}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{range}</span>
                          <span className="text-sm text-gray-600">{count} students</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              index === 0 ? 'bg-green-500' :
                              index === 1 ? 'bg-blue-500' :
                              index === 2 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students List */}
        {currentView === 'students' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  >
                    <option value="all">All Years</option>
                    <option value="MS1">MS1</option>
                    <option value="MS2">MS2</option>
                    <option value="MS3">MS3</option>
                    <option value="MS4">MS4</option>
                    <option value="Intern">Intern</option>
                    <option value="Resident">Resident</option>
                  </select>
                  
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="year">Sort by Year</option>
                    <option value="performance">Sort by Performance</option>
                    <option value="lastActive">Sort by Last Active</option>
                  </select>

                  <button
                    onClick={() => setShowAddStudent(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Student
                  </button>
                </div>
              </div>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStudents.map(student => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
                >
                  <div className="p-6">
                    {/* Student Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{student.firstName} {student.lastName}</h3>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getYearColor(student.year)}`}>
                          {student.year}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                      </div>
                    </div>

                    {/* Institution and Specialty */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">{student.institution}</p>
                      {student.specialty && (
                        <p className="text-sm text-purple-600 font-medium">{student.specialty}</p>
                      )}
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-700">Avg Grade</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{student.metrics.averageGrade}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-700">Attendance</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{student.metrics.attendanceRate}%</p>
                      </div>
                    </div>

                    {/* Exam Scores */}
                    {(student.examScores.step1 || student.examScores.step2) && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">USMLE Scores</p>
                        <div className="flex gap-2">
                          {student.examScores.step1 && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              Step 1: {student.examScores.step1}
                            </span>
                          )}
                          {student.examScores.step2 && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              Step 2: {student.examScores.step2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* NPI Badge */}
                    {student.npiNumber && (
                      <div className="mb-4">
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                          <Shield className="h-3 w-3" />
                          NPI Verified
                        </span>
                      </div>
                    )}

                    {/* Groups and Teams */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-500">
                        <div className="flex items-center gap-1">
                          <Group className="h-4 w-4" />
                          <span>{student.groups.length} groups</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Stethoscope className="h-4 w-4" />
                          <span>{student.roundingTeams.length} teams</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Last active: {student.lastActive.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No students found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || selectedYear !== 'all' || selectedStatus !== 'all' 
                      ? 'Try adjusting your search criteria or filters'
                      : 'Add your first student to get started'
                    }
                  </p>
                  {!searchTerm && selectedYear === 'all' && selectedStatus === 'all' && (
                    <button
                      onClick={() => setShowAddStudent(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Add First Student
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Groups Management */}
        {currentView === 'groups' && (
          <div className="space-y-6">
            {/* Groups Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Groups Management</h2>
                <p className="text-gray-600">Create and manage student groups and classes</p>
              </div>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold"
              >
                <Plus className="h-4 w-4" />
                Create Group
              </button>
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {groups.map(group => (
                <div key={group.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{group.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          group.type === 'rotation' ? 'bg-purple-100 text-purple-800' :
                          group.type === 'study-group' ? 'bg-green-100 text-green-800' :
                          group.type === 'class' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {group.type.replace('-', ' ')}
                        </span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Members:</span>
                        <span className="font-medium">{group.members.length}{group.maxMembers ? `/${group.maxMembers}` : ''}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">{group.createdDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Privacy:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          group.isPrivate ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {group.isPrivate ? 'Private' : 'Public'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {group.members.slice(0, 3).map((memberId, index) => {
                            const member = students.find(s => s.id === memberId);
                            return member ? (
                              <div key={member.id} className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                                {member.firstName[0]}{member.lastName[0]}
                              </div>
                            ) : null;
                          })}
                          {group.members.length > 3 && (
                            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                              +{group.members.length - 3}
                            </div>
                          )}
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rounding Teams */}
        {currentView === 'teams' && (
          <div className="space-y-6">
            {/* Teams Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Rounding Teams</h2>
                <p className="text-gray-600">Manage clinical rounding teams and schedules</p>
              </div>
              <button
                onClick={() => setShowCreateTeam(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 font-semibold"
              >
                <Plus className="h-4 w-4" />
                Create Team
              </button>
            </div>

            {/* Teams List */}
            <div className="space-y-4">
              {roundingTeams.map(team => (
                <div key={team.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{team.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Service: {team.service}</span>
                        <span>Attending: {team.attendingPhysician}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          team.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {team.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Students ({team.students.length})</h4>
                      <div className="space-y-2">
                        {team.students.map(studentId => {
                          const student = students.find(s => s.id === studentId);
                          return student ? (
                            <div key={student.id} className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {student.firstName[0]}
                              </div>
                              <span className="text-sm">{student.firstName} {student.lastName}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Residents ({team.residents.length})</h4>
                      <div className="space-y-2">
                        {team.residents.map(residentId => (
                          <div key={residentId} className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              R
                            </div>
                            <span className="text-sm">Resident {residentId}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Schedule</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Time: {team.schedule.roundsTime}</p>
                        <p>Location: {team.schedule.location}</p>
                        <p>Frequency: {team.schedule.frequency}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Duration</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Start: {team.startDate.toLocaleDateString()}</p>
                        {team.endDate && <p>End: {team.endDate.toLocaleDateString()}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        NPI: {team.attendingNPI}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                          Edit Team
                        </button>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                          Start Rounds
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics would go here */}
        {currentView === 'analytics' && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <PieChart className="h-16 w-16 text-purple-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
            <p className="text-gray-600 mb-6">
              Comprehensive analytics and reporting for student performance, group engagement, and team effectiveness.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Coming Soon:</h3>
              <ul className="text-left text-blue-800 space-y-2">
                <li>• Student performance analytics</li>
                <li>• Group engagement metrics</li>
                <li>• Attendance tracking</li>
                <li>• Grade distribution analysis</li>
                <li>• Comparative reporting</li>
              </ul>
            </div>
          </div>
        )}

        {/* Settings would go here */}
        {currentView === 'settings' && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Settings className="h-16 w-16 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Management Settings</h2>
            <p className="text-gray-600 mb-6">
              Configure permissions, institution settings, and integration preferences.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Available Settings:</h3>
              <ul className="text-left text-gray-700 space-y-2">
                <li>• User role permissions</li>
                <li>• Institution configuration</li>
                <li>• Group creation policies</li>
                <li>• Data export options</li>
                <li>• Integration settings</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Modals would be added here for creating students, groups, teams, etc. */}
    </div>
  );
};

export default StudentsManagementPage;