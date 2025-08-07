import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">
            Page not found
          </p>
          <p className="text-gray-500 dark:text-gray-500 mt-2">
            The page you are looking for doesn't exist.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <br />
          <Link
            href="/"
            className="inline-block text-indigo-600 hover:text-indigo-700"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}