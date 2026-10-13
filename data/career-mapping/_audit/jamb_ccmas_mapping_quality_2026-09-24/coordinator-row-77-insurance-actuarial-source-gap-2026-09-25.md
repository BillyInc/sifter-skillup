# Coordinator checkpoint — row 77 Insurance and Actuarial Science

Checked 2026-09-25 against the current worktree, the supplied original CCMAS PDF, and the NUC-hosted CCMAS PDF. This is a defect checkpoint, not a completed offering-level reconciliation. No canonical scope, map, seed, or database was changed in this checkpoint.

## Confirmed current-state defects

- Canonical JAMB row 77 is **Insurance and Actuarial Science**. The parsed Administration brochure row associates BAZE, IMSU, and WESLEYUNI, but `jamb_offering_context_inventory_2026-09-25.json` records `offering_row_verified_against_pdf: false` and a null PDF locator. Keep the exact institution join open until the JAMB source table itself is visually confirmed.
- `jamb_curriculum_scopes_2026-08-17.json` currently declares only `Administration and Management::Insurance`; it selects 19 rows from the Insurance component and has no Actuarial Science component reference. The saved list does not account for the substantive second half of the canonical programme name.
- The checked-in `ccmas/administration_management.json` Actuarial Science course records conflict with the official Administration and Management CCMAS PDF. Example: the JSON records `ACS 101 — Statistical Inference I`, `ACS 102 — Statistical Inference II`, and `ACS 104 — Introduction to Actuarial Science`; the NUC-hosted CCMAS course table instead identifies ACS 101 as Introduction to Actuarial Science, ACS 102 as Basic Mathematics for Actuarial Science, and ACS 104 as Elements of Actuarial Statistics (printed p. 53). This is a source-data mismatch, not just a missing JAMB component.
- The NUC CCMAS gives Actuarial Science and Insurance separate programme sections/course structures. Therefore, the combined JAMB display name alone does not prove that each institution teaches the full union of both CCMAS programmes. Source-specific course selection must remain unresolved until that relationship is supported; do not silently treat either standalone curriculum as the combined offering.
- Even within the current Insurance-only selected list, the official Insurance structure has rows absent from the saved 19-course slice, including INS 201 Law of Tort, INS 203 Life Assurance, and INS 302 Risk Management II (printed pp. 309–310). Their outcomes should be checked before deciding whether they belong in the bounded student-facing slice; they must not be omitted merely because a keyword selector missed them.

## Course evidence from CCMAS

The NUC-hosted Administration and Management CCMAS names Actuarial Science as a separate programme and describes its course sequence in quantitative, risk, and financial terms. Its table includes actuarial calculus, mathematical statistics, probability, actuarial finance, demography, risk management, life contingencies, actuarial modelling, pricing, survival models, mortality analysis, valuation, and advanced risk management (printed pp. 53–55). ACS 101 outcomes include the relationship between actuarial science and insurance, actuarial work, compound-interest problems, life tables, and annuities (printed p. 58). Insurance is separately listed with its own INS course structure (printed pp. 308–310); INS 302 outcomes include identifying and managing financial risks, market/credit/liquidity/operational risks, value-at-risk principles, and risk mitigation (printed p. 320).

These two NUC curriculum sections establish valid CCMAS evidence for the two disciplines independently. They do not, by themselves, establish which subset is taught under every institution-specific JAMB offering. Keep that distinction explicit in the canonical scope and downstream evidence.

## Sources and locators

- NUC CCMAS index: https://www.nuc.edu.ng/ccmas/ (Administration Discipline download; checked 2026-09-25).
- NUC Administration and Management CCMAS: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf — Actuarial Science structure, printed pp. 53–55; ACS 101 learning outcomes/content, p. 58; Insurance course structure, pp. 308–310; INS 203 outcomes, p. 317; INS 302 outcomes/content, pp. 320–321.
- JAMB Administration brochure URL: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf — the web text renderer served the IBASS JavaScript shell during this check. Do not treat search snippets or parsed tokens as final visual confirmation of the offering row. The local occurrence inventory records its source-file and parsed-row lineage but no verified PDF locator yet.
- Local comparison files: `data/career-mapping/ccmas/administration_management.json`, `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json` row 77, and `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json` row 77.

## Required next correction

1. Reconcile the checked-in Actuarial Science CCMAS records against the original PDF; do not reuse the conflicting ACS 101/102/104 identities as source truth.
2. Reconfirm the JAMB institution row and whether the offering’s curriculum can be represented by scoped Insurance and Actuarial Science CCMAS components; record the source for each distinct context.
3. Build a bounded, code-and-outcome-backed course slice for both named facets, then re-grade all existing domain links against those courses and their downstream branches. Do not promote the current ten-link Insurance-only set by inheritance.
4. Only after those checks, update the canonical scope and regenerate/audit the active JAMB map and relevant seed artifacts.
