# LevelUp enrichment and market intelligence plan

## Product decisions

LevelUp is global-first. Nigeria is a localisation, admission and demand overlay,
not a filter that removes global or remote-reachable roles.

LedgerLens is out of scope for this plan. It is a separate product and should
not be mixed into LevelUp's career-intelligence, school-guidance or institution
analytics work.

The app should keep one connected student drilldown:

`starting point -> subjects/programme -> school/cutoff -> domain -> subgroup -> role -> skills/tools/certs/demand`

Institution intelligence should keep separate working views for universities:

- Programme dashboard: inward view of this institution's programme mix.
- Domain lens: domains reached by the programme mix, by market lens.
- Role value: role-level volume plus salary/value/selectivity.
- Skills gaps: employer-demanded skills not covered by the curriculum.
- Trends: time movement for the same domain/role graph.
- Peer benchmarks: institution-only, not student-facing.

Secondary schools and tutorial centres are different: they look outward across
two schools/programmes for student guidance. They still need market
intelligence, because good counselling means showing the student the domain,
role, demand, salary/value and remote-access implications of each programme and
university option. They do not compare their own school against a university
peer set.

Entrepreneurship is a first-class LevelUp pathway, not just a programme search
result. It should be modelled as venture readiness: customer proof, revenue
model, route to market, operating costs, regulation/compliance risk, useful
domains, founder skills and tools. It should not be forced into the same
job-posting rank as employed roles.

Auth should be one coherent flow:

- Landing -> choose audience / browse as guest / sign in / create account.
- The carousel is optional content, not a required auth gate.
- Guest browsing must create a real guest session.
- Terms and Privacy must be accepted before account creation.
- Guest browsing can proceed without terms acceptance until the user saves data
  or creates an account.
- Every auth/onboarding/detail surface needs an obvious back path.

## Market intelligence contract

Never collapse the three market lenses into one score:

- `global`: international demand and remote/migration relevance.
- `ng_local`: Nigerian in-person/local hiring.
- `ng_remote`: roles realistically accessible to Nigerians without relocation.

Demand ranking must be volume x value, not volume alone:

- `high_demand_high_value`: broad demand, strong upside.
- `high_demand_lower_value`: broad entry, lower ceiling.
- `low_demand_high_value`: elite pathway, selective entry.
- `low_demand_low_value`: limited signal.
- `emerging_high_growth`: growing fast, still forming.
- `insufficient_data`: show honestly, never fake numbers.

Every role/domain metric should carry source confidence, last refreshed date and
redistributability. Subgroup metrics are rollups from roles, not separately
sourced market categories.

## Six-layer enrichment model

Keep the existing graph and enrich it. Do not restart from scratch.

- L0: CCMAS and later NBTE/NCE/nursing taught skills.
- L1: domain foundation skills derived from role frequency.
- L1T: domain-level tools.
- L2: subgroup skills derived from role clusters.
- L2T: subgroup tools.
- L3: per-role essential and optional skills.
- L3T: role-specific tools.

Professional-body documents provide role names, competency prose, certifications
and validation evidence. They do not replace ESCO/O*NET skill normalisation.

## Source policy

Current source anchors:

- ESCO v1.2.1 for the occupation and skill spine.
- O*NET 30.3 for alternate titles, skills, technology skills and emerging signals.
- WEF Future of Jobs 2025 for emerging/declining role signals.
- NICE/NIST, ENISA ECSF and SFIA 9 for tech/cyber/cloud/professional skills.
- CFA, ACCA/CIMA, IAPP/CIPM, IIBA, CIPS, PMI and domain bodies where applicable.
- Stack Overflow Developer Survey and GitHub Innovation Graph for technology/tool
  signal, including Nigeria where available.
- MyJobMag, Jooble and Careerjet for accessible Nigerian posting counts where
  terms and technical access allow.
- BLS/OEWS for redistributable wage anchors and remote/global salary proxies.

License rule:

- Redistributable data may be displayed directly with attribution.
- Reference-only data may influence internal review or confidence, but should not
  be republished as raw extracted rows.
- Restricted/paywalled/scraped data must be excluded unless a licence or
  partnership explicitly allows use.

## Verification and access

Guest:

- Can browse Explore.
- Can see Profile and My World in limited/read-only mode.
- Cannot save, take notes, subscribe to alerts or access institution tools.

Student:

- Owns their saved paths, notes and starting point.
- Can affiliate to a school/code voluntarily.

Educator/school/tutorial:

- Starts at national/public aggregate guidance.
- Requests or claims a school/session code.
- Gets stronger access after manual verification.
- Sees individual students only through provisioning/claim/consent rules.

University/institution admin:

- Gets programme-mix intelligence only after verification.
- Peer benchmarks are aggregate institution tools only.

Market-intelligence access rule:

- Public/guest views show national and global aggregates.
- Verified universities can see their own programme mix against market demand.
- Verified secondary/tutorial accounts can compare external schools/programmes
  for guidance and can use domain/role/skills/trends as advice lenses, but do
  not receive university peer-benchmark tools.
- Student-level detail remains consent/provisioning-gated.

Team access rule:

- A school/university/tutorial centre may have multiple officials.
- Each official uses their own account; nobody shares the owner's login.
- Owners/admins invite counsellors, provisioning managers, HODs/deans, course
  advisers and data viewers into the same organisation workspace.
- Organisation membership does not unlock student PII by itself.

## Build order

1. Stabilise auth, guest mode, back paths, legal copy and hidden unfinished surfaces.
2. Add entrepreneurship as a pathway with its own venture-readiness model.
3. Add source registry and market-metric contracts.
4. Ingest and normalise professional-body roles for missing/recent/cross-domain roles.
5. Add global/ng-local/ng-remote demand ingestion with redistributable flags.
6. Compute volume x value quadrants and elite/selective labels.
7. Surface the same intelligence through student cards and institution tabs.
