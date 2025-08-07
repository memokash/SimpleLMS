"use client";

import React, { useState } from 'react';
import { useAuth } from './components/AuthContext';
import AuthModal from './components/AuthModal';
import { TrendingUp, Star, Target, Brain, Award, Zap, Heart, Shield, Microscope, Pill, Bone } from 'lucide-react';
import Header from './components/Header'; 
import {
  ArrowRight,
  CheckCircle,
  BrainCircuit,
  Sparkles,
  Stethoscope,
  NotebookText,
  BookOpen,
  Users,
  MessageSquare,
  Gauge,
  BarChart3,
  UserCog
} from 'lucide-react'; 

const HomePage = () => {
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ✅ ADDED: Header click handlers
  const handleSignInClick = () => {
    setShowAuthModal(true);
  };

  const handleSignUpClick = () => {
    setShowAuthModal(true);
  };

  const specialties = [
    { name: 'Cardiology', count: 250, color: 'red', icon: Heart, description: 'Heart diseases, ECG interpretation, and cardiac procedures' },
    { name: 'Neurology', count: 180, color: 'purple', icon: Brain, description: 'Brain disorders, neurological examinations, and treatments' },
    { name: 'Immunology', count: 220, color: 'blue', icon: Shield, description: 'Immune system, autoimmune diseases, and immunotherapy' },
    { name: 'Pathology', count: 190, color: 'green', icon: Microscope, description: 'Disease diagnosis, laboratory tests, and pathophysiology' },
    { name: 'Pharmacology', count: 160, color: 'yellow', icon: Pill, description: 'Drug mechanisms, interactions, and therapeutic applications' },
    { name: 'Anatomy', count: 200, color: 'pink', icon: Bone, description: 'Human body structure, systems, and anatomical relationships' }
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'Why It’s Worth the Monthly Investment',
      description: '🔁 Centralized Progress: Track every quiz, note, and resource — no matter what rotation or hospital you’re in.',
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: '🌎 Cross-Institutional Access',
      description: 'Your LMS isn’t tied to one school — it follows you, not your program. 🧑‍⚕️ Built for All Levels: Medical students, residents, and attendings can all find value here — whether studying or teaching.',
      color: 'green'
    },
    {
      icon: Zap,
      title: '🧠 Smart Quiz Engine',
      description: 'Generate or take quizzes tailored to your specialty and weak points.🤝 Community-Driven Learning: Collaborate with real peers — not just abstract discussion boards.',
      color: 'purple'
    },
    {
      icon: Target,
      title: 'Study Anywhere',
      description: 'Access your quizzes on any device - phone, tablet, or computer. Study during commutes or breaks.',
      color: 'orange'
    },
    {
      icon: Award,
      title: 'Exam-Focused',
      description: 'Questions mirror the style and difficulty of actual medical school exams and board certifications.',
      color: 'red'
    },
    {
      icon: Users,
      title: '🔓 Self-Enroll, No Hassle',
      description: 'No admin gatekeeping. Join, build your notebook, and track learning from Day 1.',
      color: 'indigo'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      red: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
      purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
      blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
      green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
      yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
      pink: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30',
      orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
      indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30'
    };
    return colorMap[color] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
  };

  // Section Separator Component
  const SectionSeparator = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
    <div className="relative my-16">
      <div className="absolute inset-0 flex items-center">
        <div className={`w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent dark:via-yellow-400/60 rounded-full`}></div>
      </div>
      <div className="relative flex justify-center">
        <div className={`px-8 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-yellow-500/30 shadow-xl dark:shadow-yellow-500/20`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${getColorClasses(color)}`}>
              <Icon className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
        </div>
      </div>
    </div>
  );

  const subscriptionBenefits = [
    {
      icon: BrainCircuit,
      title: 'Smart Quiz Engine',
      description: 'Interactive quizzes with AI-generated explanations and >15,000 questions across all disciplines.'
    },
    {
      icon: Sparkles,
      title: 'AI Tutor',
      description: 'Get customized explanations and study guides tailored to your weak spots.'
    },
    {
      icon: Stethoscope,
      title: 'Clinical Rounding Tools',
      description: 'Quick access to templates for H&Ps, procedures, and clinical documentation on the go.'
    },
    {
      icon: NotebookText,
      title: 'Reading Vault',
      description: 'Store, annotate, and tag key readings, journal articles, and board resources.'
    },
    {
      icon: Users,
      title: 'Study Groups',
      description: 'Join or build groups by rotation, discipline, or exam date. No more siloed studying.'
    },
    {
      icon: MessageSquare,
      title: 'Peer Chat & Messaging',
      description: 'Direct communication with peers, mentors, or groups — built right into your dashboard.'
    },
    {
      icon: Gauge,
      title: 'Progress Tracking',
      description: 'Track your quiz scores, course completions, and weekly study momentum.'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Get visual insights into what topics you’ve mastered and what needs work.'
    },
    {
      icon: UserCog,
      title: 'Custom Learning Profile',
      description: 'Personalize your dashboard, themes, and study goals across your career journey.'
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      
      {/* ✅ ADDED: Homepage Header */}
      <Header 
        onSignInClick={handleSignInClick}
        onSignUpClick={handleSignUpClick}
      />

      {/* Enhanced Hero Section with Books Background */}
      <section className="relative overflow-hidden min-h-screen lg:min-h-screen flex items-center">
        {/* Books Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/books.webp)',
          }}
        ></div>
        
        {/* Lighter Gradient Overlay for Better Image Visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-blue-800/30 to-green-800/40"></div>
        
        {/* Floating badges - Centered horizontally */}
        <div className="hidden lg:block absolute top-6 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-blue-900 px-6 py-3 rounded-full font-bold text-base shadow-2xl z-10">
         🔒 Master Every Stage of Your Medical Training — All in One Place
        </div>
        <div className="hidden lg:block absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-lg text-blue-900 px-6 py-3 rounded-full font-semibold text-base shadow-2xl z-10">
          💡 AI-Powered smart Learning
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 text-center text-white">
          <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
            <div className="space-y-4 lg:space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-white drop-shadow-2xl">
                Medical Education LMS .                <span className="block text-yellow-300 drop-shadow-2xl">Unified cross institutionalplatform for the medical community.</span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-100 leading-relaxed max-w-3xl mx-auto drop-shadow-xl">
                From med school to residency, fellowship and beyond, streamline your learning, stay connected across institutions, and easily pass your in school exams with AI-powered quizzes, smart analytics, and real clinical tools. </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center">
              <a 
                href="/quiz" 
                className="px-8 py-4 lg:px-10 lg:py-5 bg-yellow-400 text-blue-900 font-bold rounded-lg text-lg lg:text-xl hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3 min-h-[48px]"
              >
                Try Free Quiz Now 🧠
                <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </a>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-4 lg:px-10 lg:py-5 border-2 border-white text-white font-semibold rounded-lg text-lg lg:text-xl hover:bg-white hover:text-blue-700 transition-colors shadow-2xl min-h-[48px]"
              >
                Sign Up Free
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 lg:gap-8 text-base lg:text-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-300" />
                <span className="drop-shadow-xl text-gray-100">No credit card required</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-300" />
                <span className="drop-shadow-xl text-gray-100">🧠 Smart Quiz Engine,15,000+ Questions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔐 Subscription Benefits Section from Dashboard */}
<section className="py-20 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
      Features You’ll Actually Use
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {subscriptionBenefits.map(({ icon: Icon, title, description }, i) => (
        <div
          key={i}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-transform duration-300 hover:scale-105 text-center"
        >
          <div className="flex justify-center mb-4">
            <Icon className="w-10 h-10 text-blue-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
    

      
      <section className="py-20 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
      Quizzes that Teach and test  - Each quiz is a complete mini Course
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map(({ icon: Icon, title, description }, i) => (
        <div
          key={i}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-transform duration-300 hover:scale-105 text-center"
        >
          <div className="flex justify-center mb-4">
            <Icon className="w-10 h-10 text-blue-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{description}</p>
        </div>
      ))}
    </div>
  </div>
      </section>
      
  {/* 🔐 Subscription Benefits Section from Dashboard */}
<section className="py-20 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
      Features You’ll Actually Use
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {subscriptionBenefits.map(({ icon: Icon, title, description }, i) => (
        <div
          key={i}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-transform duration-300 hover:scale-105 text-center"
        >
          <div className="flex justify-center mb-4">
            <Icon className="w-10 h-10 text-blue-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
    

{/* 🔄 Rotating Featured Quizzes Section (Wired later) */}
<section className="py-20 bg-gradient-to-br from-blue-100 via-white to-green-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
      Try a Quiz — No Signup Needed
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((_, i) => (
        <div
          key={i}
          className="bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-transform cursor-pointer text-center"
          onClick={() => setShowAuthModal(true)}
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Sample Quiz #{i + 1}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            A sneak peek into real board-style questions you can start answering in seconds.
          </p>
          <button className="text-sm font-semibold text-blue-700 dark:text-blue-300 underline">Start Free Quiz</button>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">15,000+</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Practice Questions</div>
            </div>
            <div className="text-center bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">95%</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Pass Rate Improvement</div>
            </div>
            <div className="text-center bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">10,000+</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Students Enrolled</div>
            </div>
            <div className="text-center bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Study Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Medical Specialty Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <SectionSeparator title="Medical Specialties" icon={Microscope} color="purple" />

          <div className="text-center mb-16">
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose from our comprehensive collection of specialty-focused quizzes designed by medical experts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialties.map((specialty, index) => {
              const IconComponent = specialty.icon;
              return (
                <div key={index} className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 min-h-[280px]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${getColorClasses(specialty.color)}`}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{specialty.name}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getColorClasses(specialty.color)}`}>
                          {specialty.count} questions
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                    {specialty.description}
                  </p>
                  <a 
                    href="/quiz"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 block text-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Start Quiz
                  </a>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-16">
            <a 
              href="/quiz"
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View All Specialties
            </a>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <SectionSeparator title="Why Choose Us" icon={Award} color="blue" />

          <div className="text-center mb-16">
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              This is more than a quiz app. It’s your all-in-one medical education companion — built by physicians to centralize your progress, connect you to a like-minded community, and provide seamless access across disciplines and training sites. Whether you're rotating across hospitals or preparing for boards, we’ve got your back — every step of the way.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 min-h-[300px]">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${getColorClasses(feature.color)}`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Medical Students Say</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join thousands of successful medical students and professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 min-h-[250px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/90 mb-6 italic text-lg leading-relaxed">
                  "MedEdLMS Pro helped me identify my weak areas in immunology. The explanations are clear and the questions are challenging but fair."
                </p>
              </div>
              <div>
                <div className="font-semibold text-white text-lg">Sarah M.</div>
                <div className="text-blue-200 text-sm">3rd Year Medical Student</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 min-h-[250px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/90 mb-6 italic text-lg leading-relaxed">
                  "The progress tracking feature is amazing. I can see exactly which topics I need to focus on before my board exams."
                </p>
              </div>
              <div>
                <div className="font-semibold text-white text-lg">Alex R.</div>
                <div className="text-blue-200 text-sm">4th Year Medical Student</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <SectionSeparator title="Choose Your Plan" icon={Target} color="green" />

          <div className="text-center mb-16">
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Access to the most comprehensive tutoring medical education question bank available. Start free and upgrade when ready.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 text-center min-h-[500px] flex flex-col">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Free</h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$0</div>
              <div className="text-gray-600 dark:text-gray-400 mb-6">per month</div>
              <ul className="text-left space-y-3 mb-8 flex-1">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  5 quiz attempts per day
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Basic progress tracking
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Limited topic access
                </li>
                <li className="flex items-center">
                  <span className="text-gray-400 mr-3">❌</span>
                  <span className="text-gray-400">Full question bank</span>
                </li>
              </ul>
              <a 
                href="/quiz"
                className="w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors block text-center"
              >
                Try Free Quiz
              </a>
            </div>

            {/* Pro Plan */}
            <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border-2 border-blue-500 dark:border-blue-400 shadow-2xl dark:shadow-yellow-500/40 transform scale-105 relative min-h-[500px] flex flex-col">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$49.99</div>
              <div className="text-gray-600 dark:text-gray-400 mb-6">per month</div>
              <ul className="text-left space-y-3 mb-8 flex-1">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Unlimited quiz attempts
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  All 15,000+ questions
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  All medical specialties
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Detailed explanations
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Performance analytics
                </li>
              </ul>
              <button 
                onClick={async () => {
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
                        priceId: 'price_1RqE1PEbNlb7nCbs0las6NY5', // Your Pro price ID
                        userId: user.uid,
                      }),
                    });
                    
                    const session = await response.json();
                    
                    if (session.sessionId) {
                      const { stripePromise } = await import('../lib/stripe');
                      const stripe = await stripePromise;
                      
                      const result = await stripe.redirectToCheckout({
                        sessionId: session.sessionId,
                      });
                      
                      if (result.error) {
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
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {user ? 'Subscribe for $49.99/month' : 'Sign Up to Subscribe'}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white/70 dark:bg-gray-800/70 dark:shadow-yellow-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-yellow-500/30 shadow-lg hover:shadow-xl dark:hover:shadow-yellow-500/40 transition-all duration-300 text-center min-h-[500px] flex flex-col">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Premium</h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$99</div>
              <div className="text-gray-600 dark:text-gray-400 mb-6">per month</div>
              <ul className="text-left space-y-3 mb-8 flex-1">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Everything in Pro
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Etutor smart tutoring sessions
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Custom study plans
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Priority support
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Exam prep courses
                </li>
              </ul>
              <button 
                onClick={async () => {
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
                        priceId: 'price_1RqE4NEbNlb7nCbsKLwEcd3a', // Your Premium price ID
                        userId: user.uid,
                      }),
                    });
                    
                    const session = await response.json();
                    
                    if (session.sessionId) {
                      const { stripePromise } = await import('../lib/stripe');
                      const stripe = await stripePromise;
                      
                      await stripe.redirectToCheckout({
                        sessionId: session.sessionId,
                      });
                    }
                  } catch (error) {
                    console.error('Payment error:', error);
                    alert('Payment setup error. Please try again.');
                  }
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {user ? 'Subscribe for $99.00/month' : 'Sign Up to Subscribe'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Access 15,000+ expert-crafted questions covering your whole medical eduction training...?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of medical students, residents, mastering their exams with the most comprehensive question bank available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/quiz"
              className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Free Trial Now 🧠
            </a>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="border-2 border-white text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Create Account
            </button>
          </div>
          <div className="mt-8 text-blue-200 text-sm">
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