import { clsx } from "clsx";
import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui";

/** Solid intro for pages without a photo hero (header is solid). */
export function PageIntro({ eyebrow, title, lead, children, className }: { eyebrow?: string; title: ReactNode; lead?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <section className={clsx("pb-10 pt-32 sm:pt-40", className)}>
      <Container>
        <div className="max-w-3xl">
          {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-lake">{eyebrow}</p>}
          <h1 className="font-display text-4xl font-semibold leading-[1.04] text-ink sm:text-5xl lg:text-6xl">{title}</h1>
          {lead && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate">{lead}</p>}
        </div>
        {children}
      </Container>
    </section>
  );
}

/** Photo hero for pages with the overlay header. */
export function PhotoHero({ image, alt, eyebrow, title, lead, children }: { image: string; alt: string; eyebrow?: string; title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative min-h-[64svh] overflow-hidden">
      <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/25 to-ink/60" />
      <Container className="relative flex min-h-[64svh] flex-col justify-end pb-12 pt-32 sm:pb-16">
        <div className="max-w-3xl">
          {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky">{eyebrow}</p>}
          <h1 className="font-display text-4xl font-semibold leading-[1.02] text-white sm:text-5xl lg:text-6xl">{title}</h1>
          {lead && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85">{lead}</p>}
        </div>
        {children}
      </Container>
    </section>
  );
}
