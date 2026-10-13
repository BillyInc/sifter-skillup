# Course and JAMB mapping audit — 2026-09-11

This audit checks CCMAS course outlines and learning outcomes against the current domain matching gates, then follows each JAMB identity upstream to its resolved CCMAS component and reviewed curriculum scope.

## Summary

- CCMAS programmes checked: **237**
- Candidate rows checked: **5275** (scored candidates: **4718**)
- Active mapping rows checked: **1343**
- Active links failing the numeric course/outcome gate: **58**
- Active links needing semantic review after the numeric gate: **1**
- Omitted candidates: **3218**
- Omitted candidates that pass the numerical gate and need semantic review: **1691**
- Normalized JAMB identity collisions: **4**
- Brochure offering rows checked: **443**
- Repeated normalized offering identities audited: **67**
- Offering contexts resolved structurally: **63**
- Offering contexts still requiring manual source review: **4**
- JAMB→CCMAS component mismatches: **7**
- Reviewed-link materialization mismatches: **86**

A candidate passing the numerical gate is not automatically promoted: the course/outcome content must actually teach the destination domain. Generic matches such as a single occurrence of `statistics`, `computer`, `market`, or `product` remain review candidates.

## Sociology

Sociology is an exact JAMB→CCMAS Sociology inheritance. Its current top-level domain map includes Social Sciences and Data Science. Computational Social Science is a subgroup inside Social Sciences; data analyst and statistician are downstream roles in Data Science; Applied Statistics & Computational Modelling is a Data Science subgroup.

Requested target review:

- **Data Science** — omitted candidate; gate `passes_course_outcome_gate`; matched courses: 3; anchors: artificial intelligence, data analysis, data processing, statistics.
- **Quantitative Finance** — omitted candidate; gate `passes_count_but_needs_semantic_review`; matched courses: 3; anchors: economics, statistics.
- **Human Resources** — omitted candidate; gate `fails_course_outcome_gate`; matched courses: 1; anchors: human resources.
- **Marketing, Brand** — omitted candidate; gate `passes_course_outcome_gate`; matched courses: 2; anchors: customer, market, market research, marketing.
- **Product Management** — omitted candidate; gate `fails_course_outcome_gate`; matched courses: 0; anchors: none.
- **Supply Chain Management** — no scored candidate in the current CCMAS scorer; top-level domain; logistics/procurement/operations curriculum required.

## Upstream JAMB identity collisions

These are not automatically errors. They are mandatory review rows because the same normalized display name resolves to different faculty/discipline/CCMAS identities and must not share a domain map blindly.

- `anthropology`: ANTHROPOLOGY / None / Sciences / Biology / BIO; Anthropology / Arts and Humanities / Social Sciences (custom — no CCMAS standard) / None / None
- `libraryandinformationscience`: LIBRARY AND INFORMATION SCIENCE / Social/Management Sciences / Social Sciences / Library and Information Science / LIS; Library and Information Science / Education / Education / Library and Information Science / LIS
- `libraryscience`: LIBRARY SCIENCE / Social/Management Sciences / Social Sciences / Library and Information Science / LIS; Library Science / Education / Education / Library and Information Science / LIS
- `meteorology`: METEOROLOGY / Sciences / Sciences / None / MET; Meteorology / Engineering/Environmental/Technology / Sciences / Meteorology / MET

## Brochure offering-context resolution

A repeated brochure name is not automatically a data error. Same-component repeats are consolidated to one display identity while preserving institution and requirement contexts. Different exact JAMB identities are kept separate when their CCMAS track differs. Composite JAMB names retain their combined CCMAS components.

- `accountingandfinance` — **resolved_combined_ccmas_components**; names: Accounting and Finance; source faculties: Administration, Social/Management Sciences; CCMAS components: Administration and Management::Accounting, Administration and Management::Finance / Banking and Finance; requirement variants: 2; institutions: 2; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `actuarialscience` — **resolved_same_ccmas_identity_context**; names: Actuarial Science; source faculties: Administration, Social/Management Sciences; CCMAS components: Administration and Management::Actuarial Science; requirement variants: 2; institutions: 18; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `africanandasianstudies` — **resolved_combined_ccmas_components**; names: African and Asian Studies; source faculties: Arts and Humanities; CCMAS components: Arts::Chinese Studies, Arts::Igbo; requirement variants: 1; institutions: 6; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `anthropology` — **resolved_as_separate_exact_jamb_identities**; names: ANTHROPOLOGY, Anthropology; source faculties: Arts and Humanities, Sciences; CCMAS components: Sciences::Biology, __custom__::Anthropology; requirement variants: 2; institutions: 1; Normalized names are not merged because their exact JAMB names resolve to different CCMAS identities/tracks; each keeps its own downstream map.
- `biotechnology` — **resolved_same_ccmas_identity_context**; names: Biotechnology; source faculties: Agriculture, Sciences; CCMAS components: Sciences::Biotechnology; requirement variants: 1; institutions: 45; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `biotechnologyandmolecularbiology` — **resolved_combined_ccmas_components**; names: BIOTECHNOLOGY AND MOLECULAR BIOLOGY; source faculties: Sciences; CCMAS components: Sciences::Biology, Sciences::Biotechnology; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `chemistryandindustrialchemistry` — **resolved_combined_ccmas_components**; names: Chemistry and Industrial Chemistry; source faculties: Sciences; CCMAS components: Sciences::Chemistry, Sciences::Industrial Chemistry; requirement variants: 1; institutions: 2; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `computerscience` — **resolved_same_ccmas_identity_context**; names: Computer Science; source faculties: Engineering/Environmental/Technology, Sciences; CCMAS components: Computing::Computer Science; requirement variants: 2; institutions: 258; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `computerscienceandmathematics` — **resolved_combined_ccmas_components**; names: COMPUTER SCIENCE AND MATHEMATICS; source faculties: Sciences; CCMAS components: Computing::Computer Science, Sciences::Mathematics; requirement variants: 1; institutions: 3; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `computersciencewitheconomics` — **resolved_combined_ccmas_components**; names: COMPUTER SCIENCE WITH ECONOMICS; source faculties: Sciences; CCMAS components: Computing::Computer Science, Social Sciences::Economics; requirement variants: 1; institutions: 3; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `computersciencewithmathematics` — **resolved_combined_ccmas_components**; names: COMPUTER SCIENCE WITH MATHEMATICS; source faculties: Sciences; CCMAS components: Computing::Computer Science, Sciences::Mathematics; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `creativearts` — **resolved_combined_ccmas_components**; names: Creative Arts; source faculties: Arts and Humanities; CCMAS components: Arts::Film Production, Arts::Music, Arts::Theatre Arts; requirement variants: 1; institutions: 5; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `dentistryanddentaltechnology` — **resolved_combined_ccmas_components**; names: Dentistry and Dental Technology; source faculties: Medical/Pharmaceutical/Health; CCMAS components: Allied Health Sciences::Dental Technology, Medicine and Dentistry::Bachelor of Dental Surgery (BDS/BChD); requirement variants: 1; institutions: 27; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `economics` — **resolved_same_ccmas_identity_context**; names: Economics; source faculties: Administration, Arts and Humanities, Engineering/Environmental/Technology, Social/Management Sciences; CCMAS components: Social Sciences::Economics; requirement variants: 4; institutions: 197; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `economicsanddevelopmentstudies` — **resolved_combined_ccmas_components**; names: Economics and Development Studies; source faculties: Social/Management Sciences; CCMAS components: Social Sciences::Development Studies, Social Sciences::Economics; requirement variants: 1; institutions: 2; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `economicsandstatistics` — **resolved_combined_ccmas_components**; names: Economics and Statistics; source faculties: Social/Management Sciences; CCMAS components: Sciences::Statistics, Social Sciences::Economics; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `economicswithandoperationresearch` — **resolved_combined_ccmas_components**; names: Economics with/and Operation Research; source faculties: Social/Management Sciences; CCMAS components: Sciences::Industrial Mathematics, Social Sciences::Economics; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `farmmanagementagricextension` — **needs_manual_source_review**; names: Farm Management & Agric. Extension; source faculties: Agriculture; CCMAS components: Agricultural Science::Agricultural Economics, Agricultural Science::Agricultural Extension; requirement variants: 1; institutions: 4; The offering identity is mapped, but the brochure source-rule audit has no source candidate for: direct_entry, olevel, utme.
- `filmandvideostudies` — **resolved_same_ccmas_identity_context**; names: Film and Video Studies; source faculties: Administration, Social/Management Sciences; CCMAS components: Communication and Media Studies::FILM & MULTIMEDIA — P12, P13, P14; requirement variants: 2; institutions: 1; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `fisheries` — **resolved_same_ccmas_identity_context**; names: Fisheries; source faculties: Agriculture, Sciences; CCMAS components: Agricultural Science::Fisheries and Aquaculture; requirement variants: 2; institutions: 32; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `forestryandfisheries` — **resolved_combined_ccmas_components**; names: Forestry and Fisheries; source faculties: Agriculture; CCMAS components: Agricultural Science::Fisheries and Aquaculture, Agricultural Science::Forest Resources and Wildlife Management; requirement variants: 1; institutions: 14; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `forestrywildlifefisheries` — **resolved_combined_ccmas_components**; names: Forestry, Wildlife & Fisheries; source faculties: Agriculture; CCMAS components: Agricultural Science::Fisheries and Aquaculture, Agricultural Science::Forest Resources and Wildlife Management; requirement variants: 1; institutions: 2; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `frenchandgermanrussian` — **needs_manual_source_review**; names: French and German/Russian; source faculties: Arts and Humanities; CCMAS components: Arts::Modern European Languages (Russian), Arts::Modern European Languages B.A (French), Arts::Modern European Languages B.A (German); requirement variants: 1; institutions: 2; The offering identity is mapped, but the brochure source-rule audit has no source candidate for: direct_entry, olevel, utme.
- `geography` — **resolved_same_ccmas_identity_context**; names: Geography; source faculties: Engineering/Environmental/Technology, Sciences; CCMAS components: Environmental Sciences::Geography; requirement variants: 2; institutions: 13; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `geographyandenvironmentalmanagement` — **resolved_combined_ccmas_components**; names: Geography and Environmental Management; source faculties: Sciences; CCMAS components: Environmental Sciences::Environmental Management, Environmental Sciences::Geography; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `geographyandgeosciences` — **resolved_combined_ccmas_components**; names: Geography and Geosciences; source faculties: Sciences; CCMAS components: Environmental Sciences::Geography, Sciences::Geology; requirement variants: 1; institutions: 2; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `governmentandpublicadministration` — **resolved_combined_ccmas_components**; names: Government and Public Administration; source faculties: Social/Management Sciences; CCMAS components: Administration and Management::Public Administration, Social Sciences::Political Science; requirement variants: 1; institutions: 2; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `historyandinternationalrelations` — **resolved_combined_ccmas_components**; names: History and International Relations; source faculties: Social/Management Sciences; CCMAS components: Arts::History/History and Diplomatic Studies, Social Sciences::International Relations; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `historyandinternationalstudies` — **resolved_combined_ccmas_components**; names: History and International Studies; source faculties: Social/Management Sciences; CCMAS components: Arts::History/History and Diplomatic Studies, Social Sciences::International Relations; requirement variants: 1; institutions: 3; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `historyandstrategicstudies` — **resolved_combined_ccmas_components**; names: History and Strategic Studies; source faculties: Arts and Humanities; CCMAS components: Arts::History/History and Diplomatic Studies, Social Sciences::International Relations; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `homeeconomicsandhotelmanagement` — **needs_manual_source_review**; names: Home Economics and Hotel Management; source faculties: Education; CCMAS components: Administration and Management::Hospitality and Tourism Management, Education::Home Economics; requirement variants: 1; institutions: 201; The offering identity is mapped, but the brochure source-rule audit has no source candidate for: direct_entry, olevel, utme.
- `industrialmathematicsandcomputerscience` — **resolved_combined_ccmas_components**; names: Industrial Mathematics and Computer Science; source faculties: Sciences; CCMAS components: Computing::Computer Science, Sciences::Industrial Mathematics; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `industrialphysicswithappliedgeophysics` — **resolved_combined_ccmas_components**; names: Industrial Physics with Applied Geophysics; source faculties: Sciences; CCMAS components: Sciences::Applied Geophysics, Sciences::Industrial Physics; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `industrialphysicswithelectronicsanditapplication` — **resolved_combined_ccmas_components**; names: Industrial Physics with Electronics and IT Application; source faculties: Sciences; CCMAS components: Sciences::Industrial Physics, Sciences::Physics with Electronics; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `informationscienceandmediastudies` — **resolved_same_ccmas_identity_context**; names: INFORMATION SCIENCE AND MEDIA STUDIES; source faculties: Sciences, Social/Management Sciences; CCMAS components: Communication and Media Studies::INFORMATION AND MEDIA STUDIES — P12, P13, P14; requirement variants: 1; institutions: 3; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `insuranceandactuarialscience` — **resolved_combined_ccmas_components**; names: Insurance and Actuarial Science; source faculties: Administration; CCMAS components: Administration and Management::Actuarial Science, Administration and Management::Insurance; requirement variants: 1; institutions: 3; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `internationalandcomparativepolitics` — **resolved_combined_ccmas_components**; names: International and Comparative Politics; source faculties: Social/Management Sciences; CCMAS components: Social Sciences::International Relations, Social Sciences::Political Science; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `internationalrelations` — **resolved_same_ccmas_identity_context**; names: International Relations; source faculties: Administration, Social/Management Sciences; CCMAS components: Social Sciences::International Relations; requirement variants: 2; institutions: 60; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `internationalstudiesanddiplomacy` — **resolved_same_ccmas_identity_context**; names: International Studies and Diplomacy; source faculties: Administration, Social/Management Sciences; CCMAS components: Social Sciences::International Relations; requirement variants: 1; institutions: 2; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `libraryandinformationscience` — **resolved_as_separate_exact_jamb_identities**; names: LIBRARY AND INFORMATION SCIENCE, Library and Information Science; source faculties: Education, Sciences, Social/Management Sciences; CCMAS components: Education::Library and Information Science, Social Sciences::Library and Information Science; requirement variants: 1; institutions: 220; Normalized names are not merged because their exact JAMB names resolve to different CCMAS identities/tracks; each keeps its own downstream map.
- `libraryscience` — **resolved_as_separate_exact_jamb_identities**; names: LIBRARY SCIENCE, Library Science; source faculties: Education, Social/Management Sciences; CCMAS components: Education::Library and Information Science, Social Sciences::Library and Information Science; requirement variants: 2; institutions: 7; Normalized names are not merged because their exact JAMB names resolve to different CCMAS identities/tracks; each keeps its own downstream map.
- `masscommunication` — **resolved_same_ccmas_identity_context**; names: Mass Communication; source faculties: Administration, Arts and Humanities; CCMAS components: Communication and Media Studies::MASS COMMUNICATION — P12, P13, P14; requirement variants: 2; institutions: 21; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `mathematicswithcomputerscience` — **resolved_combined_ccmas_components**; names: Mathematics with Computer Science; source faculties: Sciences; CCMAS components: Computing::Computer Science, Sciences::Mathematics; requirement variants: 1; institutions: 5; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `medicalrehabilitation` — **resolved_combined_ccmas_components**; names: Medical Rehabilitation; source faculties: Medical/Pharmaceutical/Health; CCMAS components: Allied Health Sciences::Occupational Therapy, Allied Health Sciences::Physiotherapy; requirement variants: 1; institutions: 162; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `meteorology` — **resolved_same_ccmas_identity_context**; names: METEOROLOGY, Meteorology; source faculties: Engineering/Environmental/Technology, Sciences; CCMAS components: Sciences::Meteorology; requirement variants: 2; institutions: 7; Exact/case variants resolve to one CCMAS component; institution and requirement variants are retained. The declared name alias is applied.
- `optometry` — **resolved_same_ccmas_identity_context**; names: Optometry; source faculties: Medical/Pharmaceutical/Health, Sciences; CCMAS components: Allied Health Sciences::Optometry; requirement variants: 2; institutions: 18; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `peaceanddevelopmentstudies` — **resolved_combined_ccmas_components**; names: Peace and Development Studies; source faculties: Social/Management Sciences; CCMAS components: Social Sciences::Development Studies, Social Sciences::Peace Studies and Conflict Resolution; requirement variants: 1; institutions: 2; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `peacestrategicandconflictresolution` — **resolved_combined_ccmas_components**; names: Peace Strategic and Conflict Resolution; source faculties: Social/Management Sciences; CCMAS components: Social Sciences::International Relations, Social Sciences::Peace Studies and Conflict Resolution; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `physicalscienceswithoptionsiniindustrialphysicsiiphysicswithelectronics` — **needs_manual_source_review**; names: Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics); source faculties: Sciences; CCMAS components: Sciences::Industrial Physics, Sciences::Physics with Electronics; requirement variants: 1; institutions: 1; The offering identity is mapped, but the brochure source-rule audit has no source candidate for: direct_entry, olevel, utme.
- `plantscience` — **resolved_same_ccmas_identity_context**; names: Plant Science; source faculties: Agriculture, Sciences; CCMAS components: Sciences::Botany; requirement variants: 2; institutions: 6; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `policyandadministrativestudies` — **resolved_combined_ccmas_components**; names: Policy and Administrative Studies; source faculties: Social/Management Sciences; CCMAS components: Administration and Management::Public Administration, Social Sciences::Political Science; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `politicalscienceandconflict` — **resolved_combined_ccmas_components**; names: Political Science and Conflict; source faculties: Arts and Humanities; CCMAS components: Social Sciences::Peace Studies and Conflict Resolution, Social Sciences::Political Science; requirement variants: 1; institutions: 9; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `politicalscienceandconflictresolution` — **resolved_combined_ccmas_components**; names: Political Science and Conflict Resolution; source faculties: Social/Management Sciences; CCMAS components: Social Sciences::Peace Studies and Conflict Resolution, Social Sciences::Political Science; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `politicalscienceanddiplomacy` — **resolved_combined_ccmas_components**; names: Political Science and Diplomacy; source faculties: Social/Management Sciences; CCMAS components: Social Sciences::International Relations, Social Sciences::Political Science; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `politicalscienceandinternationalrelations` — **resolved_combined_ccmas_components**; names: Political Science and International Relations; source faculties: Social/Management Sciences; CCMAS components: Social Sciences::International Relations, Social Sciences::Political Science; requirement variants: 1; institutions: 9; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `politicalscienceandinternationalstudies` — **resolved_combined_ccmas_components**; names: Political Science and International Studies; source faculties: Social/Management Sciences; CCMAS components: Social Sciences::International Relations, Social Sciences::Political Science; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `politicalscienceandpublicadministration` — **resolved_combined_ccmas_components**; names: Political Science and Public Administration; source faculties: Social/Management Sciences; CCMAS components: Administration and Management::Public Administration, Social Sciences::Political Science; requirement variants: 1; institutions: 7; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `politicalscienceinternationallawanddiplomacy` — **resolved_combined_ccmas_components**; names: Political Science / International Law and Diplomacy; source faculties: Social/Management Sciences; CCMAS components: Social Sciences::International Relations, Social Sciences::Political Science; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `portugueseenglish` — **resolved_combined_ccmas_components**; names: Portuguese/English; source faculties: Arts and Humanities; CCMAS components: Arts::English Language and Literature, __custom__::Portuguese; requirement variants: 1; institutions: 6; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `psychology` — **resolved_same_ccmas_identity_context**; names: Psychology; source faculties: Arts and Humanities, Social/Management Sciences; CCMAS components: Social Sciences::Psychology; requirement variants: 2; institutions: 59; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `publicadministration` — **resolved_same_ccmas_identity_context**; names: Public Administration; source faculties: Administration, Social/Management Sciences; CCMAS components: Administration and Management::Public Administration; requirement variants: 2; institutions: 114; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `sociology` — **resolved_same_ccmas_identity_context**; names: Sociology; source faculties: Arts and Humanities, Social/Management Sciences; CCMAS components: Social Sciences::Sociology; requirement variants: 2; institutions: 98; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `sociologyandsocialstudies` — **resolved_combined_ccmas_components**; names: Sociology and Social Studies; source faculties: Social/Management Sciences; CCMAS components: Social Sciences::Development Studies, Social Sciences::Sociology; requirement variants: 1; institutions: 1; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.
- `softwareengineering` — **resolved_same_ccmas_identity_context**; names: Software Engineering; source faculties: Engineering/Environmental/Technology, Sciences; CCMAS components: Computing::Software Engineering; requirement variants: 2; institutions: 100; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `sportscience` — **resolved_same_ccmas_identity_context**; names: Sport Science; source faculties: Education, Sciences; CCMAS components: __custom__::Sport Science; requirement variants: 2; institutions: 2; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `statistics` — **resolved_same_ccmas_identity_context**; names: Statistics; source faculties: Engineering/Environmental/Technology, Sciences; CCMAS components: Sciences::Statistics; requirement variants: 2; institutions: 99; The same exact JAMB name appears in multiple brochure faculty blocks, but resolves to one CCMAS component; source variants are retained.
- `statisticseducation` — **resolved_combined_ccmas_components**; names: Statistics Education; source faculties: Education; CCMAS components: Education::Mathematics, Sciences::Statistics; requirement variants: 1; institutions: 4; The exact JAMB name intentionally inherits multiple CCMAS components; the combined curriculum scope is retained.

LIS is resolved as two exact identities, not merged: `LIBRARY SCIENCE`/`LIBRARY AND INFORMATION SCIENCE` in the Social/Management track and title-case Education variants in the Education track. The JSON artifact retains every repeated name/faculty/source context, including institution lists and requirement fields, so university-specific offerings cannot silently inherit a different CCMAS track.

The only offering-context groups still requiring manual source review are listed below. They are not promoted as source-complete merely because a JAMB-to-CCMAS mapping exists:

- `farmmanagementagricextension` — Farm Management & Agric. Extension; missing source layers: direct_entry, olevel, utme.
- `frenchandgermanrussian` — French and German/Russian; missing source layers: direct_entry, olevel, utme.
- `homeeconomicsandhotelmanagement` — Home Economics and Hotel Management; missing source layers: direct_entry, olevel, utme.
- `physicalscienceswithoptionsiniindustrialphysicsiiphysicswithelectronics` — Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics); missing source layers: direct_entry, olevel, utme.

## Remaining data-review inventory

These categories are intentionally not hidden behind a generic `ready` label:

- Requirement layers: **1260** across UTME, O-level and Direct Entry; source variants preserved: **2721**.
- UTME layers needing requirement-structure review: **56**; no-source-candidate layers: **40**.
- O-level layers needing requirement-structure review: **84**; empty layers: **172**; no-source-candidate layers: **40**.
- Direct Entry layers with no catalogue rule: **178**; no-source-candidate layers: **40**.
- Source-blank variants: **17**.
- University-specific exception rows in the generated seed: **3896**; structured subject options: **1789**; exception statuses: `{'not_subject_rule': 1272, 'parsed': 1775, 'needs_review': 849}`.
- Generated offering seed check: **8117** rows and university UTME/O-level/Direct Entry columns emitted: **True**.
- Active programme-domain links failing the evidence gate: **58**; active links needing semantic review: **1**.
- Unverified programme-domain links retained outside active guidance: **714**.

Requirement review rows and no-source rows remain eligible for manual completion only; they must not be turned into inferred subject rules. Domain-link review is a separate CCMAS curriculum audit and does not mean the JAMB identity itself is broken.

## Upstream consistency

- Canonical JAMB rows missing from the active JAMB map: **0**.
- Active JAMB rows missing from the canonical inheritance artifact: **0**.
- JAMB→CCMAS component mismatches: **7**.
- Canonical review rows upgraded by the current reviewed-link layer: **0**; these are review-backed upgrades, not silent full-curriculum inheritance.
- Reviewed-link rows compared with the active JAMB map: **86**; materialization mismatches: **86**.

## Highest-priority omitted candidates

These are review candidates only; they require semantic confirmation before promotion.

- `Education::Early Childhood Education` → **Economics** (D063), score 1.403; passes_course_outcome_gate; anchors: economic, economics, finance, macroeconomics, market, microeconomics.
- `Education::Adult and Continuing Education` → **Early Childhood Education, Nursery** (D127), score 1.346; passes_course_outcome_gate; anchors: child protection, social development.
- `Education::Integrated Science` → **Economics** (D063), score 1.323; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Special Needs Education` → **Economics** (D063), score 1.306; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Early Childhood Education` → **Quantitative Finance** (D011), score 1.291; passes_count_but_needs_semantic_review; anchors: economics, statistics.
- `Education::Adult and Continuing Education` → **Economics** (D063), score 1.29; passes_course_outcome_gate; anchors: economic, economics, finance, macroeconomics, market, policy.
- `Education::Guidance and Counselling` → **Economics** (D063), score 1.29; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::History` → **Economics** (D063), score 1.29; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Islamic Studies` → **Economics** (D063), score 1.29; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Technology Education` → **Economics** (D063), score 1.274; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Early Childhood Education` → **Trading** (D062), score 1.26; passes_course_outcome_gate; anchors: economics, trading.
- `Education::Efik-Ibibio Education` → **Economics** (D063), score 1.258; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Arabic` → **Economics** (D063), score 1.242; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Christian Religious Studies` → **Economics** (D063), score 1.242; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, statistics.
- `Education::Educational Technology` → **Economics** (D063), score 1.242; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Business Education` → **Trading** (D062), score 1.24; passes_course_outcome_gate; anchors: economics, financial analysis, financial management, financial markets, financial statements, trading.
- `Education::Business Education` → **Investment Analysis** (D013), score 1.234; passes_course_outcome_gate; anchors: economics, financial analysis, financial management, financial markets, financial statements.
- `Education::Business Education` → **Social Welfare, Youth Services** (D128), score 1.231; passes_course_outcome_gate; anchors: social justice.
- `Education::Chemistry` → **Economics** (D063), score 1.226; passes_course_outcome_gate; anchors: economic, finance, market, policy, politics, statistics.
- `Education::Health Education` → **Economics** (D063), score 1.226; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Early Childhood Education` → **Human Resources** (D029), score 1.212; passes_course_outcome_gate; anchors: human resource management, human resources, personnel management.
- `Education::Human Kinetics/Physical Education` → **Economics** (D063), score 1.21; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Business Education` → **Quantitative Finance** (D011), score 1.205; passes_course_outcome_gate; anchors: economics, financial markets, statistics.
- `Education::Adult and Continuing Education` → **Investment Analysis** (D013), score 1.199; passes_course_outcome_gate; anchors: economics, financial management, financial statements.
- `Education::Adult and Continuing Education` → **Trading** (D062), score 1.198; passes_course_outcome_gate; anchors: economics, financial management, financial statements, trading.
- `Education::Guidance and Counselling` → **Social Welfare, Youth Services** (D128), score 1.192; passes_course_outcome_gate; anchors: social justice, youth.
- `Education::Early Childhood Education` → **Investment Analysis** (D013), score 1.191; passes_count_but_needs_semantic_review; anchors: economics.
- `Education::Technology Education` → **Marketing, Brand** (D030), score 1.182; passes_course_outcome_gate; anchors: advertising, brand, consumer, customer, market, market research.
- `Education::Early Childhood Education` → **Social Sciences** (D078), score 1.181; passes_course_outcome_gate; anchors: economics, geography, mathematics, research design, social science, social sciences.
- `Education::Adult and Continuing Education` → **Human Resources** (D029), score 1.177; passes_course_outcome_gate; anchors: adult education, human resource management, human resources, personnel management.
- `Education::Creative Arts Education` → **Economics** (D063), score 1.177; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Social Studies and Civic Education` → **Economics** (D063), score 1.177; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Agricultural Education` → **Social Welfare, Youth Services** (D128), score 1.173; passes_course_outcome_gate; anchors: social justice.
- `Education::Early Childhood Education` → **Social Welfare, Youth Services** (D128), score 1.173; passes_course_outcome_gate; anchors: social justice, social sciences, youth.
- `Education::Business Education` → **Social Sciences** (D078), score 1.172; passes_course_outcome_gate; anchors: economics, mathematics, research design, sociology, statistics.
- `Education::Islamic Studies` → **Social Sciences** (D078), score 1.172; passes_course_outcome_gate; anchors: economics, geography, research design, sociology, statistics.
- `Education::Educational Technology` → **Human Resources** (D029), score 1.168; passes_course_outcome_gate; anchors: adult education, human resource management, human resources, personnel management.
- `Education::Agricultural Education` → **Trading** (D062), score 1.167; passes_course_outcome_gate; anchors: economics, trading.
- `Education::Adult and Continuing Education` → **Marketing, Brand** (D030), score 1.164; passes_course_outcome_gate; anchors: advertising, brand, consumer, customer, market, market research.
- `Education::Educational Management` → **Economics** (D063), score 1.161; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Mathematics` → **Economics** (D063), score 1.161; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Primary Education` → **Economics** (D063), score 1.161; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Engineering::AGRICULTURAL AND BIOSYSTEMS ENGINEERING` → **Economics** (D063), score 1.161; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::History` → **Social Welfare, Youth Services** (D128), score 1.154; passes_course_outcome_gate; anchors: social justice, youth.
- `Education::Special Needs Education` → **Social Welfare, Youth Services** (D128), score 1.154; passes_course_outcome_gate; anchors: social justice, youth.
- `Education::Early Childhood Education` → **Marketing, Brand** (D030), score 1.153; passes_course_outcome_gate; anchors: advertising, brand, consumer, customer, market, market research.
- `Education::Special Needs Education` → **Social Sciences** (D078), score 1.147; passes_course_outcome_gate; anchors: economics, geography, mathematics, research design, social science, sociology.
- `Education::Technology Education` → **Social Sciences** (D078), score 1.147; passes_course_outcome_gate; anchors: economics, geography, research design, sociology, statistics.
- `Education::Physics` → **Economics** (D063), score 1.145; passes_course_outcome_gate; anchors: economic, economics, market, policy, politics, statistics.
- `Engineering::ENVIRONMENTAL ENGINEERING` → **Economics** (D063), score 1.145; passes_course_outcome_gate; anchors: economic, finance, market, policy, politics, statistics.
- `Education::Agricultural Education` → **Investment Analysis** (D013), score 1.142; passes_count_but_needs_semantic_review; anchors: economics.
- `Education::Entrepreneurship Education` → **Human Resources** (D029), score 1.142; passes_course_outcome_gate; anchors: human resource management, human resources, personnel management, project management.
- `Education::Guidance and Counselling` → **Social Sciences** (D078), score 1.138; passes_course_outcome_gate; anchors: economics, geography, research design, sociology, statistics.
- `Education::Entrepreneurship Education` → **Quantitative Finance** (D011), score 1.137; passes_count_but_needs_semantic_review; anchors: economics, statistics.
- `Education::Integrated Science` → **Neuroscience, Cognitive Science** (D145), score 1.137; passes_course_outcome_gate; anchors: psychology.
- `Education::Technology Education` → **Quantitative Finance** (D011), score 1.137; passes_count_but_needs_semantic_review; anchors: economics, statistics.
- `Education::Efik-Ibibio Education` → **Social Welfare, Youth Services** (D128), score 1.135; passes_course_outcome_gate; anchors: social justice, youth.
- `Education::Islamic Studies` → **Social Welfare, Youth Services** (D128), score 1.135; passes_course_outcome_gate; anchors: social justice, youth.
- `Education::Technology Education` → **Social Welfare, Youth Services** (D128), score 1.135; passes_course_outcome_gate; anchors: social justice, youth.
- `Education::Technology Education` → **Trading** (D062), score 1.135; passes_course_outcome_gate; anchors: economics, trading.
- `Education::Health Education` → **Human Resources** (D029), score 1.133; passes_course_outcome_gate; anchors: human resource management, human resources, labour legislation, personnel management.
- `Education::Efik-Ibibio Education` → **Social Sciences** (D078), score 1.129; passes_course_outcome_gate; anchors: economics, geography, research design, sociology, statistics.
- `Education::Igbo` → **Economics** (D063), score 1.129; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Agricultural Education` → **Quantitative Finance** (D011), score 1.128; passes_count_but_needs_semantic_review; anchors: economics, statistics.
- `Education::Technology Education` → **General Management** (D028), score 1.123; passes_course_outcome_gate; anchors: leadership, operations, strategic, strategic planning.
- `Education::Biology` → **Social Sciences** (D078), score 1.121; passes_course_outcome_gate; anchors: economics, geography, mathematics, statistics.
- `Education::Entrepreneurship Education` → **Social Sciences** (D078), score 1.121; passes_course_outcome_gate; anchors: economics, geography, mathematics, research design, sociology, statistics.
- `Education::Adult and Continuing Education` → **Quantitative Finance** (D011), score 1.12; passes_course_outcome_gate; anchors: economics, quantitative analysis, statistics.
- `Education::Educational Technology` → **Social Welfare, Youth Services** (D128), score 1.115; passes_course_outcome_gate; anchors: social justice, youth.
- `Education::Entrepreneurship Education` → **Trading** (D062), score 1.115; passes_course_outcome_gate; anchors: economics, trading.
- `Education::French` → **Economics** (D063), score 1.113; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Hausa` → **Economics** (D063), score 1.113; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Home Economics` → **Economics** (D063), score 1.113; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, statistics.
- `Education::Music` → **Economics** (D063), score 1.113; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Special Needs Education` → **General Management** (D028), score 1.113; passes_course_outcome_gate; anchors: leadership, operations, strategic, strategic planning.
- `Education::Technology Education` → **Investment Analysis** (D013), score 1.113; passes_count_but_needs_semantic_review; anchors: economics.
- `Education::Arabic` → **Social Sciences** (D078), score 1.112; passes_course_outcome_gate; anchors: economics, geography, research design, sociology, statistics.
- `Education::Guidance and Counselling` → **Quantitative Finance** (D011), score 1.111; passes_count_but_needs_semantic_review; anchors: economics, statistics.
- `Education::Efik-Ibibio Education` → **Marketing, Brand** (D030), score 1.109; passes_course_outcome_gate; anchors: advertising, audience, brand, customer, market, market research.
- `Education::Islamic Studies` → **Marketing, Brand** (D030), score 1.106; passes_course_outcome_gate; anchors: advertising, brand, customer, market, market research, marketing.
- `Education::Special Needs Education` → **Marketing, Brand** (D030), score 1.106; passes_course_outcome_gate; anchors: advertising, brand, customer, market, market research, marketing.
- `Education::Technology Education` → **Insurance** (D061), score 1.105; passes_course_outcome_gate; anchors: economics, insurance.
- `Education::Guidance and Counselling` → **Trading** (D062), score 1.104; passes_course_outcome_gate; anchors: economics, trading.
- `Education::Educational Technology` → **Social Sciences** (D078), score 1.103; passes_course_outcome_gate; anchors: economics, geography, research design, sociology, statistics.
- `Education::Health Education` → **Social Sciences** (D078), score 1.103; passes_course_outcome_gate; anchors: economics, geography, research design, sociology, statistics.
- `Education::Technology Education` → **Product Management** (D033), score 1.101; passes_count_but_needs_semantic_review; anchors: digital systems, strategic planning.
- `Education::Early Childhood Education` → **General Management** (D028), score 1.1; passes_course_outcome_gate; anchors: leadership, operations, strategic, strategic planning.
- `Education::Guidance and Counselling` → **Investment Analysis** (D013), score 1.099; passes_count_but_needs_semantic_review; anchors: economics.
- `Education::English Language/Literature-in-English` → **Economics** (D063), score 1.097; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Library and Information Science` → **Economics** (D063), score 1.097; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Education::Yoruba` → **Economics** (D063), score 1.097; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Engineering::ELECTRICAL ENGINEERING` → **Economics** (D063), score 1.097; passes_course_outcome_gate; anchors: economic, economics, finance, market, policy, politics.
- `Engineering::TELECOMMUNICATIONS ENGINEERING` → **Economics** (D063), score 1.097; passes_course_outcome_gate; anchors: economic, finance, market, policy, politics, statistics.
- `Education::Biology` → **Social Welfare, Youth Services** (D128), score 1.096; passes_course_outcome_gate; anchors: social justice.
- `Education::Entrepreneurship Education` → **Social Welfare, Youth Services** (D128), score 1.096; passes_course_outcome_gate; anchors: social justice, youth.
- `Education::Human Kinetics/Physical Education` → **Social Welfare, Youth Services** (D128), score 1.096; passes_course_outcome_gate; anchors: social justice, youth.
- `Education::Christian Religious Studies` → **Social Sciences** (D078), score 1.095; passes_course_outcome_gate; anchors: economics, geography, research design, sociology, statistics.
- `Education::Efik-Ibibio Education` → **Quantitative Finance** (D011), score 1.094; passes_count_but_needs_semantic_review; anchors: economics, statistics.
- `Education::Efik-Ibibio Education` → **Trading** (D062), score 1.094; passes_course_outcome_gate; anchors: economics, trading.
- `Education::Entrepreneurship Education` → **Insurance** (D061), score 1.092; passes_course_outcome_gate; anchors: economics, insurance, insurance market, principles of insurance.

The JSON artifact contains every programme/domain candidate, course-level matches, gate result, Sociology target review, downstream subgroup/role paths, and all upstream JAMB identity collisions.
