# Rows 141–280: increment 004 — Creative Arts offering-context and component check

Date: 2026-09-25  
Lane: rows 141–280, continuing after `agent-02-no-locator-batch-003-rows-253-263.md` and the prior five-combined-scope review.  
Status: audit-only incremental finding; no canonical mapping, scope, seed, SQL, or UI edits.

## Rechecked current records

The active canonical programme map has one `Creative Arts` identity with faculty `Arts and Humanities` and only Theatre Arts as its primary CCMAS mapping. The saved scope row 279 declares three candidate components—Arts::Theatre Arts, Arts::Film Production, and Arts::Music—but has no selected courses. The mapping/scope key is only the display name, not a source offering identity. The JAMB Arts and Education brochures must therefore be treated as separate contexts until exact institution/course associations establish otherwise.

## Primary-source findings

1. **JAMB Arts context:** the official Arts degree brochure lists `CREATIVE ARTS`, gives the option note “Visual Arts, Music & Theatre Arts, Films Studies,” and places DOU, LAGOS, PHC, UNN, and TASUED in the programme row (printed p. 140). This is stronger than the parsed `arts_hum_offerings.json` institution array, which spills many later programme headings and institution codes into the Creative Arts record. Use the PDF table boundary, not that contaminated array, for the Arts context. Source: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf, printed p. 140, checked 2026-09-25.
2. **JAMB Education context:** the official Education brochure separately lists `CREATIVE ARTS` under the Faculty of Education with TASUED (printed p. 322 in the indexed PDF). This is a distinct faculty/offering context, not proof that TASUED's Education offering should inherit the Arts curriculum scope. `education_offerings.json` currently has no parsed Creative Arts row, so this occurrence is missing from that structured source ledger. Source: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf, programme table around printed p. 322, checked 2026-09-25.
3. **Distinct CCMAS evidence:** NUC's Education CCMAS identifies B.A.(Ed.) Creative Arts Education as teacher preparation and describes it as a combination including Fine and Applied Arts, Music, Dance, Drama, crafts and language, with education courses and school-facing outcomes. This is not interchangeable with the general Arts `Creative Arts` listing. Source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf, Creative Arts Education programme section (printed p. 298 onward), checked 2026-09-25.
4. **Visual Arts component candidate:** NUC's Environmental Sciences CCMAS contains a separate Fine and Applied Arts programme (FAA/FCD record in the local extraction). Its stated scope is visual arts/design and studio practice; FAA 121 covers visual-art/design principles and colour; FAA 231 covers two-dimensional studio/design work; FAA 232 covers three-dimensional studio work; FAA 241 covers digital art/design. Those outcomes provide a substantive CCMAS candidate for the JAMB Arts `Visual Arts` option, which the current row-279 component list omits. This does **not** yet establish that every listed institution offers this option or that a whole Fine and Applied Arts curriculum should be attached to the Creative Arts identity. Sources: NUC Environmental Sciences CCMAS, printed pp. 222–224 and 233–237, https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf; local course extraction `data/career-mapping/ccmas/environmental_sciences.json`; checked 2026-09-25.

## Disposition

### Confirmed defects

- The current row-279 scope says combined-scope-evidenced/reviewed while selecting zero JAMB-specific courses; the prior audit already establishes this generator/contract status defect.
- The source key cannot represent both the Arts `Creative Arts` programme and the distinct Education-faculty Creative Arts offering under TASUED. The Education occurrence is absent from `education_offerings.json`.
- The current candidate component list omits Fine and Applied Arts despite the JAMB Arts row explicitly naming a Visual Arts option and NUC having a Fine and Applied Arts CCMAS with matching visual-art/design outcomes. This is a component-coverage gap to adjudicate, not authority to silently add the whole component.
- The Arts parsed institution array is contaminated by later Arts programme rows; it must not be used as a confirmed institution list.

### Still open

- Verify exact PDF table geometry/page for the Education entry and current brochure edition, and recover its exact course/degree label and any institution-specific requirement text.
- Determine, institution by institution, which Arts-context options are actually offered (Visual Arts; Music and Theatre Arts; Film Studies). The catalogue row's option note does not assign each option to each institution.
- Build a limited, outcomes-based selected course set from Theatre Arts, Film Production, Music, and—if source context confirms it—Fine and Applied Arts. Do not simply attach every course from four programmes.
- Inspect every one of row 279's 13 domain links and the relevant subgroups/roles only after the option-specific course set is established. The prior review's bounded D070/D042 and conditional D153 findings remain candidates, not approved paths.
- Reconcile the other four empty combined rows (245, 248, 266, 267) to original JAMB offering tables; the previous component/outcome review is not institution-context verification. Their existing parsed offering arrays show spillover/concatenation and cannot by themselves establish awarding institutions.

## Gate and scope

This increment verifies a concrete omitted visual-arts CCMAS candidate and a collapsed/missing Arts-vs-Education source context. It does not close row 279, the five combined scopes, or rows 141–280. No course was added to the JAMB scope and no domain link was promoted or removed.
