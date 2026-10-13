# JAMB offering-source verification — Lane B checkpoint 018

Date: 2026-09-28  
Scope: Medical offering ledger, all 16 assigned canonical rows, awarder-cell audit only. No downstream domain/subgroup/role mapping and no data-ledger writes.

## Source and method

Primary source: [JAMB IBASS Medical/Pharmaceutical/Health Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf), accessed 2026-09-28. The official PDF is JS-gated in the web text view. The checked-in extraction is `data/career-mapping/_jamb_txt/medical.txt`; printed page numbers below refer to the brochure's own page numbers, not PDF viewer page offsets. The brochure says its advertised programmes were received from institutions and approved by competent authorities (printed p. 428).

For each canonical ledger row, compared its title context and institution list with the brochure body, not just the index. Distinct named offerings and text-extraction artefacts are not treated as awarders. Where the ledger unions neighbouring programme lists, the full canonical row remains held even if one or more component lists are visible. No uncertain institution was promoted or removed in the source ledger.

## Row-by-row awarder state

| # | Canonical JAMB row | Brochure locator / finding | State |
|---:|---|---|---|
| 1 | Anatomy | `ANATOMY`, pp. 429–431, and separate `HUMAN ANATOMY`, pp. 431–432. The ledger combines both title contexts and contains the non-awarder token `PROGRAMME/DEGREE`; its 82 entries are not an exact awarder set. | Held; title variants need separate source-cell reconciliation. |
| 2 | Biochemistry | `BIOCHEMISTRY`, p. 432. The seven ledger awarders (CALABAR, IBADAN, IGBINEDION, JOS, LAUTECH, PAMO, UYO) appear under this exact title before `MEDICAL BIOCHEMISTRY` begins. | Confirmed for the seven listed institutions. |
| 3 | Medical Biochemistry | `MEDICAL BIOCHEMISTRY`, pp. 433–434. Its ledger list includes a header token and awarders/titles belonging to adjacent Medical Chemistry, Medical Physics and Biomedical Technology rows. | Held; do not accept the merged 16-entry list as one cell. |
| 4 | Dentistry and Dental Technology | `DENTISTRY AND DENTAL SURGERY`, pp. 434–435, followed by separate Dental Therapy, Dental Technology, Speech Language Therapy and Occupational Therapy contexts, pp. 435–437. The ledger unions these. | Held; separate degree titles/awarder cells. |
| 5 | Human Nutrition and Dietetics | `HUMAN NUTRITION AND DIETETICS` and `NUTRITION AND DIETETICS`, pp. 438–439. The ledger has 33 institution codes plus the stray title fragment `DIETETICS`. | Held; institution union is plausible, but exact membership must be reconciled without the fragment. |
| 6 | Medical Laboratory Technology/Science | Medical Laboratory Science body, pp. 439–445. Ledger contains `PROGRAMME/DEGREE` and fragments from the preceding Human Nutrition title as well as the institution list. | Held; 133-entry list is not an exact awarder cell. |
| 7 | Medical Rehabilitation | `MEDICAL REHABILITATION`, p. 445, followed by distinct Prosthesis and Orthopaedic Technology/Prosthetics and Orthotics and Nursing contexts. The ledger's 162 entries include those separate offerings and most of the Nursing list. | Held; severe adjacent-row union. |
| 8 | Public Health Technology | Public/community health offerings, pp. 455–463, appear under multiple distinct titles (including Public Health Technology, Public Health Science, Environmental Health, Health Information Management, and healthcare/hospital-management titles). The ledger unions these contexts. | Held; not an exact Public Health Technology awarder cell. |
| 9 | Medicine and Surgery (Human Medicine) | `MEDICINE AND SURGERY`, pp. 463–470, followed/interleaved with separate named medical offerings. The 103-entry ledger contains non-awarder title fragments (e.g. Alternative Medicine, Medicinal Chemistry, Doctor of Pharmacy). | Held; canonical awarder list is contaminated by neighbouring offerings. |
| 10 | Physiotherapy | `PHYSIOTHERAPY` and `DOCTOR OF PHYSIOTHERAPY`, pp. 475–482. Ledger includes the fragment `PROGRAMME/DEGREE` and `DOCTOR OF OPTOMETRY`/HUSTECH from the next title context. | Held; separate titles and stray items prevent whole-row confirmation. |
| 11 | Pharmacology | `PHARMACOLOGY` and separate `PHARMACOLOGY AND THERAPEUTICS` / Pharmaceutical Sciences contexts, pp. 476–479. The 103-entry ledger includes the separate title fragments. | Held; do not treat the union as Pharmacology-only. |
| 12 | Radiography | `RADIOGRAPHY`, pp. 483–485, followed by distinct Radiography and Radiation Science, Radiography and Medical Imaging, Medical Radiography, Audiology, and Veterinary Medicine headings. The 59-entry ledger unions them. | Held; distinct title/awarder cells need separation. |
| 13 | Nursing/Nursing Science | `NURSING/NURSING SCIENCE`, pp. 447–455. The ledger's 153 institution codes form one continuous title context; no adjacent programme title token was found in this list. | Confirmed as a single brochure title context; 153 awarder entries. |
| 14 | Optometry | `OPTOMETRY`, pp. 470–471. The 17 ledger institution codes occur in the matching title context; later Doctor of Optometry entries are separate and are not folded into this list. | Confirmed for the 17 listed institutions. |
| 15 | Pharmacy | `PHARMACY`, pp. 471–473. The 36 ledger institution codes align with the Pharmacy title context; separately titled Doctor of Pharmacy entries are not included in this ledger list. | Confirmed for the 36 listed institutions. |
| 16 | Physiology | `PHYSIOLOGY` and `HUMAN PHYSIOLOGY`, pp. 477–481. The 60 ledger entries are institution codes across these two explicit title variants; no unrelated title/header tokens were found in this list. | Confirmed as the two-title variant union; retain source distinction in any later offering-level use. |

### Reconciliation

- Medical rows audited: **16/16**.
- Awarder cells safe to confirm as represented in the ledger: **5/16** (Biochemistry, Nursing/Nursing Science, Optometry, Pharmacy, and the explicitly combined Physiology/Human Physiology title variants).
- Rows held from promotion: **11/16** (Anatomy, Medical Biochemistry, Dentistry and Dental Technology, Human Nutrition and Dietetics, Medical Laboratory Technology/Science, Medical Rehabilitation, Public Health Technology, Medicine and Surgery, Physiotherapy, Pharmacology, Radiography). Held means the source-context ledger is contaminated or title-ambiguous; it does not mean JAMB has no offering or awarders.
- No source-ledger rows were changed. The two noncanonical index-only names already recorded in checkpoint 017 remain census gaps and were not added to the canonical JAMB set.
- Lane B assigned scope now has **87/87 occurrence rows audited** across Social/Management 53, Education 12, Law 6, and Medical 16. Existing held findings remain held; this closes the assigned source-context audit pass, not every held source claim.
- The queued CCMAS source audit may now begin as a separate audit-only phase. It must not be represented as downstream mapping verification.

## Curriculum-baseline rule (user clarification, 2026-09-28)

For any later JAMB-to-curriculum/domain mapping, NUC CCMAS is the adequate
national curriculum baseline. Do not hold that national baseline solely
because a particular university's additional 30% implementation curriculum is
unavailable. Keep national CCMAS evidence distinct from institution-specific
implementation; use authoritative external curriculum evidence only when
CCMAS is absent or genuinely insufficient. JAMB brochure title/faculty/awarder
verification remains a separate task and must continue even when no
university-specific syllabus is published. A JAMB awarder cell proves the
offering association, not the university's delivered curriculum. Identify any
existing mapping row for which the 30% caveat was the sole hold before treating
it as a remaining blocker.

## Focused test

```powershell
python -m pytest --basetemp .pytest-tmp-lane-b-medical-018 `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_medical_018.py -q
```

Result recorded after execution: `1 passed`.
