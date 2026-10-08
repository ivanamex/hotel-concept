"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";
import { nextReference, uid } from "./engine";
import { EXTRAS, HOTEL, INQUIRIES, RATE_PLANS, ROOMS, SEASONS, buildDemoReservations } from "./seed";
import type {
  Extra,
  HotelSettings,
  Inquiry,
  InquiryStatus,
  RatePlan,
  Reservation,
  ReservationStatus,
  Room,
  Season,
  Subscriber,
} from "./types";

export interface HotelState {
  version: number;
  rooms: Room[];
  reservations: Reservation[];
  inquiries: Inquiry[];
  extras: Extra[];
  ratePlans: RatePlan[];
  seasons: Season[];
  settings: HotelSettings;
  subscribers: Subscriber[];
  officeUser: string | null;
  lastBookingRef: string | null;

  createReservation: (r: Omit<Reservation, "id" | "ref" | "createdAt" | "timeline">) => Reservation;
  updateReservation: (id: string, patch: Partial<Reservation>) => void;
  setReservationStatus: (id: string, status: ReservationStatus) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  updateExtra: (id: string, patch: Partial<Extra>) => void;
  updateRatePlan: (id: string, patch: Partial<RatePlan>) => void;
  updateSeason: (id: string, patch: Partial<Season>) => void;
  addInquiry: (i: Omit<Inquiry, "id" | "createdAt" | "status">) => Inquiry;
  updateInquiry: (id: string, patch: Partial<Inquiry> & { status?: InquiryStatus }) => void;
  updateSettings: (patch: Partial<HotelSettings>) => void;
  addSubscriber: (s: { email: string; name?: string; page: string }) => Subscriber;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
  resetDemo: () => void;
}

const SEED_VERSION = 6;
export const PROMO_CODE = "VIDY10";
export const PROMO_RATE = 0.1;

function seedState() {
  return {
    version: SEED_VERSION,
    rooms: ROOMS,
    reservations: buildDemoReservations(),
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
    officeUser: null as string | null,
    lastBookingRef: null as string | null,
  };
}

export const DEMO_LOGIN = { email: "manager@maisonvidy.ch", password: "vidy2026" };

export const useHotel = create<HotelState>()(
  persist(
    (set, get) => ({
      ...seedState(),

      createReservation: (input) => {
        const now = new Date().toISOString().slice(0, 19);
        const reservation: Reservation = {
          ...input,
          id: uid("res"),
          ref: nextReference(get().reservations),
          createdAt: now,
          timeline: [{ at: now, text: input.source === "direct" ? "Booked on the website" : `Booked via ${input.source}` }],
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
                      at: new Date().toISOString().slice(0, 19),
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

      updateRoom: (id, patch) => set((s) => ({ rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      updateExtra: (id, patch) => set((s) => ({ extras: s.extras.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      updateRatePlan: (id, patch) =>
        set((s) => ({ ratePlans: s.ratePlans.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      updateSeason: (id, patch) => set((s) => ({ seasons: s.seasons.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

      addInquiry: (input) => {
        const inquiry: Inquiry = {
          ...input,
          id: uid("inq"),
          createdAt: new Date().toISOString().slice(0, 19),
          status: "new",
        };
        set((s) => ({ inquiries: [inquiry, ...s.inquiries] }));
        return inquiry;
      },

      updateInquiry: (id, patch) =>
        set((s) => ({ inquiries: s.inquiries.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      addSubscriber: (input) => {
        const existing = get().subscribers.find((x) => x.email.toLowerCase() === input.email.toLowerCase());
        if (existing) return existing;
        const sub: Subscriber = { id: uid("sub"), email: input.email.trim(), name: input.name?.trim() || undefined, page: input.page, createdAt: new Date().toISOString().slice(0, 19), code: PROMO_CODE };
        set((s) => ({ subscribers: [sub, ...s.subscribers] }));
        return sub;
      },

      signIn: (email, password) => {
        const ok = email.trim().toLowerCase() === DEMO_LOGIN.email && password === DEMO_LOGIN.password;
        if (ok) set({ officeUser: email.trim().toLowerCase() });
        return ok;
      },
      signOut: () => set({ officeUser: null }),

      resetDemo: () => set({ ...seedState(), officeUser: get().officeUser }),
    }),
    {
      name: "maison-vidy-demo",
      version: SEED_VERSION,
      migrate: () => seedState() as unknown as HotelState,
      partialize: (s) => ({
        version: s.version,
        rooms: s.rooms,
        reservations: s.reservations,
        inquiries: s.inquiries,
        extras: s.extras,
        ratePlans: s.ratePlans,
        seasons: s.seasons,
        settings: s.settings,
        subscribers: s.subscribers,
        officeUser: s.officeUser,
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
