"use client";

import { clsx } from "clsx";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useT } from "@/i18n/context";
import { scrollTo } from "./motion";

/** A quiet arrow above the WhatsApp button once the page has been scrolled. */
export function BackToTop() {
  const t = useT();
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
      aria-label={t.common.backToTop}
      title={t.common.backToTop}
      className={clsx(
        "group rise fixed bottom-[4.9rem] right-5 z-40 flex h-10 w-10 items-center justify-center rounded-xs bg-white/90 text-ink shadow-soft ring-1 ring-ink/10 backdrop-blur hover:bg-ink hover:text-white sm:bottom-[4.6rem]",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUp className="h-4 w-4 transition duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
}
