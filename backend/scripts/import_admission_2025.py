#!/usr/bin/env python3
"""
Import admission data for a specific year.
Usage: python import_admission_2025.py
"""
import csv, os, sys
from database import db

SCHEMA = "skillup_dev"
svc = db.get_service_client().schema(SCHEMA)

YEAR = 2025

def resolve_school(name: str) -> str:
    # Exact match first
    res = svc.table("schools").select("id").eq("name", name).limit(1).execute()
    if res.data:
        return res.data[0]["id"]
    # Fuzzy: try partial
    res = svc.table("schools").select("id").ilike("name", f"%{name}%").limit(1).execute()
    if res.data:
        return res.data[0]["id"]
    # Create if missing (admin will verify)
    ins = svc.table("schools").insert({
        "name": name,
        "institution_type": "university",
        "verification_status": "unverified",
    }).execute()
    return ins.data[0]["id"]

def resolve_programme(name: str) -> str:
    res = svc.table("programmes").select("id").eq("name", name).limit(1).execute()
    if res.data:
        return res.data[0]["id"]
    # Try partial
    res = svc.table("programmes").select("id").ilike("name", f"%{name}%").limit(1).execute()
    if res.data:
        return res.data[0]["id"]
    print(f"  ⚠ Programme not found: {name}")
    return None

def import_cutoffs(csv_path: str):
    print(f"Importing cutoffs from {csv_path}")
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            school_id = resolve_school(row["school_name"])
            programme_id = resolve_programme(row["programme_name"])
            if not school_id or not programme_id:
                print(f"  SKIP unresolved: {row}")
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
            print(f"  ✓ {row['school_name']} - {row['programme_name']} ({row['form']})")

def import_formulas(csv_path: str):
    print(f"Importing formulas from {csv_path}")
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            school_id = resolve_school(row["school_name"])
            if not school_id:
                print(f"  SKIP unresolved school: {row['school_name']}")
                continue
            payload = {
                "school_id": school_id,
                "year": int(row["year"]),
                "jamb_weight": float(row["jamb_weight"]),
                "postutme_weight": float(row["postutme_weight"]),
                "olevel_weight": float(row["olevel_weight"]),
                "description": row["description"],
                "source_url": row["source_url"],
            }
            svc.table("school_aggregate_formula").upsert(payload, on_conflict="school_id,year").execute()
            print(f"  ✓ {row['school_name']} formula")

def import_competitiveness(csv_path: str):
    print(f"Importing competitiveness from {csv_path}")
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            payload = {
                "broad_course": row["broad_course"],
                "year": int(row["year"]),
                "applied": int(row["applied"]) if row["applied"] else None,
                "admitted": int(row["admitted"]) if row["admitted"] else None,
                "ratio": float(row["ratio"]) if row["ratio"] else None,
                "source": row["source"],
                "note": row["note"],
            }
            svc.table("course_competitiveness").upsert(payload, on_conflict="broad_course,year").execute()
            print(f"  ✓ {row['broad_course']} {row['year']}")

def import_jamb_floor(csv_path: str):
    print(f"Importing JAMB floor from {csv_path}")
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            payload = {
                "year": int(row["year"]),
                "floor_score": int(row["floor_score"]),
                "context_note": row["context_note"],
                "source_url": row["source_url"],
            }
            svc.table("national_jamb_floor").upsert(payload, on_conflict="year").execute()
            print(f"  ✓ {row['year']}: floor={row['floor_score']}")

def import_snapshot(csv_path: str):
    print(f"Importing snapshot from {csv_path}")
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Deactivate all first
            svc.table("admission_snapshot_version").update({"is_active": False}).eq("is_active", True).execute()
            payload = {
                "label": row["label"],
                "year": int(row["year"]),
                "compiler": row["compiler"],
                "notes": row["notes"],
                "is_active": row["is_active"].lower() == "true",
            }
            svc.table("admission_snapshot_version").upsert(payload, on_conflict="id").execute()
            print(f"  ✓ {row['label']}")

if __name__ == "__main__":
    # CSV files live under data/career-mapping/_enrichment/ — resolve from project root
    PROJECT_ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", ".."))
    ENRICHMENT_DIR = os.path.join(PROJECT_ROOT, "data", "career-mapping", "_enrichment")
    import_cutoffs(os.path.join(ENRICHMENT_DIR, "admission_cutoffs_2025.csv"))
    import_formulas(os.path.join(ENRICHMENT_DIR, "admission_formulas_2025.csv"))
    import_competitiveness(os.path.join(ENRICHMENT_DIR, "admission_competitiveness_2025.csv"))
    import_jamb_floor(os.path.join(ENRICHMENT_DIR, "jamb_floor.csv"))
    import_snapshot(os.path.join(ENRICHMENT_DIR, "admission_snapshot.csv"))
    print("All admission data imported!")