# JAMB–CCMAS source-phase incremental checkpoint — 2026-09-26 (002)

Status: **saved and open**. This increment records the reverse-crosswalk
reconciliation after checkpoint 001. It remains strictly within the JAMB /
CCMAS / external source phase.

## Exact files written

- `data/career-mapping/_audit/reverse_ccmas_crosswalk_reconciliation_2026-09-26_001.json`
- `data/career-mapping/_audit/reverse_ccmas_crosswalk_reconciliation_2026-09-26_001.md`
- `data/career-mapping/_audit/build_reverse_ccmas_crosswalk_reconciliation_2026_09_26.py`

The previous all-420 queue remains at:

- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`

## Verified counts

| Measure | Count |
|---|---:|
| CCMAS reverse-crosswalk packages | 83 |
| JAMB identities compared by that crosswalk | 420 |
| Numbered adjudication checkpoints present | 83 |
| Separate resolution checkpoints present | 40 (entries 001–040) |
| Entries 041–080 still without resolution checkpoint | 40 |
| Entries 081–083 with recorded dispositions not reflected in the JSONL ledger | 3 |

The three recorded dispositions are: entries 081 and 082, no supported match
found in the defined 420-identity universe after documented search; entry 083,
Veterinary Medicine, exact match recorded. These remain pending reconciliation
because the input machine ledger still labels all 83 entries as
`candidate requiring source evidence`.

## Guardrails

- The 83-entry JSONL ledger was read but not edited.
- No JAMB/CCMAS source JSON, programme mapping, curriculum scope, seed,
  domain, subgroup, role, SQL, UI, or downstream file was edited.
- A checkpoint or lexical lead is not a student-facing mapping.
- Downstream domain/subgroup/role auditing and role naming remain deferred.

## Next source-phase work

Continue the open 420-identity and 237-package queue by reconciling entries
041–080, resolving the 101 issue records with missing URLs, and source-checking
the remaining selected-course, offering-cell, combined-facet, and CCMAS anomaly
records. Keep all decisions item-cited and append-only.
