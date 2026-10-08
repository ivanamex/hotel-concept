"use client";

import { clsx } from "clsx";
import Image from "next/image";
import { useT } from "@/i18n/context";

const MARKS = [
  { src: "/images/pay/stripe.png", alt: "Stripe", w: 230 },
  { src: "/images/pay/visa.png", alt: "Visa", w: 153 },
  { src: "/images/pay/mastercard.png", alt: "Mastercard", w: 161 },
  { src: "/images/pay/twint.png", alt: "Twint", w: 254 },
];

/** Secure-payment marks: quiet in grey, colour on hover. */
export function PaymentMarks({ label = true, size = 22, className }: { label?: boolean; size?: number; className?: string }) {
  const t = useT();
  return (
    <div className={clsx("flex flex-wrap items-center gap-x-5 gap-y-2", className)}>
      {label && <span className="caps !text-[10px] text-slate">{t.footer.securePayment}</span>}
      <ul className="flex items-center gap-4">
        {MARKS.map((m) => (
          <li key={m.alt} className="pay-mark">
            <Image src={m.src} alt={m.alt} title={m.alt} width={Math.round((m.w / 96) * size)} height={size} style={{ height: size, width: "auto" }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
