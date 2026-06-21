import pandas as pd

from app.services.analytics import chart_payload, project_cost_dashboard
from app.services.cleaning import clean_dataframe


def test_clean_dataframe_standardizes_and_removes_duplicates() -> None:
    df = pd.DataFrame(
        [
            {"Project Name": "Alpha", "Actual Cost": 100.0, "Status": None},
            {"Project Name": "Alpha", "Actual Cost": 100.0, "Status": None},
            {"Project Name": "Beta", "Actual Cost": None, "Status": "On Track"},
        ]
    )

    cleaned, report = clean_dataframe(df)

    assert list(cleaned.columns) == ["project_name", "actual_cost", "status"]
    assert report["duplicates_removed"] == 1
    assert report["missing_values_after"] == 0
    assert cleaned["actual_cost"].isna().sum() == 0


def test_chart_payload_contains_expected_sections() -> None:
    df = pd.DataFrame(
        {
            "ProjectName": ["Alpha", "Beta", "Beta"],
            "ActualCost": [100, 200, 300],
            "Month": ["2026-01", "2026-02", "2026-03"],
        }
    )

    payload = chart_payload(df)

    assert payload["kpis"]
    assert payload["bar"]
    assert payload["line"]
    assert payload["table"]


def test_project_cost_dashboard_generates_alerts() -> None:
    df = pd.DataFrame(
        {
            "ProjectName": ["Alpha", "Beta"],
            "WBSID": ["WBS-1", "WBS-2"],
            "TaskName": ["Build", "Test"],
            "PlannedCost": [100, 100],
            "ActualCost": [120, 90],
            "Variance": [20, -10],
            "VariancePercent": [20, -10],
            "Status": ["Over Budget", "On Track"],
        }
    )

    dashboard = project_cost_dashboard(df)

    assert dashboard["kpis"][2]["value"] == 10
    assert len(dashboard["over_budget_alerts"]) == 1
    assert dashboard["over_budget_alerts"][0]["project"] == "Alpha"
