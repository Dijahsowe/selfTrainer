"use client";

import { useState } from "react";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  explanation?: string | null;
  difficulty: string;
}

interface FlashcardReviewProps {
  cards: Flashcard[];
}

export default function FlashcardReview({ cards }: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) {
    return <div className="p-4 text-center text-slate-500">No flashcards available in this deck.</div>;
  }

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Card {currentIndex + 1} of {cards.length}
        </span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-700">
          Difficulty: {currentCard.difficulty}
        </span>
      </div>

      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative flex min-h-[260px] w-full cursor-pointer select-none flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all hover:shadow-md"
      >
        <span className="absolute right-4 top-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {isFlipped ? "Answer" : "Question"}
        </span>

        {!isFlipped ? (
          <h3 className="text-xl font-medium text-slate-900">{currentCard.question}</h3>
        ) : (
          <div className="space-y-3">
            <p className="text-lg font-medium text-blue-900">{currentCard.answer}</p>
            {currentCard.explanation && (
              <p className="border-t border-slate-100 pt-2 text-xs italic text-slate-500">
                {currentCard.explanation}
              </p>
            )}
          </div>
        )}

        <p className="absolute bottom-4 text-xs text-slate-400">Click to flip card</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-500"
        >
          Next Card
        </button>
      </div>
    </div>
  );
}
