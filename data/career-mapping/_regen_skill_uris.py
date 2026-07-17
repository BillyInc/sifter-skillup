#!/usr/bin/env python3
"""Regenerate _enrichment/skills_uris.csv with REAL ESCO concept URIs.

The previous file contained fabricated placeholder UUIDs. This script joins
skill names against the actual ESCO skills export (skills_en.csv style file:
conceptUri + preferredLabel + altLabels) and emits ONLY verified matches —
unmatched skills are omitted (nulls in DB), never fabricated.

Covers, in the same CSV shape the enrichment seed generator consumes
(level,key,isco_submajor,skill_name,uri):
  - foundation  (domain foundation_skills)     key = domain_key
  - cluster     (subgroup cluster_skills)      key = domain_key, isco_submajor
  - essential / optional (role skills)         key = role_key "D001|role name"
"""
import csv
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

SKILL_FILE_CANDIDATES = (
    glob.glob(os.path.join(HERE, "_tax_src", "esco", "skills_en.csv"))
    + glob.glob(os.path.join(HERE, "_tax_src", "esco", "*skills*.csv"))
    + glob.glob(os.path.join(HERE, "_tax_src", "**", "skills_en.csv"), recursive=True)
)


def norm(t):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", (t or "").lower())).strip()


def load_esco_skills():
    if not SKILL_FILE_CANDIDATES:
        sys.exit("FATAL: no ESCO skills CSV found under _tax_src/. Cannot generate real URIs.")
    path = SKILL_FILE_CANDIDATES[0]
    print(f"ESCO skills file: {path}")
    label_to_uri = {}
    with open(path, encoding="utf-8-sig", newline="") as f:
        rdr = csv.DictReader(f)
        cols = {c.lower(): c for c in rdr.fieldnames}
        uri_c = cols.get("concepturi") or cols.get("uri")
        pref_c = cols.get("preferredlabel")
        alt_c = cols.get("altlabels")
        if not (uri_c and pref_c):
            sys.exit(f"FATAL: unexpected columns in {path}: {rdr.fieldnames}")
        for row in rdr:
            uri = row[uri_c].strip()
            if not uri.startswith("http://data.europa.eu/esco/skill/"):
                continue
            pl = norm(row[pref_c])
            if pl and pl not in label_to_uri:
                label_to_uri[pl] = uri
            if alt_c and row.get(alt_c):
                for alt in row[alt_c].split("\n"):
                    a = norm(alt)
                    if a and a not in label_to_uri:
                        label_to_uri[a] = uri
    print(f"ESCO skill labels indexed: {len(label_to_uri)}")
    return label_to_uri


def main():
    lut = load_esco_skills()
    struct = json.load(open(os.path.join(HERE, "domain_structure.json"), encoding="utf-8"))
    roles = json.load(open(os.path.join(HERE, "role_library_v3.json"), encoding="utf-8"))

    rows, misses = [], 0

    def look(skill):
        nonlocal misses
        uri = lut.get(norm(skill))
        if not uri:
            misses += 1
        return uri

    for dk, st in struct.items():
        for fsk in st.get("foundation_skills", []):
            uri = look(fsk["skill"])
            if uri:
                rows.append(("foundation", dk, "", fsk["skill"], uri))
        for sg in st.get("subgroups", []):
            for s in sg.get("cluster_skills", []):
                uri = look(s)
                if uri:
                    rows.append(("cluster", dk, str(sg["isco_submajor"]), s, uri))

    for r in roles:
        rk = f'{r["domain_id"]}|{r["role_name"]}'
        for level, skills in (("essential", r.get("essential_skills") or []),
                              ("optional", r.get("optional_skills") or [])):
            for s in skills:
                uri = look(s)
                if uri:
                    rows.append((level, rk, "", s, uri))

    out = os.path.join(HERE, "_enrichment", "skills_uris.csv")
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["level", "key", "isco_submajor", "skill_name", "uri"])
        w.writerows(rows)
    total = len(rows) + misses
    print(f"wrote {len(rows)} REAL URI rows -> {out}")
    print(f"matched {len(rows)}/{total} skill lookups ({len(rows)/max(total,1)*100:.0f}%); unmatched omitted (never fabricated)")


if __name__ == "__main__":
    main()
