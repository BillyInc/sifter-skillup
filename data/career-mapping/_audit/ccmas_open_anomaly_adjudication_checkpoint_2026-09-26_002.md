# CCMAS open-anomaly adjudication checkpoint — 2026-09-26 (002)

This is an append-only source-adjudication checkpoint. It follows the
catalogue-wide scan and the previously logged repairs; it does not reopen
closed repair classes and does not edit CCMAS source JSON.

## Scope

- 17 NUC CCMAS source files
- 237 programme packages
- 9,854 course records
- Downstream domains, subgroups, roles, role naming, JAMB joins and seed
  regeneration are explicitly out of scope for this checkpoint.

The machine-readable evidence ledger is
`ccmas_open_anomaly_adjudication_2026-09-26_002.json`.

## Closed classes not repeated

The current anomaly inventory reports zero replacement-character and zero
unresolved-cross-reference candidates. The earlier 41 unambiguous page-header
repairs and the CAM 424 equipment-spill repair remain recorded in the prior
fix log. DNT 309, DTH 521 and ANA 341 were previously source-checked as
source-authored repeated outcomes and were not reopened here.

## Newly source-confirmed records

| IDs | Records | Result | Source locator |
|---|---|---|---|
| CCMAS-PAGE-001 | Allied Health / Dental Therapy / DTH 527 | Confirmed page-header plus minimum-equipment spill | NUC Allied Health, pp. 170–171 |
| CCMAS-PAGE-002 | Allied Health / Occupational Therapy / OCT 525 | Confirmed page-header plus equipment spill | NUC Allied Health, pp. 483–484 |
| CCMAS-PAGE-003 | Allied Health / Optometry / OPT 203 | Confirmed page-header plus next-course PIO 201 spill | NUC Allied Health, pp. 505–506 |
| CCMAS-PAGE-004 | Allied Health / Optometry / OPT 698 | Confirmed page-header plus equipment spill | NUC Allied Health, pp. 540–541 |
| CCMAS-PAGE-005 | Allied Health / Prosthetics and Orthotics / POT 317 | Confirmed page-header plus next-course POT 401 spill | NUC Allied Health, pp. 657–658 |
| CCMAS-PAGE-006 | Education / Chemistry / CHM 107 | Confirmed page-header plus next-course CHM 108 spill | NUC Education, p. 210 locator in the existing anomaly ledger |
| CCMAS-DUP-001 | Veterinary Medicine / VEX 599 | Confirmed extractor duplicate: three outcomes repeated twice | NUC Veterinary, p. 53 |
| CCMAS-DUP-002 | Education / Library and Information Science / LIS 215 | Confirmed title truncation and LIS 216/LIS 222 outcome misjoin | NUC Education, pp. 827–828; NUC Social Sciences, p. 147 |
| CCMAS-DUP-003 | Education / Mathematics / SED 101 | Confirmed adjacent-course contamination and source title inconsistency | NUC Education, pp. 841 and 844 |
| CCMAS-DUP-004 | Environmental Sciences / Fine and Applied Arts / FAA 451 | Confirmed FAE-course contamination; combined FAA 451/FAA 442 header is source-authored | NUC Environmental Sciences, p. 252 |

Every record above has its official URL, locator, access date, evidence and
narrow repair instruction in the JSON ledger. The six page-header cases are
now confirmed defects, but are intentionally not edited in this audit-only
pass.

## Important ownership finding

Library and Information Science appears legitimately in both the Education
CCMAS (B.Ed context) and Social Sciences CCMAS (B.Sc context). The same course
code/title must therefore not be globally collapsed. The Education `LIS 215`,
`LIS 216` and `LIS 222` rows nevertheless show a separate extraction-boundary
problem and must be reconstructed within the Education package from their own
source blocks.

## Remaining catalogue-wide queues

The deterministic inventory still contains 1,092 empty-summary occurrences
(1,088 unique keys), 164 conservative title-truncation candidates and 50
duplicate-course-code groups. These are not automatically defects. The next
audit pass must source-check each exact key and distinguish source-defined
blank/project rows, legitimate repeated or combined source rows, and parser
loss or cross-package contamination. The audit is therefore not closed.

## Repair handoff rules

1. Apply only the exact, source-bounded repairs in the ledger after the open
   queues are fully adjudicated.
2. Preserve source-authored combined blocks and package ownership; do not split
   or merge them from title similarity alone.
3. Rebuild affected derived contracts only after the source JSON repair is
   approved and the all-237 reconciliation is rerun.
4. Keep JAMB/domain/subgroup/role and role-naming work deferred until this
   CCMAS source phase is closed.

