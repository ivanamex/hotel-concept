import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingFlow } from "@/components/site/booking-flow";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Book your stay",
  description: "Check availability and book direct at Maison Vidy — best rate guaranteed, free cancellation on flexible plans.",
};

export default function BookPage() {
  return (
    <section className="pb-24 pt-28 sm:pt-32">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lake">Book direct</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">Your stay at Maison Vidy</h1>
          </div>
          <p className="text-sm text-slate">Best rate guaranteed · Free cancellation on flexible plans · Questions? WhatsApp us.</p>
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
          <BookingFlow />
        </Suspense>
      </Container>
    </section>
  );
}
