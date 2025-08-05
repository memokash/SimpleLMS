"use client";

import React, { useState } from 'react';
import { useAuth } from './components/AuthContext';
import AuthModal from './components/AuthModal';
import { ArrowRight, Users, TrendingUp, Star, CheckCircle } from 'lucide-react';
import Header from './components/Header';  

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
    { name: 'Cardiology', count: 250, color: 'bg-red-100 text-red-700', icon: '❤️' },
    { name: 'Neurology', count: 180, color: 'bg-purple-100 text-purple-700', icon: '🧠' },
    { name: 'Immunology', count: 220, color: 'bg-blue-100 text-blue-700', icon: '🛡️' },
    { name: 'Pathology', count: 190, color: 'bg-green-100 text-green-700', icon: '🔬' },
    { name: 'Pharmacology', count: 160, color: 'bg-yellow-100 text-yellow-700', icon: '💊' },
    { name: 'Anatomy', count: 200, color: 'bg-pink-100 text-pink-700', icon: '🦴' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
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
          🏆 #1 Medical Quiz Platform
        </div>
        <div className="hidden lg:block absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-lg text-blue-900 px-6 py-3 rounded-full font-semibold text-base shadow-2xl z-10">
          💡 AI-Powered Learning
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 text-center text-white">
          <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
            <div className="space-y-4 lg:space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-white drop-shadow-2xl">
                Master Medical School
                <span className="block text-yellow-300 drop-shadow-2xl">With Smart Quizzes</span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-100 leading-relaxed max-w-3xl mx-auto drop-shadow-xl">
                Practice with expert-crafted questions covering your whole school syllabus, pathology, and more. 
                Track your progress and pass your medical school exams with confidence.
              </p>
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
                <span className="drop-shadow-xl text-gray-100">15,000+ Questions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">15,000+</div>
              <div className="text-gray-600 font-medium">Practice Questions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600 font-medium">Pass Rate Improvement</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">10,000+</div>
              <div className="text-gray-600 font-medium">Students Enrolled</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Study Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Medical Specialty Section */}
      <section id="specialties" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse by Medical Specialty</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our comprehensive collection of specialty-focused quizzes designed by medical experts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.map((specialty, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{specialty.icon}</span>
                    <h3 className="text-xl font-bold text-gray-900">{specialty.name}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${specialty.color}`}>
                    {specialty.count} questions
                  </span>
                </div>
                <a 
                  href="/quiz"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors block text-center"
                >
                  Start Quiz
                </a>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a 
              href="/quiz"
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              View All Specialties
            </a>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Medical Students Choose MedicalSchoolQuizzes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Created by physicians, fellows, and actual exam writers, our question bank is designed to support medical students as they progress through their syllabus, not just for boards prep.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4 text-2xl">
                📚
              </div>
              <h3 className="text-xl font-semibold mb-3">15,000+ Expert Questions</h3>
              <p className="text-gray-600">
                Focused quizzes help you stay on track, reinforce core concepts, and help you avoid falling behind — especially during those critical monthly and bimonthly assessments that determine academic standing.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Analytics</h3>
              <p className="text-gray-600">
                Monitor your performance across different topics and identify areas that need more focus before your exams with smart recommendations.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-full mb-4 text-2xl">
                ⚡
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Feedback</h3>
              <p className="text-gray-600">
                Get immediate explanations for correct and incorrect answers to reinforce learning and improve retention.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 text-white rounded-full mb-4 text-2xl">
                📱
              </div>
              <h3 className="text-xl font-semibold mb-3">Study Anywhere</h3>
              <p className="text-gray-600">
                Access your quizzes on any device - phone, tablet, or computer. Study during commutes or breaks.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-red-50 hover:bg-red-100 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full mb-4 text-2xl">
                🎯
              </div>
              <h3 className="text-xl font-semibold mb-3">Exam-Focused</h3>
              <p className="text-gray-600">
                Questions mirror the style and difficulty of actual medical school exams and board certifications.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-full mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Support</h3>
              <p className="text-gray-600">
                Connect with other medical students, share study tips, and collaborate on challenging topics.
              </p>
            </div>
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
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/90 mb-4 italic">
                "MedQuiz Pro helped me identify my weak areas in immunology. The explanations are clear and the questions are challenging but fair."
              </p>
              <div>
                <div className="font-semibold text-white">Sarah M.</div>
                <div className="text-blue-200 text-sm">3rd Year Medical Student</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/90 mb-4 italic">
                "The progress tracking feature is amazing. I can see exactly which topics I need to focus on before my board exams."
              </p>
              <div>
                <div className="font-semibold text-white">Alex R.</div>
                <div className="text-blue-200 text-sm">4th Year Medical Student</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Study Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access to the most comprehensive medical question bank available. Start free and upgrade when ready.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="border-2 border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 transition-all hover:shadow-lg bg-white">
              <h3 className="text-2xl font-bold mb-4">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
              <div className="text-gray-600 mb-6">per month</div>
              <ul className="text-left space-y-3 mb-8">
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
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors block text-center"
              >
                Try Free Quiz
              </a>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-blue-500 rounded-xl p-8 text-center relative bg-white transform scale-105 shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$49.99</div>
              <div className="text-gray-600 mb-6">per month</div>
              <ul className="text-left space-y-3 mb-8">
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
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {user ? 'Subscribe for $49.99/month' : 'Sign Up to Subscribe'}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="border-2 border-gray-200 rounded-xl p-8 text-center hover:border-purple-300 transition-all hover:shadow-lg bg-white">
              <h3 className="text-2xl font-bold mb-4">Premium</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$99</div>
              <div className="text-gray-600 mb-6">per month</div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Everything in Pro
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  1-on-1 tutoring sessions
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
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
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
            Ready to Access 15,000+ Medical Questions?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of medical students mastering their exams with the most comprehensive question bank available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/quiz"
              className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg text-lg font-bold hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Free Trial Now 🧠
            </a>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
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