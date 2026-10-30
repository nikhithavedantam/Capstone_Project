
from pathlib import Path
from math import sqrt
from collections import defaultdict
from functools import lru_cache

import pandas as pd


# --------------------------------------------------
# PROJECT PATHS
# --------------------------------------------------

def get_project_root():
    """
    Find the project root directory.

    Works when this module is imported normally or when
    __file__ is unavailable in an interactive environment.
    """
    try:
        current_file = Path(__file__).resolve()
        return current_file.parent.parent
    except NameError:
        current_dir = Path.cwd()

        # Support running from the project root or backend folder.
        if (current_dir / "backend").is_dir():
            return current_dir

        if current_dir.name.lower() == "backend":
            return current_dir.parent

        return current_dir


ROOT = get_project_root()
DATA_PATH = ROOT / "data" / "processed" / "transactions.csv"


# --------------------------------------------------
# PRODUCT CODE NORMALIZATION
# --------------------------------------------------

def _normalise_code(code):
    """Convert a product code into a consistent string."""
    if code is None:
        return None

    try:
        if pd.isna(code):
            return None
    except (TypeError, ValueError):
        return None

    code = str(code).strip()

    if not code or code.lower() in {"nan", "none", "null"}:
        return None

    # Convert numeric codes such as "21731.0" to "21731".
    if code.endswith(".0") and code[:-2].isdigit():
        code = code[:-2]

    return code


# --------------------------------------------------
# DATA LOADING AND MODEL BUILDING
# --------------------------------------------------

@lru_cache(maxsize=4)
def _load_model(file_signature):
    """
    Build item-item cosine similarity from invoice baskets.

    Each product is counted once per invoice. Similarity is
    based on how frequently two products occur together.
    """
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Transaction dataset not found:\n{DATA_PATH}\n\n"
            "From the project root, run:\n"
            "python -m backend.data"
        )

    df = pd.read_csv(
        DATA_PATH,
        dtype={"InvoiceNo": str, "StockCode": str}
    )

    required_columns = {"InvoiceNo", "StockCode"}
    missing_columns = required_columns - set(df.columns)

    if missing_columns:
        raise ValueError(
            "Dataset is missing required columns: "
            + ", ".join(sorted(missing_columns))
        )

    if df.empty:
        raise ValueError("The transaction dataset is empty.")

    df = df.dropna(subset=["InvoiceNo", "StockCode"]).copy()

    df["InvoiceNo"] = df["InvoiceNo"].astype(str).str.strip()
    df["StockCode"] = df["StockCode"].map(_normalise_code)

    df = df[
        (df["InvoiceNo"] != "")
        & df["StockCode"].notna()
    ]

    if df.empty:
        raise ValueError(
            "No valid invoice and product records were found."
        )

    # Create one unique product basket per invoice.
    baskets = (
        df.groupby("InvoiceNo")["StockCode"]
        .apply(lambda codes: sorted(set(codes)))
    )

    product_invoice_count = defaultdict(int)
    cooccurrence_count = defaultdict(int)

    for products in baskets:
        # Number of invoices containing each product.
        for product in products:
            product_invoice_count[product] += 1

        # Number of invoices containing each product pair.
        for index, product_a in enumerate(products):
            for product_b in products[index + 1:]:
                cooccurrence_count[(product_a, product_b)] += 1

    similarities = defaultdict(list)

    # Item-item cosine similarity:
    # co-occurrence(A, B) / sqrt(count(A) * count(B))
    for (product_a, product_b), count in cooccurrence_count.items():
        denominator = sqrt(
            product_invoice_count[product_a]
            * product_invoice_count[product_b]
        )

        if denominator == 0:
            continue

        score = count / denominator
        score = max(0.0, min(1.0, score))

        similarities[product_a].append((product_b, score))
        similarities[product_b].append((product_a, score))

    # Sort by highest similarity, then product code.
    for product in similarities:
        similarities[product].sort(
            key=lambda item: (-item[1], item[0])
        )

    return dict(similarities), set(product_invoice_count)


def _get_model():
    """Load the model and refresh the cache when the CSV changes."""
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Transaction dataset not found:\n{DATA_PATH}\n\n"
            "From the project root, run:\n"
            "python -m backend.data"
        )

    file_stats = DATA_PATH.stat()
    signature = (file_stats.st_mtime_ns, file_stats.st_size)

    return _load_model(signature)


# --------------------------------------------------
# RECOMMENDATION FUNCTION
# --------------------------------------------------

def get_recommendations(stock_code, top_n=5):
    """
    Recommend products frequently purchased with a given product.

    Parameters
    ----------
    stock_code : str or int
        Product code for which recommendations are requested.

    top_n : int, default=5
        Maximum number of products to recommend. Must be a
        positive integer.

    Returns
    -------
    list[dict]
        Example:
        [
            {"stock_code": "21731", "score": 0.65},
            {"stock_code": "22720", "score": 0.42}
        ]

        Scores are normalized cosine similarity values, not
        probabilities or guaranteed purchase likelihoods.

        Unknown products return an empty list.
    """
    if isinstance(top_n, bool) or not isinstance(top_n, int):
        raise ValueError("top_n must be a positive integer.")

    if top_n <= 0:
        raise ValueError("top_n must be a positive integer.")

    query_code = _normalise_code(stock_code)

    if query_code is None:
        return []

    similarities, known_products = _get_model()

    if query_code not in known_products:
        return []

    recommendations = similarities.get(query_code, [])

    results = []

    for recommended_code, score in recommendations:
        # Never recommend the queried product itself.
        if recommended_code == query_code:
            continue

        results.append({
            "stock_code": recommended_code,
            "score": round(float(score), 6)
        })

        if len(results) >= top_n:
            break

    return results


# --------------------------------------------------
# OPTIONAL COMMAND-LINE TEST
# --------------------------------------------------

if __name__ == "__main__":
    print("Recommendation system")
    print(f"Dataset path: {DATA_PATH}")

    try:
        product_code = input(
            "Enter a product StockCode to get recommendations: "
        ).strip()

        recommendations = get_recommendations(product_code, top_n=5)

        if recommendations:
            print("\nRecommended products:")
            for item in recommendations:
                print(
                    f"StockCode: {item['stock_code']}, "
                    f"Similarity score: {item['score']}"
                )
        else:
            print(
                "No recommendations found for this product. "
                "Check the StockCode or try another product."
            )

    except (FileNotFoundError, ValueError) as error:
        print(f"\nError: {error}")
