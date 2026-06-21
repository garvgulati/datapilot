from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class DatasetColumnRead(BaseModel):
    id: str
    name: str
    inferred_type: str
    missing_count: int
    unique_count: int
    mean_value: float | None = None

    model_config = {"from_attributes": True}


class DatasetRead(BaseModel):
    id: str
    name: str
    original_filename: str
    row_count: int
    column_count: int
    missing_values: int
    duplicate_rows: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class DatasetDetail(DatasetRead):
    columns: list[DatasetColumnRead] = []


class DatasetSummary(BaseModel):
    dataset: DatasetRead
    columns: list[DatasetColumnRead]
    preview: list[dict[str, Any]]
    descriptive_statistics: dict[str, Any]
    missing_by_column: dict[str, int]
    duplicate_rows: int


class CleanDatasetRequest(BaseModel):
    remove_duplicates: bool = True
    fill_missing_strategy: str = Field(default="auto", pattern="^(auto|mean|median|mode|zero|blank)$")
    standardize_columns: bool = True
    infer_types: bool = True


class CleanDatasetResponse(BaseModel):
    dataset: DatasetRead
    cleaning_report: dict[str, Any]


class ChartResponse(BaseModel):
    kpis: list[dict[str, Any]]
    bar: list[dict[str, Any]]
    line: list[dict[str, Any]]
    pie: list[dict[str, Any]]
    table: list[dict[str, Any]]
    outliers: list[dict[str, Any]]
    trends: list[dict[str, Any]]


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)


class AskResponse(BaseModel):
    answer: str
    generated_code: str | None = None
    context_used: dict[str, Any]


class ProjectCostDashboard(BaseModel):
    kpis: list[dict[str, Any]]
    planned_vs_actual: list[dict[str, Any]]
    variance_by_project: list[dict[str, Any]]
    wbs_breakdown: list[dict[str, Any]]
    over_budget_alerts: list[dict[str, Any]]
    executive_summary: str
