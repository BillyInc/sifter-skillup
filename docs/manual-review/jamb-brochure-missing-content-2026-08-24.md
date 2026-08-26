# JAMB brochure missing-content handoff

Status date: 2026-08-24
Scope: JAMB brochure subjects, programme requirements, university offerings, and university-specific exceptions only.

This is the complete manual handoff. It is deliberately separate from CCMAS and domain review. Do not use an inferred requirement, a neighbouring programme, or a guessed university rule to fill any blank below.

## What the current data proves

- The brochure catalogue contains 416 mapped JAMB names, with 400 exact name matches and 16 declared alias matches.
- The active registry contains 420 JAMB programme identities and 9,130 university-programme offering pairs.
- The source-rule review contains 1,260 JAMB requirement layers across UTME, O-level, and Direct Entry.
- The source-rule layer contains 2,706 preserved source variants. Multiple variants remain separate when the brochure gives different institution or programme wording.
- 680 layers were resolved from source variants, 445 still preserve multiple source variants, and 135 have no resolved source candidate.
- The 135 unresolved source-rule layers are 45 programme names × 3 layers: UTME, O-level, and Direct Entry.
- The offering source snapshot contains 439 source programme rows representing 416 unique names. 224 rows have no value in all three requirement fields: UTME subjects, O-level requirement, and Direct Entry.
- No offering row is missing its institution list in the source snapshot. The remaining offering work is to verify the exact institution/programme association and recover or explicitly mark the missing requirement columns.

The 100% catalogue-name result therefore means “the names were found in the brochure”. It does not mean that every subject combination, O-level rule, Direct Entry rule, university exception, or offering detail is complete.

## Completion states to use

Use one of these states for every manually checked item:

- `verified`: the exact text and institution association are visible in the brochure.
- `inherited_shared`: the brochure explicitly carries the requirement from a named parent/preceding table block to this programme.
- `variant_verified`: the requirement is verified, but it applies only to the named institution or variant.
- `source_blank`: the programme and/or institution is present, but the relevant brochure cell is blank.
- `source_missing`: the programme/layer cannot be found in the supplied brochure pages.
- `source_conflict`: two brochure locations give different text and the difference is not resolved.
- `extraction_gap`: the text is visible but the page/table boundary is incomplete or unreadable.

Only `verified`, `inherited_shared`, and `variant_verified` may become executable matching rules. `source_blank`, `source_missing`, `source_conflict`, and `extraction_gap` must remain visible as review states and must not generate a positive subject match.

## Part A — 45 names missing a resolved brochure candidate

For every name below, check all three layers separately:

1. UTME subject combination.
2. O-level requirement.
3. Direct Entry requirement.

If the brochure has one of the layers, capture it even when another layer is absent. If the brochure does not contain the layer, record `source_missing`; do not copy a neighbouring programme's rule without an explicit shared-table instruction.

- Applied Microbiology and Brewing / Applied Microbiology
- Arabic Language and Literature Studies
- BIOLOGICAL SCIENCE(S)
- Biology/Biotechnology
- Computer and Information Science
- Dentistry and Dental Technology
- Drama/Dramatic Arts/Performing Arts
- Economics with/and Operation Research
- Eco-Tourism and Wildlife Management
- Electrical/Electronic Engineering
- Employment and Human Resource Management
- ENGINEERING PHYSICS
- Environmental Management and Technology
- Environmental Science and Technology
- Farm Management & Agric. Extension
- Fine Art/Fine and Applied Arts
- Forestry and Fisheries
- French and German/Russian
- Geography and Environmental Studies
- Home Economics and Hotel Management
- Home Science & Management
- Hotel Management & Tourism
- ICT Engineering
- Industral Mathematics/Computer
- Industrial Relations / Industrial and Labour Relations
- Industrial Relations and Personnel Management / Industrial Relations and Human Resource Management
- INFORMATION AND MEDIA TECHNOLOGY
- Islamic Law/Sharia Law
- Marine Science and Technology
- Mathematics and Economics / Mathematics with Economics
- Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics
- Medical Laboratory Technology/Science
- Medicine and Surgery (Human Medicine)
- Modern Language and Translation
- Office and Information Technology / Information Resource Management
- Pasture & Range Management
- Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics)
- Physics with Computational Modeling
- Plant Breeding and Seed Technology
- Political Science / International Law and Diplomacy
- Political Science and Conflict
- Public and International Law
- Robotics (Artificial Intelligence)
- Sport Management (Education)
- Water Resources and Environmental Engr

### Required capture for each Part A layer

- Exact JAMB name as printed.
- Layer: UTME, O-level, or Direct Entry.
- Exact brochure page, table heading, row number, and source PDF.
- Exact institution code/name attached to the row.
- Every required subject, including “and”, “or”, “any”, “one of”, and “two of” logic.
- For UTME: the complete four-subject interpretation, including Use of English where stated and all institution-specific alternatives.
- For O-level: the required number of credits, named compulsory subjects, acceptable alternatives, pass-versus-credit wording, sitting limit, and examination qualification wording.
- For Direct Entry: all A-level, IJMB, JUPEB, NCE, ND, HND, diploma, professional qualification, level-entry, and UTME-condition wording.
- Institution-specific waiver or exception text and the institution(s) to which it applies.
- Whether the text is exact, explicitly shared/inherited, institution-specific, or absent.

## Part B — 224 offering rows with all three requirement columns blank

These source rows contain institutions but no usable value in UTME subjects, O-level requirement, or Direct Entry. For every name below, inspect the exact brochure block and record one of:

- the programme-specific three-layer requirements;
- an explicit shared requirement inherited from a named parent block;
- or `source_blank` if the brochure genuinely provides no requirement for that offering.

The source association is shown in brackets. The same JAMB name can legitimately occur in more than one source faculty file; do not merge those rows until the institution and programme identity are confirmed.

- Accountancy and Forensic Studies [Administration]
- Accounting and Data Analytics [Administration]
- Accounting and Finance [Administration]
- African and Asian Studies [Arts/Humanities]
- Agribusiness and Economics [Administration]
- Animal and Environmental Biology [Sciences]
- Animal Biology and Environment [Sciences]
- Animal Breeding and Genetics [Agriculture]
- APPLIED BIOLOGY [Sciences]
- APPLIED BIOLOGY AND BIOTECHNOLOGY [Sciences]
- APPLIED BIOLOGY AND GENETICS [Sciences]
- APPLIED BOTANY [Sciences]
- Applied Chemistry [Sciences]
- Applied Ecology [Sciences]
- Applied Geology [Sciences]
- Applied Mathematics with Statistics [Sciences]
- Applied Physics [Sciences]
- Applied Statistics [Sciences]
- Applied Zoology [Sciences]
- Aviation Business [Sciences]
- Aviation Management [Administration]
- BIOCHEMISTRY AND MOLECULAR BIOLOGY [Sciences]
- Biology/Biotechnology [Sciences]
- Biostatistics [Sciences]
- Biotechnology [Agriculture; Sciences]
- Biotechnology and Food Technology [Sciences]
- BIOTECHNOLOGY AND MOLECULAR BIOLOGY [Sciences]
- Botany and Ecological Studies [Sciences]
- Building [Engineering]
- Building Technology [Sciences]
- CELL BIOLOGY & GENETICS [Sciences]
- Chemical Sciences [Sciences]
- Chemistry and Industrial Chemistry [Sciences]
- Christian Studies [Arts/Humanities]
- COMMUNICATION AND DIGITAL MEDIA STUDIES [Sciences]
- COMMUNICATION AND WIRELESS TECHNOLOGY [Sciences]
- COMMUNICATIONS TECHNOLOGY [Sciences]
- Computer and Information Science [Engineering]
- Computer Science and Informatics [Sciences]
- Computer Science and Information Science [Sciences]
- Computer Science and Information Technology [Sciences]
- COMPUTER SCIENCE WITH ECONOMICS [Sciences]
- COMPUTER SCIENCE WITH MATHEMATICS [Sciences]
- Computer with Electronics [Sciences]
- COMPUTER WITH STATISTICS [Sciences]
- Computer, Information and Communication Science [Sciences]
- Computing and Artificial Intelligence [Sciences]
- Conservation and Environmental Biology [Sciences]
- Conservation Biology [Sciences]
- Cooperative Management [Administration]
- Crop Science [Agriculture]
- CYBER SECURITY [Sciences]
- CYBER SECURITY SCIENCE [Sciences]
- DATA MANAGEMENT [Sciences]
- Data Science [Sciences]
- Data Science and Analytics [Sciences]
- Demography and Social Studies [Social Management]
- Demography and Statistics [Social Management]
- Development and Communication Studies [Administration]
- Digital Entrepreneurship [Sciences]
- Ecology [Sciences]
- Ecology and Environmental Studies [Sciences]
- Economics and Development Studies [Social Management]
- Economics and Statistics [Social Management]
- Economics with/and Operation Research [Social Management]
- Electronics [Sciences]
- ELECTRONICS AND COMMUNICATIONS [Sciences]
- ELECTRONICS AND COMPUTER SYSTEMS [Sciences]
- ELECTRONICS AND COMPUTER TECHNOLOGY [Sciences]
- Electrons [Sciences]
- Employment and Human Resource Management [Administration]
- Energy and Petroleum Studies [Sciences]
- Energy Studies [Sciences]
- English Studies [Arts/Humanities]
- Entrepreneurship and Business Management [Administration]
- Entrepreneurship and Innovation [Administration]
- Environmental Biology [Sciences]
- Environmental Biology and Fisheries [Sciences]
- Environmental Chemistry and Toxicology [Sciences]
- Environmental Health Science [Sciences]
- Environmental Management [Sciences]
- Environmental Science and Technology [Sciences]
- Finance [Administration]
- Finance and Financial Technology [Administration]
- Finance and Investment [Administration]
- FISHERIES AND AQUACULTURE [Sciences]
- Food Science & Nutrition [Sciences]
- Food Science and Engineering [Engineering]
- Food Technology [Engineering]
- Forestry and Fisheries [Agriculture]
- French and German/Russian [Arts/Humanities]
- Gas Engineering [Engineering]
- Genetics and Biotechnology [Sciences]
- Geography [Engineering]
- Geography and Environmental Management [Sciences]
- Geological Sciences [Sciences]
- Geology and Applied Geophysics [Sciences]
- Geology and Geophysics [Sciences]
- Geology and Mineral Science [Sciences]
- Geology and Mineral Sciences [Sciences]
- Geology and Mining [Sciences]
- Geology and Petroleum Studies [Sciences]
- Geophysics [Sciences]
- Geoscience [Sciences]
- German [Arts/Humanities]
- History and International Relations [Social Management]
- History and International Studies [Social Management]
- History and Strategic Studies [Arts/Humanities]
- HOME SCIENCE [Sciences]
- Home Science, Nutrition and Dietetics [Agriculture]
- Horticulture [Agriculture]
- HUMAN BIOLOGY [Sciences]
- Human Resources Management [Administration]
- Industral Mathematics/Computer [Sciences]
- Industrial and Environmental Chemistry [Sciences]
- Industrial Chemistry and Chemical Entrepreneurship [Sciences]
- Industrial Mathematics /Applied Statistics [Sciences]
- Industrial Mathematics and Computer Science [Sciences]
- Industrial Microbiology [Sciences]
- Industrial Relations and Human Resources Management [Administration]
- INFORMATION AND COMMUNICATION SCIENCE [Sciences]
- INFORMATION AND COMMUNICATION TECHNOLOGY [Sciences]
- INFORMATION AND MEDIA SCIENCE [Sciences]
- INFORMATION AND MEDIA TECHNOLOGY [Sciences]
- INFORMATION SCIENCE [Sciences]
- INFORMATION SCIENCE AND MEDIA STUDIES [Sciences]
- INFORMATION SYSTEMS [Sciences]
- INFORMATION SYSTEMS AND TECHNOLOGY [Sciences]
- INFORMATION TECHNOLOGY [Sciences]
- INFORMATION TECHNOLOGY AND HEALTH INFORMATICS [Sciences]
- Insurance and Actuarial Science [Administration]
- Intelligence and Security Studies [Social Management]
- International and Comparative Politics [Social Management]
- International Relations and Diplomacy [Social Management]
- International Relations and Diplomatic Studies [Social Management]
- International Relations and Strategic Studies [Administration]
- International Relationship & Strategic Studies [Social Management]
- International Studies [Social Management]
- International Studies and [Arts/Humanities]
- International Studies and Diplomacy [Administration; Social Management]
- Library and Information Science [Education; Sciences; Social Management]
- LIBRARY AND INFORMATION TECHNOLOGY [Sciences]
- Linguistics [Arts/Humanities]
- Logistics and Supply Chain Management [Administration]
- Management [Administration]
- MANAGEMENT INFORMATION SYSTEM [Sciences]
- Management Studies [Administration]
- MARINE BIOLOGY [Sciences]
- Marine Geology [Sciences]
- Marine Science [Sciences]
- Marine Science and Technology [Sciences]
- Marketing and Consumer Studies [Administration]
- Mathematics with Computer Science [Sciences]
- Medical Biochemistry [Medical]
- METEOROLOGY AND CLIMATE CHANGE [Sciences]
- METEOROLOGY AND CLIMATE SCIENCE [Sciences]
- Microbiology and Biotechnology [Sciences]
- Microbiology and Industrial Biotechnology [Sciences]
- Microbiology/Parasitology [Sciences]
- Molecular Biology [Sciences]
- OCEANOGRAPHY [Sciences]
- Office and Information Technology / Information Resource Management [Administration]
- Parasitology and Entomology [Sciences]
- Peace and Conflict Studies [Social Management]
- Peace and Development Studies [Social Management]
- Peace Strategic and Conflict Resolution [Social Management]
- Peace Studies and Conflict Resolution [Social Management]
- Personnel Management [Administration]
- Petroleum Chemistry [Sciences]
- Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) [Sciences]
- Physics and Computer Electronic [Sciences]
- Physics and Energy Studies [Sciences]
- Physics Electronics [Sciences]
- Physics with Computational Modeling [Sciences]
- PHYSICS WITH ELECTRONICS [Sciences]
- Physics with Solar Energy [Sciences]
- Physics/Astrology [Sciences]
- Physics/Industrial Physics [Sciences]
- Physiotherapy [Medical]
- Plant Biology [Sciences]
- Plant Biology and Biotechnology [Sciences]
- Plant Breeding and Seed Technology [Agriculture]
- Plant Science [Sciences]
- Plant Science and Biotechnology [Sciences]
- Plant Science and Forestry [Sciences]
- Plant Science and Microbiology [Sciences]
- Portuguese/English [Arts/Humanities]
- Procurement [Administration]
- Procurement Management [Administration]
- Project Management [Administration]
- Public Administration [Social Management]
- Public Administration and Local Govt [Social Management]
- Public Administration and Policy Studies [Social Management]
- Public Health Technology [Medical]
- Pure and Applied Chemistry [Sciences]
- Pure and Applied Physics [Sciences]
- Pure and Industrial Chemistry [Sciences]
- Pure Chemistry [Sciences]
- Pure Physics [Sciences]
- Robotics (Artificial Intelligence) [Sciences]
- Russian with French/German [Arts/Humanities]
- Social Innovation and Entrepreneurship [Administration]
- Social Standards [Administration]
- Sociology and Social Studies [Social Management]
- Software Engineering [Sciences]
- Software Engineering and Digital Entrepreneurship [Sciences]
- Statistics and Data Sciences [Sciences]
- Statistics with Demography [Sciences]
- Strategic Communication [Administration]
- Supply Chain Management [Administration]
- Technology Education [Education]
- TELECOMMUNICATION AND WIRELESS TECHNOLOGY [Sciences]
- TELECOMMUNICATION MANAGEMENT [Sciences]
- TELECOMMUNICATION SCIENCE [Sciences]
- Theology [Arts/Humanities]
- Tourism Studies [Administration]
- Transport and Logistics Management [Administration]
- Transport and Tourism [Administration]
- Transport Management [Administration]
- Zoology and Aquaculture [Sciences]

## Part C — exact brochure fields to capture for every offering

Complete one record for each `JAMB name + institution + programme variant`. Do not represent a university offering only as a name count.

### Identity and offering

- Exact JAMB programme name as printed.
- Exact university/institution name, not only an acronym.
- Institution code as printed and its confirmed full name.
- Institution type: university, polytechnic, college of education, or other.
- Faculty/college and department only when the brochure gives them; do not invent a department.
- Programme variant, option, combined degree, or parent heading.
- Whether the institution is explicitly listed under that programme or appears only through a shared heading.
- Brochure PDF, page, table heading, row, and the exact institution-list location.

### UTME subjects

- The complete four-subject combination, including Use of English when stated.
- Required subjects versus selectable subjects.
- Exact `and`/`or`/`any`/`one of`/`two of`/`three of` logic.
- Institution-specific UTME alternatives and the institution(s) they apply to.
- Whether the rule is national, shared from a parent heading, or university-specific.
- Any subject alias that must resolve to a canonical subject in the catalogue.
- Whether the brochure wording is too ambiguous to execute; mark it `needs_review` rather than simplifying it.

### O-level requirements

- Exact credit count: five, six, or another stated number.
- Exact compulsory subjects.
- Alternative-subject groups and their cardinality.
- English Language and Mathematics pass/credit distinction.
- Sitting limit: one sitting, two sittings, or not stated.
- Accepted examination type and qualification wording: SSCE/WAEC/NECO/NABTEB/other.
- Technical, trade, NBC, NTC, or TC II conditions kept separate from ordinary SSCE conditions.
- Institution-specific O-level exceptions and the institutions they apply to.
- Whether the rule is complete enough for a matcher; otherwise use a review state.

### Direct Entry

- All accepted A-level subjects and exact combinations.
- IJMB/JUPEB or equivalent conditions.
- NCE, ND, HND, diploma, professional qualification, and minimum grade conditions.
- Entry level where stated: 200, 300, or another level.
- Whether UTME requirements must also be satisfied.
- Direct Entry “not accepted” statements.
- Institution-specific Direct Entry exceptions.

### Source and review evidence

- Exact source quotation, preserving the brochure's wording.
- PDF name, page, table/heading, row, and extraction note.
- Source year/edition if printed.
- Whether the text is exact, inherited/shared, variant-specific, blank, missing, conflicting, or extraction-incomplete.
- Reviewer initials/date and the reason for any interpretation.

## Part D — subject catalogue checks

The current subject catalogue has 46 canonical subject records. Before adding or changing a subject, manually verify:

- Official JAMB subject name.
- Exam layer: UTME, O-level, or both.
- All brochure aliases and spelling variants.
- Whether it is an ordinary academic subject, trade subject, technical subject, language, or university-specific exception.
- Stream hint only when the brochure or school curriculum supports it.
- Whether it can satisfy a named requirement or only a category such as “any Science subject” or “any Arts subject”.
- Whether it is a selectable subject in the student UI or only a requirement-category member.
- Any institution-specific substitution, with the institution name attached.
- Evidence page and source year.

Do not turn “any Science subject”, “any Arts subject”, or a university exception into one invented canonical subject. Preserve the category and its allowed members.

## Part E — unresolved structural warnings to verify manually

These are not permission to guess. They are checks that must be resolved or explicitly retained as review states:

- 78 O-level options declare a minimum of five while the currently structured subject groups represent fewer than five slots. Recheck whether the brochure has omitted subjects, whether a category was collapsed incorrectly, or whether the rule is genuinely incomplete.
- 5 structured options point to requirement rows still marked `needs_review`. Recheck their source wording before treating them as executable.
- 14 preserved source variants are explicitly source-blank. For each, verify whether the blank cell inherits from a named table row or is genuinely blank.
- 445 programme/layer cases preserve multiple source variants. Confirm each institution-to-variant association; never collapse them into one national rule.
- Any brochure text saying “as in [another programme]” must be resolved only when the referenced programme and the source table relationship are explicit.
- Any institution code that appears inside a requirement sentence, heading, or adjacent programme block must be checked against the exact table boundary before it is stored as an offering.
- Any programme heading that starts at the bottom of a page or continues onto the next page must have its full institution list and all three requirement columns checked across the page break.

## What must not be entered

- No guessed UTME combination.
- No guessed O-level credit count.
- No copied university rule presented as a national rule.
- No Direct Entry rule mixed into UTME or O-level matching.
- No university offering created from a programme name alone when the institution association is not visible.
- No domain, CCMAS, role, demand, salary, or employment data in this JAMB handoff.
- No “complete” status when only the programme name is present.

## Final acceptance condition

The JAMB layer is ready for migration only when every active JAMB name and offering has:

1. an explicit source state;
2. a confirmed institution association;
3. separately reviewed UTME, O-level, and Direct Entry fields;
4. all alternatives, waivers, sitting limits, and special qualifications preserved;
5. a page/table citation;
6. no unresolved source conflict silently promoted to an executable matcher rule.

Until then, the frontend may show the programme or university offering, but it must not signal subject eligibility from an unstructured or source-missing rule.
