"use client";

import { clsx } from "clsx";
import { useState } from "react";
import { OfficeShell } from "@/components/office/shell";
import { InquiryChip, Panel } from "@/components/office/ui";
import { Button, Textarea } from "@/components/ui";
import { fmtDateTime } from "@/lib/format";
import { useHotel } from "@/lib/store";
import type { InquiryType } from "@/lib/types";

const TYPE_LABEL: Record<InquiryType, string> = { contact: "Contact", concierge: "Concierge", group: "Group / long stay" };

export default function InboxPage() {
  const inquiries = useHotel((s) => s.inquiries);
  const update = useHotel((s) => s.updateInquiry);
  const [filter, setFilter] = useState<"all" | InquiryType>("all");
  const [selected, setSelected] = useState<string | null>(inquiries[0]?.id ?? null);
  const [reply, setReply] = useState("");

  const list = inquiries.filter((i) => filter === "all" || i.type === filter);
  const current = inquiries.find((i) => i.id === selected) ?? list[0];

  const send = () => {
    if (!current || !reply.trim()) return;
    update(current.id, { reply: reply.trim(), status: "replied" });
    setReply("");
  };

  return (
    <OfficeShell title="Inbox" subtitle={`${inquiries.filter((i) => i.status === "new").length} new · ${inquiries.length} total`}>
      <div className="mb-4 flex gap-1 rounded-full bg-white p-1 ring-1 ring-ink/5 sm:w-fit">
        {(["all", "contact", "concierge", "group"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={clsx("rounded-full px-3 py-1.5 text-xs font-semibold", filter === f ? "bg-ink text-white" : "text-slate hover:text-ink")}>{f === "all" ? "All" : TYPE_LABEL[f]}</button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Panel>
          <ul className="divide-y divide-ink/5">
            {list.map((i) => (
              <li key={i.id}>
                <button type="button" onClick={() => { setSelected(i.id); setReply(""); }} className={clsx("w-full px-4 py-3 text-left transition", current?.id === i.id ? "bg-mist/60" : "hover:bg-[#fafbfc]")}>
                  <div className="flex items-center justify-between gap-2">
                    <p className={clsx("truncate text-sm", i.status === "new" ? "font-bold text-ink" : "font-semibold text-ink-soft")}>{i.name}</p>
                    <InquiryChip status={i.status} />
                  </div>
                  <p className="truncate text-sm text-ink-soft">{i.subject}</p>
                  <p className="mt-0.5 text-xs text-slate">{TYPE_LABEL[i.type]} · {fmtDateTime(i.createdAt)}</p>
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="px-4 py-10 text-center text-sm text-slate">Nothing in this folder.</li>}
          </ul>
        </Panel>

        {current ? (
          <Panel>
            <div className="border-b border-ink/5 px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">{current.subject}</h2>
                  <p className="text-sm text-slate">{current.name} · <a href={`mailto:${current.email}`} className="text-lake">{current.email}</a>{current.phone ? ` · ${current.phone}` : ""}</p>
                  <p className="text-xs text-slate">{TYPE_LABEL[current.type]}{current.dates ? ` · ${current.dates}` : ""} · {fmtDateTime(current.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  {current.status !== "closed" && <Button size="sm" variant="secondary" onClick={() => update(current.id, { status: "closed" })}>Close</Button>}
                  {current.status === "closed" && <Button size="sm" variant="secondary" onClick={() => update(current.id, { status: "replied" })}>Reopen</Button>}
                </div>
              </div>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div className="rounded-2xl bg-[#f5f6f8] p-4 text-sm leading-relaxed text-ink-soft">{current.message}</div>
              {current.reply && (
                <div className="ml-6 rounded-2xl bg-mist p-4 text-sm leading-relaxed text-ink-soft">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-lake">Reply sent</p>
                  {current.reply}
                </div>
              )}
              {current.status !== "closed" && (
                <div>
                  <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Reply to ${current.name.split(" ")[0]}…`} className="min-h-28" />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate">Sent by email to {current.email}. A copy stays here.</p>
                    <Button size="sm" onClick={send} disabled={!reply.trim()}>Send reply</Button>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        ) : <Panel><div className="px-5 py-10 text-center text-sm text-slate">Pick a message.</div></Panel>}
      </div>
    </OfficeShell>
  );
}
