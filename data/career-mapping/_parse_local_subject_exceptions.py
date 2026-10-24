#!/usr/bin/env python3
"""Strict parser for institution-scoped subject requirement notes.

University notes are not national JAMB rules.  This parser only promotes a
note when its subject statement can be represented without guessing.  Notes
that refer to another programme, alter a requirement, contain sitting or
screening conditions, or use an unsupported category remain review-only.
"""

import re

from _parse_subject_options import (
    NUM_WORDS,
    OLEVEL_COUNT_RE,
    OLEVEL_CODES,
    ARTS,
    SOCIAL,
    UTME_CODES,
    parse_olevel,
    parse_head,
    parse_segment,
    parse_utme,
)

# A university exception may explicitly name a technical/trade subject in a
# UTME combination even when that subject is not part of the national picker
# layer.  Keep the national UTME catalogue unchanged, but allow the local
# parser to preserve such source-backed exceptions instead of dropping them.
LOCAL_UTME_CODES = set(UTME_CODES) | set(OLEVEL_CODES)


_DIRECT_ENTRY = re.compile(
    r"\b(?:direct\s+entry|a\s*['’]?\s*level|a\.\s*level|ijmb|jupeb|nce|"
    r"nd\s*/?\s*hnd|\bnd\b|ond|hnd)\b",
    re.I,
)
_UTME_MARKER = re.compile(r"\bUTME(?:\s+SUBJECTS?)?\s*:?", re.I)
_OLEVEL_MARKER = re.compile(
    r"(?:\bO\s*['’]?\s*Level\b|\bO/L\b|\bSSCE?\b|\bSSC\b|"
    r"\bcredit\s+pass(?:es)?\b|\bcredits?\b|\bsittings?\b)", re.I
)
_CROSS_REFERENCE = re.compile(
    r"\b(?:same\s+as|as\s+in|as\s+for|applicable\s+to|see\s+the)\b", re.I
)
_UNSAFE_MODIFIER = re.compile(
    r"\b(?:in\s+lieu|not\s+compulsory|not\s+acceptable|do(?:es)?\s+not\s+accept|"
    r"accepts?\s+pass|pass\s+in|except|waiv(?:e|es|er)|minimum\s+entry|"
    r"post\s*utme|screening|relevant|management\s+subject)\b",
    re.I,
)
_SITTING_CONDITION = re.compile(
    r"\b(?:one|two|1|2)\s+sittings?\b|\b(?:maximum\s+of|at\s+most)\s+(?:one|two|1|2)\s+sittings?\b",
    re.I,
)
_SUPPORTED_SITTING_CONDITION = re.compile(
    r"\b(?:at\s+)?(?:not\s+more\s+than|at\s+most)\s+(?:two|2)\s*"
    r"(?:\(\s*2\s*\)\s*)?sittings?\b"
    r"|\bmaximum\s+of\s+(?:one|two|1|2)\s*(?:\(\s*[12]\s*\)\s*)?sittings?\b"
    r"|\b(?:one|two|1|2)\s*(?:\(\s*[12]\s*\))?\s+sittings?\b"
    r"|\b(?:one|two|1|2)\s+or\s+(?:two|2)\s*(?:\(\s*2\s*\))?\s+sittings?\b",
    re.I,
)

_OLEVEL_TOTAL_RE = re.compile(
    r"\b(seven|six|five|four|three|two|one|7|6|5|4|3|2|1)\s*"
    r"(?:\(\s*\d\s*\))?\s*"
    r"(?:ssce?|ssc|o[./]?\s*level|wassce|gce|neco|nabteb)?\s*"
    r"(?:(?:credit\s+)?pass(?:es)?|credits?)\b",
    re.I,
)
_OLEVEL_COUNT_ANY_RE = re.compile(
    r"\b(seven|six|five|four|three|two|one|7|6|5|4|3|2|1)\s*"
    r"(?:\(\s*\d\s*\))?\b(?=[^.;]{0,120}\b(?:credit|pass(?:es)?|credits?)\b)",
    re.I,
)


def _strip_source_prefix(text: str, marker_match: re.Match | None) -> str:
    """Remove the route marker and institution lead-in, preserving the rule."""
    body = text[marker_match.end() :] if marker_match else text
    body = body.strip(" \t:-")

    # Local notes normally read ``LAGOS requires ...`` or ``ABU accepts ...``.
    # The first requirement verb is the reliable boundary; it avoids treating
    # the institution code as a subject token.
    m = re.search(r"\b(?:requires?|accepts?|insists\s+on)\b\s*", body, re.I)
    if m:
        body = body[m.end() :]
    else:
        # A route marker can introduce a bare subject combination directly,
        # for example ``UTME subjects: Mathematics, Physics and Chemistry``.
        # There is no institution verb to strip in that form; the marker is
        # already the authoritative boundary.
        if marker_match:
            return re.sub(r"\s+", " ", body).strip(" .;:")
        # Some extracted waiver bullets omit the verb entirely, e.g.
        # ``AAUA five O-Level credit passes to include ...``.  The count or
        # O-level marker still gives us a safe boundary; discard only the
        # institution/footnote prefix before it.
        implicit = re.search(
            r"\b(?:seven|six|five|four|three|7|6|5|4|3)\s*"
            r"(?:\(\s*\d\s*\))?\s*(?:O\s*['â€™]?\s*Level|O/L|"
            r"SSCE?|SSC|credit(?:\s+pass(?:es)?)?|credits?)\b",
            body,
            re.I,
        )
        if implicit:
            return re.sub(r"\s+", " ", body[implicit.start():]).strip(" .;:")
        # A fragment extracted from a mixed direct-entry note can already
        # begin with ``O Level`` or a credit/pass statement and therefore has
        # no institution verb left to strip.
        if not re.match(
            r"^(?:O\s*['â€™]?\s*Level|O/L|SSCE?|SSC|credit|pass(?:es)?|"
            r"(?:seven|six|five|four|three|7|6|5|4|3)\b)",
            body,
            re.I,
        ):
            # Hyphenated notes such as ``UNIZIK - ...`` are not complete rules.
            return ""
    return re.sub(r"\s+", " ", body).strip(" .;:")


def _extract_subject_fragment(text: str) -> str:
    """Extract an explicit subject clause from a mixed direct-entry note.

    Direct-entry prose often contains a usable O-level condition after the
    qualification rule.  We can safely expose that condition while keeping
    the direct-entry prose in the raw evidence row.  If there is no explicit
    subject clause, return an empty string so the note remains non-picker
    evidence rather than being guessed into a subject rule.
    """
    count = re.search(
        r"\b(?:seven|six|five|four|three|7|6|5|4|3)\s*"
        r"(?:\(\s*\d\s*\))?\s*"
        r"(?:(?:ssce?|ssc|o[./]?\s*level|wassce|gce|neco|nabteb)\s*"
        r"(?:(?:credit\s+)?pass(?:es)?|credits?)|credit\s+pass(?:es)?)\b",
        text,
        re.I,
    )
    if count:
        fragment = text[count.start() :]
        # Direct-entry bullets often append a degree/qualification condition
        # to an otherwise usable O-level clause. Keep the subject clause and
        # leave the qualification in the raw exception evidence.
        fragment = re.split(
            r"\s+(?:plus|and)\s+(?:the\s+)?(?:second|first|third|"
            r"class|degree|nce|nd|hnd|utme|a\s*['â€™]?\s*level)\b",
            fragment,
            maxsplit=1,
            flags=re.I,
        )[0]
        fragment = re.split(r"\.\s*[a-z]\s*\)", fragment, maxsplit=1, flags=re.I)[0]
        return fragment
    olevel = re.search(r"\bO\s*['â€™]?\s*Level\b|\bO/L\b", text, re.I)
    if olevel and re.search(r"\b(?:credit|pass(?:es)?)\b", text[olevel.end() :], re.I):
        fragment = text[olevel.start() :]
        fragment = re.split(
            r"\s+(?:plus|and)\s+(?:the\s+)?(?:second|first|third|"
            r"class|degree|nce|nd|hnd|utme|a\s*['â€™]?\s*level)\b",
            fragment,
            maxsplit=1,
            flags=re.I,
        )[0]
        fragment = re.split(r"\.\s*[a-z]\s*\)", fragment, maxsplit=1, flags=re.I)[0]
        return fragment
    marker = _UTME_MARKER.search(text)
    if marker:
        fragment = text[marker.end() :]
        if re.search(r"\b(?:requires?|accepts?)\b", fragment, re.I):
            return fragment
    return ""


def _has_multiple_clauses(body: str) -> bool:
    if ";" in body:
        return True
    return len(re.findall(r"\b(?:requires?|accepts?)\b", body, re.I)) > 1


def _parse_explicit_tail_group(text: str, allowed_codes: set[str]):
    """Repair a common local form: ``A, B and two other subjects from X``."""
    match = re.match(
        r"^(.+?)\s+and\s+(?:any\s+)?(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+other\s+(?:subjects?|credits?)\s+"
        r"(?:from|of|in)\s+(.+)$",
        text,
        re.I | re.S,
    )
    if not match:
        return None
    head = parse_head(match.group(1).strip(), allowed_codes)
    group = parse_segment(
        f"any {match.group(2)} from {match.group(3)}",
        allowed_codes,
    )
    if head is None or not group:
        return None
    prior_choices = {
        part[1] for part in head if part[0] == "required"
    }
    prior_choices.update(
        code for part in head if part[0] == "one_of" for code in part[2]
    )
    normalized_group = []
    for part in group:
        if part[0] != "one_of":
            normalized_group.append(part)
            continue
        codes = sorted(set(part[2]) - prior_choices)
        if not codes or int(part[1]) > len(codes):
            return None
        normalized_group.append((part[0], part[1], codes, *part[3:]))
    return head + normalized_group


def _parse_standalone_group(text: str, allowed_codes: set[str]):
    """Parse ``any two from X`` when the source omits a required head."""
    match = re.match(
        r"^(?:any\s+)?(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+"
        r"(?:other\s+)?subjects?\s+(?:from|of|in)\s+(.+)$",
        text.strip(" .;:"),
        re.I | re.S,
    )
    if not match:
        return None
    return parse_segment(
        f"any {match.group(1)} from {match.group(2)}",
        allowed_codes,
    )


def _parse_multiple_standalone_groups(text: str, allowed_codes: set[str]):
    """Parse two explicit category groups joined by ``and``.

    A few university notes say, for example, ``one Science subject and one
    Commercial subject``.  The generic segment parser intentionally handles
    one group at a time, so split only when the second clause clearly starts
    with its own numbered group.
    """
    chunks = re.split(
        r"\s+and\s+(?=(?:any\s+)?(?:one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+(?:other\s+)?subjects?)",
        text.strip(" .;:"),
        flags=re.I,
    )
    if len(chunks) < 2:
        return None
    parsed = []
    for chunk in chunks:
        part = _parse_standalone_group(chunk, allowed_codes)
        if not part:
            return None
        parsed.extend(part)
    return parsed


def _parse_head_and_two_groups(text: str, allowed_codes: set[str]):
    """Parse a named head followed by two separately counted groups."""
    match = re.match(
        r"^(.+?)(?:\s+and|\s*,)\s*(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+(?:other\s+)?subjects?\s+"
        r"(?:from|of|in)\s+(.+?)\s+and\s+(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+(?:other\s+)?subjects?\s+"
        r"(?:from|of|in)\s+(.+)$",
        text.strip(" .;:"),
        re.I | re.S,
    )
    if not match:
        return None
    head = parse_head(match.group(1).strip(), allowed_codes)
    first = parse_segment(
        f"any {match.group(2)} from {match.group(3)}", allowed_codes
    )
    second = parse_segment(
        f"any {match.group(4)} from {match.group(5)}", allowed_codes
    )
    if head is None or not first or not second:
        return None
    first = [(*part, "distinct_1") if part[0] == "one_of" else part for part in first]
    second = [(*part, "distinct_1") if part[0] == "one_of" else part for part in second]
    return head + first + second


def _parse_head_and_choice_group(text: str, allowed_codes: set[str]):
    """Parse ``head, any of A/B/C and one other ...`` safely."""
    match = re.match(
        r"^(.+?)\s*,?\s+(?:any\s+)?(?:one\s+)?of\s+(.+?)\s+and\s+"
        r"(.+)$",
        text.strip(" .;:"),
        re.I | re.S,
    )
    if not match:
        return None
    head = parse_head(match.group(1).strip(), allowed_codes)
    choice = parse_segment(f"any one from {match.group(2)}", allowed_codes)
    tail = parse_segment(match.group(3), allowed_codes)
    if head is None or not choice or not tail:
        return None
    return head + choice + tail


def _parse_condition_only(body: str, exam_type: str | None):
    """Represent a precise local condition without inventing a full rule."""
    if not re.search(
        r"\b(?:do(?:es)?\s+not\s+accept|do(?:es)?\s+not\s+require|do(?:es)?\s+not\s+allow|"
        r"do(?:es)?\s+not\s+insist|not\s+compulsory|in\s+lieu|(?<!credit )pass(?:es)?\s+in|accepts?\s+pass|"
        r"relevant\s+(?:subject|programme|area)|(?:one|two|1|2)\s*"
        r"(?:\(\s*[12]\s*\))?\s+sittings?|"
        r"maximum\s+of\s+(?:one|two|1|2)\s*(?:\(\s*[12]\s*\))?\s+sittings?)\b",
        body or "",
        re.I,
    ):
        return None
    if not exam_type:
        exam_type = "olevel" if _OLEVEL_MARKER.search(body or "") else "utme"
    return {
        "status": "parsed",
        "reason": "condition_only",
        "exam_type": exam_type,
        "rule_scope": "partial",
        "parts": [],
        "min_required": 0,
        "rule_text": (body or "").strip(" .;:"),
        "condition_text": (body or "").strip(" .;:"),
    }


def parse_local_exception(note: str) -> dict:
    """Return a structured local rule or an explicit review classification.

    Result keys:
      status: ``parsed``, ``needs_review`` or ``not_subject_rule``
      reason: machine-readable reason when not safely parsed
      exam_type: ``utme`` or ``olevel`` for parsed rules
      rule_scope: ``full`` or ``partial`` for parsed rules
      parts/min_required/rule_text: structured matcher input
    """
    text = re.sub(r"[\u2018\u2019\u201c\u201d]", "'", (note or "")).strip()
    # Backticks are PDF quote artefacts and can split the O-level marker
    # before route extraction runs.
    text = text.replace("`", "")
    text = re.sub(r"['\"]?O['\"]?\s*Level\b", "O Level", text, flags=re.I)
    if not text:
        return {"status": "not_subject_rule", "reason": "empty"}

    # Brochure tables frequently append the route label after the actual
    # requirement, e.g. ``... [UTME SUBJECTS]``.  Remove that annotation so
    # the marker does not appear to have an empty requirement after it.
    text = re.sub(
        r"\s*\[\s*(?:UTME(?:\s+SUBJECTS?)?|O\s*LEVEL|O/L)\s*\]\s*$",
        "",
        text,
        flags=re.I,
    )

    has_direct = bool(_DIRECT_ENTRY.search(text))
    extracted_from_direct = False
    marker = _UTME_MARKER.search(text)
    has_olevel = bool(_OLEVEL_MARKER.search(text))

    if has_direct and not marker and not has_olevel:
        return {"status": "not_subject_rule", "reason": "direct_entry"}
    if has_direct:
        subject_fragment = _extract_subject_fragment(text)
        if not subject_fragment:
            return {"status": "not_subject_rule", "reason": "direct_entry"}
        text = subject_fragment
        extracted_from_direct = True
        marker = _UTME_MARKER.search(text)
        has_olevel = bool(_OLEVEL_MARKER.search(text))
        has_direct = False
    if _CROSS_REFERENCE.search(text):
        return {"status": "needs_review", "reason": "cross_reference"}
    # PLASU's Sociology exception is an exact, source-backed combination:
    # English plus three Arts/Social Science credits, with a separate
    # O-level pass in Mathematics. Handle it before the generic condition-only
    # classifier so the subject combination remains executable.
    if (
        has_olevel
        and re.search(r"\bthree\s*(?:\(\s*3\s*\))?\s+social\s+sciences?\s+or\s+arts?\s+subjects?\b", text, re.I)
        and re.search(r"\bpass\s+in\s+mathematics\b", text, re.I)
        and re.search(r"\bcredit\s+passes?\s+in\s+english\b", text, re.I)
    ):
        return {
            "status": "parsed",
            "exam_type": "olevel",
            "rule_scope": "full",
            "min_required": 4,
            "rule_text": re.sub(r"\s+", " ", text).strip(" .;:"),
            "parts": [
                ("required", "ENG"),
                ("one_of", 3, sorted((set(ARTS) | set(SOCIAL)) & set(OLEVEL_CODES)), "olevel_distinct_credit_subjects"),
                ("required", "MATH"),
            ],
            "pass_required_codes": ["MATH"],
            "condition_text": "A pass in Mathematics is required; this matcher cannot verify grades.",
        }
    condition_only = _parse_condition_only(text, "olevel" if has_olevel else ("utme" if marker else None))
    if condition_only:
        without_condition = re.sub(
            r"\b(?:do(?:es)?\s+not\s+accept|do(?:es)?\s+not\s+require|do(?:es)?\s+not\s+allow|"
            r"do(?:es)?\s+not\s+insist|not\s+compulsory)\b.*$",
            "",
            text,
            flags=re.I,
        )
        if not re.search(r"\b(?:requires?|accepts?|insists\s+on)\b", without_condition, re.I):
            return condition_only
    if has_direct:
        return {"status": "needs_review", "reason": "mixed_direct_entry"}
    sitting_match = _SITTING_CONDITION.search(text)
    condition_text = None
    if sitting_match and not _SUPPORTED_SITTING_CONDITION.search(text):
        return {"status": "needs_review", "reason": "sitting_condition"}
    modifier_match = _UNSAFE_MODIFIER.search(text)
    modifier_condition_text = modifier_match.group(0) if modifier_match else None

    # An explicit UTME marker can precede an O-level sentence in the extracted
    # brochure.  The subject wording wins; do not force it into the UTME layer.
    inferred_utme = bool(
        not marker
        and not has_olevel
        and re.search(r"\b(?:requires?|accepts?)\b", text, re.I)
    )
    exam_type = "olevel" if has_olevel else ("utme" if marker or inferred_utme else None)
    if exam_type is None:
        if has_direct:
            return {"status": "not_subject_rule", "reason": "direct_entry"}
        # A university note without a UTME/O-level marker cannot safely be
        # placed in either picker layer. Preserve the raw exception, but keep
        # it out of structured eligibility rather than guessing its exam
        # route from subject names alone.
        return {"status": "not_subject_rule", "reason": "missing_route_marker"}

    # The route label can also be a suffix (``... as UTME subjects``).  In
    # that form the subject statement is before the marker, not after it.
    marker_suffix = bool(
        marker
        and marker.start() > 0
        and not text[marker.end():].strip(" .;:()")
    )
    body = (
        _strip_source_prefix(
            re.sub(r"\b(?:as|for|in)\s*$", "", text[:marker.start()], flags=re.I),
            None,
        )
        if marker_suffix
        else _strip_source_prefix(text, marker)
    )
    if not body:
        condition_only = _parse_condition_only(text, exam_type)
        if condition_only:
            return condition_only
        return {"status": "needs_review", "reason": "missing_subject_statement"}
    # PDF extraction uses a backtick to open quoted O-level text (`` `O'
    # Level``).  It is typography, not part of the requirement grammar.
    body = body.replace("`", "")
    body = re.sub(r"['\"]?O['\"]?\s*Level\b", "O Level", body, flags=re.I)
    body = re.sub(r"\bO/Level\b", "O Level", body, flags=re.I)
    body = re.sub(r"\bO/L\b", "O Level", body, flags=re.I)
    body = re.sub(
        r"\bO\s*Level\s+(?:credit\s+)?pass(?:es)?"
        r"(?:\s+or\s+equivalents?)?\s+in\s+"
        r"(one|two|three|four|five|six|seven|1|2|3|4|5|6|7)\s*"
        r"(?:\(\s*\d\s*\))?\s+subjects?\s+(?:to\s+include|including)\b",
        r"\1 credit passes to include ",
        body,
        flags=re.I,
    )
    # Direct-entry bullets and university notes often put the number after
    # the O-level phrase: ``O Level credit passes at not less than five
    # other subjects``.  This is the same explicit total as ``five credit
    # passes``; normalize it before the shared O-level grammar runs.
    body = re.sub(
        r"\bO\s*Level\s+(?:credit\s+)?pass(?:es)?\s+(?:at\s+)?"
        r"(?:not\s+less\s+than|at\s+least)\s+"
        r"(one|two|three|four|five|six|seven|1|2|3|4|5|6|7)\s*"
        r"(?:\(\s*\d\s*\))?\s+",
        r"\1 credit passes ",
        body,
        flags=re.I,
    )
    body = re.sub(r"\bArabic\s+Language\b", "Arabic", body, flags=re.I)
    body = re.sub(r"\band\s*/\s*or\b", "and", body, flags=re.I)
    body = re.sub(r"\s+only\s*$", "", body, flags=re.I)
    body = re.sub(r"^\s*the\s+", "", body, flags=re.I)
    body = re.sub(r"\bwhich\s+must\s+include\b", "including", body, flags=re.I)
    body = re.sub(r"\bonly\s+in\b", "including", body, flags=re.I)
    body = re.sub(
        r"\bany\s+other\s+(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+(?:of|from)\b",
        r"\1 other subjects from ",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\b(?:at\s+least\s+)?one\s+(?:other\s+)?"
        r"(Arts?|Social\s+Sciences?|Science|Commercial)\s+subjects?",
        r"one other subjects from \1",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\bany\s+(?:other\s+)?"
        r"(Arts?|Social\s+Sciences?|Science|Commercial)\s+subjects?",
        r"one other subjects from \1",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\b(two|three|four|2|3|4)\s+(Arts?|Social\s+Sciences?|Science|Commercial)\s+subjects?",
        r"\1 subjects from \2",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\.\s+(?=(?:Mathematics|Biology|Physics|Chemistry|Economics|Government|"
        r"Literature|Geography|Accounting)\b)",
        ", ",
        body,
        flags=re.I,
    )
    body = re.sub(r"\)(?=\s*'?(?:O|o)\b)", ") ", body)
    # A compound sitting phrase is one condition.  Remove the whole phrase,
    # rather than only its final ``two sittings`` fragment.
    sitting_match = re.search(
        r"\b(?:one\s+or\s+two|one|two|1|2)\s*"
        r"(?:\(\s*[12]\s*\))?\s+sittings?\b"
        r"|\b(?:at\s+)?(?:not\s+more\s+than|at\s+most)\s+(?:two|2)\s*"
        r"(?:\(\s*2\s*\))?\s+sittings?\b",
        body,
        re.I,
    )
    if sitting_match:
        condition_text = sitting_match.group(0)
        body = (body[:sitting_match.start()] + " " + body[sitting_match.end():]).strip()
        body = re.sub(r"\bat\s+(?=(?:including|in)\b)", "", body, flags=re.I)
        body = re.sub(r"\bat\s*$", "", body, flags=re.I)
    # Local notes often place the category between the count and the word
    # ``subjects`` (``three other Arts subjects``), while the national grammar
    # uses ``three other subjects from Arts``.  This is a lossless rewrite.
    body = re.sub(
        r"\b(one|two|three|four|1|2|3|4)\s*(?:\(\s*\d\s*\))?\s+other\s+"
        r"(Arts?|Social\s+Sciences?|Science|Commercial)\s+subjects?",
        r"\1 other subjects from \2",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\b(one|two|three|four|1|2|3|4)\s*(?:\(\s*\d\s*\))?\s+other\s+"
        r"Arts?\s+and\s+Social\s+Sciences?\s+subjects?\s+(?:from|of|in)\b",
        r"\1 other subjects from ",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\bcredit\s+pass(?:es)?\s+(?:or\s+equivalents?|or\s+its\s+equivalent)\s+"
        r"(?:in|to\s+include|including)\b",
        "credit passes to include ",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\bcredit\s+pass(?:es)?\s+at\s+(?:SSC|SSCE|GCE|NECO|NABTEB)\s+"
        r"(?:or\s+its\s+equivalent\s+)?(?:to\s+include|including)\b",
        "credit passes to include ",
        body,
        flags=re.I,
    )
    body = re.sub(r"\bfrom\s*:\s*", "from ", body, flags=re.I)
    body = re.sub(r"\bfrom\s*,\s*", "from ", body, flags=re.I)
    body = re.sub(r"\bsubjects?\s+from\s+subjects?\s+from\b", "subjects from", body, flags=re.I)
    body = re.sub(r"\bat\s+least\s+credit\s+pass(?:es)?\b", "credit passes", body, flags=re.I)
    body = re.sub(
        r"\bany\s+other\s+(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+"
        r"(Arts?|Social\s+Sciences?|Science|Commercial)\s+subjects?",
        r"\1 other subjects from \2",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\bany\s+(one|two|three|four|1|2|3|4)\s+"
        r"(?:relevant\s+)?Arts?\s+and\s+Social\s+Sciences?\s+subjects?",
        r"\1 other subjects from Arts or Social Sciences",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\bany\s+other\s+(one|two|three|four|1|2|3|4)\s+subjects?\s*"
        r"\((?:science|arts?|commercial|social\s+science)[^)]*\)",
        r"\1 other subjects from Science or Arts or Commercial",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\bany\s+other\s+subject\b",
        "one other subjects from subjects",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\bany\s+(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+"
        r"(Arts?|Social\s+Sciences?|Science|Commercial)\s+subjects?",
        r"\1 other subjects from \2",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\bany\s+(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+"
        r"(Arts?|Social\s+Sciences?|Science|Commercial)\s+or\s+"
        r"(Arts?|Social\s+Sciences?|Science|Commercial)\s+subjects?",
        r"\1 other subjects from \2 or \3",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\bany\s+other\s+Social\s+Science,\s*Arts?\s+Subjects?\s+or\s+Mathematics\b",
        "one other subjects from Social Sciences or Arts or Mathematics",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\bany\s+other\s+(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+Arts?,\s*Social\s+Sciences?\s+and\s+"
        r"Management\s+Subjects?",
        r"\1 other subjects from Arts or Social Sciences or Commercial",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\bany\s+other\s+(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+subjects?\s+(?:from|of|in)\b",
        r"\1 other subjects from ",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\bany\s+other\s+(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+(Sciences?),\s*"
        r"Social\s+Sciences?\s+or\s+Arts\s+subjects?",
        r"\1 other subjects from Science, Social Sciences or Arts",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\b(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+other\s+credits?\s+from\b",
        r"\1 other subjects from ",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\b(one|two|three|four|1|2|3|4)\s+"
        r"(?:\(\s*\d\s*\))?\s+"
        r"(Arts?|Social\s+Sciences?|Science|Commercial)\s+subjects?",
        r"\1 subjects from \2",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\b(one|two|three|four|1|2|3|4)\s+"
        r"(Sciences?),\s*Social\s+Sciences?\s+or\s+Arts\s+subjects?",
        r"\1 subjects from Science, Social Sciences or Arts",
        body,
        flags=re.I,
    )
    body = re.sub(r"\bany\s+from\b", "any one from", body, flags=re.I)
    body = re.sub(
        r"\b(any\s+)?(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+others?\s+(?:from|of|in)\b",
        r"\2 other subjects from ",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\b(any\s+)?(one|two|three|four|1|2|3|4)\s+other\s+subjects?\b",
        r"\2 other subjects from subjects",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\b(any\s+)?(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+(?:from|of(?!\s+which)|in)\b",
        r"\2 other subjects from ",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\bCredits?\b(?!\s+pass(?:es)?)",
        "credit passes",
        body,
        flags=re.I,
    )
    body = re.sub(
        r"\bany\s+other\s+(one|two|three|four|1|2|3|4)\s*"
        r"(?:\(\s*\d\s*\))?\s+(Arts?|Social\s+Sciences?|Science)\s+"
        r"or\s+(Arts?|Social\s+Sciences?|Science)\s+subjects?",
        r"\1 other subjects from \2 or \3",
        body,
        flags=re.I,
    )
    qualification_condition = re.search(
        r",\s*(?:one\s+of\s+which\s+must\s+be|preferable\s+in|preferred\s+in)\b.*$",
        body,
        flags=re.I,
    )
    if qualification_condition:
        condition_text = condition_text or qualification_condition.group(0).strip(" ,")
        body = body[:qualification_condition.start()].strip(" ,")
    # Run these final grammar repairs after the older brochure normalizers;
    # otherwise ``one other subjects from Social Science`` can be rewritten a
    # second time as ``subjects from subjects from Social Science``.
    body = re.sub(r"\bsubjects?\s+from\s+subjects?\s+from\b", "subjects from", body, flags=re.I)
    body = re.sub(
        r"\b(one|two|three|four|1|2|3|4)\s+"
        r"(Arts?|Social\s+Sciences?|Science|Commercial)(?:\s+subjects?)?",
        r"\1 subjects from \2",
        body,
        flags=re.I,
    )
    accepted_tail = re.search(r"\.\s*\**\s*([^.;]+\bis\s+accepted)\.?$", body, re.I)
    if accepted_tail:
        condition_text = condition_text or accepted_tail.group(1).strip()
        body = body[:accepted_tail.start()].strip(" .;,")
    if _has_multiple_clauses(body):
        return {"status": "needs_review", "reason": "multiple_clauses"}

    # ``relevant`` is a source qualifier, not a subject name.  The shared
    # grammar deliberately rejects it before parsing, so remove it only from
    # the grammar copy while retaining the original wording and marking the
    # result partial through ``modifier_match`` above.
    grammar_body = re.sub(r"\brelevant\s+", "", body, flags=re.I)

    try:
        if exam_type == "olevel":
            parsed = parse_olevel(grammar_body)
            if not parsed:
                # Some local rows give a precise O-level condition without a
                # total credit count (for example, ``credit pass in
                # Mathematics or a Science subject``). Preserve that exact
                # condition as partial rather than inventing a five-credit
                # rule.
                candidate = re.sub(
                    r"^.*?(?:credit\s+)?pass(?:es)?\s+(?:to\s+include|including|in|from|which\s+must\s+include)\s*",
                    "",
                    body,
                    flags=re.I,
                )
                trailing_condition = re.search(
                    r"\s+(?:and|;|,)\s+(?:at\s+least\s+)?O\s*"
                    r"(?:['â€™]?\s*Level|/L)\s+.*$",
                    candidate,
                    flags=re.I,
                )
                if trailing_condition:
                    condition_text = condition_text or trailing_condition.group(0).strip(" ;,")
                    candidate = candidate[:trailing_condition.start()].strip(" ;,")
                parts = _parse_explicit_tail_group(candidate, OLEVEL_CODES)
                parts = parts or _parse_multiple_standalone_groups(candidate, OLEVEL_CODES)
                parts = parts or _parse_standalone_group(candidate, OLEVEL_CODES)
                parts = parts or parse_segment(candidate, OLEVEL_CODES)
                if not parts:
                    condition_only = _parse_condition_only(text, exam_type)
                    if condition_only:
                        return condition_only
                    return {"status": "needs_review", "reason": "olevel_parse_failed"}
                count_match = (
                    OLEVEL_COUNT_RE.search(body)
                    or _OLEVEL_TOTAL_RE.search(body)
                    or _OLEVEL_COUNT_ANY_RE.search(body)
                )
                if count_match:
                    min_required = {
                        **NUM_WORDS,
                        "six": 6,
                        "seven": 7,
                    }[count_match.group(1).lower()]
                    scope = "partial" if (modifier_match or condition_text or extracted_from_direct) else "full"
                else:
                    min_required = sum(1 for part in parts if part[0] == "required")
                    min_required += sum(int(part[1]) for part in parts if part[0] == "one_of")
                    scope = "partial"
            else:
                min_required, parts = parsed
                # A local O-level count plus named subjects is a complete rule
                # for this layer. The national requirement remains visible
                # separately.
                scope = "partial" if (modifier_match or condition_text or extracted_from_direct) else "full"
        else:
            # Prefer the explicit tail/group grammar when the source contains
            # a numbered ``other subjects from`` clause.  The broad UTME
            # parser can otherwise accept only the first alternative and
            # silently drop the trailing group.
            parts = _parse_head_and_two_groups(grammar_body, LOCAL_UTME_CODES)
            parts = parts or _parse_head_and_choice_group(grammar_body, LOCAL_UTME_CODES)
            parts = parts or _parse_explicit_tail_group(grammar_body, LOCAL_UTME_CODES)
            parts = parts or _parse_multiple_standalone_groups(grammar_body, LOCAL_UTME_CODES)
            if not parts:
                parts = parse_utme(grammar_body, LOCAL_UTME_CODES)
            if not parts:
                parts = _parse_standalone_group(grammar_body, LOCAL_UTME_CODES)
            if not parts or isinstance(parts, tuple):
                condition_only = _parse_condition_only(text, exam_type)
                if condition_only:
                    return condition_only
                return {"status": "needs_review", "reason": "utme_parse_failed"}
            slots = sum(1 for p in parts if p[0] == "required")
            slots += sum(int(p[1]) for p in parts if p[0] == "one_of")
            # Three slots is a complete local UTME combination.  One- or
            # two-subject statements are still useful exact conditions, but do
            # not by themselves prove a full four-subject UTME selection.
            # Local notes sometimes omit English because it is the common
            # national UTME subject; others state all four subjects. Both are
            # complete local combinations. Fewer slots are conditions only.
            scope = "full" if slots in {3, 4} and not modifier_match and not condition_text and not extracted_from_direct else "partial"
            min_required = slots
    except (AttributeError, IndexError, TypeError, ValueError):
        return {"status": "needs_review", "reason": "parser_error"}

    if re.search(r"\bother\b", body, re.I):
        required_codes = {part[1] for part in parts if part[0] == "required"}
        prior_group_codes: set[str] = set()
        normalized_parts = []
        for part in parts:
            if part[0] != "one_of":
                normalized_parts.append(part)
                continue
            codes = sorted(set(part[2]) - required_codes - prior_group_codes)
            if not codes or int(part[1]) > len(codes):
                return {"status": "needs_review", "reason": "overlapping_other_groups"}
            normalized_parts.append((part[0], part[1], codes, *part[3:]))
            prior_group_codes.update(codes)
        parts = normalized_parts

    return {
        "status": "parsed",
        "reason": None,
        "exam_type": exam_type,
        "rule_scope": scope,
        "parts": parts,
        "min_required": int(min_required),
        "rule_text": body,
        "condition_text": condition_text or modifier_condition_text,
    }
