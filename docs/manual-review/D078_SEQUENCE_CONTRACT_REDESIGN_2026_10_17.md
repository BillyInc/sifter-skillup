# D078 sequence contract redesign ? 2026-10-17

## Scope

This repair covers the D078 programme ? domain ? area ? role learning display. It changes sequence metadata, dependency interpretation and cards. It does not change requirement disposition records, role fit, SQL, migrations or inventory.

## Audited records

- Runtime domain items: **52**; three are compulsory shared foundations and 49 are post-foundation learning records.
- Canonical areas: **7**.
- Area graph items: **144** (the runtime area payload currently returns 150 rows after reviewed tool-option enrichment).
- Role branches: **19**.
- Unique role-item candidate nodes in the graph: **173**; branch references: **224**. The runtime role payload contains 202 approved role-owned items including role tools.
- Graph edges: 4,482 original relationship edges; all remain nonblocking.
- New advisory display-sequence edges: 50; all have blocking_policy: never.

## Learning contract

1. **Programme**: show the selected programme context and curriculum evidence.
2. **Compulsory shared foundations**: complete, in order:
   - Research question design
   - Evaluate evidence and limits
   - Communicate evidence
3. **Broad domain sequence**: social-world orientation ? literature/reference management ? existing data ? sampling ? measurement ? reliability/uncertainty.
4. **Cross-cutting safeguards**: responsible research, data care, open/reproducible practice and digital-trace/AI ethics when the route uses them.
5. **Method routes**: quantitative, qualitative and mixed-method families, followed by collection/design options. Alternatives are choices; complementary methods can be learned together.
6. **Advanced/specialist extensions**: evaluation, causal inference, psychometrics, longitudinal/multilevel data, evidence synthesis and discourse, followed by computational, spatial and agent-based branches.
7. **Tools**: appear after the method they support. Tool alternatives are choose-one routes; supporting libraries can be learned together. No tool is a universal blocker.
8. **Area**: inherit the domain path, then display area-owned additions, area tools and credentials. Domain-owned items that support an area remain domain-owned.
9. **Role**: inherit domain and selected-area learning, then import role-owned capabilities and role tools only after role selection. Area-owned items that support a role remain area-owned.

Only the three shared foundations have blocksProgression: true, skippable: false, and scope_kind: shared_domain_foundation. Every domain post-foundation item, area addition and role item is explicitly skippable and nonblocking.

## False-blocker repair

The three shared foundations were previously emitted by the runtime as useful/conditional and nonblocking even though the graph contract described them as a gate. Backend, graph and UI now agree on needed, shared_domain_foundation, blocking, and the compulsory three-card display. Existing useful/optional edges remain visible explanations and never become hard prerequisites.

## UI cards

- Compulsory shared foundations
- Next in the domain sequence
- Cross-cutting safeguards and reproducibility
- Method routes and alternatives
- Advanced and specialist extensions
- Tools supporting the selected method
- Area additions / area tools and credentials
- Role learning sequence / role tools

Each item card shows why it appears next and labels alternatives, co-learning and specialist/tool support without implying a blocker.

## Artifacts

- backend/d078_guided_content.py
- src/types/career.ts
- src/components/careerIntelligence/ContextualItemList.tsx
- src/screens/careerIntelligence/DomainDetailScreen.tsx
- src/screens/careerIntelligence/SubgroupDetailScreen.tsx
- src/screens/careerIntelligence/RoleDetailScreen.tsx
- data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json
- data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json.gz


