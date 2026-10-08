import type { Metadata } from "next";
import { CloseButton } from "@/components/site/close-button";
import { Confirmation } from "@/components/site/confirmation";
import { Crumb } from "@/components/site/crumb";
import { Container } from "@/components/ui";
import { getDict } from "@/i18n";
import { pageMeta } from "@/i18n/meta";

type Props = { params: Promise<{ lang: string; ref: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, ref } = await params;
  const t = getDict(lang);
  return pageMeta(lang, `/book/confirmed/${ref}`, { title: t.confirm.metaTitle });
}

export default async function ConfirmedPage({ params }: Props) {
  const { lang, ref } = await params;
  const t = getDict(lang);
  return (
    <section className="pb-24 pt-10 sm:pt-14 lg:pt-20">
      <Container>
        <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between gap-4"><Crumb current={t.confirm.crumb} /><CloseButton label={t.common.done} /></div>
        <Confirmation reference={ref} />
      </Container>
    </section>
  );
}
