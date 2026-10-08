import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="What we keep, and why."
      lead="We collect what a hotel needs to host you, nothing more, and we don’t sell it to anyone."
      sections={[
        { h: "What we collect", p: ["Name, email, phone and country for a booking; card details for the guarantee (processed by our payment provider, never stored by us); your messages to reception.", "Swiss law requires us to register guests; the registration form is kept for the legal period and then destroyed."] },
        { h: "Cookies", p: ["This site uses no advertising or tracking cookies. A booking in progress is kept in your own browser so you can come back to it."] },
        { h: "Your rights", p: ["You can ask what we hold about you, have it corrected or deleted, at any time, by writing to the email address in the imprint. We answer within 30 days."] },
      ]}
    />
  );
}
