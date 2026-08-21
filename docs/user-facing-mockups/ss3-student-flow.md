# SS3 student experience: admission preparation and career guidance

This is the user-facing flow for an SS3 student from account selection through
JAMB-oriented programme and university guidance, saving, printing and sharing.

The sample person, school and university are fictional. The programme,
domain, subgroup, role and resource labels are examples of records already
present in the current repository. Production screens must resolve live
records at runtime; they must not hardcode this example.

## What SS3 changes from SS2

SS3 is still attached to a secondary school, but the student is now close to a
UTME decision. The product therefore asks for both sides of the admission
check when the student wants subject matching:

| SS3 concern | User-facing behaviour |
| --- | --- |
| School identity | Required. Show the school address whenever it is selected or printed. |
| Class | SS3 is selected from the account card and remains visible in the plan. |
| Stream | Required before subject guidance. It organises suggestions; it does not decide eligibility. |
| O-level subjects | At least five before a subject-based check can run. |
| UTME subjects | Use of English plus three other subjects before a combined check can run. |
| Known programme/university | The student can view requirements before entering subjects. Subject checking is optional on this route. |
| Unknown programme | Both O-level and UTME subjects are required before matching programmes. |
| Next destination | Once a programme and university are selected, guidance opens directly into the mapped field path. |

SS3 is not an admission prediction tool. It does not promise eligibility,
admission, a score, a job or a particular outcome.

## Sample context

```text
Student: Teni Adeoye
Account type: SS3 Student
School: Greenfield College
School address: 18 Alaba Road, Ikeja, Lagos State
Class: SS3
Stream: Commercial
O-level subjects: English Language, Mathematics, Economics, Government, Accounting
UTME subjects: English Language, Mathematics, Economics, Government
Programme selected: Business Administration
University selected: North Coast University
University address: University Road, Akure, Ondo State
```

The address is not decorative. It helps the student confirm that the selected
school or university is the correct institution when names are similar.

## Account selection

### Screen 1: choose the right student type

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
```

The SS3 card is the `ss3_secondary` path in
`src/screens/onboarding/AccountTypeGate.tsx`. It must not be silently treated
as SS1, SS2 or JAMB.

## Onboarding setup

### Screen 2: explain the SS3 decision

```text
Build your SS3 admission plan

You are close to making your programme and university choices. Choose what you
already know, and we will take you to the next useful step.

You can start with a programme and university, a programme only, or your
current subjects. We will show requirements before asking you to make a final
choice.

[ Continue ]
```

Avoid phrases such as “admission decision”, “eligibility gate” or “you are
ready”. The student is preparing and comparing, not receiving a final
decision.

### Screen 3: confirm school, class and stream

```text
Your SS3 plan

Class
[ SS3 ]

Secondary school
[ Search your school                              ]

Search results
  Greenfield College
  18 Alaba Road, Ikeja, Lagos State
  Secondary school

[ Select Greenfield College ]

Stream
[ Science ]  [ Art ]  [ Commercial - selected ]

Your stream helps us organise subject guidance. The programme requirements
still come from the published programme and university records.

[ Continue ]
```

School results should surface while the student types. The current school
search begins at one character, and the selected school is retained in the
onboarding draft when the student goes back. A changed school must not erase
the student's subject plan unless the data model explicitly says those
subjects are invalid for the new context; if clearing is necessary, warn first.

### Screen 4: choose the question to answer first

This is the `SsDoor` choice in `JambSetupForm.tsx`.

```text
What do you know already?

[ I know the programme and university ]
Check one programme at the university you have in mind.

[ I know the programme, but not the university ]
See universities that offer it and compare their requirements.

[ I want help finding a programme ]
Use your O-level and UTME subjects to find programmes to explore.
```

The three choices are not three separate products. They are three starting
doors into the same sequence:

```text
programme + university
  -> programme details and university requirements
  -> mapped domain
  -> subgroup
  -> roles, skills, competencies and available learning links
  -> saved guidance and report
```

## Route A: the student knows the programme and university

### Screen 5A: enter the known choice

```text
Start with your choice

Programme
[ Search a programme                              ]

Search results
  Business Administration
  Offered by 4 universities
  What you may study: organisations, planning, people, money and decisions

University
[ Search the university                          ]

North Coast University
University Road, Akure, Ondo State
Business Administration · B.Sc. · 4 years

[ See this programme's requirements ]
```

The student is allowed to continue without entering subjects on this route.
The screen may offer a secondary action:

```text
[ Check my subjects too - optional ]
```

If the student chooses it, show the O-level and UTME pickers with their
thresholds. Do not force a student who already knows the programme and
university to repeat subject selection before seeing the requirements.

### Screen 6A: selected university programme details

```text
BUSINESS ADMINISTRATION
North Coast University
University Road, Akure, Ondo State

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

Requirements for this university

UTME subjects
Use of English and the published subjects for this programme.

O-level credits
The published O-level requirement for Business Administration at North Coast
University.

The university's wording is shown when a real record exists. If the record is
missing, say “This university's published requirement is not available yet.”
Do not fill the gap with a generic requirement or a made-up score.

[ Continue to field guidance ]
[ Change university ]
```

The overview must use stored programme skills and curriculum components, but
translate them into student language. It must not show raw fields such as
`skillsTechnical`, `skillsTransferable`, `studentName`, CCMAS labels or an
internal department field.

If the student supplied subjects, add a compact check below the requirements:

```text
Your subject check
Your UTME subjects fit the published UTME check. Your O-level subjects still
need to be checked against the university's full requirement.
```

The system must not call this a guarantee. The current code correctly blocks
final university selection when combined subject data has a gap or cannot be
verified.

## Route B: the student knows the programme but not the university

### Screen 5B: programme search

```text
Find a university for your programme

Programme
[ Business Administration                         ]

Business Administration
4 universities found
This programme looks at planning, organisations, people, resources and
decisions.

[ View universities ]
```

Programme results may show the number of trusted university records when the
count is real. The result should not show O-level subjects as if the student
were searching subjects. Requirements belong in the selected programme and
university details.

### Screen 6B: university picker

```text
Where could you study Business Administration?

North Coast University
University Road, Akure, Ondo State
Business Administration · B.Sc. · 4 years
Published requirement check available
[ Compare this university ]

Lakeside State University
Campus Road, Ilorin, Kwara State
Business Administration · B.Sc. · 4 years
Requirement wording is not available yet
[ View programme details ]

[ Keep comparing programmes ]
```

This is where university names and addresses first become prominent. A student
needs enough information to choose an institution, not every brochure line for
every university at once.

Selecting one university opens the same selected-university overview as Route
A. It does not open Home and it does not clear the programme.

## Route C: the student wants help finding a programme

### Screen 5C: O-level subjects

```text
Choose your O-level subjects

Selected
  English Language
  Mathematics

Add the subjects you are taking or expect to take

  Economics                  [ + ]
  Government                 [ + ]
  Accounting                 [ + ]
  Commerce                   [ + ]
  Literature in English      [ + ]

Choose at least 5 O-level subjects before we check programme fit.
```

English Language and Mathematics may be preselected by the current form. The
subject catalogue must come from the live subject records and stream context;
it must not be a hardcoded array in the screen.

### Screen 6C: UTME subjects

```text
Choose your UTME subjects

Selected
  Use of English

Add 3 other subjects

  Mathematics                [ + ]
  Economics                  [ + ]
  Government                 [ + ]
  Accounting                 [ + ]

Choose Use of English and 3 other UTME subjects before we match programmes.
```

The current code uses four UTME subjects in total, with English fixed, and at
least five O-level subjects. “Match programmes” remains disabled until both
thresholds are met:

```text
[ Match programmes - disabled ]
```

After the student reaches the thresholds:

```text
[ Match programmes ]

Your stream helps organise the suggestions. Your subjects are what we check
against the published programme requirements.
```

The blocked state is intentional. It prevents a programme list from appearing
before there is enough information to perform the combined check. Subject
selection itself can remain visible, but it must not pretend that a partial
list is a complete match.

### Screen 7C: subject-based programme results

```text
Programmes to explore from your subjects

These are starting points from the O-level and UTME subjects you entered. Open
one to see its university options and exact requirement text.

BUSINESS ADMINISTRATION
4 universities found
Your UTME subjects fit the published UTME check. Review the O-level requirement
for each university.
[ View programme and universities ]
[ Save programme ]

ACCOUNTING
3 universities found
Your current subjects give you a programme to explore. Check each university's
requirements before deciding.
[ View programme and universities ]
[ Save programme ]

[ Save subject plan ]
```

The cards should show university counts only when the count is backed by real
offering rows. The cards should not show a CCMAS discipline, a demand score,
a national aggregate, a “readiness” label or an admission prediction.

When the O-level requirement has a gap, say exactly that:

```text
Your UTME subjects fit this programme, but your O-level subjects still have a
gap: Mathematics.
```

When the result cannot be checked:

```text
We could not verify this programme against your subjects yet. Try again before
choosing a university.
```

Do not render “matched 3/4” as the main message. The current brief says that a
raw match count is not a complete eligibility result.

### Screen 8C: programme and university resolution

Opening Business Administration shows its university list. Choosing North
Coast University opens the same detail state as Route A, then enables:

```text
[ Continue to field guidance ]
```

The onboarding route is complete only after both programme and university are
resolved. The selected programme and university are saved in the starting
point and guidance path so a refresh or back navigation does not restart the
student.

## Career guidance after academic choice

The programme screen gives a short handoff. It does not repeat the full career
taxonomy.

```text
WHERE THIS CAN LEAD

Closest connection
General Management
Business Administration studies planning, organisation, people, resources and
decisions, so this is the first field to explore.

Other connected fields
Economics · functional connection
Marketing, Brand · adjacent connection

[ Continue to field guidance ]
```

The full guidance screen then explains the mapping in student language:

```text
Your programme connects most closely to General Management because it includes
planning, organisation, people, resources and decision-making.

DIRECT CONNECTION
General Management
This is the closest field because the programme covers many of the ideas this
field is built around.

FUNCTIONAL CONNECTION
Economics
Some ideas transfer, but Economics has a deeper focus on markets, policy and
economic analysis.

ADJACENT CONNECTION
Marketing, Brand
The programme shares planning, coordination and decision-making with this
field, but Marketing has a different specialist focus.
```

The three labels mean:

- Direct: the programme teaches many central ideas of the field.
- Functional: the programme teaches abilities that can be useful in the field,
  but more field-specific learning is needed.
- Adjacent: the programme shares some useful abilities with a farther-related
  field, but it is not the programme's main focus.

These explanations must be generated from the current programme-to-domain
mapping, the domain definition and the inherited CCMAS curriculum scope. They
must never say that an SS3 student already has the skills or is ready for a
role.

### Domain card

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

Learning links, when available
  [ Open field resource ]
  [ Save resource ]
```

### Subgroup card

Subgroups are areas inside a domain. They are not a flat second list and they
are not an unexplained developer label.

```text
BUSINESS ANALYSTS & CONSULTANTS
A part of General Management

This area looks at problems, information, business processes and ways an
organisation could improve.

You may enjoy exploring
  Asking useful questions
  Understanding information
  Looking at how work is done
  Explaining possible improvements

[ Explore this area ]
```

### Role card

Roles belong under the selected subgroup:

```text
BUSINESS ANALYST

What this work involves
Helping an organisation understand a problem and decide what could change.

This can include
  Listening to people
  Looking at information
  Asking clear questions
  Explaining possible improvements

Things to build over time
  Curiosity
  Clear communication
  Careful thinking
  Problem-solving

[ Understand this role ]  [ Save this role ]
```

The student sees a discovery path, not a job-readiness score or employment
forecast. Roles should not appear as an independent flat list when a subgroup
record exists.

## Resources and My World

Resources remain attached to the item they explain:

```text
GENERAL MANAGEMENT
Why this link is here
It helps you understand how planning and budgets are used in organisations.
[ Open learning link ]  [ Save resource ]

BUSINESS ANALYSTS & CONSULTANTS
Why this link is here
It explains how people study problems and improve the way work is done.
[ Open resource ]  [ Save resource ]

BUSINESS ANALYST
Why this link is here
It helps you understand the kind of questions and information this role uses.
[ Open role reference ]  [ Save resource ]
```

Only links that exist in the live resource record are shown. The current
repository has migration and seed SQL for domain, subgroup, role, skill,
competency, tool and certification resources, but a resource table or row that
has not been deployed is not displayable. In that state show:

```text
No trusted learning link is available yet.
```

Do not promise an activity, simulator, course or certification unless the link
really opens that thing. Saved items appear in My World under `Saved learning`,
ordered from the selected domain to subgroup to role path.

## SS3 report and export

The report is a compiled guidance output, not a screen called “Report”. The
student reaches it from a download/print action after the programme and
university path has been saved.

```text
BUSINESS ADMINISTRATION
SS3 admission preparation summary

Student: Teni Adeoye
School: Greenfield College
School address: 18 Alaba Road, Ikeja, Lagos State
Stream: Commercial

Selected university
North Coast University
University Road, Akure, Ondo State

Programme
Business Administration · B.Sc. · 4 years

Your subject plan
O-level: English Language, Mathematics, Economics, Government, Accounting
UTME: English Language, Mathematics, Economics, Government

Requirements to review
UTME subjects: [published requirement text]
O-level credits: [published requirement text]

What the programme is about
[student-facing programme overview]

Your guidance path
General Management
  Business Analysts & Consultants
    Business Analyst

Connected fields
Economics · functional
Marketing, Brand · adjacent

This is guidance for planning and comparison. It is not an admission guarantee.
Check the university's current notice before applying.

[ Download ] [ Print ] [ Share ]
```

`Share` uses the existing device/browser share path where available. Email,
WhatsApp, Drive or Dropbox may be offered by the operating system or an
available connector; the product must not claim a destination succeeded unless
the handoff succeeds. Downloaded and printed output must contain the school
and university addresses, the selected subjects and the actual unresolved-data
state.

No national aggregate, demand score, application probability, employment
forecast or fabricated source-year badge belongs in this SS3 report.

## Data and implementation boundary

The flow is grounded in:

- `src/components/onboarding/JambSetupForm.tsx` for SS3 doors, school,
  stream, O-level and UTME input;
- `src/screens/onboarding/AccountTypeGate.tsx` for the separate SS3 account
  type;
- `src/screens/OnboardingFlow.tsx` for starting-point persistence and routing;
- `src/screens/careerIntelligence/AdmissionBrowseScreen.tsx` for programme,
  university and combined subject matching;
- `src/types/onboarding.ts` for the distinction between O-level and UTME
  subjects;
- the current programme/domain data and domain role registry for the guidance
  path.

SQL files are candidate data and migration sources, not proof that the data is
currently live. If a migration or seed has not been applied, the UI must use an
honest unavailable state. This document intentionally excludes demand data,
even where demand seed files exist in the repository.
