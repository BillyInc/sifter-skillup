# Repair lane A — JAMB source/offering reconciliation checkpoint 032

**Date/access date:** 2026-09-28 (Africa/Lagos)  
**Mode:** official-source audit and documentation only; no source-ledger edits  
**Resume point:** checkpoint 031  
**Scope:** reconcile the Agriculture/Engineering held set, recheck source cells
identified in 031, and resolve the reported 23-vs-24 difference. The two
Administration identity holds remain a separate question.

## Count reconciliation

Read the current `administration_offerings.json`, `agriculture_offerings.json`,
and `engineering_offerings.json` programme arrays and counted row-level
`source_context_status` values. Their row totals are 60, 28, and 37 (125
altogether). The current disposition is 100 `source_text_confirmed` and 25
`evidence_hold`; there are no pending rows in these three ledgers. The holds
are:

- Administration: 2 identity/canonicalization holds; source cells themselves
  were already documented as exact in checkpoint 028.
- Agriculture: 8 cell-level holds.
- Engineering: 15 cell-level holds.

Therefore there are **23 current Agriculture/Engineering cell-level holds**,
not 24. The 24 figure in checkpoints 029–031 is not supported by their own
enumerations: the enumerated sets contain 8 Agriculture and 15 Engineering
rows, or 23. Checkpoint 030's stated total of 26 held (and 99 confirmed) is
also one off; its own enumerated rows are 2 Administration + 8 Agriculture +
15 Engineering = 25 held, which reconciles to the current 100 confirmed + 25
held across 125 rows. Checkpoint 031's 23-vs-24 explanation hypothesized a
changed/missing Engineering disposition, but no such row change is evidenced
by the current ledgers or the enumerated checkpoint tables. Treat this as a
checkpoint count/reporting error, not as an identified lost or newly promoted
occurrence. Do not silently change a ledger disposition to force the earlier
count.

## Official-source recheck and findings

Direct opening of both official IBASS brochure URLs still returns only the
JavaScript shell in the available reader. Search-indexed text restricted to
the exact official PDFs returned the following relevant exact content:

| JAMB identity / printed locator | Official-source evidence | Comparison with current held row | Disposition |
|---|---|---|---|
| Food Engineering, Engineering brochure, printed p. 399 | Indexed table displays the complete cell `ILORIN; KWASU; UYO`. | Local row begins with those three, then includes `ABU`, `CUST`, `EUI`, `FUTA`, `JOS`, `GEOLOGY AND MINING`, and `ABUJA`; that is not the exact source cell. | Source cell established; retain the correction hold. |
| Crop Production, Agriculture brochure, detail-table sequence spanning printed pp. 115–116 (index p. 75) | Indexed exact cell displays `ADSU; BAUCHI; CRAWFORD; MAKURDI; MINNA; OOU; SALEM`, followed by a distinct `CROP, SOIL AND PEST ... FUTA` title. | Local row contains the seven exact institutions plus institutions/fragments from adjacent titles. | Source cell established; retain the correction hold. |
| Plant Science, Agriculture brochure, printed p. 115 (index p. 75) | Detail cells name `PLANT SCIENCE AND BIOTECHNOLOGY — ABSU, RSU` and `PLANT SCIENCE AND CROP PRODUCTION — JABU`; the index separately lists `Plant Science`. | Local standalone `Plant Science` associates ABSU and RSU, but the detail roster supports those institutions under the longer title, not an exact standalone cell. | Title/identity mismatch remains held; do not infer standalone awarders or mark unavailable. |
| Building, Engineering brochure, printed p. 345 | Indexed exact detail separates `BUILDING TECHNOLOGY` from `BUILDING`; the Building list starts `AAU; ABUJA; ABU; BAZE; CALEB` but the excerpt is cut off. | Cannot compare a complete roster. | Held; prefix is not complete-cell evidence. |
| Computer and Information Science, Engineering brochure, printed p. 336 index; detail cell not retrieved | Official index confirms this is a distinct listed programme title. The targeted exact-title search did not return its full awarder cell. | Local list is `COMMUNICATION; ENGINEERING; BAUCHI; SUMMIT`; the first two are title fragments, not institution identities. | Title is confirmed, roster is not; hold and do not promote the two apparent institution names as a complete cell. |
| Quantity Surveying, Engineering brochure, printed p. 412 | Indexed exact heading and initial awarder sequence are visible, but the excerpt cuts off before the complete sequence/continuations. | Cannot compare a complete roster. | Held; do not promote from a partial excerpt. |

The indexed source also confirms the Agriculture programme index on printed
p. 75 lists Agriculture, Biotechnology, Crop Production, Forestry and
Fisheries, Farm Management & Agric. Extension, Fisheries, Plant Breeding and
Seed Technology, and Plant Science as distinct index titles. Index presence
establishes the title/faculty entry, not its full detail-cell roster or title
equivalence. No row was promoted based on index evidence alone.

The remaining current held rows are unchanged from checkpoint 031:

- Agriculture (8): Agriculture; Biotechnology; Fisheries; Crop Production;
  Forestry and Fisheries; Plant Breeding and Seed Technology; Plant Science;
  Farm Management & Agric. Extension.
- Engineering (15): Building; Civil Engineering; Computer and Information
  Science; Polymer and Textile Engineering; Computer Science; Systems
  Engineering; Food Engineering; Architecture; Quantity Surveying; Statistics;
  Economics; Geography; Urban and Regional Planning; Industrial Design; Estate
  Management.

This increment records all source and parsing/count findings above, regardless
of severity. It does not claim the 23 rows are all incorrect; unresolved rows
remain held until their exact source cell and continuations can be compared.

## Sources and changed paths

Official sources accessed 2026-09-28:

- Agriculture: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf
- Engineering/Environmental/Technology:
  https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf

The reader exposed only the IBASS JavaScript shell; official-PDF indexed
excerpts were used only where the complete relevant cell was visible. Partial
lists remain partial. No source/offering JSON, requirements, associations,
curriculum, mappings, seeds, or SQL were changed. This checkpoint is the only
new file for this increment; no code test applies to this documentation-only
audit.
