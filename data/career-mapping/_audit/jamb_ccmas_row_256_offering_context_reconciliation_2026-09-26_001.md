# JAMB row 256 — Fisheries offering-context reconciliation

**Checkpoint:** 2026-09-26, increment 001. **Scope:** canonical JAMB identity row 256 (`Fisheries`) only; JAMB source occurrences and exact institution cells only. **Mode:** source audit, no shared data changes. No CCMAS scope, domain, subgroup, role, mapping, seed, SQL, or source record was edited.

## Prior evidence checked first; no-repeat boundary

The prior row coverage is in [`jamb_ccmas_coverage_matrix_rows_141_280_2026-09-26_001.md`](jamb_ccmas_coverage_matrix_rows_141_280_2026-09-26_001.md), row 256, and its cited checkpoints:

- [`jamb_ccmas_authoritative_followup_rows_141_280_2026-09-26_012.md`](jamb_ccmas_authoritative_followup_rows_141_280_2026-09-26_012.md) already verified the distinct **Sciences** occurrence at JAMB Sciences brochure printed p. 521: **OAUSTECH, LAGOS**. That check is carried forward as completed; it was not re-opened or repeated here.
- `jamb_ccmas_mapping_quality_2026-09-24/agent-02-increment-022-rows-247-256-component-link-triage-2026-09-25.md` records two parsed source occurrences: Agriculture source `agriculture.txt`, parsed row ordinal 4, occurrence `cb2b468b8ac8c364`; and Sciences source `Sciences.pdf`, ordinal 78, occurrence `436facfa0dbef724`. It explicitly marked both parsed lists unverified at that time.
- The current offering-context inventory carries forward the Agriculture parser token set as a contaminated lead, not a source-confirmed list. The only unresolved item in this check was the exact Agriculture-faculty JAMB offering cell and its boundary/continuation.

## Official JAMB source result — Agriculture occurrence (new verification)

Primary source: [JAMB IBASS Degree Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf), accessed 2026-09-26, printed p. **86**, table headed “COURSE/DEGREE — AWARDING INSTITUTIONS.” The official indexed extraction exposes the following sequence in the awarder column:

| JAMB programme title | Institution(s) in that title’s cell | Status |
|---|---|---|
| Fisheries Management | RSU | A separate title; not row 256 `Fisheries` |
| **Fisheries** | **BENIN; CALABAR; CRUTECH; DELSU; EKSU; IBADAN; KSUSTA; KWASU; LAPAI; LASU; MAIDUGURI; MAUTY; NDU; NASARAWA; OOU; OAUSTECH; PHC; UDU** | **Exact Agriculture-faculty cell verified; 18 institutions** |
| Water Resources, … | Starts after the Fisheries list in the extracted table sequence | Adjacent next programme heading, not an additional Fisheries institution |

The official search-index text places “FISHERIES MANAGEMENT / RSU” before the separate “FISHERIES” title and its 18-institution list, then “WATER RESOURCES” after UDU. The title boundary matters: **RSU is verified for Fisheries Management here, not for row 256’s Fisheries cell.** The cell’s last visible row-256 institution is UDU; the following Water Resources heading is not part of the Fisheries institution list. The PDF reader in this environment returns the IBASS JavaScript shell rather than a page image, so the precise table sequence is taken from the official JAMB indexed PDF extraction; the readable table transcription at the non-authoritative [Myschoolgist copy](https://myschoolgist.com/wp-content/uploads/2026/01/JAMB-Brochure-University-Faculty-of-Agric.pdf) was used only to cross-check the adjacent title/cell boundary, not as authority for the institution list.

## Preserve the two faculty contexts separately

| Occurrence | Faculty/source | Verified JAMB title and institution association | Evidence disposition |
|---|---|---|---|
| Agriculture | JAMB Agriculture brochure, printed p. 86 | `Fisheries` — 18 institutions listed above | Newly verified in this checkpoint |
| Sciences | JAMB Sciences brochure, printed p. 521 | `Fisheries` — OAUSTECH, LAGOS | Previously verified in checkpoint 012; carried forward, not rechecked |

OAUSTECH appears in both independently listed faculty contexts; retain two source occurrences rather than deduplicating them. Do not transfer the Agriculture institution list into Sciences or the Sciences list into Agriculture. The separate `Fisheries Management — RSU` context is also not merged into either row-256 `Fisheries` cell.

## Parsed-inventory reconciliation

The Agriculture parsed token list did not reliably preserve the JAMB cell boundary. It omits many verified Agriculture-cell institutions and includes tokens not in that cell. Exact overlaps between the parsed set and the verified Agriculture cell are **CALABAR, IBADAN, KWASU**; the parser also has `RSU`, but that token belongs to the adjacent distinct `Fisheries Management` title on the source page. `MINNA` appears in the printed page’s special-consideration text, not in the verified Fisheries awarder cell. Other parsed tokens not in the verified list are not promoted as row-256 Fisheries institutions; their precise neighboring-source provenance is not adjudicated in this checkpoint.

The Sciences parsed list `OAUSTECH, LAGOS` agrees with the previously verified Sciences cell in checkpoint 012. No new Sciences source claim is made here.

## Result and remaining work

- **New:** Agriculture-faculty JAMB offering cell for row 256 verified, including the full ordered institution list (18), printed p. 86, and the distinction from adjacent `Fisheries Management — RSU` and `Water Resources` headings.
- **Previously covered, not repeated:** Sciences-faculty cell `Fisheries — OAUSTECH, LAGOS`, printed p. 521 (checkpoint 012).
- **Source-context status:** both distinct faculty occurrences are now confirmed as separate records; OAUSTECH legitimately occurs in both cells.
- **Not assessed:** course applicability by institution, CCMAS/curriculum scope or outcomes, external curriculum, and all downstream/domain/subgroup/role mappings. These remain outside this check.

**Coverage:** row 256 has **2/2 parsed faculty occurrences source-reconciled** (Agriculture new; Sciences previously verified). This closes only the assigned row’s JAMB occurrence-cell question, not the broader curriculum audit or rows 141–280.
