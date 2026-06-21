"""Upload the SAP-style sample project-cost dataset to a running local API."""

from pathlib import Path

import httpx


API_URL = "http://localhost:8000"
SAMPLE_PATH = Path(__file__).resolve().parents[1] / "data" / "project_cost_sample.csv"


def main() -> None:
    if not SAMPLE_PATH.exists():
        raise FileNotFoundError(f"Sample dataset not found: {SAMPLE_PATH}")

    with SAMPLE_PATH.open("rb") as file:
        response = httpx.post(
            f"{API_URL}/upload",
            files={"file": ("project_cost_sample.csv", file, "text/csv")},
            timeout=30,
        )
    response.raise_for_status()
    dataset = response.json()
    print(f"Seeded dataset: {dataset['name']} ({dataset['id']})")


if __name__ == "__main__":
    main()
