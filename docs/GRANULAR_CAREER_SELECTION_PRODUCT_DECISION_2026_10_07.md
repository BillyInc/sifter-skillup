# Granular career-learning selections — product decision

**Status:** Recommended decision for product review  
**Date:** 2026-10-07  
**Related specification:** `docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_SPEC_2026_10_07.md`

## Terminology and scope

In this product, **subgroup = area of specialization = area of practice**. It is one layer between a domain and its roles. This decision concerns how a learner selects skills, tools, competencies, certifications, methods, and learning resources at the domain foundation and sees their implications downstream.

The user-provided guided-experience note is design input, not evidence that a particular tool, role, certification, or learning sequence is correct. Career claims and pathway relationships still require source-backed records.

## Decision

Use **guided multi-selection with typed relationships and an explicit route preview**. Do not make every item a required checkbox, and do not let a flat collection of selections silently become a new pathway.

1. Keep item type visible (`Skill`, `Tool`, `Competency`, `Certification`, `Method`, or `Resource`). Group items primarily by the use case they support. A use case is a way to find and compare items, not a replacement category.
2. Allow a learner to select multiple complementary items in a category. If items are alternatives, present a default single choice and an explicit “Compare alternatives” action. Comparing creates separate route options; it does not make every alternative a requirement.
3. Distinguish “recommended,” “selected for my plan,” “already know,” and “completed.” Selecting an item means “include it in the plan,” not “I have mastered it.”
4. Before moving from the domain to an area of specialization, show which areas and roles have evidence-backed links to the selection, what each selected item contributes, and what remains unknown or unlearned.
5. At the next level, carry forward only items with an explicit, evidence-backed relationship to that branch. Show the shared domain foundation once, then add area-specific and role-specific requirements as deltas.
6. A report may include multiple destinations, but it must separate distinct routes. Shared items can be summarized once; alternatives and route-specific requirements remain in their own branches. Never merge different routes into one checklist that implies every item is required for every role.
7. Support global practice as the baseline and show Nigeria-specific context separately. A local credential, regulator, or practice condition must not be presented as globally required.

## Downstream rule

Selections affect downstream display only through explicit relationships such as `supports`, `requires`, `builds_on`, `complements`, or `alternative_to`. Every relationship needs its own evidence, explanation, and state. Category membership, text similarity, or co-occurrence is not enough to imply that an item leads to an area or role.

For a selected set, the route preview should report:

- **Shared support:** destinations supported by the whole relevant set or by its explicitly linked items.
- **Complementary additions:** items that work together for the same task or pathway.
- **Alternative branches:** separate choices with their own trade-offs and downstream requirements.
- **Unmapped selections:** items with no established downstream edge; keep them visible but state that the impact is not established.
- **Remaining requirements:** pathway requirements not satisfied by selections or prior learning; do not confuse selection with completion.

“Supported destination” means that the data contains a reviewed relationship. It is not a promise of admission, employability, licensing, or job placement.

## Example: Python and C++ toward autonomous-vehicle work

Treat the pasted roadmap as a prompt for exploration, not a verified curriculum. The interface should first ask which work the learner wants to explore (for example, perception, localization, planning/control, embedded systems, or safety/verification). It should then show the current evidence-backed domain foundation and let the learner add or compare relevant tools and methods. A selected simulator, middleware, or language should influence only the branch whose reviewed tasks use it. SAE automation levels can be used as a separate vehicle-capability context, not as a learner seniority ladder or a guarantee that completing a level's list makes the learner qualified.

The system should not say “Python + C++ leads to Level 4/5 autonomy.” Instead, it should explain which tasks those languages support, what other competencies or tools the chosen branch requires, what is optional or alternative, and which links remain unverified. The domain foundation is shared preparation, not a promise of readiness for every specialization or role.

## Box mockup: choose items, then inspect pathway effects

```text
┌─ DOMAIN FOUNDATION · AUTONOMOUS SYSTEMS ─────────────────────────────┐
│ Shared preparation across reviewed areas; not a job-readiness claim. │
│                                                                      │
│ USE CASE: Prototype and evaluate software                           │
│ Skill       Python programming            [Selected] [Evidence]      │
│ Tool        Simulator A                   [Choose]   [Compare]       │
│ Tool        Simulator B                   [Choose]   [Compare]       │
│ Relationship: Simulator A and B are alternatives for this task.     │
│                                                                      │
│ USE CASE: Build low-latency vehicle software                        │
│ Skill       C++ systems programming        [Selected] [Evidence]      │
│ Tool        ROS 2                          [Optional] [Why it fits]  │
│ Relationship: ROS 2 complements selected C++ for the reviewed path. │
│                                                                      │
│ SELECTED FOR MY PLAN: Python · C++                                    │
│ [Already know] [Mark completed] are separate states.                 │
│                                                                      │
│ ROUTE PREVIEW                                                        │
│ • Perception: selected items support parts of this path; more needed │
│ • Localization: no complete route can be inferred from these alone  │
│ • Planning & control: inspect branch-specific methods and gaps       │
│ • Safety/verification: not included unless selected or required      │
│                                                                      │
│ [Continue to areas of specialization] [Compare route options]        │
└──────────────────────────────────────────────────────────────────────┘
```

## Box mockup: downstream branch and report

```text
┌─ AREA OF SPECIALIZATION · PERCEPTION ────────────────────────────────┐
│ What this area does · boundaries · global practice · Nigeria context │
│                                                                      │
│ You bring from the domain foundation                                │
│ Python · C++                                                        │
│                                                                      │
│ Add for this area                                                    │
│ Computer vision [required for this route]                            │
│ Sensor-data handling [required]                                      │
│ Framework X or Framework Y [alternatives — choose or compare]        │
│                                                                      │
│ ROLE ROUTES                                                          │
│ Perception engineer · selected items support 2/5 reviewed tasks     │
│ Remaining: sensor calibration, evaluation, deployment constraints   │
│                                                                      │
│ REPORT                                                               │
│ Shared foundation (once)                                             │
│ ├─ Route A: Perception → Perception engineer                         │
│ └─ Route B: Localization → Localization engineer                    │
│ Alternative frameworks remain separate; do not merge their checklist│
└──────────────────────────────────────────────────────────────────────┘
```

## Data contract required to implement this decision

Every selectable item needs a stable ID, explicit type, use case, scope level, requirement/optionality state, evidence, global/local context, and learning links. Every relationship needs source and target IDs, a typed relation, target route, rationale, source references, and review state. A selection snapshot should store the selected item IDs, known/completed states, selected route variants, and taxonomy version. The report renderer should derive the branch deltas from that snapshot and the explicit relationship graph; it must not infer new edges at render time.

## Critical review and limits

- **Multi-select can mislead** if complements and alternatives are rendered identically; therefore alternatives fork the preview while complements accumulate.
- **A single-select-only interface is too restrictive** for genuinely complementary tools and competencies. Start with sensible one-choice defaults for alternative groups, then permit multiple selections when relationships support them.
- **One report can contain multiple contexts and routes**, but must visually separate them and label shared prerequisites, branch deltas, alternatives, and unresolved evidence.
- **The current subgroup/role and item data may not yet contain the relationship graph this UX requires.** The UI must show “not yet established” rather than fabricate a downstream effect. This is a data/API release gate, not a reason to block the product decision.
- **The AV roadmap text is not adopted as authoritative.** Verify each technical claim against relevant standards, official project documentation, and current role-task evidence before using it as student guidance.

## Recommendation

Approve the guided multi-selection model with explicit alternatives, complements, route preview, and separate report branches. Before student release, require source-backed item relationships, stable specialization IDs independent of ISCO, and tests proving that selecting an item changes only reviewed downstream routes.
