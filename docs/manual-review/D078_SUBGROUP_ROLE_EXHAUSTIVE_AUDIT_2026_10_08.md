# D078 subgroup and role exhaustive audit — 2026-10-08

This is an audit-only supplement for local reconciliation. It does not edit canonical domains, subgroups, roles, seeds, SQL, API or UI data. Nigerian context is intentionally excluded from this pass.

## Result at a glance

- Current structure reports **20 roles**, **2 subgroup records**, and **7 proposed areas**.
- The cleaned role library contains **24 D078 role rows**: **15 supported**, **5 supported with scope**, and **4 excluded/review-only** by the rigorous parent-domain gate.
- Existing role-area data has **20 routed rows**, but only **1** are currently marked supported; **19** remain conditional and **4** have no area route.
- The two current subgroup entries are not treated as proof of role or area fit. ISCO 21/26 are occupational classification keys, not D078 specialization names.

## Subgroup findings

| Current key | Current label | Finding | Local disposition |
|---|---|---|---|
| 21 | Computational and Quantitative Social Research | Defensible as a method/practice candidate only when the work uses computational, quantitative, digital-trace, network, text or modelling methods for a social question. The number 21 must not be presented as the specialization. | Reconcile as a labelled method area; remove ISCO semantics from student display. |
| 26 | Social, Cultural & Economic Research | Too broad for one student-facing specialization: it spans sociology, culture, economics, policy, population and research practice. | Keep as provenance/legacy aggregation only unless split or replaced by the area candidates. |

The ILO’s official ISCO table defines 21 as Science and Engineering Professionals and 26 as Legal, Social and Cultural Professionals. That is why this audit does not use either key as a student-facing specialization or as role-fit evidence.

## Independent role dispositions

The final disposition below is produced by the same stricter task-triangulation gate used by the wider role/area reconciliation—not by the hand-written D078 recommendation table. The older recommendation is retained only as candidate context. Each role has a parent-domain gate, source-profile availability check, scored area candidates, lead/ambiguity result, subgroup candidates marked only as audit groupings, and a negative check. Multiple routes are allowed only when each route passes its own evidence gate.

| Disposition | Count | Meaning |
|---|---:|---|
| supported | 15 | The role’s described work directly fits D078; area routes still remain separately scoped. |
| supported with scope | 5 | The role is useful in D078 when the stated social/behavioural/economic/policy/population remit is present. |
| exclude/review-only | 4 | Keep out of student-facing D078 until a different, explicit social-science remit is evidenced. |

## Rigorous decider used

The gate uses source-backed work activities and the domain/area boundaries. Automatic area support requires a usable source work-profile activity record, a top candidate score of at least 6, and a lead of at least 2 over the runner-up unless the complete area phrase is present. Secondary routes need at least 70% of the top score and at least two substantive label/boundary hits. A title, ISCO code, subgroup membership, frequency or one keyword cannot promote a route. Cases without a usable profile or with an ambiguous lead remain conditional/review-required.

This is stricter than treating an authoritative field list plus a plausible task narrative as sufficient: it requires the role’s own activity evidence to connect to the specific area boundary, while retaining provenance and negative checks for neighbouring fields. The JSON records the exact scores, hits, parent gate, profile references and reasons for every role/area row.

## Baseline versus seven candidate areas

The two current D078 subgroup records remain the baseline audit surface. The seven later records remain unactivated candidate areas. The gate evaluates both surfaces independently; it does not silently replace the two-area baseline or activate all seven. The current reconciliation recommendation remains a possible five substantive routes plus two explicitly labelled practice/method routes, subject to local review and separate role-route evidence.

### Definite area-suitability criteria

An area is suitable for D078 only when it passes the hard gates below. A conditional role route does not fail the area; it means the route is shown with its scope. A missing or ambiguous role route delays promotion but does not create a field by itself.

| Criterion | Required decision |
|---|---|
| Domain boundary compatibility | The subject, population, process or practice is genuinely inside D078 and does not conflict with an exclusion. |
| Independent recognition | The field or explicitly labelled practice/method is recognized by an authoritative education classification, professional body, research community or established method source. ISCO membership alone cannot satisfy this. |
| Distinct boundary | The area has clear inclusions and exclusions and can be distinguished from neighbouring areas. A mixed umbrella of unrelated disciplines fails this gate. |
| Coherent scope | The area is a coherent field or a clearly labelled cross-cutting practice/method—not a software tool, generic skill, classification code or single job title. |
| Role/workflow evidence | At least one source-backed role or workflow can be connected through its own tasks. Conditional routes count when their scope is explicit; unsupported routes remain hidden. |
| Student-facing label | The label explains what the learner can study/practise and does not expose an ISCO number or silently duplicate another area. |

The machine-readable `area_suitability` section records these decisions for the two-area baseline and the seven unactivated candidates, including route signals and the reason the area is suitable, held, or unsuitable as one student-facing area.

### Immediate route corrections surfaced by the audit

- Economics and applied economics roles should not default to Social Behaviour and Interaction (formerly Psychology and Social Behaviour).
- Policy roles should be checked against Politics, Governance and Public Policy and/or Economics and Applied Economic Analysis.
- Sociologists, anthropologists, criminologists and communication researchers need substantive sociology/social-anthropology routes, with method routes added only when their work supports them.
- Demographers and human-remit geographers need Human Geography and Population Studies; generic geographers remain conditional because the occupation also includes physical geography.
- Generic mathematicians, biometricians, historians and philosophers remain excluded/review-only for D078; method overlap or discussion of society is not enough.
- Generic statisticians remain conditional: social-survey, population, evaluation or social-modelling work is required before a D078 route is shown.

## Evidence register

The JSON records publisher, direct URL, exact locator, claim supported and limitation for each source. The main independent source families are ILO ISCO-08, UNESCO ISCED, O*NET occupation/task profiles, ESCO occupation records, ISA research-network boundaries, ISA Digital Sociology, and ASA sociology-interest areas.

## Handoff to local reconciliation

1. Reconcile role-to-area routes from the independent task/boundary dispositions; do not copy current lexical area routes wholesale.
2. Decide the student-facing treatment of the two current subgroup records after considering the seven area candidates.
3. Keep excluded/review-only roles hidden from D078 student view.
4. Add Nigerian context as a separate evidence layer after global fit is settled.
5. Only after that add guided-experience context, learning explanations and verified student learning links.

See the machine-readable ledger: `data/career-mapping/_audit/d078_subgroup_role_exhaustive_audit_2026_10_08.json`.
