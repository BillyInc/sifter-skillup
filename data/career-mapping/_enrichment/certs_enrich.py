#!/usr/bin/env python3
"""
Enrichment: Certification enrichment fields (Phase 4b/9)
Source: data/career-mapping/_enrichment/certs_enrichment.csv
Columns: domain_key, cert_name, cert_body, official_url, seniority_tier, tier_type, price, currency, price_as_of, price_source
"""
import csv
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from database import db

SCHEMA = "skillup_dev"
svc = db.get_service_client().schema(SCHEMA)

ENRICH_CSV = "data/career-mapping/_enrichment/certs_enrichment.csv"


def main():
    if not os.path.exists(ENRICH_CSV):
        print(f"Missing {ENRICH_CSV}")
        return

    with open(ENRICH_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        upserted = 0
        for row in reader:
            # Resolve domain_id
            d = svc.table("domains").select("id").eq("domain_key", row["domain_key"]).limit(1).execute()
            if not d.data:
                print(f"Domain not found: {row['domain_key']}")
                continue
            domain_id = d.data[0]["id"]

            # Find cert row (domain_id + name + body)
            existing = svc.table("domain_certifications").select("id").eq("domain_id", domain_id).ilike("name", row["cert_name"]).eq("body", row["cert_body"]).execute()

            payload = {
                "domain_id": domain_id,
                "name": row["cert_name"],
                "body": row["cert_body"],
                "official_url": row.get("official_url") or None,
                "seniority_tier": int(row["seniority_tier"]) if row.get("seniority_tier") else None,
                "tier_type": row.get("tier_type") or None,
                "price": float(row["price"]) if row.get("price") else None,
                "currency": row.get("currency") or None,
                "price_as_of": row.get("price_as_of") or None,
                "price_source": row.get("price_source") or None,
            }

            if existing.data:
                svc.table("domain_certifications").update(payload).eq("id", existing.data[0]["id"]).execute()
            else:
                svc.table("domain_certifications").insert(payload).execute()
            upserted += 1

    # Record enrichment version
    commit_hash = os.popen("git rev-parse --short HEAD").read().strip() or "unknown"
    svc.table("enrichment_version").insert({
        "source_commit_hash": commit_hash,
        "seed_name": "certs",
        "rows_upserted": upserted,
    }).execute()
    print(f"Certs enrichment complete: {upserted} rows")


if __name__ == "__main__":
    main()