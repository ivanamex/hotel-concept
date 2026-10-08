"use client";

import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import { WhatsAppIcon, whatsappUrl } from "./whatsapp";

export function WhatsAppButton() {
  const pathname = usePathname();
  const booking = pathname.startsWith("/book");
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener"
      className={clsx(
        "group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-xs bg-[#25D366] p-3.5 text-white shadow-lift transition hover:bg-[#1ebe5b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50 focus-visible:ring-offset-2 sm:py-3 sm:pl-3.5 sm:pr-4",
        booking && "max-lg:hidden",
      )}
      aria-label="Chat with reception on WhatsApp"
    >
      <WhatsAppIcon className="h-5 w-5" />
      <span className="caps hidden !text-[10px] sm:inline">WhatsApp</span>
    </a>
  );
}
