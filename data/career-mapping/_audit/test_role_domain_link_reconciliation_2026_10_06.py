import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LEDGER = ROOT / "_audit" / "role_fit_lanes_2026_10_05" / "GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06"
REPORT = ROOT / "_audit" / "role_domain_link_reconciliation_2026_10_06.json"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def decisions():
    result = []
    for path in sorted(LEDGER.glob("batch_*_*.json")):
        if "recommendations" not in path.name and "carryforward" not in path.name:
            continue
        result.extend(read(path).get("decisions") or [])
    return result


def action(row):
    return row.get("action") or row.get("recommendation") or row.get("lane_recommendation")


def role_rows():
    rows = []
    for name in ("role_library_v3_cleaned.json", "emerging_role_overlays.json", "thin_domain_role_overlays.json"):
        document = read(ROOT / name)
        rows.extend(document if isinstance(document, list) else document.get("roles") or [])
    return rows


class RoleDomainReconciliationTest(unittest.TestCase):
    def test_all_decisions_are_unique_and_reported(self):
        rows = decisions()
        keys = [row["role_key"] for row in rows]
        self.assertEqual(len(rows), 543)
        self.assertEqual(len(keys), len(set(keys)))
        report = read(REPORT)
        self.assertEqual(report["decision_count"], 543)
        self.assertEqual(report["excluded_current_links"], 504)

    def test_every_actionable_current_link_is_excluded(self):
        by_key = {f"{row.get('domain_id')}|{row.get('role_name')}": row for row in role_rows()}
        for decision in decisions():
            if action(decision) not in {"remove_link_only", "preserve_exclude", "reclassify_exact"}:
                continue
            row = by_key[decision["role_key"]]
            self.assertEqual(row.get("student_path_status"), "excluded", decision["role_key"])
            self.assertTrue(
                "Global role-to-domain reconciliation 2026-10-06" in row.get("student_path_exclusion_reason", "")
                or decision["role_key"] == "D078|biometrician",
                decision["role_key"],
            )

    def test_reclassification_targets_exist_and_are_pending_specialization_review(self):
        by_key = {f"{row.get('domain_id')}|{row.get('role_name')}": row for row in role_rows()}
        report = read(REPORT)
        added_targets = {
            row["target_key"]
            for row in report["changes"]
            if row.get("action") == "reclassify_exact" and row.get("target_status") == "added"
        }
        for decision in decisions():
            if action(decision) != "reclassify_exact":
                continue
            target = decision["alternative_exact_key"]
            self.assertIn(target, by_key, target)
            row = by_key[target]
            if target in added_targets:
                self.assertIn(
                    row.get("role_domain_reconciliation_status"),
                    {"reclassified_in", "reclassified_in_route_pending"},
                    target,
                )
                self.assertIn(
                    row.get("specialization_fit_review_status"),
                    {"review_required", "not_applicable", "supported", "conditional"},
                    target,
                )

    def test_no_duplicate_exact_keys_were_created(self):
        keys = [f"{row.get('domain_id')}|{row.get('role_name')}" for row in role_rows()]
        # Three duplicate source rows predate this reconciliation. The apply
        # step must not create any new duplicate for a target it added.
        duplicate_keys = {key for key in keys if keys.count(key) > 1}
        self.assertEqual(
            duplicate_keys,
            {"D025|industrial pharmacist", "D025|hospital pharmacist", "D123|radiation therapist"},
        )


if __name__ == "__main__":
    unittest.main()
