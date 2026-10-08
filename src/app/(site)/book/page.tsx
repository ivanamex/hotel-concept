import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingFlow } from "@/components/site/booking-flow";
import { CloseButton } from "@/components/site/close-button";
import { Crumb } from "@/components/site/crumb";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Book your stay",
  description: "Check availability and book direct at Maison Vidy — best rate guaranteed, free cancellation on flexible plans.",
};

export default function BookPage() {
  return (
    <section className="pb-24 pt-10 sm:pt-14 lg:pt-20">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="caps !text-[10px] text-lake">Book direct</p>
            <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Your stay <em>at Maison Vidy</em></h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="caps hidden !text-[10px] text-slate lg:block">Best rate guaranteed · Free cancellation on flexible plans</p>
            <div className="max-sm:hidden"><CloseButton /></div>
          </div>
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-white" />}>
          <BookingFlow />
        </Suspense>
      </Container>
    </section>
  );
}
