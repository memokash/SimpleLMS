import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, Firestore, DocumentData } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const validateFirebaseConfig = (config: FirebaseConfig): void => {
  const missingKeys = Object.entries(config)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.error('❌ Missing Firebase environment variables:', missingKeys);
    throw new Error(`Missing Firebase configuration: ${missingKeys.join(', ')}`);
  }

  console.log('✅ Firebase configuration validated');
};

// Initialize Firebase with error handling
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;
let googleProvider: GoogleAuthProvider;

try {
  validateFirebaseConfig(firebaseConfig);
  
  app = initializeApp(firebaseConfig as any);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
  
  console.log('✅ Firebase initialized successfully');
  console.log('🔥 Project ID:', firebaseConfig.projectId);
  
} catch (error) {
  console.error('💥 Firebase initialization failed:', error);
  throw error;
}

export { db, auth, storage, googleProvider };
export default app;

// Question interface for TypeScript
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  points: number;
  category: string;
  answerType: string;
  questionTitle: string;
  correctExplanation: string | null;
  incorrectExplanation: string | null;
  hintMessage: string | null;
  correctAnswerMessage: string | null;
  incorrectAnswerMessage: string | null;
}

// Enhanced quiz metadata function with TypeScript
export async function getQuizMetadata(quizId: string): Promise<DocumentData | null> {
  try {
    console.log('📖 Fetching quiz metadata for:', quizId);
    
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = doc(db, 'courses', quizId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('✅ Quiz metadata found');
      return docSnap.data();
    } else {
      console.warn('⚠️ Quiz metadata not found for:', quizId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching quiz metadata:', error);
    throw error;
  }
}

// Enhanced quiz questions function with TypeScript and better error handling
export async function getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
  try {
    console.log('📝 Fetching quiz questions for:', quizId);
    
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const questionsRef = collection(db, 'courses', quizId, 'questions');
    const querySnapshot = await getDocs(questionsRef);
    
    const questions: QuizQuestion[] = [];
    let processedCount = 0;
    let validQuestions = 0;
    
    querySnapshot.forEach((doc) => {
      processedCount++;
      const data = doc.data();
      
      try {
        // Build options array from your Firestore structure
        const options: string[] = [];
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
          validQuestions++;
          questions.push({
            id: doc.id,
            question: data.Question || 'No question text',
            options: options,
            correct: correctIndex,
            points: data.Points || 1,
            category: data.Category || 'General',
            answerType: data['Answer Type'] || 'single',
            questionTitle: data['Question Title'] || '',
            // Explanations
            correctExplanation: data.CorrectExplanation || null,
            incorrectExplanation: data.IncorrectExplanation || null,
            hintMessage: data['Hint Message'] || null,
            correctAnswerMessage: data['Correct Answer Message'] || null,
            incorrectAnswerMessage: data['Incorrect Answer Message'] || null
          });
        } else {
          console.warn('⚠️ Skipping question with no valid options:', doc.id);
        }
      } catch (questionError) {
        console.error('❌ Error processing question:', doc.id, questionError);
      }
    });
    
    console.log(`✅ Processed ${processedCount} documents, found ${validQuestions} valid questions`);
    
    return questions.sort((a, b) => a.id.localeCompare(b.id));
    
  } catch (error) {
    console.error('❌ Error fetching quiz questions:', error);
    throw error;
  }
}

// Test Firebase connection function
export async function testFirebaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🧪 Testing Firebase connection...');
    
    // Test Firestore read
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    
    console.log('✅ Firebase connection test successful');
    return {
      success: true,
      message: 'Firebase connected successfully!'
    };
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}