// Course Service - Firebase integration
import { db } from '../firebase/firebaseConfig';
import { collection, doc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export interface UserStats {
  coursesStarted: number;
  coursesCompleted: number;
  averageScore: number;
  quizzesCompleted: number;
  totalStudyTime: number;
  streakDays: number;
  rank?: number;
  percentile?: number;
}

export async function getUserStats(userId?: string): Promise<UserStats> {
  // Placeholder implementation - would normally fetch from Firebase
  return {
    coursesStarted: 12,
    coursesCompleted: 8,
    averageScore: 85.5,
    quizzesCompleted: 47,
    totalStudyTime: 1240,
    streakDays: 5,
    rank: 142,
    percentile: 92
  };
}

export async function getCourses() {
  try {
    const coursesRef = collection(db, 'courses');
    const snapshot = await getDocs(coursesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

export default { getUserStats, getCourses };
