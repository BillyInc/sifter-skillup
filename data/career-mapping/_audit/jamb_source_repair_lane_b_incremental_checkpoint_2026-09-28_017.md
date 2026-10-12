# JAMB offering-source verification — Lane B checkpoint 017

Date: 2026-09-28  
Scope: Medical offering ledger inventory, rows 1–16. No downstream mapping work or CCMAS data edits.

## Medical index/title inventory

Checked the Medical ledger against the official IBASS Medical/Pharmaceutical/
Health Sciences index (printed p. 428) and the checked-in brochure extraction.
All 16 ledger names correspond to entries in the index; `Medicine and Surgery
(Human Medicine)` follows the brochure’s parenthetical title wording.

The official index has **18 distinct programme-name entries**, not 17: it
prints `15` twice (for `Prosthesis and Orthopaedic Technology` and `Public
Health Technology`) and also lists `Radiography` (16) and `Veterinary
Medicine` (17). The current Medical offering ledger omits the two noncanonical
names `Prosthesis and Orthopaedic Technology` and `Veterinary Medicine`; both
were checked against `jamb_domain_map.json` and are absent from the canonical
420-key set. They are recorded as source-census gaps only; no canonical
identities or JAMB–CCMAS mappings were created.

Official source: [JAMB IBASS Medical degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf), accessed 2026-09-28.

## Exact offering-cell state

Index title/faculty matches do not prove a detailed body awarder cell. The
current 16-row ledger has no row-level official-cell verification metadata,
and several names do not appear as exact body headings in the checked text
extraction. Therefore **0/16 awarder cells are promoted; all 16 remain open
for exact body title/awarder verification**. No institution lists or
admission fields were changed. No JAMB–CCMAS mismatch is declared from
index-only evidence.

This is a bounded inventory/title checkpoint, not completion of the Medical
offering audit. Search results for the official PDF resolve to the correct
JAMB source, but direct text retrieval is a JavaScript shell; exact awarder
cells still require source-specific locator verification.

## Lane-B cumulative status and next row

Across the four assigned ledgers: **87 source-occurrence rows** (Social/Management
53, Education 12, Law 6, Medical 16).

- Social/Management: 49 exact-source confirmed; 4 awarder cells held.
- Education: all 12 title/faculty index entries checked; 12 awarder cells held.
- Law: 4 exact body cells confirmed; 2 title/body conflicts held.
- Medical: all 16 title/faculty index entries checked; 16 exact awarder cells
  remain open.

Lane B is still open; the queued CCMAS 88-package tranche has not started.
Next bounded work is **Medical row 1, Anatomy**, through the 16 rows, then a
cross-ledger completion reconciliation. Do not repeat Social/Management
rows 1–41 or Arts rows 1–43.

## Focused test

```powershell
python -m pytest --basetemp .pytest-tmp-lane-b-medical-017 `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_medical_017.py -q
```

Result: `1 passed` (after execution).
