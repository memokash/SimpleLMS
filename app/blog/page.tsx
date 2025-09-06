'use client';

import { Clock, User, ArrowRight, Search, Tag } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'All Topics',
    'Study Tips',
    'USMLE Prep',
    'Medical School Life',
    'Career Guidance',
    'Wellness',
    'Technology'
  ];

  const blogPosts = [
    {
      id: 4,
      title: 'ChatGPT for Medical Students: 10 Game-Changing Study Hacks That Actually Work',
      excerpt: 'While your professors might still be skeptical, AI tools like ChatGPT are transforming how smart medical students study. Evidence-based strategies that top performers are using right now.',
      category: 'Technology',
      author: 'Dr. Michael Thompson',
      date: '2025-01-06',
      readTime: '7 min read',
      featured: true,
      trending: true
    },
    {
      id: 5,
      title: 'Why 73% of Medical Students Are Secretly Using This "Controversial" Study Method',
      excerpt: 'It\'s called "Reverse Learning," and it\'s completely changing how successful medical students approach their studies. Find out why traditional methods are failing you.',
      category: 'Study Tips',
      author: 'Dr. Emily Rodriguez',
      date: '2025-01-06',
      readTime: '6 min read',
      featured: true,
      trending: true
    },
    {
      id: 6,
      title: 'Resident Burnout: The Silent Epidemic No One Talks About (And How to Survive It)',
      excerpt: '76% of residents experience burnout. 35% have depression. These aren\'t just numbers—they\'re your future colleagues. Learn survival strategies that actually work.',
      category: 'Wellness',
      author: 'Dr. Sarah Mitchell',
      date: '2025-01-05',
      readTime: '9 min read',
      featured: true,
      trending: true
    },
    {
      id: 1,
      title: 'How to Create an Effective Study Schedule for USMLE Step 1',
      excerpt: 'Learn proven strategies for organizing your study time, balancing content review with practice questions, and avoiding burnout during your Step 1 preparation.',
      category: 'USMLE Prep',
      author: 'Dr. Sarah Mitchell',
      date: '2025-01-05',
      readTime: '8 min read'
    },
    {
      id: 8,
      title: 'The $300K Question: Is Medical School Debt Worth It in 2025?',
      excerpt: 'Average debt: $251,600. Starting salary: $65,000. These numbers paint a scary picture, but they don\'t tell the whole story. Here\'s the ROI reality check you need.',
      category: 'Career Guidance',
      author: 'Prof. James Chen',
      date: '2025-01-06',
      readTime: '8 min read',
      trending: true
    },
    {
      id: 9,
      title: 'Step 1 Score 270+: How This IMG Did The "Impossible"',
      excerpt: 'From a 189 practice score to 273 on test day. An International Medical Graduate shares the exact strategy that got them into a top residency program.',
      category: 'USMLE Prep',
      author: 'Dr. Michael Thompson',
      date: '2025-01-05',
      readTime: '10 min read',
      trending: true
    },
    {
      id: 10,
      title: 'Anki vs Traditional Studying: The Data Will Shock You',
      excerpt: 'Stanford study reveals Anki users score 18 points higher on Step 1. But there\'s a dark side to spaced repetition that could derail your success.',
      category: 'Study Tips',
      author: 'Prof. James Chen',
      date: '2025-01-04',
      readTime: '7 min read'
    },
    {
      id: 2,
      title: 'Top 10 Memory Techniques for Medical Students',
      excerpt: 'Master these evidence-based memory techniques to retain complex medical information more effectively and improve your exam performance.',
      category: 'Study Tips',
      author: 'Prof. James Chen',
      date: '2025-01-04',
      readTime: '6 min read'
    },
    {
      id: 11,
      title: 'Clinical Rotations Survival Guide: What They Don\'t Teach in Pre-Clinical Years',
      excerpt: 'The unwritten rules, rotation-specific tips, and how to get honors when everyone else is gunning for the same evaluation.',
      category: 'Medical School Life',
      author: 'Dr. Emily Rodriguez',
      date: '2025-01-03',
      readTime: '8 min read'
    },
    {
      id: 3,
      title: 'Balancing Medical School and Mental Health',
      excerpt: 'Practical advice on maintaining your mental well-being while navigating the demands of medical school, from a practicing physician who\'s been there.',
      category: 'Wellness',
      author: 'Dr. Emily Rodriguez',
      date: '2025-01-03',
      readTime: '10 min read'
    },
    {
      id: 12,
      title: 'Match Day Horror Stories (And How to Avoid Them)',
      excerpt: 'Every year, 7% of US medical students don\'t match. Here are the real stories, the mistakes made, and how to ensure you\'re not part of that statistic.',
      category: 'Career Guidance',
      author: 'Dr. Sarah Mitchell',
      date: '2025-01-02',
      readTime: '9 min read',
      trending: true
    },
    {
      id: 7,
      title: 'From Medical Student to Resident: What to Expect',
      excerpt: 'Insights into the transition from medical school to residency, including practical tips for Match Day, orientation, and your first rotations.',
      category: 'Career Guidance',
      author: 'Dr. Sarah Mitchell',
      date: '2025-01-01',
      readTime: '7 min read'
    },
    {
      id: 13,
      title: 'Fellow Life: The Training After Training No One Warns You About',
      excerpt: 'You survived residency and could practice independently. Instead, you chose more training. Here\'s what fellowship really means for your career and life.',
      category: 'Career Guidance',
      author: 'Dr. Michael Thompson',
      date: '2024-12-31',
      readTime: '7 min read'
    },
    {
      id: 14,
      title: 'Night Shift Survival: How Residents Stay Sane Working Vampire Hours',
      excerpt: 'It\'s 3 AM, you\'re running codes, and trying to remember if you\'ve eaten. Here\'s how to survive and thrive during night float rotations.',
      category: 'Wellness',
      author: 'Dr. Emily Rodriguez',
      date: '2024-12-30',
      readTime: '8 min read'
    },
    {
      id: 15,
      title: 'USMLE Step 2 CK: Why Everyone Says It\'s "Easier" (Spoiler: It\'s Not)',
      excerpt: 'With Step 1 now pass/fail, Step 2 CK has become the primary objective metric. Here\'s why underestimating it could cost you your specialty dreams.',
      category: 'USMLE Prep',
      author: 'Dr. Michael Thompson',
      date: '2024-12-29',
      readTime: '7 min read'
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                            post.category.toLowerCase() === selectedCategory.toLowerCase().replace('all topics', 'all');
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-blue-600 dark:bg-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Medical Education Blog
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Expert insights, study strategies, and success stories from medical professionals and educators
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-4 space-x-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category.toLowerCase().replace('all topics', 'all'))}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.toLowerCase().replace('all topics', 'all')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Posts */}
      {selectedCategory === 'all' && searchQuery === '' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Featured Articles
          </h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {featuredPosts.map((post) => (
              <Link href={`/blog/${post.id}`} key={post.id}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                        Featured
                      </span>
                      {(post as any).trending && (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
                          🔥 Trending
                        </span>
                      )}
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {selectedCategory === 'all' && searchQuery === '' ? 'Recent Articles' : 'Articles'}
        </h2>
        
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No articles found matching your criteria
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link href={`/blog/${post.id}`} key={post.id}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      {(post as any).trending && (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
                          🔥 Trending
                        </span>
                      )}
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500 mt-auto">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </div>
                      <span className="text-gray-400">{post.date}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter CTA */}
      <div className="bg-blue-600 dark:bg-blue-800 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Get the latest study tips and medical education insights delivered to your inbox
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}