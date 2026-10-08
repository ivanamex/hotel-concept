import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BackToTop } from "@/components/site/back-to-top";
import { SiteFooter } from "@/components/site/footer";
import { MotionProvider } from "@/components/site/motion";
import { SiteNav } from "@/components/site/nav";
import { StayInTouch } from "@/components/site/stay-in-touch";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { LOCALES, alternates, getDict, isLang } from "@/i18n";
import { LangProvider } from "@/i18n/context";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return {
    title: { absolute: t.meta.siteTitle, template: t.meta.titleTemplate },
    description: t.meta.description,
    alternates: { languages: alternates("/") },
    openGraph: { locale: lang === "en" ? "en_GB" : lang === "fr" ? "fr_CH" : lang === "de" ? "de_CH" : "it_CH" },
  };
}

export default async function SiteLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  return (
    <LangProvider lang={lang} dict={t}>
      {lang !== "en" && <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(lang)}` }} />}
      <MotionProvider>
        <SiteNav />
        <div className="flex min-h-screen flex-col pt-16 lg:pl-rail lg:pt-0">
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <WhatsAppButton />
        <BackToTop />
        <StayInTouch />
      </MotionProvider>
    </LangProvider>
  );
}
