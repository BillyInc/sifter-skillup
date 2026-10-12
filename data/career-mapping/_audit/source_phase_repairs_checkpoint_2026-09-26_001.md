# JAMB–CCMAS source-phase repairs checkpoint 001

**Date:** 2026-09-26 (Africa/Lagos)  
**Status:** confirmed bounded repairs applied; catalogue-wide source verification remains open  
**Scope:** confirmed CCMAS extraction corrections and confirmed JAMB offering-context corrections only.

## Confirmed repairs in this checkpoint

- JAMB offering-context corrections are recorded in `jamb_source_repair_lane_a_incremental_checkpoint_2026-09-26_003.md`: corrected parsed spelling/source aliases, removed the confirmed duplicate UDU token, and corrected bounded institution/header contamination for Meteorology and Hotel Management; Environmental Management and Technology source heading metadata was retained without conflating programme identities.
- CCMAS boundary repairs previously recorded in `ccmas_confirmed_anomaly_repair_checkpoint_2026-09-26_001.md` cover DTH 527, OCT 525, OPT 203, OPT 698, POT 317, CHM 107, and VEX 599.
- Environmental Sciences FAA 451 was repaired to the four official Draughtsmanship outcomes. The source-authored combined FAA 451/FAA 442 header is preserved as `source_aliases`/source metadata; unrelated FAE 311/321 outcomes were removed. See `ccmas_lane_c_non_education_incremental_checkpoint_2026-09-26_002.md`.
- Education `LIS 215`, `LIS 216`, `LIS 222`, and `SED 101` were reconstructed from the official Education CCMAS blocks, with item-specific source URLs, printed-page locators and access dates. SED 101 retains both official title renderings as metadata and uses the course-content heading as the canonical title. Repair implementation: `repair_ccmas_education_lane_b_2026_09_26.py`.

## Validation

Focused suite:

```text
python -m pytest data/career-mapping/_audit/test_ccmas_education_lane_b_2026_09_26.py data/career-mapping/_audit/test_ccmas_faa451_source_combined.py data/career-mapping/_audit/test_ccmas_confirmed_boundary_spills.py data/career-mapping/_audit/test_jamb_source_offering_repairs.py -q
9 passed
```

FAA 451 idempotent repair checker also passed.

## Still open; do not describe as fixed

- The JAMB aggregate reports 419 identity rows with at least one offering occurrence lacking item-specific PDF verification, plus wrapped/alias/header and no-hit source-cell candidates. Those are evidence gaps/candidates, not 419 proven bad mappings. Occurrence-level verification must continue against official JAMB brochure cells; do not infer absence or merge contexts.
- CCMAS candidate queues remain open: empty course summaries, title-boundary candidates, duplicate-code groups and any additional exact-source extraction anomalies. Empty summaries are not automatically defects; adjudicate against the relevant official NUC course block.
- The JAMB 420-identity source increments total issue records, not unique unresolved defects; do not use the count as a repair backlog without deduplication.
- No JAMB/CCMAS-derived scopes, programme mapping, skills, domain/subgroup/role taxonomy, seed, SQL, UI, or downstream mapping was regenerated or changed in this checkpoint.

## Incremental continuation — 2026-09-26 evening

- Lane A completed Administration occurrences 21–30: 7 newly verified, 2
  explicit holds, and 1 prior verification preserved. See
  `jamb_source_repair_lane_a_incremental_checkpoint_2026-09-26_007.md`.
- Lane B completed Arts occurrences 21–40: 3 newly verified and 17 explicit
  holds. See `jamb_source_repair_lane_b_incremental_checkpoint_2026-09-26_003.md`.
- Lane C completed Sciences occurrences 21–40: 20 newly verified and no new
  holds. See `jamb_sciences_lane_c_checkpoint_2026-09-26_003.md`.
- The rebuilt offering inventory now covers 420 canonical identities and 442
  total offering occurrences, with 33 occurrence records carrying PDF-level
  verification. The remaining unverified occurrences are an evidence queue,
  not an unavailable decision.
- The combined Computer Science + Mathematics correction is reflected in both
  the scope artifact and JAMB skills component artifact. The inheritance audit
  reports zero stored-component and zero blend-component mismatches.
- Lane A completed Agriculture occurrences 11–20: 8 source-confirmed and 2
  evidence holds; 8 institution arrays were corrected only where the exact
  official cell demonstrated the mismatch. See
  `jamb_source_repair_lane_a_incremental_checkpoint_2026-09-28_010.md`.
- Lane B completed Social/Management row 3 (`Criminology`), independently
  verifying the exact institution cell. See
  `jamb_source_repair_lane_b_incremental_checkpoint_2026-09-28_007.md`.
- Lane C completed Sciences rows 61–80: 17 source-confirmed, 3 holds. See
  `jamb_sciences_lane_c_checkpoint_2026-09-28_005.md`.
- Directly adjudicated two empty-summary reconciliation items from the NUC
  source: unsupported Finance `FIN 102` parser row removed; Procurement
  `PRM 408` title/load restored from the official table with content/outcomes
  left empty because no course-detail block is supplied. See FIX-031 and
  `ccmas_empty_summary_source_review_reconciliation_checkpoint_2026-09-26_001.md`.
- Added item-specific NUC citation metadata to the distinct Social Sciences
  `LIS 228` table-only record; its outcomes/content remain empty because no
  corresponding course-detail block is published (FIX-032).
- The deterministic CCMAS anomaly inventory was refreshed after this source
  correction: 237 packages and 9,853 course records remain; 1,088 empty-summary
  occurrences still require source-level adjudication. The JAMB occurrence
  inventory now reports 420 canonical identities, 442 occurrences, and 45
  PDF-verified occurrence records. These are progress counts, not audit closure.

## Next gate

Continue source-cell verification and source-confirmed repairs across the remaining JAMB occurrence records and CCMAS candidate queues. Only after those source-phase ledgers are adjudicated should derived JAMB→CCMAS curricula/scopes be regenerated and reconciled. Downstream domain/subgroup/role mapping follows that source gate; role naming remains deferred.
