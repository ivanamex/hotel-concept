import { clsx } from "clsx";
import Image from "next/image";
import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/ui";
import { Crumb } from "./crumb";
import { Reveal } from "./motion";

/** Solid intro for pages without a photo hero. */
export function PageIntro({ eyebrow, crumb, title, lead, children, className }: { eyebrow?: string; crumb?: string; title: ReactNode; lead?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <section className={clsx("pb-12 pt-10 sm:pt-14 lg:pt-20", className)}>
      <Container>
        <div className="max-w-3xl">
          <Crumb current={crumb ?? eyebrow ?? ""} />
          {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
          <Reveal as="h1" className="font-display text-4xl leading-[1.02] text-ink sm:text-5xl lg:text-[4.25rem]">{title}</Reveal>
          {lead && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate">{lead}</p>}
        </div>
        {children}
      </Container>
    </section>
  );
}

/** Photo hero for section pages. */
export function PhotoHero({ image, alt, eyebrow, crumb, title, lead, children }: { image: string; alt: string; eyebrow?: string; crumb?: string; title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative min-h-[62svh] overflow-hidden lg:min-h-[70svh]">
      <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/10 to-ink/65" />
      <Container className="relative flex min-h-[62svh] flex-col justify-between pb-12 pt-8 sm:pb-16 lg:min-h-[70svh] lg:pt-10">
        <Crumb current={crumb ?? eyebrow ?? ""} light />
        <div className="max-w-3xl">
          {eyebrow && <Eyebrow light className="mb-4">{eyebrow}</Eyebrow>}
          <Reveal as="h1" className="font-display text-4xl leading-[1.0] text-white sm:text-5xl lg:text-[4.5rem]">{title}</Reveal>
          {lead && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">{lead}</p>}
        </div>
        {children}
      </Container>
    </section>
  );
}
