import re
from typing import Any

import pandas as pd


def standardize_column_name(name: str) -> str:
    cleaned = re.sub(r"[^0-9a-zA-Z]+", "_", str(name).strip().lower())
    cleaned = re.sub(r"_+", "_", cleaned).strip("_")
    return cleaned or "column"


def infer_and_cast_types(df: pd.DataFrame) -> pd.DataFrame:
    casted = df.copy()
    for column in casted.columns:
        if casted[column].dtype == object:
            numeric = pd.to_numeric(casted[column], errors="ignore")
            casted[column] = numeric
            if casted[column].dtype == object:
                parsed = pd.to_datetime(casted[column], errors="ignore")
                casted[column] = parsed
    return casted


def clean_dataframe(
    df: pd.DataFrame,
    remove_duplicates: bool = True,
    fill_missing_strategy: str = "auto",
    standardize_columns: bool = True,
    infer_types: bool = True,
) -> tuple[pd.DataFrame, dict[str, Any]]:
    cleaned = df.copy()
    original_shape = cleaned.shape
    original_columns = list(cleaned.columns)

    if standardize_columns:
        seen: dict[str, int] = {}
        new_columns: list[str] = []
        for column in cleaned.columns:
            base = standardize_column_name(column)
            count = seen.get(base, 0)
            seen[base] = count + 1
            new_columns.append(base if count == 0 else f"{base}_{count + 1}")
        cleaned.columns = new_columns

    if infer_types:
        cleaned = infer_and_cast_types(cleaned)

    duplicates_removed = 0
    if remove_duplicates:
        before = len(cleaned)
        cleaned = cleaned.drop_duplicates()
        duplicates_removed = before - len(cleaned)

    missing_before = int(cleaned.isna().sum().sum())
    fill_report: dict[str, str] = {}
    for column in cleaned.columns:
        if cleaned[column].isna().sum() == 0:
            continue
        if pd.api.types.is_numeric_dtype(cleaned[column]):
            if fill_missing_strategy == "zero":
                value = 0
                method = "zero"
            elif fill_missing_strategy == "median":
                value = cleaned[column].median()
                method = "median"
            else:
                value = cleaned[column].mean()
                method = "mean"
            cleaned[column] = cleaned[column].fillna(value)
        else:
            if fill_missing_strategy == "blank":
                value = ""
                method = "blank"
            else:
                mode = cleaned[column].mode(dropna=True)
                value = mode.iloc[0] if not mode.empty else ""
                method = "mode"
            cleaned[column] = cleaned[column].fillna(value)
        fill_report[column] = method

    report = {
        "original_rows": original_shape[0],
        "original_columns": original_shape[1],
        "cleaned_rows": int(len(cleaned)),
        "cleaned_columns": int(len(cleaned.columns)),
        "duplicates_removed": int(duplicates_removed),
        "missing_values_before": missing_before,
        "missing_values_after": int(cleaned.isna().sum().sum()),
        "column_mapping": dict(zip(original_columns, cleaned.columns, strict=False)),
        "fill_report": fill_report,
    }
    return cleaned, report
