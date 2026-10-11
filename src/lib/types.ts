export type ViewType = "Lake" | "Garden" | "Courtyard" | "Forest";
export type RoomStatus = "active" | "out_of_order";
/** A bookable unit: a hotel room, a cabin, or a "whole" parent that books all its children at once. */
export type UnitKind = "room" | "cabin" | "whole";
export type Housekeeping = "clean" | "dirty" | "inspected";

export interface Room {
  id: string;
  propertyId: string;
  kind: UnitKind;
  /** For a child unit: the "whole" unit that books it along with its siblings. */
  parentId?: string;
  number: number;
  slug: string;
  name: string;
  category: string;
  floor: number;
  sizeM2: number;
  beds: string;
  maxAdults: number;
  maxGuests: number;
  view: ViewType;
  basePrice: number; // property currency per night, mid season, unit only
  summary: string;
  description: string;
  features: string[];
  images: string[];
  status: RoomStatus;
  statusNote?: string;
  housekeeping: Housekeeping;
}

export type RatePlanId = "room_only" | "bed_breakfast" | "non_refundable";

export interface RatePlan {
  id: RatePlanId;
  name: string;
  short: string;
  description: string;
  cancellation: string;
  includesBreakfast: boolean;
  discount: number; // 0.1 = -10 %
}

export interface Season {
  id: string;
  name: string;
  from: string; // MM-DD
  to: string; // MM-DD
  multiplier: number;
}

export type ExtraUnit = "per_stay" | "per_night" | "per_person_night" | "per_person" | "per_ride";

export interface Extra {
  id: string;
  name: string;
  short: string;
  price: number;
  unit: ExtraUnit;
  icon: string;
  active: boolean;
  requestOnly?: boolean;
}

export type ReservationStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";
export type ReservationSource = "direct" | "booking.com" | "expedia" | "airbnb" | "phone" | "walk-in" | "email";
/** stay = one unit · whole = a parent unit for a group · retreat = a group hold with a deposit · venue = the place hired by an outside host */
export type ReservationType = "stay" | "whole" | "retreat" | "venue";

export interface Guest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
}

export interface Reservation {
  id: string;
  ref: string;
  propertyId: string;
  roomId: string;
  type: ReservationType;
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  adults: number;
  children: number;
  /** Group size for whole / retreat / venue bookings. */
  headcount?: number;
  /** A hold keeps the dates until this day; after it, the hold lapses unless confirmed. */
  holdUntil?: string;
  deposit?: number;
  guest: Guest;
  ratePlan: RatePlanId;
  extras: string[];
  notes?: string;
  arrivalTime?: string;
  status: ReservationStatus;
  source: ReservationSource;
  total: number;
  cityTax: number;
  promo?: string;
  discount?: number;
  paid: boolean;
  createdAt: string; // ISO
  timeline: { at: string; text: string }[];
}

export type InquiryType = "contact" | "concierge" | "group" | "retreat" | "venue" | "whole" | "long_stay";
/** The request pipeline: new → replied → offer (sent) → won | lost. */
export type InquiryStatus = "new" | "replied" | "offer" | "won" | "lost";
export type InquirySource = "website" | "whatsapp" | "email" | "phone" | "instagram" | "ota";

export interface Inquiry {
  id: string;
  type: InquiryType;
  source: InquirySource;
  propertyId?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  dates?: string;
  headcount?: number;
  createdAt: string;
  status: InquiryStatus;
  reply?: string;
  nextAction?: { label: string; due: string };
  notes: { at: string; text: string }[];
  timeline: { at: string; text: string }[];
  /** Set when the request became a reservation. */
  reservationId?: string;
}

export type SeasonMode = "auto" | "winter" | "summer";

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  page: string;
  createdAt: string;
  code: string;
}

export type TaxKind = "per_person_night" | "per_night" | "percent";
export interface Tax {
  id: string;
  name: string;
  kind: TaxKind;
  amount: number; // currency units, or percent when kind = percent
}

export interface Channel {
  id: string;
  name: string;
  connected: boolean;
  lastSync?: string; // ISO
  error?: string;
  /** Bookings received through this channel in the demo window. */
  note?: string;
}

/** One location. The office shell is driven by these records; the brand owns several. */
export interface Property {
  id: string;
  slug: string;
  name: string;
  short: string;
  kind: string; // "Hotel" · "Tree-house cabins"
  tagline: string;
  address: string;
  city: string;
  country: string;
  currency: string; // ISO 4217
  locale: string;
  unitLabel: { one: string; many: string };
  taxes: Tax[];
  checkIn: string;
  checkOut: string;
  channels: Channel[];
  paymentMethods: string[];
  refPrefix: string; // MV · LC
  accent: string; // CSS colour for chips
  image?: string;
  website?: string;
}

export interface HotelSettings {
  seasonOverride: SeasonMode;
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string; // digits only
  email: string;
  checkIn: string;
  checkOut: string;
  cityTax: number; // CHF per person per night
  breakfastPrice: number;
  languages: string[];
  channels: { name: string; connected: boolean }[];
  receptionHours: string;
}

export interface Quote {
  nights: number;
  nightly: { date: string; price: number }[];
  roomTotal: number;
  breakfastTotal: number;
  extrasTotal: number;
  cityTax: number;
  total: number;
}
