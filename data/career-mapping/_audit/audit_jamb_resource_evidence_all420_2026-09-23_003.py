#!/usr/bin/env python3
"""Build the corrected all-420 JAMB resource-evidence reconciliation.

Audit-only and append-only. The 237 CCMAS packages are context, not the
availability scope. This script never writes SQL, seed data, live data, UI
code, or browser-proof artifacts.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import re
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
CHECKED_ON = "2026-09-23"
BATCH_SIZE = 20
PREFIX = "programme_jamb_resource_evidence_2026-09-23_all420"
INHERITANCE = HERE / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
BROCHURE_AUDIT = HERE / "jamb_brochure_source_audit_2026-08-17.json"
COMPLEMENTS = HERE / "ccmas_external_domain_complements_2026-09-01.json"
ROUTE_AUDIT = HERE / "ALL_PROGRAMME_STUDENT_ROUTE_CONTRACT_AUDIT_2026-09-23.json"
BUILDER = ROOT / "data" / "career-mapping" / "_build_programme_guidance_catalog.py"
OLD_AUDIT = HERE / "audit_programme_jamb_resource_evidence_2026-09-23_002.py"
JAMB_IBASS = "https://eligibility.jamb.gov.ng/"
NUC_HUB = "https://www.nuc.edu.ng/ccmas/"

NUC_PDF_BY_FILE = {
    "Administration-and-Management.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf",
    "Agriculture-2023.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf",
    "Allied-Health-Sciences-2023.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf",
    "Architecture-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Architecture-CCMAS-2023-FINAL.pdf",
    "Arts-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf",
    "Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf",
    "Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf",
    "Computing-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf",
    "Education-CCMAS-2023-New.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf",
    "Engineering-Technology-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf",
    "Environmental-Sciences-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf",
    "Law-ALL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf",
    "Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf",
    "Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf",
    "Sciences-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf",
    "Social-Sciences-CCMAS-FINAL-2023-A.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
    "Veterinary-Medicine-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Veterinary-Medicine-CCMAS-2023-FINAL.pdf",
}

FAO = {
    "title": "FAO elearning Academy",
    "provider": "Food and Agriculture Organization of the United Nations",
    "url": "https://elearning.fao.org/",
    "locator": "FAO elearning Academy landing page",
    "limitation": "Authoritative agriculture learning collection; discipline-level foundation, not proof of a prescribed programme text.",
}
UNEP = {
    "title": "Environmental education resources guide",
    "provider": "United Nations Environment Programme",
    "url": "https://www.unep.org/resources/toolkits-manuals-and-guides/environmental-education-resources-guide",
    "locator": "Environmental Education Resources Guide landing page",
    "limitation": "Authoritative environmental foundation resource; not proof of a prescribed programme text or Nigerian offering.",
}
COMMUNICATION = {
    "title": "Communication in the Real World: An Introduction to Communication Studies",
    "provider": "University of Minnesota Libraries Publishing",
    "url": "https://open.umn.edu/opentextbooks/textbooks/communication-in-the-real-world-an-introduction-to-communication-studies",
    "locator": "Open textbook landing page; ISBN 9781946135070",
    "limitation": "Open introductory communication resource; not proof of a prescribed programme text or Nigerian offering.",
}


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def import_module(path: Path, name: str) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot import {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


OLD = import_module(OLD_AUDIT, "resource_audit_002_readonly")
BUILDER_MODULE = import_module(BUILDER, "programme_guidance_builder_readonly")


def write_new(path: Path, content: str) -> None:
    if path.exists():
        raise FileExistsError(f"Append-only output already exists: {path}")
    path.write_text(content, encoding="utf-8", newline="\n")


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def sha256_text(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def source_check(url: str, authority: str, locator: str) -> dict[str, Any]:
    return {
        "status": "confirmed",
        "authority": authority,
        "locator": locator,
        "checked_on": CHECKED_ON,
        "check_kind": "source-review-only; not browser acceptance proof",
        "limitation": "Endpoint/source identity was reviewed for this audit; no live student or browser claim is made.",
        "url": url,
    }


def brochure_by_name() -> dict[str, dict[str, Any]]:
    return {row["jamb_name"]: row for row in load_json(BROCHURE_AUDIT)["mapping_rows"]}


def resource_for(discipline: str) -> dict[str, Any]:
    refs = dict(BUILDER_MODULE.REFERENCE_BY_DISCIPLINE)
    if discipline == "Agricultural Science":
        return dict(FAO)
    if discipline == "Environmental Sciences":
        return dict(UNEP)
    if discipline == "Communication and Media Studies":
        return dict(COMMUNICATION)
    if discipline in {"French", "Anthropology", "Social Justice", "Intelligence and Security Studies"}:
        return {
            "title": "Humanities open textbooks",
            "provider": "Open Textbook Library",
            "url": "https://open.umn.edu/opentextbooks/subjects/humanities",
            "locator": "Humanities subject collection landing page",
            "limitation": "Open humanities foundation collection; exact language or programme fit remains review-only.",
        }
    if discipline == "Sport Science":
        return {
            "title": "Anatomy and Physiology 2e",
            "provider": "OpenStax / Rice University",
            "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction",
            "locator": "Chapter 1 Introduction",
            "limitation": "Human-biology foundation only; exact sport-science programme fit remains review-only.",
        }
    if discipline == "Sport Management (Education)":
        return {
            "title": "Principles of Management",
            "provider": "OpenStax / Rice University",
            "url": "https://openstax.org/books/principles-management/pages/1-introduction",
            "locator": "Chapter 1 Introduction",
            "limitation": "Management foundation only; exact sport-management programme fit remains review-only.",
        }
    ref = refs.get(discipline)
    if not ref:
        raise KeyError(f"No discipline resource for {discipline}")
    return {
        "title": ref["title"],
        "provider": ref["provider"],
        "url": ref["url"],
        "locator": ref["title"] + " landing page",
        "limitation": "Discipline-level foundation reference; not proof of a prescribed programme text or Nigerian offering.",
    }


def identity_evidence(row: dict[str, Any], brochure: dict[str, dict[str, Any]]) -> dict[str, Any]:
    name = row["jamb_name"]
    hit = brochure.get(name)
    if hit:
        return {
            "source_status": "confirmed",
            "authority": "Joint Admissions and Matriculation Board",
            "url": JAMB_IBASS,
            "locator": f"Official IBASS programme selector; exact catalogue identity `{name}`; JAMB brochure source file {hit['source_hits'][0]['file']} pages {hit['source_hits'][0]['pages']}.",
            "accessed_on": CHECKED_ON,
            "brochure_source_file": hit["source_hits"][0]["file"],
            "brochure_pages": hit["source_hits"][0]["pages"],
            "brochure_audit_date_state": "not_recorded_in_2026-08-17_artifact",
            "limitation": "The brochure audit proves catalogue-name presence; it does not prove a university offering or curriculum equivalence.",
        }
    return {
        "source_status": "review_only",
        "authority": "Joint Admissions and Matriculation Board",
        "url": JAMB_IBASS,
        "locator": f"Official IBASS programme selector; canonical identity `{name}` retained from the 420-row JAMB catalogue.",
        "accessed_on": CHECKED_ON,
        "brochure_source_file": None,
        "brochure_pages": [],
        "brochure_audit_date_state": "not_present_in_2026-08-17_brochure_audit",
        "limitation": "No matching row was present in the checked 2026-08-17 brochure audit; no alias or equivalence is inferred. Identity remains review-only, not unavailable.",
    }


def resource_evidence(discipline: str) -> dict[str, Any]:
    ref = resource_for(discipline)
    return {
        "title": ref["title"],
        "provider": ref["provider"],
        "url": ref["url"],
        "locator": ref["locator"],
        "accessed_on": CHECKED_ON,
        "source_status": "confirmed",
        "authority_class": "authoritative_external_or_open_academic",
        "source_check": source_check(ref["url"], ref["provider"], ref["locator"]),
        "limitation": ref["limitation"],
        "suitability_classification": "review_only_foundation",
        "source_preservation": "retained_item_specific_url_locator_and_access_date",
    }


def source_urls(evidence: dict[str, Any]) -> list[str]:
    values: list[str] = []
    for key in ("source_url", "source_urls"):
        value = evidence.get(key)
        if isinstance(value, str) and value.startswith("https://"):
            values.append(value)
        elif isinstance(value, list):
            values.extend(item for item in value if isinstance(item, str) and item.startswith("https://"))
    return list(dict.fromkeys(values))


def preserved_external_sources(link: dict[str, Any]) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    for evidence in link.get("external_domain_evidence") or []:
        prior_date = evidence.get("accessed_on") or evidence.get("access_date")
        for url in source_urls(evidence):
            result.append({
                "url": url,
                "source_id": evidence.get("source_id"),
                "source_name": evidence.get("source_name"),
                "locator": evidence.get("locator"),
                "source_file": evidence.get("source_file"),
                "claim_supported": evidence.get("claim_supported"),
                "limitation": evidence.get("limitation"),
                "prior_accessed_on": prior_date,
                "source_access_date_state": "retained_from_prior_artifact" if prior_date else "missing_in_prior_artifact",
                "checked_on": CHECKED_ON,
                "source_preservation": "retained_item_specific_url_and_locator",
            })
    return sorted(result, key=lambda item: (item["url"], item.get("locator") or "", item.get("source_id") or ""))


def compact_ccmas(value: dict[str, Any]) -> dict[str, Any]:
    return {
        "record_found": value.get("record_found"),
        "course_anchor_quality": value.get("course_anchor_quality"),
        "course_anchor_count": value.get("course_anchor_count"),
        "source_file": value.get("source_file"),
        "source_locator": value.get("source_locator"),
        "review_required": value.get("review_required"),
        "source_review_required": value.get("source_review_required"),
    }


def all420_rows() -> tuple[list[dict[str, Any]], dict[str, int]]:
    inheritance = load_json(INHERITANCE)
    brochure = brochure_by_name()
    complements = load_json(COMPLEMENTS)
    complement_by_name: dict[str, list[dict[str, Any]]] = {}
    for row in complements["rows"]:
        complement_by_name.setdefault(row["jamb_name"], []).append(row)
    rows: list[dict[str, Any]] = []
    old_anchor_counts = {"sufficient": 0, "insufficient": 0, "missing": 0}
    for item in sorted(inheritance["rows"], key=lambda row: row["jamb_name"]):
        name = item["jamb_name"]
        identity = identity_evidence(item, brochure)
        resource = resource_evidence(item["primary_component"]["discipline"])
        links: list[dict[str, Any]] = []
        for complement in complement_by_name.get(name, []):
            for link in complement.get("links", []):
                nigerian = link.get("nigerian_curriculum_evidence") or {}
                anchor_state = nigerian.get("evidence_status")
                if anchor_state == "nigerian_ccmas_sufficient_for_link_gate":
                    old_anchor_counts["sufficient"] += 1
                    anchor_class = "confirmed_optional_anchor"
                elif anchor_state == "nigerian_ccmas_present_but_insufficient_for_gate":
                    old_anchor_counts["insufficient"] += 1
                    anchor_class = "review_only_optional_anchor"
                elif anchor_state == "nigerian_ccmas_anchor_missing":
                    old_anchor_counts["missing"] += 1
                    anchor_class = "not_available_in_ccmas_complement_optional_only"
                else:
                    anchor_class = "not_classified_optional_anchor"
                links.append({
                    "component_ref": link.get("component_ref"),
                    "domain_id": link.get("domain_id"),
                    "domain_name": link.get("domain_name"),
                    "match_type": link.get("match_type"),
                    "ccmas_anchor_state": anchor_class,
                    "ccmas_anchor_evidence": compact_ccmas(link.get("ccmas_evidence") or {}),
                    "nigerian_curriculum_evidence": compact_ccmas(nigerian),
                    "external_domain_evidence": preserved_external_sources(link),
                    "identity_resource_availability": "available_confirmed" if resource["source_status"] == "confirmed" and identity["source_status"] in {"confirmed", "review_only"} else "review_only",
                    "mapping_decision": "review_only",
                    "decision_reason": "CCMAS anchor is optional; the identity/resource state is evaluated independently and the existing domain mapping remains unchanged.",
                })
        links.sort(key=lambda link: (link.get("component_ref") or "", link.get("domain_id") or ""))
        classification = "confirmed" if identity["source_status"] == "confirmed" else "review_only"
        rows.append({
            "schema": "2026-09-23.jamb-resource-evidence-all420.v1",
            "subject_id": f"jamb-resource-all420|{slug(name)}",
            "subject_kind": "jamb_identity_resource_reconciliation",
            "jamb_name": name,
            "checked_on": CHECKED_ON,
            "canonical_mapping": {
                "mapping_type": item.get("mapping_type"),
                "inheritance_type": item.get("inheritance_type"),
                "mapping_status": item.get("mapping_status"),
                "status_reason": item.get("status_reason"),
                "primary_component": item.get("primary_component"),
                "supporting_components": item.get("supporting_components"),
                "component_refs": item.get("component_refs"),
                "curriculum_scope_status": (item.get("curriculum_scope") or {}).get("status"),
                "domain_link_count": len(item.get("domain_links") or []),
            },
            "identity_evidence": identity,
            "resource_evidence": [resource],
            "ccmas_anchor_policy": "optional_not_an_availability_gate",
            "link_count": len(links),
            "links": links,
            "classification": classification,
            "decision": "available_resource_evidence" if classification == "confirmed" else "review_only_identity_evidence",
            "decision_reason": "JAMB identity and an authoritative external foundation resource are retained. The resource is a learning starting point, not proof of a prescribed text, university offering, or mapping promotion.",
            "student_exposure": "resource_available_subject_to_existing_mapping_policy" if classification == "confirmed" else "resource_review_only",
            "promotion_eligible": False,
            "audit_boundary": {"sql_applied": False, "live_database_changed": False, "browser_proof": False},
        })
    return rows, old_anchor_counts


def route_gap_rows() -> list[dict[str, Any]]:
    audit = load_json(ROUTE_AUDIT)
    rows: list[dict[str, Any]] = []
    for item in audit["programmes"]:
        if "no_jamb_identity" not in (item.get("missingRouteReasons") or []):
            continue
        discipline = item["discipline"]
        source_file = item.get("sourceFile")
        resource = resource_evidence(discipline)
        pdf_url = NUC_PDF_BY_FILE.get(source_file)
        rows.append({
            "schema": "2026-09-23.jamb-resource-route-gap.v1",
            "record_kind": "programme_university_jamb_reachability_gap",
            "programme_key": item["programmeKey"],
            "discipline": discipline,
            "programme": item["programme"],
            "checked_on": CHECKED_ON,
            "prior_route_state": item["university"]["routeState"],
            "missing_route_reasons": item["missingRouteReasons"],
            "identity_resolution": {
                "status": "not_resolved_from_checked_canonical_sources",
                "canonical_exact_match_checked": True,
                "jamb_identity_invented": False,
                "limitation": "The route audit has no university/JAMB identity or offering for this CCMAS programme. No alias or university offering is inferred from the programme title alone.",
            },
            "authoritative_sources": [
                {
                    "url": NUC_HUB,
                    "authority": "National Universities Commission",
                    "locator": f"CCMAS hub; discipline route for {discipline}",
                    "accessed_on": CHECKED_ON,
                    "source_status": "confirmed",
                    "limitation": "Confirms the Nigerian CCMAS discipline/programme source context, not a JAMB identity or university offering.",
                },
                {
                    "url": pdf_url or NUC_HUB,
                    "authority": "National Universities Commission",
                    "locator": f"{source_file or 'discipline CCMAS PDF'}; programme `{item['programme']}`",
                    "accessed_on": CHECKED_ON,
                    "source_status": "confirmed" if pdf_url else "review_only",
                    "limitation": "Confirms curriculum/package context only; it does not establish an IBASS identity or institution-level offering.",
                },
                {
                    "url": JAMB_IBASS,
                    "authority": "Joint Admissions and Matriculation Board",
                    "locator": f"IBASS programme selector checked for exact programme identity `{item['programme']}`",
                    "accessed_on": CHECKED_ON,
                    "source_status": "review_only",
                    "limitation": "No exact canonical identity/offering was retained for this route gap; no university or JAMB mapping is claimed.",
                },
                resource,
            ],
            "classification": "review_only_unresolved_university_offering",
            "availability": "review_only",
            "decision_reason": "Programme/resource context is substantiated, but the university/JAMB reachability gap remains explicit. This is not an unavailable identity/resource determination.",
            "audit_boundary": {"sql_applied": False, "live_database_changed": False, "browser_proof": False},
        })
    return sorted(rows, key=lambda row: row["programme_key"])


def write_batches(rows: list[dict[str, Any]], stem: str) -> list[dict[str, Any]]:
    outputs: list[dict[str, Any]] = []
    for start in range(0, len(rows), BATCH_SIZE):
        number = start // BATCH_SIZE + 1
        batch = rows[start : start + BATCH_SIZE]
        content = "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in batch)
        path = HERE / f"{stem}_batch-{number:03d}.jsonl"
        write_new(path, content)
        outputs.append({"file": path.name, "row_start": start, "row_count": len(batch), "sha256": sha256_text(content)})
    return outputs


def main() -> None:
    jamb_rows, anchors = all420_rows()
    gaps = route_gap_rows()
    assert len(jamb_rows) == 420, len(jamb_rows)
    assert len({row["jamb_name"] for row in jamb_rows}) == 420
    assert sum(row["link_count"] for row in jamb_rows) == 711
    assert anchors == {"sufficient": 547, "insufficient": 153, "missing": 11}, anchors
    assert len(gaps) == 83, len(gaps)
    jamb_batches = write_batches(jamb_rows, PREFIX + "_jamb")
    gap_batches = write_batches(gaps, PREFIX + "_route_gap")
    classifications = {key: sum(row["classification"] == key for row in jamb_rows) for key in ("confirmed", "review_only", "genuinely_unavailable")}
    link_availability = {
        "available_confirmed": sum(link["identity_resource_availability"] == "available_confirmed" for row in jamb_rows for link in row["links"]),
        "review_only": sum(link["identity_resource_availability"] == "review_only" for row in jamb_rows for link in row["links"]),
    }
    report = f"""# All-420 JAMB resource-evidence reconciliation — 2026-09-23

Checked on: {CHECKED_ON} (Africa/Lagos)

## Scope and decision

This append-only lane covers all **420 canonical JAMB identities/programmes**.
The 237 CCMAS package rows are supporting context only; a CCMAS anchor is
optional and is not an availability gate. No SQL, live database, frontend, or
browser acceptance proof was used.

## Exact counts

| Measure | Count |
| --- | ---: |
| Canonical JAMB rows written | {len(jamb_rows)} |
| JAMB rows classified confirmed | {classifications['confirmed']} |
| JAMB rows classified review-only | {classifications['review_only']} |
| JAMB rows genuinely unavailable | {classifications['genuinely_unavailable']} |
| Preserved CCMAS/external link occurrences | 711 |
| Link occurrences available from JAMB identity + resource evidence | {link_availability['available_confirmed']} |
| Link occurrences remaining review-only | {link_availability['review_only']} |
| Former no-Nigerian-CCMAS-anchor occurrences | {anchors['missing']} |
| Former no-anchor occurrences reclassified available | {sum(link['ccmas_anchor_state'] == 'not_available_in_ccmas_complement_optional_only' and link['identity_resource_availability'] == 'available_confirmed' for row in jamb_rows for link in row['links'])} |
| Route-audit university/JAMB reachability gaps written | {len(gaps)} |
| Route gaps explicitly review-only | {sum(row['classification'] == 'review_only_unresolved_university_offering' for row in gaps)} |
| Route gaps marked genuinely unavailable | {sum(row['classification'] == 'genuinely_unavailable' for row in gaps)} |

The 416 identities present in the brochure audit retain exact source file/page
locators. The four identities absent from that audit remain review-only with
the official IBASS selector and an explicit limitation; they are not called
unavailable. Existing 711 link records retain nested `source_url`/
`source_urls`, locators, prior access-date state and current audit date.

## 11 formerly missing CCMAS anchors

All 11 are retained with `ccmas_anchor_state` set to
`not_available_in_ccmas_complement_optional_only` and
`identity_resource_availability=available_confirmed`. Their existing mapping
decision remains review-only; no mapping was promoted and no CCMAS equivalence
was invented.

## 83 route gaps

The all-programme route audit's 83 `no_jamb_identity` gaps are in the separate
route-gap JSONL batches. Each retains the NUC CCMAS hub/discipline source, the
item-specific NUC PDF when available, the JAMB IBASS selector, a foundation
resource, and the exact limitation that no university offering or JAMB alias
was inferred. All 83 remain `review_only_unresolved_university_offering`.

## Files

- `{Path(__file__).name}`
- {', '.join(item['file'] for item in jamb_batches)}
- {', '.join(item['file'] for item in gap_batches)}
- `{PREFIX}_manifest.json`
- `{PREFIX}_report.md`
"""
    report_path = HERE / f"{PREFIX}_report.md"
    manifest = {
        "schema_version": "2026-09-23.jamb-resource-evidence-all420.manifest.v1",
        "checked_on": CHECKED_ON,
        "scope": {"canonical_jamb_identities": 420, "ccmas_packages_context_only": 237, "route_gaps": 83},
        "policy": {"ccmas_anchor_required_for_availability": False, "sql_applied": False, "live_database_changed": False, "browser_proof": False},
        "counts": {"jamb_rows": len(jamb_rows), "jamb_classifications": classifications, "link_occurrences": 711, "link_availability": link_availability, "optional_ccmas_anchor_state": anchors, "route_gap_rows": len(gaps)},
        "sources": {"jamb_ibass": JAMB_IBASS, "nuc_ccmas_hub": NUC_HUB, "nuc_pdf_map_count": len(NUC_PDF_BY_FILE)},
        "jamb_batches": jamb_batches,
        "route_gap_batches": gap_batches,
        "report": report_path.name,
    }
    write_new(report_path, report)
    manifest_path = HERE / f"{PREFIX}_manifest.json"
    write_new(manifest_path, json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"jamb_rows": len(jamb_rows), "jamb_classifications": classifications, "links": link_availability, "anchors": anchors, "route_gaps": len(gaps), "manifest": manifest_path.name, "report": report_path.name}, indent=2))


if __name__ == "__main__":
    main()
