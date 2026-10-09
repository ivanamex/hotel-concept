import { CalendarRange, Home, Users } from "lucide-react";
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
          <div className="-mx-4 divide-y divide-line border-y border-line text-[15px] leading-relaxed text-ink-soft lg:self-start">
            {r.cards.map(([h, p], i) => {
              const Icon = [Users, CalendarRange, Home][i] ?? Users;
              return (
                <div key={h} className="row-plate flex items-start gap-5 py-6">
                  <span className="plate-icon mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center text-lake"><Icon className="h-6 w-6" strokeWidth={1.6} /></span>
                  <div>
                    <h2 className="font-display text-xl text-ink">{h}</h2>
                    <p className="mt-2 text-slate">{p}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-line pt-8 lg:border-t-0 lg:pt-0">
            <InquiryForm type="group" />
          </div>
        </Container>
      </section>
    </>
  );
}
