import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { getDict } from "@/i18n";
import { pageMeta, type LangParams } from "@/i18n/meta";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  return pageMeta(lang, "/terms", { title: getDict(lang).legal.terms.metaTitle });
}

export default async function TermsPage({ params }: LangParams) {
  const { lang } = await params;
  const l = getDict(lang).legal.terms;
  return <LegalPage eyebrow={l.eyebrow} title={l.title} sections={l.sections} />;
}
