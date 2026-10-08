import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { getDict } from "@/i18n";
import { pageMeta, type LangParams } from "@/i18n/meta";
import { HOTEL } from "@/lib/seed";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  return pageMeta(lang, "/imprint", { title: getDict(lang).legal.imprint.metaTitle });
}

export default async function ImprintPage({ params }: LangParams) {
  const { lang } = await params;
  const t = getDict(lang);
  const l = t.legal.imprint;
  return (
    <LegalPage
      eyebrow={l.eyebrow}
      title={l.title}
      sections={[
        { h: HOTEL.name, p: [`${HOTEL.address}, ${HOTEL.city}, ${t.common.country}`, `${HOTEL.phone} · ${HOTEL.email}`, l.operated] },
        { h: l.website, p: [l.websiteText] },
      ]}
    />
  );
}
