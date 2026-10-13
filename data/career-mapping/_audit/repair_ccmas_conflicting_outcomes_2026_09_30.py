"""Repair only uniquely source-backed outcomes in the CCMAS conflict queue.

This pass is deliberately narrower than the general CCMAS reconciler.  It
targets the rows that the current source-reconciliation report classifies as
``multiple_or_conflicting_source_contexts`` *for empty outcomes only*.

The source candidate ledger was extracted from the original CCMAS PDFs.  A
candidate is eligible only when the ledger proves all of the following:

* the candidate is in the exact CCMAS programme section;
* the course code is exact;
* the candidate title is a bounded match for the current course title;
* exactly one candidate has substantive learning outcomes; and
* parsing those outcomes produces at least one item.

The pass changes only ``skills_learned`` in CCMAS package JSON.  It does not
edit JAMB scopes, selected snapshots, downstream mappings, UI, SQL, or role
data.  Rows with no source-authored outcomes remain explicitly classified as
``source_authored_absence``; ambiguous or unbounded rows remain in the
append-only ledger for later review.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from run_jamb_ccmas_deterministic_discovery_2026_09_28 import CCMAS_SOURCE_URLS


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
PACKAGE_DIR = ROOT / "ccmas"
REPORT = AUDIT / "ccmas_source_reconciliation_report_2026-09-29.json"
# Use the latest applied original-PDF reconciliation ledger.  Its ranked
# candidates are evidence only; this pass applies its own narrower guard.
RECONCILIATION = AUDIT / "ccmas_full_detail_reconciliation_original_2026-09-29-pass5_applied.json"
LEDGER = AUDIT / "ccmas_conflicting_outcome_repairs_2026-09-30.jsonl"
OUT_BASE = AUDIT / "ccmas_conflicting_outcome_repair_checkpoint_2026-09-30"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def normalise(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").casefold())


def tokens(value: Any) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", str(value or "").casefold()))


def normalise_code(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").casefold())


def title_is_bounded_match(local_title: Any, candidate_title: Any) -> bool:
    """Reject parser spill while allowing harmless source title extensions."""

    candidate = str(candidate_title or "").strip()
    if not candidate or len(candidate) > 120:
        return False
    # A PDF parser spill can still be shorter than the length limit when it
    # starts at a continuation line.  Course-code headings and clause-heavy
    # text are strong signs that the value contains the next course block.
    if re.search(r"\b[A-Z]{2,5}\s*\d{3}\b", candidate) or candidate.count(";") > 1:
        return False
    left = tokens(local_title)
    right = tokens(candidate)
    if not left or not right:
        return False
    intersection = len(left & right)
    return left.issubset(right) or right.issubset(left) or intersection / max(len(left), len(right)) >= 0.9


def parse_outcomes(value: Any) -> list[str]:
    text = str(value or "")
    if not text:
        return []
    matches = list(re.finditer(r"(?:^|\s)(\d+)\.\s*", text))
    if not matches:
        return []
    outcomes: list[str] = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        item = re.sub(r"\s+", " ", text[match.end() : end]).strip(" ;,\n")
        if item:
            outcomes.append(item)
    return outcomes


def row_key(source_file: str, programme: str, code: str) -> tuple[str, str, str]:
    return (source_file, programme, " ".join(str(code or "").upper().split()))


def candidate_lists(row: dict[str, Any], proposal: dict[str, Any]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Return outcome-bearing and source-authored-empty candidates."""

    ranked = proposal.get("ranked_candidates") or []
    outcome_candidates = [
        item
        for item in ranked
        if item.get("candidate", {}).get("outcomes_text")
        and item.get("course_code_exact")
    ]
    bounded_empty = [
        item
        for item in ranked
        if not item.get("candidate", {}).get("outcomes_text")
        and item.get("course_code_exact")
        and proposal.get("programme_context_state") == "programme_page_range_match"
        and title_is_bounded_match(row.get("title"), item.get("candidate", {}).get("title_candidate"))
    ]
    return outcome_candidates, bounded_empty


def classify_row(row: dict[str, Any], proposal: dict[str, Any]) -> tuple[str, dict[str, Any] | None, str]:
    outcome_candidates, empty_candidates = candidate_lists(row, proposal)
    eligible = [
        item
        for item in outcome_candidates
        if proposal.get("programme_context_state") == "programme_page_range_match"
        and title_is_bounded_match(row.get("title"), item.get("candidate", {}).get("title_candidate"))
        and parse_outcomes(item.get("candidate", {}).get("outcomes_text"))
    ]
    if len(eligible) == 1:
        return "repairable_unique_candidate", eligible[0], "one exact-code, bounded programme-section candidate with parseable outcomes"
    if not outcome_candidates and len(empty_candidates) == 1:
        return "source_authored_absence", None, "one bounded exact-code source block contains no extracted learning-outcomes section"
    if len(outcome_candidates) >= 2:
        return "true_source_conflict", None, "multiple exact-code outcome-bearing candidates remain"
    return "unresolved_context_or_extraction", None, "candidate is not uniquely bounded and source-backed under the repair guard"


def package_course(packages: dict[str, dict[str, Any]], source_file: str, programme: str, code: str) -> dict[str, Any] | None:
    package = packages.get(source_file)
    matches = [
        course
        for item in (package or {}).get("programmes", [])
        if item.get("name") == programme
        for course in item.get("courses", [])
        if " ".join(str(course.get("code") or "").upper().split()) == code
    ]
    return matches[0] if len(matches) == 1 else None


def event_id(source_file: str, programme: str, code: str, after: list[str]) -> str:
    payload = json.dumps([source_file, programme, code, after], ensure_ascii=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:24]


def read_existing_event_ids() -> set[str]:
    if not LEDGER.exists():
        return set()
    ids: set[str] = set()
    for line in LEDGER.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError:
            continue
        if value.get("event_id"):
            ids.add(value["event_id"])
    return ids


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply only guarded outcome repairs; default is a dry run.")
    args = parser.parse_args()

    report = load(REPORT)
    reconciliation = load(RECONCILIATION)
    packages = {path.name: load(path) for path in sorted(PACKAGE_DIR.glob("*.json"))}
    proposals = {
        row_key(*row["source_key"].split("::", 1), row["course_code"]): row
        for row in reconciliation.get("proposals", [])
    }
    target_rows = [
        row
        for row in report.get("course_rows", [])
        if row.get("outcomes_empty") and row.get("outcomes_source_class") == "multiple_or_conflicting_source_contexts"
    ]
    before = Counter()
    classifications: list[dict[str, Any]] = []
    repairs: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    existing_ids = read_existing_event_ids()

    for row in target_rows:
        key = row_key(row["source_file"], row["programme"], row["code"])
        proposal = proposals.get(key)
        if not proposal:
            classification, candidate, reason = "unresolved_context_or_extraction", None, "no matching reconciliation-ledger proposal"
        else:
            classification, candidate, reason = classify_row(row, proposal)
        before[classification] += 1
        item: dict[str, Any] = {
            "source_file": row["source_file"],
            "programme": row["programme"],
            "course_code": row["code"],
            "title": row.get("title"),
            "classification": classification,
            "reason": reason,
        }
        if candidate:
            candidate_data = candidate.get("candidate") or {}
            outcomes = parse_outcomes(candidate_data.get("outcomes_text"))
            course = package_course(packages, row["source_file"], row["programme"], row["code"])
            if course is None:
                item["classification"] = "unresolved_context_or_extraction"
                item["reason"] = "package/course preimage is not unique"
                before[classification] -= 1
                before[item["classification"]] += 1
                skipped.append(item)
                classifications.append(item)
                continue
            if course.get("skills_learned"):
                item["classification"] = "already_repaired_or_nonempty"
                item["reason"] = "current CCMAS row is no longer empty; no overwrite performed"
                before[classification] -= 1
                before[item["classification"]] += 1
                skipped.append(item)
                classifications.append(item)
                continue
            item.update(
                {
                    "source_pdf": str((AUDIT / "ccmas_original_source_text_2026-09-29" / f"{Path(row['source_file']).stem}.txt").relative_to(ROOT)),
                    "official_source_url": CCMAS_SOURCE_URLS.get(row["source_file"]),
                    "source_page": candidate_data.get("extracted_page_ordinal"),
                    "source_block_excerpt": candidate_data.get("block_excerpt"),
                    "before": [],
                    "after": outcomes,
                }
            )
            if not outcomes:
                item["classification"] = "unresolved_context_or_extraction"
                item["reason"] = "candidate outcomes did not parse into numbered items"
                before[classification] -= 1
                before[item["classification"]] += 1
                skipped.append(item)
            else:
                item["event_id"] = event_id(row["source_file"], row["programme"], row["code"], outcomes)
                item["status"] = "already_logged" if item["event_id"] in existing_ids else "pending_apply"
                repairs.append(item)
        classifications.append(item)

    applied: list[dict[str, Any]] = []
    if args.apply:
        touched: set[str] = set()
        with LEDGER.open("a", encoding="utf-8") as ledger:
            for item in repairs:
                if item["event_id"] in existing_ids:
                    continue
                course = package_course(packages, item["source_file"], item["programme"], item["course_code"])
                if course is None or course.get("skills_learned"):
                    item["status"] = "skipped_preimage_changed"
                    continue
                course["skills_learned"] = item["after"]
                touched.add(item["source_file"])
                event = {
                    "schema": "2026-09-30.ccmas-conflicting-outcome-repair.v1",
                    "event_id": item["event_id"],
                    "applied_on": date.today().isoformat(),
                    "source_file": item["source_file"],
                    "programme": item["programme"],
                    "course_code": item["course_code"],
                    "field": "skills_learned",
                    "before": item["before"],
                    "after": item["after"],
                    "source_pdf": item["source_pdf"],
                    "official_source_url": item["official_source_url"],
                    "source_page": item["source_page"],
                    "source_block_excerpt": item["source_block_excerpt"],
                    "guard": "exact code + bounded programme section + unique parseable outcome candidate + empty preimage",
                }
                ledger.write(json.dumps(event, ensure_ascii=False) + "\n")
                applied.append(event)
        for source_file in touched:
            (PACKAGE_DIR / source_file).write_text(json.dumps(packages[source_file], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    counts = {
        "target_rows_before": len(target_rows),
        "classification_before": dict(sorted(before.items())),
        "repair_candidates": len(repairs),
        "repairs_applied": len(applied),
        "ledger_events_already_present": sum(item.get("status") == "already_logged" for item in repairs),
        "repairs_skipped_after_preimage_check": sum(item.get("status") == "skipped_preimage_changed" for item in repairs),
    }
    result = {
        "schema": "2026-09-30.ccmas-conflicting-outcome-repair-checkpoint.v1",
        "generated_on": date.today().isoformat(),
        "status": "applied" if args.apply else "dry_run",
        "scope": {
            "report": str(REPORT.relative_to(ROOT)),
            "reconciliation_ledger": str(RECONCILIATION.relative_to(ROOT)),
            "target": "empty CCMAS outcomes classified as multiple_or_conflicting_source_contexts",
            "target_rows": len(target_rows),
            "excluded": ["JAMB scopes", "downstream mappings", "UI", "SQL", "roles"],
        },
        "counts": counts,
        "classification_contract": {
            "repairable_unique_candidate": "Exactly one bounded exact-code PDF candidate supplies parseable outcomes; eligible for guarded repair.",
            "source_authored_absence": "One bounded exact-code PDF block is present but supplies no extracted learning-outcomes section; no text is invented.",
            "true_source_conflict": "At least two exact-code outcome-bearing candidates remain; no automatic choice is made.",
            "unresolved_context_or_extraction": "The source context or extraction is not strong enough for a safe repair.",
        },
        "classifications": classifications,
        "applied_events": applied,
    }
    suffix = "_applied" if args.apply else "_dry_run"
    json_path = OUT_BASE.with_name(OUT_BASE.name + suffix + ".json")
    md_path = OUT_BASE.with_name(OUT_BASE.name + suffix + ".md")
    json_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md_lines = [
        "# CCMAS conflicting-outcome repair checkpoint — 2026-09-30",
        "",
        f"Status: **{result['status']}**",
        "",
        "This pass is limited to the 141 empty-outcome rows classified as multiple/conflicting source contexts.",
        "",
        "## Exact counts",
        "",
    ]
    md_lines.extend(f"- `{key}`: **{value}**" for key, value in counts.items() if key != "classification_before")
    md_lines.append("")
    md_lines.extend(f"- classification `{key}` before apply: **{value}**" for key, value in sorted(before.items()))
    md_lines += [
        "",
        "Only `repairable_unique_candidate` rows can change CCMAS JSON. Source-authored absences and unresolved/conflicting rows are retained in the JSON and JSONL ledgers; no JAMB or downstream data is changed.",
        "",
    ]
    md_path.write_text("\n".join(md_lines), encoding="utf-8")
    print(json.dumps({"json": str(json_path), "markdown": str(md_path), "ledger": str(LEDGER), "counts": counts}, indent=2))


if __name__ == "__main__":
    main()
