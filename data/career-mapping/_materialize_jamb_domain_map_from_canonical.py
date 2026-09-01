"""Materialize the reviewed CCMAS-derived JAMB domain map.

The output intentionally contains no domain links for granular rows whose
curriculum slice has not been evidenced, and no CCMAS links for external rows.
Rows that were in the Nigerian CCMAS review queue are reconciled with the
separate Nigerian disposition artifact. That keeps the active map from
silently publishing the legacy links while preserving the full evidence and
course outcomes in the audit artifact.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).parent
CANONICAL = ROOT / "_audit" / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
NIGERIAN_REVIEW = ROOT / "_audit" / "ccmas_nigerian_reviewed_links_2026-09-01.json"
DOMAIN_META = ROOT / "domain_meta.json"
OUTPUT = ROOT / "_audit" / "jamb_domain_map_ccmas_derived_2026-08-17.json"
ACTIVE = ROOT / "jamb_domain_map.json"
LEGACY = ROOT / "_audit" / "jamb_domain_map_legacy_2026-08-17.json"


def reviewed_link_fields(reviewed: dict) -> dict:
    """Return the compact review metadata needed by downstream consumers.

    Full CCMAS outcomes and Nigerian source records remain in the reviewed
    audit JSON. The active map needs enough metadata to explain that a link is
    a reviewed bridge and to let audits join back to the evidence without
    inflating every map row with duplicated source profiles.
    """
    courses = reviewed.get("nigerian_curriculum_courses") or []
    context = reviewed.get("nigerian_professional_context") or {}
    return {
        "review_status": "nigerian_curriculum_reviewed",
        "review_disposition": reviewed.get("disposition"),
        "review_reason": reviewed.get("reason"),
        "reviewed_match_type": reviewed.get("reviewed_match_type"),
        "bridge_required": reviewed.get("disposition") == "resolved_nigerian_bridge_link",
        "nigerian_curriculum_course_refs": [
            {
                "code": course.get("code"),
                "title": course.get("title"),
            }
            for course in courses
            if course.get("code") or course.get("title")
        ],
        "nigerian_context_source_ids": context.get("source_ids") or [],
        "review_evidence_artifact": "_audit/ccmas_nigerian_reviewed_links_2026-09-01.json",
    }


def materialize_rows(canonical: dict, nigerian_review: dict | None, domain_meta: dict) -> dict:
    """Build the map from canonical rows plus the Nigerian review overlay."""
    review_by_key = {}
    for row in (nigerian_review or {}).get("rows", []):
        key = (row.get("jamb_name"), row.get("component_ref"))
        if key in review_by_key:
            raise ValueError(f"duplicate Nigerian review row: {key!r}")
        review_by_key[key] = row

    output = {}
    overlay_rows = 0
    overlay_links = 0
    removed_links = 0
    bridge_links = 0
    for row in canonical["rows"]:
        jamb_name = row["jamb_name"]
        component_ref = (row.get("component_refs") or [None])[0]
        review = review_by_key.get((jamb_name, component_ref))
        if row.get("mapping_status") == "review_required" and review is None:
            raise ValueError(
                "canonical review row has no Nigerian disposition: "
                f"{jamb_name!r} / {component_ref!r}"
            )

        links = list(row.get("domain_links") or [])
        mapping_status = row["mapping_status"]
        status_reason = row["status_reason"]
        source = "jamb_ccmas_inheritance_canonical_2026-08-17.json"
        if review is not None:
            candidate_by_domain = {
                link.get("domain_id"): link
                for link in row.get("candidate_ccmas_domain_links") or []
            }
            links = []
            for reviewed_link in review.get("links") or []:
                if not reviewed_link.get("publish_in_reviewed_map"):
                    removed_links += 1
                    continue
                domain_id = reviewed_link.get("domain_id")
                candidate = candidate_by_domain.get(domain_id)
                if candidate is None:
                    raise ValueError(
                        "Nigerian review link is absent from canonical candidates: "
                        f"{jamb_name!r} / {domain_id!r}"
                    )
                link = dict(candidate)
                reviewed_match_type = reviewed_link.get("reviewed_match_type")
                if reviewed_match_type:
                    link["match_type"] = reviewed_match_type
                link.update(reviewed_link_fields(reviewed_link))
                links.append(link)
                overlay_links += 1
                bridge_links += int(link.get("bridge_required", False))
            mapping_status = "ready_reviewed"
            status_reason = (
                "All candidate links were dispositioned with Nigerian CCMAS "
                "curriculum evidence and Nigerian destination context; "
                "published bridge links require the additional preparation "
                "described in the guidance flow."
            )
            source = (
                "jamb_ccmas_inheritance_canonical_2026-08-17.json + "
                "ccmas_nigerian_reviewed_links_2026-09-01.json"
            )
            overlay_rows += 1

        # Older mapping snapshots occasionally stored a display label with
        # the domain ID prefixed (for example, "D003 Artificial Intelligence").
        # The domain ID remains authoritative; normalize the display label to
        # domain_meta so programme and JAMB surfaces render one identity.
        for link in links:
            domain = domain_meta.get(link.get("domain_id"))
            if domain and domain.get("domain_name"):
                link["domain_name"] = domain["domain_name"]

        output[jamb_name] = {
            "links": links,
            "inheritance_type": row["inheritance_type"],
            "mapping_status": mapping_status,
            "status_reason": status_reason,
            "ccmas_components": row["component_refs"],
            "curriculum_scope": row["curriculum_scope"],
            "source": source,
        }
    if nigerian_review:
        expected = sum(
            row.get("status_before") == "review_required"
            for row in nigerian_review.get("rows", [])
        )
        if overlay_rows != expected:
            raise ValueError(
                f"Nigerian review row count mismatch: materialized {overlay_rows}, "
                f"expected {expected}"
            )
    return output, {
        "nigerian_review_rows": overlay_rows,
        "nigerian_review_links_published": overlay_links,
        "nigerian_review_links_removed": removed_links,
        "nigerian_review_bridge_links": bridge_links,
    }


def main() -> None:
    document = json.loads(CANONICAL.read_text(encoding="utf-8"))
    domain_meta = json.loads(DOMAIN_META.read_text(encoding="utf-8"))
    nigerian_review = None
    if NIGERIAN_REVIEW.exists():
        nigerian_review = json.loads(NIGERIAN_REVIEW.read_text(encoding="utf-8"))
    output, overlay_counts = materialize_rows(document, nigerian_review, domain_meta)
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    replaced = False
    if "--replace" in sys.argv:
        if not LEGACY.exists():
            LEGACY.write_text(ACTIVE.read_text(encoding="utf-8"), encoding="utf-8")
        ACTIVE.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        replaced = True
    ready = sum(1 for row in output.values() if row["mapping_status"] == "ready")
    review = sum(1 for row in output.values() if row["mapping_status"] == "review_required")
    external = sum(1 for row in output.values() if row["mapping_status"] == "external_review_required")
    links = sum(len(row["links"]) for row in output.values())
    print(json.dumps({
        "output": str(OUTPUT),
        "active_replaced": replaced,
        "legacy_backup": str(LEGACY) if replaced else None,
        "rows": len(output),
        "ready": ready,
        "review_required": review,
        "external_review_required": external,
        "domain_links": links,
        **overlay_counts,
    }, indent=2))


if __name__ == "__main__":
    main()
