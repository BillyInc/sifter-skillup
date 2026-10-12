# CCMAS Physiotherapy PST 416 reconciliation — 2026-09-29

## Scope and source

Checked only PST 416, *Physiotherapy in Infectious Diseases Control and Prevention*, in the NUC 2023 Allied Health Sciences CCMAS. The source is the [official NUC PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf): global course structure, printed p. 588; detailed heading, outcomes and content, printed p. 617.

The detailed block covers applied microbiology and epidemiology; infection-risk assessment in acute, long-term and community care; using current literature to adapt prevention approaches; therapist protection and safe care; standard precautions and infection-control plans; clean/disinfected/sterilised environments; handwashing and physiotherapy disinfection; and operational/strategic infection-prevention initiatives.

## Findings and local repair

- The six local learning outcomes substantively match the six detailed-source outcomes; preserved unchanged.
- The local content summary was cut off mid-word (`healthca`) and omitted the end of the source content. Replaced with a concise complete summary covering the verified source topics.
- Added the item-level NUC URL, printed-page locators and access date.
- The global course table extraction appears as `1 C 15`, while the detailed heading states `1 Unit C: LH 30`. Because these conflict, LH and PH remain null. No value is guessed; the locator records the conflict for source-layout adjudication.

## Verification

`test_physiotherapy_pst416_repair_2026_09_29.py` checks the complete summary, preserved six outcomes, source provenance, and held contact-hour fields. The repair script refuses to run if the audited identity, outcome count, null hours or exact truncation baseline has changed.
