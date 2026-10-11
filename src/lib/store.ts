"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";
import { conflictFor, nextReference, todayISO, uid } from "./engine";
import { fmtDate } from "./format";
import { ALL_UNITS, EXTRAS, HOTEL, INQUIRIES, PROPERTIES, RATE_PLANS, SEASONS, SITE_PROPERTY, buildDemoReservations } from "./seed";
import type {
  Extra,
  HotelSettings,
  Housekeeping,
  Inquiry,
  InquiryStatus,
  Property,
  RatePlan,
  Reservation,
  ReservationStatus,
  Room,
  Season,
  Subscriber,
} from "./types";

type NewReservation = Omit<Reservation, "id" | "ref" | "createdAt" | "timeline" | "propertyId" | "type"> & Partial<Pick<Reservation, "propertyId" | "type">>;
type NewInquiry = Omit<Inquiry, "id" | "createdAt" | "status" | "notes" | "timeline" | "source"> & Partial<Pick<Inquiry, "source">>;

export interface MoveResult {
  ok: boolean;
  reason?: string;
}

export interface HotelState {
  version: number;
  properties: Property[];
  rooms: Room[];
  reservations: Reservation[];
  inquiries: Inquiry[];
  extras: Extra[];
  ratePlans: RatePlan[];
  seasons: Season[];
  settings: HotelSettings;
  subscribers: Subscriber[];
  /** Notes kept on a guest, keyed by lower-case email. */
  guestNotes: Record<string, { at: string; text: string }[]>;
  officeUser: string | null;
  /** Which property the office shows: "all" or a property id. */
  officeProperty: string;
  lastBookingRef: string | null;

  createReservation: (r: NewReservation) => Reservation;
  updateReservation: (id: string, patch: Partial<Reservation>) => void;
  setReservationStatus: (id: string, status: ReservationStatus) => void;
  /** Move a reservation to another unit and/or other dates; refuses with a reason when the dates clash. */
  moveReservation: (id: string, to: { roomId?: string; checkIn?: string; checkOut?: string }) => MoveResult;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  setHousekeeping: (id: string, state: Housekeeping) => void;
  updateExtra: (id: string, patch: Partial<Extra>) => void;
  updateRatePlan: (id: string, patch: Partial<RatePlan>) => void;
  updateSeason: (id: string, patch: Partial<Season>) => void;
  updateProperty: (id: string, patch: Partial<Property>) => void;
  setOfficeProperty: (id: string) => void;
  addInquiry: (i: NewInquiry) => Inquiry;
  updateInquiry: (id: string, patch: Partial<Inquiry> & { status?: InquiryStatus }) => void;
  setInquiryStatus: (id: string, status: InquiryStatus) => void;
  addInquiryNote: (id: string, text: string) => void;
  addGuestNote: (email: string, text: string) => void;
  updateSettings: (patch: Partial<HotelSettings>) => void;
  addSubscriber: (s: { email: string; name?: string; page: string }) => Subscriber;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
  resetDemo: () => void;
}

const SEED_VERSION = 9;
export const PROMO_CODE = "VIDY10";
export const PROMO_RATE = 0.1;

const now = () => new Date().toISOString().slice(0, 19);

const STATUS_TEXT: Record<InquiryStatus, string> = { new: "Back to new", replied: "Replied", offer: "Offer sent", won: "Won", lost: "Lost" };

function seedState() {
  const today = todayISO();
  const reservations = buildDemoReservations(today);
  // housekeeping follows the day: a unit someone leaves today is dirty until it is done; everything else is clean
  const rooms = ALL_UNITS.map((u) => {
    const leaving = reservations.some((r) => r.roomId === u.id && r.status !== "cancelled" && r.checkOut === today);
    const inHouse = reservations.some((r) => r.roomId === u.id && r.status !== "cancelled" && r.checkIn < today && r.checkOut > today);
    const housekeeping: Housekeeping = leaving ? "dirty" : inHouse ? "clean" : "inspected";
    return { ...u, housekeeping };
  });
  return {
    version: SEED_VERSION,
    properties: PROPERTIES,
    rooms,
    reservations,
    inquiries: INQUIRIES,
    extras: EXTRAS,
    ratePlans: RATE_PLANS,
    seasons: SEASONS,
    settings: HOTEL,
    subscribers: [
      { id: "sub_1", email: "claire.favre@bluewin.ch", name: "Claire", page: "/", createdAt: "2026-10-06T19:12:00", code: "VIDY10" },
      { id: "sub_2", email: "m.brunner@gmx.ch", page: "/rooms", createdAt: "2026-10-07T08:40:00", code: "VIDY10" },
      { id: "sub_3", email: "sophie.laurent@orange.fr", name: "Sophie", page: "/experiences", createdAt: "2026-10-07T21:05:00", code: "VIDY10" },
    ] as Subscriber[],
    guestNotes: {
      "claire.favre@bluewin.ch": [{ at: "2026-06-14T10:00:00", text: "Third stay. Likes the Classic Lake, breakfast at 08:00 sharp, oat milk." }],
      "daniel.cohen3@gmail.com": [{ at: "2026-10-09T09:30:00", text: "Travelling with a 3-year-old — high chair at breakfast, babysitter arranged once." }],
    } as Record<string, { at: string; text: string }[]>,
    officeUser: null as string | null,
    officeProperty: "all",
    lastBookingRef: null as string | null,
  };
}

export const DEMO_LOGIN = { email: "manager@maisonvidy.ch", password: "vidy2026" };

export const useHotel = create<HotelState>()(
  persist(
    (set, get) => ({
      ...seedState(),

      createReservation: (input) => {
        const room = get().rooms.find((r) => r.id === input.roomId);
        const propertyId = input.propertyId ?? room?.propertyId ?? SITE_PROPERTY;
        const property = get().properties.find((p) => p.id === propertyId);
        const at = now();
        const reservation: Reservation = {
          ...input,
          propertyId,
          type: input.type ?? (room?.kind === "whole" ? "whole" : "stay"),
          id: uid("res"),
          ref: nextReference(get().reservations.filter((r) => r.propertyId === propertyId), property?.refPrefix ?? "MV"),
          createdAt: at,
          timeline: [{ at, text: input.source === "direct" ? "Booked on the website" : `Booked via ${input.source}` }],
        };
        set((s) => ({ reservations: [...s.reservations, reservation], lastBookingRef: reservation.ref }));
        return reservation;
      },

      updateReservation: (id, patch) =>
        set((s) => ({ reservations: s.reservations.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),

      setReservationStatus: (id, status) =>
        set((s) => ({
          reservations: s.reservations.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  timeline: [
                    ...r.timeline,
                    {
                      at: now(),
                      text:
                        status === "checked_in"
                          ? "Checked in"
                          : status === "checked_out"
                            ? "Checked out"
                            : status === "cancelled"
                              ? "Cancelled"
                              : status === "confirmed"
                                ? "Confirmed"
                                : "Set to pending",
                    },
                  ],
                }
              : r,
          ),
        })),

      moveReservation: (id, to) => {
        const s = get();
        const res = s.reservations.find((r) => r.id === id);
        if (!res) return { ok: false, reason: "Reservation not found." };
        const roomId = to.roomId ?? res.roomId;
        const checkIn = to.checkIn ?? res.checkIn;
        const checkOut = to.checkOut ?? res.checkOut;
        if (checkOut <= checkIn) return { ok: false, reason: "A stay needs at least one night." };
        const room = s.rooms.find((r) => r.id === roomId);
        if (!room) return { ok: false, reason: "Unit not found." };
        if (room.propertyId !== res.propertyId) return { ok: false, reason: `${room.name} belongs to another property.` };
        if (room.status !== "active") return { ok: false, reason: `${room.name} is out of order.` };
        if (res.adults + res.children > room.maxGuests) return { ok: false, reason: `${room.name} sleeps ${room.maxGuests}, this booking has ${res.adults + res.children} guests.` };
        const clash = conflictFor(room, checkIn, checkOut, s.reservations, s.rooms, id);
        if (clash) {
          const who = `${clash.guest.firstName} ${clash.guest.lastName}`;
          const where = clash.roomId === room.id ? "" : clash.roomId === room.parentId ? " (the whole site is booked)" : " (one of its cabins is booked)";
          return { ok: false, reason: `${room.name} is taken ${fmtDate(clash.checkIn, "short")} → ${fmtDate(clash.checkOut, "short")} by ${who}${where}.` };
        }
        const changed: string[] = [];
        if (roomId !== res.roomId) changed.push(`moved to ${room.name}`);
        if (checkIn !== res.checkIn || checkOut !== res.checkOut) changed.push(`dates ${fmtDate(checkIn, "short")} → ${fmtDate(checkOut, "short")}`);
        set((st) => ({
          reservations: st.reservations.map((r) =>
            r.id === id ? { ...r, roomId, checkIn, checkOut, timeline: [...r.timeline, { at: now(), text: `Changed: ${changed.join(", ")}` }] } : r,
          ),
        }));
        return { ok: true };
      },

      updateRoom: (id, patch) => set((s) => ({ rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      setHousekeeping: (id, state) => set((s) => ({ rooms: s.rooms.map((r) => (r.id === id ? { ...r, housekeeping: state } : r)) })),
      updateExtra: (id, patch) => set((s) => ({ extras: s.extras.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      updateRatePlan: (id, patch) =>
        set((s) => ({ ratePlans: s.ratePlans.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      updateSeason: (id, patch) => set((s) => ({ seasons: s.seasons.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      updateProperty: (id, patch) => set((s) => ({ properties: s.properties.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      setOfficeProperty: (id) => set({ officeProperty: id }),

      addInquiry: (input) => {
        const at = now();
        const source = input.source ?? "website";
        const inquiry: Inquiry = {
          ...input,
          source,
          id: uid("inq"),
          createdAt: at,
          status: "new",
          notes: [],
          timeline: [{ at, text: source === "website" ? "Received from the website" : `Received via ${source}` }],
        };
        set((s) => ({ inquiries: [inquiry, ...s.inquiries] }));
        return inquiry;
      },

      updateInquiry: (id, patch) =>
        set((s) => ({ inquiries: s.inquiries.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),

      setInquiryStatus: (id, status) =>
        set((s) => ({
          inquiries: s.inquiries.map((i) =>
            i.id === id && i.status !== status ? { ...i, status, timeline: [...i.timeline, { at: now(), text: STATUS_TEXT[status] }] } : i,
          ),
        })),

      addInquiryNote: (id, text) =>
        set((s) => ({ inquiries: s.inquiries.map((i) => (i.id === id ? { ...i, notes: [...i.notes, { at: now(), text }] } : i)) })),

      addGuestNote: (email, text) =>
        set((s) => {
          const key = email.toLowerCase();
          return { guestNotes: { ...s.guestNotes, [key]: [...(s.guestNotes[key] ?? []), { at: now(), text }] } };
        }),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      addSubscriber: (input) => {
        const existing = get().subscribers.find((x) => x.email.toLowerCase() === input.email.toLowerCase());
        if (existing) return existing;
        const sub: Subscriber = { id: uid("sub"), email: input.email.trim(), name: input.name?.trim() || undefined, page: input.page, createdAt: now(), code: PROMO_CODE };
        set((s) => ({ subscribers: [sub, ...s.subscribers] }));
        return sub;
      },

      signIn: (email, password) => {
        const ok = email.trim().toLowerCase() === DEMO_LOGIN.email && password === DEMO_LOGIN.password;
        if (ok) set({ officeUser: email.trim().toLowerCase() });
        return ok;
      },
      signOut: () => set({ officeUser: null }),

      resetDemo: () => set({ ...seedState(), officeUser: get().officeUser, officeProperty: get().officeProperty }),
    }),
    {
      name: "maison-vidy-demo",
      version: SEED_VERSION,
      migrate: () => seedState() as unknown as HotelState,
      partialize: (s) => ({
        version: s.version,
        properties: s.properties,
        rooms: s.rooms,
        reservations: s.reservations,
        inquiries: s.inquiries,
        extras: s.extras,
        ratePlans: s.ratePlans,
        seasons: s.seasons,
        settings: s.settings,
        subscribers: s.subscribers,
        guestNotes: s.guestNotes,
        officeUser: s.officeUser,
        officeProperty: s.officeProperty,
        lastBookingRef: s.lastBookingRef,
      }),
    },
  ),
);

/** True once the persisted store has been read on the client. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useHotel.persist.onFinishHydration(() => setHydrated(true));
    if (useHotel.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}

/** The public site is one property's site: its units, nothing else. */
export function useSiteRooms(): Room[] {
  return useHotel((s) => s.rooms).filter((r) => r.propertyId === SITE_PROPERTY);
}

/** What the office is looking at: every property, or one. */
export function useOfficeScope() {
  const properties = useHotel((s) => s.properties);
  const officeProperty = useHotel((s) => s.officeProperty);
  const rooms = useHotel((s) => s.rooms);
  const reservations = useHotel((s) => s.reservations);
  const inquiries = useHotel((s) => s.inquiries);
  const all = officeProperty === "all" || !properties.some((p) => p.id === officeProperty);
  const scoped = all ? properties : properties.filter((p) => p.id === officeProperty);
  const ids = new Set(scoped.map((p) => p.id));
  return {
    all,
    property: all ? null : scoped[0],
    properties: scoped,
    allProperties: properties,
    rooms: rooms.filter((r) => ids.has(r.propertyId)),
    reservations: reservations.filter((r) => ids.has(r.propertyId)),
    inquiries: inquiries.filter((i) => !i.propertyId || ids.has(i.propertyId)),
    allRooms: rooms,
  };
}
