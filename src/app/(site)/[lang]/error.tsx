"use client";

import { RotateCw } from "lucide-react";
import { useStaleReload } from "@/components/site/stale-guard";
import { Container } from "@/components/ui";
import { useT } from "@/i18n/context";
import { Rich } from "@/i18n/rich";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  const reloading = useStaleReload(error);
  return (
    <Container className="flex min-h-[70svh] flex-col items-start justify-center py-32">
      <p className="caps text-lake">{reloading ? "…" : "Oops"}</p>
      <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl"><Rich text={t.errorPage.title} /></h1>
      <p className="mt-4 max-w-md text-slate">{t.errorPage.text}</p>
      <button type="button" onClick={() => window.location.reload()} className="ticket sweep caps mt-8 inline-flex h-12 items-center gap-3 rounded-xs bg-lake px-6 !text-[11.5px] text-white [--sweep:var(--color-lake-deep)]">
        {t.errorPage.reload} <RotateCw className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={reset} className="rule-link caps mt-6 !text-[10px] text-ink">{t.errorPage.retry}</button>
    </Container>
  );
}
