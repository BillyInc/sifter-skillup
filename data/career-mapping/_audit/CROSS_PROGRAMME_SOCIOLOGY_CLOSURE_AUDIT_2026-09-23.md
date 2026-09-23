# Cross-programme Sociology closure and scaling audit — 2026-09-23

Checkpoint 1 saved after the controlling documents were read. This is a
read-only local audit of the current student/admin implementation against the
Sociology closure gates and the all-parsed-programmes scaling contract.

Scope is local checked-in source and audit artefacts only. No SQL, seed,
database, browser, URL-fetch, or implementation change is part of this audit.

## Initial status

- Population: **237 parsed CCMAS programmes** (**236 generic + Sociology**).
- JAMB boundary: **420 unique JAMB identities**.
- Programme-domain continuity: **1,344 active links**, with all 237 programmes
  mapped; the local route inventory covers **1,344 domain**, **3,580 subgroup**,
  and **46,941 role** routes across **5,668 unique contexts**.
- Local ownership/provenance gate: currently recorded as zero ownership
  mismatches, zero missing source references/locators, and zero role-aggregate
  leakage candidates.
- Scaling decision: **not approved**. The local contract still records
  **2,305 `not_established`/unresolved relationships**, **237 pending full
  programme admin renders**, **86 JAMB review-required identities**, and no
  live SQL or browser proof.

## Evidence snapshot

### Population and continuity

| Gate | Local result | Status |
| --- | ---: | --- |
| Parsed CCMAS programmes | 237 (236 generic + 1 Sociology) | Pass |
| Generic programme curriculum contracts | 236 | Pass |
| Sociology curriculum contracts | 1 | Pass |
| Unique JAMB identities | 420 / 420 | Pass |
| Active programme-domain links | 1,344 | Pass |
| Programmes with an active domain mapping | 237 / 237 | Pass |
| Programme route records | 474 (preview + overview per programme) | Pass |
| Downstream domain/subgroup/role routes | 1,344 / 3,580 / 46,941 | Pass for local continuity |
| Unique downstream contexts | 5,668 | Inventory |
| Programmes with missing downstream routes | 0 | Pass |

Relationship labels on the active programme-domain links are **1,074
functional**, **206 direct**, and **64 adjacent**. Route continuity is a
coverage result; it does not make review-only or unresolved records student
eligible.

### Curriculum

- The generic contract contains **9,823 courses**, **81,186 outcomes** and
  **81,186 student outcomes** across 236 programmes. Its audit reports zero
  missing contract summaries, zero missing curriculum locators, zero fallback
  risk and zero raw annotations in student rows.
- The Sociology contract contains **34 courses**, **243 course-outcome rows**
  and **7 separately stored programme abilities**. Its five quality gates pass:
  no student annotation leakage, no LIS exception leakage, every outcome has a
  course locator, abilities remain separate from outcomes, and role-aggregated
  rows are excluded.
- **131,178 legacy profile rows** remain retained as audit evidence across the
  237-programme boundary. The local contract reports no student fallback risk;
  the legacy rows are not a student curriculum source.

### JAMB/CCMAS coverage

The 420-row matrix has no unavailable identities and no missing component or
source references. Its coverage categories are:

| Category | Rows |
| --- | ---: |
| Partial CCMAS curriculum scope | 273 |
| Combined CCMAS curriculum | 28 |
| External sources required | 6 |
| Single CCMAS full curriculum | 113 |
| Review-required raw mapping state | 86 |

The 86 review-required identities remain an admin/source-review queue; they
are not treated as zero valid programmes and are not promoted by this audit.

### Ownership, review-only leakage, links and relationships

- Contextual catalogue: **121,377 source-backed items** across 5,668 contexts;
  **0** missing owners, owner mismatches, missing source references, missing
  source locators, invalid item-link URLs, unlabelled link states, or
  role-aggregate leakage candidates.
- Programme projection: **1,153,039 inherited catalogue rows** across all 237
  programmes; **0** programmes have a missing link state.
- Item link states: **5,253 linked**, **116,116 explicit `no_link`**, and **8
  `review_required`**. The local gate keeps all three states explicit; the
  review-required rows are not student links.
- Relationships: **408,163 total**, with **405,858 `source_backed`** and
  **2,305 `not_established`/unresolved**. The 2,305 rows are blocked from
  student exposure; no unsupported edge was promoted.
- Ownership and state controls are present in the admin evidence contract:
  review-required, no-link, not-established, audit-only, unavailable,
  identity-incomplete and provenance-incomplete records fail closed.

### Roles and student learning bounds

- **5,209 canonical roles** are represented by **46,941** reachable role routes.
- **119 roles lack work-profile rows**; **0** lack an anchor. This remains an
  admin/source-review finding, not a reason to invent role content.
- Student role learning is capped at **12 essential** and **5 optional** items;
  all student rows satisfy those caps. **3,910** raw source arrays exceed the
  cap and remain bounded source/admin evidence.

### Current student/admin implementation

The static local contract passes for programme learning summaries, friendly
connection labels, the summary helper, relationship grouping, admin provenance
queues, the student sanitised-loader/link boundary, and direct-link exclusion.
The scan found **0 direct student-career `Linking.openURL` calls** outside
`ExternalLinkGuard.tsx`.

The admin contract is locally valid but not fully accepted: **237 programme
admin renders** are still `pending_full_population_render`; the programme
resource queue has **237** review-required entries, and programme relationship
queues contain **211 not-established** plus **26 review-required** records.

## Remaining blockers / decision

Scaling remains **OPEN — not approved**.

1. Resolve or formally close the **2,305 not-established/unresolved
   relationships** with source-backed same-context evidence; until then they
   must remain staff-review evidence.
2. Complete full-population admin rendering/acceptance for **237 programmes**,
   including the 237 programme resource review entries and the relationship
   review queues.
3. Resolve the **86 JAMB review-required** identities where the current
   curriculum scope or source evidence is incomplete or ambiguous.
4. The Sociology closure gates still require the record-level content/link /
   relationship review, the report completion gate, and the presentation
   review described by the controlling documents. Local static checks do not
   prove those gates.
5. Live Supabase SQL deployment, live payload verification, URL reachability,
   and browser acceptance are **not run and not claimed**. The local student
   boundary passes, but `student_exposure_accepted`, live SQL verification,
   browser proof and URL reachability remain false.

## Verification and files changed by this audit pass

Command:

```text
python -m pytest data/career-mapping/_audit/cross_programme_sociology_closure_audit_2026-09-23.py -q
```

Result: **6 passed**. Running the test as a script also reported the exact
population, JAMB, link, role, relationship and static-boundary snapshot above.

Supporting existing local acceptance tests also passed: **20 passed** across
the scaling matrix, admin downstream boundary, programme routes, contextual
link state, role learning, JAMB/CCMAS matrix and relationship backlog tests.

The read set for this checkpoint was `AGENTS.md`, the current goal handoff,
and the four controlling documents named there: the product-wide mockup spec,
the Sociology box implementation audit, the Sociology top-down closure plan,
and the Explore entry/programme-university flow.

Only these two dated audit artefacts were added by this pass:

- `data/career-mapping/_audit/cross_programme_sociology_closure_audit_2026-09-23.py`
- `data/career-mapping/_audit/CROSS_PROGRAMME_SOCIOLOGY_CLOSURE_AUDIT_2026-09-23.md`

The worktree already contained unrelated user changes; this audit did not
modify them, any implementation file, SQL, seed transport, database, browser
state, or external-search ledger.
