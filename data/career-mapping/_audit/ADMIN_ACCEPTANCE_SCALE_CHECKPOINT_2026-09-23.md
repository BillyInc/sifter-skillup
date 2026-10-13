# Admin acceptance scaling checkpoint (2026-09-23)

Incremental, read-only checkpoint for the admin-acceptance lane. This records
the local evidence consumed before the record-level accepted-view audit is
added. It does not change implementation, SQL, seed transport, or browser
proof, and it does not approve live or student exposure.

## Current scope

- Canonical programmes: **237** (**236** generic + **1** Sociology).
- Canonical JAMB identities: **420**.
- Active programme-domain links: **1,344**.
- Contextual item rows scanned by the existing local audit: **121,377**.
- Contextual relationship rows scanned by the existing local audit: **408,163**.

## Current state counts

- Contextual items: **5,253 linked**, **116,116 no-link**, **8 review-required**.
- Contextual relationships: **405,858 source-backed**, **2,305 not-established**.
- Programme admin review: **237 pending full-population render acceptance**.
- JAMB review-required identities: **86**.

## Progress

- Existing population and source/link-state audits are available and cover all
  237 programmes and 420 JAMB identities.
- Existing admin contract checks verify explicit provenance fields, ownership
  and queue-state markers in the dashboard contract.
- Record-level verification that an accepted dashboard view contains only
  explicitly approved, owner-matching, traceable rows is **in progress**.
- Negative verification that `review_required`, `no_link`,
  `not_established`, and `audit_only` rows remain internal is **in progress**.

## Boundary

The lane is admin acceptance only. No runtime implementation, SQL, browser
proof, live payload, URL reachability, or student-exposure approval is claimed.

Next artifact: `audit_admin_acceptance_scale_2026-09-23.py` with its generated
JSON/Markdown report and focused regression test.
