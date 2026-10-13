# JAMB Sciences lane C checkpoint 010

**Date:** 2026-09-28 (Africa/Lagos)  
**Lane:** JAMB offering-source verification, Sciences brochure  
**Status:** occurrences 161–180 reviewed; 19 newly source-confirmed, 1 previously confirmed occurrence rechecked  
**Previous checkpoint:** `jamb_sciences_lane_c_checkpoint_2026-09-28_009.md`  
**Official source:** [IBASS Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf)  
**Source access date:** 2026-09-28

## Increment result

Each listed identity was checked against the current official IBASS Sciences
brochure's programme/degree and awarding-institutions table. Titles and
institution codes below are supported by item-specific locator ranges in the
official-source text extraction. Rows with wrapped titles retain all relevant
line ranges in the ledger. The existing source-confirmed Environmental Science
and Technology row was rechecked; its brochure spelling `ENVRIONMENTAL` is
retained as source evidence rather than silently corrected. Requirements data
was not inferred, edited, or expanded in this identity-source pass.

| Occurrence | Catalogue identity — institution | Official source locator | Result |
|---:|---|---|---|
| 161 | Zoology and Aquaculture — CALEB | `Sciences.txt:5410-5413` | Newly confirmed |
| 162 | Animal Biology and Environment — BENIN | `Sciences.txt:5418-5422` | Newly confirmed |
| 163 | Conservation Biology — AUN | `Sciences.txt:5491-5494` | Newly confirmed |
| 164 | Conservation and Environmental Biology — ADUN | `Sciences.txt:5494-5498` | Newly confirmed |
| 165 | Environmental Science and Technology — WESLEYUNI | `Sciences.txt:5491-5505` | Existing confirmation rechecked; source title typo retained |
| 166 | Environmental Biology — MAIDUGURI | `Sciences.txt:5504-5507` | Newly confirmed |
| 167 | Environmental Biology and Fisheries — AAUA | `Sciences.txt:5508-5510` | Newly confirmed |
| 168 | Marine Science and Technology — FUTA | `Sciences.txt:5512, 5532-5535` | Newly confirmed; wrapped/extracted table flow |
| 169 | Aviation Business — AAAU | `Sciences.txt:5540-5541` | Newly confirmed |
| 170 | Geoscience — AKSU | `Sciences.txt:6867-6870` | Newly confirmed |
| 171 | Earth Science — LAUTECH | `Sciences.txt:6875-6876` | Newly confirmed |
| 172 | Sport Science — ABUAD | `Sciences.txt:6972-6976` | Newly confirmed |
| 173 | Microbiology and Biotechnology — ABUAD | `Sciences.txt:7375-7378` | Newly confirmed |
| 174 | Microbiology/Parasitology — DANUMS | `Sciences.txt:7379-7382` | Newly confirmed |
| 175 | Biology/Biotechnology — DANUMS | `Sciences.txt:7383-7385` | Newly confirmed |
| 176 | Microbiology and Industrial Biotechnology — CALEB | `Sciences.txt:7391-7394, 7420-7424` | Newly confirmed; title/awardee carried across extracted table flow |
| 177 | Industrial Microbiology — IMSU | `Sciences.txt:7422-7425` | Newly confirmed; kept distinct from occurrence 176 |
| 178 | Environmental Chemistry and Toxicology — GSU | `Sciences.txt:7589-7594` | Newly confirmed |
| 179 | Energy and Petroleum Studies — NOVENA | `Sciences.txt:7596-7599` | Newly confirmed |
| 180 | Parasitology and Entomology — UNIZIK | `Sciences.txt:7600-7604` | Newly confirmed |

The separate adjacent programme identities above were not collapsed merely
because their names or subject areas overlap. The existing `evidence_hold`
records elsewhere in the Sciences ledger were not reconsidered or changed.

## Verification and cumulative counts

The focused regression test checked all 20 catalogue positions, exact title and
institution evidence, source URL/access date, provenance status and locator
coverage. It passed before this checkpoint was written:

```text
python -m pytest data/career-mapping/_audit/test_jamb_sciences_lane_c_rows_141_160.py \
  data/career-mapping/_audit/test_jamb_sciences_lane_c_rows_161_180.py -q
2 passed
```

| State | This increment | Sciences cumulative |
|---|---:|---:|
| Newly source-confirmed | **19** | **167 source-confirmed** |
| Previously confirmed and rechecked | **1** | included above |
| Explicit evidence holds | **0** | **13 holds** |
| Not yet reviewed | — | **7 unreviewed** |
| Total occurrences | **20** | **187** |

## Scope guard and next boundary

Only Sciences occurrences 161–180 in `sciences_offerings.json`, their focused
regression assertions, and this append-only checkpoint were updated. No
occurrence 001–160 was re-audited; the prior slice test's cumulative-count
expectation was adjusted to account for this completed increment. CCMAS,
downstream domain/subgroup/role mappings, SQL and UI remain out of scope.
Next boundary: occurrence **181**.
