# O*NET version reconciliation — 2026-08-31

This comparison measures the repository-pinned O*NET 30.3 archive against the official O*NET 31.0 text archive. The current role-profile and role-tool artifacts have been refreshed to 31.0; the SQL seed remains pending the final source and CCMAS audits.

- Pinned archive SHA-256: `7758ec966fd91895b3d290b83c9f1f1d46730d37fdda4faac67104d1c0d2a780`.
- Official 31.0 archive SHA-256: `6883548adf5fde64cf6f801b35d15519c9225f2732c3cab0e281c652d16b23a9`.
- Current profiles: **5096**; profiles with O*NET codes: **4375**; unique codes: **921**.

| O*NET table | Old rows | New rows | Changed occupation keys | Changed current profile rows |
|---|---:|---:|---:|---:|
| `Occupation Data` | 1016 | 1016 | 0 | 0 |
| `Job Zones` | 923 | 923 | 16 | 107 |
| `Work Activities` | 73308 | 74702 | 160 | 1232 |
| `Work Context` | 297676 | 305389 | 160 | 1242 |
| `Education` | 11100 | 11495 | 145 | 1115 |
| `Education Categories` | 12 | 24 | 1 | 0 |
| `Job Zone Reference` | 4 | 4 | 0 | 0 |
| `Task Statements` | 18796 | 18838 | 205 | 1510 |
| `Related Occupations` | 18460 | 18460 | 0 | 0 |
| `Software Skills` | 31821 | 31821 | 0 | 0 |
| `Essential Skills` | 17880 | 18200 | 141 | 1124 |
| `Transferable Skills` | 44700 | 45500 | 141 | 1124 |

## Decision boundary

O*NET 31.0 is the current official production release. The role-profile and role-tool generators, source metadata, archive hash, and affected evidence artifacts have been refreshed together. Occupation identity and ownership were not changed because the 1,016 occupation records are semantically unchanged; changed evidence remains global/US proxy evidence. The downstream SQL seed must be regenerated only after the final source and CCMAS audits pass.

## Reproducibility

```text
python data/career-mapping/_audit_onet_version_reconciliation.py
```
