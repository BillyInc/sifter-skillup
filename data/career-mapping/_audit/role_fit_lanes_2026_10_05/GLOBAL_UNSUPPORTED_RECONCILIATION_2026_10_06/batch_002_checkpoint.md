# Unsupported role→domain reconciliation — batch 002

Date: 2026-10-06  
Scope: all eight D002 Data Engineering and Architecture exact role keys in the previously unsupported queue. Global-only source review; no canonical edits; no subgroup-based inference; no role→specialization decisions.

## Exact-key recommendations

All eight source role keys exist in the current `role_library_v3_cleaned.json` seed input and have task descriptions. D002’s current `domain_meta.json` description is specifically about systems that collect, store, move, and structure organizational information. For the eight records below, checked-in task text describes broad ICT/business analysis or computing research, but does not establish data infrastructure tasks.

| Exact key | Recommendation | Why | Other exact mappings |
|---|---|---|---|
| `D002|ICT business analysis manager` | `preserve_exclude` | Business-system change analysis and ICT functional requirements; no data platform tasks stated | D009/D010/D033/D056 keys exist; not adjudicated |
| `D002|ICT business analyst` | `preserve_exclude` | Organizational process/system requirements; no data architecture/pipeline duties stated | D009/D010/D033/D056; not adjudicated |
| `D002|ICT change and configuration manager` | `preserve_exclude` | ICT asset lifecycle change/configuration, not data infrastructure | D001; not adjudicated |
| `D002|ICT consultant` | `preserve_exclude` | General ICT tools/systems and technology advice | D009/D010/D033/D056; not adjudicated |
| `D002|ICT research consultant` | `preserve_exclude` | ICT research, survey analysis, reporting and recommendations | D009/D010/D033/D056; not adjudicated |
| `D002|ICT system analyst` | `preserve_exclude` | General IT system analysis and solution design | D009/D010/D033/D056; not adjudicated |
| `D002|ICT system developer` | `preserve_exclude` | General organizational support systems, testing and troubleshooting | D009/D010/D033/D056; not adjudicated |
| `D002|computer scientist` | `preserve_exclude` | Broad computer-science research without a specific data-engineering task profile | D003/D009/D010/D033/D056; not adjudicated |

`preserve_exclude` means keep the underlying source role and exact-key provenance, but do not expose this D002 relationship as a student-ready route unless data-specific task evidence is added. The other mappings remain untouched and unendorsed; same-title duplication is not evidence of a valid parent fit.

## Current-source freshness

The batch validates against the seed generator’s actual input `role_library_v3_cleaned.json`, not only the Oct 3 audit snapshot. Across the full 543-key old queue, 432 keys still occur in that input and 111 are absent. The absent keys remain a separate stale-key lineage queue; they are not silently treated as current canonical corrections.

## Reproduction

```powershell
python -m unittest data.career-mapping._audit.role_fit_lanes_2026_10_05.GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06.test_batch_002_d002_recommendations
```

Tests check exact queue coverage, current source-key/task existence, live D002 scope, explicit preserve-and-exclude behavior, retained peers, global-only scope, and no canonical writes. Evidence came from exact ESCO source identifiers already attached to the queue plus checked-in task text. The web interface for several ESCO identifiers was temporarily inaccessible, so this batch does not claim a live revalidation of every ESCO record.

## Progress ledger

- Batch 001 (D001): 5 / 5 recommendations; 3 link removals and 2 proposed exact reclassifications.
- Batch 002 (D002): 8 / 8 recommendations; 8 preserve-and-exclude recommendations.
- Total dispositions in this new reconciliation lane: **13 exact keys**. No canonical changes have been made.
- Next: advance by current domain ID, recheck exact role keys against the seed input, and separate queue entries absent from the current seed from active mapping decisions.
