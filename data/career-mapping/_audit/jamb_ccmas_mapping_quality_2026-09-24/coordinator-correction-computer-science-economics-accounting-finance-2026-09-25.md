# Coordinator correction — CS with Economics and Accounting and Finance

Audit date: 2026-09-25. This correction makes two scope gaps fail closed in the generated local JAMB map. It does not assert that either programme is unavailable and does not create new CCMAS/domain links.

## Confirmed defects and disposition

### COMPUTER SCIENCE WITH ECONOMICS

- The saved partial scope contained eight `Computing::Computer Science` courses and no `Social Sciences::Economics` component or Economics course/outcome. The selected Computing course list therefore failed to represent a substantive part of the JAMB display name.
- The official NUC Social Sciences CCMAS includes ECO 101 Principles of Economics I; its outcomes cover scarcity/choice, demand and supply, elasticity, production, and market structures. This verifies that a separate source component exists; it does not determine which Economics courses belong to a specific JAMB offering.
- JAMB's Sciences brochure (printed p. 452) lists the distinct catalogue name “Computer and Economics.” The Engineering/Environmental/Technology brochure (printed p. 336) lists “Computer Science with (Economics) (Mathematics).” The local Sciences offering row for “COMPUTER SCIENCE WITH ECONOMICS” carries CUAB/LCITY/OAU as parsed tokens, but the exact institution/table association remains unverified. These similar catalogue names must not be merged without the source table's offering context.
- Disposition: retain the eight Computing courses as candidates; require source-context verification and a bounded Economics course/outcome scope. All links from this name-keyed row are withheld pending that review.

### Accounting and Finance

- The official JAMB Administration brochure, printed p. 48, lists an `ACCOUNTING AND FINANCE` row for BCU. The Social Sciences brochure, printed p. 576, lists a separate `ACCOUNTING AND FINANCE` row for FEDOTUOKE. Their source faculties and institutions must remain distinct.
- The current one-name mapping held a Finance/Banking-and-Finance (FIN) slice. That does not establish the Accounting component, nor demonstrate that a single curriculum scope applies to both source contexts. The offering inventory still marks exact rendered-PDF table verification open.
- Disposition: preserve the existing course/link evidence as candidates; withhold all links until the contexts and relevant CCMAS Accounting/Finance scopes are separately reconciled.

## Durable source and regenerated outputs

- Added both named-component/context holds to `data/career-mapping/_build_jamb_curriculum_scopes.py`; course candidates remain recorded but the scope is pending and has no exposed links.
- Regenerated `_audit/jamb_curriculum_scopes_2026-08-17.json`, then `_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json`, then materialized `jamb_domain_map.json` with `--replace`.
- Current map contains 420 identities. `Accounting and Finance` and `COMPUTER SCIENCE WITH ECONOMICS` each have status `review_required` and zero active links. Across all 420 rows the current status counts are 27 `ready`, 271 `ready_partial`, 1 `ready_reviewed`, 115 `review_required`, and 6 `ready_external`; 1,707 active links remain. These are local file counts, not live database counts and not a claim that all remaining links passed the requested semantic audit.
- The materializer records 85 Nigerian-review overlay conflict rows / 199 conflicting link occurrences. Those conflicts remain quarantined for reconciliation; the global map rebuild did not turn them into confirmed links.
- Before regeneration, the three affected generated artifacts were copied to `data/career-mapping/_audit/manual_mapping_corrections_2026-09-25_before_csecon/` for rollback.
- Regression tests: `python -m pytest -q data/career-mapping/_audit/test_jamb_manual_scope_review_holds.py data/career-mapping/_audit/test_jamb_ccmas_materializer.py` — 5 passed.
- No database/SQL was applied. The career seed must be regenerated from this newer map before it can represent these two holds; see the subsequent seed-regeneration checkpoint.

## Primary sources

- JAMB/IBASS, [Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf), printed p. 452 (catalogue listings, including Computer and Economics).
- JAMB/IBASS, [Engineering/Environmental/Technology brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf), printed p. 336 (Computer Science with (Economics) (Mathematics); no institution join was established here).
- NUC, [Social Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), ECO 101 course/outcomes, printed p. 98; accessed 2026-09-25.
- JAMB/IBASS, [Administration brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf), printed p. 48 (Accounting and Finance—BCU); [Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf), printed p. 576 (Accounting and Finance—FEDOTUOKE); accessed 2026-09-25.
- NUC, [Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), for the separate Administration/Management curriculum records; accessed 2026-09-25.
