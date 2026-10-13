#!/usr/bin/env python3
"""Case-classify the existing 73-domain computational/method signal queue.

This is an audit artifact builder only. It does not add specializations, roles,
or role-method links to canonical data. Direct domain/layer text is separated
from role-task signals and occupational aggregate text.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
TRIAGE = AUDIT / "computational_candidate_triage_2026_10_05.json"
ROLE_LIBRARY = ROOT / "role_library_v3_cleaned.json"
OUT_JSON = AUDIT / "computational_method_signal_domain_dispositions_2026_10_05.json"
OUT_MD = AUDIT / "COMPUTATIONAL_METHOD_SIGNAL_DOMAIN_DISPOSITIONS_2026-10-05.md"
CHECKPOINT = AUDIT / "COMPUTATIONAL_COVERAGE_CHECKPOINT_2026-10-05.md"

EXPECTED_TOTAL = 73
EXPECTED_DIRECT = 21
EXPECTED_DECLARED_TASK_ONLY = 10
EXPECTED_UNDECLARED_TASK_ONLY = 42


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def role_source_index(rows: list[dict]) -> dict[tuple[str, str], list[dict]]:
    result: dict[tuple[str, str], list[dict]] = {}
    for row in rows:
        names = [row.get("role_name", "")]
        aliases = row.get("also_known_as", "")
        if isinstance(aliases, str):
            # The cleaned role catalogue stores explicit aliases separated by
            # a middle dot. Index exact aliases, not fuzzy title similarities.
            names.extend(re.split(r"[·;|\n]+", aliases))
        elif isinstance(aliases, list):
            names.extend(str(alias) for alias in aliases)

        for name in names:
            normalized = normalize(name)
            if not normalized:
                continue
            key = (row.get("domain_id", ""), normalized)
            bucket = result.setdefault(key, [])
            if row not in bucket:
                bucket.append(row)
    return result


def classify(row: dict, roles: dict[tuple[str, str], list[dict]]) -> dict:
    direct = row.get("direct_scope_signals", [])
    tasks = row.get("role_task_signals", [])
    declared = bool(row.get("declared_computational_layer"))
    if direct and declared:
        disposition = "existing_declared_layer_has_direct_domain_or_specialization_text"
        result = (
            "The repository already declares a computational layer and the source scan also found direct domain, "
            "domain-layer, or curated-specialization wording. This is evidence that computational/quantitative "
            "practice belongs in the domain's existing scope, not evidence to add a duplicate area. The scan does "
            "not certify every listed item as universally required."
        )
    elif declared and not direct:
        disposition = "existing_declared_layer_task_signals_do_not_establish_a_gap"
        result = (
            "A computational layer is already declared, but this scan found only role-task wording for this queue "
            "entry. Preserve the existing layer; the task hits neither prove a missing specialization nor validate "
            "a role-to-domain link."
        )
    elif not declared and not direct and tasks:
        disposition = "role_task_only_optional_method_no_domain_specialization_addition"
        result = (
            "The signal appears only in role-task text; there is no direct domain, domain-layer, or curated "
            "specialization evidence in this scan and no declared computational layer. Classify it as a potentially "
            "task-specific method/use case, not a domain-wide foundation or new specialization. Role-domain fit "
            "remains for the separate role lane."
        )
    else:
        raise ValueError(f"Unexpected signal partition for {row['domain_id']}")

    task_evidence = []
    for signal in tasks:
        candidates = roles.get((row["domain_id"], normalize(signal.get("role", ""))), [])
        task_evidence.append({
            "role_title_from_task_signal": signal.get("role"),
            "signal_terms": signal.get("field_phrases", []) + signal.get("methods_or_tools", []),
            "task_excerpt": signal.get("text_excerpt", ""),
            "matched_role_source_records": [
                {
                    "domain_id": candidate.get("domain_id"),
                    "role_name": candidate.get("role_name"),
                    "matched_title_basis": (
                        "canonical_title"
                        if normalize(signal.get("role", "")) == normalize(candidate.get("role_name", ""))
                        else "explicit_also_known_as"
                    ),
                    "source": candidate.get("source"),
                    "esco_code": candidate.get("esco_code"),
                    "isco_group": candidate.get("isco_group"),
                    "source_refs": candidate.get("domain_fit_review_source_refs", []),
                    "source_record_description": candidate.get("description", ""),
                }
                for candidate in candidates
            ],
            "role_fit_inferred": False,
        })

    return {
        "domain_id": row["domain_id"],
        "domain_name": row["domain_name"],
        "declared_computational_layer": declared,
        "classification": disposition,
        "case_disposition": result,
        "direct_domain_or_curated_layer_evidence": direct,
        "role_task_evidence": task_evidence,
        "occupational_aggregate_evidence_excluded_from_fit_judgment": row.get(
            "occupational_aggregate_signals_not_used_as_fit_proof", []
        ),
        "role_task_record_match_count": sum(bool(item["matched_role_source_records"]) for item in task_evidence),
        "role_task_record_unmatched_titles": [
            item["role_title_from_task_signal"]
            for item in task_evidence if not item["matched_role_source_records"]
        ],
        "role_domain_or_role_specialization_change": "not_assessed_in_this_lane",
        "canonical_taxonomy_change": False,
    }


def main() -> None:
    triage = load(TRIAGE)
    role_rows = load(ROLE_LIBRARY)
    role_index = role_source_index(role_rows)
    queue = [
        row for row in triage.get("domains", [])
        if row.get("triage_tier") == "review_computational_methods_and_role_use_cases"
    ]
    rows = [classify(row, role_index) for row in queue]
    counts = Counter(row["classification"] for row in rows)
    direct_count = sum(bool(row["direct_domain_or_curated_layer_evidence"]) for row in rows)
    declared_task_only = sum(
        row["declared_computational_layer"] and not row["direct_domain_or_curated_layer_evidence"]
        for row in rows
    )
    undeclared_task_only = sum(
        not row["declared_computational_layer"] and not row["direct_domain_or_curated_layer_evidence"]
        for row in rows
    )
    task_count = sum(len(row["role_task_evidence"]) for row in rows)
    matched_task_count = sum(row["role_task_record_match_count"] for row in rows)
    unmatched = [
        {"domain_id": row["domain_id"], "role_title": title}
        for row in rows for title in row["role_task_record_unmatched_titles"]
    ]
    outside_queue_task_rows = [
        {"domain_id": row["domain_id"], "role_task_row_count": len(row.get("role_task_signals", [])), "triage_tier": row.get("triage_tier")}
        for row in triage.get("domains", [])
        if row.get("triage_tier") != "review_computational_methods_and_role_use_cases" and row.get("role_task_signals")
    ]
    outside_queue_task_count = sum(row["role_task_row_count"] for row in outside_queue_task_rows)

    if (len(rows), direct_count, declared_task_only, undeclared_task_only) != (
        EXPECTED_TOTAL, EXPECTED_DIRECT, EXPECTED_DECLARED_TASK_ONLY, EXPECTED_UNDECLARED_TASK_ONLY
    ):
        raise ValueError(
            "Queue partition changed: "
            f"total={len(rows)},direct={direct_count},declared_task_only={declared_task_only},"
            f"undeclared_task_only={undeclared_task_only}"
        )

    result = {
        "schema_version": "2026-10-05.computational-method-signal-dispositions.v1",
        "generated_by": Path(__file__).name,
        "inputs": [TRIAGE.name, ROLE_LIBRARY.name],
        "scope": "All 73 domains in the existing method/task-signal triage tier. This is a case-level disposition of scanner findings, not a role-to-domain audit or a canonical taxonomy change.",
        "policy": {
            "direct_scope_evidence": "Domain root, domain layer, or curated specialization wording can establish that a method is already represented in domain scope; it does not establish that every item is universally required.",
            "role_task_only_evidence": "A task signal can justify task-context learning consideration only; it cannot by itself create a student-facing domain specialization or prove role-domain fit.",
            "occupational_aggregates": "ESCO/O*NET/ISCO aggregate competencies are retained for visibility but excluded as parent-domain fit proof.",
            "no_inference": "No roles, subgroup assignments, or role-method links are created or changed.",
        },
        "counts": {
            "method_task_signal_domains_classified": len(rows),
            "declared_layer_with_direct_scope_evidence": direct_count,
            "declared_layer_but_only_role_task_signals": declared_task_only,
            "no_declared_layer_and_only_role_task_signals": undeclared_task_only,
            "role_task_signal_rows": task_count,
            "role_task_rows_matched_to_local_role_source_records": matched_task_count,
            "role_task_rows_without_exact_local_role_title_match": len(unmatched),
            "role_task_rows_outside_73_domain_queue_already_triaged_separately": outside_queue_task_count,
            "classification_counts": dict(sorted(counts.items())),
        },
        "unmatched_role_task_titles": unmatched,
        "task_signal_rows_outside_73_domain_queue": outside_queue_task_rows,
        "domains": rows,
        "external_source_review_reference": "computational_external_source_review_2026_10_05.json (7 candidate dispositions / 12 primary or professional sources). Its field-specific limits remain in force; no external claim is generalized to unrelated parent domains.",
        "canonical_taxonomy_written": False,
    }
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Computational method/task-signal domain dispositions — 2026-10-05",
        "",
        "> Case-level resolution of the existing 73-domain scanner queue. A method appearing in a role task is not, by itself, a domain specialization or proof of role-domain fit.",
        "",
        "## Coverage",
        "",
        f"- Domains classified: **{len(rows)}/73**.",
        f"- Existing computational layer + direct domain/layer evidence: **{direct_count}**; no duplicate specialization is proposed from this scan.",
        f"- Existing computational layer + role-task-only signals: **{declared_task_only}**; no gap is established.",
        f"- No declared computational layer + role-task-only signals: **{undeclared_task_only}**; classified as task-context candidates, not domain-level additions.",
        f"- Role-task signal rows: **{task_count}**; exact local role-source records matched: **{matched_task_count}**; unmatched titles: **{len(unmatched)}**.",
        f"- The broader triage count is **{task_count + outside_queue_task_count}** task rows: the remaining **{outside_queue_task_count}** are in a separately triaged named-field domain ({', '.join(x['domain_id'] for x in outside_queue_task_rows)}), not omitted from the audit.",
        "- Role/task source URLs and excerpts are stored per case in the JSON; role fit is explicitly not inferred.",
        "- The seven prior externally reviewed field candidates remain bounded by the source limits in `computational_external_source_review_2026_10_05.json`.",
        "",
        "## Per-domain disposition",
        "",
    ]
    for row in rows:
        lines.extend([f"### {row['domain_id']} — {row['domain_name']}", "", f"**Disposition:** `{row['classification']}`. {row['case_disposition']}"])
        for hit in row["direct_domain_or_curated_layer_evidence"]:
            terms = ", ".join(hit.get("field_phrases", []) + hit.get("methods_or_tools", []))
            lines.append(f"- Direct `{hit['source_type']}` / `{hit.get('source_key')}` signal ({terms}): {hit.get('text_excerpt', '')}")
        for task in row["role_task_evidence"]:
            refs = sorted({url for source in task["matched_role_source_records"] for url in source["source_refs"]})
            citations = "; ".join(refs) if refs else "No role-fit source reference recorded in the local role row"
            lines.append(f"- Role task `{task['role_title_from_task_signal']}` [{', '.join(task['signal_terms'])}]: {task['task_excerpt']} Source reference(s): {citations}.")
        if row["occupational_aggregate_evidence_excluded_from_fit_judgment"]:
            lines.append(f"- Aggregate occupational signal rows excluded from domain-fit proof: {len(row['occupational_aggregate_evidence_excluded_from_fit_judgment'])}.")
        lines.append("")
    lines.extend([
        "## Reproduction and boundaries",
        "",
        "Run `python data/career-mapping/_audit/classify_computational_method_signal_domains_2026_10_05.py`; it validates the 21/10/42 partition before writing.",
        "The complete signal details, excerpts, matched source records and unmatched titles are in the paired JSON. This artifact does not alter canonical domains, specializations, roles, or role-method relationships.",
        "",
    ])
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(result["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
