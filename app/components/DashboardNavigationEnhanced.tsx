'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home,
  BookOpen,
  Brain,
  MessageSquare,
  Users,
  Calendar,
  FileText,
  Stethoscope,
  BarChart3,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  GraduationCap,
  Target,
  Zap,
  Heart,
  Shield,
  Menu,
  X,
  LogOut,
  TrendingUp,
  MessageCircle,
  Smile,
  Music,
  Medal,
  Activity
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
}

const DashboardNavigationEnhanced = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems: NavItem[] = [
    // Main Navigation
    { 
      label: 'Dashboard', 
      href: '/dashboard', 
      icon: Home,
      color: 'bg-blue-500'
    },
    { 
      label: 'Practice Updates', 
      href: '/practice-changing', 
      icon: TrendingUp,
      color: 'bg-red-600',
      badge: 'NEW'
    },
    { 
      label: 'Disease Surveillance', 
      href: '/disease-surveillance', 
      icon: Activity,
      color: 'bg-red-500',
      badge: 'ALERT'
    },
    
    // Learning Content
    { 
      label: 'Quiz Library', 
      href: '/courses', 
      icon: BookOpen,
      color: 'bg-indigo-500',
      badge: 'Updated'
    },
    { 
      label: 'Upload Materials', 
      href: '/upload-materials', 
      icon: Zap,
      color: 'bg-orange-500',
      badge: 'New'
    },
    { 
      label: 'Qbank', 
      href: '/question-bank', 
      icon: Brain,
      color: 'bg-purple-500',
      badge: '10K+'
    },
    { 
      label: 'AI Tutor', 
      href: '/dashboard/etutor', 
      icon: Sparkles,
      color: 'bg-emerald-500',
      badge: 'AI'
    },
    
    // Clinical Tools
    { 
      label: 'Clinical Tools', 
      href: '/rounding-tools', 
      icon: Stethoscope,
      color: 'bg-red-500'
    },
    { 
      label: 'Case Studies', 
      href: '/cases', 
      icon: Heart,
      color: 'bg-pink-500',
      badge: 'Pro'
    },
    
    // Community
    { 
      label: 'Community', 
      href: '/community', 
      icon: Heart,
      color: 'bg-pink-500',
      badge: 'New'
    },
    {
      label: 'Debate Forum',
      href: '/debate-forum',
      icon: MessageCircle,
      color: 'bg-red-500',
      badge: 'Hot'
    },
    { 
      label: 'Laugh Break', 
      href: '/only-laughter', 
      icon: Smile,
      color: 'bg-yellow-400',
      badge: '😂'
    },
    {
      label: 'Comedy Sanctuary',
      href: '/laughter-sanctuary',
      icon: Music,
      color: 'bg-purple-400',
      badge: '🎭'
    },
    { 
      label: 'Study Groups', 
      href: '/study-groups', 
      icon: Users,
      color: 'bg-cyan-500'
    },
    { 
      label: 'Messages', 
      href: '/messages', 
      icon: MessageSquare,
      color: 'bg-indigo-500',
      badge: '3'
    },
    
    // Professional Development
    { 
      label: 'CME Credits', 
      href: '/cme', 
      icon: Medal,
      color: 'bg-emerald-500',
      badge: 'Pro'
    },
    
    // Resources
    { 
      label: 'Library', 
      href: '/reading-resources', 
      icon: FileText,
      color: 'bg-blue-500'
    },
    { 
      label: 'Search', 
      href: '/search', 
      icon: Search,
      color: 'bg-green-500'
    },
    
    // Progress & Profile
    { 
      label: 'My Progress', 
      href: '/performance-analytics', 
      icon: BarChart3,
      color: 'bg-green-500'
    },
    { 
      label: 'Certifications', 
      href: '/certifications', 
      icon: GraduationCap,
      color: 'bg-yellow-500'
    },
    { 
      label: 'Profile', 
      href: '/profile', 
      icon: User,
      color: 'bg-gray-500'
    },
    { 
      label: 'Settings', 
      href: '/settings', 
      icon: Settings,
      color: 'bg-gray-500'
    }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Header - Only show on small screens */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white dark:bg-gray-900 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-full px-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">
            MedEd Dashboard
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Desktop Sidebar - Show on medium screens and up (768px+) */}
      <aside className={`
        hidden md:flex flex-col fixed left-0 top-0 h-full z-30
        transition-all duration-300 
        ${collapsed ? 'w-16' : 'w-72'}
        bg-white
        shadow-sm
      `}>
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <span className="text-3xl">🩺</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#07294d]">
                  MedEd Pro
                </h2>
                <p className="text-xs text-gray-600">Medical Excellence Platform</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200 group relative no-underline
                    ${isActive(item.href)
                      ? 'bg-[#f0f7ff] text-[#07294d]'
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <div className={`
                    p-1.5 rounded-lg transition-all duration-200
                    ${isActive(item.href) 
                      ? item.color + ' text-white' 
                      : item.color + ' bg-opacity-10'
                    }
                  `}>
                    <item.icon className={`w-4 h-4 ${isActive(item.href) ? 'text-white' : ''}`} />
                  </div>
                  
                  {!collapsed && (
                    <>
                      <span className={`font-medium flex-1 ${isActive(item.href) ? 'font-semibold' : ''}`}>{item.label}</span>
                      {item.badge && (
                        <span className={`
                          px-2 py-0.5 rounded-full text-xs font-semibold
                          ${isActive(item.href)
                            ? item.color + ' text-white'
                            : 'bg-gray-100 text-gray-600'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="
                      absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white
                      rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none
                      transition-opacity duration-200 whitespace-nowrap z-50
                      text-sm font-medium
                    ">
                      {item.label}
                      {item.badge && (
                        <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section with Sign Out */}
        <div className={`p-4 border-t border-gray-100 ${collapsed ? 'px-2' : ''}`}>
          {!collapsed ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white border border-gray-100">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                    MD
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#07294d]">Dr. Medical</p>
                    <p className="text-xs text-gray-600">Resident • PGY-2</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mt-3">
                  <span className="text-gray-600">Next Shift</span>
                  <span className="font-semibold text-blue-600">7:00 AM</span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              className="w-full flex justify-center p-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-80 max-w-full bg-white dark:bg-gray-900 h-full shadow-xl overflow-y-auto" style={{ backgroundColor: 'white' }}>
            {/* Mobile Menu Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700" style={{ backgroundColor: 'white' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🩺</span>
                  <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    MedEd Dashboard
                  </h2>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center space-x-3 px-3 py-3 rounded-xl
                        transition-all duration-300
                        ${isActive(item.href)
                          ? item.color + ' text-white shadow-lg'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                      style={!isActive(item.href) ? { color: 'rgb(55, 65, 81)' } : {}}
                    >
                      <item.icon className="w-5 h-5" style={!isActive(item.href) ? { color: 'rgb(55, 65, 81)' } : {}} />
                      <span className="font-medium flex-1" style={!isActive(item.href) ? { color: 'rgb(55, 65, 81)' } : {}}>{item.label}</span>
                      {item.badge && (
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-bold
                          ${isActive(item.href)
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-100 text-blue-700'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              
              {/* Sign Out Button in Mobile Menu */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300"
                  style={{ color: 'rgb(55, 65, 81)' }}
                >
                  <LogOut className="w-5 h-5" style={{ color: 'rgb(55, 65, 81)' }} />
                  <span className="font-medium" style={{ color: 'rgb(55, 65, 81)' }}>Sign Out</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardNavigationEnhanced;