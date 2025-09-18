"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from './components/AuthContext';
import AuthModal from './components/AuthModal';
import { TrendingUp, Star, Target, Brain, Award, Zap, Users, BookOpen } from 'lucide-react';
import HeaderEnhanced from './components/HeaderEnhanced';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../lib/firebase'; 
import {
  ArrowRight,
  CheckCircle,
  BrainCircuit,
  Sparkles,
  FileText,
  MessageSquare,
  Gauge,
  BarChart3,
  UserCog,
  Clock
} from 'lucide-react'; 

const HomePage = () => {
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Redirect signed-in users to dashboard
  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user]);
  interface Quiz {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    questionCount?: number;
    questions?: unknown[];
    estimatedTime?: number;
  }

  const [featuredQuizzes, setFeaturedQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  // Header click handlers
  const handleSignInClick = () => {
    setShowAuthModal(true);
  };

  const handleSignUpClick = () => {
    setShowAuthModal(true);
  };

  // Fetch real quizzes from Firebase
  useEffect(() => {
    const fetchFeaturedQuizzes = async () => {
      try {
        setLoadingQuizzes(true);
        const quizzesRef = collection(db, 'quizzes');
        const q = query(quizzesRef, limit(12)); // Fetch more to randomize
        const querySnapshot = await getDocs(q);
        
        const quizzes: Quiz[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          quizzes.push({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            category: data.category || '',
            difficulty: data.difficulty || '',
            questionCount: data.questionCount,
            questions: data.questions,
            estimatedTime: data.estimatedTime
          });
        });
        
        // Randomize and take 4 quizzes
        const shuffled = quizzes.sort(() => Math.random() - 0.5);
        setFeaturedQuizzes(shuffled.slice(0, 4));
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        // Fallback sample quizzes if Firebase fails
        setFeaturedQuizzes([
          {
            id: 'MSQ Quiz 4',
            title: 'Cytokines and Interleukins',
            description: 'Master the complex world of immune system signaling molecules',
            category: 'Immunology',
            difficulty: 'Intermediate',
            questionCount: 25,
            estimatedTime: 20
          },
          {
            id: 'MSQ-299',
            title: 'Dermatology for USMLE',
            description: 'Essential dermatological conditions for board exams',
            category: 'Dermatology',
            difficulty: 'Advanced',
            questionCount: 30,
            estimatedTime: 25
          },
          {
            id: 'MSQ###-X',
            title: 'Clinical Challenges',
            description: 'Complex clinical scenarios in modern medicine',
            category: 'Clinical Medicine',
            difficulty: 'Expert',
            questionCount: 20,
            estimatedTime: 30
          },
          {
            id: 'CARDIO-101',
            title: 'Cardiac Physiology',
            description: 'Fundamental concepts in cardiovascular function',
            category: 'Cardiology',
            difficulty: 'Beginner',
            questionCount: 15,
            estimatedTime: 15
          }
        ]);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    fetchFeaturedQuizzes();
    // Refresh quizzes every 30 seconds for variety
    const interval = setInterval(fetchFeaturedQuizzes, 30000);
    return () => clearInterval(interval);
  }, []);

  // Stripe handlers
  const handleStripeCheckout = async (priceId: string, planName: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.uid,
          planName,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const session = await response.json();
      
      if (session.sessionId) {
        const { stripePromise } = await import('../lib/stripe');
        const stripe = await stripePromise;
        
        const result = await stripe?.redirectToCheckout({
          sessionId: session.sessionId,
        });
        
        if (result?.error) {
          console.error(result.error);
          alert('Payment error: ' + result.error.message);
        }
      } else {
        alert('Error creating checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment setup error. Please try again.');
    }
  };


  const features = [
    {
      icon: BookOpen,
      title: 'Comprehensive Study Materials',
      description: 'Access thousands of practice questions, study guides, and resources across all subjects.',
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: 'Track Your Progress',
      description: 'Monitor your learning journey with detailed analytics and performance insights.',
      color: 'green'
    },
    {
      icon: Zap,
      title: 'Adaptive Learning',
      description: 'Smart algorithms personalize your study experience based on your strengths and weaknesses.',
      color: 'amber'
    },
    {
      icon: Target,
      title: 'Study Anywhere',
      description: 'Access your materials on any device - phone, tablet, or computer. Learn on your schedule.',
      color: 'teal'
    },
    {
      icon: Award,
      title: 'Exam Preparation',
      description: 'Practice with questions that mirror actual exam formats and difficulty levels.',
      color: 'blue'
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Join study groups, share notes, and learn together with your peers.',
      color: 'green'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
      green: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
      amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
      teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300',
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
  };

  // Clean Section Separator Component
  const SectionSeparator = ({ title }: { title: string }) => (
    <div className="relative my-16">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-px bg-gray-300 dark:bg-gray-700"></div>
      </div>
      <div className="relative flex justify-center">
        <h2 className="px-8 py-4 bg-white dark:bg-gray-900 text-3xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
      </div>
    </div>
  );

  const subscriptionBenefits = [
    {
      icon: BrainCircuit,
      title: 'Smart Study System',
      description: 'Interactive quizzes with detailed explanations across all academic subjects.',
      link: '/quiz'
    },
    {
      icon: Sparkles,
      title: 'AI Study Assistant',
      description: 'Get personalized study recommendations based on your learning patterns.',
      link: '/dashboard/assistant'
    },
    {
      icon: FileText,
      title: 'Document Library',
      description: 'Store, organize, and annotate your study materials in one place.',
      link: '/library'
    },
    {
      icon: Users,
      title: 'Study Groups',
      description: 'Create or join study groups for collaborative learning.',
      link: '/study-groups'
    },
    {
      icon: MessageSquare,
      title: 'Discussion Forums',
      description: 'Engage with peers and instructors in subject-specific discussions.',
      link: '/forums'
    },
    {
      icon: BookOpen,
      title: 'Course Materials',
      description: 'Access lecture notes, slides, and supplementary resources.',
      link: '/courses'
    },
    {
      icon: Gauge,
      title: 'Progress Dashboard',
      description: 'Monitor your study progress and achievement milestones.',
      link: '/dashboard'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Visualize your learning trends and identify areas for improvement.',
      link: '/analytics'
    },
    {
      icon: UserCog,
      title: 'Personalized Learning',
      description: 'Customize your study plan and learning preferences.',
      link: '/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f0f7ff] relative overflow-x-hidden">
      {/* Simple background pattern */}
      
      {/* Removed complex animations */}
      <style jsx>{`
        /* Simplified styles without medical themes */
        .icon-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
      
      {/* Enhanced Header with better design */}
      <HeaderEnhanced 
        onSignInClick={handleSignInClick}
        onSignUpClick={handleSignUpClick}
        isLandingPage={true}
      />

      {/* Modern Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] md:min-h-[500px] lg:min-h-screen flex items-center z-10 py-12 md:py-16">
        {/* Books Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{
            backgroundImage: 'url(/books.webp)',
          }}
        ></div>
        
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-[#07294d]/20"></div>
        
        {/* Modern Floating Badges */}
        <div className="hidden lg:block absolute top-20 right-10 bg-white/90 backdrop-blur-md text-[#07294d] px-6 py-3 rounded-full font-medium text-sm border border-white/40 z-20">
          ✨ 15,000+ Practice Questions
        </div>
        <div className="hidden lg:block absolute bottom-20 left-10 bg-white/90 backdrop-blur-md text-[#07294d] px-6 py-3 rounded-full font-medium text-sm border border-white/40 z-20">
          🎓 Trusted by 10,000+ Students
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 text-center z-10">
          <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
            <div className="space-y-4 lg:space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                <span className="text-white">University Learning</span>
                <span className="block text-gradient-primary">Made Simple</span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                Your complete academic companion. Study smarter with AI-powered tools, track your progress, and collaborate with peers across all subjects.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center">
              <a 
                href="/quiz" 
                className="px-8 py-4 lg:px-10 lg:py-5 bg-white text-[#07294d] font-bold rounded-2xl text-lg lg:text-xl hover:bg-gray-50 transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3 min-h-[48px]"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </a>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-4 lg:px-10 lg:py-5 border-2 border-white/60 bg-white/20 backdrop-blur-md text-white font-semibold rounded-2xl text-lg lg:text-xl hover:bg-white/30 transition-all shadow-2xl min-h-[48px]"
              >
                Sign Up Free
              </button>
            </div>
            
            {/* Privacy Policy Link */}
            <p className="mt-4 text-sm text-white/80 text-center">
              By signing up, you agree to our{' '}
              <a href="/privacy" className="text-white underline hover:text-white/90">
                Privacy Policy
              </a>
              {' '}and{' '}
              <a href="/terms" className="text-white underline hover:text-white/90">
                Terms of Service
              </a>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 lg:gap-4 text-base lg:text-lg mt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-400" />
                <span className="drop-shadow-xl text-gray-200">No credit card required</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-400" />
                <span className="drop-shadow-xl text-gray-200">🧠 Smart Quiz Engine, 15,000+ Questions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section className="py-12 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive tools designed for modern medical education
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptionBenefits.map(({ icon: Icon, title, description, link }, i) => (
              <a
                key={i}
                href={link}
                className="modern-card modern-card-hover p-4 text-center group cursor-pointer block"
              >
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-2xl bg-[#f0f7ff] group-hover:scale-110 transition-transform duration-200">
                    <Icon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{description}</p>
                <span className="text-violet-600 dark:text-violet-400 font-medium text-sm group-hover:underline">
                  Learn more →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    
      <section className="py-12 relative z-10 bg-[#f0f7ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
              Smart Learning System
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              AI-powered quizzes that adapt to your learning style
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, description }, i) => (
              <div
                key={i}
                className="modern-card modern-card-hover p-4 text-center group"
              >
                <div className="flex justify-center mb-6">
                  <div className={`sparkle-icon p-6 rounded-3xl ${getColorClasses(features[i].color)} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <Icon className="w-12 h-12" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
                <p className="text-slate-800 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Quizzes Section */}
      <section className="py-12 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-white mb-4">
              Featured Quizzes
            </h2>
            <p className="text-xl text-white/90">
              Start practicing with our most popular quizzes
            </p>
          </div>
          <p className="text-center text-lg text-white mb-12">
            Choose to take the full quiz or try a quick 10-question sample
          </p>
          
          {loadingQuizzes ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-center">
                <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-bounce" />
                <p className="text-slate-700">Loading featured quizzes...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredQuizzes.map((quiz, i) => {
                const getDifficultyColor = (difficulty: string) => {
                  switch(difficulty?.toLowerCase()) {
                    case 'beginner': return 'bg-green-100 text-green-800 border-green-300';
                    case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
                    case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-300';
                    case 'expert': return 'bg-red-100 text-red-800 border-red-300';
                    default: return 'bg-gray-100 text-gray-800 border-gray-300';
                  }
                };
                
                const getCategoryIcon = (category: string) => {
                  switch(category?.toLowerCase()) {
                    case 'science': return Brain;
                    case 'technology': return Zap;
                    case 'engineering': return Target;
                    case 'mathematics': return BarChart3;
                    case 'business': return TrendingUp;
                    case 'arts': return Star;
                    default: return BookOpen;
                  }
                };
                
                const CategoryIcon = getCategoryIcon(quiz.category);
                
                return (
                  <div
                    key={quiz.id || i}
                    className="modern-card modern-card-hover p-6 group flex flex-col"
                  >
                    <div className="sparkle-icon flex justify-center mb-4">
                      <div className="p-4 rounded-2xl bg-[#07294d] text-white shadow-lg group-hover:shadow-xl transition-shadow">
                        <CategoryIcon className="w-8 h-8" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                      {quiz.title || `Quiz ${i + 1}`}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold border ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty || 'Mixed'}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full font-semibold bg-[#f0f7ff] text-[#07294d] border border-[#07294d]/20">
                        {quiz.category || 'General'}
                      </span>
                    </div>
                    
                    <p className="text-slate-700 text-sm mb-4 flex-grow line-clamp-3">
                      {quiz.description || 'Test your medical knowledge with this comprehensive quiz.'}
                    </p>
                    
                    <div className="text-xs text-slate-600 mb-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        <span>{quiz.questionCount || quiz.questions?.length || 20} questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{quiz.estimatedTime || 20} minutes</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <a 
                        href={`/quiz?id=${encodeURIComponent(quiz.id)}`}
                        className="w-full bg-[#07294d] text-white py-2.5 px-4 rounded-xl font-medium hover:bg-[#07294d]/90 transition-all text-center text-sm block shadow-lg hover:shadow-xl"
                      >
                        Take Full Quiz
                      </a>
                      <a 
                        href={`/quiz?id=${encodeURIComponent(quiz.id)}&limit=10`}
                        className="w-full bg-white text-[#07294d] py-2.5 px-4 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-all text-center text-sm block"
                      >
                        Quick 10 Questions
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="text-center mt-12">
            <a 
              href="/quiz"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#07294d] text-white font-bold rounded-2xl text-lg hover:bg-[#07294d]/90 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <BookOpen className="w-5 h-5" />
              Browse All Quizzes
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 relative z-10 bg-[#07294d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">
              Proven Results
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Join thousands of successful students
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center modern-card p-4 group hover-lift">
              <div className="sparkle-icon flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-[#0C8B51] text-white">
                  <BookOpen className="w-8 h-8" />
                </div>
              </div>
              <div className="text-5xl font-bold text-cyan-800 mb-3">15,000+</div>
              <div className="text-slate-900 font-semibold">Practice Questions</div>
            </div>
            <div className="text-center modern-card p-4 group hover-lift">
              <div className="sparkle-icon flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-[#27B8A7] text-white">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
              <div className="text-5xl font-bold text-emerald-800 mb-3">95%</div>
              <div className="text-slate-900 font-semibold">Pass Rate Improvement</div>
            </div>
            <div className="text-center modern-card p-4 group hover-lift">
              <div className="sparkle-icon flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-[#2F7AD5] text-white">
                  <Users className="w-8 h-8" />
                </div>
              </div>
              <div className="text-5xl font-bold text-purple-800 mb-3">10,000+</div>
              <div className="text-slate-900 font-semibold">Students Enrolled</div>
            </div>
            <div className="text-center modern-card p-4 group hover-lift">
              <div className="sparkle-icon flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-[#EAB830] text-[#07294d]">
                  <Zap className="w-8 h-8" />
                </div>
              </div>
              <div className="text-5xl font-bold text-yellow-800 mb-3">24/7</div>
              <div className="text-slate-900 font-semibold">Study Support</div>
            </div>
          </div>
        </div>
      </section>


      {/* Why Choose Us Section */}
      <section className="py-12 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <p className="text-xl text-[#07294d] max-w-4xl mx-auto bg-white rounded-2xl p-6 border border-[#07294d]/20 shadow-lg">
              This is more than a quiz app. It's your all-in-one medical education companion — built by physicians to centralize your progress, connect you to a like-minded community, and provide seamless access across disciplines and training sites.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="modern-card modern-card-hover p-4 min-h-[200px] group">
                  <div className="text-center">
                    <div className={`sparkle-icon inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 ${getColorClasses(feature.color)} shadow-lg group-hover:scale-110 transition-all duration-300`}>
                      <IconComponent className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                    <p className="text-slate-900 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section id="pricing" className="py-12 relative z-10 bg-[#f0f7ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <p className="text-xl text-[#07294d] max-w-3xl mx-auto bg-white rounded-2xl p-6 border border-[#07294d]/20 shadow-lg">
              Access to the most comprehensive medical education question bank available. Start free and upgrade when ready.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="modern-card p-4 text-center min-h-[400px] flex flex-col">
              <div className="sparkle-icon flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-[#8D8D8D] text-white">
                  <BookOpen className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-slate-900">Free</h3>
              <div className="text-5xl font-bold text-gray-700 mb-2">$0</div>
              <div className="text-slate-800 mb-8 font-medium">per month</div>
              <ul className="text-left space-y-4 mb-8 flex-1">
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">5 quiz attempts per day</span>
                </li>
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">Basic progress tracking</span>
                </li>
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">Limited topic access</span>
                </li>
                <li className="flex items-center">
                  <span className="text-red-600 mr-3 text-xl">❌</span>
                  <span className="text-slate-600 font-medium">Full question bank</span>
                </li>
              </ul>
              <a 
                href="/quiz"
                className="w-full bg-gray-200 text-gray-600 py-4 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200 block text-center"
              >
                Try Free Quiz
              </a>
            </div>

            {/* Pro Plan - Popular */}
            <div className="modern-card p-4 text-center min-h-[400px] flex flex-col relative transform scale-105 border-2 border-violet-500">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#0C8B51] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                Most Popular
              </div>
              <div className="sparkle-icon flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-[#07294d] text-white">
                  <Award className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-indigo-900">Pro</h3>
              <div className="text-5xl font-bold text-indigo-800 mb-2">$19.99</div>
              <div className="text-slate-800 mb-8 font-medium">per month</div>
              <ul className="text-left space-y-4 mb-8 flex-1">
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">Unlimited quiz attempts</span>
                </li>
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">All study materials</span>
                </li>
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">All academic subjects</span>
                </li>
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">Detailed explanations</span>
                </li>
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">Performance analytics</span>
                </li>
              </ul>
              <button 
                onClick={() => handleStripeCheckout('price_1RqE1PEbNlb7nCbs0las6NY5', 'Pro')}
                className="w-full bg-[#07294d] text-white py-4 rounded-xl font-semibold hover:bg-[#07294d]/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {user ? 'Subscribe for $19.99/month' : 'Sign Up to Subscribe'}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="modern-card p-4 text-center min-h-[400px] flex flex-col">
              <div className="sparkle-icon flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-[#0C8B51] text-white">
                  <Star className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-purple-900">Premium</h3>
              <div className="text-5xl font-bold text-purple-800 mb-2">$39.99</div>
              <div className="text-slate-800 mb-8 font-medium">per month</div>
              <ul className="text-left space-y-4 mb-8 flex-1">
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">Everything in Pro</span>
                </li>
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">AI-powered tutoring sessions</span>
                </li>
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">Custom study plans</span>
                </li>
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">Priority support</span>
                </li>
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">Exam prep courses</span>
                </li>
              </ul>
              <button 
                onClick={() => handleStripeCheckout('price_1RqE4NEbNlb7nCbsKLwEcd3a', 'Premium')}
                className="w-full bg-[#EAB830] text-white py-4 rounded-2xl font-semibold hover:bg-[#EAB830]/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {user ? 'Subscribe for $39.99/month' : 'Sign Up to Subscribe'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#07294d] py-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-black mb-6 text-white">
            Ready to Transform Your Medical Education?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Join thousands of medical students, residents, mastering their exams with the most comprehensive question bank available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/quiz"
              className="bg-white text-[#07294d] px-10 py-5 rounded-2xl text-lg font-bold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-2xl"
            >
              Start Free Trial
            </a>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="border-4 border-[#0C8B51] bg-white text-[#07294d] px-10 py-5 rounded-3xl text-lg font-bold hover:bg-[#f0f7ff] transition-all"
            >
              Create Account
            </button>
          </div>
          <div className="mt-8 text-slate-800 text-sm font-medium">
            Free trial • No credit card required • Cancel anytime
          </div>
        </div>
      </section>

      {/* Auth Modal - Single instance at the end */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignInWithEmail={signInWithEmail}
        onSignUpWithEmail={signUpWithEmail}
        onSignInWithGoogle={signInWithGoogle}
      />
    </div>
  );
};

export default HomePage;