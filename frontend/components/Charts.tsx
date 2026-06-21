"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { ChartPoint } from "@/types/api";

const palette = ["#0f766e", "#2563eb", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#65a30d"];

function ChartShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="enterprise-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <span className="status-chip">Auto generated</span>
      </div>
      <div className="h-72">{children}</div>
    </section>
  );
}

export function BarPanel({ data, title = "Bar Chart" }: { data: ChartPoint[]; title?: string }) {
  return (
    <ChartShell title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="value" fill="#0f766e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="variance" fill="#dc2626" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function LinePanel({ data, title = "Line Chart" }: { data: ChartPoint[]; title?: string }) {
  return (
    <ChartShell title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function PiePanel({ data, title = "Pie Chart" }: { data: ChartPoint[]; title?: string }) {
  return (
    <ChartShell title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
            {data.map((_, index) => (
              <Cell key={index} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function PlannedActualPanel({ data }: { data: ChartPoint[] }) {
  return (
    <ChartShell title="Planned vs Actual Cost">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="planned" fill="#2563eb" radius={[4, 4, 0, 0]} />
          <Bar dataKey="actual" fill="#d97706" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
