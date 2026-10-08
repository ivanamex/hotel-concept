import type { Metadata } from "next";
import { InquiryForm } from "@/components/site/inquiry-form";
import { PageIntro } from "@/components/site/page-intro";
import { Container } from "@/components/ui";
import { getDict } from "@/i18n";
import { pageMeta, type LangParams } from "@/i18n/meta";
import { Rich } from "@/i18n/rich";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return pageMeta(lang, "/request", { title: t.request.metaTitle, description: t.request.metaDescription });
}

export default async function RequestPage({ params }: LangParams) {
  const { lang } = await params;
  const t = getDict(lang);
  const r = t.request;
  return (
    <>
      <PageIntro eyebrow={r.eyebrow} title={<Rich text={r.title} />} lead={r.lead} crumb={t.footer.links.groups} />
      <section className="pb-20 sm:pb-28">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div className="space-y-5 text-[15px] leading-relaxed text-ink-soft">
            {r.cards.map(([h, p]) => (
              <div key={h} className="rounded-lg bg-white p-6 ring-1 ring-ink/5">
                <h2 className="font-display text-xl text-ink">{h}</h2>
                <p className="mt-2 text-slate">{p}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-white p-6 shadow-card ring-1 ring-ink/5 sm:p-8">
            <InquiryForm type="group" />
          </div>
        </Container>
      </section>
    </>
  );
}
