import React from 'react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                🏥 MedQuiz Pro
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">Features</a>
                <a href="#pricing" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">Pricing</a>
                <a href="/quiz" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">Try Quiz</a>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Master Medical School
              <span className="text-blue-600 block">With Smart Quizzes</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Practice with expert-crafted questions covering immunology, pathology, and more. 
              Track your progress and ace your medical school exams with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/quiz" 
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Try Free Quiz Now 🚀
              </a>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
                Watch Demo
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">✅ No credit card required • ✅ Instant access</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Medical Students Choose MedQuiz Pro
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built by medical professionals for medical students. Every question is carefully crafted to match exam standards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl">
                🧠
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert-Crafted Questions</h3>
              <p className="text-gray-600">
                Every quiz question is developed by practicing physicians and medical educators to ensure accuracy and relevance.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl">
                📊
              </div>
              <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
              <p className="text-gray-600">
                Monitor your performance across different topics and identify areas that need more focus before your exams.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl">
                ⚡
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Feedback</h3>
              <p className="text-gray-600">
                Get immediate explanations for correct and incorrect answers to reinforce learning and improve retention.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl">
                📱
              </div>
              <h3 className="text-xl font-semibold mb-3">Study Anywhere</h3>
              <p className="text-gray-600">
                Access your quizzes on any device - phone, tablet, or computer. Study during commutes or breaks.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-red-50 hover:bg-red-100 transition-colors">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl">
                🎯
              </div>
              <h3 className="text-xl font-semibold mb-3">Exam-Focused</h3>
              <p className="text-gray-600">
                Questions mirror the style and difficulty of actual medical school exams and board certifications.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl">
                👥
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Support</h3>
              <p className="text-gray-600">
                Connect with other medical students, share study tips, and collaborate on challenging topics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8">
              Trusted by Medical Students Worldwide
            </h3>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600">Students Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
                <div className="text-gray-600">Pass Rate Improvement</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-gray-600">Practice Questions</div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="text-yellow-400 text-xl mb-3">⭐⭐⭐⭐⭐</div>
                <p className="text-gray-600 mb-4">
                  "MedQuiz Pro helped me identify my weak areas in immunology. The explanations are clear and the questions are challenging but fair."
                </p>
                <div className="font-semibold text-gray-900">Sarah M.</div>
                <div className="text-sm text-gray-500">3rd Year Medical Student</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="text-yellow-400 text-xl mb-3">⭐⭐⭐⭐⭐</div>
                <p className="text-gray-600 mb-4">
                  "The progress tracking feature is amazing. I can see exactly which topics I need to focus on before my board exams."
                </p>
                <div className="font-semibold text-gray-900">Alex R.</div>
                <div className="text-sm text-gray-500">4th Year Medical Student</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Study Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and upgrade when you're ready. All plans include our core features with different levels of access.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="border-2 border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">
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
                  <span className="text-gray-400">Detailed explanations</span>
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
            <div className="border-2 border-blue-500 rounded-xl p-8 text-center relative bg-blue-50">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$29</div>
              <div className="text-gray-600 mb-6">per month</div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Unlimited quiz attempts
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Advanced progress analytics
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  All topics & specialties
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Detailed explanations
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Performance insights
                </li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Start Pro Trial
              </button>
            </div>

            {/* Premium Plan */}
            <div className="border-2 border-gray-200 rounded-xl p-8 text-center hover:border-purple-300 transition-colors">
              <h3 className="text-2xl font-bold mb-4">Premium</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$59</div>
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
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Go Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Ace Your Medical School Exams?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of medical students who are already improving their scores with MedQuiz Pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/quiz"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Free Quiz Now 🎯
            </a>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              View All Features
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">🏥 MedQuiz Pro</div>
              <p className="text-gray-400">
                Empowering medical students with smart, effective quiz preparation tools.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/quiz" className="hover:text-white transition-colors">Try Quiz</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>&copy; 2025 MedQuiz Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;