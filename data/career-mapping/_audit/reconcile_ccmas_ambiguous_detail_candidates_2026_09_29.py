"""Deterministically reconcile repeated/ambiguous CCMAS PDF detail candidates.

The earlier guarded repair pass handled one exact structured candidate. This
pass handles the remaining extracted queue without an agent by:

* collapsing dominated repeated PDF blocks;
* scoring the surviving blocks against the current CCMAS record;
* requiring a unique evidence margin, exact workload and a source preimage;
* applying only source-backed descriptive fields when ``--apply`` is given;
* propagating the same verified fields to selected JAMB course snapshots.

It never changes JAMB component selection or domain links. Low-margin,
missing-source and context-conflicted records remain in the residual queue.
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

from run_jamb_ccmas_deterministic_discovery_2026_09_28 import CCMAS_SOURCE_URLS


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
DETAILS = AUDIT / "jamb_ccmas_course_detail_candidates_2026-09-29.json"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
OUT_BASE = AUDIT / "ccmas_ambiguous_detail_reconciliation_2026-09-29"

FIELDS = ("title", "units", "status", "lecture_hours", "practical_hours", "content_summary", "learning_outcomes")
WORKLOAD_FIELDS = ("units", "status", "lecture_hours", "practical_hours")


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().casefold()


def tokens(value: Any) -> set[str]:
    return {token for token in re.findall(r"[a-z0-9]+", text(value)) if len(token) > 1}


def code_key(value: Any) -> str:
    """Normalize PDF punctuation without conflating different course codes."""
    return re.sub(r"[^a-z0-9]", "", str(value or "").casefold())


def overlap(left: Any, right: Any) -> float:
    left_tokens = tokens(left)
    right_tokens = tokens(right)
    if not left_tokens or not right_tokens:
        return 0.0
    intersection = len(left_tokens & right_tokens)
    union = len(left_tokens | right_tokens)
    containment = intersection / min(len(left_tokens), len(right_tokens))
    return max(intersection / union, containment)


def title_match(expected: Any, candidate: Any) -> tuple[float, bool]:
    if len(str(candidate or "")) > 180 or re.search(r"learning outcomes|course contents", str(candidate or ""), re.I):
        return 0.0, False
    expected_tokens = tokens(expected)
    candidate_tokens = tokens(candidate)
    if not expected_tokens or not candidate_tokens:
        return 0.0, False
    score = overlap(expected, candidate)
    return score, expected_tokens.issubset(candidate_tokens) or score >= 0.90


def parse_outcomes(value: str | None) -> list[str]:
    if not value:
        return []
    matches = list(re.finditer(r"(?:^|\s)(\d+)\.\s*", value))
    if not matches:
        return []
    result: list[str] = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(value)
        item = re.sub(r"\s+", " ", value[match.end() : end]).strip(" ;,\n")
        if item:
            result.append(item)
    return result


def candidate_text(candidate: dict[str, Any], field: str) -> str:
    if field == "learning_outcomes":
        return " ".join(parse_outcomes(candidate.get("outcomes_text")))
    if field == "content_summary":
        return candidate.get("content_text") or ""
    return candidate.get(field) or ""


def workload_matches(source: dict[str, Any], candidate: dict[str, Any]) -> tuple[int, int, bool]:
    workload = candidate.get("workload") or {}
    matched = 0
    expected = 0
    for field in WORKLOAD_FIELDS:
        source_value = source.get(field)
        if source_value is None:
            continue
        expected += 1
        candidate_field = "lecture_hours" if field == "lecture_hours" else "practical_hours" if field == "practical_hours" else field
        if text(source_value) == text(workload.get(candidate_field)):
            matched += 1
    return matched, expected, expected > 0 and matched == expected


def candidate_signature(candidate: dict[str, Any]) -> tuple[str, str, str, str, str]:
    workload = candidate.get("workload") or {}
    return (
        text(candidate.get("title_candidate")),
        text(workload.get("units")),
        text(workload.get("status")),
        text(workload.get("lecture_hours")),
        text(workload.get("practical_hours")),
    )


def programme_page_ranges(source_file: str) -> dict[str, tuple[int, int]]:
    """Infer bounded CCMAS programme sections from explicit B.Sc. overview headings."""
    source_path = ROOT / "ccmas" / source_file
    package = load(source_path)
    text_candidates = [
        AUDIT / "ccmas_source_text_2026-09-29" / f"{Path(source_file).stem}.txt",
        ROOT / "_pdftxt" / f"{Path(source_file).stem}.txt",
        ROOT / "_ccmas_txt" / f"{Path(source_file).stem}.txt",
    ]
    # The communication PDF is stored under its source shorthand ``comm``.
    if source_file == "communication_media.json":
        text_candidates.append(ROOT / "_ccmas_txt" / "comm.txt")
    text_path = next((path for path in text_candidates if path.exists()), None)
    if not text_path:
        return {}
    pages = text_path.read_text(encoding="utf-8", errors="replace").split("\f")
    headings: list[tuple[int, str]] = []
    for ordinal, page in enumerate(pages, 1):
        flattened = " ".join(page.split())
        for match in re.finditer(
            r"(?:(?:B\.?\s*(?:Sc|A|Eng|Tech)\.?|LL\.?\s*B\.?)\s+"
            r"(?P<title>.{3,120}?)\s+Overview\b)",
            flattened,
            re.I,
        ):
            headings.append((ordinal, match.group("title")))
    starts: list[tuple[int, str]] = []
    for programme in package.get("programmes", []):
        expected = tokens(programme.get("name"))
        matches = [
            (len(expected & tokens(title)) / len(expected), page, title)
            for page, title in headings
            if expected and len(expected & tokens(title)) / len(expected) >= 0.80
        ]
        # The law PDF labels the standalone programme simply as ``LL. B
        # Degree`` rather than repeating the catalogue name ``Law``.
        if not matches and source_file == "law.json" and programme == "Law":
            matches = [(1.0, page, title) for page, title in headings if tokens(title) == {"degree"}]
        if matches:
            _, page, _ = max(matches)
            starts.append((page, programme["name"]))
    starts.sort()
    return {
        name: (start, starts[index + 1][0] - 1 if index + 1 < len(starts) else len(pages))
        for index, (start, name) in enumerate(starts)
    }


def restrict_to_programme_context(record: dict[str, Any], candidates: list[dict[str, Any]], ranges: dict[str, dict[str, tuple[int, int]]]) -> tuple[list[dict[str, Any]], str]:
    source_file, programme = record["source_key"].split("::", 1)
    bounds = ranges.get(source_file, {}).get(programme)
    if not bounds:
        return candidates, "programme_page_range_unavailable"
    scoped = [
        candidate
        for candidate in candidates
        if bounds[0] <= int(candidate.get("extracted_page_ordinal") or -1) <= bounds[1]
    ]
    return scoped, "programme_page_range_match" if scoped else "programme_range_has_no_course_candidate"


def dominates(left: dict[str, Any], right: dict[str, Any]) -> bool:
    """Return whether left is the same block with strictly more extracted text."""
    if candidate_signature(left) != candidate_signature(right):
        return False
    left_outcomes = tokens(left.get("outcomes_text"))
    right_outcomes = tokens(right.get("outcomes_text"))
    left_content = tokens(left.get("content_text"))
    right_content = tokens(right.get("content_text"))
    outcome_superset = not right_outcomes or right_outcomes.issubset(left_outcomes)
    content_superset = not right_content or right_content.issubset(left_content)
    strictly_more = len(left_outcomes) > len(right_outcomes) or len(left_content) > len(right_content)
    return outcome_superset and content_superset and strictly_more


def non_dominated(candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    for candidate in candidates:
        if any(dominates(other, candidate) for other in candidates if other is not candidate):
            continue
        result.append(candidate)
    return result


def near_equivalent(left: dict[str, Any], right: dict[str, Any]) -> bool:
    """Identify repeated or truncated copies of the same PDF course block."""
    if candidate_signature(left) != candidate_signature(right):
        return False
    left_content = tokens(left.get("content_text"))
    right_content = tokens(right.get("content_text"))
    left_outcomes = tokens(left.get("outcomes_text"))
    right_outcomes = tokens(right.get("outcomes_text"))
    if left_content and right_content and overlap(left.get("content_text"), right.get("content_text")) < 0.82:
        return False
    if left_outcomes and right_outcomes and overlap(left.get("outcomes_text"), right.get("outcomes_text")) < 0.78:
        return False
    return bool((left_content and right_content) or (left_outcomes and right_outcomes))


def collapse_near_equivalent(candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Keep the fullest representative of each repeated near-equivalent block."""
    groups: list[list[dict[str, Any]]] = []
    for candidate in candidates:
        for group in groups:
            if near_equivalent(candidate, group[0]):
                group.append(candidate)
                break
        else:
            groups.append([candidate])
    return [
        max(group, key=lambda item: len(tokens(item.get("content_text"))) + 2 * len(tokens(item.get("outcomes_text"))))
        for group in groups
    ]


def rank_candidate(record: dict[str, Any], candidate: dict[str, Any]) -> dict[str, Any]:
    source = record.get("source_snapshot") or {}
    selected = record.get("selected_snapshot") or {}
    title_score, title_strong = title_match(source.get("title"), candidate.get("title_candidate"))
    workload_matched, workload_expected, workload_complete = workload_matches(source, candidate)
    candidate_outcomes = candidate_text(candidate, "learning_outcomes")
    candidate_content = candidate_text(candidate, "content_summary")
    source_content = source.get("content_summary") or ""
    selected_outcomes = " ".join(selected.get("learning_outcomes") or [])
    source_outcomes = " ".join(source.get("learning_outcomes") or [])
    content_score = overlap(candidate_content, source_content)
    outcome_score = max(overlap(candidate_outcomes, source_outcomes), overlap(candidate_outcomes, selected_outcomes))
    exact_fields = int(title_strong) + workload_matched
    completeness = int(bool(candidate_outcomes)) + int(bool(candidate_content))
    score = exact_fields + content_score + outcome_score * 0.5 + completeness * 0.1
    return {
        "candidate": candidate,
        "course_code_exact": code_key(candidate.get("course_code")) == code_key(record.get("course_code")),
        "candidate_workload_complete": bool(
            candidate.get("workload", {}).get("units") is not None
            and (candidate.get("workload", {}).get("status") or source.get("status"))
            and (
                candidate.get("workload", {}).get("lecture_hours") is not None
                or candidate.get("workload", {}).get("practical_hours") is not None
            )
        ),
        "title_score": round(title_score, 6),
        "title_strong": title_strong,
        "workload_matched": workload_matched,
        "workload_expected": workload_expected,
        "workload_complete": workload_complete,
        "content_score": round(content_score, 6),
        "outcome_score": round(outcome_score, 6),
        "exact_fields": exact_fields,
        "completeness": completeness,
        "score": round(score, 6),
    }


def build_proposal(record: dict[str, Any], ranges: dict[str, dict[str, tuple[int, int]]]) -> dict[str, Any]:
    details = record.get("automated_detail_candidates") or {}
    all_candidates = list(details.get("candidates") or [])
    candidates, context_state = restrict_to_programme_context(record, all_candidates, ranges)
    if context_state == "programme_range_has_no_course_candidate":
        candidates = all_candidates
    non_dominated_candidates = non_dominated(candidates)
    reduced = collapse_near_equivalent(non_dominated_candidates)
    ranked = sorted((rank_candidate(record, item) for item in reduced), key=lambda item: item["score"], reverse=True)
    top = ranked[0] if ranked else None
    second = ranked[1] if len(ranked) > 1 else None
    margin = top["score"] - second["score"] if top and second else top["score"] if top else 0.0
    candidate = top["candidate"] if top else None
    source = record.get("source_snapshot") or {}
    required_source_content = bool(source.get("content_summary"))
    source_evidence = bool(candidate and (top["content_score"] >= 0.45 or top["outcome_score"] >= 0.70)) if top else False
    bounded_unique_course_evidence = bool(
        top
        and context_state == "programme_page_range_match"
        and len(ranked) == 1
        and top["title_score"] >= 0.65
        and top["workload_complete"]
        and candidate_text(candidate, "learning_outcomes")
    )
    # If the official PDF gives a unique, bounded detail block for the exact
    # course code, that code-level evidence can correct a stale/wrong local
    # title. This is intentionally separate from title similarity: it is the
    # repair path for real identity mismatches such as a course being shifted
    # to the neighbouring title in the local extraction.
    bounded_unique_official_code_evidence = bool(
        top
        and context_state == "programme_page_range_match"
        and len(ranked) == 1
        and top.get("course_code_exact")
        and top.get("candidate_workload_complete")
        and candidate_text(candidate, "learning_outcomes")
    )
    source_wide_unique_evidence = bool(
        top
        and len(all_candidates) == 1
        and top["title_score"] >= 0.65
        and top["workload_complete"]
        and candidate_text(candidate, "learning_outcomes")
        and source_evidence
    )
    eligible = bool(
        top
        and (
            top["title_strong"]
            or bounded_unique_course_evidence
            or bounded_unique_official_code_evidence
            or source_wide_unique_evidence
        )
        and top["workload_complete"]
        and candidate_text(candidate, "learning_outcomes")
        and (
            (
                context_state == "programme_page_range_match"
                and source_evidence
                and margin >= 0.25
                and (len(ranked) == 1 or top["exact_fields"] > (second or {}).get("exact_fields", 0) or margin >= 0.50)
            )
            or bounded_unique_course_evidence
            or bounded_unique_official_code_evidence
            or source_wide_unique_evidence
        )
    )
    if eligible:
        state = "auto_verified_unique_context_candidate"
    elif top and len(ranked) == 1 and top["title_strong"] and top["workload_complete"] and candidate_text(candidate, "learning_outcomes"):
        state = "single_candidate_evidence_review"
    elif ranked:
        state = "residual_context_conflict"
    else:
        state = "no_usable_candidate"
    return {
        "state": state,
        "raw_candidate_count": len(candidates),
        "extracted_candidate_count": len(all_candidates),
        "programme_context_state": context_state,
        "non_dominated_candidate_count": len(reduced),
        "near_equivalent_collapsed_count": max(0, len(non_dominated_candidates) - len(reduced)),
        "ranked_candidates": ranked[:5],
        "selected_candidate": candidate if eligible else None,
        "top_score_margin": round(margin, 6),
        "source_content_present": required_source_content,
        "bounded_unique_course_evidence": bounded_unique_course_evidence,
        "source_wide_unique_evidence": source_wide_unique_evidence,
        "bounded_unique_official_code_evidence": bounded_unique_official_code_evidence,
        "rule": "unique non-dominated official-PDF candidate after near-equivalent repeat collapse, with source-similarity margin, bounded programme-section evidence, exact bounded course-code evidence, or a source-wide unique match",
    }


def apply_change(
    record: dict[str, Any],
    proposal: dict[str, Any],
    packages: dict[str, dict[str, Any]],
    dry_run: bool,
) -> tuple[dict[str, Any] | None, str | None]:
    candidate = proposal.get("selected_candidate")
    if not candidate:
        return None, None
    source_file, programme = record["source_key"].split("::", 1)
    package = packages.get(source_file)
    programmes = [item for item in (package or {}).get("programmes", []) if item.get("name") == programme]
    if len(programmes) != 1:
        return None, "package_context_not_unique"
    courses = [item for item in programmes[0].get("courses", []) if text(item.get("code")) == text(record["course_code"])]
    if len(courses) != 1:
        return None, "course_context_not_unique"
    course = courses[0]
    expected = record.get("source_snapshot") or {}
    workload = candidate.get("workload") or {}
    outcomes = parse_outcomes(candidate.get("outcomes_text"))
    proposed = {
        "title": candidate.get("title_candidate"),
        "units": workload.get("units"),
        "status": workload.get("status"),
        "lh": workload.get("lecture_hours"),
        "ph": workload.get("practical_hours"),
        "content_summary": candidate.get("content_text"),
        "learning_outcomes": outcomes,
    }
    # The extracted/audit vocabulary is normalized, while the canonical CCMAS
    # package uses ``lh``/``ph`` and ``skills_learned``.  Keep the source
    # snapshot field on the right-hand side of each mapping so the preimage
    # guard compares like-for-like without treating a valid row as changed.
    field_map = {
        "title": ("title", "title"),
        "units": ("units", "units"),
        "status": ("status", "status"),
        "lh": ("lecture_hours", "lh"),
        "ph": ("practical_hours", "ph"),
        "content_summary": ("content_summary", "content_summary"),
        "learning_outcomes": ("learning_outcomes", "skills_learned"),
    }
    changes: list[dict[str, Any]] = []
    skipped_preimage: list[str] = []
    for target, (source_field, package_field) in field_map.items():
        after = proposed.get(target)
        if after in (None, "", []):
            continue
        before = copy.deepcopy(course.get(package_field))
        if text(before) == text(after):
            continue
        if text(before) != text(expected.get(source_field)):
            skipped_preimage.append(target)
            continue
        changes.append({"field": package_field, "before": before, "after": copy.deepcopy(after)})
    if skipped_preimage:
        return None, "preimage_changed:" + ",".join(skipped_preimage)
    if not changes:
        return None, "no_change"
    if not dry_run:
        for change in changes:
            course[change["field"]] = change["after"]
    return {
        "source_key": record["source_key"],
        "course_code": record["course_code"],
        "source_file": source_file,
        "programme": programme,
        "official_source_url": CCMAS_SOURCE_URLS.get(source_file),
        "page": candidate.get("extracted_page_ordinal"),
        "fields": changes,
        "guard": "unique non-dominated source candidate plus exact workload/title/evidence margin and per-field preimage",
    }, None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--details", type=Path, default=DETAILS)
    parser.add_argument("--scopes", type=Path, default=SCOPES)
    parser.add_argument("--out-prefix", type=Path, default=OUT_BASE)
    args = parser.parse_args()
    suffix = "_dry_run" if args.dry_run else "_applied"
    out_json = args.out_prefix.with_name(args.out_prefix.name + suffix + ".json")
    out_md = args.out_prefix.with_name(args.out_prefix.name + suffix + ".md")
    details = load(args.details)
    scopes = load(args.scopes)
    packages = {path.name: load(path) for path in sorted((ROOT / "ccmas").glob("*.json"))}
    source_files = {record["source_key"].split("::", 1)[0] for record in details["course_record_queue"]}
    programme_ranges = {source_file: programme_page_ranges(source_file) for source_file in source_files}
    proposals: list[dict[str, Any]] = []
    changes: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    counters = Counter(records_seen=len(details["course_record_queue"]))
    pending_files: set[str] = set()
    for record in details["course_record_queue"]:
        proposal = build_proposal(record, programme_ranges)
        proposal_record = {"source_key": record["source_key"], "course_code": record["course_code"], **proposal}
        proposals.append(proposal_record)
        counters[f"state:{proposal['state']}"] += 1
        if proposal["selected_candidate"]:
            counters["auto_verified_candidates"] += 1
            change, reason = apply_change(record, proposal, packages, args.dry_run)
            if change:
                changes.append(change)
                counters["source_records_changed"] += 1
                counters["source_field_changes"] += len(change["fields"])
                pending_files.add(change["source_file"])
            elif reason:
                counters[f"skipped:{reason.split(':', 1)[0]}"] += 1
                skipped.append({"source_key": record["source_key"], "course_code": record["course_code"], "reason": reason})

    # A source candidate remains verified even when the CCMAS package already
    # contained the corrected fields. Propagate every guarded verification to
    # dependent JAMB scope rows; limiting this set to ``changes`` left stale
    # selected outcomes behind on later reruns.
    verified = {
        (item["source_key"], " ".join(item["course_code"].upper().split()))
        for item in proposals
        if item.get("selected_candidate")
    }
    scope_changes: list[dict[str, Any]] = []
    ccmas_by_key = {f"{path}::{programme.get('name')}": programme for path, doc in packages.items() for programme in doc.get("programmes", [])}
    for row in scopes.get("rows", []):
        for selected in row.get("selected_courses", []):
            source_file = selected.get("source_ccmas_file")
            programme = selected.get("source_ccmas_programme")
            code = " ".join(str(selected.get("code") or "").upper().split())
            key = (f"{source_file}::{programme}", code)
            if key not in verified:
                continue
            source_programme = ccmas_by_key.get(key[0])
            source_course = next((course for course in (source_programme or {}).get("courses", []) if " ".join(str(course.get("code") or "").upper().split()) == code), None)
            if not source_course:
                counters["scope_source_course_missing"] += 1
                continue
            field_map = {
                "title": "title",
                "units": "units",
                "status": "status",
                "lecture_hours": "lh",
                "practical_hours": "ph",
                "content_summary": "content_summary",
                "learning_outcomes": "skills_learned",
            }
            fields: list[dict[str, Any]] = []
            for field, source_field in field_map.items():
                before = copy.deepcopy(selected.get(field))
                after = copy.deepcopy(source_course.get(source_field))
                # A source candidate may prove that a field is not present in
                # the current extracted package.  That is not evidence that a
                # previously populated selected snapshot should be erased.
                # Empty outcomes/content remain a residual for source review;
                # only substantive source values may be propagated.
                if field in {"learning_outcomes", "content_summary"} and not after:
                    continue
                if text(before) == text(after):
                    continue
                fields.append({"field": field, "before": before, "after": after})
                if not args.dry_run:
                    selected[field] = after
            if fields:
                counters["selected_scope_records_changed"] += 1
                counters["selected_scope_field_changes"] += len(fields)
                scope_changes.append({"jamb_name": row.get("jamb_name"), "source_key": key[0], "course_code": code, "fields": fields})

    if not args.dry_run:
        for source_file in pending_files:
            path = ROOT / "ccmas" / source_file
            path.write_text(json.dumps(packages[source_file], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        SCOPES.write_text(json.dumps(scopes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = {
        "schema": "2026-09-29.ccmas-ambiguous-detail-reconciliation.v1",
        "generated_on": date.today().isoformat(),
        "status": "dry_run_ready" if args.dry_run else "applied",
        "dry_run": args.dry_run,
        "counts": dict(counters),
        "proposals": proposals,
        "source_changes": changes,
        "scope_changes": scope_changes,
        "skipped": skipped,
        "limits": [
            "This pass repairs descriptive CCMAS course fields and selected JAMB snapshots only.",
            "It does not decide combined JAMB component scope, domain links, or direct/functional/adjacent labels.",
            "Low-margin, missing-source and context-conflicted candidates remain for later targeted review.",
        ],
    }
    out_json.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# CCMAS ambiguous-detail reconciliation — 2026-09-29", "", f"Status: `{report['status']}`", "", "## Counts", ""]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in report["counts"].items())
    lines += ["", "Only unique, source-backed, high-margin candidates were applied. Remaining proposals are retained in the JSON ledger for the next deterministic pass.", ""]
    out_md.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(out_json), "markdown": str(out_md), "status": report["status"], "counts": report["counts"]}, indent=2))


if __name__ == "__main__":
    main()
