"""Write the D113-D168 area-fit proof interim checkpoint.

This is an append-only inventory checkpoint.  It deliberately reports the
existing Step 1 candidate areas and citation counts; those citations are not
treated as direct-fit proof until the Step 3 evidence rows are written.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[6]
INPUT = (
    ROOT
    / "data/career-mapping/_audit/specialization_lanes_2026_10_05/"
    / "STEP1_RECONCILIATION_2026_10_06/AGENT_D113_D168/"
    / "d113_d168_step1_reconciliation_register_2026_10_06_v005.json"
)
OUT = Path(__file__).resolve().parent
JSON_OUT = OUT / "D113_D168_AREA_FIT_PROOF_INTERIM_CHECKPOINT_2026_10_06.json"
MD_OUT = OUT / "D113_D168_AREA_FIT_PROOF_INTERIM_CHECKPOINT_2026_10_06.md"


def main() -> None:
    payload = json.loads(INPUT.read_text(encoding="utf-8"))
    domains = []
    area_count = 0
    captured_source_count = 0
    no_specialization_count = 0
    for record in payload["records"]:
        areas = (
            record.get("final_student_facing_areas")
            or record.get("recommended_final_student_facing_areas")
            or []
        )
        area_labels = [area.get("label") for area in areas if area.get("label")]
        area_count += len(area_labels)
        sources = record.get("captured_domain_sources") or []
        captured_source_count += len(sources)
        if not area_labels:
            no_specialization_count += 1
        domains.append(
            {
                "domain_id": record["domain_id"],
                "domain_name": record["domain_name"],
                "step1_status": record.get("resolution_status"),
                "step1_disposition": record.get("disposition"),
                "areas": area_labels,
                "step1_captured_source_records": len(sources),
                "step3_direct_fit_proof_status": "not_started",
            }
        )
    result = {
        "artifact": "D113-D168 direct area-fit proof interim checkpoint",
        "date": "2026-10-06",
        "append_only": True,
        "lane": "D113-D168",
        "scope": "Inventory before direct external area-fit verification",
        "excluded": [
            "Nigerian context enrichment",
            "role audit or role assignment",
            "canonical taxonomy edits",
            "generated Nigerian worklist as evidence",
        ],
        "counts": {
            "domains_in_lane": len(domains),
            "step1_area_entries": area_count,
            "domains_with_no_step1_area_set": no_specialization_count,
            "step1_captured_source_records": captured_source_count,
            "step3_direct_fit_proof_records_written": 0,
        },
        "domains": domains,
        "note": (
            "The source count is the count of citations captured in the Step 1 "
            "register, not independently verified direct area-fit proof."
        ),
    }
    OUT.mkdir(parents=True, exist_ok=True)
    JSON_OUT.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    lines = [
        "# D113-D168 Direct Area-Fit Proof — Interim Checkpoint (2026-10-06)",
        "",
        "This append-only checkpoint inventories the Step 1 candidate areas before direct external verification.",
        "It does not claim that the captured Step 1 citations are already direct-fit proof.",
        "",
        "## Scope and counts",
        "",
        f"- Domains in lane: **{len(domains)}**",
        f"- Step 1 area entries: **{area_count}**",
        f"- Domains with no Step 1 area set: **{no_specialization_count}**",
        f"- Step 1 captured citation records: **{captured_source_count}**",
        "- Step 3 direct-fit proof records written at this checkpoint: **0**",
        "",
        "Excluded: Nigerian enrichment, role audit/assignment, canonical taxonomy edits, and the generated Nigerian worklist as evidence.",
        "",
        "## Domain/area inventory",
        "",
        "| ID | Domain | Step 1 areas | Captured Step 1 citations | Step 3 status |",
        "|---|---|---|---:|---|",
    ]
    for domain in domains:
        areas = "; ".join(domain["areas"]) or "(none — direct domain→role candidate)"
        lines.append(
            f"| {domain['domain_id']} | {domain['domain_name']} | {areas} "
            f"| {domain['step1_captured_source_records']} | not started |"
        )
    MD_OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
