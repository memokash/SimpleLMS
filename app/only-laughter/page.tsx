'use client';

import React, { useState, useEffect } from 'react';
import {
  Laugh,
  ThumbsUp,
  ThumbsDown,
  Share2,
  MessageCircle,
  Plus,
  TrendingUp,
  Clock,
  Award,
  Star,
  Sparkles,
  Heart,
  Filter,
  RefreshCw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Smile,
  Coffee,
  AlertCircle,
  Zap
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';

interface MedMeme {
  id: string;
  type: 'meme' | 'video' | 'story' | 'oneliner' | 'comic';
  content: string;
  caption?: string;
  author: string;
  authorLevel: string;
  laughs: number;
  groans: number;
  shares: number;
  createdAt: Date;
  tags: string[];
  mediaUrl?: string;
}

const OnlyLaughter = () => {
  const [memes, setMemes] = useState<MedMeme[]>([]);
  const [currentMemeIndex, setCurrentMemeIndex] = useState(0);
  const [filter, setFilter] = useState<'hot' | 'new' | 'top'>('hot');
  const [category, setCategory] = useState<'all' | 'meme' | 'story' | 'oneliner' | 'video'>('all');
  const [showSubmit, setShowSubmit] = useState(false);
  const [laughCount, setLaughCount] = useState(0);
  const [stressLevel, setStressLevel] = useState(8); // Start stressed!
  const { user } = useAuth();

  // Sample medical humor content
  const sampleMemes: MedMeme[] = [
    {
      id: '1',
      type: 'oneliner',
      content: "Patient: 'Doctor, I broke my arm in two places!' Doctor: 'Well, stop going to those places.'",
      author: 'Dr. Dad Jokes',
      authorLevel: 'Attending - Comedy',
      laughs: 892,
      groans: 234,
      shares: 156,
      createdAt: new Date(),
      tags: ['DadJokes', 'Classic']
    },
    {
      id: '2',
      type: 'meme',
      content: "When the attending asks 'What would you do next?' and you realize you've been daydreaming about lunch for the past 10 minutes",
      mediaUrl: '/meme-panic.jpg',
      caption: "Internal screaming intensifies",
      author: 'SleepDeprivedResident',
      authorLevel: 'PGY-2',
      laughs: 1567,
      groans: 89,
      shares: 423,
      createdAt: new Date(),
      tags: ['Rounds', 'TooReal']
    },
    {
      id: '3',
      type: 'story',
      content: "Overheard in the OR:\nSurgeon: 'This reminds me of my honeymoon.'\nResident: '...How?'\nSurgeon: 'I had no idea what I was doing then either.'",
      author: 'OR_Chronicles',
      authorLevel: 'Surgery Resident',
      laughs: 2341,
      groans: 156,
      shares: 789,
      createdAt: new Date(),
      tags: ['Surgery', 'OR', 'Honesty']
    },
    {
      id: '4',
      type: 'oneliner',
      content: "Medical school: Where your best isn't good enough, but somehow you're still the smartest person at family dinners.",
      author: 'ExistentialMedStudent',
      authorLevel: 'MS3',
      laughs: 3456,
      groans: 67,
      shares: 1234,
      createdAt: new Date(),
      tags: ['MedSchool', 'Reality']
    },
    {
      id: '5',
      type: 'meme',
      content: "Stages of Medical Training:\n1. 'I want to save lives!'\n2. 'I want to pass this exam'\n3. 'I want to sleep'\n4. 'I want food that isn't from a vending machine'\n5. 'I want to remember what sunlight feels like'",
      author: 'BurntOutButSmiling',
      authorLevel: 'PGY-3',
      laughs: 4567,
      groans: 234,
      shares: 2341,
      createdAt: new Date(),
      tags: ['Evolution', 'TooAccurate']
    },
    {
      id: '6',
      type: 'story',
      content: "Patient came in saying they googled their symptoms.\n\nI braced for the worst.\n\n'I think I have a cold,' they said.\n\nThey were right.\n\nI nearly cried tears of joy.",
      author: 'Dr.Google',
      authorLevel: 'Family Medicine',
      laughs: 5678,
      groans: 123,
      shares: 3456,
      createdAt: new Date(),
      tags: ['DrGoogle', 'Miracle', 'PatientStories']
    },
    {
      id: '7',
      type: 'oneliner',
      content: "Radiology: Where you can be wrong in the dark with the best technology money can buy.",
      author: 'DarkRoomDweller',
      authorLevel: 'Radiology Resident',
      laughs: 2345,
      groans: 567,
      shares: 890,
      createdAt: new Date(),
      tags: ['Radiology', 'SelfRoast']
    },
    {
      id: '8',
      type: 'meme',
      content: "Nurse: 'Doctor, the patient's BP is 200/120!'\nMe, an intellectual who just finished a 30-hour shift: 'Have they tried not being stressed?'",
      author: 'DeliriousDoc',
      authorLevel: 'Internal Medicine',
      laughs: 3456,
      groans: 890,
      shares: 1234,
      createdAt: new Date(),
      tags: ['NightShift', 'Delirium']
    }
  ];

  const quickLaughs = [
    "Q: What do you call a med student who graduated last in their class? A: Doctor.",
    "My therapist told me to write letters to people I hate and burn them. I did, but now I don't know what to do with all these letters.",
    "Surgeon: 'Don't worry, this is a simple operation.' Patient: 'But doctor, this is my first operation!' Surgeon: 'Mine too!'",
    "Why did the doctor carry a red pen? In case they needed to draw blood.",
    "Patient: 'Doctor, I've broken my leg in three places!' Doctor: 'I'd stop going to those places if I were you.'",
    "The hardest part of medical school isn't the studying. It's pretending you're not dead inside during patient interactions."
  ];

  useEffect(() => {
    loadMemes();
    // Reduce stress with each laugh!
    const newStress = Math.max(0, stressLevel - (laughCount * 0.5));
    setStressLevel(newStress);
  }, [filter, category, laughCount]);

  const loadMemes = () => {
    let filtered = [...sampleMemes];
    
    if (category !== 'all') {
      filtered = filtered.filter(m => m.type === category);
    }
    
    if (filter === 'top') {
      filtered.sort((a, b) => b.laughs - a.laughs);
    } else if (filter === 'new') {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    
    setMemes(filtered);
  };

  const handleLaugh = (memeId: string) => {
    setMemes(prev => prev.map(m => 
      m.id === memeId ? { ...m, laughs: m.laughs + 1 } : m
    ));
    setLaughCount(prev => prev + 1);
  };

  const handleGroan = (memeId: string) => {
    setMemes(prev => prev.map(m => 
      m.id === memeId ? { ...m, groans: m.groans + 1 } : m
    ));
  };

  const nextMeme = () => {
    setCurrentMemeIndex((prev) => (prev + 1) % memes.length);
  };

  const prevMeme = () => {
    setCurrentMemeIndex((prev) => (prev - 1 + memes.length) % memes.length);
  };

  const getRandomQuickLaugh = () => {
    return quickLaughs[Math.floor(Math.random() * quickLaughs.length)];
  };

  const getStressEmoji = () => {
    if (stressLevel > 7) return '😰';
    if (stressLevel > 5) return '😟';
    if (stressLevel > 3) return '😐';
    if (stressLevel > 1) return '😊';
    return '😂';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header with Stress Meter */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Only Laughter 😂
              </h1>
              <p className="text-gray-600">If it\'s not funny, it doesn\'t belong here. Doctor\'s orders!</p>
            </div>
            
            {/* Stress Relief Meter */}
            <div className="text-center">
              <div className="text-6xl mb-2">{getStressEmoji()}</div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Stress Level</p>
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      stressLevel > 7 ? 'bg-red-500' : 
                      stressLevel > 5 ? 'bg-orange-500' : 
                      stressLevel > 3 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(stressLevel / 10) * 100}%` }}
                  />
                </div>
                <p className="text-xs mt-1 font-medium text-gray-700">
                  {laughCount} laughs = {(laughCount * 0.5).toFixed(1)} stress points reduced!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Laugh Button */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg p-6 mb-6 text-center">
          <h2 className="text-2xl font-bold mb-3">🚨 EMERGENCY LAUGH BUTTON 🚨</h2>
          <p className="mb-4">Studying got you down? Hit this for instant relief!</p>
          <button
            onClick={() => {
              const quickLaugh = getRandomQuickLaugh();
              alert(quickLaugh);
              setLaughCount(prev => prev + 1);
            }}
            className="px-8 py-4 bg-white text-orange-500 rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-lg"
          >
            <Zap className="inline w-6 h-6 mr-2" />
            INSTANT LAUGH
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('hot')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'hot' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔥 Hot
              </button>
              <button
                onClick={() => setFilter('new')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'new' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✨ Fresh
              </button>
              <button
                onClick={() => setFilter('top')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'top' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👑 Hall of Fame
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCategory('all')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  category === 'all' ? 'bg-green-500 text-white' : 'bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategory('meme')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  category === 'meme' ? 'bg-green-500 text-white' : 'bg-gray-100'
                }`}
              >
                Memes
              </button>
              <button
                onClick={() => setCategory('story')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  category === 'story' ? 'bg-green-500 text-white' : 'bg-gray-100'
                }`}
              >
                Stories
              </button>
              <button
                onClick={() => setCategory('oneliner')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  category === 'oneliner' ? 'bg-green-500 text-white' : 'bg-gray-100'
                }`}
              >
                One-Liners
              </button>
            </div>

            <button
              onClick={() => setShowSubmit(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="inline w-4 h-4 mr-1" />
              Submit Funny
            </button>
          </div>
        </div>

        {/* Main Content Area - Swipeable Memes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Meme Display */}
          <div className="lg:col-span-2">
            {memes.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={prevMeme}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  <div className="text-center flex-1">
                    <span className="text-sm text-gray-600">
                      {currentMemeIndex + 1} / {memes.length}
                    </span>
                  </div>
                  
                  <button
                    onClick={nextMeme}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                <div className="min-h-[300px] flex items-center justify-center">
                  <div className="text-center max-w-2xl">
                    {memes[currentMemeIndex].type === 'meme' && memes[currentMemeIndex].mediaUrl && (
                      <div className="mb-4">
                        {/* Image placeholder */}
                        <div className="bg-gray-200 rounded-lg p-8">
                          <p className="text-gray-600">[Hilarious medical meme image here]</p>
                        </div>
                      </div>
                    )}
                    
                    <p className={`${
                      memes[currentMemeIndex].type === 'oneliner' 
                        ? 'text-2xl font-bold' 
                        : 'text-lg'
                    } text-gray-800 mb-4 whitespace-pre-wrap`}>
                      {memes[currentMemeIndex].content}
                    </p>
                    
                    {memes[currentMemeIndex].caption && (
                      <p className="text-sm text-gray-600 italic mb-4">
                        {memes[currentMemeIndex].caption}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {memes[currentMemeIndex].tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      — {memes[currentMemeIndex].author} ({memes[currentMemeIndex].authorLevel})
                    </p>
                  </div>
                </div>

                {/* Reaction Buttons */}
                <div className="flex items-center justify-center gap-4 pt-6 border-t">
                  <button
                    onClick={() => handleLaugh(memes[currentMemeIndex].id)}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Laugh className="w-5 h-5" />
                    <span className="font-medium">{memes[currentMemeIndex].laughs} Laughs</span>
                  </button>
                  
                  <button
                    onClick={() => handleGroan(memes[currentMemeIndex].id)}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    😑
                    <span className="font-medium">{memes[currentMemeIndex].groans} Groans</span>
                  </button>
                  
                  <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="font-medium">Share</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Quick Laughs & Leaderboard */}
          <div className="space-y-6">
            {/* Laughter Leaderboard */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Today\'s Funniest
              </h3>
              <div className="space-y-3">
                {memes.slice(0, 5).map((meme, index) => (
                  <div key={meme.id} className="flex items-start gap-3">
                    <div className={`text-lg font-bold ${
                      index === 0 ? 'text-yellow-500' : 
                      index === 1 ? 'text-gray-400' : 
                      index === 2 ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 line-clamp-2">{meme.content.substring(0, 50)}...</p>
                      <p className="text-xs text-gray-500 mt-1">{meme.laughs} laughs</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Stats */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Laughter Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Laughs Today</span>
                  <span className="font-bold text-purple-600">{laughCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Stress Reduced</span>
                  <span className="font-bold text-green-600">{(laughCount * 10)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Mood</span>
                  <span className="text-2xl">{getStressEmoji()}</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded-lg">
                <p className="text-xs text-center text-gray-600">
                  "Laughter is the best medicine. Unless you have diarrhea."
                </p>
              </div>
            </div>

            {/* Quick Dose */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">💊 Quick Dose of Humor</h3>
              <p className="text-sm text-gray-700 italic mb-3">
                "Why don\'t doctors trust stairs? Because they\'re always up to something!"
              </p>
              <button
                onClick={() => {
                  alert(getRandomQuickLaugh());
                  setLaughCount(prev => prev + 1);
                }}
                className="w-full px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors font-medium"
              >
                Another One! 💉
              </button>
            </div>
          </div>
        </div>

        {/* Submit Modal */}
        {showSubmit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Something Funny!</h2>
              <p className="text-sm text-gray-600 mb-4">
                Remember: If it doesn\'t make people laugh, it doesn\'t belong here!
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Meme</option>
                  <option>Story</option>
                  <option>One-Liner</option>
                  <option>Comic</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">The Funny Part</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Make us laugh!"
                />
              </div>
              
              <div className="flex gap-3">
                <button className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium">
                  Submit for Laughs
                </button>
                <button
                  onClick={() => setShowSubmit(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlyLaughter;