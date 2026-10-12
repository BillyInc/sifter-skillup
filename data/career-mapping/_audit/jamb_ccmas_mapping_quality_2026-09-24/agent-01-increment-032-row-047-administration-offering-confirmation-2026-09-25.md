# Partition 01 increment 032 — row 47 Administration offering confirmation

Date: 2026-09-25. This append-only source correction is limited to the JAMB offering/context inventory for canonical row 47. It does not modify curriculum scopes, domain links, `programme_mapping.json`, subject requirements, seeds, SQL, roles, API or UI.

## Official-source verification

- Canonical identity, one-based `programme_mapping.json` row 47: `Public Administration and Local Govt`.
- Official source occurrence: JAMB IBASS, [Administration degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf), printed page 86.
- The official table extraction places `PUBLIC ADMINISTRATION AND LOCAL GOVERNMENT` with `UNN` in the **Course/Degree Awarding Institutions** column. This is sufficient to confirm the programme/faculty occurrence and the UNN awarder association. The locator is recorded against the occurrence, not inferred from an institution token adjacent to another heading.
- The existing Social/Management Sciences occurrence remains a separate source-context record. This correction does not assert that both faculty occurrences share an identical curriculum.

## Changes made

1. Added an audit-only source confirmation to `data/career-mapping/_audit/jamb_offering_context_source_confirmations_2026-09-25.json`, retaining the source spelling, canonical identity key, faculty, institution code, official URL, printed-page locator, verification date, and the fields actually verified.
2. Updated `data/career-mapping/_audit/build_jamb_offering_context_inventory.py` to merge explicit source-confirmed occurrences without treating them as parsed source rows; unverified parser rows remain unverified. The manual confirmation is deliberately separate from `administration_offerings.json`, which is an input to admission-requirement processing and is not needed to record this source-context fact.
3. Regenerated only `jamb_offering_context_inventory_2026-09-25.json` and `.md` from the focused inventory builder.

## Focused verification

Assertions passed:

- `programme_mapping.json` still has exactly **420** canonical JAMB identities; row 47's canonical name/order is unchanged.
- The inventory records **441** total source occurrences: the same **440** parsed occurrences plus one manual, official-source-confirmed occurrence.
- Row 47 has exactly two distinct faculties: Administration and Social/Management Sciences.
- Administration has one official-PDF-verified occurrence, institution `UNN`, with printed-page-86 locator and source URL; its parser-token array is empty (not misrepresented as parser output).
- The prior Social/Management Sciences occurrence is still present and remains PDF-unverified; it was not overwritten or promoted.
- The inventory builder runs successfully and its source file compiles.

## Boundary / follow-up

No canonical JAMB name was added or removed, no programme curriculum/domain relationship was inferred, and no admission requirements were copied. The Social/Management table cell and row 47 course union remain separate evidence tasks. This closes the missing Administration/UNN occurrence finding P01-07 in the issue register, but does not close row 47's curriculum mapping or domain-link audit.
