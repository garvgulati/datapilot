"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileSpreadsheet, UploadCloud } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import type { Dataset } from "@/types/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setDataset(null);
    setError(null);
    setFile(event.target.files?.[0] ?? null);
  }

  async function upload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const created = await api.upload(file);
      setDataset(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Upload Dataset" description="Import CSV or Excel files for profiling, cleaning, visualization, and AI analysis." />
      <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="enterprise-panel p-6">
          <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-400 bg-gradient-to-b from-white to-slate-50 px-6 text-center hover:border-mint">
            <FileSpreadsheet className="mb-4 text-mint" size={42} />
            <span className="text-sm font-semibold text-ink">{file ? file.name : "Choose a CSV, XLSX, or XLS file"}</span>
            <span className="mt-1 text-xs text-slate-500">The backend profiles columns, missing values, duplicates, and datatypes immediately.</span>
            <input className="sr-only" type="file" accept=".csv,.xlsx,.xls" onChange={onFileChange} />
          </label>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="focus-ring inline-flex items-center gap-2 rounded bg-ink px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!file || loading}
              onClick={upload}
            >
              <UploadCloud size={16} />
              {loading ? "Uploading" : "Upload"}
            </button>
            <a className="text-sm font-medium text-mint" href="/project_cost_sample.csv" download>
              Download sample dataset
            </a>
          </div>
          {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}
        </div>

        <aside className="enterprise-panel p-5">
          <h2 className="text-sm font-semibold text-ink">Import control report</h2>
          {dataset ? (
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={18} />
                Dataset imported
              </div>
              <p className="font-medium text-ink">{dataset.name}</p>
              <p className="text-slate-600">{dataset.row_count.toLocaleString()} rows · {dataset.column_count} columns</p>
              <Link className="focus-ring inline-flex rounded bg-mint px-3 py-2 text-sm font-semibold text-white" href={`/datasets/${dataset.id}`}>
                Open dataset
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No file uploaded in this session.</p>
          )}
        </aside>
      </section>
    </div>
  );
}
