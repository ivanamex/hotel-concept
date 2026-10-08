import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { HOTEL } from "@/lib/seed";

export const metadata: Metadata = { title: "Imprint" };

export default function ImprintPage() {
  return (
    <LegalPage
      eyebrow="Imprint"
      title="Who runs this house."
      sections={[
        { h: HOTEL.name, p: [`${HOTEL.address}, ${HOTEL.city}`, `${HOTEL.phone} · ${HOTEL.email}`, "Operated by Maison Vidy Sàrl, Lausanne. Commercial register and VAT numbers to be added at go-live."] },
        { h: "Website", p: ["Design and development by 20 North, Playa del Carmen — 20north.art."] },
      ]}
    />
  );
}
