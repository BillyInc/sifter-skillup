# ISCO domain-code source closure — 4 September 2026

This audit closes every one of the eight raw occupational-code values that had been left as an unresolved ISCO-08 check. The source review found that some values were legacy International Standard Classification of Occupations 1988 codes, while others were not valid four-digit unit groups in the official International Standard Classification of Occupations 2008 structure.

## Result

- Raw values reviewed and closed: **8**.
- Legacy values mapped by the official correspondence table: **2**.
- Cross-domain value removed rather than misassigned: **1**.
- Invalid values removed from canonical anchors: **5**.
- Records left pending: **0**.

## Source method

The official International Labour Organization correspondence table was checked first for a legacy 1988 meaning and a 2008 destination. The destination was then checked against the official 2008 structure and against the meaning of the domain that contained the raw value. A valid code was not inserted merely because it shared the same first three digits. Where no defensible source meaning existed, the value was removed from the canonical anchor list and retained here as a historical data-quality finding.

## Closed decisions

| Raw value | Source meaning | Canonical outcome | Affected domain(s) |
|---|---|---|---|
| `2121` | ISCO-88: Mathematicians and Related Professionals | 2120 — Mathematicians, Actuaries and Statisticians | D003 Artificial Intelligence |

**2121 — decision:** The ILO correspondence table maps ISCO-88 2121 to ISCO-08 2120. The old value is therefore not an unexplained guess; it is a legacy code with an official correspondence. Replace the legacy anchor with ISCO-08 2120 in the canonical occupational evidence layer.

| `2213` | ISCO-88: Agronomists and Related Professionals | 2132 — Farming, Forestry and Fisheries Advisers | D023 Medicine |

**2213 — decision:** The ILO correspondence table maps ISCO-88 2213 to ISCO-08 2132. Its source meaning is agricultural, so mapping it into Medicine would be a semantic error. Remove 2213 from Medicine. Retain its source meaning for Agriculture only where the role/domain evidence independently supports that placement.

| `2214` | No official unit-group meaning found | Removed from canonical anchors | D023 Medicine |

**2214 — decision:** The official ILO ISCO-08 structure contains 2211 Medical Doctors, 222 Nursing and Midwifery Professionals, and related groups, but no unit group 2214. The supplied ISCO-88 structure also does not establish this value. Remove from the canonical occupational anchor list; preserve the raw value only in the audit history.

| `2215` | No official unit-group meaning found | Removed from canonical anchors | D023 Medicine |

**2215 — decision:** The official ILO ISCO-08 structure contains 2211 Medical Doctors, 222 Nursing and Midwifery Professionals, and related groups, but no unit group 2215. The supplied ISCO-88 structure also does not establish this value. Remove from the canonical occupational anchor list; preserve the raw value only in the audit history.

| `2216` | No official unit-group meaning found | Removed from canonical anchors | D023 Medicine |

**2216 — decision:** The official ILO ISCO-08 structure contains 2211 Medical Doctors, 222 Nursing and Midwifery Professionals, and related groups, but no unit group 2216. The supplied ISCO-88 structure also does not establish this value. Remove from the canonical occupational anchor list; preserve the raw value only in the audit history.

| `2311` | No official unit-group meaning found | Removed from canonical anchors | D039 Higher Education |

**2311 — decision:** The ILO ISCO-08 structure defines 2310 University and Higher Education Teachers, not 2311. The source library already contains the valid 2310 anchor. Remove from the canonical occupational anchor list; retain 2310 for University and Higher Education Teachers.

| `2321` | No official unit-group meaning found | Removed from canonical anchors | D039 Higher Education |

**2321 — decision:** The ILO ISCO-08 structure defines 2320 Vocational Education Teachers, not 2321. The source library already contains the valid 2320 anchor. Remove from the canonical occupational anchor list; retain 2320 for Vocational Education Teachers.

| `3330` | ISCO-88: Special Education Teaching Associate Professionals | 2352 — Special Needs Teachers | D040 Vocational |

**3330 — decision:** The ILO correspondence table maps ISCO-88 3330 to ISCO-08 2352. The correspondence is partial and the current affected record is a general Vocational domain, so replacing it there would broaden the source meaning incorrectly. Remove 3330 from the general Vocational domain anchor list. Use ISCO-08 2352 only where a separately evidenced special-needs-teaching role is present; do not treat it as a general vocational-training code.

## Source links

- [International Labour Organization ISCO-08 Volume 1 and correspondence table](https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf)
- [International Labour Organization ISCO-08 structure](https://isco.ilo.org/en/isco-08/)
- [International Labour Organization ISCO-88 structure and definitions](https://webapps.ilo.org/public/french/bureau/stat/isco/isco88/)

This closure does not change domain names, subgroup names, roles, or skills. It corrects the occupational-source anchors so that later provenance, curriculum mapping, and SQL generation cannot treat a legacy or invalid code as a current ISCO-08 code.
