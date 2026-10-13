# D078 guided-experience implementation checkpoint — 12 October 2026

## Active scope and guardrails

Continue the Sociology programme → D078 Social Sciences → selected Area(s) of
Specialization/practice → optional role guided-experience implementation. Work
from the controlling specification, implementation plan, and the consolidated
master reconciliation.

- Do **not** reopen role-fit adjudication. Consume the existing role-item
  dispositions; `role_fit_reopened=false` is an invariant.
- A separate agent owns the JAMB subject matcher. Do not duplicate or divert
  into that task.
- Nigerian evidence is valuable context, but its absence is **not** a blocker
  when global evidence supports use in the relevant route.
- Local SQL generation is allowed once the consolidated D078 dispositions,
  theme inventory, sequence and scoped runtime-content contracts pass their
  current checks. Do not apply SQL to Supabase or begin analytics without the
  separate deployment/release gates.
- Fix stale reports/contracts when current evidence already closes the stage;
  do not restart completed research or sequence decisions.

## Authoritative current reconciliation

Use [`D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json`](../../data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json)
as the consolidated read surface. Rebuild it with
`data/career-mapping/_audit/build_d078_master_reconciliation_2026_10_12.py`.
It preserves source-artifact lineage and carries the approved sequence,
item-level dispositions, relationships, and graph together.

Verified current counts:

- Programme: **14 themes**, not 3. The separate programme-theme evidence file
  has **3 claim records**; those records are not a theme count. The 14 audited
  themes each have narration and course evidence, and the resource audit
  covers all 14. They are fixed curriculum groupings, not extra-learning
  choices. Student-copy release remains a separate check.
- Domain: **53** records, **52 approved / 1 unapproved**.
- Areas: **144** records across the **7 current areas**, all approved; six
  supported duplicates are approved aliases of canonical cards, leaving 138
  distinct area cards for runtime display.
- Role items: all **173** carried forward, **171 approved / 2 unapproved**;
  role-fit adjudication remains closed. The two exclusions are not a reason to
  reopen the role audit.
- Sequence: approved design has **3** conditional, route-scoped hard learning
  dependencies. All **27** area-order declarations and **19** critical
  relationship references have explicit dispositions. A disposition does not
  automatically mean a hard prerequisite.
- Domain relationships: **175** dispositioned (51 typed links, 124 explanatory
  annotations); 44 typed edges were added to the graph and four typed
  relationships with no matching graph endpoint remain preserved as
  annotations rather than fabricated nodes.
- Consolidated master graph: **2,399 nodes / 3,801 edges**. The three approved hard dependencies
  resolve and form an acyclic graph. The graph-level area identity check now
  compares canonical `area_id` values and passes for all seven areas.
- Runtime wiring: `backend/routes/career_routes.py` merges the 52 approved
  domain items and 138 distinct approved area cards into
  `GET /api/career/domains/{domain_id}`. The hidden flag on the older audit
  graph does **not** suppress those API records. This local code check does
  not establish whether that endpoint is deployed publicly.
- Client-boundary contract: all 190 approved runtime records have the link
  source reference, HTTPS URL, locator and access date required by
  `src/lib/studentCareerBoundary.ts`; the gate and backend regression test now
  check these fields so the client sanitizer cannot silently discard an item
  for missing link metadata.

## Theme-count correction and verification

The previous summary named the 3 claim-record count `programme_theme_claims`,
which made it look as if Sociology had only three themes. The builder now
stores the 14 audited theme records explicitly as `programme_themes`, reports
`programme_themes=14` separately from
`programme_theme_claim_records=3`, and checks theme identity/count against the
programme graph, narration audit, and resource-coverage audit.

Latest local verification:

```text
python data/career-mapping/_audit/build_d078_master_reconciliation_2026_10_12.py
python -m pytest backend/tests/test_d078_guided_content.py backend/tests/test_d078_guided_areas.py -q
python data/career-mapping/_audit/audit_d078_student_promotion_gate_2026_10_10.py
```

- Master rebuild succeeded; theme count and all seven current areas validate.
- Focused tests: **11 passed**. Pytest emitted a Windows cache-directory
  warning; it did not affect the test result.
- Current programme theme audits: **14/14** themes have narration and course
  evidence, and **14/14** have resource-matrix coverage (25 distinct URLs).
  The separate **3** approved theme-claim records are explanations inside the
  Research theme; they are not the count of programme themes.
- Current broader focused suite: **24 passed** across the D078 guided-content,
  area, and complete-learning-graph tests. A Windows pytest cache permission
  warning did not affect the results.
- Local D078 SQL seed regenerated at
  `backend/seed_d078_guided_content_2026-10-12.sql`: **190 approved scoped
  domain/area learning items** (52 domain + 138 distinct area cards). It
  excludes the 1 unapproved domain item, six approved duplicate aliases, and
  two unapproved role-item decisions. This is a local SQL artifact, not an
  applied migration or the full canonical taxonomy seed.
- The D078-specific taxonomy migration and seed are now generated at
  `backend/migration_d078_specialization_taxonomy_2026-10-12.sql` and
  `backend/seed_d078_specialization_taxonomy_2026-10-12.sql`. The seed carries
  the full domain name, seven current areas, and 26 reviewed area-to-role
  routes (18 supported / 8 conditional); it emits no legacy subgroup labels.
  The live D078 presentation path still reads its seven areas from
  `data/career-mapping/domain_specialization_catalog.json` and role routes from
  `D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json`; the generic
  `domain_structure.json` still has two historical subgroup records (ISCO 21
  and 26) in addition to seven area records. The generic career-seed generator
  is not a safe substitute for a D078-specific export: it derives subgroup
  rows from that legacy structure and does not serialize the full approved
  multi-area route graph. Keep those two historical labels out of any
  student-facing/exported current-area list.
- The current D078 runtime/taxonomy regression tests pass (**22 passed** across
  the taxonomy-seed, area/catalog, API regression and guided-content suites).
  This verifies the local seven-area runtime path and generated taxonomy seed;
  it does **not** prove that taxonomy/routes have been persisted in Supabase.
  The 190-row contextual-content seed remains a separate SQL artifact.
- The repository is on branch `very-new`; only `origin` is configured. No
  package was pushed. The compressed local verification bundle is at
  `artifacts/D078-manual-review-2026-10-12.zip`; its individual `.gz` payloads
  and checksummed manifest are in
  `artifacts/d078-manual-review-2026-10-12/`. The archive integrity test passed.
  Any push target must be explicitly confirmed rather than inferred from the
  branch name.
- Sociology route, learning-plan persistence, and report smoke tests pass.
  The route smoke now uses the real current area ID
  `D078:sociology-social-anthropology`, replacing its stale legacy
  `D078|sg:research` fixture. It still verifies five transitions through to
  the optional-role route.
- Promotion gate, refreshed against the current master: controlled student
  verification is ready, but public release is **not** approved. The approved
  runtime content contract passes and all item dispositions are final. The
  current gate still says `implementation_ui_gate_passed=false` and
  `explicit_student_facing_approval=false`. The old blanket
  `content_contracts_approved=false` flag was stale: the gate now reads the
  current master, verifies all decisions are final, and validates the 190
  approved runtime domain/area items. It reports
  `approved_runtime_content_contracts_passed=true`; explicitly unapproved
  records remain excluded. The 10 October graph snapshot's 3,757-edge count is
  historical; the consolidated 12 October master is authoritative at 3,801
  edges.
- Verification refreshed in this continuation: the promotion gate reports
  all 11 controlled-verification checks true, with `implementation_ui_gate_passed=false`
  and `explicit_student_facing_approval=false` as the only release checks still
  false. The D078 route, learning-plan persistence, and report smoke scripts all
  pass; the local web production build succeeds. It emits existing duplicate
  object-key and large-chunk warnings outside this D078 change. These results
  do not substitute for a rendered authenticated session or the user's explicit
  student-release approval.
- Direct Jest execution of `src/lib/studentCareerBoundary.test.ts` remains
  unavailable because `jest-expo` is not resolvable in this checkout; the
  focused Python tests and gate cover the D078 payload fields but do not
  substitute for that TypeScript test or rendered acceptance.

## Next action — continue implementation without looping

The D078-specific taxonomy export and compressed manual-verification package
are generated and verified locally. The taxonomy seed generator produced 7
areas and 26 reviewed routes (18 supported / 8 conditional); the focused suite
passed **22 tests**, the route/persistence/report smoke scripts passed, the web
build succeeded, and the ZIP/payload integrity checks passed. The bundle now
also carries the freshly regenerated promotion-gate and implementation-check
JSON. Do not re-adjudicate role fit or use the generic seed's two legacy
subgroup labels as current areas. No remote push or Supabase SQL application
occurred; local package creation is not deployment or public promotion.
Controlled authenticated/rendered route and report verification remains
outstanding; the UI gate and explicit public-release approval are still false,
so do not describe this as public student promotion or Supabase deployment.
Do not turn those release gates into a reason to redo completed content
review. Do not restart role-fit research, programme-theme research, or approved
sequence design.

Controlled authenticated/rendered acceptance is still distinct from local
tests. The prior account attempt could not reach Supabase because configured
database DNS resolution failed; no account was created and no authenticated
report/PDF was generated. Do not claim browser, account, print, or download
verification from fixture tests or HTTP health checks. Resume that acceptance
only when its dependencies are available, and record observed results.

## Worktree safety

The worktree contains extensive pre-existing edits and generated artifacts.
Preserve them. Do not reset, clean, checkout, or regenerate unrelated JAMB,
taxonomy, career-seed, or UI files.
