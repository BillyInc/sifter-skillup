# Specialization lane checkpoint 012 — D003–D084

Date: 2026-10-05

## Status and boundary

- Assigned lane: 82 domains, D003–D084.
- Earlier checkpoint 011 source-reviewed D003–D014; this continuation adds D015.
- Local source-reviewed coverage: **13/82** (D003–D015); next cursor: **D016**.
- Jason's separate lane is D057–D091. Do not duplicate those domain reviews.
- This lane decides only whether the parent domain warrants distinct, correctly bounded, student-facing areas of specialization and what count/labels are defensible. It does not assign roles to the specializations.
- Role-to-parent-domain decisions remain independent; do not infer fit from ISCO family or current subgroup membership. No canonical taxonomy or Supabase data was changed.

## D015 — Accounting

- Added a six-area evidence-informed synthesis to `domain_specialization_review_2026_10_03.json`: Financial Accounting and Reporting; Audit and Assurance; Tax Accounting and Compliance; Management and Cost Accounting; Forensic and Investigative Accounting; Public-Sector and Nonprofit Accounting.
- Existing three ISCO-derived buckets (professional accounting/audit, bookkeeping/accounts support, payroll/financial clerks) are documented as legacy current state only; their labels, count and role memberships did not determine the recommendation.
- Evidence added: ACCA career/practice guidance, IAASB international audit/assurance mandate, and IFAC/IPSASB public-sector reporting framework. Their limits are explicit: sources do not prescribe this exact taxonomy/count, national law/reporting/credential requirements vary, and no role links are approved.
- Tax and public-sector rules must be localized in later student guidance. Sustainability, payroll, insolvency, grants and accounting systems remain themes or revisit candidates, not automatic standalone areas.

## Verification

- `python -m json.tool data/career-mapping/_audit/domain_specialization_review_2026_10_03.json` — passed.
- `python -m pytest data/career-mapping/_audit/test_domain_subgroup_role_taxonomy_audit_2026_10_03.py -q` — **25 passed**.
- Refreshed catalogue inventory: 168 domains; 26 source-reviewed specialization recommendations; 142 domains still without a source-reviewed set. This is inventory status, not evidence that all recommendations have external academic sign-off or are canonically implemented.

## Next

Continue locally at **D016 Electrical Engineering**, then proceed through the disjoint assigned local slice D016–D056. For every domain, check international/cross-regional primary sources, domain scope, count, boundaries, plain labels, and topics better treated as methods/themes; record uncertainty and local variants explicitly. Keep role-to-specialization work deferred.
