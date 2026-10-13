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
REVIEW_CONFLICTS = ROOT / "_audit" / "jamb_nigerian_review_overlay_conflicts_2026-09-25.json"
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
    canonical_by_key = {
        (row.get("jamb_name"), (row.get("component_refs") or [None])[0]): row
        for row in canonical["rows"]
    }
    review_by_key = {}
    review_conflicts = {}
    for row in (nigerian_review or {}).get("rows", []):
        key = (row.get("jamb_name"), row.get("component_ref"))
        if key in review_by_key or key in review_conflicts:
            raise ValueError(f"duplicate Nigerian review row: {key!r}")
        canonical_row = canonical_by_key.get(key) or {}
        scope = canonical_row.get("curriculum_scope") or {}
        if (
            canonical_row.get("inheritance_type") == "combined_ccmas_curriculum"
            and not (
                scope.get("status") == "combined_scope_evidenced"
                and scope.get("approval") == "reviewed"
                and scope.get("selected_course_count", 0) > 0
                and canonical_row.get("domain_links")
            )
        ):
            # A legacy Nigerian overlay must not restore inherited links to a
            # blended JAMB identity whose offering-specific CCMAS course slice
            # is still unverified.
            continue
        candidate_ids = {
            link.get("domain_id")
            for link in canonical_row.get("candidate_ccmas_domain_links") or []
        }
        missing_candidate_ids = sorted(
            {
                link.get("domain_id")
                for link in row.get("links") or []
                if link.get("publish_in_reviewed_map")
                and link.get("domain_id") not in candidate_ids
            },
            key=lambda domain_id: str(domain_id or ""),
        )
        if missing_candidate_ids:
            # A reviewed overlay cannot create new curriculum/domain edges by
            # itself. Hold the entire row so that the remaining valid-looking
            # links are not represented as a complete reviewed disposition.
            review_conflicts[key] = missing_candidate_ids
            continue
        review_by_key[key] = row

    output = {}
    overlay_rows = 0
    overlay_links = 0
    removed_links = 0
    bridge_links = 0
    conflict_links = 0
    for row in canonical["rows"]:
        jamb_name = row["jamb_name"]
        component_ref = (row.get("component_refs") or [None])[0]
        key = (jamb_name, component_ref)
        review = review_by_key.get(key)
        conflict_domain_ids = review_conflicts.get(key)
        links = list(row.get("domain_links") or [])
        mapping_status = row["mapping_status"]
        status_reason = row["status_reason"]
        source = "jamb_ccmas_inheritance_canonical_2026-08-17.json"
        if conflict_domain_ids:
            links = []
            mapping_status = "review_required"
            status_reason = (
                "Nigerian review overlay references domain link(s) absent from "
                "the canonical candidate set; the row is held for reconciliation."
            )
            source += " + quarantined Nigerian review overlay"
            conflict_links += len(conflict_domain_ids)
        elif mapping_status == "review_required" and review is None:
            # Not every review hold is a Nigerian-context decision. For
            # example, combined JAMB curricula can be held because no
            # offering-specific course slice has been verified. In all such
            # cases keep the student map fail-closed and preserve the
            # canonical reason instead of demanding or inventing an overlay.
            links = []
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
            row.get("status_before") == "review_required" for row in review_by_key.values()
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
        "nigerian_review_conflict_rows": len(review_conflicts),
        "nigerian_review_conflict_links": conflict_links,
        "nigerian_review_conflicts": [
            {
                "jamb_name": jamb_name,
                "component_ref": component_ref,
                "missing_domain_ids": domain_ids,
            }
            for (jamb_name, component_ref), domain_ids in sorted(review_conflicts.items())
        ],
    }


def review_conflict_details(
    conflicts: list[dict],
    canonical: dict,
    nigerian_review: dict | None,
    domain_meta: dict,
) -> list[dict]:
    """Join quarantined edges to their overlay evidence for manual adjudication."""
    canonical_by_key = {
        (row.get("jamb_name"), (row.get("component_refs") or [None])[0]): row
        for row in canonical.get("rows", [])
    }
    overlay_by_key = {
        (row.get("jamb_name"), row.get("component_ref")): row
        for row in (nigerian_review or {}).get("rows", [])
    }
    detailed = []
    for conflict in conflicts:
        key = (conflict.get("jamb_name"), conflict.get("component_ref"))
        canonical_row = canonical_by_key.get(key) or {}
        overlay_row = overlay_by_key.get(key) or {}
        candidate_links = canonical_row.get("candidate_ccmas_domain_links") or []
        candidate_ids = sorted(
            {link.get("domain_id") for link in candidate_links if link.get("domain_id")}
        )
        missing_ids = set(conflict.get("missing_domain_ids") or [])
        missing_links = []
        for reviewed in overlay_row.get("links") or []:
            domain_id = reviewed.get("domain_id")
            if domain_id not in missing_ids or not reviewed.get("publish_in_reviewed_map"):
                continue
            context = reviewed.get("nigerian_professional_context") or {}
            profiles = context.get("profiles") or []
            source_records_by_id = {}
            for profile in profiles:
                for source in profile.get("source_records") or []:
                    source_id = source.get("source_id")
                    source_records_by_id[source_id or json.dumps(source, sort_keys=True)] = {
                        "source_id": source_id,
                        "name": source.get("name"),
                        "evidence_type": source.get("evidence_type"),
                        "urls": source.get("urls") or [],
                        "locator": source.get("locator"),
                        "accessed_on": source.get("accessed_on"),
                        "findings": source.get("findings") or [],
                        "limitations": source.get("limitations"),
                    }
            missing_links.append(
                {
                    "domain_id": domain_id,
                    "domain_name": reviewed.get("domain_name")
                    or domain_meta.get(domain_id, {}).get("domain_name"),
                    "original_match_type": reviewed.get("original_match_type"),
                    "reviewed_match_type": reviewed.get("reviewed_match_type"),
                    "disposition": reviewed.get("disposition"),
                    "reason_claimed_by_overlay": reviewed.get("reason"),
                    "curriculum_courses": [
                        {
                            "code": course.get("code"),
                            "title": course.get("title"),
                            "source_file": course.get("source_file"),
                            "source_locator": course.get("source_locator"),
                            "record_match": course.get("record_match"),
                        }
                        for course in (reviewed.get("nigerian_curriculum_courses") or [])
                    ],
                    "destination_role_patterns": [
                        pattern
                        for profile in profiles
                        for pattern in profile.get("role_patterns", [])
                    ],
                    "destination_source_ids": context.get("source_ids") or [],
                    "destination_source_records": list(source_records_by_id.values()),
                }
            )
        detailed.append(
            {
                **conflict,
                "canonical_candidate_domain_ids": candidate_ids,
                "missing_links": missing_links,
            }
        )
    return detailed


def main() -> None:
    document = json.loads(CANONICAL.read_text(encoding="utf-8"))
    domain_meta = json.loads(DOMAIN_META.read_text(encoding="utf-8"))
    nigerian_review = None
    if NIGERIAN_REVIEW.exists():
        nigerian_review = json.loads(NIGERIAN_REVIEW.read_text(encoding="utf-8"))
    output, overlay_counts = materialize_rows(document, nigerian_review, domain_meta)
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REVIEW_CONFLICTS.write_text(
        json.dumps(
            {
                "schema_version": "2026-09-25.nigerian-review-overlay-conflicts.v1",
                "generated_from": [
                    "_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json",
                    "_audit/ccmas_nigerian_reviewed_links_2026-09-01.json",
                ],
                "purpose": "Review overlay links absent from the canonical candidate set are withheld from the derived map and must be reconciled before promotion.",
                "conflict_rows": overlay_counts["nigerian_review_conflict_rows"],
                "conflict_link_occurrences": overlay_counts["nigerian_review_conflict_links"],
                "unique_missing_domain_ids": len(
                    {
                        domain_id
                        for conflict in overlay_counts["nigerian_review_conflicts"]
                        for domain_id in conflict["missing_domain_ids"]
                    }
                ),
                "conflicts": review_conflict_details(
                    overlay_counts["nigerian_review_conflicts"],
                    document,
                    nigerian_review,
                    domain_meta,
                ),
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
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
        "review_conflicts": str(REVIEW_CONFLICTS),
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
