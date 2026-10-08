import { SiteFooter } from "@/components/site/footer";
import { MotionProvider } from "@/components/site/motion";
import { SiteNav } from "@/components/site/nav";
import { StayInTouch } from "@/components/site/stay-in-touch";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { BackToTop } from "@/components/site/back-to-top";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <MotionProvider>
      <SiteNav />
      <div className="flex min-h-screen flex-col pt-16 lg:pl-rail lg:pt-0">
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
      <WhatsAppButton />
      <BackToTop />
      <StayInTouch />
    </MotionProvider>
  );
}
