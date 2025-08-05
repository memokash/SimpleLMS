'use client';

import React from 'react';
import { ThemeProvider } from './ThemeContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-200">
        {children}
      </div>
    </ThemeProvider>
  );
}