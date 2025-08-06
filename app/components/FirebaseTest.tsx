// components/FirebaseTest.tsx - Add this temporarily to test connection
"use client";

import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { CheckCircle, AlertCircle, Database } from 'lucide-react';

const FirebaseTest = () => {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      console.log('🔥 Testing Firebase connection...');
      
      // Test 1: Check if Firebase is initialized
      if (!db) {
        throw new Error('Firebase database not initialized');
      }
      console.log('✅ Firebase initialized');

      // Test 2: Try to read from Firestore
      const testCollection = collection(db, 'test');
      const snapshot = await getDocs(testCollection);
      console.log('✅ Firestore read successful');

      // Test 3: Try to write to Firestore
      await addDoc(collection(db, 'test'), {
        message: 'Connection test',
        timestamp: new Date().toISOString(),
        user: 'system'
      });
      console.log('✅ Firestore write successful');

      setStatus('success');
      setMessage('Firebase connection successful! All services are working.');
      
    } catch (error) {
      console.error('❌ Firebase connection failed:', error);
      setStatus('error');
      setMessage(`Firebase connection failed: ${error.message}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`p-4 rounded-lg shadow-lg border-2 ${
        status === 'testing' ? 'bg-blue-50 border-blue-200' :
        status === 'success' ? 'bg-green-50 border-green-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-3">
          {status === 'testing' && (
            <>
              <Database className="h-5 w-5 text-blue-600 animate-pulse" />
              <span className="text-blue-800 font-medium">Testing Firebase...</span>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">Firebase Connected!</span>
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">Firebase Error</p>
                <p className="text-red-600 text-sm">{message}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest;