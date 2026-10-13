"""Append area-boundary statements missing from the captured D113-D168 reviews."""

from __future__ import annotations

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
REGISTER = HERE / "d113_d168_step1_reconciliation_register_2026_10_06.json"
OUT = HERE / "d113_d168_area_boundary_amendment_002.json"
CHECKPOINT = HERE / "D113_D168_STEP1_RECONCILIATION_CHECKPOINT_002.md"


def main() -> None:
    if OUT.exists() or CHECKPOINT.exists():
        raise SystemExit("Append-only amendment already exists; refusing to overwrite.")
    data = json.loads(REGISTER.read_text(encoding="utf-8"))
    amendments = []
    for row in data["records"]:
        areas = row["recommended_final_student_facing_areas"]
        for area in areas:
            source_boundary = area.get("route_boundary", "").strip()
            if source_boundary:
                boundary = source_boundary
                basis = "captured_in_domain_review"
            else:
                sibling_labels = [other["label"] for other in areas if other["label"] != area["label"]]
                boundary = (
                    f"Primary focus: {area.get('scope') or area['label']}. "
                    + (f"Distinguish this area from sibling routes ({'; '.join(sibling_labels)}) by this focus; " if sibling_labels else "")
                    + "do not infer fit from ISCO membership or role linkage."
                )
                basis = "transparent_internal_boundary_synthesis_from_captured_area_scopes"
            amendments.append(
                {
                    "domain_id": row["domain_id"],
                    "domain_name": row["domain_name"],
                    "area_label": area["label"],
                    "boundary_statement": boundary,
                    "boundary_basis": basis,
                    "source_review_artifact": row["source_review_artifact"],
                    "not_external_source_quote": basis != "captured_in_domain_review",
                }
            )
    coverage = {row["domain_id"] for row in data["records"]}
    if len(coverage) != 56 or not all(a["boundary_statement"] for a in amendments):
        raise SystemExit("Boundary amendment coverage gate failed.")
    payload = {
        "schema_version": "2026-10-06.step1-specialization-boundary-amendment.v1",
        "append_only_amendment": "002",
        "amends_register": REGISTER.name,
        "scope": {"first_domain_id": "D113", "last_domain_id": "D168", "domain_count": 56},
        "area_boundary_count": len(amendments),
        "source_review_boundary_count": sum(not a["not_external_source_quote"] for a in amendments),
        "internally_synthesized_boundary_count": sum(a["not_external_source_quote"] for a in amendments),
        "records": amendments,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D113–D168 STEP 1 Reconciliation — Checkpoint 002",
        "",
        "This append-only supplement supplies an explicit one-sentence route boundary for every candidate area in register 001. It does not change the base register or canonical taxonomy.",
        "",
        f"- Domains covered: **56/56**",
        f"- Candidate areas with explicit boundary statements: **{len(amendments)}**",
        f"- Boundaries directly captured in source reviews: **{payload['source_review_boundary_count']}**",
        f"- Transparent internal scope-based boundary syntheses: **{payload['internally_synthesized_boundary_count']}**",
        "- No-area/direct-route dispositions: **4**, so no area boundary applies.",
        "- Boundary syntheses are not external-source quotations or role/ISCO-fit evidence.",
        "",
        "## Boundaries",
        "",
    ]
    for row in amendments:
        lines.append(f"- **{row['domain_id']} {row['area_label']}** — {row['boundary_statement']} (basis: `{row['boundary_basis']}`; review: `{row['source_review_artifact']}`).")
    CHECKPOINT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({k: payload[k] for k in ("scope", "area_boundary_count", "source_review_boundary_count", "internally_synthesized_boundary_count")}, indent=2))
    print(OUT)
    print(CHECKPOINT)


if __name__ == "__main__":
    main()
