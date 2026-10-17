"""Flag D078 student explanation copy for human review; never edits/approves data.

The checks are deliberately conservative: blank required narrative and clearly
short single-sentence copy are review flags, not proof that prose is wrong.
Meaning, scope, source fidelity, route relevance, and usefulness require human
reading. Run from the repository root:

    python data/career-mapping/_audit/audit_d078_student_explanation_copy_2026_10_17.py
    python data/career-mapping/_audit/audit_d078_student_explanation_copy_2026_10_17.py --json-out C:/tmp/d078-copy-review.json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend import d078_guided_content as content  # noqa: E402


NARRATIVE_FIELDS = (
    "plainMeaning",
    "programmeContext",
    "domainContext",
    "areaContext",
    "roleContext",
    "contextualUse",
    "expectedOutput",
    "requirementReason",
)
LIMIT_FIELDS = ("evidenceLimitations", "prerequisites", "complements", "validAlternatives")
INTERNAL_LANGUAGE = re.compile(
    r"\b(?:review.only|student.display.approved|approval.status|"
    r"role.task.relationship.verified|task.family|usecasekey|placement ledger|"
    r"domain learning option|shared foundation candidate|area.specific enrichment|"
    r"candidate only|priority is a candidate)\b",
    re.IGNORECASE,
)
SENTENCE_END = re.compile(r"[.!?](?:[\"')\]]*)\s+(?=[A-Z0-9“‘\"'])")


def text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (list, tuple)):
        return " ".join(text(part) for part in value if part is not None).strip()
    if isinstance(value, dict):
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def sentence_count(value: str) -> int:
    value = value.strip()
    if not value:
        return 0
    return 1 + len(SENTENCE_END.findall(value))


def identify(item: dict[str, Any], scope: str) -> str:
    return " / ".join(
        part for part in (
            scope,
            text(item.get("contextKey")) or text(item.get("contextLevel")),
            text(item.get("name")),
        ) if part
    )


def excerpt(value: Any, limit: int = 220) -> str:
    rendered = text(value)
    return rendered if len(rendered) <= limit else rendered[: limit - 1].rstrip() + "…"


def neighboring_copy(item: dict[str, Any]) -> dict[str, str]:
    fields = (
        "plainMeaning", "programmeContext", "domainContext", "areaContext",
        "roleContext", "contextualUse", "expectedOutput", "requirementReason",
    )
    return {field: excerpt(item.get(field), 300) for field in fields if text(item.get(field))}


def add_item_findings(scope: str, item: dict[str, Any], findings: list[dict[str, str]]) -> None:
    item_id = identify(item, scope)
    for field in NARRATIVE_FIELDS:
        value = text(item.get(field))
        # Context fields that are structurally inapplicable are not flagged.
        if not value:
            if field in {"plainMeaning", "contextualUse"}:
                findings.append({"scope": scope, "item": item_id, "field": field, "flag": "missing", "excerpt": "", "neighboring_copy": neighboring_copy(item)})
            continue
        if INTERNAL_LANGUAGE.search(value):
            findings.append({"scope": scope, "item": item_id, "field": field, "flag": "possible_internal_wording", "excerpt": excerpt(value), "neighboring_copy": neighboring_copy(item)})
        if (
            field in {"plainMeaning", "contextualUse", "programmeContext", "domainContext", "areaContext", "roleContext", "requirementReason"}
            and sentence_count(value) < 2
            and len(value.split()) < 14
        ):
            findings.append({"scope": scope, "item": item_id, "field": field, "flag": "short_copy_human_review", "excerpt": excerpt(value), "neighboring_copy": neighboring_copy(item)})
    for field in LIMIT_FIELDS:
        values = item.get(field) or []
        if not isinstance(values, (list, tuple)):
            values = [values]
        for value in values:
            phrase = text(value)
            if phrase and INTERNAL_LANGUAGE.search(phrase):
                findings.append({"scope": scope, "item": item_id, "field": field, "flag": "possible_internal_wording", "excerpt": excerpt(phrase)})


def build_audit() -> dict[str, Any]:
    master = content._read(content.MASTER_PATH)
    payload = content.d078_guided_content()
    roles = content._d078_role_items_by_owner()
    findings: list[dict[str, str]] = []
    counts: Counter[str] = Counter()

    themes = content.d078_sociology_programme_themes()
    counts["programme_themes"] = len(themes)
    for theme in themes:
        title = text(theme.get("title")) or text(theme.get("themeKey"))
        summary = text(theme.get("summary"))
        narration = text(theme.get("narration"))
        combined = " ".join(value for value in (summary, narration) if value)
        if not summary or not narration:
            findings.append({"scope": "programme_theme", "item": title, "field": "summary+narration", "flag": "missing", "excerpt": excerpt(combined)})
        elif sentence_count(combined) < 2 and len(combined.split()) < 14:
            findings.append({"scope": "programme_theme", "item": title, "field": "summary+narration", "flag": "short_copy_human_review", "excerpt": excerpt(combined)})
        for course in theme.get("courseAnchors", []):
            if not text(course.get("courseSummary")):
                findings.append({"scope": "programme_course", "item": f"{title} / {course.get('courseCode', '')} {course.get('courseTitle', '')}".strip(), "field": "courseSummary", "flag": "missing", "excerpt": ""})
            if not text(course.get("sourceLocator")):
                findings.append({"scope": "programme_course", "item": f"{title} / {course.get('courseCode', '')} {course.get('courseTitle', '')}".strip(), "field": "sourceLocator", "flag": "missing", "excerpt": ""})

    domain_by_key = {item.get("itemKey"): item for item in payload["domainItems"]}
    area_by_key: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for area_id, items in payload["areaItems"].items():
        for item in items:
            area_by_key[area_id].append(item)
    for item in payload["domainItems"]:
        counts["domain_items"] += 1
        add_item_findings("domain", item, findings)
    for area_id, items in area_by_key.items():
        for item in items:
            counts["area_items"] += 1
            add_item_findings(f"area:{area_id}", item, findings)
    for role_id, items in roles.items():
        for item in items:
            counts["role_items"] += 1
            add_item_findings(f"role:{role_id}", item, findings)

    buckets: dict[str, Counter[str]] = defaultdict(Counter)
    unique_flagged: dict[str, set[str]] = defaultdict(set)
    for finding in findings:
        scope = finding["scope"].split(":", 1)[0]
        buckets[scope][finding["flag"]] += 1
        unique_flagged[finding["flag"]].add(finding["item"])

    return {
        "audit": "D078 student explanation copy; heuristic flags are not approval decisions",
        "source_master": str(content.MASTER_PATH.relative_to(ROOT)),
        "visible_payload_counts": dict(counts),
        "master_theme_count": len(master.get("programme_themes", [])),
        "role_owner_count": len(roles),
        "flags_by_scope": {scope: dict(counter) for scope, counter in buckets.items()},
        "unique_items_by_flag": {flag: len(items) for flag, items in unique_flagged.items()},
        "finding_count": len(findings),
        "findings": findings,
        "human_review_required": True,
        "auto_approval": False,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json-out", type=Path, help="Optional report path; source and product data are never edited.")
    args = parser.parse_args()
    result = build_audit()
    print(json.dumps({key: value for key, value in result.items() if key != "findings"}, indent=2, ensure_ascii=False))
    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"Detailed findings: {args.json_out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
