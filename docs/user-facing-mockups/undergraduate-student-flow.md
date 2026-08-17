# Undergraduate student experience: university programme to career path

This is the user-facing flow for a student who is already studying at a
university. It covers account selection, university and programme setup,
career guidance, saving, resources, My World, printing and sharing.

This is not the SS3/JAMB admission flow. An undergraduate student is not being
asked to choose a future university or match O-level and UTME subjects. The
student starts from the university and programme they are currently studying.

The sample person, university and address are fictional. Programme, domain,
subgroup, role, skill, competency, tool, certification and resource records
must be resolved from the live repository-backed APIs at runtime.

## What makes the undergraduate route different

| Undergraduate student | SS3/JAMB candidate |
| --- | --- |
| Already enrolled in a university programme | Choosing a programme and university |
| University is selected first | Programme, subjects and university may be unresolved |
| Faculty may narrow the programme list when recorded | Stream organises subject guidance |
| No O-level/UTME subject matching in onboarding | Combined O-level and UTME matching can be required |
| Main continuation is programme-to-domain guidance | Main completion rule is programme plus university selection |
| Admission information is secondary and contextual | Requirements are central to the decision |

The undergraduate profile should help a student understand what their current
programme teaches, what areas it connects to, which subgroups and roles sit
under those areas, and what to learn next. It must not imply that the student is
already qualified for a role.

## Sample context

```text
Student: Uche Okafor
Account type: Undergraduate Student
University: Cedar Valley University
University address: 12 Independence Avenue, Enugu, Enugu State
Faculty: Faculty of Management Sciences
Programme: Business Administration
Programme name used by the university: Business Administration
Qualification: B.Sc.
Duration: 4 years
```

The university address is shown in search results, the selected context, the
programme overview and the printed output. It prevents confusion where two
institutions have similar names.

## Account selection

### Screen 1: choose the current student type

```text
Who are you using Sifter as?

[ SS1 Student ]
Start broad: school, stream and early subject guidance

[ SS2 Student ]
Narrow subjects before SS3 and UTME decisions

[ SS3 Student ]
School-based admission guidance for final-year secondary students

[ JAMB Candidate ]
Tutorial centre or self-taught UTME admission guidance

[ Undergraduate Student ]
Start from your university and programme
```

The undergraduate card is the `student` persona in
`src/screens/onboarding/AccountTypeGate.tsx`. It supplies
`userType="student"` and `institutionType="university"` to
`CurrentStudentSetupForm`.

## Onboarding setup

### Screen 2: explain the current-student path

```text
Tell us what you study

Choose your university first. Then we will show only the faculties and
programme names recorded for that university.

This path is for a student currently studying at a university.
```

Do not ask this student to select a secondary-school stream, O-level subjects,
UTME subjects, tutorial-centre mode or an admission discovery door.

### Screen 3: optional school code

The shared onboarding shell currently shows this before the setup form:

```text
Have a school code?

Enter it now or leave this for later. It only links your account to the school;
it does not expose your progress.

[ Enter school code                         ] [ Link ]

[ Continue without a code ]
```

For an undergraduate, “school” means the selected university. The code is an
affiliation link, not an admission code and not permission to view student
records. If linking fails:

```text
That university code could not be linked yet. You can continue without it.
```

The student must not be blocked from creating a personal guidance path because
the university affiliation service is temporarily unavailable.

### Screen 4: search the university

```text
Your university

[ Search your university                           ]

Search results
  Cedar Valley University
  12 Independence Avenue, Enugu, Enugu State
  University

  Cedar Heights University
  8 Airport Road, Enugu, Enugu State
  University

[ Select Cedar Valley University ]
```

The university typeahead should show results while the student types, not wait
for a complete name. The address and institution type appear on every result.

If no institution record is available:

```text
We could not find that university yet.
You cannot add a new university from this step yet. Try another search or
continue only when the correct university record is available.
```

Do not silently create a new university from free text. The current form uses
`LiveAdmissionSearchField` with `institutionType="university"` and requires a
recorded university ID.

### Screen 5: optional faculty filter

After the university is selected, show a faculty selector only when the API
returns real faculty records:

```text
Cedar Valley University
12 Independence Avenue, Enugu, Enugu State

Faculty (if listed)
[ Faculty of Management Sciences                 v ]

You can use the faculty to narrow the programme list. Your final choice stays
tied to this university.
```

Faculty is a helpful university context, not a student-facing classification
label. Do not show CCMAS discipline names or turn an internal `discipline`
field into a second programme identity.

If the faculty list is unavailable, omit the field. Do not show `Pending` or a
blank placeholder:

```text
```

The programme field should simply appear below the university. Missing faculty
data is not a failure of the undergraduate setup.

### Screen 6: choose the university's programme

```text
Your programme

[ Search this university's programmes              ]

Business Administration
Faculty of Management Sciences

Accounting
Faculty of Management Sciences

Economics
Faculty of Social Sciences

Choose the programme name your university uses. This keeps your university and
programme details connected.

[ Continue ]
```

The programme list is scoped to the selected university. It should not mix in
the national catalogue until the student explicitly chooses `Explore another
programme` later.

The Continue action is disabled until both a university ID and programme ID
exist:

```text
[ Continue - disabled ]
```

Once both exist:

```text
[ Continue ]
```

The selected programme uses the name recorded for that university. A separate
department field is unnecessary unless the source contains a distinct,
student-useful value. The current product decision is that the programme name
is the primary identity.

## Persistence and return behaviour

The onboarding draft must retain each selected value:

```text
University selected
  -> faculty selected, if available
  -> programme selected
  -> Back
  -> Forward
  -> the same university, faculty and programme remain selected
```

If the student refreshes during setup, the current draft should restore the
same step and values. Refreshing must not send the student to sign-in or clear
the university/programme. If the saved API profile is temporarily unavailable,
the local draft should remain visible and the UI should state that it is
restoring, rather than replacing the form with an empty state.

## Completion handoff

The current `OnboardingFlow` saves the undergraduate starting point and then
routes through Home. `CareerHomeScreen` recognises a student with a programme
ID and offers `Continue to career mapping`.

The refined behaviour should preserve that safety but make the next step feel
direct:

```text
Your programme is saved

Business Administration
Cedar Valley University

We can now show the fields, areas and roles connected to what you study.

[ Continue to career mapping ]
```

The student should not be dropped into a generic Home page with no explanation.
If Home remains the technical landing route, its first card must be this
contextual handoff, not a generic admission tile or a fresh onboarding prompt.

## Programme overview

### Screen 7: one programme, one university

```text
BUSINESS ADMINISTRATION
Cedar Valley University
12 Independence Avenue, Enugu, Enugu State
Faculty of Management Sciences

B.Sc. · 4 years

What this programme is about
Business Administration looks at how organisations plan work, manage people and
resources, make decisions and improve the way they operate.

What you may study
  Planning and organising work
  Understanding how organisations operate
  Working with money, information and resources
  Making and explaining decisions
  Communicating and working with people
```

The overview uses the programme record's stored skills and curriculum
components, translated into student language. It must not expose raw
`skillsTechnical`, `skillsTransferable`, `skillsComponents` or internal mapping
fields.

The undergraduate does not need a full JAMB admission block at the top of the
page. Requirements can be available as a secondary context if the student
chooses to review another university or admission option. For the current
programme, the primary question is “What am I studying and where can it lead?”

### Programme sections

The programme screen should be structured as:

```text
[ Overview ] [ Schools & admission ] [ Career guidance ]
```

The sections mean:

1. `Overview` explains what the programme teaches, the university context and
   the programme skills in student language.
2. `Schools & admission` is secondary for a currently enrolled student. It can
   show other universities and published admission information only when the
   student intentionally explores alternatives. It must not become an empty
   “pending” page.
3. `Career guidance` opens the programme-to-domain path. It is not a duplicate
   Employment screen.

The existing code currently has internal track names `employment`,
`entrepreneurship` and `admission`. The undergraduate user-facing language
should not call the main guidance path “Employment”; it should say `Career
guidance` or `Where this can lead`.

## Career guidance path

### Screen 8: programme handoff

```text
WHERE THIS CAN LEAD

Your Business Administration programme connects most closely to General
Management because it includes planning, organisation, people, resources and
decision-making.

Other connected fields
Economics · functional connection
Marketing, Brand · adjacent connection

[ Continue to field guidance ]
```

The mapped labels in this sample come from the current repository's mapping
example. At runtime, the API must resolve the actual mappings for the selected
university programme. A programme with no live domain mapping should say:

```text
Career guidance for this programme is not available yet.
Your programme details are still saved.
```

Do not substitute demand, popularity or generic career guesses.

### Screen 9: explain the relationship types

```text
How the connections work

DIRECT
The programme teaches many central ideas of this field.

FUNCTIONAL
Some abilities transfer, but deeper field-specific learning is needed.

ADJACENT
The field shares some useful abilities, but it is farther from the main focus
of the programme.
```

For the sample programme:

```text
DIRECT CONNECTION
General Management
Business Administration covers planning, organisations, people, resources and
decisions, which are central to this field.

FUNCTIONAL CONNECTION
Economics
Business Administration includes business activity, numbers and decisions.
Economics adds deeper study of markets, policy and economic analysis.

ADJACENT CONNECTION
Marketing, Brand
Business Administration includes planning and coordination. Marketing uses
some of those abilities but has a different specialist focus.
```

These explanations must be produced from the current programme curriculum,
programme-to-domain mapping and domain definitions. They must not claim that
the student is already skilled, qualified or ready for a role.

### Screen 10: domain card

```text
GENERAL MANAGEMENT
How organisations and departments are planned and run

You may learn about
  Planning and organising work
  Money and resources
  People and teamwork
  Making decisions

Areas inside this field
  Department & Finance Managers
  Business Analysts & Consultants
  Chief Executives & Founders

[ Explore this field ] [ Save field ]
```

The card is an invitation to understand a field, not a skills assessment.

### Screen 11: subgroup card

```text
BUSINESS ANALYSTS & CONSULTANTS
A part of General Management

This area looks at problems, information, business processes and ways an
organisation could improve.

You may explore
  Asking useful questions
  Understanding information
  Looking at how work is done
  Explaining possible improvements

[ Explore this area ] [ Save area ]
```

Roles remain arranged under their subgroup:

```text
BUSINESS ANALYST

What this work involves
Helping an organisation understand a problem and decide what could change.

Things to build over time
  Curiosity
  Clear communication
  Careful thinking
  Problem-solving

[ Understand this role ] [ Save role ]
```

If the current data has roles without a subgroup, the UI may show an explicitly
labelled `Other roles in this field` section. It must not pretend those roles
belong to a subgroup that the data does not assign.

## Resources, skills and My World

The undergraduate sees resources beside the thing they explain:

```text
GENERAL MANAGEMENT
Why this link is here
It helps you understand how organisations plan work and resources.
[ Open learning link ] [ Save resource ]

BUSINESS ANALYSTS & CONSULTANTS
Why this link is here
It explains how people study problems and improve the way work is done.
[ Open resource ] [ Save resource ]

BUSINESS ANALYST
Why this link is here
It helps you understand the questions and information used in this role.
[ Open role reference ] [ Save resource ]
```

Only real, validated links are actionable. Use labels such as `Open resource`,
`Open skill reference`, `Open tool guide` and `Open qualification information`.
Do not promise an activity or simulator when the URL only opens an article.

The repository supports resource ownership by domain, subgroup, role, skill,
competency, tool and certification, but migration/seed SQL does not guarantee
that the table and parent rows exist in the active database. If a link is not
live:

```text
No trusted learning link is available yet.
```

Saved resources are organised in My World, not scattered as an unexplained
second career-resources product:

```text
SAVED LEARNING

START HERE
  General Management overview

BUILD FOUNDATIONS
  Planning reference
  Business analysis learning link

EXPLORE THE AREA
  Business Analysts & Consultants resources

UNDERSTAND THE ROLE
  Business Analyst role reference

LATER
  Qualification information, when a real link exists
```

## Undergraduate Home behaviour

The current `CareerHomeScreen` already has a personalised starting-point card,
saved paths and quick actions. For an undergraduate, the first card should be:

```text
YOUR CURRENT PROGRAMME

Business Administration
Cedar Valley University
12 Independence Avenue, Enugu, Enugu State

[ Continue to career mapping ]
[ Update university or programme ]
```

Useful quick actions may remain available below it:

```text
[ Explore programmes ]
Find programmes, universities and connected fields

[ Entrepreneurship ]
Explore build paths connected to your field

[ Opportunities ]
View real opportunities when available

[ My World ]
Your saved fields, roles, resources and notes
```

Entrepreneurship is an optional separate path from the programme/domain
guidance. It should not replace the academic-to-career map. Skills Match is
also independent: it is a flipped discovery tool that starts from current
skill knowledge and finds places it maps to. It should not be presented as a
programme requirement or inserted into this report automatically.

If opportunity data is unavailable, use an honest empty state. Do not render
market demand or employment predictions in the undergraduate home.

## Undergraduate report and export

The student can print or download the confirmed guidance path without first
saving every card. Saving a domain, subgroup or role is a separate action.

```text
BUSINESS ADMINISTRATION
Undergraduate guidance summary

Student: Uche Okafor
University: Cedar Valley University
University address: 12 Independence Avenue, Enugu, Enugu State
Faculty: Faculty of Management Sciences

Programme
Business Administration · B.Sc. · 4 years

What this programme teaches
[student-facing programme overview]

Selected guidance path
General Management
  Business Analysts & Consultants
    Business Analyst

Connected fields
Economics · functional
Marketing, Brand · adjacent

Learning links saved
  [only the resources the student saved]

Data notes
  [only real unavailable or incomplete fields]

This guidance describes possible areas to explore. It is not a qualification,
licence, job-readiness assessment or employment promise.

[ Download ] [ Print ] [ Share ]
```

The report must not silently include every domain, subgroup or role mapped to
the programme. The existing guidance-report contract says only branches the
student opened and selected belong in the selected-path section.

The report header should include the student type and university context. It
should not include a blank year of study, classification, grade, demand value
or readiness status because `CurrentStudentSetupForm` does not currently
collect those fields. If year or classification is added later, it must be an
explicitly collected value and should appear only when present.

`DetailScaffold` already provides the intended action pattern for detail views:
save, guidance-report selection, PDF export and share. The final programme
report should use the same pattern and preserve the current programme context
when printing or sharing.

## Alternative exploration for an enrolled student

The student may intentionally choose to explore another programme or
university, but it must not overwrite the current programme by accident:

```text
Your current programme
Business Administration · Cedar Valley University

[ Keep this programme ]

Explore another programme
[ Search programmes or universities ]

This will open a comparison view. Your current programme will remain saved.
```

The national Explore catalogue is appropriate for alternatives. It is not the
default landing state after undergraduate onboarding.

## Data and implementation boundary

This mockup follows the audited code paths:

- `src/screens/onboarding/AccountTypeGate.tsx` for the Undergraduate Student
  persona and `userType="student"`;
- `src/screens/OnboardingFlow.tsx` for draft persistence, optional school-code
  affiliation and onboarding completion;
- `src/components/onboarding/CurrentStudentSetupForm.tsx` for university-first
  selection, optional live faculty filtering and university-scoped programme
  selection;
- `src/components/onboarding/LiveAdmissionSearchField.tsx` for live typeahead
  selection;
- `src/screens/CareerHomeScreen.tsx` for the current-student starting-point
  card and `Continue to career mapping` action;
- `src/screens/careerIntelligence/ProgrammeOverviewScreen.tsx` for programme
  overview, requirements, university offerings and the current career/build
  sections;
- `src/screens/careerIntelligence/DomainDetailScreen.tsx` and related domain,
  subgroup and role components for the mapped guidance path;
- `docs/mockups/GUIDANCE_REPORT_BEHAVIOUR.md` for report selection and export
  rules.

SQL and seed files remain candidate sources until their migrations are applied
and the API returns a real record. Missing faculty, programme, mapping or
resource data must be shown as unavailable, not as blank pending data or
hardcoded filler. Demand and market-intelligence data are intentionally excluded
from this undergraduate student flow.
