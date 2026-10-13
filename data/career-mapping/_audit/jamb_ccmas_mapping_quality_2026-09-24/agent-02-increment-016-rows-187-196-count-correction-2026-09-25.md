# Partition 02 — increment 016: rows 187–196 count correction

Recorded 2026-09-25 (Africa/Lagos). Append-only correction to increment 015. The prior summary miscounted the snapshot delta and omitted removed IDs. No canonical map, seed, SQL, API, or UI was changed.

## Recomputed comparison

Compared each identity's domain-ID set in `data/career-mapping/_audit/jamb_domain_map_before_fail_closed_2026-09-25.json` against `data/career-mapping/jamb_domain_map.json`, using the case-sensitive canonical identity names from `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json` rows 187–196.

| Row | JAMB identity | Prior links | Current links | Removed from current | Added in current |
|---:|---|---:|---:|---|---|
| 187 | METEOROLOGY AND CLIMATE SCIENCE | 3 | 3 | — | — |
| 188 | Physics and Computer Electronic | 8 | 7 | D006, D094 | D017 |
| 189 | Physics with Solar Energy | 6 | 7 | — | D155 |
| 190 | Physics and Energy Studies | 6 | 7 | — | D155 |
| 191 | Physics with Computational Modeling | 6 | 6 | — | — |
| 192 | Physics/Astrology | 6 | 6 | — | — |
| 193 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | 10 | 9 | D006 | — |
| 194 | Physics and Applied Physics | 6 | 6 | — | — |
| 195 | Pure and Applied Physics | 6 | 6 | — | — |
| 196 | Pure Physics | 6 | 6 | — | — |
| **Total** | **10 identities** | **63** | **63** | **3 IDs removed** | **3 IDs added** |

The net link count is zero (63 → 63), not +2. The exact set changes are: removed D006 and D094 from row 188, added D017 to row 188; added D155 to rows 189 and 190; removed D006 from row 193. The current active sets are the reviewed fail-closed snapshot, not an endorsement of every link. Increment 015's claim of 66 prior / 68 current and its “one removed” summary are superseded by this correction.

## Coverage/count correction

- Rows 187–196 have detailed evidence checkpoint `agent-02-increment-015-rows-187-196-full-review-2026-09-25.md`; full identity closure remains **0/10** because source/descendant evidence gaps remain.
- Systematic tranche rows remaining after 196: **84** (197–280).
- Full-acceptance closure still required across assigned rows 141–280: **140 identities**; no prior partial locator/checkpoint tranche counts as closed.
- Source access status: **not globally blocked**. Official JAMB/NUC sources are reachable; exact JAMB table occurrences, institution curricula, several course outcomes, external item-specific learning links, and descendant-role evidence remain unverified/evidence-needed as listed in increment 015.
