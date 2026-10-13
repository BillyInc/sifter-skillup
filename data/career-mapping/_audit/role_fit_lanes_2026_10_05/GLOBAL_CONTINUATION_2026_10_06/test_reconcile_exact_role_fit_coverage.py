import importlib.util
import json
import unittest
from pathlib import Path

SCRIPT = Path(__file__).with_name("reconcile_exact_role_fit_coverage.py")
SPEC = importlib.util.spec_from_file_location("role_fit_reconcile", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class ExactRoleFitCoverageTests(unittest.TestCase):
    def test_nested_decisions_are_read_without_using_parent_membership(self):
        doc = {"decisions": [{"role_key": "D1|Role", "domain_fit_status": "supported"}]}
        rows = list(MODULE.iter_decisions(doc))
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0][0]["role_key"], "D1|Role")
        self.assertEqual(rows[0][1], "supported")

    def test_only_exact_status_fields_are_read(self):
        doc = {"role_key": "D1|Role", "subgroup_fit_status": "supported"}
        record, status = next(MODULE.iter_decisions(doc))
        self.assertEqual(record["role_key"], "D1|Role")
        self.assertIsNone(status)

    def test_resolved_and_unresolved_status_sets_are_disjoint(self):
        self.assertFalse(MODULE.RESOLVED & MODULE.UNRESOLVED)

    def test_increment_dispositions_are_unique_exact_key_and_evidence_complete(self):
        files = sorted(SCRIPT.parent.glob("role_domain_fit_dispositions_increment_*.json"))
        decisions = [row for path in files for row in json.loads(path.read_text(encoding="utf-8"))["decisions"]]
        keys = [row["role_key"] for row in decisions]
        self.assertEqual(len(keys), len(set(keys)))
        for row in decisions:
            self.assertIn(row["domain_fit_status"], MODULE.RESOLVED | {"unresolved"})
            self.assertTrue(row["task_evidence"].strip())
            self.assertTrue(row["rationale"].strip())
            self.assertTrue(row["source_limits"].strip())
            self.assertTrue(row["source_refs"])
            self.assertTrue(all(ref.get("url", "").startswith("https://") for ref in row["source_refs"]))
            self.assertTrue(all(ref.get("use") for ref in row["source_refs"]))
        self.assertEqual(len(decisions), 44)

    def test_reconciliation_applies_increment_decisions_to_exact_catalogue(self):
        import subprocess
        import sys

        completed = subprocess.run([sys.executable, str(SCRIPT)], check=True, capture_output=True, text=True)
        result = json.loads(completed.stdout)
        self.assertEqual(result["canonical_exact_role_keys"], 3919)
        self.assertEqual(result["remaining_rows"], 11)
        self.assertEqual(result["status_conflicts"], 0)


if __name__ == "__main__":
    unittest.main()
