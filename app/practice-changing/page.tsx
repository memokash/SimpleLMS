'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import {
  createPracticeUpdate,
  getPracticeUpdates,
  endorsePracticeUpdate,
  updateTrendingTopics
} from '@/lib/firebaseCollections';
import type { PracticeUpdate as PracticeUpdateType } from '@/lib/firebaseCollections';
import {
  TrendingUp,
  FileText,
  Video,
  Mic,
  Link as LinkIcon,
  Upload,
  Star,
  Eye,
  MessageSquare,
  Share2,
  Filter,
  Search,
  Clock,
  Award,
  Users,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Brain,
  Zap,
  Globe,
  BarChart3,
  ArrowUp,
  Heart,
  ThumbsUp,
  Flag,
  Sparkles,
  Lightbulb,
  RefreshCw,
  Calendar,
  Target,
  Shield,
  ChevronRight
} from 'lucide-react';

// Using PracticeUpdateType from firebaseCollections
interface LocalPracticeUpdate extends PracticeUpdateType {
  type: 'article' | 'video' | 'audio' | 'link' | 'guideline' | 'case';
  institution?: string;
  timestamp?: string;
  views?: number;
  endorsements?: number;
  discussions?: number;
  verified?: boolean;
  thumbnail?: string;
}

const PracticeChangingDashboard = () => {
  const { user } = useAuth();
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedImpact, setSelectedImpact] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'article' | 'video' | 'audio' | 'link' | 'write'>('article');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    specialty: 'Internal Medicine',
    impact: 'moderate' as 'critical' | 'high' | 'moderate',
    summary: '',
    content: '',
    url: '',
    tags: '',
    verified: false
  });

  const specialties = [
    'All Specialties',
    'Cardiology',
    'Oncology',
    'Neurology',
    'Emergency Medicine',
    'Internal Medicine',
    'Surgery',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Infectious Disease',
    'Critical Care'
  ];

  const [latestUpdates, setLatestUpdates] = useState<LocalPracticeUpdate[]>([]);

  // Load data from Firebase
  useEffect(() => {
    fetchLatestUpdates();
  }, [selectedSpecialty, selectedImpact]);

  const fetchLatestUpdates = async () => {
    try {
      setIsLoading(true);
      const specialty = selectedSpecialty === 'All Specialties' ? undefined : selectedSpecialty;
      const updates = await getPracticeUpdates(specialty, 20);

      // Transform Firebase data to match local interface
      const transformedUpdates = updates.map(update => ({
        ...update,
        type: 'article' as const,
        institution: update.authorCredentials || 'Medical Institution',
        timestamp: update.createdAt ? new Date(update.createdAt.seconds * 1000).toLocaleDateString() : 'Today',
        views: update.engagement?.views || 0,
        endorsements: update.engagement?.endorsements || 0,
        discussions: update.engagement?.comments || 0,
        verified: update.reviewedBy && update.reviewedBy.length > 0
      }));

      // Filter by impact if selected
      const filteredUpdates = selectedImpact === 'all'
        ? transformedUpdates
        : transformedUpdates.filter(u => u.impactScore?.toString() === selectedImpact || u.impact === selectedImpact);

      setLatestUpdates(filteredUpdates);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [trendingTopics, setTrendingTopics] = useState<any[]>([
    { name: '#CRISPR-Therapy', count: '2.3K', trend: 'up' },
    { name: '#COVID-Variants', count: '1.8K', trend: 'up' },
    { name: '#AI-Diagnostics', count: '1.5K', trend: 'up' },
    { name: '#Immunotherapy', count: '1.2K', trend: 'down' },
    { name: '#Telemedicine', count: '892', trend: 'up' }
  ]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to share updates');
      return;
    }

    try {
      setIsLoading(true);

      const newUpdate: Omit<PracticeUpdateType, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title,
        content: formData.content || formData.url || '',
        summary: formData.summary,
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Anonymous',
        authorCredentials: 'MD',
        specialty: formData.specialty,
        impactScore: formData.impact === 'critical' ? 5 : formData.impact === 'high' ? 4 : 3,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        sourceUrl: formData.url,
        engagement: {
          views: 0,
          endorsements: 0,
          shares: 0,
          saves: 0,
          comments: 0
        },
        status: 'published',
        reviewedBy: formData.verified ? [user.uid] : []
      };

      await createPracticeUpdate(newUpdate);

      // Reset form and close modal
      setFormData({
        title: '',
        specialty: 'Internal Medicine',
        impact: 'moderate',
        summary: '',
        content: '',
        url: '',
        tags: '',
        verified: false
      });
      setShowUploadModal(false);

      // Refresh the list
      fetchLatestUpdates();

      // Trigger trending topics update
      updateTrendingTopics();

    } catch (error) {
      console.error('Error creating update:', error);
      alert('Failed to create update. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle endorsement
  const handleEndorse = async (updateId: string) => {
    if (!user) {
      alert('Please login to endorse updates');
      return;
    }

    try {
      await endorsePracticeUpdate(updateId, user.uid);
      // Refresh the list to show updated endorsement count
      fetchLatestUpdates();
    } catch (error) {
      console.error('Error endorsing update:', error);
    }
  };

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'article': return FileText;
      case 'video': return Video;
      case 'audio': return Mic;
      case 'link': return LinkIcon;
      case 'guideline': return Shield;
      case 'case': return Brain;
      default: return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header with Upload Action */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#07294d] mb-2">Practice-Changing Information Hub</h1>
              <p className="text-gray-600">The authoritative source for cutting-edge medical updates</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            >
              <Upload className="w-5 h-5" />
              Share Update
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
                <p className="text-xs text-gray-600">Updates Today</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">892</p>
                <p className="text-xs text-gray-600">Verified Updates</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">45.2K</p>
                <p className="text-xs text-gray-600">Active Contributors</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">23</p>
                <p className="text-xs text-gray-600">Critical Updates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for practice-changing updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
            
            <select
              value={selectedImpact}
              onChange={(e) => setSelectedImpact(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Impact Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="article">Articles</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="guideline">Guidelines</option>
              <option value="case">Cases</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Breaking Update Banner */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-semibold">BREAKING</span>
                    <span className="text-sm opacity-90">Just now</span>
                  </div>
                  <h3 className="font-semibold mb-1">FDA Approves First CRISPR Gene Therapy for Sickle Cell Disease</h3>
                  <p className="text-sm opacity-90">Revolutionary one-time treatment shows 95% reduction in vaso-occlusive crises. Click to learn more about implementation.</p>
                </div>
              </div>
            </div>

            {/* Update Cards */}
            {latestUpdates.map(update => {
              const TypeIcon = getTypeIcon(update.type);
              return (
                <div key={update.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {update.thumbnail ? (
                            <span className="text-lg">{update.thumbnail}</span>
                          ) : (
                            <TypeIcon className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getImpactColor(update.impact)}`}>
                              {update.impact.toUpperCase()}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {update.specialty}
                            </span>
                            {update.verified && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                            {update.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">{update.summary}</p>
                          
                          {/* Author Info */}
                          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                            <span className="font-medium">{update.author}</span>
                            <span>•</span>
                            <span>{update.institution}</span>
                            <span>•</span>
                            <span>{update.timestamp}</span>
                          </div>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {update.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{update.views.toLocaleString()}</span>
                        </button>
                        <button
                          onClick={() => handleEndorse(update.id!)}
                          className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{update.endorsements?.toLocaleString() || 0}</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">{update.discussions}</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                          <Heart className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Trending Topics */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Trending Topics
              </h3>
              <div className="space-y-2">
                {trendingTopics.map(topic => (
                  <div key={topic.name} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <span className="text-sm text-gray-700">{topic.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{topic.count}</span>
                      {topic.trend === 'up' && <ArrowUp className="w-3 h-3 text-green-500" />}
                      {topic.trend === 'down' && <ArrowUp className="w-3 h-3 text-red-500 rotate-180" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Upload */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">Share Your Knowledge</h3>
              <p className="text-sm text-gray-600 mb-3">Contribute to the medical community by sharing practice-changing information</p>
              <div className="space-y-2">
                <button 
                  onClick={() => { setUploadType('article'); setShowUploadModal(true); }}
                  className="w-full px-3 py-2 bg-white rounded-lg hover:shadow-sm transition-all flex items-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4 text-blue-500" />
                  Upload Article
                </button>
                <button 
                  onClick={() => { setUploadType('video'); setShowUploadModal(true); }}
                  className="w-full px-3 py-2 bg-white rounded-lg hover:shadow-sm transition-all flex items-center gap-2 text-sm"
                >
                  <Video className="w-4 h-4 text-purple-500" />
                  Share Video
                </button>
                <button 
                  onClick={() => { setUploadType('write'); setShowUploadModal(true); }}
                  className="w-full px-3 py-2 bg-white rounded-lg hover:shadow-sm transition-all flex items-center gap-2 text-sm"
                >
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Write Update
                </button>
              </div>
            </div>

            {/* Specialty Focus */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Your Specialties
              </h3>
              <div className="space-y-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Internal Medicine</p>
                  <p className="text-xs text-blue-700">23 new updates</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-900">Cardiology</p>
                  <p className="text-xs text-purple-700">15 new updates</p>
                </div>
              </div>
              <button className="mt-3 text-sm text-blue-600 hover:text-blue-700">
                Manage Specialties →
              </button>
            </div>

            {/* Impact Metrics */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                Your Impact
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Updates Shared</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Total Views</span>
                    <span className="font-medium">34.5K</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Endorsements</span>
                    <span className="font-medium">892</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Share Practice-Changing Information</h2>
                
                {/* Upload Type Selector */}
                <div className="grid grid-cols-5 gap-2 mb-6">
                  <button
                    onClick={() => setUploadType('article')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      uploadType === 'article' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <FileText className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <span className="text-xs">Article</span>
                  </button>
                  <button
                    onClick={() => setUploadType('video')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      uploadType === 'video' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    <Video className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                    <span className="text-xs">Video</span>
                  </button>
                  <button
                    onClick={() => setUploadType('audio')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      uploadType === 'audio' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <Mic className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <span className="text-xs">Audio</span>
                  </button>
                  <button
                    onClick={() => setUploadType('link')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      uploadType === 'link' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <LinkIcon className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                    <span className="text-xs">Link</span>
                  </button>
                  <button
                    onClick={() => setUploadType('write')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      uploadType === 'write' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
                    }`}
                  >
                    <Lightbulb className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                    <span className="text-xs">Write</span>
                  </button>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter a clear, descriptive title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.specialty}
                        onChange={(e) => setFormData({...formData, specialty: e.target.value})}>
                        {specialties.map(specialty => (
                          <option key={specialty}>{specialty}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Impact Level *</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.impact}
                        onChange={(e) => setFormData({...formData, impact: e.target.value as 'critical' | 'high' | 'moderate'})}>
                        <option value="critical">Critical - Immediate practice change</option>
                        <option value="high">High - Significant impact</option>
                        <option value="moderate">Moderate - Notable update</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Summary *</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Provide a concise summary of the key findings and their clinical implications"
                      value={formData.summary}
                      onChange={(e) => setFormData({...formData, summary: e.target.value})}
                      required
                    />
                  </div>

                  {uploadType === 'write' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={8}
                        placeholder="Write your full update here..."
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        required={uploadType === 'write'}
                      />
                    </div>
                  ) : uploadType === 'link' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
                        value={formData.url}
                        onChange={(e) => setFormData({...formData, url: e.target.value})}
                        required={uploadType === 'link'}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upload File *</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">Drag and drop or click to upload</p>
                        <p className="text-xs text-gray-500">
                          {uploadType === 'video' && 'MP4, MOV up to 500MB'}
                          {uploadType === 'audio' && 'MP3, WAV up to 100MB'}
                          {uploadType === 'article' && 'PDF, DOC, DOCX up to 50MB'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter tags separated by commas"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="verify"
                      className="rounded"
                      checked={formData.verified}
                      onChange={(e) => setFormData({...formData, verified: e.target.checked})}
                    />
                    <label htmlFor="verify" className="text-sm text-gray-600">
                      I verify this information is accurate and from a reliable source
                    </label>
                  </div>
                </form>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Share Update
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

export default PracticeChangingDashboard;