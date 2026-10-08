"use client";

import { useEffect, useState } from "react";

const KEY = "mv-reloaded-at";
const STALE = /ChunkLoadError|Loading chunk|Loading CSS chunk|dynamically imported module|Importing a module script failed|Failed to fetch|NetworkError|Unexpected token '<'|text\/html/i;

/** True when the error looks like a client that outlived its deployment (old tab, new build). */
export function isStale(error: unknown): boolean {
  const e = error as { name?: string; message?: string; digest?: string } | null;
  if (!e) return false;
  return e.name === "ChunkLoadError" || STALE.test(String(e.message ?? "")) || STALE.test(String(e.digest ?? ""));
}

/** Reloads once (at most every 30 s) so a stale tab picks up the new build instead of showing an error. Returns true while reloading. */
export function useStaleReload(error: unknown): boolean {
  const [reloading, setReloading] = useState(false);
  useEffect(() => {
    if (!isStale(error)) return;
    let last = 0;
    try {
      last = Number(sessionStorage.getItem(KEY) ?? 0);
    } catch {}
    if (Date.now() - last < 30_000) return;
    try {
      sessionStorage.setItem(KEY, String(Date.now()));
    } catch {}
    setReloading(true);
    window.location.reload();
  }, [error]);
  return reloading;
}
