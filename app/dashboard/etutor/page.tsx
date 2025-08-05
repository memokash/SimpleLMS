'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';

interface EtutorSummary {
  quizId: string;
  title: string;
  createdAt: string;
  notesCount: number;
}

export default function EtutorDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [summaries, setSummaries] = useState<EtutorSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchSummaries = async () => {
      try {
        const ref = collection(db, `users/${user.uid}/etutors`);
        const snapshot = await getDocs(ref);

        const parsed: EtutorSummary[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            quizId: data.quizId,
            title: data.title,
            createdAt: new Date(data.createdAt?.seconds * 1000).toLocaleDateString(),
            notesCount: data.notesCount || 0,
          };
        });

        setSummaries(parsed.filter((s) => s.notesCount > 0)); // show only if they had notes
      } catch (err) {
        console.error('Failed to fetch tutor summaries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading your eTutor summaries...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 md:px-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-indigo-500" />
          Your Smart Tutor Summaries
        </h1>

        {summaries.length === 0 ? (
          <p className="text-gray-600">You haven’t completed any AI Tutor quizzes yet with notes.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {summaries.map((s) => (
              <div
                key={s.quizId}
                onClick={() => router.push(`/dashboard/etutor/${encodeURIComponent(s.quizId)}`)}
                className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-md transition border border-gray-200"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{s.title}</h2>
                <p className="text-sm text-gray-600 mb-1">📝 {s.notesCount} notes</p>
                <p className="text-xs text-gray-400">📅 {s.createdAt}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
