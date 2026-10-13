"""Apply the completed Nigerian-context ledgers to current domain records.

The global area-of-specialization labels remain unchanged.  This is an
additive context overlay: domain-scoped Nigerian evidence stays domain-scoped
and area-scoped evidence is attached only to the exact global area label in
the evidence ledger.  No role, ISCO route, subgroup label, or global area is
created or inferred here.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from copy import deepcopy
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
DOMAIN_STRUCTURE = ROOT / "domain_structure.json"
GLOBAL = (
    AUDIT
    / "specialization_lanes_2026_10_05"
    / "STEP1_RECONCILIATION_2026_10_06"
    / "global_step1_specialization_reconciliation_2026_10_06.json"
)
LEDGERS = [
    AUDIT
    / "nigerian_context_lanes_2026_10_06"
    / "D001_D056"
    / "D001_D056_nigerian_context_final_2026_10_06.json",
    AUDIT
    / "specialization_lanes_2026_10_05"
    / "STEP1_RECONCILIATION_2026_10_06"
    / "STEP2_NIGERIAN_CONTEXT_2026_10_06"
    / "D057_D112"
    / "D057_D112_nigerian_context_evidence_2026_10_06.json",
    AUDIT
    / "specialization_lanes_2026_10_05"
    / "STEP1_RECONCILIATION_2026_10_06"
    / "STEP2_NIGERIAN_CONTEXT_2026_10_06"
    / "D113_D168_nigerian_context_evidence_2026_10_06.json",
]
REPORT = AUDIT / "nigerian_area_context_domain_structure_apply_2026_10_06.json"
REPORT_MD = AUDIT / "NIGERIAN_AREA_CONTEXT_DOMAIN_STRUCTURE_APPLY_2026_10_06.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def records(payload: dict[str, Any]) -> list[dict[str, Any]]:
    rows = payload.get("records") or payload.get("entries") or payload.get("evidence_records") or []
    return [row for row in rows if isinstance(row, dict) and row.get("domain_id")]


def compact(row: dict[str, Any]) -> dict[str, Any]:
    aliases = {
        "global_area_label": ("global_area_label", "area_label"),
        "global_area_boundary": ("global_area_boundary", "area_boundary"),
        "exact_nigerian_claim": ("exact_nigerian_claim", "exact_local_claim"),
        "exact_url": ("exact_url", "authoritative_nigerian_url"),
        "limits": ("limits", "limitation"),
        "source_publisher": ("source_publisher", "authority_kind"),
        "source_title": ("source_title",),
        "source_id": ("source_id",),
        "locator": ("locator",),
        "access_date": ("access_date",),
        "scope": ("scope",),
        "confidence": ("confidence",),
        "evidence_status": ("evidence_status",),
        "disposition": ("disposition",),
        "what_it_supports": ("what_it_supports",),
        "domain_id": ("domain_id",),
        "domain_name": ("domain_name",),
    }
    normalized: dict[str, Any] = {}
    for target, candidates in aliases.items():
        for candidate in candidates:
            if candidate in row:
                normalized[target] = row[candidate]
                break
    return normalized


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    structure = load(DOMAIN_STRUCTURE)
    global_register = load(GLOBAL)
    all_rows: list[dict[str, Any]] = []
    missing_ledgers: list[str] = []
    for path in LEDGERS:
        if not path.exists():
            missing_ledgers.append(str(path.relative_to(ROOT)))
            continue
        all_rows.extend(compact(row) for row in records(load(path)))

    by_domain: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in all_rows:
        by_domain[str(row["domain_id"])].append(row)

    # Use the finalized global register as the only source of area labels.
    global_areas: dict[str, dict[str, list[dict[str, Any]]]] = defaultdict(lambda: defaultdict(list))
    for domain in global_register.get("domains", []):
        domain_id = str(domain["domain_id"])
        for area in domain.get("recommended_areas") or []:
            if isinstance(area, dict) and area.get("label"):
                global_areas[domain_id][str(area["label"])]
    for row in all_rows:
        label = row.get("global_area_label")
        if label:
            global_areas[str(row["domain_id"])][str(label)].append(row)

    changed_domains = 0
    domain_record_count = 0
    area_record_count = 0
    exact_subgroup_matches = 0
    action_counts: Counter[str] = Counter()

    for domain_id, domain in structure.items():
        if not isinstance(domain, dict):
            continue
        rows = by_domain.get(str(domain_id), [])
        domain_rows = [row for row in rows if row.get("scope") == "domain"]
        area_rows: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for row in rows:
            label = row.get("global_area_label")
            if label:
                area_rows[str(label)].append(row)

        overlay = {
            "schema_version": "2026-10-06.nigerian-area-context-overlay.v1",
            "scope_rule": "Domain evidence remains domain-scoped; area evidence is attached only by exact global area label.",
            "global_area_labels_preserved": True,
            "roles_or_routes_changed": False,
            "domain_context": domain_rows,
            "area_of_specialization_context": [
                {
                    "area_label": label,
                    "area_boundary": next(
                        (
                            area.get("boundary")
                            for area in global_register.get("domains", [])
                            if str(area.get("domain_id")) == str(domain_id)
                            for area in (area.get("recommended_areas") or [])
                            if isinstance(area, dict) and area.get("label") == label
                        ),
                        None,
                    ),
                    "records": area_rows.get(label, []),
                    "disposition_counts": dict(Counter(row.get("disposition", "unknown") for row in area_rows.get(label, []))),
                    "area_specific_evidence_present": any(
                        row.get("scope") == "area" and row.get("disposition") == "nigeria_specific_overlay_supported"
                        for row in area_rows.get(label, [])
                    ),
                    "not_claimed_when_absent": "No Nigerian area-specific licensing, demand, curriculum, or practice claim is inferred from parent-domain evidence.",
                }
                for label in global_areas.get(str(domain_id), {})
            ],
        }
        if overlay["domain_context"] or overlay["area_of_specialization_context"]:
            prior = domain.get("nigerian_area_context")
            domain["nigerian_area_context"] = overlay
            if prior != overlay:
                changed_domains += 1
        domain_record_count += len(domain_rows)
        area_record_count += sum(len(rows_for_label) for rows_for_label in area_rows.values())
        action_counts.update(row.get("disposition", "unknown") for row in rows)

        # If a canonical subgroup already has exactly the same global area
        # label, attach the same bounded overlay to that subgroup too.  Do not
        # infer a match from similarity or from ISCO membership.
        for subgroup in domain.get("subgroups") or []:
            if not isinstance(subgroup, dict):
                continue
            label = subgroup.get("label")
            if label in area_rows:
                subgroup["nigerian_area_context"] = {
                    "area_label": label,
                    "records": deepcopy(area_rows[label]),
                    "exact_label_match": True,
                }
                exact_subgroup_matches += 1

    report = {
        "schema_version": "2026-10-06.nigerian-area-context-domain-structure-apply.v1",
        "dry_run": not args.apply,
        "source_ledgers": [str(path.relative_to(ROOT)) for path in LEDGERS],
        "missing_ledgers": missing_ledgers,
        "global_register": str(GLOBAL.relative_to(ROOT)),
        "domain_count": len([value for value in structure.values() if isinstance(value, dict)]),
        "changed_domain_count": changed_domains,
        "domain_evidence_record_count": domain_record_count,
        "area_evidence_record_count": area_record_count,
        "exact_subgroup_label_matches": exact_subgroup_matches,
        "disposition_counts": dict(action_counts),
        "guards": {
            "global_area_labels_changed": False,
            "subgroup_labels_changed": False,
            "roles_or_routes_changed": False,
            "domain_evidence_promoted_to_area": False,
            "isco_used_as_area_match": False,
        },
    }
    if args.apply:
        DOMAIN_STRUCTURE.write_text(json.dumps(structure, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_MD.write_text(
        "\n".join(
            [
                "# Nigerian context applied to domain/subgroup-area records — 2026-10-06",
                "",
                f"Mode: **{'APPLIED' if args.apply else 'DRY RUN'}**.",
                "",
                f"Domains changed: **{changed_domains}**; domain evidence records: **{domain_record_count}**; area evidence records: **{area_record_count}**.",
                f"Exact existing subgroup-label matches: **{exact_subgroup_matches}**.",
                "",
                "The global area labels and subgroup labels were not changed. Domain-scoped Nigerian evidence was not promoted to area evidence. Area evidence was attached only when the ledger supplied the exact global area label.",
                "",
                "Roles and routes were not changed by this pass.",
                "",
            ]
        ),
        encoding="utf-8",
    )
    print(json.dumps({key: report[key] for key in ("dry_run", "changed_domain_count", "domain_evidence_record_count", "area_evidence_record_count", "exact_subgroup_label_matches", "disposition_counts")}, indent=2))


if __name__ == "__main__":
    main()
