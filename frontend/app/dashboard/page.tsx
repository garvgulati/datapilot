"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Database, UploadCloud } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { KpiCard } from "@/components/KpiCard";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import type { Dataset, Kpi } from "@/types/api";

export default function DashboardPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .datasets()
      .then(setDatasets)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const kpis = useMemo<Kpi[]>(() => {
    const rows = datasets.reduce((sum, dataset) => sum + dataset.row_count, 0);
    const columns = datasets.reduce((sum, dataset) => sum + dataset.column_count, 0);
    const cleaned = datasets.filter((dataset) => dataset.status === "cleaned").length;
    return [
      { label: "Datasets", value: datasets.length, tone: "neutral" },
      { label: "Total Rows", value: rows, tone: "positive" },
      { label: "Total Columns", value: columns, tone: "neutral" },
      { label: "Cleaned", value: cleaned, tone: "positive" }
    ];
  }, [datasets]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Operational view of uploaded business datasets, data quality status, and analyst workflows."
        action={
          <Link className="focus-ring inline-flex items-center gap-2 rounded bg-ink px-4 py-2 text-sm font-semibold text-white" href="/upload">
            <UploadCloud size={16} />
            Upload dataset
          </Link>
        }
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>

          <section className="enterprise-panel mt-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-ink">Governed dataset inventory</h2>
              <Link href="/datasets" className="inline-flex items-center gap-1 text-sm font-medium text-mint">
                View all <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {datasets.slice(0, 5).map((dataset) => (
                <Link key={dataset.id} href={`/datasets/${dataset.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Database size={18} className="text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-ink">{dataset.name}</p>
                      <p className="text-xs text-slate-500">{dataset.row_count.toLocaleString()} rows · {dataset.column_count} columns</p>
                    </div>
                  </div>
                  <span className="status-chip">{dataset.status}</span>
                </Link>
              ))}
              {!datasets.length ? <p className="px-4 py-8 text-sm text-slate-500">Upload a CSV or Excel file to begin.</p> : null}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
