"use client";

import { clsx } from "clsx";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Mark } from "./logo";
import { scrollTo } from "./motion";

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      onClick={() => scrollTo(0)}
      aria-label="Back to top"
      className={clsx(
        "group fixed bottom-5 left-5 z-40 flex h-12 items-center gap-2 rounded-xs bg-white pl-1.5 pr-3 text-ink shadow-lift ring-1 ring-ink/10 transition-all duration-300 hover:bg-ink hover:text-white lg:left-[calc(var(--spacing-rail)+1.25rem)]",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <Mark className="h-8 w-8" />
      <ArrowUp className="h-4 w-4 transition group-hover:-translate-y-0.5" />
      <span className="caps !text-[10px]">Top</span>
    </button>
  );
}
