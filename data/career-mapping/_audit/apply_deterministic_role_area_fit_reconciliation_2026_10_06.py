"""Resolve only high-confidence role -> area-of-specialization fits.

The area layer is the reconciled domain -> subgroup/area-of-practice layer.
This pass uses the role record's own source-backed task/skill text against the
reconciled area's label and boundary. Existing subgroup membership and ISCO
classification are deliberately excluded from the fit score.

Rows that do not have a unique, strong lexical/task anchor remain conditional.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
STEP1 = (
    AUDIT
    / "specialization_lanes_2026_10_05"
    / "STEP1_RECONCILIATION_2026_10_06"
    / "global_step1_specialization_reconciliation_2026_10_06.json"
)
SOURCE_FILES = [
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
]
REPORT = AUDIT / "deterministic_role_area_fit_reconciliation_2026_10_06.json"
REPORT_MD = AUDIT / "DETERMINISTIC_ROLE_AREA_FIT_RECONCILIATION_2026_10_06.md"

STOPWORDS = {
    "and", "the", "for", "with", "from", "into", "that", "this", "their",
    "area", "areas", "operations", "operation", "practice", "practices",
    "management", "manage", "service", "services", "system", "systems",
    "work", "working", "use", "using", "provide", "provides", "support",
    "supports", "perform", "performs", "develop", "develops", "development",
    "design", "designs", "process", "processes", "professional", "professionals",
    "role", "roles", "activity", "activities", "related", "including", "across",
    "one", "two", "new", "other", "based", "required", "ensure", "ensures",
}

# Words that occur across many unrelated occupational descriptions. They may
# be retained in the audit trace, but they cannot by themselves establish a
# role's fit to a particular area of practice.
GENERIC_ANCHORS = {
    "analysis", "apply", "business", "build", "change", "coordinate", "delivery",
    "development", "engineering", "improvement", "maintain", "management", "monitor",
    "operations", "planning", "process", "processes", "production", "requirements",
    "service", "services", "software", "systems", "technology", "testing", "work",
}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def rows_and_container(path: Path) -> tuple[Any, list[dict[str, Any]]]:
    payload = load(path)
    if isinstance(payload, list):
        return payload, payload
    rows = payload.get("roles") if isinstance(payload, dict) else None
    if not isinstance(rows, list):
        raise ValueError(f"Expected a role list in {path}")
    return payload, rows


def text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return " ".join(text(item) for item in value)
    if isinstance(value, dict):
        return " ".join(text(item) for item in value.values())
    return str(value)


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9+/#& -]", " ", text(value).lower())).strip()


def tokens(value: Any) -> set[str]:
    return {
        token for token in re.findall(r"[a-z][a-z0-9+#/&-]{2,}", norm(value))
        if token not in STOPWORDS and not token.isdigit()
    }


def phrases(value: Any) -> set[str]:
    words = [word for word in re.findall(r"[a-z][a-z0-9+#/&-]{2,}", norm(value)) if word not in STOPWORDS]
    return {" ".join(words[index:index + size]) for size in (2, 3) for index in range(len(words) - size + 1)}


def role_key(row: dict[str, Any]) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def role_evidence(row: dict[str, Any]) -> str:
    return " ".join(
        text(row.get(field))
        for field in (
            "role_name", "also_known_as", "description", "essential_skills",
            "optional_skills", "source", "source_provenance",
        )
    )


def area_score(role_text: str, area: dict[str, Any]) -> dict[str, Any]:
    if isinstance(area, dict):
        label = text(area.get("label"))
        # The D001-D112 reconciliation uses ``boundary`` while the later
        # lane records the same fit boundary as ``scope`` plus
        # ``route_boundary``.  Both are reconciled area-of-practice evidence;
        # ignoring the latter would silently turn valid deterministic anchors
        # into false residuals.
        boundary = " ".join(
            text(area.get(field))
            for field in ("boundary", "scope", "route_boundary")
            if text(area.get(field))
        )
    else:
        label = text(area)
        boundary = ""
    area_text = f"{label} {boundary}"
    role_tokens = tokens(role_text)
    label_tokens = tokens(label)
    boundary_tokens = tokens(boundary)
    all_tokens = label_tokens | boundary_tokens
    label_hits = sorted(role_tokens & label_tokens)
    boundary_hits = sorted(role_tokens & boundary_tokens)
    phrase_hits = sorted(phrases(role_text) & phrases(area_text))
    distinctive_label_hits = sorted(set(label_hits) - GENERIC_ANCHORS)
    distinctive_boundary_hits = sorted(set(boundary_hits) - GENERIC_ANCHORS)
    score = len(distinctive_label_hits) * 4 + len(distinctive_boundary_hits) + min(len(phrase_hits), 2) * 3
    return {
        "label": label,
        "boundary": boundary,
        "score": score,
        "label_hits": label_hits,
        "boundary_hits": boundary_hits,
        "distinctive_label_hits": distinctive_label_hits,
        "distinctive_boundary_hits": distinctive_boundary_hits,
        "phrase_hits": phrase_hits,
        "area_terms": sorted(all_tokens),
    }


def source_refs(row: dict[str, Any]) -> list[str]:
    refs: list[str] = []
    provenance = row.get("source_provenance")
    if isinstance(provenance, dict):
        refs.extend(str(item) for item in provenance.get("sources") or [])
        if provenance.get("evidence"):
            refs.append(f"source_provenance:{provenance['evidence']}")
    for field in ("source", "esco_code"):
        value = text(row.get(field))
        if value and value not in refs:
            refs.append(value)
    refs.append(str(STEP1.relative_to(ROOT)).replace("/", "\\"))
    return refs


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    step1 = load(STEP1)
    areas_by_domain = {
        str(item.get("domain_id")): item.get("recommended_areas") or []
        for item in step1.get("domains") or []
    }
    containers: dict[Path, Any] = {}
    all_rows: list[tuple[Path, dict[str, Any]]] = []
    for path in SOURCE_FILES:
        payload, rows = rows_and_container(path)
        containers[path] = payload
        all_rows.extend((path, row) for row in rows)

    changes: list[dict[str, Any]] = []
    candidates: list[dict[str, Any]] = []
    for path, row in all_rows:
        status = text(row.get("subgroup_fit_status"))
        if status != "conditional_review_required":
            continue
        if text(row.get("student_path_status")).casefold() == "excluded":
            continue
        domain_id = text(row.get("domain_id"))
        areas = areas_by_domain.get(domain_id) or []
        evidence = role_evidence(row)
        scored = sorted((area_score(evidence, area) for area in areas), key=lambda item: item["score"], reverse=True)
        if not scored:
            continue
        best = scored[0]
        second = scored[1]["score"] if len(scored) > 1 else 0
        # Guardrails: at least two label/boundary anchors, or one exact phrase
        # plus another boundary anchor, and a clear margin over the next area.
        anchor_count = len(set(best["distinctive_label_hits"]) | set(best["distinctive_boundary_hits"]))
        strong = (
            anchor_count >= 2
            or (len(best["phrase_hits"]) >= 1 and anchor_count >= 1)
        )
        unique = best["score"] >= second + 2
        disposition = "deterministic_supported" if strong and unique else "conditional_insufficient_evidence"
        candidate = {
            "role_key": role_key(row),
            "source_file": str(path.relative_to(ROOT)),
            "domain_id": domain_id,
            "domain_name": text(row.get("domain_name")),
            "role_name": text(row.get("role_name")),
            "role_source": source_refs(row),
            "candidate_area": best["label"] if disposition == "deterministic_supported" else None,
            "candidate_area_boundary": best["boundary"] if disposition == "deterministic_supported" else None,
            "best_score": best["score"],
            "second_score": second,
            "margin": best["score"] - second,
            "label_hits": best["label_hits"],
            "boundary_hits": best["boundary_hits"],
            "phrase_hits": best["phrase_hits"],
            "disposition": disposition,
            "guard_reason": (
                "unique role-task/skill anchor to one reconciled area boundary; parent domain route is retained"
                if disposition == "deterministic_supported"
                else "ambiguous or insufficient role-task/area-boundary evidence; remains review-only"
            ),
        }
        candidates.append(candidate)
        if disposition == "deterministic_supported":
            before = {
                "subgroup_fit_status": row.get("subgroup_fit_status"),
                "subgroup_fit_review_basis": row.get("subgroup_fit_review_basis"),
                "subgroup_fit_review_source_register": row.get("subgroup_fit_review_source_register"),
                "subgroup_fit_semantic_signoff": row.get("subgroup_fit_semantic_signoff"),
            }
            # Keep the repository's existing status vocabulary: this is a
            # source-backed deterministic candidate, not an academic body's
            # external sign-off.
            row["subgroup_fit_status"] = "supported_candidate"
            row["subgroup_fit_review_basis"] = (
                "Deterministic role-task fit: the source-backed role record contains the following "
                f"area-boundary anchors: {', '.join(sorted(set(best['distinctive_label_hits']) | set(best['distinctive_boundary_hits'])))}. "
                "The candidate area is uniquely stronger than the other reconciled areas for this domain. "
                "Existing subgroup membership and ISCO were not used as fit evidence."
            )
            row["subgroup_fit_review_source_register"] = (
                str(REPORT.relative_to(ROOT)).replace("/", "\\")
            )
            row["subgroup_fit_semantic_signoff"] = False
            row["subgroup_fit_deterministic_evidence"] = True
            row["subgroup_fit_deterministic_evidence_date"] = "2026-10-06"
            changes.append({
                "role_key": role_key(row),
                "source_file": str(path.relative_to(ROOT)),
                "before": before,
                "after": {
                    "subgroup_fit_status": row.get("subgroup_fit_status"),
                    "subgroup_fit_review_basis": row.get("subgroup_fit_review_basis"),
                    "subgroup_fit_review_source_register": row.get("subgroup_fit_review_source_register"),
                    "subgroup_fit_semantic_signoff": row.get("subgroup_fit_semantic_signoff"),
                    "subgroup_fit_deterministic_evidence": row.get("subgroup_fit_deterministic_evidence"),
                },
                "matched_area_evidence": candidate,
            })

    if args.apply:
        for path, payload in containers.items():
            write(path, payload)

    counts = Counter(item["disposition"] for item in candidates)
    report = {
        "schema_version": "2026-10-06.deterministic-role-area-fit.v1",
        "dry_run": not args.apply,
        "scope": "Conditional role -> reconciled domain/subgroup/area-of-specialization fit only.",
        "source_step1": str(STEP1.relative_to(ROOT)),
        "conditional_rows_inspected": len(candidates),
        "change_count": len(changes),
        "disposition_counts": dict(sorted(counts.items())),
        "changes": changes,
        "candidate_register": candidates,
        "guards": {
            "isco_used_as_fit_proof": False,
            "current_subgroup_membership_used_as_fit_proof": False,
            "parent_domain_gate_required": True,
            "ambiguous_rows_forced": False,
            "nigerian_context_used_as_global_fit_proof": False,
        },
        "remaining": "Rows without a unique strong task/boundary anchor remain conditional for targeted review or role enrichment.",
    }
    write(REPORT, report)
    md = [
        "# Deterministic role → area-of-specialization fit reconciliation — 2026-10-06",
        "",
        f"Mode: **{'APPLIED' if args.apply else 'DRY RUN'}**.",
        "",
        f"Conditional rows inspected: **{len(candidates):,}**.",
        f"Guarded changes: **{len(changes):,}**.",
        "",
        "A change requires a unique, strong match between the role record's own source-backed task/skill text and one reconciled area boundary. Existing subgroup membership and ISCO classification are not fit evidence.",
        "",
        "## Dispositions",
        "",
    ]
    md.extend(f"- `{key}`: **{value:,}**." for key, value in sorted(counts.items()))
    md.extend([
        "",
        "Rows left conditional are not treated as failures; they lack a sufficiently discriminating source-backed task/boundary match for an automatic sign-off.",
    ])
    REPORT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")
    print(json.dumps({"dry_run": not args.apply, "conditional_rows_inspected": len(candidates), "change_count": len(changes), "disposition_counts": dict(counts)}, indent=2))


if __name__ == "__main__":
    main()
