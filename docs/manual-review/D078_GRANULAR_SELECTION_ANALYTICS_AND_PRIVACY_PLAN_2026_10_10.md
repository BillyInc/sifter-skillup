# D078 granular learning-selection analytics and privacy plan

Status: historical planning note. Its sequencing is superseded by the
implementation and metric contract in
`docs/manual-review/LEARNING_INTEREST_ANALYTICS_DESIGN_AND_METRIC_DICTIONARY_2026-10-27.md`.
The dashboard work is now implemented locally; database deployment and live
verification remain separate gates. This document must not be used to reopen
the already-decided data model or to impose a small-cell suppression rule.

## Product decision

The learner's granular choices are useful service data. If a learner selects
Python rather than Node.js for a backend-development route, the system should
be able to:

1. save that choice to the learner's plan;
2. reopen, edit, remove and print it without changing canonical curriculum or
   career data;
3. classify it by the stable item, item type, use case, programme, domain,
   area of specialization, role route and learner stage; and
4. produce privacy-safe aggregate demand intelligence for authorised
   educators, curriculum planners and public-interest partners.

The product must never turn a selection into a claim that the learner knows,
has completed or is qualified in the selected item. A selection means only:
**“include this in my learning focus.”**

## What exists now

The guided screen currently persists the learner's focused items in the
account-scoped guidance path:

- `learningFocus` stores the stable item/context identity and display name;
- `learningPlanSnapshot` stores route-separated selected IDs and deterministic
  order;
- `learningPlanRemovedIds` records personal removals so a reopen cannot
  silently re-add an item;
- the route model retains item type, layer, category, prerequisites,
  alternatives, complements and source-backed relationships.

This is sufficient to preserve the learner's plan. It is not yet the
cross-user demand analytics service and must not be described as one.

## Required analytics contract after D078

### Current learner intent record

Create an account-scoped intent record keyed by:

`learner_id + route_key + item_id`

It should contain:

- `item_id`, canonical item version and item type;
- learner-facing item/use-case label, resolved from canonical data rather than
  trusted from a client payload;
- `context_level` and stable context keys for programme, domain, area and role;
- route key and route version;
- state: `selected`, `removed`, or `superseded`; no `completed` state is inferred;
- learner stage (`ss1`, `ss2`, `ss3`, `jamb`, `undergraduate`, or another
  explicitly supported value), stream where relevant, and coarse location only
  where the learner has supplied it and the purpose permits it;
- `selected_at`, `updated_at`, and taxonomy/data version;
- consent and processing-purpose version used for the record.

The server must resolve item category and route ownership from reviewed
canonical records. It must not accept a learner-supplied category as evidence
that an item is a shared foundation, useful edge, area addition or role
addition.

### Aggregate demand record

Provide an authorised aggregate query/report grouped by a declared:

- period and denominator/cohort;
- item and item type;
- use-case group;
- programme, domain, area and role route where selected;
- learner stage and permitted broad context.

Every number must state its denominator, time window, population scope,
selection definition and whether it counts unique learners or selections. For
example, a valid statement is:

> “Among 1,240 consenting SS1–SS3 learners in Lagos who saved a D078 route
> between 1 January and 31 March 2027, 868 (70.0%) selected Python for a
> backend-development learning focus.”

The system must not produce “70% of students want Python” without those
qualifiers. A learner who selects several routes may count once per item in an
item-demand report, but the report must disclose that multi-selection rule.

## Access and privacy guardrails

- Saving a personal plan is part of the requested service and is separate from
  optional analytics consent.
- Cross-user analytics is opt-in where consent is the chosen basis; a learner
  may withdraw it without losing the saved plan.
- School administrators may see individual plans only for learners and
  purposes their authorised role and consent state allow.
- External or ministry/public-interest exports contain aggregate results only;
  they must not contain names, emails, student IDs, raw route snapshots or
  free-text notes.
- **Current product decision: do not suppress small groups** in the authorised
  internal product-team and verified institution-owner dashboards. Exact small
  counts are useful for planning, including in small cohorts. Keep these views
  aggregate-only, expose no direct identifiers or individual histories, and
  show the disclosure that a small cohort count may be inferable to someone who
  already knows the cohort. Do not silently reintroduce a minimum-cell rule.
- This decision does not create a public or ministry export. Any future
  external sharing is a separate product, legal-purpose, recipient-access and
  data-sharing approval; it is not implemented by the current dashboard or its
  CSV. Do not promise external access or reuse the old suppression thresholds
  as if they were approved policy.
- Keep the account-linked intent table separate from aggregate reporting views,
  use row-level access controls, log administrator exports, and delete or
  anonymise account-linked records when the learner's lawful deletion request
  is completed. Aggregates must be recomputable and must not defeat deletion
  through unsuppressed historical snapshots.
- Do not sell individual learning-interest profiles. Any public-interest data
  sharing needs a documented purpose, recipient authorization, data-sharing
  terms, retention period and review by the responsible privacy/legal owner.

## API/data shape to implement later

The subsequent analytics implementation added an append-safe event store, a
consent-gated current-selection snapshot, and aggregate read surfaces. The
implemented contract and exact migration order are documented in the metric
dictionary and `backend/MIGRATION_RUNBOOK.md`; the following names describe
the earlier proposal, not the current endpoints:

- `PUT /api/student/learning-intents` — replace the learner's current intent
  set for a versioned saved plan;
- `GET /api/admin/learning-interest/summary` — role-checked, suppressed,
  aggregate-only summary;
- an internal export job that records purpose, requester, filters, suppression
  policy and output version.

The write endpoint must be idempotent, server-categorized, consent-aware and
safe to call after every save/reopen/edit. It should not mutate the canonical
learning graph. The summary endpoint must reject raw learner IDs and enforce
the same route/evidence version used by the saved plan.

## D078 sequencing

Do not build the analytics dashboard before the current D078 work is complete.
The order is:

1. finish and verify programme → domain → area → role route hydration;
2. verify granular selection, prerequisite/alternative guards, multi-route
   stacking, save/reopen/edit and report/print/share behavior;
3. confirm that the backend preserves selected and removed item identities;
4. add the intent migration, consent-aware write path and protected aggregate
   views;
5. test unique-learner counts, multi-selection rules, exact small-cohort
   counts, deletion,
   school authorization and minor safeguards with synthetic fixtures;
6. only then expose educator/admin demand summaries or prepare any external
   public-interest export.

This workstream is downstream analytics and privacy engineering. It does not
reopen D078 role-fit adjudication or change which roles belong to the domain.

## Source and policy basis

The legal copy is aligned to the project's Nigeria-first privacy posture and
should be reviewed against the current Nigeria Data Protection Commission
materials before production release. The current reference points are the
[NDP Act 2023 resource](https://ndpc.gov.ng/download/nigeria-data-protection-act-2023),
the [NDPC privacy policy](https://ndpc.gov.ng/our-data-privacy-policy/) and the
[NDPC FAQ on consent and processing](https://ndpc.gov.ng/faqs/). The
implementation must preserve clear choice, purpose limitation, minimisation,
access control, deletion and explanation rather than relying on a generic
“analytics” label.
