# Next Domains: Area and Role Reconciliation, Then Bounded Source Enrichment

**Updated:** 2026-10-29  
**Scope:** D006 IoT and Embedded Systems; D086 Gaming, Betting and Lottery Operations; D139 Game Design; D141 Quantum Computing and Quantum Information; D167 XR and Immersive Technology; D168 Esports and Creator Economy.

### Terminology that separates the game-related domains

For clarity in the enrichment documents and learner-facing wording, use **D086 Gambling, Betting and Lottery Operations** when referring to the domain currently cataloged as “Gaming, Betting and Lottery Operations.” Its “gaming products” means gambling/casino, wagering or lottery products. **D139 Video Game Design and Development** means creating video games. **D168 Esports and Creator Economy** means esports competition/events, teams, broadcasts and platform-based creator work. These are separate occupational contexts; do not use bare “gaming” to blur them. Cross-domain links require evidence for a concrete task.

D086 content must remain realistic, lawful, non-vulgar, non-exploitative and appropriate for students. Exclude illegal practices, gambling promotion or personal betting advice, manipulation or evasion of safeguards, predatory tactics, and vulgar/sexually explicit material. Retain accurate, age-appropriate occupational learning about regulation, integrity, player protection, responsible-gambling controls, fraud prevention, product mathematics and system operations, including the risks and limitations. Student-friendly language must not conceal harms or imply gambling is safe or profitable.

## Decision and current state

The selected area sets are now the active specialization taxonomy in `domain_structure.json` and remain aligned with the per-domain catalog in `domain_specialization_catalog.json`. Legacy ISCO subgroup rows have been removed from the active structure and preserved verbatim in the audit archive with scoped crosswalks. Role-to-area routing now follows stored role tasks and area boundaries; it is not inferred from ISCO membership.

The reconciliation produces these counts:

| Domain | Active areas | Source role records | Supported/conditional role records routed | Records with no student route |
|---|---:|---:|---:|---:|
| D006 IoT and Embedded Systems | 3 | 17 | 17 | 0 |
| D086 Gaming, Betting and Lottery Operations | 4 | 14 | 14 | 0 |
| D139 Game Design | 6 | 42 | 38 | 4 |
| D141 Quantum Computing and Quantum Information | 4 | 19 | 19 | 0 |
| D167 XR and Immersive Technology | 4 | 13 | 12 | 1 |
| D168 Esports and Creator Economy | 4 | 15 | 13 | 2 |
| **Total** | **25** | **120** | **113** | **7** |

The eight non-routed records are retained with their source and disposition data. Seven have existing domain-fit findings that say the recorded occupation tasks belong to another domain or do not match that domain’s area boundary; the eighth is a duplicate broadcast-technician label. These are specific dispositions, not whole-domain or whole-area exemptions. D086’s pre-existing domain-level student exclusion remains unchanged; its area and role data are reconciled, but this work does not change that separate policy.

The seven non-routed records are: **gambling games designer**, **production designer**, **web content manager**, and **performance video designer** under D139; **footwear 3D developer** under D167; and **Video Game Designers** plus a duplicate broadcast-technician label under D168. Their recorded task descriptions identify work outside the destination domain, and the source evidence is preserved on the role records. The gambling-games designer is also represented as a D086 role, routed to Gaming Products and Systems, because the occupation record describes gambling/betting/lottery game design. `3D printing technician` is retained as a conditional D167 role for XR-device prototyping, based on university XR hardware work and a 2026 peer-reviewed XR-goggle study; this route does not cover general manufacturing work.

The bounded external check confirmed the most important boundary cases: O*NET describes Video Game Designers as designing video-game features and systems; ScreenSkills describes the production designer role in film/TV; Barcelona Activa describes Performance Video Designer in live performance; and an ESCO occupational-family page locates web content manager under web/multimedia development. The 3D-printing fit is conditional: Ohio State's XR lab describes affiliated 3D-printing hardware for prototype fabrication, the University of Eastern Finland's OpenAR headset uses 3D-printed structure, and a 2026 research article reports a fully 3D-printed XR goggle prototype. The corresponding source cards and limits are saved on the relevant role records.

“Conditional” means an area is useful for a particular kind of assignment. The route remains student-available; the area route carries a condition that explains when it applies. It is not an eligibility gate. This removes stale `student_path_status=excluded` values on roles whose only blocker was the missing area route. The upstream domain-fit review can still say `conditional` where an occupation is broader than the domain.

The 113 routed role records produce **167 role-to-area edges: 87 supported and 80 conditional**. All 80 conditional edges remain active. A role with several distinct area assignments can therefore have several area edges; edge counts are not unique role counts.

## Area reconciliation

The following area sets are retained from the current proposed/source catalog and now match the active domain structure. The enrichment phase will test and source their boundaries before student contracts are considered complete.

### D006 — 3 areas

- Embedded Systems and Firmware Engineering
- IoT Architecture and Systems Integration
- IoT Edge Computing Systems

The three legacy buckets (IoT engineering/sensing, IoT software/systems, and a generic engineering-associate bucket) are archived. The first two crosswalk to relevant areas as historical clues; the generic bucket has no direct area mapping. Role tasks determine routes.

### D086 — 4 areas

- Casino and Venue Gaming Operations
- Betting and Wagering Operations
- Lottery, Bingo and Draw-Based Operations
- Gaming Products and Systems

The four occupational buckets are archived. Management/customer-service buckets are treated as broad cross-area evidence only; the specific role task selects its area. Engineering roles map to Gaming Products and Systems.

### D139 — 6 areas

- Game Design and Narrative
- Game Art, Animation and Visual Development
- Game Engineering and Technology
- Game Audio
- Game Production and Team Delivery
- Game Quality, User Research and Accessibility

The former art/animation, gameplay-programming, and creative-direction buckets are archived and crosswalked to corresponding areas. This domain’s broad shared occupational labels remain conditional when they apply to game work only.

### D141 — 4 areas

- Quantum Computing Hardware and Devices
- Quantum Algorithms and Software
- Quantum Communication and Networks
- Quantum Sensing and Metrology

The former quantum hardware/sensing, software/algorithms, applications/policy, teaching, and operations buckets are archived. Teaching is not an area by itself. Policy, training, product, business, systems-architecture and general engineering roles are routed conditionally to the quantum area where the actual assignment applies.

### D167 — 4 areas

- XR Experience, Interaction and Content Design
- XR Software and Real-Time Application Development
- XR Devices, Tracking and Platform Engineering
- Human Factors, Accessibility, Safety and Evaluation

The seven former ISCO buckets are archived. Generic legal/social/cultural work only crosswalks to Human Factors when the task is XR-specific; the generic science/engineering bucket is not used to assign a role. Footwear CAD remains outside XR because the recorded role is footwear product development. 3D printing is a conditional XR-device support route only when assigned to fabricate or maintain XR prototypes, mounts, controllers or tracking hardware.

### D168 — 4 areas

- Esports Competition and Event Operations
- Esports Teams, Players and Performance
- Esports Broadcast, Content and Audience Partnerships
- Digital Creator and Platform-Based Content Work

The four esports-specific ISCO-like buckets crosswalk to their corresponding areas. The generic ICT-technician bucket routes only through recorded broadcast work. `Video Game Designers` stays with D139 and is not presented as an esports role. The duplicate plural broadcast-technician row remains an alias to the singular canonical role.

## Role route rules applied

1. Route a supported or conditional role only where its stored task description fits an area boundary.
2. Use multiple area routes when one role’s actual tasks can span distinct areas; mark cross-cutting or broader occupations conditional and explain the assignment context on each route.
3. Keep conditional routes active and skippable. The condition explains relevance; it does not block progression.
4. Keep unsupported cross-domain records and duplicate labels in the source/audit record with their disposition. Do not delete source identities or use an unsupported role to enlarge an area.
5. Project `role_keys` and `role_route_count` from the role routes so the area catalog, structure record, and role records agree.
6. Preserve source-layer ownership and existing area labels. Do not convert an ISCO group into a new area solely because its title resembles one.

The exact role decisions, legacy subgroup records, area crosswalks and route counts are in [the reconciliation archive](../../data/career-mapping/_audit/NEXT_DOMAINS_RETIRED_ISCO_AND_ROLE_DISPOSITIONS_2026_10_29.json).

## Source coverage at the reconciliation checkpoint

The area catalog currently has 38 area-specific source IDs across the 25 areas. Eleven areas have no area-specific source IDs yet: D139 Game Art, Game Production and Game Quality; D141 Hardware and Algorithms; D167 Experience, Software and Devices; and D168 Competition, Teams, and Broadcast. Existing role and source-index records support some route decisions, but that does not close the area-boundary source gate. Every area remains `recommendation_needs_role_and_context_integration`; this reconciliation does not relabel those area records as fully source-verified.

This distinction is deliberate: role routing is now internally consistent and conditional roles are no longer hidden by the old area-review gate, while area source enrichment and downstream student contracts remain outstanding.

## Bounded enrichment plan

The source work begins after this reconciliation. Do not add more domains or area labels during enrichment unless a source-backed counter-finding changes the boundary. Any such change must reopen only the affected area and its role routes.

### Fixed evidence matrix

For each of the 25 areas, use six item families across four maturity horizons: **foundational/current practice**, **established**, **emerging**, and **research-frontier/futuristic**. This gives a fixed 24-cell matrix per area, or **600 cells total**. A cell can end as `mapped`, `not_applicable` with a boundary reason, or `bounded_no_hit` with a completed search log. Empty cells cannot remain implicit.

The six item families are: knowledge/principles; methods/processes; techniques/models; competencies/skills; tools/platforms/infrastructure; and credentials/standards/regulatory practice. Where a family is not a meaningful learning item for a particular area/horizon, close it as not applicable with an explicit reason instead of inventing an item.

### Search sequence and source mix

1. **Domain foundation pass:** establish prerequisites, common technical vocabulary, and prerequisites shared by the areas. Keep items at domain level only when they apply across several areas; otherwise place them in the area where the source evidence locates them.
2. **Area boundary pass:** for each area, search official standards/regulators, professional or technical bodies, academic curricula/reviews, and credible practitioner/industry sources. Record source type, publication date, exact locator, claim supported, and limits.
3. **Matrix fill:** populate the 24 cells from the collected evidence. Include traditional, current, emerging and research-frontier material where sources support it. Do not turn a future research direction into an established competency.
4. **Prerequisite and combination pass:** record which learning items build on others, which can be learned together, and which are alternatives. Model an explicit dependency only when source evidence or the method’s own structure requires it.
5. **Role application pass:** link each routed role to the area items useful for its documented tasks. For conditional roles, preserve the condition on the route and identify the role-task source; do not make the whole area compulsory for every holder of that title.
6. **One counter-search per area:** challenge the boundary and search for missing competing specializations, established alternatives, and cross-area overlap. A material finding reopens only its affected cells/routes.

Each role route also gets a finite evidence check: use the exact occupation profile or professional role definition where available, plus one independent practice source that demonstrates the task in that area. New/emerging roles may use a standards body, research lab, employer posting or credible practitioner source instead of a legacy occupational code. The role source must support the actual task and its context; a source that only mentions the title is not enough. A conditional role needs a condition-specific source link, and any source gap ends as an explicit bounded result rather than a guessed fit.

### Close gate and stopping rule

An area closes only when its boundary, all 24 matrix cells, its scoped task tracks, prerequisites/alternatives, role-task links, and one counter-search have terminal records. A material source-backed gap is filled; a failed search is closed as bounded no-hit only after the logged source families, queries, date range, and result limits show that the area’s bounded scope was checked. Missing evidence is never labelled complete. Once the gate passes, stop searching that area unless a later counter-finding reopens a named record.

To keep the work finite, each area gets one planned search pass per source family and horizon, followed by one counter-search. Additional searches are allowed only to resolve a specific contradictory or missing claim found in that pass; each one names the affected cell or route and closes there. Search volume is not a quality score: claims need enough independent, appropriate sources to establish the item, its context, and its limits; repeating low-value sources to reach a quota does not close a gap.

## Files and verification

- Reconciliation/replay script: `data/career-mapping/_audit/reconcile_next_domains_areas_roles_2026_10_29.py`
- Focused validator: `data/career-mapping/_audit/validate_next_domains_areas_roles_2026_10_29.py`
- Reconciliation archive: `data/career-mapping/_audit/NEXT_DOMAINS_RETIRED_ISCO_AND_ROLE_DISPOSITIONS_2026_10_29.json`
- Durable subgroup-regeneration guard: `data/career-mapping/_apply_emerging_domain_structure.py`
- Catalog-rematerialization guard for manually reconciled slices: `data/career-mapping/_audit/materialize_global_specialization_catalog_2026_10_07.py`
- Updated data: `domain_structure.json`, `domain_specialization_catalog.json`, `role_library_v3_cleaned.json`, `emerging_role_overlays.json`, `thin_domain_role_overlays.json`

The validator checks that all six active area sets match the catalog, no legacy subgroup remains active, each routed supported/conditional role has a source-referenced canonical area route and is not student-excluded, every area role projection matches the role records, and unsupported/duplicate records have no active route.

Run locally with:

```powershell
python data/career-mapping/_audit/validate_next_domains_areas_roles_2026_10_29.py
```

The source-enrichment phase has not started in this checkpoint. No SQL, migration, UI, graph-sequence or live-deployment change is claimed.
