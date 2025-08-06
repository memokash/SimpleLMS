"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  MessageCircle,
  Search,
  Filter,
  Plus,
  Pin,
  Lock,
  Unlock,
  Star,
  Heart,
  MessageSquare,
  Eye,
  Clock,
  User,
  Users,
  Tag,
  TrendingUp,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Share2,
  Bookmark,
  Reply,
  Quote,
  ThumbsUp,
  ThumbsDown,
  Award,
  Shield,
  Crown,
  Zap,
  Calendar,
  Archive,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Send,
  Paperclip,
  Image,
  Video,
  Mic,
  Smile,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Globe,
  Lock as LockIcon,
  UserCheck,
  Stethoscope,
  BookOpen,
  GraduationCap,
  Brain,
  Activity,
  Target,
  Lightbulb,
  HelpCircle,
  FileText,
  Camera,
  Headphones,
  PlayCircle
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
  isLocked: boolean;
  moderators: string[];
  subcategories?: Category[];
}

interface Thread {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    reputation: number;
    isVerified: boolean;
  };
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isLocked: boolean;
  isResolved: boolean;
  views: number;
  likes: number;
  replies: number;
  lastReply?: {
    author: string;
    timestamp: Date;
  };
  attachments: {
    id: string;
    name: string;
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    size: string;
  }[];
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
    multipleChoice: boolean;
    endsAt?: Date;
  };
}

interface Reply {
  id: string;
  threadId: string;
  content: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    reputation: number;
    isVerified: boolean;
  };
  createdAt: Date;
  editedAt?: Date;
  parentReplyId?: string;
  likes: number;
  dislikes: number;
  isAcceptedAnswer: boolean;
  isModerator: boolean;
  attachments: {
    id: string;
    name: string;
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    size: string;
  }[];
  mentions: string[];
  quotes?: {
    replyId: string;
    content: string;
    author: string;
  };
}

interface UserNotification {
  id: string;
  type: 'mention' | 'reply' | 'like' | 'award' | 'thread-update';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  url?: string;
}

const DiscussionForumsPage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  
  // Current View States
  const [currentView, setCurrentView] = useState<'categories' | 'category' | 'thread' | 'create-thread' | 'search'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  
  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending' | 'oldest'>('latest');
  const [filterBy, setFilterBy] = useState<'all' | 'unanswered' | 'resolved' | 'pinned'>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadTags, setNewThreadTags] = useState<string[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [quotedReply, setQuotedReply] = useState<Reply | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    const mockCategories: Category[] = [
      {
        id: '1',
        name: 'General Discussion',
        description: 'General medical education discussions and announcements',
        icon: '💬',
        color: 'bg-blue-100 text-blue-800',
        postCount: 1247,
        isLocked: false,
        moderators: ['mod1', 'mod2']
      },
      {
        id: '2',
        name: 'Clinical Cases',
        description: 'Share and discuss interesting clinical cases',
        icon: '🏥',
        color: 'bg-green-100 text-green-800',
        postCount: 856,
        isLocked: false,
        moderators: ['mod1'],
        subcategories: [
          {
            id: '2a',
            name: 'Internal Medicine Cases',
            description: 'Internal medicine case discussions',
            icon: '🫀',
            color: 'bg-red-100 text-red-800',
            postCount: 324,
            isLocked: false,
            moderators: ['mod1']
          },
          {
            id: '2b',
            name: 'Emergency Medicine Cases',
            description: 'Emergency department case discussions',
            icon: '🚨',
            color: 'bg-orange-100 text-orange-800',
            postCount: 198,
            isLocked: false,
            moderators: ['mod2']
          }
        ]
      },
      {
        id: '3',
        name: 'Study Groups',
        description: 'Form study groups and share study materials',
        icon: '📚',
        color: 'bg-purple-100 text-purple-800',
        postCount: 432,
        isLocked: false,
        moderators: ['mod1']
      },
      {
        id: '4',
        name: 'USMLE/COMLEX',
        description: 'Exam preparation discussions and tips',
        icon: '📝',
        color: 'bg-yellow-100 text-yellow-800',
        postCount: 1024,
        isLocked: false,
        moderators: ['mod1', 'mod2']
      },
      {
        id: '5',
        name: 'Research & Publications',
        description: 'Research opportunities and publication discussions',
        icon: '🔬',
        color: 'bg-indigo-100 text-indigo-800',
        postCount: 287,
        isLocked: false,
        moderators: ['mod1']
      },
      {
        id: '6',
        name: 'Career Guidance',
        description: 'Residency, fellowship, and career advice',
        icon: '🎯',
        color: 'bg-pink-100 text-pink-800',
        postCount: 645,
        isLocked: false,
        moderators: ['mod2']
      },
      {
        id: '7',
        name: 'Technology & Tools',
        description: 'Medical apps, software, and technology discussions',
        icon: '💻',
        color: 'bg-gray-100 text-gray-800',
        postCount: 156,
        isLocked: false,
        moderators: ['mod1']
      },
      {
        id: '8',
        name: 'Announcements',
        description: 'Official announcements and updates',
        icon: '📢',
        color: 'bg-red-100 text-red-800',
        postCount: 23,
        isLocked: true,
        moderators: ['admin']
      }
    ];

    const mockThreads: Thread[] = [
      {
        id: '1',
        title: 'Best resources for Internal Medicine shelf exam?',
        content: 'Looking for recommendations on the best study materials for the IM shelf exam. What worked for you?',
        author: {
          id: '1',
          name: 'Sarah Johnson',
          role: 'MS3',
          reputation: 245,
          isVerified: true
        },
        category: '4',
        tags: ['USMLE', 'Internal Medicine', 'Study Materials'],
        createdAt: new Date('2024-08-05T10:30:00'),
        updatedAt: new Date('2024-08-06T14:20:00'),
        isPinned: false,
        isLocked: false,
        isResolved: false,
        views: 156,
        likes: 12,
        replies: 8,
        lastReply: {
          author: 'Dr. Michael Chen',
          timestamp: new Date('2024-08-06T14:20:00')
        },
        attachments: []
      },
      {
        id: '2',
        title: '🔥 Interesting case: 25-year-old with chest pain',
        content: '25F presents to ED with acute chest pain. EKG shows ST elevations in leads II, III, aVF. What\'s your differential?',
        author: {
          id: '2',
          name: 'Dr. Emily Rodriguez',
          role: 'Attending',
          reputation: 1250,
          isVerified: true
        },
        category: '2',
        tags: ['Cardiology', 'Emergency Medicine', 'Case Study'],
        createdAt: new Date('2024-08-04T15:45:00'),
        updatedAt: new Date('2024-08-06T11:30:00'),
        isPinned: true,
        isLocked: false,
        isResolved: true,
        views: 342,
        likes: 28,
        replies: 15,
        lastReply: {
          author: 'Resident Mike',
          timestamp: new Date('2024-08-06T11:30:00')
        },
        attachments: [
          {
            id: '1',
            name: 'ekg-image.jpg',
            type: 'image',
            url: '/api/placeholder/400/300',
            size: '245 KB'
          }
        ]
      },
      {
        id: '3',
        title: 'Study group for Step 2 CK - Join us!',
        content: 'Starting a virtual study group for Step 2 CK. Meeting twice weekly via Zoom. Looking for dedicated members!',
        author: {
          id: '3',
          name: 'Alex Kim',
          role: 'MS4',
          reputation: 189,
          isVerified: false
        },
        category: '3',
        tags: ['Step 2', 'Study Group', 'Virtual'],
        createdAt: new Date('2024-08-03T09:15:00'),
        updatedAt: new Date('2024-08-05T16:45:00'),
        isPinned: false,
        isLocked: false,
        isResolved: false,
        views: 89,
        likes: 7,
        replies: 12,
        lastReply: {
          author: 'Jennifer Wu',
          timestamp: new Date('2024-08-05T16:45:00')
        },
        attachments: [],
        poll: {
          question: 'What time works best for study sessions?',
          options: [
            { text: 'Morning (8-10 AM)', votes: 5 },
            { text: 'Afternoon (2-4 PM)', votes: 8 },
            { text: 'Evening (6-8 PM)', votes: 12 },
            { text: 'Night (8-10 PM)', votes: 3 }
          ],
          totalVotes: 28,
          multipleChoice: false,
          endsAt: new Date('2024-08-10T23:59:59')
        }
      }
    ];

    const mockReplies: Reply[] = [
      {
        id: '1',
        threadId: '1',
        content: 'I highly recommend UWorld and OnlineMedEd for IM shelf. UWorld questions are very similar to the actual exam format.',
        author: {
          id: '4',
          name: 'Dr. Michael Chen',
          role: 'Resident',
          reputation: 567,
          isVerified: true
        },
        createdAt: new Date('2024-08-05T12:15:00'),
        likes: 8,
        dislikes: 0,
        isAcceptedAnswer: true,
        isModerator: false,
        attachments: [],
        mentions: ['Sarah Johnson']
      },
      {
        id: '2',
        threadId: '1',
        content: 'Don\'t forget about Step Up to Medicine! Great for quick review and high-yield facts.',
        author: {
          id: '5',
          name: 'Lisa Park',
          role: 'MS4',
          reputation: 123,
          isVerified: false
        },
        createdAt: new Date('2024-08-05T14:30:00'),
        likes: 5,
        dislikes: 0,
        isAcceptedAnswer: false,
        isModerator: false,
        attachments: [],
        mentions: []
      }
    ];

    const mockNotifications: UserNotification[] = [
      {
        id: '1',
        type: 'reply',
        title: 'New reply to your thread',
        message: 'Dr. Michael Chen replied to "Best resources for Internal Medicine shelf exam?"',
        isRead: false,
        createdAt: new Date('2024-08-06T12:30:00'),
        url: '/forums/thread/1'
      },
      {
        id: '2',
        type: 'mention',
        title: 'You were mentioned',
        message: 'Alex Kim mentioned you in "Study group for Step 2 CK"',
        isRead: false,
        createdAt: new Date('2024-08-06T10:15:00'),
        url: '/forums/thread/3'
      },
      {
        id: '3',
        type: 'like',
        title: 'Your post was liked',
        message: 'Someone liked your reply in "Interesting case: 25-year-old with chest pain"',
        isRead: true,
        createdAt: new Date('2024-08-05T18:45:00'),
        url: '/forums/thread/2'
      }
    ];

    setCategories(mockCategories);
    setThreads(mockThreads);
    setReplies(mockReplies);
    setNotifications(mockNotifications);
    setLoading(false);
  }, []);

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || thread.category === selectedCategory.id;
    
    const matchesFilter = filterBy === 'all' ||
                         (filterBy === 'unanswered' && thread.replies === 0) ||
                         (filterBy === 'resolved' && thread.isResolved) ||
                         (filterBy === 'pinned' && thread.isPinned);
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      case 'oldest':
        return a.createdAt.getTime() - b.createdAt.getTime();
      case 'popular':
        return (b.likes + b.replies) - (a.likes + a.replies);
      case 'trending':
        // Sort by recent activity and engagement
        const aScore = b.views + (b.likes * 2) + (b.replies * 3);
        const bScore = a.views + (a.likes * 2) + (a.replies * 3);
        return bScore - aScore;
      default:
        return 0;
    }
  });

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'attending': return 'bg-purple-100 text-purple-800';
      case 'resident': return 'bg-blue-100 text-blue-800';
      case 'ms4': return 'bg-green-100 text-green-800';
      case 'ms3': return 'bg-yellow-100 text-yellow-800';
      case 'ms2': return 'bg-orange-100 text-orange-800';
      case 'ms1': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReputationBadge = (reputation: number) => {
    if (reputation >= 1000) {
      return { icon: Crown, color: 'text-yellow-500', label: 'Expert' };
    }
    if (reputation >= 500) {
      return { icon: Award, color: 'text-purple-500', label: 'Advanced' };
    }
    if (reputation >= 100) {
      return { icon: Star, color: 'text-blue-500', label: 'Contributor' };
    }
    return { icon: User, color: 'text-gray-500', label: 'Member' };
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) {
        return `${days}d ago`;
    }
    if (hours > 0) {
        return `${hours}h ago`;
    }
    if (minutes > 0) {
        return `${minutes}m ago`;
    }
    return 'Just now';
};
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading forums...</p>
        </div>
      </div>
    );
  }

  // Thread Detail View
  if (currentView === 'thread' && selectedThread) {
    const threadReplies = replies.filter(reply => reply.threadId === selectedThread.id);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView(selectedCategory ? 'category' : 'categories')}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to {selectedCategory ? selectedCategory.name : 'Forums'}
                </button>
                <MessageCircle className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">{selectedThread.title}</h1>
                  <p className="text-blue-100">
                    by {selectedThread.author.name} • {formatTimeAgo(selectedThread.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {selectedThread.isPinned && (
                  <Pin className="h-5 w-5 text-yellow-300" />
                )}
                {selectedThread.isLocked && (
                  <Lock className="h-5 w-5 text-red-300" />
                )}
                {selectedThread.isResolved && (
                  <CheckCircle className="h-5 w-5 text-green-300" />
                )}
                <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors">
                  <Bookmark className="h-4 w-4" />
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Thread Content */}
            <div className="xl:col-span-3 space-y-6">
              {/* Original Post */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6">
                  {/* Author Info */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedThread.author.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{selectedThread.author.name}</h3>
                          {selectedThread.author.isVerified && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                          {(() => {
                            const badge = getReputationBadge(selectedThread.author.reputation);
                            return <badge.icon className={`h-4 w-4 ${badge.color}`} />;
                          })()}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedThread.author.role)}`}>
                            {selectedThread.author.role}
                          </span>
                          <span className="text-sm text-gray-600">
                            {selectedThread.author.reputation} reputation
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTimeAgo(selectedThread.createdAt)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="prose prose-gray max-w-none mb-6">
                    <p>{selectedThread.content}</p>
                  </div>

                  {/* Attachments */}
                  {selectedThread.attachments.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Attachments</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedThread.attachments.map(attachment => (
                          <div key={attachment.id} className="border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                            {attachment.type === 'image' ? (
                              <Image className="h-6 w-6 text-blue-500" />
                            ) : attachment.type === 'video' ? (
                              <Video className="h-6 w-6 text-red-500" />
                            ) : attachment.type === 'audio' ? (
                              <Headphones className="h-6 w-6 text-green-500" />
                            ) : (
                              <FileText className="h-6 w-6 text-gray-500" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{attachment.name}</p>
                              <p className="text-sm text-gray-600">{attachment.size}</p>
                            </div>
                            <button className="text-blue-600 hover:text-blue-700">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Poll */}
                  {selectedThread.poll && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-3">{selectedThread.poll.question}</h4>
                      <div className="space-y-2">
                        {selectedThread.poll.options.map((option, index) => {
                          const percentage = selectedThread.poll!.totalVotes > 0 
                            ? (option.votes / selectedThread.poll!.totalVotes) * 100 
                            : 0;
                          
                          return (
                            <div key={index} className="relative">
                              <button className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                                <div className="flex items-center justify-between">
                                  <span>{option.text}</span>
                                  <span className="text-sm text-gray-600">{option.votes} votes</span>
                                </div>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        {selectedThread.poll.totalVotes} total votes
                        {selectedThread.poll.endsAt && (
                          <> • Ends {selectedThread.poll.endsAt.toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {selectedThread.tags.map(tag => (
                        <span key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{selectedThread.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        <span>{selectedThread.replies}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
                        <Eye className="h-4 w-4" />
                        <span>{selectedThread.views}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-gray-600 hover:text-gray-800 transition-colors">
                        <Quote className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 transition-colors">
                        <Flag className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Replies */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Replies ({threadReplies.length})
                  </h3>
                  <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="most-liked">Most Liked</option>
                  </select>
                </div>

                {threadReplies.map(reply => (
                  <div key={reply.id} className={`bg-white rounded-2xl shadow-lg p-6 ${reply.isAcceptedAnswer ? 'ring-2 ring-green-500' : ''}`}>
                    {reply.isAcceptedAnswer && (
                      <div className="flex items-center gap-2 mb-4 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Accepted Answer</span>
                      </div>
                    )}

                    {/* Reply Author */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {reply.author.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{reply.author.name}</h4>
                            {reply.author.isVerified && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                            {reply.isModerator && (
                              <Shield className="h-4 w-4 text-purple-500" />
                            )}
                            {(() => {
                              const badge = getReputationBadge(reply.author.reputation);
                              return <badge.icon className={`h-4 w-4 ${badge.color}`} />;
                            })()}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(reply.author.role)}`}>
                              {reply.author.role}
                            </span>
                            <span className="text-sm text-gray-600">
                              {reply.author.reputation} reputation
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTimeAgo(reply.createdAt)}
                        {reply.editedAt && (
                          <span className="text-xs text-gray-400 block">
                            (edited {formatTimeAgo(reply.editedAt)})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quote */}
                    {reply.quotes && (
                      <div className="mb-4 p-3 bg-gray-50 border-l-4 border-gray-300 rounded">
                        <p className="text-sm text-gray-700 italic">
                          "{reply.quotes.content}"
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          — {reply.quotes.author}
                        </p>
                      </div>
                    )}

                    {/* Reply Content */}
                    <div className="prose prose-gray max-w-none mb-4">
                      <p>{reply.content}</p>
                    </div>

                    {/* Reply Attachments */}
                    {reply.attachments.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {reply.attachments.map(attachment => (
                            <div key={attachment.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                              {attachment.type === 'image' ? (
                                <Image className="h-4 w-4 text-blue-500" />
                              ) : (
                                <FileText className="h-4 w-4 text-gray-500" />
                              )}
                              <span className="text-sm text-gray-700">{attachment.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reply Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{reply.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                          <ThumbsDown className="h-4 w-4" />
                          <span>{reply.dislikes}</span>
                        </button>
                        <button 
                          onClick={() => {
                            setQuotedReply(reply);
                            setShowReplyEditor(true);
                          }}
                          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Reply className="h-4 w-4" />
                          Reply
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-gray-600 hover:text-gray-800 transition-colors">
                          <Quote className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 transition-colors">
                          <Flag className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Editor */}
              {!selectedThread.isLocked && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Add a Reply</h4>
                  
                  {quotedReply && (
                    <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">
                          Replying to {quotedReply.author.name}:
                        </span>
                        <button
                          onClick={() => setQuotedReply(null)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-blue-800 italic">
                        "{quotedReply.content.substring(0, 100)}..."
                      </p>
                    </div>
                  )}

                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    rows={4}
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                        <Paperclip className="h-4 w-4" />
                        Attach
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                        <Image className="h-4 w-4" />
                        Image
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                        <Smile className="h-4 w-4" />
                        Emoji
                      </button>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Post Reply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Thread Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Thread Statistics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Views:</span>
                    <span className="font-medium">{selectedThread.views}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Replies:</span>
                    <span className="font-medium">{selectedThread.replies}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Likes:</span>
                    <span className="font-medium">{selectedThread.likes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{selectedThread.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Activity:</span>
                    <span className="font-medium">{selectedThread.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Related Threads */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Related Threads</h3>
                <div className="space-y-3">
                  {threads
                    .filter(t => t.id !== selectedThread.id && t.tags.some(tag => selectedThread.tags.includes(tag)))
                    .slice(0, 3)
                    .map(thread => (
                      <div key={thread.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{thread.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MessageSquare className="h-3 w-3" />
                          <span>{thread.replies}</span>
                          <Eye className="h-3 w-3" />
                          <span>{thread.views}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Top Contributors */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Top Contributors</h3>
                <div className="space-y-3">
                  {threadReplies
                    .map(reply => reply.author)
                    .filter((author, index, self) => self.findIndex(a => a.id === author.id) === index)
                    .sort((a, b) => b.reputation - a.reputation)
                    .slice(0, 3)
                    .map(author => (
                      <div key={author.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {author.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{author.name}</p>
                          <p className="text-xs text-gray-600">{author.reputation} reputation</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Category View
  if (currentView === 'category' && selectedCategory) {
    const categoryThreads = sortedThreads.filter(thread => 
      thread.category === selectedCategory.id || 
      (selectedCategory.subcategories && selectedCategory.subcategories.some(sub => thread.category === sub.id))
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('categories')}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Forums
                </button>
                <div className="text-4xl">{selectedCategory.icon}</div>
                <div>
                  <h1 className="text-3xl font-bold">{selectedCategory.name}</h1>
                  <p className="text-blue-100">{selectedCategory.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  <div className="text-2xl font-bold">{categoryThreads.length}</div>
                  <p className="text-blue-100 text-sm">Threads</p>
                </div>
                {!selectedCategory.isLocked && (
                  <button
                    onClick={() => setCurrentView('create-thread')}
                    className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors font-semibold"
                  >
                    <Plus className="h-5 w-5" />
                    New Thread
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters and Search */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search threads in this category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
              
              <div className="flex flex-wrap gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                >
                  <option value="latest">Latest Activity</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="trending">Trending</option>
                </select>
                
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                >
                  <option value="all">All Threads</option>
                  <option value="unanswered">Unanswered</option>
                  <option value="resolved">Resolved</option>
                  <option value="pinned">Pinned</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subcategories */}
          {selectedCategory.subcategories && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {selectedCategory.subcategories.map(subcategory => (
                <button
                  key={subcategory.id}
                  onClick={() => setSelectedCategory(subcategory)}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{subcategory.icon}</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{subcategory.name}</h3>
                      <p className="text-sm text-gray-600">{subcategory.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{subcategory.postCount} posts</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Threads List */}
          <div className="space-y-4">
            {categoryThreads.map(thread => (
              <div
                key={thread.id}
                onClick={() => {
                  setSelectedThread(thread);
                  setCurrentView('thread');
                }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Author Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {thread.author.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    {/* Thread Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {thread.isPinned && (
                            <Pin className="h-4 w-4 text-yellow-500" />
                          )}
                          {thread.isLocked && (
                            <Lock className="h-4 w-4 text-red-500" />
                          )}
                          {thread.isResolved && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
                            {thread.title}
                          </h3>
                        </div>
                        <div className="text-sm text-gray-500 flex-shrink-0">
                          {formatTimeAgo(thread.updatedAt)}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-2">{thread.content}</p>

                      {/* Author Info */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-600">by</span>
                        <span className="font-medium text-gray-900">{thread.author.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(thread.author.role)}`}>
                          {thread.author.role}
                        </span>
                        {thread.author.isVerified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {thread.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            #{tag}
                          </span>
                        ))}
                        {thread.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{thread.tags.length - 3} more</span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{thread.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{thread.replies}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{thread.views}</span>
                        </div>
                        {thread.lastReply && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Last reply by {thread.lastReply.author}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {categoryThreads.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No threads found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try adjusting your search criteria' : 'Be the first to start a discussion in this category!'}
                </p>
                {!selectedCategory.isLocked && (
                  <button
                    onClick={() => setCurrentView('create-thread')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Start Discussion
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Categories View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MessageCircle className="h-12 w-12" />
              <div>
                <h1 className="text-4xl font-bold mb-2">Discussion Forums</h1>
                <p className="text-blue-100 text-xl">Connect, learn, and share with the medical community</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-2xl font-bold">{threads.length}</div>
                <p className="text-blue-100 text-sm">Active Threads</p>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-2xl font-bold">{categories.reduce((acc, cat) => acc + cat.postCount, 0)}</div>
                <p className="text-blue-100 text-sm">Total Posts</p>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-2xl font-bold">{categories.filter(cat => !cat.isLocked).length}</div>
                <p className="text-blue-100 text-sm">Open Categories</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl transition-colors relative"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.slice(0, 5).map(notification => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${!notification.isRead ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(notification.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search across all forums..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) {
                    setCurrentView('search');
                  }
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            <button
              onClick={() => {
                if (searchTerm.trim()) {
                  setCurrentView('search');
                }
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              Search Forums
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Latest Threads */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Latest Threads</h3>
              <div className="space-y-3">
                {threads.slice(0, 3).map(thread => (
                  <div
                    key={thread.id}
                    onClick={() => {
                      setSelectedThread(thread);
                      setCurrentView('thread');
                    }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {thread.author.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{thread.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        by {thread.author.name} • {formatTimeAgo(thread.createdAt)}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {thread.replies}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {thread.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Top Contributors</h3>
              <div className="space-y-3">
                {threads
                  .map(thread => thread.author)
                  .filter((author, index, self) => self.findIndex(a => a.id === author.id) === index)
                  .sort((a, b) => b.reputation - a.reputation)
                  .slice(0, 3)
                  .map(author => (
                    <div key={author.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {author.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 text-sm">{author.name}</h4>
                          {author.isVerified && (
                            <CheckCircle className="h-3 w-3 text-blue-500" />
                          )}
                          {(() => {
                            const badge = getReputationBadge(author.reputation);
                            return <badge.icon className={`h-3 w-3 ${badge.color}`} />;
                          })()}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(author.role)}`}>
                            {author.role}
                          </span>
                          <span className="text-xs text-gray-600">{author.reputation} reputation</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categories.map(category => (
            <div
              key={category.id}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentView('category');
              }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{category.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{category.name}</h3>
                      <p className="text-gray-600 text-sm">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {category.isLocked && (
                      <Lock className="h-5 w-5 text-red-500" />
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {category.postCount} posts
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {category.moderators.length} moderators
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
                    {category.isLocked ? 'Locked' : 'Active'}
                  </span>
                </div>

                {/* Subcategories preview */}
                {category.subcategories && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Subcategories:</p>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.slice(0, 3).map(sub => (
                        <span key={sub.id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {sub.name}
                        </span>
                      ))}
                      {category.subcategories.length > 3 && (
                        <span className="text-xs text-gray-500">+{category.subcategories.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Latest thread preview */}
                {(() => {
                  const latestThread = threads.find(t => t.category === category.id);
                  return latestThread ? (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">Latest:</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {latestThread.author.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{latestThread.title}</p>
                          <p className="text-xs text-gray-600">
                            by {latestThread.author.name} • {formatTimeAgo(latestThread.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscussionForumsPage;