#!/usr/bin/env python3
"""Cross-check all JAMB domain links against current, course-scoped CCMAS evidence.

Audit-only. It does not edit mappings or promote candidate links. Evidence is
matched to a JAMB scope by CCMAS source file, package, course code and title.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any


CAREER = Path(__file__).resolve().parents[1]
AUDIT = CAREER / "_audit"
SCOPES_PATH = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
DOMAIN_MAP_PATH = CAREER / "jamb_domain_map.json"
EVIDENCE_PATH = AUDIT / "programme_domain_evidence_recomputed_2026-10-02.json"
SCORES_PATH = AUDIT / "programme_domain_scores_recomputed_2026-10-02.json"
OUT_JSON = AUDIT / f"jamb_domain_links_refreshed_ccmas_evidence_{date.today().isoformat()}.json"
OUT_MD = OUT_JSON.with_suffix(".md")


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip().casefold())


def course_key(code: Any, title: Any) -> tuple[str, str]:
    return norm(code), norm(title)


def build() -> dict[str, Any]:
    scopes = {row["jamb_name"]: row for row in load(SCOPES_PATH).get("rows", [])}
    domain_map = load(DOMAIN_MAP_PATH)
    evidence = load(EVIDENCE_PATH)
    scores = load(SCORES_PATH)
    evidence_by_component: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in evidence.values():
        evidence_by_component[str(record.get("programme_key") or "")].append(record)
    links_out: list[dict[str, Any]] = []
    candidates_out: list[dict[str, Any]] = []
    unresolved_component_joins: list[dict[str, Any]] = []
    counts: Counter[str] = Counter()
    quality_counts: Counter[str] = Counter()

    for jamb_name, scope in sorted(scopes.items()):
        selected_by_component: dict[tuple[str, str], set[tuple[str, str]]] = defaultdict(set)
        for course in scope.get("selected_courses", []):
            key = (norm(course.get("source_ccmas_file")), norm(course.get("source_ccmas_programme")))
            if key[0] and key[1]:
                selected_by_component[key].add(course_key(course.get("code"), course.get("title")))

        components = list(scope.get("component_refs", []))
        existing_links = list(domain_map.get(jamb_name, {}).get("links", []))
        existing_ids = {link.get("domain_id") for link in existing_links}
        component_records: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for component in components:
            try:
                _discipline, programme = component.split("::", 1)
            except ValueError:
                continue
            source_files = {
                norm(record.get("ccmas_source_file"))
                for record in evidence_by_component.get(component, [])
                if record.get("ccmas_source_file")
            }
            matching_scopes = [
                key for key in selected_by_component
                if key[1] == norm(programme) and key[0] in source_files
            ]
            if len(matching_scopes) != 1:
                if not source_files:
                    reason = "no_current_component_domain_evidence_record"
                elif not matching_scopes:
                    reason = "component_source_file_or_package_not_in_selected_scope"
                else:
                    reason = "multiple_exact_component_source_matches"
                counts[f"component_join:{reason}"] += 1
                unresolved_component_joins.append({
                    "jamb_name": jamb_name,
                    "component": component,
                    "component_evidence_source_files": sorted(source_files),
                    "selected_scope_source_keys": [list(key) for key in sorted(selected_by_component)],
                    "reason": reason,
                })
                continue
            source_key = matching_scopes[0]
            for record in evidence_by_component.get(component, []):
                if norm(record.get("ccmas_source_file")) != source_key[0]:
                    continue
                component_records[record.get("domain_id")].append({
                    "component": component,
                    "source_key": source_key,
                    "record": record,
                    "selected_course_keys": selected_by_component[source_key],
                })

        def overlaps(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
            found = []
            seen = set()
            for item in items:
                for anchor in item["record"].get("course_anchors", []):
                    key = course_key(anchor.get("code"), anchor.get("title"))
                    if key in item["selected_course_keys"] and key not in seen:
                        seen.add(key)
                        found.append({
                            "component": item["component"],
                            "course_code": anchor.get("code"),
                            "course_title": anchor.get("title"),
                            "matched_domain_anchors": anchor.get("matched_anchors", []),
                            "source_review_required": item["record"].get("source_review_required"),
                            "component_anchor_quality": item["record"].get("course_anchor_quality"),
                        })
            return found

        for link in existing_links:
            domain_id = link.get("domain_id")
            component_evidence = component_records.get(domain_id, [])
            selected_anchors = overlaps(component_evidence)
            related_scores = []
            for component in components:
                for score_link in scores.get(component, {}).get("links", []):
                    if score_link.get("domain_id") == domain_id:
                        related_scores.append({
                            "component": component,
                            "match_type": score_link.get("match_type"),
                            "course_match": score_link.get("course_match"),
                            "score": score_link.get("score"),
                        })
            if len(selected_anchors) >= 2:
                selected_support = "two_or_more_selected_course_anchors"
            elif len(selected_anchors) == 1:
                selected_support = "one_selected_course_anchor"
            else:
                selected_support = "no_current_selected_course_anchor"
            quality_counts[selected_support] += 1
            links_out.append({
                "jamb_name": jamb_name,
                "domain_id": domain_id,
                "domain_name": link.get("domain_name"),
                "current_match_type": link.get("match_type"),
                "mapping_source": link.get("source") or link.get("src"),
                "stored_course_titles": link.get("scope_course_titles") or [],
                "selected_scope_anchor_status": selected_support,
                "selected_scope_anchor_count": len(selected_anchors),
                "selected_scope_anchors": selected_anchors,
                "full_component_evidence": [
                    {
                        "component": item["component"],
                        "quality": item["record"].get("course_anchor_quality"),
                        "course_anchor_count": item["record"].get("course_anchor_count"),
                        "source_review_required": item["record"].get("source_review_required"),
                    }
                    for item in component_evidence
                ],
                "refreshed_component_score_evidence": related_scores,
            })

        for domain_id, items in component_records.items():
            if domain_id in existing_ids:
                continue
            selected_anchors = overlaps(items)
            if len(selected_anchors) < 2:
                continue
            review_required = any(item["record"].get("source_review_required") for item in items)
            types = sorted({str(item["record"].get("match_type")) for item in items if item["record"].get("match_type")})
            candidates_out.append({
                "jamb_name": jamb_name,
                "domain_id": domain_id,
                "domain_name": items[0]["record"].get("domain_name"),
                "component_match_types": types,
                "selected_scope_anchor_count": len(selected_anchors),
                "selected_scope_anchors": selected_anchors,
                "component_source_review_required": review_required,
                "candidate_state": "requires_semantic_review_not_auto_promoted",
            })

    counts["jamb_identities"] = len(scopes)
    counts["current_domain_links"] = len(links_out)
    counts["unmapped_two_plus_anchor_candidates"] = len(candidates_out)
    counts["candidate_review_required"] = sum(item["component_source_review_required"] for item in candidates_out)
    return {
        "schema": "2026-10-02.jamb-domain-refreshed-ccmas-evidence-audit.v1",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "audit_only": True,
        "scope": {
            "jamb_identities": len(scopes),
            "component_evidence_records": len(evidence),
            "current_link_occurrences": len(links_out),
            "candidate_link_occurrences": len(candidates_out),
            "sources": [
                "Updated checked-in CCMAS course titles, summaries, and outcomes via the current programme-domain evidence builder.",
                "JAMB selected-course scopes; component/evidence joins require a source-package and exact code/title match.",
            ],
        },
        "counts": dict(sorted(counts.items())),
        "current_link_support_counts": dict(sorted(quality_counts.items())),
        "current_links": links_out,
        "unmapped_candidates": candidates_out,
        "unresolved_component_joins": unresolved_component_joins,
        "guardrail": "A candidate is evidence for review only. This audit does not add links or certify Direct/Functional/Adjacent status.",
    }


def main() -> None:
    report = build()
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# JAMB domain links against refreshed CCMAS course evidence — 2026-10-02",
        "",
        "Audit-only comparison. It uses exact source package, course-code, and title joins; it does not auto-promote domains or match types.",
        "",
        "## Counts",
        "",
    ]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in report["counts"].items())
    lines.extend(["", "## Current link anchor coverage", ""])
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in report["current_link_support_counts"].items())
    lines.extend([
        "",
        "Candidate links are held for semantic review. A course-text overlap is evidence to inspect, not proof that a JAMB programme reaches a domain.",
        "",
        f"Full current-link and candidate register: `{OUT_JSON.name}`.",
        "",
    ])
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "counts": report["counts"], "coverage": report["current_link_support_counts"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
