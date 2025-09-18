'use client';

import React, { useState } from 'react';
import {
  Medal,
  Clock,
  Calendar,
  Award,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Video,
  Users,
  FileText,
  Download,
  Star,
  TrendingUp,
  Shield,
  Globe,
  Briefcase,
  Target,
  GraduationCap,
  Lock
} from 'lucide-react';
import Link from 'next/link';

interface CMEProvider {
  id: string;
  name: string;
  logo?: string;
  description: string;
  credits: string;
  url: string;
  accreditation: string[];
  specialties: string[];
  free: boolean;
}

const CMECredits = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // External CME providers - partnerships in the future
  const cmeProviders: CMEProvider[] = [
    {
      id: '1',
      name: 'ACCME',
      description: 'Accreditation Council for Continuing Medical Education',
      credits: 'Variable',
      url: 'https://www.accme.org',
      accreditation: ['AMA PRA Category 1'],
      specialties: ['All Specialties'],
      free: false
    },
    {
      id: '2',
      name: 'Medscape Education',
      description: 'Free CME courses across multiple specialties',
      credits: '0.25 - 10',
      url: 'https://www.medscape.org/education',
      accreditation: ['AMA PRA Category 1', 'AAFP', 'AANP'],
      specialties: ['Internal Medicine', 'Family Medicine', 'Pediatrics', 'Surgery'],
      free: true
    },
    {
      id: '3',
      name: 'Mayo Clinic',
      description: 'Mayo Clinic School of Continuous Professional Development',
      credits: '1 - 50',
      url: 'https://ce.mayo.edu',
      accreditation: ['AMA PRA Category 1', 'ANCC', 'ACPE'],
      specialties: ['All Specialties'],
      free: false
    },
    {
      id: '4',
      name: 'Harvard Medical School CME',
      description: 'Continuing education from Harvard Medical School',
      credits: '5 - 75',
      url: 'https://cmecatalog.hms.harvard.edu',
      accreditation: ['AMA PRA Category 1'],
      specialties: ['All Specialties'],
      free: false
    },
    {
      id: '5',
      name: 'CDC Learning Connection',
      description: 'Free public health and clinical CME',
      credits: '1 - 8',
      url: 'https://www.cdc.gov/learning',
      accreditation: ['AMA PRA Category 1', 'CNE', 'CEU'],
      specialties: ['Public Health', 'Infectious Disease', 'Prevention'],
      free: true
    },
    {
      id: '6',
      name: 'NEJM Knowledge+',
      description: 'Adaptive learning for Internal Medicine',
      credits: '150',
      url: 'https://knowledgeplus.nejm.org',
      accreditation: ['AMA PRA Category 1', 'ABIM MOC'],
      specialties: ['Internal Medicine'],
      free: false
    }
  ];

  const specialties = [
    'All Specialties',
    'Internal Medicine',
    'Family Medicine',
    'Pediatrics',
    'Surgery',
    'Emergency Medicine',
    'Psychiatry',
    'Anesthesiology',
    'Radiology',
    'Pathology',
    'Public Health'
  ];

  const cmeTypes = [
    { id: 'all', label: 'All Types', icon: BookOpen },
    { id: 'online', label: 'Online Courses', icon: Globe },
    { id: 'live', label: 'Live Events', icon: Users },
    { id: 'journal', label: 'Journal-Based', icon: FileText },
    { id: 'conference', label: 'Conferences', icon: Briefcase }
  ];

  return (
    <div className="min-h-screen bg-[#f0f7ff]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#07294d] mb-2">CME Credits & Continuing Education</h1>
              <p className="text-gray-600">Maintain your medical license with accredited continuing education</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Your CME Status</p>
              <p className="text-2xl font-bold text-green-600">On Track ✓</p>
            </div>
          </div>
        </div>

        {/* CME Tracker Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Credits Earned</p>
                <p className="text-2xl font-bold text-gray-900">32.5</p>
                <p className="text-xs text-gray-500">This Year</p>
              </div>
              <Medal className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Required</p>
                <p className="text-2xl font-bold text-gray-900">50</p>
                <p className="text-xs text-gray-500">Annual</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-gray-900">17.5</p>
                <p className="text-xs text-gray-500">To Complete</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Deadline</p>
                <p className="text-2xl font-bold text-gray-900">Dec 31</p>
                <p className="text-xs text-gray-500">2024</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">🎓 Native CME Courses Coming Soon!</h2>
              <p className="text-blue-100">
                We're working on accreditation to offer CME credits directly through our platform. 
                For now, explore these trusted external providers for your continuing education needs.
              </p>
              <div className="mt-3 flex items-center gap-4">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  Target Launch: Q2 2025
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  AMA PRA Category 1 Credits™
                </span>
              </div>
            </div>
            <Shield className="w-12 h-12 text-white/50" />
          </div>
        </div>

        {/* Filter Options */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              {cmeTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      selectedType === type.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* External CME Providers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {cmeProviders.map(provider => (
            <div key={provider.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{provider.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{provider.description}</p>
                  </div>
                  {provider.free && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      FREE
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Medal className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700">Credits: {provider.credits}</span>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <span className="text-gray-700">Accreditation:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {provider.accreditation.map(acc => (
                          <span key={acc} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {acc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-purple-500 mt-0.5" />
                    <div>
                      <span className="text-gray-700">Specialties:</span>
                      <p className="text-xs text-gray-600 mt-0.5">{provider.specialties.join(', ')}</p>
                    </div>
                  </div>
                </div>
                
                <a
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  Visit Provider
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Internal CME Features (Coming Soon) */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Coming Soon: Integrated CME Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Video className="w-8 h-8 text-gray-400 mb-2" />
              <h4 className="font-medium text-gray-700 mb-1">Video Courses</h4>
              <p className="text-xs text-gray-600">High-quality video lectures from expert physicians</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FileText className="w-8 h-8 text-gray-400 mb-2" />
              <h4 className="font-medium text-gray-700 mb-1">Case Studies</h4>
              <p className="text-xs text-gray-600">Interactive case-based learning with CME credits</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Users className="w-8 h-8 text-gray-400 mb-2" />
              <h4 className="font-medium text-gray-700 mb-1">Grand Rounds</h4>
              <p className="text-xs text-gray-600">Virtual grand rounds from leading institutions</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Download className="w-8 h-8 text-gray-400 mb-2" />
              <h4 className="font-medium text-gray-700 mb-1">Certificates</h4>
              <p className="text-xs text-gray-600">Automatic certificate generation and tracking</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Want to be notified when CME courses launch?</h4>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Join our waitlist to get early access and special launch pricing for CME courses.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Join CME Waitlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMECredits;