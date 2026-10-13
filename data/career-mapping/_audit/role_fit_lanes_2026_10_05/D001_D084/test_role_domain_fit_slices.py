"""Exact-key and evidence-shape checks for parent-domain-only lane slices."""
import collections
import json
from pathlib import Path
import unittest


HERE = Path(__file__).resolve().parent
INVENTORY = json.loads((HERE / "D001_D084_inventory_and_triage.json").read_text(encoding="utf-8"))
ALLOWED = {"supported", "conditional", "unsupported", "unresolved"}


class RoleDomainFitSliceTests(unittest.TestCase):
    def test_completed_domain_slices_match_exact_inventory_keys(self):
        for path in sorted(HERE.glob("D0[0-8][0-9]_role_domain_fit_2026_10_05.json")):
            domain_id = path.name[:4]
            with self.subTest(domain_id=domain_id):
                artifact = json.loads(path.read_text(encoding="utf-8"))
                expected_rows = [row for row in INVENTORY["records"] if row.get("domain_id") == domain_id]
                expected = {row["role_key"] for row in expected_rows}
                actual = {row["role_key"] for row in artifact["decisions"]}
                self.assertEqual(expected, actual)
                self.assertEqual(len(expected), artifact["counts"]["reviewed_role_mappings"])
                self.assertEqual({row["domain_name"] for row in expected_rows}, {artifact["domain_name"]})

    def test_decisions_have_task_basis_and_sources_not_subgroup_or_specialization(self):
        for path in sorted(HERE.glob("D0[0-8][0-9]_role_domain_fit_2026_10_05.json")):
            with self.subTest(path=path.name):
                artifact = json.loads(path.read_text(encoding="utf-8"))
                for row in artifact["decisions"]:
                    self.assertIn(row["domain_fit_status"], ALLOWED)
                    self.assertTrue(row.get("task_evidence"))
                    self.assertTrue(row.get("basis"))
                    self.assertTrue(row.get("source_refs"))
                    self.assertTrue(row.get("source_limit"))
                    keys = {key.lower() for key in row}
                    self.assertFalse(any("specialization" in key or "subgroup" in key for key in keys))
                observed = collections.Counter(row["domain_fit_status"] for row in artifact["decisions"])
                self.assertEqual(sum(observed.values()), artifact["counts"]["reviewed_role_mappings"])
                self.assertEqual(dict(observed), {key: value for key, value in artifact["counts"].items() if key in ALLOWED and value})


if __name__ == "__main__":
    unittest.main()
