'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../app/components/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import Image from 'next/image';
import banner from '@/public/courses-banner.jpg';
import { format } from 'date-fns';

interface FirestoreNoteData {
  notes: { [questionId: string]: string };
  wrongAnswers: { [questionId: string]: string }; // optional
  completedAt: { seconds: number; nanoseconds: number };
  submitted: boolean;
  score?: number;
}

export default function ETutorPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { quizId } = useParams();
  const [loading, setLoading] = useState(true);
  const [pdfContent, setPdfContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadNotesAndGenerate = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'userNotes', `${user.uid}_${quizId}`);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          setError('No notes or quiz data found for this quiz.');
          return;
        }

        const data = snap.data() as FirestoreNoteData;

        if (!data.submitted) {
          setError('This quiz is not yet completed.');
          return;
        }

        const hasMistakes = Object.keys(data.wrongAnswers || {}).length > 0;
        if (!hasMistakes) {
          setError('No tutoring needed — all answers correct!');
          return;
        }

        const date = format(new Date(data.completedAt.seconds * 1000), 'PPP');
        const notesText = Object.entries(data.notes)
          .map(([qId, note]) => `Q${qId}: ${note}`)
          .join('\n\n');

        const mistakesText = Object.entries(data.wrongAnswers || {})
          .map(([qId, wrong]) => `Q${qId}: ${wrong}`)
          .join('\n\n');

        const prompt = `
You are Dr. MemoKash, a comical and seasoned college professor.
Create an engaging tutoring session eBook based on this student's quiz performance.

- Address the user by name: ${user.displayName || 'Medical Student'}
- Quiz: ${quizId}
- Date: ${date}
- Score: ${data.score || 'N/A'}

Start with a warm welcome and light humor.
Summarize performance.
Then walk through their mistakes (below), explaining each clearly.
Use their notes (below) to guide the tutoring.
Add study tips if possible.
Sign off as Dr. MemoKash.

Mistakes:
${mistakesText}

Notes:
${notesText}
        `;

        // ✅ Call OpenAI
        const openAiRes = await fetch('/api/generate-etutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });

        const result = await openAiRes.json();
        if (!result.content) {
          throw new Error('No content returned from AI');
        }
        setPdfContent(result.content);
      } catch (e: any) {
        console.error(e);
        setError(e.message || 'Error generating eTutor PDF');
      } finally {
        setLoading(false);
      }
    };

    loadNotesAndGenerate();
  }, [quizId, user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Please sign in to view your eTutor</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Generating your eTutor…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">⚠️ Something went wrong</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 py-12 px-4">
      {/* Cover */}
      <div className="max-w-4xl mx-auto mb-12 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative h-56 w-full">
          <Image src={banner} alt="Cover" fill className="object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white text-center p-4">
            <h1 className="text-3xl font-bold">eTutor: {quizId}</h1>
            <p className="text-sm mt-2">Prepared for {user.displayName || 'You'} · {format(new Date(), 'PPP')}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-xl space-y-8 prose prose-lg">
        {pdfContent.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}
