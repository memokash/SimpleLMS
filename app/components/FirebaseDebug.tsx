"use client";

import React, { useEffect, useState } from 'react';
import { testFirebaseConnection } from '../../lib/firebase';
import { CheckCircle, AlertCircle, Database, Eye, EyeOff } from 'lucide-react';

const FirebaseDebug = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [message, setMessage] = useState('');
  const [showEnvVars, setShowEnvVars] = useState(false);

  // Check environment variables
  const envVars = {
    'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const missingVars = Object.entries(envVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  useEffect(() => {
    const runTest = async () => {
      try {
        if (missingVars.length > 0) {
          setConnectionStatus('error');
          setMessage(`Missing environment variables: ${missingVars.join(', ')}`);
          return;
        }

        const result = await testFirebaseConnection();
        setConnectionStatus(result.success ? 'success' : 'error');
        setMessage(result.message);
      } catch (error) {
        setConnectionStatus('error');
        setMessage(`Connection test failed: ${error.message}`);
      }
    };

    runTest();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className={`p-6 rounded-xl shadow-xl border-2 ${
        connectionStatus === 'testing' ? 'bg-blue-50 border-blue-200' :
        connectionStatus === 'success' ? 'bg-green-50 border-green-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start gap-3 mb-4">
          {connectionStatus === 'testing' && (
            <>
              <Database className="h-6 w-6 text-blue-600 animate-pulse flex-shrink-0 mt-1" />
              <div>
                <p className="text-blue-800 font-semibold">Testing Firebase...</p>
                <p className="text-blue-600 text-sm">Checking connection and permissions</p>
              </div>
            </>
          )}
          {connectionStatus === 'success' && (
            <>
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-green-800 font-semibold">Firebase Connected! ✅</p>
                <p className="text-green-600 text-sm">{message}</p>
              </div>
            </>
          )}
          {connectionStatus === 'error' && (
            <>
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-red-800 font-semibold">Firebase Connection Error ❌</p>
                <p className="text-red-600 text-sm">{message}</p>
              </div>
            </>
          )}
        </div>

        {/* Environment Variables Debug */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900 text-sm">Environment Variables</h4>
            <button
              onClick={() => setShowEnvVars(!showEnvVars)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {showEnvVars ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {showEnvVars && (
            <div className="space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-mono">{key}:</span>
                  <span className={`px-2 py-1 rounded ${
                    value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {value ? '✅ Set' : '❌ Missing'}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {missingVars.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-xs font-semibold mb-1">Action Required:</p>
              <p className="text-yellow-700 text-xs">
                Add missing environment variables to your Vercel dashboard and redeploy.
              </p>
            </div>
          )}
        </div>

        {/* Firestore Rules Check */}
        {connectionStatus === 'error' && message.includes('permission') && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 text-xs font-semibold mb-1">Possible Firestore Rules Issue:</p>
              <p className="text-orange-700 text-xs">
                Check your Firestore security rules allow read/write access for authenticated users.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseDebug;