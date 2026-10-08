import Link from "next/link";
import { SiteFooter } from "@/components/site/footer";
import { SiteNav } from "@/components/site/nav";
import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="flex-1 pt-16 lg:pl-rail lg:pt-0">
        <Container className="flex min-h-[70svh] flex-col items-start justify-center py-32">
          <p className="caps text-lake">404</p>
          <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl">That page went <em>for a swim.</em></h1>
          <p className="mt-4 max-w-md text-slate">The link may be old, or the page moved. The rooms, the booking engine and reception are all still here.</p>
          <div className="mt-8 flex gap-3">
            <ButtonLink href="/" arrow>Home</ButtonLink>
            <ButtonLink href="/book" variant="secondary">Book a stay</ButtonLink>
          </div>
          <Link href="/contact" className="rule-link caps mt-8 !text-[10px] text-ink">Or write to reception</Link>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
