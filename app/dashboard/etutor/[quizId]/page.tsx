'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { useAuth } from '../../../components/AuthContext';
import Image from 'next/image';
import banner from './public/courses-banner.jpg';


export default function ETutorPage() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchData = async () => {
      try {
        const statsRef = doc(db, 'userStats', user.uid, 'quizzes', quizId as string);
        const statsSnap = await getDoc(statsRef);

        if (!statsSnap.exists()) {
          setError('No data found for this quiz.');
          return;
        }

        const data = statsSnap.data();
        const { notes, incorrectAnswers, quizTitle } = data;

        const response = await fetch('/api/generate-etutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: user.displayName || 'Student',
            quizTitle: quizTitle || quizId,
            notes,
            incorrectAnswers,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to generate eTutor');
        }

        setContent(result.content);
      } catch (err: any) {
        console.error('Error:', err);
        setError('Failed to load eTutor content.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, quizId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center text-blue-600">📘 Generating your eTutor…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 px-6 py-10 max-w-4xl mx-auto prose">
      {/* 🖼 Cover */}
      <div className="text-center mb-12">
        <Image
          src={banner}
          alt="eTutor Cover"
          width={640}
          height={400}
          className="rounded-xl mx-auto mb-4"
        />
        <h1 className="text-4xl font-bold">eTutor on {quizId}</h1>
        <p className="text-lg text-gray-600">For {user?.displayName || 'You'} | {new Date().toLocaleDateString()}</p>
      </div>

      {/* 🧠 Tutor Content */}
      {content && (
        <div className="prose lg:prose-lg max-w-none">
          {content.split('\n').map((para, index) => (
            <p key={index}>{para}</p>
          ))}
        </div>
      )}
    </div>
  );
}
