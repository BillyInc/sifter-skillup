# Partition 02 — increment 017: rows 197–206 full-standard checkpoint

Recorded 2026-09-25 (Africa/Lagos). Append-only evidence record. This checkpoint does **not** edit `programme_mapping.json`, `jamb_domain_map.json`, curriculum scopes, any seed, or SQL.

## Coverage and closure

- Canonical programme rows inspected: **197–206 (10/10)**.
- Parsed source occurrences preserved in the occurrence inventory: **10/10**, each presently one occurrence from `Sciences.pdf`.
- Official JAMB brochure name/page-text evidence: **9/10** surfaced in official indexed text (rows 197–200 on printed p. 491; rows 201–205 on printed p. 493). Row 206 exact official table row/page was not captured in this pass.
- Exact JAMB table-cell geometry and institution association visually verified: **0/10**. Do not treat the parsed institution tokens (ABSU, COVENANT, REDEEMERS, ESUTECH, BELLS, EBSU, CCU) as verified awarders. In particular, the p. 491 linearized excerpt interleaves `PAUL`, `PURE AND INDUSTRIAL PHYSICS`, and `ABSU`; its table geometry is needed to resolve which institution attaches to which programme.
- CCMAS component/course-scope presence: **10/10** have a saved component and selected course list, but adequacy is unproven for the blended title facets below. Combined scoped courses: **187**; **184** have a local outcome or content summary; **3** selected records have neither (`IMT 320` in rows 201, 202, and 205). This is only local extraction coverage, not proof that the authoritative PDF was fully checked.
- Domain-link candidates inspected: **52** across these rows. Full course-outcome-to-domain tier adjudication and descendant subgroup/role acceptance: **0/52 closed**. No role is confirmed by this checkpoint.
- Full identity closure: **0/10**. All ten remain open for exact offering table locator/institution evidence and/or curriculum, link-tier, and downstream-role verification.
- No claim of unavailability is made. No external curriculum search was required in this tranche because relevant NUC CCMAS programmes exist for the observed components; where a named component is not adequately represented, first extend/reconcile the relevant CCMAS course scope.

## Evidence sources and limits

- JAMB, *Degree Sciences brochure*: <https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf>, accessed 2026-09-25. Official indexed text returns the p. 491 Physics programme block and p. 493 Mathematics/Statistics block. The live IBASS PDF URL currently renders a JavaScript shell to the browser text extractor; search-indexed PDF text is useful for programme wording/page leads, but does not establish exact row geometry or awarder associations. Row 206 still needs a direct exact-table locator.
- NUC, *Sciences CCMAS*: <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf>, accessed 2026-09-25. Local structured CCMAS sources checked: `ccmas/sciences.json`, including Applied Geophysics (GPH), Industrial Physics (IPH), Industrial Mathematics (IMT), Statistics (STA), and Industrial Chemistry (ICH).
- NUC, *Computing CCMAS*: <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf>, accessed 2026-09-25. It contains a separate Computer Science programme (COS); this is relevant when the JAMB title names Computer Science, not evidence that every industrial-mathematics curriculum with a COS course is a complete CS component.
- NUC, *Administration CCMAS*: <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-CCMAS-2023-FINAL.pdf>, accessed 2026-09-25. Local structured source `ccmas/administration_management.json` contains Entrepreneurship (ENP).
- Local cross-check inputs: `programme_mapping.json` rows 197–206; `jamb_curriculum_scopes_2026-08-17.json` same ordinal rows; `jamb_offering_context_inventory_2026-09-25.json`; active candidate domains from `jamb_domain_map.json` (parsed case-sensitively because PowerShell's default JSON conversion rejects its duplicate case-variant programme keys). These establish what the current files contain, not correctness.

## Row-level evidence and current disposition

### 197 — Pure and Industrial Physics

- Current map override: Industrial Physics (IPH); saved scope is 15 IPH courses: general physics/practicals, modern/thermal/quantum/solid-state physics, and mathematical methods. It does not visibly separate a `Pure Physics` facet or identify which courses are specifically industrial/applied.
- One parsed occurrence: Sciences.pdf row ordinal 128, source name `Pure and Industrial Physics`, token `ABSU` (unverified). Official JAMB p. 491 indexed text contains the programme name in a block also containing `PAUL` and `ABSU`; do not assign either institution until table columns are inspected.
- Existing links: D050 Industrial Automation, D016 Electrical, D132 Space Science/Exploration, D140 Robotics, D093 Electrical Installation, D019 Renewable Energy, D155 Nanotechnology/Advanced Materials (all functional); D059 Space Technology (adjacent). Generic physics/solid-state courses do not establish automation, robotics, wiring trades, solar-energy systems, nanotechnology, or spacecraft occupations. D016 could only be reconsidered for a narrowly evidenced electronics/electrical-science facet; this 15-course selection has no explicit electronics design course. No broad domain/role is confirmed.

### 198 — Industrial Physics with Renewable Energy

- Current IPH scope: 16 courses; includes PHY 202 Electric Circuits and Electronics, but no explicitly selected solar/renewables, photovoltaic conversion, storage, power systems, or energy-economics course. A generic energy/physics match term is not an outcome-level renewable-energy curriculum.
- One parsed occurrence: Sciences.pdf row 129; token COVENANT (unverified). JAMB p. 491 official indexed text contains the name in the COVENANT block; exact cell alignment is still unverified.
- Existing links are the same eight candidates as row 197. D019 Renewable Energy Engineering is the only title-aligned candidate, but is not established as a course-supported engineering path by this scope. D016 Electrical is at most a broad circuit foundation; D093 installation/wiring and the automation, robotics, space, nanotechnology, and satellite domains have no supporting selected course sequence. The named renewable-energy facet is a confirmed scope-evidence gap, not a claim that NUC has no relevant material: search the full IPH curriculum for all energy-conversion/power courses before concluding what must be added.

### 199 — Industrial Physics with Applied Geophysics

- Current GPH scope: 24 courses, including GPH 305 field methods/data acquisition, GPH 308 seismic interpretation, GPH 312 electrical/electromagnetic mineral/hydrocarbon prospecting, GPH 405 engineering/geotechnical applications, GPH 412/413 groundwater/borehole, GPH 414 environmental pollution and groundwater-quality work, and field attachments.
- One parsed occurrence: Sciences.pdf row 131; token COVENANT (unverified). Official JAMB p. 491 indexed text includes this title in the COVENANT block; awarder cell geometry remains open.
- Current links: D072 Geospatial Science and D022 Mining (direct); D041 Scientific Research, D020 Environmental Engineering, D059 Space Technology, D054 Oil, and D156 Land Surveying/Cadastral Mapping (functional). Course outcomes strongly support applied geophysics/exploration and environmental/geotechnical applications, but they do **not** by themselves establish general GIS/geospatial careers, mining professions, licensed surveyor/cadastral roles, or space technology. D059 is unsupported by this scope. D054 is bounded hydrocarbon-exploration application, not a general oil-industry route. D022 should be reviewed as a mineral-exploration use case, not assumed to cover mining occupations. D020 is similarly a pollution/groundwater application rather than all environmental engineering roles. Preserve these distinctions; no downstream role is confirmed.

### 200 — Industrial Physics with Electronics and IT Application

- Current IPH scope: 33 courses, including COS 101 (general computer/Internet literacy), PHY 202 (DC/AC circuits and semiconductor-device outcomes), PHY 315 (semiconductors/electronics; locally extracted outcomes mention modulation/telecommunication), and PHY 423 (title is Solid State Physics II, but local extracted outcomes unexpectedly describe borehole/MRI and analogue/digital system design/troubleshooting). PHY 415 is titled Science of Materials, but its local outcomes unexpectedly describe digital communication systems/modulation. These title/outcome mismatches require direct comparison against the NUC PDF before using the affected records as evidence; the local file alone is suspect.
- One parsed occurrence: Sciences.pdf row 132; token COVENANT (unverified). JAMB p. 491 official indexed text contains this title in the COVENANT block; table geometry remains open.
- Current links: D050 automation, D016 electrical, D132 space science, D140 robotics, D093 installation, D019 renewable energy, D155 nanotechnology, D008 telecommunications (all functional), and D059 space technology (adjacent). D016 may fit a bounded electronics learning facet if course outcomes are source-verified. D008 has a possible modulation/communications facet but must await PDF outcome validation. COS 101 is introductory digital literacy, not an IT professional curriculum. No automation/PLC, robotics/control, wiring-trade, renewable-energy, nanoscale, spacecraft, or space-science sequence is demonstrated by the selected scope. The named `IT Application` facet is inadequately represented by COS 101 alone.

### 201 — Industrial Mathematics and Computer Science

- Current override selects Industrial Mathematics (IMT) only. Sixteen courses include COS 101 (basic computer literacy) and COS 201 (introductory programming outcomes: data types, control flow, functions, classes, file I/O, arrays), plus mathematical computing, numerical analysis, modelling, operations research, and optimization. One local record, IMT 320 Industrial Attachment, has neither outcome nor content summary.
- One parsed occurrence: Sciences.pdf row 133; token REDEEMERS (unverified). Official JAMB p. 493 indexed text contains the programme wording and a REDEEMERS entry, but the precise awarding-institution cell must still be checked in the PDF.
- Separate CCMAS Computing::Computer Science exists. The current scope does not select its broader required CS courses/outcomes, so the title's Computer Science facet is not established merely by two COS courses inside an IMT scope. Current domains D003 AI and D014 Actuarial Science (functional) lack supporting AI-learning and actuarial-practice sequences; mathematical modelling/financial mathematics is not enough for either. No student career path is confirmed.

### 202 — Industrial Mathematics /Applied Statistics

- Current override/scope: Industrial Mathematics only, 12 selected IMT courses. There are no STA component courses despite the explicit Applied Statistics facet. IMT 301 Financial Mathematics and IMT 303 Mathematical Computing do not substitute for statistical inference, applied-data analysis, or the Statistics curriculum. IMT 320 lacks outcome/content extraction.
- One parsed occurrence: Sciences.pdf row 134; token ESUTECH (unverified). Official JAMB p. 493 indexed text contains the title/ESUTECH sequence; exact table cell remains to verify.
- Current links D003 AI and D014 Actuarial Science are functional, but neither is established by this course selection. The missing Applied Statistics component is a confirmed gap in the current saved scope. Join the Statistics CCMAS course/outcome slice before deciding which statistics/data domains and tiers are justified.

### 203 — Applied Mathematics with Statistics

- Current scope maps Statistics (STA), selecting 17 courses including only MTH 101/102 for mathematics, statistical inference I–IV, descriptive statistics, and statistical computing I–III. The `applied mathematics` facet is represented only by foundational algebra/trigonometry and calculus in this selected set; audit the full Mathematics CCMAS for relevant additional courses rather than assuming the Statistics package exhausts it.
- One parsed occurrence: Sciences.pdf row 135; token BELLS (unverified). The official p. 493 indexed text includes this programme name and BELLS nearby; exact institution attachment remains open.
- Current links D003 AI and D009 Data Science (functional) overstate what the selected course evidence establishes. Statistical computing courses do show Excel/tool-pack use and R/SAS package exposure in local outcomes, which may support bounded statistical-data-analysis tasks, but do not by themselves establish AI development or every data-science role. A Statistics direct-domain route and the exact bounded data-analysis roles require separate taxonomy/link review.

### 204 — Applied Statistics

- Current STA scope: 15 courses (descriptive statistics, inference, statistical computing, distribution theory, applications, project). Local outcomes for STA 122 include spreadsheet/Analysis ToolPak computing; STA 331 includes R or SAS setup/data loading and practical applications of statistical theory.
- One parsed occurrence: Sciences.pdf row 136; token EBSU (unverified). Official p. 493 indexed text contains the Applied Statistics/EBSU sequence, but the exact table row/cell is not visually verified.
- Current links D003 AI and D009 Data Science are functional. D003 AI is unsupported by the selected statistical curriculum. D009 may be a bounded applied-statistical analysis candidate, but should not be described as a complete data-science route without evidence of data engineering/programming, machine learning, and relevant role tasks. The present two-link set also lacks a directly named Statistics domain; audit rather than patch by inference.

### 205 — Industral Mathematics/Computer (source spelling retained)

- Current override maps Mathematics; scope is 15 Industrial Mathematics courses, including COS 101/201, mathematical computing, numerical methods, modelling, optimization, and financial mathematics. IMT 320 is not locally outcome-enriched. The title's `Computer` portion is not an adequate basis to assume either Computer Science or a specific IT programme, and the checked scope is not a full CCMAS Computing::Computer Science component.
- One parsed occurrence: Sciences.pdf row 137; token EBSU (unverified). Official p. 493 indexed text contains a nearby `INDUSTRAL…` sequence; exact source spelling, full programme string, and awarder cell still require the official page/table check.
- Current links D003 AI and D014 Actuarial Science are both unconfirmed. No AI coursework is scoped; Financial Mathematics alone does not establish actuarial modelling, risk, insurance, or professional actuarial preparation. Preserve the exact source name until JAMB table inspection resolves its spelling; do not silently normalize it.

### 206 — Industrial Chemistry and Chemical Entrepreneurship

- Current override selects Administration::Entrepreneurship (ENP) only: 24 business/venture courses. It does not include Sciences::Industrial Chemistry (ICH), which exists in the local NUC Sciences CCMAS as a separate 42-course curriculum. The named Chemistry facet is entirely absent from the saved selection. This is a confirmed component omission in the current scope; rebuild a two-component scope and then determine which ICH and ENP courses the source evidence supports. The row does not justify treating a title as proof of a combined full curriculum, but it does prove the current ENP-only scope fails to cover a substantive title part.
- One parsed occurrence: Sciences.pdf row 138; token CCU (unverified). Exact JAMB table row, page, programme wording, and institution association remain uncaptured in this pass.
- Current eight functional links are D028 General Management, D030 Marketing/Brand, D061 Insurance, D063 Economics, D078 Social Sciences, D130 Recruitment/Employment, D158 Corporate Finance/Investment Banking, and D159 Credit/Structured Finance. ENP-scoped entrepreneurship courses may support venture/management tasks, but the wide set is not established as curriculum destinations for the combined Chemistry+Entrepreneurship offering. D061/D063/D078/D130/D158/D159 have no adequate selected-course basis demonstrated here. D030's local ENP 203 outcome/summary appears discordant with its title (title: Marketing for New Ventures; outcomes/summary concern personal finance, investment markets, insurance/risk, tax, crypto/crowdfunding); verify the source CCMAS before using it to support marketing or finance. No subgroup/role path is confirmed.

## Cross-cutting downstream and data-quality findings

1. Current scopes for these ten rows expose a broad candidate fan-out (52 links) but do not record enough reviewed evidence to confirm subgroups or roles. In particular, domain names such as Electrical, Renewable Energy Engineering, Industrial Automation, Robotics, Space Technology, Nanotechnology, Mining, Land Surveying, AI, Actuarial Science, and Data Science span jobs with distinct applied prerequisites. Curriculum adjacency is not role eligibility. Hold their downstream roles until course outcomes are checked and each subgroup/role task actually follows from that evidence.
2. Multiple title facets are missing or thin in their current JAMB-specific scope: `Pure` in row 197; renewable energy in 198; IT application in 200; Computer Science in 201; Applied Statistics in 202; Applied Mathematics in 203; ambiguous `Computer` in 205; and all Industrial Chemistry in 206. These are scope defects/candidates for correction, not proof that CCMAS or external sources are unavailable.
3. Local structured CCMAS outcome rows contain notable possible title/outcome alignment errors for IPH courses PHY 415 and PHY 423 and ENP course ENP 203. Verify against their exact source PDF pages before using those outcomes to grade links. For row 200 this matters to the apparent telecommunications/electronics support; for row 206 it matters to marketing/finance link claims.
4. Targeted systematic search in this tranche did not yet establish an item-specific external source that is needed to fill a CCMAS gap. No unsupported link is newly promoted, no map changes are proposed as already applied, and no item is labelled unavailable.

## Next batch

Next systematic slice: rows **207–216**. Keep rows 197–206 open until JAMB table locators/institution cells, source-verified course outcomes, missing named-component scopes, all 52 link tiers, and relevant descendant subgroups/roles receive adequate evidence.
