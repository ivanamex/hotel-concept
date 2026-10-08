"use client";

import { clsx } from "clsx";
import { ExtraIcon } from "@/components/site/extra-icon";
import { en } from "@/i18n/en";

const UNIT_LABEL = en.units;
import { OfficeShell } from "@/components/office/shell";
import { Panel, Toggle, td, th } from "@/components/office/ui";
import { inputClass } from "@/components/ui";
import { chf, fmtDate } from "@/lib/format";
import { nightlyPrice, todayISO, addDays } from "@/lib/engine";
import { useHotel } from "@/lib/store";

const num = clsx(inputClass, "h-9 w-24 px-2 text-sm tabular-nums");

export default function RatesPage() {
  const ratePlans = useHotel((s) => s.ratePlans);
  const seasons = useHotel((s) => s.seasons);
  const extras = useHotel((s) => s.extras);
  const settings = useHotel((s) => s.settings);
  const rooms = useHotel((s) => s.rooms);
  const updateRatePlan = useHotel((s) => s.updateRatePlan);
  const updateSeason = useHotel((s) => s.updateSeason);
  const updateExtra = useHotel((s) => s.updateExtra);
  const updateSettings = useHotel((s) => s.updateSettings);

  const sample = rooms[2];
  const today = todayISO();
  const preview = [0, 30, 90, 180, 270].map((d) => addDays(today, d));

  return (
    <OfficeShell title="Rates & extras" subtitle="Plans, seasons, add-ons and taxes">
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Rate plans">
          <ul className="divide-y divide-ink/5">
            {ratePlans.map((p) => (
              <li key={p.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="text-xs text-slate">{p.description} {p.cancellation}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2 text-xs text-slate">Discount %<input type="number" min={0} max={50} value={Math.round(p.discount * 100)} onChange={(e) => updateRatePlan(p.id, { discount: Number(e.target.value) / 100 })} className={clsx(num, "w-16")} /></label>
                  <label className="flex items-center gap-2 text-xs text-slate">Breakfast <Toggle on={p.includesBreakfast} onChange={(v) => updateRatePlan(p.id, { includesBreakfast: v })} label={`${p.name} includes breakfast`} /></label>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Taxes & breakfast">
          <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
            <label className="text-sm"><span className="block text-xs font-medium text-slate">Breakfast, per adult per night (CHF)</span><input type="number" value={settings.breakfastPrice} onChange={(e) => updateSettings({ breakfastPrice: Number(e.target.value) })} className={clsx(num, "mt-1 w-32")} /><span className="mt-1 block text-xs text-slate">Children pay half.</span></label>
            <label className="text-sm"><span className="block text-xs font-medium text-slate">City tax, per adult per night (CHF)</span><input type="number" step={0.1} value={settings.cityTax} onChange={(e) => updateSettings({ cityTax: Number(e.target.value) })} className={clsx(num, "mt-1 w-32")} /><span className="mt-1 block text-xs text-slate">Shown separately to the guest.</span></label>
          </div>
          <div className="border-t border-ink/5 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">Weekend rule</p>
            <p className="mt-1 text-sm text-ink-soft">Friday and Saturday nights are +8 % on every plan. Prices are rounded to CHF 5.</p>
          </div>
        </Panel>

        <Panel title="Seasons">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead className="bg-[#fafbfc]"><tr><th className={th}>Season</th><th className={th}>From</th><th className={th}>To</th><th className={th}>Multiplier</th></tr></thead>
              <tbody className="divide-y divide-ink/5">
                {seasons.map((s) => (
                  <tr key={s.id}>
                    <td className={`${td} font-semibold`}>{s.name}</td>
                    <td className={td}><input value={s.from} onChange={(e) => updateSeason(s.id, { from: e.target.value })} className={clsx(num, "w-20 font-mono")} /></td>
                    <td className={td}><input value={s.to} onChange={(e) => updateSeason(s.id, { to: e.target.value })} className={clsx(num, "w-20 font-mono")} /></td>
                    <td className={td}><input type="number" step={0.05} min={0.5} max={2} value={s.multiplier} onChange={(e) => updateSeason(s.id, { multiplier: Number(e.target.value) })} className={num} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 text-xs text-slate">Dates as MM-DD. Later rows override earlier ones where they overlap (Montreux Jazz sits inside high season).</p>
        </Panel>

        <Panel title={`Price preview · ${sample.name} (base ${chf(sample.basePrice)})`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead className="bg-[#fafbfc]"><tr><th className={th}>Night</th>{ratePlans.map((p) => <th key={p.id} className={`${th} text-right`}>{p.short}</th>)}</tr></thead>
              <tbody className="divide-y divide-ink/5">
                {preview.map((d) => (
                  <tr key={d}><td className={td}>{fmtDate(d, "weekday")}</td>{ratePlans.map((p) => <td key={p.id} className={`${td} text-right tabular-nums`}>{chf(nightlyPrice(sample, d, p, seasons))}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 text-xs text-slate">Room price only; breakfast and city tax are added per person.</p>
        </Panel>
      </div>

      <Panel className="mt-6" title="Extras & services">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-[#fafbfc]"><tr><th className={th}>Extra</th><th className={th}>Price (CHF)</th><th className={th}>Unit</th><th className={th}>Bookable online</th></tr></thead>
            <tbody className="divide-y divide-ink/5">
              {extras.map((e) => (
                <tr key={e.id}>
                  <td className={td}><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-mist text-lake"><ExtraIcon name={e.icon} className="h-4 w-4" /></span><div><p className="font-semibold">{e.name}</p><p className="text-xs text-slate">{e.short}{e.requestOnly ? " · request only" : ""}</p></div></div></td>
                  <td className={td}>{e.requestOnly ? <span className="text-slate">free</span> : <input type="number" value={e.price} min={0} step={5} onChange={(ev) => updateExtra(e.id, { price: Number(ev.target.value) })} className={num} />}</td>
                  <td className={td}>
                    <select value={e.unit} onChange={(ev) => updateExtra(e.id, { unit: ev.target.value as typeof e.unit })} className={clsx(inputClass, "h-9 w-auto text-sm")}>
                      {Object.entries(UNIT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className={td}><Toggle on={e.active} onChange={(v) => updateExtra(e.id, { active: v })} label={`${e.name} active`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </OfficeShell>
  );
}
