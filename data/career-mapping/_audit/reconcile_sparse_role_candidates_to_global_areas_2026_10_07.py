"""Reconcile sparse-role candidates against the completed global area layer.

This is an audit-only bridge between the sparse-role research ledger and the
168-domain global specialization reconciliation.  It deliberately does not
edit canonical role, subgroup, domain, or overlay files.  A candidate can be
eligible for later integration only when:

* its research ledger disposition is ``add``;
* it has an occupational/global source and a non-empty task description; and
* the task evidence has a unique, non-trivial match to one reconciled area
  boundary for its parent domain.

Older ISCO-derived subgroup labels are retained only as trace data.  They are
not used as fit proof and are not used as the final area name.
"""

from __future__ import annotations

import json
import argparse
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
LEDGER = AUDIT / "SPARSE_ROLE_ENRICHMENT_LEDGER_2026_10_07.json"
STEP1 = (
    AUDIT
    / "specialization_lanes_2026_10_05"
    / "STEP1_RECONCILIATION_2026_10_06"
    / "global_step1_specialization_reconciliation_2026_10_06.json"
)
OUT_JSON = AUDIT / "sparse_role_candidate_global_area_reconciliation_2026_10_07.json"
OUT_MD = AUDIT / "SPARSE_ROLE_CANDIDATE_GLOBAL_AREA_RECONCILIATION_2026_10_07.md"

STOPWORDS = {
    "and", "the", "for", "with", "from", "into", "that", "this", "their",
    "area", "areas", "practice", "practices", "service", "services",
    "role", "roles", "work", "working", "use", "using", "provide",
    "provides", "support", "supports", "perform", "performs", "develop",
    "develops", "development", "design", "designs", "process", "processes",
    "professional", "professionals", "related", "including", "across",
    "one", "two", "new", "other", "based", "required", "ensure", "ensures",
}
GENERIC = {
    "analysis", "apply", "business", "build", "change", "coordinate", "delivery",
    "development", "engineering", "improvement", "maintain", "management", "monitor",
    "operations", "planning", "process", "processes", "production", "requirements",
    "service", "services", "software", "systems", "technology", "testing", "work",
}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return " ".join(text(item) for item in value)
    if isinstance(value, dict):
        return " ".join(text(item) for item in value.values())
    return str(value)


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9+#/& -]", " ", text(value).casefold())).strip()


def tokens(value: Any) -> set[str]:
    return {
        item
        for item in re.findall(r"[a-z][a-z0-9+#/&-]{2,}", norm(value))
        if item not in STOPWORDS and not item.isdigit()
    }


def phrases(value: Any) -> set[str]:
    words = [item for item in re.findall(r"[a-z][a-z0-9+#/&-]{2,}", norm(value)) if item not in STOPWORDS]
    return {
        " ".join(words[index : index + width])
        for width in (2, 3)
        for index in range(len(words) - width + 1)
    }


def score(candidate_text: str, area: dict[str, Any]) -> dict[str, Any]:
    if isinstance(area, dict):
        label = text(area.get("label"))
        source_ids = area.get("source_ids") or []
        boundary = " ".join(
            text(area.get(field))
            for field in ("boundary", "scope", "route_boundary")
            if text(area.get(field))
        )
    else:
        label = text(area)
        source_ids = []
        boundary = ""
    role_tokens = tokens(candidate_text)
    label_tokens = tokens(label)
    boundary_tokens = tokens(boundary)
    label_hits = sorted(role_tokens & label_tokens)
    boundary_hits = sorted(role_tokens & boundary_tokens)
    phrase_hits = sorted(phrases(candidate_text) & phrases(f"{label} {boundary}"))
    distinctive = (set(label_hits) | set(boundary_hits)) - GENERIC
    value = len(set(label_hits) - GENERIC) * 4 + len(set(boundary_hits) - GENERIC)
    value += min(len(phrase_hits), 2) * 3
    return {
        "label": label,
        "boundary": boundary,
        "score": value,
        "label_hits": label_hits,
        "boundary_hits": boundary_hits,
        "distinctive_hits": sorted(distinctive),
        "phrase_hits": phrase_hits,
        "source_ids": source_ids,
    }


def recommended_areas(domain: dict[str, Any]) -> list[dict[str, Any]]:
    """Read both the original list form and the reconciled nested register form."""
    raw = domain.get("recommended_areas") or domain.get("areas") or []
    if isinstance(raw, dict):
        raw = raw.get("areas") or []
    return [area for area in raw if isinstance(area, dict)]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lane", choices=("all", "D057-D112"), default="all")
    args = parser.parse_args()
    ledger = load(LEDGER)
    step1 = load(STEP1)
    candidates = ledger.get("candidate_records") or []
    out_json, out_md = OUT_JSON, OUT_MD
    if args.lane == "D057-D112":
        candidates = [
            row for row in candidates
            if 57 <= int(str(row.get("domain_id", "D000"))[1:]) <= 112
        ]
        lane_dir = ROOT / "_audit" / "role_enrichment_lanes_2026_10_06" / "D057_D112"
        out_json = lane_dir / "D057_D112_sparse_candidate_global_area_review_2026_10_07.json"
        out_md = lane_dir / "D057_D112_sparse_candidate_global_area_review_2026_10_07.md"
        checkpoint_json = lane_dir / "D057_D112_sparse_candidate_global_area_checkpoint_2026_10_07.json"
        checkpoint_md = lane_dir / "D057_D112_sparse_candidate_global_area_checkpoint_2026_10_07.md"
    areas = {
        str(item.get("domain_id")): recommended_areas(item)
        for item in step1.get("domains") or []
    }
    decisions: list[dict[str, Any]] = []
    for candidate in candidates:
        domain_id = str(candidate.get("domain_id") or "")
        candidate_text = " ".join(
            text(candidate.get(field))
            for field in ("role_title", "candidate_tasks", "global_evidence")
        )
        scored = sorted(
            (score(candidate_text, area) for area in areas.get(domain_id, [])),
            key=lambda item: item["score"],
            reverse=True,
        )
        best = scored[0] if scored else None
        second = scored[1]["score"] if len(scored) > 1 else 0
        anchors = len(best["distinctive_hits"]) if best else 0
        margin = (best["score"] - second) if best else 0
        evidence_ok = bool(candidate.get("global_evidence")) and bool(text(candidate.get("candidate_tasks")).strip())
        eligible = (
            candidate.get("disposition") == "add"
            and evidence_ok
            and best is not None
            and anchors >= 2
            and margin >= 2
            and candidate.get("parent_domain_fit_status") == "supported"
        )
        global_sources = candidate.get("global_evidence") or []
        global_sources = [dict(source) for source in global_sources]
        for source in global_sources:
            if source.get("source_id") == "ONET_INSTRUCTIONAL_COORD" and "13-9031.00" in str(source.get("url")):
                source["url"] = "https://www.onetonline.org/link/details/25-9031.00"
                source["url_correction_note"] = "Corrected to O*NET Instructional Coordinators code 25-9031.00; the source record's 13-9031.00 URL was a code mismatch."
        decisions.append({
            "candidate_key": candidate.get("candidate_key"),
            "domain_id": domain_id,
            "domain_name": candidate.get("domain_name"),
            "role_title": candidate.get("role_title"),
            "old_area_label": candidate.get("area_of_specialization"),
            "ledger_disposition": candidate.get("disposition"),
            "candidate_tasks": candidate.get("candidate_tasks"),
            "parent_domain_fit_status": candidate.get("parent_domain_fit_status"),
            "exact_role_task_evidence": candidate.get("candidate_tasks"),
            "parent_domain_fit": {
                "status": candidate.get("parent_domain_fit_status") or "review_required",
                "rationale": candidate.get("parent_domain_fit_rationale"),
                "evidence_source_urls": [s.get("url") for s in global_sources if s.get("url")],
            },
            "recommended_area_fit": {
                "status": "review_required",
                "area_key": None,
                "candidate_area_label": best.get("label") if best else None,
                "candidate_area_boundary": best.get("boundary") if best else None,
                "rationale": "Text-score match is only a navigation suggestion. Parent-domain fit and title identity still require independent task/source adjudication; no area is accepted from title, taxonomy membership, or token overlap alone.",
            },
            "global_evidence": global_sources,
            "nigerian_context": candidate.get("nigerian_context"),
            "recommended_area": best,
            "second_area_score": second,
            "area_margin": margin,
            "evidence_gate": evidence_ok,
            "final_disposition": (
                "eligible_for_guarded_integration" if eligible
                else "alias_review_required" if candidate.get("disposition") == "alias_existing"
                else "review_only" if candidate.get("disposition") == "review_only"
                else "review_required"
            ),
            "reason": (
                "Unique task match to a reconciled global area boundary; parent-domain source evidence is present."
                if eligible
                else "No automatic integration: missing/ambiguous area boundary match, non-add disposition, or incomplete task evidence."
            ),
        })

    counts = Counter(item["final_disposition"] for item in decisions)
    report = {
        "schema_version": "2026-10-07.sparse-role-global-area-reconciliation.v1",
        "status": "audit_only",
        "lane": args.lane,
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "inputs": {
            "candidate_ledger": str(LEDGER.relative_to(ROOT)),
            "global_specialization_reconciliation": str(STEP1.relative_to(ROOT)),
        },
        "counts": {
            "candidate_records": len(decisions),
            "eligible_for_guarded_integration": counts["eligible_for_guarded_integration"],
            "review_required": counts["review_required"],
            "alias_review_required": counts["alias_review_required"],
            "review_only": counts["review_only"],
            "domains_covered": len({item["domain_id"] for item in decisions}),
        },
        "fit_policy": {
            "parent_domain_task_fit_required": True,
            "reconciled_area_boundary_required": True,
            "isco_or_old_subgroup_membership_is_fit_proof": False,
            "global_and_nigerian_evidence_separate": True,
            "canonical_files_edited": False,
        },
        "decisions": decisions,
    }
    out_json.write_text(json.dumps(report, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    lines = [
        "# Sparse-role candidate → reconciled global area audit — 2026-10-07",
        "",
        "This is an audit-only bridge. It does not add roles or edit taxonomy files.",
        "",
        f"- Candidate records checked: **{len(decisions)}**",
        f"- Eligible for guarded integration: **{counts['eligible_for_guarded_integration']}**",
        f"- Review-only: **{counts['review_only']}**",
        f"- Domains covered: **{len({item['domain_id'] for item in decisions})}**",
        "",
        "Eligibility requires a non-empty source-backed task profile, a global source, and a unique match to a reconciled area boundary. Older ISCO-derived subgroup labels are retained only as trace data.",
    ]
    out_md.write_text("\n".join(lines) + "\n", encoding="utf-8")
    if args.lane == "D057-D112":
        checkpoint = {
            "schema_version": "2026-10-07.d057-d112.sparse-candidate-checkpoint.v1",
            "lane": "D057-D112",
            "status": "area_lookup_repaired_candidate_adjudication_in_progress",
            "created_at_utc": report["created_at_utc"],
            "candidate_records_total": len(candidates),
            "candidate_records_scored_against_current_global_area_boundaries": len(decisions),
            "domain_ids_covered": sorted({item["domain_id"] for item in decisions}),
            "dispositions": dict(counts),
            "note": "The prior 102-row result used a flat-list parser against the nested Step 1 register and was invalid. This rerun retrieves the exact current area labels/boundaries. Parent-domain fit remains review_required unless separately supported; no subgroup/ISCO membership is accepted as evidence.",
            "canonical_files_edited": False,
        }
        checkpoint_json.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        checkpoint_md.write_text(
            "# D057–D112 sparse-candidate checkpoint — 2026-10-07\n\n"
            f"Area-register lookup repaired; {len(decisions)}/{len(candidates)} candidates scored against the current Global Step 1 areas.\n\n"
            f"Dispositions: {dict(counts)}. Parent-domain fits remain unverified where the evidence does not independently support them; these are not accepted based on taxonomy membership.\n\n"
            "Canonical files were not edited.\n",
            encoding="utf-8",
        )
    print(json.dumps(report["counts"], indent=2))


if __name__ == "__main__":
    main()
