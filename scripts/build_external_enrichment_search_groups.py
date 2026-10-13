"""Build a deduplicated external-search manifest for contextual items.

The catalogue keeps context-specific item rows because ownership and student
exposure are context-specific. External discovery, however, can often be done
once for a repeated typed item identity. This read-only manifest groups those
identities for search while preserving every context that must receive the
evidence during the later review/merge step.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_QUEUE = ROOT / "data/career-mapping/_audit/external_enrichment_queue_2026-09-20.json"
DEFAULT_JSON = ROOT / "data/career-mapping/_audit/EXTERNAL_ENRICHMENT_SEARCH_GROUPS_2026-09-21.json"
DEFAULT_MD = ROOT / "data/career-mapping/_audit/EXTERNAL_ENRICHMENT_SEARCH_GROUPS_2026-09-21.md"


def _key(row: dict[str, Any]) -> tuple[str, str]:
    item_type = str(row.get("itemType") or "unknown").strip().casefold()
    keys = row.get("itemKeys") or []
    item_key = str(keys[0] if keys else row.get("name") or "").strip().casefold()
    return item_type, item_key


def build(queue_path: Path) -> dict[str, Any]:
    payload = json.loads(queue_path.read_text(encoding="utf-8"))
    groups: dict[tuple[str, str], dict[str, Any]] = {}
    status_counts = Counter()
    for row in payload.get("items") or []:
        if not isinstance(row, dict):
            continue
        key = _key(row)
        group = groups.setdefault(
            key,
            {
                "groupKey": f"{key[0]}|{key[1]}",
                "itemType": row.get("itemType"),
                "itemKey": (row.get("itemKeys") or [row.get("name")])[0],
                "nameVariants": set(),
                "contexts": set(),
                "sourceIds": set(),
                "rowCount": 0,
                "statusCounts": Counter(),
                "existingLinkStates": set(),
                "evidenceRecordCount": 0,
                "searchNow": False,
            },
        )
        group["rowCount"] += 1
        group["nameVariants"].add(str(row.get("name") or ""))
        group["statusCounts"][str(row.get("searchStatus") or "unlabelled")] += 1
        status_counts[str(row.get("searchStatus") or "unlabelled")] += 1
        group["existingLinkStates"].update(str(v) for v in row.get("existingLinkStates") or [])
        group["evidenceRecordCount"] += int(row.get("searchedRecordCount") or 0)
        group["searchNow"] = group["searchNow"] or row.get("searchStatus") == "pending_external_search"
        for context in row.get("contexts") or []:
            if isinstance(context, dict):
                group["contexts"].add(
                    f"{context.get('level') or ''}|{context.get('key') or ''}"
                )
        for source_id in row.get("sourceIds") or []:
            group["sourceIds"].add(str(source_id))

    serialized = []
    for key in sorted(groups):
        group = groups[key]
        serialized.append(
            {
                "groupKey": group["groupKey"],
                "itemType": group["itemType"],
                "itemKey": group["itemKey"],
                "nameVariants": sorted(v for v in group["nameVariants"] if v),
                "contexts": sorted(v for v in group["contexts"]),
                "sourceIds": sorted(group["sourceIds"]),
                "rowCount": group["rowCount"],
                "statusCounts": dict(sorted(group["statusCounts"].items())),
                "existingLinkStates": sorted(group["existingLinkStates"]),
                "evidenceRecordCount": group["evidenceRecordCount"],
                "searchNow": group["searchNow"],
            }
        )

    search_now = [row for row in serialized if row["searchNow"]]
    return {
        "schema": "2026-09-21.external-enrichment-search-groups.v1",
        "policy": "Search one authoritative item identity once, then attach evidence to every context-specific row only after context ownership and item-specific fit are reviewed.",
        "input": str(queue_path.relative_to(ROOT)).replace("\\", "/"),
        "scope": payload.get("scope", {}),
        "counts": {
            "queueItemIdentityRows": sum(row["rowCount"] for row in serialized),
            "deduplicatedItemGroups": len(serialized),
            "groupsSearchableNow": len(search_now),
            "queueIdentitiesSearchableNow": sum(row["rowCount"] for row in search_now),
            "statusCounts": dict(sorted(status_counts.items())),
        },
        "groups": serialized,
    }


def render_markdown(report: dict[str, Any]) -> str:
    counts = report["counts"]
    lines = [
        "# Deduplicated external-enrichment search groups — 2026-09-21",
        "",
        "This is a search-planning manifest only. It does not merge evidence or change student/admin data.",
        "",
        f"- Queue item-identity rows: **{counts['queueItemIdentityRows']}**",
        f"- Deduplicated typed item groups: **{counts['deduplicatedItemGroups']}**",
        f"- Groups with pending search work: **{counts['groupsSearchableNow']}**",
        f"- Queue identities represented by those groups: **{counts['queueIdentitiesSearchableNow']}**",
        "",
        "A group may contain multiple contexts. Evidence must still be reviewed against each context before it becomes a student-facing link.",
        "",
        "| Search status | Context rows |",
        "| --- | ---: |",
    ]
    for status, value in sorted(counts["statusCounts"].items()):
        lines.append(f"| `{status}` | {value} |")
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--queue", type=Path, default=DEFAULT_QUEUE)
    parser.add_argument("--json-output", type=Path, default=DEFAULT_JSON)
    parser.add_argument("--markdown-output", type=Path, default=DEFAULT_MD)
    args = parser.parse_args()
    report = build(args.queue)
    args.json_output.parent.mkdir(parents=True, exist_ok=True)
    args.json_output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    args.markdown_output.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps({"counts": report["counts"], "json": str(args.json_output), "markdown": str(args.markdown_output)}))


if __name__ == "__main__":
    main()
