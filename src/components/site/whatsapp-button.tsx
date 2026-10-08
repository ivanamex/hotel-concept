"use client";

import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/context";
import { parsePublicPath } from "@/i18n/config";
import { WhatsAppIcon, whatsappUrl } from "./whatsapp";

export function WhatsAppButton() {
  const pathname = usePathname();
  const t = useT();
  const booking = parsePublicPath(pathname).internal.startsWith("/book");
  return (
    <a
      href={whatsappUrl(t.common.whatsappGreeting)}
      target="_blank"
      rel="noopener"
      className={clsx(
        "group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-xs bg-[#25D366] p-3.5 text-white shadow-lift transition hover:bg-[#1ebe5b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50 focus-visible:ring-offset-2 sm:py-3 sm:pl-3.5 sm:pr-4",
        booking && "max-lg:hidden",
      )}
      aria-label={t.common.whatsappLabel}
    >
      <WhatsAppIcon className="h-5 w-5" />
      <span className="caps hidden !text-[10px] sm:inline">{t.common.whatsapp}</span>
    </a>
  );
}
