# Domain & Role Library Audit — Phase 1

Audited the 165-domain / 7,736-role `sifter_role_library_v2` against the unified occupation
graph (3,115 nodes: ESCO 3,039 + O*NET, ISCO-keyed, Bright-Outlook flagged) built in Phase 0.
Nothing in the current library/definitions is assumed correct.

## Method
- ISCO sub-major coverage diff (library vs graph)
- Name/aka/alt-title match of every scorable ESCO occupation vs library
- Direct probe of graph for emerging/creative terms
- Role fan-out (same role across many domains), domain ISCO-spread (split candidates),
  domain-name theme overlap (merge candidates), empty-skill roles (data quality)

## FINDINGS

### F1 — The library has near-complete NAME coverage of ESCO/O*NET high-value bands
Only **53 / 3,039** scorable ESCO occupations are absent from the library by name — and
**0** of them are in the high-value ICT/science/business ISCO bands (21/24/25). The missing 53
cluster in elementary/manual labour (ISCO 91–96) and traditional handicrafts (piano maker,
curing-room worker). So "missing standard occupations" is NOT the main problem.

### F2 — The REAL gaps are frontier roles absent from ESCO/O*NET *themselves*
The graph (ESCO+O*NET) already contains, and the library largely has: gameplay engineer,
technical artist, narrative designer, quantitative researcher, ML engineer, content creator,
esports competitor, DevOps, SRE, cloud architect. But these are ABSENT from every taxonomy
(ESCO/O*NET/graph) and must be curated from creative sources:
- **VR / AR / XR / mixed reality / metaverse** — entirely absent (confirmed earlier: 0 roles)
- **live-ops (games)**, **streamer**, **spatial audio / game audio**
- **prompt engineer**, **generative-AI engineer** (Lightcast v7 has these)
→ FIX: WebFetch + normalize onto ISCO + ESCO-nearest skills, provenance `curated_creative`
  (per user decision, done per-gap in Phase 1). New domains likely needed: XR/Immersive,
  Esports & Creator Economy; expand D139 Game Design with modern variants; expand D153 audio.

### F3 — Role over-fanout (dilution risk): 159 roles appear in ≥6 domains
e.g. "industrial engineer", "process engineer", "manufacturing engineer" each in **19 domains**;
"ict test analyst" in 14. Some legitimate (a process engineer does span oil/food/chemical), some
are mechanical over-fanout that dilutes relevance. NEEDS per-role adjudication: keep where the
programme feeder + skill overlap is real; trim where it's a generic tag.

### F4 — Domain SPLIT candidates (span 6+ ISCO sub-majors, 40+ roles)
D042 Media Production (creatives + technicians + assemblers), D053 Hospitality (managers +
service workers), D107 Leather (11 sub-majors!), D075 Fashion, D111 Textile, D047 Ag Science.
NOTE per user's own D11 analysis: mixing seniority/work-type is usually a **sub-group** problem
(Phase 4 ISCO-derived clusters), NOT automatically a domain split. Adjudicate: split only when
two genuinely different professional fields share one domain; else sub-group.

### F5 — Domain MERGE candidates (theme overlap)
- D027 Biomedical vs D138 Biomedical Engineering — likely overlap/merge or clarify boundary
- D059 Space Technology vs D132 Space Science, Exploration — overlap
- D047 Agricultural Science vs D096 Agricultural — overlap
- D055 Chemical Engineering vs D110 Chemical, Rubber — boundary
- D075 Fashion,Textiles vs D160 Fashion Styling — boundary
- D078 Social Sciences vs D046 Social Work vs D128 Social Welfare — boundary
- D016 Electrical vs D093 Electrical Installation vs D094 Electronics Servicing (academic vs trade — may be intentional tiering)
Adjudicate each: merge, clarify boundary, or keep (intentional academic-vs-vocational tier).

### F6 — Data quality: 0 empty-skill roles (good). Armed-forces (ISCO 01/02/03) has graph
occupations but library shows 0 in those sub-majors — check D129 Military/Defence coverage.
ISCO 95/96 (street sales, refuse) absent — likely out of scope for a university platform
(revisit only for the Nigeria informal-sector overlay).

## STILL TO DO IN PHASE 1 (comprehensive pass)
1. Per-domain role review (agents): for each of 165 domains, is every role correctly placed,
   any missing role that belongs, any that should move out. Adversarially verified.
2. Creative-gap fills (F2): WebFetch game-dev/XR/audio/esports/Lightcast, normalize, add.
3. Split/merge adjudication (F4/F5): decide each with graph evidence; propose final domain set.
4. Fan-out trim (F3): rule for max domains per role + trim generic tags.
5. Produce the FINAL proposed domain list (added/split/merged/renamed) + role deltas, each
   with a taxonomy citation. Gate: every change justified; no silent edits.
