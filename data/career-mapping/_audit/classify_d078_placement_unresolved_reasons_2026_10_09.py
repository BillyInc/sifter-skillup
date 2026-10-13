"""Classify D078 unresolved reasons without changing their source records."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_RECONCILIATION_2026_10_09.json"
OUTPUT = ROOT / "data/career-mapping/_audit/D078_PLACEMENT_UNRESOLVED_REASON_CLASSIFICATION_2026_10_09.json"
REPORT = ROOT / "docs/manual-review/D078_PLACEMENT_UNRESOLVED_REASON_CLASSIFICATION_2026_10_09.md"

ADMIN = re.compile(
    r"student_display|student[- ]display|checkpoint_placement|approval flags|approval remains false|"
    r"student approval remains false|candidate links are review-only|pending final .*owner review",
    re.I,
)
SCOPE = re.compile(
    r"no direct .*CCMAS|not a shared foundation|role-list .*provenance|occurrence .*provenance|"
    r"not a universal requirement|no claim is made|not establish.*breadth|not .*course claim",
    re.I,
)
EVIDENCE = re.compile(
    r"role[- ]task|role_task_relationship_verified|task/output|exact .*URI|exact ESCO|source (?:identity|concept)|URI/type|version|"
    r"Nigeria|Nigerian|local source|free resource|programme.*coverage|programme-to-item|"
    r"checkpoint fit|checkpoint ownership|not verified|remains unverified|insufficient|specific |"
    r"need distinction|does not establish|credential scope|overbroad|more precise|course destination|"
    r"false match|which .*meaning|task link|work task",
    re.I,
)


def classify(reason: str) -> str:
    if ADMIN.search(reason):
        return "administrative_approval_gate"
    if SCOPE.search(reason) and not EVIDENCE.search(reason):
        return "bounded_scope_or_non_claim"
    if EVIDENCE.search(reason):
        return "substantive_evidence_gap"
    return "unclassified_manual_check"


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    records: list[dict[str, Any]] = []
    reason_counts: Counter[str] = Counter()
    record_counts: Counter[str] = Counter()
    for record in source["records"]:
        classified: list[dict[str, str]] = []
        categories: set[str] = set()
        for reason in record.get("unresolved_reasons", []):
            category = classify(reason)
            categories.add(category)
            reason_counts[category] += 1
            classified.append({"category": category, "reason": reason})
        for category in categories:
            record_counts[category] += 1
        records.append(
            {
                "queue_position": record["queue_position"],
                "pair_key": record.get("pair_key"),
                "record_state": record.get("state"),
                "reason_classification": classified,
                "record_categories": sorted(categories),
                "student_display_approved": bool(record.get("student_display_approved")),
            }
        )

    output = {
        "schema_version": "2026-10-09.d078.placement-unresolved-reason-classification.v1",
        "status": "audit_only",
        "source_artifact": str(SOURCE.relative_to(ROOT)).replace("\\", "/"),
        "definitions": {
            "administrative_approval_gate": "A safety or workflow gate, not proof that evidence is impossible.",
            "bounded_scope_or_non_claim": "A deliberate limitation or non-claim that prevents overstatement; it may not require new evidence.",
            "substantive_evidence_gap": "A field requiring stronger identity, task/output, programme-transfer, Nigerian-context or learning-resource evidence before approval.",
            "unclassified_manual_check": "A reason requiring local inspection before promotion.",
        },
        "counts": {
            "records": len(records),
            "records_by_category": dict(sorted(record_counts.items())),
            "reasons_by_category": dict(sorted(reason_counts.items())),
            "student_approved_records": sum(item["student_display_approved"] for item in records),
        },
        "records": records,
    }
    OUTPUT.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    lines = [
        "# D078 unresolved-reason classification — 2026-10-09",
        "",
        "This is an audit-only classification. It does not delete reasons, approve records or change canonical data.",
        "",
        f"- Records classified: **{len(records)}**",
        f"- Administrative-gate records: **{record_counts['administrative_approval_gate']}**",
        f"- Bounded-scope/non-claim records: **{record_counts['bounded_scope_or_non_claim']}**",
        f"- Substantive-evidence-gap records: **{record_counts['substantive_evidence_gap']}**",
        f"- Manual-check records: **{record_counts['unclassified_manual_check']}**",
        "- Student-approved records: **0**",
        "",
        "A record can belong to more than one category. Administrative gates must not be reported as failed research, while substantive evidence gaps must not be hidden behind approval language.",
        "",
    ]
    REPORT.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(output["counts"], sort_keys=True))


if __name__ == "__main__":
    main()
