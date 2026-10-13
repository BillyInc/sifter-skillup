# D113–D168 role-enrichment checkpoint — 2026-10-06

## Scope

This checkpoint covers internet-backed role enrichment for domains D113–D168 only. It is a research and duplicate/alias review artifact. It does not reconcile role-to-domain or role-to-area-of-specialization fit, apply deterministic statuses, audit taxonomy, or edit canonical role/domain/subgroup files.

The lane checked all 56 domain IDs, with focused enrichment for sparse/no-role domains and the named emerging domains: gaming, quantum computing/information, autonomous vehicles, XR, and esports/creator economy. D006 IoT/embedded and D056 Blockchain are outside this lane and are recorded only as out-of-lane notes in the JSON checkpoint.

## Coverage and current gaps

- 56 domains checked against the current cleaned, thin-overlay, emerging-overlay and legacy role files.
- 2 domains have no active exposed roles: D153 Music Creation and Performance and D157 Tax Advisory and Compliance.
- Additional sparse domains reviewed: D132, D137, D156, D162 and D163.
- The current active-role counts and the full candidate/source ledger are in the companion JSON file.
- No canonical file was edited.

## Candidate dispositions

### `add` candidates

These are established global role titles or role families not found as exact active current titles. They remain review candidates; this checkpoint does not activate them.

| Domain | Candidate | Why it was captured | Nigerian evidence | Disposition |
|---|---|---|---|---|
| D132 | Spacecraft Operations Engineer | ESA identifies spacecraft-operations engineering, spacecraft control and mission-operations responsibilities; NASA describes mission planning, ground-data, navigation and software/instrument operations. | No direct Nigerian vacancy captured; NCAIR/NITDA provide only general emerging-technology context. | `add` |
| D137 | Medical Dosimetrist | AAPM describes the treatment-planning role and its distinct relationship with radiation oncologists, physicists and therapists. | No direct Nigerian vacancy or local licensing pathway captured. | `add` |
| D141 | Quantum Algorithm Engineer | IBM lists the title in quantum research roles; QED-C supplies quantum workforce context. | No direct Nigerian role evidence captured; NCAIR/NITDA are context only. | `add` |
| D141 | Quantum System Performance Scientist | IBM lists the title; the scope covers benchmarking and improving quantum-system performance across hardware/software boundaries. | No Nigerian role evidence captured. | `add` |
| D141 | Quantum Algorithm Theorist | IBM lists the title as a research-oriented quantum-algorithm role. | No Nigerian role evidence captured. | `add` |

### `alias_existing` candidates

These are not new canonical roles in this lane because the current or legacy role data already covers the title or its task family.

- D166 — `Autonomous Vehicle Design Engineer`: O*NET reports it as a sample title under Robotics Engineers; current autonomous/robotics/automotive roles already cover the family.
- D139 — `Game Producer`: exact current match; Nigerian evidence from Codebox Games strengthens the existing role.
- D139 — `Game Developer`: exact task family already covered by digital-games developer, gameplay programmer and software-developer routes; Codebox Games and XP Arena provide Nigerian direct-market evidence.
- D153 — Music production/performance family: the legacy library already contains music producer, composer, musician, singer, sound designer, recording-studio technician and related roles. The lane does not reactivate the currently inactive domain.
- D157 — Tax advisory/compliance family: the legacy library already contains tax adviser, tax compliance officer, tax inspector, transfer-pricing specialist and related roles. CITN provides a Nigerian professional route; the lane does not activate the currently inactive domain.

### `review_only` candidates

These have plausible scope or local-market signals but insufficient evidence for a new standardized canonical role in this lane.

- D168 — `Esports Operations and Content Lead`: XP Arena supports a Nigerian combined operations/content pattern, but the title combines specialist routes and is company-specific.
- D156 — `Photogrammetrist`: plausible geospatial measurement role, but this batch did not capture a sufficiently specific authoritative task profile beyond close GIS/cartography matches.
- D162 — `Asylum Caseworker`: jurisdiction-specific casework; current close matches include immigration adviser/officer/policy officer, but no Nigerian direct employer/professional evidence was captured.
- D167 — `XR Technical Artist`: plausible immersive-content bridge role, but current sources support the broader XR/multimedia family rather than this exact title.

## Nigerian evidence treatment

The ledger separates direct Nigerian market/professional evidence from ecosystem or policy context:

- Direct/professional: Codebox Games and XP Arena role/career pages; CITN recruitment and membership/professional-route pages.
- Context only: NCAIR and NITDA emerging-technology work; NITDA digital-skills training; Nigerian Copyright Commission music-value-chain material; NEXIM creative-industry finance; FMACCE creative-sector/gaming policy.
- No direct Nigerian vacancy was captured in this batch for spacecraft operations, medical dosimetry, quantum computing, autonomous-vehicle design or XR technical art.

Nigerian context does not replace proof that a global title is an established occupation. Conversely, a lack of a Nigerian vacancy does not make a globally established role invalid; it limits the local-demand claim.

## Source ledger

The JSON checkpoint contains the machine-readable source catalog, locators and candidate-level source IDs. Key sources include:

- [ESA Mission Control — who does what](https://www.esa.int/Enabling_Support/Operations/Who_does_what_at_ESA_Mission_Control) — spacecraft operations engineers, controllers and operations managers.
- [NASA Europa Clipper mission operations](https://science.nasa.gov/missions/europa-clipper/mission-dispatch-systems-engineering-for-europa-clipper/) — mission planning, ground data, navigation, software and instruments.
- [AAPM Report 46](https://www.aapm.org/pubs/reports/rpt_46.pdf) and [AAPM dosimetrist workforce page](https://careers.aapm.org/career-resources/finding-talent-4/dosimetrist-shortage-job-outlook-130) — medical dosimetry responsibilities and role distinction.
- [IBM Research careers](https://www.ibm.com/careers/research?source=WEB_Sales_GCG), [QED-C workforce](https://quantumconsortium.org/workforce/) and [QED-C technician guide](https://quantumconsortium.org/publication/guide-to-building-a-quantum-technician-workforce-2/) — quantum role titles and workforce scope.
- [O*NET Robotics Engineers](https://www.onetonline.org/link/summary/17-2199.08) — autonomous-vehicle sample title and task scope.
- [O*NET Musicians and Singers](https://www.onetonline.org/link/summary/27-2042.00?redir=27-2042.01) and [O*NET Sound Engineering Technicians](https://www.onetonline.org/link/details/27-4014.00) — music and sound role families.
- [BLS Accountants and Auditors](https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm) and [BLS Tax Examiners, Collectors and Revenue Agents](https://www.bls.gov/ooh/business-and-financial/tax-examiners-and-collectors-and-revenue-agents.htm) — tax and compliance task scope.
- [BLS Multimedia Artists and Animators](https://www.bls.gov/ooh/arts-and-design/multimedia-artists-and-animators.htm) — game-art/animation and team-production context.
- [NCAIR](https://nitda.gov.ng/ncair/) and [NITDA digital-skills bootcamp](https://nitda.gov.ng/nitda-trains-200-young-nigerians-with-digital-skills-at-summer-bootcamp/9798/) — Nigerian ecosystem/training context.
- [Codebox Games careers](https://www.codeboxgames.com/join-us) and [XP Arena careers](https://www.xparena.net/careers) — Nigerian direct-market gaming evidence.
- [CITN careers](https://portal.citn.org/careers/) and [CITN direct membership](https://portal.citn.org/join-citn-as-a-direct-member/) — Nigerian tax professional evidence.
- [Nigerian Copyright Commission music-value-chain material](https://www.copyright.gov.ng/CopyrightMatters/Copyright-Matters-Issue-29%20March-April-2025.pdf) and [NEXIM creative-industry scheme](https://www.neximbank.gov.ng/financial-facilities/nigerian-creative-and-entertainment-industry-loan-scheme/) — Nigerian music/creative context.

## Limits and handoff

Employer titles, O*NET sample titles and combined company titles are not automatically separate canonical occupations. A later reconciliation must decide whether each `add` candidate is genuinely distinct, whether each alias should be searchable without duplication, and whether each `review_only` candidate has enough evidence. That later gate is outside this lane’s scope.

The JSON checkpoint is the authoritative machine-readable handoff for this batch. If account limits interrupt continuation, resume from that JSON and append a new checkpoint in this same directory; do not modify canonical role or taxonomy files.
