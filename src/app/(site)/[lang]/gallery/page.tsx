import type { Metadata } from "next";
import { NextPage } from "@/components/site/bands";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { PhotoHero } from "@/components/site/page-intro";
import { Container } from "@/components/ui";
import { getDict } from "@/i18n";
import { pageMeta, type LangParams } from "@/i18n/meta";
import { Rich } from "@/i18n/rich";
import { GALLERY } from "@/lib/content";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return pageMeta(lang, "/gallery", { title: t.gallery.metaTitle, description: t.gallery.metaDescription });
}

export default async function GalleryPage({ params }: LangParams) {
  const { lang } = await params;
  const t = getDict(lang);
  return (
    <>
      <PhotoHero image="/images/lake/marina.jpg" alt={t.gallery.heroAlt} eyebrow={t.gallery.eyebrow} title={<Rich text={t.gallery.title} />} crumb={t.nav.items.gallery.label} />
      <section className="py-16 sm:py-24">
        <Container wide>
          <GalleryGrid items={GALLERY} />
        </Container>
      </section>
      <NextPage current="/gallery" />
    </>
  );
}
