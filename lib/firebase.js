import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Fetch quiz metadata
export async function getQuizMetadata(quizId) {
  const docRef = doc(db, 'courses', quizId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

// Fetch quiz questions
export async function getQuizQuestions(quizId) {
  const questionsRef = collection(db, 'courses', quizId, 'questions');
  const querySnapshot = await getDocs(questionsRef);
  
  const questions = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    
    // Build options array, filtering out NaN values
    const options = [];
    ['a', 'b', 'c', 'd', 'e'].forEach(letter => {
      const option = data[`Option (${letter})`];
      if (option && option !== 'NaN') {
        options.push(option);
      }
    });
    
    // Find correct answer index
    const correctLetter = data.Answer;
    const correctIndex = ['a', 'b', 'c', 'd', 'e'].indexOf(correctLetter);
    
    questions.push({
      id: doc.id,
      question: data.Question,
      options: options,
      correct: Math.max(0, correctIndex),
      points: data.Points || 1
    });
  });
  
  return questions.sort((a, b) => a.id.localeCompare(b.id));
}