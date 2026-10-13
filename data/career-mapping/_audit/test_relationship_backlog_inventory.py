"""Guard for the complete unresolved-relationship review inventory."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
INVENTORY = Path(__file__).with_name("relationship_backlog_inventory.json")


def _load() -> dict:
    return json.loads(INVENTORY.read_text(encoding="utf-8"))


def _sort_key(row: dict) -> tuple[str, ...]:
    return tuple(
        str(value or "").casefold()
        for value in (
            row["context_level"],
            row["context_key"],
            row["from_item_key"],
            row["from_name"],
            row.get("to_item_key"),
            row.get("to_name"),
            row["relationship_type"],
            row["data_state"],
        )
    )


def test_inventory_is_a_deterministic_unresolved_review_inventory() -> None:
    payload = _load()
    assert payload["schema_version"] == "2026-09-19.relationship-backlog.v2"
    assert payload["input"] == "data/career-mapping/contextual_guidance_items.json.gz"
    assert payload["total_unresolved"] == 2305
    assert payload["selected_count"] == payload["total_unresolved"]

    rows = payload["rows"]
    assert len(rows) == payload["selected_count"]
    assert rows == sorted(rows, key=_sort_key)
    assert all(row["data_state"] == "not_established" for row in rows)
    assert all(row["relationship_type"] == "not_established" for row in rows)
    # The complete backlog includes both unresolved edges whose target is still
    # absent and unresolved edges that already carry a target identity but are
    # not yet promoted.  Both remain review-only until source review closes.
    assert sum(row.get("to_item_key") is None for row in rows) == 2297
    assert sum(row.get("to_item_key") is not None for row in rows) == 8


def test_inventory_preserves_evidence_without_promoting_relationships() -> None:
    payload = _load()
    allowed_states = {"review_required", "not_established", "no_link", "audit_only"}

    for row in payload["rows"]:
        assert row["data_state"] in allowed_states
        assert row["relationship_status"] in allowed_states
        assert row["source_ids"]
        assert row["source_references"]
        assert row["source_locators"]
        assert row["evidence_limitations"]
        assert row["source_confidence"]
        assert row["verified_at"]
        assert all(reference.get("url") for reference in row["source_references"])
        assert all(locator.get("owner") for locator in row["source_locators"])
        assert row["relationship_type"] not in {"builds_on", "works_with"}


def test_inventory_source_path_stays_repo_relative() -> None:
    payload = _load()
    source_path = ROOT / payload["input"]
    assert source_path == ROOT / "data" / "career-mapping" / "contextual_guidance_items.json.gz"
