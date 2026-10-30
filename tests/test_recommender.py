
import unittest

from backend.recommender import get_recommendations


class TestRecommender(unittest.TestCase):

    def test_valid_product(self):
        results = get_recommendations("21731", 5)
        self.assertIsInstance(results, list)
        self.assertLessEqual(len(results), 5)

        for item in results:
            self.assertIn("stock_code", item)
            self.assertIn("score", item)
            self.assertNotEqual(item["stock_code"], "21731")

    def test_unknown_product(self):
        self.assertEqual(
            get_recommendations("UNKNOWN_PRODUCT", 5), []
        )

    def test_empty_product(self):
        self.assertEqual(get_recommendations("", 5), [])

    def test_invalid_top_n(self):
        with self.assertRaises(ValueError):
            get_recommendations("21731", 0)

    def test_results_are_sorted(self):
        results = get_recommendations("21731", 5)
        scores = [item["score"] for item in results]
        self.assertEqual(scores, sorted(scores, reverse=True))


if __name__ == "__main__":
    unittest.main()
