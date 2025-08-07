// app/dashboard/courses/page.tsx - REPLACE ENTIRE FILE
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardCoursesRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main courses page to avoid duplication
    router.replace('/courses');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Redirecting to courses...</div>
    </div>
  );
}