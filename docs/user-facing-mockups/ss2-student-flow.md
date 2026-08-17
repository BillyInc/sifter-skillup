# SS2 student experience: JAMB preparation without becoming SS3

This is the SS2 version of the student-facing flow. SS2 is closer to JAMB than
SS1, so the product should begin preparing the student to read university-
specific UTME requirements. It must still feel like exploration and planning,
not an application or admission decision.

## Audit finding: current code versus intended SS2 behavior

The repository currently treats SS1 and SS2 as the same experience:

- both use `SeniorSecondaryExploreSetupForm.tsx`;
- both use the same two intents;
- both collect O-level subjects only;
- both route to the same Admission Browse subject/programme modes;
- `OnboardingFlow.tsx` does not currently branch its destination by SS1 versus SS2.

The existing product notes establish the intended distinction: SS1 and SS2 use
O-level subjects for early guidance, while SS2 should see future UTME
requirements as preparation. SS2 should not be required to enter UTME subjects
before receiving guidance and should not use the SS3/JAMB three-door flow.

This mockup defines that missing SS2 refinement.

## What is different from SS1?

| Area | SS1 | SS2 |
|---|---|---|
| Main purpose | Discover subjects, programmes and fields | Narrow choices and prepare for JAMB requirements |
| Starting choices | Choose subjects or programme in mind | Same two choices, with more focused preparation language |
| Required subject input | Five O-level subjects | Five O-level subjects |
| UTME subjects | Seen only when a programme requires them | Shown earlier as a future preparation preview |
| UTME subject entry | Not required | Optional only after a programme/university is selected |
| Programme details | Overview and requirements | Overview, requirements and a clear “prepare for JAMB later” section |
| Career guidance | Explore broadly | Continue from the selected programme into domain -> subgroup -> role |
| Admission status | Requirements guidance | Requirements preparation; not an application or admission result |
| Demand data | Not shown | Not shown |

## Sample SS2 context

```text
Student: Daniel Okafor
Account type: SS2 student
School: Asterfield College
School address: 14 Unity Crescent, Tanke, Ilorin, Kwara State
Class: SS2
Stream: Commercial
Subjects: English Language, Mathematics, Economics, Government, Accounting
Programme being considered: Business Administration
University being considered: Rivergate University
```

The school, programme, university, domain and resource names are sample
presentation data. Live screens must resolve them from validated records.

## SS2 onboarding flow

### Screen 1: choose a starting point

```text
What would you like help with first?

[ Help me choose subjects and programmes ]

[ I already have a programme in mind ]
```

The student is not asked whether they are “unsure”. SS2 still uses the same
student-led two-route model as SS1.

### Screen 2: class and school

```text
Your SS2 plan

Class
SS2

School
[ Search your school                              ]

Search results
  Asterfield College
  14 Unity Crescent, Tanke, Ilorin, Kwara State
  Secondary school

[ Select Asterfield College ]
```

SS2 is locked as the selected class. The school address appears before
selection, and the choice is retained when the student goes back.

### Screen 3: stream

```text
Which stream are you in?

[ Science ]  [ Art ]  [ Commercial - selected ]

Your stream helps us organise your subject choices. We will still show the
university's exact requirements for every programme you open.
```

Changing the stream warns before clearing dependent subjects or programme
context.

### Screen 4: SS2 subject plan

```text
Build your current subject plan

Selected
  English Language
  Mathematics

Add subjects
[ Search subjects                                   ]

  Economics             [ + ]
  Government            [ + ]
  Accounting             [ + ]
  Commerce               [ + ]

Choose 3 more subjects to continue.

[ See programmes to explore - disabled ]
```

The minimum remains five O-level subjects. The student is not asked for UTME
subjects at this point.

### Screen 5: SS2 subject plan ready

```text
Your current subject plan

English Language · Mathematics · Economics · Government · Accounting

These subjects help us find programmes to explore. When you open a programme,
we will also show the UTME subjects you may need to prepare for later.

[ See programmes to explore ]
```

This is the main SS2 difference from SS1: the student is told that UTME
requirements will appear at the right moment, without being forced to choose
UTME subjects prematurely.

## SS2 programme results

```text
Programmes to explore from your subjects

These are possible directions from your current subjects. Choose one to see
the universities offering it and the requirements to prepare for.

BUSINESS ADMINISTRATION
4 universities found
Your subjects line up with the available programme check.
JAMB subjects preview available after university selection.
[ View programme and universities ]
[ Save programme ]

ACCOUNTING
3 universities found
This is another programme you can explore from your current subjects.
JAMB subjects preview available after university selection.
[ View programme and universities ]
[ Save programme ]

[ Save subject plan ]
```

The result card does not show cut-off marks, demand, job forecasts or an
admission prediction. It only indicates whether the programme and university
records are available for the next check.

## SS2 university picker

```text
Business Administration
Choose a university to see its exact details

Rivergate University
Main campus, Minna, Niger State
Business Administration · B.Sc. · 4 years
O-level check: compare the published requirements
JAMB subjects: available to review after selection
[ Choose this university ]

Northbridge State University
GRA Campus, Ilorin, Kwara State
Business Administration · B.Sc. · 4 years
O-level check: your current subjects line up with the available check
JAMB subjects: available to review after selection
[ Choose this university ]

[ Keep exploring programmes ]
```

The address and institution-specific programme name are shown before selection.
Full O-level and UTME details are not mixed into the result list.

## SS2 programme overview

```text
BUSINESS ADMINISTRATION
Rivergate University
Main campus, Minna, Niger State

B.Sc. · 4 years

WHAT THIS PROGRAMME IS ABOUT

Business Administration looks at how organisations are run, how people work
together, how money and information are used, and how decisions are made.

WHAT YOU MAY LEARN
  How organisations plan and organise work
  How people, customers, money and resources are managed
  How numbers and information support decisions
  How technology supports business work
  How ideas become projects, services or businesses

YOUR CURRENT O-LEVEL CHECK
Your selected subjects: English Language, Mathematics, Economics, Government,
Accounting

JAMB SUBJECTS TO PREPARE FOR LATER
The subjects listed for Business Administration at Rivergate University are
shown here so you can understand what may be expected when you sit for JAMB.

This is preparation information. It is not an admission result.

[ View full O-level requirements ]
[ View UTME subjects ]
[ Optional: check my UTME subjects ]

[ Continue to field guidance ]
```

The full O-level and UTME requirements belong to this selected university's
overview. SS2 does not see Direct Entry requirements.

`Optional: check my UTME subjects` may open a UTME picker only after the student
chooses to use it. It must not be required to enter SS2 guidance. If the student
uses it, the result should say `Compare with this university's UTME subjects`,
not `You qualify`.

## SS2 career guidance handoff

The programme overview gives a short preview only:

```text
WHERE THIS PROGRAMME CAN LEAD YOU TO EXPLORE

Closest connection
General Management
Business Administration covers planning, organisation, people, resources and
decisions, so this is the first field to explore.

Other connections
Economics · functional connection
Marketing, Brand · adjacent connection

[ Continue to field guidance ]
```

The click opens the full guidance hierarchy with the programme and university
context preserved:

```text
Business Administration · Rivergate University

GENERAL MANAGEMENT
How organisations and departments are planned and run

[ Explore this field ]

BUSINESS ANALYSTS & CONSULTANTS
A part of General Management that looks at problems, information and ways work
could improve.

[ Explore this area ]

BUSINESS ANALYST
Helps an organisation understand a problem and decide what could change.

[ Understand this role ]
```

There is no separate Employment tab. The domain -> subgroup -> role guidance is
the career connection experience.

## SS2 resources

Resources are still links, not activities. Use only actions supported by an
actual URL:

```text
BUSINESS ANALYSTS & CONSULTANTS

Why this link is here
It helps you understand business problems, information and improvement.

[ Open resource ]  [ Save resource ]

BUSINESS ANALYST

Why this link is here
It explains the kind of work and skills connected to this role.

[ Open role reference ]  [ Save resource ]
```

Do not promise a project, activity, skill explorer or tool simulator unless the
linked record actually opens one. Saved links appear in My World under:

```text
SAVED LEARNING

START HERE
  Open field resource

BUILD FOUNDATIONS
  Open skill reference

UNDERSTAND THE ROLE
  Open role reference

LATER
  Open qualification information, when a real link exists
```

SS2 may see more preparation links than SS1, but it does not receive demand
data, employment forecasts, readiness scores or market rankings.

## SS2 save behavior

```text
Saved to My World

Your SS2 subjects, programme, university, JAMB preparation notes, field guidance
and saved links are available in My World.

[ Continue guidance ]  [ Open My World ]
```

There is no separate saved-path screen. My World is the structured return point.

## SS2 Home

```text
Good afternoon, Daniel

SS2 · Commercial · Asterfield College

YOUR NEXT STEP
Continue your Business Administration guidance.

[ Continue guidance ]

YOUR PLAN
O-level subjects selected       5
Programmes saved                2
University selected             Rivergate University
UTME combinations reviewed      1
Saved learning                  3
Reports                         1

PREPARE FOR JAMB LATER
Review the UTME subjects for your selected university when you are ready.

[ View UTME subjects ]

QUICK ACTIONS
[ Review subjects ]  [ Open My World ]  [ Add another programme ]
```

The Home action continues the current guidance path. It does not send the
student into general Explore after they have already selected a programme.

## SS2 My World

```text
MY WORLD

SS2 · Commercial · Asterfield College

MY CURRENT PLAN
English Language · Mathematics · Economics · Government · Accounting
[ Edit plan ]

PROGRAMMES SAVED
Business Administration
Accounting
[ Open guidance ]

UNIVERSITIES SELECTED
Business Administration · Rivergate University
[ View university details ]

JAMB PREPARATION
Business Administration at Rivergate University
  UTME subjects to review
  O-level requirements to review
[ Open preparation ]

SAVED LEARNING
3 links arranged from Start here to Later
[ View saved learning ]

MY REPORTS
SS2 Guidance & JAMB Preparation Summary · Ready to print
[ Open report ]
```

## SS2 report preview

```text
SIFTER LEVELUP
SS2 GUIDANCE & JAMB PREPARATION SUMMARY

Prepared for: Daniel Okafor
Class: SS2 · Stream: Commercial
School: Asterfield College
School address: 14 Unity Crescent, Tanke, Ilorin, Kwara State

YOUR CURRENT SUBJECT PLAN
English Language · Mathematics · Economics · Government · Accounting

PROGRAMME EXPLORED
Business Administration

UNIVERSITY SELECTED
Rivergate University
Main campus, Minna, Niger State

WHAT THIS PROGRAMME IS ABOUT
How organisations are run, how people work together, and how information,
resources and decisions are handled.

JAMB SUBJECTS TO PREPARE FOR LATER
The UTME subjects listed for this university's programme record.

FIELD GUIDANCE
General Management
Business Analysts & Consultants
Business Analyst

SAVED LEARNING
3 links

NEXT STEPS
1. Keep reviewing your O-level subjects with your school.
2. Read the selected university's O-level and UTME requirements.
3. Review the UTME subjects before you begin JAMB registration preparation.
4. Return to this plan when your programme or university choice changes.

Student access code: ASTERFIELD-SS2-0042
[ QR code linking back to the saved guidance path ]

[ Print ]  [ Download PDF ]  [ Share ]
```

The report must not include demand data, market rankings, job forecasts,
readiness claims, cut-off claims or a fake admission status. It is a preparation
summary, not an application result.

## Data and SQL boundary

This SS2 flow must be audited against both active database records and SQL files
present in the repository that have not yet been seeded. Those are different
states:

- SQL presence means a candidate record exists in the repository.
- Active availability means the migration/seed has been applied and the API can return it.
- Student display requires a validated active record.

The audit should cover:

- O-level and UTME subject catalogues;
- university-specific programme names and requirements;
- programme skills and curriculum components;
- programme-to-domain mappings;
- domain, subgroup and role records;
- skill, tool, competency, certification and resource links.

Demand and market data are explicitly out of scope for SS2. Do not query or
render demand tables, forecasts, rankings, readiness scores or employment
signals in this flow.

## SS2 implementation decisions

1. SS2 remains a senior-secondary explorer, not an SS3/JAMB candidate.
2. SS2 uses the same two starting intents as SS1.
3. SS2 requires five O-level subjects before subject-based programme matching.
4. SS2 sees UTME requirements earlier as preparation after programme/university selection.
5. UTME subject entry is optional and never an onboarding prerequisite.
6. Programme-first students continue directly into guidance, not Home or general Explore.
7. Requirements remain institution-specific and the selected university remains visible.
8. Domain -> subgroup -> role guidance follows the programme overview handoff.
9. Resources are real links with truthful actions and an optional Saved learning library.
10. No separate Employment or empty Admission tab is needed for SS2.
11. No Direct Entry section is shown to SS2.
12. No demand, labour-market or readiness data is shown.
13. Refresh, back navigation and saving preserve the SS2 context.

## Repository evidence used

- `src/components/onboarding/SeniorSecondaryExploreSetupForm.tsx`
- `src/components/onboarding/JambSetupForm.tsx`
- `src/screens/OnboardingFlow.tsx`
- `src/screens/onboarding/AccountTypeGate.tsx`
- `src/screens/careerIntelligence/AdmissionBrowseScreen.tsx`
- `src/screens/careerIntelligence/ProgrammeOverviewScreen.tsx`
- `src/types/onboarding.ts`
- `docs/ONBOARDING_DISCOVERY_UNBLOCK_PLAN.md`
- `docs/mockups/ADMISSION_PROGRAMME_OVERVIEW_BEHAVIOUR.md`
- `backend/seed_subject_catalog.sql`
- relevant seeded and unseeded SQL files under `backend/`
