'use client';

import React, { useState, useEffect } from 'react';
import { 
  Heart,
  MessageCircle,
  Share2,
  ArrowUp,
  ArrowDown,
  Plus,
  TrendingUp,
  Clock,
  Award,
  Coffee,
  Brain,
  Users,
  Shield,
  AlertCircle,
  Smile,
  Frown,
  Meh,
  Star,
  Bookmark,
  MoreVertical,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  specialty: string;
  category: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  createdAt: any;
  tags: string[];
  anonymous?: boolean;
  mood?: 'stressed' | 'anxious' | 'happy' | 'neutral' | 'tired';
}

interface Comment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: any;
  upvotes: number;
}

const MedicalCommunity = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [] as string[],
    anonymous: false,
    mood: 'neutral' as const
  });
  const { user } = useAuth();

  const categories = [
    { id: 'all', label: 'All Posts', icon: TrendingUp, color: 'bg-blue-500' },
    { id: 'vent', label: 'Venting', icon: AlertCircle, color: 'bg-red-500' },
    { id: 'support', label: 'Support', icon: Heart, color: 'bg-pink-500' },
    { id: 'wins', label: 'Small Wins', icon: Award, color: 'bg-yellow-500' },
    { id: 'advice', label: 'Advice', icon: Brain, color: 'bg-purple-500' },
    { id: 'memes', label: 'Med Memes', icon: Smile, color: 'bg-green-500' },
    { id: 'study', label: 'Study Buddies', icon: Users, color: 'bg-indigo-500' },
    { id: 'wellness', label: 'Wellness', icon: Coffee, color: 'bg-orange-500' }
  ];

  const moodEmojis = {
    stressed: { icon: Frown, label: 'Stressed', color: 'text-red-500' },
    anxious: { icon: AlertCircle, label: 'Anxious', color: 'text-yellow-500' },
    happy: { icon: Smile, label: 'Happy', color: 'text-green-500' },
    neutral: { icon: Meh, label: 'Neutral', color: 'text-gray-500' },
    tired: { icon: Coffee, label: 'Tired', color: 'text-blue-500' }
  };

  // Sample posts for demonstration
  const samplePosts: Post[] = [
    {
      id: '1',
      title: "Finally passed Step 2! Here's what helped me...",
      content: "After months of studying and feeling like I'd never make it, I finally passed! The key was finding a study group that kept me accountable. We met every morning at 6 AM before rotations. It was brutal but worth it. Remember, you're not alone in this journey!",
      author: 'ResidentLife',
      authorId: '1',
      specialty: 'PGY-2 Internal Medicine',
      category: 'wins',
      upvotes: 342,
      downvotes: 3,
      comments: 45,
      createdAt: new Date(),
      tags: ['USMLE', 'Step2', 'Success'],
      mood: 'happy'
    },
    {
      id: '2',
      title: "Anyone else struggling with imposter syndrome?",
      content: "Third year medical student here. Every day I feel like I don't belong. Everyone seems to know so much more than me. My attending asked me about a drug interaction today and my mind went completely blank. How do you deal with feeling like you're not cut out for this?",
      author: 'Anonymous',
      authorId: '2',
      specialty: 'MS3',
      category: 'support',
      upvotes: 189,
      downvotes: 2,
      comments: 67,
      createdAt: new Date(),
      tags: ['ImposterSyndrome', 'MS3', 'Support'],
      anonymous: true,
      mood: 'anxious'
    },
    {
      id: '3',
      title: "Night shift survival tips that actually work",
      content: "1. Blackout curtains are non-negotiable\n2. Melatonin 30 mins before 'bedtime'\n3. White noise machine\n4. Tell your family you're dead to the world from 8 AM - 4 PM\n5. Caffeine strategically - not after 3 AM\n6. Bring real food, not just snacks\n\nWhat are your tips?",
      author: 'NightOwlMD',
      authorId: '3',
      specialty: 'Emergency Medicine',
      category: 'advice',
      upvotes: 567,
      downvotes: 5,
      comments: 89,
      createdAt: new Date(),
      tags: ['NightShift', 'Tips', 'Survival'],
      mood: 'tired'
    },
    {
      id: '4',
      title: "When the patient says 'I googled my symptoms'",
      content: "[Insert meme of doctor looking into camera like Jim from The Office]\n\n'So doc, I think I have either a cold or stage 4 lymphoma'",
      author: 'MemeDoc',
      authorId: '4',
      specialty: 'Family Medicine',
      category: 'memes',
      upvotes: 892,
      downvotes: 12,
      comments: 156,
      createdAt: new Date(),
      tags: ['Memes', 'PatientStories', 'Humor'],
      mood: 'happy'
    },
    {
      id: '5',
      title: "Lost another patient today. How do you cope?",
      content: "PGY-3 here. Lost a young patient to complications we couldn't have predicted. Logically, I know we did everything right, but I can't shake the feeling that I missed something. How do you all deal with patient loss? The attending just said 'it gets easier' but I don't want it to get easier. I want to still care.",
      author: 'Anonymous',
      authorId: '5',
      specialty: 'Surgery Resident',
      category: 'vent',
      upvotes: 234,
      downvotes: 0,
      comments: 78,
      createdAt: new Date(),
      tags: ['Loss', 'Grief', 'Support'],
      anonymous: true,
      mood: 'stressed'
    }
  ];

  useEffect(() => {
    // Load posts from Firebase or use sample posts
    loadPosts();
  }, [sortBy, selectedCategory]);

  const loadPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, 'community_posts'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(postsQuery);
      
      if (snapshot.empty) {
        // Use sample posts if no posts in database
        setPosts(samplePosts);
      } else {
        const loadedPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Post));
        setPosts(loadedPosts);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts(samplePosts);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.title || !newPost.content) return;

    try {
      await addDoc(collection(db, 'community_posts'), {
        ...newPost,
        author: newPost.anonymous ? 'Anonymous' : user.email?.split('@')[0],
        authorId: user.uid,
        specialty: 'Medical Student', // This would come from user profile
        upvotes: 0,
        downvotes: 0,
        comments: 0,
        createdAt: serverTimestamp()
      });

      setNewPost({
        title: '',
        content: '',
        category: 'general',
        tags: [],
        anonymous: false,
        mood: 'neutral'
      });
      setShowNewPost(false);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    try {
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, {
        [voteType === 'up' ? 'upvotes' : 'downvotes']: increment(1)
      });
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            [voteType === 'up' ? 'upvotes' : 'downvotes']: post[voteType === 'up' ? 'upvotes' : 'downvotes'] + 1
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getTimeAgo = (date: any) => {
    if (!date) return 'just now';
    const seconds = Math.floor((new Date().getTime() - date.toDate?.()?.getTime?.() || date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#07294d] mb-2">MedLife Community</h1>
          <p className="text-gray-600">A safe space for medical professionals to connect, share, and support each other</p>
        </div>

        {/* Wellness Check Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">How are you feeling today?</h2>
              <p className="text-blue-100">Remember: It\'s okay to not be okay. We\'re here for you.</p>
            </div>
            <div className="flex gap-3">
              {Object.entries(moodEmojis).map(([mood, data]) => {
                const Icon = data.icon;
                return (
                  <button
                    key={mood}
                    className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    title={data.label}
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Create Post Button */}
            <button
              onClick={() => setShowNewPost(true)}
              className="w-full mb-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className={`${cat.color} bg-opacity-10 p-1.5 rounded`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Community Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 text-blue-500" />
                  <span>Patient privacy is paramount</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 mt-0.5 text-red-500" />
                  <span>Be kind and supportive</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="w-4 h-4 mt-0.5 text-green-500" />
                  <span>We\'re all in this together</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <button
                    onClick={() => setSortBy('hot')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      sortBy === 'hot' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    🔥 Hot
                  </button>
                  <button
                    onClick={() => setSortBy('new')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      sortBy === 'new' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    ✨ New
                  </button>
                  <button
                    onClick={() => setSortBy('top')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      sortBy === 'top' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    📈 Top
                  </button>
                </div>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map(post => {
                const MoodIcon = post.mood ? moodEmojis[post.mood].icon : null;
                const moodData = post.mood ? moodEmojis[post.mood] : null;
                
                return (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                              {categories.find(c => c.id === post.category)?.label || 'General'}
                            </span>
                            {post.mood && MoodIcon && (
                              <span className={`flex items-center gap-1 text-sm ${moodData?.color}`}>
                                <MoodIcon className="w-4 h-4" />
                                {moodData?.label}
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              {post.anonymous ? '👤 Anonymous' : post.author} • {post.specialty}
                            </span>
                            <span className="text-sm text-gray-400">
                              {getTimeAgo(post.createdAt)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">
                            {post.content}
                          </p>
                        </div>
                      </div>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2 mb-4 flex-wrap">
                          {post.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleVote(post.id, 'up')}
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                            >
                              <ArrowUp className="w-5 h-5 text-gray-600" />
                            </button>
                            <span className="font-medium text-gray-700">
                              {post.upvotes - post.downvotes}
                            </span>
                            <button 
                              onClick={() => handleVote(post.id, 'down')}
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                            >
                              <ArrowDown className="w-5 h-5 text-gray-600" />
                            </button>
                          </div>
                          <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MessageCircle className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-700">{post.comments} Comments</span>
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Share2 className="w-5 h-5 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bookmark className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* New Post Modal */}
        {showNewPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Create a Post</h2>
                
                {/* Category Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Mood Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Mood</label>
                  <div className="flex gap-2">
                    {Object.entries(moodEmojis).map(([mood, data]) => {
                      const Icon = data.icon;
                      return (
                        <button
                          key={mood}
                          onClick={() => setNewPost(prev => ({ ...prev, mood: mood as any }))}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            newPost.mood === mood 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${data.color}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What's on your mind?"
                  />
                </div>

                {/* Content */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="Share your thoughts, experiences, or questions..."
                  />
                </div>

                {/* Anonymous Option */}
                <div className="mb-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newPost.anonymous}
                      onChange={(e) => setNewPost(prev => ({ ...prev, anonymous: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Post anonymously</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCreatePost}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Post
                  </button>
                  <button
                    onClick={() => setShowNewPost(false)}
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

export default MedicalCommunity;