# Global role→parent-domain residual checkpoint 001

Date: 2026-10-06

## Scope and baseline

- Exact unresolved baseline: **44 role keys**, taken from the current `UNRESOLVED_44/unresolved_44_parent_fit_register.json`.
- Batches 001–002 assess **14 unique exact keys** using occupational task descriptions, not ISCO/subgroup membership or role-title resemblance.
- Remaining at this checkpoint: **30 exact keys** by set difference. This does not imply the full 3,919-row audit is signed off; the baseline residual extractor and all prior lane artifacts still require a final exact-key reconciliation.
- Jurisdiction: **global-only**. Nigerian-specific context is intentionally deferred.
- No canonical files were edited. No role→specialization decisions were made.

## Batch 001 dispositions

| Role key | Disposition | Basis |
|---|---|---|
| `D001|Full Stack Engineers` | supported | O*NET software-development tasks align to software engineering; source does not standardize “full stack” as a universal title. |
| `D001|Software and Applications Developers` | supported | O*NET tasks explicitly cover designing, developing, testing and maintaining software. |
| `D002|Big Data Specialists` | conditional | Data-warehouse/platform engineering fits; the broader label may instead describe analytics or data science. |
| `D002|Database and Network Professionals` | conditional | Database architecture fits; network administration is a distinct task family, so the combined label is not wholly supported. |
| `D003|AI and Machine Learning Specialists` | conditional | O*NET supports applied ML/data-model tasks but not the whole breadth of the combined role label. |
| `D005|DevOps Engineers` | conditional | O*NET lists the title under software developers, but only delivery-pipeline/platform/operations tasks are shown to fit D005. |
| `D007|Designers, All Other` | unsupported | Residual category has no medium/task scope establishing UI/UX fit. |
| `D007|UI and UX Designers` | supported | O*NET digital-interface task profile explicitly covers usability and user experience. |
| `D009|Data Analysts and Scientists` | conditional | Statistical/model-based analysis fits; the combined label can also cover generic reporting/operations analytics. |

Full per-key task evidence, rationale, URLs and limitations are in `batch_001_decisions.json` and `batch_002_decisions.json`.

## Batch 002 dispositions

| Role key | Disposition | Basis |
|---|---|---|
| `D013|Financial and Investment Advisers` | conditional | Investment/asset-management advice fits; general financial planning is broader. |
| `D014|Risk Management Specialists` | conditional | Quantitative financial/insurance risk fits; general enterprise risk does not necessarily fit actuarial science. |
| `D016|Electrotechnology Engineers` | supported | Electrical/electronic system design and testing align with electrical engineering. |
| `D016|System Engineers` | conditional | Fit depends on electrical/electronic system tasks; the generic label also spans IT systems. |
| `D021|Architects and Surveyors` | conditional | Architecture fits directly; surveying is broader and only conditionally fits built-environment/urban-planning scope. |

## Sources and limits

O*NET task profiles provide representative, task-level corroboration but are US-based and are not universal title standards. WEF Future of Jobs is used only to confirm the source identity/trend category, never as task evidence. The ILO ISCO framework grounds the task-based interpretation of occupational fit; its classification membership is not treated as proof of domain fit.

## Test gate

`pytest data/career-mapping/_audit/role_fit_lanes_2026_10_05/UNRESOLVED_44_GLOBAL_CONTINUATION/test_batch_001_exact_keys.py` must pass. The test asserts exact-key subset coverage across every batch, required evidence fields, global-only scope and absence of canonical edits.

## Next

Continue with the remaining 30 exact keys in disjoint, source-backed batches. Recompute residual by exact-key set difference after each batch. Preserve `unresolved` if authoritative occupational task evidence does not support a defensible decision.
