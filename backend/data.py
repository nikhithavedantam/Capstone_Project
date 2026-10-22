
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data" / "raw" / "Online Retail.xlsx"
OUTPUT = ROOT / "data" / "processed" / "transactions.csv"


def load_data():
    df = pd.read_excel(SOURCE)

    df.columns = df.columns.str.strip()
    df["InvoiceDate"] = pd.to_datetime(
        df["InvoiceDate"], errors="coerce"
    )

    for col in ["Quantity", "UnitPrice"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(
        subset=[
            "InvoiceNo",
            "StockCode",
            "InvoiceDate",
            "Quantity",
            "UnitPrice",
        ]
    )

    df = df.drop_duplicates()
    df = df[
        ~df["InvoiceNo"].astype(str).str.startswith("C")
    ]
    df = df[
        (df["Quantity"] > 0) & (df["UnitPrice"] > 0)
    ].copy()

    df["Revenue"] = df["Quantity"] * df["UnitPrice"]

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT, index=False)

    print("Rows:", len(df))
    print("Products:", df["StockCode"].nunique())
    print("Invoices:", df["InvoiceNo"].nunique())
    print("Revenue:", round(df["Revenue"].sum(), 2))
    print("Saved to:", OUTPUT)

    return df


if __name__ == "__main__":
    load_data()
