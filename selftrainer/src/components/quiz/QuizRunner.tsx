"use client";

import { useState } from "react";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  explanation: string;
}

interface QuizResult {
  scorePercentage: number;
  correctCount: number;
  totalQuestions: number;
  questionResults: Record<string, { correct: boolean; correctAnswer: string; explanation: string }>;
}

interface QuizRunnerProps {
  quizId: string;
  questions: Question[];
}

export default function QuizRunner({ quizId, questions }: QuizRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (questionId: string, option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quizzes/${quizId}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAnswers: answers }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4">
      {submitted && result && (
        <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
          <h2 className="text-2xl font-bold text-blue-900">Quiz Completed!</h2>
          <p className="text-lg font-medium text-blue-700">
            Score: {result.scorePercentage}% ({result.correctCount} / {result.totalQuestions} correct)
          </p>
        </div>
      )}

      {questions.map((q, index) => {
        const selected = answers[q.id];
        const questionResult = result?.questionResults[q.id];
        const isCorrect = questionResult?.correct ?? false;
        const optionsList: string[] = Array.isArray(q.options) ? q.options : [];

        return (
          <div key={q.id} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">
              {index + 1}. {q.questionText}
            </h3>

            <div className="space-y-2">
              {optionsList.map((option, optIdx) => {
                let btnStyle = "border-slate-200 hover:bg-slate-50 text-slate-700";

                if (selected === option) {
                  btnStyle = "border-blue-600 bg-blue-50 text-blue-900 font-medium";
                }

                if (submitted) {
                  if (option === questionResult?.correctAnswer) {
                    btnStyle = "border-green-600 bg-green-50 text-green-900 font-medium";
                  } else if (selected === option && !isCorrect) {
                    btnStyle = "border-red-600 bg-red-50 text-red-900";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(q.id, option)}
                    disabled={submitted}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-all ${btnStyle}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {submitted && questionResult && (
              <div className="rounded-md border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
                <span className="font-semibold">{questionResult.correct ? "Correct. " : `Answer: ${questionResult.correctAnswer}. `}Explanation:</span> {questionResult.explanation}
              </div>
            )}
          </div>
        );
      })}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={loading || Object.keys(answers).length < questions.length}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Quiz"}
        </button>
      )}
    </div>
  );
}
