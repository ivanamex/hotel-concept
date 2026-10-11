"use client";

import { useMemo, useState } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { addDays, isRoomAvailable, nightsBetween, quote, roomFits, todayISO } from "@/lib/engine";
import { money, plural } from "@/lib/format";
import { useHotel, useOfficeScope } from "@/lib/store";
import type { Guest, RatePlanId, ReservationSource, ReservationType } from "@/lib/types";
import { Modal } from "./ui";

export interface NewReservationInitial {
  propertyId?: string;
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  guest?: Partial<Guest>;
  notes?: string;
  type?: ReservationType;
  headcount?: number;
  source?: ReservationSource;
  /** The request this reservation comes from — marked won when the booking is created. */
  inquiryId?: string;
}

const TYPE_LABEL: Record<ReservationType, string> = { stay: "Stay", whole: "Whole property", retreat: "Workshop / group", venue: "Venue hire" };

export function NewReservationModal({ onClose, initial }: { onClose: () => void; initial?: NewReservationInitial }) {
  const scope = useOfficeScope();
  const allRooms = useHotel((s) => s.rooms);
  const reservations = useHotel((s) => s.reservations);
  const ratePlans = useHotel((s) => s.ratePlans);
  const seasons = useHotel((s) => s.seasons);
  const extrasAll = useHotel((s) => s.extras);
  const settings = useHotel((s) => s.settings);
  const create = useHotel((s) => s.createReservation);
  const updateInquiry = useHotel((s) => s.updateInquiry);
  const setInquiryStatus = useHotel((s) => s.setInquiryStatus);

  const initialProperty = initial?.propertyId ?? (initial?.roomId ? allRooms.find((r) => r.id === initial.roomId)?.propertyId : undefined) ?? scope.property?.id ?? scope.allProperties[0].id;
  const [propertyId, setPropertyId] = useState(initialProperty);
  const property = scope.allProperties.find((p) => p.id === propertyId) ?? scope.allProperties[0];
  const rooms = allRooms.filter((r) => r.propertyId === propertyId);

  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? todayISO());
  const [checkOut, setCheckOut] = useState(initial?.checkOut ?? addDays(initial?.checkIn ?? todayISO(), 1));
  const [type, setType] = useState<ReservationType>(initial?.type ?? "stay");
  const [adults, setAdults] = useState(initial?.headcount ? Math.min(initial.headcount, 8) : 2);
  const [children, setChildren] = useState(0);
  const [headcount, setHeadcount] = useState(initial?.headcount ?? 8);
  const [roomId, setRoomId] = useState(initial?.roomId ?? "");
  const [planId, setPlanId] = useState<RatePlanId>("bed_breakfast");
  const [source, setSource] = useState<ReservationSource>(initial?.source ?? "phone");
  const [extras, setExtras] = useState<string[]>([]);
  const [g, setG] = useState<Guest>({ firstName: "", lastName: "", email: "", phone: "", country: "Switzerland", ...initial?.guest });
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [err, setErr] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const group = type !== "stay";
  const nights = nightsBetween(checkIn, checkOut);
  const candidates = useMemo(() => (group ? rooms.filter((r) => r.kind === "whole" || !rooms.some((x) => x.kind === "whole")) : rooms.filter((r) => r.kind !== "whole")), [rooms, group]);
  const available = useMemo(
    () => candidates.filter((r) => (group || roomFits(r, adults, children)) && isRoomAvailable(r, checkIn, checkOut, reservations, undefined, allRooms)),
    [candidates, allRooms, reservations, checkIn, checkOut, adults, children, group],
  );
  const room = rooms.find((r) => r.id === roomId);
  const plan = ratePlans.find((p) => p.id === planId)!;
  const tax = property.taxes.find((t) => t.kind === "per_person_night")?.amount ?? 0;
  const q = room && nights > 0
    ? quote({ room, checkIn, checkOut, adults: group ? Math.min(headcount, room.maxGuests) : adults, children: group ? 0 : children, plan, extras: extrasAll.filter((e) => extras.includes(e.id) && !e.requestOnly), seasons, breakfastPrice: settings.breakfastPrice, cityTaxPerPersonNight: tax })
    : null;
  const roomOk = room && available.some((r) => r.id === room.id);

  const pickProperty = (id: string) => {
    setPropertyId(id);
    setRoomId("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !q) return setErr(`Pick a ${property.unitLabel.one}.`);
    if (!roomOk) return setErr(`${room.name} is not free for these dates.`);
    if (!g.firstName || !g.lastName) return setErr("Guest name is required.");
    const r = create({
      propertyId, roomId: room.id, type, checkIn, checkOut, adults: group ? Math.min(headcount, room.maxAdults) : adults, children: group ? 0 : children, headcount: group ? headcount : undefined,
      guest: g, ratePlan: planId, extras, notes, arrivalTime: "", status: "confirmed", source, total: q.total, cityTax: q.cityTax, paid: false,
    });
    if (initial?.inquiryId) {
      updateInquiry(initial.inquiryId, { reservationId: r.id });
      setInquiryStatus(initial.inquiryId, "won");
    }
    setDone(r.ref);
  };

  const unitWord = property.unitLabel.one;

  return (
    <Modal open onClose={onClose} title={<h2 className="font-display text-lg font-semibold">New reservation</h2>}>
      {done ? (
        <div className="py-8 text-center">
          <p className="font-display text-2xl font-semibold text-ink">{done} created</p>
          <p className="mt-2 text-sm text-slate">{g.firstName} {g.lastName} · {room?.name} · {plural(nights, "night")} · {property.name}</p>
          <Button className="mt-6" onClick={onClose}>Done</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Property">
              <Select value={propertyId} onChange={(e) => pickProperty(e.target.value)}>
                {scope.allProperties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
            <Field label="Kind">
              <Select value={type} onChange={(e) => { setType(e.target.value as ReservationType); setRoomId(""); }}>
                {(Object.keys(TYPE_LABEL) as ReservationType[]).map((k) => <option key={k} value={k}>{TYPE_LABEL[k]}</option>)}
              </Select>
            </Field>
            <Field label="Source"><Select value={source} onChange={(e) => setSource(e.target.value as ReservationSource)}>{(["phone", "walk-in", "email", "direct", "booking.com", "expedia", "airbnb"] as const).map((s) => <option key={s} value={s}>{s}</option>)}</Select></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Check-in"><Input type="date" value={checkIn} onChange={(e) => { setCheckIn(e.target.value); if (e.target.value >= checkOut) setCheckOut(addDays(e.target.value, 1)); }} /></Field>
            <Field label="Check-out"><Input type="date" value={checkOut} min={addDays(checkIn, 1)} onChange={(e) => setCheckOut(e.target.value)} /></Field>
            {group ? (
              <Field label="Group size" className="sm:col-span-2"><Input type="number" min={1} max={60} value={headcount} onChange={(e) => setHeadcount(Number(e.target.value))} /></Field>
            ) : (
              <>
                <Field label="Adults"><Select value={adults} onChange={(e) => setAdults(Number(e.target.value))}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</Select></Field>
                <Field label="Children"><Select value={children} onChange={(e) => setChildren(Number(e.target.value))}>{[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}</Select></Field>
              </>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`${unitWord[0].toUpperCase()}${unitWord.slice(1)} (${available.length} free)`}>
              <Select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                <option value="">Choose…</option>
                {candidates.map((r) => {
                  const free = available.some((a) => a.id === r.id);
                  return <option key={r.id} value={r.id} disabled={!free}>{r.kind === "whole" ? r.name : `${r.number} · ${r.name}`}{free ? "" : " (busy)"}</option>;
                })}
              </Select>
            </Field>
            <Field label="Rate plan"><Select value={planId} onChange={(e) => setPlanId(e.target.value as RatePlanId)}>{ratePlans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name"><Input value={g.firstName} onChange={(e) => setG({ ...g, firstName: e.target.value })} /></Field>
            <Field label="Last name"><Input value={g.lastName} onChange={(e) => setG({ ...g, lastName: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" value={g.email} onChange={(e) => setG({ ...g, email: e.target.value })} /></Field>
            <Field label="Phone"><Input value={g.phone} onChange={(e) => setG({ ...g, phone: e.target.value })} /></Field>
          </div>
          {!group && (
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Extras</p>
              <div className="flex flex-wrap gap-2">
                {extrasAll.filter((e) => e.active && !e.requestOnly).map((e) => {
                  const on = extras.includes(e.id);
                  return <button key={e.id} type="button" onClick={() => setExtras((xs) => (on ? xs.filter((x) => x !== e.id) : [...xs, e.id]))} className={on ? "rounded-xs bg-lake px-3 py-1.5 text-xs font-semibold text-white" : "rounded-xs bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft ring-1 ring-line hover:ring-ink/40"}>{e.short}</button>;
                })}
              </div>
            </div>
          )}
          <Field label="Notes"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-20" /></Field>
          {err && <p className="text-sm text-[#b3261e]">{err}</p>}
          <div className="flex items-center justify-between gap-4 border-t border-ink/5 pt-4">
            <p className="text-sm text-slate">{q ? <><span className="font-semibold text-ink">{money(q.total, property.currency, { decimals: true })}</span> · {plural(q.nights, "night")} incl. taxes</> : `Pick dates and a ${unitWord}`}</p>
            <div className="flex gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit">Create</Button></div>
          </div>
        </form>
      )}
    </Modal>
  );
}
