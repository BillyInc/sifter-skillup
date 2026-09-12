#!/usr/bin/env python3
"""Build the domain-owned guidance contract for every visible domain.

The programme/domain map and the occupational taxonomy are deliberately kept
separate here.  A domain foundation may use the domain definition, named
domain-level Nigerian evidence, and strong CCMAS curriculum anchors.  It must
not be assembled from role prevalence or role-owned tools.

Outputs:
  * global_guidance_contract.json (auditable intermediate data)
  * global_guidance_contract_audit.md (coverage and exclusions)
  * backend/migration_guidance_global_2026-09-11.sql (additive migration)
"""

from __future__ import annotations

import json
import re
import uuid
from collections import Counter, defaultdict
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
BACKEND = ROOT / "backend"
NS = uuid.UUID("5c1f7e00-0000-4000-8000-0000ca4ee401")


def load(relative: str):
    return json.loads((HERE / relative).read_text(encoding="utf-8"))


def clean(value: object) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    return "" if text.casefold() in {"nan", "none", "null"} else text


def sql_text(value: object) -> str:
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def sql_json(value: object) -> str:
    return sql_text(json.dumps(value, ensure_ascii=False, separators=(",", ":"))) + "::jsonb"


def stable_id(*parts: object) -> str:
    return str(uuid.uuid5(NS, "|".join(str(part) for part in parts)))


def slug_terms(text: str) -> set[str]:
    return {term for term in re.findall(r"[a-z0-9]+", text.casefold()) if len(term) > 3}


def first_sentences(text: str, count: int = 2) -> str:
    parts = [part.strip() for part in re.split(r"(?<=[.!?])\s+", text) if part.strip()]
    return " ".join(parts[:count]) or text


def remaining_sentences(text: str) -> str:
    parts = [part.strip() for part in re.split(r"(?<=[.!?])\s+", text) if part.strip()]
    return " ".join(parts[1:]) or text


def reference_url(domain_row: dict, item: str) -> str | None:
    """Use an exact source-backed reference, never a guessed course URL."""
    item_terms = slug_terms(item)
    sources = domain_row.get("global_sources") or []
    for source in sources:
        url = clean(source.get("url"))
        if url and source.get("evidence_type") in {"occupation_taxonomy", "international_occupation_standard"}:
            return url
    bodies = domain_row.get("nigerian_bodies") or []
    for body in bodies:
        url = clean(body.get("url"))
        if url:
            return url
    return None


def curriculum_index() -> dict[str, list[dict]]:
    evidence = load("_audit/programme_domain_evidence_2026-08-17.json")
    grouped: dict[str, list[dict]] = defaultdict(list)
    for row in evidence.values():
        if row.get("course_anchor_quality") == "strong":
            grouped[clean(row.get("domain_id"))].append(row)
    return grouped


def curriculum_anchor_summary(rows: list[dict]) -> tuple[list[str], list[str]]:
    """Return useful named anchors and their source locators."""
    frequency: Counter[str] = Counter()
    locators: dict[str, list[str]] = defaultdict(list)
    for row in rows:
        programme_key = clean(row.get("programme_key"))
        for anchor in row.get("course_anchors") or []:
            title = clean(anchor.get("title"))
            if not title:
                continue
            for phrase in anchor.get("matched_anchors") or []:
                phrase = clean(phrase)
                if phrase:
                    frequency[phrase] += 1
                    locators[phrase].append(f"{programme_key} / {title}")
    # Avoid generic labels that do not help a student understand a domain.
    generic = {"science", "study", "research", "methods", "method", "work", "people", "technology"}
    phrases = [phrase for phrase, _ in frequency.most_common() if phrase.casefold() not in generic]
    anchors: list[str] = []
    sources: list[str] = []
    for phrase in phrases:
        if any(slug_terms(phrase) & slug_terms(existing) for existing in anchors):
            continue
        anchors.append(phrase)
        sources.append("; ".join(dict.fromkeys(locators[phrase][:4])))
        if len(anchors) == 2:
            break
    return anchors, sources


def add_foundation(
    rows: list[dict],
    *,
    domain_id: str,
    stage: str,
    item_name: str,
    priority_reason: str,
    evidence_note: str,
    resource_url: str | None,
    display_order: int,
    provenance: dict,
) -> None:
    item_name = clean(item_name)
    if not item_name or any(row["item_name"].casefold() == item_name.casefold() for row in rows):
        return
    rows.append({
        "domain_id": domain_id,
        "stage": stage,
        "item_name": item_name,
        "priority_reason": priority_reason,
        "evidence_note": evidence_note,
        "resource_url": resource_url,
        "display_order": display_order,
        "source_confidence": "high",
        "data_state": "source_backed",
        "source_provenance": provenance,
    })


def build() -> dict:
    meta = load("domain_meta.json")
    structure = load("domain_structure.json")
    audit = load("domain_skill_competency_certification_audit.json")
    curriculum = curriculum_index()
    programme_domain_map = load("programme_domain_final.json")
    programmes_by_domain: dict[str, list[str]] = defaultdict(list)
    for programme_key, value in programme_domain_map.items():
        programme_name = programme_key.split("::", 1)[-1]
        for link in (value.get("links") if isinstance(value, dict) else value) or []:
            domain_id = clean(link.get("domain_id"))
            if domain_id and programme_name and programme_name not in programmes_by_domain[domain_id]:
                programmes_by_domain[domain_id].append(programme_name)
    domains: list[dict] = []
    foundations: list[dict] = []
    orientations: dict[str, dict] = {}
    excluded: list[dict] = []

    for domain_row in audit.get("domains", []):
        domain_id = clean(domain_row.get("domain_id"))
        if not domain_id or domain_id not in meta:
            continue
        # D078 is retained as the hand-reviewed worked example. The global
        # migration must not overwrite its more carefully written rows.
        if domain_id == "D078":
            excluded.append({"domain_id": domain_id, "reason": "hand_reviewed Sociology contract retained"})
            continue
        domain_meta = meta[domain_id]
        name = clean(domain_meta.get("domain_name"))
        description = clean(domain_meta.get("description"))
        web = domain_row.get("nigerian_web_evidence") or {}
        skills = [clean(value) for value in web.get("skills") or [] if clean(value)]
        competencies = [clean(value) for value in web.get("competencies") or [] if clean(value)]
        subgroups = structure.get(domain_id, {}).get("subgroups") or []
        curriculum_rows = curriculum.get(domain_id, [])
        anchors, anchor_sources = curriculum_anchor_summary(curriculum_rows)

        orientation = {
            "whatItStudies": description or f"{name} is a field with its own knowledge, methods and work settings.",
            "whatPeopleDo": remaining_sentences(description) if description else f"People in {name} apply this field's knowledge and methods in the settings described by the source records.",
            "questions": [
                f"What does {name} help people understand, create or solve?",
                f"What evidence, methods or outputs are used in {name}?",
                f"Where is {name} applied, and what further preparation can a chosen area require?",
            ],
            "whereProgrammeFits": f"Programmes connect to {name} only where their recorded curriculum supports the mapped relationship.",
            "relatedProgrammes": programmes_by_domain.get(domain_id, [])[:8],
        }
        orientations[domain_id] = orientation

        domain_foundations: list[dict] = []
        definition_note = description or f"The current source-backed definition for {name}."
        add_foundation(
            domain_foundations,
            domain_id=domain_id,
            stage="start_here",
            item_name=f"Understand {name}",
            priority_reason=f"Start here because the domain definition explains the field before a student chooses a specialised area or role.",
            evidence_note=f"Domain definition: {definition_note}",
            resource_url=reference_url(domain_row, name),
            display_order=1,
            provenance={"source": "domain_definition_library_and_domain_meta", "domain_id": domain_id},
        )

        order = 2
        # These are explicitly named domain-level Nigerian evidence, not role
        # prevalence. Keep the set short enough for a first screen.
        for item, kind in [(value, "competency") for value in competencies[:2]] + [(value, "skill") for value in skills[:2]]:
            add_foundation(
                domain_foundations,
                domain_id=domain_id,
                stage="build_next",
                item_name=item,
                priority_reason=f"Build this next because the checked domain evidence names it as part of {name} work and preparation.",
                evidence_note=f"Named domain-level Nigerian evidence ({kind}); it is a guidance starting point, not a universal checklist.",
                resource_url=reference_url(domain_row, item),
                display_order=order,
                provenance={"source": "nigerian_web_source_evidence", "domain_id": domain_id, "evidence_kind": kind},
            )
            order += 1

        for index, (anchor, source) in enumerate(zip(anchors, anchor_sources), start=0):
            add_foundation(
                domain_foundations,
                domain_id=domain_id,
                stage="build_next",
                item_name=f"Understand {anchor}",
                priority_reason="Build this after the orientation because strong CCMAS curriculum anchors show the concept is taught in programmes mapped to this domain.",
                evidence_note=f"CCMAS curriculum anchors: {source or 'strong curriculum evidence recorded for this domain.'}",
                resource_url=reference_url(domain_row, anchor),
                display_order=order + index,
                provenance={"source": "ccmas_programme_domain_evidence", "domain_id": domain_id, "anchor": anchor},
            )
        order = max([row["display_order"] for row in domain_foundations] or [1]) + 1

        if subgroups:
            labels = [clean(item.get("label")) for item in subgroups if clean(item.get("label"))]
            label_text = ", ".join(labels[:4])
            if len(labels) > 4:
                label_text += f" and {len(labels) - 4} more areas"
            add_foundation(
                domain_foundations,
                domain_id=domain_id,
                stage="choose_area",
                item_name="Compare the areas inside this domain",
                priority_reason="Choose an area after understanding the shared foundation; each area adds a different set of methods, capabilities and roles.",
                evidence_note=f"Current subgroup records: {label_text}.",
                resource_url=None,
                display_order=order,
                provenance={"source": "domain_structure", "domain_id": domain_id, "subgroup_count": len(labels)},
            )
        else:
            add_foundation(
                domain_foundations,
                domain_id=domain_id,
                stage="choose_area",
                item_name="Explore the roles recorded in this domain",
                priority_reason="This domain has no separate subgroup record, so the next step is to compare the roles attached directly to the domain.",
                evidence_note="No subgroup was recorded in the current domain structure; no subgroup name was invented.",
                resource_url=None,
                display_order=order,
                provenance={"source": "domain_structure", "domain_id": domain_id, "subgroup_count": 0},
            )
        foundations.extend(domain_foundations)
        domains.append({
            "domain_id": domain_id,
            "name": name,
            "cluster": clean(domain_meta.get("cluster")),
            "orientation": orientation,
            "foundation_rows": len(domain_foundations),
            "domain_evidence_skills": len(skills),
            "domain_evidence_competencies": len(competencies),
            "strong_curriculum_links": len(curriculum_rows),
            "subgroups": len(subgroups),
            "foundation_items": [row["item_name"] for row in domain_foundations],
        })

    return {
        "schema_version": "2026-09-11.global-guidance-contract.v1",
        "purpose": "Domain-owned foundations and orientation for the full programme-to-domain-to-subgroup-to-role model.",
        "rules": {
            "domain_foundation": "domain definition + named domain evidence + strong CCMAS curriculum anchors; never role prevalence",
            "subgroup": "inherits the domain foundation and adds subgroup-specific records, methods, tools and resources",
            "role": "inherits domain/subgroup context and adds role work, skills, tools, credentials and role resources",
            "programme_relationship": "direct, functional and adjacent edges retain their evidence and downstream route",
        },
        "coverage": {
            "visible_domains": len(domains) + len(excluded),
            "generated_domains": len(domains),
            "foundation_rows": len(foundations),
            "preserved_reviewed_domains": len(excluded),
            "excluded_from_global_replacement": excluded,
            "domains_with_curriculum": sum(1 for row in domains if row["strong_curriculum_links"]),
            "domains_with_domain_skills": sum(1 for row in domains if row["domain_evidence_skills"]),
            "domains_with_domain_competencies": sum(1 for row in domains if row["domain_evidence_competencies"]),
        },
        "domains": domains,
        "foundations": foundations,
        "orientations": orientations,
    }


def render_sql(contract: dict) -> str:
    lines = [
        "-- Global source-grounded programme -> domain -> subgroup -> role guidance contract.",
        "-- Generated by data/career-mapping/_build_global_guidance_contract.py.",
        "-- Run after migration_guidance_ownership_and_sociology_resources_2026-09-11.sql.",
        "-- D078 is intentionally preserved by the Sociology worked-example migration.",
        "BEGIN;",
        "",
        "ALTER TABLE skillup_dev.career_learning_resources",
        "    ADD COLUMN IF NOT EXISTS programme_id UUID REFERENCES skillup_dev.programmes(id) ON DELETE CASCADE,",
        "    ADD COLUMN IF NOT EXISTS ownership_scope TEXT CHECK (ownership_scope IN ('programme','domain','subgroup','role','audit_only')),",
        "    ADD COLUMN IF NOT EXISTS review_status TEXT CHECK (review_status IN ('approved_guidance_v1','review_only','unverified'));",
        "",
        "ALTER TABLE skillup_dev.domain_tools",
        "    ADD COLUMN IF NOT EXISTS guidance_owner TEXT CHECK (guidance_owner IN ('domain','subgroup','role','role_aggregated','review_only'));",
        "",
        "CREATE TABLE IF NOT EXISTS skillup_dev.career_guidance_foundations (",
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
        "    domain_id UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,",
        "    stage TEXT NOT NULL CHECK (stage IN ('start_here','build_next','choose_area','prepare_for_role')),",
        "    item_name TEXT NOT NULL,",
        "    priority_reason TEXT NOT NULL,",
        "    evidence_note TEXT NOT NULL,",
        "    resource_url TEXT CHECK (resource_url IS NULL OR resource_url ~ '^https://'),",
        "    display_order INTEGER NOT NULL DEFAULT 0,",
        "    source_confidence TEXT NOT NULL DEFAULT 'high',",
        "    data_state TEXT NOT NULL DEFAULT 'source_backed',",
        "    source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,",
        "    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),",
        "    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),",
        "    UNIQUE(domain_id, item_name)",
        ");",
        "CREATE INDEX IF NOT EXISTS idx_global_guidance_foundations_domain_stage ON skillup_dev.career_guidance_foundations(domain_id, stage, display_order);",
        "",
        "-- Domain/subgroup tool rows currently come from occupational aggregation unless",
        "-- an explicit owner has been recorded. Keep them available for audit only.",
        "UPDATE skillup_dev.domain_tools",
        "SET guidance_owner = CASE",
        "    WHEN role_id IS NOT NULL OR scope = 'role' THEN 'role'",
        "    WHEN (source_provenance ->> 'ownership') = 'domain_owned' THEN 'domain'",
        "    WHEN (source_provenance ->> 'ownership') = 'subgroup_owned' THEN 'subgroup'",
        "    WHEN guidance_owner IS NULL THEN 'role_aggregated'",
        "    ELSE guidance_owner END",
        "WHERE guidance_owner IS NULL OR guidance_owner = 'review_only';",
        "",
        "-- Classify legacy resource rows without silently promoting role aggregates.",
        "UPDATE skillup_dev.career_learning_resources",
        "SET ownership_scope = CASE",
        "    WHEN programme_id IS NOT NULL THEN 'programme'",
        "    WHEN role_id IS NOT NULL THEN 'role'",
        "    WHEN subgroup_id IS NOT NULL THEN 'subgroup'",
        "    WHEN domain_id IS NOT NULL THEN 'domain'",
        "    ELSE 'audit_only' END",
        "WHERE ownership_scope IS NULL;",
        "UPDATE skillup_dev.career_learning_resources",
        "SET ownership_scope = 'audit_only'",
        "WHERE ownership_scope = 'domain' AND resource_type = 'tool_learning'",
        "   OR ownership_scope = 'domain' AND resource_type = 'skill_reference' AND (source_provenance ->> 'source') = 'esco';",
        "UPDATE skillup_dev.career_learning_resources",
        "SET review_status = CASE",
        "    WHEN (source_provenance ->> 'guidance_layer') IS NOT NULL THEN 'approved_guidance_v1'",
        "    WHEN ownership_scope = 'audit_only' THEN 'review_only'",
        "    WHEN ownership_scope = 'programme' THEN 'approved_guidance_v1'",
        "    WHEN ownership_scope = 'domain' AND resource_type IN ('domain_overview','professional_body','competency_reference') THEN 'approved_guidance_v1'",
        "    WHEN ownership_scope = 'domain' AND resource_type = 'certification_exam' AND data_state = 'source_backed' THEN 'approved_guidance_v1'",
        "    WHEN ownership_scope = 'subgroup' AND resource_type IN ('skill_reference','tool_learning') THEN 'approved_guidance_v1'",
        "    WHEN ownership_scope = 'role' AND resource_type IN ('role_reference','skill_reference','tool_learning') THEN 'approved_guidance_v1'",
        "    ELSE 'review_only' END",
        "WHERE review_status IS NULL;",
        "",
        "-- Replace only this generated global layer; preserve the hand-reviewed D078 layer.",
        "DELETE FROM skillup_dev.career_guidance_foundations",
        "WHERE source_provenance ->> 'guidance_layer' = 'global_domain_foundation_v1';",
        "",
    ]

    for domain_id, orientation in sorted(contract["orientations"].items()):
        if domain_id == "D078":
            continue
        lines.extend([
            "UPDATE skillup_dev.domains",
            f"SET source_provenance = COALESCE(source_provenance, '{{}}'::jsonb) || {sql_json({'student_orientation': orientation, 'guidance_contract': 'global_domain_foundation_v1'})}",
            f"WHERE domain_key = {sql_text(domain_id)};",
        ])
    lines.append("")

    rows = [row for row in contract["foundations"] if row["domain_id"] != "D078"]
    lines.append("INSERT INTO skillup_dev.career_guidance_foundations")
    lines.append("    (domain_id, stage, item_name, priority_reason, evidence_note, resource_url, display_order, source_confidence, data_state, source_provenance)")
    lines.append("SELECT d.id, r.stage, r.item_name, r.priority_reason, r.evidence_note, r.resource_url, r.display_order, 'high', 'source_backed', r.source_provenance::jsonb")
    lines.append("FROM skillup_dev.domains d JOIN (VALUES")
    values = []
    for row in rows:
        values.append("    (" + ", ".join([
            sql_text(row["domain_id"]), sql_text(row["stage"]), sql_text(row["item_name"]),
            sql_text(row["priority_reason"]), sql_text(row["evidence_note"]),
            sql_text(row["resource_url"]), str(row["display_order"]), sql_text(json.dumps({**row["source_provenance"], "guidance_layer": "global_domain_foundation_v1", "ownership": "domain_owned"}, ensure_ascii=False)),
        ]) + ")")
    lines.append(",\n".join(values))
    lines.append(") AS r(domain_key, stage, item_name, priority_reason, evidence_note, resource_url, display_order, source_provenance) ON d.domain_key = r.domain_key")
    lines.append("ON CONFLICT (domain_id, item_name) DO UPDATE SET stage = EXCLUDED.stage, priority_reason = EXCLUDED.priority_reason, evidence_note = EXCLUDED.evidence_note, resource_url = EXCLUDED.resource_url, display_order = EXCLUDED.display_order, source_confidence = EXCLUDED.source_confidence, data_state = EXCLUDED.data_state, source_provenance = EXCLUDED.source_provenance;")
    lines.extend(["", "COMMIT;", ""])
    return "\n".join(lines)


def render_audit(contract: dict) -> str:
    coverage = contract["coverage"]
    lines = [
        "# Global guidance contract audit",
        "",
        "Generated by `_build_global_guidance_contract.py`.",
        "",
        "## Contract",
        "",
        "- Domain foundation: domain definition, named domain evidence and strong CCMAS curriculum anchors.",
        "- Subgroup: inherits the domain foundation and adds subgroup-specific methods, capabilities, tools and resources.",
        "- Role: inherits the domain/subgroup context and adds role work, skills, tools, credentials and role resources.",
        "- Direct, functional and adjacent edges remain programme-to-domain evidence; downstream guidance is reached through the selected domain and its recorded subgroups/roles.",
        "- Role prevalence and role-aggregated tools are audit-only and are not used as domain foundation content.",
        "",
        "## Coverage",
        "",
        f"- Visible domains covered: **{coverage['visible_domains']}** ({coverage['generated_domains']} generated globally; {coverage['preserved_reviewed_domains']} preserved as a reviewed worked example)",
        f"- Domain foundation rows generated: **{coverage['foundation_rows']}**",
        f"- Domains with strong CCMAS curriculum evidence: **{coverage['domains_with_curriculum']}**",
        f"- Domains with named domain-level skills: **{coverage['domains_with_domain_skills']}**",
        f"- Domains with named domain-level competencies: **{coverage['domains_with_domain_competencies']}**",
        "- Sociology/D078 is excluded from replacement so the reviewed worked example remains authoritative for that slice.",
        "",
        "## Intentional exclusions",
        "",
        "- O*NET role-frequency tools remain available to audit/admin surfaces only until explicit domain ownership is recorded.",
        "- Generic provider homepages are not promoted to specific courses by this contract.",
        "- A role is not shown as a domain foundation merely because its skill appears frequently across role records.",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    contract = build()
    (HERE / "global_guidance_contract.json").write_text(json.dumps(contract, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (HERE / "GLOBAL_GUIDANCE_CONTRACT_AUDIT.md").write_text(render_audit(contract), encoding="utf-8")
    (BACKEND / "migration_guidance_global_2026-09-11.sql").write_text(render_sql(contract), encoding="utf-8")
    print(json.dumps(contract["coverage"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
