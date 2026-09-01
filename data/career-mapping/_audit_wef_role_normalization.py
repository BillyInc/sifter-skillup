"""Normalize WEF 2025 role labels against the current canonical role layer.

This is an audit/annotation step. It preserves WEF wording and does not add,
delete, or reassign roles. A WEF label is linked automatically only when its
normalized title or alias resolves to one canonical role key. Broad source
categories and ambiguous matches remain explicit review records.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


HERE = Path(__file__).resolve().parent
WEF_PATH = HERE / "taxonomies" / "wef_2025_roles.json"
BASE_PATH = HERE / "role_library_v3_cleaned.json"
EMERGING_PATH = HERE / "emerging_role_overlays.json"
THIN_PATH = HERE / "thin_domain_role_overlays.json"
OUT_JSON = HERE / "_audit" / "wef_role_normalization_2026-09-01.json"
OUT_MD = HERE / "_audit" / "WEF_ROLE_NORMALIZATION_2026-09-01.md"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def clean(value) -> str:
    if value is None:
        return ""
    return str(value).strip()


def normalized(value) -> str:
    text = re.sub(r"[^a-z0-9]+", " ", clean(value).casefold()).strip()
    tokens = []
    for token in text.split():
        if token == "devops":
            token = "devops"
        elif token.endswith("ies") and len(token) > 4:
            token = token[:-3] + "y"
        elif token.endswith("s") and not token.endswith("ss") and len(token) > 3:
            token = token[:-1]
        tokens.append(token)
    return " ".join(tokens)


def aliases(role: dict) -> list[str]:
    value = role.get("also_known_as")
    if isinstance(value, list):
        return [clean(item) for item in value if clean(item)]
    if isinstance(value, str):
        return [item.strip() for item in value.split("  ·  ") if item.strip()]
    return []


def role_key(role: dict) -> str:
    return f"{clean(role.get('domain_id'))}|{clean(role.get('role_name'))}"


def main() -> None:
    wef = load(WEF_PATH)
    roles = list(load(BASE_PATH))
    roles.extend(load(EMERGING_PATH).get("roles", []))
    roles.extend(load(THIN_PATH).get("roles", []))

    by_key: dict[str, dict] = {}
    title_index: dict[str, set[str]] = defaultdict(set)
    alias_index: dict[str, set[str]] = defaultdict(set)
    for role in roles:
        key = role_key(role)
        if key in by_key:
            continue
        by_key[key] = role
        title = normalized(role.get("role_name"))
        if title:
            title_index[title].add(key)
        for alias in aliases(role):
            value = normalized(alias)
            if value:
                alias_index[value].add(key)

    categories: dict[str, list[str]] = {
        name: values for name, values in wef.items() if isinstance(values, list)
    }
    labels = sorted({label for values in categories.values() for label in values})
    rows = []
    for label in labels:
        key = normalized(label)
        title_matches = sorted(title_index.get(key, set()))
        alias_matches = sorted(alias_index.get(key, set()) - set(title_matches))
        # A canonical role title is stronger than an alias. This prevents a
        # generic alias in another domain from displacing an exact current
        # title such as "DevOps Engineers" or "Security Management
        # Specialists".
        if title_matches:
            matches = title_matches
        else:
            matches = alias_matches
        if len(matches) == 1:
            status = "unique_canonical_match"
            method = "normalized_title" if title_matches else "normalized_alias"
            note = "WEF wording is retained as a source signal; no canonical role text is overwritten."
            disposition = "attached_to_unique_canonical_role"
        elif len(matches) > 1:
            status = "ambiguous_canonical_match"
            method = "normalized_title_or_alias"
            note = "More than one domain owns this normalized label; no target is selected automatically."
            disposition = "retained_as_ambiguous_wef_signal_no_role_assignment"
        else:
            status = "review_required_unmatched_or_aggregate"
            method = "none"
            note = "The WEF label is broad, differently named, or absent from the current role layer; it is not an automatic new role."
            disposition = "retained_as_unmatched_wef_signal_no_role_creation"
        rows.append({
            "wef_label": label,
            "normalization_key": key,
            "wef_categories": sorted(name for name, values in categories.items() if label in values),
            "match_status": status,
            "match_method": method,
            "canonical_role_keys": matches,
            "canonical_role_names": [clean(by_key[item].get("role_name")) for item in matches],
            "canonical_domains": sorted({clean(by_key[item].get("domain_id")) for item in matches}),
            "disposition": disposition,
            "note": note,
        })

    counts = defaultdict(int)
    for row in rows:
        counts[row["match_status"]] += 1
    output = {
        "schema_version": "2026-09-01.wef-role-normalization.v1",
        "purpose": "Normalize WEF 2025 labels to current role keys without changing the canonical taxonomy.",
        "source": {
            "name": "World Economic Forum Future of Jobs 2025",
            "url": "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
            "repository_input": str(WEF_PATH.relative_to(HERE.parent)).replace("\\", "/"),
            "repository_input_sha256": sha256(WEF_PATH),
            "limitation": "WEF is a global employer-survey trend signal, not a complete occupation dictionary or Nigerian demand source.",
        },
        "matching_rules": [
            "Preserve the original WEF label and category.",
            "Normalize case, punctuation, simple plural endings, and DevOps spelling only for matching.",
            "Accept a normalized title or alias only when it resolves to exactly one current role key.",
            "Keep ambiguous and aggregate labels in review; never create a role or subgroup from WEF wording alone.",
        ],
        "current_role_input_counts": {
            "deduplicated_role_keys": len(by_key),
            "base_role_rows": len(load(BASE_PATH)),
            "emerging_overlay_rows": len(load(EMERGING_PATH).get("roles", [])),
            "thin_overlay_rows": len(load(THIN_PATH).get("roles", [])),
        },
        "summary": {
            "distinct_wef_labels": len(rows),
            "category_count": len(categories),
            "status_counts": dict(sorted(counts.items())),
            "disposition_counts": dict(Counter(row["disposition"] for row in rows)),
        },
        "labels": rows,
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# WEF role normalization — 2026-09-01",
        "",
        "This audit preserves every WEF 2025 label and links it to the current role layer only when the normalized title or alias resolves uniquely. It does not modify the role taxonomy or seed.",
        "",
        f"- Distinct WEF labels: **{len(rows)}**.",
        f"- Current deduplicated role keys inspected: **{len(by_key)}**.",
    ]
    for status, count in sorted(counts.items()):
        lines.append(f"- `{status}`: **{count}**.")
    lines.extend([
        "",
        "## Interpretation",
        "",
        "A unique match can attach a WEF growth, decline, absolute-change, or emerging-technology signal to the existing role. Ambiguous and unmatched labels are dispositioned as WEF source signals only; they are retained for transparency but do not invent a role, subgroup, Nigerian demand claim, or programme mapping.",
        "",
        "The complete label-by-label result is in `wef_role_normalization_2026-09-01.json`.",
        "",
        "## Reproducibility",
        "",
        "```text",
        "python data/career-mapping/_audit_wef_role_normalization.py",
        "```",
    ])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(output["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
