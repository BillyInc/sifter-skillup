# Programme curriculum data-quality audit (2026-10-02)

This is a read-only audit of the checked-in parsed CCMAS records. It is not a claim that the source PDFs themselves are wrong. The audit separates source wording from appended parser/maintainer notes and identifies where the legacy flattened profile cannot be used as student-facing data.

## Result

- Parsed programmes: **237**
- Course-outcome rows: **75472**
- Rows with appended annotations: **20**
- Programmes with legacy-profile boundary findings: **237**

## Sociology finding

Sociology has **236** course-outcome rows and **227** exact-normalised course outcomes. Its legacy profile contains **239** rows, including **7** broad employability rows that are not course outcomes. The legacy profile therefore cannot be presented as one clean list of what Sociology teaches.

The Sociology GST 212 record contains an appended LIS exception note. That note is source-maintainer metadata, not Sociology learning content, and is excluded from the student contract. The SOC 407 formatting note is treated the same way while its source wording remains available to staff audit.

## Required contract boundary

1. Course outcomes stay attached to their programme and course locator.
2. Employability/ways-of-working records stay in a separate programme abilities layer; they are not mixed into course outcomes.
3. The legacy `skills_profile*` arrays remain audit evidence until regenerated from these boundaries.
4. A programme reaches a domain only through an explicit programme-to-domain mapping edge. Programme skills may explain that edge's carry-over and additions, but they must not become generic domain foundations.
5. Domain, subgroup and role records are independently owned. No role aggregate, subgroup list or domain list may be copied into another layer.
6. An annotated, ambiguous or parser-failed row is staff-review-only unless the source record is corrected and re-audited.

## Generated artifacts

- Machine-readable audit: `data/career-mapping/_audit/programme_curriculum_quality_2026-10-02.json`
- The next clean-contract builder must consume the course records and this audit, not the legacy flattened arrays.
