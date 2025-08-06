"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  Library, 
  BookOpen, 
  Plus,
  Search,
  Filter,
  Star,
  Clock,
  Tag,
  Download,
  ExternalLink,
  FileText,
  Image,
  Video,
  Headphones,
  Upload,
  Edit,
  Trash2,
  Share2,
  Bookmark,
  Eye,
  Calendar,
  User,
  Folder,
  Grid,
  List,
  Archive,
  TrendingUp,
  Award,
  Target,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  RotateCcw
} from 'lucide-react';

interface ReadingResource {
  id: string;
  title: string;
  type: 'article' | 'book' | 'research' | 'video' | 'podcast' | 'document';
  author: string;
  source: string;
  url?: string;
  fileUrl?: string;
  fileName?: string;
  description: string;
  tags: string[];
  specialty: string;
  addedDate: Date;
  lastAccessed?: Date;
  readingProgress: number; // 0-100%
  estimatedReadTime: number; // minutes
  rating?: number;
  notes: string;
  isBookmarked: boolean;
  isFavorite: boolean;
  readingList?: string;
  priority: 'low' | 'medium' | 'high';
}

interface ReadingList {
  id: string;
  name: string;
  description: string;
  resources: string[];
  createdDate: Date;
  color: string;
}

const ReadingResourcesPage = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<ReadingResource[]>([]);
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedReadingList, setSelectedReadingList] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'add' | 'reading-lists'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'progress' | 'rating'>('recent');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with Firebase queries
  useEffect(() => {
    const mockResources: ReadingResource[] = [
      {
        id: '1',
        title: 'Myocardial Infarction: Current Guidelines and Treatment Protocols',
        type: 'article',
        author: 'Dr. Sarah Chen, MD',
        source: 'Journal of Cardiology',
        url: 'https://journalofcardiology.com/mi-guidelines-2025',
        description: 'Comprehensive review of the latest STEMI and NSTEMI management protocols with updated evidence-based recommendations',
        tags: ['Cardiology', 'MI', 'Guidelines', 'Emergency Medicine'],
        specialty: 'Cardiology',
        addedDate: new Date('2025-08-01'),
        lastAccessed: new Date('2025-08-05'),
        readingProgress: 75,
        estimatedReadTime: 45,
        rating: 4.8,
        notes: 'Excellent overview of new troponin criteria. Focus on section 3 for exam prep.',
        isBookmarked: true,
        isFavorite: true,
        readingList: 'Cardiology Essentials',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Harrison\'s Principles of Internal Medicine - Chapter 15',
        type: 'book',
        author: 'Harrison et al.',
        source: 'McGraw-Hill Medical',
        fileUrl: '/documents/harrisons-ch15.pdf',
        fileName: 'Harrisons_Ch15_Diabetes.pdf',
        description: 'Diabetes Mellitus: Diagnosis, Treatment, and Complications',
        tags: ['Diabetes', 'Endocrinology', 'Internal Medicine', 'Textbook'],
        specialty: 'Endocrinology',
        addedDate: new Date('2025-07-28'),
        lastAccessed: new Date('2025-08-03'),
        readingProgress: 45,
        estimatedReadTime: 120,
        rating: 4.9,
        notes: 'Key chapter for understanding T1DM vs T2DM pathophysiology.',
        isBookmarked: false,
        isFavorite: true,
        readingList: 'Board Prep',
        priority: 'high'
      },
      {
        id: '3',
        title: 'COVID-19 Variants and Vaccine Efficacy Study',
        type: 'research',
        author: 'Johnson et al.',
        source: 'New England Journal of Medicine',
        url: 'https://nejm.org/covid-variants-vaccine-2025',
        description: 'Latest research on COVID-19 variant response to current vaccines and booster recommendations',
        tags: ['COVID-19', 'Vaccines', 'Public Health', 'Infectious Disease'],
        specialty: 'Infectious Disease',
        addedDate: new Date('2025-07-30'),
        readingProgress: 0,
        estimatedReadTime: 30,
        notes: '',
        isBookmarked: true,
        isFavorite: false,
        priority: 'medium'
      },
      {
        id: '4',
        title: 'Advanced Cardiac Life Support (ACLS) Video Series',
        type: 'video',
        author: 'American Heart Association',
        source: 'AHA Learning Center',
        url: 'https://aha-learning.com/acls-2025',
        description: 'Updated ACLS algorithms and procedures for 2025 including new CPR guidelines',
        tags: ['ACLS', 'CPR', 'Emergency Medicine', 'Resuscitation'],
        specialty: 'Emergency Medicine',
        addedDate: new Date('2025-07-25'),
        lastAccessed: new Date('2025-08-02'),
        readingProgress: 80,
        estimatedReadTime: 180,
        rating: 4.7,
        notes: 'Watch modules 3-5 for exam. New compression rate protocols.',
        isBookmarked: false,
        isFavorite: false,
        readingList: 'Emergency Prep',
        priority: 'high'
      },
      {
        id: '5',
        title: 'Medical Ethics in Modern Practice Podcast',
        type: 'podcast',
        author: 'Dr. Ethics Weekly',
        source: 'Medical Ethics Podcast',
        url: 'https://medethics.podcast.com/modern-practice-ep15',
        description: 'Discussion on ethical dilemmas in modern medical practice, informed consent, and patient autonomy',
        tags: ['Medical Ethics', 'Philosophy', 'Patient Care', 'Professional Development'],
        specialty: 'Medical Ethics',
        addedDate: new Date('2025-07-22'),
        readingProgress: 100,
        estimatedReadTime: 60,
        rating: 4.4,
        notes: 'Great case studies. Reference for ethics rotation.',
        isBookmarked: false,
        isFavorite: false,
        priority: 'low'
      }
    ];

    const mockReadingLists: ReadingList[] = [
      {
        id: '1',
        name: 'Cardiology Essentials',
        description: 'Must-read materials for cardiology rotation',
        resources: ['1'],
        createdDate: new Date('2025-07-15'),
        color: 'red'
      },
      {
        id: '2',
        name: 'Board Prep',
        description: 'High-yield materials for board examinations',
        resources: ['2'],
        createdDate: new Date('2025-07-10'),
        color: 'blue'
      },
      {
        id: '3',
        name: 'Emergency Prep',
        description: 'Emergency medicine rotation preparation',
        resources: ['4'],
        createdDate: new Date('2025-07-20'),
        color: 'orange'
      }
    ];

    setResources(mockResources);
    setReadingLists(mockReadingLists);
    setLoading(false);
  }, []);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialty = !selectedSpecialty || resource.specialty === selectedSpecialty;
    const matchesType = !selectedType || resource.type === selectedType;
    const matchesReadingList = !selectedReadingList || resource.readingList === selectedReadingList;
    const matchesPriority = !selectedPriority || resource.priority === selectedPriority;
    
    return matchesSearch && matchesSpecialty && matchesType && matchesReadingList && matchesPriority;
  });

  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'progress':
        return b.readingProgress - a.readingProgress;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'recent':
      default:
        return b.addedDate.getTime() - a.addedDate.getTime();
    }
  });

  const specialties = ['All', ...Array.from(new Set(resources.map(r => r.specialty)))];
  const types = ['All', 'article', 'book', 'research', 'video', 'podcast', 'document'];
  const priorities = ['All', 'high', 'medium', 'low'];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return FileText;
      case 'book': return BookOpen;
      case 'research': return Target;
      case 'video': return Video;
      case 'podcast': return Headphones;
      case 'document': return FileText;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'book': return 'bg-green-100 text-green-800';
      case 'research': return 'bg-purple-100 text-purple-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'podcast': return 'bg-orange-100 text-orange-800';
      case 'document': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleFavorite = (resourceId: string) => {
    setResources(prev => prev.map(resource => 
      resource.id === resourceId 
        ? { ...resource, isFavorite: !resource.isFavorite }
        : resource
    ));
    // TODO: Update in Firebase
  };

  const handleToggleBookmark = (resourceId: string) => {
    setResources(prev => prev.map(resource => 
      resource.id === resourceId 
        ? { ...resource, isBookmarked: !resource.isBookmarked }
        : resource
    ));
    // TODO: Update in Firebase
  };

  const handleAccessResource = (resource: ReadingResource) => {
    // Update access stats
    setResources(prev => prev.map(r => 
      r.id === resource.id 
        ? { ...r, lastAccessed: new Date() }
        : r
    ));

    // Open resource
    if (resource.url) {
      window.open(resource.url, '_blank');
    } else if (resource.fileUrl) {
      window.open(resource.fileUrl, '_blank');
    }
    
    // TODO: Update access stats in Firebase
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Library className="h-12 w-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Library className="h-12 w-12" />
              <div>
                <h1 className="text-4xl font-bold mb-2">Reading & Resources</h1>
                <p className="text-purple-100 text-xl">Your personal medical library and resource collection</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-2xl font-bold">{resources.length}</div>
                <p className="text-purple-100 text-sm">Resources</p>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-2xl font-bold">{Math.round(resources.reduce((acc, r) => acc + r.readingProgress, 0) / resources.length) || 0}%</div>
                <p className="text-purple-100 text-sm">Avg Progress</p>
              </div>
              <button
                onClick={() => setViewMode('add')}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors font-semibold"
              >
                <Plus className="h-5 w-5" />
                Add Resource
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex space-x-1">
            {[
              { id: 'grid', name: 'Library', icon: Grid },
              { id: 'list', name: 'List View', icon: List },
              { id: 'reading-lists', name: 'Reading Lists', icon: Folder },
              { id: 'add', name: 'Add Resource', icon: Plus }
            ].map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id as any)}
                className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  viewMode === id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {name}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'add' ? (
          // Add Resource Mode
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Reading Resource</h2>
              <p className="text-gray-600">Add articles, books, research papers, or links to your library</p>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Resource Title</label>
                <input
                  type="text"
                  placeholder="e.g., Myocardial Infarction Guidelines 2025"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Resource Type</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="article">Journal Article</option>
                    <option value="book">Book/Textbook</option>
                    <option value="research">Research Paper</option>
                    <option value="video">Video/Lecture</option>
                    <option value="podcast">Podcast</option>
                    <option value="document">Document/PDF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Specialty</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="General">General</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Medical Ethics">Medical Ethics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Author(s)</label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. Sarah Chen, MD"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Source/Journal</label>
                  <input
                    type="text"
                    placeholder="e.g., Journal of Cardiology"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <textarea
                  placeholder="Brief description of the content and why it's valuable..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">URL (for online resources)</label>
                <input
                  type="url"
                  placeholder="https://example.com/article"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Upload File (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Upload PDF, DOC, or other files</p>
                  <p className="text-sm text-gray-500">Max 25MB per file</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Priority</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Estimated Read Time (minutes)</label>
                  <input
                    type="number"
                    placeholder="30"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., Cardiology, Guidelines, Emergency Medicine"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105"
                >
                  Save to Library
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : viewMode === 'reading-lists' ? (
          // Reading Lists Mode
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Reading Lists</h2>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New List
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {readingLists.map((list) => (
                <div key={list.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{list.name}</h3>
                    <div className={`w-4 h-4 rounded-full ${
                      list.color === 'red' ? 'bg-red-500' :
                      list.color === 'blue' ? 'bg-blue-500' :
                      list.color === 'orange' ? 'bg-orange-500' :
                      'bg-purple-500'
                    }`}></div>
                  </div>
                  <p className="text-gray-600 mb-4">{list.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{list.resources.length} resources</span>
                    <span>{list.createdDate.toLocaleDateString()}</span>
                  </div>
                  <button className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    View List
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search your library..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  />
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  >
                    {types.map(type => (
                      <option key={type} value={type === 'All' ? '' : type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  >
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty === 'All' ? '' : specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority === 'All' ? '' : priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  >
                    <option value="recent">Recently Added</option>
                    <option value="title">Title A-Z</option>
                    <option value="progress">Reading Progress</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Resources Display */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedResources.map((resource) => {
                  const TypeIcon = getTypeIcon(resource.type);
                  return (
                    <div key={resource.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`p-2 rounded-xl ${getTypeColor(resource.type)}`}>
                              <TypeIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{resource.title}</h3>
                              <p className="text-sm text-gray-600">{resource.author}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleFavorite(resource.id)}
                              className={`transition-colors ${
                                resource.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                              }`}
                            >
                              <Star className={`h-4 w-4 ${resource.isFavorite ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleToggleBookmark(resource.id)}
                              className={`transition-colors ${
                                resource.isBookmarked ? 'text-purple-500' : 'text-gray-400 hover:text-purple-500'
                              }`}
                            >
                              <Bookmark className={`h-4 w-4 ${resource.isBookmarked ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(resource.priority)}`}>
                            {resource.priority} priority
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {resource.specialty}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{resource.description}</p>

                        {/* Reading Progress */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Reading Progress</span>
                            <span className="font-medium text-gray-900">{resource.readingProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${resource.readingProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {resource.estimatedReadTime} min read
                          </div>
                          {resource.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              {resource.rating}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccessResource(resource)}
                            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                          >
                            {resource.readingProgress > 0 ? <PlayCircle className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {resource.readingProgress > 0 ? 'Continue' : 'Start Reading'}
                          </button>
                          <button className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {sortedResources.map((resource) => {
                  const TypeIcon = getTypeIcon(resource.type);
                  return (
                    <div key={resource.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-3 rounded-xl ${getTypeColor(resource.type)}`}>
                            <TypeIcon className="h-6 w-6" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(resource.priority)}`}>
                                {resource.priority}
                              </span>
                              {resource.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                              {resource.isBookmarked && <Bookmark className="h-4 w-4 text-purple-500 fill-current" />}
                            </div>
                            
                            <p className="text-gray-600 mb-3">{resource.description}</p>
                            
                            <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {resource.author}
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {resource.source}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {resource.estimatedReadTime} min
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {resource.addedDate.toLocaleDateString()}
                              </div>
                            </div>

                            {/* Reading Progress Bar */}
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full"
                                    style={{ width: `${resource.readingProgress}%` }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-gray-700">{resource.readingProgress}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAccessResource(resource)}
                            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2"
                          >
                            {resource.readingProgress > 0 ? <PlayCircle className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {resource.readingProgress > 0 ? 'Continue' : 'Start'}
                          </button>
                          <button
                            onClick={() => handleToggleFavorite(resource.id)}
                            className={`p-3 rounded-xl transition-colors ${
                              resource.isFavorite 
                                ? 'bg-yellow-100 text-yellow-600' 
                                : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'
                            }`}
                          >
                            <Star className={`h-4 w-4 ${resource.isFavorite ? 'fill-current' : ''}`} />
                          </button>
                          <button className="bg-gray-100 text-gray-700 p-3 rounded-xl hover:bg-gray-200 transition-colors">
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {sortedResources.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                  <Library className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Your library is empty</h3>
                  <p className="text-gray-600 mb-6">Start building your medical resource collection!</p>
                  <button
                    onClick={() => setViewMode('add')}
                    className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Add First Resource
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReadingResourcesPage;