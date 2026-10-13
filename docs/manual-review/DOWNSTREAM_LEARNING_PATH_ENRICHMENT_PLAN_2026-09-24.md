# Downstream learning-path audit and enrichment plan

Date: 2026-09-24  
Status: execution contract for the four-agent domain audit and subsequent matcher work

## Objective and scope

Audit and correct the complete active downstream catalogue: searched programme → supported domain → every active subgroup → every active role. This is a catalogue-wide job, not a three-domain sample. Preserve the exact searched JAMB programme and the evidence-backed programme-to-domain connection in every resulting path, so learners can see which programme they searched, why a domain is shown, and which evidence supports the connection. CCMAS packages are supporting curriculum evidence; they do not replace or restrict the 420 student-facing JAMB identities.

Use internal records and external, authoritative evidence. For every item shown to a learner, establish its identity, owner, type, use in that context, learning progression, source, and item-specific learning link. Remove unsupported or miscategorized items from active student data; record the reason and provenance in the internal audit ledger instead of displaying an unverified item as a valid requirement.

## Ownership and student display rules

- Programme-owned evidence explains the programme-to-domain connection and any programme-specific foundations. Keep the searched JAMB identity visible; do not substitute a CCMAS package name for it.
- Domain-owned items are genuinely shared foundations for the domain, supported by domain-level evidence—not items promoted from role frequency or broad occupational aggregates.
- Subgroup-owned items add the methods, tools, competencies, and learning links that distinguish that subgroup from the domain foundation.
- Role-owned items are tied to real role tasks, outputs, and work profiles. Do not copy every item in a record into a role's “needed” list.
- Classify every learner-facing item as **needed**, **useful**, or **optional**. Use **needed** only when the cited curriculum, professional standard, regulator, employer/role evidence, or authoritative training source supports that claim. Never imply that a certification is mandatory without evidence.
- Display Skill, Competency, Tool, and Certification as distinct types. Tools also receive a meaningful theme/use-case label (for example, simulation, CAD, robotics middleware, data analysis, or safety analysis); generic office software is not an engineering tool merely because it appears in an occupational record.
- Exclude `review_only`, `audit_only`, unsupported, unverified, and `not_established` relationship rows from confirmed student requirements. Keep their audit history internally with a clear disposition and rationale.

## Cumulative pathway and downstream applicability contract

The student roadmap is **Domain foundation → Area of specialization → Role**, with a direct **Domain → Role** route when no specialization is justified. This is a navigation and learning-progression model, not a guarantee of employment or a claim that domain foundations alone qualify someone for every role.

- Domain foundations are the common employability baseline learners need to pursue work across the domain's valid areas. Include only genuinely cross-branch capabilities; do not promote a role-only or specialization-only item merely because it appears frequently. This baseline is not a promise that one set qualifies someone for every regulated occupation or role.
- A domain item can have one or more explicit downstream path targets when its use is relevant to specific, evidenced specializations or roles. If it applies only to one specialization, put it at that specialization instead of making it look universal.
- Group domain items by **theme/use case** (for example, evidence collection, spatial analysis, simulation, or safety analysis). Keep the item type visible inside each group; a theme never replaces the Skill, Competency, Tool, or Certification label.
- Store **requirement level** (`needed`, `useful`, `optional`) separately from **learning order** (`start_here`, `build_next`, `useful_later`, `optional`). Domain items describe the shared foundation and have no universal per-item sequence. Define learning order within the selected specialization's roadmap, then add role-specific ordering or prerequisites where evidence supports them. “Start here” describes sequence, not necessity; “needed” requires evidence for the exact target path.
- Each domain item’s downstream target must identify the specialization/role path, use case, plain-language reason, requirement level for that target, evidence, and limitations. Display “Supports this path” or “Used in this path,” not “leads to a job.”
- When a learner opens a role, calculate a deduplicated cumulative path from the domain foundation, the selected specialization (if any), and that role. Show which layer introduced each item and its path-specific requirement status. Do not combine all specializations or all sibling roles into a single undifferentiated checklist.
- Shared items may support several routes. Display the supported destinations explicitly; do not imply that an item prepares the learner for every downstream route in the domain.

## Required audit for every domain tree

For the domain and every descendant subgroup and role:

1. Inventory the canonical taxonomy, contextual guidance rows, skills, competencies, tools, certifications, work profiles, resources, ownership/provenance, programme links, and existing relationship edges. Record counts and missing layers before changing anything.
2. Decide each candidate item independently: keep as-is, correct/reclassify, replace with a supported item, or remove from active data as unsupported. Verify the item is real, correctly named and typed, owned at the right level, relevant to that level's tasks, and suitable for the student view.
3. Describe the actual learner outcome or work task the item supports. Categorize tools by use case, not vendor or broad taxonomy alone. A general skill is not automatically a role requirement.
4. Build the progression: shared domain foundation → subgroup-specific additions → role-specific learning and work outputs. State prerequisites and what builds on what; keep required, useful, and optional distinct.
5. Preserve explicit, evidence-backed relationships using the supported vocabulary (`builds_on`, `works_with`, `supports`, `alternative`, `complements`, `qualifies_for`). Each edge must resolve to typed items in the same justified context and cite evidence. `not_established` is coverage/audit state only, never a learner-facing relationship.
6. For every item retained for students, attach an item-specific learning/resource URL that lands on the relevant documentation, course, standard, or credential page—not merely a search result, generic homepage, broad occupational category, or unrelated catalogue. Preserve source title, organization, exact locator/section where applicable, source type, relevant jurisdiction/version, access date, and what claim it supports.
7. Test every URL and confirm that its destination supports the stated item and level. Record inaccessible, paywalled, superseded, regional, or platform-specific limitations honestly; do not manufacture a link or call an unsearched item unavailable.

## External evidence protocol

Internal seeds, O*NET/ISCO mappings, role aggregates, and pasted roadmaps are discovery inputs, not sufficient proof by themselves. Search each distinct candidate and each identified gap against authoritative primary sources: official regulators and professional bodies; standards publishers; official product/vendor documentation and training; official occupational/task frameworks; recognized university curricula; and established open learning providers. Use multiple targeted query formulations when the first search does not settle identity, use, level, or learning path. Deduplicate research for the same exact item, but independently verify that the evidence applies to each domain, subgroup, or role where it is proposed.

Keep a query/source trail in the audit checkpoint. An item may be called unsupported only after checking the internal evidence and documenting a reasonable, exhaustive search across the applicable authoritative source classes. If no adequate evidence is found, remove it from active student guidance and mark it `unsupported` (or `not_yet_verified`) in the internal ledger with the search record. Do not inflate coverage by marking a generic URL as item-specific proof.

Treat submitted roadmaps as hypotheses to test. In particular, SAE automation levels describe system capability rather than a learner sequence; a platform-specific item such as TensorRT must be labelled optional/platform-specific where appropriate; and a safety standard such as ISO 26262 is not itself a certification. A Python+C++ starting point must lead only to role paths that have supporting evidence, with verified next steps rather than an assumed shortcut to a job.

## Agent operating contract

Run four agents concurrently. In each tranche, one agent owns exactly one complete domain tree, including all of that domain's active subgroups and roles. Repeat tranches until every active domain is audited; a first tranche is not completion. Initial risk-based tranche:

| Agent | Domain tree | Reason for priority |
|---|---|---|
| Agent 1 | D078 Social Sciences / Sociology | Reference worked example; known ownership, link, wording, and role-count discrepancies need reconciliation. |
| Agent 2 | D011 Quantitative Finance | Known aggregate/tool categorization concerns and role-specific evidence gaps. |
| Agent 3 | D166 Autonomous Vehicles | Known thin foundation, generic items, and office/software tools needing task-level verification. |
| Agent 4 | D001 Software Engineering | Establish a high-volume technical baseline and test the audit method on a complete tree. |

Before starting, verify the domain ID/name and descendants against the current canonical taxonomy; if an ID has changed, report it and use the canonical ID rather than silently switching scope. The coordinator assigns the next four unclaimed active domains after this tranche, prioritizing risk and preserving one-owner-per-domain. Never let two agents edit the same domain or canonical generated artifact.

Agents work from the shared plan and the Sociology worked-example/box-mockup standards. Each agent must:

- make an append-only checkpoint at least after the domain inventory and after each subgroup; retain earlier checkpoint content and timestamp/version each continuation;
- write only its assigned domain's audit/research artifacts under `data/career-mapping/_audit/downstream_enrichment_2026-09-24/` (one domain-specific JSON ledger plus a concise Markdown report); do not directly edit shared seeds, API contracts, UI, SQL, or another agent's files;
- include unresolved decisions and conflicting evidence explicitly; never convert a guess into a confirmed item to meet a deadline;
- report domain/subgroup/role/item counts, decision counts, authoritative sources and URLs, tested link status, evidence limitations, changed/recommended student-facing text, and exact downstream impact;
- stop and checkpoint if the source taxonomy or ownership is ambiguous, rather than changing canonical identity or deleting source evidence.

The coordinator owns cross-domain consistency, conflict resolution, canonical data/code changes, tests, and the final all-domain coverage manifest. Agent artifacts are evidence and proposed dispositions until reviewed and integrated; they do not by themselves certify seed or deployment readiness.

## Checkpoint record format

Each item record must include: `domain_id`, independent `specialization_id` (nullable), `role_id` (nullable), `programme_id`/searched programme when applicable, stable item key and label, item type, `theme_key`/label, `use_case_key`, owner/context level, task or learning outcome, **requirement level** (`needed`/`useful`/`optional`) and, only for specialization/role routes, a separate learning-order priority, disposition (`student_confirmed`, `corrected`, `unsupported`, `superseded`, or `not_yet_verified`), student-display decision, plain-language explanation, prerequisite/next-step and relationship edges, explicit path targets (specialization/role key, target-specific requirement level, rationale, evidence and limits), internal provenance, authoritative source title/organization/URL/locator/version/jurisdiction/access date, item-specific learning URL and link check, limitations, and reviewer/checkpoint timestamp. Keep the original source value and the reason for each change/removal.

The normalized item-to-item relationship table is not a substitute for cross-layer path targets: a domain-owned tool linked to a downstream specialization is an explicit **path applicability** assertion, not a same-context `works_with` edge. Path targets must resolve to the canonical active specialization or role and must be independently evidence-backed.

The additive API/storage contract is `backend/migration_career_context_path_targets.sql`: it adds optional theme/use-case and requirement fields to contextual items and a separate `career_item_path_targets` table. The career API returns only source-backed targets attached to a visible, correctly owned item in the same domain; older databases without this migration continue to return the existing item contract with no path targets. The migration is a local artifact only until separately reviewed and manually applied under `AGENTS.md`; no local test or seed run is live database proof.

## Integration and Skills Matcher acceptance gates

Only after a domain's evidence ledger has been reviewed should the coordinator integrate its approved corrections into canonical contracts/seeds and matcher payloads. Then:

- retain the searched programme name/link and evidence-backed “why this domain connects” explanation through domain → subgroup → role navigation;
- make the cumulative route visible: shared domain employability foundation, selected area-of-specialization additions in that area's learning order, then role-specific additions. Show theme/use case and requirement level at each layer; show learning order only within the selected specialization/role route and show which downstream path(s) the evidence supports;
- allow a domain item to name multiple supported destinations while clearly distinguishing genuinely shared foundations from route-specific items. Do not present a tool or skill as universally useful merely because it is stored at domain level;
- implement the refined Sociology box mock-up behavior: one easy search; clear Skill/Competency/Tool/Certification labels; mark known or want to learn; add/remove; all/any; recalculated, explainable domain → subgroup → role paths; and item-specific learning links;
- show only confirmed, correctly owned, task-relevant items as student requirements. Unsupported, review-only, audit-only, and unestablished evidence stays out of student results;
- verify separate student/admin audience behavior: secondary-school admin sees SS1–SS3, tutorial-centre/JAMB users see JAMB only, and university admin does not see an undergraduate selector;
- test category and ownership boundaries, relationship resolution, missing-link behavior, search combinations, and programme-to-domain evidence. Include regression cases for Microsoft Office in technical domains, inappropriate role-level skill aggregation, SAE levels, TensorRT, ISO 26262, and Python+C++ route claims;
- regenerate affected seeds only from their canonical sources and run all required local audits, API/UI tests, and browser proof. Follow repository `AGENTS.md` gates: local evidence and browser proof precede manual SQL; do not call a local result a live deployment. Push only after the agreed gates pass, preserving unrelated worktree changes.

## Completion definition

The audit is complete only when the manifest covers 100% of active domains, subgroups, roles, and candidate student-facing items; every candidate has an explicit disposition; every confirmed item and relationship has context-appropriate evidence; all retained learner items have verified item-specific sources/links; removed items cannot leak into matcher output; programme provenance is preserved; the matcher behavior and audience rules pass; and the generated artifacts pass repository audits and browser checks. Report remaining genuinely unavailable or not-yet-verified items separately with the evidence trail. Do not report “done” based on agent activity, a sample, URL syntax checks, or a successful local generator alone.
