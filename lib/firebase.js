import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

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
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Fetch quiz metadata
export async function getQuizMetadata(quizId) {
  const docRef = doc(db, 'courses', quizId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

// Fetch quiz questions with proper option parsing
export async function getQuizQuestions(quizId) {
  const questionsRef = collection(db, 'courses', quizId, 'questions');
  const querySnapshot = await getDocs(questionsRef);
  
  const questions = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    
    // Build options array from your Firestore structure
    const options = [];
    const optionLetters = ['a', 'b', 'c', 'd', 'e'];
    
    optionLetters.forEach(letter => {
      const optionKey = `Option (${letter})`;
      const option = data[optionKey];
      if (option && option !== 'NaN' && option.trim() !== '') {
        options.push(option);
      }
    });
    
    // Find correct answer index based on the answer letter
    const answerLetter = data.Answer?.toLowerCase();
    let correctIndex = 0;
    
    if (answerLetter) {
      // Find which position this letter corresponds to in our filtered options
      let currentIndex = 0;
      for (let i = 0; i < optionLetters.length; i++) {
        const letter = optionLetters[i];
        const optionKey = `Option (${letter})`;
        const option = data[optionKey];
        
        if (option && option !== 'NaN' && option.trim() !== '') {
          if (letter === answerLetter) {
            correctIndex = currentIndex;
            break;
          }
          currentIndex++;
        }
      }
    }
    
    // Only add questions that have options
    if (options.length > 0) {
      questions.push({
        id: doc.id,
        question: data.Question || 'No question text',
        options: options,
        correct: correctIndex,
        points: data.Points || 1,
        category: data.Category || 'General',
        answerType: data['Answer Type'] || 'single',
        questionTitle: data['Question Title'] || ''
      });
    }
  });
  
  return questions.sort((a, b) => a.id.localeCompare(b.id));
}