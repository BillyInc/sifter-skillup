# CCMAS catalogue anomaly triage checkpoint — 2026-09-26

This is a catalogue-wide candidate inventory, not a closure claim. It was run
after the source-backed local repairs and the encoding-artifact normalization.

## Scope and counts

- 17 CCMAS source files, 237 programme packages, 9,854 course records.
- 836 records have no `content_summary`; 605 of those still contain one or
  more extracted skills/outcomes, while 231 have neither a summary nor a
  skills list. A null summary is not automatically a source defect because
  the NUC tables may publish outcomes without a prose summary; each record
  still needs source-boundary review before promotion.
- 164 titles match a conservative truncation/continuation heuristic, and 50
  duplicate course-code groups occur within a package. These are candidate
  queues, not confirmed defects; titles such as `SED 101`, `LIS 215`, and
  `FAA 451` demonstrate that the queue contains real extraction problems.
- The focused anomaly scan now reports: 7 duplicate-outcome candidates, 6
  compound page-header candidates, 0 unresolved cross-reference candidates,
  and 0 replacement-character candidates.

## Confirmed source-boundary leads

- Official NUC Education CCMAS search evidence gives `SED 101` as
  **Introduction of Science and Mathematics Education**, while the local title
  is truncated and its extracted skills contain multiple adjacent course
  blocks. It remains held for a bounded source reconstruction.
- Official NUC CCMAS search evidence gives `LIS 215` as **Library and
  Information Services for Children and Adolescents**. The local `LIS 215`
  row currently contains the serials-management outcomes associated with the
  neighbouring `LIS 216` block, so it must not be treated as a clean course
  record.
- `FAA 451` is currently titled `and FAA 442: Draughtsmanship` and combines
  drawing and art-education outcomes. It remains held pending an exact NUC
  course-block reconstruction; no title or outcomes are promoted from a
  general search result.
- `VEX 599` repeats three outcomes in the local extraction. It remains held
  pending an exact Veterinary CCMAS source check; duplication is not removed
  merely because it looks suspicious.

## Next gate

The source audit is not closed. The remaining candidate queues must be
source-adjudicated and repaired or explicitly classified before the planned
three-agent repair pass. Downstream domain/subgroup/role remapping remains
deferred until this source phase is closed.

