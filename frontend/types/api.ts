export type Tone = "neutral" | "positive" | "warning" | "danger";

export interface Dataset {
  id: string;
  name: string;
  original_filename: string;
  row_count: number;
  column_count: number;
  missing_values: number;
  duplicate_rows: number;
  status: string;
  created_at: string;
}

export interface DatasetColumn {
  id: string;
  name: string;
  inferred_type: string;
  missing_count: number;
  unique_count: number;
  mean_value?: number | null;
}

export interface DatasetDetail extends Dataset {
  columns: DatasetColumn[];
}

export interface DatasetSummary {
  dataset: Dataset;
  columns: DatasetColumn[];
  preview: Record<string, unknown>[];
  descriptive_statistics: Record<string, unknown>;
  missing_by_column: Record<string, number>;
  duplicate_rows: number;
}

export interface Kpi {
  label: string;
  value: string | number;
  tone?: Tone;
}

export interface ChartPoint {
  name: string;
  value?: number;
  planned?: number;
  actual?: number;
  variance?: number;
}

export interface ChartResponse {
  kpis: Kpi[];
  bar: ChartPoint[];
  line: ChartPoint[];
  pie: ChartPoint[];
  table: Record<string, unknown>[];
  outliers: Record<string, unknown>[];
  trends: Record<string, unknown>[];
}

export interface AskResponse {
  answer: string;
  generated_code?: string | null;
  context_used: Record<string, unknown>;
}

export interface ProjectCostDashboard {
  kpis: Kpi[];
  planned_vs_actual: ChartPoint[];
  variance_by_project: ChartPoint[];
  wbs_breakdown: Array<{ project: string; wbs: string; planned: number; actual: number; variance: number }>;
  over_budget_alerts: Array<{ project: string; wbs: string; task: string; variance: number; variance_percent: number; status: string }>;
  executive_summary: string;
}
