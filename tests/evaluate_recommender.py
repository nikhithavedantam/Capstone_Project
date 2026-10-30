
from backend.recommender import get_recommendations


def main():
    product_code = "21731"
    top_n = 5

    recommendations = get_recommendations(product_code, top_n)

    print("Offline Recommendation Evaluation")
    print("---------------------------------")
    print(f"Input product: {product_code}")
    print(f"Requested recommendations: {top_n}")
    print(f"Recommendations returned: {len(recommendations)}")

    if recommendations:
        print("\nRecommended products:")
        for item in recommendations:
            print(
                f"StockCode: {item['stock_code']}, "
                f"Similarity score: {item['score']}"
            )
    else:
        print("No recommendations available.")


if __name__ == "__main__":
    main()
