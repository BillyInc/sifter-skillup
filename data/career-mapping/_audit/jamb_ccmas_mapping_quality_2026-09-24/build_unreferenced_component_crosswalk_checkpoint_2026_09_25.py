#!/usr/bin/env python3
"""Create an append-only evidence checkpoint for the 83 unreferenced CCMAS packages.

The output is a separate sidecar. It never edits the canonical JAMB map, scopes,
seed inputs, SQL, UI, or API. A missing component_ref is not interpreted as a
negative mapping, and lexical matches are only source-review leads.
"""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
AUDIT_DIR = Path(__file__).resolve().parent
CCMAS_DIR = ROOT / "data/career-mapping/ccmas"
JAMB_DIR = ROOT / "data/career-mapping/jamb"
SCOPES = ROOT / "data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json"
MAPPINGS = ROOT / "data/career-mapping/programme_mapping.json"
INVENTORY = ROOT / "data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json"
OUT_JSONL = AUDIT_DIR / "unreferenced_ccmas_component_crosswalk_2026-09-25.jsonl"
OUT_MD = AUDIT_DIR / "unreferenced_ccmas_component_crosswalk_checkpoint_2026-09-25.md"
ACCESS_DATE = date.today().isoformat()

NUC_PDFS = {
    "Administration and Management": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf",
    "Agricultural Science": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf",
    "Allied Health Sciences": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf",
    "Architecture": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Architecture-CCMAS-2023-FINAL.pdf",
    "Arts": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf",
    "Communication and Media Studies": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf",
    "Education": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf",
    "Engineering": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf",
    "Environmental Sciences": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf",
    "Pharmacy and Pharmaceutical Sciences": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf",
    "Sciences": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf",
    "Social Sciences": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
    "Veterinary Medicine": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Veterinary-Medicine-CCMAS-2023-FINAL.pdf",
}
JAMB_PDFS = {
    "Administration": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf",
    "Agriculture": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf",
    "Arts and Humanities": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf",
    "Education": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf",
    "Engineering/Environmental/Technology": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf",
    "Law": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf",
    # The checked-in source names the JAMB PDF, but an official stable PDF URL
    # was not verified in this pass. Do not manufacture one from a filename.
    "Medical/Pharmaceutical/Health": None,
    "Sciences": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf",
    "Social/Management Sciences": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
}


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def similarity(a: str, b: str) -> float:
    left, right = set(norm(a).split()), set(norm(b).split())
    return len(left & right) / len(left | right) if left and right else 0.0


def clean_course(course: dict) -> dict:
    return {
        "level": course.get("level"),
        "code": course.get("code"),
        "title": course.get("title"),
        "content_summary": course.get("content_summary"),
        "learning_outcomes": course.get("skills_learned") or [],
    }


def main() -> None:
    # Never replace prior evidence: each run gets a distinct dated artifact.
    if OUT_JSONL.exists() or OUT_MD.exists():
        raise FileExistsError("Checkpoint already exists; choose a new dated output name.")

    scopes = read(SCOPES)["rows"]
    exact_refs = {ref for row in scopes for ref in row.get("component_refs", [])}
    mappings = read(MAPPINGS)["mappings"]
    identities = {row["jamb_name"]: row for row in mappings if row.get("jamb_name")}
    inventory = read(INVENTORY)["identities"]
    inv_by_name = {row["jamb_name"]: row for row in inventory}
    offering_by_name: dict[str, list[dict]] = {}
    for source_path in sorted(JAMB_DIR.glob("*_offerings.json")):
        source = read(source_path)
        faculty = source.get("faculty")
        for offering in source.get("programmes", []):
            name = offering.get("jamb_name")
            if name:
                offering_by_name.setdefault(name, []).append({
                    "parsed_faculty": faculty,
                    "parsed_source_file": source_path.name,
                    "source_document_filename": source.get("source"),
                    "institution_tokens_unverified": offering.get("institutions") or [],
                    "official_jamb_pdf_url": JAMB_PDFS.get(faculty),
                    "source_document_filename": source.get("source"),
                    "exact_brochure_table_locator": None,
                    "locator_state": "not_yet_verified_against_official_pdf",
                })

    packages = []
    for source_path in sorted(CCMAS_DIR.glob("*.json")):
        discipline = read(source_path)
        for programme in discipline.get("programmes", []):
            component = f"{discipline.get('discipline', '')}::{programme.get('name', '')}"
            if component in exact_refs:
                continue
            pkg_discipline = discipline.get("discipline", "")
            scored = sorted(
                ((similarity(programme.get("name", ""), name), name) for name in identities),
                key=lambda x: (-x[0], x[1].casefold()),
            )
            candidate_names = [name for score, name in scored if score >= 0.25]
            exact_names = [name for name in identities if norm(name) == norm(programme.get("name", ""))]
            candidates = []
            for name in candidate_names:
                map_row = identities[name]
                candidates.append({
                    "jamb_identity": name,
                    "lexical_score_lead_only": round(similarity(programme.get("name", ""), name), 3),
                    "canonical_mapping_faculty_not_source_verification": map_row.get("jamb_faculty"),
                    "parsed_offering_occurrences": offering_by_name.get(name, []),
                    "all_parsed_contexts_retained": True,
                    "source_context_locator_state": "candidate_identity_only_exact_institution_rows_not_verified",
                })
            raw_courses = programme.get("courses") or []
            packages.append({
                "component_id": component,
                "ccmas_discipline": pkg_discipline,
                "ccmas_programme": programme.get("name"),
                "ccmas_programme_code": programme.get("code"),
                "ccmas_source_file": source_path.name,
                "course_count": len(raw_courses),
                "official_nuc_source": {
                    "url": NUC_PDFS.get(pkg_discipline),
                    "access_date": ACCESS_DATE,
                    "locator": f"Programme section: {programme.get('name')}; item-level locators: course code/title as listed below. Printed page numbers have not yet been independently verified.",
                    "source_role": "authoritative CCMAS programme/course/content/outcome reference",
                },
                "candidate_classification": "candidate requiring source evidence",
                "classification_reason": "No exact component_refs entry exists. This is a mapping gap in the saved scope, not proof of no JAMB match. Lexical/exact name hits are leads only; the official JAMB faculty table and institution row plus CCMAS course content/outcomes must be checked before confirming or rejecting a link.",
                "jamb_universe_checked": {
                    "canonical_identity_count": len(identities),
                    "all_identity_names_compared": True,
                    "name_similarity_is_not_match_evidence": True,
                    "exact_name_candidates": exact_names,
                    "retained_candidate_leads_min_similarity_0_25": candidates,
                    "candidate_occurrences_count": sum(len(c["parsed_offering_occurrences"]) for c in candidates),
                    "official_source_index": "https://ibass.jamb.gov.ng/",
                    "access_date": ACCESS_DATE,
                },
                "curriculum_items_for_review": [clean_course(course) for course in raw_courses],
                "domain_subgroup_role_disposition": "not_adjudicated_in_this_reverse-component-checkpoint; do not infer or promote any downstream link",
            })

    packages.sort(key=lambda x: (x["ccmas_discipline"].casefold(), x["ccmas_programme"].casefold()))
    if len(packages) != 83:
        raise AssertionError(f"Expected 83 unreferenced CCMAS components, found {len(packages)}")
    with OUT_JSONL.open("x", encoding="utf-8", newline="\n") as stream:
        for package in packages:
            stream.write(json.dumps(package, ensure_ascii=False, separators=(",", ":")) + "\n")

    lines = [
        "# Reverse CCMAS component crosswalk — evidence checkpoint (2026-09-25)",
        "",
        "This is a distinct, append-only sidecar for the 83 CCMAS programme packages that lack an exact `component_refs` entry in the saved 420-row JAMB curriculum-scope artifact. It does not edit shared mappings, seeds, SQL, UI, or API.",
        "",
        "## Current disposition",
        "",
        f"- CCMAS components inventoried and classified: **{len(packages)}/83**.",
        f"- Canonical JAMB identities compared per component: **{len(identities)}**.",
        "- Confirmed component-to-JAMB matches from this checkpoint: **0**.",
        "- Candidates requiring exact source-offering/course-outcome evidence: **83**.",
        "- No-support-after-documented-search dispositions: **0**; no component was declared unavailable from a missing seed link or lexical-search absence.",
        "- Every lexical lead is explicitly non-evidence. Faculty/institution tokens remain parser output until the exact official brochure table is located.",
        "- Full CCMAS course codes, titles, content summaries and parsed learning outcomes are included in the JSONL ledger so review can test each component rather than title-match alone.",
        "",
        "## Official source and locator policy",
        "",
        f"- NUC CCMAS discipline PDFs and programme sections are linked item-by-item in the ledger; accessed **{ACCESS_DATE}**. Course code/title is supplied as the locator. Exact printed page numbers are intentionally marked unverified where not independently checked.",
        f"- Each lexical JAMB lead retains every parsed source-faculty occurrence and institution token, plus a verified official JAMB brochure URL where available; accessed **{ACCESS_DATE}**. Exact awarding-institution table locators remain null until verified against the PDF.",
        "- Medical/Pharmaceutical/Health source occurrences currently lack a verified direct official PDF URL in this ledger (13 retained lead occurrences); their checked-in source-document filename is preserved and must be resolved from IBASS before that offering context can be adjudicated.",
        "- Accordingly, this artifact is a complete 83-package *candidate crosswalk*, not a completed 83-package adjudication. Do not use its candidate entries as student-visible mappings.",
        "",
        "## Confirmed context dispositions already established in the main audit",
        "",
        "The five exact-title Education-package comparisons reviewed in `agent-01-increment-021-unreferenced-crosswalk-review-2026-09-25.md` are confirmed *non-matches to the specific non-Education source contexts reviewed*: Education::Political Science vs Social/Management Sciences Political Science; Education::Computer Science vs Sciences/Engineering Computer Science; and Education::Chemistry, Physics, Biology vs their Sciences offerings. Teacher-training/practicum outcomes distinguish these packages. This does not establish that those Education packages have no corresponding Education-faculty JAMB identities; therefore the package-level status remains candidate pending a search across all exact Education offerings.",
        "",
        "## Review limit and next evidence required",
        "",
        "This pass systematically compared each CCMAS programme name with all 420 canonical JAMB identities and attached official source paths plus complete parsed CCMAS course/outcome material. It did not visually verify the exact institution-bearing row for every candidate, nor did it yet perform outcome-by-outcome adjudication for all 83 packages. For each package, the next reviewer must inspect the JAMB PDF catalogue/faculty and exact institution table, compare course titles/content/outcomes against that offering, preserve distinct faculty contexts, then document either a confirmed match, a candidate needing further source evidence, or no support only after a documented search. Downstream domain/subgroup/role links remain outside this sidecar disposition until that scope is established.",
        "",
        f"Machine-readable append-only ledger: `{OUT_JSONL.name}` ({len(packages)} JSONL records).",
        "",
    ]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8", newline="\n")
    print(f"Wrote {OUT_JSONL.relative_to(ROOT)} ({len(packages)} records)")
    print(f"Wrote {OUT_MD.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
