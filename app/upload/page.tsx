'use client'
import { useState } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Question, Quiz } from "../../types/quiz";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleUpload = async () => {
    if (!file || !quizTitle) {
      return alert("Please select file and title");
    }
    setLoading(true);
    
    try {
      // For now, just show a placeholder - we'll implement parseExcelToQuestions later
      alert("Upload feature coming soon! Please add quizzes manually to Firebase for now.");
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
        {loading ? "Uploading..." : "Upload (Coming Soon)"}    
      </button>
    </div>
  );
}