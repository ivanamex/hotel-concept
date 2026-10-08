"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { InquiryForm } from "./inquiry-form";

export function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Write to us">
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-lg bg-white p-7 shadow-lift sm:rounded-lg sm:p-10">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xs text-ink transition hover:bg-ink hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button>
        <p className="caps !text-[10px] text-lake">Write to us</p>
        <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">A person <em>answers.</em></h2>
        <p className="mb-6 mt-2 text-sm text-slate">Reception reads this between 07:00 and 22:00 and usually replies within the hour.</p>
        <InquiryForm type="contact" />
      </div>
    </div>
  );
}
