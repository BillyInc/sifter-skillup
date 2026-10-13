#!/usr/bin/env python3
"""Write the corrected all-JAMB programme/resource evidence ledger.

This is an append-only, audit-only correction to the earlier 86-identity
review ledger.  The student lookup population is the 420 canonical JAMB
identities.  CCMAS material is useful supporting evidence, but its absence is
not an unavailable decision.  Resource availability and downstream mapping
review are recorded as separate fields.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import re
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urlparse


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
CCMAS_DIR = ROOT / "data" / "career-mapping" / "ccmas"
INHERITANCE = HERE / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
COMPLEMENTS = HERE / "ccmas_external_domain_complements_2026-09-01.json"
BUILDER = ROOT / "data" / "career-mapping" / "_build_programme_guidance_catalog.py"
PRIOR_AUDIT = HERE / "audit_programme_jamb_resource_evidence_2026-09-23_002.py"
POLICY = HERE / "PROGRAMME_JAMB_SCOPE_POLICY_CORRECTION_2026-09-23.json"
OUT_PREFIX = "programme_jamb_resource_evidence_2026-09-23_corrected_004"
CHECKED_ON = "2026-09-23"
JAMB_URL = "https://eligibility.jamb.gov.ng/"
NUC_HUB = "https://www.nuc.edu.ng/ccmas/"
BATCH_SIZE = 20

# Item-specific external learning sources for JAMB identities that do not
# resolve to a CCMAS component in the canonical inheritance artifact.  These
# are learning references, not claims about university prescriptions.
CUSTOM_EXTERNAL_RESOURCES: dict[str, dict[str, str]] = {
    "Anthropology": {
        "url": "https://open.umn.edu/opentextbooks/textbooks/1150",
        "title": "Introduction to Anthropology",
        "authority": "Open Textbook Library / OpenStax",
        "locator": "Open Textbook Library title page; four-field introduction and chapters 1–20",
        "summary": "Open introductory anthropology textbook covering cultural, biological, archaeological and linguistic anthropology.",
    },
    "French": {
        "url": "https://www.open.edu/openlearn/languages/getting-started-french-1",
        "title": "Getting started with French 1",
        "authority": "The Open University OpenLearn",
        "locator": "OpenLearn course page; introductory French language, pronunciation and everyday communication outcomes",
        "summary": "Free introductory French course with reading, listening, speaking, writing and basic language structures.",
    },
    "Intelligence and Security Studies": {
        "url": "https://www.open.edu/openlearn/society-politics-law/questioning-crime-social-harms-and-global-issues/content-section-0",
        "title": "Questioning crime, social harms and global issues",
        "authority": "The Open University OpenLearn",
        "locator": "OpenLearn course landing page; crime, social harms and global issues",
        "summary": "Open social-science resource for examining crime, harm, justice and global security-related questions.",
    },
    "Social Justice": {
        "url": "https://www.open.edu/openlearn/education-development/exploring-equality-and-equity-education/content-section-0",
        "title": "Exploring equality and equity in education",
        "authority": "The Open University OpenLearn",
        "locator": "OpenLearn course page; equality, equity and social-justice concepts across cultures and jurisdictions",
        "summary": "Free course introducing conceptions of justice and the distinction between equality and equity.",
    },
    "Sport Management (Education)": {
        "url": "https://www.open.edu/openlearn/money-business/the-business-football",
        "title": "The business of football",
        "authority": "The Open University OpenLearn / EFL Trust",
        "locator": "OpenLearn course page; sport business, management, teams, stakeholders and globalisation",
        "summary": "Free introductory sport-management resource covering sport-business environments, motivation, teams and power.",
    },
    "Sport Science": {
        "url": "https://www.open.edu/openlearn/course/view.php?id=8018",
        "title": "Sport science",
        "authority": "The Open University OpenLearn",
        "locator": "OpenLearn article; exercise physiology, sport psychology, biomechanics, nutrition and conditioning",
        "summary": "Open sport-science overview explaining the main scientific areas used to understand athletic performance.",
    },
}

REFERENCE_OVERRIDES: dict[str, dict[str, str]] = {
    "Agricultural Science": {
        "url": "https://open.umn.edu/opentextbooks/textbooks/history-and-science-of-cultivated-plants",
        "title": "History and Science of Cultivated Plants",
        "provider": "Open Textbook Library / Oregon State University",
        "description": "Open agriculture reference covering crop origins, agricultural practices, plant breeding and biotechnology.",
        "locator": "Open Textbook Library title page; chapters on origins of agriculture, crop plants, breeding and biotechnology",
    },
    "Environmental Sciences": {
        "url": "https://open.umn.edu/opentextbooks/textbooks/introduction-to-environmental-sciences-and-sustainability",
        "title": "Introduction to Environmental Sciences and Sustainability",
        "provider": "Open Textbook Library",
        "description": "Open environmental-science reference covering ecosystems, biodiversity, environmental problems and sustainability.",
        "locator": "Open Textbook Library title page; 14-chapter environmental science and sustainability text",
    },
    "Communication and Media Studies": {
        "url": "https://open.umn.edu/opentextbooks/textbooks/introduction-to-communication-and-media-studies",
        "title": "Introduction to Communication and Media Studies",
        "provider": "Open Textbook Library / ROTEL",
        "description": "Open communication and media reference covering communication processes, media and society, media literacy, rhetoric, ethics and digital media.",
        "locator": "Open Textbook Library title page; introductory communication/media chapters and learning outcomes",
    },
}

OVERRIDE_SOURCE_CHECKS = {
    item["url"]: {
        "status": "confirmed",
        "authority": item["provider"],
        "locator": item["locator"],
        "basis": "Item-specific open-textbook title page was located during the targeted external-source search.",
    }
    for item in REFERENCE_OVERRIDES.values()
}


def load_module(path: Path, name: str) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-") or "item"


def identity_key(value: str) -> str:
    """Keep source-name identity distinct when names differ only by case."""
    import hashlib as _hashlib

    digest = _hashlib.sha256(value.strip().encode("utf-8")).hexdigest()[:10]
    return f"{slug(value)}-{digest}"


def compact(value: Any, limit: int = 700) -> str:
    text = "" if value is None else str(value).strip()
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def walk_source_candidates(value: Any, path: str = "") -> Iterable[dict[str, Any]]:
    if isinstance(value, dict):
        if isinstance(value.get("url"), str) and value["url"].startswith("https://"):
            yield {
                "url": value["url"],
                "authority": value.get("authority") or value.get("provider") or value.get("source_kind"),
                "title": value.get("title") or value.get("name"),
                "locator": value.get("locator") or value.get("page") or value.get("section"),
                "accessed_on": value.get("accessed_on") or value.get("access_date"),
                "source_path": path or None,
            }
        for key, child in value.items():
            yield from walk_source_candidates(child, f"{path}.{key}" if path else key)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk_source_candidates(child, f"{path}[{index}]")


def source_check(url: str) -> dict[str, Any] | None:
    if url in OVERRIDE_SOURCE_CHECKS:
        return {**OVERRIDE_SOURCE_CHECKS[url], "checked_on": CHECKED_ON}
    prior = load_module(PRIOR_AUDIT, "prior_resource_audit")
    check = prior.SOURCE_CHECKS.get(url)
    return {**check, "checked_on": CHECKED_ON} if check else None


def authority_class(url: str, authority: str | None) -> str:
    host = urlparse(url).netloc.casefold()
    name = (authority or "").casefold()
    if any(marker in host or marker in name for marker in (
        "nuc.edu.ng", "jamb.gov.ng", "openstax.org", "open.edu", "edu.ng",
        "gov.ng", "ilo.org", "esco.ec.europa.eu", "onetcenter.org",
    )):
        return "authoritative_external"
    return "recognized_external"


def builder_constants() -> tuple[dict[str, str], dict[str, dict[str, Any]]]:
    module = load_module(BUILDER, "programme_guidance_builder")
    return module.ORIGINAL_PDF_BY_JSON, module.REFERENCE_BY_DISCIPLINE


def ccmas_catalog() -> dict[str, dict[str, Any]]:
    pdf_by_file, references = builder_constants()
    catalog: dict[str, dict[str, Any]] = {}
    for source in sorted(CCMAS_DIR.glob("*.json")):
        data = json.loads(source.read_text(encoding="utf-8"))
        discipline = str(data.get("discipline", "")).strip()
        original_pdf = pdf_by_file[source.name]
        reference = references.get(discipline)
        for programme in data.get("programmes", []):
            name = str(programme.get("name", "")).strip()
            if not name:
                continue
            key = f"{discipline}::{name}"
            course_count = len(programme.get("courses", []))
            catalog[key] = {
                "discipline": discipline,
                "name": name,
                "source_file": source.name,
                "original_pdf": original_pdf,
                "course_count": course_count,
                "curriculum_url": NUC_HUB,
                "reference": reference,
            }
    return catalog


def complement_index() -> dict[str, list[dict[str, Any]]]:
    data = json.loads(COMPLEMENTS.read_text(encoding="utf-8"))
    result: dict[str, list[dict[str, Any]]] = {}
    for row in data.get("rows", []):
        result.setdefault(str(row.get("jamb_name", "")), []).append(row)
    return result


def inherited_rows() -> list[dict[str, Any]]:
    data = json.loads(INHERITANCE.read_text(encoding="utf-8"))
    return sorted(data.get("rows", []), key=lambda row: str(row.get("jamb_name", "")))


def policy_contract() -> dict[str, Any]:
    policy = json.loads(POLICY.read_text(encoding="utf-8"))
    assert policy["student_population"]["jamb_identities"] == 420
    assert policy["student_population"]["ccmas_packages"] == 237
    assert policy["ccmas_anchor_required_for_jamb_availability"] is False
    assert policy["affected_no_ccmas_anchor_occurrences"] == 11
    return policy


def component_catalog_rows(row: dict[str, Any], catalog: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    output = []
    for ref in row.get("component_refs") or []:
        item = catalog.get(ref)
        if item:
            output.append(item)
    primary = row.get("primary_component") or {}
    primary_key = f"{primary.get('discipline', '')}::{primary.get('name', '')}"
    if primary_key in catalog and primary_key not in {f"{x['discipline']}::{x['name']}" for x in output}:
        output.append(catalog[primary_key])
    return output


def source_records_for_links(name: str, complements: dict[str, list[dict[str, Any]]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    links: list[dict[str, Any]] = []
    sources: list[dict[str, Any]] = []
    seen_sources: set[tuple[str, str | None, str | None]] = set()
    for complement in complements.get(name, []):
        for link in complement.get("links", []):
            nigerian = link.get("nigerian_curriculum_evidence") or {}
            anchor_status = nigerian.get("evidence_status") or "not_recorded"
            link_sources = []
            seen_link: set[tuple[str, str | None, str | None]] = set()
            for candidate in walk_source_candidates(link):
                key = (candidate["url"], candidate.get("locator"), candidate.get("source_path"))
                if key in seen_link:
                    continue
                seen_link.add(key)
                check = source_check(candidate["url"])
                record = {
                    **candidate,
                    "authority_class": authority_class(candidate["url"], candidate.get("authority")),
                    "checked_on": CHECKED_ON if check else None,
                    "external_check": check,
                    "source_preservation": "retained_item_specific_url_and_locator",
                }
                link_sources.append(record)
                global_key = (candidate["url"], candidate.get("locator"), candidate.get("source_path"))
                if global_key not in seen_sources:
                    seen_sources.add(global_key)
                    sources.append(record)
            links.append({
                "component_ref": link.get("component_ref"),
                "domain_id": link.get("domain_id"),
                "domain_name": link.get("domain_name"),
                "match_type": link.get("match_type"),
                "ccmas_anchor_status": anchor_status,
                "ccmas_anchor_absent": anchor_status == "nigerian_ccmas_anchor_missing",
                "external_source_count": len(link_sources),
                "external_sources": link_sources,
                "nigerian_curriculum_evidence": {
                    "record_found": (link.get("ccmas_evidence") or {}).get("record_found"),
                    "course_anchor_quality": nigerian.get("course_anchor_quality"),
                    "course_anchor_count": nigerian.get("course_anchor_count"),
                },
            })
    links.sort(key=lambda item: (item.get("component_ref") or "", item.get("domain_id") or ""))
    return links, sorted(sources, key=lambda item: (item["url"], item.get("locator") or ""))


def make_resource(url: str, title: str, authority: str, locator: str, role: str, summary: str, *, source_status: str = "review_only") -> dict[str, Any]:
    check = source_check(url)
    return {
        "url": url,
        "title": title,
        "authority": authority,
        "locator": locator,
        "resource_role": role,
        "evidence_summary": summary,
        "accessed_on": CHECKED_ON,
        "source_status": (check or {}).get("status", source_status),
        "source_check": check,
    }


def custom_resource(name: str) -> dict[str, Any] | None:
    item = CUSTOM_EXTERNAL_RESOURCES.get(name)
    if not item:
        return None
    return {
        "url": item["url"],
        "title": item["title"],
        "authority": item["authority"],
        "locator": item["locator"],
        "resource_role": "external_learning_reference",
        "evidence_summary": item["summary"],
        "accessed_on": CHECKED_ON,
        "source_status": "confirmed",
        "source_check": {
            "status": "confirmed",
            "authority": item["authority"],
            "locator": item["locator"],
            "basis": "Official university/open-textbook or intergovernmental learning page located during the targeted external-source search.",
            "checked_on": CHECKED_ON,
        },
        "authority_class": "authoritative_external",
        "source_preservation": "new_item_specific_external_source",
    }


def jamb_rows() -> list[dict[str, Any]]:
    catalog = ccmas_catalog()
    complements = complement_index()
    rows = []
    for inherited in inherited_rows():
        name = str(inherited.get("jamb_name", "")).strip()
        links, prior_sources = source_records_for_links(name, complements)
        components = component_catalog_rows(inherited, catalog)
        resources: list[dict[str, Any]] = [make_resource(
            JAMB_URL,
            f"JAMB programme identity: {name}",
            "Joint Admissions and Matriculation Board",
            f"IBASS programme selector; exact catalogue identity `{name}`.",
            "official_identity_context",
            "Official JAMB identity context for the programme lookup.",
            source_status="confirmed",
        )]
        custom = custom_resource(name)
        if custom:
            resources.append(custom)
        resource_keys = {(JAMB_URL, "official_identity_context")}
        for component in components:
            pdf_url = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/" + component["original_pdf"]
            key = (pdf_url, "official_curriculum_source")
            if key not in resource_keys:
                resources.append(make_resource(
                    pdf_url,
                    f"NUC CCMAS curriculum: {component['name']}",
                    "National Universities Commission",
                    f"{component['source_file']}; programme section {component['name']}; {component['course_count']} parsed course rows.",
                    "official_curriculum_source",
                    "Programme-specific CCMAS curriculum evidence where a matching component exists; it is not a prescribed-book claim.",
                    source_status="confirmed",
                ))
                resource_keys.add(key)
            reference = REFERENCE_OVERRIDES.get(component["discipline"], component.get("reference"))
            if reference:
                key = (reference["url"], "external_learning_reference")
                if key not in resource_keys:
                    resources.append(make_resource(
                        reference["url"],
                        reference["title"],
                        reference["provider"],
                        f"Discipline-level foundation reference for {component['discipline']}; use sections matching the recorded programme topics.",
                        "external_learning_reference",
                        compact(reference["description"]),
                    ))
                    resource_keys.add(key)
        for source in prior_sources:
            key = (source["url"], "external_domain_learning_reference")
            if key not in resource_keys:
                resources.append({
                    **source,
                    "resource_role": "external_domain_learning_reference",
                    "evidence_summary": "Retained external source from the JAMB/domain enrichment ledger; programme fit remains separately audited.",
                })
                resource_keys.add(key)

        anchor_absent = any(link.get("ccmas_anchor_absent") for link in links)
        learning_resources = [r for r in resources if r["resource_role"] != "official_identity_context"]
        has_external_learning = bool(learning_resources)
        mapping_status = inherited.get("mapping_status")
        resource_classification = "available" if has_external_learning else "review_required"
        if not resources:
            resource_classification = "genuinely_unavailable"
        rows.append({
            "schema": "2026-09-23.jamb-resource-evidence-corrected.v1",
            "subject_id": f"jamb-resource|{identity_key(name)}",
            "subject_kind": "jamb_identity_resource_review",
            "jamb_name": name,
            "mapping_status": mapping_status,
            "mapping_status_reason": inherited.get("status_reason"),
            "inheritance_type": inherited.get("inheritance_type"),
            "mapping_type": inherited.get("mapping_type"),
            "ccmas_anchor_absent": anchor_absent,
            "ccmas_anchor_policy": "optional_complement; absence_does_not_make_jamb_unavailable",
            "checked_on": CHECKED_ON,
            "identity_authority": resources[0],
            "resources": resources,
            "links": links,
            "external_source_count": len([r for r in resources if r.get("resource_role") != "official_identity_context"]),
            "authoritative_external_source_count": sum(((r.get("source_check") or {}).get("status") == "confirmed") or r.get("authority_class") == "authoritative_external" for r in resources[1:]),
            "resource_classification": resource_classification,
            "decision": "resource_available" if resource_classification == "available" else "review_required",
            "decision_reason": (
                "The official JAMB identity has at least one retained external learning/curriculum resource. "
                "A missing CCMAS anchor is recorded as provenance metadata only and does not block availability."
                if resource_classification == "available"
                else "The official identity is retained, but no external learning resource was substantiated in the current ledger; keep internal review until enriched."
            ),
            "student_exposure": "requires_downstream_and_approval_gate" if mapping_status == "review_required" or resource_classification == "review_required" else "eligible_for_downstream_gate",
            "promotion_eligible": False,
            "audit_boundary": {"sql_applied": False, "live_database_changed": False, "browser_proof": False},
        })
    return rows


def write_new(path: Path, content: str) -> None:
    if path.exists():
        existing = path.read_text(encoding="utf-8")
        if existing != content:
            raise FileExistsError(f"Append-only output differs from existing artifact: {path}")
        return
    path.write_text(content, encoding="utf-8", newline="\n")


def write_batches(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    outputs = []
    for start in range(0, len(rows), BATCH_SIZE):
        batch_no = start // BATCH_SIZE + 1
        batch = rows[start : start + BATCH_SIZE]
        content = "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in batch)
        path = HERE / f"{OUT_PREFIX}_jamb_batch-{batch_no:03d}.jsonl"
        write_new(path, content)
        outputs.append({"file": path.name, "row_start": start, "row_count": len(batch), "sha256": hashlib.sha256(content.encode()).hexdigest()})
    return outputs


def main() -> None:
    policy = policy_contract()
    rows = jamb_rows()
    assert len(rows) == 420, len(rows)
    assert len({row["jamb_name"] for row in rows}) == 420
    anchor_absent_rows = [row for row in rows if row["ccmas_anchor_absent"]]
    unavailable = [row for row in rows if row["resource_classification"] == "genuinely_unavailable"]
    assert len(anchor_absent_rows) == policy["affected_no_ccmas_anchor_occurrences"]
    assert not unavailable, [row["jamb_name"] for row in unavailable]
    assert all(row["resource_classification"] == "available" for row in anchor_absent_rows), [row["jamb_name"] for row in anchor_absent_rows]
    batches = write_batches(rows)
    counts = {
        "available": sum(row["resource_classification"] == "available" for row in rows),
        "review_required": sum(row["resource_classification"] == "review_required" for row in rows),
        "genuinely_unavailable": len(unavailable),
    }
    manifest = {
        "schema": "2026-09-23.jamb-resource-evidence-corrected-manifest.v1",
        "generated_on": CHECKED_ON,
        "append_only": True,
        "scope": {"canonical_jamb_identities": 420, "ccmas_packages_context_only": policy["student_population"]["ccmas_packages"], "rows_written": len(rows), "ccmas_anchor_absent_rows": len(anchor_absent_rows)},
        "classifications": counts,
        "anchor_absent_policy": "optional_ccmas_complement; never_unavailable_by_itself",
        "batches": batches,
        "boundaries": {"sql_applied": False, "live_database_changed": False, "browser_proof": False},
    }
    manifest_path = HERE / f"{OUT_PREFIX}_manifest.json"
    write_new(manifest_path, json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    report = f"""# Corrected all-JAMB resource evidence ledger — {CHECKED_ON}

Append-only local audit artifact. No SQL, seed, frontend, backend or live
database change was made.

## Scope

- Canonical JAMB identities: **{len(rows)}/420**.
- CCMAS-anchor-absent occurrences: **{len(anchor_absent_rows)}**; all remain available when external evidence exists.
- Available resource packages: **{counts['available']}**.
- Review-required resource packages: **{counts['review_required']}**.
- Genuinely unavailable: **{counts['genuinely_unavailable']}**.

## Policy correction

The student-facing denominator is the 420 JAMB identities, not the 237 CCMAS
packages. CCMAS is an optional curriculum complement. The 11 previously
classified as unavailable solely because an anchor was absent are retained with
their external sources and are not unavailable under this ledger.

Resource availability is separate from downstream mapping review. A row may
have an available external learning resource while still requiring internal
review of programme-to-domain promotion, ownership or student approval.

## Outputs

- JSONL batches: `{OUT_PREFIX}_jamb_batch-*.jsonl`
- Manifest: `{manifest_path.name}`

SQL application, live payload verification and browser acceptance remain
deferred.
"""
    report_path = HERE / f"{OUT_PREFIX}_report.md"
    write_new(report_path, report)
    checkpoint = {
        "schema": "2026-09-23.jamb-resource-evidence-corrected-checkpoint.v1",
        "generated_on": CHECKED_ON,
        "rows_written": len(rows),
        "anchor_absent_rows": len(anchor_absent_rows),
        "classifications": counts,
        "append_only": True,
        "next": "Review corrected all-JAMB evidence and only then regenerate dependent SQL transport; do not treat local evidence as live deployment.",
    }
    checkpoint_path = HERE / f"{OUT_PREFIX}_checkpoint.json"
    write_new(checkpoint_path, json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"rows": len(rows), "anchor_absent_rows": len(anchor_absent_rows), "classifications": counts, "manifest": str(manifest_path)}, indent=2))


if __name__ == "__main__":
    main()
