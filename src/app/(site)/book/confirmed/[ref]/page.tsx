import type { Metadata } from "next";
import { Confirmation } from "@/components/site/confirmation";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "Booking confirmed" };

export default async function ConfirmedPage({ params }: PageProps<"/book/confirmed/[ref]">) {
  const { ref } = await params;
  return (
    <section className="pb-24 pt-28 sm:pt-32">
      <Container>
        <Confirmation reference={ref} />
      </Container>
    </section>
  );
}
