#!/usr/bin/env python3
"""Normalize only uniquely resolved JAMB domain course-title anchors.

The operation changes evidence-anchor spelling only. It does not add/remove a
domain link or change its match type. By default this prints a dry-run; pass
--apply to write jamb_domain_map.json and an append-only before/after ledger.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
DOMAIN_MAP_PATH = ROOT / "jamb_domain_map.json"
SCOPES_PATH = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
CLASSIFICATION_PATH = AUDIT / f"downstream_unselected_course_held_mappings_audit_{date.today().isoformat()}_001.json"
OUT_PATH = AUDIT / f"jamb_domain_anchor_normalization_{date.today().isoformat()}.json"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def proposals(domain_map: dict[str, Any], report: dict[str, Any], scopes: dict[str, Any]) -> tuple[list[dict[str, Any]], Counter[str]]:
    repairs: list[dict[str, Any]] = []
    counts: Counter[str] = Counter()
    for case in report.get("unselected_domain_link_cases", []):
        if case.get("disposition") != "deterministic_anchor_normalization_candidate":
            continue
        jamb_name = case.get("jamb_name")
        old_titles = case.get("stored_anchor_titles") or []
        anchor_results = case.get("anchor_results") or []
        if not old_titles or len(old_titles) != len(anchor_results):
            counts["held_missing_or_misaligned_anchor_payload"] += 1
            continue
        if any(len(item.get("selected_matches") or []) != 1 for item in anchor_results):
            counts["held_non_unique_selected_title_match"] += 1
            continue
        new_titles = [item["selected_matches"][0]["title"] for item in anchor_results]
        if len(set(title.casefold() for title in new_titles)) != len(new_titles):
            counts["held_duplicate_replacement_titles"] += 1
            continue
        selected_titles = {
            str(course.get("title") or "")
            for course in scopes.get(jamb_name, {}).get("selected_courses", [])
            if course.get("title")
        }
        if any(title not in selected_titles for title in new_titles):
            counts["held_replacement_not_in_selected_scope"] += 1
            continue
        links = [
            link for link in domain_map.get(jamb_name, {}).get("links", [])
            if link.get("domain_id") == case.get("domain_id")
            and link.get("scope_course_titles") == old_titles
        ]
        if len(links) != 1:
            counts["held_domain_link_not_unique"] += 1
            continue
        if old_titles == new_titles:
            counts["already_normalized"] += 1
            continue
        repairs.append({
            "jamb_name": jamb_name,
            "domain_id": case.get("domain_id"),
            "old_scope_course_titles": old_titles,
            "new_scope_course_titles": new_titles,
            "anchor_classifications": [item.get("classification") for item in anchor_results],
            "link_reference": links[0],
        })
        counts["safe_exact_anchor_normalization"] += 1
    return repairs, counts


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write the uniquely resolved anchor-only changes")
    args = parser.parse_args()

    domain_map = load(DOMAIN_MAP_PATH)
    report = load(CLASSIFICATION_PATH)
    scope_rows = load(SCOPES_PATH).get("rows", [])
    scopes = {row["jamb_name"]: row for row in scope_rows}
    repairs, counts = proposals(domain_map, report, scopes)
    for repair in repairs:
        repair.pop("link_reference")

    before_hash = digest(DOMAIN_MAP_PATH)
    result = {
        "schema": "2026-10-02.jamb-domain-anchor-normalization.v1",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "applied": bool(args.apply),
        "counts": dict(sorted(counts.items())),
        "repair_count": len(repairs),
        "repairs": repairs,
        "inputs": {
            "domain_map_sha256_before": before_hash,
            "classification_report": str(CLASSIFICATION_PATH.relative_to(ROOT.parent.parent)),
            "scope_sha256": digest(SCOPES_PATH),
        },
        "guardrail": "Only exact one-to-one selected-course title normalizations are applied; domain IDs, match types, and links are unchanged.",
    }

    if args.apply and repairs:
        # Re-open and verify the hash immediately before writing, preventing a
        # stale audit proposal from overwriting intervening user edits.
        if digest(DOMAIN_MAP_PATH) != before_hash:
            raise SystemExit("jamb_domain_map.json changed during this run; refusing to overwrite it")
        for repair in repairs:
            links = [
                link for link in domain_map[repair["jamb_name"]]["links"]
                if link.get("domain_id") == repair["domain_id"]
                and link.get("scope_course_titles") == repair["old_scope_course_titles"]
            ]
            if len(links) != 1:
                raise SystemExit(f"link preimage changed for {repair['jamb_name']} {repair['domain_id']}")
            links[0]["scope_course_titles"] = repair["new_scope_course_titles"]
        DOMAIN_MAP_PATH.write_text(json.dumps(domain_map, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        result["inputs"]["domain_map_sha256_after"] = digest(DOMAIN_MAP_PATH)
    OUT_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(OUT_PATH), "applied": args.apply, "repair_count": len(repairs), "counts": result["counts"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
