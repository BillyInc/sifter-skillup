#!/usr/bin/env python3
"""Classify the current JAMB downstream domain-catalogue mismatch queue.

Audit-only: this script reads the corrected JAMB scopes, JAMB domain links and
CCMAS component score catalogue.  It writes a timestamped append-only report;
it does not edit mappings, seeds, role names, domains, SQL or canonical scope
records.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
CAREER = ROOT / "data" / "career-mapping"
SCOPE_PATH = HERE / "jamb_curriculum_scopes_2026-08-17.json"
RECON_PATH = max(
    HERE.glob("jamb_ccmas_domain_mapping_reconciliation_*.json"),
    key=lambda path: path.stat().st_mtime,
)
JAMB_DOMAIN_MAP_PATH = CAREER / "jamb_domain_map.json"
SCORE_PATH = CAREER / "programme_domain_scores.json"
CHECKED_ON = __import__("datetime").date.today().isoformat()
STAMP = f"{CHECKED_ON.replace('-', '_')}_current"
OUT_JSON = HERE / f"jamb_domain_catalogue_mismatch_audit_{STAMP}.json"
OUT_MD = HERE / f"jamb_domain_catalogue_mismatch_audit_{STAMP}.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def norm(value: Any) -> str:
    value = str(value or "").casefold()
    value = value.replace("–", "-").replace("—", "-")
    value = re.sub(r"[^\w]+", " ", value, flags=re.UNICODE)
    return re.sub(r"\s+", " ", value).strip()


def classify_anchor(link: dict[str, Any], selected_titles: set[str]) -> tuple[str, list[str], list[str]]:
    anchors = [norm(title) for title in (link.get("scope_course_titles") or [])]
    matched = [title for title in anchors if title in selected_titles]
    unmatched = [title for title in anchors if title not in selected_titles]
    if not anchors:
        return "genuinely_unsupported_no_scope_anchor", matched, unmatched
    if matched and not unmatched:
        return "source_anchored_repairable", matched, unmatched
    if matched:
        return "mixed_anchor_review", matched, unmatched
    return "stale_unselected_anchor_repair", matched, unmatched


def action_for(classification: str) -> str:
    return {
        "source_anchored_repairable": "Reconcile the exact direct/functional/adjacent label against the selected-course evidence, then repair the catalogue link if that label is supported; do not auto-promote.",
        "mixed_anchor_review": "Keep the link out of confirmed promotion until stale anchors are removed or replaced with selected-course anchors and the semantic label is verified.",
        "stale_unselected_anchor_repair": "Replace the stale anchor with a current selected-course anchor only if source evidence supports it; otherwise remove/hold the link.",
        "genuinely_unsupported_no_scope_anchor": "Keep out of the confirmed student view; require an item-specific selected-course/domain evidence record before any repair or promotion.",
    }[classification]


def score_evidence(components: list[str], domain_id: str, scores: dict[str, Any]) -> tuple[str, list[dict[str, Any]]]:
    evidence = []
    for component in components:
        for link in (scores.get(component, {}) or {}).get("links", []) or []:
            if link.get("domain_id") == domain_id:
                evidence.append(
                    {
                        "component": component,
                        "domain_id": link.get("domain_id"),
                        "domain_name": link.get("domain_name"),
                        "match_type": link.get("match_type"),
                        "score": link.get("score"),
                        "course_match": link.get("course_match"),
                    }
                )
    if not evidence:
        return "domain_absent_from_component_score_catalogue", evidence
    return "domain_present_under_different_match_type", evidence


def build() -> dict[str, Any]:
    scopes = {row["jamb_name"]: row for row in load(SCOPE_PATH)["rows"]}
    reconciliation = load(RECON_PATH)
    jamb_domain_map = load(JAMB_DOMAIN_MAP_PATH)
    scores = load(SCORE_PATH)

    records: list[dict[str, Any]] = []
    for row in reconciliation["rows"]:
        scope = scopes[row["jamb_name"]]
        selected_titles = {norm(course.get("title")) for course in scope.get("selected_courses") or []}
        links = jamb_domain_map.get(row["jamb_name"], {}).get("links", [])
        for issue in row.get("issues", []):
            if issue.get("kind") != "domain_link_not_present_in_component_score_catalogue":
                continue
            details = issue["details"]
            link = next(
                link
                for link in links
                if link.get("domain_id") == details.get("domain_id")
                and link.get("match_type") == details.get("match_type")
            )
            classification, matched, unmatched = classify_anchor(link, selected_titles)
            score_status, score_links = score_evidence(row.get("ccmas_components") or [], details["domain_id"], scores)
            records.append(
                {
                    "jamb_name": row["jamb_name"],
                    "scope_status": scope.get("scope_status"),
                    "components": row.get("ccmas_components") or [],
                    "selected_course_count": len(scope.get("selected_courses") or []),
                    "domain_id": details.get("domain_id"),
                    "domain_name": link.get("domain_name"),
                    "current_match_type": details.get("match_type"),
                    "link_source": link.get("source"),
                    "link_src": link.get("src"),
                    "semantic_review_status": link.get("semantic_review_status"),
                    "scope_course_titles_as_stored": link.get("scope_course_titles") or [],
                    "matched_selected_scope_titles": matched,
                    "unmatched_scope_titles": unmatched,
                    "anchor_classification": classification,
                    "component_score_status": score_status,
                    "component_score_evidence": score_links,
                    "proposed_action": action_for(classification),
                }
            )

    anchor_counts = Counter(record["anchor_classification"] for record in records)
    score_counts = Counter(record["component_score_status"] for record in records)
    cross_counts = Counter((record["anchor_classification"], record["component_score_status"]) for record in records)
    return {
        "schema": "2026-10-02.jamb-domain-catalogue-mismatch-audit.v1",
        "checked_on": CHECKED_ON,
        "generated_at_utc": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "append_only": True,
        "lane": "downstream-domain-catalogue-audit",
        "scope": {
            "mismatch_occurrences_checked": len(records),
            "canonical_jamb_identities_in_reconciliation": len(reconciliation["rows"]),
            "method": [
                "Read the current corrected JAMB scope selected-course titles.",
                "Read each mismatching JAMB domain link's stored course-title anchors.",
                "Classify exact current selected anchors versus mixed, stale, or absent anchors.",
                "Cross-check the target domain against all declared CCMAS component score links and retain the existing label evidence.",
            ],
            "downstream_domains_subgroups_roles_edited": False,
            "generated_seeds_edited": False,
            "role_names_edited": False,
        },
        "classification_counts": {
            "source_anchored_repairable": anchor_counts["source_anchored_repairable"],
            "mixed_anchor_review": anchor_counts["mixed_anchor_review"],
            "stale_unselected_anchor_repair": anchor_counts["stale_unselected_anchor_repair"],
            "genuinely_unsupported_no_scope_anchor": anchor_counts["genuinely_unsupported_no_scope_anchor"],
            "at_least_one_current_source_anchor_repair_candidate": anchor_counts["source_anchored_repairable"] + anchor_counts["mixed_anchor_review"],
            "currently_without_a_current_selected_anchor": anchor_counts["stale_unselected_anchor_repair"] + anchor_counts["genuinely_unsupported_no_scope_anchor"],
        },
        "component_score_catalogue_counts": dict(score_counts),
        "cross_counts": {
            f"{anchor}__{score}": count
            for (anchor, score), count in sorted(cross_counts.items())
        },
        "interpretation": {
            "repairable": "A source-anchored or mixed link is a repair candidate, not an automatically confirmed student link. Its direct/functional/adjacent label still needs semantic validation against the selected course outcomes.",
            "genuinely_unsupported": "No-anchor links are unsupported by the current JAMB scope evidence. Stale-only links are unsupported as currently encoded but may be repaired if a current selected-course anchor is established.",
            "score_catalogue": "The 349/145 split describes whether the target domain is absent from all component score rows or present there under a different label. Neither count by itself proves the JAMB-specific link; the scope anchor and course evidence remain decisive.",
        },
        "examples": {
            "source_anchored_repairable": next(record for record in records if record["anchor_classification"] == "source_anchored_repairable"),
            "mixed_anchor_review": next(record for record in records if record["anchor_classification"] == "mixed_anchor_review"),
            "stale_unselected_anchor_repair": next(record for record in records if record["anchor_classification"] == "stale_unselected_anchor_repair"),
            "genuinely_unsupported_no_scope_anchor": next(record for record in records if record["anchor_classification"] == "genuinely_unsupported_no_scope_anchor"),
        },
        "records": records,
        "input_artifacts": {
            str(path.relative_to(ROOT)): sha256(path)
            for path in [SCOPE_PATH, RECON_PATH, JAMB_DOMAIN_MAP_PATH, SCORE_PATH]
        },
    }


def markdown(report: dict[str, Any]) -> str:
    c = report["classification_counts"]
    s = report["component_score_catalogue_counts"]
    generated = report.get("generated_at_utc", "")
    generated_label = generated.replace("T", " ").replace("+00:00", " UTC")[:23]
    lines = [
        "# JAMB downstream domain-catalogue mismatch audit — 2026-09-29 17:37 UTC",
        "",
        "Append-only audit report. No generated seed, role name, domain record, mapping record, scope record, SQL file or downstream data was edited.",
        "",
        "## Exact counts",
        "",
        f"- Total mismatch occurrences checked: **{report['scope']['mismatch_occurrences_checked']}**.",
        f"- Fully source-anchored repair candidates: **{c['source_anchored_repairable']}**.",
        f"- Mixed current/stale anchors needing reconciliation: **{c['mixed_anchor_review']}**.",
        f"- Stale-only anchors pointing outside the current selected scope: **{c['stale_unselected_anchor_repair']}**.",
        f"- Genuinely unsupported with no scope anchor: **{c['genuinely_unsupported_no_scope_anchor']}**.",
        f"- At least one current selected-course anchor: **{c['at_least_one_current_source_anchor_repair_candidate']}**.",
        f"- No current selected-course anchor: **{c['currently_without_a_current_selected_anchor']}** ({c['stale_unselected_anchor_repair']} stale-only + {c['genuinely_unsupported_no_scope_anchor']} no-anchor).",
        "",
        "## Component-score cross-check",
        "",
        f"- Target domain absent from every declared component score catalogue: **{s.get('domain_absent_from_component_score_catalogue', 0)}**.",
        f"- Target domain present in a component score catalogue under a different label: **{s.get('domain_present_under_different_match_type', 0)}**.",
        "",
        f"The {c['source_anchored_repairable']} fully anchored records are repair candidates, not automatic confirmations: their match type still requires semantic review. The {c['genuinely_unsupported_no_scope_anchor']} no-anchor records are unsupported by current scope evidence. The {c['stale_unselected_anchor_repair']} stale-only records are currently unsupported but may be repairable if a valid selected-course anchor is restored.",
        "",
        "## Representative records",
        "",
    ]
    lines[0] = f"# JAMB downstream domain-catalogue mismatch audit — {report['checked_on']} ({generated_label})"
    for label, record in report["examples"].items():
        lines.extend([
            f"### {label}",
            "",
            f"- `{record['jamb_name']}` → `{record['domain_id']} {record['domain_name']}` ({record['current_match_type']}).",
            f"- Stored anchors: {record['scope_course_titles_as_stored'] or 'none'}.",
            f"- Matched current anchors: {record['matched_selected_scope_titles'] or 'none'}; unmatched: {record['unmatched_scope_titles'] or 'none'}.",
            f"- Component-score status: `{record['component_score_status']}`.",
            f"- Action: {record['proposed_action']}",
            "",
        ])
    lines.extend([
        "## Full machine-readable register",
        "",
        f"The complete {report['scope']['mismatch_occurrences_checked']}-record register is in `{OUT_JSON.relative_to(ROOT)}`. Each record includes the JAMB identity, target domain, stored anchors, current-scope matches, component-score evidence, and proposed action.",
        "",
        "## Guardrails",
        "",
        "- This is classification only; it does not repair or delete links.",
        "- Downstream domains, subgroups and roles were not renamed or edited.",
        "- Generated seeds and SQL were not regenerated or changed.",
    ])
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    report = build()
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_MD.write_text(markdown(report), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "mismatches": len(report["records"])}, indent=2))
