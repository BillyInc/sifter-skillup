# JAMB candidate experience: programme, university and career guidance

This is the user-facing flow for a JAMB/UTME candidate who is not using the
ordinary school-attached onboarding path. It covers account selection,
tutorial-centre or self-taught preparation context, programme and university
discovery, subject checks, guidance, saving, printing and sharing.

The sample person, tutorial centre and university are fictional. Programme,
domain, subgroup, role and resource labels are resolved from current repository
records at runtime. The sample is not a seed instruction and must not become
hardcoded UI data.

## What makes JAMB different from SS3

Both paths use the same three admission doors and both can use O-level plus
UTME subjects. The context is different:

| JAMB candidate | SS3 student |
| --- | --- |
| Not required to choose a secondary school | Secondary school is required |
| Must choose tutorial-centre or self-taught preparation | School context is the starting institution |
| May be preparing independently or through a centre | Is still attached to SS3 and its stream |
| Does not receive a school roster or class workflow | Keeps SS3 class and stream in the plan |
| Needs a focused programme/university decision path | Needs a school-based final-year preparation path |

The admission logic remains the same: a programme and university must be
resolved before the saved guidance path is considered complete.

## Sample context

```text
Candidate: Samuel Chinedu
Account type: JAMB Candidate
Preparation mode: Self-taught
Stream: Commercial
O-level subjects: English Language, Mathematics, Economics, Government, Accounting
UTME subjects: English Language, Mathematics, Economics, Government
Programme selected: Business Administration
University selected: North Coast University
University address: University Road, Akure, Ondo State
```

For the tutorial-centre route, the sample can instead be:

```text
Preparation mode: Tutorial centre
Tutorial centre: BrightPath Tutorial Centre
Address: 4 Oke Street, Ibadan, Oyo State
```

A tutorial centre is a preparation context, not a university and not a school
roster. The current institution types explicitly distinguish tutorial centres
from student-roster institutions.

## Account selection

### Screen 1: choose JAMB Candidate

```text
Who are you using Sifter as?

[ JAMB Candidate ]
Tutorial centre or self-taught UTME admission guidance

I am still in SS3?
[ Choose SS3 Student instead ]
```

The second line is a small correction link, not an additional account type. A
student still attached to a secondary school should use the SS3 path so their
school and class context are retained.

## Preparation context

### Screen 2: choose how you are preparing

```text
How are you preparing for JAMB?

[ I am preparing by myself ]
Use your own subjects and programme choices.

[ I attend a tutorial centre ]
Use a registered tutorial centre as your preparation context.
```

For tutorial-centre mode:

```text
Find your tutorial centre

[ Search tutorial centres                         ]

Search results
  BrightPath Tutorial Centre
  4 Oke Street, Ibadan, Oyo State
  Tutorial centre

[ Select BrightPath Tutorial Centre ]
```

The current `JambSetupForm` searches `institutionType="tutorial_centre"` and
allows selection from live records. It must show the address because two
centres may share a name. If the centre is not found, say:

```text
We could not find that tutorial centre yet.
You can continue as self-taught, or try another search.
```

Do not turn a missing tutorial-centre record into a fake school or create a
student roster from it.

For self-taught mode:

```text
Self-taught preparation selected

You can change this later. Your programme, university and subject choices will
stay saved.
```

### Screen 3: choose stream

```text
Which stream best describes your subjects?

[ Science ]  [ Art ]  [ Commercial - selected ]

Your stream helps us organise subject options. It does not decide whether a
programme is suitable; the published programme requirements are checked next.
```

The current code displays stream for JAMB candidates. The student may not have
a current school stream, so the label should allow the best-fit subject group
without implying that a tutorial centre assigned the stream.

## Choose the starting door

### Screen 4: what does the candidate know already?

```text
What do you know already?

[ I know the programme and university ]
Check one programme at the university you have in mind.

[ I know the programme, but not the university ]
See universities that offer it and compare their requirements.

[ I want help finding a programme ]
Use your O-level and UTME subjects to find programmes to explore.
```

The labels map directly to `know_where`, `know_what` and `unsure` in
`src/types/onboarding.ts`. The wording must not suggest that “unsure” means
the candidate has failed or that the known routes are guaranteed.

## Route A: programme and university already known

### Screen 5A: select the intended choice

```text
Your intended choice

Programme
[ Search a programme                              ]

Business Administration
Offered by 4 universities
What you may study: organisations, planning, people, resources and decisions

University
[ Search the university                          ]

North Coast University
University Road, Akure, Ondo State
Business Administration · B.Sc. · 4 years

[ See requirements ]
```

The candidate sees requirements first. Subject entry is optional on this
known-choice route:

```text
[ Check my subjects too - optional ]
```

If selected, show two clearly labelled groups rather than one mixed list:

```text
O-level subjects
Choose at least 5 to check the published O-level requirement.

UTME subjects
Use of English is fixed. Choose 3 other subjects for the JAMB check.
```

The candidate must never be made to guess whether “English” belongs to the
O-level list, the UTME list or both.

### Screen 6A: programme overview for the selected university

```text
BUSINESS ADMINISTRATION
North Coast University
University Road, Akure, Ondo State

B.Sc. · 4 years

What this programme teaches
Business Administration looks at how organisations plan work, manage people and
resources, make decisions and improve the way they operate.

What you may study
  Planning and organising work
  Understanding how organisations operate
  Working with money, information and resources
  Making and explaining decisions
  Communicating and working with people

Requirements for North Coast University

UTME subjects
[published UTME requirement text]

O-level credits
[published O-level requirement text]

Check the university's current admission notice before applying.

[ Continue to field guidance ]
[ Change university ]
```

The programme overview is not a generic placeholder. It uses the current
programme skills and curriculum components translated for a candidate. It does
not show CCMAS discipline names, raw skill arrays, a fake department, Direct
Entry, an aggregate prediction or demand data.

Direct Entry should not appear in the ordinary JAMB/UTME candidate flow. If a
future polytechnic or explicit Direct Entry account route is added, it should
be a separate, deliberate context with its own requirements. It must not be
silently appended to this screen.

## Route B: programme known, university unknown

### Screen 5B: programme search and early university signal

```text
Find where to study your programme

Business Administration
4 universities found

Choose a university to see the name it uses, its address and its requirements.
```

The count is shown only when it comes from actual offering records. This screen
does not need to display every O-level subject or the full brochure for four
universities. Its job is to help the candidate choose which university details
to open.

### Screen 6B: compare university options

```text
Universities offering Business Administration

North Coast University
University Road, Akure, Ondo State
Business Administration · B.Sc. · 4 years
Published requirement check available
[ View details ]

Lakeside State University
Campus Road, Ilorin, Kwara State
Business Administration · B.Sc. · 4 years
Requirement wording is not available yet
[ View details ]

[ Keep comparing programmes ]
```

Selecting a university attaches it to the programme. It does not send the
candidate to a generic Home page and it does not clear their JAMB preparation
mode or subject draft.

## Route C: candidate wants help finding a programme

### Screen 5C: O-level subject check

```text
Your O-level subjects

Selected
  English Language
  Mathematics

Choose the subjects you are taking or expect to use

  Economics                  [ + ]
  Government                 [ + ]
  Accounting                 [ + ]
  Commerce                   [ + ]
  Literature in English      [ + ]

Choose at least 5 O-level subjects before we check programme fit.
```

### Screen 6C: UTME subject check

```text
Your UTME subjects

Selected
  Use of English

Choose 3 other UTME subjects

  Mathematics                [ + ]
  Economics                  [ + ]
  Government                 [ + ]
  Accounting                 [ + ]

Choose Use of English and 3 other subjects before we match programmes.
```

The current subject matcher uses four UTME subjects in total and at least five
O-level subjects. Until both conditions are met:

```text
[ Match programmes - disabled ]

Add the required subjects to check both the UTME combination and the O-level
requirement.
```

This is the blocked subject-search behaviour: partial subjects may be saved in
the draft, but they cannot produce a programme result that looks complete.
The student should be able to go back, add subjects, and continue without
losing the entries already made.

### Screen 7C: combined subject results

```text
Programmes to explore from your subjects

These are possible starting points from the subjects you entered. They are not
an admission result. Open a programme to compare university requirements.

BUSINESS ADMINISTRATION
4 universities found
UTME subjects match the published check. Review the O-level requirement for the
university you choose.
[ View programme and universities ]
[ Save programme ]

ACCOUNTING
3 universities found
Your current subject choices give you a programme to explore. Check the full
requirements before deciding.
[ View programme and universities ]
[ Save programme ]

[ Save subject plan ]
```

If there is an O-level gap:

```text
UTME subjects match this programme, but your O-level subjects still have a gap:
Mathematics.
```

If the programme does not match the selected UTME subjects:

```text
This programme does not match the UTME subjects you selected. Choose another
programme or change your subjects.
```

If the data cannot be verified:

```text
We could not verify this programme against your subjects yet. Try again before
choosing a university.
```

The result list must not use a raw subject-match count as its headline, and it
must not imply that a match guarantees admission.

## Programme-to-career guidance

After a programme and university are selected, the candidate moves seamlessly
into the saved guidance path. There is no redundant “Employment” screen and no
generic “Career connections” detour that repeats the domain cards.

```text
BUSINESS ADMINISTRATION · NORTH COAST UNIVERSITY

Your programme connects most closely to General Management because it includes
planning, organisation, people, resources and decision-making.

DIRECT CONNECTION
General Management
The programme teaches many of the ideas this field is built around.

FUNCTIONAL CONNECTION
Economics
Some ideas transfer, but Economics has a deeper focus on markets, policy and
economic analysis.

ADJACENT CONNECTION
Marketing, Brand
The programme shares planning, coordination and decision-making with this
field, but Marketing has a different specialist focus.

[ Explore General Management ]
```

The mapping explanations are derived from the current programme-to-domain
mapping, the domain definition and the programme curriculum scope. They are
not generic copy pasted onto every programme.

The relationship labels are explained once in plain language:

- Direct means the programme teaches many central ideas of the field.
- Functional means some abilities transfer, but deeper field-specific learning
  is needed.
- Adjacent means the field is related through shared abilities, but is farther
  from the main programme focus.

### Domain, subgroup and role sequence

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

[ Explore a field resource ]
```

Selecting `Business Analysts & Consultants` opens the subgroup, not a separate
flat role catalogue:

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

The role remains under the subgroup:

```text
BUSINESS ANALYST

What this work involves
Helping an organisation understand a problem and decide what could change.

Things to build over time
  Curiosity
  Clear communication
  Careful thinking
  Problem-solving

[ Understand this role ]  [ Save this role ]
```

The card describes a possible direction; it does not say the candidate is
qualified, skilled or ready for employment.

## Resources and saved guidance

Resources are embedded beside the domain, subgroup, role, skill, competency,
tool or certification they explain:

```text
Why this link is here
It helps you understand how planning and budgets are used in organisations.

[ Open learning link ]  [ Save resource ]
```

The action label must describe the actual link. Use `Open resource`, `Open skill
reference`, `Open tool guide` or `Open qualification information` as
appropriate. Do not show “Try a beginner activity” unless an actual interactive
activity exists behind the link.

The current repository contains resource migration/seed files, but SQL in the
repository is not the same as a deployed row in the active database. If the
resource table or parent mapping is missing, the card says:

```text
No trusted learning link is available yet.
```

Saved resources are placed in My World under `Saved learning` in a meaningful
order:

```text
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

There is no mandatory detached career-resources screen in the JAMB flow. My
World is the saved, structured place for links the candidate deliberately
keeps.

## JAMB report, download, print and share

The candidate gets a compiled output from the saved path, not a page full of
internal status labels.

```text
BUSINESS ADMINISTRATION
JAMB programme preparation summary

Candidate: Samuel Chinedu
Preparation: Self-taught
Stream: Commercial

Selected university
North Coast University
University Road, Akure, Ondo State

Programme
Business Administration · B.Sc. · 4 years

Subject plan
O-level: English Language, Mathematics, Economics, Government, Accounting
UTME: English Language, Mathematics, Economics, Government

Requirements to review
UTME subjects: [published requirement text]
O-level credits: [published requirement text]

What the programme teaches
[student-facing programme overview]

Guidance path
General Management
  Business Analysts & Consultants
    Business Analyst

Other connected fields
Economics · functional
Marketing, Brand · adjacent

This is planning guidance, not an admission guarantee. Check the university's
current notice before applying.

[ Download ] [ Print ] [ Share ]
```

For a tutorial-centre candidate, the preparation block also shows the selected
centre and address. The report must not imply that the tutorial centre is the
university or that attending it guarantees an outcome.

The share action should use the existing browser/device share handoff where
available. Email, WhatsApp, Drive and Dropbox can be offered when the platform
or connector supports them, but a destination is reported as successful only
after its handoff succeeds.

## What must not appear in the JAMB candidate flow

- National aggregate or a national “readiness” score.
- Demand, competitiveness, popularity, employment forecasts or admission
  probability.
- A generic fallback cut-off when the relevant data is unavailable.
- Post-UTME data or formulas, consistent with the current admission brief.
- Direct Entry in an ordinary UTME candidate flow.
- CCMAS discipline names or internal mapping labels.
- A department field when the JAMB programme name is the useful programme
  identity.
- A separate Employment screen duplicating domain, subgroup and role guidance.
- A claim that subject matching guarantees eligibility or admission.
- A resource link that is not present in the live validated resource record.

## Data and implementation boundary

This mockup follows the current code paths:

- `src/screens/onboarding/AccountTypeGate.tsx` for the separate JAMB persona;
- `src/components/onboarding/JambSetupForm.tsx` for preparation mode, the
  three discovery doors, stream, O-level and UTME subjects;
- `src/types/onboarding.ts` for `userType="jamb"`, `jambSubjects`,
  `olevelSubjects` and `jambPrepMode`;
- `src/screens/OnboardingFlow.tsx` for routing, persistence and the requirement
  that admission paths resolve a programme and university;
- `src/screens/careerIntelligence/AdmissionBrowseScreen.tsx` for programme,
  university and combined subject matching;
- the current programme, domain, subgroup, role and resource registries for
  the guidance path.

SQL files such as `backend/seed_subject_catalog.sql`, the career seeds, the
JAMB-domain refresh and resource migrations are candidate sources. They do not
make data displayable until the relevant migration and seed are applied and the
API returns a real record. The UI must distinguish unavailable, fallback and
real data states. Demand seed files are intentionally excluded from this
student-facing flow.
