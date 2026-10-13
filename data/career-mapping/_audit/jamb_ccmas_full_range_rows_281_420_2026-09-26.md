# JAMB–CCMAS full-range audit — canonical rows 281–420

**Started:** 2026-09-26 (Africa/Lagos)  
**Mode:** audit only. This report is a new, append-only work product. No shared map, scope, seed, generator, or override was edited.  
**Scope:** all 140 canonical JAMB identities at positions 281–420; every parsed offering occurrence attached to those identities; selected CCMAS course records and available content/outcomes; and scoped/current domain links and statuses.

## Checkpoint 1 — source reconciliation and coverage boundary

Read the four requested current sources before beginning: `jamb_ccmas_inheritance_canonical_2026-08-17.json`, `jamb_curriculum_scopes_2026-08-17.json`, `jamb_offering_context_inventory_2026-09-25.json`, and `JAMB_CCMAS_MAPPING_FINDINGS_REGISTER_2026-09-25.md`.

This is an audit record, not a claim that the existing `reviewed` or `ready` labels establish correctness. The canonical inheritance ledger and curriculum-scope ledger are aligned by canonical ordering for this 140-row range. The offering inventory gives parsed occurrence identities, source faculty/file, row ordinal, and institution-token lists; it does not provide PDF-verified offering rows for this tranche. Aggregate inventory metadata reports 3 PDF-verified occurrences across all 420 identities; rows 281–420 contain **0 verified occurrences out of 149 parsed occurrences**. Consequently none of the parsed institution lists in this tranche can be treated as the exact awarder-cell context. Similar names in another faculty/source file remain separate occurrences.

The 140-row ledger reconciliation found 54 full-component records, 77 partial CCMAS records, 4 explicit combined records, and 5 external-source records. The current scope file has 1,588 selected course records and 649 scoped domain-link records for this slice. Sixty identities have no selected courses (including full-component inheritance by design); six have no scoped links. These are inventory counts, not quality verdicts. A full-component row with zero selected-course rows inherits its package and must be assessed against package-level course/outcome evidence. The four explicit combined rows (290, 306, 337, 338) currently have zero selected courses and zero scoped links, so their course coverage and pathways remain unestablished.

### Disposition standard

- **Confirmed defect / bounded scope gap:** the current stored selection or claim demonstrably omits a substantive named facet, selects the wrong component/course family, or anchors a current domain claim to irrelevant course evidence. This does not imply the whole degree is unavailable.
- **Evidence-needed candidate:** the current records raise a plausible identity, component, course/outcome, or link-tier question, but the exact JAMB award context or source curriculum evidence is insufficient to establish a defect.
- **Not a defect by itself:** zero selected rows on a full-component record, a compound title, an offering-parser institution token, or a current mapping status is not independently a defect or proof of a valid path.

### Confirmed items inherited from earlier evidence checkpoints

These are retained as prior evidence, checked against the current ledger, and are not presented as new PDF verification in this pass:

- **Row 285 Portuguese/English:** current saved CCMAS courses do not represent Portuguese; the D065 link is anchored to Communication in English rather than translation outcomes. Confirmed representation/provenance gap; exact Portuguese offering curriculum remains evidence-needed.
- **Row 287 French and German/Russian:** only French is represented. The slash may indicate alternatives, so German and Russian must not both be unioned without exact offering evidence. Confirmed missing language-facet representation; which second-language route applies remains evidence-needed.
- **Row 288 International Studies and …:** Arts source parse truncates the official title and contaminates the parsed institution list with title fragments. Confirmed source-extraction defect; exact offering institution/context remains evidence-needed.
- **Row 290 History and Strategic Studies:** two component references but no selected courses or links. Confirmed incomplete evidence contract; the proposed components and downstream destinations remain unconfirmed.
- **Row 292 African and Asian Studies:** the selected History courses are Africa/West-Africa focused; no Asian facet is represented. Confirmed facet gap; source-backed Asian curriculum remains evidence-needed.
- **Row 295 Russian with French/German:** only Russian is selected; exact additional-language variant is unresolved. Confirmed incomplete representation of the printed title; the applicable alternative and course union remain evidence-needed.
- **Row 304 Efik-Ibibio:** the selected component is Efik; Ibibio is not represented despite distinct CCMAS evidence. Confirmed facet gap; exact offering-level course union remains evidence-needed.
- **Row 306 Political Science and Conflict …:** Arts offering parse truncates the title and places `CONFLICT RESOLUTION` among institution tokens; the combined scope has no selected courses or links. Confirmed extraction/evidence gap; exact Arts awarder context and curriculum remain evidence-needed.
- **Row 311 Polymer and Textile Engineering:** selected Materials Engineering courses include polymer/materials evidence but no textile-engineering sequence. Confirmed bounded textile-facet gap; do not substitute Clothing and Textile Design for engineering evidence.
- **Row 332 Environmental Science and Technology:** current row is held at custom/external, zero selected CCMAS courses and zero student paths after the prior correction. The current evidence does not identify a matching CCMAS award or exact institution curriculum. Treat as evidence-needed, not unavailable.
- **Row 356 Ecology and Environmental Studies:** full Biology inheritance includes unrelated crop/livestock paths. Confirmed scope-quality issue; retain ecology evidence and reassess each destination against course outcomes.
- **Row 386 Education and Business Administration:** D039 Higher Education, D063 Economics, and D061 Insurance are anchored to GST 112 Nigerian Peoples and Culture. Confirmed unsupported current link anchors; the business-administration facet still needs bounded course evidence.
- **Row 414 Pasture & Range Management:** current single selected ANS 409 is explicitly titled Pasture and Range Production and Management. Earlier “severe undercoverage” is retracted; selected-course count alone does not prove undercoverage. Outcome-level and downstream-link review, plus exact awarder context, remain open.
- **Row 415 Farm Management & Agric. Extension:** the 17-course Extension slice omits the directly relevant farm-management courses identified in the prior CCMAS review (including AGE 307). Confirmed bounded farm-management omission; exact JAMB awarder and course-option applicability remain open.
- **Row 418 Statistics Education:** the sole selected course is Project in Mathematics Education; it does not establish AI or actuarial learning. Confirmed unsupported D003/D014 anchors in the prior review; any statistics-specific component remains evidence-needed.
- **Row 420 Transport Planning and Management:** current selected courses are from the correct Administration and Management::Transport Management component and include transport-planning courses. Earlier claim that the scope used Hospitality/Tourism courses and had no TPM course rows is stale and retracted. Scoped-link outcome/tier review and a second Social Sciences brochure occurrence remain open.

This checkpoint is deliberately not a tranche completion claim. The following append-only checkpoints will record the row-by-row ledger, every offering occurrence/context state, the remaining candidate dispositions, and the final checked-versus-unresolved counts.

## Checkpoint 2 — complete row-range inventory and evidence-gap accounting

Reconciled rows 281–420 by canonical ordinal across the inheritance ledger, scope ledger, and offering inventory. The coverage sets partition the entire range without gaps or overlaps:

| Current inheritance/scope class | Count | Canonical rows |
|---|---:|---|
| Single CCMAS full component | 54 | 291, 293, 297, 299–300, 307–309, 313, 315–316, 319–324, 330–331, 333–334, 343–344, 348, 351–374, 376, 379–381, 385, 387 |
| Partial CCMAS scope | 77 | 281–283, 285–289, 292, 294–296, 298, 301–305, 310–312, 314, 317–318, 325–329, 335–336, 339–342, 345–347, 349–350, 377–378, 382–384, 386, 389–418, 420 |
| Explicit combined CCMAS scope | 4 | 290, 306, 337–338 |
| External source required | 5 | 284, 332, 375, 388–389? no: rows 284, 332, 375, 388, 419 |

The corrected inheritance classes above sum to 140. (The external row list is explicit; row 389 is the CCMAS Nursing/Nursing Science partial scope.) Current status counts are 54 `ready`, 76 `ready_partial`, 5 `review_required`, 4 `ready_external`, and 1 `external_review_required`.

### Source-occurrence comparison

All 140 inventory identity entries and their **149** `source_offerings` records were traversed in canonical order. Parsed source-file occurrence counts in this tranche are:

| Parsed source file | Occurrences |
|---|---:|
| `arts_hum_offerings.json` | 34 |
| `administration_offerings.json` | 9 |
| `engineering_offerings.json` | 34 |
| `social_management_offerings.json` | 4 |
| `sciences_offerings.json` | 45 |
| `medical_offerings.json` | 4 |
| `education_offerings.json` | 12 |
| `agriculture_offerings.json` | 7 |

Seven canonical identities have multiple source occurrences in the current inventory: 291 Economics (4 occurrences); 296 Mass Communication; 307 Sociology; 321 Geography; 344 Optometry; 379 Library and Information Science; and 388 Sport Science (2 occurrences each for the latter six). They total 16 occurrences. Keep each source faculty/file/row occurrence distinct. The source inventory’s parsed institution-token counts and ordinals were compared to the mapped component and selected curriculum record; none has an official PDF table locator or PDF-verified row flag in this slice. Therefore **0/149 offering contexts are exact-awarder verified**. Parsed institution tokens, including those in repeated-faculty rows, remain provisional. Row 420 also has a separately identified Social Sciences catalogue occurrence in the previous source review, which is not represented by its single Education occurrence in the current inventory.

### Course/outcome and link inventory

The current scope ledger contains **1,588 selected course rows** across partial, combined, and external scopes. Among those local records:

- 245 have an empty `learning_outcomes` list;
- 346 have an empty/placeholder `content_summary`;
- 133 have both fields empty/placeholder.

These are confirmed gaps in the local extracted evidence. They do not prove the NUC source PDF omits the material. Course title, component owner, available content/outcome fields, scope facet and source CCMAS package are recorded in the linked scope ledger; this pass has not yet reconciled every one of those 1,588 entries to its exact NUC PDF table/page/outcome. In particular, all 54 full-component rows inherit package-level curricula and have zero selected-scope rows by design; those 54 need package-level course/outcome review, not a finding of missing curriculum.

The scope ledger contains **645 scoped domain-link records**. The canonical ledger’s `current_jamb_domain_link_count` sums to **440** for these rows, so the current candidate/evidence scope and current map path population are not interchangeable. Six rows have zero scoped links: 285, 290, 306, 332, 337 and 338. The four combined rows 290/306/337/338 have no selected courses or scoped links. Every retained link still needs its own verified course-outcome anchor and direct/functional/adjacent tier rationale; a nonzero count or prior reviewed status does not close that requirement.

### Compound-name sweep and row-level dispositions

The existing companion audit [`combined_blended_source_audit_rows_281-420_2026-09-26.md`](jamb_ccmas_mapping_quality_2026-09-24/combined_blended_source_audit_rows_281-420_2026-09-26.md) screened all **54** identities whose names contain `and`, `with`, `/`, or `&`. I checked its row set against the current canonical range. It distinguishes confirmed gaps/defects, evidence-needed candidates, context-sensitive identities and positive controls; the compound marker itself is never treated as proof that two complete curricula are required. This sweep includes all four explicit combined rows and is not a random sample.

Across the whole 140-row tranche, the detailed prior checkpoints also identify the non-compound and course/link cases in the first checkpoint above. The highest-risk row-specific defects already supported by item-level evidence remain 285, 288, 290, 292, 295, 304, 306, 311, 356, 386, 414, 415 and 418. Row 414’s prior one-course “undercoverage” claim is superseded by the specific ANS 409 title; its outcome/link review remains open. Row 420’s old wrong-component/no-TPM claim is superseded by the current 36-course Transport Management scope; the missing Social Sciences source occurrence and destination-link validation remain open. See [`jamb_ccmas_rows_281_420_independent_checkpoint_2026-09-26_01.md`](jamb_ccmas_rows_281_420_independent_checkpoint_2026-09-26_01.md) and the linked compound audit for cited course and source locators.

## Checkpoint 3 — checked versus unresolved as of 2026-09-26

“Checked” is reported at two levels so inventory reconciliation is not confused with source adjudication:

| Audit unit | Checked | Unresolved / not yet source-closed |
|---|---:|---:|
| Canonical identity rows and matching scope records | 140/140 reconciled by ordinal; exact names align | 140/140 still lack a verified exact JAMB awarder-table context in the current inventory |
| Parsed source offering occurrences | 149/149 inventoried and compared to the attached canonical identity/context | 149/149 lack a PDF-verified table row/locator in this tranche |
| Compound-name candidates | 54/54 screened and dispositioned in the companion audit | All context-sensitive/evidence-needed cases remain open until awarder cells and course evidence are verified |
| Selected scope course rows | 1,588/1,588 inventoried for title/component/content/outcome-field presence | 1,588/1,588 have not all been reconciled to exact NUC source pages/outcomes; 245 lack parsed outcomes and 346 lack content summaries |
| Scoped domain links | 645/645 inventoried by destination, match type and recorded course anchors | 645/645 have not all passed independent course-outcome, relationship-tier and descendant-task review |
| Fully closed identity rows under the requested exact-context + curriculum + link standard | 0/140 | 140/140 remain open |

Thus, the full tranche has been covered at the **record-inventory and candidate-triage level**, but it is not accurate to claim that all 140 have received completed exact-source semantic adjudication. The audit remains unresolved for all 140 under the user’s full acceptance standard; this is an evidence-coverage result, not a conclusion that all 140 mappings are defective or unavailable. The confirmed defects above are narrower, evidence-bounded findings. No shared mapping, seed, generator, override, or source inventory was changed.

### Append-only correction to Checkpoint 2

The external-source row cell in the class table contains an editing typo (`388–389? no:`). Its intended and verified row set is **284, 332, 375, 388, 419**. Row 389 is the partial CCMAS Nursing/Nursing Science record. The five class counts and all other row sets are unchanged.
