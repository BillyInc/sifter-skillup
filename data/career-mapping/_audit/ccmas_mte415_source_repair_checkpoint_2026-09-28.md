# CCMAS MTE 415 source repair checkpoint — 2026-09-28

**Source:** NUC, *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Engineering and Technology*, official PDF: <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf> (accessed 2026-09-28).

**Exact locators:** Metallurgical Engineering programme table, printed p. 815; detailed MTE 415 course block and outcomes, printed p. 841.

**Confirmed defect and repair:** local MTE 415's title had absorbed adjacent GET 499 SIWES text, and its outcome list included the laboratory-manual note and next-level heading. Corrected the title and retained only the three MTE 415 learning outcomes, normalizing the source's obvious `prracticals` typo to `practicals`. Attached the source URL and access date.

**Conflict preserved:** the programme table lists MTE 415 as status `C`, while the detailed block says status `E`. The local structured status remains `C` because that matches the programme table; the item locator explicitly records the source conflict. No guess was used to reconcile it.

**Regression test:** `test_ccmas_mte415_source_repair_2026_09_28.py` protects the corrected title/outcomes and checks that the C-versus-E conflict remains documented.
