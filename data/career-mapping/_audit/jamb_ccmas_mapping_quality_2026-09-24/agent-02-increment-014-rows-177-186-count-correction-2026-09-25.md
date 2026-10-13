# Partition 02 — increment 014: rows 177–186 verified count checkpoint

Recorded 2026-09-25 (Africa/Lagos), before moving to rows 187–196. This append-only count check independently recalculates link occurrences from the two saved map snapshots; it does not change the detailed evidence in increment 013.

| Row | JAMB identity | Prior snapshot links | Active/canonical links | Removed IDs | Added IDs |
|---:|---|---:|---:|---|---|
| 177 | MATHEMATICAL SCIENCES | 2 | 1 | D014 | — |
| 178 | COMPUTER SCIENCE WITH MATHEMATICS | 7 | 5 | D009, D033 | — |
| 179 | ELECTRONICS AND COMPUTER TECHNOLOGY | 7 | 5 | D009, D033 | — |
| 180 | ELECTRONICS AND COMPUTER SYSTEMS | 7 | 5 | D009, D033 | — |
| 181 | HUMAN BIOLOGY | 9 | 9 | D122 | D118 |
| 182 | APPLIED BOTANY | 3 | 4 | — | D047 |
| 183 | APPLIED BIOLOGY AND GENETICS | 10 | 9 | D122 | — |
| 184 | CELL BIOLOGY & GENETICS | 9 | 9 | D122 | D118 |
| 185 | ENGINEERING PHYSICS | 6 | 6 | — | — |
| 186 | MARINE BIOLOGY & FISHERIES | 6 | 5 | D076 | — |
| **Total** | **10 identities** | **66** | **58** | **11** | **3** |

Net change is **−8 links** (11 removed, 3 added). Set IDs and tiers were compared with `jamb_domain_map_before_fail_closed_2026-09-25.json`; the current `jamb_domain_map.json` exactly matches `jamb_domain_map_ccmas_derived_2026-08-17.json` for these ten rows. No overlay-conflict identity intersects this tranche.

**Exact coverage after checkpoint:** rows 177–186 reviewed; full closures **0/10**. Rows not yet systematically reviewed: **94 (187–280)**. Full identity closure queue remains **140/140** for rows 141–280 because earlier tranches contain partial evidence and unresolved acceptance checks. JAMB brochure and item/outcome source URLs plus locators are recorded in increment 013; exact JAMB awarding-institution table locators are still open for all ten identities.
