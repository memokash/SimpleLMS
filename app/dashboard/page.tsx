"use client";

import { useAuth } from '../components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserDashboard from '../components/UserDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // FIRST useEffect - Auth check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // SECOND useEffect - Success message (move this up!)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      alert('🎉 Payment successful! Welcome to MedQuiz Pro!');
      // Clean up URL
      window.history.replaceState({}, document.title, '/dashboard');
    }
  }, []);

  // Early returns AFTER all hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to home
  }

  return <UserDashboard />;
}