# FINAL DOMAIN & ROLE AUDIT — Phase 1 complete

Audited the Sifter role library (7,736 roles) + domain definitions (166 domains / 36 clusters)
against the unified occupation graph (ESCO 3,039 + O*NET, ISCO-keyed, Bright-Outlook) and the
top-down cluster taxonomies (O*NET 16 Career Clusters, GICS 11 sectors). Nothing assumed correct.

## HEADLINE
The library is a **known-incomplete, machine-joined draft** that needs a rebuild, not a touch-up.
- **The source itself flags 110 of 166 domains "PARTIAL"** (only 55 "FULL"). The authors knew.
- My independent per-domain review: **163 of 165 domains have issues; only 2 clean** (D141 Quantum, D112 Wood Processing).
- **3,234 role removals flagged (42% of the library)**, 327 adds, 7 renames, 556 over-fanout flags.

## THE 7 QUESTIONS — ANSWERED

### Q1. Is 165/166 the true domain universe?
The source defines **166 domains in 36 clusters**. The role-library JSON has only 165 populated —
**D070 Performing Arts & Entertainment is defined but has ZERO roles.** So even the source's own
list isn't fully populated. 166 is a design, not ground truth — but see Q6, it's structurally sound.

### Q2. Are esports/creatives the only missing domains?
No. Confirmed **genuinely absent even from the source's 166**: XR/VR/AR/Immersive, Esports,
Creator/Streaming → add as NEW domains (XR & Immersive Technology; Esports & Creator Economy).
Plus **D070 Performing Arts** exists but is empty. Plus dozens of domains are "present but hollow"
— their signature roles buried/absent under contamination (D145 Neuroscience had 0 neuroscientists,
D146 Building Services 71/74 wrong, D059 Space 90% aviation, D096 Agriculture ~85% machinery).

### Q3. Are roles where they belong?
No — the core finding. Built by a broad ISCO-bucket JOIN. Three systemic defects everywhere:
1. **Junk group-label rows** — 1,043 rows with `aka=NaN` (O*NET SOC titles as fake roles).
2. **Cross-domain contamination** — generic ISCO 2141/2144/2149 engineering, 2422 policy-officer,
   2635 social-work fan-out bleeding into dozens of domains.
3. **ESCO commodity/subject fan-out** — "specialised seller of X"×40, "import/export mgr in X"×25,
   "<subject> policy officer"×23.

### Q4. Sub-groups?
The source ALREADY has the grouping layer: **36 clusters over 166 domains** (extracted to
`_audit/cluster_map.json`). This is the top-of-tree. The ISCO-sub-major role sub-grouping within
a domain (the D11 analysis) is Phase 4 — deferred until domains are cleaned.

### Q5. What else to look at? (my audit's own blind spots — now closed)
- Top-down completeness ✓ (below). Definition audit ✓ (cluster+PARTIAL structure extracted).
- Skills-quality per role: NOT deeply done (placement checked, not each skill list). Recommend a pass.
- Whole-library dedup: **1,581 role names appear in ≥2 domains; 159 in ≥6** (over-fanout) — needs a cap.

### Q6. Domain split/merge — final
`_audit/out/split_merge.json`: mostly **KEEP** (apparent overlaps = different fields OR intentional
academic-vs-vocational tiers), **1 SPLIT** (D053 Hospitality), **7 renames** (D021→Architecture/
Surveying/Built Env, D044→Design & Visual Arts, D073→Library/Archive/Museum, D080→Design, etc.).

### Q7. Other domain sources — is our set complete?
**Top-down check: YES, complete at the field level.** The 36 Sifter clusters cover ALL 16 O*NET
Career Clusters and ALL 11 GICS sectors — no whole field is missing. The gaps are WITHIN clusters
(the 3 frontier domains + D070) and in POPULATION (roles), not in the cluster taxonomy.
Sources are sufficient: ESCO+O*NET+ISCO+WEF+Bright-Outlook for roles; O*NET-Clusters+GICS confirm
the domain set; creative WebFetch fills the 3 frontier gaps ESCO can't see.

## PROPOSED FINAL DOMAIN SET
- Keep the 166-domain / 36-cluster structure (validated complete top-down).
- ADD: XR & Immersive Technology; Esports & Creator Economy (→ ~168 domains).
- POPULATE: D070 Performing Arts & Entertainment (empty).
- SPLIT: D053 Hospitality. RENAME: 7 domains. MERGE: none.
- CLEAN: apply 3,234 removes (junk + contamination + fan-out) + 327 adds; net library ~4,800 roles.

## ARTIFACTS
- `_audit/deltas.json` — consolidated per-domain remove/add/rename (all 165 reviews merged)
- `_audit/out/review_*.json` — per-batch raw reviews (audit trail)
- `_audit/out/split_merge.json`, `_audit/out/creative_gaps.json` (42 new roles, 2 new domains)
- `_audit/cluster_map.json` — 36 clusters × 166 domains + FULL/PARTIAL coverage
- `_audit/_domain_defs_table.json` — source domain table (id/name/cluster/coverage)
- `taxonomies/*` — the unified occupation graph + WEF + Bright-Outlook

## NEXT (Phase 1 → apply)
1. Adversarially verify a sample of the 3,234 removes (guard against deleting real roles).
2. Skills-quality + dedup pass (Q5 residuals).
3. Build the cleaned role_library_v3 + the 36-cluster + new/renamed domains.
4. THEN Phase 2 (programme→domain skills scoring) on the CLEAN library.
