#!/usr/bin/env python3
"""Phase 0 (step 2) — build the UNIFIED OCCUPATION GRAPH by fusing ESCO + O*NET via
the ESCO<->O*NET crosswalk, keyed on ISCO. This is the glue that makes the locked
sources interoperate.

Node (keyed by esco_uri, the richest anchor):
  {esco_uri, isco_group, label, alt_labels[], essential_skills[], optional_skills[],
   onet_soc[], onet_alt_titles[], onet_emerging_tasks[], source_provenance[]}

Also emits onet-only occupations that have NO ESCO match (so nothing is lost).
Output: taxonomies/occupation_graph.json
"""
import csv, json, os
csv.field_size_limit(10_000_000)
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "_tax_src")
OUT = os.path.join(HERE, "taxonomies")

esco = json.load(open(os.path.join(OUT, "esco_occupations.json"), encoding="utf-8"))

# ── O*NET occupation data + alt titles + emerging tasks ──
onet_title = {}
with open(os.path.join(SRC, "onet", "Occupation Data.txt"), encoding="utf-8") as f:
    for r in csv.DictReader(f, delimiter="\t"):
        onet_title[r["O*NET-SOC Code"]] = {"title": r["Title"], "desc": r["Description"][:400]}

onet_alt = {}
with open(os.path.join(SRC, "onet", "Alternate Titles.txt"), encoding="utf-8") as f:
    for r in csv.DictReader(f, delimiter="\t"):
        onet_alt.setdefault(r["O*NET-SOC Code"], []).append(r["Alternate Title"])

onet_emerging = {}
with open(os.path.join(SRC, "onet", "Emerging Tasks.txt"), encoding="utf-8") as f:
    for r in csv.DictReader(f, delimiter="\t"):
        onet_emerging.setdefault(r["O*NET-SOC Code"], []).append(r["Task"])

# ── crosswalk: O*NET id <-> ESCO uri ──
xw_rows = list(csv.reader(open(os.path.join(SRC, "esco_onet_crosswalk.csv"), encoding="utf-8-sig")))
# header at row 16 (0-based), data from 17
hdr = xw_rows[16]
ci = {name: i for i, name in enumerate(hdr)}
onet_by_esco = {}   # esco_uri -> set(onet_soc)
xw_data = 0
for r in xw_rows[17:]:
    if len(r) <= ci["Type of Match"]:
        continue
    onet_id = r[ci["O*NET Id"]].strip()
    esco_uri = r[ci["ESCO or ISCO URI"]].strip()
    if onet_id and esco_uri.startswith("http"):
        onet_by_esco.setdefault(esco_uri, set()).add(onet_id)
        xw_data += 1

# ── fuse into the graph ──
graph = {}
esco_matched = 0
for uri, o in esco.items():
    onet_ids = sorted(onet_by_esco.get(uri, []))
    prov = ["esco"]
    alt_titles, emerging = [], []
    if onet_ids:
        esco_matched += 1; prov.append("onet_crosswalk")
        for oid in onet_ids:
            alt_titles += onet_alt.get(oid, [])
            emerging += onet_emerging.get(oid, [])
    graph[uri] = {
        "esco_uri": uri, "isco_group": o["isco_group"], "label": o["label"],
        "alt_labels": o["alt_labels"],
        "essential_skills": o["essential_skills"], "optional_skills": o["optional_skills"],
        "onet_soc": onet_ids,
        "onet_alt_titles": list(dict.fromkeys(alt_titles))[:60],
        "onet_emerging_tasks": list(dict.fromkeys(emerging)),
        "source_provenance": prov,
    }

# ── O*NET occupations with NO ESCO match -> keep as onet-only nodes (nothing lost) ──
matched_onet = {oid for s in onet_by_esco.values() for oid in s}
onet_only = 0
for oid, meta in onet_title.items():
    if oid in matched_onet:
        continue
    key = f"onet:{oid}"
    graph[key] = {
        "esco_uri": None, "isco_group": "", "label": meta["title"], "alt_labels": [],
        "essential_skills": [], "optional_skills": [],
        "onet_soc": [oid], "onet_alt_titles": list(dict.fromkeys(onet_alt.get(oid, [])))[:60],
        "onet_emerging_tasks": list(dict.fromkeys(onet_emerging.get(oid, []))),
        "source_provenance": ["onet_only"],
    }
    onet_only += 1

json.dump(graph, open(os.path.join(OUT, "occupation_graph.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)

# ── report ──
total = len(graph)
with_skills = sum(1 for n in graph.values() if n["essential_skills"])
with_emerging = sum(1 for n in graph.values() if n["onet_emerging_tasks"])
print("Unified occupation graph:")
print(f"  ESCO nodes:            {len(esco)}")
print(f"  ESCO matched to O*NET: {esco_matched} ({100*esco_matched//len(esco)}%)")
print(f"  crosswalk pairs used:  {xw_data}")
print(f"  O*NET-only nodes added:{onet_only}")
print(f"  TOTAL graph nodes:     {total}")
print(f"  nodes with essential skills: {with_skills} ({100*with_skills//total}%)")
print(f"  nodes with O*NET emerging tasks: {with_emerging}")
