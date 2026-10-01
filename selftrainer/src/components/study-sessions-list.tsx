"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, NotebookPen } from "lucide-react";

type StudySession = {
  id: string;
  title: string;
  topic: string;
  durationMin: number;
  completed: boolean;
  notes: string | null;
  createdAt: string;
};

export function StudySessionsList() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSessions() {
    try {
      const response = await fetch("/api/study-sessions");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load sessions");
      }

      setSessions(data.sessions ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Study sessions</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Recent learning blocks</h2>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-600">
          Loading study sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <NotebookPen className="mx-auto mb-4 h-8 w-8 text-slate-400" />
          <p className="text-lg font-medium text-slate-700">No sessions logged yet</p>
          <p className="mt-2 text-sm text-slate-500">Track your first focused session to build momentum.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <article key={session.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{session.topic}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{session.title}</h3>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  <Clock3 className="h-3.5 w-3.5" />
                  {session.durationMin} min
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                {session.completed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Completed
                  </>
                ) : (
                  <>
                    <Clock3 className="h-4 w-4 text-amber-600" />
                    In progress
                  </>
                )}
              </div>

              {session.notes ? <p className="mt-3 text-sm text-slate-600">{session.notes}</p> : null}

              <div className="mt-4 text-xs text-slate-500">
                Logged {new Date(session.createdAt).toLocaleDateString()}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
