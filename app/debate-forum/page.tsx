'use client';

import React, { useState, useEffect } from 'react';
import {
  Swords,
  Trophy,
  Clock,
  Users,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Video,
  FileText,
  Lock,
  Unlock,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  Flame,
  Target,
  BookOpen,
  Gavel,
  Eye,
  EyeOff,
  Upload,
  Timer,
  BarChart3,
  Shield,
  Crown
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, updateDoc, doc } from 'firebase/firestore';

interface Debate {
  id: string;
  topic: string;
  category: string;
  proposer: {
    id: string;
    name: string;
    level: string; // Medical Student, Resident, Fellow, Attending
    institution: string;
    argumentSubmitted: boolean;
    argument?: string;
    videoUrl?: string;
    votes: number;
  };
  opponent?: {
    id: string;
    name: string;
    level: string;
    institution: string;
    argumentSubmitted: boolean;
    argument?: string;
    videoUrl?: string;
    votes: number;
  };
  status: 'open' | 'in-progress' | 'voting' | 'rebuttal' | 'completed';
  phase: 'challenge' | 'arguments' | 'voting-round1' | 'rebuttals' | 'voting-final' | 'completed';
  winner?: 'proposer' | 'opponent' | 'draw';
  totalVotes: number;
  views: number;
  createdAt: any;
  argumentDeadline?: any;
  rebuttalDeadline?: any;
  rules: string[];
  prize?: string;
}

const MedicalDebateForum = () => {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [selectedTab, setSelectedTab] = useState<'active' | 'open' | 'completed'>('active');
  const [showCreateDebate, setShowCreateDebate] = useState(false);
  const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null);
  const [newDebate, setNewDebate] = useState({
    topic: '',
    category: 'clinical',
    rules: ['48 hour submission window', 'Evidence-based arguments only', 'Respectful discourse'],
    prize: ''
  });
  const { user } = useAuth();

  // Sample debates for demonstration
  const sampleDebates: Debate[] = [
    {
      id: '1',
      topic: 'AI will replace radiologists within 10 years',
      category: 'technology',
      proposer: {
        id: '1',
        name: 'Dr. Sarah Chen',
        level: 'PGY-3 Radiology',
        institution: 'Johns Hopkins',
        argumentSubmitted: true,
        argument: 'AI pattern recognition already exceeds human accuracy...',
        votes: 234
      },
      opponent: {
        id: '2',
        name: 'Dr. Marcus Williams',
        level: 'Attending Radiologist',
        institution: 'Mayo Clinic',
        argumentSubmitted: true,
        argument: 'The nuanced clinical correlation required...',
        votes: 189
      },
      status: 'voting',
      phase: 'voting-round1',
      totalVotes: 423,
      views: 2341,
      createdAt: new Date(),
      argumentDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
      rules: ['48 hour submission', 'Evidence required', 'Max 1000 words'],
      prize: '🏆 Featured in Newsletter'
    },
    {
      id: '2',
      topic: 'Universal healthcare is economically sustainable in the US',
      category: 'policy',
      proposer: {
        id: '3',
        name: 'Dr. Emily Rodriguez',
        level: 'MS4',
        institution: 'Harvard Medical School',
        argumentSubmitted: false,
        votes: 0
      },
      status: 'open',
      phase: 'challenge',
      totalVotes: 0,
      views: 156,
      createdAt: new Date(),
      rules: ['72 hour submission', 'Cite sources', 'Video optional'],
      prize: '📚 Medical textbook bundle'
    },
    {
      id: '3',
      topic: 'Ketamine should be first-line for treatment-resistant depression',
      category: 'psychiatry',
      proposer: {
        id: '4',
        name: 'Dr. James Park',
        level: 'PGY-4 Psychiatry',
        institution: 'UCSF',
        argumentSubmitted: true,
        argument: 'Recent studies demonstrate rapid onset...',
        votes: 567
      },
      opponent: {
        id: '5',
        name: 'Dr. Lisa Thompson',
        level: 'Fellow',
        institution: 'Columbia',
        argumentSubmitted: true,
        argument: 'Long-term safety data remains concerning...',
        votes: 612
      },
      status: 'completed',
      phase: 'completed',
      winner: 'opponent',
      totalVotes: 1179,
      views: 5623,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      rules: ['48 hour submission', 'Evidence required', 'Max 1000 words']
    }
  ];

  const categories = [
    { id: 'clinical', label: 'Clinical Practice', icon: Swords, color: 'bg-blue-500' },
    { id: 'ethics', label: 'Medical Ethics', icon: Shield, color: 'bg-purple-500' },
    { id: 'policy', label: 'Healthcare Policy', icon: Gavel, color: 'bg-green-500' },
    { id: 'technology', label: 'Medical Technology', icon: Target, color: 'bg-orange-500' },
    { id: 'education', label: 'Medical Education', icon: BookOpen, color: 'bg-yellow-500' },
    { id: 'psychiatry', label: 'Psychiatry', icon: Brain, color: 'bg-pink-500' },
    { id: 'surgery', label: 'Surgery', icon: Target, color: 'bg-red-500' },
    { id: 'research', label: 'Research Methods', icon: Flask, color: 'bg-indigo-500' }
  ];

  useEffect(() => {
    loadDebates();
  }, [selectedTab]);

  const loadDebates = async () => {
    // In production, load from Firebase
    setDebates(sampleDebates);
  };

  const createDebate = async () => {
    if (!user || !newDebate.topic) return;

    try {
      await addDoc(collection(db, 'debates'), {
        ...newDebate,
        proposer: {
          id: user.uid,
          name: user.email?.split('@')[0] || 'Anonymous',
          level: 'Medical Student', // Would come from user profile
          institution: 'Medical School',
          argumentSubmitted: false,
          votes: 0
        },
        status: 'open',
        phase: 'challenge',
        totalVotes: 0,
        views: 0,
        createdAt: serverTimestamp(),
        argumentDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000)
      });

      setShowCreateDebate(false);
      setNewDebate({
        topic: '',
        category: 'clinical',
        rules: ['48 hour submission window', 'Evidence-based arguments only', 'Respectful discourse'],
        prize: ''
      });
      loadDebates();
    } catch (error) {
      console.error('Error creating debate:', error);
    }
  };

  const acceptChallenge = async (debateId: string) => {
    if (!user) return;
    // Logic to accept challenge and become opponent
  };

  const submitArgument = async (debateId: string, content: string, videoUrl?: string) => {
    // Logic to submit argument
  };

  const voteForDebater = async (debateId: string, side: 'proposer' | 'opponent') => {
    // Logic to vote
  };

  const getPhaseColor = (phase: string) => {
    switch(phase) {
      case 'challenge': return 'bg-yellow-100 text-yellow-700';
      case 'arguments': return 'bg-blue-100 text-blue-700';
      case 'voting-round1': return 'bg-purple-100 text-purple-700';
      case 'rebuttals': return 'bg-orange-100 text-orange-700';
      case 'voting-final': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch(phase) {
      case 'challenge': return '🎯 Open Challenge';
      case 'arguments': return '⚔️ Arguments Phase';
      case 'voting-round1': return '🗳️ Round 1 Voting';
      case 'rebuttals': return '💬 Rebuttal Phase';
      case 'voting-final': return '🏁 Final Voting';
      case 'completed': return '✅ Completed';
      default: return phase;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#07294d] mb-2">Medical Debate Arena ⚔️</h1>
              <p className="text-gray-600">Engage in evidence-based medical debates with peers worldwide</p>
            </div>
            <button
              onClick={() => setShowCreateDebate(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
            >
              <Swords className="w-5 h-5" />
              Propose Debate
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Swords className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">47</p>
              <p className="text-sm text-gray-600">Active Debates</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12.3k</p>
              <p className="text-sm text-gray-600">Participants</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">892</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">23</p>
              <p className="text-sm text-gray-600">Hot Topics</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('active')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === 'active' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ⚔️ Active Debates
            </button>
            <button
              onClick={() => setSelectedTab('open')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === 'open' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🎯 Open Challenges
            </button>
            <button
              onClick={() => setSelectedTab('completed')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === 'completed' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🏆 Hall of Fame
            </button>
          </div>
        </div>

        {/* Debates List */}
        <div className="space-y-4">
          {debates.map(debate => (
            <div key={debate.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Debate Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${getPhaseColor(debate.phase)}`}>
                        {getPhaseLabel(debate.phase)}
                      </span>
                      <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {categories.find(c => c.id === debate.category)?.label}
                      </span>
                      {debate.prize && (
                        <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                          {debate.prize}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {debate.topic}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {debate.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {debate.totalVotes} votes
                      </span>
                      {debate.argumentDeadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          48h remaining
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Debaters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Proposer */}
                  <div className={`p-4 rounded-lg border-2 ${
                    debate.winner === 'proposer' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">FOR</p>
                        <p className="text-sm font-medium text-gray-700">{debate.proposer.name}</p>
                        <p className="text-xs text-gray-600">{debate.proposer.level} • {debate.proposer.institution}</p>
                      </div>
                      {debate.winner === 'proposer' && (
                        <Trophy className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    
                    {debate.phase !== 'challenge' && (
                      <div className="mt-3">
                        {debate.proposer.argumentSubmitted ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-600">Argument submitted</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs text-yellow-600">Awaiting submission</span>
                          </div>
                        )}
                        
                        {(debate.phase === 'voting-round1' || debate.phase === 'voting-final' || debate.phase === 'completed') && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{debate.proposer.votes} votes</span>
                              <span className="text-gray-600">
                                {Math.round((debate.proposer.votes / debate.totalVotes) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(debate.proposer.votes / debate.totalVotes) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Opponent */}
                  <div className={`p-4 rounded-lg border-2 ${
                    debate.winner === 'opponent' ? 'border-green-500 bg-green-50' : 
                    debate.opponent ? 'border-gray-200' : 'border-dashed border-gray-300'
                  }`}>
                    {debate.opponent ? (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">AGAINST</p>
                            <p className="text-sm font-medium text-gray-700">{debate.opponent.name}</p>
                            <p className="text-xs text-gray-600">{debate.opponent.level} • {debate.opponent.institution}</p>
                          </div>
                          {debate.winner === 'opponent' && (
                            <Trophy className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                        
                        {debate.phase !== 'challenge' && (
                          <div className="mt-3">
                            {debate.opponent.argumentSubmitted ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-xs text-green-600">Argument submitted</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-yellow-500" />
                                <span className="text-xs text-yellow-600">Awaiting submission</span>
                              </div>
                            )}
                            
                            {(debate.phase === 'voting-round1' || debate.phase === 'voting-final' || debate.phase === 'completed') && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">{debate.opponent.votes} votes</span>
                                  <span className="text-gray-600">
                                    {Math.round((debate.opponent.votes / debate.totalVotes) * 100)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-red-500 h-2 rounded-full"
                                    style={{ width: `${(debate.opponent.votes / debate.totalVotes) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600 mb-2">Challenge Open!</p>
                        <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors">
                          Accept Challenge
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    {debate.phase === 'voting-round1' || debate.phase === 'voting-final' ? (
                      <>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                          Vote FOR
                        </button>
                        <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors">
                          Vote AGAINST
                        </button>
                      </>
                    ) : (
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                        View Debate
                      </button>
                    )}
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      Comments
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {debate.phase === 'arguments' && debate.proposer.argumentSubmitted && debate.opponent?.argumentSubmitted && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Unlock className="w-4 h-4" />
                        Arguments revealed!
                      </span>
                    )}
                    {debate.phase === 'arguments' && (!debate.proposer.argumentSubmitted || !debate.opponent?.argumentSubmitted) && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Lock className="w-4 h-4" />
                        Locked until both submit
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Debate Modal */}
        {showCreateDebate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Propose a Medical Debate</h2>
                
                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newDebate.category}
                    onChange={(e) => setNewDebate(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Topic */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Debate Topic</label>
                  <textarea
                    value={newDebate.topic}
                    onChange={(e) => setNewDebate(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="e.g., 'Telemedicine is as effective as in-person consultations for primary care'"
                  />
                </div>

                {/* Rules */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Debate Rules</label>
                  <div className="space-y-2">
                    {newDebate.rules.map((rule, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prize (Optional) */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prize/Incentive (Optional)</label>
                  <input
                    type="text"
                    value={newDebate.prize}
                    onChange={(e) => setNewDebate(prev => ({ ...prev, prize: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 'Featured in weekly newsletter' or 'Medical textbook'"
                  />
                </div>

                {/* Info Box */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. You propose a debate topic and take the FOR position</li>
                    <li>2. Someone accepts your challenge and takes the AGAINST position</li>
                    <li>3. Both submit arguments (locked until both submit)</li>
                    <li>4. Community votes on Round 1</li>
                    <li>5. Both submit rebuttals after seeing opponent's argument</li>
                    <li>6. Final voting determines the winner</li>
                  </ol>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={createDebate}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Propose Debate
                  </button>
                  <button
                    onClick={() => setShowCreateDebate(false)}
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

export default MedicalDebateForum;