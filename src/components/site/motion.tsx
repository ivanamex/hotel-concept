"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createElement, useEffect, useRef, type ElementType, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Smooth scrolling for the public site, wired to ScrollTrigger. */
export function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
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
