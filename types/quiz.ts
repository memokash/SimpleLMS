export type QuestionType = "multiple" | "truefalse" | "multianswer";

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswers: string[]; // Array to support multiple correct
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}
