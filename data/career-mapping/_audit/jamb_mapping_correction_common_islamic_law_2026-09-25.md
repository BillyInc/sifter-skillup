# Common and Islamic Law overlay correction — 2026-09-25

This is a bounded, evidence-backed correction discovered during the full 420-identity audit. It does not close the overall catalogue review.

## Decision

The Nigerian review overlay had marked five domains publishable for JAMB **Common and Islamic Law**. The CCMAS evidence supports the programme's direct Legal Practice domain relationship. It does not support four other broad destination domains from the cited course anchors:

| Domain | Previous anchor | Disposition |
|---|---|---|
| D163 Intellectual Property Law, Patents | LAW 101, English for Legal Writing; IP appears only in an optional course menu | Removed as unsupported for the universal programme route |
| D078 Social Sciences | ICL 402, Islamic Company Law (Islamic economics/banking/finance outcomes) | Removed; no mapped social-research or quantitative subgroup evidence |
| D151 Criminology, Criminal Justice | Criminal-law course(s) | Removed; legal rules/procedure do not establish criminology, probation, investigation, policing or corrections preparation |
| D150 Religious Ministry, Theology | Islamic-law/jurisprudence courses | Removed; religious-law study does not establish theology or ministry preparation |
| D037 Legal Practice | Multiple law methods and substantive law courses | Retained as a direct, domain-level curriculum relationship; this does not certify an individual legal occupation |

Primary curriculum source: NUC [Law CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf), including LAW 101 (printed p. 10), the Common and Islamic Law programme description/course table (printed pp. 53–58), and the optional-course menu (printed p. 52). The specific course/outcome comparisons and downstream limits are recorded in [`agent-01-increment-027-rows-001-010-enriched-overlay-claim-review-2026-09-25.md`](jamb_ccmas_mapping_quality_2026-09-24/agent-01-increment-027-rows-001-010-enriched-overlay-claim-review-2026-09-25.md).

## Local materialization and verification

- Overlay source corrected with [`reconcile_common_islamic_law_overlay.py`](reconcile_common_islamic_law_overlay.py); unsupported edges are explicitly `removed_unsupported_candidate`, not left as review-only student links.
- Active local `jamb_domain_map.json` regenerated: **420 identities, 1,728 links; Common and Islamic Law now has only D037 (direct)**.
- Materializer result: 27 `ready`, 113 `review_required`; Nigerian overlay rows published: 1, links published: 1, links removed: 4; remaining overlay conflicts: 85 rows / 199 link occurrences / 65 distinct missing domain IDs.
- Regression added to `test_jamb_ccmas_materializer.py`; focused test command passed: **6 passed**.
- No SQL, career seed, database, endpoint, or UI was changed. This local correction is not evidence that other identities, offering contexts, domains, subgroups or roles are audited or closed.
