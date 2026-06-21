"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquareText, Wand2 } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import type { Dataset } from "@/types/api";

export default function DatasetsPage() {
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

  return (
    <div>
      <PageHeader title="Datasets" description="Browse uploaded datasets and drill into profiling, cleaning, charting, and AI-assisted analysis." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error ? (
        <div className="enterprise-panel overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Dataset", "Rows", "Columns", "Missing", "Duplicates", "Status", "Actions"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datasets.map((dataset) => (
                <tr key={dataset.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link className="font-medium text-ink hover:text-mint" href={`/datasets/${dataset.id}`}>{dataset.name}</Link>
                    <p className="text-xs text-slate-500">{dataset.original_filename}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{dataset.row_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700">{dataset.column_count}</td>
                  <td className="px-4 py-3 text-slate-700">{dataset.missing_values}</td>
                  <td className="px-4 py-3 text-slate-700">{dataset.duplicate_rows}</td>
                  <td className="px-4 py-3"><span className="status-chip">{dataset.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-100" title="Analyze" href={`/datasets/${dataset.id}`}>
                        <Wand2 size={16} />
                      </Link>
                      <Link className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-100" title="Chat" href={`/datasets/${dataset.id}/chat`}>
                        <MessageSquareText size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!datasets.length ? <p className="p-6 text-sm text-slate-500">No datasets yet.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
