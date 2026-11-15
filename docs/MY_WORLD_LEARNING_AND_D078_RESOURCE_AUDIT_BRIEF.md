# My World Learning Saves and D078 Resource Audit Brief

**Prepared:** 2026-11-09  
**Purpose:** Preserve two follow-up workstreams: let learners curate learning materials in My World, and use Codex Luna xhigh to audit and substantially enrich D078 learning resources with verified videos and direct resource links.  
**Status:** Planning/handoff only. This document does not implement the feature or perform the D078 source audit.

## 1. Save learning materials to My World

### User outcome

A learner can select a resource shown in programme, domain, area, subgroup, role, skill, competency, tool, or certification guidance; save it to **My World → Saved learning**; return later; open the original resource; and remove it from the saved list. Saved state must be personal, durable, and truthful.

### Existing implementation to verify before changing code

The repository already specifies and appears to implement much of this behavior. Start by inspecting the current worktree rather than assuming it is missing:

- `src/components/careerIntelligence/LearningResourcesBlock.tsx` renders source-backed learning resources and save controls.
- `src/components/careerIntelligence/SaveButton.tsx` and `src/lib/careerData.ts` handle saved-item persistence and result states.
- `src/screens/MyWorldScreen.tsx` displays personal saves, including the `Saved learning` grouping.
- `src/types/career.ts` includes `resource` as a saved entity type; individual skills are not independently saveable.
- `backend/migration_saved_resource_support.sql` extends resource support for `saved_items`; verify the active schema and any required deployment step before claiming production availability.
- `docs/PRODUCT_BEHAVIOR_CONTRACT.md` sections “Skills Match and SkillsBridge”, “Flow F: My World and personal persistence”, and “SaveButton” define the current product contract.
- `docs/user-facing-mockups/undergraduate-student-flow.md` under “Resources, skills and My World” shows the intended save and Saved learning experience.

### Verification and gap-fix scope

1. Trace the live learner flow from an approved resource card through Save, My World → Saved learning, reopen, and remove. Cover programme/domain/area/subgroup/role contexts that actually expose resources.
2. Confirm the resource is saved by canonical URL, deduplicated across contexts, with enough display metadata to identify it (title, owner/context, resource type, and source/link). Do not save unverified or hidden resources.
3. Verify durable backend confirmation before showing success. Cover signed-in, guest/locked, saving, already-saved, remove, offline/backend failure, empty My World, and retry states. A failed save must never look successful.
4. Keep saved resources distinct from saved roles/programmes, guidance paths, notes, learning progress, and saved skills. Do not add “save skill” behavior without a separate approved data contract.
5. Test responsive/mobile interaction, accessibility labels and selected state, keyboard/focus behavior where applicable, and safe external-link opening.
6. If the flow is already complete, document the verified behavior and only fix concrete regressions; do not build a duplicate resource-saving system. If functionality depends on unapplied SQL, report that deployment gate separately and follow the repo’s Supabase apply-now instructions.

### Acceptance criteria

- A signed-in learner can save an approved resource from its contextual card and find it in My World → Saved learning after navigating away and returning.
- Repeated saves of the same canonical resource do not create confusing duplicates; remove is durable and reflected in the source card and My World.
- Only backend-confirmed results show Saved/success; guest, offline, failure, loading, empty and retry states are explicit and usable.
- The saved list identifies each resource and opens the original direct URL. No source-backed ownership or approval gate is bypassed.
- Existing saved-resource behavior is reused; there is no new parallel table, bookmark service, or unsupported saved-skill state.

## 2. Codex Luna xhigh D078 learning-resource audit and enrichment

### Goal

Audit the **current** learner-visible D078 Sociology learning resources end to end and materially improve their usefulness, coverage, directness, and access. Add strong video resources where they genuinely teach the relevant item. Do not merely increase link counts: every proposed item must directly support a named learner task/concept and have an inspectable locator and transparent limits.

### Model and starting materials

Run this work in Codex using **Luna xhigh** if that model is available in the user’s environment. If unavailable, stop and state that constraint rather than silently pretending a different model was used; the user can authorize an equivalent high-reasoning model.

Start with these current artifacts and trace their consumers:

- `backend/d078_guided_content.py` — student-facing D078 domain/area/role projections and learning-link approval filters.
- `data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json.gz` and its `..._parts_gz/` source parts — item-level claims, owners, resource decisions, links, review states, and scope limits. Use the repo’s established transport/materialization workflow; do not edit compressed generated artifacts by hand.
- `data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json` — canonical area/role identity and route boundaries.
- `backend/tests/test_d078_guided_content.py`, `backend/tests/test_student_guidance_contract.py`, and related D078 API tests — visibility and learning-link gates.
- `docs/PRODUCT_BEHAVIOR_CONTRACT.md` and `docs/user-facing-mockups/undergraduate-student-flow.md` — resource display/save interaction and user-facing states.

Reconfirm paths and dates in the current worktree first. The listed audit/master timestamps are historical artifact names, not proof that their contents are the latest approved state.

### Audit method

1. **Inventory and baseline.** Enumerate every current D078 learner-visible domain, area, subgroup and role item with its stable ID, ownership, claim/task, current resource URL(s), resource type, access/review state, locator, language, cost/accessibility notes, and last verification date. Count items with no link, generic/non-direct links, broken/redirecting links, outdated links, video gaps, or mismatched owner/context. Separate approved student-visible content from staff-only, review-required, hidden, rejected, and legacy records.
2. **Audit item by item.** For every current visible item, check whether each URL resolves to the intended resource, is direct enough to reach the exact article/chapter/course/video, and actually teaches the named item. Record evidence and a precise locator (section, chapter, timestamp, lesson, or page); identify prerequisites, level, language, cost/paywall, captions/transcript, regional/access restrictions, and date checked.
3. **Search for replacements and alternatives.** Prioritize primary and authoritative open resources: university course materials/open textbooks, recognized professional or public institutions, peer-reviewed/open-access work where instructional, and reputable teaching channels. Use direct URLs to the resource itself—not homepages, search-result pages, generic catalog pages, affiliate pages, or guessed links. For video, prefer the exact video/watch page or stable official course lesson; capture title, creator/publisher, duration, language, captions/transcript status, and relevant timestamp(s). Do not use a video merely to satisfy a quota.
4. **Add video coverage deliberately.** Seek at least one suitable, verified video for each major teachable concept/task where a useful one exists; include more than one method/interpretation when that improves learning. If no credible, accessible video is found after bounded search, record a terminal no-hit with the searched source families and date. Preserve text alternatives for accessibility and learners with limited bandwidth.
5. **Preserve evidence and ownership.** A resource can support a specific item without becoming a universal D078 resource. Keep programme/domain/area/subgroup/role ownership correct; preserve source/claim review and approval gates; do not promote a review-required item or infer prerequisite/compulsory status from popularity, frequency, or a link. Keep multiple good resources as alternatives where appropriate.
6. **Close the audit, not just the batches.** Produce a coverage matrix keyed to every in-scope visible item and a terminal disposition per item/resource gap: verified and retained, replaced, added, duplicate consolidated, unavailable/bounded no-hit, or escalated for human review. Run a counter-search across the planned source families and audit the full matrix for omissions before declaring completion.

### Resource quality fields to record

For every retained or proposed link, capture at minimum:

- stable resource ID and linked D078 item ID/owner;
- exact title, creator/publisher, resource type (`video`, `article`, `chapter`, `course`, `book/open text`, `dataset/tool tutorial`, or other explicit type), and direct HTTPS URL;
- precise locator (including video timestamp when only a segment is relevant);
- claim/task the resource teaches and why it fits this item;
- learner level and prerequisites; language; access date; free/paid/paywall/account requirements;
- video duration, captions/transcript availability, and text/low-bandwidth alternative when applicable;
- source quality/review status, verification date, and any scope, licensing, currency, or transfer limitation.

Never fabricate a direct URL, title, timestamp, access status, credential, or claim. If access is blocked, say so and record what was and was not inspected. A search-result snippet is discovery evidence, not full-resource verification.

### Deliverables

1. A dated audit report with baseline counts, scope/method, and final per-item disposition.
2. A machine-readable coverage ledger linking every in-scope item to current and recommended resources, verification metadata, and unresolved/no-hit reasons.
3. A resource change set in the canonical source/data format, with stable IDs, precise locators, direct URLs, accurate ownership, and preserved review/approval gates.
4. A concise learner-facing resource presentation update, if needed, that clearly distinguishes videos, readings, tools and qualifications; indicates duration/access; supports save-to-My-World; and offers accessible text alternatives.
5. Tests/audits proving all visible resource IDs and URLs resolve in the data contract, owner/approval gates remain intact, direct URLs and video metadata are present where required, and My World save/remove states remain correct.
6. An explicit remaining-limits section. Do not call the catalog complete if visible items lack a disposition, and do not claim all web resources have been exhausted.

### Definition of “massively improved” and done

- Every currently learner-visible D078 item is inventoried and receives an audited terminal resource disposition; no silent omissions or inherited alias-only coverage.
- Every added or retained primary resource is verified to match the exact item/task and carries a direct URL plus a precise locator and checked date.
- Video is represented as a first-class resource type and added across major concepts wherever credible, accessible matches exist; bounded no-hit cases are explicit, never filled with weak or irrelevant videos.
- Useful alternatives, prerequisites, learner level, language, cost/access, captions/transcripts and text alternatives are surfaced so learners can choose.
- No approval, evidence, ownership, route, prerequisite, or student-visibility gate is weakened to inflate coverage.
- The full item-by-item ledger, tests and counter-search all reconcile; remaining access gaps and unsupported claims are visible. Only then call the D078 resource audit closed.

## Ready-to-run Codex Luna xhigh task prompt

> Use Codex Luna xhigh to audit and improve the current D078 Sociology learning resources. First inspect the current repository, all applicable `AGENTS.md` instructions, the learner-visible D078 projection/API, master guided-experience reconciliation and its compressed source parts, canonical D078 route graph, resource UI, save-to-My-World flow, tests, and prior audit artifacts. Do not assume artifact filenames imply current approval. Establish a baseline item-by-item inventory before editing. Then research direct, verified learning links and relevant videos for every currently learner-visible D078 item, using exact resource URLs and precise section/page/timestamp locators; include source, access date, learner level, language, cost/access, prerequisites, duration/captions/transcripts for videos, and text alternatives. Prefer authoritative, high-quality, accessible resources. Do not fabricate or use homepage/search-result links as final learning URLs. Preserve item ownership, evidence, review, student-visibility and requirement gates. Maintain stable IDs and update canonical source artifacts and tests, not generated files by hand. Reconcile all items to terminal dispositions, run a bounded counter-search and full matrix audit, test resource display plus save/remove in My World, and produce the audit report, machine-readable ledger, changes, verification results, and explicit limitations. Do not claim closure while any in-scope item is unmapped or lacks a terminal disposition. Do not apply Supabase SQL or claim live deployment unless separately authorized and all repository deployment instructions are satisfied.
