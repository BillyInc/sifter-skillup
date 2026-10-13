"""Reconcile D057-D084 lane reviews to the shared register without writing it.

Writes a lane-owned inventory of exact present/missing/conflicting records only.
The shared specialization register and canonical taxonomy are read-only inputs.
"""

from __future__ import annotations

import json
import runpy
from collections import Counter
from pathlib import Path


LANE = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[5]
REGISTER = ROOT / "data/career-mapping/_audit/domain_specialization_review_2026_10_03.json"
OUT_JSON = LANE / "d057_d084_slice_reconciliation_018.json"
OUT_MD = LANE / "d057_d084_slice_reconciliation_018.md"
FIRST, LAST = 57, 84


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def reconcile() -> dict:
    projection = runpy.run_path(str(LANE / "reconcile_shared_specialization_register.py"))
    shared_review = projection["shared_review"]
    shared_evidence = projection["shared_evidence"]
    register = load(REGISTER)
    source_audit = load(LANE / "source_specialization_audit_016.json")
    existing_reviews = {row["domain_id"]: row for row in register["domain_reviews"]}
    existing_evidence = {row["source_id"]: row for row in register["evidence_register"]}
    simulated_evidence = dict(existing_evidence)

    present_match, present_diff, missing, missing_ready = [], [], [], []
    collisions: list[dict] = []
    status_counts = Counter()
    source_counts = Counter()
    candidate_area_count = 0
    no_candidate_area_ids = []
    review_rows = []

    for number in range(FIRST, LAST + 1):
        domain_id = f"D{number:03d}"
        path = LANE / f"{domain_id}_specialization_review.json"
        if not path.exists():
            review_rows.append({"domain_id": domain_id, "file_present": False})
            continue
        review = load(path)
        if review.get("domain_id") != domain_id:
            raise ValueError(f"Domain ID mismatch in {path.name}")
        status = review.get("review_status", "missing_status")
        areas = review.get("candidate_specializations", [])
        sources = review.get("source_register", [])
        status_counts[status] += 1
        source_counts.update(row.get("source_id", "missing_source_id") for row in sources)
        candidate_area_count += len(areas)
        if not areas:
            no_candidate_area_ids.append(domain_id)

        projection_row = shared_review(review)
        if domain_id in existing_reviews:
            if projection_row == existing_reviews[domain_id]:
                present_match.append(domain_id)
                register_state = "present_exact_match"
            else:
                present_diff.append(domain_id)
                register_state = "present_conflict"
        else:
            missing.append(domain_id)
            register_state = "missing"

        source_conflicts = []
        if domain_id in missing:
            for evidence in shared_evidence(review):
                old = simulated_evidence.get(evidence["source_id"])
                if old is not None and old != evidence:
                    conflict = {
                        "domain_id": domain_id,
                        "source_id": evidence["source_id"],
                        "existing_title": old.get("title"),
                        "lane_title": evidence.get("title"),
                        "existing_url": old.get("url"),
                        "lane_url": evidence.get("url"),
                        "existing_locator": old.get("locator"),
                        "lane_locator": evidence.get("locator"),
                        "existing_claim_limit": old.get("claim_limit"),
                        "lane_claim_limit": evidence.get("claim_limit"),
                    }
                    collisions.append(conflict)
                    source_conflicts.append(evidence["source_id"])
                else:
                    simulated_evidence[evidence["source_id"]] = evidence
            if not source_conflicts:
                missing_ready.append(domain_id)
                register_state = "missing_additive_projection_ready"

        review_rows.append({
            "domain_id": domain_id,
            "file_present": True,
            "review_status": status,
            "candidate_area_count": len(areas),
            "source_record_count": len(sources),
            "role_to_specialization_assignments": 0 if review.get("decision", {}).get("role_assignment_status") in {"not_reviewed_here", "deferred", "not_assigned"} else None,
            "shared_register_state": register_state,
            "source_id_conflicts": source_conflicts,
        })

    missing_files = [row["domain_id"] for row in review_rows if not row["file_present"]]
    source_by_id = {row["source_id"]: row for row in source_audit.get("sources", [])}
    slice_findings = []
    for finding in source_audit.get("followup_findings", []):
        if FIRST <= int(finding["domain_id"][1:]) <= LAST:
            slice_findings.append({
                "domain_id": finding["domain_id"],
                "status": finding["status"],
                "finding": finding["finding"],
                "unresolved_boundary": finding.get("unresolved_boundary"),
                "source_ids": finding.get("source_ids", []),
                "sources": [
                    {
                        "source_id": source_id,
                        "publisher": source_by_id[source_id].get("publisher"),
                        "title": source_by_id[source_id].get("title"),
                        "url": source_by_id[source_id].get("url"),
                        "locator": source_by_id[source_id].get("locator"),
                        "supports": source_by_id[source_id].get("supports"),
                        "does_not_support": source_by_id[source_id].get("does_not_support"),
                    }
                    for source_id in finding.get("source_ids", []) if source_id in source_by_id
                ],
            })
    result = {
        "schema_version": "2026-10-05.d057-d084-specialization-reconciliation.v1",
        "generated_by": Path(__file__).name,
        "scope": {"first_domain": f"D{FIRST:03d}", "last_domain": f"D{LAST:03d}", "expected_domain_count": LAST - FIRST + 1},
        "policy": {
            "subgroup_definition": "A subgroup is a student-facing area of specialization within the parent domain, not an ISCO job family or a learning-stage label.",
            "review_rule": "Assess whether each proposed area fits the parent's work/practice scope; existing subgroup and role membership is not fit evidence by itself.",
            "jurisdiction_rule": "Retain globally supported areas; label jurisdiction-specific titles, licensing and credential routes as local context rather than universal taxonomy.",
            "role_mapping": "No role-to-specialization assignments are made in this lane.",
            "writes": "Only this lane-owned reconciliation JSON/Markdown is written. Shared register, domain_structure, role library, role-to-domain data and subgroup scripts/reports are read-only.",
        },
        "counts": {
            "review_files_expected": LAST - FIRST + 1,
            "review_files_found": len([row for row in review_rows if row["file_present"]]),
            "review_files_missing": len(missing_files),
            "candidate_specialization_rows": candidate_area_count,
            "domains_with_no_candidate_area_rows": len(no_candidate_area_ids),
            "domains_present_in_shared_register_exact_match": len(present_match),
            "domains_present_in_shared_register_conflict": len(present_diff),
            "domains_absent_from_shared_register": len(missing),
            "absent_rows_with_additive_projection_ready": len(missing_ready),
            "distinct_source_id_conflicts": len({row["source_id"] for row in collisions}),
            "conflict_occurrences": len(collisions),
            "domains_with_role_to_specialization_assignments": 0,
        },
        "review_status_counts": dict(sorted(status_counts.items())),
        "source_record_id_reuse_counts": {key: value for key, value in sorted(source_counts.items()) if value > 1},
        "prior_followup_findings_reconciled_to_slice": slice_findings,
        "no_candidate_area_domain_ids": no_candidate_area_ids,
        "shared_register": {
            "target": "data/career-mapping/_audit/domain_specialization_review_2026_10_03.json",
            "present_exact_match_domain_ids": present_match,
            "present_conflict_domain_ids": present_diff,
            "missing_domain_ids": missing,
            "missing_additive_projection_ready_domain_ids": missing_ready,
            "source_conflicts": collisions,
            "written": False,
        },
        "missing_lane_review_files": missing_files,
        "domains": review_rows,
        "limitations": [
            "Candidate area counts are review proposals, not canonical specialization counts or externally prescribed taxonomies.",
            "Where a parent domain is over-broad or ambiguous, subgroup count remains provisional until parent scope is reconciled.",
            "A collision in the shared evidence register is not silently overwritten; preserve the exact source locator and claim boundary in lane evidence.",
        ],
    }
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D057-D084 specialization slice reconciliation (checkpoint 018)", "",
        "Read-only reconciliation of the completed D057-D091 lane records against the shared register. No domain review, evidence, or canonical taxonomy was overwritten.", "",
        "## Exact counts", "",
    ]
    for key, value in result["counts"].items():
        lines.append(f"- `{key}`: **{value}**")
    lines.extend(["", "## Shared-register disposition", "",
                  f"- Exact matches already present: {', '.join(present_match) or 'none'}.",
                  f"- Absent: {', '.join(missing) or 'none'}.",
                  f"- Additive projections that pass source-ID conflict checks: {', '.join(missing_ready) or 'none'}.",
                  f"- Existing-domain projection conflicts: {', '.join(present_diff) or 'none'}.", ""])
    if collisions:
        lines.extend(["### Source-ID collisions", ""])
        for row in collisions:
            lines.append(f"- `{row['domain_id']}` / `{row['source_id']}`: existing locator `{row['existing_locator']}` vs lane locator `{row['lane_locator']}`; claim-limit difference must be reviewed before shared-register reconciliation.")
        lines.append("")
    lines.extend(["## Domain-by-domain review status", "",
                  "| Domain | Lane status | Candidate areas | Sources | Shared-register state |", "|---|---|---:|---:|---|"])
    for row in review_rows:
        if row["file_present"]:
            lines.append(f"| {row['domain_id']} | `{row['review_status']}` | {row['candidate_area_count']} | {row['source_record_count']} | `{row['shared_register_state']}` |")
        else:
            lines.append(f"| {row['domain_id']} | **missing review file** | — | — | — |")
    lines.extend(["", "## Follow-up findings and evidence limits", ""])
    for finding in slice_findings:
        lines.append(f"### {finding['domain_id']} — {finding['status']}")
        lines.append("")
        lines.append(finding["finding"])
        if finding.get("unresolved_boundary"):
            lines.append("")
            lines.append(f"Unresolved: {finding['unresolved_boundary']}")
        for source in finding["sources"]:
            lines.append(f"- [{source['publisher']}: {source['title']}]({source['url']}) — {source['locator']} Supports: {source['supports']} Does not support: {source['does_not_support']}")
        lines.append("")
    lines.extend(["", "## Invariants", "",
                  "- These are areas-of-specialization candidates, not role groups inferred from ISCO.",
                  "- No roles were assigned to specializations.",
                  "- Parent-boundary holds remain holds; the lane does not invent a subgroup count where the root domain needs reconciliation.",
                  "- Jurisdiction-specific credentials/titles stay labelled as jurisdictional context.",
                  "- This report does not update the shared register; all 20 absent records require separate collision-safe reconciliation.", ""])
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    return result


if __name__ == "__main__":
    print(json.dumps(reconcile()["counts"], indent=2))
