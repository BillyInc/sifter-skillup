import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
PREFIX = "jamb_ccmas_authoritative_followup_rows_141_280_2026-09-26_"


def test_lane_2_saved_jamb_followups_cover_all_140_identity_rows():
    files = sorted(AUDIT.glob(f"{PREFIX}*.md"))
    base_ranges = set()
    addenda = 0
    for path in files:
        first_line = path.read_text(encoding="utf-8").splitlines()[0]
        match = re.search(r"rows\s+(\d+)\s*[–-]\s*(\d+)", first_line)
        assert match, path.name
        span = (int(match.group(1)), int(match.group(2)))
        if "addendum" in first_line.lower() or "supplement" in first_line.lower():
            addenda += 1
        else:
            base_ranges.add(span)

    expected = {(start, start + 9) for start in range(141, 280, 10)}
    assert len(files) == 28
    assert base_ranges == expected
    assert addenda == 14


def test_lane_2_checkpoint_010_distinguishes_notes_from_source_closure():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_010.json").read_text(encoding="utf-8"))
    progress = checkpoint["progress"]
    assert progress["identities_with_prior_followup_notes"] == 140
    assert progress["identities_fully_source_adjudicated_in_lane_2"] == 0
    assert progress["identities_without_any_prior_row_followup_note"] == 0
    assert "not yet reconciled" in progress["exact_source_cell_status"]
