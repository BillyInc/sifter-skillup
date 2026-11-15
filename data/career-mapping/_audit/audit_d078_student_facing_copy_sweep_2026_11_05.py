"""Read-only inventory of graph-backed D078 student-facing copy.

Heuristic flags create a human review worklist; they do not certify accuracy,
clarity, or student comprehension.
"""
from __future__ import annotations

import collections
import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
GRAPH_PATH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
UI_PATH = ROOT / "src/data/d078MethodAwareUiData.json"
OUT_JSON = ROOT / "data/career-mapping/_audit/D078_STUDENT_FACING_COPY_SWEEP_2026_11_05.json"
OUT_MD = ROOT / "docs/manual-review/D078_STUDENT_FACING_COPY_SWEEP_2026_11_05.md"
EXPORTER_PATH = ROOT / "data/career-mapping/_audit/export_d078_method_aware_ui_data_2026_10_19.py"
STATIC_FILES = (
    "src/screens/careerIntelligence/D078MethodAwareJourney.tsx",
    "src/components/careerIntelligence/MethodChoicePanel.tsx",
    "src/components/careerIntelligence/D078RelationshipPanel.tsx",
    "src/components/careerIntelligence/LearningResourcesBlock.tsx",
    "src/components/careerIntelligence/DegreeSkills.tsx",
    "src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx",
    "src/screens/careerIntelligence/DomainDetailScreen.tsx",
    "src/screens/careerIntelligence/SubgroupDetailScreen.tsx",
    "src/screens/careerIntelligence/RoleDetailScreen.tsx",
)
GLOSSARY_FILE = "src/lib/studentExplanation.ts"
STATIC_DATA_FILES = (
    "data/career-mapping/_audit/sociology_theme_student_abilities_2026_10_22.json",
)

FIELDS = {
    "programme_theme": ("label", "summary", "description", "narration"),
    "programme_outcome": ("label", "description", "course_title", "course_code"),
    "programme_context": ("label", "description", "overview", "student_note"),
    "domain_route": ("label", "description", "overview", "student_orientation", "programme_transition", "meaning", "why_it_matters", "field_context", "learner_output"),
    "domain_learning_item": ("label", "meaning", "plain_language_meaning", "meaning_in_domain", "what_it_is", "why_it_matters", "field_context", "contextual_use", "how_used", "use_case", "learner_output", "limitations", "requirement_reason", "requirement_scope"),
    "domain_emerging_learning_item": ("label", "meaning", "plain_language_meaning", "meaning_in_domain", "why_it_matters", "field_context", "contextual_use", "how_used", "use_case", "learner_output", "limitations", "requirement_reason"),
    "domain_supplement_candidate": ("label", "meaning", "description", "why_it_matters", "contextual_use", "learner_output", "limitations"),
    "area_of_specialization": ("label", "description", "overview", "meaning", "why_it_matters", "field_context", "learner_output", "student_orientation"),
    "area_foundation": ("label", "meaning", "plain_language_meaning", "why_it_matters", "contextual_use", "learner_output", "limitations"),
    "area_task_family": ("label", "task_evidence_text", "meaning", "description", "learner_output", "task_conditions", "limitations"),
    "area_learning_item": ("label", "what_it_is", "meaning", "plain_language_meaning", "why_it_matters", "contextual_use", "learner_output", "limitations"),
    "area_tool_option": ("label", "meaning", "plain_language_meaning", "why_it_matters", "field_context", "contextual_use", "how_used", "use_case", "learner_output", "limitations"),
    "area_enrichment_item": ("label", "meaning", "plain_language_meaning", "what_it_is", "why_it_matters", "field_context", "contextual_use", "how_used", "use_case", "learner_output", "limitations", "prerequisites", "valid_alternatives", "complements"),
    "area_tool_application_reference": ("label", "meaning", "description", "contextual_use", "learner_output", "limitations"),
    "role": ("label", "description", "overview", "role_context_is_not_job_readiness"),
    "role_task_family": ("label", "task_evidence_text", "task_conditions", "learner_output", "task_output", "limitations"),
    "role_item_candidate": ("label", "meaning", "plain_language_meaning", "what_it_is", "contextual_use", "how_used", "use_case", "why_it_matters", "learner_output", "task_output", "limitations", "valid_alternatives"),
    "method_combination_design": ("label", "design", "why_combine", "how_used", "condition", "limits", "selection_rule"),
    "tool": ("label", "description", "meaning", "contextual_use", "limitations"),
    "runtime_learning_item": ("label", "meaning", "description", "why_it_matters", "contextual_use", "learner_output", "limitations"),
    "relationship_target": ("label", "meaning", "description", "contextual_use", "limitations"),
}

TERMS = [
    "administrative records", "agent-based modelling", "agent-based modeling",
    "algorithm", "algorithms", "analysis of variance", "ANOVA", "bias",
    "causal inference", "causal", "case-control", "chi-square", "coding",
    "computational", "confidence interval", "confounding", "construct",
    "content analysis", "correlation", "counterfactual", "digital trace",
    "digital traces", "discourse analysis", "effect size", "ethnography",
    "evaluation", "experimental", "factor analysis", "fieldwork", "inference",
    "inter-coder", "interview protocol", "longitudinal", "logistic regression",
    "machine learning", "measurement", "mixed methods", "model assumption",
    "model assumptions", "multilevel", "network analysis", "nonresponse",
    "operationalization", "operationalisation", "panel data", "p-value",
    "population", "prevalence", "psychometrics", "qualitative", "quantitative",
    "quasi-experimental", "randomized", "regression", "reliability",
    "representative", "sample", "sampling", "scale construction", "significance",
    "simulation", "social process", "statistical model", "statistical significance",
    "systematic review", "text analysis", "theory of change", "validity",
    "validation", "variable",
]
TERM_RE = re.compile(
    r"(?<![A-Za-z])(" + "|".join(re.escape(t) for t in sorted(TERMS, key=len, reverse=True)) + r")(?![A-Za-z])",
    re.I,
)
ACRONYM_RE = re.compile(r"\b(?:[A-Z]{2,}|[A-Z][a-z]+[A-Z][A-Za-z]+)\b")
INTERNAL_RE = re.compile(
    r"\b(?:workpack|student_visible|requirement_lane|review status|"
    r"not independently rechecked|bounded to the saved record|candidate item|"
    r"role occurrence is provenance|role-list association is retained as provenance|"
    r"not adjudicate role fit|priority is a candidate|source[- ]backed (?:audit|review|status))\b", re.I
)
GENERIC_AREA_RE = re.compile(
    r"used to carry out or explain this task family|research summary, not a claim that every practitioner", re.I
)
PANEL_RELATIONSHIPS = {
    "prerequisite_for", "builds_on", "requires", "works_with", "complements",
    "supports", "useful_for", "tool_for", "optional_analysis_tool",
    "optional_tool_option", "optional_collection_tool", "conditional_library",
    "visual_network_tool", "computational_network_tool", "simulation_framework",
    "specialist_simulation_tool", "specialist_extension_of", "alternative_to",
    "alternative_tool_option", "tool_alternative_for_role_task",
}
READY = {"source_backed", "approved", "contract_relationship_review", "resolved_ready_for_use"}

def flatten(value: Any) -> list[str]:
    if isinstance(value, str):
        return [value] if value.strip() else []
    if isinstance(value, list):
        return [text for item in value for text in flatten(item)]
    if isinstance(value, dict):
        return [text for item in value.values() for text in flatten(item)]
    return []

def candidate_terms(text: str) -> list[str]:
    course_code_spans = [m.span() for m in re.finditer(r"\b(?:ENT|GST|PSY|SOC|SSC)\b\s+\d{3}\s*:\s*\d+", text, re.I)]
    def is_course_code_prefix(start: int, end: int) -> bool:
        return any(left <= start and end <= right for left, right in course_code_spans)
    found = [m.group(0) for m in TERM_RE.finditer(text)
             if not is_course_code_prefix(*m.span())]
    found += [m.group(0) for m in ACRONYM_RE.finditer(text)
              if not is_course_code_prefix(*m.span())]
    result, seen = [], set()
    for word in found:
        key = word.casefold()
        if key in {"levelup", "youtube"}:
            continue
        if key == "atlas" and re.search(r"\bATLAS\.ti\b", text, re.I):
            continue
        if key == "core" and re.search(r"\bCORE\s+Econ\b", text, re.I):
            continue
        if key == "core" and word.isupper():
            continue
        if key == "stat" and re.search(r"\bSAS/STAT\b", text, re.I):
            continue
        if key == "youtube" and re.search(r"\bYouTube\s+Data\s+API\b", text, re.I):
            continue
        if key not in seen:
            seen.add(key)
            result.append(word)
    return result

def looks_like_source_code_fragment(text: str) -> bool:
    return bool(re.search(
        r"(?:=>|\|\||&&|[{}<>]|\btext\.includes\b|\b(?:const|return|useState|useMemo|useRef|StyleSheet|React|RefObject|ReturnType|NonNullable|ThemeKey|GuidanceRouteContext|ProgrammeTab|fontSize|borderColor)\b)",
        text,
    ))

def read_glossary_patterns() -> list[dict[str, str]]:
    """Extract helper rules without treating their definitions as UI copy."""
    source = (ROOT / GLOSSARY_FILE).read_text(encoding="utf-8")
    pattern = re.compile(r"\[/((?:\\.|[^/])*)/([a-z]*),\s*\"((?:\\.|[^\"\\])*)\"\]", re.S)
    entries = []
    for expression, flags, definition in pattern.findall(source):
        try:
            re.compile(expression, re.I if "i" in flags else 0)
        except re.error:
            continue
        entries.append({"pattern": expression, "flags": flags, "definition": definition})
    return entries

def matching_gloss(term: str, entries: list[dict[str, str]], context: str = "") -> dict[str, str] | None:
    # A match must overlap this term's occurrence, not an unrelated glossary
    # term elsewhere in the same paragraph. This allows a defined compound
    # such as "inter-coder reliability" to cover its shorter term candidate.
    search_text = context or term
    term_spans = [m.span() for m in re.finditer(r"(?<![A-Za-z])" + re.escape(term) + r"(?![A-Za-z])", search_text, re.I)]
    for entry in sorted(entries, key=lambda x: len(x["pattern"]), reverse=True):
        flags = re.I if "i" in entry["flags"] else 0
        try:
            for match in re.finditer(entry["pattern"], search_text, flags):
                if any(max(start, match.start()) < min(end, match.end()) for start, end in term_spans):
                    return entry
        except re.error:
            pass
    return None

def expanded_inline(term: str, context: str) -> bool:
    """Return true when an acronym is written out immediately before it."""
    if not term.isupper() or len(term) < 2:
        return False
    ignored = {"and", "of", "the", "for", "in", "to"}
    pattern = re.compile(r"\(\s*" + re.escape(term) + r"\s*\)", re.I)
    for match in pattern.finditer(context):
        words = re.findall(r"[A-Za-z][A-Za-z'-]*", context[:match.start()])
        for size in range(2, min(8, len(words)) + 1):
            initials = "".join(
                word[0].upper() for word in words[-size:]
                if word.casefold() not in ignored
            )
            if initials == term.upper():
                return True
    return False

def normalize_area_key(value: Any) -> str:
    text = str(value or "").strip()
    if text.casefold().startswith("d078:"):
        text = text.split(":", 1)[1]
    if text.casefold().startswith("area:d078-"):
        text = text[len("area:d078-"):]
    return text.casefold()

def source_ids_for_copy_field(node: dict[str, Any], field: str) -> list[str]:
    """Return field-specific orientation sources, falling back to node sources."""
    if field.startswith("student_orientation."):
        orientation_field = field.split(".", 1)[1]
        references = (node.get("orientation_evidence_by_field") or {}).get(orientation_field, [])
        ids = {
            str(reference.get("source_id") or reference.get("id"))
            for reference in references
            if isinstance(reference, dict) and (reference.get("source_id") or reference.get("id"))
        }
        if ids:
            return sorted(ids)
    ids = {
        str(item.get("source_id") or item.get("id"))
        for field_name in ("evidence", "source_refs", "source_references", "explanatory_sources")
        for item in (node.get(field_name) or [])
        if isinstance(item, dict) and (item.get("source_id") or item.get("id"))
    }
    ids.update(
        str(item)
        for field_name in ("source_refs", "source_references", "explanatory_sources")
        for item in (node.get(field_name) or [])
        if isinstance(item, str)
    )
    return sorted(ids)

def main() -> None:
    graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
    ui = json.loads(UI_PATH.read_text(encoding="utf-8"))
    nodes = graph["nodes"]
    areas: dict[str, str] = {}
    for node in nodes:
        if node.get("kind") != "area_of_specialization":
            continue
        label = node.get("label", node["id"])
        for key in (node.get("id"), node.get("area_id")):
            if key:
                areas[str(key)] = label
                areas[normalize_area_key(key)] = label
    roles = {n["id"]: n.get("label", n["id"]) for n in nodes if n.get("kind") == "role"}
    methods = set(graph.get("method_node_ids", []))
    copy_nodes, flags, text_units = [], [], []

    for node in nodes:
        if node.get("student_visible") is not True:
            continue
        kind = node.get("kind", "unknown")
        units = []
        for field in FIELDS.get(kind, ("label",)):
            value = node.get(field)
            if field == "student_orientation" and isinstance(value, dict):
                nested_values = [
                    (f"student_orientation.{nested_field}", nested_value)
                    for nested_field, nested_value in value.items()
                ]
            else:
                nested_values = [(field, value)]
            for output_field, nested_value in nested_values:
                field_source_ids = source_ids_for_copy_field(node, output_field)
                for ix, text in enumerate(flatten(nested_value)):
                    words = re.findall(r"\b[\w'-]+\b", text)
                    units.append({
                        "field": output_field, "index": ix if isinstance(nested_value, list) else None,
                        "text": text, "word_count": len(words),
                        "candidate_technical_terms": candidate_terms(text),
                        "source_basis_ids": field_source_ids,
                    })
        if not units:
            continue
        area_id = node.get("area_id") or node.get("areaId")
        role_ids = node.get("role_owner_ids") or node.get("role_ids") or []
        record = {
            "id": node["id"], "kind": kind,
            "surface": "domain_method" if node["id"] in methods else kind,
            "owner_area_id": area_id,
            "owner_area_label": areas.get(area_id) or areas.get(normalize_area_key(area_id)),
            "owner_role_ids": role_ids,
            "owner_role_labels": [roles.get(r, r) for r in role_ids],
            "requirement_lane": node.get("requirement_lane"),
            "student_selectable": node.get("student_selectable", node.get("selectable")),
            "display_readiness": node.get("display_readiness"),
            "source_artifacts": node.get("source_artifacts") or node.get("source_artifact"),
            "evidence_source_ids": sorted({source_id for unit in units for source_id in unit["source_basis_ids"]}),
            "copy_units": units,
        }
        fields = {u["field"] for u in units}
        text = " ".join(u["text"] for u in units)
        issues = []
        if kind == "area_learning_item" and GENERIC_AREA_RE.search(text):
            issues.append("generic_template_definition")
        if kind == "area_learning_item" and not ({"what_it_is", "meaning"} & fields):
            issues.append("missing_item_definition")
        if kind == "area_tool_option":
            if not ({"meaning", "plain_language_meaning"} & fields): issues.append("missing_tool_definition")
            if "contextual_use" not in fields: issues.append("missing_tool_use_in_area")
            if "learner_output" not in fields: issues.append("missing_tool_output_or_result")
        if kind in {"area_task_family", "role_task_family"}:
            # A long action-led task label itself is the visible explanation;
            # only flag a short title when no explanatory field accompanies it.
            label = str(node.get("label") or "")
            label_words = re.findall(r"\b[\w'-]+\b", label)
            if len(label_words) < 6 and not ({"task_evidence_text", "meaning", "description"} & fields):
                issues.append("short_task_label_needs_explanation")
            if not flatten(node.get("learner_output")) and not flatten(node.get("task_output")):
                issues.append("missing_task_output")
        if kind == "area_enrichment_item" and not ({"contextual_use", "how_used", "use_case"} & fields):
            issues.append("missing_contextual_use")
        if kind == "role_item_candidate":
            if not ({"meaning", "plain_language_meaning", "what_it_is"} & fields): issues.append("missing_item_definition")
        if kind == "role" and not ({"overview", "description"} & fields):
            issues.append("missing_role_overview")
        if INTERNAL_RE.search(text): issues.append("possible_internal_or_audit_language")
        if any(u["word_count"] > 70 for u in units): issues.append("long_copy_unit_over_70_words")
        record["candidate_issues"] = sorted(set(issues))
        copy_nodes.append(record)
        text_units.extend({"node_id": node["id"], "kind": kind, **u} for u in units)
        if issues:
            flags.append({
                "id": node["id"], "kind": kind,
                "area": areas.get(area_id) or areas.get(normalize_area_key(area_id)),
                "issues": sorted(set(issues)), "copy_units": units,
            })

    # Combination design cards are rendered from these records even when their
    # node-level student_visible flag is false; preserve their actual UI content.
    combo_nodes = {n["id"]: n for n in nodes if n.get("kind") == "method_combination_design"}
    for combo_id in ui.get("combination_designs", []):
        if isinstance(combo_id, dict):
            combo_id = combo_id.get("id")
        node = combo_nodes.get(combo_id)
        if not node:
            continue
        units = []
        for field in FIELDS["method_combination_design"]:
            value = node.get(field)
            for ix, text in enumerate(flatten(value)):
                units.append({
                    "field": field, "index": ix if isinstance(value, list) else None,
                    "text": text, "word_count": len(re.findall(r"\b[\w'-]+\b", text)),
                    "candidate_technical_terms": candidate_terms(text),
                })
        if units:
            record = {
                "id": combo_id, "kind": "method_combination_design",
                "surface": "method_combination_design", "owner_area_id": None,
                "owner_area_label": None, "owner_role_ids": [], "owner_role_labels": [],
                "requirement_lane": None, "student_selectable": None,
                "display_readiness": None, "source_artifacts": node.get("source_refs"),
                "evidence_source_ids": sorted(str(item) for item in node.get("source_refs", []) if isinstance(item, str)),
                "copy_units": units, "candidate_issues": [],
            }
            copy_nodes.append(record)
            text_units.extend({"node_id": combo_id, "kind": "method_combination_design", **u} for u in units)

    combo_units = []
    for combo in graph.get("combination_designs", []):
        for field in ("design", "why_combine", "how_used", "condition", "limits", "integration_explanation"):
            for ix, text in enumerate(flatten(combo.get(field))):
                combo_units.append({
                    "id": combo.get("id"), "field": field,
                    "index": ix if isinstance(combo.get(field), list) else None,
                    "text": text, "candidate_technical_terms": candidate_terms(text),
                })

    ui_edges = ui.get("typed_relationship_edges", [])
    effective_edges = []
    for edge in ui_edges:
        status = str(edge.get("status") or "").casefold()
        source = edge.get("sourceId") or edge.get("source_id")
        target = edge.get("targetId") or edge.get("target_id")
        rel = edge.get("relationship")
        if (rel in PANEL_RELATIONSHIPS and status in READY
                and edge.get("sourceResolved") is True and edge.get("targetResolved") is True
                and source in ui.get("nodes_by_id", {}) and target in ui.get("nodes_by_id", {})
                and edge.get("routeAvailability") != "unavailable_destination"):
            effective_edges.append(edge)
    relationship_units = []
    for edge in effective_edges:
        explanation = edge.get("explanation")
        if isinstance(explanation, str) and explanation.strip():
            relationship_units.append({
                "edge_id": edge.get("id"), "relationship": edge.get("relationship"),
                "source_id": edge.get("sourceId"), "target_id": edge.get("targetId"),
                "area_id": edge.get("areaId"), "role_id": edge.get("roleId"),
                "status": edge.get("status"), "explanation": explanation.strip(),
                "word_count": len(re.findall(r"\b[\w'-]+\b", explanation)),
                "candidate_technical_terms": candidate_terms(explanation),
                "generic_panel_copy": "canonical learning item(s) exist for this relationship" in explanation.casefold(),
            })

    # Capture literal JSX text, quoted labels, and ordinary explanatory string
    # values in copy-heavy D078 components.
    # section names, empty states, and accessibility-facing actions.
    static_ui_units = []
    skipped_code_fragments = 0
    literal_text_re = re.compile(r">([^<>{}]+)<")
    quoted_label_re = re.compile(r"\b(?:label|accessibilityLabel)\s*=\s*\"([^\"]+)\"")
    ordinary_string_re = re.compile(r"(?<![\w])([\"'])(.{20,}?)\1")
    for relative in STATIC_FILES:
        path = ROOT / relative
        if not path.exists():
            continue
        source = path.read_text(encoding="utf-8")
        candidates = [(m.start(1), "jsx_text", m.group(1)) for m in literal_text_re.finditer(source)]
        candidates += [(m.start(1), "quoted_label", m.group(1)) for m in quoted_label_re.finditer(source)]
        candidates += [
            (m.start(2), "source_copy_string", m.group(2))
            for m in ordinary_string_re.finditer(source)
            if len(re.findall(r"\b[\w'-]+\b", m.group(2))) >= 4
            and not re.search(r"[{}<>\\]|https?://|\b(?:testID|accessibilityRole|color|border|font|style|icon)\b", m.group(2), re.I)
        ]
        for offset, unit_type, raw in candidates:
            text = " ".join(raw.split())
            if looks_like_source_code_fragment(text):
                skipped_code_fragments += 1
                continue
            if len(text) < 3 or text in {"·", "•"}:
                continue
            line = source.count("\n", 0, offset) + 1
            static_ui_units.append({
                "file": relative, "line": line, "unit_type": unit_type,
                "text": text, "word_count": len(re.findall(r"\b[\w'-]+\b", text)),
                "candidate_technical_terms": candidate_terms(text),
                "possible_internal_copy": bool(INTERNAL_RE.search(text)),
            })
    for relative in STATIC_DATA_FILES:
        path = ROOT / relative
        if not path.exists():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        def walk(value: Any, path_key: str = "$") -> None:
            if isinstance(value, str) and value.strip():
                text = " ".join(value.split())
                static_ui_units.append({
                    "file": relative, "line": None, "unit_type": "student_copy_data",
                    "field": path_key, "text": text,
                    "word_count": len(re.findall(r"\b[\w'-]+\b", text)),
                    "candidate_technical_terms": candidate_terms(text),
                    "possible_internal_copy": bool(INTERNAL_RE.search(text)),
                })
            elif isinstance(value, dict):
                for key, item in value.items():
                    walk(item, f"{path_key}.{key}")
            elif isinstance(value, list):
                for index, item in enumerate(value):
                    walk(item, f"{path_key}[{index}]")
        walk(data)

    top_level_copy_units = []
    for field in ("domain_overview", "transfer_summary", "transferable_learning_summary"):
        field_sources = {
            "domain_overview": [
                "external:nuc-social-sciences-ccmas-2023",
                "src:d078-openstax-sociology-research-3e",
                "src:d078-unesco-iscoped-social-sciences",
            ],
            # The transfer summary describes the checked-in journey contract;
            # it has no single external source record to cite here.
            "transfer_summary": [],
            "transferable_learning_summary": [],
        }.get(field, [])
        for text in flatten(graph.get("programme_transition", {}).get(field)):
            top_level_copy_units.append({
                "record": "programme_transition", "field": field, "text": text,
                "word_count": len(re.findall(r"\b[\w'-]+\b", text)),
                "candidate_technical_terms": candidate_terms(text),
                "source_basis_ids": field_sources,
            })
    for method_id, context in (ui.get("programme_method_context") or {}).items():
        for field in ("student_note",):
            for text in flatten(context.get(field)):
                top_level_copy_units.append({
                    "record": f"programme_method_context:{method_id}", "field": field,
                    "text": text, "word_count": len(re.findall(r"\b[\w'-]+\b", text)),
                    "candidate_technical_terms": candidate_terms(text),
                })

    copy_by_id = {node["id"]: node for node in copy_nodes}
    term_occurrences: dict[str, list[dict[str, Any]]] = collections.defaultdict(list)
    for unit in text_units:
        if unit["field"] == "course_code":
            continue
        record = copy_by_id.get(unit["node_id"], {})
        for term in unit["candidate_technical_terms"]:
            term_occurrences[term.casefold()].append({
                "term_as_written": term,
                "location": f"{unit['kind']}:{unit['node_id']}#{unit['field']}",
                "text": unit["text"],
                "source_basis_ids": unit.get("source_basis_ids") or record.get("evidence_source_ids", []),
                "first_use_status": "not established across routes",
                "independent_screen_access": "route must be checked; item cards may be opened independently",
                "inline_explanation_status": "candidate only; human review required",
                "reviewer_result": "not reviewed",
            })
    for unit in static_ui_units:
        for term in unit["candidate_technical_terms"]:
            term_occurrences[term.casefold()].append({
                "term_as_written": term,
                "location": f"{unit['file']}:{unit.get('line') or unit.get('field')}",
                "text": unit["text"], "source_basis_ids": [],
                "first_use_status": "not established across routes",
                "independent_screen_access": "static UI text; confirm rendered state",
                "inline_explanation_status": "candidate only; human review required",
                "reviewer_result": "not reviewed",
            })
    for unit in top_level_copy_units:
        for term in unit["candidate_technical_terms"]:
            term_occurrences[term.casefold()].append({
                "term_as_written": term, "location": f"{unit['record']}#{unit['field']}",
                "text": unit["text"], "source_basis_ids": unit.get("source_basis_ids", []),
                "first_use_status": "not established across routes",
                "independent_screen_access": "top-level journey text",
                "inline_explanation_status": "candidate only; human review required",
                "reviewer_result": "not reviewed",
            })
    for unit in relationship_units:
        for term in unit["candidate_technical_terms"]:
            term_occurrences[term.casefold()].append({
                "term_as_written": term,
                "location": f"relationship:{unit['edge_id'] or unit['source_id'] + '->' + unit['target_id']}",
                "text": unit["explanation"], "source_basis_ids": [],
                "first_use_status": "route and endpoint specific",
                "independent_screen_access": "only when the edge and endpoints are projected on the selected route",
                "inline_explanation_status": "candidate only; human review required",
                "reviewer_result": "not reviewed",
            })
    terminology_ledger = [
        {"term": term, "occurrence_count": len(rows), "review_status": "not reviewed", "occurrences": rows}
        for term, rows in sorted(term_occurrences.items())
    ]
    glossary_patterns = read_glossary_patterns()
    technical_term_coverage = []
    for row in terminology_ledger:
        match = next((candidate for occurrence in row["occurrences"]
                      if (candidate := matching_gloss(occurrence["term_as_written"], glossary_patterns, occurrence["text"]))), None)
        inline_definition = any(
            expanded_inline(occurrence["term_as_written"], occurrence["text"])
            for occurrence in row["occurrences"]
        )
        row["glossary_rule_available"] = match is not None
        row["inline_expansion_in_copy"] = inline_definition
        row["glossary_rule_pattern"] = match["pattern"] if match else None
        row["review_status"] = (
            "automated_gloss_available_human_review_open" if match
            else "inline_expansion_present_human_review_open" if inline_definition
            else "no_glossary_rule_human_review_open"
        )
        for occurrence in row["occurrences"]:
            occurrence["inline_explanation_status"] = (
                "glossary rule can add inline explanation where studentFacingCopy is applied; accuracy and first-use still need human review"
                if match else "term is expanded in this copy; accuracy and first-use still need human review"
                if expanded_inline(occurrence["term_as_written"], occurrence["text"])
                else "no matching glossary rule or inline expansion; human review needed"
            )
        technical_term_coverage.append({
            "term": row["term"], "occurrences": row["occurrence_count"],
            "glossary_rule_available": match is not None,
            "inline_expansion_in_copy": inline_definition,
            "glossary_rule_pattern": match["pattern"] if match else None,
            "glossary_definition": match["definition"] if match else None,
            "human_accuracy_review": "open",
            "screen_first_use_review": "open",
        })
    uncovered_technical_terms = [
        x["term"] for x in technical_term_coverage
        if not x["glossary_rule_available"] and not x["inline_expansion_in_copy"]
    ]

    surface_review = [
        {"surface": "Sociology programme overview", "render_path": "programmePreviewSections in ProgrammeDetailRefinedScreen", "status": "overview explains Sociology, institutions, culture, inequality and research methods in context; detailed themes and recorded learning goals stay in their separate curriculum sections"},
        {"surface": "Generic programme preview and unavailable states", "render_path": "programmePreviewExplanation and programmePreviewUnavailableMessage", "status": "course-title fallback and unavailable messages use student-facing wording without implying mastery or inventing curriculum content"},
        {"surface": "Programme themes, outcomes and theme guidance", "render_path": "DegreeSkills and D078MethodAwareJourney", "status": "dynamic student copy now uses the term helper; themes stay distinct from recorded learning goals"},
        {"surface": "Social Sciences domain overview and transfer", "render_path": "D078MethodAwareJourney displayText", "status": "overview, different disciplinary viewpoints, how researchers gather evidence, example questions, study steps, outputs and Sociology transfer are separately headed; the transfer text explains foundation-to-method ordering, optionality and course-link limits"},
        {"surface": "Programme-to-area transition", "render_path": "ProgrammeDetailRefinedScreen ProgrammeDomainTransition", "status": "connection text states that recorded course outcomes connect the programme and area"},
        {"surface": "Generic domain-detail fallback", "render_path": "DomainDetailScreen", "status": "D078 bypasses this screen and uses D078MethodAwareJourney; generic domain copy is not counted as D078 rendered content"},
        {"surface": "Methods and combined designs", "render_path": "MethodChoicePanel learnerCopy", "status": "method labels, explanations and programme notes now use the student copy helper"},
        {"surface": "Seven D078 area overviews", "render_path": "D078AreaRoute from area student_orientation", "status": "each area now has a concise introduction and source-backed sections for scope, work, explained approaches, questions, outputs, workflow, limits and ethical care; the accordion keeps detail available without crowding the first view"},
        {"surface": "Area and role learning cards", "render_path": "D078ItemCard displayText", "status": "definitions, examples/approaches, context, outputs, limits and valid alternative notes are rendered as labeled sections"},
        {"surface": "D078 role overviews", "render_path": "D078RoleRoute role node description and linked task context", "status": "19 role summaries explain their documented work in plain language and preserve current area ownership and task links; no qualification or task-output claim was added"},
        {"surface": "Relationship panel explanations", "render_path": "D078RelationshipPanel", "status": "out of this lane; 562 edge explanations remain with the panel owner for glossary and route-context review"},
        {"surface": "Text prerequisite and complement annotations", "render_path": "graph fields not projected as destinations", "status": "not student destinations; show only after canonical edge/sequence review confirms a supported link"},
        {"surface": "Role task outputs", "render_path": "role_task_family records", "status": "19 task families have no separate output field; outputs remain an evidence-enrichment gap, not an inferred claim"},
    ]

    exporter_source = EXPORTER_PATH.read_text(encoding="utf-8")
    exporter_block = re.search(r"NODE_FIELDS\s*=\s*\{([^}]+)\}", exporter_source, re.S)
    exporter_fields = set(re.findall(r"\"([a-zA-Z0-9_]+)\"", exporter_block.group(1))) if exporter_block else set()
    ui_expected_fields = {
        "meaning", "plain_language_meaning", "meaning_in_domain", "what_it_is", "description",
        "why_it_matters", "field_context", "contextual_use", "how_used", "use_case",
        "learner_output", "limitations", "valid_alternatives", "task_evidence_text", "task_conditions",
        "task_output", "role_application", "requirement_reason", "student_orientation",
    }
    dropped_ui_fields = sorted(ui_expected_fields - exporter_fields)

    kinds = collections.Counter(n["kind"] for n in copy_nodes)
    issue_counts = collections.Counter(i for n in flags for i in n["issues"])
    fields_by_kind = {}
    for kind in kinds:
        fields_by_kind[kind] = dict(collections.Counter(
            u["field"] for n in copy_nodes if n["kind"] == kind for u in n["copy_units"]
        ))
    all_copy_units = [*text_units, *static_ui_units, *top_level_copy_units, *relationship_units]
    long_copy_counts = {
        str(threshold): sum(u["word_count"] > threshold for u in all_copy_units)
        for threshold in (32, 50, 70, 90, 120)
    }
    long_copy_units_over_70 = [
        {
            "location": (
                f"{u['file']}:{u.get('line')}" if u.get("file") and u.get("line")
                else u.get("node_id") or u.get("file") or u.get("record") or u.get("edge_id")
            ),
            "kind": u.get("kind") or u.get("unit_type") or "relationship_explanation",
            "field": u.get("field") or u.get("relationship"),
            "word_count": u["word_count"],
            "text": u.get("text") or u.get("explanation"),
        }
        for u in all_copy_units if u["word_count"] > 70
    ]
    exact_duplicate_fields = []
    for node in nodes:
        for left, right in (("description", "overview"), ("meaning", "plain_language_meaning")):
            a = node.get(left)
            b = node.get(right)
            if isinstance(a, str) and a.strip() and a == b:
                exact_duplicate_fields.append({"node_id": node["id"], "kind": node.get("kind"), "fields": [left, right]})
    replacement_character_occurrences = sum(
        (u.get("text") or u.get("explanation") or "").count("\ufffd")
        for u in all_copy_units
    )
    stats = {
        "graph_nodes_total": len(nodes), "graph_edges_total": len(graph.get("edges", [])),
        "ui_nodes_total": len(ui.get("nodes_by_id", {})), "ui_typed_relationship_edges_total": len(ui_edges),
        "visible_nodes_with_copy": len(copy_nodes), "visible_copy_units": len(text_units),
        "visible_copy_words": sum(u["word_count"] for u in text_units),
        "visible_nodes_by_kind": dict(kinds), "candidate_flagged_nodes": len(flags),
        "copy_units_over_word_thresholds": long_copy_counts,
        "all_audited_copy_units": len(all_copy_units),
        "long_copy_units_over_70": long_copy_units_over_70,
        "exact_duplicate_definition_field_pairs": len(exact_duplicate_fields),
        "replacement_character_occurrences": replacement_character_occurrences,
        "candidate_issue_counts": dict(issue_counts),
        "combination_designs": len(graph.get("combination_designs", [])),
        "combination_copy_units": len(combo_units),
        "static_ui_copy_units": len(static_ui_units),
        "source_code_fragments_excluded": skipped_code_fragments,
        "static_ui_copy_units_with_candidate_terms": sum(bool(u["candidate_technical_terms"]) for u in static_ui_units),
        "top_level_journey_copy_units": len(top_level_copy_units),
        "top_level_journey_copy_units_with_candidate_terms": sum(bool(u["candidate_technical_terms"]) for u in top_level_copy_units),
        "distinct_candidate_terms": len(terminology_ledger),
        "candidate_term_occurrences": sum(row["occurrence_count"] for row in terminology_ledger),
        "technical_terms_with_glossary_rule": sum(bool(x["glossary_rule_available"]) for x in technical_term_coverage),
        "technical_terms_expanded_inline": sum(bool(x["inline_expansion_in_copy"]) for x in technical_term_coverage),
        "technical_terms_without_glossary_or_inline_expansion": len(uncovered_technical_terms),
        "glossary_rules_parsed": len(glossary_patterns),
        "fields_used_by_ui_but_dropped_by_exporter": dropped_ui_fields,
        "relationship_edges_in_panel_scope": len(effective_edges),
        "relationship_edges_with_custom_explanation": len(relationship_units),
        "relationship_edges_without_explanation": len(effective_edges) - len(relationship_units),
        "relationship_edges_with_generic_internal_note": sum(x["generic_panel_copy"] for x in relationship_units),
        "relationship_types_in_panel_scope": dict(collections.Counter(e.get("relationship") for e in effective_edges)),
    }
    result = {
        "created_by": Path(__file__).name,
        "purpose": "Read-only graph-backed inventory and heuristic editorial worklist.",
        "interpretation": "Flags are candidate issues for human review, not proof. Unflagged text is not approved by this audit.",
        "copy_edits_applied_this_pass": {
            "implementation_scripts": [
                "data/career-mapping/_audit/apply_d078_role_item_student_copy_2026_11_05.py",
                "data/career-mapping/_audit/apply_d078_student_facing_copy_clarity_2026_11_04.py",
            ],
            "role_items": "Rendered role-item definitions and contexts were cleaned. The route graph still contains 19 role task families without a separate learner_output or task_output field; do not infer these as completed outputs.",
            "non_role_copy": "Two visible area-tool references no longer expose internal candidate labels, and a scikit-learn limitation was rewritten without changing its route or lane.",
            "programme": "Sociology's overview now defines the social sciences, institutions, culture, inequality, research methods and evidence in the same flow. Its themes and recorded learning goals remain in their separate curriculum sections; no programme content or outcomes were changed.",
            "domain": "The Social Sciences domain overview and programme bridge now explain the field, disciplinary viewpoints, evidence, methods, combined designs, sequence, optional or conditional items, and the difference between curriculum connection and mastery. The detail sections explain question types, ways of gathering information, possible outputs and what conclusions can support.",
            "domain_detail_page": "D078 routes through D078MethodAwareJourney; the generic DomainDetailScreen is not the D078 student-facing domain page.",
            "programme_domain_link": "The programme-to-area explanation now says directly that recorded course outcomes connect the programme and area.",
            "computational_social_research": "Definition, field relevance, digital-trace examples, learner output and limits are explained in separate fields; the card now renders the distinct examples/approaches field. Conditional/skippable lane preserved.",
            "area_and_role_wording": "All seven areas now have concise introductions and labeled, source-linked sections for subject scope, what researchers do, example questions, outputs, workflow, limits and ethical care. The role task links and output gaps remain unchanged.",
            "role_overviews": "All 19 role summaries now describe their documented work in plain language, explain technical terms used in the summary, and retain the current role-area assignments and task links. Their role task families still have no separate learner_output or task_output field; no output has been inferred.",
            "area_tools": "Seven existing optional tools now have separate definitions, area-specific uses, example outputs and limitations based on their attached official documentation.",
            "technical_terms": "Shared inline explanations were corrected or expanded for computational methods, statistics, research designs, qualitative methods, evaluation, digital traces and related terms.",
            "projection": "Exporter preserves why_it_matters, field_context, task_conditions, what_it_is and valid_alternatives already used by the journey; alternatives remain explanatory notes rather than clickable destinations.",
            "graph_invariants": "The copy updater checks that the node list, edge list and identifiers are unchanged.",
            "source_references": [
                "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
                "https://opencourse.inf.ed.ac.uk/css",
                "https://auth.opencourse.inf.ed.ac.uk/css",
                "https://www.annualreviews.org/content/journals/10.1146/annurev-soc-121919-054621",
                "https://pmc.ncbi.nlm.nih.gov/articles/PMC8612450/",
                "https://pmc.ncbi.nlm.nih.gov/articles/PMC11971172/",
                "https://www.ukri.org/councils/esrc/guidance-for-applicants/research-ethics-guidance/internet-mediated-research/",
                "https://www.publichealth.columbia.edu/research/population-health-methods/social-network-analysis",
                "https://pmc.ncbi.nlm.nih.gov/articles/PMC4430112/",
                "https://www.gov.uk/government/publications/the-magenta-book",
                "https://www.gov.uk/government/publications/the-magenta-book/magenta-book-central-government-guidance-on-evaluation-html",
                "https://www.core-econ.org/project/doing-economics/",
                "https://population.un.org/demodata/web/",
                "https://www.worldbank.org/en/data/statistical-capacity-building/data-innovation-fund/Rural-accessibility-mapping",
                "https://legalinstruments.oecd.org/public/doc/128/body-text.en.html",
                "https://openstax.org/books/psychology-2e/pages/2-2-approaches-to-research",
                "https://openstax.org/books/psychology-2e/pages/12-4-conformity-compliance-and-obedience",
                "https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods",
                "https://openstax.org/books/introduction-anthropology/pages/3-introduction",
                "https://americananthro.org/about/anthropological-ethics/",
                "https://uis.unesco.org/sites/default/files/documents/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf",
                "https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf",
                "https://www.cdc.gov/field-epi-manual/php/chapters/qualitative-data.html",
                "https://www.limesurvey.org/manual/LimeSurvey_Manual",
                "https://community.lumivero.com/s/article/NVR1Mac-Content-coding-coding",
                "https://docs.python.org/3/tutorial/",
                "https://www.r-project.org/about.html",
                "https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=test-overview-t-command",
                "https://www.stata.com/features/panel-longitudinal-data/",
                "https://app.taguette.org/",
            ],
            "rendered_review": "Not performed; copy and projection changes require browser/manual review before visual acceptance.",
        },
        "source_paths": [str(GRAPH_PATH.relative_to(ROOT)), str(UI_PATH.relative_to(ROOT))],
        "stats": stats, "copy_fields_by_kind": fields_by_kind,
        "copy_nodes": copy_nodes, "candidate_flagged_nodes": flags,
        "combination_copy_units": combo_units,
        "effective_relationship_copy_units": relationship_units,
        "static_ui_copy_units": static_ui_units,
        "top_level_journey_copy_units": top_level_copy_units,
        "terminology_ledger": terminology_ledger,
        "technical_term_coverage": technical_term_coverage,
        "uncovered_technical_terms": uncovered_technical_terms,
        "surface_review": surface_review,
        "exact_duplicate_copy_fields": exact_duplicate_fields,
    }
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# D078 Student-Facing Copy Sweep", "",
        "**Date:** 2026-11-05  ",
        "**Status:** Inventory and candidate issue report; not editorial approval.  ",
        "**Source:** Canonical D078 route graph and exported journey data.", "",
        "> Heuristic flags create a human-review worklist. No flag is a pass, and this report does not claim novice comprehension or subject-matter approval.", "",
        "## Inventory counts", "",
        f"- Graph: {stats['graph_nodes_total']:,} nodes and {stats['graph_edges_total']:,} edges.",
        f"- Exported journey data: {stats['ui_nodes_total']:,} nodes and {stats['ui_typed_relationship_edges_total']:,} typed relationship records.",
        f"- Student-visible graph records with copy: {stats['visible_nodes_with_copy']:,}; text units: {stats['visible_copy_units']:,}; words: {stats['visible_copy_words']:,}.",
        f"- Total audited units across graph records, static screen text, top-level journey copy and relationship explanations: {stats['all_audited_copy_units']:,}.",
        f"- Method-combination explanations: {stats['combination_designs']} designs and {stats['combination_copy_units']} text units.",
        f"- Literal static UI text and quoted labels: {stats['static_ui_copy_units']:,} units; {stats['static_ui_copy_units_with_candidate_terms']:,} contain candidate technical terms.",
        f"- Top-level D078 overview/transfer/method-context copy: {stats['top_level_journey_copy_units']} units; {stats['top_level_journey_copy_units_with_candidate_terms']} contain candidate technical terms.",
        f"- Candidate terminology ledger: {stats['distinct_candidate_terms']} distinct terms and {stats['candidate_term_occurrences']:,} occurrences; every occurrence remains unreviewed until checked on its route.",
        f"- Candidate terminology coverage: {stats['technical_terms_with_glossary_rule']} terms match a glossary rule at the term occurrence; {stats['technical_terms_expanded_inline']} are explicitly expanded in copy; {stats['technical_terms_without_glossary_or_inline_expansion']} have neither candidate explanation. This is a routing aid for human review, not a correctness pass.",
        f"- Fields referenced by the journey but excluded by the data exporter: {', '.join(dropped_ui_fields) if dropped_ui_fields else 'none'}.",
        f"- Relationship panel scope: {stats['relationship_edges_in_panel_scope']:,} resolved, ready edge records; {stats['relationship_edges_with_custom_explanation']:,} have stored explanations, {stats['relationship_edges_without_explanation']:,} have none, {stats['relationship_edges_with_generic_internal_note']:,} contain the generic internal note.",
        f"- Long units across graph copy, static screen text, top-level journey copy and relationship explanations: {stats['copy_units_over_word_thresholds']['32']:,} exceed 32 words, {stats['copy_units_over_word_thresholds']['50']:,} exceed 50, and {stats['copy_units_over_word_thresholds']['70']:,} exceed 70 words.",
        f"- Exact stored-field aliases: {stats['exact_duplicate_definition_field_pairs']:,} identical `description`/`overview` or `meaning`/`plain_language_meaning` pairs; the journey chooses one field in each pair, so this is not a count of repeated on-screen paragraphs.",
        f"- Replacement-character occurrences across audited copy: {stats['replacement_character_occurrences']}; source-code-like snippets excluded from the static UI scan: {stats['source_code_fragments_excluded']:,}.",
        "", "## Visible copy by record type", "", "| Record type | Visible records | Copy units |", "|---|---:|---:|",
    ]
    unit_counts = collections.Counter(u["kind"] for u in text_units)
    for kind, count in kinds.most_common():
        lines.append(f"| {kind} | {count} | {unit_counts[kind]} |")
    lines += ["", "## Surface-by-surface review", "", "| Surface | Render path | Finding / remaining boundary |", "|---|---|---|"]
    for row in surface_review:
        lines.append(f"| {row['surface']} | `{row['render_path']}` | {row['status']} |")
    lines += ["", "## Candidate issue counts", "", "| Candidate flag | Records |", "|---|---:|"]
    for issue, count in issue_counts.most_common():
        lines.append(f"| {issue} | {count} |")
    lines += [
        "", "## Remaining review targets", "",
        "- Complete human accuracy and first-use review for the candidate terminology ledger; a glossary rule does not prove that the sentence is correct or that the term is explained at first use on every route.",
        "- Review every flagged area, tool, task-family and role record in its actual screen context; decide edits from its source and task context rather than from the heuristic flag alone.",
        "- Resolve the 19 role task families that lack a separate output field through evidence review; do not make up outputs to fill the display.",
        "- Relationship-panel explanations are being handled by its owner; review all explanations for item-specific context and route behavior there.",
        "- Human-review all programme theme/outcome text in its rendered sections for precision and plain-language flow; preserve the distinction between curriculum content and learner abilities.",
        "", "## Copy revisions applied in this pass", "",
        "These source-backed copy edits do not approve the whole D078 journey or clear the full terminology ledger.",
        "- **Sociology programme page:** the overview explains institutions, shared ways of life, inequality and research in context, and names recorded learning outcomes accurately. Course themes, outcomes and abilities remain distinct; generic curriculum fallbacks and unavailable states use student-facing wording.",
        "- **Social Sciences domain page:** the overview defines evidence and methods in plain language; the student orientation explains what the field studies, what researchers do, example questions, work steps, possible products and Sociology's role as a starting point. Route order and source-backed programme connections remain unchanged.",
        "- **Domain detail page:** shared-foundation guidance and the specialist-approach heading explain their purpose in everyday language without changing route bands or item selection.",
        "- **Programme-to-area link:** the transition says directly that recorded course outcomes connect the programme and area.",
        "- **Computational social research:** expanded its definition, field relevance, examples, learner output and limits; removed source-access notes from visible limitations. Its conditional, skippable disposition is unchanged.",
        "- **Area tools:** the seven separate LimeSurvey, NVivo, Python, R, SPSS, Stata and Taguette cards now say what each tool is, how it can help with work in Social Behaviour and Interaction, an example output and what the tool cannot establish. Each remains optional and nonblocking.",
        "- **Technical explanations:** corrected or expanded shared glossary entries for statistical significance, regression, logistic regression, mixed methods, computational methods, evaluation, theory of change, sampling, case studies, psychometrics, time-series analysis, and inter-coder reliability. The terminology audit requires a rule to overlap its term occurrence and recognizes acronyms expanded in the same copy; these checks do not prove definition accuracy or first-use coverage on every route.",
        "- **Data projection:** the exporter now includes `why_it_matters`, `field_context` and `task_conditions` already read by the journey; the audit reports no remaining UI-used fields dropped by that exporter.",
        f"- **Graph integrity:** the copy updater verified that the node IDs, edge IDs and counts were unchanged ({stats['graph_nodes_total']:,} nodes; {stats['graph_edges_total']:,} edges). It did not edit route, requirement-lane, ownership or role-fit fields.",
        "- **Source basis:** [NUC Social Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), [University of Edinburgh computational social science course](https://opencourse.inf.ed.ac.uk/css), [Edelmann et al. review](https://pmc.ncbi.nlm.nih.gov/articles/PMC8612450/), [digital-trace data guidance](https://pmc.ncbi.nlm.nih.gov/articles/PMC11971172/), [UKRI/ESRC online-research ethics guidance](https://www.ukri.org/councils/esrc/guidance-for-applicants/research-ethics-guidance/internet-mediated-research/), [Columbia network-analysis guide](https://www.publichealth.columbia.edu/research/population-health-methods/social-network-analysis), [agent-based modelling review](https://pmc.ncbi.nlm.nih.gov/articles/PMC4430112/), [LimeSurvey manual](https://www.limesurvey.org/manual/LimeSurvey_Manual), [NVivo coding guide](https://community.lumivero.com/s/article/NVR1Mac-Content-coding-coding), [Python tutorial](https://docs.python.org/3/tutorial/), [R overview](https://www.r-project.org/about.html), [IBM SPSS t-test documentation](https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=test-overview-t-command), [Stata panel-data guide](https://www.stata.com/features/panel-longitudinal-data/), [Taguette](https://app.taguette.org/), [Magenta Book](https://www.gov.uk/government/publications/the-magenta-book), [ASA p-value statement](https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf), and [CDC qualitative-data guidance](https://www.cdc.gov/field-epi-manual/php/chapters/qualitative-data.html).",
        "", "## Exact flagged records", "",
        "The JSON companion contains full copy text, owner context, source references, candidate technical terms and issue flags.",
        f"A copy unit is flagged as long only above 70 words; {stats['copy_units_over_word_thresholds']['70']:,} audited {'unit exceeds' if stats['copy_units_over_word_thresholds']['70'] == 1 else 'units exceed'} that threshold across all audited surfaces. Shorter units are still subject to human accuracy and readability review.",
        "", "| Record | Type | Area | Flags |", "|---|---|---|---|",
    ]
    for node in flags:
        lines.append(f"| {node['id']} | {node['kind']} | {node.get('area') or 'programme/domain/role'} | {', '.join(node['issues'])} |")
    lines += ["", "### Copy units over 70 words", "", "| Location | Type / field | Words | Text excerpt |", "|---|---|---:|---|"]
    for unit in long_copy_units_over_70:
        excerpt = (unit["text"] or "").replace("|", "\\|")[:220]
        lines.append(f"| {unit['location']} | {unit['kind']} / {unit['field']} | {unit['word_count']} | {excerpt} |")
    if not long_copy_units_over_70:
        lines.append("| None | — | 0 | No audited copy unit exceeds the threshold. |")
    lines += [
        "", "## Method and limits", "",
        "This is a graph-backed inventory plus a separate copy-only repair pass. Static JSX text is collected from the listed D078-related screens, but runtime-generated report text and API-only programme copy may need a separate pass. The technical-term list is a candidate finder, not an exhaustive dictionary. Final clearance still requires editorial and subject-matter review of visible copy, evidence review for the 19 missing role-task outputs, review of relationship-panel explanations by their owner, and inspection of all rendered routes. No browser or rendered visual acceptance is claimed.",
        "", f"Machine-readable worklist: {OUT_JSON.relative_to(ROOT).as_posix()}", "",
    ]
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(stats, ensure_ascii=False, indent=2))
    print(f"Wrote {OUT_JSON.relative_to(ROOT)}")
    print(f"Wrote {OUT_MD.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
