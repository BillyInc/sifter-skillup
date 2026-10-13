#!/usr/bin/env python3
"""Reconcile the student subject catalogue/parser with original JAMB brochures.

This is a read-only audit of the locally downloaded original brochure PDFs. It
does not touch programme mappings, source ledgers, database, or generated seeds.
The report inventories every parser-known subject phrase found in source pages,
flags parser aliases that collide onto one catalogue code, and counts rule-form
markers for focused review.
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[3]
SOURCE_DIR = Path(r"C:\Users\USER\Downloads\jamb brochure")
OUT_JSON = Path(__file__).with_name("jamb_subject_catalog_original_pdf_audit_2026_10_02.json")
OUT_MD = OUT_JSON.with_suffix(".md")
PARSER_DIR = ROOT / "data" / "career-mapping"
if str(PARSER_DIR) not in sys.path:
    sys.path.insert(0, str(PARSER_DIR))
import _parse_subject_options as parser  # noqa: E402


FOCUS_CODES = {"GMT", "CAT", "CSC", "HEC", "FSN", "ACC", "ART", "AGR", "FMATH", "HSC", "PHE", "IT", "ENVS"}

RULE_MARKERS = {
    "exact_n_of_named_list": re.compile(r"\b(?:one|two|three|four|five|\d+)\s*\(?\d?\)?\s+of\s+(?:the\s+following|[A-Z])", re.I),
    "any_n_from_category": re.compile(r"\bany\s+(?:one|two|three|four|five|\d+)\s*\(?\d?\)?\s+(?:other\s+)?(?:science|arts?|commercial|social sciences?)\s+subjects?", re.I),
    "any_other_open_choice": re.compile(r"\bany\s+(?:(?:other|remaining|additional)\s+)?subjects?\b|\bany other subject\b", re.I),
    "one_from_each_or_distinct": re.compile(r"\b(?:one|a subject)\s+from\s+each\b|\bdifferent\s+(?:subject|group)s?\b|\bdistinct\b", re.I),
    "cross_reference": re.compile(r"\b(?:as|same)\s+(?:for|in)\s+[A-Z][A-Za-z /&-]+|\bsee\s+(?:also\s+)?[A-Z]", re.I),
    "institution_qualifier": re.compile(r"\b(?:[A-Z]{2,}(?:-[A-Z]{2,})*|UNIVERSITY|POLYTECHNIC)\s+(?:accepts?|requires?|waives?|does not require)\b", re.I),
    "certificate_condition": re.compile(r"\b(?:NBC|NTC|NABTEB|TC\s*II|teacher(?:'s)? certificate|certificate holders?)\b", re.I),
    "total_credit_count": re.compile(r"\b(?:five|six|four|\d+)\s*\(?\d?\)?\s+(?:SSC|SSCE|O['’]?LEVEL)?\s*credit passes?\b", re.I),
}


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s.casefold()).strip()


def source_rule_inventory():
    source = json.loads((PARSER_DIR / "_audit" / "jamb_brochure_source_rules_2026-08-19.json").read_text(encoding="utf-8"))
    variant_status = Counter()
    unique_texts = {"olevel": {}, "utme": {}}
    for row in source.get("rows", []):
        layer = row.get("layer")
        if layer not in unique_texts:
            continue
        for wrapper in row.get("source_variants", []):
            variant = wrapper.get("source_variant") or {}
            status = variant.get("status") or "unspecified"
            variant_status[(layer, status)] += 1
            text = re.sub(r"\s+", " ", str(variant.get("text") or "")).strip()
            if status in {"exact", "inherited_shared"} and text:
                unique_texts[layer].setdefault(text, []).append({
                    "programme": row.get("jamb_name"),
                    "source_status": status,
                    "source": variant.get("source") or {},
                })
    grammar = Counter()
    parser_results = Counter()
    unresolved = {"olevel": [], "utme": []}
    for layer, texts in unique_texts.items():
        for text, contexts in texts.items():
            low = norm(text)
            if layer == "olevel":
                parsed = parser.parse_olevel(text)
                okay = parsed is not None and parser.olevel_parts_are_matchable(text, parsed)
            else:
                parsed = parser.parse_utme(text)
                okay = parsed is not None
            parser_results[(layer, "matchable" if okay else "not_fully_matchable")] += 1
            forms = []
            if re.search(r"\b(?:one|two|three|four|five|\d+)\s*\(?\d?\)?\s+of\s+(?:the following|[A-Z])", text, re.I):
                forms.append("exact_N_of_named_list")
            if re.search(r"\b(?:any|one of)\s+(?:one|two|three|four|five|\d+)?\s*(?:other\s+)?(?:science|arts?|commercial|social sciences?)\s+subjects?", text, re.I):
                forms.append("N_of_category")
            if re.search(r"\bany\s+(?:other|remaining|additional)\s+subjects?\b|\bany other subject\b", text, re.I):
                forms.append("free_choice_remainder")
            if re.search(r"\b(?:as|same)\s+(?:for|in)\b|\bsee\s+[A-Z]", text, re.I):
                forms.append("cross_reference")
            if re.search(r"\b(?:accepts?|requires?|waives?|does not require)\b", text, re.I) and re.search(r"\b[A-Z]{2,}(?:-[A-Z]{2,})*\b", text):
                forms.append("institution_waiver_or_qualification")
            if re.search(r"\b(?:NBC|NTC|NABTEB|TC\s*II|certificate holders?)\b", text, re.I):
                forms.append("certificate_condition")
            if re.search(r"\b(?:each|one)\s+from\s+each\b|\brespectively\b|\bdistinct\b", text, re.I):
                forms.append("one_from_each_or_distinct")
            if re.search(r"/|\bor\b", low):
                forms.append("alternatives_or_slash")
            if not forms:
                forms.append("fixed_or_other")
            for form in set(forms):
                grammar[(layer, form)] += 1
            if not okay and len(unresolved[layer]) < 80:
                unresolved[layer].append({"text": text, "contexts": contexts[:3]})
    return {
        "variant_status_occurrences": {f"{k[0]}:{k[1]}": v for k, v in sorted(variant_status.items())},
        "unique_verified_or_inherited_source_text_counts": {k: len(v) for k, v in unique_texts.items()},
        "parser_result_counts_unique_text": {f"{k[0]}:{k[1]}": v for k, v in sorted(parser_results.items())},
        "rule_grammar_counts_unique_text_nonexclusive": {f"{k[0]}:{k[1]}": v for k, v in sorted(grammar.items())},
        "not_fully_matchable_examples": unresolved,
    }


def run():
    if not SOURCE_DIR.is_dir():
        raise SystemExit(f"Original brochure directory not found: {SOURCE_DIR}")
    files = sorted(SOURCE_DIR.glob("*.pdf"))
    docs = []
    for path in files:
        reader = PdfReader(str(path))
        pages = []
        for idx, page in enumerate(reader.pages, start=1):
            pages.append({"pdf_page": idx, "text": page.extract_text() or ""})
        docs.append({"filename": path.name, "page_count": len(pages), "pages": pages})

    subject_hits = defaultdict(list)
    collision_evidence = defaultdict(list)
    rule_counts = Counter()
    rule_examples = defaultdict(list)
    for doc in docs:
        for page in doc["pages"]:
            text = page["text"]
            low = norm(text)
            for phrase, code in parser.SUBJECT_CODES.items():
                normalized = norm(phrase)
                if re.search(rf"(?<![a-z0-9]){re.escape(normalized)}(?![a-z0-9])", low):
                    subject_hits[phrase].append({"code": code, "pdf": doc["filename"], "page": page["pdf_page"]})
                    if code in FOCUS_CODES and len(collision_evidence[code]) < 100:
                        at = low.find(normalized)
                        excerpt = low[max(0, at-100):at+len(normalized)+150]
                        evidence = {"phrase": phrase, "pdf": doc["filename"], "page": page["pdf_page"], "excerpt": excerpt}
                        if evidence not in collision_evidence[code]:
                            collision_evidence[code].append(evidence)
            for name, pattern in RULE_MARKERS.items():
                matches = list(pattern.finditer(text))
                rule_counts[name] += len(matches)
                for match in matches[:20]:
                    excerpt = re.sub(r"\s+", " ", text[max(0, match.start()-100):match.end()+180]).strip()
                    item = {"pdf": doc["filename"], "page": page["pdf_page"], "excerpt": excerpt}
                    if item not in rule_examples[name] and len(rule_examples[name]) < 100:
                        rule_examples[name].append(item)

    code_aliases = defaultdict(list)
    for phrase, code in parser.SUBJECT_CODES.items():
        code_aliases[code].append(phrase)
    collision_watch = {
        code: sorted(names)
        for code, names in code_aliases.items()
        if len(names) > 1
    }
    payload = {
        "audit_date": str(date.today()),
        "source_directory": str(SOURCE_DIR),
        "source_pdf_count": len(docs),
        "source_page_count": sum(d["page_count"] for d in docs),
        "sources": [{"filename": d["filename"], "pages": d["page_count"]} for d in docs],
        "parser_subject_phrase_count": len(parser.SUBJECT_CODES),
        "distinct_parser_codes": len(set(parser.SUBJECT_CODES.values())),
        "parser_code_alias_collisions": collision_watch,
        "source_phrase_hits": {key: values for key, values in sorted(subject_hits.items())},
        "source_phrase_hit_counts": {key: len(value) for key, value in sorted(subject_hits.items())},
        "collision_group_source_examples": {key: value for key, value in sorted(collision_evidence.items())},
        "rule_marker_counts_page_occurrences": dict(sorted(rule_counts.items())),
        "rule_marker_examples": dict(sorted(rule_examples.items())),
        "source_ledger_rule_inventory": source_rule_inventory(),
        "limitations": [
            "Marker counts are discovery counts, not unique rule counts or proof of applicability.",
            "The source PDFs are parsed for text; page-render inspection is still needed where extraction or table boundaries are ambiguous.",
            "A phrase mention establishes that the wording appears in a brochure, not that it is a generally selectable exam subject.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# JAMB subject catalogue vs original brochure PDFs — machine-assisted inventory",
        "",
        f"Audit date: {payload['audit_date']}",
        f"PDFs/pages extracted: {payload['source_pdf_count']} / {payload['source_page_count']}",
        f"Parser aliases/codes: {payload['parser_subject_phrase_count']} / {payload['distinct_parser_codes']}",
        "",
        "## Catalogue phrases located in PDFs",
        "",
    ]
    for label, hits in sorted(subject_hits.items()):
        uniq = sorted({(h['pdf'], h['page']) for h in hits})
        codes = ", ".join(sorted({h['code'] for h in hits}))
        lines.append(f"- **{label}** (`{codes}`) — {len(hits)} phrase/page hits, {len(uniq)} distinct PDF pages")
    lines += ["", "## Rule-form marker counts", ""]
    lines += [f"- `{k}`: {v} page-level occurrences" for k, v in sorted(rule_counts.items())]
    lines += ["", "## Source-ledger variant/parser inventory", ""]
    inv = payload["source_ledger_rule_inventory"]
    lines += [f"- Unique exact/inherited source texts: O'Level {inv['unique_verified_or_inherited_source_text_counts']['olevel']}; UTME {inv['unique_verified_or_inherited_source_text_counts']['utme']}."]
    lines += [f"- Parser outcome counts: `{json.dumps(inv['parser_result_counts_unique_text'], ensure_ascii=False)}`."]
    lines += ["", "Marker counts are discovery aids, not unique rule totals or applicability decisions. Ledger-derived counts deduplicate identical text but not distinct programme contexts. See JSON for source-page locators and excerpts.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({
        "json": str(OUT_JSON), "markdown": str(OUT_MD),
        "source_pdf_count": payload["source_pdf_count"],
        "source_page_count": payload["source_page_count"],
        "parser_subject_phrase_count": payload["parser_subject_phrase_count"],
        "distinct_parser_codes": payload["distinct_parser_codes"],
        "source_labels_found": len(subject_hits),
        "rule_marker_counts_page_occurrences": payload["rule_marker_counts_page_occurrences"],
    }, indent=2))


if __name__ == "__main__":
    run()
