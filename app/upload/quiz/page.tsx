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
      {quiz.questions.map((q, idx) => (
        <div key={q.id} className="mb-6">
          <p className="font-semibold mb-2">{idx + 1}. {q.question}</p>
          {q.options.map((opt, i) => (
            <label key={i} className="block mb-1">
              <input
                type={q.type === "multianswer" ? "checkbox" : "radio"}
                name={q.id}
                value={opt}
                onChange={(e) => {
                  const selected = e.target.value;
                  setAnswers((prev) => {
                    const current = prev[q.id] || [];
                    if (q.type === "multianswer") {
                      const updated = e.target.checked
                        ? [...current, selected]
                        : current.filter((x) => x !== selected);
                      return { ...prev, [q.id]: updated };
                    }
                    return { ...prev, [q.id]: [selected] };
                  });
                }}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}