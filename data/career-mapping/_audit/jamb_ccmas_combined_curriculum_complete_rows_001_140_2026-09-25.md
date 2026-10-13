# Rows 001–140: complete combined-curriculum issue inventory

Checked 2026-09-25. This supplements (and does not overwrite) the saved row-72
Accounting and Finance context/scope deliverable. It is a source-data/scope
issue register only: no JAMB mapping, course scope, domain link, downstream
record, role, seed, SQL or taxonomy was changed here.

## Method and limits

I re-screened the first 140 canonical rows in
`programme_mapping.json` against the same-order
`jamb_curriculum_scopes_2026-08-17.json` and the 001–140 reports already
checkpointed in this directory. The screen included titles containing
`and`, `with`, `/`, `&`, or `plus`, rows with multiple declared component
references, and additional source-context/extraction issues recorded by the
row reviews. It produced **78 title/component candidates**. This is a complete
inventory of this partition's surfaced candidates, not a claim that 78 are all
wrong or need a full two-degree curriculum union.

Classification:

- **Confirmed gap/defect** means the checked-in scope/context demonstrably
  omits or conflates a named facet, has no itemized scope where one is needed,
  or has a documented source-extraction/identity defect. It does not decide
  which entire programmes to union.
- **Source-needed candidate** means the title or scope raises a real question,
  but exact JAMB occurrence or course/outcome evidence is insufficient to
  establish a missing curriculum facet. Keep it unresolved; do not promote or
  label it unavailable.
- **No separate facet defect established** means the title is an exact CCMAS
  programme, an apparent naming variant, or current evidence indicates one
  integrated component. This is not blanket approval of its descendants.

The 001–140 occurrence inventory is not fully source-verified: parser tokens
and title indexes are not institution-table evidence. Existing checkpoints
report only a small number of visually/textually verified table occurrences.
For this reason the report distinguishes curriculum-layer defects from a
university-specific curriculum claim.

## A. Confirmed source/scope defects — repair remains open

| Row(s) | JAMB identity / issue | Evidence-backed disposition and safe next step |
|---:|---|---|
| 14–17 | Economics and Statistics; Economics and Development Studies; Economics with/and Operation Research; Peace and Development Studies | All four declare multiple CCMAS components but have zero selected course rows and `combined_scope_review_required`. **Confirmed empty-blend/scope defects.** Select bounded, outcome-supported courses from each named CCMAS facet, then reassess links. |
| 26, 28–29, 31, 34–36, 38–41, 43, 49–50, 52 | International/Comparative Politics; History + International Relations/Studies; Policy + Administration; Political Science + International Law/Diplomacy, Diplomacy, Public Administration, International Relations/Studies, Conflict Resolution or Defence; Government + Public Administration; Sociology + Anthropology; Sociology + Social Studies; Peace/Strategic studies | These rows have multiple component references and no selected course scope. Row 37 is deliberately excluded: it has 27 selected courses and is a different coverage question. **Confirmed empty-blend defects**; scope every named facet from CCMAS outcomes, using external primary curriculum sources only where CCMAS has no applicable component. Do not infer law, defence, anthropology or education content from the title. |
| 40 | Political Science and Conflict Resolution | Arts parser split/corrupted the title and treated `CONFLICT RESOLUTION` as an institution; the distinct Arts occurrence is missing from the inventory. **Confirmed parser/context defect.** Recover the official source row and retain the separate Social/Management occurrence. |
| 47 | Public Administration and Local Government | Official Administration/UNN occurrence was missing from the occurrence inventory; now documented in a separate checkpoint, distinct from the Social/Management occurrence. **Confirmed occurrence inventory gap**; this does not itself prove two different curricula. |
| 50 | Sociology and Anthroplogy | Empty combined scope; Anthropology is not represented by the saved Sociology/custom component join. **Confirmed scope/provenance gap.** Scope Sociology from its CCMAS and source Anthropology for the specific offering; reconcile existing course anchors first. |
| 52 | Sociology and Social Studies | Saved refs are Sociology + Development Studies, but no selected courses; Social Studies is not substantiated as a distinct course facet. **Confirmed empty-scope/facet gap.** Source Social Studies and compare outcomes before reassessing the stored direct/functional tier conflict. |
| 60 | Hotel and Tourism Management | The saved 26-row set contains duplicate course identities/variant titles. **Confirmed normalization defect.** Reconcile by source file + CCMAS programme + code + title before treating the count as unique coverage. |
| 63, 66, 69 | Finance; Secretarial Administration; Social Standards | Row 63's 20-course Finance slice differs from Banking and Finance without a source-based rationale; row 66's four OIM courses do not substantiate the broad title; row 69's cited NUC TOR is institutional standards/capacity material, not an undergraduate curriculum. **Confirmed rationale/coverage/source-type defects**, although the right bounded path may need sources. Compare exact course outcomes or use an appropriate authoritative curriculum; keep unsupported claims out. |
| 72 | Accounting and Finance | The saved name-keyed scope has FIN-only courses and no ACC course, while two distinct JAMB occurrence contexts are verified. **Confirmed representation/coverage issue; occurrence-specific union still unresolved.** The separate ACC CCMAS source record has now been repaired in this tranche; that repair does not authorize applying all ACC courses to either occurrence. Preserve MAP-003 (BCU/Administration) and MAP-004 (FEDOTUOKE/Social Sciences) independently; see the preserved row-72 scope specification. |
| 73 | Co-operative and Rural Development | Selected course records include missing parsed outcome fields. **Confirmed extraction/evidence gap.** Compare the source PDF and restore only readable source-supported outcomes. |
| 75 | Development and Communication Studies | Current saved scope is Development Studies only. The Communication and Media CCMAS contains a Development Communication strand, so a missing second programme cannot yet be assumed. **Reclassified as a source-needed candidate, not a confirmed omitted component.** Verify occurrence and course/outcome fit; it may be a bounded strand inside a relevant component. |
| 77 | Insurance and Actuarial Science | Scope has Insurance courses only; separate Actuarial Science outcomes are absent, and the local actuarial extraction has course-code/title conflicts. **Confirmed component and source-extraction gap.** Reconcile the NUC actuarial record first; then build a bounded actuarial course slice. |
| 78 | Office and Information Technology / Information Resource Management | Current IRM slice contains a duplicate code and an empty outcome; the title's IT facet is not substantiated by the selected set. **Confirmed extraction/scope-evidence defect.** Reconcile the source course and establish the IT facet with outcomes. |
| 79 | Accountancy and Forensic Studies | The two-course Accounting slice does not substantiate the Forensic Studies facet. **Confirmed insufficient scope.** Compare Accounting and Forensic Science course outcomes and exact offering context; don't infer forensic practice from the Accounting title. |
| 87 | Accounting and Data Analytics | Selected Accounting scope does not demonstrate a data-analytics sequence. ACC 311 is only a partial lead. **Confirmed named-facet coverage gap.** Reconcile ACC source records (now corrected in this tranche) and assess its outcomes; add only explicit analytical course evidence or authoritative external curriculum material. |
| 89 | Agribusiness and Economics | Saved scope is Economics-only although a separate Agribusiness CCMAS exists. **Confirmed named-facet omission at the scope layer.** Verify the exact JAMB occurrence and select relevant agribusiness/economics outcomes; no full-package union is presumed. |
| 116 | Plant Science and Biotechnology | Scope selects Biotechnology only; one plant-biotechnology course does not represent the separate broad Plant Science/Botany sequence. **Confirmed facet underrepresentation.** Add only outcome-supported Plant Science courses for the exact occurrence. |
| 129 | Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics | Scope selects Statistics only (17 rows); Statistics includes mathematical foundations but no explicit separate Mathematics component. **Confirmed underrepresentation, not “no mathematics.”** Reconcile slash variants/source contexts and compare relevant Math/Statistics outcomes before a bounded scope correction. |
| 135 | Mathematics with Computer Science | Computing scope contains MTH 101/102/201, so mathematics is not absent; it lacks a separate Mathematics component and those three courses do not establish a full Mathematics curriculum. **Confirmed partial-facet representation; extent is evidence-needed.** Compare both CCMAS sequences and exact offering context; do not import all Mathematics automatically. |
| 136 | Applied Microbiology and Brewing / Applied Microbiology | Two differently named variants are collapsed in one slash-joined canonical identity/context, and the selected MCB set has no Brewing Science and Technology component. **Confirmed identity/scope defect.** Preserve brewing-named and plain Applied Microbiology occurrences separately; restrict the brewing curriculum to the former. |

## B. Source-needed candidates — do not call these proven gaps yet

| Row(s) | Candidate facet / current representation | What authoritative evidence must settle |
|---:|---|---|
| 2, 3 | Islamic Law/Sharia Law; Common and Islamic Law | Row 3 is already an exact CCMAS Common and Islamic Law component; row 2 is a title variant mapped to it. Check whether the partial 11-course slice for row 2 is adequate to its named stream; no separate second degree is established by the slash. |
| 4 | Public and International Law; six selected Law courses | Determine whether the relevant NUC Law courses cover the public/international subjects named, or whether the JAMB title points to a distinct bounded curriculum. Check exact JAMB source context. |
| 5, 9 | Criminology and Security Studies | Exact CCMAS component is referenced and `full` scope status uses parent inheritance (zero explicit selected rows is not a missing-scope defect). Check source occurrence and downstream claims only if needed. |
| 7 | Criminology and Penology; 18 selected CSS courses | Compare the selected outcomes against penology and criminology; determine whether penology is integrated or needs a bounded additional course set. |
| 10–12 | Demography and Social Statistics; Demography and Statistics; Demography and Social Studies | Row 10 is the exact CCMAS programme and uses full-parent inheritance. Rows 11–12 have partial scopes; verify the Statistics/Social Studies facets and outcomes. Social Statistics/math content is a positive control, not proof of a separate full degree curriculum. |
| 18–19, 59, 98 | Industrial Relations / Personnel / Human Resources variants | The current component is Employment and Human Resource Management. Verify title variants and selected-course coverage; no second CCMAS programme is inferred just from slashes or synonymous naming. |
| 20 | Intelligence and Security Studies | 18 custom rows lack itemized authoritative degree-handbook/external curriculum provenance. This is a **source-needed** custom-programme issue, not a CCMAS union. |
| 22–23, 25, 27, 99 | International Relations with Diplomacy/Strategic/Studies variants | Current IR component contains relevant studies, but exact JAMB variants and course outcomes must establish whether diplomacy/strategy is a strand, a separate component, or a source-context difference. For row 99, an International Law course is not legal-practice qualification. |
| 30, 37, 48 | Policy/Strategic; Political and Administrative; Public Administration and Policy Studies | Existing scopes contain Political Science/Public Administration material in different combinations. Check outcomes for policy/administration/strategy; row 37's non-empty 27-course scope is not a confirmed zero-scope defect. |
| 42, 44 | Peace Studies and Conflict Resolution; Peace and Conflict Studies | Row 42 is an exact CCMAS title under full-parent inheritance. Row 44 has a 20-course partial scope. Compare outcomes before claiming the latter is insufficient or equivalent. |
| 47 | Public Administration and Local Govt | Occurrence inventory gap is confirmed/fixed as a distinct source row; whether the 26 selected Public Administration courses cover the local-government facet remains a course-outcome question. |
| 53, 63, 72, 80, 88 | Banking and Finance; Finance; Accounting and Finance; Finance and Investment; Finance and Financial Technology | Distinguish FIN (Finance/Banking and Finance) from Securities and Investments Management and from technology-specific topics. Row 63 has a confirmed rationale gap; row 72 has two verified source contexts and repaired ACC source data. For 80/88, determine whether the FIN package (including any directly named investment/FinTech outcomes) already covers the facet before adding another component. |
| 73–74, 76 | Co-operative and Rural Development; Logistics and Supply Chain Management; Transport and Logistics Management | Row 73 has missing outcomes (confirmed); row 74 is an exact Logistics/SCM parent under full inheritance; for row 76 check if logistics is taught within Transport Management or needs a distinct course slice. |
| 75 | Development and Communication Studies | Communication and Media includes a Development Communication strand. Determine whether this is a strand-level fit rather than a second complete component. |
| 81, 83, 86 | Securities and Investment; Entrepreneurship and Innovation; Employment and Human Resource Management | These are close to named CCMAS programme components; verify alias/title equivalence and selected-scope completeness. No independent extra degree curriculum is established solely by the conjunction. |
| 91–94 | Cooperative Economics and Management; Social Innovation and Entrepreneurship; Entrepreneurship and Business Management; Transport and Tourism | Current scopes use CRD, Entrepreneurship or Transport Management parents. Compare named economics/social-innovation/business/tourism course outcomes; identify whether the title is an integrated programme, option or separate facet. |
| 96 | Aviation Security | Mapped to a 15-course Aviation Management slice with explicit security outcomes. The aviation-security domain is supported at a subject level; many broader saved downstream domains are overreach candidates, not confirmed career paths. Scope is not a substitute for descendant review. |
| 100 | Marketing and Consumer Studies | Marketing scope has consumer behaviour and consumer research content; exact JAMB institution row is unclear. Determine whether Consumer Studies is adequately covered within Marketing or requires a bounded external/CCMAS component. |
| 110 | Physics with Electronics | Exact CCMAS Physics with Electronics component is present as full-parent inheritance; no missing-electronics claim. Downstream electronics/servicing/robotics links need course-level review. |
| 122, 125 | Environmental Management and Toxicology; Information and Communication Technology | Each maps to a same-named CCMAS component under full-parent inheritance. No combined-scope omission established; item-level expansion/descendants are outside this scope issue. |
| 126 | Animal and Environmental Biology | Zoology scope has 23 selected courses. Compare animal and environmental-biology outcomes against Zoology, Biology and Ecology before asserting missing content or a second component. |
| 131, 134, 137 | Pure and Industrial Chemistry; Geology and Mining; Pure and Applied Chemistry | Current scopes are Industrial Chemistry-only (25), Geology-only (22) and Chemistry (23). The first two have named-facet coverage questions; the broad Chemistry curriculum may already integrate pure/applied topics. Compare exact source-course outcomes; do not assert a full second package without evidence. |
| 138–140 | Plant Biology; Plant Science; Genetics and Biotechnology | Botany scopes have 27/24 courses and Biotechnology has 15 with molecular-genetics/biotech outcomes. Similar names or overlapping content do not prove identity equivalence; check exact source contexts and whether the selected curriculum actually spans the named facet. |

## C. Partition-wide context, extraction and link review issues

These are separate from the title-component screen but affect whether a course
scope can be safely attached to a JAMB name:

- **Multi-faculty/context collisions:** rows 21, 25, 45, 46, 101, 108, 109,
  119, 133 and 139 are reported with distinct faculty/source contexts. A single
  name-keyed mapping is insufficient to prove the same curriculum at each
  institution. Preserve occurrence provenance; parsed institution counts are
  not authoritative table-cell verification.
- **Additional confirmed identity problems:** row 40's parser corruption and
  row 47's missing Administration occurrence are above; row 136 collapses
  distinct Applied Microbiology variants. These should be resolved before
  applying a named-component scope to a university.
- **Course evidence completeness:** the existing partition audit reports 14
  selected course rows without parsed outcomes and 36 without content
  summaries; row 73, row 78 and rows 90–91 have specifically documented
  omissions. Missing fields are source-extraction gaps, not license to infer
  outcomes from a title.
- **Scope-link locator quality:** 727 of 1,383 saved domain links lack a
  course-title locator. 112 identities have at least one active link outside
  their component's active-link union. These are review queues, not 727 proven
  false links or 112 confirmed mapping errors. Keep downstream link decisions
  separate until the curriculum scopes are repaired.
- **Historical classifications need adjudication:** prior notes called row 75
  a confirmed second-facet omission; the current component evidence shows
  Communication and Media includes a Development Communication strand. It is
  therefore retained as a source-needed question here, not a proven missing
  whole component. Likewise, rows 129 and 135 have real mathematics evidence;
  their question is adequacy, not total absence.

## D. Priority order; no downstream remapping before scope closure

1. Repair source extraction and identity/context defects: Accounting ACC source
   rows (completed as a source-only tranche), Actuarial Science, row 40 Arts
   parser, row 47 occurrence and row 136 variants.
2. Build outcome-anchored scopes for confirmed empty blends (14–17, 26,
   28–29, 31, 34–36, 38–41, 43, 49–50, 52) and clear named-facet gaps (72,
   77, 79, 87, 89, 116, 129, 135). Resolve exact JAMB contexts first where
   variants exist.
3. Close source-needed candidates by authoritative CCMAS course/outcome
   comparison and exact offering evidence. Use external primary curriculum
   sources only where CCMAS does not provide the named component.
4. Only after scope acceptance, re-evaluate per-programme/domain links and
   descendants. Unsupported or unresolved items remain out of confirmed
   student guidance. This checkpoint does not itself edit or approve them.

## Source/checkpoint index

- Full title/component screen and its primary source register:
  `whole_catalogue_420_jamb_ccmas_component_scope_screen_2026-09-25.md`.
- Existing detailed 001–140 row register:
  `partition-01-issue-register-rows-001-140-2026-09-25.md`.
- Existing 001–140 compound-facet re-audit:
  `coordinator-rows-001-140-compound-facet-reaudit-2026-09-25.md`.
- Preserved row-72 contexts and correction specification:
  `row-072-accounting-finance-context-scope-specification-2026-09-25.md`.
- NUC/JAMB URLs, printed page locators and access dates are recorded in those
  linked primary-source checkpoints. This inventory inherits their evidence
  citations; unresolved candidates remain explicitly unverified.

**Disposition:** candidate inventory for rows 001–140 is now consolidated.
Confirmed scope defects remain open until their course/outcome corrections
are independently sourced and accepted. Source-needed candidates are not
classified as true curriculum gaps. No JAMB mapping or downstream link was
changed by this report.
