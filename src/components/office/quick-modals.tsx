"use client";

import { useMemo, useState } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { todayISO } from "@/lib/engine";
import { useHotel, useOfficeScope } from "@/lib/store";
import type { InquirySource, InquiryType } from "@/lib/types";
import { Modal } from "./ui";

/** A request that did not come through the website — a call, a WhatsApp, an Instagram DM — typed straight into the pipeline. */
export function NewRequestModal({ onClose }: { onClose: () => void }) {
  const scope = useOfficeScope();
  const add = useHotel((s) => s.addInquiry);
  const [propertyId, setPropertyId] = useState(scope.property?.id ?? scope.allProperties[0].id);
  const [type, setType] = useState<InquiryType>("group");
  const [source, setSource] = useState<InquirySource>("whatsapp");
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: "", dates: "", headcount: "", message: "", nextLabel: "", nextDue: todayISO() });
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !f.subject.trim()) return setErr("Name and subject are needed.");
    add({
      type, source, propertyId, name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() || undefined, subject: f.subject.trim(), message: f.message.trim() || f.subject.trim(),
      dates: f.dates.trim() || undefined, headcount: f.headcount ? Number(f.headcount) : undefined,
      nextAction: f.nextLabel.trim() ? { label: f.nextLabel.trim(), due: f.nextDue } : undefined,
    });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={<h2 className="font-display text-lg font-semibold">New request</h2>}>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Property"><Select value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>{scope.allProperties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
          <Field label="Kind">
            <Select value={type} onChange={(e) => setType(e.target.value as InquiryType)}>
              {(["group", "retreat", "whole", "venue", "long_stay", "concierge", "contact"] as InquiryType[]).map((t) => <option key={t} value={t}>{({ group: "Group", retreat: "Workshop", whole: "Whole property", venue: "Venue hire", long_stay: "Long stay", concierge: "Concierge", contact: "Question" })[t]}</option>)}
            </Select>
          </Field>
          <Field label="Came in by">
            <Select value={source} onChange={(e) => setSource(e.target.value as InquirySource)}>
              {(["whatsapp", "phone", "instagram", "email", "ota", "website"] as InquirySource[]).map((s) => <option key={s} value={s}>{({ whatsapp: "WhatsApp", phone: "Phone", instagram: "Instagram", email: "Email", ota: "OTA message", website: "Website" })[s]}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name"><Input value={f.name} onChange={set("name")} /></Field>
          <Field label="Email"><Input type="email" value={f.email} onChange={set("email")} /></Field>
          <Field label="Phone"><Input value={f.phone} onChange={set("phone")} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_160px_120px]">
          <Field label="Subject"><Input value={f.subject} onChange={set("subject")} placeholder="Fondue weekend, 11 people, May" /></Field>
          <Field label="Dates"><Input value={f.dates} onChange={set("dates")} placeholder="14–17 May 2027" /></Field>
          <Field label="People"><Input type="number" min={1} value={f.headcount} onChange={set("headcount")} /></Field>
        </div>
        <Field label="What they said"><Textarea value={f.message} onChange={set("message")} className="min-h-20" /></Field>
        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <Field label="Next action"><Input value={f.nextLabel} onChange={set("nextLabel")} placeholder="Send offer with deposit terms" /></Field>
          <Field label="Due"><Input type="date" value={f.nextDue} onChange={set("nextDue")} /></Field>
        </div>
        {err && <p className="text-sm text-[#b3261e]">{err}</p>}
        <div className="flex justify-end gap-2 border-t border-ink/5 pt-4"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit">Add to inbox</Button></div>
      </form>
    </Modal>
  );
}

/** Take a unit off sale with a reason; the calendar and the booking engine stop offering it. */
export function OutOfOrderModal({ onClose }: { onClose: () => void }) {
  const scope = useOfficeScope();
  const update = useHotel((s) => s.updateRoom);
  const units = useMemo(() => scope.rooms.filter((r) => r.kind !== "whole"), [scope.rooms]);
  const [roomId, setRoomId] = useState(units[0]?.id ?? "");
  const [note, setNote] = useState("");
  const room = units.find((u) => u.id === roomId);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    update(room.id, room.status === "active" ? { status: "out_of_order", statusNote: note.trim() || "Out of order" } : { status: "active", statusNote: undefined });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={<h2 className="font-display text-lg font-semibold">Out of order</h2>} width="max-w-lg">
      <form onSubmit={submit} className="space-y-5">
        <Field label="Unit">
          <Select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            {scope.allProperties.filter((p) => units.some((u) => u.propertyId === p.id)).map((p) => (
              <optgroup key={p.id} label={p.name}>
                {units.filter((u) => u.propertyId === p.id).map((u) => <option key={u.id} value={u.id}>{u.number} · {u.name}{u.status === "out_of_order" ? " — out of order now" : ""}</option>)}
              </optgroup>
            ))}
          </Select>
        </Field>
        {room?.status === "active" ? (
          <Field label="Reason"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Boiler repair until Friday" /></Field>
        ) : (
          <p className="text-sm text-slate">{room?.name} is out of order{room?.statusNote ? ` — ${room.statusNote}` : ""}. Saving puts it back on sale.</p>
        )}
        <div className="flex justify-end gap-2 border-t border-ink/5 pt-4"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit">{room?.status === "active" ? "Take off sale" : "Back on sale"}</Button></div>
      </form>
    </Modal>
  );
}

/** A note on a guest, found by name or email — shows on their profile and on every stay. */
export function GuestNoteModal({ onClose, email: initialEmail }: { onClose: () => void; email?: string }) {
  const scope = useOfficeScope();
  const add = useHotel((s) => s.addGuestNote);
  const [q, setQ] = useState(initialEmail ?? "");
  const [text, setText] = useState("");
  const guests = useMemo(() => {
    const m = new Map<string, { name: string; email: string }>();
    for (const r of scope.reservations) {
      const k = r.guest.email.toLowerCase();
      if (!m.has(k)) m.set(k, { name: `${r.guest.firstName} ${r.guest.lastName}`, email: r.guest.email });
    }
    return [...m.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [scope.reservations]);
  const nq = q.trim().toLowerCase();
  const matches = nq ? guests.filter((g) => g.name.toLowerCase().includes(nq) || g.email.toLowerCase().includes(nq)).slice(0, 6) : [];
  const exact = guests.find((g) => g.email.toLowerCase() === nq);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exact || !text.trim()) return;
    add(exact.email, text.trim());
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={<h2 className="font-display text-lg font-semibold">Guest note</h2>} width="max-w-lg">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Guest">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or email" autoFocus />
        </Field>
        {!exact && matches.length > 0 && (
          <ul className="-mt-2 divide-y divide-ink/5 rounded-xs ring-1 ring-ink/10">
            {matches.map((g) => <li key={g.email}><button type="button" onClick={() => setQ(g.email)} className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-ink/5"><span>{g.name}</span><span className="text-slate">{g.email}</span></button></li>)}
          </ul>
        )}
        {exact && <p className="-mt-2 text-xs text-moss">{exact.name}</p>}
        <Field label="Note"><Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-24" placeholder="Prefers a quiet room, allergic to nuts, celebrates a birthday on the 24th…" /></Field>
        <div className="flex justify-end gap-2 border-t border-ink/5 pt-4"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={!exact || !text.trim()}>Save note</Button></div>
      </form>
    </Modal>
  );
}
