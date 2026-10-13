"""Merge the three final D078 enrichment overlays without promoting them.

The lane artifacts deliberately use different record schemas. This merger keeps
each original record intact inside a lane envelope and adds only deterministic
coverage metadata. It is a review artifact, not a canonical ledger, API seed,
role-fit decision, or student-approval step.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
LANE_PATHS = {
    "001-072": ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/qa-001-072/repaired-package/d078_role_item_final_repair_overlay_001-072_2026-10-09.json",
    "073-144": ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/qa-073-144/D078_ROLE_ITEM_QA_REPAIRED_073-144_2026_10_09.json",
    "145-215": ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/qa-145-215/D078_ROLE_ITEM_QA_REPAIRED_FINAL_145-215_2026_10_09.json",
}
ARENDT_BASE_PATH = ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/qa-001-072/repaired-package/d078_role_item_repaired_qa_package_001-072_2026-10-09.json"
ARENDT_LEARNING_PATH = ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/qa-001-072/repaired-package/d078_role_item_learning_correction_overlay_001-072_2026-10-09.json"
OUT_JSON = ROOT / "data/career-mapping/_audit/d078_final_enrichment_lane_merge_2026_10_09.json"
OUT_MD = ROOT / "docs/manual-review/D078_FINAL_ENRICHMENT_LANE_MERGE_2026_10_09.md"


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def normalized_scope(record: dict[str, Any]) -> str:
    """Normalize lane-specific exclusion labels without changing the record."""
    raw_scope = str(record.get("scope", "")).strip().lower()
    role_text = " ".join(
        str(record.get(key, ""))
        for key in ("role", "role_name", "label", "title")
    ).strip().lower()
    if "excluded" in raw_scope:
        return "excluded_philosopher" if "philosoph" in raw_scope or "philosoph" in role_text else "excluded"
    if record.get("d078_scope", True) is False:
        return "excluded"
    if "philosopher" in role_text and record.get("student_display_approved") is False:
        return "excluded_philosopher"
    return "in_scope_d078"


def philosopher_occurrences(payload: dict[str, Any], entries: list[dict[str, Any]]) -> int:
    scope = payload.get("scope")
    if isinstance(scope, dict):
        for key in ("philosopher_excluded_occurrences", "excluded_philosopher_occurrences"):
            value = scope.get(key)
            if isinstance(value, int):
                return value
    return sum(entry["scope"] == "excluded_philosopher" for entry in entries)


def arendt_final_payload(overlay: dict[str, Any]) -> dict[str, Any]:
    """Apply Arendt's saved repair overlays to the saved base package."""
    base = load(ARENDT_BASE_PATH)
    learning = load(ARENDT_LEARNING_PATH)
    overlay_by_key = {row["pair_key"]: row for row in overlay.get("records", [])}
    learning_by_key = {row["pair_key"]: row for row in learning.get("records", [])}
    merged_records: list[dict[str, Any]] = []
    for base_record in base.get("records", []):
        pair_key = base_record.get("pair_key")
        repair = overlay_by_key.get(pair_key)
        correction = learning_by_key.get(pair_key)
        if repair is None or correction is None:
            raise ValueError(f"001-072: missing repair overlay for {pair_key!r}")
        row = dict(base_record)
        row["final_repair_overlay"] = repair
        row["learning_correction_overlay"] = correction
        row["final_learning"] = correction.get("final_learning")
        row["source_locator_recheck"] = correction.get("source_locator_recheck")
        row["resolved_exact_identity"] = repair.get("exact_identity")
        row["resolved_task_use_disposition"] = repair.get("task_use_disposition")
        row["resolved_context_disposition"] = repair.get("context_disposition")
        row["resolved_exhaustive_search_disposition"] = repair.get("exhaustive_search_disposition")
        merged_records.append(row)
    result = dict(overlay)
    result["records"] = merged_records
    result["merged_from"] = {
        "base_package": str(ARENDT_BASE_PATH.relative_to(ROOT)),
        "final_repair_overlay": str(LANE_PATHS["001-072"].relative_to(ROOT)),
        "learning_correction_overlay": str(ARENDT_LEARNING_PATH.relative_to(ROOT)),
    }
    result["summary"] = dict(overlay.get("summary") or {})
    result["summary"]["merged_base_records"] = len(merged_records)
    result["summary"]["final_learning_access_residuals"] = sum(
        row.get("final_learning", {}).get("access_status")
        not in {"verified_reachable_current_200", "verified_reachable_replacement_200", "verified_reachable_202"}
        for row in merged_records
    )
    return result


def normalize_records(lane: str, payload: dict[str, Any]) -> list[dict[str, Any]]:
    records = payload.get("records") or []
    result: list[dict[str, Any]] = []
    for position, record in enumerate(records, start=1):
        row = dict(record)
        queue_index = row.get("queue_index", row.get("index"))
        if queue_index is None and lane == "001-072":
            queue_index = position
        if queue_index is None:
            raise ValueError(f"{lane}: record {position} has no queue index")
        result.append(
            {
                "lane": lane,
                "queue_index": int(queue_index),
                "scope": normalized_scope(row),
                "record": row,
            }
        )
    return result


def exclusion_stubs(lane: str, payload: dict[str, Any]) -> list[dict[str, Any]]:
    stubs: list[dict[str, Any]] = []
    for item in payload.get("exclusions") or []:
        index = item.get("index")
        if index is None:
            continue
        stubs.append(
            {
                "lane": lane,
                "queue_index": int(index),
                "scope": "excluded_philosopher",
                "record": {
                    "index": int(index),
                    "pair_key": item.get("pair_key"),
                    "label": item.get("label"),
                    "student_display_approved": False,
                    "disposition": item.get("disposition"),
                },
            }
        )
    return stubs


def main() -> None:
    payloads = {lane: load(path) for lane, path in LANE_PATHS.items()}
    payloads["001-072"] = arendt_final_payload(payloads["001-072"])
    entries: list[dict[str, Any]] = []
    lane_summaries: dict[str, dict[str, Any]] = {}

    for lane, payload in payloads.items():
        lane_entries = normalize_records(lane, payload)
        exclusions = exclusion_stubs(lane, payload)
        if lane == "145-215":
            lane_entries.extend(exclusions)
        expected_first, expected_last = {
            "001-072": (1, 72),
            "073-144": (73, 144),
            "145-215": (145, 215),
        }[lane]
        lane_indices = sorted(entry["queue_index"] for entry in lane_entries)
        expected_indices = list(range(expected_first, expected_last + 1))
        if lane_indices != expected_indices:
            raise ValueError(f"{lane}: coverage mismatch {lane_indices[:3]}...{lane_indices[-3:]}")
        entries.extend(lane_entries)
        in_scope = sum(entry["scope"] not in {"excluded", "excluded_philosopher"} for entry in lane_entries)
        lane_summaries[lane] = {
            "source": str(LANE_PATHS[lane].relative_to(ROOT)),
            "record_entries": len(lane_entries),
            "in_scope_record_entries": in_scope,
            "excluded_philosopher_record_entries": len(lane_entries) - in_scope,
            "philosopher_excluded_occurrences": philosopher_occurrences(payload, lane_entries),
            "coverage": f"{expected_first}-{expected_last}",
            "source_lane_unchanged": payload.get("source_lane_modified", False) is False,
            "canonical_api_sql_rolefit_unchanged": payload.get("common_ledger_builder_canonical_api_sql_rolefit_modified", False) is False,
        }

    entries.sort(key=lambda entry: entry["queue_index"])
    indices = [entry["queue_index"] for entry in entries]
    if indices != list(range(1, 216)):
        raise ValueError("merged coverage is not exactly 001-215")
    if len({entry["queue_index"] for entry in entries}) != 215:
        raise ValueError("duplicate queue indices in merged artifact")

    out = {
        "schema_version": "2026-10-09.d078.final-enrichment-lane-merge.v1",
        "status": "noncanonical_review_only",
        "purpose": "Reconciled envelope for three repaired D078 enrichment lanes; no student approval or role-fit adjudication.",
        "access_date": "2026-10-09",
        "coverage": {
            "lane_count": 3,
            "assigned_range": "001-215",
            "record_entries": len(entries),
            "in_scope_record_entries": sum(entry["scope"] not in {"excluded", "excluded_philosopher"} for entry in entries),
            "excluded_philosopher_record_entries": sum(entry["scope"] == "excluded_philosopher" for entry in entries),
            "philosopher_excluded_occurrences": sum(
                summary["philosopher_excluded_occurrences"]
                for summary in lane_summaries.values()
            ),
            "indices_contiguous": indices == list(range(1, 216)),
            "duplicate_indices": 215 - len(set(indices)),
        },
        "lane_summaries": lane_summaries,
        "promotion_assertions": {
            "student_display_approved": False,
            "canonical_promotion": False,
            "role_fit_adjudication": False,
            "subject_matcher_changed": False,
            "api_or_sql_changed": False,
        },
        "residual_policy": "Keep exact identity/version, direct task ownership, checkpoint fit, Nigerian applicability and student approval unresolved/hidden unless independently evidenced; do not call a residual unsupported without its exhaustive-search disposition.",
        "records": entries,
    }
    OUT_JSON.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    md = [
        "# D078 final enrichment lane merge — 2026-10-09",
        "",
        "Status: noncanonical review-only merge. No student approval, role-fit adjudication, API change, SQL change or subject-matcher change was made.",
        "",
        "## Coverage",
        "",
        f"- Three repaired lane artifacts merged into one envelope: **{len(entries)} record entries**, contiguous **001–215**, with **{out['coverage']['excluded_philosopher_record_entries']}** excluded philosopher record entries representing **{out['coverage']['philosopher_excluded_occurrences']}** excluded occurrences, and **{out['coverage']['in_scope_record_entries']}** remaining in-scope record entries.",
        "- Each lane retains its original record schema and provenance inside `record`; this merge adds only lane/index/scope metadata.",
        "- Mill's corrected final artifact was required to contain the complete 145–215 coverage; the invariant now passes.",
        "",
        "## Lane sources",
        "",
    ]
    for lane, summary in lane_summaries.items():
        md.append(f"- `{lane}`: {summary['record_entries']} entries ({summary['in_scope_record_entries']} in scope, {summary['excluded_philosopher_record_entries']} excluded record entries, {summary['philosopher_excluded_occurrences']} excluded occurrences), source `{summary['source']}`.")
    md.extend([
        "",
        "## Safety boundary",
        "",
        "The merged envelope is an evidence handoff, not a route decision. Items remain hidden until the programme/domain/area/role checkpoint, direct task evidence, source roles, Nigerian scope and learning-link requirements are independently satisfied. The subject-matcher workstream remains separate.",
        "",
        f"Machine-readable artifact: `{OUT_JSON.relative_to(ROOT).as_posix()}`",
    ])
    OUT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "coverage": out["coverage"]}, indent=2))


if __name__ == "__main__":
    main()
