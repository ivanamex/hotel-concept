import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { getDict } from "@/i18n";
import { pageMeta, type LangParams } from "@/i18n/meta";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  return pageMeta(lang, "/privacy", { title: getDict(lang).legal.privacy.metaTitle });
}

export default async function PrivacyPage({ params }: LangParams) {
  const { lang } = await params;
  const l = getDict(lang).legal.privacy;
  return <LegalPage eyebrow={l.eyebrow} title={l.title} lead={l.lead} sections={l.sections} />;
}
