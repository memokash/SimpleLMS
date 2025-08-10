'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { useAuth } from '../../../components/AuthContext';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';


export default function EtutorViewerPage() {
  const { quizId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [meta, setMeta] = useState({
    title: '',
    createdAt: '',
    userName: '',
  });

  useEffect(() => {
    if (!user || !quizId) {
      return;
    }

    const fetchEtutor = async () => {
      try {
        const docRef = doc(db, `users/${user.uid}/etutors/${quizId}`);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          console.warn('No tutor summary found.');
          return;
        }

        const data = snap.data();
        setMeta({
          title: data.title || 'Untitled Course',
          createdAt: new Date(data.createdAt.seconds * 1000).toLocaleDateString(),
          userName: data.userName || 'Student',
        });
        setContent(data.content || '');
      } catch (err) {
        console.error('Error fetching tutor summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEtutor();
  }, [user, quizId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <Loader2 className="animate-spin h-6 w-6 mr-2" />
        Loading your smart tutor...
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Cover Page */}
      <div className="relative w-full h-64 md:h-96">
        <Image
          src="/courses-banner.jpg"
          alt="eTutor Cover"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white text-center px-6">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">
            eTutor on {meta.title}
          </h1>
          <p className="text-lg md:text-xl mb-2">Prepared for {meta.userName}</p>
          <p className="text-sm">🗓️ {meta.createdAt}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-white text-gray-700 px-3 py-1 rounded-lg text-sm shadow hover:bg-gray-100"
        >
          <ArrowLeft className="inline w-4 h-4 mr-1" />
          Back
        </button>
      </div>

      {/* Tutoring Content */}
      <div className="prose prose-lg max-w-3xl mx-auto px-4 py-10">
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
        <div className="mt-10 text-sm text-center text-gray-500">
          <p>With guidance from</p>
          <p className="font-bold text-blue-600">Dr. MemoKash 🧠</p>
        </div>
      </div>
    </div>
  );
}