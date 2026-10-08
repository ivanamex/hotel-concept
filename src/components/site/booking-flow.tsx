"use client";

import { clsx } from "clsx";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Info, Lock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { defaultDates } from "@/components/site/booking-bar";
import { ExtraIcon } from "@/components/site/extra-icon";
import { Link } from "@/components/site/link";
import { PaymentMarks } from "@/components/site/payment-marks";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { fmt, fmtDateL, guestsLabelL, localizeExtra, localizeRatePlan, localizeRoom, nightsLabel, unitLabel, viewLabel } from "@/i18n";
import { useHref, useT } from "@/i18n/context";
import { OFFERS } from "@/lib/content";
import { addDays, extraCost, isRoomAvailable, nightsBetween, quote, roomFits, todayISO } from "@/lib/engine";
import { chf } from "@/lib/format";
import { PROMO_CODE, PROMO_RATE, useHotel, useHydrated } from "@/lib/store";
import type { Guest, RatePlanId, Room } from "@/lib/types";

export function BookingFlow() {
  const router = useRouter();
  const href = useHref();
  const t = useT();
  const b = t.book;
  const sp = useSearchParams();
  const hydrated = useHydrated();

  const rooms = useHotel((s) => s.rooms);
  const reservations = useHotel((s) => s.reservations);
  const ratePlans = useHotel((s) => s.ratePlans);
  const seasons = useHotel((s) => s.seasons);
  const extrasAll = useHotel((s) => s.extras);
  const settings = useHotel((s) => s.settings);
  const createReservation = useHotel((s) => s.createReservation);

  const dd = defaultDates();
  const [checkIn, setCheckIn] = useState(sp.get("in") || dd.checkIn);
  const [checkOut, setCheckOut] = useState(sp.get("out") || dd.checkOut);
  const [adults, setAdults] = useState(Number(sp.get("adults")) || 2);
  const [children, setChildren] = useState(Number(sp.get("children")) || 0);
  const preRoom = sp.get("room");
  const offer = OFFERS.find((o) => o.slug === sp.get("offer"));

  const [step, setStep] = useState(sp.get("in") ? 2 : 1);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [planId, setPlanId] = useState<RatePlanId>(offer?.ratePlan ?? "bed_breakfast");
  const [extras, setExtras] = useState<string[]>(offer?.extras ?? []);
  const [conciergeNote, setConciergeNote] = useState("");
  const [guest, setGuest] = useState<Guest>({ firstName: "", lastName: "", email: "", phone: "", country: t.book.s4.countries[0] });
  const [arrivalTime, setArrivalTime] = useState(t.book.s4.arrivalOptions[2]);
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"card" | "hotel">("card");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [promo, setPromo] = useState("");
  const promoOk = promo.trim().toUpperCase() === PROMO_CODE;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const nights = Math.max(0, nightsBetween(checkIn, checkOut));
  const dateError = nights < 1 ? b.s1.errOrder : nights > 21 ? b.s1.errLong : checkIn < todayISO() ? b.s1.errPast : "";

  const selectedRoomBase = rooms.find((r) => r.id === roomId) ?? null;
  const selectedRoom = selectedRoomBase ? localizeRoom(selectedRoomBase, t) : null;
  const plan = localizeRatePlan(ratePlans.find((p) => p.id === planId) ?? ratePlans[0], t);
  const selectedExtras = extrasAll.filter((e) => extras.includes(e.id)).map((e) => localizeExtra(e, t));
  const q = useMemo(() => {
    if (!selectedRoom || nights <= 0) return null;
    const base = quote({ room: selectedRoom, checkIn, checkOut, adults, children, plan, extras: selectedExtras.filter((e) => !e.requestOnly), seasons, breakfastPrice: settings.breakfastPrice, cityTaxPerPersonNight: settings.cityTax });
    if (!promoOk) return { ...base, discount: 0 };
    const discount = Math.round(base.roomTotal * PROMO_RATE);
    return { ...base, discount, total: base.total - discount };
  }, [selectedRoom, nights, checkIn, checkOut, adults, children, plan, selectedExtras, seasons, settings, promoOk]);

  const results = useMemo(() => {
    if (!hydrated || nights < 1) return { available: [] as Room[], unavailable: [] as Room[], tooSmall: [] as Room[] };
    const fit = rooms.filter((r) => roomFits(r, adults, children));
    const available = fit.filter((r) => isRoomAvailable(r, checkIn, checkOut, reservations)).sort((a, b) => a.basePrice - b.basePrice);
    const unavailable = fit.filter((r) => !available.includes(r));
    const tooSmall = rooms.filter((r) => !fit.includes(r));
    if (preRoom) {
      const idx = available.findIndex((r) => r.slug === preRoom);
      if (idx > 0) available.unshift(...available.splice(idx, 1));
    }
    return { available, unavailable, tooSmall };
  }, [hydrated, rooms, reservations, checkIn, checkOut, adults, children, nights, preRoom]);

  const goTop = () => document.getElementById("booking-top")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const goSearch = () => {
    if (dateError) return;
    setRoomId(null);
    setStep(2);
    goTop();
    const params = new URLSearchParams({ in: checkIn, out: checkOut, adults: String(adults), children: String(children) });
    router.replace(href(`/book?${params.toString()}`), { scroll: false });
  };

  const choose = (room: Room, pid: RatePlanId) => {
    setRoomId(room.id);
    setPlanId(pid);
    setStep(3);
    goTop();
  };

  const toggleExtra = (id: string) => setExtras((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!guest.firstName.trim()) e.firstName = t.common.required;
    if (!guest.lastName.trim()) e.lastName = t.common.required;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(guest.email)) e.email = t.common.validEmail;
    if (guest.phone.trim().length < 6) e.phone = b.s4.phoneErr;
    if (payment === "card") {
      if (card.number.replace(/\s/g, "").length < 12) e.cardNumber = b.s4.cardErrNumber;
      if (!card.name.trim()) e.cardName = b.s4.cardErrName;
      if (!/^\d{2}\s?\/\s?\d{2}$/.test(card.expiry)) e.cardExpiry = b.s4.cardErrExpiry;
      if (!/^\d{3,4}$/.test(card.cvc)) e.cardCvc = b.s4.cardErrCvc;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!selectedRoom || !q || !validate()) return;
    setSubmitting(true);
    const fullNotes = [notes.trim(), conciergeNote.trim() ? `${b.conciergeNote}${conciergeNote.trim()}` : "", payment === "hotel" ? b.payAtHotelNote : b.cardOnFileNote].filter(Boolean).join("\n");
    const r = createReservation({
      roomId: selectedRoom.id,
      checkIn,
      checkOut,
      adults,
      children,
      guest,
      ratePlan: planId,
      extras: selectedExtras.filter((e) => !e.requestOnly).map((e) => e.id),
      notes: fullNotes,
      arrivalTime,
      status: "confirmed",
      source: "direct",
      total: q.total,
      cityTax: q.cityTax,
      promo: promoOk ? PROMO_CODE : undefined,
      discount: promoOk ? q.discount : undefined,
      paid: planId === "non_refundable",
    });
    await new Promise((res) => setTimeout(res, 700));
    router.push(href(`/book/confirmed/${r.ref}`));
  };

  /* ---------- summary rail ---------- */
  const Summary = (
    <div className="rounded-lg bg-white p-5 shadow-card ring-1 ring-ink/5">
      <h2 className="font-display text-xl text-ink">{b.summary.title}</h2>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-3"><dt className="text-slate">{b.summary.dates}</dt><dd className="text-right font-medium text-ink">{fmtDateL(checkIn, t, "short")} → {fmtDateL(checkOut, t, "short")}{nights > 0 && <span className="block text-xs font-normal text-slate">{nightsLabel(nights, t)}</span>}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-slate">{b.summary.guests}</dt><dd className="font-medium text-ink">{guestsLabelL(adults, children, t)}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-slate">{b.summary.room}</dt><dd className="text-right font-medium text-ink">{selectedRoom ? selectedRoom.name : <span className="text-slate">—</span>}</dd></div>
        {selectedRoom && <div className="flex justify-between gap-3"><dt className="text-slate">{b.summary.rate}</dt><dd className="text-right font-medium text-ink">{plan.short}</dd></div>}
      </dl>
      {q && (
        <>
          <div className="my-4 border-t border-line" />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate">{fmt(b.summary.roomNights, { n: nightsLabel(q.nights, t) })}</dt><dd className="text-ink">{chf(q.roomTotal)}</dd></div>
            {q.breakfastTotal > 0 && <div className="flex justify-between"><dt className="text-slate">{b.summary.breakfast}</dt><dd className="text-ink">{chf(q.breakfastTotal)}</dd></div>}
            {selectedExtras.filter((e) => !e.requestOnly).map((e) => (
              <div key={e.id} className="flex justify-between"><dt className="text-slate">{e.short}</dt><dd className="text-ink">{chf(extraCost(e, { nights, adults, children }))}</dd></div>
            ))}
            {q.discount > 0 && <div className="flex justify-between"><dt className="text-moss">{fmt(b.summary.code, { code: PROMO_CODE })}</dt><dd className="text-moss">− {chf(q.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-slate">{b.summary.cityTax}</dt><dd className="text-ink">{chf(q.cityTax, { decimals: true })}</dd></div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="font-semibold text-ink">{b.summary.total}</span>
            <span className="font-display text-3xl text-ink">{chf(q.total, { decimals: true })}</span>
          </div>
          <p className="mt-2 text-xs text-slate">{plan.cancellation} {planId === "non_refundable" ? b.summary.chargedNow : b.summary.nothingToday}</p>
        </>
      )}
    </div>
  );

  return (
    <div id="booking-top" className="scroll-mt-24">
      {/* progress */}
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {b.steps.map((label, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "current" : "todo";
          return (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                disabled={state === "todo" || (n === 3 && !selectedRoom)}
                onClick={() => setStep(n)}
                className={clsx(
                  "caps inline-flex items-center gap-2 rounded-xs px-3 py-2 !text-[10px] transition",
                  state === "current" && "bg-ink text-white",
                  state === "done" && "bg-mist text-lake hover:bg-sky",
                  state === "todo" && "bg-white text-slate ring-1 ring-line",
                )}
              >
                <span className={clsx("flex h-5 w-5 items-center justify-center rounded-xs text-[10px] font-bold", state === "current" ? "bg-white/20" : state === "done" ? "bg-lake text-white" : "bg-sand")}>
                  {state === "done" ? <Check className="h-3 w-3" /> : n}
                </span>
                {label}
              </button>
              {i < b.steps.length - 1 && <span className="h-px w-4 bg-line" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-12">
        <div className="min-w-0">
          {/* STEP 1 */}
          {step === 1 && (
            <section className="form-lines">
              <h2 className="font-display text-3xl text-ink">{b.s1.title}</h2>
              <p className="mt-1 text-sm text-slate">{b.s1.lead} <Link href="/request" className="font-semibold text-lake">{b.s1.leadLink}</Link>.</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Field label={t.bookingBar.checkIn}><Input type="date" value={checkIn} min={todayISO()} onChange={(e) => { setCheckIn(e.target.value); if (e.target.value >= checkOut) setCheckOut(addDays(e.target.value, 1)); }} /></Field>
                <Field label={t.bookingBar.checkOut}><Input type="date" value={checkOut} min={addDays(checkIn, 1)} onChange={(e) => setCheckOut(e.target.value)} /></Field>
                <Field label={t.bookingBar.adults}><Select value={adults} onChange={(e) => setAdults(Number(e.target.value))}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</Select></Field>
                <Field label={t.bookingBar.children} hint={b.s1.under12}><Select value={children} onChange={(e) => setChildren(Number(e.target.value))}>{[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}</Select></Field>
              </div>
              {dateError && <p className="mt-3 text-sm text-[#b3261e]">{dateError}</p>}
              <div className="mt-8">
                <Button onClick={goSearch} disabled={!!dateError} arrow>{b.s1.cta}</Button>
              </div>
            </section>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <section>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl text-ink">{b.s2.title}</h2>
                  <p className="mt-1 text-sm text-slate">{fmtDateL(checkIn, t, "weekday")} → {fmtDateL(checkOut, t, "weekday")} · {nightsLabel(nights, t)} · {guestsLabelL(adults, children, t)}</p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-lake hover:text-lake-deep"><ArrowLeft className="h-4 w-4" /> {b.s2.changeDates}</button>
              </div>

              {!hydrated ? (
                <div className="mt-6 space-y-4">{[0, 1, 2].map((i) => <div key={i} className="h-48 animate-pulse rounded-lg bg-white" />)}</div>
              ) : results.available.length === 0 ? (
                <div className="mt-6 rounded-lg bg-white p-8 text-center ring-1 ring-ink/5">
                  <p className="font-display text-2xl text-ink">{b.s2.noneTitle}</p>
                  <p className="mt-2 text-slate">{b.s2.noneText}</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <Button variant="secondary" onClick={() => setStep(1)}>{b.s2.changeDates}</Button>
                    <Link href="/contact" className="ticket sweep caps inline-flex h-12 items-center rounded-xs bg-ink px-6 !text-[11px] text-white [--sweep:var(--color-lake)]">{b.s2.contact}</Link>
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {results.available.map((base) => {
                    const room = localizeRoom(base, t);
                    return (
                    <article key={room.id} className={clsx("lift-sm overflow-hidden rounded-lg bg-white shadow-card ring-1", room.slug === preRoom ? "ring-lake" : "ring-ink/5")}>
                      <div className="grid md:grid-cols-[260px_1fr]">
                        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[220px]">
                          <Image src={room.images[0]} alt={room.name} fill sizes="(min-width:768px) 260px, 100vw" className="object-cover" />
                          {room.slug === preRoom && <span className="caps absolute left-3 top-3 rounded-xs bg-lake px-2 py-1 !text-[10px] text-white">{b.s2.yourPick}</span>}
                        </div>
                        <div className="p-5 sm:p-6">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="caps !text-[10px] text-slate">{room.category} · {viewLabel(room.view, t)} · {room.sizeM2} m²</p>
                              <h3 className="mt-1 font-display text-2xl text-ink">{room.name}</h3>
                              <p className="mt-1 text-sm text-slate">{room.beds} · {fmt(b.s2.upToGuests, { n: room.maxGuests })}</p>
                            </div>
                            <a href={href(`/rooms/${room.slug}`)} target="_blank" rel="noopener" className="text-sm font-semibold text-lake hover:text-lake-deep">{b.s2.details} ↗</a>
                          </div>
                          <ul className="mt-4 divide-y divide-line rounded-md border border-line">
                            {ratePlans.map((pb) => {
                              const p = localizeRatePlan(pb, t);
                              const pq = quote({ room: base, checkIn, checkOut, adults, children, plan: pb, extras: [], seasons, breakfastPrice: settings.breakfastPrice, cityTaxPerPersonNight: settings.cityTax });
                              const perNight = Math.round((pq.roomTotal + pq.breakfastTotal) / nights);
                              return (
                                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors duration-300 hover:bg-mist/60">
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-ink">{p.name}</p>
                                    <p className="text-xs text-slate">{p.cancellation}{p.includesBreakfast ? ` ${b.s2.breakfastIncluded}` : ""}</p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <p className="font-display text-xl text-ink">{chf(pq.roomTotal + pq.breakfastTotal)}</p>
                                      <p className="text-xs text-slate">{fmt(b.s2.perNightExcl, { p: chf(perNight) })}</p>
                                    </div>
                                    <button type="button" onClick={() => choose(base, p.id)} className="ticket sweep caps rounded-xs bg-lake px-4 py-2.5 !text-[10px] text-white [--sweep:var(--color-lake-deep)]">{b.s2.select}</button>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </article>
                    );
                  })}
                </div>
              )}

              {hydrated && (results.unavailable.length > 0 || results.tooSmall.length > 0) && (
                <div className="mt-8">
                  <p className="caps !text-[10px] text-slate">{b.s2.notAvailable}</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {results.unavailable.map((r) => (
                      <li key={r.id} className="flex items-center gap-3 rounded-md bg-white/60 px-3 py-2 text-sm text-slate ring-1 ring-line">
                        <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md opacity-60"><Image src={r.images[0]} alt="" fill sizes="56px" className="object-cover" /></span>
                        <span><span className="font-medium text-ink-soft">{r.name}</span> — {b.s2.bookedDates}</span>
                      </li>
                    ))}
                    {results.tooSmall.map((r) => (
                      <li key={r.id} className="flex items-center gap-3 rounded-md bg-white/60 px-3 py-2 text-sm text-slate ring-1 ring-line">
                        <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md opacity-60"><Image src={r.images[0]} alt="" fill sizes="56px" className="object-cover" /></span>
                        <span><span className="font-medium text-ink-soft">{r.name}</span> — {fmt(b.s2.upToGuests, { n: r.maxGuests })}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* STEP 3 */}
          {step === 3 && selectedRoom && (
            <section>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl text-ink">{b.s3.title}</h2>
                  <p className="mt-1 text-sm text-slate">{b.s3.lead}</p>
                </div>
                <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-lake hover:text-lake-deep"><ArrowLeft className="h-4 w-4" /> {b.s3.changeRoom}</button>
              </div>

              {!plan.includesBreakfast && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-mist p-4 ring-1 ring-lake/10">
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-5 w-5 text-lake" />
                    <div>
                      <p className="text-sm font-semibold text-ink">{b.s3.addBreakfastTitle}</p>
                      <p className="text-sm text-slate">{fmt(b.s3.addBreakfastText, { p: settings.breakfastPrice })}</p>
                    </div>
                  </div>
                  {planId !== "non_refundable" && <Button size="sm" variant="secondary" onClick={() => setPlanId("bed_breakfast")}>{b.s3.switchBB}</Button>}
                </div>
              )}

              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {extrasAll.filter((e) => e.active).map((eb) => {
                  const e = localizeExtra(eb, t);
                  const on = extras.includes(e.id);
                  return (
                    <li key={e.id}>
                      <button type="button" onClick={() => toggleExtra(e.id)} aria-pressed={on} className={clsx("lift-sm flex w-full items-start gap-3 rounded-lg bg-white p-4 text-left ring-1", on ? "ring-2 ring-lake" : "ring-ink/5 hover:ring-ink/20")}>
                        <span className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", on ? "bg-lake text-white" : "bg-mist text-lake")}><ExtraIcon name={e.icon} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink">{e.name}</span>
                          <span className="block text-xs text-slate">{e.requestOnly ? b.s3.free : `${chf(e.price)} ${unitLabel(e.unit, t)}`}</span>
                        </span>
                        <span className={clsx("mt-1 flex h-5 w-5 items-center justify-center rounded-xs border", on ? "border-lake bg-lake text-white" : "border-line")}>{on && <Check className="h-3 w-3" />}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {extras.includes("concierge") && (
                <Field label={b.s3.conciergeLabel} className="form-lines mt-6">
                  <Textarea value={conciergeNote} onChange={(e) => setConciergeNote(e.target.value)} placeholder={b.s3.conciergePlaceholder} />
                </Field>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => setStep(4)} arrow>{b.s3.cta}</Button>
                <Button variant="ghost" onClick={() => { setExtras([]); setStep(4); }}>{b.s3.skip}</Button>
              </div>
            </section>
          )}

          {/* STEP 4 */}
          {step === 4 && selectedRoom && q && (
            <form onSubmit={submit} noValidate className="form-lines">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl text-ink">{b.s4.title}</h2>
                  <p className="mt-1 text-sm text-slate">{b.s4.lead}</p>
                </div>
                <button type="button" onClick={() => setStep(3)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-lake hover:text-lake-deep"><ArrowLeft className="h-4 w-4" /> {b.s4.back}</button>
              </div>

              <div className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label={b.s4.firstName} error={errors.firstName}><Input value={guest.firstName} onChange={(e) => setGuest({ ...guest, firstName: e.target.value })} autoComplete="given-name" /></Field>
                  <Field label={b.s4.lastName} error={errors.lastName}><Input value={guest.lastName} onChange={(e) => setGuest({ ...guest, lastName: e.target.value })} autoComplete="family-name" /></Field>
                  <Field label={b.s4.email} error={errors.email} hint={b.s4.emailHint}><Input type="email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} autoComplete="email" /></Field>
                  <Field label={b.s4.mobile} error={errors.phone} hint={b.s4.mobileHint}><Input type="tel" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} autoComplete="tel" placeholder="+41 79 …" /></Field>
                  <Field label={b.s4.country}><Select value={guest.country} onChange={(e) => setGuest({ ...guest, country: e.target.value })}>{b.s4.countries.map((c) => <option key={c}>{c}</option>)}</Select></Field>
                  <Field label={b.s4.arrival}><Select value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)}>{b.s4.arrivalOptions.map((o) => <option key={o}>{o}</option>)}</Select></Field>
                </div>
                <Field label={b.s4.notes} className="mt-6" hint={b.s4.notesHint}>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-24" />
                </Field>
              </div>

              <div className="mt-10 flex flex-wrap items-end gap-4 border-t border-line pt-8">
                <Field label={b.s4.promo} hint={promoOk ? fmt(b.s4.promoApplied, { code: PROMO_CODE }) : b.s4.promoHint} className="w-full sm:w-64">
                  <Input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="VIDY10" className={promoOk ? "border-moss ring-2 ring-moss/20" : undefined} />
                </Field>
                {promo && !promoOk && <p className="pb-6 text-xs text-slate">{b.s4.promoUnknown}</p>}
              </div>

              <div className="mt-10 border-t border-line pt-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl text-ink">{planId === "non_refundable" ? b.s4.payment : b.s4.guarantee}</h3>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate"><Lock className="h-3.5 w-3.5" /> {b.s4.secure}</span>
                </div>
                <PaymentMarks label={false} size={18} className="mt-3" />
                <p className="mt-1 text-sm text-slate">
                  {planId === "non_refundable" ? b.s4.payNow : b.s4.payLater}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {([
                    ["card", b.s4.card, planId === "non_refundable" ? b.s4.cardChargedNow : b.s4.cardGuarantee],
                    ["hotel", b.s4.atHotel, b.s4.atHotelSub],
                  ] as const).map(([id, label, sub]) => (
                    <button key={id} type="button" onClick={() => setPayment(id)} disabled={id === "hotel" && planId === "non_refundable"} className={clsx("lift-sm rounded-md bg-white p-4 text-left ring-1 disabled:opacity-40", payment === id ? "ring-2 ring-lake" : "ring-ink/5 hover:ring-ink/30")}>
                      <span className="block text-sm font-semibold text-ink">{label}</span>
                      <span className="block text-xs text-slate">{sub}</span>
                    </button>
                  ))}
                </div>
                {payment === "card" && (
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <Field label={b.s4.cardNumber} error={errors.cardNumber} className="sm:col-span-2"><Input inputMode="numeric" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} /></Field>
                    <Field label={b.s4.cardName} error={errors.cardName} className="sm:col-span-2"><Input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></Field>
                    <Field label={b.s4.expiry} error={errors.cardExpiry}><Input placeholder="MM / YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} /></Field>
                    <Field label={b.s4.cvc} error={errors.cardCvc}><Input inputMode="numeric" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} /></Field>
                  </div>
                )}
                <p className="mt-6 flex items-start gap-2 rounded-md bg-white/70 p-3 text-xs text-slate"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-moss" /> {b.s4.demo}</p>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-line pt-8">
                <Button type="submit" size="lg" disabled={submitting}>{submitting ? b.s4.confirming : fmt(b.s4.confirm, { total: chf(q.total, { decimals: true }) })}</Button>
                <p className="text-xs text-slate">{b.s4.terms} <Link href="/terms" className="underline">{b.s4.termsLink}</Link>. {plan.cancellation}</p>
              </div>
            </form>
          )}
        </div>

        {/* summary: desktop */}
        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">{Summary}</aside>

        {/* summary: mobile */}
        <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
          <button type="button" onClick={() => setSummaryOpen((v) => !v)} className="flex w-full items-center justify-between border-t border-line bg-white px-5 py-3 text-sm shadow-[0_-8px_24px_-12px_rgba(23,26,31,0.25)]">
            <span className="font-semibold text-ink">{q ? chf(q.total, { decimals: true }) : nightsLabel(nights, t)}</span>
            <span className="inline-flex items-center gap-1 text-lake">{b.summary.title} <ChevronDown className={clsx("h-4 w-4 transition", summaryOpen && "rotate-180")} /></span>
          </button>
          {summaryOpen && <div className="max-h-[60vh] overflow-y-auto bg-sand p-4">{Summary}</div>}
        </div>
      </div>
      <div className="h-16 lg:hidden" />
    </div>
  );
}
