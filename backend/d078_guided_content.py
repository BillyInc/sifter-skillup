"""Locally approved, item-scoped D078 learning content for guided responses.

The audit graph remains an internal artifact. Runtime visibility is determined
by explicit per-item dispositions, never by the graph's global visibility flag.
This module does not alter or re-adjudicate role-fit routes.
"""

from __future__ import annotations

import json
import hashlib
import re
from urllib.parse import urlparse
from functools import lru_cache
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MASTER_PATH = ROOT / "data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json"
DOMAIN = "D078"
_DOMAIN_RESEARCH_FOUNDATION_ORDER = {
    "d078-research-question-design": 1,
    "d078-evaluate-evidence-and-limits": 2,
    "d078-communicate-evidence": 3,
}
# The learner sees a progressive spine after the three shared foundations.
# These labels describe display sequencing only; only the shared foundations
# gate progression. Method/tool groups are deliberately web-like: alternatives
# are choices and complements can be studied together.
_D078_DOMAIN_SEQUENCE: dict[str, dict[str, Any]] = {
    "d078-research-question-design": {"band": "shared_foundation", "kind": "compulsory", "order": 1, "why": "Start by turning a social question into a researchable question."},
    "d078-evaluate-evidence-and-limits": {"band": "shared_foundation", "kind": "compulsory", "order": 2, "why": "Then learn to judge what evidence can and cannot support."},
    "d078-communicate-evidence": {"band": "shared_foundation", "kind": "compulsory", "order": 3, "why": "Then communicate a bounded conclusion clearly and transparently."},
    "d078-society-and-social-world-knowledge": {"band": "domain_core", "kind": "recommended", "order": 10, "why": "Use domain knowledge to frame the question and recognise the social setting."},
    "reference_and_literature_management": {"band": "domain_core", "kind": "recommended", "order": 11, "why": "Find and organise prior evidence before choosing a design."},
    "d078-secondary-data": {"band": "domain_core", "kind": "recommended", "order": 12, "why": "Check whether existing data can answer the question before collecting new data."},
    "sampling_recruitment_and_representativeness": {"band": "domain_core", "kind": "recommended", "order": 13, "why": "Decide whose evidence is needed and how the sample supports the claim."},
    "measurement_and_operationalisation": {"band": "domain_core", "kind": "recommended", "order": 14, "why": "Define how concepts become observable measures."},
    "reliability_validity_and_uncertainty": {"band": "domain_core", "kind": "recommended", "order": 15, "why": "Check whether measures and conclusions are dependable enough for the claim."},
    "d078-responsible-research": {"band": "cross_cutting", "kind": "conditional", "order": 20, "why": "Apply consent, harm, privacy and governance safeguards whenever the route requires them."},
    "d078-care-for-research-data": {"band": "cross_cutting", "kind": "conditional", "order": 21, "why": "Protect and manage research data alongside the selected design."},
    "open_science_preregistration_and_reproducibility": {"band": "cross_cutting", "kind": "recommended", "order": 22, "why": "Make decisions and analysis reproducible when the project benefits from an open workflow."},
    "ai_assisted_and_digital_trace_research_ethics": {"band": "cross_cutting", "kind": "conditional", "order": 23, "why": "Use this extension when automated or digital-trace evidence is part of the project."},
    "d078-quantitative-approach": {"band": "method_routes", "kind": "alternative", "order": 30, "group": "evidence_method_family", "why": "Choose this route when the question needs numeric comparison or estimation."},
    "d078-qualitative-approach": {"band": "method_routes", "kind": "alternative", "order": 31, "group": "evidence_method_family", "why": "Choose this route when meaning, experience or process needs detailed interpretation."},
    "d078-mixed-methods": {"band": "method_routes", "kind": "alternative", "order": 32, "group": "evidence_method_family", "why": "Combine quantitative and qualitative evidence when the question genuinely needs both."},
    "survey-method": {"band": "method_routes", "kind": "alternative", "order": 33, "group": "evidence_collection", "why": "Use a survey when structured responses across people or cases are useful."},
    "d078-survey-method": {"band": "method_routes", "kind": "alternative", "order": 33, "group": "evidence_collection", "why": "Use a survey when structured responses across people or cases are useful."},
    "d078-interviews": {"band": "method_routes", "kind": "alternative", "order": 34, "group": "evidence_collection", "why": "Use interviews when participants' accounts and meanings are central."},
    "d078-document-analysis": {"band": "method_routes", "kind": "alternative", "order": 35, "group": "evidence_collection", "why": "Use documents when records, texts or institutional traces are the evidence."},
    "d078-observation-ethnography": {"band": "method_routes", "kind": "alternative", "order": 36, "group": "evidence_collection", "why": "Use observation when practice and interaction need to be seen in context."},
    "focus_groups_and_workshops": {"band": "method_routes", "kind": "complementary", "order": 37, "group": "evidence_collection", "why": "Add group discussion when interaction between participants is part of the question."},
    "case_study_and_comparative_case_design": {"band": "method_routes", "kind": "complementary", "order": 38, "why": "Use case design to connect evidence to a bounded setting or comparison."},
    "archival_and_historical_research": {"band": "method_routes", "kind": "alternative", "order": 39, "group": "evidence_collection", "why": "Use archival or historical sources when the question depends on records over time."},
    "participatory_and_action_research": {"band": "method_routes", "kind": "complementary", "order": 40, "why": "Add participatory practice when people affected by the work help shape it."},
    "pilot_and_cognitive_pretesting": {"band": "method_routes", "kind": "complementary", "order": 41, "why": "Pilot instruments or prompts before the main collection when the design needs testing."},
    "programme_evaluation_and_theory_of_change": {"band": "advanced_extensions", "kind": "specialist", "order": 50, "why": "Add this when you need to explain or assess how an intervention is expected to work."},
    "experiments_quasi_experiments_and_causal_inference": {"band": "advanced_extensions", "kind": "specialist", "order": 51, "why": "Add this when the claim concerns effects, counterfactuals or causal attribution."},
    "psychometrics_and_scale_construction": {"band": "advanced_extensions", "kind": "specialist", "order": 52, "why": "Add this when you need to construct or validate a scale or instrument."},
    "longitudinal_panel_and_multilevel_data": {"band": "advanced_extensions", "kind": "specialist", "order": 53, "why": "Add this when the design follows units over time or models nested data."},
    "systematic_and_scoping_evidence_synthesis": {"band": "advanced_extensions", "kind": "specialist", "order": 54, "why": "Add this when the task is to map or synthesise a body of evidence."},
    "discourse_and_conversation_analysis": {"band": "advanced_extensions", "kind": "specialist", "order": 55, "why": "Add this when language, interaction or discourse is the evidence."},
    "d078-computational-social-research": {"band": "specialist_extensions", "kind": "specialist", "order": 60, "why": "Add this when the question requires computational or digital-trace analysis."},
    "d078-spatial-social-analysis": {"band": "specialist_extensions", "kind": "specialist", "order": 61, "why": "Add this when location, mapping or spatial variation matters."},
    "d078-agent-based-modeling": {"band": "specialist_extensions", "kind": "specialist", "order": 62, "why": "Add this when you need to model interacting agents and emergent processes."},
    "d078-statistical-tool-choice": {"band": "tool_support", "kind": "tool_support", "order": 70, "group": "quantitative_tools", "why": "Use this decision card to match a statistical tool to the chosen analysis."},
    "d078-survey-data-collection-tool": {"band": "tool_support", "kind": "tool_support", "order": 71, "group": "collection_tools", "why": "Use a collection tool only when the selected design needs it."},
    "d078-qualitative-coding-tool": {"band": "tool_support", "kind": "tool_support", "order": 72, "group": "qualitative_tools", "why": "Use a coding tool when the selected qualitative workflow benefits from it."},
    "d078-social-network-tool": {"band": "tool_support", "kind": "tool_support", "order": 73, "group": "network_tools", "why": "Use a network tool when the question is about ties or relational structure."},
    "d078-excel-data-tool": {"band": "tool_support", "kind": "tool_support", "order": 74, "group": "data_tools", "why": "Use a spreadsheet when it is a suitable scale for the selected data task."},
    "d078-spss-tool": {"band": "tool_support", "kind": "alternative", "order": 75, "group": "quantitative_tools", "why": "Choose this quantitative tool as one route; it is an alternative, not an extra blocker."},
    "d078-jamovi-tool": {"band": "tool_support", "kind": "alternative", "order": 76, "group": "quantitative_tools", "why": "Choose this quantitative tool as one route; it is an alternative, not an extra blocker."},
    "r_statistical_computing": {"band": "tool_support", "kind": "alternative", "order": 77, "group": "quantitative_tools", "why": "Choose R when a programmable and reproducible statistical workflow fits."},
    "stata_quantitative_social_science_workflow": {"band": "tool_support", "kind": "alternative", "order": 78, "group": "quantitative_tools", "why": "Choose Stata when its quantitative workflow fits the selected design."},
    "d078-nvivo-tool": {"band": "tool_support", "kind": "alternative", "order": 79, "group": "qualitative_tools", "why": "Choose NVivo as one qualitative coding route when it fits the workflow."},
    "d078_python": {"band": "tool_support", "kind": "alternative", "order": 80, "group": "computational_tools", "why": "Choose Python when the computational route needs a programmable workflow."},
    "d078-pandas-tool": {"band": "tool_support", "kind": "complementary", "order": 81, "group": "computational_tools", "why": "Use pandas alongside Python when tabular data preparation is needed."},
    "d078-matplotlib-tool": {"band": "tool_support", "kind": "complementary", "order": 82, "group": "computational_tools", "why": "Use Matplotlib alongside Python when the workflow needs visualisation."},
    "d078_jupyter": {"band": "tool_support", "kind": "complementary", "order": 83, "group": "computational_tools", "why": "Use Jupyter alongside code when an inspectable notebook workflow helps."},
    "d078_statsmodels": {"band": "tool_support", "kind": "complementary", "order": 84, "group": "computational_tools", "why": "Use statsmodels alongside Python for supported statistical models."},
    "d078_scikit_learn": {"band": "tool_support", "kind": "complementary", "order": 85, "group": "computational_tools", "why": "Use scikit-learn when predictive or text modelling is part of the route."},
    "d078-networkx-tool": {"band": "tool_support", "kind": "complementary", "order": 86, "group": "network_tools", "why": "Use NetworkX alongside a network method when programmable graph analysis is needed."},
    "d078-mesa-tool": {"band": "tool_support", "kind": "complementary", "order": 87, "group": "agent_based_tools", "why": "Use Mesa alongside agent-based modelling when a runnable simulation is needed."},
}
ROLE_GRAPH_PATH = ROOT / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json"
ROLE_TOOL_PATH = ROOT / "data/career-mapping/_audit/D078_ROLE_TOOL_ROUTE_ENRICHMENT_2026_10_16.json"
DOMAIN_SOURCE_SECTIONS = (
    "existing_inventory",
    "foundation_and_route_additions",
    "route_alternatives",
    "deep_search_options",
)


SOCIOLOGY_PROGRAMME_CONTEXT = (
    "Your Sociology programme gives you a starting point for the Social Sciences field. This item adds learning beyond the courses confirmed in your programme; "
    "we connect it to a particular course only when that course's stated learning outcome supports the link."
)


def _read(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


@lru_cache(maxsize=1)
def d078_sociology_programme_themes() -> list[dict[str, Any]]:
    """Return the reviewed, fixed-curriculum Sociology theme narratives.

    Theme grouping is presentation structure, not a new curriculum claim or
    selectable learning item. Raw outcome rows remain evidence and are not
    synthesized into unreviewed claims here.
    """
    master = _read(MASTER_PATH)
    programme = master.get("programme") or {}
    source = (programme.get("sources") or {}).get("nuc_social_sciences_ccmas_2023") or {}
    if (
        programme.get("programme") != "Sociology"
        or programme.get("domain_key") != DOMAIN
        or not _https(source.get("url"))
    ):
        return []
    source_ref = {
        "title": source.get("title") or "Social Sciences CCMAS",
        "publisher": source.get("publisher"),
        "url": source["url"],
        "jurisdiction": source.get("jurisdiction"),
        "accessedOn": source.get("accessed_on"),
    }
    themes: list[dict[str, Any]] = []
    for theme in master.get("programme_themes") or []:
        if theme.get("approval_status") != "approved":
            continue
        anchors = []
        for anchor in theme.get("courseAnchors") or []:
            if not isinstance(anchor, dict) or not anchor.get("courseCode"):
                continue
            anchors.append({
                "courseCode": anchor.get("courseCode"),
                "courseTitle": anchor.get("courseTitle"),
                "courseSummary": anchor.get("contentSummary"),
                "sourceLocator": anchor.get("sourceLocatorText"),
                "sourceUrl": source_ref["url"],
            })
        themes.append({
            "themeKey": theme.get("themeKey"),
            "title": theme.get("title"),
            "summary": theme.get("themeDescription"),
            "narration": theme.get("narration"),
            "courseCodes": list(theme.get("courseCodes") or []),
            "courseAnchors": anchors,
            "source": source_ref,
            "groupingStatus": theme.get("approval_status"),
            "studentCopyStatus": theme.get("studentCopyStatus"),
            "studentCopyApproval": theme.get("student_copy_approval"),
            "selectionState": "fixed_programme_guidance_not_selectable",
        })
    return themes


def _https(value: Any) -> bool:
    return bool(re.match(r"^https://[^\s]+$", str(value or ""), re.IGNORECASE))


def _stable_source_id(source: dict[str, Any]) -> str | None:
    identity = source.get("source_id") or source.get("id")
    if identity:
        return str(identity)
    url = str(source.get("url") or "").strip()
    return f"url_{hashlib.sha256(url.encode('utf-8')).hexdigest()[:16]}" if _https(url) else None


def _domain_contract_records(contract: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        row["id"]: row
        for section in DOMAIN_SOURCE_SECTIONS
        for row in contract.get(section, [])
        if row.get("id")
    }


def _source_reference(source: dict[str, Any], role: str | None = None) -> dict[str, Any] | None:
    url = source.get("url")
    if not _https(url):
        return None
    # A source previously flagged as unsafe for student display remains
    # available to staff audit, but is not surfaced as an external link.
    limits = " ".join(str(source.get(key) or "") for key in ("limits", "scope_limit", "scope_note", "limitations"))
    if "do not use it as a student-facing link" in limits.casefold():
        return None
    return {
        "id": _stable_source_id(source),
        "title": source.get("title") or source.get("label") or source.get("publisher") or "Source",
        "url": url,
        "region": source.get("jurisdiction") or source.get("geographic_scope"),
        "evidenceType": role or source.get("claim_role") or source.get("kind"),
    }


def _sources_to_refs(sources: list[dict[str, Any]], role: str | None = None) -> list[dict[str, Any]]:
    refs = [_source_reference(row, role) for row in sources]
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for ref in refs:
        key = f"{ref['id'] or ''}|{ref['url']}" if ref else ""
        if ref and key not in seen:
            seen.add(key)
            out.append(ref)
    return out


def _explanation(value: Any) -> str | None:
    if isinstance(value, dict):
        if value.get("state") == "not_established_for_this_candidate":
            return None
        value = value.get("explanation") or value.get("value") or value.get("description")
    text = str(value or "").strip()
    return text or None


def _learner_notes(value: Any) -> list[str]:
    """Normalize reviewed limits without exposing audit-state objects as prose."""
    values = value if isinstance(value, (list, tuple)) else [value]
    notes: list[str] = []
    for entry in values:
        text = _explanation(entry)
        if not text or text.casefold() in {"state", "label", "explanation"}:
            continue
        if re.fullmatch(r"Essential priority is a candidate only, not proof of D078-wide foundation\.?", text, flags=re.I):
            text = (
                "A high priority for one role does not make this a shared foundation for every learner. "
                "It matters only when the selected route includes work that uses it."
            )
        if text not in notes:
            notes.append(text)
    return notes


def _why_this_learning_resource(link: dict[str, Any], item_name: str) -> str | None:
    """Return item-specific learner copy using the reviewed resource evidence."""
    explicit = _explanation(
        link.get("evidence_use")
        or link.get("why_this_resource")
        or link.get("what_it_teaches")
        or link.get("what_supported")
        or link.get("supports")
    )
    if explicit:
        return explicit
    locator = _explanation(link.get("locator") or link.get("exact_locator"))
    if not locator:
        return None
    # The locator is source-reviewed and identifies the exact relevant section;
    # do not imply that the whole resource is an endorsement or qualification.
    return f"The listed sections cover {locator}. They are linked as a focused guide to {item_name}, not as proof of competence or a qualification."


def _source_locators(sources: list[dict[str, Any]], role: str | None = None) -> list[dict[str, Any]]:
    out = []
    for source in sources:
        locator = source.get("locator") or source.get("exact_locator")
        if not locator:
            continue
        out.append({
            "sourceId": _stable_source_id(source),
            "title": source.get("title") or source.get("label"),
            "url": source.get("url"),
            "locator": locator,
            "claimRole": role or source.get("claim_role") or source.get("kind"),
        })
    return out


def _item_type(raw: str) -> str:
    normalized = str(raw or "").casefold().replace("-", "_")
    if normalized in {"competency", "skill", "method", "knowledge", "certification", "resource"}:
        return normalized
    if normalized in {"emerging_method", "skill_method"}:
        return "method"
    if normalized in {
        "tool", "tool_option", "python_library", "tool_framework", "experimental_framework",
        "emerging_tool_use", "tool_group", "programming_language", "computational_environment", "framework",
    }:
        return "tool"
    # Unknown taxonomy terms are not exposed under a fabricated student type.
    raise ValueError(f"Unsupported D078 guided item type: {raw}")


def _domain_item_type(row: dict[str, Any], contract_row: dict[str, Any]) -> str:
    raw = str(contract_row.get("type") or "").casefold()
    if raw in {"competency", "skill", "method", "knowledge", "tool", "software", "framework"}:
        return "tool" if raw in {"software", "framework"} else raw
    if raw == "knowledge_skill":
        # These combined labels describe learner capabilities, not software.
        return "skill"
    # Some older source rows use `software`/`language` only in their id/title.
    identity = f"{row.get('item_id', '')} {row.get('label', '')}".casefold()
    if any(term in identity for term in ("tool", "python", "r statistical", "stata", "spSS", "nvivo", "networkx", "mesa", "casevo", "jupyter", "pandas", "scikit-learn", "jamovi", "excel", "matplotlib")):
        return "tool"
    return "method"


def _domain_evidence(contract_row: dict[str, Any], closure: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, list[dict[str, Any]]]]:
    def domain_scope_sources(values: list[dict[str, Any]]) -> list[dict[str, Any]]:
        # The APSA political-science teaching report is useful in its own
        # disciplinary context, but cannot establish a general Social Sciences
        # domain claim. Keep it in the audit source ledger, not on shared D078
        # learner cards; use the broader evidence recorded for each item.
        return [
            source for source in values
            if "rethinking political science education" not in str(source.get("title") or "").casefold()
        ]

    role_sources = {
        "item_identity": contract_row.get("item_definition_sources") or [],
        "checkpoint_fit": contract_row.get("checkpoint_fit_sources") or [],
        "plain_meaning": contract_row.get("explanatory_sources") or [],
    }
    all_sources = [source for sources in role_sources.values() for source in sources]
    if not all_sources:
        # Existing inventory records predate the role-specific contract; use
        # their explicit source IDs and exact locators as bounded evidence.
        all_sources = [
            {**source, "source_id": source.get("source_id"), "locator": source.get("exact_locator"), "claim_role": "domain_evidence"}
            for source in closure.get("evidence", [])
        ]
        role_sources["item_identity"] = all_sources
        role_sources["checkpoint_fit"] = all_sources
        role_sources["plain_meaning"] = all_sources
    refs = _sources_to_refs(domain_scope_sources(all_sources))
    # Retain exact current learning-link metadata in addition to claim evidence.
    link_refs = [
        {
            "source_id": _stable_source_id(link),
            "title": link.get("label"),
            "publisher": link.get("publisher"),
            "url": link.get("url"),
            "locator": link.get("locator"),
            "accessed": link.get("verified_on") or link.get("accessed_on"),
            "access": link.get("access"),
            "limits": link.get("scope_limit"),
            "claim_role": link.get("role"),
        }
        for link in contract_row.get("learning_links", [])
        if _https(link.get("url"))
    ]
    return refs, role_sources | {"learning_link": link_refs}


def _domain_requirement_level(category: str) -> str:
    """Return an evidence-safe lane for a static D078 domain item.

    Category describes scope/ownership. The three reviewed shared foundations
    are the only compulsory domain gate; every later item remains skippable.
    """
    normalized = re.sub(r"[^a-z0-9]+", "_", str(category or "").casefold()).strip("_")
    if any(token in normalized for token in (
        "optional", "specialist", "hold_emerging", "area_specific",
        "specialization_owned", "no_domain_wide_certification",
    )):
        return "optional"
    if any(token in normalized for token in (
        "shared_foundation", "useful", "conditional", "method_choice",
        "route_choice", "applied_route",
    )):
        return "useful"
    # Unknown categories must never be promoted into the compulsory lane.
    return "optional"


def _area_requirement_level(decision: dict[str, Any]) -> str:
    """Use reviewed route language, never item type, to place area items."""
    scope = " ".join(str(decision.get(key) or "") for key in ("display_scope", "student_scope", "rationale"))
    if re.search(r"\boptional\b|not a prerequisite|can continue without", scope, flags=re.IGNORECASE):
        return "optional"
    # Area placement is not proof of compulsory need. Without explicit
    # evidence for a hard route requirement, show it as a useful, skippable
    # addition.
    return "useful"


def _domain_item(row: dict[str, Any], contract_row: dict[str, Any], decision: dict[str, Any]) -> dict[str, Any]:
    closure = row["closure"]
    refs, sources_by_role = _domain_evidence(contract_row, closure)
    link = decision.get("learning_link_override")
    if not link:
        candidate_links = closure.get("learning_links", [])
        link = next((item for item in candidate_links if item.get("role") == "free_task_specific_learning_resource"), None)
        link = link or (candidate_links[0] if candidate_links else None)
    if not link or not _https(link.get("url")):
        raise ValueError(f"Promoted domain item has no verified HTTPS learning link: {row.get('item_id')}")
    link_locator = link.get("locator") or link.get("exact_locator")
    link_ref = {
        "id": _stable_source_id(link),
        "title": link.get("label") or link.get("title"),
        "url": link["url"],
        "region": "global",
        "evidenceType": "task_specific_learning_resource",
    }
    evidence_refs = refs + ([link_ref] if link_ref["url"] not in {ref["url"] for ref in refs} else [])
    claims = {}
    for key, sources in sources_by_role.items():
        if key == "learning_link":
            continue
        claim_refs = _sources_to_refs(sources)
        locators = _source_locators(sources, key)
        if claim_refs and locators:
            claims[key] = {"source_references": claim_refs, "source_locators": locators}
    # A local disposition explicitly reviews this item's user-facing context.
    checkpoint_sources = sources_by_role.get("checkpoint_fit", []) or sources_by_role.get("item_identity", [])
    plain_sources = sources_by_role.get("plain_meaning", []) or sources_by_role.get("item_identity", [])
    contextual_sources = checkpoint_sources or plain_sources
    claims["plain_meaning"] = {"source_references": _sources_to_refs(plain_sources), "source_locators": _source_locators(plain_sources, "plain_meaning")}
    claims["contextual_use"] = {"source_references": _sources_to_refs(contextual_sources), "source_locators": _source_locators(contextual_sources, "contextual_use")}
    claims["item_identity"] = claims.get("item_identity") or claims.get("checkpoint_fit") or claims["plain_meaning"]
    # Some approved domain concepts have their reviewed learner output in the
    # domain contract's `output` field rather than the enrichment row's
    # `closure.learner_output`. Treat both as the same claim source so the API
    # never presents a student-facing deliverable without claim-level evidence.
    output = closure.get("learner_output")
    if output is None:
        output = contract_row.get("output")
    if isinstance(output, dict):
        output_text = output.get("explanation") if output.get("state") == "not_established_for_this_candidate" else output.get("value") or output.get("description")
    else:
        output_text = str(output or "").strip() or None
    if output_text and output_text != "No distinct occupational deliverable is established; a student-facing output must not be invented from technical compatibility.":
        claims["expected_output"] = claims.get("contextual_use")
    id_type = _domain_item_type(row, contract_row)
    item_key = str(row.get("item_id") or "")
    requirement_scope: dict[str, Any] = {}
    sequence = _D078_DOMAIN_SEQUENCE.get(item_key, {})
    if item_key in _DOMAIN_RESEARCH_FOUNDATION_ORDER:
        requirement_scope = {
            "lane": "needed",
            "base_requirement_level": "needed",
            "scope_kind": "shared_domain_foundation",
            "condition": "Required after programme selection before domain, area or role learning can continue in D078.",
            "recommended_teaching_order": _DOMAIN_RESEARCH_FOUNDATION_ORDER[item_key],
            "ordering_semantics": "compulsory_foundation_spine",
            "skippable": False,
            "blocks_progression": True,
            "auto_add": False,
            "auto_order": True,
            "can_select_alongside_needed": False,
        }
    elif item_key == "d078-casevo-tool":
        requirement_scope = {
            "lane": "unapproved",
            "scope_kind": "domain_lane_not_established",
            "student_eligible": False,
            "visibility_reason": "The domain-level requirement lane is not established; the separately reviewed Economics-area CASEVO route remains distinct.",
            "blocks_progression": False,
            "auto_add": False,
            "auto_order": False,
            "can_select_alongside_needed": True,
        }
    category = (closure.get("category_rationale") or {}).get("category") or row.get("category") or "domain_learning_option"
    required_shared_foundations = {
        "d078-research-question-design": 1,
        "d078-evaluate-evidence-and-limits": 2,
        "d078-communicate-evidence": 3,
    }
    item_key = str(row.get("item_id") or "")
    is_required_shared_foundation = item_key in required_shared_foundations
    # Never fall back to display_scope: it is internal placement metadata and
    # has previously leaked labels such as “useful additional edge” to learners.
    use_case = contract_row.get("use_case") or closure.get("use_case") or closure.get("contextual_use")
    display_override = _DOMAIN_ITEM_DISPLAY_OVERRIDES.get(str(row.get("item_id") or ""), {})
    use_case = display_override.get("contextual_use", use_case)
    if is_required_shared_foundation:
        domain_context = "This is a compulsory shared Social Sciences research-and-evidence foundation. Complete the three shared foundations before continuing to the domain sequence, area additions or role learning."
    elif "shared_foundation" in category:
        domain_context = "This belongs to the shared Social Sciences starting point and supports more than one area. It is a foundation for exploring the field, not a claim that every learner must master every listed option."
    elif "conditional" in category:
        domain_context = "This is a conditional part of the Social Sciences learning path: use it when the question, evidence or selected route calls for it, rather than treating it as a universal prerequisite."
    elif "useful" in category:
        domain_context = "This is a useful additional capability at domain level. It can strengthen relevant area or role routes, but it is not required on every Social Sciences path."
    else:
        domain_context = "This is a focused or optional Social Sciences learning option. Choose it only when its specific task fits the area or role you are exploring."
    linksources = sources_by_role.get("learning_link", [])
    geographic_scope = "nigeria_to_global" if any(str(source.get("publisher") or "").casefold().find("nigeria") >= 0 or source.get("source_id") == "nuc_ccmas" for source in refs) else "global"
    return {
        "contextLevel": "domain",
        "contextKey": DOMAIN,
        "domainId": DOMAIN,
        "itemType": id_type,
        "itemKey": row["item_id"],
        "name": row["label"],
        "plainMeaning": closure.get("meaning"),
        "contextualUse": use_case,
        "programmeContext": SOCIOLOGY_PROGRAMME_CONTEXT,
        "domainContext": domain_context,
        "expectedOutput": output_text if claims.get("expected_output") else None,
        "themeKey": category,
        "themeLabel": str(category).replace("_", " ").capitalize(),
        "useCaseKey": category if "shared_foundation" not in category else None,
        "requirementLevel": "needed" if is_required_shared_foundation else _domain_requirement_level(str(category)),
        "requirementScope": requirement_scope,
        "requirementReason": (
            "Compulsory shared D078 foundation. Complete these three items before moving into the domain sequence."
            if is_required_shared_foundation
            else "This is an optional focus for a narrower question or work route. You can continue through Social Sciences without choosing it; select it when the stated task fits your interests or plan."
            if _domain_requirement_level(str(category)) == "optional"
            else "This is a useful recommended learning option for the work described above, not a compulsory requirement for every Social Sciences student or role. You can continue without selecting it and return when a route or task makes it relevant."
        ),
        "priority": None,
        "priorityReason": None,
        "learningOrder": required_shared_foundations.get(item_key),
        "learningStage": sequence.get("band"),
        "sequenceBand": sequence.get("band"),
        "sequenceKind": sequence.get("kind"),
        "sequenceOrder": sequence.get("order"),
        "selectionGroup": sequence.get("group"),
        "coLearningGroup": sequence.get("group") if sequence.get("kind") == "complementary" else None,
        "displayWhyNext": sequence.get("why"),
        "blocksProgression": bool(is_required_shared_foundation),
        # Domain preparation notes are advisory explanations, not hard gates.
        # Only reviewed, learner-readable note lists are surfaced; structured
        # "not established" status records do not become student requirements.
        "prerequisites": list(closure.get("prerequisites") or [])
        if isinstance(closure.get("prerequisites"), list) else [],
        "relatedItems": [],
        "relationships": [],
        "pathTargets": [],
        "sourceIds": [ref.get("id") for ref in evidence_refs if ref.get("id")],
        "sourceReferences": evidence_refs,
        "sourceLocators": [
            locator
            for role, sources in sources_by_role.items()
            if role != "learning_link"
            for locator in _source_locators(sources, role)
        ],
        "geographicScope": geographic_scope,
        "evidenceLimitations": list(closure.get("limitations") or []) + [decision.get("curriculum_note", "")],
        "evidenceType": "source_supported_synthesis",
        "sourceConfidence": "medium",
        "dataState": "source_backed",
        "claimReviewState": "approved",
        "claimEvidence": {"claims": claims, "reviewed_by": "local_d078_item_disposition", "decision_id": decision.get("item_id")},
        "linkState": "linked",
        "linkUrl": link.get("url"),
        "linkTitle": link.get("label") or link.get("title"),
        "linkSourceReference": {"source_id": _stable_source_id(link), "title": link.get("label") or link.get("title"), "publisher": link.get("publisher"), "url": link.get("url"), "locator": link_locator, "accessed_on": link.get("accessed_on") or link.get("verified_on"), "scope_limit": link.get("scope_limit") or link.get("limits")},
        "linkAccessedAt": link.get("accessed_on") or link.get("verified_on") or "2026-10-12",
        "linkConfidence": "medium",
        "linkEvidence": {
            "url": link.get("url"),
            "locator": link_locator,
            "supports": link.get("what_it_teaches") or link.get("what_supported") or link.get("supports"),
            "why_this_resource": _why_this_learning_resource(link, row["label"]),
            "access": link.get("access"),
        },
        "linkKind": "free_task_specific_learning_resource",
        "linkLevel": link.get("level"),
        "linkLanguage": link.get("language") or "English",
        "linkAccess": link.get("access") or link.get("accessibility") or "Open resource; check the provider's current access terms.",
        "linkDuration": link.get("duration"),
        "guidanceOwner": "domain",
        "verifiedAt": "2026-10-12",
    }


def _approved_domain_relationships(
    contract_row: dict[str, Any],
    domain_contract: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    """Expose only item-level relationships explicitly approved in the master contract.

    These are advisory unless a separately reviewed hard-dependency record exists;
    they never silently add an item to a learner's selection or force sequence.
    """
    type_map = {
        "builds_on": "builds_on",
        "requires": "builds_on",
        "requires_for_interpretation": "builds_on",
        "prerequisite_for": "builds_on",
        "works_with": "works_with",
        "complements": "complements",
        "may_complement": "complements",
        "alternative_to": "alternative",
        "alternative_to_or_complements": "alternative",
        "has_alternatives": "alternative",
        "supports": "supports",
        "used_for": "supports",
        "implements": "supports",
        "implemented_by": "supports",
        "implemented_by_specialist_option": "supports",
        "guides_choice_of": "supports",
    }
    output: list[dict[str, Any]] = []
    for relationship in contract_row.get("relationships", []):
        if relationship.get("approval_status") != "approved" or relationship.get("status") != "approved":
            continue
        relationship_type = type_map.get(str(relationship.get("type") or ""))
        target = str(relationship.get("target") or "").strip()
        explanation = str(relationship.get("note") or "").strip()
        if not relationship_type or not target or not explanation:
            continue
        target_id = relationship.get("target_id")
        target_record = domain_contract.get(str(target_id or ""))
        target_name = str(target_record.get("label") or target) if target_record else target
        output.append({
            "relationshipType": relationship_type,
            "relationshipStatus": "source_backed",
            "reviewedContractRelationship": True,
            "toItemKey": str(target_id) if target_id else None,
            "toName": target_name,
            "learnerExplanation": explanation,
            "sequenceApproved": False,
            "sequencePolicy": "none",
            "sequenceScope": {"domainIds": [DOMAIN]},
            "sourceReferences": [],
        })
    return output


def _role_item_sources(record: dict[str, Any], claim_role: str) -> list[dict[str, Any]]:
    """Choose sources whose saved locator actually supports this role-item claim."""
    sources = [
        source for source in (record.get("evidence") or [])
        if _https(source.get("url")) and str(source.get("locator") or "").strip()
    ]
    if claim_role == "item_identity":
        selected = [
            source for source in sources
            if "/skill/" in str(source.get("url") or "").casefold()
            or "/knowledge/" in str(source.get("url") or "").casefold()
            or "exact-label api result" in str(source.get("locator") or "").casefold()
            or "exact item uri" in str(source.get("supports") or "").casefold()
        ]
    else:
        selected = [
            source for source in sources
            if "/occupation/" in str(source.get("url") or "").casefold()
            or "role task" in str(source.get("supports") or "").casefold()
            or "task family" in str(source.get("supports") or "").casefold()
        ]
    return selected or sources


def _role_item_type(record: dict[str, Any]) -> str:
    evidence = record.get("evidence") or []
    urls = " ".join(str(source.get("url") or "") for source in evidence).casefold()
    locators = " ".join(str(source.get("locator") or "") for source in evidence).casefold()
    if "/knowledge/" in urls or re.search(r"\btype\s+knowledge\b", locators):
        return "knowledge"
    if "/skill/" in urls or re.search(r"\btype\s+skill\b", locators):
        return "skill"
    raise ValueError(f"D078 role item has no source-backed learner item type: {record.get('queue_position')}")


def _role_item_identity(record: dict[str, Any]) -> str:
    for source in record.get("evidence") or []:
        url = str(source.get("url") or "")
        match = re.search(r"/(skill|knowledge)/([0-9a-f-]{36})(?:$|[?#])", url, re.I)
        if match:
            return f"ESCO-{match.group(1).upper()}-{match.group(2).lower()}"
    raise ValueError(f"D078 role item lacks a stable exact ESCO identity: {record.get('queue_position')}")


def _role_task_copy(value: Any, role_name: str | None = None) -> str:
    """Strip staff provenance from the reviewed task/output narration."""
    text = str(value or "").strip()
    if not text or text.casefold().startswith("no placement"):
        return ""
    text = re.split(r"\s+The role evidence is used to test the output context", text, maxsplit=1, flags=re.I)[0]
    text = re.split(r"\s+Current role-task records:", text, maxsplit=1, flags=re.I)[0]
    text = re.sub(r"^Task/output basis:\s*", "", text, flags=re.I).strip()
    # "Task family" is an internal taxonomy label, not learner language.
    # Translate it into the named role context without changing the claim.
    if role_name:
        role = re.escape(role_name.strip())
        text = re.sub(
            rf"\bFor the {role} task family\b",
            f"For tasks in the {role_name.strip()} role",
            text,
            flags=re.I,
        )
    # Older reviewed records use hyphenated role shorthand around this phrase.
    # Keep the underlying explanation, but remove both the developer term and
    # the shorthand so the sentence reads naturally to a learner.
    text = re.sub(r"\btask family\b", "work context", text, flags=re.I)
    for shorthand, display in (
        ("business-economics-research", "business economics research"),
        ("economic-policy-officer", "economic policy officer"),
        ("economic-adviser", "economic adviser"),
    ):
        text = re.sub(rf"\b{shorthand}\b", display, text, flags=re.I)
        text = re.sub(
            rf"\bthe current D078 {role} task family\b",
            f"the work described for the D078 {role_name.strip()} route",
            text,
            flags=re.I,
        )
    text = re.sub(r"^[\s•\uFFFD]+", "", text)
    # A small set of reviewed role-task records contains staff adjudication
    # language alongside otherwise useful learner context. Translate only
    # those known phrases; keep the underlying task and route decision intact.
    text = re.sub(
        r"^The role label .*?; this is a research candidate, not a statement that every .*?\.\s*",
        "",
        text,
        flags=re.I,
    )
    text = re.sub(r"\bMatch actual task to\b", "Depending on the research question, the work may involve", text, flags=re.I)
    text = re.sub(r"\bThe optional label is appropriate only where\b", "This is useful when", text, flags=re.I)
    text = re.sub(r"\band the source/profile supports that use\b", "", text, flags=re.I)
    text = re.sub(r"^The record associates this essential item with [^,;]+, but\s*", "", text, flags=re.I)
    text = re.sub(
        r"Keep the underlying analysis conditional on assignment and framework; do not call it an essential universal skill merely because the inventory says essential\.?",
        "Use it when the assignment names a relevant quality framework; it is not needed for every role task.",
        text,
        flags=re.I,
    )
    text = re.sub(
        r"The occurrence is an apparent scope anomaly.*?applied zoology\.",
        "Applied zoology applies biological knowledge to animals; it is not normally part of social or behavioural science, nor a general Behavioural Scientist requirement. Keep it as an optional interdisciplinary learning edge only when a specific study concerns animal behaviour, welfare, ecology or human–animal interaction and the learner is working with relevant biological expertise. For other Behavioural Scientist routes, this item is not needed.",
        text,
        flags=re.I,
    )
    text = re.sub(
        r"The broad role item is not sufficient to recommend a biological foundation; no clinical assessment, counselling, diagnosis, psychotherapy, treatment or licensure content is included\.",
        "This does not add a general biology requirement. The D078 route concerns social-science questions, not clinical assessment, counselling, diagnosis, psychotherapy, treatment or professional licensure.",
        text,
        flags=re.I,
    )
    text = re.sub(
        r"The current D078 genealogist work context.*?No D064 placement is inferred\.",
        "Tracing family relationships through records or oral histories is different from interpreting biological inheritance. Only consider pedigree-chart interpretation if a specific genetics task is part of the selected route, with appropriate consent, privacy safeguards and qualified review.",
        text,
        flags=re.I,
    )
    text = re.sub(
        r"The current role-task inventory records the label under Genealogist, but external sources reviewed do not support a general duty to analyze legislation\. Keep any plausible historical legal-context task narrow and mark the essential priority unsubstantiated until the full ESCO profile/source record is checked\.",
        "Legislation may matter in family-history research when a law affects records or life events. Use authoritative legal texts to understand historical context, and ask a qualified legal professional about formal legal interpretation; this is not a general genealogist duty.",
        text,
        flags=re.I,
    )
    text = re.sub(
        r"The optional label occurs in the Statistician record.*?resolve which one is intended\.",
        "Biometrics can mean applying statistics to biological or health data, or identifying people from traits such as fingerprints; these are different kinds of work. For a statistician, consider this option only when a specific assignment uses biological or health data. It is not a general requirement or a reference to identity-recognition systems.",
        text,
        flags=re.I,
    )
    text = re.sub(
        r"An optional audit-techniques item for a Tax Policy Analyst could support understanding audit/compliance evidence, but conducting formal audits is a distinct authorized function\. Exact ESCO meaning and role task are unresolved\.",
        "For a tax-policy analyst, understanding published audit or compliance findings may help explain how a tax rule is applied. Conducting or signing a formal audit is a separate responsibility and may require professional authorization; this learning option does not qualify you to do so.",
        text,
        flags=re.I,
    )
    text = re.sub(r"\bexact ESCO wording/profile still requires confirmation\.?", "", text, flags=re.I)
    text = re.sub(r"\bCurrent role/task provenance remains a source label, not proof of each task\.?", "", text, flags=re.I)
    text = re.sub(r"\s*Current area route is recorded as context; no foundation placement follows from the single occurrence\.?", " This is a focused option, not a shared foundation for the whole area.", text, flags=re.I)
    text = re.sub(r"\s*The label alone does not establish that all economic policy officers cover trade\.?", " This is a focused option, not a requirement for every economic policy role.", text, flags=re.I)
    text = re.sub(r"\bThe exact task depends on the source/profile\.?", "The precise task depends on the assignment and its evidence.", text, flags=re.I)
    text = re.split(r"\s+The current D078 genealogist work context", text, maxsplit=1, flags=re.I)[0]
    if text.casefold().startswith("no d078 placement."):
        text = (
            "This item is not currently recommended for the D078 route. "
            "Interpreting a pedigree chart means reading a diagram of biological inheritance, "
            "which is different from tracing family relationships through records or oral histories. "
            "It would require a clearly defined genetics task, informed consent and privacy safeguards, "
            "careful treatment of uncertainty, and qualified review."
        )
    # Preserve an explicit boundary so the UI can place the deliverable in its
    # own section rather than repeating it inside the task explanation.
    text = re.sub(r"\bA defensible output is\b", "Output:", text, flags=re.I)
    text = re.sub(r"\bOutput should\b", "Output:", text, flags=re.I)
    text = re.sub(r"\bOutput (?:includes|may include|may be|should include|is|could be)\b", "Output:", text, flags=re.I)
    text = re.sub(r"\bA research output(?: could be| is| may be)?\b", "Output:", text, flags=re.I)
    text = re.sub(r";\s*output\s+", "; Output: ", text, flags=re.I)
    text = re.sub(r"\bA (?:D078|Social Sciences) output could only\b", "Output:", text, flags=re.I)
    return text


def _role_task_sections(value: Any, role_name: str | None = None) -> tuple[str, str]:
    """Return separate learner-facing task/use and deliverable explanations."""
    text = _role_task_copy(value, role_name)
    marker = re.search(r"\bOutput(?:,\s*if evidenced later)?:\s*", text, flags=re.I)
    if not marker:
        # Some reviewed records state a clear conditional use followed by an
        # explicit deliverable verb instead of an "Output:" label. Split only
        # this unambiguous grammatical form; otherwise do not infer a product.
        action = re.search(
            r"(?:,\s*|;\s*|\s+and\s+)(assemble|prepare|produce|create|write|draft|compile|develop|generate)\s+(?:a|an|the)\s+",
            text,
            flags=re.I,
        )
        if not action:
            output_only = re.match(
                r"^(?:produce|prepare|write|draft|assemble|create|compile|develop|generate)\s+(?:a|an|the)\s+([^,.;]+)",
                text,
                flags=re.I,
            )
            if output_only:
                product = re.split(r"\b(?:that|which|for|to|with)\b", output_only.group(1), maxsplit=1, flags=re.I)[0].strip()
                output = text[0].upper() + text[1:]
                return (
                    f"Use this when an assignment calls for preparing a {product}; adapt the work to the question and the recipient's stated requirements.",
                    output,
                )
            return text, ""
        task = text[:action.start()].rstrip(" ,.;:")
        product = text[action.end():].strip(" \t\r\n.;:")
        output = ("A " if text[action.start():action.end()].casefold().endswith(" a ") else "An ") + product
        return task, output
    task = text[:marker.start()].strip(" \t\r\n.;:")
    output = text[marker.end():].strip(" \t\r\n.;:")
    return task, output


@lru_cache(maxsize=1)
def _d078_role_area_names() -> dict[str, list[str]]:
    graph = _read(ROLE_GRAPH_PATH)
    nodes = {node.get("id"): node for node in graph.get("nodes", [])}
    output: dict[str, list[str]] = {}
    for edge in graph.get("edges", []):
        if edge.get("relationship") != "area_to_role":
            continue
        area = nodes.get(edge.get("source")) or {}
        role = nodes.get(edge.get("target")) or {}
        role_key = re.sub(r"\s+", " ", str(role.get("label") or "").strip()).casefold()
        area_name = str(area.get("label") or "").strip()
        if role_key and area_name and area_name not in output.setdefault(role_key, []):
            output[role_key].append(area_name)
    return output


@lru_cache(maxsize=1)
def _d078_area_names() -> dict[str, str]:
    graph = _read(ROLE_GRAPH_PATH)
    return {
        str(node.get("area_id")): str(node.get("label") or "").strip()
        for node in graph.get("nodes", [])
        if node.get("kind") == "area_of_specialization" and node.get("area_id")
    }


def _d078_area_name(area_id: str) -> str | None:
    return _d078_area_names().get(area_id)


_AREA_ITEM_MEANING_EXPLANATIONS = {
    "D078:computational-digital-social-science:networkx-or-gephi": "NetworkX is a Python library for representing and analysing networks; Gephi is a visual program for exploring and presenting them. A network is a set of entities (such as people or organisations) and the relationships defined between them. These tools help inspect a network after the researcher has decided what counts as a connection; a graph or centrality score does not prove why a relationship exists.",
    "D078-ECON-APPLIED-ECONOMETRICS": "Econometrics uses statistical methods to examine economic questions with observed data. For example, an analyst might estimate how an outcome varies with prices or income while checking what else could explain the pattern. The estimate depends on the data, model and assumptions; a relationship in the data does not automatically prove that one factor caused another.",
    "ECON-K1": "Economic concepts describe choices, production, prices, work, income and how resources are distributed. An indicator is a defined measure—such as an employment rate—that can summarise part of a larger idea. Before comparing indicators, check how each is counted, its population and time period, and what it leaves out.",
    "D078:human-geography-population:spatial-concepts-and-place": "Place is the setting where people and activities are located; scale is the level or size at which a question is examined, such as a neighbourhood, city or country. Where people or services are located can change what a social pattern means. State the geographic unit and why it fits before interpreting a map or spatial statistic.",
    "D078:human-geography-population:qgis-spatial-tool": "QGIS is free, open-source geographic information system software. It can display and analyse data linked to locations—for example, comparing service locations with settlement boundaries—when the data and question support that comparison. The learner still needs to check map boundaries, coordinate systems, source coverage and privacy; a map does not explain a pattern by itself.",
    "D078:human-geography-population:population-measures": "Population measures describe how many people are in a group and how its size or composition changes through births, deaths and movement. A rate compares a count with a defined population and period, so its denominator and dates matter. These measures help describe demographic patterns but do not, by themselves, explain why those patterns occurred.",
    "D078-A03-skill-policy-brief-writing": "A policy brief is a short document written to help a named decision-maker understand an issue and consider what to do. It separates the evidence from interpretation and recommendation, compares relevant options, and makes uncertainty or missing information visible. A brief can inform a decision, but it does not replace the decision-maker's authority or prove that one option will work.",
    "D078-HG-TOOL-GEODA": "GeoDa is a desktop program for exploring data tied to places. Its spatial-autocorrelation methods check whether similar measured values cluster across neighbouring areas; that describes a pattern, not what caused it.",
    "D078-HG-TOOL-GEOPANDAS": "GeoPandas is a Python library for joining data tables to geographic map features and working with vector layers such as points, lines and boundaries. It helps make these preparation steps repeatable before mapping or further analysis.",
    "D078-HG-TOOL-ARCGIS-SPATIAL-ANALYST": "ArcGIS Spatial Analyst is a licensed extension for ArcGIS Pro that adds analysis tools for raster data (values stored in grid cells) and geographic features such as points or boundaries. It is useful only when the task needs those operations and suitable licence access is available.",
    "D078-A03-knowledge-institutions-policy": "Knowledge of public institutions means understanding which bodies and officials can make, carry out or oversee public decisions, and which people or groups are affected. It helps explain how a policy moves from a decision to implementation; it does not assume every institution has the same powers.",
    "D078-A04-TOOL-LIMESURVEY": "LimeSurvey is a platform for creating, distributing and managing online questionnaires. It can record answers and apply planned question paths, but the researcher must still decide whether the questions, sample and consent process fit the study.",
    "D078-A04-TOOL-PSYTOOLKIT": "PsyToolkit provides psychology-focused experiment and questionnaire examples that can help a learner understand how a task or survey is put together. An example is a starting point to assess and adapt, not proof that a measure is suitable for every group or setting.",
    "D078-A04-TOOL-PSYCHOPY": "PsychoPy is software for building behavioural experiments that present planned material—such as words, images or sounds—and record participants’ responses and, where configured, timing. The researcher must define the question and check that the task measures what it is intended to measure.",
    "D078-A04-TOOL-OPENSESAME": "OpenSesame is a visual experiment builder for arranging what a participant sees or hears, the choices they can make and the responses the study records. It can help create a repeatable behavioural task, but a working experiment does not by itself make the measure valid.",
    "D078-HG-TOOL-PYSAL-ESDA": "PySAL's esda package contains methods for checking whether values or related characteristics cluster across places. The result depends on how areas and neighbouring relationships are defined; a detected cluster describes a spatial pattern, not its cause.",
}


_DOMAIN_ITEM_DISPLAY_OVERRIDES = {
    "focus_groups_and_workshops": {
        "contextual_use": "Use a focus group when the question benefits from participants responding to one another, not only giving separate individual accounts. Plan how to moderate the discussion and later distinguish a participant's own view from ideas shaped or challenged by the group.",
    },
    "archival_and_historical_research": {
        "contextual_use": "Use records or archives when a social question needs evidence about earlier people, institutions or events. Record where each source came from and what is missing, because surviving documents reflect what was created and preserved rather than every person's experience.",
    },
    "programme_evaluation_and_theory_of_change": {
        "contextual_use": "Use evaluation to examine how a programme is expected to lead to change and what evidence shows about its delivery and results. Consider who experienced the programme, the conditions around it and other possible explanations before attributing an outcome to the intervention.",
    },
    "reference_and_literature_management": {
        "contextual_use": "Use a source-management workflow while developing a research question, reviewing existing work or preparing a report. Keep citations, notes and source links connected to the claims they support so another reader can trace the evidence and you can avoid losing or misattributing it.",
    },
    "r_statistical_computing": {
        "contextual_use": "Choose R when a project needs a repeatable way to prepare data, carry out a justified statistical procedure or create a figure. Learn it as one implementation option after the research question and method are clear; the language does not supply the social-science reasoning for you.",
    },
    "d078_python": {
        "contextual_use": "Use Python when a task benefits from repeatable instructions for preparing or analysing data, working with text or networks, or running a defined simulation. Choose the relevant method and data first, then use code to carry out and document those steps; Python itself is not a research method.",
    },
    "d078_statsmodels": {
        "contextual_use": "Use statsmodels after a research question and statistical design justify a model that the library supports. It can calculate estimates and diagnostics for that model, but you must check its assumptions, explain the result and avoid treating a statistical association as proof of cause.",
    },
    "d078_jupyter": {
        "contextual_use": "Use Jupyter when it helps you keep code, explanatory notes and results together as you work through a computational task. Include source and software details so someone can inspect the steps; the notebook format does not itself guarantee valid analysis or reproducibility.",
    },
    "reliability_validity_and_uncertainty": {
        "contextual_use": "When reviewing a study, compare how information was gathered with the question it claims to answer. Reliability asks whether the process gives reasonably consistent results; validity asks whether it measures the intended idea. Then consider bias and uncertainty that could change the conclusion.",
    },
    "pilot_and_cognitive_pretesting": {
        "contextual_use": "Before a main study, ask a small number of people similar to the intended participants to try draft questions and explain how they understood them. Notice confusing wording, missing answer choices, timing or practical problems, then revise and record why. A pilot can reveal problems, but it cannot by itself prove that a measure is valid or representative.",
    },
    "discourse_and_conversation_analysis": {
        "contextual_use": "When studying speech, writing or interaction, examine how word choice, turn-taking, framing and setting shape meaning or relationships. For example, compare how speakers describe the same issue in an interview and a public statement. Interpret selected material in context; wording alone does not prove a speaker's private intention.",
    },
    "participatory_and_action_research": {
        "contextual_use": "In participatory or action research, people affected by an issue help shape parts of the inquiry rather than only supplying information. Agree who can influence the question, methods, interpretation and action, and how disagreement or consent will be handled. Participation should be meaningful, but it does not remove the need for ethical review or careful evidence.",
    },
    "experiments_quasi_experiments_and_causal_inference": {
        "contextual_use": "To ask whether a programme or event contributed to an outcome, compare what happened with a defensible estimate of what might have happened without it. A randomized experiment assigns access by chance; a quasi-experiment uses a comparison created by real-world conditions and must defend its assumptions. State other possible explanations, because a before-and-after change alone does not establish cause.",
    },
    "psychometrics_and_scale_construction": {
        "contextual_use": "When a social or behavioural idea—such as trust or wellbeing—cannot be observed directly, define it and develop questions or indicators that could represent it. Test whether people understand the items, whether results are consistent, and whether evidence supports the intended interpretation for the group studied. A reliable score is not automatically a valid measure for every population.",
    },
    "stata_quantitative_social_science_workflow": {
        "contextual_use": "Use Stata when a quantitative study needs a repeatable workflow for preparing data, running a justified analysis and producing tables or charts. For example, a survey analysis may document how variables were checked before a model was fitted. The research question and statistical reasoning must guide the commands; software output does not select a sound method or explain results by itself.",
    },
}


_AREA_ITEM_DISPLAY_OVERRIDES = {
    "D078:computational-digital-social-science:reproducible-data-cleaning": {
        "contextual_use": "Use this when a social-science dataset needs corrections or transformations before analysis. Keep a record of what changed and why, so another person can understand the cleaned file rather than treating it as untouched original data.",
    },
    "D078:computational-digital-social-science:r-social-data-workflow": {
        "contextual_use": "Choose R when the task needs a repeatable workflow for preparing, analysing or graphing social data. It is one possible route alongside other suitable tools; choose it because it fits the task, not because every learner in this area must learn R.",
    },
    "D078:computational-digital-social-science:jupyter-reproducible-environment": {
        "contextual_use": "Use a notebook when it helps you place code, explanation and results in one inspectable record. Include the data source and software details; a notebook alone does not make an analysis correct or automatically repeatable.",
    },
    "D078:computational-digital-social-science:interpretable-statistical-modeling": {
        "contextual_use": "Consider a statistical model only after the question, measures and data have been checked. Then explain the model's assumptions and diagnostics in ordinary language, because software output cannot decide whether a model is suitable or prove a cause.",
    },
    "D078:computational-digital-social-science:content-analysis-and-text-classification": {
        "contextual_use": "Use computational text analysis when a defined set of writing or online material can help answer a social question. Explain how the material was selected, check machine or coding results against human-reviewed examples, and report errors so a label is not mistaken for a person's full meaning.",
    },
    "D078:computational-digital-social-science:networkx-or-gephi": {
        "contextual_use": "Choose NetworkX for a code-based analysis workflow or Gephi for interactive visual exploration when that fits the defined network task. First decide what counts as an entity and a relationship; neither tool can establish that the network is complete or explain why a tie exists.",
    },
    "D078-ECON-APPLIED-ECONOMETRICS": {
        "contextual_use": "Use this route when a defined economic question calls for estimating a relationship in observed data. Set out the measure and model, inspect assumptions and alternative explanations, and report uncertainty; an estimated association is not automatically a causal effect.",
    },
    "D078:human-geography-population:population-measures": {
        "contextual_use": "Use population measures when a question concerns the size, composition or change of a defined population. Name the denominator and reference period before comparing counts or rates, because different definitions can make apparently similar figures incomparable.",
    },
    "D078-A03-tool-rayyan-screening": {
        "contextual_use": "Use Rayyan to organise references and screening decisions for a planned evidence review. The review team must first define its question and inclusion rules, then check disagreements and full texts; the software does not decide whether a study is reliable or relevant.",
    },
    "D078-A04-skill-group-pattern-interpretation": {
        "contextual_use": "Use this when describing a pattern observed across a group. State who was studied, show uncertainty and differences within the group, and avoid turning an average or common response into a claim about every individual.",
    },
    "D078:social-research-evaluation:sampling-and-measurement": {
        "contextual_use": "Use sampling and measurement decisions when planning who or what to observe and how a concept will be recorded. Explain how participants or cases were chosen and what the measure means, so readers can judge which population the evidence may represent.",
    },
    "D078:social-research-evaluation:kobo-electronic-collection": {
        "contextual_use": "Use KoboToolbox or a suitable alternative to collect answers after the questionnaire, sample, consent and data-protection plan are settled. Test the form and its skip rules first; the platform records responses but does not make a weak question or sample sound.",
    },
    "D078:social-research-evaluation:evaluation-design-and-evidence": {
        "contextual_use": "Begin an evaluation by identifying who will use the findings and what decision or learning question they need answered. Match the design and evidence to that purpose, then state what the evaluation cannot determine with the available data.",
    },
    "D078:social-research-evaluation:stakeholder-use-and-reporting": {
        "contextual_use": "Use this when findings need to inform a programme, service or policy decision. Present the evidence, uncertainty and recommendation separately, and make the recommended next step practical without implying that the evidence guarantees a result.",
    },
    "D078:social-research-evaluation:quantitative-analysis-choice": {
        "contextual_use": "Choose quantitative analysis when the question, measures and data support a numerical comparison or estimate. Check the design and assumptions before selecting a procedure; a qualitative or descriptive approach may be more suitable, and the learner can continue without this optional route.",
    },
    "D078-SOC-QUESTION-DESIGN": {
        "contextual_use": "Use this when a broad concern about society needs to become a studyable question. Name the group and setting, clarify what you want to understand, and decide what evidence could answer it before choosing a method.",
        "expected_output": "A short research-design brief with a bounded question, population/setting, evidence plan, reason for the method choice and important limits.",
    },
    "D078-SOC-THEORY-CONTEXT": {
        "contextual_use": "Use a sociological concept to explain a pattern, not just to label it. Compare plausible explanations and ask what evidence would support or challenge each one.",
        "expected_output": "A concept-to-evidence note that defines the concept, applies it to a specific pattern, compares another explanation and identifies evidence that could change the interpretation.",
    },
    "D078:computational-digital-social-science:digital-trace-construct-and-sampling": {
        "contextual_use": "Before analysing online posts or other digital traces, define the social idea being studied and identify which platform, people and time period the material covers. Platform data reflect who could use the service and what its collection rules make visible, so describe those limits instead of treating the material as a neutral sample of society.",
    },
    "D078:social-research-evaluation:spss-quantitative-tool": {
        "contextual_use": "Use SPSS when a defined survey or evaluation question calls for a quantitative procedure that the software supports. First check how the variables were measured and whether the procedure's assumptions fit; SPSS can calculate the requested result, but it cannot choose the right research question or make an unsupported interpretation valid.",
    },
    "D078-ECON-APPLIED-ECONOMETRICS": {
        "expected_output": "An analysis note naming the question and estimand, model, assumptions and diagnostics, sensitivity checks, estimates with uncertainty, and the population or setting the result can address.",
    },
    "D078-ECON-CAUSAL-ML": {
        "expected_output": "A methods record stating the causal question and identification strategy, why the machine-learning procedure fits, how cross-fitting or other required steps were done, key diagnostics and robustness checks, uncertainty, and limits.",
    },
    "D078-ECON-AGENT-BASED-MODELING": {
        "expected_output": "A small executable model with agent rules and starting conditions recorded, repeated scenario results, selected measures, sensitivity checks, and a clear statement that the simulation is not itself a forecast or causal estimate.",
    },
    "D078-ECON-CASEVO-LLM-SIM": {
        "expected_output": "A small, reproducible model experiment recording the research question, prompts and model/version, run settings and costs, baseline and sensitivity comparisons, observed outputs, and why simulated agents must not be treated as human evidence.",
    },
    "D078-A34-A03-method-ria": {
        "expected_output": "An options/RIA matrix stating the problem and objectives, alternatives, affected groups, likely costs and benefits, consultation, delivery arrangements, monitoring plan, and evidence gaps.",
    },
    "D078-A34-A03-competency-options-impact-analysis": {
        "expected_output": "A comparison table covering the status quo and feasible regulatory or non-regulatory choices, affected groups, expected effects, implementation constraints, assumptions, evidence quality, and uncertainty.",
    },
    "D078-A34-A03-knowledge-regulatory-policy-cycle": {
        "expected_output": "A process map showing the decision stage, responsible institutions, affected groups, implementation or enforcement steps, and points for monitoring and later review.",
    },
    "D078-A34-A03-method-participation-design": {
        "expected_output": "A participation plan naming the open decision, who can contribute, accessible information and methods, facilitation, how input will be analysed, the response promised, and follow-up.",
    },
    "D078-A34-A03-competency-inclusion-response-accountability": {
        "expected_output": "An inclusion-and-response log linking participant groups and access supports to the input received, the official response, follow-up action, and any unresolved issue.",
    },
    "D078-A34-A03-method-community-scorecard": {
        "expected_output": "A community scorecard and action matrix recording community observations, provider responses, agreed actions, who is responsible, and when progress will be checked.",
    },
    "D078-A34-A03-skill-public-evidence-tracking": {
        "expected_output": "A dated tracker linking each public commitment to its source, indicator, observed documentary or community evidence, response, and unresolved question; a discrepancy is a prompt to investigate, not proof of misconduct.",
    },
    "D078-A34-A03-tool-budget-imonitor": {
        "expected_output": "A project-feedback entry or review note identifying the relevant project, the portal instructions followed, the observation or discrepancy reported, and what remains unverified.",
    },
    "D078-A34-A04-method-conflict-analysis": {
        "expected_output": "A dated context analysis naming actors and conflict drivers, peace-supporting factors, evidence confidence, possible programme-interaction risks, and questions to monitor as the situation changes.",
    },
    "D078-A34-A04-competency-conflict-sensitivity": {
        "expected_output": "A risk-and-response note connecting an evidenced context dynamic to a programme choice, a feasible mitigation, the responsible person or organisation, and a monitoring trigger.",
    },
    "D078-A34-A04-method-behavioural-insights-cycle": {
        "expected_output": "A behaviour-change plan defining the behaviour, evidence about its barriers and enablers, the proposed response, delivery steps, and how feasibility, acceptability and effects will be evaluated.",
    },
    "D078-A34-A04-competency-contextual-intervention-evaluation": {
        "expected_output": "An evaluation note separating implementation evidence from outcome evidence, describing who and what context were covered, uncertainty and design limits, and the evidence behind an adapt, continue or stop decision.",
    },
    "D078-SOC-ETHICS-REFLEXIVITY": {
        "contextual_use": "Before and during social inquiry, plan how people will be invited, what risks or privacy concerns may arise, how information will be handled and how the researcher’s position may affect access or interpretation.",
        "expected_output": "An ethics and data-handling plan covering participation/consent, confidentiality, risk response, recording, storage, access and a reflexive note about the researcher’s influence.",
    },
    "D078-SOC-ETHNOGRAPHIC-FIELDWORK": {
        "contextual_use": "Use participant observation to understand practices in their everyday setting. Record what happened, what people said and what you infer as separate kinds of notes, while respecting consent, safety and privacy.",
        "expected_output": "Dated field notes with setting and activity details, separated observation/quotation/interpretation, and a short evidence-based account of a practice with context and limits.",
    },
    "D078-SOC-INTERVIEW-FOCUSGROUP": {
        "contextual_use": "Choose an interview or group discussion when people’s accounts and the way views are expressed can answer the research question. Prepare open questions, obtain consent, protect participants and preserve enough context to interpret the responses.",
        "expected_output": "A topic guide and a de-identified interview/focus-group record with consent/context notes, transcript or field notes, and a brief explanation of how the material will be analysed.",
    },
    "D078-SOC-KOBO-SURVEY-FIELD": {
        "contextual_use": "Use KoboToolbox/KoboCollect or a suitable alternative to administer a questionnaire that has already been designed and approved. Check the form on the device, follow consent and data-protection arrangements, and export responses for quality checks.",
        "expected_output": "A tested digital form, a field/consent log and an exported dataset with variable labels and a note describing collection dates, missing responses and any corrections.",
    },
    "D078-SOC-THEMATIC-ANALYSIS": {
        "contextual_use": "Organise qualitative material into clearly defined codes, revise them when the evidence requires it, compare cases and look for examples that challenge an emerging interpretation. Keep a trace of why coding decisions changed.",
        "expected_output": "An auditable codebook and theme/evidence matrix with code definitions, supporting excerpts, contrasting or disconfirming cases and notes explaining analytic decisions.",
    },
    "D078-SOC-CAQDAS-TAGUETTE-NVIVO": {
        "contextual_use": "Use a computer-assisted qualitative-analysis program such as Taguette or NVivo to organise source material, apply a researcher-defined code structure, find coded passages and keep project notes. The software stores and retrieves analysis; it does not decide what a passage means.",
        "expected_output": "A documented project containing imported sources, code definitions, coded excerpts, analytic memos and an export that links interpretations back to the original material.",
    },
    "D078-SOC-LLM-ASSISTED-CODING": {
        "contextual_use": "For a bounded pilot, compare an AI model’s suggested codes or retrieved passages with human decisions on the same material. Check errors and uneven performance, protect sensitive text and keep the final interpretation under researcher control.",
        "expected_output": "A pilot-validation table showing sampled passages, human and model decisions, agreement/disagreement, error patterns, data safeguards and the researcher’s final interpretation.",
    },
    "D078-SOC-SECONDARY-QUAL-ANALYSIS": {
        "contextual_use": "Before reusing interviews or other qualitative material collected by someone else, inspect the catalogue, original question, sample, field setting, consent/access terms and what context has been retained. Limit new claims to what the existing material can support.",
        "expected_output": "A bounded re-analysis note documenting dataset provenance, original purpose/sample, selected cases, access/consent limits, analytic changes and conclusions the material cannot support.",
    },
    "D078-SOC-DOCUMENT-ANALYSIS": {
        "contextual_use": "Set rules for which documents or media belong in the study, record who created them and for whom, then analyse their content or meaning in context. Keep a trace from each interpretation to the source passage.",
        "expected_output": "A corpus register and analysis table listing selection rules, source/creator/purpose, coded or interpreted passages, claims drawn and relevant omissions or limits.",
    },
    "D078-SOC-SURVEY-DESIGN": {
        "contextual_use": "Plan who should be asked and how each concept will be measured before collecting survey answers. Draft clear questions, test how intended respondents understand them, and record likely sampling and response errors.",
        "expected_output": "A survey-design pack with target population, sampling approach, measure definitions, draft questionnaire, pretest findings, revisions and known sources of error.",
    },
    "D078-SOC-SURVEY-ANALYSIS-R": {
        "contextual_use": "Read the survey documentation before analysing responses: identify the correct variables, weights, sample design and population. Use R or another documented method to calculate estimates and uncertainty that respect that design.",
        "expected_output": "A reproducible script/notebook and results note naming the survey release, variables, weights/design, population, estimates, uncertainty and scope limitations.",
    },
    "D078-SOC-AI-SURVEY-QUESTION-DRAFTING": {
        "contextual_use": "AI may suggest alternative wording for a survey question, but subject and language reviewers must check whether it measures the intended idea and communicates respectfully. Then test the wording with people like the intended respondents and revise from what they say.",
        "expected_output": "A question-revision record with intended concept, prompt/model/version, AI suggestions accepted or rejected, reviewer comments, cognitive-pretest findings and final wording rationale.",
    },
    "D078-SOC-DIGITAL-TRACE-ETHICS": {
        "contextual_use": "Before studying online activity, establish how the platform created and filtered the traces, what users and period are represented, and what permissions or expectations apply. Assess privacy and consent risks; public visibility alone does not make research reuse automatically appropriate.",
        "expected_output": "A data-source and ethics log naming platform, collection period, inclusion/exclusion, access terms, population/coverage gaps, personal-data risks and consent/permission decisions.",
    },
    "D078-SOC-SOCIAL-NETWORK-ANALYSIS": {
        "contextual_use": "Use social network analysis when the question concerns relationships among people, groups or organisations. Define what counts as a node and a tie before calculating measures, and explain how missing or private relationships could change the picture.",
        "expected_output": "A documented node/edge dataset, tie definition, justified network measures and a readable graph or table with coverage, privacy and interpretation cautions.",
    },
    "D078-SOC-QUANT-TEXT-R": {
        "contextual_use": "Use R with quanteda or a suitable Python library when a defined question needs consistent comparison across many texts. Document how the text was collected, cleaned and tokenised, and check automated measures against examples a person can inspect.",
        "expected_output": "A reproducible corpus workflow with source metadata, inclusion/exclusion rules, preprocessing decisions, checked measures and a labelled analysis table or plot with limitations.",
    },
    "D078-SOC-LLM-SYNTHETIC-PILOT": {
        "contextual_use": "Synthetic respondents are model-generated answers, not interviews or evidence from real people. They may help explore question wording or test a workflow, but any useful insight must be checked later with real participants or an appropriate established pretest.",
        "expected_output": "A clearly labelled pilot record with prompts, model/version, generated examples, variation and failure cases, wording or workflow changes, and the real-person testing still needed.",
    },
    "SOC-C2": {
        "contextual_use": "When interpreting interviews, observations, documents or model-assisted analysis, show how the evidence led to the interpretation, consider another plausible explanation and keep a record of important analytic choices.",
        "expected_output": "A short analytic memo linking claims to evidence, recording an alternative explanation and key decisions, and naming what remains uncertain.",
    },
    "SOC-T1": {
        "contextual_use": "Use Python or R for a text task only when the research question and corpus justify computation—for example, applying a documented classification or extracting named entities from many records. Check the process on examples and retain source context.",
        "expected_output": "A runnable text-analysis script/notebook with corpus description, preprocessing and model/package notes, checked examples, results and limits on what the output represents.",
    },
    "SOC-S1": {
        "contextual_use": "Prepare a collection of documents or digital traces by recording where each text came from, removing or protecting identifying details where needed, and applying consistent cleaning and coding rules. Check whether the collection represents the group or discussion you want to describe.",
        "expected_output": "A documented corpus with source metadata, inclusion and cleaning rules, privacy decisions, quality checks and a brief coverage note describing whose text is missing or overrepresented.",
    },
    "SOC-A1": {
        "contextual_use": "An AI system may make a first-pass suggestion for sorting or labelling social-research text. Compare its suggestions with human-reviewed examples, check for group or language differences and errors, and keep interpretation with the researcher.",
        "expected_output": "A validation log showing the sampled text, human reference labels, model suggestions, errors by relevant group/language, corrections and the decision about whether the tool is suitable for this task.",
    },
    "SOC-C3": {
        "contextual_use": "For AI-assisted coding, summaries or source discovery, check claims against original material, document the model and version, protect restricted information and disclose assistance. Do not let an unverified generated summary become a research finding.",
        "expected_output": "An audit trail linking AI-assisted claims to source passages, recording reviewer decisions and corrections, model/version, uncertainty, privacy actions and disclosure.",
    },
    "SOC-M3": {
        "contextual_use": "Use agent-based modelling to explore what follows from specified rules about how different actors behave and interact. Compare scenarios and assumptions; a simulation can show what a model produces, not predict how real people must behave.",
        "expected_output": "A documented model with agent types, rules, environment, assumptions, run settings, collected indicators, scenario comparisons and a clear statement of what the simulation cannot establish.",
    },
    "SOC-A2": {
        "contextual_use": "For a clearly hypothetical social question, use Casevo to explore how changing agent rules, memory settings or network connections changes a simulated pattern. Treat the result as a test of model assumptions—not a finding about real people—and document the AI service and access limits.",
        "expected_output": "For learning, a reproducible simulation record naming the hypothetical question, agent rules, model/version, network assumptions, scenarios, outputs and sensitivity checks, clearly labelled as simulated rather than real-world evidence.",
    },
    "SOC-M4": {
        "contextual_use": "AI can suggest survey-item wording or translations, but reviewers must check the intended concept, local language meaning and potential bias. Cognitive interviews with people from the intended group then reveal how respondents understand and answer the question.",
        "expected_output": "A translation and pretest record with source wording, AI/model/version, reviewer decisions, respondent comprehension findings, revisions and remaining meaning differences.",
    },
    "SOC-C4": {
        "contextual_use": "Before a large survey, ask a small number of intended respondents to explain how they understood a question, recalled information and chose an answer. Use their response process to identify confusing or culturally mismatched wording; this does not establish population representativeness.",
        "expected_output": "A cognitive-pretest report with tested wording, respondent group, comprehension/recall/response issues, translation comparisons, revisions and issues requiring a larger pilot.",
    },
    "D078-ECON-ECONOMIC-REASONING": {
        "contextual_use": "For an economic question, trace how a change in policy, prices or market conditions could alter people’s or organisations’ choices. State whose decisions are affected, what must be assumed, and which other explanations could fit the same pattern.",
        "expected_output": "A short analytical framework naming the change, affected decision-makers, proposed mechanism, expected outcome, key assumptions and at least one competing explanation.",
    },
    "D078-ECON-MEASUREMENT": {
        "contextual_use": "Before comparing an economic figure, check what it counts, its unit and time period, the population or sector covered, price basis, weighting and later revisions. These checks help prevent a chart from comparing unlike measures.",
        "expected_output": "A data note identifying the indicator, source, unit, period, population, price basis, weighting or revision status, and the main limit on comparison.",
    },
    "D078-ECON-UNCERTAINTY-COMMUNICATION": {
        "contextual_use": "When presenting an economic estimate or pattern, distinguish the observed figure from your interpretation, assumptions and any recommendation. Match the strength of the wording to the quality and uncertainty of the evidence.",
        "expected_output": "A concise chart note or brief that labels the observation, estimate and interpretation separately, states assumptions and uncertainty, and avoids unsupported recommendations.",
    },
    "D078-ECON-R-PYTHON-ANALYSIS": {
        "contextual_use": "Use R or Python when a defined economic question needs repeatable data preparation, calculation or visualisation. Keep the source file and analysis steps clear so another person can see how the reported figure was produced.",
        "expected_output": "A runnable script or notebook that identifies its input data, records the preparation and calculation steps, produces the stated table or chart, and notes software/package versions and limits.",
    },
    "D078-ECON-REPRODUCIBLE-RESEARCH": {
        "contextual_use": "Keep the files and decisions needed to inspect or repeat an economic analysis: where data came from, what each variable means, how code changed it, which software was used, and what access restrictions apply.",
        "expected_output": "A reproducibility folder with source log, data dictionary, versioned code, software/environment record, README and any required privacy or access instructions.",
    },
    "D078-ECON-CAUSAL-EVALUATION": {
        "contextual_use": "To assess whether a policy or programme contributed to a change, define who or what received it, the outcome, unit and time period, then select a defensible comparison. Examine whether the design assumptions hold and report uncertainty and competing explanations.",
        "expected_output": "An evaluation protocol naming the intervention, outcome, population, comparison strategy, assumptions, implementation checks, threats to inference and planned uncertainty reporting.",
    },
    "D078-ECON-LLM-EVIDENCE-SYNTHESIS": {
        "contextual_use": "An AI text tool may help find or organise economic studies, but it can invent citations or misstate results. Check every included study against its original record and relevant text before using it in an argument.",
        "expected_output": "A human-checked evidence table with search log, verified citation, study design, population, finding, caveats and a locator to the source passage supporting each entry.",
    },
    "D078-ECON-FORECASTING-UNCERTAINTY": {
        "contextual_use": "For a specified economic measure, state what is being forecast and for how far ahead, which data vintage and baseline are used, and what assumptions the model makes. Compare the forecast with later observations to assess error rather than presenting a projection as fact.",
        "expected_output": "A forecast note showing target, horizon, data vintage, baseline, model assumptions, scenario range and a later comparison of forecast errors and uncertainty.",
    },
    "D078-ECON-ALTERNATIVE-DATA-NOWCAST": {
        "contextual_use": "A timely signal such as online activity may help estimate a current economic measure before official data are released. Compare it with a clearly defined official target, test it on periods or places not used to build it, and disclose coverage gaps and revisions.",
        "expected_output": "A validation report comparing the signal with the official target, documenting data coverage, test periods/places, errors, revisions and why the result is an experimental estimate—not official statistics.",
    },
    "D078-ECON-DISTRIBUTIONAL-ANALYSIS": {
        "contextual_use": "To study who gains or loses, choose a defensible measure of welfare and define the population. Compare the distribution across groups or time, explain uncertainty, and state what the chosen measure leaves out.",
        "expected_output": "A distributional note or chart naming the welfare measure, population, comparison groups and period, indicator definitions, uncertainty and one important limitation.",
    },
    "D078-ECON-NIGERIA-MICRODATA": {
        "contextual_use": "When analysing Nigerian survey or macroeconomic data, identify the exact release and study period, document variables and survey weights, and follow the provider’s access terms. Interpret results in light of how the data were collected.",
        "expected_output": "A reproducible analysis note with the dataset/study identifier, period, variables, weight or methodology choices, source/access record and a bounded descriptive result.",
    },
    "D078-ECON-NATIONAL-ACCOUNTS-MEASUREMENT": {
        "contextual_use": "When using GDP or a sector indicator, check the source, classification version, coverage and revisions. Explain what the measure includes and excludes before comparing periods or sectors.",
        "expected_output": "A comparison table or note citing the national-accounts source and classification vintage, defining the measure and period, and explaining coverage and revision limits.",
    },
    "D078-ECON-LABOUR-STATISTICS": {
        "contextual_use": "Before comparing employment or other labour outcomes, check the reference period, age and population scope, definitions, survey design, weights and which statistical standard was applied. A change in definition can alter the comparison even when the underlying situation has not changed.",
        "expected_output": "A caveated labour-market table or brief that records the source, population, period, definitions, survey/weighting basis and limits on comparing the results.",
    },
    "D078-ECON-PUBLIC-FINANCE-STATISTICS": {
        "contextual_use": "When reading a fiscal table, identify which level of government it covers, whether figures are cash or accrual, the classification and period. Then explain what the indicator can show about public finance and what it cannot establish by itself.",
        "expected_output": "A fiscal-indicator note naming source, government coverage, accounting basis, classification and period, with a bounded interpretation and at least one coverage limitation.",
    },
    "ECON-A1": {
        "contextual_use": "AI or machine-learning methods can turn text or other unstructured material into a measurable variable for an economic analysis. Define the economic concept first, compare generated values with trustworthy human-checked examples, and examine error across relevant groups and periods.",
        "expected_output": "A measure-validation record defining the construct, documenting the model/data process, comparing generated values with checked examples, reporting subgroup or period errors, and stating whether the measure is fit for the named analysis.",
    },
    "ECON-C2": {
        "contextual_use": "Before using a generated economic measure in an estimate, check its source, construction, missingness and error against an independent reference. Repeat the downstream estimate with plausible alternatives to see whether the conclusion changes.",
        "expected_output": "A validation and reproducibility note with reference checks, error results, data/code versions, sensitivity comparisons and a decision about the measure’s limits for the named estimate.",
    },
    "ECON-A2": {
        "contextual_use": "Generative AI may assist a bounded support step such as drafting search terms or organising notes. The researcher must verify factual claims and calculations against source material and must not treat fluent text as economic evidence.",
        "expected_output": "A short audit record naming the support task, AI output used or rejected, source checks, corrections and remaining uncertainty, alongside the researcher-authored analysis.",
    },
    "ECON-C3": {
        "contextual_use": "When AI assists with finding, summarising or analysing economic sources, independently check important claims and calculations, record which model/version was used, protect restricted data and disclose the assistance where required.",
        "expected_output": "An AI-use and verification log linking each material claim to checked sources, recording repeated calculations, corrections, unresolved uncertainty and disclosure/privacy actions.",
    },
    "ECON-K1": {
        "expected_output": "For practice, prepare a short indicator note that defines one measure, its unit or denominator and time period, explains how it is collected, and names one important limitation.",
    },
    "ECON-S1": {
        "contextual_use": "Use descriptive analysis to show what the available economic data contain before trying to explain or forecast a pattern. State the source, population, units and period, and check missing values; a table or chart describes the recorded data, not necessarily the whole economy.",
        "expected_output": "For practice, prepare a small descriptive table or chart that names its source, population, units and period, notes missing data, and briefly explains one visible pattern.",
    },
    "ECON-C1": {
        "expected_output": "For practice, write an evidence note stating the claim, comparison, assumptions and uncertainty, then explain what conclusion the result can—and cannot—support.",
    },
    "SOC-M1": {
        "contextual_use": "In Sociology, use planned interviews, observation or document study to understand how people describe and experience relationships, institutions and everyday practices. Preserve the setting and participants’ meaning, follow consent and privacy safeguards, and compare themes with counterexamples rather than treating one account as everyone’s experience.",
        "expected_output": "For practice, prepare a short fieldwork record with the research question, method, setting, consent approach and de-identified notes, followed by a few evidence-linked themes or observations and their limits.",
    },
    "SOC-T2": {
        "expected_output": "For practice, produce an executable Mesa project with the agents and environment defined, interaction rules recorded, run settings saved, selected indicators collected, and scenario results explained alongside assumptions and limitations.",
    },
}


def _area_item_meaning(item_key: str, value: Any) -> str | None:
    return _AREA_ITEM_MEANING_EXPLANATIONS.get(item_key) or _explanation(value)


_ROLE_TOOL_MEANING_EXPLANATIONS = {
    "microsoft excel": "Microsoft Excel is spreadsheet software: information is arranged in rows and columns, where formulas can calculate values and charts can summarise them. It can help organise or check a small analysis, but the learner must verify formulas, units and missing values; a spreadsheet does not decide whether the data or conclusion is sound.",
    "gephi": "Gephi is software for exploring and drawing networks, which represent entities as points (nodes) and their connections as lines (edges). Its layouts and filters can help reveal possible clusters or central connections, but a visual pattern does not prove why a connection exists or whether the network includes everyone relevant.",
    "zotero": "Zotero is reference-management software for collecting publication details, grouping sources, saving notes and inserting citations into writing. It helps keep a research trail organised, but imported details can be wrong and a citation does not confirm that a source supports the claim.",
    "transkribus": "Transkribus uses handwriting-recognition technology to help turn scanned historical documents into searchable text. It can speed up transcription and discovery, but handwriting, language and image quality affect accuracy, so people must check important passages against the original image.",
    "opensesame": "OpenSesame is software for building behavioural experiments by arranging the material a participant sees or hears, the choices or actions requested, and the responses recorded. It can make a task repeatable, but the researcher still needs a suitable measure, ethical procedure and checks that the task works as intended.",
}


def _role_tool_plain_meaning(name: Any, value: Any) -> str:
    return _ROLE_TOOL_MEANING_EXPLANATIONS.get(str(name or "").strip().casefold(), str(value or "").strip())


_ROLE_ITEM_MEANING_EXPLANATIONS = {
    "ESCO-SKILL-ab0bc977-8b71-48f7-bfcc-a8f92ec03e34": "Genealogy means researching a family's history and relationships. A genealogist builds a family tree or narrative by comparing records, interviews and other sources, while distinguishing documented facts from claims that still need checking. A family connection should not be treated as certain when records conflict or are incomplete.",
    "ESCO-SKILL-77e1563f-84fb-48dd-98f2-59a4e33908ca": "Cadastral taxation concerns taxes connected to land or property records that identify parcels, boundaries or ownership. In tax-policy analysis, this can help explain how property is classified or assessed under a particular jurisdiction's rules. It is not a universal tax formula, and a policy analyst should not present it as a parcel valuation or legal advice.",
    "ESCO-SKILL-19bf4fdc-c0aa-40c5-b531-35ed408067a8": "Psychological research is a planned study of thoughts, feelings or behaviour using evidence suited to a specific question. Depending on the study, this may involve experiments, surveys, interviews or existing records, with appropriate ethics review and participant safeguards. The task description alone does not specify a method or authorize work with vulnerable people.",
    "ESCO-SKILL-397c14d5-42e0-4c85-8376-4c70b5a90bcf": "Conservation techniques are ways trained practitioners stabilise, protect or document objects and materials so they are less likely to deteriorate. For archaeological work, the appropriate treatment depends on the material, condition and context; handling or chemical treatment can cause damage if done incorrectly. Learners should recognise and document a conservation need, then work under qualified supervision rather than attempt unsupervised treatment.",
    "ESCO-SKILL-387ee646-0aaa-4161-ab3b-cde87ec09fdf": "Public finance studies how governments raise and spend public money, and how those choices affect services, households and the economy. An economic adviser can use it to analyze a defined fiscal-policy question; it does not by itself determine which policy choice is best.",
    "ESCO-SKILL-2839f191-cd94-49a9-ac16-46018066b8b2": "Liaising with local authorities means maintaining communication and exchanging relevant information with regional or local government offices. The exact contact depends on the assignment; it does not mean the learner represents the authority or can make decisions for it.",
    "ESCO-SKILL-6a536b36-c5c7-4d10-bf67-a4fb0f8549b2": "Audit techniques are ways to check records or operations against stated rules or criteria. In tax-policy work, understanding published audit or compliance findings may help explain how a rule is applied; this does not authorize someone to conduct or sign an audit.",
    "ESCO-SKILL-3c35dfa4-6dae-45a5-ae0a-f6a45923a95f": "In statistics, biometrics can mean applying statistical methods to biological or health data. It is different from biometric identification, which uses traits such as fingerprints or faces to recognize a person.",
    "ESCO-SKILL-ff258a7e-b2ba-414a-9878-2380ecf89de0": "A pedigree chart is a diagram used to show biological inheritance across generations. Reading it is different from tracing family relationships through documents or oral histories; it is relevant only when a specific project involves genetics and appropriate consent, privacy safeguards and qualified review.",
    "ESCO-SKILL-a07a5d41-add0-4d0f-ad01-718d39554be8": "Applied zoology uses biological knowledge to study or address practical questions about animals. It is different from studying human behaviour; a social or behavioural researcher would consider it only for a specific interdisciplinary study involving animals or human–animal interaction.",
    "ESCO-SKILL-4bc7fcff-54a5-4ff0-8f5e-a7c2479b522c": "Political campaigning is the organized work of communicating with the public and trying to build support for a candidate, party, policy or issue. On a political-science route, it can be examined through campaign plans, public messages, events and how people respond; this does not mean the learner is being instructed to persuade voters.",
    "ESCO-SKILL-c33dd5ae-ae72-49d7-8dcf-8bc72e59fe78": "Civil law concerns rules for private relationships and disputes, such as contracts, property and obligations; it is distinct from criminal law. In economic-adviser work, the useful task is to recognize when an issue has legal consequences and frame the economic question, not to give legal advice.",
    "ESCO-SKILL-b011c8b4-76e1-4bbc-8bb9-1d205e7b618a": "Market analysis studies a defined product or service in a particular place and period: who supplies it, who may demand it, what alternatives exist, and what rules affect it. For an economic adviser, it supports a bounded market diagnostic; it does not by itself forecast outcomes or recommend an investment.",
    "ESCO-SKILL-918f5211-b99f-4b29-9a34-6e475583ef55": "A work-related report organizes a question, evidence, findings and limitations so another person can understand and check the work. In genealogy, it should distinguish what a record says, what a person recalls and what the researcher infers.",
    "ESCO-SKILL-2be39143-3cf8-4b02-af8f-99e3dfb2fc24": "Reviewing a manuscript means examining how clearly a draft communicates, supports its claims and fits its intended readers, then suggesting specific revisions. In genealogy, edits should improve clarity and sourcing without turning uncertain evidence into a stronger historical claim.",
    "ESCO-SKILL-d63c2bad-817d-4116-b4d8-b927cb01212d": "Commercial law covers legal rules for business transactions, firms and exchanges. For an economist, it matters when explaining how a rule may affect costs, incentives or market structure; legal interpretation belongs to qualified counsel.",
    "ESCO-SKILL-0aa02c52-077d-45f8-8c2d-7132c11ac16e": "Strategic research gathers and compares evidence about longer-term choices before an organization decides what to prioritize or change. For an economic-development coordinator, this can mean combining local indicators and stakeholder evidence into options, while stating uncertainty rather than presenting a proposal as a proven result.",
    "ESCO-SKILL-2ff405ec-f59c-4a7b-84b6-9776a49582c4": "Bookkeeping regulations are rules for recording and reporting financial transactions. In tax-policy work, they help an analyst consider how a proposal could change record-keeping or compliance demands; the analyst describes the policy question rather than giving legal or accounting advice.",
    # Definitions below keep the card's "What it is" distinct from the
    # role-specific action shown under "How it is used". They clarify existing
    # approved items; they do not add or change role ownership or eligibility.
    "ESCO-SKILL-09529105-30ab-4b92-b394-18a8607a57c8": "Osteology is the study of bones. In archaeological and anthropological research, bone evidence may help answer questions about past or present lives, but interpretation depends on the remains' context, suitable expertise, permissions and careful handling.",
    "ESCO-SKILL-330772b3-288c-41b9-a5f3-157f71bc938d": "Palaeography (also spelled paleography) is the study and interpretation of historical handwriting. It helps a researcher read older documents and consider their script and context; an uncertain reading should be recorded as uncertain rather than silently guessed.",
    "ESCO-SKILL-4e097377-7950-4993-9e22-a61b067b5c00": "The social sciences are fields that study people, relationships, groups, institutions and societies. They offer concepts for framing a social question; they are not one research method and do not replace evidence suited to the question.",
    "ESCO-SKILL-dbdd03ec-f64f-4916-8a86-cc71d765cc20": "Legislative acts are laws enacted by a legislature. Understanding one means locating the authoritative text, identifying provisions relevant to a defined question and checking the jurisdiction and current status; interpreting legal rights or obligations is a matter for qualified legal professionals.",
    "ESCO-SKILL-1063b061-329e-4212-8db4-ab936dc60efc": "Environmental economics studies how economic choices interact with the natural environment. It can examine incentives, costs, benefits and who bears them, while making clear that some ecological, cultural or long-term values may be difficult to measure in money.",
    "ESCO-SKILL-880c54f9-866e-4f37-b5fa-25ef8a7f49b6": "Accounting techniques are procedures for recording, organizing and summarizing financial information. In policy analysis, understanding them can help identify how a rule affects records or reporting; it does not qualify a learner to audit accounts or give accounting advice.",
    "ESCO-SKILL-f75b740c-b36c-495e-bc67-efe347bbc6b5": "Company policies are an organization's written rules or procedures for particular decisions and activities. Their meaning depends on the named organization and the current policy text, so the label alone does not identify a universal tax-policy task.",
    "ESCO-SKILL-77931759-69af-4637-8b26-c8376f9240e2": "International business concerns business activity across national borders, such as trade, sourcing, investment or operations in more than one country. Any analysis should name the countries and period because rules, markets and institutions differ across jurisdictions.",
    "ESCO-SKILL-7f18039d-dfae-471b-9daa-507f6b2d2842": "Urban planning is the coordinated consideration of how land, housing, services, transport and infrastructure develop in a place. Research can assess plans or population needs, but it does not itself authorize someone to approve or prepare a statutory plan.",
    "ESCO-SKILL-27a87847-f6cc-4e49-af0b-3d17da351af6": "Advising legislators means helping a lawmaking body or its members understand a defined issue and the evidence, options and trade-offs relevant to a decision. It is distinct from lobbying, making the decision, or giving legal advice.",
}

# Contextual-use copy for the short, task-derived role descriptions identified
# in the 2026-10-17 learner-copy audit. These explain when and how a task is
# used; the separate role/area sections explain why it appears on that route.
_ROLE_TASK_CONTEXTUAL_USE_EXPLANATIONS = {
    "estimate a future financial or economic quantity from stated data and assumptions": "Use a forecast to explore a defined quantity over a stated period, such as a budget total or market measure. Set out the baseline and assumptions, compare plausible scenarios, and describe uncertainty; a forecast is an estimate, not a promise about what will happen.",
    "prepare and conduct an ethical, question-led conversation to gather relevant accounts": "Choose an interview when the question needs people to explain an experience, decision or point of view in their own words. Prepare open questions, obtain appropriate consent, protect private information and interpret the account in context; one interview does not represent everyone affected.",
    "understand how public/private decisions allocate activities and infrastructure across places and scales": "Use this when a question concerns where homes, services, jobs or infrastructure are placed and who can access them. Compare the relevant places and decision levels, while distinguishing research about planning from the legal authority to approve a statutory plan.",
    "study relationships among specified people, organisations or other social units": "Use network analysis when the question is about connections among defined people, organisations or other units. Explain what counts as a connection and who is included; a network diagram can show recorded ties but cannot prove why they exist or that every relevant tie was captured.",
    "use mathematical methods to describe data and quantify uncertainty appropriate to a question": "Use statistical methods when suitable numerical evidence can answer the defined question. Check how the measures were created and which assumptions apply, then report uncertainty and limits so a calculation is not mistaken for a complete explanation.",
    "analyse how public revenue, spending, debt and budget institutions affect objectives/distribution": "Use public-finance analysis to examine how a specified government raises, allocates or accounts for money and how those choices relate to services or groups. Name the jurisdiction, period and accounting basis; the analysis can compare consequences but does not by itself decide which policy is best.",
    "assess a defined policy's problem framing, options, evidence, implementation and likely effects": "Use policy analysis to examine a clearly stated public problem and compare feasible responses. Identify who may be affected, what evidence supports each option, how delivery could work and what remains uncertain; an analysis informs a decision but does not replace the responsible authority.",
    "collect or obtain evidence using a method suited to a question and population": "Gather evidence only after deciding what information the question needs and whose experience or records are relevant. Record the source, selection method, permissions and quality checks so later readers can judge what the material can support and what it leaves out.",
    "compare feasible decisions using explicit economic consequences and trade-offs": "Use economic criteria to compare options by their likely costs, benefits, incentives and distributional effects. State the assumptions and whose outcomes matter; this makes trade-offs visible but does not turn a value judgement into a purely technical answer.",
    "compare religious traditions, institutions, texts or lived practices as a research subject": "Use this for a bounded study of religious texts, institutions or lived practice, using sources appropriate to the question. Attribute interpretations carefully and distinguish participants' accounts from the researcher's analysis; comparison should not assume that all members share one view.",
    "compare specified financial/market indicators over a defined period": "Use a trend comparison to describe how selected market or financial measures changed across a stated period. Define each measure and its units, identify the source and benchmark, and consider other explanations before interpreting a change as a market cause or forecast.",
    "explain the reasoning that connects a research question, assumptions, evidence and methods": "Use research methodology to explain why a particular method and evidence source fit the question. Make important assumptions and alternatives visible, then state what the chosen design cannot establish; naming a method alone does not show that the design is sound.",
    "formulate a proposed economic policy from a defined problem, evidence and public objective": "Use this when turning an evidenced economic problem and a stated public objective into policy options. Explain who may be affected, the delivery authority, costs, risks and monitoring measures; presenting a proposal does not mean it has been adopted or will achieve its intended result.",
    "measure/record spatial positions or features using a defined procedure": "Use surveying to record locations or physical features with a method and instrument suited to the required accuracy. Document the coordinate reference, calibration and legal scope; a measurement should not be treated as an official boundary or survey unless it meets the applicable professional requirements.",
    "read or interpret sanskrit-language material only where a defined source/task requires it": "Consider this only when a specific source relevant to the inquiry is written in Sanskrit. Check readings and translations with appropriate language expertise and cite the text; this is not a general requirement for archaeology or social-science study.",
    "represent a defined scientific process or system with explicit variables, assumptions and relationships": "Use a model to make a proposed process or set of relationships explicit enough to examine. State what is included, what is assumed and how the model is checked; a model simplifies reality and its output is not direct observation of the real system.",
    "represent economic choices/relationships with mathematical structures and derive implications under stated assumptions": "Use mathematical economics when a question benefits from expressing choices or economic relationships with equations or a formal model. Explain the assumptions and what follows from them in plain language; a result is conditional on the model, not a description of every real-world case.",
    "select and apply an analysis procedure justified by question, design, data and assumptions": "Choose an analysis procedure only after checking that it fits the question, study design and available data. Document the steps, assumptions and uncertainty, and explain the result substantively; applying a procedure correctly cannot repair unsuitable data or design.",
    "set a longer-term direction and translate goals into priorities, choices, measures and review": "Use strategic planning to turn an organisation's stated goal into priorities, actions and ways to review progress over time. Record the baseline, assumptions, responsibilities and trade-offs; a plan is a proposal to guide action, not evidence that the planned results will occur.",
    "study past human lives through material remains and their contexts": "Use archaeological evidence when the question concerns past human activity and material remains. Interpret an object together with its location, layer and associations, because removing or separating finds can destroy context; fieldwork requires permission and competent supervision.",
    "use numeric data and suitable quantitative procedures to answer a bounded question": "Use quantitative analysis when the question can be answered with defined numerical measures and an appropriate design. Check the population, missing data and assumptions, then report uncertainty and interpretation limits; a numerical result is not automatically representative or causal.",
    "carry out calculations that implement or check a mathematical/economic analysis": "Use calculations to implement or check a clearly defined economic or mathematical step. Show the formula, units and assumptions, then explain what the result means for the question; an unexplained number is not an economic conclusion.",
    "clarify a decision-maker's problem, examine processes/evidence and compare requirements/options": "Use business analysis to clarify the decision that needs to be made, examine the current process and evidence, and compare possible requirements or changes. Record whose needs were considered and the assumptions behind a recommendation; analysis does not itself authorize implementation.",
    "contextualize political institutions, authority or collective decision-making in a bounded inquiry": "Use political concepts to examine a defined institution, authority relationship or collective decision. Identify the jurisdiction and actors, then support the interpretation with sources; describing political processes is different from exercising political authority or campaigning.",
    "examine media institutions, forms, texts, audiences and social effects in context": "Use media studies to examine a specific media institution, text, audience or communication setting. State what material and audience evidence were considered, and avoid claiming a social effect that the study design cannot demonstrate.",
    "identify legal constraints relevant to a particular media activity and jurisdiction": "Use this to identify which legal rules may affect a specific media activity in a named jurisdiction. Cite the relevant source and flag issues for qualified counsel; this learning does not make the learner a lawyer or authorize legal advice.",
    "institutions and arrangements through which financial assets are issued/traded and capital/risk is allocated": "Use financial-market knowledge to describe a specified asset, the participants and arrangements involved, and how capital or risk may move between them. Identify the country, regulator and period; this is contextual analysis, not personal investment advice or a prediction of returns.",
    "specify, test and document a computational procedure for a bounded statistical task": "Use an algorithm as a clear, ordered procedure for a limited computational task. Describe its inputs and steps, test it on suitable examples and document assumptions; a working procedure does not prove that the underlying statistical question or method is appropriate.",
    "study communication processes, messages, media, audiences and effects in context": "Use communication studies to examine how a message moves through a channel, reaches an audience and is interpreted in a particular setting. Identify the evidence for each part of that process; a message or audience response alone does not prove a wider social effect.",
    "systematically expose, record and recover archaeological deposits while documenting location, stratigraphy and context": "Use excavation only when a justified archaeological question requires controlled recovery of material from a site. Record each find's location and layer before removal, because excavation permanently changes the site; work requires permits, a documented plan and appropriate supervision.",
    "trace family relationships and life events through records, interviews and other evidence": "Use genealogy to build a documented account of family relationships or life events from records and interviews. Compare sources, cite where each claim came from and mark uncertainty or conflict rather than filling gaps with assumptions; protect living people's privacy.",
    "use political concepts/theory to analyse a defined institution, behaviour or process": "Use political-science ideas to interpret a specific institution, behaviour or process, such as how a decision is made or authority is exercised. Define the case and concepts, support claims with evidence and distinguish analysis from advocacy or political activity.",
    "use spatially referenced site/context/find data to document distributions or relationships": "Use geographic information systems when a question needs locations or mapped layers to be compared. Check coordinate systems, boundary dates, source coverage and access restrictions before interpreting a pattern; spatial proximity alone does not explain a social relationship or cause.",
}

# Existing item/task records sometimes contain the same sentence in both the
# definition and use fields. These route-specific explanations make the second
# section answer a different learner question without changing the underlying
# task records, route ownership, requirement lane, or evidence disposition.
_ROLE_ITEM_USE_EXPLANATIONS = {
    ("anthropologist", "ESCO-SKILL-09529105-30ab-4b92-b394-18a8607a57c8"): "In an anthropological inquiry, this may help examine skeletal evidence as part of a wider account of human life. Record where the material came from, what was observed and what remains uncertain; work with human remains requires appropriate permissions, expertise and ethical care.",
    ("archaeologist", "ESCO-SKILL-09529105-30ab-4b92-b394-18a8607a57c8"): "On an archaeology route, bone evidence is interpreted alongside its location, layer and association with other finds. Document context before drawing conclusions, because removal or disturbance can destroy information; specialist identification should be done with suitable training and permission.",
    ("anthropologist", "ESCO-SKILL-330772b3-288c-41b9-a5f3-157f71bc938d"): "An anthropologist may use palaeography when a study depends on historical handwritten records. Transcribe what can be read, mark uncertain words and explain how the document's date and setting affect interpretation; handwriting alone cannot establish that every statement in a record is true.",
    ("archaeologist", "ESCO-SKILL-330772b3-288c-41b9-a5f3-157f71bc938d"): "An archaeologist may use palaeography when historical documents help interpret a site, object or period. Compare the transcription with the original image and relevant context, and flag uncertain readings; a document is one kind of evidence, not a substitute for archaeological context.",
    ("genealogist", "ESCO-SKILL-4e097377-7950-4993-9e22-a61b067b5c00"): "A genealogist can use relevant social-science ideas to place a family's documented history within its social setting—for example, relationships, institutions or community change. Name the concepts being used and keep interpretation separate from what the records directly establish.",
    ("thanatology researcher", "ESCO-SKILL-4e097377-7950-4993-9e22-a61b067b5c00"): "A thanatology researcher can use social-science concepts to frame a bounded question about how people or communities understand death, dying, bereavement or related institutions. Choose evidence that fits the question and do not treat one person's account as representative of every community.",
    ("economic development coordinator", "ESCO-SKILL-dbdd03ec-f64f-4916-8a86-cc71d765cc20"): "For a defined development activity, identify the current enacted law that may affect implementation, summarize only the relevant provisions and note which agency appears responsible. Refer questions about legal meaning or obligations to qualified counsel; this is not authority to interpret or approve the law.",
    ("economist", "ESCO-SKILL-1063b061-329e-4212-8db4-ab936dc60efc"): "An economist may use this lens to compare how a defined policy or economic activity changes incentives, resource use, costs and effects on different groups. State the valuation assumptions and what is not captured, especially where ecological effects cannot be reduced to a monetary estimate.",
    ("tax policy analyst", "ESCO-SKILL-880c54f9-866e-4f37-b5fa-25ef8f7d49b6"): "A tax-policy analyst may examine whether a proposed rule changes the records, classifications or reporting steps that taxpayers or organizations must follow. Describe the policy implication and compliance burden; do not present this as performing an audit or certifying accounts.",
    ("tax policy analyst", "ESCO-SKILL-f75b740c-b36c-495e-bc67-efe347bbc6b5"): "Use this only if a specific organization's current policy is relevant to the tax question being examined. The reviewed item does not name a company or policy, so first identify the actual document and decision; do not treat generic company-policy knowledge as a standard tax-policy duty.",
    ("economic adviser", "ESCO-SKILL-f75b740c-b36c-495e-bc67-efe347bbc6b5"): "Use this only when the economic question depends on a named organization's current policy—for example, a rule shaping a particular business decision. This record does not identify that policy, so confirm the document and its scope before treating it as relevant; it is not a general adviser duty.",
    ("tax policy analyst", "ESCO-SKILL-77931759-69af-4637-8b26-c8376f9240e2"): "A tax-policy analyst may need this context when a defined proposal affects cross-border trade, sourcing or operations. Separate firm-level effects from sector- or country-level claims and name the jurisdictions involved; different tax rules cannot be assumed to apply everywhere.",
    ("business economics researcher", "ESCO-SKILL-77931759-69af-4637-8b26-c8376f9240e2"): "A business economics researcher may use this when a study concerns a firm's or sector's cross-border trade, sourcing or market conditions. Keep firm, sector and country evidence distinct, and state the countries and period; it is not a general requirement for every business-economics question.",
    ("economic policy officer", "ESCO-SKILL-77931759-69af-4637-8b26-c8376f9240e2"): "An economic policy officer may use this context when a policy question concerns trade or business activity across borders. Identify the countries, sector and policy mechanism, then distinguish the evidence about firms from broader national effects; cross-border context is relevant only when the issue calls for it.",
    ("economic adviser", "ESCO-SKILL-f75b740c-b36c-495e-bc67-efe347bbc6b5"): "Use this only when the economic question depends on a named organization's current policy—for example, a rule shaping a particular business decision. This record does not identify that policy, so confirm the document and its scope before treating it as relevant; it is not a general adviser duty.",
    ("economic adviser", "ESCO-SKILL-1063b061-329e-4212-8db4-ab936dc60efc"): "An economic adviser may use environmental-economics reasoning when a decision involves effects on natural resources or environmental quality. Compare relevant costs, benefits and who bears them, explain what cannot be priced reliably, and present the analysis as evidence for a decision rather than the decision itself.",
    ("demographer", "ESCO-SKILL-7f18039d-dfae-471b-9daa-507f6b2d2842"): "A demographer may contribute population evidence to a planning question—for example, how population size, age structure or change relates to demand for housing or services in a defined place. Treat this as evidence for planners and decision-makers, not authority to make statutory plans.",
    ("geographer", "ESCO-SKILL-7f18039d-dfae-471b-9daa-507f6b2d2842"): "A geographer may examine how land use, services, transport or infrastructure are arranged across places, and how access differs between groups or locations. State the place and scale being compared; research can inform planning but does not grant planning approval authority.",
    ("economic policy officer", "ESCO-SKILL-27a87847-f6cc-4e49-af0b-3d17da351af6"): "For a defined legislative question, prepare a balanced briefing that makes the issue, evidence quality, policy options, likely effects and uncertainty understandable to the intended decision-makers. The officer informs deliberation; legislators retain the decision, and legal interpretation belongs to counsel.",
}

# The canonical item identity is taken from the source URI; a few legacy source
# records disagree with the flattened runtime key. Keep learner-copy overrides
# addressable by the displayed label as well, while still scoping the use text
# to its role. These are explanations of existing records, not new items.
_ROLE_ITEM_MEANING_BY_LABEL = {
    "osteology": _ROLE_ITEM_MEANING_EXPLANATIONS["ESCO-SKILL-09529105-30ab-4b92-b394-18a8607a57c8"],
    "paleography": _ROLE_ITEM_MEANING_EXPLANATIONS["ESCO-SKILL-330772b3-288c-41b9-a5f3-157f71bc938d"],
    "palaeography": _ROLE_ITEM_MEANING_EXPLANATIONS["ESCO-SKILL-330772b3-288c-41b9-a5f3-157f71bc938d"],
    "social sciences": _ROLE_ITEM_MEANING_EXPLANATIONS["ESCO-SKILL-4e097377-7950-4993-9e22-a61b067b5c00"],
    "advise on legislative acts": _ROLE_ITEM_MEANING_EXPLANATIONS["ESCO-SKILL-dbdd03ec-f64f-4916-8a86-cc71d765cc20"],
    "environmental economics": _ROLE_ITEM_MEANING_EXPLANATIONS["ESCO-SKILL-1063b061-329e-4212-8db4-ab936dc60efc"],
    "accounting techniques": _ROLE_ITEM_MEANING_EXPLANATIONS["ESCO-SKILL-880c54f9-866e-4f37-b5fa-25ef8a7f49b6"],
    "company policies": _ROLE_ITEM_MEANING_EXPLANATIONS["ESCO-SKILL-f75b740c-b36c-495e-bc67-efe347bbc6b5"],
    "international business": _ROLE_ITEM_MEANING_EXPLANATIONS["ESCO-SKILL-77931759-69af-4637-8b26-c8376f9240e2"],
    "urban planning": _ROLE_ITEM_MEANING_EXPLANATIONS["ESCO-SKILL-7f18039d-dfae-471b-9daa-507f6b2d2842"],
    "advise legislators": _ROLE_ITEM_MEANING_EXPLANATIONS["ESCO-SKILL-27a87847-f6cc-4e49-af0b-3d17da351af6"],
}

_ROLE_ITEM_USE_BY_LABEL = {
    ("anthropologist", "osteology"): "In an anthropological inquiry, this may help examine skeletal evidence as part of a wider account of human life. Record where the material came from, what was observed and what remains uncertain; work with human remains requires appropriate permissions, expertise and ethical care.",
    ("archaeologist", "osteology"): "On an archaeology route, bone evidence is interpreted alongside its location, layer and association with other finds. Document context before drawing conclusions, because removal or disturbance can destroy information; specialist identification should be done with suitable training and permission.",
    ("anthropologist", "paleography"): "An anthropologist may use palaeography when a study depends on historical handwritten records. Transcribe what can be read, mark uncertain words and explain how the document's date and setting affect interpretation; handwriting alone cannot establish that every statement in a record is true.",
    ("archaeologist", "paleography"): "An archaeologist may use palaeography when historical documents help interpret a site, object or period. Compare the transcription with the original image and relevant context, and flag uncertain readings; a document is one kind of evidence, not a substitute for archaeological context.",
    ("genealogist", "social sciences"): "A genealogist can use relevant social-science ideas to place a family's documented history within its social setting—for example, relationships, institutions or community change. Name the concepts being used and keep interpretation separate from what the records directly establish.",
    ("thanatology researcher", "social sciences"): "A thanatology researcher can use social-science concepts to frame a bounded question about how people or communities understand death, dying, bereavement or related institutions. Choose evidence that fits the question and do not treat one person's account as representative of every community.",
    ("economic development coordinator", "advise on legislative acts"): "For a defined development activity, identify the current enacted law that may affect implementation, summarize only the relevant provisions and note which agency appears responsible. Refer questions about legal meaning or obligations to qualified counsel; this is not authority to interpret or approve the law.",
    ("economist", "environmental economics"): "An economist may use this lens to compare how a defined policy or economic activity changes incentives, resource use, costs and effects on different groups. State the valuation assumptions and what is not captured, especially where ecological effects cannot be reduced to a monetary estimate.",
    ("economic adviser", "environmental economics"): "An economic adviser may use environmental-economics reasoning when a decision involves effects on natural resources or environmental quality. Compare relevant costs, benefits and who bears them, explain what cannot be priced reliably, and present the analysis as evidence for a decision rather than the decision itself.",
    ("tax policy analyst", "accounting techniques"): "A tax-policy analyst may examine whether a proposed rule changes the records, classifications or reporting steps that taxpayers or organizations must follow. Describe the policy implication and compliance burden; do not present this as performing an audit or certifying accounts.",
    ("tax policy analyst", "company policies"): "Use this only if a specific organization's current policy is relevant to the tax question being examined. The reviewed item does not name a company or policy, so first identify the actual document and decision; do not treat generic company-policy knowledge as a standard tax-policy duty.",
    ("economic adviser", "company policies"): "Use this only when the economic question depends on a named organization's current policy—for example, a rule shaping a particular business decision. This record does not identify that policy, so confirm the document and its scope before treating it as relevant; it is not a general adviser duty.",
    ("tax policy analyst", "international business"): "A tax-policy analyst may need this context when a defined proposal affects cross-border trade, sourcing or operations. Separate firm-level effects from sector- or country-level claims and name the jurisdictions involved; different tax rules cannot be assumed to apply everywhere.",
    ("business economics researcher", "international business"): "A business economics researcher may use this when a study concerns a firm's or sector's cross-border trade, sourcing or market conditions. Keep firm, sector and country evidence distinct, and state the countries and period; it is not a general requirement for every business-economics question.",
    ("economic policy officer", "international business"): "An economic policy officer may use this context when a policy question concerns trade or business activity across borders. Identify the countries, sector and policy mechanism, then distinguish the evidence about firms from broader national effects; cross-border context is relevant only when the issue calls for it.",
    ("economic adviser", "international business"): "An economic adviser may use this context when a defined decision concerns cross-border trade, sourcing or business operations. Identify the countries and decision at issue, and separate firm-level evidence from wider market claims; it is not a general requirement for every advice task.",
    ("demographer", "urban planning"): "A demographer may contribute population evidence to a planning question—for example, how population size, age structure or change relates to demand for housing or services in a defined place. Treat this as evidence for planners and decision-makers, not authority to make statutory plans.",
    ("geographer", "urban planning"): "A geographer may examine how land use, services, transport or infrastructure are arranged across places, and how access differs between groups or locations. State the place and scale being compared; research can inform planning but does not grant planning approval authority.",
    ("economic policy officer", "advise legislators"): "For a defined legislative question, prepare a balanced briefing that makes the issue, evidence quality, policy options, likely effects and uncertainty understandable to the intended decision-makers. The officer informs deliberation; legislators retain the decision, and legal interpretation belongs to counsel.",
}

# Keep this learner-facing wording ASCII-safe; source citations remain intact.
_ROLE_ITEM_MEANING_EXPLANATIONS["ESCO-SKILL-a07a5d41-add0-4d0f-ad01-718d39554be8"] = (
    "Applied zoology uses biological knowledge to study or address practical questions about animals. "
    "It is different from studying human behaviour; a social or behavioural researcher would consider it "
    "only for a specific interdisciplinary study involving animals or human-animal interaction."
)


def _role_item_plain_meaning(value: Any, item_key: str | None = None, item_name: str | None = None) -> str:
    """Keep learner definitions free of source-URI and audit-label prefixes.

    Provenance remains available in source references and locators; it should
    not be concatenated into the sentence a student is trying to understand.
    """
    meaning = re.sub(r"\s+", " ", str(value or "")).strip()
    meaning = re.sub(r"^ESCO(?:\s+skill)?\s+URI\s+https?://[^;]+;\s*", "", meaning, flags=re.IGNORECASE)
    meaning = re.sub(r"^(?:saved\s+)?definition\s*:\s*", "", meaning, flags=re.IGNORECASE)
    meaning = re.sub(r"^In professional terms, this item concerns\s+", "", meaning, flags=re.IGNORECASE)
    return (
        _ROLE_ITEM_MEANING_EXPLANATIONS.get(str(item_key or ""))
        or _ROLE_ITEM_MEANING_BY_LABEL.get(str(item_name or "").strip().casefold())
        or (_role_tool_plain_meaning(item_name, meaning.strip()) if item_name else meaning.strip())
    )


def _sanitize_student_narrative_fields(item: dict[str, Any]) -> dict[str, Any]:
    """Remove internal domain codes and broken replacement characters from learner prose."""
    fields = (
        "plainMeaning", "contextualUse", "expectedOutput", "programmeContext",
        "domainContext", "areaContext", "roleContext", "requirementReason",
    )
    for field in fields:
        value = item.get(field)
        if not isinstance(value, str):
            continue
        value = re.sub(r"\bD078\b", "Social Sciences", value, flags=re.I)
        value = re.sub(r"\bD064\s+(?=clinical/professional psychology)", "", value, flags=re.I)
        value = re.sub(r"\bD064\b", "clinical/professional psychology", value, flags=re.I)
        value = value.replace("\u00e2\u20ac\u2122", "'")
        value = value.replace("\u00e2\u20ac\u201c", '"').replace("\u00e2\u20ac\u201d", '"')
        value = value.replace("\u00e2\u20ac\u2013", "-").replace("\u00e2\u20ac\u2014", "-")
        value = value.replace("\ufffd", "")
        value = re.sub(r"Social Sciences-appropriate", "Social Sciences", value, flags=re.I)
        item[field] = re.sub(r"[ \t]+", " ", value).strip()
    # Relationship notes are part of the learner explanation, not an internal
    # audit shorthand.  Expand the small legacy notes at the final student
    # payload boundary so every domain, area and role card gets the same
    # understandable meaning without mutating the reviewed source contract.
    relationship_explanations = {
        "Choose according to question/evidence; not cumulative.":
            "Choose the approach that fits the question and the evidence you can obtain. It is a route choice, not a step that every learner must add to the same path.",
        "Different evidence needs; not a sequence.":
            "These approaches answer different kinds of questions and use different kinds of evidence. Choosing one does not mean the other is a later compulsory step.",
        "Mixed methods only when justified by the question/design.":
            "You can combine approaches when the question genuinely needs both kinds of evidence. Explain what each contributes instead of combining them simply to make the project look more complete.",
        "Not cumulative.":
            "This is an alternative route, not an additional compulsory stage. Choose it when its type of evidence fits the question and the people or material being studied.",
        "Combine only when justified.":
            "A combined approach can be useful when each method answers a different part of the question. It should be planned and explained; learners can continue with one suitable approach when that is enough.",
        "Choose based on the question; combination must be justified.":
            "Choose the method that can answer the question with the available evidence. Combining methods is optional and should be explained by what the second method adds.",
        "Different evidence source; may complement other methods.":
            "This route uses a different kind of source from interviews, surveys or observation. It may strengthen another method when the sources answer related parts of the question, but it is not automatically required.",
        "Choose by question and evidence, not prestige.":
            "Choose a computational approach only when the question and available digital material make it useful. A newer or more technical method is not automatically better than a simpler method that fits the evidence.",
        "Only when place is analytically relevant.":
            "Use this relationship when location, distance or place changes what the question means. If place is not part of the question, another route may be more suitable.",
        "Alternatives are choices, not cumulative requirements.":
            "These are different implementation choices for carrying out a justified analysis. Selecting one does not require learning every alternative, and the software cannot replace the reasoning behind the method.",
        "Tool choice follows method and project constraints.":
            "Choose the tool after deciding what information must be collected and how it will be analysed. The tool can support the planned work, but it cannot fix weak questions, sampling, consent or interpretation.",
        "No need to adopt a tool for small/simple tasks.":
            "A specialised tool may help with a large or complex collection of material. For a small or simple task, a clear manual process may be enough, so the tool remains optional.",
        "Only for relationship/network questions.":
            "Use this when the question is about connections among people, groups or organisations. It is not a general analysis step for every social-science project.",
        "Matplotlib is a Python package.":
            "Matplotlib works inside a Python workflow to turn checked data into charts. Learn it after the data and comparison are defined; the package does not decide whether the chart is accurate or meaningful.",
        "Select a method based on audience, data and reproducibility.":
            "Choose the visualisation method that suits the data, the people who will read it and whether the work needs to be repeated. A polished chart is not evidence that the underlying data or conclusion is correct.",
        "Measures need quality checks before they are interpreted.":
            "Before interpreting a measure, check whether it is consistent and whether it represents the idea you intended to study. These checks help reveal uncertainty or bias; they do not make a weak design representative by themselves.",
        "Piloting helps improve how ideas are measured.":
            "A pilot lets you test whether questions or measures are understandable before the main study. It can reveal problems to fix, but it cannot by itself prove validity or represent the wider population.",
        "Transcripts or notes still need a documented analytic approach.":
            "A group discussion can produce useful accounts and interactional evidence. The notes or transcript still need a clear analytic approach so the final interpretation can be traced to what participants actually said.",
        "Items need suitable pretesting before wider use.":
            "Scales and questionnaires should be tested with people like the intended respondents before wider use. Pretesting can expose unclear items, but it does not by itself establish reliability, validity or representativeness.",
        "R is one conditional quantitative-computing route among alternatives.":
            "R is one possible way to carry out a justified quantitative analysis. Use it when its packages and workflow fit the question, data and learner's needs; another suitable tool may be better for a different route.",
        "pandas handles tabular-data operations inside a Python workflow.":
            "pandas helps Python users organise, join and transform table-shaped data before analysis. It supports preparation, but the learner still has to check definitions, missing values and whether the data answer the question.",
        "The library runs inside Python.":
            "This library is used within a Python workflow rather than replacing Python itself. Learn the relevant programming and statistical ideas first, then use the library to carry out a method whose assumptions you understand.",
        "pandas can prepare labelled tabular data before modelling.":
            "pandas can help prepare labelled tables and metadata before a model is run. That preparation does not prove the model is suitable, so the question, variables, assumptions and diagnostics still need separate review.",
        "Software equivalence must be checked method by method.":
            "Different packages may support similar procedures, but their defaults, data handling and diagnostics can differ. Compare the actual method and assumptions rather than assuming that one software result is interchangeable with another.",
    }
    for relationship in item.get("relationships") or []:
        if not isinstance(relationship, dict):
            continue
        note = relationship.get("learnerExplanation")
        if isinstance(note, str) and note in relationship_explanations:
            relationship["learnerExplanation"] = relationship_explanations[note]
        # A few reviewed contracts contain a useful but very short note that
        # is specific to the target. Keep that meaning, but give the learner
        # the missing relationship sentence instead of exposing audit shorthand.
        note = relationship.get("learnerExplanation")
        if isinstance(note, str) and len(note.split()) < 14:
            target = str(relationship.get("toName") or "the related item").strip()
            kind = str(relationship.get("relationshipType") or "relates to").casefold()
            if kind in {"alternative", "alternative_to"}:
                lead = f"This is an alternative to {target}; choose between them according to the question and evidence."
            elif kind in {"builds_on", "requires"}:
                lead = f"This item builds on {target}, so review that foundation before relying on this one."
            elif kind in {"complements", "may_complement"}:
                lead = f"This item can complement {target} when the selected task genuinely needs both."
            elif kind in {"supports", "guides_choice_of"}:
                lead = f"This relationship shows how the item supports the related task or route involving {target}."
            else:
                lead = f"This relationship explains how the item connects with {target} in a selected route."
            relationship["learnerExplanation"] = f"{lead} {note.strip()}"
    return item


_ROLE_ITEM_OUTPUT_BY_LABEL = {
    ("economic adviser", "company policies"): "When a named employer policy is relevant, prepare a short note identifying the policy and version, the decision it governs, and the evidence used. If no policy is identified, there is no specific policy output to assume.",
    ("tax policy analyst", "company policies"): "When a named company policy affects the tax question, prepare a scoped note identifying the policy, the affected reporting or compliance decision, and what remains uncertain. This is not a generic checklist for every tax-policy analysis.",
    ("economist", "environmental economics"): "An analysis note or comparison table showing the environmental question, relevant incentives and costs, affected groups, valuation assumptions, and important effects that cannot be measured reliably in money.",
    ("economic adviser", "environmental economics"): "A decision-support note comparing relevant options, who may bear their costs or benefits, the assumptions used, and environmental or cultural effects that the available valuation does not capture.",
    ("economic policy officer", "international business"): "A bounded policy note naming the countries and sector, the cross-border issue and evidence, and the limits on applying firm-level findings to the wider economy.",
    ("tax policy analyst", "international business"): "A jurisdiction-specific note describing how a defined cross-border business activity may affect the tax question, with countries, period, assumptions, and firm-versus-sector evidence kept distinct.",
    ("anthropologist", "osteology"): "A provenance-aware observation or research note stating where the skeletal material came from, what was observed, how it relates to the question, and what remains uncertain; permissions and specialist input should be recorded.",
    ("archaeologist", "osteology"): "A documented observation linked to the find's location and archaeological context, with identification limits, permissions, and specialist input stated; the record should not imply that bone evidence alone proves a social interpretation.",
    ("anthropologist", "paleography"): "A transcription with uncertain characters marked, alongside the document's identifier, date or script clues, provenance, and a short explanation of how the reading informs the research question.",
    ("archaeologist", "paleography"): "A checked transcription or reading note linked to the original document and archaeological question, marking uncertain words and explaining the document's date, provenance, and interpretive limits.",
    ("genealogist", "social sciences"): "A family-history account or evidence note that names the social-science idea used, distinguishes documented relationships from interpretation, and cites the records that support each claim.",
    ("thanatology researcher", "social sciences"): "A literature or research note connecting a defined question about death, dying, or bereavement to named social-science concepts and evidence, while stating whose experiences the sources do and do not represent.",
    ("demographer", "urban planning"): "A population brief for a named place and period showing the relevant population evidence, assumptions, and possible implications for housing or services; it informs planning but is not a statutory plan.",
    ("geographer", "urban planning"): "A place-based comparison, map, or report showing the area and scale studied, data sources, patterns in land use or service access, and the limits of the evidence; it does not grant planning authority.",
    ("tax policy analyst", "accounting techniques"): "A scoped policy note identifying which records or classifications a proposed tax rule may change, the reporting burden involved, and the assumptions behind that assessment; it is not an audit or account certification.",
    ("economic policy officer", "advise legislators"): "A balanced briefing that states the legislative question, evidence quality, policy options, likely effects, uncertainty, and jurisdictional limits, leaving the decision to legislators and legal interpretation to qualified counsel.",
    ("economic development coordinator", "advise on legislative acts"): "A non-legal implementation note identifying the authoritative enacted instrument, the provisions relevant to a specified development activity, responsible agencies, and questions to refer to legal counsel.",
    ("genealogist", "analyse legislation"): "Only when a historical law affects the records or event being researched: a source note identifying the law, jurisdiction, date, and relevance to the evidence. It is not a general genealogist duty or legal opinion.",
    ("economic development coordinator", "analyse market financial trends"): "A chart or short trend note naming the indicators, market, period, units, and source revisions, with observed changes separated from possible explanations.",
    ("genealogist", "analyse recorded sources"): "A cited evidence log recording each source's creator, date, place, purpose, repository, and limitations, followed by a conclusion that distinguishes supported facts from gaps or conflicting evidence.",
    ("behavioural scientist", "applied zoology"): "Only for a defined study involving animal behaviour or human-animal interaction: a bounded observation or research note describing the question, evidence, relevant welfare or ethics safeguards, and limits. Otherwise this item has no established D078 work product.",
    ("social work researcher", "apply problem solving in social service"): "A research or service-analysis note describing the defined problem, context, evidence, and options for the service owner to consider. It should not be presented as an individual diagnosis or direct case intervention by a researcher.",
    ("social work researcher", "apply quality standards in social services"): "A quality-review finding that names the applicable framework, indicators and evidence reviewed, identifies limitations or gaps, and records a proportionate improvement question for the authorized service owner.",
    ("economic development coordinator", "apply statistical analysis techniques"): "A project-specific analysis note naming the indicator, population, period, method, assumptions, data-quality checks, and uncertainty; it should not claim causation unless the study design supports it.",
    ("archaeologist", "archaeology"): "A documented research or collection record linking a question to sources or finds, their site and provenance, the method used, and a cautious interpretation. The exact output depends on whether the work is archival, laboratory, heritage, survey, or field-based.",
    ("archaeologist", "art history"): "A cited contextual analysis describing an object's visual or material features, provenance and setting, comparing relevant interpretations, and avoiding claims of date or attribution beyond the evidence.",
    ("economic development coordinator", "assess risk factors"): "For a named project, a dated risk note or register stating the objective, identified uncertainties, evidence and assumptions, possible responses, responsible owners, and monitoring triggers; it is not a guarantee that risks are removed.",
    ("tax policy analyst", "audit techniques"): "A scoped note explaining what a published audit or compliance finding can show about a tax rule and what it cannot establish. It does not certify accounts or authorize the learner to conduct or sign an audit.",
    ("behavioural scientist", "biology"): "Only when a defined social-behaviour question has a justified biological component: a bounded interpretation naming the biological evidence and how it relates to social context, with limits and no clinical assessment or treatment claims.",
    ("thanatology researcher", "biology"): "Only for a project that explicitly concerns a biological aspect of death: a review distinguishing biological definitions or measurements from social meanings, institutions, rituals, or bereavement, without making medical or certification claims.",
    ("statistician", "biometrics"): "If the assignment concerns biological or health data, a methods note describing the dataset, statistical approach, validation checks, assumptions, and limits. This does not imply identity-recognition work unless that remit is explicitly established.",
    ("tax policy analyst", "bookkeeping regulations"): "A scoped note separating the authoritative bookkeeping rule, the records or reporting it affects, and the likely administrative implication for the tax question; legal or accounting advice remains outside this learning item.",
    ("political scientist", "political campaigning"): "A neutral case study of campaign organisation or communication that names the jurisdiction, period, and sources, explains the analytical approach, and records ethical and evidence limits; it is not campaign advocacy.",
    ("economic adviser", "public finance"): "A sourced fiscal note defining the revenue, spending, or debt question and period, identifying classifications and revisions, and explaining what the available figures can and cannot support; it is not account certification.",
    ("genealogist", "write work-related reports"): "A clear report with a source appendix and citations that separates documentary facts, oral accounts, and researcher interpretation, and records conflicts, confidence, and missing evidence.",
    ("genealogist", "research family histories"): "A family tree or narrative supported by cited records and interviews, with source provenance, conflicting accounts, confidence, and unanswered questions made visible.",
    ("genealogist", "interpret pedigree charts"): "No general D078 family-history output is established. If a specific genetics task is later selected, any chart note would need to identify the trait and evidence, mark uncertainty, and follow consent, privacy, and qualified-review safeguards.",
    ("genealogist", "transcription methods"): "A faithful transcript linked to its source and page or time location, with uncertain readings marked and the language, script, editorial conventions, and privacy handling recorded.",
    ("genealogist", "suggest revision of manuscripts"): "An editorial review note identifying suggested changes to clarity, citations, audience fit, and uncertainty labels while preserving the evidence and declaring the reviewer's editorial scope.",
    ("archaeologist", "geological time scale"): "A research record may cite a relevant geological time unit to explain context, with its source and uncertainty noted. The time scale alone does not date an archaeological artefact.",
    ("economic policy officer", "international commercial transactions rules"): "For a defined trade or landed-cost analysis, an assumptions table naming the commercial term and edition, delivery responsibilities, and cost or risk allocation; it is not contract drafting or legal interpretation.",
}


def _role_item(record: dict[str, Any], role_key: str, role_name: str) -> dict[str, Any]:
    link = record.get("learning_link") or {}
    url = link.get("url")
    if not _https(url):
        raise ValueError(f"D078 role item has no student-safe external guide: {record.get('queue_position')}")
    review = record.get("learning_link_review") or {}
    if review.get("status") in {"no_supported_d078_learning_route", "unresolved", "rejected"}:
        raise ValueError(f"D078 role item has a non-displayable learning-link decision: {record.get('queue_position')}")

    def claim(role: str) -> dict[str, list[dict[str, Any]]]:
        sources = _role_item_sources(record, role)
        refs = _sources_to_refs(sources, role)
        locators = _source_locators(sources, role)
        if not refs or not locators:
            raise ValueError(f"Role item {record.get('queue_position')} has incomplete {role} evidence")
        return {"source_references": refs, "source_locators": locators}

    identity_claim = claim("item_identity")
    task_claim = claim("contextual_use")
    meaning_claim = identity_claim
    task_output = str(record.get("task_output") or "").strip()
    item_identity = _role_item_identity(record)
    plain_meaning = _role_item_plain_meaning(record.get("plain_language_meaning"), item_identity, record.get("label"))
    if not task_output or not plain_meaning:
        raise ValueError(f"Role item {record.get('queue_position')} is missing its meaning or learner output")

    decision = str(record.get("placement_decision") or "")
    # `priority_snapshot` is retained for audit only: it records a legacy
    # occurrence/priority label, not independently reviewed necessity. A
    # bounded task match supports a useful route option; specialist candidates
    # and separately reviewed role tools remain optional. Only an explicit,
    # source-backed route prerequisite may become `needed` in the route
    # resolver, never from an `essential` snapshot alone.
    if decision in {"conditional", "conditional_route_candidate"}:
        requirement = "useful"
        requirement_reason = "This can help when the selected role task or evidence calls for it. The condition is shown with the item, and the learner can continue without choosing it when that work is not part of their focus."
    elif decision == "specialist_role_addition_candidate":
        requirement = "optional"
        requirement_reason = "This is a specialist option for a narrower role task, not a general step for everyone exploring this role. You can continue without selecting it."
    elif decision in {"area_addition", "role_addition"}:
        requirement = "useful"
        requirement_reason = "This supports a task recorded for this role or its area route, but the evidence does not make it compulsory for every learner or assignment. Choose it when it fits the work you want to explore."
    else:
        requirement = "useful"
        requirement_reason = "This is a source-backed learning option connected to a bounded role task. It is guidance for the selected route, not a qualification or proof of job readiness."

    all_sources = _role_item_sources(record, "contextual_use") + _role_item_sources(record, "item_identity")
    source_refs = _sources_to_refs(all_sources)
    source_locators = _source_locators(all_sources)
    link_source = {
        "source_id": _stable_source_id(link),
        "title": link.get("title") or link.get("label") or "Verified guide",
        "url": url,
        "locator": link.get("locator"),
        "accessed_on": link.get("access_date"),
        "scope_limit": link.get("limits") or link.get("limit"),
    }
    link_title = str(link.get("title") or link.get("label") or f"Read about {record.get('label')}")
    link_state = str(link.get("state") or "")
    link_kind = (
        "reference_only" if link_state == "verified_reference_only_limited"
        else "verified_resource_with_access_caveat" if "limited" in link_state
        else "free_task_specific_learning_resource"
    )
    link_access = str(link.get("access") or link.get("access_status") or "Access terms may vary by provider.")
    if link_kind == "reference_only":
        link_access = "Reference only: useful for understanding the topic, but not a complete course, qualification or proof of competence."
    elif link_kind == "verified_resource_with_access_caveat":
        link_access = f"Access note: {link_access}. The linked sections cover only the stated scope."

    owner_key = role_key.split("|", 1)[-1].strip().casefold()
    task_context, parsed_output = _role_task_sections(task_output, role_name)
    task_context = _ROLE_TASK_CONTEXTUAL_USE_EXPLANATIONS.get(
        str(task_context or "").strip().casefold(), task_context,
    )
    task_context = (
        _ROLE_ITEM_USE_BY_LABEL.get((owner_key, str(record.get("label") or "").strip().casefold()))
        or _ROLE_ITEM_USE_EXPLANATIONS.get((owner_key, item_identity))
        or task_context
    )
    item_label = str(record.get("label") or "").strip().casefold()
    learner_output = str(record.get("expected_output") or parsed_output or _ROLE_ITEM_OUTPUT_BY_LABEL.get((owner_key, item_label), "")).strip()
    if not learner_output:
        learner_output = (
            "The reviewed record does not establish one specific work product for this item. "
            "What you produce depends on the assignment and the task described above."
        )
    if item_identity == "ESCO-SKILL-ff258a7e-b2ba-414a-9878-2380ecf89de0":
        task_context = (
            "Interpreting a pedigree chart means reading a diagram of biological inheritance. "
            "That differs from tracing family relationships through documents or oral histories. "
            "Consider this learning only if a specific project involves genetics, with appropriate consent, privacy safeguards and qualified review; most genealogy work does not require it."
        )
    item_name = str(record.get("label") or "This learning option").strip()
    area_names = _d078_role_area_names().get(role_name.casefold(), [])
    programme_context = (
        f"Your Sociology programme gives you a starting point for studying social life and evidence. {item_name} is additional learning connected to work in the {role_name} route, not something presented as taught in your Sociology courses."
        if "sociology" in str(record.get("programme_meaning") or "").casefold()
        else f"This is additional learning beyond the confirmed outcomes of your selected programme. {item_name} is connected to work in the {role_name} route, not presented as a course outcome."
    )
    domain_context = (
        f"Social Sciences studies people, groups, institutions and social relationships. {item_name} is attached to a task on the {role_name} route; it is not a foundation every learner across the field needs."
        if task_context else "This item has no supported D078 learning route and is therefore not shown as a student learning option."
    )
    area_context = (
        f"The {role_name} route is connected to " + ", ".join(area_names) + f". {item_name} comes through a task on that role route, not as a requirement for every learner in those areas."
        if area_names else "No current area route is recorded for this role, so this item is not shown as a student option."
    )
    role_context = (
        f"For a {role_name}, {item_name} is a learning option for selected tasks, not a checklist for every assignment. Choosing it records a learning interest; it does not prove competence or job readiness."
        if task_context else "No role-specific D078 use is established for this item."
    )
    owner_context = (record.get("role_snapshot_reconciliation") or {}).get("current_area_routed_role_owners") or []
    if not any(str(owner).strip().casefold() == owner_key for owner in owner_context):
        raise ValueError(f"D078 role item {record.get('queue_position')} is not owned by {role_key}")

    additional_learning_links = []
    for candidate in record.get("_additional_learning_links") or []:
        if not _https(candidate.get("url")) or candidate.get("url") == url:
            continue
        additional_learning_links.append({
            "title": candidate.get("title") or candidate.get("label") or "Additional guide",
            "url": candidate["url"],
            "locator": candidate.get("locator"),
            "access": candidate.get("access") or candidate.get("access_status") or "Check current provider access terms.",
            "kind": "reference_only" if candidate.get("state") == "verified_reference_only_limited" else "learning_or_reference",
            "rationale": candidate.get("fit") or candidate.get("supports"),
        })

    return _sanitize_student_narrative_fields({
        "contextLevel": "role", "contextKey": role_key, "domainId": DOMAIN,
        "itemType": _role_item_type(record), "itemKey": item_identity,
        "name": (str(record.get("label") or "").strip()[:1].upper() + str(record.get("label") or "").strip()[1:]), "plainMeaning": plain_meaning,
        "contextualUse": task_context or task_output, "expectedOutput": learner_output or None,
        "programmeContext": programme_context, "domainContext": domain_context,
        "areaContext": area_context, "roleContext": role_context,
        "themeKey": "role_essentials" if requirement == "needed" else "role_learning_options",
        "themeLabel": "For this role" if requirement == "needed" else "Useful for particular role tasks",
        "useCaseKey": f"D078:{re.sub(r'[^a-z0-9]+', '-', role_name.casefold()).strip('-')}:{record.get('queue_position')}",
        "requirementLevel": requirement, "requirementReason": requirement_reason,
        "learningStage": "role_additions", "sequenceBand": "role_additions",
        "sequenceKind": "recommended" if requirement == "useful" else "optional",
        "sequenceOrder": None, "selectionGroup": None, "coLearningGroup": None,
        "displayWhyNext": f"This is role-owned learning for selected {role_name} work; it follows the domain and area path without blocking it.",
        "blocksProgression": False,
        "priority": None, "priorityReason": None, "learningOrder": None,
        "prerequisites": list(record.get("prerequisites") or []),
        "complements": list(record.get("complements") or []),
        "validAlternatives": list(record.get("valid_alternatives") or []),
        "relatedItems": [], "relationships": [], "pathTargets": [],
        "sourceIds": list(dict.fromkeys(ref["id"] for ref in source_refs if ref.get("id"))),
        "sourceReferences": source_refs, "sourceLocators": source_locators,
        "geographicScope": "nigeria_to_global" if record.get("nigeria_context") else "global",
        "evidenceLimitations": _learner_notes(record.get("limits_nonreplacement") or []),
        "evidenceType": "source_supported_synthesis", "sourceConfidence": "medium",
        "dataState": "source_backed", "claimReviewState": "approved",
        "claimEvidence": {"claims": {
            "item_identity": identity_claim,
            "checkpoint_fit": task_claim,
            "plain_meaning": meaning_claim,
            "contextual_use": task_claim,
            "expected_output": task_claim,
            "priority": task_claim,
        }, "reviewed_by": "local_d078_role_item_reconciliation", "decision_id": record.get("pair_key")},
        "linkState": "linked", "linkUrl": url, "linkTitle": link_title,
        "linkSourceReference": link_source,
        "linkAccessedAt": link.get("access_date"), "linkConfidence": "medium",
        "linkEvidence": {
            "url": url, "locator": link.get("locator"),
            "supports": link.get("fit"),
            "why_this_resource": (
                f"This link is attached because the cited section, {link.get('locator') or link_title}, covers a bounded use of {record.get('label')} in this role."
            ),
            "access": link_access,
        },
        "linkKind": link_kind, "linkLevel": "role_task_reference_or_learning",
        "additionalLearningLinks": additional_learning_links,
        "linkLanguage": "English", "linkAccess": link_access, "linkDuration": None,
        "guidanceOwner": "role", "verifiedAt": str(review.get("checked_on") or link.get("access_date") or "2026-10-15"),
    })


@lru_cache(maxsize=1)
def _d078_role_items_by_owner() -> dict[str, list[dict[str, Any]]]:
    master = _read(MASTER_PATH)
    grouped_records: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for record in master.get("role_item_reconciliation", {}).get("records", []):
        if record.get("approval_status") != "approved":
            continue
        if record.get("student_visibility") != "approved":
            continue
        link = record.get("learning_link") or {}
        if link.get("state") == "no_d078_learning_route" or not _https(link.get("url")):
            continue
        if (record.get("learning_link_review") or {}).get("status") in {"no_supported_d078_learning_route", "unresolved", "rejected"}:
            continue
        for owner in (record.get("role_snapshot_reconciliation") or {}).get("current_area_routed_role_owners") or []:
            name = re.sub(r"\s+", " ", str(owner).strip()).casefold()
            if not name:
                continue
            role_key = f"D078|{name}"
            identity = _role_item_identity(record)
            grouped_records.setdefault((role_key, identity), []).append(record)

    grouped: dict[str, list[dict[str, Any]]] = {}
    for (role_key, _identity), records in grouped_records.items():
        representative = dict(records[0])
        evidence_by_key: dict[tuple[str, str], dict[str, Any]] = {}
        for record in records:
            for source in record.get("evidence") or []:
                evidence_by_key[(str(source.get("url") or ""), str(source.get("locator") or ""))] = source
        representative["evidence"] = list(evidence_by_key.values())
        task_contexts: list[str] = []
        learner_outputs: list[str] = []
        for record in records:
            task_context, learner_output = _role_task_sections(record.get("task_output"), role_key.split("|", 1)[-1])
            if task_context and task_context not in task_contexts:
                task_contexts.append(task_context)
            if learner_output and learner_output not in learner_outputs:
                learner_outputs.append(learner_output)
        representative["task_output"] = "\n".join(f"• {task}" for task in task_contexts)
        representative["task_output"] = "\n\n".join(task_contexts)
        representative["expected_output"] = "\n\n".join(learner_outputs)
        for field in ("limits_nonreplacement", "prerequisites", "complements", "valid_alternatives"):
            representative[field] = list(dict.fromkeys(
                str(value).strip()
                for record in records
                for value in (record.get(field) or [])
                if str(value).strip()
            ))
        links = []
        seen_links = set()
        for record in records:
            candidate = record.get("learning_link") or {}
            key = (candidate.get("url"), candidate.get("locator"))
            if candidate.get("url") and key not in seen_links:
                seen_links.add(key)
                links.append(candidate)
        link_rank = {
            "verified_resource_bounded": 0,
            "verified_by_authoritative_search_limited": 1,
            "verified_by_source_search_limited": 2,
            "verified_reference_only_limited": 3,
        }
        links.sort(key=lambda candidate: link_rank.get(str(candidate.get("state") or ""), 9))
        representative["learning_link"] = links[0]
        representative["learning_link_review"] = next(
            (record.get("learning_link_review") for record in records if record.get("learning_link") == links[0]),
            records[0].get("learning_link_review") or {},
        )
        representative["_additional_learning_links"] = links[1:]
        representative["priority_snapshot"] = "essential" if any(record.get("priority_snapshot") == "essential" for record in records) else "optional"
        if any(record.get("placement_decision") in {"conditional", "conditional_route_candidate"} for record in records):
            representative["placement_decision"] = "conditional"
        grouped.setdefault(role_key, []).append(_sanitize_student_narrative_fields(_role_item(representative, role_key, role_key.split("|", 1)[-1])))
    for rows in grouped.values():
        rows.sort(key=lambda item: (0 if item["requirementLevel"] == "needed" else 1, item["name"].casefold(), item["itemKey"]))
    return grouped


def d078_role_context_items(role_key: str) -> list[dict[str, Any]]:
    """Return approved, role-owned D078 learning items, including tool options."""
    normalized = re.sub(r"\s+", " ", str(role_key or "").strip()).casefold()
    grouped = _d078_role_items_by_owner()
    items = list(next((items for key, items in grouped.items() if key.casefold() == normalized), []))
    tools = _d078_role_tools_by_owner()
    items.extend(next((rows for key, rows in tools.items() if key.casefold() == normalized), []))
    seen: set[tuple[str, str]] = set()
    deduped = []
    for item in items:
        identity = (str(item.get("itemType") or "").casefold(), str(item.get("itemKey") or "").casefold())
        if identity not in seen:
            seen.add(identity)
            deduped.append(item)
    return deduped


def _role_tool_task_copy(row: dict[str, Any], role_name: str) -> tuple[str, str]:
    """Turn the reviewed role-task text into learner-facing use/output copy.

    The source artifact currently carries a repeated role-summary output
    template. Do not expose that template as though it were a distinct tool
    deliverable; anchor both sentences to the reviewed task instead.
    """
    task = str(row.get("contextual_use") or "").strip()
    task = re.sub(r"^For [^,]+ work,\s*", "", task, flags=re.IGNORECASE)
    task = re.sub(r"\s+This is an optional tool choice.*$", "", task, flags=re.IGNORECASE).strip()
    task = task.rstrip(" .")
    if task:
        task = task[0].lower() + task[1:]
        use = (
            f"For example, you might use {row['name']} to {task}. "
            f"It is an optional way to carry out this task, not a tool every {role_name} assignment requires."
        )
        output = (
            f"Create a small, documented example showing how you used {row['name']} to {task}. "
            "Name the source or sample material, note the main steps, and explain one important limit of the result."
        )
        return use, output
    # Fail closed to the reviewed fields if an unfamiliar source wording does
    # not match the current task pattern; do not invent a tool-specific task.
    return str(row.get("contextual_use") or ""), str(row.get("expected_output") or "")


@lru_cache(maxsize=1)
def _d078_role_tools_by_owner() -> dict[str, list[dict[str, Any]]]:
    """Load source-backed optional role tools without reclassifying role fit."""
    if not ROLE_TOOL_PATH.exists():
        return {}
    artifact = _read(ROLE_TOOL_PATH)
    grouped: dict[str, list[dict[str, Any]]] = {}
    for row in artifact.get("routes", []):
        if row.get("claim_review_state") != "approved" or row.get("guidance_owner") != "role":
            continue
        if not _https(row.get("link_url")) or not _https((row.get("official_reference") or {}).get("url")):
            continue
        role_key = str(row.get("context_key") or "")
        source_refs = [ref for ref in row.get("source_references", []) if _https(ref.get("url"))]
        if not role_key or len(source_refs) < 2:
            continue
        learning = row.get("learning_resource") or {}
        role_name = str(row.get("role_name") or role_key.rsplit("|", 1)[-1]).strip()
        role_tool_use, role_tool_output = _role_tool_task_copy(row, role_name)
        area_names = [str(name).strip() for name in row.get("area_names") or [] if str(name).strip()]
        area_text = ", ".join(area_names) if area_names else "the selected area"
        programme_context = (
            "Your Sociology programme gives you a starting point for asking questions about social life and evidence. "
            f"{row['name']} is separate, optional learning for a task connected to this role; it is not presented as something taught in your Sociology courses."
        )
        domain_context = (
            "In Social Sciences, a tool can help carry out a research task, but it does not choose a sound question or method, "
            "and its output still needs careful human interpretation. "
            f"This option appears because reviewed work on the {role_name} route includes a task it can support."
        )
        area_context = (
            f"This role is connected to {area_text}. The tool applies only when the particular task described on this card fits "
            "the learner's chosen area route; it is not a requirement for every kind of work in those areas."
        )
        role_context = (
            f"The {role_name} route is linked to this tool through a reviewed work task. "
            "That task connection explains why the option is shown; it does not mean every person in the role uses this tool or must learn it."
        )
        tool = {
            "contextLevel": "role", "contextKey": role_key, "domainId": DOMAIN,
            "itemType": "tool", "itemKey": row["canonical_tool_id"], "canonicalToolId": row["canonical_tool_id"],
            "name": row["name"], "plainMeaning": _role_tool_plain_meaning(row["name"], row["plain_meaning"]), "contextualUse": role_tool_use,
            "expectedOutput": role_tool_output, "programmeContext": programme_context,
            "domainContext": domain_context, "areaContext": area_context,
            "roleContext": role_context, "themeKey": "role_learning_options", "themeLabel": "Optional tools for particular role tasks",
            "useCaseKey": row["id"], "requirementLevel": "optional", "requirementReason": row["priority_reason"],
            "priority": "optional", "priorityReason": row["priority_reason"], "learningOrder": None,
            "learningStage": "role_tools", "sequenceBand": "role_tools", "sequenceKind": "tool_support",
            "sequenceOrder": None, "selectionGroup": None, "coLearningGroup": None,
            "displayWhyNext": f"Use this role-owned tool only when the linked {role_name} task calls for it; it never blocks role progression.",
            "blocksProgression": False,
            "prerequisites": row.get("prerequisites") or [], "complements": row.get("complements") or [],
            "validAlternatives": row.get("alternatives") or [], "relatedItems": [],
            "relationships": [{
                "relationshipType": "supports" if relation["type"] == "supports" else "alternative",
                "relationshipStatus": "source_backed", "toItemKey": relation.get("target_id"),
                "toItemType": "tool" if relation["type"] == "alternative_to" else None,
                "toName": relation["target"], "learnerExplanation": relation["explanation"],
                "sequenceApproved": False, "sequencePolicy": "none",
                "sourceReferences": [ref for ref in relation.get("source_references", []) if _https(ref.get("url"))],
            } for relation in row.get("relationships", [])],
            "pathTargets": [], "sourceIds": [ref.get("id") for ref in source_refs if ref.get("id")],
            "sourceReferences": source_refs, "sourceLocators": [{"sourceId":loc.get("sourceId"),"title":loc.get("locator"),"url":loc.get("url"),"locator":loc.get("locator")} for loc in row.get("source_locators") or []],
            "geographicScope": row.get("geographic_scope") or "global", "evidenceLimitations": row.get("limitations") or [],
            "evidenceType": "source_supported_synthesis", "sourceConfidence": row.get("evidence_confidence") or "medium",
            "dataState": "source_backed", "claimReviewState": "approved",
            "claimEvidence": {"claims": {
                "item_identity":{"source_references":[row["official_reference"]],"source_locators":[loc for loc in row.get("source_locators",[]) if loc.get("sourceId")==row["official_reference"].get("id")]},
                "checkpoint_fit":{"source_references":row.get("role_task_evidence") or [],"source_locators":[loc for loc in row.get("source_locators",[]) if str(loc.get("sourceId","")).startswith("role-profile:")]},
                "plain_meaning":{"source_references":[row["official_reference"]],"source_locators":[loc for loc in row.get("source_locators",[]) if loc.get("sourceId")==row["official_reference"].get("id")]},
                "contextual_use":{"source_references":source_refs,"source_locators":row.get("source_locators") or []},
                "expected_output":{"source_references":row.get("role_task_evidence") or [],"source_locators":[loc for loc in row.get("source_locators",[]) if str(loc.get("sourceId","")).startswith("role-profile:")]},
                "priority":{"source_references":row.get("role_task_evidence") or [],"source_locators":[loc for loc in row.get("source_locators",[]) if str(loc.get("sourceId","")).startswith("role-profile:")]},
            }, "reviewed_by":"local_d078_role_tool_reconciliation", "decision_id":row["id"]},
            "linkState":"linked", "linkUrl":row["link_url"], "linkTitle":row["link_title"],
            "linkSourceReference":{**row["learning_resource"],"locator":row["learning_resource"].get("title")}, "linkAccessedAt":"2026-10-16", "linkConfidence":"medium",
            "linkEvidence":{"url":row["link_url"], "locator":row["learning_resource"].get("title"), "supports":row["contextual_use"], "why_this_resource":learning.get("why_this_resource"), "access":learning.get("access")},
            "linkKind":"free_task_specific_learning_resource", "linkLevel":"role_task_learning", "additionalLearningLinks":[],
            "linkLanguage":"English", "linkAccess":learning.get("access"), "linkDuration":None, "guidanceOwner":"role", "verifiedAt":"2026-10-16",
        }
        grouped.setdefault(role_key, []).append(tool)
    return grouped


def d078_area_tool_options(area_id: str, exclude_canonical_tool_ids: set[str] | None = None) -> list[dict[str, Any]]:
    """Return reviewed tools owned by one current D078 area route.

    These remain area-owned options when shown from a role page; their display
    must not imply that every role task requires or uses each tool.
    """
    normalized = str(area_id or "").strip().casefold()
    if not normalized or not normalized.startswith("d078:"):
        return []
    items = (d078_guided_content().get("areaItems") or {}).get(area_id, [])
    aliases = {
        "nvivo":"NVIVO", "taguette":"TAGUETTE", "r":"R", "python":"PYTHON", "spss":"SPSS", "stata":"STATA",
        "limesurvey":"LIMESURVEY", "psytoolkit":"PSYTOOLKIT", "psychopy":"PSYCHOPY", "opensesame":"OPENSESAME",
        "geoda":"GEODA", "geopandas":"GEOPANDAS", "pysal esda":"PYSAL_ESDA", "arcgis spatial analyst":"ARCGIS",
    }
    excluded = {str(value).casefold() for value in (exclude_canonical_tool_ids or set())}
    out = []
    for item in items:
        if not (
            item.get("itemType") == "tool" and item.get("contextLevel") == "subgroup"
            and item.get("guidanceOwner") == "subgroup" and item.get("claimReviewState") == "approved"
            and _https(item.get("linkUrl"))
        ):
            continue
        normalized_name = re.sub(r"[^a-z0-9]+", " ", str(item.get("name") or "").casefold()).strip()
        tool_key = next((key for alias, key in aliases.items() if normalized_name == alias or normalized_name.startswith(alias + " ")), None)
        canonical = f"D078-TOOL-{tool_key}" if tool_key else None
        if canonical and canonical.casefold() in excluded:
            continue
        out.append({**item, **({"canonicalToolId":canonical} if canonical else {})})
    return out


def _area_item(row: dict[str, Any], decision: dict[str, Any]) -> dict[str, Any]:
    closure = row["closure"]
    sources = list(closure.get("evidence_sources") or [])
    explanatory = list(closure.get("explanatory_sources") or [])
    learning = list(closure.get("free_task_specific_learning_resources") or [])
    if decision.get("learning_link_override"):
        learning = [decision["learning_link_override"], *learning]
    if not sources or not learning:
        raise ValueError(f"Promoted area item lacks item evidence or task-specific learning link: {row.get('item_id')}")
    link = learning[0]
    if not _https(link.get("url")):
        raise ValueError(f"Promoted area item has an invalid learning URL: {row.get('item_id')}")
    source_refs = _sources_to_refs(sources + explanatory)
    linked_source = next((source for source in sources + explanatory if (source.get("source_id") or source.get("id")) == _stable_source_id(link) or source.get("url") == link.get("url")), {})
    link_title = link.get("title") or link.get("label") or linked_source.get("title") or f"Open learning resource ({urlparse(link['url']).netloc})"
    link_ref = _source_reference(link, "task_specific_learning_resource")
    if link_ref and link_ref["url"] not in {ref["url"] for ref in source_refs}:
        source_refs.append(link_ref)
    locators = _source_locators(sources + explanatory)
    link_locator = _source_locators([link], "task_specific_learning_resource")
    claims = {
        "item_identity": {"source_references": _sources_to_refs(sources), "source_locators": _source_locators(sources, "item_identity")},
        "checkpoint_fit": {"source_references": _sources_to_refs(sources), "source_locators": _source_locators(sources, "checkpoint_fit")},
        "plain_meaning": {"source_references": _sources_to_refs(explanatory or sources), "source_locators": _source_locators(explanatory or sources, "plain_meaning")},
        "contextual_use": {"source_references": _sources_to_refs(sources), "source_locators": _source_locators(sources, "contextual_use")},
    }
    if not all(value["source_references"] and value["source_locators"] for value in claims.values()):
        raise ValueError(f"Promoted area item has an incomplete claim source role: {row.get('item_id')}")
    output = closure.get("learner_output")
    output_text = _explanation(output)
    if output is None:
        output_text = _explanation(decision.get("learner_output"))
    expected_output = output_text or _explanation(decision.get("learner_output")) or _explanation(decision.get("task_use_and_output"))
    display_override = _AREA_ITEM_DISPLAY_OVERRIDES.get(str(row.get("item_id") or ""), {})
    expected_output = display_override.get("expected_output") or expected_output
    if expected_output:
        claims["expected_output"] = claims["contextual_use"]
    item_type = _item_type(row.get("item_type", ""))
    category = closure.get("category") or "area_specific_enrichment"
    # The former fallback here was a repeated, generic sentence (“This is a
    # D078 area-level addition...”) for almost every card. It said nothing
    # about why this particular item belongs to this area. Build the learner
    # explanation from the reviewed area scope and task contract instead.
    area_name = _d078_area_name(str(row.get("area_id") or ""))
    scope = _explanation(decision.get("student_scope") or decision.get("display_scope"))
    if scope and re.match(r"^(?:show|display|route note)\b", scope, flags=re.IGNORECASE):
        # These are staff presentation instructions, not an explanation for a
        # learner. The area name and the independently sourced task context
        # still explain the route without exposing implementation directions.
        scope = None
    requirement = _area_requirement_level(decision)
    task_use = (
        _explanation(decision.get("task_use_and_output"))
        or _explanation(decision.get("task_use"))
        or _explanation(closure.get("task_use_and_output"))
        or expected_output
    )
    # Keep the actual item-specific task in the use section. The route rationale
    # and optional/useful status have their own fields and UI headings; repeating
    # them here made every area card read like one long, templated paragraph.
    context_use = display_override.get("contextual_use") or task_use or ""
    supplemental = closure.get("supplemental_research") or []
    source_ids = [ref.get("id") for ref in source_refs if ref.get("id")]
    geo = "nigeria_to_global" if any(str(source.get("jurisdiction") or "").casefold() == "nigeria" or "nigeria" in str(source.get("publisher") or "").casefold() for source in sources) else "global"
    limitations = _learner_notes(closure.get("limitations_and_non_substitutions"))
    for repair in supplemental:
        limitations.extend(_learner_notes(repair.get("item_limit")))
    area_context = (
        f"For {area_name}: {scope}"
        if scope else f"In {area_name}, this is a focused addition for questions that need the task described below."
    )
    domain_context = (
        f"The Social Sciences domain provides the broader foundation; {area_name or 'this area'} adds this focused knowledge or practice for relevant questions."
    )
    requirement_reason = (
        f"This is an optional choice in {area_name or 'this area'}, not a step every learner must take. Choose it when the task and question fit; you can continue without it."
        if requirement == "optional"
        else f"This is a useful focused addition in {area_name or 'this area'}, not a prerequisite for every route. It may help when the task matches the question you want to explore."
    )
    if row.get("item_id", "").endswith(":mesa-or-casevo"):
        limitations.append("Casevo's documented Baichuan API route may involve paid usage and availability limits; Mesa remains the documented free runnable alternative.")
    if row.get("item_id", "").endswith(":predictive-text-modeling"):
        limitations.append("The AfriSenti sentiment-classification exercise supports only sentiment analysis on its defined data; it does not validate other constructs such as wellbeing or political attitudes.")
    if row.get("item_id") == "D078-ECON-CASEVO-LLM-SIM":
        limitations.append("Casevo's supported execution route may require a compatible model/API licence; cost and availability are not universal.")
    return {
        "contextLevel": "subgroup", "contextKey": row["area_id"], "domainId": DOMAIN,
        "itemType": item_type, "itemKey": row["item_id"], "name": row["label"],
        "plainMeaning": _area_item_meaning(row["item_id"], decision.get("what_it_is") or closure.get("what_it_is")),
        "contextualUse": context_use, "expectedOutput": expected_output,
        "programmeContext": SOCIOLOGY_PROGRAMME_CONTEXT,
        "domainContext": domain_context,
        "areaContext": area_context,
        "themeKey": category, "themeLabel": str(category).replace("_", " ").capitalize(),
        "useCaseKey": row["area_id"].split(":", 1)[-1], "requirementLevel": requirement,
        "requirementReason": requirement_reason, "priority": None, "priorityReason": None, "learningOrder": None,
        "learningStage": "area_additions", "sequenceBand": "area_additions",
        "sequenceKind": "recommended" if requirement == "useful" else "optional",
        "sequenceOrder": None, "selectionGroup": None, "coLearningGroup": None,
        "displayWhyNext": f"This is an area-owned addition for {area_name}; it follows the inherited domain path when its task fits.",
        "blocksProgression": False,
        "prerequisites": list(decision.get("approved_prerequisite_labels") or []),
        "relatedItems": [], "relationships": [], "pathTargets": [],
        "sourceIds": list(dict.fromkeys(source_ids)), "sourceReferences": source_refs,
        "sourceLocators": locators + link_locator, "geographicScope": geo,
        "evidenceLimitations": [str(value) for value in limitations if value],
        "evidenceType": "source_supported_synthesis", "sourceConfidence": "medium",
        "dataState": "source_backed", "claimReviewState": "approved",
        "claimEvidence": {"claims": claims, "reviewed_by": "local_d078_item_disposition", "decision_id": decision.get("item_id")},
        "linkState": "linked", "linkUrl": link.get("url"), "linkTitle": link_title,
        "linkSourceReference": {**link, "source_id": _stable_source_id(link), "title": link_title, "locator": link.get("locator") or link.get("exact_locator")},
        "linkAccessedAt": link.get("accessed") or link.get("accessed_on") or "2026-10-12",
        "linkConfidence": "medium",
        "linkEvidence": {"url": link.get("url"), "locator": link.get("locator") or link.get("exact_locator"), "supports": link.get("what_it_teaches") or link.get("what_supported") or link.get("supports"), "why_this_resource": _why_this_learning_resource(link, row["label"]), "access": link.get("cost_access") or link.get("access_cost")},
        "linkKind": "free_task_specific_learning_resource", "linkLevel": link.get("level"),
        "linkLanguage": link.get("language") or "English",
        "linkAccess": link.get("cost_access") or link.get("access_cost") or "Free learning resource; review the provider's current access terms.",
        "linkDuration": link.get("duration"), "guidanceOwner": "subgroup", "verifiedAt": "2026-10-12",
    }


def _area_tool_option(
    *,
    area_id: str,
    item_key: str,
    name: str,
    meaning: str,
    use: str,
    output: str,
    task: dict[str, Any],
    official: dict[str, str],
    learning: dict[str, str],
    prerequisites: list[str],
    limits: list[str],
    relationships: list[dict[str, str]] | None = None,
    base: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build a separate, task-scoped tool card from an approved local record.

    The option catalog is limited to tool evidence already captured in the
    2026-10-15 D078 checkpoint and the existing approved D078 area/domain
    contracts. It performs no network access and does not infer sequencing.
    """
    official_ref = {
        "id": official["source_id"], "title": official["title"],
        "url": official["url"], "evidenceType": "tool_identity_and_scope",
        "region": "global",
    }
    learning_ref = {
        "id": learning["source_id"], "title": learning["title"],
        "url": learning["url"], "evidenceType": "task_specific_learning_resource",
        "region": "global",
    }
    task_refs = list(task.get("sourceReferences") or [])
    task_locators = list(task.get("sourceLocators") or [])
    base_refs = list((base or {}).get("sourceReferences") or [])
    base_locators = list((base or {}).get("sourceLocators") or [])
    source_refs = _sources_to_refs([
        *[{
            "source_id": ref.get("id"), "title": ref.get("title"),
            "url": ref.get("url"), "locator": ref.get("locator"),
        } for ref in [*base_refs, *task_refs]],
        {**official, "source_id": official["source_id"]},
        {**learning, "source_id": learning["source_id"]},
    ])
    source_locators: list[dict[str, Any]] = []
    for locator in [*base_locators, *task_locators]:
        if isinstance(locator, dict) and locator.get("url", "").startswith("https://"):
            source_locators.append(locator)
    source_locators.extend([
        {"sourceId": official["source_id"], "url": official["url"], "locator": official["locator"]},
        {"sourceId": learning["source_id"], "url": learning["url"], "locator": learning["locator"]},
    ])
    # Each required claim has an explicit source role and locator. The task
    # item's sources support area fit; the official product/docs pages support
    # item identity and meaning; the learning page supports the learning link.
    task_claim = {"source_references": task_refs or source_refs, "source_locators": task_locators or source_locators}
    tool_claim = {
        "source_references": [official_ref],
        "source_locators": [{"sourceId": official["source_id"], "url": official["url"], "locator": official["locator"]}],
    }
    resource_claim = {
        "source_references": [learning_ref],
        "source_locators": [{"sourceId": learning["source_id"], "url": learning["url"], "locator": learning["locator"]}],
    }
    verified_relationships = []
    for edge in relationships or []:
        verified_relationships.append({
            "relationshipType": edge["type"],
            "relationshipStatus": "source_backed",
            "reviewedContractRelationship": True,
            "toItemKey": edge.get("target_id"),
            "toName": edge["target"],
            "learnerExplanation": edge["explanation"],
            "sequenceApproved": False,
            "sequencePolicy": "none",
            "sequenceScope": {"domainIds": [DOMAIN], "areaIds": [area_id]},
            "sourceReferences": source_refs,
        })
    return {
        "contextLevel": "subgroup", "contextKey": area_id, "domainId": DOMAIN,
        "itemType": "tool", "itemKey": item_key, "name": name,
        "plainMeaning": _area_item_meaning(item_key, meaning) or meaning, "contextualUse": use, "expectedOutput": output,
        "programmeContext": SOCIOLOGY_PROGRAMME_CONTEXT,
        "domainContext": "This is an optional tool inside the Social Sciences domain, not a shared foundation or a requirement for every route.",
        "areaContext": f"In {_d078_area_name(area_id) or 'this area'}, this tool is offered for the specific task: {task.get('name') or task.get('itemKey')}. Choose it only when that task fits your question.",
        "themeKey": "area_tool_options", "themeLabel": "Tools for a particular task",
        "useCaseKey": task.get("itemKey"), "requirementLevel": "optional",
        "requirementReason": f"This is one optional tool for {task.get('name') or 'the selected task'}, not a step every learner must take. You can use another suitable approach or continue without this tool.",
        "priority": None, "priorityReason": None, "learningOrder": None,
        "prerequisites": prerequisites, "relatedItems": [], "relationships": verified_relationships,
        "pathTargets": [], "sourceIds": list(dict.fromkeys(ref.get("id") for ref in source_refs if ref.get("id"))),
        "sourceReferences": source_refs, "sourceLocators": source_locators,
        "geographicScope": "global", "evidenceLimitations": limits,
        "evidenceType": "source_supported_synthesis", "sourceConfidence": "medium",
        "dataState": "source_backed", "claimReviewState": "approved",
        "claimEvidence": {
            "claims": {
                "item_identity": tool_claim,
                "checkpoint_fit": task_claim,
                "plain_meaning": tool_claim,
                "contextual_use": {"source_references": [*task_refs, official_ref], "source_locators": [*task_locators, {"sourceId": official["source_id"], "url": official["url"], "locator": official["locator"]}]},
                "expected_output": task_claim,
            },
            "reviewed_by": "local_d078_task_linked_tool_reconciliation",
            "decision_id": item_key,
        },
        "linkState": "linked", "linkUrl": learning["url"], "linkTitle": learning["title"],
        "linkSourceReference": {**learning, "id": learning["source_id"], "source_id": learning["source_id"]},
        "linkAccessedAt": "2026-10-15", "linkConfidence": "medium",
        "linkEvidence": {
            "url": learning["url"], "locator": learning["locator"],
            "supports": learning["supports"],
            "why_this_resource": f"This resource teaches the {name} workflow used for the selected task: {task.get('name') or task.get('itemKey')}.",
            "access": learning.get("access", "Free learning/reference resource; confirm current provider terms."),
        },
        "linkKind": "free_task_specific_learning_resource", "linkLevel": "task_specific",
        "linkLanguage": "English", "linkAccess": learning.get("access", "Free learning/reference resource; confirm current provider terms."),
        "linkDuration": None, "guidanceOwner": "subgroup", "verifiedAt": "2026-10-15",
    }


def _researched_area_tool_options(domain_items: list[dict[str, Any]], area_items: dict[str, list[dict[str, Any]]]) -> None:
    """Apply the already-researched 2026-10-15 task-linked tool decisions.

    Existing bundled Social Behaviour cards are replaced by individually
    explained options. Human Geography receives the researched spatial-tool
    choices, all attached to its existing spatial-analysis task. This does not
    create a fixed minimum or alter the seven canonical areas.
    """
    domain_tools = {
        item["itemKey"]: item for item in domain_items if item.get("itemType") == "tool"
    }
    hg = "D078:human-geography-population"
    social = "D078:psychology-social-behaviour"
    hg_rows = area_items.get(hg, [])
    social_rows = area_items.get(social, [])
    task_by_area = {
        hg: next(item for item in hg_rows if item["itemKey"].endswith(":spatial-analysis-method")),
        social: {item["itemKey"]: item for item in social_rows},
    }

    # Preserve the existing QGIS card and add only distinct, previously
    # researched workflows. Alternatives remain choices, not prerequisites.
    hg_specs = [
        ("D078-HG-TOOL-GEODA", "GeoDa", "A focused desktop tool for exploring spatial patterns and spatial autocorrelation.", "Use it when a human-geography question asks whether a measured population or social condition clusters across neighbouring places, or where local clusters and outliers appear.", "An exploratory spatial-analysis result with the selected geographic units and spatial-weights choice documented for interpretation beside a map.", "https://spatial.uchicago.edu/", "University of Chicago Center for Spatial Data Science", "Spatial data science overview: location, distance and spatial interaction as core features of policy-relevant social-science research.", "https://geodacenter.github.io/workbook/5a_global_auto/lab5a.html", "GeoDa workbook: global spatial autocorrelation", "Global spatial autocorrelation workbook for a bounded exploratory task.", ["A suitable spatial dataset and geographic units", "Basic descriptive statistics", "A stated question and a defensible spatial-weights choice"], ["Clustering is not proof of cause.", "Results depend on geographic boundaries, coverage and spatial-weights choices.", "QGIS can handle general GIS and some spatial-statistics work; choose GeoDa for its focused exploratory workflow, not as an extra requirement."]),
        ("D078-HG-TOOL-GEOPANDAS", "GeoPandas", "A Python library for working with geographic tables and vector map layers.", "Use it when the spatial-analysis task requires joining population or social observations to geographic areas, or combining geographic layers before comparison.", "A documented geospatial table or layer ready for mapping or further analysis, with join choices and data sources recorded.", "https://geopandas.org/en/latest/", "GeoPandas project documentation", "GeoPandas documentation: Python tools for working with geospatial data.", "https://geopandas.org/en/latest/gallery/spatial_joins.html", "GeoPandas spatial-joins gallery", "Official spatial-join examples for combining observations with geographic features.", ["Basic Python and tabular-data handling", "A suitable, documented geographic layer", "Understanding of the spatial unit being compared"], ["A spatial join applies a geometric rule; it does not prove that the areas or measures are substantively appropriate.", "Python coding is part of this option; QGIS may be easier for a graphical workflow."]),
        ("D078-HG-TOOL-PYSAL-ESDA", "PySAL esda", "A Python package for exploratory spatial-data analysis, including spatial-autocorrelation methods.", "Use it when the spatial-analysis task calls for a reproducible code workflow to examine clustering or spatial outliers.", "Repeatable statistics and plots with the spatial-weights definition and interpretation limits recorded.", "https://pysal.org/esda/stable/", "PySAL esda documentation", "Official user guide describing exploratory spatial-data analysis methods.", "https://pysal.org/esda/stable/user-guide/global_morans_i.html", "PySAL global Moran's I tutorial", "Task-specific walkthrough of global spatial autocorrelation in PySAL.", ["Basic Python and data preparation", "Geographic units and a spatial-weights definition", "Basic statistical interpretation"], ["A statistic does not explain why a pattern occurs.", "Local tests and multiple comparisons need careful interpretation.", "GeoDa is a graphical alternative for exploratory spatial statistics; do not learn both by default."]),
        ("D078-HG-TOOL-ARCGIS-SPATIAL-ANALYST", "ArcGIS Spatial Analyst", "A licensed ArcGIS extension for raster and feature-based spatial analysis.", "Consider it when the spatial-analysis task specifically needs raster or feature-analysis operations and the learner or institution already has a suitable licence.", "A documented spatial-analysis layer or model and a map/report that explains scale, data and assumptions.", "https://pro.arcgis.com/en/pro-app/3.5/tool-reference/spatial-analyst/an-overview-of-the-spatial-analyst-toolbox.htm", "Esri ArcGIS Pro documentation", "Official Spatial Analyst toolbox overview describing raster and feature analysis capabilities.", "https://learn.arcgis.com/en/projects/identify-popular-places-with-spatiotemporal-data-science/", "Esri Learn tutorial: spatial-temporal cluster analysis", "A task-oriented spatial-temporal analysis tutorial; requires the stated ArcGIS Pro licence level.", ["Geographic data and spatial-analysis concepts", "Access to ArcGIS Pro and the required Spatial Analyst licence"], ["Paid licensing can limit access; QGIS and open-source options may be sufficient.", "The software does not validate the social measure, boundaries or interpretation."]),
    ]
    for key, name, meaning, use, output, official_url, official_title, official_locator, learning_url, learning_title, learning_locator, prereq, limits in hg_specs:
        area_items[hg].append(_area_tool_option(
            area_id=hg, item_key=key, name=name, meaning=meaning, use=use, output=output,
            task=task_by_area[hg],
            official={"source_id": f"d078-tool-source-{key.casefold()}", "title": official_title, "url": official_url, "locator": official_locator},
            learning={"source_id": f"d078-tool-learning-{key.casefold()}", "title": learning_title, "url": learning_url, "locator": learning_locator, "supports": learning_locator, "access": "Free learning resource; ArcGIS requires a paid licence." if "ARCGIS" in key else "Free learning resource."},
            prerequisites=prereq, limits=limits,
            relationships=[{"type": "supports", "target_id": task_by_area[hg]["itemKey"], "target": task_by_area[hg]["name"], "explanation": f"{name} is an optional way to carry out this spatial-analysis task; it does not determine the question or interpretation."}],
        ))

    # Replace bundled labels with six independent records. Their official and
    # learning links come from the already-approved D078 domain tool contracts;
    # their use is narrowed to existing Social Behaviour area tasks.
    social_rows = [item for item in social_rows if item["itemKey"] not in {"D078-A04-tool-nvivo-tagging", "D078-A04-tools-quantitative-alternatives"}]
    area_items[social] = social_rows
    tasks = task_by_area[social]
    social_specs = [
        ("d078-nvivo-tool", "D078-A04-TOOL-NVIVO", "NVivo", "Use NVivo to organise and code substantial interview, focus-group or document material when the study needs a traceable qualitative analysis workflow.", "A structured project with documented codes and retrievable excerpts for human interpretation.", "D078-A04-method-qualitative-group-inquiry", ["Qualitative analysis and a documented coding approach", "Secure handling of research material"], ["The software does not conduct interviews or decide what a theme means.", "A licensed product; Taguette is an alternative for a lighter document-coding workflow."]),
        ("d078-qualitative-coding-tool", "D078-A04-TOOL-TAGUETTE", "Taguette", "Use Taguette to highlight and code interview, focus-group or document text when a simpler qualitative-coding workflow fits the project.", "A coded text collection with excerpts linked to the learner's coding choices.", "D078-A04-method-qualitative-group-inquiry", ["Qualitative analysis and a clear codebook or coding plan", "Careful handling of potentially identifying text"], ["Taguette helps organise coding; it does not decide whether an interpretation is sound.", "NVivo is an alternative when a project needs a larger licensed analysis environment."]),
        ("r_statistical_computing", "D078-A04-TOOL-R", "R", "Use R for statistical or mixed-method analysis when the question needs a documented, repeatable code-based workflow.", "Reproducible analysis code and results that can be checked against the research question and data.", "D078-A04-skill-measurement-analysis", ["Basic data handling and statistical reasoning", "A documented question, measures and analysis plan"], ["R does not choose valid measures or repair biased data.", "Python, SPSS and Stata are alternatives for some analysis tasks; choose by method, access and reproducibility needs."]),
        ("d078_python", "D078-A04-TOOL-PYTHON", "Python", "Use Python when a social-behaviour study needs repeatable data preparation, analysis or a computational workflow.", "A reproducible notebook or script and a clearly explained analysis output.", "D078-A04-method-comparative-mixed-analysis", ["Basic programming and data handling for the selected workflow", "A defined question and appropriate method"], ["Python is not evidence of statistical or social-science competence by itself.", "R, SPSS and Stata may be valid alternatives depending on the task and learner's route."]),
        ("d078-spss-tool", "D078-A04-TOOL-SPSS", "SPSS", "Use SPSS for structured statistical analysis when the project and institution use its menus or syntax-based workflow.", "A documented analysis and output tables tied to the study question.", "D078-A04-skill-measurement-analysis", ["Basic statistical concepts and a suitable dataset", "A clear plan for measures and comparisons"], ["SPSS does not validate a survey, sample or conclusion.", "R, Python and Stata can be alternatives; SPSS access may depend on an institutional or paid licence."]),
        ("stata_quantitative_social_science_workflow", "D078-A04-TOOL-STATA", "Stata", "Use Stata for quantitative social-science analysis when its statistical workflow fits the data and study design.", "A reproducible command log or do-file with results and assumptions documented.", "D078-A04-method-comparative-mixed-analysis", ["Basic statistical reasoning and data management", "A defined analysis plan"], ["Stata is licensed software and does not establish that the design or conclusion is valid.", "R, Python and SPSS may be alternatives for comparable tasks."]),
    ]
    for base_id, key, name, use, output, task_id, prereq, limits in social_specs:
        base = domain_tools.get(base_id)
        if not base:
            raise ValueError(f"Missing existing approved D078 domain tool contract for {base_id}")
        task = tasks.get(task_id)
        if not task:
            raise ValueError(f"Missing reviewed Social Behaviour task {task_id}")
        refs = list(base.get("sourceReferences") or [])
        primary = next((ref for ref in refs if str(ref.get("url") or "").startswith("https://")), None)
        link_url = base.get("linkUrl")
        link_title = base.get("linkTitle")
        link_locator = (base.get("linkEvidence") or {}).get("locator") or (base.get("linkEvidence") or {}).get("supports") or link_title
        if not primary or not link_url or not link_locator:
            raise ValueError(f"Existing domain tool record lacks source/link locator: {base_id}")
        area_items[social].append(_area_tool_option(
            area_id=social, item_key=key, name=name,
            meaning=base.get("plainMeaning") or base.get("name"), use=use, output=output,
            task=task,
            official={"source_id": primary["id"], "title": primary["title"], "url": primary["url"], "locator": next((loc.get("locator") for loc in base.get("sourceLocators", []) if loc.get("url") == primary["url"]), primary["title"])},
            learning={"source_id": (base.get("linkSourceReference") or {}).get("source_id") or (base.get("linkSourceReference") or {}).get("id") or primary["id"], "title": link_title, "url": link_url, "locator": link_locator, "supports": (base.get("linkEvidence") or {}).get("supports") or link_locator, "access": base.get("linkAccess") or "Check the provider's current access terms."},
            prerequisites=prereq, limits=limits, base=base,
            relationships=[{"type": "supports", "target_id": task_id, "target": task.get("name") or task_id, "explanation": f"{name} is one optional way to support this task when it fits the study; it is not a requirement for every route."}],
        ))

    experiment_specs = [
        ("D078-A04-TOOL-LIMESURVEY", "LimeSurvey", "A platform for building and administering online questionnaires.", "Use it when the research design needs a structured online questionnaire with suitable question types or branching.", "A questionnaire and response dataset with collection settings documented.", "D078-A04-method-behavioural-research-design", "https://www.limesurvey.org/", "LimeSurvey Community Edition", "Official Community Edition page describing the survey platform.", "https://www.limesurvey.org/manual/Quick_start_guide", "LimeSurvey quick-start guide", "Steps for creating and publishing a questionnaire.", ["A clear research question and questionnaire plan", "Sampling, consent, accessibility and data-protection decisions"], ["A platform does not make a questionnaire valid or a sample representative.", "KoboToolbox may be a better alternative for mobile/offline field collection; use both only when the project needs both workflows."]),
        ("D078-A04-TOOL-PSYTOOLKIT", "PsyToolkit", "A platform with psychology-focused experiment and questionnaire examples.", "Use its experiment or questionnaire library when the behavioural-research question fits a published task or survey workflow.", "A documented experiment/questionnaire setup and participant response data.", "D078-A04-method-behavioural-research-design", "https://www.psytoolkit.org/", "PsyToolkit", "Official overview of experiment and questionnaire research uses.", "https://www.psytoolkit.org/experiment-library/", "PsyToolkit experiment library", "Examples for psychology/behavioural experiment tasks.", ["Experimental or questionnaire design", "Measurement, participant consent and data analysis"], ["An example or scale is not automatically valid for every population, language or context; check validation and permission.", "Online timing and hosting conditions can affect measurement."]),
        ("D078-A04-TOOL-PSYCHOPY", "PsychoPy", "A tool for building behavioural experiments that present stimuli and record responses.", "Use it for a controlled behavioural task when the research question requires planned stimuli and response measurement—not for every study in this area.", "An experiment specification and response/timing data with the design and limitations documented.", "D078-A04-method-behavioural-research-design", "https://www.psychopy.org/", "PsychoPy project", "Official project overview for experiment-building software.", "https://psychopy.org/teaching/index.html", "PsychoPy teaching and learning resources", "Builder learning materials and video tutorials for building experiments.", ["Experimental design, operational definitions and response measurement", "Consent and participant-protection planning"], ["Software does not make a measure valid, a sample representative or a result causal.", "Some online components require compatibility checks before use.", "OpenSesame is an alternative experiment builder; learners need not use both."]),
        ("D078-A04-TOOL-OPENSESAME", "OpenSesame", "A graphical environment for constructing behavioural experiments and recording responses.", "Choose it as an alternative to PsychoPy when a point-and-click experiment builder suits the behavioural task.", "A runnable experiment and response data, with design choices and limits documented.", "D078-A04-method-behavioural-research-design", "https://osdoc.cogsci.nl/current", "OpenSesame documentation", "Current official documentation describing psychology experiment creation.", "https://osdoc.cogsci.nl/4.0/tutorials/beginner/", "OpenSesame beginner experiment tutorial", "Step-by-step construction of a behavioural experiment.", ["Experimental design, operationalization and response measurement", "Ethical participant handling"], ["A runnable experiment does not establish valid theory, measurement or causal inference.", "PsychoPy is an alternative for the same bounded experiment-building route; choose one that fits the task."]),
    ]
    for key, name, meaning, use, output, task_id, official_url, official_title, official_locator, learning_url, learning_title, learning_locator, prereq, limits in experiment_specs:
        task = tasks.get(task_id)
        if not task:
            raise ValueError(f"Missing reviewed Social Behaviour task {task_id}")
        area_items[social].append(_area_tool_option(
            area_id=social, item_key=key, name=name, meaning=meaning, use=use, output=output,
            task=task,
            official={"source_id": f"d078-official-{key.casefold()}", "title": official_title, "url": official_url, "locator": official_locator},
            learning={"source_id": f"d078-learning-{key.casefold()}", "title": learning_title, "url": learning_url, "locator": learning_locator, "supports": learning_locator},
            prerequisites=prereq, limits=limits,
            relationships=[{"type": "supports", "target_id": task_id, "target": task.get("name") or task_id, "explanation": f"{name} is an optional tool for this specific design/collection task, not a requirement for every Social Behaviour route."}],
        ))
    # The experimental builders are alternatives within the same bounded task.
    psycho = next(item for item in area_items[social] if item["itemKey"] == "D078-A04-TOOL-PSYCHOPY")
    opensesame = next(item for item in area_items[social] if item["itemKey"] == "D078-A04-TOOL-OPENSESAME")
    psycho["relationships"].append({
        "relationshipType": "alternative", "relationshipStatus": "source_backed",
        "reviewedContractRelationship": True, "toItemKey": opensesame["itemKey"],
        "toName": opensesame["name"],
        "learnerExplanation": "Both can be used to build a controlled behavioural experiment. Compare their workflow and the needs of your study; selecting one does not require learning the other.",
        "sequenceApproved": False, "sequencePolicy": "none",
        "sequenceScope": {"domainIds": [DOMAIN], "areaIds": [social]},
        "sourceReferences": psycho["sourceReferences"] + opensesame["sourceReferences"],
    })
    opensesame["relationships"].append({
        "relationshipType": "alternative", "relationshipStatus": "source_backed",
        "reviewedContractRelationship": True, "toItemKey": psycho["itemKey"],
        "toName": psycho["name"],
        "learnerExplanation": "Both can be used to build a controlled behavioural experiment. Compare their workflow and the needs of your study; selecting one does not require learning the other.",
        "sequenceApproved": False, "sequencePolicy": "none",
        "sequenceScope": {"domainIds": [DOMAIN], "areaIds": [social]},
        "sourceReferences": opensesame["sourceReferences"] + psycho["sourceReferences"],
    })
    return


def _attach_approved_conditional_sequence_edges(
    domain_items: list[dict[str, Any]],
    area_items: dict[str, list[dict[str, Any]]],
) -> None:
    """Attach the three approved D078 route-scoped order decisions.

    These are conditional ordering hints, not selection blockers: do not
    silently add a prerequisite or require the learner to repeat prior study.
    They are attached to the dependent card so the route planner can order
    both items when the learner chooses them and the Economics condition fits.
    """
    source_refs = {
        "statistics": [{
            "id": "sequence-evidence:upenn-econ224",
            "title": "University of Pennsylvania Economics, Statistical Learning and Causal Inference for Economics syllabus",
            "url": "https://economics.sas.upenn.edu/system/files/2018-09/Econ224syllabus.pdf",
            "evidenceType": "route_scoped_learning_order",
        }],
        "causal_ml": [{
            "id": "sequence-evidence:stanford-mgtecon634",
            "title": "Stanford GSB, Machine Learning and Causal Inference course description and prerequisite",
            "url": "https://bulletin.stanford.edu/courses/2177851",
            "evidenceType": "route_scoped_learning_order",
        }],
        "casevo": [
            {
                "id": "sequence-evidence:casevo-paper",
                "title": "Casevo: A Cognitive Agents and Social Evolution Simulator",
                "url": "https://arxiv.org/abs/2412.19498",
                "evidenceType": "route_scoped_learning_order",
            },
            {
                "id": "sequence-evidence:casevo-repository",
                "title": "Casevo project implementation documentation",
                "url": "https://github.com/rgCASS/casevo",
                "evidenceType": "route_scoped_learning_order",
            },
        ],
    }
    economics_area = "D078:economics-applied-analysis"
    domain_by_key = {str(item.get("itemKey")): item for item in domain_items}
    area_by_key = {
        str(item.get("itemKey")): item
        for rows in area_items.values()
        for item in rows
    }
    relations = [
        {
            "dependent": area_by_key.get("D078-ECON-APPLIED-ECONOMETRICS"),
            "prerequisite": domain_by_key.get("d078-quantitative-approach"),
            "name": "Introductory statistics and relevant regression foundations",
            "type": "method",
            "evidence": source_refs["statistics"],
            "condition": "Use this order on the Economics and Applied Economic Analysis route when you have not already studied introductory statistics and relevant regression foundations. If you have comparable prior study, you can review or continue; no particular software package is required.",
            "explanation": "Applied econometrics uses statistical ideas to examine economic questions with data. If probability, statistics or relevant regression ideas are new to you, build or review them first; if you have already studied them, you do not need to repeat the same preparation.",
        },
        {
            "dependent": area_by_key.get("D078-ECON-CAUSAL-ML"),
            "prerequisite": area_by_key.get("D078-ECON-APPLIED-ECONOMETRICS"),
            "name": "Applied econometrics and causal-inference reasoning",
            "type": "method",
            "evidence": source_refs["causal_ml"],
            "condition": "Only when you choose the advanced causal-effect-estimation / causal machine-learning route. This is not a prerequisite for ordinary predictive machine learning.",
            "explanation": "Causal machine learning asks questions about what may have caused an outcome, not only how accurately a model predicts it. The advanced causal route builds on econometric and causal-inference ideas; this order does not apply to general prediction tasks.",
        },
        {
            "dependent": area_by_key.get("D078-ECON-CASEVO-LLM-SIM"),
            "prerequisite": area_by_key.get("D078-ECON-AGENT-BASED-MODELING"),
            "name": "Agent-based modelling concepts and model/agent scheduling",
            "type": "method",
            "evidence": source_refs["casevo"],
            "condition": "Only when you choose the Casevo implementation route. Do not treat agent-based modelling as a prerequisite for every LLM simulation.",
            "explanation": "Casevo extends an agent-based model with an LLM-enabled simulation workflow. First understand how a model sets rules and how its agents act and interact; then the Casevo-specific setup will make more sense. This is not a required step for other simulation approaches.",
        },
    ]
    for relation in relations:
        dependent = relation["dependent"]
        prerequisite = relation["prerequisite"]
        if not dependent or not prerequisite:
            raise ValueError(f"Approved D078 sequence endpoint missing: {relation['name']}")
        dependent.setdefault("relationships", []).append({
            "relationshipType": "builds_on",
            "relationshipStatus": "source_backed",
            "reviewedContractRelationship": True,
            "fromItemType": dependent["itemType"],
            "fromItemKey": dependent["itemKey"],
            "toItemType": prerequisite["itemType"],
            "toItemKey": prerequisite["itemKey"],
            "toName": relation["name"],
            "learnerExplanation": relation["explanation"],
            "sequenceApproved": True,
            "sequencePolicy": "conditional_prerequisite",
            "sequenceCondition": relation["condition"],
            "sequenceScope": {"domainIds": [DOMAIN], "areaIds": [economics_area]},
            "sourceReferences": relation["evidence"],
        })
    return


@lru_cache(maxsize=1)
def d078_guided_content() -> dict[str, Any]:
    master = _read(MASTER_PATH)
    domain_contract = _domain_contract_records(master["domain_contract"])
    domain_items: list[dict[str, Any]] = []
    area_items: dict[str, list[dict[str, Any]]] = {}
    for entry in master.get("domain_items", []):
        row = entry["source_record"]
        decision = entry["disposition"]
        # The consolidated master is the final disposition authority. Do not
        # re-gate an approved row on superseded readiness fields in its source
        # handoff; those fields are not the current approval decision.
        if decision.get("approval_status", "approved") != "approved":
            continue
        contract_row = domain_contract.get(row.get("item_id"))
        if not contract_row:
            raise ValueError(f"D078 domain item does not resolve to the embedded type/source contract: {row.get('item_id')}")
        runtime_decision = {
            **decision,
            "display_scope": decision.get("display_scope") or decision.get("student_scope") or decision.get("use_case"),
        }
        item = _domain_item(row, contract_row, runtime_decision)
        item["relationships"] = _approved_domain_relationships(contract_row, domain_contract)
        domain_items.append(_sanitize_student_narrative_fields(item))
    for area in master.get("areas", []):
        for entry in area.get("items", []):
            row = entry["source_record"]
            decision = entry["disposition"]
            if decision.get("approval_status", "approved") != "approved":
                continue
            # A supported alias is approved as content coverage but should
            # not create a duplicate learner choice beside its canonical card.
            if decision.get("learner_display_mode") == "consolidated_alias":
                continue
            runtime_decision = {
                **decision,
                "display_scope": decision.get("display_scope") or decision.get("student_scope") or decision.get("rationale"),
            }
            runtime_item = _area_item(row, runtime_decision)
            area_items.setdefault(row["area_id"], []).append(_sanitize_student_narrative_fields(runtime_item))
    _researched_area_tool_options(domain_items, area_items)
    _attach_approved_conditional_sequence_edges(domain_items, area_items)
    # Area and role additions are ordered display recommendations, never new
    # blockers. Apply the contract to tool-option rows added by enrichment too.
    for rows in area_items.values():
        for item in rows:
            item.setdefault("learningStage", "area_additions")
            item.setdefault("sequenceBand", "area_additions")
            item.setdefault("sequenceKind", "recommended" if item.get("requirementLevel") == "useful" else "optional")
            item.setdefault("sequenceOrder", None)
            item.setdefault("selectionGroup", None)
            item.setdefault("coLearningGroup", None)
            item.setdefault("displayWhyNext", "This area-owned addition follows the inherited domain path when its task fits.")
            item["blocksProgression"] = False
    return {"domainItems": domain_items, "areaItems": area_items, "approvedCount": len(domain_items) + sum(len(rows) for rows in area_items.values())}


def d078_domain_context_items() -> list[dict[str, Any]]:
    return [
        item for item in d078_guided_content()["domainItems"]
        if (item.get("requirementScope") or {}).get("student_eligible") is not False
        and (item.get("requirementScope") or {}).get("lane") != "unapproved"
    ]


def d078_area_context_items(area_id: str) -> list[dict[str, Any]]:
    return list(d078_guided_content()["areaItems"].get(area_id, []))


def merge_d078_context_items(existing: list[dict[str, Any]] | None, promoted: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Merge only explicitly approved D078 identities, preferring local review."""
    by_identity = {
        (str(row.get("itemType") or ""), str(row.get("itemKey") or "")): row
        for row in (existing or [])
    }
    for row in promoted:
        by_identity[(str(row.get("itemType") or ""), str(row.get("itemKey") or ""))] = row
    return sorted(by_identity.values(), key=lambda row: (row.get("priority") or "optional", row.get("itemType") or "", row.get("name") or ""))
