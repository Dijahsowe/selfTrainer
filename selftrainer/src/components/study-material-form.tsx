"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function StudyMaterialForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("General");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/study-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subject, description, link }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save study material");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save study material");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Add learning resource</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Save a study material</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none transition focus:border-slate-400"
            placeholder="Biology practice quiz"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none transition focus:border-slate-400"
            placeholder="General"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Link (optional)</label>
          <input
            type="url"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none transition focus:border-slate-400"
            placeholder="https://example.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none transition focus:border-slate-400"
            placeholder="Quick notes about why this resource matters"
          />
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save material"}
        </button>
      </div>
    </form>
  );
}
