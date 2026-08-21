"""Build a reviewable global evidence matrix for the thin-domain queue.

This is an audit artifact only. It deliberately does not alter SQL, seed data,
or the role records. A taxonomy spine is reported separately from specialist
framework evidence so source coverage is not mistaken for completed extraction.
"""

from __future__ import annotations

import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
DEFAULT_TAXONOMIES = {"global_esco", "global_onet", "global_isco", "global_wef"}


def load(name: str):
    return json.loads((HERE / name).read_text(encoding="utf-8"))


def unique(values):
    seen = set()
    result = []
    for value in values:
        if not value:
            continue
        key = json.dumps(value, sort_keys=True, ensure_ascii=False) if isinstance(value, dict) else str(value).casefold()
        if key not in seen:
            seen.add(key)
            result.append(value)
    return result


def role_sources(role):
    provenance = role.get("source_provenance") or {}
    return unique(
        provenance.get("sources")
        or provenance.get("source_ids")
        or provenance.get("frameworks")
        or []
    )


def role_names(rows):
    return unique([row.get("role_name") or row.get("name") for row in rows])


def main():
    evidence = load("domain_skill_competency_certification_audit.json")
    role_tools = load("role_tools.json")
    thin = load("thin_domain_role_overlays.json")
    registry = load("domain_role_source_registry.json")

    roles_by_domain = {}
    for key, row in role_tools.items():
        domain_id = key.split("|", 1)[0]
        roles_by_domain.setdefault(domain_id, []).append(row)

    overlays_by_domain = {}
    for row in thin.get("roles", []):
        overlays_by_domain.setdefault(row.get("domain_id"), []).append(row)

    rows = []
    for domain in evidence["thin_gap_global_queue"]:
        domain_id = domain["domain_id"]
        role_rows = roles_by_domain.get(domain_id, [])
        overlay_rows = overlays_by_domain.get(domain_id, [])
        specialist_role_rows = [
            row for row in role_rows
            if set(role_sources(row)) - DEFAULT_TAXONOMIES
        ]
        specialist_sources = unique(
            source_id
            for row in specialist_role_rows
            for source_id in role_sources(row)
        )
        global_sources = domain.get("global_sources", [])
        global_source_ids = [source["source_id"] for source in global_sources]
        taxonomy_sources = [source_id for source_id in global_source_ids if source_id in DEFAULT_TAXONOMIES]
        specialist_domain_sources = [source_id for source_id in global_source_ids if source_id not in DEFAULT_TAXONOMIES]
        role_spine = domain.get("role_evidence", {})
        if role_rows and overlay_rows:
            status = "multi_source_role_spine_and_thin_overlay"
        elif role_rows:
            status = "multi_source_role_spine_no_thin_overlay"
        else:
            status = "needs_global_role_evidence"
        actual_gap = bool(overlay_rows)
        if specialist_role_rows or specialist_domain_sources:
            evidence_level = "taxonomy_plus_specialist_framework"
        else:
            evidence_level = "taxonomy_only"
        rows.append({
            "domain_id": domain_id,
            "domain_name": domain.get("domain_name"),
            "global_source_count": len(global_sources),
            "global_sources": global_sources,
            "taxonomy_source_ids": taxonomy_sources,
            "specialist_domain_source_ids": specialist_domain_sources,
            "role_spine": {
                "repository_role_rows": len(role_rows),
                "roles_with_tools": role_spine.get("roles_with_tools", 0),
                "roles_with_onet_competencies": role_spine.get("roles_with_onet_competencies", 0),
                "roles_with_esco_skills": role_spine.get("roles_with_esco_skills", 0),
                "roles_with_specialist_framework_signal": len(specialist_role_rows),
                "specialist_role_source_ids": specialist_sources,
            },
            "thin_overlay": {
                "role_count": len(overlay_rows),
                "role_names": role_names(overlay_rows),
            },
            "actual_unpopulated_gap": actual_gap,
            "reconciliation_row": not actual_gap and bool(role_rows),
            "current_domain_skills": domain.get("current_domain_skills", []),
            "current_domain_tools": domain.get("current_domain_tools", []),
            "current_domain_certifications": domain.get("current_domain_certifications", []),
            "nigerian_bodies": domain.get("nigerian_bodies", []),
            "status": status,
            "evidence_level": evidence_level,
            "interpretation": (
                "The repository already has source-backed role records, but the thin overlay adds no new rows for this domain."
                if status == "multi_source_role_spine_no_thin_overlay"
                else "The repository has a global role spine and an additional thin-domain overlay that still requires field-level review."
                if status == "multi_source_role_spine_and_thin_overlay"
                else "No repository role spine was found; specialist global role evidence must be added before this domain is treated as complete."
            ),
        })

    counts = {
        "thin_queue_rows": len(rows),
        "actual_unpopulated_gap_rows": sum(row["actual_unpopulated_gap"] for row in rows),
        "reconciliation_rows": sum(row["reconciliation_row"] for row in rows),
        "role_spine_resolved": sum(row["role_spine"]["repository_role_rows"] > 0 for row in rows),
        "thin_overlay_resolved": sum(row["thin_overlay"]["role_count"] > 0 for row in rows),
        "taxonomy_only": sum(row["evidence_level"] == "taxonomy_only" for row in rows),
        "taxonomy_plus_specialist_framework": sum(row["evidence_level"] == "taxonomy_plus_specialist_framework" for row in rows),
        "minimum_global_sources": min((row["global_source_count"] for row in rows), default=0),
        "maximum_global_sources": max((row["global_source_count"] for row in rows), default=0),
    }

    output = {
        "schema_version": "1.0.0",
        "purpose": "Separate global source coverage, role-spine evidence and specialist framework evidence for the current thin-domain queue before SQL regeneration.",
        "scope": {
            "thin_queue_rows": len(rows),
            "actual_unpopulated_gap_rows": sum(row["actual_unpopulated_gap"] for row in rows),
            "reconciliation_rows": sum(row["reconciliation_row"] for row in rows),
            "reconciled_count_note": "The repository contains 42 thin-queue rows. Forty-one have thin overlay additions and are the actual unpopulated gaps. D003 is a reconciliation row with five existing source-backed global role records and no additional overlay row.",
            "sql_regeneration": "blocked_until_evidence_review",
        },
        "interpretation": {
            "taxonomy_spine": "ESCO, O*NET, ISCO and WEF provide normalized occupation, skill and trend vocabulary. They do not prove Nigerian licensing, demand or local practice requirements.",
            "specialist_framework": "A specialist framework is a professional, regulatory, sector or occupational standard that names practice competencies, role expectations, tools, assessments or credentials. Its jurisdiction and evidence type must remain visible.",
            "thin_overlay": "Thin overlays are additional domain-role rows assembled for the gap queue. Their fields remain reviewable and are not promoted into SQL by this audit.",
            "credential_rule": "Only a source that explicitly establishes registration, examination, certification, licence or credential is eligible for a certification field.",
        },
        "coverage_summary": counts,
        "domains": rows,
    }
    (HERE / "global_thin_gap_evidence_audit.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Global Thin-Domain Evidence Audit",
        "",
        "This is a review artifact. It does not regenerate SQL or seed data.",
        "",
        f"- Thin-queue rows: {counts['thin_queue_rows']}",
        f"- Actual unpopulated gaps: {counts['actual_unpopulated_gap_rows']}",
        f"- Reconciliation rows: {counts['reconciliation_rows']}",
        f"- Existing repository role spines: {counts['role_spine_resolved']}",
        f"- Rows with additional thin overlays: {counts['thin_overlay_resolved']}",
        f"- Rows with taxonomy plus specialist framework evidence: {counts['taxonomy_plus_specialist_framework']}",
        f"- Rows with taxonomy-only global evidence: {counts['taxonomy_only']}",
        f"- Global source range per gap: {counts['minimum_global_sources']} to {counts['maximum_global_sources']}",
        "",
        "The count reconciliation matters: there are 42 rows in the current thin-gap file, but only 41 actual unpopulated gaps. D003 is not absent; it already has five source-backed role records, so it is reported as a reconciliation row rather than a missing gap.",
        "",
        "| Domain | Global sources | Role rows | Specialist signal | Thin overlay | Evidence level | Status |",
        "|---|---:|---:|---:|---:|---|---|",
    ]
    for row in rows:
        spine = row["role_spine"]
        lines.append(
            f"| {row['domain_id']} {row['domain_name']} | {row['global_source_count']} | {spine['repository_role_rows']} | {spine['roles_with_specialist_framework_signal']} | {row['thin_overlay']['role_count']} | {row['evidence_level']} | {row['status']} |"
        )
    lines.extend([
        "",
        "## Reading the matrix",
        "",
        "A domain is not considered complete merely because it has several global URLs. The matrix distinguishes generic taxonomies from specialist frameworks and keeps Nigerian licensing or certification claims source-bound.",
        "",
        "See `global_thin_gap_evidence_audit.json` for the source URLs, role names, current domain skills/tools/certifications, Nigerian context, and the exact evidence state for every gap row.",
    ])
    (HERE / "GLOBAL_THIN_GAP_EVIDENCE_AUDIT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(counts, indent=2))


if __name__ == "__main__":
    main()
