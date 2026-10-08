import type { Metadata } from "next";
import { CloseButton } from "@/components/site/close-button";
import { Confirmation } from "@/components/site/confirmation";
import { Crumb } from "@/components/site/crumb";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "Booking confirmed" };

export default async function ConfirmedPage({ params }: PageProps<"/book/confirmed/[ref]">) {
  const { ref } = await params;
  return (
    <section className="pb-24 pt-10 sm:pt-14 lg:pt-20">
      <Container>
        <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between gap-4"><Crumb current="Booking confirmed" /><CloseButton label="Done" /></div>
        <Confirmation reference={ref} />
      </Container>
    </section>
  );
}
