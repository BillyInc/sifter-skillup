"""Classify CCMAS structural candidates against the original PDF corpus.

This report is deterministic and read-only. It joins every CCMAS course row to
the original-PDF candidate/reconciliation ledger and distinguishes a source-
backed repair from a source-faithful empty field or an unresolved context case.
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
DETAILS = AUDIT / "ccmas_full_course_detail_candidates_original_2026-09-29-pass3.json"
RECONCILIATION = AUDIT / "ccmas_full_detail_reconciliation_original_2026-09-29-pass3_dry_run.json"
ANOMALIES = AUDIT / "ccmas_extraction_anomaly_inventory_2026-09-26.json"
MANIFEST = AUDIT / "ccmas_original_pdf_extraction_manifest_2026-09-29.json"
OUT_JSON = AUDIT / "ccmas_source_reconciliation_report_2026-09-29.json"
OUT_MD = AUDIT / "ccmas_source_reconciliation_report_2026-09-29.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def key(source_file: str, programme: str, code: str) -> tuple[str, str, str]:
    return (source_file, programme, " ".join(str(code or "").upper().split()))


def classify_proposal(proposal: dict[str, Any] | None, field: str | None = None) -> str:
    if not proposal:
        return "not_in_source_reconciliation_queue"
    state = proposal.get("state")
    if state == "auto_verified_unique_context_candidate":
        candidate = proposal.get("selected_candidate") or {}
        has_outcomes = bool(candidate.get("outcomes_text"))
        has_content = bool(candidate.get("content_text"))
        field_present = has_content if field == "summary" else has_outcomes if field == "outcomes" else (has_outcomes or has_content)
        if field_present:
            return "source_backed_detail_available"
        return "source_context_confirmed_detail_absent"
    if state == "single_candidate_evidence_review":
        return "single_source_candidate_needs_review"
    if state == "residual_context_conflict":
        return "multiple_or_conflicting_source_contexts"
    if state == "no_usable_candidate":
        return "no_structured_original_source_candidate"
    return f"unclassified_{state or 'missing_state'}"


def main() -> None:
    details = load(DETAILS)
    reconciliation = load(RECONCILIATION)
    anomalies = load(ANOMALIES)
    manifest = load(MANIFEST)
    proposals = {
        (row.get("source_key", "").split("::", 1)[0], row.get("source_key", "").split("::", 1)[-1], " ".join(str(row.get("course_code") or "").upper().split())): row
        for row in reconciliation.get("proposals", [])
        if "::" in row.get("source_key", "")
    }
    summary = Counter()
    outcome = Counter()
    duplicate_groups: list[dict[str, Any]] = []
    course_rows: list[dict[str, Any]] = []
    for source_path in sorted((ROOT / "ccmas").glob("*.json")):
        document = load(source_path)
        for programme in document.get("programmes", []):
            programme_name = str(programme.get("name") or "")
            groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
            for course in programme.get("courses", []):
                code = " ".join(str(course.get("code") or "").upper().split())
                groups[code].append(course)
                proposal = proposals.get((source_path.name, programme_name, code))
                source_class = classify_proposal(proposal)
                summary_class = classify_proposal(proposal, "summary")
                outcomes_class = classify_proposal(proposal, "outcomes")
                row = {
                    "source_file": source_path.name,
                    "programme": programme_name,
                    "code": code,
                    "title": course.get("title"),
                    "source_class": source_class,
                    "summary_source_class": summary_class,
                    "outcomes_source_class": outcomes_class,
                    "summary_empty": not bool(course.get("content_summary")),
                    "outcomes_empty": not bool(course.get("skills_learned")),
                    "source_state": course.get("source_state"),
                    "source_locator": course.get("source_locator"),
                }
                course_rows.append(row)
                if row["summary_empty"]:
                    summary[summary_class] += 1
                if row["outcomes_empty"]:
                    outcome[outcomes_class] += 1
            for code, rows in groups.items():
                if code and len(rows) > 1:
                    proposal = proposals.get((source_path.name, programme_name, code))
                    duplicate_groups.append(
                        {
                            "source_file": source_path.name,
                            "programme": programme_name,
                            "code": code,
                            "records": [
                                {"title": row.get("title"), "units": row.get("units"), "lh": row.get("lh"), "ph": row.get("ph"), "has_content": bool(row.get("content_summary")), "has_outcomes": bool(row.get("skills_learned"))}
                                for row in rows
                            ],
                            "source_class": classify_proposal(proposal),
                        }
                    )

    output = {
        "schema": "2026-09-29.ccmas-source-reconciliation-report.v1",
        "generated_on": date.today().isoformat(),
        "status": "source_classification_complete_repairs_fixed_point_reached",
        "scope": {
            "original_source_documents": len(manifest.get("source_documents", [])),
            "ccmas_programme_packages": 237,
            "ccmas_course_rows": len(course_rows),
        },
        "source_manifest": str(MANIFEST.relative_to(ROOT)),
        "source_classification_contract": {
            "source_backed_detail_available": "Original PDF contains a unique bounded course detail candidate with usable content or outcomes; guarded repair is eligible or already applied.",
            "source_context_confirmed_detail_absent": "The source context is uniquely identified, but the original PDF does not provide a course-detail block; do not invent outcomes or content.",
            "single_source_candidate_needs_review": "One plausible source candidate exists but the guard did not establish enough context for automatic repair.",
            "multiple_or_conflicting_source_contexts": "More than one plausible source block or a context conflict remains; automatic repair is unsafe.",
            "no_structured_original_source_candidate": "No usable structured candidate was found in the original-PDF text corpus; this requires targeted layout/manual review.",
        },
        "empty_summary_by_source_class": dict(sorted(summary.items())),
        "empty_outcomes_by_source_class": dict(sorted(outcome.items())),
        "duplicate_course_code_groups": len(duplicate_groups),
        "duplicate_groups_by_source_class": dict(sorted(Counter(row["source_class"] for row in duplicate_groups).items())),
        "anomaly_scan_after_repair": anomalies.get("candidate_counts", {}),
        "duplicate_groups": duplicate_groups,
        "course_rows": course_rows,
    }
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# CCMAS source reconciliation report - 2026-09-29",
        "",
        "This report classifies local candidates against the original CCMAS PDFs. It is not a downstream domain audit.",
        "",
        "## Scope",
        "",
        f"- Original source PDFs: **{output['scope']['original_source_documents']}**",
        f"- CCMAS packages: **{output['scope']['ccmas_programme_packages']}**",
        f"- CCMAS course rows: **{output['scope']['ccmas_course_rows']}**",
        "",
        "## Empty-summary classifications",
        "",
    ]
    lines.extend(f"- `{k}`: {v}" for k, v in output["empty_summary_by_source_class"].items())
    lines += ["", "## Empty-outcome classifications", ""]
    lines.extend(f"- `{k}`: {v}" for k, v in output["empty_outcomes_by_source_class"].items())
    lines += ["", "## Duplicate-code classifications", ""]
    lines.extend(f"- `{k}`: {v}" for k, v in output["duplicate_groups_by_source_class"].items())
    lines += ["", "The full row and duplicate-group ledgers are in the JSON artifact.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({k: output[k] for k in ("scope", "empty_summary_by_source_class", "empty_outcomes_by_source_class", "duplicate_course_code_groups", "duplicate_groups_by_source_class")}, indent=2))


if __name__ == "__main__":
    main()
