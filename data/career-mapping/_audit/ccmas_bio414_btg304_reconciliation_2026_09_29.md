# CCMAS molecular-biology/genetic-engineering course reconciliation — 2026-09-29

## Sources and scope

Compared Biology BIO 414, Science Laboratory Technology BIO 414, and Biotechnology BTG 304 against the [official NUC Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf). Biology BIO 414 appears on printed pp. 98–99; the separate SLT BIO 414 block is on p. 714 and has different contact-hour metadata; BTG 304 appears on printed pp. 121–122.

## Findings and repairs

- Both BIO 414 package rows stored five outcomes even though their respective source blocks contain four; the fifth local outcome duplicated outcome 3. Removed only that duplicate and restored the full contents summary. Kept Biology's 15 LH/45 PH separate from SLT's 30 LH/no PH value.
- The source lists “marriage” among molecular-biology applications. This unusual source wording is recorded as a source anomaly rather than silently corrected or passed off as a verified application in the learner summary.
- Biotechnology BTG 304's local content was truncated mid-word at “character.” Restored its complete scope through cloning/host transformation, gene manipulation and editing, CRISPR, GMO production, diagnosis/gene therapy, transgenic organisms and the Human Genome Project. Its three outcomes and metadata were preserved.
- Each repaired package-specific record now has the NUC URL, printed locator and access date.

## Verification

`test_sciences_bio414_btg304_repairs_2026_09_29.py` verifies the BIO 414 duplicate removal in both contexts, preserves their distinct metadata, and checks BTG 304's full source-topic coverage.
