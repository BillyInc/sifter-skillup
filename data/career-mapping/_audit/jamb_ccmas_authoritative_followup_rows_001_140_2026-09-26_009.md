# Append-only correction — rows 071–080 checkpoint 008

Audit date: 2026-09-26 (Africa/Lagos). This correction supersedes conflicting counts/statuses in checkpoint `_008.md` and the prior coordinator increment. The earlier checkpoint file is preserved unchanged. Canonical sources were reread directly from `programme_mapping.json`, `jamb_domain_map.json`, and `jamb_curriculum_scopes_2026-08-17.json`; no canonical file was edited.

## Correct canonical facts

### Selected course rows and outcome fields

The saved scope has **160 selected course rows**, not 115. Canonical per-row counts and populated outcome fields are:

| Row | Identity | Selected | Non-empty outcome field |
|---:|---|---:|---:|
| 071 | Local Government Studies | 13 | 13 |
| 072 | Accounting and Finance | 20 | 20 |
| 073 | Cooperative and Rural Development | 29 | 27 |
| 074 | Logistics and Supply Chain Management | 0 | 0 |
| 075 | Development and Communication Studies | 23 | 23 |
| 076 | Transport and Logistics Management | 32 | 32 |
| 077 | Insurance and Actuarial Science | 0 | 0 |
| 078 | Office and Information Technology / Information Resource Management | 21 | 20 |
| 079 | Accountancy and Forensic Studies | 2 | 2 |
| 080 | Finance and Investment | 20 | 20 |
| **Total** |  | **160** | **157** |

The three empty outcome fields are CRD 307, CRD 409, and IRM 429. Row 073's 29 includes AMS 101; it is **not** 29 CRD courses plus AMS 101. Row 077 has no selected rows in the current scope; the prior report's 19-course insurance slice must not be treated as active evidence. Its declared multi-component scope remains `combined_scope_review_required` with no approval.

### Current active map status and link counts

The earlier report's current-map total of 79 included stale/pre-materialization rows. Directly rereading the present canonical `jamb_domain_map.json` yields:

| Row | Identity | Current status | Active links |
|---:|---|---|---:|
| 071 | Local Government Studies | `ready_partial` | 11 |
| 072 | Accounting and Finance | `review_required` | 0 |
| 073 | Cooperative and Rural Development | `ready_partial` | 13 |
| 074 | Logistics and Supply Chain Management | `review_required` | 0 |
| 075 | Development and Communication Studies | `ready_partial` | 7 |
| 076 | Transport and Logistics Management | `ready_partial` | 7 |
| 077 | Insurance and Actuarial Science | `review_required` | 0 |
| 078 | Office and Information Technology / Information Resource Management | `ready_partial` | 7 |
| 079 | Accountancy and Forensic Studies | `review_required` | 0 |
| 080 | Finance and Investment | `ready_partial` | 16 |
| **Total** |  |  | **61** |

Thus rows 072, 074, 077 and 079 are currently held at zero active links; they are not “unavailable.” In checkpoint `_008.md`, statements that row 077 has 19 active-scope courses / 10 active links, row 079 has eight active links, and the tranche currently has 79 links are withdrawn. The statements of 115 selected rows and 112/115 populated outcomes are also withdrawn. Preserve the separate JAMB source findings in `_008.md`; this correction changes only mistaken claims about canonical selected rows/current status.

## Audit implications

- Row 077's titled compound “Insurance and Actuarial Science” is an especially clear combined-scope gap: the canonical scope currently has no selected Insurance or Actuarial courses, although Insurance CCMAS is available and separate Actuarial Science CCMAS is available. No component inheritance is established until itemized course/outcome selection is made.
- Row 079's two selected ACC courses remain an insufficient Accountancy scope and still contain no forensic-studies component; the current map correctly holds it at zero links.
- Row 072 similarly has 20 selected Finance/Banking rows but is held at zero because the two institution/faculty contexts are not reconciled.
- Row 074 is full-parent CCMAS with zero expanded selected rows, but the additional Engineering/FUT-DAURA JAMB occurrence means source context needs separation before reusing the Administration parent.
- The exact 160/157 recount supersedes the prior increment's undercount and is the baseline for future course locator work.

Checkpoint `_008.md` still covers source findings for rows 071–080; read this corrective note with it. The next new identity tranche is row 081 and must be written to `_010.md`.
