#!/usr/bin/env python3
"""
Enrichment: Tools demand re-rank from posting frequency (Phase 7c/9)
Source: data/career-mapping/_enrichment/tools_demand.csv (pre-fetched from Adzuna/StackOverflow/GHIG)
Columns: domain_key, tool_name, tool_group, demand_score, demand_source, demand_as_of, tool_url
"""
import csv
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from database import db

SCHEMA = "skillup_dev"
svc = db.get_service_client().schema(SCHEMA)

DEMAND_CSV = "data/career-mapping/_enrichment/tools_demand.csv"


def main():
    if not os.path.exists(DEMAND_CSV):
        print(f"Missing {DEMAND_CSV}")
        return

    with open(DEMAND_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        upserted = 0
        for row in reader:
            # Resolve domain_id
            d = svc.table("domains").select("id").eq("domain_key", row["domain_key"]).limit(1).execute()
            if not d.data:
                print(f"Domain not found: {row['domain_key']}")
                continue
            domain_id = d.data[0]["id"]

            # Resolve subgroup_id if provided
            subgroup_id = None
            if row.get("isco_submajor"):
                sg = svc.table("domain_subgroups").select("id").eq("domain_id", domain_id).eq("isco_submajor", row["isco_submajor"]).limit(1).execute()
                if sg.data:
                    subgroup_id = sg.data[0]["id"]

            # Find existing tool
            query = svc.table("domain_tools").select("id").eq("domain_id", domain_id).eq("tool_name", row["tool_name"])
            if subgroup_id:
                query = query.eq("subgroup_id", subgroup_id)
            else:
                query = query.is_("subgroup_id", "null")
            existing = query.execute()

            payload = {
                "domain_id": domain_id,
                "subgroup_id": subgroup_id,
                "scope": "subgroup" if subgroup_id else "domain",
                "tool_name": row["tool_name"],
                "tool_group": row["tool_group"],  # distinctive | common
                "role_freq": int(row["role_freq"]) if row.get("role_freq") else None,
                "score": float(row["score"]) if row.get("score") else None,
                "hot": row.get("hot") == "true",
                "in_demand": row.get("in_demand") == "true",
                "source": row.get("source"),
                "demand_score": float(row["demand_score"]) if row.get("demand_score") else None,
                "demand_source": row.get("demand_source"),
                "demand_as_of": row.get("demand_as_of"),
                "tool_url": row.get("tool_url"),
            }

            if existing.data:
                svc.table("domain_tools").update(payload).eq("id", existing.data[0]["id"]).execute()
            else:
                svc.table("domain_tools").insert(payload).execute()
            upserted += 1

    # Record enrichment version
    commit_hash = os.popen("git rev-parse --short HEAD").read().strip() or "unknown"
    svc.table("enrichment_version").insert({
        "source_commit_hash": commit_hash,
        "seed_name": "tools",
        "rows_upserted": upserted,
    }).execute()
    print(f"Tools demand re-rank complete: {upserted} rows")


if __name__ == "__main__":
    main()