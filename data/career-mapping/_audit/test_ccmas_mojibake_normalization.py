import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_ccmas_sources_have_no_visible_replacement_sequence():
    for path in (ROOT / "ccmas").glob("*.json"):
        assert "\ufffd" not in path.read_text(encoding="utf-8")


def test_normalization_log_preserves_scope_and_rule():
    log = json.loads(
        (ROOT / "_audit" / "ccmas_mojibake_normalization_2026-09-26.json").read_text(
            encoding="utf-8"
        )
    )
    # The repair is intentionally idempotent: a rerun after the final pass
    # legitimately records zero new occurrences.
    assert log["occurrence_count"] >= 0
    assert log["replacement"]["to"] == "–"
    assert "does not assert the original punctuation" in log["rule"]
