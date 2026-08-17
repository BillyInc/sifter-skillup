# Secondary-school owner experience: school guidance workspace

This is the user-facing flow for a secondary-school owner or principal using
Sifter to manage the school workspace, create student accounts manually, guide
students and print/share completed guidance reports.

This is an educator/admin flow, not a student flow. The owner is working for a
school and may create school-managed student accounts. The owner does not
automatically receive every student's private progress, notes or saved paths.

The sample school, people and universities are fictional. Programme, domain,
subgroup, role, skill, competency, tool, certification and resource records
must be resolved from live repository-backed data. Counts and signals must be
rendered only when the API returns real data.

## Product boundary

The school owner has two jobs:

```text
School workspace
  -> organisation identity, team, verification and school code

Student guidance
  -> create student account shells
  -> give each student a claim code
  -> guide a student through programme and university choice
  -> select the relevant domain -> subgroup -> role path
  -> print/share the completed student report
```

These jobs must not be collapsed into one generic dashboard. The school owner
needs a clear path to create a student, but creating an account is not the same
as receiving consent to view that student's private activity.

## Sample context

```text
Owner: Mrs. Ngozi Eze
Role: Owner / Principal
Organisation: Starlight College
Organisation address: 24 Unity Road, GRA, Benin City, Edo State
Organisation type: Secondary school
Registry anchor: State MoE approval number, when available

Student created manually: Chiamaka Eze
Student type: SS2
Stream: Commercial
```

The school address is required during onboarding. It appears in the school
profile, affiliation/referral context and student-facing report where the school
is included.

## Account selection

### Screen 1: choose Educator / Institution

```text
Who are you using Sifter as?

[ SS1 Student ]
[ SS2 Student ]
[ SS3 Student ]
[ JAMB Candidate ]
[ Undergraduate Student ]

[ Educator / Institution ]
Guide students from a school, university or tutorial centre
```

Selecting Educator / Institution opens `EducatorOnboarding`. The owner does not
enter through the student onboarding form and must not be routed to the student
Home after completing the admin setup.

## Educator onboarding

### Screen 2: choose the organisation

```text
Your organisation

Choose the organisation where you guide students. We will tailor the workspace
to your institution and the students you support.

[ Secondary school - selected ]
Guide SS1 to SS3 students through subjects and programme choices

[ University ]
Guide students using your university's programmes and requirements

[ Tutorial centre / JAMB lesson provider ]
Support students preparing for JAMB and university applications
```

The secondary-school owner must select `Secondary school`. This choice controls
the admin audience, student types, navigation, privacy scope and available
provisioning modes.

### Screen 3: select or register the school record

```text
Secondary school

[ Search your school                              ]

Search results
  Starlight College
  24 Unity Road, GRA, Benin City, Edo State
  Secondary school

[ Select Starlight College ]
```

The organisation search should surface results as the owner types and show the
full address. If the school is not listed, the current educator form allows the
owner to add its name for non-university organisations:

```text
School not listed?
[ Add Starlight College ]

The school record will still need its full address and later verification.
```

The owner must then complete:

```text
School address (required)
[ Street, area, city, state                         ]

Use the full address so people can distinguish schools with similar names.
```

The Continue button stays disabled until there is a school record or permitted
local/development access, and the address has meaningful content. A development
access code never bypasses the compulsory address requirement.

### Screen 4: choose the owner's role

```text
Your role in the school

[ Owner / Principal - selected ]
Manage the school identity, team, school code and guidance workspace.

[ Counsellor ]
Guide students using the workflows assigned to your seat.
```

For a school owner, the selected role is `owner`, which maps to the
`institution_admin` account type. A counsellor is an `educator` account and
does not inherit owner controls.

### Screen 5: enter the admin access code

```text
Enter admin access code

Owners request an access code from the Sifter team. Staff and counsellors ask
their organisation owner to invite them or issue a code.

[ Enter the code you received                       ]

[ Unlock admin setup ]

[ Request an access code ]
```

The code is an admin access gate. It is not proof of school ownership and it is
not the same as:

- the school affiliation code shared with students;
- a student claim code created for one student;
- a State MoE approval number;
- an uploaded verification document.

In local/development mode the UI may expose the development test code. It must
never be presented as proof, and it must not appear in production.

### Screen 6: add verification context

```text
Verify your institution

Add your work details so the workspace can be connected to your school.
Verification may be completed later; you can still finish setting up the
guidance workspace now.

Institutional work email (optional)
[ principal@starlightcollege.edu.ng              ]

State MoE approval no. (optional)
[ Enter approval number                            ]

You do not need to upload a document now. We can request proof of affiliation
later if the school needs verification.

[ Continue ]
```

The State MoE approval number is the school-specific registry label in the
current form. It is optional at this step, but the physical school address is
not optional.

### Screen 7: confirm the workspace

```text
Confirm your details

Organisation       Secondary school
Name               Starlight College
Address            24 Unity Road, GRA, Benin City, Edo State
Role               Owner / Principal
Work email         principal@starlightcollege.edu.ng
Registry code      Not provided
Workspace access   Ready after code approval
Admin gate         Owner code accepted

[ Open my workspace ]
```

After success, the backend creates the admin workspace, completes onboarding,
saves the educator profile and routes the owner to the school Guidance
workspace. The owner should not land in the university programme dashboard.

## Verification states must be accurate

The owner should see a status card like this immediately after setup:

```text
Organisation status
Claimed

Your school workspace is connected to Starlight College. Verification proof has
not been submitted yet.

[ Upload proof document ]
```

The state meanings are:

```text
Unverified
No organisation claim has been completed.

Claimed
The organisation is claimed and the owner access gate is accepted. Proof has
not yet been submitted.

Under review
Proof was actually uploaded and submitted. A review is in progress.

Verified
The organisation proof was accepted and higher scoped capabilities are open.

Rejected / needs action
The submitted proof needs correction or was not accepted.
```

The owner must not see “Under review” simply because a school name, address,
work email or registry number exists. The verification screen already guards
this by requiring a proof-submission timestamp before showing the pending state.

For a secondary school, the proof guidance is:

```text
Secondary-school proof: State MoE approval, school registry anchor or an
official school document.

Accepted formats: PDF, JPG, PNG or WEBP; maximum 10 MB.
```

Verification proves the organisation. It does not by itself reveal individual
student data.

## Secondary-school owner workspace

### Screen 8: Guidance home

```text
Starlight College
Secondary school · Admin: owner

Who your students are, in aggregate

Student data stays private. Individual access requires the correct school
workflow and explicit consent where applicable.

[ Create student accounts ]
Provision students and print claim cards.

[ Skip to guidance ]
Open the programme and university catalogue without creating an account.
```

The school owner lands on `Guidance`, not the student Explore screen and not the
university dashboard. The home is a cohort/guidance workspace, not a personal
career profile.

### Aggregate cards

```text
Students
—

Unclaimed codes
—

Domains represented
—
```

If the API has not returned real counts, the UI should show an honest loading or
unavailable state. It must not display zeros as if they were confirmed data and
must not render a literal em dash as a child of a React Native `View`.

When real data exists:

```text
Students       18
               12 self-linked · 6 created by you

Unclaimed codes 3

Domains represented 5
```

These are aggregate indicators. They do not identify which student selected
which domain.

### Guidance signals

```text
Guidance signals (optional)

Verified curriculum or student-interest signals may appear here when source
data exists. They do not describe an individual student.

No verified signal is available yet.
```

The refined secondary-school-owner experience does not show demand, salary,
employment forecasts, peer rankings or a school-versus-school leaderboard.
Those are not needed for the school's first job: guiding a student.

### Guidance home actions

```text
Advising a student?
Programmes, universities, requirements and connected fields are in Explore.
[ Open Explore ]

Your students' interests
Aggregate and privacy-protected. No individual student is identified.
[ Open Students ]
```

Explore is a counselling catalogue inside the admin shell. It is not the
owner's personal Explore/Home and must retain the admin navigation frame.

## Admin navigation for a secondary-school owner

The owner-facing navigation is:

```text
GUIDANCE
  Guidance
  Explore
  Guidance intelligence
  Students
  Feedback

SCHOOL WORKSPACE
  Profile + team
  Affiliation
  Verification

ACCOUNT
  Sign out
  Delete account
```

The owner should not see university-only surfaces such as:

- Programme dashboard;
- Domain reach audit;
- Programme skill coverage;
- Peer benchmarks;
- university programme-mix analytics.

A secondary school has no university programme portfolio to audit. Its
organisation-specific work is student guidance and aggregate cohort context.

## The primary owner workflow: create students manually

The owner uses the `Students` area, not a generic student signup form.

### Screen 9: Students and provisioning

```text
Students

[ Add students ] [ Students ]

Create student accounts from the school workspace. You can add names manually,
review every row and then create only the accounts you confirm.

Student data is handled under your school safeguarding and consent duties.
```

The user-facing tab should say `Students`, not `Roster`, because the owner is
managing student accounts and guidance states. “Roster” may remain an internal
API or implementation term.

### Screen 10: choose manual entry

Because the requested school-owner route is manual creation, the first action
should be unambiguous:

```text
Add students

[ Add students manually ]
Create student rows one at a time.

[ Upload class list or result ]
Use an image or document only when you want the system to pre-fill names.

Nothing creates an account until you review and confirm the rows.
```

Clicking `Add students manually` must add a local review row. It must not open a
file picker, trigger document extraction or call the upload staging path before
the owner chooses a file. The current code uses a local draft ID for this row,
which is the correct safety boundary.

### Screen 11: add the first student

```text
Add a student

Full name
[ Chiamaka Eze                                  ]

Class
[ SS1 ] [ SS2 - selected ] [ SS3 ]

Stream
[ Science ] [ Art ] [ Commercial - selected ]

[ Add another student ]
```

Class and stream are set per student after the row exists. There is no single
batch stream selector at the top because one school batch may contain Science,
Art and Commercial students, and each student may be in a different class.

For a secondary school, class and stream are required for every selected row.
The current account types are SS1, SS2 and SS3; the manual form must not add a
generic “secondary” row with no stage.

### Screen 12: review and select

```text
Review & select

Correct any unclear names, choose the class and stream for every student, tick
the students whose accounts you want to create, then continue.

☑ Chiamaka Eze
  SS2 · Commercial stream

☐ Daniel Bello
  SS1 · Science stream
  Needs review

[ Add another ] [ Clear selected ]

[ Create 1 account ]
```

An empty name is marked `Needs review` and cannot become an account. If any
selected student is missing a stream, the create action must say:

```text
Choose a stream for every selected student before creating accounts.
```

The owner can correct names, change class/stream and return to the import
options without losing the manual rows.

### What “stage” means

The owner should understand the boundary:

```text
Review row
  = a draft, not an account

Create accounts
  = creates real school-managed student accounts and claim codes
```

If the manual staging request fails:

```text
Could not stage the manually entered students. Please try again.

Your entries are still on this page. Nothing was created.
```

Do not tell the owner that accounts were created unless the final provisioning
request succeeds.

### Screen 13: account creation result

```text
1 account created

Give Chiamaka her claim code. She can use it when signing up, signing in or
opening her school account page. The code is single-use.

CHIAMAKA EZE · SS2
CLAIM CODE
STARLIGHT-SS2-7K4P9Q

[ Print card ] [ Download card ] [ Share card ]
[ Guide student ]

Guide this student before printing a career report.

[ Copy all codes ]
[ Done ]
```

The exact code format is generated by the backend. It should use a readable
school-scoped prefix plus a unique record suffix so schools with identical
names or initials never share live codes. The owner-facing UI must not invent a
code when the backend has not returned one.

The login card is QR-enabled in the current provisioning API. Printing or
downloading it should preserve the QR code and the claim code. Sharing uses the
device/browser share handoff; it must not claim that email or WhatsApp succeeded
unless the handoff succeeded.

## Claiming the created student account

The created account is real, but it starts as a school-managed, unclaimed shell.
The student must claim it to make the account theirs.

### Student entry points

The claim code can be entered:

```text
Create account
  Student claim code (optional)

Sign in
  Student claim code (optional)

My School
  Have a claim code?
```

If a guest enters a claim code, the app carries it into the signup route rather
than losing it. The student adds a phone number or email so they can return to
the account.

```text
Have a claim code?

Enter the code from your school card to make this account yours.

[ Claim code ]
[ Phone number ]
[ Email (optional) ]

[ Claim my account ]
```

On success:

```text
Your account is now yours. You are all set.
```

Claim codes are single-use. A lost code can be reissued only while the account
is still unclaimed and within the provisioning rules.

If the student already created a separate account, the backend may create a
merge candidate. The school owner must confirm a merge only when the two records
are clearly the same student. Never merge based only on a similar name.

## Privacy and consent

The school owner sees three different student states:

```text
School-managed
The school created the account and the student has not claimed it. The owner
can continue the permitted school guidance workflow.

Claimed
The student has claimed the account. Private student activity is not
automatically exposed.

Shared by student
The student has explicitly shared the permitted progress scope with the school.
```

The Students screen should show aggregate counts:

```text
Affiliated       18
Aggregate-only   12
Shared with you   6
```

The owner can request student consent:

```text
[ Request student consent ]

Consent request sent to 3 claimed students. They decide what to share.
```

For under-18 students, the school must follow applicable guardian, safeguarding
and data-protection rules. The owner cannot treat account creation, affiliation
or an access code as consent to read private progress.

The school code is for self-reported affiliation and aggregate attribution. It
is not the student claim code and it never grants individual visibility.

## Guiding a created student

### Screen 14: select a student to guide

```text
Chiamaka Eze
SS2 · Commercial stream
School-managed · Unclaimed

[ Guide student ] [ Claim card ]
```

The owner can start guidance before the student has claimed the account when the
school-managed workflow permits it. The class and stream are passed into the
guidance context so the owner does not have to guess them again.

### Screen 15: guidance context

```text
Guide Chiamaka Eze

Student context
SS2 · Commercial stream
Starlight College

Build this student's guidance path. Start with the student's programme and
university, then select the domains, subgroups and career roles relevant to the
conversation.

[ Start student guidance ]
```

If the owner starts Explore without selecting a student, the admin admission
path must ask for the student type and stream before showing subject or
programme guidance:

```text
Who are you guiding?

Student type
[ SS1 ] [ SS2 - selected ] [ SS3 ]

Stream
[ Science ] [ Art ] [ Commercial - selected ]

Choose this context before we show admission subjects or programme guidance.
```

When a student ID is attached, show the context as a visible banner:

```text
Guiding: Chiamaka Eze · SS2 · Commercial
```

The owner should not see an unlabelled national catalogue and accidentally save
the guidance to the wrong student.

### Screen 16: choose programme and university with the student

The owner uses the same admission catalogue as the student, but inside the
admin shell and with the student context attached:

```text
Find a programme and university for Chiamaka

[ Programme ] [ University ] [ Subjects ]

The programme and university decision belongs to the student. Use this space to
explain the options together; it is not an admission decision.
```

For SS2, the owner should normally use the programme/university route or
O-level-informed early guidance. UTME subjects are not required merely because
the owner is guiding an SS2 student. For SS3, the combined O-level and UTME
subject thresholds apply when the owner chooses subject matching.

The owner sees:

```text
Business Administration
4 universities found
What this programme teaches: organisations, planning, people, resources and
decisions.

[ View programme and universities ]
```

After opening the programme, the owner selects one university and reviews its
published requirements:

```text
Cedar Valley University
12 Independence Avenue, Enugu, Enugu State
Business Administration · B.Sc. · 4 years

UTME subjects
[published requirement text, when available]

O-level credits
[published requirement text, when available]

[ Choose this university ]
```

No fake requirement, aggregate, demand value or “under review” status is shown
when the relevant data is unavailable.

## Selecting the guidance path

After the owner chooses the academic context, the path continues to mapping:

```text
Business Administration — Cedar Valley University

Where could this programme lead Chiamaka to explore?

DIRECT
General Management
The programme includes planning, organisations, people, resources and decisions.

FUNCTIONAL
Economics
Some abilities transfer, but deeper economic analysis is needed.

ADJACENT
Marketing, Brand
The programme shares planning and coordination with this field, but Marketing
has a different specialist focus.
```

The owner then selects the branches that are useful in the conversation:

```text
General Management
[ Select this field ]

Areas inside this field
  Department & Finance Managers
  Business Analysts & Consultants
  Chief Executives & Founders
```

Selecting the subgroup:

```text
Business Analysts & Consultants
A part of General Management

This area looks at problems, information, business processes and ways an
organisation could improve.

[ Select this area ]
```

Selecting the role:

```text
Business Analyst

What this work involves
Helping an organisation understand a problem and decide what could change.

Things to build over time
  Curiosity
  Clear communication
  Careful thinking
  Problem-solving

[ Select this role ]
```

The owner should select only what was discussed with the student. The report
must not silently include every mapped domain, subgroup or role.

## Completing and saving guidance

The owner sees a clear completion state:

```text
Guidance saved for Chiamaka Eze

Programme          Business Administration
University         Cedar Valley University
Domain             General Management
Area               Business Analysts & Consultants
Role               Business Analyst

[ View student path ] [ Print report ]
```

Saving the guidance path uses the student's ID and the `admin_guidance` source.
It must not overwrite the owner's own starting point or personal My World.

The student's own account can later claim the account and continue the path.
The owner continues to see only the permitted school-managed or consented view.

## Student list states and actions

```text
Chiamaka Eze
SS2 · Commercial stream
School-managed
[ Guide student ] [ Claim card ]

Daniel Bello
SS1 · Science stream
Shared by student
[ Report ]

Efe Mensah
SS3 · Art stream
Claimed
No shared progress yet
```

For a completed path, the report action is available. For a provisioned student
without guidance, show `Guide student`, not `Under review` or `Report pending`.

### Merge candidates

If a provisioned student later creates another account, show a review card:

```text
Possible duplicate account

Provisioned
Chiamaka Eze · SS2 · Commercial

Claimed account
Chiamaka Eze

Confirm only if these are the same student.

[ Confirm merge ] [ Dismiss ]
```

The owner must not be forced to merge and must not use a match percentage as
proof of identity.

## Deleting school-created student accounts

The delete action is narrow and explicit:

```text
Select a school-managed student to remove a wrong account.
Deletion is available only before guidance is completed and before the student
claims the account. Claimed or guided accounts are protected.
```

Confirmation:

```text
Delete student accounts?

This permanently removes 1 unclaimed, unguided school-created account and
invalidates its claim code. Claimed or guided accounts cannot be deleted.

[ Cancel ] [ Delete permanently ]
```

This is not the same as the owner deleting their own admin account. The owner
account deletion action remains in the admin shell account menu and follows the
account-lifecycle rules.

## School affiliation code

### Screen 17: affiliation

```text
Your institution's school code

Share this code with students who want to link themselves to Starlight College.
It powers aggregate, privacy-protected attribution. It never grants access to
individual progress.

SCHOOL CODE
STARLIGHT-4Q8M2D

[ Copy code ] [ Share code ]

The readable school prefix is paired with a record suffix so schools with the
same name or initials do not share a code.
```

If the organisation or affiliation data is not live:

```text
School code
••••••

Available after the school record and affiliation service are ready.
```

Do not show a fake code or a fake affiliated-student count. The share action can
include a signup link with the school code when a real code exists.

Remember the distinction:

```text
School code
  Student chooses it to self-link for aggregate attribution.

Student claim code
  School creates it for one student account; the student redeems it to own that
  account.
```

## Profile and team

### Screen 18: Profile + team

```text
Starlight College
Secondary school · Claimed

One school can have multiple officials. Each person uses their own account.
Do not share the owner's login.

Team members
  Mrs. Ngozi Eze · Owner · Active
  —

Invite an official
[ official@school.edu.ng                         ]

Role
[ Counsellor ] [ Provisioning manager ] [ Viewer ]

[ Send invitation ]
```

Invites unlock for verified owners/admins. Before that, show the workflow and
the reason it is unavailable; do not show a fake successful invitation.

The owner can manage the organisation identity, school code and team seats.
Counsellors guide students; provisioning managers create claim codes and manage
the consent-aware student area; viewers read authorised aggregate data.

## Reports, print and share

The owner cannot print a completed career report merely because an account was
created:

```text
Guide this student before printing a report.
```

After guidance is complete, the student card exposes:

```text
[ Download Word plan ]
[ Share Word plan ]
[ Print / save PDF plan ]
[ Share PDF plan ]
```

The report is a compiled student output, not an admin database dump:

```text
Starlight College
Career guidance summary

Student: Chiamaka Eze
Class: SS2
Stream: Commercial
School: Starlight College
School address: 24 Unity Road, GRA, Benin City, Edo State

Academic choice
Business Administration — Cedar Valley University
University address: [real address when available]

What the programme teaches
[student-facing programme overview]

Selected guidance path
General Management
  Business Analysts & Consultants
    Business Analyst

Resources selected during guidance
  [only real resources selected or saved]

Data notes
  [only actual unavailable or incomplete records]

This guidance supports a student conversation. It is not an admission decision,
qualification, licence or job-readiness assessment.
```

The report must include only the selected domain/subgroup/role branches. It must
not contain demand scores, salary forecasts, peer rankings, fabricated
requirements, private student notes or unconsented progress.

The owner can share the report through the available device/browser share path.
Email, WhatsApp, Drive or Dropbox may appear only when the platform/connector
supports the handoff. The UI must report failure when the handoff fails.

## Resources in educator guidance

Resources are shown beside the domain, subgroup, role, skill, competency, tool
or certification they explain:

```text
Why this link is here
It helps Chiamaka understand how planning and business decisions work.

[ Open learning link ] [ Save to student path ]
```

The owner may select a resource for the student's report/path only when the
resource record is real. The resource migration and seed files in the repo do
not prove that a live resource table and parent rows exist.

If unavailable:

```text
No trusted learning link is available yet.
```

Do not show raw fields such as `foundationSkills`, `essentialSkills`,
`roleBridgeSkills` or `appearsIn` to the owner or student.

## Admin Explore: structured catalogue view

The owner is not a student in this workspace. When the owner searches Explore,
the result may be explained in plain language, but the opened record must keep
the repository's full structure visible enough for an educated administrator to
review it.

### Programme record

```text
BUSINESS ADMINISTRATION
Canonical programme record

What the university programme teaches
  Technical learning outcomes
    [source-backed programme outcomes, one per row]
  Transferable learning outcomes
    [source-backed programme outcomes, one per row]

Programme → domain mapping
  [domain name] · direct
  [domain name] · functional
  [domain name] · adjacent

Open a domain to inspect its foundation skills, tools, certifications,
subgroups and roles.
```

The programme record may also show the JAMB name, faculty, qualification,
duration, subject requirements and the universities that offer that JAMB name.
Those are separate admission fields. The admin view must not collapse them into
the career mapping or label a JAMB name as a CCMAS discipline.

### Domain record

```text
[Domain name]

Domain-level intelligence
  Foundation skills — prevalence by role
  Domain tools — distinctive / common
  Gateway certifications / role-hint certifications

Subgroups
  [Subgroup name]
    Description
    Subgroup skills
    Subgroup tools
    Subgroup certifications
    Roles in this subgroup
      [Role name] → open role record
```

Roles are displayed under their recorded subgroup. A role with no subgroup is
shown as unassigned and is treated as a data-quality item, not silently placed
under a guessed subgroup.

### Role record

```text
[Role name]

Essential skills
Optional skills
Methods and competencies
Role-owned tools
Role-owned certifications
Source-backed occupation evidence
Domain and subgroup placement
```

The role view keeps role-owned fields distinct from domain and subgroup fields.
It can show source confidence, data state and evidence provenance. It must not
turn a listed skill into proof that a student or staff member already has that
skill, and it must not expose an unbounded database export.

This is now a separate admin detail contract from the student cards. Student
cards remain concise and guidance-oriented; admin Explore uses bounded,
source-backed sections and allows the owner to open each domain, subgroup or
role for its granular records.

## Data states and safety rules

The owner workspace must distinguish these states:

```text
Loading
The system is retrieving the organisation or student data.

No data yet
The organisation has no students or no aggregate signal has been returned.

Unavailable
The relevant migration/API/data source is not ready or failed.

Real
The API returned a trusted record or count.

Under review
Only used after a verification proof upload has actually been submitted.
```

The owner must not see:

- a fake student roster;
- a fake claim code;
- a fake affiliation count;
- an individual student's private progress without consent;
- a report for a student whose guidance path is incomplete;
- `Under review` when no proof has been submitted;
- demand, salary or employment forecasts in this school-owner flow;
- university-only portfolio and peer-benchmark screens;
- a CCMAS discipline label in a student-facing report;
- a role card that claims the student is ready for employment.

## Current implementation findings to preserve

The mockup follows these audited code paths:

- `src/screens/onboarding/AccountTypeGate.tsx` routes Educator / Institution
  to `EducatorOnboarding`;
- `src/screens/admin/EducatorOnboarding.tsx` implements organisation type,
  school search/registration, required address, owner/counsellor role, access
  code, optional work/registry details, claimed status and workspace routing;
- `src/lib/adminAudience.ts` and `src/lib/adminNav.ts` route secondary schools
  to the school Guidance audience, not the university dashboard;
- `src/screens/admin/SchoolGuidanceDashboardScreen.tsx` provides aggregate
  cohort cards, guidance actions and links to students/Explore;
- `src/screens/admin/StudentProvisioningScreen.tsx` implements the `Students`
  and `Add students` tabs, manual local drafts, per-row class/stream selection,
  review, actual account generation and claim-card actions;
- `src/lib/provisioningData.ts` confirms that final generation creates a real
  account, affiliation and claim code, while staging only creates a draft;
- `app/(admin)/students/[userId]/guidance.tsx` starts an educator-led guidance
  session with the student ID, class and stream attached;
- `src/screens/careerIntelligence/AdmissionBrowseScreen.tsx` saves the selected
  programme, university, requirements and mapping to the provisioned student's
  guidance path;
- `src/screens/admin/VerificationScreen.tsx` distinguishes claimed from proof-
  submitted/pending verification;
- `src/screens/admin/AffiliationScreen.tsx` handles the school code and
  aggregate-only attribution;
- `docs/mockups/GUIDANCE_REPORT_BEHAVIOUR.md` defines selected-branch reports,
  educator access and printable output.

One important implementation gap is visible in the current provisioning form:
the API model carries `guardianConsent` and `guardianName`, but the review grid
does not currently render a guardian-consent capture control. The owner flow
must not imply that account creation captures consent. Consent should remain a
separate, explicit, auditable workflow before individual student progress is
shared.

## SQL and live-data boundary

Provisioning, school identity, claim-code, consent and report migrations in the
repository are candidate deployment sources. A migration or seed file is not
proof that the active database has the table, rows or policy required by the
screen.

The owner UI must therefore:

1. create a draft only when staging succeeds;
2. create a real student account only after final generation succeeds;
3. show real claim/QR data only when returned by the backend;
4. show a real report only after the guidance path is complete;
5. show individual data only under the provisioned/unclaimed or consented access
   rules;
6. show unavailable states instead of hardcoded values.

This secondary-school-owner flow intentionally excludes demand data and does not
use market-intelligence placeholders as a substitute for verified guidance
records.

## Owner acceptance checklist

Use this checklist when manually reviewing the finished school-owner flow. Every
item must be true before the flow is treated as ready for release:

- [ ] Selecting `Secondary school` requires a real organisation name and a
  compulsory, distinguishable school address.
- [ ] Changing organisation type clears the previous organisation selection and
  never carries a university or tutorial-centre record into the school flow.
- [ ] `Add students manually` creates an editable local row; it never opens the
  upload picker.
- [ ] Class and stream are selected per student, and mixed SS1/SS2/SS3 and
  Science/Commercial/Art rows can coexist in one review batch.
- [ ] Staging failure leaves the manually entered names visible and does not
  imply that accounts were created.
- [ ] Final generation creates a real student account only when the backend
  returns its account and claim-code record.
- [ ] Claim cards show only returned claim/QR data and explain the single-use
  claim route through signup, login or My School.
- [ ] Guidance starts with the selected student's class and stream and does not
  silently reuse another student's subjects, programme, university or report.
- [ ] Programme search shows the JAMB programme identity, programme overview,
  the universities that actually offer it, and the correct university address
  when that address exists; it does not surface CCMAS discipline labels.
- [ ] O-level and UTME results are separated when the selected route requires
  both, and threshold messages do not call a partial match eligible.
- [ ] Domain, subgroup and role branches come from the selected programme's
  current mapping; only branches explicitly selected for guidance enter the
  report.
- [ ] A report is unavailable until programme, university and the confirmed
  guidance path exist.
- [ ] Print, download and share actions use the returned report and surface
  connector/browser failure instead of claiming delivery.
- [ ] Account creation is not treated as consent. Individual student progress
  remains hidden until the permitted claim/consent state exists.
- [ ] Empty, unavailable and verification states are honest; `Under review`
  appears only after proof upload.
