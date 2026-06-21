from pathlib import Path
from uuid import uuid4

import pandas as pd
from fastapi import HTTPException, UploadFile

from app.core.config import get_settings


SUPPORTED_EXTENSIONS = {".csv", ".xlsx", ".xls"}


def validate_upload(file: UploadFile) -> str:
    filename = file.filename or ""
    suffix = Path(filename).suffix.lower()
    if suffix not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only CSV, XLSX, and XLS files are supported.")
    return suffix


async def save_upload(file: UploadFile) -> Path:
    suffix = validate_upload(file)
    settings = get_settings()
    upload_dir = settings.storage_dir / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    destination = upload_dir / f"{uuid4()}{suffix}"
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    destination.write_bytes(content)
    return destination


def read_dataframe(path: str | Path) -> pd.DataFrame:
    file_path = Path(path)
    suffix = file_path.suffix.lower()
    if suffix == ".csv":
        return pd.read_csv(file_path)
    if suffix in {".xlsx", ".xls"}:
        return pd.read_excel(file_path)
    raise HTTPException(status_code=400, detail=f"Unsupported dataset format: {suffix}")


def write_dataframe(df: pd.DataFrame, original_path: str | Path) -> Path:
    settings = get_settings()
    clean_dir = settings.storage_dir / "cleaned"
    clean_dir.mkdir(parents=True, exist_ok=True)
    destination = clean_dir / f"{Path(original_path).stem}_cleaned.csv"
    df.to_csv(destination, index=False)
    return destination


def frame_profile(df: pd.DataFrame) -> dict[str, int]:
    return {
        "row_count": int(len(df)),
        "column_count": int(len(df.columns)),
        "missing_values": int(df.isna().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
    }
