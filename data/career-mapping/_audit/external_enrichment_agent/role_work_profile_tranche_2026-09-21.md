# Role work-profile enrichment — bounded tranche — 2026-09-21

## Scope and decision

This is a read-only audit of the first 20 roles in the sorted missing-work-profile queue. It checks the repository's vendored European Commission ESCO occupation record and the exact concept URI through the public ESCO API. It does not create an O*NET-style work-profile row: the ESCO description is role evidence, not a substitute for work activities, work context, job zone, or Nigerian demand evidence.

- Roles selected and individually audited: **20**.
- Exact repository occupation records: **20**.
- Exact online identity matches: **20**.
- Source-backed work-profile candidates: **20**, retained as audit evidence only.
- Role records corrected: **0**.
- Generated work-profile rows added: **0**.
- Roles proven genuinely unavailable: **0**.
- Remaining missing-work-profile roles: **99**.

## Per-role results

| # | Role | ESCO code | Local record | Internet identity | Skill relations | Decision |
|---:|---|---|---|---|---:|---|
| 1 | D086|bingo caller | 4212.1 | yes | verified | 19 | do_not_promote |
| 2 | D086|bookmaker | 4212.2 | yes | verified | 19 | do_not_promote |
| 3 | D086|casino cashier | 4212.3 | yes | verified | 23 | do_not_promote |
| 4 | D086|casino gaming manager | 4212.4 | yes | verified | 23 | do_not_promote |
| 5 | D086|casino pit boss | 4212.4.1 | yes | verified | 22 | do_not_promote |
| 6 | D086|director of compliance and information security in gambling | 1213.9.1 | yes | verified | 19 | do_not_promote |
| 7 | D086|gambling games developer | 2120.3 | yes | verified | 34 | do_not_promote |
| 8 | D086|gambling manager | 1431.2.3 | yes | verified | 45 | do_not_promote |
| 9 | D086|gambling quality assurance engineer | 2120.4 | yes | verified | 20 | do_not_promote |
| 10 | D086|gaming dealer | 4212.5 | yes | verified | 29 | do_not_promote |
| 11 | D086|lottery operator | 4212.6 | yes | verified | 20 | do_not_promote |
| 12 | D086|odds compiler | 4212.7 | yes | verified | 16 | do_not_promote |
| 13 | D086|race track operator | 4212.8 | yes | verified | 20 | do_not_promote |
| 14 | D087|barber | 5141.1.1 | yes | verified | 34 | do_not_promote |
| 15 | D087|hair stylist | 5141.1.3 | yes | verified | 30 | do_not_promote |
| 16 | D087|hairdresser | 5141.1 | yes | verified | 38 | do_not_promote |
| 17 | D087|hairdresser assistant | 5141.1.2 | yes | verified | 28 | do_not_promote |
| 18 | D087|performance hairdresser | 5141.1.4 | yes | verified | 26 | do_not_promote |
| 19 | D088|aesthetician | 5142.1 | yes | verified | 41 | do_not_promote |
| 20 | D088|beauty salon attendant | 5142.2 | yes | verified | 33 | do_not_promote |

## Source and interpretation notes

- Each successful record retains the exact ESCO concept URI, local CSV row locator, skill-relation locator, and exact API URL in the JSON ledger.
- `source_backed_online_verified` means the API returned HTTP 200 and its exact URI and preferred title matched the role record. It does not mean the role is Nigerian demand evidence.
- No row is marked `genuinely_unavailable` in this tranche: all 20 selected roles have a repository ESCO record and an online identity check.
- The existing 119-row population remains open; this tranche does not alter `role_work_profiles.json` or any generated transport.

Generated on 2026-09-21 by `role_work_profile_tranche_2026-09-21.py`.
