"""Resolve CCMAS/JAMB review links with Nigerian curriculum and professional context.

This is a review/disposition layer, not SQL generation. A Nigerian CCMAS
course is the evidence for what the programme teaches. Nigerian professional
body, regulator, university, or local-sector material explains the destination
domain and the bridge a learner would still need. It does not turn a global
source into Nigerian evidence and it does not turn a target-domain description
into programme preparation.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parent
AUDIT = ROOT / "_audit"
INPUT = AUDIT / "ccmas_external_domain_complements_2026-09-01.json"
OUT_JSON = AUDIT / "ccmas_nigerian_reviewed_links_2026-09-01.json"
OUT_MD = AUDIT / "CCMAS_NIGERIAN_REVIEWED_LINKS_2026-09-01.md"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def local_profile_and_source_indexes() -> tuple[dict[str, list[dict]], dict[str, dict]]:
    profiles_by_domain: dict[str, list[dict]] = {}
    sources: dict[str, dict] = {}
    files = [
        ROOT / "nigerian_fresh_web_enrichment_2026-08-26.json",
        ROOT / "nigerian_fresh_web_enrichment_2026-08-25.json",
        ROOT / "nigerian_fresh_web_enrichment_2026-08-25_followup.json",
        ROOT / "nigerian_global_professional_overlays.json",
        ROOT / "nigerian_remaining_body_web_evidence.json",
        ROOT / "nigerian_professional_body_audit.json",
    ]
    for path in files:
        if not path.exists():
            continue
        document = load(path)
        for source in document.get("sources", []) or []:
            source_id = source.get("id") or source.get("source_id")
            if source_id:
                sources[source_id] = source
        for profile in document.get("profiles", []) or []:
            local_source_ids = [
                source_id
                for source_id in profile.get("source_ids", []) or []
                if str(source_id).startswith("ng_")
            ]
            if not local_source_ids:
                continue
            item = dict(profile)
            item["source_ids"] = local_source_ids
            for domain_id in profile.get("domain_ids", []) or []:
                profiles_by_domain.setdefault(domain_id, []).append(item)
    return profiles_by_domain, sources


# These are compact, source-backed manual anchors where lexical matching missed
# the actual Nigerian CCMAS course. The course codes/titles/outcomes are copied
# from the local CCMAS extracts; the destination-domain context is supplied by
# Nigerian professional or university material in the profile/source layer.
MANUAL_COURSE_ANCHORS: dict[str, list[str]] = {
    "Sciences::Physics with Electronics": ["PHY 422"],
    "Allied Health Sciences::Pharmacology": ["PHA 301", "PHA 307", "PHA 309"],
    "Sciences::Biochemistry": ["BCH 203", "BCH 306", "BCH 402"],
    "Sciences::Biotechnology": ["BTG 305", "BTG 404"],
    "Sciences::Forensic Science": ["FRS 206", "FRS 306"],
    "Sciences::Microbiology": ["MCB 305", "MCB 405", "MCB 407"],
    "Sciences::Zoology": ["ZOO 312", "ZOO 411"],
}


def course_index(component_ref: str | None) -> dict[str, dict]:
    if not component_ref:
        return {}
    discipline, programme_name = component_ref.split("::", 1)
    for path in sorted((ROOT / "ccmas").glob("*.json")):
        document = load(path)
        if document.get("discipline") != discipline:
            continue
        programme = next(
            (item for item in document.get("programmes", []) or [] if item.get("name") == programme_name),
            None,
        )
        if programme:
            return {
                str(course.get("code")): {
                    **course,
                    "_source_file": str(path.relative_to(ROOT.parent.parent)),
                }
                for course in programme.get("courses", []) or []
                if course.get("code")
            }
    return {}


def compact_course(course: dict, matched_by: str) -> dict:
    source_file = course.get("_source_file") or "data/career-mapping/ccmas/*.json"
    code = course.get("code")
    return {
        "level": course.get("level"),
        "code": course.get("code"),
        "title": course.get("title"),
        "units": course.get("units"),
        "matched_by": matched_by,
        "learning_outcomes": [
            item for item in course.get("skills_learned", []) or []
            if isinstance(item, str) and item.strip()
        ][:8],
        "content_summary": str(course.get("content_summary") or "")[:900] or None,
        "source_state": course.get("source_state"),
        "source_reference": course.get("source_reference"),
        "source_file": source_file,
        "source_locator": f"{source_file}#course:{code}" if code else source_file,
    }


def local_context(domain_id: str, profiles_by_domain: dict[str, list[dict]], sources: dict[str, dict]) -> dict:
    profiles = []
    seen_profiles = set()
    for profile in profiles_by_domain.get(domain_id, []):
        profile_id = profile.get("id")
        if profile_id in seen_profiles:
            continue
        seen_profiles.add(profile_id)
        source_records = []
        for source_id in profile.get("source_ids", []) or []:
            source = sources.get(source_id)
            if not source:
                continue
            source_records.append({
                "source_id": source_id,
                "name": source.get("name"),
                "evidence_type": source.get("evidence_type") or source.get("kind"),
                "urls": source.get("urls") or ([source.get("url")] if source.get("url") else []),
                "findings": (source.get("findings") or [])[:6],
                "limitations": source.get("limitations"),
            })
        profiles.append({
            "profile_id": profile_id,
            "source_ids": profile.get("source_ids", []),
            "role_patterns": (profile.get("role_patterns") or [])[:12],
            "skills": (profile.get("skills") or [])[:8],
            "tools": (profile.get("tools") or [])[:6],
            "competencies": (profile.get("competencies") or [])[:6],
            "certifications": (profile.get("certifications") or [])[:6],
            "regulatory_requirements": (profile.get("regulatory_requirements") or [])[:6],
            "source_records": source_records,
        })
    source_ids = sorted({source_id for profile in profiles for source_id in profile.get("source_ids", [])})
    return {
        "profile_count": len(profiles),
        "source_ids": source_ids,
        "profiles": profiles[:8],
        "evidence_scope": "Nigerian professional, regulatory, university, or local-sector context for the destination domain; not proof of programme fit by itself.",
    }


def resolve_link(
    row: dict,
    link: dict,
    profiles_by_domain: dict[str, list[dict]],
    sources: dict[str, dict],
    courses_by_ref: dict[str, dict[str, dict]],
) -> dict:
    domain_id = link.get("domain_id")
    component_ref = row.get("component_ref")
    curriculum = link.get("nigerian_curriculum_evidence") or {}
    course_by_code = courses_by_ref.get(component_ref or "", {})
    courses = []
    existing_codes = {
        str(item.get("code")) for item in curriculum.get("matched_courses", []) or []
    }
    for item in curriculum.get("matched_courses", []) or []:
        if item.get("record_match") is not False:
            course = dict(item)
            source_course = course_by_code.get(str(item.get("code")))
            if source_course:
                course.setdefault("source_file", source_course.get("_source_file"))
                course.setdefault(
                    "source_locator",
                    f"{source_course.get('_source_file')}#course:{item.get('code')}",
                )
            else:
                course.setdefault("source_file", "data/career-mapping/ccmas/*.json")
                course.setdefault("source_locator", f"data/career-mapping/ccmas/*.json#course:{item.get('code')}")
            courses.append(course)
    manual_codes = MANUAL_COURSE_ANCHORS.get(component_ref or "", [])
    for code in manual_codes:
        if code in existing_codes or code not in course_by_code:
            continue
        courses.append(compact_course(course_by_code[code], "manual_nigerian_ccmas_review"))
    context = local_context(domain_id, profiles_by_domain, sources)
    quality = curriculum.get("course_anchor_quality")
    if quality == "strong":
        disposition = "certified_nigerian_curriculum_link"
        publish = True
        relationship = link.get("match_type")
        reason = "The link meets the Nigerian CCMAS course/objective evidence gate."
    elif courses and context.get("profile_count"):
        disposition = "resolved_nigerian_bridge_link"
        publish = True
        relationship = "adjacent" if link.get("match_type") == "functional" and len(courses) == 1 else link.get("match_type")
        reason = "Nigerian CCMAS course evidence and Nigerian destination-domain professional/context evidence support a guided bridge; the UI must show the additional preparation required."
    elif context.get("profile_count"):
        disposition = "removed_unsupported_candidate"
        publish = False
        relationship = None
        reason = "Nigerian destination-domain context exists, but the student's Nigerian programme has no specific curriculum anchor for this candidate link. It is removed from the certified set rather than inferred from context alone."
    else:
        disposition = "source_gap_requires_manual_research"
        publish = False
        relationship = None
        reason = "No Nigerian destination-domain source profile was found in the reviewed repository catalogs."
    return {
        "domain_id": domain_id,
        "domain_name": link.get("domain_name"),
        "original_match_type": link.get("match_type"),
        "reviewed_match_type": relationship,
        "publish_in_reviewed_map": publish,
        "disposition": disposition,
        "reason": reason,
        "nigerian_curriculum_courses": courses[:16],
        "nigerian_curriculum_course_count": len(courses),
        "nigerian_professional_context": context,
        "source_boundary": "Nigerian CCMAS courses establish programme learning. Nigerian professional or local sources establish destination-domain context, bridge preparation, regulation, or local practice. Global sources are not used to fill this gap.",
    }


def main() -> None:
    document = load(INPUT)
    profiles_by_domain, sources = local_profile_and_source_indexes()
    courses_by_ref = {
        row.get("component_ref"): course_index(row.get("component_ref"))
        for row in document.get("rows", []) or []
        if row.get("component_ref")
    }
    reviewed_rows = []
    disposition_counts = Counter()
    for row in document.get("rows", []) or []:
        reviewed_links = []
        for link in row.get("links", []) or []:
            reviewed = resolve_link(row, link, profiles_by_domain, sources, courses_by_ref)
            if reviewed["disposition"] == "source_gap_requires_manual_research":
                # This is retained as a visible stop only if the source catalogs
                # truly do not cover the target domain. The current dataset is
                # expected to have local context for every affected pair.
                pass
            disposition_counts[reviewed["disposition"]] += 1
            reviewed_links.append(reviewed)
        reviewed_rows.append({
            "jamb_name": row.get("jamb_name"),
            "mapping_type": row.get("mapping_type"),
            "component_ref": row.get("component_ref"),
            "status_before": row.get("status_before"),
            "links": reviewed_links,
        })
    out = {
        "schema_version": "2026-09-01.ccmas-nigerian-reviewed-links.v1",
        "purpose": "Resolve all candidate links in the CCMAS/JAMB review queue using exact Nigerian curriculum evidence plus Nigerian professional/local context, with unsupported candidates removed rather than invented.",
        "source_boundary": {
            "programme_fit": "Nigerian CCMAS course titles, codes, learning outcomes and content summaries.",
            "destination_context": "Nigerian professional-body, regulator, university, or local-sector evidence.",
            "global_sources": "Not used to fill programme-fit gaps; they remain separate domain-context evidence.",
            "no_unresolved_rule": "Every affected candidate receives a reviewed disposition: certified, resolved bridge, or removed unsupported candidate. A source-gap disposition is a data failure and is counted explicitly if it occurs.",
        },
        "summary": {
            "affected_jamb_rows": len(reviewed_rows),
            "candidate_link_occurrences": sum(len(row["links"]) for row in reviewed_rows),
            "disposition_counts": dict(disposition_counts),
            "rows_with_source_gap": sum(
                any(link["disposition"] == "source_gap_requires_manual_research" for link in row["links"])
                for row in reviewed_rows
            ),
            "links_published_in_reviewed_map": sum(
                link["publish_in_reviewed_map"] for row in reviewed_rows for link in row["links"]
            ),
        },
        "inputs": [
            str(INPUT.relative_to(ROOT.parent)),
            "data/career-mapping/ccmas/*.json",
            "data/career-mapping/nigerian_* enrichment and professional-body catalogs",
        ],
        "rows": reviewed_rows,
    }
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Nigerian CCMAS/JAMB reviewed links — 2026-09-01",
        "",
        "This is a reviewed disposition layer for the previous 86-row queue. It uses exact Nigerian CCMAS curriculum material for programme learning and Nigerian professional/local evidence for destination-domain context and bridge preparation.",
        "",
        f"- Affected JAMB rows: **{out['summary']['affected_jamb_rows']}**",
        f"- Candidate link occurrences: **{out['summary']['candidate_link_occurrences']}**",
        f"- Published in reviewed map: **{out['summary']['links_published_in_reviewed_map']}**",
        f"- Source-gap links: **{out['summary']['rows_with_source_gap']} rows**",
        "",
        "## Dispositions",
        "",
    ]
    for key, value in sorted(disposition_counts.items()):
        lines.append(f"- `{key}`: **{value}**")
    lines += [
        "",
        "## Rule",
        "",
        "A bridge link is not a claim that the programme qualifies the learner for the destination profession. It means the programme supplies an evidenced starting point and the Nigerian professional/local sources identify the additional domain preparation, examination, registration, or supervised practice that must be explained in the guidance flow.",
        "",
        "Unsupported candidates are removed from the reviewed published set. They are not silently retained as recommendations merely because a global occupational source or a broad Nigerian context profile exists.",
        "",
        "## Reproducibility",
        "",
        "```text",
        "python data/career-mapping/_review_nigerian_ccmas_links.py",
        "```",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(out["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
