# Partition 01 append-only map-state reconciliation — rows 001–010

Audit date: 2026-09-25. This addendum updates checkpoint 025 after the active `data/career-mapping/jamb_domain_map.json` was regenerated fail-closed. The **active file is current truth**. `data/career-mapping/_audit/jamb_domain_map_before_fail_closed_2026-09-25.json` is used only as the exact before-snapshot for deltas; it is not treated as current.

## Observed before/after state

| Row | JAMB identity | Before snapshot links | Active links now | Active status / delta |
|---:|---|---|---|---|
| 1 | Civil Law | D037 direct | D037 direct | Unchanged; `ready_partial`. |
| 2 | Islamic Law/Sharia Law | D037 direct, D078 functional, D150 functional | Same 3 | Unchanged; `ready_partial`. |
| 3 | Common and Islamic Law | D037 direct, D163 adjacent, D078 functional, D151 functional, D150 functional | **0** | `review_required`, overlay conflict D163 absent from canonical candidate set; all five prior links fail closed. |
| 4 | Public and International Law | D037 direct, D078 functional, D151 functional, D045 functional | Same 4 | Unchanged; `ready_partial`. |
| 5 | Criminology and Security Studies (Law block) | D151 direct, D077 direct, D063/D078/D130/D037/D028 functional, D045 adjacent | **0** | `review_required`, overlay D045 absent from canonical candidate set; all eight prior links fail closed. |
| 6 | Common Law | D037 direct, D163/D151/D065/D045 functional | D037 direct, D151 functional, D045 functional | D163 and D065 removed; `ready_partial`. |
| 7 | Criminology and Penology | D151/D077 direct; D063/D078/D037/D045/D028 functional | Same except **D045 absent** | D045 removed; six links remain; `ready_partial`. |
| 8 | Criminology | Same seven as row 7 | Same except **D045 absent** | D045 removed; six links remain; `ready_partial`. |
| 9 | Criminology and Security Studies (Social Sciences block) | Same eight as row 5 | **0** | `review_required`, overlay D045 absent from canonical candidate set; all eight prior links fail closed. |
| 10 | Demography and Social Statistics | D078/D063/D014/D029/D130/D072/D009/D045/D041 | **0** | `review_required`, overlay D014/D029/D041/D045 absent from canonical candidate set; all nine prior links fail closed. |

Neither `ready_partial` nor `review_required` is a semantic verdict. This addendum records dispositions from course/outcome review and still-open JAMB PDF table verification; it does not restore or mutate map links.

## Evidence-backed reconciliation recommendations (no map edits)

“Candidate restore” means a row-level proposal for reconciliation after the relevant acceptance evidence is fully recorded—not an instruction to write the active map now.

| Row | Evidence-based disposition of before-snapshot links / fail-closed current set |
|---:|---|
| 1 | Keep D037 direct as current and course-supported at the law-domain level. Descendant roles remain individually unconfirmed. |
| 2 | Keep D037 direct. Remove D078 from confirmed candidates (the only mapped anchor is Islamic Company Law, unrelated to the active social-research/quantitative groups). Downgrade D150 to optional adjacent religious-law context at most, not a student occupational path. Current map has not performed these semantic downgrades; this is open evidence review. |
| 3 | **D037 direct is a candidate restore**: the full Common & Islamic Law CCMAS package directly supports law. D151 should be adjacent, not functional, based on general criminal-law study rather than criminology practice. D078 lacks applicable research/quantitative course evidence; remove from confirmed candidate set. D150 is adjacent academic/religious-law context only. D163 is optional-menu evidence (Law of Intellectual Property), not a universal course or proven outcome; keep quarantined/downgraded as optional adjacent and do not confirm. Thus candidate set should be amended to permit D037 direct; no other prior link is restored as confirmed. |
| 4 | D037 direct remains supported at law-domain level. D078 and D151 should be adjacent context only from the small political/government and legal course slice. D045 remains a limited policy-interface candidate, not the whole Public Administration domain; subgroup/role evidence is still needed. |
| 5 | **D151 and D077 are candidate restores** as direct domain relationships: the full CCMAS Criminology/Security programme contains criminal-justice, security, forensic, investigation and internship outcomes. D078 functional is a candidate restore only restricted to its Social & Economic Research / quantitative subgroups. D045 should be added to the review candidate set only for Policy & Programme Officers (CSS policy/security-agency outcomes); do not restore its old adjacent link as a broad confirmed route. Downgrade D037 and D063 to adjacent context only; remove D130 and D028 as unsupported by the curriculum. |
| 6 | D037 direct remains supported. The active removal of D163 is supported (the saved scope anchor is Legal Writing, not IP); removal of D065 is supported (no translation/interpreting course). D151 should be downgraded from functional to adjacent (criminal-law course ≠ criminology occupation training). D045 at most an adjacent public-law/policy context; do not confirm its full broad domain or roles. |
| 7 | Restore/retain D151 and D077 direct; retain D078 only as a restricted functional social-research/quantitative candidate. D037 and D063 should be adjacent only. Remove D028. The active removal of D045 is acceptable for the present partial scope: it does not contain the CSS 406 policy/strategy course used as evidence for the full-package rows 5/9, and no specific public-administration course outcome has been crosswalked. Do not auto-restore it. |
| 8 | Same disposition as row 7; keep row identity and institution context separate. D045 remains removed for this partial course set. |
| 9 | Same candidate pattern as row 5 but preserve this separate Social/Management JAMB occurrence: candidate restore D151/D077 direct; restricted D078 functional; review-only candidate amendment D045 to policy/programme subgroup. D037/D063 adjacent only; D130/D028 removed. No candidate is promoted until source table cells and descendants are accepted. |
| 10 | **Candidate restore** D078 functional for social research/quantitative subgroups, D072 functional for geospatial analysis (DSS 309 maps/GIS outcomes), D009 functional restricted to Applied Statistics/Statistical Operations (DSS 304/306/405/406), and D041 functional restricted to research/quantitative-science subgroups. Add D045 to the review candidate set only for Policy & Programme Officers, based on population-policy evaluation. D014 is at most adjacent quantitative foundation, not an actuarial path. Remove D029 and D130 (labour-force measurement is not HR/recruitment training); downgrade D063 to adjacent economic-data context. **No link is written back**: exact role match and verified JAMB offering tables remain open. |

## Overlay conflict ledger: exact intersecting identities

The four row-level records in `jamb_nigerian_review_overlay_conflicts_2026-09-25.json` are triage conflicts, not defects by ID mismatch alone:

- Row 3 / Common and Islamic Law / D163: retain quarantined and downgrade to optional adjacent; curriculum shows an IP law option, not required learning. No confirmed-candidate amendment for D163.
- Rows 5 and 9 / Criminology and Security Studies / D045: evidence supports candidate-set amendment only for the policy/programme subgroup; retain the overlay quarantined until its exact course locator, tier rationale and role tasks are validated.
- Row 10 / Demography and Social Statistics / D014, D029, D041, D045: candidate-set amendment for D041 and D045 with restricted subgroup scope; D014 remains adjacent-only and D029 is removed from confirmed candidates. Quarantined rows stay quarantined until evidence completeness; no active map write.

## Closure and next action

Rows 1–10 still have **0 fully closed identities** under the acceptance rule. JAMB table institution geometry is unverified for all ten; specific relevant subgroup/role checks are incomplete. The before/after comparison is captured without confusing the rollback snapshot for current truth. No SQL, career seed, canonical map, or shared scope was edited. Continue sequentially with rows **011–020**, applying the same source, course/outcome, descendant, crosswalk and overlay checks.
