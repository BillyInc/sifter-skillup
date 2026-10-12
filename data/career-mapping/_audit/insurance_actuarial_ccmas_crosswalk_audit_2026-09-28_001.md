# Insurance and Actuarial Science CCMAS crosswalk audit — 2026-09-28

## Scope and method

Audit-only review of the canonical JAMB identity **Insurance and Actuarial
Science**. I inspected its current JAMB offering row, `programme_mapping.json`,
the current row in `jamb_curriculum_scopes_2026-08-17.json`, the two separate
programmes in `ccmas/administration_management.json`, and the existing
2026-09-25 checkpoints. The older checkpoints predate subsequent local
repairs, so findings below are based on the current worktree. No curriculum,
mapping, domain link, offering, seed, or SQL data was changed.

## Confirmed current crosswalk

The current scope row (one-based row 77) declares both components:

- `Administration and Management::Insurance` — **32 selected CCMAS course
  rows**, matching all 32 rows in the checked-in Insurance package.
- `Administration and Management::Actuarial Science` — **35 selected CCMAS
  course rows**, matching all 35 rows in the checked-in Actuarial Science
  package.

The scope keeps separate `insurance curriculum` and `actuarial science
curriculum` facets. A full field-by-field comparison confirms that each
selected row's course code, title, content summary, and learning outcomes
match its corresponding component record. This includes the shared/common
course rows and separately scoped cross-listed ACS courses; the same course
code can have component-specific content, and the audit compares it to the
correct facet rather than conflating the two. Course-level rows carry the NUC
PDF URL, printed-page locator, and access date.

The discipline coverage is substantively complementary, not title-only:

- **Insurance:** the selected package includes insurance principles, tort and
  insurance law, life assurance, underwriting, claims, broking, property and
  liability cover, risk management, motor/aviation/marine/agricultural
  insurance, and reinsurance. Its outcomes cover, for example, policy and
  underwriting decisions, claims handling, risk identification/treatment, and
  insurance operations.
- **Actuarial Science:** the selected package includes actuarial foundations,
  mathematics, calculus, probability/statistics, actuarial finance,
  demography, insurance economics, risk management, life contingencies,
  actuarial modelling, pricing, survival/mortality analysis, pensions, and
  valuation. Outcomes include solving quantitative problems, estimating and
  interpreting risk/mortality, valuing insurance/pension liabilities, and
  analysing pricing and financial risk.

The JAMB Administration offering ledger identifies the canonical title and
lists BAZE, IMSU, and WESLEYUNI. Its current row is marked source-text confirmed
and verified against the official brochure entry (Administration source table,
parsed source locator `Administration.txt:1630-1634`). This is the JAMB
identity/offering evidence; it is distinct from the CCMAS component evidence.

## Defects and unresolved questions

**No current component-coverage omission was confirmed.** The former
Insurance-only scope and misaligned Actuarial course extraction described in
the September 25 checkpoints have since been corrected in the current scope
and CCMAS source package. The regression test added with this audit will fail
if either component is later omitted or a selected title/content/outcome
drifts from its corresponding package.

**Confirmed stale provenance state:** the crosswalk row still says its parsed
institution codes are “not yet direct-PDF verified” and that exact JAMB-cell
verification remains outstanding. The current JAMB offering row now records
`source_context_status: source_text_confirmed`,
`verified_against_pdf: true`, and the exact title/awarder locator. This is a
cross-ledger status/locator reconciliation issue, not a missing CCMAS
component. It is recorded here for a later authorized data repair; this audit
does not edit either ledger.

**Offering-specific implementation remains a separate question, not a reason
to block this national CCMAS crosswalk.** NUC describes Insurance and
Actuarial Science as separate programme packages, while CCMAS sets out a 70%
core and a university-specific 30%. The current evidence therefore justifies
an auditable two-component national reference scope; it does not prove that
every institution's delivered timetable is the literal union of every course
in both packages. That distinction should be retained in the scope status and
not converted into a missing-CCMAS finding. The pending scope-review state
does not invalidate the verified national component coverage. Further
university-specific curriculum evidence is outside this audit's acceptance
condition.

The current JAMB source locator is parsed-text based; the NUC course evidence
was directly checked against the official NUC PDF. No downstream domain-link
review was performed, per the requested scope.

## Primary sources and locators

- **NUC, Administration and Management CCMAS** —
  <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf>
  (accessed 2026-09-28). Actuarial Science course structure: printed pp. 54–56
  (PDF pages 53–55); course contents/outcomes: printed pp. 56–73 (PDF pages
  55–72), including ACS 101 at printed p. 58, ACS 308 at pp. 69–70, and ACS
  405 at p. 73. Insurance course structure: printed pp. 309–310 (PDF pages
  308–309); overview and course contents/outcomes: printed pp. 307–328 (PDF
  pages 306–327), including INS 101 at printed p. 312 and the specialist
  insurance course blocks thereafter. The course-level audit locators are
  stored on each selected scope row.
- **JAMB, Degree Administration brochure** —
  <https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf>
  (ledger verification dated 2026-09-26). Administration table,
  `Administration.txt:1630-1634`, exact title and awarding-institution cell.

## Verification

`test_insurance_actuarial_ccmas_crosswalk_2026_09_28.py` checks component
references, complete course-code inventories, exact titles/content/outcomes,
item-level NUC provenance, and the JAMB offering identity/source context. It
does not modify or regenerate any product data.
