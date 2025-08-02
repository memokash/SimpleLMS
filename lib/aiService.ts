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
  questionCount: number = 10
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
    return await response.json();
  } catch (error) {
    console.error('Error generating quiz:', error);
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