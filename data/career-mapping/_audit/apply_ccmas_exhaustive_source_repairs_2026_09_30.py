"""Apply the remaining deterministic CCMAS source repairs.

This pass is deliberately narrow about what it changes and exhaustive about
what it classifies.  It reads the original-PDF reconciliation queue, checks
every current CCMAS course row for blank/placeholder summaries, empty
outcomes, repeated outcomes, and duplicate-code context, then writes an
append-only disposition ledger.  Only a unique bounded PDF candidate with a
usable field is written back to the source JSON.  Missing source text is
recorded as source-defined absence; ambiguity is recorded as unresolved
context, never filled with invented prose.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SOURCE_DIR = ROOT / "ccmas"
DEFAULT_RECON = AUDIT / "ccmas_full_detail_reconciliation_original_2026-09-29-pass6_dry_run.json"
OUT_PREFIX = AUDIT / "ccmas_exhaustive_source_repair_2026-09-30"

PLACEHOLDERS = {
    "", "-", "--", "---", "n/a", "na", "none", "not available",
    "not applicable", "nil", "tbc", "to be confirmed", "â€”", "—",
}


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("\u00a0", " ")).strip()


def folded(value: Any) -> str:
    return clean(value).casefold()


def key(source_file: str, programme: str, code: str) -> tuple[str, str, str]:
    return (source_file, clean(programme), clean(code).upper())


def blank_or_placeholder(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return folded(value) in PLACEHOLDERS
    if isinstance(value, list):
        return not [item for item in value if clean(item)]
    return False


def usable_content(value: Any) -> bool:
    text = clean(value)
    if len(text) < 24:
        return False
    # A source candidate that ends at a PDF boundary is not safe to promote.
    return text[0].isupper() and text[-1] in ".!?;:)"


def salvage_content(value: Any) -> str:
    """Trim a bounded candidate when extraction appended the next table heading."""
    text = clean(value)
    markers = [
        r"\bCourse Code\s+Course title\b",
        r"\bTotal\s+\d+(?:\.\d+)?\b",
        r"\b\d{3}\s+Level\b",
    ]
    cut = len(text)
    for marker in markers:
        match = re.search(marker, text, re.I)
        if match:
            cut = min(cut, match.start())
    return text[:cut].rstrip(" ;,\n")


def parse_outcomes(value: Any) -> list[str]:
    text = clean(value)
    if not text:
        return []
    matches = list(re.finditer(r"(?:^|\s)(\d+)\.\s*", text))
    if not matches:
        return []
    result: list[str] = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        item = re.sub(r"\s+", " ", text[match.end() : end]).strip(" ;,\n")
        if item:
            result.append(item)
    return result


def outcome_signature(values: list[Any]) -> tuple[str, ...]:
    return tuple(folded(value) for value in values if clean(value))


def candidate_for(proposals: dict[tuple[str, str, str], dict[str, Any]], row_key: tuple[str, str, str]) -> dict[str, Any] | None:
    proposal = proposals.get(row_key)
    if not proposal or proposal.get("state") != "auto_verified_unique_context_candidate":
        return None
    return proposal.get("selected_candidate") or None


def proposal_state(proposals: dict[tuple[str, str, str], dict[str, Any]], row_key: tuple[str, str, str]) -> str:
    proposal = proposals.get(row_key)
    if not proposal:
        return "not_in_reconciliation_queue"
    state = proposal.get("state") or "missing_state"
    return {
        "auto_verified_unique_context_candidate": "source_backed_unique_candidate",
        "single_candidate_evidence_review": "single_candidate_needs_review",
        "residual_context_conflict": "multiple_or_conflicting_source_contexts",
        "no_usable_candidate": "no_structured_original_source_candidate",
    }.get(state, state)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--reconciliation", type=Path, default=DEFAULT_RECON)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    reconciliation = json.loads(args.reconciliation.read_text(encoding="utf-8"))
    proposal_groups: dict[tuple[str, str, str], list[dict[str, Any]]] = defaultdict(list)
    for item in reconciliation.get("proposals", []):
        source_key = str(item.get("source_key") or "")
        if "::" not in source_key:
            continue
        source_file, programme = source_key.split("::", 1)
        proposal_groups[key(source_file, programme, str(item.get("course_code") or ""))].append(item)

    def proposal_rank(item: dict[str, Any]) -> tuple[int, int, int, int, float]:
        state_rank = {
            "auto_verified_unique_context_candidate": 4,
            "single_candidate_evidence_review": 3,
            "residual_context_conflict": 2,
            "no_usable_candidate": 1,
        }.get(item.get("state"), 0)
        candidate = item.get("selected_candidate") or {}
        workload = candidate.get("workload") or {}
        return (
            state_rank,
            int(bool(candidate.get("content_text"))) + int(bool(candidate.get("outcomes_text"))),
            int(bool(candidate.get("outcomes_text"))),
            int(bool(workload.get("units"))) + int(bool(workload.get("lecture_hours"))) + int(bool(workload.get("practical_hours"))),
            float(item.get("top_score_margin") or 0.0),
        )

    proposals = {row_key: max(items, key=proposal_rank) for row_key, items in proposal_groups.items()}

    documents: dict[Path, dict[str, Any]] = {}
    rows: list[dict[str, Any]] = []
    groups: dict[tuple[str, str, str], list[dict[str, Any]]] = defaultdict(list)
    for source_path in sorted(SOURCE_DIR.glob("*.json")):
        document = json.loads(source_path.read_text(encoding="utf-8"))
        documents[source_path] = document
        for programme in document.get("programmes") or []:
            programme_name = clean(programme.get("name"))
            for course in programme.get("courses") or []:
                row_key = key(source_path.name, programme_name, course.get("code"))
                row = {
                    "source_path": source_path,
                    "source_file": source_path.name,
                    "programme": programme_name,
                    "code": clean(course.get("code")),
                    "course": course,
                    "row_key": row_key,
                }
                rows.append(row)
                groups[row_key].append(row)

    summary_candidates: list[dict[str, Any]] = []
    outcome_candidates: list[dict[str, Any]] = []
    repeated_candidates: list[dict[str, Any]] = []
    changes: list[dict[str, Any]] = []
    pending_files: set[Path] = set()
    counters = Counter()

    for row in rows:
        course = row["course"]
        proposal = proposals.get(row["row_key"])
        candidate = candidate_for(proposals, row["row_key"])
        state = proposal_state(proposals, row["row_key"])
        source_before = {
            "content_summary": copy.deepcopy(course.get("content_summary")),
            "skills_learned": copy.deepcopy(course.get("skills_learned")),
            "source_state": copy.deepcopy(course.get("source_state")),
            "source_locator": copy.deepcopy(course.get("source_locator")),
        }
        field_changes: list[dict[str, Any]] = []

        current_summary = course.get("content_summary")
        summary_needs_work = blank_or_placeholder(current_summary)
        proposed_summary = salvage_content(candidate.get("content_text")) if candidate else None
        summary_disposition = state
        if summary_needs_work:
            if candidate and usable_content(proposed_summary):
                summary_disposition = "source_backed_unique_candidate"
                field_changes.append({"field": "content_summary", "before": copy.deepcopy(current_summary), "after": clean(proposed_summary)})
                counters["summary_auto_repair_candidates"] += 1
            elif candidate and proposed_summary:
                summary_disposition = "source_candidate_boundary_or_incomplete"
                counters["summary_candidate_not_safe"] += 1
            elif state == "source_backed_unique_candidate":
                summary_disposition = "source_context_confirmed_detail_absent"
            counters[f"summary:{summary_disposition}"] += 1
            summary_candidates.append({
                "source_file": row["source_file"], "programme": row["programme"], "code": row["code"],
                "title": course.get("title"), "current": current_summary,
                "candidate": proposed_summary, "disposition": summary_disposition,
                "source_page": candidate.get("extracted_page_ordinal") if candidate else None,
            })

        current_outcomes = course.get("skills_learned") or []
        outcomes_need_work = blank_or_placeholder(current_outcomes)
        proposed_outcomes = parse_outcomes(candidate.get("outcomes_text")) if candidate else []
        outcome_disposition = state
        if outcomes_need_work:
            if proposed_outcomes:
                outcome_disposition = "source_backed_unique_candidate"
                field_changes.append({"field": "skills_learned", "before": copy.deepcopy(current_outcomes), "after": proposed_outcomes})
                counters["outcome_auto_repair_candidates"] += 1
            elif state == "source_backed_unique_candidate":
                outcome_disposition = "source_context_confirmed_detail_absent"
            counters[f"outcomes:{outcome_disposition}"] += 1
            outcome_candidates.append({
                "source_file": row["source_file"], "programme": row["programme"], "code": row["code"],
                "title": course.get("title"), "current": current_outcomes,
                "candidate": proposed_outcomes, "disposition": outcome_disposition,
                "source_page": candidate.get("extracted_page_ordinal") if candidate else None,
            })

        normalized = [folded(value) for value in current_outcomes if clean(value)]
        duplicates = sorted({value for value in normalized if normalized.count(value) > 1})
        if duplicates:
            disposition = state
            if proposed_outcomes and len(outcome_signature(proposed_outcomes)) == len(set(outcome_signature(proposed_outcomes))):
                disposition = "source_backed_unique_candidate"
                if outcome_signature(current_outcomes) != outcome_signature(proposed_outcomes):
                    field_changes.append({"field": "skills_learned", "before": copy.deepcopy(current_outcomes), "after": proposed_outcomes})
                counters["repeated_outcome_auto_repair_candidates"] += 1
            elif state == "source_backed_unique_candidate":
                disposition = "source_context_confirmed_detail_absent"
            counters[f"repeated:{disposition}"] += 1
            repeated_candidates.append({
                "source_file": row["source_file"], "programme": row["programme"], "code": row["code"],
                "title": course.get("title"), "repeated_values": duplicates,
                "disposition": disposition, "source_page": candidate.get("extracted_page_ordinal") if candidate else None,
            })

        # Add provenance only when a source-backed repair is actually written.
        if field_changes:
            page = candidate.get("extracted_page_ordinal") if candidate else None
            if not course.get("source_state"):
                field_changes.append({"field": "source_state", "before": None, "after": "source_reconciled"})
            if not course.get("source_locator"):
                locator = f"Original CCMAS PDF package section: {row['programme']}; course code {row['code']}"
                field_changes.append({"field": "source_locator", "before": None, "after": locator})
            change = {
                "source_file": row["source_file"], "programme": row["programme"], "code": row["code"],
                "title": course.get("title"), "source_page": page,
                "official_source": "Original CCMAS PDF extracted and reconciled locally",
                "fields": field_changes,
                "preimage": source_before,
                "guard": "unique bounded PDF candidate; only blank/placeholder or repeated fields changed",
            }
            changes.append(change)
            if args.apply:
                for item in field_changes:
                    course[item["field"]] = copy.deepcopy(item["after"])
                pending_files.add(row["source_path"])

    duplicate_groups = []
    for row_key, members in sorted(groups.items()):
        if len(members) < 2:
            continue
        duplicate_groups.append({
            "source_file": row_key[0], "programme": row_key[1], "code": row_key[2],
            "row_count": len(members),
            "records": [
                {"title": member["course"].get("title"), "units": member["course"].get("units"),
                 "lh": member["course"].get("lh"), "ph": member["course"].get("ph"),
                 "has_summary": not blank_or_placeholder(member["course"].get("content_summary")),
                 "has_outcomes": not blank_or_placeholder(member["course"].get("skills_learned"))}
                for member in members
            ],
            "disposition": "source_preserved_distinct_records",
            "reason": "same code is not enough to merge package-specific records; exact duplicate rows were handled by the prior dedupe pass",
        })
    counters["duplicate_code_groups_source_preserved"] = len(duplicate_groups)

    if args.apply:
        for path in sorted(pending_files):
            path.write_text(json.dumps(documents[path], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    output = {
        "schema": "2026-09-30.ccmas-exhaustive-source-repair.v1",
        "generated_on": date.today().isoformat(),
        "status": "applied" if args.apply else "dry_run",
        "scope": {"source_files": len(documents), "course_rows": len(rows), "reconciliation": str(args.reconciliation.relative_to(ROOT) if args.reconciliation.is_relative_to(ROOT) else args.reconciliation)},
        "counts": dict(counters),
        "summary_candidates": summary_candidates,
        "outcome_candidates": outcome_candidates,
        "repeated_outcome_candidates": repeated_candidates,
        "duplicate_code_groups": duplicate_groups,
        "changes": changes,
        "limits": [
            "A missing source block is not replaced with invented content.",
            "A duplicate course code is retained when the source records are distinct.",
            "The ledger is exhaustive over the current CCMAS JSON rows; it does not perform downstream domain remapping.",
        ],
    }
    suffix = "_applied" if args.apply else "_dry_run"
    out_json = OUT_PREFIX.with_name(OUT_PREFIX.name + suffix + ".json")
    out_md = OUT_PREFIX.with_name(OUT_PREFIX.name + suffix + ".md")
    out_json.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md = [
        "# Exhaustive CCMAS source repair ledger — 2026-09-30", "", f"Status: `{output['status']}`", "",
        "## Counts", "",
    ]
    md.extend(f"- **{name.replace('_', ' ')}:** {value}" for name, value in sorted(counters.items()))
    md += ["", "Every blank/placeholder summary, empty outcome, repeated outcome, and duplicate-code group is included in the JSON ledger.", ""]
    out_md.write_text("\n".join(md), encoding="utf-8")
    print(json.dumps({"json": str(out_json), "markdown": str(out_md), "status": output["status"], "counts": dict(counters), "changes": len(changes)}, indent=2))


if __name__ == "__main__":
    main()
