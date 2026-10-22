# Copy-ready Grok prompt: D078 programme-to-role experience design review

Use this prompt with Grok to obtain detailed design critique and component guidance. This is a design-review brief, not authorization to change code or data.

---

You are reviewing the existing Sifter LevelUp codebase as a senior product designer and frontend systems architect. Give a concrete, evidence-based design recommendation for the current student-facing Sociology → Social Sciences → D078 learning-path experience. Do not write or modify code. First inspect the repository and the named source files; distinguish what already exists from what is missing or only described in a design document. Do not assume a feature works just because a component or contract exists. Do not scope in retired/legacy screens or the two legacy subgroup taxonomy.

## Product outcome

Design one coherent learning journey—not a collection of disconnected cards:

```text
Sociology programme (what the learner studies)
  → faithful programme themes and outcomes (what the learner is expected to understand/do)
  → evidence-backed transition into Social Sciences & Behavioural Research
  → domain orientation and compulsory domain foundations
  → skippable useful domain edges and selectable investigation methods
  → one or more recommended canonical areas, with inherited context preserved
  → area additions and useful edges
  → roles within the selected area(s), with role-specific learning
  → route-separated selection tray → My World → preview → print/download/share
```

The current source graph contains **14 Sociology themes and 236 programme outcomes**. All must be preserved and available in the programme experience; do not cap, sample, flatten, silently truncate, or duplicate them. The themes currently represented are:

1. African and Nigerian societies
2. Social work and practical change
3. Politics and organisations
4. Ideas and foundations
5. People, groups and society
6. Research and evidence
7. Communication and academic writing
8. Entrepreneurship and venture creation
9. Nigerian peoples and culture
10. Peace, conflict and security
11. Philosophy and reasoning
12. Social change and development
13. Inequality, gender and social problems
14. Technology and information

The outcomes remain grouped under their actual themes/courses. Present outcomes as capabilities connected to relevant subject matter, not a second duplicate outcome list. Distinguish what the curriculum teaches from domain enrichment. Explain transfer where supported, without implying that Sociology teaches every domain method, tool, or role capability. The domain transition must explain: what the programme already covers, how relevant learning is useful in the domain, what the domain adds, and what the connection does not prove. The existing evidence detail has an aggregate/detail-count discrepancy; student-facing displays must use individually resolved records and must not surface contradictory aggregate counts.

The D078 graph covers **7 canonical areas and 19 currently supported roles**. Read their exact names, IDs, memberships, route conditions, content and evidence from the graph; do not invent, rename, omit, or substitute them. A role may belong to more than one area. Keep each role in every supported area context; never flatten its learning into all areas or treat a method choice as proof of role qualification.

## Graph and route semantics to preserve

Use the current machine-readable route graph as the source of route relationships:

- `data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json`
- Human-readable summary: `docs/manual-review/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.md`
- Existing interaction architecture: `docs/manual-review/D078_LEARNING_PATH_UI_ARCHITECTURE_2026_10_15.md`
- Existing complaint/acceptance notes: inspect current local audit artifacts and tests; do not invent that visual acceptance has already passed.

The route graph currently contains 22 method nodes, 116 method→area routes, 9 evidence-backed combination designs, 53 combination→area routes, seven areas, and 19 role records. It includes the three D078 foundations before method choice. It has not been promoted to student-visible release; a graph artifact is not proof of rendered UI, SQL deployment, or student approval.

The learner may select one or multiple methods when evidence supports it. The graph’s nine named combination designs are not a license to show every theoretical pair as valid. Include the seven supported two-method patterns, the case-study design with multiple selectable evidence sources, and the participatory design frame with a required participatory approach plus selectable evidence methods. Explain why a combination can work, how its parts are integrated, when it fits, and its limits. Selecting a method can reorder/recommend areas, but must not make other areas disappear or claim the learner is qualified for a role.

Show typed relationships only in the relevant route context:

- **Learn first / requires**: only a verified hard dependency can block; explain the reason and offer a route-respecting way to satisfy it.
- **Builds on**: show order/context without inventing a hard gate.
- **Choose one / alternative**: present comparable options and trade-offs; do not stack all alternatives as requirements.
- **Useful alongside / complements / works with**: optional, separately selectable.
- **Supports this task/route**: explain the concrete area/role task; does not itself imply sequence or requirement.
- **Tool for**: attach tools to the method/item they support; tools are optional branches, not progression blockers.
- **Specialist extension**: show after the relevant method choice, not in the universal foundation.

Within compulsory and optional lanes, order items by the graph’s reviewed dependencies and route context—not by item type, alphabetical order, popularity, or raw graph node order. Both lanes can contain methods, skills, competencies, knowledge, tools, and certifications. The useful/optional lane is skippable; it may still have its own helpful ordering and linked alternatives. Do not present all learning as compulsory.

## Required code inspection

Inspect the current, non-legacy route and component implementations, including at least:

- `src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx` and `ProgrammeOverviewScreen.tsx`
- `src/screens/careerIntelligence/DomainDetailScreen.tsx`
- `src/screens/careerIntelligence/SubgroupDetailScreen.tsx` (this is the current canonical area screen despite the historical filename; do not reintroduce legacy subgroups)
- `src/screens/careerIntelligence/RoleDetailScreen.tsx`
- `src/components/careerIntelligence/ContextualItemList.tsx`
- `src/components/careerIntelligence/GuidedLearningTray.tsx`
- the corresponding component tests, graph tests, guided-plan state/persistence and report/print components

Trace how programme context, themes, outcomes, domain items, area items, role items, tools, resources, relationship edges, selections and saved routes move through API types and UI props. Report actual gaps with file/component evidence. Do not assume the old legacy screens should be repaired or rendered.

## User’s explicit usability requirements

The design must resolve these known problems rather than reproduce them:

1. The page flow must clearly show programme → domain → area → role; programme context must visibly precede domain foundations and explain the handoff.
2. Show all 14 themes and 236 outcomes in a usable, expandable curriculum design. Avoid duplicated outcomes (one dropdown and another copy below themes). Attach relevant outcomes to themes and explain how content and abilities relate.
3. Programme requirements/admission information must remain a distinct lane and must not be confused with learning-path selection.
4. Programme themes need their reviewed learning resources where present. If no valid resource exists, leave the resource area blank—do not show filler disclaimers or a dead button. Each displayed learning link needs a clear, specific rationale for that theme/item.
5. Domain orientation must explain what Social Sciences & Behavioural Research studies, the Sociology connection, transferable learning, what the field adds, and what that relationship does not claim. Do not use duplicate “shared foundation” versus “domain foundation” labels for the same thing.
6. Keep compulsory domain foundations separate from optional useful edges, but do not split sections by skills/tools/methods categories. Each lane may mix item types and must be dependency-ordered within its own route.
7. Methods are a genuine choice point after the three domain foundations. Show supported method combinations and why/how they work together. Downstream routes must expose the connected items/tools and then the selected area’s roles. Unselected routes should remain inspectable without overwhelming the chosen path.
8. Selected domain learning must flow into recommended areas, then area additions and area-supported roles. Preserve cross-area role memberships with separate route contexts. Area recommendations reorder; they do not silently exclude other supported areas.
9. Roles appear inside their supported canonical areas. Show role-owned items only after the learner selects/opens that role; do not leak role details into a domain or area preview as selected content.
10. Every item card (tool, method, knowledge, skill, competency, certification, or other typed item) needs clearly separated, student-friendly sections: what it is; how it applies here; the concrete task/output it supports; why it is included; what it builds on/what to learn first; relationship details; alternatives/complements; limitations; relevant local/global context; and useful learning/reference links. Use explanatory but concise professional language suitable for a secondary-school learner with little prior knowledge. One-line definitions are not enough.
11. Separate “why included” from “what this helps you do”; neither should repeat internal audit language. Do not expose raw labels such as “task family”, “candidate”, “route note”, “guardrail”, “review-only”, “useful additional edge”, or repeated rationale/limitations as student prose.
12. Tools must actually be visible at domain, area, and role levels wherever the approved context has them. Show why a tool fits the method/task, the specific use case, alternatives, access/cost when verified, and its learning link. Do not treat tools as method prerequisites or as proof of competence.
13. Relationship chips/sheets must identify direction and meaning in plain language. Opening a relationship target must preserve the originating route, expanded card and scroll position. Include close/back and platform-back behavior.
14. Comparison is available only for evidence-supported alternatives serving the same task/use case. Comparing does not alter selection. Choosing an alternative replaces the conflicting option only in the current route after confirmation; complements are independently addable.
15. “Add to my focus” must visibly update and open the tray. A collapsed tray should animate a selected item into itself (with reduced-motion/accessibility fallback). Users must be able to deselect; deselection must not navigate to a dead or unrelated route.
16. Required foundations are part of the route but are not represented as optional item toggles. Optional useful edges remain selectable. Selecting an item is a saved focus, not a claim of mastery.
17. Support multiple independent programme/domain/area/role route stacks. Clearly label each stack, its stop point, inherited vs newly added content, alternatives, and separate optional selections. Warn before adding another independent route; do not merge route-specific requirements.
18. Saving is allowed at programme/domain or area even when no role is selected. If no area is selected, show areas as advisory choices but do not import their details into the saved route. If no role is selected, do not import role details.
19. Tray, My World, reopen/edit, remove, print/download and share must preserve chosen route, sequence, compulsory/optional lane, alternative choices, inherited context and disclaimers. Deleting a saved plan only deletes the user’s copy.
20. Use strong, consistent visual hierarchy: mobile target minimums from the UI architecture are screen title 26px, section heading 20px, item title 18px, body 16px, supporting metadata 13–14px, secondary source locator 12px only when expandable. Keep section spacing and card boundaries clear; avoid tiny text, crowded inline lists, inconsistent casing and relying on color alone.
21. Include keyboard and screen-reader behavior, sufficient contrast, text scaling, reduced motion, focus restoration, loading/empty/error states, responsive desktop/mobile layouts, and correct back/close behavior.

## Design the actual experience

Propose screen/component layouts and interactions for:

1. Programme overview: programme summary; all themes; each theme’s outcomes/resources; admission lane; programme→domain connection.
2. Domain overview: inherited Sociology context; Social Sciences field explanation; the three compulsory foundations; ordered, selectable useful edges; method-choice surface and supported combination designs; all seven recommended-but-available areas.
3. Method detail/choice: single and multi-method selection; integration explanation; prerequisites and optional preparation; change/compare/back behavior.
4. Area view: why this area is recommended for the selected method(s), inherited programme/domain context, compulsory additions, optional useful edges, tools/resources and role cards.
5. Role view: why the role fits both D078 and this area, tasks/outputs, inherited items, role additions/edges/tools, other supported area routes, and alternatives.
6. Item detail, relationship sheet, and comparison sheet.
7. Persistent tray in icon/compact/mid/full states; multi-stack editing and route-local undo/remove.
8. My World saved-plan view and useful student report/print/download/share preview.

For each screen, show:

- Information hierarchy and section labels (use student-facing language).
- A text wireframe for desktop and mobile.
- Which content is fixed/inherited, compulsory, optional, or advisory.
- State transitions and back/close restoration.
- Data fields/IDs and graph edge semantics needed by each component.
- Empty/loading/error behavior that does not falsely claim data is missing when it merely has not loaded yet.
- The distinction between local graph design, API payload, persisted seed, rendered UI and student promotion.

## Required response format

Return:

1. **Repository findings**: what exists now, exact relevant file/component paths, and verified gaps. Separate code-present from runtime-verified.
2. **Recommended end-to-end information architecture**: one clear flow with the Sociology programme-to-domain transition and downstream graph behavior.
3. **Annotated desktop and mobile wireframes** for all eight screen groups above.
4. **Component map**: reusable components, responsibilities, props/data, state ownership, and which existing components should be extended versus replaced.
5. **Graph-to-UI mapping table**: node/edge/lane → student label → placement → behavior; include the full curriculum and all method/area/role relationships.
6. **Interaction/state table** for selection, deselection, prerequisites, optional edges, alternatives, complements, multi-method choices, area recommendation, cross-area roles, tray, save/reopen/edit and print/share.
7. **Accessibility, responsive layout, and typography rules**.
8. **Acceptance checklist and implementation order** that does not reopen already accepted research decisions or confuse local design readiness with student-facing approval.
9. **Risks/questions** only where the repository evidence genuinely cannot decide; do not use questions to avoid making a reasoned design recommendation.

Be specific, candid and grounded in the repository. If the current implementation conflicts with this brief, explain exactly where and recommend the smallest coherent change. Do not silently narrow the 14 themes, 236 outcomes, seven canonical areas, 19 supported roles, named method routes, or item-level evidence.

---

Local reference graph: `data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json`.
