# SS1 implementation refinements

This file records the approved SS1 behavior decisions that should guide screen
and component implementation. It is separate from the full text mockup in
`ss1-student-flow.md`.

## Onboarding

- SS1 has two starting choices: `Help me choose subjects` and `I already have a programme in mind`.
- Do not use the SS3 `know where / know what / unsure` doors for SS1.
- Preserve class, school, stream, subjects, programme and draft state when going back or refreshing.
- Require class, school and stream before guidance begins.
- School search must show useful results while typing and display the school address.

## Subjects and programme discovery

- English Language and Mathematics appear first in the O-level subject picker.
- Subject matching becomes available after five O-level subjects.
- Subject search and programme-name search remain separate.
- Programme results show the programme name, university count, address preview and a compact subject signal.
- Full requirements are shown only after the student selects a university.
- Do not say that a student qualifies or is guaranteed admission.

## Programme-first behavior

- Programme search begins as soon as the query is useful enough to search.
- After selecting a programme, the student continues directly into guidance.
- Do not route the student to Home or general Explore at that point.
- The primary action is `Continue guidance`.
- A student may add another programme later through an explicit action.

## Programme detail

- Use Overview, Requirements and Schools/university picker.
- Show what the programme teaches and its real programme skills in plain language.
- Show only the selected university on an institution-specific overview.
- Do not show curriculum classification names or unnecessary department labels.
- Do not show Direct Entry requirements to SS1.

## Guidance hierarchy

- The programme page shows only a short `Where this can lead` preview.
- `Continue to field guidance` opens the full domain -> subgroup -> role flow.
- Do not create a separate Employment tab; it duplicates the career hierarchy.
- Roles belong under subgroups. Unassigned roles are data-quality issues and should not appear as a flat SS1 list.
- Direct, functional and adjacent describe mapping distance, not student ability.

## Admission information

- Fold university admission information into Requirements and Schools.
- Do not show an empty or pending Admission tab in SS1.
- Show only real institution-specific admission data.

## Resources

- Show real links beside the domain, subgroup, role, skill, competency, tool or qualification they explain.
- Use truthful actions: `Open resource`, `Open skill reference`, `Open learning link`, `Open tool guide` and `Open qualification information`.
- Do not promise activities, projects or skill exploration unless the linked record actually opens one.
- Allow saving links to My World under an ordered `Saved learning` library.
- Do not create a mandatory standalone resource screen.
- A missing URL must show an accurate missing state, not a hardcoded resource.

## Saving, Home and reports

- Saving shows an inline `Saved to My World` confirmation; there is no separate saved-path screen.
- My World stores the full structured context: school, stream, subjects, programmes, universities, domain, subgroup, role, resources and reports.
- Home's primary action is `Continue guidance`.
- Comparison is optional and only appears after the student saves multiple programmes.
- Reports are SS1 Guidance Summaries, can include multiple programmes, and support print, PDF download, QR/access code and sharing.
- Reports must never show `Under review` unless a real submission exists.

## Data boundary

- Do not use demand data, market statistics, readiness scores or employment forecasts in the SS1 experience.
- SQL files in the repository may be audited as candidate source data, but only active, validated records may be presented as live product data.
