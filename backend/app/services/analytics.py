from datetime import date, datetime
from typing import Any

import numpy as np
import pandas as pd


def serialize_value(value: Any) -> Any:
    if pd.isna(value):
        return None
    if isinstance(value, (datetime, date, pd.Timestamp)):
        return value.isoformat()
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return float(value)
    return value


def sanitize_json(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): sanitize_json(item) for key, item in value.items()}
    if isinstance(value, list):
        return [sanitize_json(item) for item in value]
    return serialize_value(value)


def preview_rows(df: pd.DataFrame, limit: int = 20) -> list[dict[str, Any]]:
    return df.head(limit).map(serialize_value).to_dict(orient="records")


def column_metadata(df: pd.DataFrame) -> list[dict[str, Any]]:
    metadata: list[dict[str, Any]] = []
    for column in df.columns:
        mean_value = float(df[column].mean()) if pd.api.types.is_numeric_dtype(df[column]) else None
        metadata.append(
            {
                "name": str(column),
                "inferred_type": str(df[column].dtype),
                "missing_count": int(df[column].isna().sum()),
                "unique_count": int(df[column].nunique(dropna=True)),
                "mean_value": mean_value,
            }
        )
    return metadata


def descriptive_statistics(df: pd.DataFrame) -> dict[str, Any]:
    if df.empty:
        return {}
    stats = df.describe(include="all").replace({np.nan: None})
    return sanitize_json(stats.to_dict())


def detect_outliers(df: pd.DataFrame) -> list[dict[str, Any]]:
    outliers: list[dict[str, Any]] = []
    numeric_df = df.select_dtypes(include=[np.number])
    for column in numeric_df.columns:
        series = numeric_df[column].dropna()
        if series.empty:
            continue
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        if iqr == 0:
            continue
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        flagged = df[(numeric_df[column] < lower) | (numeric_df[column] > upper)]
        for index, row in flagged.head(25).iterrows():
            outliers.append(
                {
                    "column": str(column),
                    "row_index": int(index),
                    "value": serialize_value(row[column]),
                    "lower_bound": float(lower),
                    "upper_bound": float(upper),
                }
            )
    return outliers


def identify_trends(df: pd.DataFrame) -> list[dict[str, Any]]:
    trends: list[dict[str, Any]] = []
    numeric_columns = list(df.select_dtypes(include=[np.number]).columns)
    date_like = [column for column in df.columns if "date" in str(column).lower() or "month" in str(column).lower()]
    if not numeric_columns:
        return trends
    for metric in numeric_columns[:5]:
        series = df[metric].dropna()
        if len(series) >= 2:
            delta = float(series.iloc[-1] - series.iloc[0])
            direction = "up" if delta > 0 else "down" if delta < 0 else "flat"
            trends.append({"metric": str(metric), "direction": direction, "delta": round(delta, 2)})
    if date_like:
        trends.append({"time_column": str(date_like[0]), "note": "Date-like column available for time-series analysis."})
    return trends


def kpi_cards(df: pd.DataFrame) -> list[dict[str, Any]]:
    numeric_df = df.select_dtypes(include=[np.number])
    kpis = [
        {"label": "Rows", "value": int(len(df)), "tone": "neutral"},
        {"label": "Columns", "value": int(len(df.columns)), "tone": "neutral"},
        {"label": "Missing Values", "value": int(df.isna().sum().sum()), "tone": "warning"},
        {"label": "Duplicates", "value": int(df.duplicated().sum()), "tone": "warning"},
    ]
    for column in numeric_df.columns[:2]:
        kpis.append({"label": f"Avg {column}", "value": round(float(numeric_df[column].mean()), 2), "tone": "positive"})
    return kpis


def chart_payload(df: pd.DataFrame) -> dict[str, Any]:
    numeric_columns = list(df.select_dtypes(include=[np.number]).columns)
    categorical_columns = list(df.select_dtypes(exclude=[np.number]).columns)

    category = categorical_columns[0] if categorical_columns else df.columns[0]
    metric = numeric_columns[0] if numeric_columns else None

    bar: list[dict[str, Any]] = []
    pie: list[dict[str, Any]] = []
    if metric:
        grouped = df.groupby(category, dropna=False)[metric].sum().sort_values(ascending=False).head(10)
        bar = [{"name": str(index), "value": round(float(value), 2)} for index, value in grouped.items()]
        if categorical_columns:
            counts = df[category].value_counts().head(8)
            pie = [{"name": str(index), "value": int(value)} for index, value in counts.items()]

    line: list[dict[str, Any]] = []
    if metric:
        time_column = next((c for c in df.columns if "date" in str(c).lower() or "month" in str(c).lower()), None)
        if time_column:
            trend = df.groupby(time_column, dropna=False)[metric].sum().reset_index()
            line = [{"name": str(row[time_column]), "value": round(float(row[metric]), 2)} for _, row in trend.iterrows()]
        else:
            line = [{"name": str(i + 1), "value": round(float(v), 2)} for i, v in enumerate(df[metric].head(20))]

    return {
        "kpis": kpi_cards(df),
        "bar": bar,
        "line": line,
        "pie": pie,
        "table": preview_rows(df, 25),
        "outliers": detect_outliers(df),
        "trends": identify_trends(df),
    }


def project_cost_dashboard(df: pd.DataFrame) -> dict[str, Any]:
    working = df.copy()
    rename_map = {column.lower(): column for column in working.columns}
    required = ["projectname", "wbsid", "taskname", "plannedcost", "actualcost", "variance", "variancepercent", "status"]
    missing = [column for column in required if column not in rename_map]
    if missing:
        return {
            "kpis": kpi_cards(df),
            "planned_vs_actual": [],
            "variance_by_project": [],
            "wbs_breakdown": [],
            "over_budget_alerts": [],
            "executive_summary": "Project cost fields were not detected. Upload the included SAP-style sample dataset to unlock this dashboard.",
        }

    def col(name: str) -> str:
        return rename_map[name]

    planned = col("plannedcost")
    actual = col("actualcost")
    variance = col("variance")
    variance_percent = col("variancepercent")
    project = col("projectname")
    wbs = col("wbsid")
    task = col("taskname")
    status = col("status")

    project_group = working.groupby(project, dropna=False)[[planned, actual, variance]].sum().reset_index()
    wbs_group = working.groupby([project, wbs], dropna=False)[[planned, actual, variance]].sum().reset_index()
    alerts = working[working[variance] > 0].sort_values(variance, ascending=False).head(10)

    total_planned = float(working[planned].sum())
    total_actual = float(working[actual].sum())
    total_variance = float(working[variance].sum())
    over_budget_count = int((working[status].astype(str).str.lower() == "over budget").sum())
    executive_summary = (
        f"Total actual cost is {total_actual:,.0f} against planned cost of {total_planned:,.0f}, "
        f"creating a variance of {total_variance:,.0f}. {over_budget_count} work packages are over budget. "
        "Prioritize the largest positive variances for executive review and remediation planning."
    )

    return {
        "kpis": [
            {"label": "Planned Cost", "value": round(total_planned, 2), "tone": "neutral"},
            {"label": "Actual Cost", "value": round(total_actual, 2), "tone": "neutral"},
            {"label": "Variance", "value": round(total_variance, 2), "tone": "warning" if total_variance > 0 else "positive"},
            {"label": "Over-Budget WBS", "value": over_budget_count, "tone": "danger"},
        ],
        "planned_vs_actual": [
            {
                "name": str(row[project]),
                "planned": round(float(row[planned]), 2),
                "actual": round(float(row[actual]), 2),
            }
            for _, row in project_group.iterrows()
        ],
        "variance_by_project": [
            {"name": str(row[project]), "variance": round(float(row[variance]), 2)}
            for _, row in project_group.sort_values(variance, ascending=False).iterrows()
        ],
        "wbs_breakdown": [
            {
                "project": str(row[project]),
                "wbs": str(row[wbs]),
                "planned": round(float(row[planned]), 2),
                "actual": round(float(row[actual]), 2),
                "variance": round(float(row[variance]), 2),
            }
            for _, row in wbs_group.iterrows()
        ],
        "over_budget_alerts": [
            {
                "project": str(row[project]),
                "wbs": str(row[wbs]),
                "task": str(row[task]),
                "variance": round(float(row[variance]), 2),
                "variance_percent": round(float(row[variance_percent]), 2),
                "status": str(row[status]),
            }
            for _, row in alerts.iterrows()
        ],
        "executive_summary": executive_summary,
    }
