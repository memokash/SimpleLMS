"use client";

import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface QuizAccessGuardProps {
  children: React.ReactNode;
  requiredTier?: 'free' | 'pro' | 'premium';
}

export default function QuizAccessGuard({ 
  children, 
  requiredTier = 'free' 
}: QuizAccessGuardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'premium'>('free');

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        // Fetch user's tier from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const tier = userData.subscriptionTier || 'free';
          setUserTier(tier);
          
          // Check if user has required access
          const tierHierarchy = { free: 0, pro: 1, premium: 2 };
          const userTierLevel = tierHierarchy[tier] || 0;
          const requiredTierLevel = tierHierarchy[requiredTier] || 0;
          
          setHasAccess(userTierLevel >= requiredTierLevel);
        } else {
          // Create user document with free tier if it doesn't exist
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName,
            subscriptionTier: 'free',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          setUserTier('free');
          setHasAccess(requiredTier === 'free');
        }
      } catch (error) {
        console.error('Error checking quiz access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, requiredTier]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
          <span className="text-lg">Checking access...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access quizzes.
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    const upgradeMessages = {
      pro: 'Upgrade to Pro or Premium to access this quiz.',
      premium: 'Upgrade to Premium to access this quiz.'
    };

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Upgrade Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Your current tier: <span className="font-semibold capitalize">{userTier}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {upgradeMessages[requiredTier] || 'This content requires a subscription.'}
          </p>
          <button
            onClick={() => router.push('/subscription')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            View Subscription Plans
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}