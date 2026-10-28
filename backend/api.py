
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException

app = FastAPI(
    title="E-Commerce Sales Analytics API",
    description="Sales insights and product recommendations",
    version="1.0.0",
)

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "data" / "processed" / "transactions.csv"


def load_transactions():
    if not DATA_PATH.exists():
        raise HTTPException(
            status_code=503,
            detail="Cleaned dataset not found. Run python -m backend.data first.",
        )

    return pd.read_csv(DATA_PATH, dtype={"InvoiceNo": "string"}, low_memory=False)


@app.get("/")
def health_check():
    return {"status": "running", "project": "E-Commerce Analytics"}


@app.get("/analytics/summary")
def sales_summary():
    df = load_transactions()

    return {
        "total_revenue": round(float(df["Revenue"].sum()), 2),
        "total_transactions": int(df["InvoiceNo"].nunique()),
        "unique_products": int(df["StockCode"].nunique()),
        "unique_customers": int(df["CustomerID"].nunique()),
    }
