# D078 social-behaviour area boundary correction — 2026-10-08

## Decision

The D078 area formerly labelled **Psychology and Social Behaviour** is now labelled **Social Behaviour and Interaction**. Its stable key, `D078:psychology-social-behaviour`, is deliberately retained so existing role-route references do not break. The label and boundary are narrowed so learners do not mistake this social-science area for the separate canonical **Psychology and Counselling** domain, D064.

The area covers social-science study of behaviour and interaction in groups, institutions and communities. It does not cover clinical assessment, counselling, psychotherapy, diagnosis, psychological treatment, or professional psychology licensure. Those practice scopes belong under D064 or another specifically supported domain. This correction changes no role assignment and does not infer that a role fits merely because it was previously attached to this area.

## Evidence and limits

- UNESCO Institute for Statistics, [ISCED-F 2013 detailed field descriptions](https://uis.unesco.org/sites/default/files/documents/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf), describes social and behavioural sciences and separately identifies fields including psychology, sociology, economics, political science and demography. It supports recognizing related but distinguishable fields; it does not prescribe this product's exact area count or route assignments.
- UNESCO Institute for Statistics, [Social Sciences (for R&D Data)](https://uis.unesco.org/node/3080050), places psychology/cognitive sciences and sociology among the social-science fields. This supports the broad D078 umbrella, not the transfer of professional psychology practice into D078.
- The repository's D064 record defines **Psychology and Counselling** around how people think, feel and behave, psychological assessment/support, and counselling practice. D064 already has practice-oriented areas such as clinical, counselling, educational/developmental, health, forensic and work/organizational psychology.

## Changes made

- Kept the existing area ID to preserve references.
- Changed the D078 area label to **Social Behaviour and Interaction**.
- Replaced the broad description and boundary with a social-science scope and explicit D064 exclusions.
- Updated the specialization catalogue's corresponding recommendation record and retained the former label as `legacy_label` for traceability.
- Did not edit role records, the matcher, API/UI, or SQL. Existing role-area references still require their previously recorded task-based fit and are not re-approved by this naming correction.

## Implementation

The byte-preserving updater is [apply_d078_social_behaviour_boundary_fix_2026_10_08.py](</C:/Users/USER/Documents/sifter-skillup-integrated/data/career-mapping/_audit/apply_d078_social_behaviour_boundary_fix_2026_10_08.py>). It validates exact unique source blocks before changing the legacy-encoded `domain_structure.json`, avoiding a lossy whole-file reserialization.

The catalogue-wide review is being recorded separately in [DOMAIN_AREA_PARENT_OVERLAP_AUDIT_2026_10_08.md](</C:/Users/USER/Documents/sifter-skillup-integrated/docs/manual-review/DOMAIN_AREA_PARENT_OVERLAP_AUDIT_2026_10_08.md>) and its machine-readable scan. This D078 correction is the confirmed first case, not a claim that every candidate overlap has already been resolved.
