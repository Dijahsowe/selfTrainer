"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function StudySessionForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [durationMin, setDurationMin] = useState(45);
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/study-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, topic, durationMin, completed, notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save study session");
      }

      router.refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save study session");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Study session</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Log a focused study block</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Session title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none transition focus:border-slate-400"
            placeholder="Algebra practice"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Topic</label>
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none transition focus:border-slate-400"
            placeholder="Quadratic equations"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Duration (minutes)</label>
          <input
            type="number"
            min={15}
            max={240}
            value={durationMin}
            onChange={(event) => setDurationMin(Number(event.target.value))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none transition focus:border-slate-400"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none transition focus:border-slate-400"
            placeholder="Reviewed 10 sample problems and checked the trickiest mistakes."
          />
        </div>

        <div className="md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={completed}
              onChange={(event) => setCompleted(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            Mark this session as complete
          </label>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save session"}
        </button>
      </div>
    </form>
  );
}
