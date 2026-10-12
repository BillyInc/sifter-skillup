# Admin Explore, Programme Intelligence and Market Intelligence

Status: UI implementation contract and reviewable mockup
Scope: programme preview, organization-specific admin Explore, programme-level
curriculum/skills-gap reporting, separate labour-market demand views, and the
school-owner student-account entry flow. Skills Matcher work is explicitly
out of scope: do not add, modify, or implement the matcher or its behavior as
part of this UI task.

## Product boundaries

- Programme Intelligence answers: **What does this institution's programme
  offering teach, how does that curriculum connect to fields and roles, and
  what supported capabilities may still need to be learned?**
- Market Intelligence answers: **Where is demand evidenced across domains,
  specializations/subgroups and roles?** It contains no university programme,
  curriculum, admission or programme-specific gap detail.
- JAMB programme identity and source offering are distinct. Where the same
  named programme appears under different faculties or institutions, retain
  separate offering rows and report contexts; do not merge their evidence.
- A CCMAS mapping is attached to the JAMB programme offering only when course
  scope and outcomes support it. Use authoritative external evidence where
  CCMAS does not adequately represent the field. Display provenance and
  relationship type; do not infer a combined curriculum from a title.
- Student-facing previews use only the source-backed curriculum contract and
  approved student resources. Do not fall back to review-only or legacy arrays.
- Examples below describe layout and behavior. They are illustrative labels,
  not assertions that live university or market data is present.

## 1. Student programme preview and university transition

### Programme preview (before a university is chosen)

```text
PROGRAMME PREVIEW
Accounting and Finance
Understand what the programme covers before comparing universities.

WHAT YOU WILL STUDY
[Curriculum themes built from source-backed course titles, summaries and
learning outcomes. If the source-backed record contains programme abilities
but no course outcomes, show those abilities here instead of an empty-course
placeholder. Expand a theme to see its course anchors and outcomes.]

PROGRAMME CAPABILITIES
[Skill] ...    [Competency] ...    [Tool] ...    [Certification] ...
Each item explains its use, relationship and verified learning link, when one
is recorded. Items not supported for this programme are not shown as confirmed.

COMPARE UNIVERSITIES
[Search/select a university]
```

The preview must not show a generic future-tense placeholder when displayable
source-backed programme abilities are already returned. When the contract is
absent, show an honest unavailable state that distinguishes `not_seeded` from
an available-but-empty curriculum. University choice must still be possible.

### Selected university

```text
PROGRAMME AT THIS UNIVERSITY
Accounting and Finance · University name · Faculty/source context

OVERVIEW
[Programme overview for this selected offering, when source-backed.]

REQUIREMENTS                         WHAT YOU WILL STUDY
[Published requirements]             [Programme curriculum overview]

Continue to domain connections  →
```

The selected university's offering overview appears after selection. Its
requirements and offering evidence remain attached to that institution. Back
from the university/offering details returns to the originating programme
preview and preserves the chosen learning stage. “Skip to guidance” opens the
existing guidance route; it must be an actionable control, not decorative text.

### Domain, subgroup and role selection

```text
CONNECTED DOMAINS
[ ] Direct domain — short reason tied to curriculum evidence
[ ] Functional domain — short reason tied to applied/transferable evidence
[ ] Adjacent domain — explain the additional learning needed

Choose areas and roles (optional)
[ ] Specialization / subgroup — concise student-facing summary
[ ] Role — concise role summary
```

Selection is an explicit check/tick state, not a save action. Toggling a
domain, subgroup or role only changes the current selection. Persist only when
the user invokes the actual continue/save action. First opening an audience or
detail section must not collapse the content underneath it.

### Cumulative learning progression

Show the learning route in layers rather than as one flat list:

```text
DOMAIN FOUNDATION
[Source-backed foundations shared across the field]

AREA / SUBGROUP ADDS
[Only the additional learning for this focused area; inherit the domain stage]

ROLE ADDS
[Only the additional learning for this role; inherit both earlier stages]
```

For a route with no subgroup, show **Domain foundation → Role adds** directly.
Do not invent an empty subgroup or hide the direct route. An item already
introduced at a prior level is inherited, not repeated as a new requirement at
the next level. Keep every item at its actual evidence/ownership level, with its
own explanation and learning resource; a higher-level link must not be attached
to a lower-level item merely because the learner follows that path. Show only
source-backed, student-owned items; review-only or unsupported records are not
student requirements. “First/then/next” describes the progression through
levels, not a prerequisite order among items unless a sourced dependency says so.

## 2. Organization-specific admin Explore

Explore has a distinct framing and data boundary for each organization type;
it must not use a generic “Find your domain, role or programme” student
headline for organization owners.

### University Explore

```text
UNIVERSITY WORKSPACE
Explore your programmes and compare your institution's position

YOUR OFFERINGS
[Programme count] [Offering count] [Mapped domains] [Coverage status]
Values appear only when supplied by the institution-scoped API.

PROGRAMMES AT YOUR UNIVERSITY
[Programme / JAMB offering] [Faculty/context] [Coverage] [Open report]

COMPARE WITH OTHER UNIVERSITIES
Compare the university's aggregate portfolio and select a peer for an
offering-level JAMB programme comparison. This is structural curriculum reach,
not a ranking or a claim about unpublished institution-specific teaching.

[Choose a peer university]
[Programmes it offers that we do not: count + named JAMB offerings]
[For each compared portfolio/offering: domains, specializations and roles reached]
[Market demand: Coming soon unless source-backed demand records exist]

Comparison counts are derived from each university's distinct
school-programme offering rows and current JAMB→CCMAS→domain links. They do not
claim that every listed specialization/role is taught by that university. Demand
is never inferred from curriculum reach. Same-named offerings remain distinct
by university and retain their offering identifiers and available JAMB faculty
context.

[Open Programme Intelligence]   [Open Market Intelligence]
```

University Explore is about the institution's own programmes, records and
comparisons. It must not say the university is guiding students, offer SS/JAMB
learner controls, or show another institution's private data. Offering rows
must keep the JAMB identity, faculty and university offering context visible.
Current peer rows are aggregate only; same-programme comparisons require
offering-scoped API evidence. If no comparison source is available, say so; do
not manufacture a benchmark.

### Secondary-school owner Explore

```text
SECONDARY SCHOOL WORKSPACE
Explore study routes for your school

YOUR SCHOOL
[School identity / verified capabilities / available student guidance tools]

PROGRAMMES AND UNIVERSITIES
Search and compare all published JAMB programmes and their university
offerings. Compare published requirements and supported programme details.

[Browse programmes] [Compare universities] [Open school capabilities]

SMALL SUPPORTING TOOLS
[Collapsed: Skills matcher — open only when needed]
[Compact: Explore career areas]

```

The school owner can inspect and compare the complete university/programme
catalogue, while seeing only their own organization's capabilities and
authorized student-scoped information. Lead with school guidance tasks and
school-owned capability summaries, not generic student language such as “Find
your domain, role or programme”. Keep domain exploration compact. The existing
Skills Matcher may be opened as a secondary tool but must not dominate the
page or change behavior/data as part of this visual refinement.

### Tutorial-centre owner Explore

```text
TUTORIAL CENTRE WORKSPACE
Explore JAMB programmes and university offerings

YOUR CENTRE
[Verified capabilities and available JAMB guidance tools]

PROGRAMMES AND UNIVERSITIES
Search and compare all published JAMB programmes and their university
offerings, including requirements and source context.

[Browse JAMB programmes] [Compare universities] [Open centre capabilities]
```

Tutorial centres receive JAMB-oriented language, not secondary-school levels.
They may inspect/compare all programmes and universities and see their own
capabilities. Do not imply their centre owns or teaches a university
curriculum.

### Market Intelligence entry

Programme curriculum connections and skills gaps belong in Programme
Intelligence. Market Intelligence contains demand only. When source-backed
demand is not available, show one concise unavailable message and remove the
duplicate programme/domain-mapping and programme-demand panels. Do not present
taxonomy counts as current market demand.

## 3. University Programme Intelligence

### Offering coverage index

```text
PROGRAMME INTELLIGENCE
Curriculum and learning-gap reports for your university's JAMB offerings

Offering                         Curriculum evidence    Domain links    Report
[JAMB identity + faculty]        [available/status]     [counts/status]  [Open]
...
```

Provide a report for every JAMB programme offering belonging to the signed-in
university, not just a sample. Do not substitute a canonical name-only row for
distinct source offerings. Show whether the offering is matched to CCMAS,
combined CCMAS, externally supported, partial, or awaiting evidence. A missing
CCMAS anchor alone does not make the JAMB offering unavailable.

### Individual offering report

```text
JAMB OFFERING
[Programme name] · [faculty/source context] · [institution]

CURRICULUM THIS PROGRAMME TEACHES
CCMAS components: [component names and source-backed selected courses/outcomes]
External curriculum evidence: [only where needed; URL, locator, date, support]
Unrepresented programme-name components: [plain explanation, or none recorded]

CONNECTED FIELDS
DIRECT       [domain → specialization/subgroup → role]
FUNCTIONAL   [domain → specialization/subgroup → role]
ADJACENT     [domain → specialization/subgroup → role]

LEARNING GAPS (verified market expectations not already taught)
1. Direct-domain gaps
2. Functional-domain gaps
3. Adjacent-domain gaps

Each gap: [Skill | Competency | Tool | Certification] · why needed ·
required/useful/optional · evidence and source link · learning link when
verified. Do not call an item a gap if the scoped curriculum already teaches
it. Do not label standards as certifications.
```

### Offering report interaction and evidence states

The university report index is the entry point. Opening a row drills into one
offering; Back returns to the same filtered index. Inside an offering, the
curriculum baseline is visible first, then a short interpretation, then the
Direct, Functional and Adjacent path groups. Each path expands progressively:

```text
DIRECT · [domain]                         [why this offering connects] [source]
  AREA OF SPECIALIZATION · [subgroup/AOS] [why this area fits]          [source]
    ROLE · [role name]                    [role context]               [source]
      WHAT IS ALREADY TAUGHT   [outcome/course anchors]
      WHAT IS PARTLY COVERED   [matched evidence + what is missing]
      VERIFIED NEXT LEARNING  [typed, source-backed item and reason]
      [Needed] [Useful] [Optional]        [item source] [learning link]
      [Tool use/category] [builds on / works with relationship, if sourced]
```

The comparison status is not inferred from a title or simple name overlap.
Only a source-backed curriculum outcome can support “taught”; partial coverage
must name the supporting and missing parts. A capability is a verified next
learning item only if its item-specific expectation evidence is approved,
has an explicit source-backed/verified data state and retains a source locator.
Otherwise show “Expectations not yet evidenced” and keep the item out of gap
counts. A source URL is provenance, not automatically a learner resource.
Needed/useful/optional is displayed only when the source explicitly states
that status. Generic taxonomy reach, role aggregates, standards presented as
credentials, and framework capability levels presented as a student sequence
cannot become confirmed learning items.

External curriculum evidence is a distinct labelled layer; it must show the
source, access date/locator, what specific curriculum component it supports,
and why CCMAS was incomplete for this offering. If the current API does not
return that evidence, show “External curriculum evidence not yet available”
and identify the missing source/API contract instead of filling the gap by
programme-name intuition. Same-named offerings in another faculty or
institution must remain separate cards and source contexts.

Peer portfolio comparison has its own progressive state: choose a peer, see
the count and names of peer-listed JAMB identities absent from the current
portfolio, then inspect the domain/specialization/role reach for each named
offering and both portfolio totals. These are taxonomy reach counts, not
demand. Demand is “Coming soon” unless a demand-specific source returns a
measure, geography, period and as-of date.

The report compares source-backed course contents/outcomes to source-backed
expectations for the connected domain, specialization/subgroup and role. The
gap ordering is always direct first, then functional, then adjacent; it is not
a blended opaque score. Keep skill, competency, tool and certification types
distinct. A certification/tool is not automatically a requirement. Show
source locators and evidence status so an administrator can inspect why an
edge or gap exists. Never claim live report coverage unless the API returns
the relevant offering and evidence.

### Empty and unavailable states

- **No offering rows returned:** “No university offering records are available
  for this institution yet.” Do not show national counts as local counts.
- **Curriculum not seeded:** say the report is waiting for its source-backed
  curriculum contract; do not display legacy skill arrays as a substitute.
- **No market evidence:** show “Market expectations are not available for this
  area yet”; do not infer them from occupation taxonomy or fabricate gaps.
- **Partial mapping:** show supported components and identify the missing
  evidence explicitly. Do not hide an offering or pretend the mapping is
  complete.

## 4. Market Intelligence (demand only)

```text
MARKET INTELLIGENCE
Demand across domains, specializations and roles

Choose a view: [Domains] [Specializations] [Roles]
Search [domain, specialization or role]

Domain / specialization / role     Demand measure     Geography     As of
[Only source-backed demand rows; include source and date]

This view reports labour-market demand. It does not contain a university's
programme list, curriculum, course outcomes, admissions or programme gaps.
```

If demand ingestion is absent or not source-backed, show one concise empty
state explaining that demand rankings are not available yet. Do not repeat
programme-intelligence mappings or skills-gap copy in this view. Market rows
must expose measure, geography, period/as-of date and source. Do not call
taxonomy counts “current demand.”

## 5. School-owner student-account entry

```text
STUDENTS
Upload students                    Create accounts

Default: upload/roster overview. No pre-created student-account form or
preselected imported account appears until the owner chooses “Create accounts”.

CREATE ACCOUNTS
[Student details / selected uploaded students]
[Name] [SS1 / SS2 / SS3] [Stream]
[Remove row] [Add student]

[Create account(s)]
Guidance consent is requested for guidance use; it is not a prerequisite for
creating an account. For a single named student, no extra selection tick is
required. For multiple imported students, explicit row ticks select who will
be created. Returning to upload selection must reuse/replace the draft rather
than silently duplicate it. Every added draft row can be removed.

Opening Students defaults to the roster/upload choices, not a prefilled
account form or a staged student. Selecting **Create student account** opens
one blank, removable entry. **Back to upload options** is shown only when there
is an upload flow to return to. Starting a fresh manual or upload flow clears
the prior unsubmitted draft rather than stacking another copy. School owners
can choose SS1, SS2 or SS3; tutorial-centre accounts remain JAMB-only.
```

The school owner can create SS1, SS2 and SS3 student accounts. Tutorial-centre
accounts remain JAMB-only. Account creation and consent remain separate
actions. Keep the upload path visible only when the user is actually in the
upload flow; do not offer “Back to uploads” on a fresh create-account screen
with no upload context.

## 6. Behavior and acceptance states

| Surface | Acceptance behavior |
|---|---|
| Programme preview | Source-backed details render when present; honest distinct unavailable states otherwise. |
| University selection | Selected offering overview and requirements render; back returns to original preview/stage. |
| Skip to guidance | Navigates to guidance start with selected programme context. |
| Domain/subgroup/role selection | Check/tick toggles selection; no implicit persistence or collapse on first click. |
| Learning progression | Domain foundations first; subgroup/AOS and role show only additive items. If no subgroup exists, show domain → role. Preserve ownership, explanations and item-specific learning links; do not repeat inherited items as new requirements. |
| University Explore | Own offerings/stats; identify aggregate peer coverage as aggregate, and do not imply same-programme comparisons without offering-scoped evidence. Never use student-guidance framing or expose cross-institution private records. |
| School Explore | All public programme/university comparisons plus the school's own capabilities; school-specific language. Skills Matcher is out of scope. |
| Tutorial Explore | All public JAMB programme/university comparisons plus centre capabilities; JAMB-only framing. Skills Matcher is out of scope. |
| Programme Intelligence | Offering index preserves institution/JAMB/faculty identity; report separates curriculum, pathway evidence and item-specific expectation comparison. Only sourced matches show taught/partial/gap. Unknown expectations are Coming soon, not inferred from taxonomy reach. |
| Market Intelligence | Demand-only domain/specialization/role data; no programme/curriculum/gap-specific details. |
| Student account creation | Explicit entry, removable drafts, correct SS1–SS3, single-row no-tick, consent not blocking, no duplicate draft on return. |
| Market empty state | One demand-unavailable state only; no duplicate curriculum or programme-demand blocks. |
| School Explore hierarchy | School-owner copy and capabilities first; domain exploration compact; existing matcher visually secondary without logic/data changes. |
