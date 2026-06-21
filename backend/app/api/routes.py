from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.entities import AnalysisResult, ChatMessage, Dataset, DatasetColumn
from app.schemas.datasets import (
    AskRequest,
    AskResponse,
    ChartResponse,
    CleanDatasetRequest,
    CleanDatasetResponse,
    DatasetDetail,
    DatasetColumnRead,
    DatasetRead,
    DatasetSummary,
    ProjectCostDashboard,
)
from app.services.ai import answer_question
from app.services.analytics import chart_payload, column_metadata, descriptive_statistics, preview_rows, project_cost_dashboard
from app.services.cleaning import clean_dataframe
from app.services.data_io import frame_profile, read_dataframe, save_upload, write_dataframe

router = APIRouter()


def get_dataset_or_404(db: Session, dataset_id: str) -> Dataset:
    dataset = db.scalar(
        select(Dataset).where(Dataset.id == dataset_id).options(selectinload(Dataset.columns))
    )
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return dataset


def get_dataset_frame(dataset: Dataset):
    path = dataset.cleaned_file_path or dataset.file_path
    return read_dataframe(path)


def refresh_columns(db: Session, dataset: Dataset, metadata: list[dict]) -> None:
    for existing in list(dataset.columns):
        db.delete(existing)
    db.flush()
    for item in metadata:
        db.add(DatasetColumn(dataset_id=dataset.id, **item))


@router.post("/upload", response_model=DatasetRead, status_code=201)
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)) -> Dataset:
    path = await save_upload(file)
    df = read_dataframe(path)
    profile = frame_profile(df)
    dataset = Dataset(
        name=Path(file.filename or path.name).stem,
        original_filename=file.filename or path.name,
        file_path=str(path),
        **profile,
    )
    db.add(dataset)
    db.flush()
    refresh_columns(db, dataset, column_metadata(df))
    db.commit()
    db.refresh(dataset)
    return dataset


@router.get("/datasets", response_model=list[DatasetRead])
def list_datasets(db: Session = Depends(get_db)) -> list[Dataset]:
    return list(db.scalars(select(Dataset).order_by(Dataset.created_at.desc())).all())


@router.get("/datasets/{dataset_id}", response_model=DatasetDetail)
def dataset_detail(dataset_id: str, db: Session = Depends(get_db)) -> Dataset:
    return get_dataset_or_404(db, dataset_id)


@router.post("/datasets/{dataset_id}/clean", response_model=CleanDatasetResponse)
def clean_dataset(
    dataset_id: str,
    request: CleanDatasetRequest,
    db: Session = Depends(get_db),
) -> CleanDatasetResponse:
    dataset = get_dataset_or_404(db, dataset_id)
    df = read_dataframe(dataset.file_path)
    cleaned, report = clean_dataframe(
        df,
        remove_duplicates=request.remove_duplicates,
        fill_missing_strategy=request.fill_missing_strategy,
        standardize_columns=request.standardize_columns,
        infer_types=request.infer_types,
    )
    cleaned_path = write_dataframe(cleaned, dataset.file_path)
    profile = frame_profile(cleaned)
    dataset.cleaned_file_path = str(cleaned_path)
    dataset.status = "cleaned"
    dataset.row_count = profile["row_count"]
    dataset.column_count = profile["column_count"]
    dataset.missing_values = profile["missing_values"]
    dataset.duplicate_rows = profile["duplicate_rows"]
    refresh_columns(db, dataset, column_metadata(cleaned))
    db.add(AnalysisResult(dataset_id=dataset.id, result_type="cleaning_report", payload=report))
    db.commit()
    db.refresh(dataset)
    return CleanDatasetResponse(dataset=DatasetRead.model_validate(dataset), cleaning_report=report)


@router.get("/datasets/{dataset_id}/summary", response_model=DatasetSummary)
def dataset_summary(dataset_id: str, db: Session = Depends(get_db)) -> DatasetSummary:
    dataset = get_dataset_or_404(db, dataset_id)
    df = get_dataset_frame(dataset)
    return DatasetSummary(
        dataset=DatasetRead.model_validate(dataset),
        columns=[DatasetColumnRead.model_validate(column) for column in dataset.columns],
        preview=preview_rows(df),
        descriptive_statistics=descriptive_statistics(df),
        missing_by_column={str(column): int(df[column].isna().sum()) for column in df.columns},
        duplicate_rows=int(df.duplicated().sum()),
    )


@router.get("/datasets/{dataset_id}/charts", response_model=ChartResponse)
def dataset_charts(dataset_id: str, db: Session = Depends(get_db)) -> dict:
    dataset = get_dataset_or_404(db, dataset_id)
    payload = chart_payload(get_dataset_frame(dataset))
    db.add(AnalysisResult(dataset_id=dataset.id, result_type="chart_payload", payload=payload))
    db.commit()
    return payload


@router.post("/datasets/{dataset_id}/ask", response_model=AskResponse)
async def ask_dataset(dataset_id: str, request: AskRequest, db: Session = Depends(get_db)) -> AskResponse:
    dataset = get_dataset_or_404(db, dataset_id)
    answer, generated_code, context = await answer_question(request.question, get_dataset_frame(dataset))
    db.add(ChatMessage(dataset_id=dataset.id, role="user", content=request.question))
    db.add(ChatMessage(dataset_id=dataset.id, role="assistant", content=answer, generated_code=generated_code))
    db.commit()
    return AskResponse(answer=answer, generated_code=generated_code, context_used=context)


@router.get("/datasets/{dataset_id}/project-cost-dashboard", response_model=ProjectCostDashboard)
def dataset_project_cost_dashboard(dataset_id: str, db: Session = Depends(get_db)) -> dict:
    dataset = get_dataset_or_404(db, dataset_id)
    payload = project_cost_dashboard(get_dataset_frame(dataset))
    db.add(AnalysisResult(dataset_id=dataset.id, result_type="project_cost_dashboard", payload=payload))
    db.commit()
    return payload
