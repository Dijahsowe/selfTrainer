"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateMaterialPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string>("");

  const charCount = sourceText.length;
  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setLoading(true);
    setUploadingFile(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/study-materials/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process uploaded file");
      }

      if (data.material?.id) {
        router.push(`/dashboard/materials/${data.material.id}`);
        return;
      }

      if (data.title) setTitle(data.title);
      if (data.sourceText) setSourceText(data.sourceText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred while uploading the file.");
    } finally {
      setLoading(false);
      setUploadingFile("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (charCount < 100) {
      setError("Source text must be at least 100 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/study-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, sourceText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create study material");
      }

      router.push(`/dashboard/materials/${data.material.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold text-slate-900">Create Study Material</h1>
      <p className="mt-1 text-sm text-slate-600">
        Upload a PDF, DOCX, TXT, MD, or RTF document to create a study material automatically. You can still paste notes manually if needed.
      </p>

      {error ? (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-slate-700">
              Title <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md,.rtf"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                disabled={loading}
              >
                Upload file
              </button>
            </div>
          </div>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={150}
            required
            placeholder="e.g., Chapter 4: Cellular Respiration"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
          {uploadingFile ? (
            <p className="mt-2 text-xs text-slate-500">Processing: {uploadingFile}</p>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              Content / Notes <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-500">
              {charCount} / 50,000 chars ({wordCount} words)
            </span>
          </div>
          <textarea
            rows={12}
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            required
            placeholder="Paste your raw learning notes here (minimum 100 characters)..."
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || charCount < 100}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Material"}
          </button>
        </div>
      </form>
    </main>
  );
}
