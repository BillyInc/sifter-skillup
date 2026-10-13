# Global role coverage inventory checkpoint: D065–D069

Date: 2026-10-06

## Scope and control

This is the fifth five-domain batch in the D045–D084 global role-coverage-gap inventory. It follows the saved D060–D064 checkpoint; D045–D064 were not re-audited. The register is evidence-led candidate inventory only. It does not modify canonical taxonomy, active mappings, role-to-domain decisions, or role-to-subgroup/specialization links. The D045–D084 role-to-parent fit lane remains a separate completed 563/563 review; its D084 correction proposals remain unapplied.

## Rebuilt counts

Counts were read from current `domain_structure.json` and cross-checked against exact domain keys in `D045_D084_parent_domain_review_worklist.json`:

| Domain | Current active mappings | Coverage disposition |
|---|---:|---|
| D065 Translation, Interpretation and Linguistics | 4 | Sparse; interpreter distinction and localization are candidates; language-industry title overlap needs review. |
| D066 Veterinary Science | 21 | Broad but includes many complementary/alternative animal therapy records; veterinary epidemiology is a specialization candidate, not yet a separate role proposal. The existing Nigeria registration statement is jurisdiction-specific, not a global requirement. |
| D067 Dentistry | 12 | Existing role families cover the described scope; no distinct additional global role justified in this pass. Nigerian registration language in the domain description must remain a local licensing note. |
| D068 Allied Health and Rehabilitation Therapies | 38 | Broad; therapeutic radiotherapy and clinical prosthetist/orthotist tasks may be absent as distinct families, pending exact-key review against radiographer and technician records. |
| D069 Aviation and Aerospace Operations | 27 | Broad; flight operations officer/flight dispatcher is a candidate family distinct from pilots and air traffic controllers. Licensing is jurisdiction-dependent. |
| **Batch total** | **102** | |

Running total: 25/40 domains recorded (D045–D069); 15 remain (D070–D084). Active mapping counts across recorded domains sum to 366. This sum is a count of current active mappings in the register, not a candidate-role total.

## Evidence-backed candidate findings

- D065: ILO ISCO-08 defines written translation and spoken/signed interpretation tasks separately within one broad unit group; the European Commission language-industry source identifies localization specialist among established industry titles. Candidate families require exact-key and task-overlap review before any canonical addition.
- D066: FAO field veterinary epidemiology and WOAH veterinary public-health material support surveillance/outbreak-response work as a real veterinary specialization. Current evidence does not establish that it should be a separate role record rather than a veterinarian/official-veterinarian specialization.
- D067: no extra role candidate retained; the scan did not establish a missing distinct global occupation beyond the listed dentistry and support families.
- D068: WHO’s radiotherapy team guidance distinguishes radiation-therapy delivery from diagnostic imaging; ISPO standards distinguish clinical prosthetist/orthotist assessment and prescription from technician fabrication work.
- D069: ICAO Annex 6 and its flight-follow-up training package recognize flight operations officer/flight dispatcher tasks. State/operator rules determine licensing; no Nigerian variant was asserted.

## Source and quality controls

The register adds source entries for all candidate references and the batch test checks that each reference resolves to an HTTPS source record. No direct Nigerian source was found for any new Nigeria-specific occupational variant; therefore each candidate is marked `none_verified`. D066 and D067 contain Nigeria registration language in the pre-existing domain descriptions; the checkpoint explicitly separates that national licensing context from global role scope.

Validation command:

```powershell
python -m unittest data.career-mapping._audit.role_coverage_lanes_2026_10_05.D045_D084.test_role_coverage_candidate_register -v
```

Next batch: D070–D074. Do not repeat D045–D069.
