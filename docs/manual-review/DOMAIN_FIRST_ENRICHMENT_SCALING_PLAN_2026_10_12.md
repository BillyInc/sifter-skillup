# Domain-first enrichment at scale: D078 method and execution plan

**Date:** 2026-10-12  
**Purpose:** Scale the depth of the D078/Social Sciences enrichment to the remaining domain catalogue before adding programme-specific curriculum mapping.  
**Scope:** Planning and repository evidence only. This document does not edit canonical taxonomy, item data, application code, seeds, or SQL.  
**Status:** Proposed operating plan; D078 decisions already recorded in the 2026-10-12 master reconciliation remain closed and are not reopened by this plan.

## Decision in brief

Enrich the **domain first, then its current areas of specialization, then its already-supported role routes**. Treat an area of specialization as the one and only intermediate area layer. Do not use legacy subgroup records as an enrichment queue, a second taxonomy, a student-facing concept, or a source of current area ownership. Once domain/area/role enrichment is locally verified and the domain learning graph passes its checks, begin programme-to-domain and programme-specific curriculum mapping as a separate phase.

Do not assign 167 individual one-off investigations with separate setup and handoff overhead. Run a short calibration wave, then parallel, workload-balanced waves of domain packages. Each package owns a disjoint set of domain IDs and includes that domain’s complete current area and in-scope role scope. Agents search, enrich, and verify their assigned evidence while working; local performs **one complete final verification pass** over the completed packages, reconciles them, and closes each package. A completed package is not sent through another general review loop unless a concrete trigger in this plan is met.

`agent_verified` records that the assigned agent checked the complete evidence package and its claims. `thoroughly_verified` records the one completed local verification of those claims and relationships. **Once `thoroughly_verified`, the information is not source-reverified at approval, canonicalization, student-display, or sequence gates.** Those later gates audit compatibility with their purpose and constraints—for example, correct owner/route, allowed status, required fields, safe rendering, and graph integrity—using the existing verified evidence. They do not ask the researcher or local reviewer to prove the same facts again. The authorized approval decision may happen later, but it consumes this completed evidence packet; it is not a second evidence-verification cycle.

## Evidence base and current counts

The figures below are read from the current checked-in artifacts. They describe different datasets and must not be summed or treated as one universal denominator.

| Repository evidence | Current result | Interpretation |
| --- | ---: | --- |
| `data/career-mapping/domain_specialization_catalog.json` | 168 domain records; 164 with area recommendations; 4 with no specialization recommended | The working catalogue includes recommendations, not 168 activated canonical area sets. Do not invent areas for the four with no recommendation. |
| Same area catalog | 708 area records: 700 `recommendation_needs_role_and_context_integration`, 8 `source_supported_internal_recommendation`; one excluded candidate is folded into an existing area | These are not 708 student-approved/canonical area records. Area boundaries and downstream fit must be integrated before activation. |
| Same source-capture audit | 85 domains / 184 area records lack inline citations; 0 areas lack captured source cards; 53 source-reported count variances | Missing inline citations and count variances are specific repair/reconciliation queues, not evidence that no source was captured. They must be resolved or explicitly dispositioned in the relevant domain package. |
| `data/career-mapping/domain_structure.json` | 168 domain keys; 708 `areas_of_specialization` records; 557 legacy `subgroups` records | The structure still contains both fields. Only `areas_of_specialization` is the current enrichment layer. The legacy field must not inflate work counts or leak into exports/UI. |
| `data/career-mapping/role_library_v3_cleaned.json` | 3,461 rows | This file’s row count is not asserted to equal distinct, active, domain-owned roles. Use stable role IDs and the selected current route source to create the assignment manifest. |
| `data/career-mapping/role_work_profiles.json` | 5,096 profile records | This is a separate profile denominator from the cleaned role library. Do not treat profile count as role-route count. |
| `data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json` | 7 current areas; 53 domain items (52 approved, 1 unapproved); 144 area items (144 approved); 173 role-item decisions (171 approved, 2 unapproved); graph 2,399 nodes / 3,801 edges | This is the latest consolidated D078 decision surface. Its validation says all 7 areas and all 173 carried-forward role-item records are represented, and sequence/role fit were not reopened. |

The latest D078 state is not “everything approved”: `d078-certification-boundaries` remains unapproved, and role-item queue positions 142 and 160 remain unapproved/excluded. They remain visible in the audit with reasons, not as approved learning items. The approved graph’s student-visibility rule is **approved items only**; final rendered UI/report QA and deployment remain separate release checks.

### D078 facts that are useful as a method, not as universal counts

- `docs/manual-review/D078_IMPLEMENTATION_RESUME_CHECKPOINT_2026_10_12.md` records **14 programme themes**, **52 approved domain items**, **138 distinct approved area cards** after six approved duplicate aliases are folded, and the same seven current areas. The three programme-theme claim records are not a theme count.
- The checkpoint records 26 reviewed area-to-role routes: 18 supported and 8 conditional. These decisions are an input to D078 learning enrichment, not an instruction to reopen role-fit adjudication.
- `docs/manual-review/D078_DOMAIN_LEARNING_CONTRACT_2026_10_08.md` documents the earlier 58-record contract (29 existing inventory records, 16 workflow-gap additions, 3 alternatives/extensions, and 10 deep-search options). It explicitly says those were package instances, not a deduplicated count, and that the original package was review-only. Do **not** add 58 to the later master’s 53 or 144; these are different stages and record scopes.
- `docs/manual-review/D078_COMPLETE_LEARNING_PATH_NAVIGATION_AND_CORRECTNESS_CHECKPOINT_2026_10_09.md` is an important design source, but its 0-student-approved and pending-content statements predate the 2026-10-12 master. Use its layer rules and item contract; do not use its old counts to reopen decisions now consolidated in the newer master.

## What the D078/Social Sciences pass actually established

The source of truth for individual D078 decisions is the 2026-10-12 master reconciliation and the artifacts listed in its `source_artifacts`; the following is the reusable method, not a second review of D078 claims.

1. **Start from all layers and reconcile names before enrichment.** D078 has seven current areas: Sociology and Social Anthropology; Economics and Applied Economic Analysis; Politics, Governance and Public Policy; Social Behaviour and Interaction; Human Geography and Population Studies; Social Research and Evaluation; and Computational and Digital Social Science. Its old two subgroup records are historical inputs only. The old computational label was folded into the computational/digital area; the broad social/cultural/economic label was retired as a standalone area. The two must not appear as a second layer or as a current area count.
2. **Inventory existing material before searching for gaps.** D078 checked existing knowledge, skills, methods, competencies, tools/software and certification claims against the guided-experience contract. Search results were reconciled with, rather than appended blindly to, the existing inventory. This is why the 58-record earlier contract and later 53/144 item dispositions have different denominators.
3. **Search each layer independently and at task level.** Domain-wide work was checked separately from area-specific and role-specific work. A tool or method in a domain inventory does not automatically prove it belongs in each area or role. Area and role additions need their own task, output, ownership, route rationale, and evidence.
4. **Cover maturity, not just popular/current items.** The D078 search distinguishes established/common practice, currently emerging practice, and experimental or near-future work. These labels describe evidence and maturity, not a learner ranking. Emerging items are bounded to their use case; experimental items stay explicitly exploratory and do not become a shared foundation or a normal job requirement merely because they are technically possible.
5. **Make the learning item understandable and usable.** The contract calls for item type; what it is; what it means in this domain, area, and role; task/use case and learner output; prerequisite, complement and alternative relationships; limitations and what it cannot prove or replace; and suitable evidence and learning destinations. Tools are not proof of competence. Software ecosystems (for example, language → library/framework → method/task → output) are included only when the relationship is evidenced.
6. **Use source roles, not one undifferentiated source list.** Sources should separately support (a) item identity/function, (b) why the task belongs at the claimed checkpoint, (c) explanation/interpretation when needed, and (d) learning instruction. A product page can establish features but not occupational relevance; an academic/professional source can support task fit but is not automatically a tutorial. Record exact URL, page/section locator, publisher, jurisdiction/scope, access date and limitation for each claim it supports.
7. **Keep global practice and Nigerian context distinct.** Search Nigerian sources where they add local regulation, institutions, datasets, practice, language, or examples. A Nigerian source is not a universal eligibility condition: absence of a Nigerian analogue does not disqualify a globally relevant task. Mark `global_only_no_local_claim` or an equivalent explicit state after local-source search is appropriately scoped. Do not imply a global source describes Nigerian law or practice.
8. **Disposition every item and relationship.** Reconcile duplicates and aliases without losing route ownership; state whether each item is shared domain foundation, useful edge, area addition, role-specific addition, conditional, alternative/complement, or unapproved. “Unapproved” is a final disposition with a reason, not a synonym for “not researched.” Distinguish contextual guidance from a true prerequisite; only approved, evidence-backed hard dependencies constrain sequence.
9. **Reconcile role-task items without reopening role fit.** The D078 master explicitly says `role_fit_reopened=false`. Existing role/domain/area route decisions are inputs. The task is to determine whether a task item belongs in the learning plan under an already-supported route, not to repeat role taxonomy adjudication.
10. **Build and validate the integrated graph after dispositions.** The latest master carries approved domain, area and role items and their relationships together. The graph is a structured learning model; it is not itself the rendered student experience or proof of live SQL deployment.

### Reusable D078 evidence artifacts

- Consolidated current decisions and graph: `data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json` and `docs/manual-review/D078_IMPLEMENTATION_RESUME_CHECKPOINT_2026_10_12.md`.
- Controlling learner/item contract: `docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_SPEC_2026_10_07.md` and `docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_IMPLEMENTATION_PLAN_2026_10_08.md`.
- Domain inventory/contract: `docs/manual-review/D078_DOMAIN_LEARNING_CONTRACT_2026_10_08.md`; `docs/manual-review/D078_FULL_DOMAIN_ITEM_INVENTORY_REVIEW_2026_10_08.md`; `docs/manual-review/D078_DOMAIN_ITEM_DISPOSITIONS_LOCAL_2026_10_12.md`.
- Deep and emerging search: `docs/manual-review/D078_SKILLS_METHODS_DEEP_SEARCH_CHECKPOINT_2026_10_08.md`; `docs/manual-review/D078_DOMAIN_EMERGING_TASK_ENRICHMENT_2026_10_10.md`; `docs/manual-review/D078_DOMAIN_WIDE_EMERGING_TASK_SET_ENRICHMENT_2026_10_10.md`.
- Area/role enrichment and disposition: `docs/manual-review/D078_AREA_ROLE_TASK_SET_RESEARCH_2026_10_09.md`; `docs/manual-review/D078_FINAL_ENRICHMENT_LANE_MERGE_2026_10_09.md`; `docs/manual-review/D078_AREA_DISPOSITIONS_SOCI_ECON_2026_10_12.md`; `docs/manual-review/D078_AREA_DISPOSITIONS_POL_GOV_PSYCH_2026_10_12.md`.
- Sequence and graph: `docs/manual-review/D078_FULL_PATH_SEQUENCE_DESIGN_2026_10_12.md`; `docs/manual-review/D078_SEQUENCE_DIRECTION_REVIEW_2026_10_12.md`; `data/career-mapping/_audit/D078_FULL_PATH_SEQUENCE_DESIGN_2026_10_12.json`.
- Consolidated master builder: `data/career-mapping/_audit/build_d078_master_reconciliation_2026_10_12.py`.

## Taxonomy rule: one area layer; legacy subgroups are not enrichment data

Before the first scaled domain batch, define and validate a single area contract:

```text
Domain → Area of Specialization → Role
```

- `areas_of_specialization` / stable `area_id` is the sole current area source for inventory, assignment, enrichment, role ownership, graph nodes, API responses, seeds, and student language.
- Do not add `subgroups` as another enrichment lane, do not count legacy subgroup rows as current areas, and do not allow role-to-legacy-subgroup assignments to seed task-set discovery or graph ownership.
- The 557 rows currently present in `domain_structure.json[*].subgroups` are a repository fact, not 557 current areas. At normalization, move only necessary provenance/merge history to an audit-only history record, remove legacy rows from the active enrichment/export path, and validate that no current output contains a legacy subgroup label/ID as an area.
- D078 is a concrete regression fixture: its current seven area IDs/names must survive; its two historical subgroup entries must not appear in active API/catalog/seed/report output or in workload denominators.
- A domain with no supported current area recommendation remains a domain-only route unless evidence and an explicit taxonomy decision establish a legitimate area. Do not create areas to satisfy a coverage target.
- Keep this documentation plan separate from taxonomy mutation. A later implementation task must specify and test the normalization migration/generator/API path before enrichment batches begin.

## Work unit and assignment model

### The unit is a closed domain package

One assignment owns a stable set of `domain_id`s. For each assigned domain it owns the domain-level task set, every current area under that domain, and the currently supported/in-scope role routes under those areas (plus already-approved direct domain-to-role routes). This gives the worker enough context to classify an item as shared, useful edge, area-specific, role-specific, or out of scope. It prevents a domain worker, area worker, and role worker from independently making inconsistent copies of the same candidate.

Do not split one domain across multiple agents unless its workload demonstrably requires it. If it must be split, partition by stable `area_id` ranges and assign a single named owner for shared-domain foundation and cross-area items; role IDs must have exactly one owner. Agents may discover the same generic item in different domains, but they must document domain-specific fit separately. Local deduplicates identities after review; one domain’s evidence does not automatically approve the item in another.

### Cluster for evidence reuse; partition for disjoint ownership

Build work clusters from inspected inventory, not just broad subject labels. Use:

1. **Work profile:** recurring tasks, outputs, audiences, and data/material types.
2. **Evidence ecology:** professional bodies, standards, regulators, academic societies, official software/framework documentation, and maintained datasets that can support multiple domains.
3. **Downstream size:** current area count, in-scope role count, existing item count, and source/relationship density.
4. **Risk/change rate:** licensed or regulated work, high-consequence advice, human/identifiable data, fast-changing technology, or experimental practice.

Clusters tell researchers which source families to search efficiently; the assignment manifest still partitions by unique domain IDs. Assign by weighted work points, not an equal number of domains: a domain with many areas, high-risk boundaries, or a large role-task inventory should count more than a small, stable domain. Avoid assuming every domain has the same number of areas or roles.

### Proposed rollout

1. **Normalize and baseline first.** Generate one read-only assignment manifest from the domain catalog, active area IDs, role routes, current inventories and known risk flags. It must show all 168 domains exactly once, identify D078 as the completed benchmark, and list the remaining 167 as the scale set. Mark the four no-area-recommendation domains explicitly; do not create work for invented areas.
2. **Calibrate on a small cross-section.** Use D078 as a frozen exemplar, not a new assignment. Select a small first wave of non-D078 domains that spans materially different evidence profiles and risk levels. The exact IDs are selected from the generated manifest, not guessed in this plan. Ask each agent to return a complete domain package. Local reviews the package contract and timing once, then freezes the method before the main waves.
3. **Run parallel waves.** Use three disjoint agent lanes, each containing several whole domain packages and balanced by weighted effort. A practical starting target is 3–5 domain packages per agent per wave (9–15 total), adjusted after calibration; it is a throughput estimate, not an acceptance quota. If one unusually large package exceeds a lane’s budget, split only by stable areas with one shared-foundation owner and explicit non-overlapping role IDs.
4. **Local reconciliation follows a closed wave.** Do not wait to re-review each source during agent research. Once the three lanes have marked their packages complete and `agent_verified`, local performs one final pass, resolves duplicate identities and cross-lane overlaps, assigns final `approved`/`unapproved` dispositions, updates the domain manifest and closes the wave.
5. **Continue in waves until all 167 remaining domain packages are closed.** Do not start programme-specific mapping in the middle of unresolved domain waves. Keep the programme queue separate so curriculum evidence cannot be mislabelled as universal domain practice.

## Agent research and verification contract

Every agent receives an explicit disjoint list of `domain_id`s and, within each, the exact current `area_id`s and in-scope role IDs. The instruction is to **find, enrich, verify, and disposition** the assigned package—not merely review it or prepare recommendations.

### Required coverage for each domain, current area, and in-scope role

Search the actual work and task set across:

- knowledge and concepts;
- skills and competencies;
- methods, analytical approaches, frameworks and standards;
- tools, languages, platforms, libraries, packages and datasets when task evidence supports them;
- certifications/qualifications, issuer, jurisdiction, eligibility, assessment scope, and whether mandatory, optional, or not established;
- common/established work, currently emerging work, and experimental/near-future work, distinctly labelled;
- global practice and Nigerian context where a Nigerian source adds actual context.

For every retained item, record at minimum:

| Field | Required content |
| --- | --- |
| Identity | Stable item ID, preferred name/alias, type, version or jurisdiction where applicable, duplicate/canonical target |
| Placement | Owning domain and optionally one or more current area/role IDs; shared foundation vs useful edge vs area/role addition vs conditional/alternative; rationale for breadth and boundaries |
| Work evidence | Task/use case, what the learner would do, input/material, expected output, why this belongs at this exact checkpoint |
| Explanation | What the item is; meaning in the domain, area and role; example in professional plain language; prerequisite knowledge explained in context |
| Relationships | Evidence-backed prerequisites, builds-on, complements, alternatives and supported-by links; explain each relationship separately; do not infer from co-occurrence |
| Limits | What it cannot prove, replace, or authorize; methodological, tool, population, jurisdiction, dataset, validity, access or maturity limitations |
| Source evidence | Publisher/issuer, exact page or section locator, direct URL, claim supported, date accessed, jurisdiction, scope and limitations; use separate source roles for function, checkpoint fit, explanation and instruction |
| Learning destination | Task-specific free course/tutorial/video where suitable; official documentation/product page; independent explanation where useful; relevant paid alternative if no appropriate free instruction exists; access/cost/licensing caveat and checked date |
| Search closure | Source families and official/maintained material inspected; searches/no-hits; rejected duplicates or unsupported items; what was not found and why the item is approved or unapproved |
| Verification | `verification_status: agent_verified`, verifier/lane, checked date, evidence IDs and exact check performed; independent `decision_status: approved` or `unapproved` with rationale |

“Exhaustive” means a bounded, documented search of relevant authoritative and maintained source families, including linked standards/reports/pages when material to the claim—not an unprovable claim to have checked the entire internet. Search-result snippets alone do not verify an assertion. For global-only practice, explicitly record that Nigerian context was checked for relevance or was not applicable; lack of a Nigerian source is not a blocker.

### Maturity and breadth rules

- **Established/common:** supported by maintained standards, professional/academic practice sources, or multiple authoritative sources. Do not claim “most common” from a list without prevalence evidence. This may be a versatile foundation only if evidence shows it is genuinely shared across a broad set of domain routes.
- **Emerging/current:** supported as a real developing workflow, tool or professional practice, with dates and known uncertainty. Usually a useful edge, area addition or conditional route until breadth and stability are demonstrated.
- **Experimental/near-future:** supported by research/prototype/pilot evidence rather than stable routine practice. Label it experimental, identify validation and ethics requirements, and do not present it as a standard job expectation or shared foundation.
- **Versatile vs useful edge:** classify by evidenced cross-route coverage. “Versatile” does not mean mandatory for every job; “useful edge” does not mean unimportant. A candidate may be valid in multiple domains/areas when each route independently supports it.
- **Nigeria context:** support Nigerian-specific claims with Nigerian sources. Do not require Nigeria-specific evidence for a global task, and do not generalize a local institution’s policy into national law.

### Required depth of search: task-by-task, checkpoint-by-checkpoint

The search is not complete because an agent found a few plausible tools, copied a role profile, or filled every item field for the initial inventory. The agent must search for **missing work and missing items**, verify the current items, and record what source families and routes were actually checked. The coverage unit is each **domain × current area × in-scope role × item category × maturity tier**. Every cell must end with one of: one or more evidenced findings, an evidence-backed `not_applicable`, or a documented no-hit/exhausted-search result. A blank cell is a gap, not “nothing to add.”

#### 1. Build the complete work map before searching for tools

For the domain, then independently for each area and each in-scope role:

1. Read the current boundary/definition, approved route, existing item inventory, task profiles, and previous lane findings. Record the exact stable IDs and the scope of the work being researched.
2. Extract each distinct work activity into a task record with: **action verb + object/material + purpose/context + output/decision + boundary/limitation**. Split tasks when they require materially different evidence, methods, outputs, or safeguards; combine them only when the work and learning outcome genuinely match. Avoid vague buckets such as “data analysis” when the evidence supports distinct activities such as cleaning a survey file, estimating a model, checking uncertainty, mapping locations, coding interviews, or explaining findings.
3. Build a task-to-item map for every task. Test for missing knowledge, skill, competency, method, framework/standard, tool/ecosystem, certification, and learning resource. A task may need no dedicated tool or credential; record that result rather than inventing one.
4. Record negative/boundary checks: plausible neighbouring tasks/items that do **not** belong at this checkpoint, why they do not, and whether they belong in a sibling area, another domain, or no supported route. Use the current approved taxonomy; never revive a retired subgroup to make a candidate fit.

The domain search asks which tasks and capabilities genuinely span its areas and roles. Each area search independently asks what its distinctive tasks, outputs, methods and tools add beyond the domain layer. Each role search independently checks the actual tasks for that role against the already-approved domain/area route. The same item may appear at multiple layers only with an explicit relationship/inheritance rationale; duplicates must not make it look like multiple requirements.

#### 2. Search every item family with expanded terminology

For every task and every checkpoint, run separate searches for:

- **Knowledge/concepts:** named theories, subject concepts, constructs, data concepts, standards, and concepts needed to interpret outputs.
- **Skills/competencies:** observable actions and outputs, not generic trait words alone; distinguish a skill from a broad competency and from knowledge of a topic.
- **Methods/frameworks/standards:** formal method names, alternate names, practice frameworks, protocols, reporting standards, assessment approaches, and current versions.
- **Tools/ecosystems:** product/software names and synonyms; language → libraries/packages/frameworks/extensions → datasets/data sources → task/method → output. Search compatibility and limitations, not just product marketing. Add a component only when a source connects it to the task.
- **Credentials:** official issuer catalogues, professional/regulatory bodies, eligibility, prerequisites, assessment, jurisdiction, renewal/expiry, whether it is required or optional, and current recognition. “Certification exists” does not establish role requirement.
- **Learning resources:** official documentation, a second explanatory source where learners need conceptual context, and a task-specific free course/tutorial/video where available; if an appropriate free route is not found after the sweep, capture a relevant paid route and official page. A general “learn Python” link does not satisfy a specific Python-for-survey-analysis, text research, GIS, simulation, or other use case unless its actual lessons cover that use case.
- **Maturity and prevalence:** established practice, emerging/current practice, and experimental/near-future work must be searched and reported separately. Do not infer prevalence from how often a label appears in the repo or web search results.

Expand each search from the canonical label into spelling/abbreviation variants, historical and current names, alternative professional terms, task verbs, objects, outputs, settings, populations/data types, relevant jurisdiction, and the technology/method names actually used in practice. Record the actual query or query family, not just “web searched.” Search each family separately—for example, `role/area + task`, `task + method/framework`, `task + tool/package`, `task + standard/guidance`, `task + training/tutorial/video`, and `task + Nigeria/Africa` when local context is relevant. Follow citations and links from material sources to their underlying standards, reports, handbooks, technical documentation, appendices and datasets.

#### 3. Sweep source families; inspect the source, not the snippet

For each domain package, the search ledger must show whether these relevant families were checked, the exact sources/pages inspected, and any reason a family is not applicable:

| Source family | What it can establish | Required inspection |
| --- | --- | --- |
| Official occupational/education classifications and the repository’s authoritative role task profiles | Role/task identity and recognized scope; not automatically local fit or current tool requirements | Task descriptions, inclusions/exclusions, occupational family notes and source provenance; retain the approved role route and do not reopen taxonomy decisions |
| Professional societies, discipline bodies, maintained competency frameworks and practice standards | Accepted work, methods, outputs, ethics and professional boundaries | Relevant standards/framework sections and version/date; identify whether binding, voluntary, member-only, or educational |
| Regulators, legislation, public agencies and licensing bodies | Legal/regulatory duties, protected activities, credential requirements and jurisdiction | Exact instrument, section, effective date, jurisdiction, scope and exemptions; do not generalize one country or institution’s rule |
| Academic curricula, handbooks, authoritative texts and review literature | Established concepts, methods, disciplinary practice, emerging research and counter-evidence | Exact chapters/sections/pages, methods/results/limitations, not title or abstract alone; distinguish education examples from universal job requirements |
| Official tool/framework/project documentation and maintained repositories | What a tool does, versions, supported inputs/outputs, dependencies, access and known limitations | Current documentation, tutorial/API/workflow pages, release/version and licensing/access terms; distinguish official feature claims from independent validation |
| Professional/practice reports, field manuals and maintained datasets | Real workflows, outputs, operational constraints, data availability and practice examples | Exact workflow/metadata/terms; check sample/population, date, coverage and reuse restrictions |
| Job/task-market sources, where used | Current demand signals and naming variants | Use multiple dated postings or a transparent labour-market source for trend/prevalence discovery only; postings do not alone define a profession, task standard, or universal requirement |
| Instructional sources, including video | Whether and how a learner can practice the named task | Open the actual course/video and inspect syllabus, chapters, prerequisites, access/cost, teaching level and task match; do not count a landing page or generic playlist as instruction |
| Nigerian sources | Nigerian laws, institutions, bodies, datasets, language/context and local practice | Inspect primary Nigerian sources when they add relevant local context; state “global only/no local claim” when no supported Nigerian claim applies. Nigerian-source absence never vetoes globally established work. |

Use primary/official sources for authoritative functions, standards and legal claims; use independent academic/professional sources to corroborate task relevance, practice or limitations. For high-impact claims—shared foundation, mandatory qualification, regulated task, hard prerequisite, prevalence, or experimental method promoted as routine—seek independent corroboration and actively search for counter-evidence. If independent corroboration is unavailable, narrow the claim and state the limitation; do not imply certainty from one vendor, institution or paper.

#### 4. Search maturity and counter-evidence deliberately

- **Established/common sweep:** inspect current professional/disciplinary standards and task profiles, official practice guidance, curricula/handbooks, and independent reviews or established workflows. Search for alternatives and scope limits. Call something “common” only if a suitable source actually supports prevalence; otherwise label it “established” or “documented practice” without a frequency claim.
- **Emerging/current sweep:** search recent dated standards, professional task-force reports, maintained tool/framework releases, current research/practice reports, and independent evaluations. Record first/last source dates where known, current version/status, adoption evidence versus pilot evidence, and what could make the item stale. Search for critiques, failures, bias, validity and implementation constraints.
- **Experimental/near-future sweep:** search primary studies, preprints clearly labelled as such, benchmarks, prototypes, official research programmes and replication/validation work. Record research design, dataset/population, evaluation limits, counter-results and ethics/safety conditions. Keep exploratory outputs separate from empirical evidence and routine occupational work.
- **Negative search:** query for failure modes and limits, not just benefits: validity/reliability, bias, privacy, representativeness, causal inference, accessibility, licensing, costs, infrastructure, language support, reproducibility, security and professional/legal constraints as applicable. Record substantive counter-evidence even when it does not change the final disposition.

#### 5. Search for relationships, not just isolated inventory entries

For each candidate item, search and verify the actual relationship chain:

```text
item → task/use case → method/competency → learner output → domain/area/role route
```

Then check separately whether an item is a true prerequisite, something a learner can choose as an alternative, a complementary tool/method used alongside another, a foundation inherited from a prior layer, or an optional useful edge. Find evidence for the relationship itself. Co-occurrence, a shared syllabus, a tool’s technical compatibility, or a source naming both concepts does not establish a prerequisite or complement. Record what the relationship changes in the learning sequence and what it does not.

#### 6. Required search ledger and closure/saturation rule

Each domain package includes a machine-readable or tabular search ledger with one row per meaningful search/source inspection. Required columns: `domain_id`, `area_id` if applicable, `role_id` if applicable, task ID, item category, maturity tier, query/query-family, source family, source title/publisher, direct URL, exact locator, accessed date, jurisdiction/version, hit/no-hit, claim IDs supported or contradicted, limitations/counter-evidence, follow-up citation trail, and agent verifier/date. Attach the source snapshot/report only when lawful and useful; preserve direct stable URLs and locators regardless.

Add a coverage matrix that enumerates every current domain, every current area, every in-scope role, each item category, and each maturity tier. Mark each cell `searched_with_findings`, `searched_no_supported_item`, or `not_applicable_with_reason`; do not omit empty-looking cells. The handoff must state exact denominators and coverage numerator for domains, areas, roles, tasks, item-category cells, and sources inspected. Source counts by themselves are not evidence of search completeness.

Close the search only when all of the following hold:

1. every assigned domain/area/role and all task IDs have been processed against the full coverage matrix;
2. every relevant source family above has either been searched or marked not applicable with a reason;
3. terminology expansion, link/reference chasing and a counter-evidence search are recorded for each significant task family;
4. each retained candidate has enough source-role evidence for its precise claims, and each rejected/unsupported candidate has a documented reason and search trail;
5. follow-up searches in the relevant source families stop yielding new materially distinct tasks, items, contradictions or ownership routes for that package; the search log names the last useful new finding/date as the observed saturation point;
6. no unresolved queue is being hidden behind a “review only” label. A source that could not be accessed, a missing locator, or a genuinely conflicting claim is explicitly dispositioned (usually unapproved for this completed pass), not silently treated as a no-hit or as verified.

This is a reproducible, bounded standard for a very deep search—not a claim that every web page or future publication has been found. Agents must hand over the search ledger and completed matrix so local can verify coverage and claims in its single substantive pass without repeating the search.

#### D078 examples that define the expected granularity

Use these existing D078 records as examples of the *depth and boundaries* expected—not as templates to copy into unrelated domains and not as permission to reopen their closed decisions:

| D078 research example | What the search did at granular level | What an agent should reproduce in its own domain |
| --- | --- | --- |
| `docs/manual-review/D078_AREA_ROLE_TASK_SET_RESEARCH_2026_10_09.md`, batches 005–010 | It investigated separate inventory labels such as mathematics, policy implementation, quantitative analysis, psychology, anthropology and digital data processing. It compared meanings and tasks, consulted distinct global and Nigerian examples, recorded the exact scope limits, and explicitly avoided turning a label/count into a universal role requirement. For digital processing it decomposed the work into integration, coding/classification, checks, cleaning, transformation, validation and editing/imputation rather than treating “data processing” as one opaque skill. | Search each distinct task, not just the umbrella term. Give the exact work steps and outputs; identify which subclaims each source supports; say when a source does not establish role ownership, local universality, or a single mandatory tool. |
| `docs/manual-review/D078_DOMAIN_EMERGING_TASK_ENRICHMENT_2026_10_10.md` | It did not add another generic “AI” or “Python” item when the inventory already contained related tools. It searched for missing workflows such as AI-assisted text annotation with human validation, AI-use documentation, social effects/impact assessment, language-aware text interpretation, synthetic-social-data testing, and AI-assisted research-metadata drafting. It used professional guidance, official policy/framework sources, research studies, independent counter-evidence and instructional resources for different claims. | Compare every discovery against the full existing inventory first. Find the missing task/workflow and relationship, not merely a new brand name. Separate tool capability, task fit, validity evidence, professional safeguards, local context, and learning material. |
| The same emerging-task artifact’s AI and synthetic-data sections | AAPOR’s 2026 task-force report was used for bounded survey-workflow and human-oversight guidance, not as universal law. Research on hybrid LLM annotation was compared with evidence of systematic bias. Synthetic respondents were checked against empirical-validation studies and work warning against replacing human participants. | For emerging practice, search both implementation evidence and failure/counter-evidence. Record why a workflow is conditional/experimental, what needs human review, which populations/tasks were actually tested, and what the evidence does **not** support. |
| The same artifact’s Nigerian context and learning-link sections | ACL/Nigerian-language research and NaijaSenti supplied bounded language-specific evidence; they did not establish performance for every Nigerian language or population. Nigerian AI strategy and institutional ethics/data sources were kept separate from global standards. A task-specific technical tutorial was not treated as a social-research design or validation course; missing instructional material was recorded as a real gap. | Search Nigerian sources by claim (regulator, institution, dataset, language, professional practice), not as a checkbox. Check their exact scope. A local example can enrich a global task without being presented as national law or universal validation. Keep evidence/reference pages separate from learning instruction. |
| `docs/manual-review/D078_DOMAIN_LEARNING_CONTRACT_2026_10_08.md`, tool records for Python, pandas, statsmodels, NetworkX, Jupyter, scikit-learn, Mesa, Casevo, NVivo and SPSS | It treats each product/component as a different typed item and explains the task it supports, prerequisites, limits, alternatives and links; it does not infer that all tools are required together or that software proves method competence. | For a proposed ecosystem, trace each component to a concrete task/output and explain complements versus alternatives. Inspect current official docs and licensing/access; use independent evidence for field/task fit and a genuinely relevant tutorial for learning. Reject technically compatible but unsupported libraries. |
| `docs/manual-review/D078_AREA_DISPOSITIONS_SOCI_ECON_2026_10_12.md`, `docs/manual-review/D078_AREA_DISPOSITIONS_POL_GOV_PSYCH_2026_10_12.md`, and the A05–A07 area resource repair documents | The D078 area layer was treated as independent work under seven current area IDs, with item ownership and area-specific evidence/resources resolved. Area items were not assumed to be complete merely because a domain tool or role list mentioned them. | Search every current area independently. For each item, identify what the area adds beyond the domain, test sibling-area boundaries, attach area-owned evidence and resources, and avoid treating inherited domain items as new area requirements. |

These examples demonstrate how to make a search auditable and how to reject overclaims. They do not mean every domain needs AI candidates, the same tools, the same source families, the same number of items, or Nigerian-specific evidence for global work.

### Agent closeout

An agent may hand off only when every in-scope candidate and relationship has a final evidence-based disposition, all required fields are filled or explicitly `not_applicable` with a reason, every URL/locator is recorded, and the package reports exact counts/IDs. During active work the package can say `in_progress`; at handoff, no record may remain “review only” simply because it is inconvenient. If exhaustive search does not establish fit or a source, set `decision_status=unapproved`, state the searched source families and evidence gap, and keep it out of the approved graph. Agent verification is not local approval.

## One substantive verification; later gates are compatibility checks

The assigned agent checks the source material while researching and records claim-to-source locators, access dates, scope, and limitations. After that work is complete, local performs exactly one substantive verification pass over **all** submitted item and relationship records—not a sample—and reconciles overlap across lanes. This pass establishes whether the source supports the item’s identity, task, exact domain/area/role placement, wording, maturity/breadth category, limits, relationship, and learning destination. Scripts may validate required fields, unique IDs, resolvable source references, valid area/role ownership, exact assignment coverage, and graph endpoint integrity; local judgment checks source-to-claim fit and the substantive classification. Once this pass succeeds, the verified evidence package is the source-of-truth for downstream gates.

For each record that passes, local records `verification_status=thoroughly_verified`, verifier/date, and the checked evidence/claim scope. The same completed pass records the disposition—`decision_status=approved` or `unapproved`—based on the verified evidence. If a specific factual defect is found during this pass, correct/narrow/relocate that claim and verify the changed claim as part of closing the same pass; do not defer the verification to a later approval gate. If the evidence cannot support the claim after the assigned search, mark it unapproved with the exact reason. Do not leave a completed wave with a vague pending/review-required state.

### What downstream gates check (and do not repeat)

Once an item and its relevant relationships are `thoroughly_verified`, later gates consume that verification record:

- **Approval/disposition:** confirm the chosen `approved`/`unapproved` decision is consistent with the verified scope and policy. Do not reopen source research or ask for the same source proof again.
- **Canonicalization:** confirm stable identity, category, owner, route IDs, field/schema compatibility, and deduplication/alias handling. Do not re-verify whether the source’s factual claim is true.
- **Student display:** confirm approved status, complete display contract, appropriate context/limitations, and that the verified learning link is wired to the right item. Rendered QA checks presentation, navigation, and data flow—not the already-closed source claim.
- **Hard prerequisite/sequence:** a prerequisite relationship must itself have been included in the one substantive verification pass. The later sequence gate checks that the relationship is already verified and approved as a hard dependency, its endpoints resolve, and the graph is acyclic. It does not research the relationship again.
- **Programme mapping:** check whether the already-verified domain/area item is compatible with the programme route and label it correctly as curriculum-taught or additional domain learning. Do not require another domain-level source-verification pass just because a programme is selected.

If a user or authorized reviewer approves an item after the verification pass, that is a decision on the verified record—not a request to redo the research. Only a genuinely new programme-specific claim (for example, “this is taught in this curriculum”) needs its own programme evidence checked once; it does not reopen the verified domain/area/role claims.

If a compatibility gate discovers a genuinely new claim or a concrete contradiction, isolate that exact claim and use the anti-loop trigger below. A missing status projection, stale `false` flag, or changed downstream view is not by itself evidence that the established claim must be researched again.

After the local pass, freeze the package and synchronize the master manifest, status fields, graph/report count, and stage checkpoint in the same closeout. **Do not repeat source/claim verification at a later gate, or repeat either verification pass** because a new account/session starts, a different agent joins, an old report says `false`, or a count looks unfamiliar. Downstream checks are compatibility audits as defined above. Reopen only the smallest affected record when there is:

1. newly found contradictory or materially changed evidence;
2. a changed product requirement or scope;
3. a demonstrated source/link/data/runtime regression; or
4. an explicit user request to reopen it.

Log the trigger, affected IDs, new evidence and narrow correction. Preserve the earlier pass and decision. A stale flag is first classified as (a) real missing evidence/work, (b) a stale status/integration defect, or (c) a denominator/version mismatch. Never silently edit a flag to green, and never use a stale flag alone to restart completed work. This operationalizes the anti-loop rules in the implementation plan.

## Merge, canonicalization, and graph rebuild

1. **Merge by stable identity, not label alone.** Deduplicate concepts while preserving separate source claims, local/global scope, distinct checkpoints, aliases, and route ownership. Keep multiple valid domain or area routes where separately evidenced.
2. **Resolve ownership before promotion.** An item mentioned at domain level is not automatically a shared foundation. Retain only genuinely cross-route items at the domain layer; move specialist tasks to their specific area/role, while preserving a supported useful-edge relationship to other routes when justified.
3. **Use final states cleanly.** Once a wave closes, use `approved` or `unapproved` for the final item/edge decision, alongside the distinct verification provenance (`agent_verified`, `thoroughly_verified`). No stale `pending` or `review_only` status may contradict a final decision. An unapproved item remains in the audit with its reason but is not included in the approved learning graph. Later approval/canonical/display/sequence gates consume this completed record and check compatibility; they do not repeat substantive evidence verification.
4. **Build the graph from the reconciled inventory.** Include the approved domain foundation/useful edges, approved area additions, and approved task-specific role additions. Add typed edges only where both endpoints and their relationship evidence exist. Keep relationship annotations separate from enforced prerequisite edges. Alternatives are branches, complements can stack, and only explicitly approved hard dependencies block sequence.
5. **Do not create nodes to silence missing endpoints.** Resolve an intended target’s stable identity and evidence, or retain it as a clearly scoped non-sequencing note; do not fabricate a skill, role, area, tool, or prerequisite.
6. **Validate exact coverage.** Assignment manifest IDs equal disposition IDs; every in-scope domain and current area appears once; each existing supported role route is represented without re-adjudicating role fit; exclusions are explicit; no current graph node is owned only by a legacy subgroup; no orphan graph edges; no duplicate canonical IDs; hard dependencies are acyclic; multi-area/multi-domain routes are preserved.
7. **Close the domain graph stage.** Publish counts, item/edge manifests, tests, source date, and local verification date in one authoritative master artifact. Only approved content enters the approved graph. “Graph built” does not itself mean the UI, reports, SQL, or production deployment have passed their separate gates.

## Transition order: domains first, programmes second

### Domain-enrichment phase exits only when

- all 168 domains appear in the assignment manifest exactly once, with D078 marked completed/frozen and the other 167 assigned;
- area normalization has eliminated legacy subgroup rows from the active enrichment, route, graph, export, and student-facing paths (proven by a regression test);
- the four domains with no recommended area have explicit no-area dispositions and are not force-expanded;
- every assigned domain, current area, and in-scope supported role-task candidate has a final approved/unapproved disposition and complete verification provenance;
- every approved displayed item has appropriate item/checkpoint evidence, plain-language context, limitations and relationships, plus a verified task-appropriate learning destination or a justified non-display disposition;
- global vs Nigerian scope and established vs emerging vs experimental maturity are represented without turning absence of local evidence into a global blocker;
- one local substantive verification pass per package is complete, lane conflicts are reconciled, stale status/count metadata is synchronized, and subsequent gates are limited to compatibility checks;
- the rebuilt domain → area → role learning graph passes exact-coverage, ownership, relationship, sequence and regression tests.

### Then start programme-specific mapping

After the domain graph is frozen, map each programme and its real curriculum evidence to the already-defined domain(s). For a Sociology programme, for example, explain the actual curriculum connection and distinguish curriculum-taught themes from additional domain/area/role learning. Programme evidence is not retroactive proof that an item is universally required in the domain, and a domain item need not appear verbatim in a CCMAS course when its status is clearly labelled domain enrichment rather than curriculum-taught content. Programme mapping must consume stable approved domain/area IDs; it must not recreate areas or reopen domain evidence except under the concrete anti-loop triggers above.

The later integrated programme → domain → area → role UI/report release check remains distinct from content verification. D078’s existing programme themes and graph are retained as their completed local decisions; this scaling plan does not restart them.

## Stale gates and transition hazards to fix once

| Signal in repository | Correct treatment |
| --- | --- |
| `domain_specialization_catalog.json` has all 168 domains as `not_activated_pending_role_route_and_context_reconciliation` and 700 areas marked as needing route/context integration | Treat as the catalog’s current integration state, not proof that no evidence work exists. D078’s 2026-10-12 master has newer area/item/role decisions. Synchronize catalog/master integration state when the applicable canonical migration is implemented; do not re-research D078 because the older catalog status is unchanged. |
| Old D078 checkpoints or gates show zero approved/pending content while the 2026-10-12 master has final decisions | Trace artifact date and source of truth. Update stale summaries/status projections once. Preserve separate rendered UI, report, SQL/deployment, and explicit release checks; do not make those re-open content decisions. |
| `domain_structure.json` retains a `subgroups` array beside seven D078 areas | This is a real normalization and generator/API hazard. Remove it from active inputs/outputs before scaling and test the seven-area regression fixture. Do not use it to create separate enrichment assignments. |
| 168 domains, 708 area recommendations, 3,461 cleaned role rows, and 5,096 role profiles appear as different totals | These are different artifact populations. Generate a versioned ID-level manifest and define the denominator for each count; never compare totals or mark work missing based on a different dataset’s row count. |
| A Nigerian source is absent for a global tool/task | Not a blocker. Preserve the globally supported item and mark local scope accurately; add Nigerian context only where it meaningfully strengthens the claim. |
| Programme curriculum does not mention a domain-enrichment item directly | Not a domain-level blocker after the programme/domain connection is established. Label the item as additional domain/area/role learning, not curriculum taught. |
| Item exists in inventory or has a URL but lacks checkpoint-fit evidence, or URL is a reference page not instruction | Substantive item-specific gap. Resolve during the one assigned research/verification cycle; otherwise final disposition is unapproved/hidden with the exact reason. |
| Conditional relationship is counted as a prerequisite or role-fit audit reopens during item placement | Correct relationship type/metadata and preserve the approved route. Only a separately documented, genuinely new contradiction can reopen role fit. |

## Stage ledger for this scaling plan

| Stage | Owner | Output | Completion evidence | State/transition |
| --- | --- | --- | --- | --- |
| Document D078 method and scale plan | Local | This plan | Repository paths and current counts above; no code/taxonomy edits | Complete as a plan |
| Normalize one-area-layer inputs | Local implementation task | Active catalog/API/graph contract; legacy subgroup provenance archival only | Exact domain/area ID manifest and tests proving no legacy subgroup output | Required before enrichment waves |
| Produce assignment baseline | Local | Versioned disjoint 168-domain manifest | D078 frozen; remaining 167 assigned; all IDs once; weighted work/risk fields | Required before agent deployment |
| Calibrate workflow | Three agents in disjoint pilot lanes; local verifies once | Complete domain packages and calibrated acceptance/time estimate | All required evidence contract fields, agent verification and one local pass | Required before main waves |
| Parallel domain/area/role enrichment | Three disjoint agent lanes | Complete evidence and disposition package per assigned domain IDs | Exact coverage, no overlap, agent verification, all records final-dispositioned | Repeat bounded waves until 167 close |
| One local verification and reconciliation per wave | Local | Locally verified merged domain packages and updated manifest | `thoroughly_verified`; approved/unapproved; exact conflicts resolved; checkpoint synchronized | No repeat absent anti-loop trigger |
| Rebuild and validate domain graph | Local | Approved domain → area → role graph | Coverage/ownership/edge/sequence tests and versioned closeout | Required before programme mapping |
| Programme-specific mapping | Later phase | Programme curriculum themes → approved domain routes | Programme-level evidence, student-friendly explanation and distinct curriculum/enrichment labels | Begins only after domain graph freeze |

## Repository source map

The controlling references are the guided-experience specification and implementation plan named at the top of this document. For domain-first scaling, use these current data sources and D078 evidence artifacts as a linked set:

- Current domain/area recommendations and source-capture totals: `data/career-mapping/domain_specialization_catalog.json`.
- Current structured domain and area fields, including the legacy-field hazard: `data/career-mapping/domain_structure.json`.
- Role/source task context to reconcile against stable domain/area IDs: `data/career-mapping/role_library_v3_cleaned.json`, `data/career-mapping/role_work_profiles.json`, and their build/audit manifests. Do not infer a role denominator by mixing these files.
- Latest D078 final decisions, approval counts, graph and validation: `data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json`.
- D078 current handoff, package counts and tested local transition state: `docs/manual-review/D078_IMPLEMENTATION_RESUME_CHECKPOINT_2026_10_12.md`.
- Item-level contract and earlier inventory provenance: `docs/manual-review/D078_DOMAIN_LEARNING_CONTRACT_2026_10_08.md`, `docs/manual-review/D078_DOMAIN_ITEM_DISPOSITIONS_LOCAL_2026_10_12.md`, and `docs/manual-review/D078_FULL_DOMAIN_ITEM_INVENTORY_REVIEW_2026_10_08.md`.
- Search examples and source limitations for emerging work: `docs/manual-review/D078_DOMAIN_EMERGING_TASK_ENRICHMENT_2026_10_10.md` and `docs/manual-review/D078_DOMAIN_WIDE_EMERGING_TASK_SET_ENRICHMENT_2026_10_10.md`.
- Area/role search and final dispositions: `docs/manual-review/D078_AREA_ROLE_TASK_SET_RESEARCH_2026_10_09.md`, `docs/manual-review/D078_AREA_DISPOSITIONS_SOCI_ECON_2026_10_12.md`, `docs/manual-review/D078_AREA_DISPOSITIONS_POL_GOV_PSYCH_2026_10_12.md`, and the lane-merge artifact listed by the master reconciliation.
- Approved sequencing and graph correctness: `docs/manual-review/D078_FULL_PATH_SEQUENCE_DESIGN_2026_10_12.md`, `docs/manual-review/D078_SEQUENCE_DIRECTION_REVIEW_2026_10_12.md`, and `docs/manual-review/D078_COMPLETE_LEARNING_PATH_NAVIGATION_AND_CORRECTNESS_CHECKPOINT_2026_10_09.md` (use design rules; its older gate counts are superseded where the 2026-10-12 master differs).

This plan is a process contract, not a claim that the other 167 domains are already enriched, locally verified, canonicalized, student-visible, or seeded.
