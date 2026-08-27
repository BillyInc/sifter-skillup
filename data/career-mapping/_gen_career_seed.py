#!/usr/bin/env python3
"""Generate backend/seed_career_v2.sql — the POST-SWEEP career taxonomy seed.
Idempotent: deterministic uuid5 ids + ON CONFLICT (id) DO UPDATE.
Emits: domains, domain_subgroups, domain_roles, domain_tools,
domain_certifications, computational role-subgroup links,
programme_domain, programme_role_score, jamb_programme_domain,
domain_overlap.
Programme-id resolution mirrors _gen_seed.py (uuid5 over (discipline,name)).
Run AFTER migration_career_v2.sql (+ the pilot seed for programmes/jamb rows)."""
import json, re, uuid, os, glob, math
from collections import Counter, defaultdict

from _role_overlay_loader import load_overlay_roles

HERE = os.path.dirname(os.path.abspath(__file__))
SEED_OUTPUT_PATH = os.environ.get("CAREER_SEED_OUTPUT_PATH") or os.path.join(HERE, "..", "..", "backend", "seed_career_v2.sql")
NS = uuid.UUID("5c1f7e00-0000-4000-8000-0000ca4ee401")  # SAME namespace as _gen_seed.py
def uid(*parts): return str(uuid.uuid5(NS, "|".join(parts)))
def q(s):
    if s is None: return "NULL"
    return "'" + str(s).replace("'", "''") + "'"
def json_safe(value):
    if isinstance(value, float) and math.isnan(value):
        return None
    if isinstance(value, list):
        return [json_safe(item) for item in value]
    if isinstance(value, dict):
        return {key: json_safe(item) for key, item in value.items()}
    return value
def jsonb(v):
    if v is None: return "'[]'::jsonb"
    return "'" + json.dumps(json_safe(v), ensure_ascii=False, allow_nan=False).replace("'", "''") + "'::jsonb"
def arr(xs):
    if not xs: return "'{}'"
    # build the Postgres array literal, then double single-quotes for the enclosing SQL string
    inner = ",".join('"' + str(x).replace("\\","\\\\").replace('"','\\"') + '"' for x in xs)
    return "'" + ("{" + inner + "}").replace("'", "''") + "'"
def numornull(v): return str(v) if v is not None else "NULL"
def boolsql(v): return "true" if v else "false"
def load(p): return json.load(open(os.path.join(HERE, p), encoding="utf-8"))

# ── programme-id resolution (mirror _gen_seed.py) ───────────────
prog_id_by_disc_name = {}
for f in sorted(glob.glob(os.path.join(HERE, "ccmas", "*.json"))):
    d = json.load(open(f, encoding="utf-8"))
    disc = d["discipline"]
    for p in d["programmes"]:
        prog_id_by_disc_name[(disc, p["name"])] = uid("programme", "ccmas", disc, p["name"])
for f in sorted(glob.glob(os.path.join(HERE, "enrichment", "*.json"))):
    try:
        d = load(f)
        prog_id_by_disc_name[("__custom__", d["programme"])] = uid("programme", "custom", d["programme"])
    except FileNotFoundError:
        pass
def resolve_programme(disc, name):
    pid = prog_id_by_disc_name.get((disc, name))
    if pid: return pid
    return prog_id_by_disc_name.get(("__custom__", name))

# ── load taxonomy sources ───────────────────────────────────────
meta   = load("domain_meta.json")
struct = load("domain_structure.json")
tools  = load("domain_tools.json")
scope_audit = load("domain_skill_competency_certification_audit.json")
# The cleaned library is the canonical 4,698-key role source. The older v3
# file omitted source-backed O*NET/ESCO roles and is no longer used for seed
# ownership.
roles  = load("role_library_v3_cleaned.json")
roles.extend(load_overlay_roles())
role_tools = load("role_tools.json") if os.path.exists(os.path.join(HERE, "role_tools.json")) else {}
layer_provenance = load("domain_skill_provenance.json") if os.path.exists(os.path.join(HERE, "domain_skill_provenance.json")) else {}
roles_by_key = {}
for _role in roles:
    roles_by_key[f'{_role.get("domain_id")}|{_role.get("role_name")}'] = _role
roles = list(roles_by_key.values())
role_count_by_domain = Counter(str(role.get("domain_id")) for role in roles)
role_count_by_subgroup = Counter(
    (str(role.get("domain_id")), str(role.get("isco_group"))[:2])
    for role in roles
    if role.get("domain_id") and role.get("isco_group") is not None
)

def skill_values(value):
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [part.strip() for part in str(value or "").split("|") if part.strip()]

def alias_values(value):
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip() and str(item).lower() != "nan"]
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return []
    return [part.strip() for part in re.split(r"[;|·•]", str(value)) if part.strip() and part.strip().lower() != "nan"]
prog_dom = load("programme_domain_final.json")
jamb_dom = load("jamb_domain_map.json")
scores = load("programme_role_scores.json")
cross_domain_families = load("cross_domain_role_families.json") if os.path.exists(os.path.join(HERE, "cross_domain_role_families.json")) else {"families": []}
computational_links = load("computational_role_subgroup_links.json") if os.path.exists(os.path.join(HERE, "computational_role_subgroup_links.json")) else {"links": []}
computational_methods = load("computational_method_evidence.json") if os.path.exists(os.path.join(HERE, "computational_method_evidence.json")) else {"methods": []}

# The source-backed resource audit is the authoritative user-facing scope.
# Do not re-derive visibility from current programme/JAMB reachability: a
# valid domain may be resource-backed before a programme bridge reaches it.
# This keeps the career taxonomy and resource seed on the same FK-safe domain
# denominator (160 visible domains, eight explicitly hidden IDs).
HIDDEN = set(scope_audit.get("scope", {}).get("hidden_domains_excluded", []))
def dom_uid(dk): return uid("domain", dk)
def sg_uid(dk, sm): return uid("subgroup", dk, str(sm))

# Every (domain_key, isco_submajor) pair that section 2 will actually emit as a
# domain_subgroups row. The computational layers reference subgroups by ISCO
# sub-major rather than by id, and sg_uid() will happily mint a deterministic
# uuid5 for a pair that has no subgroup row behind it. That is not a generator
# error -- it is a foreign-key violation discovered much later, at load time,
# against a table the seed itself populates. D078 and D056 currently carry
# computational evidence while having no subgroups at all in
# domain_structure.json, which is how four link rows and four method rows came
# to reference three subgroup ids that the seed never creates.
VALID_SG = {
    (dk, str(sg["isco_submajor"]))
    for dk, st in struct.items() if dk not in HIDDEN
    for sg in st.get("subgroups", [])
}
# Collected rather than silently dropped: a missing subgroup means the evidence
# file and domain_structure.json disagree, and that belongs in front of whoever
# owns the data, not buried in a diff of row counts.
computational_skipped = []

R = defaultdict(list)  # table -> list[list[str sql-literals]]

# Cross-domain role families are a relationship layer over the existing
# domain-scoped role rows. They let search/detail surfaces explain that a role
# can be reached from several domains without copying skills or tools.
for family in cross_domain_families.get("families") or []:
    family_key = str(family.get("family_key") or "")
    if not family_key:
        continue
    family_id = uid("role_family", family_key)
    R["career_role_families"].append([
        q(family_id), q(family_key), q(family.get("canonical_name")),
        q(family.get("primary_domain_key")), arr(family.get("aliases", [])),
        q(family.get("source_confidence") or "unsourced"),
        q(family.get("data_state") or "partial"),
        jsonb(family.get("source_provenance") or {}),
        jsonb(family.get("nigerian_context") or {}),
    ])
    for link in family.get("domain_links") or []:
        domain_key = str(link.get("domain_key") or "")
        if not domain_key or domain_key in HIDDEN:
            continue
        R["career_role_family_domains"].append([
            q(uid("role_family_domain", family_key, domain_key)), q(family_id),
            q(dom_uid(domain_key)), q(domain_key), q(link.get("relationship") or "associated"),
            jsonb({"source_provenance": family.get("source_provenance") or {}, "nigerian_context": family.get("nigerian_context") or {}}),
        ])
    for alias in family.get("aliases") or []:
        alias_text = str(alias).strip()
        if not alias_text:
            continue
        R["career_role_family_aliases"].append([
            q(uid("role_family_alias", family_key, alias_text.lower())), q(family_id),
            q(alias_text), q(re.sub(r"[^a-z0-9]+", " ", alias_text.lower()).strip()),
        ])
    for member in family.get("members") or []:
        role_key = str(member.get("role_key") or "")
        domain_key = str(member.get("domain_key") or "")
        if not role_key or not domain_key or domain_key in HIDDEN:
            continue
        R["career_role_family_members"].append([
            q(uid("role_family_member", family_key, role_key)), q(family_id),
            q(role_key), q(dom_uid(domain_key)), q(domain_key),
            q(member.get("match_basis") or "source_backed"),
        ])

# Computational practice can cross the primary occupational subgroup without
# changing the role's source-backed primary assignment. This is especially
# important for social-science roles such as sociologist and behavioural
# scientist, whose source evidence includes quantitative research methods.
for link in computational_links.get("links") or []:
    role_key = str(link.get("role_key") or "")
    domain_key = str(link.get("domain_id") or role_key.split("|", 1)[0])
    subgroup_key = str(link.get("subgroup_isco_submajor") or "")
    if not role_key or not domain_key or not subgroup_key or domain_key in HIDDEN:
        continue
    if (domain_key, subgroup_key) not in VALID_SG:
        computational_skipped.append(
            ("computational_role_subgroup_links", domain_key, subgroup_key, role_key))
        continue
    R["computational_role_subgroup_links"].append([
        q(uid("computational_role_subgroup", role_key, subgroup_key)),
        q(uid("role", role_key)), q(dom_uid(domain_key)),
        q(sg_uid(domain_key, subgroup_key)), q(role_key),
        q(link.get("relationship") or "related"),
        jsonb(link.get("evidence_skills") or []),
        jsonb(link.get("source_provenance") or {}),
    ])

# Method evidence is deliberately classified separately from demonstrated
# competence. For example, ESCO labels social network analysis and game theory
# as knowledge. The API can therefore explain the method without claiming that
# a learner has already mastered it.
for method in computational_methods.get("methods") or []:
    domain_key = str(method.get("domain_id") or "")
    subgroup_key = str(method.get("isco_submajor") or "")
    method_name = str(method.get("name") or "").strip()
    if not domain_key or not subgroup_key or not method_name or domain_key in HIDDEN:
        continue
    if (domain_key, subgroup_key) not in VALID_SG:
        computational_skipped.append(
            ("computational_method_evidence", domain_key, subgroup_key, method_name))
        continue
    R["computational_method_evidence"].append([
        q(uid("computational_method", domain_key, subgroup_key, method_name.lower())),
        q(dom_uid(domain_key)), q(sg_uid(domain_key, subgroup_key)), q(method_name),
        q(method.get("skill_type") or "unknown"), q("not_demonstrated"),
        q(method.get("esco_id")), q(method.get("description")),
        jsonb(method.get("evidence_roles") or []),
        jsonb({"sources": [method.get("source") or "global_esco"], "mapping_method": "exact ESCO skill"}),
        q(method.get("data_state") or "source_backed"),
    ])

# ── 1. domains ──────────────────────────────────────────────────
for dk, m in meta.items():
    if dk in HIDDEN: continue
    st = struct.get(dk, {})
    provenance = layer_provenance.get(dk, {})
    R["domains"].append([
        q(dom_uid(dk)), q(dk), q(m.get("domain_name")), q(m.get("cluster")),
        arr(m.get("clusters", [])), q(m.get("description")),
        arr(m.get("institution_type", [])), boolsql(m.get("elite_domain")),
        boolsql(m.get("excluded")), str(role_count_by_domain.get(dk, 0)),
        jsonb(st.get("foundation_skills", [])),
        q(provenance.get("source_confidence") or "unsourced"),
        q(provenance.get("data_state") or "partial"),
        jsonb(provenance.get("foundation_skills", {})),
        jsonb(provenance.get("nigerian_context") or {})])

# ── 2. domain_subgroups ─────────────────────────────────────────
for dk, st in struct.items():
    if dk in HIDDEN: continue
    for sg in st.get("subgroups", []):
        subgroup_provenance = (layer_provenance.get(dk, {}).get("subgroups") or {}).get(str(sg["isco_submajor"]), {})
        R["domain_subgroups"].append([
            q(sg_uid(dk, sg["isco_submajor"])), q(dom_uid(dk)),
            q(str(sg["isco_submajor"])), q(sg.get("label")), q(sg.get("description")),
            q(sg.get("raw_isco_label")), str(role_count_by_subgroup.get((dk, str(sg["isco_submajor"])), 0)),
            jsonb(sg.get("cluster_skills", [])),
            q(subgroup_provenance.get("source_confidence") or "unsourced"),
            q(subgroup_provenance.get("data_state") or "partial"),
            jsonb(subgroup_provenance.get("skills", {})),
            jsonb(subgroup_provenance.get("nigerian_context") or {})])

# ── 3. domain_roles (role rows; role_key = domain_key|role_name) ─
# map (domain, isco_submajor) -> subgroup uuid for FK
sg_by = {}
for dk, st in struct.items():
    for sg in st.get("subgroups", []):
        sg_by[(dk, str(sg["isco_submajor"]))] = sg_uid(dk, sg["isco_submajor"])
for r in roles:
    dk = r["domain_id"]
    if dk not in meta or dk in HIDDEN: continue
    rk = f'{dk}|{r["role_name"]}'
    sm = str(r.get("isco_group", ""))[:2]
    sgid = sg_by.get((dk, sm))
    aka = alias_values(r.get("also_known_as"))
    source_entry = role_tools.get(rk, {})
    esco_entry = source_entry.get("esco") or {}
    onet_entry = source_entry.get("onet") or {}
    role_source_confidence = source_entry.get("source_confidence") or "unsourced"
    role_data_state = source_entry.get("data_state") or "unsourced"
    R["domain_roles"].append([
        q(uid("role", rk)), q(dom_uid(dk)), (q(sgid) if sgid else "NULL"),
        q(rk), q(r["role_name"]), arr(aka), q(r.get("tier")),
        q(str(r.get("isco_group") or "")), q(r.get("esco_code")),
        q(r.get("elite_status") or "deferred"),
        jsonb(r.get("essential_skills", [])), jsonb(r.get("optional_skills", [])),
        arr(esco_entry.get("occupation_uris", [])), q(role_source_confidence),
        q(role_data_state), arr(onet_entry.get("occupation_codes", [])),
        jsonb(onet_entry.get("essential_skills", [])), jsonb({
            "socs": source_entry.get("socs", []),
            "esco_occupation_uris": esco_entry.get("occupation_uris", []),
            "onet_occupation_codes": onet_entry.get("occupation_codes", []),
            "framework": source_entry.get("source_provenance") or {},
            "nigerian_context": source_entry.get("nigerian_context") or {},
            "sources": [source for source in (
                "esco" if esco_entry.get("occupation_uris") else None,
                "onet" if onet_entry.get("essential_skills") or any(t.get("source") == "onet" for t in source_entry.get("tools") or []) else None,
                "framework" if source_entry.get("source_provenance") else None,
                ) if source],
        }), jsonb(source_entry.get("nigerian_context") or {})])

# ── 4. domain_tools (domain + subgroup scope, distinctive+common) ─
def tool_rows(dk, entry, scope, sgid):
    for grp in ("distinctive_tools", "common_tools", "distinctive", "common"):
        pass
# leakage drop-list from _audit_tools_leakage.py (cross-domain SOC artifacts)
_drop_path = os.path.join(HERE, "_audit", "tools_leakage_drop.json")
DROPPED_TOOLS = set()
if os.path.exists(_drop_path):
    for d in json.load(open(_drop_path, encoding="utf-8")):
        DROPPED_TOOLS.add((d["domain"], d.get("isco_submajor"), d["tool"].lower()))
    print(f"tools leakage drop-list: {len(DROPPED_TOOLS)} entries")

ti = 0
for dk, tv in tools.items():
    if dk == "_meta" or dk in HIDDEN: continue
    for grp_key, grp_name in [("distinctive_tools","distinctive"),("common_tools","common")]:
        for t in tv.get(grp_key, []):
            if (dk, None, t["tool"].lower()) in DROPPED_TOOLS: continue
            ti += 1
            R["domain_tools"].append([
                q(uid("tool", dk, "d", grp_name, t["tool"])), q(dom_uid(dk)), "NULL",
                q("domain"), q(t["tool"]), q(grp_name),
                numornull(t.get("role_freq")), numornull(t.get("score")),
                boolsql(t.get("hot")), boolsql(t.get("in_demand")), q(t.get("source") or "onet"),
                "NULL", q(t.get("element_name")), q(t.get("element_id")),
                q(t.get("source_confidence") or "unsourced"), q(t.get("data_state") or "unsourced"),
                jsonb(t.get("provenance") or {})])
    for sm, sgt in (tv.get("subgroup_tools") or {}).items():
        sgid = sg_by.get((dk, str(sm)))
        if not sgid: continue
        for grp_name in ("distinctive","common"):
            for t in sgt.get(grp_name, []):
                if (dk, str(sm), t["tool"].lower()) in DROPPED_TOOLS: continue
                ti += 1
                R["domain_tools"].append([
                    q(uid("tool", dk, sm, grp_name, t["tool"])), q(dom_uid(dk)), q(sgid),
                    q("subgroup"), q(t["tool"]), q(grp_name),
                    numornull(t.get("role_freq")), numornull(t.get("score")),
                    boolsql(t.get("hot")), boolsql(t.get("in_demand")), q(t.get("source") or "onet"),
                    "NULL", q(t.get("element_name")), q(t.get("element_id")),
                    q(t.get("source_confidence") or "unsourced"), q(t.get("data_state") or "unsourced"),
                    jsonb(t.get("provenance") or {})])

# ── 4b. role-level tools (L3T) from role_tools.json, if built ────
# Emitted as scope='role' rows (requires migration_role_tools.sql).
rt_path = os.path.join(HERE, "role_tools.json")
role_tools_n = 0
if os.path.exists(rt_path):
    role_tools = json.load(open(rt_path, encoding="utf-8"))
    for rk, ent in role_tools.items():
        if rk == "_meta":
            continue
        dk = rk.split("|", 1)[0]
        if dk not in meta or dk in HIDDEN: continue
        rid = uid("role", rk)
        for t in ent.get("tools", []):
            role_tools_n += 1
            grp = "distinctive" if (t.get("hot") or t.get("in_demand")) else "common"
            R["domain_tools"].append([
                q(uid("tool", dk, "r", rk, t["tool"])), q(dom_uid(dk)), "NULL",
                q("role"), q(t["tool"]), q(grp),
                "NULL", "NULL",
                boolsql(t.get("hot")), boolsql(t.get("in_demand")), q(t.get("source") or "onet"),
                q(rid), q(t.get("element_name")), q(t.get("element_id")),
                q(t.get("source_confidence") or "unsourced"), q(t.get("data_state") or "unsourced"),
                jsonb({"soc_codes": ent.get("socs", []), "source": t.get("source") or "onet"})])
else:
    print("note: role_tools.json not found — L3T rows skipped (run _build_role_tools.py first)")

# ── 5. domain_certifications (gateway/subgroup/role_hint split) ──
ci = 0
for dk, st in struct.items():
    if dk in HIDDEN: continue
    for c in st.get("gateway_certifications", []):
        ci += 1
        R["domain_certifications"].append([
            q(uid("cert", dk, "gw", str(ci), c["name"])), q(dom_uid(dk)), "NULL",
            q("gateway"), q(c["name"]), q(c.get("body")), q(c.get("region")),
            q(c.get("level")), q(c.get("gate_reason"))])
    for c in st.get("role_hint_certifications", []):
        ci += 1
        R["domain_certifications"].append([
            q(uid("cert", dk, "rh", str(ci), c["name"])), q(dom_uid(dk)), "NULL",
            q("role_hint"), q(c["name"]), q(c.get("body")), q(c.get("region")),
            q(c.get("level")), q(c.get("gate_reason"))])
    for sg in st.get("subgroups", []):
        sgid = sg_uid(dk, sg["isco_submajor"])
        for c in sg.get("certifications", []):
            ci += 1
            R["domain_certifications"].append([
                q(uid("cert", dk, str(sg["isco_submajor"]), str(ci), c["name"])),
                q(dom_uid(dk)), q(sgid), q("subgroup"), q(c["name"]), q(c.get("body")),
                q(c.get("region")), q(c.get("level")), q(c.get("gate_reason"))])

# ── 6. programme_domain ─────────────────────────────────────────
pd_unresolved = 0
for key, v in prog_dom.items():
    disc, name = key.split("::", 1)
    pid = resolve_programme(disc, name)
    if not pid: pd_unresolved += 1; continue
    links = v["links"] if isinstance(v, dict) and "links" in v else v
    for l in links:
        dk = l["domain_id"]
        if dk not in meta or dk in HIDDEN: continue
        R["programme_domain"].append([
            q(uid("pd", pid, dk)), q(pid), q(dom_uid(dk)), q(l.get("match_type"))])

# ── 7. programme_role_score ─────────────────────────────────────
prs = 0
for key, v in scores.items():
    disc, name = key.split("::", 1)
    pid = resolve_programme(disc, name)
    if not pid: continue
    for d in v["domains"]:
        dk = d["domain_id"]
        if dk not in meta or dk in HIDDEN: continue
        for r in d["roles"]:
            rk = f'{dk}|{r["role"]}'
            prs += 1
            R["programme_role_score"].append([
                q(uid("prs", pid, rk)), q(pid), q(dom_uid(dk)), q(rk), q(r["role"]),
                q(r["label"]), numornull(r.get("coverage")), q(r.get("tier")),
                q(r.get("sub_group")), jsonb(r.get("bridge_skills", []))])

# ── 8. jamb_programme_domain ────────────────────────────────────
for jname, ent in jamb_dom.items():
    for l in ent.get("links", []):
        dk = l["domain_id"]
        if dk not in meta or dk in HIDDEN: continue
        R["jamb_programme_domain"].append([
            q(uid("jpd", jname, dk)), q(jname), q(dom_uid(dk)), q(l.get("match_type"))])

# ── 9. domain_overlap (transferable-skill pivot matrix) ─────────
# Only 60/168 domains have ≥50% foundation_skills, too sparse for a pivot matrix.
# Use the RICHER per-domain skill SET = union of every role's essential_skills in
# the domain (skill-phrase level, not token). Overlap(A→B) = |A∩B| / |B| = how much
# of target B's skill base the mover from A already has. Exclude the excluded domain.
STOP = set("and or the of for to in a an with on at by".split())
dom_skills = defaultdict(set)
for r in roles:
    dk = r["domain_id"]
    if dk in HIDDEN or dk not in meta: continue
    for s in skill_values(r.get("essential_skills", [])):
        dom_skills[dk].add(s.strip().lower())
# down-weight ubiquitous skills (in >40% of domains) so overlap reflects DISTINCTIVE transfer
ND = len(dom_skills) or 1
skill_df = Counter()
for dk, ss in dom_skills.items():
    for s in ss: skill_df[s] += 1
UBIQ = {s for s, c in skill_df.items() if c / ND > 0.40}
dom_sig = {dk: (ss - UBIQ) or ss for dk, ss in dom_skills.items()}  # keep something if all ubiquitous
TOPN = 25
for a, sa in dom_sig.items():
    if not sa: continue
    sims = []
    for b, sb in dom_sig.items():
        if a == b or not sb: continue
        inter = sa & sb
        if not inter: continue
        cov = len(inter) / len(sb)
        sims.append((cov, len(inter), b, sorted(inter)[:8]))
    sims.sort(reverse=True)
    for cov, ninter, b, shared in sims[:TOPN]:
        R["domain_overlap"].append([
            q(uid("ov", a, b)), q(dom_uid(a)), q(dom_uid(b)),
            f"{cov:.4f}", jsonb(shared)])

# ── emit SQL ────────────────────────────────────────────────────
preview_marker = "-- DEVELOPMENT PREVIEW: unresolved Nigerian evidence may remain; do not apply as the production seed." if os.environ.get("CAREER_SEED_OUTPUT_PATH") else ""
out = ["-- AUTO-GENERATED by data/career-mapping/_gen_career_seed.py — DO NOT EDIT",
       preview_marker,
       "-- Post-sweep career taxonomy seed. Run AFTER migration_career_v2.sql",
       "-- (+ migration_role_tools.sql for the role-scoped tool rows).",
       "SET search_path TO skillup_dev;", "BEGIN;", ""]

# leaked tools: previously-seeded rows must be DELETEd, not just skipped
# (upserts never remove). Ids are deterministic, so target them directly.
if DROPPED_TOOLS:
    ids = []
    for dk, sm, tool_lower in DROPPED_TOOLS:
        # regenerate the same ids used at emission time (original casing needed)
        pass
    # resolve original casing from domain_tools.json
    _dj = tools
    for dk, sm, tool_lower in DROPPED_TOOLS:
        tv = _dj.get(dk) or {}
        if sm is None:
            for grp_key, grp_name in [("distinctive_tools", "distinctive"), ("common_tools", "common")]:
                for t in tv.get(grp_key, []):
                    if t["tool"].lower() == tool_lower:
                        ids.append(uid("tool", dk, "d", grp_name, t["tool"]))
        else:
            sgt = (tv.get("subgroup_tools") or {}).get(sm) or (tv.get("subgroup_tools") or {}).get(str(sm)) or {}
            for grp_name in ("distinctive", "common"):
                for t in sgt.get(grp_name, []):
                    if t["tool"].lower() == tool_lower:
                        ids.append(uid("tool", dk, sm, grp_name, t["tool"]))
    if ids:
        out.append(f"-- leakage cleanup: {len(ids)} previously-seeded leaked tool rows")
        for i in range(0, len(ids), 200):
            out.append("DELETE FROM domain_tools WHERE id IN (" +
                       ", ".join(q(x) for x in ids[i:i+200]) + ");")
        out.append("")

# university-pipeline scope: remove hidden domains if previously seeded
# (FK cascades clean subgroups/roles/tools/certs/links/overlap/demand rows).
if HIDDEN:
    out.append(f"-- hidden domains (excluded or unreachable from CCMAS/JAMB): {', '.join(sorted(HIDDEN))}")
    out.append("DELETE FROM jamb_programme_domain WHERE domain_id IN (" +
               ", ".join(q(dom_uid(d)) for d in sorted(HIDDEN)) + ");")
    out.append("DELETE FROM domains WHERE id IN (" +
               ", ".join(q(dom_uid(d)) for d in sorted(HIDDEN)) + ");")
    out.append("")

duplicate_ids_dropped = {}

def emit(table, cols, vals, conflict="id"):
    if not vals: out.append(f"-- {table}: 0 rows"); return
    collist = ", ".join(cols)
    upd = ", ".join(f"{c}=EXCLUDED.{c}" for c in cols if c != "id")
    CH = 200
    # Rows are chunked into separate INSERT statements, so a repeated id used to
    # survive: each statement is its own command and the later one simply
    # upserts over the earlier via ON CONFLICT DO UPDATE. That only holds while
    # the duplicates happen to straddle a chunk boundary. Any consumer that
    # batches differently -- a bulk loader, PostgREST, a wider CH -- collapses
    # them into ONE command and postgres rejects the whole thing with
    # "ON CONFLICT DO UPDATE command cannot affect row a second time".
    # Deduplicate here, keeping the LAST occurrence, which is exactly what the
    # sequential upserts resolved to.
    if conflict in cols:
        pos = cols.index(conflict)
        seen = {}
        for v in vals:
            seen[v[pos]] = v
        if len(seen) != len(vals):
            duplicate_ids_dropped[table] = len(vals) - len(seen)
            vals = list(seen.values())
    out.append(f"-- {table}: {len(vals)} rows")
    for i in range(0, len(vals), CH):
        chunk = vals[i:i+CH]
        out.append(f"INSERT INTO {table} ({collist}) VALUES")
        out.append(",\n".join("  (" + ", ".join(v) + ")" for v in chunk))
        out.append(f"ON CONFLICT ({conflict}) DO UPDATE SET {upd};")
    out.append("")

emit("domains", ["id","domain_key","name","cluster","clusters","description","institution_type","elite_domain","excluded","role_count","foundation_skills","source_confidence","data_state","foundation_skill_sources","nigerian_context"], R["domains"])
emit("domain_subgroups", ["id","domain_id","isco_submajor","label","description","raw_isco_label","role_count","cluster_skills","source_confidence","data_state","skill_sources","nigerian_context"], R["domain_subgroups"])
emit("domain_roles", ["id","domain_id","subgroup_id","role_key","role_name","also_known_as","tier","isco_group","esco_code","elite_status","essential_skills","optional_skills","esco_occupation_uris","source_confidence","data_state","onet_occupation_codes","onet_essential_skills","source_provenance","nigerian_context"], R["domain_roles"])
emit("domain_tools", ["id","domain_id","subgroup_id","scope","tool_name","tool_group","role_freq","score","hot","in_demand","source","role_id","element_name","element_id","source_confidence","data_state","source_provenance"], R["domain_tools"])
emit("domain_certifications", ["id","domain_id","subgroup_id","placement","name","body","region","level","gate_reason"], R["domain_certifications"])
emit("computational_role_subgroup_links", ["id","role_id","domain_id","subgroup_id","role_key","relationship","evidence_skills","source_provenance"], R["computational_role_subgroup_links"])
emit("computational_method_evidence", ["id","domain_id","subgroup_id","method_name","classification","competence_status","esco_id","description","evidence_roles","source_provenance","data_state"], R["computational_method_evidence"])
emit("career_role_families", ["id","family_key","canonical_name","primary_domain_key","aliases","source_confidence","data_state","source_provenance","nigerian_context"], R["career_role_families"])
emit("career_role_family_domains", ["id","family_id","domain_id","domain_key","relationship","source_provenance"], R["career_role_family_domains"])
emit("career_role_family_aliases", ["id","family_id","alias","normalized_alias"], R["career_role_family_aliases"])
emit("career_role_family_members", ["id","family_id","role_key","domain_id","domain_key","match_basis"], R["career_role_family_members"])
emit("programme_domain", ["id","programme_id","domain_id","match_type"], R["programme_domain"])
emit("programme_role_score", ["id","programme_id","domain_id","role_key","role_name","label","coverage","tier","subgroup_label","bridge_skills"], R["programme_role_score"])
emit("jamb_programme_domain", ["id","jamb_name","domain_id","match_type"], R["jamb_programme_domain"])
emit("domain_overlap", ["id","domain_id_a","domain_id_b","overlap_score","shared_skills"], R["domain_overlap"])

out += ["COMMIT;"]
# Stream the generated statements instead of joining the full seed into one
# giant in-memory string. The career seed is intentionally large enough that
# the join can exceed the available process memory even when the rows are
# valid.
with open(SEED_OUTPUT_PATH, "w", encoding="utf-8") as seed_file:
    for line in out:
        seed_file.write(line)
        seed_file.write("\n")

print(f"{SEED_OUTPUT_PATH} generated:")
for t in ["domains","domain_subgroups","domain_roles","domain_tools","domain_certifications","computational_role_subgroup_links","computational_method_evidence","career_role_families","career_role_family_domains","career_role_family_aliases","career_role_family_members","programme_domain","programme_role_score","jamb_programme_domain","domain_overlap"]:
    print(f"  {t:26} {len(R[t])} rows")
print(f"  (programme_domain unresolved programmes: {pd_unresolved})")

for _t, _n in sorted(duplicate_ids_dropped.items()):
    print(f"  (dedup: {_t} had {_n} repeated id(s), kept the last of each)")

if computational_skipped:
    print()
    print(f"DATA DEFECT: {len(computational_skipped)} computational row(s) skipped -- they name a")
    print("(domain, isco_submajor) that has no subgroup in domain_structure.json, so emitting")
    print("them would violate the subgroup foreign key at load time. Fix the source data:")
    print("either give the domain the subgroup, or drop the evidence entry.")
    for table, dk, sm, ref in sorted(computational_skipped):
        have = sorted(sm2 for (dk2, sm2) in VALID_SG if dk2 == dk)
        print(f"  {table:34} {dk} isco_submajor={sm:<4} ref={ref!r}")
        print(f"    {dk} has subgroups: {have or 'NONE'}")
