#!/usr/bin/env python3
"""Phase 0 — row-count every career table in live Supabase (read-only).

Usage:  cd backend && python _check_db_state.py
Prints table -> row count (or HTTP error). No writes, no secrets printed.
"""
import os
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))

env = {}
for line in open(os.path.join(HERE, ".env"), encoding="utf-8-sig"):
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, _, v = line.partition("=")
        env[k.strip()] = v.strip().strip('"')

URL = env["SUPABASE_URL"]
KEY = env.get("SUPABASE_SERVICE_KEY") or env["SUPABASE_ANON_KEY"]

TABLES = [
    "domains", "domain_subgroups", "domain_roles", "domain_tools", "domain_certifications",
    "programmes", "schools", "jamb_programmes", "programme_mapping", "school_programmes",
    "programme_domain", "programme_role_score", "jamb_programme_domain", "domain_overlap",
    "programme_school_cutoff", "school_aggregate_formula", "course_competitiveness",
    "national_jamb_floor", "domain_demand_metrics", "role_demand_metrics", "subject_catalog",
    "institution_members", "mapping_feedback", "programme_subject_requirements",
    "programme_subject_options", "student_starting_points", "expert_profiles", "user_roles",
]


def count(table):
    # select=* — some tables (national_jamb_floor) have no `id` column
    req = urllib.request.Request(
        f"{URL}/rest/v1/{table}?select=*&limit=1",
        headers={
            "apikey": KEY, "Authorization": f"Bearer {KEY}",
            "Accept-Profile": "skillup_dev", "Prefer": "count=exact", "Range": "0-0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.headers.get("Content-Range", "").split("/")[-1]
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}"
    except Exception as e:  # noqa: BLE001
        return type(e).__name__


if __name__ == "__main__":
    for t in TABLES:
        print(f"{t:35s} {count(t)}")
