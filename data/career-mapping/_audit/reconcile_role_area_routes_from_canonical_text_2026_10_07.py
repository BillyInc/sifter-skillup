"""Deterministically reconcile role -> area routes from existing source text.

This pass is intentionally conservative. It uses the current role's stored
description/skills and the current domain's canonical area label/description;
it never uses ISCO membership, role frequency, or a neighbouring domain. A
route is promoted only when the exact domain has one clearly separated,
area-specific lexical candidate. Ambiguous roles remain review-required.
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
ROLE_FILES = (
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
)
STRUCTURE = ROOT / "domain_structure.json"
REPORT = AUDIT / "ROLE_AREA_TEXT_RECONCILIATION_2026_10_07.json"
REPORT_MD = AUDIT / "ROLE_AREA_TEXT_RECONCILIATION_2026_10_07.md"
DATE = "2026-10-07"

STOP = {
    "about", "after", "also", "area", "areas", "and", "based", "both",
    "from", "into", "more", "other", "over", "practice", "service",
    "services", "specialization", "specializations", "the", "their", "this",
    "through", "with", "within", "work", "working", "operations", "operation",
    "management", "systems", "system", "development", "engineering", "design",
    "technology", "technologies", "production", "process", "processes",
    "support", "supporting", "using", "use", "provide", "providing", "role",
}

TITLE_GENERIC = {
    "analyst", "assistant", "broker", "business", "consultant", "controller",
    "engineer", "financial", "health", "manager", "officer", "professional",
    "representative", "risk", "scientist", "specialist", "technical", "trader",
    "underwriter", "auditor", "administrator", "designer", "developer", "analyst",
}


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def rows(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        return [x for x in payload.get("roles", []) if isinstance(x, dict)]
    return []


def tokens(value: Any) -> set[str]:
    return {
        x for x in re.findall(r"[a-z][a-z0-9]+", str(value or "").casefold())
        if len(x) >= 4 and x not in STOP
    }


def text(value: Any) -> str:
    return str(value or "").casefold()


def refs(value: Any) -> list[str]:
    if isinstance(value, list):
        result = []
        for x in value:
            if isinstance(x, str) and x.strip():
                result.append(x.strip())
            elif isinstance(x, dict) and x.get("url"):
                result.append(str(x["url"]).strip())
        return list(dict.fromkeys(result))
    return [str(value).strip()] if value else []


def append_refs(old: Any, new: list[str]) -> list[str]:
    return list(dict.fromkeys(refs(old) + new))


def append_basis(old: Any, new: str) -> str:
    old = str(old or "").strip()
    return old if new in old else (f"{old} {new}".strip() if old else new)


def role_text(row: dict[str, Any]) -> str:
    return " ".join(str(row.get(k) or "") for k in ("role_name", "also_known_as", "description", "essential_skills", "optional_skills"))


def area_candidates(row: dict[str, Any], area_list: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rtext = text(role_text(row))
    rtokens = tokens(rtext)
    role_name_tokens = tokens(row.get("role_name"))
    label_frequency = Counter(token for area in area_list for token in tokens(area.get("label")))
    scored = []
    for area in area_list:
        label = str(area.get("label") or "")
        atokens = tokens(label)
        hits = sorted(rtokens & atokens)
        if not hits:
            continue
        phrase = text(label) in rtext and len(atokens) >= 2
        description_hits = len(rtokens & tokens(area.get("description")))
        unique_hits = [token for token in hits if label_frequency[token] == 1]
        role_name_hits = sorted(role_name_tokens & atokens)
        unique_bonus = len(unique_hits)
        score = len(hits) * 4 + description_hits + unique_bonus * 2 + (8 if phrase else 0)
        # Generic single-word overlap is not enough to establish an area route.
        if len(hits) < 2 and not phrase:
            continue
        scored.append({
            "area_id": area.get("area_id"),
            "label": label,
            "score": score,
            "label_hits": hits,
            "unique_label_hits": unique_hits,
            "role_name_hits": role_name_hits,
            "description_hits": description_hits,
            "phrase_match": phrase,
            "source_refs": refs(area.get("source_references")),
        })
    return sorted(scored, key=lambda x: (-x["score"], x["area_id"] or ""))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    structure = read(STRUCTURE)
    areas_by_domain = {
        did: [a for a in data.get("areas_of_specialization", []) if isinstance(a, dict)]
        for did, data in structure.items() if isinstance(data, dict)
    }
    containers = {}
    locations = []
    for path in ROLE_FILES:
        payload = read(path)
        containers[path] = payload
        for row in rows(payload):
            locations.append((path, row))

    candidates = []
    applied = []
    direct_no_area = []
    for path, row in locations:
        if row.get("domain_fit_review_status") != "supported":
            continue
        if row.get("specialization_fit_review_status") != "review_required":
            continue
        did = str(row.get("domain_id") or "")
        area_list = areas_by_domain.get(did, [])
        if not area_list:
            direct_no_area.append({"domain_id": did, "role_name": row.get("role_name"), "source_file": str(path.relative_to(ROOT))})
            if args.apply:
                row["specialization_fit_status"] = "direct_domain_role"
                row["specialization_fit_review_status"] = "not_applicable"
                row["specialization_fit_domain_gate"] = "parent_domain_fit_supported"
                row["specialization_fit_review_basis"] = append_basis(row.get("specialization_fit_review_basis"), "The canonical domain has no defined area-of-specialization route; retained as direct domain-to-role.")
                row["specialization_fit_review_date"] = DATE
            continue
        ranked = area_candidates(row, area_list)
        if not ranked:
            continue
        top = ranked[0]
        second = ranked[1]["score"] if len(ranked) > 1 else 0
        margin = top["score"] - second
        # A route is promoted only with a strong unique lead. The report keeps
        # all candidate scores so the residual can be reviewed later.
        strong_phrase = top["phrase_match"] and top["score"] >= 14
        strong_task_match = (
            (
                any(token not in TITLE_GENERIC for token in top["role_name_hits"])
                and len(top["unique_label_hits"]) >= 1
                and top["description_hits"] >= 2
            )
            or (
                len(top["unique_label_hits"]) >= 3
                and top["description_hits"] >= 3
            )
        ) and top["score"] >= 12 and margin >= 5
        if not (strong_phrase or strong_task_match):
            continue
        item = {
            "domain_id": did,
            "role_name": row.get("role_name"),
            "source_file": str(path.relative_to(ROOT)),
            "selected_area": top,
            "runner_up_score": second,
            "margin": margin,
        }
        candidates.append(item)
        if args.apply:
            old = {
                "specialization_fit_status": row.get("specialization_fit_status"),
                "specialization_fit_area_key": row.get("specialization_fit_area_key"),
                "specialization_fit_review_status": row.get("specialization_fit_review_status"),
            }
            row["specialization_fit_status"] = "supported"
            row["specialization_fit_area_key"] = top["area_id"]
            row["specialization_fit_review_status"] = "supported"
            row["specialization_fit_domain_gate"] = "parent_domain_fit_supported"
            row["specialization_fit_review_basis"] = append_basis(row.get("specialization_fit_review_basis"), f"Deterministic same-domain text reconciliation: role source text matched the canonical area label tokens {', '.join(top['label_hits'])}; the top candidate led the next candidate by {margin} points.")
            row["specialization_fit_review_source_refs"] = append_refs(row.get("specialization_fit_review_source_refs"), top["source_refs"])
            row["specialization_fit_review_date"] = DATE
            applied.append({**item, "before": old})

    report = {
        "schema_version": "2026-10-07.role-area-text-reconciliation.v1",
        "mode": "APPLIED" if args.apply else "DRY_RUN",
        "policy": "Same-domain canonical text only; no ISCO, subgroup membership, role frequency, or cross-domain inference.",
        "counts": {
            "role_rows_checked": len(locations),
            "supported_parent_area_review_rows": sum(1 for _, r in locations if r.get("domain_fit_review_status") == "supported" and r.get("specialization_fit_review_status") == "review_required"),
            "high_confidence_candidates": len(candidates),
            "direct_domain_roles_in_no_area_domains": len(direct_no_area),
            "applied_changes": len(applied) + (len(direct_no_area) if args.apply else 0),
        },
        "direct_domain_roles_in_no_area_domains": direct_no_area,
        "candidates": candidates,
        "applied": applied,
        "guards": {
            "parent_domain_supported_required": True,
            "canonical_area_key_required": True,
            "unique_score_margin_required": True,
            "isco_or_subgroup_membership_used_as_proof": False,
            "cross_domain_match_used": False,
            "ambiguous_candidates_promoted": False,
        },
    }
    if args.apply:
        for path, payload in containers.items():
            write(path, payload)
    write(REPORT, report)
    REPORT_MD.write_text("\n".join([
        "# Role→area text reconciliation — 2026-10-07",
        "",
        f"Mode: **{report['mode']}**.",
        "",
        f"- Parent-supported area-review rows checked: **{report['counts']['supported_parent_area_review_rows']}**",
        f"- High-confidence same-domain candidates: **{report['counts']['high_confidence_candidates']}**",
        f"- Direct domain routes in domains with no areas: **{report['counts']['direct_domain_roles_in_no_area_domains']}**",
        f"- Applied changes: **{report['counts']['applied_changes']}**",
        "",
        "Ambiguous rows remain review-required; this pass does not imply that every domain role must belong to an area.",
        "",
        f"Machine-readable report: `{REPORT.relative_to(ROOT).as_posix()}`",
        "",
    ]) + "\n", encoding="utf-8")
    print(json.dumps(report["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
