import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[5]
HERE = Path(__file__).resolve().parent
DECISIONS = HERE / "batch_011_d015_recommendations.json"
ROLE_SOURCE = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
DOMAIN_SOURCE = ROOT / "data/career-mapping/domain_meta.json"
QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"


class D015UnsupportedDeltaTests(unittest.TestCase):
    def test_exact_active_queue_record_and_new_target_are_documented(self):
        doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        queue = json.loads(QUEUE.read_text(encoding="utf-8"))["queue"]
        roles = json.loads(ROLE_SOURCE.read_text(encoding="utf-8"))
        domains = json.loads(DOMAIN_SOURCE.read_text(encoding="utf-8"))
        keys = {f"{r['domain_id']}|{r['role_name']}": r for r in roles}
        active = {x["role_key"] for x in queue if x["domain_id"] == "D015"} & set(keys)
        self.assertEqual(active, {"D015|investment clerk"})
        d, = doc["decisions"]
        self.assertEqual(d["role_key"], next(iter(active)))
        self.assertTrue(keys[d["role_key"]].get("description", "").strip())
        self.assertEqual(d["recommendation"], "reclassify_exact")
        self.assertEqual(d["alternative_exact_key"], "D062|investment clerk")
        self.assertIn("D062", domains)
        self.assertFalse(d["alternative_target_currently_exists"])
        self.assertIn("43-4011.00", " ".join(d["source_refs"]))

    def test_recommendation_does_not_edit_canonical_data(self):
        doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        self.assertFalse(doc["canonical_changes_applied"])
        self.assertEqual(doc["jurisdiction"], "global_only")


if __name__ == "__main__":
    unittest.main()
