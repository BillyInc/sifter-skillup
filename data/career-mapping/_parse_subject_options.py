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
represent faithfully is marked needs_review and is kept as source text for
programme detail — NEVER emitted half-parsed as if complete or used as a
subject-match result.

Grammar handled (v1):
  "Chemistry; Mathematics; Physics"                        -> 3 required
  "Physics, Mathematics, and one of A, B, C"               -> required + one_of(1)
  "Mathematics and any two (2) of A, B, C"                 -> required + one_of(2)
  "Biology/Agricultural Science"                           -> one_of(1) pair
  "two (2) other Arts or Social Science subjects"          -> category one_of
  "Any three (3) subjects"                                 -> catalog-wide one_of(3)
Rejected -> needs_review: cross-references ("as in ..."), institution-specific
prose ("(xxxiii) AAUA requires ..."), unrecognized subject tokens.

O-level requirements use the same structured grammar where the brochure gives
named subjects and alternatives.  The total credit count remains a separate
minimum, so an O-level match can require both named credits and the required
number of additional credits.
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
# All subject-requirement rows are parsed from the JAMB IBASS brochure. There
# are no per-programme source pages, so provenance is this single canonical URL
# (row-level detail lives in source_text). See §0.8 provisioning parity.
SOURCE_URL = "https://ibass.jamb.gov.ng/brochure-by-programme"
SOURCE_RULES_PATH = os.path.join(HERE, "_audit", "jamb_brochure_source_rules_2026-08-19.json")


def uid(*parts):
    return str(uuid.uuid5(NS, "|".join(parts)))


def q(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


def source_variant_texts(source_report, jamb_name, layer):
    """Return safe brochure variants for a programme/layer.

    The effective catalogue cell is not always the usable requirement: the
    brochure can share one subject cell across several programme rows or
    preserve multiple university-block variants. Those source variants are
    evidence, not guesses, so the parser can expose each parseable variant as
    a separate source-rule/detail record; they are not silently promoted into
    the national matcher.
    """
    for row in source_report.get("rows", []):
        if row.get("jamb_name") != jamb_name or row.get("layer") != layer:
            continue
        out = []
        for wrapper in row.get("source_variants", []):
            variant = wrapper.get("source_variant") or {}
            status = variant.get("status")
            text = re.sub(r"\s+", " ", str(variant.get("text") or "")).strip()
            if status in {"exact", "inherited_shared"} and text and text not in out:
                out.append(text)
        return out
    return []


def distinct_rules(rules):
    """Deduplicate structured rules while preserving source order."""
    out, seen = [], set()
    for parts, source_text, source_kind in rules:
        key = (json.dumps(parts, sort_keys=True), source_text)
        if key in seen:
            continue
        seen.add(key)
        out.append((parts, source_text, source_kind))
    return out


# ── subject name -> catalog code (mirrors seed_subject_catalog.sql) ──
SUBJECT_CODES = {
    "english language": "ENG", "english": "ENG", "use of english": "ENG",
    "mathematics": "MATH", "maths": "MATH", "general mathematics": "MATH",
    "further mathematics": "FMATH", "further maths": "FMATH", "additional mathematics": "FMATH",
    "physics": "PHY", "chemistry": "CHEM", "biology": "BIO", "zoology": "BIO", "botany": "BIO",
    "agricultural science": "AGR", "agric science": "AGR", "agric. science": "AGR",
    "agric. sc.": "AGR", "agric. sc": "AGR", "agric sc.": "AGR", "agric sc": "AGR",
    "agriculture science": "AGR", "agriculture/science": "AGR",
    "agriculture": "AGR", "agric": "AGR",
    "health science": "HSC", "health education": "HSC",
    "physical and health education": "PHE", "physical education": "PHE", "phe": "PHE",
    "animal husbandry": "ANH", "food and nutrition": "FSN", "foods and nutrition": "FSN",
    "computer studies": "CSC", "computer science": "CSC", "ict": "CSC", "data processing": "CSC",
    "economics": "ECON", "commerce": "COMM",
    "principles of accounts": "ACC", "principles of accounting": "ACC", "accounting": "ACC", "financial accounting": "ACC",
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
    "account": "ACC", "accounts": "ACC", "book keeping": "ACC", "book-keeping": "ACC",
    "social studies": "SOS", "civic education": "CIV", "civics": "CIV",
    "yoruba": "YOR", "yoruba language": "YOR", "hausa": "HAU", "hausa language": "HAU",
    "igbo": "IGB", "igbo language": "IGB", "french": "FRE", "arabic": "ARA",
    "music": "MUS", "fine art": "ART", "fine arts": "ART", "art": "ART",
    "visual art": "ART", "visual arts": "ART", "creative arts": "ART",
    "home economics": "HEC", "home management": "HEC",
    "technical drawing": "TD", "building construction": "BLD", "building engineering drawing": "TD",
    "construction": "BLD",
    "woodwork": "WWK", "general wood work": "WWK",
    "metalwork": "MWK", "metal work": "MWK", "general metal work": "MWK",
    "basic electricity": "ELEC", "electricity": "ELEC",
    "auto mechanics": "AUTO", "motor vehicle mechanics": "AUTO",
    "clothing and textiles": "GMT", "garment making": "GMT", "dress making": "GMT",
    "catering craft practice": "CAT", "catering": "CAT", "basic catering and food services": "CAT",
    "bakery and confectioneries": "CAT",
    "tourism": "TOU",
    "nutrition": "FSN", "textile": "GMT", "fine arts": "ART",
    "men garment construction and finishing": "GMT", "ladies garment construction and finishing": "GMT",
    "garment construction and finishing": "GMT", "spinning": "GMT", "weaving": "GMT",
    "surface design and printing": "GMT", "bleaching": "GMT", "dyeing and finishing": "GMT",
    "business methods": "BMETHOD", "statistics": "STAT",
}

# The catalogue is a union of exam layers, not a single 44-subject exam list.
# Keep these sets in sync with seed_subject_catalog.sql.  In particular,
# technical/trade rows are O-level choices unless the source explicitly makes
# them UTME subjects.
UTME_CODES = {
    "ENG", "MATH", "PHY", "CHEM", "BIO", "AGR", "PHE", "CSC",
    "ECON", "COMM", "ACC", "GOV", "LIT", "GEO", "HIS", "CRS", "IRS",
    "YOR", "HAU", "IGB", "FRE", "ARA", "MUS", "ART", "HEC",
}
OLEVEL_CODES = {
    "ENG", "MATH", "CIV", "PHY", "CHEM", "BIO", "AGR", "FMATH", "HSC",
    "PHE", "ANH", "FSN", "CSC", "ECON", "COMM", "ACC", "MKT", "INS",
    "OFP", "STORE", "GOV", "LIT", "GEO", "HIS", "CRS", "IRS", "SOS",
    "YOR", "HAU", "IGB", "FRE", "ARA", "MUS", "ART", "HEC", "TD", "BLD",
    "WWK", "MWK", "ELEC", "AUTO", "GMT", "CAT", "TOU", "BMETHOD", "STAT",
}

# category phrases -> catalog code lists
SCIENCE = ["PHY", "CHEM", "BIO", "AGR", "GEO"]
ARTS = ["LIT", "HIS", "CRS", "IRS", "GOV", "GEO", "MUS", "ART", "FRE", "ARA", "YOR", "HAU", "IGB"]
SOCIAL = ["ECON", "GOV", "GEO", "COMM"]
COMMERCIAL = ["ECON", "COMM", "ACC", "MKT"]
ALL_UTME = sorted(UTME_CODES)
ALL_OLEVEL = sorted(OLEVEL_CODES)

CATEGORY_PATTERNS = [
    (r"arts?\b.*social\s+sciences?\b", sorted(set(ARTS + SOCIAL))),
    (r"social\s+sciences?\b.*arts?\b", sorted(set(ARTS + SOCIAL))),
    (r"arts?\b\s*,?\s*(?:or|and/or|and|/)\s*social\s+sciences?\b", sorted(set(ARTS + SOCIAL))),
    (r"social\s+sciences?\b\s*,?\s*(?:or|and/or|and|/)\s*arts?\b", sorted(set(ARTS + SOCIAL))),
    (r"social\s+sciences?\b", SOCIAL),
    (r"sciences?\b", SCIENCE),
    (r"arts?\b", ARTS),
    (r"commercial", COMMERCIAL),
]

NUM_WORDS = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5}

REJECT_MARKERS = re.compile(
    r"\(x{0,3}(?:i|v|l|c)+\)|as in |see |same as |requires|accepts|does not|"
    r"no separate|shown|column|rightward|except ", re.I)


def norm(t):
    return re.sub(r"\s+", " ", re.sub(r"[.\u2019']+$", "", (t or "").strip().lower()))


def subj_code(tok, allowed_codes=None):
    code = SUBJECT_CODES.get(norm(tok))
    if code and (allowed_codes is None or code in allowed_codes):
        return code
    return None


# longest-first subject names, for repairing missing-comma compounds
_NAMES_BY_LEN = sorted(SUBJECT_CODES, key=len, reverse=True)


def resolve_token(tok, allowed_codes=None):
    """Token -> list of codes. Handles brochure typos like 'History Accounting'
    (missing comma) by greedy longest-prefix subject-name matching."""
    c = subj_code(tok, allowed_codes)
    if c:
        return [c]
    t = norm(tok)
    codes = []
    while t:
        for name in _NAMES_BY_LEN:
            if t == name or t.startswith(name + " "):
                code = SUBJECT_CODES[name]
                if allowed_codes is not None and code not in allowed_codes:
                    return None
                codes.append(code)
                t = t[len(name):].strip()
                break
        else:
            return None
    return codes or None


def category_codes(phrase, allowed_codes=None):
    p = norm(phrase)
    # Do not mistake a named subject such as ``Environmental Science`` or
    # ``Information Science`` for the broad Science category.  If the named
    # subject is not in the catalogue, the caller must keep the source row on
    # review instead of silently widening it to every science subject.
    if re.search(
        r"\b(?:environmental|health|agricultural|computer|information|data|"
        r"general|physical|technical|laboratory)\s+sciences?\b",
        p,
        re.I,
    ):
        return None
    # A bare plural "any other subjects" does not state how many subjects are
    # required. Do not turn that ambiguous prose into an exact one-subject
    # rule; numbered variants are handled by parse_segment before this helper.
    if re.search(r"\bother\s+subjects?\b", p):
        return None
    # A bare "subject(s)" phrase means the active exam catalogue.  It must
    # not be hard-wired to UTME: O-level rules may explicitly allow any
    # passing subject, including trade/vocational subjects.  The caller passes
    # the layer-specific catalogue; the no-context fallback remains UTME for
    # legacy callers that parse an untyped fragment.
    if re.fullmatch(r"(?:any\s+)?subjects?", p):
        return sorted(set(allowed_codes or ALL_UTME))
    for pat, codes in CATEGORY_PATTERNS:
        if re.search(pat, p):
            if allowed_codes is None:
                return codes
            return [code for code in codes if code in allowed_codes]
    return None


def split_list(text):
    """'A, B, C or D' / 'A, B and C' -> [A, B, C, D]"""
    parts = re.split(r",|;| and | or |/", text)
    return [p for p in (x.strip(" .;,") for x in parts) if p and norm(p) not in ("", "any", "either")]


GROUP_RE = re.compile(
    r"(?:any\s+)?(one|two|three|four|1|2|3|4)?\s*(?:\(\s*\d\s*\))?\s*"
    r"(?:other\s+)?(?:of|from)?\s*(.+)$", re.I | re.S)


def parse_head(head, allowed_codes=None):
    """Leading plain-subject part before a group. 'X, Y' -> required both;
    'X or Y' -> one_of(1). Returns None if unresolvable."""
    if not head:
        return []
    def plain_parts(value):
        parts, codes = [], []
        # Keep slash-separated alternatives together. A head such as
        # Biology/Agricultural Science must not turn into two required subjects.
        for h in re.split(r",|;|\s+and\s+", value):
            h = h.strip(" .;,")
            if not h:
                continue
            if "/" in h:
                alternatives = [resolve_token(x, allowed_codes) for x in h.split("/")]
                if not alternatives or not all(alternatives):
                    return None
                alt_codes = sorted({c for group in alternatives for c in group})
                parts.append(("one_of", 1, alt_codes))
                continue
            hc = resolve_token(h, allowed_codes)
            if not hc:
                return None
            codes.extend(hc)
        return parts + [("required", c) for c in codes]

    or_parts = re.split(r"\s+or\s+", head, flags=re.I)
    if len(or_parts) > 1:
        # The brochure commonly writes "A, B and C or D". That means A and B
        # are required, while C/D is the alternative—not one alternative group
        # containing every subject in the sentence.
        if len(or_parts) == 2 and re.search(r",|\band\b", or_parts[0], re.I):
            left = plain_parts(or_parts[0])
            right = plain_parts(or_parts[1])
            if left is None or right is None:
                return None
            # "A, B and C or D and E" means A, B and E are required and
            # C/D is the alternative. This is common in brochure rows where
            # the final required subject follows the alternative phrase.
            if (
                left
                and right
                and all(p[0] == "required" for p in left + right)
            ):
                return (
                    left[:-1]
                    + right[1:]
                    + [("one_of", 1, sorted({left[-1][1], right[0][1]}))]
                )
            right_codes = [p[1] for p in right if p[0] == "required"]
            right_codes.extend(c for p in right if p[0] == "one_of" for c in p[2])
            if left and left[-1][0] == "required" and right_codes:
                return left[:-1] + [("one_of", 1, sorted(set([left[-1][1], *right_codes])))]
        groups = []
        for value in or_parts:
            parsed = plain_parts(value)
            if parsed is None:
                return None
            groups.extend(parsed)
        codes = [p[1] for p in groups if p[0] == "required"]
        codes.extend(c for p in groups if p[0] == "one_of" for c in p[2])
        return [("one_of", 1, sorted(set(codes)))] if codes else None

    return plain_parts(head)

def preclean(seg):
    """Normalize brochure/PDF artifacts before grammar matching."""
    # Brochure extraction often leaves a parenthesis around a subject and can
    # split "another" into "an other" while repairing word boundaries.
    seg = seg.replace("&", " and ")
    # PDF extraction commonly inserts separators into this canonical subject
    # name. Normalize it before parse_head tries to resolve the named head.
    seg = re.sub(r"literature\s*-\s*in\s*-\s*english", "Literature in English", seg, flags=re.I)
    seg = re.sub(r"\ban\s+other\b", "one other", seg, flags=re.I)
    # cut page-noise tails: "... UTME SUBJECT(S) (i) MAUTY and FUTA require ..."
    seg = re.split(r"\bUTME\s+SUBJECTS?\b", seg)[0]
    # cut trailing institution-waiver fragments that leaked in
    seg = re.sub(r"\(?\b[ivxlcdm]{1,6}\)\s+[A-Z][A-Z\-]{2,}.*$", "", seg)
    # strip parenthetical cross-refs "(same as in X)" — handled at statement level
    seg = re.sub(r"\(\s*same\s+as\s+in[^)]*\)", "", seg, flags=re.I)
    # Trailing parentheticals containing prose are brochure/editorial notes,
    # not part of the admission subject rule. Keep numeric count markers for
    # the grammar below, but never let a note become a subject token.
    seg = re.sub(r"\s*\([^)]*[A-Za-z][^)]*\)\s*$", "", seg)
    # strip stray enumeration markers "(a)" "a." "b)" glued into statements
    seg = re.sub(r"\(\s*[a-d]\s*\)|\b[a-d]\)\s|\s[a-d]\.\s*$", " ", seg)
    # deglue known collisions from PDF extraction
    GLUE = ["and", "or", "either", "any", "other", "subject", "subjects", "Science", "Sciences"]
    for w in GLUE:
        seg = re.sub(rf"(?<=[a-z])({w})\b", r" \1", seg)
        seg = re.sub(rf"\b({w})(?=[A-Z])", r"\1 ", seg)
    # The generic "any" repair can split the valid subject name Botany.
    seg = re.sub(r"\bbot\s+any\b", "Botany", seg, flags=re.I)
    # A few brochure rows lose spaces at the start of a count phrase.
    seg = re.sub(r"\banythree\b", "any three", seg, flags=re.I)
    seg = re.sub(r"\banytwo\b", "any two", seg, flags=re.I)
    seg = re.sub(r"\banyone\b", "any one", seg, flags=re.I)
    seg = re.sub(r"\b(three|two|one)of\b", r"\1 of", seg, flags=re.I)
    # Brochure shorthand for Further Mathematics is often written as a
    # slash-joined synonym rather than two alternatives.
    seg = re.sub(r"\badditional\s*/\s*further\s+mathematics\b", "Further Mathematics", seg, flags=re.I)
    # missing number word: "and (2) of" -> "and two (2) of"
    seg = re.sub(r"\b(and|plus)\s*\(\s*(\d)\s*\)\s*(of|from)", lambda m: f"{m.group(1)} {'one two three four'.split()[int(m.group(2))-1]} ({m.group(2)}) {m.group(3)}", seg)
    # "any (1) of" -> "any one (1) of"
    seg = re.sub(r"\bany\s*\(\s*(\d)\s*\)\s*(of|from)", lambda m: f"any {'one two three four'.split()[int(m.group(1))-1]} ({m.group(1)}) {m.group(2)}", seg)
    # "either X or Y" -> "X or Y" (either is grammar noise for us)
    seg = re.sub(r"\beither\s+", "", seg, flags=re.I)
    # "another" -> "one other"
    seg = re.sub(r"\banother\b", "one other", seg, flags=re.I)
    seg = re.sub(r"\ban\s+other\b", "one other", seg, flags=re.I)
    seg = seg.replace("(", " ").replace(")", " ")
    # After parentheses are removed, brochure counts can become "two 2";
    # keep the word count and discard its duplicated numeral.
    seg = re.sub(r"\b(one|two|three|four|five|six|seven)\s+\d+\b", r"\1", seg, flags=re.I)
    # Layout extraction sometimes leaves the brochure page number or a column
    # marker at the end of an otherwise usable subject combination.
    seg = re.sub(r"\s+(?:\d{1,4}|[a-d])\.?\s*$", "", seg, flags=re.I)
    return re.sub(r"\s+", " ", seg).strip()


def parse_segment(seg, allowed_codes=None, context_codes=None):
    """One ';'-separated segment -> list of ('required', code) | ('one_of', n, [codes])
    Returns None if the segment cannot be represented faithfully."""
    seg = preclean(seg.strip(" .;,"))
    # normalize brochure connectors/filler
    seg = re.sub(r"\bplus\b", "and", seg, flags=re.I)
    seg = re.sub(r"\b(?:of|from)\s+the\s+following:?\s*", "of ", seg, flags=re.I)

    # Resolve a qualifier when the source gives the exact named/category
    # scope in the same sentence, e.g. “one relevant subject from Government,
    # History or Geography”. Do this before removing the word “relevant”; the
    # generic fallback must never turn an unresolved qualifier into the entire
    # exam catalogue.
    qualified = re.search(
        r"(?:\b(?:and|,|;)\s*)?(?P<number>one|two|three|four|1|2|3|4)\s+"
        r"(?:other\s+)?(?:relevant|suitable|appropriate|related|cognate|pertinent)\s+"
        r"subjects?\s+(?:could\s+be\s+)?(?:from|of)\s+(?:any\s+of\s+)?"
        r"(?P<scope>.+)$",
        seg,
        re.I | re.S,
    )
    if qualified:
        head = seg[:qualified.start()].strip(" .;,\t")
        head = re.sub(r"\b(?:and|any)\s*$", "", head, flags=re.I).strip(" .;,")
        results = parse_head(head, allowed_codes)
        codes = []
        scope = qualified.group("scope")
        category = category_codes(scope, allowed_codes)
        if category:
            codes.extend(category)
        else:
            for token in split_list(scope):
                resolved = resolve_token(token, allowed_codes)
                if not resolved:
                    category = category_codes(token, allowed_codes)
                    if not category:
                        codes = []
                        break
                    resolved = category
                codes.extend(resolved)
        if results is not None and codes:
            required_codes = {part[1] for part in results if part[0] == "required"}
            codes = sorted(set(codes) - required_codes)
            minimum = NUM_WORDS[qualified.group("number").lower()]
            if codes and minimum <= len(codes):
                return results + [("one_of", minimum, codes)]

    # If the sentence names a qualifier but omits its list, use a narrow,
    # programme-level scope supplied by the other exam layer when one exists.
    # The caller deliberately withholds catalogue-wide scopes, so this cannot
    # turn “relevant” into “every subject”.
    if context_codes:
        contextual = re.search(
            r"(?:\b(?:and|,|;)\s*)(?:any\s+)?"
            r"(?P<number>one|two|three|four|1|2|3|4)\s*(?:\(\s*\d\s*\))?\s+"
            r"(?:other\s+)?(?:relevant|suitable|appropriate|related|cognate|pertinent)\s+"
            r"subjects?\b",
            seg,
            re.I,
        )
        if contextual:
            head = seg[:contextual.start()].strip(" .;,\t")
            head = re.sub(r"\b(?:and|any)\s*$", "", head, flags=re.I).strip(" .;,")
            results = parse_head(head, allowed_codes)
            if results is not None:
                required_codes = {part[1] for part in results if part[0] == "required"}
                codes = sorted(set(context_codes) - required_codes)
                minimum = NUM_WORDS[contextual.group("number").lower()]
                if codes and minimum <= len(codes):
                    return results + [("one_of", minimum, codes)]

    # An unresolved qualifier is not a licence to use every subject in the
    # catalogue. Category wording such as “relevant Social Science subjects”
    # is handled below by category_codes; only the nameless form is rejected.
    if re.search(
        r"\b(?:relevant|suitable|appropriate|related|cognate|pertinent)\s*subjects?\b",
        seg,
        re.I,
    ):
        return None
    seg = re.sub(r"\brelevant\s+", "", seg, flags=re.I)
    if not seg:
        return []

    # Compact category-plus-open-slot form: "Two Arts subjects including CRS
    # and any other subject."  The category count and the open slot are two
    # separate requirements; the latter remains catalogue-wide because the
    # source says "any", not "relevant".
    compact = re.match(
        r"^(?P<number>one|two|three|four|1|2|3|4)\s+"
        r"(?P<category>arts?|social\s+sciences?|science|sciences?|commercial)\s+"
        r"subjects?\s+including\s+(?P<include>.+?)\s+and\s+(?:any\s+)?other\s+subject$",
        seg,
        re.I | re.S,
    )
    if compact:
        total = NUM_WORDS[compact.group("number").lower()]
        category = category_codes(compact.group("category"), allowed_codes)
        include = parse_head(compact.group("include"), allowed_codes)
        include_codes = (
            [part[1] for part in include if part[0] == "required"]
            + [code for part in include if part[0] == "one_of" for code in part[2]]
            if include is not None
            else []
        )
        if category and include_codes and total > len(include_codes):
            category_choices = sorted(set(category) - set(include_codes))
            unrestricted = sorted(set(allowed_codes or ALL_UTME) - set(include_codes))
            if category_choices and unrestricted:
                return [
                    *(('required', code) for code in include_codes),
                    ('one_of', total - len(include_codes), category_choices, 'distinct_1'),
                    ('one_of', 1, unrestricted, 'distinct_1'),
                ]

    def group_codes(text):
        """Resolve a numbered group's named subjects/categories."""
        category = category_codes(text, allowed_codes)
        if category:
            return sorted(set(category))
        codes = []
        for token in split_list(text):
            resolved = resolve_token(token, allowed_codes)
            if resolved:
                codes.extend(resolved)
                continue
            category = category_codes(token, allowed_codes)
            if not category:
                return None
            codes.extend(category)
        return sorted(set(codes)) or None

    # Two independent groups occur in the brochure, for example:
    # "Any two subjects from Arts and Social Sciences and one of History,
    # Religious Studies, Government and Geography."  The option-item schema
    # already supports multiple group_key values; preserve both groups rather
    # than flattening them into one broad alternative.
    m = re.match(
        r"^(?:any\s+)?(one|two|three|four|1|2|3|4)\s+subjects?\s+"
        r"(?:from|of)\s+(.+?)\s+and\s+(?:any\s+)?"
        r"(one|two|three|four|1|2|3|4)\s*(?:\(\s*\d\s*\))?\s+"
        r"(?:of|from)\s+(.+)$",
        seg,
        re.I | re.S,
    )
    if m:
        first_n = NUM_WORDS[m.group(1).lower()]
        second_n = NUM_WORDS[m.group(3).lower()]
        first_codes = group_codes(m.group(2))
        second_codes = group_codes(m.group(4))
        if first_codes and second_codes and first_n <= len(first_codes) and second_n <= len(second_codes):
            return [
                ("one_of", first_n, first_codes, "distinct_1"),
                ("one_of", second_n, second_codes, "distinct_1"),
            ]

    # Some rows say "any subject combination which includes Mathematics and
    # any two of ...".  This is a required head plus a numbered group.
    m = re.match(
        r"^(?:any\s+)?subject\s+combination\s+which\s+includes\s+(.+?)\s+"
        r"and\s+(?:any\s+)?(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+(?:of|from)\s+(.+)$",
        seg,
        re.I | re.S,
    )
    if m:
        head = parse_head(m.group(1).strip(), allowed_codes)
        codes = group_codes(m.group(3))
        n = NUM_WORDS[m.group(2).lower()]
        if head is not None and codes and n <= len(codes):
            return head + [("one_of", n, codes)]
    # A plural "other subjects" without an explicit number is not an exact
    # requirement. Keep it on the official-text/manual-review path instead
    # of silently converting it to one subject through the broad catalogue
    # fallback below. Numbered forms such as "any other two subjects" do not
    # match this guard and remain structurally parseable.
    if (
        re.search(r"\bother\s+subjects\b", seg, re.I)
        and not re.search(r"\b(?:one|two|three|1|2|3)\s+other\s+subjects\b", seg, re.I)
    ):
        return None
    # Explicitly numbered additional subjects without a named category, e.g.
    # "Economics and two other subjects". The active exam layer supplies the
    # catalogue; the number is explicit, so this is exact rather than an
    # inference from an unnumbered plural.
    m = re.search(
        r"(?:\b(?:and\s+)?(?:any\s+)?)(one|two|three|1|2|3)\s+other\s+subjects?\s*$",
        seg,
        re.I,
    )
    if m:
        n = NUM_WORDS[m.group(1).lower()]
        head = seg[:m.start()].strip(" .;,")
        head = re.sub(r"\b(?:and|any)\s*$", "", head, flags=re.I).strip(" .;,")
        results = parse_head(head, allowed_codes)
        if results is None:
            return None
        required_codes = {p[1] for p in results if p[0] == "required"}
        alternatives = sorted(set((allowed_codes or ALL_UTME)) - required_codes)
        return results + [("one_of", n, alternatives)] if alternatives else None
    # Explicit numbered subjects from a named category, e.g. "two other
    # subjects in Arts or Social Sciences". This branch runs before the broad
    # category fallback so the count is preserved.
    m = re.search(
        r"(?:\b(?:and\s+)?(?:any\s+)?)(one|two|three|1|2|3)\s+other\s+subjects?\s+(?:in|from|of)\s+(.+)$",
        seg,
        re.I | re.S,
    )
    if m:
        n = NUM_WORDS[m.group(1).lower()]
        cat = category_codes(m.group(2), allowed_codes)
        if not cat:
            return None
        head = seg[:m.start()].strip(" .;,")
        head = re.sub(r"\b(?:and|any)\s*$", "", head, flags=re.I).strip(" .;,")
        results = parse_head(head, allowed_codes)
        if results is None:
            return None
        required_codes = {p[1] for p in results if p[0] == "required"}
        cat = sorted(set(cat) - required_codes)
        return results + [("one_of", n, cat)] if cat else None
    # A slash alternative followed by a single named category, e.g.
    # "Mathematics/Physics or one Social Science subject".
    m = re.match(
        r"^(.+?)\s+or\s+(?:one\s+)?(?:\(\s*1\s*\)\s+)?(.+?\s+subjects?)$",
        seg,
        re.I,
    )
    if m:
        left = parse_head(m.group(1).strip(), allowed_codes)
        cat = category_codes(m.group(2), allowed_codes)
        if left is not None and cat:
            codes = [p[1] for p in left if p[0] == "required"]
            codes.extend(c for p in left if p[0] == "one_of" for c in p[2])
            return [("one_of", 1, sorted(set(codes + cat)))]
    # "Any three Arts or Social Science subjects including Arabic or Islamic
    # Studies". The named inclusion is one required choice; the remaining
    # subjects come from the stated category.
    m = re.match(
        r"^(?:any\s+)?(one|two|three|1|2|3)\s+(.+?)\s+subjects?\s+including\s+(.+)$",
        seg,
        re.I,
    )
    if m:
        n = NUM_WORDS[m.group(1).lower()]
        cat = category_codes(m.group(2), allowed_codes)
        if not cat:
            return None
        include = parse_head(m.group(3), allowed_codes)
        if include is None:
            return None
        include_codes = [p[1] for p in include if p[0] == "required"]
        include_codes.extend(c for p in include if p[0] == "one_of" for c in p[2])
        if not include_codes:
            return None
        # The inclusion is one of the n subjects; require the remaining n-1
        # from the category, avoiding double counting the named choice.
        cat = sorted(set(cat) - set(include_codes))
        return [("one_of", 1, sorted(set(include_codes))), ("one_of", n - 1, cat)] if cat and n > 1 else None
    # plain single subject
    c = subj_code(seg, allowed_codes)
    if c:
        return [("required", c)]
    # slash alternatives of plain subjects: "Biology/Agricultural Science"
    if "/" in seg and not re.search(r"\b(of|from|other)\b", seg, re.I):
        slash_text = re.sub(r"^(?:and|or)\s+", "", seg, flags=re.I)
        codes = [subj_code(x, allowed_codes) for x in slash_text.split("/")]
        if all(codes):
            return [("one_of", 1, codes)]
    # "any of Physics, Biology or Agricultural Science" is a one-subject
    # alternative even when the brochure omits the number word.
    m = re.search(
        r"\b(?:any|one)(?:\s+(one|two|three|four|1|2|3|4))?\s+of\s+(.+)$",
        seg,
        re.I | re.S,
    )
    if m:
        head = seg[:m.start()].strip(" .;,")
        head = re.sub(r"\b(?:and|any)\s*$", "", head, flags=re.I).strip(" .;,")
        results = parse_head(head, allowed_codes)
        if results is None:
            return None
        codes = []
        n = NUM_WORDS.get((m.group(1) or "one").lower(), 1)
        for token in split_list(m.group(2)):
            resolved = resolve_token(token, allowed_codes)
            if resolved:
                codes.extend(resolved)
            else:
                category = category_codes(token, allowed_codes)
                if category:
                    codes.extend(category)
                else:
                    return None
        required_codes = {p[1] for p in results if p[0] == "required"}
        codes = sorted(set(codes) - required_codes)
        return results + [("one_of", n, codes)] if codes else None
    # "X, Y and one (1) of A, B, C" — leading plain subjects then a group
    m = re.search(r"(?:\b(?:and\s+)?(?:any\s+)?(?:other\s+)?(one|two|three|1|2|3)\s*(?:\(\s*\d\s*\))?\s+(?:other\s+)?(?:subjects?\s+)?(?:chosen\s+)?(?:of|from|in)\s+)(.+)$", seg, re.I | re.S)
    if m:
        n = NUM_WORDS.get(m.group(1).lower(), 1)
        head, tail = seg[:m.start()].strip(" .;,"), m.group(2)
        results = parse_head(head, allowed_codes)
        if results is None:
            return None
        codes = []
        for t in split_list(tail):
            tc = resolve_token(t, allowed_codes)
            if tc:
                codes.extend(tc)
            else:
                cat = category_codes(t, allowed_codes)
                if cat:
                    codes.extend(cat)
                else:
                    return None
        if not codes:
            return None
        required_codes = {p[1] for p in results if p[0] == "required"}
        codes = sorted(set(codes) - required_codes)
        if not codes:
            return None
        return results + [("one_of", n, codes)]
    # "X and/or two (2) other Arts or Social Science subjects" (category group,
    # possibly with a leading plain-subject head: "Government or History and two ...")
    m = re.search(r"(?:\b(?:and\s+)?(?:any\s+)?(?:other\s+)?(one|two|three|1|2|3)\s*(?:\(\s*\d\s*\))?\s*(?:other\s+)?)((?:[\w /]|-)*subjects?\.?)$", seg, re.I)
    if not m:
        # no-number variant: "any other Arts subject" -> one_of(1)
        m = re.search(r"(?:\b(?:and\s+)?any()\s+(?:other\s+)?)((?:[\w /]|-)*subjects?\.?)$", seg, re.I)
    if m:
        cat = category_codes(m.group(2), allowed_codes)
        if cat:
            n = NUM_WORDS.get((m.group(1) or "one").lower(), 1)
            head = seg[:m.start()].strip(" .;,")
            head = re.sub(r"\b(?:and|any)\s*$", "", head, flags=re.I).strip(" .;,")
            results = parse_head(head, allowed_codes)
            if results is not None:
                required_codes = {p[1] for p in results if p[0] == "required"}
                cat = sorted(set(cat) - required_codes)
                if cat:
                    return results + [("one_of", n, cat)]
    # A compact form used in some brochure cells is: "Two Arts subjects
    # including CRS and any other subject."  The first clause means two Arts
    # subjects in total, one of which is CRS; the final clause is a separate,
    # unrestricted additional subject.  Do not collapse the latter into the
    # Arts category unless the source says "relevant" or names a category.
    m = re.match(
        r"^(?P<number>one|two|three|four|1|2|3|4)\s+"
        r"(?P<category>arts?|social\s+sciences?|science|sciences?|commercial)\s+"
        r"subjects?\s+including\s+(?P<include>.+?)\s+and\s+(?:any\s+)?other\s+subject$",
        seg,
        re.I | re.S,
    )
    if m:
        total = NUM_WORDS[m.group("number").lower()]
        category = category_codes(m.group("category"), allowed_codes)
        include = parse_head(m.group("include"), allowed_codes)
        include_codes = (
            [part[1] for part in include if part[0] == "required"]
            + [code for part in include if part[0] == "one_of" for code in part[2]]
            if include is not None
            else []
        )
        if category and include_codes and total > len(include_codes):
            category_choices = sorted(set(category) - set(include_codes))
            unrestricted = sorted(set(allowed_codes or ALL_UTME) - set(include_codes))
            if category_choices and unrestricted:
                head = [
                    ("required", code)
                    for code in include_codes
                ]
                return head + [
                    ("one_of", total - len(include_codes), category_choices, "distinct_1"),
                    ("one_of", 1, unrestricted, "distinct_1"),
                ]
    # "any other Science subject" / "one other Arts subject" (bare category, no number list)
    m = re.match(r"^(?:and\s+)?(?:any|one)\s+other\s+(.+?subjects?)$", seg, re.I)
    if m:
        cat = category_codes(m.group(1), allowed_codes)
        if cat:
            return [("one_of", 1, cat)]
    # "any other subjects in Arts or Social Science" has the category after
    # the word "subjects", rather than before it.
    m = re.search(
        r"(?:\b(?:and\s+)?(?:any\s+)?(?:other\s+)?subject\s+(?:of|from|in)\s+)(.+)$",
        seg,
        re.I | re.S,
    )
    if m:
        cat = category_codes(m.group(1), allowed_codes)
        if cat:
            head = seg[:m.start()].strip(" .;,")
            head = re.sub(r"\b(?:and|any)\s*$", "", head, flags=re.I).strip(" .;,")
            results = parse_head(head, allowed_codes)
            if results is None:
                return None
            required_codes = {p[1] for p in results if p[0] == "required"}
            cat = sorted(set(cat) - required_codes)
            return results + [("one_of", 1, cat)] if cat else None
    # Bare "other subject(s)" means one additional subject from the active
    # exam catalogue when the brochure does not name a category.
    m = re.search(r"(?:\b(?:and\s+)?(?:any\s+)?other\s+subject)$", seg, re.I)
    if m:
        head = seg[:m.start()].strip(" .;,")
        head = re.sub(r"\b(?:and|any)\s*$", "", head, flags=re.I).strip(" .;,")
        results = parse_head(head, allowed_codes)
        if results is None:
            return None
        required_codes = {p[1] for p in results if p[0] == "required"}
        alternatives = sorted(set((allowed_codes or ALL_UTME)) - required_codes)
        return results + [("one_of", 1, alternatives)] if alternatives else None
    # comma list of plain subjects: "Biology, Mathematics, Economics, Geography"
    # Keep slash alternatives intact in a comma list; ``split_list`` is
    # intentionally broader for other grammar branches and splits `/`.
    items = [
        part.strip(" .;,")
        for part in re.split(r",|;|\s+and\s+|\s+or\s+", seg, flags=re.I)
        if part.strip(" .;,")
    ]
    if len(items) > 1 and not re.search(r"\bor\b", seg, re.I):
        parts = []
        for x in items:
            if "/" in x and not re.search(r"\b(?:of|from|other)\b", x, re.I):
                alternatives = [subj_code(value, allowed_codes) for value in x.split("/")]
                if not alternatives or not all(alternatives):
                    return None
                parts.append(("one_of", 1, sorted(set(alternatives))))
                continue
            xc = resolve_token(x, allowed_codes)
            if not xc:
                return None
            parts.extend(("required", c) for c in xc)
        return parts
    # "A or B or C" — pure alternative list
    if re.search(r"\bor\b", seg, re.I):
        return parse_head(seg, allowed_codes) or None
    return None


CROSS_REF_RE = re.compile(r"^\s*(?:same\s+)?as\s+(?:in\s+|for\s+)?([A-Za-z][\w ,&/-]{2,60}?)\s*(?:[.;(]|$)", re.I)


def parse_utme(text, allowed_codes=None, context_codes=None):
    """Full utme text -> list of parts, ('ref', name) for a pure cross-reference,
    or None (needs_review)."""
    # A parenthetical note such as "(same as in Arabic Studies)" does not
    # change the preceding explicit combination. Pure cross-references remain
    # review-only, but this safe annotation should not poison an otherwise
    # structured rule.
    clean_text = re.sub(r"\(\s*same\s+as\s+in[^)]*\)", "", text, flags=re.I).strip()
    ref = CROSS_REF_RE.match(clean_text)
    if ref and len(clean_text) < 140:
        return ("ref", ref.group(1).strip())
    if REJECT_MARKERS.search(clean_text) or len(clean_text) > 300:
        return None
    parts = []
    for seg in re.split(r";", clean_text):
        r = parse_segment(seg, allowed_codes or UTME_CODES, context_codes=context_codes)
        if r is None:
            return None
        parts.extend(r)
    # A requirement group cannot reuse a subject already required elsewhere in
    # the same programme. This matters when brochure punctuation puts the
    # required subject before a semicolon, e.g. "Yoruba; and two other Arts
    # subjects". Removing it globally prevents a two-subject group from being
    # satisfied by Yoruba plus only one additional subject.
    required_all = {p[1] for p in parts if p[0] == "required"}
    normalized_parts = []
    for part in parts:
        if part[0] == "one_of":
            codes = sorted(set(part[2]) - required_all)
            if not codes or part[1] > len(codes):
                return None
            normalized_parts.append(("one_of", part[1], codes, *part[3:]))
        else:
            normalized_parts.append(part)
    parts = normalized_parts
    # dedupe required
    seen, out = set(), []
    for p in parts:
        key = p[:2] if p[0] == "required" else (p[0], tuple(p[2]))
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
    return out or None


OLEVEL_COUNT_RE = re.compile(
    r"(seven|six|five|four|three|two|one|7|6|5|4|3|2|1)\s*(?:\(\s*\d\s*\))?\s*"
    r"(?:ssce?|ssc|o.?\s?level)?\s*credits?",
    re.I,
)


def parse_olevel(text, context_codes=None):
    """Return (total_credit_minimum, structured parts) for a national O-level rule.

    The total credit count is not itself a subject. Named subjects and
    alternatives are parsed separately so the matcher can require both,
    e.g. English + Mathematics + Economics + any two alternatives. Prose with
    institution-level exceptions stays on the text/manual-review path.
    """
    if not text or len(text) > 500 or REJECT_MARKERS.search(text):
        inline_same_as = re.match(
            r"^\s*same\s+as\s+in\s+[^()]+\((?P<body>.+)\)\s*[.]?\s*$",
            text or "",
            re.I | re.S,
        )
        if inline_same_as:
            return parse_olevel(inline_same_as.group("body"), context_codes=context_codes)
        return None

    # A brochure cell can contain a general applicant rule followed by a
    # conditional rule for NBC/NTC/TC-II holders.  The conditional list must
    # not be applied to ordinary applicants, but it must not poison the valid
    # general rule either.  Parse the general clause here and retain the full
    # original text in the seed for detail/review display.
    general_clause = re.split(
        r"\s+(?:for|in)\s+(?:nbc|ntc|nabteb|tc\s*ii|technic(?:al)?\s+certificate)\s+(?:holders?|candidates?)?\b",
        text,
        maxsplit=1,
        flags=re.I,
    )[0].strip(" .;,:-")
    if general_clause and general_clause != text.strip(" .;,:-"):
        return parse_olevel(general_clause, context_codes=context_codes)
    count = OLEVEL_COUNT_RE.search(text)
    if not count:
        return None
    n_min = NUM_WORDS.get(count.group(1).lower())
    if not n_min:
        return None
    tail = text[count.end():].strip(" .;,:-")
    tail = re.sub(r"\s+or\s+equivalents?$", "", tail, flags=re.I)
    tail = re.sub(
        r"^(?:pass(?:es)?|credit(?:s)?)?\s*(?:to\s+include|including|in|from|to\s+contain|"
        r"which\s+must\s+include|with)\s*",
        "",
        tail,
        flags=re.I,
    )
    tail = re.sub(r"^(?:pass(?:es)?|credit(?:s)?)\s+", "", tail, flags=re.I)
    # The national matcher models credit requirements only. A lower-level
    # pass, sitting/equivalence rule, or similar qualification condition
    # cannot be represented by the subject-credit schema without changing the
    # meaning of the source. Keep such rows as official text/review evidence.
    if re.search(
        r"\bat\s+least\b|\b(?:o['’]?\s*level\s+)?passes?\s+in\b|\b(?:tc\s*ii|ntc|nbc)\b",
        tail,
        re.I,
    ):
        return None
    # A count without named subjects is not enough for a structured subject
    # option; retain its official text for display instead.
    if not tail:
        return None

    # O-level prose often uses a category as the remaining credit rule:
    # ``English Language and Arts subjects`` or ``English Language and four
    # relevant subjects``.  parse_segment cannot safely handle that sentence
    # because ``Arts subjects`` is not a named subject.  Preserve the named
    # head and represent the remaining credits explicitly; otherwise a seeded
    # row can contain only English while still claiming to be a five-credit
    # exact rule.
    category_tail = re.match(
        r"^(?P<head>.+?)\s+(?:and|,)\s+(?:any\s+)?"
        r"(?:(?:other)\s+)?"
        r"(?:(?P<number>one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+)?"
        r"(?:(?:other|relevant)\s+)?"
        r"(?P<category>arts?|social\s+sciences?|science|sciences?)"
        r"(?:\s+subjects?)?\.?$",
        tail,
        re.I | re.S,
    )
    if category_tail:
        head = parse_head(category_tail.group("head"), OLEVEL_CODES)
        category = category_codes(category_tail.group("category") + " subjects", OLEVEL_CODES)
        if head is not None and category:
            required_codes = {
                part[1]
                for part in head
                if part[0] == "required"
            }
            explicit_count = sum(
                1 if part[0] == "required" else int(part[1])
                for part in head
            )
            number = (
                NUM_WORDS[category_tail.group("number").lower()]
                if category_tail.group("number")
                else n_min - explicit_count
            )
            category = sorted(set(category) - required_codes)
            if number > 0 and number <= len(category):
                return n_min, head + [("one_of", number, category)]

    # Resolve a vague qualifier when the same source sentence supplies its
    # exact scope, for example: “two other relevant subjects could be from
    # any of Accounting, Commerce and Office Practice”.  This is different
    # from “two other relevant subjects” with no list, which remains review.
    explicit_scope = re.match(
        r"^(?P<head>.+?)\s+(?:and|,)\s+(?:any\s+)?"
        r"(?:(?P<number>one|two|three|four|1|2|3|4)\s+)?"
        r"(?:other\s+)?(?:relevant|suitable|appropriate|related|cognate|pertinent)\s+"
        r"subjects?\s+(?:could\s+be\s+)?(?:from|of)\s+(?:any\s+of\s+)?"
        r"(?P<scope>.+?)\.?$",
        tail,
        re.I | re.S,
    )
    if explicit_scope:
        head = parse_head(explicit_scope.group("head"), OLEVEL_CODES)
        scope_text = explicit_scope.group("scope")
        scope_codes = []
        category = category_codes(scope_text, OLEVEL_CODES)
        if category:
            scope_codes.extend(category)
        else:
            for token in split_list(scope_text):
                resolved = resolve_token(token, OLEVEL_CODES)
                if not resolved:
                    category = category_codes(token, OLEVEL_CODES)
                    if not category:
                        scope_codes = []
                        break
                    resolved = category
                scope_codes.extend(resolved)
        if head is not None and scope_codes:
            required_codes = {part[1] for part in head if part[0] == "required"}
            scope_codes = sorted(set(scope_codes) - required_codes)
            explicit_count = sum(
                1 if part[0] == "required" else int(part[1])
                for part in head
            )
            number = (
                NUM_WORDS[explicit_scope.group("number").lower()]
                if explicit_scope.group("number")
                else n_min - explicit_count
            )
            if number > 0 and number <= len(scope_codes):
                return n_min, head + [("one_of", number, scope_codes)]

    # Resolve an unlisted qualifier from a narrow programme-level scope
    # supplied by the UTME rule. This is the contextual bridge for rows such
    # as “English, Arabic and three other relevant subjects” when the same
    # programme explicitly defines its UTME choices as Arts/Social Science
    # subjects. A scope that is broad enough to mean “the whole catalogue” is
    # never passed here by the generator.
    if context_codes:
        contextual = re.search(
            r"(?:\b(?:and|,|;)\s*)(?:any\s+)?"
            r"(?:(?P<number>one|two|three|four|1|2|3|4)\s*(?:\(\s*\d\s*\))?\s+)?"
            r"(?:other\s+)?(?:relevant|suitable|appropriate|related|cognate|pertinent)\s+"
            r"subjects?\b",
            tail,
            re.I,
        )
        if contextual:
            head = tail[:contextual.start()].strip(" .;,")
            head = re.sub(r"\b(?:and|any)\s*$", "", head, flags=re.I).strip(" .;,")
            results = parse_head(head, OLEVEL_CODES)
            if results is not None:
                required_codes = {part[1] for part in results if part[0] == "required"}
                scope_codes = sorted(set(context_codes) - required_codes)
                explicit_count = sum(
                    1 if part[0] == "required" else int(part[1])
                    for part in results
                )
                number = (
                    NUM_WORDS[contextual.group("number").lower()]
                    if contextual.group("number")
                    else n_min - explicit_count
                )
                if number > 0 and number <= len(scope_codes):
                    return n_min, results + [("one_of", number, scope_codes)]

    # “Relevant”, “suitable”, and similar wording is not a subject category.
    # The brochure does not tell the matcher which catalogue subjects qualify,
    # so expanding it to the entire O-level catalogue would create false
    # positives. Keep the official requirement text and typed review record,
    # but do not emit an executable option until the scope is source-resolved.
    if re.search(
        r"\b(?:relevant|suitable|appropriate|related|cognate|pertinent)\s+subjects?\b"
        r"|\bshares?\s+(?:the\s+)?block\b",
        tail,
        re.I,
    ):
        return None

    # A named head followed by an explicitly numbered but unqualified set of
    # relevant/other subjects means the remaining credits are unrestricted by
    # subject family.  Keep the count exact rather than dropping the group.
    generic_tail = re.match(
        r"^(?P<head>.+?)\s+(?:and|,)\s+(?:any\s+)?"
        r"(?:(?:other)\s+)?"
        r"(?P<number>one|two|three|four|1|2|3|4)\s+"
        r"(?:(?:other|relevant)\s+)?subjects?\.?$",
        tail,
        re.I | re.S,
    )
    if generic_tail:
        head = parse_head(generic_tail.group("head"), OLEVEL_CODES)
        if head is not None:
            required_codes = {
                part[1]
                for part in head
                if part[0] == "required"
            }
            number = NUM_WORDS[generic_tail.group("number").lower()]
            choices = sorted(set(OLEVEL_CODES) - required_codes)
            if number > 0 and number <= len(choices):
                return n_min, head + [("one_of", number, choices)]

    parts = parse_segment(tail, OLEVEL_CODES, context_codes=context_codes)
    if not parts:
        # Some university exceptions constrain the entire credit count to a
        # category without using the numbered-group grammar, e.g. ``two
        # credit passes only in Social Sciences subjects``.
        category = category_codes(tail, OLEVEL_CODES)
        category_only = re.fullmatch(
            r"(?:any\s+)?(?:arts?|social\s+sciences?|science|sciences?)"
            r"(?:\s+subjects?)?\.?",
            tail,
            re.I,
        )
        if category and category_only and n_min <= len(category):
            parts = [("one_of", n_min, sorted(set(category)))]
    if not parts:
        # ``five other subjects including English and Literature`` gives an
        # exact total and explicitly named inclusions; the remaining credits
        # are genuinely unspecified, so represent them as a catalogue-wide
        # group rather than dropping the usable named requirements.
        included = re.match(
            r"^(?:the\s+)?(?:other\s+)?subjects?\s+including\s+(.+)$",
            tail,
            re.I | re.S,
        )
        if included:
            named = parse_head(included.group(1), OLEVEL_CODES)
            if named:
                named_count = sum(1 for part in named if part[0] == "required")
                named_count += sum(int(part[1]) for part in named if part[0] == "one_of")
                if named_count <= n_min:
                    used = {part[1] for part in named if part[0] == "required"}
                    choices = sorted(set(OLEVEL_CODES) - used)
                    parts = named + ([ ("one_of", n_min - named_count, choices) ] if n_min > named_count else [])
    if not parts:
        return None

    # If the brochure names only required inclusions (for example, "five
    # credits including English Language"), the remaining credits are still
    # part of the exact five-credit rule. Represent them as an unrestricted
    # group. This prevents the matcher from accepting a one-subject option as
    # though it were the whole O-level requirement.
    explicit_count = sum(
        1 if part[0] == "required" else int(part[1])
        for part in parts
    )
    if explicit_count < n_min and not any(part[0] == "one_of" for part in parts):
        required_codes = {
            part[1]
            for part in parts
            if part[0] == "required"
        }
        choices = sorted(set(OLEVEL_CODES) - required_codes)
        remaining = n_min - explicit_count
        if remaining <= len(choices):
            parts = parts + [("one_of", remaining, choices)]
    explicit_count = sum(
        1 if part[0] == "required" else int(part[1])
        for part in parts
    )
    # A parsed option must account for all five (or otherwise stated) credit
    # places. If a numbered group is shorter than the total and the parser has
    # no faithful way to represent the omitted condition, leave the source on
    # review instead of publishing a partial exact rule.
    if explicit_count != n_min:
        return None
    return n_min, parts


def main():
    # collect programmes exactly like _gen_seed.py (offerings + enrich overlay)
    progs = {}
    for f in sorted(glob.glob(os.path.join(HERE, "jamb", "*_offerings.json"))):
        d = json.load(open(f, encoding="utf-8"))
        for p in d["programmes"]:
            progs.setdefault(p["jamb_name"], p)
    enrich_overlays = []
    for f in sorted(glob.glob(os.path.join(HERE, "jamb", "enrich", "*.json"))):
        if os.path.basename(f).startswith("_"):
            continue
        e = json.load(open(f, encoding="utf-8"))
        enrich_overlays.append(e)
    from _jamb_source_rules import apply_enrich_requirement_overlays
    apply_enrich_requirement_overlays(progs, enrich_overlays)
    # A small, source-reviewed overlay repairs PDF extraction artefacts in the
    # broad offering files.  It is kept separate so the raw brochure extract
    # remains auditable and every replacement carries source_file/source_page.
    override_path = os.path.join(HERE, "jamb", "brochure_subject_overrides.json")
    if os.path.exists(override_path):
        overrides = json.load(open(override_path, encoding="utf-8"))
        from _jamb_source_rules import apply_brochure_subject_overrides
        apply_brochure_subject_overrides(progs, overrides)
    from _jamb_source_rules import apply_source_rules_to_programmes

    source_rule_stats = apply_source_rules_to_programmes(progs)
    source_report = {}
    if os.path.exists(SOURCE_RULES_PATH):
        with open(SOURCE_RULES_PATH, encoding="utf-8") as fh:
            source_report = json.load(fh)

    SQL = ["-- AUTO-GENERATED by data/career-mapping/_parse_subject_options.py — DO NOT EDIT",
           "-- Structured UTME and O-level subject options parsed from the JAMB brochure text.",
           "-- Only exact structured rows are emitted for subject matching; review text remains detail-only.",
           "SET search_path TO skillup_dev;", "BEGIN;",
           "-- deterministic regeneration: clear previously parsed rows first",
           "DELETE FROM programme_subject_option_items;",
           "DELETE FROM programme_subject_options;",
           "UPDATE programme_subject_requirements SET parse_status='unparsed', parsed_at=NULL;", ""]

    stats = Counter()
    parsed_names, review_names = [], []

    # ── pass 1: parse every programme's UTME text ────────────────
    utme_text, olevel_text, parsed, refs, olevel_refs = {}, {}, {}, {}, {}
    olevel_rules = {}
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
        if olevel_text[jname]:
            olevel_rules[jname] = parse_olevel(olevel_text[jname])
            same_as = re.match(
                r"^\s*same\s+as\s+(?:in|for)\s+([^(.]+?)(?:\s*\(|\s*$)",
                olevel_text[jname],
                re.I,
            )
            if same_as:
                olevel_refs[jname] = same_as.group(1).strip()

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

    # O-level columns use the same cross-reference convention but can carry
    # the inherited sentence in parentheses. Resolve both forms before trying
    # to infer a qualifier from the programme's UTME context.
    for _ in range(2):
        for jname, target in list(olevel_refs.items()):
            t = by_lower.get(target.lower())
            if t and olevel_rules.get(t):
                olevel_rules[jname] = olevel_rules[t]
                del olevel_refs[jname]
                stats["olevel_ref_resolved"] += 1

    def narrow_scope(parts, allowed_codes, source_codes):
        """Return a useful cross-layer scope, never a catalogue-wide one."""
        if not parts:
            return None
        codes = {
            part[1]
            for part in parts
            if part[0] == "required"
        }
        codes.update(
            code
            for part in parts
            if part[0] == "one_of"
            for code in part[2]
        )
        codes &= set(allowed_codes)
        source_coverage = len(codes & set(source_codes)) / max(1, len(source_codes))
        # A scope that covers most of the source exam catalogue is effectively
        # “any subject”; it is not useful context for the other exam layer.
        if not codes or source_coverage >= 0.70:
            return None
        return codes

    # Resolve undefined “relevant/suitable/appropriate” wording from the same
    # programme's other exam layer when that layer has a narrow, executable
    # subject/category rule. This is what turns Arabic's O-level “relevant”
    # wording into its documented Arts/Social-Science scope without applying
    # unrelated science/trade subjects. Never use a university waiver as the
    # national scope.
    for jname in sorted(progs):
        if olevel_text[jname] and not olevel_rules.get(jname):
            context = narrow_scope(parsed.get(jname), OLEVEL_CODES, UTME_CODES)
            if context:
                candidate = parse_olevel(olevel_text[jname], context_codes=context)
                if candidate:
                    olevel_rules[jname] = candidate
                    stats["olevel_context_resolved"] += 1
        if utme_text[jname] and not parsed.get(jname):
            context = narrow_scope(
                [
                    ("required", part[1]) if part[0] == "required" else part
                    for part in (olevel_rules.get(jname)[1] if olevel_rules.get(jname) else [])
                ],
                UTME_CODES,
                OLEVEL_CODES,
            )
            if context:
                candidate = parse_utme(utme_text[jname], context_codes=context)
                if candidate and not (isinstance(candidate, tuple) and candidate[0] == "ref"):
                    parsed[jname] = candidate
                    stats["utme_context_resolved"] += 1

    # Do not promote the first parseable brochure variant into the national
    # matcher. A source variant can belong to a university-specific offering or
    # to a neighbouring programme block in the extracted PDF. Unique source
    # repairs have already been applied to the canonical programme field above;
    # unresolved or conflicting variants remain in the typed source-rule seed
    # and are detail/review evidence, never national eligibility rules.

    # ── emit ─────────────────────────────────────────────────────
    for jname in sorted(progs):
        jid = uid("jamb", jname)
        rid = uid("psr", jname)
        utme, olevel = utme_text[jname], olevel_text[jname]

        if not utme and not olevel:
            stats["empty"] += 1
            continue

        parts = parsed.get(jname)
        utme_needs_review = bool(utme and parts is None)
        olevel_rule = olevel_rules.get(jname)
        olevel_needs_review = bool(olevel and olevel_rule is None)
        layer_needs_review = utme_needs_review or olevel_needs_review
        if layer_needs_review:
            # Institution-variant prose: no single structured rule exists, but the
            # text is real information — keep it displayable (parse_status
            # needs_review = "requirements vary by institution" in the UI),
            # but never use it as an exact subject-match rule.
            stats["needs_review"] += 1
            review_text = utme if utme_needs_review else olevel
            review_names.append((jname, review_text[:140]))
            SQL.append(f"UPDATE programme_subject_requirements SET parse_status='needs_review' WHERE id = {q(rid)};")

        if parts:
            oid = uid("subj_opt", jname, "utme")
            n_req = sum(1 for x in parts if x[0] == "required")
            n_grp = sum(x[1] for x in parts if x[0] == "one_of")
            SQL.append(
                f"INSERT INTO programme_subject_options (id, jamb_programme_id, requirement_id, exam_type, option_label, min_required, source_text, source_url) "
                f"SELECT {q(oid)}, {q(jid)}, {q(rid)}, 'utme', 'UTME combination', {n_req + n_grp}, {q(utme)}, {q(SOURCE_URL)} "
                f"WHERE EXISTS (SELECT 1 FROM jamb_programmes WHERE id = {q(jid)}) "
                f"ON CONFLICT (id) DO UPDATE SET min_required=EXCLUDED.min_required, source_text=EXCLUDED.source_text, source_url=EXCLUDED.source_url;"
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
                    _, n, codes = part[:3]
                    distinct_group = part[3] if len(part) > 3 else None
                    gi += 1
                    gk = f"group_{gi}"
                    for code in codes:
                        SQL.append(
                            f"INSERT INTO programme_subject_option_items (id, option_id, subject_id, requirement_role, group_key, min_from_group, distinct_group_key) "
                            f"SELECT {q(uid('subj_item', jname, 'utme', gk, code))}, {q(oid)}, sc.id, 'one_of', {q(gk)}, {n}, {q(distinct_group)} "
                            f"FROM subject_catalog sc WHERE sc.code = {q(code)} "
                            f"AND EXISTS (SELECT 1 FROM programme_subject_options WHERE id = {q(oid)}) "
                            f"ON CONFLICT DO NOTHING;"
                        )
            stats["utme_parsed"] += 1
            parsed_names.append(jname)

        # O-level: preserve the total credit minimum and structured required /
        # alternative subjects.  Unparseable institutional prose remains in
        # the official text and is not emitted as a false structured rule.
        if olevel_rule:
            n_min, olevel_parts = olevel_rule
            ooid = uid("subj_opt", jname, "olevel")
            explicit_min = sum(1 for x in olevel_parts if x[0] == "required")
            explicit_min += sum(x[1] for x in olevel_parts if x[0] == "one_of")
            total_min = max(n_min, explicit_min)
            SQL.append(
                f"INSERT INTO programme_subject_options (id, jamb_programme_id, requirement_id, exam_type, option_label, min_required, source_text, source_url) "
                f"SELECT {q(ooid)}, {q(jid)}, {q(rid)}, 'olevel', '{n_min} credit passes', {total_min}, {q(olevel)}, {q(SOURCE_URL)} "
                f"WHERE EXISTS (SELECT 1 FROM jamb_programmes WHERE id = {q(jid)}) "
                f"ON CONFLICT (id) DO UPDATE SET min_required=EXCLUDED.min_required, source_text=EXCLUDED.source_text, source_url=EXCLUDED.source_url;"
            )
            gi = 0
            for part in olevel_parts:
                if part[0] == "required":
                    code = part[1]
                    SQL.append(
                        f"INSERT INTO programme_subject_option_items (id, option_id, subject_id, requirement_role) "
                        f"SELECT {q(uid('subj_item', jname, 'olevel', 'req', code))}, {q(ooid)}, sc.id, 'required' "
                        f"FROM subject_catalog sc WHERE sc.code = {q(code)} "
                        f"AND EXISTS (SELECT 1 FROM programme_subject_options WHERE id = {q(ooid)}) "
                        f"ON CONFLICT DO NOTHING;"
                    )
                else:
                    _, n, codes = part[:3]
                    distinct_group = part[3] if len(part) > 3 else None
                    gi += 1
                    gk = f"group_{gi}"
                    for code in codes:
                        SQL.append(
                            f"INSERT INTO programme_subject_option_items (id, option_id, subject_id, requirement_role, group_key, min_from_group, distinct_group_key) "
                            f"SELECT {q(uid('subj_item', jname, 'olevel', gk, code))}, {q(ooid)}, sc.id, 'one_of', {q(gk)}, {n}, {q(distinct_group)} "
                            f"FROM subject_catalog sc WHERE sc.code = {q(code)} "
                            f"AND EXISTS (SELECT 1 FROM programme_subject_options WHERE id = {q(ooid)}) "
                            f"ON CONFLICT DO NOTHING;"
                        )
            stats["olevel_parsed"] += 1

        if (parts or olevel_rule) and not layer_needs_review:
            SQL.append(f"UPDATE programme_subject_requirements SET parse_status='parsed', parsed_at={q(NOW)} WHERE id = {q(rid)};")

    SQL.extend([
        "",
        "-- Fail the SQL transaction if a supposedly structured option is empty",
        "-- or its declared minimum is larger than the represented required/group",
        "-- capacity. This catches truncated SQL or a stale subject catalogue.",
        "DO $$",
        "BEGIN",
        "  IF EXISTS (",
        "    WITH required_counts AS (",
        "      SELECT option_id, COUNT(*)::smallint AS required_count",
        "      FROM programme_subject_option_items",
        "      WHERE requirement_role = 'required'",
        "      GROUP BY option_id",
        "    ), group_counts AS (",
        "      SELECT option_id, group_key, MAX(COALESCE(min_from_group, 1))::smallint AS group_min",
        "      FROM programme_subject_option_items",
        "      WHERE requirement_role = 'one_of' AND group_key IS NOT NULL",
        "      GROUP BY option_id, group_key",
        "    ), group_sums AS (",
        "      SELECT option_id, SUM(group_min)::smallint AS group_capacity",
        "      FROM group_counts",
        "      GROUP BY option_id",
        "    ), item_counts AS (",
        "      SELECT o.id, o.min_required,",
        "        COUNT(i.id) AS item_count,",
        "        COUNT(i.id) FILTER (WHERE i.requirement_role = 'required')::smallint AS required_count",
        "      FROM programme_subject_options o",
        "      LEFT JOIN programme_subject_option_items i ON i.option_id = o.id",
        "      GROUP BY o.id, o.min_required",
        "    ), capacities AS (",
        "      SELECT i.id, i.min_required, i.item_count,",
        "        i.required_count + COALESCE(g.group_capacity, 0) AS represented_capacity",
        "      FROM item_counts i LEFT JOIN group_sums g ON g.option_id = i.id",
        "    )",
        "    SELECT 1 FROM capacities",
        "    WHERE item_count = 0 OR represented_capacity < min_required",
        "  ) THEN",
        "    RAISE EXCEPTION 'Subject option seed contains an incomplete structured rule';",
        "  END IF;",
        "END $$;",
    ])
    SQL.append("COMMIT;")
    dest = os.path.join(HERE, "..", "..", "backend", "seed_subject_options.sql")
    open(dest, "w", encoding="utf-8").write("\n".join(SQL))

    total = len(progs)
    print(f"programmes: {total}")
    print(f"  utme parsed       : {stats['utme_parsed']} (incl. {stats['ref_resolved']} via 'as in X' reference)")
    print(f"  olevel parsed     : {stats['olevel_parsed']}")
    print(f"  needs_review      : {stats['needs_review']}")
    print(f"  empty requirement : {stats['empty']}")
    print(f"  source-rule repairs: {source_rule_stats['applied']}")
    print(f"-> {os.path.abspath(dest)}")
    if review_names:
        print("\nneeds_review programmes (with the text that failed):")
        for n, txt in review_names[:62]:
            print(f"  - {n}\n      {txt}")
        if len(review_names) > 62:
            print(f"  ... and {len(review_names) - 62} more")


if __name__ == "__main__":
    main()
