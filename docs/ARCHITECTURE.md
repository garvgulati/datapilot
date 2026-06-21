# Architecture

```text
Browser / Next.js App
  |
  | REST JSON + multipart uploads
  v
FastAPI Backend
  |
  +-- Upload service
  |     - Validates CSV/XLSX/XLS files
  |     - Stores original and cleaned files
  |
  +-- Data cleaning service
  |     - Removes duplicates
  |     - Fills missing values
  |     - Standardizes column names
  |     - Infers Pandas datatypes
  |
  +-- Analytics service
  |     - Descriptive statistics
  |     - KPI generation
  |     - Outlier detection
  |     - Trend and chart payload generation
  |
  +-- AI analyst service
  |     - Builds constrained dataset context
  |     - Uses OpenAI when configured
  |     - Falls back to deterministic local answers for demos
  |
  v
PostgreSQL
  |
  +-- users
  +-- datasets
  +-- dataset_columns
  +-- analysis_results
  +-- chat_messages

Object/File Storage
  |
  +-- storage/uploads
  +-- storage/cleaned
```

## Runtime Flow

1. A user uploads a CSV or Excel file from the Next.js app.
2. FastAPI stores the file, reads it with Pandas, profiles the dataset, and saves metadata to PostgreSQL.
3. The user can clean the dataset. The backend writes a cleaned CSV copy and records a cleaning report.
4. The analytics engine generates summaries, KPIs, chart-ready JSON, outliers, and trends.
5. The AI analyst chat receives a question plus a constrained context object built from the uploaded dataset.
6. The Project Cost Intelligence dashboard uses SAP-style cost fields to produce executive KPIs, WBS breakdowns, and alerts.
