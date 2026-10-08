"use client";

import { Link } from "@/components/site/link";
import { ButtonLink, Container } from "@/components/ui";
import { useT } from "@/i18n/context";
import { Rich } from "@/i18n/rich";

export default function NotFound() {
  const t = useT();
  return (
    <Container className="flex min-h-[70svh] flex-col items-start justify-center py-32">
      <p className="caps text-lake">404</p>
      <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl"><Rich text={t.notFound.title} /></h1>
      <p className="mt-4 max-w-md text-slate">{t.notFound.text}</p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/" arrow>{t.notFound.home}</ButtonLink>
        <ButtonLink href="/book" variant="secondary">{t.notFound.book}</ButtonLink>
      </div>
      <Link href="/contact" className="rule-link caps mt-8 !text-[10px] text-ink">{t.notFound.contact}</Link>
    </Container>
  );
}
