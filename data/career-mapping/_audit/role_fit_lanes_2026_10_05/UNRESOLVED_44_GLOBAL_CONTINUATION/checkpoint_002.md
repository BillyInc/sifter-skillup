# Global role→parent-domain checkpoint 002

Date: 2026-10-06. Continuation of the exact-key residual, global-only.

## Reconciled counts

- Baseline residual: **44 exact `role_key`s**.
- Batch 001: **9** unique keys; Batch 002: **5**; Batch 003: **7**.
- Assessed cumulatively: **21/44 unique exact keys**.
- Remaining by exact-key set difference: **23/44**.
- Cumulative dispositions: **8 supported, 12 conditional, 1 unsupported**.
- Batch 003 dispositions: **4 supported, 3 conditional**.
- No overlap between batches; all 21 keys are members of the 44-key baseline.
- Jurisdiction: global-only. No Nigerian-specific search or claims.
- No canonical taxonomy edits and no role→specialization decisions.

## Batch 003 exact keys

1. `D006|Internet of Things Specialists` — conditional; WEF role trend label lacks task detail.
2. `D006|IoT data analyst` — conditional; IoT telemetry analytics is in-scope, while generic analytics alone is not.
3. `D006|IoT security specialist` — supported; IoT device/data/ecosystem security tasks are directly evidenced.
4. `D006|IoT solutions architect` — supported; end-to-end IoT architecture tasks are directly evidenced.
5. `D006|IoT systems integrator` — supported; integrating IoT products and ecosystems is directly evidenced.
6. `D006|edge computing engineer` — conditional; edge computing fits when applied to IoT devices/data, not edge infrastructure generally.
7. `D006|embedded systems engineer` — supported; embedded firmware/microcontroller engineering fits the parent’s embedded-systems scope.

Per-key source URLs, task statements, rationale and limitations: `batch_003_decisions.json`. O*NET task profiles are US-based supporting occupational evidence; NIST, ETSI and IETF/IRTF technical sources establish IoT, edge and device-security task contexts but are not universal occupational title standards. RFC 9556 is informational research-group work, not an IETF standard.

## Verification

Run `python -m pytest -q data/career-mapping/_audit/role_fit_lanes_2026_10_05/UNRESOLVED_44_GLOBAL_CONTINUATION/test_batch_001_exact_keys.py`. It checks exact-key membership/uniqueness, batch scope flags, source/evidence fields and cumulative counts. Latest result: **3 passed**.

## Next cursor

Continue from the remaining exact keys beginning `D009|Mathematical Science Occupations, All Other`, then the D010 residuals, without re-reviewing these 21 completed keys. Recompute the baseline difference before each new batch.
