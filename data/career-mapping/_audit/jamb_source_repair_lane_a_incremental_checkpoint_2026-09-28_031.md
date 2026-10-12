# Repair lane A — source-offering reconciliation checkpoint 031

**Date/access date:** 2026-09-28 (Africa/Lagos)  
**Mode:** source audit and documentation only; no offering/source data edits  
**Resume point:** checkpoint 030  
**Scope:** unresolved Agriculture and Engineering title-awarder cells; Administration identity holds remain excluded.

## Count reconciliation before this increment

Re-read the current three offering ledgers. Counts are Administration 60 (58
`source_text_confirmed`, 2 `evidence_hold`), Agriculture 28 (20 confirmed, 8
held), and Engineering 37 (22 confirmed, 15 held): **125 total = 100 confirmed
+ 25 held**. The 2 Administration holds concern whether separately evidenced
source cells may collapse to a canonical identity; they are not missing-cell
holds and were not re-audited.

Checkpoint 030 reports 25 held overall, but describes the 24 Agriculture and
Engineering title-cell holds listed in 029 (8 + 16), in addition to the two
Administration identity holds. The current ledgers have only **23** held
Agriculture/Engineering rows (8 + 15). Thus one Engineering occurrence from
the previously stated 24 has changed disposition or is otherwise absent from
the current hold set. This increment does not guess which one; reconcile that
delta against the append-only history before declaring the source-offering
lane complete.

## Official-source retrieval and bounded query results

All three official IBASS PDFs were opened directly. The web reader returned
only the JavaScript shell (“You need to enable JavaScript to run this app.”),
not the rendered PDF. Search-engine queries restricted to the exact official
IBASS PDF URLs did expose selected indexed table excerpts. Because excerpts
may omit continuation text, only a fully visible exact row with a comparable
local list is treated as row-level evidence. No nonofficial mirror was used.

| Official source URL / title | Printed source locator | Indexed cell evidence and comparison | Disposition |
|---|---|---|---|
| [Engineering/Environmental/Technology brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf) | Food Engineering detail table, printed p. 399 (indexed page marker); programme index p. 336 | Exact title is followed by the complete visible awarder list `ILORIN; KWASU; UYO`. The current local `Food Engineering` array begins with those three but continues with many unrelated institutions/fragments (`ABU`, `CUST`, `EUI`, `FUTA`, `JOS`, `GEOLOGY AND MINING`, `ABUJA`, etc.). Exact source cell is established, but the current local array is not an exact match. | Source cell verified; local occurrence remains held pending authorized correction. No list was edited. |
| [Engineering/Environmental/Technology brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf) | Building detail table, printed p. 345; index p. 336 | Exact `BUILDING` cell is distinguishable from the adjacent `BUILDING TECHNOLOGY` cell. Excerpt shows the beginning `AAU; ABUJA; ABU; BAZE; CALEB`, then is cut off before a complete roster/possible continuations. The local list contains these plus many other institutions and title fragments. | Partial cell only; held. Do not treat the displayed prefix as complete. |
| [Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf) | Agriculture detail table, printed p. 76; index p. 75 | Exact `AGRICULTURE` heading is shown. Excerpt displays a prefix (`AAU; AAUA; ABU; ABUAD; ABUJA; AJAYI; AL-HIKMAH; AKSU; BABCOCK; BASU; BAUCHI; BENIN; BOSU; CALABAR; COOU; CUN`) and cuts off before a complete cell. Current local array contains many adjacent programme-name fragments. | Partial cell only; held. |
| [Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf) | Crop Production detail table, printed p. 111 | Exact `CROP PRODUCTION` cell is followed by the complete visible list `ADSU; BAUCHI; CRAWFORD; MAKURDI; MINNA; OOU; SALEM`; the next distinct row is `CROP, SOIL AND PEST MANAGEMENT — FUTA`. The local Crop Production row contains this seven-institution sequence plus unrelated title fragments and extra entries. | Exact source cell established; local list is not an exact match and remains held pending correction. |
| [Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf) | Plant Science details, printed p. 115 | Exact detail excerpt distinguishes `PLANT SCIENCE AND BIOTECHNOLOGY — ABSU, RSU` from `PLANT SCIENCE AND CROP PRODUCTION — JABU`. The local standalone `Plant Science` row currently associates ABSU and RSU with that shortened title. The excerpt does not substantiate a standalone `Plant Science` awarder cell. | Exact named detail cells establish a title/context mismatch; standalone row remains held, not unavailable. |

The targeted queries for the other held titles did not yield a complete exact
title-awarder cell plus all continuations. In particular, the direct PDF
renderer remained unavailable, and snippets for Civil Engineering,
Computer/Information Science, Polymer/Textile Engineering, Architecture,
Quantity Surveying, and related rows did not expose complete comparable
rosters. Those rows were not promoted based on an index or partial snippet.

## Current held rows and disposition after this increment

The live ledgers still have these 23 cell-level holds; this table records the
current unresolved rows, not a claim that they are all 24 originally stated
holds:

**Agriculture (8):** Agriculture; Biotechnology; Fisheries; Crop Production;
Forestry and Fisheries; Plant Breeding and Seed Technology; Plant Science; Farm
Management & Agric. Extension.

**Engineering (15):** Building; Civil Engineering; Computer and Information
Science; Polymer and Textile Engineering; Computer Science; Systems
Engineering; Food Engineering; Architecture; Quantity Surveying; Statistics;
Economics; Geography; Urban and Regional Planning; Industrial Design; Estate
Management.

Food Engineering and Crop Production now have exact official-cell evidence
but clear mismatches against the current local arrays; they therefore remain
correction holds. Plant Science likewise has a source-title mismatch. The remaining rows stay held
because the complete exact cell/continuations have not been retrieved in this
increment. No row is declared unavailable.

## Sources, scope, and next action

Official source URLs (accessed 2026-09-28):

- https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf
- https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf
- https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf

Continue with the 23 current Agriculture/Engineering holds and reconcile the
one-occurrence difference from checkpoint 030 against the ledger history.
Retrieve the complete official PDF rendering or item-specific indexed table
segments with all page continuations before confirming any institution list.
Keep the two Administration canonical-identity holds separate. This was an
offering-source audit only: no canonical source rows, curriculum, domain,
subgroup, role, seed, or SQL were changed.
