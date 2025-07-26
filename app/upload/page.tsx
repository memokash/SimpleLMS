'use client'
import { useState } from "react";
import { parseExcelToQuestions } from "../../lib/parseExcel";
import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

// Define Question type inline for now
interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
  points?: number;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleUpload = async () => {
    if (!file || !quizTitle) return alert("Please select file and title");
    setLoading(true);
    
    try {
      const questions: Question[] = await parseExcelToQuestions(file);
      await addDoc(collection(db, "courses"), {    
        title: quizTitle,
        questions,
      });
      alert("Quiz uploaded!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed!");
    }
    
    setLoading(false);
  };
  
  return (
    <div className="p-8 max-w-xl mx-auto">       
      <h1 className="text-2xl font-bold mb-4">Upload Quiz</h1>
      <input
        type="text"
        placeholder="Quiz title"
        className="mb-4 p-2 border w-full"       
        value={quizTitle}
        onChange={(e) => setQuizTitle(e.target.value)}
      />
      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}    
      </button>
    </div>
  );
}