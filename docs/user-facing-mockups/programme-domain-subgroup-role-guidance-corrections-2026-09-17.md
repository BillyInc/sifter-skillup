# Programme → domain → subgroup → role guidance UX

## Corrections and implementation recommendations

Status: design and behaviour specification. No code or database changes are
made by this document.

This document preserves the agreed Sociology worked example and incorporates
the following corrections:

- SS1 and SS2 see a programme preview before choosing a university.
- The complete programme page appears only after a university is selected.
- University requirements are part of the university-aware programme overview;
  they are not a separate requirements tab in the guided flow.
- Students do not print or download until the guidance path is complete.
- Selection is represented by a tick or checkbox, not by a large Save button.
- Print/download and share are compact icon actions, not large word buttons.
- University offerings have an explicit Select university action.
- Full university names and abbreviations are both shown.
- National subject guidance is explained in plain language.
- National and university-specific requirements are shown together only after
  a university is selected, with grouped subject pools expanded from the
  verified subject catalogue.
- A trusted programme duration is shown in the preview, for example
  `Bachelor of Science · 4 years` for Sociology.
- Browser Back and the in-workspace Back action return from university
  selection to the programme preview; they do not fall through to Home or a
  generic Explore route.
- Curriculum material is synthesized into an actionable learning explanation.
- Raw source wording is not shown to students by default.
- Curriculum evidence is described as CCMAS-backed and reworded for clarity.
- Learning links are attached to the skill, tool, competency, certification or
  material that they explain.
- Free learning resources are embedded in the item they teach, rather than
  collected in a disconnected generic resources section.
- “See how this theme is taught” becomes a clearer action without the word
  “theme”.
- Domain foundations, skills, tools, competencies and certifications appear in
  a natural learning sequence before areas/subgroups.
- Domain Build/Entrepreneurship is a separate tab beside Overview.
- Roles appear inside subgroups, not on the domain overview.
- Domain, subgroup and role pages explain how skills, tools, competencies and
  certifications work together.
- Local and source context is embedded in the relevant explanation instead of
  appearing as a large raw context block.
- “View source details” is not a primary student action. A compact reference
  such as “CCMAS curriculum” is enough for students; detailed source wording is
  reserved for educators and administrators.
- The legacy `Locked / Domain detail is temporarily unavailable` state is not a
  permitted student-facing display.

## 0. Non-negotiable data-first implementation gate

This document is a product and implementation contract, not permission to make
the current payload look complete. The Sociology pilot must be built from the
cleaned records that actually exist in the repository and database schema. No
developer, generator or UI component may invent a programme explanation,
learning outcome, skill, tool, certification, role, mapping reason, resource
link, university requirement or source citation merely because the screen has
an empty space.

The order of work is mandatory:

```text
Audit source and ownership
        ↓
Clean and classify records
        ↓
Freeze the Sociology content contract
        ↓
Build the screens from that contract
        ↓
Run negative, route and display checks
```

Do not begin with a visual synthesis and then try to find evidence for it.
Every sentence shown to a student must be traceable to one of the following:

1. a validated Sociology CCMAS programme/course/outcome record;
2. a validated programme-to-domain mapping edge;
3. a domain-owned foundation or item record;
4. a subgroup-owned item or method record;
5. a role-owned work, skill, tool, competency or qualification record; or
6. a specific approved resource record whose URL and provenance have been
   checked.

If the evidence is incomplete, the record is excluded from the relevant
student-facing claim and retained in the staff review output. It must not be
repaired by copying a neighbouring programme, guessing from a similar name,
using role frequency as a domain foundation, or attaching a generic learning
homepage.

### 0.1 The exact ownership boundary

The four levels have different responsibilities. They must not be implemented
by passing the same arrays through every screen:

```text
Sociology programme
  CCMAS curriculum, courses, outcomes and programme abilities

Social Sciences domain
  Domain meaning and domain-owned foundations shared by the field

Computational Social Science subgroup
  The focused methods, skills, tools and competencies that this subgroup adds

Statistician role
  The work, outputs, role skills, tool options, competencies and qualifications
  supported by the role record
```

`DegreeSkills` belongs to the programme layer. It may support the explanation
of why Sociology connects to a domain, but it must not be treated as the
domain's generic skill list. A programme-to-domain connection is an explicit
edge with a mapping type (`direct`, `functional` or `adjacent`). The carried
over foundation and the additions must be calculated from the validated
overlap between that Sociology curriculum and the domain-owned records. They
must not be produced by reusing `skillsTechnical`, `skillsTransferable`, a
role-prevalence list or hardcoded Sociology text.

The same domain can be connected to different programmes with different
mapping types and different explanations. The mapping type belongs to the
programme-to-domain relationship, not permanently to the domain. The domain
description remains stable; `Why this domain is connected to Sociology`,
`What carries over` and `What you may add` are generated for the current
programme context.

### 0.2 Required source audit before any screen is accepted

The audit must produce a machine-readable and human-readable review for the
Sociology slice. At minimum it must list:

- the canonical Sociology programme identity and every alias or duplicate;
- the CCMAS source file, document, page/locator, course code and course title
  for every retained outcome;
- every outcome group and the normalized student-facing category it supports;
- generic university-wide courses, distinct course variants and exceptions;
- duplicated, contradictory, malformed or context-free outcome rows;
- the exact programme-to-domain edges and their mapping types;
- the domain, subgroup and role IDs that those edges resolve to;
- ownership of every skill, tool, competency, certification and resource;
- each resource URL, target item, provider, access state, source confidence and
  review state; and
- an explicit decision for every row: `student_display`, `staff_review_only`,
  or `excluded` with a reason.

The audit must specifically test the Sociology data shown in the current
product: People and society, Ideas and foundations, Research and evidence,
Technology and information, Using/applying what is learned, Other programme
topics and the broader abilities currently labelled `Ways of working the
curriculum supports`. The latter is not automatically Sociology-owned. English
language, philosophy, environmental studies, entrepreneurship, peace and
security, LIS-specific exceptions, unrelated GST content and neighbouring
programme rows must be separated, explicitly justified as shared study, or
excluded. They must never silently become Sociology skills.

The audit must preserve the raw source for staff without using raw source
wording as the student interface. Duplicate rows may be consolidated in the
student explanation only after their source locators remain available in the
staff evidence view. A source phrase with no reliable programme/course context
is review-only, not a basis for a student-facing claim.

### 0.3 Cleaned contract required by the UI

The API/data adapter must expose separate, provenance-aware contracts rather
than one undifferentiated list:

```text
programmePreview
  Short programme identity, plain explanation, broad study areas,
  qualification/duration when trusted, verified offering count and hand-off.

programmeOverview
  Selected university identity, requirements, programme explanation,
  synthesized curriculum and validated abilities.

programmeLearningPath
  Ordered explanations of what Sociology teaches and how those capabilities
  are developed.

programmeMaterials
  Specific books, open texts or learning links attached to the statement they
  support.

programmeEvidence
  Compact CCMAS reference for students; structured source locators for staff.

programmeDomainConnection
  Mapping type, programme-specific reason, carried-over items, additions,
  evidence references and unresolved review state.

domainFoundation
  Domain-owned foundations only; never role-aggregated fallback rows.

subgroupContinuation
  Explicit inherited domain/programme items plus subgroup-owned additions.

roleContinuation
  Role-owned work, outputs, skills, tools, competencies, qualifications and
  item-level links.
```

Every displayed item must retain its item type, owner, source references,
evidence limitation, review state and link state. A missing specific link is
shown honestly as `No verified learning link is attached yet`; it is not
replaced by MIT's homepage, a generic search URL or an unrelated provider.
Source/reference links belong on the item or explanation they support. They
may open a small Sifter explanation first and then the verified external page,
but they must never be collected into an unexplained list at the bottom of a
card.

### 0.4 Display rules for incomplete or unresolved data

The user interface must distinguish these states:

```text
Verified and relevant
  Display the synthesized explanation and its specific link.

Known but missing a verified link
  Display the explanation, identify that no verified link is attached yet,
  and keep it out of the actionable-learning claim.

Ambiguous, unowned, incomplete or parser-failed
  Do not display it as guidance. Put it in staff review with the exact reason.

Not applicable at this route
  Do not display it. Do not call it locked or coming soon.
```

The student page must never show raw parser labels, source-inventory dumps,
role-frequency percentages, repeated source names, `context items`,
`local evidence`, `source checked`, `national aggregate`, `seniority not yet
verified`, or `Domain detail is temporarily unavailable`. Those are internal
data/evidence states. If a domain or subgroup has no verified student content,
show a useful bounded explanation based only on what is verified and route the
unresolved records to staff review.

### 0.5 Data-quality sign-off is a blocker, not a later polish task

Before implementing the full Sociology UI, the audit must pass these negative
tests:

- a Sociology page contains no LIS-specific or unrelated programme outcome;
- an outcome from another programme cannot enter Sociology through a shared
  component or cached array;
- a generic GST row cannot become a Sociology-specific ability without an
  explicit ownership decision;
- a role-derived prevalence list cannot appear as a Social Sciences foundation;
- a subgroup item cannot appear as a domain foundation unless it has explicit
  domain ownership;
- a role item cannot appear on a subgroup or domain page merely because it is
  attached to a role below that page;
- a missing or failed resource link cannot be rendered as an actionable link;
- a missing university requirement cannot be rendered as a complete one; and
- switching from Sociology to another programme clears all Sociology-specific
  explanation, abilities, resources and downstream context.

If any test fails, implement only the verified subset and stop the scaling
phase. Do not solve a data failure with presentational wording.

### 0.6 Current data audit result (2026-09-17)

The first read-only audit has now been run against the checked-in parsed CCMAS
files. It found **237 parsed programmes**, **81,429 course-outcome rows** and
**22 rows with appended parser/maintainer annotations**. The annotations are
not learning outcomes and must remain staff-review metadata.

The reviewed Sociology record contains **34 courses**, **243 course-outcome
rows**, **234 exact-normalised course outcomes** and **7 explicit programme
ability/employability rows**. Its legacy `skills_profile` contains **239 rows**
and cannot be treated as a clean student list: it combines course outcomes with
the seven programme abilities, loses or changes rows through its old
prefix-based deduplication, and contains the appended LIS exception and SOC 407
formatting note.

The Sociology contract builder has produced:

- 243 course outcomes, each retaining its course code, title, level, source file,
  original CCMAS PDF and outcome index;
- 7 separate programme-ability records;
- 2 excluded source annotations retained for staff review;
- 6 student-displayable programme-to-domain edges; and
- 1 active edge (`Sociology → Criminology, Criminal Justice`) held for review
  because its existing mapping evidence still has `review_required: true`.

The machine-readable artifacts are:

```text
data/career-mapping/_audit/programme_curriculum_data_quality_2026-09-17.json
data/career-mapping/_audit/sociology_curriculum_contract_2026-09-17.json
```

The repeatable commands are:

```powershell
python data/career-mapping/_audit_programme_curriculum_contract.py
python data/career-mapping/_build_sociology_curriculum_contract.py
```

These commands do not modify Supabase and do not overwrite the raw CCMAS
source. The clean contract is the only permitted input for the next UI/API
implementation step. The old `skills_profile`,
`skills_profile_technical` and `skills_profile_transferable` fields remain
staff-audit-only until their database/API replacement is wired and the same
quality gates pass.

## 1. Audit verdict

The current implementation is only partially aligned with the agreed design.

The main current problems are:

| Area | Current repository behaviour | Required behaviour |
|---|---|---|
| SS1 before university | The early-secondary programme surface can render the full curriculum, resources and programme-to-domain transition before a university is selected. | Show a concise programme preview only. Do not show domains, subgroups, roles or market/practice guidance yet. |
| Programme label | The no-university state is labelled as a programme overview. | Label it `Programme preview`. |
| University requirements | The screen still has a separate requirements tab. | Put national subject guidance, the selected university’s requirements and any university note inside the selected-university programme overview. |
| University selection | The offering list and comparison state are not yet expressed as one clear guided decision. | Show full institution identity, address, programme identity and an explicit `Select university` action. Keep comparison as an optional action. |
| Curriculum teaching | `DegreeSkills` groups outcomes, but still introduces them as curriculum records and can expose raw lists. | Present a short, explanatory learning narrative followed by a structured, expandable learning path. |
| Curriculum evidence | The evidence interaction is wired, but the student view can expose source phrases, a search field and extracted wording. | Students see synthesized explanations. Educators/admins can inspect structured source evidence separately. |
| Domain context | The domain can render large local-context, source and context-item blocks, including records that belong to a narrower field or role. | Show domain-owned foundations first. Embed short evidence notes into cards and keep detailed evidence in a secondary panel. |
| Domain roles | The current domain detail does not intentionally need to show a flat role list. | Preserve that rule: domain → subgroups; subgroup → roles. |
| Domain Build | Build is currently presented as an inline action within the overview. | Give every domain an `Overview` tab and a separate `Build in this domain` tab. |
| Tools | Generic source categories can appear, and Microsoft tools can appear more prominently than the evidence justifies. | Show named tools grouped by purpose, as alternatives, with a learning link on each tool where a verified link exists. |
| Resources | Resource support is not consistently attached to the item it explains. | Put the learning/reference action directly on each skill, tool, competency or certification card. |
| Reports | The existing report and report actions are too generic and visually heavy. | Treat the report as the completed output of the guidance path. Enable print/download/share only after completion and use icon actions. |
| Legacy state | The old locked-domain wording can still leak into the user view. | Remove the wording, symbol and legacy route state from the student-facing experience. |

The relevant current surfaces are:

- `src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx`
- `src/components/careerIntelligence/DegreeSkills.tsx`
- `src/components/careerIntelligence/ContextualItemList.tsx`
- `src/components/careerIntelligence/FoundationSkillsBlock.tsx`
- `src/components/careerIntelligence/ToolGroupsBlock.tsx`
- `src/screens/careerIntelligence/DomainDetailScreen.tsx`
- `src/screens/careerIntelligence/SubgroupDetailScreen.tsx`
- `src/screens/careerIntelligence/RoleDetailScreen.tsx`

The current code already contains useful building blocks, including programme
skills, foundation groups, tool groups, resources, contextual explanations and
domain transitions. The issue is hierarchy, ownership and presentation: the
student is seeing implementation-level evidence structures instead of a
progressive explanation.

## 2. Correct SS1 and SS2 flow

The guided flow is:

```text
Subjects selected
        ↓
Programme preview
        ↓
University offerings
        ↓
Select a university
        ↓
University-aware programme overview
        ↓
Programme teaching and learning path
        ↓
Continue to domain guidance
        ↓
Domain overview
        ↓
Subgroup
        ↓
Role
        ↓
Complete guidance path
        ↓
Print / download / share report
```

The student must not see domains, subgroups, roles, market skills or domain
tools before selecting a university. This rule applies whether the student
arrived through subject matching, a saved guidance path or an educator-guided
student account.

The route should remain a focused guidance workspace. The Explore shell may
host the route, but the active flow should hide unrelated global navigation.
The student sees only the current step, a back action, the selected path and
the next relevant action.

## 3. Programme preview before university selection

Example: Sociology.

```text
┌─────────────────────────────────────────────────────────────┐
│ Sociology                                                   │
│                                                             │
│ Sociology studies how people live together, how families,   │
│ groups and institutions work, and how societies change.     │
│                                                             │
│ You may study:                                              │
│ • people, culture and social life                           │
│ • social problems, inequality and change                    │
│ • research and evidence                                    │
│                                                             │
│ 12 universities offer this programme                        │
│                                                             │
│ [View universities]                                         │
│                                                             │
│ This is a programme preview. Choose a university to see     │
│ its admission information and the full programme guidance.  │
└─────────────────────────────────────────────────────────────┘
```

The preview should not display:

- domain mappings;
- subgroups;
- roles;
- market or practice skills;
- local context;
- full raw curriculum outcomes;
- university-specific requirements;
- print, download or share actions.

The sentence `This is a student-friendly view of the programme's curriculum
records` is removed. Students should not be told about database records.

The preview may include a compact `What Sociology is about` explanation and a
small set of programme themes, but it is not the complete programme detail.

### 3A. Preview boundary and university hand-off

The preview is an orientation step, not a shortened copy of the full
programme overview. It must be short enough to understand without scrolling
through curriculum material. The preview must contain only:

1. the single JAMB programme identity;
2. one plain-language explanation of what the programme studies;
3. a small number of broad study areas, written as short descriptions rather
   than extracted outcomes;
4. qualification and duration only when those values are present and trusted;
5. a clear statement that the programme is offered by more than one university
   when the offering count is verified; and
6. a `View universities` action.

The preview must not render the university cards underneath it. `View
universities` opens the dedicated offering-selection step. That step contains
the university cards, each with the full university name, abbreviation,
address, programme identity, qualification where known, `Select university`,
and optional `Select for comparison` actions.

The preview must not render `DegreeSkills` in its full form, the complete
learning sequence, the `Ways of working the curriculum supports` material,
programme resources, requirements, domains, subgroups, roles, tools,
certifications or market/practice context. It must not show an action such as
`See how this part is taught`; that action belongs to the full overview after
the university is selected.

The intended preview shape is:

```text
Sociology

Sociology studies how people, groups, institutions and societies are
organised and how they change.

You may explore:
  People, culture and social life
  Social problems, inequality and change
  Research and evidence

Bachelor of Science

This programme is offered by several universities. Each university may have
its own UTME, O-level and additional admission requirements.

[View universities]
```

Do not show a university-specific requirement before the student has selected
that offering. Do not put the student into the generic home or Explore page
between preview, university selection and the university-aware overview.

### 3B. Programme duration and preview-to-university history

When a trusted duration exists in the canonical programme record, show it
beside the qualification in the preview. For Sociology the line is:

```text
Bachelor of Science · 4 years
```

Do not calculate or guess a duration from a course count. If the value is
missing or unverified, omit it rather than showing a placeholder.

`View universities` is a real guidance step, not an in-place expansion that
loses the preview. The route must preserve the programme preview as the
previous history entry:

```text
Programme preview
    → View universities
    → University selection
```

Browser Back, an in-workspace Back button and a cancelled university-selection
action all return to the same programme preview, with the student's previous
subject/programme context intact. They must not route to Home, generic Explore,
or the old admission-search screen. A resumed saved path uses the same rule:
return to the last guidance state that opened the university selector.

### 3C. Programme books, reading and free learning resources

Programme resources belong to the programme overview. They should not be
dumped into the preview, moved to the domain page, or collected as a generic
resource catalogue. The preview only tells the student that deeper programme
reading becomes available after the university-aware overview.

After a university is selected, the programme overview contains a compact
card such as:

```text
Read and learn about Sociology

Start with the programme
  These books and materials help you understand the ideas, subjects and
  research methods that Sociology introduces.

  [OpenStax: Introduction to Sociology 3e]  Free open textbook
  [NOUN: CSS 111 Introduction to Sociology]  Free public courseware

Go deeper when you are ready
  [Haralambos and Holborn: Sociology: Themes and Perspectives]
  Publisher/library reference · access may be paid or through a library

  [Giddens and Sutton: Sociology]
  Publisher/library reference · access may be paid or through a library

Each item explains which Sociology learning area it supports and has its own
link. These are supporting materials, not proof that every Nigerian
university prescribes the same book.
```

The Sociology pilot has the following checked resource records and links. The
labels are deliberately precise:

| Programme resource | Use in the Sociology overview | Access and source |
| --- | --- | --- |
| [Introduction to Sociology 3e](https://openstax.org/details/books/introduction-sociology-3e) | Start with basic concepts, theories, culture, institutions, social change and introductory research. | Free, openly licensed textbook; OpenStax/Rice University. |
| [CSS 111 Introduction to Sociology](https://nou.edu.ng/coursewarecontent/CSS111%20INTRODUCTION%20%20TO%20SOCIOLOGY.pdf) | Nigerian introductory courseware covering the definition, scope, methods, family, culture, socialisation, groups, stratification and social change. | Publicly accessible NOUN course material; educational-use and copyright terms apply. It is not an open-licence book. |
| [Sociology: Themes and Perspectives, 8th edition](https://collins.co.uk/products/9780007498826) | Broader reference for inequality, gender, ethnicity, poverty, health, crime, family, politics, education, culture, media, methodology and theory. | Recognised publisher reference; paid or library access. Not a free book or universal requirement. |
| [Sociology by Anthony Giddens and Philip W. Sutton](https://www.wiley-vch.de/en/areas-interest/humanities-social-sciences/sociology-12so/general-sociology-12so0/sociology-978-1-5095-3922-2) | Deeper introductory and contemporary reference for sociological questions, theories, social change, inequality, family, education, work, politics, media, crime and related topics. | Recognised publisher reference; paid or library access. Not a free book or universal requirement. |

The programme card may also attach specific free materials to the learning
areas they support. The current checked Sociology set includes:

| Learning area | Specific material |
| --- | --- |
| Understanding Social Sciences | [You and your world: Introducing the social sciences](https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-0) |
| Reading and evaluating evidence | [Reading evidence](https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence) |
| Research ethics | [Becoming an ethical researcher](https://www.open.edu/openlearn/education-development/becoming-ethical-researcher) |
| Research design and methods | [Social Science Research: Principles, Methods, and Practices](https://usq.pressbooks.pub/socialscienceresearch/) |
| Research data management | [MANTRA Research Data Management Training](https://mantra.ed.ac.uk/) |
| Statistics foundation | [OpenIntro Statistics](https://www.openintro.org/book/os/) and [Khan Academy Statistics and Probability](https://www.khanacademy.org/statistics-probability) |
| Nigerian course context | [NOUN Faculty of Social Sciences e-Courseware](https://nou.edu.ng/ecourseware-faculty-of-social-sc/) |

These links are not all displayed at once. The overview groups them under the
Sociology learning explanation and places each link beside the topic or
material it supports. The domain, subgroup and role pages then add only the
resources owned by those levels. A domain resource must not be presented as a
Sociology textbook, and a role resource must not be presented as a requirement
for the whole domain.

`Industry-certified textbook` is not a safe data label unless an authoritative
source explicitly uses that status. Books are labelled as prescribed only when
the relevant university or official course document says so. Otherwise they
are labelled as a recognised publisher reference, open textbook, public
courseware, official documentation, professional-body reference or free
course. This prevents a respected book from being misrepresented as mandatory,
free or professionally certifying.

Before scaling beyond Sociology, run the same resource audit for every JAMB
programme identity:

1. Read the programme's verified CCMAS curriculum and identify the learning
   areas that a resource must explain.
2. Check official university/course documents for genuinely prescribed books;
   retain the institution and course context when one exists.
3. Find a legitimate publisher or library record for recognised paid/reference
   books; never link to pirated copies or an unverified PDF mirror.
4. Find a specific free, legally accessible textbook, course, courseware,
   documentation page or professional reference for each necessary learning
   area where one exists.
5. Verify that the link opens, the title matches the item, the access label is
   truthful and the material is suitable for the programme's level and
   Nigerian student context.
6. Record gaps instead of filling them with a generic homepage. A missing free
   resource does not justify attaching an unrelated book or course.

The resulting records must retain `programme`, `learning_area`, `resource_type`,
`title`, `provider`, `access_type`, `url`, `source_url`, `description`,
`review_status` and `source_provenance`. The student card uses the title,
short explanation and item-specific link; educators and administrators can
inspect the full source and prescription context.

The full overview begins only after selection:

```text
Sociology at University of Ibadan (UI)
Ibadan, Oyo State

Admission information for this university
  General programme subject guidance
  University of Ibadan's UTME requirements
  University of Ibadan's O-level requirements
  Additional university note, when recorded

What you will study
  Synthesized curriculum explanation

How you will use what you learn
  Programme-specific abilities and application sequence

[Continue to domains]
```

In this guided flow, admission requirements are inline in the overview. A
separate requirements tab is not shown.

## 4. University offerings and selection

This should be a proper guided screen rather than a cramped requirements modal.

```text
┌─────────────────────────────────────────────────────────────┐
│ Sociology                                                   │
│ Choose a university                                         │
│                                                             │
│ These universities offer Sociology. Select one to see the  │
│ exact admission information and programme details for that   │
│ university.                                                 │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ University of Ibadan (UI)                              │ │
│ │ Ibadan, Oyo State                                      │ │
│ │ Sociology · Bachelor of Science                         │ │
│ │                                                         │ │
│ │ [Select university]  [Select for comparison]           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Nnamdi Azikiwe University (UNIZIK)                     │ │
│ │ Awka, Anambra State                                    │ │
│ │ Sociology · Bachelor of Science                         │ │
│ │                                                         │ │
│ │ [Select university]  [Select for comparison]           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Compare selected universities]                            │
│                                                             │
│ [Back to programme preview]                                │
└─────────────────────────────────────────────────────────────┘
```

Full name and abbreviation rules:

- Always show `University of Ibadan (UI)`, not only `UI`.
- Always show `Nnamdi Azikiwe University (UNIZIK)`, not only `UNIZIK`.
- The full address appears on the offering card.
- The exact JAMB programme identity remains visible.
- A university-specific variant may appear as a secondary offering label only
  when the source data contains a genuinely different offering name.

The university offering is selected with an explicit action. The selection
tick is for the university choice, not a disguised save operation.

Keep these actions:

```text
[Select for comparison]
[Compare selected universities]
```

Comparison should remain optional. It should not interrupt the normal selection
flow or open automatically after one university is selected. If comparison is
opened, it should be a focused comparison screen with full institution names,
addresses and the relevant programme differences.

### Comparison wording rule

The comparison page must identify the object being compared:

```text
Compare Sociology offerings

You are comparing the recorded offering details for Sociology at each
university. This is not a ranking of the universities.
```

Do not show a generic university-level internal data-state label in the
comparison. That wording does not help a student decide.

Compare only the actual offering fields:

```text
                    University of       Nnamdi Azikiwe
                    Ibadan (UI)          University (UNIZIK)
Programme name      Sociology            Sociology
Qualification       Bachelor of Science  Bachelor of Science
Address             Ibadan, Oyo State    Awka, Anambra State
UTME requirements   University rule      University rule
O-level requirements University rule      University rule
Additional note     If recorded          If recorded
```

When an individual field is absent, explain that field only:

```text
No additional note is recorded for this offering.
```

or:

```text
This requirement has not been provided for this offering yet.
```

Do not turn an absent field into a university-level warning or imply that one
university is more reliable merely because its record is fuller. Do not compare
university quality, ranking, popularity, employment, fees or demand unless
those fields are separately verified and intentionally added to the product.

## 4A. Tool comparison and preference behaviour

Tools may be compared because they can be alternatives for the same task. The
student may compare tools to form a preference without selecting a tool for the
guidance path.

```text
┌─────────────────────────────────────────────────────────────┐
│ Compare tools for statistical analysis                       │
│                                                             │
│ Choose tools to compare. This does not add them to your      │
│ guidance path.                                               │
│                                                             │
│ [✓] R             [✓] Python          [✓] SPSS              │
│                                                             │
│                    R            Python        SPSS           │
│ Best for            Statistics    Coding        Guided analysis│
│ Learning style     Code-based    Code-based    Menu-based    │
│ Common use         Analysis      Automation    Analysis      │
│                                                             │
│ [Open R learning link]                                      │
│ [Open Python learning link]                                 │
│ [Open SPSS learning link]                                   │
│                                                             │
│ [Close comparison]                                          │
└─────────────────────────────────────────────────────────────┘
```

The comparison action is separate from the selection tick:

- the tick selects a domain, subgroup, role or resource for the guidance path;
- `Compare tools` temporarily places tool options side by side;
- comparison does not save, select or recommend one tool;
- the student can leave with a preference, or no preference, without changing
  the guidance path.

Skills and competencies should not have a generic comparison feature because
they usually build on one another rather than substitute for one another. Show
their progression and relationship instead. Certifications may be compared
only when they serve the same professional purpose and the data contains
reliable provider, eligibility, scope and recognition information. Otherwise
show them as possible routes, not ranked options.

### Comparison scope for the Sociology pilot

Comparison is a decision aid, not another layer of guidance. The pilot must
not add a universal `Compare everything` screen. The comparison action appears
only when the current data contains at least two items that serve the same
purpose and can be described fairly.

The comparison hierarchy is:

```text
University offerings       first-class comparison in the programme flow
Tool alternatives           contextual comparison inside a subgroup or role
Skills                      show sequence and prerequisites, not side-by-side ranking
Competencies                show the skills, methods and tools that combine into them
Certifications              compare only equivalent routes with source-backed details
```

Tools may be compared when they support the same task. For example, R, Python,
SPSS and SAS may be placed side by side for a statistical-analysis task when
the mapping and links support that grouping. The comparison should explain
purpose, working style, relationship to other skills, compatible workflows and
the individual learning/documentation link for each tool. It must not say that
one tool is universally best, required or more employable.

Skills should normally be rendered as a learning order: build first, build
next, then specialise. A student should not be asked to choose between
`research design` and `data analysis` as if one replaces the other. If two
skills are genuine alternatives for the same outcome, the product may use an
inline `See alternatives` interaction, but it must not create a standalone
skills-comparison destination.

Competencies are outcomes created by combining knowledge, skills, methods and
judgment. They are therefore explained through their ingredients and the work
they support, not compared as competing products. A competency card should
show its connected skills, possible tools and any qualification route, each
with its own specific link.

Certifications may be compared only where the records describe equivalent
professional or learning routes. The comparison must show the provider,
purpose, entry or eligibility conditions, scope, whether it is a licence or an
optional development route, and the source link. Unrelated certificates must
remain separate possible routes. No certification should be ranked from
incomplete records.

For the Sociology student flow, only university comparison and contextual tool
comparison are first-class interactions. Skills, competencies and
certifications remain connected explanatory cards. This keeps the student
focused on choosing a university, understanding the field and selecting a
domain → subgroup → role path rather than making unnecessary comparisons.

## 5. University-aware programme overview

After the student selects a university, the programme screen changes from
preview to full programme overview.

There should not be a separate `Requirements` tab in this guided flow.

```text
┌─────────────────────────────────────────────────────────────┐
│ Sociology at the University of Ibadan (UI)                 │
│ Ibadan, Oyo State                                          │
│                                                             │
│ [Overview]                         [Universities]            │
├─────────────────────────────────────────────────────────────┤
│ Your selected university                                    │
│                                                             │
│ University of Ibadan (UI) offers Sociology as a Bachelor   │
│ of Science programme.                                      │
│                                                             │
│ Admission information for this choice                       │
│                                                             │
│ National subject guidance                                  │
│ These are the subjects generally used to check whether your │
│ secondary-school subject combination points towards this     │
│ programme. They provide the national starting point.         │
│                                                             │
│ This university's requirements                              │
│ This university may ask for the same subjects, or may add,   │
│ remove or describe a subject differently. These are the      │
│ rules attached specifically to this offering.                │
│                                                             │
│ Additional university note                                 │
│ Any extra condition or exception recorded for this          │
│ university appears here in plain language.                  │
│                                                             │
│ Reference: JAMB brochure / official university offering     │
│                                                             │
│ [Change university]                                         │
├─────────────────────────────────────────────────────────────┤
│ What Sociology is about                                     │
│                                                             │
│ Sociology helps you understand how people live together,    │
│ how institutions affect everyday life and why societies     │
│ change.                                                     │
│                                                             │
│ [Continue to what you will study]                           │
└─────────────────────────────────────────────────────────────┘
```

The explanation of national versus university-specific subjects is essential:

```text
National subject guidance
The general subject pattern used as the starting point for this programme.

University-specific requirements
The exact subject rule recorded for the university offering you selected.

Why both are shown
Universities can apply a more specific version of a general programme rule.
The national rule helps identify possible programmes; the university rule
confirms what that particular institution records for its offering.
```

The student should not be expected to understand “national layer”, “offering
exception” or “typed rule”. Those are internal terms.

Full admission details can expand inline from this overview. They should not
force the student into a separate tab or a different route.

### 5A. How national and university requirements are combined

The student sees one understandable requirement card, but the two evidence
layers remain visibly distinct:

```text
How to read these requirements

National programme guidance
This is the general subject pattern used to identify whether your subjects
point towards Sociology across Nigerian universities.

This university's exact requirement
This is the rule recorded for the Sociology offering at the University of
Ibadan (UI). It is the rule to use when you are considering this university.

Why both are shown
The national guidance helps find possible programmes. Universities can apply
their own version of that rule, including a different subject choice or an
additional condition. The university-specific rule therefore takes priority
for this offering.
```

The UI must synthesize the two records into a readable explanation without
silently replacing one with the other. It must show:

1. the national UTME/O-level rule, when a verified matchable national rule
   exists;
2. the exact offering-level UTME/O-level rule, when recorded;
3. the difference between them, in plain language;
4. any additional university note; and
5. the source label, such as `JAMB brochure` or the named official university
   source, without exposing parser or database terminology.

When a rule uses a grouped phrase such as `three Social Science subjects`,
`three Arts subjects`, `one Science subject`, or `three other relevant
subjects`, expand the group into the verified subject pool from
`subject_catalog` and the associated parsed rule record. Show the names as
choices, for example:

```text
Three Social Science subjects
Choose any three from the subjects accepted in this pool:
Economics · Government · Geography · Commerce · Accounting

Your selected subjects: Economics · Government
You still need one more subject from this pool.
```

The example list above is illustrative only; production output must come from
the applicable rule's subject references. If `relevant subject` is not resolved
to a verified pool for that programme/offering, do not invent a list. Show
`The brochure names relevant subjects, but the accepted pool is still being
verified` and keep the rule out of eligibility matching until resolved.

The selected student's subjects may be highlighted against both layers so the
student can see why a national match does or does not satisfy the selected
university. SS1 and SS2 may see the requirement explanation after choosing a
university, but their flow does not require JAMB/UTME input before that point.

## 6. Programme curriculum: the student-facing structure

The programme page should answer:

- What is Sociology?
- What will I study?
- What will I learn to do?
- How do the parts fit together?
- What can I read or learn next?

It should not present a raw extraction of every curriculum sentence.

```text
┌─────────────────────────────────────────────────────────────┐
│ What you will study in Sociology                            │
│                                                             │
│ Sociology combines the study of people and society with     │
│ ideas, research methods and the ability to use evidence     │
│ when thinking about social problems.                         │
│                                                             │
│ The programme moves from understanding social life, to       │
│ explaining it, investigating it and communicating what you   │
│ find.                                                       │
└─────────────────────────────────────────────────────────────┘
```

### People and society

```text
┌─────────────────────────────────────────────────────────────┐
│ People and society                                          │
│                                                             │
│ You will learn to explain how people, families, groups,      │
│ communities and institutions shape social life. You will     │
│ also examine culture, inequality, social problems and the     │
│ ways societies change.                                      │
│                                                             │
│ Questions this helps you explore:                           │
│ Why do communities develop different ways of living?        │
│ How do families and institutions influence people?           │
│ Why do some inequalities continue while others change?       │
│                                                             │
│ [See how this part of the programme is taught]              │
└─────────────────────────────────────────────────────────────┘
```

### Ideas and foundations

```text
┌─────────────────────────────────────────────────────────────┐
│ Ideas and foundations                                       │
│                                                             │
│ You will learn to explain the ideas Sociology uses to        │
│ understand why societies hold together, change or experience │
│ conflict. You will meet important thinkers, compare theories │
│ and connect explanations to real social situations.           │
│                                                             │
│ You will learn to:                                          │
│ • define important sociological concepts                    │
│ • compare different explanations                             │
│ • connect theories to examples from social life              │
│                                                             │
│ [See how this part of the programme is taught]              │
└─────────────────────────────────────────────────────────────┘
```

### Research and evidence

```text
┌─────────────────────────────────────────────────────────────┐
│ Research and evidence                                       │
│                                                             │
│ You will learn to turn a question about society into a       │
│ careful investigation. This means deciding what you want to   │
│ understand, choosing a suitable method, gathering information,│
│ checking its quality and explaining what the evidence can and │
│ cannot show.                                                  │
│                                                             │
│ You will learn to:                                          │
│ • frame a research question                                 │
│ • choose interviews, surveys, observation or other methods   │
│ • collect and organise information                           │
│ • use quantitative or qualitative analysis                    │
│ • respect research ethics                                   │
│ • write and present findings clearly                         │
│                                                             │
│ [See how this part of the programme is taught]              │
└─────────────────────────────────────────────────────────────┘
```

### Technology and information

```text
┌─────────────────────────────────────────────────────────────┐
│ Technology and information                                   │
│                                                             │
│ You will learn to use computer applications and online       │
│ information sources to support study and research. The        │
│ curriculum does not make one software brand a universal       │
│ requirement.                                                  │
│                                                             │
│ [See how this supports Sociology]                            │
└─────────────────────────────────────────────────────────────┘
```

### Applying what you learn

```text
┌─────────────────────────────────────────────────────────────┐
│ Applying what you learn                                     │
│                                                             │
│ You will learn to use sociological ideas and evidence to      │
│ explain social problems, discuss possible responses and       │
│ communicate your reasoning through essays, proposals,        │
│ presentations and research reports.                           │
│                                                             │
│ [See how this is used in the programme]                     │
└─────────────────────────────────────────────────────────────┘
```

### Other programme topics

The miscellaneous outcome group should not be displayed as a large “Other”
dump. Its useful material should be placed into the appropriate explanation.
For example, Nigerian society, culture, politics, language, philosophy,
entrepreneurship or environmental content should be shown only where it
meaningfully supports the relevant Sociology explanation. Unrelated course
variants and LIS-specific exceptions must not leak into the Sociology page.

## 7. Curriculum learning path

The programme learning sequence should be visible as a connected path:

```text
Understand people and society
          ↓
Learn sociological ideas and explanations
          ↓
Ask questions about social life
          ↓
Choose methods and gather evidence
          ↓
Analyse and evaluate what you find
          ↓
Communicate and apply your understanding
```

This turns curriculum outcomes into an actionable explanation without claiming
that the student already possesses the skills.

The phrase `What this means for you` may be used only if followed by a real
explanation. The preferred labels are:

- `What you will study`
- `What you will learn to do`
- `Questions this helps you explore`
- `How this is used`

## 8. Curriculum evidence interaction

The current `Search this theme` experience is not appropriate for students. It
exposes source extraction rather than explaining Sociology.

Clicking `See how this part of the programme is taught` should open a clear
drawer or full-screen sheet containing a restructured learning path:

```text
┌─────────────────────────────────────────────────────────────┐
│ Research and evidence                              [Close]   │
├─────────────────────────────────────────────────────────────┤
│ What you learn here                                         │
│                                                             │
│ You learn how to investigate social questions systematically  │
│ instead of relying only on opinion.                          │
│                                                             │
│ The learning path                                            │
│                                                             │
│ 1. Frame a question                                         │
│    Decide what you want to understand.                       │
│                                                             │
│ 2. Choose a method                                           │
│    Select a suitable way to gather information.               │
│                                                             │
│ 3. Gather and organise information                           │
│    Work with interviews, surveys, records or observations.    │
│                                                             │
│ 4. Analyse and evaluate                                      │
│    Look for patterns and consider the limits of the evidence. │
│                                                             │
│ 5. Explain the findings                                      │
│    Present a clear and responsible conclusion.                │
│                                                             │
│ Reference: CCMAS Sociology curriculum                        │
│ Reworded for clarity from the recorded curriculum outcomes.  │
└─────────────────────────────────────────────────────────────┘
```

For students, the reference can be a single unobtrusive link or label:

```text
Reference: CCMAS Sociology curriculum
```

Students do not need:

- `Search this theme`;
- numbered raw source phrases;
- a source-wording search field;
- `View selected source wording`;
- `View curriculum source` as a primary action;
- a long list of raw outcomes;
- database record counts.

Educators and administrators may have a separate evidence view, with the raw
wording structured by course, outcome group and source locator. That evidence
view must still remove duplication, preserve exceptions correctly and avoid
mixing unrelated programmes.

## 9. Replacing “Ways of working the curriculum supports”

The current section mixes programme abilities, English, philosophy,
environmental studies, entrepreneurship, peace and security, and other raw
records. It should become four explanatory cards:

```text
┌─────────────────────────────────────────────────────────────┐
│ How you will use what you learn                             │
├─────────────────────────────────────────────────────────────┤
│ Understand and explain                                      │
│ You will learn to explain how people, groups and institutions│
│ shape social life.                                           │
│                                                             │
│ Investigate responsibly                                     │
│ You will learn to ask questions, choose methods, use evidence│
│ and respect research ethics.                                │
│                                                             │
│ Think critically                                             │
│ You will learn to compare explanations, assess evidence and  │
│ recognise limits.                                            │
│                                                             │
│ Communicate and apply                                       │
│ You will learn to present findings clearly through discussion,│
│ essays, proposals, presentations and research reports.       │
└─────────────────────────────────────────────────────────────┘
```

The student area does not need a link called `See the curriculum evidence
behind these abilities`. The four cards can carry the unobtrusive reference
`Reworded from the CCMAS Sociology curriculum`.

## 9A. Programme curriculum ownership and data-quality gate

The current Sociology output shows a probable ownership problem: the `Ways of
working the curriculum supports` material contains Sociology abilities mixed
with English, philosophy, environmental studies, entrepreneurship, peace and
security, and other records. The product must not assume that every row
returned with a programme response belongs in that programme's student-facing
explanation.

Before the Sociology surface is accepted, audit every outcome and ability
against its source context. Each row must retain:

- the canonical programme ID;
- the CCMAS programme name;
- course code and course title;
- source document and page or locator;
- whether the course is programme-specific, a shared university course, or a
  distinct programme exception;
- the outcome group supplied by the source;
- the normalized presentation category;
- the source-to-programme confidence or validation result; and
- an explicit `student_display` decision.

The audit must enforce these rules:

1. A Sociology outcome can enter Sociology's programme explanation only when
   its programme and source context resolve to Sociology.
2. A distinct course version, such as an LIS-specific GST exception, must not
   appear on Sociology's page.
3. A generic GST or university-wide course must not silently become a
   Sociology-specific skill. It is either shown separately as common study,
   where the product deliberately supports that concept, or excluded from the
   programme overview.
4. A raw phrase that cannot be assigned to a programme with reliable source
   context remains evidence-only and is not used to write a student claim.
5. Duplicate outcomes are consolidated for the student explanation while all
   source locators remain available to educators and administrators.
6. No shared UI component may use Sociology-specific wording for another
   programme. Programme explanations, learning stages and examples must come
   from the resolved programme data or from a programme-specific synthesis
   contract.

The student-facing contract must provide separate, provenance-aware groups:

```text
programmeStudyAreas
  What the programme studies, synthesized from verified curriculum content

programmeLearningSequence
  The order in which the programme develops understanding and application

programmeAbilities
  What the curriculum asks the student to practise or produce

programmeMaterials
  Specific books, open texts or learning links attached to the explanation

programmeEvidence
  Compact CCMAS reference for students; structured raw wording for staff only
```

`programmeAbilities` replaces the raw `Ways of working the curriculum
supports` block. It must be synthesized into explanatory cards such as:

```text
How you will use what you learn

Understand and explain
You will learn to explain how people, groups and institutions shape social
life.

Investigate responsibly
You will learn to ask questions, choose suitable methods, use evidence and
respect research ethics.

Think critically
You will learn to compare explanations, assess evidence and recognise limits.

Communicate and apply
You will learn to present findings clearly through discussion, essays,
proposals, presentations and research reports.
```

These cards must be generated only from validated Sociology abilities. They
must not claim that the student already has the ability, guarantee employment,
or turn a generic course outcome into a Sociology-specific capability.

The raw evidence view for educators and administrators must be organized by
programme, course and outcome group. It must show why a row was included or
excluded, preserve source locators and identify exceptions. It must not be the
same component or interaction as the student preview.

### Required Sociology data checks before implementation sign-off

The QA pass must include:

- a complete list of Sociology outcomes grouped by course and source;
- a list of excluded generic, cross-programme and exception rows with reasons;
- a check that no LIS-specific, unrelated or neighbouring programme wording
  appears in Sociology's student response;
- a check that the five learning stages are supported by the remaining
  Sociology curriculum rather than invented from role data;
- a check that each student-facing material link is attached to the statement
  it supports; and
- a negative test opening another programme after Sociology to prove that its
  explanations, abilities and examples do not remain in shared component
  state.

If this audit does not pass, the UI must show only the verified summary rather
than displaying the unresolved rows. The unresolved records remain available
to the staff evidence workflow for correction.

## 10. Programme learning materials

The programme should show useful materials beside the explanation they support.
The action should be specific and honest:

```text
┌─────────────────────────────────────────────────────────────┐
│ Learn more about Sociology                                  │
│                                                             │
│ Sociology: Themes and Perspectives                          │
│ Helps you understand the main ideas used to study society.   │
│                                                             │
│ Reference or learning material                              │
│ [Open material]                                             │
│                                                             │
│ Introduction to Social Research                             │
│ Helps you understand how questions, evidence and methods     │
│ fit together.                                               │
│                                                             │
│ Reference or learning material                              │
│ [Open material]                                             │
└─────────────────────────────────────────────────────────────┘
```

Only verified, specific links should be included. A generic homepage must not
be described as a complete course. A missing URL should not produce a fake
`Try activity` action.

Each material must state what it is for:

- `Read this to understand the field`;
- `Use this to learn research methods`;
- `Use this to explore sociological theory`;
- `Use this to understand a tool`.

## 11. Domain screen: Social Sciences

The domain page should explain the field before presenting its subgroups.
Domain-owned foundations, skills, tools, competencies and certifications come
before areas to explore because they explain what the field has in common.

```text
┌─────────────────────────────────────────────────────────────┐
│ Social Sciences                                             │
│                                                             │
│ [Overview]                 [Build in this domain]            │
├─────────────────────────────────────────────────────────────┤
│ What are Social Sciences?                                   │
│                                                             │
│ Social Sciences study how people live together and how       │
│ families, communities, organisations, governments and        │
│ institutions affect people’s lives.                         │
│                                                             │
│ The field looks at behaviour, culture, relationships, work,  │
│ politics, inequality, crime, development and social change.  │
│ It uses observation, interviews, surveys, records, statistics│
│ and other forms of evidence to understand what is happening  │
│ and why.                                                     │
│                                                             │
│ What kinds of questions can it help you explore?             │
│                                                             │
│ • How are societies organised?                              │
│ • How do families, communities and institutions influence    │
│   people’s opportunities and choices?                        │
│ • Why do inequality, crime or other social problems develop? │
│ • How do culture, politics and economics affect social life? │
│ • How do societies respond to change?                       │
│ • How can evidence help people make better decisions?        │
│                                                             │
│ Where does Sociology fit?                                   │
│                                                             │
│ Sociology is one programme within the wider Social Sciences  │
│ field. It focuses especially on groups, institutions, culture,│
│ social relationships, social problems, social change and      │
│ research.                                                    │
│                                                             │
│ [Learn more about Social Sciences]                           │
└─────────────────────────────────────────────────────────────┘
```

The `Learn more about Social Sciences` action should point to the domain’s
full overview, not to a generic Explore home route.

The domain page should not show:

- a flat list of roles;
- `Local context` as a large section;
- `Context that supports this guidance`;
- repeated `Sources checked` lists;
- `no_direct_local_counterpart`;
- role-derived prevalence as the domain foundation;
- generic software categories presented as named tools;
- a large list of unrelated Nigerian source descriptions.

## 12. Domain foundation and progression

```text
┌─────────────────────────────────────────────────────────────┐
│ What to build first                                         │
│                                                             │
│ 1. Understand people and institutions                       │
│    Learn how groups, families, communities and organisations  │
│    shape social life.                                        │
│                                                             │
│ 2. Ask useful questions                                      │
│    Turn curiosity about society into a question that can be   │
│    investigated.                                             │
│                                                             │
│ 3. Work with evidence                                        │
│    Gather, assess and interpret information responsibly.      │
│                                                             │
│ 4. Explain what you find                                     │
│    Communicate evidence, uncertainty and possible meanings.  │
│                                                             │
│ The Sociology programme gives you a related foundation.      │
│ This domain layer shows what continues across Social         │
│ Sciences and what you can add next.                           │
└─────────────────────────────────────────────────────────────┘
```

Better wording for the evidence note:

```text
Why this appears
These foundations continue from the connected programme curriculum and the
domain’s own source-backed learning records. They describe the common base of
Social Sciences before you choose a more focused area.
```

If a foundation evidence record has a verified learning link, the link belongs
on that foundation card. If it has no link, the student does not need to see a
separate foundation-evidence block.

## 13. Domain skills, competencies, tools and certifications

These should flow from the foundation rather than appear as disconnected lists.

```text
┌─────────────────────────────────────────────────────────────┐
│ How the foundation is used                                  │
├─────────────────────────────────────────────────────────────┤
│ Skill: Frame a research question                             │
│ Turns a broad social issue into a question that can be        │
│ investigated.                                                │
│                                                             │
│ Works with: research design, interviews, surveys and          │
│ evidence evaluation.                                         │
│                                                             │
│ [Open learning material]                                    │
├─────────────────────────────────────────────────────────────┤
│ Competency: Evaluate evidence responsibly                     │
│ Helps you judge whether information is reliable, limited,     │
│ incomplete or affected by context and bias.                  │
│                                                             │
│ Works with: research ethics, data collection and clear        │
│ communication.                                               │
│                                                             │
│ [Open competency reference]                                  │
├─────────────────────────────────────────────────────────────┤
│ Tool options: organise and analyse information                │
│ Excel and SQL can help organise data. R, SPSS, SAS, Stata and │
│ Python can support different kinds of analysis. Qualtrics and │
│ REDCap can support data collection where appropriate.         │
│                                                             │
│ These are alternatives for different tasks, not a list of     │
│ tools every student must learn.                              │
│                                                             │
│ [Open Excel guide] [Open R guide] [Open Python guide]         │
└─────────────────────────────────────────────────────────────┘
```

The links belong beside the item they explain. There should not be one generic
`Open verified learning links` button at the bottom.

Tool options should be grouped by purpose:

- organise and prepare information;
- collect information;
- analyse quantitative information;
- analyse qualitative information;
- visualise or map information;
- write and present findings.

Named tools should appear only where the source-backed record actually supports
them. Generic classifications such as `Spreadsheet software` or `Analytical or
scientific software` are evidence categories, not student recommendations.

The domain page can explain tool relationships with a small sequence:

```text
Research question
      ↓
Method and data collection
      ↓
Data organisation
      ↓
Analysis tool or method
      ↓
Visualisation and interpretation
      ↓
Report or presentation
```

This explains why Excel is not the only tool, why Python is not automatically
the only tool, and why different tools can be alternatives at different stages.

If no domain-wide certification requirement is supported, show:

```text
Qualifications and professional routes

No domain-wide certification requirement is recorded for Social Sciences.
Academic, professional-development or discipline-specific requirements may
vary by employer and work setting.

[Open qualification reference]
```

Professional or research organisations must not be presented as mandatory
certifications unless the source establishes an actual requirement.

## 14. Domain Build tab

Build is separate from domain learning and career guidance.

```text
┌─────────────────────────────────────────────────────────────┐
│ Social Sciences                                             │
│                                                             │
│ [Overview]                 [Build in this domain]            │
├─────────────────────────────────────────────────────────────┤
│ What could you build from this domain?                      │
│                                                             │
│ This space is for projects, services or ventures connected   │
│ to Social Sciences. It is separate from what the field       │
│ studies and from the roles organised under its subgroups.    │
│                                                             │
│ Where verified build records exist, they may describe        │
│ research services, community projects, education tools or    │
│ evidence-based programmes.                                  │
│                                                             │
│ [Explore build ideas]                                       │
│                                                             │
│ If no verified build records exist:                          │
│ Build ideas have not been added for this domain yet.         │
└─────────────────────────────────────────────────────────────┘
```

The Build tab must not be filled with invented projects merely to occupy space.

## 15. Subgroup screen: Computational Social Science

```text
┌─────────────────────────────────────────────────────────────┐
│ Social Sciences                                             │
│   → Computational Social Science and Quantitative Methods    │
│                                                             │
│ [Overview]                                                   │
├─────────────────────────────────────────────────────────────┤
│ What is this area?                                          │
│                                                             │
│ This area combines social questions with statistics, data,   │
│ network analysis and computation. It helps investigate        │
│ patterns in people, populations and organisations.           │
│                                                             │
│ What does it add to Social Sciences?                        │
│                                                             │
│ Social Sciences foundation                                  │
│ Understand society, ask questions, use evidence and explain  │
│ what the evidence means.                                     │
│                                                             │
│ Added focus                                                  │
│ Quantitative reasoning, statistics, research data management, │
│ modelling, network analysis and computational methods.        │
│                                                             │
│ What can the work produce?                                  │
│                                                             │
│ Datasets, statistical analyses, models, visualisations and   │
│ research reports.                                            │
└─────────────────────────────────────────────────────────────┘
```

### Subgroup continuation from programme and domain

```text
┌─────────────────────────────────────────────────────────────┐
│ Continue from what you already understand                    │
│                                                             │
│ From Sociology                                               │
│ You have encountered people, society, research questions,    │
│ evidence and research methods.                               │
│                                                             │
│ From Social Sciences                                         │
│ You have a foundation in social investigation, evidence,      │
│ ethics and communicating findings.                            │
│                                                             │
│ Add in this area                                             │
│ Build quantitative reasoning, statistics, data handling,     │
│ computation, modelling and social network analysis.           │
└─────────────────────────────────────────────────────────────┘
```

The subgroup must inherit the relevant domain foundation without duplicating
the entire domain page. New subgroup capabilities should be labelled as added
focus, not as replacements for the foundation.

### Subgroup tools and relationships

```text
┌─────────────────────────────────────────────────────────────┐
│ Tools as options for different tasks                          │
├─────────────────────────────────────────────────────────────┤
│ Organise and query data                                      │
│ SQL · Excel                                                  │
│ Use these to structure, inspect and prepare information.      │
│ [Open SQL learning link] [Open Excel learning link]          │
│                                                             │
│ Statistical analysis                                         │
│ R · SPSS · SAS · Stata                                      │
│ Use these for different statistical workflows and analyses.   │
│ [Open R learning link] [Open SPSS learning link]             │
│                                                             │
│ Programming and computation                                  │
│ Python · R · Apache Spark                                   │
│ Use these when the work needs programming, automation,        │
│ larger-scale processing or computational analysis.            │
│ [Open Python learning link]                                 │
│                                                             │
│ Data collection                                              │
│ Qualtrics · REDCap                                          │
│ Use these where the research design requires structured        │
│ data collection.                                             │
│ [Open tool learning link]                                   │
│                                                             │
│ These tools are alternatives for different tasks. No single  │
│ tool is required for every route through this area.           │
└─────────────────────────────────────────────────────────────┘
```

The subgroup page should explain the working relationship:

```text
Social question → research design → data collection → data preparation
→ statistical or computational analysis → interpretation → report
```

If the subgroup has no dedicated resource records, do not pretend there is a
complete subgroup-specific course catalogue. Use a small, honest notice:

```text
No dedicated learning catalogue is recorded for this area yet.
Verified domain or role resources are shown only where their connection is
explicit.
```

The notice belongs beside the resource area, not as a “locked” page state.

### Roles inside the subgroup

```text
┌─────────────────────────────────────────────────────────────┐
│ Roles connected to this area                                │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Statistician                                            │ │
│ │ Uses quantitative information to identify patterns,       │ │
│ │ assess uncertainty and support decisions.                 │ │
│ │                                                         │ │
│ │ [Explore role]                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [See other roles in this area]                             │
└─────────────────────────────────────────────────────────────┘
```

Roles are not independent of subgroups. A role is displayed inside the
subgroup that owns or supports its mapping. An unassigned role is a data-quality
issue and must not appear as a flat fallback list.

## 16. Role screen: Statistician

```text
┌─────────────────────────────────────────────────────────────┐
│ Statistician                                                │
│ Computational Social Science and Quantitative Methods       │
│                                                             │
│ What does this role involve?                                │
│                                                             │
│ Statisticians collect, organise and analyse numerical        │
│ information. They look for patterns, explain uncertainty     │
│ and help people make decisions using evidence.                │
│                                                             │
│ Where might this work be used?                              │
│                                                             │
│ Health, demographics, finance, business, research and        │
│ public policy. These are application areas, not guarantees    │
│ of employment.                                               │
│                                                             │
│ Typical outputs                                             │
│ Analyses, models, visualisations, interpreted findings and   │
│ reports.                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Role learning path

```text
┌─────────────────────────────────────────────────────────────┐
│ What to build for this role                                 │
├─────────────────────────────────────────────────────────────┤
│ Build first                                                │
│ Mathematics, statistics, research design and data handling.  │
│                                                             │
│ Build next                                                 │
│ Frame a question, choose a suitable method, interpret        │
│ uncertainty and communicate findings clearly.                │
│                                                             │
│ Specialise later                                           │
│ Statistical modelling, mathematical modelling, simulation,   │
│ biometrics, market research and network analysis.             │
│                                                             │
│ Each item is linked to the relevant learning or reference    │
│ material when a verified link exists.                        │
└─────────────────────────────────────────────────────────────┘
```

### Role skills, competencies, tools and qualifications together

The role should synthesize these rather than display four disconnected lists.

```text
┌─────────────────────────────────────────────────────────────┐
│ How the work fits together                                  │
├─────────────────────────────────────────────────────────────┤
│ 1. Skill: frame the question                                │
│    Decide what needs to be measured, compared or estimated.   │
│    [Open skill learning material]                            │
│                                                             │
│ 2. Competency: choose and defend a method                    │
│    Match the method to the question, evidence and limitations.│
│    [Open competency reference]                               │
│                                                             │
│ 3. Tool options                                              │
│    Python, R, SPSS, SAS, Excel, Power BI and other tools may  │
│    support preparation, analysis or presentation.              │
│    [Open Python guide] [Open R guide] [Open SPSS guide]        │
│                                                             │
│ 4. Professional practice                                    │
│    Explain assumptions, uncertainty, limitations and ethical   │
│    responsibilities.                                          │
│    [Open professional reference]                              │
│                                                             │
│ 5. Output                                                   │
│    Produce an analysis, model, visualisation or report that    │
│    another person can understand and use.                     │
└─────────────────────────────────────────────────────────────┘
```

The role tools should be shown as alternatives, not as a hierarchy in which
Microsoft tools automatically dominate. Python, R, SPSS and SAS can be shown
together as different ways of supporting statistical work.

Certifications and qualifications should be synthesized into the same route:

```text
┌─────────────────────────────────────────────────────────────┐
│ Qualifications and professional routes                       │
│                                                             │
│ The available evidence does not establish one universal      │
│ certification required for every Statistician route.         │
│                                                             │
│ Academic, professional-development or discipline-specific    │
│ requirements may vary by employer and work setting.           │
│                                                             │
│ [Open qualification information]                             │
└─────────────────────────────────────────────────────────────┘
```

The action is one contextual link on the qualification explanation. There is
no need for a separate generic `See evidence` button beside every item.

## 17. Source and local-context presentation

Source evidence remains important, but the user should not see the internal
data model.

The current domain display should not render large blocks headed:

- `How this guidance is supported`;
- `Local context`;
- `Sources checked`;
- `Context that supports this guidance`;
- `Local evidence`;
- `Field context`;
- `no_direct_local_counterpart`.

Those are internal evidence states. They should be transformed into one short
reason attached to the relevant item:

```text
Research design

Helps you decide how to investigate a question and how to gather evidence that
can support a careful conclusion.

Used with: interviews, surveys, observation, data analysis and reporting.

Why it appears: supported by the Sociology curriculum and source-backed
research-methodology evidence.

[Open the learning/reference material]
```

The final action is one link, not two separate actions:

```text
[Open the learning/reference material]
```

If a source is needed for an educator or administrator, the compact evidence
panel can say:

```text
Evidence behind this explanation

Curriculum evidence
CCMAS Sociology research-methodology outcomes.

Practice or professional evidence
The specific source-backed research-methodology record attached to this item.

Evidence limit
This supports the importance and use of the method. It does not establish one
software package, job title, salary, employment guarantee or universal licence.
```

The domain layer must use domain-owned records and curriculum evidence. Role
evidence can support internal validation, but role-derived frequencies and
role-only context must not define what every Social Sciences student should
learn.

## 18. Progressive ownership rules

The same shape applies to every programme, domain, subgroup and role, while the
content remains specific to that entity.

```text
Programme
  programme description
  programme curriculum and outcomes
  programme learning sequence
  programme learning materials
  university-specific admission information after selection

Domain
  domain meaning
  domain foundation
  domain-owned skills, tools, competencies and qualifications
  domain learning links
  domain Build tab
  mapped subgroups

Subgroup
  subgroup meaning
  inherited domain foundation
  subgroup additions
  subgroup-specific skill/tool/competency relationships
  subgroup learning links
  roles belonging to the subgroup

Role
  role meaning and work
  inherited subgroup and domain foundation
  role-specific additions
  role outputs and application contexts
  role tool/skill/competency/qualification relationships
  role learning links
```

The page should always make the continuation visible:

```text
What you have already encountered
        ↓
What this level adds
        ↓
How the new items work together
        ↓
What you can learn next
```

This prevents the student from thinking that a tool list is a checklist or that
a role-specific item is required at every level.

## 18A. Programme-specific domain connection contract

The mapping type belongs to the relationship between a programme and a domain;
it does not permanently belong to the domain.

The same domain can be `direct` for one programme, `functional` for another or
`adjacent` for a third. It can also be direct for two different programmes while
requiring two different explanations.

Every programme-to-domain transition must therefore be resolved with:

- the selected programme;
- the selected domain;
- the mapping type;
- the programme curriculum and outcomes that support the connection;
- the domain foundation that overlaps;
- the capabilities that carry forward;
- the capabilities the student may need to add;
- any source-backed qualification or professional boundary relevant to that
  specific connection.

The domain itself remains stable. The connection explanation, inherited
foundation and `what to add next` are programme-specific.

The domain page must begin with a contextual connection card when it was opened
from a programme:

```text
┌─────────────────────────────────────────────────────────────┐
│ Why Legal is connected to Sociology                         │
│                                                             │
│ Direct connection                                          │
│                                                             │
│ Sociology connects directly to Legal because its curriculum  │
│ examines social institutions, crime, inequality, family,     │
│ governance and how societies create and apply rules.         │
│                                                             │
│ What carries over                                           │
│ Social research, institutions, social problems and evidence. │
│                                                             │
│ What you may need to add                                    │
│ Legal theory, legal systems and the relevant professional    │
│ training.                                                   │
│                                                             │
│ This explanation is based on the Sociology curriculum and    │
│ the specific Sociology-to-Legal mapping. It does not mean    │
│ Sociology and Law teach the same content.                    │
└─────────────────────────────────────────────────────────────┘
```

If the same domain is opened from Law, it must not reuse the Sociology copy:

```text
┌─────────────────────────────────────────────────────────────┐
│ Why Legal is connected to Law                               │
│                                                             │
│ Direct connection                                          │
│                                                             │
│ Law connects directly to Legal because its curriculum is     │
│ centred on legal principles, legal reasoning, legal systems  │
│ and the interpretation and application of law.                │
│                                                             │
│ What carries over                                           │
│ Legal knowledge, reasoning and legal analysis.               │
│                                                             │
│ What you may need to add                                    │
│ The relevant professional training and qualification route.  │
│                                                             │
│ This explanation is based on the Law curriculum and the       │
│ specific Law-to-Legal mapping.                               │
└─────────────────────────────────────────────────────────────┘
```

The same structure applies to every mapping type:

```text
Why [Domain] is connected to [Programme]

[Direct / Functional / Adjacent] connection

This connection is based on [Programme]’s curriculum and the specific
[Programme]-to-[Domain] mapping.

What carries over
[Only the capabilities supported by this programme-to-domain relationship.]

What you may need to add
[Only the source-backed capabilities that are outside the programme’s
curriculum but relevant to the domain foundation.]
```

The wording must explain the mapping rather than merely display the label:

- `Direct` means the programme curriculum overlaps with the domain’s central
  knowledge and capabilities.
- `Functional` means the programme develops capabilities that can be applied in
  the domain, even though the domain is not the programme’s central subject
  area.
- `Adjacent` means the programme has a supported nearby connection, but the
  student would need additional domain learning before treating it as a main
  direction.

These are relationship descriptions, not claims about student ability,
readiness, employment, demand or automatic professional eligibility.

The explanation must be generated from the actual programme curriculum and the
validated mapping evidence. It must not be copied from a generic domain
description, generated from a role-frequency percentage or inferred from the
domain name alone.

## 18B. Item-level link and competency contract

Every individual skill, tool, competency, certification or learning material
shown to a user must have its own specific verified link when one exists. A
generic shared `learning resources` link is not sufficient.

The link must explain the item shown:

- a skill links to a specific learning or skill-reference page;
- a tool links to its official documentation or a specific learning page;
- a competency links to a specific framework, learning path or reference that
  explains how to develop or understand it;
- a certification links to the official provider, eligibility or qualification
  information;
- a book or curriculum material links to the actual book, publisher, open text
  or source page being referenced.

If a verified item-specific link does not exist, show an honest state:

```text
No verified learning link is available for this item yet.
```

Do not attach a generic homepage, unrelated course or shared resource URL just
to make the card appear complete.

Competency is not a synonym for skills, tools and certifications. It is a
higher-level ability to combine knowledge, skills, methods and judgment to
produce an outcome. A certification may provide evidence of training or
qualification, but it does not automatically create the competency.

The interface should keep the categories separate while showing their
relationship:

```text
┌─────────────────────────────────────────────────────────────┐
│ Competency                                                  │
│ Design and analyse a responsible social research study      │
│                                                             │
│ Uses these skills                                           │
│ Frame questions · choose methods · analyse evidence          │
│                                                             │
│ May use these tools                                         │
│ R · Python · SPSS · Excel                                  │
│                                                             │
│ May require or support                                      │
│ A relevant qualification or professional certification       │
│                                                             │
│ [Open competency learning link]                             │
│ [Open R learning link] [Open Python learning link]           │
│ [Open SPSS learning link] [Open Excel learning link]         │
│ [Open certification information]                            │
└─────────────────────────────────────────────────────────────┘
```

The relationship should be expressed as:

```text
Competency
  → uses one or more skills
  → may use one or more alternative tools
  → may be supported or evidenced by a qualification/certification
  → produces an identifiable work or learning outcome
```

A skill is a specific ability, such as `analyse survey data`. A tool is an
instrument or software option that may support the ability, such as R, Python,
SPSS or Excel. A competency combines these with knowledge, method selection,
judgment and responsible practice, such as `design and analyse a responsible
social research study`.

The student-facing order should therefore be:

```text
What you need to accomplish
        ↓
Competency
        ↓
Skills that support it
        ↓
Tool options for those skills
        ↓
Qualifications or certifications that may apply
        ↓
Linked learning and reference material for each item
```

This same contract applies at domain, subgroup and role level. Domain-owned
items appear at the domain level. Subgroup additions appear at subgroup level.
Role-specific items appear at role level. Inherited items must be labelled as
inherited rather than duplicated as if they originated at the current level.

## 18C. Free learning resources are embedded in the explanation

Free learning resources are part of the information card that they make
actionable. They are not a second, unrelated catalogue that the student must
search after reading the guidance.

For every displayed skill, tool, competency, certification or programme
material, the data and UI must follow this rule:

```text
Item name and icon
  What it is in this context
  What it is used for
  How it connects to the next skill, tool or competency
  [Open specific free learning/reference link]
  [Tick to include in guidance path, where the item is selectable]
```

The link is placed on the item itself, beside the item name or its short
explanation. It must not be moved to the bottom of the screen as one generic
`Learning resources` action. A student may open the link immediately, or open
the Sifter explanation first and then follow the link. The link target must be
the actual specific learning page, open book, official documentation,
qualification page or other reference being described.

The words `free learning resource` are used only when the linked material is
actually free to access. A source page, professional-body page, tool
documentation page and paid course are labelled according to what they are;
they must not be presented as free training merely because the page can be
opened.

The student-facing card should make the relationship visible without creating
four disconnected lists:

```text
Competency: Design and analyse a social research study
  Uses: frame questions, choose methods, analyse evidence
  May use: R, Python, SPSS or Excel
  May connect to: research-methods training or a relevant qualification

  [Open competency learning link]
  [Open R learning link] [Open Python learning link]
  [Open SPSS learning link] [Open Excel learning link]
  [Open qualification information]
```

Each link remains specific to its own item even when several items appear in
one relationship card. `Open competency learning link` must not silently open
the R, Python or Excel page. The item link should use a small external-link
icon and an accessible label that names the destination.

When a student selects `Learn more`, the product may open a compact Sifter
detail panel or a focused detail screen containing the explanation, evidence
label and link. It must not replace the link with a fabricated in-app lesson.
The student can save the item or its link to My World from that item; saving is
optional and does not interrupt multi-selection of the guidance path.

There is no requirement for a separate career-resources screen in the main
guided flow. A later Saved/My World view may organise the links the student
saved by programme, domain, subgroup, role and learning order. That view is a
retrieval surface, not a replacement for embedding the resource where the
student understands why it matters.

If no verified item-specific link exists, show the item without a misleading
link and say:

```text
No verified learning link is available for this item yet.
```

Do not attach a generic MIT OpenCourseWare homepage, an incorrect R page, a
provider homepage or an unrelated tool page to fill the gap. The Sociology
pilot must audit every displayed item and either attach the correct specific
free link, attach the correct non-free/reference link with its honest label,
or leave the link unavailable and record it in the review ledger. This rule
also applies to inherited domain and subgroup items and to every role item.

## 19. Selection, saving and completion

Selection is not the same as printing and is not represented by a large Save
button.

Use a small tick/checkbox on selectable domains, subgroups and roles:

```text
┌─────────────────────────────────────────────────────────────┐
│ Social and Economic Research                         ✓      │
│ A focused area for studying social or economic questions    │
│ through research, evidence and policy analysis.             │
└─────────────────────────────────────────────────────────────┘
```

The tick means `selected for this guidance path`. It does not mean:

- bookmarked;
- completed;
- already skilled;
- permanently saved as a separate record.

The guidance workspace should retain selections as the student moves forward.
The student can select more than one domain or subgroup and then continue once.
There is no need to save every card individually.

```text
┌─────────────────────────────────────────────────────────────┐
│ Your guidance path                                          │
│                                                             │
│ Sociology                                                   │
│ University of Ibadan (UI)                                  │
│ Social Sciences                                            │
│ Computational Social Science and Quantitative Methods        │
│ Statistician                                                │
│                                                             │
│ Your choices are held in this guidance session.              │
│ Complete the path before creating your report.               │
│                                                             │
│ [Continue]                                                  │
└─────────────────────────────────────────────────────────────┘
```

The final completion state is explicit:

```text
Guidance complete

You have selected your programme, university and guidance path.

[Print report icon] [Download report icon] [Share report icon]
```

Before completion:

```text
Finish your guidance path to unlock the report.

You can return to any step and continue from where you stopped.
```

Students should not be able to print or download an incomplete guidance report.
Educator-created reports follow the same rule for the selected student.

## 20. Report output and controls

The existing report, `Guidance report - njunu chinedu daniel.pdf`, is not user
friendly enough because it behaves like a data dump rather than the completed
story of the student’s choices.

The report should be generated only after the guidance path is complete and
should use the same hierarchy as the screens:

```text
Programme → University → Requirements → Programme learning path
          → Selected domains → Selected subgroups → Selected roles
          → Next learning steps and linked resources
```

### Report cover

```text
┌─────────────────────────────────────────────────────────────┐
│ Sifter LevelUp                                              │
│                                                             │
│ My guidance path                                            │
│                                                             │
│ Njunu Chinedu Daniel                                        │
│ SS1 · Science                                               │
│                                                             │
│ Sociology at the University of Ibadan (UI)                  │
│ Ibadan, Oyo State                                          │
│                                                             │
│ Prepared from your completed guidance choices                │
│ Date: [date]                                                │
└─────────────────────────────────────────────────────────────┘
```

### Report sections

1. **Your starting point** — student type, class, stream, school and selected
   subjects where available.
2. **Your programme and university** — the exact JAMB programme identity, full
   university name, abbreviation, address and offering.
3. **Admission information** — the plain-language national subject starting
   point, the selected university’s exact requirements and any recorded note.
4. **What you will study** — the synthesized programme explanation and ordered
   learning path, not raw CCMAS extraction.
5. **Your selected domains** — only the domains the student selected, with the
   direct/functional/adjacent relationship explained.
6. **Your selected subgroups** — only selected subgroups, with their additions
   to the domain foundation.
7. **Your selected roles** — only selected roles, with work, outputs, skills,
   tools, competencies, qualifications and linked resources.
8. **What to learn next** — ordered items with a short reason and an attached
   learning/reference link where available.
9. **References** — compact source references, including CCMAS and JAMB
   references, without exposing internal parser terminology.

### Report controls

The report page should use compact icon actions at the top right:

```text
                         [Print] [Download] [Share]
```

Each icon must have an accessible label and a small tooltip. Do not use three
large word buttons beside the selection control. Selection is represented by a
tick within the relevant card and is not placed beside report actions.

Sharing can offer email, WhatsApp, Google Drive, Dropbox and the available
system share targets. The share action must operate on the completed report and
must not imply that a report was sent until the share operation succeeds.

## 21. Empty, unavailable and incomplete data states

Remove every instance of:

```text
⊙
Locked
Domain detail is temporarily unavailable.
```

This is not an appropriate product state for a student who is following a
valid guidance path.

If a genuinely safe source-backed detail is unavailable, use an honest,
actionable state:

```text
This detail is not available yet.

We do not have enough verified information to explain this part safely.
Your programme and completed choices are still available.

[Back to programme]
```

Do not call a record “locked” when it is merely missing, pending, incomplete
or not yet loaded.

## 22. Sociology pilot implementation plan

The first implementation slice is Sociology only. It must use the actual
Sociology programme data, its real university offerings, its validated domain
connections, the Social Sciences domain, the Computational Social Science and
Quantitative Methods subgroup, and the selected role records. It must not be a
generic demonstration with invented downstream content.

### Phase 0 — Freeze the Sociology content contract

Before building the screens:

1. Resolve Sociology as one programme identity.
2. Resolve all university offerings attached to that programme.
3. Display every institution using its full name followed by its abbreviation.
4. Keep the university address with the offering.
5. Resolve the exact programme-to-domain mapping type for every displayed
   domain.
6. Resolve the domain-owned foundations separately from subgroup and role
   evidence.
7. Resolve subgroup ownership before displaying roles.
8. Resolve every displayed skill, tool, competency, certification and learning
   material with its own verified link or an honest missing-link state.
9. Exclude Direct Entry and other unsupported user-route content from this
   student experience.
10. Exclude role-aggregated records from the domain foundation.

Do not mark Phase 0 complete because the existing API returns arrays. Phase 0
is complete only when each returned item has passed the ownership and source
audit in Section 0 and the student/staff display decision is recorded.

The implementation must first create the Sociology audit artefact from the
actual repository inputs. It must include the retained rows, excluded rows,
review-only rows, duplicate decisions, source locators, ownership, mapping
edges and link validation results. The artefact is the review record for the
pilot; it is not a replacement for the source data and it must not fabricate
missing values.

The audit must then produce the cleaned student contract consumed by the API.
The UI cannot classify raw rows on the fly with a regex, a count threshold or
a Sociology-specific fallback. If the backend cannot yet expose the cleaned
contract, the pilot must remain bounded to the verified summary and the
unresolved records must be visible only in the staff review output.

The content contract must preserve the distinction between:

```text
Programme curriculum
  What the university programme teaches

Domain foundation
  What is common to the wider field

Subgroup additions
  What the focused area adds to the domain foundation

Role additions
  What the particular role uses in practice
```

### Phase 1 — Build the shared visual primitives

Use the visual language in the supplied mockups without copying their raw
content:

- compact breadcrumb and back navigation;
- one optional hero illustration for each hierarchy level;
- consistent programme, domain, subgroup and role icons;
- item-specific tool, skill and certification icons;
- tick selection controls;
- inline external-link icons beside item names;
- compact print, download and share icons only on the completed report;
- no lightning/zap artwork;
- no oversized empty areas or large action buttons for secondary actions.

The item card must support distinct actions without confusing them:

```text
┌────────────────────────────────────────────┐
│ [✓] [Python ↗]                         [›] │
│     Programming and computation             │
│     Used for data preparation and analysis.  │
└────────────────────────────────────────────┘
```

The tick selects the item for the guidance path. The item link opens the
specific external learning/reference page. The arrow opens the Sifter
explanation. None of these actions is a generic save button.

### Phase 2 — Implement the SS1 Sociology admission entry

The route must preserve the user’s class, stream, school, subjects and current
guidance checkpoint.

```text
Subjects selected
        ↓
Sociology programme preview
        ↓
Sociology university offerings
```

The preview must not route to Home or generic Explore and must not show domains
before the university is selected.

```text
┌─────────────────────────────────────────────────────────────┐
│ Sociology                                                   │
│                                                             │
│ Sociology studies how people live together, how families,   │
│ groups and institutions work, and how societies change.     │
│                                                             │
│ You may study people and society, social problems, ideas,    │
│ research and evidence, and Nigerian and African societies.  │
│                                                             │
│ [View universities]                                         │
└─────────────────────────────────────────────────────────────┘
```

### Phase 3 — Implement the university offering and comparison flow

The offering screen is a full focused guidance step. Each card contains:

- full university name;
- abbreviation in parentheses;
- city, state and address where available;
- exact programme name;
- qualification;
- `Select university` action;
- `Select for comparison` action.

The comparison screen compares the same Sociology offering across institutions.
It must not contain internal data-state labels. It compares only programme name,
qualification, address, university-specific UTME requirements, university-
specific O-level requirements and recorded additional notes.

Selecting one university continues directly to the selected-university
programme overview. Comparison is optional and does not change the selected
university until the student explicitly chooses one.

### Phase 4 — Implement the university-aware Sociology programme page

The selected-university page must show, in one natural overview:

1. university identity and address;
2. plain-language explanation of national subject guidance;
3. exact requirements for the selected university offering;
4. any offering-specific note;
5. what Sociology teaches;
6. the synthesized curriculum learning path;
7. item-level programme reading and learning links;
8. the programme-to-domain continuation action.

The student does not see a separate requirements tab. The student does not see
domain cards until this university-aware programme page has been reached.

Curriculum themes are displayed as explanatory cards. The source outcomes are
used to write the explanation but are not rendered as a raw list. The student
sees a compact CCMAS reference, not a source-search interface.

### Phase 4A — Enforce the preview boundary before rendering curriculum

The programme component must have an explicit preview state and a separate
university-aware state. Do not implement the preview by rendering the full
programme component and hiding only one or two sections. The preview payload
and the full overview payload must have separate display contracts.

In the preview state:

1. render the JAMB programme identity, short explanation, qualification and a
   small set of broad study areas when verified;
2. state that the programme is offered by several universities when the count
   is verified, without rendering the university cards;
3. show one `View universities` action that opens the offering-selection step;
4. keep university-specific requirements, curriculum details, abilities,
   resources, domain links and downstream career content out of the view; and
5. do not show `See how this part is taught` or any other deep curriculum
   action before university selection.

The `View universities` step owns the offering cards and comparison tray. A
student selects an offering there. The selection then opens the full
university-aware programme overview with the selected university's identity and
address. It must not route through Home or generic Explore.

The implementation must include a route/state test for each transition:

```text
preview → View universities → select offering → full overview → domains
```

The test must prove that a preview cannot render a domain, subgroup, role,
requirement, raw curriculum list or report action, and that a selected offering
cannot enter domain guidance without first carrying its university context.

### Phase 5 — Implement the Sociology curriculum learning path

The Sociology page must render these connected explanations:

```text
Understand people and society
          ↓
Learn sociological ideas and explanations
          ↓
Ask questions about social life
          ↓
Choose methods and gather evidence
          ↓
Analyse and evaluate what you find
          ↓
Communicate and apply your understanding
```

Each stage contains:

- what the student will learn to do;
- why it matters in Sociology;
- the relevant programme-backed explanation;
- a linked book, open text or learning material where verified.

The student does not see curriculum row counts, raw numbering or raw source
phrases. Educators and administrators may have a separate structured evidence
view.

The implementation must not use the shared `technical` or `transferable` arrays
as proof that every returned item belongs to Sociology. Those arrays may be
used only after their programme ownership and source context have been checked.
The student summary must be produced from the validated Sociology contract,
not from hard-coded Sociology wording inside a component reused by another
programme.

### Phase 6 — Implement the Social Sciences domain transition

After the student continues from the university-aware Sociology page, the
domain entry must carry the selected programme context:

```text
Why Social Sciences is connected to Sociology

[Direct / Functional / Adjacent] connection

Sociology connects to Social Sciences because [programme-specific explanation
grounded in the Sociology curriculum and the validated mapping].

What carries over
[Capabilities supported by Sociology and shared by the domain.]

What you may add
[Domain capabilities not already established by the programme.]
```

If the same domain is opened from another programme, the text, carried-over
foundation and additions must be regenerated for that programme. The domain
description itself is stable, but the connection explanation is not reusable
between programmes.

The Social Sciences page then shows:

```text
Social Sciences overview
        ↓
Domain foundations
        ↓
Domain skills, competencies and tools
        ↓
Domain qualifications where relevant
        ↓
Areas inside Social Sciences
```

The domain page does not show roles. It shows the two actual subgroups and lets
the student choose an area after understanding the domain foundation.

### Phase 7 — Implement domain item relationships and links

Each domain foundation item is displayed as a connected unit:

```text
Foundation capability
  → skill that supports it
  → tool options that may help
  → competency produced by combining them
  → qualification or certification that may apply
  → specific learning/reference link for each item
```

The display must make clear what came from Sociology, what belongs to the
Social Sciences foundation and what is added only at the domain level.

Tool comparisons are available only for tools that are alternatives for the
same task. The comparison is temporary and does not select a tool or save it to
the guidance path.

### Phase 8 — Implement the Computational Social Science subgroup

The subgroup page begins with the continuation from Sociology and Social
Sciences:

```text
From Sociology
  People, society, research questions, evidence and research methods.

From Social Sciences
  Social investigation, evidence, ethics and communication.

Added here
  Quantitative reasoning, statistics, data handling, computation,
  modelling and social network analysis.
```

The subgroup then renders tools by purpose, with tool-specific icons and links:

```text
Organise and query data       SQL · Excel
Statistical analysis          R · SPSS · SAS · Stata
Programming and computation   Python · R · Apache Spark
Data collection               Qualtrics · REDCap
```

Each named item is individually linked. `Compare tools` lets the student form a
preference without selecting a tool for the guidance path.

Roles appear below the subgroup explanation and not on the domain page.

### Phase 9 — Implement the Statistician role

The role page removes seniority language entirely. Do not display labels such
as `junior`, `senior`, `entry-level`, `mid-level`, `lead`, `executive` or a
generic `Seniority not yet verified` state unless a future role-specific
requirement explicitly needs one.

The role page uses this sequence:

```text
What the role does
        ↓
Problems the role helps solve
        ↓
Outputs it produces
        ↓
Skills needed
        ↓
Tool options
        ↓
Competencies formed by combining them
        ↓
Qualifications or certifications that may apply
        ↓
Specific learning links
```

The role must explain that Python, R, SPSS, SAS, Excel and other tools are
different options for different work. It must not present one brand as the
universal tool.

### Phase 10 — Save the completed path to My World

The student should not save every card separately. The guidance workspace
holds the working path and commits it as the student continues:

```text
Sociology
  → University of Ibadan (UI)
  → Social Sciences
  → Computational Social Science and Quantitative Methods
  → Statistician
```

The student may select multiple domains, subgroups or roles. The tick records
the selection; it is not a bookmark and does not mean the student has mastered
the item.

```text
┌─────────────────────────────────────────────────────────────┐
│ Your guidance path                                          │
│                                                             │
│ Sociology                                                   │
│ University of Ibadan (UI)                                  │
│ Social Sciences                                            │
│ Computational Social Science and Quantitative Methods        │
│ Statistician                                                │
│                                                             │
│ Your choices are held in this guidance session.              │
│ Complete the path before creating your report.               │
│                                                             │
│ [Continue]                                                  │
└─────────────────────────────────────────────────────────────┘
```

### Phase 11 — Generate the completed report

Print, download and share actions appear only after the required guidance path
is complete:

```text
Guidance complete

You have selected your programme, university and guidance path.

                         [Print] [Download] [Share]
```

The report follows the same narrative order as the screens:

```text
Starting point
  → Programme and university
  → Admission information
  → What you will study
  → Selected domains
  → Selected subgroups
  → Selected roles
  → What to learn next
  → Item-specific learning links and references
```

The report must not be a raw data export. It must not include unselected
domains, subgroups or roles. It must not expose internal parser language,
generic data-state wording or seniority placeholders.

## 23. Final acceptance criteria before implementation

### Programme

- SS1/SS2 first see `Programme preview`.
- The preview is short: programme identity, plain-language explanation, a few
  broad study areas, trusted qualification details and the university hand-off.
- The preview does not render university cards, full curriculum, abilities,
  resources, requirements, domains or the `See how this part is taught` action.
- `View universities` opens the offering-selection step without routing through
  Home or generic Explore.
- No domains or downstream career content appears before university selection.
- University offerings show full names, abbreviations, addresses and explicit
  `Select university` actions.
- `Select for comparison` and `Compare selected universities` remain available
  as optional actions.
- The selected university’s requirements appear in the programme overview.
- National subject guidance is explained as the general starting rule.
- University-specific requirements are explained as the exact rule for that
  offering.
- There is no separate requirements tab in the guided programme flow.
- Grouped requirements such as `three Social Science subjects` expand to the
  verified subject pool the student can choose from.
- A trusted programme duration is shown beside the qualification; missing or
  unverified duration is omitted rather than guessed.
- Browser Back, in-workspace Back and cancellation from university selection
  return to the same programme preview with its subject/programme context.
- Programme curriculum is synthesized into student-facing explanations.
- Raw outcome counts and raw lists are hidden from students.
- Programme learning materials are attached to the relevant explanation.

### Curriculum evidence

- “See how this part of the programme is taught” does not use the word theme.
- The action opens a restructured learning path, not a source dump.
- Students see `Reference: CCMAS curriculum` rather than a raw source search.
- Educators/admins may access structured source wording separately.
- Programme-specific exceptions do not leak between programmes.
- `Ways of working the curriculum supports` is synthesized as `How you will use
  what you learn`, not displayed as raw ability or skill rows.
- Sociology outcomes are checked for programme, course and source ownership
  before they enter the student summary.
- Generic GST, unrelated programme content and distinct exceptions are either
  separately identified or excluded from Sociology's programme explanation.
- A cross-programme navigation test proves that Sociology wording does not
  remain in another programme's view.

### Domain

- The domain introduction explains what the field studies, what people do,
  what questions it asks and how the connected programme fits.
- Domain foundations appear before subgroups.
- Domain skills, competencies, tools and qualifications flow from foundations.
- Each item has its own learning/reference link when a verified link exists.
- Free learning links are embedded in the relevant item cards; there is no
  generic shared learning-resources button.
- A link is labelled as free only when the target is genuinely free to access.
- Tool options are grouped by purpose and do not imply one required brand.
- Tool relationships are explained through the work sequence.
- Local/source context is embedded into the relevant cards.
- Large local-context and source inventories are removed from the main view.
- Roles do not appear as a flat list on the domain page.
- `Overview` and `Build in this domain` are separate tabs.

### Subgroup

- The subgroup explicitly explains what it inherits from the programme/domain.
- The subgroup explains what it adds.
- Tools are shown as alternatives connected to tasks.
- Every available learning link is attached to the relevant tool, skill or
  competency.
- The subgroup does not claim to have a dedicated course catalogue when its
  records contain no dedicated resources.
- A missing subgroup catalogue is stated honestly without a locked state.
- Roles appear inside the subgroup.

### Role

- The role explains the work, problems, outputs and application contexts.
- Role cards contain no seniority label or unverified seniority placeholder.
- Skills, competencies, tools and qualifications are synthesized into one
  practical sequence.
- Tools are alternatives, not universal requirements.
- Each available link is attached to the item it explains.
- Every displayed role item is audited for a specific learning/reference link;
  missing links are shown honestly rather than replaced with a generic URL.
- Certification language distinguishes possible professional routes from a
  universal requirement.

### Report

- Print and download remain unavailable until the guidance path is complete.
- The report is a readable narrative, not a raw data export.
- Report sections follow programme → university → domain → subgroup → role.
- Only selected domains, subgroups and roles appear.
- Print, download and share use compact icon controls.
- Source references are concise and understandable.

## 23A. Restart point for the next implementation session

The next session resumes at the data audit, not at another visual rewrite and
not at scaling to every programme. Use this sequence:

```text
1. Locate the actual Sociology CCMAS/JAMB/programme records.
2. Trace every outcome to programme, course, source and locator.
3. Separate Sociology-owned content from shared, generic, exception,
   neighbouring-programme and parser-failed content.
4. Trace the Sociology → Social Sciences mapping edge and its type.
5. Verify Social Sciences domain ownership separately from subgroup and role
   ownership.
6. Verify Computational Social Science subgroup ownership and its role links.
7. Verify the selected Statistician role records and item-level resources.
8. Produce the cleaned Sociology contract and the excluded/review-only ledger.
9. Test the contract for leakage and false ownership.
10. Only after sign-off, update the programme/domain/subgroup/role screens.
```

The first deliverable is therefore an evidence-backed audit report and cleaned
contract, not a new card design. The second deliverable is the Sociology
worked-example UI. The all-programmes implementation begins only after the
Sociology contract, data display and report have been reviewed and accepted.

Do not apply live Supabase writes as part of this restart unless the task
explicitly authorizes them. Local source inspection, contract validation,
read-only diagnostics and local tests are allowed. A local seed or generated
file is not proof that the live database contains the same records.

## Final product decision

The final experience is:

```text
Programme preview
    → University selection
    → University-aware programme overview
    → Programme learning path
    → Domain overview
    → Domain foundations and tools
    → Subgroup continuation
    → Role continuation
    → Complete guidance
    → Print / download / share report
```

The programme explains the programme. The domain explains the wider field. The
subgroup explains the focused area. The role explains the actual work. Skills,
tools, competencies, certifications and resources are progressively narrowed
at each level and linked directly to the explanation they support.
