import json
import unittest
from pathlib import Path


HERE = Path(__file__).parent
WORKLIST = HERE / "D113_D168_nigerian_context_worklist_2026_10_06.json"
EVIDENCE = HERE / "D113_D168_nigerian_context_evidence_2026_10_06.json"


class D113D168NigerianContextEvidenceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.worklist = json.loads(WORKLIST.read_text(encoding="utf-8"))
        cls.evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))

    def test_lane_and_counts_are_exhaustive(self):
        self.assertEqual(self.evidence["lane"], "D113_D168")
        self.assertEqual(self.evidence["counts"]["domains"], 56)
        self.assertEqual(self.evidence["counts"]["approved_global_areas"], 213)
        domains = {d["domain_id"] for d in self.worklist["domains"]}
        domain_records = [r for r in self.evidence["records"] if r["scope"] == "domain"]
        area_records = [r for r in self.evidence["records"] if r["scope"] == "area"]
        self.assertEqual({r["domain_id"] for r in domain_records}, domains)
        expected_areas = {
            (d["domain_id"], a["label"])
            for d in self.worklist["domains"]
            for a in d.get("approved_global_specialization_areas", [])
        }
        actual_areas = {(r["domain_id"], r["area_of_specialization"]) for r in area_records}
        self.assertEqual(actual_areas, expected_areas)

    def test_required_evidence_fields_are_present(self):
        required = (
            "authoritative_nigerian_url",
            "source_title",
            "locator",
            "exact_nigerian_claim",
            "scope",
            "limitation",
            "disposition",
        )
        for record in self.evidence["records"]:
            for field in required:
                self.assertTrue(record.get(field), (record["record_id"], field))
            self.assertTrue(record["global_area_label_preserved"])

    def test_area_dispositions_do_not_promote_parent_evidence(self):
        areas = [r for r in self.evidence["records"] if r["scope"] == "area"]
        for record in areas:
            if record["disposition"] != "nigeria_specific_overlay_supported":
                self.assertFalse(record.get("area_evidence_direct", False))
                self.assertIn("area", record["limitation"].casefold())
        supported = [r for r in areas if r["disposition"] == "nigeria_specific_overlay_supported"]
        self.assertEqual(len(supported), 2)
        self.assertTrue(all(r["source_id"] == "ng_nnra" for r in supported))

    def test_scope_excludes_role_and_canonical_edits(self):
        self.assertIn("no global taxonomy", self.evidence["scope"])
        self.assertTrue(self.evidence["source_policy"]["existing_leads_are_not_proof"])
        self.assertTrue(self.evidence["source_policy"]["domain_evidence_not_promoted_to_area"])
        for record in self.evidence["records"]:
            self.assertNotIn("role_name", record)
            self.assertNotIn("role_key", record)


if __name__ == "__main__":
    unittest.main()
