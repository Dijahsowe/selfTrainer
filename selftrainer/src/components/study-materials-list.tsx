"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, FileText, ListChecks, Plus } from "lucide-react";

type StudyMaterial = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  link: string | null;
  createdAt: string;
};

export function StudyMaterialsList() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMaterials() {
    try {
      const response = await fetch("/api/study-materials");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load materials");
      }

      setMaterials(data.materials ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Study materials</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Your learning library</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard?add=session"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ListChecks className="h-4 w-4" />
            New session
          </Link>
          <Link
            href="/dashboard?add=plan"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ListChecks className="h-4 w-4" />
            New plan
          </Link>
          <Link
            href="/dashboard/materials/create"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            Add material
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-600">
          Loading study materials...
        </div>
      ) : materials.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <FileText className="mx-auto mb-4 h-8 w-8 text-slate-400" />
          <p className="text-lg font-medium text-slate-700">No materials yet</p>
          <p className="mt-2 text-sm text-slate-500">Add your first article, video, or note set to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {materials.map((material) => (
            <article key={material.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{material.subject}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{material.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/materials/${material.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View
                  </Link>
                  {material.link ? (
                    <a
                      href={material.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </a>
                  ) : null}
                </div>
              </div>

              {material.description ? <p className="mt-3 text-sm text-slate-600">{material.description}</p> : null}

              <div className="mt-4 text-xs text-slate-500">
                Added {new Date(material.createdAt).toLocaleDateString()}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
