import { SiteFooter } from "@/components/site/footer";
import { HeaderSwitch } from "@/components/site/header-switch";
import { WhatsAppButton } from "@/components/site/whatsapp";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <HeaderSwitch />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
