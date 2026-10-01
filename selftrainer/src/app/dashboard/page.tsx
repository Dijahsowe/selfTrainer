"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalMaterials: number;
  totalSummaries: number;
  totalFlashcardDecks: number;
  totalQuizAttempts: number;
  averageQuizScore: number;
}

interface RecentMaterial {
  id: string;
  title: string;
  wordCount: number;
  createdAt: string;
  subject?: { name: string } | null;
  summaries: { id: string }[];
  flashcardDecks: { id: string }[];
  quizzes: { id: string }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<RecentMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        const data = await res.json();

        if (res.ok) {
          setStats(data.stats);
          setRecentMaterials(data.recentMaterials ?? []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading study dashboard...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Study Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your study materials, flashcards, and test performance.
          </p>
        </div>
        <Link
          href="/dashboard/materials/create"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
        >
          + Add Study Material
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Notes</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats?.totalMaterials || 0}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Summaries Generated</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{stats?.totalSummaries || 0}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Quiz Attempts</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats?.totalQuizAttempts || 0}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Avg Quiz Score</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{stats?.averageQuizScore || 0}%</p>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent Study Materials</h2>

        {recentMaterials.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No study materials uploaded yet. Click "+ Add Study Material" above to get started!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentMaterials.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <Link href={`/dashboard/materials/${item.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                    {item.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.wordCount} words • Created {new Date(item.createdAt).toLocaleDateString()} 
                    {item.subject?.name ? `• ${item.subject.name}` : ""}
                  </p>
                </div>

                <div className="flex gap-2 text-xs">
                  <span className={`rounded px-2 py-1 ${item.summaries.length ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-400"}`}>
                    Summary ({item.summaries.length})
                  </span>
                  <span className={`rounded px-2 py-1 ${item.flashcardDecks.length ? "bg-purple-50 text-purple-700" : "bg-slate-100 text-slate-400"}`}>
                    Decks ({item.flashcardDecks.length})
                  </span>
                  <span className={`rounded px-2 py-1 ${item.quizzes.length ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                    Quizzes ({item.quizzes.length})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
