"use client";

import { Mail, Phone } from "lucide-react";
import { useState } from "react";
import { ExtraIcon } from "@/components/site/extra-icon";
import { Button, Textarea } from "@/components/ui";
import { nightsBetween } from "@/lib/engine";
import { chf, fmtDate, fmtDateTime, guestsLabel, plural } from "@/lib/format";
import { useHotel } from "@/lib/store";
import { Drawer, SourceChip, StatusChip } from "./ui";

export function ReservationDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const r = useHotel((s) => s.reservations.find((x) => x.id === id));
  const rooms = useHotel((s) => s.rooms);
  const ratePlans = useHotel((s) => s.ratePlans);
  const extrasAll = useHotel((s) => s.extras);
  const setStatus = useHotel((s) => s.setReservationStatus);
  const update = useHotel((s) => s.updateReservation);
  const [editNotes, setEditNotes] = useState<string | null>(null);

  if (!r) return <Drawer open={!!id} onClose={onClose} title={null}>Not found.</Drawer>;
  const room = rooms.find((x) => x.id === r.roomId)!;
  const plan = ratePlans.find((p) => p.id === r.ratePlan)!;
  const extras = extrasAll.filter((e) => r.extras.includes(e.id));
  const nights = nightsBetween(r.checkIn, r.checkOut);

  return (
    <Drawer
      open
      onClose={onClose}
      title={
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">{r.ref}</p>
          <h2 className="truncate font-display text-lg font-semibold">{r.guest.firstName} {r.guest.lastName}</h2>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip status={r.status} />
        <SourceChip source={r.source} />
        <span className={r.paid ? "rounded-full bg-moss-soft px-2.5 py-1 text-xs font-semibold text-moss" : "rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-ink-soft"}>{r.paid ? "Paid" : "Unpaid"}</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-[#f5f6f8] p-4 text-sm">
        <div><p className="text-xs text-slate">Room</p><p className="font-semibold">{room.number} · {room.name}</p></div>
        <div><p className="text-xs text-slate">Guests</p><p className="font-semibold">{guestsLabel(r.adults, r.children)}</p></div>
        <div><p className="text-xs text-slate">Check-in</p><p className="font-semibold">{fmtDate(r.checkIn, "weekday")}</p>{r.arrivalTime && <p className="text-xs text-slate">arrives {r.arrivalTime}</p>}</div>
        <div><p className="text-xs text-slate">Check-out</p><p className="font-semibold">{fmtDate(r.checkOut, "weekday")}</p><p className="text-xs text-slate">{plural(nights, "night")}</p></div>
        <div><p className="text-xs text-slate">Rate</p><p className="font-semibold">{plan.name}</p></div>
        <div><p className="text-xs text-slate">Total incl. city tax</p><p className="font-semibold">{chf(r.total, { decimals: true })}</p><p className="text-xs text-slate">city tax {chf(r.cityTax, { decimals: true })}</p></div>
      </div>

      <div className="mt-5 space-y-2 text-sm">
        <a href={`mailto:${r.guest.email}`} className="flex items-center gap-2 text-ink hover:text-lake"><Mail className="h-4 w-4 text-slate" /> {r.guest.email}</a>
        <a href={`tel:${r.guest.phone}`} className="flex items-center gap-2 text-ink hover:text-lake"><Phone className="h-4 w-4 text-slate" /> {r.guest.phone} · {r.guest.country}</a>
      </div>

      {extras.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">Extras</p>
          <ul className="mt-2 flex flex-wrap gap-2">{extras.map((e) => <li key={e.id} className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-xs font-semibold text-lake"><ExtraIcon name={e.icon} className="h-3.5 w-3.5" /> {e.short}</li>)}</ul>
        </div>
      )}

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">Notes</p>
          {editNotes === null ? <button type="button" className="text-xs font-semibold text-lake" onClick={() => setEditNotes(r.notes ?? "")}>Edit</button> : <button type="button" className="text-xs font-semibold text-lake" onClick={() => { update(r.id, { notes: editNotes }); setEditNotes(null); }}>Save</button>}
        </div>
        {editNotes === null ? <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">{r.notes || <span className="text-slate">—</span>}</p> : <Textarea className="mt-2 min-h-24" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-ink/5 pt-5">
        {r.status === "pending" && <Button size="sm" onClick={() => setStatus(r.id, "confirmed")}>Confirm</Button>}
        {r.status === "confirmed" && <Button size="sm" onClick={() => setStatus(r.id, "checked_in")}>Check in</Button>}
        {r.status === "checked_in" && <Button size="sm" onClick={() => setStatus(r.id, "checked_out")}>Check out</Button>}
        {!r.paid && r.status !== "cancelled" && <Button size="sm" variant="secondary" onClick={() => update(r.id, { paid: true })}>Mark paid</Button>}
        {(r.status === "pending" || r.status === "confirmed") && <Button size="sm" variant="danger" onClick={() => { if (confirm(`Cancel ${r.ref}?`)) setStatus(r.id, "cancelled"); }}>Cancel booking</Button>}
        {r.status === "cancelled" && <Button size="sm" variant="secondary" onClick={() => setStatus(r.id, "confirmed")}>Reinstate</Button>}
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">Timeline</p>
        <ol className="mt-2 space-y-2 border-l border-line pl-4 text-sm">
          {r.timeline.map((t, i) => (
            <li key={i} className="relative"><span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-lake" /><span className="text-ink">{t.text}</span><span className="block text-xs text-slate">{fmtDateTime(t.at)}</span></li>
          ))}
        </ol>
      </div>
    </Drawer>
  );
}
