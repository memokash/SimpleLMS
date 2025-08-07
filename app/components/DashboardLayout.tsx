'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, 
  BookOpen, 
  Users, 
  MessageCircle, 
  Calendar, 
  BarChart3,
  FileText, 
  NotebookPen, 
  BrainCircuit, 
  Menu, 
  X,
  Loader2
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/study-groups', label: 'Study Groups', icon: Users },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/student-rotations', label: 'Calendar', icon: Calendar },
  { href: '/student-rotations', label: 'Rotations', icon: Calendar },
  { href: '/performance-analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/Discussion-forums', label: 'Forums', icon: FileText },
  { href: '/reading-resources', label: 'Resources', icon: NotebookPen },
  { href: '/rounding-tools', label: 'Rounding Tools', icon: BrainCircuit },
  { href: '/enhanced-quiz-display', label: 'Take Quiz', icon: FileText },
  { href: '/question-bank', label: 'Generate Smart Questions', icon: FileText },
];

// Memoized navigation item component
const NavItem = React.memo(({ 
  href, 
  label, 
  icon: Icon, 
  isActive, 
  collapsed 
}: NavItem & { 
  isActive: boolean; 
  collapsed: boolean; 
}) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white' 
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
});

NavItem.displayName = 'NavItem';

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // CRITICAL: Add mounted state to prevent SSR issues
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Handle mounting to prevent SSR/hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe pathname check that only runs after mounting
  const showDashboard = useMemo(() => {
    // Always return true during SSR/initial load to maintain consistent structure
    if (!mounted || !pathname) {
      return true; // Default to showing dashboard layout
    }
    
    // Only exclude specific auth pages
    const excludedPaths = ['/', '/login', '/register', '/forgot-password', '/signup'];
    return !excludedPaths.includes(pathname);
  }, [mounted, pathname]);

  // Memoized toggle function
  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  // Show loading state during initial mount to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Always render the same structure to prevent hydration mismatches
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Conditionally show/hide sidebar instead of changing structure */}
      <aside 
        className={`transition-all duration-300 ${
          showDashboard ? (collapsed ? 'w-20' : 'w-64') : 'w-0 overflow-hidden'
        } bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex-shrink-0`}
      >
        {showDashboard && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h1 
                className={`text-lg font-bold text-indigo-600 dark:text-white transition-all duration-200 ${
                  collapsed ? 'opacity-0 w-0' : 'opacity-100'
                }`}
              >
                My Medical Education LMS
              </h1>
              <button 
                onClick={toggleSidebar}
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 p-1 rounded-lg transition-colors"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </button>
            </div>

            {/* Navigation */}
            <nav className="px-2 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  isActive={pathname === item.href}
                  collapsed={collapsed}
                />
              ))}
            </nav>
          </>
        )}
      </aside>

      {/* Main Content - Always present with consistent structure */}
      <main className={`flex-1 overflow-y-auto ${showDashboard ? '' : 'w-full'}`}>
        <div className={showDashboard ? "p-6" : ""}>
          {children}
        </div>
      </main>
    </div>
  );
}