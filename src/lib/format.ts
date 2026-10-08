import { parseISODate } from "./engine";

export function chf(n: number, opts: { decimals?: boolean } = {}): string {
  const v = opts.decimals ? n.toFixed(2) : Math.round(n).toString();
  const [int, dec] = v.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "’");
  return `CHF ${grouped}${dec ? "." + dec : ""}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function fmtDate(iso: string, style: "short" | "medium" | "long" | "weekday" = "medium"): string {
  if (!iso) return "";
  const d = parseISODate(iso.slice(0, 10));
  const day = d.getDate();
  const m = d.getMonth();
  switch (style) {
    case "short":
      return `${day} ${MONTHS[m]}`;
    case "medium":
      return `${day} ${MONTHS[m]} ${d.getFullYear()}`;
    case "long":
      return `${DAYS_LONG[d.getDay()]} ${day} ${MONTHS_LONG[m]} ${d.getFullYear()}`;
    case "weekday":
      return `${DAYS[d.getDay()]} ${day} ${MONTHS[m]}`;
  }
}

export function fmtRange(checkIn: string, checkOut: string): string {
  const a = parseISODate(checkIn);
  const b = parseISODate(checkOut);
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()}–${b.getDate()} ${MONTHS[a.getMonth()]} ${a.getFullYear()}`;
  }
  return `${fmtDate(checkIn, "short")} – ${fmtDate(checkOut, "short")} ${b.getFullYear()}`;
}

export function fmtDateTime(iso: string): string {
  const [date, time] = iso.split("T");
  return `${fmtDate(date, "medium")}${time ? ", " + time.slice(0, 5) : ""}`;
}

export function monthLabel(iso: string): string {
  const d = parseISODate(iso);
  return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function dayShort(iso: string): { dow: string; day: number } {
  const d = parseISODate(iso);
  return { dow: DAYS[d.getDay()], day: d.getDate() };
}

export function plural(n: number, one: string, many = one + "s"): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function guestsLabel(adults: number, children: number): string {
  const parts = [plural(adults, "adult")];
  if (children) parts.push(plural(children, "child", "children"));
  return parts.join(", ");
}

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "In house",
  checked_out: "Checked out",
  cancelled: "Cancelled",
};

export const SOURCE_LABEL: Record<string, string> = {
  direct: "Direct",
  "booking.com": "Booking.com",
  expedia: "Expedia",
  phone: "Phone",
  "walk-in": "Walk-in",
  email: "Email",
};
