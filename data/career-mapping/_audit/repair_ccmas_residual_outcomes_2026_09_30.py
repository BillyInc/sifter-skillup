"""Second deterministic pass for the residual CCMAS outcome queue.

The first pass used the reconciliation ledger's parsed candidates.  This pass
re-reads the extracted text of the original CCMAS PDFs and looks for layout
forms that parser candidates can miss: wrapped numbered outcomes and explicit
bullet outcomes.  It is limited to the current 123 empty-outcome rows that
remain in the multiple/conflicting-source class.

Promotion requires a single candidate inside the exact programme page range,
an exact course-code hit, a bounded title match, and explicit outcome text.
Only ``skills_learned`` is changed.  The JAMB scopes and all downstream data
are intentionally outside this script's input and output paths.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from reconcile_ccmas_ambiguous_detail_candidates_2026_09_29 import programme_page_ranges
from repair_ccmas_no_structured_outcomes_2026_09_30 import (
    extract_layout_candidates,
    flexible_title_pattern,
    code_pattern,
    clean,
    compact_code,
)


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CCMAS_DIR = ROOT / "ccmas"
TEXT_DIR = AUDIT / "ccmas_original_source_text_2026-09-29"
REPORT = AUDIT / "ccmas_source_reconciliation_report_2026-09-29.json"
RECONCILIATION = AUDIT / "ccmas_full_detail_reconciliation_original_2026-09-29-pass5_applied.json"
OUT_PREFIX = AUDIT / "ccmas_residual_outcome_repair_2026-09-30"


def blank(value: Any) -> bool:
    return value is None or (isinstance(value, list) and not value) or (isinstance(value, str) and not clean(value))


def title_match(local_title: Any, candidate_title: Any) -> bool:
    local = set(re.findall(r"[a-z0-9]+", clean(local_title).casefold()))
    value = clean(candidate_title)
    # The bounded extractor's line/excerpt normally starts with the exact
    # course-code header. Remove that header before testing the title, while
    # retaining any later course code that would reveal parser spill.
    value = re.sub(r"^\s*[A-Z]{2,10}\s*\d{3,4}\s*:\s*", "", value, flags=re.I)
    candidate = set(re.findall(r"[a-z0-9]+", value.casefold()))
    if not local or not candidate or len(value) > 120:
        return False
    if re.search(r"\b[A-Z]{2,5}\s*\d{3}\b", value) or value.count(";") > 1:
        return False
    overlap = len(local & candidate) / max(len(local), len(candidate))
    return local.issubset(candidate) or candidate.issubset(local) or overlap >= 0.9


def parse_bullets(outcome_body: str) -> list[str]:
    """Parse only visibly marked bullets; prose sentences are not inferred."""

    values: list[str] = []
    for line in outcome_body.splitlines():
        value = re.sub(r"^\s*(?:[-*•▪‣]|\(?[a-z]\)|\(?[ivx]+\))\s*", "", line, flags=re.I).strip()
        if value != line.strip() and len(value) >= 12:
            values.append(clean(value).strip(" ;,"))
    return values


def parse_prose_outcome(outcome_body: str) -> list[str]:
    """Keep a single explicitly stated outcome when the PDF uses no list."""

    value = clean(outcome_body).strip(" ;,")
    if len(value) < 25:
        return []
    if re.search(r"\b(?:should|will|must)\s+be\s+able\s+to\s*:\s*$", value, re.I):
        return []
    # Remove a single common OCR continuation mark without rewriting the
    # source sentence itself.
    value = re.sub(r"^h\s+(?=At\s+the\s+end\b)", "", value, flags=re.I)
    marker = re.search(
        r"\b(?:students?|learners?)\s+(?:should|will|must)\s+be\s+able\s+to\b|"
        r"\b(?:the\s+)?course\s+(?:will|enables?)\b|\bwill\s+master\b|\baims?\s+to\b",
        value,
        re.I,
    )
    if not marker:
        return []
    # A heading such as "At the end of this course, students should be able
    # to:" is not an outcome. Require substantive text after the marker.
    tail = value[marker.end() :].strip(" :;,.-\u2014")
    if len(tail) < 12:
        return []
    return [value]


def parse_inline_numbered(outcome_body: str) -> list[str]:
    """Split source lists that use ``1 text; 2 text`` without full stops."""

    body = clean(outcome_body).strip(" ;,")
    matches = list(re.finditer(r"(?:^|(?<=[;:]))\s*(\d{1,2})\s+(?=[A-Za-z])", body))
    if not matches or matches[0].group(1) != "1":
        return []
    numbers = [int(item.group(1)) for item in matches]
    if numbers != list(range(1, len(numbers) + 1)):
        return []
    values: list[str] = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(body)
        value = clean(body[match.end() : end]).strip(" ;,")
        if len(value) >= 12:
            values.append(value)
    return values


def extract_numbered_or_bulleted(page: str, code: str, title: str) -> list[dict[str, Any]]:
    """Return bounded detail blocks with numbered or explicitly marked outcomes."""

    candidates = extract_layout_candidates(page, code, title)
    for candidate in candidates:
        excerpt = candidate.get("excerpt") or ""
        match = re.search(r"Learning\s+Outcomes?\s*:?(.*?)(?=Course\s+Contents?)", excerpt, re.I | re.S)
        if match:
            # The generic extractor searches forward for an outcomes heading.
            # If another course header appears first, those outcomes belong to
            # the next course and must not be attributed to this one.
            prefix = excerpt[: match.start()]
            course_headers = re.findall(r"(?<![A-Za-z0-9])([A-Z]{2,10}\s*\d{3,4})\s*[:\-/]", prefix)
            if len(course_headers) > 1:
                candidate["outcomes"] = []
                continue
            body = match.group(1)
            if candidate.get("outcomes"):
                body_outcomes = parse_inline_numbered(body)
                if body_outcomes:
                    candidate["outcomes"] = body_outcomes
                continue
            candidate["outcomes"] = parse_inline_numbered(body) or parse_bullets(body) or parse_prose_outcome(body)
    return candidates


def row_key(source_file: str, programme: str, code: str) -> tuple[str, str, str]:
    return source_file, programme, " ".join(str(code or "").upper().split())


def load_packages() -> tuple[dict[str, dict[str, Any]], dict[tuple[str, str, str], dict[str, Any]]]:
    packages: dict[str, dict[str, Any]] = {}
    lookup: dict[tuple[str, str, str], dict[str, Any]] = {}
    for path in sorted(CCMAS_DIR.glob("*.json")):
        document = json.loads(path.read_text(encoding="utf-8"))
        packages[path.name] = document
        for programme in document.get("programmes") or []:
            for course in programme.get("courses") or []:
                lookup[(path.name, programme.get("name"), compact_code(course.get("code")))] = course
    return packages, lookup


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    report = json.loads(REPORT.read_text(encoding="utf-8"))
    reconciliation = json.loads(RECONCILIATION.read_text(encoding="utf-8"))
    packages, lookup = load_packages()
    proposal_lookup = {
        row_key(*row["source_key"].split("::", 1), row["course_code"]): row
        for row in reconciliation.get("proposals", [])
    }
    targets = [
        row for row in report.get("course_rows", [])
        if row.get("outcomes_empty") and row.get("outcomes_source_class") == "multiple_or_conflicting_source_contexts"
    ]
    ranges = {source_file: programme_page_ranges(source_file) for source_file in {row["source_file"] for row in targets}}
    classifications: list[dict[str, Any]] = []
    changes: list[dict[str, Any]] = []
    counters = Counter()
    pending: set[str] = set()

    for target in targets:
        source_file = target["source_file"]
        programme = target["programme"]
        code = target["code"]
        key = row_key(source_file, programme, code)
        course = lookup.get((source_file, programme, compact_code(code)))
        bounds = ranges.get(source_file, {}).get(programme)
        text_path = TEXT_DIR / (Path(source_file).stem + ".txt")
        raw = text_path.read_text(encoding="utf-8", errors="replace") if text_path.exists() else ""
        all_candidates: list[dict[str, Any]] = []
        for page_number, page in enumerate(raw.split("\f"), start=1):
            if not page.strip():
                continue
            for candidate in extract_numbered_or_bulleted(page, code, target.get("title") or ""):
                candidate["page"] = page_number
                all_candidates.append(candidate)
        scoped = [candidate for candidate in all_candidates if bounds and bounds[0] <= candidate["page"] <= bounds[1]]
        valid = [
            candidate
            for candidate in scoped
            if candidate.get("outcomes")
            and title_match(target.get("title"), candidate.get("line_text", ""))
        ]
        # The line text can be only the code line on some PDFs, so fall back
        # to the candidate excerpt, which still has to match the full title.
        valid = [
            candidate
            for candidate in scoped
            if candidate.get("outcomes")
            and (title_match(target.get("title"), candidate.get("line_text", "")) or title_match(target.get("title"), candidate.get("excerpt", "").split("Learning Outcomes", 1)[0]))
        ]
        signatures = {
            json.dumps(candidate.get("outcomes"), ensure_ascii=False, sort_keys=True)
            for candidate in valid
        }
        proposal = proposal_lookup.get(key) or {}
        ledger_outcomes = [
            item for item in proposal.get("ranked_candidates", [])
            if item.get("candidate", {}).get("outcomes_text") and item.get("course_code_exact")
        ]
        disposition = "unresolved_context_or_extraction"
        reason = "No single bounded original-PDF outcome block passed the second-pass guard."
        selected: dict[str, Any] | None = None
        if len(valid) == 1 and len(signatures) == 1 and course is not None and blank(course.get("skills_learned")):
            selected = valid[0]
            disposition = "repaired_unique_layout_candidate"
            reason = "A second-pass original-PDF layout scan found one bounded exact-code/title outcome block."
            change = {
                "source_file": source_file,
                "programme": programme,
                "code": code,
                "title": target.get("title"),
                "page": selected["page"],
                "field": "skills_learned",
                "before": copy.deepcopy(course.get("skills_learned") or []),
                "after": selected["outcomes"],
                "guard": "single bounded programme-page exact-code/title block with explicit numbered or bullet outcomes",
            }
            changes.append(change)
            pending.add(source_file)
            if args.apply:
                course["skills_learned"] = copy.deepcopy(selected["outcomes"])
        elif not bounds:
            disposition = "unresolved_programme_range"
            reason = "The original PDF has no reliable programme page range for this row."
        elif len(valid) > 1 or len(signatures) > 1:
            disposition = "true_source_conflict"
            reason = "The second-pass scan found multiple non-equivalent bounded outcome blocks."
        elif all_candidates and not valid and not ledger_outcomes:
            disposition = "source_authored_absence_or_unparsed_outcome"
            reason = "A bounded source block exists, but it has no explicit outcome format this pass can safely parse."
        counters[disposition] += 1
        classifications.append(
            {
                "source_file": source_file,
                "programme": programme,
                "code": code,
                "title": target.get("title"),
                "programme_page_range": bounds,
                "layout_candidate_count": len(all_candidates),
                "scoped_candidate_count": len(scoped),
                "valid_outcome_candidate_count": len(valid),
                "ledger_outcome_candidate_count": len(ledger_outcomes),
                "disposition": disposition,
                "reason": reason,
                "selected": selected,
            }
        )

    if args.apply:
        for source_file in sorted(pending):
            path = CCMAS_DIR / source_file
            path.write_text(json.dumps(packages[source_file], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    output = {
        "schema": "2026-09-30.ccmas-residual-outcome-repair.v1",
        "generated_on": date.today().isoformat(),
        "status": "applied" if args.apply else "dry_run",
        "scope": {
            "target_rows": len(targets),
            "target_class": "multiple_or_conflicting_source_contexts",
            "source_text_dir": str(TEXT_DIR.relative_to(ROOT)),
            "reconciliation_ledger": str(RECONCILIATION.relative_to(ROOT)),
            "excluded": ["JAMB scopes", "downstream mappings", "UI", "SQL", "roles"],
        },
        "counts": dict(sorted(counters.items())),
        "changes": changes,
        "classifications": classifications,
    }
    suffix = "_applied" if args.apply else "_dry_run"
    json_path = OUT_PREFIX.with_name(OUT_PREFIX.name + suffix + ".json")
    md_path = OUT_PREFIX.with_name(OUT_PREFIX.name + suffix + ".md")
    json_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md = [
        "# CCMAS residual outcome repair — 2026-09-30",
        "",
        f"Status: **{output['status']}**",
        "",
        f"Target rows: **{len(targets)}**",
        "",
        "## Deterministic dispositions",
        "",
    ]
    md.extend(f"- `{name}`: **{value}**" for name, value in sorted(counters.items()))
    md += ["", "Only a single bounded original-PDF outcome block can be applied. The JSON contains the complete row-level ledger.", ""]
    md_path.write_text("\n".join(md), encoding="utf-8")
    print(json.dumps({"json": str(json_path), "markdown": str(md_path), "status": output["status"], "counts": dict(sorted(counters.items())), "changes": len(changes)}, indent=2))


if __name__ == "__main__":
    main()
