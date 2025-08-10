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
  FileText,
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

  // ✅ Enhanced Stripe handlers
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
      title: 'Why It\'s Worth the Monthly Investment',
      description: '🔁 Centralized Progress: Track every quiz, note, and resource — no matter what rotation or hospital you\'re in.',
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: '🌎 Cross-Institutional Access',
      description: 'Your LMS isn\'t tied to one school — it follows you, not your program. 🧑‍⚕️ Built for All Levels: Medical students, residents, and attendings can all find value here — whether studying or teaching.',
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
      red: 'text-red-900 bg-red-50 border-red-200',
      purple: 'text-purple-900 bg-purple-50 border-purple-200',
      blue: 'text-blue-900 bg-blue-50 border-blue-200',
      green: 'text-emerald-900 bg-emerald-50 border-emerald-200',
      yellow: 'text-yellow-900 bg-yellow-50 border-yellow-200',
      pink: 'text-pink-900 bg-pink-50 border-pink-200',
      orange: 'text-orange-900 bg-orange-50 border-orange-200',
      indigo: 'text-indigo-900 bg-indigo-50 border-indigo-200'
    };
    return colorMap[color] || 'text-gray-900 bg-gray-50 border-gray-200';
  };

  // Enhanced Section Separator Component with medical-themed styling
  const SectionSeparator = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
    <div className="relative my-20">
      {/* Animated starfield background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
      </div>
      
      {/* Medical-themed decorative lines */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400/80 via-pink-400/60 via-cyan-400/80 to-transparent"></div>
      </div>
      
      {/* Center element with medical decorations */}
      <div className="relative flex justify-center">
        <div className="medical-title px-12 py-8 bg-gradient-to-br from-white/95 to-cyan-50/95 backdrop-blur-xl rounded-3xl border border-cyan-400/40 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-400/50 transition-all duration-500 hover:scale-105">
          {/* DNA Helix decoration */}
          <div className="dna-helix"></div>
          
          {/* Medical cross decorations */}
          <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-pink-500 text-2xl animate-pulse">⚕️</div>
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-cyan-500 text-2xl animate-pulse">🩺</div>
          
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${getColorClasses(color)} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 glow-effect`}>
              <Icon className="h-8 w-8" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              ⭐ ━━━ {title} ━━━ ⭐
            </h2>
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
      icon: FileText,
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
      description: 'Get visual insights into what topics you\'ve mastered and what needs work.'
    },
    {
      icon: UserCog,
      title: 'Custom Learning Profile',
      description: 'Personalize your dashboard, themes, and study goals across your career journey.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 relative overflow-hidden">
      {/* Animated background stars */}
      <div className="fixed inset-0 z-0">
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
      </div>
      
      {/* Custom CSS for stars and glowing effects */}
      <style jsx>{`
        .stars-small {
          background-image: radial-gradient(2px 2px at 20px 30px, #fff, transparent),
                           radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.9), transparent),
                           radial-gradient(1px 1px at 90px 40px, #fff, transparent),
                           radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.7), transparent),
                           radial-gradient(2px 2px at 160px 30px, #fff, transparent);
          background-repeat: repeat;
          background-size: 200px 100px;
          animation: stars-move 20s linear infinite;
        }
        
        .stars-medium {
          background-image: radial-gradient(3px 3px at 30px 40px, rgba(0,255,255,1), transparent),
                           radial-gradient(2px 2px at 80px 20px, rgba(255,255,255,1), transparent),
                           radial-gradient(3px 3px at 120px 90px, rgba(255,0,255,0.8), transparent);
          background-repeat: repeat;
          background-size: 300px 200px;
          animation: stars-move 30s linear infinite reverse;
        }
        
        .stars-large {
          background-image: radial-gradient(4px 4px at 50px 60px, rgba(0,255,255,1), transparent),
                           radial-gradient(3px 3px at 150px 30px, rgba(255,255,255,1), transparent),
                           radial-gradient(5px 5px at 200px 100px, rgba(255,0,255,0.9), transparent);
          background-repeat: repeat;
          background-size: 400px 300px;
          animation: stars-move 40s linear infinite;
        }
        
        @keyframes stars-move {
          from { transform: translateY(0px); }
          to { transform: translateY(-200px); }
        }
        
        .glow-effect {
          box-shadow: 0 0 25px rgba(0, 255, 255, 0.5);
          animation: glow-pulse 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow-pulse {
          from { box-shadow: 0 0 25px rgba(0, 255, 255, 0.5); }
          to { box-shadow: 0 0 40px rgba(0, 255, 255, 0.8); }
        }
        
        .futuristic-tile {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(99, 102, 241, 0.3);
          transition: all 0.4s ease;
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.1);
        }
        
        .futuristic-tile:hover {
          transform: translateY(-10px) scale(1.02);
          border-color: rgba(99, 102, 241, 0.6);
          box-shadow: 0 25px 50px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 1);
        }
        
        .sparkle-icon {
          position: relative;
          display: inline-block;
        }
        
        .sparkle-icon::before,
        .sparkle-icon::after {
          content: '✨';
          position: absolute;
          animation: sparkle 2s ease-in-out infinite;
          font-size: 0.8em;
          opacity: 0.7;
        }
        
        .sparkle-icon::before {
          top: -8px;
          right: -8px;
          animation-delay: 0s;
        }
        
        .sparkle-icon::after {
          bottom: -8px;
          left: -8px;
          animation-delay: 1s;
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        .neon-border {
          border: 2px solid transparent;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)) padding-box,
                      linear-gradient(45deg, #00ffff, #0080ff, #8000ff, #ff0080, #ff8000, #ffff00, #00ff80, #00ffff) border-box;
          animation: neon-rotate 3s linear infinite;
        }
        
        @keyframes neon-rotate {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        
        .medical-title {
          position: relative;
          display: inline-block;
        }
        
        .medical-title::before,
        .medical-title::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 100px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00ffff, #ff0080, #00ffff, transparent);
          animation: pulse-line 2s ease-in-out infinite;
        }
        
        .medical-title::before {
          left: -120px;
        }
        
        .medical-title::after {
          right: -120px;
          animation-delay: 0.5s;
        }
        
        @keyframes pulse-line {
          0%, 100% { opacity: 0.5; transform: translateY(-50%) scale(1); }
          50% { opacity: 1; transform: translateY(-50%) scale(1.1); }
        }
        
        .dna-helix {
          position: absolute;
          left: -150px;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 60px;
          animation: rotate-dna 3s linear infinite;
        }
        
        .dna-helix::before,
        .dna-helix::after {
          content: '';
          position: absolute;
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, #00ffff, #ff0080, #00ffff);
          border-radius: 2px;
        }
        
        .dna-helix::before {
          left: 0;
          animation: wave1 2s ease-in-out infinite;
        }
        
        .dna-helix::after {
          right: 0;
          animation: wave2 2s ease-in-out infinite;
        }
        
        @keyframes rotate-dna {
          0% { transform: translateY(-50%) rotateY(0deg); }
          100% { transform: translateY(-50%) rotateY(360deg); }
        }
        
        @keyframes wave1 {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.2); }
        }
        
        @keyframes wave2 {
          0%, 100% { transform: scaleY(1.2); }
          50% { transform: scaleY(1); }
        }
      `}</style>
      
      {/* ✅ ADDED: Homepage Header */}
      <Header 
        onSignInClick={handleSignInClick}
        onSignUpClick={handleSignUpClick}
      />

      {/* Enhanced Hero Section with Books Background */}
      <section className="relative overflow-hidden min-h-screen lg:min-h-screen flex items-center z-10">
        {/* Books Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{
            backgroundImage: 'url(/books.webp)',
          }}
        ></div>
        
        {/* Lighter Gradient Overlay for Better Image Visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-indigo-900/30"></div>
        
        {/* Floating badges - Enhanced futuristic styling */}
        <div className="hidden lg:block absolute top-6 left-1/2 transform -translate-x-1/2 bg-yellow-300 text-slate-900 px-8 py-4 rounded-full font-bold text-lg shadow-2xl shadow-yellow-500/50 z-20 glow-effect">
         🩺 Master Every Stage of Your Medical Training — All in One Place
        </div>
        <div className="hidden lg:block absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white text-blue-900 px-8 py-4 rounded-full font-semibold text-lg shadow-2xl shadow-blue-500/50 border border-yellow-400/50 z-20">
          🧠 AI-Powered Smart Learning
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 text-center z-10">
          <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
            <div className="space-y-4 lg:space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-yellow-300 drop-shadow-2xl">
                Medical Education LMS
                <span className="block text-white drop-shadow-2xl">Supporting our doctors of the future</span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-white leading-relaxed max-w-3xl mx-auto drop-shadow-xl bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-300/30">
                From med school to residency, fellowship and beyond, streamline your learning, stay connected across institutions, and easily pass your in school exams with AI-powered quizzes, smart analytics, and real clinical tools.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center">
              <a 
                href="/quiz" 
                className="px-8 py-4 lg:px-10 lg:py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-2xl text-lg lg:text-xl hover:from-yellow-300 hover:to-orange-400 transition-all transform hover:scale-105 shadow-2xl shadow-yellow-500/50 flex items-center justify-center gap-3 min-h-[48px] glow-effect"
              >
                Try Free Quiz Now 🧠
                <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </a>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-4 lg:px-10 lg:py-5 border-2 border-cyan-400 bg-gradient-to-r from-slate-800/50 to-blue-900/50 text-cyan-400 font-semibold rounded-2xl text-lg lg:text-xl hover:bg-gradient-to-r hover:from-cyan-400/20 hover:to-blue-400/20 transition-all shadow-2xl shadow-cyan-500/30 min-h-[48px] backdrop-blur-sm"
              >
                Sign Up Free
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 lg:gap-8 text-base lg:text-lg">
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

      {/* 🔐 Subscription Benefits Section - Solid background */}
      <section className="py-20 relative z-10 bg-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-center mb-16 text-slate-900">
            🩺 ⭐ ━━━ Features to support your daily medical education journey ━━━ ⭐ 🧠
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {subscriptionBenefits.map(({ icon: Icon, title, description }, i) => (
              <div
                key={i}
                className="futuristic-tile rounded-3xl p-8 text-center group"
              >
                <div className="flex justify-center mb-6">
                  <div className="sparkle-icon p-6 rounded-3xl bg-indigo-500 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 glow-effect">
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
    
      <section className="py-20 relative z-10 bg-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-center mb-16 text-slate-900">
            🧠 ⚡ ━━━ Quizzes that Teach and Test - Each quiz is a complete mini Course ━━━ ⚡ 📚
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }, i) => (
              <div
                key={i}
                className="futuristic-tile rounded-3xl p-8 text-center group"
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

      {/* 🔄 Rotating Featured Quizzes Section */}
      <section className="py-20 relative z-10 bg-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-center mb-16 text-slate-900">
            🚀 ⭐ ━━━ Try a Quiz — No Signup Needed ━━━ ⭐ 🎯
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((_, i) => (
              <div
                key={i}
                className="futuristic-tile rounded-2xl p-6 text-center group cursor-pointer"
                onClick={() => setShowAuthModal(true)}
              >
                <div className="sparkle-icon flex justify-center mb-4">
                  <div className="p-4 rounded-2xl bg-purple-500 text-white shadow-lg">
                    <BookOpen className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Sample Quiz #{i + 1}</h3>
                <p className="text-slate-800 text-sm mb-6">
                  A sneak peek into real board-style questions you can start answering in seconds.
                </p>
                <button className="text-sm font-semibold text-purple-800 hover:text-purple-900 underline transition-colors">
                  Start Free Quiz
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced design */}
      <section className="py-20 relative z-10 bg-indigo-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900">
              📊 ⚡ ━━━ Our Impact on Medical Education ━━━ ⚡ 🏆
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center futuristic-tile rounded-3xl p-8 group">
              <div className="sparkle-icon flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-cyan-500 text-white">
                  <BookOpen className="w-8 h-8" />
                </div>
              </div>
              <div className="text-5xl font-bold text-cyan-800 mb-3">15,000+</div>
              <div className="text-slate-900 font-semibold">Practice Questions</div>
            </div>
            <div className="text-center futuristic-tile rounded-3xl p-8 group">
              <div className="sparkle-icon flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-emerald-500 text-white">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
              <div className="text-5xl font-bold text-emerald-800 mb-3">95%</div>
              <div className="text-slate-900 font-semibold">Pass Rate Improvement</div>
            </div>
            <div className="text-center futuristic-tile rounded-3xl p-8 group">
              <div className="sparkle-icon flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-purple-500 text-white">
                  <Users className="w-8 h-8" />
                </div>
              </div>
              <div className="text-5xl font-bold text-purple-800 mb-3">10,000+</div>
              <div className="text-slate-900 font-semibold">Students Enrolled</div>
            </div>
            <div className="text-center futuristic-tile rounded-3xl p-8 group">
              <div className="sparkle-icon flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-yellow-500 text-white">
                  <Zap className="w-8 h-8" />
                </div>
              </div>
              <div className="text-5xl font-bold text-yellow-800 mb-3">24/7</div>
              <div className="text-slate-900 font-semibold">Study Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Medical Specialty Section */}
      <section className="py-20 relative z-10 bg-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <SectionSeparator title="Medical Specialties" icon={Microscope} color="purple" />

          <div className="text-center mb-16">
            <p className="text-xl text-slate-900 max-w-3xl mx-auto bg-white rounded-2xl p-6 border border-indigo-300 shadow-lg">
              Choose from our comprehensive collection of specialty-focused quizzes designed by medical experts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialties.map((specialty, index) => {
              const IconComponent = specialty.icon;
              return (
                <div key={index} className="futuristic-tile rounded-3xl p-8 min-h-[320px] group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`sparkle-icon p-4 rounded-2xl ${getColorClasses(specialty.color)} shadow-lg group-hover:scale-110 transition-all duration-300`}>
                        <IconComponent className="h-10 w-10" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{specialty.name}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getColorClasses(specialty.color)} border-2`}>
                          {specialty.count} questions
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-900 text-sm leading-relaxed mb-6">
                    {specialty.description}
                  </p>
                  <a 
                    href="/quiz"
                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-2xl font-semibold hover:bg-indigo-700 transition-all duration-300 block text-center shadow-lg hover:shadow-xl transform hover:scale-105"
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
              className="px-12 py-4 bg-indigo-600 text-white font-bold rounded-3xl text-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 glow-effect"
            >
              View All Specialties
            </a>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 relative z-10 bg-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <SectionSeparator title="Why Choose Us" icon={Award} color="blue" />

          <div className="text-center mb-16">
            <p className="text-xl text-slate-900 max-w-4xl mx-auto bg-white rounded-2xl p-6 border border-purple-300 shadow-lg">
              This is more than a quiz app. It's your all-in-one medical education companion — built by physicians to centralize your progress, connect you to a like-minded community, and provide seamless access across disciplines and training sites.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="futuristic-tile rounded-3xl p-8 min-h-[320px] group">
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

      {/* Enhanced Testimonials */}
      <section className="py-20 bg-indigo-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 text-slate-900">
              🩺 ⭐ ━━━ What Medical Students Say ━━━ ⭐ 👩‍⚕️
            </h2>
            <p className="text-xl text-slate-900 max-w-3xl mx-auto">
              Join thousands of successful medical students and professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="futuristic-tile rounded-3xl p-8 min-h-[280px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-slate-900 mb-6 italic text-lg leading-relaxed font-medium">
                  "MedEdLMS Pro helped me identify my weak areas in immunology. The explanations are clear and the questions are challenging but fair."
                </p>
              </div>
              <div>
                <div className="font-bold text-indigo-800 text-lg">Sarah M.</div>
                <div className="text-slate-800 text-sm font-medium">3rd Year Medical Student</div>
              </div>
            </div>

            <div className="futuristic-tile rounded-3xl p-8 min-h-[280px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-slate-900 mb-6 italic text-lg leading-relaxed font-medium">
                  "The progress tracking feature is amazing. I can see exactly which topics I need to focus on before my board exams."
                </p>
              </div>
              <div>
                <div className="font-bold text-indigo-800 text-lg">Alex R.</div>
                <div className="text-slate-800 text-sm font-medium">4th Year Medical Student</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section with Working Stripe Integration */}
      <section className="py-20 relative z-10 bg-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <SectionSeparator title="Choose Your Plan" icon={Target} color="green" />

          <div className="text-center mb-16">
            <p className="text-xl text-slate-900 max-w-3xl mx-auto bg-white rounded-2xl p-6 border border-blue-300 shadow-lg">
              Access to the most comprehensive medical education question bank available. Start free and upgrade when ready.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="futuristic-tile rounded-3xl p-8 text-center min-h-[600px] flex flex-col">
              <div className="sparkle-icon flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-gray-500 text-white">
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
                className="w-full bg-gray-600 text-white py-4 rounded-2xl font-semibold hover:bg-gray-700 transition-all duration-300 block text-center shadow-lg"
              >
                Try Free Quiz
              </a>
            </div>

            {/* Pro Plan - Enhanced with border */}
            <div className="futuristic-tile rounded-3xl p-8 text-center min-h-[600px] flex flex-col relative transform scale-105 border-4 border-indigo-500">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg">
                Most Popular
              </div>
              <div className="sparkle-icon flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-indigo-600 text-white">
                  <Award className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-indigo-900">Pro</h3>
              <div className="text-5xl font-bold text-indigo-800 mb-2">$49.99</div>
              <div className="text-slate-800 mb-8 font-medium">per month</div>
              <ul className="text-left space-y-4 mb-8 flex-1">
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">Unlimited quiz attempts</span>
                </li>
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">All 15,000+ questions</span>
                </li>
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">All medical specialties</span>
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
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 glow-effect"
              >
                {user ? 'Subscribe for $49.99/month' : 'Sign Up to Subscribe'}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="futuristic-tile rounded-3xl p-8 text-center min-h-[600px] flex flex-col">
              <div className="sparkle-icon flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-purple-600 text-white">
                  <Star className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-purple-900">Premium</h3>
              <div className="text-5xl font-bold text-purple-800 mb-2">$99</div>
              <div className="text-slate-800 mb-8 font-medium">per month</div>
              <ul className="text-left space-y-4 mb-8 flex-1">
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">Everything in Pro</span>
                </li>
                <li className="flex items-center">
                  <span className="text-emerald-700 mr-3 text-xl">✅</span>
                  <span className="text-slate-900 font-medium">AI tutor smart tutoring sessions</span>
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
                className="w-full bg-purple-600 text-white py-4 rounded-2xl font-semibold hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {user ? 'Subscribe for $99.00/month' : 'Sign Up to Subscribe'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="bg-purple-100 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold mb-6 text-slate-900">
            Ready to Access 15,000+ expert-crafted questions covering your whole medical education training...?
          </h2>
          <p className="text-xl text-slate-900 mb-8 leading-relaxed font-medium">
            Join thousands of medical students, residents, mastering their exams with the most comprehensive question bank available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/quiz"
              className="bg-yellow-500 text-slate-900 px-10 py-5 rounded-3xl text-lg font-bold hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-lg glow-effect"
            >
              Start Free Trial Now 🧠
            </a>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="border-4 border-indigo-600 bg-white text-indigo-900 px-10 py-5 rounded-3xl text-lg font-bold hover:bg-indigo-50 transition-all"
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