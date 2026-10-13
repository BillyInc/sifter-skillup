# Specialization lane reconciliation checkpoint 010 — D057–D091

Date: 2026-10-05. Continues after D066; D069 is next.

## Reconciled lane accounting

- Assigned range: **35 domain IDs**.
- Prior carried reviews with evidence present and not repeated: **7** — D085–D091.
- Prior carried as reviewed, but their specialization review artifacts are missing in this checkout: **2** — D067 Dentistry and D068 Allied Health. The `_audit/domains/D067.json` and `D068.json` files are role inventories, not specialization reviews.
- Newly examined in this continuation: **10** — D057–D066.
- Source-reviewed candidate recommendations with shared-register evidence: **9 total** — seven carried with entries already present (D085–D091) plus D059 and D061 newly reconciled.
- Provisional/unclosed: **26 total** — eight provisional current-continuation reviews (D057, D058, D060, D062–D066), sixteen unexamined (D069–D084), and two prior carried cases (D067/D068) whose source records are unavailable.
- Next domain: **D069**.

“Closed” means source evidence and a documented candidate recommendation are present in the shared register. It does not mean canonical implementation, academic sign-off or role assignment. This is stricter than the prior checkpoint’s carried-forward count, because D067/D068 source reviews could not be verified in the current repository.

## Shared-register reconciliation

The shared register `data/career-mapping/_audit/domain_specialization_review_2026_10_03.json` now contains additive D059 and D061 review entries and their cited source records. D085–D091 were already present. D067/D068 remain absent; no specialization decision has been reconstructed from their role inventories. The reconciliation script refuses to overwrite existing domain or source IDs.

## D066 — Veterinary Science

The current three records mix scientific subject matter with veterinarian and technician occupation levels. The provisional eight-area synthesis is Companion Animal Medicine and Surgery; Equine Medicine and Surgery; Livestock, Poultry and Aquatic Animal Health and Production; Veterinary Public Health, Food Safety and Epidemiology; Veterinary Clinical Disciplines and Diagnostics; Wildlife, Zoo and Conservation Medicine; Animal Welfare, Behaviour and Clinical Nutrition; Laboratory Animal Science and Veterinary Research.

WOAH provides international competency/curriculum and veterinary-public-health framing. RCVS provides a detailed but UK-specific specialist structure. The eight areas are an internal synthesis, not a global taxonomy; species/context versus cross-species discipline boundaries and count remain open. Three computational lexical hits do not support a separate computational-veterinary area. No roles or canonical data changed.

Artifacts: `D066_specialization_review.json` and `.md`.

## Verification

```powershell
python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091 data/career-mapping/_audit/specialization_lanes_2026_10_05/D093_D168/test_d098_specialization_review.py
```

Result: **48 passed**. Next domain: D069.
