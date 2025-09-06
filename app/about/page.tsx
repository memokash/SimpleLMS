'use client';

import { Target, Users, Award, BookOpen, Heart, Lightbulb } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { label: 'Active Students', value: '50,000+' },
    { label: 'Questions Available', value: '10,000+' },
    { label: 'Medical Schools', value: '200+' },
    { label: 'Success Rate', value: '94%' }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Student-Centered',
      description: 'Every feature we build starts with understanding student needs and challenges in medical education.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We maintain the highest standards in content quality, reviewed by medical professionals and educators.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Foster collaboration and peer learning through our community question bank and study groups.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Leverage AI and modern technology to create personalized and effective learning experiences.'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Mitchell',
      role: 'Chief Medical Officer',
      bio: 'MD from Johns Hopkins, 15+ years in medical education'
    },
    {
      name: 'Prof. James Chen',
      role: 'Head of Content',
      bio: 'Former medical school professor, curriculum design expert'
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Clinical Advisor',
      bio: 'Practicing physician, USMLE question writer'
    },
    {
      name: 'Michael Thompson',
      role: 'Head of Technology',
      bio: 'EdTech veteran, AI/ML specialist'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-blue-600 dark:bg-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              About MedicalSchoolQuizzes
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Empowering the next generation of medical professionals through innovative, accessible, and effective learning tools
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="max-w-3xl mx-auto text-center">
            <Target className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              To democratize medical education by providing comprehensive, affordable, and accessible learning resources 
              that help students worldwide succeed in their medical careers. We believe every aspiring healthcare 
              professional deserves the best tools to master complex medical concepts and excel in their examinations.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-50 dark:bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Our Impact
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Our Values
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mb-4">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-white dark:bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Our Story
            </h2>
            <div className="prose prose-lg text-gray-600 dark:text-gray-400 space-y-4">
              <p>
                MedicalSchoolQuizzes was founded in 2020 by a group of medical educators and students who recognized 
                the need for more accessible and effective study tools in medical education.
              </p>
              <p>
                Having experienced the challenges of medical school firsthand, our founders understood that traditional 
                study methods weren't enough. Students needed interactive, engaging, and scientifically-proven learning 
                tools that could adapt to their individual needs.
              </p>
              <p>
                Today, we serve thousands of medical students across the globe, helping them prepare for crucial exams 
                like the USMLE, COMLEX, and medical school coursework. Our AI-powered platform provides personalized 
                learning experiences, detailed explanations, and a supportive community of peers.
              </p>
              <p>
                We continue to innovate and expand our offerings, always guided by our core mission: making quality 
                medical education accessible to everyone, everywhere.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Our Team
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {member.name}
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                {member.role}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 dark:bg-blue-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Community
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Start your journey to medical excellence today with our comprehensive learning platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/courses"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Explore Courses
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}