'use client'
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Quiz, Question } from "../../../types/quiz";

export default function QuizPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const snapshot = await getDocs(collection(db, "courses"));
        const quizData = snapshot.docs[0]?.data() as Quiz;
        setQuiz(quizData);
      } catch (error) {
        console.error("Error loading quiz:", error);
      }
    };
    loadQuiz();
  }, []);

  if (!quiz) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
      <p className="text-gray-600">Quiz results feature coming soon!</p>
    </div>
  );
}
