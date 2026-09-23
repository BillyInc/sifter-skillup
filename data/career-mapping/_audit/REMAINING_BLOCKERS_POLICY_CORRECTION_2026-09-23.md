# Remaining blockers policy correction — 2026-09-23

This append-only checkpoint reconciles the JAMB section of
`REMAINING_BLOCKERS_RECONCILIATION_2026-09-23.md`.

## Corrected rule

The student-facing JAMB scope is **420 identities**. A CCMAS curriculum/domain
complement is optional. Therefore, the **11 JAMB link occurrences whose local
CCMAS evidence status is `nigerian_ccmas_anchor_missing` are not blockers and
are not automatically unavailable**. They remain auditable occurrence-level
states, but absence of that optional complement must not suppress the parent
JAMB identity.

## Reconciled counts

| Measure | Count | Interpretation |
| --- | ---: | --- |
| Student-facing JAMB identity scope | 420 | Complete identity population; not reduced by optional complements |
| Review-required JAMB identities | 86 | Internal review queue remains; not an automatic unavailable state |
| Affected JAMB/domain-link occurrences | 711 | Occurrence-level evidence population |
| CCMAS component/domain pairs | 559 | Occurrence grouping |
| CCMAS sufficient for link gate | 547 | Existing local evidence classification |
| CCMAS present but insufficient | 153 | May remain under evidence review |
| CCMAS anchor missing | 11 | Optional complement; removed from blocker interpretation |
| Review occurrences after excluding the 11 optional gaps | 700 | Remaining occurrence-level review population, not an identity count |

The 11 count is occurrence-level, so it must not be subtracted from 420. The
86 identity queue remains represented for internal review, but the blocker
report must not describe the 11 no-anchor occurrences as blockers or as
`unavailable` merely because the CCMAS complement is absent.

## Boundaries

This correction changes local blocker interpretation only. It does not apply
SQL, read or write the live database, run browser proof, change frontend code,
rewrite the catalogue, or promote any JAMB/domain evidence.

## Inputs

- `data/career-mapping/_audit/REMAINING_BLOCKERS_RECONCILIATION_2026-09-23.md`
- `data/career-mapping/_audit/programme_jamb_resource_evidence_2026-09-23_manifest.json`
- `data/career-mapping/_audit/ccmas_external_domain_complements_2026-09-01.json`
- `data/career-mapping/_audit/JAMB_CCMAS_CURRICULUM_COVERAGE_MATRIX_2026-09-19.md`
