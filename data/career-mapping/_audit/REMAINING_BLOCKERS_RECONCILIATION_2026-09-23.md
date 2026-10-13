# Remaining non-SQL/non-browser blockers reconciliation — 2026-09-23

Append-only, read-only local reconciliation checkpoint. This artifact joins the
current resource, JAMB, work-profile, item-link, relationship, downstream and
admin ledgers without rerunning the sample search or promoting any evidence.

No SQL, Supabase write, browser proof, URL fetch, generated seed, UI or
application implementation was changed. The report is local evidence only.

## Current correction checkpoint — supersedes the earlier resource-count interpretation

The corrected append-only JAMB ledger now covers **420/420 canonical JAMB
identities**. Every identity has at least one retained external learning or
curriculum resource; **420 are resource-available, 0 are resource-review-only,
and 0 are genuinely unavailable**. The 11 occurrences without a CCMAS anchor
are included and available where external evidence exists. A missing CCMAS
anchor is provenance metadata, not an unavailable decision.

This supersedes the earlier statements below that treated 237 programme
packages or the 86 mapping-review identities as an unresolved resource-search
population. The 86 remain a separate internal downstream mapping/evidence
review queue; resource availability is no longer the missing step for those
identities. See the corrected ledger at
`data/career-mapping/_audit/programme_jamb_resource_evidence_2026-09-23_corrected_004_manifest.json`.

The regenerated downstream route audit also separates the **154 CCMAS
packages represented by a JAMB identity** from **83 CCMAS-only supporting
packages** with no JAMB identity/offering. The 83 remain explicit admin
findings and do not block the 420-identity JAMB student route. The
student-facing JAMB reachability gate is now PASS; the supporting-package
findings remain visible in the all-package report.

## Controlling documents read

- `AGENTS.md`
- `docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md`
- `docs/user-facing-mockups/SOCIOLOGY_BOX_MOCKUP_IMPLEMENTATION_AUDIT_2026-09-17.md`
- `docs/user-facing-mockups/SOCIOLOGY_TOP_DOWN_AUDIT_AND_CLOSURE_PLAN_2026-09-17.md`
- `docs/user-facing-mockups/EXPLORE_ENTRY_DOORS_AND_PROGRAMME_UNIVERSITY_FLOW_2026-09-18.md`

The governing product/route boundary is consistent across these documents:
item-specific verified links only, explicit unavailable/review states, exact
ownership/context, and fail-closed student exposure until review and deployment
proof are complete.

## Authoritative population reconciliation

| Surface | Authoritative current count | State | Reconciliation note |
| --- | ---: | --- | --- |
| CCMAS programmes | 237 | complete locally | 236 generic contracts plus 1 reviewed Sociology contract |
| Canonical JAMB identities | 420 | complete locally | the 86-row review queue is a subset of this population |
| University offerings | 9,130 | complete in canonical pipeline | 9,130 unique university/programme pairs |
| Active programme→domain links | 1,344 | complete locally | 0 programmes lack an active mapping |
| Downstream route instances | 1,344 domains; 3,580 subgroups; 46,941 roles | complete locally | 5,668 unique downstream contexts |
| Canonical contextual items | 121,377 | contract-complete, exposure-gated | 0 missing source locators or link-state rows |
| Canonical contextual relationships | 408,163 | exposure-gated | 405,858 source-backed; 2,305 not-established |

The route audit also reports 442 joined JAMB identities and 9,514 projected
offering rows. Those are joined/projection counters, not replacements for the
canonical pipeline counts of 420 identities and 9,130 offerings. This report
does not treat the difference as a new data population without a dedicated
identity/alias reconciliation.

## Policy correction — JAMB/CCMAS complement

The student-facing JAMB scope is **420 identities**. A CCMAS curriculum/domain
complement is optional. The **11 occurrence-level rows with
`nigerian_ccmas_anchor_missing` are therefore not blockers and are not
automatically unavailable**. They remain auditable evidence states, but their
absence must not suppress the parent JAMB identity. The 11 occurrences must not
be subtracted from the 420-identity population.

The full correction and counts are recorded append-only in
`REMAINING_BLOCKERS_POLICY_CORRECTION_2026-09-23.json` and `.md`.

## Remaining blockers

### 1. Programme/JAMB external resources — complete locally

The corrected append-only ledger covers all **420 canonical JAMB identities**,
including the 11 anchor-absent occurrences. It records **420 available resource
packages, 0 review-required resource packages and 0 genuinely unavailable
packages**. The older 237-package and 86-identity counts are historical
review-ledger populations and are not the current external-resource denominator.

The 237 CCMAS packages and 86 downstream mapping-review identities remain
separately auditable for admin acceptance. Their review state does not mean
that the JAMB identity lacks a learning resource, and a missing CCMAS anchor
does not make a JAMB identity unavailable.

### 2. JAMB downstream mapping review — 86 identities, internal

The 86 identities previously marked `external_domain_provenance_required`
remain an internal mapping/evidence review queue. The ledger preserves 711
affected JAMB/domain link occurrences and 559 component/domain pairs. This is
separate from completed resource enrichment: it governs whether a specific
programme-to-domain relationship may be promoted to the student route, not
whether the JAMB programme exists or has an external learning resource.
The 11 anchor-absent occurrences are optional complements and are not blockers
or automatic `unavailable` states.

### 3. Missing role work profiles — 119/119 still absent

The canonical role baseline is 5,209 merged roles, of which 5,090 have a
work-profile row and 119 do not. The completed bounded tranche ledgers audited
the entire missing-profile queue against the available authoritative extracts,
but:

- generated profile rows added: 0;
- source-backed full work-profile candidates: 0;
- genuinely unavailable: 0;
- profile rows still absent: 119;
- the audited evidence remains `review_required`/bounded-local-only.

ESCO identity/definition/skill evidence is not an O*NET-style work profile and
does not establish Nigerian demand, local requirements or student preparation.
No profile may be inferred or emitted from that evidence. The 119 therefore
remain explicitly absent/review-only, but **they are not a scaling blocker**:
the evidence question was completed and the confirmed decision is to keep them
out of student guidance until stronger criteria-satisfying evidence appears.

### 4. Relationships — tracked, but excluded from the blocking gate

The canonical contextual catalogue contains 2,305 `not_established` relationship
rows and 405,858 source-backed rows. The append-only external-enrichment
reconciliation covers all 2,305 canonical unresolved IDs (`remaining: 0`), but
all 2,353 appended relationship-ledger rows remain `review_required`; coverage
does not equal approval or promotion. Per the current goal decision, these rows
are not a scaling blocker: they remain internal audit coverage and are excluded
from student requirements and recommendations.

The all-programme route projection reports 21,235 unresolved relationship
endpoint occurrences. This is the fan-out of unresolved canonical relationships
through programme contexts, not 21,235 additional canonical relationship IDs.
The canonical unresolved count remains **2,305**, but it is excluded from the
current blocker count.

The separate programme-level queue is also open: 26 `review_required` and 211
`not_established` programme relationship states. Neither state is student-safe.

### 5. Item link and external-enrichment states

The canonical item-link audit is structurally complete:

| Canonical item state | Rows | Student meaning |
| --- | ---: | --- |
| `linked` | 5,253 | item-specific destination with retained evidence; not live URL proof |
| `no_link` | 116,116 | explicit honest unavailable state; not evidence that no broader resource exists |
| `review_required` | 8 | staff review only; blocked from student evidence |
| missing/invalid link state | 0 | no local contract defect |

The broader append-only external-enrichment ledger is a separate queue, not a
replacement canonical catalogue: 9,758 distinct typed items, 9,668 flagged
remediation keys, 7,313 processed flagged keys and 2,355 remaining flagged
keys. Its decision counts are 9,642 `review_required`, 43 promoted and 8
`linked`; these do not promote or rewrite the canonical catalogue.

## Student and admin exposure

### Student surface

Student exposure is **not approved**. The local contract confirms the intended
fail-closed boundary: 0 student-visible review-only rows, 0 direct URL opens
outside `ExternalLinkGuard`, 0 missing item link-state rows, 0 ownership
mismatches and 0 missing source locators. `linked` rows are not live reachability
proof; `no_link` rows may only represent an explicit unavailable state; review-
required items and unresolved relationships remain excluded.

The route audit's machine-readable JSON records all static student checks as
passing, but its Markdown summary says “Static student route/loader/link-boundary
checks: FAIL”. This is an unresolved evidence-file inconsistency. It does not
authorize exposure, and browser proof remains absent.

The route audit was refreshed after this older checkpoint text was written;
the current machine-readable and Markdown outputs agree that static
route/loader/link-boundary checks pass. The 83 missing identity/offering states
belong to CCMAS-only supporting packages and are explicit admin findings; the
student-facing 420-identity JAMB reachability gate passes.

### Admin surface

The local accepted/internal partition passes structurally, but accepted rows are
still **0**. All 529,540 canonical item/relationship rows remain internal:

- 121,377 item rows: 5,253 awaiting explicit approval, 116,116 `no_link`, 8
  `review_required`;
- 408,163 relationship rows: 405,858 source-backed and 2,305
  `not_established`; all remain internal/non-student-facing audit state and
  are excluded from the current blocker count;
- 237 programme resource/admin review packages remain pending;
- 86 JAMB identities remain review-required;
- full rendered admin acceptance is not claimed.

The local admin boundary is therefore safe for queue inspection, not acceptance
or student promotion. Live dashboard payload proof, browser render proof and
manual SQL deployment/post-apply verification remain outside this artifact.

## Reconciliation decision

**Local reconciliation: complete; approval: blocked.** The corrected resource
ledger is complete for all 420 JAMB identities. Remaining non-SQL/non-browser
work is the internal downstream mapping review queue (86 identities), 2,355
remaining broad item-remediation keys, 237 pending programme admin render
acceptances, and the 83 explicit CCMAS-only supporting-package identity/
offering findings. The 119 absent role profiles are closed as a non-blocking
evidence decision, and the 2,305 unresolved relationships are tracked but
explicitly excluded from this blocker list.

No evidence was invented, no sample search was repeated, and no blocker was
silently converted into a student-facing claim.

## Evidence files

- `data/career-mapping/_audit/programme_jamb_resource_evidence_2026-09-23_manifest.json`
- `data/career-mapping/_audit/programme_jamb_resource_evidence_2026-09-23_report.md`
- `data/career-mapping/_audit/programme_jamb_resource_evidence_2026-09-23_corrected_004_manifest.json`
- `data/career-mapping/_audit/programme_jamb_resource_evidence_2026-09-23_corrected_004_report.md`
- `data/career-mapping/_audit/PROGRAMME_JAMB_RESOURCE_EVIDENCE_KEY_REPAIR_2026-09-23.json`
- `data/career-mapping/_audit/PROGRAMME_JAMB_RESOURCE_EVIDENCE_KEY_REPAIR_2026-09-23.md`
- `data/career-mapping/_audit/PROGRAMME_JAMB_RESOURCE_EVIDENCE_SOURCE_REMEDIATION_2026-09-23.json`
- `data/career-mapping/_audit/PROGRAMME_JAMB_RESOURCE_EVIDENCE_SOURCE_REMEDIATION_2026-09-23.md`
- `data/career-mapping/_audit/external_enrichment_agent/role_work_profile_checkpoint_2026-09-20.json`
- `data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_006_2026-09-21.json`
- `data/career-mapping/_audit/RELATIONSHIP_RESOURCE_BACKLOG_AUDIT_2026-09-19.json`
- `data/career-mapping/_audit/CONTEXTUAL_ITEM_LINK_STATE_AUDIT_2026-09-19.json`
- `data/career-mapping/_audit/external_enrichment_agent/CURRENT_EXTERNAL_ENRICHMENT_RECONCILIATION_2026-09-23.json`
- `data/career-mapping/_audit/ALL_PROGRAMME_STUDENT_ROUTE_CONTRACT_AUDIT_2026-09-23.json`
- `data/career-mapping/_audit/ALL_PROGRAMME_STUDENT_ROUTE_CONTRACT_AUDIT_2026-09-23.md`
- `data/career-mapping/_audit/ADMIN_ACCEPTANCE_SCALE_AUDIT_2026-09-23.json`
- `data/career-mapping/_audit/ADMIN_ACCEPTANCE_SCALE_AUDIT_2026-09-23.md`
- `data/career-mapping/_audit/full_population_downstream_checkpoint_2026-09-21.md`
- `data/career-mapping/_audit/full_population_downstream_admin_audit_2026-09-21.md`
- `data/career-mapping/_audit/REMAINING_BLOCKERS_POLICY_CORRECTION_2026-09-23.json`
- `data/career-mapping/_audit/REMAINING_BLOCKERS_POLICY_CORRECTION_2026-09-23.md`

## Append-only verification checkpoint 001

Recorded 2026-09-23. Read-only reconciliation checks completed:

- programme resource ledger: **237/237** rows present; all remain
  `review_required`;
- JAMB review ledger: **86/86** rows present; all remain `review_required`;
- missing work-profile baseline: **119** absent rows; tranche ledger reports
  **0** remaining unaudited queue positions and **0** generated profile rows;
- canonical unresolved relationship IDs: **2,305**; external ledger coverage
  **2,305/2,305**, with no promotion; excluded from the current blocker gate;
- canonical item link states: **121,377/121,377** explicit; linked **5,253**,
  no-link **116,116**, review-required **8**;
- accepted admin rows: **0**; internal item/relationship rows: **529,540**;
- student exposure approval: **false**; browser proof: **not run**; SQL
  applied: **false**.

This checkpoint adds no new evidence and makes no data or implementation
change. The report remains blocked for approval until the review queues,
admin-render acceptance, live deployment verification and browser proof are
resolved by their respective owners.

## Append-only correction checkpoint 002

Recorded after the corrected all-JAMB resource pass. The authoritative
correction checks report **420 unique JAMB rows**, **11 anchor-absent rows**,
**420 available resource packages**, **0 review-required resource packages**,
and **0 genuinely unavailable rows**. The all-programme route regression test
passes 5/5 after classifying the 83 CCMAS-only packages as explicit supporting
findings rather than student JAMB blockers. SQL, live payload verification and
browser proof remain intentionally deferred.

## Append-only correction checkpoint 003

Recorded after role-profile tranches 009–011 were completed. The full 119-row
missing-profile queue was audited against the available authoritative
identity/profile extracts. No candidate met the complete promotion criteria,
so **0 rows were promoted** and **119 remain explicitly absent/review-only**.
This is a deliberate non-blocking closure decision, not an unresolved scaling
gate. Role details must remain hidden from student guidance until stronger
criteria-satisfying evidence appears.
