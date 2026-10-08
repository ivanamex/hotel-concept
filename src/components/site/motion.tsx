"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createElement, useEffect, useRef, type ElementType, type ReactNode } from "react";
import { isStale } from "./stale-guard";

gsap.registerPlugin(ScrollTrigger, SplitText);

let lenisRef: Lenis | null = null;

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Scroll the page (through Lenis when it runs) to the top or to an element / selector. */
export function scrollTo(target: number | string | HTMLElement = 0, opts: { offset?: number; immediate?: boolean } = {}) {
  if (typeof window === "undefined") return;
  if (lenisRef) {
    lenisRef.scrollTo(target, { offset: opts.offset ?? 0, immediate: opts.immediate, duration: 1.1 });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target, behavior: opts.immediate ? "auto" : "smooth" });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: opts.immediate ? "auto" : "smooth", block: "start" });
  }
}

/** Smooth scrolling for the public site, wired to ScrollTrigger. */
export function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, smoothWheel: true });
    lenisRef = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef = null;
    };
  }, []);

  // a stale client after a fresh deploy can fail to load the next page's code — reload once instead of dying quietly
  useEffect(() => {
    const onError = (e: ErrorEvent | PromiseRejectionEvent) => {
      const err = "reason" in e ? e.reason : e.error ?? { message: e.message };
      if (isStale(err)) {
        const key = "mv-reloaded-at";
        let last = 0;
        try {
          last = Number(sessionStorage.getItem(key) ?? 0);
        } catch {}
        if (Date.now() - last > 30_000) {
          try {
            sessionStorage.setItem(key, String(Date.now()));
          } catch {}
          window.location.reload();
        }
      }
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onError);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onError);
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && document.querySelector(hash)) {
      const id = setTimeout(() => scrollTo(hash, { offset: -24 }), 250);
      return () => clearTimeout(id);
    }
    scrollTo(0, { immediate: true });
    const id = setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => clearTimeout(id);
  }, [pathname]);

  return <>{children}</>;
}

/** Headline that reveals line by line when it scrolls into view. */
export function Reveal({
  as = "h2",
  children,
  className,
  delay = 0,
  once = true,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let split: SplitText | undefined;
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "reveal-line" });
        gsap.from(split.lines, {
          yPercent: 110,
          opacity: 0,
          duration: 1,
          delay,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 88%", once },
        });
      });
    });
    return () => {
      cancelled = true;
      ctx?.revert();
      split?.revert();
    };
  }, [delay, once]);

  return createElement(as, { ref, className }, children);
}

/** Generic fade-up for blocks. */
export function FadeIn({ children, className, delay = 0, y = 24 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(el, { y, opacity: 0, duration: 0.9, delay, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
    return () => ctx.revert();
  }, [delay, y]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Moves its children vertically with the scroll: speed −1…1 (negative = slower than the page). */
export function Parallax({ children, className, speed = 0.2, scale = 1 }: { children: ReactNode; className?: string; speed?: number; scale?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -speed * 40, scale },
        { yPercent: speed * 40, scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
    });
    return () => ctx.revert();
  }, [speed, scale]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Adds .is-visible when the element enters the viewport (used by the script "write-in"). */
export function InView({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
