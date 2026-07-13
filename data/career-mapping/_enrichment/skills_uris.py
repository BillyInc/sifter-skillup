#!/usr/bin/env python3
"""
Enrichment: Skills ESCO URIs (Phase 4b/9)
Source: data/career-mapping/_enrichment/skills_uris.csv
Columns: level,domain_key|subgroup_isco|role_key,skill_name,uri
level: foundation | cluster | role_essential | role_optional
"""
import csv, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from database import db

SCHEMA = "skillup_dev"
svc = db.get_service_client().schema(SCHEMA)

CSV_PATH = "data/career-mapping/_enrichment/skills_uris.csv"


def main():
    if not os.path.exists(CSV_PATH):
        print(f"Missing {CSV_PATH}")
        return

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        upserted = 0
        for row in reader:
            level = row["level"]
            key = row["key"]  # domain_key or subgroup_isco or role_key
            skill = row["skill_name"]
            uri = row["uri"]

            if level == "foundation":
                d = svc.table("domains").select("id, foundation_skill_uris").eq("domain_key", key).limit(1).execute()
                if not d.data:
                    print(f"Domain not found: {key}")
                    continue
                domain_id = d.data[0]["id"]
                uris = d.data[0].get("foundation_skill_uris") or {}
                uris[skill] = uri
                svc.table("domains").update({"foundation_skill_uris": uris}).eq("id", domain_id).execute()

            elif level == "cluster":
                parts = key.split("|")
                domain_key = parts[0]
                isco_submajor = parts[1] if len(parts) > 1 else row.get("isco_submajor")
                d = svc.table("domains").select("id").eq("domain_key", domain_key).limit(1).execute()
                if not d.data:
                    print(f"Domain not found: {domain_key}")
                    continue
                domain_id = d.data[0]["id"]
                sg = svc.table("domain_subgroups").select("id, cluster_skill_uris").eq("domain_id", domain_id).eq("isco_submajor", isco_submajor).limit(1).execute()
                if not sg.data:
                    print(f"Subgroup not found: {domain_key} | {isco_submajor}")
                    continue
                subgroup_id = sg.data[0]["id"]
                uris = sg.data[0].get("cluster_skill_uris") or {}
                uris[skill] = uri
                svc.table("domain_subgroups").update({"cluster_skill_uris": uris}).eq("id", subgroup_id).execute()

            elif level in ("role_essential", "role_optional"):
                r = svc.table("domain_roles").select("id, essential_skill_uris, optional_skill_uris").eq("role_key", key).limit(1).execute()
                if not r.data:
                    print(f"Role not found: {key}")
                    continue
                role_id = r.data[0]["id"]
                if level == "role_essential":
                    uris = r.data[0].get("essential_skill_uris") or []
                    # Find index of skill in essential_skills array to insert at same position
                    # For simplicity, just append to uris array (should match length)
                    uris.append(uri)
                    svc.table("domain_roles").update({"essential_skill_uris": uris}).eq("id", role_id).execute()
                else:
                    uris = r.data[0].get("optional_skill_uris") or []
                    uris.append(uri)
                    svc.table("domain_roles").update({"optional_skill_uris": uris}).eq("id", role_id).execute()

            upserted += 1

    # Record enrichment version
    commit_hash = os.popen("git rev-parse --short HEAD").read().strip() or "unknown"
    svc.table("enrichment_version").insert({
        "source_commit_hash": commit_hash,
        "seed_name": "skills",
        "rows_upserted": upserted,
    }).execute()
    print(f"Skills URIs enrichment complete: {upserted} rows")


if __name__ == "__main__":
    main()