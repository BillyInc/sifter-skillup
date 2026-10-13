# JAMB Sciences Lane C checkpoint 014 — targeted evidence-hold recheck

**Date/accessed:** 2026-09-28 (Africa/Lagos)  
**Scope:** evidence-held Sciences offering contexts listed at checkpoint 013 only; no re-review of previously confirmed contexts.  
**Authority searched:** current official JAMB IBASS Sciences brochure, <https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf>.

## Confirmed from exact official title–awarder blocks

| Occurrence | JAMB name | Institution(s) in held occurrence | Official locator | Result |
|---|---|---|---|---|
| Sciences hold | Physics/Industrial Physics | BENIN, UNIZIK | p. 481 | Exact heading is followed by BENIN and UNIZIK. Promoted to `source_text_confirmed`. |
| Sciences hold | Computer Science and Information Science | BINGHAM, LCITY | p. 624 | Exact heading is followed by BINGHAM and LCITY. Promoted to `source_text_confirmed`; kept distinct from Computer Science and Information Technology. |
| Sciences hold | INFORMATION SCIENCE | UNIOSUN | p. 638 | Exact heading is followed by UNIOSUN. Promoted to `source_text_confirmed`; kept distinct from Information and Media Science and Library and Information Science. |
| Sciences hold | Geography and Environmental Management | GOUU | p. 532 | Exact heading is followed by GOUU and UDA in one block; this held occurrence is GOUU. Promoted to `source_text_confirmed`. |
| Sciences hold | Surveying and Geoinformatics | UNN | `Sciences.txt:4242-4245` | The exact heading and UNN are together; KASU begins the next BUILDING TECHNOLOGY row at lines 4246-4247. Removed KASU from this occurrence and promoted the corrected context. |
| Sciences hold | PURE AND APPLIED BIOLOGY | BOWEN, LAUTECH | `Sciences.txt:10104-10107` | The exact title is followed by BOWEN and LAUTECH. Later APPLIED BOTANY is a distinct row. Promoted to `source_text_confirmed`. |
| Sciences hold | Robotics (Artificial Intelligence) | WIGWE | p. 649; `Sciences.txt:8886-8888` | The exact title and WIGWE awarder are adjacent in the official extraction. Promoted; this resolves the hold retained at checkpoint 013. |

For these four, only the JAMB offering identity/awarder association was confirmed. No admission requirements, curriculum, or downstream mapping was inferred or edited. Evidence source is the official JAMB brochure—not a third-party mirror.

## Targeted official queries recorded

Queries run against the official IBASS Sciences brochure on 2026-09-28:

```text
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "PHYSICS/INDUSTRIAL PHYSICS" "BENIN" "UNIZIK"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "COMPUTER SCIENCE AND INFORMATION SCIENCE" "BINGHAM" "LCITY"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "INFORMATION SCIENCE" "UNIOSUN"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "Geography and Environmental Management" "GOUU"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "ROBOTICS (ARTIFICIAL INTELLIGENCE)" "WIGWE"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "PURE AND APPLIED BIOLOGY" "BOWEN" "LAUTECH"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "SURVEYING AND GEOINFORMATICS" "UNN" "KASU"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "CHEMISTRY" "AAU" "AAUA" "ABU"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "BIOLOGY" "ABUJA" "ADSU"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "COMPUTER SCIENCE AND INFORMATION TECHNOLOGY" "ACHIEVERS" "BABCOCK" "IGBINEDION" "OAUSTECH"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "GEOGRAPHY AND GEOSCIENCES" "JABU" "LAUTECH"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "ANTHROPOLOGY" "IBADAN"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "INDUSTRIAL CHEMISTRY AND CHEMICAL ENTREPRENEURSHIP" "CCU"
site:ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf "INDUSTRIAL AND ENVIRONMENTAL CHEMISTRY" "FOUNTAIN"
```

The official search result snippets exposed the exact programme/awarder sequences for the first four rows. For Surveying, Biology and Robotics, targeted indexed searches were inconclusive or returned neighbouring material; the exact rows were then checked in the checked-in extraction of that same official IBASS Sciences PDF at the cited line locators. In particular, the raw text disproves checkpoint 013's Robotics hold: `ROBOTICS (ARTIFICIAL INTELLIGENCE)` is followed by `WIGWE` at lines 8886-8888 (printed p. 649). The IBASS PDF's direct web-viewer route serves a JavaScript shell, so the official URL and exact extraction locators are retained together.

## Seven remaining evidence holds — recheck results

All were rechecked against the official IBASS Sciences PDF on 2026-09-28. The exact targeted query for each title and listed institution(s) is in the preceding query block; source URL: <https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf>.

| Held occurrence | Official locator/search inspected | Outcome (no promotion) |
|---|---|---|
| Chemistry | `Sciences.txt:2197-2517`, printed pp. 500-501; exact CHEMISTRY block starts with AAU/AAUA/ABU and continues across pages | The local canonical roster includes many codes not bounded by the inspected occurrence. Search snippets confirm the title and some institutions, not the complete current roster. Preserve the hold rather than treating a partial overlap as proof of all associations. |
| BIOLOGY | `Sciences.txt:9714-10102`, printed pp. 667-668; another Biology source occurrence is present | Exact title and first awarders are present, but the canonical institution set crosses/repeats source occurrences and the exact boundary for this held context is unresolved. Keep held. |
| Computer Science and Information Technology | Official indexed table excerpt, printed p. 623 | Exact title and ACHIEVERS/BABCOCK appear together; the held row additionally includes IGBINEDION and OAUSTECH, whose attachment to this exact title was not established in the excerpt. Partial confirmation is not enough to promote the full context. |
| Geography and Geosciences | Exact-title and JABU/LAUTECH searches of the official Sciences brochure | Search results exposed neighboring Geography/Geoscience variants, not the exact title-awarder cell. Preserve the distinct JAMB identity and hold. |
| ANTHROPOLOGY | Sciences `Sciences.txt:10226-10228`; official Arts brochure p. 234 | Sciences lists `ANTHROPOLOGY (BIOLOGICAL)`—not the unqualified title. Arts p. 234 lists ANTHROPOLOGY—IBADAN, establishing a separate faculty context, not the held Sciences association. Keep the Sciences occurrence held; do not merge faculty contexts. |
| Industrial Chemistry and Chemical Entrepreneurship | Official Sciences exact-title/CCU searches; broader Science programme catalogue p. 452 | Search/index surfaces similarly named chemical programmes, not an exact current title–CCU awarding cell. Keep held. |
| Industrial and Environmental Chemistry | Official Sciences exact-title/FOUNTAIN searches; broad Science programme catalogue p. 452 | The catalogue names Industrial and Environmental Chemistry but does not provide its awarding institution there; no exact FOUNTAIN programme/awarder cell was established. Keep held. |

For every retained hold, the recorded disposition is an evidence limitation—not an absence/unavailability finding. No institution was removed unless the official table showed it attached to a different exact title (the KASU/Building Technology boundary in the Surveying correction).

## Not promoted in this increment

The other seven evidence-held occurrences remain held pending enough exact official evidence to reconcile each recorded title and full institution context: Chemistry; BIOLOGY; Computer Science and Information Technology; Geography and Geosciences; ANTHROPOLOGY; Industrial Chemistry and Chemical Entrepreneurship; Industrial and Environmental Chemistry. Chemistry and BIOLOGY each have very large institution rosters whose extracted block boundaries did not match all recorded codes; do not infer that one confirmed code validates the entire roster. Search output for the two industrial chemistry variants surfaced broad catalogue/index entries but did not establish the exact JAMB awarding-institution cell. Anthropology is exact under the separate Arts brochure, not as an unqualified Sciences-faculty row; keep the Sciences occurrence held as a faculty/title mismatch.

Robotics/WIGWE retains checkpoint 013's targeted official-source search and evidence hold. The Arts brochure's exact Anthropology/IBADAN row is a faculty-context mismatch, not evidence for a Sciences-faculty occurrence. No held case is labeled unavailable.

## Cumulative Lane C state

**180 official-source-confirmed, 7 evidence-held, 0 unreviewed of 187 occurrence rows.** This count is occurrence-level, not 420-identity coverage. No previously confirmed row was repeated, and no downstream mapping or seed was changed.

## Regression

`test_jamb_sciences_lane_c_checkpoint_014.py` verifies the seven promoted title–institution sets, official URL, dated locators, and the exact cumulative hold/confirmation counts. The Robotics regression now ensures the exact WIGWE cell remains promoted with its official-source locator.

Verification: the focused set of six Lane C/source-audit scope tests passes (8 tests). A broader `pytest -k jamb_sciences_lane_c` run is not fully green because two checks on previously confirmed, explicitly out-of-scope rows still fail: the Geography row's OOU institution is not in its cited local window, and Applied Zoology's locator omits the faculty-header text expected by its test. These were not re-audited or changed because this increment is restricted to the held rows and must not repeat the 173 already-confirmed contexts. The historical-slice count assertions affected by these seven dispositions were updated to the new 180/7 lane totals.

## Queued next phase — CCMAS source audit only

After this Lane C held-context disposition checkpoint, audit all courses/source structure for exactly these 79 CCMAS programme packages: `allied_health.json` (19), `architecture.json` (6), `basic_medical.json` (2), `computing.json` (7), `medicine_dentistry.json` (2), `pharmacy.json` (2), `sciences.json` (26), `social_sciences.json` (14), and `veterinary.json` (1). First read existing category audits/checkpoints and record already-audited package/course ranges so work is not repeated. This phase is audit/findings only: do not edit CCMAS source data, seeds, or downstream domain/subgroup/role links. Compare each CCMAS package against its authoritative source for programme/course structure, title, code, units, status, content and learning outcomes; detect omissions, truncation, incorrect content, duplicates, code anomalies, and provenance gaps. Save package/course-level source URL, locator, access date, finding/outcome, and verified source-package counts incrementally; add focused regression tests for confirmed extraction/source defects. Do not advance downstream mapping work in this phase.
