#!/usr/bin/env python3
"""Conservative continuation of the catalogue-wide role -> subgroup audit.

Run 009 established the complete active role -> subgroup population and left
1,577 rows conditional.  This continuation compares task evidence with the
current domain and subgroup scope, and records an append-only adjudication
register.  It does not edit the taxonomy, role library, or overlays.

The comparison deliberately does not use role titles, ISCO membership, or
current subgroup membership as evidence.  A positive classification is still
an audit disposition, not canonical semantic sign-off.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
BASELINE = AUDIT / "role_to_subgroup_semantic_register_2026_10_06_009.json"
INVENTORY = AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json"
STRUCTURE = ROOT / "domain_structure.json"
DOMAIN_META = ROOT / "domain_meta.json"
DOMAIN_REVIEWS = AUDIT / "domain_specialization_review_2026_10_03.json"
ROUTE_GATES = AUDIT / "reclassified_role_route_gates_2026_10_06.json"
DEFAULT_RUN_ID = "010"

EXCLUDED_STATES = {"excluded", "review_only", "audit_only"}

# These words occur as general connective language in many role descriptions
# and subgroup cards.  They may remain in the recorded evidence, but they do
# not count as a distinguishing task/scope anchor.
GENERIC = {
    "about", "across", "activities", "activity", "administration", "analysis",
    "application", "applications", "based", "business", "care", "common", "computer",
    "computerised", "computing", "control", "controls", "create", "creating", "data",
    "development", "develop", "design", "digital", "engineering", "equipment", "field",
    "function", "functions", "general", "implement", "implementation", "information",
    "infrastructure", "install", "installation", "management", "maintain", "maintenance",
    "method", "methods", "operation", "operations", "process", "processes", "product",
    "production", "professional", "provide", "quality", "research", "service", "services",
    "software", "support", "system", "systems", "technical", "technology", "technology-based",
    "use", "used", "using", "work", "working", "works", "role", "roles", "task", "tasks",
    "they", "them", "their", "there", "those", "which", "where", "most", "many", "each",
    "both", "one", "two", "other", "others", "several", "including", "ensure", "ensuring",
    "responsible", "perform", "performed", "performing", "specialised", "specialized", "specific",
}

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "can", "for", "from", "in", "into",
    "is", "it", "of", "on", "or", "that", "the", "their", "this", "to", "with", "within",
    "through", "such", "often", "also", "may", "will", "should", "under", "across", "based",
}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return " ".join(text(item) for item in value)
    if isinstance(value, dict):
        return " ".join(text(item) for item in value.values())
    return str(value).strip()


def normalize(value: Any) -> str:
    return re.sub(r"\s+", " ", text(value).casefold()).strip()


def stem(token: str) -> str:
    token = token.casefold()
    for suffix in ("ications", "ation", "ments", "ment", "ings", "ing", "ers", "ies", "es", "s"):
        if len(token) > len(suffix) + 3 and token.endswith(suffix):
            return token[:-len(suffix)] if suffix != "ies" else token[:-3] + "y"
    return token


def words(value: Any) -> list[str]:
    return [stem(item) for item in re.findall(r"[a-z][a-z0-9]+", normalize(value))]


def evidence_tokens(value: Any) -> set[str]:
    return {
        token for token in words(value)
        if len(token) >= 4 and token not in STOPWORDS and token not in GENERIC
    }


def evidence_ngrams(value: Any) -> set[str]:
    # Keep the original order after removing connective and generic words.
    # This is a transparent phrase screen; the task text remains the proof
    # material recorded in each entry.
    filtered = [
        token for token in words(value)
        if len(token) >= 4 and token not in STOPWORDS and token not in GENERIC
    ]
    return {
        " ".join(filtered[index:index + size])
        for size in (2, 3)
        for index in range(len(filtered) - size + 1)
    }


def role_key(row: dict[str, Any]) -> str:
    return text(row.get("role_key")) or f"{text(row.get('domain_id'))}|{text(row.get('role_name'))}"


def scope_text(subgroup: dict[str, Any]) -> str:
    return " ".join(filter(None, (text(subgroup.get("label")), text(subgroup.get("description")))))


def active_subgroups(structure: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    result: dict[str, list[dict[str, Any]]] = {}
    for domain_id, domain in structure.items():
        result[domain_id] = [
            subgroup for subgroup in domain.get("subgroups") or []
            if normalize(subgroup.get("data_state") or "active") not in EXCLUDED_STATES
            and text(subgroup.get("isco_submajor"))
        ]
    return result


def domain_scope(meta: dict[str, Any], domain_id: str) -> str:
    row = meta.get(domain_id) or {}
    return " ".join(filter(None, (text(row.get("domain_name")), text(row.get("description")))))


def compare_scope(task_evidence: str, current_subgroup: dict[str, Any] | None, candidates: list[dict[str, Any]], parent_scope: str) -> dict[str, Any]:
    task_tokens = evidence_tokens(task_evidence)
    task_ngrams = evidence_ngrams(task_evidence)

    def score(subgroup: dict[str, Any]) -> dict[str, Any]:
        scope = scope_text(subgroup)
        scope_tokens = evidence_tokens(scope)
        overlap = sorted(task_tokens & scope_tokens)
        phrases = sorted(task_ngrams & evidence_ngrams(scope))
        value = len(overlap) + (2 * len(phrases))
        return {
            "isco_submajor": text(subgroup.get("isco_submajor")),
            "label": text(subgroup.get("label")),
            "description": text(subgroup.get("description")),
            "overlap_terms": overlap,
            "overlap_phrases": phrases,
            "score": value,
        }

    all_scores = sorted((score(item) for item in candidates), key=lambda item: (-item["score"], item["isco_submajor"]))
    current_code = text((current_subgroup or {}).get("isco_submajor"))
    current = next((item for item in all_scores if item["isco_submajor"] == current_code), None)
    parent_tokens = evidence_tokens(parent_scope)
    parent_overlap = sorted(task_tokens & parent_tokens)
    parent_phrases = sorted(task_ngrams & evidence_ngrams(parent_scope))
    parent_score = len(parent_overlap) + (2 * len(parent_phrases))
    return {
        "task_evidence_token_count": len(task_tokens),
        "current_subgroup": current,
        "alternative_subgroup_scores": all_scores,
        "best_subgroup": all_scores[0] if all_scores else None,
        "parent_scope_overlap_terms": parent_overlap,
        "parent_scope_overlap_phrases": parent_phrases,
        "parent_scope_score": parent_score,
    }


def classify_comparison(comparison: dict[str, Any], has_current_path: bool, route_disposition: str = "") -> tuple[str, str]:
    current = comparison.get("current_subgroup") or {}
    best = comparison.get("best_subgroup") or {}
    current_score = int(current.get("score") or 0)
    best_score = int(best.get("score") or 0)
    parent_score = int(comparison.get("parent_scope_score") or 0)
    current_is_best = bool(current and best and current.get("isco_submajor") == best.get("isco_submajor"))
    task_count = int(comparison.get("task_evidence_token_count") or 0)

    if task_count == 0:
        return "conditional", "task evidence has no distinguishing terms for a scope comparison"
    if route_disposition == "direct_domain_role_route_candidate":
        return "direct-domain-role", "domain review explicitly proposes a direct domain-to-role route"
    if has_current_path and current_score <= 1 and best_score >= 4 and not current_is_best and best_score - current_score >= 2:
        return "wrong subgroup", "role task evidence fits another visible subgroup materially better than the current path"
    if best_score >= 4 and current_is_best and (len(current.get("overlap_phrases") or []) >= 1 or current_score >= 5):
        return "supported", "role task evidence has multiple distinguishing anchors to the current subgroup scope"
    if not has_current_path and best_score >= 4:
        return "supported", "role task evidence has multiple distinguishing anchors to an available subgroup scope"
    if not has_current_path and route_disposition in {"needs_supported_specialization_layer", "needs_role_enrichment_before_subgroup_decision"}:
        return "missing specialization/role", "the domain route is gated pending a supported specialization or role layer"
    if has_current_path and parent_score >= 4 and best_score <= 1:
        return "direct-domain-role", "task evidence supports the parent domain but no visible subgroup scope"
    if not has_current_path and parent_score >= 4 and best_score <= 1:
        return "missing specialization/role", "task evidence supports the parent domain but no available subgroup scope"
    return "conditional", "task/domain evidence does not safely distinguish a supported subgroup, direct route, or missing layer"


def current_subgroup_for(entry: dict[str, Any], subgroup_map: dict[str, list[dict[str, Any]]]) -> dict[str, Any] | None:
    code = text(entry.get("subgroup_code"))
    return next((item for item in subgroup_map.get(text(entry.get("domain_id")), []) if text(item.get("isco_submajor")) == code), None)


def load_role_map(inventory: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {role_key(row): row for row in inventory.get("role_mappings") or []}


def route_classification(route: dict[str, Any]) -> tuple[str, str]:
    if route["active_role_count"] == 0:
        return "missing specialization/role", "domain has neither an active role mapping nor a visible subgroup route"
    disposition = text(route.get("route_disposition"))
    if disposition == "direct_domain_role_route_candidate":
        return "direct-domain-role", "domain-level source review explicitly permits a direct domain-to-role route"
    if disposition in {"needs_supported_specialization_layer", "needs_role_enrichment_before_subgroup_decision"}:
        return "missing specialization/role", "domain-level evidence identifies a missing specialization or role layer before student routing"
    return "conditional", "domain has active roles but no source-grounded route decision for the missing subgroup layer"


def gated_route_entry(gate: dict[str, Any], role: dict[str, Any], route: dict[str, Any], subgroups: list[dict[str, Any]], meta: dict[str, Any]) -> dict[str, Any]:
    comparison = compare_scope(
        text(role.get("role_description")) + " " + text(role.get("role_fit_review_basis")),
        None,
        subgroups,
        domain_scope(meta, text(role.get("domain_id"))),
    )
    classification, reason = classify_comparison(
        comparison,
        has_current_path=False,
        route_disposition=text(route.get("route_disposition")),
    )
    return {
        "role_key": gate["role_key"],
        "domain_id": text(role.get("domain_id")),
        "domain_name": text(role.get("domain_name")),
        "role_name": text(role.get("role_name")),
        "role_task_evidence": text(role.get("role_description")) or text(role.get("role_fit_review_basis")),
        "target_isco_group": text(gate.get("error", {}).get("isco_group")),
        "route_gate_error": text(gate.get("error", {}).get("error")),
        "route_disposition": text(route.get("route_disposition")),
        "comparison": comparison,
        "classification": classification,
        "classification_reason": reason,
        "used_role_title_as_evidence": False,
        "isco_membership_used_as_fit_proof": False,
        "current_subgroup_membership_used_as_fit_proof": False,
        "semantic_signoff": False,
    }


def build_register(run_id: str) -> dict[str, Any]:
    baseline = read_json(BASELINE)
    inventory = read_json(INVENTORY)
    structure = read_json(STRUCTURE)
    meta = read_json(DOMAIN_META)
    gates_doc = read_json(ROUTE_GATES)
    subgroup_map = active_subgroups(structure)
    role_map = load_role_map(inventory)
    baseline_conditionals = [
        entry for entry in baseline.get("entries") or []
        if text(entry.get("disposition")) == "conditional_insufficient_evidence"
    ]
    route_by_domain = {text(item.get("domain_id")): item for item in baseline.get("domain_route_assessments") or []}

    entries = []
    for entry in baseline_conditionals:
        domain_id = text(entry.get("domain_id"))
        current_subgroup = current_subgroup_for(entry, subgroup_map)
        comparison = compare_scope(
            text(entry.get("role_task_evidence")),
            current_subgroup,
            subgroup_map.get(domain_id, []),
            domain_scope(meta, domain_id),
        )
        classification, reason = classify_comparison(
            comparison,
            has_current_path=True,
            route_disposition=text((route_by_domain.get(domain_id) or {}).get("route_disposition")),
        )
        entries.append({
            "role_key": text(entry.get("role_key")),
            "domain_id": domain_id,
            "domain_name": text(entry.get("domain_name")),
            "role_name": text(entry.get("role_name")),
            "subgroup_code": text(entry.get("subgroup_code")),
            "subgroup_label": text(entry.get("subgroup_label")),
            "role_task_evidence": text(entry.get("role_task_evidence")),
            "existing_role_fit_source_refs": entry.get("existing_role_fit_source_refs") or [],
            "baseline_disposition": text(entry.get("disposition")),
            "baseline_disposition_reason": text(entry.get("disposition_reason")),
            "comparison": comparison,
            "classification": classification,
            "classification_reason": reason,
            "used_role_title_as_evidence": False,
            "isco_membership_used_as_fit_proof": False,
            "current_subgroup_membership_used_as_fit_proof": False,
            "semantic_signoff": False,
        })
    entries.sort(key=lambda item: item["role_key"])

    route_assessments = []
    for route in baseline.get("domain_route_assessments") or []:
        classification, reason = route_classification(route)
        route_assessments.append({
            **route,
            "continuation_classification": classification,
            "continuation_classification_reason": reason,
            "used_role_title_as_evidence": False,
            "isco_membership_used_as_fit_proof": False,
            "current_subgroup_membership_used_as_fit_proof": False,
            "semantic_signoff": False,
        })

    gated_routes = []
    for gate in gates_doc.get("changes") or []:
        key = text(gate.get("role_key"))
        role = role_map.get(key)
        if role is None:
            raise KeyError(f"route-gated role is missing from current inventory: {key}")
        route = route_by_domain.get(text(role.get("domain_id"))) or {
            "route_disposition": "unresolved_ownership_or_source_review",
        }
        gated_routes.append(gated_route_entry(gate, role, route, subgroup_map.get(text(role.get("domain_id")), []), meta))
    gated_routes.sort(key=lambda item: item["role_key"])

    entry_counts = Counter(item["classification"] for item in entries)
    route_counts = Counter(item["continuation_classification"] for item in route_assessments)
    gate_counts = Counter(item["classification"] for item in gated_routes)
    zero_visible = sorted(
        text(item.get("domain_id")) for item in route_assessments
        if int(item.get("visible_subgroup_count") or 0) == 0
    )
    zero_active = sorted(
        text(item.get("domain_id")) for item in route_assessments
        if int(item.get("active_role_count") or 0) == 0
    )

    register = {
        "schema_version": "2026-10-06.role-to-subgroup-semantic-reconciliation.v1",
        "run_id": run_id,
        "run_date": str(date.today()),
        "continuation_of": BASELINE.name,
        "scope": "Evidence reconciliation of every conditional role -> subgroup row from run 009, all 80 zero-visible-subgroup/route-edge domains, and all 19 reclassified target route gates.",
        "policy": [
            "Use role task evidence and the stated domain/subgroup scope as the only semantic evidence in this continuation.",
            "Role titles are identifiers only; shared titles are never used as fit evidence.",
            "ISCO membership and current subgroup membership select or describe a path but never prove fit.",
            "A classification is an audit disposition and does not authorize a canonical taxonomy or role-file edit.",
            "Unresolved evidence remains conditional rather than being forced into a supported, wrong, direct, or missing-layer outcome.",
        ],
        "source_inputs": {
            "baseline_register": BASELINE.name,
            "current_inventory": INVENTORY.name,
            "subgroup_structure": STRUCTURE.name,
            "domain_meta": DOMAIN_META.name,
            "route_gates": ROUTE_GATES.name,
            "baseline_register_sha256": hashlib.sha256(BASELINE.read_bytes()).hexdigest(),
            "current_inventory_sha256": hashlib.sha256(INVENTORY.read_bytes()).hexdigest(),
            "subgroup_structure_sha256": hashlib.sha256(STRUCTURE.read_bytes()).hexdigest(),
            "route_gates_sha256": hashlib.sha256(ROUTE_GATES.read_bytes()).hexdigest(),
        },
        "baseline_counts": {
            "conditional_rows": len(baseline_conditionals),
            "zero_visible_subgroup_domains": len(zero_visible),
            "zero_active_role_domains": len(zero_active),
            "gated_target_routes": len(gates_doc.get("changes") or []),
        },
        "current_inventory_snapshot": {
            "merged_role_mappings": inventory.get("counts", {}).get("canonical_merged_role_mappings"),
            "active_role_mappings": inventory.get("counts", {}).get("active_role_mappings"),
            "explicit_unsupported_parent_domain_reviews": (inventory.get("counts", {}).get("semantic_review_status_counts") or {}).get("unsupported"),
            "explicit_conditional_parent_domain_reviews": (inventory.get("counts", {}).get("semantic_review_status_counts") or {}).get("conditional"),
            "route_gates_in_current_report": len(gates_doc.get("changes") or []),
            "post_change_context": "Current inventory is read after the prior 504 exclusion / 45 reclassification work and the 19 route gates; this continuation adds no source or canonical edits.",
        },
        "prior_change_context": {
            "exclusions_reported_before_this_continuation": 504,
            "reclassifications_reported_before_this_continuation": 45,
            "route_gates_verified_in_this_continuation_input": len(gates_doc.get("changes") or []),
            "source_note": "The 504/45 figures are the prior-audit continuation context supplied for this run; the current inventory and route-gate file are hashed above and are the files actually consumed.",
        },
        "reconciliation_counts": {
            "conditional_role_rows": dict(sorted(entry_counts.items())),
            "domain_route_rows": dict(sorted(route_counts.items())),
            "gated_target_route_rows": dict(sorted(gate_counts.items())),
        },
        "priority_scope": {
            "zero_visible_subgroup_domain_ids": zero_visible,
            "zero_active_role_domain_ids": zero_active,
            "gated_target_route_role_keys": [item["role_key"] for item in gated_routes],
        },
        "entries": entries,
        "domain_route_assessments": route_assessments,
        "gated_target_routes": gated_routes,
        "register_integrity": {
            "all_baseline_conditionals_reconciled_once": len(entries) == len(baseline_conditionals) and {item["role_key"] for item in entries} == {item["role_key"] for item in baseline_conditionals},
            "all_zero_visible_domains_recorded": len(zero_visible) == 80,
            "all_zero_active_domains_recorded": len(zero_active) == 16,
            "all_gated_routes_recorded": len(gated_routes) == 19,
            "allowed_classifications_only": set(entry_counts) <= {"supported", "conditional", "direct-domain-role", "wrong subgroup", "missing specialization/role"},
            "canonical_edits": False,
            "used_role_titles_as_evidence": False,
            "isco_membership_used_as_fit_proof": False,
            "current_subgroup_membership_used_as_fit_proof": False,
            "semantic_signoff": False,
        },
    }
    return register


def write_outputs(register: dict[str, Any]) -> dict[str, str]:
    run_id = register["run_id"]
    stem = f"role_to_subgroup_semantic_reconciliation_2026_10_06_{run_id}"
    json_path = AUDIT / f"{stem}.json"
    md_path = AUDIT / f"{stem}.md"
    checkpoint_path = AUDIT / f"role_to_subgroup_semantic_reconciliation_checkpoint_2026_10_06_{run_id}.md"
    existing = [path for path in (json_path, md_path, checkpoint_path) if path.exists()]
    if existing:
        raise FileExistsError("append-only run id already exists: " + ", ".join(path.name for path in existing))
    json_path.write_text(json.dumps(register, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    counts = register["reconciliation_counts"]
    lines = [
        f"# Role -> subgroup semantic reconciliation — 2026-10-06 run {run_id}",
        "",
        f"This append-only continuation starts from `{register['continuation_of']}`. It reconciles the **{register['baseline_counts']['conditional_rows']:,}** conditional rows with role task evidence and domain/subgroup scope. It does not edit canonical taxonomy or role files.",
        "",
        "The input state is the post-504-exclusion, post-45-reclassification, post-19-route-gate inventory. The 504/45 figures are prior-run context; the hashed inventory and route-gate files are the authoritative inputs for this continuation.",
        "",
        "## Classification counts",
        "",
        f"- Conditional role rows: `{json.dumps(counts['conditional_role_rows'], sort_keys=True)}`",
        f"- Domain route rows: `{json.dumps(counts['domain_route_rows'], sort_keys=True)}`",
        f"- Gated target route rows: `{json.dumps(counts['gated_target_route_rows'], sort_keys=True)}`",
        "",
        "`supported` means the recorded task evidence has multiple distinguishing anchors to the selected or available subgroup scope. `wrong subgroup` means another visible subgroup is materially better supported by the task evidence. `direct-domain-role` means the task evidence supports the parent scope while no subgroup scope is supported. `missing specialization/role` is reserved for a missing route layer or a domain route with no active role. Everything else remains `conditional`.",
        "",
        "## Priority coverage",
        "",
        f"- Zero-visible-subgroup domains recorded: **{len(register['priority_scope']['zero_visible_subgroup_domain_ids']):,}**.",
        f"- No-active-role domains recorded: **{len(register['priority_scope']['zero_active_role_domain_ids']):,}**.",
        f"- Gated target routes recorded: **{len(register['priority_scope']['gated_target_route_role_keys']):,}**.",
        "",
        "Zero-visible-subgroup domains:",
        "",
        ", ".join(register["priority_scope"]["zero_visible_subgroup_domain_ids"]),
        "",
        "No-active-role domains:",
        "",
        ", ".join(register["priority_scope"]["zero_active_role_domain_ids"]),
        "",
        "Gated target route role keys:",
        "",
        ", ".join(register["priority_scope"]["gated_target_route_role_keys"]),
        "",
        "## Evidence boundary",
        "",
        "The JSON records full task text, parent scope overlap, every same-domain subgroup scope score, the classification reason, and explicit false flags for role-title evidence, ISCO fit proof, subgroup-membership proof, and semantic sign-off. Conditional cases remain available for later source review.",
        "",
        f"Machine-readable register: `{json_path.name}`.",
    ]
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    checkpoint_lines = [
        f"# Role -> subgroup semantic reconciliation checkpoint — 2026-10-06 run {run_id}",
        "",
        "Append-only continuation from run 009.",
        "",
        f"- Baseline conditional rows: **{register['baseline_counts']['conditional_rows']:,}**",
        f"- Zero-visible-subgroup domains: **{register['baseline_counts']['zero_visible_subgroup_domains']:,}**",
        f"- No-active-role domains: **{register['baseline_counts']['zero_active_role_domains']:,}**",
        f"- Gated target routes: **{register['baseline_counts']['gated_target_routes']:,}**",
        "",
        f"- Conditional classifications: `{json.dumps(counts['conditional_role_rows'], sort_keys=True)}`",
        f"- Domain route classifications: `{json.dumps(counts['domain_route_rows'], sort_keys=True)}`",
        f"- Gated route classifications: `{json.dumps(counts['gated_target_route_rows'], sort_keys=True)}`",
        "",
        "Canonical taxonomy and role files changed: **no**.",
        "Role titles used as evidence: **no**.",
        "ISCO membership used as fit proof: **no**.",
        "Current subgroup membership used as fit proof: **no**.",
        "Semantic sign-off granted: **no**.",
        "",
        "The next gate is independent review of supported/wrong/direct/missing classifications before any canonical correction set is prepared.",
        "",
        f"Register SHA-256: `{hashlib.sha256(json_path.read_bytes()).hexdigest()}`",
    ]
    checkpoint_path.write_text("\n".join(checkpoint_lines) + "\n", encoding="utf-8")
    return {"json": json_path.as_posix(), "markdown": md_path.as_posix(), "checkpoint": checkpoint_path.as_posix()}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-id", default=DEFAULT_RUN_ID)
    parser.add_argument("--no-write", action="store_true")
    args = parser.parse_args()
    register = build_register(args.run_id)
    output = None if args.no_write else write_outputs(register)
    print(json.dumps({"baseline_counts": register["baseline_counts"], "reconciliation_counts": register["reconciliation_counts"], "output": output}, indent=2))


if __name__ == "__main__":
    main()
