"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BarPanel, PlannedActualPanel } from "@/components/Charts";
import { DataTable } from "@/components/DataTable";
import { ErrorState } from "@/components/ErrorState";
import { KpiCard } from "@/components/KpiCard";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import type { Dataset, ProjectCostDashboard } from "@/types/api";

export default function ProjectCostIntelligencePage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [dashboard, setDashboard] = useState<ProjectCostDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .datasets()
      .then((items) => {
        setDatasets(items);
        setSelectedId(items[0]?.id ?? "");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    api
      .projectCostDashboard(selectedId)
      .then(setDashboard)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const selectedDataset = useMemo(() => datasets.find((dataset) => dataset.id === selectedId), [datasets, selectedId]);

  return (
    <div>
      <PageHeader
        title="Project Cost Intelligence"
        description="SAP-style project cost dashboard for planned versus actual spend, WBS breakdowns, over-budget alerts, and executive summaries."
        action={
          datasets.length ? (
            <select
              className="focus-ring rounded border border-slate-300 bg-white px-3 py-2 text-sm"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>{dataset.name}</option>
              ))}
            </select>
          ) : null
        }
      />
      {!datasets.length && !loading ? (
        <div className="enterprise-panel p-6">
          <p className="text-sm text-slate-600">Upload the included sample project-cost dataset to use this dashboard.</p>
          <Link className="mt-4 inline-flex rounded bg-ink px-4 py-2 text-sm font-semibold text-white" href="/upload">Upload dataset</Link>
        </div>
      ) : null}
      {loading ? <LoadingState label="Loading project cost intelligence" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {dashboard && selectedDataset ? (
        <div className="space-y-6">
          <div className="enterprise-panel border-l-4 border-l-mint p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Executive summary</p>
            <p className="mt-2 text-sm leading-6 text-ink">{dashboard.executive_summary}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboard.kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <PlannedActualPanel data={dashboard.planned_vs_actual} />
            <BarPanel data={dashboard.variance_by_project} title="Cost Variance by Project" />
          </div>
          <section>
            <h2 className="mb-3 text-sm font-semibold text-ink">Over-budget alerts</h2>
            <DataTable rows={dashboard.over_budget_alerts} limit={10} />
          </section>
          <section>
            <h2 className="mb-3 text-sm font-semibold text-ink">WBS-level cost breakdown</h2>
            <DataTable rows={dashboard.wbs_breakdown} limit={20} />
          </section>
        </div>
      ) : null}
    </div>
  );
}
