"""Generate the idempotent SQL cleanup for mappings that fail review gates."""

from __future__ import annotations

import json
from pathlib import Path


HERE = Path(__file__).parent
AUDIT = HERE / "_audit" / "course_and_jamb_mapping_audit_2026-09-11.json"
MAPPING = HERE / "programme_domain_final.json"
OUT = HERE.parent.parent / "backend" / "migration_programme_domain_review_corrections_2026-09-18.sql"


def sql(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main() -> None:
    audit = json.loads(AUDIT.read_text(encoding="utf-8"))
    mapping = json.loads(MAPPING.read_text(encoding="utf-8"))
    rows = {
        (
            str(row.get("discipline") or ""),
            str(row.get("programme") or ""),
            str(row.get("domain_id") or ""),
        )
        for row in audit.get("candidate_rows", [])
        if (row.get("current_mapping") or row.get("unverified_mapping"))
        and row.get("gate_status") in {
            "fails_course_outcome_gate",
            "fails_adjacent_gate",
            "passes_count_but_needs_semantic_review",
        }
    }
    # Also remove links that are explicitly retained outside active guidance
    # in the authoritative mapping, even when their numeric anchor count
    # passes.  The semantic resolver may deliberately keep a row out of the
    # active ``links`` array without setting the older
    # ``evidence_status=manual_semantic_review`` marker.  The exclusion marker
    # is the canonical student-visibility decision and must therefore reach
    # the live cleanup SQL as well.
    for discipline_programme, record in mapping.items():
        discipline, separator, programme_name = discipline_programme.partition("::")
        if not separator:
            continue
        for link in record.get("unverified_links") or []:
            if (
                link.get("evidence_status") == "manual_semantic_review"
                or link.get("semantic_review_status") == "retained_unverified"
                or link.get("review_exclusion_reason")
            ):
                rows.add((discipline, programme_name, str(link.get("domain_id") or "")))
    if not rows:
        raise SystemExit("No gate-failing programme-domain rows found")

    values = ",\n".join(
        f"    ({sql(discipline)}, {sql(programme)}, {sql(domain_id)})"
        for discipline, programme, domain_id in sorted(rows)
    )
    text = f"""-- Remove programme-domain edges that fail the current CCMAS evidence/review gate.
--
-- Direct and functional links need at least two course/outcome anchors.
-- Adjacent links need one domain-specific course/outcome anchor plus
-- transferable evidence. These rows stay in the source audit as unverified;
-- links with only generic anchors also remain unverified until semantic review.
-- None of these rows may remain active student-facing guidance. This migration
-- is additive and idempotent and does not rebuild the taxonomy.
BEGIN;

WITH targets(discipline, programme_name, domain_key) AS (VALUES
{values}
)
DELETE FROM skillup_dev.programme_domain_evidence e
USING skillup_dev.programmes p, skillup_dev.domains d, targets t
WHERE e.programme_id = p.id
  AND e.domain_id = d.id
  AND p.discipline = t.discipline
  AND p.name = t.programme_name
  AND d.domain_key = t.domain_key;

WITH targets(discipline, programme_name, domain_key) AS (VALUES
{values}
)
DELETE FROM skillup_dev.programme_domain pd
USING skillup_dev.programmes p, skillup_dev.domains d, targets t
WHERE pd.programme_id = p.id
  AND pd.domain_id = d.id
  AND p.discipline = t.discipline
  AND p.name = t.programme_name
  AND d.domain_key = t.domain_key;

COMMIT;
"""
    OUT.write_text(text, encoding="utf-8")
    print(f"Wrote {len(rows)} correction targets to {OUT}")


if __name__ == "__main__":
    main()
