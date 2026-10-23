"""Keep D078 relationship-resolution records aligned with corrected graph edges."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
LEDGER = AUDIT / "D078_RELATIONSHIP_RESOLUTION_2026_10_20.json"
GRAPH = AUDIT / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
CHECKPOINT = AUDIT / "D078_RELATIONSHIP_ROUTE_REPAIR_2026_10_20.json"

EXPLANATORY = {
    4: "AI-assisted harmonisation may be discussed alongside manual codebook comparison, but that phrase is not a separately resolved selectable item in the current graph.",
    5: "Document analysis is a distinct method, not the canonical destination for data harmonisation. Keep this note explanatory unless a route-specific data-harmonisation item is added.",
    7: "Manual variable crosswalks are a valid alternative workflow, but the referenced area task-family record remains a nonselectable candidate. Preserve the comparison as explanatory prose.",
    8: "Rule-based transformations are a valid alternative workflow, but the referenced area task-family record remains a nonselectable candidate. Preserve the comparison as explanatory prose.",
    16: "AI-assisted metadata drafting extends ordinary data documentation; it is not an alternative to the broader research-data-care item.",
    17: "Repository templates and rule-based validation are workflow components, not alternatives to the broader research-data-care item.",
    18: "Human curator review remains part of responsible AI-assisted curation; it is not an alternative learning item to research-data care.",
    42: "The note describes when AI-specific provenance is unnecessary; document analysis is not an alternative tool or method for AI-use validation.",
    46: "Synthetic respondents are an experimental simulation topic under ABM, not an alternative or destination within survey research.",
    80: "An empirical design may answer a different question from simulation, but a simulation tool is not a selectable alternative to survey or archival methods.",
    84: "Casevo is a specialist workflow built on Mesa, not an alternative to Mesa; the corrected specialist-extension relationship is recorded separately.",
    84: "Casevo is a specialist workflow built on Mesa, not a separate alternative to Mesa; its ABM use is represented by the corrected specialist-extension edge.",
    86: "Mesa is an ABM implementation tool, not an alternative to quantitative, qualitative, or survey methods. Keep that distinction explanatory.",
    94: "Manual coding with a documented codebook is a method practice, not a software alternative item. Retain this as explanatory context for NVivo.",
}

def main() -> None:
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    rows = {int(x["id"].split(":")[-1]): x for x in ledger["records"]}
    changed = []
    for i, rationale in EXPLANATORY.items():
        row = rows[i]
        row["resolution_state"] = "resolved_explanatory_only"
        row["display_readiness"] = "explanatory_only"
        row["student_visible"] = False
        row["target_ids"] = []
        row["rationale"] = rationale
        row["resolution_note"] = "Semantics reviewed; no student-clickable item-to-item destination is asserted for this annotation."
        changed.append(row["id"])

    for i in (54, 55, 57, 58, 59, 63, 64, 66, 67, 68):
        row = rows[i]
        row["relationship"] = "alternative_tool_option"
        row["resolution_state"] = "resolved_ready_for_use"
        row["display_readiness"] = "clickable_when_projected"
        row["student_visible"] = True
        row["skippable"] = True
        row["blocking_policy"] = "never"
        row["sequence_policy"] = "none"
        row["rationale"] = "This is a scoped tool choice for a reporting task; compare the exact output, access, reproducibility and data-sharing needs."
        if i == 57:
            row["target_ids"] = ["domain-emerging:d078-tableau-research-visualisation-tool"]
        elif i == 66:
            row["target_ids"] = ["domain-emerging:d078-power-bi-research-reporting-tool"]

    row = rows[78]
    row["relationship"] = "specialist_extension_of"
    row["target_ids"] = ["domain-item:d078-mesa-tool"]
    row["rationale"] = "Casevo is a specialist cognitive-agent workflow built on Mesa; this edge describes extension, not substitution."
    row = rows[79]
    row["relationship"] = "alternative_tool_option"
    row["target_ids"] = ["domain-item:d078-netlogo-tool"]
    row["target_label"] = "NetLogo for a different agent-based modelling workflow"
    row["rationale"] = "Casevo and NetLogo are distinct ABM implementations; this comparison is available only on the scoped ABM route and does not assert model validity."
    row = rows[85]
    row["relationship"] = "alternative_tool_option"
    row["target_ids"] = ["domain-item:d078-netlogo-tool"]
    row["target_label"] = "NetLogo as another agent-based modelling environment"
    row["rationale"] = "Mesa and NetLogo are distinct ABM environments; the learner can compare them on an ABM route."
    row = rows[95]
    row["relationship"] = "alternative_tool_option"
    row["target_ids"] = ["domain-item:d078-qualitative-coding-tool"]
    row["target_label"] = "Taguette, a separate qualitative document-coding tool"
    row["rationale"] = "Taguette and NVivo are separate products. The combined area prompt is explanatory only; the individual canonical tool records are selectable on text-analysis routes."
    for i in (78, 79, 85, 95):
        rows[i]["resolution_state"] = "resolved_ready_for_use"
        rows[i]["display_readiness"] = "clickable_when_projected"
        rows[i]["student_visible"] = True
        rows[i]["skippable"] = True
        rows[i]["blocking_policy"] = "never"
        rows[i]["sequence_policy"] = "none"

    counts = {}
    for row in ledger["records"]:
        counts[row["resolution_state"]] = counts.get(row["resolution_state"], 0) + 1
    ledger["summary"].update({
        "resolution_state_counts": counts,
        "resolved_ready_for_use": counts.get("resolved_ready_for_use", 0),
        "resolved_explanatory_only": counts.get("resolved_explanatory_only", 0),
        "unresolved_after_exhaustive_search": counts.get("unresolved_after_exhaustive_search", 0),
        "all_nonblocking": all(r.get("blocking_policy") == "never" for r in ledger["records"]),
        "student_approval_flags_do_not_override_this_resolution": True,
        "last_route_reconciliation": "2026-10-20",
        "explanatory_records_are_not_student_destinations": True,
    })
    LEDGER.write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8")) if CHECKPOINT.exists() else {}
    checkpoint.update({
        "ledger": str(LEDGER),
        "ledger_records_reclassified_explanatory_only": [f"d078-relres:{i:03d}" for i in EXPLANATORY],
        "ledger_records_corrected_or_retargeted": [f"d078-relres:{i:03d}" for i in (57,58,59,66,67,68,78,79,85,95)],
        "ledger_summary": ledger["summary"],
        "relationship_source_policy": "Canonical selectable targets only; unavailable candidate targets remain in explanatory provenance rather than click-through edges.",
    })
    CHECKPOINT.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"explanatory_only": len(EXPLANATORY), "corrected_or_retargeted": 10, "summary": ledger["summary"]}, ensure_ascii=False))

if __name__ == "__main__":
    main()
