# D029–D056 role and foundation audit — checkpoint 004

Date: 2026-10-05. Append-only clarification and initial cross-branch foundation review.

## Updated review rule

For each role, record two separate judgements: (1) task fit to the parent domain and (2) task fit to its proposed specialization. The role's task profile is evidence; the current subgroup link/ISCO grouping is only the candidate relationship being tested and is not fit evidence. A role that fails parent-domain fit cannot be retained merely because its tasks resemble a subgroup. Keep role-specific ordering at the role; specialization-specific additions at the specialization; the domain foundation should be the shared baseline across valid branches. Foundation does not promise licensing, registration, or eligibility for every role in the parent domain.

The existing D029–D031 role-domain counts remain 184 reviewed (140 pass, 42 revise/reassign, 2 unresolved); D032–D033 remain 89 reviewed (31 pass, 58 revise/reassign, 0 unresolved). Those earlier checkpoints marked specialization provisional; this checkpoint changes the review protocol but does not convert any provisional specialization decision into a pass. Each role in D029–D033 still needs its own proposed-specialization decision recorded.

No taxonomy, role-library, generator, seed, or UI/schema file is changed. Findings below are audit recommendations only; final assignment edits remain with the user-owned taxonomy lane.

## Foundation standard and first data check: D034–D036

Checked the domain-owned rows in `contextual_guidance_items.json.gz` by streaming its `items` array (no expanded artifact written). The three domains have 19 domain-owned records: D034 has 7, D035 has 6, D036 has 6.

| Domain | Current foundation rows | Initial disposition against the shared-baseline test |
|---|---|---|
| D034 Supply Chain Management | Procurement planning; sourcing; supplier management; run fair procurement processes; evaluate suppliers; manage commercial risk; Project Management Professional (PMP) | The six skills/competencies are mainly procurement/supplier-management content. Some are shared with procurement and sourcing branches, but they do not cover the full supply-chain baseline across plan/order/source/transform/fulfil/return, transport, warehouse, distribution and reverse flow. Move procurement-only depth to the procurement/source specialization; retain a concise, cross-branch introduction to sourcing at most. PMP is not a domain-wide prerequisite and should not be represented as a common requirement; keep it optional only on a genuinely project-management route if route-specific evidence supports it. |
| D035 Logistics and Transportation Operations | Same six procurement skills/competencies as D034; no certification row | Procurement-heavy content is not a sufficient shared foundation for transport modes, warehouse/cargo operations, dispatch/routing, service/safety, operational documentation and coordination. Relocate procurement-only material to the relevant procurement/supply-chain path. Do not make vehicle/operator licences universal: those are country-, vehicle- and role-specific. |
| D036 Procurement and Contract Management | Procurement planning; sourcing; supplier management; run fair procurement processes; evaluate suppliers; manage commercial risk | This set is substantially aligned with the shared procurement baseline. Keep the concepts at domain level, but refine learning sequence into need/specification → sourcing/competition → evaluation/award → contract performance/supplier relationship → cost/risk/ethics. Different legal procedures remain jurisdiction-specific; do not imply that one country's public-procurement rules apply globally. |

Recommended cross-branch foundations (not yet implemented):

- **D034:** map an end-to-end supply network and its Plan, Order, Source, Transform, Fulfil and Return processes; interpret service/cost/reliability/resilience/sustainability measures; explain how inventory, transport, warehouse/distribution and supplier decisions interact. Move detailed tendering, supplier evaluation and procurement compliance into the procurement specialization/roles.
- **D035:** build baseline competence in multimodal movement and service flow, routing/scheduling/dispatch, cargo and warehouse handoffs, operational data/documents, safety/risk awareness and service-performance measures. Retain specific driving/vehicle/air/sea licences only on roles/routes where the relevant jurisdiction and regulator require them.
- **D036:** preserve the current domain's procurement core; make the global baseline explicit (define need/specification, source fairly, assess offers, award/manage contracts, monitor supplier performance, and manage value/risk). Separate public-sector rules by jurisdiction and separate optional professional qualifications from competencies.

### Primary evidence and limits

- ASCM's [SCOR Digital Standard](https://www.ascm.org/corporate-solutions/standards-tools/scor-ds/) gives cross-industry process scope: Plan, Order, Source, Transform, Fulfil and Return, with planning balancing demand/resources and Fulfil including schedule, pick, pack, ship, install and invoice. This supports the D034 shared cross-branch baseline; it does not prescribe an individual's credential or imply every student performs every process.
- ASCM's [SCOR open-access guidance](https://www.ascm.org/corporate-solutions/standards-tools/scor-ds/open-access-guidance/) describes SCOR as a common process framework for assessment, improvement and benchmarking. This is international/professional evidence, not a national legal rule.
- CIPS's [procurement process](https://1prd-dxp.cips.org/intelligence-hub/procurement/procurement-process) covers defining business needs/specifications, tender/offer evaluation, contract performance and supplier relationships; its [contract-management cycle](https://1prd-dxp.cips.org/intelligence-hub/contract-management/cycle) connects contract scope, KPIs, supplier evaluation, cost, risk and performance. This supports D036's baseline sequence and identifies procurement-specific depth that should not be copied wholesale into adjacent domains.
- UNCITRAL's [Model Law on Public Procurement](https://uncitral.un.org/en/texts/procurement/modellaw/public_procurement) states transparency, competition, objectivity, fairness and value-for-money purposes. It is a model for public procurement regimes, not a universally binding law; legal procedures must remain jurisdiction-specific.
- The local rows list only Nigerian professional/source references for some domains. These may support local issuer context but do not by themselves establish the global domain foundation. The above international standards provide the primary scope basis for this initial review.

## Status

Foundation check is complete for 3 domains (D034–D036), covering 19 rows; none of these recommendations alters data. The full 915-role D029–D056 denominator is unchanged. Role task-fit completed counts remain 273/915 for parent domains (171 pass, 100 revise/reassign, 2 unresolved); proposed-specialization dispositions remain unfinalized for all roles pending the new two-axis lane review. Canonical and shared schema/UI files remain untouched.
