import { Bike, Car, Clock, ConciergeBell, Flower2, ParkingSquare, Ship, TrainFront, Wine, type LucideIcon } from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  car: Car,
  train: TrainFront,
  parking: ParkingSquare,
  bike: Bike,
  ship: Ship,
  wine: Wine,
  clock: Clock,
  flower: Flower2,
  concierge: ConciergeBell,
};

export function ExtraIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const Icon = MAP[name] ?? ConciergeBell;
  return <Icon className={className} />;
}

export const UNIT_LABEL: Record<string, string> = {
  per_stay: "per stay",
  per_night: "per night",
  per_person: "per person",
  per_person_night: "per person per night",
  per_ride: "per ride",
};
