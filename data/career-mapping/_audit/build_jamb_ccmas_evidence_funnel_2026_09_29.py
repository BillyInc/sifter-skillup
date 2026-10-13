"""Build an exception-first evidence queue from the exhaustive local scans.

This is a triage/materialisation step, not a source-verification step.  It
keeps every current JAMB occurrence and CCMAS course row, but separates rows
that already have a useful local locator candidate from rows that need a
primary-source decision.  Exact same-source/code/title/detail groups are
represented once for source review and retain dependent package rows for
package-specific schedule and ownership checks.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
DISCOVERY = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
TEXT_SEARCH = AUDIT / "jamb_ccmas_local_source_text_search_2026-09-28.json"
OUT_JSON = AUDIT / "jamb_ccmas_evidence_funnel_2026-09-29.json"
OUT_MD = AUDIT / "jamb_ccmas_evidence_funnel_2026-09-29.md"


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().casefold()


def compact(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: compact(value[key]) for key in sorted(value)}
    if isinstance(value, list):
        return [compact(item) for item in value]
    return value


def detail_fingerprint(row: dict[str, Any]) -> str:
    """Fingerprint only course detail, never package schedule metadata."""

    payload = {
        "title": norm(row.get("title")),
        "content_summary": norm(row.get("content_summary")),
        "learning_outcomes": [norm(item) for item in row.get("learning_outcomes") or []],
    }
    return hashlib.sha256(json.dumps(compact(payload), ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()


def structural_reasons(row: dict[str, Any]) -> list[str]:
    reasons: list[str] = []
    if not norm(row.get("content_summary")) or norm(row.get("content_summary")) in {"n/a", "na", "tbd", "to be supplied", "none"}:
        reasons.append("empty_or_placeholder_content")
    outcomes = row.get("learning_outcomes") or []
    if not outcomes or not any(norm(item) for item in outcomes):
        reasons.append("empty_outcomes")
    normalized_outcomes = [norm(item) for item in outcomes if norm(item)]
    if len(normalized_outcomes) != len(set(normalized_outcomes)):
        reasons.append("repeated_outcome_text")
    if not norm(row.get("code")) or not norm(row.get("title")):
        reasons.append("missing_course_identity")
    if not row.get("source_url") or not row.get("source_locator"):
        reasons.append("missing_item_source_metadata")
    return reasons


def deep_review_reasons(reasons: list[str]) -> list[str]:
    """Return reasons that require a content/source decision.

    Missing item-level metadata is still retained as a repair obligation, but
    it does not prevent one verified source block from covering identical
    detail rows.  Schedule, ownership and locator fields remain per-row work.
    """

    return [reason for reason in reasons if reason != "missing_item_source_metadata"]


def build_ccmas_queue(discovery: dict[str, Any], text_search: dict[str, Any]) -> tuple[list[dict], list[dict], dict]:
    search_by_id: dict[str, dict] = {}
    for package in text_search.get("ccmas_packages", []):
        for course in package.get("courses", []):
            search_by_id[course["record_id"]] = {**course, "source_file": package.get("source_file"), "programme": package.get("programme")}

    rows = discovery.get("ccmas_course_rows", [])
    by_group: dict[tuple[str, str, str, str], list[dict]] = defaultdict(list)
    preliminary: list[dict] = []
    for row in rows:
        located = search_by_id.get(row["record_id"], {})
        reasons = structural_reasons(row)
        if not located.get("local_text_available"):
            reasons.append("local_extract_missing")
        elif not located.get("title_code_cohit_pages"):
            reasons.append("code_title_not_co_located")
        if located.get("code_hit_count_in_local_extract", 0) > 1:
            reasons.append("ambiguous_code_hits")
        if row.get("prior_checkpoint_same_code_title_mismatch_candidates"):
            reasons.append("prior_code_title_mismatch_checkpoint")
        detail_key = (
            row.get("source_file", ""),
            norm(row.get("code")),
            norm(row.get("title")),
            detail_fingerprint(row),
        )
        by_group[detail_key].append(row)
        blockers = deep_review_reasons(sorted(set(reasons)))
        preliminary.append({
            "record_id": row["record_id"],
            "source_file": row.get("source_file"),
            "discipline": row.get("discipline"),
            "programme": row.get("programme"),
            "course_ordinal": row.get("course_ordinal"),
            "code": row.get("code"),
            "title": row.get("title"),
            "detail_fingerprint": detail_key[3],
            "local_locator_pages": located.get("title_code_cohit_pages", []),
            "local_extract_available": bool(located.get("local_text_available")),
            "structural_reasons": sorted(set(reasons)),
            "deep_review_reasons": blockers,
            "source_review_state": "exception_queue" if blockers else "metadata_fill_after_source_review" if reasons else "locator_candidate_needs_source_adjudication",
        })

    group_by_record: dict[str, dict] = {}
    shared_groups: list[dict] = []
    for key, group_rows in sorted(by_group.items()):
        group_id = hashlib.sha1("|".join(key).encode("utf-8")).hexdigest()[:16]
        eligible = len(group_rows) > 1 and all(
            not deep_review_reasons(structural_reasons(row)) for row in group_rows
        )
        representative = group_rows[0]
        shared_groups.append({
            "group_id": group_id,
            "source_file": key[0],
            "course_code": representative.get("code"),
            "course_title": representative.get("title"),
            "detail_fingerprint": key[3],
            "record_ids": [row["record_id"] for row in group_rows],
            "source_review_reuse_allowed": eligible,
            "reuse_limit": "Reuse only the exact source detail block; compare units/status/lecture/practical hours and package ownership separately for every dependent row." if eligible else "Do not reuse: at least one row has a structural exception.",
        })
        for row in group_rows:
            group_by_record[row["record_id"]] = {"group_id": group_id, "group_size": len(group_rows), "source_review_reuse_allowed": eligible}

    for item in preliminary:
        item.update(group_by_record[item["record_id"]])
        if item["source_review_reuse_allowed"] and not item["deep_review_reasons"]:
            item["source_review_state"] = "shared_detail_candidate_one_source_review_can_cover_detail_block"

    queue_counts = defaultdict(int)
    for item in preliminary:
        queue_counts[item["source_review_state"]] += 1
        for reason in item["structural_reasons"]:
            queue_counts[f"reason:{reason}"] += 1
    return preliminary, shared_groups, dict(sorted(queue_counts.items()))


def build_jamb_queue(discovery: dict[str, Any], text_search: dict[str, Any]) -> tuple[list[dict], dict]:
    search_by_id = {row.get("occurrence_id"): row for row in text_search.get("jamb_occurrences", [])}
    findings: list[dict] = []
    counts = defaultdict(int)
    occurrences = [
        occurrence
        for identity in discovery.get("jamb_identities", [])
        for occurrence in identity.get("source_occurrences", [])
    ] + discovery.get("orphan_source_occurrences", [])
    finding_by_occurrence = {
        occurrence.get("occurrence_id"): identity.get("findings", [])
        for identity in discovery.get("jamb_identities", [])
        for occurrence in identity.get("source_occurrences", [])
    }
    for occurrence in occurrences:
        occurrence_id = occurrence.get("occurrence_id")
        located = search_by_id.get(occurrence_id, {})
        reasons: list[str] = []
        if not occurrence.get("verified_against_pdf") or not occurrence.get("pdf_table_locator"):
            reasons.append("missing_explicit_pdf_metadata")
        if not located.get("exact_title_candidate_hit_count"):
            reasons.append("title_not_located_in_local_extract")
        if len(occurrence.get("jamb_name", "").split()) > 2:
            reasons.append("compound_title_requires_facet_review")
        if not occurrence.get("institution_codes_verified_from_pdf"):
            reasons.append("institution_context_not_source_verified")
        if finding_by_occurrence.get(occurrence_id):
            reasons.append("deterministic_finding_present")
        state = "exception_queue" if reasons else "locator_candidate_needs_source_adjudication"
        counts[state] += 1
        for reason in reasons:
            counts[f"reason:{reason}"] += 1
        findings.append({
            "occurrence_id": occurrence_id,
            "jamb_name": occurrence.get("jamb_name"),
            "source_faculty": occurrence.get("source_faculty"),
            "source_file": occurrence.get("source_file"),
            "institution_count": len(occurrence.get("institutions") or []),
            "local_title_hits": located.get("exact_title_candidate_hit_count", 0),
            "reasons": sorted(set(reasons)),
            "source_review_state": state,
        })
    return findings, dict(sorted(counts.items()))


def main() -> None:
    discovery = read_json(DISCOVERY)
    text_search = read_json(TEXT_SEARCH)
    ccmas_rows, shared_groups, ccmas_counts = build_ccmas_queue(discovery, text_search)
    jamb_rows, jamb_counts = build_jamb_queue(discovery, text_search)
    report = {
        "schema": "2026-09-29.jamb-ccmas-evidence-funnel.v1",
        "generated_on": date.today().isoformat(),
        "status": "exception_queue_built_source_adjudication_open",
        "method": [
            "All current rows remain in the output; no row is silently promoted or removed.",
            "Exact same-source/code/title/detail groups get one source-review representative only when structural fields are clean.",
            "Package-specific schedule, ownership, source locator and context still require a per-row comparison.",
            "Local code/title hits are locator candidates, never authoritative confirmation.",
        ],
        "scope": {
            "jamb_occurrences": len(jamb_rows),
            "ccmas_course_rows": len(ccmas_rows),
            "ccmas_shared_detail_groups": len(shared_groups),
            "ccmas_rows_eligible_for_exact_detail_reuse": sum(item["source_review_reuse_allowed"] for item in ccmas_rows),
            "ccmas_rows_with_deep_review_exceptions": sum(bool(item["deep_review_reasons"]) for item in ccmas_rows),
            "ccmas_rows_requiring_metadata_fill": sum("missing_item_source_metadata" in item["structural_reasons"] for item in ccmas_rows),
            "jamb_occurrences_with_exceptions": sum(item["source_review_state"] == "exception_queue" for item in jamb_rows),
        },
        "ccmas_queue_counts": ccmas_counts,
        "jamb_queue_counts": jamb_counts,
        "ccmas_rows": ccmas_rows,
        "ccmas_shared_detail_groups": shared_groups,
        "jamb_occurrences": jamb_rows,
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# JAMBâ€“CCMAS evidence funnel â€” 2026-09-29",
        "",
        "This queue makes the exhaustive local scan useful without treating local text hits as source proof.",
        "",
        "## Scope",
        "",
    ]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in report["scope"].items())
    lines += ["", "## CCMAS queue states", ""]
    lines.extend(f"- `{key}`: {value}" for key, value in ccmas_counts.items())
    lines += ["", "## JAMB queue states", ""]
    lines.extend(f"- `{key}`: {value}" for key, value in jamb_counts.items())
    lines += [
        "",
        "## Operating rule",
        "",
        "Agents should consume only `exception_queue` rows and shared-detail representatives. Local repair may proceed only from a source-backed finding, then rerun this funnel. Rows in `locator_candidate_needs_source_adjudication` are not student-approved or source-confirmed.",
        "",
        f"Machine-readable output: `{OUT_JSON.name}`.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "scope": report["scope"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
