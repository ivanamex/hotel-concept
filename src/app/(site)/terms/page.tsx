import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Terms & policies" };

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms & policies"
      title="The small print, kept short."
      sections={[
        { h: "Rates and payment", p: ["Rates are per room per night in Swiss francs, including VAT. The Lausanne city tax (CHF 3.50 per adult per night) is shown separately and paid at the hotel.", "Flexible rates are guaranteed by card and paid at check-out. The saver rate is charged at the time of booking and is non-refundable."] },
        { h: "Cancellation", p: ["Flexible rates: free cancellation until 48 hours before 15:00 on the day of arrival. Later cancellations and no-shows are charged the first night.", "Saver rates: non-refundable and non-changeable. We will always try to move dates if we can."] },
        { h: "Check-in and check-out", p: ["Rooms are ready from 15:00; check-out is until 11:00. Early arrival and late check-out are subject to availability. Luggage can be stored free of charge."] },
        { h: "Children and extra guests", p: ["Children up to two years stay free in a cot. Rooms have a maximum occupancy that cannot be exceeded for safety reasons."] },
        { h: "House rules", p: ["No smoking anywhere in the house. Dogs are welcome in garden and courtyard rooms. Quiet hours from 22:00 to 07:00 — we are a small house with thin old walls in places."] },
      ]}
    />
  );
}
