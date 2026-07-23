#!/usr/bin/env python3
"""Parse brochure subject-requirement text into structured rows.

Input : jamb/*_offerings.json (+ jamb/enrich overlay) — utme_subjects and
        olevel_requirement text per JAMB programme.
Output: backend/seed_subject_options.sql —
        programme_subject_options + programme_subject_option_items rows and
        parse_status/parsed_at updates on programme_subject_requirements.

This powers the SS3 "match by my subjects" door: the API's structured matcher
(student_pipeline_routes._match_structured_subject_options) needs `required`
items and `one_of` groups with min_from_group. Anything this parser cannot
represent faithfully is marked needs_review and stays on the text fallback —
NEVER emitted half-parsed as if complete.

Grammar handled (v1):
  "Chemistry; Mathematics; Physics"                        -> 3 required
  "Physics, Mathematics, and one of A, B, C"               -> required + one_of(1)
  "Mathematics and any two (2) of A, B, C"                 -> required + one_of(2)
  "Biology/Agricultural Science"                           -> one_of(1) pair
  "two (2) other Arts or Social Science subjects"          -> category one_of
  "Any three (3) subjects"                                 -> catalog-wide one_of(3)
Rejected -> needs_review: cross-references ("as in ..."), institution-specific
prose ("(xxxiii) AAUA requires ..."), unrecognized subject tokens.

O-level: only the count is extracted ("Five (5) ... credit passes") plus any
explicitly named subjects; kept as display metadata (matching uses UTME only).
Idempotent: deterministic uuid5 ids, ON CONFLICT upserts.
"""
import glob
import json
import os
import re
import time
import uuid
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
NS = uuid.UUID("5c1f7e00-0000-4000-8000-0000ca4ee401")  # same namespace as seeds
NOW = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def uid(*parts):
    return str(uuid.uuid5(NS, "|".join(parts)))


def q(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


# ── subject name -> catalog code (mirrors seed_subject_catalog.sql) ──
SUBJECT_CODES = {
    "english language": "ENG", "english": "ENG", "use of english": "ENG",
    "mathematics": "MATH", "maths": "MATH", "general mathematics": "MATH",
    "further mathematics": "FMATH", "further maths": "FMATH", "additional mathematics": "FMATH",
    "physics": "PHY", "chemistry": "CHEM", "biology": "BIO",
    "agricultural science": "AGR", "agric science": "AGR", "agric. science": "AGR",
    "agriculture": "AGR", "agric": "AGR",
    "health science": "HSC", "health education": "HSC",
    "physical and health education": "PHE", "physical education": "PHE", "phe": "PHE",
    "animal husbandry": "ANH", "food and nutrition": "FSN", "foods and nutrition": "FSN",
    "computer studies": "CSC", "computer science": "CSC", "ict": "CSC", "data processing": "CSC",
    "economics": "ECON", "commerce": "COMM",
    "principles of accounts": "ACC", "accounting": "ACC", "financial accounting": "ACC",
    "accounts": "ACC", "book keeping": "ACC", "bookkeeping": "ACC",
    "marketing": "MKT", "insurance": "INS", "office practice": "OFP",
    "store management": "STORE", "store keeping": "STORE",
    "government": "GOV", "literature in english": "LIT", "literature-in-english": "LIT",
    "literature": "LIT", "english literature": "LIT",
    "geography": "GEO", "history": "HIS",
    "christian religious studies": "CRS", "christian religious knowledge": "CRS",
    "crs": "CRS", "crk": "CRS", "bible knowledge": "CRS",
    "islamic religious studies": "IRS", "islamic studies": "IRS", "irs": "IRS", "irk": "IRS",
    "arabic studies": "ARA", "religious studies": "CRS",
    "christian religious studies islamic studies": "CRS",
    "account": "ACC", "accounts": "ACC",
    "social studies": "SOS", "civic education": "CIV", "civics": "CIV",
    "yoruba": "YOR", "hausa": "HAU", "igbo": "IGB", "french": "FRE", "arabic": "ARA",
    "music": "MUS", "fine art": "ART", "fine arts": "ART", "art": "ART",
    "visual art": "ART", "visual arts": "ART", "creative arts": "ART",
    "home economics": "HEC", "home management": "HEC",
    "technical drawing": "TD", "building construction": "BLD", "woodwork": "WWK",
    "metalwork": "MWK", "metal work": "MWK", "basic electricity": "ELEC", "electricity": "ELEC",
    "auto mechanics": "AUTO", "motor vehicle mechanics": "AUTO",
    "clothing and textiles": "GMT", "garment making": "GMT", "dress making": "GMT",
    "catering craft practice": "CAT", "catering": "CAT", "tourism": "TOU",
}

# category phrases -> catalog code lists (UTME-relevant expansion)
SCIENCE = ["PHY", "CHEM", "BIO", "AGR", "GEO", "FMATH"]
ARTS = ["LIT", "HIS", "CRS", "IRS", "GOV", "GEO", "MUS", "ART", "FRE", "ARA", "YOR", "HAU", "IGB"]
SOCIAL = ["ECON", "GOV", "GEO", "COMM"]
COMMERCIAL = ["ECON", "COMM", "ACC", "MKT"]
ALL_UTME = sorted({c for c in SUBJECT_CODES.values()})

CATEGORY_PATTERNS = [
    (r"arts?\s*(?:or|and/or|and|/)\s*social\s+science", sorted(set(ARTS + SOCIAL))),
    (r"social\s+science\s*(?:or|and/or|and|/)\s*arts?", sorted(set(ARTS + SOCIAL))),
    (r"social\s+science", SOCIAL),
    (r"science", SCIENCE),
    (r"arts?", ARTS),
    (r"commercial", COMMERCIAL),
    (r"subjects?", ALL_UTME),
]

NUM_WORDS = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5}

REJECT_MARKERS = re.compile(
    r"\(x{0,3}(?:i|v|l|c)+\)|as in |see |same as |requires|accepts|does not|"
    r"no separate|shown|column|rightward|except ", re.I)


def norm(t):
    return re.sub(r"\s+", " ", re.sub(r"[.’']+$", "", (t or "").strip().lower()))


def subj_code(tok):
    return SUBJECT_CODES.get(norm(tok))


# longest-first subject names, for repairing missing-comma compounds
_NAMES_BY_LEN = sorted(SUBJECT_CODES, key=len, reverse=True)


def resolve_token(tok):
    """Token -> list of codes. Handles brochure typos like 'History Accounting'
    (missing comma) by greedy longest-prefix subject-name matching."""
    c = subj_code(tok)
    if c:
        return [c]
    t = norm(tok)
    codes = []
    while t:
        for name in _NAMES_BY_LEN:
            if t == name or t.startswith(name + " "):
                codes.append(SUBJECT_CODES[name])
                t = t[len(name):].strip()
                break
        else:
            return None
    return codes or None


def category_codes(phrase):
    p = norm(phrase)
    for pat, codes in CATEGORY_PATTERNS:
        if re.search(pat, p):
            return codes
    return None


def split_list(text):
    """'A, B, C or D' / 'A, B and C' -> [A, B, C, D]"""
    parts = re.split(r",|;| and | or |/", text)
    return [p for p in (x.strip(" .;,") for x in parts) if p and norm(p) not in ("", "any", "either")]


GROUP_RE = re.compile(
    r"(?:any\s+)?(one|two|three|four|1|2|3|4)?\s*(?:\(\s*\d\s*\))?\s*"
    r"(?:other\s+)?(?:of|from)?\s*(.+)$", re.I | re.S)


def parse_head(head):
    """Leading plain-subject part before a group. 'X, Y' -> required both;
    'X or Y' -> one_of(1). Returns None if unresolvable."""
    if not head:
        return []
    alt = bool(re.search(r"\bor\b", head, re.I))
    codes = []
    for h in split_list(head):
        hc = resolve_token(h)
        if not hc:
            return None
        codes.extend(hc)
    if not codes:
        return []
    if alt:
        return [("one_of", 1, sorted(set(codes)))]
    return [("required", c) for c in codes]


def preclean(seg):
    """Normalize brochure/PDF artifacts before grammar matching."""
    # cut page-noise tails: "... UTME SUBJECT(S) (i) MAUTY and FUTA require ..."
    seg = re.split(r"\bUTME\s+SUBJECTS?\b", seg)[0]
    # cut trailing institution-waiver fragments that leaked in
    seg = re.sub(r"\(?\b[ivxlcdm]{1,6}\)\s+[A-Z][A-Z\-]{2,}.*$", "", seg)
    # strip parenthetical cross-refs "(same as in X)" — handled at statement level
    seg = re.sub(r"\(\s*same\s+as\s+in[^)]*\)", "", seg, flags=re.I)
    # strip stray enumeration markers "(a)" "a." "b)" glued into statements
    seg = re.sub(r"\(\s*[a-d]\s*\)|\b[a-d]\)\s|\s[a-d]\.\s*$", " ", seg)
    # deglue known collisions from PDF extraction
    GLUE = ["and", "or", "either", "any", "other", "subject", "subjects", "Science", "Sciences"]
    for w in GLUE:
        seg = re.sub(rf"(?<=[a-z])({w})\b", r" \1", seg)
        seg = re.sub(rf"\b({w})(?=[A-Z])", r"\1 ", seg)
    # missing number word: "and (2) of" -> "and two (2) of"
    seg = re.sub(r"\b(and|plus)\s*\(\s*(\d)\s*\)\s*(of|from)", lambda m: f"{m.group(1)} {'one two three four'.split()[int(m.group(2))-1]} ({m.group(2)}) {m.group(3)}", seg)
    # "any (1) of" -> "any one (1) of"
    seg = re.sub(r"\bany\s*\(\s*(\d)\s*\)\s*(of|from)", lambda m: f"any {'one two three four'.split()[int(m.group(1))-1]} ({m.group(1)}) {m.group(2)}", seg)
    # "either X or Y" -> "X or Y" (either is grammar noise for us)
    seg = re.sub(r"\beither\s+", "", seg, flags=re.I)
    # "another" -> "one other"
    seg = re.sub(r"\banother\b", "one other", seg, flags=re.I)
    return re.sub(r"\s+", " ", seg).strip()


def parse_segment(seg):
    """One ';'-separated segment -> list of ('required', code) | ('one_of', n, [codes])
    Returns None if the segment cannot be represented faithfully."""
    seg = preclean(seg.strip(" .;,"))
    # normalize brochure connectors/filler
    seg = re.sub(r"\bplus\b", "and", seg, flags=re.I)
    seg = re.sub(r"\b(?:of|from)\s+the\s+following:?\s*", "of ", seg, flags=re.I)
    seg = re.sub(r"\brelevant\s+", "", seg, flags=re.I)
    if not seg:
        return []
    # plain single subject
    c = subj_code(seg)
    if c:
        return [("required", c)]
    # slash alternatives of plain subjects: "Biology/Agricultural Science"
    if "/" in seg and not re.search(r"\b(of|from|other)\b", seg, re.I):
        codes = [subj_code(x) for x in seg.split("/")]
        if all(codes):
            return [("one_of", 1, codes)]
    # "X, Y and one (1) of A, B, C" — leading plain subjects then a group
    m = re.search(r"(?:\b(?:and\s+)?(?:any\s+)?(one|two|three|1|2|3)\s*(?:\(\s*\d\s*\))?\s+(?:other\s+)?(?:subjects?\s+)?(?:chosen\s+)?(?:of|from)\s+)(.+)$", seg, re.I | re.S)
    if m:
        n = NUM_WORDS.get(m.group(1).lower(), 1)
        head, tail = seg[:m.start()].strip(" .;,"), m.group(2)
        results = parse_head(head)
        if results is None:
            return None
        codes = []
        for t in split_list(tail):
            tc = resolve_token(t)
            if tc:
                codes.extend(tc)
            else:
                cat = category_codes(t)
                if cat:
                    codes.extend(cat)
                else:
                    return None
        if not codes:
            return None
        return results + [("one_of", n, sorted(set(codes)))]
    # "X and/or two (2) other Arts or Social Science subjects" (category group,
    # possibly with a leading plain-subject head: "Government or History and two ...")
    m = re.search(r"(?:\b(?:and\s+)?(?:any\s+)?(?:other\s+)?(one|two|three|1|2|3)\s*(?:\(\s*\d\s*\))?\s*(?:other\s+)?)((?:[\w /]|-)*subjects?\.?)$", seg, re.I)
    if not m:
        # no-number variant: "any other Arts subject" -> one_of(1)
        m = re.search(r"(?:\b(?:and\s+)?any()\s+(?:other\s+)?)((?:[\w /]|-)*subjects?\.?)$", seg, re.I)
    if m:
        cat = category_codes(m.group(2))
        if cat:
            n = NUM_WORDS.get((m.group(1) or "one").lower(), 1)
            head = seg[:m.start()].strip(" .;,")
            head = re.sub(r"\b(?:and|any)\s*$", "", head, flags=re.I).strip(" .;,")
            results = parse_head(head)
            if results is None:
                return None
            return results + [("one_of", n, cat)]
    # "any other Science subject" / "one other Arts subject" (bare category, no number list)
    m = re.match(r"^(?:and\s+)?(?:any|one)\s+other\s+(.+?subjects?)$", seg, re.I)
    if m:
        cat = category_codes(m.group(1))
        if cat:
            return [("one_of", 1, cat)]
    # comma list of plain subjects: "Biology, Mathematics, Economics, Geography"
    items = split_list(seg)
    if len(items) > 1 and not re.search(r"\bor\b", seg, re.I):
        codes = []
        for x in items:
            xc = resolve_token(x)
            if not xc:
                return None
            codes.extend(xc)
        return [("required", c) for c in codes]
    # "A or B or C" — pure alternative list
    if re.search(r"\bor\b", seg, re.I):
        return parse_head(seg) or None
    return None


CROSS_REF_RE = re.compile(r"^\s*(?:same\s+)?as\s+(?:in\s+|for\s+)?([A-Za-z][\w ,&/-]{2,60}?)\s*(?:[.;(]|$)", re.I)


def parse_utme(text):
    """Full utme text -> list of parts, ('ref', name) for a pure cross-reference,
    or None (needs_review)."""
    ref = CROSS_REF_RE.match(text)
    if ref and len(text) < 140:
        return ("ref", ref.group(1).strip())
    if REJECT_MARKERS.search(text) or len(text) > 300:
        return None
    parts = []
    for seg in re.split(r";", text):
        r = parse_segment(seg)
        if r is None:
            return None
        parts.extend(r)
    # dedupe required
    seen, out = set(), []
    for p in parts:
        key = p[:2] if p[0] == "required" else (p[0], tuple(p[2]))
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
    return out or None


OLEVEL_COUNT_RE = re.compile(r"(five|four|three|5|4|3)\s*(?:\(\s*\d\s*\))?\s*(?:ssce?|ssc|o.?\s?level)?\s*credit", re.I)


def main():
    # collect programmes exactly like _gen_seed.py (offerings + enrich overlay)
    progs = {}
    for f in sorted(glob.glob(os.path.join(HERE, "jamb", "*_offerings.json"))):
        d = json.load(open(f, encoding="utf-8"))
        for p in d["programmes"]:
            progs.setdefault(p["jamb_name"], p)
    for f in sorted(glob.glob(os.path.join(HERE, "jamb", "enrich", "*.json"))):
        if os.path.basename(f).startswith("_"):
            continue
        e = json.load(open(f, encoding="utf-8"))
        if e.get("jamb_name") in progs:
            progs[e["jamb_name"]] = {**progs[e["jamb_name"]], **{k: v for k, v in e.items() if v}}

    SQL = ["-- AUTO-GENERATED by data/career-mapping/_parse_subject_options.py — DO NOT EDIT",
           "-- Structured UTME subject options parsed from the JAMB brochure text.",
           "-- Unparseable programmes are marked needs_review and keep the text fallback.",
           "SET search_path TO skillup_dev;", "BEGIN;",
           "-- deterministic regeneration: clear previously parsed rows first",
           "DELETE FROM programme_subject_option_items;",
           "DELETE FROM programme_subject_options;", ""]

    stats = Counter()
    parsed_names, review_names = [], []

    # ── pass 1: parse every programme's UTME text ────────────────
    utme_text, olevel_text, parsed, refs = {}, {}, {}, {}
    for jname, p in progs.items():
        utme = p.get("utme_subjects")
        if isinstance(utme, list):
            utme = "; ".join(str(x) for x in utme)
        utme_text[jname] = (utme or "").strip()
        olevel_text[jname] = (p.get("olevel_requirement") or "").strip()
        if utme_text[jname]:
            r = parse_utme(utme_text[jname])
            if isinstance(r, tuple) and r[0] == "ref":
                refs[jname] = r[1]
            elif r:
                parsed[jname] = r

    # ── pass 2: resolve "as in X" cross-references (<=2 hops) ────
    by_lower = {n.lower(): n for n in progs}
    for _ in range(2):
        for jname, target in list(refs.items()):
            t = by_lower.get(target.lower())
            if t and t in parsed:
                parsed[jname] = parsed[t]
                utme_text[jname] += f"  [resolved: as in {t}]"
                del refs[jname]
                stats["ref_resolved"] += 1

    # ── emit ─────────────────────────────────────────────────────
    for jname in sorted(progs):
        jid = uid("jamb", jname)
        rid = uid("psr", jname)
        utme, olevel = utme_text[jname], olevel_text[jname]

        if not utme and not olevel:
            stats["empty"] += 1
            continue

        parts = parsed.get(jname)
        if utme and parts is None:
            # Institution-variant prose: no single structured rule exists, but the
            # text is real information — keep it displayable (parse_status
            # needs_review = "requirements vary by institution" in the UI, and
            # matching falls back to text). Never a dead bucket.
            stats["needs_review"] += 1
            review_names.append((jname, utme[:140]))
            SQL.append(f"UPDATE programme_subject_requirements SET parse_status='needs_review' WHERE id = {q(rid)};")
            continue

        if parts:
            oid = uid("subj_opt", jname, "utme")
            n_req = sum(1 for x in parts if x[0] == "required")
            n_grp = sum(x[1] for x in parts if x[0] == "one_of")
            SQL.append(
                f"INSERT INTO programme_subject_options (id, jamb_programme_id, requirement_id, exam_type, option_label, min_required, source_text) "
                f"SELECT {q(oid)}, {q(jid)}, {q(rid)}, 'utme', 'UTME combination', {n_req + n_grp}, {q(utme)} "
                f"WHERE EXISTS (SELECT 1 FROM jamb_programmes WHERE id = {q(jid)}) "
                f"ON CONFLICT (id) DO UPDATE SET min_required=EXCLUDED.min_required, source_text=EXCLUDED.source_text;"
            )
            gi = 0
            for part in parts:
                if part[0] == "required":
                    code = part[1]
                    SQL.append(
                        f"INSERT INTO programme_subject_option_items (id, option_id, subject_id, requirement_role) "
                        f"SELECT {q(uid('subj_item', jname, 'utme', 'req', code))}, {q(oid)}, sc.id, 'required' "
                        f"FROM subject_catalog sc WHERE sc.code = {q(code)} "
                        f"AND EXISTS (SELECT 1 FROM programme_subject_options WHERE id = {q(oid)}) "
                        f"ON CONFLICT DO NOTHING;"
                    )
                else:
                    _, n, codes = part
                    gi += 1
                    gk = f"group_{gi}"
                    for code in codes:
                        SQL.append(
                            f"INSERT INTO programme_subject_option_items (id, option_id, subject_id, requirement_role, group_key, min_from_group) "
                            f"SELECT {q(uid('subj_item', jname, 'utme', gk, code))}, {q(oid)}, sc.id, 'one_of', {q(gk)}, {n} "
                            f"FROM subject_catalog sc WHERE sc.code = {q(code)} "
                            f"AND EXISTS (SELECT 1 FROM programme_subject_options WHERE id = {q(oid)}) "
                            f"ON CONFLICT DO NOTHING;"
                        )
            stats["utme_parsed"] += 1
            parsed_names.append(jname)

        # O-level: count + named subjects only (display metadata; matching is UTME)
        if olevel and len(olevel) < 400:
            mc = OLEVEL_COUNT_RE.search(olevel)
            named = []
            for tok in split_list(re.sub(r"^.*?credit passes(?:\s+(?:in|to include|including))?", "", olevel, flags=re.I | re.S)):
                c = subj_code(tok)
                if c:
                    named.append(c)
            if mc:
                n_min = NUM_WORDS.get(mc.group(1).lower(), 5)
                ooid = uid("subj_opt", jname, "olevel")
                SQL.append(
                    f"INSERT INTO programme_subject_options (id, jamb_programme_id, requirement_id, exam_type, option_label, min_required, source_text) "
                    f"SELECT {q(ooid)}, {q(jid)}, {q(rid)}, 'olevel', '{n_min} credit passes', {n_min}, {q(olevel)} "
                    f"WHERE EXISTS (SELECT 1 FROM jamb_programmes WHERE id = {q(jid)}) "
                    f"ON CONFLICT (id) DO UPDATE SET min_required=EXCLUDED.min_required, source_text=EXCLUDED.source_text;"
                )
                for code in dict.fromkeys(named):
                    SQL.append(
                        f"INSERT INTO programme_subject_option_items (id, option_id, subject_id, requirement_role) "
                        f"SELECT {q(uid('subj_item', jname, 'olevel', 'req', code))}, {q(ooid)}, sc.id, 'required' "
                        f"FROM subject_catalog sc WHERE sc.code = {q(code)} "
                        f"AND EXISTS (SELECT 1 FROM programme_subject_options WHERE id = {q(ooid)}) "
                        f"ON CONFLICT DO NOTHING;"
                    )
                stats["olevel_parsed"] += 1

        if parts:
            SQL.append(f"UPDATE programme_subject_requirements SET parse_status='parsed', parsed_at={q(NOW)} WHERE id = {q(rid)};")

    SQL.append("")
    SQL.append("COMMIT;")
    dest = os.path.join(HERE, "..", "..", "backend", "seed_subject_options.sql")
    open(dest, "w", encoding="utf-8").write("\n".join(SQL))

    total = len(progs)
    print(f"programmes: {total}")
    print(f"  utme parsed       : {stats['utme_parsed']} (incl. {stats['ref_resolved']} via 'as in X' reference)")
    print(f"  olevel parsed     : {stats['olevel_parsed']}")
    print(f"  needs_review      : {stats['needs_review']}")
    print(f"  empty requirement : {stats['empty']}")
    print(f"-> {os.path.abspath(dest)}")
    if review_names:
        print("\nneeds_review programmes (with the text that failed):")
        for n, txt in review_names[:62]:
            print(f"  - {n}\n      {txt}")
        if len(review_names) > 62:
            print(f"  ... and {len(review_names) - 62} more")


if __name__ == "__main__":
    main()
