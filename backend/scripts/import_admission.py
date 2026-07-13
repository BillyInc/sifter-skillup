#!/usr/bin/env python3
"""
Admission Data Import Script (Phase 8)
Usage: python import_admission_2025.py admission_2025.csv

CSV columns:
- school_name, programme_name, year, aggregate_cutoff, jamb_cutoff, postutme_cutoff, form, source_url
- For formulas: school_name, year, jamb_weight, postutme_weight, olevel_weight, description, source_url
- For competitiveness: broad_course, year, applied, admitted, ratio, source, note
- For JAMB floor: year, floor_score, context_note, source_url
"""

import csv
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import db

SCHEMA = "skillup_dev"
svc = db.get_service_client().schema(SCHEMA)


def resolve_school(name: str) -> str:
    """Find or create school by name (fuzzy match)."""
    # Exact match first
    res = svc.table("schools").select("id").ilike("name", name).limit(1).execute()
    if res.data:
        return res.data[0]["id"]
    # Fuzzy: try contains
    res = svc.table("schools").select("id, name").execute()
    for s in res.data or []:
        if name.lower() in s["name"].lower() or s["name"].lower() in name.lower():
            return s["id"]
    # Create new (admin will verify)
    new = svc.table("schools").insert({
        "name": name,
        "institution_type": "university",
        "ibass_verified": False,
    }).execute()
    if new.data:
        print(f"  Created new school: {name} ({new.data[0]['id']})")
        return new.data[0]["id"]
    raise ValueError(f"Could not create school: {name}")


def resolve_programme(name: str) -> str:
    """Find programme by exact name match."""
    res = svc.table("programmes").select("id").eq("name", name).limit(1).execute()
    if res.data:
        return res.data[0]["id"]
    # Try case-insensitive
    res = svc.table("programmes").select("id, name").execute()
    for p in res.data or []:
        if p["name"].lower() == name.lower():
            return p["id"]
    # Log and return None
    print(f"  WARNING: Programme not found: {name}")
    return None


def import_cutoffs(csv_path: str):
    """Import programme_school_cutoff rows."""
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        upserted = 0
        skipped = 0
        for row in reader:
            school_id = resolve_school(row["school_name"])
            programme_id = resolve_programme(row["programme_name"])
            if not school_id or not programme_id:
                skipped += 1
                continue

            payload = {
                "school_id": school_id,
                "programme_id": programme_id,
                "year": int(row["year"]),
                "aggregate_cutoff": int(row["aggregate_cutoff"]) if row["aggregate_cutoff"] else None,
                "jamb_cutoff": int(row["jamb_cutoff"]) if row["jamb_cutoff"] else None,
                "postutme_cutoff": int(row["postutme_cutoff"]) if row["postutme_cutoff"] else None,
                "form": row["form"],
                "source_url": row["source_url"],
            }
            svc.table("programme_school_cutoff").upsert(payload, on_conflict="school_id,programme_id,year,form").execute()
            upserted += 1
        print(f"Cut-offs: {upserted} upserted, {skipped} skipped")


def import_formulas(csv_path: str):
    """Import school_aggregate_formula rows."""
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        upserted = 0
        for row in reader:
            school_id = resolve_school(row["school_name"])
            if not school_id:
                continue
            payload = {
                "school_id": school_id,
                "year": int(row["year"]),
                "jamb_weight": float(row["jamb_weight"]),
                "postutme_weight": float(row["postutme_weight"]),
                "olevel_weight": float(row["olevel_weight"]),
                "description": row.get("description"),
                "source_url": row.get("source_url"),
            }
            svc.table("school_aggregate_formula").upsert(payload, on_conflict="school_id,year").execute()
            upserted += 1
        print(f"Formulas: {upserted} upserted")


def import_competitiveness(csv_path: str):
    """Import course_competitiveness rows."""
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        upserted = 0
        for row in reader:
            payload = {
                "broad_course": row["broad_course"],
                "year": int(row["year"]),
                "applied": int(row["applied"]) if row["applied"] else None,
                "admitted": int(row["admitted"]) if row["admitted"] else None,
                "ratio": float(row["ratio"]) if row["ratio"] else None,
                "source": row.get("source"),
                "note": row.get("note"),
            }
            svc.table("course_competitiveness").upsert(payload, on_conflict="broad_course,year").execute()
            upserted += 1
        print(f"Competitiveness: {upserted} upserted")


def import_jamb_floor(csv_path: str):
    """Import national_jamb_floor row."""
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            payload = {
                "year": int(row["year"]),
                "floor_score": int(row["floor_score"]),
                "context_note": row.get("context_note"),
                "source_url": row.get("source_url"),
            }
            svc.table("national_jamb_floor").upsert(payload, on_conflict="year").execute()
            print(f"JAMB Floor: year={row['year']} score={row['floor_score']}")


def import_snapshot(csv_path: str):
    """Import admission_snapshot_version row."""
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Deactivate previous
            svc.table("admission_snapshot_version").update({"is_active": False}).eq("is_active", True).execute()
            payload = {
                "label": row["label"],
                "year": int(row["year"]),
                "compiler": row.get("compiler", "manual_import"),
                "notes": row.get("notes"),
                "is_active": True,
            }
            svc.table("admission_snapshot_version").insert(payload).execute()
            print(f"Snapshot: {row['label']} (year={row['year']})")


def main():
    if len(sys.argv) < 2:
        print("Usage: python import_admission_2025.py <csv_file> [--type cutoffs|formulas|competitiveness|floor|snapshot]")
        sys.exit(1)

    csv_path = sys.argv[1]
    import_type = "cutoffs"
    for arg in sys.argv[2:]:
        if arg.startswith("--type="):
            import_type = arg.split("=")[1]

    if not os.path.exists(csv_path):
        print(f"File not found: {csv_path}")
        sys.exit(1)

    if import_type == "cutoffs":
        import_cutoffs(csv_path)
    elif import_type == "formulas":
        import_formulas(csv_path)
    elif import_type == "competitiveness":
        import_competitiveness(csv_path)
    elif import_type == "floor":
        import_jamb_floor(csv_path)
    elif import_type == "snapshot":
        import_snapshot(csv_path)
    else:
        print(f"Unknown type: {import_type}")
        sys.exit(1)


if __name__ == "__main__":
    main()