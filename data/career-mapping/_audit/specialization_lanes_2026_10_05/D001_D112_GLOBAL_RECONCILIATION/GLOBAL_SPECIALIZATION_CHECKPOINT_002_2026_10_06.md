# Global specialization reconciliation checkpoint 002 — 2026-10-06

Scope: global specialization recommendation reconciliation. No Nigeria-specific research, canonical taxonomy edits, role-to-specialization assignments, or implementation.

## Progress

- Re-ran the 168-domain artifact coverage and candidate-list comparison.
- Reconciled the seven material cross-artifact candidate-list conflicts: **D098, D118–D123**. The detailed recommendations, boundaries, source claims/limits, and remaining questions are in `GLOBAL_SPECIALIZATION_EXCEPTION_RECONCILIATION_2026_10_06.md/.json`.
- D098's three-versus-four conflict is explicitly reconciled to a four-area internal recommendation. The standalone metrology-card boundary remains open; no shared-register/canonical change was made.
- D003's five candidate areas are independently supported as a compact internal synthesis by the joint CS2023 AI knowledge area and AAAI technical taxonomy. Its candidate set is reconciled; the current parent description remains a scope gate because it omits knowledge/reasoning, planning, agents and robotics. No canonical parent-definition edit was made.
- Added a structured review-residual extractor across the 168 domain IDs. After excluding three cases reconciled in this report (D118–D120), it reports **97 domains with an explicit unresolved/provisional status or dedicated residual field**; this is a work queue, not a count of confirmed taxonomy errors. Four are D053–D056, which are locally owned and excluded from this disjoint lane; **93 residual-status domains remain outside that local slice**. Four additional domains have an explicit no-universal/global-set recommendation and are listed separately (with ambiguous/inconsistent parent cases also appearing in the residual queue).
- The 97 residual-status domains are partitioned by their primary status signal: **73 parent/scope/title/boundary**, **11 role/cross-domain dependency**, and **13 candidate-count/source/route validation**. This is a deterministic triage label, not a severity judgment. See the JSON for exact IDs.
- The seven candidate conflicts and 100 review-status residuals are distinct measures and must not be added as if they were unique issue counts.

## Protected local slice

D053–D056 are owned by the local reviewer. This lane did not edit their review JSON/Markdown. The global report reads the current grouped review only for catalogue accounting and identifies the slice as a separate owner lane.

## Verification

- Reconciliation extractor tests plus artifact coverage: **11 passed** in the disjoint focused run.
- D003's CS2023/AAAI evidence URLs were live-checked against the ACM/IEEE-CS/AAAI curriculum site and AAAI-26 technical taxonomy page; those sources support recognized AI knowledge areas, not a mandated five-card count.
- In an earlier combined run, the separate D053–D056 grouped-review test had **1 failure**: its assertion expects D054–D056 candidate-count statuses all to contain `provisional`; current local edits have changed at least one status. This lane did not modify those artifacts or that test. It needs local-owner review, not an automatic test weakening here.
- No live external URL re-fetch was performed in this increment. For D118–D123, the report records authoritative/global source locators and explicit limits; several sources are technical frameworks or comparative curricula, not authorities prescribing subgroup counts.

## Next work

1. Continue the disjoint residual queue outside D053–D056, starting with explicit parent-scope/count/boundary conflicts rather than re-reviewing clean candidate sets.
2. For each residual, record whether the candidate set is reconciled, the exact unresolved evidence gap, or a justified no-specialization/flat-path recommendation; do not infer subgroup membership from ISCO.
3. Revalidate original source locators for the remaining carry-forward recommendations when a specific evidence claim depends on them.
4. Keep all recommendations noncanonical. Local D053–D056 work, the Nigerian pass, and all canonical edits remain out of scope.

Reproduce the disjoint checks:

```powershell
python data/career-mapping/_audit/specialization_lanes_2026_10_05/D001_D112_GLOBAL_RECONCILIATION/audit_global_specialization_exception_reconciliation_2026_10_06.py
python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D001_D112_GLOBAL_RECONCILIATION/test_global_specialization_exception_reconciliation_2026_10_06.py data/career-mapping/_audit/test_specialization_review_artifact_coverage_2026_10_06.py
```
