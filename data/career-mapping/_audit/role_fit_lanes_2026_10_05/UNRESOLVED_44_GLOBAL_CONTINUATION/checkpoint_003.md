# Cross-lane reconciliation checkpoint 003

Date: 2026-10-06. Global-only role→parent-domain audit; no canonical edits.

## Overlap found and handled

The repository already contains a broader exact-key reconciliation at
`../GLOBAL_CONTINUATION_2026_10_06/`. It reconciles **3,919/3,919 canonical
role keys** and reports **3,908 terminal dispositions plus 11 unresolved**,
with **0 conflicting terminal statuses** inside that reconciliation. This is
farther along than the 44-key residual from which this disjoint continuation
started; the 44-key residual is an older snapshot and must not be treated as
the current remaining queue.

Comparing the 21 historical decisions in this folder plus 8 exact keys examined
in the two just-researched candidate batches against the broader lane:

- **24** of 29 attempted exact keys (including the two just-researched batches)
  were already terminally decided in the broader lane.
- The other **5** are still unresolved in that lane; this work found no new
  role-task evidence sufficient to close them.
- **0 new exact keys** were added.
- Cross-lane disposition differences requiring supersession/review: **5**
  terminal keys (`D013|Financial and Investment Advisers`,
  `D016|Electrotechnology Engineers`, `D006|IoT data analyst`,
  `D006|edge computing engineer`, `D012|FinTech Engineers`) plus
  `D007|Designers, All Other`, which this older folder marked unsupported but
  the broader lane correctly leaves unresolved for lack of a task profile.
- The newly drafted batch 004 and 005 decision files were removed before
  checkpointing because their keys duplicated the broader lane or its current
  unresolved queue. Their source checks are retained as a non-decision note in
  `residual_11_source_check_2026_10_06.md`.

The broader lane is authoritative for current exact-key coverage. This older
folder's batches 001–003 remain historical work products and must not be added
to its counts or used to override its exact-key reconciliation.

## Current exact unresolved queue

The current residual is **11 exact keys**, not 23:

`D007|Designers, All Other`; `D009|Mathematical Science Occupations, All Other`;
`D010|Business Operations Specialists, All Other`;
`D010|Financial Specialists, All Other`;
`D022|Extraction Workers, All Other`; `D041|Physical Scientists, All Other`;
`D042|Media and Communication Workers, All Other`;
`D122|Health Technologists and Technicians, All Other`;
`D124|Healthcare Support Workers, All Other`;
`D126|Healthcare Diagnosing or Treating Practitioners, All Other`;
`D150|Religious Workers, All Other`.

The source review note confirms that official occupational sources provide no
task profile for these residual categories; the D126 category also enumerates
distinct example occupations with materially different domain implications.
The correct result remains unresolved until an exact task identity is
available. No titles, hierarchy membership, or country-specific assumptions
were used to force closure.

## Verification

- Tests: `python -m pytest -q data/career-mapping/_audit/role_fit_lanes_2026_10_05/UNRESOLVED_44_GLOBAL_CONTINUATION/test_batch_001_exact_keys.py data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_CONTINUATION_2026_10_06/test_reconcile_exact_role_fit_coverage.py` — **8 passed**. Then `reconcile_exact_role_fit_coverage.py` reported **3,919 exact keys, 3,919 reviewed, 11 unresolved, 0 conflicts**.
- Broader exact-key coverage/test artifacts are documented in
  `../GLOBAL_CONTINUATION_2026_10_06/checkpoint_003.md`; rerun them before any
  final lane sign-off.

## Next action

Do not create duplicate role decisions. Reconcile the 11 unresolved records
against the global occupational definitions, preserve unresolved where task
evidence is genuinely absent, and pass the exact-key reconciliation/tests in
the broader lane. Keep Nigeria-specific evidence, role→specialization
decisions, and canonical taxonomy edits out of scope.
