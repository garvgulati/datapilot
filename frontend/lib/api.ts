import type {
  AskResponse,
  ChartResponse,
  Dataset,
  DatasetDetail,
  DatasetSummary,
  ProjectCostDashboard
} from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers =
    init?.body instanceof FormData
      ? init.headers
      : { "Content-Type": "application/json", ...((init?.headers ?? {}) as Record<string, string>) };

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  datasets: () => request<Dataset[]>("/datasets"),
  dataset: (id: string) => request<DatasetDetail>(`/datasets/${id}`),
  summary: (id: string) => request<DatasetSummary>(`/datasets/${id}/summary`),
  charts: (id: string) => request<ChartResponse>(`/datasets/${id}/charts`),
  projectCostDashboard: (id: string) => request<ProjectCostDashboard>(`/datasets/${id}/project-cost-dashboard`),
  clean: (id: string) => request(`/datasets/${id}/clean`, { method: "POST", body: JSON.stringify({}) }),
  ask: (id: string, question: string) =>
    request<AskResponse>(`/datasets/${id}/ask`, { method: "POST", body: JSON.stringify({ question }) }),
  upload: (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request<Dataset>("/upload", { method: "POST", body });
  }
};
