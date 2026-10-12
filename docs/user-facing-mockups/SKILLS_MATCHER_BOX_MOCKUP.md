# Skills matcher — box mock-up, behaviour and state contract

Status: implementation contract

## Product decision: one search, four clearly labelled item types

The student should not have to decide whether a thing is a skill, competency,
tool or certification before searching. The matcher uses one plain-language
input — **Things I know or want to learn** — and labels every result by type.

The labels answer a different question for the student:

| Label | Plain meaning | How it is used in the matcher |
|---|---|---|
| Skill | A capability you practise, such as Python or data analysis. | Main transferable capability used to find routes. |
| Competency | A broader ability to apply knowledge well, such as research design or safeguarding. | Shows the supporting ability needed to become competent in a route. |
| Tool | A named software, platform, instrument or workflow system. | Shows what can help with the work; it is not automatically required. |
| Certification | A qualification, licence or professional route. | Shows a possible formal route and its scope; it is not automatically required. |

The input is combined for simplicity, but the result cards never hide the type.

## Student entry box

```text
┌──────────────────────────────────────────────────────────────────────┐
│ SKILLS MATCHER                                                       │
│ See where what you know can take you                                │
│ Search one capability or build a combination. We show the route and  │
│ the extra things to learn before calling it a good fit.              │
│                                                                      │
│ [ I already know ]  [ I want to build ]                              │
│                                                                      │
│ Things I know or want to learn                                      │
│ [ Search Python, research design, Excel or a certification     ] [+] │
│                                                                      │
│ Selected: [ Python × ] [ C++ × ] [ Research design × ] [Clear all]   │
│                                                                      │
│ Match: (●) Use all selected items   (○) Use any selected item        │
│                                                                      │
│ [All fields] [Computing] [Business] [Social sciences] ...            │
└──────────────────────────────────────────────────────────────────────┘
```

Adding or removing a chip recomputes the mapping. The previous selection is
not silently retained after **Clear all**; the empty state is explicit.

## Results box: route first, preparation second

```text
┌──────────────────────────────────────────────────────────────────────┐
│ POSSIBLE ROUTE                                                       │
│ Quantitative finance                                                 │
│ Computing → Data and quantitative work → Quantitative researcher     │
│ Strong match · Uses all 2 selected items                             │
│                                                                      │
│ You already bring:  Python · C++                                    │
│ To become competent here, build next:                               │
│ [SKILL] Probability and statistics        Start here                 │
│ [COMPETENCY] Model validation              Build next                 │
│ [TOOL] NumPy / pandas                      Useful later               │
│ [CERTIFICATION] CFA or related route       Optional                   │
│                                                                      │
│ [Open domain] [Open subgroup] [Open role]                            │
└──────────────────────────────────────────────────────────────────────┘
```

The route is a catalogue connection, not a promise of employment. A tool or
certification appears as support unless the source explicitly establishes it
as required.

## Cumulative path: show exactly what each layer adds

The route card must not suggest that finishing the domain foundation makes a
learner ready for every specialization or role. Show the selected route as a
cumulative, explainable path:

```text
DOMAIN FOUNDATION
Common employability foundation for pursuing work across valid areas; grouped by theme/use case
  ├─ Area of specialization: adds the verified methods/items for this area
  │    └─ Role: adds task-specific tools, competencies and qualifications
  └─ Direct-to-role route when no specialization is justified
```

The domain foundation is not a generic introduction: it should identify the
cross-branch capabilities that prepare a learner to pursue work in the domain.
It does not by itself guarantee eligibility for every occupation; a selected
specialization and role show any additional requirements, licensing or evidence
needed for that route. Do not assign a universal item-by-item learning order at
the domain layer. Sequence the added learning within the selected
specialization, then the role route.

Example item presentation (illustrative layout; every actual item/path still
requires its own evidence):

```text
DOMAIN FOUNDATION · Theme: Spatial analysis

[TOOL] [Verified GIS tool]                         USEFUL
Use case: map and compare spatial patterns
Why it is here: supports this use across more than one domain route
Supports these paths:
  → [Area of specialization] — useful for this route
  → [Role] — needed for this role's evidenced mapping task
Evidence: [open source]  ·  Learning link: [open tool lesson]

Selected role path
  Domain foundation       Shared starting items
  Area of specialization  Adds this area's distinct methods
  Role                    Adds job-task requirements
  [Show combined learning checklist]
```

The labels mean:

- **Theme/use case** groups related items by the work they support; it does not
  change the item's visible type label.
- **Requirement level** says whether the item is needed, useful, or optional
  for this specific path. **Learning order** says when it is a sensible next
  step. These are separate: an optional tool may be useful early, and a needed
  competency may build on a foundation.
- **Supports these paths** names only evidence-backed downstream destinations.
  It does not mean the item alone causes or guarantees employment.
- If an item is unique to one specialization, it belongs on that specialization
  card, not in a domain-wide foundation list. Domain-level items are genuinely
  shared foundations, or explicitly marked bridge items whose supported
  destinations are shown.
- Opening a role combines and deduplicates the domain foundation, the selected
  specialization, and the role layer. Each checklist row keeps its originating
  layer and path-specific status so the student can see what is shared and what
  is added at each step.

The UI should make the route itself selectable/expandable, so a learner can
compare two specializations or roles without treating one domain checklist as
universal. If the learner has selected an area or role, prioritize that exact
cumulative path; otherwise show the shared foundation plus clearly separated
downstream branches.

## Combination behaviour

```text
Input set                    All selected                     Any selected
Python + C++                 Only routes containing both      Routes containing either
Python + Excel + SQL         Narrower intersection            Broad exploration union
Remove C++                   Recompute from Python            Recompute from Python/Excel/SQL
Add research design          Recompute all four together      Add routes containing it
```

The backend evaluates the full selected set against every source-backed domain,
subgroup and role record. The UI may paginate or collapse the display, but it
must not cap the actual mapping to the first few catalogue rows. “See all” is a
presentation control, not a data limit.

## Empty, loading and unavailable states

```text
Empty       ┌──────────────────────────────────────────────────────────┐
            │ Start with Python, Excel, communication or data analysis │
            │ Add one item to see connected routes.                    │
            └──────────────────────────────────────────────────────────┘

Loading     ┌──────────────────────────────────────────────────────────┐
            │ Following your selected items through the career map…   │
            └──────────────────────────────────────────────────────────┘

No match    ┌──────────────────────────────────────────────────────────┐
            │ No source-backed route matched all selected items.      │
            │ Try “Use any selected item”, remove one chip, or add a  │
            │ supporting capability.                                  │
            └──────────────────────────────────────────────────────────┘

Unavailable ┌──────────────────────────────────────────────────────────┐
            │ The matcher is temporarily unavailable. Your chips are   │
            │ still here; try again without losing the selection.      │
            └──────────────────────────────────────────────────────────┘
```

Review-only, audit-only, not-established and unverified evidence never becomes
a student route. Admin users may inspect those rows in the admin evidence queue,
but the student matcher only consumes source-backed rows owned by their level.

## Admin lens

```text
Secondary-school admin
┌──────────────────────────────────────────────────────────────────────┐
│ WHO ARE YOU GUIDING?                                                 │
│ [SS1] [SS2] [SS3]                                                    │
│                                                                      │
│ Choose one or more secondary-school levels.                          │
└──────────────────────────────────────────────────────────────────────┘

Tutorial-centre admin
┌──────────────────────────────────────────────────────────────────────┐
│ WHO ARE YOU GUIDING?                                                 │
│ [JAMB]                                                               │
│                                                                      │
│ JAMB is the only learner audience for tutorial centres.              │
└──────────────────────────────────────────────────────────────────────┘

University admin
┌──────────────────────────────────────────────────────────────────────┐
│ No undergraduate learner selector is shown.                          │
│                                                                      │
│ University admins do not receive an undergraduate guidance audience. │
└──────────────────────────────────────────────────────────────────────┘
```

The admin lens is selected from the admin's institution type: secondary
schools see SS1, SS2 and SS3; tutorial centres see JAMB only; universities do
not see an undergraduate learner selector. The same combined search and its
four visible item labels are used wherever a learner audience is available.
The audience changes which learner context informs the result, not the item
types or evidence rules. Admins see student-safe results plus that context;
the matcher is not a shortcut for exposing review-held sources.

## State mapping

| State | Trigger | Required UI | Student data rule |
|---|---|---|---|
| `empty` | No selected items | Intro, examples, no result cards | No catalogue export |
| `editing` | Text entered but not added | Add action enabled, no request yet | No speculative match |
| `pending` | A valid selection is being evaluated | Preserve chips and show progress | Previous result is replaced only when the new response arrives |
| `real` | Source-backed response returned | Routes, labelled items, gaps, links | Only approved/source-backed rows |
| `no_match` | `real` response has no route | Explain all-vs-any and suggest edits | Do not invent a nearby route |
| `unavailable` | API/database unavailable | Keep selection and offer retry | Never show cached data as current evidence |
| `guest` | No authenticated learner | Explain sign-in boundary | No private matcher request |

### Admin audience state mapping

| Admin institution | Audience selector state | Available audience values | Result context |
|---|---|---|---|
| Secondary school | `secondary_school` | `SS1`, `SS2`, `SS3` | The selected secondary level or levels guide the next-step context |
| Tutorial centre | `tutorial_centre` | `JAMB` only | JAMB preparation guides the next-step context |
| University | `university` | No undergraduate option; do not render an undergraduate selector | No undergraduate learner guidance context is requested |

Changing a permitted audience recomputes the results for that audience while
preserving the selected search items. An unavailable audience is not silently
substituted with another audience, and a university admin cannot obtain an
undergraduate view through this control.
