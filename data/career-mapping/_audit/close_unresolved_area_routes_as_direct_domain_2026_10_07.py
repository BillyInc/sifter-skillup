"""Close active area-review residuals as explicit direct domain→role routes.

This is only allowed when the exact canonical row already has a supported or
conditional parent-domain decision and has no area route.  It does not claim
the role fits every specialization; it records that the role is shown directly
under the parent domain until a defensible area-specific route exists.  Parent
unsupported rows and excluded provenance rows are untouched.
"""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
FILES = (ROOT / "role_library_v3_cleaned.json", ROOT / "thin_domain_role_overlays.json", ROOT / "emerging_role_overlays.json")
REPORT = AUDIT / "DIRECT_DOMAIN_ROLE_RESOLUTION_2026_10_07.json"
DATE = "2026-10-07"

SOURCE_GAPS = {
    "D032|project management specialists": "https://www.onetonline.org/link/details/13-1082.00",
    "D061|insurance sales agents": "https://www.onetonline.org/link/details/41-3021.00",
    "D022|mine shift manager": "http://data.europa.eu/esco/occupation/23993e79-a0a0-4155-9f62-68e14ee65dab",
    "D022|mine supervisor": "http://data.europa.eu/esco/occupation/5c14982e-375d-47c5-9ea1-e9bcf3884643",
    "D020|pipeline environmental project manager": "http://data.europa.eu/esco/occupation/351a0eb0-a1d0-49bd-a2f8-6dc447ddf316",
    "D031|auctioneer": "http://data.europa.eu/esco/occupation/f1ecc3c4-8212-4386-871a-6fda1b5b4d91",
}


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=True) + "\n", encoding="utf-8")


def rows(doc):
    return doc if isinstance(doc, list) else doc.get("roles", [])


def key(row):
    return f"{str(row.get('domain_id') or '').upper()}|{str(row.get('role_name') or '').strip().casefold()}"


def refs(old, extra):
    result = []
    for value in (old if isinstance(old, list) else []) + extra:
        if isinstance(value, str) and value.startswith(("http://", "https://")):
            result.append(value)
    return list(dict.fromkeys(result))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()
    documents = {path: read(path) for path in FILES}
    seen = set()
    counts = Counter()
    changed = []
    for path, document in documents.items():
        for row in rows(document):
            k = key(row)
            if k in seen:
                continue
            seen.add(k)
            if row.get("student_path_status") == "excluded":
                counts["excluded_preserved"] += 1
                continue
            if row.get("specialization_fit_review_status") != "review_required":
                continue
            if row.get("role_area_routes"):
                counts["area_route_present_preserved"] += 1
                continue
            parent = str(row.get("domain_fit_review_status") or "")
            if parent not in {"supported", "conditional"}:
                counts["parent_not_resolved"] += 1
                continue
            source_refs = refs(row.get("domain_fit_review_source_refs"), [SOURCE_GAPS[k]] if k in SOURCE_GAPS else [])
            if not source_refs:
                counts["source_gap_residual"] += 1
                continue
            rationale = (
                "The exact role has an explicit supported/conditional parent-domain decision and the completed "
                "task/boundary pass did not establish a uniquely defensible area-of-specialization route. "
                "Retain the role directly under the domain; do not imply that the parent foundation covers every specialization."
            )
            changed.append({"role_key": k, "parent_status": parent, "source_refs_added": [SOURCE_GAPS[k]] if k in SOURCE_GAPS else []})
            counts["eligible"] += 1
            if args.apply:
                row["specialization_fit_review_status"] = "not_applicable"
                row["specialization_fit_status"] = "direct_domain_role"
                row["specialization_fit_area_key"] = None
                row["specialization_fit_domain_gate"] = "parent_domain_fit_supported" if parent == "supported" else "parent_domain_fit_unresolved"
                row["specialization_fit_review_basis"] = f"Direct-route closure 2026-10-07: {rationale}"
                row["specialization_fit_review_source_refs"] = source_refs
                row["specialization_fit_review_date"] = DATE
                row["role_area_routes"] = []
                row["role_area_routes_updated"] = DATE
    if args.apply:
        for path, document in documents.items():
            write(path, document)
    result = {
        "schema_version": "2026-10-07.direct-domain-role-resolution.v1",
        "mode": "APPLIED" if args.apply else "DRY_RUN",
        "policy": "Direct domain→role is used only for active exact canonical keys with supported/conditional parent fit and no defensible area route; excluded/unsupported parent links are untouched.",
        "counts": dict(counts),
        "changed": changed,
        "source_gap_locators": SOURCE_GAPS,
    }
    write(REPORT, result)
    print(json.dumps(dict(counts), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
