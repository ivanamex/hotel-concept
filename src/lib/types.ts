export type ViewType = "Lake" | "Garden" | "Courtyard";
export type RoomStatus = "active" | "out_of_order";

export interface Room {
  id: string;
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
  basePrice: number; // CHF per night, mid season, room only
  summary: string;
  description: string;
  features: string[];
  images: string[];
  status: RoomStatus;
  statusNote?: string;
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
export type ReservationSource = "direct" | "booking.com" | "expedia" | "phone" | "walk-in" | "email";

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
  roomId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  adults: number;
  children: number;
  guest: Guest;
  ratePlan: RatePlanId;
  extras: string[];
  notes?: string;
  arrivalTime?: string;
  status: ReservationStatus;
  source: ReservationSource;
  total: number;
  cityTax: number;
  paid: boolean;
  createdAt: string; // ISO
  timeline: { at: string; text: string }[];
}

export type InquiryType = "contact" | "concierge" | "group";
export type InquiryStatus = "new" | "replied" | "closed";

export interface Inquiry {
  id: string;
  type: InquiryType;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  dates?: string;
  createdAt: string;
  status: InquiryStatus;
  reply?: string;
}

export interface HotelSettings {
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
