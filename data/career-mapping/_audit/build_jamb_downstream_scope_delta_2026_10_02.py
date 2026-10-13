"""Create a reproducible delta register for refreshed CCMAS-driven JAMB scopes."""

from __future__ import annotations

import hashlib
import json
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
OLD = HERE / "jamb_curriculum_scopes_2026-08-17.json"
NEW = HERE / "jamb_curriculum_scopes_2026-10-02_dry_run.json"
EVIDENCE = HERE / "programme_domain_evidence_2026-10-02_dry_run.json"
OUT_JSON = HERE / f"jamb_downstream_scope_delta_{date.today().isoformat()}.json"
OUT_MD = HERE / f"jamb_downstream_scope_delta_{date.today().isoformat()}.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return " ".join(str(value or "").split()).casefold()


def course_key(course: dict[str, Any]) -> tuple[str, str, str, str]:
    return (
        str(course.get("source_ccmas_file") or course.get("source_external_file") or ""),
        str(course.get("source_ccmas_programme") or course.get("source_external_programme") or ""),
        str(course.get("code") or "").strip().upper(),
        norm(course.get("title")),
    )


def link_key(link: dict[str, Any]) -> tuple[str, str]:
    return (str(link.get("domain_id") or ""), str(link.get("match_type") or ""))


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build() -> dict[str, Any]:
    old = {row["jamb_name"]: row for row in load(OLD)["rows"]}
    new = {row["jamb_name"]: row for row in load(NEW)["rows"]}
    evidence = load(EVIDENCE)
    course_delta: list[dict[str, Any]] = []
    link_delta: list[dict[str, Any]] = []
    counts: Counter[str] = Counter()

    for name in sorted(set(old) | set(new), key=str.casefold):
        before = old.get(name, {})
        after = new.get(name, {})
        old_courses = {course_key(item): item for item in before.get("selected_courses", [])}
        new_courses = {course_key(item): item for item in after.get("selected_courses", [])}
        for direction, diff in (("added", new_courses.keys() - old_courses.keys()), ("removed", old_courses.keys() - new_courses.keys())):
            for key in sorted(diff):
                course = (new_courses if direction == "added" else old_courses)[key]
                terms = [str(term) for term in course.get("scope_match_terms") or []]
                title = norm(course.get("title"))
                title_terms = [term for term in terms if norm(term) in title]
                course_delta.append({
                    "jamb_name": name,
                    "change": direction,
                    "course_identity": {"source_file": key[0], "source_programme": key[1], "code": key[2], "title": course.get("title")},
                    "scope_match_terms": terms,
                    "matched_in_course_title": title_terms,
                    "matched_only_outside_title": bool(terms) and not title_terms,
                    "content_summary": course.get("content_summary"),
                    "learning_outcomes": course.get("learning_outcomes") or course.get("skills_learned") or [],
                })
                counts[f"course:{direction}"] += 1
                counts[f"programmes_with_course_{direction}"] += 0  # set below

        old_links = {link_key(item): item for item in before.get("domain_links", [])}
        new_links = {link_key(item): item for item in after.get("domain_links", [])}
        for direction, diff in (("added", new_links.keys() - old_links.keys()), ("removed", old_links.keys() - new_links.keys())):
            for key in sorted(diff):
                link = (new_links if direction == "added" else old_links)[key]
                anchors = []
                for ref in after.get("component_refs", []):
                    record = evidence.get(f"{ref}::{key[0]}") or {}
                    anchors.extend(record.get("course_anchors") or [])
                anchors = [item for item in anchors if norm(item.get("title")) in {norm(c.get("title")) for c in after.get("selected_courses", [])}]
                previous_titles = {norm(c.get("title")) for c in before.get("selected_courses", [])}
                new_selected_titles = {norm(c.get("title")) for c in after.get("selected_courses", [])} - previous_titles
                prior_scope_anchors = [item for item in anchors if norm(item.get("title")) in previous_titles]
                newly_added_scope_anchors = [item for item in anchors if norm(item.get("title")) in new_selected_titles]
                link_delta.append({
                    "jamb_name": name,
                    "change": direction,
                    "domain_id": key[0],
                    "match_type": key[1],
                    "domain_name": link.get("domain_name"),
                    "scope_course_titles": link.get("scope_course_titles") or [],
                    "matched_selected_course_evidence": anchors,
                    "anchors_already_in_current_scope": prior_scope_anchors,
                    "anchors_dependent_on_new_scope_expansion": newly_added_scope_anchors,
                    "semantic_review_status": link.get("semantic_review_status"),
                    "source": link.get("source"),
                })
                counts[f"link:{direction}"] += 1

    course_programmes = Counter((item["jamb_name"], item["change"]) for item in course_delta)
    link_programmes = Counter((item["jamb_name"], item["change"]) for item in link_delta)
    result = {
        "schema": "2026-10-02.jamb-downstream-scope-delta.v1",
        "generated_on": date.today().isoformat(),
        "status": "candidate_delta_not_promoted",
        "summary": {
            "jamb_identities_compared": len(set(old) | set(new)),
            "course_additions": sum(item["change"] == "added" for item in course_delta),
            "course_removals": sum(item["change"] == "removed" for item in course_delta),
            "programmes_with_course_additions": len({name for name, direction in course_programmes if direction == "added"}),
            "programmes_with_course_removals": len({name for name, direction in course_programmes if direction == "removed"}),
            "link_additions": sum(item["change"] == "added" for item in link_delta),
            "link_removals": sum(item["change"] == "removed" for item in link_delta),
            "programmes_with_link_additions": len({name for name, direction in link_programmes if direction == "added"}),
            "programmes_with_link_removals": len({name for name, direction in link_programmes if direction == "removed"}),
            "added_courses_matching_query_term_in_title": sum(item["change"] == "added" and bool(item["matched_in_course_title"]) for item in course_delta),
            "added_courses_matching_query_only_in_body": sum(item["change"] == "added" and item["matched_only_outside_title"] for item in course_delta),
            "added_domain_links_with_selected_course_anchor": sum(item["change"] == "added" and bool(item["matched_selected_course_evidence"]) for item in link_delta),
            "added_domain_links_without_selected_course_anchor": sum(item["change"] == "added" and not item["matched_selected_course_evidence"] for item in link_delta),
            "added_domain_links_supported_by_current_scope_only": sum(item["change"] == "added" and bool(item["anchors_already_in_current_scope"]) and not item["anchors_dependent_on_new_scope_expansion"] for item in link_delta),
            "added_domain_links_requiring_new_course_selection": sum(item["change"] == "added" and bool(item["anchors_dependent_on_new_scope_expansion"]) for item in link_delta),
        },
        "source_hashes": {str(path.relative_to(ROOT)): sha(path) for path in [OLD, NEW, EVIDENCE]},
        "guardrails": [
            "Candidate scope expansion and domain-link deltas are not applied to canonical mapping files.",
            "Course additions are distinguished by whether a programme term occurs in the course title or only in body text.",
            "Every added link includes the selected CCMAS course anchors that support it, where available.",
            "The course selection algorithm can return broad body-text hits; those must be narrowed before promotion.",
        ],
        "course_delta": course_delta,
        "link_delta": link_delta,
    }
    return result


def main() -> None:
    result = build()
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    s = result["summary"]
    lines = [
        f"# JAMB downstream candidate delta — {result['generated_on']}",
        "",
        "This report compares the current 420-name scope with a regenerated candidate based on the corrected CCMAS catalogue and refreshed programme-domain evidence. It is a review register, not a promotion.",
        "",
        "## Counts",
        "",
        *[f"- **{key.replace('_', ' ')}:** {value}" for key, value in s.items()],
        "",
        "## Required handling",
        "",
        "Course additions matched only from summaries/outcomes require specificity review; exact course-title matches and link-level selected-course anchors are recorded separately. Do not bulk-apply the candidate scope as-is.",
        "",
        f"Full before/after register: `{OUT_JSON.name}`.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "summary": s}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
