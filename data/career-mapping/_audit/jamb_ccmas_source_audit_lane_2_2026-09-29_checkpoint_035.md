# Lane 2 source-audit checkpoint 035 — JAMB identity 144: Biotechnology and Molecular Biology

## JAMB offering evidence

The Sciences offering ledger has one occurrence for **BIOTECHNOLOGY AND MOLECULAR BIOLOGY**, awarded by **FUHS-ILA**. Its checked-in source locator is `Sciences.txt:417-420`; the exact title is at 417–418 and FUHS-ILA at 419. The separate **BIOCHEMISTRY AND MOLECULAR BIOLOGY** occurrence immediately before it is DOU/HENSARD/ZAMFARA at lines 411–416 and must remain distinct. The current JAMB IBASS viewer returned its JavaScript gate when reopened; the occurrence retains its official brochure URL and the precise checked-in extraction locator, but a printed PDF page was not independently recovered in this increment.

JAMB primary-source URL: [IBASS Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf). The current local identity’s title, single FUHS-ILA institution, URL and line locator agree with the checked-in official-source extraction.

## CCMAS scope and source findings

The current approved partial scope maps only to **Sciences::Biotechnology** and selects 22 course rows. It does include BTG 301 Molecular Genetics, BTG 302 Molecular Cell Biology and BTG 305 Techniques in Biotechnology, so the Molecular Biology facet has substantive selected-course support. It does not include:

- **BTG 304 Genetic Engineering**, even though the NUC Biotechnology curriculum places it in the required 300-level sequence and its DNA/RNA, gene-cloning, recombinant-cell and genome-editing content directly supports the combined remit. Its local course record is itself truncated at “character”.
- **BIO 414 Molecular Biology** from the separate NUC Biology curriculum, an exact-title course with four molecular-biology outcomes. It is not selected or listed as a supporting component. The local course row has a duplicated fifth outcome and truncated content (“in allevia”). This is evidence for a narrow supporting-course candidate, not a basis for inheriting the whole Biology curriculum.

The NUC sources are the [Sciences CCMAS PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf): BTG 301–305 at printed pp. 120–122 (PDF lines 4761–4843), and Biology BIO 414 at printed pp. 98–99 (PDF lines 3886–3903). These sources show that both JAMB-name facets have CCMAS evidence, while also showing that the currently approved course scope omits relevant source courses and provides no itemized `scope_evidence` or `source_contexts`.

## Additional structural and downstream findings

- The six stored JAMB-domain links have inconsistent course-title lists/counts across `jamb_curriculum_scopes`, `jamb_domain_map`, and `jamb_ccmas_inheritance_canonical`; the component evidence says seven links while six are actually listed. Examples: D138 8 vs 10, D041 7 vs 5, D143 6 vs 10, D047 9 vs 11.
- D027’s display name differs between derivatives (`Biomedical Science` vs `Biomedical`). Check the canonical domain registry before regeneration.
- D138 Biomedical Engineering and D143 Forensic Science/Digital Forensics lack an obvious explicit anchor in the currently selected course-title sets. Biology BIO 408 contains an explicit forensic-science outcome, but is not selected. Leave both links for course-level semantic review rather than treating prior “reviewed” metadata as proof.

No shared offering, curriculum, or mapping ledger was edited. The JAMB source-cell audit is closed; curriculum scope and downstream adjudication remain open for reconciliation.

**Next:** Continue lane 2 at the next uncovered canonical JAMB identity after row 144, after checking all existing checkpoint coverage.

Regression coverage: `test_jamb_ccmas_source_audit_lane_2_checkpoint_035.py`.
