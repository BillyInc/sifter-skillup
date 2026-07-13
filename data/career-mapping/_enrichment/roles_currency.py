#!/usr/bin/env python3
"""
Enrichment: Role currency status from WEF/O*NET/Lightcast (Phase 9 L4)
Source: data/career-mapping/_enrichment/roles_currency.csv
Columns: role_key, currency_status, currency_source
currency_status: current | legacy | emerging
currency_source: wef_foj_2025 | onet_emerging | lightcast | curated
"""
import csv
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from database import db

SCHEMA = "skillup_dev"
svc = db.get_service_client().schema(SCHEMA)

CURRENCY_CSV = "data/career-mapping/_enrichment/roles_currency.csv"


def main():
    if not os.path.exists(CURRENCY_CSV):
        print(f"Missing {CURRENCY_CSV}")
        return

    with open(CURRENCY_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        upserted = 0
        for row in reader:
            role_key = row["role_key"]
            existing = svc.table("domain_roles").select("id").eq("role_key", role_key).limit(1).execute()
            if not existing.data:
                print(f"Role not found: {role_key}")
                continue

            payload = {
                "currency_status": row["currency_status"],
                "currency_source": row.get("currency_source"),
            }
            if row.get("currency_verified_at"):
                payload["currency_verified_at"] = row["currency_verified_at"]

            svc.table("domain_roles").update(payload).eq("id", existing.data[0]["id"]).execute()
            upserted += 1

    # Record enrichment version
    commit_hash = os.popen("git rev-parse --short HEAD").read().strip() or "unknown"
    svc.table("enrichment_version").insert({
        "source_commit_hash": commit_hash,
        "seed_name": "roles_currency",
        "rows_upserted": upserted,
    }).execute()
    print(f"Roles currency enrichment complete: {upserted} rows")


if __name__ == "__main__":
    main()