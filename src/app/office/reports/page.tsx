"use client";

import { clsx } from "clsx";
import { Download, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { OfficeShell } from "@/components/office/shell";
import { Panel, PropertyChip, SourceChip, StatusChip, td, th } from "@/components/office/ui";
import { Button, Input } from "@/components/ui";
import { addDays, nightsBetween, occupancyOn, sellableUnits, todayISO } from "@/lib/engine";
import { SOURCE_LABEL, fmtDate, money, monthLabel, plural } from "@/lib/format";
import { useOfficeScope } from "@/lib/store";
import type { Reservation } from "@/lib/types";

type ReportId = "daily" | "sources" | "monthly" | "taxes" | "sheet";
const REPORTS: { id: ReportId; label: string; hint: string }[] = [
  { id: "daily", label: "Occupancy & revenue by day", hint: "Every night in the range: units sold, occupancy, room revenue" },
  { id: "sources", label: "Bookings by source", hint: "Direct vs each OTA, with the commission it costs" },
  { id: "monthly", label: "ADR · RevPAR by month", hint: "The two numbers an owner asks for" },
  { id: "taxes", label: "Taxes to remit", hint: "City tax collected per person-night, by month" },
  { id: "sheet", label: "Arrivals & departures sheet", hint: "Printable for the desk, one day" },
];

const COMMISSION: Record<string, number> = { "booking.com": 0.15, expedia: 0.18, airbnb: 0.03 };

function csv(rows: (string | number)[][], name: string) {
  const text = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  a.download = `${name}.csv`;
  a.click();
}

export default function ReportsPage() {
  const scope = useOfficeScope();
  const today = todayISO();
  const [report, setReport] = useState<ReportId>("daily");
  const [from, setFrom] = useState(addDays(today, -13));
  const [to, setTo] = useState(addDays(today, 16));
  const [day, setDay] = useState(today);

  const currency = scope.properties.every((p) => p.currency === scope.properties[0].currency) ? scope.properties[0].currency : "CHF";
  const live = useMemo(() => scope.reservations.filter((r) => r.status !== "cancelled"), [scope.reservations]);
  const units = sellableUnits(scope.rooms).filter((r) => r.status === "active").length || 1;
  const roomName = (id: string) => scope.allRooms.find((r) => r.id === id)?.name ?? id;
  const perNight = (r: Reservation) => (r.total - r.cityTax) / Math.max(1, nightsBetween(r.checkIn, r.checkOut));

  const days = useMemo(() => {
    const out: string[] = [];
    for (let d = from; d <= to && out.length < 120; d = addDays(d, 1)) out.push(d);
    return out;
  }, [from, to]);

  /* ---- daily ---- */
  const daily = useMemo(() => days.map((d) => {
    const staying = live.filter((r) => r.checkIn <= d && r.checkOut > d);
    return { date: d, sold: staying.length, occ: occupancyOn(d, scope.rooms, live), revenue: staying.reduce((s, r) => s + perNight(r), 0), arrivals: live.filter((r) => r.checkIn === d).length, departures: live.filter((r) => r.checkOut === d).length };
  }), [days, live, scope.rooms]);

  /* ---- sources ---- */
  const inRange = useMemo(() => live.filter((r) => r.checkIn >= from && r.checkIn <= to), [live, from, to]);
  const sources = useMemo(() => {
    const m = new Map<string, { count: number; nights: number; value: number }>();
    for (const r of inRange) {
      const x = m.get(r.source) ?? { count: 0, nights: 0, value: 0 };
      x.count++; x.nights += nightsBetween(r.checkIn, r.checkOut); x.value += r.total - r.cityTax;
      m.set(r.source, x);
    }
    return [...m.entries()].map(([source, x]) => ({ source, ...x, commission: x.value * (COMMISSION[source] ?? 0) })).sort((a, b) => b.value - a.value);
  }, [inRange]);

  /* ---- monthly ---- */
  const monthly = useMemo(() => {
    const months = new Set(live.map((r) => r.checkIn.slice(0, 7)));
    return [...months].sort().filter((m) => m >= addDays(today, -120).slice(0, 7) && m <= addDays(today, 90).slice(0, 7)).map((m) => {
      const res = live.filter((r) => r.checkIn.slice(0, 7) === m);
      const revenue = res.reduce((s, r) => s + r.total - r.cityTax, 0);
      const roomNights = res.reduce((s, r) => s + nightsBetween(r.checkIn, r.checkOut), 0);
      const dim = new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)), 0).getDate();
      const occ = Array.from({ length: dim }, (_, i) => `${m}-${String(i + 1).padStart(2, "0")}`).reduce((s, d) => s + occupancyOn(d, scope.rooms, live), 0) / dim;
      return { month: m, bookings: res.length, roomNights, revenue, adr: roomNights ? revenue / roomNights : 0, revpar: revenue / (units * dim), occ, direct: res.length ? res.filter((r) => r.source === "direct").length / res.length : 0 };
    });
  }, [live, scope.rooms, units, today]);

  /* ---- taxes ---- */
  const taxes = useMemo(() => {
    const m = new Map<string, { personNights: number; tax: number; bookings: number }>();
    for (const r of live) {
      const key = `${r.propertyId}|${r.checkIn.slice(0, 7)}`;
      const x = m.get(key) ?? { personNights: 0, tax: 0, bookings: 0 };
      x.personNights += (r.headcount ?? r.adults) * nightsBetween(r.checkIn, r.checkOut); x.tax += r.cityTax; x.bookings++;
      m.set(key, x);
    }
    return [...m.entries()].map(([k, x]) => ({ propertyId: k.split("|")[0], month: k.split("|")[1], ...x })).filter((x) => x.month >= addDays(today, -120).slice(0, 7) && x.month <= today.slice(0, 7)).sort((a, b) => (a.month < b.month ? 1 : a.month > b.month ? -1 : a.propertyId.localeCompare(b.propertyId)));
  }, [live, today]);

  /* ---- sheet ---- */
  const arrivals = live.filter((r) => r.checkIn === day).sort((a, b) => (a.arrivalTime ?? "").localeCompare(b.arrivalTime ?? ""));
  const departures = live.filter((r) => r.checkOut === day).sort((a, b) => roomName(a.roomId).localeCompare(roomName(b.roomId)));
  const stayovers = live.filter((r) => r.checkIn < day && r.checkOut > day);

  const current = REPORTS.find((r) => r.id === report)!;
  const rangeUi = report !== "sheet" && report !== "monthly" && report !== "taxes";

  const exportCsv = () => {
    if (report === "daily") csv([["date", "units sold", "occupancy %", "room revenue", "arrivals", "departures"], ...daily.map((d) => [d.date, d.sold, Math.round(d.occ * 100), d.revenue.toFixed(2), d.arrivals, d.departures])], `occupancy-${from}-${to}`);
    if (report === "sources") csv([["source", "bookings", "room nights", "room revenue", "commission"], ...sources.map((s) => [SOURCE_LABEL[s.source] ?? s.source, s.count, s.nights, s.value.toFixed(2), s.commission.toFixed(2)])], `sources-${from}-${to}`);
    if (report === "monthly") csv([["month", "bookings", "room nights", "room revenue", "ADR", "RevPAR", "occupancy %", "direct %"], ...monthly.map((m) => [m.month, m.bookings, m.roomNights, m.revenue.toFixed(2), m.adr.toFixed(2), m.revpar.toFixed(2), Math.round(m.occ * 100), Math.round(m.direct * 100)])], "monthly");
    if (report === "taxes") csv([["property", "month", "bookings", "person-nights", "tax collected"], ...taxes.map((t) => [scope.allProperties.find((p) => p.id === t.propertyId)?.name ?? t.propertyId, t.month, t.bookings, t.personNights, t.tax.toFixed(2)])], "taxes");
    if (report === "sheet") csv([["kind", "guest", "unit", "check-in", "check-out", "guests", "arrives", "paid", "notes"], ...arrivals.map((r) => ["arrival", `${r.guest.firstName} ${r.guest.lastName}`, roomName(r.roomId), r.checkIn, r.checkOut, r.headcount ?? r.adults + r.children, r.arrivalTime ?? "", r.paid ? "yes" : "no", r.notes ?? ""]), ...departures.map((r) => ["departure", `${r.guest.firstName} ${r.guest.lastName}`, roomName(r.roomId), r.checkIn, r.checkOut, r.headcount ?? r.adults + r.children, "", r.paid ? "yes" : "no", r.notes ?? ""])], `desk-${day}`);
  };

  return (
    <OfficeShell title="Reports" subtitle={scope.all && scope.allProperties.length > 1 ? "All locations" : scope.properties[0]?.name}>
      <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
        <Panel>
          <ul className="divide-y divide-ink/5">
            {REPORTS.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => setReport(r.id)} className={clsx("w-full px-4 py-3 text-left transition", report === r.id ? "bg-mist/70" : "hover:bg-[#fafbfc]")}>
                  <p className={clsx("text-sm", report === r.id ? "font-semibold text-ink" : "font-medium text-ink-soft")}>{r.label}</p>
                  <p className="text-xs text-slate">{r.hint}</p>
                </button>
              </li>
            ))}
          </ul>
          <p className="border-t border-ink/5 px-4 py-3 text-xs text-slate">Five reports, each exportable. Room revenue excludes taxes; totals in {currency}.</p>
        </Panel>

        <Panel
          title={current.label}
          action={
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              {rangeUi && <><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="!h-8 !w-36 text-xs" /><span className="text-xs text-slate">→</span><Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="!h-8 !w-36 text-xs" /></>}
              {report === "sheet" && <Input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="!h-8 !w-36 text-xs" />}
              {report === "sheet" && <Button size="sm" variant="secondary" onClick={() => window.print()}><Printer className="mr-1.5 h-3.5 w-3.5" /> Print</Button>}
              <Button size="sm" variant="secondary" onClick={exportCsv}><Download className="mr-1.5 h-3.5 w-3.5" /> CSV</Button>
            </div>
          }
        >
          {report === "daily" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-[#fafbfc]"><tr><th className={th}>Night</th><th className={th}>Units sold</th><th className={th}>Occupancy</th><th className={`${th} text-right`}>Room revenue</th><th className={th}>Arr · dep</th></tr></thead>
                <tbody className="divide-y divide-ink/5">
                  {daily.map((d) => (
                    <tr key={d.date} className={d.date === today ? "bg-mist/40" : ""}>
                      <td className={td}>{fmtDate(d.date, "weekday")}</td>
                      <td className={`${td} tabular-nums`}>{d.sold} / {units}</td>
                      <td className={td}><span className="inline-flex items-center gap-2"><span className="h-1.5 w-24 overflow-hidden rounded-xs bg-ink/5"><span className="block h-full bg-lake" style={{ width: `${Math.round(d.occ * 100)}%` }} /></span><span className="tabular-nums text-xs">{Math.round(d.occ * 100)} %</span></span></td>
                      <td className={`${td} text-right tabular-nums`}>{money(d.revenue, currency)}</td>
                      <td className={`${td} tabular-nums text-slate`}>{d.arrivals} · {d.departures}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-ink/10 bg-[#fafbfc] text-sm font-semibold"><tr><td className={td}>{plural(daily.length, "night")}</td><td className={`${td} tabular-nums`}>{daily.reduce((s, d) => s + d.sold, 0)} room nights</td><td className={td}>{Math.round((daily.reduce((s, d) => s + d.occ, 0) / Math.max(1, daily.length)) * 100)} % avg</td><td className={`${td} text-right tabular-nums`}>{money(daily.reduce((s, d) => s + d.revenue, 0), currency)}</td><td className={td} /></tr></tfoot>
              </table>
            </div>
          )}

          {report === "sources" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-[#fafbfc]"><tr><th className={th}>Source</th><th className={th}>Bookings</th><th className={th}>Room nights</th><th className={`${th} text-right`}>Room revenue</th><th className={`${th} text-right`}>Commission</th><th className={`${th} text-right`}>Net</th></tr></thead>
                <tbody className="divide-y divide-ink/5">
                  {sources.map((s) => (
                    <tr key={s.source}>
                      <td className={td}><SourceChip source={s.source} /></td>
                      <td className={`${td} tabular-nums`}>{s.count} <span className="text-xs text-slate">· {inRange.length ? Math.round((s.count / inRange.length) * 100) : 0} %</span></td>
                      <td className={`${td} tabular-nums`}>{s.nights}</td>
                      <td className={`${td} text-right tabular-nums`}>{money(s.value, currency)}</td>
                      <td className={`${td} text-right tabular-nums`}>{s.commission ? <span className="text-clay">− {money(s.commission, currency)}</span> : <span className="text-moss">none</span>}</td>
                      <td className={`${td} text-right tabular-nums font-semibold`}>{money(s.value - s.commission, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-ink/5 px-4 py-3 text-xs text-slate">Arrivals {fmtDate(from, "short")} – {fmtDate(to, "medium")}. Commission at the usual rates (Booking.com 15 %, Expedia 18 %, Airbnb 3 % host fee); every point moved to direct is money kept.</p>
            </div>
          )}

          {report === "monthly" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-[#fafbfc]"><tr><th className={th}>Month</th><th className={th}>Bookings</th><th className={th}>Room nights</th><th className={th}>Occupancy</th><th className={`${th} text-right`}>Room revenue</th><th className={`${th} text-right`}>ADR</th><th className={`${th} text-right`}>RevPAR</th><th className={th}>Direct</th></tr></thead>
                <tbody className="divide-y divide-ink/5">
                  {monthly.map((m) => (
                    <tr key={m.month} className={m.month === today.slice(0, 7) ? "bg-mist/40" : ""}>
                      <td className={`${td} font-semibold`}>{monthLabel(`${m.month}-01`)}{m.month > today.slice(0, 7) && <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-slate">on the books</span>}</td>
                      <td className={`${td} tabular-nums`}>{m.bookings}</td>
                      <td className={`${td} tabular-nums`}>{m.roomNights}</td>
                      <td className={`${td} tabular-nums`}>{Math.round(m.occ * 100)} %</td>
                      <td className={`${td} text-right tabular-nums`}>{money(m.revenue, currency)}</td>
                      <td className={`${td} text-right tabular-nums`}>{money(m.adr, currency)}</td>
                      <td className={`${td} text-right tabular-nums`}>{money(m.revpar, currency)}</td>
                      <td className={`${td} tabular-nums`}>{Math.round(m.direct * 100)} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-ink/5 px-4 py-3 text-xs text-slate">ADR = room revenue ÷ room nights sold. RevPAR = room revenue ÷ (units × nights in the month). Months ahead show what is already booked.</p>
            </div>
          )}

          {report === "taxes" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-[#fafbfc]"><tr><th className={th}>Month</th>{scope.allProperties.length > 1 && <th className={th}>Property</th>}<th className={th}>Bookings</th><th className={th}>Person-nights</th><th className={`${th} text-right`}>Tax collected</th><th className={th}>Rule</th></tr></thead>
                <tbody className="divide-y divide-ink/5">
                  {taxes.map((t) => {
                    const p = scope.allProperties.find((x) => x.id === t.propertyId)!;
                    const rule = p.taxes[0];
                    return (
                      <tr key={`${t.propertyId}-${t.month}`}>
                        <td className={`${td} font-semibold`}>{monthLabel(`${t.month}-01`)}</td>
                        {scope.allProperties.length > 1 && <td className={td}><PropertyChip id={t.propertyId} /></td>}
                        <td className={`${td} tabular-nums`}>{t.bookings}</td>
                        <td className={`${td} tabular-nums`}>{t.personNights}</td>
                        <td className={`${td} text-right tabular-nums font-semibold`}>{money(t.tax, p.currency, { decimals: true })}</td>
                        <td className={`${td} text-xs text-slate`}>{rule ? `${rule.name} · ${rule.kind === "per_person_night" ? `${money(rule.amount, p.currency, { decimals: true })} per person-night` : rule.kind === "percent" ? `${rule.amount} % of the room` : `${money(rule.amount, p.currency)} per night`}` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="border-t border-ink/5 px-4 py-3 text-xs text-slate">What was collected on stays that began in the month, per property's own rule — a fixed amount per person-night here, a percentage lodging tax elsewhere. The rules live in Settings.</p>
            </div>
          )}

          {report === "sheet" && (
            <div className="px-5 py-5 print:px-0">
              <p className="font-display text-xl font-semibold text-ink">{fmtDate(day, "long")}</p>
              <p className="text-sm text-slate">{plural(arrivals.length, "arrival")} · {plural(departures.length, "departure")} · {stayovers.length} staying over</p>
              {(["Arrivals", "Departures"] as const).map((kind) => {
                const rows = kind === "Arrivals" ? arrivals : departures;
                return (
                  <div key={kind} className="mt-6">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">{kind}</h3>
                    <table className="mt-2 w-full">
                      <thead><tr><th className={th}>Guest</th><th className={th}>Unit</th><th className={th}>{kind === "Arrivals" ? "Arrives" : "Nights"}</th><th className={th}>Guests</th><th className={th}>Status</th><th className={th}>Paid</th><th className={th}>Notes</th></tr></thead>
                      <tbody className="divide-y divide-ink/5">
                        {rows.map((r) => (
                          <tr key={r.id}>
                            <td className={`${td} font-semibold`}>{r.guest.firstName} {r.guest.lastName}{scope.allProperties.length > 1 && <PropertyChip id={r.propertyId} size="xs" className="ml-2 align-middle print:hidden" />}</td>
                            <td className={td}>{roomName(r.roomId)}</td>
                            <td className={td}>{kind === "Arrivals" ? r.arrivalTime || "—" : nightsBetween(r.checkIn, r.checkOut)}</td>
                            <td className={`${td} tabular-nums`}>{r.headcount ?? r.adults + r.children}</td>
                            <td className={td}><StatusChip status={r.status} /></td>
                            <td className={td}>{r.paid ? <span className="text-moss">paid</span> : <span className="font-semibold text-clay">open</span>}</td>
                            <td className={`${td} max-w-xs text-xs text-slate`}>{r.notes}</td>
                          </tr>
                        ))}
                        {rows.length === 0 && <tr><td colSpan={7} className={`${td} text-center text-slate`}>None.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </OfficeShell>
  );
}
