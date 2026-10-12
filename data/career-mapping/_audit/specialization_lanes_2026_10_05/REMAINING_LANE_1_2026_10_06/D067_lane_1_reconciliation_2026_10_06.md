# D067 — Dentistry

Global-first lane-1 reconciliation against the current catalogue. This is evidence and an exact patch recommendation, not an applied canonical change.

- Inherited source-review artifact: data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D067_specialization_review.json
- Candidate area count: 8
- Source records / unique URLs: 12 / 6
- Current subgroups: 3 stored, 0 visible, 3 excluded
- Current active roles: 5
- Role→domain fit evidence: {'not_recorded': 5}
- Computational audit status: not_in_method_signal_queue

## Candidate areas

- **Oral and Maxillofacial Surgery** — Advanced surgical education, scope and credentialing are jurisdiction-specific; this is not an entry-level permission.
- **Orthodontics and Dentofacial Orthopedics** — Terminology and specialist recognition differ across countries.
- **Pediatric and Special Care Dentistry** — Special-care provision can be part of general practice or a specialist service depending on jurisdiction; do not imply a universal specialist title.
- **Endodontics** — A distinct advanced practice area in multiple systems, but local specialty recognition and credential routes vary.
- **Periodontology** — The label is internationally recognizable; legal recognition and postgraduate routes remain local.
- **Prosthodontics and Implant Dentistry** — Implant dentistry is a practice focus that can overlap prosthodontics, surgery and periodontology; do not claim it is a separate universally recognized specialty.
- **Oral Medicine, Diagnosis and Orofacial Pain** — Oral medicine, oral pathology, radiology and orofacial pain may be separate formal specialties in some jurisdictions; this combined learner area is not a claim they are identical professions.
- **Dental Public Health** — Population-level practice differs from individual clinical care; public-health training and specialist title are jurisdiction-specific.

## Exact reconciliation recommendation

- Action: replace_or_reconcile_current_subgroup_records_before_activation
- Canonical patch recommendation: Retain candidate labels and boundaries as a reviewable patch set; retire only explicitly excluded records during local integration, then add only approved candidate areas.
- Guard: Do not activate role→specialization links until parent scope and independent role→domain fit are signed off.

## Current structure (read-only)

- Stored subgroup labels: Health professionals, Health associate professionals, Assemblers
- Visible subgroup labels: (none)

## Evidence

- unidentified — publisher not captured — title not captured — https://adee.org/activities/special-interest-groups/concluded-sigs/monitoring-assessment-undergraduate-endodontology — locator: not captured — scope screen: scope_not_established_in_inherited_record
- ADEE_ENDODONTICS_GUIDELINES — Association for Dental Education in Europe and European Society of Endodontology — Monitoring & Assessment in undergraduate Endodontology; towards a European standard — https://adee.org/activities/special-interest-groups/concluded-sigs/monitoring-assessment-undergraduate-endodontology — locator: Description of European Society of Endodontology undergraduate curriculum guidelines and a distinct discipline-specific progression from preclinical work to patient care. — scope screen: scope_not_established_in_inherited_record
- unidentified — publisher not captured — title not captured — https://adee.org/graduating-european-dentist/graduating-european-dentist-curriculum — locator: not captured — scope screen: scope_not_established_in_inherited_record
- ADEE_DENTAL_CURRICULUM — Association for Dental Education in Europe — Graduating European Dentist Curriculum — https://adee.org/graduating-european-dentist/graduating-european-dentist-curriculum — locator: Curriculum domains: professionalism, safe/effective clinical practice, patient-centred care, dentistry and society, and research. — scope screen: scope_not_established_in_inherited_record
- unidentified — publisher not captured — title not captured — https://adee.org/sites/default/files/bsspd-survey.pdf — locator: not captured — scope screen: scope_not_established_in_inherited_record
- ADEE_PROSTHODONTIC_CURRICULUM — Association for Dental Education in Europe / British Society for Prosthodontics — Undergraduate Curriculum for Indirect Restorations and Removable Prosthodontics — https://adee.org/sites/default/files/bsspd-survey.pdf — locator: Curriculum scope includes scientific/evidence foundations, general prosthodontic outcomes, indirect restorations and removable prosthodontics. — scope screen: scope_not_established_in_inherited_record
- unidentified — publisher not captured — title not captured — https://fdiworlddental.org/specialization-dentistry — locator: not captured — scope screen: global_or_international_or_comparative
- FDI_SPECIALIZATION_POLICY_2025 — FDI World Dental Federation — Specialization in Dentistry — https://fdiworlddental.org/specialization-dentistry — locator: General Assembly policy revised September 2025; Context and Policy statements on distinct, well-defined fields requiring post-graduate training beyond general dentistry and on recognition/variation between countries. — scope screen: global_or_international_or_comparative
- unidentified — publisher not captured — title not captured — https://ncrdscb.ada.org/recognized-dental-specialties — locator: not captured — scope screen: scope_not_established_in_inherited_record
- ADA_RECOGNIZED_DENTAL_SPECIALTIES — National Commission on Recognition of Dental Specialties and Certifying Boards, American Dental Association — Recognized Dental Specialties — https://ncrdscb.ada.org/recognized-dental-specialties — locator: Current recognized-specialties page: twelve U.S.-recognized areas and criteria distinguishing advanced, unique specialties from predoctoral general dentistry. — scope screen: scope_not_established_in_inherited_record
- unidentified — publisher not captured — title not captured — https://www.who.int/health-topics/oral-health — locator: not captured — scope screen: global_or_international_or_comparative
- WHO_ORAL_HEALTH — World Health Organization — Oral Health — https://www.who.int/health-topics/oral-health — locator: Overview of oral health and major conditions including caries, periodontal disease, tooth loss, oral cancer, trauma and congenital conditions. — scope screen: global_or_international_or_comparative

## Residuals and limits

- FDI is the international dental federation, but its policy gives principles rather than a single universal specialty list.
- ADA specialty recognition and certification are explicitly United States-specific.
- ADEE is European dental education guidance; it supports curriculum structure, not worldwide licensure.
- This review is an internal taxonomy recommendation, not external academic sign-off or clinical authorization.
- The candidate set remains noncanonical and requires local reconciliation.

No role-to-specialization links were assigned. Nigerian context was not researched or added. ISCO/subgroup membership was not used as fit proof.
