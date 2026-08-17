# SS1 student experience: complete text mockup

This is the user-facing flow for an SS1 student from account selection through
programme exploration, guidance, saving and printing.

The sample people, schools and universities are fictional. The programme,
domain, subgroup, role, skills and resource labels are drawn from the current
repository records. Production screens must resolve live records and must not
hardcode this example.

## Product rules for SS1

- SS1 has two real starting choices: `Help me choose subjects` and `I already have a programme in mind`.
- SS1 does not use the SS3 `know where / know what / unsure` doors.
- The student selects class, school and stream before guidance is shown.
- School search starts as soon as the student has entered a useful query and shows the school address.
- Subject matching becomes available after at least five O-level subjects. English Language and Mathematics are included first by the current form.
- Programme-name search and subject matching are separate experiences.
- A programme result shows enough information to choose a university. Full requirements appear after a university is selected.
- The programme-first route continues directly into guidance; it does not send the student to Home or general Explore after programme selection.
- A selected-university overview shows only that university's requirements. `Change university` returns to the picker without clearing the plan.
- Students can save and compare more than one programme. They are not forced to choose one during onboarding.
- The student-facing experience never shows curriculum classification labels, raw mapping fields or department wording that is not useful to the student.
- SS1 does not see Direct Entry requirements. Those belong to routes where they are relevant, such as polytechnic applicants.
- Domain, subgroup and role explanations describe possible exploration. They do not claim that the student already has a skill or is ready for a job.
- Learning links appear beside the thing they explain and can also be saved to a separate `Saved learning` library in My World.

## Sample context

```text
Student: Amaka Yusuf
Account type: SS1 student
School: Asterfield College
School address: 14 Unity Crescent, Tanke, Ilorin, Kwara State
Class: SS1
Stream: Commercial
Selected subjects: English Language, Mathematics, Economics, Government, Accounting
```

The school address is shown whenever the student searches, selects or prints a
school. It reduces confusion between schools with similar names.

## Route A: Help me choose subjects

### Screen 1: choose a starting point

```text
What would you like help with first?

[ Help me choose subjects for future programmes ]

[ I already have a programme in mind ]
```

This is the actual SS1 branch in
`src/components/onboarding/SeniorSecondaryExploreSetupForm.tsx`.

### Screen 2: choose your class and school

```text
Your SS1 plan

Class
[ SS1 v ]

School
[ Search your school                              ]

Search results
  Asterfield College
  14 Unity Crescent, Tanke, Ilorin, Kwara State
  Secondary school

[ Select Asterfield College ]
```

School results appear while the student is typing. The selected school is
stored in the onboarding draft and remains when the student goes back.

### Screen 3: choose your stream

```text
Which stream are you in?

[ Science ]  [ Art ]  [ Commercial - selected ]

Your stream helps us show relevant WAEC subjects first.
```

Changing the stream may reset the subject choices because the subject context
has changed. The student is warned before anything is cleared.

### Screen 4: choose subjects

```text
Choose the subjects you are currently taking

Selected
  English Language
  Mathematics

Add subjects
[ Search subjects                                   ]

  Economics             [ + ]
  Government            [ + ]
  Accounting             [ + ]
  Commerce               [ + ]
  Literature in English  [ + ]

Choose 3 more subjects to see programme suggestions.

[ See possible programmes - disabled ]
```

The student can search and select subjects before the action becomes available.
The button is disabled until five O-level subjects exist. The subject search is
not a programme search filter.

### Screen 5: subject plan ready

```text
Your subject plan

English Language   Mathematics   Economics   Government   Accounting

These subjects help us find programmes to explore. Open a programme to compare
its requirements and the universities that offer it.

[ See possible programmes ]
```

The wording is intentionally simple. It does not say that the student qualifies
or that a subject choice guarantees admission.

### Screen 6: programme suggestions with university counts

```text
Programmes you can explore from these subjects

These are starting points from your current subject choices. Choose a programme
to see where it is offered and what each university asks for.

BUSINESS ADMINISTRATION
4 universities found
Your subjects line up with the available programme check.
[ View programme and universities ]
[ Save programme ]

ACCOUNTING
3 universities found
This is another programme you can explore from your current subjects.
[ View programme and universities ]
[ Save programme ]

MARKETING
2 universities found
This is another programme you can explore from your current subjects.
[ View programme and universities ]
[ Save programme ]

[ Save subject plan ]
```

The programme list is one list. Universities are not hidden until the end: the
count is visible on each result, and selecting a result opens the university
picker. The student may save several programmes and continue comparing.

If a programme has no trusted university record, say:

```text
University information is not available yet.
You can still read what this programme teaches.
```

Do not invent a university count or a requirements result.

### Screen 7: choose a university

```text
Business Administration
Choose a university to view its exact details

Rivergate University
Main campus, Minna, Niger State
Business Administration · B.Sc. · 4 years
Subject check: your current subjects line up with the published check
[ Choose this university ]

Northbridge State University
GRA Campus, Ilorin, Kwara State
Business Administration · B.Sc. · 4 years
Subject check: compare this university's requirements
[ Choose this university ]

[ Keep comparing programmes ]
```

This is the right point to show university names and addresses. The student has
enough information to make an informed choice without reading every brochure
requirement for every institution.

The compact subject signal can be one of:

- `Your current subjects line up with the published check`
- `Compare this university's requirements`
- `Requirements are not available yet`

The system must only use the first message when the selected subjects were
actually compared with that university's record.

### Screen 8: programme overview for one selected university

```text
BUSINESS ADMINISTRATION
Rivergate University
Main campus, Minna, Niger State

B.Sc. · 4 years

WHAT YOU WILL LEARN

Business Administration looks at how organisations are run and improved.

You may learn about:
  How people work together in an organisation
  How money, customers and day-to-day work are managed
  How numbers and information help people make decisions
  How technology supports business work
  How ideas become projects, services or businesses

WHAT YOU MAY PRACTISE

Planning, organising, explaining ideas, working with people, using information,
solving problems and making decisions.

REQUIREMENTS FOR RIVERGATE UNIVERSITY

UTME subjects
  The subjects listed for this university's Business Administration entry

O-level subjects
  The passes listed for this university's Business Administration entry

Source
  JAMB brochure or institution record, where available

[ Change university ]  [ Save programme ]  [ Add to comparison ]
```

The full O-level and UTME details appear here, after the student chooses a
university. The page must not combine requirements from several universities.
There is no Direct Entry section in the SS1 experience.

If the student selected only one university, this page shows only that
university. It does not show every school offering the programme. `Change
university` returns to Screen 7 and preserves the subject plan and saved
programmes.

### Programme screen structure

The programme screen should use these sections:

1. **Overview** — programme name, qualification, duration, what the programme teaches and programme skills.
2. **Requirements** — O-level and UTME requirements for the selected university.
3. **Schools** — used as the university picker or `Change university` surface, not mixed into a selected school's requirements page.
4. **Career connections** — the domain → subgroup → role path connected to the programme. A separate `Employment` label is unnecessary because it duplicates this information.
5. **Entrepreneurship** — an optional contextual action for building from the programme.
6. **University admission details** — folded into Requirements and Schools. Do not create an empty `Admission` tab for SS1.

The overview must use the programme's stored curriculum components and skills,
translated into student language. A generic paragraph alone is not enough.

## Route A continued: fields, areas and roles

### Screen 9: how the programme connects to fields

```text
Where could this programme take you?

Business Administration connects most closely to General Management because it
studies how organisations, people, money and work are planned and coordinated.

DIRECT CONNECTION
Closest match from what the programme teaches

GENERAL MANAGEMENT
General Management is about running organisations and their departments.

Why this is connected
Business Administration spends a lot of time on planning, budgets,
organisation, people and decisions. Those are central ideas in Management.

[ Explore General Management ]

Other connections

FUNCTIONAL CONNECTION
Some useful ideas transfer, but the field has deeper specialist learning.

ECONOMICS
Business Administration includes numbers, decisions and business activity.
Those ideas can help you explore Economics, although Economics has deeper work
with markets, policy and analysis.
[ Explore Economics ]

ADJACENT CONNECTION
Related through shared abilities, but farther from the main programme focus.

MARKETING, BRAND
Business Administration includes planning, coordination and decision-making.
Those abilities can help you explore Marketing, although Marketing has a
different specialist focus.
[ Explore Marketing, Brand ]
```

The relationship labels mean:

- **Direct**: the programme teaches many of the field's central ideas.
- **Functional**: the programme teaches abilities that can be useful in the field, but more field-specific learning is needed.
- **Adjacent**: the programme shares some useful abilities with the field, but the connection is farther away.

These explanations are generated from the current programme-to-domain mapping,
domain definition and programme curriculum. They must not imply that the student
is skilled, qualified or job-ready.

### Screen 10: the field card

```text
GENERAL MANAGEMENT
How organisations and departments are planned and run

You may learn about
  Planning and organising
  Money and resources
  People and teamwork
  Making decisions

People in this field may use
  Planning and budgeting tools
  Business information tools

Learning links, when available
  [ Open field resource ]
  [ Open skill reference ]
  [ Open tool guide ]

Areas inside this field
  Department & Finance Managers
  Business Analysts & Consultants
  Chief Executives & Founders
```

The exact current domain record is `General Management`, not “Management”.
“Management” may be used in a sentence when it helps the student, but the
official mapped domain label is resolved from the live record.

### Screen 11: subgroup card

```text
BUSINESS ANALYSTS & CONSULTANTS
A part of General Management

This area looks at problems, information, business processes and ways an
organisation could improve.

You may enjoy exploring
  Asking useful questions
  Understanding information
  Looking at how work is done
  Explaining what could improve

People in this area may use
  Business information tools
  Process-mapping tools

[ Explore this area ]
```

The other current General Management subgroups are shown as separate cards:

```text
DEPARTMENT & FINANCE MANAGERS
Running departments, budgets, finance and facilities.
[ Explore this area ]

CHIEF EXECUTIVES & FOUNDERS
Leading organisations, making big decisions and building ventures.
[ Explore this area ]
```

Roles belong under these subgroup cards. They should not appear as a separate
flat list when a subgroup is available.

### Screen 12: role card

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

Tools you may meet later
  Only tools with a real supporting link are shown here.

[ Understand this role ]  [ Save this role ]
```

The role card is a discovery card, not a job-readiness assessment.

## Learning links and saved learning

Resources should not be a mandatory detached screen in the SS1 journey. They
belong beside the domain, subgroup, role, skill, competency, tool or later
qualification they explain.

### Inline links

```text
GENERAL MANAGEMENT

Why this link is here
It helps you understand how planning and budgets are used in organisations.

[ Read about planning ]  [ Learn about budgets ]

BUSINESS ANALYSTS & CONSULTANTS

Why this link is here
It gives you a beginner explanation of how people study problems and improve
the way work is done.

[ Open resource ]  [ Save resource ]

BUSINESS ANALYST

Why this link is here
It helps you understand the kind of questions and information this role uses.

[ Open role reference ]  [ Save resource ]
```

Each card shows only the first two or three relevant links. The link must open a
real HTTPS resource from the resource record. The interface should use labels
that describe what the link actually opens:

- `Open resource`
- `Open skill reference`
- `Open learning link`
- `Open tool guide`
- `Open qualification information`

There is currently no guaranteed activity engine or project runner behind these
cards. Therefore the product must not promise `Try a beginner activity`,
`Explore a useful skill` or similar actions unless the URL is specifically an
interactive activity. It must not show raw fields such as `foundationSkills`, `essentialSkills`,
`roleBridgeSkills`, `appearsIn` or `gatewayCertifications`.

### Saved learning library in My World

```text
SAVED LEARNING

Organised from your saved guidance paths

START HERE
  Understand General Management
  Open field resource

BUILD FOUNDATIONS
  Open skill reference for planning
  Open learning link for business analysis

TOOLS AND REFERENCES
  Open tool guide, when a real tool link exists

EXPLORE THE AREA
  Business Analysts & Consultants resources

UNDERSTAND THE ROLE
  Business Analyst role reference

LATER
  Open qualification information, when a real link exists

[ Open link ]  [ Remove from saved learning ]
```

The order is based on the student's stage, the direct/functional/adjacent
relationship, and the selected domain-to-subgroup-to-role path. SS1 students see
beginner resources first. Certifications and professional bodies are labelled
as later exploration, not immediate requirements.

The resource model already supports domain, subgroup, role, skill, competency,
tool and certification links, with provider, region, access type, delivery,
URL and description. It still needs complete deployment and coverage auditing:

- apply `backend/migration_career_resources_v1.sql` to the active database;
- run the audited resource seed only after the parent domain, subgroup and role records exist;
- return resources nested under the correct parent IDs;
- render subgroup resources in `RoleClusterSection.tsx`, as domain and role resources are already rendered elsewhere;
- add ordering fields such as `learning_stage`, `priority` and `why_it_matters`;
- show `No trusted learning link yet` when a real link does not exist.

No resource should be hardcoded into the student screen or presented as
actionable without a verified link.

## Route A saved path

```text
Your guidance path is saved

SS1 · Commercial · Asterfield College

SUBJECTS
English Language · Mathematics · Economics · Government · Accounting

PROGRAMMES SAVED
Business Administration · Accounting · Marketing

UNIVERSITY SELECTED FOR THIS PATH
Rivergate University
Main campus, Minna, Niger State

FIELD TO EXPLORE
General Management

AREA TO EXPLORE
Business Analysts & Consultants

ROLE TO UNDERSTAND
Business Analyst

SAVED LEARNING LINKS
4

[ Open My World ]  [ View guidance summary ]
```

Saving a path does not force one programme. The student can add or remove
programmes and can choose which university is attached to each programme.

## Route B: I already have a programme in mind

The student still completes class, school and stream first. Then:

```text
What would you like help with first?

I already have a programme in mind

Programme you are considering
[ Bu                                             ]

Search results appear as soon as the query is useful enough to search.

Business Administration
Official programme name
[ Select programme ]
```

This search contains programme names only. It does not show an O-level subject
field. Subject checking is a later action on the selected programme page.

After selection:

```text
Business Administration

Continue your guidance

Next, choose a university so we can show its exact programme details and
requirements.

[ Continue guidance ]  [ Check my subjects ]
```

`Continue guidance` opens the university picker and then the selected-university
programme overview. `Check my subjects` is an optional preparation check; it
does not redirect the student into general Explore. The student may later add
another programme from an explicit `Add another programme` action, but that is
not the next step for this route.

## SS1 Home

```text
Good afternoon, Amaka

SS1 · Commercial · Asterfield College

YOUR NEXT STEP
Continue your Business Administration guidance.

[ Continue guidance ]

YOUR PLAN
Subjects selected       5
Programmes saved        3
University selected     Rivergate University
Saved learning          4
Reports                 1

QUICK ACTIONS
[ Review subjects ]     [ Open My World ]
[ View saved learning ]  [ Add another programme ]

EXPLORE
Start with General Management, then try one beginner resource.

[ View saved path ]
```

The SS1 home does not lead with learning gaps, labour-market statistics, adult
career-change language or admin terminology. Entrepreneurship may appear as a
contextual action after a relevant programme is saved:

```text
Want to see how people build from this field?
[ Explore entrepreneurship from Business Administration ]
```

Skills Match remains an independent discovery tool and is not part of this SS1
programme mockup.

## SS1 My World

```text
MY WORLD

Your saved school, subjects, programmes, guidance paths, learning links and reports.

MY PLAN
SS1 · Commercial · Asterfield College
[ Edit plan ]

MY SUBJECTS
English Language · Mathematics · Economics · Government · Accounting
[ Review subjects ]

SAVED PROGRAMMES
Business Administration
Accounting
Marketing
[ Compare programmes ]

SAVED PATHS
General Management
  Business Analysts & Consultants
  Business Analyst
[ Open guidance ]

SAVED LEARNING
4 links arranged from Start here to Later
[ View saved learning ]

MY REPORTS
SS1 Guidance Summary · Ready to print
[ Open report ]

MY NOTES
Questions to ask my teacher or counsellor
[ Add note ]
```

`Roster`, `cohort intelligence`, `skills gap` and institution-admin labels do
not belong in the SS1 version.

## Guidance summary and print preview

The output is a guidance summary, not an adult-style career report.

```text
SIFTER LEVELUP
SS1 GUIDANCE SUMMARY

Prepared for: Amaka Yusuf
Class: SS1 · Stream: Commercial
School: Asterfield College
School address: 14 Unity Crescent, Tanke, Ilorin, Kwara State

YOUR CURRENT PLAN
You are exploring how your subjects connect to programmes and fields.

SUBJECTS
English Language · Mathematics · Economics · Government · Accounting

PROGRAMMES YOU SAVED
1. Business Administration
   University: Rivergate University
   Address: Main campus, Minna, Niger State
2. Accounting
3. Marketing

WHAT BUSINESS ADMINISTRATION TEACHES
How organisations are run, how people work together, how money and information
are used, and how decisions are made.

FIELD TO EXPLORE
General Management
Why: the programme closely studies planning, organisation, resources and decisions.

AREA TO EXPLORE
Business Analysts & Consultants
Why: this area looks at problems, information, processes and improvements.

ROLE TO UNDERSTAND
Business Analyst
Why: this role helps organisations understand problems and decide what could change.

SAVED LEARNING
4 links

WHAT TO DO NEXT
1. Keep reviewing your subjects with your school.
2. Compare the requirements for the university you are considering.
3. Try one beginner learning link from Saved learning.
4. Return to this plan when your interests change.

Student access code: ASTERFIELD-SS1-0042
[ QR code linking back to the saved guidance path ]

[ Print ]  [ Download PDF ]  [ Share ]
```

The summary must show `Ready to print` only after the guidance path has actually
been saved. It must never show `Under review` when no submission exists.
Print opens the device/browser print flow. Download creates the PDF. Share uses
the existing share surface for email, WhatsApp, Drive, Dropbox and other
installed destinations.

## Final behavior decisions

1. The SS1 onboarding branches are subject-first and programme-first.
2. School search results show the address before selection.
3. Stream is selected before subjects or programme guidance.
4. Subject matching requires five O-level subjects.
5. Programme results show university counts and addresses before full requirements.
6. Full requirements are institution-specific and appear after university selection.
7. One selected university produces one institution-specific overview.
8. Students can save and compare multiple programmes.
9. No curriculum classification or department label surfaces to the student.
10. Direct Entry is excluded from the SS1 view.
11. Programme overview uses real programme skills and curriculum components in plain language.
12. Domains, subgroups and roles are shown as domain → subgroup → role.
13. Business Administration maps directly to the current General Management domain, which has the three current subgroups shown above.
14. Direct, functional and adjacent explain relationship distance, not student ability.
15. Resource links appear in context and can also be saved into an ordered Saved learning library.
16. Missing resource links display an accurate missing state rather than hardcoded content.
17. My World stores the subject plan, multiple programmes, selected universities, saved paths, resources and reports.
18. Refreshing or navigating back preserves the saved state and onboarding draft.

## Repository evidence used

- `src/components/onboarding/SeniorSecondaryExploreSetupForm.tsx`
- `src/components/onboarding/LiveSubjectMultiSelect.tsx`
- `src/screens/careerIntelligence/AdmissionBrowseScreen.tsx`
- `src/screens/careerIntelligence/ProgrammeOverviewScreen.tsx`
- `src/screens/careerIntelligence/DomainDetailScreen.tsx`
- `src/components/careerIntelligence/RoleClusterSection.tsx`
- `src/screens/careerIntelligence/RoleDetailScreen.tsx`
- `src/components/careerIntelligence/LearningResourcesBlock.tsx`
- `src/screens/MyWorldScreen.tsx`
- `src/types/career.ts`
- `backend/seed_career_pilot.sql`
- `backend/refresh_jamb_programme_domain_2026-08-17.sql`
- `backend/migration_career_resources_v1.sql`
- `backend/seed_career_resources_v1.manifest.json`
- `backend/seed_career_resources_v1_parts/` (execute parts in numeric order)
