// Fixed DashboardNavigation.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import ProfilePictureUpload from './profile/ProfilePictureUpload';
import { 
  Home, 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  Brain,
  GraduationCap,
  Zap,
  MessageSquare,
  Calendar,
  Stethoscope,
  Library,
  UserCheck,
  FileText,
  Award,
  LogOut,
  Crown,
  ChevronDown,
  User,
  Database,
  Search,
  X,
  Camera
} from 'lucide-react';

const DashboardNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileUpload, setShowProfileUpload] = useState(false);
  const [userProfilePicture, setUserProfilePicture] = useState('');

  // Handle mounting to prevent SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById('search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearchResults]);
  
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and analytics'
    },
    {
      name: 'Smart Quizzes',
      href: '/courses',
      icon: BookOpen,
      description: 'Take quizzes and track progress',
    },
    {
      name: 'Question Bank',
      href: '/question-bank',
      icon: Database,
      description: 'Community question repository',
      
    },
    {
      name: 'Groups',
      href: '/study-groups',
      icon: Users,
      description: 'Join or create study groups'
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageSquare,
      description: 'Internal messaging system',
      badge: '3'
    },
    {
      name: 'Rotations',
      href: '/student-rotations',
      icon: Calendar,
      description: 'Rotation schedules and calendar'
    },
    {
      name: 'Rounding',
      href: '/rounding-tools',
      icon: Stethoscope,
      description: 'H&P, Progress Notes, Procedures'
    },
    {
      name: 'Resources',
      href: '/reading-resources',
      icon: Library,
      description: 'Save and annotate articles'
    },
    {
      name: 'Analytics',
      href: '/performance-analytics',
      icon: BarChart3,
      description: 'Performance insights'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'System configuration'
    }
  ];

  const isActive = (href: string) => {
    if (!mounted || !pathname) {
      return false;
    }
    return pathname === href || pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    if (!mounted) {
      return;
    }

    try {
      await logout();
      setShowUserMenu(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  // Search functionality
  const filteredItems = navigationItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredItems.length > 0) {
      router.push(filteredItems[0].href);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Don't render until mounted (prevents SSR issues)
  if (!mounted) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-black shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">MedEd LMS</span>
              </Link>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-1 overflow-x-auto">
              {navigationItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-item whitespace-nowrap ${
                      active ? 'nav-item-active' : ''
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                    {item.badge && (
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.badge === 'Community'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : /^\d+$/.test(item.badge) 
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Search functionality */}
          <div id="search-container" className="flex-1 max-w-md mx-4 relative">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                  placeholder="Search features, courses, tools..."
                  className="search-field"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 glass rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {filteredItems.length > 0 ? (
                    <div className="py-2">
                      {filteredItems.slice(0, 5).map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.name}
                            onClick={() => {
                              router.push(item.href);
                              clearSearch();
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                          >
                            <div className="p-2 color-neurology rounded-lg">
                              <Icon className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium text-heading">{item.name}</div>
                              <div className="text-sm text-muted">{item.description}</div>
                            </div>
                          </button>
                        );
                      })}
                      {filteredItems.length > 5 && (
                        <div className="px-4 py-2 text-sm text-gray-500 border-t border-gray-100">
                          +{filteredItems.length - 5} more results
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <div className="font-medium">No results found</div>
                      <div className="text-sm">Try searching for courses, tools, or features</div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
          
          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Messages indicator */}
            <Link 
              href="/messages"
              className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">3 unread</span>
            </Link>
            
            {/* User Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="relative">
                  {userProfilePicture || user?.photoURL ? (
                    <img
                      src={userProfilePicture || user?.photoURL || ''}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                      onError={() => setUserProfilePicture('')}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProfileUpload(true);
                      setShowUserMenu(false);
                    }}
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary-600 rounded-full flex items-center justify-center hover:bg-secondary-700 transition-colors"
                    title="Update profile picture"
                  >
                    <Camera className="w-3 h-3 text-white" />
                  </button>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 glass-strong rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-heading">
                          {user?.displayName || 'Medical Student'}
                        </p>
                        <p className="text-xs text-muted">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-body hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile Settings
                    </Link>
                    
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-body hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="sm:hidden max-h-96 overflow-y-auto">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900 border-t border-gray-800">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-item block text-base ${
                  active ? 'nav-item-active' : ''
                }`}
              >
                <div className="flex items-center mb-2">
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                  {item.badge && (
                    <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.badge === 'Community'
                        ? 'bg-gradient-to-r from-white-600 to-white-600 text-black'
                        : /^\d+$/.test(item.badge) 
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Profile Picture Upload Modal */}
      <ProfilePictureUpload
        currentPicture={userProfilePicture || user?.photoURL || ''}
        onPictureUpdate={(newPicture) => {
          setUserProfilePicture(newPicture);
        }}
        isOpen={showProfileUpload}
        onClose={() => setShowProfileUpload(false)}
      />
    </nav>
  );
};

export default DashboardNavigation;