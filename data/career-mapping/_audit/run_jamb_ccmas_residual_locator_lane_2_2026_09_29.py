"""Search only the residual CCMAS locator queue with safer text variants.

This lane is deliberately narrower than the full repair queue.  It processes
only records classified as ``code_not_located_in_extracted_source`` and does
not inspect the 2,189 same-page candidates or edit canonical mappings.

The output is an append-only checkpoint.  A hit is evidence for source review,
not a certification of the course record or its JAMB mapping.
"""

from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from collections import Counter
from datetime import date
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

from run_jamb_ccmas_deterministic_discovery_2026_09_28 import CCMAS_SOURCE_URLS


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
QUEUE = AUDIT / "jamb_ccmas_source_locator_enriched_queue_2026-09-29.json"
MANIFEST = AUDIT / "ccmas_source_pdf_extraction_manifest_2026-09-29.json"
TEXT_DIR = AUDIT / "ccmas_source_text_2026-09-29"
CHECKPOINT_PREFIX = "jamb_ccmas_residual_locator_lane_2_2026-09-29_checkpoint_"

STOPWORDS = {
    "A",
    "AN",
    "AND",
    "FOR",
    "I",
    "II",
    "III",
    "IN",
    "OF",
    "ON",
    "THE",
    "TO",
    "WITH",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalize(value: Any) -> str:
    text = unicodedata.normalize("NFKC", str(value or "")).upper()
    text = text.replace("&", " AND ").replace("’", "'")
    text = re.sub(r"[^A-Z0-9]+", " ", text)
    return " ".join(text.split())


def compact(value: Any) -> str:
    return re.sub(r"[^A-Z0-9]", "", normalize(value))


def meaningful_tokens(value: Any) -> list[str]:
    return [token for token in normalize(value).split() if token not in STOPWORDS and len(token) >= 3]


def code_variants(value: Any) -> list[str]:
    raw = str(value or "")
    parts = [raw]
    if "/" in raw:
        parts.extend(raw.split("/"))
    variants: list[str] = []
    for part in parts:
        for candidate in (normalize(part), compact(part)):
            if candidate and candidate not in variants:
                variants.append(candidate)
    return variants


def source_text_path(source_file: str) -> Path:
    return TEXT_DIR / (Path(source_file).stem + ".txt")


def line_windows(lines: list[str], radius: int = 1) -> list[tuple[int, str]]:
    return [
        (index + 1, " ".join(lines[max(0, index - radius) : min(len(lines), index + radius + 1)]).strip())
        for index in range(len(lines))
    ]


def evidence_for_page(
    page_number: int,
    page_text: str,
    course_code: str,
    title: str,
) -> dict[str, Any] | None:
    lines = page_text.splitlines()
    page_normalized = normalize(page_text)
    page_compact = compact(page_text)
    title_normalized = normalize(title)
    title_tokens = meaningful_tokens(title)
    code_parts = code_variants(course_code)
    code_compact = [variant for variant in code_parts if " " not in variant]
    numeric_parts = [
        token
        for token in re.findall(r"\d{3,4}", str(course_code or ""))
        if token
    ]

    exact_code = any(variant and variant in page_compact for variant in code_compact)
    exact_title = bool(title_normalized and title_normalized in page_normalized)
    page_token_set = set(page_normalized.split())
    token_hits = [token for token in title_tokens if token in page_token_set]
    token_ratio = len(set(token_hits)) / max(1, len(set(title_tokens)))

    line_hits: list[dict[str, Any]] = []
    best_window_score = 0.0
    best_window: tuple[int, str] | None = None
    for line_number, window in line_windows(lines):
        window_normalized = normalize(window)
        window_compact = compact(window)
        window_tokens = set(window_normalized.split())
        window_title_hits = [token for token in title_tokens if token in window_tokens]
        window_ratio = len(set(window_title_hits)) / max(1, len(set(title_tokens)))
        window_code = any(variant and variant in window_compact for variant in code_compact)
        window_level = any(number in window_normalized.split() for number in numeric_parts)
        window_exact_title = bool(title_normalized and title_normalized in window_normalized)
        if window_ratio > best_window_score:
            best_window_score = window_ratio
            best_window = (line_number, window)
        if window_code or window_exact_title or window_ratio >= 0.5 or (window_level and window_ratio >= 0.34):
            line_hits.append(
                {
                    "line": line_number,
                    "excerpt": re.sub(r"\s+", " ", window)[:360],
                    "title_token_ratio": round(window_ratio, 3),
                    "code_variant_hit": window_code,
                    "course_level_token_hit": window_level,
                }
            )

    # A page-level fuzzy score is only a lead.  It is useful when extraction
    # split a title at a page/line boundary, but is never promoted as exact.
    compact_title = compact(title)
    compact_page = page_compact
    fuzzy = SequenceMatcher(None, compact_title, compact_page[: min(len(compact_page), max(1, len(compact_title) * 5))]).ratio()
    if best_window is not None:
        fuzzy = max(fuzzy, SequenceMatcher(None, normalize(title), normalize(best_window[1])).ratio())

    if not (exact_code or exact_title or token_ratio >= 0.34 or line_hits):
        return None

    if exact_code and exact_title:
        evidence_class = "exact_code_and_title_candidate"
    elif exact_code:
        evidence_class = "code_candidate_title_not_exact"
    elif exact_title and any(hit["course_level_token_hit"] for hit in line_hits):
        evidence_class = "title_candidate_with_level_context"
    elif exact_title:
        evidence_class = "title_candidate_without_code"
    elif best_window_score >= 0.67:
        evidence_class = "title_tokens_split_or_normalized_candidate"
    elif best_window_score >= 0.34:
        evidence_class = "weak_title_token_candidate"
    else:
        evidence_class = "page_token_candidate"

    return {
        "extracted_page_ordinal": page_number,
        "evidence_class": evidence_class,
        "exact_code_variant_hit": exact_code,
        "exact_title_phrase_hit": exact_title,
        "title_token_ratio": round(token_ratio, 3),
        "best_window_ratio": round(best_window_score, 3),
        "fuzzy_lead_score": round(fuzzy, 3),
        "line_evidence": line_hits[:6],
    }


def classify(record: dict[str, Any], candidates: list[dict[str, Any]]) -> tuple[str, str]:
    if any(item["exact_code_variant_hit"] and item["exact_title_phrase_hit"] for item in candidates):
        return (
            "extraction_or_scope_mismatch_candidate",
            "The extracted source contains a normalized code/title candidate; inspect the exact programme table and continuation before changing the record.",
        )
    if any(item["exact_title_phrase_hit"] for item in candidates):
        return (
            "source_title_present_code_or_scope_mismatch_candidate",
            "The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.",
        )
    if any(item["evidence_class"] in {"title_tokens_split_or_normalized_candidate", "weak_title_token_candidate"} for item in candidates):
        return (
            "extraction_limitation_candidate",
            "Title tokens occur in a split/nearby form, but the exact course row is not established; inspect PDF layout or adjacent continuation pages.",
        )
    return (
        "source_omission_candidate",
        "No reliable normalized code/title evidence was found in the extracted official source; this is not yet proof of omission and requires visual PDF or fresh official retrieval review.",
    )


def next_checkpoint() -> tuple[int, Path, Path]:
    existing = sorted(AUDIT.glob(f"{CHECKPOINT_PREFIX}*.json"))
    numbers = []
    for path in existing:
        match = re.search(r"_(\d{3})\.json$", path.name)
        if match:
            numbers.append(int(match.group(1)))
    number = max(numbers, default=0) + 1
    stem = f"{CHECKPOINT_PREFIX}{number:03d}"
    return number, AUDIT / f"{stem}.json", AUDIT / f"{stem}.md"


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    residual = [
        record
        for record in queue["course_record_queue"]
        if record.get("automated_source_locator", {}).get("state") == "code_not_located_in_extracted_source"
    ]
    if len(residual) != 55:
        raise AssertionError(f"Expected exactly 55 residual records, found {len(residual)}")

    results: list[dict[str, Any]] = []
    for record in residual:
        source_file = record["source_key"].split("::", 1)[0]
        text_path = source_text_path(source_file)
        if not text_path.exists():
            results.append(
                {
                    "source_key": record["source_key"],
                    "course_code": record["course_code"],
                    "source_title": record["source_snapshot"]["title"],
                    "jamb_names": record.get("jamb_names", []),
                    "fields": record.get("fields", []),
                    "official_source_url": CCMAS_SOURCE_URLS.get(source_file),
                    "extracted_text_file": str(text_path.relative_to(ROOT)),
                    "extracted_text_sha256": None,
                    "source_search": {
                        "searched_variants": [],
                        "candidate_count": 0,
                        "top_candidates": [],
                    },
                    "disposition": "extraction_limitation_missing_local_text",
                    "rationale": "The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.",
                    "canonical_mapping_edited": False,
                }
            )
            continue
        pages = text_path.read_text(encoding="utf-8", errors="replace").split("\f")
        candidates = [
            candidate
            for page_number, page in enumerate(pages, 1)
            if (candidate := evidence_for_page(page_number, page, record["course_code"], record["source_snapshot"]["title"]))
        ]
        candidates.sort(
            key=lambda item: (
                item["exact_code_variant_hit"],
                item["exact_title_phrase_hit"],
                item["best_window_ratio"],
                item["title_token_ratio"],
            ),
            reverse=True,
        )
        top = candidates[:5]
        disposition, rationale = classify(record, top)
        results.append(
            {
                "source_key": record["source_key"],
                "course_code": record["course_code"],
                "source_title": record["source_snapshot"]["title"],
                "jamb_names": record.get("jamb_names", []),
                "fields": record.get("fields", []),
                "official_source_url": CCMAS_SOURCE_URLS.get(source_file),
                "extracted_text_file": str(text_path.relative_to(ROOT)),
                "extracted_text_sha256": sha256(text_path),
                "source_search": {
                    "searched_variants": [
                        "normalized course code with whitespace/punctuation removed",
                        "slash-separated course-code components",
                        "normalized full title phrase",
                        "meaningful title tokens",
                        "one-line continuation windows",
                        "course-level numeric token near title tokens",
                    ],
                    "candidate_count": len(candidates),
                    "top_candidates": top,
                },
                "disposition": disposition,
                "rationale": rationale,
                "canonical_mapping_edited": False,
            }
        )

    counts = Counter(result["disposition"] for result in results)
    checkpoint_number, out_json, out_md = next_checkpoint()
    output = {
        "schema": "2026-09-29.jamb-ccmas.residual-locator-lane-2.v1",
        "generated_on": date.today().isoformat(),
        "checkpoint": checkpoint_number,
        "status": "residual_locator_search_complete_source_adjudication_open",
        "scope": {
            "input_queue": str(QUEUE.relative_to(ROOT)),
            "input_queue_sha256": sha256(QUEUE),
            "requested_state": "locator:code_not_located_in_extracted_source",
            "records_searched": len(results),
            "excluded_same_page_candidates": 2189,
            "excluded_code_only_candidates": 198,
            "canonical_mappings_edited": False,
        },
        "source_documents": [
            {
                "source_file": source_file,
                "official_source_url": CCMAS_SOURCE_URLS.get(source_file),
                "extracted_text_file": str(source_text_path(source_file).relative_to(ROOT)),
                "extracted_text_present": source_text_path(source_file).exists(),
                "extracted_text_sha256": sha256(source_text_path(source_file))
                if source_text_path(source_file).exists()
                else None,
                "manifest_state": next(
                    (
                        row.get("extraction_state")
                        for row in manifest.get("source_documents", [])
                        if row.get("source_file") == source_file
                    ),
                    "not_in_current_extraction_manifest",
                ),
            }
            for source_file in sorted(
                {record["source_key"].split("::", 1)[0] for record in residual}
            )
        ],
        "counts": dict(sorted(counts.items())),
        "results": results,
        "limits": [
            "Extracted physical-page ordinals and line windows are locator evidence, not printed-page citations.",
            "A title or code candidate does not establish the exact programme context, course identity, content, outcomes, or JAMB mapping.",
            "Source omission candidates require visual PDF review or a fresh official retrieval before being declared unavailable.",
            "No canonical mapping, CCMAS source JSON, or downstream domain data was edited by this lane.",
        ],
    }
    out_json.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        f"# Residual CCMAS locator lane 2 checkpoint {checkpoint_number:03d} — 2026-09-29",
        "",
        "This append-only checkpoint searches only the 55 records classified `code_not_located_in_extracted_source`.",
        "It excludes the 2,189 same-page candidates and 198 code-only candidates, and it edits no canonical mapping.",
        "",
        "## Counts",
        "",
        f"- Records searched: **{len(results)}**",
    ]
    lines.extend(f"- `{key}`: **{value}**" for key, value in sorted(counts.items()))
    lines += ["", "## Interpretation", "", "A `source_omission_candidate` is not an unavailable decision. It means the exact row was not found in the current extracted official PDF text and needs visual/source retrieval adjudication.", ""]
    for result in results:
        lines += [
            f"### `{result['source_key']} :: {result['course_code']}`",
            "",
            f"- Title: {result['source_title']}",
            f"- JAMB contexts: {', '.join(result['jamb_names']) or 'none recorded'}",
            f"- Disposition: **`{result['disposition']}`**",
            f"- Official source: {result['official_source_url']}",
            f"- Rationale: {result['rationale']}",
        ]
        for candidate in result["source_search"]["top_candidates"][:2]:
            lines.append(
                f"- Candidate physical page {candidate['extracted_page_ordinal']} ({candidate['evidence_class']}, title ratio {candidate['title_token_ratio']}, window ratio {candidate['best_window_ratio']}):"
            )
            for hit in candidate["line_evidence"][:2]:
                lines.append(f"  - line {hit['line']}: `{hit['excerpt']}`")
        lines.append("")
    lines += [
        "## Limits",
        "",
        "- Physical-page ordinals are extraction positions, not printed-page citations.",
        "- Candidate evidence still requires exact programme/table context adjudication.",
        "- No canonical mapping or CCMAS source record was changed.",
        "",
    ]
    out_md.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"checkpoint": checkpoint_number, "json": str(out_json), "markdown": str(out_md), "counts": dict(sorted(counts.items()))}, indent=2))


if __name__ == "__main__":
    main()
