# Domain-first inventory audit — 2026-10-13

## Purpose

This is the baseline audit for scaling downstream enrichment across the active
168-domain taxonomy. It is an inventory and workflow audit, not an approval of
new student-facing content and not a reopening of the completed D078 content
decisions.

## Current populations

| Population | Current count | Interpretation |
|---|---:|---|
| Active domain records in the specialization catalog | 168 | Canonical domain denominator for the domain-first wave |
| Domains with recommended areas | 164 | Four domains have an explicit no-area recommendation |
| Area recommendations | 708 | Current area candidate denominator |
| Domains marked source-capture complete | 168 | Capture completeness does not equal context-fit approval |
| Domains missing inline area citations | 85 | Citation presentation gap to resolve during package work |
| Areas missing inline citations | 184 | Item/area citation gap, not permission to invent evidence |
| Domain sources without an area-specific match | 184 | Requires explicit area-fit treatment or a justified non-match |
| Cleaned role-library rows | 3,461 | Role population; do not mix with embedded structure counts |
| Role work profiles | 5,096 | Enrichment/profile population; not a role denominator |
| Embedded role-count sum in `domain_structure.json` | 2,677 | Legacy/partial projection; not the canonical role denominator |
| Legacy subgroup references in `domain_structure.json` | 557 | Migration/generator hazard; never an enrichment assignment |

The catalog and role files therefore describe different populations. Every
future manifest must state its denominator and stable IDs; totals must not be
compared as if they were the same table.

## Normalization finding

`domain_structure.json` still contains a `subgroups` field alongside
`areas_of_specialization`. Areas of specialization are the canonical/main
subgroup layer. The ISCO-defined subgroup field is legacy
provenance/migration evidence only and must not appear as a parallel layer in
enrichment assignments, active graph output, student payloads, or reports.
For example, D078 has seven current areas and two ISCO-defined legacy subgroup
records; the seven areas are the only active downstream specialization/main
subgroup layer.

The first implementation gate is therefore a deterministic seven-area-style
normalization test generalized across all domains:

- active assignments use `specialization_id`/area IDs only;
- legacy subgroup IDs cannot be emitted by the assignment manifest, graph,
  seed, API, or student UI;
- legacy records remain available only in an archival provenance field until
  the migration removes the field from canonical outputs;
- roles must resolve to one or more active areas and to their parent domain,
  directly or conditionally, or be excluded with a reason.

## How to reuse research without misplacing items

Do not choose between “research every domain from zero” and “copy items across
all domains.” Use a two-layer evidence system:

1. **Shared evidence index.** Index authoritative sources, claims, task
   descriptions, tools, methods, competencies, certifications, outputs,
   prerequisites, alternatives, learning resources, scope, maturity and
   limitations. Deduplicate aliases and repeated source claims here.
2. **Context-fit packages.** For each domain, area and role, re-check the
   candidate against its boundary and actual task/output evidence. Record why
   the item fits that context, what requirement level it has, and which route it
   supports. Reuse of a source never proves reuse of a placement.

The source index comes first as a retrieval layer, but not as the first
approval layer. Domain fit is established by the domain definition/boundary and
task evidence; area fit by the area boundary and task/output distinction; role
fit by the role work profile and bounded route evidence. This is how a shared
item such as Python, GIS, SPSS or NVivo can be reused efficiently while still
being explained differently in sociology, economics, geography or a specific
role.

## Recommended grouping and search strategy

Create the wave manifest using four independent signals, in this order:

1. **Stable taxonomy ownership:** assign every domain exactly once and keep all
   current area and supported-role IDs under that owner.
2. **Evidence/source family:** group domains that draw on the same authoritative
   bodies of knowledge, standards, occupational databases, regulators or
   professional associations. This reduces repeated source discovery.
3. **Item/task similarity:** cluster canonical item keys by task, output, method,
   tool family, competency and prerequisite—not by label alone. Similarity is a
   retrieval aid; it cannot merge different scopes or ownership.
4. **Risk and workload:** separate high-overlap/common domains from domains with
   thin evidence, emerging work, cross-domain boundaries, many areas, or many
   roles. Give difficult groups longer research budgets and smaller batches.

Each package should contain the domain boundary, areas, supported roles, the
relevant existing inventory slice, reusable evidence IDs, unresolved source
claims and the exact search gaps. The agent searches only those gaps. The local
pass reconciles package conflicts once, then freezes the package unless an
explicit anti-loop trigger occurs.

## Luna-first operating recommendation

Use GPT-6 Luna at medium reasoning for source indexing, retrieval, extraction,
alias normalization, similarity grouping, inventory comparison and structured
contract completion. Keep prompts compact, retrieve only relevant index rows,
cache stable instructions, require strict structured output, and use batch
processing for independent records. Escalate only ambiguous boundaries,
conflicting evidence, cross-domain placement, emerging/experimental claims or
high-impact final synthesis.

Every agent package must save incrementally and record: reused evidence IDs,
new searches, sources opened, claims accepted/rejected, context-fit rationale,
token-saving retrieval choices, and the checkpoint version. Agent-verified is
not canonical approval; local performs one substantive verification pass.

## Next controlled actions

1. Generate the versioned 168-domain assignment manifest from stable IDs.
2. Run the legacy-subgroup exclusion regression before assigning enrichment.
3. Audit existing inventory coverage and source freshness per package.
4. Build/reuse the shared evidence index and similarity groups.
5. Enrich domains first, then independently enrich areas and roles using the
   context-fit gate.
6. Reconcile once per wave, rebuild the graph, and only then begin
   programme-specific mapping.

This audit does not claim that the 167 non-D078 domains are enriched or
student-ready. It establishes the efficient, non-looping method and the
population denominators that the enrichment waves must use.
