# Brochure subject inventory and programme/university audit

Generated from the repository source layer. This is an audit report, not a seed generator.

## What the count means

- Current `subject_catalog`: **46** rows total; **25** tagged for UTME and **46** tagged for O-level.
- Core brochure offering files: **450** records and **418** unique JAMB names.
- Brochure enrichment: **296** files covering **293** unique JAMB names.
- Structured requirement seed: **482** option rows covering **355** programmes.
- Seed university catalogue: **7888** school/programme offering pairs across **778** schools.

Therefore, **44 is only the current app catalogue size**. It is not the number of subject-like terms in the brochure evidence. The brochure also contains aliases, broad groups, O-level technical/trade components, direct-entry subjects, and institution-specific prose; these must not all become selectable UTME subjects.
- The known catalogue terms appear under **32** distinct catalogue codes in UTME-labelled brochure fields and **40** codes in O-level-labelled fields. This is a source-usage count, not a claim that every occurrence is a valid exam-layer rule.

## Mapping rule used in this audit

1. A subject combination is attached first to the exact JAMB programme name in the brochure/registry.
2. A university is eligible to display only when the seed has a `school_programmes` row for that JAMB programme.
3. University-specific remarks are kept separate from the programme-wide requirement; they are not silently merged into one universal requirement.
4. Structured options are treated as exact only when their required/alternative items are encoded. Unparsed prose remains review text.

## Review candidates not in the current catalogue

These are exact phrases found in brochure evidence, not automatic additions:

| Phrase | Fields found | Programme count | Decision |
|---|---:|---:|---|
| bleaching | olevel_requirement (6), direct_entry (2) | 4 | needs catalogue review |
| block laying | olevel_requirement (5) | 3 | needs catalogue review |
| botany | direct_entry (41), utme_subjects (1) | 29 | needs catalogue review |
| bricklaying block laying | olevel_requirement (5) | 3 | needs catalogue review |
| building engineering drawing | olevel_requirement (4), direct_entry (2) | 3 | needs catalogue review |
| business management | direct_entry (49), utme_subjects (2) | 49 | needs catalogue review |
| business methods | olevel_requirement (9), utme_subjects (1) | 10 | needs catalogue review |
| business studies | direct_entry (2), utme_subjects (1) | 3 | needs catalogue review |
| carpentry | olevel_requirement (5) | 3 | needs catalogue review |
| ceramics | direct_entry (2), olevel_requirement (7) | 5 | needs catalogue review |
| colour mixing matching and glazing | direct_entry (2), olevel_requirement (6) | 4 | needs catalogue review |
| concreting | olevel_requirement (5) | 3 | needs catalogue review |
| construction | olevel_requirement (12), direct_entry (2) | 8 | needs catalogue review |
| decorative painting | direct_entry (2), olevel_requirement (7) | 5 | needs catalogue review |
| dyeing and finishing | olevel_requirement (6), direct_entry (2) | 4 | needs catalogue review |
| engineering drawing | olevel_requirement (4), direct_entry (2) | 3 | needs catalogue review |
| environmental science | utme_subjects (2), olevel_requirement (1), direct_entry (1) | 2 | needs catalogue review |
| general metal work | olevel_requirement (4), direct_entry (2) | 3 | needs catalogue review |
| general wood work | olevel_requirement (4), direct_entry (2) | 3 | needs catalogue review |
| geology | direct_entry (20) | 14 | needs catalogue review |
| graphic printing | direct_entry (2), olevel_requirement (7) | 5 | needs catalogue review |
| graphics design | olevel_requirement (10) | 3 | needs catalogue review |
| information technology | utme_subjects (3), direct_entry (2), olevel_requirement (1) | 4 | needs catalogue review |
| introduction to building construction | direct_entry (2), olevel_requirement (6) | 5 | needs catalogue review |
| joinery | olevel_requirement (5) | 3 | needs catalogue review |
| lining | direct_entry (2), olevel_requirement (7) | 5 | needs catalogue review |
| machine printing and finishing | direct_entry (2) | 1 | needs catalogue review |
| printing origination | direct_entry (2) | 1 | needs catalogue review |
| secretarial duties | olevel_requirement (12), utme_subjects (1) | 12 | needs catalogue review |
| shorthand | olevel_requirement (4) | 3 | needs catalogue review |
| sign and design | direct_entry (2), olevel_requirement (6) | 4 | needs catalogue review |
| spinning | olevel_requirement (6), direct_entry (2) | 4 | needs catalogue review |
| spray painting | olevel_requirement (4), direct_entry (2) | 3 | needs catalogue review |
| statistics | direct_entry (34), olevel_requirement (11) | 34 | needs catalogue review |
| study skills | utme_subjects (1) | 1 | needs catalogue review |
| surface design and printing | olevel_requirement (6), direct_entry (2) | 4 | needs catalogue review |
| textile | olevel_requirement (4) | 2 | needs catalogue review |
| typewriting | olevel_requirement (4) | 3 | needs catalogue review |
| wall floors and ceiling finishing | olevel_requirement (4) | 2 | needs catalogue review |
| wall hanging | direct_entry (2), olevel_requirement (7) | 5 | needs catalogue review |
| weaving | olevel_requirement (6), direct_entry (2) | 4 | needs catalogue review |
| zoology | direct_entry (45), utme_subjects (2) | 32 | needs catalogue review |

The full provenance for every candidate and every programme/university join is in the companion JSON report.

## Existing structured-mapping defects found

The current structured seed has **0 errors** and **49 warnings**. Examples include alternatives encoded as if all subjects were required, empty options for broad prose, and declared five-subject minima whose encoded mandatory combination is larger. These defects mean the current matcher cannot yet be treated as proof of eligibility.

| Programme | Exam layer | Finding |
|---|---|---|

## Mapping coverage

- Core source names not in the JAMB registry: **2**.
- Registry names without a core offering-source row: **0**.
- Registry programmes with structured options: **351**.
- Unique core source programmes with both a registry ID and structured option rows: **351**.

No seed rows were changed by this audit. The next correction step is to approve the candidate terms by exam layer and then repair malformed option groups before regenerating subject options.
