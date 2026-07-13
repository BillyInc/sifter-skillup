# Domain/Sub-group/Role Mapping — Audit vs Codebase (2026-07-12)

Audit of the first-principles rebuild plan against the actual repo. Three parallel
read-only agents (data-side P0–4, backend P5/7/8, frontend P6/10–13) + direct checks.
Every "BUILT" below was mechanically counted, not inferred.

## Headline: the DATA and CORE READ-API are far more complete than the plan's "coming_soon" framing implies. The gaps are (1) enrichment at scale, (2) demand ingestion, (3) admin dashboard endpoints, (4) frontend wiring of built components.

---

## VERIFIED SOLID (no gap)

- **Taxonomy seed is real & full-scale** — `seed_career_v2.sql` = 96,193 lines, 95,212 tuples, every row-count comment matches exactly: 168 domains, 4,092 roles, 7,393 tools, 508 certs, 2,528 programme_domain, 70,560 programme_role_score, 5,573 jamb_programme_domain, 4,112 domain_overlap. Running it populates a live app.
- **Role library v3** — 4,092 roles, **100% non-empty essential_skills** (the plan's "empty-skill roles" bug is fixed). All 6 emerging domains populated: D011 Quant 26, D139 Game 30, D141 Quantum 9, D153 Music 30, D167 XR 20, D168 Esports 9. The GLOBAL-FIRST gaps the plan flagged are CLOSED.
- **programme→domain** — 2,528 links (direct 349 / functional 2,040 / adjacent 139). Sociology → D009 DS + D010 BI ✓. D031 Sales has 18 feeders ✓. Both named failure classes fixed.
- **JAMB propagation** — 414 names (plan said 388), **0 dead ends**. "Economics and Statistics" blend carries both DS + BI ✓.
- **Readiness** — 70,560 instances at exactly 17.4/66.3/16.4 ready/bridge/stretch; 234/236 programmes have ≥1 ready role. Grouped by sub-group, none hidden.
- **Sub-groups/skills/certs** — 278 subgroups all with friendly name + raw_isco_label + description (0 gaps); 508 certs / 149 domains; foundation+cluster skills present; tools cover 167/167 active domains, TF-IDF ranked.
- **Core read API against real tables** — `/domains/{id}`, `/roles/{id}`, `/search`, `/pivot` all query real tables with Phase-9 enrichment fields. All Phase-8 admission routes against all 5 tables.
- **Phase 8 admission** — 5 tables + all routes aligned; pilot seed present.

---

## FIXED THIS SESSION (were BROKEN)

1. **`/jamb/{name}/domains` — was MISSING** (5,573 rows seeded, no read path → student entry point dead). Added endpoint + `getJambDomains()` client. ✅
2. **`/programmes/{id}` hard-coded `domains:[]`** (2,528 links never read). Rewrote to join programme_domain → domains. ✅
3. **Malformed migration SQL** (`migration_career_v2.sql:170-172` — `in_demand_score`/`elite_flag` never created). Fixed to valid ALTER TABLE. ✅
4. **Admin guard** — `Auth.require_admin` added; gates `GET /api/feedback`. ✅
5. **ReviewModal → `/api/feedback`** dual-write; routed `FeedbackInboxScreen` at `app/(admin)/feedback.tsx` + AdminShell nav. ✅

---

## TOP REMAINING GAPS (ranked, NOT yet built/wired)

### Backend / data
1. **Phase 4b enrichment is a <1% sample, not a build** — official_url/price/seniority_tier/skill_url/tool_url/demand_score/currency exist only in `_enrichment/*.csv` at 19/15/45/39 rows vs 508 certs, 7,393 tools, 4,092 roles. Columns + read paths built; data near-empty. **Biggest data gap.**
2. **No demand ingestion** — `fetch_labour_market_demand` is a scheduled no-op (imports a `demand_ingest` module that doesn't exist). `domain_demand_metrics`/`role_demand_metrics` tables defined only in the *superseded* `migration_career_intelligence.sql`; v2's DROP CASCADE + runbook omission means they likely won't exist live. (Plan says deferred.)
3. **Elite composite inert** — `compute_elite_composite` fully coded + scheduled but reads empty demand tables → nothing ever flagged; `elite_status` stays 'deferred'.
4. **Institutions admin dashboard ~90% stubbed** — only `/me/vs-national` real; 10 endpoints (summary, programme-demand, domain-ranking, skills-gap, role-demand, peers, alerts, affiliation, me, verify) are TODO/coming_soon.
5. **Career user-owned writes are no-op stubs** — `/saved`, `/notes`, `/subscriptions` in career_routes return coming_soon, perform no writes → My World can't persist.
6. **7 zero-feeder domains** (vocational trades: Hairdressing, Beauty, Funeral, Plumbing, Painting, Printing, Glass/Ceramics) — need TVET feeders or explicit no-programme policy.
7. **Lightcast & ISIC5 never ingested; WEF/O*NET partial** — frontier roles rest on curated_creative hand-entry.
8. **`/pivot/gap` (B1/B2 gap analysis) missing** — CareerChanger B1/B2 scenarios have no backend.

### Frontend (built-but-orphaned / not wired)
9. **My World shows stubbed data** — getSavedItems/getAllNotes return comingSoon (blocked by #5).
10. **Phase 10–13 shells orphaned** — InfoTooltip, CoachMark, NotesFab, careerCache all built but imported by no screen.
11. **Auditor surfaces orphaned** — MappingFeedbackButton on no card; ExpertDossierScreen has a nav entry but no `app/(admin)/` route file.
12. **RoleCard missing readiness + tier badges** — ReadinessBadgeView/TierBadgeView exist but not on RoleCard.
13. **SkillsBridge (3-tier) on no screen** — component exists, imported nowhere.
14. **Analytics never captured** — trackEvent defined, called nowhere; not consent-gated.
15. **Student explorer filters missing** — no salary/domain/in-demand filter UI on Explore.

---

## Recommended next build order
1. Seed the DB (run migrations + seed_career_v2.sql + seed_career_pilot.sql) — unlocks everything above the read API.
2. Wire career user-owned writes (#5) → unlocks My World (#9).
3. Scale Phase-4b enrichment (#1) — biggest per-effort UI payoff.
4. Wire orphaned frontend (#10–15) — mostly small, high-visibility.
5. Institutions dashboard endpoints (#4) + demand ingestion (#2) — the market-intelligence layer, larger effort.
