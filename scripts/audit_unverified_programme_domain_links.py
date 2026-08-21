#!/usr/bin/env python3
"""Audit quarantined programme-to-domain links against CCMAS evidence.

The scorer's ranking is not curriculum evidence.  This audit re-runs the
same source-backed course-anchor test used for active links, but against every
link retained in ``unverified_links``.  Each row receives an explicit decision
and keeps the domain definition and matched course evidence for review.

This script is intentionally non-mutating: a link is only restored by the
mapping builder after this report proves the required evidence threshold.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

from data_loader import load_mapping_inputs


ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / "data" / "career-mapping" / "_audit" / "programme_domain_unverified_link_audit_2026-08-19.json"
OUT_MD = ROOT / "docs" / "manual-review" / "programme-domain-unverified-link-audit-2026-08-19.md"


def main() -> None:
    mapping, meta, structure, programmes, source_files, anchor_phrases = load_mapping_inputs()
    rows: list[dict] = []

    for programme_key, value in mapping.items():
        programme = programmes[programme_key]
        discipline, programme_name = programme_key.split("::", 1)
        for link in value.get("unverified_links") or []:
            domain_id = link["domain_id"]
            domain = meta[domain_id]
            anchors = []
            for course in programme.get("courses") or []:
                haystack = " ".join(
                    [
                        str(course.get("title") or ""),
                        str(course.get("mapping_title") or ""),
                        str(course.get("content_summary") or ""),
                        *(str(item) for item in course.get("skills_learned") or []),
                    ]
                ).lower()
                matched = sorted(
                    {
                        phrase
                        for phrase in anchor_phrases(domain_id, domain, structure.get(domain_id, {}))
                        if phrase in haystack
                    }
                )
                if matched:
                    anchors.append(
                        {
                            "code": course.get("code"),
                            "title": course.get("title"),
                            "course_identity": course.get("course_identity"),
                            "matched_anchors": matched[:12],
                            "source_state": course.get("source_state"),
                            "source_flags": list(course.get("flags") or []),
                        }
                    )

            source_review = []
            if programme.get("source_state"):
                source_review.append(
                    {
                        "source_state": programme.get("source_state"),
                        "source_reference": programme.get("source_reference"),
                    }
                )
            source_review.extend(
                {
                    "code": item.get("code"),
                    "title": item.get("title"),
                    "source_state": item.get("source_state"),
                    "source_reference": item.get("source_reference"),
                }
                for item in programme.get("source_omitted_courses") or []
                if item.get("source_state")
            )

            # A single generic phrase is not enough to restore a link.  The
            # active pipeline requires two source-backed course anchors for a
            # strong link; direct links also need more than one anchor.
            if len(anchors) >= 2 and not source_review:
                decision = "restore_candidate"
                reason = "at least two source-backed CCMAS course anchors and no source blocker"
            elif len(anchors) == 1:
                decision = "retain_quarantined"
                reason = "one incidental or ambiguous course anchor is insufficient for restoration"
            else:
                decision = "retain_quarantined"
                reason = "no source-backed CCMAS course anchor"

            rows.append(
                {
                    "programme_key": programme_key,
                    "discipline": discipline,
                    "programme": programme_name,
                    "ccmas_code": programme.get("code"),
                    "ccmas_source_file": source_files.get(programme_key),
                    "domain_id": domain_id,
                    "domain_name": domain.get("domain_name"),
                    "domain_definition": domain.get("description"),
                    "domain_cluster": domain.get("cluster"),
                    "match_type": link.get("match_type"),
                    "original_mapping_source": link.get("src"),
                    "original_exclusion_reason": link.get("review_exclusion_reason"),
                    "course_anchor_count": len(anchors),
                    "course_anchors": anchors[:12],
                    "source_review_flags": source_review[:12],
                    "decision": decision,
                    "decision_reason": reason,
                    "active_restoration": False,
                }
            )

    rows.sort(key=lambda row: (row["programme_key"], row["domain_id"]))
    counts = Counter(row["decision"] for row in rows)
    anchor_counts = Counter(row["course_anchor_count"] for row in rows)
    report = {
        "schema_version": 1,
        "status": "complete",
        "contract": "Quarantined links are not active guidance. Restoration requires source-backed CCMAS curriculum evidence.",
        "counts": {
            "quarantined_links": len(rows),
            "decisions": dict(counts),
            "course_anchor_counts": dict(anchor_counts),
            "source_files": len(set(row["ccmas_source_file"] for row in rows)),
        },
        "rows": rows,
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Programme-domain quarantined-link audit — 2026-08-19",
        "",
        "This is a row-by-row audit of every link retained under `unverified_links`. The original scorer ranking is not treated as curriculum proof.",
        "",
        f"- Quarantined links checked: **{len(rows)}**",
        f"- Restore candidates: **{counts.get('restore_candidate', 0)}**",
        f"- Retained in quarantine: **{counts.get('retain_quarantined', 0)}**",
        "",
        "## Decision rule",
        "",
        "A link can only be restored when at least two CCMAS courses contain source-backed anchors for the domain and the programme has no unresolved source blocker. A single generic phrase is retained for audit but is not promoted to active guidance.",
        "",
        "## Anchor counts",
        "",
    ]
    for count, total in sorted(anchor_counts.items()):
        lines.append(f"- `{count}` course anchor(s): **{total}**")
    lines += ["", "## Rows", ""]
    for row in rows:
        anchors = ", ".join(
            f"{item.get('code') or '—'} {item.get('title') or ''} [{', '.join(item.get('matched_anchors') or [])}]"
            for item in row["course_anchors"]
        ) or "none"
        lines.append(
            f"- `{row['programme_key']}` → `{row['domain_id']} {row['domain_name']}` — "
            f"`{row['decision']}`; anchors: {row['course_anchor_count']}; {row['decision_reason']}. "
            f"Evidence: {anchors}."
        )
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(report["counts"], indent=2))


if __name__ == "__main__":
    main()

