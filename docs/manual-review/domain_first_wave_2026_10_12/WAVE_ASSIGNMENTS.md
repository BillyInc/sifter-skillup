# Domain-first calibration wave — assignments

Date: 2026-10-12  
Coordinator: local Codex  
Scope: domain-layer enrichment only. This wave does not alter taxonomy, areas, roles, programme mappings, code, graph or SQL.

## Push cancellation checkpoint

The user cancelled the pending push before this wave. No new push, staging or commit is authorized in this task. A read-only `Get-Process git` check found no active local Git process. The previously reported SQL commit `1e73256f` remains local; remote advancement could not yet be verified because the Git command helper intermittently failed during setup. Agents assigned to the push lanes were explicitly told to stop and not retry.

## Six disjoint domain packages

| Lane | Domain ID | Current domain name | Cluster | Current areas | Existing role-count field | Scope |
|---|---|---|---|---:|---:|---|
| 1 | D003 | Artificial Intelligence and Machine Learning | Information & Communication Technology | 5 | 5 | Domain layer only |
| 2 | D009 | Data Science | Data & Analytics | 4 | 25 | Domain layer only |
| 3 | D011 | Quantitative Finance and Financial Engineering | Financial Services | 3 | 28 | Domain layer only |
| 4 | D023 | Medicine | Health & Biomedical | 9 | 47 | Domain layer only |
| 5 | D028 | General Management | Business & Management | 4 | 38 | Domain layer only |
| 6 | D046 | Social Work and Community Development | Public Sector & Social Services | 3 | 10 | Domain layer only |

The area and role counts above are baseline context from current `domain_structure.json`; they are not work assignments or findings about domain-level learning items. D078 is the frozen calibration exemplar, not one of these six new assignments. Legacy `subgroups` are excluded from all counts and enrichment work.

The chosen domains span six distinct clusters and materially different evidence/change/risk profiles. Domain-specific evidence and ownership must be established independently even when a tool, method, or concept appears in multiple packages.

## Output ownership

Each lane writes only its own pair of files:

- `docs/manual-review/domain_first_wave_2026_10_12/D003_domain_enrichment_checkpoint.md`
- `data/career-mapping/_audit/domain_first_wave_2026_10_12/D003_domain_enrichment.json`
- Equivalent `D009`, `D011`, `D023`, `D028`, and `D046` paths for the other lanes.

This assignment ledger is coordinator-owned. Agents must not edit it or another lane’s files. Each agent must save an initial checkpoint after inventory/source mapping, continue incremental checkpoints after manageable batches, and finish with exact coverage counts, validation, open limitations, and a resume point.

## Shared controlling requirements

Before researching, each worker must read in full:

1. `docs/manual-review/DOMAIN_FIRST_ENRICHMENT_SCALING_PLAN_2026_10_12.md`
2. `docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_SPEC_2026_10_07.md`
3. `docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_IMPLEMENTATION_PLAN_2026_10_08.md`

Then inspect its assigned domain’s current records in `domain_meta.json` and `domain_structure.json`, the domain-owned inventory/provenance, and the relevant D078 examples named in the scaling plan. D078 and the controlling documents establish method/requirements, not evidence for another domain’s substantive claims.

Enrich only the assigned domain’s own scope, overview, work/tasks/outputs, collaborators/settings, opportunities/limitations, and domain-level items that evidence supports as broadly shared/versatile foundation or useful domain edge. Search common/established, emerging, and experimental/near-future task sets, including AI-assisted work where relevant. Keep maturity, global scope, and Nigerian context distinct. A missing Nigerian analogue is not a blocker for globally supported work. Do not force tools, credentials, or items into a foundation; do not claim a programme teaches domain enrichment.

For each item/claim, record stable/local ID, type, accurate definition, domain meaning and use, concrete task/output, foundation-vs-edge rationale, prerequisite/complement/alternative/limitation as distinct evidence-backed types, what it cannot prove/replace, global and Nigerian scope separately, maturity, final decision/rationale, and source records. Sources need exact URL, publisher/title, page/section locator, access date, scope/jurisdiction, supported claim, and limitation. Separate official identity/function evidence, authoritative task-fit evidence, explanatory source, and context-specific learning destination. Include verified official documentation and a context-specific free learning resource/video when available; if exhaustive search finds no suitable free route, provide a justified paid route/official page. Do not present reference pages as tutorials.

Every in-scope item and relationship must end `approved` or `unapproved` with a reason. `agent_verified` may be set only after the agent verifies each authored claim and link against its cited source; include verifier/date/scope. This is not local verification or student approval: set `local_verification=not_started` and `student_visibility=false`. No role/area assignment, taxonomy change, canonical promotion, graph or SQL work is authorized.
