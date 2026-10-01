"use client";

import { useEffect, useState } from "react";
import { Clock3, ListChecks } from "lucide-react";

type StudyPlan = {
  id: string;
  title: string;
  topic: string;
  goals: string | null;
  durationMin: number;
  createdAt: string;
};

export function StudyPlansList() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPlans() {
    try {
      const response = await fetch("/api/study-plans");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load plans");
      }

      setPlans(data.plans ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Study plans</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Your upcoming learning blocks</h2>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-600">
          Loading study plans...
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <ListChecks className="mx-auto mb-4 h-8 w-8 text-slate-400" />
          <p className="text-lg font-medium text-slate-700">No plans yet</p>
          <p className="mt-2 text-sm text-slate-500">Build your first focused study session to stay consistent.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <article key={plan.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{plan.topic}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{plan.title}</h3>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  <Clock3 className="h-3.5 w-3.5" />
                  {plan.durationMin} min
                </div>
              </div>

              {plan.goals ? <p className="mt-3 text-sm text-slate-600">{plan.goals}</p> : null}

              <div className="mt-4 text-xs text-slate-500">
                Planned {new Date(plan.createdAt).toLocaleDateString()}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
