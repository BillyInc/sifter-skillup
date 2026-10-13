# JAMB offering/source-context incremental checkpoint 002

**Date:** 2026-09-26 (Africa/Lagos)  
**Mode:** audit-only, append-only checkpoint  
**Scope:** all 420 canonical JAMB identities and their source-offering records.  
**Explicit exclusions:** no shared JAMB source, mapping, curriculum scope, seed,
CCMAS, domain, subgroup, role, role-name, UI, or downstream edits.

## Inputs read before this increment

- `data/career-mapping/_audit/jamb_offering_source_context_incremental_checkpoint_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.md`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_ccmas_external_source_phase_checkpoint_2026-09-26_002.md`
- all nine parsed files under `data/career-mapping/jamb/*_offerings.json`
- extracted JAMB source text under `data/career-mapping/_jamb_txt/`

Closed curriculum and downstream findings were not re-audited. The prior offering
checkpoint's open findings are carried forward only where they remain unresolved.

## Current catalogue coverage

| Measure | Count | Meaning |
|---|---:|---|
| Canonical JAMB identities | **420** | Complete identity-key coverage |
| Parsed offering occurrences | **441** | Source rows across 9 parsed brochure files |
| Manual source-confirmed occurrences | **1** | Separate confirmation record |
| Total occurrence records | **442** | Occurrences remain distinct; names are not collapsed |
| Parsed occurrences marked PDF-verified | **2** | The two Accounting and Finance contexts |
| Total PDF-verified occurrences | **3** | Includes the manual confirmation record |
| Identity rows with at least one unverified occurrence | **419** | A verification-state gap, not a claim that the source row is absent |
| Exact canonical names without a parsed occurrence | **0** | Deterministic name-key coverage passes |
| Parsed names without a canonical identity | **0** | No orphan parsed name-key |
| Identities with multiple source-faculty contexts | **20** | Collision contexts must remain separate |
| Mapping faculties absent from parsed faculties | **29** | Reconciliation candidates, not confirmed errors |

The inventory file is the current machine-readable occurrence ledger:
`data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`.

## Newly verified finding in this increment

### OCC-NEW-002 — duplicate institution token in Sociology occurrence

- **Status:** **confirmed parser/extraction defect**
- **Identity:** `Sociology`
- **Source context:** Social/Management Sciences — `Social Management Science.pdf`
- **Parsed record:** `data/career-mapping/jamb/social_management_offerings.json`,
  `programmes[50]` (1-based row 50; zero-based index 49)
- **Observed value:** `UDU` occurs twice in the `institutions` array. The
  institution-bearing Sociology block begins at extracted-source line 4909 and
  lists `UDU` once at line 5038; the duplicate is therefore not supported by the
  visible source block.
- **Evidence URL:**
  [official JAMB Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf)
- **Local source locator:** `data/career-mapping/_jamb_txt/Social Management Science.txt:4909-5042`
- **Access date:** 2026-09-26
- **Repair recommendation:** remove only the repeated `UDU` token from this
  occurrence's institution list, retain the single source-supported `UDU`
  association, and add a row-level source locator/verification record. Do not
  alter the canonical identity, curriculum scope, faculty context, or downstream
  mappings in this offering-audit lane.

No source or mapping file was edited for this finding.

## Findings carried forward without duplication

These remain open from checkpoint 001 and are intentionally not re-counted as new:

1. **100 faculty/header-like token incidences across 65 parsed records.** The
   tokens include `ARTS`, `EDUCATION`, `ENGINEERING`, `ENVIRONMENTAL`, `HEALTH`,
   `LAW`, `MANAGEMENT`, `SCIENCE`, and `TECHNOLOGY`. Each still needs exact
   brochure-cell adjudication before a token can be removed or retained.
2. **The separate Social/Management Sciences `Film and Video Studies —
   WESTERN-DEL` occurrence is now present** in the parsed offering file, but its
   extracted source locator is still not visually reconciled to a printed PDF
   cell. It is retained as a separate context; it is not merged with the
   Administration occurrence.
3. **419 identity rows still have at least one unverified occurrence.** The
   source inventory has only three PDF-verified occurrence records. Existing
   source citations must be normalized to stable occurrence IDs; catalogue
   directory presence is not sufficient proof of an institution-bearing row.
4. **20 multi-faculty display-name collisions** remain context-sensitive. The
   current inventory preserves them as separate records; no name-only merge is
   permitted.
5. **29 mapping-faculty conflicts** remain source-reconciliation candidates. The
   parsed faculty label must not be changed until the exact JAMB source heading
   and institution-bearing cell are checked.

## Deterministic full-catalogue scan completed in this increment

- All **441 parsed offering rows** were compared against their corresponding
  extracted JAMB brochure text using normalized programme-name matching.
- **338** rows have a direct normalized name hit in the extracted source text.
- **103** rows require a wrapped-name, source-wording, alias, or exact-cell
  review; this is an evidence queue, not an automatic stale-row decision.
- No parsed row was promoted to “source verified” from this scan alone.
- A directory-only name hit was not treated as an offering occurrence because it
  does not prove an institution-bearing cell.

## Next audit increment

Continue through the 103 source-wording/wrapped-name candidates and the 419
identity-level verification gaps, checking the institution-bearing table cell
against the official brochure URL and recording an exact locator and date. Then
re-run the 420-identity occurrence comparison to detect any genuinely missing
or stale offering records. Keep confirmed defects, evidence-needed candidates,
and source-supported contexts separate. Do not begin domain, subgroup, role, or
role-name work from this lane.

