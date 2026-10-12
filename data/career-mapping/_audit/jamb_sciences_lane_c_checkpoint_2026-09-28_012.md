# JAMB Sciences lane C checkpoint 012 — targeted hold resolution

**Date:** 2026-09-28 (Africa/Lagos)  
**Scope:** only the three evidence holds from checkpoint 011 (occurrences 184, 185 and 187)  
**Prior checkpoint:** `jamb_sciences_lane_c_checkpoint_2026-09-28_011.md`  
**Official source searched:** [IBASS Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf)  
**Access date:** 2026-09-28

## Dispositions

| Occurrence | JAMB identity — institution | Result | Evidence and action |
|---:|---|---|---|
| 184 | Computing and Artificial Intelligence — HUSTECH | Confirmed | The official IBASS indexed Sciences table extract displays the exact title followed by HUSTECH in the same programme/awarding-institutions sequence, printed p. 624. Added item-specific source metadata to this row only. Kept the separate DELSU waiver text out of HUSTECH's institution association. |
| 185 | Computer with Electronics — LCITY | Confirmed | The same official IBASS table extract displays the exact title followed by LCITY in the same sequence, printed p. 624. Added item-specific source metadata to this row only; adjacent programme headings remain separate. |
| 187 | Robotics (Artificial Intelligence) — WIGWE | Evidence hold retained | Exact official-source pairing remains unexposed. Exact-pair and variant searches of the official IBASS Sciences PDF/index and IBASS domain did not return a verifiable title–institution cell. The official result excerpts surfaced WIGWE in the broader table context but did not expose the Robotics heading attached to it. IBASS's PDF viewer returns a JavaScript shell rather than a readable page in the web viewer. The official Wigwe programme/admission pages confirm the programme exists, but do not establish that JAMB currently lists WIGWE for this exact JAMB identity. A third-party-hosted brochure copy shows the exact pair, but was not substituted for current JAMB evidence. No absence/unavailability claim is made. |

## Search scope and decision rule

For each held pair, searched the official Sciences brochure by its exact title and institution code, exact title plus institution, and common capitalization/parenthetical variants. Also searched the official IBASS domain for the title/institution pair and related brochure-table terms, and inspected the official brochure's indexed table excerpts. This was a targeted disposition pass, not a repeat of the 187-row slice audit.

The exact current IBASS table extract is sufficient to confirm occurrences 184 and 185. Occurrence 187 remains held because current first-party JAMB evidence did not expose its exact cell. The hold is evidentiary—not a claim that the programme is absent or that no source exists.

No requirements, curriculum scope, neighboring source offerings, or other ledger rows were changed. The Robotics row's existing hold metadata is unchanged.

## Verification

Focused regression:

```text
python -m pytest data/career-mapping/_audit/test_jamb_sciences_lane_c_rows_181_187.py data/career-mapping/_audit/test_jamb_sciences_lane_c_rows_161_180.py -q
```

Expected cumulative Sciences status after this disposition: **173 source-confirmed, 14 evidence holds, 0 unreviewed** across 187 occurrences.
