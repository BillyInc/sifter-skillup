import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"


def test_empty_detail_propagation_was_repaired_and_guarded():
    repair = json.loads((AUDIT / "ambiguous_detail_empty_propagation_guard_2026-09-29.json").read_text(encoding="utf-8"))
    assert repair["count"] == 20
    applied = json.loads((AUDIT / "ccmas_ambiguous_detail_reconciliation_2026-09-29_applied.json").read_text(encoding="utf-8"))
    assert applied["counts"].get("selected_scope_records_changed", 0) == 0
    reconciliation = json.loads((AUDIT / "jamb_ccmas_domain_mapping_reconciliation_2026-09-29.json").read_text(encoding="utf-8"))
    assert reconciliation["counts"].get("issue:selected_course_details_disagree_with_ccmas", 0) == 0
