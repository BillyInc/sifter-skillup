# Data Gap Report — 2026-07-16

What is still on deferred/derived data after the full seed pipeline runs
(`RUN_PIPELINE.bat` + applying the SQL files). Everything listed here is
LABELLED in the product (source_confidence / dataState), never silently mocked.

## Scope decision applied (owner, 2026-07-16)

University pipeline only. Hiding is by **reachability**, not by the
`institution_type[]` flag: a domain stays live if any CCMAS programme or JAMB
programme name maps into it. Adversarial check result: 160/168 domains are
reachable (the naive institution_type rule would have wrongly hidden 28,
including Food Science and Chemical Engineering). Hidden (8): D086 Gaming/
Betting (excluded), D087 Hairdressing, D088 Beauty Therapy, D089 Funeral,
D100 Plumbing, D101 Painting/Decorating, D108 Printing Technology, D113
Glass/Ceramics. They are DELETEd by the regenerated `seed_career_v2.sql` and
excluded from demand baselines; restore by removing them from the HIDDEN rule
when the polytechnic pipeline ships.

## Per-surface gaps

### 1. Demand metrics (all users; admin dashboards, domain/role detail)
- **Real API-sampled**: 10 roles × 3 lenses (software developer, accountant,
  nurse, civil engineer, lawyer, HR officer, product designer, sales rep,
  secondary teacher, supply chain manager). `source_confidence = high/medium`.
- **Derived baseline**: the other ~4,000 roles and ~157 domains carry
  taxonomy-derived values (cluster anchors + bulk-board matches + WEF growth
  + tier-adjusted salary interpolation), `source_confidence = 'low'`,
  provenance rows in `market_metric_sources`.
- **Missing entirely**: postings_yoy / trend_pct (needs ≥2 monthly snapshots);
  employer_concentration; ng_local salary for supply_chain_manager (provider
  retry pending).
- Replaced progressively by FETCH_PLAN P1 (domain sweep) and P2 (role sweep).

### 2. Admission intelligence (SS3 "know where"/"know what" doors)
- Cut-offs: **10 universities, 21 programme×school rows (2025)** — the
  brochure-verified sample. Remaining ~767 seeded universities show the
  national JAMB floor + competitiveness context instead (labelled fallback).
- Aggregate formulas: the sampled universities only.
- Expansion window: post-UTME season (Dec–Jan) per FETCH_PLAN P3.
- `programme_subject_options` structured parsing: requirements are stored as
  brochure TEXT (utme_subjects / olevel_requirement); the parsed per-subject
  option rows remain 'unparsed' — parser is a separate build item.

### 3. Certifications (domain/role detail, upskilling CTAs)
- 508 certs seeded with placement (gateway 102 / subgroup 263 / role-hint 145).
- Enriched (price, url, issuing-body verification): **19/508**. The other 489
  show name/body/level only. Quarterly refresh in FETCH_PLAN P3.

### 4. Skills URIs (ESCO deep links)
- Regenerated from the real ESCO export; **unmatched skill names carry no URI**
  (never fabricated). Expect ~60–80% coverage; the UI must treat a missing URI
  as "no link", not an error.

### 5. Role-level tools (L3T)
- Built via role→SOC crosswalk (~77% of roles expected to match). Unmatched
  roles fall back to their subgroup's tools — the UI labels these "inherited".

### 6. L0 for non-university institutions
- Polytechnic (NBTE) and NCE curricula are NOT ingested — only CCMAS (university).
  This is why the 8 unreachable trade domains stay hidden. CCMAS-scale manual
  extraction; deferred until the polytechnic pipeline is a product priority.

### 7. Institution/educator surfaces (live accounts, no demo data)
- Owner decision: **no demo users — everything live.** Admin dashboards are
  university-agnostic (platform-level).
- Consequences until real accounts exist:
  - Expert Dossier and feedback inbox render empty states (real
    `mapping_feedback` rows only).
  - School guidance dashboards populate when a school registers members
    (`institution_members`) and students share via provisioning.
  - `POST /api/institutions/verify` is still an echo stub; educator identity
    is client-local (AsyncStorage). Server-side verification flow is a build
    item, not a data item.

### 8. Phase-7 content types (elite pathways, opportunities, scholarships)
- No tables, no routes, no data — screens show coming_soon by design.
  Separate schema + build; not a fetch item.

### 9. Known thin spots in seeded data
- `foundation_skills`: 167/168 domains (D086 excluded anyway).
- JAMB programme naming: institution-specific names come straight from the
  brochures and ARE seeded (school_programmes join) — verify the app resolves
  displayName through that join (Phase 4 spot-check).
- Tools leakage audit (Epic/MEDITECH-style cross-domain artifacts in top-20
  domains): flagged as a data-quality pass to run after seeding, using
  role_tools.json SOC provenance as the reference.
