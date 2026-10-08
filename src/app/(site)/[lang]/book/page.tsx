import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingFlow } from "@/components/site/booking-flow";
import { CloseButton } from "@/components/site/close-button";
import { Crumb } from "@/components/site/crumb";
import { Container } from "@/components/ui";
import { getDict } from "@/i18n";
import { pageMeta, type LangParams } from "@/i18n/meta";
import { Rich } from "@/i18n/rich";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return pageMeta(lang, "/book", { title: t.book.metaTitle, description: t.book.metaDescription });
}

export default async function BookPage({ params }: LangParams) {
  const { lang } = await params;
  const t = getDict(lang);
  return (
    <section className="pb-24 pt-10 sm:pt-14 lg:pt-20">
      <Container>
        <div className="mb-6 flex items-center justify-between gap-4 sm:hidden"><Crumb current={t.book.crumb} /><CloseButton /></div>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="caps !text-[10px] text-lake">{t.book.eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl"><Rich text={t.book.title} /></h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="caps hidden !text-[10px] text-slate lg:block">{t.book.tagline}</p>
            <div className="max-sm:hidden"><CloseButton /></div>
          </div>
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-white" />}>
          <BookingFlow />
        </Suspense>
      </Container>
    </section>
  );
}
