# CCMAS Accounting (ACC) source correction ledger — 2026-09-25

## Scope and authority

- Target: the `ACC` programme's ACC-coded course rows only in
  `data/career-mapping/ccmas/administration_management.json`.
- Authority: National Universities Commission (NUC), *Core Curriculum and
  Minimum Academic Standards (CCMAS): Administration and Management*.
- Official PDF: <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf>
- Accessed: 2026-09-25.
- Printed locators below refer to the page numbers printed in the CCMAS PDF,
  not the PDF viewer's physical page index. Course structure is on printed
  pp. 31–32; course descriptions and learning outcomes are on printed
  pp. 35–49.
- Byte-for-byte before snapshot:
  `data/career-mapping/_audit/acc_ccmas_source_before_2026-09-25/administration_management.json`
- Snapshot/source SHA-256 before correction:
  `ABFA29093FEEAB6889F4BB3B622AECC760510F82741F711FD4C9A86722BC2C3B`
- Reproducible, ACC-only correction script:
  `data/career-mapping/_audit/repair_acc_ccmas_source_2026_09_25.py`

## Inventory result

The NUC Accounting course structure contains 21 ACC-coded courses:
ACC 101, 102, 201, 202, 203, 204, 206, 301, 302, 303, 305, 306, 307, 308,
311, 401, 402, 403, 404, 405 and 490. There is no ACC 304 in the published
structure. The checked-in ACC object had all 21 codes, but its ACC summaries
were truncated to about 400 characters and it had no separate
`learning_outcomes` field on any ACC-coded course. Several titles were
misassigned between courses, not merely shortened.

The correction script updates only `title`, `content_summary` and
`learning_outcomes` within those 21 ACC-coded course objects. It does not
change shared GST/AMS/ENT course rows, the separate FIN programme, any other
programme's repeated course rows, JAMB mappings/scopes, downstream links,
seeds, SQL or taxonomy/role names.

## Course-by-course correction record

`Fields` is the exact set changed for every listed course: existing `title`,
existing truncated `content_summary`, and newly added `learning_outcomes`.
The new summary and outcomes are concise, source-faithful paraphrases, not
verbatim replacement curriculum text.

| Course | Prior local title → verified NUC title | Printed locator | Fields |
|---|---|---:|---|
| ACC 101 | Financial Accounting I → Introduction to Financial Accounting I | pp. 31, 35–36 | title; content_summary; learning_outcomes |
| ACC 102 | Financial Accounting II → Introduction to Financial Accounting II | pp. 31, 36–37 | title; content_summary; learning_outcomes |
| ACC 201 | Intermediate Financial Acct. I → Financial Accounting I | pp. 31, 37–38 | title; content_summary; learning_outcomes |
| ACC 202 | Intermediate Financial Acct. II → Financial Accounting II | pp. 31, 38 | title; content_summary; learning_outcomes |
| ACC 203 | Management Accounting I → Corporate Governance and Accounting Ethics | pp. 31, 38–39 | title; content_summary; learning_outcomes |
| ACC 204 | Management Accounting II → Cost Accounting | pp. 31, 39–40 | title; content_summary; learning_outcomes |
| ACC 206 | Business Finance → Accounting Laboratory | pp. 30, 40 | title; content_summary; learning_outcomes |
| ACC 301 | Advanced Financial Accounting I → Financial Reporting I | pp. 31, 42 | title; content_summary; learning_outcomes |
| ACC 302 | Advanced Financial Accounting II → Financial Reporting II | pp. 31, 42–43 | title; content_summary; learning_outcomes |
| ACC 303 | Cost Accounting → Management Accounting | pp. 31, 43 | title; content_summary; learning_outcomes |
| ACC 305 | Public Sector Accounting → Taxation I | p. 31, 43 | title; content_summary; learning_outcomes |
| ACC 306 | Taxation I → Taxation II | p. 31, 44 | title; content_summary; learning_outcomes |
| ACC 307 | Taxation II → Auditing and Assurance I | pp. 31, 44–45 | title; content_summary; learning_outcomes |
| ACC 308 | Auditing and Investigation I → Public Sector Accounting & Reporting | pp. 31, 45–46 | title; content_summary; learning_outcomes |
| ACC 311 | Auditing and Investigation II → Entrepreneurship in Accounting | pp. 31, 46 | title; content_summary; learning_outcomes |
| ACC 401 | Company Reporting → Advanced Financial Reporting | p. 32, 47 | title; content_summary; learning_outcomes |
| ACC 402 | Advanced Taxation → Corporate Reporting | p. 32, 47–48 | title; content_summary; learning_outcomes |
| ACC 403 | Advanced Auditing → Auditing and Assurance II | p. 32, 48 | title; content_summary; learning_outcomes |
| ACC 404 | Advanced Management Accounting → Financial Management | p. 32, 48–49 | title; content_summary; learning_outcomes |
| ACC 405 | Advanced Financial Management → Bankruptcy & Liquidation | p. 32, 49 | title; content_summary; learning_outcomes |
| ACC 490 | Project → Project (title verified) | p. 32; ACC course-details section checked through p. 49 | content_summary; learning_outcomes |

## Unresolved source/extraction notes

1. **ACC 490 is a real source gap, not an inferred syllabus.** The global
   structure (printed p. 32) lists ACC 490 Project, 6 core units, 270 practical
   hours. The ACC course-specific descriptions/outcomes in the same document
   do not state its content or learning outcomes. The corrected summary records
   only that fact; `learning_outcomes` is an empty list. A project guide or
   institutional syllabus would be a different, institution-specific source
   and is not substituted here.
2. **ACC 201 duplicates an outcome in the source.** NUC repeats the outcome
   “define relevant terms under IFRS 15 – Revenue” as items 5 and 8. Both
   occurrences are retained in the corrected outcome list so this repair does
   not silently editorialise the official text.
3. **ACC 202 outcome numbering/line wrapping is malformed in the source text.**
   The source joins the revenue/grants item and the number for the following
   accounting-policies item as `... IFRS; 6.`, then later numbers the final
   accounts outcome as 7. The correction records the seven apparent outcomes
   in reading order; the numbering artifact remains documented here.
4. **ACC 302 also joins outcome numbers 9 and 10 on one extracted line.** The
   two distinct outcomes are preserved as separate items in reading order.
5. **ACC 303 joins outcome 9 and number 10 in one extracted line.** The source
   has 11 outcomes in reading order; they are split at the evident numbered
   boundary without changing their meaning.
6. The PDF contains occasional typographic/grammar issues in source outcomes
   (including capitalization and punctuation). The corrected field normalizes
   these into readable paraphrases; it does not claim a verbatim transcription.
7. ACC 303's global course table title is **Management Accounting** (printed
   p. 31); the detailed course heading calls it “Management Accounting
   (Performance Management)” (printed p. 43). The global-table title is stored
   as the course title; the detailed performance-management emphasis is
   preserved in its summary/outcomes.

## Validation record — 2026-09-25

- Preserved snapshot SHA-256 remains
  `ABFA29093FEEAB6889F4BB3B622AECC760510F82741F711FD4C9A86722BC2C3B`.
- `python -m json.tool data/career-mapping/ccmas/administration_management.json`
  parsed successfully.
- Focused test:
  `python -m unittest data.career-mapping._audit.test_acc_ccmas_source_reconciliation -v`
  — 4 tests passed. Tests confirm the 21-code inventory, expected corrected
  fields, ACC-only field boundary, unchanged shared/non-ACC programme records,
  and no invented ACC 490 outcomes.
- The correction script independently checks that only the ACC programme
  block changed and refuses to patch if the source no longer matches the
  preserved snapshot. The non-ACC programmes, including FIN, and shared
  GST/AMS/ENT courses are unchanged.
- No SQL, seed generation, JAMB mapping/scope, downstream link or taxonomy
  change was performed.
