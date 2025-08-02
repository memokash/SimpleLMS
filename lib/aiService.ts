// lib/aiService.ts
import { saveQuestionsToBank, generateQuizFromBank } from './questionBankService';

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

export const generateQuizFromContent = async (
  content: string, 
  specialty: string, 
  questionCount: number = 10,
  userId: string,
  filename: string = 'Unknown Source'
): Promise<GeneratedQuiz> => {
  try {
    const response = await fetch('/api/ai/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, specialty, questionCount })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate quiz');
    }
    
    const quiz = await response.json();
    
    // Save questions to the question bank
    if (quiz.questions && quiz.questions.length > 0) {
      try {
        const metadata = {
          specialty: specialty,
          difficulty: 'Intermediate', // You could analyze this from content
          filename: filename
        };
        
        await saveQuestionsToBank(quiz.questions, metadata, userId);
        console.log(`Saved ${quiz.questions.length} questions to question bank`);
      } catch (saveError) {
        console.error('Error saving questions to bank:', saveError);
        // Don't throw here - quiz generation succeeded, saving is bonus
      }
    }
    
    return quiz;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

export const generateQuizFromQuestionBank = async (preferences: QuizPreferences): Promise<GeneratedQuiz> => {
  try {
    const quiz = await generateQuizFromBank(preferences);
    return {
      questions: quiz.questions,
      metadata: quiz.metadata,
      title: quiz.title,
      description: quiz.description
    };
  } catch (error) {
    console.error('Error generating quiz from question bank:', error);
    throw error;
  }
};

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

// New function to get AI-powered quiz suggestions based on user performance
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

// Function to create smart quizzes based on weak areas
export const createAdaptiveQuiz = async (
  userId: string,
  userPerformance: any,
  questionCount: number = 20
): Promise<GeneratedQuiz> => {
  try {
    // Analyze user performance to determine focus areas
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

// Helper function to analyze user weak areas
function analyzeWeakAreas(userPerformance: any) {
  // This would analyze user's quiz history, scores by topic, etc.
  // For now, return a basic analysis
  return {
    primarySpecialty: userPerformance.lowestSpecialty || 'General Medicine',
    suggestedDifficulty: userPerformance.averageScore > 80 ? 'Advanced' : 
                        userPerformance.averageScore > 60 ? 'Intermediate' : 'Beginner',
    focusTopics: userPerformance.weakTopics || []
  };
}