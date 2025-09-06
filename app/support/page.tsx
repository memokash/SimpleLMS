'use client';

import { Search, Book, CreditCard, User, Shield, Zap, MessageCircle, Mail } from 'lucide-react';
import { useState } from 'react';

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      icon: Book,
      title: 'Getting Started',
      articles: [
        'How to create your account',
        'Taking your first quiz',
        'Understanding quiz explanations',
        'Tracking your progress'
      ]
    },
    {
      icon: CreditCard,
      title: 'Billing & Subscriptions',
      articles: [
        'Subscription plans explained',
        'How to upgrade your account',
        'Cancel or pause subscription',
        'Payment methods accepted'
      ]
    },
    {
      icon: User,
      title: 'Account Management',
      articles: [
        'Reset your password',
        'Update profile information',
        'Manage device sessions',
        'Delete your account'
      ]
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      articles: [
        'Two-device sign-in limit',
        'Data protection measures',
        'Account security tips',
        'Report security issues'
      ]
    },
    {
      icon: Zap,
      title: 'Features & Tools',
      articles: [
        'Using the AI Tutor',
        'Community Question Bank',
        'Study Groups',
        'Performance Analytics'
      ]
    },
    {
      icon: MessageCircle,
      title: 'Troubleshooting',
      articles: [
        'Quiz not loading',
        'Login issues',
        'Payment problems',
        'Mobile app issues'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-blue-600 dark:bg-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Search our knowledge base or browse categories below
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Help Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {helpCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                    {category.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {category.articles.map((article, idx) => (
                    <li key={idx}>
                      <a 
                        href="#" 
                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm hover:underline"
                      >
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Still need help?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Our support team is here to assist you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact Support
              </a>
              <a
                href="/faq"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                View FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}