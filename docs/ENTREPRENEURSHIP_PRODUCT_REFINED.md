# Sifter Entrepreneurial Opportunity Intelligence — Refined Product

Source: refined during a full audit of `docs/entrepreneurship.md` and the EPA v2 document (Codex session, 2026-07-20). This document is the corrected, full-scale product definition agreed in that session — not the MVP scope, not the raw draft.

## The product in one sentence

An **Entrepreneurial Opportunity Map** that extends Sifter's existing programme → domain → employment-role graph: after selecting the domains their programme gives them access to, a user sees the entrepreneurial roles they can independently practise, build as a firm, create as a product/IP asset, or scale as a venture — plus the domain combinations, capability and partner requirements, market context, and evidence behind each route.

The refined product is not "help users start a business." It is:

> Make entrepreneurship legible as a set of real roles and opportunity pathways available from a person's knowledge — just as employment is made legible through roles.

## What this product is not

These are explicitly excluded from the refined design:

- Builder Certification / a builder credential
- Founder validation workflows or "run the next smallest test for the user"
- Business-plan tools, templates, or pitch generators
- Investor/accelerator referrals
- Prescriptive "you should build this" recommendations
- Claims that a gap is "unbuilt," "nobody has built this," or fully resolved
- Blockchain, tokenised-IP, DAO, and quantitative-trading extensions (mentioned only as optional future extensions in EPA v2, not part of the core plan)

Sifter shows the landscape and the configuration required to enter it; users decide what to do.

## The core object: Entrepreneurial Roles, not "ideas"

The main data object is an **Entrepreneurial Role** — not an "idea" and not merely a business archetype. Examples:

- Independent social-research consultant
- Community pharmacy operator
- Pharmacy-management-software builder
- Agricultural-processing company founder
- Legal-compliance platform founder
- Curriculum / product creator
- HR services firm founder
- Labour-market intelligence company builder
- Cultural-IP licensing entrepreneur
- Financial-automation product builder

Each role must answer:

- What is built or operated?
- Which selected domain is the core advantage?
- Which additional domains strengthen it?
- What is required personally versus through a co-founder/team?
- Is it solo-viable, partner-dependent, or organisation-dependent?
- Is it an independent practice, firm, product/IP business, or scalable venture?
- What regulatory requirements apply in the user's chosen market?
- Does it exist globally, in Nigeria, or both?
- What examples and market evidence support it?
- Which adjacent domains unlock a more differentiated variant?

## Product experience

### BUILD tab and domain selection

- Add a **BUILD** tab to the programme/domain journey. Users first view their programme's mapped domains, select and rank the domains that represent their knowledge, then enter the Opportunity Map.
- Domain selection reuses the existing programme → domain graph. A programme maps to a domain as a *discovery prior* — it is not proof of competence, interest, licence eligibility, or founder fit. Capability is self-assessed separately.

### Optional six-question ranking panel

After domain selection, an optional panel asks about:

- current stage;
- preferred venture mode;
- intended market;
- existing assets/experience;
- solo, learning, partner, or team preference;
- current priority: income, ownership, impact, creative output, technology, or scale.

Rules:

- Answers **rank and explain results but never remove eligibility**.
- Every user retains a **Show all opportunities** view.
- Ranking is transparently explained; users are told the questions only prioritise opportunities and never determine capability or remove paths.

### Venture modes (the corrected "tracks")

The draft's MICRO / SMALL / SCALABLE / CREATOR tracks mixed operating size, growth potential, and business model, and CREATOR was not parallel to the others. They are replaced with four multi-select **venture modes**:

| Draft track | Refined venture mode | Meaning |
|---|---|---|
| MICRO | Independent Operator | A person sells specialised domain capability |
| SMALL | Firm / Enterprise Builder | Builds a team that delivers or operates |
| SCALABLE | Scalable Venture Builder | Repeatable model, product, network, chain, or distribution system |
| CREATOR | Product / IP Creator | Builds an asset that can be sold, licensed, subscribed to, or distributed repeatedly |

These are selectable tags, not a forced ladder and not mutually exclusive — a role can show more than one mode. Example (Pharmacy):

- Independent regulatory-affairs consultant — Independent Operator
- Community pharmacy owner — Firm / Enterprise Builder
- Medication-adherence app founder — Product/IP Creator + Scalable Venture Builder
- Pharmacy chain founder — Firm / Enterprise Builder + Scalable Venture Builder

### Opportunity lenses (the corrected "innovation types")

The "seven innovation types" were actually eight in the EPA, and they mix different things (ways of creating value, ways of capturing value, contexts, outcomes, sources of knowledge). Innovation is a combination, not a mutually exclusive category (see OECD Oslo Manual). Keep all eight but rename them **Opportunity Lenses** as multi-select tags, not "Innovation Types":

1. Technology & Automation
2. Process & Operations
3. Business Model & Distribution
4. Market & Contextual Adaptation
5. Social & Systems
6. Cultural & Creative
7. Design & Accessibility
8. Knowledge & Pedagogy

Optionally carry a `primary_lens` with rationale and confidence on top of the multi-label tags.

### Three connected content views

1. **Documented Roles** — established entrepreneurial roles with examples and evidence.
2. **Emerging Roles** — roles/patterns with credible evidence of current formation.
3. **Market Signals** — sourced conditions that explain demand, constraints, or underserved variants.

### Signals

Signals are not a disconnected third world beside archetypes, and they do not map one-to-one to roles:

- one signal can lead to many roles;
- one role can address several signals;
- a commercial response does not mean the signal is fully resolved — it may still persist in a specific geography, segment, price point, or language.

Signals appear in two places:

1. In a role card: "Market conditions this role addresses," "Why this is growing," "Constraints in Nigeria," "Unserved variants."
2. In a signal explorer: "These are the roles and opportunity variants connected to this condition."

Wording rules: never say "nobody has built this." Say "this condition remains materially underserved for [segment/location], based on reviewed evidence as of [date]." Absence from Sifter's database is not absence from the market.

### Entry modes

Keep entry modes, but attach them to roles, not raw signals:

- independent practice;
- firm building;
- contextual adaptation;
- specialisation;
- combination/bundling;
- cross-domain variant;
- product/IP asset creation;
- scalable-model building.

### Role detail page

Every role gets a detail page with: venture modes, opportunity lenses, core/supporting domains, operating capabilities, partner requirements, regulation, Nigeria/global context, entry modes, evidence, related signals, and save/compare actions.

### Cross-domain explorer

Shows:

- roles fully unlocked by the user's selected combination;
- roles strengthened by an added domain;
- roles that require a co-founder or specialist partner;
- the specific differentiated variant created by the combination.

## The four capability layers

For every entrepreneurial role, model four capability layers:

1. **Core domain** — knowledge central to the opportunity.
2. **Supporting domain** — knowledge that meaningfully improves the opportunity.
3. **Operating capability** — sales, finance, operations, product, distribution, compliance, etc.
4. **Required specialist / partner capability** — knowledge that should not be casually treated as a short course: clinical authority, production engineering, machine learning, legal practice, regulated financial expertise, etc.

This answers the user's real question: "Can I build this alone; can I learn enough to lead it; or do I need a real partner?"

## Data, schema, and content operations

Extend the existing career schema and API rather than creating a separate graph.

- Add a canonical `entrepreneurial_roles` library. Each role has a stable ID, title, plain-language description, source-backed status, and lifecycle state.
- Add role-link tables for:
  - role ↔ domain contribution: `core`, `supporting`, `differentiator`;
  - role ↔ venture mode;
  - role ↔ opportunity lens;
  - role ↔ entry mode;
  - role ↔ capability requirement: operating skill, self-acquirable knowledge, specialist partner, or regulated authority;
  - role ↔ market profile: Nigeria/global scope, maturity, capital context, regulation, and evidence;
  - role ↔ signal relationship: `origin`, `demand_driver`, `constraint`, `underserved_variant`, or `market_response`.
- Add `cross_domain_role_variants` for curated combinations where multiple domains produce a genuinely distinct entrepreneurial role or advantage. Store required domains, optional domains, user contribution, partner contribution, differentiation explanation, and evidence.
- Add a versioned entrepreneurship evidence registry. Every public claim stores source name, URL/reference, publisher, date, geography, claim type, confidence, review date, expiry/review date, and approving editor.
- Reuse the existing source-registry and market-intelligence structures where possible; add entrepreneurship-specific evidence only where role/signal relationships require it.
- Extend saved entities and user preferences to support entrepreneurial roles, role comparisons, selected entrepreneurship domains, personal ranking settings, and saved-signal subscriptions.

### Launch coverage rule (all 168 domains)

- All 168 domains launch with **verified core entrepreneurial-role coverage**: verified documented roles, at least one venture mode per role, core/supporting domain relationships, capability and partner architecture, and source evidence with editorial approval.
- Emerging roles, signals, local-market fields, capital landscape, and detailed entry-mode intelligence are published **only where evidence exists**.
- Never fabricate empty coverage or infer that no competitor exists. Unsupported fields display "not yet evidenced," not invented data.

### Editorial workflow

AI-assisted, human-approved:

- AI extracts candidate roles, relationships, and source passages;
- editors verify source fit, geography, wording, taxonomy tags, and expiry dates;
- only approved records are visible publicly;
- revisions retain an audit trail and supersede rather than overwrite claims.

## APIs, interfaces, and access

### Student / user endpoints

- programme/domain-based Opportunity Map;
- role list with filters for venture mode, opportunity lens, maturity, location, and domain configuration;
- role-detail and role-comparison views;
- cross-domain opportunity/variant explorer;
- signal explorer and role–signal relationships;
- user preference, save, compare, and update-subscription endpoints.

### Institution endpoints

- programme-by-programme entrepreneurial-role coverage;
- domain and cross-domain opportunity coverage;
- aggregate student engagement with roles, modes, and signals;
- curriculum opportunity reports (which additional domains or modules unlock which role families);
- market-intelligence views split between Nigeria and global evidence.

Build the student interface around the current Entrepreneurship screen and the career-data client, using the same `DataState` and source/freshness conventions as employment intelligence.

### Entitlements

- **Guest / free preview** — programme-to-domain and selected opportunity summaries.
- **Individual Entrepreneurial Intelligence Pass** — full personal map, comparisons, partner architecture, market depth, saves, and updates. One-time purchase.
- **Institution licences** — student access and dashboards, annual.

Do not hard-code prices. Keep entitlement and duration configuration server-side so one-time individual passes and institution annual licences can evolve without app changes.

Institution dashboards launch first for schools, tutorial centres, and universities. **Government dashboards are deferred** until aggregate use is sufficiently broad and the governance model has been validated.

## Privacy, market intelligence, and dashboard rules

- Keep user questions optional and explain they only prioritise opportunities; they do not determine capability or remove paths.
- Treat programme mapping as an opportunity-discovery input, not proof that a user is qualified to practise a regulated profession or build a regulated venture.
- Display Nigerian and global evidence separately. Every market metric must show geography, source, date, confidence, and whether it is a fact, estimate, or editorial interpretation.
- Show generic capital-landscape information — funded examples, ecosystem organisations, funding patterns, market maturity — without turning Sifter into a referral or investor-matching service.
- Label Sifter engagement data as platform-user interest, never as a claim about all Nigerian students, graduates, or markets.
- Provide institution dashboards only with aggregate, privacy-preserving metrics; never expose individual student exploration, saves, or preferences to institutions or government.
- Enforce minimum cohort thresholds, consent/notice for personalised ranking and analytics, retention limits, deletion controls, and role-based access before dashboards go live.

The Nigeria Data Protection Act 2023 requires transparency around profiling and automated decision-making, including its consequences and a right to object or challenge it. Behaviour-driven ranking and institutional dashboards must be designed as a privacy feature from the start, not added later.

## What the refined product changes vs. the drafts

| Area | EPA v2 / entrepreneurship.md | Refined product |
|---|---|---|
| Core offer | Global entrepreneurial map; later a builder curriculum/certification | The map is the product: entrepreneurial roles |
| Object | Archetypes / "ideas" | Entrepreneurial Roles |
| Innovation types | Seven types as exclusive categories | Eight multi-select Opportunity Lenses |
| Tracks | MICRO/SMALL/SCALABLE/CREATOR as parallel tracks | Four multi-select venture modes |
| Signals | "Unaddressed" if no archetype found | Sourced market conditions; never "nobody built this" |
| Capabilities | Implied domain relationships | Four layers: core, supporting, operating, partner |
| Geography | "No geography restriction" | Nigeria-first with global context alongside |
| Credential | Builder certification | Removed |
| Validation | Venture validation / user testing | Removed — users decide |
| Monetisation | B2C premium, accelerator referrals, corporate intelligence | Individual pass + institution licences; referrals excluded |
| Government dashboards | Present | Deferred |
| Blockchain/DAO/quant extensions | Mentioned as options | Excluded from core plan |

## Delivery workstreams

1. **Foundation** — finalise vocabulary, role taxonomy, venture modes, opportunity lenses, entry modes, and evidence standards; create migrations, TypeScript contracts, API models, row-level access rules, and import/validation tooling.
2. **168-Domain Content Library** — build the canonical entrepreneurial-role library and connect each role to domains, capabilities, partner requirements, modes, and evidence; curate cross-domain variants and qualifying signals; complete human editorial review before publication.
3. **Student Opportunity Map** — domain selection, optional ranking questions, role filtering, role detail, comparison, saves, signals, and cross-domain explorer; preserve full visibility via Show All and transparent prioritisation explanations.
4. **Market Intelligence** — attach source-governed Nigeria/global market profiles, regulatory context, capital landscape, and maturity evidence to roles; add scheduled review queues and stale-content notices.
5. **Institution Intelligence** — programme, domain, cross-domain, market, and aggregate engagement dashboards; downloadable programme and curriculum opportunity reports.

## Test plan

- Verify every programme continues to map through the existing programme → domain graph without regressions.
- Verify all 168 domains have approved core entrepreneurial-role coverage before release.
- Verify a selected single domain shows relevant roles; a selected combination activates the correct cross-domain roles/variants; missing domains show the correct skill or partner requirement.
- Verify a role can carry multiple venture modes and multiple opportunity lenses.
- Verify optional ranking changes order and explanation only; Show All always returns the full eligible role set.
- Verify signals link to zero, one, or many roles and never automatically claim a market is empty or a gap fully resolved.
- Verify all public claims render source, geography, freshness, confidence, and review status.
- Verify regulated roles display jurisdiction-specific caution and do not imply eligibility.
- Verify free, individual-pass, and institution entitlements gate the intended depth without exposing institution data to students.
- Verify institution users receive aggregate-only intelligence; individual student records, preferences, saves, and comparisons never appear in their dashboard.
- Add migration tests, API contract tests, cross-domain graph tests, access-control tests, source-evidence validation tests, and end-to-end navigation tests.

## Market position

Strong adjacent products exist but none combine the full chain:

> programme mapping → selected domain graph → entrepreneurial role inventory → venture mode → multi-domain/partner requirements → global and Nigerian market context → institution/government intelligence.

CareerExplorer maps people to conventional careers and degrees but not to entrepreneurial roles; Berkeley/CUNY degree maps stop at experiences and careers; StartupTree and Altitut operate downstream once users already have ideas; generative tools (e.g., Fonda) are individualised and not evidence-backed. In Nigeria the visible players are employment, skills, placement, or entrepreneurship-training products. The whitespace — especially for Nigeria and the wider African education-to-builder pathway — is real.

## Assumptions

- The existing programme-domain graph, domain overlap data, market-intelligence provenance tables, career API seam, and institution access model remain authoritative.
- All 168 domains launch, but evidence-backed depth may vary by domain; unsupported fields display "not yet evidenced," not invented data.
- Builder Certification, validation workflows, business-plan tooling, investor referrals, and prescriptive startup recommendations are excluded.
- Opportunity lenses and venture modes are multi-select tags, never exclusive classifications.
- Human editorial approval is mandatory for every public entrepreneurship role, signal, market claim, and cross-domain variant.
- Institution dashboards launch before government dashboards.
