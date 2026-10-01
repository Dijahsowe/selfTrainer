import OpenAI from "openai";
import { getGroundingText, getGroundingSentences } from "../grounding";
import { AIProvider, FlashcardItem, QuizQuestionItem, SummaryResult } from "../types";

export class OpenAIProvider implements AIProvider {
  name = "openai";
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "dummy-key",
    });
  }

  async generateSummary(text: string): Promise<SummaryResult> {
    const groundingText = getGroundingText(text, 8);

    if (!groundingText.trim()) {
      throw new Error("No usable source text found in the uploaded document.");
    }

    const prompt = `You are generating a summary strictly from the uploaded document. Use only facts that appear in the source text below. Do not add outside knowledge, assumptions, or generic advice. Extract the most important ideas and restate them accurately.

Respond ONLY with a valid JSON object matching this exact structure:
{
  "summary": "A concise executive summary paragraph (3-5 sentences)",
  "keyPoints": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
  "keyTerms": [
    {"term": "Term 1", "definition": "Definition 1"},
    {"term": "Term 2", "definition": "Definition 2"}
  ]
}

Source text:
${groundingText.slice(0, 12000)}`;

    const response = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Received empty response from OpenAI");
    }

    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary || "",
      keyPoints: parsed.keyPoints || [],
      keyTerms: parsed.keyTerms || [],
    };
  }

  async generateFlashcards(text: string, count = 5): Promise<FlashcardItem[]> {
    const groundingText = getGroundingText(text, 10);

    if (!groundingText.trim()) {
      throw new Error("No usable source text found in the uploaded document.");
    }

    const prompt = `Create ${count} flashcards using only facts from the source document. Each card should be grounded in the uploaded text, not in generic study advice. Use specific concepts, definitions, causes, effects, or comparisons that appear in the text.

Respond ONLY with a JSON object containing a "flashcards" array.
Each object must match this shape:
{
  "question": "Clear question based on the document",
  "answer": "Concise, accurate answer drawn from the document",
  "explanation": "Short explanation tied directly to the source content",
  "difficulty": "easy" | "medium" | "hard"
}

Source text:
${groundingText.slice(0, 12000)}`;

    const response = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Received empty response from OpenAI");
    }

    const parsed = JSON.parse(content);
    return parsed.flashcards || [];
  }

  async generateQuiz(text: string, questionCount = 5): Promise<QuizQuestionItem[]> {
    const groundingText = getGroundingText(text, 10);

    if (!groundingText.trim()) {
      throw new Error("No usable source text found in the uploaded document.");
    }

    const prompt = `Generate a ${questionCount}-question multiple-choice quiz using only information explicitly stated in the source text. Do not create facts that are not in the document. All answer choices should be grounded in the source material, and the correct answer must match the document exactly.

Respond ONLY with a JSON object containing a "questions" array matching:
{
  "questions": [
    {
      "questionText": "Question text based on the document",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact matching text of the correct option",
      "explanation": "Why this answer is correct based on the uploaded content",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

Source text:
${groundingText.slice(0, 12000)}`;

    const response = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Received empty response from OpenAI");
    }

    const parsed = JSON.parse(content);
    return parsed.questions || [];
  }
}
