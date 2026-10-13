"""Close the remaining named-facet gap with explicit source-backed semantics.

The JAMB title names an Industrial Physics option in Electronics and IT
Applications.  The source evidence supports a two-package CCMAS union and an
embedded option label; it does not support adding a separate Computer Science
package or inventing an institution-specific IT timetable.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
TARGET = "Industrial Physics with Electronics and IT Application"
OVERRIDES = ROOT / "data/career-mapping/_audit/jamb_ccmas_manual_scope_overrides_2026-09-25.json"
CANONICAL = ROOT / "data/career-mapping/_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json"
ACTIVE_MAP = ROOT / "data/career-mapping/jamb_domain_map.json"

QUALIFICATION = {
    "facet": "IT application",
    "status": "embedded_option_confirmed_not_separate_curriculum",
    "reason": (
        "Covenant's official undergraduate prospectus names Electronics and "
        "Information Technology Applications as an option within Industrial "
        "Physics. The two CCMAS packages remain the curriculum evidence; no "
        "separate Computer Science package or institution-specific IT course "
        "schedule is inferred."
    ),
    "evidence_refs": ["covenant_2026_undergraduate_prospectus", "nuc_sciences_ccmas_2023"],
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    overrides = load(OVERRIDES)
    override = next(row for row in overrides["overrides"] if row["jamb_name"] == TARGET)
    override["scope_status"] = "combined_scope_reviewed"
    override["scope_approval"] = "reviewed"
    override["scope_reason"] = (
        "The named Industrial Physics, Electronics and IT Application title is resolved as a "
        "two-component CCMAS scope: the full Industrial Physics package plus the full Physics "
        "with Electronics package. The official Covenant University prospectus confirms "
        "Electronics and Information Technology Applications as an Industrial Physics option, "
        "so IT Application is treated as an embedded option label rather than an omitted third "
        "CCMAS programme. No Computer Science package is added without separate programme "
        "evidence, and the Covenant option evidence does not invent an institution-specific "
        "course schedule."
    )
    override["component_courses"][1]["facet"] = "electronics and IT-application option reference"
    override["unrepresented_facets"] = []
    override["facet_qualifications"] = [QUALIFICATION]
    for evidence in override.get("source_evidence", []):
        if evidence.get("authority") == "Covenant University":
            evidence["supports"] = (
                "Institution-specific confirmation that Electronics and Information Technology "
                "Applications are named Industrial Physics options at Covenant. This resolves "
                "the title facet as an embedded option label; it is not used to invent a "
                "separate Computer Science package or substitute for NUC CCMAS course/outcome "
                "data."
            )
    override["downstream_remapping"] = (
        "reassess_two_component_scope_links; keep_IT_application_as_an_embedded_option_until_"
        "institution_specific_course_schedule_is_available"
    )
    save(OVERRIDES, overrides)

    canonical = load(CANONICAL)
    row = next(item for item in canonical["rows"] if item["jamb_name"] == TARGET)
    scope = row["curriculum_scope"]
    scope["status"] = "combined_scope_reviewed"
    scope["approval"] = "reviewed"
    scope["note"] = (
        "Two-component CCMAS scope: Industrial Physics plus Physics with Electronics. "
        "Covenant's official prospectus confirms Electronics and Information Technology "
        "Applications as an embedded Industrial Physics option; no separate Computer Science "
        "package is inferred."
    )
    save(CANONICAL, canonical)

    active = load(ACTIVE_MAP)
    mapped = active[TARGET]
    mapped["status_reason"] = (
        "Two-component CCMAS scope reviewed: Industrial Physics plus Physics with Electronics. "
        "The IT Application wording is an embedded option confirmed by Covenant's official "
        "prospectus; no separate Computer Science package or invented IT schedule is added."
    )
    mapped_scope = mapped["curriculum_scope"]
    mapped_scope["status"] = "combined_scope_reviewed"
    mapped_scope["approval"] = "reviewed"
    mapped_scope["note"] = (
        "Industrial Physics plus Physics with Electronics. IT Application is an embedded "
        "option label, not a separate CCMAS programme; no separate Computer Science package "
        "is inferred."
    )
    mapped_scope["facet_qualifications"] = [QUALIFICATION]
    save(ACTIVE_MAP, active)
    print(json.dumps({"target": TARGET, "status": "combined_scope_reviewed", "unrepresented_facets": 0}, indent=2))


if __name__ == "__main__":
    main()
