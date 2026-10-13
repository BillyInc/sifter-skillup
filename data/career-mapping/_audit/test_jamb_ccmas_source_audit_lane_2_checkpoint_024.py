import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
TEXT = ROOT / "_jamb_txt" / "Sciences.txt"
OFFERINGS = ROOT / "jamb" / "sciences_offerings.json"


def _lf_lines():
    return TEXT.read_text(encoding="cp1252").split(chr(10))


def test_checkpoint_024_corrects_021_and_023_using_lf_delimited_source_lines():
    lines = _lf_lines()
    row141 = "\n".join(lines[8003:8022])
    assert "PURE AND APPLIED" in row141
    assert "MATHEMATICS" in row141
    for institution in ("BENIN", "LAUTECH", "PHC", "PAUL"):
        assert institution in row141

    row143 = "\n".join(lines[410:416])
    assert "BIOCHEMISTRY AND" in row143
    assert "MOLECULAR BIOLOGY" in row143
    for institution in ("DOU", "HENSARD", "ZAMFARA"):
        assert institution in row143

    correction = json.loads(
        (AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_024.json").read_text(encoding="utf-8")
    )
    assert correction["supersedes"][0]["checkpoint"] == 21
    assert correction["supersedes"][1]["checkpoint"] == 23
    assert correction["repair_handoff"]["shared_product_ledgers_edited"] is False


def test_checkpoint_028_records_identity_142_reconciliation_completion():
    rows = json.loads(OFFERINGS.read_text(encoding="utf-8"))["programmes"]
    row = next(p for p in rows if p["jamb_name"] == "Computer Science and Information Technology")
    assert row["institutions"] == ["ACHIEVERS", "BABCOCK", "IGBINEDION", "OAUSTECH"]
    assert row["source_context_status"] == "source_text_confirmed"
    assert row["source_url"].endswith("brochure-degree-sciences.pdf")
    assert "printed pp. 623-624" in row["source_locator"]

    latest = json.loads(
        (AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_026.json").read_text(encoding="utf-8")
    )
    assert latest["separate_open_finding"]["disposition"] == "confirmed_source_cell_but_local_evidence_state_held"
    current = json.loads(
        (AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_028.json").read_text(encoding="utf-8")
    )
    assert current["current_worktree_observation"]["disposition"] == "previous_evidence_hold_reconciled_in_current_worktree"
