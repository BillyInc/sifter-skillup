"""Disposition the three-item D078 emerging-domain supplement.

Produces a review-only crosswalk; it does not add graph nodes, promote items,
change canonical data, or adjudicate role fit.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
SOURCE = AUDIT / "D078_DOMAIN_WIDE_EMERGING_TASK_SET_ENRICHMENT_2026_10_10.json"
CONTRACT = AUDIT / "d078_domain_learning_contract_2026_10_08.json"
GRAPH = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json"
OUT_JSON = AUDIT / "D078_DOMAIN_WIDE_EMERGING_SUPPLEMENT_DISPOSITION_2026_10_10.json"
OUT_MD = ROOT / "docs/manual-review/D078_DOMAIN_WIDE_EMERGING_SUPPLEMENT_DISPOSITION_2026_10_10.md"

DECISIONS: dict[str, dict[str, Any]] = {
    "d078-ai-assisted-research-operations-human-checks": {
        "disposition": "retain_as_conditional_domain_useful_edge_candidate",
        "distinct_from": ["ai_assisted_and_digital_trace_research_ethics"],
        "rationale": "The existing item governs ethics and data use. This candidate is a bounded work practice: record the AI-assisted step, compare its result with the original source, log human corrections and disclose use where required. Keep it conditional on a permitted task that actually uses AI; do not make AI a shared foundation.",
        "prerequisite_item_ids": ["d078-research-question-design", "d078-care-for-research-data", "ai_assisted_and_digital_trace_research_ethics"],
        "complement_item_ids": ["open_science_preregistration_and_reproducibility", "d078-evaluate-evidence-and-limits"],
        "learning_link_gate": "Resolved for this pass: a free, task-specific university workshop video is linked, alongside official professional/policy references. Remaining visibility gates concern permitted data classes and precise route/task ownership, not absence of a paid resource.",
    },
    "d078-validate-ai-derived-research-measures": {
        "disposition": "retain_as_conditional_quantitative_computational_edge_candidate",
        "distinct_from": ["reliability_validity_and_uncertainty", "measurement_and_operationalisation", "d078_scikit_learn"],
        "rationale": "General measurement and validity are already represented. This candidate narrows that work to checking error and construct/population validity when an AI/ML output is used as a research measure. Predictive performance alone is not measurement validity. It is an optional extension, not a general D078 prerequisite.",
        "prerequisite_item_ids": ["measurement_and_operationalisation", "reliability_validity_and_uncertainty"],
        "complement_item_ids": ["d078_scikit_learn", "d078-computational-social-research", "d078-quantitative-approach"],
        "learning_link_gate": "Resolved for this pass: a free task-specific paper and executable code notebook are linked, with the official AEA article page and an optional structured econometrics course as a paid/audit alternative. The materials are advanced and require prerequisite support; that is a level/route-design issue, not a missing-link reason.",
    },
    "d078-check-language-and-context-validity-in-digital-text": {
        "disposition": "retain_as_conditional_digital_text_useful_edge_candidate",
        "distinct_from": ["d078-computational-social-research", "D078:computational-digital-social-science:content-analysis-and-text-classification"],
        "rationale": "Computational text analysis is already represented; this candidate addresses whether language, register, sampling and human labels support interpreting the intended social concept. It adds a Nigerian multilingual validation example without implying all Nigerian languages or populations are covered.",
        "prerequisite_item_ids": ["d078-computational-social-research", "reliability_validity_and_uncertainty", "measurement_and_operationalisation"],
        "complement_item_ids": ["d078-care-for-research-data", "ai_assisted_and_digital_trace_research_ethics"],
        "learning_link_gate": "Resolved for this pass: free methods tutorials are linked, alongside official GESIS/ACL references and a video supplement. Nigerian benchmark/corpus evidence remains bounded to its documented languages and datasets; it does not establish validity for every Nigerian population.",
    },
}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def main() -> None:
    source, contract, graph = load(SOURCE), load(CONTRACT), load(GRAPH)
    candidates = source.get("candidate_task_sets", [])
    by_id = {row.get("id"): row for row in candidates}
    if set(by_id) != set(DECISIONS):
        raise ValueError(f"Supplement candidate IDs changed: {sorted(by_id)}")

    contract_ids = {
        str(row.get("id"))
        for section in ("existing_inventory", "foundation_and_route_additions", "route_alternatives", "deep_search_options")
        for row in contract.get(section, [])
        if row.get("id")
    }
    graph_ids = {
        str(node.get(key))
        for node in graph.get("nodes", [])
        for key in ("item_id", "contract_id", "id")
        if node.get(key)
    }
    rows = []
    for candidate_id, decision in DECISIONS.items():
        candidate = by_id[candidate_id]
        references = sorted(set(decision["distinct_from"] + decision["prerequisite_item_ids"] + decision["complement_item_ids"]))
        missing = [item_id for item_id in references if item_id not in contract_ids and item_id not in graph_ids]
        if missing:
            raise ValueError(f"Unresolved current-item references for {candidate_id}: {missing}")
        free_links = candidate.get("free_learning_links", [])
        official_links = candidate.get("official_reference_links", [])
        video_links = candidate.get("video_learning_links", [])
        paid_links = candidate.get("paid_learning_alternatives", [])
        if not official_links:
            raise ValueError(f"Missing official/authoritative reference link for {candidate_id}")
        if not free_links and not paid_links and not video_links:
            raise ValueError(f"No learning destination (free, paid or video) for {candidate_id}")
        verified_free_links = [
            link for link in free_links
            if str(link.get("access_status", "")).startswith("verified_")
            and link.get("role", "").startswith("free_")
        ]
        rows.append({
            "candidate_id": candidate_id,
            "candidate_label": candidate["label"],
            **decision,
            "source_evidence_ids": candidate.get("evidence_source_ids", []),
            "source_evidence_present_in_registry": all(
                source_id in {item.get("source_id") for item in source.get("source_registry", [])}
                for source_id in candidate.get("evidence_source_ids", [])
            ),
            "existing_free_link_records": free_links,
            "verified_free_task_specific_learning_link": bool(verified_free_links),
            "verified_free_task_specific_link_count": len(verified_free_links),
            "official_reference_links": official_links,
            "video_learning_links": video_links,
            "paid_learning_alternatives": paid_links,
            "resource_link_disposition": "links_added_and_checked; level_and_route_context_must_be_explained; link_presence_does_not_approve_claim_or_route",
            "existing_contract_candidate": False,
            "graph_node_present": candidate_id in graph_ids,
            "student_visible": False,
            "canonical_change": False,
        })

    payload = {
        "schema_version": "1.0",
        "artifact_type": "D078 domain-wide emerging supplement disposition",
        "reviewed_on": "2026-10-10",
        "status": "conditional_candidates_task_specific_links_resolved_other_route_gates_open",
        "scope_note": "Reconciles only the separate three-item domain-wide supplement against current D078 domain inventory and graph. Does not import excluded legacy skill labels, add graph nodes, change canonical data, approve learner visibility, or reopen role-fit decisions.",
        "counts": {
            "supplement_candidates": len(rows),
            "candidate_dispositions_recorded": len(rows),
            "free_task_specific_learning_links_verified": sum(row["verified_free_task_specific_learning_link"] for row in rows),
            "official_reference_link_records": sum(len(row["official_reference_links"]) for row in rows),
            "video_learning_link_records": sum(len(row["video_learning_links"]) for row in rows),
            "paid_learning_alternative_records": sum(len(row["paid_learning_alternatives"]) for row in rows),
            "graph_nodes_added": 0,
            "student_visible": 0,
            "canonical_changes": 0,
        },
        "records": rows,
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D078 domain-wide emerging supplement disposition - 2026-10-10",
        "",
        "**Status:** conditional candidates with task-specific learning links resolved; other claim, level and route gates remain open. No graph, canonical or student-visible changes.",
        "",
        "The three candidates now have task-specific free learning destinations, separately labelled official references, and a paid alternative or relevant video where useful. A link is not evidence that an item belongs at a particular checkpoint, and it does not by itself approve student display. Remaining item/route/claim gates must still be resolved before adding graph nodes.",
        "",
        "| Candidate | Disposition | Relationship to current inventory | Learning destinations | Remaining claim/route gates |",
        "|---|---|---|---|",
    ]
    for row in rows:
        destinations = f"free {row['verified_free_task_specific_link_count']} verified; official {len(row['official_reference_links'])}; video {len(row['video_learning_links'])}; paid alternative {len(row['paid_learning_alternatives'])}"
        lines.append(f"| {row['candidate_label']} | {row['disposition']} | Distinct from: {', '.join(row['distinct_from'])}; complements: {', '.join(row['complement_item_ids'])} | {destinations} | {row['learning_link_gate']} |")
    lines.extend([
        "",
        "## Guardrails",
        "",
        "- AI is not proposed as a universal foundation or job-readiness credential.",
        "- AI-generated measures are not direct observations; validation and construct/population limits must be explained.",
        "- Nigerian-language examples are bounded examples, not evidence for every language, group or population.",
        "- Do not create duplicate generic AI, text-analysis or ethics cards; preserve the distinct work and connect it to existing items.",
        "- Do not add these candidates to the dependency graph until the full planned inventory and content-contract reconciliation is closed.",
        "- Resource coverage is not a blanket free-course requirement: use a suitable free task-specific resource when available; where none exists after documented search, offer a relevant paid option and official source, or a well-matched instructional video. Mark cost/access and learning level honestly. A generic product page, abstract, or unrelated video does not count as instruction.",
        "",
        f"Machine-readable disposition: `{OUT_JSON.relative_to(ROOT).as_posix()}`.",
    ])
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(payload["counts"], ensure_ascii=False))


if __name__ == "__main__":
    main()
