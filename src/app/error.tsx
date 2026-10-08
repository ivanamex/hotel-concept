"use client";

import { useStaleReload } from "@/components/site/stale-guard";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useStaleReload(error);
  return (
    <div className="flex min-h-screen flex-col items-start justify-center bg-sand px-8 py-24 text-ink">
      <p className="font-display text-4xl">Something went wrong.</p>
      <p className="mt-3 max-w-md text-slate">Reload the page — if it keeps happening, tell reception.</p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={() => window.location.reload()} className="rounded-xs bg-lake px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white">Reload</button>
        <button type="button" onClick={reset} className="rounded-xs px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink ring-1 ring-ink/30">Try again</button>
      </div>
    </div>
  );
}
