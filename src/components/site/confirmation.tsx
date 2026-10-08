"use client";

import { CalendarPlus, Check, MessageCircle, Printer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ExtraIcon } from "@/components/site/extra-icon";
import { whatsappUrl } from "@/components/site/whatsapp";
import { ButtonLink } from "@/components/ui";
import { chf, fmtDate, guestsLabel, plural } from "@/lib/format";
import { nightsBetween } from "@/lib/engine";
import { useHotel, useHydrated } from "@/lib/store";

function icsFor(args: { ref: string; checkIn: string; checkOut: string; room: string; address: string }) {
  const d = (s: string) => s.replace(/-/g, "");
  const body = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Maison Vidy//EN", "BEGIN:VEVENT",
    `UID:${args.ref}@maisonvidy.ch`, `DTSTART;VALUE=DATE:${d(args.checkIn)}`, `DTEND;VALUE=DATE:${d(args.checkOut)}`,
    `SUMMARY:Maison Vidy — ${args.room}`, `LOCATION:${args.address}`, `DESCRIPTION:Booking ${args.ref}. Check-in from 15:00, check-out until 11:00.`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}

export function Confirmation({ reference }: { reference: string }) {
  const hydrated = useHydrated();
  const reservation = useHotel((s) => s.reservations.find((r) => r.ref === reference));
  const rooms = useHotel((s) => s.rooms);
  const ratePlans = useHotel((s) => s.ratePlans);
  const extrasAll = useHotel((s) => s.extras);
  const settings = useHotel((s) => s.settings);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
  if (!reservation) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center ring-1 ring-ink/5">
        <h1 className="font-display text-2xl font-semibold text-ink">We can’t find booking {reference}</h1>
        <p className="mt-2 text-slate">Bookings made on this demo live in your browser. Make a new one, or message us.</p>
        <div className="mt-6 flex justify-center gap-3"><ButtonLink href="/book">Book a stay</ButtonLink><ButtonLink href="/contact" variant="secondary">Contact</ButtonLink></div>
      </div>
    );
  }

  const room = rooms.find((r) => r.id === reservation.roomId)!;
  const plan = ratePlans.find((p) => p.id === reservation.ratePlan)!;
  const extras = extrasAll.filter((e) => reservation.extras.includes(e.id));
  const nights = nightsBetween(reservation.checkIn, reservation.checkOut);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-moss text-white"><Check className="h-5 w-5" /></span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">Confirmed</p>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">See you on {fmtDate(reservation.checkIn, "long")}, {reservation.guest.firstName}.</h1>
        </div>
      </div>
      <p className="mt-4 text-slate">
        Your booking reference is <span className="font-semibold text-ink">{reservation.ref}</span>. A confirmation is on its way to {reservation.guest.email}. Nothing more to do — unless you want to add breakfast or a ride, which you can do by replying to the email or on WhatsApp.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink/5">
          <div className="relative aspect-[16/7]">
            <Image src={room.images[0]} alt={room.name} fill sizes="(min-width:1024px) 700px, 100vw" className="object-cover" />
          </div>
          <div className="p-6">
            <h2 className="font-display text-2xl font-semibold text-ink">{room.name}</h2>
            <p className="text-sm text-slate">{room.category} · {room.view} view · {room.sizeM2} m² · {room.beds}</p>
            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <div><dt className="text-xs uppercase tracking-wider text-slate">Check-in</dt><dd className="font-semibold text-ink">{fmtDate(reservation.checkIn, "weekday")}<span className="block text-xs font-normal text-slate">from {settings.checkIn}</span></dd></div>
              <div><dt className="text-xs uppercase tracking-wider text-slate">Check-out</dt><dd className="font-semibold text-ink">{fmtDate(reservation.checkOut, "weekday")}<span className="block text-xs font-normal text-slate">until {settings.checkOut}</span></dd></div>
              <div><dt className="text-xs uppercase tracking-wider text-slate">Guests</dt><dd className="font-semibold text-ink">{guestsLabel(reservation.adults, reservation.children)}<span className="block text-xs font-normal text-slate">{plural(nights, "night")}</span></dd></div>
            </dl>
            <div className="mt-5 border-t border-line pt-5">
              <p className="text-sm"><span className="font-semibold text-ink">{plan.name}</span> <span className="text-slate">— {plan.cancellation}</span></p>
              {extras.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {extras.map((e) => (
                    <li key={e.id} className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-xs font-semibold text-lake"><ExtraIcon name={e.icon} className="h-3.5 w-3.5" /> {e.short}</li>
                  ))}
                </ul>
              )}
              {reservation.notes && <p className="mt-3 whitespace-pre-line text-sm text-slate">{reservation.notes}</p>}
            </div>
            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
              <span className="text-sm text-slate">Total incl. city tax</span>
              <span className="font-display text-2xl font-semibold text-ink">{chf(reservation.total, { decimals: true })}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-ink/5">
            <h3 className="font-display text-lg font-semibold text-ink">What happens next</h3>
            <ol className="mt-3 space-y-3 text-sm text-slate">
              <li><span className="font-semibold text-ink">Today</span> — confirmation email with everything above.</li>
              <li><span className="font-semibold text-ink">2 days before</span> — a message with arrival tips and the door code if you arrive late.</li>
              <li><span className="font-semibold text-ink">On the day</span> — your room is ready from {settings.checkIn}. Luggage can be left earlier.</li>
            </ol>
          </div>
          <a href={icsFor({ ref: reservation.ref, checkIn: reservation.checkIn, checkOut: reservation.checkOut, room: room.name, address: `${settings.name}, ${settings.address}, ${settings.city}` })} download={`${reservation.ref}.ics`} className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-semibold text-ink shadow-card ring-1 ring-ink/5 transition hover:ring-lake"><CalendarPlus className="h-5 w-5 text-lake" /> Add to calendar</a>
          <a href={whatsappUrl(`Hello, this is ${reservation.guest.firstName} ${reservation.guest.lastName} — booking ${reservation.ref}.`)} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-semibold text-ink shadow-card ring-1 ring-ink/5 transition hover:ring-lake"><MessageCircle className="h-5 w-5 text-[#25D366]" /> Message reception on WhatsApp</a>
          <button type="button" onClick={() => window.print()} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-sm font-semibold text-ink shadow-card ring-1 ring-ink/5 transition hover:ring-lake"><Printer className="h-5 w-5 text-slate" /> Print</button>
          <p className="px-1 text-xs text-slate">Need to change or cancel? Reply to the email or <Link href="/contact" className="underline">contact us</Link> with your reference.</p>
        </div>
      </div>
    </div>
  );
}
