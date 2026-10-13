"""Move programme-to-domain links that fail review gates out of guidance.

The mapping audit is the source of truth for this cleanup.  A direct or
functional relationship needs at least two course/outcome anchors, and an
adjacent relationship needs one domain-specific anchor plus transferable
evidence. A link that passes the count but has only generic anchors is also
not safe for student guidance until it receives semantic review. Such links
remain in ``unverified_links`` for review, but must not be returned as active
student-facing connections.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parent
MAPPING_PATH = ROOT / "programme_domain_final.json"
AUDIT_PATH = ROOT / "_audit" / "course_and_jamb_mapping_audit_2026-09-11.json"
AUDIT_REF = "course_outcome_gate_cleanup_2026-09-18"


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    candidates = [
        row
        for row in audit.get("candidate_rows", [])
        if row.get("current_mapping")
        and row.get("gate_status") in {
            "fails_course_outcome_gate",
            "fails_adjacent_gate",
            "passes_count_but_needs_semantic_review",
        }
    ]

    moved: list[tuple[str, str, str]] = []
    for row in candidates:
        programme_key = str(row.get("programme_key") or "")
        domain_id = str(row.get("domain_id") or "")
        record = mapping.get(programme_key)
        if not record:
            raise SystemExit(f"Missing programme in authoritative mapping: {programme_key}")
        active = [link for link in record.get("links", []) if link.get("domain_id") == domain_id]
        if len(active) != 1:
            raise SystemExit(
                f"Expected exactly one active link for {programme_key} -> {domain_id}; found {len(active)}"
            )

        link = dict(active[0])
        reason = str(row.get("gate_reason") or "Fails the current programme-to-domain review gate")
        link["review_exclusion_reason"] = f"removed from active guidance: {reason}"
        link["audit_ref"] = AUDIT_REF
        record["links"] = [item for item in record.get("links", []) if item.get("domain_id") != domain_id]
        unverified = list(record.get("unverified_links") or [])
        if not any(item.get("domain_id") == domain_id for item in unverified):
            unverified.append(link)
        record["unverified_links"] = sorted(
            unverified,
            key=lambda item: (str(item.get("domain_id") or ""), str(item.get("match_type") or "")),
        )
        moved.append((programme_key, domain_id, row.get("gate_status") or ""))

    MAPPING_PATH.write_text(json.dumps(mapping, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Moved {len(moved)} gate-failing active mappings out of guidance.")
    for programme_key, domain_id, gate_status in moved:
        print(f"  {programme_key} -> {domain_id} ({gate_status})")


if __name__ == "__main__":
    main()
