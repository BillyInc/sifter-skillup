# Career-intelligence learning path: product decisions

Status: product decision draft from the user's planning note, 2026-10-07.

Terminology contract: a **subgroup**, **area of specialization**, and **area of practice** are the same middle layer. The hierarchy is **programme → domain → area of specialization/practice → role**. A domain without a justified middle layer uses **domain → role**.

## Product goal

Help a learner understand what their programme taught, how that preparation transfers into a domain, and what additional learning opens routes into different areas of specialization/practice and roles. Do not imply that a programme or domain foundation alone qualifies someone for every job in the domain.

Each stage should explain its work and boundaries, identify what is already transferable from the learner's programme, and show the additions needed for the next stage. Global practice is the baseline; Nigeria-specific standards, credentials, pathways, and context are explicitly labelled as Nigerian rather than presented as universal.

## Information architecture

1. **Programme preparation** — present the curriculum and outcomes faithfully, in student-friendly theme groups. Attach global and Nigerian learning resources to the relevant curriculum themes; distinguish what the source curriculum teaches from optional external preparation.
2. **Programme-to-domain entry** — each domain card has a concise description, the relationship label (direct, functional, or adjacent), and a plain-language explanation of why this programme connects to the domain.
3. **Domain overview and foundation** — explain the domain's work, participants, expectations, opportunities, limitations, and the preparation this programme transfers. Show only capabilities genuinely shared across the domain's supported routes as the common foundation. Rank items by breadth of usefulness, not by unsupported labour-market-demand claims.
4. **Area of specialization/practice** — explain what this area does, how it differs from sibling areas, and what it adds to the domain foundation. Areas are not ISCO buckets; occupational codes alone do not establish specialization fit.
5. **Role** — explain role tasks, work context, entry expectations, and the additional role-specific capabilities beyond the selected area and domain foundation. A justified direct domain-to-role path remains available where no area is appropriate.

## Learning-item model and display

Keep item type explicit: **skill, competency, tool, method, or certification**. Cluster items into use cases (the preferred primary grouping) where items solve the same kind of problem; use themes only when a use case would imply false equivalence. For each item store its scope/level, explanation, importance, global/local applicability, prerequisites, evidence, and learning links.

Distinguish:

- **Broad foundation**: shared across multiple supported areas/roles in the domain.
- **Useful next capability**: strengthens readiness across several routes but is not universal.
- **Area addition**: needed or useful for a particular area of specialization/practice.
- **Role addition**: tied to the tasks or entry requirements of a particular role.
- **Optional alternative**: one of multiple tools or methods that can serve a similar use case; alternatives must not be shown as cumulative requirements unless evidence says they are.

Show why an item is placed at its level, which downstream paths it supports, and whether it is required, commonly expected, optional, or an alternative. Item relationships (prerequisite, complements, alternatives, or used-together) require their own evidence and must not be inferred from co-occurrence alone.

## Selection and report behavior

### Decision

Allow granular selection, but treat selections as **learning preferences and planning constraints**, not as evidence of competence or automatic qualification. The user may select several items across different use cases. Within one use case, allow multiple items only when they are complementary; if they are alternatives, prompt the learner to choose one or explicitly mark a multi-tool plan.

The selected **goal path**—domain, one or more chosen areas, and optionally a role—is the primary control on downstream content. Selections filter and prioritize learning recommendations; they do not alter the underlying taxonomy or create new role links.

### Preventing confusing downstream combinations

- Preserve each item as a typed, separately identifiable choice; do not flatten several selected tools into one ambiguous “skill set.”
- Build one report around one selected destination path at a time. If the learner chooses multiple areas or roles, show separate route sections with their shared foundation deduplicated and each route's additions clearly separated.
- If several selected items are alternatives for the same use case, show the chosen alternative(s), trade-offs, and downstream routes each supports. Never count every alternative as a cumulative prerequisite.
- If a chosen item has no evidenced relationship to a route, say “relationship not established” and keep it out of the route's required list.
- Let the learner add/remove selections and compare the resulting route plans; retain a way to view the unfiltered baseline.

This gives learners choice without making the data matcher invent a path from arbitrary combinations. The matching rule is evidence-backed relation + selected destination + prerequisite status, not keyword overlap alone.

## Comparison and relationship matrix

For a selected domain or area, compare options within each use case using: purpose, where it is used, prerequisites, cost/access where verified, global/Nigerian context, and which downstream routes it supports. Mark unknown fields as unknown; do not imply that tools are interchangeable merely because they share a theme.

The relationship matrix should record source-backed edges between typed items and between items and routes. Minimum edge kinds: `prerequisite_for`, `complements`, `alternative_to`, `used_with`, and `supports_route`. Each edge needs rationale, evidence/source locator, scope/geography, and confidence/review state. A missing edge is “not established,” not “no relationship.”

## Admin implications

Administrators need to see the exact selected destination path and typed learning choices, including alternatives and evidence status. The authoring view should expose the mapping from programme preparation → common domain foundation → area additions → role additions, so staff can create a route-specific plan rather than a generic domain/area/role card. Student selections must not silently change canonical curriculum or taxonomy data.

## Quality gates before student activation

1. Canonical area records have stable identifiers independent of ISCO and preserve reviewed names, boundaries, evidence, and explicitly justified no-area decisions.
2. Every role route has separate parent-domain fit and area-of-specialization fit dispositions; role fit cannot be inferred from ISCO membership or subgroup membership.
3. Every area-specific item and relationship is attached to the correct area and has provenance; only genuinely shared items appear at domain foundation.
4. Nigerian context is explicitly scoped and cannot stand in for global evidence; global and Nigerian claims are independently attributable.
5. Multi-selection tests prove alternatives are not accumulated as requirements, multiple destinations produce distinct route sections, and absent evidence fails closed.
6. Admin and student payloads use the same reviewed route IDs and do not leak unresolved/audit-only candidates as established requirements.

## Open evidence questions (not product blockers)

- Whether any particular item is a universal domain foundation, an area addition, or role-specific must be settled from its source evidence, not by this UI policy.
- Demand, salary, local availability, accreditation, and licensure claims require their own current sources and geography; the planning note's autonomous-vehicle roadmap is a discovery lead, not accepted evidence.
- The global specialization catalogue still needs its source/canonical integration blockers resolved, and role-domain/role-area dispositions still need completion before the student-facing route can be called complete.

