#!/usr/bin/env python3
"""Generate backend/seed_career_pilot.sql from the repo career-mapping JSON.
Idempotent: deterministic uuid5 ids + ON CONFLICT (id) DO UPDATE.
Scope: programmes (CCMAS canonical + custom enrichment), schools, jamb_programmes,
programme_mapping, school_programmes, programme_subject_requirements.
Does NOT touch programme_domain (domain phase)."""
import json, re, uuid, os

HERE = os.path.dirname(os.path.abspath(__file__))
NS = uuid.UUID("5c1f7e00-0000-4000-8000-0000ca4ee401")  # fixed namespace for this dataset
def uid(*parts): return str(uuid.uuid5(NS, "|".join(parts)))
def q(s):
    if s is None: return "NULL"
    return "'" + str(s).replace("'", "''") + "'"
def load(p): return json.load(open(os.path.join(HERE, p), encoding="utf-8"))

CODE_RE = re.compile(r"[A-Z0-9][A-Z0-9'&./ -]{1,24}$")
NOISE = {"LAW", "AND", "STUDIES", "SOCIAL SCIENCES", "UTME", "DIRECT ENTRY", "SUBJECTS"}
def norm_code(c):
    c = (c or "").strip().upper().rstrip(".")
    if not c or c in NOISE or not CODE_RE.match(c): return None
    return c

rows = {"programmes": [], "schools": {}, "jamb_programmes": [], "programme_mapping": [],
        "school_programmes": [], "programme_subject_requirements": []}

# ── 1. programmes: CCMAS canonical ──────────────────────────────
import glob as _glob
prog_id_by_code = {}          # ccmas_programme_code -> programme uuid (global; pilot bridge uses this)
prog_id_by_disc_code = {}     # (discipline, code) -> uuid (new-discipline bridges use this)
prog_id_by_disc_name = {}     # (discipline, name) -> uuid
for f in sorted(_glob.glob(os.path.join(HERE, "ccmas", "*.json"))):
    d = json.load(open(f, encoding="utf-8"))
    disc = d["discipline"]
    for p in d["programmes"]:
        pid = uid("programme", "ccmas", disc, p["name"])  # (discipline,name) is the stable unique key
        prog_id_by_code[p["code"]] = pid
        prog_id_by_disc_code[(disc, p["code"])] = pid
        prog_id_by_disc_name[(disc, p["name"])] = pid
        rows["programmes"].append((pid, p["name"], None, "university", disc,
                                   p.get("qualification"), p.get("duration_years"),
                                   disc, p["code"], "ccmas"))
# ── 1b. programmes: custom (Type-D enrichment) ──────────────────
prog_id_by_name = {}
for f in ["enrichment/anthropology.json", "enrichment/intelligence_security.json", "enrichment/social_justice.json"]:
    d = load(f)
    pid = uid("programme", "custom", d["programme"])
    prog_id_by_name[d["programme"]] = pid
    rows["programmes"].append((pid, d["programme"], None, "university",
                               "Social Sciences (custom — no CCMAS standard)",
                               d.get("qualification"), d.get("duration_years"),
                               None, None, "custom"))

# ── 2. JAMB offerings -> jamb_programmes, schools, school_programmes, subject reqs ──
def as_text(v):
    """utme_subjects is a string (pilot files) or an array (new brochures) -> TEXT."""
    if v is None: return None
    if isinstance(v, list): return ", ".join(str(t) for t in v) or None
    return v

# JAMB-nuance skills profile (Step 3): jamb_name -> unioned skills across component programmes
try:
    nuance = load("jamb/jamb_skills_nuance.json")
except FileNotFoundError:
    nuance = {}

def jsonb(v):
    if v is None: return "NULL"
    return "'" + json.dumps(v, ensure_ascii=False).replace("'", "''") + "'::jsonb"

_seen_jids = set()
def ingest_offerings(path, faculty, degree):
    d = load(path)
    for pr in d["programmes"]:
        jname = pr["jamb_name"]
        jid = uid("jamb", jname)
        if jid in _seen_jids:   # same JAMB name can appear in two brochures; keep first
            continue
        _seen_jids.add(jid)
        nz = nuance.get(jname)
        skt = nz["skills_profile_technical"] if nz else None
        skx = nz["skills_profile_transferable"] if nz else None
        skc = nz["components"] if nz else None
        blend = bool(nz["is_blend"]) if nz else False
        rows["jamb_programmes"].append((jid, jname, faculty, degree, skt, skx, skc, blend))
        rows["programme_subject_requirements"].append(
            (uid("psr", jname), jid, as_text(pr.get("utme_subjects")),
             pr.get("olevel_requirement"), pr.get("direct_entry")))
        # per-institution waiver notes — handle both shapes:
        #   old: {"institutions":[codes...], "note":...}   new: {"institution":code, "note":...}
        waiver_by_code = {}
        for w in pr.get("institution_waivers", []):
            codes = w.get("institutions") or ([w["institution"]] if w.get("institution") else [])
            for c in codes:
                nc = norm_code(c)
                if nc: waiver_by_code.setdefault(nc, []).append(w.get("note", ""))
        for inst in pr.get("institutions", []):
            nc = norm_code(inst)
            if not nc: continue
            sid = uid("school", nc)
            rows["schools"].setdefault(nc, sid)
            remarks = " | ".join(x for x in waiver_by_code.get(nc, []) if x) or None
            rows["school_programmes"].append((uid("sp", nc, jname), sid, jid, remarks))

ingest_offerings("jamb/law_offerings.json", "Law", "LLB")
ingest_offerings("jamb/social_management_offerings.json", "Social/Management Sciences", "B.Sc")
ingest_offerings("jamb/administration_offerings.json", "Administration", "B.Sc/B.A")
ingest_offerings("jamb/sciences_offerings.json", "Sciences", "B.Sc/B.Tech")
ingest_offerings("jamb/medical_offerings.json", "Medical/Pharmaceutical/Health", "Various")
ingest_offerings("jamb/agriculture_offerings.json", "Agriculture", "B.Agric")
ingest_offerings("jamb/arts_hum_offerings.json", "Arts and Humanities", "B.A")
ingest_offerings("jamb/engineering_offerings.json", "Engineering/Environmental/Technology", "B.Eng/B.Tech")
ingest_offerings("jamb/education_offerings.json", "Education", "B.Ed")

# ── 2b. jamb/enrich overlay — richer per-programme requirements ─
# 101 per-programme files (medical/agriculture/education/engineering/arts_hum)
# extracted straight from the brochures; they supersede the coarser offerings
# fields for the same jamb_name. Same row id (uid("psr", jname)) -> replace.
import glob as _g2
_psr_ix = {r[0]: i for i, r in enumerate(rows["programme_subject_requirements"])}
_enrich_applied = _enrich_skipped = 0
for f in sorted(_g2.glob(os.path.join(HERE, "jamb", "enrich", "*.json"))):
    if os.path.basename(f).startswith("_"):
        continue
    e = json.load(open(f, encoding="utf-8"))
    jname = e.get("jamb_name")
    if not jname:
        continue
    jid = uid("jamb", jname)
    if jid not in _seen_jids:
        _enrich_skipped += 1  # programme not in any offerings file — nothing to attach to
        continue
    row = (uid("psr", jname), jid, as_text(e.get("utme_subjects")),
           e.get("olevel_requirement"), e.get("direct_entry"))
    i = _psr_ix.get(row[0])
    if i is not None:
        rows["programme_subject_requirements"][i] = row
    else:
        rows["programme_subject_requirements"].append(row)
    _enrich_applied += 1
print(f"jamb/enrich overlay: {_enrich_applied} applied, {_enrich_skipped} skipped (no offerings entry)")

# ── 3. programme_mapping (bridge) ───────────────────────────────
pm = load("programme_mapping.json")
custom_link = {"Intelligence and Security Studies": "Intelligence and Security Studies",
               "Social Justice": "Social Justice", "Anthropology": "Anthropology"}
seen_jids = set()
for x in pm["mappings"]:
    jname = x["jamb_name"]; jid = uid("jamb", jname)
    if jid in seen_jids:   # programme_mapping has UNIQUE(jamb_programme_id)
        continue
    seen_jids.add(jid)
    pid = None
    disc = x.get("ccmas_discipline")
    # 1) most precise: (discipline, name) — REQUIRED where a code is non-unique
    #    within a discipline (Engineering 'GET' spans 30 programmes).
    if x.get("ccmas_name") and disc:
        pid = prog_id_by_disc_name.get((disc, x["ccmas_name"]))
    # 2) (discipline, code) — fine where code is unique in the discipline
    if pid is None and x.get("ccmas_code") and disc:
        pid = prog_id_by_disc_code.get((disc, x["ccmas_code"]))
    # 3) code-only (legacy pilot rows; their codes are globally unique)
    if pid is None and x.get("ccmas_code"):
        pid = prog_id_by_code.get(x["ccmas_code"])
    if pid is None and jname in custom_link:
        pid = prog_id_by_name.get(custom_link[jname])
    rows["programme_mapping"].append(
        (uid("pm", jname), jid, pid, x["mapping_type"], x.get("mapping_note")))

# ── emit SQL ────────────────────────────────────────────────────
out = ["-- AUTO-GENERATED by data/career-mapping/_gen_seed.py — DO NOT EDIT BY HAND",
       "-- Idempotent seed for the Law + Social Sciences career-mapping pilot.",
       "-- Run AFTER migration_career_intelligence.sql + migration_career_pilot.sql",
       "SET search_path TO skillup_dev;", "BEGIN;", ""]

def emit(table, cols, vals, conflict="id", updates=None):
    if not vals: return
    out.append(f"-- {table}: {len(vals)} rows")
    collist = ", ".join(cols)
    upd = updates or [c for c in cols if c != "id"]
    setclause = ", ".join(f"{c}=EXCLUDED.{c}" for c in upd)
    CH = 200
    for i in range(0, len(vals), CH):
        chunk = vals[i:i+CH]
        out.append(f"INSERT INTO {table} ({collist}) VALUES")
        out.append(",\n".join("  (" + ", ".join(v) + ")" for v in chunk))
        out.append(f"ON CONFLICT ({conflict}) DO UPDATE SET {setclause};")
    out.append("")

emit("programmes",
     ["id","name","display_name","institution_type","discipline","qualification","duration_years","ccmas_discipline","ccmas_programme_code","mapping_source"],
     [[q(a),q(b),q(c),q(d),q(e),q(f),(str(g) if g is not None else "NULL"),q(h),q(i),q(j)]
      for (a,b,c,d,e,f,g,h,i,j) in rows["programmes"]])

emit("schools",
     ["id","name","institution_type","ibass_verified","jamb_code"],
     [[q(sid),q(code),q("university"),"true",q(code)] for code,sid in sorted(rows["schools"].items())])

emit("jamb_programmes",
     ["id","jamb_name","jamb_faculty","degree_type","skills_technical","skills_transferable","skills_components","is_blend"],
     [[q(a),q(b),q(c),q(d),jsonb(e),jsonb(f),jsonb(g),("true" if h else "false")]
      for (a,b,c,d,e,f,g,h) in rows["jamb_programmes"]])

emit("programme_mapping",
     ["id","jamb_programme_id","programme_id","mapping_type","mapping_note"],
     [[q(a),q(b),(q(c) if c else "NULL"),q(d),q(e)] for (a,b,c,d,e) in rows["programme_mapping"]])

emit("programme_subject_requirements",
     ["id","jamb_programme_id","utme_subjects","olevel_requirement","direct_entry"],
     [[q(a),q(b),q(c),q(d),q(e)] for (a,b,c,d,e) in rows["programme_subject_requirements"]])

emit("school_programmes",
     ["id","school_id","jamb_programme_id","remarks"],
     [[q(a),q(b),q(c),q(d)] for (a,b,c,d) in rows["school_programmes"]])

out += ["COMMIT;"]
open(os.path.join(HERE, "..", "..", "backend", "seed_career_pilot.sql"), "w", encoding="utf-8").write("\n".join(out))

print("seed_career_pilot.sql generated:")
print(f"  programmes:                    {len(rows['programmes'])} (ccmas {len(prog_id_by_code)} + custom {len(prog_id_by_name)})")
print(f"  schools (distinct, normalized): {len(rows['schools'])}")
print(f"  jamb_programmes:               {len(rows['jamb_programmes'])}")
print(f"  programme_mapping:             {len(rows['programme_mapping'])}")
print(f"  programme_subject_requirements:{len(rows['programme_subject_requirements'])}")
print(f"  school_programmes (offerings): {len(rows['school_programmes'])}")
linked = sum(1 for _,_,c,_,_ in rows["programme_mapping"] if c)
print(f"  mappings linked to a programme: {linked}/{len(rows['programme_mapping'])}")
