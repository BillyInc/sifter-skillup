from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CHECKPOINT = ROOT / "data/career-mapping/_audit/jamb_source_repair_lane_b_incremental_checkpoint_2026-09-28_026.md"


def test_cumulative_arts_1_36_reconciliation_preserves_open_evidence_gates():
    checkpoint = CHECKPOINT.read_text(encoding="utf-8")
    assert "**31/31** non-skipped Arts rows" in checkpoint
    assert "| Exact source title and complete source awarder cell established |" in checkpoint
    assert "| Complete source body cell found; canonical/index identity wording needs reconciliation |" in checkpoint
    assert "| Exact title/list unresolved (full cell not yet established) |" in checkpoint
    assert "| Explicitly skipped under prior evidence |" in checkpoint
    assert "**24**" in checkpoint and "**3**" in checkpoint and "**4**" in checkpoint
    for row in ("5, 15, 35", "2, 16, 21, 28", "4, 6, 26, 31, 33"):
        assert row in checkpoint
    assert "Psychology occurrence verified although checkpoint 019 held it" in checkpoint
    assert "audit-only request" in checkpoint.lower()
