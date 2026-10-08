"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

/** Leaves a take-over screen: back to where the visitor came from, or home when they landed here directly. */
export function CloseButton({ label = "Close", className = "" }: { label?: string; className?: string }) {
  const router = useRouter();
  const leave = () => {
    const sameOrigin = typeof document !== "undefined" && document.referrer && new URL(document.referrer).origin === window.location.origin;
    if (window.history.length > 1 && sameOrigin) router.back();
    else router.push("/");
  };
  return (
    <button type="button" onClick={leave} aria-label={label} className={`group inline-flex h-11 items-center gap-2 rounded-xs bg-white px-3 text-ink ring-1 ring-ink/10 transition hover:bg-ink hover:text-white ${className}`}>
      <span className="caps hidden !text-[10px] sm:inline">{label}</span>
      <X className="h-4 w-4" />
    </button>
  );
}
