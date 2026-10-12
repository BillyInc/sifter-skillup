# CCMAS MSE 301 source repair checkpoint — 2026-09-28

**Source:** NUC, *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Engineering and Technology*, official PDF: <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf> (accessed 2026-09-28).

**Exact locator:** printed pp. 878–879, `MSE 301: Minerals Processing Engineering I`, learning outcomes and course contents. The global course structure also lists the course at printed p. 859.

**Confirmed defect and repair:** the local Materials Engineering `MSE 301` row had eight oceanography outcomes unrelated to its course title, no content summary, and no item-level source locator. Replaced the unrelated outcomes with the six NUC outcomes (mineral/ore deposits; mineral concentration; ore upgrading; flowsheet design; NIAFlow; ore-slurry mathematics), restored a source-faithful content summary, and attached the official source URL and printed-page locator. Course identity, units, status and lecture hours were already consistent with the NUC table and were not changed.

**Regression test:** `test_ccmas_mse301_source_repair_2026_09_28.py` checks the six source outcomes, expected mineral-processing content and source locator, and prevents the unrelated marine-sediment outcome from returning.
