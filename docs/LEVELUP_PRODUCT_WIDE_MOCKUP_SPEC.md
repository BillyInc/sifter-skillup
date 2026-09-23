# Sifter LevelUp product-wide mockup direction

This is the visual review spec for the first product-wide mockup pass. It is
intentionally separate from the live feature routes: the existing application
and data model remain the source of truth while the direction is reviewed.

## Reference intent

The supplied Level Up references establish the visual language:

- stacked breadcrumb context at the top of every screen;
- one confident page title followed by a short explanation;
- friendly grouped cards with a clear section question;
- soft colour families for different concepts, restrained borders and shadows;
- a single, obvious next action;
- progressive disclosure instead of dense portal-style tables.

The Sifter implementation keeps its own product palette and content rules:
orange action, dark navy/charcoal text, green positive states, blue information,
amber warning, red error, Inter typography, and real catalogue/account values
only. Catalogue examples from screenshots are not copied into product data.

## Preview surfaces

The mockup studio previews these surface families for both web and mobile:

| Family | Preview purpose | Honest unavailable state |
| --- | --- | --- |
| Home | starting point, current guidance, next action | no saved path yet |
| Explore | search-first programme/domain/role discovery | no live results yet |
| My World | saved careers, bookmarks, notes | nothing saved yet |
| Profile | account and preference entry points | profile data follows account |
| Auth | sign in, create account, guest entry | validation/error slots |
| Intro | explain the connected guidance journey | skip/continue states |
| Terms | consent and document reading | continue disabled until consent |
| Skill matcher | subject/goal selection | no match shown until real input |
| Programme intelligence | requirements, schools, pathways | source-backed data states |
| Market intelligence | opportunity/market context | live snapshot unavailable |
| Admin | overview, guidance, verification, market | permission/empty/locked states |

## Shared interaction contract

The mockup controls are representative of the intended behavior:

- mode switch changes the complete surface between light and dark tokens;
- web/mobile switch changes navigation chrome and content density;
- surface selection changes the breadcrumb, title, components and next action;
- every empty/locked state explains what happened and gives the next safe action;
- transitions are short fade/slide-up reveals, with reduced-motion fallback;
- the logo is isolated behind the existing `LevelUpLogo` component so it can be
  replaced without changing the product shell.

## Responsive direction

Web uses persistent navigation, a wider information canvas and contextual
secondary panels. Mobile uses a compact header, horizontally scrollable
breadcrumbs, stacked content and a five-destination bottom navigation. The
same hierarchy is preserved, but mobile is not a shrunken desktop.

## Content integrity

This mockup pass uses labels and flows already present in the repository such as
Explore, Opportunities, My World, Profile, programme/domain/role discovery,
guidance and admin verification. It deliberately does not add universities,
programmes, cut-offs, scores, market figures, salaries, opportunities or match
percentages. When a live source is unavailable, the mockup shows an empty,
locked or source-pending state instead.

## Next implementation phase

After visual review, the shared tokens and shell patterns can be promoted into
the live routes in this order:

1. shell, breadcrumbs and navigation;
2. auth and intro/terms;
3. Home, Explore and My World;
4. programme intelligence and skill matcher;
5. opportunities and market intelligence;
6. profile/settings and admin workspace;
7. edge states, accessibility and motion refinement.

## Guidance box mock-up contract

This section supersedes any earlier mock-up that placed university offerings
or downstream career guidance as a flat list below a programme preview. It is
the controlling interaction and presentation contract for the reviewed
Sociology slice before the pattern is scaled to other programmes.

### 1. Programme preview and university selection

For SS1 and SS2, the first programme page is a concise `Programme preview`.
It explains what the programme is, what the student may study, the recognised
qualification and duration when trusted, and that different universities may
use different requirements for the same JAMB programme.

The preview does not show:

- university requirement details;
- domains, subgroups or roles;
- market or practice guidance;
- a full raw outcome list;
- a separate requirements tab; or
- a `Continue` button that implies the student has completed guidance.

The preview has one clear route into university choice:

```text
┌────────────────────────────────────────────────────────────┐
│ Sociology                                                   │
│ Bachelor of Science · 4 years                              │
│                                                            │
│ Sociology explores how people live together, how groups     │
│ and institutions shape society, and how societies change.   │
│                                                            │
│ You will get an overview of what the programme teaches.     │
│ Each university may have its own admission requirements.    │
│                                                            │
│ [View universities offering Sociology]                      │
└────────────────────────────────────────────────────────────┘
```

`View universities offering Sociology` opens a dedicated, focused university
selection screen. University offerings must not expand into a long list below
the preview.

```text
┌────────────────────────────────────────────────────────────┐
│ ← Back to Sociology preview                                │
│ Universities offering Sociology                            │
│ Compare where this JAMB programme is available.             │
│                                                            │
│ ┌────────────────────────────┐ ┌─────────────────────────┐ │
│ │ University of Lagos (UNILAG)│ │ University of Ibadan   │ │
│ │ Sociology                   │ │ (UI)                   │ │
│ │ Lagos, Lagos State          │ │ Sociology              │ │
│ │ [Select university]         │ │ Ibadan, Oyo State      │ │
│ │ [Select for comparison]     │ │ [Select university]    │ │
│ └────────────────────────────┘ └─────────────────────────┘ │
│                                                            │
│ [Compare selected universities]                            │
└────────────────────────────────────────────────────────────┘
```

Each card shows the institution's full name, abbreviation where one exists,
address, and the actual JAMB programme/offering name recorded for that
institution. Requirements are not dumped into this card. The card gives the
student enough identity information to choose the correct university; the
requirements become visible after the student opens or selects that offering.

`Select for comparison` is an optional comparison action and is separate from
the primary `Select university` action. The comparison screen must state
exactly what is being compared: the same JAMB programme at the selected
universities, their recorded UTME subjects, O-level requirements, subject
pools, exceptions and data status. It must not compare unrelated programme
variants as if they were the same offering.

After a university is selected, the student returns to the university-aware
programme overview. The header must expose:

```text
[Change university] [Select for comparison] [Compare selected universities]
```

`Change university` returns to the dedicated university-selection screen. The
browser Back action follows the same sequence. It must not send the student to
Home, a generic Explore page, or a stale admission-search URL.

### 2. University-aware programme overview

The selected-university overview is one continuous page, not a separate
requirements tab followed by disconnected content:

```text
┌────────────────────────────────────────────────────────────┐
│ Sociology                                                  │
│ University of Lagos (UNILAG) · Lagos, Lagos State           │
│ [Change university] [Select ✓] [Compare]                    │
├────────────────────────────────────────────────────────────┤
│ Admission requirements for this offering                    │
│                                                            │
│ National subject guidance                                  │
│ These are the subjects JAMB records as the general subject  │
│ route for Sociology. They help you understand the national  │
│ starting point.                                             │
│                                                            │
│ University of Lagos requirement                             │
│ This is the requirement recorded specifically for Sociology  │
│ at this university. It may add to or differ from the        │
│ national route.                                             │
│                                                            │
│ Subject pools                                               │
│ If the requirement says “any two Arts or Social Sciences    │
│ subjects”, show the actual verified subject pool here.       │
│                                                            │
│ [What this means for your subjects]                         │
├────────────────────────────────────────────────────────────┤
│ What you will study                                        │
│ A short, source-grounded explanation of the programme.       │
│                                                            │
│ [People, groups and society] [Ideas and theories]            │
│ [Research and evidence] [Technology and information]         │
│                                                            │
│ [See the full learning path]                                │
├────────────────────────────────────────────────────────────┤
│ Where this programme connects                               │
│ Choose a field below to understand how the programme        │
│ connects to it.                                             │
│                                                            │
│ DIRECT · primary connection                                │
│ [Social Sciences]                                           │
│                                                            │
│ FUNCTIONAL · related application                            │
│ [Economics] [Psychology] [Social Work]                      │
│                                                            │
│ ADJACENT · nearby direction                                │
│ [Criminology]                                               │
└────────────────────────────────────────────────────────────┘
```

There is no `Continue` button below this section. A student enters a domain
by clicking its card. The domain relationship explanation is generated for
the selected programme, so the same domain may explain a different connection
for a different programme.

### 3. Curriculum and learning-outcome presentation

The student does not receive the raw CCMAS list as the main experience. The
programme view synthesizes validated course titles, outcomes and programme
abilities into a small number of readable learning cards.

Each card contains:

- a plain-language explanation of what that part of the programme covers;
- two or three synthesized statements beginning with `You will learn to...`;
- the kind of work or output the learning supports;
- an inline `Learn more` link only when a specific verified resource exists;
- a compact `CCMAS curriculum` reference stating that the explanation was
  reworded from the curriculum; and
- an expandable detail view that groups the remaining outcomes by course or
  learning purpose, rather than showing an undifferentiated raw list.

The preview shows only the short explanation and the main learning cards. The
university-aware overview may expose the fuller learning path after admission
context is known. `See how this theme is taught` is not used. If a teaching
detail is useful, use `How this appears in the programme` and describe the
course, project, research, report, presentation or practical activity that is
actually present in the cleaned records.

The former `Ways of working the curriculum supports` block is not rendered as
raw source prose. It becomes `How you will use what you learn`, with grouped
outcomes such as:

```text
┌────────────────────────────────────────────────────────────┐
│ How you will use what you learn                            │
│                                                            │
│ Investigate social questions                               │
│ You will learn to plan an investigation, choose suitable    │
│ methods, work with evidence and explain the limits of your  │
│ findings.                                                   │
│                                                            │
│ Communicate your findings                                  │
│ You will learn to present research, write reports and       │
│ explain an argument clearly to different audiences.          │
│                                                            │
│ Apply ideas to society                                     │
│ You will learn to use sociological ideas to examine social  │
│ problems, institutions and change.                          │
└────────────────────────────────────────────────────────────┘
```

Unrelated GST, LIS exceptions, language, philosophy, environmental,
entrepreneurship or peace-and-security records must not silently become
Sociology abilities. They require an explicit shared-course decision or remain
staff-review data. Educators and administrators may inspect raw source wording
and locators in their audit surface, but students do not need a `Search this
theme` field or a raw source dump.

For the reviewed Sociology slice, shared and supporting courses remain visible
because they are part of the checked-in Sociology curriculum. They are grouped
for clarity using the source course code: Sociology/related programme courses,
supporting Social Sciences courses, and shared university courses. This is a
presentation grouping only; it must never silently turn a shared course into a
Sociology-specific outcome or remove it from the staff audit record.

Before this screen is considered complete, the data gate must prove that every
student-visible learning card has a course locator, a source-backed state and
an explicit programme owner. Missing or review-only rows are omitted from the
student learning path and retained for staff review. No generic resource link,
role aggregate, neighbouring programme outcome or invented summary may be used
to fill a gap.

### 4. Domain cards and domain entry

Domains are displayed below the university-aware programme overview in a
responsive grid. They are grouped by relationship, not placed in one long
list:

```text
┌────────────────────────────┐ ┌────────────────────────────┐
│ DIRECT                     │ │ FUNCTIONAL                 │
│ Social Sciences            │ │ Economics                  │
│ Primary connection         │ │ Related application        │
│ 2 areas to explore         │ │ 3 areas to explore         │
│ [Open domain]              │ │ [Open domain]              │
└────────────────────────────┘ └────────────────────────────┘

┌────────────────────────────┐
│ ADJACENT                  │
│ Criminology                │
│ Nearby direction           │
│ 1 area to explore          │
│ [Open domain]              │
└────────────────────────────┘
```

The card itself is the entry action. There is no extra confirmation gate and
no `Continue` button. If a relationship group contains several domains, the
group card shows the count and a few verified names, then opens a focused grid
of those domains. If it contains one domain, the card opens that domain
directly. The student should always see the relationship label and a short
programme-specific reason before entering.

The domain page has two top-level tabs:

```text
[Overview] [Build in this domain]
```

`Overview` explains the domain, its domain-owned foundation and how the
selected programme connects to it. `Build in this domain` is the separate
entrepreneurship/build product and must not be mixed into the learning path.
Roles do not appear on the domain overview.

### 5. Domain, subgroup and role grids

Subgroups are shown as LevelUp-style cards in a grid. They are not a flat list.
Each card explains what the area studies, what it adds to the domain and how
many roles are organised inside it.

```text
┌────────────────────────────┐ ┌────────────────────────────┐
│ Social & Economic Research │ │ Computational Social       │
│                            │ │ Science & Quantitative     │
│ Study society with        │ │ Methods                    │
│ research and evidence.     │ │ Use data and computation to │
│ 6 roles                    │ │ study social questions.    │
│ [Explore area]             │ │ 1 role                     │
│                            │ │ [Explore area]             │
└────────────────────────────┘ └────────────────────────────┘
```

Inside a subgroup, roles are also cards in a grid. The role card gives a
short explanation of the work and the outputs it produces before the student
opens it. Roles belong to subgroups; they must not be rendered as a separate
flat domain list.

```text
┌────────────────────────────┐ ┌────────────────────────────┐
│ Statistician               │ │ Social Researcher          │
│ Uses quantitative evidence │ │ Investigates social        │
│ to identify patterns and   │ │ questions using evidence   │
│ support decisions.         │ │ and research methods.      │
│ [Explore role]             │ │ [Explore role]             │
└────────────────────────────┘ └────────────────────────────┘
```

Every domain, subgroup and role page has a visible Back action and a stable
breadcrumb. Browser Back and the visible Back action return to the immediately
preceding guidance surface.

### 6. Connected skills, tools, competencies and certifications

These are not a generic list at the bottom of a page. They are item cards
placed next to the explanation they support, and each item has its own
verified link when one exists.

```text
┌────────────────────────────────────────────────────────────┐
│ Design and analyse a social research study                  │
│ COMPETENCY                                                  │
│ Combines a clear question, suitable methods, evidence        │
│ handling and responsible interpretation to produce a useful  │
│ research result.                                            │
│                                                            │
│ Uses: Frame questions · choose methods · analyse evidence   │
│ May use: R · Python · SPSS · Excel                         │
│ Builds on: Research design · evidence evaluation            │
│                                                            │
│ [Open competency learning link]                             │
└────────────────────────────────────────────────────────────┘
```

Tool cards explain what the tool does in that domain, subgroup or role, what
kind of work it supports, which other tools or skills it is commonly paired
with, and what alternatives are available. A tool is an option, not a hidden
requirement. Generic source categories such as `Spreadsheet software` are
internal evidence labels and must not be presented as named tools.

Certification cards show their scope explicitly:

```text
Nigeria       A Nigerian professional, regulatory or sector route is recorded.
Global        An international route or reference is recorded.
Nigeria + global  Both evidence layers are recorded.
```

The card must distinguish a professional licence, an examination, a
qualification, training and a reference body. If no verified specific link
exists, the card says so; it does not attach a generic homepage. A full
comparison workflow is required for universities, but tools, skills and
certifications use inline alternatives and scope explanations rather than a
separate comparison product.

### 6A. Card partition refinement: tools, skills, competencies and qualifications

The earlier item-card rule is refined as follows: every named tool, skill,
competency, method and certification/qualification gets its own compact item
card. The parent purpose or learning stage is a grouping section, not a
replacement for the individual cards.

```text
Purpose or learning stage = parent section/card
Named item = individual card
Meaning, relationships and item-specific source link = inside that card
Full locators and raw evidence = separate staff audit surface
```

So `Python`, `R`, `SPSS` and `Excel` must not appear only as chips. Each is an
individual card because the student needs to know what it is used for in this
domain, subgroup or role, whether it is an option or a requirement, what it
works with, what alternatives are explicitly supported, and where to learn or
verify it. The card is not a separate full screen: it is a compact item card
inside the purpose group.

Do not turn every item into a giant full-width block. On web, use a responsive
two- or three-column grid for item cards; on mobile, use one column. A simple
list row is suitable only for homogeneous records with no individual
explanation or action. These records have individual explanations, links and
relationships, so compact cards are required.

#### Domain partition

The domain page has one ordered foundation path, followed by domain-owned
capabilities, tools and qualifications, then the subgroup grid. Do not nest
all of those types inside one large `Build the foundation` card, and do not
use role-derived aggregates as domain advice.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ DOMAIN FOUNDATION                                                       │
│ Understand the field's central questions and way of working.              │
│                                                                          │
│ 1  Start here                                                            │
│    Understand society and institutions                         [Details] │
│                                                                          │
│ 2  Build next                                                            │
│    Ask questions, gather evidence and explain findings          [Details] │
│                                                                          │
│ 3  Choose a method                                                       │
│    Add quantitative, qualitative, policy, community or other methods     │
│                                                                  [Details]│
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ DOMAIN SKILLS AND COMPETENCIES                                           │
│ Abilities and outcomes used across this field.                            │
│                                                                          │
│ ┌──────────────────────┐  ┌──────────────────────┐                      │
│ │ Skill                │  │ Competency           │                      │
│ │ Analyse survey data  │  │ Design and analyse   │                      │
│ │ What it helps with…  │  │ a responsible study │                      │
│ │ [Learn] [How it fits]│  │ Uses skills: …      │                      │
│ └──────────────────────┘  │ Uses tools: …       │                      │
│                            │ [Learn] [How it fits]│                      │
│                            └──────────────────────┘                      │
│                                                                          │
│ [See all domain skills and competencies]                                 │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ TOOLS BY PURPOSE                                                         │
│ Choose the work first. Tools are options, not a requirement to learn all. │
│                                                                          │
│ Analyse evidence                                                        │
│ ┌──────────────────┐ ┌──────────────────┐ ┌───────────────────────────┐ │
│ │ R                │ │ SPSS             │ │ Excel                     │ │
│ │ Statistical work │ │ Statistical work │ │ Organise and inspect data │ │
│ │ Works with: …   │ │ Alternative to R │ │ Works with: …             │ │
│ │ [Open link]      │ │ [Open link]      │ │ [Open link]               │ │
│ │ [How it fits]    │ │ [How it fits]    │ │ [How it fits]             │ │
│ └──────────────────┘ └──────────────────┘ └───────────────────────────┘ │
│                                                                          │
│ [See all tools for this purpose]                                        │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ QUALIFICATIONS AND PROFESSIONAL ROUTES                                   │
│ Show only routes established by the source.                              │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ Nigerian research-methodology training                               │ │
│ │ Training route · Nigeria · applicable where stated                     │ │
│ │ What it supports: …                                                   │ │
│ │ [Open official information] [How it fits]                             │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

The domain page ends with the subgroup grid. `Build in this domain` remains a
peer tab containing the separate build product; it is not another learning
section.

#### Subgroup partition

The subgroup page shows continuation without duplicating the entire domain:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ COMPUTATIONAL SOCIAL SCIENCE & QUANTITATIVE METHODS                     │
│ What this area adds to Social Sciences and the work it supports.         │
│                                                                          │
│ INHERITED FROM SOCIAL SCIENCES                                          │
│ Understand society · research questions · evidence · ethics              │
│ [View inherited foundation]                                              │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ WHAT THIS AREA ADDS                                                      │
│ Skills and competencies: individual expandable cards                     │
│ Tools by purpose: purpose sections containing individual tool cards       │
│ Methods: individual cards with use, limits and evidence                   │
│ Qualifications: individual cards with scope and official information      │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ ROLES IN THIS AREA                                                       │
│ ┌──────────────────────┐ ┌──────────────────────┐                       │
│ │ Statistician         │ │ Social Researcher    │                       │
│ │ Numerical evidence   │ │ Social questions    │                       │
│ │ and models.          │ │ and research.       │                       │
│ │ [Open role]          │ │ [Open role]          │                       │
│ └──────────────────────┘ └──────────────────────┘                       │
└──────────────────────────────────────────────────────────────────────────┘
```

The inherited foundation is a summary entry into the domain page or an
in-place expansion. It is not a second full domain inventory. If the same tool
appears at both levels, the subgroup card explains the narrower subgroup use;
it must not silently repeat the domain copy.

#### Role partition

The role page begins with the work, outputs and application contexts. It then
shows one preparation path and the item cards that explain how the work is
done.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ STATISTICIAN                                                            │
│ What the role does, the problems it helps solve and what it produces.     │
│ Typical outputs: analyses · models · findings · reports                   │
│ Used in: health · demographics · finance · business (where evidenced)    │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ HOW THE PIECES WORK TOGETHER                                             │
│ Programme learning → domain foundation → subgroup methods                │
│ → role skills → competency outcome → tool options → applicable route     │
│                                                                          │
│ [View the full path]                                                      │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ ROLE PREPARATION                                                         │
│ Build first: individual skill cards with [Learn] and [How it fits]       │
│ Tools by purpose: individual tool cards with alternatives and complements │
│ Qualifications: individual cards with type, scope and official link       │
└──────────────────────────────────────────────────────────────────────────┘
```

Role cards must not be rendered three times as a generic context list plus
separate skills, tools and certification blocks. The student-facing renderer
should use one item-card anatomy fed by role-owned records. Separate headings
for `Skills`, `Tools` and `Qualifications` remain appropriate because the
concepts differ, but each item within a heading uses the same card structure.

#### Item-card anatomy

Every named item card uses this order:

```text
[type icon] [item name]                         [priority/scope badge]
What it is here: one plain-language sentence.
Used for: the work or outcome it supports.
[Open specific learning / documentation / official link]
[How it fits]                                  [optional tick/select]

Expanded only when requested:
  Why it appears here
  Builds on / works with / complements / alternatives / qualifies for
  What it helps produce
  Supporting source evidence (individual links)
  Honest evidence limitation or “No verified learning link yet”
```

The primary link belongs beside the item. Supporting evidence links remain
inside the expanded card and are labelled as evidence, not as learning
resources. A source URL already used as the item's learning or official link
must not be duplicated.

| Data | Parent grouping | Individual card | Expanded details | Next surface |
| --- | --- | --- | --- | --- |
| Domain foundation | learning stage | yes | meaning, use, priority, source | learning link where verified |
| Skill | foundation / subgroup / role | yes | prerequisite, use, related competency, sources | learning/reference link |
| Competency | outcome or work capability | yes | ingredient skills, methods, tools and output | competency/reference link |
| Tool | purpose such as analyse or collect | yes | purpose, alternatives, complements, sources | documentation/learning link |
| Method | subgroup or role method group | yes | use, timing, limitations and sources | method/reference link |
| Certification/qualification | route or credential group | yes | type, scope, eligibility and requirement status | official information link |
| Subgroup | domain area grid | yes | area meaning and role count | subgroup page |
| Role | subgroup role grid | yes | work, outputs and context | role page |

`Details` expands the same card's plain meaning, use, expected output and
priority reason. `How it fits` expands only source-backed relationship edges.
`See all` reveals remaining items in the current group. `Open source` opens the
specific item URL through `ExternalLinkGuard`. These actions must not be
collapsed into one vague `Learn more` footer.

#### Why this partition is used

This uses progressive disclosure: keep the information needed for the current
decision visible, then reveal secondary evidence and relationships with a
clearly labelled action. It also preserves scanning: homogeneous tools can be
grouped by purpose, while every tool remains individually inspectable. Do not
turn the page into a wall of full cards or a raw list of source phrases.

External UX references used for this decision:

- [GOV.UK summary lists and summary cards](https://design-system.service.gov.uk/components/summary-list/): titled summary cards separate related information and actions, while simpler rows are preferable for small homogeneous information.
- [Nielsen Norman Group — Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/): keep core information visible, defer secondary detail and make the next disclosure step obvious.
- [Material Design — Cards](https://m1.material.io/components/cards.html): cards are entry points to richer information; homogeneous content with no individual action should remain a list, and cards may expand instead of creating nested scrolling.
- [Material Design — Expansion panels](https://m1.material.io/components/expansion-panels.html): a collapsed panel should show a summary and expand to reveal the full details with a clear focus state.

### 7. Icons and visual treatment

The LevelUp mock-ups use icons to establish meaning and scanning rhythm. The
implementation should use the approved existing icon library/registry for:

- programme learning areas;
- direct, functional and adjacent relationships;
- domain foundations and Build;
- subgroup areas and role cards;
- skills, tools, competencies and certifications;
- university, address, comparison, selection, Back, source and external-link
  actions; and
- Nigeria, Global and Nigeria + Global evidence scope.

Icons are enough for this guidance experience. Stock photography is not
required. Do not add a new logo, lightning/zap mark, black square artwork or
decorative image as a substitute for a missing product state. Cards should be
compact, readable, softly bordered and arranged in a responsive grid with one
clear primary action per card.

### 8. Focused guidance behavior

Once the student enters a guidance route, the guidance workspace becomes the
prominent surface. Explore navigation may collapse so the student can focus on
the current decision, while the breadcrumb and Back action remain visible.
The route is continuous:

```text
Programme preview
        ↓ View universities
University selection / optional comparison
        ↓ Select university
University-aware programme overview
        ↓ Click a domain card
Domain overview or Build tab
        ↓ Click a subgroup card
Subgroup overview
        ↓ Click a role card
Role overview and connected preparation
        ↓ Finish selections
Review and report actions
```

Print, download and share actions remain unavailable until the guidance route
reaches Review. Selection uses a tick/check action and is accumulated in the
guidance path; students do not have to save separately at every card. The
completed report is the structured result of the route, not an export of a
partially viewed page.

## Resume contract: cleaned data before product-wide scaling

This document is the box-style UX and behaviour authority for the reviewed
Sociology slice. It is not permission to make an incomplete payload look
complete. The next implementation pass must begin with the data audit and only
then build or revise the screens from the approved contract.

### Non-negotiable source rule

Every student-facing sentence, label, relationship, count, item and link must
come from a checked record in the repository/database contract. The following
are the only permitted sources for the four guidance levels:

```text
Programme
  Canonical JAMB programme identity, trusted qualification/duration,
  cleaned CCMAS courses, outcomes, abilities and programme-owned materials.

Domain
  Domain-owned definition, foundation, skills, tools, competencies,
  qualifications and domain-owned learning/reference links.

Subgroup
  Explicit subgroup meaning, inherited domain foundation, subgroup additions,
  subgroup methods/items, roles owned by that subgroup and item-level links.

Role
  Role-owned work, outputs, application contexts, skills, tools,
  competencies, qualifications and item-level links.
```

Do not fill an empty card with invented prose, a neighbouring programme's
outcome, a role-frequency aggregate, a generic software category, a generic
homepage or an unverified Nigerian claim. A record that is ambiguous,
parser-failed, unowned, review-only or missing a reliable target is not a
student recommendation. It remains visible only in the staff audit surface
with its exact reason.

The product must not describe source-backed career context as employment demand,
salary, licence entitlement or a promise that a student is already skilled.
The current student guidance experience does not use invented demand data.

### Required data gate before screen approval

Before the Sociology screens are accepted, produce and retain a machine-readable
and human-readable audit containing:

- the canonical Sociology identity and duplicate/alias decisions;
- every retained CCMAS course code, title, outcome, source file and locator;
- the presentation group for each outcome, without changing its academic owner;
- the separately stored programme abilities and their source locators;
- all shared/university-wide and supporting-course decisions;
- every Sociology-to-domain edge and its relationship type;
- the domain, subgroup and role IDs resolved by every active edge;
- ownership and review state for every skill, tool, competency, certification
  and material;
- the exact URL, provider, access label and provenance of every displayed link;
- missing, duplicate, contradictory, parser-failed and unresolved records; and
- the decision for each record: `student_display`, `staff_review_only` or
  `excluded`, including the reason.

The audit must specifically test the records currently labelled People and
society, Ideas and foundations, Research and evidence, Technology and
information, Applying what you learn, Other programme topics and the broader
programme abilities. Shared GST or related-course content may remain visible
only when the explicit source decision supports it. LIS exceptions, unrelated
programme material and parser annotations must never leak into Sociology.

The student contract must fail closed when this gate is not satisfied:

```text
Verified and owned       -> display the synthesized card and its own link.
Known but no verified URL -> display the explanation and say no verified link
                             is attached yet; do not claim it is actionable.
Ambiguous/review-only     -> exclude from student guidance; retain for staff.
Not applicable here       -> omit; do not call it locked or coming soon.
```

### Final SS1/SS2 guidance sequence

The sequence below is the agreed behaviour for an SS1 or SS2 student who has
selected subjects but has not selected a university. It also applies when an
educator is guiding a provisioned student account: the unfinished checkpoint
must reopen at the last completed step, not at Home or generic Explore.

```text
Subject match
       |
       v
Short programme preview
       |
       +--> View universities -> dedicated university-selection screen
                                      |
                                      +--> optional comparison
                                      |
                                      +--> Select university
                                               |
                                               v
University-aware programme overview
  requirements + programme teaching + programme materials
                                               |
                                               v
Relationship-grouped domain cards
  click a domain card; no extra Continue button
                                               |
                                               v
Domain Overview or separate Build tab
                                               |
                                               v
Subgroup grid -> role grid -> selected items
                                               |
                                               v
Review -> print/download/share actions
```

The preview is intentionally short. It contains one JAMB programme identity,
one clear explanation, a few broad study areas, trusted qualification/duration,
a verified offering count when available, and `View universities`. It does not
contain university requirements, domains, subgroups, roles, market/practice
context, raw CCMAS outcomes, programme resources or report actions.

The university selector is its own focused screen, never a long list appended
under the preview. Every offering card obtains its values from the offering
record and shows:

- full university name, followed by the abbreviation when recorded;
- complete institution address when recorded;
- the single JAMB programme identity;
- a clear `Select university` tick/action; and
- a separate optional `Select for comparison` tick/action.

The comparison screen must say exactly what is being compared: the same JAMB
programme at the selected universities, their offering names, addresses,
qualification, UTME rule, O-level rule, subject pools, exceptions and data
status. It is not a ranking and must not compare unrelated variants as though
they were one programme.

Browser Back, the visible Back action and cancellation return to the programme
preview. `Change university` returns to the university selector. None of these
actions may fall through to Home, generic Explore or a stale admission-search
URL.

### University-aware programme overview

After the student selects a university, the programme page changes from
`Programme preview` to the full university-aware overview. Requirements are
shown inline in the overview; there is no separate requirements tab in the
guided route and no requirement data is shown before selection.

The requirement card keeps the evidence layers distinct but explains them in
plain language:

```text
How to read these requirements

General JAMB programme guidance
The general subject pattern used to identify possible routes into this
programme across Nigerian universities.

This university's requirement
The exact UTME and O-level rule recorded for this programme at the university
you selected. This rule takes priority when you are considering this offering.

Why both are shown
The general rule helps find possibilities; a university may apply a more
specific version, an extra subject or an exception.
```

Grouped phrases must be expanded from the verified subject catalogue. For
example, `any three Social Science subjects` may show the actual accepted pool
only when that pool is present in the parsed rule record. If `relevant subject`
has not been resolved, say that the accepted pool is still being verified and
exclude that unresolved rule from eligibility matching. Never guess the pool.

The overview then presents the cleaned programme explanation, the ordered
learning path, programme-owned books/materials and the domain cards. It does
not display a raw search box, raw source wording or a source-inventory dump.

### Curriculum and programme materials

The student sees what the programme teaches as a readable narrative backed by
the cleaned CCMAS records:

```text
What you will study
  What this programme is about in plain language.

What you will learn to do
  A short set of synthesized, source-grounded learning outcomes.

How the learning fits together
  Understand the subject -> learn its ideas -> investigate questions ->
  work with evidence -> communicate/apply what you find.

How you will use what you learn
  Programme abilities rewritten for students as actions, not raw source prose.

Read and learn
  Programme-owned books, open texts, courseware or reference materials,
  attached to the learning area they support.
```

`Ways of working the curriculum supports` is not rendered as a raw block. It
is converted into titled ability cards such as `Investigate social questions`,
`Work with research data`, `Communicate your findings` and `Use information
tools` only when the cleaned programme ability supports that wording. A source
course may be grouped for readability, but presentation grouping never changes
the source course or transfers an outcome to another programme.

The student can expand a learning card to see a structured explanation of how
the programme develops it. The expanded view groups outcomes by course or
purpose and shows a compact `CCMAS curriculum` reference. It does not expose
`Search this theme`, parser annotations, raw extraction lists or a “see 180
more” wall of unstructured text. Educators and administrators receive the
separate raw-evidence/audit view.

Every programme book or learning material is an item-level record with its own
title, purpose, provider, access label, URL, source URL, provenance and review
state. “Free”, “open textbook”, “public courseware”, “publisher reference” and
“prescribed” are different labels. A respected book is not called prescribed
or industry-certified unless an authoritative source explicitly establishes
that status.

### Relationship-grouped domain entry

Domains appear only after university selection and are arranged as compact
cards in a responsive grid. The groups are `Direct`, `Functional` and
`Adjacent`; they are not a flat list and the domain is not entered through a
second generic Continue button.

If a relationship group contains several domains, the group heading may show
the verified count and a small preview of names, then open a focused grid of
those domains. If it contains one domain, its card opens directly. The card
must show the relationship label and a short reason generated from the current
programme-to-domain edge.

The mapping label belongs to the relationship, not permanently to the domain:

```text
Direct    The programme overlaps the domain's central knowledge/capabilities.
Functional The programme's capabilities can be applied in the domain even
           though it is not the programme's central subject area.
Adjacent  A supported nearby connection exists, but further domain learning is
           needed before treating it as a main direction.
```

For every programme/domain pair, generate:

- `Why [Domain] is connected to [Programme]`;
- the relationship type;
- what the programme curriculum carries over;
- what source-backed domain capabilities may be added; and
- the evidence boundary for that specific connection.

The same domain may therefore be direct for Sociology and direct for Law while
having different explanations and different carried-over/additional items.
The explanation may not be copied from the domain description, inferred from
the domain name or generated from role prevalence.

### Domain screen and separate Build tab

The domain screen has two peer tabs, like the university hand-off in the
programme flow:

```text
[Overview]    [Build in this domain]
```

`Overview` begins with the programme-specific connection card when the student
came from a programme. It then explains what the domain studies, the questions
it helps explore, what people do in the field, its domain-owned foundation and
how the foundation progresses into skills, competencies, tools and
qualifications. It ends with a subgroup grid, not a role list.

`Build in this domain` is a separate product surface for projects, services or
ventures. It is not a synonym for learning the domain and it must not be
inserted between foundations and subgroups. If verified build records do not
exist, show a bounded empty state; do not invent build ideas.

The domain overview must not show the old blocks `Local context`, `Context that
supports this guidance`, `Sources checked`, `no_direct_local_counterpart`,
`National aggregate`, repeated source names, generic software classifications,
or `Locked / Domain detail is temporarily unavailable`. Relevant Nigerian or
professional evidence is embedded briefly in the card it supports, with a
compact source/reference action. Detailed locators belong to the staff audit
surface.

### 6B. Domain introduction: the decision-making explanation

The sentence in the old domain seed — `Social sciences study how people,
societies and institutions behave and change over time...` — is not sufficient
as the student introduction. It is seeded domain-description data, not a React
literal, but it is too compressed and too role-oriented to help a student
decide whether to explore the field. The screen must not simply fall back to
that sentence when the reviewed orientation is available.

Every student-visible domain must have a reviewed `student_orientation` object
owned by the domain layer. It is separate from the programme-to-domain edge:
the edge explains why this particular programme connects to the domain; the
orientation explains what the domain itself is. Role evidence may validate an
internal mapping, but it must not define the domain foundation or introduction.

The domain introduction is rendered as a compact sequence of explanatory
cards, not one paragraph or a raw source dump:

```text
┌──────────────────────────────────────────────────────────────┐
│ Social Sciences                                              │
│ Education & Research                                         │
│                                                              │
│ What this field studies                                      │
│ Social Sciences helps you understand how people live together,│
│ how groups and institutions shape everyday life, and how      │
│ societies change. It connects questions about culture, family,│
│ work, inequality, crime, policy and community life to evidence│
│ gathered through research.                                   │
│                                                              │
│ What people in it do                                        │
│ People turn questions about society into investigations. They  │
│ may compare communities, study records, interview or survey   │
│ people, observe social settings, analyse evidence and explain  │
│ what the findings mean for research, policy, education,       │
│ organisations or communities.                                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Questions this field helps answer                            │
│ [How do families, communities and institutions shape lives?]  │
│ [Why do inequality, crime and other social problems develop?] │
│ [How do cultures, organisations and societies change?]        │
│ [How can evidence show whether a policy is working?]          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ What the work can produce                                    │
│ [Research questions and proposals] [Study and field records]  │
│ [Analyses and interpretations]    [Reports and presentations] │
│ [Evidence-based recommendations, where supported]             │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ How the work usually happens                                │
│ 1. Start with a question about people, groups or change.      │
│ 2. Choose a suitable research approach.                       │
│ 3. Gather and handle evidence ethically.                      │
│ 4. Compare and analyse what the evidence shows.                │
│ 5. Explain findings, limits and possible next questions.       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Where your programme fits                                    │
│ Sociology is one programme within Social Sciences. Its        │
│ curriculum focuses on social structure, culture, groups,       │
│ institutions, inequality, crime, family, social change and    │
│ research. Other programmes approach the field from a          │
│ different centre, such as economics, politics or psychology.  │
│                                                              │
│ Could this field suit you?                                   │
│ It may interest you if you like asking why people and         │
│ communities behave differently, understanding institutions,   │
│ investigating real problems or using evidence to explain      │
│ change.                                                       │
│                                                              │
│ [Read more about Social Sciences]                             │
└──────────────────────────────────────────────────────────────┘
```

The API contract supports `shortIntro`, `whatItStudies`, `whatPeopleDo`,
`questions`, `outputs`, `howWorkHappens`, `whereProgrammeFits`,
`decisionGuide`, `relatedProgrammes` and an honest source note. The first
sentence may appear in the hero, but the decision-making explanation belongs
in the expanded orientation cards below it. Questions, outputs and work steps
are individual cards or numbered steps so the student can scan them without
reading a dense paragraph.

`Read more about [domain]` is made from domain-owned resources only. Each
resource keeps its own title, purpose, provider, access state and verified URL;
the link is attached to that resource card. A generic source footer, a raw
`Sources checked` list, or a role resource silently reused as a domain resource
is not acceptable. If the orientation or a specific link has not been reviewed,
the UI says so instead of inventing detail.

For D078, the reviewed Social Sciences orientation is grounded in the Sociology
CCMAS contract, the domain-owned guidance records and the programme-to-domain
evidence. Other domains must receive their own source-grounded orientation
objects before scaling; D078 copy must not be copied to them. A domain with no
reviewed orientation may show only its verified description plus an explicit
review state, never a richer paragraph inferred from role names or frequency.

### Subgroup and role hierarchy

Subgroups are cards in a grid. Each card explains what the subgroup studies,
what it adds to the domain, the inherited foundation and the verified role
count. Roles are cards in a grid inside the selected subgroup. A role must not
appear as a flat list on the domain overview and an unassigned role is a data
quality issue, not a reason to create a fallback list.

The continuation must be visible at each level:

```text
What the programme has introduced
       -> what the domain shares
       -> what this subgroup adds
       -> what this role requires or produces
```

Inherited items are labelled as inherited and are not duplicated as though
they originated at the current level. The role page explains the work, outputs,
application contexts and preparation sequence before showing its connected
items.

### Item cards: skills, tools, competencies, qualifications

Skills, tools, competencies and certifications are separate concepts but are
shown together when their relationship helps the student understand the work.
They are never four unexplained lists.

```text
Competency: [source-backed outcome]
  What it means here and what work it supports.
  Uses these skills: [specific skills]
  May use these tools: [verified alternatives]
  May require/support: [qualification or certification, if applicable]

  [Open competency-specific link]
  [Open skill-specific link]
  [Open tool-specific link]
  [Open qualification/certification link]
```

The distinctions are mandatory:

- a skill is a specific ability;
- a tool is an optional instrument/software choice that supports work;
- a competency combines knowledge, skills, methods and judgment to produce an
  outcome; and
- a certification or qualification is a route, credential, licence or evidence
  of training, not automatic proof of competence.

Each displayed item has its own verified specific link when one exists. A
missing link says `No verified learning link is available for this item yet`.
No generic provider homepage, unrelated course, search URL or shared resource
button may be used to fill the gap. The card must also explain what the item
does in this domain/subgroup/role, what it is used for, how it connects to
other items, and which alternatives are valid where the data supports that
claim.

Tools may have a contextual side-by-side comparison only when at least two
verified options support the same task. Skills normally show sequence and
prerequisites, not a ranking. Competencies show their ingredients. Certifications
are compared only when they are genuinely equivalent and provider, scope,
eligibility and recognition data are complete. None is silently presented as a
universal requirement.

Certification scope must be explicit when supported:

```text
Nigeria          Nigerian professional/regulatory/sector route.
Global           International route or reference.
Nigeria + Global Both evidence layers are recorded.
```

The card must distinguish a licence, examination, qualification, training
route and reference organisation. A professional or research organisation is
not called a mandatory certification unless the source establishes that
requirement.

### Selection, review and report behaviour

The tick/check action selects a programme, university, domain, subgroup, role
or other explicitly selectable guidance item. It is not a “save every card”
workflow. The guidance path accumulates selections in one session/checkpoint,
so a student can select multiple domains and subgroups without repeatedly
opening save actions. The student may save a resource to Saved/My World, but
that is separate from completing the guidance path.

Print, download and share controls remain hidden or disabled until Review is
complete. At Review, use compact icon actions for print, download and share;
the report is generated from the completed structured path and includes the
selected university, programme, relationship path and selected downstream
items. Sharing may offer email, WhatsApp and connected storage targets only
when an actual integration is available; do not promise a provider that is not
wired.

### Scaling rule after Sociology approval

Do not copy Sociology text to other programmes. Scale the contract in this
order:

1. audit and clean the next programme's own curriculum and outcomes;
2. verify its programme-to-domain edges and relationship types;
3. resolve domain ownership separately from subgroup and role ownership;
4. attach only item-specific, checked links and honest access labels;
5. generate programme-specific connection explanations and continuation data;
6. render the same box/card shape with that programme's actual content;
7. run negative tests for cross-programme leakage, role aggregates, missing
   links, unresolved requirements and stale guidance context; and
8. accept the programme only after the audit and UI payload agree.

The shape is shared across all programmes, domains, subgroups and roles. The
content, relationship explanation, inherited foundation, additions, links and
qualification boundaries remain specific to the selected records. This is the
point at which the broader programme-to-domain-to-subgroup-to-role goal may
resume; it is not complete merely because the cards render.

### 6C. What-the-work-does enrichment at every level

The explanatory layer is not a domain-only feature. Every level must answer
the student's practical question before exposing its item cards:

```text
Programme
  What the programme studies, what it teaches, what students practise,
  and what university-specific continuation is still required.

Domain
  What this field studies, the questions it addresses, what people do,
  what work can produce, and how work normally happens.

Subgroup / focused area
  What this area studies, which domain foundation it inherits, what it adds,
  what kinds of questions or outputs it supports, and which roles belong here.

Role
  What the person actually does, what problem the work helps solve, what it
  produces, where it can be used, and what preparation is normally added.
```

The subgroup must not be a renamed role list. Its opening card explains the
focused way of working and then separates inherited domain foundations from
new methods, skills, tools, competencies and qualifications. The role must not
be a bag of source rows. Its opening card turns the reviewed role evidence into
a short work narrative, followed by an ordered preparation path.

At each level, item cards explain the local meaning of the item. For example,
the same Python record may say that it supports statistical analysis in a
domain, data preparation and modelling in a subgroup, or a particular analysis
workflow in a role. The renderer must never reuse a generic description when
the source-backed context differs. The same rule applies to skills,
competencies, tools, methods and qualifications.

The implementation contract therefore requires these fields or their
equivalent structured records at each level:

- `whatItStudies` or an equivalent student-facing meaning;
- `whatPeopleDo`;
- `questions` or problems addressed;
- `outputs` or work products;
- `howWorkHappens`;
- inherited items and newly added items;
- item-specific purpose, relationships, alternatives and verified link state;
- source provenance and an honest review/unavailable state.

If the current data cannot support a field, the interface leaves it out or
shows a concise review state. It must not fill the gap with role frequency,
neighbouring programme text, a generic software category, or a copied domain
paragraph.

### 2026-09-21 role-profile evidence update

The role work-profile enrichment pass continued with a non-overlapping
read-only tranche of 20 missing role profiles. Vendored European Commission
ESCO identity evidence is retained with exact locators, but it is not treated
as a substitute for the application's work-profile fields, Nigerian demand
evidence or student preparation content. Because the public ESCO API could not
be reached in this local run, the rows remain explicitly review-required. This
preserves the rule above: unsupported work activities, context, job zones,
qualifications or local mappings must not be invented to make a card look
complete.

### 2026-09-19 implementation evidence for the Sociology slice

The local Sociology render path now applies the contract's ownership and
method rules: methods are shown inside an expanded exact-match skill or
competency card, relationship labels can resolve across the full owned item
set, and D078 roles require exact role-owned context before student display.
The local checks passed TypeScript, the Vite web build and 335 backend tests.
This is local implementation evidence only; the route is not approved for
scaling until browser interaction, live payload, item-link, relationship,
certification and report-gate checks are complete.

### 6D. Review-only relationship closure

The active student path is fail-closed. A programme-domain edge is shown only
when its relationship is exactly `direct`, `functional` or `adjacent` and its
evidence gate has passed. Review-only edges remain available to staff/source
audit but are not student-facing connections. Unsupported Adjacent records are
moved to `unverified_links` with the reason and audit reference; they are not
silently downgraded, promoted or rendered as a weaker connection.

Duplicate programme-domain rows are resolved deterministically by the
relationship strength `direct` → `functional` → `adjacent`. Unknown or blank
relationship values are ignored, never defaulted to Adjacent. The backend and
the client both follow this rule so a malformed row cannot create a false
career path.

### 2026-09-19 local route-contract evidence

`pnpm.cmd run test:sociology-route` passes five focused Sociology transitions
from programme preview through university context, D078 domain, subgroup and
role, and verifies retention of the exact programme/JAMB/university context. This is
the current local equivalent route smoke while Jest preset resolution remains
unavailable; it does not replace browser render proof. The award/duration
display patch is source-backed and prepared as an additive manual migration,
not live-data evidence. Sociology remains open and no all-programme
propagation is authorized by this note.

### 2026-09-19 report-gate implementation evidence

Local commit `187784c` gates student report print/download/share actions on a
completed Review containing stable programme and university context, and
reopens Review after a selection change. This satisfies the local contract
shape but not browser or live Supabase proof; the focused Jest test remains
blocked by missing Jest Expo/circus dependencies. Sociology is still open and
must pass its remaining gates before all-programme propagation.

Browser interaction proof is still absent in this environment: computer-use
returned no browser surface and the local Vite dev server was blocked by the
managed workspace while resolving its config. Build and route-smoke success
must not be treated as browser-render evidence.

### 2026-09-19 admin/institution local checkpoint

The local implementation now keeps organisation identity source-backed, carries
official university identity/address through the student offering payload, and
shows SkillsGap evidence in separate taught, curriculum-review gap, and
source-review partitions. Verification passed for 92 focused backend tests,
TypeScript, the five-transition Sociology route smoke, and the production web
build. This does not constitute live Supabase or browser evidence; Sociology
remains open and scaling is still blocked by the outstanding acceptance gates.
### 2026-09-19 integrated Sociology passes

The student guidance hardening is integrated in `f57e4da`, and the
admin/institution pass is integrated in `e1635fc`. Local verification passes
336 backend tests, larger-heap TypeScript, the complete five-transition
Sociology route smoke and the production web build. Browser/live Supabase
payload and report E2E evidence remain required before all-programme
propagation.

### 2026-09-19 source-backed Sociology contract audit

The D078 source audit preserves the product-wide rule that source references
are evidence, not automatically item-specific learning links. Of 725 local
contextual items, all are approval-ready on metadata; 27 have a reviewed
item-specific resource and 698 must retain
an explicit no-link state. The 51 reviewed URLs have valid HTTPS syntax only;
reachability was not tested. Normalized relationships are 2,519/2,519 resolved
source-backed rows. Generic credential signals remain in source audit data and
are not emitted as student-facing certifications. This is local evidence, not live or
browser acceptance evidence.

### 2026-09-19 Sociology scaling boundary

Local route/report smoke and the full backend suite pass, but the live
Sociology contract remains unapplied. The base Supabase preflight is ready;
the current live project still lacks the curriculum/evidence/relationship
tables and current contextual ownership metadata. All-programme propagation
must remain paused until the manual SQL apply, post-apply verification and
browser proof are complete.

### 2026-09-19 user-authorized scaling phase

The broader scaling implementation may now proceed locally while SQL apply and
the final live/browser gates are deferred to the end of the scaling phase.
This is a sequencing decision, not approval to expose unapplied records:
production student guidance remains fail-closed until the corresponding
contract tables and seeds are live and verified. All scaled work must retain
source locators for externally populated relationships/resources and must carry
the Sociology downstream audit checks for ownership, review state, unresolved
edges, stale context and legacy-array leakage.

### 2026-09-19 broad source-enrichment checkpoint

The scaling contract now includes a broad, fail-closed inventory for all 420
JAMB identities and all 237 canonical programmes. Partial, external-only,
combined and split CCMAS cases retain their component and source locators;
missing resource links and unresolved relationships remain review states rather
than generic URLs or inferred edges. The corresponding artifact is
`data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json`,
with a focused **3-test** gate. Admin provenance and review-state rendering is
included as a required pending surface for every programme. Browser proof,
URL-reachability proof and SQL deployment remain the final gates.

### 2026-09-19 admin/downstream acceptance checkpoint

The local admin review surface now treats context identity and ownership as
approval prerequisites. A record without a stable context key, a record whose
`guidance_owner` does not match its context level, or a record without source
trace/access metadata remains in an explicit admin queue state and cannot
become student-backed. The checkpoint evaluates the full 237-programme and
420-JAMB boundary; Sociology/Nursing/Accounting remain smoke fixtures only.

The one unmapped `Sciences::Mathematics` row, unresolved relationships and
remaining review states stay visible as open work. Institution identity,
aggregate/consent boundaries and route-specific Review report locking are
covered locally. Full admin rendering, live payload, browser proof and SQL
acceptance remain deferred and student exposure stays fail-closed.

### 2026-09-21 full-population downstream/admin audit checkpoint

The local audit now covers all **237 programmes** and **420 JAMB identities**:
237/237 programme route records have downstream coverage across 1,344 domain,
3,580 subgroup and 46,941 role routes in 5,668 contexts. Curriculum summary,
friendly-title, bounded role-learning, source/link-state, relationship-grouping,
admin provenance and student-safe static checks pass locally. The canonical
catalogue is 121,377 items / 408,163 relationships; 2,305
not-established/unresolved relationships and all programme review queues remain
staff-review states. A stale Nursing smoke-fixture key was corrected to
`Allied Health Sciences::Nursing Sciences`. No UI or SQL changed; browser,
live-payload and deployment gates remain open.

### 2026-09-21 role-profile evidence tranche 005

The role-profile evidence pass continued with queue positions 81-100. It
verified 15 recorded O*NET identities against official item-specific summary
pages and retained 5 ESCO identities with exact repository locators and
occupation-skill relation evidence. All 20 remain `review_required`; no
O*NET-style profile, Nigerian demand claim or student preparation content was
invented. Nineteen missing role profiles remain. The mockup contract is
unchanged: unsupported role detail stays explicitly review-only, and browser,
live-payload and SQL proof are still final gates.

### 2026-09-21 external item-evidence checkpoint: tranche 007

The item-link contract was applied to the next 32 canonical contextual
identities outside D078 and prior item tranches. Twenty-one records now carry
authoritative item-specific evidence; eleven remain explicitly
`review_required` because the source is broad, combined or not sufficiently
context-specific. Evidence retains the external URL, authority, locator,
summary and access date. The item-only pass did not modify relationships,
catalogue rows, student UI or SQL, and no generic URL was promoted. Student
rendering remains fail-closed until the remaining enrichment, browser and live
deployment gates are complete.

### 2026-09-21 external item-evidence checkpoint: tranche 008

The item-link contract was applied to the next 32 non-overlapping canonical
identities after tranche 007. Twenty-one records carry authoritative
item-specific evidence and eleven remain `review_required` because the source
is retired, broad, combined or context-ambiguous. Each row retains its URL,
authority, locator, evidence summary and access date. No relationships were
searched or promoted, and no catalogue, student UI or SQL behaviour changed.
The student path remains fail-closed for unresolved or unreviewed evidence;
browser, live-payload and deployment gates remain open.

### 2026-09-21 item-enrichment tranche 010

The next 16 non-overlapping contextual item identities after tranche 009 were
searched against authoritative item-specific sources. Fourteen received linked
evidence and two remain `review_required` because the source supports the
components of the combined engineering safety-and-reliability label but does
not establish that exact combined item. Every row retains its URL, authority,
locator, evidence summary and access date. No relationship, catalogue,
student UI or SQL behaviour changed; the item-link contract remains
fail-closed and browser/live-payload acceptance remains open.

### 2026-09-23 current execution-order clarification

The dated boundary and scaling notes above are historical checkpoints. For the
current goal, local subject/JAMB audits, the corrected all-420 JAMB resource
check and the full 420-JAMB/237-CCMAS downstream/admin checks precede any SQL.
SQL is the final manual deployment phase. Its contextual migrations and
curriculum seeds follow their dependency order, and the 35 compressed
contextual seed parts are loaded last in numeric order. Local audits, mockup
checks, REST reads and browser checks do not constitute live deployment proof.
