# DataPilot

Production-quality full-stack SaaS project for uploading CSV/Excel business datasets, cleaning data, generating KPI dashboards, detecting anomalies, and asking natural-language questions through an AI data analyst.

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, Recharts, lucide-react
- Backend: FastAPI, Python, Pandas, SQLAlchemy, Pydantic
- Database: PostgreSQL
- AI: OpenAI API with deterministic local fallback when no key is configured
- Infrastructure: Docker, Docker Compose, environment variables

## Features

- Upload CSV, XLSX, and XLS files.
- View dataset inventory and dataset summaries.
- Clean data by removing duplicates, filling missing values, standardizing column names, and inferring types.
- Generate descriptive statistics, KPI cards, chart data, outliers, trends, and previews.
- Ask natural-language questions grounded only in uploaded dataset context.
- Explore a SAP-style Project Cost Intelligence dashboard.
- Seed and demo with included project-cost sample data.

## 8-Week Project Timeline

This project was planned and built over a retrospective 8-week development window leading up to June 22, 2026.

| Week | Dates | Focus |
| --- | --- | --- |
| Week 1 | Apr 27 - May 3, 2026 | Defined the product concept, target users, resume positioning, core SaaS workflows, and technical architecture. |
| Week 2 | May 4 - May 10, 2026 | Set up the monorepo structure, Docker foundation, FastAPI backend skeleton, Next.js frontend shell, and environment configuration. |
| Week 3 | May 11 - May 17, 2026 | Designed the PostgreSQL data model for users, datasets, dataset columns, analysis results, and chat messages. |
| Week 4 | May 18 - May 24, 2026 | Built CSV/Excel upload, dataset profiling, file storage, validation, and dataset summary APIs. |
| Week 5 | May 25 - May 31, 2026 | Implemented the data cleaning pipeline for duplicate removal, missing-value handling, column standardization, and type inference. |
| Week 6 | Jun 1 - Jun 7, 2026 | Added analytics services for descriptive statistics, KPI cards, outlier detection, trends, table previews, and chart-ready responses. |
| Week 7 | Jun 8 - Jun 14, 2026 | Built the AI analyst chat workflow with constrained dataset context, deterministic fallback answers, and Pandas logic in responses. |
| Week 8 | Jun 15 - Jun 22, 2026 | Completed the SAP-style Project Cost Intelligence dashboard, enterprise UI polish, documentation, demo script, and resume assets. |

## Folder Structure

```text
.
|-- backend/
|   |-- app/
|   |   |-- api/
|   |   |-- core/
|   |   |-- db/
|   |   |-- models/
|   |   |-- schemas/
|   |   `-- services/
|   |-- tests/
|   |-- Dockerfile
|   `-- requirements.txt
|-- frontend/
|   |-- app/
|   |-- components/
|   |-- lib/
|   |-- types/
|   `-- Dockerfile
|-- data/
|   `-- project_cost_sample.csv
|-- docs/
|-- scripts/
|-- docker-compose.yml
`-- .env.example
```

## Quick Start With Docker

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Optional: add `OPENAI_API_KEY` to `.env`.

3. Start the stack:

```bash
docker compose up --build
```

4. Open the app:

- Frontend: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

For local development without Docker, set `DATABASE_URL` in `backend/.env`. The default code can also run with SQLite if you set:

```bash
DATABASE_URL=sqlite:///./enterprise_ai_analyst.db
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```


## Seed Sample Dataset

Start the backend, then run:

```bash
python scripts/seed_sample_dataset.py
```

Or use the Upload page and select:

```text
data/project_cost_sample.csv
```

## Environment Variables

See `.env.example`.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | SQLAlchemy database URL. |
| `OPENAI_API_KEY` | Optional OpenAI API key for AI analyst responses. |
| `OPENAI_MODEL` | Chat model used by the AI service. |
| `STORAGE_DIR` | Directory for uploaded and cleaned datasets. |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins. |
| `NEXT_PUBLIC_API_URL` | Frontend API base URL. |

## API Documentation

See `docs/API.md` or run the backend and open `http://localhost:8000/docs`.

## Architecture

See `docs/ARCHITECTURE.md`.

## Screenshots

See `docs/SCREENSHOTS.md` for screenshot placeholders and capture guidance.

## Resume and Interview Assets

- Resume bullets: `docs/RESUME_BULLETS.md`
- Demo script: `docs/DEMO_SCRIPT.md`

## Notes

- The AI service is intentionally constrained to uploaded dataset context.
- If no OpenAI key is present, demo-friendly deterministic local answers are returned for common project-cost questions.
- Authentication is represented at the database layer with a `users` table but is not wired into the UI yet.
