# Partition 02 — increment 031: rows 337–346 inventory checkpoint

Recorded 2026-09-25 (Africa/Lagos). Append-only checkpoint. No shared maps, scopes, seeds, SQL or app files edited.

## Checkpoint status

- Rows 337–346 are the next ten canonical identities after increment 030. I inventoried their source occurrences, CCMAS component/scope state, candidate links and current-vs-prior map state. **0/10 closed** under the full acceptance standard: official institution/programme offering rows, course outcome coverage, every domain tier, and descendant subgroup/role task fit remain open.
- The parsed inventory has ten identities and eleven occurrences. Optometry has two parsed contexts (Medical/Pharmaceutical/Health and Sciences); the remaining identities have one each. All institution tokens remain parser-derived and PDF-unverified. One-token rows must not be taken as the actual institution list.
- Scope rows contain **49 candidate links / 20 active links / 55 prior links** and **147 selected-course records** across six partial scopes. Four rows have combined/full curriculum scopes with no selected courses. Four rows currently have zero active links (337, 338, 343, 344). No quarantined link restored.

## Row inventory and first-pass concerns

| Row | JAMB name | CCMAS scope / selected courses | Candidate / active / prior | First-pass disposition |
|---:|---|---|---:|---|
| 337 | Geography and Environmental Management | Geography + Environmental Management; combined review-required, 0 | 10 / 0 / 10 | Two-source compound identity; do not inherit either single-degree curriculum wholesale. Need JAMB offering row and combined component/outcome reconciliation. |
| 338 | Geography and Geosciences | Geography + Geology; combined review-required, 0 | 10 / 0 / 10 | Combined scope held. Need verify whether institutions teach both components and which outcomes are shared/specialized before any path. |
| 339 | HOME SCIENCE | Family and Consumer Sciences; partial, 11 | 3 / 3 / 4 | Includes an FCS 431 placeholder not found in the CCMAS course table. Current D075 Fashion/Textiles is plausible only for clothing/textile strand; D063 Economics and D030 Marketing need bounded consumer/family tasks, not general careers. |
| 340 | INFORMATION AND MEDIA SCIENCE | Information and Media Studies; partial, 27 | 4 / 4 / 4 | Scope includes media production, information systems/data management, research, analytics, policy/security and communication. Same 27-course set also appears for rows 341–342; establish whether these are legitimate variants, not duplicate generic seed payloads. |
| 341 | INFORMATION SCIENCE AND MEDIA STUDIES | Information and Media Studies; partial, 27 | 4 / 4 / 4 | Parsed source has two institution tokens. Same course set and paths as row 340 despite a differently ordered title. Confirm title-specific curriculum and actual offering context. |
| 342 | Information and Media Studies | Information and Media Studies; partial, 27 | 4 / 4 / 4 | Parsed under Administration. Keep faculty context distinct from rows 340–341; exact institution/programme table is unverified. |
| 343 | Islamic Studies | Arts::Islamic Studies; full, 0 | 3 / 0 / 4 | D150 Religious Ministry/Theology is the closest subject candidate; it does not make all clergy/theology occupations suitable. D037 Legal Practice and D039 Higher Education need course- and role-specific support. Current map held. |
| 344 | Optometry | Allied Health Sciences::Optometry; full, 0 | 6 / 0 / 9 | Two parsed source contexts. Direct D068 Allied Health is broad; functional Medicine, Nursing, Pharmacy, Community Health, Biomedical Engineering links are not established by title or adjacency. Current map held. |
| 345 | Public Relations and Advertising | Public Relations; partial, 24 | 2 / 2 / 3 | Component is Public Relations, not an explicit two-component PR+Advertising contract. Verify advertising courses/outcomes before presenting advertising routes. D168 Esports/Creator Economy is adjacent, not a general requirement. |
| 346 | Strategic Communication | Strategic Communication; partial, 31 | 3 / 3 / 3 | D030 Marketing is direct, D042 Media Production functional and D168 Esports/Creator Economy adjacent in the map. Test each destination subgroup/role against strategic-communication tasks; don't project generic creator-economy roles. |

## Status cautions and next work

The `active` count means only “present in the current fail-closed map,” not “approved for student display.” Rows 340–342 have the same 27-course Information and Media Studies component and links, so the title/faculty distinctions and whether this is three real JAMB awards or duplicated normalization need source verification. Rows 337–338 are combined-title candidates and require both named components; a single relevant course or lexical overlap cannot close their links. The Home Science placeholder is a confirmed local extraction anomaly, but whether its underlying source course exists must be checked before classifying a curriculum defect. No unsupported path has been accepted or removed from canonical data.

I have not yet completed exact overlay-conflict reconciliation for these rows or the required authoritative, item-specific source and descendant-role checks. Next: obtain the matching JAMB official table pages and NUC component outcomes, then assess each active/candidate link and all relevant subgroups/roles. Next sequential rows are **347–356**; **74 canonical rows remain after row 346**.
