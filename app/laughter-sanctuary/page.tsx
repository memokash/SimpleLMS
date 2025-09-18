'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  Volume2,
  Heart,
  Laugh,
  Star,
  Clock,
  Calendar,
  ChevronRight,
  Lock,
  Unlock,
  Sparkles,
  Coffee,
  Wine,
  Music,
  Radio,
  Headphones,
  Camera,
  Play,
  Pause,
  StopCircle,
  Upload,
  Award,
  Trophy,
  Smile,
  MessageCircle,
  Bell,
  BellOff,
  Moon,
  Sun,
  Zap,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';

interface ComedySession {
  id: string;
  title: string;
  type: 'open-mic' | 'standup' | 'story-time' | 'roast' | 'improv';
  host: string;
  performers: string[];
  audience: number;
  status: 'upcoming' | 'live' | 'ended';
  scheduledFor: Date;
  laughMeter: number;
  recordings: boolean;
}

interface PerformanceSlot {
  id: string;
  performer: string;
  duration: number; // minutes
  type: string;
  rating?: number;
}

const LaughterSanctuary = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<'lounge' | 'stage' | 'backstage'>('lounge');
  const [laughMeter, setLaughMeter] = useState(0);
  const [audienceCount, setAudienceCount] = useState(127);
  const [isPerforming, setIsPerforming] = useState(false);
  const [timeOnStage, setTimeOnStage] = useState(0);
  const [sanctuaryMode, setSanctuaryMode] = useState<'light' | 'dark'>('dark');
  const [anonymousMode, setAnonymousMode] = useState(false);
  const { user } = useAuth();

  // Live comedy sessions
  const [sessions] = useState<ComedySession[]>([
    {
      id: '1',
      title: 'Midnight Medical Madness',
      type: 'open-mic',
      host: 'Dr. Chuckles',
      performers: ['SleepyResident', 'CaffeinatedMS4', 'NurseRatchet'],
      audience: 234,
      status: 'live',
      scheduledFor: new Date(),
      laughMeter: 89,
      recordings: false
    },
    {
      id: '2',
      title: 'Rounds Roast Session',
      type: 'roast',
      host: 'AttendingAnonymous',
      performers: [],
      audience: 0,
      status: 'upcoming',
      scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000),
      laughMeter: 0,
      recordings: false
    },
    {
      id: '3',
      title: 'ER Story Time',
      type: 'story-time',
      host: 'TraumaQueen',
      performers: ['EmergencyLaughs', 'NightShiftNinja'],
      audience: 456,
      status: 'live',
      scheduledFor: new Date(),
      laughMeter: 92,
      recordings: true
    }
  ]);

  const [queue] = useState<PerformanceSlot[]>([
    { id: '1', performer: 'AnxiousMS1', duration: 5, type: 'First Timer' },
    { id: '2', performer: 'BurntOutResident', duration: 7, type: 'Dark Humor' },
    { id: '3', performer: 'HappyAttending', duration: 10, type: 'Dad Jokes' }
  ]);

  useEffect(() => {
    // Simulate audience reactions
    const interval = setInterval(() => {
      if (currentRoom === 'stage' && isPerforming) {
        setLaughMeter(prev => Math.min(100, prev + Math.random() * 10));
        setTimeOnStage(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRoom, isPerforming]);

  const startPerformance = () => {
    setIsPerforming(true);
    setIsMicOn(true);
    setTimeOnStage(0);
    setLaughMeter(0);
  };

  const endPerformance = () => {
    setIsPerforming(false);
    setIsMicOn(false);
    setIsVideoOn(false);
    // Show performance stats
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen ${
      sanctuaryMode === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-black' 
        : 'bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100'
    }`}>
      {/* Header - The Sanctuary Sign */}
      <div className="border-b border-purple-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`text-3xl font-bold ${
                  sanctuaryMode === 'dark' ? 'text-purple-300' : 'text-purple-700'
                }`}>
                  🎭 The Laughter Sanctuary
                </div>
                {currentRoom === 'stage' && (
                  <div className="absolute -top-2 -right-2">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </div>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                sanctuaryMode === 'dark' 
                  ? 'bg-purple-800/50 text-purple-200' 
                  : 'bg-purple-200 text-purple-800'
              }`}>
                {audienceCount} in sanctuary
              </div>
            </div>

            {/* Sanctuary Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAnonymousMode(!anonymousMode)}
                className={`p-2 rounded-lg transition-colors ${
                  anonymousMode 
                    ? 'bg-purple-600 text-white' 
                    : sanctuaryMode === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                }`}
                title="Anonymous Mode"
              >
                {anonymousMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setSanctuaryMode(sanctuaryMode === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-lg transition-colors ${
                  sanctuaryMode === 'dark' 
                    ? 'bg-gray-800 text-yellow-400' 
                    : 'bg-white text-gray-700'
                }`}
              >
                {sanctuaryMode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className={`px-4 py-2 rounded-lg ${
                sanctuaryMode === 'dark' 
                  ? 'bg-green-900/50 text-green-300' 
                  : 'bg-green-100 text-green-800'
              }`}>
                <Lock className="inline w-4 h-4 mr-1" />
                Safe Space
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Navigation */}
      <div className="border-b border-purple-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentRoom('lounge')}
              className={`px-6 py-3 font-medium transition-all ${
                currentRoom === 'lounge'
                  ? sanctuaryMode === 'dark' 
                    ? 'bg-purple-800 text-purple-100 border-b-2 border-purple-400' 
                    : 'bg-purple-200 text-purple-900 border-b-2 border-purple-600'
                  : sanctuaryMode === 'dark' ? 'text-gray-400 hover:text-purple-300' : 'text-gray-600 hover:text-purple-700'
              }`}
            >
              <Coffee className="inline w-4 h-4 mr-2" />
              The Lounge
            </button>
            
            <button
              onClick={() => setCurrentRoom('stage')}
              className={`px-6 py-3 font-medium transition-all ${
                currentRoom === 'stage'
                  ? sanctuaryMode === 'dark' 
                    ? 'bg-purple-800 text-purple-100 border-b-2 border-purple-400' 
                    : 'bg-purple-200 text-purple-900 border-b-2 border-purple-600'
                  : sanctuaryMode === 'dark' ? 'text-gray-400 hover:text-purple-300' : 'text-gray-600 hover:text-purple-700'
              }`}
            >
              <Mic className="inline w-4 h-4 mr-2" />
              Main Stage
              {sessions.some(s => s.status === 'live') && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                  LIVE
                </span>
              )}
            </button>
            
            <button
              onClick={() => setCurrentRoom('backstage')}
              className={`px-6 py-3 font-medium transition-all ${
                currentRoom === 'backstage'
                  ? sanctuaryMode === 'dark' 
                    ? 'bg-purple-800 text-purple-100 border-b-2 border-purple-400' 
                    : 'bg-purple-200 text-purple-900 border-b-2 border-purple-600'
                  : sanctuaryMode === 'dark' ? 'text-gray-400 hover:text-purple-300' : 'text-gray-600 hover:text-purple-700'
              }`}
            >
              <Users className="inline w-4 h-4 mr-2" />
              Backstage
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* The Lounge */}
        {currentRoom === 'lounge' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome Message */}
            <div className={`lg:col-span-2 rounded-lg p-6 ${
              sanctuaryMode === 'dark' 
                ? 'bg-gray-900/50 backdrop-blur-sm' 
                : 'bg-white/80 backdrop-blur-sm'
            }`}>
              <h2 className={`text-2xl font-bold mb-4 ${
                sanctuaryMode === 'dark' ? 'text-purple-300' : 'text-purple-700'
              }`}>
                Welcome to The Sanctuary
              </h2>
              <p className={`mb-4 ${sanctuaryMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                A safe space for medical professionals to laugh, perform, and forget about differentials for a while.
              </p>
              
              <div className={`p-4 rounded-lg mb-4 ${
                sanctuaryMode === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  sanctuaryMode === 'dark' ? 'text-purple-200' : 'text-purple-800'
                }`}>
                  🤫 Sanctuary Rules:
                </h3>
                <ul className={`space-y-2 text-sm ${
                  sanctuaryMode === 'dark' ? 'text-purple-300' : 'text-purple-700'
                }`}>
                  <li>• What happens in the sanctuary, stays in the sanctuary</li>
                  <li>• No recording without permission (we\'ll know)</li>
                  <li>• Anonymous mode available for the shy ones</li>
                  <li>• Laugh therapy is mandatory, not optional</li>
                  <li>• Bad jokes are encouraged, good jokes are suspicious</li>
                </ul>
              </div>

              {/* Quick Record */}
              <div className={`p-4 rounded-lg ${
                sanctuaryMode === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
              }`}>
                <h3 className={`font-semibold mb-3 ${
                  sanctuaryMode === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  🎙️ Record Your Set (Private)
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <StopCircle className="inline w-4 h-4 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="inline w-4 h-4 mr-2" />
                        Start Recording
                      </>
                    )}
                  </button>
                  
                  {isRecording && (
                    <span className={`text-sm ${
                      sanctuaryMode === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      Recording... {formatTime(timeOnStage)}
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-2 ${
                  sanctuaryMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Practice your material in private. Recordings are only saved if you choose.
                </p>
              </div>
            </div>

            {/* Tonight's Schedule */}
            <div className={`rounded-lg p-6 ${
              sanctuaryMode === 'dark' 
                ? 'bg-gray-900/50 backdrop-blur-sm' 
                : 'bg-white/80 backdrop-blur-sm'
            }`}>
              <h3 className={`font-semibold mb-4 ${
                sanctuaryMode === 'dark' ? 'text-purple-300' : 'text-purple-700'
              }`}>
                Tonight\'s Shows
              </h3>
              <div className="space-y-3">
                {sessions.map(session => (
                  <div key={session.id} className={`p-3 rounded-lg ${
                    sanctuaryMode === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className={`font-medium ${
                          sanctuaryMode === 'dark' ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {session.title}
                        </p>
                        <p className={`text-xs ${
                          sanctuaryMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Host: {session.host}
                        </p>
                      </div>
                      {session.status === 'live' && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>
                    
                    {session.status === 'live' && (
                      <div className="flex items-center gap-2 text-xs">
                        <Users className="w-3 h-3" />
                        <span className={sanctuaryMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {session.audience} watching
                        </span>
                        <span className={sanctuaryMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}>•</span>
                        <Laugh className="w-3 h-3" />
                        <span className={sanctuaryMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {session.laughMeter}% laugh meter
                        </span>
                      </div>
                    )}
                    
                    {session.status === 'upcoming' && (
                      <p className={`text-xs ${
                        sanctuaryMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Starts in 2 hours
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Stage */}
        {currentRoom === 'stage' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stage Area */}
            <div className={`lg:col-span-2 rounded-lg p-6 ${
              sanctuaryMode === 'dark' 
                ? 'bg-gray-900/50 backdrop-blur-sm' 
                : 'bg-white/80 backdrop-blur-sm'
            }`}>
              <div className="aspect-video bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg mb-4 flex items-center justify-center relative">
                {isPerforming ? (
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎤</div>
                    <p className="text-white text-xl mb-2">You\'re ON!</p>
                    <p className="text-white/80">{formatTime(timeOnStage)}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎭</div>
                    <p className="text-white/60">Stage is waiting...</p>
                  </div>
                )}
                
                {/* Laugh Meter */}
                {isPerforming && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white text-sm mb-1">
                      <span>Laugh Meter</span>
                      <span>{Math.round(laughMeter)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-green-400 h-3 rounded-full transition-all"
                        style={{ width: `${laughMeter}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Performance Controls */}
              <div className="flex items-center justify-center gap-4">
                {!isPerforming ? (
                  <button
                    onClick={startPerformance}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    <Mic className="inline w-5 h-5 mr-2" />
                    Take the Stage!
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsMicOn(!isMicOn)}
                      className={`p-3 rounded-lg transition-colors ${
                        isMicOn ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}
                    >
                      {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>
                    
                    <button
                      onClick={() => setIsVideoOn(!isVideoOn)}
                      className={`p-3 rounded-lg transition-colors ${
                        isVideoOn ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}
                    >
                      {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </button>
                    
                    <button
                      onClick={endPerformance}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
                    >
                      End Performance
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Audience & Queue */}
            <div className="space-y-6">
              {/* Audience Reactions */}
              <div className={`rounded-lg p-6 ${
                sanctuaryMode === 'dark' 
                  ? 'bg-gray-900/50 backdrop-blur-sm' 
                  : 'bg-white/80 backdrop-blur-sm'
              }`}>
                <h3 className={`font-semibold mb-4 ${
                  sanctuaryMode === 'dark' ? 'text-purple-300' : 'text-purple-700'
                }`}>
                  Live Reactions
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button className="p-3 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg text-white text-2xl hover:scale-110 transition-transform">
                    😂
                  </button>
                  <button className="p-3 bg-gradient-to-br from-pink-400 to-red-400 rounded-lg text-white text-2xl hover:scale-110 transition-transform">
                    ❤️
                  </button>
                  <button className="p-3 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg text-white text-2xl hover:scale-110 transition-transform">
                    👏
                  </button>
                  <button className="p-3 bg-gradient-to-br from-green-400 to-teal-400 rounded-lg text-white text-2xl hover:scale-110 transition-transform">
                    🔥
                  </button>
                  <button className="p-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg text-white text-2xl hover:scale-110 transition-transform">
                    💀
                  </button>
                  <button className="p-3 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg text-white text-2xl hover:scale-110 transition-transform">
                    😬
                  </button>
                </div>
              </div>

              {/* Performance Queue */}
              <div className={`rounded-lg p-6 ${
                sanctuaryMode === 'dark' 
                  ? 'bg-gray-900/50 backdrop-blur-sm' 
                  : 'bg-white/80 backdrop-blur-sm'
              }`}>
                <h3 className={`font-semibold mb-4 ${
                  sanctuaryMode === 'dark' ? 'text-purple-300' : 'text-purple-700'
                }`}>
                  Up Next
                </h3>
                <div className="space-y-2">
                  {queue.map((slot, index) => (
                    <div key={slot.id} className={`p-2 rounded ${
                      sanctuaryMode === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            sanctuaryMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {index + 1}. {anonymousMode ? 'Anonymous' : slot.performer}
                          </span>
                        </div>
                        <span className={`text-xs ${
                          sanctuaryMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {slot.duration} min
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${
                        sanctuaryMode === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {slot.type}
                      </p>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-3 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium">
                  Join Queue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Backstage */}
        {currentRoom === 'backstage' && (
          <div className={`rounded-lg p-6 ${
            sanctuaryMode === 'dark' 
              ? 'bg-gray-900/50 backdrop-blur-sm' 
              : 'bg-white/80 backdrop-blur-sm'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              sanctuaryMode === 'dark' ? 'text-purple-300' : 'text-purple-700'
            }`}>
              Backstage - Performers Only
            </h2>
            <p className={`mb-6 ${sanctuaryMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Warm up, practice, or just hang out with fellow comedians before going on stage.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Practice Room */}
              <div className={`p-4 rounded-lg ${
                sanctuaryMode === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
              }`}>
                <h3 className={`font-semibold mb-3 ${
                  sanctuaryMode === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Practice Room
                </h3>
                <p className={`text-sm mb-3 ${
                  sanctuaryMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Test your material with other performers
                </p>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Enter Practice Room
                </button>
              </div>
              
              {/* Green Room Chat */}
              <div className={`p-4 rounded-lg ${
                sanctuaryMode === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
              }`}>
                <h3 className={`font-semibold mb-3 ${
                  sanctuaryMode === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Green Room Chat
                </h3>
                <p className={`text-sm mb-3 ${
                  sanctuaryMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Chat with other performers waiting to go on
                </p>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  Join Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaughterSanctuary;