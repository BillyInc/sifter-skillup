import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[5]
HERE = Path(__file__).resolve().parent
DECISIONS = HERE / "batch_015_d025_recommendations.json"
ROLE_SOURCE = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"


class D025UnsupportedDeltaTests(unittest.TestCase):
    def test_batch_is_exact_active_d025_queue_entry(self):
        doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        queue = json.loads(QUEUE.read_text(encoding="utf-8"))["queue"]
        roles = json.loads(ROLE_SOURCE.read_text(encoding="utf-8"))
        keys = {f"{r['domain_id']}|{r['role_name']}": r for r in roles}
        active = {x["role_key"] for x in queue if x["domain_id"] == "D025"} & set(keys)
        self.assertEqual(active, {"D025|pharmaceutical sales representative"})
        d, = doc["decisions"]
        self.assertEqual(d["role_key"], next(iter(active)))
        self.assertTrue(keys[d["role_key"]].get("description", "").strip())
        self.assertEqual(d["recommendation"], "remove_link_only")
        self.assertIsNone(d["alternative_exact_key"])
        self.assertIn("41-4011.00", " ".join(d["source_refs"]))

    def test_no_canonical_edits_or_global_role_deletion(self):
        doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        self.assertFalse(doc["canonical_changes_applied"])
        self.assertEqual(doc["jurisdiction"], "global_only")


if __name__ == "__main__":
    unittest.main()
