import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-[radial-gradient(circle_at_top,_#f8fafc,_#e2e8f0_55%,_#cbd5e1)] px-6 py-12">
      <div className="w-full max-w-4xl rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-slate-200 backdrop-blur-sm sm:p-12">
        <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100">
          Learning dashboard
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Build a consistent study habit that actually lasts.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          SelfTrainer helps you organize practice, track progress, and stay focused with a clean workflow built for repeated learning sessions.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/register" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
            Get started
          </Link>
          <Link href="/login" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
