"""Locally reconcile and apply source-backed role-fit proposals for D001-D168.

Reads the three completed, disjoint role-reconciliation agent ledgers and
applies only exact-key decisions for existing, non-excluded canonical role
routes. Parent and area decisions must be explicit supported/conditional
findings with task evidence and source references. Raw-only role candidates,
external-review rows, and excluded student paths remain in the residual ledger
for separate reconciliation; no role is added from title or taxonomy membership.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
LANES = (
    ("D001_D056", AUDIT / "role_reconciliation_lanes_2026_10_07/D001_D056/d001_d056_role_reconciliation_proposals.json", "role_records"),
    ("D057_D112", AUDIT / "role_reconciliation_lanes_2026_10_07/D057_D112/D057_D112_role_reconciliation_proposals_2026_10_07.json", "records"),
    ("D113_D168", AUDIT / "role_reconciliation_lanes_2026_10_07/D113_D168/D113_D168_role_reconciliation.json", "role_decisions"),
)
ROLE_FILES = (
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
)
STRUCTURE = ROOT / "domain_structure.json"
REPORT = AUDIT / "ROLE_AGENT_PROPOSAL_RECONCILIATION_2026_10_07.json"
REPORT_MD = AUDIT / "ROLE_AGENT_PROPOSAL_RECONCILIATION_2026_10_07.md"
DATE = "2026-10-07"


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=True) + "\n", encoding="utf-8")


def rows(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [x for x in payload if isinstance(x, dict)]
    if isinstance(payload, dict):
        return [row for group in payload.values() if isinstance(group, list) for row in group if isinstance(row, dict)]
    return []


def key(domain_id: Any, role_name: Any) -> str:
    return f"{str(domain_id or '').upper()}|{str(role_name or '').strip().casefold()}"


def refs(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    found = []
    for item in value:
        if isinstance(item, str) and item.strip():
            found.append(item.strip())
        elif isinstance(item, dict) and item.get("url"):
            found.append(str(item["url"]).strip())
    return list(dict.fromkeys(found))


def append_refs(old: Any, additions: list[str]) -> list[str]:
    return list(dict.fromkeys(refs(old) + [x for x in additions if x]))


def append_basis(old: Any, addition: str) -> str:
    old = str(old or "").strip()
    if addition in old:
        return old
    return f"{old} {addition}".strip()


def proposal_parts(lane: str, record: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any], list[str], str, str | None]:
    """Return parent decision, area decision, evidence refs, role title, key."""
    if lane == "D001_D056":
        parent = record.get("parent_domain_fit") or {}
        area = record.get("area_of_specialization_fit") or {}
        return parent, area, refs(parent.get("source_refs")) + refs(area.get("source_refs")), str(record.get("role_name") or ""), record.get("role_key")
    if lane == "D057_D112":
        parent = record.get("parent_domain_fit") or {}
        area = record.get("area_fit") or {}
        return parent, area, refs(parent.get("source_urls")) + refs(area.get("source_urls")), str(record.get("role_title") or ""), record.get("role_key")
    evidence = record.get("task_and_scope_evidence") or {}
    parent = evidence.get("parent_domain_fit") or {}
    area = evidence.get("area_fit") or {}
    # Citations may contain source URLs, identifiers, and locators.
    citations = parent.get("citations") or []
    citation_urls = [x.get("url") for x in citations if isinstance(x, dict) and x.get("url", "").startswith(("http://", "https://"))]
    return parent, area, refs(parent.get("source_refs")) + citation_urls, str(record.get("role_name") or ""), record.get("role_key")


def parent_status(lane: str, decision: dict[str, Any]) -> str:
    status = decision.get("disposition") if lane == "D001_D056" else decision.get("status")
    return str(status or "external-review").replace("external-review", "external_review").replace("external review", "external_review")


def area_status(lane: str, decision: dict[str, Any]) -> str:
    status = decision.get("disposition") if lane == "D001_D056" else decision.get("status")
    return str(status or "review_required").replace("external-review", "external_review").replace("external review", "external_review")


def area_routes(lane: str, decision: dict[str, Any]) -> list[dict[str, Any]]:
    result = []
    if lane == "D001_D056":
        candidate = decision.get("candidate_area_id")
        candidates = decision.get("candidate_scores") or []
        if candidate:
            result.append({"area_id": candidate, "route_type": "primary"})
        for c in candidates:
            area_id = c.get("area_id")
            route_type = str(c.get("route_type") or "").casefold()
            if area_id and route_type in {"secondary", "area_secondary"}:
                result.append({"area_id": area_id, "route_type": "secondary"})
    elif lane == "D057_D112":
        for route in decision.get("routes") or []:
            area_id = route.get("area_key")
            route_type = str(route.get("route_type") or "area_primary").casefold()
            if area_id:
                result.append({"area_id": area_id, "route_type": "secondary" if "secondary" in route_type else "primary"})
        if not result and decision.get("area_key"):
            result.append({"area_id": decision["area_key"], "route_type": "primary"})
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    structure = read(STRUCTURE)
    area_keys_by_domain: dict[str, set[str]] = {}
    for did, data in structure.items():
        if isinstance(data, dict):
            area_keys_by_domain[str(did)] = {
                str(area.get("area_id")) for area in data.get("areas_of_specialization", []) if isinstance(area, dict) and area.get("area_id")
            }

    containers = {path: read(path) for path in ROLE_FILES}
    locations: dict[str, list[tuple[Path, dict[str, Any]]]] = {}
    for path, payload in containers.items():
        for row in rows(payload):
            locations.setdefault(key(row.get("domain_id"), row.get("role_name")), []).append((path, row))

    counts: Counter[str] = Counter()
    decisions = []
    for lane, path, record_field in LANES:
        payload = read(path)
        for rec in payload.get(record_field, []):
            role_key = str(rec.get("role_key") or "")
            did, _, title = role_key.partition("|")
            matches = locations.get(key(did, title), [])
            if not matches:
                counts[f"{lane}:not_in_canonical"] += 1
                continue
            # Agent proposal must identify this exact current role row; do not
            # reintroduce or route a raw-only candidate here.
            current = rec.get("present_in_cleaned_canonical") or rec.get("present_in_current_overlay") or rec.get("canonical_present") or (rec.get("canonical_match") or {}).get("present")
            if not current:
                counts[f"{lane}:raw_only_not_added"] += 1
                continue
            parent, area, evidence_refs, role_name, _ = proposal_parts(lane, rec)
            pstatus = parent_status(lane, parent)
            astatus = area_status(lane, area)
            for file_path, row in matches:
                if row.get("student_path_status") == "excluded":
                    counts[f"{lane}:excluded_preserved"] += 1
                    continue
                row_evidence_refs = evidence_refs or refs(row.get("domain_fit_review_source_refs")) + refs(row.get("specialization_fit_review_source_refs")) + refs(row.get("role_source_urls"))
                # For lanes A/B, canonical_present can include legacy rows with
                # no current student route. All non-excluded exact canonical
                # records are still part of the requested route reconciliation.
                old_parent = row.get("domain_fit_review_status")
                old_area_status = row.get("specialization_fit_review_status")
                old_area_key = row.get("specialization_fit_area_key")
                entry = {"lane": lane, "role_key": role_key, "source_file": str(file_path.relative_to(ROOT)), "old_parent_status": old_parent, "proposed_parent_status": pstatus, "old_area_status": old_area_status, "old_area_key": old_area_key, "proposed_area_status": astatus, "proposed_routes": []}

                # Apply explicit parent results only when the agent has task
                # evidence and source refs. Preserve external-review as a
                # distinct residual state; it is not equivalent to unsupported.
                rationale = str(parent.get("reason") or parent.get("rationale") or "").strip()
                if pstatus in {"supported", "conditional", "unsupported"} and rationale and row_evidence_refs:
                    if args.apply:
                        row["domain_fit_review_status"] = pstatus
                        row["domain_fit_review_basis"] = append_basis(row.get("domain_fit_review_basis"), f"Local reconciliation of {lane} proposal 2026-10-07: {rationale}")
                        row["domain_fit_review_source_refs"] = append_refs(row.get("domain_fit_review_source_refs"), row_evidence_refs)
                        row["role_domain_lane_review_status"] = f"reviewed_{pstatus}"
                        row["role_domain_lane_review_date"] = DATE
                    counts[f"{lane}:parent_{pstatus}_applied" if args.apply else f"{lane}:parent_{pstatus}_ready"] += 1
                else:
                    counts[f"{lane}:parent_{pstatus}_not_promoted"] += 1

                # A direct route is only applicable when no canonical area
                # exists and the agent explicitly reviewed it as direct.
                if astatus in {"direct_domain_to_role", "direct_domain_role"} and pstatus in {"supported", "conditional"}:
                    if args.apply:
                        row["specialization_fit_review_status"] = "not_applicable"
                        row["specialization_fit_status"] = "direct_domain_role"
                        row["specialization_fit_domain_gate"] = "parent_domain_fit_supported" if pstatus == "supported" else "parent_domain_fit_unresolved"
                        row["specialization_fit_review_date"] = DATE
                        row["specialization_fit_review_basis"] = append_basis(row.get("specialization_fit_review_basis"), f"Local reconciliation of {lane} task/boundary proposal 2026-10-07: {area.get('rationale') or area.get('reason') or 'No specialization boundary is supported for this role; retained as a direct domain route.'}")
                        row["specialization_fit_review_source_refs"] = append_refs(row.get("specialization_fit_review_source_refs"), row_evidence_refs)
                        row["role_area_routes"] = []
                    counts[f"{lane}:direct_route_applied" if args.apply else f"{lane}:direct_route_ready"] += 1
                    decisions.append(entry)
                    continue

                proposed = area_routes(lane, area)
                valid_routes = [route for route in proposed if route["area_id"] in area_keys_by_domain.get(did, set())]
                entry["proposed_routes"] = valid_routes
                rationale_area = str(area.get("reason") or area.get("rationale") or "").strip()
                if astatus in {"supported", "conditional"} and pstatus in {"supported", "conditional"} and valid_routes and rationale_area and row_evidence_refs:
                    fit = "supported" if astatus == "supported" and pstatus == "supported" else "conditional"
                    routes = []
                    for route in valid_routes:
                        route_record = {
                            "area_id": route["area_id"],
                            "status": fit,
                            "route_type": route["route_type"],
                            "evidence": {"basis": rationale_area, "source_refs": list(dict.fromkeys(row_evidence_refs))},
                        }
                        if fit == "conditional":
                            route_record["qualification"] = rationale_area
                        routes.append(route_record)
                    if args.apply:
                        row["specialization_fit_review_status"] = fit
                        row["specialization_fit_status"] = fit
                        row["specialization_fit_area_key"] = next((r["area_id"] for r in routes if r["route_type"] == "primary"), routes[0]["area_id"])
                        row["specialization_fit_domain_gate"] = "parent_domain_fit_supported" if pstatus == "supported" else "parent_domain_fit_unresolved"
                        row["specialization_fit_review_basis"] = append_basis(row.get("specialization_fit_review_basis"), f"Local reconciliation of {lane} task/boundary proposal 2026-10-07: {rationale_area}")
                        row["specialization_fit_review_source_refs"] = append_refs(row.get("specialization_fit_review_source_refs"), row_evidence_refs)
                        row["specialization_fit_review_date"] = DATE
                        row["role_area_routes"] = routes
                        row["role_area_routes_updated"] = DATE
                    counts[f"{lane}:area_{fit}_applied" if args.apply else f"{lane}:area_{fit}_ready"] += 1
                else:
                    counts[f"{lane}:area_{astatus}_residual"] += 1
                decisions.append(entry)

    if args.apply:
        for path, payload in containers.items():
            write(path, payload)

    result = {
        "schema_version": "2026-10-07.role-agent-proposal-reconciliation.v1",
        "mode": "APPLIED" if args.apply else "DRY_RUN",
        "date": DATE,
        "policy": "Exact-key only; task/work evidence plus domain/area boundaries and source refs required; title, ISCO, subgroup membership, and role frequency are not fit proof.",
        "counts": dict(counts),
        "decisions": decisions,
        "remaining_work": {
            "raw_only_candidates_not_added": True,
            "external_review_preserved_as_distinct_from_unsupported": True,
            "agent_conditional_routes_are_explicit_conditional_not_promoted_to_supported": True,
        },
    }
    write(REPORT, result)
    REPORT_MD.write_text("\n".join([
        "# Role proposal reconciliation — 2026-10-07",
        "",
        f"Mode: **{result['mode']}**",
        "",
        "This local reconciler applied exact-key source-backed agent decisions only. Conditional fits remain explicitly conditional; external-review and raw-only candidates remain residuals.",
        "",
        "## Counts",
        "",
        *[f"- `{name}`: **{count}**" for name, count in sorted(counts.items())],
        "",
        f"Machine-readable ledger: `{REPORT.relative_to(ROOT).as_posix()}`",
        "",
    ]) + "\n", encoding="utf-8")
    print(json.dumps(result["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
