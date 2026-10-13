# JAMB Sciences Lane C checkpoint 015 — held-context source continuation

**Date/accessed:** 2026-09-28 (Africa/Lagos)  
**Previous checkpoint:** 014. This increment resumes only the seven occurrences left on hold there; it does not repeat the 173 previously confirmed at checkpoint 013 or the seven dispositions already recorded in 014.  
**Authority:** official JAMB IBASS Sciences brochure, <https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf>.  
**Scope:** JAMB offering title/awarder context only. No CCMAS, admission-requirement, or downstream mapping inference.

## Cross-phase user rule preserved

Do not stop extracting or validating a JAMB offering because an institution-specific syllabus or its additional 30% is unavailable. Verify the exact brochure programme title, faculty/source context, institution-awarder association and distinct offering occurrence; preserve identical names in separate contexts. This JAMB source evidence proves the offering association only, not that the university follows a particular detailed curriculum. For the queued curriculum phase, NUC CCMAS remains the adequate national curriculum baseline; use institution-specific/external sources only where CCMAS is absent or genuinely insufficient.

## Resolved in this increment

| Held offering | Exact source locator | Outcome |
|---|---|---|
| Industrial Chemistry and Chemical Entrepreneurship — CCU | `Sciences.txt:2536-2540`, printed p. 507 | Exact wrapped title at lines 2536–2538 is followed by CCU at line 2539. Promoted to `source_text_confirmed`. The neighboring Chemistry and Industrial Chemistry/ABSU and Pure Chemistry rows remain distinct. |
| Industrial and Environmental Chemistry — FOUNTAIN | `Sciences.txt:2655-2659` | Exact wrapped title at lines 2655–2657 is followed by FOUNTAIN at line 2658; APPLIED CHEMISTRY/CALABAR starts a separate row. Promoted to `source_text_confirmed`. |

Each promoted occurrence now stores the exact source title, URL, extraction locator, access date `2026-09-28`, and an item-specific evidence note. Requirements remain blank/shared as the official table presents them; this source check does not add or infer requirements.

## Remaining five evidence holds

| Held offering | Official evidence rechecked | Outcome |
|---|---|---|
| Chemistry | Official source window `Sciences.txt:2197-2517`, printed pp. 500–507; exact CHEMISTRY cell begins at line 2197. Its current 180-code local institution roster still has 28 codes not evidenced within that exact cell/window: DANUMS, DOMINION, EL-AMIN, ESUTECH, FUTA, HAVILLA, KHAIRUN, KKU, PEACELAND UNI, LANDMARK, MADONNA, MARANATHA, MC-IBRU, MEWAR, NOK, OBONG, OAUSTECH, PC-UNI, PETER-UNI, PRU, REDEEMERS, RENAISSANCE, SAISA, TECH-IBADAN, TRINITY, UNIHEZ, UNI-ILESA, VISION-UNI. | Keep held: partial title and list overlap do not establish the complete offering roster; some unmatched names may belong to neighboring chemistry variants. Not an unavailability finding. |
| BIOLOGY | Official source window `Sciences.txt:9714-10102`, printed pp. 667–676; exact BIOLOGY row begins at 9714 and later distinct Biology variants are separately headed. The current local roster has 31 institution codes not located in the held cell/window. | Keep held: the local institution union crosses/repeats source contexts; do not treat one exact Biology row as proof for all 128 local codes. Not an unavailability finding. |
| Computer Science and Information Technology | Exact-title official IBASS indexed result exposes the title with ACHIEVERS and BABCOCK (printed p. 623); targeted official query also tested IGBINEDION and OAUSTECH. | Keep held: the evidence retrieved does not establish the complete four-institution list on one exact awarder cell. Partial confirmation is not promoted as a complete context. |
| Geography and Geosciences | Targeted exact-title official IBASS query checked JABU and LAUTECH; nearby Geography, Geoscience, Geology and related rows are distinct entries. | Keep held: no exact title-and-awarder cell for both listed institutions was located in the official source evidence. |
| ANTHROPOLOGY | Sciences extraction `Sciences.txt:10226-10228` prints `ANTHROPOLOGY (BIOLOGICAL)` with IBADAN; separate official IBASS Arts brochure p. 234 lists unqualified `ANTHROPOLOGY` with IBADAN. | Keep the Sciences occurrence held: the Arts row is evidence for a separate faculty context and does not establish an unqualified Sciences offering. Do not collapse the two contexts. |

Queries continued on 2026-09-28 against the official IBASS Sciences PDF, including:

```text
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "COMPUTER SCIENCE AND INFORMATION TECHNOLOGY" "IGBINEDION"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "COMPUTER SCIENCE AND INFORMATION TECHNOLOGY" "OAUSTECH"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "GEOGRAPHY AND GEOSCIENCES" "JABU"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "GEOGRAPHY AND GEOSCIENCES" "LAUTECH"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "CHEMISTRY" "AAU" "AAUA" "ABU" "UNN"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "BIOLOGY" "ABUJA" "ADSU" "UMUDIKE" "UNIOSUN"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "ANTHROPOLOGY" "IBADAN"
```

The earlier checkpoint 014 records the prior query strings for these same held rows and the separate Arts-faculty Anthropology check. The two chemistry promotions were resolved from the checked-in text extraction of that same official PDF; exact line locators and page context are recorded above. Official source text is treated as authoritative; third-party mirrors are not used.

## Lane C regression corrections and remaining broad-suite status

The user corrected two out-of-range regression defects: Geography’s evidence locator now begins at the OOU awarder cell (line 4101), and Applied Zoology now points to its own APPLIED ZOOLOGY/OOU/BAUCHI block (lines 5414–5416), distinct from the preceding CALEB row. These two corrections are present in the shared worktree and their respective range checks now pass.

The broad Lane C test selection currently has two different failures outside this held-only continuation: the already-confirmed Pure and Industrial Chemistry occurrence in rows 021–040 lists UNN outside that test’s cited source window, and the rows 081–100 test carries a stale expected cumulative count. The latter is updated to this checkpoint’s count; the former is not reopened or altered because its range was already confirmed and is outside this increment.

## Cumulative status after checkpoint 015

**182 official-source-confirmed, 5 evidence-held, 0 unreviewed of 187 occurrence rows.** This held-context pass is complete: all five residual holds have an explicit outcome and remain held only because exact JAMB title-awarder context is not fully reconciled—not because an institution-specific syllabus or its additional 30% is missing. The holds are evidence limitations, not unavailability decisions. This is an occurrence-level Sciences count, not a claim that other JAMB faculties are fully audited. No downstream mapping, CCMAS scope, seed, SQL, or UI was inspected or changed.

## Queue

After the held-only Sciences Lane C work is closed, resume the already-queued source audit of the 79 CCMAS packages in checkpoint `ccmas_selected_79_source_audit_checkpoint_2026-09-28_001.md`. Pharmacology's incremental audit is saved in `ccmas_pharmacology_source_audit_2026-09-28_001.md`; it remains audit-only, and no other package work should begin until Lane C is complete.
