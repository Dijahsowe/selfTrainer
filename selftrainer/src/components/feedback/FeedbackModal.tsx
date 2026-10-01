"use client";

import { FormEvent, useState } from "react";

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!feedback.trim()) {
      return;
    }

    console.log("Beta User Feedback Submitted:", feedback);
    setSubmitted(true);

    window.setTimeout(() => {
      setSubmitted(false);
      setFeedback("");
      setIsOpen(false);
    }, 2000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-blue-500"
        >
          💬 Beta Feedback
        </button>
      ) : (
        <div className="w-80 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Send Beta Feedback</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          {submitted ? (
            <p className="py-4 text-center text-xs font-medium text-emerald-600">
              Thank you for your feedback!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                rows={3}
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Found a bug or have a suggestion? Let us know!"
                className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-500"
              >
                Submit Feedback
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
