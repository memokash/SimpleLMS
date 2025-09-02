export type QuestionType = "multiple" | "truefalse" | "multianswer";

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswers: string[]; // Array to support multiple correct
  // Additional fields from index.ts for compatibility
  correctAnswer?: number; // Single correct answer index (for backwards compatibility)
  correctExplanation?: string;
  incorrectExplanation?: string;
  hintMessage?: string;
  category?: string;
  specialty?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}
