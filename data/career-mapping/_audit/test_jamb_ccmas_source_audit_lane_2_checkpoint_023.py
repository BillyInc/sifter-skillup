import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCIENCES_TEXT = ROOT / "_jamb_txt" / "Sciences.txt"
OFFERINGS = ROOT / "jamb" / "sciences_offerings.json"


def test_checkpoint_023_local_locator_is_the_exact_jamb_title_and_awarder_block():
    lines = SCIENCES_TEXT.read_text(encoding="cp1252").split(chr(10))
    source_block = "\n".join(lines[410:416])
    assert "BIOCHEMISTRY AND" in source_block
    assert "MOLECULAR BIOLOGY" in source_block
    for institution in ("DOU", "HENSARD", "ZAMFARA"):
        assert institution in source_block
    next_entry = "\n".join(lines[416:420])
    assert "BIOTECHNOLOGY AND" in next_entry
    assert "FUHS-ILA" in next_entry


def test_checkpoint_026_confirms_current_biochemistry_locator_after_reconciliation():
    data = json.loads(OFFERINGS.read_text(encoding="utf-8"))
    row = next(p for p in data["programmes"] if p["jamb_name"].upper() == "BIOCHEMISTRY AND MOLECULAR BIOLOGY")
    assert row["institutions"] == ["DOU", "HENSARD", "ZAMFARA"]
    assert row["source_locator"].startswith(("Sciences.txt:411-416", "Sciences.txt:419-423"))
    correction = json.loads(
        (AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_026.json").read_text(encoding="utf-8")
    )
    corrected = correction["source_observations"][1]
    assert corrected["identity_row"] == 143
    assert corrected["disposition"] == "confirmed_match_exact_cell_locator_currently_reconciled"
    assert corrected["lf_only_equivalent_excerpt"].startswith("LF-only lines 411-416")
