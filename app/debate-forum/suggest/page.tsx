'use client';

import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Send,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Clock,
  Users,
  Star,
  AlertCircle,
  CheckCircle,
  Filter,
  Search,
  Award,
  Flame,
  Target,
  Shield,
  BookOpen,
  Brain,
  Heart,
  Gavel,
  ChevronUp,
  ChevronDown,
  Video,
  Timer,
  Bell,
  Share2,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../../components/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';
import Link from 'next/link';

interface TopicSuggestion {
  id: string;
  topic: string;
  description: string;
  category: string;
  suggestedBy: {
    id: string;
    name: string;
    level: string;
  };
  upvotes: number;
  comments: number;
  status: 'pending' | 'approved' | 'active' | 'completed';
  createdAt: any;
  tags: string[];
  participants?: {
    for?: {
      id: string;
      name: string;
      level: string;
      videoSubmitted: boolean;
      videoUrl?: string;
      submittedAt?: any;
    };
    against?: {
      id: string;
      name: string;
      level: string;
      videoSubmitted: boolean;
      videoUrl?: string;
      submittedAt?: any;
    };
  };
  deadline?: any;
  goLiveAt?: any;
}

const SuggestDebateTopic = () => {
  const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([]);
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'active'>('popular');
  const [newSuggestion, setNewSuggestion] = useState({
    topic: '',
    description: '',
    category: 'clinical',
    tags: [] as string[]
  });
  const { user } = useAuth();

  // Sample suggestions for demonstration
  const sampleSuggestions: TopicSuggestion[] = [
    {
      id: '1',
      topic: 'Should AI be allowed to make independent diagnostic decisions?',
      description: 'With AI achieving higher accuracy rates than physicians in certain diagnostics, should we allow AI systems to make autonomous diagnostic decisions without human oversight?',
      category: 'technology',
      suggestedBy: {
        id: '1',
        name: 'Dr. Sarah Chen',
        level: 'PGY-3 Radiology'
      },
      upvotes: 234,
      comments: 45,
      status: 'active',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tags: ['AI', 'Diagnostics', 'Ethics'],
      participants: {
        for: {
          id: '2',
          name: 'Dr. Marcus Lee',
          level: 'Attending - Tech Medicine',
          videoSubmitted: true,
          videoUrl: 'sample-video-url',
          submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
        },
        against: {
          id: '3',
          name: 'Dr. Emily Rodriguez',
          level: 'Fellow - Radiology',
          videoSubmitted: false
        }
      },
      deadline: new Date(Date.now() + 66 * 60 * 60 * 1000), // 66 hours remaining
      goLiveAt: new Date(Date.now() + 72 * 60 * 60 * 1000)
    },
    {
      id: '2',
      topic: 'Is the traditional medical school curriculum obsolete?',
      description: 'With rapid advances in medicine and technology, should we completely restructure medical education to focus more on AI, telemedicine, and personalized medicine?',
      category: 'education',
      suggestedBy: {
        id: '4',
        name: 'Dr. James Park',
        level: 'MS4'
      },
      upvotes: 189,
      comments: 67,
      status: 'approved',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ['Medical Education', 'Curriculum', 'Innovation'],
      participants: {
        for: {
          id: '5',
          name: 'Dr. Lisa Thompson',
          level: 'Dean of Education',
          videoSubmitted: false
        }
      }
    },
    {
      id: '3',
      topic: 'Should physicians be required to disclose their mental health treatment?',
      description: 'Many licensing boards ask about mental health treatment, potentially discouraging physicians from seeking help. Should this practice be abolished?',
      category: 'ethics',
      suggestedBy: {
        id: '6',
        name: 'Anonymous',
        level: 'Resident'
      },
      upvotes: 567,
      comments: 123,
      status: 'pending',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      tags: ['Mental Health', 'Ethics', 'Physician Wellness']
    }
  ];

  const categories = [
    { id: 'all', label: 'All Topics', icon: TrendingUp, color: 'bg-gray-500' },
    { id: 'clinical', label: 'Clinical Practice', icon: Heart, color: 'bg-red-500' },
    { id: 'ethics', label: 'Medical Ethics', icon: Shield, color: 'bg-purple-500' },
    { id: 'policy', label: 'Healthcare Policy', icon: Gavel, color: 'bg-green-500' },
    { id: 'technology', label: 'Medical Technology', icon: Target, color: 'bg-blue-500' },
    { id: 'education', label: 'Medical Education', icon: BookOpen, color: 'bg-yellow-500' },
    { id: 'research', label: 'Research', icon: Brain, color: 'bg-pink-500' }
  ];

  useEffect(() => {
    loadSuggestions();
  }, [selectedCategory, sortBy]);

  const loadSuggestions = async () => {
    // In production, load from Firebase
    let filtered = sampleSuggestions;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    if (sortBy === 'popular') {
      filtered.sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortBy === 'recent') {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === 'active') {
      filtered = filtered.filter(s => s.status === 'active');
    }
    
    setSuggestions(filtered);
  };

  const submitSuggestion = async () => {
    if (!user || !newSuggestion.topic || !newSuggestion.description) return;

    try {
      await addDoc(collection(db, 'debate_suggestions'), {
        ...newSuggestion,
        suggestedBy: {
          id: user.uid,
          name: user.email?.split('@')[0] || 'Anonymous',
          level: 'Medical Professional'
        },
        upvotes: 0,
        comments: 0,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setShowSuggestForm(false);
      setNewSuggestion({
        topic: '',
        description: '',
        category: 'clinical',
        tags: []
      });
      loadSuggestions();
    } catch (error) {
      console.error('Error submitting suggestion:', error);
    }
  };

  const upvoteSuggestion = async (suggestionId: string) => {
    try {
      const suggestionRef = doc(db, 'debate_suggestions', suggestionId);
      await updateDoc(suggestionRef, {
        upvotes: increment(1)
      });
      loadSuggestions();
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const joinDebate = async (suggestionId: string, side: 'for' | 'against') => {
    if (!user) return;
    // Logic to join debate
  };

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#07294d] mb-2">Debate Topic Suggestions 💡</h1>
              <p className="text-gray-600">Propose and vote on medical debate topics. Top suggestions become live video debates!</p>
            </div>
            <button
              onClick={() => setShowSuggestForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium flex items-center gap-2 shadow-lg"
            >
              <Lightbulb className="w-5 h-5" />
              Suggest Topic
            </button>
          </div>
        </div>

        {/* How It Works Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">📹 How Video Debates Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold">1</span>
              </div>
              <p className="text-sm">Suggest & vote on topics</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold">2</span>
              </div>
              <p className="text-sm">Two debaters sign up (FOR/AGAINST)</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold">3</span>
              </div>
              <p className="text-sm">Submit 2-min videos within 72 hours</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold">4</span>
              </div>
              <p className="text-sm">Debate goes live for voting!</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2 flex-1">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      selectedCategory === cat.id
                        ? `${cat.color} text-white`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm hidden md:inline">{cat.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('popular')}
                className={`px-4 py-2 rounded-lg text-sm ${
                  sortBy === 'popular' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                🔥 Popular
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg text-sm ${
                  sortBy === 'recent' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                ✨ Recent
              </button>
              <button
                onClick={() => setSortBy('active')}
                className={`px-4 py-2 rounded-lg text-sm ${
                  sortBy === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                ⚡ Active
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="space-y-4">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(suggestion.status)}`}>
                        {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                      </span>
                      <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {categories.find(c => c.id === suggestion.category)?.label}
                      </span>
                      {suggestion.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {suggestion.topic}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Suggested by {suggestion.suggestedBy.name}</span>
                      <span>•</span>
                      <span>{suggestion.suggestedBy.level}</span>
                    </div>
                  </div>
                </div>

                {/* Active Debate Section */}
                {suggestion.status === 'active' && suggestion.participants && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Video className="w-5 h-5 text-purple-600" />
                        Video Debate in Progress
                      </h4>
                      {suggestion.deadline && (
                        <div className="flex items-center gap-2 text-sm">
                          <Timer className="w-4 h-4 text-orange-500" />
                          <span className="font-medium text-orange-600">
                            {getTimeRemaining(suggestion.deadline)} remaining
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* FOR Side */}
                      <div className={`p-3 bg-white rounded-lg border-2 ${
                        suggestion.participants.for?.videoSubmitted ? 'border-green-300' : 'border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-xs font-semibold text-green-600 mb-1">FOR</p>
                            {suggestion.participants.for ? (
                              <>
                                <p className="text-sm font-medium text-gray-900">{suggestion.participants.for.name}</p>
                                <p className="text-xs text-gray-600">{suggestion.participants.for.level}</p>
                              </>
                            ) : (
                              <button className="mt-1 px-3 py-1.5 bg-green-500 text-white rounded text-xs hover:bg-green-600">
                                Sign Up (FOR)
                              </button>
                            )}
                          </div>
                          {suggestion.participants.for?.videoSubmitted && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        {suggestion.participants.for && !suggestion.participants.for.videoSubmitted && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
                            <Clock className="w-3 h-3" />
                            Awaiting video submission
                          </div>
                        )}
                      </div>
                      
                      {/* AGAINST Side */}
                      <div className={`p-3 bg-white rounded-lg border-2 ${
                        suggestion.participants.against?.videoSubmitted ? 'border-green-300' : 'border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-xs font-semibold text-red-600 mb-1">AGAINST</p>
                            {suggestion.participants.against ? (
                              <>
                                <p className="text-sm font-medium text-gray-900">{suggestion.participants.against.name}</p>
                                <p className="text-xs text-gray-600">{suggestion.participants.against.level}</p>
                              </>
                            ) : (
                              <button className="mt-1 px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600">
                                Sign Up (AGAINST)
                              </button>
                            )}
                          </div>
                          {suggestion.participants.against?.videoSubmitted && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        {suggestion.participants.against && !suggestion.participants.against.videoSubmitted && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
                            <Clock className="w-3 h-3" />
                            Awaiting video submission
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Go Live Countdown */}
                    {suggestion.participants?.for?.videoSubmitted && suggestion.participants?.against?.videoSubmitted && suggestion.goLiveAt && (
                      <div className="mt-3 p-2 bg-green-100 rounded text-center">
                        <p className="text-sm font-medium text-green-800">
                          🎬 Debate goes live in {getTimeRemaining(suggestion.goLiveAt)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Approved - Ready for Participants */}
                {suggestion.status === 'approved' && (
                  <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-1">Ready for Debate!</h4>
                        <p className="text-sm text-yellow-700">
                          {suggestion.participants?.for ? '1 participant signed up' : 'Waiting for participants to sign up'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!suggestion.participants?.for && (
                          <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
                            Sign Up (FOR)
                          </button>
                        )}
                        {!suggestion.participants?.against && (
                          <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                            Sign Up (AGAINST)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => upvoteSuggestion(suggestion.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                      <span className="font-medium text-sm">{suggestion.upvotes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{suggestion.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {suggestion.status === 'active' && (
                    <Link href={`/debate-forum/${suggestion.id}`}>
                      <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View Debate →
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Suggest Topic Modal */}
        {showSuggestForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Suggest a Debate Topic</h2>
                
                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newSuggestion.category}
                    onChange={(e) => setNewSuggestion(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Topic */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Debate Topic</label>
                  <input
                    type="text"
                    value={newSuggestion.topic}
                    onChange={(e) => setNewSuggestion(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Frame as a clear yes/no or for/against question"
                  />
                  <p className="text-xs text-gray-500 mt-1">Example: "Should medical AI replace radiologists?"</p>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Context & Description</label>
                  <textarea
                    value={newSuggestion.description}
                    onChange={(e) => setNewSuggestion(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Provide context and why this debate is important for the medical community"
                  />
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    onChange={(e) => setNewSuggestion(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., AI, Ethics, Patient Care"
                  />
                </div>

                {/* Info Box */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📹 Video Debate Format:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Each debater submits a 2-minute video argument</li>
                    <li>• 72-hour submission window after both sign up</li>
                    <li>• Videos released simultaneously for fair viewing</li>
                    <li>• Community votes determine the winner</li>
                    <li>• Top debates featured in weekly newsletter</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={submitSuggestion}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Submit Suggestion
                  </button>
                  <button
                    onClick={() => setShowSuggestForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
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

export default SuggestDebateTopic;