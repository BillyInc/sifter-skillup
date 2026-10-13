# Partition 02 — increment 008: inventory checkpoint, rows 147–156

Checkpoint time: 2026-09-25 (Africa/Lagos). This is an append-only inventory checkpoint; substantive course/outcome and relationship decisions remain open. It follows the existing agent-02 evidence review and focused increments 003–007. No canonical maps, scope JSON, seeds, or SQL were edited.

## Scope and inventory

The row numbers below are 1-based positions in the canonical 420-row `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`, sorted by the canonical `jamb_name` order represented in that artifact. The paired `programme_mapping.json` position and exact-name `jamb_domain_map.json` links were checked locally. Domain-link counts/tier labels are snapshot inventory only, not validation.

| Row | JAMB identity | Source faculty / CCMAS code | Saved curriculum scope | Selected course rows | Active domain links (ID:tier) |
|---:|---|---|---|---:|---|
| 147 | COMPUTER WITH STATISTICS | Sciences / STA | Sciences::Statistics; partial_scope_reviewed | 17 | D009:functional, D002:functional, D014:functional, D003:functional |
| 148 | METEOROLOGY AND CLIMATE CHANGE | Sciences / MET | Sciences::Meteorology; partial_scope_reviewed | 16 | D144:direct, D041:functional, D059:functional, D072:functional, D047:functional |
| 149 | Pure Chemistry | Sciences / CHM | Sciences::Chemistry; partial_scope_reviewed | 22 | D041:functional, D155:functional, D141:functional, D020:functional, D055:functional, D025:functional, D122:adjacent |
| 150 | Applied Chemistry | Sciences / CHM | Sciences::Chemistry; partial_scope_reviewed | 23 | D041:functional, D155:functional, D141:functional, D020:functional, D055:functional, D025:functional, D122:adjacent |
| 151 | Biostatistics | Sciences / STA | Sciences::Statistics; partial_scope_reviewed | 24 | D009:functional, D002:functional, D014:functional, D003:functional |
| 152 | Statistics and Data Sciences | Sciences / DTS | Computing::Data Science; partial_scope_reviewed | 11 | D003:direct, D009:functional, D001:functional, D002:functional, D033:functional |
| 153 | Data Science and Analytics | Sciences / DTS | Computing::Data Science; partial_scope_reviewed | 11 | D003:direct, D009:functional, D001:functional, D002:functional, D033:functional |
| 154 | Marine Science | Sciences / MSE | Sciences::Marine Science; full (no selected JAMB-scope course slice) | 0 | D134:direct, D041:functional, D072:functional, D144:adjacent, D020:functional, D142:functional, D120:functional, D076:functional |
| 155 | INFORMATION TECHNOLOGY AND HEALTH INFORMATICS | Sciences / IFT | Computing::Information Technology; partial_scope_reviewed | 7 | D008:functional |
| 156 | MANAGEMENT INFORMATION SYSTEM | Sciences / INS | Computing::Information Systems; partial_scope_reviewed | 9 | D002:functional, D009:functional, D003:functional, D007:functional, D032:functional, D033:functional |

## Checkpoint state

- Inventory checkpoint covers 10 consecutive identities (147–156); next untouched identity for this systematic pass is row 157.
- This is not a substantive row-clearance claim. Each course list still needs component/content/outcome comparison; each displayed domain tier and its downstream subgroup/role fit needs its own evidence-based disposition. Row 154 is a full-parent scope, so the empty selected-course array is not treated as an empty CCMAS curriculum, but it leaves no JAMB-specific course locator in this artifact.
- Exact offering/institution contexts, programme-source locators, course-outcome details, and verified external sources/links are to be appended in the evidence continuation after targeted source review. Preserve distinct faculty/institution source occurrences rather than collapsing them by programme-name similarity.
- Previously recorded systematic locator lane: rows 141–280 have 167/946 scope-domain links without JAMB-specific course-title locators; five zero-course combined scopes (245, 248, 266, 267, 279) already have focused checkpoints and are not redone here. Locator presence/absence alone does not establish semantic support.

## Local inputs read for this inventory

- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json` (rows 147–156)
- `data/career-mapping/programme_mapping.json` (same positions: faculty and CCMAS code)
- `data/career-mapping/jamb_domain_map.json` (exact-name active link IDs and tier labels)
- Existing partition-02 audit trail, especially `agent-02-rows-141-280-evidence-review-2026-09-24.md`, `agent-02-increment-006-rows-141-280-authoritative-component-recheck-2026-09-25.md`, and `coordinator-increment-007-rows-145-146-and-active-map-reconciliation-2026-09-25.md`.
