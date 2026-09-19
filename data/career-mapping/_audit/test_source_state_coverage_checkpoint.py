"""Text-only guard for the compact source-state checkpoint.

This test intentionally reads only the small Markdown report; it does not load
generated curriculum/contextual artifacts or contact a database.
"""

from pathlib import Path


REPORT = Path(__file__).with_name("SOURCE_STATE_COVERAGE_CHECKPOINT_2026-09-19.md")


def test_source_state_checkpoint_records_all_boundaries():
    text = REPORT.read_text(encoding="utf-8")

    for marker in ("Curriculum", "Resources", "Contextual items", "Relationships"):
        assert f"| {marker} |" in text
    for state in ("review_required", "no_link", "not_established", "audit_only"):
        assert f"`{state}`" in text
    for count in (
        "237",
        "81,429",
        "126,414",
        "422,739",
        "119",
        "3",
        "51",
        "27",
        "698",
        "725",
        "5,668",
        "2,519",
        "2,305",
    ):
        assert count in text
    assert "URL reachability" in text
    assert "SQL" in text
    assert "production/data acceptance is not complete" in text
