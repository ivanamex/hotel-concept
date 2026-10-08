"use client";

import { clsx } from "clsx";
import { useMemo, useState } from "react";
import { fmt } from "@/i18n";
import { useT } from "@/i18n/context";
import type { Room, ViewType } from "@/lib/types";
import { RoomCard } from "./room-card";

const GUESTS = [1, 2, 3, 4];
const VIEWS: ViewType[] = ["Lake", "Garden", "Courtyard"];

export function RoomsList({ rooms }: { rooms: Room[] }) {
  const t = useT();
  const [guests, setGuests] = useState<number | null>(null);
  const [view, setView] = useState<ViewType | null>(null);

  const list = useMemo(
    () =>
      rooms
        .filter((r) => (guests ? r.maxGuests >= guests : true))
        .filter((r) => (view ? r.view === view : true))
        .sort((a, b) => a.basePrice - b.basePrice),
    [rooms, guests, view],
  );

  const chip = (active: boolean) =>
    clsx(
      "caps rounded-xs px-3.5 py-2 !text-[10px] transition ring-1 ring-inset",
      active ? "bg-ink text-white ring-ink" : "bg-white text-ink-soft ring-line hover:ring-ink/40",
    );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex items-center gap-2">
          <span className="caps mr-1 !text-[10px] text-slate">{t.rooms.filterGuests}</span>
          {GUESTS.map((g) => (
            <button key={g} type="button" className={chip(guests === g)} onClick={() => setGuests(guests === g ? null : g)}>
              {g}{g === 4 ? "+" : ""}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="caps mr-1 !text-[10px] text-slate">{t.rooms.filterView}</span>
          {VIEWS.map((v) => (
            <button key={v} type="button" className={chip(view === v)} onClick={() => setView(view === v ? null : v)}>
              {t.common.views[v]}
            </button>
          ))}
        </div>
        <span className="text-sm text-slate">{fmt(t.rooms.count, { n: list.length, total: rooms.length })}</span>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((room, i) => (
          <RoomCard key={room.id} room={room} priority={i < 3} />
        ))}
      </div>
      {list.length === 0 && (
        <p className="mt-10 rounded-md bg-white p-8 text-center text-slate">{t.rooms.none}</p>
      )}
    </div>
  );
}
