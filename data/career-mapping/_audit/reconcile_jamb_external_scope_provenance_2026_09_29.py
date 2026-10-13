"""Hydrate explicit external/related JAMB scope rows from checked-in sources.

This is a deterministic reconciliation pass for the small set of JAMB scopes
that deliberately use related CCMAS programmes or external curriculum
evidence.  It does not infer a component from a title, add domain links, or
promote a row out of review.  It only fills a selected course from an already
declared component with source-backed fields and attaches the programme-level
source record already present in the repository.

Run without ``--apply`` to inspect the proposed changes.  ``--apply`` updates
the local scope ledger after writing an append-only report.  SQL, browser proof
and live deployment are outside this script.
"""

from __future__ import annotations

import argparse
import copy
import json
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
ENRICHMENT = ROOT / "enrichment"
CCMAS = ROOT / "ccmas"
REPORT = AUDIT / "jamb_external_scope_provenance_reconciliation_2026_09_29.json"
REPORT_MD = AUDIT / "jamb_external_scope_provenance_reconciliation_2026_09_29.md"

OFFICIAL_PDF_BY_FILE = {
    "administration_management.json": "Administration-and-Management.pdf",
    "agricultural_science.json": "Agriculture-2023.pdf",
    "allied_health.json": "Allied-Health-Sciences-2023.pdf",
    "architecture.json": "Architecture-CCMAS-2023-FINAL.pdf",
    "arts.json": "Arts-CCMAS-2023-FINAL.pdf",
    "basic_medical.json": "Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf",
    "communication_media.json": "Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf",
    "computing.json": "Computing-CCMAS-2023-FINAL.pdf",
    "education.json": "Education-CCMAS-2023-New.pdf",
    "engineering.json": "Engineering-Technology-CCMAS-2023-FINAL.pdf",
    "environmental_sciences.json": "Environmental-Sciences-CCMAS-2023-FINAL.pdf",
    "law.json": "Law-ALL.pdf",
    "medicine_dentistry.json": "Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf",
    "pharmacy.json": "Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf",
    "sciences.json": "Sciences-CCMAS-2023-FINAL.pdf",
    "social_sciences.json": "Social-Sciences-CCMAS-FINAL-2023-A.pdf",
    "veterinary.json": "Veterinary-Medicine-CCMAS-2023-FINAL.pdf",
}
NUC_PDF_ROOT = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/"

# These are the explicit custom components already declared by the scope
# ledger.  They are not title-derived guesses.
ENRICHMENT_BY_JAMB = {
    "Anthropology": "anthropology.json",
    "Intelligence and Security Studies": "intelligence_security.json",
    "Social Justice": "social_justice.json",
    "Sport Science": "sport_science.json",
    "Sport Management (Education)": "sport_management_education.json",
}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return " ".join(str(value or "").split()).casefold()


def code_norm(value: Any) -> str:
    return " ".join(str(value or "").split()).upper()


def official_url(source_file: str) -> str | None:
    pdf = OFFICIAL_PDF_BY_FILE.get(source_file)
    return f"{NUC_PDF_ROOT}{pdf}" if pdf else None


def iter_ccmas_courses() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in sorted(CCMAS.glob("*.json")):
        data = load(path)
        for programme in data.get("programmes", []):
            for course in programme.get("courses", []):
                if not course.get("code"):
                    continue
                rows.append(
                    {
                        "source_file": path.name,
                        "discipline": data.get("discipline"),
                        "programme": programme.get("name"),
                        "programme_code": programme.get("code"),
                        "course": course,
                    }
                )
    return rows


def make_course_from_source(selected: dict[str, Any], source: dict[str, Any],
                            *, source_kind: str, source_url: str | None,
                            source_locator: str, accessed: str) -> tuple[dict[str, Any], list[str]]:
    """Fill only blank selected fields; return row and changed field names."""

    out = copy.deepcopy(selected)
    changed: list[str] = []
    source_course = source.get("course", source)

    values = {
        "title": source_course.get("title"),
        "units": source_course.get("units"),
        "status": source_course.get("status"),
        "lecture_hours": source_course.get("lh", source_course.get("lecture_hours")),
        "practical_hours": source_course.get("ph", source_course.get("practical_hours")),
        "content_summary": source_course.get("content_summary", source_course.get("content")),
        "learning_outcomes": source_course.get("learning_outcomes", source_course.get("skills_learned", source_course.get("outcomes"))),
    }
    for field, value in values.items():
        if value is None or value == [] or value == "":
            continue
        current = out.get(field)
        if current in (None, "", [], [""]):
            out[field] = copy.deepcopy(value)
            changed.append(field)

    provenance = {
        "source_kind": source_kind,
        "source_url": source_url,
        "source_locator": source_locator,
        "source_accessed_on": accessed,
    }
    if source_kind == "ccmas_related":
        provenance.update(
            {
                "source_ccmas_file": source.get("source_file"),
                "source_ccmas_programme": source.get("programme"),
            }
        )
    for field, value in provenance.items():
        if value in (None, ""):
            continue
        # The enrichment files use short component codes (for example CSS or
        # SWK), while the canonical CCMAS index uses the full programme name.
        # Replace that shorthand only when the exact source course has already
        # been matched; do not overwrite unrelated provenance.
        replace_canonical = source_kind == "ccmas_related" and field in {"source_ccmas_file", "source_ccmas_programme"}
        if replace_canonical or out.get(field) in (None, ""):
            out[field] = value
            changed.append(field)

    return out, sorted(set(changed))


def source_candidates(index: dict[tuple[str, str], list[dict[str, Any]]],
                      course: dict[str, Any], enrichment: dict[str, Any]) -> list[dict[str, Any]]:
    key = (code_norm(course.get("code")), norm(course.get("title")))
    candidates = list(index.get(key, []))
    wanted = {code_norm(item.get("source_ccmas_programme")) for item in enrichment.get("courses", []) if item.get("source_ccmas_programme")}
    if wanted:
        preferred = [item for item in candidates if code_norm(item.get("programme_code")) in wanted]
        if preferred:
            candidates = preferred
    return candidates


def external_source_for(enrichment: dict[str, Any], course: dict[str, Any]) -> tuple[str | None, str]:
    sources = enrichment.get("sources") or []
    if not sources:
        sources = [{"url": url} for url in (enrichment.get("enrichment_basis", {}).get("sources") or [])]
    institution = course.get("source_institution")
    selected = next((item for item in sources if institution and institution.casefold() in str(item.get("institution", "")).casefold()), None)
    selected = selected or (sources[0] if sources else {})
    url = selected.get("url")
    locator = f"{selected.get('institution', enrichment.get('programme', 'External curriculum'))}; course {course.get('code')} — {course.get('title')}"
    return url, locator


def hydrate_row(row: dict[str, Any], enrichment: dict[str, Any], ccmas_index: dict[tuple[str, str], list[dict[str, Any]]], accessed: str) -> tuple[dict[str, Any], dict[str, Any]]:
    out = copy.deepcopy(row)
    report: dict[str, Any] = {"jamb_name": row.get("jamb_name"), "course_changes": [], "scope_sources": []}
    enriched_by_code = {code_norm(item.get("code")): item for item in enrichment.get("courses", []) if item.get("code")}

    def append_scope_source(source_kind: str, url: str | None, locator: str, supports: str) -> None:
        if not url:
            return
        entry = {"source_kind": source_kind, "source_url": url, "source_locator": locator, "source_accessed_on": accessed, "supports": supports}
        if entry not in out.setdefault("scope_evidence", []):
            out["scope_evidence"].append(entry)
        if entry not in report["scope_sources"]:
            report["scope_sources"].append(entry)

    for selected in row.get("selected_courses", []):
        enriched = enriched_by_code.get(code_norm(selected.get("code")), {})
        candidates = source_candidates(ccmas_index, selected, enrichment)
        if candidates and enriched.get("source_ccmas_programme"):
            source = candidates[0]
            url = official_url(source["source_file"])
            locator = f"{source['programme']} programme, course {selected.get('code')} — {selected.get('title')}"
            hydrated, changed = make_course_from_source(selected, source, source_kind="ccmas_related", source_url=url, source_locator=locator, accessed=accessed)
            append_scope_source("ccmas_related", url, f"{source['programme']} programme course structure/content for {selected.get('code')}", f"identity, workload, contents and learning outcomes for {source['programme']} related curriculum")
        else:
            source_url, locator = external_source_for(enrichment, enriched or selected)
            source = enriched or selected
            hydrated, changed = make_course_from_source(selected, source, source_kind="external_curriculum", source_url=source_url, source_locator=locator, accessed=accessed)
            append_scope_source("external_curriculum", source_url, f"{enrichment.get('programme')} course list; {selected.get('code')} — {selected.get('title')}", "external curriculum course identity and any published course content")
        if changed:
            report["course_changes"].append({"code": selected.get("code"), "title": selected.get("title"), "fields": changed, "source_kind": hydrated.get("source_kind")})
        out["selected_courses"][out["selected_courses"].index(selected)] = hydrated

    return out, report


def build_combined_sociology_anthropology(scopes: list[dict[str, Any]], ccmas_index: dict[tuple[str, str], list[dict[str, Any]]], accessed: str) -> dict[str, Any] | None:
    target = next((row for row in scopes if row.get("jamb_name") == "Sociology and Anthroplogy"), None)
    sociology = next((row for row in scopes if row.get("jamb_name") == "Sociology"), None)
    anthropology = load(ENRICHMENT / "anthropology.json")
    if not target or not sociology:
        return None
    courses: list[dict[str, Any]] = []
    for source in ccmas_index.get(("", ""), []):
        del source  # keep the index lookup explicit below; no wildcard matching
    sociology_source_rows = [item for items in ccmas_index.values() for item in items if item.get("programme") == "Sociology"]
    seen: set[tuple[str, str]] = set()
    for source in sociology_source_rows:
        course = source["course"]
        key = (source["source_file"], code_norm(course.get("code")))
        if key in seen:
            continue
        seen.add(key)
        url = official_url(source["source_file"])
        hydrated, _ = make_course_from_source(
            {"code": course.get("code"), "title": course.get("title"), "scope_match_terms": [], "scope_facet": "sociology"},
            source,
            source_kind="ccmas_related",
            source_url=url,
            source_locator=f"Sociology CCMAS programme, course {course.get('code')} — {course.get('title')}",
            accessed=accessed,
        )
        hydrated["scope_facet"] = "sociology"
        courses.append(hydrated)
    for course in anthropology.get("courses", []):
        source_url, locator = external_source_for(anthropology, course)
        hydrated, _ = make_course_from_source(
            {"code": course.get("code"), "title": course.get("title"), "scope_match_terms": [], "scope_facet": "anthropology"},
            course,
            source_kind="external_curriculum",
            source_url=source_url,
            source_locator=locator,
            accessed=accessed,
        )
        hydrated["scope_facet"] = "anthropology"
        courses.append(hydrated)
    if not courses:
        return None
    target = copy.deepcopy(target)
    target["selected_courses"] = courses
    target["scope_reason"] = "explicit Sociology + Anthropology components hydrated from CCMAS Sociology and the recorded external Anthropology curriculum; offering-level and downstream review remain open"
    target["scope_selection_method"] = "explicit_component_union_with_external_evidence"
    target["scope_evidence"] = [
        {"source_kind": "ccmas_related", "source_url": official_url("social_sciences.json"), "source_locator": "Sociology CCMAS programme course structure and course content", "source_accessed_on": accessed, "supports": "Sociology component course identity and outcomes"},
        {"source_kind": "external_curriculum", "source_url": (anthropology.get("sources") or [{}])[0].get("url"), "source_locator": "UNN Sociology and Anthropology course modules", "source_accessed_on": accessed, "supports": "Anthropology component course identity and published course content"},
    ]
    return target


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write the hydrated scope ledger")
    args = parser.parse_args()
    accessed = date.today().isoformat()
    document = load(SCOPES)
    original_rows = document["rows"]
    ccmas_rows = iter_ccmas_courses()
    index: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for source in ccmas_rows:
        course = source["course"]
        index[(code_norm(course.get("code")), norm(course.get("title")))].append(source)

    target_names = set(ENRICHMENT_BY_JAMB)
    rows = []
    reports = []
    for row in original_rows:
        if row.get("jamb_name") in target_names:
            enrichment = load(ENRICHMENT / ENRICHMENT_BY_JAMB[row["jamb_name"]])
            hydrated, report = hydrate_row(row, enrichment, index, accessed)
            rows.append(hydrated)
            reports.append(report)
        else:
            rows.append(copy.deepcopy(row))

    combined = build_combined_sociology_anthropology(rows, index, accessed)
    if combined:
        for pos, row in enumerate(rows):
            if row.get("jamb_name") == combined.get("jamb_name"):
                before_count = len(row.get("selected_courses", []))
                rows[pos] = combined
                reports.append({"jamb_name": combined["jamb_name"], "course_changes": [{"action": "materialize_explicit_component_union", "before_count": before_count, "after_count": len(combined["selected_courses"]), "fields": ["selected_courses", "scope_reason", "scope_selection_method", "scope_evidence"]}], "scope_sources": combined.get("scope_evidence", [])})
                break

    changed_rows = [report for report in reports if report.get("course_changes") or report.get("scope_sources")]
    report = {
        "schema": "2026-09-29.jamb-external-scope-provenance-reconciliation.v1",
        "generated_on": accessed,
        "status": "applied_locally" if args.apply else "dry_run",
        "source_rule": "Only explicit custom/related components already present in the scope ledger were hydrated. No title-only component, domain link, direct/functional/adjacent status, or student-confirmed status was inferred.",
        "counts": {
            "targeted_jamb_rows": len(target_names),
            "rows_changed": len(changed_rows),
            "course_changes": sum(len(item.get("course_changes", [])) for item in changed_rows),
            "related_ccmas_source_rows": sum(1 for item in changed_rows for change in item.get("course_changes", []) if change.get("source_kind") == "ccmas_related"),
            "external_source_rows": sum(1 for item in changed_rows for change in item.get("course_changes", []) if change.get("source_kind") == "external_curriculum"),
            "combined_scope_materialized": any(item.get("jamb_name") == "Sociology and Anthroplogy" and any(change.get("action") == "materialize_explicit_component_union" for change in item.get("course_changes", [])) for item in changed_rows),
        },
        "rows": changed_rows,
        "remaining_rule": "External rows remain source-dependent until the JAMB offering context and downstream links are separately reconciled. A source URL does not by itself promote a row to student-confirmed.",
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# JAMB external/related scope provenance reconciliation — 2026-09-29",
        "",
        f"Status: `{report['status']}`",
        "",
        "This pass hydrates only explicitly declared custom or related components from checked-in CCMAS/external source records. It does not infer curriculum from a title and does not add downstream links.",
        "",
        "## Counts",
        "",
    ]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in report["counts"].items())
    lines += ["", "## Boundary", "", report["remaining_rule"], "", f"Machine-readable report: `{REPORT.name}`"]
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    if args.apply:
        document["rows"] = rows
        SCOPES.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(REPORT), "status": report["status"], "counts": report["counts"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
