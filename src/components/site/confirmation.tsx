"use client";

import { CalendarPlus, Check, MessageCircle, Printer } from "lucide-react";
import Image from "next/image";
import { ExtraIcon } from "@/components/site/extra-icon";
import { Link } from "@/components/site/link";
import { whatsappUrl } from "@/components/site/whatsapp";
import { ButtonLink } from "@/components/ui";
import { fmt, fmtDateL, guestsLabelL, localizeExtra, localizeRatePlan, localizeRoom, nightsLabel, viewLabel } from "@/i18n";
import { useT } from "@/i18n/context";
import { Rich } from "@/i18n/rich";
import { nightsBetween } from "@/lib/engine";
import { chf } from "@/lib/format";
import { useHotel, useHydrated } from "@/lib/store";

function icsFor(args: { ref: string; checkIn: string; checkOut: string; summary: string; description: string; address: string }) {
  const d = (s: string) => s.replace(/-/g, "");
  const body = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Maison Vidy//EN", "BEGIN:VEVENT",
    `UID:${args.ref}@maisonvidy.ch`, `DTSTART;VALUE=DATE:${d(args.checkIn)}`, `DTEND;VALUE=DATE:${d(args.checkOut)}`,
    `SUMMARY:${args.summary}`, `LOCATION:${args.address}`, `DESCRIPTION:${args.description}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}

export function Confirmation({ reference }: { reference: string }) {
  const t = useT();
  const c = t.confirm;
  const hydrated = useHydrated();
  const reservation = useHotel((s) => s.reservations.find((r) => r.ref === reference));
  const rooms = useHotel((s) => s.rooms);
  const ratePlans = useHotel((s) => s.ratePlans);
  const extrasAll = useHotel((s) => s.extras);
  const settings = useHotel((s) => s.settings);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-lg bg-white" />;
  if (!reservation) {
    return (
      <div className="mx-auto max-w-xl rounded-lg bg-white p-8 text-center ring-1 ring-ink/5">
        <h1 className="font-display text-2xl text-ink">{fmt(c.notFoundTitle, { ref: reference })}</h1>
        <p className="mt-2 text-slate">{c.notFoundText}</p>
        <div className="mt-6 flex justify-center gap-3"><ButtonLink href="/book">{c.bookStay}</ButtonLink><ButtonLink href="/contact" variant="secondary">{c.contact}</ButtonLink></div>
      </div>
    );
  }

  const room = localizeRoom(rooms.find((r) => r.id === reservation.roomId)!, t);
  const plan = localizeRatePlan(ratePlans.find((p) => p.id === reservation.ratePlan)!, t);
  const extras = extrasAll.filter((e) => reservation.extras.includes(e.id)).map((e) => localizeExtra(e, t));
  const nights = nightsBetween(reservation.checkIn, reservation.checkOut);
  const address = `${settings.name}, ${settings.address}, ${settings.city}`;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xs bg-moss text-white"><Check className="h-5 w-5" /></span>
        <div>
          <p className="caps !text-[10px] text-moss">{c.eyebrow}</p>
          <h1 className="font-display text-3xl text-ink sm:text-4xl"><Rich text={fmt(c.title, { date: fmtDateL(reservation.checkIn, t, "long"), name: reservation.guest.firstName })} /></h1>
        </div>
      </div>
      <p className="mt-4 text-slate">{fmt(c.lead, { ref: reservation.ref, email: reservation.guest.email })}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-ink/5">
          <div className="relative aspect-[16/7]">
            <Image src={room.images[0]} alt={room.name} fill sizes="(min-width:1024px) 700px, 100vw" className="object-cover" />
          </div>
          <div className="p-6">
            <h2 className="font-display text-2xl text-ink">{room.name}</h2>
            <p className="text-sm text-slate">{room.category} · {viewLabel(room.view, t)} · {room.sizeM2} m² · {room.beds}</p>
            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <div><dt className="caps !text-[10px] text-slate">{c.checkIn}</dt><dd className="font-semibold text-ink">{fmtDateL(reservation.checkIn, t, "weekday")}<span className="block text-xs font-normal text-slate">{c.from} {settings.checkIn}</span></dd></div>
              <div><dt className="caps !text-[10px] text-slate">{c.checkOut}</dt><dd className="font-semibold text-ink">{fmtDateL(reservation.checkOut, t, "weekday")}<span className="block text-xs font-normal text-slate">{c.until} {settings.checkOut}</span></dd></div>
              <div><dt className="caps !text-[10px] text-slate">{c.guests}</dt><dd className="font-semibold text-ink">{guestsLabelL(reservation.adults, reservation.children, t)}<span className="block text-xs font-normal text-slate">{nightsLabel(nights, t)}</span></dd></div>
            </dl>
            <div className="mt-5 border-t border-line pt-5">
              <p className="text-sm"><span className="font-semibold text-ink">{plan.name}</span> <span className="text-slate">— {plan.cancellation}</span></p>
              {extras.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {extras.map((e) => (
                    <li key={e.id} className="inline-flex items-center gap-1.5 rounded-xs bg-mist px-3 py-1 text-xs font-semibold text-lake"><ExtraIcon name={e.icon} className="h-3.5 w-3.5" /> {e.short}</li>
                  ))}
                </ul>
              )}
              {reservation.notes && <p className="mt-3 whitespace-pre-line text-sm text-slate">{reservation.notes}</p>}
            </div>
            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
              <span className="text-sm text-slate">{c.total}</span>
              <span className="font-display text-2xl text-ink">{chf(reservation.total, { decimals: true })}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-white p-5 shadow-card ring-1 ring-ink/5">
            <h3 className="font-display text-lg text-ink">{c.nextTitle}</h3>
            <ol className="mt-3 space-y-3 text-sm text-slate">
              {c.next.map(([when, what]) => (
                <li key={when}><span className="font-semibold text-ink">{when}</span> — {fmt(what, { in: settings.checkIn })}</li>
              ))}
            </ol>
          </div>
          <a href={icsFor({ ref: reservation.ref, checkIn: reservation.checkIn, checkOut: reservation.checkOut, summary: fmt(c.icsSummary, { room: room.name }), description: fmt(c.icsDescription, { ref: reservation.ref }), address })} download={`${reservation.ref}.ics`} className="lift-sm flex items-center gap-3 rounded-lg bg-white p-4 text-sm font-semibold text-ink shadow-card ring-1 ring-ink/5 hover:ring-lake"><CalendarPlus className="h-5 w-5 text-lake" /> {c.calendar}</a>
          <a href={whatsappUrl(fmt(c.whatsappText, { name: `${reservation.guest.firstName} ${reservation.guest.lastName}`, ref: reservation.ref }))} target="_blank" rel="noopener" className="lift-sm flex items-center gap-3 rounded-lg bg-white p-4 text-sm font-semibold text-ink shadow-card ring-1 ring-ink/5 hover:ring-lake"><MessageCircle className="h-5 w-5 text-[#25D366]" /> {c.whatsapp}</a>
          <button type="button" onClick={() => window.print()} className="lift-sm flex w-full items-center gap-3 rounded-lg bg-white p-4 text-sm font-semibold text-ink shadow-card ring-1 ring-ink/5 hover:ring-lake"><Printer className="h-5 w-5 text-slate" /> {c.print}</button>
          <p className="font-script px-1 pt-2 text-4xl text-lake">{c.script}</p>
          <p className="px-1 text-xs text-slate">{c.change} <Link href="/contact" className="underline">{c.changeLink}</Link> {c.changeEnd}</p>
        </div>
      </div>
    </div>
  );
}
