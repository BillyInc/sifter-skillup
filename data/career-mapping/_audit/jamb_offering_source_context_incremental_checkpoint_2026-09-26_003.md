# JAMB offering/source-context incremental checkpoint 003

**Date:** 2026-09-26 (Africa/Lagos)  
**Mode:** audit-only, append-only checkpoint  
**Scope:** full 420-identity JAMB offering/source-context reconciliation.  
**No shared source, mapping, scope, seed, downstream, or UI file was edited.**

## Reconciliation inputs

- `data/career-mapping/_audit/jamb_offering_source_context_incremental_checkpoint_2026-09-26_002.md`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/jamb_brochure_source_audit_2026-08-17.json`
- all 9 files matching `data/career-mapping/jamb/*_offerings.json`
- all 9 extracted brochure files under `data/career-mapping/_jamb_txt/`

## Catalogue-wide comparison counts

| Check | Count | Status |
|---|---:|---|
| Canonical identities | **420/420** | Covered |
| Parsed offering rows | **441** | Covered |
| Manual source-confirmed occurrences | **1** | Preserved separately |
| Total occurrence records | **442** | Not name-collapsed |
| Parsed rows with direct source-catalogue corroboration | **419** | Catalogue corroboration only; not exact awarder-cell verification |
| Parsed rows with declared source alias corroboration | **14** | Alias evidence; exact row/cell still needs confirmation |
| Parsed rows with no matching source-audit hit | **8** | Candidate queue, listed below |
| Parsed rows with no exact normalized hit in extracted text | **103** | Wrapped, typo, alias, or cell-boundary review queue; not automatically stale |
| Parsed rows with duplicate institution tokens | **1** | Confirmed in checkpoint 002 (`Sociology` → duplicate `UDU`) |

The 419/14/8 comparison is against the older catalogue-name audit and is not
being used as a substitute for a source-cell check. It is useful for finding
false negatives and missing-context leads without reopening closed rows.

## Newly resolved source-text false negatives

### OCC-003-A — `Environmental Science and Technology` is present under a source typo

- **Status:** **confirmed source offering; source spelling defect, not a missing occurrence**
- **Parsed record:** `data/career-mapping/jamb/sciences_offerings.json`,
  `programmes[165]` (1-based); institution `WESLEYUNI`
- **Source text:** the extracted Sciences brochure places the cell as
  `ENVRIONMENTAL / SCIENCE AND / TECHNOLOGY / WESLEYUNI`; the source has the
  typographical `ENVRIONMENTAL` spelling.
- **Locator:** `data/career-mapping/_jamb_txt/Sciences.txt:5491-5505`
- **Evidence URL:**
  [official JAMB Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf)
- **Access date:** 2026-09-26
- **Repair recommendation:** retain the canonical display identity
  `Environmental Science and Technology`, add a source-original title field or
  explicit alias confirmation for `ENVRIONMENTAL SCIENCE AND TECHNOLOGY`, and
  preserve `WESLEYUNI` as the row-specific institution. Do not replace it with
  the separate `Environmental Management and Technology` or
  `Environmental Management and Toxicology` contexts.

### OCC-003-B — `Information and Media Technology` is present in the Sciences table

- **Status:** **confirmed source offering; extracted cell crosses a page break**
- **Parsed record:** `data/career-mapping/jamb/sciences_offerings.json`,
  `programmes[95]` (1-based); institution `MINNA`
- **Source text:** the source block begins with `INFORMATION AND` at line 9463,
  continues across the page break as `MEDIA TECHNOLOGY / MINNA` at lines
  9471-9472, and is followed by distinct `INFORMATION AND MEDIA SCIENCE /
  KOLADAISI` and `INFORMATION SCIENCE / UNIOSUN` rows.
- **Locator:** `data/career-mapping/_jamb_txt/Sciences.txt:9441-9479`
- **Evidence URL:**
  [official JAMB Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf)
- **Access date:** 2026-09-26
- **Repair recommendation:** retain the Sciences occurrence as a distinct
  `Information and Media Technology — MINNA` row and record the page-break
  locator. A separate Engineering-brochure requirements mention for Minna is
  not, by itself, proof of a second awarder-cell occurrence; keep it as a
  candidate until its exact institution-bearing cell is captured.

## Confirmed source-context contamination carried forward

### OCC-CARRY-003-A — Meteorology row contains adjacent programme text

- **Status:** **confirmed parser/source-boundary contamination; carried forward,
  not a new duplicate finding**
- **Parsed record:** `data/career-mapping/jamb/engineering_offerings.json`,
  `programmes[22]` (1-based)
- **Observed tokens:** `FUTA`, `UMYUK`, `MINNA`, followed by
  `METEOROLOGY AND`, `CLIMATE CHANGE`, `MARITIME-UNI`, `NUTRITION`,
  `DIETETICS`, `LAUTECH`, and `WESLEYUNI`.
- **Source locator:** `data/career-mapping/_jamb_txt/engineering.txt:6489-6545`
- **Evidence URL:**
  [official JAMB Engineering brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf)
- **Access date:** 2026-09-26
- **Repair recommendation:** split `Meteorology` from the adjacent
  `Meteorology and Climate Change`, `Nutrition and Dietetics`, and `Hotel
  Management and Tourism` cells. Retain only institution codes supported by
  the exact Meteorology row; do not infer the split from the current array.

### OCC-CARRY-003-B — `Environmental Management and Technology` remains a wording collision

- **Status:** **candidate/open; already documented, not reclassified here**
- **Parsed record:** `data/career-mapping/jamb/agriculture_offerings.json`,
  `programmes[28]` (1-based); institutions `FUNAAB`, `KWASU`
- **Source locator:** `data/career-mapping/_jamb_txt/agriculture.txt:2568-2577`
  shows `ENVIRONMENTAL MANAGEMENT AND TOXICOLOGY` for FUNAAB/KWASU and a
  separate `ENVIRONMENTAL MANAGEMENT AND POLLUTION CONTROL` row for
  MARITIME-UNI. The exact canonical wording is not established by this cell.
- **Evidence URL:**
  [official JAMB Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf)
- **Access date:** 2026-09-26
- **Repair recommendation:** preserve the three lexical contexts separately;
  recover the exact awarder cell for the canonical JAMB identity before
  changing its institution list. Do not silently rename or merge the rows.

## Eight no-hit rows and disposition

The older source-audit join returns no same-faculty catalogue hit for these
parsed rows. Existing checkpoints already cover most of them; they remain
evidence queues rather than new confirmed omissions:

| Parsed record | Current disposition | Recommendation |
|---|---|---|
| Agriculture `Environmental Management and Technology` | Existing wording-collision queue | Resolve exact awarder cell; do not merge with Toxicology or Pollution Control |
| Arts `Anthropology` | Existing context/adjacent-row queue | Preserve IBADAN Anthropology; separate following Fulfulde/Maiduguri cells |
| Engineering `Meteorology` | Confirmed contamination above | Split adjacent programme text and institution tokens |
| Sciences `Information and Media Technology` | Confirmed source row above | Add exact page-break locator; keep Sciences context distinct |
| Sciences `Environmental Science and Technology` | Confirmed source row above | Add typo alias/source-original title and retain WESLEYUNI |
| Social `LIBRARY SCIENCE` | Existing source-context queue | Verify AUE cell and do not infer it from the Social library-information row |
| Social `LIBRARY AND INFORMATION SCIENCE` | Existing source-context queue | Verify the Social/Management institution cell separately from Sciences/Education contexts |
| Sciences `LIBRARY AND INFORMATION SCIENCE` | Existing source-context queue | Verify the Sciences institution cell separately from the other library contexts |

## Current state after this increment

- The full 420 identity keyspace and 442 occurrence records remain accounted
  for.
- Two apparent “missing source” rows were resolved as source-text line-wrap or
  source-typo cases; neither was deleted or merged.
- One duplicate institution token is confirmed and remains uncorrected because
  this audit is read-only.
- Meteorology contamination and the Environmental Management wording collision
  remain open with exact locators.
- No claim is made that all 442 occurrence cells have been visually verified;
  the inventory still requires occurrence-level URL, printed locator, and date
  reconciliation for the remaining records.

