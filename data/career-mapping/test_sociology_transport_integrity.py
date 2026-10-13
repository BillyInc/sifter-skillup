"""Focused local tests for Sociology contextual SQL transport integrity."""

from __future__ import annotations

import gzip
import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


SCRIPT_PATH = Path(__file__).with_name("_audit_sociology_student_guidance_contract.py")
SPEC = importlib.util.spec_from_file_location("sociology_guidance_audit", SCRIPT_PATH)
assert SPEC and SPEC.loader
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)


class SociologyTransportIntegrityTests(unittest.TestCase):
    def test_research_theme_course_locators_are_preserved_in_contract_and_seed(self) -> None:
        root = Path(__file__).resolve().parent
        contract_path = root / "_audit" / "sociology_curriculum_contract_2026-09-17.json"
        seed_path = root.parent.parent / "backend" / "seed_sociology_curriculum_contract_2026-09-17.sql"
        contract = json.loads(contract_path.read_text(encoding="utf-8"))
        expected = {
            "SSC 302": "Original CCMAS source: Sociology; SSC 302; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed p. 333",
            "SOC 301": "Original CCMAS source: Sociology; SOC 301; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed pp. 334–335",
            "SSC 401": "Original CCMAS source: Sociology; SSC 401; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed p. 337",
            "SOC 408": "Original CCMAS source: Sociology; SOC 408; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed p. 338",
        }
        courses = {row.get("code"): row for row in contract["programme"]["courses"]}
        seed = seed_path.read_text(encoding="utf-8")
        for code, locator in expected.items():
            with self.subTest(course_code=code):
                self.assertEqual(locator, courses[code]["sourceLocator"].get("sourceLocatorText"))
                self.assertIn(locator, seed)

    def test_checksum_drift_is_reported(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            parts_dir = Path(directory)
            original = b"BEGIN;\nCOMMIT;\n"
            path = parts_dir / "part-001.sql.gz"
            with gzip.open(path, "wb") as handle:
                handle.write(original)
            manifest = {
                "parts": [
                    {
                        "file": "backend/seed_career_context_items_v1_parts/part-001.sql.gz",
                        "part": 1,
                        "bytes": path.stat().st_size,
                        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                    }
                ]
            }

            with gzip.open(path, "wb") as handle:
                handle.write(b"BEGIN;\n-- changed\nCOMMIT;\n")

            report = AUDIT.transport_integrity_report(parts_dir, manifest)

        self.assertFalse(report["integrity_ok"])
        self.assertEqual(["part-001.sql.gz"], [row["part"] for row in report["sha256_mismatches"]])

    def test_current_transport_report_is_deterministic(self) -> None:
        first = AUDIT.contextual_seed_transport_audit()
        second = AUDIT.contextual_seed_transport_audit()
        self.assertEqual(first, second)
        self.assertIn("integrity_ok", first)
        self.assertIn("integrity", first)


if __name__ == "__main__":
    unittest.main()
