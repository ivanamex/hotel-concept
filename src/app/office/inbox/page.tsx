"use client";

import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { clsx } from "clsx";
import { ArrowRight, Building2, CalendarCheck, Camera, Globe, GripVertical, Mail, MessageCircle, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { NewReservationModal, type NewReservationInitial } from "@/components/office/new-reservation";
import { OfficeShell } from "@/components/office/shell";
import { InquiryChip, Panel, PropertyChip } from "@/components/office/ui";
import { Button, Input, Textarea } from "@/components/ui";
import { todayISO } from "@/lib/engine";
import { INQUIRY_SOURCE_LABEL, INQUIRY_TYPE_LABEL, fmtDate, fmtDateTime, relativeDay } from "@/lib/format";
import { useHotel, useOfficeScope } from "@/lib/store";
import type { Inquiry, InquirySource, InquiryStatus } from "@/lib/types";

const STAGES: { id: InquiryStatus; label: string; hint: string }[] = [
  { id: "new", label: "New", hint: "Not answered yet" },
  { id: "replied", label: "Replied", hint: "Waiting on the guest" },
  { id: "offer", label: "Offer sent", hint: "Terms out, decision pending" },
  { id: "won", label: "Won", hint: "Became a booking or was done" },
  { id: "lost", label: "Lost", hint: "Declined or went elsewhere" },
];

const SOURCE_ICON: Record<InquirySource, typeof Mail> = { website: Globe, whatsapp: MessageCircle, email: Mail, phone: Phone, instagram: Camera, ota: Building2 };

type View = "list" | "board" | "subscribers";

export default function InboxPage() {
  const scope = useOfficeScope();
  const inquiries = scope.inquiries;
  const subscribers = useHotel((s) => s.subscribers);
  const update = useHotel((s) => s.updateInquiry);
  const setStatus = useHotel((s) => s.setInquiryStatus);
  const addNote = useHotel((s) => s.addInquiryNote);
  const today = todayISO();

  const [view, setView] = useState<View>("list");
  const [stage, setStage] = useState<InquiryStatus | "open">("open");
  const [selected, setSelected] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const [convert, setConvert] = useState<NewReservationInitial | null>(null);
  const [dragging, setDragging] = useState<Inquiry | null>(null);

  const open = (i: Inquiry) => i.status !== "won" && i.status !== "lost";
  const sorted = useMemo(() => [...inquiries].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), [inquiries]);
  const list = sorted.filter((i) => (stage === "open" ? open(i) : i.status === stage));
  const current = inquiries.find((i) => i.id === selected) ?? list[0] ?? null;
  const dueCount = inquiries.filter((i) => open(i) && i.nextAction && i.nextAction.due <= today).length;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));
  const onDragStart = (e: DragStartEvent) => setDragging(inquiries.find((i) => i.id === e.active.id) ?? null);
  const onDragEnd = (e: DragEndEvent) => {
    setDragging(null);
    const to = e.over?.id as InquiryStatus | undefined;
    if (to && STAGES.some((s) => s.id === to)) setStatus(String(e.active.id), to);
  };

  const send = () => {
    if (!current || !reply.trim()) return;
    update(current.id, { reply: reply.trim() });
    if (current.status === "new") setStatus(current.id, "replied");
    setReply("");
  };

  const startConvert = (i: Inquiry) => {
    const [first, ...rest] = i.name.replace(/&/g, "and").split(" ");
    const group = i.type === "group" || i.type === "retreat" || i.type === "whole" || i.type === "venue";
    setConvert({
      propertyId: i.propertyId,
      inquiryId: i.id,
      guest: { firstName: first, lastName: rest.join(" "), email: i.email, phone: i.phone ?? "" },
      notes: `${i.subject}${i.dates ? ` · ${i.dates}` : ""}`,
      type: i.type === "retreat" ? "retreat" : i.type === "venue" ? "venue" : i.type === "whole" || i.type === "group" ? "whole" : "stay",
      headcount: group ? i.headcount : undefined,
      source: i.source === "website" ? "direct" : i.source === "phone" ? "phone" : "email",
    });
  };

  const subtitle = `${inquiries.filter((i) => i.status === "new").length} new · ${dueCount} due · ${inquiries.filter(open).length} open`;

  return (
    <OfficeShell title="Inbox" subtitle={subtitle}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xs bg-white p-1 ring-1 ring-ink/5">
          {(["list", "board", "subscribers"] as View[]).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} className={clsx("rounded-xs px-3 py-1.5 text-xs font-semibold capitalize transition", view === v ? "bg-ink text-white" : "text-slate hover:text-ink")}>
              {v === "subscribers" ? `Subscribers · ${subscribers.length}` : v}
            </button>
          ))}
        </div>
        {view === "list" && (
          <div className="flex flex-wrap gap-1 rounded-xs bg-white p-1 ring-1 ring-ink/5">
            <button type="button" onClick={() => setStage("open")} className={clsx("rounded-xs px-3 py-1.5 text-xs font-semibold transition", stage === "open" ? "bg-ink text-white" : "text-slate hover:text-ink")}>Open · {inquiries.filter(open).length}</button>
            {STAGES.map((s) => (
              <button key={s.id} type="button" onClick={() => setStage(s.id)} className={clsx("rounded-xs px-3 py-1.5 text-xs font-semibold transition", stage === s.id ? "bg-ink text-white" : "text-slate hover:text-ink")}>
                {s.label} · {inquiries.filter((i) => i.status === s.id).length}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === "subscribers" && <Subscribers />}

      {view === "board" && (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {STAGES.map((s) => (
              <Column key={s.id} stage={s} items={sorted.filter((i) => i.status === s.id)} today={today} onOpen={(id) => { setSelected(id); setView("list"); setStage(sorted.find((i) => i.id === id)?.status ?? "open"); }} />
            ))}
          </div>
          <DragOverlay dropAnimation={null}>{dragging ? <Card i={dragging} today={today} overlay /> : null}</DragOverlay>
          <p className="mt-3 text-xs text-slate">Drag a card to another column to move it on — or open it and use the stage buttons.</p>
        </DndContext>
      )}

      {view === "list" && (
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <Panel>
            <ul className="divide-y divide-ink/5">
              {list.map((i) => {
                const Icon = SOURCE_ICON[i.source];
                const due = i.nextAction && open(i) ? i.nextAction.due <= today : false;
                return (
                  <li key={i.id}>
                    <button type="button" onClick={() => { setSelected(i.id); setReply(""); }} className={clsx("w-full px-4 py-3 text-left transition", current?.id === i.id ? "bg-mist/60" : "hover:bg-[#fafbfc]")}>
                      <div className="flex items-center justify-between gap-2">
                        <p className={clsx("truncate text-sm", i.status === "new" ? "font-bold text-ink" : "font-semibold text-ink-soft")}>{i.name}</p>
                        <InquiryChip status={i.status} />
                      </div>
                      <p className="truncate text-sm text-ink-soft">{i.subject}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate">
                        <Icon className="h-3 w-3" /> {INQUIRY_TYPE_LABEL[i.type]} · {fmtDate(i.createdAt.slice(0, 10), "short")}
                        {scope.all && i.propertyId && <> · <PropertyChip id={i.propertyId} size="xs" /></>}
                        {i.nextAction && open(i) && <span className={clsx("ml-auto", due ? "font-semibold text-clay" : "")}>{due ? "due " : ""}{relativeDay(i.nextAction.due, today)}</span>}
                      </p>
                    </button>
                  </li>
                );
              })}
              {list.length === 0 && <li className="px-4 py-10 text-center text-sm text-slate">Nothing here.</li>}
            </ul>
          </Panel>

          {current ? (
            <Panel>
              <div className="border-b border-ink/5 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-semibold text-ink">{current.subject}</h2>
                      <InquiryChip status={current.status} />
                      {current.propertyId && <PropertyChip id={current.propertyId} />}
                    </div>
                    <p className="mt-1 text-sm text-slate">{current.name} · <a href={`mailto:${current.email}`} className="text-lake">{current.email}</a>{current.phone ? ` · ${current.phone}` : ""}</p>
                    <p className="text-xs text-slate">
                      {INQUIRY_TYPE_LABEL[current.type]} · via {INQUIRY_SOURCE_LABEL[current.source]}{current.dates ? ` · ${current.dates}` : ""}{current.headcount ? ` · ${current.headcount} people` : ""} · {fmtDateTime(current.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {open(current) && <Button size="sm" onClick={() => startConvert(current)}><CalendarCheck className="mr-1.5 h-3.5 w-3.5" /> Convert to reservation</Button>}
                    {current.status !== "lost" && current.status !== "won" && <Button size="sm" variant="secondary" onClick={() => setStatus(current.id, "lost")}>Mark lost</Button>}
                    {(current.status === "won" || current.status === "lost") && <Button size="sm" variant="secondary" onClick={() => setStatus(current.id, "replied")}>Reopen</Button>}
                  </div>
                </div>
                {/* stage rail */}
                <ol className="mt-4 flex flex-wrap items-center gap-1 text-xs">
                  {STAGES.filter((s) => s.id !== "lost").map((s, idx) => {
                    const reached = STAGES.findIndex((x) => x.id === current.status) >= idx && current.status !== "lost";
                    const active = current.status === s.id;
                    return (
                      <li key={s.id} className="flex items-center gap-1">
                        <button type="button" onClick={() => setStatus(current.id, s.id)} title={s.hint} className={clsx("rounded-xs px-2.5 py-1 font-semibold transition", active ? "bg-ink text-white" : reached ? "bg-ink/10 text-ink hover:bg-ink/15" : "text-slate hover:bg-ink/5 hover:text-ink")}>{s.label}</button>
                        {idx < 3 && <ArrowRight className="h-3 w-3 text-line-strong" />}
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1fr_280px]">
                <div className="space-y-4">
                  <div className="rounded-lg bg-[#f5f6f8] p-4 text-sm leading-relaxed text-ink-soft">{current.message}</div>
                  {current.reply && (
                    <div className="ml-6 rounded-lg bg-mist p-4 text-sm leading-relaxed text-ink-soft">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-lake">Reply sent</p>
                      {current.reply}
                    </div>
                  )}
                  {open(current) && (
                    <div>
                      <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Reply to ${current.name.split(" ")[0]}…`} className="min-h-28" />
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-xs text-slate">Goes out by {current.source === "whatsapp" ? "WhatsApp" : "email"}. A copy stays here.</p>
                        <div className="flex gap-2">
                          {current.status === "replied" && <Button size="sm" variant="secondary" onClick={() => { if (reply.trim()) update(current.id, { reply: reply.trim() }); setStatus(current.id, "offer"); setReply(""); }}>Send as offer</Button>}
                          <Button size="sm" onClick={send} disabled={!reply.trim()}>Send reply</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <aside className="space-y-5">
                  <NextAction inquiry={current} today={today} onChange={(na) => update(current.id, { nextAction: na })} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">Notes</p>
                    <ul className="mt-2 space-y-2">
                      {current.notes.map((n, idx) => (
                        <li key={idx} className="rounded-xs bg-[#fff9e8] px-3 py-2 text-sm text-ink-soft">
                          {n.text}
                          <span className="mt-1 block text-[11px] text-slate">{fmtDateTime(n.at)}</span>
                        </li>
                      ))}
                    </ul>
                    <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (note.trim()) { addNote(current.id, note.trim()); setNote(""); } }}>
                      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" className="!h-9 flex-1 text-sm" />
                      <Button size="sm" type="submit" variant="secondary" disabled={!note.trim()}>Add</Button>
                    </form>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">Timeline</p>
                    <ol className="mt-2 space-y-1.5 border-l border-ink/10 pl-3">
                      {[...current.timeline].reverse().map((t, idx) => (
                        <li key={idx} className="text-xs text-ink-soft"><span className="text-slate">{fmtDateTime(t.at)}</span> — {t.text}</li>
                      ))}
                    </ol>
                  </div>
                </aside>
              </div>
            </Panel>
          ) : <Panel><div className="px-5 py-10 text-center text-sm text-slate">Pick a request.</div></Panel>}
        </div>
      )}

      {convert && <NewReservationModal initial={convert} onClose={() => setConvert(null)} />}
    </OfficeShell>
  );
}

function NextAction({ inquiry, today, onChange }: { inquiry: Inquiry; today: string; onChange: (na: Inquiry["nextAction"]) => void }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(inquiry.nextAction?.label ?? "");
  const [due, setDue] = useState(inquiry.nextAction?.due ?? today);
  const na = inquiry.nextAction;
  const overdue = na ? na.due < today : false;
  if (editing) {
    return (
      <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); onChange(label.trim() ? { label: label.trim(), due } : undefined); setEditing(false); }}>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">Next action</p>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="What happens next…" className="!h-9 text-sm" />
        <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="!h-9 text-sm" />
        <div className="flex gap-2"><Button size="sm" type="submit">Save</Button><Button size="sm" variant="ghost" type="button" onClick={() => setEditing(false)}>Cancel</Button></div>
      </form>
    );
  }
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">Next action</p>
      {na ? (
        <button type="button" onClick={() => { setLabel(na.label); setDue(na.due); setEditing(true); }} className={clsx("mt-2 block w-full rounded-xs px-3 py-2 text-left text-sm transition hover:ring-1 hover:ring-ink/20", overdue ? "bg-[#fdecea] text-[#9f2f24]" : na.due === today ? "bg-[#fff3e0] text-[#8a5a00]" : "bg-[#f5f6f8] text-ink")}>
          {na.label}
          <span className="mt-0.5 block text-[11px] opacity-80">{overdue ? "overdue · " : ""}{fmtDate(na.due, "weekday")} · {relativeDay(na.due, today)}</span>
        </button>
      ) : (
        <button type="button" onClick={() => setEditing(true)} className="mt-2 block w-full rounded-xs border border-dashed border-ink/20 px-3 py-2 text-left text-sm text-slate transition hover:border-ink/40 hover:text-ink">Set what happens next…</button>
      )}
    </div>
  );
}

function Column({ stage, items, today, onOpen }: { stage: (typeof STAGES)[number]; items: Inquiry[]; today: string; onOpen: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return (
    <section ref={setNodeRef} className={clsx("flex min-h-[260px] flex-col rounded-lg bg-white ring-1 transition", isOver ? "ring-lake" : "ring-ink/5")}>
      <header className="border-b border-ink/5 px-4 py-3">
        <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-ink">{stage.label}</h2><span className="text-xs text-slate">{items.length}</span></div>
        <p className="text-[11px] text-slate">{stage.hint}</p>
      </header>
      <ul className="flex-1 space-y-2 p-2">
        {items.map((i) => <DraggableCard key={i.id} i={i} today={today} onOpen={onOpen} />)}
        {items.length === 0 && <li className="px-2 py-6 text-center text-xs text-slate">Drop a request here</li>}
      </ul>
    </section>
  );
}

function DraggableCard({ i, today, onOpen }: { i: Inquiry; today: string; onOpen: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: i.id });
  return (
    <li ref={setNodeRef} className={clsx(isDragging && "opacity-30")}>
      <Card i={i} today={today} onOpen={onOpen} handle={<button type="button" {...listeners} {...attributes} className="cursor-grab rounded-xs p-1 text-slate hover:bg-ink/5 hover:text-ink active:cursor-grabbing" aria-label={`Move ${i.name}`}><GripVertical className="h-4 w-4" /></button>} />
    </li>
  );
}

function Card({ i, today, onOpen, handle, overlay }: { i: Inquiry; today: string; onOpen?: (id: string) => void; handle?: React.ReactNode; overlay?: boolean }) {
  const Icon = SOURCE_ICON[i.source];
  const due = i.nextAction && i.nextAction.due <= today && i.status !== "won" && i.status !== "lost";
  return (
    <article className={clsx("rounded-lg bg-white p-3 ring-1 ring-ink/10 transition", overlay ? "rotate-1 shadow-lift" : "hover:ring-ink/25")}>
      <div className="flex items-start gap-1">
        <button type="button" onClick={() => onOpen?.(i.id)} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-ink">{i.name}</p>
          <p className="truncate text-xs text-ink-soft">{i.subject}</p>
        </button>
        {handle}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate">
        <Icon className="h-3 w-3" /> {INQUIRY_TYPE_LABEL[i.type]}
        {i.headcount ? <span>· {i.headcount} p</span> : null}
        {i.propertyId && <PropertyChip id={i.propertyId} size="xs" />}
      </div>
      {i.nextAction && i.status !== "won" && i.status !== "lost" && (
        <p className={clsx("mt-2 truncate rounded-xs px-2 py-1 text-[11px]", due ? "bg-[#fff3e0] font-semibold text-[#8a5a00]" : "bg-[#f5f6f8] text-ink-soft")}>{i.nextAction.label} · {relativeDay(i.nextAction.due, today)}</p>
      )}
    </article>
  );
}

function Subscribers() {
  const subscribers = useHotel((s) => s.subscribers);
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-ink/5 px-5 py-3">
        <p className="text-sm text-slate">People who left their email on the website for the direct-booking code. Export for the newsletter tool.</p>
        <Button size="sm" variant="secondary" onClick={() => {
          const rows = [["email", "name", "code", "page", "date"], ...subscribers.map((x) => [x.email, x.name ?? "", x.code, x.page, x.createdAt])];
          const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
          const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "subscribers.csv"; a.click();
        }}>Export CSV</Button>
      </div>
      <table className="w-full">
        <thead className="bg-[#fafbfc]"><tr>{["Email", "Name", "Code", "From page", "Date"].map((h) => <th key={h} className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-ink/5">
          {subscribers.map((x) => (
            <tr key={x.id}><td className="px-5 py-3 text-sm font-semibold">{x.email}</td><td className="px-5 py-3 text-sm">{x.name ?? "—"}</td><td className="px-5 py-3 font-mono text-xs">{x.code}</td><td className="px-5 py-3 text-sm text-slate">{x.page}</td><td className="px-5 py-3 text-sm text-slate">{fmtDateTime(x.createdAt)}</td></tr>
          ))}
          {subscribers.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate">No subscribers yet.</td></tr>}
        </tbody>
      </table>
    </Panel>
  );
}
