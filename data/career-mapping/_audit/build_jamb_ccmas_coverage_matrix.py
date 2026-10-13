"""Build a compact, source-preserving coverage matrix for JAMB/CCMAS bridges.

This audit is deliberately derived from the checked-in inheritance artifact.  It
does not infer a curriculum from a name and it does not write SQL.  Component
fan-out is reported as a review queue because several JAMB names sharing one
CCMAS component is not, by itself, proof that the component is a full
curriculum for each name.
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
CANONICAL_PATH = HERE / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
MAPPING_PATH = ROOT / "programme_mapping.json"
SCOPE_PATH = HERE / "jamb_curriculum_scopes_2026-08-17.json"
OUT_JSON = HERE / "jamb_ccmas_curriculum_coverage_matrix_2026-09-28.json"
OUT_MD = HERE / "JAMB_CCMAS_CURRICULUM_COVERAGE_MATRIX_2026-09-28.md"

REVIEW_STATES = {"review_required", "external_review_required"}
UNAVAILABLE_STATES = {
    "unavailable",
    "not_available",
    "not_seeded",
    "missing",
    "no_data",
}


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def row_state(row: dict[str, Any]) -> str:
    """Return the stored state without turning unknown/review states into ready."""

    raw = row.get("mapping_status") or row.get("data_state") or row.get("scope_status")
    if not raw:
        return "unavailable"
    if str(raw).lower() in UNAVAILABLE_STATES:
        return "unavailable"
    return str(raw)


def state_summary(rows: list[dict[str, Any]]) -> dict[str, Any]:
    states = Counter(row_state(row) for row in rows)
    return {
        "states": dict(sorted(states.items())),
        "review_required": sum(states[state] for state in REVIEW_STATES),
        "unavailable": states["unavailable"],
    }


def component_disciplines(row: dict[str, Any]) -> list[str]:
    return sorted(
        {
            ref.split("::", 1)[0]
            for ref in row.get("component_refs", [])
            if "::" in ref and not ref.startswith("__custom__::")
        }
    )


def category_rows(rows: list[dict[str, Any]], inheritance_type: str) -> list[dict[str, Any]]:
    return [row for row in rows if row.get("inheritance_type") == inheritance_type]


def make_category(
    rows: list[dict[str, Any]],
    *,
    category: str,
    label: str,
    evidence_basis: str,
    next_action: str,
) -> dict[str, Any]:
    summary = state_summary(rows)
    return {
        "category": category,
        "label": label,
        "rows": len(rows),
        "share_of_jamb_rows": round(len(rows) / 420, 4),
        "states": summary["states"],
        "review_required": summary["review_required"],
        "unavailable": summary["unavailable"],
        "evidence_basis": evidence_basis,
        "next_action": next_action,
        "jamb_names": sorted(row["jamb_name"] for row in rows),
    }


def build_matrix() -> dict[str, Any]:
    canonical = load_json(CANONICAL_PATH)
    mappings = load_json(MAPPING_PATH)["mappings"]
    scopes = load_json(SCOPE_PATH)["rows"]
    rows = canonical["rows"]
    mapping_by_name = {row["jamb_name"]: row for row in mappings}
    scope_by_name = {row["jamb_name"]: row for row in scopes}

    if len(rows) != len(mapping_by_name) or len(rows) != len(scope_by_name):
        raise ValueError("canonical, programme mapping, and scope artifacts do not cover the same rows")
    if len({row["jamb_name"] for row in rows}) != len(rows):
        raise ValueError("canonical inheritance artifact contains duplicate JAMB names")

    categories = [
        make_category(
            category_rows(rows, "partial_curriculum_scope"),
            category="partial_curriculum_scope",
            label="Partial CCMAS curriculum scope",
            evidence_basis="Reviewed course-scoped CCMAS slices; only anchored domain links may be exposed.",
            next_action="Retain course locators; externally enrich only missing or ambiguous programme evidence.",
        ),
        make_category(
            category_rows(rows, "combined_ccmas_curriculum"),
            category="combined_ccmas_curriculum",
            label="Combined CCMAS components",
            evidence_basis="Explicit primary plus supporting component references; links are the reviewed component union.",
            next_action="Audit component-specific curriculum and relationship evidence; do not collapse the components.",
        ),
        make_category(
            category_rows(rows, "external_sources_required"),
            category="external_sources_required",
            label="No CCMAS standard / external evidence required",
            evidence_basis="D_custom rows with external scope; no unscoped CCMAS fan-out is permitted.",
            next_action="Add authoritative external curriculum/industry sources or keep the row review-only/unavailable.",
        ),
        make_category(
            category_rows(rows, "single_ccmas_full_curriculum"),
            category="single_ccmas_full_curriculum",
            label="Single full CCMAS curriculum (baseline)",
            evidence_basis="One resolved CCMAS programme inherited in full; this is the comparison baseline.",
            next_action="Continue source and downstream audits where domain evidence remains review-required.",
        ),
    ]

    combined = category_rows(rows, "combined_ccmas_curriculum")
    combined_multi_discipline = [row for row in combined if len(component_disciplines(row)) >= 2]
    combined_custom = [
        row for row in combined if any(ref.startswith("__custom__::") for ref in row.get("component_refs", []))
    ]

    component_members: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        for component_ref in set(row.get("component_refs", [])):
            component_members[component_ref].append(row)

    fanout = []
    for component_ref, members in sorted(component_members.items()):
        names = sorted({row["jamb_name"] for row in members})
        if len(names) < 2:
            continue
        unique_members = [next(row for row in members if row["jamb_name"] == name) for name in names]
        summary = state_summary(unique_members)
        fanout.append(
            {
                "component_ref": component_ref,
                "jamb_row_count": len(names),
                "jamb_names": names,
                "inheritance_types": dict(
                    sorted(Counter(row["inheritance_type"] for row in unique_members).items())
                ),
                "states": summary["states"],
                "review_required": summary["review_required"],
                "unavailable": summary["unavailable"],
                "disposition": "fanout_review_required",
            }
        )

    fanout_names = {name for item in fanout for name in item["jamb_names"]}
    fanout_state_counts = Counter(
        row_state(row) for row in rows if row["jamb_name"] in fanout_names
    )

    raw_mapping_states = Counter(row_state(row) for row in rows)
    matrix = {
        "schema_version": 1,
        "generated_from": [
            str(CANONICAL_PATH.relative_to(ROOT.parent)),
            str(MAPPING_PATH.relative_to(ROOT.parent)),
            str(SCOPE_PATH.relative_to(ROOT.parent)),
        ],
        "contract": {
            "denominator": "JAMB names in the canonical inheritance artifact (not the 237 CCMAS programme curriculum rows).",
            "partial": "A course-scoped partial CCMAS bridge; it must not inherit the full parent curriculum.",
            "no_ccmas": "D_custom/external scope; it must not inherit an unscoped CCMAS curriculum.",
            "multi_discipline": "A combined row with two or more named CCMAS disciplines; component-level combinations within one discipline remain combined but are not counted as multi-discipline.",
            "split": "A CCMAS component referenced by two or more JAMB names. This is an overlapping fan-out review queue, not proof of a separate full curriculum for each name.",
            "states": "Stored review_required and unavailable states are retained; no state is promoted by this report.",
        },
        "totals": {
            "jamb_rows": len(rows),
            "unique_jamb_names": len({row["jamb_name"] for row in rows}),
            "raw_mapping_states": dict(sorted(raw_mapping_states.items())),
            "review_required": sum(raw_mapping_states[state] for state in REVIEW_STATES),
            "unavailable": raw_mapping_states["unavailable"],
        },
        "categories": categories,
        "combined_detail": {
            "combined_rows": len(combined),
            "rows_with_two_or_more_named_ccmas_disciplines": len(combined_multi_discipline),
            "rows_with_custom_external_component": len(combined_custom),
            "rows_not_spanning_two_or_more_named_ccmas_disciplines": len(combined)
            - len(combined_multi_discipline),
            "multi_discipline_jamb_names": sorted(row["jamb_name"] for row in combined_multi_discipline),
        },
        "split_fanout_review_queue": {
            "component_count": len(fanout),
            "unique_jamb_row_count": len(fanout_names),
            "states": dict(sorted(fanout_state_counts.items())),
            "review_required": sum(fanout_state_counts[state] for state in REVIEW_STATES),
            "unavailable": fanout_state_counts["unavailable"],
            "components": fanout,
        },
        "source_state_guard": {
            "review_required_jamb_names": sorted(
                row["jamb_name"] for row in rows if row_state(row) in REVIEW_STATES
            ),
            "unavailable_jamb_names": sorted(
                row["jamb_name"] for row in rows if row_state(row) == "unavailable"
            ),
        },
    }
    return matrix


def render_markdown(matrix: dict[str, Any]) -> str:
    totals = matrix["totals"]
    lines = [
        "# JAMB/CCMAS curriculum coverage matrix",
        "",
        "Generated from the checked-in inheritance, programme-mapping, and curriculum-scope audit artifacts. This is a local audit only; it does not apply SQL or change student exposure.",
        "",
        f"Denominator: **{totals['jamb_rows']}** unique JAMB names. Stored states: **{totals['review_required']} `review_required`**, **{totals['unavailable']} `unavailable`**.",
        "",
        "## Coverage",
        "",
        "| Case | JAMB rows | Share | Review-required | Unavailable | Evidence / handling |",
        "| --- | ---: | ---: | ---: | ---: | --- |",
    ]
    for item in matrix["categories"]:
        lines.append(
            f"| {item['label']} | {item['rows']} | {item['share_of_jamb_rows']:.1%} | {item['review_required']} | {item['unavailable']} | {item['evidence_basis']} |"
        )
    combined = matrix["combined_detail"]
    fanout = matrix["split_fanout_review_queue"]
    lines.extend(
        [
            "",
            "## Multi-discipline and split checks",
            "",
            f"- Combined rows: **{combined['combined_rows']}**; **{combined['rows_with_two_or_more_named_ccmas_disciplines']}** span two or more named CCMAS disciplines, **{combined['rows_with_custom_external_component']}** include a custom/external component, and **{combined['rows_not_spanning_two_or_more_named_ccmas_disciplines']}** do not span two or more named CCMAS disciplines.",
            f"- Split/fan-out review queue: **{fanout['component_count']}** CCMAS components are referenced by **{fanout['unique_jamb_row_count']}** overlapping JAMB rows. These rows are not an additional category and are not automatically promoted to full curriculum coverage.",
            f"- Fan-out states: `{json.dumps(fanout['states'], sort_keys=True)}`; review-required rows: **{fanout['review_required']}**; unavailable rows: **{fanout['unavailable']}**.",
            "",
            "## Guardrails",
            "",
            "- Partial rows expose only their recorded course-scoped evidence.",
            "- No-CCMAS rows remain external-source cases; missing evidence must remain `review_required` or `unavailable`.",
            "- Combined rows retain component references and are not collapsed into a single discipline.",
            "- Fan-out is a review queue for source enrichment, not a claim that every JAMB label has an independent CCMAS curriculum.",
            "",
            "The machine-readable matrix and focused regression test sit beside this report.",
            "",
        ]
    )
    return "\n".join(lines)


if __name__ == "__main__":
    matrix = build_matrix()
    OUT_JSON.write_text(json.dumps(matrix, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(matrix), encoding="utf-8")
    print(f"wrote {OUT_JSON}")
    print(f"wrote {OUT_MD}")
