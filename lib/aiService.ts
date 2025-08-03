// lib/aiService.ts
import { getUploadedContent, getUploadedContentFromFiles, UploadedContent } from './contentService';

interface AIAnalysisResult {
  summary: string;
  keyTopics: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  specialty: string;
  suggestedQuizCount: number;
}

interface GeneratedQuiz {
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    topic: string;
  }[];
  savedToBank?: boolean;
  bankMessage?: string;
  metadata?: any;
  title?: string;
  description?: string;
}

interface QuizPreferences {
  specialty?: string;
  difficulty?: string;
  topics?: string[];
  questionCount?: number;
  userId: string;
  excludeUsedRecently?: boolean;
}

export const analyzeContent = async (content: string, filename: string): Promise<AIAnalysisResult> => {
  try {
    const response = await fetch('/api/ai/analyze-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, filename })
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze content');
    }
    return await response.json();
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
};

// NEW: Generate quiz from Firebase document ID
export const generateQuizFromUploadedContent = async (
  documentId: string,
  userId: string,
  questionCount: number = 10,
  specialtyOverride?: string
): Promise<GeneratedQuiz> => {
  try {
    console.log('🚀 generateQuizFromUploadedContent called with documentId:', documentId);
    
    // Step 1: Retrieve the content from Firebase
    console.log('📁 Retrieving content from Firebase...');
    let uploadedContent: UploadedContent | null;
    
    try {
      // Try the main function first
      uploadedContent = await getUploadedContent(documentId);
    } catch (error) {
      console.log('⚠️ Primary method failed, trying alternative collections...');
      // If that fails, try alternative collection names
      uploadedContent = await getUploadedContentFromFiles(documentId);
    }
    
    if (!uploadedContent) {
      throw new Error(`No content found with ID: ${documentId}`);
    }
    
    console.log('✅ Content retrieved successfully:', {
      filename: uploadedContent.filename,
      contentLength: uploadedContent.content?.length,
      hasAnalysis: !!uploadedContent.analysisResult
    });
    
    // Step 2: Determine specialty
    const specialty = specialtyOverride || 
                    uploadedContent.analysisResult?.specialty || 
                    uploadedContent.specialty || 
                    'General Medicine';
    
    console.log('📋 Using specialty:', specialty);
    
    // Step 3: Generate quiz using the retrieved content
    return await generateQuizFromContent(
      uploadedContent.content,
      specialty,
      questionCount,
      userId,
      uploadedContent.filename
    );
    
  } catch (error) {
    console.error('💥 Error in generateQuizFromUploadedContent:', error);
    throw error;
  }
};

// UPDATED: Original function with better logging
export const generateQuizFromContent = async (
  content: string, 
  specialty: string, 
  questionCount: number = 10,
  userId?: string,
  filename?: string
): Promise<GeneratedQuiz> => {
  try {
    console.log('🚀 generateQuizFromContent called');
    console.log('📊 Parameters:', {
      contentLength: content.length,
      specialty,
      questionCount,
      userId,
      filename
    });

    // Validate inputs
    if (!content || content.trim().length === 0) {
      throw new Error('Content is required and cannot be empty');
    }

    if (questionCount < 1 || questionCount > 50) {
      throw new Error('Question count must be between 1 and 50');
    }

    console.log('🌐 Making API request to /api/ai/generate-quiz');
    
    const response = await fetch('/api/ai/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content, 
        specialty, 
        questionCount,
        userId,
        filename
      })
    });
    
    console.log('📡 Response received:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Quiz generated successfully:', {
      questionCount: result.questions?.length,
      savedToBank: result.savedToBank
    });
    
    return result;
  } catch (error) {
    console.error('💥 Error in generateQuizFromContent:', error);
    throw error;
  }
};

// NEW: Get available content for quiz generation
export const getAvailableContentForQuiz = async (userId: string): Promise<UploadedContent[]> => {
  try {
    const { getUserUploadedContent } = await import('./contentService');
    const content = await getUserUploadedContent(userId);
    
    // Filter content that has actual text content
    return content.filter(item => 
      item.content && 
      item.content.trim().length > 100 // At least 100 characters
    );
  } catch (error) {
    console.error('Error getting available content:', error);
    throw error;
  }
};

// NEW: Smart quiz generation based on analysis
export const generateSmartQuiz = async (
  documentId: string,
  userId: string,
  useAnalysisRecommendations: boolean = true
): Promise<GeneratedQuiz> => {
  try {
    console.log('🧠 generateSmartQuiz called');
    
    const uploadedContent = await getUploadedContent(documentId);
    if (!uploadedContent) {
      throw new Error(`No content found with ID: ${documentId}`);
    }
    
    let questionCount = 10;
    let specialty = 'General Medicine';
    
    // Use analysis recommendations if available
    if (useAnalysisRecommendations && uploadedContent.analysisResult) {
      questionCount = uploadedContent.analysisResult.suggestedQuizCount || 10;
      specialty = uploadedContent.analysisResult.specialty || 'General Medicine';
      
      console.log('📊 Using analysis recommendations:', {
        specialty,
        questionCount,
        difficulty: uploadedContent.analysisResult.difficulty
      });
    }
    
    return await generateQuizFromContent(
      uploadedContent.content,
      specialty,
      questionCount,
      userId,
      uploadedContent.filename
    );
    
  } catch (error) {
    console.error('💥 Error in generateSmartQuiz:', error);
    throw error;
  }
};

// Existing functions remain the same...
export const getStudyRecommendations = async (userProgress: any): Promise<string[]> => {
  try {
    const response = await fetch('/api/ai/study-recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userProgress })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get recommendations');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
};

export const getAIQuizSuggestions = async (userId: string, userStats: any): Promise<QuizPreferences[]> => {
  try {
    const response = await fetch('/api/ai/quiz-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userStats })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get quiz suggestions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting quiz suggestions:', error);
    throw error;
  }
};

export const generateQuizFromQuestionBank = async (preferences: QuizPreferences): Promise<GeneratedQuiz> => {
  try {
    throw new Error('Question bank service not yet implemented. Please create questionBankService.js first.');
  } catch (error) {
    console.error('Error generating quiz from question bank:', error);
    throw error;
  }
};

export const createAdaptiveQuiz = async (
  userId: string,
  userPerformance: any,
  questionCount: number = 20
): Promise<GeneratedQuiz> => {
  try {
    const weakAreas = analyzeWeakAreas(userPerformance);
    
    const preferences: QuizPreferences = {
      specialty: weakAreas.primarySpecialty,
      difficulty: weakAreas.suggestedDifficulty,
      topics: weakAreas.focusTopics,
      questionCount,
      userId,
      excludeUsedRecently: true
    };
    
    return await generateQuizFromQuestionBank(preferences);
  } catch (error) {
    console.error('Error creating adaptive quiz:', error);
    throw error;
  }
};

function analyzeWeakAreas(userPerformance: any) {
  return {
    primarySpecialty: userPerformance.lowestSpecialty || 'General Medicine',
    suggestedDifficulty: userPerformance.averageScore > 80 ? 'Advanced' : 
                        userPerformance.averageScore > 60 ? 'Intermediate' : 'Beginner',
    focusTopics: userPerformance.weakTopics || []
  };
}