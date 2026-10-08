import { PageIntro } from "@/components/site/page-intro";
import { Container } from "@/components/ui";

export function LegalPage({ eyebrow, title, lead, sections }: { eyebrow: string; title: string; lead?: string; sections: { h: string; p: string[] }[] }) {
  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} lead={lead} />
      <section className="pb-24">
        <Container>
          <div className="max-w-3xl space-y-10 rounded-lg bg-white p-6 ring-1 ring-ink/5 sm:p-10">
            {sections.map((s) => (
              <div key={s.h}>
                <h2 className="font-display text-xl text-ink">{s.h}</h2>
                {s.p.map((t, i) => <p key={i} className="mt-2 text-[15px] leading-relaxed text-ink-soft">{t}</p>)}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
