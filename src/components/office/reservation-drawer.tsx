"use client";

import { Mail, Phone, StickyNote } from "lucide-react";
import { useState } from "react";
import { ExtraIcon } from "@/components/site/extra-icon";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { isRoomAvailable, nightsBetween, todayISO } from "@/lib/engine";
import { TYPE_LABEL, fmtDate, fmtDateTime, guestsLabel, money, plural, relativeDay } from "@/lib/format";
import { useHotel } from "@/lib/store";
import { Drawer, PropertyChip, SourceChip, StatusChip } from "./ui";

const NONE: { at: string; text: string }[] = [];

export function ReservationDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const r = useHotel((s) => s.reservations.find((x) => x.id === id));
  const rooms = useHotel((s) => s.rooms);
  const reservations = useHotel((s) => s.reservations);
  const properties = useHotel((s) => s.properties);
  const ratePlans = useHotel((s) => s.ratePlans);
  const extrasAll = useHotel((s) => s.extras);
  const allGuestNotes = useHotel((s) => s.guestNotes);
  const guestNotes = r ? allGuestNotes[r.guest.email.toLowerCase()] ?? NONE : NONE;
  const setStatus = useHotel((s) => s.setReservationStatus);
  const update = useHotel((s) => s.updateReservation);
  const move = useHotel((s) => s.moveReservation);
  const addGuestNote = useHotel((s) => s.addGuestNote);
  const [editNotes, setEditNotes] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [moveTo, setMoveTo] = useState<{ roomId: string; checkIn: string; checkOut: string } | null>(null);
  const [moveErr, setMoveErr] = useState("");
  const [guestNote, setGuestNote] = useState("");
  const today = todayISO();

  if (!r) return <Drawer open={!!id} onClose={onClose} title={null}>Not found.</Drawer>;
  const room = rooms.find((x) => x.id === r.roomId)!;
  const property = properties.find((p) => p.id === r.propertyId);
  const cur = property?.currency ?? "CHF";
  const plan = ratePlans.find((p) => p.id === r.ratePlan)!;
  const extras = extrasAll.filter((e) => r.extras.includes(e.id));
  const nights = nightsBetween(r.checkIn, r.checkOut);
  const siblings = rooms.filter((u) => u.propertyId === r.propertyId && u.kind === room.kind);
  const stays = reservations.filter((x) => x.guest.email.toLowerCase() === r.guest.email.toLowerCase() && x.status !== "cancelled");

  const startMove = () => { setMoveTo({ roomId: r.roomId, checkIn: r.checkIn, checkOut: r.checkOut }); setMoveErr(""); setMoving(true); };
  const doMove = () => {
    if (!moveTo) return;
    const res = move(r.id, moveTo);
    if (!res.ok) return setMoveErr(res.reason ?? "That did not work.");
    setMoving(false);
  };

  return (
    <Drawer
      open
      onClose={onClose}
      title={
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">{r.ref}{property && properties.length > 1 ? <> · <PropertyChip id={r.propertyId} size="xs" /></> : null}</p>
          <h2 className="truncate font-display text-lg font-semibold">{r.guest.firstName} {r.guest.lastName}</h2>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip status={r.status} />
        <SourceChip source={r.source} />
        {r.type !== "stay" && <span className="rounded-xs bg-[#eef3ff] px-2.5 py-1 text-xs font-semibold text-[#2f4b8f]">{TYPE_LABEL[r.type]}{r.headcount ? ` · ${r.headcount} people` : ""}</span>}
        <span className={r.paid ? "rounded-xs bg-moss-soft px-2.5 py-1 text-xs font-semibold text-moss" : "rounded-xs bg-sand px-2.5 py-1 text-xs font-semibold text-ink-soft"}>{r.paid ? "Paid" : r.deposit ? `Deposit ${money(r.deposit, cur)} · balance open` : "Unpaid"}</span>
        {stays.length > 1 && <span className="rounded-xs bg-mist px-2.5 py-1 text-xs font-semibold text-lake">Returning · {stays.length} stays</span>}
      </div>

      {r.holdUntil && r.status === "pending" && (
        <div className="mt-4 rounded-lg border border-dashed border-[#d9a03a]/60 bg-[#fff9e8] px-4 py-3 text-sm text-[#6b4500]">
          <p className="font-semibold">Dates held until {fmtDate(r.holdUntil, "weekday")} · {relativeDay(r.holdUntil, today)}</p>
          <p className="text-xs">Nothing paid yet. Confirm to turn the hold into a booking, or let it lapse and the {property?.unitLabel.many ?? "units"} go back on sale.</p>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 rounded-lg bg-[#f5f6f8] p-4 text-sm">
        <div><p className="text-xs text-slate">{room.kind === "whole" ? "Booked" : property?.unitLabel.one ?? "Unit"}</p><p className="font-semibold">{room.kind === "whole" ? room.name : `${room.number} · ${room.name}`}</p>{room.kind === "whole" && <p className="text-xs text-slate">blocks {rooms.filter((u) => u.parentId === room.id).length} {property?.unitLabel.many}</p>}</div>
        <div><p className="text-xs text-slate">Guests</p><p className="font-semibold">{r.headcount ? `${r.headcount} people` : guestsLabel(r.adults, r.children)}</p></div>
        <div><p className="text-xs text-slate">Check-in</p><p className="font-semibold">{fmtDate(r.checkIn, "weekday")}</p>{r.arrivalTime && <p className="text-xs text-slate">arrives {r.arrivalTime}</p>}</div>
        <div><p className="text-xs text-slate">Check-out</p><p className="font-semibold">{fmtDate(r.checkOut, "weekday")}</p><p className="text-xs text-slate">{plural(nights, "night")}</p></div>
        <div><p className="text-xs text-slate">Rate</p><p className="font-semibold">{plan.name}</p></div>
        <div><p className="text-xs text-slate">Total incl. taxes</p><p className="font-semibold">{money(r.total, cur, { decimals: true })}</p><p className="text-xs text-slate">taxes {money(r.cityTax, cur, { decimals: true })}{r.promo ? ` · code ${r.promo} −${money(r.discount ?? 0, cur)}` : ""}</p></div>
      </div>

      {moving && moveTo ? (
        <div className="mt-4 space-y-3 rounded-lg ring-1 ring-ink/10 p-4">
          <p className="text-sm font-semibold">Move this stay</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2 text-xs text-slate">{property?.unitLabel.one ?? "Unit"}
              <Select value={moveTo.roomId} onChange={(e) => setMoveTo({ ...moveTo, roomId: e.target.value })} className="mt-1">
                {siblings.map((u) => <option key={u.id} value={u.id} disabled={u.status !== "active"}>{u.kind === "whole" ? u.name : `${u.number} · ${u.name}`}{isRoomAvailable(u, moveTo.checkIn, moveTo.checkOut, reservations, r.id, rooms) ? "" : " — taken"}</option>)}
              </Select>
            </label>
            <label className="text-xs text-slate">Check-in<Input type="date" value={moveTo.checkIn} onChange={(e) => setMoveTo({ ...moveTo, checkIn: e.target.value })} className="mt-1" /></label>
            <label className="text-xs text-slate">Check-out<Input type="date" value={moveTo.checkOut} onChange={(e) => setMoveTo({ ...moveTo, checkOut: e.target.value })} className="mt-1" /></label>
          </div>
          {moveErr && <p className="text-xs text-[#9f2f24]">{moveErr}</p>}
          <div className="flex gap-2"><Button size="sm" onClick={doMove}>Move</Button><Button size="sm" variant="ghost" onClick={() => setMoving(false)}>Cancel</Button></div>
        </div>
      ) : (
        r.status !== "cancelled" && r.status !== "checked_out" && <button type="button" onClick={startMove} className="mt-3 text-xs font-semibold text-lake hover:text-lake-deep">Move to another {property?.unitLabel.one ?? "unit"} or other dates →</button>
      )}

      <div className="mt-5 space-y-2 text-sm">
        <a href={`mailto:${r.guest.email}`} className="flex items-center gap-2 text-ink hover:text-lake"><Mail className="h-4 w-4 text-slate" /> {r.guest.email}</a>
        <a href={`tel:${r.guest.phone}`} className="flex items-center gap-2 text-ink hover:text-lake"><Phone className="h-4 w-4 text-slate" /> {r.guest.phone} · {r.guest.country}</a>
      </div>

      {extras.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">Extras</p>
          <ul className="mt-2 flex flex-wrap gap-2">{extras.map((e) => <li key={e.id} className="inline-flex items-center gap-1.5 rounded-xs bg-mist px-3 py-1 text-xs font-semibold text-lake"><ExtraIcon name={e.icon} className="h-3.5 w-3.5" /> {e.short}</li>)}</ul>
        </div>
      )}

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">Notes on this stay</p>
          {editNotes === null ? <button type="button" className="text-xs font-semibold text-lake" onClick={() => setEditNotes(r.notes ?? "")}>Edit</button> : <button type="button" className="text-xs font-semibold text-lake" onClick={() => { update(r.id, { notes: editNotes }); setEditNotes(null); }}>Save</button>}
        </div>
        {editNotes === null ? <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">{r.notes || <span className="text-slate">—</span>}</p> : <Textarea className="mt-2 min-h-24" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />}
      </div>

      <div className="mt-5">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate"><StickyNote className="h-3.5 w-3.5" /> About the guest</p>
        <ul className="mt-2 space-y-1.5">
          {guestNotes.map((n, i) => <li key={i} className="rounded-xs bg-[#fff9e8] px-3 py-2 text-sm text-ink-soft">{n.text}<span className="mt-0.5 block text-[11px] text-slate">{fmtDateTime(n.at)}</span></li>)}
          {guestNotes.length === 0 && <li className="text-sm text-slate">Nothing noted yet.</li>}
        </ul>
        <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (guestNote.trim()) { addGuestNote(r.guest.email, guestNote.trim()); setGuestNote(""); } }}>
          <Input value={guestNote} onChange={(e) => setGuestNote(e.target.value)} placeholder="Remember for next time…" className="!h-9 flex-1 text-sm" />
          <Button size="sm" type="submit" variant="secondary" disabled={!guestNote.trim()}>Add</Button>
        </form>
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
