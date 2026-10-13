import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT_DIR = ROOT / "data/career-mapping/_audit"
LEDGER = ROOT / "data/career-mapping/jamb/medical_offerings.json"
TEXT = ROOT / "data/career-mapping/_jamb_txt/medical.txt"
CHECKPOINT = AUDIT_DIR / "jamb_source_repair_lane_b_incremental_checkpoint_2026-09-28_018.md"


def test_medical_awarder_audit_accounts_for_all_rows_and_keeps_weak_cells_held():
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    rows = ledger["programmes"]
    names = [row["jamb_name"] for row in rows]
    assert len(rows) == 16

    checkpoint = CHECKPOINT.read_text(encoding="utf-8")
    assert "Medical rows audited: **16/16**" in checkpoint
    assert "Awarder cells safe to confirm as represented in the ledger: **5/16**" in checkpoint
    assert "Rows held from promotion: **11/16**" in checkpoint
    assert "87/87 occurrence rows audited" in checkpoint

    for name in names:
        assert f"| {name} |" in checkpoint

    source_text = TEXT.read_text(encoding="cp1252")
    for title in (
        "ANATOMY",
        "BIOCHEMISTRY",
        "MEDICAL BIOCHEMISTRY",
        "DENTISTRY AND DENTAL",
        "HUMAN NUTRITION AND",
        "NURSING/NURSING",
        "OPTOMETRY",
        "PHARMACY",
        "PHYSIOLOGY:",
        "RADIOGRAPHY",
    ):
        assert title in source_text

    # The source audit is intentionally separate from the canonical offerings ledger.
    assert "source_verification" not in rows[0]
