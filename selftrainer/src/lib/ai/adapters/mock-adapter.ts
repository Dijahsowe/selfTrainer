import { getGroundingSentences } from "../grounding";
import { AIProvider, FlashcardItem, QuizQuestionItem, SummaryResult } from "../types";

export class MockAIProvider implements AIProvider {
  name = "mock";

  async generateSummary(text: string): Promise<SummaryResult> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const sentences = getGroundingSentences(text, 6);
    const [lead, second, third, fourth] = sentences;

    return {
      summary: lead
        ? `Based on the uploaded material, ${lead}`
        : "This study material presents the core concepts and essential information in the uploaded document.",
      keyPoints: [
        second || "Key concept: the central idea discussed in the uploaded document.",
        third || "Important detail: the document explains the primary mechanisms and evidence in context.",
        fourth || "Takeaway: the content emphasizes the main conclusions and practical application.",
      ],
      keyTerms: [
        {
          term: "Core concept",
          definition: "The main topic or framework described in the uploaded document.",
        },
        {
          term: "Supporting detail",
          definition: "A specific idea that clarifies the main concept and strengthens understanding.",
        },
      ],
    };
  }

  async generateFlashcards(text: string, count = 5): Promise<FlashcardItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const facts = getGroundingSentences(text, 8);
    const cards: FlashcardItem[] = facts.map((fact, index) => ({
      question: `What is the main idea in this statement from the document? ${fact.slice(0, 80)}${fact.length > 80 ? "..." : ""}`,
      answer: fact,
      explanation: "This answer is directly taken from the uploaded study material.",
      difficulty: index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard",
    }));

    return cards.slice(0, Math.max(1, Math.min(count, cards.length)));
  }

  async generateQuiz(text: string, questionCount = 3): Promise<QuizQuestionItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const facts = getGroundingSentences(text, 8);

    const questions: QuizQuestionItem[] = facts.map((fact, index) => ({
      questionText: `Which statement is most directly supported by the uploaded document?`,
      options: [
        fact,
        `A general statement that does not appear in the document about ${fact.split(" ").slice(0, 3).join(" ")}`,
        "A fact unrelated to the uploaded document.",
        "A broad claim with no support in the document.",
      ],
      correctAnswer: fact,
      explanation: "The correct answer reflects the exact information contained in the uploaded material.",
      difficulty: index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard",
    }));

    return questions.slice(0, Math.max(1, Math.min(questionCount, questions.length)));
  }
}
