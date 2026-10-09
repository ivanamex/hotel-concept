"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useHref, useT } from "@/i18n/context";
import { canGoBack } from "./motion";

/** Leaves a take-over screen: back to where the visitor came from, or home when they landed here directly. */
export function CloseButton({ label, className = "" }: { label?: string; className?: string }) {
  const router = useRouter();
  const href = useHref();
  const t = useT();
  const text = label ?? t.common.close;
  const leave = () => {
    if (canGoBack()) router.back();
    else router.push(href("/"));
  };
  return (
    <button type="button" onClick={leave} aria-label={text} className={`group inline-flex h-11 items-center gap-2 rounded-xs bg-white px-3 text-ink ring-1 ring-ink/10 transition hover:bg-ink hover:text-white ${className}`}>
      <span className="caps hidden !text-[10px] sm:inline">{text}</span>
      <X className="h-4 w-4" />
    </button>
  );
}
