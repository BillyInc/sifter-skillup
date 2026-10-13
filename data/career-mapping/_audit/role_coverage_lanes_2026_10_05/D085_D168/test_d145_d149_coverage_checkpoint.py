import json
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[5]
CHECKPOINT = HERE / "D145_D149_coverage_checkpoint_2026_10_06.md"
QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/D085_D168/D085_D168_role_fit_queue_2026_10_05.json"
STRUCTURE = ROOT / "data/career-mapping/domain_structure.json"


class D145D149CoverageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))["unresolved_rows"]
        cls.structure = json.loads(STRUCTURE.read_text(encoding="utf-8"))
        cls.checkpoint = CHECKPOINT.read_text(encoding="utf-8")

    def test_exact_five_domain_range_and_active_counts(self):
        expected = {"D145": 12, "D146": 13, "D147": 15, "D148": 18, "D149": 12}
        for did, count in expected.items():
            with self.subTest(domain=did):
                rows = {r["role_key"] for r in self.queue if r["domain_id"] == did}
                self.assertEqual(count, len(rows))
                self.assertEqual(count, self.structure[did]["role_count"])
                self.assertIn(did, self.checkpoint)

    def test_source_backed_candidates_and_limits_are_documented(self):
        for marker in (
            "D145 — neural engineer / BCI research engineer",
            "D146 — building commissioning professional/authority",
            "D148 — ROV Pilot/Technician and offshore surveyor",
            "No canonical domain, subgroup, or role data was changed",
            "No Nigerian sources were used",
            "Parent-domain fit must be independently task-audited",
        ):
            self.assertIn(marker, self.checkpoint)
        for url in (
            "https://bcisociety.org/bci-definition/",
            "https://www.ashrae.org/professional-development/ashrae-certification/certification-types",
            "https://www.isa.org/about-isa/what-is-automation",
            "https://www.imca-int.com/skills/freelance-portfolios/",
            "https://careers.un.org/talentpipeline/description/67efa8cb80ebc3000b4d1817",
        ):
            self.assertIn(url, self.checkpoint)

    def test_scope_does_not_promote_titles_or_infer_subgroup_fit(self):
        self.assertIn("No titles are approved for canonical addition", self.checkpoint)
        self.assertIn("subgroup membership is not evidence of fit", self.checkpoint)


if __name__ == "__main__":
    unittest.main()
