#!/usr/bin/env python3
"""Build Layer-3T role-level tools -> role_tools.json.

Method (same title-crosswalk approach that built domain_tools.json, 77% match):
  role.role_name (+ also_known_as aliases) -> ESCO title -> O*NET-SOC via
  _tax_src/esco_onet_crosswalk.csv (title join) -> tools from O*NET
  Technology Skills, Hot/In-Demand first, cap 10 per role.

Output: role_tools.json  { role_key: {"soc": "...", "tools": [{tool, hot,
in_demand}] } }  where role_key = "D001|software developer" (same key format
as the v2 seed). Roles with no SOC match are simply absent — the UI falls
back to subgroup tools (labelled inherited).
"""
import csv
import json
import os
import re
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))

CROSSWALK_CANDIDATES = [
    os.path.join(HERE, "_tax_src", "esco_onet_crosswalk.csv"),
]
TECH_SKILLS_CANDIDATES = [
    os.path.join(HERE, "_tax_src", "onet", "Technology Skills.txt"),
    os.path.join(HERE, "_source_extracts", "onet_30_3", "Technology Skills.txt"),
    os.path.join(HERE, "_source_extracts", "onet_30_3", "Software Skills.txt"),
]


def first_existing(paths, label):
    for p in paths:
        if os.path.exists(p):
            print(f"{label}: {p}")
            return p
    sys.exit(f"FATAL: none of the {label} candidate paths exist: {paths}")


def norm(t):
    return re.sub(r"[^a-z0-9 ]", " ", (t or "").lower()).strip()


def main():
    xwalk_path = first_existing(CROSSWALK_CANDIDATES, "crosswalk")
    tech_path = first_existing(TECH_SKILLS_CANDIDATES, "technology skills")

    # ── crosswalk: ESCO title -> SOC codes ──────────────────────
    # File has preamble rows; find the header row containing both an ESCO and
    # an O*NET column, then map title->codes.
    esco_to_soc = defaultdict(set)
    with open(xwalk_path, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.reader(f))
    header_i, esco_col, onet_col = None, None, None
    for i, row in enumerate(rows[:40]):
        low = [c.strip().lower() for c in row]
        e = next((j for j, c in enumerate(low) if "esco" in c and ("title" in c or "label" in c or "occupation" in c)), None)
        o = next((j for j, c in enumerate(low) if ("o*net" in c or "onet" in c) and ("id" in c or "code" in c or "soc" in c)), None)
        if e is not None and o is not None:
            header_i, esco_col, onet_col = i, e, o
            break
    if header_i is None:
        sys.exit(f"FATAL: could not locate header row in {xwalk_path}; first rows: {rows[:5]}")
    for row in rows[header_i + 1:]:
        if len(row) <= max(esco_col, onet_col):
            continue
        et, oc = norm(row[esco_col]), row[onet_col].strip()
        if et and re.match(r"^\d{2}-\d{4}", oc):
            esco_to_soc[et].add(oc.split(".")[0] + "." + oc.split(".")[1] if "." in oc else oc)

    print(f"crosswalk titles: {len(esco_to_soc)}")

    # ── technology skills: SOC -> tools ─────────────────────────
    soc_tools = defaultdict(list)
    with open(tech_path, encoding="utf-8-sig", newline="") as f:
        rdr = csv.reader(f, delimiter="\t")
        header = [c.strip().lower() for c in next(rdr)]
        def col(*names):
            for nm in names:
                for j, c in enumerate(header):
                    if nm in c:
                        return j
            return None
        c_soc = col("o*net-soc code", "onet_soc", "soc")
        c_ex = col("example", "title")
        c_hot = col("hot")
        c_dem = col("in demand", "in_demand")
        if c_soc is None or c_ex is None:
            sys.exit(f"FATAL: unexpected header in {tech_path}: {header}")
        for row in rdr:
            if len(row) <= max(x for x in (c_soc, c_ex, c_hot, c_dem) if x is not None):
                continue
            soc = row[c_soc].strip()
            soc_base = soc.split(".")[0]
            hot = (row[c_hot].strip().upper() == "Y") if c_hot is not None else False
            dem = (row[c_dem].strip().upper() == "Y") if c_dem is not None else False
            soc_tools[soc_base].append({"tool": row[c_ex].strip(), "hot": hot, "in_demand": dem})
    print(f"SOC codes with tools: {len(soc_tools)}")

    # ── roles -> SOC -> tools ────────────────────────────────────
    roles = json.load(open(os.path.join(HERE, "role_library_v3.json"), encoding="utf-8"))
    out, matched = {}, 0
    for r in roles:
        rk = f'{r["domain_id"]}|{r["role_name"]}'
        titles = [r["role_name"]]
        aka = r.get("also_known_as")
        if isinstance(aka, str):
            titles += re.split(r"[;·]", aka)
        elif isinstance(aka, list):
            titles += aka
        socs = set()
        for t in titles:
            socs |= {s.split(".")[0] for s in esco_to_soc.get(norm(t), ())}
        if not socs:
            continue
        pool, seen = [], set()
        for soc in sorted(socs):
            for t in soc_tools.get(soc, ()):
                k = t["tool"].lower()
                if k in seen:
                    continue
                seen.add(k)
                pool.append(t)
        if not pool:
            continue
        # Hot/In-Demand first, then original O*NET order
        pool.sort(key=lambda t: (not t["hot"], not t["in_demand"]))
        out[rk] = {"socs": sorted(socs), "tools": pool[:10]}
        matched += 1

    path = os.path.join(HERE, "role_tools.json")
    json.dump(out, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"roles matched to SOC tools: {matched}/{len(roles)} ({matched/len(roles)*100:.0f}%) -> {path}")


if __name__ == "__main__":
    main()
