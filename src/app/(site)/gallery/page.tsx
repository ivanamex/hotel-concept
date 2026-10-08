import type { Metadata } from "next";
import { NextPage } from "@/components/site/bands";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { PhotoHero } from "@/components/site/page-intro";
import { Container } from "@/components/ui";
import { GALLERY } from "@/lib/content";

export const metadata: Metadata = { title: "Gallery", description: "Rooms, the house, the lake and Lausanne — in pictures." };

export default function GalleryPage() {
  return (
    <>
      <PhotoHero image="/images/lake/marina.jpg" alt="Port de Vidy in the morning" eyebrow="Gallery" title={<>Look <em>around.</em></>} />
      <section className="py-16 sm:py-24">
        <Container wide>
          <GalleryGrid items={GALLERY} />
        </Container>
      </section>
      <NextPage current="/gallery" />
    </>
  );
}
