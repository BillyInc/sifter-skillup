# JAMB Sciences lane C checkpoint 009

**Date:** 2026-09-28 (Africa/Lagos)  
**Lane:** JAMB offering-source verification, Sciences brochure  
**Status:** occurrences 141–160 reviewed; 19 source-confirmed, 1 explicit evidence hold  
**Previous checkpoint:** `jamb_sciences_lane_c_checkpoint_2026-09-28_008.md`  
**Official source:** [IBASS Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf)  
**Source access date:** 2026-09-28

## Increment result

This increment checked each catalogue occurrence against the Sciences faculty
section and the exact programme/degree plus awarding-institution cell. Split
headings were matched only where the title continuation and institution code
were both visible. The visually separate geology, ecology, and plant-science
variants were preserved as separate offerings. Admission-requirement cells
that were blank or shared were not reconstructed as part of this title/source
audit.

| Result | Increment | Sciences catalogue after increment |
|---|---:|---:|
| Source-confirmed occurrences | **19** | **148 verified** |
| Explicit evidence hold | **1** | **13 explicit holds** |
| Remaining unreviewed occurrences | **26** | **26 unreviewed** |
| Total Sciences occurrences | **20 in this slice** | **187 total** |

Evidence hold:

- `Geography and Environmental Management` / GOUU: the checked-in extraction
  of the current official Sciences brochure did not establish this exact
  programme-and-awarder cell. A historical third-party copy appeared in
  search, but it is not enough to confirm the current IBASS source context.
  This remains held for exact official-source verification, not marked
  unavailable.

No URL or source locator was promoted for the held occurrence. The source
offering identity and institution were preserved.

## Evidence windows

The faculty header at `Sciences.txt:3-6` identifies the Faculty/School/College
of Science section. The source-confirmed title/awarder windows are:

| Row | Exact offering title — institution | Source locator |
|---:|---|---|
| 141 | Food Science & Nutrition — EKSU | `3029-3031` |
| 142 | Geological Sciences — UNIZIK | `3729-3730` |
| 143 | Geology and Mineral Sciences — CRAWFORD | `3732-3734` |
| 144 | Geology and Geophysics — AEFUNA | `3736-3738` |
| 145 | Geology and Applied Geophysics — HENSARD | `3740-3742` |
| 146 | Geology and Petroleum Studies — WESTERN-DEL | `3784-3786` |
| 147 | Geology and Mineral Science — KWASU | `3792-3794` |
| 148 | Marine Geology — MARITIME-UNI | `3796-3797` |
| 150 | Building Technology — KASU | `4246-4247` |
| 151 | Statistics with Demography — GOUU | `4463-4465` |
| 152 | Digital Entrepreneurship — CCU | `4529-4531` |
| 153 | Botany and Ecological Studies — UYO | `4845-4848` |
| 154 | Plant Science and Forestry — EKSU | official IBASS indexed PDF text, printed p. 548 |
| 155 | Plant Science and Microbiology — WESTERN-DEL | official IBASS indexed PDF text, printed p. 548 |
| 156 | Biotechnology and Food Technology — LASUSTECH | `5072-5074` |
| 157 | Ecology — BAUCHI | `5083-5084` |
| 158 | Applied Ecology — BAUCHI | `5094-5095` |
| 159 | Ecology and Environmental Studies — JABU | `5097-5100` |
| 160 | Textile Science and Technology — ABU | `5281-5284` |

The two plant-science rows on printed p. 548 were confirmed from the official
IBASS indexed PDF text, which shows each exact programme heading beside its
awarding institution. They are not inferred from the surrounding generic
Plant Science entry.

## Scope guard and next boundary

Only Sciences occurrences 141–160 in `sciences_offerings.json`, this
checkpoint and the focused regression test were edited. Earlier occurrences
were not revisited. CCMAS curricula/scopes, downstream mappings, taxonomy,
seeds, SQL and UI remain out of scope. Next boundary: occurrence **161**.
