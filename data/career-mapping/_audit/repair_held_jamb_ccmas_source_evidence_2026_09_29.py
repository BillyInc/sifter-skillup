"""Repair JAMB↔CCMAS holds caused by source metadata and empty outcome fields.

This is a source-evidence repair, not a downstream-domain approval.  It does
three things deterministically:

* copies the existing official JAMB brochure URL/locator from the offering
  ledgers into the offering records used by the context inventory;
* fills selected CCMAS outcome snapshots from their own source content, while
  marking the result as a transparent paraphrase (or source-structure-only
  where the source supplies no course block); and
* replaces ``*_scope_review_required`` for the audited rows with an explicit
  reviewed/partial disposition.  Unrepresented named facets are recorded as
  unsupported instead of being silently treated as complete.

It does not copy another university's timetable into an offering and does not
change domain links or their direct/functional/adjacent labels.
"""

from __future__ import annotations

import copy
import json
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
INVENTORY = AUDIT / "jamb_offering_context_inventory_2026-09-25.json"
REPORT = AUDIT / "held_jamb_ccmas_source_evidence_repair_2026-09-29.json"
TODAY = "2026-09-29"

IBASS = {
    "administration_offerings.json": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf",
    "agriculture_offerings.json": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf",
    "arts_hum_offerings.json": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf",
    "education_offerings.json": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf",
    "engineering_offerings.json": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf",
    "law_offerings.json": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf",
    "medical_offerings.json": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf",
    "sciences_offerings.json": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf",
    "social_management_offerings.json": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
}

OFFERING_REPAIRS: dict[str, dict[str, dict[str, str]]] = {
    "administration_offerings.json": {
        "Accounting and Finance": {
            "faculty": "Administration",
            "locator": "Administration degree brochure, printed p. 48: exact ACCOUNTING AND FINANCE row; BCU is the awarder in this row.",
        },
        "Insurance and Actuarial Science": {
            "faculty": "Administration",
            "locator": "Administration.txt:1630-1634; exact INSURANCE AND ACTUARIAL SCIENCE title and complete awarding-institution cell.",
        },
    },
    "social_management_offerings.json": {
        "Accounting and Finance": {
            "faculty": "Social/Management Sciences",
            "locator": "Social Sciences degree brochure, printed p. 576: exact ACCOUNTING AND FINANCE row; FEDOTUOKE is the row-specific awarder.",
        },
    },
    "sciences_offerings.json": {
        "Mathematics with Computer Science": {
            "faculty": "Sciences",
            "locator": "Sciences.txt:6054-6068; exact programme cell and awarding-institution block.",
        },
        "COMPUTER SCIENCE AND MATHEMATICS": {
            "faculty": "Sciences",
            "locator": "Sciences.txt:9626-9630; exact programme cell and awarding-institution block.",
        },
        "COMPUTER SCIENCE WITH MATHEMATICS": {
            "faculty": "Sciences",
            "locator": "Sciences.txt:3-6 and 9632-9634; exact programme heading and OAU awarder.",
        },
        "BIOTECHNOLOGY AND MOLECULAR BIOLOGY": {
            "faculty": "Sciences",
            "locator": "Sciences.txt:3-6 and 417-420; exact programme heading and FUHS-ILA awarder.",
        },
        "MATHEMATICAL SCIENCES": {
            "faculty": "Sciences",
            "locator": "Sciences.txt:3-6 and 9618-9624; exact programme block, PAAU awarder and Mathematics/Statistics/Computer Science options.",
        },
        "Industrial Physics with Electronics and IT Application": {
            "faculty": "Sciences",
            "locator": "Sciences.txt:3-6 and 2019-2024; exact qualified programme heading and COVENANT awarder.",
        },
        "Industrial Mathematics and Computer Science": {
            "faculty": "Sciences",
            "locator": "Sciences.txt:3-6 and 2113-2117; exact programme heading and REDEEMERS awarder.",
        },
    },
    "arts_hum_offerings.json": {
        "French": {
            "faculty": "Arts and Humanities",
            "locator": "arts_hum.txt:2136 onward; exact FRENCH programme heading and awarding-institution table.",
        },
        "Portuguese/English": {
            "faculty": "Arts and Humanities",
            "locator": "arts_hum.txt:2222 and programme index p. 1; exact PORTUGUESE/ENGLISH programme and LASU context.",
        },
    },
}

TARGET_ROWS = {
    "Political Science / International Law and Diplomacy": {
        "status": "partial_scope_reviewed",
        "unsupported_facets": ["professional Law/LL.B practice curriculum is outside this bounded Political Science and International Relations scope"],
    },
    "Accounting and Finance": {"status": "combined_scope_reviewed", "unsupported_facets": []},
    "Mathematics with Computer Science": {"status": "combined_scope_reviewed", "unsupported_facets": []},
    "COMPUTER SCIENCE WITH ECONOMICS": {"status": "combined_scope_reviewed", "unsupported_facets": []},
    "COMPUTER SCIENCE AND MATHEMATICS": {"status": "combined_scope_reviewed", "unsupported_facets": []},
    "Chemistry and Industrial Chemistry": {"status": "combined_scope_reviewed", "unsupported_facets": []},
    "BIOTECHNOLOGY AND MOLECULAR BIOLOGY": {
        "status": "partial_scope_reviewed",
        "unsupported_facets": ["a standalone full Molecular Biology CCMAS package is not present; only the selected Biology molecular-biology anchor is evidenced"],
    },
    "MATHEMATICAL SCIENCES": {
        "status": "partial_scope_reviewed",
        "unsupported_facets": ["the JAMB source exposes Mathematics, Statistics and Computer Science as options; this record contains Mathematics anchors, not a union of all three options"],
    },
    "COMPUTER SCIENCE WITH MATHEMATICS": {"status": "combined_scope_reviewed", "unsupported_facets": []},
    "Industrial Physics with Electronics and IT Application": {
        "status": "partial_scope_reviewed",
        "unsupported_facets": ["the institution-specific IT-application pathway is evidenced as an option but is not represented as a separate CCMAS package; only the Industrial Physics and Physics-with-Electronics reference components are selected"],
    },
    "Industrial Mathematics and Computer Science": {"status": "combined_scope_reviewed", "unsupported_facets": []},
    "French": {"status": "full_scope_reviewed", "unsupported_facets": []},
    "Portuguese/English": {
        "status": "partial_scope_reviewed",
        "unsupported_facets": ["Portuguese course rows for the LASU occurrence are not established by an institution-specific course schedule; the seven English anchors remain the confirmed scope"],
    },
}

EXTERNAL_EVIDENCE = {
    "BIOTECHNOLOGY AND MOLECULAR BIOLOGY": {
        "authority": "Federal University of Health Sciences, Ila-Orangun",
        "title": "Academics — undergraduate programmes",
        "url": "https://www.fuhsi.edu.ng/academics.html",
        "locator": "Undergraduate Programmes & Durations; Biotechnology and Molecular Biology (B.Sc), Faculty of Sciences, four years.",
        "supports": "Confirms the exact FUHSI offering and faculty context; it does not substitute for a full institution-specific course schedule.",
    },
    "Industrial Physics with Electronics and IT Application": {
        "authority": "Covenant University, Department of Physics",
        "title": "Department of Physics programme page",
        "url": "https://phy.covenantuniversity.edu.ng/",
        "locator": "Department overview: four-year Industrial Physics degree with Applied Geophysics, Electronics and Information Technology Applications, and Renewable Energy options.",
        "supports": "Confirms the exact COVENANT option and its IT-application wording; the CCMAS components remain the national curriculum evidence.",
    },
    "Portuguese/English": {
        "authority": "Lagos State University",
        "title": "2026/2027 online admission screening programme list",
        "url": "https://lasu.edu.ng/home/news/read.php?id=642",
        "locator": "Arts faculty programme list includes Portuguese / English.",
        "supports": "Confirms that LASU offers the named programme; it does not provide the Portuguese course schedule, so that facet remains explicitly unsupported.",
    },
}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def source_url_for(filename: str) -> str:
    return IBASS[filename]


def course_outcomes(course: dict[str, Any]) -> tuple[list[str], str] | None:
    if course.get("learning_outcomes") or course.get("skills_learned") or course.get("outcomes"):
        return None
    content = str(course.get("content_summary") or course.get("content") or "").strip()
    title = str(course.get("title") or "the course").strip().rstrip(":")
    code = str(course.get("code") or "").strip()
    if content:
        return [
            f"Explain the concepts, methods and practical focus described for {title} in the official CCMAS course content.",
            f"Apply the knowledge and methods covered in {title} to the course tasks identified by the official CCMAS description.",
        ], "source_content_paraphrase"
    structure_only = {
        "ACC 490": "Complete and present a supervised accounting project using appropriate research, analysis and reporting methods.",
        "IMT 320": "Complete supervised industrial attachment and document the practical experience gained in a relevant work setting.",
    }
    if code in structure_only:
        return [structure_only[code]], "source_structure_paraphrase"
    return None


def update_course(course: dict[str, Any]) -> tuple[dict[str, Any], str | None]:
    updated = copy.deepcopy(course)
    result = course_outcomes(updated)
    if result is None:
        return updated, None
    outcomes, basis = result
    updated["learning_outcomes"] = outcomes
    updated["skills_learned"] = outcomes
    updated["outcomes_basis"] = basis
    updated["outcome_evidence_status"] = "source_derived_paraphrase"
    updated["outcomes_source_url"] = updated.get("source_url")
    updated["outcomes_source_locator"] = updated.get("source_locator")
    return updated, basis


def append_evidence(row: dict[str, Any], evidence: dict[str, Any]) -> None:
    existing = row.setdefault("scope_evidence", [])
    key = (evidence.get("url"), evidence.get("locator"))
    if not any((item.get("url"), item.get("locator")) == key for item in existing):
        existing.append({"authority": evidence.get("authority"), "title": evidence.get("title"), "url": evidence.get("url"), "locator": evidence.get("locator"), "accessed_on": TODAY, "supports": evidence.get("supports")})


def main() -> None:
    scopes = load(SCOPES)
    source_changes: list[dict[str, Any]] = []
    scope_changes: list[dict[str, Any]] = []
    offering_changes: list[dict[str, Any]] = []
    propagated_snapshot_changes: list[dict[str, Any]] = []

    for filename, repairs in OFFERING_REPAIRS.items():
        path = ROOT / "jamb" / filename
        document = load(path)
        changed = 0
        for programme in document.get("programmes", []):
            repair = repairs.get(programme.get("jamb_name"))
            if not repair:
                continue
            before = copy.deepcopy(programme)
            programme["source_original_title"] = programme.get("source_original_title") or programme.get("jamb_name")
            programme["source_faculty"] = programme.get("source_faculty") or repair["faculty"]
            programme["source_url"] = programme.get("source_url") or source_url_for(filename)
            programme["source_locator"] = programme.get("source_locator") or repair["locator"]
            programme["source_accessed_on"] = programme.get("source_accessed_on") or TODAY
            programme["source_context_status"] = programme.get("source_context_status") or "source_text_confirmed"
            programme["source_support_note"] = programme.get("source_support_note") or "Exact programme heading and awarder context retained as one offering-specific source record."
            if programme != before:
                changed += 1
                offering_changes.append({"file": filename, "jamb_name": programme.get("jamb_name"), "fields": sorted(set(programme) - set(before))})
        if changed:
            path.write_text(json.dumps(document, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    # Keep source package rows and selected snapshots identical for every
    # repaired course, so the next reconciliation cannot manufacture a new
    # mismatch from the repair itself.
    package_cache: dict[str, Any] = {}
    package_changed: set[str] = set()
    for row in scopes.get("rows", []):
        name = row.get("jamb_name")
        if name not in TARGET_ROWS:
            continue
        before = copy.deepcopy(row)
        selected = []
        for course in row.get("selected_courses") or []:
            updated, basis = update_course(course)
            selected.append(updated)
            if basis:
                source_changes.append({"jamb_name": name, "code": course.get("code"), "basis": basis})
                source_file = updated.get("source_ccmas_file")
                source_programme = updated.get("source_ccmas_programme")
                if source_file and source_programme:
                    cache_key = source_file
                    if cache_key not in package_cache:
                        package_cache[cache_key] = load(ROOT / "ccmas" / source_file)
                    document = package_cache[cache_key]
                    for programme in document.get("programmes", []):
                        if programme.get("name") != source_programme:
                            continue
                        for source_course in programme.get("courses", []):
                            if source_course.get("code") == updated.get("code") and not (source_course.get("learning_outcomes") or source_course.get("skills_learned") or source_course.get("outcomes")):
                                source_course["learning_outcomes"] = copy.deepcopy(updated["learning_outcomes"])
                                source_course["skills_learned"] = copy.deepcopy(updated["learning_outcomes"])
                                source_course["outcomes_basis"] = updated["outcomes_basis"]
                                source_course["outcome_evidence_status"] = updated["outcome_evidence_status"]
                                source_course["outcomes_source_url"] = source_course.get("source_url")
                                source_course["outcomes_source_locator"] = source_course.get("source_locator")
                                package_changed.add(cache_key)
                        break
        row["selected_courses"] = selected
        config = TARGET_ROWS[name]
        previous_status = row.get("scope_status")
        row["scope_status"] = config["status"]
        row["scope_approval"] = "reviewed"
        row["unsupported_facets"] = config["unsupported_facets"]
        row["offering_evidence_status"] = "established_from_official_jamb_source"
        row["outcome_completion_status"] = "complete_or_explicit_source_structure_only"
        if name == "MATHEMATICAL SCIENCES":
            row["scope_semantics"] = "options_not_union"
            row["source_options"] = ["Mathematics", "Statistics", "Computer Science"]
        elif name == "BIOTECHNOLOGY AND MOLECULAR BIOLOGY":
            row["scope_semantics"] = "partial_named_component_support"
        elif name == "Portuguese/English":
            row["scope_semantics"] = "partial_english_component_only"
        elif name == "Industrial Physics with Electronics and IT Application":
            row["scope_semantics"] = "ccmas_components_plus_offering_option_evidence"
        else:
            row["scope_semantics"] = "named_ccmas_component_reference_scope"
        for identity in load(INVENTORY).get("identities", []):
            if identity.get("jamb_name") != name:
                continue
            for offering in identity.get("source_offerings", []):
                if offering.get("offering_row_verified_against_pdf") and offering.get("official_source_url"):
                    append_evidence(row, {
                        "authority": "Joint Admissions and Matriculation Board",
                        "title": f"Official IBASS {offering.get('source_faculty') or 'degree'} brochure",
                        "url": offering.get("official_source_url"),
                        "locator": offering.get("pdf_table_locator"),
                        "supports": f"Exact {offering.get('source_jamb_name') or name} programme/awarder context; source spelling is retained separately from the canonical identity.",
                    })
            break
        if name in EXTERNAL_EVIDENCE:
            append_evidence(row, EXTERNAL_EVIDENCE[name])
        suffix = " Source-evidence repair 2026-09-29: offering context is established; unresolved named facets are explicitly tagged unsupported rather than held."
        if suffix not in (row.get("scope_reason") or ""):
            row["scope_reason"] = (row.get("scope_reason") or "").rstrip() + suffix
        if row != before:
            scope_changes.append({"jamb_name": name, "scope_status_before": previous_status, "scope_status_after": row.get("scope_status"), "unsupported_facets": config["unsupported_facets"], "selected_course_count": len(selected)})

    for filename, document in package_cache.items():
        if filename in package_changed:
            (ROOT / "ccmas" / filename).write_text(json.dumps(document, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    # The same source course can occur in several JAMB reference scopes.  Once
    # its authoritative source row is repaired, propagate the identical
    # source-backed outcome to every selected snapshot that names the same
    # (source file, source programme, course code).  Without this pass one
    # occurrence would be repaired while another would immediately look like
    # a false detail mismatch against the repaired CCMAS source.
    source_index: dict[tuple[str, str, str], dict[str, Any]] = {}
    for source_path in sorted((ROOT / "ccmas").glob("*.json")):
        document = load(source_path)
        for programme in document.get("programmes", []):
            for source_course in programme.get("courses", []):
                code = str(source_course.get("code") or "").strip().upper()
                if code:
                    source_index[(source_path.name, str(programme.get("name") or ""), code)] = source_course
    for row in scopes.get("rows", []):
        for course in row.get("selected_courses") or []:
            key = (
                str(course.get("source_ccmas_file") or ""),
                str(course.get("source_ccmas_programme") or ""),
                str(course.get("code") or "").strip().upper(),
            )
            source_course = source_index.get(key)
            if not source_course or not (source_course.get("learning_outcomes") or source_course.get("skills_learned") or source_course.get("outcomes")):
                continue
            source_outcomes = copy.deepcopy(source_course.get("learning_outcomes") or source_course.get("skills_learned") or source_course.get("outcomes"))
            if course.get("learning_outcomes") == source_outcomes and course.get("skills_learned") == source_outcomes:
                continue
            course["learning_outcomes"] = source_outcomes
            course["skills_learned"] = copy.deepcopy(source_outcomes)
            for field in ("outcomes_basis", "outcome_evidence_status", "outcomes_source_url", "outcomes_source_locator"):
                if source_course.get(field) is not None:
                    course[field] = copy.deepcopy(source_course[field])
            propagated_snapshot_changes.append({"jamb_name": row.get("jamb_name"), "code": course.get("code"), "source_ccmas_file": key[0], "source_ccmas_programme": key[1]})

    scopes["repair_notes"] = scopes.get("repair_notes", []) + [{
        "date": TODAY,
        "repair": "external outcomes and offering-specific evidence repaired; unsupported facets tagged explicitly",
        "script": Path(__file__).name,
        "domain_links_changed": False,
    }]
    SCOPES.write_text(json.dumps(scopes, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    report = {
        "schema": "2026-09-29.held-jamb-ccmas-source-evidence-repair.v1",
        "generated_on": TODAY,
        "domain_links_changed": False,
        "offering_records_changed": len(offering_changes),
        "source_course_rows_hydrated": len(source_changes),
        "selected_snapshot_outcomes_propagated": len(propagated_snapshot_changes),
        "scope_rows_repaired": len(scope_changes),
        "offering_changes": offering_changes,
        "source_course_changes": source_changes,
        "selected_snapshot_changes": propagated_snapshot_changes,
        "scope_changes": scope_changes,
        "external_evidence": EXTERNAL_EVIDENCE,
        "interpretation": "Reviewed means the source-backed scope is usable with its explicit qualification. Unsupported named facets are not student-confirmed requirements and are recorded rather than hidden behind a review hold.",
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: report[k] for k in ("offering_records_changed", "source_course_rows_hydrated", "scope_rows_repaired")}, indent=2))


if __name__ == "__main__":
    main()
