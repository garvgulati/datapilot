# API Documentation

Base URL: `http://localhost:8000`

Interactive OpenAPI docs are available at `http://localhost:8000/docs` when the backend is running.

## Health

`GET /health`

Returns service status.

## Upload Dataset

`POST /upload`

Content type: `multipart/form-data`

Field:

- `file`: CSV, XLSX, or XLS file.

Response: dataset metadata.

## List Datasets

`GET /datasets`

Returns all uploaded datasets ordered by creation time.

## Dataset Detail

`GET /datasets/{id}`

Returns dataset metadata and column profiles.

## Clean Dataset

`POST /datasets/{id}/clean`

Request body:

```json
{
  "remove_duplicates": true,
  "fill_missing_strategy": "auto",
  "standardize_columns": true,
  "infer_types": true
}
```

Allowed missing value strategies: `auto`, `mean`, `median`, `mode`, `zero`, `blank`.

## Dataset Summary

`GET /datasets/{id}/summary`

Returns dataset metadata, column profile, preview rows, descriptive statistics, missing values by column, and duplicate count.

## Dataset Charts

`GET /datasets/{id}/charts`

Returns KPI cards, bar chart data, line chart data, pie chart data, table preview, outliers, and trends.

## Ask AI Analyst

`POST /datasets/{id}/ask`

Request body:

```json
{
  "question": "Show top 5 cost overruns"
}
```

Response includes:

- `answer`: grounded natural-language answer.
- `generated_code`: Pandas logic when available.
- `context_used`: constrained dataset context.

## Project Cost Dashboard

`GET /datasets/{id}/project-cost-dashboard`

Returns:

- Planned vs actual cost by project.
- Cost variance by project.
- WBS-level cost breakdown.
- Over-budget alerts.
- Executive summary.
