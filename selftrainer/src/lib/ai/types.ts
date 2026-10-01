export interface QuizQuestionItem {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface FlashcardItem {
  question: string;
  answer: string;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  keyTerms: { term: string; definition: string }[];
}

export interface AIProvider {
  name: string;
  generateSummary(text: string): Promise<SummaryResult>;
  generateFlashcards(text: string, count?: number): Promise<FlashcardItem[]>;
  generateQuiz(text: string, questionCount?: number): Promise<QuizQuestionItem[]>;
}
