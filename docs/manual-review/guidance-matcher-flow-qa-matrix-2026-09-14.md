# Guidance, matcher and offering QA matrix

This is the manual/e2e test matrix for the current product flow. It covers
subject-only discovery, programme-known discovery, university-known discovery,
the programme → university → domain → subgroup → role hand-off, and school
provisioning/resume.

## Local verification status — 2026-09-14

- Focused structured-matcher regression suite: **30 passed**.
- The matcher now starts from selected `subject_id` candidates, applies hard
  bounds to catalogue, option, authority and item reads, and returns no exact
  matches when any candidate set is incomplete or exceeds its safety bound.
- Unresolved broad O-level subject scopes remain browseable but are excluded
  from exact eligibility matching. Explicitly named/open-scope rules remain
  eligible for evaluation.
- No Supabase migration, seed, SQL write, or live matcher request was run for
  this verification pass.
- The web grouped route `/(tabs)/home`, the normalized `/home` route and the
  backend health endpoint are required local smoke checks before push.

## How to judge a case

1. Select the stated level/stream and enter the stated subjects.
2. Confirm that the subject gate prevents matching before the minimum input is
   reached. O-level-only routes may match programme possibilities; UTME routes
   require the configured UTME subject count.
3. Confirm that a result is one JAMB programme identity, not a university
   variant. Open it and verify the full offering list is loaded from the
   selected JAMB identity, including each university name and address available
   in the database.
4. Select a university before university-specific requirements are shown.
5. Confirm that the programme overview describes the selected JAMB identity,
   then continue through domain → subgroup → role. No CCMAS discipline label,
   Direct Entry, employment duplicate, or role list should leak into the
   student view.
6. For every result, compare the displayed rows with the API/database offering
   list. Never accept a truncated preview as the complete offering list.
7. A source-missing or unresolved brochure rule is browseable by programme and
   university, but must not be used as an exact subject match.

## SS1 — O-level discovery, no programme in mind (20 cases)

| # | Student / stream | O-level subjects entered | Expected route/check |
|---|---|---|---|
| 1 | Adaeze / Science | English, Mathematics, Biology, Chemistry, Physics | Show science programme possibilities; keep university selection after programme choice. |
| 2 | Musa / Science | English, Mathematics, Biology, Chemistry, Agricultural Science | Show only rules whose explicit O-level groups are satisfied; no generic catalogue matches. |
| 3 | Teni / Science | English, Mathematics, Physics, Chemistry, Geography | Show exact science possibilities; inspect each programme’s offering count. |
| 4 | Chinedu / Science | English, Mathematics, Biology, Physics, Agricultural Science | Confirm alternative subject options do not become false positives. |
| 5 | Ifeoma / Science | English, Mathematics, Chemistry, Physics, Further Mathematics | Confirm extra subjects are allowed without changing the programme identity. |
| 6 | Daniel / Commercial | English, Mathematics, Economics, Government, Geography | Show commercial/social-science possibilities, including Business Administration only if its rule is satisfied. |
| 7 | Amina / Commercial | English, Mathematics, Economics, Accounting, Commerce | Show exact commercial possibilities; do not surface O-level rules inside programme search. |
| 8 | Samuel / Commercial | English, Mathematics, Economics, Government, Accounting | Compare Accounting, Economics and Business Administration as separate JAMB identities. |
| 9 | Blessing / Commercial | English, Mathematics, Commerce, Government, Biology | Confirm biology is not silently treated as a commercial substitute. |
| 10 | Yusuf / Commercial | English, Mathematics, Economics, Geography, Civic Education | Confirm named and optional groups are evaluated, not keyword overlap. |
| 11 | Yetunde / Arts | English, Mathematics, Literature, Government, History | Show arts/social-science possibilities; no university requirement panel yet. |
| 12 | Favour / Arts | English, Mathematics, Literature, CRS, Government | Confirm religious-studies aliases are canonicalised. |
| 13 | Kelechi / Arts | English, Mathematics, History, Government, French | Confirm French is kept as the selected subject and not discarded. |
| 14 | Zainab / Arts | English, Mathematics, Arabic, Government, Literature | Confirm Arabic is not enough to qualify for unrelated broad O-level rules. |
| 15 | David / Arts | English, Mathematics, Literature, Economics, Government | Confirm multiple programme possibilities remain selectable. |
| 16 | Olamide / Science | English, Mathematics, Agricultural Science, Animal Husbandry, Arabic | Regression: Library Science and Social Work must not appear as exact matches. |
| 17 | Mary / Science | English, Mathematics, Biology, Agricultural Science, Animal Husbandry | Regression: generic “including English and Mathematics” rows remain excluded. |
| 18 | Seyi / Commercial | English, Mathematics, Government only | Gate: fewer than the O-level minimum; no matcher result. |
| 19 | Hauwa / Science | English, Mathematics, Physics, Chemistry | Gate: below the O-level credit minimum; no exact result. |
| 20 | Emeka / Arts | English, Mathematics, Literature, History, Government, Economics, French | Extra-subject case: results remain based on satisfied rules, not the first five subjects only. |

## SS2 — O-level discovery with a developing direction (20 cases)

| # | Student / stream | O-level subjects entered | Expected route/check |
|---|---|---|---|
| 1 | Grace / Science | English, Mathematics, Biology, Chemistry, Physics | Match possibilities, then let the student compare more than one programme before saving. |
| 2 | Ibrahim / Science | English, Mathematics, Biology, Physics, Geography | Confirm the result explains what is missing rather than sending the student to Explore home. |
| 3 | Ruth / Science | English, Mathematics, Chemistry, Physics, Agricultural Science | Verify programme cards show the JAMB identity and offering count. |
| 4 | Taiwo / Science | English, Mathematics, Biology, Chemistry, Further Mathematics | Confirm extra subjects do not cause a second university-selection step. |
| 5 | Ngozi / Science | English, Mathematics, Physics, Chemistry, Computer Studies | Verify aliases and stream hints do not act as hidden eligibility gates. |
| 6 | Kabiru / Commercial | English, Mathematics, Economics, Government, Accounting | Compare Business Administration, Accounting and Economics identities. |
| 7 | Esther / Commercial | English, Mathematics, Economics, Commerce, Geography | Confirm exact optional groups and no broad generic match. |
| 8 | Michael / Commercial | English, Mathematics, Accounting, Commerce, Government | Verify all returned offerings are loaded when one programme is opened. |
| 9 | Aisha / Commercial | English, Mathematics, Economics, Government, Civic Education | Show a clear “not enough evidence” state where a rule is incomplete. |
| 10 | Peter / Commercial | English, Mathematics, Economics, Accounting, Biology | Confirm Biology does not alter the selected stream label or route. |
| 11 | Juliet / Arts | English, Mathematics, Literature, Government, History | Compare English, Political Science, Sociology and related programme identities only when rules match. |
| 12 | Hassan / Arts | English, Mathematics, Arabic, Literature, Government | Confirm Arabic rules use explicit source-backed options. |
| 13 | Sharon / Arts | English, Mathematics, CRS, Literature, History | Confirm subject aliases are preserved in the explanation. |
| 14 | Wale / Arts | English, Mathematics, Government, History, Economics | Show multiple possible programmes without forcing one choice. |
| 15 | Patience / Arts | English, Mathematics, Literature, French, Government | Confirm university-specific requirements remain hidden until a university is selected. |
| 16 | Chisom / Science | English, Mathematics, Biology, Agricultural Science, Animal Husbandry | Negative mutation: removing Biology must not keep a programme that requires it unless another valid option remains. |
| 17 | Femi / Commercial | English, Mathematics, Economics, Government, Geography | Negative mutation: remove Economics and verify only genuinely satisfied rules remain. |
| 18 | Salma / Arts | English, Mathematics, Literature, Government | Gate: below minimum; show the next subject needed, not a generic programme list. |
| 19 | Daniel / Science | English, Mathematics, Biology, Chemistry, Physics, Geography, Computer Studies | Extra subjects: all selected values remain visible and the matcher evaluates the full set. |
| 20 | Ada / undecided stream | English, Mathematics, Biology, Economics, Literature | Confirm mixed stream is allowed as a discovery input but does not override source rules. |

## SS3 / tutorial candidate — O-level plus UTME preparation (20 cases)

| # | Candidate / intent | Inputs | Expected route/check |
|---|---|---|---|
| 1 | Nneka / knows neither | O-level: English, Math, Biology, Chemistry, Physics; UTME: Use of English, Biology, Chemistry, Physics | Combined match; programme identity first, offerings second. |
| 2 | Yusuf / knows neither | O-level: English, Math, Economics, Government, Geography; UTME: Use of English, Economics, Government, Geography | Combined social-science possibilities; no generic Library Science/Social Work false positive. |
| 3 | Tolu / knows programme | O-level: English, Math, Economics, Accounting, Government; programme: Business Administration | Search one programme identity, then show every offering university. |
| 4 | Amaka / knows programme + university | O-level: English, Math, Biology, Chemistry, Physics; programme: Nursing Science; university: University of Benin | Open the selected university-aware programme detail; show only that university’s requirements. |
| 5 | Ibrahim / knows partly | O-level: English, Math, Literature, Government, History; UTME: Use of English, Literature, Government, History | Show several programme choices and preserve the guidance checkpoint. |
| 6 | Funmi / knows neither | O-level: English, Math, Biology, Chemistry, Agricultural Science; UTME: Use of English, Biology, Chemistry, Agricultural Science | Confirm Agric-related exact options and all offerings. |
| 7 | Efe / knows programme | O-level: English, Math, Physics, Chemistry, Biology; programme: Computer Science | Compare university offerings without displaying variants as separate programmes. |
| 8 | Amina / knows university | University: Ahmadu Bello University; programme search: Economics | University-first list filters programmes offered by that university. |
| 9 | Chuka / knows neither | O-level: English, Math, Literature, Government, Economics; UTME: Use of English, Literature, Government, Economics | Show possible programmes with a clear programme → university progression. |
| 10 | Sade / knows partly | O-level: English, Math, Biology, Economics, Geography; UTME: Use of English, Biology, Economics, Geography | Keep both exam layers visible; do not treat O-level alone as UTME proof. |
| 11 | Mary / knows programme | Programme: Sociology; university not chosen; O-level only | Show Sociology as one JAMB identity, its university offerings, and requirements after selection. |
| 12 | David / knows programme | Programme: Library Science; O-level: English, Math, Arabic, Agriculture, Animal Husbandry | Programme search remains available, but the generic O-level rule must not exact-match this set. |
| 13 | Bisi / knows neither | O-level: English, Math, Government, Economics, Commerce; UTME: Use of English, Economics, Government, Commerce | Verify Business Administration/Accounting alternatives where explicitly supported. |
| 14 | Musa / knows programme + university | Programme: Agricultural Science; university: University of Ibadan | Verify selected university’s exception/requirement layer only after selection. |
| 15 | Kemi / knows neither | O-level: English, Math, Biology, Chemistry, Geography; UTME: Use of English, Biology, Chemistry, Geography | Confirm subject options and all offering addresses. |
| 16 | Peter / knows partly | O-level: English, Math, Literature, Government, Arabic; UTME: Use of English, Arabic, Literature, Government | Confirm Arabic source scope and review-only rows are not exact matches. |
| 17 | Zainab / knows programme | Programme: Criminology and Penology; no university yet | Verify its mapped JAMB identity, programme teaching profile and all offerings independently. |
| 18 | Emeka / knows neither | O-level: English, Math, Physics, Chemistry, Further Mathematics; UTME: Use of English, Mathematics, Physics, Chemistry | Confirm four UTME subjects are gated and no fifth subject is required. |
| 19 | Esther / knows programme + university | Programme: Accounting; university: University of Lagos | Show university-specific requirement and address; hide other universities in this detail view. |
| 20 | Halima / knows neither | O-level: English, Math, Economics, Government, History; UTME: Use of English, Economics, Government, History | Verify all returned programme offerings, then continue into domain guidance without leaving to generic Explore. |

## Current undergraduate (20 cases)

These cases begin with an existing programme. They should not use the secondary
school subject matcher as a substitute for programme-to-career guidance.

| # | Student / programme | University context | Expected route/check |
|---|---|---|---|
| 1 | Ada / Sociology | University of Ibadan | Programme overview → Social Sciences → subgroup choices. |
| 2 | Musa / Business Administration | University of Lagos | Programme overview → mapped domains; no CCMAS discipline label. |
| 3 | Nneka / Computer Science | University of Nigeria, Nsukka | Programme → direct/functional/adjacent links only where current mapping supports them. |
| 4 | Tolu / Economics | University of Benin | Confirm Economics is not silently merged with Quantitative Finance. |
| 5 | Kemi / Accounting | Obafemi Awolowo University | Programme skills and curriculum first; role data only after subgroup/role selection. |
| 6 | Chinedu / Criminology and Penology | University of Ilorin | Confirm JAMB identity and downstream mapping are the same selected programme. |
| 7 | Aisha / Political Science | Ahmadu Bello University | Domain overview must explain the field before subgroups and roles. |
| 8 | Femi / Agricultural Science | Federal University of Agriculture, Abeokuta | Confirm agriculture-specific subject and programme context. |
| 9 | Grace / Nursing Science | University of Port Harcourt | University-aware requirements remain tied to the selected offering. |
| 10 | David / Library Science | University of Nigeria, Nsukka | Programme is browseable; generic source-missing O-level text is not an exact match. |
| 11 | Sharon / English | University of Lagos | Confirm programme teaching profile is not inherited from an unrelated JAMB variant. |
| 12 | Ibrahim / Statistics | University of Ilorin | Subgroup/role tools are examples, not requirements. |
| 13 | Esther / Mass Communication | Covenant University | Confirm mapped domain explanations are student-readable. |
| 14 | Wale / Supply Chain Management | University of Lagos | Confirm supply-chain mapping and nearby domains are evidence-backed. |
| 15 | Juliet / Psychology | University of Nigeria, Nsukka | Domain foundation comes from domain-owned/curriculum evidence, not role frequency. |
| 16 | Kabiru / Geography | Bayero University Kano | Verify subgroup ownership and role nesting. |
| 17 | Amaka / Biochemistry | University of Benin | Confirm programme skills are distinct from domain foundation. |
| 18 | Peter / Sociology | Lagos State University | Test a second offering of the same JAMB identity and compare requirements. |
| 19 | Salma / Business Administration | University of Ilorin | Compare multiple offerings without turning variants into separate programme cards. |
| 20 | Emeka / Computer Science | Federal University of Technology, Akure | Complete domain/subgroup/role multi-select and print/download report. |

## Admin provisioning and resume (10 cases)

| # | Admin / student account | Starting point | Expected behavior |
|---|---|---|---|
| 1 | Ngozi / Adaeze | Create student manually, SS1 Science, no programme | Creates the actual student record, starts guidance, and saves the checkpoint on that student. |
| 2 | Samuel / Musa | Create student manually, SS2 Commercial | Returning to the roster reopens the last unfinished guidance step. |
| 3 | Bisi / Nneka | Create student manually, SS3, knows programme | Admin can complete programme → university → guidance without being sent to generic Home. |
| 4 | Tunde / Chuka | Create student manually, JAMB candidate, knows neither | Admin can enter both O-level and UTME subjects and resume later. |
| 5 | Amina / Favour | Create student manually, code supplied | Code is attached to the school context and cannot collide with another school. |
| 6 | Peter / Daniel | Existing student without guidance | Roster action starts the missing guidance route, not account creation again. |
| 7 | Grace / Kelechi | Existing student with partial subjects | Existing entries are retained when moving back/forward and on refresh. |
| 8 | Ibrahim / Teni | Existing student with selected programme and university | Resume opens the selected university-aware programme page. |
| 9 | Esther / Seyi | Student report ready | Admin can print/download and share without losing the student’s saved guidance. |
| 10 | Wale / Mary | Delete student-created account | Deletion uses the account lifecycle cooldown; it does not delete unrelated users or the school. |

## Required evidence to attach during execution

- browser URL and screenshot for each failed route transition;
- request/response status for the subject matcher, programme detail and school
  offering endpoints;
- selected subject set, stream, exam type and user type;
- returned JAMB programme IDs and the complete offering count for each selected
  programme;
- selected university ID, address and university-specific requirement state;
- guidance checkpoint before leaving and after refresh/resume;
- report ID/version when printing or downloading.

## Known current blockers

- A live Supabase project with missing/empty typed rule tables must be reported
  as matcher-blocked; it must not be represented as “zero valid programmes.”
- The backend fallback can render a JAMB identity from `jamb_programmes` when
  the optional detail view is absent, but it cannot invent missing curriculum,
  requirements or offerings.
- Direct Entry remains stored for the future polytechnic route and must remain
  absent from these student/SS/JAMB cases.
