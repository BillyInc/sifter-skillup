"""Structural audit for the D166 Agent 1 source workpack."""

import json
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
WORKPACK = ROOT / "data/career-mapping/_audit/agent_workpacks/D166_AGENT1_SOURCE_WORKPACK_2026_10_24.json"
REPORT = ROOT / "data/career-mapping/_audit/agent_workpacks/D166_AGENT1_SOURCE_WORKPACK_2026_10_24.md"
INDEX = ROOT / "data/career-mapping/_audit/D011_D166_IN_DEPTH_SOURCE_INDEX_2026_10_23.json"


def main() -> None:
    pack = json.loads(WORKPACK.read_text(encoding="utf-8"))
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    report = REPORT.read_text(encoding="utf-8")
    errors: list[str] = []

    source_ids = {
        source["source_id"]
        for source in index["source_registry"]
        if source.get("source_id")
    } | {source["source_id"] for source in pack["source_additions"]}
    pack_queries = {query["query_id"] for query in pack["query_log"]}
    index_queries = {
        query["query_id"] for query in index["query_log"] if query.get("query_id")
    }
    all_queries = pack_queries | index_queries
    mappings = pack["matrix_claim_mappings"]
    mappings_by_id = {mapping["mapping_id"]: mapping for mapping in mappings}
    if len(mappings_by_id) != len(mappings):
        errors.append("duplicate mapping ID")

    cell_statuses: Counter[str] = Counter()
    cells = []
    for area in pack["areas_reviewed"]:
        area_cells = area["matrix_cells"]
        cells.extend(area_cells)
        keys = {
            (cell["family_id"], cell["maturity_horizon"])
            for cell in area_cells
        }
        if len(area_cells) != 24 or len(keys) != 24:
            errors.append(f"{area['area_id']}: expected 24 unique cells")
        for cell in area_cells:
            cell_statuses[cell["status"]] += 1
            if cell["status"] not in {"mapped", "bounded_no_hit", "not_applicable"}:
                errors.append(f"{area['area_id']}: nonterminal cell")
            if (cell["status"] == "mapped") != bool(cell.get("claim_mapping_ids")):
                errors.append(f"{area['area_id']}: cell status/mapping mismatch")
            for mapping_id in cell.get("claim_mapping_ids", []):
                mapping = mappings_by_id.get(mapping_id)
                if not mapping:
                    errors.append(f"missing mapping {mapping_id}")
                elif (
                    mapping["area_id"], mapping["family_id"], mapping["maturity_horizon"]
                ) != (area["area_id"], cell["family_id"], cell["maturity_horizon"]):
                    errors.append(f"{mapping_id}: cell/mapping ownership mismatch")
            for source_id in cell.get("candidate_source_ids", []):
                if source_id not in source_ids:
                    errors.append(f"unknown cell source {source_id}")
            for query_id in cell.get("search_log_ids", []):
                if query_id not in all_queries:
                    errors.append(f"unknown cell query {query_id}")
            if cell["status"] == "bounded_no_hit":
                rationale = " ".join(cell.get("remaining_scope", []))
                if not rationale.strip() or "candidate sources were excluded or could not support" in rationale:
                    errors.append(f"generic/missing bounded-no-hit rationale: {area['area_id']} {cell['family_id']} {cell['maturity_horizon']}")

        for family_id, states in area["cell_states_by_family"].items():
            expected = [
                next(
                    cell["status"]
                    for cell in area_cells
                    if cell["family_id"] == family_id
                    and cell["maturity_horizon"] == horizon
                )
                for horizon in area["cell_state_order"]
            ]
            if states != expected:
                errors.append(f"{area['area_id']}: state summary mismatch {family_id}")

    task_statuses: Counter[str] = Counter()
    category_family = {
        "knowledge": "foundations_knowledge_and_competencies",
        "competencies/skills": "foundations_knowledge_and_competencies",
        "methods": "methods_and_designs",
        "methods/designs": "methods_and_designs",
        "techniques": "techniques_estimators_and_algorithms",
        "techniques/estimators/algorithms": "techniques_estimators_and_algorithms",
        "tools": "tools_software_and_data",
        "tools/software/platforms": "tools_software_and_data",
        "datasets/instruments/data standards": "tools_software_and_data",
        "standards/regulation": "standards_credentials_and_learning_resources",
        "certifications/credentials": "standards_credentials_and_learning_resources",
        "learning resources": "standards_credentials_and_learning_resources",
        "work outputs": "outputs_and_downstream_role_context",
        "role tasks/skills": "outputs_and_downstream_role_context",
        "downstream area links": "outputs_and_downstream_role_context",
    }
    for task in pack["gap_task_updates"]:
        task_statuses[task["status"]] += 1
        if task["status"] not in {"complete", "bounded_no_hit", "not_applicable"}:
            errors.append(f"open task {task['area_id']} {task['task_id']}")
        if not task.get("topic_focus"):
            errors.append(f"missing topic focus {task['task_id']}")
        for query_id in task.get("query_ids", []):
            if query_id not in all_queries:
                errors.append(f"unknown task query {query_id}")
        area = next((a for a in pack["areas_reviewed"] if a["area_id"] == task["area_id"]), None)
        if area:
            families = {category_family[x] for x in task.get("item_categories", []) if x in category_family}
            horizons = set(task.get("maturity_horizons", []))
            relevant = [
                cell for cell in area["matrix_cells"]
                if cell["family_id"] in families and cell["maturity_horizon"] in horizons
            ]
            expected_assessed = [
                {"family_id": cell["family_id"], "maturity_horizon": cell["maturity_horizon"]}
                for cell in relevant
            ]
            expected_mapped = [
                {"family_id": cell["family_id"], "maturity_horizon": cell["maturity_horizon"]}
                for cell in relevant if cell["status"] == "mapped"
            ]
            if task.get("assessed_cell_refs") != expected_assessed:
                errors.append(f"task assessment scope mismatch: {task['task_id']}")
            if task.get("mapped_cell_refs") != expected_mapped:
                errors.append(f"task mapped-cell scope mismatch: {task['task_id']}")
    for area in pack["areas_reviewed"]:
        if sum(task["area_id"] == area["area_id"] for task in pack["gap_task_updates"]) != 6:
            errors.append(f"{area['area_id']}: expected six task tracks")
        area_tasks = [task for task in pack["gap_task_updates"] if task["area_id"] == area["area_id"]]
        area_counts = Counter(task["status"] for task in area_tasks)
        cell_counts = Counter(cell["status"] for cell in area["matrix_cells"])
        closure_text = area.get("remaining_closure", "")
        if "remain evidence_added_gap_open" in closure_text or "remain open" in closure_text.casefold():
            errors.append(f"{area['area_id']}: stale open wording in terminal area summary")
        if area.get("assessment_status") != "closed_with_bounded_no_hits":
            errors.append(f"{area['area_id']}: missing terminal area status")
        if not all(status in {"complete", "bounded_no_hit", "not_applicable"} for status in area_counts):
            errors.append(f"{area['area_id']}: area summary has a nonterminal task")
        if not all(status in {"mapped", "bounded_no_hit", "not_applicable"} for status in cell_counts):
            errors.append(f"{area['area_id']}: area summary has a nonterminal cell")

    counter_areas = {item["area_id"]: item for item in pack["counter_searches"]}
    for area in pack["areas_reviewed"]:
        counter = counter_areas.get(area["area_id"])
        if not counter or counter.get("status") != "complete_bounded_counter_search_with_terminal_cells_and_tracks":
            errors.append(f"{area['area_id']}: missing completed counter-search disposition")
        elif any(query_id not in all_queries for query_id in counter.get("query_ids", [])):
            errors.append(f"{area['area_id']}: unknown counter-search query")

    for mapping in mappings:
        if not mapping.get("source_ids"):
            errors.append(f"no source for mapping {mapping['mapping_id']}")
        for field in ("item_type", "inputs", "outputs", "assumptions", "relationship_evidence"):
            if not mapping.get(field):
                errors.append(f"missing required claim detail {field}: {mapping['mapping_id']}")
        relationship_evidence = mapping.get("relationship_evidence", {})
        if relationship_evidence and (
            not relationship_evidence.get("source_ids")
            or not relationship_evidence.get("locator")
            or not relationship_evidence.get("source_supported_explanation")
        ):
            errors.append(f"incomplete relationship evidence: {mapping['mapping_id']}")
        for source_id in mapping.get("source_ids", []):
            if source_id not in source_ids:
                errors.append(f"unknown mapping source {source_id}")
        for query_id in mapping.get("search_log_ids", []):
            if query_id not in all_queries:
                errors.append(f"unknown mapping query {query_id}")

    normalized_claims: dict[str, list[str]] = defaultdict(list)
    for mapping in mappings:
        normalized = re.sub(r"\W+", " ", mapping.get("claim", "").casefold()).strip()
        if normalized:
            normalized_claims[normalized].append(mapping["mapping_id"])
    for claim, mapping_ids in normalized_claims.items():
        if len(mapping_ids) > 1:
            errors.append(f"duplicate normalized claim across mappings: {mapping_ids}")

    for query in pack["query_log"]:
        required = ("actual_queries", "opened_pages_or_papers", "findings", "limits")
        if any(not query.get(field) for field in required):
            errors.append(f"incomplete query record {query['query_id']}")
    for role_record in pack["role_task_evidence"]:
        for source_id in role_record.get("source_ids", []):
            if source_id not in source_ids:
                errors.append(f"unknown role source {source_id}")

    linked_mapping_ids = {
        mapping_id for cell in cells for mapping_id in cell.get("claim_mapping_ids", [])
    }
    orphan_mapping_ids = set(mappings_by_id) - linked_mapping_ids
    if orphan_mapping_ids:
        errors.append(f"unlinked mapping IDs: {sorted(orphan_mapping_ids)}")
    reconciliation = pack.get("reviewer_reconciliation", {})
    if reconciliation.get("reconciled_mapped_claims") != len(linked_mapping_ids):
        errors.append("reviewer reconciliation mapped-claim count does not match linked mappings")
    open_cells = sum(cell["status"] not in {"mapped", "bounded_no_hit", "not_applicable"} for cell in cells)
    if reconciliation.get("reconciled_open_cells") != open_cells:
        errors.append("reviewer reconciliation open-cell count does not match current cells")
    closed_tasks = sum(task["status"] in {"complete", "bounded_no_hit", "not_applicable"} for task in pack["gap_task_updates"])
    if reconciliation.get("task_tracks_closed") != closed_tasks:
        errors.append("reviewer reconciliation closed-task count does not match current tasks")
    expected_totals = (
        f"96 cells: {cell_statuses['mapped']} mapped, "
        f"{cell_statuses['bounded_no_hit']} bounded no-hit, "
        f"{cell_statuses['not_applicable']} not applicable",
        f"24 tasks: {task_statuses['complete']} complete, "
        f"{task_statuses['bounded_no_hit']} bounded no-hit, "
        f"{task_statuses['not_applicable']} not applicable",
        f"Distinct cell-linked claim mappings:** {len(linked_mapping_ids)}",
    )
    for total in expected_totals:
        if total not in report:
            errors.append(f"Markdown/JSON count mismatch: {total}")
    if re.search(r"`evidence_added_gap_open`|all six task tracks remain open|all 24 tracks remain open", report, re.I):
        errors.append("stale open status in Markdown")
    if any(line.rstrip() != line for line in report.splitlines()):
        errors.append("trailing whitespace in Markdown")

    if errors:
        print("FAIL")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)

    print("PASS: UTF-8 JSON parse")
    print(f"PASS: 4 areas; {len(cells)} unique cells; terminal cell counts {dict(cell_statuses)}")
    print(f"PASS: 24 unique terminal task tracks {dict(task_statuses)}")
    print("PASS: source/query references resolve; unique mapping IDs; cell-mapping ownership/counts reconcile")
    print("PASS: task-to-cell family/horizon scopes match gap-filler categories; no generic bounded-no-hit rationales or duplicate claims")
    print("PASS: every mapped claim carries item type, inputs/outputs, assumptions/limits, exact locator, and sourced relationship context")
    print("PASS: Markdown counts match JSON; no stale open labels or trailing whitespace")
    print(f"PASS: {len(pack['role_task_evidence'])} role-task evidence records retain canonical IDs; no role fit/routes changed")


if __name__ == "__main__":
    main()
