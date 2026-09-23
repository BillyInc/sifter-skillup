# Full-population downstream audit checkpoint

Generated: 2026-09-21  
Status: **local audit complete; external gates open**  
Mode: read-only local audit. No SQL, browser, UI, seed transport or external
ledger action was taken for this checkpoint.

## Current population

- **237** canonical programmes: **236** generic contracts plus the reviewed
  Sociology contract.
- **420** JAMB identities.
- **1,344** active programme-to-domain links: 206 direct, 1,074 functional and
  64 adjacent.
- **0** programmes without an active domain mapping.

## Current downstream continuity

- **0** active links lack a domain registry record.
- **0** linked domains lack a traced subgroup or role.
- Route audit: **237/237** programmes covered, with **1,344** domain routes,
  **3,580** subgroup routes and **46,941** role routes across **5,668** unique
  contexts; all smoke fixtures are present.
- **5,209** canonical roles are traced; **119** lack a work-profile row, while
  **0** lack every recorded anchor. The 119 remain an admin/source-review
  continuity queue, not a student-safe fallback.
- Role learning-core audit: raw source arrays exceed the student cap for 3,910
  roles, but all emitted student rows remain within the 12-essential/5-optional
  bound.

## Current source/link/relationship state

The canonical compressed contextual catalogue currently audits to **121,377
items** and **408,163 relationships**. All 121,377 items are source-backed;
5,253 have item links, 116,116 have explicit no-link state, and 8 remain
review-required. There are **0** missing source-reference rows, **0** missing
locator rows, **0** invalid item-link URLs and **0** ownership mismatches.

Relationships include **405,858 source-backed** rows and **2,305
not_established/unresolved** rows. The latter remain staff review evidence and
must not render as student relationships.

## Admin/JAMB queues

- Programme resource review: **237 review-required**.
- Programme relationship review: **26 review-required**, **211
  not-established**.
- Programme admin render acceptance: **237 pending**.
- JAMB component/source reference gaps: **0 / 0**; **86** JAMB identities remain
  review-required.

The **126,414 items / 422,739 relationships** figures belong to the separate
broad enrichment queue inventory. The canonical manifest/current compressed
catalogue remains the student-scaling source of truth at **121,377 / 408,163**;
the inventories are not merged.

## Boundary status

The local static student/admin boundary checks are recorded as passing for
sanitised student loaders, raw admin evidence access, review/no-link filtering,
bounded role learning rows and guarded external links. Browser proof, live
Supabase payload verification, URL reachability and SQL deployment remain open.

## Final local decision

The local full-population audit is complete. Scaling/student approval remains
open because 237 resource queues, 26 review-required and 211 not-established
programme relationship states, 2,305 unresolved contextual relationships, full
rendered admin acceptance, browser proof and live Supabase verification remain
outstanding.

The only bounded implementation change was an audit-fixture correction from
`Medical Sciences::Nursing` to canonical `Allied Health Sciences::Nursing
Sciences`. No UI or SQL change was justified.

## Files changed by this checkpoint

- `data/career-mapping/_audit/full_population_downstream_checkpoint_2026-09-21.json`
- `data/career-mapping/_audit/full_population_downstream_checkpoint_2026-09-21.md`
- `data/career-mapping/_audit/full_population_downstream_admin_audit_2026-09-21.py`
- `data/career-mapping/_audit/full_population_downstream_admin_audit_2026-09-21.json`
- `data/career-mapping/_audit/full_population_downstream_admin_audit_2026-09-21.md`
- `data/career-mapping/_audit/audit_downstream_programme_routes_2026-09-19.py`

No implementation change is justified by this checkpoint alone. The next audit
step is to reconcile the two contextual totals and trace card-summary/friendly-
title fields, role learning-needed fields, relationship grouping and admin
provenance paths across the full local contract before considering a bounded
non-UI/non-SQL fix.
