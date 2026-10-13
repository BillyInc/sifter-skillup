"""Apply completed second-pass role-fit ledgers to exact canonical role keys.

This is deliberately separate from the first-pass reconciler because the
second-pass workers use different, more detailed ledger schemas.  It applies
only supported/conditional/direct decisions with task evidence and source
references.  It never adds raw-only roles, promotes ``still_unresolved`` or
``external-review`` records, or downgrades a stronger existing decision.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
LANE_A = AUDIT / "role_reconciliation_lanes_2026_10_07/D001_D056/d001_d056_role_reconciliation_second_pass.json"
LANE_C = AUDIT / "role_reconciliation_lanes_2026_10_07/D113_D168/D113_D168_second_pass_reconciliation.json"
STRUCTURE = ROOT / "domain_structure.json"
ROLE_FILES = (
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
)
REPORT = AUDIT / "ROLE_AGENT_SECOND_PASS_RECONCILIATION_2026_10_07.json"
REPORT_MD = AUDIT / "ROLE_AGENT_SECOND_PASS_RECONCILIATION_2026_10_07.md"
DATE = "2026-10-07"


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=True) + "\n", encoding="utf-8")


def rows(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [x for x in payload if isinstance(x, dict)]
    if isinstance(payload, dict):
        return [x for group in payload.values() if isinstance(group, list) for x in group if isinstance(x, dict)]
    return []


def role_key(domain_id: Any, role_name: Any) -> str:
    return f"{str(domain_id or '').upper()}|{str(role_name or '').strip().casefold()}"


def unique_refs(values: list[Any]) -> list[str]:
    result: list[str] = []
    for value in values:
        if isinstance(value, str) and value.strip():
            result.append(value.strip())
        elif isinstance(value, dict):
            url = value.get("url") or value.get("source_ref")
            if isinstance(url, str) and url.strip():
                result.append(url.strip())
    return list(dict.fromkeys(result))


def add_refs(old: Any, additions: list[str]) -> list[str]:
    old_values = old if isinstance(old, list) else []
    return unique_refs(old_values + additions)


def add_basis(old: Any, text: str) -> str:
    old_text = str(old or "").strip()
    text = str(text or "").strip()
    if not text or text in old_text:
        return old_text
    return f"{old_text} {text}".strip()


def rank(status: Any) -> int:
    return {"supported": 3, "conditional": 2, "review_required": 1, "": 0, "none": 0}.get(str(status or "").casefold(), 0)


def canonical_area_ids() -> dict[str, set[str]]:
    result: dict[str, set[str]] = {}
    for domain_id, domain in read(STRUCTURE).items():
        if isinstance(domain, dict):
            result[str(domain_id).upper()] = {
                str(area.get("area_id"))
                for area in domain.get("areas_of_specialization", [])
                if isinstance(area, dict) and area.get("area_id")
            }
    return result


def locations(containers: dict[Path, Any]) -> dict[str, list[tuple[Path, dict[str, Any]]]]:
    result: dict[str, list[tuple[Path, dict[str, Any]]]] = {}
    for path, payload in containers.items():
        for row in rows(payload):
            result.setdefault(role_key(row.get("domain_id"), row.get("role_name")), []).append((path, row))
    return result


def apply_parent(row: dict[str, Any], status: str, refs: list[str], rationale: str, lane: str, counts: Counter[str]) -> None:
    current = str(row.get("domain_fit_review_status") or "")
    if rank(status) < rank(current):
        counts[f"{lane}:parent_downgrade_preserved"] += 1
        return
    row["domain_fit_review_status"] = status
    row["domain_fit_review_basis"] = add_basis(row.get("domain_fit_review_basis"), f"Second-pass {lane} task/domain reconciliation 2026-10-07: {rationale}")
    row["domain_fit_review_source_refs"] = add_refs(row.get("domain_fit_review_source_refs"), refs)
    row["role_domain_lane_review_status"] = f"reviewed_{status}"
    row["role_domain_lane_review_date"] = DATE
    counts[f"{lane}:parent_{status}_applied"] += 1


def set_direct(row: dict[str, Any], pstatus: str, refs: list[str], rationale: str, lane: str, counts: Counter[str]) -> None:
    current = str(row.get("specialization_fit_review_status") or "")
    if rank(current) >= 2:
        counts[f"{lane}:direct_preserved_stronger_area"] += 1
        return
    row["specialization_fit_review_status"] = "not_applicable"
    row["specialization_fit_status"] = "direct_domain_role"
    row["specialization_fit_domain_gate"] = "parent_domain_fit_supported" if pstatus == "supported" else "parent_domain_fit_unresolved"
    row["specialization_fit_review_basis"] = add_basis(row.get("specialization_fit_review_basis"), f"Second-pass {lane} direct-route reconciliation 2026-10-07: {rationale}")
    row["specialization_fit_review_source_refs"] = add_refs(row.get("specialization_fit_review_source_refs"), refs)
    row["specialization_fit_review_date"] = DATE
    row["role_area_routes"] = []
    row["role_area_routes_updated"] = DATE
    counts[f"{lane}:direct_route_applied"] += 1


def set_area(row: dict[str, Any], area_id: str, status: str, pstatus: str, refs: list[str], rationale: str, lane: str, counts: Counter[str]) -> None:
    current = str(row.get("specialization_fit_review_status") or "")
    if rank(status) < rank(current):
        counts[f"{lane}:area_downgrade_preserved"] += 1
        return
    fit = "supported" if status == "supported" and pstatus == "supported" else "conditional"
    row["specialization_fit_review_status"] = fit
    row["specialization_fit_status"] = fit
    row["specialization_fit_area_key"] = area_id
    row["specialization_fit_domain_gate"] = "parent_domain_fit_supported" if pstatus == "supported" else "parent_domain_fit_unresolved"
    row["specialization_fit_review_basis"] = add_basis(row.get("specialization_fit_review_basis"), f"Second-pass {lane} task/area-boundary reconciliation 2026-10-07: {rationale}")
    row["specialization_fit_review_source_refs"] = add_refs(row.get("specialization_fit_review_source_refs"), refs)
    row["specialization_fit_review_date"] = DATE
    route = {"area_id": area_id, "status": fit, "route_type": "primary", "evidence": {"basis": rationale, "source_refs": refs}}
    if fit == "conditional":
        route["qualification"] = rationale
    row["role_area_routes"] = [route]
    row["role_area_routes_updated"] = DATE
    counts[f"{lane}:area_{fit}_applied"] += 1


def refs_a(rec: dict[str, Any]) -> list[str]:
    values = list(rec.get("source_refs") or [])
    for item in rec.get("area_source_references") or []:
        if isinstance(item, dict):
            values.append(item.get("url"))
    return unique_refs(values)


def refs_c(rec: dict[str, Any]) -> list[str]:
    return unique_refs([item.get("url") for item in (rec.get("sources") or []) if isinstance(item, dict)])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    area_ids = canonical_area_ids()
    containers = {path: read(path) for path in ROLE_FILES}
    locs = locations(containers)
    counts: Counter[str] = Counter()
    decisions: list[dict[str, Any]] = []

    lane_a = read(LANE_A)
    for rec in lane_a.get("residual_decisions", []):
        raw_key = str(rec.get("role_key") or "")
        did, _, title = raw_key.partition("|")
        matches = locs.get(role_key(did, title), [])
        counts["D001_D056:decision_records"] += 1
        if not matches:
            counts["D001_D056:not_in_canonical"] += 1
            continue
        pstatus = str(rec.get("parent_domain_disposition") or "").replace("external-review", "external_review")
        disposition = str(rec.get("disposition") or "").replace("external-review", "external_review")
        evidence = refs_a(rec)
        rationale = str(rec.get("remit") or rec.get("prior_semantic_basis") or rec.get("rationale") or "").strip()
        area_id = rec.get("area_candidate_id")
        if area_id and str(area_id) not in area_ids.get(str(did).upper(), set()):
            counts["D001_D056:invalid_area_key"] += 1
            area_id = None
        for path, row in matches:
            if row.get("student_path_status") == "excluded":
                counts["D001_D056:excluded_preserved"] += 1
                continue
            if args.apply and pstatus in {"supported", "conditional"} and evidence:
                apply_parent(row, pstatus, evidence, rationale, "D001_D056", counts)
            if not args.apply and pstatus in {"supported", "conditional"} and evidence:
                counts[f"D001_D056:parent_{pstatus}_ready"] += 1
            if disposition == "direct-domain-role":
                if args.apply and pstatus in {"supported", "conditional"} and evidence:
                    set_direct(row, pstatus, evidence, rationale, "D001_D056", counts)
                continue
            if disposition in {"supported", "conditional"} and area_id and pstatus in {"supported", "conditional"} and evidence:
                if args.apply:
                    set_area(row, str(area_id), disposition, pstatus, evidence, rationale, "D001_D056", counts)
                else:
                    counts[f"D001_D056:area_{disposition}_ready"] += 1
            else:
                counts[f"D001_D056:area_{disposition or 'unresolved'}_residual"] += 1
            decisions.append({"lane": "D001_D056", "role_key": raw_key, "disposition": disposition, "parent": pstatus, "area": area_id})

    lane_c = read(LANE_C)
    for rec in lane_c.get("records", []):
        raw_key = str(rec.get("exact_role_key") or "")
        did, _, title = raw_key.partition("|")
        matches = locs.get(role_key(did, title), [])
        counts["D113_D168:decision_records"] += 1
        if not matches:
            counts["D113_D168:not_in_canonical"] += 1
            continue
        classification = str(rec.get("classification") or "still_unresolved").replace("external-review", "external_review")
        pstatus = str((rec.get("negative_checks") or {}).get("parent_route_status") or "")
        area_id = rec.get("selected_area_key")
        evidence = refs_c(rec)
        rationale = str(rec.get("rationale") or "").strip()
        if area_id and str(area_id) not in area_ids.get(str(did).upper(), set()):
            counts["D113_D168:invalid_area_key"] += 1
            area_id = None
        for path, row in matches:
            if row.get("student_path_status") == "excluded":
                counts["D113_D168:excluded_preserved"] += 1
                continue
            if args.apply and pstatus in {"supported", "conditional"} and evidence:
                apply_parent(row, pstatus, evidence, rationale, "D113_D168", counts)
            if classification == "direct_domain_role" and pstatus in {"supported", "conditional"} and evidence:
                if args.apply:
                    set_direct(row, pstatus, evidence, rationale, "D113_D168", counts)
                else:
                    counts["D113_D168:direct_route_ready"] += 1
            elif classification in {"supported", "conditional"} and area_id and pstatus in {"supported", "conditional"} and evidence:
                if args.apply:
                    set_area(row, str(area_id), classification, pstatus, evidence, rationale, "D113_D168", counts)
                else:
                    counts[f"D113_D168:area_{classification}_ready"] += 1
            else:
                counts[f"D113_D168:area_{classification}_residual"] += 1
            decisions.append({"lane": "D113_D168", "role_key": raw_key, "classification": classification, "parent": pstatus, "area": area_id})

    if args.apply:
        for path, payload in containers.items():
            write(path, payload)
    result = {
        "schema_version": "2026-10-07.role-agent-second-pass-reconciliation.v1",
        "mode": "APPLIED" if args.apply else "DRY_RUN",
        "policy": "Exact canonical keys only; task evidence, domain/area boundaries, source provenance and negative checks required; stronger decisions are never downgraded.",
        "counts": dict(counts),
        "decisions": decisions,
        "remaining_work": {
            "D057_D112_second_pass_pending": not (AUDIT / "role_reconciliation_lanes_2026_10_07/D057_D112/d057_d112_role_reconciliation_second_pass.json").exists(),
            "external_review_not_promoted": True,
            "still_unresolved_not_promoted": True,
            "raw_only_not_added": True,
        },
    }
    write(REPORT, result)
    REPORT_MD.write_text("\n".join(["# Role second-pass reconciliation — 2026-10-07", "", f"Mode: **{result['mode']}**", "", "Only exact canonical keys with explicit task/boundary evidence were considered. External-review, still-unresolved and raw-only records remain residuals.", "", "## Counts", "", *[f"- `{k}`: **{v}**" for k, v in sorted(counts.items())]]) + "\n", encoding="utf-8")
    print(json.dumps(dict(counts), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
