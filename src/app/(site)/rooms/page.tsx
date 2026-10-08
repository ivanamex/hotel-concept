import type { Metadata } from "next";
import { PageIntro } from "@/components/site/page-intro";
import { RoomsList } from "@/components/site/rooms-list";
import { ButtonLink, Container } from "@/components/ui";
import { ROOMS } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Rooms & suites",
  description: "Ten rooms from a proper single to a duplex suite for four — lake, garden or courtyard view. Book direct for the best rate.",
};

export default function RoomsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Rooms & suites"
        title="Ten rooms, three views, one lake."
        lead="Every room has oak floors, a proper bed, a rain shower and a window worth opening. Pick by view, by size or by how many of you there are."
      />
      <section className="pb-24">
        <Container>
          <RoomsList rooms={ROOMS} />
          <div className="mt-16 rounded-2xl bg-lake-deep p-8 text-white sm:p-10 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold">Travelling as a group, or staying a month?</h2>
              <p className="mt-2 max-w-xl text-sky/85">From five rooms up, or from fourteen nights, we quote by hand — and usually better than the engine can.</p>
            </div>
            <ButtonLink href="/request" variant="light" className="mt-6 lg:mt-0">Send a request</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
