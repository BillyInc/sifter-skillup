# Rows 141–280: increment 006 — authoritative component/course recheck

Checked: 2026-09-25
Lane: rows 141–280; follows increments 003–005.
Status: evidence checkpoint only. No canonical mappings, scope rows, seeds, SQL, or UI changed.

## Audit result and scope boundary

The saved scope artifact has five `combined_ccmas_curriculum` rows in this tranche with `selected_courses: []`: rows 245 Dentistry and Dental Technology, 248 Medical Rehabilitation, 266 Forestry and Fisheries, 267 Forestry, Wildlife & Fisheries, and 279 Creative Arts. Increment 005 reported these as `combined_scope_evidenced` / `reviewed`; the current scope JSON now has `combined_scope_review_required` / `pending_review` for all five, with a reason that their offering-specific course/outcome slices and domain links are not verified. That is the correct fail-closed state. Their current audit-scope `domain_links` arrays are empty, but `jamb_domain_map.json` still retains respectively 20, 13, 16, 16, and 13 links. The per-link dispositions below assess those canonical-map links; they were not edited here.

The same JSON field is empty for some `single_ccmas_full_curriculum` rows (e.g. Marine Science, Biochemistry, Crop Science). Those are a different contract: an empty *partial/combined selected-course slice* is the defect under review here, not evidence by itself that a full single-programme curriculum is missing. Keep these cases distinct in audits.

This increment adds official NUC course/outcome locators and further documents the component-level disposition for the five already surfaced combined rows. It does not close the tranche. Partial blended rows 145/146 are also reaffirmed from increment 003 below; remaining tranche rows still need continued review.

## Five empty combined scopes: NUC CCMAS evidence and domain-link dispositions

### Row 245 — Dentistry and Dental Technology

Official NUC Medicine and Dentistry CCMAS identifies Dentistry as a distinct programme leading to BDS/BChD (printed pp. 15–16); its overview places dental science in the upper-level progression and core clinical dentistry in levels 500–600 (printed p. 164). This is evidence for the **Dentistry** component, not Dental Technology. Official NUC Allied Health CCMAS separately has a Dental Technology course structure (printed pp. 112–113) and DNT outcomes: DNT 201 covers physical/mechanical/biological properties, uses and handling of dental materials (printed pp. 123–124); DNT 203 covers dental-laboratory hazards, equipment, infection control and PPE (printed pp. 124–125); DNT 207 is Dental Laboratory Techniques I (course table, printed p. 112). These are distinct technician/laboratory learning outcomes, not dentist diagnosis and treatment.

**Link disposition against those distinct components:**

- D067 Dentistry — retain only as a candidate direct destination for the BDS component; it is not supported by the DNT component alone. Do not send Dental Technology students to the broad dentistry role family by name similarity.
- D068 Allied Health — candidate for the Dental Technology component only, with dental laboratory/technologist subgroup and role filtering; a broad allied-health role list is not established.
- D098 Precision Engineering/Toolmaking — at most a narrow dental-appliance fabrication task candidate; DNT 201 materials and DNT 207 laboratory technique do not establish general toolmaking or engineering roles.
- D109 Metal Processing/Foundry, D155 Nanotechnology/Advanced Materials, D103 Jewellery Making, D104 Pottery/Ceramics/Glass — not supported as destination domains by dental materials or dental-lab use. A material's use in dental work does not establish a career curriculum in industrial foundry, nanotechnology, jewellery, pottery or glassworking.
- The other canonical-map links remain unsupported or unestablished at their current broad destination/role breadth; the existing increment-005 table lists them individually. No link becomes confirmed merely because BDS and DNT are both declared as components.

**Disposition:** preserve separate BDS and Dental Technology paths. Select course rows/outcomes only after resolving each JAMB institution offering context. The combined display label must not imply that every institution offers both curricula.

### Row 248 — Medical Rehabilitation

Official NUC Allied Health CCMAS provides genuinely distinct Physiotherapy and Occupational Therapy evidence. Physiotherapy PST 202 (printed pp. 48–49) covers medical-rehabilitation scope, professional ethics, family involvement, regulation and communication; that introductory course alone does not establish sports therapy or exercise-science occupations. Occupational Therapy OCT 311 (printed pp. 465–466) explicitly covers OT’s role, scope, fields, practice framework, ethics, client handling, counselling and clinical reasoning; OCT 312 continues OT theory, assessment and intervention outcomes (printed p. 466). The CCMAS therefore supports two named professional components, but does not make their courses interchangeable.

**Link disposition:**

- D068 Allied Health — the strongest direct family-level candidate, but the student path must be limited to rehabilitation/physiotherapy/OT roles; unrelated radiography, biomedical and other allied-health roles are not implied.
- D154 Exercise Science/Sports Therapy — do not retain as direct on the current evidence. PST 202 is a scope/ethics course, and OCT 311/312 establish occupational-therapy practice, not sport-therapy preparation. Reconsider only if specific selected PT outcomes establish movement/exercise therapy and the downstream branch is similarly narrow.
- Wellness, neuroscience and community-health facets remain candidates only if named course outcomes establish them; they do not justify psychology/counselling, medicine, nursing, pharmacy, radiation therapy, alternative medicine or sports-management pathways.
- The other 10 broad links remain unsupported/unestablished at their current student-facing breadth, as itemized in increment 005.

**Disposition:** keep PT and OT scope evidence separate; no single unioned course set or inherited role list is justified by the label “Medical Rehabilitation.”

### Rows 266 and 267 — Forestry/Fisheries combinations

Official NUC Agriculture CCMAS provides course-level evidence for both subjects. AGR 203, Introduction to Forest Resources & Wildlife Management (printed pp. 43–44), has outcomes for identifying forest/wildlife species, raising economic-tree seedlings and explaining forestry/wildlife importance; its contents include forest ecology, silviculture, forest production/protection and sustainable harvest. AGR 205, Introduction to Fisheries and Aquaculture (printed pp. 44–45), has outcomes for fisheries/aquaculture systems, their management, economic/nutritional/environmental significance and sustainable development. The document also gives the dedicated Forest Resources and Wildlife Management specialization a separate structure including FWM 201–206; FWM 203 explicitly covers remote sensing and GIS applications (printed pp. 319–320), and FWM 204 covers forest resources/wildlife (printed pp. 330–331). This is stronger component evidence than title-matching alone, but it still does not prove the selected programme-specific course subset for either JAMB offering.

**Link disposition:**

- D121 Forestry/Wildlife Management — subject matter is supported by the forest/wildlife outcomes, but the destination taxonomy has a separately reported contamination issue in its subgroups/roles (increment 005). Do not expose its broad current branch until that is corrected; any eventual path must be forest/wildlife-specific.
- D120 Fisheries/Aquaculture — subject matter is supported by AGR 205, with a fisheries/aquaculture-specific path only.
- D072 Geospatial Science — plausible narrow support for row 267 only if FWM 203 is shown to belong to that JAMB offering; it does not license general surveying/geoscience roles. No transfer to row 266 without its own course-scope evidence.
- D041 Scientific Research — not established by generic research/project presence; require identified methods/statistics/project outcomes in the actual selected scope.
- D063 Economics, D047 Agricultural Science, D074 OHS, D144 Climate, D048 Food Science — no general career link from component names alone. Any retained link needs a specific course/outcome and a restricted role branch. D047 especially must not imply crop, livestock or veterinary learning absent from these names.
- Livestock, crop, veterinary, marketing, sales, environmental engineering and biomedical links remain unsupported at the present breadth; see increment 005 for the complete 16-link disposition.

**Source context remains asymmetric:** increment 005 records row 266 as catalogue-only in the accessible JAMB edition with no matching detailed institution row recovered, while row 267 has a distinct detailed `FORESTRY, WILDLIFE AND FISHERIES` table listing EKSU and OOU (printed p. 135 in the checked 2024 copy). Preserve that distinction. The live official IBASS PDF URL is listed below, but the browser text endpoint served a JavaScript shell during this check; do not call the archived-copy locator an independently retrieved live-PDF institution table.

### Row 279 — Creative Arts

Increment 005’s JAMB source review records the Arts brochure’s `CREATIVE ARTS` option set as Visual Arts, Music & Theatre Arts, and Film Studies (printed p. 140), plus a separate TASUED Faculty of Education `CREATIVE ARTS` entry (printed p. 322). These are not one universal curriculum. The saved refs Theatre Arts, Film Production, Music omit an explicit Fine and Applied Arts/Visual Arts component, while “Film Studies” should not automatically be normalized to the CCMAS programme “Film Production.” NUC has Fine and Applied Arts in Environmental Sciences and a separate Creative Arts Education programme in Education; those remain distinct candidate curriculum sources for the relevant option/context.

**Link disposition:**

- D070 Performing Arts & Entertainment — candidate direct path only for the Theatre Arts option; not all Music/Film/entertainment roles.
- D042 Media Production — candidate direct path only if the relevant JAMB Film option is resolved to a production curriculum and course outcomes; title similarity between Film Studies and Film Production is insufficient.
- D153 Music Production — conditional and narrow; require cited music/audio production outcomes, not merely Music or Theatre Arts.
- D044 Graphic Design — not currently established; a Visual Arts/Fine and Applied Arts component and actual design outcomes must first be selected for the relevant offering.
- Marketing/brand, journalism, esports/creator economy, UI/UX, recruitment, sales, game design, higher-education teaching and vocational instruction remain unsupported as general student destinations by the cited Arts courses. Instructor paths need pedagogy/education evidence.

**Disposition:** separate general Arts options and the TASUED Education context; resolve Visual Arts and Film Studies/Film Production before selecting courses. Do not show the current 13-link inherited set as a single confirmed path.

## Partial blended rows 145–146: component correction retained

Increment 003’s audit remains applicable: row 145 `COMPUTER SCIENCE WITH ECONOMICS` currently selects eight Computing courses and no Economics course; row 146 `COMPUTER SCIENCE AND MATHEMATICS` selects those CS courses plus MTH 101, MTH 102 and MTH 201, so mathematics is present and must not be called absent. I independently re-opened the official NUC PDFs:

- Social Sciences CCMAS Economics global structure lists ECO 101/102, ECO 103/104, ECO 201/203/205/207 (printed pp. 96–97). ECO 101 outcomes cover scarcity/choice, supply and demand, elasticity, production and market structures; ECO 102 covers national income, consumption, investment, public revenue/expenditure and money/foreign exchange; ECO 207 provides economics-specific mathematics (printed pp. 99–100 and 103–104).
- Computing CCMAS COS 201 outcomes cover structured programming and programming constructs (printed pp. 67–68); this verifies the computing foundation but does not fill the economics facet.
- Sciences CCMAS course tables/outcomes list MTH 101/102 and MTH 201 Mathematical Methods (printed pp. 220 and 334–335), corroborating the saved row-146 math courses. This does not establish that three courses represent the entire separate CCMAS Mathematics programme.

**Disposition:** row 145 has a confirmed missing named Economics facet; its active destination links still need re-grading from the actual scoped courses, and D063 Economics should not be added until the programme’s source offering and bounded Economics course slice are verified. Row 146 has real mathematics evidence but a still-open question about adequacy of the Mathematics component. Neither row’s inherited AI, cloud, blockchain, robotics or data-science links becomes supported by these component corrections; increment 003 provides the individual current-link findings.

## Source register (checked 2026-09-25)

Official NUC CCMAS documents:

- Medicine and Dentistry CCMAS: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf — printed pp. 15–16 and 164–165, Dentistry/BDS identity and sequence.
- Allied Health Sciences CCMAS: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf — printed pp. 112–113 and 123–125 (DNT), 48–49 (PST 202), 449–450 and 465–466 (OCT 311/312).
- Agriculture CCMAS: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf — printed pp. 43–45 (AGR 203/205), 319–331 (FWM course structure/outcomes).
- Arts CCMAS: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf — see option-specific course tables noted in increment 005; verify all current locators against the original before selecting courses.
- Environmental Sciences CCMAS: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf — Fine and Applied Arts structure/outcomes, noted in increment 005.
- Education CCMAS: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf — Creative Arts Education is a separate teacher-preparation curriculum.
- Social Sciences CCMAS: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf — printed pp. 96–100, 103–104, Economics component/course evidence.
- Computing CCMAS: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf — printed pp. 67–68, COS 201 outcomes.
- Sciences CCMAS: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf — printed pp. 220 and 334–335, mathematics course evidence.
- NUC CCMAS index (authoritative document directory): https://www.nuc.edu.ng/ccmas/

Official JAMB/IBASS source PDFs checked by URL on 2026-09-25 (the web text renderer returned a JavaScript shell for these PDFs; source-page content/locators are preserved from earlier increment-005 checks, with archived-copy cross-checks disclosed there):

- Medical: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf — catalogue and detailed dental/rehabilitation tables, see increment 005 locators.
- Agriculture: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf — catalogue p. 75; detailed row-267 locator p. 135 is cross-checked against the 2024 copy in increment 005; row 266 remains catalogue-only/unresolved in that edition.
- Arts: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf — printed pp. 140 and 322, as detailed above and in increment 005.

No external source proves the exact course schedule of every university in a JAMB table. These NUC sources establish authoritative national CCMAS course content/outcomes and distinguish the curriculum components; they do not substitute for resolving each institution-specific JAMB offering. Until that join and selected-course scope exist, the five combined rows remain unapproved and their broad inherited links must not be treated as confirmed student routes.

## Progress and next work

- Rows 245/248/266/267/279: component distinction and a conservative disposition recorded for all 78 current canonical-map links; no row has an offering-specific selected-course slice, so none is promoted. Current saved audit state is `pending_review` with empty scope-link arrays for all five.
- Rows 145/146: prior course/link review revalidated with official NUC locators; Economics absence in row 145 remains confirmed, Mathematics presence in row 146 reaffirmed.
- No closed missing-locator queue was re-audited in this increment.
- Continue rows 141–280 by locating other blended/partial names where the saved course set omits a substantive named component, then compare each actual course outcome with all linked domains and downstream branches. Keep closed locator batches closed unless a specific scope defect requires reopening. Do not alter canonical maps or seeds under this assignment.
