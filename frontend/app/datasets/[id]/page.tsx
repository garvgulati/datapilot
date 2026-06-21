"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageSquareText, RefreshCw } from "lucide-react";

import { BarPanel, LinePanel, PiePanel } from "@/components/Charts";
import { DataTable } from "@/components/DataTable";
import { ErrorState } from "@/components/ErrorState";
import { KpiCard } from "@/components/KpiCard";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import type { ChartResponse, DatasetSummary } from "@/types/api";

export default function DatasetDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [charts, setCharts] = useState<ChartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [summaryResult, chartResult] = await Promise.all([api.summary(id), api.charts(id)]);
      setSummary(summaryResult);
      setCharts(chartResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dataset.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function clean() {
    setCleaning(true);
    setError(null);
    try {
      await api.clean(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cleaning failed.");
    } finally {
      setCleaning(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={summary?.dataset.name ?? "Dataset"}
        description="Profile, clean, visualize, and inspect generated analytics for this dataset."
        action={
          <div className="flex flex-wrap gap-2">
            <button className="focus-ring inline-flex items-center gap-2 rounded bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={clean} disabled={cleaning}>
              <RefreshCw size={16} />
              {cleaning ? "Cleaning" : "Clean data"}
            </button>
            <Link className="focus-ring inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink" href={`/datasets/${id}/chat`}>
              <MessageSquareText size={16} />
              Ask AI
            </Link>
          </div>
        }
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      {summary && charts ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {charts.kpis.slice(0, 4).map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <BarPanel data={charts.bar} title="Auto Bar Chart" />
            <LinePanel data={charts.line} title="Detected Trend" />
            <PiePanel data={charts.pie} title="Category Mix" />
          </div>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-ink">Column profile</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {summary.columns.map((column) => (
                <div key={column.id} className="enterprise-panel p-3 text-sm">
                  <p className="font-medium text-ink">{column.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{column.inferred_type} · {column.unique_count} unique · {column.missing_count} missing</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-ink">Table preview</h2>
            <DataTable rows={summary.preview} />
          </section>
        </div>
      ) : null}
    </div>
  );
}
