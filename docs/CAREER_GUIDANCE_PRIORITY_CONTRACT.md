# Career guidance priority and market-path contract

## Purpose

The career product must show the complete domain, subgroup and role inventory
without turning it into a checklist. It should make the next useful action clear
while preserving visibility of skills, competencies, tools, certifications and
opportunities that may matter later.

The governing rule is:

> Complete information, selective progression.

Streamlining changes the presentation and learning sequence; it does not delete
the underlying inventory.

## Non-negotiable product rules

1. A programme opens into domains, then subgroups, then roles/opportunities.
2. Direct, functional and adjacent programme relationships remain visible.
3. One domain can be selected as the primary active route. Other domains are
   secondary exploration or pivot routes.
4. The primary route receives a staged learning plan. Secondary routes show
   shared foundation, new bridge requirements and the extra work before
   specialization.
5. Nigeria, remote and global market pathways are first-class lenses. Nigerian
   evidence is important for local context and regulated practice, but missing or
   scarce local postings must never suppress a portable skill that supports
   remote or global work.
6. Raw ordinal ranks, prevalence percentages, demand scores and internal bands
   are not student-facing. The UI uses explanatory language instead.
7. Missing evidence is not evidence of low priority. An item with insufficient
   evidence is labelled as unverified or pending rather than silently demoted.

## Internal ordering model

The ordering is a decision aid, not a claim that every item in the first group
is universally mandatory. Items are assessed within their own type—skills,
competencies, tools and credentials are not placed on one undifferentiated
leaderboard.

### Domain

1. Verified statutory or practice requirement, if applicable.
2. Portable foundation skills and competencies that support multiple roles.
3. Tools commonly used across the field and its routes.
4. Skills, tools and competencies that open the selected subgroup.
5. Specialised, advanced or context-dependent items.

### Subgroup

1. Foundation already covered by the domain and programme.
2. Subgroup skills and competencies that close the specialization gap.
3. Tools used across the subgroup.
4. Role-specific tools, proof and credentials.
5. Optional or advanced items.

### Role

1. Verified requirement for regulated practice, where applicable.
2. Role essentials: skills, competencies and tools needed to perform the work.
3. Evidence-building and employability items.
4. Nigeria, remote and global market signals, shown with their evidence scope.
5. Optional, advanced or future-pivot items.

## Tool priority

The current taxonomy distinguishes `common` tools from `distinctive` tools.
Common means broadly used across the field; distinctive means that a tool
characterises the field or a specialization. Neither label alone proves that a
tool is legally required or currently in demand.

Student-facing ordering should therefore be:

- **Tools used across this field** — practise alongside the core domain foundation.
- **Tools for a chosen specialization** — become more relevant after a subgroup
  or role is selected.
- **Role-specific tools** — show when the student has chosen a role.
- **Other tools in this field** — keep the full inventory available for browsing.

Tool priority may be strengthened by source-backed role frequency, employer
observations, professional-body evidence or a verified local/global/remote
requirement. Taxonomy-derived `hot`, `in_demand` or score fields must not be
shown as current market evidence.

## Skills, competencies and credentials

Student-facing explanations use these meanings:

- **Learn first** — a suggested starting foundation, not a universal checklist.
- **Build next** — broadly useful after the foundation.
- **Needed for this route** — supported by the selected subgroup or role evidence.
- **Recommended for employability** — strengthens the route but is not universal.
- **Useful for a specialization** — relevant when the student chooses that path.
- **Optional or advanced** — useful later or in particular contexts.
- **Priority not yet verified** — present in the source data, but evidence is not
  strong enough to call it required or optional.

Certification language must distinguish statutory registration, professional
membership, sector training and employer-preferred certification. `gateway`
must not automatically be rendered as a universal licence requirement without
source verification.

## Market evidence policy

Market observations are separated by lens:

- `nigeria` — Nigerian employers, regulators and local opportunities.
- `remote` — work accessible remotely from Nigeria or another location.
- `global` — international employers, standards and opportunities.

The ranking service may combine these lenses to select a useful next action, but
the student must be able to see which lens supports the explanation. A missing
local signal does not subtract from a skill's remote/global portability. A global
signal does not establish Nigerian licensing or local employability.

Use the strongest available evidence in this order:

1. Verified legal or regulatory requirement.
2. Programme, professional-body or occupational-standard evidence.
3. Observed market evidence with a stated lens and freshness.
4. Cross-market portability and role overlap.
5. Curated or inferred evidence, explicitly labelled as such.

The current repository already records the necessary source families and data
states in `SourceBackedFields`, demand-lens tables, professional-body audits,
CCMAS data and the resource layer. Those layers must remain separate: a source
that explains what a role is does not create a vacancy count.

### Current Nigerian coverage boundary

The repository audit currently covers all 160 visible domains with at least one
Nigerian body or sector-context entry and a verified web anchor. It also audits
seven hidden trade/creative rows. This is broad domain context, not proof that
every role has a Nigerian vacancy signal or a statutory licence.

The same audit records 42 thin domains, 76 domains with a local profile overlay,
160 domains with named Nigerian skills, competencies and certification signals,
12 certification-specific review rows, and three domains with statutory
registration/licence evidence. The 42 thin domains have global role evidence so
they remain useful for pivot and remote/global exploration. The runtime must
therefore label evidence state at domain, subgroup and role level rather than
turning domain coverage into a universal local-priority claim.

Remote is a separate evidence lens. Until a remote-specific source-backed
signal is attached to an item, the product must say that remote evidence is not
available rather than infer it from global occupational data.

## Guidance flow and canonical copy

```text
Programme
  -> related domains (direct / functional / adjacent)
  -> choose primary domain
  -> understand the core domain foundation
  -> choose subgroup
  -> see specialization bridge
  -> choose role or opportunity
  -> build staged plan
  -> inspect secondary domains and pivots
```

Canonical copy:

- After programme and primary-domain selection: **“You already have partial
  preparation from your programme and primary domain. These are the additional
  skills you need.”**
- For a functional or adjacent route: **“This is a possible pivot. Your current
  foundation helps, but you need this bridge before specializing.”**
- When evidence is incomplete, replace “need” with “may need” and explain why.

## Persistence contract

The guidance path stores domain intent and sequence without exposing internal
priority values:

```json
{
  "domains": [
    {"id": "D001", "name": "Example", "matchType": "direct", "intent": "primary", "sequence": 1},
    {"id": "D010", "name": "Example pivot", "matchType": "functional", "intent": "secondary", "sequence": 2}
  ]
}
```

Shared skills are shown once. A secondary route shows only its new bridge
requirements until the student chooses to make it primary. The path is saved,
resumable and reversible.

## Source anchors

- Existing repository evidence: `data/career-mapping/SOURCE_TO_MARKET_INTELLIGENCE_INTEGRATION_MAP.md`
- Nigerian credential distinction: `data/career-mapping/NIGERIAN_CERTIFICATION_GAP_AUDIT.md`
- Nigerian professional-body context: `data/career-mapping/NIGERIAN_PROFESSIONAL_BODY_AUDIT.md`
- Nigerian digital-skills policy: [National Digital Economy Policy and Strategy](https://nitda.gov.ng/regulations/)
- Nigerian regulated practice examples: [COREN registration](https://portal.coren.gov.ng/) and [NMCN registration](https://www.nmcn.gov.ng/unitreg.html)
- Global skills and transition context: [World Economic Forum Future of Jobs Report 2025](https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/)

## Acceptance criteria

- Every inventory remains discoverable.
- No student-facing list displays an ordinal rank, prevalence percentage or raw
  demand score.
- Domain, subgroup and role views each identify what to start with and what can
  wait.
- Tools are not all presented as equally urgent.
- Nigerian, remote and global evidence are not collapsed into one unexplained
  score.
- Secondary and adjacent routes explain their bridge rather than appearing as
  equally prepared routes.
- Unsupported requirements are never presented as facts.
- The language works consistently on mobile and web.
