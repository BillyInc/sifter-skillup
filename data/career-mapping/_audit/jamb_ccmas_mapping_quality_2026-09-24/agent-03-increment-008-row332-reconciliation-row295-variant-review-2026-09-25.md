# Partition 03 — increment 008: row 332 snapshot reconciliation and row 295 variant review

Recorded 2026-09-25 (Africa/Lagos). This is an append-only checkpoint for the current rows 281–420 partition. It does not claim that this partition or the 420-row catalogue is complete.

## Row 332 — Environmental Science and Technology

### Current adjudication

Keep the source identity as **Sciences / Environmental Science and Technology / WESLEYUNI**, `D_custom`, with **no CCMAS component, zero selected curriculum courses, and zero student-facing domain links**. The exact degree identity/current offering and a Wesley-specific curriculum are not yet established. This is a fail-closed evidence state, not a conclusion that the programme is unavailable.

### Candidate curricula and source-context finding

- The official [JAMB Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf) contains the exact catalogue title. The checked-in source row associates it with `WESLEYUNI`; JAMB's JavaScript viewer did not provide a stable rendered table-cell locator in this pass. The parsed identity/faculty association is therefore retained, but visual table-cell verification remains open.
- NUC's official [Environmental Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf) includes **Environmental Management** (printed pp. 99–122) and **Environmental Standards** (pp. 125–154). Their monitoring, management, standards, pollution, and assessment course/outcome material are plausible *discipline candidates* for comparison, not proof that either is the JAMB/Wesley award. Neither exact title is Environmental Science and Technology.
- NOUN's official [B.Sc. Environmental Science and Resource Management curriculum](https://fos.nou.edu.ng/b-sc-environmental-science/) is a substantive external Nigerian curriculum lead. It covers environmental/biophysical systems, research, conservation/resource management, fieldwork, SIWES and GIS. It is explicitly NOUN's programme, not Wesley's, and cannot be attached to the WESLEYUNI occurrence without evidence that the two awards share that curriculum.
- NUC's historical [undergraduate accreditation results through November 2021](https://nuc.edu.ng/wp-content/uploads/2021/11/Undergraduate-Accreditation-Result-as-at-November-2021.pdf) identify **Environmental Science** at Wesley University of Science and Technology. That is a credible source-context/name-reconciliation lead: it suggests the JAMB identity may relate to a former or renamed Wesley Environmental Science award. It does not establish that this is the same award as the current JAMB title, that the award is currently offered, or what its curriculum contains.
- Wesley's official [current College of Environmental Design and Management page](https://wesleyuni.edu.ng/php/cedm.php) lists Urban and Regional Planning, Estate Management, and Surveying and Geoinformatics; its official [2022–2026 CEDM prospectus](https://wesleyuni.edu.ng/assets/pdf/cedm.pdf) describes its environmental-design offerings, not the required Environmental Science and Technology curriculum. Neither resolves the historical NUC/JAMB discrepancy.

**Decision:** No candidate is promoted as the Wesley curriculum. Preserve `D_custom` and zero student paths until the exact Wesley award is reconciled and a programme-specific source establishes curriculum outcomes. The source-context issue is more likely a historic/current title or offering-status mismatch than a demonstrated parser switch to another university: the JAMB source and local parsed row both point to WESLEYUNI, but the JAMB row geometry and the historical NUC entry still require direct reconciliation.

### Row 332 changes made

Reconciled only the Environmental Science and Technology row in:

- `data/career-mapping/programme_mapping.json` — kept `D_custom`, null CCMAS fields, and documented the distinct CCMAS, NOUN, and Wesley/NUC evidence.
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json` — replaced stale EHS scope with `external_sources_required`, zero components/courses/links, and review-required status.
- `data/career-mapping/_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json` — cleared stale EHS primary/supporting/component references, course list, domain evidence, active/candidate links; set review-required and zero current links.
- `data/career-mapping/_audit/jamb_domain_map_ccmas_derived_2026-08-17.json` — cleared derived EHS links/components/curriculum and set review-required.
- `data/career-mapping/jamb_domain_map.json` — retained zero links and review-required; aligned `inheritance_type` to `external_sources_required`.

The one-row pre-state is preserved in `data/career-mapping/_audit/jamb_row332_pre_reconciliation_snapshot_2026-09-25.json`. The row-limited deterministic reconciliation is `data/career-mapping/_audit/reconcile_jamb_row332_generated_snapshots.py`. No seed, SQL, role record, or global generator was touched.

The older aggregate `jamb_ccmas_curriculum_coverage_matrix_2026-09-19.json` remains a dated historical snapshot; its EHS fan-out entry is not current evidence and was not globally rebuilt in this row-limited task.

## Row 295 — Russian with French/German

### Source and component findings

- The official [JAMB Arts brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), printed p. 130, lists the exact identity **Russian with French/German**. The local Arts offering row parses `IBADAN`, but also has title/faculty fragments (`FRENCH/GERMAN`, `ARTS`) in its institution array; the waiver institution names in that record are not proof that each institution offers this degree. Preserve the single parsed JAMB occurrence as provisional pending a direct table-cell read.
- NUC's official [Arts CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf) lists three separate programme components: Modern European Languages—French (`FRE`), —German (`GER`), and —Russia (`RUS`, source spelling). The Russian-only 35-course selection therefore cannot represent the whole JAMB title. CCMAS provides the candidate components, but it does not itself say which second language or institution-specific course union is offered.
- University of Ibadan's official [course-registration programme list](https://ui.edu.ng/news/guide-enrollment-lms-and-course-registration) gives distinct B.A. Russian, B.A. Russian/French, B.A. German, and B.A. German/French programmes. Its current listed combined variant is Russian/French; it does **not** establish a Russian/German variant in that list. An older official [UI course-requirements/admissions page](https://ui.edu.ng/content/advertisement-course-requirements) describes Russian Combined Honours with one of French/German or another Arts subject, which supports historical optional-variant context but not the current exact JAMB roster by itself.
- UI's official 2023/24 [B.A. Russian course schedule](https://ui.edu.ng/sites/default/files/B.A.%20Russian%20Course%20Schedule%202023-2024%20Session%20II.pdf) confirms staged Russian language/oral-comprehension, composition, grammar, literature, translation, culture, linguistics, and research courses. UI's separate [B.A. German schedule](https://ui.edu.ng/sites/default/files/B.A.%20German%20Course%20%20Schedule%202023-2024%20Session%20II.pdf) confirms corresponding German language and translation courses. They are useful offering-specific evidence, but neither document is a Russian/German combined schedule.

**Decision:** A defensible **Russian + French** component route is supported for the UI variant by the institution's official current programme list, and the distinct NUC CCMAS packages can supply curriculum evidence after course/outcome reconciliation. The JAMB slash label also permits a German interpretation, but current UI programme evidence does not establish that alternative. Do not union all three CCMAS curricula. Keep the current row fail-closed until the exact JAMB/UI variant is reconciled against the specific combined programme course list and CCMAS learning outcomes. Translation is a strong candidate because both language curricula include translation courses; Journalism is not established by language-grammar courses. No row-295 active links were restored in this checkpoint.

## Verification and remaining work

- Row-level JSON checks confirm all five row-332 artifacts now agree on `D_custom` / no CCMAS components / zero selected courses or links / review-required external evidence state.
- Targeted tests run: `6 passed`; one existing external-review audit test fails its pre-existing cross-artifact cardinality assertion (`jamb_review_required_rows` expects 86, while the current canonical file has 32 review-required rows). That test's stored review count is stale relative to the checked-in canonical snapshot; it is not evidence of a row-332 link leak. No other test failure was observed.
- Continue rows 281–420 by reading the remaining partition checkpoints and append row-specific issues/fixes. Row 295 still needs exact PDF/offer-cell verification, the RUS/FRE course-outcome union and link review, and a decision on whether a distinct German alternative is currently advertised. Row 332 still needs a verified Wesley-specific current/historical award identity and curriculum or authoritative evidence that the JAMB listing is obsolete/mislabelled.

## Append-only correction — NUC accreditation context rechecked

The first draft above overstated a NUC historical-accreditation search hit as evidence that **Environmental Science was offered at Wesley**. Reopening the NUC PDF around the matching records showed that the search hit was not tied to Wesley in its retrieved institution context. **Retract that claim**; do not treat the accreditation search result as evidence for a Wesley Environmental Science award. The current sources establish only: the JAMB row says WESLEYUNI; NUC's Environmental Sciences CCMAS contains distinct Environmental Management and Environmental Standards degrees; NOUN has its own Environmental Science and Resource Management curriculum; and Wesley's current public programme pages/prospectus list other environmental-design awards. Exact source-title/current-offering reconciliation remains open. The five-file row-332 state remains D_custom/zero-path; the reconciliation note was corrected accordingly.
