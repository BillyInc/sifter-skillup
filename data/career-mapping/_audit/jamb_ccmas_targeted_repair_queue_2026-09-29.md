# Targeted JAMB–CCMAS repair queue — 2026-09-29

This deduplicates repeated JAMB occurrences into unique CCMAS course repair units.

## Counts

- **distinct course records:** 0
- **occurrence level detail findings:** 0
- **other:domain link not present in component score catalogue:** 494
- **other:domain link references unselected course:** 488
- **other:mapping explicitly held for review:** 120

## Repair rule

Source-check one unique `(source package, course code)` record, apply a guarded correction only when the source supports it, then regenerate the full 420-name reconciliation. Do not copy one JAMB occurrence's data into another without matching the CCMAS source context.
