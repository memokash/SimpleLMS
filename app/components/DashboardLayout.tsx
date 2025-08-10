'use client';

import React, { useMemo, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import DashboardNavigation from './DashboardNavigation';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Show DashboardNavigation on all pages except homepage */}
      {showNavigation && <DashboardNavigation />}
      
      {/* Main Content */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}