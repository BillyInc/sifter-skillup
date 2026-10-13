"""Reconcile JAMB -> CCMAS -> domain mappings at the JAMB-name level.

This is the narrow gate requested for the current phase. It does not manually
audit every CCMAS course row. It checks all 420 JAMB mappings and uses selected
course rows as supporting evidence to detect missing, stale or contradictory
data. It never promotes a candidate to a confirmed mapping automatically.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from run_jamb_ccmas_deterministic_discovery_2026_09_28 import resolve_course_source_row


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
PROGRAMME_MAPPING = ROOT / "programme_mapping.json"
INHERITANCE = AUDIT / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
JAMB_DOMAIN_MAP = ROOT / "jamb_domain_map.json"
PROGRAMME_DOMAIN_SCORES = ROOT / "programme_domain_scores.json"
CCMAS_DIR = ROOT / "ccmas"
RUN_DATE = date.today().isoformat()
OUT_JSON = AUDIT / f"jamb_ccmas_domain_mapping_reconciliation_{RUN_DATE}.json"
OUT_MD = AUDIT / f"jamb_ccmas_domain_mapping_reconciliation_{RUN_DATE}.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().casefold()


def code_norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().upper()


def course_signature(course: dict[str, Any]) -> dict[str, Any]:
    # Parsed CCMAS packages call this field ``skills_learned`` while the JAMB
    # scope contract calls the same source-derived learning statements
    # ``learning_outcomes``.  Treat the established aliases as equivalent;
    # otherwise every correctly copied course outcome is reported as a false
    # mismatch.
    # In the extracted CCMAS packages, ``skills_learned`` is the source-PDF
    # field. Some later repair artifacts also carry a ``learning_outcomes``
    # field; preferring that field here can compare a correct JAMB snapshot to
    # a stale secondary copy and manufacture a mismatch. Use the source field
    # first, while retaining aliases for scope records and older data.
    outcomes = course.get("skills_learned") or course.get("learning_outcomes") or course.get("outcomes") or []
    return {
        "title": norm(course.get("title")),
        "units": course.get("units"),
        "status": course.get("status"),
        "lecture_hours": course.get("lecture_hours", course.get("lh")),
        "practical_hours": course.get("practical_hours", course.get("ph")),
        "content_summary": norm(course.get("content_summary")),
        "learning_outcomes": [norm(item) for item in outcomes],
    }


def selected_course_signature(course: dict[str, Any]) -> dict[str, Any]:
    return {
        "title": norm(course.get("title")),
        "units": course.get("units"),
        "status": course.get("status"),
        "lecture_hours": course.get("lecture_hours"),
        "practical_hours": course.get("practical_hours"),
        "content_summary": norm(course.get("content_summary")),
        "learning_outcomes": [norm(item) for item in course.get("learning_outcomes") or []],
    }


def load_ccmas() -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for path in sorted(CCMAS_DIR.glob("*.json")):
        data = load(path)
        for programme in data.get("programmes", []):
            key = f"{data.get('discipline')}::{programme.get('name')}"
            result[key] = {
                "source_file": path.name,
                "discipline": data.get("discipline"),
                "programme": programme.get("name"),
                "code": programme.get("code"),
                "courses": {},
            }
            for course in programme.get("courses", []):
                if course.get("code"):
                    result[key]["courses"].setdefault(code_norm(course.get("code")), []).append(course)
            result[f"{path.name}::{programme.get('name')}"] = result[key]
    return result


def component_key_from_ref(ref: str) -> str:
    return ref


def link_key(link: dict[str, Any]) -> tuple[Any, Any]:
    return link.get("domain_id"), link.get("match_type")


def custom_component_source_evidence(scope: dict[str, Any] | None, inherited_components: list[str]) -> dict[str, Any] | None:
    """Check source evidence once per declared custom component.

    Programme sources belong to the programme/component record, not repeated
    on every course row. A repo bundle is supported when its resolved
    component-level evidence identifies either its external source(s) or the
    exact CCMAS packages from which its courses were assembled.
    """
    custom_components = [component for component in inherited_components if "custom" in component.casefold() or "external" in component.casefold()]
    if not custom_components or not scope:
        return None
    selected_courses = list(scope.get("selected_courses") or [])
    components = (scope.get("source_context") or {}).get("components") or []
    component_by_ref = {str(item.get("component_ref")): item for item in components if item.get("component_ref")}
    resolved = []
    for component_ref in custom_components:
        record = component_by_ref.get(component_ref)
        if record and record.get("status") == "resolved" and record.get("source_evidence"):
            resolved.append(record)
            continue
        # Manually adjudicated mixed scopes keep programme/component citations
        # in scope_evidence rather than the generated source_context structure.
        # Accept that programme-level record once; do not require repeating its
        # citation on every selected course.
        evidence = list(scope.get("scope_evidence") or [])
        component_name = component_ref.split("::", 1)[-1].casefold()
        matching = [item for item in evidence if item.get("url") and item.get("authority")
                    and item.get("locator") and item.get("accessed_on") and item.get("supports")
                    and (component_name in str(item.get("title", "")).casefold()
                         or component_name in str(item.get("supports", "")).casefold()
                         or component_name in str(item.get("locator", "")).casefold())]
        if not matching:
            return None
        resolved.append({"component_ref": component_ref, "status": "resolved", "source_evidence": matching})
    if not selected_courses:
        return None
    return {
        "kind": "custom_component_source_evidence_complete",
        "components": custom_components,
        "selected_course_count": len(selected_courses),
        "component_source_evidence": [record["source_evidence"] for record in resolved],
    }


def main() -> None:
    programme_mapping = {row["jamb_name"]: row for row in load(PROGRAMME_MAPPING)["mappings"]}
    inheritance = {row["jamb_name"]: row for row in load(INHERITANCE)["rows"]}
    scopes = {row["jamb_name"]: row for row in load(SCOPES)["rows"]}
    jamb_domain = load(JAMB_DOMAIN_MAP)
    programme_scores = load(PROGRAMME_DOMAIN_SCORES)
    ccmas = load_ccmas()

    names = sorted(set(programme_mapping) | set(inheritance) | set(scopes) | set(jamb_domain))
    rows: list[dict[str, Any]] = []
    counts = Counter()
    for jamb_name in names:
        mapping = programme_mapping.get(jamb_name)
        inherited = inheritance.get(jamb_name)
        scope = scopes.get(jamb_name)
        domain = jamb_domain.get(jamb_name, {})
        issues: list[dict[str, Any]] = []
        evidence: list[dict[str, Any]] = []

        if not mapping or not inherited or not scope or not domain:
            issues.append({"kind": "missing_mapping_layer", "details": {"programme_mapping": bool(mapping), "inheritance": bool(inherited), "scope": bool(scope), "domain_map": bool(domain)}})
        if mapping and inherited and mapping.get("ccmas_code") and inherited.get("primary_component", {}).get("code") != mapping.get("ccmas_code"):
            issues.append({"kind": "primary_ccmas_code_disagrees", "details": {"programme_mapping": mapping.get("ccmas_code"), "inheritance": inherited.get("primary_component", {}).get("code")}})

        inherited_components = sorted(inherited.get("component_refs", [])) if inherited else []
        domain_components = sorted(domain.get("ccmas_components", [])) if domain else []
        if inherited_components != domain_components:
            issues.append({"kind": "domain_map_component_set_disagrees", "details": {"inheritance": inherited_components, "domain_map": domain_components}})
        scope_components = sorted(scope.get("component_refs", [])) if scope else []
        if inherited_components != scope_components:
            issues.append({"kind": "scope_component_set_disagrees", "details": {"inheritance": inherited_components, "scope": scope_components}})

        inherited_codes = sorted(code_norm(code) for code in (inherited.get("curriculum_scope", {}).get("selected_course_codes", []) if inherited else []))
        domain_codes = sorted(code_norm(code) for code in (domain.get("curriculum_scope", {}).get("selected_course_codes", []) if domain else []))
        if inherited_codes != domain_codes:
            issues.append({"kind": "domain_map_selected_course_set_disagrees", "details": {"inheritance_only": sorted(set(inherited_codes) - set(domain_codes)), "domain_only": sorted(set(domain_codes) - set(inherited_codes))}})

        selected_courses = (scope or {}).get("selected_courses", [])
        selected_by_code: dict[str, list[dict[str, Any]]] = {}
        for course in selected_courses:
            selected_by_code.setdefault(code_norm(course.get("code")), []).append(course)
        for code, selected_rows in sorted(selected_by_code.items()):
            for selected in selected_rows:
                source_file = selected.get("source_ccmas_file")
                source_programme = selected.get("source_ccmas_programme")
                source_key = f"{source_file}::{source_programme}" if source_file and source_programme else ""
                source = ccmas.get(source_key)
                source_courses = source.get("courses", {}).get(code, []) if source else []
                if not source_courses:
                    # A custom/external course is intentionally absent from
                    # the CCMAS catalogue.  Once the local scope carries an
                    # item-specific external source, absence from CCMAS is
                    # no longer a missing-CCMAS defect; the external
                    # component gate below still keeps the programme out of
                    # confirmed status until its offering/downstream review.
                    if selected.get("source_kind") == "external_curriculum" and selected.get("source_url"):
                        evidence.append({"kind": "external_course_source_attached", "code": code, "source_url": selected.get("source_url"), "source_locator": selected.get("source_locator")})
                        continue
                    if not source_key and any("__custom__" in component for component in inherited_components):
                        # This course is attached to a declared custom bundle,
                        # not to a CCMAS package. Its missing CCMAS locator is
                        # expected; source provenance for the custom bundle is
                        # assessed separately below and must not inflate the
                        # CCMAS course-missing count.
                        continue
                    issues.append({"kind": "selected_course_not_found_in_current_ccmas", "details": {"code": code, "source_key": source_key, "title": selected.get("title")}})
                    continue
                selected_sig = selected_course_signature(selected)
                # A CCMAS programme can repeat a code under multiple pathway
                # headings.  Accept the JAMB snapshot when it exactly matches
                # any source variant; otherwise compare it with the first
                # source variant and retain the mismatch for review.
                matching_source = next(
                    (course for course in source_courses if course_signature(course) == selected_sig),
                    None,
                )
                if matching_source is not None:
                    evidence.append({
                        "kind": "selected_course_matches_duplicate_ccmas_variant",
                        "code": code,
                        "source_key": source_key,
                    })
                    continue
                # A CCMAS package may legitimately reuse a course code for
                # multiple pathway variants.  Comparing against the first
                # row creates false JAMB↔CCMAS mismatches whenever the
                # selected title/workload identifies another valid variant.
                # Reuse the same deterministic resolver used by the source
                # discovery pass; never collapse duplicate-code variants by
                # list position.
                source_course = resolve_course_source_row(selected, source_courses)
                if source_course is None:
                    issues.append({
                        "kind": "selected_course_source_variant_ambiguous",
                        "details": {
                            "code": code,
                            "source_key": source_key,
                            "candidate_count": len(source_courses),
                            "title": selected.get("title"),
                        },
                    })
                    continue
                source_sig = course_signature(source_course)
                differing_fields = [field for field in source_sig if source_sig[field] != selected_sig[field]]
                if differing_fields:
                    issues.append({"kind": "selected_course_details_disagree_with_ccmas", "details": {"code": code, "source_key": source_key, "fields": differing_fields, "source": source_sig, "selected": selected_sig}})

        scoped_titles = {norm(course.get("title")) for course in selected_courses if course.get("title")}
        component_score_links: set[tuple[Any, Any]] = set()
        for component in inherited_components:
            score = programme_scores.get(component)
            if score:
                component_score_links.update(link_key(link) for link in score.get("links", []))
        domain_links = domain.get("links", []) if domain else []
        for link in domain_links:
            if link.get("scope_course_titles") and not set(norm(title) for title in link["scope_course_titles"]).issubset(scoped_titles):
                issues.append({"kind": "domain_link_references_unselected_course", "details": {"domain_id": link.get("domain_id"), "titles": link.get("scope_course_titles")}})
            if component_score_links and link_key(link) not in component_score_links:
                issues.append({"kind": "domain_link_not_present_in_component_score_catalogue", "details": {"domain_id": link.get("domain_id"), "match_type": link.get("match_type"), "components": inherited_components}})

        if (scope or {}).get("scope_status", "").endswith("review_required") or (domain or {}).get("mapping_status") == "review_required":
            issues.append({"kind": "mapping_explicitly_held_for_review", "details": {"scope_status": (scope or {}).get("scope_status"), "mapping_status": (domain or {}).get("mapping_status")}})
        custom_evidence = custom_component_source_evidence(scope, inherited_components)
        if custom_evidence:
            evidence.append(custom_evidence)
        elif any("external" in str(component).casefold() or "custom" in str(component).casefold() for component in inherited_components):
            issues.append({"kind": "external_component_requires_source_check", "details": {"components": inherited_components}})

        disposition = "consistent_local_reconciliation" if not issues else "reconcile_or_source_review"
        counts[disposition] += 1
        for issue in issues:
            counts[f"issue:{issue['kind']}"] += 1
        for item in evidence:
            counts[f"evidence:{item['kind']}"] += 1
        rows.append({
            "jamb_name": jamb_name,
            "mapping_type": (mapping or {}).get("mapping_type"),
            "jamb_faculty": (mapping or {}).get("jamb_faculty"),
            "ccmas_components": inherited_components,
            "selected_course_count": len(selected_courses),
            "domain_link_count": len(domain_links),
            "disposition": disposition,
            "issues": issues,
            "evidence": evidence,
        })

    report = {
        "schema": "2026-09-29.jamb-ccmas-domain-mapping-reconciliation.v1",
        "generated_on": RUN_DATE,
        "status": "all_jamb_names_reconciled_locally_source_review_or_repair_open",
        "scope": {"jamb_names": len(names), "programme_mapping_rows": len(programme_mapping), "inheritance_rows": len(inheritance), "scope_rows": len(scopes), "domain_map_rows": len(jamb_domain)},
        "counts": dict(sorted(counts.items())),
        "rows": rows,
        "limits": [
            "This proves internal ledger agreement or identifies a mismatch; it does not by itself prove that a source interpretation is semantically correct.",
            "A source review is required for compound titles, external components, held mappings and any selected course detail mismatch.",
            "Programme-level source citations belong on the programme/component record; detailed locators remain audit evidence rather than repeated student display data.",
        ],
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        f"# JAMB → CCMAS → domain mapping reconciliation — {RUN_DATE}",
        "",
        "This checks all JAMB names against the mapping ledgers and their selected CCMAS course evidence. It is the reconciliation gate before downstream correction.",
        "",
        "## Scope",
        "",
    ]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in report["scope"].items())
    lines += ["", "## Results", ""]
    lines.extend(f"- `{key}`: {value}" for key, value in sorted(counts.items()))
    lines += ["", "## Disposition", "", "Rows marked `consistent_local_reconciliation` agree across the local mapping layers and selected course records. Rows marked `reconcile_or_source_review` contain an explicit mismatch, a held mapping, or a source-dependent case and must be corrected or source-adjudicated before downstream remapping.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "scope": report["scope"], "counts": report["counts"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
