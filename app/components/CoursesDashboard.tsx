'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
  BookOpen, Star, Target, Clock, CheckCircle, Award, Lock, Crown, ArrowRight, Book
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc } from 'firebase/firestore';

interface Course {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  estimatedTime?: string;
  rating?: number;
  tier?: 'free' | 'pro' | 'premium';
}

interface UserStats {
  averageScore?: number;
  quizzesCompleted?: number;
  tier?: 'free' | 'pro' | 'premium';
}

const CoursesDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [completedQuizData, setCompletedQuizData] = useState<Record<string, any>>({});
  const [userNotes, setUserNotes] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) {
      return;
    }

    const userRef = doc(db, 'users', user.uid);

    // Mock data or fetch from Firestore
    const mockCourses: Course[] = [
      {
        id: 'msq-quiz-4',
        title: 'MSQ Quiz 4',
        description: 'Medical School Quiz Set 4 - Comprehensive medical knowledge assessment',
        questionCount: 45,
        estimatedTime: '45 min',
        rating: 4.8,
        tier: 'free',
      },
      {
        id: 'cardiology-fundamentals',
        title: 'Cardiology Fundamentals',
        description: 'Essential cardiology concepts for medical students',
        questionCount: 30,
        estimatedTime: '30 min',
        rating: 4.9,
        tier: 'pro',
      }
    ];

    const resultsSnap = await getDocs(collection(userRef, 'quizResults'));
    const results: Record<string, any> = {};
    resultsSnap.forEach(doc => {
      results[doc.id] = doc.data();
    });

    const notesSnap = await getDocs(collection(userRef, 'notes'));
    const notes: Record<string, any> = {};
    notesSnap.forEach(doc => {
      notes[doc.id] = doc.data();
    });

    setCourses(mockCourses);
    setCompletedQuizData(results);
    setUserNotes(notes);

    setUserStats({
      averageScore: 82,
      quizzesCompleted: Object.keys(results).length,
      tier: 'pro'
    });

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const canAccessCourse = (course: Course) => {
    if (!user) {
      return false;
    }
    const userTier = userStats?.tier || 'free';
    const courseTier = course.tier || 'free';

    return (
      courseTier === 'free' ||
      (courseTier === 'pro' && ['pro', 'premium'].includes(userTier)) ||
      (courseTier === 'premium' && userTier === 'premium')
    );
  };

  const shouldShowETutor = (quizId: string): boolean => {
    const result = completedQuizData[quizId];
    const notes = userNotes[quizId];
    return !!(
      result?.submitted &&
      result?.wrongQuestions?.length > 0 &&
      notes &&
      Object.keys(notes).length > 0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">📚 Available Quizzes</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {courses.map(course => {
          const hasAccess = canAccessCourse(course);
          const showETutor = shouldShowETutor(course.id);

          return (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-md p-6 border hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{course.title}</h2>
                {course.tier !== 'free' && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    course.tier === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {course.tier.toUpperCase()}
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-4">{course.description}</p>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Target className="h-4 w-4 mr-1" />
                {course.questionCount} questions
                <Clock className="h-4 w-4 ml-4 mr-1" />
                {course.estimatedTime}
                <Star className="h-4 w-4 ml-4 mr-1" />
                {course.rating}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => router.push(`/quiz?id=${course.id}`)}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                    hasAccess
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                  disabled={!hasAccess}
                >
                  {hasAccess ? (
                    <>
                      Start Quiz
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Upgrade to Access
                    </>
                  )}
                </button>

                {showETutor && (
                  <button
                    onClick={() => router.push(`/dashboard/etutor/${course.id}`)}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center"
                  >
                    <Book className="h-4 w-4 mr-2" />
                    View eTutor
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoursesDashboard;
