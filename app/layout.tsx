// app/layout.tsx
import './globals.css';
import { AuthProvider } from './components/AuthContext';
import Footer from './components/Footer';
import DashboardLayout from './components/DashboardLayout';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'MedicalSchoolQuizzes - Master Medical School With Smart Quizzes',
  description: 'Practice with expert-crafted medical questions. Track progress and effortlessly pass your exams.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}