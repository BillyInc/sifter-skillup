"""Small deterministic gate for the external-enrichment design inventory."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INVENTORY = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent" / "external_enrichment_inventory_2026-09-20.json"
DESIGN = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent" / "EXTERNAL_ENRICHMENT_SEARCH_PROTOCOL_2026-09-20.md"


def main() -> None:
    payload = json.loads(INVENTORY.read_text(encoding="utf-8"))
    counts = payload["counts"]
    assert counts["contextual_item_rows"] == 126_414
    assert counts["contextual_relationship_rows"] == 422_739
    assert counts["all_rows_requiring_canonical_search_evidence"] == 549_153
    assert counts["item_discovery_queue"] == 125_414
    assert counts["item_verification_queue"] == 1_000
    assert counts["relationship_discovery_queue"] == 2_305
    assert counts["relationship_verification_queue"] == 420_434
    assert counts["item_discovery_queue"] + counts["item_verification_queue"] == counts["item_rows_requiring_canonical_search_evidence"]
    assert counts["relationship_discovery_queue"] + counts["relationship_verification_queue"] == counts["relationship_rows_requiring_canonical_search_evidence"]
    assert payload["canonical_search_ledger"]["rows"] == 0
    assert payload["canonical_search_ledger"]["search_evidence_complete_for_any_queue_row"] is False
    for state in ("linked", "review_required", "genuinely_unavailable", "not_searched"):
        assert state in payload["state_policy"]
    design = DESIGN.read_text(encoding="utf-8")
    for required in ("candidate_urls", "accessed_on", "item-specific", "same context", "genuinely_unavailable", "review_required"):
        assert required.casefold() in design.casefold()
    print("external enrichment agent inventory: PASS")


if __name__ == "__main__":
    main()
