# Interview Demo Script

## 30-Second Pitch

DataPilot is a full-stack SaaS project that lets business users upload CSV or Excel datasets, automatically clean and profile them, generate dashboards, detect anomalies, and ask natural-language questions using an AI analyst constrained to the uploaded data.

## Demo Flow

1. Open the dashboard and explain that the app is built with Next.js, TypeScript, Tailwind, FastAPI, Pandas, SQLAlchemy, PostgreSQL, Docker, and OpenAI.
2. Go to Upload and import `data/project_cost_sample.csv`.
3. Open the dataset detail page and point out row count, column count, missing values, duplicate count, inferred column types, table preview, and generated charts.
4. Click Clean Data and explain the cleaning pipeline: duplicate removal, missing-value handling, column standardization, and type inference.
5. Open AI Analyst Chat and ask:
   - "Which project exceeded budget?"
   - "Show top 5 cost overruns"
   - "Summarize this dataset"
6. Show that the assistant includes grounded answers and Pandas logic instead of free-form guesses.
7. Open Project Cost Intelligence and walk through planned vs actual spend, variance by project, WBS-level breakdown, over-budget alerts, and the executive summary.
8. Close by explaining how the architecture separates UI, API, analytics services, database models, and AI orchestration for maintainability.

## Technical Talking Points

- FastAPI exposes REST endpoints with Pydantic validation and OpenAPI docs.
- SQLAlchemy models map the required database tables: users, datasets, dataset columns, analysis results, and chat messages.
- Pandas powers cleaning, profiling, KPI generation, outlier detection, and chart payload generation.
- The AI service builds a constrained context from dataset schema, sample rows, KPIs, trends, outliers, and project cost analytics.
- Docker Compose runs PostgreSQL, the API, and the frontend with environment variables and no hardcoded secrets.

## Future Improvements

- Add authentication and row-level user ownership.
- Add background jobs for very large files.
- Add object storage such as S3 for uploaded datasets.
- Add chart configuration by end users.
- Add audit trails for AI responses and generated code execution.
