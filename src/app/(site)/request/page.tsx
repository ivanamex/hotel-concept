import type { Metadata } from "next";
import { InquiryForm } from "@/components/site/inquiry-form";
import { PageIntro } from "@/components/site/page-intro";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "Groups & long stays", description: "Five rooms or more, two weeks or more, the whole house — tell us what you have in mind and we quote by hand." };

export default function RequestPage() {
  return (
    <>
      <PageIntro eyebrow="Reservation request" title={<>Groups, long stays, <em>the whole house.</em></>} lead="The booking engine stops at four guests and 21 nights on purpose. For anything bigger we prefer to talk — and the price is usually better than the engine’s." />
      <section className="pb-20 sm:pb-28">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div className="space-y-5 text-[15px] leading-relaxed text-ink-soft">
            <div className="rounded-lg bg-white p-6 ring-1 ring-ink/5">
              <h2 className="font-display text-xl text-ink">Groups</h2>
              <p className="mt-2 text-slate">From five rooms we block the dates for you for a week while you confirm. Breakfast for everyone, a salon for a meeting or a dinner, bikes for a group outing.</p>
            </div>
            <div className="rounded-lg bg-white p-6 ring-1 ring-ink/5">
              <h2 className="font-display text-xl text-ink">Long stays</h2>
              <p className="mt-2 text-slate">From fourteen nights: weekly housekeeping, a monthly rate, a desk and a quiet room. Popular with people starting a job in Lausanne or visiting the university.</p>
            </div>
            <div className="rounded-lg bg-white p-6 ring-1 ring-ink/5">
              <h2 className="font-display text-xl text-ink">The whole house</h2>
              <p className="mt-2 text-slate">Ten rooms, up to 24 guests, the garden and the salon for you alone. Weddings in Lutry and Lavaux, family reunions, a company retreat.</p>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-card ring-1 ring-ink/5 sm:p-8">
            <InquiryForm type="group" />
          </div>
        </Container>
      </section>
    </>
  );
}
