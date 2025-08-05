// app/hooks/useUserStats.ts

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../components/AuthContext';

interface UserStats {
  totalCourses: number;
  completed: number;
  inProgress: number;
  avgScore: number;
  // Add more fields if needed
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalCourses: 0,
    completed: 0,
    inProgress: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchStats = async () => {
      setLoading(true);

      try {
        const quizRef = collection(db, 'quizAttempts');
        const q = query(quizRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(q);

        let completed = 0;
        let inProgress = 0;
        let totalScore = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.completed) {
            completed++;
            totalScore += data.score || 0;
          } else {
            inProgress++;
          }
        });

        const totalCourses = completed + inProgress;
        const avgScore = completed > 0 ? totalScore / completed : 0;

        setStats({
          totalCourses,
          completed,
          inProgress,
          avgScore,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
};
