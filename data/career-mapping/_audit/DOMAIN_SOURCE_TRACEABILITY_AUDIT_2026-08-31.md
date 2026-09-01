# Domain source traceability audit — 2026-08-31

## Result

`domain_meta.json` can be structurally traced to the supplied 166-domain definition library for `D001–D166`. The library records ISIC industry anchors, ISCO occupational anchors, and ESCO role counts. Those records were checked against the local ISIC Rev.5 and ISCO-08 workbooks; the check found mixed ISIC code granularity/revision signals and eight ISCO values requiring reconciliation.

This is lineage evidence, not proof that the current JSON was mechanically generated directly from every source row. The canonical JSON does not retain the per-domain source codes or citations; this audit preserves those references per domain, and the regenerated seed ingests them into domain provenance.

## What the source layers did

1. **ISIC — industry context.** The library uses ISIC to survey the sectors/divisions where work operates and help check that no economic area was missed; the exact canonical revision and crosswalk for every recorded code must still be fixed. ISIC does not define occupations or skills.
2. **ISCO-08 — occupational function.** It supplies the occupational hierarchy and unit-group anchors that describe the type of work. It does not define a Sifter domain by itself.
3. **ESCO — roles and skills.** It supplies normalized occupation names, aliases, descriptions, skills and ISCO-linked role records under the occupational anchors.
4. **Human curation — practitioner domain boundary.** The source library combines the industry context and occupational function into a user-facing field name. This is why one domain can span several ISIC divisions and several ISCO unit groups.
5. **O*NET and WEF — enrichment signals.** O*NET contributes task/work-context and entrepreneurial signals; WEF contributes future-of-work trend signals. Neither is the domain-ID authority.

## Trace results

- Current `domain_meta.json`: **168** domains.
- Domain-definition library: **166** domains (`D001–D166`).
- Later repository additions not in that library: **D167, D168**.
- Original-library cluster matches: **165/166**.
- Exact current-name matches: **7**; related/shortened labels: **159**; changed labels: **0**.
- Domain-definition rows with ISIC detail: **166**; rows whose recorded ISIC values all exist verbatim in the local Rev.5 workbook: **75**.
- The library contains **496** section-prefixed three-digit ISIC-style codes; **453** have a matching Rev.5 division family after diagnostic normalization. This is a diagnostic comparison, not a code correction.
- Domain-definition rows with ISCO detail: **166**; rows whose recorded ISCO unit groups all exist in the local workbook: **162**.

## Domain identity decisions

- Exact source terminology: **7**.
- Source-supported umbrella: **159**.
- Curated later addition: **2**.

For the original 166 records, the source-library label, cluster, ISIC industry anchors, ISCO occupational anchors, and linked ESCO role set establish the identity. A shortened label is classified as a source-supported umbrella, not as a verbatim ISIC/ISCO term. D167-D168 are explicitly curated additions with their registry evidence and limitations retained. The boundary test is shared work outputs, day-to-day practice, learning foundation, entry routes, and the underlying source anchors.

## What this proves and does not prove

### Proven

- The sequential `D001–D166` set is not an arbitrary list invented by the current seed generator; it corresponds to the supplied source library’s sequential 166-domain table.
- The source library’s domain records explicitly combine `ISIC Sections/Divisions`, `ISCO Sub-major/Unit Groups`, and `ESCO Roles`.
- The recorded ISIC/ISCO values were tested against the local workbooks. This did not pass cleanly: the library mixes ISIC code granularity and revision-sensitive section letters, and eight listed ISCO unit-group values are absent from the supplied ISCO-08 workbook.
- `D167` and `D168` are later additions and are not part of the original 166-domain document.
- Later-addition source IDs are classified explicitly: a `registry_reference` points to source-routing metadata, while an `unregistered_reference` is not claimed as checked evidence.

### Not proven by the current repository

- `domain_meta.json` does not carry each domain’s ISIC codes, ISCO codes, ESCO URIs, source pages, or derivation decision; the audit artifact now carries the available per-domain record references without changing the canonical projection.
- The regenerated seed carries the audited ISIC/ISCO/ESCO references in the domain provenance JSON; no normalized ISIC field is being claimed because the seed preserves source values and crosswalks rather than silently replacing them.
- The repository does not preserve a step-by-step generator that proves whether each domain boundary was source-filtered first and then curated, or manually curated and later annotated with source anchors.
- A valid ISIC or ISCO code does not by itself prove that a domain label is the only or best possible grouping; the recorded boundary criteria and source-supported identity decision must be read together.

## Required correction boundary

The audit does not substitute Rev.5 prefixes for the library's recorded codes and does not silently replace invalid ISCO values. The next correction must preserve the original value, identify the intended revision, add the authoritative replacement/correspondence, and record whether the domain boundary or only its citation changed.

## Reproducibility

The machine-readable per-domain result is `data/career-mapping/_audit/domain_source_traceability_2026-08-31.json`. Regenerate it from the repository root with:

```text
python data/career-mapping/_audit_domain_source_traceability.py
```

The audit intentionally does not change `domain_meta.json`, `domain_structure.json`, SQL, or seed data.
