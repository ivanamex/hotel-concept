"use client";

import { useMemo, useState } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { addDays, isRoomAvailable, nightsBetween, quote, roomFits, todayISO } from "@/lib/engine";
import { chf, plural } from "@/lib/format";
import { useHotel } from "@/lib/store";
import type { RatePlanId, ReservationSource } from "@/lib/types";
import { Modal } from "./ui";

export function NewReservationModal({ onClose, initial }: { onClose: () => void; initial?: { roomId?: string; checkIn?: string } }) {
  const rooms = useHotel((s) => s.rooms);
  const reservations = useHotel((s) => s.reservations);
  const ratePlans = useHotel((s) => s.ratePlans);
  const seasons = useHotel((s) => s.seasons);
  const extrasAll = useHotel((s) => s.extras);
  const settings = useHotel((s) => s.settings);
  const create = useHotel((s) => s.createReservation);

  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? todayISO());
  const [checkOut, setCheckOut] = useState(addDays(initial?.checkIn ?? todayISO(), 1));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [roomId, setRoomId] = useState(initial?.roomId ?? "");
  const [planId, setPlanId] = useState<RatePlanId>("bed_breakfast");
  const [source, setSource] = useState<ReservationSource>("phone");
  const [extras, setExtras] = useState<string[]>([]);
  const [g, setG] = useState({ firstName: "", lastName: "", email: "", phone: "", country: "Switzerland" });
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const nights = nightsBetween(checkIn, checkOut);
  const available = useMemo(
    () => rooms.filter((r) => roomFits(r, adults, children) && isRoomAvailable(r, checkIn, checkOut, reservations)),
    [rooms, reservations, checkIn, checkOut, adults, children],
  );
  const room = rooms.find((r) => r.id === roomId);
  const plan = ratePlans.find((p) => p.id === planId)!;
  const q = room && nights > 0 ? quote({ room, checkIn, checkOut, adults, children, plan, extras: extrasAll.filter((e) => extras.includes(e.id) && !e.requestOnly), seasons, breakfastPrice: settings.breakfastPrice, cityTaxPerPersonNight: settings.cityTax }) : null;
  const roomOk = room && available.some((r) => r.id === room.id);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !q) return setErr("Pick a room.");
    if (!roomOk) return setErr("That room is not free for these dates.");
    if (!g.firstName || !g.lastName) return setErr("Guest name is required.");
    const r = create({ roomId: room.id, checkIn, checkOut, adults, children, guest: g, ratePlan: planId, extras, notes, arrivalTime: "", status: "confirmed", source, total: q.total, cityTax: q.cityTax, paid: false });
    setDone(r.ref);
  };

  return (
    <Modal open onClose={onClose} title={<h2 className="font-display text-lg font-semibold">New reservation</h2>}>
      {done ? (
        <div className="py-8 text-center">
          <p className="font-display text-2xl font-semibold text-ink">{done} created</p>
          <p className="mt-2 text-sm text-slate">{g.firstName} {g.lastName} · {room?.name} · {plural(nights, "night")}</p>
          <Button className="mt-6" onClick={onClose}>Done</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Check-in"><Input type="date" value={checkIn} onChange={(e) => { setCheckIn(e.target.value); if (e.target.value >= checkOut) setCheckOut(addDays(e.target.value, 1)); }} /></Field>
            <Field label="Check-out"><Input type="date" value={checkOut} min={addDays(checkIn, 1)} onChange={(e) => setCheckOut(e.target.value)} /></Field>
            <Field label="Adults"><Select value={adults} onChange={(e) => setAdults(Number(e.target.value))}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</Select></Field>
            <Field label="Children"><Select value={children} onChange={(e) => setChildren(Number(e.target.value))}>{[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}</Select></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={`Room (${available.length} free)`} className="sm:col-span-1">
              <Select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                <option value="">Choose…</option>
                {rooms.map((r) => <option key={r.id} value={r.id} disabled={!available.some((a) => a.id === r.id)}>{r.number} · {r.name}{available.some((a) => a.id === r.id) ? "" : " (busy)"}</option>)}
              </Select>
            </Field>
            <Field label="Rate plan"><Select value={planId} onChange={(e) => setPlanId(e.target.value as RatePlanId)}>{ratePlans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
            <Field label="Source"><Select value={source} onChange={(e) => setSource(e.target.value as ReservationSource)}>{(["phone", "walk-in", "email", "direct", "booking.com", "expedia"] as const).map((s) => <option key={s} value={s}>{s}</option>)}</Select></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name"><Input value={g.firstName} onChange={(e) => setG({ ...g, firstName: e.target.value })} /></Field>
            <Field label="Last name"><Input value={g.lastName} onChange={(e) => setG({ ...g, lastName: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" value={g.email} onChange={(e) => setG({ ...g, email: e.target.value })} /></Field>
            <Field label="Phone"><Input value={g.phone} onChange={(e) => setG({ ...g, phone: e.target.value })} /></Field>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-ink">Extras</p>
            <div className="flex flex-wrap gap-2">
              {extrasAll.filter((e) => e.active && !e.requestOnly).map((e) => {
                const on = extras.includes(e.id);
                return <button key={e.id} type="button" onClick={() => setExtras((xs) => (on ? xs.filter((x) => x !== e.id) : [...xs, e.id]))} className={on ? "rounded-full bg-lake px-3 py-1.5 text-xs font-semibold text-white" : "rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft ring-1 ring-line hover:ring-ink/40"}>{e.short}</button>;
              })}
            </div>
          </div>
          <Field label="Notes"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-20" /></Field>
          {err && <p className="text-sm text-[#b3261e]">{err}</p>}
          <div className="flex items-center justify-between gap-4 border-t border-ink/5 pt-4">
            <p className="text-sm text-slate">{q ? <><span className="font-semibold text-ink">{chf(q.total, { decimals: true })}</span> · {plural(q.nights, "night")} incl. city tax</> : "Pick dates and a room"}</p>
            <div className="flex gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit">Create</Button></div>
          </div>
        </form>
      )}
    </Modal>
  );
}
