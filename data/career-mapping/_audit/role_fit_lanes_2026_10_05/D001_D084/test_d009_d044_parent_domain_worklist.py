"""Exact-queue, evidence-join, and semantic decision validation for D009-D044."""
from __future__ import annotations

import collections
import json
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
INVENTORY = json.loads((HERE / "D001_D084_inventory_and_triage.json").read_text(encoding="utf-8"))
WORKLIST = json.loads((HERE / "D009_D044_parent_domain_review_worklist.json").read_text(encoding="utf-8"))
ALLOWED = {"supported", "conditional", "unsupported", "unresolved"}
FIRST, LAST = 9, 44


def expected_by_domain() -> dict[str, list[str]]:
    result: dict[str, list[str]] = collections.defaultdict(list)
    for row in INVENTORY["records"]:
        n = int(row["domain_id"][1:])
        if FIRST <= n <= LAST:
            result[row["domain_id"]].append(row["role_key"])
    return dict(result)


class D009D044WorklistTests(unittest.TestCase):
    def test_worklist_exact_coverage_has_no_duplicate_or_omitted_mappings(self):
        expected = [key for keys in expected_by_domain().values() for key in keys]
        actual = [row["role_key"] for row in WORKLIST["role_mappings"]]
        self.assertEqual(len(actual), len(set(actual)), "duplicate worklist role_key")
        self.assertCountEqual(actual, expected)
        self.assertEqual(len(actual), len(expected))
        self.assertEqual(WORKLIST["counts"]["role_mappings"], len(expected))
        reviewed = [row for row in WORKLIST["role_mappings"] if row["review_status"] == "reviewed"]
        pending = [row for row in WORKLIST["role_mappings"] if row["review_status"] == "not_reviewed_in_D009_D044_block"]
        self.assertEqual(len(reviewed), WORKLIST["counts"]["reviewed_role_mappings"])
        self.assertEqual(len(pending), WORKLIST["counts"]["remaining_role_mappings"])
        self.assertEqual(len(reviewed) + len(pending), len(expected))
        self.assertTrue(all(row["domain_fit_status"] in ALLOWED and row["decision_artifact"] for row in reviewed))

    def test_worklist_joins_tasks_and_deduplicated_sources_without_deciding_fit(self):
        source_refs = set(WORKLIST["source_payloads"])
        expected_rows = {row["role_key"]: row for row in INVENTORY["records"] if FIRST <= int(row["domain_id"][1:]) <= LAST}
        saved_decisions = {}
        for domain_id in expected_by_domain():
            decision_path = HERE / f"{domain_id}_role_domain_fit_2026_10_05.json"
            if decision_path.exists():
                artifact = json.loads(decision_path.read_text(encoding="utf-8"))
                for decision in artifact["decisions"]:
                    saved_decisions[decision["role_key"]] = (decision["domain_fit_status"], decision_path.name)
        for row in WORKLIST["role_mappings"]:
            with self.subTest(role_key=row["role_key"]):
                source = expected_rows[row["role_key"]]
                self.assertTrue(row["parent_domain_scope"])
                self.assertEqual(row["role_task_text"], source.get("role_description") or "")
                self.assertTrue(set(row["task_source_refs"]).issubset(source_refs))
                self.assertNotIn("canonical_review_metadata", row)
                self.assertFalse(any("specialization" in key.lower() or "subgroup" in key.lower() for key in row))
                if row["role_key"] in saved_decisions:
                    self.assertEqual(row["review_status"], "reviewed")
                    self.assertEqual((row["domain_fit_status"], row["decision_artifact"]), saved_decisions[row["role_key"]])
                else:
                    self.assertEqual(row["review_status"], "not_reviewed_in_D009_D044_block")
                    self.assertIsNone(row["domain_fit_status"])
                    self.assertIsNone(row["decision_artifact"])

    def test_any_saved_domain_decision_has_exact_key_coverage_and_valid_evidence(self):
        expected = expected_by_domain()
        for domain_id, expected_keys in expected.items():
            path = HERE / f"{domain_id}_role_domain_fit_2026_10_05.json"
            if not path.exists():
                continue
            artifact = json.loads(path.read_text(encoding="utf-8"))
            decisions = artifact["decisions"]
            actual_keys = [row["role_key"] for row in decisions]
            with self.subTest(domain_id=domain_id):
                self.assertEqual(len(actual_keys), len(set(actual_keys)), "duplicate decision role_key")
                self.assertCountEqual(actual_keys, expected_keys)
                self.assertEqual(len(actual_keys), len(expected_keys))
                self.assertEqual(artifact["counts"]["reviewed_role_mappings"], len(expected_keys))
                counts = collections.Counter(row["domain_fit_status"] for row in decisions)
                self.assertTrue(set(counts).issubset(ALLOWED))
                self.assertEqual(sum(counts.values()), len(expected_keys))
                self.assertEqual({key: value for key, value in artifact["counts"].items() if key in ALLOWED and value}, dict(counts))
                for row in decisions:
                    self.assertTrue(row.get("task_evidence"))
                    self.assertTrue(row.get("basis"))
                    self.assertTrue(row.get("source_refs"))
                    self.assertTrue(row.get("source_limit"))
                    self.assertFalse(any("specialization" in key.lower() or "subgroup" in key.lower() for key in row))


if __name__ == "__main__":
    unittest.main()
