# CCMAS extraction-anomaly review checkpoint — 2026-09-26 (001)

Status: incomplete incremental checkpoint. This artifact records the current
all-package review state; it does not edit CCMAS source JSON, JAMB mappings,
downstream data, or the main findings register.

## Coverage

The deterministic scan was refreshed after the already-recorded local repairs:

| Scope | Covered | Result |
|---|---:|---|
| CCMAS source files | 17 / 17 | scanned |
| CCMAS programme packages | 237 / 237 | scanned |
| CCMAS course records | 9,854 / 9,854 | scanned |
| Existing local fix log | FIX-001–FIX-016 | read before this checkpoint |
| Existing original-source review | 122 flagged rows in the saved review artifact | used for cross-checking where keys resolve |

The machine-readable candidate inventory is
`ccmas_extraction_anomaly_inventory_2026-09-26.json`. Candidate counts below
are occurrences; duplicate code/title occurrences are also reported as unique
keys in the inventory.

## Findings recorded in this checkpoint

| Candidate class | Occurrences | Unique keys | Packages | Current classification |
|---|---:|---:|---:|---|
| Empty or placeholder content summary | 1,092 | 1,088 | 139 | evidence queue; not automatically a source defect |
| Exact duplicate outcome text | 8 | 8 | 8 | evidence queue; repetition may be source-authored or extraction duplication |
| CCMAS page-header spill in content | 47 | 47 | 18 | confirmed extraction-pattern candidates; source comparison still required before editing |
| Unresolved `[SEE …]`/identical-content reference | 2 | 2 | 2 | cross-reference resolution queue |
| Replacement-character text (`�`) | 268 | 265 | 58 | encoding/source comparison queue; do not silently normalize without the PDF |

These are catalogue-wide extraction findings, not a claim that all 1,417
candidate occurrences are wrong. The existing FIX-001–FIX-016 rows were not
reopened or repeated. The current scan reflects their source edits where the
candidate no longer appears; the fixed-row ledger remains in
`jamb_ccmas_local_fix_log_2026-09-26.md`.

## Exact source anchors for the confirmed-pattern queue

The page-header candidates expose a printed-page number in the contaminated
text itself. The following are the exact source URL and page groups to verify;
the individual course codes are preserved in the JSON inventory:

| Source file | NUC source | Candidate course codes and printed page |
|---|---|---|
| `allied_health.json` | [Allied Health Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) | AUD 503:67; AUD 509:69; CAM 318:99; DNT 506:136; DTH 313:161; DTH 527:171; HIM 411:281; ITH 208:309; ITH 401:316; MLS 411:359; OCT 414:473; OCT 525:484; OPT 203:506; OPT 303:512; OPT 306:513; OPT 309:514; OPT 316:517; OPT 401:520; OPT 416:527; OPT 519:535; OPT 698:541; POT 317:658; POT 413:659 |
| `arts.json` | [Arts CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf) | ATR 401:89; CHS 104:102; CHS 107:103; CHS 207:108; CHS 422:116; CRS 103:125; FAC 301:132; CRS 306:133; ENT 211:147; CTH 412:158; RUS 164:499; FAC 202:501; RUS 233:503; GST 312:504; RUS 361:507; RUS 302:508; RUS 351:511 |
| `basic_medical.json` | [Basic Medical Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf) | BIO 107:56; PHY 108:60; PIO 218:66; PIO 399:73 |
| `education.json` | [Education CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf) | BED 312:188; BED 322:190; CHM 107:210 |

The page number is an extraction locator, not yet a conclusion that the entire
course content is wrong. Each row must be compared with the course's content
and outcome block on that NUC page before a repair script is written.

## Remaining work — exact and ordered

1. Compare all 47 page-header candidates against the cited NUC printed page;
   record the clean source text and source locator, then create narrowly scoped
   repair scripts only for confirmed spill. Do not alter source JSON in this
   anomaly-review lane.
2. Resolve all 8 duplicate-outcome candidates against their programme course
   table and outcome block. For each, classify `source_repeat`,
   `extractor_duplicate`, or `source_conflict`, with the NUC URL and printed
   pages. Candidates are: CAM 424, DNT 309, DTH 521, ANA 341, LIS 215,
   SED 101, FAA 451, and VEX 599.
3. Resolve `DTS 498` and `CSC 432` by following the referenced Computing CCMAS
   CS section and preserving a target locator. A valid source cross-reference
   is not a missing-content defect; a dangling or wrongly joined reference is.
4. Compare all 265 unique replacement-character keys against their source
   page. Record whether the character is only a UTF/PDF extraction artifact or
   whether the surrounding word/content is genuinely damaged. Keep the exact
   source file, programme, code, title, URL, and printed page for each result.
5. Triage all 1,088 unique empty-content keys. Separate source-defined
   placements/projects/attachments with no narrative content from rows where
   the NUC document has content that the parser failed to capture. The current
   original-source review resolves only a subset: 18 source-checked rows,
   3 explicit review/unchecked rows, and 1,071 rows absent from that saved
   review index. Absence from the index is not evidence that the PDF lacks the
   content.
6. Run a second all-237 reconciliation after the evidence ledger is complete:
   confirm course code/title/units/status/contact hours, outcomes, content,
   source locator, and package ownership. Only then apply source fixes and
   regenerate dependent contracts/seeds; downstream JAMB/domain work remains
   deferred.

## Guardrails

- No source JSON, JAMB bridge, downstream mapping, role data, or main register
  was edited for this checkpoint.
- No candidate was promoted to a student-facing requirement.
- A blank summary, duplicate phrase, replacement character, or cross-reference
  is a review signal—not proof of unavailability.
- The NUC PDFs above are the authoritative curriculum sources. Exact printed
  pages are intentionally left unresolved for the queues where the current
  inventory does not contain a trustworthy page locator; inventing page numbers
  would weaken the audit.
- The three requested agent lanes were not used as evidence for this artifact;
  the checkpoint is based on the refreshed local scan and the existing fix/source
  review artifacts only.
