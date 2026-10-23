
from pathlib import Path

import pandas as pd


# Locate the project root independently of the current terminal directory.
ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "processed" / "transactions.csv"


def _load_transactions() -> pd.DataFrame:
    """Load the processed transactions CSV or raise a clear error."""
    if not DATA_FILE.is_file():
        raise FileNotFoundError(
            f"Processed dataset not found: {DATA_FILE}. "
            "Run 'python -m backend.data' first."
        )

    df = pd.read_csv(
        DATA_FILE,
        dtype={"InvoiceNo": "string"},
        low_memory=False,
    )

    required_columns = {
        "InvoiceNo",
        "StockCode",
        "Revenue",
    }
    missing_columns = required_columns - set(df.columns)

    if missing_columns:
        raise ValueError(
            f"Dataset is missing required columns: "
            f"{', '.join(sorted(missing_columns))}"
        )

    return df


def get_sales_summary() -> dict:
    """
    Return overall sales metrics from the processed transactions CSV.

    Returns:
        dict: total_revenue (float), total_transactions (int),
        unique_products (int), and unique_customers (int).

    Revenue is gross retained line-item revenue, not profit.
    Missing CustomerID values are excluded from the customer count.
    """
    df = _load_transactions()

    revenue = pd.to_numeric(df["Revenue"], errors="coerce")
    total_revenue = float(revenue.sum())

    unique_transactions = int(df["InvoiceNo"].nunique())
    unique_products = int(df["StockCode"].nunique())

    if "CustomerID" in df.columns:
        unique_customers = int(df["CustomerID"].nunique())
    else:
        unique_customers = 0

    return {
        "total_revenue": round(total_revenue, 2),
        "total_transactions": unique_transactions,
        "unique_products": unique_products,
        "unique_customers": unique_customers,
    }


def get_monthly_sales() -> list[dict]:
    """
    Return monthly gross revenue in chronological order.

    Returns:
        list[dict]: Each dictionary contains:
            Month (str): Calendar month in YYYY-MM format.
            Revenue (float): Gross retained line-item revenue.

    Rows with invalid or missing InvoiceDate values are excluded.
    """
    df = _load_transactions()

    required_columns = {"InvoiceDate", "Revenue"}
    missing_columns = required_columns - set(df.columns)

    if missing_columns:
        raise ValueError(
            f"Dataset is missing required columns: "
            f"{', '.join(sorted(missing_columns))}"
        )

    df["InvoiceDate"] = pd.to_datetime(
        df["InvoiceDate"], errors="coerce"
    )
    df["Revenue"] = pd.to_numeric(
        df["Revenue"], errors="coerce"
    )

    df = df.dropna(subset=["InvoiceDate", "Revenue"]).copy()

    df["Month"] = df["InvoiceDate"].dt.to_period("M")

    monthly = (
        df.groupby("Month", as_index=False)["Revenue"]
        .sum()
        .sort_values("Month")
    )

    return [
        {
            "Month": row.Month.strftime("%Y-%m"),
            "Revenue": round(float(row.Revenue), 2),
        }
        for row in monthly.itertuples(index=False)
    ]


def get_top_products(top_n: int = 10) -> list[dict]:
    """
    Return the top-selling products ranked by gross revenue.

    Args:
        top_n: Number of products to return. Must be a positive integer.

    Returns:
        list[dict]: Product records containing StockCode, Revenue,
        Quantity, and Description when available.
    """
    if isinstance(top_n, bool) or not isinstance(top_n, int) or top_n <= 0:
        raise ValueError("top_n must be a positive integer.")

    df = _load_transactions()

    required_columns = {"StockCode", "Revenue", "Quantity"}
    missing_columns = required_columns - set(df.columns)

    if missing_columns:
        raise ValueError(
            f"Dataset is missing required columns: "
            f"{', '.join(sorted(missing_columns))}"
        )

    df["Revenue"] = pd.to_numeric(df["Revenue"], errors="coerce")
    df["Quantity"] = pd.to_numeric(df["Quantity"], errors="coerce")
    df = df.dropna(subset=["StockCode", "Revenue", "Quantity"]).copy()

    # Include product descriptions when the dataset provides them.
    group_columns = ["StockCode"]
    if "Description" in df.columns:
        df["Description"] = df["Description"].fillna("Unknown")
        group_columns.append("Description")

    products = (
        df.groupby(group_columns, as_index=False)
        .agg(
            Revenue=("Revenue", "sum"),
            Quantity=("Quantity", "sum"),
        )
        .sort_values("Revenue", ascending=False)
        .head(top_n)
    )

    products["Revenue"] = products["Revenue"].round(2)

    return products.to_dict(orient="records")
