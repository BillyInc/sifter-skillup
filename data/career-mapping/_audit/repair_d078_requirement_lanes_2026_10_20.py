"""Build the current D078 requirement-lane contract from reviewed local evidence.

This script updates only the lane ledger and its lane-only outputs. The method-
aware route graph is read-only and supplies route/context semantics, not lane
approval. Run with --write to generate the JSON and gzip mirror.
"""

from __future__ import annotations

import argparse
import gzip
import json
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
SOURCE = AUDIT / "D078_REQUIREMENT_LANE_DISPOSITION_2026_10_17.json"
GRAPH = AUDIT / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
HANDOFF = ROOT / "docs/manual-review/D078_METHOD_AWARE_UI_HANDOFF_2026_10_19.md"
OUT = AUDIT / "D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json"
OUT_GZ = AUDIT / "D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json.gz"
SUMMARY = AUDIT / "D078_REQUIREMENT_LANE_REPAIR_SUMMARY_2026_10_20.json"
SUMMARY_MD = ROOT / "docs/manual-review/D078_REQUIREMENT_LANE_REPAIR_SUMMARY_2026_10_20.md"

CORE_IDS = {
    "d078-research-question-design",
    "d078-evaluate-evidence-and-limits",
    "d078-communicate-evidence",
}
OUT_OF_SCOPE = {
    ("domain", "d078-certification-boundaries"): {
        "scope_status": "out_of_scope_non_item_claim",
        "scope_reason": (
            "This record is a universal negative claim about certification availability, "
            "not an affirmative learning item or credential requirement. The attached "
            "education/training and programme sources do not establish that no D078 "
            "professional certification exists. Keep the claim out of the item lane set."
        ),
        "checked_evidence": [
            "Current D078 domain inventory and contract",
            "ESRC postgraduate training guidance",
            "NUC Social Sciences CCMAS 2023",
            "NHREC training guidance",
            "Kobo Essentials training reference",
        ],
    },
    ("role_item", "142:history of philosophy|essential"): {
        "scope_status": "out_of_scope_excluded_role_item",
        "scope_reason": (
            "The source queue row belongs to philosopher, which the current D078 "
            "method-aware graph excludes from its 19 supported roles. Preserve the "
            "source record for audit; do not assign it to a D078 area or another role."
        ),
        "checked_evidence": ["D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and role routes"],
    },
    ("role_item", "160:logic|essential"): {
        "scope_status": "out_of_scope_excluded_role_item",
        "scope_reason": (
            "The source queue row belongs to philosopher, which the current D078 "
            "method-aware graph excludes from its 19 supported roles. Preserve the "
            "source record for audit; do not assign it to a D078 area or another role."
        ),
        "checked_evidence": ["D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and role routes"],
    },
    ("role_item", "55:advertising techniques|optional"): {
        "scope_status": "out_of_scope_unsupported_role_context",
        "scope_reason": (
            "This queue row is assigned only to communication scientist, which has no current role route "
            "in the 2026-10-19 D078 method-aware graph. The graph supports media scientist as a separate "
            "role; this item is not reassigned across those roles without reviewed evidence."
        ),
        "checked_evidence": ["D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes"],
    },
    ("role_item", "81:communication|essential"): {
        "scope_status": "out_of_scope_unsupported_role_context",
        "scope_reason": "This queue row is assigned only to communication scientist, which has no current D078 role route. The current graph lists media scientist separately; no cross-role reassignment is supported.",
        "checked_evidence": ["D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes"],
    },
    ("role_item", "83:conduct psychological research|optional"): {
        "scope_status": "out_of_scope_unsupported_role_context",
        "scope_reason": "This queue row is assigned only to death and dying researcher, which has no current D078 role route. The similar thanatology researcher label is a separate graph role; no cross-role reassignment is supported.",
        "checked_evidence": ["D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes"],
    },
    ("role_item", "116:communication|essential"): {
        "scope_status": "out_of_scope_unsupported_role_context",
        "scope_reason": "This queue row is assigned only to communication scientist, which has no current D078 role route. The current graph lists media scientist separately; no cross-role reassignment is supported.",
        "checked_evidence": ["D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes"],
    },
    ("role_item", "117:ethics|optional"): {
        "scope_status": "out_of_scope_unsupported_role_context",
        "scope_reason": "This queue row is assigned only to death and dying researcher, which has no current D078 role route. The similar thanatology researcher label is a separate graph role; no cross-role reassignment is supported.",
        "checked_evidence": ["D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes"],
    },
    ("role_item", "127:forensic anthropology|optional"): {
        "scope_status": "out_of_scope_unsupported_role_context",
        "scope_reason": "This queue row is assigned only to death and dying researcher, which has no current D078 role route. The similar thanatology researcher label is a separate graph role; no cross-role reassignment is supported.",
        "checked_evidence": ["D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes"],
    },
    ("role_item", "141:history of literature|optional"): {
        "scope_status": "out_of_scope_unsupported_role_context",
        "scope_reason": "This queue row is assigned only to media researcher, which has no current D078 role route. The current graph lists media scientist separately; no cross-role reassignment is supported.",
        "checked_evidence": ["D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes"],
    },
    ("role_item", "143:human physiology|optional"): {
        "scope_status": "out_of_scope_unsupported_role_context",
        "scope_reason": "This queue row is assigned only to death and dying researcher, which has no current D078 role route. The similar thanatology researcher label is a separate graph role; no cross-role reassignment is supported.",
        "checked_evidence": ["D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes"],
    },
}


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def context_text(record: dict, areas: dict[str, str]) -> str:
    kind = record["context_type"]
    key = record.get("context_key")
    if kind == "domain":
        return "the D078 shared domain route"
    if kind == "area":
        return f"the {areas.get(str(key), str(key))} area route"
    if kind == "area_inherited":
        return f"the {areas.get(str(key), str(key))} area task-family route"
    if kind == "role_item":
        roles = record.get("applicable_current_roles") or []
        return f"the {', '.join(roles)} role route" if roles else "the recorded role route"
    if kind == "role_tool":
        return f"the {record.get('applicable_current_roles', [key])[-1]} role tool route"
    return str(key)


def evidence_detail(record: dict) -> tuple[str, str]:
    refs = record.get("evidence_refs") or []
    refs = [ref for ref in refs if isinstance(ref, dict)]
    support = next((str(ref.get("supports", "")).strip() for ref in refs if ref.get("supports")), "")
    limits = next((str(ref.get("limits", ref.get("scope_limit", ""))).strip()
                   for ref in refs if ref.get("limits") or ref.get("scope_limit")), "")
    return support, limits


def current_graph_context(graph: dict):
    areas = {}
    nodes_by_item = defaultdict(list)
    roles = {role_id.rsplit(":", 1)[-1] for role_id in graph.get("supported_role_ids", [])}
    if not roles:
        roles = {row["role_id"].rsplit(":", 1)[-1]
                 for row in graph.get("method_area_role_routes", [])}
    for node in graph.get("nodes", []):
        node_id = node.get("id", "")
        if node.get("kind") == "area_of_specialization":
            areas[node_id] = node.get("label", node_id)
        for key in (node.get("item_id"), node.get("contract_id"), node_id):
            if key:
                nodes_by_item[str(key)].append(node)
    return areas, nodes_by_item, roles


def decide(record: dict, node_index: dict[str, list[dict]]) -> str:
    if (record["context_type"], record["item_id"]) in OUT_OF_SCOPE:
        return "out_of_scope"
    item = record["item_id"]
    if record["context_type"] == "domain" and item in CORE_IDS:
        return "needed_core"
    if record["context_type"] == "domain" and item == "d078-responsible-research":
        return "optional_conditional"
    if record.get("requirement_lane") == "useful_optional":
        return "useful_edge"
    if record.get("requirement_lane") == "unapproved" and item == "d078-casevo-tool":
        # The current route graph places Mesa/Casevo only on the computational
        # social-simulation specialist path; this supports conditional optionality.
        assert any("mesa-or-casevo" in node.get("id", "") for node in node_index.get(
            "area-enrichment-item:d078-computational-digital-social-science-mesa-or-casevo", []
        )) or any("mesa-or-casevo" in str(node).lower() for node in node_index.get(
            "D078:computational-digital-social-science:agent-based-social-simulation", []
        )) or any("mesa-or-casevo" in str(node).lower() for nodes in node_index.values() for node in nodes)
        return "optional_conditional"
    return "optional_conditional"


def rationale(record: dict, lane: str, context: str, graph_nodes: list[dict]) -> str:
    label = record.get("item_label") or record.get("item_id")
    condition = (record.get("condition") or "").strip()
    support, limits = evidence_detail(record)
    graph_condition = next((str(node.get("condition")).strip() for node in graph_nodes
                            if node.get("condition")), "")
    scope = condition or graph_condition
    if lane == "needed_core":
        foundation_note = {
            "d078-research-question-design": "It establishes the question and design that the later evidence work evaluates.",
            "d078-evaluate-evidence-and-limits": "It gives the shared basis for judging what selected evidence can support.",
            "d078-communicate-evidence": "It gives the shared basis for explaining findings and limits to an intended audience.",
        }[record["item_id"]]
        return (f"Needed/core in {context}: {label}. {foundation_note} The 2026-10-19 method-aware "
                "handoff and graph place these three foundations above method choice for every D078 route; "
                "this is a learning-path foundation, not a universal job credential.")
    if lane == "useful_edge":
        if scope:
            why = f"The reviewed task scope is: {scope}"
        elif support:
            why = f"The reviewed evidence links it to: {support}"
        else:
            why = f"The source-resolved item {label} adds a focused extension to this route"
        limit_text = f" The evidence limit is: {limits}" if limits else ""
        return (f"Useful edge in {context}: {label}. {why}. It adds depth where that task or evidence need is "
                f"present, while the reviewed record does not support making it a prerequisite for every route.{limit_text}")
    if record["context_type"] == "role_tool":
        usage = record.get("reviewed_tool_contextual_use", "")
        output = record.get("reviewed_tool_expected_output", "")
        alternatives = record.get("reviewed_tool_alternatives") or []
        alt_text = f" Recorded alternatives include {', '.join(alternatives)}." if alternatives else ""
        return (f"Optional/conditional in {context}: {label}. {usage} The reviewed expected output is: {output}. "
                f"Select only a tool that fits the task; the tool is skippable and does not establish role readiness.{alt_text}")
    if scope:
        why = f"Apply only under this recorded condition: {scope}"
    elif support:
        why = f"Use only when the task needs the documented function: {support}"
    else:
        why = f"Use only when a selected method, task, or output specifically needs {label}"
    if record["context_type"] == "role_tool":
        why += "; choose a suitable alternative from the recorded tool options rather than treating alternatives as cumulative"
    if record["item_id"] == "d078-casevo-tool":
        why = ("Use only for the selected computational social-science route when the task is an agent-based "
               "social simulation and the learner chooses Casevo for that experiment; Mesa is the recorded "
               "alternative. The current method-aware graph makes this specialist route optional.")
    limit_text = f" The evidence limit is: {limits}" if limits else ""
    return (f"Optional/conditional in {context}: {label}. {why}. It is skippable when that condition is absent, "
            f"and its presence does not make the method or role a requirement.{limit_text}")


def build() -> dict:
    source = read_json(SOURCE)
    graph = read_json(GRAPH)
    tool_routes = read_json(AUDIT / "D078_ROLE_TOOL_ROUTE_ENRICHMENT_2026_10_16.json")["routes"]
    tools_by_id = {row["id"]: row for row in tool_routes}
    areas, node_index, roles = current_graph_context(graph)
    graph_foundations = set(graph["foundation_item_ids"])
    assert graph_foundations == {f"domain-item:{item}" for item in CORE_IDS}
    assert len(areas) == 7
    assert len(roles) == 19
    current_role_slugs = {"-".join(role.casefold().split()) for role in roles}
    tool_route_ids = {row["id"] for row in tool_routes}
    for source_row in source["records"]:
        if source_row["context_type"] == "role_item":
            source_roles = source_row.get("context_key")
            source_roles = source_roles if isinstance(source_roles, list) else [source_roles]
        elif source_row["context_type"] == "role_tool":
            source_roles = [str(source_row.get("context_key", "")).split("|", 1)[-1]]
            assert source_row["item_id"] in tool_route_ids
        else:
            continue
        # Source queues include a few merged historical role labels that are not
        # among the current method-aware graph's supported roles. Keep those
        # labels in source_context, but never attribute them to a current role.
        assert any("-".join(str(role).casefold().split()) in current_role_slugs
                   for role in source_roles) or (source_row["context_type"], source_row["item_id"]) in OUT_OF_SCOPE, (source_row["context_type"], source_row["item_id"], source_roles)
    assert "three compulsory foundations" in HANDOFF.read_text(encoding="utf-8").lower()

    records = []
    condition_changes = []
    for original in source["records"]:
        record = dict(original)
        exclusion = OUT_OF_SCOPE.get((record["context_type"], record["item_id"]))
        lane = decide(record, node_index)
        record["prior_requirement_lane"] = record.get("requirement_lane")
        record["requirement_lane"] = lane
        record["scope_status"] = "in_scope" if lane != "out_of_scope" else exclusion["scope_status"]
        record["condition"] = record.get("condition") or None
        if record["context_type"] in {"role_item", "role_tool"}:
            source_roles = record.get("context_key")
            if record["context_type"] == "role_tool":
                source_roles = [str(source_roles).split("|", 1)[-1]]
            elif not isinstance(source_roles, list):
                source_roles = [source_roles]
            current_roles_for_record = [str(role) for role in source_roles
                                        if "-".join(str(role).casefold().split()) in current_role_slugs]
            excluded_roles_for_record = [str(role) for role in source_roles if str(role) not in current_roles_for_record]
            record["applicable_current_roles"] = current_roles_for_record
            record["excluded_source_roles"] = excluded_roles_for_record
        context = context_text(record, areas)
        graph_nodes = node_index.get(record["item_id"], [])
        if record["context_type"] == "area" and record.get("item_label") == record.get("item_id"):
            record["item_label"] = record["item_id"].rsplit(":", 1)[-1].replace("-", " ").capitalize()
        if record["context_type"] == "role_tool":
            tool = tools_by_id.get(record["item_id"], {})
            record["reviewed_tool_contextual_use"] = tool.get("contextual_use", "")
            record["reviewed_tool_expected_output"] = tool.get("expected_output", "")
            record["reviewed_tool_alternatives"] = tool.get("alternatives", [])
        if lane == "out_of_scope":
            record["scope_reason"] = exclusion["scope_reason"]
            record["checked_evidence"] = exclusion["checked_evidence"]
            record["evidence_gap"] = None
            record["rationale"] = exclusion["scope_reason"]
        else:
            record["rationale"] = rationale(record, lane, context, graph_nodes)
            if record["item_id"] == "d078-casevo-tool":
                record["condition"] = (
                    "Only when the learner selects the computational social-science route and an agent-based "
                    "social-simulation task calls for this tool; Mesa remains an alternative."
                )
                record["evidence_gap"] = None
                record["evidence_gap_resolution"] = (
                    "The current 2026-10-19 method-aware graph provides an optional Mesa-or-Casevo path for "
                    "agent-based social simulation; existing Casevo README/tutorial and paper references support "
                    "a bounded tool-use claim, not a requirement claim."
                )
        if record.get("condition") != (original.get("condition") or None):
            condition_changes.append(record["item_id"])
        record["context_summary"] = context
        records.append(record)
    assert condition_changes == ["d078-casevo-tool"], condition_changes

    by_context = defaultdict(Counter)
    lanes = Counter()
    context_counts = Counter()
    for row in records:
        context_counts[row["context_type"]] += 1
        by_context[row["context_type"]][row["requirement_lane"]] += 1
        lanes[row["requirement_lane"]] += 1
    in_scope = sum(lanes[lane] for lane in ("needed_core", "useful_edge", "optional_conditional"))
    assert lanes == Counter({"optional_conditional": 355, "useful_edge": 132, "needed_core": 3, "out_of_scope": 11}), lanes
    assert in_scope == 490
    assert all(row.get("rationale") and row.get("context_summary") for row in records)
    assert not any(row.get("evidence_gap") for row in records if row["scope_status"] == "in_scope")
    assert len({(row["context_type"], json.dumps(row.get("context_key"), sort_keys=True), row["item_id"])
                for row in records}) == len(records)

    return {
        "schema_version": "2026-10-20.d078.requirement-lane-disposition.v2",
        "reviewed_on": "2026-10-20",
        "status": "locally_repaired_contract; route_graph_read_only; no_sql_or_runtime_promotion",
        "policy": {
            "lane_values": ["needed_core", "useful_edge", "optional_conditional", "out_of_scope"],
            "needed_core_scope": "Only the three shared D078 learning-path foundations before method choice; not universal role credentials.",
            "method_aware_routing": "After foundations, selected methods and named combinations determine visible routes; selection does not imply a role requirement.",
            "conditionality": "Retain each reviewed route/task condition; method-specific, area-specific, role-specific, tool, and combination choices remain skippable outside their condition.",
            "role_fit_and_ordering": "Unchanged. This contract classifies learning items only; it does not revise role fit, dependency ordering, graph edges, or sequence.",
            "out_of_scope": "Retain non-item claims and graph-excluded source rows for audit, but exclude them from item disposition counts.",
            "evidence_standard": "Use the checked-in reviewed item evidence and the current method-aware route contract; do not infer requirements from role frequency, stale aggregates, or graph visibility flags.",
        },
        "source_artifacts": [
            "data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_17.json",
            "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json",
            "docs/manual-review/D078_METHOD_AWARE_UI_HANDOFF_2026_10_19.md",
            "data/career-mapping/_audit/D078_ITEM_PROMOTION_DISPOSITIONS_2026_10_12.json",
            "data/career-mapping/_audit/D078_AREA_DISPOSITIONS_SOCI_ECON_2026_10_12.json",
            "data/career-mapping/_audit/D078_AREA_DISPOSITIONS_POL_GOV_PSYCH_2026_10_12.json",
            "data/career-mapping/_audit/D078_ROLE_TOOL_ROUTE_ENRICHMENT_2026_10_16.json",
            "data/career-mapping/_audit/D078_FULL_ROUTE_LEARNING_ITEM_CONTRACT_AUDIT_2026_10_10.json",
        ],
        "counts": {
            "records_total": len(records),
            "records_in_scope": in_scope,
            "out_of_scope": lanes["out_of_scope"],
            "by_context_type": dict(context_counts),
            "by_disposition": {lane: lanes[lane] for lane in ["needed_core", "useful_edge", "optional_conditional", "out_of_scope"]},
            "by_context_type_and_disposition": {key: dict(value) for key, value in by_context.items()},
            "canonical_areas": len(areas),
            "current_roles": len(roles),
            "residual_unresolved_in_scope": 0,
            "stale_aggregate_corrections": {
                "ledger_records_actually_needed": 4,
                "ledger_summary_reported_needed": 3,
                "ledger_records_actually_conditional": 261,
                "ledger_summary_reported_conditional": 262,
                "reconciled_reason": "One conditional responsibility item had been counted as needed; detail rows override the stale aggregate, and the method-aware contract leaves it conditional when people or sensitive data are involved.",
            },
            "other_historical_flags_reconciled": [
                {
                    "artifact": "D078_AREA_DISPOSITIONS_SOCI_ECON_2026_10_12.json",
                    "stale_field": "scope.pending_count=56",
                    "individual_evidence": "56 unique records; 28 promote, 22 promote_scoped, 6 exclude; validation.pending_cases=0, unresolved_source_identity_cases=0, explicit_contract_gap_cases=0.",
                    "current_interpretation": "The pending_count is stale; do not mark the 56 individually decided area items pending.",
                },
                {
                    "artifact": "D078_ITEM_PROMOTION_DISPOSITIONS_2026_10_12.json",
                    "stale_field": "not_decided_by_this_tranche.remaining_area_item_count=105 and remaining_domain_item_count=50",
                    "individual_evidence": "The current 501-row ledger has all 144 expanded area records and all 53 domain records dispositioned; the area rows are covered by the 39-item promotion tranche and two area handoffs (56 and 49 records).",
                    "current_interpretation": "These are historical tranche remainder counts, not current pending state; individual current lane records control.",
                },
            ],
        },
        "validation": {
            "exact_source_record_count": len(records) == 501,
            "all_three_current_graph_foundations_needed_core": lanes["needed_core"] == 3,
            "seven_canonical_areas": len(areas) == 7,
            "nineteen_current_roles": len(roles) == 19,
            "all_in_scope_records_have_item_specific_rationale_and_context": all(
                row.get("rationale") and row.get("context_summary") for row in records if row["scope_status"] == "in_scope"
            ),
            "all_in_scope_gaps_resolved_or_out_of_scope": not any(
                row.get("evidence_gap") for row in records if row["scope_status"] == "in_scope"
            ),
            "casevo_scoped_to_selected_simulation_route": any(
                row["item_id"] == "d078-casevo-tool" and row["requirement_lane"] == "optional_conditional"
                and "agent-based social-simulation" in (row.get("condition") or "")
                for row in records
            ),
            "all_other_reviewed_task_route_conditions_preserved": condition_changes == ["d078-casevo-tool"],
            "graph_and_sequence_unchanged": True,
        },
        "records": records,
    }


def summary_for(contract: dict) -> dict:
    graph = read_json(GRAPH)
    area_labels = {node["id"]: node.get("label", node["id"])
                   for node in graph.get("nodes", []) if node.get("kind") == "area_of_specialization"}
    area_keys_by_slug = {area_id.split(":", 1)[-1].casefold().removeprefix("d078-"): area_id for area_id in area_labels}
    role_ids = sorted({row["role_id"] for row in graph.get("method_area_role_routes", [])})
    roles = {role_id.rsplit(":", 1)[-1]: Counter() for role_id in role_ids}
    areas = {area_id: Counter() for area_id in area_labels}
    domain = Counter()
    for row in contract["records"]:
        lane = row["requirement_lane"]
        if row["context_type"] == "domain":
            domain[lane] += 1
        elif row["context_type"] in {"area", "area_inherited"}:
            context_slug = str(row.get("context_key", "")).rsplit(":", 1)[-1].casefold().removeprefix("d078-")
            area_id = area_keys_by_slug.get(context_slug)
            if area_id:
                areas[area_id][lane] += 1
        elif row["context_type"] in {"role_item", "role_tool"}:
            context = row.get("context_key")
            if row["context_type"] == "role_tool":
                context_roles = [str(context).split("|", 1)[-1]]
            else:
                context_roles = context if isinstance(context, list) else [context]
            for role in context_roles:
                role_slug = "-".join(str(role).casefold().split())
                if role_slug in roles:
                    roles[role_slug][lane] += 1
    return {
        "schema_version": "2026-10-20.d078.requirement-lane-summary.v1",
        "contract": OUT.as_posix(),
        "route_context_source": GRAPH.as_posix(),
        "counts": contract["counts"],
        "domain": dict(domain),
        "canonical_areas": {
            area_id: {"label": area_labels[area_id], "by_disposition": dict(areas[area_id]),
                      "items_total": sum(areas[area_id].values())}
            for area_id in sorted(areas)
        },
        "current_roles": {
            role: {"by_disposition": dict(roles[role]), "items_total": sum(roles[role].values())}
            for role in sorted(roles)
        },
        "residual_unresolved": [],
        "out_of_scope_records": [
            {"context_type": row["context_type"], "context_key": row["context_key"],
             "item_id": row["item_id"], "reason": row["scope_reason"],
             "checked_evidence": row["checked_evidence"]}
            for row in contract["records"] if row["requirement_lane"] == "out_of_scope"
        ],
        "method_aware_reading": (
            "The 2026-10-19 handoff and graph control route visibility and task conditions. "
            "Only the three shared foundations are needed/core before method choice; method, combination, "
            "area, role, and tool items stay scoped to their selected route or task."
        ),
    }


def markdown_summary(summary: dict) -> str:
    counts = summary["counts"]
    lines = [
        "# D078 requirement-lane repair summary — 2026-10-20",
        "",
        "The 2026-10-20 contract uses the current method-aware graph for route context. The graph and its dependency ordering were read only.",
        "",
        f"- In-scope items: **{counts['records_in_scope']}**",
        f"- Needed/core: **{counts['by_disposition']['needed_core']}**",
        f"- Useful edge: **{counts['by_disposition']['useful_edge']}**",
        f"- Optional/conditional: **{counts['by_disposition']['optional_conditional']}**",
        f"- Out-of-scope audit rows: **{counts['out_of_scope']}**",
        f"- Residual genuinely unresolved in-scope items: **{counts['residual_unresolved_in_scope']}**",
        "",
        "## Domain",
        "",
        "| Disposition | Records |",
        "|---|---:|",
    ]
    for lane, number in summary["domain"].items():
        lines.append(f"| {lane} | {number} |")
    lines.extend(["", "## Seven canonical areas", "", "| Area | Needed/core | Useful edge | Optional/conditional | Out of scope | Total |", "|---|---:|---:|---:|---:|---:|"])
    for area in summary["canonical_areas"].values():
        d = area["by_disposition"]
        lines.append(f"| {area['label']} | {d.get('needed_core', 0)} | {d.get('useful_edge', 0)} | {d.get('optional_conditional', 0)} | {d.get('out_of_scope', 0)} | {area['items_total']} |")
    lines.extend(["", "## Current roles", "", "| Role | Needed/core | Useful edge | Optional/conditional | Out of scope | Total |", "|---|---:|---:|---:|---:|---:|"])
    for role, data in summary["current_roles"].items():
        d = data["by_disposition"]
        lines.append(f"| {role} | {d.get('needed_core', 0)} | {d.get('useful_edge', 0)} | {d.get('optional_conditional', 0)} | {d.get('out_of_scope', 0)} | {data['items_total']} |")
    lines.extend(["", "## Out-of-scope evidence notes", ""])
    for row in summary["out_of_scope_records"]:
        lines.append(f"- `{row['item_id']}` ({row['context_type']}): {row['reason']} Checked: {'; '.join(row['checked_evidence'])}.")
    lines.extend(["", "## Aggregate repair", "", "The 10/17 detail rows contain four needed records and 261 conditional records, while its summary reports three and 262. The current graph identifies three shared foundations. Responsible research is conditional when a task involves people or identifiable/sensitive data. The Sociology/Economics 10/12 pending_count of 56 is stale (56 individually decided, validation.pending_cases=0); the 10/12 tranche remainder counts (105 area, 50 domain) are historical, not current pending state. Counts here are recomputed from individual rows.", "", "## Files and boundaries", "", f"- Contract: `{OUT.as_posix()}`", f"- Current route context: `{GRAPH.as_posix()}`", f"- Current handoff: `{HANDOFF.as_posix()}`", "- No graph, route ordering, taxonomy, role-fit/ownership, explanation/UI, SQL, or migration changes.", ""])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="write the repaired JSON and gzip mirror")
    args = parser.parse_args()
    result = build()
    encoded = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    summary = summary_for(result)
    summary_encoded = json.dumps(summary, ensure_ascii=False, indent=2) + "\n"
    if args.write:
        OUT.write_text(encoded, encoding="utf-8")
        with gzip.open(OUT_GZ, "wt", encoding="utf-8", newline="\n") as handle:
            handle.write(encoded)
        SUMMARY.write_text(summary_encoded, encoding="utf-8")
        SUMMARY_MD.write_text(markdown_summary(summary), encoding="utf-8")
        print(f"wrote {OUT}")
        print(f"wrote {OUT_GZ}")
        print(f"wrote {SUMMARY}")
        print(f"wrote {SUMMARY_MD}")
    else:
        if not OUT.exists() or OUT.read_text(encoding="utf-8") != encoded:
            raise SystemExit("contract is missing or stale; rerun with --write")
        if not SUMMARY.exists() or SUMMARY.read_text(encoding="utf-8") != summary_encoded:
            raise SystemExit("derived JSON summary is missing or stale; rerun with --write")
        if not SUMMARY_MD.exists() or SUMMARY_MD.read_text(encoding="utf-8") != markdown_summary(summary):
            raise SystemExit("derived Markdown summary is missing or stale; rerun with --write")
        with gzip.open(OUT_GZ, "rt", encoding="utf-8") as handle:
            if handle.read() != encoded:
                raise SystemExit("gzip mirror differs from the authoritative JSON")
        print("contract, summaries, and gzip mirror match regenerated reviewed rows")
    print(json.dumps(result["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
