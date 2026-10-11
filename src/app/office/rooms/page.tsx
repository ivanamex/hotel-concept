"use client";

import { clsx } from "clsx";
import { Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { OfficeShell } from "@/components/office/shell";
import { Drawer, Panel, PropertyChip, Toggle, numInput, td, th } from "@/components/office/ui";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { todayISO, unitOccupiedOn } from "@/lib/engine";
import { money } from "@/lib/format";
import { useHotel, useOfficeScope } from "@/lib/store";
import type { Housekeeping, Property, Room, ViewType } from "@/lib/types";

const HK: Record<Housekeeping, { label: string; cls: string; next: Housekeeping; verb: string }> = {
  dirty: { label: "To clean", cls: "bg-clay-soft text-clay", next: "clean", verb: "Mark clean" },
  clean: { label: "Clean", cls: "bg-mist text-lake", next: "inspected", verb: "Inspected" },
  inspected: { label: "Inspected", cls: "bg-moss-soft text-moss", next: "dirty", verb: "Needs cleaning" },
};

export default function UnitsPage() {
  return <Suspense fallback={null}><Units /></Suspense>;
}

function Units() {
  const scope = useOfficeScope();
  const params = useSearchParams();
  const reservations = useHotel((s) => s.reservations);
  const updateRoom = useHotel((s) => s.updateRoom);
  const setHousekeeping = useHotel((s) => s.setHousekeeping);
  const setProperty = useHotel((s) => s.setOfficeProperty);
  const [edit, setEdit] = useState<string | null>(null);
  const [hk, setHk] = useState<Housekeeping | "all">("all");
  const today = todayISO();

  useEffect(() => {
    const h = params.get("hk");
    if (h === "dirty" || h === "clean" || h === "inspected") setHk(h);
    const o = params.get("open");
    if (o) setEdit(o);
    const p = params.get("property");
    if (p && scope.all && scope.allProperties.some((x) => x.id === p)) setProperty(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const live = useMemo(() => reservations.filter((r) => r.status !== "cancelled"), [reservations]);
  const stateOf = (room: Room) => {
    if (room.status === "out_of_order") return { label: room.statusNote ? `Out of order · ${room.statusNote}` : "Out of order", cls: "bg-[#fdecea] text-[#9f2f24]" };
    const r = unitOccupiedOn(room, today, scope.allRooms, live);
    if (r) {
      const via = r.roomId !== room.id ? (room.kind === "whole" ? " (cabins booked separately)" : " (whole site)") : "";
      return { label: `${r.status === "checked_in" ? "In house" : "Arriving"} · ${r.guest.lastName}${via}`, cls: "bg-moss-soft text-moss" };
    }
    const next = live.filter((x) => x.roomId === room.id && x.checkIn > today).sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1))[0];
    return { label: next ? `Free · next ${next.checkIn.slice(5)}` : "Free", cls: "bg-[#f5f6f8] text-slate" };
  };

  const units = scope.rooms.filter((u) => hk === "all" || (u.kind !== "whole" && u.housekeeping === hk));
  const sellable = scope.rooms.filter((u) => u.kind !== "whole");
  const toClean = sellable.filter((u) => u.housekeeping === "dirty").length;
  const label = unitWord(scope.properties);

  return (
    <OfficeShell title={label.many[0].toUpperCase() + label.many.slice(1)} subtitle={`${sellable.filter((r) => r.status === "active").length} of ${sellable.length} ${label.many} in service · ${toClean} to clean`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-xs bg-white p-1 ring-1 ring-ink/5">
          {(["all", "dirty", "clean", "inspected"] as const).map((h) => (
            <button key={h} type="button" onClick={() => setHk(h)} className={clsx("rounded-xs px-3 py-1.5 text-xs font-semibold transition", hk === h ? "bg-ink text-white" : "text-slate hover:text-ink")}>
              {h === "all" ? "All" : HK[h].label} · {h === "all" ? sellable.length : sellable.filter((u) => u.housekeeping === h).length}
            </button>
          ))}
        </div>
        <p className="ml-auto text-xs text-slate">Housekeeping: a unit someone leaves is “to clean” until it is done, then “clean”, then “inspected” when checked.</p>
      </div>

      <div className="space-y-6">
        {scope.properties.map((p) => {
          const own = units.filter((u) => u.propertyId === p.id).sort((a, b) => (a.kind === "whole" ? -1 : b.kind === "whole" ? 1 : a.number - b.number));
          if (own.length === 0) return null;
          return (
            <Panel key={p.id} title={scope.all && scope.allProperties.length > 1 ? p.name : undefined} action={scope.all && scope.allProperties.length > 1 ? <span className="text-xs text-slate">{p.kind} · {p.city}</span> : undefined}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px]">
                  <thead className="bg-[#fafbfc]"><tr><th className={th}>{p.unitLabel.one[0].toUpperCase() + p.unitLabel.one.slice(1)}</th><th className={th}>Type</th><th className={th}>Guests</th><th className={th}>Base rate</th><th className={th}>Today</th><th className={th}>Housekeeping</th><th className={th}>On sale</th><th className={th}></th></tr></thead>
                  <tbody className="divide-y divide-ink/5">
                    {own.map((room) => {
                      const st = stateOf(room);
                      const whole = room.kind === "whole";
                      const children = scope.allRooms.filter((u) => u.parentId === room.id);
                      return (
                        <tr key={room.id} className={clsx("transition hover:bg-[#fafbfc]", whole && "bg-[#fbfbf7]")}>
                          <td className={td}>
                            <div className="flex items-center gap-3">
                              <Thumb src={room.images[0]} alt="" />
                              <div>
                                <p className="font-semibold">{whole ? room.name : `${room.number} · ${room.name}`}{room.parentId && <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-slate">part of the whole site</span>}</p>
                                <p className="text-xs text-slate">{whole ? `books ${children.map((c) => c.name.replace("Cabane ", "")).join(", ")} together` : `${room.sizeM2} m² · ${room.beds}`}</p>
                              </div>
                            </div>
                          </td>
                          <td className={td}>{room.category}</td>
                          <td className={td}>{whole ? `up to ${room.maxGuests}` : `${room.maxAdults} adults · ${room.maxGuests} max`}</td>
                          <td className={td}>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-slate">{p.currency}</span>
                              <input type="number" value={room.basePrice} min={50} step={5} onChange={(e) => updateRoom(room.id, { basePrice: Number(e.target.value) })} className={numInput} aria-label={`Base rate ${room.name}`} />
                            </div>
                          </td>
                          <td className={td}><span className={clsx("rounded-xs px-2.5 py-1 text-xs font-semibold", st.cls)}>{st.label}</span></td>
                          <td className={td}>
                            {whole ? <span className="text-xs text-slate">—</span> : (
                              <div className="flex items-center gap-2">
                                <span className={clsx("rounded-xs px-2 py-1 text-[11px] font-semibold", HK[room.housekeeping].cls)}>{HK[room.housekeeping].label}</span>
                                <button type="button" onClick={() => setHousekeeping(room.id, HK[room.housekeeping].next)} className="inline-flex items-center gap-1 rounded-xs px-2 py-1 text-[11px] font-semibold text-lake transition hover:bg-mist" title={HK[room.housekeeping].verb}>
                                  {room.housekeeping === "dirty" && <Sparkles className="h-3 w-3" />}{HK[room.housekeeping].verb}
                                </button>
                              </div>
                            )}
                          </td>
                          <td className={td}>{whole ? <span className="text-xs text-slate">follows the {p.unitLabel.many}</span> : <Toggle on={room.status === "active"} label={`${room.name} on sale`} onChange={(v) => updateRoom(room.id, { status: v ? "active" : "out_of_order", statusNote: v ? undefined : room.statusNote || "Maintenance" })} />}</td>
                          <td className={`${td} text-right`}><button type="button" onClick={() => setEdit(room.id)} className="text-sm font-semibold text-lake hover:text-lake-deep">Edit</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-slate">Base rate is the mid-season, unit-only price. Seasons and weekend rules are applied automatically — see Rates & extras. Booking “the whole site” blocks every cabin under it, and a booked cabin blocks the whole site.</p>

      {edit && scope.allRooms.some((r) => r.id === edit) && <RoomEditor room={scope.allRooms.find((r) => r.id === edit)!} property={scope.allProperties.find((p) => p.id === scope.allRooms.find((r) => r.id === edit)!.propertyId)!} onClose={() => setEdit(null)} />}
    </OfficeShell>
  );
}

function unitWord(properties: Property[]) {
  const words = new Set(properties.map((p) => p.unitLabel.many));
  return words.size === 1 ? properties[0].unitLabel : { one: "unit", many: "units" };
}

/** A plain thumbnail that falls back to a neutral tile when the image is not there yet. */
export function Thumb({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <span className={clsx("flex h-11 w-16 shrink-0 items-center justify-center rounded-lg bg-[#eef0f2] text-[10px] font-semibold uppercase tracking-wide text-slate", className)}>photo</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} onError={() => setBroken(true)} className={clsx("h-11 w-16 shrink-0 rounded-lg object-cover", className)} />;
}

function RoomEditor({ room, property, onClose }: { room: Room; property: Property; onClose: () => void }) {
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
    <Drawer open onClose={onClose} title={<h2 className="font-display text-lg font-semibold">{room.kind === "whole" ? room.name : `${property.unitLabel.one[0].toUpperCase() + property.unitLabel.one.slice(1)} ${room.number}`} · edit <PropertyChip id={property.id} size="xs" className="ml-2 align-middle" /></h2>} width="max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
        <Field label="Size (m²)"><Input type="number" value={form.sizeM2} onChange={(e) => setForm({ ...form, sizeM2: Number(e.target.value) })} /></Field>
        <Field label="Beds"><Input value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} /></Field>
        <Field label="Max adults"><Input type="number" value={form.maxAdults} onChange={(e) => setForm({ ...form, maxAdults: Number(e.target.value) })} /></Field>
        <Field label="Max guests"><Input type="number" value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: Number(e.target.value) })} /></Field>
        <Field label="View"><Select value={form.view} onChange={(e) => setForm({ ...form, view: e.target.value as ViewType })}>{["Lake", "Garden", "Courtyard", "Forest"].map((v) => <option key={v}>{v}</option>)}</Select></Field>
        <Field label="Floor (1 = ground)"><Input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })} /></Field>
        <Field label={`Base rate (${property.currency})`}><Input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} /></Field>
        <Field label="Out-of-order note"><Input value={form.statusNote ?? ""} onChange={(e) => setForm({ ...form, statusNote: e.target.value })} placeholder="e.g. Bathroom renovation" /></Field>
        <Field label="One-line summary" className="sm:col-span-2"><Input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></Field>
        <Field label="Description" className="sm:col-span-2"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <Field label="Features (one per line)" className="sm:col-span-2"><Textarea value={form.featuresText} onChange={(e) => setForm({ ...form, featuresText: e.target.value })} className="min-h-40 font-mono text-xs" /></Field>
      </div>
      <div className="mt-4">
        <p className="mb-2 text-sm font-medium">Photos</p>
        <div className="flex flex-wrap gap-2">{room.images.map((src) => <Thumb key={src} src={src} alt="" className="h-16 w-24" />)}</div>
        <p className="mt-2 text-xs text-slate">Photo upload and ordering arrive with the backend.</p>
      </div>
      <div className="mt-6 flex justify-end gap-2 border-t border-ink/5 pt-4"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save}>Save</Button></div>
      <p className="mt-3 text-xs text-slate">Current price for reference: {money(room.basePrice, property.currency)} base.</p>
    </Drawer>
  );
}
