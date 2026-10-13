# Source-state coverage checkpoint (2026-09-19)

This is a compact, read-only checkpoint assembled from the existing handoff and
checked-in audit summaries. It does not read the large generated catalogues,
fetch URLs, apply SQL, or change implementation/data.

## Coverage snapshot

| Layer | Source-backed / contract-compliant evidence | `review_required` / `no_link` / `not_established` | Still unverified |
| --- | --- | --- | --- |
| Curriculum | 237 programmes and 81,429 course-outcome rows are covered by the local contract; curriculum locator gaps, state gaps and raw-legacy fallback risk are all 0. In the original CCMAS review, 119 flagged rows were source-backed. | 3 CCMAS rows are review-only; the cross-programme review inventory also records 220 `partial` and 6 `not_established` findings. | One checked original row has no extracted page; URL reachability, live payload deployment and browser acceptance are unverified. |
| Resources | Sociology has 51 reviewed resource rows with valid HTTPS syntax; 27 contextual items have an item-specific reviewed resource. | 698 Sociology contextual items retain an explicit honest `no_link` state. Targeted enrichment batches retain bounded `review_required` records rather than promoting uncertain links. | The all-programme catalogue has 126,414 rows without an explicit item-level link/no-link label; this is an evidence gap, not proof that no resource exists. Reachability was not tested. |
| Contextual items | Sociology has 725 contextual items reported as source-backed, owned, and carrying source references/locators. Across the scaled catalogue, missing/mismatched ownership, missing/unsupported state, role-aggregate leakage, and missing source locators are each 0. | 5,668 scaled context rows have reported audit issues; broad imported catalogue rows remain `audit_only` until item-level review. | The current catalogue schema does not provide a complete explicit link-state field, so the full 126,414-row population is not student-approval evidence. |
| Relationships | Sociology has 2,519 normalized relationships reported as source-backed, resolved, and duplicate-free. The scaled catalogue contains 422,739 relationship rows; it has 0 duplicate rows and 0 relationships missing source references. | The scaled catalogue contains 2,305 relationships with unresolved endpoints or `not_established`/review state; none may render as student relationships. | The remaining relationship rows are not treated as fully verified merely because they are not in that backlog; source interpretation and URL reachability still require end-of-phase review. |

## Decision boundary

The verified evidence supports local audit/scaling work only. `review_required`,
`no_link`, `not_established`, and `audit_only` remain fail-closed and are not
student-facing approvals. External enrichment is still required for unresolved
relationships and unlabeled resource links, with source URLs/locators retained
for every promoted record. Supabase SQL, live payload verification, and browser
acceptance remain deferred gates.

**Status: local source-state checkpoint complete; production/data acceptance is not complete.**

### Inputs used

- `docs/GOAL_RESUME_STATUS_AND_AGENT_HANDOFF_2026-09-18.md`
- `data/career-mapping/_audit/PROGRAMME_SCALING_CONTRACT_AUDIT_2026-09-19.md`
- `data/career-mapping/_audit_sociology_student_guidance_contract.py` output summarized in the handoff
