"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { BookOpen, LogOut, NotebookPen, Sparkles } from "lucide-react";

export function AppHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-slate-900">
          <div className="rounded-lg bg-slate-900 p-2 text-white">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold">SelfTrainer</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <Link href="/dashboard" className="flex items-center gap-2 hover:text-slate-900">
            <NotebookPen className="h-4 w-4" />
            Dashboard
          </Link>
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Study plans
          </span>
        </nav>

        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-slate-200" />
          ) : session ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">{session.user?.email}</span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Sign in
              </Link>
              <Link href="/register" className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
                Create account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
