"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { 
  Users, 
  Plus, 
  Search, 
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  MessageCircle,
  Settings,
  UserPlus,
  Crown,
  Star,
  Filter,
  ChevronRight,
  Video,
  FileText,
  Award
} from 'lucide-react';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  meetingTime?: string;
  location?: string;
  nextMeeting?: Date;
  createdBy: string;
  tags: string[];
  avgRating: number;
  isOwner?: boolean;
  isMember?: boolean;
}

const StudyGroupsPage = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'my-groups' | 'create'>('discover');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockGroups: StudyGroup[] = [
      {
        id: '1',
        name: 'Cardiology Study Circle',
        description: 'Weekly study sessions focusing on cardiovascular medicine, ECG interpretation, and clinical cases',
        subject: 'Cardiology',
        memberCount: 12,
        maxMembers: 15,
        isPrivate: false,
        meetingTime: 'Wednesdays 7:00 PM',
        location: 'Library Room 204',
        nextMeeting: new Date('2025-08-13'),
        createdBy: 'Dr. Sarah Johnson',
        tags: ['ECG', 'Heart Disease', 'Clinical Cases'],
        avgRating: 4.8,
        isMember: true,
        isOwner: false
      },
      {
        id: '2',
        name: 'USMLE Step 1 Prep',
        description: 'Intensive preparation group for USMLE Step 1 with practice questions and review sessions',
        subject: 'USMLE',
        memberCount: 25,
        maxMembers: 30,
        isPrivate: false,
        meetingTime: 'Daily 6:00 AM',
        location: 'Virtual (Zoom)',
        nextMeeting: new Date('2025-08-07'),
        createdBy: 'Michael Chen',
        tags: ['USMLE', 'Step 1', 'Practice Questions'],
        avgRating: 4.9,
        isMember: false,
        isOwner: false
      },
      {
        id: '3',
        name: 'Anatomy & Physiology Masters',
        description: 'Deep dive into human anatomy and physiology with cadaver lab sessions',
        subject: 'Anatomy',
        memberCount: 8,
        maxMembers: 12,
        isPrivate: true,
        meetingTime: 'Tuesdays 3:00 PM',
        location: 'Anatomy Lab',
        nextMeeting: new Date('2025-08-12'),
        createdBy: 'Emma Wilson',
        tags: ['Anatomy', 'Physiology', 'Cadaver Lab'],
        avgRating: 4.7,
        isMember: true,
        isOwner: true
      }
    ];

    setStudyGroups(mockGroups);
    setMyGroups(mockGroups.filter(g => g.isMember));
    setLoading(false);
  }, []);

  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || group.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = ['All', 'Cardiology', 'USMLE', 'Anatomy', 'Surgery', 'Pediatrics', 'Internal Medicine'];

  const handleJoinGroup = (groupId: string) => {
    // TODO: Implement join group functionality
    console.log('Joining group:', groupId);
    alert('Join request sent!');
  };

  const handleCreateGroup = () => {
    // TODO: Implement create group functionality
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading study groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Users className="h-16 w-16" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Study Groups</h1>
            <p className="text-purple-100 text-xl">Connect with peers, share knowledge, and excel together</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex space-x-1">
            {[
              { id: 'discover', name: 'Discover Groups', icon: Search },
              { id: 'my-groups', name: 'My Groups', icon: Users },
              { id: 'create', name: 'Create Group', icon: Plus }
            ].map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Discover Groups Tab */}
        {activeTab === 'discover' && (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search study groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  />
                </div>
                <div className="flex gap-4">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  >
                    {subjects.map(subject => (
                      <option key={subject} value={subject === 'All' ? '' : subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  <button className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors">
                    <Filter className="h-5 w-5" />
                    Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Study Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                            {group.subject}
                          </span>
                          {group.isPrivate && (
                            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                              Private
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{group.avgRating}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{group.description}</p>

                    <div className="space-y-2 mb-4">
                      {group.meetingTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Clock className="h-4 w-4" />
                          {group.meetingTime}
                        </div>
                      )}
                      {group.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="h-4 w-4" />
                          {group.location}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {group.memberCount}/{group.maxMembers} members
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {group.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">by {group.createdBy}</span>
                      {group.isMember ? (
                        <button className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                          Member
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* My Groups Tab */}
        {activeTab === 'my-groups' && (
          <div className="space-y-6">
            {myGroups.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Study Groups Yet</h3>
                <p className="text-gray-600 mb-6">Join your first study group to start collaborating with peers!</p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Discover Groups
                </button>
              </div>
            ) : (
              myGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                        {group.isOwner && (
                          <Crown className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{group.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {group.memberCount} members
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Next: {group.nextMeeting?.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {group.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Join Meeting
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Chat
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Group Tab */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create a New Study Group</h2>
              <p className="text-gray-600">Start your own study community and help others learn</p>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g., Cardiology Study Circle"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Subject/Topic</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Select a subject</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="anatomy">Anatomy & Physiology</option>
                  <option value="surgery">Surgery</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="usmle">USMLE Prep</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <textarea
                  placeholder="Describe what your study group will focus on, meeting structure, and goals..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Meeting Schedule</label>
                  <input
                    type="text"
                    placeholder="e.g., Wednesdays 7:00 PM"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Library Room 204 or Virtual"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Max Members</label>
                  <input
                    type="number"
                    placeholder="15"
                    min="2"
                    max="50"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Privacy</label>
                  <select className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-200 bg-white text-gray-900'
                  }`}>
                    <option value="public">Public - Anyone can join</option>
                    <option value="private">Private - Invite only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., ECG, Clinical Cases, USMLE"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Create Study Group
                </button>
                <button
                  type="button"
                  className={`px-6 py-3 border rounded-xl transition-all duration-200 ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyGroupsPage;