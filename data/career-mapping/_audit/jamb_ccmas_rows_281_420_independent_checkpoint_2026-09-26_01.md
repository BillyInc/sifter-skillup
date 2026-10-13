# Independent JAMB–CCMAS audit checkpoint — rows 281–420

**Checkpoint date:** 2026-09-26 (Africa/Lagos)  
**Mode:** audit only; no shared mappings, curriculum-scope records, overrides, generators, seeds, or SQL changed.  
**Coverage:** independent read-through of current canonical/scope/offering records, plus source verification of selected high-risk cases. This is an incremental checkpoint, not tranche completion.

## State-level reconciliation

Read-only comparison of `programme_mapping.json` and `jamb_curriculum_scopes_2026-08-17.json` confirms 420 entries each and **zero identity-name mismatches** in rows 281–420. In this 140-row slice:

- 54 rows use a full CCMAS curriculum; 77 use a partial CCMAS scope; 4 declare combined CCMAS scope; 5 are marked external-scope-required.
- The 4 explicit combined records (290, 306, 337, 338) have zero selected course rows and zero domain links.
- Seven rows have no current scoped domain link. This is a work queue, not evidence that the programme has no valid downstream path.
- 75 partial-scope records are marked `reviewed`; that label does not establish that each named curriculum facet, award context, selected course outcome, or downstream link is valid.
- 637 scoped domain-link rows are present in this tranche. They still require source-course and link-tier validation; link volume is not proof of correctness.

The broad row inventory in [`jamb_ccmas_combined_curriculum_rows_281_420_2026-09-26.md`](jamb_ccmas_combined_curriculum_rows_281_420_2026-09-26.md) is useful for triage but should not be treated as adjudicated row-by-row source evidence. The following cross-checks add independent evidence and correct two overly broad previous findings.

## Independently verified findings

### Row 414 — Pasture & Range Management

- **Current local scope:** one selected CCMAS course, `ANS 409 — Pasture and Range Production and Management`, from Agriculture → Animal Science; current paths are D119 Livestock/Poultry/Dairy (direct) and D047 Agricultural Science (functional).
- **JAMB identity evidence:** the official Agriculture brochure lists “Pasture & Range Management” in its programme directory (printed p.75; [official JAMB Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf), accessed 2026-09-26).
- **CCMAS evidence:** NUC Agriculture CCMAS, Animal Science course section, lists the directly named ANS 409. This is not a generic animal course: its title explicitly covers pasture/range production and management. [Official NUC Agriculture CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2022/12/Agriculture-CCMAS.pdf), accessed 2026-09-26.
- **Disposition:** downgrade the earlier “severe undercoverage” claim. One highly specific course may be enough to establish the named facet; course count alone cannot establish inadequacy. **Not fully cleared:** inspect ANS 409 learning outcomes/content and verify source offering context; then test whether the two existing domain links are supported by those outcomes. The available evidence does not justify importing a whole Animal Science curriculum or adding veterinary/clinical links.

### Row 415 — Farm Management & Agric. Extension

- **Current local scope:** one component only, Agriculture → Agricultural Extension; 17 selected courses. It includes AGE 202 Agricultural Economics and multiple extension courses, but excludes the clearly relevant farm-management course set. Current links are D047 Agricultural Science, D063 Economics, D078 Social Sciences, D041 Scientific Research, and D118 Crop Production/Horticulture.
- **JAMB identity evidence:** the official JAMB Agriculture brochure lists the exact blended programme name “Farm Management & Agric. Extension” (printed p.75; same official JAMB brochure above, accessed 2026-09-26). The directory establishes that both named facets matter; exact institution-bearing awarder rows were not verified in this checkpoint.
- **CCMAS evidence:** NUC Agriculture CCMAS identifies `AGE 307 — Introduction to Farm Management and Accounting` in its common Agriculture course table (printed p.63), and gives outcomes including farm-manager functions, farm records/budgets, financial-performance measures, and farm planning (printed pp.81–82). The Agricultural Economics curriculum additionally lists `AGB 305 — Farm Business Management & Production Economics` and `AEC 307 — Farm Management Accounting` (printed pp.108–109). These are item-specific curriculum anchors, not a warrant to union every course from a second degree. [Official NUC Agriculture CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2022/12/Agriculture-CCMAS.pdf), accessed 2026-09-26.
- **Disposition:** **confirmed current scope omission** for the farm-management facet: the saved 17-course Extension selection does not contain AGE 307, AGB 305, or AEC 307, despite the canonical identity naming Farm Management and CCMAS supplying directly relevant course outcomes. Exact JAMB offering institution and whether the relevant 500-level option applies remain open; do not call a complete combined curriculum established yet. Reassess D118 in particular: its current anchor is only “Introduction to Agriculture I,” which by itself does not demonstrate crop-production specialization. Reassess the other links after the bounded farm-management/extension evidence is reconciled.

### Row 420 — Transport Planning and Management

- **Current local scope:** 34 selected courses from Administration and Management → Transport Management, including `TPM 204 — Transport Policy and Planning` and `TPM 424 — Transport Planning`; the current scoped domain-link list is empty. This contradicts the older companion report’s claim that the current scope has no TPM course rows. The course scope itself is not empty; the downstream path is.
- **Official JAMB context collision:** the exact name appears in both the Education brochure directory (printed p.200, listed as “Transport Planning and Management (TPM)”) and the Social Sciences brochure directory (printed p.575, “Transport Planning and Management”). The local offering-context inventory stores only one parsed Education occurrence, tagged TASUED, and marks the institution tokens/PDF row unverified. Sources: [JAMB Education brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf) and [JAMB Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf), accessed 2026-09-26.
- **Disposition:** confirmed source-inventory gap at faculty-context level: the second official faculty-brochure occurrence is not represented in the local row’s one-occurrence inventory. Whether that directory entry has distinct awarding institutions/curriculum must be resolved from its institution-bearing table; the two contexts must not be collapsed merely because the canonical display name matches. Separately, the existing 34-course Transport Management scope does contain direct transport-planning course titles, but **the no-link state is an unresolved downstream mapping defect**, not proof that a valid domain path does not exist. Reassess course outcomes and the domain candidates before changing links. Do not substitute unrelated tourism or railway curricula.

### Row 285 — Portuguese/English

- The live local scope still selects `GST 111 Communication in English` and `FRE 105 Initiation into Translation` from the French Modern European Languages package; its only active link is D065 Translation/Interpretation, anchored to Communication in English. This is direct current-file evidence of a Portuguese facet that is not represented and a translation claim whose stored anchor is not itself a translation course.
- The existing source checkpoint identifies the official JAMB Arts brochure’s Portuguese/English block at printed p.171 and the LASU association. NUC Arts has no Portuguese programme; an OAU handbook is an external curriculum lead but does not establish OAU as the awarding institution in this JAMB record. See the source links and caveat in the prior tranche report; this checkpoint did not treat another university’s handbook as LASU’s exact curriculum.
- **Disposition:** confirmed current scope/provenance defect; exact Portuguese course scope and institution-specific evidence remain open. Do not preserve French courses as Portuguese evidence. Reassess D065 against actual Portuguese/English translation or interpreting outcomes, not the name alone.

### Row 311 — Polymer and Textile Engineering

- Current selected courses are eight from CCMAS Materials Engineering, including GET 202 Engineering Materials, MSE 403 Ceramic, Glass and Polymers, and MSE 503 Composite Materials. Current map has seven links, several apparently anchored only by mathematics/materials-general courses.
- JAMB’s official Engineering directory lists “Polymer and Textile Engineering” (printed p.336, item 69; [official JAMB Engineering brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf), accessed 2026-09-26). NUC Engineering CCMAS GET 202 outcomes cover polymer classes, polymerization and applications, plus synthetic/natural fibres; course content covers polymer chemistry, crystallization, degradation, and aging. [Official NUC Engineering CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2022/12/Engineering-CCMAS.pdf), accessed 2026-09-26.
- **Disposition:** CCMAS evidence supports polymer/materials and fibre foundations, but the current selected course slice does not establish a textile-engineering sequence (e.g., fibre-to-yarn/fabric processing, textile testing, textile production systems). This is a **confirmed bounded-scope gap**, not proof that the whole award has no source-backed path. The seven current domain links need individual re-adjudication; course titles such as Engineering Mathematics do not substantiate unrelated specialist destinations. Exact offering-level schedule and an authoritative textile-specific source remain open.

## Open tranche work

This checkpoint does not close rows 281–420. Continue independently through the remaining partial/full records and source contexts. Prioritize the official awarder-cell gaps; check CCMAS outcomes rather than only titles; investigate the rest of the 81 partial/combined candidate rows; and verify every currently active domain link’s course anchor and direct/functional/adjacent tier. Keep evidence-needed candidates distinct from confirmed defects, and do not edit shared mapping data from this audit lane.
