"""Add source-reviewed lane records to the shared review register, without canonical edits."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[5]
LANE = Path(__file__).resolve().parent
REGISTER = ROOT / "data/career-mapping/_audit/domain_specialization_review_2026_10_03.json"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def shared_review(source: dict) -> dict:
    current = source.get("current_state", {})
    decision = source["decision"]
    source_rows = {row["source_id"]: row for row in source.get("source_register", [])}
    candidates = []
    for area in source.get("candidate_specializations", []):
        ids = area.get("source_ids") or area.get("source_basis") or []
        area_sources = [source_rows[sid] for sid in ids if sid in source_rows]
        support = area.get("source_support") or "; ".join(row.get("supports", "") for row in area_sources)
        candidates.append({
            "key": area.get("key"),
            "label": area.get("label"),
            "description": area.get("description") or area.get("scope"),
            "source_support": support,
            "sources": list(dict.fromkeys(row["url"] for row in area_sources if row.get("url"))),
            "source_ids": ids,
        })

    alternatives = source.get("alternatives_and_boundaries") or decision.get("alternatives_considered") or []
    uncertainties = list(source.get("limitations", []))
    uncertainties.extend(current.get("scope_questions", []))
    if source.get("computational_cross_check"):
        uncertainties.append("Computational cross-check: " + source["computational_cross_check"].get("disposition", ""))

    current_subgroups = current.get("current_subgroups", [])
    basis = current.get("current_basis") or current.get("baseline_note") or "Existing records are not treated as evidence of specialization count."
    if "current_visible_specialization_count" in current:
        visible_count = current["current_visible_specialization_count"]
    else:
        visible_count = None
        basis += " Student-visible status/count was not independently established in this lane; null is intentional."

    return {
        "domain_id": source["domain_id"],
        "domain_name": source["domain_name"],
        "review_status": source.get("review_status", "source_reviewed_candidate_set_recommended"),
        "current_subgroup_record_count": len(current_subgroups) if current_subgroups else current.get("baseline_visible_count"),
        "current_visible_specialization_count": visible_count,
        "current_subgroup_record_basis": basis,
        "decision": decision.get("recommendation") or decision.get("disposition"),
        "criteria_disposition": source.get("criteria_disposition", {}),
        "alternatives_considered": alternatives,
        "uncertainties": list(dict.fromkeys(uncertainties)),
        "external_academic_signoff_status": decision.get("external_academic_signoff_status", "not_obtained"),
        "specialization_count": decision.get("count"),
        "specializations": candidates,
        "boundary_notes": [
            "Additive shared-register reconciliation from a lane review; no canonical taxonomy or role mapping was changed.",
            "The lane record remains provisional where its review_status says provisional; this is not external academic sign-off.",
        ],
    }


def shared_evidence(source: dict) -> list[dict]:
    rows = []
    for row in source.get("source_register", []):
        rows.append({
            "source_id": row["source_id"],
            "publisher": row.get("publisher", ""),
            "source_type": row.get("source_type", ""),
            "title": row.get("title", ""),
            "url": row.get("url", ""),
            "access_date": row.get("access_date", ""),
            "locator": row.get("locator", ""),
            "claim_supported": row.get("supports", ""),
            "claim_limit": row.get("does_not_support") or row.get("claim_limit", ""),
        })
    return rows


def reconcile(domain_ids: list[str], *, write: bool) -> dict:
    register = load(REGISTER)
    review_by_id = {row["domain_id"]: row for row in register.get("domain_reviews", [])}
    evidence_by_id = {row["source_id"]: row for row in register.get("evidence_register", [])}
    changes = []
    for domain_id in domain_ids:
        source_path = LANE / f"{domain_id}_specialization_review.json"
        source = load(source_path)
        if source["domain_id"] != domain_id:
            raise ValueError(f"Review identity mismatch in {source_path}")
        if domain_id in review_by_id:
            raise ValueError(f"{domain_id} already exists in shared register; refusing overwrite")
        review_by_id[domain_id] = shared_review(source)
        for evidence in shared_evidence(source):
            old = evidence_by_id.get(evidence["source_id"])
            if old and old != evidence:
                raise ValueError(f"Conflicting shared source_id {evidence['source_id']}")
            evidence_by_id[evidence["source_id"]] = evidence
        changes.append(domain_id)

    register["domain_reviews"] = list(review_by_id.values())
    register["evidence_register"] = list(evidence_by_id.values())
    if write:
        REGISTER.write_text(json.dumps(register, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return {"added_domain_ids": changes, "domain_review_count": len(register["domain_reviews"]), "evidence_count": len(register["evidence_register"]), "written": write}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--domain-ids", nargs="+", required=True)
    parser.add_argument("--write", action="store_true", help="Apply additive changes; refuses to overwrite existing domain/source IDs.")
    args = parser.parse_args()
    print(json.dumps(reconcile(args.domain_ids, write=args.write), indent=2))
