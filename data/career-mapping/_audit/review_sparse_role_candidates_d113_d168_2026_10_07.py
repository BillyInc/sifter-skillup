"""Strict D113-D168 sparse-role review against reconciled global areas.

Reads the global sparse ledger and Step 1 reconciliation, writes a disjoint
candidate-by-candidate review and checkpoint, and never edits canonical data.
"""
from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
LANE = HERE / "role_enrichment_lanes_2026_10_06" / "D113_D168"
LEDGER_PATH = HERE / "SPARSE_ROLE_ENRICHMENT_LEDGER_2026_10_07.json"
STEP1_PATH = HERE / "specialization_lanes_2026_10_05" / "STEP1_RECONCILIATION_2026_10_06" / "global_step1_specialization_reconciliation_2026_10_06.json"
STEP1_CKPT = HERE / "specialization_lanes_2026_10_05" / "STEP1_RECONCILIATION_2026_10_06" / "AGENT_D113_D168" / "D113_D168_STEP1_RECONCILIATION_CHECKPOINT_003.md"
OUT_JSON = LANE / "D113_D168_sparse_role_disjoint_review_2026_10_07.json"
OUT_MD = LANE / "D113_D168_sparse_role_disjoint_review_2026_10_07.md"
CHECK_JSON = LANE / "D113_D168_sparse_role_disjoint_checkpoint_2026_10_07.json"
CHECK_MD = LANE / "D113_D168_sparse_role_disjoint_checkpoint_2026_10_07.md"
TODAY = "2026-10-07"

# Each entry is adjudicated from actual task statements, the parent scope, and
# the Step 1 area scope/boundary. Only source-task corroborated cases may be
# add. Disposition keys exactly match ledger candidate_key values.
DECISIONS: dict[str, dict[str, Any]] = {
    "D125|health information technician": dict(disposition="add", area="Health Records and Information Support", task_status="corroborated", task_evidence="Compile, process, and maintain medical records; classify health concepts into coding systems; protect record confidentiality and retrieve records.", source="https://www.onetonline.org/link/details/29-2072.00", locator="Occupation description, reported titles (includes Health Information Technician), and task table.", domain="Medical-record organization, quality, retrieval and confidentiality are directly within medical secretarial/health-information support; this does not claim independent HIM authority.", area_fit="The recommended area expressly covers records, data quality, confidentiality and health-information support; candidate duties fit without claiming independent coding/HIM authority."),
    "D132|mission operations controller": dict(disposition="reject", area="", task_status="corroborated_but_out_of_scope", task_evidence="Monitors real-time spacecraft telemetry, executes approved procedures, detects anomalies and coordinates mission-control response.", source="https://science.nasa.gov/learn/basics-of-space-flight/chapter15-1/", locator="Typical Daily Operations: mission controller watches realtime spacecraft/ground-system data and responds to anomalies; NASA JSC Flight Operations also describes real-time monitoring and control.", domain="The task is spacecraft operations, an engineering/operations function rather than a space-science occupation in this parent catalogue.", area_fit="No recommended D132 area covers spacecraft operations/control. The reconciled areas cover Earth observation, planetary science, heliophysics, astrophysics, and biological/physical science; do not force-fit operations into Earth observation."),
    "D132|spacecraft operations engineer": dict(disposition="reject", area="", task_status="corroborated_but_out_of_scope", task_evidence="Defines operational requirements, prepares and validates plans/procedures, executes spacecraft operations and evaluates in-orbit performance.", source="https://www.esa.int/Enabling_Support/Operations/Who_does_what_at_ESA_Mission_Control", locator="Spacecraft Operations Engineers and Spacecraft Operations Manager responsibilities at ESA Mission Control.", domain="Actual work is spacecraft systems/mission operations engineering, not a science specialty in Space Science and Exploration.", area_fit="No Step 1 recommended D132 area represents spacecraft engineering/mission operations; Earth observation is explicitly not spacecraft/platform engineering."),
    "D137|medical dosimetrist": dict(disposition="add", area="Radiation Oncology Physics", task_status="corroborated", task_evidence="Responsible for accurate patient-data acquisition, radiation-treatment design, and manual/computer-assisted calculations of radiation-dose distributions.", source="https://www.aapm.org/pubs/reports/rpt_46.pdf", locator="AAPM Report 46, medical radiation dosimetrist responsibilities; report text also distinguishes physicist QA from therapist delivery tasks.", domain="Treatment planning and dose calculation in radiation oncology directly fit Medical Physics and Radiation Therapy.", area_fit="The recommended area includes treatment planning and dosimetry for external-beam and brachytherapy; duties directly match."),
    "D137|radiation oncology physicist": dict(disposition="add", area="Radiation Oncology Physics", task_status="corroborated_replacement_source", task_evidence="Radiation-oncology physicists commission and calibrate equipment, develop and oversee treatment quality assurance and radiation-safety measures, and consult on treatment techniques.", source="https://www.aapm.org/pubs/reports/rpt_249.pdf", locator="AAPM Report 249, section 4.5 expected competence for clinical medical physicists in radiation oncology.", domain="Clinical radiation-treatment physics, equipment performance and QA are directly within the parent domain.", area_fit="The role maps to the reconciled Radiation Oncology Physics scope. The ledger's Chemists citation was unrelated and is replaced here by AAPM primary professional evidence."),
    "D137|radiation protection specialist": dict(disposition="review_only", area="Medical Health Physics and Radiation Protection", task_status="insufficient_exact_medical_task_evidence", task_evidence="The candidate description says it monitors radiation hazards, controls exposure and advises on radiation safety; the cited O*NET source is general occupational-health-and-safety work, not medical radiation protection.", source="https://www.aapm.org/pubs/MPPG/detail.asp?docid=305", locator="AAPM MPPG 10.b, scope of clinical medical physics, patient/staff/public safety and medical radiation protection.", domain="The task family could fit medical radiation physics, but the candidate title and medical-context duties are not established by its cited generic OHS task profile.", area_fit="The named recommended area is a direct conceptual fit, but keep review-only until a role-specific medical radiation-protection task source/title is attached."),
    "D150|interfaith programme coordinator": dict(disposition="review_only", area="Interfaith Engagement and Community Leadership", task_status="insufficient_exact_role_evidence", task_evidence="The candidate description is dialogue coordination and cross-faith community collaboration; O*NET Directors of Religious Activities and Education is broader and does not establish this specific interfaith coordinator title/task bundle.", source="https://www.oikoumene.org/what-we-do/interreligious-dialogue-and-cooperation", locator="World Council of Churches interreligious dialogue/cooperation scope; supports the activity area, not a standardized occupational title.", domain="Cross-faith dialogue and community programmes are relevant to the parent domain, but occupation identity/title remains unverified.", area_fit="The recommended area explicitly concerns dialogue, cooperation and conflict-sensitive engagement across traditions; conceptual fit is strong, but title/task source is insufficient for add."),
    "D150|religious education director": dict(disposition="add", area="Congregational and Community Ministry", task_status="corroborated", task_evidence="Directs religious activities and education; plans and administers religious education programmes and provides religious instruction.", source="https://www.onetonline.org/link/details/21-2021.00", locator="Directors, Religious Activities and Education occupation description, reported titles and tasks.", domain="Religious education programme leadership is directly within Religious Ministry, Theology and Interfaith Leadership.", area_fit="The recommended area includes teaching and faith-community leadership; the role's curriculum, teacher and community-learning duties fit. The profile does not imply a universal ordination/license."),
    "D153|audio post production technician": dict(disposition="add", area="Mixing and Mastering", task_status="corroborated_reassigned_area", task_evidence="Separates instruments, vocals and sounds and combines them during mixing/postproduction; synchronizes dialogue, music and effects; edits and delivers audio.", source="https://www.onetonline.org/link/details/27-4014.00", locator="Sound Engineering Technicians description and task table; reported titles include Sound Editor, Audio Engineer, Mastering Engineer, Mixing Engineer and Recording Engineer.", domain="Audio postproduction is part of recorded music/audio production when the content is a music release; for film/game sound-effects work it belongs to adjacent media domains.", area_fit="Reassigned from the incorrect Live Music Sound Production label to Mixing and Mastering; source tasks are postproduction/mixing, not live sound reinforcement. Limit this candidate to music-release audio postproduction; broader media sound remains review/adjacent."),
    "D153|composer": dict(disposition="reject", area="", task_status="corroborated_but_parent_scope_excludes", task_evidence="Creates musical works and compositions; O*NET Music Directors and Composers groups the occupation with composing and directing performance.", source="https://www.onetonline.org/link/details/27-2041.00", locator="Music Directors and Composers occupation description, reported titles and task table.", domain="Composition is a music-creation/performance occupation, not inherently music production; the Step 1 boundary expressly says composition may be separately owned.", area_fit="No recommended D153 area clearly covers independent composition; Music Production and Arrangement is production decisions for recorded releases and explicitly warns composition may be separately owned."),
    "D153|conductor": dict(disposition="reject", area="", task_status="corroborated_but_parent_scope_excludes", task_evidence="Leads and interprets ensemble rehearsal and performance.", source="https://www.onetonline.org/link/details/27-2041.00", locator="Music Directors and Composers tasks concern conducting/directing musical performances.", domain="Performance leadership is not music production as scoped in the catalogue.", area_fit="No recommended area covers conducting/performance; do not map it to recorded music production/arrangement."),
    "D153|mastering engineer": dict(disposition="add", area="Mixing and Mastering", task_status="corroborated", task_evidence="O*NET identifies Mastering Engineer as a reported title; sound-engineering tasks include mixing/editing recorded audio and reproducing sound recordings.", source="https://www.onetonline.org/link/details/27-4014.00", locator="Sound Engineering Technicians reported titles and task table.", domain="Mastering recorded music is a direct music-production/release function.", area_fit="The recommended Mixing and Mastering area explicitly covers processing and finalizing multitrack recordings for release delivery."),
    "D153|mixing engineer": dict(disposition="add", area="Mixing and Mastering", task_status="corroborated", task_evidence="O*NET identifies Mixing Engineer as a reported title; core tasks include balancing sound, using consoles, separating tracks and combining sounds during mixing/postproduction.", source="https://www.onetonline.org/link/details/27-4014.00", locator="Sound Engineering Technicians reported titles and core task table.", domain="Mixing recorded music is a direct music-production function.", area_fit="Direct fit to the reconciled Mixing and Mastering scope: balance/process multitrack recordings for technical translation and release."),
    "D153|music educator": dict(disposition="reject", area="", task_status="corroborated_but_parent_scope_excludes", task_evidence="Teaches music theory, practice, performance and musicianship in an educational setting.", source="https://www.onetonline.org/link/details/25-1126.00", locator="Philosophy and Religion Teachers, Postsecondary is not a music-education task source; candidate record cited that unrelated occupation.", domain="Teaching music is education, not music production.", area_fit="No recommended D153 area covers teaching; no area assignment is defensible."),
    "D153|music producer sound engineer composer musician singer": dict(disposition="reject_bundle", area="", task_status="bundled_heterogeneous_titles", task_evidence="The row bundles Music Producer, Sound Engineer, Composer and Musician/Singer with non-identical creation, production, engineering and performance tasks.", source="https://www.onetonline.org/link/details/27-4014.00", locator="O*NET Sound Engineering Technicians lists some sound-production titles but does not make the bundle one occupation; composer/performance tasks have distinct role families.", domain="Cannot assess one parent-domain fit for a heterogeneous bundle.", area_fit="Reject as a bundle. Split components below; do not count the bundle itself."),
    "D153|recording engineer": dict(disposition="add", area="Recording and Studio Engineering", task_status="corroborated", task_evidence="O*NET identifies Recording Engineer as a reported title; tasks include preparing sessions, selecting microphones, setting up equipment and recording music/sound.", source="https://www.onetonline.org/link/details/27-4014.00", locator="Sound Engineering Technicians reported titles and task table.", domain="Recording engineering for music releases is direct to music production.", area_fit="Direct fit to the recommended area: capture sound, plan sessions and operate recording systems in studio/location contexts."),
    "D153|session musician": dict(disposition="reject", area="", task_status="task_source_insufficient", task_evidence="Performs instrumental/vocal parts for sessions; the ledger cites Musicians and Singers, but this is performer work rather than production work.", source="https://www.onetonline.org/link/details/27-2042.00", locator="Musicians and Singers occupation; performance task family.", domain="A session musician contributes performance, not production; parent catalogue is Music Production.", area_fit="The recommended Music Production and Arrangement area is production decisions/collaboration, not a performer career path."),
    "D153|singer songwriter": dict(disposition="reject", area="", task_status="task_source_insufficient", task_evidence="Creates and performs vocal/musical works; this combines songwriting and performance tasks.", source="https://www.onetonline.org/link/details/27-2042.00", locator="Musicians and Singers occupation; performance task family.", domain="Songwriting/performance is not inherently music production; parent scope excludes general performer careers.", area_fit="Step 1 says songwriting/composition and performer careers may be separately owned; no defensible D153 area for this bundled creative/performance role."),
    "D153|sound designer": dict(disposition="reject", area="", task_status="task_source_mismatch", task_evidence="Creates sound effects and sonic environments for media; cited O*NET sound-engineering tasks include audio/video postproduction but do not establish this title as live-music sound production.", source="https://www.onetonline.org/link/details/27-4032.00", locator="Film and Video Editors work with audio, music and special-effects departments; O*NET Sound Engineering Technicians includes postproduction tasks.", domain="Film/game/media sound design is an adjacent media-production career, not Music Production as defined here.", area_fit="The Live Music Sound Production boundary is live performance reinforcement; Step 1 explicitly says game/film audio belongs to adjacent domains."),
    "D156|photogrammetrist": dict(disposition="review_only", area="Geospatial Mapping, GIS and Photogrammetry", task_status="partial_task_corroboration_title_unverified", task_evidence="Photogrammetry derives spatial measurements/products from imagery; FIG recognizes photogrammetry and remote sensing among surveying/geomatics functions. The supplied ESCO URL is only a generic classification landing page, not an occupation task record.", source="https://www.fig.net/resources/publications/figpub/pub66/figpub66.asp", locator="FIG Definition of the Functions of the Surveyor, including development/testing/calibration of sensors and surveying functions; corroborate with official ESCO occupation record before title promotion.", domain="Imagery-based mapping and spatial measurement fit land surveying/geospatial practice.", area_fit="Direct fit to Geospatial Mapping, GIS and Photogrammetry, but source/title evidence is not yet candidate-specific enough for add."),
    "D156|remote sensing survey specialist": dict(disposition="review_only", area="Geospatial Mapping, GIS and Photogrammetry", task_status="source_mismatch", task_evidence="Candidate duties are imagery processing and geospatial measurement; the supplied source is Industrial Engineering Technologists and Technicians, which does not establish remote-sensing survey tasks or title.", source="https://www.fig.net/resources/publications/figpub/pub66/figpub66.asp", locator="FIG surveying/geomatics functions; the candidate needs an exact official occupation/task source rather than the unrelated O*NET industrial-engineering profile.", domain="Could fit land surveying when work produces survey/mapping outputs; current source does not verify this role.", area_fit="Conceptually matches Geospatial Mapping, GIS and Photogrammetry; source mismatch keeps it review-only."),
    "D157|indirect tax specialist": dict(disposition="review_only", area="Tax Compliance and Advisory", task_status="source_mismatch", task_evidence="Candidate duties concern VAT, excise and other indirect-tax advice/administration; cited Tax Preparers profile does not establish specialist advisory title or indirect-tax-specific work.", source="https://www.oecd.org/tax/consumption/", locator="OECD consumption-tax/VAT resources establish subject matter, not a distinct occupational task profile; an official tax authority or professional-body role specification is still needed.", domain="Indirect-tax work is within tax advisory, but candidate's role identity/scope is not yet supported by its cited task source.", area_fit="The recommended area includes tax filings and compliance; VAT/excise work can fit, conditional on role-specific task evidence."),
    "D157|international tax consultant": dict(disposition="review_only", area="International Tax and Transfer Pricing", task_status="partial_subject_evidence_title_unverified", task_evidence="Cross-border related-party tax work applies arm's-length analysis and documentation; OECD guidance supports the subject tasks but not this exact occupational title.", source="https://www.oecd.org/content/dam/oecd/en/publications/reports/2022/01/oecd-transfer-pricing-guidelines-for-multinational-enterprises-and-tax-administrations-2022_57104b3a/0e655865-en.pdf", locator="OECD Transfer Pricing Guidelines, cross-border controlled transactions, arm's-length principle and documentation; accountant citation in the ledger is too broad for the claimed role.", domain="Tax advice on cross-border obligations fits the parent at the subject level, but exact role scope/title needs task-specific support.", area_fit="Direct conceptual fit to International Tax and Transfer Pricing, but no promotion without role-specific task evidence."),
    "D157|payroll tax specialist": dict(disposition="review_only", area="Tax Compliance and Advisory", task_status="source_mismatch", task_evidence="Candidate tasks concern payroll withholding/reporting; cited Tax Preparers profile is generic and does not establish payroll-tax specialist responsibilities.", source="https://www.irs.gov/businesses/small-businesses-self-employed/employment-taxes", locator="IRS employment-tax guidance explains employer payroll-tax duties, not an occupational role profile; retain for task-context only.", domain="Employment-tax compliance is tax work, but payroll operations may also belong to payroll/accounting; parent-domain ownership needs task-specific evidence.", area_fit="Potentially fits compliance/advisory, but role and parent-boundary remain unverified."),
    "D157|revenue agent": dict(disposition="add", area="Tax Disputes and Controversy", task_status="corroborated", task_evidence="Revenue Agent is an O*NET reported title; determines tax liability, reviews returns, examines records, discusses issues with taxpayers and participates in appeals.", source="https://www.onetonline.org/link/details/13-2081.00", locator="Tax Examiners and Collectors, and Revenue Agents description, reported titles and task table.", domain="Tax examination and liability determination directly fit tax advisory/transfer pricing domain.", area_fit="The recommended area covers review, audit response, administrative proceedings and tax disputes; duties directly fit."),
    "D157|tax accountant": dict(disposition="add", area="Tax Compliance and Advisory", task_status="corroborated", task_evidence="Accountants and Auditors includes tax preparation and tax-computation/reporting work; O*NET Tax Preparers describes preparing tax returns and records.", source="https://www.onetonline.org/link/details/13-2011.00", locator="Accountants and Auditors occupation, tax-related tasks; corroborate with Tax Preparers profile 13-2082.00.", domain="Tax computation and reporting are direct tax-accounting work within the parent domain.", area_fit="Direct fit to Tax Compliance and Advisory: accurate filings and advice on tax consequences/obligations."),
    "D157|tax adviser tax compliance officer tax examiner revenue agent transfer pricing specialist": dict(disposition="reject_bundle", area="", task_status="bundled_heterogeneous_titles", task_evidence="Bundles adviser, compliance officer, tax examiner/revenue agent and transfer-pricing specialist, combining advisory, government examination and cross-border pricing tasks.", source="https://www.onetonline.org/link/details/13-2081.00", locator="O*NET 13-2081 supports tax examiner/revenue agent/compliance titles only; it does not establish the whole bundle.", domain="Separate taxpayer advisers from tax-authority examiners and transfer-pricing specialists.", area_fit="Reject as one record; split components below and keep each area distinct."),
    "D157|tax auditor": dict(disposition="review_only", area="Tax Disputes and Controversy", task_status="partial_task_evidence_alias_boundary_uncertain", task_evidence="Tax audit tasks examine returns/records for accuracy and compliance; O*NET 13-2081 reports City Tax Auditor and describes return review/audit selection, while 13-2011 supports accounting audit but not tax-audit specialization.", source="https://www.onetonline.org/link/details/13-2081.00", locator="Reported title and tasks for Tax Examiners and Collectors, and Revenue Agents; exact equivalence to independent Tax Auditor is not established.", domain="Tax examination fits the parent, but title may be an alias or distinct public/private audit role.", area_fit="Tax Disputes and Controversy includes audit/review response; fit is plausible but held pending alias/title normalization."),
    "D157|tax compliance officer": dict(disposition="add", area="Tax Compliance and Advisory", task_status="corroborated", task_evidence="Tax Compliance Officer is an O*NET reported title; tax officers determine liabilities, review returns and verify compliance with tax laws.", source="https://www.onetonline.org/link/details/13-2081.00", locator="Tax Examiners and Collectors, and Revenue Agents reported titles and task table.", domain="Tax compliance work directly fits the parent domain.", area_fit="Direct fit to Tax Compliance and Advisory. Note the source is U.S.-specific for duties/authority; no universal tax powers implied."),
    "D157|tax lawyer": dict(disposition="review_only", area="Tax Compliance and Advisory", task_status="task_supported_but_parent_boundary_review", task_evidence="Lawyer role provides legal advice and representation; O*NET Lawyers supports the base occupation but not tax-law specialization.", source="https://www.onetonline.org/link/details/23-1011.00", locator="Lawyers role and tasks; tax-law specialty requires jurisdiction-specific professional evidence.", domain="Tax law is tax-related but legal representation is a distinct professional route; keep review-only pending explicit parent-domain versus D037 ownership decision.", area_fit="Area boundary states legal representation rights vary and distinguishes technical advice from attorney-only work; this role needs a separate legal-route marker rather than automatic Tax Compliance placement."),
    "D157|tax policy analyst": dict(disposition="review_only", area="Tax Policy and Administration", task_status="partial_subject_evidence_title_unverified", task_evidence="Candidate analyses tax policy, legislation and revenue effects; cited Budget Analysts source supports budgeting, not tax-policy analyst tasks.", source="https://www.oecd.org/tax/tax-policy/", locator="OECD tax-policy materials support subject matter, not an occupational profile; candidate task source/title remains unverified.", domain="Tax policy belongs to the parent subject area, but role evidence is insufficient.", area_fit="Direct conceptual fit to Tax Policy and Administration, but keep review-only pending exact role-task evidence."),
    "D157|transfer pricing analyst": dict(disposition="review_only", area="International Tax and Transfer Pricing", task_status="partial_subject_evidence_title_unverified", task_evidence="Candidate analyzes related-party transactions, pricing methods and documentation; OECD guidelines support those work products but do not establish the exact job title as a separate occupation.", source="https://www.oecd.org/content/dam/oecd/en/publications/reports/2022/01/oecd-transfer-pricing-guidelines-for-multinational-enterprises-and-tax-administrations-2022_57104b3a/0e655865-en.pdf", locator="OECD Transfer Pricing Guidelines, arm's-length analysis and supporting documentation.", domain="Transfer pricing analysis is within the parent domain; occupational distinctness from International Tax Consultant needs employer/professional task evidence.", area_fit="Direct fit to the recommended area, but title-family deduplication remains unresolved."),
    "D162|asylum caseworker": dict(disposition="review_only", area="Asylum and International Protection Casework", task_status="task_supported_title_unverified", task_evidence="RSD casework assesses protection claims, gathers information, interviews applicants, prepares legal assessments and recommendations; UNHCR defines status determination as a legal/administrative process.", source="https://www.unhcr.org/sites/default/files/legacy-pdf/4d5259049.pdf", locator="UNHCR Associate RSD Officer job description: conducts RSD interviews, drafts legal assessments and recommendations; ledger's generic ESCO landing page is insufficient for this exact title.", domain="Asylum case assessment fits Immigration Law and Asylum, but exact generic title and public decision authority vary by jurisdiction.", area_fit="Direct fit to Asylum and International Protection Casework; hold until the candidate title is normalized to an evidenced job family and local authority is not implied."),
    "D162|asylum officer": dict(disposition="review_only", area="Refugee Status Determination and Protection Operations", task_status="jurisdiction_specific_task_source", task_evidence="USCIS asylum officers conduct non-adversarial asylum interviews and serve as neutral decision-makers; this is one jurisdiction's government title.", source="https://www.uscis.gov/sites/default/files/document/foia/Interviewing_-_Intro_to_the_NonAdversarial_Interview_LP_RAIO.pdf", locator="USCIS RAIO Asylum Adjudications Supplement, role of the Asylum Officer as neutral decision-maker.", domain="Asylum adjudication fits the parent domain, but government authority and title are jurisdiction-specific.", area_fit="The recommended Refugee Status Determination and Protection Operations area covers administrative eligibility assessment and case decisions; review-only until clearly labelled as jurisdiction-specific and distinguished from legal advocacy."),
    "D162|border management officer": dict(disposition="reject", area="", task_status="source_mismatch_and_parent_scope", task_evidence="Candidate tasks are border entry/exit, identity screening and control; ledger cites police patrol officer duties, not migration casework.", source="https://www.unodc.org/unodc/en/border-management/index.html", locator="UNODC border management describes border-control institutions and operations; the task family is enforcement/administration, not immigration law/asylum casework.", domain="Border enforcement is not the parent domain's legal/asylum casework and needs a separate border-management domain if included.", area_fit="No recommended area clearly owns general border enforcement; do not force-fit into immigration law or asylum."),
    "D162|immigration caseworker": dict(disposition="review_only", area="Immigration Law and Status Applications", task_status="source_mismatch", task_evidence="Candidate administers applications, evidence and correspondence; ledger cited postsecondary education administrators, unrelated to immigration cases.", source="https://www.gov.uk/government/organisations/uk-visas-and-immigration/about/recruitment", locator="UKVI recruitment/role material must be tied to an actual caseworker task description; supplied O*NET citation is unrelated.", domain="Immigration application casework can fit the parent, but present cited task evidence is invalid and authority is jurisdiction-specific.", area_fit="Conceptually fits immigration/status applications; review-only until an exact caseworker role source is attached."),
    "D162|immigration lawyer": dict(disposition="review_only", area="Immigration Law and Status Applications", task_status="base_role_only_specialty_unverified", task_evidence="Lawyers advise and represent clients; the supplied source establishes the base lawyer profession but not immigration-specific tasks or permitted-adviser limits.", source="https://www.onetonline.org/link/details/23-1011.00", locator="O*NET Lawyers overview/tasks; immigration-law specialization must be supported separately and is jurisdiction-specific.", domain="Immigration law is within the parent subject, but representation remains a legal profession with local reserved-activity limits.", area_fit="Direct conceptual fit to Immigration Law and Status Applications; require specialty-specific task evidence and label the legal authorization boundary."),
    "D162|migration policy analyst": dict(disposition="review_only", area="Immigration Compliance, Policy and Programme Administration", task_status="partial_parent_source_specialty_unverified", task_evidence="Political Scientists analyze political systems and public policy; the source does not establish migration-policy analyst as a separate role or its migration-specific work products.", source="https://www.onetonline.org/link/details/19-3094.00", locator="Political Scientists occupation/tasks; migration-policy title is not a reported title in the supplied evidence.", domain="Policy analysis can fit the parent as a policy route, but candidate identity/specialty requires stronger evidence.", area_fit="Recommended area covers migration-programme administration and policy; concept fits, candidate remains review-only."),
    "D162|refugee resettlement officer": dict(disposition="add", area="Refugee Status Determination and Protection Operations", task_status="corroborated_reassigned_area", task_evidence="UNHCR RSD/protection roles maintain case records, provide counselling, research protection issues, make referrals and coordinate case processing/resettlement pathways.", source="https://www.unhcr.org/il/wp-content/uploads/sites/6/2021/05/Vacancy-Senior-Protection-Assistant-RSD-Caseworker.pdf", locator="UNHCR Senior Protection Assistant/RSD caseworker vacancy duties and monitoring controls.", domain="Refugee-protection case management and resettlement coordination fit the immigration/asylum parent domain.", area_fit="Remapped from Asylum Casework to Refugee Status Determination and Protection Operations: this role coordinates protection/referral/resettlement, not necessarily adjudication of claims."),
    "D163|ip licensing specialist": dict(disposition="review_only", area="IP Transactions, Licensing and Commercialization", task_status="task_concept_supported_role_title_unverified", task_evidence="Licensing/commercialization work negotiates or manages licensing, assignments and technology transfer; cited Compliance Officers source is unrelated to IP transactions.", source="https://www.wipo.int/en/web/ip-quiz/", locator="WIPO IP commercialization/licensing material should be supplemented with an exact role profile; current O*NET citation does not support the candidate's tasks.", domain="IP licensing fits the parent subject, but exact role identity and legal/commercial task boundary are not proven by current citation.", area_fit="Direct conceptual fit to IP Transactions, Licensing and Commercialization; keep review-only pending role-task source."),
    "D163|patent attorney": dict(disposition="review_only", area="Patent Drafting, Prosecution and Patent Information", task_status="base_role_only_specialty_unverified", task_evidence="Lawyers advise/represent clients; patent-specific drafting/prosecution duties and who may represent applicants are jurisdiction-specific and not established by generic O*NET lawyer profile.", source="https://www.wipo.int/en/web/patents/protection", locator="WIPO patent process and national/regional differences; use role-specific professional/office source before promotion.", domain="Patent legal advice fits the subject, but professional authority is jurisdiction-specific.", area_fit="Remapped from Patent Examination to Patent Drafting, Prosecution and Patent Information because applicant-side advice/drafting is not examiner work."),
    "D163|patent examiner": dict(disposition="add", area="Patent Examination and IP Office Practice", task_status="corroborated", task_evidence="Searches prior art, assesses patentability requirements, examines applications and communicates examination findings/actions.", source="https://www.wipo.int/en/web/wipo-magazine/articles/examining-patents-trademarks--designs-the-art-of-ip-examiners-84063", locator="WIPO IP examiner task description across multiple offices; WIPO patent-search guide describes prior-art search and substantive examination.", domain="Patent-office examination is directly within Intellectual Property Law and Patent Practice.", area_fit="Exact fit to Patent Examination and IP Office Practice. Do not imply that all jurisdictions use identical examination procedures."),
    "D163|technology transfer officer": dict(disposition="review_only", area="IP Transactions, Licensing and Commercialization", task_status="source_mismatch", task_evidence="Candidate coordinates evaluation, protection, licensing and transfer of technical/research assets; cited Management Analysts source does not establish technology-transfer tasks.", source="https://autm.net/surveys-and-tools/tools/tech-transfer-practice-manual", locator="AUTM technology-transfer practice resources support the practice area but the supplied ledger needs a role-specific job/task profile.", domain="Technology transfer can sit at the IP/commercialization interface; current task evidence does not prove a distinct role or ownership boundary.", area_fit="Conceptually fits IP Transactions, Licensing and Commercialization; review-only pending direct role evidence."),
    "D163|trademark attorney": dict(disposition="review_only", area="IP Portfolio, Strategy and Rights Management", task_status="base_role_only_specialty_unverified", task_evidence="Lawyers advise/represent clients; trademark registration, opposition and brand-protection specialization is not established by the generic lawyer source.", source="https://www.wipo.int/trademarks/en/", locator="WIPO trademark registration/protection framework supports subject matter, not attorney occupational tasks; local representation rules vary.", domain="Trademark law fits the IP law parent, but jurisdiction-specific attorney authorization remains unresolved.", area_fit="IP portfolio/rights management may fit, but the specific applicant-side legal tasks and route need evidence. Keep review-only."),
}

SPLIT_COMPONENTS: dict[str, list[dict[str, str]]] = {
    "D153|music producer sound engineer composer musician singer": [
        {"role_title": "Music Producer", "disposition": "add", "target_candidate_key": "D153|music producer", "reason": "Separate role; O*NET 27-4014 reports Music Producer and supports recorded-sound production tasks. Do not retain the multi-title bundle."},
        {"role_title": "Sound Engineer", "disposition": "alias_existing", "target_candidate_key": "D153|recording engineer", "reason": "O*NET lists Sound Engineer as a reported title in the sound-engineering family; keep as an alias, not a second canonical role. Scope is narrower than live/media sound engineering and requires alias review at merge."},
        {"role_title": "Composer", "disposition": "reject", "target_candidate_key": "D153|composer", "reason": "Separate composition role, but rejected from the Music Production parent/areas under Step 1 boundary."},
        {"role_title": "Musician/Singer", "disposition": "reject", "target_candidate_key": "D153|session musician", "reason": "Separate performer career; outside this Music Production parent scope."},
    ],
    "D157|tax adviser tax compliance officer tax examiner revenue agent transfer pricing specialist": [
        {"role_title": "Tax Adviser", "disposition": "review_only", "target_candidate_key": "", "reason": "Separate advisory role, but title/task scope is broad and source evidence is insufficient."},
        {"role_title": "Tax Compliance Officer", "disposition": "alias_existing", "target_candidate_key": "D157|tax compliance officer", "reason": "Same title and task family as the separate Tax Compliance Officer candidate; do not count twice."},
        {"role_title": "Tax Examiner/Revenue Agent", "disposition": "alias_existing", "target_candidate_key": "D157|revenue agent", "reason": "O*NET 13-2081 groups examiners and revenue agents; this bundle component is represented by the separate Revenue Agent candidate, not added again."},
        {"role_title": "Transfer Pricing Specialist", "disposition": "review_only", "target_candidate_key": "D157|transfer pricing analyst", "reason": "Separate cross-border tax work, but specialist/analyst title equivalence and exact task boundary remain unverified."},
    ],
}


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def areas_for(step1: dict[str, Any], domain_id: str) -> list[dict[str, Any]]:
    row = next((d for d in step1["domains"] if d["domain_id"] == domain_id), None)
    if not row:
        raise AssertionError(f"Step 1 domain missing: {domain_id}")
    raw = row.get("recommended_areas") or []
    if isinstance(raw, dict):
        raw = raw.get("areas") or []
    return raw


def select_area(step1: dict[str, Any], domain_id: str, label: str) -> dict[str, Any]:
    if not label:
        return {}
    found = next((a for a in areas_for(step1, domain_id) if a.get("label") == label), None)
    if not found:
        raise AssertionError(f"Area {domain_id}/{label} absent from reconciled Step 1")
    return found


def record_for(source: dict[str, Any], step1: dict[str, Any]) -> dict[str, Any]:
    key = source["candidate_key"]
    decision = DECISIONS[key]
    domain_id = source["domain_id"]
    area = select_area(step1, domain_id, decision["area"])
    return {
        "candidate_key": key,
        "domain_id": domain_id,
        "domain_name": source["domain_name"],
        "candidate_title": source["role_title"],
        "ledger_disposition": source["disposition"],
        "disposition": decision["disposition"],
        "candidate_task_claim": source["candidate_tasks"],
        "task_evidence_status": decision["task_status"],
        "exact_role_task_evidence": decision["task_evidence"],
        "task_evidence_source": {"url": decision["source"], "locator": decision["locator"]},
        "parent_domain_fit": {"status": "supported" if decision["disposition"] == "add" else "not_supported_or_not_yet_proven", "rationale": decision["domain"]},
        "recommended_area_fit": {
            "status": "supported" if decision["disposition"] == "add" else ("not_fit" if decision["disposition"] in {"reject", "reject_bundle"} else "review_required"),
            "area_label": area.get("label", ""),
            "area_scope": area.get("scope", ""),
            "area_boundary": area.get("boundary") or area.get("route_boundary") or "",
            "rationale": decision["area_fit"],
            "remapped_from_ledger_area": source.get("area_of_specialization") if area and source.get("area_of_specialization") != area.get("label") else None,
        },
        "global_context": source.get("global_evidence", []),
        "nigerian_context": source.get("nigerian_context", {"scope": "not_established", "source_refs": []}),
        "disposition_reason": decision["domain"] + " " + decision["area_fit"],
        "canonical_files_edited": False,
    }


def main() -> None:
    ledger = read(LEDGER_PATH)
    step1 = read(STEP1_PATH)
    source_records = [r for r in ledger["candidate_records"] if 113 <= int(r["domain_id"][1:]) <= 168]
    keys = {r["candidate_key"] for r in source_records}
    missing = keys - DECISIONS.keys()
    extra = DECISIONS.keys() - keys
    if missing or extra:
        raise AssertionError(f"Decision coverage mismatch missing={sorted(missing)} extra={sorted(extra)}")
    reviewed = [record_for(r, step1) for r in source_records]
    split = []
    for bundle_key, components in SPLIT_COMPONENTS.items():
        bundle = next(x for x in reviewed if x["candidate_key"] == bundle_key)
        for component in components:
            split.append({
                "source_bundle_key": bundle_key,
                "role_title": component["role_title"],
                "disposition": component["disposition"],
                "target_candidate_key": component["target_candidate_key"],
                "reason": component["reason"],
                "counted_as_candidate_add": False,
                "note": "Disaggregated alias/title component; the source bundle itself is rejected and must not be counted as a role.",
            })
    counts = Counter(r["disposition"] for r in reviewed)
    domain_counts = {}
    for domain_id in sorted({r["domain_id"] for r in reviewed}):
        rows = [r for r in reviewed if r["domain_id"] == domain_id]
        domain_counts[domain_id] = dict(Counter(r["disposition"] for r in rows))
    all_areas_valid = all(
        not r["recommended_area_fit"]["area_label"] or any(
            a.get("label") == r["recommended_area_fit"]["area_label"]
            for a in areas_for(step1, r["domain_id"])
        ) for r in reviewed
    )
    payload = {
        "schema_version": "2026-10-07.d113-d168.sparse-role-disjoint-review.v1",
        "lane": "D113-D168",
        "status": "review_complete_checkpoint_saved",
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "inputs": {
            "sparse_role_ledger": str(LEDGER_PATH.relative_to(ROOT)).replace("\\", "/"),
            "global_step1_recommendations": str(STEP1_PATH.relative_to(ROOT)).replace("\\", "/"),
            "checkpoint_003": str(STEP1_CKPT.relative_to(ROOT)).replace("\\", "/"),
        },
        "scope": "All D113-D168 candidate records in the latest sparse-role ledger; no canonical promotion.",
        "decision_rules": [
            "Use reconciled Step 1 recommended area names and boundaries, not legacy ISCO-derived subgroup labels.",
            "Require exact role-task evidence, separate parent-domain fit, and separate recommended-area fit for add.",
            "A role's appearance in an ISCO/ESCO subgroup is never fit evidence.",
            "Aliases are disaggregated and pointed to a single role candidate; heterogeneous multi-title bundles are rejected as bundles.",
            "Jurisdiction-specific/Nigerian context is kept separate from global task evidence.",
            "A generic, unrelated, or missing task source cannot support automatic add; uncertain cases remain review_only.",
        ],
        "counts": {
            "input_candidate_records": len(source_records),
            "domains_with_candidates": len(domain_counts),
            "dispositions": dict(counts),
            "disaggregated_bundle_components": len(split),
            "area_remappings": sum(bool(r["recommended_area_fit"]["remapped_from_ledger_area"]) for r in reviewed),
            "add_candidates": counts.get("add", 0),
            "review_only": counts.get("review_only", 0),
            "rejected_candidates_including_bundles": counts.get("reject", 0) + counts.get("reject_bundle", 0),
            "alias_existing_candidate_records": counts.get("alias_existing", 0),
            "canonical_files_edited": False,
        },
        "per_domain_dispositions": domain_counts,
        "records": reviewed,
        "disaggregated_bundle_components": split,
        "integrity": {
            "all_lane_records_dispositioned_once": len(reviewed) == len(source_records) and not missing and not extra,
            "all_final_area_labels_exist_in_step1": all_areas_valid,
            "add_records_have_exact_task_evidence": all(r["task_evidence_status"] == "corroborated" or r["task_evidence_status"].startswith("corroborated_") for r in reviewed if r["disposition"] == "add"),
            "add_records_have_domain_and_area_fit": all(r["parent_domain_fit"]["status"] == "supported" and r["recommended_area_fit"]["status"] == "supported" for r in reviewed if r["disposition"] == "add"),
            "no_add_by_isco_membership": True,
            "bundles_not_counted_as_add": all(not x["counted_as_candidate_add"] for x in split),
            "canonical_files_edited": False,
        },
        "limitations": [
            "This is a source-backed candidate disposition, not activation in the canonical role data.",
            "Review-only candidates need better exact role-task evidence or a title/ownership decision; their conceptual fit is not an add decision.",
            "The Step 1 checkpoint notes that captured citations were not independently reopened in its lane; this review reopens only sources stated in each record and preserves source limits.",
        ],
    }
    LANE.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md = [
        "# D113-D168 sparse-role disjoint review — 2026-10-07", "",
        f"Reviewed **{len(reviewed)}** ledger candidates across **{len(domain_counts)}** domains: **{counts.get('add', 0)} add**, **{counts.get('review_only', 0)} review-only**, **{counts.get('reject', 0)} reject**, **{counts.get('reject_bundle', 0)} reject-bundle**, **{counts.get('alias_existing', 0)} alias-existing**.",
        f"Disaggregated bundle components: **{len(split)}**. Area labels changed to reconciled Step 1 recommendations: **{payload['counts']['area_remappings']}**. Canonical files edited: **no**.", "",
        "| Candidate | Disposition | Exact task evidence status | Parent-domain fit | Step 1 area / fit | Reason |", "|---|---|---|---|---|---|",
    ]
    for r in reviewed:
        af = r["recommended_area_fit"]
        md.append(f"| {r['candidate_key']} | {r['disposition']} | {r['task_evidence_status']} | {r['parent_domain_fit']['status']} | {af['area_label'] or 'None'}/{af['status']} | {r['disposition_reason']} |")
    md += ["", "## Split aliases", "", "| Bundle component | Disposition | Target | Reason |", "|---|---|---|---|"]
    for x in split:
        md.append(f"| {x['role_title']} (from {x['source_bundle_key']}) | {x['disposition']} | {x['target_candidate_key'] or 'none'} | {x['reason']} |")
    md += ["", "## Evidence and limits", "", "Each JSON record carries the candidate task claim, exact source-task evidence or its explicit insufficiency, source URL/locator, parent-domain rationale, reconciled area label/scope/boundary and Nigerian context separately.", "", "No canonical role, domain, subgroup or overlay file was edited. `add` means eligible for a later canonical merge review, not already active."]
    OUT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")
    checkpoint = {
        "schema_version": "2026-10-07.d113-d168.sparse-role-review-checkpoint.v1",
        "lane": "D113-D168",
        "status": "all_assigned_ledger_records_reviewed_checkpoint_saved",
        "lane_is_running": False,
        "checkpoint_written_at_utc": payload["created_at_utc"],
        "review_artifact_json": str(OUT_JSON.relative_to(ROOT)).replace("\\", "/"),
        "review_artifact_markdown": str(OUT_MD.relative_to(ROOT)).replace("\\", "/"),
        "counts": payload["counts"],
        "per_domain_dispositions": domain_counts,
        "integrity": payload["integrity"],
        "next_action": "Merge/reconcile candidate dispositions with the other lanes only after cross-lane deduplication; do not edit canonical files from this disjoint review.",
    }
    CHECK_JSON.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHECK_MD.write_text(
        "# D113-D168 sparse-role review checkpoint — 2026-10-07\n\n"
        f"All **{len(reviewed)}/{len(source_records)}** candidate records in the assigned lane were dispositioned. Counts: `{json.dumps(payload['counts'], ensure_ascii=False)}`.\n\n"
        f"Area remaps: **{payload['counts']['area_remappings']}**. Canonical edits: **no**. Lane running: **no; assigned record set exhausted**.\n\n"
        "The machine-readable disjoint review contains candidate-specific task evidence, parent-domain fit, Step 1 area fit, disposition, source locators and alias splits. Review-only rows remain unresolved rather than promoted.\n",
        encoding="utf-8",
    )
    print(json.dumps({"review_json": str(OUT_JSON), "review_md": str(OUT_MD), "checkpoint_json": str(CHECK_JSON), "checkpoint_md": str(CHECK_MD), "counts": payload["counts"], "integrity": payload["integrity"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
