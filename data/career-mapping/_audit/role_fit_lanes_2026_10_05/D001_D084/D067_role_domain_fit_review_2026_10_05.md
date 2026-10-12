# D067 — Dentistry: role-to-parent-domain fit

**Slice:** 12/12 exact mappings reviewed against role tasks and the stored parent-domain scope. Canonical data unchanged.

| Disposition | Count |
|---|---:|
| Supported | 11 |
| Conditional | 0 |
| Unsupported | 1 |
| Unresolved | 0 |

## Exact decisions

| Role | Result | Task-based rationale |
|---|---|---|
| Dental Assistants | supported | The tasks are chairside clinical support, sterilization, patient preparation and oral-care instructions under dentist direction; the ADA describes these as dental-assistant duties. |
| dental chairside assistant | supported | The role assists dental practitioners during clinical treatment and follows their supervision/orders, directly matching the dental-care team in the domain. |
| dental hygienist | supported | The task performs preventive periodontal/oral care and oral-hygiene advice under supervision, directly within dentistry; the exact legal scope remains jurisdiction-specific. |
| Dental Hygienists | supported | The task administers oral-hygiene care, assesses patient needs and supports disease prevention, directly matching the parent domain. |
| dental instrument assembler | unsupported | The task assembles dental instruments and devices in a manufacturing/cleanroom setting. It does not provide dental examination, treatment, laboratory fabrication of patient-specific dental appliances, or clinical support. |
| Dental Laboratory Technicians | supported | The task constructs and repairs dentures and dental appliances, directly matching the dental-technician/laboratory function in the stored domain scope. |
| dental practitioner | supported | The task prevents, diagnoses and treats diseases and anomalies of teeth, mouth, jaws and adjacent tissues; it is a direct dentistry fit. |
| dental technician | supported | The task manufactures custom dental devices to a dental practitioner's directions and specifications, matching dental laboratory work. |
| Dentists, All Other Specialists | supported | O*NET defines this residual occupation as dentists not listed separately; that is a dentist-specialist category and therefore within the dentistry parent domain, although the particular specialty is not specified by this task record. |
| Dentists, General | supported | The task examines, diagnoses and treats diseases/injuries of teeth and gums and provides preventive care, directly matching the domain. |
| Oral and Maxillofacial Surgeons | supported | The task diagnoses and surgically treats disease, injury or defects of the oral/maxillofacial region; the ADA identifies oral and maxillofacial surgery as a dental specialty. |
| specialist dentist | supported | The task prevents, diagnoses and treats oral disease with specialization in oral surgery or orthodontics, directly within dentistry. |

## Evidence and limits

The [ADA dental-assistant profile](https://www.ada.org/resources/careers/career-pathways/dental-assistant) describes chairside support; ADA's [dental-laboratory-technician profile](https://www.ada.org/resources/careers/career-pathways/dental-laboratory-technician) covers custom dental prostheses; its [CODA programme page](https://www.ada.org/sitecore/content/ADA-Organization/ADA/CODA/home/find-a-program) identifies oral/maxillofacial surgery as a dental specialty. O*NET task profiles are linked per mapped occupation, including [general dentists](https://www.onetonline.org/link/summary/29-1021.00) and the residual [Dentists, All Other Specialists](https://www.onetonline.org/link/summary/29-1029.00). ADA delegation guidance notes that duties and legal scope vary by jurisdiction.

The unsupported instrument-assembler task concerns manufacturing dental equipment, not providing dentistry or making patient-specific dental appliances.

- Exact queue-key coverage: 12/12; 11 supported, 0 conditional, 1 unsupported, 0 unresolved.
- Canonical taxonomy files were not edited.
