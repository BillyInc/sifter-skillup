# JAMB Accounting and Finance source-context audit — 2026-09-28, increment 001

**Purpose:** Verify exact JAMB offering title, faculty, and awarding-institution
association for the Administration and Social Sciences occurrences. This is an
audit-only checkpoint. No canonical offering, CCMAS scope, or downstream data
was changed.

**Access date:** 2026-09-28 (Africa/Lagos)

## Official JAMB evidence

The direct official IBASS PDF URLs were opened. The web reader returned the
IBASS JavaScript shell for these PDFs, but the official IBASS PDF body/table
text was available through indexed excerpts from those same official URLs. No
non-official source was used to establish either title, faculty, or awarder.

| Source faculty | Exact JAMB title and awarder cell | Official source and printed locator | Audit disposition |
|---|---|---|---|
| Administration | `ACCOUNTING AND FINANCE` — `BCU` | [Official Administration brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf), printed pp. 47–48: the prior `ACCOUNTING` awarder sequence continues through UYO, VISION-UNI, WELLSPRING, and WESTERN-DEL; the next distinct title is `ACCOUNTING AND FINANCE`, followed by `BCU` on p. 48. The official indexed body excerpt exposes this title/awarder sequence. | **Confirmed as a distinct Administration occurrence.** The exact BCU cell is separate from the preceding Accounting roster. The local parsed row correctly retains BCU only; its source says BCU requirements are blank. |
| Social Sciences (local grouping: Social/Management Sciences) | `ACCOUNTING AND FINANCE` — `FEDOTUOKE` | [Official Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf), printed p. 576: the body table begins with `ACCOUNTING AND FINANCE` and `FEDOTUOKE`, then starts a separate `ACCOUNTING` row. The official indexed body excerpt exposes the same order and the row-specific entry requirements. | **Confirmed as a separate Social Sciences occurrence.** Preserve the JAMB institution token exactly as `FEDOTUOKE`; do not silently normalize it to another spelling or merge it with the Administration occurrence. |

The two cells have the same displayed programme name, but the official JAMB
source places them in different faculty brochures and assigns different
awarder codes. Their JAMB offering contexts must therefore remain separate.
This confirms source identity/provider associations only; it does not prove
that either institution has a particular curriculum or that their curriculum
scopes should be combined.

## Local-record cross-check and discrepancy

- `data/career-mapping/jamb/administration_offerings.json`, programme row 24,
  has faculty `Administration`, title `Accounting and Finance`, institution
  `BCU`, and source locator p. 48. It matches the official body cell.
- `data/career-mapping/jamb/social_management_offerings.json`, programme row
  1, has the same title and institution token `FEDOTUOKE`, with its own
  Social/Management Sciences source URL and row-specific requirements. It
  matches the official body cell.
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
  records two occurrences under one canonical display name, with distinct
  source faculties, parsed files/row ordinals, and institution tokens BCU and
  FEDOTUOKE. This is the correct occurrence model for this finding.
- **Locator correction to carry forward:** the Social Sciences source record
  and older reconciliation note cite printed p. 577 for the title/awarder row.
  The official body excerpt and checked-in extraction
  `data/career-mapping/_jamb_txt/Social Management Science.txt` place the exact
  `ACCOUNTING AND FINANCE — FEDOTUOKE` row on printed p. 576. Page 577 is
  present in the continued table/excerpt, but is not the exact title/provider
  cell locator. This is a source-locator metadata discrepancy, not a mismatch
  in programme title or awarder. The authoritative offering record was not
  edited per the audit-only instruction.

## Result

**Both source-context associations are confirmed from the official JAMB
brochure body text:** Administration → BCU; Social Sciences → FEDOTUOKE.
Do not collapse the occurrences because their display names match. The
Social Sciences printed-page locator should be corrected in a later authorized
data-maintenance pass from p. 577 to p. 576; no source-context hold is needed
for the identity/provider association itself. This checkpoint makes no claim
about curriculum equivalence or CCMAS mapping.

## Scope and change record

- Audit-only; no canonical JAMB records, CCMAS records/scopes, mappings, seeds,
  or downstream domain/subgroup/role data changed.
- Added this uniquely numbered checkpoint only.
- No test was run because no executable or authoritative data artifact was
  changed.
