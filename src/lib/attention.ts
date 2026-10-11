import { addDays, nightsBetween } from "./engine";
import type { Inquiry, Property, Reservation, Room } from "./types";

export type AttentionTone = "clay" | "amber" | "slate";

export interface AttentionItem {
  id: string;
  text: string;
  detail?: string;
  href: string;
  tone: AttentionTone;
  propertyId?: string;
}

interface Scope {
  properties: Property[];
  rooms: Room[];
  reservations: Reservation[];
  inquiries: Inquiry[];
}

const open = (i: Inquiry) => i.status !== "won" && i.status !== "lost";

/** Everything that needs a human today, in the order it should be dealt with. Every row links to the screen that fixes it. */
export function attentionItems(s: Scope, today: string, nowISO: string): AttentionItem[] {
  const items: AttentionItem[] = [];
  const live = s.reservations.filter((r) => r.status !== "cancelled");
  const roomName = (id: string) => s.rooms.find((r) => r.id === id)?.name ?? id;

  // 1. money: leaving today with the balance open, or a non-refundable stay arriving unpaid (should have been charged at booking)
  for (const r of live) {
    const leavingUnpaid = !r.paid && r.checkOut === today && r.status === "checked_in";
    const prepaidMissing = !r.paid && r.checkIn === today && r.ratePlan === "non_refundable";
    if (leavingUnpaid || prepaidMissing) {
      items.push({
        id: `pay-${r.id}`,
        text: `${r.guest.firstName} ${r.guest.lastName} — ${leavingUnpaid ? "balance to settle" : "non-refundable, not charged"}`,
        detail: `${roomName(r.roomId)} · ${r.checkIn === today ? "arrives today" : "leaves today"} · ${r.ref}`,
        href: `/office/reservations?open=${r.id}`,
        tone: "clay",
        propertyId: r.propertyId,
      });
    }
  }

  // 2. holds lapsing: a group hold whose keep-until day is today or passed
  for (const r of live) {
    if (r.holdUntil && r.status === "pending" && r.holdUntil <= addDays(today, 1)) {
      items.push({
        id: `hold-${r.id}`,
        text: `Hold for ${r.guest.lastName} lapses ${r.holdUntil === today ? "today" : r.holdUntil < today ? "— expired" : "tomorrow"}`,
        detail: `${roomName(r.roomId)} · ${r.checkIn} → ${r.checkOut} · ${r.headcount ?? r.adults} people`,
        href: `/office/reservations?open=${r.id}`,
        tone: r.holdUntil < today ? "clay" : "amber",
        propertyId: r.propertyId,
      });
    }
  }

  // 3. requests: next action due or overdue, and anything unanswered for more than 24 h
  for (const i of s.inquiries.filter(open)) {
    if (i.nextAction && i.nextAction.due <= today) {
      items.push({
        id: `na-${i.id}`,
        text: i.nextAction.label,
        detail: `${i.name} · ${i.nextAction.due < today ? "overdue" : "due today"}`,
        href: `/office/inbox?open=${i.id}`,
        tone: i.nextAction.due < today ? "clay" : "amber",
        propertyId: i.propertyId,
      });
    } else if (i.status === "new" && hoursBetween(i.createdAt, nowISO) > 24) {
      items.push({
        id: `unans-${i.id}`,
        text: `${i.name} is waiting for an answer`,
        detail: `${i.subject} · ${Math.floor(hoursBetween(i.createdAt, nowISO) / 24)} days`,
        href: `/office/inbox?open=${i.id}`,
        tone: "amber",
        propertyId: i.propertyId,
      });
    }
  }

  // 4. pending OTA bookings arriving within two days
  for (const r of live) {
    if (r.status === "pending" && !r.holdUntil && r.checkIn <= addDays(today, 2) && r.checkIn >= today) {
      items.push({
        id: `pend-${r.id}`,
        text: `Confirm ${r.guest.firstName} ${r.guest.lastName}`,
        detail: `${r.source} · arrives ${r.checkIn === today ? "today" : r.checkIn} · ${roomName(r.roomId)}`,
        href: `/office/reservations?open=${r.id}`,
        tone: "amber",
        propertyId: r.propertyId,
      });
    }
  }

  // 5. rooms: out of order with an arrival, dirty with an arrival today
  for (const u of s.rooms) {
    const arriving = live.find((r) => r.roomId === u.id && r.checkIn === today);
    if (u.status === "out_of_order" && arriving) {
      items.push({ id: `ooo-${u.id}`, text: `${u.name} is out of order and has an arrival`, detail: `${arriving.guest.lastName} · ${u.statusNote ?? "no note"}`, href: "/office/rooms", tone: "clay", propertyId: u.propertyId });
    } else if (u.housekeeping === "dirty" && arriving) {
      items.push({ id: `dirty-${u.id}`, text: `${u.name} needs cleaning before ${arriving.guest.lastName} arrives`, detail: arriving.arrivalTime ? `expected ${arriving.arrivalTime}` : undefined, href: "/office/rooms", tone: "amber", propertyId: u.propertyId });
    }
  }

  // 6. channels with a sync error
  for (const p of s.properties) {
    for (const c of p.channels) {
      if (c.connected && c.error) items.push({ id: `ch-${p.id}-${c.id}`, text: `${c.name}: sync error`, detail: c.error, href: "/office/channels", tone: "clay", propertyId: p.id });
    }
  }

  // 7. incomplete guest profiles arriving today (no email or phone)
  for (const r of live) {
    if (r.checkIn === today && (!r.guest.email || !r.guest.phone)) {
      items.push({ id: `prof-${r.id}`, text: `${r.guest.firstName} ${r.guest.lastName} — profile incomplete`, detail: !r.guest.email ? "no email" : "no phone", href: `/office/guests`, tone: "slate", propertyId: r.propertyId });
    }
  }

  // 8. long stays leaving tomorrow with nothing paid (gentle reminder)
  for (const r of live) {
    if (r.status === "checked_in" && !r.paid && r.checkOut === addDays(today, 1) && nightsBetween(r.checkIn, r.checkOut) >= 4) {
      items.push({ id: `long-${r.id}`, text: `${r.guest.lastName} leaves tomorrow, nothing settled yet`, detail: `${nightsBetween(r.checkIn, r.checkOut)} nights · ${roomName(r.roomId)}`, href: `/office/reservations?open=${r.id}`, tone: "slate", propertyId: r.propertyId });
    }
  }

  const order: Record<AttentionTone, number> = { clay: 0, amber: 1, slate: 2 };
  return items.sort((a, b) => order[a.tone] - order[b.tone]);
}

function hoursBetween(isoA: string, isoB: string): number {
  return (new Date(isoB).getTime() - new Date(isoA).getTime()) / 3_600_000;
}
