# Specialization lane checkpoint 013 — D003–D084

Date: 2026-10-05

## Status and boundary

- Assigned lane: 82 domains, D003–D084.
- Local source-reviewed coverage: **14/82 (D003–D016)**; next cursor: **D017**.
- The parallel specialization lane is D057–D091; do not duplicate it.
- These are source-backed taxonomy recommendations only. No canonical subgroup records or role memberships have been changed. No role-to-specialization links are being assigned.

## New local decisions

### D015 — Accounting

Six candidate areas were added to the review register: Financial Accounting and Reporting; Audit and Assurance; Tax Accounting and Compliance; Management and Cost Accounting; Forensic and Investigative Accounting; Public-Sector and Nonprofit Accounting. ACCA, IAASB and IFAC/IPSASB sources and limitations are registered. Existing ISCO buckets did not set the count; finance and public administration boundaries are explicit; no roles are approved.

### D016 — Electrical Engineering

Five candidate areas were added: Power and Energy Systems; Electronics and Semiconductor Devices; Communications and Signal Processing; Control, Instrumentation and Measurement; Embedded and Computer Hardware Systems. ABET criteria, IET Inspec classification and IEEE technical-area material support the broad directions. Application overlap with D019 Renewable Energy Engineering, D050 Industrial Automation, D001 Software Engineering and communications is explicitly bounded; no current roles are approved.

## Verification

- JSON parse check passed.
- `python -m pytest data/career-mapping/_audit/test_domain_subgroup_role_taxonomy_audit_2026_10_03.py -q` — **25 passed**.
- Catalogue inventory refreshed: 168 domains; 26 total source-reviewed specialization recommendations; 142 remain without a source-reviewed set. Recommendation and implementation/sign-off are separate statuses.

## Next

Continue at D017 Mechanical Engineering and proceed through the local disjoint range D017–D056. Apply the same global-source, count/boundary, student-label, cross-domain and no-role-assignment gates. Record country-specific standards only as localized variants.
