# Domain-first enrichment at scale: D078 method and execution plan

**Date:** 2026-10-12  
**Purpose:** Scale the depth of the D078/Social Sciences enrichment to the remaining domain catalogue before adding programme-specific curriculum mapping.  
**Scope:** Planning and repository evidence only. This document does not edit canonical taxonomy, item data, application code, seeds, or SQL.  
**Status:** Proposed operating plan; D078 decisions already recorded in the 2026-10-12 master reconciliation remain closed and are not reopened by this plan.

## 2026-10-22 calibration update: source index first, route architecture per domain

The D078 graph is the benchmark for **evidence depth, item context, explicit relationships, route coverage and validation**. Its research-method choice is specific to D078 and must not be copied as the universal branch for other domains. Before enriching a pilot domain, first create a bounded source-universe index for it; then map the domain's work and build its learning sequence from the evidence. “Index sources first” means cataloguing the authoritative source families and the known relevant repositories/standards/curricula for the domain, including scope and gaps. It does not mean pretending that every possible internet source can be enumerated in advance. The indexed source universe is then expanded by reference-chasing from findings and closed by logged saturation/counter-search, as specified below.

This update adds two calibration pilots: D011 Quantitative Finance and Financial Engineering and D166 Autonomous Vehicles and Self-Driving Systems. They are different enough to test whether the process discovers a domain-specific progression instead of forcing a research-method selector. The pilot evidence below is a **planning/research calibration**, not approval of item records, areas, role fit, student routes, or graph edges. Do not change canonical taxonomy or student visibility from this document alone.

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

### Source registry and confidence fields

Every package must create or extend a stable source registry before adding claims.
Each `source_id` records the publisher/issuer, authority class, source role
(`identity_or_function`, `task_or_checkpoint_fit`, `plain_language_explanation`,
`learning_instruction`, or `nigerian_context`), direct URL, exact locator, version or
publication date, jurisdiction, scope, access date and limitations. “Authoritative”
means appropriate evidence for the claim; it is not a guarantee that the resulting
catalogue is industry-certified.

Each item claim and each relationship must reference the source claims that support
it and carry separate confidence fields with a rationale:

- `identity_confidence` — correct identity and item type;
- `context_fit_confidence` — fit for this domain, area or role;
- `relationship_confidence` — evidence for complement, alternative, support or prerequisite;
- `sequence_confidence` — evidence for the proposed learning order;
- `learning_link_confidence` — whether the link teaches the stated task at the stated level; and
- `nigerian_context_status` — `supported`, `global_only_no_local_claim`, or
  `not_applicable`, with the search scope recorded.

Use `high`, `medium` or `low` only with a written reason. A hard prerequisite, a
student-facing `needed` label, and a sequence constraint require high relationship and
sequence confidence supported directly by the cited evidence. Medium confidence may
support a labelled useful preparation, complement or exploratory route. Low-confidence
claims remain unapproved. Confidence never creates a relationship by itself: do not
infer edges from co-occurrence, category membership, text similarity or frequency.

The assigned agent writes `agent_verified` after checking the complete packet. Local
writes `thoroughly_verified` after one complete package pass. Later promotion,
canonicalization, display and graph checks consume that packet and check compatibility,
required fields, ownership and rendering; they do not repeat the source search. This
is a required anti-loop rule for every scaled domain.

“Exhaustive” means a bounded, documented search of relevant authoritative and maintained source families, including linked standards/reports/pages when material to the claim—not an unprovable claim to have checked the entire internet. Search-result snippets alone do not verify an assertion. For global-only practice, explicitly record that Nigerian context was checked for relevance or was not applicable; lack of a Nigerian source is not a blocker.

### Maturity and breadth rules

- **Established/common:** supported by maintained standards, professional/academic practice sources, or multiple authoritative sources. Do not claim “most common” from a list without prevalence evidence. This may be a versatile foundation only if evidence shows it is genuinely shared across a broad set of domain routes.
- **Emerging/current:** supported as a real developing workflow, tool or professional practice, with dates and known uncertainty. Usually a useful edge, area addition or conditional route until breadth and stability are demonstrated.
- **Experimental/near-future:** supported by research/prototype/pilot evidence rather than stable routine practice. Label it experimental, identify validation and ethics requirements, and do not present it as a standard job expectation or shared foundation.
- **Versatile vs useful edge:** classify by evidenced cross-route coverage. “Versatile” does not mean mandatory for every job; “useful edge” does not mean unimportant. A candidate may be valid in multiple domains/areas when each route independently supports it.
- **Nigeria context:** support Nigerian-specific claims with Nigerian sources. Do not require Nigeria-specific evidence for a global task, and do not generalize a local institution’s policy into national law.

### Required depth of search: task-by-task, checkpoint-by-checkpoint

The search is not complete because an agent found a few plausible tools, copied a role profile, or filled every item field for the initial inventory. The agent must search for **missing work and missing items**, verify the current items, and record what source families and routes were actually checked. The coverage unit is each **domain × current area × in-scope role × item category × maturity tier**. Every cell must end with one of: one or more evidenced findings, an evidence-backed `not_applicable`, or a documented no-hit/exhausted-search result. A blank cell is a gap, not “nothing to add.”

#### 0. Build a source-universe index before item discovery

Create the index before doing the broad item sweep so the search does not depend on whichever item names are already in the inventory. It is a **finite map of relevant source families and known primary repositories**, not a claim that all possible web pages have been listed. For each domain, identify candidate sources for: (a) official curricula and learning outcomes; (b) professional bodies and practice analyses; (c) regulators, standards bodies and safety/ethics guidance; (d) occupational task/skill datasets; (e) maintained technical standards, reference architectures and implementation documentation; (f) peer-reviewed reviews, handbooks and primary research; (g) current tools, libraries, datasets and their official documentation; (h) learning instruction; and (i) local jurisdictional practice where applicable.

For every source family, record why it is relevant, which claim types it can and cannot support, geographic scope, currency/version, access status and the exact search path. Search the source itself rather than relying on its search-result snippet. Follow standards, bibliographies, curriculum references and linked technical documents when they materially support the domain. Add newly found sources to the index immediately and preserve their discovery trail. Record a family as `not_applicable` only with a reason; record inaccessible sources as blocked, not searched. A source registry indexes sources; a separate claim ledger states what each source actually supports.

Before accepting the source index, check that it contains independent evidence for both the stable core and the domain's changing edge. An official tool page can identify tool functions but cannot establish that every learner needs the tool; a professional exam outline can show a credential's syllabus but cannot define all work in the domain; a standard can define terminology or safeguards but may not prescribe a student sequence. Keep these limits in the index so later item placement cannot overreach the source.

#### 1. Build the complete work map before searching for tools

For the domain, then independently for each area and each in-scope role:

1. Read the current boundary/definition, approved route, existing item inventory, task profiles, and previous lane findings. Record the exact stable IDs and the scope of the work being researched.
2. Extract each distinct work activity into a task record with: **action verb + object/material + purpose/context + output/decision + boundary/limitation**. Split tasks when they require materially different evidence, methods, outputs, or safeguards; combine them only when the work and learning outcome genuinely match. Avoid vague buckets such as “data analysis” when the evidence supports distinct activities such as cleaning a survey file, estimating a model, checking uncertainty, mapping locations, coding interviews, or explaining findings.
3. Build a task-to-item map for every task. Test for missing knowledge, skill, competency, method, framework/standard, tool/ecosystem, certification, and learning resource. For analytical/statistical domains, expand each broad method family into its named procedures, assumptions/diagnostics, outputs and valid alternatives (for example, do not stop at “quantitative analysis” when sources specify chi-square tests, t-tests, ANOVA, regression variants, correlation measures, time-series models or machine-learning approaches). For engineering domains, decompose the system lifecycle and interfaces into requirements, design, implementation, integration, test/validation, operation and assurance where sources support them. A task may need no dedicated tool or credential; record that result rather than inventing one.
4. Record negative/boundary checks: plausible neighbouring tasks/items that do **not** belong at this checkpoint, why they do not, and whether they belong in a sibling area, another domain, or no supported route. Use the current approved taxonomy; never revive a retired subgroup to make a candidate fit.

The domain search asks which tasks and capabilities genuinely span its areas and roles. Each area search independently asks what its distinctive tasks, outputs, methods and tools add beyond the domain layer. Each role search independently checks the actual tasks for that role against the already-approved domain/area route. The same item may appear at multiple layers only with an explicit relationship/inheritance rationale; duplicates must not make it look like multiple requirements.

The item-category matrix is a **coverage control, not a quota**. It must expose leaf techniques and submethods under each broad method family, alternatives and complementary choices, and newer/experimental variants. A familiar umbrella label or several generic tools do not close that cell. “No item” is acceptable only after the source families and task/output coverage have been checked and the no-hit is recorded.

**Source volume is also evidence-led, not quota-led.** Do not require 15 sources for every item category at every layer. That would multiply duplicate or weak citations and can obscure the actual claim. Instead, index every relevant source family for the domain, each area, and each in-scope role; then retain the sources that support or challenge specific claims. For high-impact or disputed claims, seek independent corroboration across the source types appropriate to that claim and run a counter-search. Reuse a source across layers only when its exact evidence supports each layer's task claim. A source count never substitutes for task coverage, source independence, exact locators, claim limits, or a recorded saturation check.

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
| Grey literature and industry evidence (technical reports, white papers, safety cases, employer role descriptions, conference materials and project documentation) | Emerging or operational practice, implementation context, employer-specific task examples, known constraints and leads to underlying evidence | Classify publisher, purpose, review process, date/version, jurisdiction and conflicts of interest. Use employer postings as role examples, vendor/project documents for their own system, and grey literature as bounded corroboration or discovery leads; do not treat any one as an independent standard or general prevalence proof. Chase cited standards, datasets and peer-reviewed/official evidence when they support material claims. |
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

## Token-efficient enrichment and evidence reuse

Terminology rule: **area of specialization = canonical/main subgroup**.
ISCO-defined subgroup records are legacy provenance only. They are never a
second active enrichment layer, assignment denominator, route layer, graph
layer, API output, or student-facing category.

The domain-first workflow must optimize both quality and token usage. Do not
send the full inventory, all source text, or all descendants to every model
call. Create and maintain a reusable, source-backed evidence index before the
main domain waves. An index record may cover a recurring tool, method,
competency, skill, knowledge item, certification, task, output, learning
resource, or relationship, but it must retain source identity, locator,
jurisdiction, scope, maturity, access date, and claim-level evidence.

Reuse is permitted only as evidence reuse, never as automatic placement. For
each proposed reuse, the domain/area/role pass must separately establish that
the item is used in the target context, the task or output it supports there,
its requirement level, its limitations, and the exact path target and
rationale. Similarity grouping may cluster aliases, repeated tasks, related
methods, common tool families, and shared sources; it must not merge items with
different scope, maturity, prerequisites, outputs, or ownership.

The efficient sequence is:

`source index → similarity groups → domain fit → area fit → role fit → one local reconciliation → graph rebuild`

Use GPT-6 Luna as the default enrichment worker at medium reasoning for
structured extraction, source indexing, deduplication, evidence reuse,
contract completion, and bounded relationship classification. Use compact
retrieval packages, cached shared instructions, strict JSON output, and batch
requests. Escalate only ambiguous boundaries, conflicting sources,
cross-domain placement, emerging/experimental claims, or final synthesis to a
stronger reasoning model. A Luna result is agent-verified evidence, not
canonical approval; local reconciliation remains the single substantive final
verification pass.

Every wave must record reused evidence IDs, newly searched queries, opened
sources, claims added or rejected, context checks performed, and the exact
checkpoint/version. This prevents repeated research loops and prevents a
source index from silently turning a globally useful item into a universal
domain requirement.

## Stage ledger for this scaling plan

### 2026-10-22 pilot reconciliation: specialization areas vs legacy ISCO groups

The pilot exposed an active taxonomy/display mismatch that must be resolved before a learner route can be called area-based. `DomainDetailScreen`, `GuidedFieldSelectionScreen`, `PathwaysHubScreen`, and `studentDomainAreas()` currently consume `domain.subgroups` for non-D078 domains. Those rows are still ISCO-derived occupational clusters in `domain_structure.json`; the separately stored `areas_of_specialization` records are not what those general screens project. Therefore a title change or a blind copy from one list to the other would not reconcile the route.

| Pilot domain | New specialization area proposals | Current legacy subgroup rows still available to student projection | Current evidence/route gate |
| --- | ---: | ---: | --- |
| D011 Quantitative Finance and Financial Engineering | 3 | 4 (ISCO submajors 21, 24, 25 and 33) | All 3 area records are `review_required_pending_role_route_and_evidence_gate`; recommendation catalog marks them not student-visible. The role library has 28 domain role rows, but its area-fit states are mixed (11 supported candidates, 7 conditional, 9 unreviewed/null, 1 direct-domain route). These counts do not establish final area ownership. |
| D166 Autonomous Vehicles and Self-Driving Systems | 4 | 4 (ISCO submajors 21, 25, 31 and 75) | All 4 area records are `review_required_pending_role_route_and_evidence_gate`; recommendation catalog marks them not student-visible. `domain_structure.json` says 14 roles while the cleaned role library has 9 records, all with unsupported domain fit. Resolve the role identity/denominator and independently source each role before area routes can be approved. |

The normalized catalog is also not a global display-ready source: it contains 708 area candidates across 168 domains, of which 700 remain `recommendation_needs_role_and_context_integration`; 184 area records lack an area-specific source match in the current index. Captured source cards or a source-linked area description alone do not satisfy the domain, area, and role evidence contract.

#### Source-index seed from the first external pass

This is a **starter index**, not the completed exhaustive index. Each source below has a limited claim role; it does not by itself settle the area map or any individual role route.

| Pilot | Source family | Checked source and use | Scope/limit to preserve |
| --- | --- | --- | --- |
| D011 | Professional curriculum/practice analysis | [CFA Institute Candidate Body of Knowledge](https://www.cfainstitute.org/programs/cfa-program/candidate-resources/cbok) and [2027 curriculum changes](https://www.cfainstitute.org/about/press-room/2026/cfa-institute-announces-updates-to-cfa-program-curriculum) identify quantitative methods, regression, time series, volatility models, simulation/scenario analysis, model validation, AI/ML and portfolio optimization in investment education. | CFA represents investment-profession practice and curriculum, not every quantitative-finance engineering role or universal prerequisites. 2027 content has a dated effective cohort. |
| D011 | Risk curriculum/professional body | [GARP FRM exam topics](https://www.garp.org/frm/program-exams) separates quantitative analysis/markets/valuation-risk models from applied market, credit, operational, liquidity/treasury and investment risk. | Credential syllabus is evidence for risk-domain coverage, not a claim that FRM is required or that it exhausts quantitative risk work. |
| D011 | Occupational tasks | [O*NET Financial Quantitative Analysts](https://www.onetonline.org/link/summary/13-2099.01) describes work involving quantitative/statistical techniques, pricing, valuation, risk, portfolio optimization and interpretation. | US occupational evidence; do not treat one US occupation as the global or Nigerian role taxonomy. Map claims to canonical role identities individually. |
| D011 | Official technical tool documentation | [QuantLib](https://www.quantlib.org/) is an implementation/library source for quantitative finance modeling. | Establishes functions and implementation context, not that it is a required or exclusive tool. Index other current official packages only when tasks justify them. |
| D166 | Regulator/safety guidance | [NHTSA Automated Driving Systems](https://www.nhtsa.gov/vehicle-manufacturers/automated-driving-systems) covers system safety, ODD, OEDR, fallback and other safety elements. | US guidance is explicitly voluntary; do not generalize its legal force to other jurisdictions. |
| D166 | Standards | [ISO 26262](https://www.iso.org/publication/PUB200262.html), [ISO 21448](https://www.iso.org/standard/77490.html), and [ISO 34502](https://www.iso.org/standard/78951.html) are source leads for functional safety, SOTIF, and scenario-based ADS safety evaluation. | Standards have distinct scope and may be paid; record edition, availability, jurisdictional adoption, and which lifecycle claims each supports. Do not imply that buying/holding a standard is a learner credential. |
| D166 | Reference architecture/implementation | [Autoware architecture overview](https://docs.autoware.org/pr-803/design/autoware-architecture-v1/) documents sensing, map, localization, perception, planning, control, and vehicle-interface components; [Autoware 2.0 architecture](https://docs.autoware.org/main/design/autoware-architecture-v2/) describes generator/selector and learned end-to-end approaches but is marked under construction. | A software reference architecture is not a complete industry taxonomy. Under-construction concepts are emerging evidence, not settled baseline. Validate component inputs/outputs and safety claims against additional sources. |
| D166 | Official project/tool documentation | [Autoware](https://docs.autoware.org/main/home/) and [CARLA simulator](https://carla.readthedocs.io/en/latest/start_introduction/) can support implementation/simulation task context. | Tool documentation establishes what the software supports, not certification, roadworthiness, or the completeness of a vehicle validation case. |

The D011 leaf-technique source pass has begun descending below “quantitative analysis.” It now indexes official references for correlation measures, chi-square and Fisher exact tests, linear models and binary GLMs; maintained regression/discrete-model and time-series validation documentation; and peer-reviewed finance evidence about ML asset pricing and backtest overfit. The index records comparisons and claim limits, but still needs broader family coverage, exact finance task/area/role mapping and counter-search before sequence or graph decisions. Do not import a technique just because it appears in social-science research; require a finance-specific task/source. For D166, the evidence supports a component/lifecycle organizer rather than a method selector, while safety and verification remain cross-cutting. Neither conclusion is a role map.

The initial per-role source index now covers all 28 current D011 roles and all 9 current D166 roles; each has at least one claim-inspected occupational or employer task source. This closes source presence, not route proof. D011's stored area dispositions remain hypotheses to verify against exact role tasks. The D166 canonical roles remain distinct from disposed historical snapshot titles and task-gated candidates; do not add titles or route them into areas without identity/task evidence. A source family may support multiple roles only when its task evidence actually matches each role. Exact role-to-area conditions and counter-evidence review remain open.

#### Required reconciliation operation

1. For each pilot, finish the source-universe index, then build a domain work map and independently source the proposed area boundaries and tasks. Record evidence for the domain and every area, not only evidence copied from an occupational classifier.
2. Create a role reconciliation ledger keyed by canonical role ID. Verify the role identity and work against authoritative occupational/task sources and, where available, current professional or regulatory sources. For each role, record `supported_area_ids`, `direct_domain_route`, `conditional`, or `unsupported` with source-backed reasons. A legacy ISCO cluster is useful as a provenance/search lead only; it is never proof of specialization fit.
3. Reconcile each old group to the new area set for audit purposes using explicit dispositions such as `split_across_areas`, `folded_into_area`, `not_equivalent`, `direct_domain_role`, or `retired_out_of_scope`. This relationship can be many-to-many or absent. Do not force a one-to-one conversion and do not use subgroup membership to auto-assign a role.
4. Keep the new area and role routes unavailable to students until the per-domain, per-area, and per-role source/ownership gates pass. At that point, make the canonical area records the sole intermediate route layer, retain approved direct domain-to-role paths, and remove legacy subgroup labels/IDs from active student responses, route selectors, reports, seeds, and workload counts. Preserve their provenance in audit-only history.
5. If an area has not passed its evidence gate, show an honest domain-only or direct-domain-role path. Do not fill the gap with an ISCO cluster under an “area” heading. Do not suppress a role that has a supported direct-domain route merely because it has no area route.

The D011/D166 area proposals are therefore **reconciliation queues, not approved replacements yet**. The next pilot work is to complete source indexing and role-by-role evidence, resolve D166's 14-versus-9 role discrepancy, and only then publish an area manifest. A later code/data task must wire that manifest into the API and selectors and test that no non-D078 student payload exposes legacy ISCO group labels as specialization areas. This plan edit does not modify canonical area, subgroup, role, or UI data.

| Stage | Owner | Output | Completion evidence | State/transition |
| --- | --- | --- | --- | --- |
| Document D078 method and scale plan | Local | This plan | Repository paths and current counts above; no code/taxonomy edits | Complete as a plan |
| Normalize one-area-layer inputs | Local | Per-domain sourced area manifest plus canonical role-to-area/direct-route ledger; legacy ISCO provenance audit-only | Source gate for domain, every area and each role; role count reconciled; API/selector/report tests prove no legacy subgroup display | Blocking prerequisite; D011/D166 audit now documents the concrete mismatch |
| Produce assignment baseline | Local | Versioned disjoint 168-domain manifest | D078 frozen; remaining 167 assigned; all IDs once; weighted work/risk fields | Required before agent deployment |
| Calibrate workflow | Local | D011 and D166 pilot source indexes, task maps, area/role reconciliation, sequence proposal and route tests | Complete evidence coverage for the domain, each area and each role; no ISCO-derived area fit; source saturation and route-closure results | Active; source indexes and per-role reconciliation remain incomplete |
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

## 2026-10-23 pilot reconciliation result: D011 and D166

This section supersedes the 2026-10-22 pilot snapshot above for the area and
role reconciliation state. The work is data-only; no frontend files, SQL, or
migrations were changed.

The canonical D011 and D166 structures now contain only their source-backed
specialization areas. Legacy ISCO group rows have been removed from those two
canonical area structures and preserved in the audit crosswalk. The old groups
were synthesized into the new area set only where area tasks, skills, and
activities supported that mapping. A generic ISCO group is not a student area
and does not assign an individual role by itself.

Evidence is kept at two separate levels: area definitions and legacy-group
crosswalks use area-level task, skill, and activity evidence; role-level sources
support only the conditions for routing an individual role into one or more
already defined areas. A role source cannot create an area or serve as evidence
for merging a legacy group into an area.

| Domain | Canonical areas | Canonical roles routed to an area | Area routes | Reconciliation outcome |
| --- | ---: | ---: | ---: | --- |
| D011 Quantitative Finance and Financial Engineering | 3 | 28/28 | 51: pricing/engineering 6, risk modeling 22, systematic investment/trading 23 | Existing supported and conditional role routes were made explicit in the catalog. Twenty roles span multiple areas; overlaps remain multi-area. |
| D166 Autonomous Vehicles and Self-Driving Systems | 8 | 9/9 | 20 conditional routes | Seven separately documented system components plus cross-cutting safety/V&V. Each broad role route names the AV work condition and has source references. |

D011's former groups are now represented by area activity, with the role route
stored separately: quantitative/statistical modeling spans pricing, risk, and
systematic investment where the relevant models and workflows apply;
investment/risk work separates into risk measurement and systematic investment
activities; trader activities map to systematic investment only when the work
is quantitative or rules-based; generic brokerage alone does not establish
that area. The generic ISCO placeholder group 25 had no task/skill boundary
and was not converted into an area.

D166 now separates sensing and sensor calibration, perception/scene
understanding, high-definition mapping, localization/state estimation,
automated-driving planning, vehicle control/dynamics, vehicle interface/system
integration, and ADS safety/verification/validation. The Autoware component
documents support these distinct tasks and interfaces; ISO 26262, ISO 21448,
and NHTSA ADS guidance support the safety/V&V area across components. Safety
is cross-cutting, not a universal final prerequisite. The former broad vehicle
engineering and self-driving software groups are split across these functions
based on the area activities; the generic associate-professional grade is not
an area; the old craft/trades group had no current matching role or ADS task
and was removed from the canonical D166 structure.

Role routes are conditional when the occupation is cross-domain and its fit
depends on actual assignment. For example, powertrain engineering routes to
vehicle control and integration only when it implements autonomous-driving
requests; software development routes follow the ADS component being built;
homologation routes to safety/V&V only when it concerns ADAS/ADS approval and
verification. Each condition is recorded on the D166 role's domain and area
routes. These are task-context routes, not claims that every person with that
general job title works in autonomy. All nine cleaned D166 role identities
now have at least one such source-backed conditional route; the stale declared
count of 14 is corrected to 9.

The reconciliation evidence and machine-checkable crosswalk are in
`data/career-mapping/_audit/D011_D166_AREA_ROLE_RECONCILIATION_2026_10_22.json`.
The reproducible data update is
`data/career-mapping/_audit/reconcile_D011_D166_areas_and_roles_2026_10_22.py`.
External sources include [Autoware's architecture](https://docs.autoware.org/pr-803/design/autoware-architecture-v1/),
its [sensing](https://docs.autoware.org/main/design/autoware-architecture-v1/components/sensing/),
[perception](https://docs.autoware.org/main/design/autoware-architecture-v1/components/perception/),
[mapping](https://docs.autoware.org/main/design/autoware-architecture-v1/components/map/),
[localization](https://docs.autoware.org/main/design/autoware-architecture-v1/components/localization/),
[planning](https://docs.autoware.org/pr-803/design/autoware-architecture-v1/components/planning/),
[control](https://docs.autoware.org/1.6.0/design/autoware-architecture-v1/components/control/),
and [vehicle interface](https://autowarefoundation.github.io/autoware-documentation/latest/design/autoware-architecture/vehicle/)
design pages; [ISO 26262](https://www.iso.org/publication/PUB200262.html),
[ISO 21448](https://www.iso.org/standard/77490.html), and [NHTSA ADS guidance](https://www.nhtsa.gov/document/automated-driving-systems-20-voluntary-guidance).
D011's area distinctions are backed by [CFA Institute's curriculum and CBOK](https://www.cfainstitute.org/programs/cfa-program/candidate-resources/cbok),
[GARP's FRM topics](https://www.garp.org/frm/program-exams),
[Oxford Mathematical and Computational Finance](https://courses.maths.ox.ac.uk/mod/book/view.php?chapterid=1411&id=70515),
[Columbia Mathematics of Finance](https://www.math.columbia.edu/mafn/our-curriculum/),
and [MIT's Analytics of Finance course](https://ocw.mit.edu/courses/15-450-analytics-of-finance-fall-2010/pages/syllabus/).
Role-specific D166 sources (NVIDIA, Tesla, Daimler Truck, Rivian, Aeva, GM,
Humble Robotics, Avaron, and the Automotive Skills Alliance) are retained with
the corresponding role entries and in the audit artifact.

The source record update is complete, but D011 and D166 areas remain
`student_visible: false` pending the student contract and local's separate UI
approval. No frontend changes are included in this reconciliation. This pilot
does not mark the other 166 domains complete and does not replace the planned
domain, area, and role source-index pass.

### 2026-10-23 title-disposition and source-index checkpoint

The historical D011/D166 snapshot titles have now been crosswalked against the
current role library. Thirteen unmatched D011 titles and 21 unmatched D166
titles have individual source-backed dispositions. In particular, the old
D166 snapshot's food production engineer (food engineer alias), food and
beverage packaging technologist, and packaging production manager are excluded
from D166: their described work is food processing/packaging or manufacturing,
not a task supported by the eight road-ADS specialization areas. None appears
as a current canonical D011 or D166 role. No role or route was added by this
audit; the canonical area and role structures were not changed.

The in-depth source index is an explicit ongoing artifact at
`data/career-mapping/_audit/D011_D166_IN_DEPTH_SOURCE_INDEX_2026_10_23.md`
and its JSON counterpart. It covers all 3 D011 areas, 28 D011 roles and 51
role-area routes, plus all 8 D166 areas, 9 D166 roles and 20 conditional
role-area routes. After the expanded 2026-10-23 source passes, the registry has
315 unique source records. The generated index validation confirms that every
current area and role is included and that learning resources remain separate
from area/role-fit evidence. This is still an evidence index, not an approval
of items, routes, or sequence dependencies.

Grey literature is included when it adds inspectable practice or discovery
evidence. Each source is assessed for accountable publisher/authorship,
date/version, transparency of methods and references, claim scope, conflicts
and access, plus independent corroboration. Its evidential strength is stated
claim by claim: for example, an employer posting can show that one employer
assigns a task, while a vendor page can describe its own product; neither by
itself establishes a universal job requirement or method dependency.

The new D011 records add source-backed learning/research discovery resources
(QuantStart, QuantEcon, arXiv q-fin, SSRN, Quantpedia and its strategy
dictionary, Quant Memo and its learning roadmaps, the community-curated
open-MFE map, Finance & Quant Society, Quantitative Finance Stack
Exchange, QuantNet, Wilmott, and QuantConnect/LEAN); current GARP FRM
curriculum; IOSCO's AI-in-capital-markets consultation; FINRA algorithmic
strategy controls; SEC market-access controls; current CFA 2026 hypothesis
testing and simple-regression material plus the announced 2027 curriculum
update; statsmodels and SciPy method APIs; and employer examples from Jane
Street and Two Sigma. The 12 learning/reference platforms are discovery or
instruction leads, not interchangeable validation evidence. Quantpedia's
dictionary is limited to strategy keyword families; Quant Memo's concept map
and learning paths are promising but relatively new and still need item-level
review. The open-MFE map is a community-curated crosswalk, not an endorsement
or official syllabus; verify its mappings against the named universities'
current curricula. SSRN, Wilmott and QuantStart had access/fetch limits
recorded in the index. Sources distinguish current 2026 content from 2027
announced content.

A further D011 leaf-technique pass added official R references for Pearson,
Spearman and Kendall correlation; chi-square and Fisher exact tests; linear
models including ANOVA/ANCOVA framing; and binomial generalized linear models.
It also added maintained statsmodels references for regression and discrete
response families, scikit-learn references for model selection and time-series
splits, and finance research/reviews on machine learning for asset pricing and
backtest overfitting. The initial comparison set records eleven source-backed comparison
notes: correlation estimands; chi-square versus Fisher; regression/ANOVA/
ANCOVA; model choice by outcome form including binary logistic, probit and
count models; where ML can extend regression baselines; and distinct but
complementary time-aware validation and backtest-selection checks. These notes
explain method context and limits; they are not approved graph edges, sequence
dependencies, item selections or proof of area/role fit. Exact method-to-task
mapping, additional technique alternatives, and area/role applicability still
need source review.

A second D011 method pass now adds stable `arch` documentation for ARCH/GARCH,
asymmetric and long-memory variants, EWMA/RiskMetrics and forecast procedures;
the statsmodels time-series API and CFA 2026 learning outcomes are cross-checked
with financial research. New records distinguish daily return-based
conditional-volatility models, latent stochastic volatility, option-implied
volatility, high-frequency realized volatility and HAR-RV. It includes the
classic HAR-RV specification, a peer-reviewed GARCH/implied/realized comparison,
a Chicago Fed conceptual review, NBER-to-journal realized-volatility research,
a September 2026 revised Federal Reserve forecasting paper and an independent
2024 peer-reviewed study of ML against HAR. The expanded method notes now
separate mean dynamics from conditional variance, compare volatility-model
families and measures, and describe horizon-dependent econometric/ML results.
They preserve the preliminary status of Fed working-paper research and the
sample/market limits of individual studies. These sources do not establish a
universal method winner, item ordering or graph dependency; price/rates/credit,
multivariate covariance, optimization and further method families still need
similar source coverage and task mapping.

An additional D011 portfolio-risk pass adds peer-reviewed and method-source coverage
for the sample covariance baseline, linear/nonlinear/quadratic shrinkage,
factor covariance using PCA/PLS, portfolio-level regularization and
cross-validation, strategy-specific eigenvector shrinkage, and learned or
reinforcement-learning shrinkage intensity. The method comparisons distinguish
covariance estimators from allocation objectives and connect returns to risk
estimation, portfolio weights, and cost-aware out-of-sample assessment. Results
are study-bound; they do not establish one best estimator or an automatic
learning order. The new sources are attached as task-context evidence to the
D011 quantitative financial risk-modeling and systematic-investment areas,
without altering either area definition or any route.

That pass also indexed role-task sources for statistical assistants, actuarial
insurance pricing, investment analytics, and investment-risk work. These remain
bounded examples: O*NET's statistical-assistant occupation includes actuarial
clerks but does not itself establish investment strategy work; AAA's role is
an adjacent actuarial pricing title with an unreadable direct page; the Ford
Foundation investment-analytics posting had a passed application deadline and
an unreadable direct page; BlackRock's accessible risk page describes one
employer's career function. Each limit is retained in the source index.

Role-citation coverage needs a stricter reading than “every role has a task
source.” The latest index counts 344 D011 role-reference rows across 121 unique
URLs. A review of the six most repeated curriculum/framework/database URLs
reclassified those cards as bounded learning-context or provenance evidence;
they are not role-task proof. Four CFA career/CIPM pages were also inspected
and classified as broad occupational or learning context with explicit limits.
The number of generic, uninspected D011 cards is now 0; all 37 formerly
generic cards were assigned a named evidence/scope decision. D166 has 28 rows
across 25 unique URLs; six original
employer pages are stale/unavailable, three official NVIDIA posting texts have
been inspected from official search results while direct rendering remains
limited, and all other listed URLs have been reopened. The 28/28 and 9/9 counts only mean that each current
role has at least one inspected occupational/employer task source. They do not
mean every source proves its attached role claim or that conditional role-area
routes are resolved. Exact task-to-area review and counter-evidence remain open.

A third D011 pass now indexes derivative-pricing and financial-engineering
relationships. CFA Institute's 2026 materials distinguish no-arbitrage
contingent-claim models (binomial, Black–Scholes–Merton and Black) from
real-world return forecasting, and connect fixed-income curves, calibrated
interest-rate trees, backward induction and forward-rate simulation to
embedded-option valuation. OpenGamma Strata documentation maps products to
implemented models (including Black/normal/SABR and tree approaches), lists
market instruments used for curve calibration, and documents root-finder
calibration to reference-trade quotes. QuantLib documentation/examples expose
term structures and alternative analytic, lattice, finite-difference and
Monte Carlo engines; a QuantLib maintainer-authored guide demonstrates CDS
default-curve construction alongside discounting and recovery assumptions.
These project/practitioner sources are included as credible grey evidence only
for their inspectable implementation or teaching claims, with explicit
publisher, version/access, claim-scope and generalization limits; they do not
prove market-wide adoption, model validity, or a universal learner order.
The pricing and credit notes bring the indexed method-comparison total to
nineteen, covering pricing
measure versus physical forecasting, alternative numerical engines,
calibration versus validation, fixed-income branching by optionality/rate
dynamics, discount/default inputs in credit valuation, structural versus
reduced-form credit models, and the separation of CVA market-implied default
inputs from historical default prediction. Broader model and
source-family counter-search, finance-task/output mapping, and role-specific
context remain open; no graph edges or sequence dependencies are approved.

A portfolio-construction pass adds current CFA Institute coverage of strategic
asset allocation, active-equity construction, and real-world investor
constraints. It distinguishes asset-only MVO from liability-relative/surplus
allocation, goals-based and factor allocation, risk budgeting, and
implementation/portfolio review; it records the limits of MVO inputs and
extensions such as Black–Litterman, constraints, resampling, robust
optimization, covariance shrinkage, risk parity, and downside-risk objectives.
The source index links these methods to outputs (target weights, exposures,
risk budgets, turnover/costs and rebalancing) without implying they form a
single compulsory ladder. Current CVXPY docs show constrained quadratic
optimization; PyPortfolioOpt docs list available method modules; QuantConnect
LEAN docs make signal → portfolio targets → risk adjustment → execution
interfaces explicit. These are implementation sources, not validity proof.
The QuantConnect, PyPortfolioOpt, MSCI, BIS and related execution-practice sources are grey literature with
individual credibility notes and scoped claims; MSCI's full 2026 paper remains
gated and only its public preview is indexed. The execution comparison and two
financial-econometrics/ML comparison notes bring the generated index to 27
method-relationship notes. More independent evidence, specific task/role
mapping, covariance and transaction-cost method counter-search, and source
saturation remain open; no graph dependencies are approved.

The new transaction-cost/execution pass adds eight inspected sources: CFA's
2026 treatment-cost reading, a BIS FX-market report, classical Bertsimas–Lo
expected-cost control and Almgren–Chriss risk/cost optimization, limit-versus-
market order research, and research on offline RL generalization, deep-learning
surrogates for transient impact, and 2026 actor-critic RL built on the
Almgren–Chriss model. The source note separates implementation-shortfall/VWAP
measurement from algorithms, schedules from adaptive execution, and classical
models from ML/RL extensions. It links the material to systematic-investment
area evidence and a conditional quantitative-trader task example; the source
index does not imply every trader owns execution or approve learning blockers.
The cited comparisons are bounded by their market, calibration, data and
simulator assumptions. The latest index generator validates 315 unique source
records; seven broad source-coverage checks remain open.

A following D011 financial-econometrics pass added official course evidence
from Birmingham, York and NHH, maintained `linearmodels` documentation, the
Fama–MacBeth publisher record, an international event-study review and the
peer-reviewed double/debiased ML paper. Two comparison notes separate
estimator choices (OLS/MLE/GMM, panel estimators and Fama–MacBeth) from
identification designs (IV, DiD, RDD and randomized/selection-on-observables),
and distinguish event studies of abnormal market responses from causal
experiments. A second note distinguishes predictive asset-pricing ML from
ML-assisted causal inference through orthogonal scores and cross-fitting. It
links these to the systematic-investment and risk-modeling area evidence and
conditional quantitative analyst/researcher task context. These methods need
design-specific assumptions and data; no method is made compulsory or assigned
a graph dependency from curriculum inclusion alone. Direct source limits are
retained: Birmingham's search result was readable but its page returned 502;
York's was indexed but its direct URL missed cache; Fama–MacBeth full text is
gated; PubMed metadata/abstract is accessible while PMC text remained
bot-blocked. Econometric alternatives, causal-design counter-search, exact
task-to-role evidence and area saturation remain open.

The expanded D166 records include NVIDIA Drive/DriveWorks technical and
safety-architecture evidence; NHTSA's current ADS crash-reporting order and
data limitations; UNECE UN Regulation 157 for its narrower ALKS scope; and
Waymo, Argoverse 2, and nuScenes/nuPlan dataset and benchmark evidence across
sensing, perception, mapping, localization, planning and evaluation. New grey
role/task evidence includes current Waymo perception/continuous-learning and
perception-evaluation postings, Mobileye validation/integration/algorithm
postings, GM autonomy evaluation, and the AVSC's voluntary, dated industry
best practices on ADS safety metrics (2021) and core safety information (2024).
The 2024 source is indexed from the official abstract only; the full report is
still needed before relying on its detailed recommendations. AVSC is a
traceable industry-consortium source useful for practice context, not
regulation or independent proof of safety; it is cross-checked against current
standards, regulators and research.

A further D166 area pass added first-party Apollo documentation for the
software-component architecture and current localization, planning-component,
and control interfaces, plus the dated ASAM OpenDRIVE 1.9.0 scope for static
road-network data in simulation. These records make inputs, outputs and
component handoffs more inspectable across sensing/perception, localization,
mapping, planning, control and integration. Apollo 2.0 architecture is
explicitly historical and platform-specific; current Apollo documents describe
that project's implementation, not a universal stack. ASAM's specification is
authoritative for its own exchange format and version, while adoption claims
remain bounded. Two independent university course pages were also indexed as
curriculum evidence only; they are kept out of area-fit evidence and do not
establish mandatory content or prerequisite order. The refreshed index now
records 7–14 source cards per D166 area, but that count is not saturation:
exact task evidence, citation-level currency, route conditions and
counter-search remain open.
Employer and vendor sources are marked as examples with their own scope;
dataset/benchmark success is not real-world safety proof. D166 has 21 original
canonical role-reference URLs and 25 distinct URLs in the refreshed role index
after supplementary task cards. Sixteen were reopened and inspected; three
NVIDIA posting texts were inspected from official careers search results while
direct-page rendering remains limited; six original pages remain
stale/unavailable. New task evidence includes an autonomous heavy-duty
powertrain engineer posting, NVIDIA's official AV fleet-integration search
result, a Rivian integration posting mirrored by Indeed while the canonical
page returned 403, and Mobileye's official ADAS-homologation listing. Each has
an access/credibility limit recorded; the underlying original URLs were not
misrepresented as reopened. D011 now has 127 unique role-reference URLs. The
latest D011 role ledger retains 350 reference rows. New employer examples
include Citadel GQS and Data Strategies quantitative research, Jane Street's
quantitative-trader interview, and Citi derivatives-pricing/risk analyst and
quantitative technology developer postings. They document distinct research,
trading, pricing, model-risk and research-to-production workflows; each is
employer- and role-specific. CFA/GARP curriculum, CFA
career/CIPM and O*NET database references now have explicit support and claim
limits; curriculum pages remain distinct from employer task evidence. The
mathematician's two IFT food-science references are reviewed as non-supportive
for D011, and O*NET physics/family and OECD Frascati references are bounded to
adjacent or classification context. The old Citi C13 link returns 404; its
2026-07 posting copy is separately retained as medium-credibility third-party
historical evidence. The 37 formerly generic existing-reference cards have
now been individually reviewed and given named evidence/scope decisions; none
remains without a locator or explicit access/scope limitation. Current
claim-inspected task coverage is now 28/28 D011 roles and 9/9 D166 roles,
including role-specific M&A valuation, insurance pricing, middle-office
derivative controls, mathematical modeling, credit analysis, quantitative
securities-underwriting, and AV connectivity examples. Adjacent or specialized
postings are explicitly limited to the duties they document. This does not
mean every route is validated: exact task-to-area mapping and counter-evidence
review remain open. Role names and routes were not changed by this source pass.

One stale self-driving software-QA citation was also counter-searched. The old
Tesla job page redirects to generic careers; an accessible Waymo Staff Software
Quality Safety Operations Specialist page now supplies an adjacent task
example for AV event triage, QA/ML validation, edge cases and statistical
metrics. It is a staff-level safety-operations posting, not an exact title
match or universal software-analyst definition.

Four additional current GM postings plus three D166 candidates found while
dispositioning the old title snapshot are recorded as task-gated candidate
evidence only. They have not been inserted into the canonical role library or
routes. The earlier 16-URL D166 checkpoint was expanded with two inspected
connectivity-role postings; the current 21-URL access count is recorded above.
Six original pages remain stale or unavailable; three NVIDIA posting texts are
verified from official indexed search results although direct fetch is limited;
one role URL has not been reopened. Exact source recovery
and route-task verification remain open. Area-by-area source saturation,
D011 technique alternatives and relationships, broader tool/dataset coverage,
learning resources, peer-reviewed/handbook sources and Nigerian task context
also remain open. The source index intentionally remains
`in_progress_not_saturated`; this is not completion of D011/D166 enrichment or
of the other 166 domains.

The 2026-10-23 HD-map source pass adds four records to D166's high-definition
mapping area: the Lanelet2 open-source map framework (semantic road topology,
traffic rules, routing, authoring and validation), an ISPRS production paper
with a concrete survey-to-quality-assurance workflow, and two 2024 survey
leads covering general generation/maintenance and camera-based/offline/online
map construction. The ISPRS paper is full-text accessible; MDPI and IEEE
survey pages were rate-limited (HTTP 429 and 418), so only bibliographic and
indexed abstract material is recorded for those surveys. Their full-text
inspection remains open. These records broaden the area evidence but do not
establish one universal HD-map format or map-production sequence. The
generated source registry now contains 315 records; broader area saturation,
per-role route checks, technical alternatives, tools, learning resources and
regional sourcing remain open.

The same 2026-10-23 pass expanded vehicle-interface/system-integration context
with the current AUTOSAR Adaptive platform overview, ASAM SOVD, the published
2026 ISO 14229-1 UDS abstract, and ASAM OSI simulation interfaces. It records
UDS and SOVD as complementary diagnostic paths—ECU-centric diagnostic
services versus API-based access to dynamic software/HPC systems—rather than
claiming SOVD universally replaces UDS. AUTOSAR describes a platform and
interfaces, not an AV stack; OSI applies to simulator-model interoperability,
not production vehicle command wiring. The ISO full text is paid, and the
ASAM SOVD 1.2 update remains in development, so those currency/access limits
are preserved. The four records support conditional area context and do not
settle the exact role-to-area routes.

### 2026-10-23 D166 vehicle-control and dynamics source pass

Added source-backed method and role context for trajectory tracking and
vehicle-motion control. Current Autoware documentation makes the task flow
concrete: reference trajectory and vehicle state enter tracking controllers;
lateral control can use Pure Pursuit or MPC in the documented node, while its
longitudinal implementation uses feed-forward plus PID and requires a
vehicle-specific downstream interface. Apollo supplies a separate LQR-based
lateral implementation example. These are implementation examples, not a
universal method ladder. A peer-reviewed 2023 review describes MPC's predictive
model and explicit state/input constraints; its suitability still depends on
model quality, compute, latency and vehicle operating limits.

The emerging-method pass distinguishes Autoware's experimental Smart MPC,
which learns vehicle-model residuals from recorded driving data and validates
against held-out data/simulation, from the 2024 reinforcement-learning review
of tactical highway lane changes, merges and platooning. Learning-based
residuals can augment a model-based tracker; tactical RL outputs connect to
low-level tracking only when a specific architecture documents that handoff.
Control-barrier-function safety filters and safety constraints embedded in MPC
are recorded as complementary safety mechanisms, not standalone proof of a
safe vehicle. The 2026 AV safety-MPC review is indexed at abstract level only
because its publisher page was rate-limited; full-text and cited-study review
remain open.

Current Lucid and Tesla employer postings add concrete, bounded role context
for specialist control/software tasks, including controller families,
vehicle-dynamics models, simulation, SIL/HIL and vehicle testing. The records
are mapped to existing software-developer, mechanical-engineer and powertrain
role evidence only as conditional task examples; no canonical role fit, route,
or item was changed. Generator validation confirms all source and role-task
IDs resolve and grey role cards include credibility assessments. The registry
now contains 325 unique source records; D166 has 32 role-reference rows across
27 URLs, with 18 reopened/inspected, 3 official NVIDIA excerpts limited to
search-result access, and 6 original references stale/unavailable. Seven open
checks remain; the index is still `in_progress_not_saturated`.

### 2026-10-23 D166 sensing, calibration and fusion source pass

The sensing/calibration area now has 19 indexed area sources (up from 8).
Added NIST's peer-reviewed static automotive LiDAR evaluation methods; ROS
REP 145's IMU frame, units, timestamp and covariance conventions (explicitly
Draft/Informational and not an automotive standard); peer-reviewed research on
camera-LiDAR temporal misalignment and radar-camera/transformer fusion; and a
2026 Measurement survey abstract covering target-based/targetless, learned,
cooperative V2X and online calibration families. The 2024 IEEE fusion sources
were only inspected at abstract/metadata level because direct access was
blocked; the 2026 calibration survey is paywalled, so its detailed synthesis
is still open. NIST's specific study concerns static LiDAR testing and cannot
be read as on-road system validation or a universal sensor acceptance limit.

Current GM, Rivian, Mobileye, Wayve, Woven and Aeva postings add task context
for sensor characterization, test requirements, calibration, synchronization,
data validation and sensor-to-perception/localization handoffs. Five new role
source references are attached conditionally to existing mechatronics and
optomechanical roles; D166 now has 37 role-reference rows across 31 URLs.
These are employer-specific tasks, not role-title equivalence, route changes,
or universal requirements. Three new relationship notes explain (1) frames,
intrinsic/extrinsic and temporal calibration before fusion, (2) complementary
sensor measurements and ODD-specific selection, and (3) classical geometric
fusion versus learned feature/transformer approaches and their compute and
alignment limits. The notes are source-backed review context, not graph edges
or student prerequisites. Generator validation passes and the registry now
contains 335 unique records; seven broader source-closure checks remain open.

### 2026-10-23 D166 localization and vehicle-state estimation source pass

Expanded the localization area to 22 indexed area sources. The pass inspected
current Autoware localization interfaces and launch choices, EKF localizer,
NDT scan matching and the covariance modifier; Apollo's current multi-sensor
fusion implementation and run guide; GTSAM factor-graph materials and
LIO-SAM; a full 2024 LiDAR-odometry survey and open 2026 robotics localization
survey; and current Aurora, Waabi and Kodiak localization postings. AV-specific
2024/2023 survey records and an author-hosted 2024 LiDAR survey PDF were also
indexed with their access limits clearly recorded.

Four relationship notes explain: (1) relative odometry versus global GNSS
anchoring and map matching, including when they complement or conditionally
substitute for one another; (2) recursive EKF filtering versus factor-graph
smoothing and joint optimization; (3) pose, covariance, status and health
signals consumed downstream; and (4) learned localization options as
component-level emerging approaches rather than an assumed replacement for
calibration, measurement models or conventional baselines. Three employer
postings add conditional software-developer task context. No role fit, area,
route or graph edge was changed.

Validation confirms every localization relationship source and role-task
reference resolves, all area supplemental source IDs resolve, and grey-source
cards have credibility assessments. The total registry now contains 351
unique source records. Seven broader source-closure checks remain open; the
index continues to state that it is in progress and not saturated. Search
closure will not be inferred from absence of official sources: credible grey
sources are included where they substantiate the claim, while a claim remains
explicitly unresolved only when the documented search cannot establish it.

### 2026-10-23 D166 automated-driving planning source pass

Expanded the planning area from 9 to 24 sources. Added current Autoware
planning-component and module documentation; Apollo's current planning
component and plugin catalog; 2024 surveys of ADS path planning, hybrid
motion planning and sampling-based planning; the open 2026 review of learned
interactive prediction/planning; an end-to-end planning review record; the
original RSS paper and IEEE 2846 working-group scope/status; and nuPlan's
first-party benchmark and evaluation protocol. Direct-page or full-text access
limits for ScienceDirect, PMC and PubMed are recorded; their inaccessible
full-text claims remain open rather than being treated as confirmed findings.

Four relationship notes now explain: (1) the typical mission route → behavior
choice → path/drivable region → time-based trajectory → validation/control
handoffs, including architectures that combine stages; (2) search, sampling,
optimization and interpolation families as conditional alternatives or hybrid
components; (3) rule-based, learned, end-to-end and interactive
prediction/planning approaches and their stack-specific contracts; and (4) the
scope of safety assumptions and the difference between open-loop and
closed-loop evaluation. Apollo's E2E planner is described by its own repository
as exploratory and not road-tested; learned/future approaches are not treated
as proven production replacements. Safety-model and benchmark sources do not
establish whole-vehicle safety.

Five current employer postings from Aurora, Waabi, Gatik, Torc and DiDi add
conditional planning-task evidence to the existing software-developer role;
they illustrate behaviors, path/velocity reasoning, algorithm choices and
simulation/vehicle validation without changing role ownership or fit. The
generator passes all source, role-task, area-ID and relationship-reference
checks. Registry total: 370 unique sources. Seven broader source-closure checks
remain open, and the overall index remains in progress/not saturated. The
family-coverage summary now reflects the expanded role-source counts and
planning, safety and benchmark source families.

### 2026-10-23 D166 mapping source pass

Expanded high-definition mapping coverage to 23 area sources. Added current
Autoware map-creation/interface guidance, Lanelet2 routing and validation
documentation, Argoverse 2 map/schema and map-change materials, Apollo's lane
schema, ASAM OpenCRG/OpenSCENARIO distinctions, and recent HD-map generation,
maintenance and quality-review sources. Abstract-only or publisher-blocked
papers remain limited to metadata/scope claims. The evidence distinguishes
point-cloud geometry, semantic lane/topology maps and simulation road/scenario
formats; they can complement one another, but are not interchangeable.

Four relationship notes describe map representation, acquisition-to-QA
production stages, change/freshness and controlled release, and downstream
consumer contracts for localization, perception, planning and simulation.
Conditional employer task references remain attached to the existing software
developer record. One mapping job posting is explicitly expired and mining
ODD-specific; it is historical task evidence only. No roles, areas, fit,
routes or graph edges were changed.

### 2026-10-23 D166 vehicle-interface and integration source pass

Expanded the integration area from 11 to 15 area sources. Added the current
Autoware Vehicle Interface architecture and Raw Vehicle Command Converter,
Apollo's typed ChassisCommand schema, and ITU-T F.749.17 for its narrow
purpose-built ADS-dedicated vehicle scope. The source records distinguish
normalized ADS commands/status from platform-specific actuation feedback,
capability/diagnostic reporting, command identity, conversion latency and
degraded/manual-mode concerns. ITU numerical examples are not treated as
universal thresholds or as proof of regulatory adoption.

Two relationship notes connect those contracts to control, localization,
vehicle bring-up and integration testing. Conditional role context uses the
already indexed NVIDIA integration posting excerpt, Rivian secondary mirror,
and software-quality evidence with access limitations preserved. No role fit,
area, route or graph edge was changed.

The generator passes all 28 source-index checks. Registry total: 394 unique
source records. Current area counts are D011 19/34/42, and D166
19/11/23/22/24/15/15/15; the two D011 quantitative-finance area coverage
gaps and D166 perception/safety gaps still need further area-specific searches.
Seven broader source-closure checks remain open, including area-by-area
saturation, source-family sweeps, exact role-task/route counterchecks and
D011 technique alternatives. The index remains in progress and explicitly
does not claim saturation.
