import type { Metadata } from "next";
import { NextPage } from "@/components/site/bands";
import { PageIntro } from "@/components/site/page-intro";
import { RoomsList } from "@/components/site/rooms-list";
import { ButtonLink, Container } from "@/components/ui";
import { getDict } from "@/i18n";
import { pageMeta, type LangParams } from "@/i18n/meta";
import { Rich } from "@/i18n/rich";
import { ROOMS } from "@/lib/seed";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return pageMeta(lang, "/rooms", { title: t.rooms.metaTitle, description: t.rooms.metaDescription });
}

export default async function RoomsPage({ params }: LangParams) {
  const { lang } = await params;
  const t = getDict(lang);
  return (
    <>
      <PageIntro eyebrow={t.rooms.eyebrow} title={<Rich text={t.rooms.title} />} lead={t.rooms.lead} crumb={t.nav.items.rooms.label} />
      <section className="pb-24">
        <Container>
          <RoomsList rooms={ROOMS} />
          <div className="mt-16 rounded-lg bg-lake-deep p-8 text-white sm:p-10 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-2xl"><Rich text={t.rooms.groupTitle} /></h2>
              <p className="mt-2 max-w-xl text-sky/85">{t.rooms.groupText}</p>
            </div>
            <ButtonLink href="/request" variant="light" className="mt-6 lg:mt-0" arrow>{t.rooms.groupCta}</ButtonLink>
          </div>
        </Container>
      </section>
      <NextPage current="/rooms" />
    </>
  );
}
