# Unsupported role→domain reconciliation — batch 006

Date: 2026-10-06  
Scope: all 12 active D009 Data Science unsupported exact keys. Global task evidence only. No canonical edits; no ISCO/subgroup inference; no role→specialization.

## Exact-key outcomes

| Exact key | Recommendation | Result |
|---|---|---|
| `D009|ICT consultant` | `preserve_exclude` | Generic ICT advice; no data-science task established. |
| `D009|ICT integration tester` | `reclassify_exact` | Existing supported D001 software testing link. |
| `D009|ICT system architect` | `preserve_exclude` | System/data architecture wording is too broad to infer D009 or D002 data science/engineering; no alternative guessed. |
| `D009|ICT system developer` | `preserve_exclude` | General system support/development; data-science tasks absent. |
| `D009|ICT system tester` | `reclassify_exact` | Existing D001 conditional exact-key review; conditionality preserved. |
| `D009|ICT test analyst` | `reclassify_exact` | Existing supported D001 software-test lifecycle mapping. |
| `D009|IT auditor` | `remove_link_only` | Systems assurance/control, not data science; no replacement inferred. |
| `D009|blockchain architect` | `reclassify_exact` | Existing D056 blockchain architecture role. |
| `D009|embedded system designer` | `reclassify_exact` | Recommend new D006 exact key; embedded-control architecture directly matches D006’s current IoT/embedded scope. |
| `D009|enterprise architect` | `preserve_exclude` | Enterprise-wide architecture is not inherently data science; D002 and other duplicates not auto-selected. |
| `D009|green ICT consultant` | `remove_link_only` | Green ICT strategy is not data science. |
| `D009|software tester` | `reclassify_exact` | Existing supported D001 software testing mapping. |

The O*NET Software QA profile was live-checked for the testing-task distinctions; it explicitly describes developing/executing software tests, test plans, defect documentation, and test modifications. It is US-scoped and used only for task interpretation, not global prevalence. ESCO descriptions/identifiers remain attached to each exact current source record. D001 decisions are imported only as the exact independent status (supported or conditional), not inferred from ISCO membership.

## Reproduction

```powershell
python -m unittest data.career-mapping._audit.role_fit_lanes_2026_10_05.GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06.test_batch_006_d009_recommendations
```

## Cumulative progress

- Batches 001–006: **32 active exact-key decisions** (D001 5, D002 8, D005 1, D007 4, D008 2, D009 12).
- Of the original 543 unsupported exact keys, **432** exist in current `role_library_v3_cleaned.json`; **111** are absent and remain stale-lineage cases.
- Current active undecided remainder: **400**. This is not a claim that all will be removed; every one still needs exact task review.
- No canonical data changes have been made.
