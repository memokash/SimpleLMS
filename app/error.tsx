'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-600 dark:text-red-400">
            Something went wrong!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            An unexpected error occurred.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={reset}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
          <br />
          <a
            href="/dashboard"
            className="inline-block text-indigo-600 hover:text-indigo-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}