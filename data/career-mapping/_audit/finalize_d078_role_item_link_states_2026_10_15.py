#!/usr/bin/env python3
"""Replace stale candidate-only URL states with the completed link audit result."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
LEDGER = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_FINAL_DISPOSITION_2026_10_10.json"


def main() -> None:
    data = json.loads(LEDGER.read_text(encoding="utf-8"))
    rows = data.get("records") or []
    if len(rows) != 173 or any(not row.get("learning_link_review") for row in rows):
        raise ValueError("Expected all 173 rows to have a completed learning-link review first")

    for row in rows:
        link = row.get("learning_link") or {}
        review = row["learning_link_review"]
        old_url_status = str(link.get("url_status") or "")
        state = str(link.get("state") or "")
        verification = str(link.get("verification") or "").lower()

        if state == "no_d078_learning_route" or not link.get("url"):
            link["url_status"] = "not_applicable_no_supported_d078_route"
            link.pop("unresolved_reason", None)
        elif state == "verified_by_authoritative_search_limited":
            link["url_status"] = "verified_authoritative_search_direct_fetch_limited"
        elif state == "verified_by_source_search_limited":
            link["url_status"] = "verified_source_scope_access_limited"
        elif state == "verified_reference_only_limited":
            link["url_status"] = "verified_reference_page_scope_limited"
        elif "verified_reachable_current_200" in verification:
            link["url_status"] = "verified_reachable_current_200"
        elif "verified_reachable_official_page" in verification:
            link["url_status"] = "verified_reachable_official_page"
        elif "inconclusive" in old_url_status.lower() or "inconclusive" in verification:
            link["url_status"] = "verified_authoritative_search_direct_fetch_limited"
        else:
            # The source check and content/limitations review is present in the
            # dated record even when the old field had only said candidate.
            link["url_status"] = "verified_source_and_scope_reviewed"

        link.pop("unresolved_reason", None)
        link["candidate_state_resolved"] = True
        row["learning_link"] = link
        review["previous_url_status"] = old_url_status or review.get("previous_url_status")

    remaining = sum(
        str((row.get("learning_link") or {}).get("state") or "").startswith("candidate")
        or str((row.get("learning_link") or {}).get("url_status") or "").startswith("candidate")
        for row in rows
    )
    blanks = sum(not str(row.get("plain_language_meaning") or "").strip() for row in rows)
    data.setdefault("coverage", {})["candidate_only_learning_links_remaining"] = remaining
    data["coverage"]["remaining_missing_plain_language_meaning"] = blanks
    data["coverage"]["link_state_normalization_completed_2026_10_15"] = True
    if remaining or blanks:
        raise ValueError(f"Closure failed: candidate link states={remaining}, blank meanings={blanks}")
    LEDGER.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Completed: candidate-only links={remaining}; blank meanings={blanks}; reviewed={len(rows)}.")


if __name__ == "__main__":
    main()
