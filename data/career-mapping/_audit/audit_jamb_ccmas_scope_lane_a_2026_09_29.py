#!/usr/bin/env python3
"""Audit the remaining JAMB<->CCMAS scope-review cases for Lane A.

This is an append-only audit producer.  It reads the current reconciliation,
scope contract and CCMAS packages, then writes a timestamped JSON/Markdown
checkpoint.  It deliberately does not edit canonical mappings, scope rows,
CCMAS source files, domain mappings, seeds or SQL.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
CAREER = ROOT / "data" / "career-mapping"
SCOPE_PATH = HERE / "jamb_curriculum_scopes_2026-08-17.json"
RECON_PATH = HERE / "jamb_ccmas_domain_mapping_reconciliation_2026-09-29.json"
QUEUE_PATH = HERE / "jamb_ccmas_targeted_repair_queue_2026-09-29.json"
RESIDUAL_PATH = HERE / "jamb_ccmas_residual_mapping_lane_3_2026-09-29_increment_005.json"
CHECKED_ON = "2026-09-29"
STAMP = "2026-09-29_1645"
OUT_JSON = HERE / f"jamb_ccmas_scope_audit_lane_a_{STAMP}.json"
OUT_MD = HERE / f"jamb_ccmas_scope_audit_lane_a_{STAMP}.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def code(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip()).upper()


def source_ref(record: dict[str, Any]) -> dict[str, Any]:
    return {
        "authority": record.get("authority"),
        "title": record.get("title"),
        "url": record.get("url") or record.get("source_url"),
        "locator": record.get("locator") or record.get("source_locator"),
        "accessed_on": record.get("accessed_on") or record.get("source_accessed_on"),
        "supports": record.get("supports"),
    }


# These are adjudications of the current local evidence, not edits to the
# source contracts.  The status wording intentionally distinguishes a real
# scope defect from a residual offering-context check.
ADJUDICATIONS: dict[str, dict[str, Any]] = {
    "Political Science / International Law and Diplomacy": {
        "outcome": "bounded_scope_supported_context_pending",
        "confirmed_defects": [],
        "candidates": [
            "The seven selected courses explicitly cover Political Science, international relations, diplomacy and public international law, but they are a bounded partial scope rather than a complete programme timetable.",
            "The Babcock schedule corroborates the named track; it is not evidence that every JAMB institution offering the same display name has the same course plan.",
        ],
        "proposed_deterministic_fix": [
            "Promote only to partial_scope_reviewed after retaining the JAMB and Babcock context references; do not expand it to a full union.",
            "Keep the four Political Science and three International Relations course anchors as the explicit evidence for the named facets.",
        ],
    },
    "Political Science and Defence Studies": {
        "outcome": "full_ccmas_scope_supported_context_pending",
        "confirmed_defects": [],
        "candidates": [
            "The full 41-course Political Science CCMAS package is present and includes source-explicit POL 401 Civil-Military Relations and POL 403 Contemporary Defence and Strategic Studies.",
            "The remaining check is the exact NDA offering context, not a missing Defence Studies curriculum component.",
        ],
        "proposed_deterministic_fix": [
            "Promote to full_scope_reviewed if the already cited NDA JAMB cell is accepted; preserve the defence/strategic facet tags without inventing a separate CCMAS package.",
        ],
    },
    "Sociology and Anthroplogy": {
        "outcome": "combined_scope_external_provenance_gap",
        "confirmed_defects": [
            "The 34-course Sociology component is complete, and 21 Anthropology courses are present, but the scope_evidence objects themselves omit authority, URL, locator and access date even though the selected external course rows carry URLs and locators.",
            "The external Anthropology sources provide published course content, not a JAMB-institution-specific timetable or CCMAS learning-outcome contract.",
        ],
        "candidates": [
            "The component boundary is valid as Sociology plus an explicitly external Anthropology component; the JAMB spelling 'Anthroplogy' is retained as source identity and should not be silently normalized here.",
        ],
        "proposed_deterministic_fix": [
            "Add a component-level provenance record from the existing UNN and UNIZIK course URLs, with access date and course-level locators.",
            "Keep the Anthropology rows clearly external_curriculum and keep the combined scope held until an institution-specific source or sufficiently authoritative outcomes source is available; do not fabricate outcomes.",
        ],
    },
    "Actuarial Science": {
        "outcome": "full_ccmas_scope_supported_context_pending",
        "confirmed_defects": [],
        "candidates": [
            "All 35 Actuarial Science CCMAS courses are selected and resolve to the package with populated content/outcomes.",
            "The NUC curriculum evidence is sufficient for the component; the remaining uncertainty is the exact JAMB offering cell/institution association.",
        ],
        "proposed_deterministic_fix": [
            "Verify the exact Administration-brochure offering cell, then promote the full CCMAS scope without adding an external curriculum or changing downstream links.",
        ],
    },
    "Accounting and Finance": {
        "outcome": "combined_ccmas_components_supported_context_preserved",
        "confirmed_defects": [
            "ACC 490 Project appears in the Accounting structure but has no detailed NUC content/outcome block; it must remain source-structure-only rather than receiving invented outcomes.",
        ],
        "candidates": [
            "The mapping correctly contains both full CCMAS components: Finance/Banking and Finance (34 courses) and Accounting (31 courses).",
            "The Administration BCU occurrence and Social Sciences FUOTUOKE occurrence are distinct source contexts; the cited university pages corroborate identity/faculty context, not a university-specific course schedule.",
        ],
        "proposed_deterministic_fix": [
            "Retain separate JAMB offering contexts and promote the two-component CCMAS union only as national supporting curriculum evidence.",
            "Keep ACC 490 without a fabricated learning outcome and label the union as CCMAS support, not either university's exact timetable.",
        ],
    },
    "Insurance and Actuarial Science": {
        "outcome": "combined_ccmas_components_supported_context_pending",
        "confirmed_defects": [],
        "candidates": [
            "The full Insurance component (32 courses) and full Actuarial Science component (35 courses) are both present, with distinct component facets and source resolution.",
            "The open question is offering-specific context, not whether the two named CCMAS components were included.",
        ],
        "proposed_deterministic_fix": [
            "Promote as a two-component CCMAS support scope once the exact JAMB offering context is retained; do not collapse either component into the other or infer a third curriculum.",
        ],
    },
    "Mathematics with Computer Science": {
        "outcome": "combined_ccmas_components_supported_course_detail_closed",
        "confirmed_defects": [],
        "candidates": [
            "Both full components are present: Mathematics 39/39 and Computer Science 38/38.",
            "Known empty outcome fields for MTH 399 and MTH 404 belong to the already closed course-detail lane and were not re-audited here.",
        ],
        "proposed_deterministic_fix": [
            "Promote the scope to combined_scope_reviewed with explicit Mathematics and Computer Science facets; leave course-detail repairs to the closed course-detail ledger.",
        ],
    },
    "COMPUTER SCIENCE WITH ECONOMICS": {
        "outcome": "combined_ccmas_components_supported_course_detail_closed",
        "confirmed_defects": [],
        "candidates": [
            "Both full components are present: Computer Science 38/38 and Economics 38/38; the title is not being treated as Computer Science alone.",
            "The six empty Computer Science content fields belong to the closed course-detail lane and are not a scope-boundary defect.",
        ],
        "proposed_deterministic_fix": [
            "Promote to combined_scope_reviewed and preserve separate Economics and Computer Science component provenance.",
        ],
    },
    "COMPUTER SCIENCE AND MATHEMATICS": {
        "outcome": "combined_ccmas_components_supported_course_detail_closed",
        "confirmed_defects": [],
        "candidates": [
            "Both full components are present: Computer Science 38/38 and Mathematics 39/39; Mathematics is not missing.",
            "The known MTH 399/MTH 404 detail fields are covered by the closed course-detail work and were not repeated.",
        ],
        "proposed_deterministic_fix": [
            "Promote to combined_scope_reviewed with both components and their separate course evidence.",
        ],
    },
    "Chemistry and Industrial Chemistry": {
        "outcome": "combined_ccmas_components_supported_course_detail_closed",
        "confirmed_defects": [],
        "candidates": [
            "Both full components are present: Chemistry 42/42 and Industrial Chemistry 42/42.",
            "The known ICH 400 detail field belongs to the closed course-detail lane, not to component selection.",
        ],
        "proposed_deterministic_fix": [
            "Promote to combined_scope_reviewed and retain distinct Chemistry and Industrial Chemistry provenance.",
        ],
    },
    "BIOTECHNOLOGY AND MOLECULAR BIOLOGY": {
        "outcome": "confirmed_partial_component_gap",
        "confirmed_defects": [
            "The selected scope contains 23 Biotechnology courses out of the 42-course package and only one Biology course used as a Molecular Biology supporting anchor; it is not a complete two-package union.",
            "There is no standalone CCMAS programme named Molecular Biology in the selected evidence, so the title cannot justify inheriting the full Biology package.",
        ],
        "candidates": [
            "The single Biology course can support a bounded molecular-biology facet, but it does not establish the full Biology/Molecular Biology curriculum.",
        ],
        "proposed_deterministic_fix": [
            "Keep Biotechnology and the single source-backed Biology anchor explicitly separated and partial.",
            "Search for an authoritative institution-specific Molecular Biology curriculum before adding more courses; do not auto-union the full Biology package.",
        ],
    },
    "MATHEMATICAL SCIENCES": {
        "outcome": "partial_scope_external_identity_unresolved",
        "confirmed_defects": [
            "Only seven Mathematics courses are selected from the 39-course CCMAS Mathematics package, and the scope has no scope-level evidence record.",
            "The display name Mathematical Sciences is not itself a CCMAS programme identity, so Mathematics-only evidence cannot be presented as a complete Mathematical Sciences curriculum.",
        ],
        "candidates": [
            "Official university pages show that Mathematical Sciences may be a departmental umbrella or a locally combined programme, but they do not establish this JAMB identity's exact curriculum.",
        ],
        "proposed_deterministic_fix": [
            "Keep the seven Mathematics anchors as partial evidence only; attach an exact institution-specific authoritative curriculum if the JAMB offering context is resolved.",
            "Do not mark unavailable solely because CCMAS has no exact Mathematical Sciences package, and do not promote the current partial scope as complete.",
        ],
    },
    "COMPUTER SCIENCE WITH MATHEMATICS": {
        "outcome": "combined_ccmas_components_supported_course_detail_closed",
        "confirmed_defects": [],
        "candidates": [
            "Both full components are present: Computer Science 38/38 and Mathematics 39/39.",
            "The known MTH 399/MTH 404 detail fields belong to the closed course-detail lane.",
        ],
        "proposed_deterministic_fix": [
            "Promote to combined_scope_reviewed with explicit component provenance; do not treat it as a Computer Science-only route.",
        ],
    },
    "Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics)": {
        "outcome": "combined_alternative_branches_supported",
        "confirmed_defects": [
            "The source describes two alternatives, but a flat selected-course array could be rendered incorrectly as if a student must take both branches simultaneously.",
        ],
        "candidates": [
            "Industrial Physics 33/33 and Physics with Electronics 25/25 are both complete source branches; the facet labels already record that they are alternatives.",
        ],
        "proposed_deterministic_fix": [
            "Store/present the two branches as mutually exclusive options, not as one mandatory 58-course checklist; promote only with that branch semantics preserved.",
        ],
    },
    "Industrial Physics with Applied Geophysics": {
        "outcome": "combined_ccmas_components_supported_context_pending",
        "confirmed_defects": [],
        "candidates": [
            "Both full components are present: Industrial Physics 33/33 and Applied Geophysics 44/44.",
            "The exact JAMB institution context remains separate from the national CCMAS union; the union itself is not a title-only inference.",
        ],
        "proposed_deterministic_fix": [
            "Promote the two-component scope after exact offering-context verification, retaining both component locators and no invented third component.",
        ],
    },
    "Industrial Physics with Electronics and IT Application": {
        "outcome": "confirmed_it_application_facet_gap",
        "confirmed_defects": [
            "Industrial Physics 33/33 and Physics with Electronics 25/25 are present, but the selected CCMAS evidence does not establish a separate IT-application curriculum or Computer Science component.",
            "The title's IT Application facet must not be treated as proven by an electronics component or by a keyword match.",
        ],
        "candidates": [
            "The exact JAMB row identifies the programme, but the targeted external search did not locate an authoritative institution curriculum that establishes the IT facet; non-authoritative project-topic and brochure mirrors were rejected.",
        ],
        "proposed_deterministic_fix": [
            "Keep the two CCMAS components and mark IT Application as an unresolved facet; do not add Computer Science courses without authoritative component evidence.",
            "Resolve the exact Covenant curriculum before promoting the scope beyond the two verified CCMAS components.",
        ],
    },
    "Industrial Mathematics and Computer Science": {
        "outcome": "combined_ccmas_components_supported_course_detail_closed",
        "confirmed_defects": [],
        "candidates": [
            "Both full components are present: Industrial Mathematics 34/34 and Computer Science 38/38.",
            "The known IMT 320 detail gap belongs to the closed course-detail lane, not to the component boundary.",
        ],
        "proposed_deterministic_fix": [
            "Promote to combined_scope_reviewed with separate Industrial Mathematics and Computer Science evidence.",
        ],
    },
    "French": {
        "outcome": "full_ccmas_scope_supported_context_pending",
        "confirmed_defects": [],
        "candidates": [
            "All 40 French-package courses are selected and resolve to the full Modern European Languages B.A. (French) package.",
            "The 32 missing outcome fields are part of the closed course-detail lane; this scope audit does not repeat them.",
            "The exact JAMB offering cell remains the outstanding context check.",
        ],
        "proposed_deterministic_fix": [
            "Verify the exact JAMB offering context, then promote the full French CCMAS scope without importing an external language curriculum.",
        ],
    },
    "Portuguese/English": {
        "outcome": "confirmed_missing_named_component",
        "confirmed_defects": [
            "The selected scope contains only seven English Language and Literature courses; no Portuguese component is selected.",
            "The seven selected course rows lack source URL metadata even though the scope-level CCMAS references identify the English source.",
        ],
        "candidates": [
            "The official OAU Foreign Languages Handbook confirms that Portuguese/English is a genuine combined degree and lists Portuguese course codes, but it is a comparator and does not prove LASU's exact course schedule.",
        ],
        "proposed_deterministic_fix": [
            "Keep the current English component as partial only and attach the JAMB/LASU context plus source locators to its seven courses.",
            "Add a Portuguese component only after an authoritative source tied to the specific JAMB offering is found; do not copy OAU courses into LASU.",
        ],
    },
}


EXTERNAL_SEARCHES: dict[str, list[dict[str, Any]]] = {
    "Sociology and Anthroplogy": [
        {
            "authority": "University of Nigeria, Nsukka",
            "url": "https://socialscs.unn.edu.ng/sociology-anthropology-course-modules/",
            "locator": "Published Sociology & Anthropology course-module page; Anthropology course codes and descriptions including ANT 102, ANT 121, ANT 201, ANT 214, ANT 303, ANT 313, ANT 321, ANT 323, ANT 411, ANT 421 and ANT 423.",
            "accessed_on": CHECKED_ON,
            "supports": "Published external Anthropology course content; not a CCMAS outcome contract or a JAMB institution-specific timetable.",
        },
        {
            "authority": "Nnamdi Azikiwe University",
            "url": "https://socialsciences.unizik.edu.ng/dept/sociology-and-anthropology/sociology-and-anthropology-course-descriptions/",
            "locator": "Department of Sociology & Anthropology course descriptions; SOC 141, SOC 142, SOC 143, SOC 244, SOC 345 and SOC 446.",
            "accessed_on": CHECKED_ON,
            "supports": "A second published external Anthropology course source used to corroborate the component breadth, not to claim the JAMB offering's exact timetable.",
        },
    ],
    "MATHEMATICAL SCIENCES": [
        {
            "authority": "Augustine University Ilara-Epe",
            "url": "https://augustineuniversity.edu.ng/Department-details?facname=Science&uid=U014&uname=Mathematical+Sciences",
            "locator": "Department details state that Mathematical Sciences houses Mathematics and Computer Science.",
            "accessed_on": CHECKED_ON,
            "supports": "Existence of a departmental umbrella; not the exact JAMB identity's course schedule.",
        },
        {
            "authority": "Ekiti State University",
            "url": "https://eksu.edu.ng/part-time-programmes/",
            "locator": "Part-time programmes list B.Sc. Mathematical Sciences (Computer Science and Statistical Studies).",
            "accessed_on": CHECKED_ON,
            "supports": "An example of a locally composed Mathematical Sciences offering; not this JAMB identity's curriculum.",
        },
        {
            "authority": "National Open University of Nigeria",
            "url": "https://foc.nou.edu.ng/b-sc-mathematics-and-computer-science/",
            "locator": "Outline programme proposal and registrable courses for Mathematics/Computer Science.",
            "accessed_on": CHECKED_ON,
            "supports": "A combined programme comparator; not an exact source for the unresolved JAMB offering.",
        },
    ],
    "Industrial Physics with Electronics and IT Application": [
        {
            "authority": "Targeted search result rejected",
            "url": "https://sparklyn.com.ng/project-topics-in-industrial-physics-with-electronics-and-it-application",
            "locator": "Project-topic page, not a university curriculum or regulator source.",
            "accessed_on": CHECKED_ON,
            "supports": "Nothing used for mapping; rejected as non-authoritative and not a curriculum source.",
        }
    ],
    "Portuguese/English": [
        {
            "authority": "Obafemi Awolowo University, Department of Foreign Languages",
            "url": "https://forlangs.oauife.edu.ng/wp-content/uploads/2025/06/Foreign-Languages-Handbook-2024.pdf",
            "locator": "Printed p. 22 identifies the B.A. Portuguese/English combined honours programme; printed pp. 60-62 list Portuguese and English courses.",
            "accessed_on": CHECKED_ON,
            "supports": "Existence and substantive Portuguese component of a Nigerian combined programme; not LASU's exact JAMB timetable.",
        }
    ],
}


def selected_summary(row: dict[str, Any], packages: dict[tuple[str, str], dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[tuple[str | None, str | None, str | None], list[dict[str, Any]]] = defaultdict(list)
    for course in row.get("selected_courses") or []:
        grouped[(course.get("source_ccmas_file"), course.get("source_ccmas_programme"), course.get("scope_facet"))].append(course)
    result = []
    for (source_file, programme, facet), courses in grouped.items():
        package = packages.get((source_file, programme))
        expected_codes = {code(item.get("code")) for item in (package or {}).get("courses", [])}
        selected_codes = [code(item.get("code")) for item in courses]
        result.append(
            {
                "source_file": source_file,
                "source_ccmas_programme": programme,
                "scope_facet": facet,
                "selected_count": len(courses),
                "package_course_count": len((package or {}).get("courses", [])),
                "selected_codes": selected_codes,
                "missing_package_codes": sorted(expected_codes - set(selected_codes)),
                "extra_codes_not_in_package": sorted(set(selected_codes) - expected_codes) if package else selected_codes,
                "course_rows_with_outcomes": sum(bool(item.get("learning_outcomes")) for item in courses),
                "course_rows_without_outcomes": [code(item.get("code")) for item in courses if not item.get("learning_outcomes")],
                "course_rows_with_content": sum(bool(item.get("content_summary")) for item in courses),
                "course_rows_without_content": [code(item.get("code")) for item in courses if not item.get("content_summary")],
                "course_source_refs": [
                    source_ref(item)
                    for item in courses
                    if item.get("source_url") or item.get("source_locator") or item.get("source_accessed_on")
                ],
            }
        )
    return result


def dedupe_refs(refs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    result = []
    for ref in refs:
        key = json.dumps(ref, sort_keys=True, ensure_ascii=False)
        if key not in seen:
            seen.add(key)
            result.append(ref)
    return result


def build() -> dict[str, Any]:
    scope = load(SCOPE_PATH)
    reconciliation = load(RECON_PATH)
    residual = load(RESIDUAL_PATH)
    queue = load(QUEUE_PATH)
    packages: dict[tuple[str, str], dict[str, Any]] = {}
    for path in (CAREER / "ccmas").glob("*.json"):
        document = load(path)
        for programme in document.get("programmes", []):
            packages[(path.name, programme.get("name"))] = programme

    rows = [row for row in scope["rows"] if str(row.get("scope_status", "")).endswith("_review_required")]
    if len(rows) != 19:
        raise RuntimeError(f"Expected 19 scope-review rows, found {len(rows)}")
    missing_adjudications = sorted({row["jamb_name"] for row in rows} - set(ADJUDICATIONS))
    if missing_adjudications:
        raise RuntimeError(f"Missing adjudication(s): {missing_adjudications}")

    cases = []
    for row in rows:
        selected = selected_summary(row, packages)
        scope_refs = [source_ref(item) for item in row.get("scope_evidence") or []]
        course_refs = [ref for group in selected for ref in group.get("course_source_refs", [])]
        refs = dedupe_refs(scope_refs + course_refs + EXTERNAL_SEARCHES.get(row["jamb_name"], []))
        cases.append(
            {
                "jamb_name": row["jamb_name"],
                "current_scope_status": row.get("scope_status"),
                "component_refs": row.get("component_refs") or [],
                "selected_course_count": len(row.get("selected_courses") or []),
                "selected_course_evidence": selected,
                "scope_evidence_as_recorded": scope_refs,
                "evidence_urls_locators_access_dates": refs,
                "external_searches": EXTERNAL_SEARCHES.get(row["jamb_name"], []),
                **ADJUDICATIONS[row["jamb_name"]],
            }
        )

    course_detail_closed = {
        "targeted_queue_distinct_course_records": queue.get("counts", {}).get("distinct_course_records"),
        "targeted_queue_occurrence_level_detail_findings": queue.get("counts", {}).get("occurrence_level_detail_findings"),
        "rule": "Do not repeat the already closed selected-course detail lane in this scope audit.",
    }
    return {
        "schema": "2026-09-29.jamb-ccmas-scope-audit-lane-a.v1",
        "checked_on": CHECKED_ON,
        "generated_at_utc": "2026-09-29T16:45:25Z",
        "lane": "A",
        "append_only": True,
        "canonical_mappings_edited": False,
        "canonical_scope_files_edited": False,
        "downstream_domains_subgroups_roles_audited_or_edited": False,
        "scope": {
            "jamb_scope_rows_checked": len(rows),
            "combined_rows": sum(row["scope_status"] == "combined_scope_review_required" for row in rows),
            "full_rows": sum(row["scope_status"] == "full_scope_review_required" for row in rows),
            "partial_rows": sum(row["scope_status"] == "partial_scope_review_required" for row in rows),
            "focus": [
                "explicit component boundaries",
                "selected CCMAS course identity and outcome/content presence",
                "combined and alternative-branch semantics",
                "external component provenance where CCMAS is absent or insufficient",
            ],
        },
        "closed_work_not_repeated": course_detail_closed,
        "deterministic_findings": {
            "full_component_unions_with_no_new_scope_defect": [
                "Political Science and Defence Studies",
                "Actuarial Science",
                "Insurance and Actuarial Science",
                "Mathematics with Computer Science",
                "COMPUTER SCIENCE WITH ECONOMICS",
                "COMPUTER SCIENCE AND MATHEMATICS",
                "Chemistry and Industrial Chemistry",
                "COMPUTER SCIENCE WITH MATHEMATICS",
                "Industrial Physics with Applied Geophysics",
                "Industrial Mathematics and Computer Science",
                "French",
            ],
            "confirmed_scope_defects": [
                "Sociology and Anthroplogy: missing component-level provenance metadata for external Anthropology evidence.",
                "BIOTECHNOLOGY AND MOLECULAR BIOLOGY: partial Biotechnology plus one Biology anchor does not establish a full Molecular Biology component.",
                "MATHEMATICAL SCIENCES: seven-course Mathematics slice has no exact CCMAS Mathematical Sciences identity or scope-level evidence.",
                "Industrial Physics with Electronics and IT Application: IT Application facet is not established by the two selected CCMAS components.",
                "Portuguese/English: Portuguese component is absent; only a seven-course English slice is selected.",
                "Physical Sciences options: alternative branches require explicit option semantics rather than a flat mandatory union.",
            ],
            "context_checks_still_needed": [
                "Political Science / International Law and Diplomacy",
                "Political Science and Defence Studies",
                "Actuarial Science",
                "Accounting and Finance",
                "Insurance and Actuarial Science",
                "Industrial Physics with Applied Geophysics",
                "French",
            ],
        },
        "cases": cases,
        "input_artifacts": {
            str(path.relative_to(ROOT)): sha256(path)
            for path in [SCOPE_PATH, RECON_PATH, QUEUE_PATH, RESIDUAL_PATH]
        },
        "reconciliation_snapshot": {
            "counts": reconciliation.get("counts", {}),
            "residual_counts": residual.get("counts", {}),
        },
        "rules": [
            "Do not infer a combined curriculum from a title alone.",
            "A full CCMAS component union is supporting curriculum evidence, not proof of an institution's exact timetable.",
            "External comparator curricula must retain their own authority, URL, locator and access date and must not be copied into another institution's JAMB offering.",
            "Course-detail repairs already closed by the targeted queue are not repeated in this lane.",
            "This checkpoint proposes deterministic fixes only; it does not edit canonical mappings, scope files, downstream data or seeds.",
        ],
    }


def markdown(report: dict[str, Any]) -> str:
    lines = [
        "# JAMB↔CCMAS scope audit — Lane A — 2026-09-29 16:45 UTC",
        "",
        "Append-only audit checkpoint. No canonical mapping, scope, downstream, seed or SQL file was edited.",
        "",
        "## Coverage",
        "",
        f"- Scope-review cases checked: **{report['scope']['jamb_scope_rows_checked']}** (combined {report['scope']['combined_rows']}, full {report['scope']['full_rows']}, partial {report['scope']['partial_rows']}).",
        f"- Selected-course detail queue re-run: **not repeated**; current targeted queue is {report['closed_work_not_repeated']['targeted_queue_distinct_course_records']} distinct records and {report['closed_work_not_repeated']['targeted_queue_occurrence_level_detail_findings']} occurrence findings.",
        "- Downstream domains, subgroups and roles: **not audited or edited**.",
        "",
        "## Deterministic result",
        "",
        "The audit confirms that the repeated Computer Science/Mathematics cases contain both complete CCMAS components. The remaining scope defects are bounded component gaps, external provenance gaps, or branch semantics; they are not evidence that the entire JAMB catalogue is unavailable.",
        "",
        "## Case register",
        "",
        "| JAMB identity | Current status | Selected evidence | Audit outcome | Confirmed defects |",
        "|---|---|---:|---|---|",
    ]
    for case in report["cases"]:
        defects = "<br>".join(case["confirmed_defects"]) or "None found in scope boundary"
        lines.append(
            f"| {case['jamb_name']} | `{case['current_scope_status']}` | {case['selected_course_count']} courses / {len(case['component_refs'])} declared component(s) | {case['outcome']} | {defects} |"
        )
    lines.extend(["", "## Evidence and proposed fixes", ""])
    for case in report["cases"]:
        lines.extend([f"### {case['jamb_name']}", "", f"- Components: `{'; '.join(case['component_refs'])}`."])
        for group in case["selected_course_evidence"]:
            lines.append(
                f"- `{group['source_ccmas_programme'] or group['scope_facet']}`: {group['selected_count']} selected; package size {group['package_course_count']}; missing package codes {len(group['missing_package_codes'])}; rows without outcomes {len(group['course_rows_without_outcomes'])}; rows without content {len(group['course_rows_without_content'])}."
            )
        lines.append("- Evidence references:")
        for ref in case["evidence_urls_locators_access_dates"]:
            lines.append(f"  - {ref.get('authority') or 'Recorded source'} — {ref.get('url') or 'URL not recorded'} — {ref.get('locator') or 'locator not recorded'} — accessed {ref.get('accessed_on') or 'date not recorded'}.")
        if case["confirmed_defects"]:
            lines.append("- Confirmed defects:")
            lines.extend(f"  - {item}" for item in case["confirmed_defects"])
        lines.append("- Proposed deterministic fix:")
        lines.extend(f"  - {item}" for item in case["proposed_deterministic_fix"])
        lines.append("")
    lines.extend([
        "## Guardrails",
        "",
        "- This is an audit/proposal checkpoint only; no canonical mappings, scope records, domain links, seeds or SQL were changed.",
        "- External comparator sources support the named facet only and do not establish a university's exact timetable unless the source is tied to that offering.",
        "- The detailed selected-course queue was intentionally not repeated because it was already closed in the current local repair queue.",
    ])
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    report = build()
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_MD.write_text(markdown(report), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "cases": len(report["cases"])}, indent=2))
