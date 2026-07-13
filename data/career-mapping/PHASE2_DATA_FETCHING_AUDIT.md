# Phase 2 — Data-Fetching Audit (against the Domain-Mapping Plan v3)

**Purpose:** enumerate EVERY place the domain-mapping plan needs external data, list the sources it names, and audit each for **correctness** (does it exist / resolve / say what the plan claims), **comprehensiveness** (does it cover what that slot needs), and **fit** (right granularity, license, Nigeria-applicability). Then refine.

**Status legend:** ✅ verified this session · ⚠️ needs verification · ❌ wrong/stale in plan · 🔑 needs API key · 🔒 needs login · 💳 paywalled · 🌐 web-only/scrape · ⬇️ downloaded to `_prof_bodies/`

---

## A. The seven data-fetching slots in the plan

The plan needs external data in **seven distinct slots**. Each has a different source family, cadence, and license constraint. Conflating them is the main risk.

| # | Slot | Plan phase | What it feeds | Cadence |
|---|------|-----------|---------------|---------|
| 1 | **Taxonomy spine** (occupation graph) | 0 | the role universe + skills RHS | one-time + version bumps |
| 2 | **Emerging-role signal** | 0, 1, 9 | 2025/26 roles ESCO lacks | annual |
| 3 | **Professional-body role/skill enrichment** | 2b (new), 4b, 9 | missing roles + cluster/cert layer | annual |
| 4 | **Tools layer + demand re-rank** | 4.3, 7c, 9 | per-domain tools, ranked | monthly (rank) |
| 5 | **Labour-market demand** | 7 | postings/salary/trend, 3-lens | monthly |
| 6 | **Admission intelligence** | 8 | cut-offs/formula/competitiveness | annual Dec/Jan |
| 7 | **Non-university taught skills** | 9 L0 | polytechnic/NCE/nursing curricula | one-time + updates |

---

## SLOT 1 — Taxonomy spine (Phase 0)

**What the slot needs:** ESCO occupations + occupationSkillRelations, ISCO-08, O*NET 30.2, ISIC5, and the crosswalks that fuse them.

| Source | Plan claim | Audit | Fit |
|--------|-----------|-------|-----|
| ESCO v1.2.1 bundle | "28MB, occupationSkillRelations = RHS" | ⚠️ **already partly ingested** — `taxonomies/esco_occupations.json`, `esco_isco_groups.json`, `occupation_graph.json` exist from the earlier build. Verify completeness (the Phase-0 audit agent earlier couldn't confirm crosswalk match-rate). ESCO **v1.2.0/1.1.1** are the real download tags — "v1.2.1" needs confirming on esco.ec.europa.eu. | ✅ correct source, right granularity |
| ISCO-08 | spine / join key | ✅ every role already carries `isco_group` (4-digit). Confirmed in `role_library_v3.json`. | ✅ |
| O*NET 30.2 full DB | "Occupation Data, Skills, Emerging Tasks, Alternate Titles, Bright Outlook" | ⚠️ O*NET releases are **numbered by date** — 28.x/29.x/30.x exist; "30.2" must be checked at onetcenter.org/database. `onet_bright_outlook.json` exists in taxonomies/. Free, public-domain-ish (O*NET license = attribution). | ✅ fit good; **best free source for alt-titles** (helps the alias-matching problem in cross-domain roles) |
| **ESCO↔O*NET crosswalk** | "downloadable CSV/XLSX, load FIRST" | ❌ **RISK — this is the load-bearing claim and it's the weakest.** A maintained ESCO↔O*NET crosswalk is NOT a clean single official file. ESCO publishes an ISCO mapping; O*NET publishes an O*NET-SOC↔ISCO crosswalk. A direct ESCO↔O*NET link usually has to be **built via ISCO as the pivot**, not downloaded. The plan treats it as a download — verify or the "one occupation → three codes" glue is hand-built. | ⚠️ **fit questionable — most likely must be derived, not fetched** |
| O*NET-SOC↔ISCO crosswalk | downloadable | ✅ this one IS a real BLS/O*NET file (onetcenter.org/crosswalks). | ✅ |
| ISIC Rev.5 | industry axis | ⚠️ UN Stats publishes ISIC Rev.4 broadly; **Rev.5 finalized 2023** — confirm the download exists in usable form. Low priority (industry axis barely used downstream). | ⚠️ marginal fit — rarely referenced after Phase 0 |

**Slot 1 verdict:** spine sources are correct and mostly already on disk. **The one real problem is the ESCO↔O*NET crosswalk** — the plan assumes a download that probably has to be constructed via ISCO. That's the thing to resolve first because everything keys off it.

---

## SLOT 2 — Emerging-role signal (Phase 0/1/9)

| Source | Plan claim | Audit | Fit |
|--------|-----------|-------|-----|
| WEF Future of Jobs 2025 PDF | "fastest-growing/emerging & declining 2025-30" | ✅ **exists** — WEF FoJ 2025 released Jan 2025, free PDF (weforum.org). `taxonomies/wef_2025_roles.json` already extracted. | ✅ good for the emerging-role tag; ⚠️ PDF→structured is lossy, verify the extraction |
| O*NET Bright Outlook "New & Emerging" | `onetonline.org/find/bright?b=3` | ✅ real, free, revised annually. | ✅ |
| O*NET Green/Emerging | `onetcenter.org/green/emerging.html` | ⚠️ the **green occupations program is legacy** (O*NET's green initiative wound down ~2011-ish; page may be archived). Verify it still exists — if dead, WEF+Lightcast cover the green signal. | ⚠️ possibly stale |
| Lightcast Occupation Taxonomy v7 | "adds NLP/ML/Generative-AI Engineer" | 🔑 API, needs key. Taxonomy free-ish, **demand data paid + no redistribution**. | ⚠️ fit OK for role NAMES only; cannot redistribute |

**Slot 2 verdict:** WEF + O*NET Bright Outlook cover it. Lightcast is a nice-to-have (needs key, redistribution-limited). Check the O*NET green page isn't dead.

---

## SLOT 3 — Professional-body role/skill enrichment (Phase 2b — NEW)

This is the slot your Third-Party Risk roles fall into, and the one we're actively downloading. Full source list from the *other* pasted note (the professional-body deep-dive), audited:

| Body | Covers (domains) | Access | Audit / correction |
|------|-----------------|--------|--------------------|
| **NICE Framework** | D004 Cybersecurity | ⬇️ v1.0.0 XLSX | ✅ downloaded. ❌ plan/note said v1.0.0 — **v2.0.0 (2025) is current**; get both. |
| **ENISA ECSF** | D004 + supply-chain/compliance (Third-Party Risk source) | ⬇️ Role Profiles + User Manual PDF, CC-BY 4.0 | ✅ downloaded, cleanly licensed. 12 role profiles. |
| **SFIA** | ~11 tech domains (D001-012, D056, D058, D141, D166) | 🔒 login | ❌ note said "no registration" — **WRONG, needs free login**; ❌ SFIA 8 is **legacy, SFIA 9 (2024) current**. |
| **CFA Career Skills Framework** | D011/D013/D014/D060/D062/D158/D159 finance | ⚠️ direct URL (verifying) | note's deep-link is 2022; verify it resolves. |
| **CIPD Profession Map 2024** | D028/D029/D032/D040 HR/mgmt/edu | ⚠️ direct URL (verifying) | plausible; verify the actual .pdf link. |
| **IEA Graduate Attributes 2021** | ALL engineering (D016-020, D134-136…) | ⚠️ direct URL (verifying) | one doc for all engineering — high value if it resolves. |
| **CIPS Global Standard 2021** | D034/D036 supply chain + vendor risk | ⚠️ direct URL (verifying) | the supply-chain half of Third-Party Risk. |
| **IEEE SWEBOK v4 (2024)** | D001 + AI/cyber intersections | ⚠️ may be form-gated | verify free PDF vs form. |
| **IAPP CIPM/CIPP BoK** | D037/D038 privacy/compliance | ⚠️ direct URL (verifying) | |
| **WHO UHC competency** | D023-025/D124 health | ⚠️ direct URL (verifying) | free, CC. |
| **GRI Standards** | D020/D047/D118-121 sustainability | ⚠️ XBRL/PDF | ESG Analyst source. |
| **ACCA / CIMA** | D015 accounting | ⚠️ direct URL | |
| **IIBA BA Competency v4 preview** | D033/D010 | ⚠️ preview only | full BABOK 💳. |
| **RICS APC** | D021/D051/D052/D156 built env | ⚠️ 4 separate PDFs | |
| **IEMA, TCFD, AMIA, PMI Talent Triangle** | env / climate / health-informatics / PM | ⚠️ direct URLs | PMBOK full is 💳; Talent Triangle free. |
| GARP FRM, ACFE, HIMSS, SPE, IAB, PRCA | risk / fraud / health-IT / oil&gas / marketing / PR | 🌐 web-only | no single file — scrape or skip. |
| PMBOK, full BABOK, full SCOR | PM / BA / supply chain | 💳 paywalled | plan around. |

**Slot 3 verdict:** the source list is **substantially correct and high-value**, with **three factual corrections** (SFIA needs login + SFIA 9 current; NICE v2 supersedes v1). Coverage is ~130/168 domains; the ~38 creative/vocational/craft/agri domains have **no professional body** → they fall to Slot 5 (job postings). **Fit caveat:** these docs give role NAMES + competency prose, NOT ESCO-style atomic skill lists — so each extracted role still needs its skills normalized onto the ESCO vocabulary (the plan's "normalize to (ISCO, ESCO-skills, provenance)" invariant). That's real per-role work, not a bulk import.

---

## SLOT 4 — Tools layer + demand re-rank (Phase 4.3 / 7c / 9)

| Source | Plan claim | Audit | Fit |
|--------|-----------|-------|-----|
| O*NET Technology Skills (Hot/In-Demand) | tools spine, "77% role match" | ✅ **already built** → `domain_tools.json`, 167/168 domains, TF-IDF ranked. | ✅ done |
| StackOverflow Developer Survey CSV | dev-tool demand rank, ODbL | ✅ real, free, ODbL (redistributable w/ attribution). Annual. | ✅ good fit, license-safe |
| GitHub Innovation Graph | per-economy incl. NG language trend | ✅ real, free, quarterly, **has Nigeria**. | ✅ **one of very few sources with real NG signal** |
| Adzuna count (creative tools) | Unity/Unreal/Blender freq | 🔑 trial key, **no NG on free tier** | ⚠️ SA proxy only until licensed |
| Lightcast Open Skills | normalize tool/cert names | 🔑 taxonomy free, internal-only | ⚠️ can't redistribute |
| AVOID: JetBrains survey (non-commercial), pytrends (archived) | — | ✅ correct to avoid | — |

**Slot 4 verdict:** tools already seeded; the re-rank sources are correct and the **license discipline is sound** (ODbL/GitHub redistributable, Lightcast/Adzuna reference-only). GitHub Innovation Graph is the standout for NG.

---

## SLOT 5 — Labour-market demand (Phase 7) — the hardest slot

| Source | Plan claim | Audit | Fit |
|--------|-----------|-------|-----|
| MyJobMag RSS | "the one automatable NG feed" | ⚠️ **verify feeds still live** (myjobmag.com/feeds) — RSS feeds rot. Core of the NG trend. | ✅ if live, best free NG option |
| Jooble `totalCount` | free GUID key, incl NG | 🔑 free key. ⚠️ verify NG coverage + that totalCount is exposed. | ✅ good for aggregate counts |
| Careerjet `hits` | NG locale | 🔑 free-ish, ⚠️ "NG locale needs live test" (plan admits). | ⚠️ unverified |
| JSearch | salary spot-checks, 100/mo | 🔑 RapidAPI free tier. | ✅ fit for salary sampling |
| Adzuna history/histogram | global trend + salary | 🔑 14-day commercial trial, **NO Nigeria** | ⚠️ prototype-only until licensed |
| BLS OEWS XLSX | remote-$ anchor, public domain | ✅ real, free, redistributable. US only (= remote-$ proxy). | ✅ license-safe core |
| Robert Walters Africa Salary Survey | NG-named role-level, free PDF | ⚠️ verify current-year PDF exists; **reference-only, not redistributable**. | ✅ best NG-local salary anchor |
| Levels.fyi / Numbeo / ILOSTAT / World Bank / NSIWC | tech comp / COL / context / public-sector ₦ | mixed | ILOSTAT+WorldBank ✅ CC-BY redistributable; Levels/Numbeo reference-only; NSIWC ✅ public. |

**Slot 5 verdict:** the plan is **honest and correct** that no free source publishes NG-postings-over-time, so it builds its OWN trend by polling aggregate counts. The **redistributable-core vs reference-only split is architecturally right and must be enforced with the `redistributable` flag** (already a column in `domain_demand_metrics`). Biggest risks: MyJobMag RSS liveness, and Adzuna's no-Nigeria limit forcing a licence before any real NG global-trend.

---

## SLOT 6 — Admission intelligence (Phase 8)

| Source | Plan claim | Audit | Fit |
|--------|-----------|-------|-----|
| Per-school×programme cut-offs | "scrape/manual, no API, ~50-150 schools" | ✅ plan is **correct that this is manual** — no API exists. Pilot CSVs already seeded (21 cutoffs). | ✅ honest; the compile is the work |
| National JAMB floor | 150 univ | ✅ public, stable. Seeded. | ✅ |
| School aggregate formula | JAMB%/PostUTME%/O'level% | ✅ published per-school. Seeded (20). | ✅ |
| Course competitiveness | "national broad-course only; per-school applied/admitted does NOT exist" | ✅ **correct and important** — plan explicitly refuses to promise data that doesn't exist (JAMB 2015-19 only). | ✅ intellectually honest |

**Slot 6 verdict:** fully correct, appropriately scoped, honest about what's unobtainable. Only work is expanding the manual compile from pilot to national.

---

## SLOT 7 — Non-university taught skills (Phase 9 L0)

| Source | Plan claim | Audit | Fit |
|--------|-----------|-------|-----|
| Polytechnic/NBTE curricula | 32 polytechnic domains | ⚠️ **no known machine-readable source** — NBTE curricula are PDFs/hardcopy. Manual extraction like CCMAS was. | ⚠️ real gap, heavy manual work |
| NCE (College of Education) | teaching domains | ⚠️ NCCE minimum standards — PDF. | ⚠️ same |
| College of Nursing | nursing domains | ⚠️ N&MCN curriculum — PDF. | ⚠️ same |

**Slot 7 verdict:** legitimately needed for the non-university institution types, but **no easy source** — it's a CCMAS-scale manual extraction project. Lowest priority / defer unless polytechnic coverage is a near-term product need.

---

## Cross-cutting findings

1. **The ESCO↔O*NET crosswalk (Slot 1) is the single riskiest "download" claim** — it's probably a derive-via-ISCO, not a fetch. Resolve first; everything keys off it.
2. **License discipline is the plan's strongest feature** — the redistributable-core (OEWS, ILOSTAT, WorldBank, StackOverflow ODbL, O*NET, GitHub) vs reference-only (Lightcast, Adzuna, Levels, Numbeo, RobertWalters) split is correct and already has schema support (`redistributable` flag). Enforce it at ingest.
3. **Three factual corrections to carry forward:** SFIA needs login + SFIA 9 supersedes 8; NICE v2.0.0 supersedes v1.0.0; O*NET green page may be dead.
4. **Fit caveat on Slot 3:** professional-body docs give role NAMES + prose, not atomic ESCO skills — each new role needs skill-normalization work (can't bulk-import). This is exactly the primary/secondary-skillset normalization from Phase 2b.
5. **Nigeria signal is scarce** — only GitHub Innovation Graph, MyJobMag RSS, RobertWalters, NSIWC, ILOSTAT give real NG data. Everything else is global/US proxy. The plan knows this (it's why demand is 3-lens and NG is an overlay).
6. **Coverage math:** Slots 1-2 (spine+emerging) already ~done on disk. Slot 3 covers ~130/168 domains; the ~38 without a professional body lean on Slot 5. Slots 5-7 are the genuinely unbuilt, high-effort remainder.

## Recommended Phase 2 build order (data-fetching)
1. **Resolve the ESCO↔O*NET crosswalk question** (derive-via-ISCO vs download) — unblocks the graph.
2. **Finish Slot 3 downloads** (in progress) + write the extraction pipeline: prof-body doc → role names → ESCO-normalized (primary/secondary) skills → role_domain rows. Prove on the 9 Third-Party Risk roles.
3. **Slot 4 re-rank** (StackOverflow + GitHub Innovation Graph — both free, NG-capable, redistributable).
4. **Slot 5 demand v1** (MyJobMag RSS liveness test → aggregate-count trend; OEWS salary; enforce `redistributable`).
5. **Slot 6** admission compile expansion (manual, annual).
6. **Slot 7** defer unless polytechnic coverage is needed near-term.
