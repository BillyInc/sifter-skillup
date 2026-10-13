# JAMB–CCMAS curriculum and domain-mapping checkpoint — 2026-10-02

## Current phase and guardrails

Refresh course-level curriculum/outcomes from the corrected checked-in CCMAS
records, then audit every canonical JAMB identity from its selected CCMAS or
external curriculum evidence to its current domain links. Use deterministic
joins first. Do not auto-promote a candidate domain or invent Direct,
Functional, or Adjacent status from text overlap alone. Subgroups and roles
remain untouched until the JAMB-to-domain layer is reconciled. No live SQL was
applied and no repository push was made.

## Curriculum and outcome refresh

- Read-only quality audit: 237 CCMAS packages; 75,472 source course-outcome
  rows; 20 annotation rows. The audit retains Sociology's separate contract.
- Regenerated generic contract: 236 non-Sociology packages; 9,789 courses;
  75,236 course-linked outcomes; 75,236 student-display outcomes; 0 review-only
  outcomes; 306 programme-ability rows kept out of the student view; 19 source
  annotations stripped from student text but retained in locators.
- Local compressed SQL transport was generated as four gzip parts with a
  checksum manifest. This is a local seed, not a live database update.
- Files: `backend/seed_programme_curriculum_contract_2026-10-02.sql` (local
  generated/ignored), `backend/seed_programme_curriculum_contract_2026-10-02_parts_gz/`,
  `data/career-mapping/_audit/programme_curriculum_contract_2026-10-02.json`,
  and `data/career-mapping/_audit/programme_curriculum_quality_2026-10-02.json/.md`.

## Current JAMB reconciliation

The 2026-10-02 deterministic reconciliation reads 420 rows from each of the
programme mapping, component inheritance, selected curriculum scope, and JAMB
domain map layers. It checked 6,161 selected-course occurrences: 6,028 resolve
to current exact CCMAS course variants; 42 do not resolve to the declared
current CCMAS package; the remaining course occurrences are externally or
custom sourced and need source-context checks.

Current finding counts after the safe anchor repair:

- 117 JAMB identities pass the current local cross-ledger reconciliation;
- 303 identities still have one or more mapping/source-review findings;
- 497 JAMB-domain links do not exactly match a component score-catalogue
  `(domain_id, match_type)` row;
- 383 JAMB-domain links still cite course titles absent from that JAMB's
  selected curriculum scope;
- 41 explicit mapping holds and 4 external-component source reviews remain;
- 42 selected-course records are absent from their declared CCMAS package.

The 42 unmatched occurrences are concentrated in three JAMB identities:
Electrical Engineering (1 course identity mismatch), Intelligence and
Security Studies (19 selected rows with no CCMAS source locator), and Social
Justice (22 selected rows with no CCMAS source locator). The latter two are
custom/external bundles, not CCMAS packages; attach and verify their external
source provenance rather than treating them as CCMAS course records.

## Deterministic correction completed

An audit identified 151 title-anchor normalization candidates. Only 67 had a
one-to-one match from each stored anchor to exactly one selected-course title
and a unique domain-link target. Those 67 evidence titles were normalized in
`data/career-mapping/jamb_domain_map.json`; no domain IDs, link counts, or
match types were changed. The other 84 were left untouched because at least
one anchor had multiple plausible selected-course matches.

Post-repair reconciliation dropped the unselected-title-link findings from
450 to 383. The 67 repairs are recorded in
`jamb_domain_anchor_normalization_2026-10-02.json`.

## Refreshed source-evidence audit

- Rebuilt programme/domain evidence from the current CCMAS course data without
  replacing the checked-in canonical score or evidence files: 1,344 component
  evidence rows; 1,218 strong, 60 moderate, and 66 weak under the existing
  evidence gate.
- Cross-joined each JAMB's selected courses to those component anchors by
  source package, course code, and exact title. Of 2,313 existing JAMB-domain
  link occurrences, 1,362 have two or more selected-course anchors, 135 have
  one, and 816 have none in this refreshed evidence register.
- The same exact join surfaced 85 currently-unmapped JAMB/domain candidates
  with at least two overlapping CCMAS course anchors. They are a review queue,
  not new confirmed links; broad/shared terms can still produce false
  positives.
- A score recomputation from current component records found 23 packages with
  numeric changes and 2 packages with changed domain/link-type sets. The score
  script uses lexical/profile heuristics, so its new results are audit input,
  not authority for automatic match-type changes.
- Main machine-readable register:
  `jamb_domain_links_refreshed_ccmas_evidence_2026-10-02.json`.
- Catalogue mismatch detail:
  `jamb_domain_catalogue_mismatch_audit_2026_10_02_current.json`.
- Current unselected-anchor detail:
  `downstream_unselected_course_held_mappings_audit_2026-10-02_002.json`.

## Subject lane status

The subject subagent reported a Codex usage-limit error and could not resume;
no replacement-agent tool was available in this session. Local progress:

- Re-extracted 10 original local JAMB brochures (1,068 pages); found 122 of
  the 130 exact parser aliases across the 48 canonical subject codes. Eight
  literal spellings need punctuation/variant inspection; literal misses do
  not prove absence.
- Current subject rule queue: 223 identities with a parser `needs_review`
  layer, 1 empty requirement identity, and 26 typed `source_missing` rows.
  These overlap and are not additive unique-programme counts.
- Scoped subject tests: 44 passed; pytest reported one non-failing cache
  permission warning. No cache files were altered.
- Audit: `jamb_subject_catalog_original_pdf_audit_2026_10_02.json/.md`.
- Official scope references: [JAMB FAQ](https://jamb.gov.ng/FAQ) says IBASS
  supplies UTME combinations for each course; the [IBASS Eligibility
  Checker](https://eligibility.jamb.gov.ng/) requires institution and
  programme selection. Keep rule variants tied to their exact course and
  offering context rather than promoting a faculty-wide generalization.

## Tests and known test issue

- Passed: `python -m pytest tests/test_subject_option_parser.py
  tests/test_subject_option_seed.py tests/test_student_pipeline_match.py -q`
  from `backend/`: 44 passed, one non-failing pytest-cache warning.
- Passed: `python -m pytest
  data/career-mapping/_audit/test_repair_jamb_domain_map_stale_ccmas_scope_2026_09_29.py
  -q`: 1 passed. The old test compared the whole scope object to an older
  canonical snapshot; it now checks canonical selected course identity/status
  exactly while permitting the three later source-review metadata extensions
  (`note`, `facet_qualifications`, and
  `external_component_qualifications`).

## Next actions

1. Deterministically separate true source/package identity errors from the
   external/custom CSS/Social Justice rows; find a valid source path for the
   one Electrical Engineering course discrepancy.
2. Produce proposed domain corrections from the 497 catalogue mismatches and
   383 stale anchors, prioritizing exact selected-course evidence. Do not use
   score-only labels to auto-change Direct/Functional/Adjacent.
3. Review the 85 unmapped candidates and 816 no-anchor current links for
   semantic/category fit. These are appropriate agent adjudication queues once
   a usable agent session is available.
4. Continue the subject lane from the eight alias spellings and collision
   groups, then source-adjudicate the remaining rule queue; the subject agent
   itself remains unavailable until its usage limit clears or a new session
   can be started.
5. Only after mapping corrections and final local audits, regenerate the
   final domain/career seed. Do not apply SQL or call this live until the user
   chooses the applicable deployment workflow.

## Continuation update — 2026-10-02

- Refreshed the JAMB selected-course snapshots from the current corrected CCMAS
  records. One exact-title/unique-package identity correction was made:
  Electrical Engineering `TEL 100` → CCMAS `TEL 102`, “Introduction to
  Electrical Engineering.” The exact CCMAS course content/outcomes were copied
  at the same time. No fuzzy or cross-package matching was used.
- The refreshed 420-name reconciliation now has 117 locally consistent names
  and 303 with outstanding mapping/source findings. The previous 41
  “course not found in CCMAS” flags were false positives for the two declared
  custom bundles (Intelligence and Security Studies; Social Justice), whose
  courses are intentionally not CCMAS package rows. Their external provenance
  is still a separate unresolved requirement. Four external component/source
  reviews remain.
- The catalogue cross-check still finds 497 links absent from the older
  component score catalogue; 383 link anchors still reference titles outside
  the current selected-course scope. These counts are not proof that all such
  links are wrong: the fresh evidence join below is the candidate repair basis.
- Rechecked current JAMB links against the refreshed 1,344-row programme-domain
  evidence, using existing selected courses only; no keyword-based scope
  expansion ran. Per-JAMB candidate gate: Direct/Functional requires two exact
  selected-course anchors plus a repeated specific evidence cue; Adjacent
  requires a selected anchor, selected-course transferable evidence, and a
  specific cue. Held/combined scopes remain held; candidate links are not
  applied pending semantic review.
- Current link recheck: 1,817 existing links, 1,751 candidate links across
  372 source-resolved scopes; 191 candidate additions, 257 candidate removals,
  1,560 same domain+tier pairs; 42 held scopes and 6 scopes without a resolved
  source. These are candidate deltas, not final correction counts. The broad
  keyword scope-builder delta (363 additions, 354 body-only) remains excluded.
- Tests: the new evidence-gate tests and the stale-anchor repair test pass (4
  total). New files:
  `data/career-mapping/_audit/audit_jamb_domain_links_against_selected_current_scope_2026_10_02.py`,
  `data/career-mapping/_audit/jamb_domain_link_scope_recheck_2026-10-02.json/.md`,
  and
  `data/career-mapping/_audit/test_jamb_scope_link_evidence_gates_2026_10_02.py`.
- Subject lane: Huygens was sent a continuation request to resume from this
  checkpoint, using a disjoint subject-only write scope. The task remains open;
  wait for its next checkpoint and reconcile it before calling that lane done.

## Continuation update — repository-backed components and combined scopes — 2026-10-02

- Corrected the external/custom provenance rule: source evidence is checked at
  the declared programme/component level, not redundantly on every course.
  Related-CCMAS bundles must resolve each named course to its exact CCMAS
  package and source file; external bundles must resolve to their repository
  enrichment file and its programme-level source entry.
- Hydrated the Intelligence and Security Studies and Social Justice bundle
  course references from exact current CCMAS package/course identities, so the
  canonical JAMB scope now carries the actual source course details.
- Resolved and applied all six repository enrichment bundles (including
  Anthropology, Portuguese and the two sport bundles). The Portuguese/English
  JAMB identity retains its OAU Portuguese reference curriculum alongside its
  English CCMAS facet; it is not represented as LASU's exact course schedule.
- Rebuilt and applied the full union of all declared CCMAS components for 40
  combined JAMB identities. All 40 components resolve to current source
  packages; the resulting canonical scope includes 8,397 course occurrences
  that match source CCMAS variants. This fixes missing/partial combined
  curriculum inheritance, including Mathematics with Computer Science and
  Accounting and Finance.
- Reconciliation now reports 7 complete custom-component source-evidence
  records and zero `external_component_requires_source_check` findings. It
  reports 152 locally consistent JAMB identities; 268 remain in reconciliation
  because of domain-link/catalogue mismatch, stale anchors, or three explicit
  non-external mapping holds. These findings are not all confirmed mapping
  errors.
- Recomputed domain links against the expanded exact-source scopes: 416 scopes
  are source-resolved; the candidate delta is 191 additions and 277 removals,
  with 1,886 same domain+tier pairs. This remains a candidate delta and has not
  yet been synchronized into `jamb_domain_map.json` pending the domain-link
  reconciliation step.
- Added `apply_resolved_repo_custom_component_scopes_2026_10_02.py` as a
  guarded applicator, and enhanced the builder/audits to retain component-level
  provenance and hydrate related CCMAS courses. Evidence-gate and stale-anchor
  tests pass: 6 passed.
- Subject lane: Huygens was sent a continuation/status request with an
  explicitly disjoint subject-only scope. The previous checkpoint recorded 44
  passing subject tests and remaining alias/rule-source adjudication; no newer
  response has arrived yet, so that lane is still in progress and not signed
  off.
