"""Hide unresolved role→area routes from student paths without deleting them.

``review_required`` means the current evidence did not establish an
area-specific route.  The parent-domain decision is retained, but the exact
role-domain row is marked excluded from student exposure until a later
source-backed pass resolves it.  This is an exposure gate, not an assertion
that the occupation is invalid.
"""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
FILES = (ROOT / "role_library_v3_cleaned.json", ROOT / "thin_domain_role_overlays.json", ROOT / "emerging_role_overlays.json")
REPORT = AUDIT / "ROLE_AREA_REVIEW_VISIBILITY_GATE_2026_10_07.json"
DATE = "2026-10-07"


def read(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=True) + "\n", encoding="utf-8")


def rows(doc):
    return doc if isinstance(doc, list) else doc.get("roles", [])


def key(row):
    return f"{str(row.get('domain_id') or '').upper()}|{str(row.get('role_name') or '').strip().casefold()}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()
    documents = {path: read(path) for path in FILES}
    changed = []
    counts = Counter()
    processed = set()
    for path, document in documents.items():
        for row in rows(document):
            k = key(row)
            # A duplicated exact key may have one supported row and one stale
            # review row; decide per physical row so the supported copy remains.
            if row.get("student_path_status") == "excluded":
                counts["already_excluded"] += 1
                continue
            if row.get("specialization_fit_review_status") != "review_required":
                continue
            if row.get("role_area_routes"):
                counts["review_with_route_retained_for_manual_audit"] += 1
            parent = str(row.get("domain_fit_review_status") or "unknown")
            old_reason = str(row.get("student_path_exclusion_reason") or "").strip()
            reason = (
                "Exact role-to-area-of-specialization evidence is review_required; this role-domain row is hidden "
                "from student paths until an area route is source-backed. Parent-domain fit remains " + parent + ". "
                "The row and its evidence remain available to administrators for later reconciliation."
            )
            if old_reason and reason not in old_reason:
                reason = old_reason + " " + reason
            changed.append({"role_key": k, "source_file": str(path.relative_to(ROOT)), "parent_status": parent})
            counts["eligible_review_required_rows"] += 1
            if args.apply:
                row["student_path_status"] = "excluded"
                row["student_path_exclusion_reason"] = reason
                row["student_path_exclusion_date"] = DATE
                row["specialization_fit_student_visibility"] = "hidden_review_required"
                row["specialization_fit_student_visibility_date"] = DATE
    if args.apply:
        for path, document in documents.items():
            write(path, document)
    result = {
        "schema_version": "2026-10-07.role-area-review-visibility-gate.v1",
        "mode": "APPLIED" if args.apply else "DRY_RUN",
        "policy": "review_required area routes are retained for audit but excluded from student exposure; this does not mark the occupation invalid.",
        "counts": dict(counts),
        "changed": changed,
        "student_eligible_rule": "student_path_status != excluded and specialization_fit_review_status in supported, conditional, or not_applicable/direct_domain_role",
    }
    write(REPORT, result)
    print(json.dumps(dict(counts), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
