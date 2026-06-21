from typing import Any

import pandas as pd
from openai import OpenAI

from app.core.config import get_settings
from app.services.analytics import chart_payload, preview_rows, project_cost_dashboard


def build_dataset_context(df: pd.DataFrame) -> dict[str, Any]:
    analytics = chart_payload(df)
    return {
        "shape": {"rows": int(len(df)), "columns": int(len(df.columns))},
        "columns": [{"name": str(column), "dtype": str(df[column].dtype)} for column in df.columns],
        "sample_rows": preview_rows(df, 8),
        "kpis": analytics["kpis"],
        "trends": analytics["trends"],
        "outliers": analytics["outliers"][:10],
        "project_cost": project_cost_dashboard(df),
    }


def local_answer(question: str, df: pd.DataFrame) -> tuple[str, str]:
    lowered = question.lower()
    code = "df.head()"
    if "top" in lowered and ("overrun" in lowered or "variance" in lowered or "budget" in lowered):
        variance_column = next((c for c in df.columns if str(c).lower() == "variance"), None)
        project_column = next((c for c in df.columns if str(c).lower() == "projectname"), None)
        if variance_column:
            cols = [c for c in [project_column, variance_column] if c]
            top = df.sort_values(variance_column, ascending=False).head(5)[cols].to_dict(orient="records")
            code = f"df.sort_values('{variance_column}', ascending=False).head(5)"
            return f"Top cost overruns by variance: {top}", code
    if "summar" in lowered:
        code = "df.describe(include='all')"
        return (
            f"The dataset contains {len(df)} rows and {len(df.columns)} columns. "
            f"It has {int(df.isna().sum().sum())} missing values and {int(df.duplicated().sum())} duplicate rows. "
            f"Numeric columns include {list(df.select_dtypes(include='number').columns)}.",
            code,
        )
    if "exceeded budget" in lowered or "over budget" in lowered:
        status_column = next((c for c in df.columns if str(c).lower() == "status"), None)
        project_column = next((c for c in df.columns if str(c).lower() == "projectname"), None)
        if status_column and project_column:
            records = (
                df[df[status_column].astype(str).str.contains("over", case=False, na=False)][project_column]
                .drop_duplicates()
                .tolist()
            )
            code = f"df[df['{status_column}'].str.contains('over', case=False, na=False)]['{project_column}'].unique()"
            return f"Projects exceeding budget: {records}", code
    return (
        "I can answer from the uploaded dataset context. Try asking for a summary, top variances, over-budget projects, or outliers.",
        code,
    )


async def answer_question(question: str, df: pd.DataFrame) -> tuple[str, str | None, dict[str, Any]]:
    context = build_dataset_context(df)
    settings = get_settings()
    if not settings.openai_api_key:
        answer, code = local_answer(question, df)
        return answer, code, context

    client = OpenAI(api_key=settings.openai_api_key)
    prompt = (
        "You are DataPilot, a business data analysis assistant. Answer only from the provided dataset context. "
        "If the answer is not supported by the context, say what additional data is needed. "
        "Include concise Pandas logic when useful.\n\n"
        f"Question: {question}\n"
        f"Dataset context: {context}"
    )
    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": "Answer business data questions with grounded, auditable reasoning."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )
    answer = response.choices[0].message.content or "No answer was generated."
    return answer, None, context
