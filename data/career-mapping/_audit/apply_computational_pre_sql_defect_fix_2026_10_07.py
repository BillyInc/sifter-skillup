"""Classify intentional computational evidence that has no visible subgroup seed target.

These records remain in the evidence ledger for audit/provenance, but must not be
inserted into ``computational_method_evidence`` because that table requires a
foreign key to a visible canonical subgroup.  This is deliberately an explicit
classification, not a silent generator fallback.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "computational_method_evidence.json"
REPORT = ROOT / "_audit" / "computational_pre_sql_defect_fix_2026_10_07.json"


TARGETS = {
    ("D056", "25", "game theory"): "audit_only_not_computational_method",
    ("D145", "21", "computational modelling of neural activity and brain systems"):
        "audit_only_no_visible_subgroup",
    ("D145", "21", "neural-data analysis and dimensionality reduction"):
        "audit_only_no_visible_subgroup",
    ("D145", "21", "explanatory machine learning for neuroscience"):
        "audit_only_no_visible_subgroup",
    ("D145", "21", "multimodal neural-data integration"):
        "audit_only_no_visible_subgroup",
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    payload = json.loads(SOURCE.read_text(encoding="utf-8"))
    methods = payload.get("methods") or []
    changed = []
    missing = set(TARGETS)

    for method in methods:
        key = (
            str(method.get("domain_id") or ""),
            str(method.get("isco_submajor") or ""),
            str(method.get("name") or "").strip(),
        )
        disposition = TARGETS.get(key)
        if disposition is None:
            continue
        missing.discard(key)
        if method.get("seed_disposition") == disposition and method.get("data_state") == "audit_only":
            continue
        method["seed_disposition"] = disposition
        method["data_state"] = "audit_only"
        method["audit_note"] = (
            "Retained in the source evidence ledger for provenance, but excluded "
            "from the student/canonical computational-method seed because its "
            "current subgroup target is not a visible canonical subgroup."
        )
        changed.append({"domain_id": key[0], "isco_submajor": key[1], "name": key[2], "seed_disposition": disposition})

    report = {
        "source": str(SOURCE.relative_to(ROOT.parent)),
        "applied": bool(args.apply),
        "target_count": len(TARGETS),
        "changed_count": len(changed),
        "already_classified_count": len(TARGETS) - len(changed) - len(missing),
        "missing_targets": [
            {"domain_id": d, "isco_submajor": s, "name": n}
            for d, s, n in sorted(missing)
        ],
        "changed": changed,
        "policy": {
            "student_visibility": "excluded",
            "canonical_method_seed": "omit intentional audit-only rows",
            "unexpected_invalid_subgroup": "generator error/report, never silently omit",
        },
    }

    if args.apply:
        SOURCE.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0 if not missing else 1


if __name__ == "__main__":
    raise SystemExit(main())
