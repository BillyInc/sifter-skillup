"""Search checked-in JAMB/NUC text extracts against every current catalogue row.

This is a locator/candidate generator only. Extracted text is not a substitute
for verifying the cited official PDF, and a missing local extract is not proof
that an authoritative source does not exist.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

from run_jamb_ccmas_deterministic_discovery_2026_09_28 import CCMAS_SOURCE_URLS


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
INPUT = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
OUT_JSON = AUDIT / "jamb_ccmas_local_source_text_search_2026-09-28.json"
OUT_MD = AUDIT / "jamb_ccmas_local_source_text_search_2026-09-28.md"

JAMB_TEXT = {
    "administration": "_jamb_txt/Administration.txt",
    "agriculture": "_jamb_txt/agriculture.txt",
    "arts and humanities": "_jamb_txt/arts_hum.txt",
    "education": "_jamb_txt/education.txt",
    "engineering/technology": "_jamb_txt/engineering.txt",
    "engineering/environmental/technology": "_jamb_txt/engineering.txt",
    "law": "_jamb_txt/Law.txt",
    "medical/pharmaceutical/health": "_jamb_txt/medical.txt",
    "sciences": "_jamb_txt/Sciences.txt",
    "social/management sciences": "_jamb_txt/Social Management Science.txt",
}

CCMAS_TEXT = {
    "administration_management.json": "_audit/ccmas_source_text_2026-09-29/administration_management.txt",
    "agricultural_science.json": "_audit/ccmas_source_text_2026-09-29/agricultural_science.txt",
    "allied_health.json": "_pdftxt/allied_health.txt",
    "architecture.json": "_pdftxt/architecture.txt",
    "arts.json": "_pdftxt/arts.txt",
    "basic_medical.json": "_pdftxt/basic_medical.txt",
    "communication_media.json": "_ccmas_txt/comm.txt",
    "computing.json": "_ccmas_txt/computing.txt",
    "education.json": "_pdftxt/education.txt",
    "engineering.json": "_ccmas_txt/engineering.txt",
    "environmental_sciences.json": "_pdftxt/environmental_sciences.txt",
    "law.json": "_audit/ccmas_source_text_2026-09-29/law.txt",
    "medicine_dentistry.json": "_audit/ccmas_source_text_2026-09-29/medicine_dentistry.txt",
    "pharmacy.json": "_pdftxt/pharmacy.txt",
    "sciences.json": "_ccmas_txt/sciences.txt",
    "social_sciences.json": "_audit/ccmas_source_text_2026-09-29/social_sciences.txt",
    "veterinary.json": "_pdftxt/veterinary.txt",
}

CODE_RE = re.compile(r"(?<![A-Z0-9])([A-Z]{2,6})[\s\-]*([0-9]{3})(?![A-Z0-9])", re.I)


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().casefold()


def text_pages(path: Path) -> list[tuple[int, str, int]]:
    raw = path.read_text(encoding="utf-8", errors="replace")
    pages = raw.split("\f")
    result = []
    line_offset = 1
    for page_ordinal, page in enumerate(pages, 1):
        if page.strip():
            result.append((page_ordinal, page, line_offset))
        line_offset += page.count("\n") + 1
    return result


def course_code_index(pages: list[tuple[int, str, int]]) -> tuple[dict[str, list[dict]], dict[str, list[dict]]]:
    hits: dict[str, list[dict]] = defaultdict(list)
    source_codes: dict[str, list[dict]] = defaultdict(list)
    for physical_page, content, line_offset in pages:
        page_lines = content.splitlines()
        for local_line, line in enumerate(page_lines, 1):
            for match in CODE_RE.finditer(line):
                code = f"{match.group(1).upper()} {match.group(2)}"
                record = {
                    "extracted_page_ordinal": physical_page,
                    "line": line_offset + local_line - 1,
                    "excerpt": line.strip()[:280],
                }
                hits[code].append(record)
                source_codes[code].append(record)
    return hits, source_codes


def find_wrapped_title(text: str, title: str, cap: int = 6) -> list[dict]:
    tokens = str(title or "").split()
    if not tokens:
        return []
    pattern = re.compile(r"\s+".join(re.escape(token) for token in tokens), re.I)
    hits = []
    for match in pattern.finditer(text):
        line_start = text.count("\n", 0, match.start()) + 1
        line_end = text.count("\n", 0, match.end()) + 1
        excerpt = text[max(0, match.start() - 120):min(len(text), match.end() + 220)]
        hits.append({"line_start": line_start, "line_end": line_end, "excerpt": re.sub(r"\s+", " ", excerpt).strip()[:500]})
        if len(hits) >= cap:
            break
    return hits


def main() -> None:
    discovery = read_json(INPUT)
    jamb_occurrences = [
        occurrence
        for identity in discovery["jamb_identities"]
        for occurrence in identity["source_occurrences"]
    ] + discovery.get("orphan_source_occurrences", [])
    jamb_results = []
    jamb_text_cache: dict[str, str | None] = {}
    jamb_hit_cache: dict[tuple[str, str], list[dict]] = {}
    for occurrence in jamb_occurrences:
        faculty_key = norm(occurrence.get("source_faculty"))
        relpath = JAMB_TEXT.get(faculty_key)
        text = None
        if relpath:
            if relpath not in jamb_text_cache:
                p = ROOT / relpath
                jamb_text_cache[relpath] = p.read_text(encoding="utf-8", errors="replace") if p.exists() else None
            text = jamb_text_cache[relpath]
        title = str(occurrence.get("jamb_name") or "")
        cache_key = (relpath or "", norm(title))
        if cache_key not in jamb_hit_cache:
            jamb_hit_cache[cache_key] = find_wrapped_title(text or "", title) if text else []
        hits = jamb_hit_cache[cache_key]
        jamb_results.append({
            "occurrence_id": occurrence.get("occurrence_id"),
            "source_name": occurrence.get("jamb_name"),
            "source_faculty": occurrence.get("source_faculty"),
            "official_source_url": occurrence.get("official_source_url") or occurrence.get("brochure_source_url"),
            "parsed_file": occurrence.get("parsed_file"),
            "parsed_ordinal": occurrence.get("ordinal"),
            "local_text_file": relpath,
            "local_text_available": bool(text),
            "exact_title_candidate_hit_count": len(hits),
            "candidate_hits": hits[:6],
            "interpretation": "Local text-extract hit is a search locator only; verify the exact PDF title/awarder cell and continuation boundary.",
        })

    packages = discovery["ccmas_packages"]
    rows_by_package: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for row in discovery["ccmas_course_rows"]:
        rows_by_package[(row["source_file"], row["programme"])].append(row)

    ccmas_results = []
    corpus_cache: dict[str, tuple[dict[str, list[dict]], dict[str, list[dict]], list[tuple[int, str, int]], dict[int, str], dict[int, str]] | None] = {}
    local_code_keys: dict[str, set[str]] = defaultdict(set)
    for package in packages:
        source_file = package["source_file"]
        relpath = CCMAS_TEXT.get(source_file)
        corpus = None
        if relpath:
            if relpath not in corpus_cache:
                p = ROOT / relpath
                if p.exists():
                    pages = text_pages(p)
                    code_hits, source_codes = course_code_index(pages)
                    page_by_number = {number: content for number, content, _ in pages}
                    corpus_cache[relpath] = (
                        code_hits,
                        source_codes,
                        pages,
                        page_by_number,
                        {number: norm(content) for number, content in page_by_number.items()},
                    )
                else:
                    corpus_cache[relpath] = None
            corpus = corpus_cache[relpath]
        for row in rows_by_package[(source_file, package["programme"])]:
            local_code_keys[source_file].add(norm(row.get("code")).upper())
        ccmas_results.append({
            "source_file": source_file,
            "programme": package["programme"],
            "package_index": package["package_index"],
            "official_source_url": package.get("official_source_url"),
            "local_text_file": relpath,
            "local_text_available": bool(corpus),
            "courses": [],
        })
        result = ccmas_results[-1]
        for row in rows_by_package[(source_file, package["programme"])]:
            code = " ".join(str(row.get("code") or "").upper().split())
            code_hits = corpus[0].get(code, []) if corpus else []
            title = norm(row.get("title"))
            pages_with_title = []
            if corpus and title:
                for page in sorted({hit["extracted_page_ordinal"] for hit in code_hits}):
                    if title in corpus[4].get(page, ""):
                        pages_with_title.append(page)
            result["courses"].append({
                "record_id": row["record_id"],
                "course_code": row.get("code"),
                "course_title": row.get("title"),
                "code_hit_count_in_local_extract": len(code_hits),
                "code_hit_pages_in_local_extract": sorted({hit["extracted_page_ordinal"] for hit in code_hits}),
                "title_exactly_present_on_code_hit_page": bool(pages_with_title),
                "title_code_cohit_pages": pages_with_title,
                "candidate_code_hit_snippets": code_hits[:5],
                "evidence_state": "candidate_located_in_local_extract" if pages_with_title else "candidate_needs_official_pdf_review" if corpus else "local_text_extract_missing",
            })

    missing_extracts = [
        {"source_file": source_file, "official_source_url": CCMAS_SOURCE_URLS.get(source_file), "status": "local_text_extract_missing"}
        for source_file, relpath in CCMAS_TEXT.items()
        if relpath is None or not (ROOT / relpath).exists()
    ]
    unmatched_codes = []
    for source_file, relpath in CCMAS_TEXT.items():
        if not relpath or not (ROOT / relpath).exists():
            continue
        corpus = corpus_cache[relpath]
        if not corpus:
            continue
        extra = sorted(code for code in corpus[1] if norm(code).upper() not in local_code_keys[source_file])
        if extra:
            unmatched_codes.append({
                "source_file": source_file,
                "local_text_file": relpath,
                "unmatched_code_token_count": len(extra),
                "unmatched_code_tokens": [{"code": code, "hit_count": len(corpus[1][code]), "examples": corpus[1][code][:4]} for code in extra],
                "classification": "candidate_source_only_or_context_code; not an omission until exact programme and source context are checked",
            })

    course_findings = [course for package in ccmas_results for course in package["courses"]]
    report = {
        "schema": "2026-09-28.jamb-ccmas-local-text-search.v1",
        "generated_on": date.today().isoformat(),
        "status": "local_text_search_candidates_only",
        "scope": {
            "jamb_offering_occurrences": len(jamb_results),
            "jamb_occurrences_with_local_text": sum(row["local_text_available"] for row in jamb_results),
            "jamb_occurrences_with_exact_title_text_hit": sum(row["exact_title_candidate_hit_count"] > 0 for row in jamb_results),
            "ccmas_packages": len(ccmas_results),
            "ccmas_course_rows": len(course_findings),
            "ccmas_course_rows_with_local_extract": sum(package["local_text_available"] for package in ccmas_results for _ in package["courses"]),
            "ccmas_course_rows_with_code_and_title_on_same_extracted_page": sum(course["title_exactly_present_on_code_hit_page"] for course in course_findings),
            "ccmas_missing_local_text_source_files": len(missing_extracts),
        },
        "method_limits": [
            "Text-extract hits are locator candidates, not primary-PDF verification or proof of a correct course mapping.",
            "Extracted physical-page ordinals are not printed-page citations.",
            "Missing local text files do not mean the official CCMAS source is unavailable.",
            "Text code tokens may be glossary entries, references, neighboring courses or cross-references; unmatched tokens are not automatic omissions.",
        ],
        "ccmas_missing_local_text_source_files": missing_extracts,
        "jamb_occurrences": jamb_results,
        "ccmas_packages": ccmas_results,
        "ccmas_unmatched_source_text_code_tokens": unmatched_codes,
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# JAMB–CCMAS local source-text search — 2026-09-28",
        "",
        "This is an automated search of checked-in JAMB/NUC text extracts. It does not certify official PDF evidence.",
        "",
        "## Coverage",
        "",
    ]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in report["scope"].items())
    lines += ["", "## CCMAS source text not present locally", ""]
    lines.extend(f"- `{item['source_file']}` — {item['official_source_url']}" for item in missing_extracts)
    lines += ["", "## Automated limits", ""]
    lines.extend(f"- {item}" for item in report["method_limits"])
    lines += ["", "The JSON output retains every JAMB occurrence and each of the 9,853 course-row search results, including candidate snippets and source-text-only code tokens.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "scope": report["scope"], "missing_extracts": missing_extracts}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
