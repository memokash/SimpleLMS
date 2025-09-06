//C:\SimpleLMS\app\components\AuthContext.tsx

"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { DeviceManager } from '../../lib/deviceManager';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ✅ SIMPLIFIED - Only handle auth state, no automatic redirects
    return onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check device limit when auth state changes
        const deviceCheck = await DeviceManager.registerDevice(currentUser.uid);
        if (!deviceCheck.allowed) {
          alert(deviceCheck.message);
          await signOut(auth);
          setUser(null);
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
  }, [pathname]);

  const signInWithEmail = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check device limit
    const deviceCheck = await DeviceManager.registerDevice(userCredential.user.uid);
    if (!deviceCheck.allowed) {
      await signOut(auth);
      throw new Error(deviceCheck.message || 'Maximum device limit reached');
    }
    
    router.push('/dashboard');
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Register device for new user
    await DeviceManager.registerDevice(userCredential.user.uid);
    
    router.push('/dashboard');
  };

  const signInWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    
    // Check device limit
    const deviceCheck = await DeviceManager.registerDevice(userCredential.user.uid);
    if (!deviceCheck.allowed) {
      await signOut(auth);
      throw new Error(deviceCheck.message || 'Maximum device limit reached');
    }
    
    router.push('/dashboard');
  };

  const logout = async () => {
    // Remove device session before signing out
    if (user) {
      await DeviceManager.removeDevice(user.uid);
    }
    
    await signOut(auth);
    
    // ✅ Always redirect to home on logout
    router.push('/');
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!user) {
      return null;
    }
    
    try {
      const token = await user.getIdToken();
      return token;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting ID token:', error);
      }
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
    getIdToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};