"""Audit all programme guidance contracts against the Sociology failure modes.

This is a read-only scaling gate.  It inspects the parsed CCMAS programmes,
the generic and Sociology curriculum contracts, the programme-to-domain map,
and the compressed contextual catalogue.  It does not alter source data,
generate replacement data, apply SQL, fetch URLs, or promote a relationship.

The checks intentionally report missing contract fields separately from missing
external resources.  A catalogue row without a link-state field is therefore
reported as an *unlabelled link state*, not as proof that no useful resource
exists.
"""

from __future__ import annotations

import gzip
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable


HERE = Path(__file__).resolve().parent
CCMAS_DIR = HERE / "ccmas"
AUDIT_DIR = HERE / "_audit"
GENERIC_CONTRACT_AUDIT = AUDIT_DIR / "programme_curriculum_contract_2026-09-18.json"
SOCIOLOGY_CONTRACT = AUDIT_DIR / "sociology_curriculum_contract_2026-09-17.json"
SOURCE_REVIEW = AUDIT_DIR / "ccmas_original_source_review_2026-09-18.json"
PROGRAMME_DOMAIN_MAP = HERE / "programme_domain_final.json"
CONTEXTUAL_CATALOGUE = HERE / "contextual_guidance_items.json.gz"
OUT_JSON = AUDIT_DIR / "programme_scaling_contract_2026-09-19.json"
OUT_MD = AUDIT_DIR / "PROGRAMME_SCALING_CONTRACT_AUDIT_2026-09-19.md"

AUDIT_DATE = "2026-09-19"
VALID_CONTEXT_LEVELS = {"domain", "subgroup", "role"}
VALID_DATA_STATES = {"source_backed", "limited", "partial", "review_only", "audit_only", "not_established", "unverified"}
LINK_STATE_KEYS = {
    "resource_url",
    "resource_urls",
    "learning_url",
    "link_url",
    "verified_resource_url",
    "resource_links",
    "resource_status",
    "link_status",
    "no_link_reason",
    "noLinkReason",
}
ROLE_AGGREGATE_MARKERS = re.compile(
    r"\b(?:role[ -]aggregate|role[ -]frequency|role[ -]prevalence|"
    r"national aggregate|aggregate foundation|frequency aggregate)\b",
    re.IGNORECASE,
)
ANNOTATION_RE = re.compile(r"\s+>\s+\*\*\[[^]]+\]:\*\*", re.IGNORECASE)


def norm(value: Any) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", text.casefold()).strip()


def key_for(discipline: Any, programme: Any) -> str:
    return f"{discipline or ''}::{programme or ''}"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_programmes() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for source_path in sorted(CCMAS_DIR.glob("*.json")):
        payload = read_json(source_path)
        for programme in payload.get("programmes") or []:
            rows.append(
                {
                    "discipline": payload.get("discipline"),
                    "sourceFile": source_path.name,
                    "sourcePayload": payload,
                    "programme": programme,
                }
            )
    return rows


def load_source_review() -> dict[tuple[str, str, str, str], dict[str, Any]]:
    if not SOURCE_REVIEW.exists():
        return {}
    payload = read_json(SOURCE_REVIEW)
    result: dict[tuple[str, str, str, str], dict[str, Any]] = {}
    for row in payload.get("courseRows") or []:
        result[
            (
                row.get("discipline") or "",
                row.get("programme") or "",
                row.get("courseCode") or "",
                row.get("courseTitle") or "",
            )
        ] = row
    return result


def source_locator(
    source_file: str,
    payload: dict[str, Any],
    programme: dict[str, Any],
    course: dict[str, Any],
    index: int,
    review: dict[str, Any] | None,
) -> dict[str, Any]:
    return {
        "sourceFile": source_file,
        "parsedSource": payload.get("source_file"),
        "originalPdf": (review or {}).get("originalPdf"),
        "courseCode": course.get("code"),
        "courseTitle": course.get("title"),
        "programme": programme.get("name"),
        "discipline": payload.get("discipline"),
        "outcomeIndex": index,
    }


def build_generic_contract_rows(
    row: dict[str, Any],
    reviews: dict[tuple[str, str, str, str], dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    programme = row["programme"]
    payload = row["sourcePayload"]
    outcomes: list[dict[str, Any]] = []
    for course in programme.get("courses") or []:
        review = reviews.get(
            (
                payload.get("discipline") or "",
                programme.get("name") or "",
                course.get("code") or "",
                course.get("title") or "",
            )
        )
        data_state = (review or {}).get("dataState", "source_backed")
        for index, value in enumerate(course.get("skills_learned") or []):
            if not isinstance(value, str) or not value.strip():
                continue
            source_text = ANNOTATION_RE.split(value, maxsplit=1)[0].strip().rstrip(" -;.")
            if not source_text:
                continue
            outcomes.append(
                {
                    "sourceText": source_text,
                    "studentText": source_text,
                    "studentDisplay": data_state == "source_backed",
                    "dataState": data_state,
                    "sourceLocator": source_locator(row["sourceFile"], payload, programme, course, index, review),
                }
            )
    abilities = [
        {
            "sourceText": value.strip(),
            "studentText": "",
            "studentDisplay": False,
            "dataState": "review_only",
            "sourceLocator": {
                "sourceFile": row["sourceFile"],
                "parsedSource": payload.get("source_file"),
                "programme": programme.get("name"),
                "discipline": payload.get("discipline"),
                "field": "employability_skills",
                "index": index,
            },
        }
        for index, value in enumerate(programme.get("employability_skills") or [])
        if isinstance(value, str) and value.strip()
    ]
    return outcomes, abilities


def load_curriculum_contracts(
    programmes: list[dict[str, Any]],
) -> tuple[dict[str, dict[str, Any]], dict[str, Any]]:
    generic_audit = read_json(GENERIC_CONTRACT_AUDIT)
    generic_rows = {
        key_for(item.get("discipline"), item.get("programme")): item
        for item in generic_audit.get("programmes") or []
    }
    sociology_contract = read_json(SOCIOLOGY_CONTRACT)
    sociology_key = "Social Sciences::Sociology"
    sociology_outcomes = (sociology_contract.get("curriculumOutcomes") or {}).get("rows") or []
    sociology_abilities = (sociology_contract.get("programmeAbilities") or {}).get("rows") or []
    reviews = load_source_review()
    contracts: dict[str, dict[str, Any]] = {}
    for row in programmes:
        programme = row["programme"]
        programme_key = key_for(row["discipline"], programme.get("name"))
        if programme_key == sociology_key:
            outcomes = sociology_outcomes
            abilities = sociology_abilities
            contract_kind = "sociology_reviewed"
        else:
            outcomes, abilities = build_generic_contract_rows(row, reviews)
            contract_kind = "generic"
        summary = generic_rows.get(programme_key) if contract_kind == "generic" else sociology_contract
        contracts[programme_key] = {
            "kind": contract_kind,
            "summary": summary,
            "outcomes": outcomes,
            "abilities": abilities,
        }
    return contracts, {
        "genericAudit": generic_audit,
        "sociologyContract": sociology_contract,
        "genericSummaryKeys": sorted(generic_rows),
    }


def row_source_locator_ok(row: dict[str, Any], curriculum: bool = False) -> bool:
    locator = row.get("sourceLocator")
    if not isinstance(locator, dict) or not locator:
        return False
    if curriculum and not locator.get("courseCode") and locator.get("field") != "employability_skills":
        return False
    return bool(locator.get("sourceFile") or locator.get("originalPdf") or locator.get("parsedSource"))


def audit_curriculum(
    programme_rows: list[dict[str, Any]],
    contracts: dict[str, dict[str, Any]],
    contract_sources: dict[str, Any],
) -> tuple[dict[str, Any], dict[str, dict[str, Any]]]:
    failures = Counter()
    programme_results: dict[str, dict[str, Any]] = {}
    generic_audit = contract_sources["genericAudit"]
    generic_keys = set(contract_sources["genericSummaryKeys"])
    sociology_contract = contract_sources["sociologyContract"]
    sociology_key = "Social Sciences::Sociology"
    expected_source_keys = set()

    for source_row in programme_rows:
        programme = source_row["programme"]
        pkey = key_for(source_row["discipline"], programme.get("name"))
        expected_source_keys.add(pkey)
        contract = contracts[pkey]
        outcomes = contract["outcomes"]
        abilities = contract["abilities"]
        student_rows = [*outcomes, *abilities]
        legacy_values = []
        for field in ("skills_profile", "skills_profile_technical", "skills_profile_transferable"):
            legacy_values.extend(value for value in programme.get(field) or [] if isinstance(value, str) and value.strip())
        legacy_set = {norm(value) for value in legacy_values if norm(value)}
        student_legacy_overlap = sum(1 for item in student_rows if norm(item.get("sourceText")) in legacy_set)
        missing_locator = sum(not row_source_locator_ok(item, curriculum=True) for item in student_rows)
        legacy_locator = sum(
            str((item.get("sourceLocator") or {}).get("field") or "").startswith("skills_profile")
            for item in student_rows
        )
        missing_state = sum(not item.get("dataState") for item in student_rows)
        invalid_state = sum(item.get("dataState") not in VALID_DATA_STATES for item in student_rows if item.get("dataState"))
        raw_annotation = sum(bool(ANNOTATION_RE.search(str(item.get("studentText") or ""))) for item in student_rows)
        legacy_fallback = int(bool(legacy_locator or (legacy_values and not [x for x in outcomes if x.get("studentDisplay")])))

        summary_missing = int(contract["kind"] == "generic" and pkey not in generic_keys)
        source_course_count = len(programme.get("courses") or [])
        source_outcome_count = sum(
            1
            for course in programme.get("courses") or []
            for value in course.get("skills_learned") or []
            if isinstance(value, str) and value.strip()
        )
        if contract["kind"] == "generic":
            summary = contract["summary"] or {}
            count_mismatch = int(
                summary.get("courseCount") != source_course_count
                or summary.get("outcomeCount") != source_outcome_count
                or summary.get("studentOutcomeCount") != sum(bool(x.get("studentDisplay")) for x in outcomes)
            )
        else:
            summary = sociology_contract.get("programme") or {}
            count_mismatch = int(
                summary.get("courseCount") != source_course_count
                or (sociology_contract.get("curriculumOutcomes") or {}).get("rowCount") != len(outcomes)
            )

        local = {
            "kind": contract["kind"],
            "courseCount": source_course_count,
            "sourceOutcomeCount": source_outcome_count,
            "contractOutcomeCount": len(outcomes),
            "contractStudentOutcomeCount": sum(bool(x.get("studentDisplay")) for x in outcomes),
            "contractAbilityCount": len(abilities),
            "legacyProfileRows": len(legacy_values),
            "legacyFallbackRows": legacy_locator,
            "legacyTextOverlapRows": student_legacy_overlap,
            "missingSourceLocatorRows": missing_locator,
            "missingDataStateRows": missing_state,
            "invalidDataStateRows": invalid_state,
            "rawAnnotationRows": raw_annotation,
            "contractSummaryMissing": summary_missing,
            "contractCountMismatch": count_mismatch,
            "legacyFallbackRisk": legacy_fallback,
        }
        programme_results[pkey] = {"curriculum": local}
        for name, amount in (
            ("legacyFallbackRisk", legacy_fallback),
            ("missingCurriculumSourceLocators", int(missing_locator > 0)),
            ("missingCurriculumDataState", int(missing_state > 0)),
            ("invalidCurriculumDataState", int(invalid_state > 0)),
            ("rawCurriculumAnnotations", int(raw_annotation > 0)),
            ("missingContractSummary", summary_missing),
            ("curriculumCountMismatch", count_mismatch),
        ):
            failures[name] += amount

    failures["programmeCount"] = len(programme_rows)
    failures["genericProgrammeCount"] = sum(1 for row in programme_rows if key_for(row["discipline"], row["programme"].get("name")) != sociology_key)
    failures["sociologyProgrammeCount"] = int(sociology_key in expected_source_keys)
    failures["orphanGenericContractSummaries"] = len(generic_keys - expected_source_keys)
    failures["genericAuditProgrammeCount"] = int(generic_audit.get("programmeCount", 0))
    failures["sociologyQualityGateFailures"] = sum(
        not bool(value)
        for key, value in (sociology_contract.get("qualityGates") or {}).items()
        if key != "roleAggregatedRowsIncluded"
    ) + int(bool((sociology_contract.get("qualityGates") or {}).get("roleAggregatedRowsIncluded")))
    return dict(failures), programme_results


def load_contextual_catalogue() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    with gzip.open(CONTEXTUAL_CATALOGUE, "rt", encoding="utf-8") as handle:
        payload = json.load(handle)
    return payload.get("items") or [], payload.get("relationships") or []


def context_issue_template() -> Counter:
    return Counter(
        {
            "missingGuidanceOwner": 0,
            "ownerMismatch": 0,
            "missingDataState": 0,
            "invalidDataState": 0,
            "notSourceBacked": 0,
            "missingSourceLocators": 0,
            "missingSourceReferences": 0,
            "invalidSourceReferenceUrls": 0,
            "roleAggregateCandidates": 0,
            "unlabelledLinkState": 0,
        }
    )


def valid_https_reference(value: Any) -> bool:
    return isinstance(value, str) and value.startswith("https://")


def audit_context_items(items: list[dict[str, Any]]) -> tuple[dict[str, Any], dict[tuple[str, str], list[dict[str, Any]]]]:
    issues = context_issue_template()
    index: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    duplicate_keys = Counter()
    per_context: dict[tuple[str, str], Counter] = defaultdict(context_issue_template)
    for item in items:
        level = item.get("context_level")
        context_key = item.get("context_key")
        context = (str(level or ""), str(context_key or ""))
        index[context].append(item)
        duplicate_keys[(level, context_key, item.get("item_type"), item.get("item_key"))] += 1
        local = per_context[context]
        owner = item.get("guidance_owner")
        state = item.get("data_state")
        if not owner:
            issues["missingGuidanceOwner"] += 1
            local["missingGuidanceOwner"] += 1
        elif owner != level:
            issues["ownerMismatch"] += 1
            local["ownerMismatch"] += 1
        if not state:
            issues["missingDataState"] += 1
            local["missingDataState"] += 1
        elif state not in VALID_DATA_STATES:
            issues["invalidDataState"] += 1
            local["invalidDataState"] += 1
        elif state != "source_backed":
            issues["notSourceBacked"] += 1
            local["notSourceBacked"] += 1
        locators = item.get("source_locators")
        if not isinstance(locators, list) or not locators:
            issues["missingSourceLocators"] += 1
            local["missingSourceLocators"] += 1
        refs = item.get("source_references")
        if not isinstance(refs, list) or not refs:
            issues["missingSourceReferences"] += 1
            local["missingSourceReferences"] += 1
        else:
            invalid_urls = sum(
                1
                for ref in refs
                if isinstance(ref, dict) and ref.get("url") is not None and not valid_https_reference(ref.get("url"))
            )
            issues["invalidSourceReferenceUrls"] += invalid_urls
            local["invalidSourceReferenceUrls"] += invalid_urls
        if ROLE_AGGREGATE_MARKERS.search(json.dumps(item, ensure_ascii=False)):
            issues["roleAggregateCandidates"] += 1
            local["roleAggregateCandidates"] += 1
        if not any(key in item for key in LINK_STATE_KEYS):
            issues["unlabelledLinkState"] += 1
            local["unlabelledLinkState"] += 1
    duplicates = sum(max(count - 1, 0) for count in duplicate_keys.values())
    summary = {
        "itemRows": len(items),
        "contextCount": len(index),
        "levels": dict(Counter(item.get("context_level") for item in items)),
        "itemTypes": dict(Counter(item.get("item_type") for item in items)),
        "issues": dict(issues),
        "duplicateTypedItemRows": duplicates,
        "contextRowsWithIssues": sum(any(value for value in counter.values()) for counter in per_context.values()),
    }
    return summary, index, per_context


def audit_relationships(
    items: list[dict[str, Any]],
    relationships: list[dict[str, Any]],
) -> tuple[dict[str, Any], dict[tuple[str, str], Counter]]:
    item_index = {
        (item.get("context_level"), item.get("context_key"), item.get("item_type"), item.get("item_key"))
        for item in items
    }
    stats = Counter()
    per_context: dict[tuple[str, str], Counter] = defaultdict(Counter)
    duplicate_keys = Counter()
    for row in relationships:
        level = row.get("context_level")
        context_key = row.get("context_key")
        context = (str(level or ""), str(context_key or ""))
        from_key = (level, context_key, row.get("from_item_type"), row.get("from_item_key"))
        to_key = (level, context_key, row.get("to_item_type"), row.get("to_item_key"))
        duplicate_keys[(level, context_key, row.get("from_item_type"), row.get("from_item_key"), row.get("to_item_type"), row.get("to_item_key"), row.get("relationship_type"))] += 1
        unresolved = int(from_key not in item_index or to_key not in item_index)
        not_established = int(row.get("relationship_status") != "source_backed" or row.get("data_state") != "source_backed")
        owner_or_state = int(not row.get("guidance_owner") or row.get("guidance_owner") != level or not row.get("data_state"))
        missing_refs = int(not isinstance(row.get("source_references"), list) or not row.get("source_references"))
        stats["unresolvedEndpointRows"] += unresolved
        stats["notEstablishedRows"] += not_established
        stats["ownerOrStateRows"] += owner_or_state
        stats["missingSourceReferenceRows"] += missing_refs
        per_context[context]["unresolvedEndpointRows"] += unresolved
        per_context[context]["notEstablishedRows"] += not_established
        per_context[context]["ownerOrStateRows"] += owner_or_state
        per_context[context]["missingSourceReferenceRows"] += missing_refs
    stats["relationshipRows"] = len(relationships)
    stats["duplicateEdgeRows"] = sum(max(count - 1, 0) for count in duplicate_keys.values())
    stats["contextCount"] = len(per_context)
    return dict(stats), per_context


def context_rows_for_domain(
    index: dict[tuple[str, str], list[dict[str, Any]]],
    domain_id: str,
) -> Iterable[tuple[tuple[str, str], list[dict[str, Any]]]]:
    prefix = f"{domain_id}|"
    for context, rows in index.items():
        level, key = context
        if key == domain_id or (isinstance(key, str) and key.startswith(prefix)):
            yield context, rows


def audit_programmes_against_context(
    programme_rows: list[dict[str, Any]],
    programme_results: dict[str, dict[str, Any]],
    programme_domain_map: dict[str, Any],
    item_index: dict[tuple[str, str], list[dict[str, Any]]],
    relationship_contexts: dict[tuple[str, str], Counter],
    domain_contexts: dict[str, Counter],
    domain_relationships: dict[str, Counter],
) -> Counter:
    totals = Counter()
    for source_row in programme_rows:
        programme = source_row["programme"]
        pkey = key_for(source_row["discipline"], programme.get("name"))
        mapped = programme_domain_map.get(pkey) or {}
        links = mapped.get("links") or []
        domains = sorted({link.get("domain_id") for link in links if link.get("domain_id")})
        local = Counter()
        local["activeDomainLinks"] = len(domains)
        if not domains:
            local["noActiveDomainMapping"] = 1
        for domain_id in domains:
            if ("domain", domain_id) not in item_index:
                local["missingDomainContextRows"] += 1
            for name, amount in (domain_contexts.get(domain_id) or {}).items():
                local[name] += amount
            for name, amount in (domain_relationships.get(domain_id) or {}).items():
                local[name] += amount
        local["roleAggregateLeakageCandidates"] = local.get("roleAggregateCandidates", 0)
        local["unresolvedOrNotEstablishedRelationships"] = local.get("unresolvedEndpointRows", 0) + local.get("notEstablishedRows", 0)
        local["sourceLocatorGaps"] = local.get("missingSourceLocators", 0)
        local["linkStateGaps"] = local.get("unlabelledLinkState", 0)
        local["hasScalingFindings"] = int(any(value for name, value in local.items() if name not in {"activeDomainLinks", "hasScalingFindings"}))
        programme_results[pkey]["context"] = dict(local)
        for name, amount in local.items():
            totals[name] += amount
    totals["programmeCount"] = len(programme_rows)
    totals["programmesWithScalingFindings"] = sum(
        result.get("context", {}).get("hasScalingFindings", 0) or result.get("curriculum", {}).get("legacyFallbackRisk", 0)
        for result in programme_results.values()
    )
    return totals


def render_markdown(report: dict[str, Any]) -> str:
    summary = report["summary"]
    curriculum = report["curriculumAudit"]
    context = report["contextualAudit"]
    relationships = report["relationshipAudit"]
    lines = [
        "# All-programme scaling contract audit (2026-09-19)",
        "",
        "This is a deterministic, read-only audit of the checked-in programme curriculum contract and compressed contextual catalogue. It applies the Sociology-discovered failure modes to every parsed CCMAS programme. It does not apply SQL, fetch external URLs, populate missing relationships, or infer replacements.",
        "",
        "## Scope and evidence",
        "",
        "- Parsed CCMAS programmes: **{}** (generic **{}**, Sociology **{}**).".format(summary["programmeCount"], summary["genericProgrammeCount"], summary["sociologyProgrammeCount"]),
        "- Curriculum evidence: `programme_curriculum_contract_2026-09-18.json`, `sociology_curriculum_contract_2026-09-17.json`, and the parsed CCMAS source records.",
        "- Context evidence: `contextual_guidance_items.json.gz` (**{}** items; **{}** relationships).".format(context["itemRows"], relationships["relationshipRows"]),
        "- Programme routing evidence: `programme_domain_final.json` active links only; unverified links are not promoted by this audit.",
        "- URL reachability was not tested. SQL was not applied.",
        "",
        "## Gate counts",
        "",
        "| Failure mode | Count | Meaning |",
        "| --- | ---: | --- |",
        f"| Programmes with raw legacy fallback risk | {curriculum['legacyFallbackRisk']} | Student rows use a legacy array locator, or no course-scoped student outcomes exist despite legacy rows. |",
        f"| Programmes with curriculum source-locator gaps | {curriculum['missingCurriculumSourceLocators']} | At least one student curriculum row lacks a usable source locator. |",
        f"| Programmes with curriculum state gaps | {curriculum['missingCurriculumDataState'] + curriculum['invalidCurriculumDataState']} | At least one student curriculum row lacks or uses an invalid state. |",
        f"| Contextual rows with missing/mismatched ownership | {context['issues']['missingGuidanceOwner'] + context['issues']['ownerMismatch']} | `guidance_owner` is absent or does not equal the row context level. |",
        f"| Contextual rows with missing/unsupported state | {context['issues']['missingDataState'] + context['issues']['invalidDataState'] + context['issues']['notSourceBacked']} | Student guidance cannot treat these rows as source-backed. |",
        f"| Role-aggregate leakage candidates | {context['issues']['roleAggregateCandidates']} | Explicit aggregate/frequency marker detected in a contextual row; no fix was inferred. |",
        f"| Relationships with unresolved endpoints | {relationships['unresolvedEndpointRows']} | A typed source row points to an item not present in the same context. |",
        f"| Relationships marked not-established/review state | {relationships['notEstablishedRows']} | Status or data state is not `source_backed`; these must not render as student relationships. |",
        f"| Contextual rows without a link-state label | {context['issues']['unlabelledLinkState']} | The catalogue row has neither an item-level link field nor an explicit no-link reason. This does not claim no resource exists. |",
        f"| Contextual rows missing source locators | {context['issues']['missingSourceLocators']} | No source locator array is recorded on the catalogue row. |",
        "",
        "## Curriculum contract result",
        "",
        f"- Contract summary gaps: **{curriculum['missingContractSummary']}**; count mismatches: **{curriculum['curriculumCountMismatch']}**; Sociology quality-gate failures: **{curriculum['sociologyQualityGateFailures']}**.",
        f"- Raw student curriculum annotation rows: **{curriculum['rawCurriculumAnnotations']}**. These are a source-cleaning failure if displayed, not a reason to rewrite the source here.",
        f"- Orphan generic contract summaries: **{curriculum['orphanGenericContractSummaries']}**.",
        "",
        "## Contextual contract result",
        "",
        f"- Levels: `{context['levels']}`; item types: `{context['itemTypes']}`; duplicate typed item rows: **{context['duplicateTypedItemRows']}**.",
        f"- Context rows with issues: **{context['contextRowsWithIssues']}**.",
        f"- Relationship duplicate rows: **{relationships['duplicateEdgeRows']}**; relationships missing source references: **{relationships['missingSourceReferenceRows']}**.",
        "- Link-state limitation: the contextual catalogue has no item-level link/no-link field in its current schema. This audit therefore records the exact unlabelled count and does not promote broad resource-population rows by name similarity.",
        "",
        "## Per-programme output",
        "",
        "The machine-readable JSON contains one record for each parsed programme, with curriculum and active-domain context counts. This report intentionally does not invent external relationships or repair data.",
        "",
        "## Decision",
        "",
        "**Scaling audit complete as an evidence pass; scaling data/UI acceptance is not implied.** Address the reported ownership, state, relationship, source-locator and link-state gaps through source review and retained locators before promoting any programme beyond the fail-closed boundary.",
        "",
        f"Generated by `data/career-mapping/_audit_scaling_contract.py` on fixed audit date `{AUDIT_DATE}`.",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    programme_rows = load_programmes()
    contracts, contract_sources = load_curriculum_contracts(programme_rows)
    curriculum_summary, programme_results = audit_curriculum(programme_rows, contracts, contract_sources)
    items, relationships = load_contextual_catalogue()
    contextual_summary, item_index, per_context_items = audit_context_items(items)
    relationship_summary, per_context_relationships = audit_relationships(items, relationships)
    domain_context_summaries: dict[str, Counter] = defaultdict(Counter)
    for (level, context_key), context_stats in per_context_items.items():
        domain_id = str(context_key).split("|", 1)[0]
        for name, amount in context_stats.items():
            domain_context_summaries[domain_id][name] += amount
    domain_relationship_summaries: dict[str, Counter] = defaultdict(Counter)
    for (level, context_key), context_stats in per_context_relationships.items():
        domain_id = str(context_key).split("|", 1)[0]
        for name, amount in context_stats.items():
            domain_relationship_summaries[domain_id][name] += amount
    programme_domain_map = read_json(PROGRAMME_DOMAIN_MAP)
    programme_context_summary = audit_programmes_against_context(
        programme_rows,
        programme_results,
        programme_domain_map,
        item_index,
        per_context_relationships,
        domain_context_summaries,
        domain_relationship_summaries,
    )
    report = {
        "schemaVersion": 1,
        "generatedOn": AUDIT_DATE,
        "auditName": "all_programme_sociology_failure_mode_scaling_contract",
        "policy": {
            "studentRowsRequire": ["source-backed state", "context ownership", "source locator", "explicit link or honest no-link label"],
            "relationshipsRequire": ["same-context typed endpoints", "source_backed status", "source references"],
            "legacyArrays": "audit-only; never a student curriculum fallback",
            "roleAggregates": "never a domain or subgroup foundation",
            "externalSources": "not fetched; missing evidence is reported, not invented",
            "sql": "not applied",
        },
        "inputs": {
            "ccmasDirectory": "data/career-mapping/ccmas",
            "genericContractAudit": "data/career-mapping/_audit/programme_curriculum_contract_2026-09-18.json",
            "sociologyContract": "data/career-mapping/_audit/sociology_curriculum_contract_2026-09-17.json",
            "contextualCatalogue": "data/career-mapping/contextual_guidance_items.json.gz",
            "programmeDomainMap": "data/career-mapping/programme_domain_final.json",
        },
        "summary": {
            "programmeCount": len(programme_rows),
            "genericProgrammeCount": sum(item.get("kind") == "generic" for item in contracts.values()),
            "sociologyProgrammeCount": sum(item.get("kind") == "sociology_reviewed" for item in contracts.values()),
            "programmesWithScalingFindings": programme_context_summary["programmesWithScalingFindings"],
            "activeDomainLinks": programme_context_summary["activeDomainLinks"],
            "programmesWithoutActiveDomainMapping": sum(
                result.get("context", {}).get("noActiveDomainMapping", 0) for result in programme_results.values()
            ),
        },
        "curriculumAudit": curriculum_summary,
        "contextualAudit": contextual_summary,
        "relationshipAudit": relationship_summary,
        "programmeContextTotals": dict(programme_context_summary),
        "programmes": [
            {
                "programmeKey": pkey,
                "discipline": pkey.split("::", 1)[0],
                "programme": pkey.split("::", 1)[1],
                **programme_results[pkey],
            }
            for pkey in sorted(programme_results)
        ],
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "summary": report["summary"], "curriculum": curriculum_summary, "contextual": contextual_summary, "relationships": relationship_summary}, ensure_ascii=False, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
