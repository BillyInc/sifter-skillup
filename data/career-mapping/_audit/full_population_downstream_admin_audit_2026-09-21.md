# Full-population downstream/admin audit

Generated: 2026-09-23
Mode: read-only local audit; no SQL, UI, seed transport, external ledger or browser proof was changed.

## Population

- **237** canonical programmes (**236** generic + **1** Sociology).
- **420** JAMB identities.
- **1344** active programme-to-domain links.

## Gate results

- `programme_domain_subgroup_role_continuity`: **PASS**.
- `curriculum_card_summary_contract`: **PASS**.
- `friendly_titles_and_summaries_static_contract`: **PASS**.
- `role_learning_needed_skills`: **PASS**.
- `source_and_link_state`: **PASS**.
- `relationship_grouping_and_student_edge_gate`: **PASS**.
- `admin_provenance_and_review_queues`: **PASS**.
- `student_safe_filtering`: **PASS**.

## Continuity

- 237/237 programme records have complete downstream route coverage.
- 1,344 domain routes, 3,580 subgroup routes and 46,941 role routes span 5,668 contexts.
- 119 role records lack a work-profile row; 0 lack every recorded source anchor. This remains an admin/source-review queue.

## Open queues

- Programme resource review: 237 review-required.
- Programme relationship review: 26 review-required and 211 not-established.
- Contextual relationships: 2,305 not-established/unresolved; they remain blocked from student guidance.
- Programme admin-render acceptance: 237 pending; rendered browser proof is not claimed.
- JAMB review-required identities: 86.

## Tool and source boundary

- 1571 generic/category aggregate tool rows and 4089 domain↔subgroup repeats remain staff-review-only; D078 Microsoft Office aggregate rows: 3.
- Canonical contextual catalogue: 121377 items / 408163 relationships.
- Separate broad enrichment inventory: 126414 items / 422739 relationships. It is not merged into the canonical student count.

## Decision

Local contract audit: **complete**. Student/scaling approval: **not approved** pending review-queue closure, full rendered admin acceptance, browser proof and manual Supabase deployment/post-apply verification.

Bounded change made: corrected the route-audit Nursing smoke fixture from the stale `Medical Sciences::Nursing` key to canonical `Allied Health Sciences::Nursing Sciences`. No UI or SQL was changed.
