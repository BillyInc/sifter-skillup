#!/usr/bin/env python3
"""Phase 0 (step 1) — normalize ESCO v1.2.1 into occupation nodes keyed on ISCO.
Builds the SPINE of the unified occupation graph:
  taxonomies/esco_occupations.json  -> {esco_uri: {label, isco_group, alt_labels[],
                                        definition, essential_skills[], optional_skills[]}}
  taxonomies/esco_isco_groups.json  -> {isco_code: {label, description}}
ESCO occupationSkillRelations gives essential vs optional skills per occupation.
Every node ends with (esco_uri, isco_group, essential_skills[]) — the RHS of coverage scoring.
"""
import csv, json, os
csv.field_size_limit(10_000_000)
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "_tax_src", "esco")
OUT = os.path.join(HERE, "taxonomies")
os.makedirs(OUT, exist_ok=True)

def rows(name):
    with open(os.path.join(SRC, name), encoding="utf-8") as f:
        yield from csv.DictReader(f)

# ── ISCO groups (the spine labels) ──
isco = {}
for r in rows("ISCOGroups_en.csv"):
    code = (r["code"] or "").strip()
    if code:
        isco[code] = {"label": r["preferredLabel"].strip(),
                      "description": (r.get("description") or "").strip()[:400]}
json.dump(isco, open(os.path.join(OUT, "esco_isco_groups.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)

# ── occupations ──
occ = {}
for r in rows("occupations_en.csv"):
    uri = r["conceptUri"].strip()
    alt = [a.strip() for a in (r.get("altLabels") or "").split("\n") if a.strip()]
    occ[uri] = {"label": r["preferredLabel"].strip(),
                "isco_group": (r.get("iscoGroup") or "").strip(),
                "alt_labels": alt,
                "code": (r.get("code") or "").strip(),
                "definition": (r.get("definition") or r.get("description") or "").strip()[:600],
                "essential_skills": [], "optional_skills": []}

# ── essential/optional skills per occupation ──
ess = opt = 0
for r in rows("occupationSkillRelations_en.csv"):
    uri = r["occupationUri"].strip()
    if uri not in occ:
        continue
    lbl = (r.get("skillLabel") or "").strip()
    if not lbl:
        continue
    if r.get("relationType", "").strip() == "essential":
        occ[uri]["essential_skills"].append(lbl); ess += 1
    else:
        occ[uri]["optional_skills"].append(lbl); opt += 1

# dedup skill lists (preserve order)
for o in occ.values():
    o["essential_skills"] = list(dict.fromkeys(o["essential_skills"]))
    o["optional_skills"] = list(dict.fromkeys(o["optional_skills"]))

json.dump(occ, open(os.path.join(OUT, "esco_occupations.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)

# ── report ──
with_isco = sum(1 for o in occ.values() if o["isco_group"])
with_ess = sum(1 for o in occ.values() if o["essential_skills"])
no_ess = [o["label"] for o in occ.values() if not o["essential_skills"]]
print(f"ESCO ingested:")
print(f"  ISCO groups:        {len(isco)}")
print(f"  occupations:        {len(occ)}")
print(f"  with ISCO group:    {with_isco} ({100*with_isco//len(occ)}%)")
print(f"  with essential skills: {with_ess} ({100*with_ess//len(occ)}%)")
print(f"  essential rel: {ess}  optional rel: {opt}")
print(f"  occupations WITHOUT essential skills: {len(no_ess)} (e.g. {no_ess[:5]})")
