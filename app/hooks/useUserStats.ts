import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../components/AuthContext';

export interface UserStats {
  averageScore: number;
  quizzesCompleted: number;
  questionsContributed: number;
  tier: 'free' | 'pro' | 'premium';
}

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchStats = async () => {
      const docRef = doc(db, 'userStats', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setStats(snap.data() as UserStats);
      }
      setLoading(false);
    };

    fetchStats();
  }, [user]);

  return stats; 
}
