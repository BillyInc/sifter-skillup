# Lane 2 source-audit checkpoint 005 — evidence correction

## Correction: package 080 German CCMAS

I re-read the NUC PDF's detailed course blocks after comparing its global structure tables. That revealed that several apparent local code mismatches were actually **conflicts inside the NUC document**. Checkpoints 002–004 were too strong in calling those local defects; this checkpoint supersedes their conflicting classifications. Their evidence remains preserved, but this is the current disposition.

Official NUC source: *CCMAS for Nigerian Universities — Arts*, <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf>, accessed 2026-09-28.

Examples confirmed from the exact German course blocks:

- Global structure says `GST 113` for Nigerian Peoples and Cultures (p. 467), while the detailed German course block says `GST 112` (p. 470). Local `GST 112` matches the detailed block: source conflict, not a proven local code error.
- Global 200-level table says `GST 211`, `ENT 211`, `FAC 201`, and `GER 201–210` (p. 467). Detailed blocks instead show `GST 212`, `GST 222`, `FAC 201`, `FAC 202`, and `GER 201–210` (pp. 474–476). Local values align with the detailed blocks except `ENT 211` is absent; hold this as a source-list conflict/candidate pending full section reconciliation.
- Global structure says `GST 311`; detailed course block says `GST 312` (pp. 480–481). Local `GST 312` matches the detailed block.
- Global table says `FRE 302`; detailed course block says `GER 302` (pp. 483–484). Local `GER 302` matches the detailed block.
- Both global and detailed German sections include `GER 407`, but disagree on hours (table: LH 30; detailed block: PH 270). Its absence from local package is still a confirmed omission; the hour field is a source conflict.

After that correction, the defensible package-080 findings are **5 confirmed local defects**: truncation of GST 111 content; truncation of GST 112 content; missing/contaminated GER 101 fields; missing GER 103 outcome plus truncated content; and missing GER 407. There are **5 source conflicts**; other apparent structure differences remain candidates until the source's global tables, detailed blocks and common-course treatment are reconciled. Exact details/locators are in checkpoint JSON 005.

This package is not complete: 5/41 course rows received detailed checks; 36 remain. No shared source data or seed was changed.
