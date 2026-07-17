#!/usr/bin/env python3
"""Fill missing Layer-2 subgroup cluster_skills in domain_structure.json.

Rule (mirrors the documented L2 design):
  cluster_skills = skills present in >=25% of the subgroup's roles
                   MINUS the domain's L1 foundation skill names
  Never-empty floor (same spirit as the L1 >=30% floor fix):
    if <3 survive, relax to >=max(2 roles, 15%) minus foundation;
    if still empty, take the top skills by subgroup frequency minus foundation.
  Cap 12, ranked by prevalence within the subgroup.

Only touches subgroups whose cluster_skills is currently empty — existing
computed subgroups are left byte-identical. Writes a .bak backup first.
"""
import json
import os
import shutil
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
STRUCT = os.path.join(HERE, "domain_structure.json")
ROLES = os.path.join(HERE, "role_library_v3.json")

PRIMARY = 0.25
RELAX = 0.15
CAP = 12


def main():
    struct = json.load(open(STRUCT, encoding="utf-8"))
    roles = json.load(open(ROLES, encoding="utf-8"))

    # roles grouped by (domain, isco submajor)
    by_sg = {}
    for r in roles:
        dk = r["domain_id"]
        sm = str(r.get("isco_group", ""))[:2]
        by_sg.setdefault((dk, sm), []).append(r)

    fixed, still_empty = [], []
    for dk, st in struct.items():
        foundation = {f["skill"].strip().lower() for f in st.get("foundation_skills", [])}
        for sg in st.get("subgroups", []):
            if sg.get("cluster_skills"):
                continue  # leave computed ones untouched
            sm = str(sg["isco_submajor"])
            rs = by_sg.get((dk, sm), [])
            if not rs:
                still_empty.append((dk, sm, "no roles matched"))
                continue
            freq = Counter()
            for r in rs:
                for s in set(x.strip().lower() for x in (r.get("essential_skills") or [])):
                    freq[s] += 1
            n = len(rs)

            def pick(threshold):
                return [(s, c) for s, c in freq.most_common()
                        if c / n >= threshold and s not in foundation]

            chosen = pick(PRIMARY)
            if len(chosen) < 3:
                chosen = [(s, c) for s, c in freq.most_common()
                          if c >= 2 and c / n >= RELAX and s not in foundation]
            if not chosen:
                chosen = [(s, c) for s, c in freq.most_common() if s not in foundation][:5]
            sg["cluster_skills"] = [s for s, _ in chosen[:CAP]]
            fixed.append((dk, sm, len(sg["cluster_skills"]), n))

    shutil.copyfile(STRUCT, STRUCT + ".bak")
    json.dump(struct, open(STRUCT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    print(f"filled {len(fixed)} subgroups:")
    for dk, sm, k, n in fixed:
        print(f"  {dk} sub {sm}: {k} skills from {n} roles")
    if still_empty:
        print(f"UNFIXABLE ({len(still_empty)}):")
        for dk, sm, why in still_empty:
            print(f"  {dk} sub {sm}: {why}")
    # verification: count remaining empties
    empty = sum(1 for st in struct.values() for sg in st.get("subgroups", [])
                if not sg.get("cluster_skills"))
    total = sum(len(st.get("subgroups", [])) for st in struct.values())
    print(f"subgroups with cluster_skills: {total - empty}/{total}")


if __name__ == "__main__":
    main()
