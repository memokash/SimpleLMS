// app/layout.tsx
import { ThemeProvider } from './components/ThemeContext';
import './globals.css';
import './styles/contrast-audit-fixes.css';
import { AuthProvider } from './components/AuthContext';
import Footer from './components/Footer';
import DashboardLayout from './components/DashboardLayout';
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'MedicalSchoolQuizzes - Master Medical School With Smart Quizzes',
  description: 'Practice with expert-crafted medical questions. Track progress and effortlessly pass your exams. Comprehensive USMLE prep, study tools, and AI-powered learning for medical students.',
  keywords: 'medical school quizzes, USMLE prep, medical education, Step 1, Step 2 CK, COMLEX, medical student resources, question bank, AI tutor, medical exam preparation',
  authors: [{ name: 'MedicalSchoolQuizzes Team' }],
  creator: 'MedicalSchoolQuizzes',
  publisher: 'MedicalSchoolQuizzes',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'MedicalSchoolQuizzes - Master Medical School With Smart Quizzes',
    description: 'Practice with expert-crafted medical questions. Track progress and effortlessly pass your exams.',
    url: 'https://medicalschoolquizzes.com',
    siteName: 'MedicalSchoolQuizzes',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MedicalSchoolQuizzes - Master Medical School With Smart Quizzes',
    description: 'Practice with expert-crafted medical questions. Track progress and effortlessly pass your exams.',
    creator: '@medschoolquiz',
  },
  alternates: {
    canonical: 'https://medicalschoolquizzes.com',
  },
  category: 'education',
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="overflow-x-hidden bg-white dark:bg-gray-900 text-gray-900">
        <ServiceWorkerRegistration />
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen w-full overflow-x-hidden bg-white dark:bg-gray-900">
              <DashboardLayout>
                {children}
              </DashboardLayout>
              <Footer />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}