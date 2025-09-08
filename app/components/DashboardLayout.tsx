'use client';

import React, { useMemo, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import DashboardNavigationEnhanced from './DashboardNavigationEnhanced';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if we should show navigation (all pages except homepage)
  const showNavigation = useMemo(() => {
    if (!mounted || !pathname) {
      return false; 
    }
    
    // Only exclude homepage - show navigation on all other pages
    const excludedPaths = ['/'];
    return !excludedPaths.includes(pathname);
  }, [mounted, pathname]);

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Show Enhanced Dashboard Navigation on all pages except homepage */}
      {showNavigation && <DashboardNavigationEnhanced />}
      
      {/* Main Content with proper spacing for sidebar */}
      <main className={`w-full transition-all duration-300 ${showNavigation ? 'md:ml-64 pt-16 md:pt-0' : ''}`}>
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}