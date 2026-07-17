#!/usr/bin/env python3
"""Audit cross-domain SOC leakage in domain/subgroup tools (L1T/L2T).

Problem: domain tools were aggregated from O*NET Technology Skills via role→SOC
title matches; a bad title match pulls a foreign occupation's tools into the
domain (canonical example: Epic/MEDITECH EHR software surfacing in Accounting).

Mechanical rule (no curation): a DISTINCTIVE tool is "leaked" from a domain if
  - the domain has >=5 roles with verified SOC matches (role_tools.json), and
  - the tool appears in O*NET only under SOCs that NONE of the domain's
    matched roles map to.
Common-group tools are exempt (they are generic by definition). A domain is
never stripped below 3 distinctive tools (weakest-evidence flags are kept and
marked instead). Subgroup tools use the same rule per subgroup (>=3 matched
roles).

Outputs:
  _audit/tools_leakage_report.md  — human-readable audit
  _audit/tools_leakage_drop.json  — consumed by _gen_career_seed.py (rows skipped)

Run AFTER _build_role_tools.py (needs role_tools.json).
"""
import csv
import json
import os
import re
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
TECH_SKILLS_CANDIDATES = [
    os.path.join(HERE, "_tax_src", "onet", "Technology Skills.txt"),
    os.path.join(HERE, "_source_extracts", "onet_30_3", "Technology Skills.txt"),
]
MIN_DOMAIN_ROLES = 5
MIN_SUBGROUP_ROLES = 3
FLOOR_DISTINCTIVE = 3


def norm(t):
    return re.sub(r"\s+", " ", (t or "").strip().lower())


def main():
    rt_path = os.path.join(HERE, "role_tools.json")
    if not os.path.exists(rt_path):
        sys.exit("FATAL: role_tools.json missing — run _build_role_tools.py first.")
    role_tools = json.load(open(rt_path, encoding="utf-8"))
    tools = json.load(open(os.path.join(HERE, "domain_tools.json"), encoding="utf-8"))
    roles = json.load(open(os.path.join(HERE, "role_library_v3.json"), encoding="utf-8"))

    tech_path = next((p for p in TECH_SKILLS_CANDIDATES if os.path.exists(p)), None)
    if not tech_path:
        sys.exit("FATAL: O*NET Technology Skills file not found.")

    # tool name -> set of SOC bases it appears under in O*NET
    tool_socs = defaultdict(set)
    with open(tech_path, encoding="utf-8-sig", newline="") as f:
        rdr = csv.reader(f, delimiter="\t")
        header = [c.strip().lower() for c in next(rdr)]
        c_soc = next(j for j, c in enumerate(header) if "soc" in c)
        c_ex = next(j for j, c in enumerate(header) if "example" in c or "title" in c)
        for row in rdr:
            if len(row) > max(c_soc, c_ex):
                tool_socs[norm(row[c_ex])].add(row[c_soc].strip().split(".")[0])

    # domain / (domain, submajor) -> verified SOC set + matched-role counts
    dom_socs, dom_n = defaultdict(set), defaultdict(int)
    sg_socs, sg_n = defaultdict(set), defaultdict(int)
    role_sm = {}
    for r in roles:
        role_sm[f'{r["domain_id"]}|{r["role_name"]}'] = str(r.get("isco_group", ""))[:2]
    for rk, ent in role_tools.items():
        dk = rk.split("|", 1)[0]
        socs = set(ent.get("socs", []))
        dom_socs[dk] |= socs
        dom_n[dk] += 1
        sm = role_sm.get(rk)
        if sm:
            sg_socs[(dk, sm)] |= socs
            sg_n[(dk, sm)] += 1

    drops, kept_low, report = [], [], []

    def audit_group(dk, sm, entries, ref_socs, n_matched, min_roles):
        """entries: list of tool dicts in the distinctive group (mutating audit)."""
        scope = f"{dk}" + (f" sub {sm}" if sm else "")
        if n_matched < min_roles:
            return
        flagged = []
        for t in entries:
            socs = tool_socs.get(norm(t["tool"]))
            if socs and not (socs & ref_socs):
                flagged.append(t["tool"])
        if not flagged:
            return
        keep_budget = max(0, len(entries) - FLOOR_DISTINCTIVE)
        to_drop = flagged[:keep_budget] if keep_budget < len(flagged) else flagged
        floored = flagged[len(to_drop):]
        for name in to_drop:
            drops.append({"domain": dk, "isco_submajor": sm, "scope": "subgroup" if sm else "domain", "tool": name})
        for name in floored:
            kept_low.append((scope, name))
        report.append((scope, n_matched, to_drop, floored))

    for dk, tv in tools.items():
        if dk == "_meta":
            continue
        audit_group(dk, None, tv.get("distinctive_tools", []), dom_socs.get(dk, set()),
                    dom_n.get(dk, 0), MIN_DOMAIN_ROLES)
        for sm, sgt in (tv.get("subgroup_tools") or {}).items():
            audit_group(dk, str(sm), sgt.get("distinctive", []), sg_socs.get((dk, str(sm)), set()),
                        sg_n.get((dk, str(sm)), 0), MIN_SUBGROUP_ROLES)

    os.makedirs(os.path.join(HERE, "_audit"), exist_ok=True)
    json.dump(drops, open(os.path.join(HERE, "_audit", "tools_leakage_drop.json"), "w",
                          encoding="utf-8"), ensure_ascii=False, indent=1)

    lines = ["# Tools Leakage Audit", "",
             f"Rule: distinctive tool whose O*NET SOCs share nothing with the domain's/",
             f"subgroup's verified role SOCs (>= {MIN_DOMAIN_ROLES}/{MIN_SUBGROUP_ROLES} matched roles). "
             f"Floor: never below {FLOOR_DISTINCTIVE} distinctive tools.", "",
             f"**Dropped: {len(drops)} tools across {len({(d['domain'], d['isco_submajor']) for d in drops})} scopes; "
             f"kept-by-floor: {len(kept_low)}.**", ""]
    for scope, n, dropped, floored in sorted(report):
        lines.append(f"## {scope}  ({n} SOC-matched roles)")
        for t in dropped:
            lines.append(f"- DROP  {t}")
        for t in floored:
            lines.append(f"- KEEP (floor) {t}")
        lines.append("")
    open(os.path.join(HERE, "_audit", "tools_leakage_report.md"), "w",
         encoding="utf-8").write("\n".join(lines))

    print(f"leaked tools dropped: {len(drops)}  | kept by floor: {len(kept_low)}")
    print(f"-> _audit/tools_leakage_drop.json + tools_leakage_report.md")
    for scope, n, dropped, _ in sorted(report)[:12]:
        if dropped:
            print(f"  {scope}: {', '.join(dropped[:4])}{'…' if len(dropped) > 4 else ''}")


if __name__ == "__main__":
    main()
