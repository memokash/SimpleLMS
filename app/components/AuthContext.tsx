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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
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
    return onAuthStateChanged(auth, (currentUser) => {
      console.log('🔍 Auth state changed:', {
        userExists: !!currentUser,
        currentPath: pathname
      });
      
      setUser(currentUser);
      setLoading(false);
    });
  }, [pathname]);

  const signInWithEmail = async (email: string, password: string) => {
  console.log('🔐 Signing in with email:', email);
  await signInWithEmailAndPassword(auth, email, password);
  router.push('/dashboard');
};

const signUpWithEmail = async (email: string, password: string) => {
  console.log('📝 Signing up with email:', email);
  await createUserWithEmailAndPassword(auth, email, password);
  router.push('/dashboard');
};

const signInWithGoogle = async () => {
  console.log('🔍 Signing in with Google');
  await signInWithPopup(auth, googleProvider);
  router.push('/dashboard');
};

  const logout = async () => {
    console.log('👋 Signing out');
    await signOut(auth);
    
    // ✅ Always redirect to home on logout
    router.push('/');
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};