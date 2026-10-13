# Sociology Guided-Experience Pilot: Evidence and Display Draft

Date: 2026-10-08  
Status: the Sociology programme-theme pilot is wired locally through a dedicated SQL table/seed, a fail-closed programme API contract, and the programme preview UI; focused Python contract, narration-traceability and resource-coverage tests pass. The regenerated curriculum contract preserves the SOC 301 source-title discrepancy without creating a second course. No SQL has been applied, so the new theme explanations are not live or visible from Supabase yet. Programme learning remains fixed curriculum, not learner-selectable extras; the separate downstream contextual-item gate remains fail-closed.

## Purpose and route boundary

This pilot tests the learner-facing explanation contract on one real curriculum topic. It does not reopen the domain/area/role audit and does not change the canonical taxonomy or role links.

The local programme map records **Social Sciences → Sociology → D078 Social Sciences & Behavioural Research** as a direct route, with 19 strong curriculum anchors and no active source-review hold. This pilot is about the broader **Research and evidence** theme, not one course. The NUC Sociology curriculum spreads this learning across courses in research methods, research planning, statistics and a research project. Together, those courses cover how to plan a study, choose and assess ways to gather information, make sense of evidence, treat people fairly, and explain findings. The student view uses the theme and plain-language explanation; course titles appear only when learners open the supporting course details. Course codes are retained in staff provenance, not shown to learners.

The official NUC PDF places the relevant course records on printed pp. 333–335, 337 and 338. The local CCMAS records and generated curriculum contract/seed preserve exact course identities and page locators for staff verification. The student-facing narration below is a plain-language summary, not a replacement for those source records.

## Domain pre-entry card: source standard and audit

The D078 description has now been rewritten from the source-library title **Social Sciences & Behavioural Research** and checked against the NUC Social Sciences CCMAS and ILO ISCO-08 groups 2631–2633. The API now exposes a description only when its exact wording matches an approved claim with cited HTTPS sources and locators; the programme card and domain overview expose those citations as links. Other domain descriptions without matching claim-level evidence are withheld rather than presented as verified. The programme-to-domain explanation remains guarded by approved edge-evidence rows and displays course anchors. The group headings and descriptions use short, everyday language; Direct / Functional / Adjacent remain internal audit labels rather than student-facing vocabulary. They do not claim job readiness. The category definitions explain Sifter's mapping method, not external outcomes.

| Card claim | Evidence available | Scope/limitation | Current disposition |
|---|---|---|---|
| Social Sciences & Behavioural Research field description | NUC, *Social Sciences CCMAS 2023*, Preamble, printed p. 17; ILO, *ISCO-08 Volume I*, groups 2631–2633, printed pp. 161–163; source-library identity in Section 6 / D078. These citations and locators are attached to the exact description claim in the migration. | NUC documents Nigerian curriculum scope; ISCO describes selected occupations, not the complete global domain. The description is intentionally concise, not an exhaustive boundary. | Display the exact approved wording only when its claim matches the stored description, and expose both cited sources from the card/domain page. |
| Sociology programme examples and topics | NUC, *Social Sciences CCMAS 2023*, Sociology curriculum, research-course records on printed pp. 333–335, 337 and 338. | This is Nigerian programme curriculum evidence. It supports what this programme teaches; it does not define all global Social Sciences practice. | Use only for the “where this programme fits” and transferred-outcome statements, with exact course/page anchors retained in staff provenance. |
| Research and policy-related occupational work | ILO ISCO-08, unit group 2632, especially its group definition and tasks. | Occupational classification describes examples of work; it is not a universal task list for everyone in the domain. | Use only for the bounded work/task explanation and disclose the occupational scope. |
| Plain-language connection groups (internal audit values: Direct / Functional / Adjacent) | The selected `programme_domain.match_type`, the documented classification criteria in `docs/PROGRAMME_TO_ROLE_MAPPING_LINEAGE_DOCUMENTATION.md`, and the matching approved `programme_domain_evidence` record with course anchors and any exact transferable-outcome evidence. | The classification rules explain how this project groups curriculum links; the per-edge curriculum evidence supports the specific link. Neither establishes admission, eligibility, mastery or job readiness. | Use everyday narrative labels and show the supporting courses on each card. Keep technical labels in staff-facing records and do not present the grouping as an external occupational standard. |
| “Could this field suit you?” decision prompt and broad related-programme list | No claim-specific evidence is attached to these fields in the current D078 orientation object. | These are recommendations/relations, not established facts merely because they appear in orientation JSON. | Keep hidden until each statement has a reviewed claim record and its own evidence. |

Primary external references for this bounded card review: [ILO ISCO-08](https://isco.ilo.org/en/isco-08/) and [ILO ISCO-08 Volume I, group definitions](https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf); [NUC Social Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf). These sources support only the displayed description and specified locators; they do not validate every orientation claim or the learning-guide links.

The canonical downstream contextual-item inventory still has **zero** rows passing its separate claim-and-learning-link gate. The three reviewed records below explain fixed university curriculum and are explicitly **not selectable extra-learning items**. Their wording, exact curriculum/source locators, learning destinations, access details and limitations are recorded in `data/career-mapping/_audit/sociology_programme_theme_claims_2026_10_08.json`. A deterministic generator writes `backend/seed_sociology_programme_theme_guidance_2026-10-08.sql`; `backend/migration_programme_theme_guidance_2026-10-08.sql` defines the additive table. The programme API returns only approved, source-backed rows whose evidence, locator and HTTPS learning-link checks pass. The UI displays the explanations inside the expanded Research and evidence theme, with source links and an optional learning button, and offers no selection/progress controls. Focused ledger/API and UI tests pass. These artifacts are local only; they have not been applied to Supabase. **D078's current area-of-specialization layer is the seven reconciled areas in `domain_structure.json`; “subgroup” and “area of specialization” refer to this same taxonomy layer.** Legacy ISCO labels `21` (Computational and Quantitative Social Research) and `26` (Social, Cultural & Economic Research) are retired and must not be presented as current areas. This theme combines the programme's social-research methods courses; it does not transfer programme ownership to an area or turn the explanations into selectable extras. Any area-specific item placement needs its own explicit checkpoint decision and evidence.

The canonical route data places Sociologist on the supported Sociology/Social Sciences route(s) established by the role-to-domain and role-to-area reconciliation. This pilot does not reopen that mapping decision. The programme's research-methods teaching is relevant curriculum evidence, not a promise that one course alone makes a learner job-ready.

## Theme sample: Research and evidence

### Student-facing narration

> Your Sociology programme teaches you how to turn a question about society
> into a fair, workable study: choose a way to find out, gather information,
> look carefully at what it shows, respect the people involved, and explain
> what the findings can—and cannot—tell you.

This narration is intentionally built from several course outcomes. In the
expanded view, learners see the supporting course titles and explanations;
course codes remain hidden. Keep each course record distinct in the data and
staff provenance: grouping is a presentation layer, not a merged or hidden
curriculum record.

In the implemented programme preview, this theme narration is shown first;
the learner can open **See what you will practise** to read the full narration
in short paragraphs. The opened panel then groups each course's outcomes under
its course title. It shows the learner-friendly wording and, whenever that
wording differs, the original CCMAS outcome alongside it. This lets the theme
read naturally without hiding the underlying curriculum or its course
boundaries. Each expanded course shows its title and printed-page reference;
course codes remain in staff provenance and are not shown to learners.

### Source-reviewed examples of fixed programme guidance

These examples explain selected outcomes from the larger theme without
presenting the course list as extra learner choices. Learner wording is a
source-checked explanation, not a verbatim CCMAS outcome. Exact evidence,
locators, resource/access details and claim status are stored in the typed pilot
ledger named above. These entries remain fixed programme guidance, not
selectable supplemental learning.

### 1. Quantitative and qualitative evidence

- **Type / key:** knowledge / `social_research_evidence_types`
- **What it means:** Quantitative evidence is information shown as numbers, such as how many students use the library. Qualitative evidence is people's words and explanations, such as why they go or stay away. Each shows a different part of the picture.
- **Everyday example:** A survey can show how many students use the library after class. Interviews can help explain why some stay and others leave. This is an example, not an assigned project.
- **Why it appears in this theme:** Your Sociology programme teaches you to compare quantitative evidence (information shown as numbers) with qualitative evidence (people's words and explanations), decide what each can show, and notice what it may miss.
- **Suggested practice output:** Compare what a small set of numbers can show with what people's explanations add. Name one thing each cannot tell you. This is optional practice, not an assigned assessment.
- **Learning action:** “Explore how social scientists read numerical and textual evidence” → [OpenLearn: Reading evidence](https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence/content-section-0?intro=1).
- **Source locator (staff provenance):** NUC, *Social Sciences CCMAS*, Sociology programme learning outcomes, printed p. 334; other research-course page locators are retained in the curriculum contract; OpenLearn, Introduction, statements on number-based and descriptive evidence and evidence limitations.
- **Claim disposition:** approved in the local fixed-guidance API and generated seed contract. The SQL is not applied to Supabase, so it is not yet live.

### 2. Choosing a research method for a question

- **Type / key:** method / `social_research_method_selection`
- **What it means:** A research method is a planned way to answer a question. A survey can show how common something is; interviews can help explain people's experiences.
- **Everyday example:** If your class wants to understand lateness, a survey can show how often students arrive late. Interviews can help explain the reasons. These are examples, not assigned research.
- **Why it appears in this theme:** Your Sociology programme teaches different ways to collect information, when each may help, and why a researcher should explain the choice.
- **Suggested practice output:** Write down a question, the information you would need, one way to collect it, and one reason that choice may work. This is optional practice, not an assigned assessment.
- **Learning action:** “Compare research designs and data-collection choices” → [OpenLearn: Defining your research methodology](https://www.open.edu/openlearn/course/view.php?id=18286).
- **Source locator (staff provenance):** NUC, *Social Sciences CCMAS*, Research Method I and Sociology programme course records, printed pp. 333–335; OpenLearn, *Defining your research methodology*, sections on research questions, information-gathering and analysis.
- **Claim disposition:** approved in the local fixed-guidance API and generated seed contract. The SQL is not applied to Supabase, so it is not yet live.

### 3. Ethical and careful handling of research with people

- **Type / key:** competency / `ethical_social_research`
- **What it means:** Research ethics means treating people fairly and carefully when you ask them for information, and handling their answers honestly.
- **Everyday example:** If you ask classmates about a difficult topic, explain why you are asking, let them choose whether to answer, and keep their replies private. This is a learning example, not permission to conduct a real study.
- **Why it appears in this theme:** Your Sociology programme teaches you to treat people fairly during research, handle information honestly, and avoid claiming more than the information can support.
- **Suggested practice output:** Make a short checklist: explain the question, let people choose whether to answer, protect their information, and be careful about what you conclude. This is practice, not approval to conduct research.
- **Learning action:** “Work through ethical decisions in research with people” → [OpenLearn: Becoming an ethical researcher](https://www.open.edu/openlearn/education-development/becoming-ethical-researcher).
- **Source locator (staff provenance):** NUC, *Social Sciences CCMAS*, Sociology programme learning outcomes and course contents, printed pp. 334–335; later research-course records; OpenLearn course description and outcomes on planning, conducting and reporting research involving people.
- **Claim disposition:** approved in the local fixed-guidance API and generated seed contract. The SQL is not applied to Supabase, so it is not yet live. OpenLearn labels the linked course Level 3: Advanced, so it is optional further study rather than an entry prerequisite.

## Relationship preview

The following is the only relationship proposed for this first sample. It explains method choice without implying that all methods are cumulative requirements:

| From → to | Learner-facing explanation | Evidence and limit | State |
|---|---|---|---|
| Research question → method selection | Choose a way to find out that can answer your question; compare what it can show with what another way might show. | The Sociology programme teaches students to justify and compare methods; OpenLearn's methodology material discusses matching questions, information-gathering and analysis. It does not establish one required method or fixed order for every learner. | Relationship is source-reviewed in the local ledger; the three explanation cards are in the local UI/API contract. |

The research-question-to-method connection is included as a fixed, source-backed explanation in the pilot API/UI and generated seed. Do not infer prerequisites between the three explanations. In particular, quantitative and qualitative approaches are not automatically a sequence, and ethics is a responsibility across research stages rather than a badge earned by selecting a card.

## Programme-to-domain handoff sample

The D078 domain page now has a separate, optional **Research design** item for the domain-owned layer. It explains the professional term in the same sentence: research design is the plan connecting a research question to the information and methods needed to answer it. The learner example asks them to practise matching a sample question with information and a method; it does not claim that this item qualifies them for work.

This item is deliberately not marked as a universal requirement. Its locally approved, optional “useful” links point to two of the **current** D078 areas: **Computational and Digital Social Science**, where a research plan helps match a social question to quantitative or computational methods that may suit it, and **Social Research and Evaluation**, where a research plan connects a question to suitable evidence and methods. The current area IDs and separate explanations are recorded in `data/career-mapping/_audit/sociology_domain_guidance_2026_10_08.json`; the earlier labels “Computational and Quantitative Social Research” and “Social, Cultural & Economic Research” are retired and are not route targets. The computational link does not require programming, and neither link says that every student must use one method or the same research design. The source limits—including that ESRC guidance is UK postgraduate guidance, not a Nigerian curriculum or universal employment rule—remain visible in the evidence record.

The placement is supported by the [ESRC 2022 postgraduate training guidelines](https://www.ukri.org/wp-content/uploads/2015/09/ESRC-281123-PostgraduateTrainingDevelopmentGuidelines2022.pdf), which connect research questions to methods and state that specialist depth varies by subject; [UNESCO's introductory definition of social-science research](https://www.unesco.org/en/query-list/s/social-science-research); and the optional OpenLearn [Defining your research methodology](https://www.open.edu/openlearn/course/view.php?id=18286) article. The ESRC framework is explicitly UK postgraduate evidence—not Nigerian curriculum, a universal employment rule or an undergraduate requirement. OpenLearn's methodology page is an article; its publisher does not state a level for that article. The generated SQL is local preparation only, not applied to Supabase.

## Route display and selection behavior to prototype

1. Show the Research and evidence theme as a plain-language narration grounded in several research-methods and project courses. In the expanded student panel, show course titles, level, learner-friendly outcomes and page references, but hide course codes. Keep exact course codes and source locators in staff provenance; never collapse separate courses into one synthetic course.
2. Offer the evidenced direct D078 route. Do not label the entire SOC 301 course as a shared D078 foundation: it is programme-owned evidence unless a separately reviewed source establishes a shared domain claim.
3. Present the seven reconciled D078 areas as the single area-of-specialization (subgroup) layer. Do not expose retired legacy labels 21 or 26 as separate/current areas. Place any learning card only under a current area when its checkpoint-specific evidence supports that placement.
4. Show Sociologist on the canonical route(s) established by the role-to-domain and role-to-area reconciliation. Do not reopen a route-mapping question here. Explain that the programme's research-methods teaching is curriculum evidence, not by itself a guarantee of job readiness.
5. Do not let the learner select these programme outcomes as extra learning: the university teaches this curriculum. Keep this theme narration and its outcomes fixed, and let learners open the linked readings; do not add curriculum or theme readings to the supplemental learning-focus report.
6. Start learner selection with approved supplemental items owned by the domain, area of specialization or role. The learner may include those additional items and supported alternatives in the focused printable guide; selections remain separate from canonical curriculum, route mapping and mastery/progress state.

## Programme reading placement

Books and other reading that help the learner understand the university
curriculum belong to the programme/theme layer, not the supplemental domain,
area or role layer. Place each material under a theme only when its published
scope or the cited course content supports that association. The Sociology
sample uses the updated **34-course, 14-theme** map in
`src/components/careerIntelligence/programmeCurriculumThemes.ts` and
`src/components/careerIntelligence/DegreeSkills.tsx`. The prior three-theme
illustration below is superseded; resource-to-theme decisions and exact
locators now belong in
`docs/manual-review/SOCIOLOGY_PROGRAMME_THEME_RESOURCE_MATRIX_2026_10_08.md`.

<!-- Superseded 2026-10-08: retained as history, not current theme/resource mapping.
- **People, groups and society:** NOUN's CSS 111 introductory Sociology
  courseware, labelled as a Nigerian courseware reference for NOUN—not a
  universal Nigerian requirement; Giddens or Haralambos/Holborn chapters only
  where the publisher's stated contents match the topic.
- **Ideas and foundations:** the Giddens and Haralambos/Holborn reference
  books, plus OpenStax Introduction to Sociology 3e; label paid/library versus
  free/open access accurately.
- **Research and evidence:** NOUN DES 311 Research Methodology and FSS 211
  Social Science Statistics courseware as optional Nigerian learning
  companions, alongside relevant open research-methods resources. DES 311 is
  a Development Studies course and FSS 211 is listed outside Sociology, so
  neither is presented as a Sociology course requirement. Haralambos and
  Holborn's contents explicitly include a methodology chapter; NOUN CSS 111's
  course objectives also name Sociology's methods and uses, so those resources
  may appear here with their own recommended/NOUN scope labels. OpenStax's
  research-methods section explains choosing methods for research questions;
  link directly to that section rather than its opening page.
-->

The NOUN CSS 111 courseware contains Nigerian-authored/local references as
well as general sociology texts, but it is an older NOUN courseware edition.
Use it as contextual, optional support and check it against the current NUC
curriculum; do not call it a current national prescription. The external search
did not establish one cross-university Nigerian approved reading list. “Nigerian
resource” therefore names the publisher/institution or contextual source, not
a claim of universal acceptance.

Display each item in a compact theme card: scope badge (for example,
**NOUN courseware reference**, **Recommended reference**, or **Open textbook**),
title, one-sentence “why this helps here,” provider/access note, and a
button-style **Open material** link. The button is a link to the actual
courseware, publisher/library page or open text—not a claim that every link is
a free course. NOUN says its e-Courseware is for educational use and prohibits
commercial/financial use other than educational; preserve that terms notice.

Each record must carry the programme, explicit theme key, authors/edition when
known, what the material explains, access type, source scope and evidence for
its recommendation. The implemented preview places these material cards inside
their matched theme, before the optional course-detail expansion; the button
label stays **Open material** so it is clear that this opens an external source
and not a Sifter lesson. A Nigerian university or department-specific list may be
shown as Nigerian-specific; it must not be generalized to all Nigerian
universities. These materials are reading guidance, not selectable
supplemental learning, and are not added to the learner's focused extra-learning
report.

## Verification and seed gate

- [x] Confirm the local Sociology CCMAS source contains SOC 301 learning outcomes and methods content.
- [x] Open the official NUC PDF and find SOC 301.
- [x] Normalize and carry printed-page locators for all four research-theme anchors into the regenerated curriculum contract/seed.
- [x] Preserve the SOC 301 programme-schedule title and detailed-section title as explicit provenance variants, with the schedule title retained as the canonical course identity.
- [x] Run the deterministic all-course locator pass: 34/34 Sociology courses now match the extracted official CCMAS page boundaries; 23 stale/missing locators were corrected and the regenerated local contract/seed carries the corrected spans. See `data/career-mapping/_audit/sociology_course_locator_audit_2026_10_08.json`.
- [x] Open the official NOUN CSS 111 courseware and verify its topics and reference section.
- [x] Verify NOUN's official courseware listing for FSS 211 Social Science Statistics and inspect the courseware.
- [x] Verify NOUN DES 311 Research Methodology courseware and its methods/reference sections.
- [x] Verify publisher scope/access pages for Haralambos/Holborn and Giddens; do not claim either is universally prescribed.
- [x] Match each Sociology book/courseware to a theme using published chapter/course objectives, and give the card a theme-specific “why this helps here” description.
- [x] Run the full theme-resource coverage audit: 14/14 active themes have a matrix row and a local migration URL route; 20 distinct learning URLs are recorded. See `data/career-mapping/_audit/sociology_programme_theme_resource_audit_2026_10_08.json`.
- [x] Run the full theme-narration evidence-alignment audit: 14/14 active narrations and 34/34 course mappings have contract content/outcome/printed-locator anchors. See `data/career-mapping/_audit/sociology_programme_theme_narration_audit_2026_10_08.json`.
- [x] Open each proposed OpenLearn learning destination and verify its described scope.
- [x] Render theme-level narration, theme-scoped resource cards with external-link buttons, and expanded course/outcome provenance in the programme preview.
- [x] Display the preserved course source locator in the expanded evidence panel; verify SOC 301 printed pp. 334–335 against the official NUC PDF.
- [x] Verify the focused DegreeSkills UI tests pass for grouped research courses, learner-friendly narration, preserved original outcome wording, theme-scoped materials, and no course codes in the student display.
- [x] Record three source-reviewed programme-theme explanations and one directional relationship in a typed pilot ledger, including exact curriculum locators, checked learning destinations, resource access/level, evidence limits and non-selectable curriculum status.
- [x] Run ledger tests for missing/duplicate identifiers, missing claim evidence, unresolved locators, non-HTTPS or uncatalogued learning destinations, accidental learner selection and untyped/unsupported relationships.
- [x] Confirm the route's current direct programme-to-D078 mapping; this pilot does not reopen role/area-fit adjudication.
- [x] Integrate the fixed programme-theme ledger into the programme theme panel with linked sources and learning resources; keep it outside supplemental item selection and verify the learner sees it as curriculum explanation.
- [x] Generate the additive theme-guidance schema and deterministic seed; gate API output on approved claims, source locators, and a verified HTTPS learning destination (local preparation only; no SQL applied).
- [x] Verify the focused UI test renders the fixed guidance, its source and optional learning links, and no learner-selection controls.
- [x] Complete one programme-to-domain sample with a separately owned, optional D078 research-design item, source-backed descriptions, explicit useful links to two matching areas, learning-link scope and non-requirement limitations; generate the local SQL patch without applying it.
- [ ] Test the full programme → D078 → selected-area transition against a populated API/database fixture, including inheritance, path-specific additions, and empty/review-only states.
- [ ] Implement granular item selection in the report path and printable output; add tests showing selections do not alter route or canonical records.
- [ ] Run API/client parity tests and render the Sociology programme-to-domain route with the empty state for any unapproved downstream items.
- [ ] Do not apply SQL or call the pilot student-visible until the user-authorized review and manual SQL deployment gates are satisfied.

## External sources checked

- National Universities Commission, [Social Sciences CCMAS 2023 PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), SOC 301 printed pp. 334–335.
- National Open University of Nigeria, [CSS 111 Introduction to Sociology courseware](https://nou.edu.ng/coursewarecontent/CSS111%20INTRODUCTION%20%20TO%20SOCIOLOGY.pdf), including its course topics and References/Further Readings sections; the courseware states educational-use restrictions.
- National Open University of Nigeria, [DES 311 Research Methodology courseware](https://www.nou.edu.ng/coursewarecontent/DES%20311.pdf), including social-science research, sampling, data collection and Nigerian-authored references (for example, Anikpo); it is Development Studies courseware, not a Sociology prescription.
- National Open University of Nigeria, [FSS 211 Social Science Statistics courseware](https://nou.edu.ng/coursewarecontent/FSS%20211%20SOCIAL%20SCIENCE%20STATISTICS.pdf), listed in the Social Sciences courseware catalogue.
- Collins, [Sociology: Themes and Perspectives, 8th edition](https://collins.co.uk/products/9780007498826), contents include methodology, sociological theory and multiple substantive themes; publisher page identifies level/access and ISBN.
- Wiley, [Sociology, 9th edition](https://www.wiley-vch.de/en/areas-interest/humanities-social-sciences/sociology-12so/general-sociology-12so0/sociology-978-1-5095-3922-2), by Anthony Giddens and Philip W. Sutton; publisher scope includes sociological theory, methodology and contemporary social topics.
- The Open University OpenLearn, [Reading evidence](https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence/content-section-0?intro=1), defines social-science evidence as quantitative/qualitative and notes interpretation, reliability and limitations.
- The Open University OpenLearn, [Defining your research methodology](https://www.open.edu/openlearn/course/view.php?id=18286), discusses choosing data collection and analysis in relation to research questions.
- The Open University OpenLearn, [Becoming an ethical researcher](https://www.open.edu/openlearn/education-development/becoming-ethical-researcher), covers ethical planning, conduct and reporting of human-participant research. Its course page describes a free course and statement of participation; it is not represented here as a professional licence or accredited qualification.
- OpenStax, [Introduction to Sociology 3e, section 2.2: Research Methods](https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods), explains common research methods and choosing approaches appropriate to a topic.
