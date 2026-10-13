"""Adjudicate the residual CCMAS locator lane without changing canonical data.

Scope is deliberately limited to the 198 unique records classified by the
automated locator pass as ``code_hit_without_same_page_title_candidate``.
The script reads the extracted official-PDF text, finds the code row and its
nearby continuation lines, and records a source locator plus a conservative
disposition.  It does not inspect the 2,189 same-page candidates and does not
edit mappings, curriculum JSON, seeds, or SQL.
"""

from __future__ import annotations

import json
import re
import unicodedata
from collections import Counter
from datetime import date
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
QUEUE = AUDIT / "jamb_ccmas_source_locator_enriched_queue_2026-09-29.json"
TEXT_SEARCH = AUDIT / "jamb_ccmas_local_source_text_search_2026-09-28.json"
OUT_JSON = AUDIT / "jamb_ccmas_source_audit_lane_1_residual_locator_198_2026-09-29_002.json"
OUT_MD = AUDIT / "jamb_ccmas_source_audit_lane_1_residual_locator_198_2026-09-29_002.md"


ALIASES = {
    "acct": "accounting",
    "admin": "administration",
    "adm": "administration",
    "assoc": "association",
    "assocs": "associations",
    "behav": "behavior",
    "behaviour": "behavior",
    "comm": "communication",
    "contemp": "contemporary",
    "emp": "employment",
    "empl": "employment",
    "exist": "existence",
    "fin": "financial",
    "govt": "government",
    "hrm": "human resource management",
    "hr": "human resource",
    "info": "information",
    "intro": "introduction",
    "mgt": "management",
    "mgmt": "management",
    "mkt": "marketing",
    "org": "organization",
    "orgn": "organization",
    "prog": "program",
    "programmes": "programs",
    "programme": "program",
    "rel": "relation",
    "scm": "supply chain management",
    "s.chains": "supply chains",
    "tech": "technology",
}


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def normalise(value: Any) -> tuple[set[str], str]:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = text.encode("ascii", "ignore").decode("ascii").lower()
    text = text.replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    tokens: list[str] = []
    for token in text.split():
        expanded = ALIASES.get(token, token).split()
        for item in expanded:
            # PDF title rows and catalogue records vary between singular and
            # plural forms (element/elements, service/services, etc.). Keep
            # the conservative exceptions that would be damaged by stripping
            # a terminal ``s``.
            if len(item) > 4 and item.endswith("ies"):
                item = item[:-3] + "y"
            elif len(item) > 4 and item.endswith("s") and not item.endswith("ss"):
                item = item[:-1]
            tokens.append(item)
    return set(tokens), " ".join(tokens)


def title_score(expected: str, observed: str) -> tuple[float, float, float]:
    expected_tokens, expected_text = normalise(expected)
    observed_tokens, observed_text = normalise(observed)
    if not expected_tokens or not observed_tokens:
        return 0.0, 0.0, 0.0
    overlap = len(expected_tokens & observed_tokens)
    expected_coverage = overlap / len(expected_tokens)
    observed_coverage = overlap / len(observed_tokens)
    sequence = SequenceMatcher(None, expected_text, observed_text).ratio()
    return expected_coverage, observed_coverage, sequence


def code_pattern(code: str) -> re.Pattern[str]:
    parts = re.findall(r"[A-Za-z0-9]+", code.upper())
    if not parts:
        return re.compile(r"$^")
    return re.compile(r"\\b" + r"\\s*".join(map(re.escape, parts)) + r"\\b", re.I)


def page_rows(text: str, code: str) -> list[dict[str, Any]]:
    """Return code-hit windows with 1-based extracted page and line locators."""

    rows: list[dict[str, Any]] = []
    pattern = code_pattern(code)
    global_line = 0
    for page_ordinal, page in enumerate(text.split("\f"), start=1):
        lines = page.splitlines()
        for local_index, line in enumerate(lines):
            global_line += 1
            if not pattern.search(line):
                continue
            start = max(0, local_index - 2)
            end = min(len(lines), local_index + 5)
            window_lines = [item.strip() for item in lines[start:end] if item.strip()]
            rows.append(
                {
                    "extracted_page_ordinal": page_ordinal,
                    "line": global_line,
                    "excerpt": " ".join(window_lines),
                    "code_line": line.strip(),
                    "window_lines": window_lines,
                }
            )
        # splitlines() does not include the form-feed separator in the count.
        # The separator itself is a line boundary in the extracted text.
        global_line += 1
    return rows


def evidence_rows(record: dict[str, Any], text: str) -> list[dict[str, Any]]:
    code = record["course_code"]
    rows = page_rows(text, code)
    provided = record.get("automated_source_locator", {}).get("candidate_snippets", [])
    seen = {
        (item["extracted_page_ordinal"], item["line"], item["excerpt"])
        for item in rows
    }
    for item in provided:
        key = (item.get("extracted_page_ordinal"), item.get("line"), item.get("excerpt", ""))
        if key not in seen:
            rows.append(
                {
                    "extracted_page_ordinal": item.get("extracted_page_ordinal"),
                    "line": item.get("line"),
                    "excerpt": item.get("excerpt", ""),
                    "code_line": item.get("excerpt", ""),
                    "window_lines": [item.get("excerpt", "")],
                }
            )
    return rows


def classify(record: dict[str, Any], candidates: list[dict[str, Any]]) -> dict[str, Any]:
    expected = record["source_snapshot"].get("title", "")
    scored: list[dict[str, Any]] = []
    for candidate in candidates:
        coverage, observed_coverage, sequence = title_score(expected, candidate["excerpt"])
        # A continuation is suggested when the expected title's tokens are
        # spread across the code window rather than appearing as one compact
        # row.  This is evidence for review, not a canonical-data repair.
        line_count = len(candidate.get("window_lines", []))
        scored.append(
            {
                **candidate,
                "expected_title_coverage": round(coverage, 4),
                "observed_title_coverage": round(observed_coverage, 4),
                "sequence_similarity": round(sequence, 4),
                "window_line_count": line_count,
            }
        )
    scored.sort(
        key=lambda row: (
            row["expected_title_coverage"],
            row["sequence_similarity"],
            row["observed_title_coverage"],
        ),
        reverse=True,
    )
    best = scored[0] if scored else {
        "extracted_page_ordinal": None,
        "line": None,
        "excerpt": "",
        "expected_title_coverage": 0.0,
        "observed_title_coverage": 0.0,
        "sequence_similarity": 0.0,
        "window_line_count": 0,
    }
    expected_tokens, expected_text = normalise(expected)
    observed_tokens, observed_text = normalise(best["excerpt"])
    coverage = best["expected_title_coverage"]
    # The locator lane is intentionally conservative. A high token match is
    # enough to classify a formatting/wrapping issue, but never to mutate data.
    if coverage >= 0.9:
        if len(best.get("window_lines", [])) >= 3 and not expected_text in observed_text:
            disposition = "wrapped_or_continuation_title_match"
            rationale = "The expected title tokens are present across the extracted code-row window; PDF text layout split or wrapped the title."
        else:
            disposition = "normalized_title_variant"
            rationale = "The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization."
    elif coverage >= 0.55:
        disposition = "wrapped_or_continuation_candidate_needs_visual_confirmation"
        rationale = "Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation."
    else:
        disposition = "genuine_title_conflict_candidate"
        rationale = "The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication."
    return {
        "disposition": disposition,
        "rationale": rationale,
        "best_evidence": best,
        "alternative_evidence": scored[1:4],
        "source_title_tokens": sorted(expected_tokens),
        "best_observed_title_tokens": sorted(observed_tokens),
    }


def main() -> None:
    queue = load(QUEUE)
    text_search = load(TEXT_SEARCH)
    target = [
        row
        for row in queue["course_record_queue"]
        if row.get("automated_source_locator", {}).get("state")
        == "code_hit_without_same_page_title_candidate"
    ]
    if len(target) != 198:
        raise SystemExit(f"Expected exactly 198 residual records, found {len(target)}")

    package_index = {
        f"{package['source_file']}::{package['programme']}": package
        for package in text_search.get("ccmas_packages", [])
    }
    dispositions: Counter[str] = Counter()
    records: list[dict[str, Any]] = []
    missing_text: list[str] = []
    for row in target:
        source_key = row["source_key"]
        package = package_index.get(source_key)
        if not package or not package.get("local_text_available") or not package.get("local_text_file"):
            missing_text.append(source_key)
            continue
        # Existing manifests use either ``_audit/...`` relative to the repo
        # root or a path relative to the audit directory. Resolve both forms
        # without allowing an arbitrary absolute path.
        relative_text_path = Path(package["local_text_file"])
        if relative_text_path.is_absolute():
            raise SystemExit(f"Absolute extracted-text path is not allowed: {relative_text_path}")
        text_path = (
            ROOT / "data/career-mapping" / relative_text_path
            if relative_text_path.parts
            and relative_text_path.parts[0] in {"_audit", "_pdftxt", "_ccmas_txt"}
            else AUDIT / relative_text_path
        )
        text = text_path.read_text(encoding="utf-8", errors="replace")
        decision = classify(row, evidence_rows(row, text))
        dispositions[decision["disposition"]] += 1
        source_file, programme = source_key.split("::", 1)
        records.append(
            {
                "source_file": source_file,
                "package": programme,
                "course_code": row["course_code"],
                "jamb_names": row.get("jamb_names", []),
                "official_pdf_url": package["official_source_url"],
                "stored_source_title": row["source_snapshot"].get("title"),
                "stored_selected_fields": {
                    "title": row["selected_snapshot"].get("title"),
                    "units": row["selected_snapshot"].get("units"),
                    "status": row["selected_snapshot"].get("status"),
                    "lecture_hours": row["selected_snapshot"].get("lecture_hours"),
                    "practical_hours": row["selected_snapshot"].get("practical_hours"),
                },
                "extracted_text_file": package["local_text_file"],
                "source_disposition": decision["disposition"],
                "rationale": decision["rationale"],
                "source_evidence": {
                    "best": decision["best_evidence"],
                    "alternatives": decision["alternative_evidence"],
                },
                "canonical_edit_applied": False,
            }
        )

    if missing_text:
        raise SystemExit("Missing extracted official text for: " + ", ".join(sorted(missing_text)))
    records.sort(key=lambda row: (row["source_file"], row["package"], row["course_code"]))
    output = {
        "schema": "2026-09-29.jamb-ccmas-source-audit-lane-1-residual-locator.v1",
        "generated_on": date.today().isoformat(),
        "status": "residual_198_source_locator_adjudicated_canonical_review_open",
        "lane": 1,
        "scope": {
            "queue_state": "locator:code_hit_without_same_page_title_candidate",
            "records_targeted": 198,
            "records_processed": len(records),
            "same_page_candidates_excluded": 2189,
            "not_located_records_excluded": 55,
            "canonical_data_changed": False,
        },
        "counts_by_disposition": dict(sorted(dispositions.items())),
        "method": [
            "Read only the extracted text linked by the queue's official PDF package context.",
            "Matched each course code to nearby source lines and continuation windows.",
            "Compared stored titles using conservative token, abbreviation, and sequence normalization.",
            "Recorded conflicts as candidates for source adjudication; no canonical mapping or seed was edited.",
        ],
        "records": records,
    }
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# JAMB↔CCMAS source audit — lane 1 residual locator/code-hit records",
        "",
        "This append-only checkpoint covers only the 198 unique records classified as `locator:code_hit_without_same_page_title_candidate`.",
        "The 2,189 same-page candidates and 55 code-not-located records were excluded. No canonical mapping, curriculum JSON, seed, or SQL was changed.",
        "",
        "## Scope and result",
        "",
        f"- Records targeted: **{len(target)}**",
        f"- Records processed: **{len(records)}**",
        f"- Same-page candidates excluded: **2,189**",
        f"- Code-not-located records excluded: **55**",
        "- Official PDF URL, extracted page/line, and source snippet are retained per record in the JSON checkpoint.",
        "",
        "## Dispositions",
        "",
    ]
    for key, value in sorted(dispositions.items()):
        lines.append(f"- `{key}`: **{value}**")
    lines += [
        "",
        "## Interpretation",
        "",
        "Normalized or wrapped matches are locator-level findings, not permission to overwrite stored content or outcomes. Genuine conflicts remain explicit source-adjudication candidates and must be resolved against the official PDF/package context before any canonical repair.",
        "",
    ]
    for index, record in enumerate(records, start=1):
        best = record["source_evidence"]["best"]
        lines.extend(
            [
                f"### {index}. {record['source_file']} — {record['package']} — {record['course_code']}",
                "",
                f"- Stored title: `{record['stored_source_title']}`",
                f"- Disposition: `{record['source_disposition']}`",
                f"- PDF: {record['official_pdf_url']}",
                f"- Extracted locator: page `{best.get('extracted_page_ordinal')}`, line `{best.get('line')}`",
                f"- Snippet: `{best.get('excerpt', '').replace('`', '')}`",
                f"- Rationale: {record['rationale']}",
                "",
            ]
        )
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "scope": output["scope"], "counts": output["counts_by_disposition"]}, indent=2))


if __name__ == "__main__":
    main()
