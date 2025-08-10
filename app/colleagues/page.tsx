'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useTheme } from '../components/ThemeContext';
import { ProfileService } from '../../services/profileService';
import { MedicalProfile } from '../../types/profile.types';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Building2, 
  Stethoscope, 
  Calendar,
  Mail, 
  Phone,
  GraduationCap,
  UserPlus,
  MessageSquare,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  RefreshCw,
  Grid,
  List,
  SortAsc,
  User,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

const ColleaguesPage = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [colleagues, setColleagues] = useState<MedicalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRotation, setFilterRotation] = useState('');
  const [filterInstitution, setFilterInstitution] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'rotation' | 'institution'>('name');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    loadColleagues();
  }, []);

  const loadColleagues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        medicalStatus: filterStatus || undefined,
        rotation: filterRotation || undefined,
        institution: filterInstitution || undefined,
        searchTerm: searchTerm || undefined
      };
      
      const colleaguesData = await ProfileService.searchColleagues(filters);
      
      // Filter out current user
      const filteredColleagues = colleaguesData.filter(
        colleague => colleague.userId !== user?.uid
      );
      
      setColleagues(filteredColleagues);
    } catch (err) {
      setError('Failed to load colleagues. Please try again.');
      console.error('Error loading colleagues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadColleagues();
  };

  const sortedColleagues = [...colleagues].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case 'status':
        return a.medicalStatus.localeCompare(b.medicalStatus);
      case 'rotation':
        return a.currentRotation.localeCompare(b.currentRotation);
      case 'institution':
        return a.institution.localeCompare(b.institution);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pre-Med Student': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      'Medical Student': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      'Resident': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      'Fellow': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
      'Attending Physician': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      'Nurse Practitioner': 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200',
      'Physician Assistant': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200'
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
  };

  const ColleagueCard = ({ colleague }: { colleague: MedicalProfile }) => (
    <div className="reactive-tile p-6 hover:scale-105">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
          {colleague.profilePicture ? (
            <img src={colleague.profilePicture} alt={`${colleague.firstName} ${colleague.lastName}`} className="w-full h-full object-cover" />
          ) : (
            <span>{colleague.firstName?.charAt(0)}{colleague.lastName?.charAt(0)}</span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {colleague.firstName} {colleague.lastName}
          </h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(colleague.medicalStatus)}`}>
            {colleague.medicalStatus}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {colleague.currentRotation && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span>{colleague.currentRotation}</span>
            {colleague.rotationLocation && (
              <span className="text-gray-400 dark:text-gray-500">• {colleague.rotationLocation}</span>
            )}
          </div>
        )}
        
        {colleague.institution && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Building2 className="w-4 h-4 text-purple-500" />
            <span>{colleague.institution}</span>
          </div>
        )}
        
        {colleague.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-purple-500" />
            <span>{colleague.location}</span>
          </div>
        )}
        
        {colleague.yearLevel && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <GraduationCap className="w-4 h-4 text-purple-500" />
            <span>{colleague.yearLevel}</span>
          </div>
        )}
      </div>

      {colleague.bio && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {colleague.bio}
        </p>
      )}

      <div className="flex gap-2">
        <button className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium">
          <MessageSquare className="w-4 h-4" />
          Message
        </button>
        <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium">
          <UserPlus className="w-4 h-4" />
          Connect
        </button>
      </div>
    </div>
  );

  const ColleagueRow = ({ colleague }: { colleague: MedicalProfile }) => (
    <div className="reactive-tile p-6">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {colleague.profilePicture ? (
            <img src={colleague.profilePicture} alt={`${colleague.firstName} ${colleague.lastName}`} className="w-full h-full object-cover" />
          ) : (
            <span>{colleague.firstName?.charAt(0)}{colleague.lastName?.charAt(0)}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {colleague.firstName} {colleague.lastName}
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(colleague.medicalStatus)}`}>
              {colleague.medicalStatus}
            </span>
            {colleague.currentRotation && (
              <span className="text-sm text-gray-600 dark:text-gray-300">{colleague.currentRotation}</span>
            )}
            {colleague.institution && (
              <span className="text-sm text-gray-600 dark:text-gray-300">{colleague.institution}</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Message
          </button>
          <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Connect
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted || loading) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      } flex items-center justify-center`}>
        <div className="reactive-tile p-6">
          <Loader2 className="animate-spin h-6 w-6 mr-3 text-purple-500" />
          <span className="text-lg font-medium text-gray-900 dark:text-white">Loading colleagues...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    } py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="reactive-tile p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h1 className="gradient-title text-3xl mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-500" />
                <Users className="w-8 h-8 text-purple-500" />
                Medical Colleagues
              </h1>
              <p className="text-gray-600 dark:text-gray-300">Connect with fellow medical professionals</p>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="absolute top-6 right-6 p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/30 px-4 py-2 rounded-full">
              <Users className="w-4 h-4 text-purple-500" />
              <span>{colleagues.length} colleagues found</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="reactive-tile p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search colleagues by name, rotation, institution..."
                className="w-full pl-12 pr-6 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-4 rounded-2xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="Pre-Med Student">Pre-Med Student</option>
              <option value="Medical Student">Medical Student</option>
              <option value="Resident">Resident</option>
              <option value="Fellow">Fellow</option>
              <option value="Attending Physician">Attending Physician</option>
              <option value="Nurse Practitioner">Nurse Practitioner</option>
              <option value="Physician Assistant">Physician Assistant</option>
            </select>

            <input
              type="text"
              value={filterRotation}
              onChange={(e) => setFilterRotation(e.target.value)}
              placeholder="Filter by rotation"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />

            <input
              type="text"
              value={filterInstitution}
              onChange={(e) => setFilterInstitution(e.target.value)}
              placeholder="Filter by institution"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
              <option value="rotation">Sort by Rotation</option>
              <option value="institution">Sort by Institution</option>
            </select>

            <div className="flex border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'} hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'} hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-2xl p-6 mb-8 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-200 font-medium">Error loading colleagues</p>
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={loadColleagues}
              className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Colleagues Grid/List */}
        {colleagues.length === 0 && !loading && !error ? (
          <div className="reactive-tile p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="gradient-title text-xl mb-2">No colleagues found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Try adjusting your search criteria or invite colleagues to join SimpleLMS.
            </p>
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2 mx-auto">
              <UserPlus className="w-5 h-5" />
              Invite Colleagues
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {sortedColleagues.map((colleague) => (
              <div key={colleague.id}>
                {viewMode === 'grid' ? (
                  <ColleagueCard colleague={colleague} />
                ) : (
                  <ColleagueRow colleague={colleague} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColleaguesPage;