// lib/contentService.ts
import { doc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface UploadedContent {
  id: string;
  filename: string;
  content: string;
  specialty?: string;
  uploadedAt: any;
  uploadedBy: string;
  fileSize?: number;
  analysisResult?: {
    summary: string;
    keyTopics: string[];
    difficulty: string;
    specialty: string;
    suggestedQuizCount: number;
  };
}

// Get a specific uploaded document by ID
export const getUploadedContent = async (documentId: string): Promise<UploadedContent | null> => {
  try {
    console.log('🔍 Fetching document from Firebase:', documentId);
    
    const docRef = doc(db, "uploadedContent", documentId); // Adjust collection name as needed
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ Document found:', {
        id: docSnap.id,
        filename: data.filename,
        contentLength: data.content?.length,
        hasAnalysis: !!data.analysisResult
      });
      
      return {
        id: docSnap.id,
        ...data
      } as UploadedContent;
    } else {
      console.error('❌ No document found with ID:', documentId);
      return null;
    }
  } catch (error) {
    console.error('💥 Error fetching document:', error);
    throw error;
  }
};

// Get all uploaded content for a specific user
export const getUserUploadedContent = async (userId: string): Promise<UploadedContent[]> => {
  try {
    console.log('🔍 Fetching all content for user:', userId);
    
    const q = query(
      collection(db, "uploadedContent"), 
      where("uploadedBy", "==", userId),
      orderBy("uploadedAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const documents: UploadedContent[] = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      } as UploadedContent);
    });
    
    console.log('✅ Found', documents.length, 'documents for user');
    return documents;
  } catch (error) {
    console.error('💥 Error fetching user content:', error);
    throw error;
  }
};

// Get content with analysis results
export const getAnalyzedContent = async (userId: string): Promise<UploadedContent[]> => {
  try {
    const allContent = await getUserUploadedContent(userId);
    return allContent.filter(content => content.analysisResult);
  } catch (error) {
    console.error('💥 Error fetching analyzed content:', error);
    throw error;
  }
};

// Alternative collection names you might be using
// Adjust these based on your actual Firestore collection structure
export const getUploadedContentFromFiles = async (documentId: string): Promise<UploadedContent | null> => {
  try {
    // Try different possible collection names
    const possibleCollections = ["uploadedContent", "files", "documents", "userFiles", "materials"];
    
    for (const collectionName of possibleCollections) {
      try {
        console.log(`🔍 Trying collection: ${collectionName}`);
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.log(`✅ Found document in collection: ${collectionName}`);
          return {
            id: docSnap.id,
            ...docSnap.data()
          } as UploadedContent;
        }
      } catch (error) {
        console.log(`⚠️ Collection ${collectionName} doesn't exist or no access`);
        continue;
      }
    }
    
    console.error('❌ Document not found in any collection');
    return null;
  } catch (error) {
    console.error('💥 Error in getUploadedContentFromFiles:', error);
    throw error;
  }
};