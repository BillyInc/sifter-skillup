# Entrepreneurship Build: Final Integrated Vision and Implementation Blueprint

Date: 2026-10-10

Status: final synthesis for implementation planning.

This document reconciles:

- docs/ENTREPRENEUERSHIP RAW.MD
- docs/entrepreneurship.md
- docs/BUILD_PLAN.md

It does not modify those source documents, D078 files, or application code.

## 1. Product decision

Build the entrepreneurship feature as a domain-grounded opportunity engine.
It is not a generic business-idea generator, a second employment-role
catalogue, a prediction machine, or a promise of business success.

Its promise is:

> Show what people have built with knowledge from a domain, what is forming,
> what conditions indicate an opening, what may transfer to Nigeria, and what
> the learner would need to learn, validate, partner for, or prove before
> attempting a build.

The refined entrepreneurship document supplies the controlling architecture:

1. Documented archetypes: real and still-relevant value-creation patterns.
2. Emerging archetypes: current patterns with incomplete but repeated evidence.
3. Innovation signals: conditions, gaps and shifts, not businesses.

The raw discussion adds essential product depth:

- incumbent and conglomerate analysis;
- entry strategies;
- cross-domain and partnership requirements;
- global archetypes with country overlays;
- task, skill, knowledge, method, tool and complement relationships;
- personalised gap and adaptation paths;
- failure patterns;
- 90-day validation scaffolding;
- institutional and government intelligence;
- evidence-backed ranking, freshness and uncertainty;
- realistic monetisation and phased delivery.

The final build uses the three refined layers, adds the HOW dimension, and
adds a governed evidence-and-action layer.

## 2. Reality boundary

The product may show a documented business or service pattern, a sourced
example, a domain relationship, evidence that an archetype exists in a
country, a bounded failure to find it, a plausible adaptation route, tasks,
capabilities, partners, public registration information, funding routes and
regulatory information.

It must not claim:

- guaranteed success, profitability or funding;
- that a programme caused or uniquely qualifies someone to build a venture;
- that an archetype is absent from a country merely because a search found none;
- that viewing, selecting or completing a learning item proves competence;
- that a degree, role or tool alone is a business opportunity;
- that a speculative signal is a market fact;
- that a funding or regulatory link guarantees eligibility;
- that a Sifter badge is professionally recognised without an authorised issuer.

Use the wording:

> No qualifying instance was identified in the reviewed sources and search
> scope as of the access date.

Do not use:

> No such business exists in Nigeria.

Every market, demand, funding, regulation, absence and pricing claim needs
source, locator, access date, geography, scope and confidence.

## 3. The three product layers

### 3.1 Documented archetypes

An archetype is a reusable business, service, process, knowledge product,
platform, delivery model, social enterprise or other value-creation pattern
with evidence of real operation.

Conglomerates are evidence sources and incumbent landscapes, not single
archetypes. Extract distinct service lines or business models only when they
can stand as meaningful patterns. Show what incumbents provide, where they are
strong, what customer or geographic segments they miss, and where unbundling,
specialisation, frugal delivery or local adaptation may be possible.

Documented does not mean universally successful. The record needs status,
evidence quality, current viability and limits.

### 3.2 Emerging archetypes

An emerging archetype needs more than a speculative idea. Require repeated
instances, credible early traction, current capital or accelerator attention,
user activity, or another documented threshold.

Use formation stages:

- PROTO: early evidence with limited independent confirmation;
- FORMING: repeated instances or stronger activity;
- CONSOLIDATING: a recognisable pattern with increasing adoption.

Emerging records must never look as certain as documented records.

### 3.3 Innovation signals

A signal is a condition, gap, shift, research result, policy change,
technology convergence, cultural movement or workflow failure. It is not a
business.

Every signal should say what was observed, who is affected, where and when it
was observed, why it may matter, what is unknown and what could be tested.
The Four Innovation Questions are reflection prompts, not verification.

## 4. Dimensions across the layers

The three layers are combined with:

1. Scale: MICRO, SMALL, SCALABLE, CREATOR.
2. Innovation type: the refined taxonomy used as historical or prospective
   value-creation context.
3. Entry strategy: how a learner approaches the space.
4. Domain architecture: what knowledge configuration the build requires.

Scale is not a revenue promise. Innovation type is not an entry strategy.

### Entry strategies

1. Replicate and compete: provide a known offer and win on execution, price,
   speed, trust, location or quality.
2. Replicate and adapt: move a proven pattern to a new geography, segment,
   language, price point or operating context.
3. Replicate and improve: fix a documented weakness in an existing pattern.
4. Aggregate: combine archetypes into one coherent offer.
5. Decompose: turn a valuable component of a broad model into a focused offer.
6. Cross-domain hybrid: combine domains to create a differentiated capability.

Show only strategies supported by the archetype evidence.

### Domain architecture

- SOLO_SINGLE_DOMAIN: the basic version can be built with one domain.
- SOLO_CROSS_DOMAIN_ACQUIRABLE: extra working knowledge can be learned without
  a second professional qualification.
- PARTNERSHIP_REQUIRED: deep capability in more than one domain is needed.
- ECOSYSTEM_PLAY: several capabilities, capital, regulated actors or
  infrastructure are needed.

Partnership required is not a learner deficiency. It is a build-configuration
fact.

## 5. Data model

The data must be typed, versioned and source-linked. A single untyped JSON blob
will not support trustworthy filtering, comparison, refresh or administration.

### Core records

Domains: canonical name, scope, boundaries, global context, Nigeria context,
source references, status and version.

Archetypes: name, student title, layer, maturity, description, output form,
scale, innovation types, entry strategies, domain architecture, viability
statement, limitations, editorial status and review date.

Archetype-domain links: relationship, basis, rationale, scope, exclusions,
confidence and evidence. Never infer the link from a similar name alone.

Archetype evidence: source type, title, publisher, URL, locator, publication
date, access date, geography, claim supported, quality, identity status,
freshness and evidence summary.

Country overlays: existence status, search scope, demand, competition, capital,
regulation, infrastructure, trust or culture, local cost, barriers, adaptation
opportunities, sources and review date.

Adaptation routes: source archetype, source country, target country, target
segment, adaptation type, what changes, what remains, capabilities, partners,
constraints, evidence of need and confidence.

### Tasks and capability graph

The index must answer not only what exists, but what a learner would do.

Archetype tasks need task name, plain-language explanation, type, route scope,
required or useful status, output, evidence and limitations.

Capability items include skills, knowledge, methods, tools, competencies,
certifications and partner capabilities. Each item needs:

- plain-language definition;
- meaning in the selected domain;
- meaning for the selected programme where relevant;
- task or output supported;
- prerequisites;
- complements;
- valid alternatives;
- limitations and what it cannot prove or replace;
- evidence;
- context-specific learning links.

Edges include requires, useful, complements, alternative, enables, validates
and cannot_replace. A tool such as Python must be connected to a task and
output, not displayed because it is fashionable.

Learning resources need title, provider, type, URL, price, context specificity,
level, what it teaches, what it does not teach, access date and verification.
Prefer Python for a relevant research, analysis or operations task over generic
Python links when that is what the route requires.

Signals need type, statement, affected group, geography, time window, evidence,
unknowns, candidate responses, lifecycle status, confidence and sources.

Failure patterns need observed pattern, warning signs, mitigation, scope and
sources. They are learning material, not a prediction of failure.

User and institution records must keep selections, route version, source
snapshot, warnings, consent and exports separate from canonical evidence.

## 6. Evidence and quality states

Separate:

1. Source fact.
2. Derived editorial classification.
3. Learner hypothesis.
4. Platform recommendation.
5. Unknown.

Use explicit states:

- verified
- supported
- conditional
- not_found_in_scope
- review_required
- stale
- disputed
- hidden

Review-required is an internal quality state, not a student-facing opportunity
category. Hide it from ordinary discovery until resolved or show it only as an
explicit non-recommendation research lead.

## 7. Data sourcing strategy: global, representative and Nigerian

The raw discussion is right to use major economies, but “capture everything
from every country” is not a realistic first build. Use one global index with
country overlays and an explicit coverage strategy.

### 7.1 Country selection model

Start with countries that contribute distinct evidence density or business
patterns, not merely countries with the highest GDP.

Representative starting set:

- North America: United States, Canada.
- Europe: Germany, United Kingdom, France, Italy, Netherlands, Switzerland,
  Spain, Sweden.
- Asia: China, Japan, South Korea, Taiwan, India, Singapore.
- Oceania: Australia, New Zealand.
- South America: Brazil, Argentina, Chile.
- Africa: Nigeria, South Africa, Kenya, Egypt.
- Middle East: Israel, United Arab Emirates, Saudi Arabia.

This is a research priority set, not a claim that other countries are
unimportant. Add countries when they contribute a distinct pattern, reliable
sources or a user-relevant market.

### 7.2 Source tiers by claim

Tier 1: official registries, regulators, national statistics, international
statistical bodies, official company reports, official accelerator or funding
portals, academic publications and recognised professional bodies.

Tier 2: established company pages, credible industry research, investor
reports, accelerator portfolios, reputable business databases and trade
associations.

Tier 3: reputable journalism, expert interviews and well-documented case
studies.

Tier 4: directories, social posts, idea lists and unsourced commentary. Tier 4
may discover candidates but cannot alone approve a student-facing claim.

### 7.3 Acquisition pipeline

1. Define the claim before searching.
2. Search country and domain sources using a source plan.
3. Resolve organisation, archetype and source identity.
4. Capture the exact locator and relevant passage or data field.
5. Record geography, date and search scope.
6. Triangulate important claims with an independent source.
7. Classify the record and state why.
8. Record contradictory evidence.
9. Assign refresh cadence and owner.
10. Approve only after the quality gate.

Do not scrape indiscriminately. Respect terms, rate limits, licences, robots
rules and copyright. Store a citation and a short factual summary rather than
copying entire sources.

### 7.4 Sourcing by layer

Documented:

- classification systems such as NAICS, ISIC or national equivalents for
  sector structure;
- official company or business registries for existence where searchable;
- company reports and first-party service descriptions;
- professional bodies and academic sources for practice patterns;
- credible business databases for cross-checking, not as sole proof.

Emerging:

- accelerator portfolios;
- investment theses and disclosed funding;
- company formation and product launch evidence;
- patents, research-to-product evidence and adoption data;
- job, contract or customer evidence where lawfully accessible.

Signals:

- national statistics;
- World Bank, ILO, UN and development datasets;
- regulatory changes;
- research publication velocity;
- behavioural, search or demand indicators with methodology;
- professional and industry reports.

### 7.5 Historical depth

Document older archetypes when they remain commercially viable today. Do not
turn the index into a museum. Emerging records should usually focus on the
latest three to five years. Signals should be current and time-bounded.

The rule is not “how old is it?” but “is this still a live pattern someone
could build today, and can we verify it?”

### 7.6 Nigeria overlay

Nigeria is the initial user context, not a reason to delete global evidence.
Add Nigerian sources when they change regulation, cost, demand, infrastructure,
trust, competition, funding or adaptation.

If no Nigerian source is relevant or available, retain the global record and
state that local viability requires testing. Do not treat missing Nigerian
evidence as a blocker for a strictly global pattern.

Useful official anchors include:

- NUC CCMAS: https://www.nuc.edu.ng/ccmas/
- CAC: https://www.cac.gov.ng/
- CAC business-name service: https://www.cac.gov.ng/services/business-name
- CAC registration portal: https://icrp.cac.gov.ng/
- BOI MSME support: https://www.boi.ng/who-we-serve/msmes/
- BOI programmes: https://iprogrammes.boi.ng/
- NDPC NDP Act: https://www.ndpc.gov.ng/ndp-act-2023/

NUC can support programme and discipline context; it does not prove that a
business is taught, profitable or locally viable. CAC can support registration
claims; registry data does not equal total market existence. BOI can support
funding-route information; it does not guarantee eligibility or award. NDPC
requirements constrain learner, cohort and behavioural data.

### 7.7 Completeness without pretending to be exhaustive

Use coverage metrics:

- domains covered;
- countries covered;
- source classes represented;
- archetypes with Tier 1 or Tier 2 evidence;
- records with independent corroboration;
- records with current country overlays;
- stale or disputed records;
- unreviewed candidate backlog.

Report coverage by scope. “We reviewed 14 countries across 20 domains” is
truthful. “We captured everything that exists” is not.

## 8. Personalisation and user flow

The experience should progress:

1. Programme or domain selection.
2. Domain and cross-domain map.
3. Documented and emerging archetypes.
4. Signals.
5. Entry strategy and domain architecture.
6. Country, geography and target segment.
7. User constraints: time, money, risk and solo/team preference.
8. Task and capability map.
9. Saved route and builder brief.

The result should say:

> Given your selected domain, route, constraints and evidence, these are the
> options, requirements, uncertainties and next tests.

Do not say “you should start this business”.

Ranking may consider knowledge match, local evidence, demand, capital fit,
regulatory burden, infrastructure, time to first test, partnership burden and
evidence confidence. Scores must be decomposable so the user can see what
changed the result.

### Archetype card

Show name, explanation, layer, evidence state, scale, entry strategies, domain
architecture, local status, capital and regulatory flags, confidence, review
date and source button.

Expanded content:

- origin and creation pattern;
- original problem;
- current offer;
- incumbent landscape;
- local status;
- adaptation route;
- tasks and outputs;
- capabilities, prerequisites, complements and alternatives;
- limitations;
- context-specific learning links;
- 30/60/90-day validation route.

### Signal card

Label it as a condition or signal. Show evidence, date, affected group,
uncertainty and test questions. “Turn into a hypothesis” creates a private
user item and never promotes it automatically to an archetype.

### Save, compare and report

Users can save multiple domains, archetypes, routes, signals and capability
items. Reports preserve facts, recommendations, user hypotheses and unknowns
separately. Comparison uses evidence strength, local status, capital,
regulation, task burden, partnership need, time to test and learning
requirements. Missing evidence must not silently become a low score.

The first output is a builder brief, not a certificate:

- selected route;
- why it relates to the domain;
- what is documented;
- what is uncertain;
- target user and problem;
- evidence to collect;
- tasks and outputs;
- capabilities and partners;
- compliance checks;
- first tests;
- stop, pivot or continue criteria.

## 9. Admin and institutional product

Universities and business schools may use the feature for domain-grounded
entrepreneurship teaching, case assignments, cross-faculty exploration,
incubator preparation, cohort reporting and curriculum feedback.

Accelerators may use builder briefs, capability readiness, evidence gaps and
team requirements. Do not call a learner investment-ready without a separate
assessment.

Government dashboards are a later aggregate product. They may show anonymised
exploration, capability demand, domain interest and support discovery. They
must not expose identifiable behaviour, infer national statistics from clicks
or reveal small-cohort identities.

## 10. Monetisation hypotheses

The raw pricing ranges are hypotheses, not market facts. Test:

1. Free discovery.
2. Single-domain or report unlock.
3. Student annual plan.
4. Institutional cohort licence.
5. Paid validation and action workspace.
6. Later expert, accelerator or ecosystem packages.

Do not lead with a credential. A credential requires assessment, identity,
moderation, appeals, issuer governance and recognition. Measure conversion,
useful-output completion, return use, export, recommendation and renewal.

## 11. Operations and governance

Workflow:

1. Candidate discovery.
2. Identity resolution.
3. Source capture.
4. Claim extraction.
5. Domain and archetype classification.
6. Country overlay.
7. Task and capability mapping.
8. Negative and neighbouring-category checks.
9. Freshness review.
10. Student-display approval.
11. Versioned publication.

AI can assist discovery and drafting but cannot silently make final evidence,
legal, regulatory, safety or absence decisions.

Refresh:

- funding and regulatory claims: before display and at least quarterly while
  active;
- emerging archetypes: quarterly or after a material event;
- signals: monthly or quarterly according to volatility;
- documented archetypes: annual review or sooner when status changes;
- learning links: periodic link and content-scope checks.

Maintain provenance, corrections, disputes, retention, deletion and access
logs. Separate canonical evidence from learner selections and generated reports.

## 12. Phased implementation

### Phase 0: evidence and contract

Freeze schema, source states, claim contract, country model, privacy rules and
editorial gate.

Acceptance: no visible record lacks identity, source, geography, status and
freshness.

### Phase 1: Nigeria-first documented MVP

Use five to ten domains, documented archetypes, global parent records, Nigeria
overlays, incumbent context, entry strategy, domain architecture, task graph,
source inspection, comparison, save and report.

Acceptance: every card has inspectable evidence and an honest limitation.

### Phase 2: personalised action

Add constraints, capability gaps, partners, failure warnings, learning links
and 30/60/90-day validation routes.

Acceptance: the output is actionable without pretending to predict success.

### Phase 3: emerging and signals

Add formation stage, signal lifecycle, multi-source triangulation, hypothesis
workspace, watchlists and alerts.

Acceptance: documented, emerging and signal content cannot be confused.

### Phase 4: institutional product

Add cohorts, mentors, aggregate reports, consent, retention and exports.

Acceptance: small groups cannot be re-identified.

### Phase 5: selected international expansion

Add representative economies by source quality and distinct pattern, then
expand only when maintenance capacity exists.

Acceptance: every new country has a source bundle, search scope, refresh owner
and local-viability method.

## 13. Acceptance criteria

Evidence:

- visible archetypes have source identity, URL, locator, date and claim;
- absence is always bounded by search scope;
- numerical claims are dated and sourced;
- global content remains valid when Nigerian context is irrelevant;
- local evidence is added when it materially changes the route.

Classification:

- layer, maturity, scale, innovation type, entry strategy and domain
  architecture are separate;
- signals are not businesses;
- conglomerates are incumbent evidence, not one undifferentiated archetype;
- partnership requirements are not framed as individual learner failure.

Actionability:

- every visible archetype has tasks, outputs, requirements and limits;
- capability items have plain-language context;
- prerequisites, complements and alternatives are explicit;
- resources are task-specific where possible;
- the route produces tests and artefacts, not guarantees.

UX:

- evidence status survives filtering and comparison;
- multiple routes can be saved;
- reports separate facts, recommendations, hypotheses and unknowns;
- user, admin, mentor and government permissions differ;
- sharing hides private constraints by default.

## 14. Raw-to-refined traceability

| Raw requirement | Raw location | Refined treatment | Final implementation decision |
|---|---:|---|---|
| Conglomerates and incumbent gaps | 1-62 | Documented archetypes and gap layer | Keep as extracted service lines plus incumbent context |
| Proven models first | 64-124 | Three-layer ranking | Keep as evidence threshold and ranking rule |
| Business schools and universities | 127-174 | Institutional product | Keep; pilot after user-value evidence |
| Product differentiation | 176-228 | Domain opportunity engine | Keep; date competitive claims |
| Nigerian pricing | 229-256, 357-424 | Monetisation direction | Test, do not treat as fact |
| Domain-only engine | 257-301 | Refined core product | Keep, with programme mapping as optional personalisation |
| Gap reports, risk flags, 90-day paths | 428-468 | Personal action layer | Keep with decomposable evidence |
| Builder matching and alerts | 450-457 | Later collaboration and watchlists | Keep opt-in and privacy-safe |
| Failure library | 459-461 | Governance and learning | Later evidence-backed layer |
| Creation/localisation brief | 538-640 | Archetype detail | Required for visible records |
| Products, processes, services and other forms | 644-700 | Output-form field | Keep; do not collapse to apps |
| Historical depth | 702-718 | Maturity and freshness | Keep viability-now rule |
| Country indexing | 720-754 | Global parent plus overlay | Keep bounded absence state |
| Trend detection | 754-816 | Emerging and signal workflow | Keep as research, not prediction |
| Creation taxonomy | 819-857 | Innovation dimension | Keep separate from entry strategy |
| Entry strategies | 868-919 | HOW dimension | Keep with strategy-specific requirements |
| Economic-giant and country research | 920-951 | Adaptation routes | Keep source-country and target-country evidence |
| Data accuracy | 952-972 | Evidence operations | Mandatory identity, scope, date and confidence |
| Personal ranking and gap map | 973-987, 1030-1043 | User route | Keep; show assumptions |
| Data acquisition | 988-1000, 1057-1078 | Sourcing pipeline | Implement source tiers and coverage metrics |
| Student experience | 1085-1110 | UX flow | Implement card, compare, save and builder brief |
| Cross-domain and partnership needs | Refined 1217-1314 | Domain architecture | Keep as configuration, not deficiency |
| Three sections | Refined 1334-1432 | Main experience | Keep documented, emerging and signals |
| Market intelligence | Refined 1900-2026 | Market panels | Add only when update ownership exists |
| Tasks and complements | Raw discussion and refined skills sections | Capability graph | Add explicitly |
| Admin and government | Refined 2831 onward | Institutional product | Later, aggregate and consented |

## 15. Corrections to unsafe claims

1. “Everything ever built” becomes “curated within a stated scope.”
2. “No platform does this” becomes “no equivalent was identified as of the
   dated review.”
3. “No Nigerian equivalent exists” becomes “not found in the reviewed scope.”
4. “Built by people with your exact knowledge” becomes “linked through domain,
   task, capability, industry or value-chain evidence.”
5. Programme coverage percentages are forbidden until denominator, curriculum,
   assumptions and calculation are inspectable.
6. “This will work” becomes “candidate route with supporting signals and risks.”
7. Credential language is reserved for a governed assessed product.
8. Precise raw percentages, company counts, trends, funding counts and market
   sizes remain unpublished until independently checked and dated.
9. Funding and regulation links are guidance, not approvals or legal advice.
10. Engagement analytics are product behaviour, not national statistics.

## 16. Final build order

1. Freeze the evidence and data contract.
2. Implement one Nigerian domain with global parent archetypes and overlays.
3. Build documented cards and source inspection.
4. Add entry strategy, domain architecture and capability graph.
5. Add comparison, save and builder-brief export.
6. Add verified Nigerian market, registration, funding and regulatory context.
7. Add constraints and decomposable ranking.
8. Add emerging archetypes and signals.
9. Add validation paths and failure patterns.
10. Pilot with a university, business school or incubator.
11. Add privacy-safe aggregate administration.
12. Expand domains and countries when refresh capacity is sustainable.

The highest realistic outcome is a trusted, living map from domain knowledge to
commercial possibilities and evidence-based next tests. It does not require
perfect global coverage, an automated venture studio or guaranteed outcomes.
