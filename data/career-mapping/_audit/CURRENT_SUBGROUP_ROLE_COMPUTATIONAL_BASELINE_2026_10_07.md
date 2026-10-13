# Current subgroup, role, and computational baseline — 2026-10-07

## Terminology and scope

In this project, **subgroup = area of specialization = area of practice**. These are one student-facing layer between a domain and its roles, not separate taxonomies or separate learning stages. This baseline uses “area of specialization” when discussing the intended model and notes when a file still contains the older subgroup representation.

The baseline separates three states:

- **Reviewed/recommended:** an audit or evidence ledger exists.
- **Corrected in an audit artifact:** a report or proposed decision changed, but the live canonical data did not.
- **Applied canonically:** the current source data used for seed generation was changed and the relevant verification was rerun.

## 1. Area-of-specialization (subgroup) layer

### Reviewed

- The global specialization reconciliation has dispositions for **all 168 domains** (`step1_decisions_dispositioned_count=168`).
- Its normalized, non-canonical catalog contains **708 area-of-specialization recommendations** across **164 domains**; **4 domains** are recommended to have no separate area layer. One D112 candidate, “Paper Converting and Finishing,” is explicitly folded into an existing area rather than treated as a separate area.
- The normalized catalog's latest source-card hydration resolves exact captured citations where the area recommendations name a stable source ID. It now has **184 area records without an area-specific citation**; 53 historical count variances remain explicitly recorded, while normalized counts are derived from the actual area rows. The canonical area-source linker has a separate and stricter result below.
- Separately, the current subgroup semantic register examined **88 domains with no visible area/subgroup**. It identified 16 with no active role mappings and recorded unresolved domain-structure decisions. This is an assessment of the old canonical layout, not proof that the new 708-area catalog was implemented.

### Canonical state

- `domain_structure.json` still contains **557 stored subgroup records**, of which **311 are active/visible** and 246 are excluded. The records retain the older ISCO-submajor-oriented structure.
- The 708 reconciled areas are now applied to `domain_structure.json` as `areas_of_specialization`, with stable `area_id` values, boundaries, and available source references. The legacy subgroup arrays are preserved for route compatibility.
- This is a canonical source-data application, not a student/API release: the areas remain `student_visible=false` because the current seed/API still expects ISCO subgroup keys and the role routes/evidence gates remain incomplete.
- The original apply exposed 457 area records without an exact area-linked source reference. After the source-backed D098 boundary repair and subsequent exact-label/source-ID reconciliation, the current canonical file has **573/708 areas with area-linked source references and 135 without**. The source linker updates only exact area-level evidence, not unrelated domain citations. **49 domains** retain open review/source notes, including **8** with parent/root/neighbor-scope-related notes that need adjudication. Four domains retain a resolved no-area recommendation.
- The materialization report's 53 historical count variances are not used to generate records: canonical counts are the actual keyed area records per domain. The source-link report enumerates all 135 residual area records; none were promoted to student visibility.
- The earlier subgroup-definition audit now reports: **7 derivation findings**, **6 threshold/over-clustering findings**, **24 empty/overlap skill findings**, zero label/description findings, and zero stored domain/subgroup role-count mismatches. The role-count repair changed only derived `role_count` fields; it did not convert the ISCO subgroup structure into the reconciled area-of-specialization structure.

## 2. Role-to-domain and role-to-area fit

### Role-to-domain: applied, with prior review limits

- The role-domain decision apply artifact is marked `APPLIED`: **3,899 decisions** matched **3,902 current rows** (three duplicate current keys were accounted for). It wrote supported, conditional, unsupported, and unresolved review metadata; it did not edit the domain or subgroup taxonomy.
- An additional **11 residual exact links** were resolved as unsupported for those exact parent-domain paths; role records were retained. **50** existing rows received review metadata completion, and **15 D119** direct-domain roles received review metadata. These are documented as separate follow-up applications, not subgroup changes.
- The current merged role source has **3,391 active unique roles**: **2,379** currently marked parent-domain supported and **1,012** conditional. The merged library also retains **554 unsupported/excluded records** for provenance. This confirms that the parent audit has materially changed current role metadata, but conditional active links remain and must not be promoted by area fit.

### Role-to-area: reviewed, with canonical area structure now applied but role routes still not complete

The latest lane artifacts cover all **3,391 active unique role keys** exactly once, but remain audit artifacts and show material residuals:

| Domain lane | Active unique roles | Area-supported | Direct domain route | Alias / review required | Canonical role/area route changes |
|---|---:|---:|---:|---:|---:|
| D001–D056 | 1,510 | 21 | 0 | 1,489 review | 0 |
| D057–D112 | 1,034 | 10 | 2 | 3 alias + 1,019 review | 0 |
| D113–D168 | 847 | 0 | 43 | 804 review | 0 |
| **Total** | **3,391** | **31** | **45** | **3 alias + 3,312 review** | **0** |

The D113–D168 artifact’s raw `area_fit_status` reports 55 direct-domain candidates, but its final disposition gates 12 on parent fit; only **43** direct routes are currently supported. The D057–D112 lane separately records 10 supported area fits, 2 direct routes, and 3 alias proposals; aliases are not counted as confirmed routes. Across lanes, **3,312** roles remain review-required for area/direct routing. The 1,012 conditional parent-domain links are a separate, potentially overlapping gate and must not be added to the 3,312.

The D057–D112 strict deterministic script exhaustively scored all 1,034 roles against same-domain area boundaries, but it only auto-supported **7** and left **1,027** residual. This was useful as candidate discovery, not a complete reconciliation. Its test suite passes, but its output is not a canonical fix. Prior explicit area decisions are retained for provenance and must be reconciled rather than discarded.

## 3. Computational coverage

- The catalogue-wide high-recall scan covered **168 domains**, finding **1,487 lexical candidate hits** in **122 domains**, including **87 candidate domains** without a declared computational layer. This is discovery evidence only; it does not establish that every hit warrants an area of specialization.
- Current declared scope contains **36 domains and 39 computational/method groups**. The follow-up source audit found **zero missing source layers**. Of the groups without a role-method link, **38/38** now have an explicit reviewed “do not add/infer a link” disposition; **zero** are missing that disposition.
- The current explicit cross-specialization role-method link file contains **4 D078 related-method links**. Those links are not new occupational titles and do not claim that quantitative/computational methods are required for every social-science role.
- **Three unmatched local role titles remain pending independent role review.** The residual audit reports zero canonical taxonomy changes and zero canonical role-file changes. Thus computational scope discovery and method-group dispositions are substantially reviewed, but candidate promotion and the three exact-title reconciliations are not complete.

## 4. What is genuinely complete versus still required

### Applied and verified

- Role-to-parent-domain review dispositions: applied to matched canonical role rows, with separate residual/metadata follow-up artifacts.
- Domain and area/subgroup role counts: corrected to the effective canonical routes; the rerun subgroup audit reports zero stored count mismatches.
- Computational method-group inventory/source coverage and all 38 no-link dispositions: audited; four explicit D078 links remain in the checked-in link file.

### Not yet complete

1. Finish evidence reconciliation for the applied 708 global areas: **135** records still lack an exact area-linked source reference and **49** domains retain open notes. The D098 boundary/source gap is fixed; the residuals need evidence-based dispositions, not fabricated citations.
2. Complete the canonical/API/seed integration for the applied area layer. The 708 records now exist canonically as `areas_of_specialization`, while legacy ISCO subgroup arrays are preserved and student visibility remains gated; role routing and consumer migration are not yet complete.
3. Reconcile role-to-area fit across all 3,391 active roles, including the 3,312 current review-required dispositions and three unconfirmed aliases; separately clear the 1,012 conditional parent-domain links before assigning a downstream area.
4. Resolve the D113–D168 direct-route aggregate inconsistency and verify every no-area/direct route against the reconciled canonical area set.
5. Finish the computational candidate adjudication for the 87 lexical-only domains and reconcile the three unmatched local titles; do not auto-create computational areas or role links from keyword hits.
6. After those fixes, regenerate the downstream seed inputs and run full subgroup/domain/role integrity, source, and student-route tests. No Supabase application is claimed by this baseline.

## Evidence artifacts inspected

- `data/career-mapping/_audit/role_to_subgroup_semantic_register_2026_10_06_current-canonical-final-2026-10-07.json` and its matching checkpoint.
- `data/career-mapping/domain_structure.json` and `data/career-mapping/domain_specialization_catalog.json`.
- `data/career-mapping/_audit/subgroup_definition_audit_2026-08-17.json`.
- `data/career-mapping/_audit/subgroup_effective_role_counts_2026_10_07.json` and its apply script/test.
- `data/career-mapping/_audit/role_domain_review_decision_apply_2026_10_07.json`, `residual_role_domain_holds_resolution_2026_10_07.json`, `existing_role_domain_review_metadata_completion_2026_10_07.json`, and `d119_direct_role_domain_review_apply_2026_10_07.json`.
- Role-area audit reports under `data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/{D001_D056,D057_D112,D113_D168}/`.
- `data/career-mapping/_audit/computational_coverage_report.json`, `computational_residual_resolution_2026_10_06.json`, and `data/career-mapping/computational_role_subgroup_links.json`.

## Verification run for this baseline

- `python data/career-mapping/_audit_subgroup_definition.py`
- `python data/career-mapping/_audit_computational_coverage.py`
- `python -m pytest data/career-mapping/_audit/test_subgroup_effective_role_counts_2026_10_07.py data/career-mapping/_audit/test_computational_residual_resolution_2026_10_06.py -q` — **10 passed**.

These checks validate current audit/count behavior; they do not close the canonical area-of-specialization integration or role-to-area residuals.
