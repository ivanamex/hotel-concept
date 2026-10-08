"use client";

import { clsx } from "clsx";
import Image from "next/image";
import { useState } from "react";
import { OfficeShell } from "@/components/office/shell";
import { Drawer, Panel, Toggle, td, th } from "@/components/office/ui";
import { Button, Field, Input, Select, Textarea, inputClass } from "@/components/ui";
import { todayISO } from "@/lib/engine";
import { chf } from "@/lib/format";
import { useHotel } from "@/lib/store";
import type { Room, ViewType } from "@/lib/types";

export default function RoomsPage() {
  const rooms = useHotel((s) => s.rooms);
  const reservations = useHotel((s) => s.reservations);
  const updateRoom = useHotel((s) => s.updateRoom);
  const [edit, setEdit] = useState<Room | null>(null);
  const today = todayISO();

  const stateOf = (room: Room) => {
    if (room.status === "out_of_order") return { label: "Out of order", cls: "bg-[#fdecea] text-[#9f2f24]" };
    const r = reservations.find((x) => x.roomId === room.id && x.status !== "cancelled" && x.checkIn <= today && x.checkOut > today);
    if (r) return { label: r.status === "checked_in" ? `In house · ${r.guest.lastName}` : `Arriving · ${r.guest.lastName}`, cls: "bg-moss-soft text-moss" };
    const next = reservations.filter((x) => x.roomId === room.id && x.status !== "cancelled" && x.checkIn > today).sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1))[0];
    return { label: next ? `Free · next ${next.checkIn.slice(5)}` : "Free", cls: "bg-mist text-lake" };
  };

  return (
    <OfficeShell title="Rooms" subtitle={`${rooms.filter((r) => r.status === "active").length} of ${rooms.length} rooms in service`}>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="bg-[#fafbfc]"><tr><th className={th}>Room</th><th className={th}>Type</th><th className={th}>Guests</th><th className={th}>View · floor</th><th className={th}>Base rate</th><th className={th}>Today</th><th className={th}>In service</th><th className={th}></th></tr></thead>
            <tbody className="divide-y divide-ink/5">
              {rooms.map((room) => {
                const st = stateOf(room);
                return (
                  <tr key={room.id} className="hover:bg-[#fafbfc]">
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg"><Image src={room.images[0]} alt="" fill sizes="64px" className="object-cover" /></span>
                        <div><p className="font-semibold">{room.number} · {room.name}</p><p className="text-xs text-slate">{room.sizeM2} m² · {room.beds}</p></div>
                      </div>
                    </td>
                    <td className={td}>{room.category}</td>
                    <td className={td}>{room.maxAdults} adults · {room.maxGuests} max</td>
                    <td className={td}>{room.view} · {room.floor === 1 ? "ground" : room.floor - 1}</td>
                    <td className={td}>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate">CHF</span>
                        <input type="number" value={room.basePrice} min={50} step={5} onChange={(e) => updateRoom(room.id, { basePrice: Number(e.target.value) })} className={clsx(inputClass, "h-9 w-24 px-2 text-sm tabular-nums")} aria-label={`Base rate ${room.name}`} />
                      </div>
                    </td>
                    <td className={td}><span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold", st.cls)}>{st.label}</span></td>
                    <td className={td}><Toggle on={room.status === "active"} label={`${room.name} in service`} onChange={(v) => updateRoom(room.id, { status: v ? "active" : "out_of_order", statusNote: v ? undefined : room.statusNote || "Maintenance" })} /></td>
                    <td className={`${td} text-right`}><button type="button" onClick={() => setEdit(room)} className="text-sm font-semibold text-lake hover:text-lake-deep">Edit</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <p className="mt-4 text-xs text-slate">Base rate is the mid-season, room-only price. Seasons and weekend rules are applied automatically — see Rates & extras.</p>

      {edit && <RoomEditor room={rooms.find((r) => r.id === edit.id)!} onClose={() => setEdit(null)} />}
    </OfficeShell>
  );
}

function RoomEditor({ room, onClose }: { room: Room; onClose: () => void }) {
  const updateRoom = useHotel((s) => s.updateRoom);
  const [form, setForm] = useState({ ...room, featuresText: room.features.join("\n") });
  const save = () => {
    updateRoom(room.id, {
      name: form.name, category: form.category, sizeM2: Number(form.sizeM2), beds: form.beds, maxAdults: Number(form.maxAdults), maxGuests: Number(form.maxGuests),
      view: form.view, floor: Number(form.floor), basePrice: Number(form.basePrice), summary: form.summary, description: form.description,
      features: form.featuresText.split("\n").map((s) => s.trim()).filter(Boolean), statusNote: form.statusNote,
    });
    onClose();
  };
  return (
    <Drawer open onClose={onClose} title={<h2 className="font-display text-lg font-semibold">Room {room.number} · edit</h2>} width="max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
        <Field label="Size (m²)"><Input type="number" value={form.sizeM2} onChange={(e) => setForm({ ...form, sizeM2: Number(e.target.value) })} /></Field>
        <Field label="Beds"><Input value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} /></Field>
        <Field label="Max adults"><Input type="number" value={form.maxAdults} onChange={(e) => setForm({ ...form, maxAdults: Number(e.target.value) })} /></Field>
        <Field label="Max guests"><Input type="number" value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: Number(e.target.value) })} /></Field>
        <Field label="View"><Select value={form.view} onChange={(e) => setForm({ ...form, view: e.target.value as ViewType })}>{["Lake", "Garden", "Courtyard"].map((v) => <option key={v}>{v}</option>)}</Select></Field>
        <Field label="Floor (1 = ground)"><Input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })} /></Field>
        <Field label="Base rate (CHF)"><Input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} /></Field>
        <Field label="Out-of-order note"><Input value={form.statusNote ?? ""} onChange={(e) => setForm({ ...form, statusNote: e.target.value })} placeholder="e.g. Bathroom renovation" /></Field>
        <Field label="One-line summary" className="sm:col-span-2"><Input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></Field>
        <Field label="Description" className="sm:col-span-2"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <Field label="Features (one per line)" className="sm:col-span-2"><Textarea value={form.featuresText} onChange={(e) => setForm({ ...form, featuresText: e.target.value })} className="min-h-40 font-mono text-xs" /></Field>
      </div>
      <div className="mt-4">
        <p className="mb-2 text-sm font-medium">Photos</p>
        <div className="flex flex-wrap gap-2">{room.images.map((src) => <span key={src} className="relative h-16 w-24 overflow-hidden rounded-lg ring-1 ring-ink/5"><Image src={src} alt="" fill sizes="96px" className="object-cover" /></span>)}</div>
        <p className="mt-2 text-xs text-slate">Photo upload and ordering arrive with the backend.</p>
      </div>
      <div className="mt-6 flex justify-end gap-2 border-t border-ink/5 pt-4"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save}>Save</Button></div>
      <p className="mt-3 text-xs text-slate">Current price for reference: {chf(room.basePrice)} base.</p>
    </Drawer>
  );
}
