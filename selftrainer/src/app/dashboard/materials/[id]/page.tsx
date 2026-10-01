"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FlashcardReview from "@/components/flashcards/FlashcardReview";
import QuizRunner from "@/components/quiz/QuizRunner";

interface KeyTerm {
  term: string;
  definition: string;
}

interface SummaryData {
  id: string;
  content: string;
  keyPoints: string[];
  keyTerms: KeyTerm[];
}

interface FlashcardData {
  id: string;
  question: string;
  answer: string;
  explanation?: string | null;
  difficulty: string;
}

interface QuizQuestionData {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
}

interface MaterialData {
  id: string;
  title: string;
  sourceText: string;
  wordCount: number;
  summaries: SummaryData[];
  flashcardDecks?: Array<{
    id: string;
    title: string;
    flashcards: FlashcardData[];
  }>;
  quizzes?: Array<{
    id: string;
    title: string;
    questionCount: number;
    questions: QuizQuestionData[];
  }>;
}

export default function MaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [material, setMaterial] = useState<MaterialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "source" | "flashcards" | "quiz">("summary");

  const fetchMaterial = async () => {
    try {
      const response = await fetch(`/api/study-materials/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setMaterial(data.material);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!params.id) return;
    fetchMaterial();
  }, [params.id]);

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);

    try {
      const response = await fetch(`/api/study-materials/${params.id}/summarize`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchMaterial();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setGeneratingFlashcards(true);

    try {
      const response = await fetch(`/api/study-materials/${params.id}/flashcards`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchMaterial();
        setActiveTab("flashcards");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);

    try {
      const response = await fetch(`/api/study-materials/${params.id}/quizzes`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchMaterial();
        setActiveTab("quiz");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading study material...</div>;
  }

  if (!material) {
    return <div className="p-8 text-center text-red-500">Study material not found.</div>;
  }

  const latestSummary = material.summaries[material.summaries.length - 1];
  const latestDeck = material.flashcardDecks?.[0];
  const latestQuiz = material.quizzes?.[0];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{material.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{material.wordCount} words</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("summary")}
          className={`pb-2 text-sm font-medium ${
            activeTab === "summary"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          AI Summary & Insights
        </button>
        <button
          onClick={() => setActiveTab("flashcards")}
          className={`pb-2 text-sm font-medium ${
            activeTab === "flashcards"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Flashcards
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          className={`pb-2 text-sm font-medium ${
            activeTab === "quiz"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Quiz
        </button>
        <button
          onClick={() => setActiveTab("source")}
          className={`pb-2 text-sm font-medium ${
            activeTab === "source"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Original Source Text
        </button>
      </div>

      {activeTab === "summary" && (
        <div className="space-y-6">
          {!latestSummary ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <h3 className="text-lg font-semibold text-slate-800">No Summary Generated Yet</h3>
              <p className="mt-1 text-sm text-slate-600">
                Click below to process your notes and generate an AI summary with key takeaways.
              </p>
              <button
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-500 disabled:opacity-50"
              >
                {generatingSummary ? "Generating AI Summary..." : "Generate AI Summary"}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <h2 className="mb-2 text-lg font-semibold text-slate-900">Executive Summary</h2>
                <p className="leading-relaxed text-slate-700">{latestSummary.content}</p>
              </div>

              {latestSummary.keyPoints && latestSummary.keyPoints.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <h2 className="mb-3 text-lg font-semibold text-slate-900">Key Takeaways</h2>
                  <ul className="list-inside list-disc space-y-2 text-slate-700">
                    {latestSummary.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {latestSummary.keyTerms && latestSummary.keyTerms.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <h2 className="mb-3 text-lg font-semibold text-slate-900">Key Concepts & Terms</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {latestSummary.keyTerms.map((item, index) => (
                      <div key={index} className="rounded-md border border-slate-100 bg-slate-50 p-4">
                        <span className="font-semibold text-blue-900">{item.term}</span>
                        <p className="mt-1 text-xs text-slate-600">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "flashcards" && (
        <div className="space-y-6">
          {!latestDeck ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <h3 className="text-lg font-semibold text-slate-800">No Flashcards Generated Yet</h3>
              <p className="mt-1 text-sm text-slate-600">
                Build a quick review deck from this material.
              </p>
              <button
                onClick={handleGenerateFlashcards}
                disabled={generatingFlashcards}
                className="mt-4 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-violet-500 disabled:opacity-50"
              >
                {generatingFlashcards ? "Generating Flashcards..." : "Generate Flashcards"}
              </button>
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Review Deck</h2>
                <button
                  onClick={handleGenerateFlashcards}
                  disabled={generatingFlashcards}
                  className="rounded-md border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-50"
                >
                  {generatingFlashcards ? "Generating..." : "Regenerate"}
                </button>
              </div>
              <FlashcardReview cards={latestDeck.flashcards} />
            </div>
          )}
        </div>
      )}

      {activeTab === "quiz" && (
        <div className="space-y-6">
          {!latestQuiz ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <h3 className="text-lg font-semibold text-slate-800">No Quiz Generated Yet</h3>
              <p className="mt-1 text-sm text-slate-600">
                Generate a short multiple-choice assessment for this note set.
              </p>
              <button
                onClick={handleGenerateQuiz}
                disabled={generatingQuiz}
                className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-500 disabled:opacity-50"
              >
                {generatingQuiz ? "Generating Quiz..." : "Generate Quiz"}
              </button>
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Practice Quiz</h2>
                <button
                  onClick={handleGenerateQuiz}
                  disabled={generatingQuiz}
                  className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                >
                  {generatingQuiz ? "Generating..." : "Refresh Quiz"}
                </button>
              </div>
              <QuizRunner quizId={latestQuiz.id} questions={latestQuiz.questions} />
            </div>
          )}
        </div>
      )}

      {activeTab === "source" && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-800">
          {material.sourceText}
        </div>
      )}
    </div>
  );
}
