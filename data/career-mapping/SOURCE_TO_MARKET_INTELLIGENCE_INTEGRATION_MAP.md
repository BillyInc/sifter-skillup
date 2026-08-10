# Source-to-market-intelligence integration map

## Executive finding

The downloaded professional-body files materially improve the career graph, but they are not currently being read by the market-intelligence pipeline. The current pipeline loads:

- `role_library_v3.json` / `role_library_v3_cleaned.json`;
- ESCO/O*NET-derived taxonomy files;
- `taxonomies/wef_2025_roles.json`;
- remote-board caches;
- MyJobMag XML;
- paid/API-derived samples for Careerjet, Jooble, JSearch and Glassdoor/OpenWeb Ninja.

It does **not** currently parse the local SFIA, NICE, ENISA, CFA, IIBA, CIPS, IAPP, CIPM or SPE documents into roles, aliases, competencies or market queries.

## Current baseline

The current role library contains 4,703 roles:

| Source label | Role rows |
|---|---:|
| ESCO | 4,404 |
| O*NET | 207 |
| ESCO/O*NET | 53 |
| WEF | 27 |
| QT Framework | 12 |

This is a strong occupation spine, but it explains why professional-body titles and Nigerian regulator terminology are not yet visible in role cards or query matching.

The market sample currently has 30 records: 10 roles × 3 lenses (`global`, `ng_remote`, `ng_local`). The generated baseline then expands signals across the wider role/domain graph, with low-confidence taxonomy-derived rows until real observations replace them.

## What each source improves

| Source family | Adds to the career graph | Display improvement | Market-intelligence translation |
|---|---|---|---|
| ESCO / O*NET / ISCO | Canonical occupations, aliases, tasks, skills and crosswalks | Better role descriptions, aliases, skills and international grouping | Stable query keys; better title matching and deduplication |
| WEF / O*NET Bright Outlook | Emerging and declining signals | `current`, `emerging` or `legacy` role badges | `emerging_high_growth` evidence; not posting volume |
| SFIA 9 | Digital skills, responsibility levels, cloud/software/data vocabulary | Career ladders, seniority, skill explanations and role-level bridges | Adds aliases and skill terms for technology queries; supports tool/skill gap signals |
| NICE + ENISA ECSF | Cybersecurity work roles, tasks, competencies, title variants and relationships | Cyber role profiles, clearer GRC/security distinctions and cross-domain links | Better cybersecurity query registry and skill extraction; no direct volume or salary |
| CFA / ACCA / actuarial bodies | Finance role families, competency stages and credential ladders | Finance pathway and certification placement | Better role aliases and certification-demand extraction |
| IIBA | Business-analysis and product/BI competency language | Explains BI/product/business-analysis overlap | Adds query aliases and skills for D010/D033 and adjacent roles |
| CIPS / ASCM / CILT | Procurement, supplier, logistics and supply-chain role language | Makes supplier, procurement, logistics and planning paths distinct | Enables the third-party cyber role to be matched to D034/D036 without duplicating it |
| IAPP / CIPM | Privacy, compliance and data-governance role language | Better compliance/privacy certification and bridge display | Adds privacy/GRC aliases and certification signals |
| SPE / energy bodies | Petroleum, offshore and energy competency language | Stronger D054/D148 role and credential detail | Better energy/offshore query terms; not local demand by itself |
| Nigerian regulators and professional bodies | Nigerian title, registration, scope-of-practice and qualification context | Local licence badges, Nigerian aliases and pathway notes | Validates local terminology; does not create vacancy counts |
| CCMAS / NBTE / NCE / nursing standards | Nigerian taught-skill and occupational-standard context | Better programme-to-domain-to-role bridge and trade pathways | Explains curriculum coverage and skills gaps; not demand volume |
| GitHub Innovation Graph | Technology ecosystem activity, including Nigeria | Tech ecosystem/context indicators | Nigeria technology signal; not a job-posting count |
| Stack Overflow survey | Tool and technology usage signal | Tool recency and learning-priority explanations | Tool-demand enrichment; not hiring volume |

## Existing files that are immediately usable

The most important source map is [UNIVERSITY_DOMAIN_PROFESSIONAL_BODY_REGISTRY_2026-07-15.md](UNIVERSITY_DOMAIN_PROFESSIONAL_BODY_REGISTRY_2026-07-15.md). It already maps professional bodies to domains and records whether the source is local, partial, a role page or a manual download.

Local role/competency material includes:

- `_prof_bodies/ENISA_ECSF_Role_Profiles.pdf`
- `_prof_bodies/ENISA_ECSF_User_Manual.pdf`
- `_prof_bodies/NICE Framework Components v2.2.0.xlsx`
- `_prof_bodies/SFIA_9_2025-02-27.ttl`
- `_prof_bodies/sfia-9_current-standard_en_260521.xlsx`
- `_prof_bodies/SFIA_9_cloud_computing_skills_with_LoR.pdf`
- `_prof_bodies/SFIA_9_cybersecurity_skills_with_LoR.pdf`
- `_prof_bodies/career-skills-framework-2022-static_copy.pdf`
- `_prof_bodies/business-analysis-competency-model-v4-preview-edition_copy.pdf`
- `_prof_bodies/CIPM_BoK_EBP_FINAL_03Dec25_copy.pdf`
- `_prof_bodies/spe_csp11_description.pdf`

Local taxonomies and labour/context data include:

- `taxonomies/esco_occupations.json`
- `taxonomies/occupation_graph.json`
- `_source_extracts/onet_30_3/`
- `taxonomies/wef_2025_roles.json`
- `_source_extracts/github_innovationgraph/`
- `docs/nigeria_nlfs_q1_2024.json`
- `data/career-mapping/ccmas/`
- NBTE/CCMAS source references documented in the source audits

## How this should appear in the product

### Domain detail

Add source-backed sections for:

- role families recognised by professional bodies;
- Nigerian regulator or registration context;
- competency/level ladder;
- source confidence and last checked date;
- “also relevant in” domains for cross-domain roles.

The existing UI already has slots for domain foundation skills, tools, certifications, roles, currency and demand. The missing piece is source-derived role/competency payloads and provenance.

### Role detail

Professional-body evidence should populate:

- additional title aliases;
- career ladder and responsibility level;
- competency groups;
- Nigerian licence or professional-body notes;
- related domains;
- source badges distinct from demand badges.

It should not be displayed as a posting count or salary estimate.

### Skills-gap display

Use professional-body competencies as validation and supplemental role requirements. Keep ESCO/O*NET as the normalised skill vocabulary, then map body-specific competency phrases to ESCO skills where possible. Unmatched phrases should remain source-labelled provisional skills rather than being silently discarded.

### Market-intelligence admin screens

The existing schema and screens already support:

- posting volume;
- local/global/remote lenses;
- salary bands;
- employer counts and concentration;
- demand/value quadrants;
- top employers and certifications;
- confidence, interpretation and provenance.

The professional documents improve the *identity and interpretation* of these records. They do not directly fill posting volume, salary or remote percentage.

## Cybersecurity and supply-chain example

Represent the family once:

- canonical role family: third-party cyber risk and supplier security;
- primary domain: `D004` Cybersecurity;
- secondary domains: `D034` Supply Chain Management, `D036` Procurement, `D038` Compliance;
- aliases: vendor risk, supplier assurance, third-party security, security due diligence and related titles.

Use NICE/ENISA for cyber responsibilities, CIPS/ASCM/CILT for supplier/procurement terminology, and Nigerian bodies for local context. Feed all aliases into one query registry. Count a posting once at the canonical role level, then roll it up to each relevant domain with an explicit multi-domain attribution rule.

## Free-source position

Paid/API sources are not necessary for the role taxonomy. They are only needed for scalable live counts and salary estimates. The free or already-downloaded layer can provide:

- role names and aliases: ESCO, O*NET, professional bodies;
- competency and career levels: SFIA, NICE, ENISA, CFA, CIPS, IIBA and similar bodies;
- Nigerian licensing/context: regulators and professional councils;
- Nigerian occupational standards: NBTE;
- public vacancy observations: MyJobMag feed, public employer career pages and public government/agency vacancy pages;
- remote/global observations: RemoteOK, Remotive, Arbeitnow and The Muse caches already present;
- tool/ecosystem signals: O*NET, Stack Overflow and GitHub Innovation Graph.

Public job-board access must still be treated as a terms/licensing question. Store derived counts and provenance, not raw listings, unless redistribution is explicitly permitted.

## Recommended integration order

1. Parse the local professional-body files into a `role_evidence`/alias layer without changing the canonical role IDs.
2. Add `source_role_evidence` and `role_aliases` to the source/query registry.
3. Map competency phrases to ESCO/O*NET skills; retain unmatched phrases as labelled provisional evidence.
4. Add Nigerian regulator and professional-body aliases/licence notes to role and certification payloads.
5. Re-run title matching for the free market caches and produce source-separated metrics.
6. Only then refresh demand rows and display confidence/freshness on student and admin surfaces.

The key rule is: professional sources improve **what the role is and how it is described**; market sources measure **where, how often and at what value it appears**.
