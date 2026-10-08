"use client";

import { Check, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Input } from "@/components/ui";
import { PROMO_CODE, useHotel } from "@/lib/store";

const KEY = "maison-vidy-stay-in-touch";
const DAYS = 30;
const EXCLUDED = ["/book", "/office"];

/** Subscribed → quiet for 30 days. Dismissed → quiet for this visit, back next time. */
function seen(): boolean {
  try {
    if (sessionStorage.getItem(KEY)) return true;
    const v = localStorage.getItem(KEY);
    return !!v && Date.now() - Number(v) < DAYS * 86_400_000;
  } catch {
    return false;
  }
}
function remember(subscribed = false) {
  try {
    sessionStorage.setItem(KEY, "1");
    if (subscribed) localStorage.setItem(KEY, String(Date.now()));
  } catch {}
}

export function StayInTouch() {
  const pathname = usePathname();
  const addSubscriber = useHotel((s) => s.addSubscriber);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const fired = useRef(false);

  useEffect(() => {
    if (EXCLUDED.some((p) => pathname.startsWith(p)) || seen()) return;
    fired.current = false;
    const show = () => {
      if (fired.current || seen()) return;
      fired.current = true;
      setOpen(true);
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.45) show();
    };
    const timer = setTimeout(show, 25_000);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    remember();
    setOpen(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError("Enter a valid email");
    setError("");
    addSubscriber({ email, name, page: pathname });
    setDone(true);
    remember(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Stay in touch">
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" onClick={close} />
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-t-lg bg-white shadow-lift sm:rounded-lg md:grid-cols-[1fr_1.1fr]">
        <button type="button" onClick={close} className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xs bg-white/90 text-ink transition hover:bg-ink hover:text-white" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[460px]">
          <Image src="/images/rooms/room-junior-suite.jpg" alt="Junior Suite with the balcony open to the lake" fill sizes="(min-width:768px) 420px, 100vw" className="object-cover" />
        </div>
        <div className="p-7 sm:p-10">
          {done ? (
            <div className="flex h-full flex-col justify-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xs bg-moss text-white"><Check className="h-5 w-5" /></span>
              <h2 className="mt-5 font-display text-3xl leading-tight text-ink sm:text-4xl">Your code is <em>{PROMO_CODE}</em>.</h2>
              <p className="mt-3 text-slate">Ten percent off the room on your first direct booking. It is also on its way to {email}. Enter it in the last step of the booking.</p>
              <div className="mt-6"><Button onClick={close} arrow>Find your dates</Button></div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="flex h-full flex-col justify-center">
              <p className="caps !text-[10px] text-lake">Stay in touch</p>
              <h2 className="mt-4 font-display text-3xl leading-[1.05] text-ink sm:text-[2.6rem]">Ten percent off your first stay, <em>booked direct.</em></h2>
              <p className="mt-4 text-sm text-slate">Leave your email and we send the code, plus a note when the terrace opens or the winter offer starts. Two or three emails a year, never more.</p>
              <div className="mt-6 space-y-3">
                <Input placeholder="First name (optional)" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
                <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                {error && <p className="text-xs text-[#b3261e]">{error}</p>}
                <Button type="submit" className="w-full" arrow>Send me the code</Button>
              </div>
              <button type="button" onClick={close} className="caps mt-4 self-start !text-[10px] text-slate hover:text-ink">No thanks</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
