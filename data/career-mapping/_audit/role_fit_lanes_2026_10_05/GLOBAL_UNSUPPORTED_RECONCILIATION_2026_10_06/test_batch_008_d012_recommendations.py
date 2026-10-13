import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[5]
HERE = Path(__file__).resolve().parent
DECISIONS = HERE / "batch_008_d012_recommendations.json"
ROLE_SOURCE = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"


class D012UnsupportedDeltaTests(unittest.TestCase):
    def test_exact_active_queue_key_and_link_only_recommendation(self):
        doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        queue = json.loads(QUEUE.read_text(encoding="utf-8"))["queue"]
        roles = json.loads(ROLE_SOURCE.read_text(encoding="utf-8"))
        keys = {f"{r['domain_id']}|{r['role_name']}": r for r in roles}
        d012_queue = {x["role_key"] for x in queue if x["domain_id"] == "D012"}
        active = d012_queue & set(keys)
        stale = d012_queue - set(keys)
        self.assertEqual(active, {"D012|Securities, Commodities, and Financial Services Sales Agents"})
        self.assertEqual(stale, {x["role_key"] for x in doc["stale_queue_records"]})
        self.assertTrue(all(not x["current_key_verified"] for x in doc["stale_queue_records"]))
        d, = doc["decisions"]
        self.assertEqual(d["role_key"], next(iter(active)))
        self.assertIn(d["role_key"], keys)
        self.assertTrue(keys[d["role_key"]].get("description"))
        self.assertEqual(d["recommendation"], "remove_link_only")
        self.assertIsNone(d["alternative_exact_key"])
        self.assertFalse(doc["canonical_changes_applied"])
        self.assertEqual(doc["jurisdiction"], "global_only")


if __name__ == "__main__":
    unittest.main()
