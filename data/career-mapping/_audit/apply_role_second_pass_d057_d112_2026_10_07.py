"""Apply the completed D057-D112 second-pass ledger by exact canonical key."""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
LEDGER = AUDIT / "role_reconciliation_lanes_2026_10_07/D057_D112/D057_D112_role_reconciliation_second_pass_2026_10_07.json"
STRUCTURE = ROOT / "domain_structure.json"
FILES = (ROOT / "role_library_v3_cleaned.json", ROOT / "thin_domain_role_overlays.json", ROOT / "emerging_role_overlays.json")
OUT = AUDIT / "ROLE_AGENT_D057_D112_SECOND_PASS_RECONCILIATION_2026_10_07.json"


def read(p):
    return json.loads(p.read_text(encoding="utf-8-sig"))


def write(p, value):
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=True) + "\n", encoding="utf-8")


def rows(doc):
    return doc if isinstance(doc, list) else doc.get("roles", [])


def key(domain, role):
    return f"{str(domain or '').upper()}|{str(role or '').strip().casefold()}"


def refs(items):
    out = []
    for item in items or []:
        if isinstance(item, str) and item.startswith(("http://", "https://")):
            out.append(item)
        elif isinstance(item, dict) and isinstance(item.get("url"), str):
            out.append(item["url"])
    return list(dict.fromkeys(out))


def merge_refs(old, extra):
    return refs((old if isinstance(old, list) else []) + extra)


def rank(value):
    return {"supported": 3, "conditional": 2, "review_required": 1}.get(str(value or ""), 0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()
    structure = read(STRUCTURE)
    area_ids = {str(d).upper(): {str(a.get("area_id")) for a in v.get("areas_of_specialization", []) if isinstance(a, dict) and a.get("area_id")} for d, v in structure.items() if isinstance(v, dict)}
    containers = {p: read(p) for p in FILES}
    loc = {}
    for p, doc in containers.items():
        for row in rows(doc):
            loc.setdefault(key(row.get("domain_id"), row.get("role_name")), []).append(row)
    ledger = read(LEDGER)
    counts = Counter()
    decisions = []
    for rec in ledger.get("records", []):
        k = str(rec.get("exact_role_key") or "")
        did, _, title = k.partition("|")
        matches = loc.get(key(did, title), [])
        counts["records"] += 1
        if not matches:
            counts["not_in_canonical"] += 1
            continue
        p = rec.get("parent_domain_disposition") or {}
        route = rec.get("route_disposition") or {}
        pstatus = str(p.get("status") or "")
        astatus = str(route.get("status") or "")
        area = route.get("area_key")
        evidence = refs((rec.get("source_records") or []) + (p.get("source_urls") or []))
        rationale = str(route.get("rationale") or p.get("rationale") or "").strip()
        if area and str(area) not in area_ids.get(str(did).upper(), set()):
            counts["invalid_area_key"] += 1
            area = None
        for row in matches:
            if row.get("student_path_status") == "excluded":
                counts["excluded_preserved"] += 1
                continue
            if pstatus in {"supported", "conditional"} and evidence:
                current = str(row.get("domain_fit_review_status") or "")
                if args.apply and rank(pstatus) >= rank(current):
                    row["domain_fit_review_status"] = pstatus
                    row["domain_fit_review_basis"] = (str(row.get("domain_fit_review_basis") or "") + " Second-pass D057-D112 task/domain reconciliation 2026-10-07: " + p.get("rationale", "")).strip()
                    row["domain_fit_review_source_refs"] = merge_refs(row.get("domain_fit_review_source_refs"), evidence)
                    row["role_domain_lane_review_status"] = f"reviewed_{pstatus}"
                    row["role_domain_lane_review_date"] = "2026-10-07"
                    counts[f"parent_{pstatus}_applied"] += 1
                else:
                    counts[f"parent_{pstatus}_ready"] += 1
            if astatus == "conditional" and area and pstatus in {"supported", "conditional"} and evidence:
                current = str(row.get("specialization_fit_review_status") or "")
                if args.apply and rank("conditional") >= rank(current):
                    fit = "conditional"
                    row["specialization_fit_review_status"] = fit
                    row["specialization_fit_status"] = fit
                    row["specialization_fit_area_key"] = str(area)
                    row["specialization_fit_domain_gate"] = "parent_domain_fit_supported" if pstatus == "supported" else "parent_domain_fit_unresolved"
                    row["specialization_fit_review_basis"] = (str(row.get("specialization_fit_review_basis") or "") + " Second-pass D057-D112 task/area-boundary reconciliation 2026-10-07: " + rationale).strip()
                    row["specialization_fit_review_source_refs"] = merge_refs(row.get("specialization_fit_review_source_refs"), evidence)
                    row["specialization_fit_review_date"] = "2026-10-07"
                    row["role_area_routes"] = [{"area_id": str(area), "status": fit, "route_type": "primary", "qualification": rationale, "evidence": {"basis": rationale, "source_refs": evidence}}]
                    row["role_area_routes_updated"] = "2026-10-07"
                    counts["area_conditional_applied"] += 1
                else:
                    counts["area_conditional_preserved_stronger"] += 1
            else:
                counts[f"area_{astatus or 'unresolved'}_residual"] += 1
            decisions.append({"role_key": k, "parent_status": pstatus, "area_status": astatus, "area_key": area})
    if args.apply:
        for p, doc in containers.items():
            write(p, doc)
    result = {"schema_version": "2026-10-07.role-agent-d057-d112-second-pass-apply.v1", "mode": "APPLIED" if args.apply else "DRY_RUN", "counts": dict(counts), "decisions": decisions, "policy": "Exact canonical keys only; external-review and raw-only records remain residual; stronger decisions are never downgraded."}
    write(OUT, result)
    print(json.dumps(dict(counts), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
