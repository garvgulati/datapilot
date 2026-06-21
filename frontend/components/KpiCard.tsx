import type { Kpi } from "@/types/api";

const toneStyles = {
  neutral: "border-slate-200 bg-white text-ink after:bg-slate-400",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-950 after:bg-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-950 after:bg-amber-600",
  danger: "border-orange-200 bg-orange-50 text-orange-950 after:bg-signal"
};

export function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className={`relative overflow-hidden rounded-lg border p-4 shadow-soft after:absolute after:inset-x-0 after:top-0 after:h-1 ${toneStyles[kpi.tone ?? "neutral"]}`}>
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">{kpi.label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}</p>
    </div>
  );
}
