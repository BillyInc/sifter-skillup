#!/usr/bin/env python3
"""Generate backend/seed_career_pilot.sql from the repo career-mapping JSON.
Idempotent: deterministic uuid5 ids + ON CONFLICT (id) DO UPDATE.
Scope: programmes (CCMAS canonical + custom enrichment), schools, jamb_programmes,
programme_mapping, school_programmes, programme_subject_requirements.
Does NOT touch programme_domain (domain phase)."""
import gzip, json, re, uuid, os

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
        "school_programmes": [], "school_programme_requirement_exceptions": [],
        "school_programme_subject_options": [], "school_programme_subject_option_items": [],
        "programme_subject_requirements": [], "jamb_programme_requirement_sources": []}
school_programme_by_id = {}

# ── 1. programmes: CCMAS canonical ──────────────────────────────
import glob as _glob
from _parse_local_subject_exceptions import parse_local_exception
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
for f in sorted(_glob.glob(os.path.join(HERE, "enrichment", "*.json"))):
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


def waiver_exam_type(note):
    """Classify raw university notes without pretending they are parsed rules.

    Mixed or ambiguous notes intentionally stay ``general``.  This is only a
    routing label for review; ``parse_status`` remains ``needs_review`` until a
    source-backed structured university rule is created.
    """
    text = (note or "").strip()
    if not text:
        return "general"
    has_utme = bool(re.search(r"\bUTME(?:\s+SUBJECTS?)?\b", text, re.I))
    has_olevel = bool(re.search(
        r"O.?LEVEL|O/L|SSC|SSCE|credit\s+pass|sittings?", text, re.I
    ))
    has_direct = bool(re.search(
        r"DIRECT\s+ENTRY|A.?LEVEL|IJMB|JUPEB|NCE|ND/HND|OND|HND", text, re.I
    ))
    if has_direct and not (has_utme or has_olevel):
        return "direct_entry"
    if has_utme and not has_olevel and not has_direct:
        return "utme"
    if has_olevel and not has_utme and not has_direct:
        return "olevel"
    return "general"

# JAMB-nuance skills profile (Step 3): jamb_name -> unioned skills across component programmes
try:
    nuance = load("jamb/jamb_skills_nuance.json")
except FileNotFoundError:
    nuance = {}

try:
    brochure_subject_overrides = load("jamb/brochure_subject_overrides.json")
except FileNotFoundError:
    brochure_subject_overrides = {}


def corrected_brochure_offering(pr):
    """Apply source-reviewed corrections before creating offering rows.

    The raw brochure extraction remains unchanged.  This overlay only moves
    institution-specific prose out of national fields or adds an institution
    that appears only in a special-consideration block.
    """
    override = brochure_subject_overrides.get(pr.get("jamb_name")) or {}
    if not override:
        return pr
    corrected = dict(pr)
    for field in override.get("clear_fields", []):
        corrected[field] = None
    for field in ("utme_subjects", "olevel_requirement", "direct_entry"):
        if override.get(field) is not None:
            corrected[field] = override[field]
    institutions = list(corrected.get("institutions") or [])
    for institution in override.get("add_institutions", []):
        if institution not in institutions:
            institutions.append(institution)
    if institutions:
        corrected["institutions"] = institutions
    waivers = list(corrected.get("institution_waivers") or [])
    excluded_waiver_institutions = {
        norm_code(code) for code in override.get("exclude_waiver_only_institutions", [])
    }
    if excluded_waiver_institutions:
        listed_institutions = {norm_code(code) for code in institutions}
        def waiver_is_excluded(waiver):
            waiver_codes = {
                norm_code(code)
                for code in (waiver.get("institutions") or [])
            }
            if waiver.get("institution"):
                waiver_codes.add(norm_code(waiver.get("institution")))
            return any(
                code in excluded_waiver_institutions and code not in listed_institutions
                for code in waiver_codes
            )
        corrected["institution_waivers"] = [
            waiver for waiver in waivers
            if not waiver_is_excluded(waiver)
        ]
        # A source-confirmed awarder exclusion must also suppress waiver-only
        # institution codes from the offering roster. Keep any waiver for an
        # institution still explicitly listed in the verified roster.
        waivers = corrected["institution_waivers"]
    for waiver in override.get("add_institution_waivers", []):
        if not any(
            existing.get("institution") == waiver.get("institution")
            and existing.get("note") == waiver.get("note")
            for existing in waivers
        ):
            waivers.append(waiver)
    if waivers:
        corrected["institution_waivers"] = waivers
    return corrected

def jsonb(v):
    if v is None: return "NULL"
    return "'" + json.dumps(v, ensure_ascii=False).replace("'", "''") + "'::jsonb"

_seen_jids = set()
def ingest_offerings(path, faculty, degree):
    d = load(path)
    for raw_pr in d["programmes"]:
        pr = corrected_brochure_offering(raw_pr)
        jname = pr["jamb_name"]
        jid = uid("jamb", jname)
        first_jamb_row = jid not in _seen_jids
        if first_jamb_row:
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
        # Some extracted brochure rows put the institution only in the waiver
        # column and omit it from the main institution list.  The waiver is
        # still evidence of a university-scoped offering, so retain that
        # offering instead of dropping its exception record.
        offering_institutions = list(pr.get("institutions", []))
        offering_institutions.extend(
            code for code in waiver_by_code if code not in offering_institutions
        )
        for inst in offering_institutions:
            nc = norm_code(inst)
            if not nc: continue
            sid = uid("school", nc)
            rows["schools"].setdefault(nc, sid)
            remarks = " | ".join(x for x in waiver_by_code.get(nc, []) if x) or None
            spid = uid("sp", nc, jname)
            if spid not in school_programme_by_id:
                # Keep the university-scoped brochure fields on the offering
                # row.  The old generator emitted only remarks, leaving these
                # schema columns NULL and making the programme screen fall
                # back to national requirements even when the offering row
                # had source-backed university text.
                school_programme_by_id[spid] = [
                    spid,
                    sid,
                    jid,
                    as_text(pr.get("utme_subjects")),
                    pr.get("olevel_requirement"),
                    pr.get("direct_entry"),
                    remarks,
                ]
            elif remarks:
                prior = school_programme_by_id[spid][6]
                existing = [part for part in (prior or "").split(" | ") if part]
                if remarks not in existing:
                    school_programme_by_id[spid][6] = " | ".join([*existing, remarks])
            for waiver_index, note in enumerate(waiver_by_code.get(nc, [])):
                note = (note or "").strip()
                if not note:
                    continue
                local_rule = parse_local_exception(note)
                exception_id = uid("spe", nc, jname, str(waiver_index), note)
                rows["school_programme_requirement_exceptions"].append(
                    (
                        exception_id,
                        spid,
                        sid,
                        jid,
                        waiver_exam_type(note),
                        note,
                        path.replace("\\", "/"),
                        f"{path}:{jname}:{nc}:{waiver_index}",
                        local_rule.get("status", "needs_review"),
                    )
                )
                if local_rule.get("status") == "parsed":
                    option_id = uid("school_subj_opt", exception_id)
                    rows["school_programme_subject_options"].append(
                        (
                            option_id,
                            exception_id,
                            spid,
                            sid,
                            jid,
                            local_rule["exam_type"],
                            local_rule["rule_scope"],
                            f"University {local_rule['exam_type'].upper()} rule",
                            local_rule["min_required"],
                            local_rule["rule_text"],
                            local_rule.get("condition_text"),
                            json.dumps(local_rule.get("pass_required_codes") or []),
                        )
                    )
                    group_index = 0
                    for part in local_rule["parts"]:
                        if part[0] == "required":
                            codes = [part[1]]
                            role = "required"
                            group_key = None
                            group_min = None
                            distinct_group = None
                        else:
                            _, group_min, codes, *tail = part
                            role = "one_of"
                            group_index += 1
                            group_key = f"group_{group_index}"
                            distinct_group = tail[0] if tail else None
                        for code in codes:
                            rows["school_programme_subject_option_items"].append(
                                (
                                    uid("school_subj_item", exception_id, group_key or "required", code),
                                    option_id,
                                    code,
                                    role,
                                    group_key,
                                    group_min,
                                    distinct_group,
                                )
                            )

ingest_offerings("jamb/law_offerings.json", "Law", "LLB")
ingest_offerings("jamb/social_management_offerings.json", "Social/Management Sciences", "B.Sc")
ingest_offerings("jamb/administration_offerings.json", "Administration", "B.Sc/B.A")
ingest_offerings("jamb/sciences_offerings.json", "Sciences", "B.Sc/B.Tech")
ingest_offerings("jamb/medical_offerings.json", "Medical/Pharmaceutical/Health", "Various")
ingest_offerings("jamb/agriculture_offerings.json", "Agriculture", "B.Agric")
ingest_offerings("jamb/arts_hum_offerings.json", "Arts and Humanities", "B.A")
ingest_offerings("jamb/engineering_offerings.json", "Engineering/Environmental/Technology", "B.Eng/B.Tech")
ingest_offerings("jamb/education_offerings.json", "Education", "B.Ed")

# A JAMB name can occur in more than one brochure faculty/table.  Keep one
# canonical JAMB row, but retain the union of all university offerings and
# exception notes encountered above.
rows["school_programmes"] = list(school_programme_by_id.values())

# Resolve only contextual cross-references whose target programme and
# university-scoped rule are both unambiguous.  A raw ``same as`` note is not
# guessed from a similarly named programme; it inherits only one exact local
# option from the same university and keeps the raw exception text as its
# provenance.
_jamb_names_by_lower = {str(row[1]).lower(): str(row[1]) for row in rows["jamb_programmes"]}
_jamb_name_aliases = {
    "accountancy": "accounting",
    "political science and international relations": "political science",
    "political science and public administration": "political science",
    "business management": "business administration",
}
_local_options_by_exception = {
    str(row[1]): row for row in rows["school_programme_subject_options"]
}
_local_items_by_option = {}
for _item in rows["school_programme_subject_option_items"]:
    _local_items_by_option.setdefault(str(_item[1]), []).append(_item)

def _local_subject_option_signature(option):
    """Canonical semantics used to merge a scoped source locator into an equivalent local rule."""
    option_id = str(option[0])
    required = []
    grouped = {}
    for item in _local_items_by_option.get(option_id, []):
        _item_id, _option_id, code, role, group_key, minimum, distinct = item
        if role == "required":
            required.append(str(code))
        elif group_key:
            key = str(group_key)
            grouped.setdefault(key, {"minimum": int(minimum or 1), "distinct": distinct, "codes": []})
            grouped[key]["codes"].append(str(code))
    groups = tuple(sorted(
        (value["minimum"], str(value["distinct"] or ""), tuple(sorted(value["codes"])))
        for value in grouped.values()
    ))
    try:
        pass_codes = tuple(sorted(json.loads(option[11] or "[]")))
    except (IndexError, TypeError, json.JSONDecodeError):
        pass_codes = ()
    return (
        str(option[5]), str(option[6]), int(option[8] or 0),
        tuple(sorted(required)), groups, pass_codes,
    )

def _parsed_local_rule_signature(local_rule):
    required = []
    grouped = []
    group_number = 0
    for part in local_rule.get("parts") or []:
        if part[0] == "required":
            required.append(str(part[1]))
        else:
            _kind, minimum, codes, *tail = part
            group_number += 1
            grouped.append((int(minimum or 1), str(tail[0] if tail else ""), tuple(sorted(map(str, codes)))))
    return (
        str(local_rule.get("exam_type")), str(local_rule.get("rule_scope")),
        int(local_rule.get("min_required") or 0), tuple(sorted(required)),
        tuple(sorted(grouped)), tuple(sorted(local_rule.get("pass_required_codes") or [])),
    )

def _cross_reference_target(note):
    m = re.search(
        r"\b(?:same\s+as\s+in|same\s+as|as\s+in|as\s+for|applicable\s+to)\s+(?:the\s+)?"
        r"([^.;]+)",
        note or "",
        re.I,
    )
    if not m:
        return None
    candidate = re.sub(r"\b(?:programme|program|requirements?)\b", "", m.group(1), flags=re.I)
    candidate = re.sub(r"\s+", " ", candidate).strip(" :-").lower()
    candidate = _jamb_name_aliases.get(candidate, candidate)
    return _jamb_names_by_lower.get(candidate)

_cross_refs_resolved = 0
for _exception_index, _exception in enumerate(rows["school_programme_requirement_exceptions"]):
    if _exception[8] != "needs_review":
        continue
    _parsed_ref = parse_local_exception(_exception[5])
    if _parsed_ref.get("reason") != "cross_reference":
        continue
    _target_name = _cross_reference_target(_exception[5])
    if not _target_name:
        continue
    _target_jid = uid("jamb", _target_name)
    _target_options = [
        option for option in rows["school_programme_subject_options"]
        if str(option[3]) == str(_exception[2])
        and str(option[4]) == _target_jid
    ]
    if _exception[4] in {"utme", "olevel"}:
        _target_options = [option for option in _target_options if option[5] == _exception[4]]
    if not _target_options:
        continue
    # Multiple source rows may resolve to the same effective rule.  Deduplicate
    # those by layer and item semantics, but retain one option for each exam
    # layer when the reference genuinely supplies both UTME and O-level rules.
    _unique_target_options = []
    _seen_target_signatures = set()
    for _target_option in _target_options:
        _target_items = tuple(sorted(
            tuple(str(value) for value in item[2:7])
            for item in _local_items_by_option.get(str(_target_option[0]), [])
        ))
        _signature = (str(_target_option[5]), str(_target_option[6]), str(_target_option[8]), _target_items)
        if _signature in _seen_target_signatures:
            continue
        _seen_target_signatures.add(_signature)
        _unique_target_options.append(_target_option)
    for _target_option in _unique_target_options:
        _new_option_id = uid("school_subj_opt", _exception[0], _target_option[5])
        rows["school_programme_subject_options"].append(
            (
                _new_option_id,
                _exception[0],
                _exception[1],
                _exception[2],
                _exception[3],
                _target_option[5],
                _target_option[6],
                f"Inherited university {_target_option[5].upper()} rule from {_target_name}",
                _target_option[8],
                _target_option[9],
                _target_option[10],
                _target_option[11],
            )
        )
        for _item in _local_items_by_option.get(str(_target_option[0]), []):
            rows["school_programme_subject_option_items"].append(
                (
                    uid("school_subj_item", _exception[0], _target_option[5], _item[2] or "required", _item[3]),
                    _new_option_id,
                    _item[2],
                    _item[3],
                    _item[4],
                    _item[5],
                    _item[6],
                )
            )
    rows["school_programme_requirement_exceptions"][_exception_index] = (*_exception[:8], "parsed")
    _cross_refs_resolved += 1
print(f"university cross-references resolved: {_cross_refs_resolved}")

# ── 2b. jamb/enrich overlay — richer per-programme requirements ─
# 101 per-programme files (medical/agriculture/education/engineering/arts_hum)
# extracted straight from the brochures; they supersede the coarser offerings
# fields for the same jamb_name. Same row id (uid("psr", jname)) -> replace.
import glob as _g2
_psr_ix = {r[0]: i for i, r in enumerate(rows["programme_subject_requirements"])}
_enrich_overlays = []
_enrich_skipped = 0
for f in sorted(_g2.glob(os.path.join(HERE, "jamb", "enrich", "*.json"))):
    if os.path.basename(f).startswith("_"):
        continue
    e = json.load(open(f, encoding="utf-8"))
    jname = e.get("jamb_name")
    if not jname:
        continue
    if uid("jamb", jname) not in _seen_jids:
        _enrich_skipped += 1  # programme not in any offerings file — nothing to attach to
        continue
    _enrich_overlays.append(e)

_jamb_name_by_jid_pre = {row[0]: row[1] for row in rows["jamb_programmes"]}
_effective_before_source = {}
for _rid, _jid, _utme, _olevel, _direct_entry in rows["programme_subject_requirements"]:
    _jname = _jamb_name_by_jid_pre.get(_jid)
    if _jname:
        _effective_before_source[_jname] = {
            "jamb_name": _jname,
            "utme_subjects": _utme,
            "olevel_requirement": _olevel,
            "direct_entry": _direct_entry,
        }
from _jamb_source_rules import apply_enrich_requirement_overlays
_enrich_stats = apply_enrich_requirement_overlays(_effective_before_source, _enrich_overlays)
_psr_ix = {r[0]: i for i, r in enumerate(rows["programme_subject_requirements"])}
for _jname, _programme in _effective_before_source.items():
    _i = _psr_ix.get(uid("psr", _jname))
    if _i is None:
        continue
    _old = rows["programme_subject_requirements"][_i]
    rows["programme_subject_requirements"][_i] = (
        _old[0], _old[1], as_text(_programme.get("utme_subjects")),
        _programme.get("olevel_requirement"), _programme.get("direct_entry")
    )
print(f"jamb/enrich overlay: {_enrich_stats['applied']} applied, {_enrich_stats['conflicts']} conflicts held for source review, {_enrich_skipped} skipped (no offerings entry)")

# Source-reviewed repairs for rows whose broad PDF extraction contains page
# headers or shared-column fragments. Keep the provenance in the JSON overlay;
# only the three requirement fields are copied into the canonical seed row.
_subject_override_path = os.path.join(HERE, "jamb", "brochure_subject_overrides.json")
if os.path.exists(_subject_override_path):
    _subject_overrides = brochure_subject_overrides
    _override_applied = 0
    for jname, override in _subject_overrides.items():
        jid = uid("jamb", jname)
        if jid not in _seen_jids:
            continue
        row_id = uid("psr", jname)
        i = _psr_ix.get(row_id)
        base = rows["programme_subject_requirements"][i] if i is not None else None
        if not base:
            continue
        current = rows["programme_subject_requirements"][i]
        clear_fields = set(override.get("clear_fields") or [])
        rows["programme_subject_requirements"][i] = (
            row_id,
            jid,
            None if "utme_subjects" in clear_fields else (override.get("utme_subjects") or current[2]),
            None if "olevel_requirement" in clear_fields else (override.get("olevel_requirement") or current[3]),
            None if "direct_entry" in clear_fields else (override.get("direct_entry") or current[4]),
        )
        _override_applied += 1
    print(f"brochure subject overrides: {_override_applied} applied")

from _jamb_source_rules import apply_source_rules_to_programmes

_jamb_name_by_jid = {row[0]: row[1] for row in rows["jamb_programmes"]}
_programme_requirements = {}
for _rid, _jid, _utme, _olevel, _direct_entry in rows["programme_subject_requirements"]:
    _jname = _jamb_name_by_jid.get(_jid)
    if not _jname:
        continue
    _programme_requirements[_jname] = {
        "jamb_name": _jname,
        "utme_subjects": _utme,
        "olevel_requirement": _olevel,
        "direct_entry": _direct_entry,
    }
_source_rule_stats = apply_source_rules_to_programmes(_programme_requirements)
_psr_ix = {r[0]: i for i, r in enumerate(rows["programme_subject_requirements"])}
for _jname, _programme in _programme_requirements.items():
    _row_id = uid("psr", _jname)
    _i = _psr_ix.get(_row_id)
    if _i is None:
        continue
    rows["programme_subject_requirements"][_i] = (
        _row_id,
        uid("jamb", _jname),
        as_text(_programme.get("utme_subjects")),
        _programme.get("olevel_requirement"),
        _programme.get("direct_entry"),
    )
print(f"brochure source-rule repairs: {_source_rule_stats['applied']} applied")

# Preserve every source variant, including conflicting programme appearances in
# different faculty PDFs. These rows are evidence and are not merged into the
# canonical national requirement row.
_source_rules_path = os.path.join(HERE, "_audit", "jamb_brochure_source_rules_2026-08-19.json")
if os.path.exists(_source_rules_path):
    _source_rules_report = json.load(open(_source_rules_path, encoding="utf-8"))
    _source_rows_seen = set()
    for _source_row in _source_rules_report.get("rows", []):
        _jname = _source_row.get("jamb_name")
        _jid = uid("jamb", _jname) if _jname else None
        if not _jid or _jid not in _seen_jids:
            continue
        for _variant in _source_row.get("source_variants", []):
            _rule = _variant.get("source_variant") or {}
            _source = _rule.get("source") or {}
            _source_file = _source.get("source_file")
            _page = _source.get("pdf_page")
            _table_row = _source.get("table_row")
            if not _source_file or _page is None or _table_row is None:
                continue
            _key = (_jid, _source_row.get("layer"), _source_file, _page, _table_row)
            if _key in _source_rows_seen:
                continue
            _source_rows_seen.add(_key)
            rows["jamb_programme_requirement_sources"].append(
                (
                    uid("jamb_requirement_source", _jname, _source_row.get("layer"), _source_file, str(_page), str(_table_row)),
                    _jid,
                    _source_row.get("layer"),
                    _source_file,
                    _page,
                    _table_row,
                    _rule.get("status", "source_blank"),
                    _source_row.get("resolution", "source_still_blank_or_missing"),
                    _rule.get("text"),
                    _source.get("course_cell"),
                    _variant.get("waiver_cell"),
                    _rule.get("inherited_from"),
                    _rule.get("continuation_sources"),
                    f"{_source_file}:p{_page}:r{_table_row}:{_jname}:{_source_row.get('layer')}",
                )
            )
    print(f"brochure source variants: {len(rows['jamb_programme_requirement_sources'])} preserved")

# ── 3. programme_mapping (bridge) ───────────────────────────────
# Exact, parseable IBASS brochure cells can resolve an individual offering
# without rewriting the canonical national JAMB rule. The audit builder only
# emits `scoped_exact` rows when the source cell has one identifiable catalogue
# programme, explicit institution codes matching the canonical offering list,
# and one unambiguous executable rule. Conflicts and ambiguous cells remain
# structured source evidence and are not promoted here.
_scoped_resolution_path = os.path.join(
    HERE, "_audit", "jamb_subject_scoped_resolution_2026_10_08.json"
)
_scoped_exceptions_added = 0
_scoped_resolution_gz_path = _scoped_resolution_path + ".gz"
if os.path.exists(_scoped_resolution_path):
    with open(_scoped_resolution_path, encoding="utf-8") as _scoped_source:
        _scoped_resolution = json.load(_scoped_source)
elif os.path.exists(_scoped_resolution_gz_path):
    # Large audit artefacts are kept compressed in the repository. Read the
    # same canonical JSON payload directly so seed regeneration does not
    # silently omit source-confirmed, institution-specific matcher rules.
    with gzip.open(_scoped_resolution_gz_path, "rt", encoding="utf-8") as _scoped_source:
        _scoped_resolution = json.load(_scoped_source)
else:
    _scoped_resolution = None

if _scoped_resolution is not None:
    _existing_exception_keys = {
        (str(row[1]), str(row[4]), str(row[5]))
        for row in rows["school_programme_requirement_exceptions"]
    }
    for _resolved in _scoped_resolution.get("resolved_scoped_rows", []):
        if _resolved.get("resolution_status") not in {"scoped_exact", "scoped_conflict"}:
            continue
        _jname = _resolved.get("jamb_programme")
        _exam_type = _resolved.get("exam_type")
        if _exam_type not in {"utme", "olevel"} or not _jname:
            continue
        for _candidate in _resolved.get("candidates", []):
            _raw_text = (_candidate.get("raw_source_text") or "").strip()
            _note = f"{_exam_type.upper()}: {_raw_text}"
            _local_rule = parse_local_exception(_note)
            # Exact source-cell candidates have already passed the stricter
            # scoped resolver, which serializes its fully parsed rule. Use
            # that structured result when the legacy local-waiver grammar
            # cannot parse the official brochure's compact Sociology syntax.
            if (
                _local_rule.get("status") != "parsed"
                and _candidate.get("scope") == "institution_programme_offering"
                and _candidate.get("parsed_rule", {}).get("examType") == _exam_type
            ):
                _parsed_source_rule = _candidate["parsed_rule"]
                _credit_minimum = _parsed_source_rule.get(
                    "creditMinimum", _parsed_source_rule.get("minimumRequired")
                )
                _source_parts = _parsed_source_rule.get("parts") or []
                if _exam_type == "olevel" and isinstance(_credit_minimum, int) and _source_parts:
                    _local_rule = {
                        "status": "parsed",
                        "exam_type": _exam_type,
                        "rule_scope": "full",
                        "min_required": _credit_minimum,
                        "rule_text": _raw_text,
                        "parts": [tuple(part) for part in _source_parts],
                        "condition_text": None,
                        "pass_required_codes": _parsed_source_rule.get("passRequiredCodes") or [],
                    }
            if _local_rule.get("status") != "parsed" or _local_rule.get("exam_type") != _exam_type:
                continue
            _locator = _candidate.get("source_locator") or {}
            _source_file = _locator.get("source_file") or "IBASS brochure"
            _source_page = _locator.get("pdf_page")
            _source_row = _locator.get("table_row")
            _source_url = _candidate.get("source_url") or ""
            _source_accessed = _candidate.get("source_accessed_date") or "unknown"
            _source_label = (
                f"IBASS exact offering cell | {_source_url} | "
                f"{_source_file}:p{_source_page}:r{_source_row} | "
                f"accessed {_source_accessed}"
            )
            _conflicting_codes = set(_candidate.get("conflicting_institution_codes") or [])
            for _code in _candidate.get("institution_codes", []):
                if _code in _conflicting_codes:
                    continue
                _sid = uid("school", _code)
                _jid = uid("jamb", _jname)
                _spid = uid("sp", _code, _jname)
                if _code not in rows["schools"] or _spid not in school_programme_by_id:
                    continue
                _candidate_signature = _parsed_local_rule_signature(_local_rule)
                _equivalent_option = next((option for option in rows["school_programme_subject_options"]
                    if str(option[2]) == str(_spid)
                    and str(option[5]) == str(_exam_type)
                    and _local_subject_option_signature(option) == _candidate_signature), None)
                if _equivalent_option is not None:
                    # Keep one executable option, but upgrade its provenance
                    # with the exact institution/programme source locator.
                    for _existing_index, _existing_exception in enumerate(rows["school_programme_requirement_exceptions"]):
                        if str(_existing_exception[0]) == str(_equivalent_option[1]):
                            rows["school_programme_requirement_exceptions"][_existing_index] = (
                                *_existing_exception[:6], _source_file, _source_label, "parsed"
                            )
                            break
                    continue
                _duplicate_key = (str(_spid), str(_exam_type), _note)
                if _duplicate_key in _existing_exception_keys:
                    continue
                _exception_id = uid(
                    "spe", "ibass_scoped", _code, _jname, _exam_type, _note,
                    _source_url, str(_source_page), str(_source_row),
                )
                rows["school_programme_requirement_exceptions"].append(
                    (
                        _exception_id, _spid, _sid, _jid, _exam_type, _note,
                        _source_file, _source_label, "parsed",
                    )
                )
                _existing_exception_keys.add(_duplicate_key)
                _option_id = uid("school_subj_opt", _exception_id)
                rows["school_programme_subject_options"].append(
                    (
                        _option_id, _exception_id, _spid, _sid, _jid,
                        _local_rule["exam_type"], _local_rule["rule_scope"],
                        f"Institution-specific {_exam_type.upper()} rule (IBASS)",
                        _local_rule["min_required"], _local_rule["rule_text"],
                        _local_rule.get("condition_text"),
                        json.dumps(_local_rule.get("pass_required_codes") or []),
                    )
                )
                _group_index = 0
                for _part in _local_rule["parts"]:
                    if _part[0] == "required":
                        _codes = [_part[1]]
                        _role = "required"
                        _group_key = None
                        _group_min = None
                        _distinct_group = None
                    else:
                        _, _group_min, _codes, *_tail = _part
                        _role = "one_of"
                        _group_index += 1
                        _group_key = f"group_{_group_index}"
                        _distinct_group = _tail[0] if _tail else None
                    for _subject_code in _codes:
                        rows["school_programme_subject_option_items"].append(
                            (
                                uid("school_subj_item", _exception_id, _group_key or "required", _subject_code),
                                _option_id, _subject_code, _role, _group_key,
                                _group_min, _distinct_group,
                            )
                        )
                _scoped_exceptions_added += 1
    print(f"exact IBASS institution-scoped exceptions added: {_scoped_exceptions_added}")

pm = load("programme_mapping.json")
custom_link = {name: name for name in prog_id_by_name}
seen_jids = set()
programme_mapping_unresolved = []
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
    # Some D_custom JAMB entries intentionally have no exact CCMAS package.
    # Preserve their bridge row with a NULL target instead of indexing a
    # missing custom-link key and crashing the pre-SQL generator.
    if pid is None and jname in custom_link:
        pid = prog_id_by_name.get(custom_link[jname])
    if pid is None:
        programme_mapping_unresolved.append({
            "jamb_name": jname,
            "mapping_type": x.get("mapping_type"),
            "reason": "no exact CCMAS programme target; retained as unresolved bridge",
        })
    rows["programme_mapping"].append(
        (uid("pm", jname), jid, pid, x["mapping_type"], x.get("mapping_note")))

# ── emit SQL ────────────────────────────────────────────────────
# A duplicated institution code in a brochure extraction must not produce two
# copies of one UNIQUE school-programme row in the same INSERT statement.
for _key in (
    "school_programmes",
    "school_programme_requirement_exceptions",
    "school_programme_subject_options",
    "school_programme_subject_option_items",
):
    _seen_row_ids = set()
    _unique_rows = []
    for _row in rows[_key]:
        if _row[0] in _seen_row_ids:
            continue
        _seen_row_ids.add(_row[0])
        _unique_rows.append(_row)
    rows[_key] = _unique_rows

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

emit("jamb_programme_requirement_sources",
     ["id","jamb_programme_id","layer","source_file","pdf_page","table_row",
      "source_status","resolution","requirement_text","course_cell","waiver_cell",
      "inherited_from","continuation_sources","source_label"],
     [[q(a),q(b),q(c),q(d),str(e) if e is not None else "NULL",
       str(f) if f is not None else "NULL",q(g),q(h),q(i),q(j),q(k),
       jsonb(l),jsonb(m),q(n)]
      for (a,b,c,d,e,f,g,h,i,j,k,l,m,n) in rows["jamb_programme_requirement_sources"]])

emit("school_programmes",
     ["id","school_id","jamb_programme_id","utme_subjects","olevel_requirement","direct_entry","remarks"],
     [[q(a),q(b),q(c),q(d),q(e),q(f),q(g)] for (a,b,c,d,e,f,g) in rows["school_programmes"]])

emit("school_programme_requirement_exceptions",
     ["id","school_programme_id","school_id","jamb_programme_id","exam_type",
      "requirement_text","source_file","source_label","parse_status"],
      [[q(a),q(b),q(c),q(d),q(e),q(f),q(g),q(h),q(i)]
       for (a,b,c,d,e,f,g,h,i) in rows["school_programme_requirement_exceptions"]])

emit("school_programme_subject_options",
     ["id","exception_id","school_programme_id","school_id","jamb_programme_id",
      "exam_type","rule_scope","option_label","min_required","source_text","condition_text","pass_required_codes"],
     [[q(a),q(b),q(c),q(d),q(e),q(f),q(g),q(h),str(i),q(j),q(k),q(l)+"::jsonb"]
      for (a,b,c,d,e,f,g,h,i,j,k,l) in rows["school_programme_subject_options"]])

# Subject ids are resolved by code at seed time so this file remains portable
# across environments whose UUIDs were generated independently.
for (a,b,c,d,e,f,g) in rows["school_programme_subject_option_items"]:
    out.append(
        f"INSERT INTO school_programme_subject_option_items "
        f"(id, option_id, subject_id, requirement_role, group_key, min_from_group, distinct_group_key) "
        f"SELECT {q(a)}, {q(b)}, sc.id, {q(d)}, {q(e)}, "
        f"{str(f) if f is not None else 'NULL'}, {q(g)} "
        f"FROM subject_catalog sc WHERE sc.code = {q(c)} "
        f"AND EXISTS (SELECT 1 FROM school_programme_subject_options WHERE id = {q(b)}) "
        f"ON CONFLICT DO NOTHING;"
    )
if rows["school_programme_subject_option_items"]:
    out.append("")

out += ["COMMIT;"]
_seed_output_path = os.environ.get(
    "CAREER_PILOT_SEED_OUTPUT_PATH",
    os.path.join(HERE, "..", "..", "backend", "seed_career_pilot.sql"),
)
open(_seed_output_path, "w", encoding="utf-8").write("\n".join(out))

print(f"{os.path.basename(_seed_output_path)} generated:")
print(f"  programmes:                    {len(rows['programmes'])} (ccmas {len(prog_id_by_code)} + custom {len(prog_id_by_name)})")
print(f"  schools (distinct, normalized): {len(rows['schools'])}")
print(f"  jamb_programmes:               {len(rows['jamb_programmes'])}")
print(f"  programme_mapping:             {len(rows['programme_mapping'])}")
print(f"  programme_subject_requirements:{len(rows['programme_subject_requirements'])}")
print(f"  brochure source variants:       {len(rows['jamb_programme_requirement_sources'])}")
print(f"  school_programmes (offerings): {len(rows['school_programmes'])}")
print(f"  university requirement exceptions: {len(rows['school_programme_requirement_exceptions'])}")
print(f"  parsed university subject options: {len(rows['school_programme_subject_options'])}")
print(f"  parsed university subject items: {len(rows['school_programme_subject_option_items'])}")
linked = sum(1 for _,_,c,_,_ in rows["programme_mapping"] if c)
print(f"  mappings linked to a programme: {linked}/{len(rows['programme_mapping'])}")
print(f"  mappings intentionally unresolved: {len(programme_mapping_unresolved)}")
