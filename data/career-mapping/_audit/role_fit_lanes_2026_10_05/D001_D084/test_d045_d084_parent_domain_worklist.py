"""Coverage and evidence-join checks for the D045-D084 role audit queue."""
from __future__ import annotations

import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
INVENTORY = json.loads((HERE / "D001_D084_inventory_and_triage.json").read_text(encoding="utf-8"))
WORKLIST = json.loads((HERE / "D045_D084_parent_domain_review_worklist.json").read_text(encoding="utf-8"))
ALLOWED = {"supported", "conditional", "unsupported", "unresolved"}


class D045D084WorklistTests(unittest.TestCase):
    def saved_decision_keys(self):
        result = set()
        for domain_id in {row["domain_id"] for row in WORKLIST["role_mappings"]}:
            for suffix in ("role_domain_fit_review_2026_10_05.json", "role_domain_fit_2026_10_05.json"):
                path = HERE / f"{domain_id}_{suffix}"
                if path.exists():
                    artifact = json.loads(path.read_text(encoding="utf-8"))
                    result.update(row["role_key"] for row in (artifact.get("decisions") or artifact.get("role_reviews") or []))
                    break
        return result

    def test_exact_pending_scope_and_completed_lane_exclusions(self):
        expected = [
            row["role_key"] for row in INVENTORY["records"]
            if 45 <= int(row["domain_id"][1:]) <= 84
        ]
        actual = [row["role_key"] for row in WORKLIST["role_mappings"]]
        self.assertEqual(len(actual), len(set(actual)))
        self.assertCountEqual(actual, expected)
        self.assertEqual(len(actual), len(expected))
        self.assertEqual(WORKLIST["counts"]["role_mappings"], len(expected))
        reviewed = self.saved_decision_keys()
        self.assertEqual(WORKLIST["counts"]["reviewed_role_mappings"], len(reviewed))
        self.assertEqual(WORKLIST["counts"]["pending_role_mappings"], len(expected) - len(reviewed))
        self.assertEqual(len(reviewed), WORKLIST["counts"]["reviewed_role_mappings"])
        self.assertTrue(all(not key.startswith("D001|") and not 9 <= int(key[1:4]) <= 44 for key in actual))
        self.assertNotIn("D045", WORKLIST["domain_counts"])

    def test_every_mapping_has_parent_scope_and_no_inferred_fit(self):
        by_key = {row["role_key"]: row for row in INVENTORY["records"]}
        source_refs = set(WORKLIST["source_payloads"])
        reviewed_keys = self.saved_decision_keys()
        for item in WORKLIST["role_mappings"]:
            source = by_key[item["role_key"]]
            with self.subTest(role_key=item["role_key"]):
                self.assertEqual(item["role_task_text"], source.get("role_description") or "")
                self.assertEqual(item["parent_domain_scope"], source.get("domain_scope") or "")
                self.assertTrue(item["parent_domain_scope"])
                self.assertTrue(set(item["task_source_refs"]).issubset(source_refs))
                self.assertEqual(item["review_status"], "reviewed" if item["role_key"] in reviewed_keys else "pending")
                if item["role_key"] in reviewed_keys:
                    self.assertIn(item["domain_fit_status"], ALLOWED)
                else:
                    self.assertIsNone(item["domain_fit_status"])
                self.assertFalse(any("specialization" in key.lower() or "subgroup" in key.lower() for key in item))

    def test_saved_decision_reports_if_any_are_exact_and_evidenced(self):
        inventory_by_domain = {}
        for row in INVENTORY["records"]:
            n = int(row["domain_id"][1:])
            if 45 <= n <= 84:
                inventory_by_domain.setdefault(row["domain_id"], set()).add(row["role_key"])
        for domain_id, keys in inventory_by_domain.items():
            for suffix in ("role_domain_fit_review_2026_10_05.json", "role_domain_fit_2026_10_05.json"):
                path = HERE / f"{domain_id}_{suffix}"
                if not path.exists():
                    continue
                artifact = json.loads(path.read_text(encoding="utf-8"))
                decisions = artifact.get("decisions") or artifact.get("role_reviews") or []
                actual = [row["role_key"] for row in decisions]
                self.assertEqual(len(actual), len(set(actual)))
                self.assertCountEqual(actual, keys)
                for decision in decisions:
                    self.assertIn(decision.get("domain_fit_status"), ALLOWED)
                    self.assertTrue(decision.get("task_evidence"))
                    self.assertTrue(decision.get("basis"))
                    self.assertTrue(decision.get("source_refs"))
                    self.assertTrue(decision.get("source_limit"))
                    self.assertFalse(any("specialization" in key.lower() or "subgroup" in key.lower() for key in decision))


if __name__ == "__main__":
    unittest.main()
