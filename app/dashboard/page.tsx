//C:\SimpleLMS\app\dashboard\page.tsx

"use client";

import { useAuth } from '../components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserDashboard from '../components/UserDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      alert('🎉 Payment successful! Welcome to MedQuiz Pro!');
      window.history.replaceState({}, document.title, '/dashboard');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="text-center dashboard-tile">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <UserDashboard />;
}