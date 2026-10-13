"""Write the source-reviewed D137-D142 specialization lane batch.

Only review artifacts and this batch checkpoint are written; canonical career
taxonomy files are deliberately not loaded or modified.
"""
from __future__ import annotations

import json
import argparse
from pathlib import Path

HERE = Path(__file__).resolve().parent

ROWS = [
    {
        "domain_id": "D137", "domain_name": "Medical Physics and Radiation Therapy", "current_subgroup_count": 4,
        "current_subgroups": ["Science and engineering professionals (1 role)", "Health professionals (3 roles)", "Science and engineering associate professionals (1 role)", "Health associate professionals (2 roles)"],
        "current_state": "The four child labels are broad ISCO occupation families, not areas of specialization. They obscure distinct clinical physics practices and combine professional/associate levels rather than learning areas.",
        "parent_scope_disposition": "The root combines medical physics with radiation-therapy and diagnostic-imaging occupations. Keep the science/technical scope explicit: application of physics to clinical imaging, nuclear medicine, therapeutic radiation and radiation protection. Radiographers and radiation therapists are distinct regulated clinical professions, not automatically medical-physics specializations; their learning routes need separate profession-specific ownership or carefully bounded cross-links.",
        "candidate_areas": [
            {"label": "Radiation Oncology Physics", "scope": "Physics, treatment planning, dosimetry, equipment quality assurance and safety for external-beam and brachytherapy services.", "route_boundary": "Distinguish the medical physicist's planning/QA remit from the radiation therapist's patient setup and treatment-delivery remit; local authorization is jurisdiction-specific."},
            {"label": "Diagnostic and Interventional Imaging Physics", "scope": "Image formation, equipment performance, optimization and radiation protection in diagnostic/interventional X-ray imaging and related modalities.", "route_boundary": "Clinical image acquisition by radiographers is a connected profession, not the same specialization."},
            {"label": "Nuclear Medicine Physics", "scope": "Radiopharmaceutical imaging and measurement systems, quantitative imaging, instrumentation and associated radiation safety.", "route_boundary": "Separate from nuclear medicine physician practice and from general radiation oncology."},
            {"label": "Medical Health Physics and Radiation Protection", "scope": "Protection of patients, staff and the public from medical ionizing-radiation hazards, exposure assessment and safety practice.", "route_boundary": "This is medical-context radiation protection; broader environmental or industrial health physics is outside the parent."},
            {"label": "Non-Ionizing Medical Radiation Physics", "scope": "Physics and safety of non-ionizing medical radiation and associated clinical measurement technologies.", "route_boundary": "Keep modality-specific clinical authorization and the relationship to imaging professions explicit."},
            {"label": "Physiological Measurement", "scope": "Application of physics and engineering measurement methods to physiological signals, systems and clinical measurement.", "route_boundary": "IOMP recognizes this specialty, but confirm inclusion in this product's student-facing parent scope before promotion; the present description emphasizes ionizing radiation."}
        ],
        "decision": "IOMP explicitly names six medical-physics specialties: radiation oncology, medical imaging, nuclear medicine, medical health physics/radiation protection, non-ionizing medical radiation physics and physiological measurement. These are the evidence-backed candidate areas, though the last two need parent-scope reconciliation because the present domain description is radiation-focused. The current four ISCO groups should not stand as student specializations. Radiation therapists and radiographers are distinct clinical professions with separate competency and authorization pathways, not medical-physics specialties.",
        "omissions_and_over_splitting": "Do not split every modality, machine, isotope, imaging technique or treatment technology into a separate top-level area. Do not infer that every radiographer or radiation therapist is a medical physicist. Keep therapeutic, diagnostic and nuclear-medicine responsibilities distinct where competencies differ.",
        "computational_signal": "Treatment-planning optimization, image reconstruction, Monte Carlo simulation, quantitative imaging and dose calculation are important computational methods within the relevant branches; they do not by themselves justify a separate computational subgroup.",
        "jurisdiction_note": "Clinical scope, protected titles, licensing, training stages and permitted tasks vary substantially by country. IOMP/IAEA guidance is international professional guidance, not a universal license.",
        "no_specialization_disposition": None,
        "sources": [
            {"publisher": "International Organization for Medical Physics (IOMP)", "title": "Medical Physics", "url": "https://www.iomp.org/medical-physics/", "locator": "Defines medical physics and lists specialty fields including radiation oncology physics, medical imaging physics, nuclear medicine physics, medical health physics/radiation protection, non-ionizing medical radiation physics and physiological measurement.", "supports": "Direct international professional-body evidence for distinct medical-physics fields and against generic ISCO groups as specialization labels.", "limitation": "Professional overview; does not prescribe one universal student taxonomy or jurisdictional authorization."},
            {"publisher": "International Atomic Energy Agency (IAEA)", "title": "Roles and Responsibilities, and Education and Training Requirements for Clinically Qualified Medical Physicists", "url": "https://www.iaea.org/publications/13493/roles-and-responsibilities-and-education-and-training-requirements-for-clinically-qualified-medical-physicists", "locator": "IAEA publication describes clinical medical-physics specialties and role/education expectations across radiotherapy, diagnostic/interventional radiology and nuclear medicine.", "supports": "Supports the distinction between clinical physics specialties and adjacent clinical professions, and the need to keep training/authorization explicit.", "limitation": "International technical guidance; implementation and protected scopes remain national."}
        ],
        "review_status": "source_reviewed_candidate_specialties_parent_scope_needs_clinical_role_boundary"
    },
    {
        "domain_id": "D138", "domain_name": "Biomedical Engineering", "current_subgroup_count": 5,
        "current_subgroups": ["Biomedical Systems & Computational Engineering (7 roles)", "Health professionals (4 roles)", "Biomedical Engineering Technicians (1 role)", "Biomedical Laboratory Support (1 role)", "Assemblers (1 role)"],
        "current_state": "Five records mix a broad computational/system label, health-profession occupation aggregate, biomedical technician/support job families and assembly. They do not provide a coherent map of biomedical engineering specializations.",
        "parent_scope_disposition": "Retain biomedical engineering as engineering of biological/medical systems, devices and technologies across research, development, evaluation and lifecycle use. Separate clinical engineering/health-technology management from device design where learning goals differ, while allowing explicitly supported connections. Clinical care roles and generic assembly are not automatically biomedical engineering specializations.",
        "candidate_areas": [
            {"label": "Medical Devices and Clinical Engineering", "scope": "Design, evaluation, selection, safe deployment, maintenance and lifecycle management of medical equipment and health technologies.", "route_boundary": "WHO identifies lifecycle work from conception to use and health-technology management; distinguish device engineering from clinical operation."},
            {"label": "Biomedical Imaging and Instrumentation", "scope": "Sensors, measurement systems, biomedical instrumentation and technologies that acquire or process biological/clinical signals and images.", "route_boundary": "Medical imaging physics is a closely related discipline; avoid duplicate clinical-physics ownership without a clear engineering-versus-physics distinction."},
            {"label": "Biomaterials, Tissue and Cellular Engineering", "scope": "Materials and engineered biological systems for tissue interaction, repair, manufacturing or therapeutic delivery.", "route_boundary": "Keep cell/tissue engineering and biomaterials related but not assume every drug-delivery pathway belongs here."},
            {"label": "Biomechanics, Rehabilitation and Assistive Technology", "scope": "Mechanical analysis and engineering of the body, movement, orthoses/prostheses, rehabilitation and assistive systems.", "route_boundary": "Clinical rehabilitation professions remain separate; this is the engineering design/evaluation route."},
            {"label": "Neural and Bioelectrical Engineering", "scope": "Engineering of neural interfaces, neurotechnology, bioelectrical signals and related stimulation/recording systems.", "route_boundary": "A distinct, established research/practice area; do not collapse into generic instrumentation if it has a distinct learner pathway."},
            {"label": "Computational, Systems and Quantitative Bioengineering", "scope": "Computational and systems approaches to biological/physiological systems, biomedical data and engineering models.", "route_boundary": "Methods may cross every other branch; present as a specialization only when the learner chooses this deeper pathway, not as shared foundation by default."}
        ],
        "decision": "WHO describes biomedical engineers' roles across the medical-device lifecycle, while BMES professional meeting tracks identify established areas including biomaterials, biomechanics, imaging/instrumentation, neural engineering, rehabilitation, tissue engineering, biomedical robotics and computational/systems biology. Six candidate groupings provide a tractable navigation structure, not a fixed global standard. The current five groups are materially miscategorized and should be replaced only after role-by-role reconciliation.",
        "omissions_and_over_splitting": "Do not turn every application sector (cancer, cardiovascular, orthopaedic, infectious disease) into a separate top-level specialization; some are application contexts spanning methods. Do not absorb nurses, physicians, laboratory aides or production assemblers solely because they use or build medical technology.",
        "computational_signal": "Computational/systems biology, image analysis, modeling, signal processing and device-control methods are explicit parts of the field. Computation is cross-cutting; keep computational biology distinct where the core work is biological data/modeling rather than engineering a biomedical technology.",
        "jurisdiction_note": "Medical-device regulation, clinical-engineering scope, protected titles and approval pathways differ by jurisdiction. WHO's lifecycle account is international guidance and emphasizes context-specific technology assessment.",
        "no_specialization_disposition": None,
        "sources": [
            {"publisher": "World Health Organization (WHO)", "title": "Human resources for medical devices: the role of biomedical engineers", "url": "https://www.who.int/publications/i/item/9789241565479", "locator": "WHO Medical Device Technical Series (2022), 240-page report: biomedical-engineer roles across medical-device conception, design/development, regulation, evaluation, training and use/lifecycle.", "supports": "Authoritative global framing for the parent scope and the clinical-engineering/device-lifecycle route.", "limitation": "WHO document describes role breadth, not a mandated count or naming scheme for specializations."},
            {"publisher": "Biomedical Engineering Society (BMES)", "title": "Tracks and Subtracks", "url": "https://member.bmes.org/tracks-and-subtracks", "locator": "Lists recurring technical areas including biomaterials, biomechanics, biomedical imaging/instrumentation, neural engineering, orthopaedic/rehabilitation engineering, tissue engineering, device technologies/biomedical robotics, and bioinformatics/computational/systems biology.", "supports": "Provides a broad professional-community cross-check that the candidate subject areas are established and diverse.", "limitation": "Conference tracks are a US-based society's research/meeting organization, not a globally binding or exhaustive taxonomy."},
            {"publisher": "WHO", "title": "Health technology management", "url": "https://cdn.who.int/media/docs/default-source/medical-devices/health-technology-management/country-data-on-health-technology-management.pdf?sfvrsn=4c8eefbb_3", "locator": "Defines health-technology management/clinical engineering work such as needs assessment, selection, procurement, inventory, installation, maintenance, safe-use training and decommissioning.", "supports": "Supports distinguishing lifecycle/clinical-engineering practice from design-only and generic assembly buckets.", "limitation": "Operational healthcare-system organization varies by country and health system."}
        ],
        "review_status": "source_reviewed_candidate_structure_six_practice_families"
    },
    {
        "domain_id": "D139", "domain_name": "Game Design", "current_subgroup_count": 3,
        "current_subgroups": ["Game Art & Animation (22 roles)", "Gameplay Programming (12 roles)", "Creative Direction (7 roles)"],
        "current_state": "The three groups are plausible parts of a game-production ecosystem but omit design/narrative, audio, production, QA and other established disciplines. The root label 'Game Design' is narrower than its art, programming and direction content.",
        "parent_scope_disposition": "The existing coverage is game development/production, not game design alone. Rename or narrow the parent before finalizing subgroup count. If broad coverage is intended, use game development as the parent and distinguish design, art, engineering, audio, production and quality disciplines; not every game-adjacent business/legal/support role belongs in the same specialization tree.",
        "candidate_areas": [
            {"label": "Game Design and Narrative", "scope": "Rules, systems, levels, player experience, interaction, progression, writing and narrative/world design.", "route_boundary": "Game-design specialization; distinct from implementing the game systems in code."},
            {"label": "Game Art, Animation and Visual Development", "scope": "2D/3D art, characters, environments, animation, visual effects and game-facing visual assets.", "route_boundary": "Keep specialist production techniques within a coherent art route unless learning paths materially diverge."},
            {"label": "Game Engineering and Technology", "scope": "Gameplay, engine, graphics, tools, networking, systems and platform programming for games.", "route_boundary": "Technology implementation, not game design as a whole."},
            {"label": "Game Audio", "scope": "Interactive sound, music, dialogue and audio implementation for games.", "route_boundary": "IGDA identifies interactive audio as a distinct discipline community; separate from general audio production when game interactivity changes the work."},
            {"label": "Game Production and Team Delivery", "scope": "Planning, coordination, production management and delivery across multidisciplinary game teams.", "route_boundary": "A practice area supporting the product lifecycle rather than a creative direction umbrella."},
            {"label": "Game Quality, User Research and Accessibility", "scope": "Testing, player research, usability/accessibility evaluation and quality processes for playable products.", "route_boundary": "Include only where this domain intentionally covers production-quality pathways; do not imply QA is identical to design."}
        ],
        "decision": "IGDA's global professional communities and discipline awards recognize game art, writing/narrative, engineering/technology, audio, design, production, QA and localization among distinct contributions. These support a wider parent scope than 'Game Design'. Six candidate routes organize major student learning pathways but are product synthesis, not a standardized global taxonomy; confirm domain boundaries and avoid overfitting award categories.",
        "omissions_and_over_splitting": "Do not promote creative director automatically as a separate specialization: it is a senior leadership role spanning disciplines. Do not create a top-level area for each engine, platform, art technique, genre or production stage. Localization, business, legal and publishing may be adjacent pathways or separate domains.",
        "computational_signal": "Programming, tools/engine technology, graphics, networking, procedural systems and gameplay AI are computational practices; computational work is concentrated in the engineering branch, not shared equally by every learner or role.",
        "jurisdiction_note": "The field is global and studio structures vary by production size, platform and market. IGDA categories describe a professional community, not required credentials or a universal studio org chart.",
        "no_specialization_disposition": None,
        "sources": [
            {"publisher": "International Game Developers Association (IGDA)", "title": "Discipline Special Interest Groups", "url": "https://igda.org/sig-type/discipline/", "locator": "Lists Game Art, Game Design, Engineering, Interactive Audio, Production and other discipline-based communities.", "supports": "Confirms game-development work contains distinct professional disciplines beyond the three current subgroup labels.", "limitation": "Voluntary professional communities are not an exhaustive, standardized education taxonomy."},
            {"publisher": "IGDA", "title": "Global Industry Game Awards", "url": "https://igda.org/global-industry-game-awards/", "locator": "Discipline categories include art, writing/narrative, engineering/technology and subdisciplines such as design, audio, production support, QA/localization in the broader IGDA ecosystem.", "supports": "Cross-checks actual multidisciplinary game-production contributions and guards against a design-only parent label.", "limitation": "Award categories reflect a particular award framework and should not be copied as a complete subgroup set."}
        ],
        "review_status": "source_reviewed_parent_label_scope_mismatch_candidate_routes"
    },
    {
        "domain_id": "D140", "domain_name": "Robotics Engineering and Systems Design", "current_subgroup_count": 4,
        "current_subgroups": ["Robotics Engineering & Automation (9 roles)", "Teaching professionals (1 role)", "Robotics Technicians & Precision Systems (7 roles)", "Assemblers (1 role)"],
        "current_state": "One technical umbrella is mixed with a generic teaching aggregate, technicians/precision systems and assemblers. The existing structure is occupational rather than a clean map of robotics-engineering practice areas.",
        "parent_scope_disposition": "Keep the root on engineering and integration of robotic systems: mechanisms, actuation, sensing, control, software, autonomy, safety and deployment. Robotics is applied across industry, field/service, healthcare and other sectors; an application domain is not automatically a specialization unless it adds a distinct learning path. Teaching is an occupation, not a robotics specialization.",
        "candidate_areas": [
            {"label": "Robot Mechanisms, Mechatronics and Control", "scope": "Mechanical/electrical system design, actuation, embedded control, integration and verification of robot platforms.", "route_boundary": "Core systems engineering; detailed robotics manufacturing/assembly roles require their own evidence."},
            {"label": "Robot Perception, Localization and Autonomy", "scope": "Sensing, computer/robot vision, state estimation, mapping, planning and autonomous behavior.", "route_boundary": "Computational specialization candidates are real technical routes, but computational methods also support other areas."},
            {"label": "Manipulation and Human-Robot Interaction", "scope": "Grasping, manipulation, collaborative robotics, physical interaction and human-centered system design.", "route_boundary": "Keep interaction/design and manipulation engineering connected without assuming every collaborative robot has identical safety responsibilities."},
            {"label": "Robotic Systems Deployment and Application Engineering", "scope": "Integration and operation of robots in industrial, mobile/field, service or healthcare settings, including reliability and task-specific system design.", "route_boundary": "Applications can diverge greatly; show named application routes only when supported by domain-specific curriculum/evidence and do not duplicate adjacent engineering domains wholesale."}
        ],
        "decision": "IEEE Robotics and Automation Society technical committees span mechanisms/design, motion planning and control, robot vision, human-robot interaction, manipulation, field robotics, manufacturing automation and medical/service applications. This supports several coherent practice areas but also shows that application contexts and engineering methods intersect. Four candidate routes are a navigation synthesis, not an IEEE-prescribed subgroup count; current generic occupation records are unsuitable as student specializations.",
        "omissions_and_over_splitting": "Do not create a separate top-level subgroup for every robot type (drone, surgical robot, humanoid, mobile manipulator) or every algorithm. Do not classify teaching or assembly as engineering specializations; preserve technical pathways for technicians only if explicitly designed as such.",
        "computational_signal": "Perception, planning, estimation, learning, simulation and control software are central computational threads. They are distinct deepening routes where learning goals justify them, while robot computation is also integrated into mechanisms/control and application deployment.",
        "jurisdiction_note": "Machine-safety, industrial, medical and autonomous-system requirements differ by application and jurisdiction; IEEE technical committees establish research communities, not regulatory approval or licensing.",
        "no_specialization_disposition": None,
        "sources": [
            {"publisher": "IEEE Robotics and Automation Society", "title": "List of Technical Committees", "url": "https://www.ieee-ras.org/technical-committees/list-of-technical-committees/", "locator": "Committee scope includes robot vision, planning/control, manipulation, human-robot interaction, field robotics, medical robotics, manufacturing automation, robot learning, verification and mechanisms/design.", "supports": "Primary professional-society evidence for distinct and interacting robotics research/practice areas.", "limitation": "Committee structure is research-community organization, not a mandatory or exhaustive student specialization taxonomy."},
            {"publisher": "IEEE Robotics and Automation Society", "title": "Technical Committees", "url": "https://www.ieee-ras.org/technical-committees/", "locator": "Explains technical committees as tracking technical developments across applications, theory, models, metrics, experiments, architectures and products; identifies field and health/medical robotics clusters.", "supports": "Supports treating application areas as cross-cutting clusters and not equating every application with a standalone discipline.", "limitation": "Professional-society research organization; standards and safety obligations must be checked with the relevant regulator/standard body."}
        ],
        "review_status": "source_reviewed_candidate_routes_not_standardized"
    },
    {
        "domain_id": "D141", "domain_name": "Quantum Computing and Quantum Information", "current_subgroup_count": 5,
        "current_subgroups": ["Quantum Hardware & Sensing (6 roles)", "Teaching professionals (1 role)", "Quantum Applications, Policy & Standards (3 roles)", "Quantum Software & Algorithms (8 roles)", "Quantum Technology Operations (1 role)"],
        "current_state": "The data contains two technical pathways plus a generic teaching group, a mixed application/policy/standards group and a one-role operations bucket. The latter three are not coherent technical specializations as labelled.",
        "parent_scope_disposition": "Treat quantum information/technology as an interdisciplinary technical domain spanning quantum computation, communication/networking and sensing/metrology, grounded in quantum physics and information theory. Policy, standards, teaching and general operations are functions around the field, not equivalent technical specializations.",
        "candidate_areas": [
            {"label": "Quantum Computing Hardware and Devices", "scope": "Physical implementations, quantum devices, control/readout, fabrication/material platforms and cryogenic or photonic systems.", "route_boundary": "Hardware platform topics are specialisms within this area; do not treat every physical platform as a separate root area."},
            {"label": "Quantum Algorithms and Software", "scope": "Quantum algorithms, programming, compilation, error mitigation/correction and software tooling for quantum systems.", "route_boundary": "Algorithms and software often depend on hardware constraints but remain a coherent learning path."},
            {"label": "Quantum Communication and Networks", "scope": "Quantum information transfer, networking, protocols, quantum links and enabling network technologies.", "route_boundary": "Post-quantum cryptography is classical cryptography designed for quantum-era threats and should not be mislabeled quantum communication."},
            {"label": "Quantum Sensing and Metrology", "scope": "Quantum-enhanced measurement and sensors, precision metrology, timing and sensing applications.", "route_boundary": "Applied deployments in medicine/geology/navigation are contexts; core quantum sensing is the technical field."}
        ],
        "decision": "NIST's description of quantum information science distinguishes quantum computing, sensing and networks/communications; the existing source-backed QT_CFQT subgroup structure already separates software/algorithms and hardware/sensing. Four candidate routes make the omitted communications/network dimension visible and move teaching/policy/operations out of technical specialization labels. This is a global discipline synthesis, not a universal taxonomy or evidence of a mature labour market for every pathway.",
        "omissions_and_over_splitting": "Do not present application sectors (medicine, chemistry, materials, finance) as quantum specialties unless their learning outcomes are distinct. Do not merge standards/policy or operations with engineering tracks; show them as contextual roles or separate domains as appropriate. Distinguish quantum-safe classical cryptography from quantum information technology.",
        "computational_signal": "Quantum software, algorithms, compilation and error correction are central computational work. Classical simulation and high-performance computing are enabling methods; their presence alone does not make all quantum roles software roles.",
        "jurisdiction_note": "Standards, export controls, investment programmes and national quantum strategies vary by country. NIST is a US standards agency; its science overview supports technical scope, not a global policy or credential framework.",
        "no_specialization_disposition": None,
        "sources": [
            {"publisher": "National Institute of Standards and Technology (NIST)", "title": "Quantum Information Science", "url": "https://www.nist.gov/quantum-information-science", "locator": "Defines QIS at the intersection of quantum physics and information theory; identifies quantum computing, quantum sensors/measurement and quantum networks as major focus areas.", "supports": "Authoritative technical evidence for the four candidate routes and their distinct computing/sensing/network dimensions.", "limitation": "US national metrology agency overview; it does not prescribe a global education taxonomy or show labour-market maturity."},
            {"publisher": "National Institute of Standards and Technology (NIST)", "title": "Quantum Sensing Explained", "url": "https://www.nist.gov/quantum-information-science/quantum-sensing-explained", "locator": "Explains quantum-enhanced measurements and examples/applications across physical quantities and sectors.", "supports": "Substantiates quantum sensing/metrology as a distinct technical focus and separates it from computing alone.", "limitation": "Explanatory agency publication; not a career or curriculum standard."}
        ],
        "review_status": "source_reviewed_missing_network_area_and_mixed_nontechnical_groups"
    },
    {
        "domain_id": "D142", "domain_name": "Bioinformatics and Computational Biology", "current_subgroup_count": 1,
        "current_subgroups": ["Computational Biology & Bioinformatics (36 roles)"],
        "current_state": "One combined group reflects the umbrella's close relationship but hides different learner emphases and spans all 36 roles. It may remain an umbrella specialization if routes are not genuinely separable, but role volume/count is not evidence either way.",
        "parent_scope_disposition": "Retain the joint field as computational and quantitative analysis of biological systems and data. It overlaps health/biomedical informatics, statistics, software engineering and laboratory science; keep those boundaries task-based. Separate bioinformatics (data/information pipelines and interpretation) from computational biology (models and computational investigation of biological mechanisms) only where educational objectives and actual practice distinguish them.",
        "candidate_areas": [
            {"label": "Genomics and Omics Bioinformatics", "scope": "Computational handling, analysis, integration and interpretation of genomic, transcriptomic, proteomic and other high-throughput biological datasets.", "route_boundary": "Omics types can be nested topics; avoid one subgroup per assay or data modality."},
            {"label": "Molecular and Structural Bioinformatics", "scope": "Computational analysis of biological sequences, structures, molecular interactions and related biological databases/tools.", "route_boundary": "Keep distinct from wet-lab structural biology and from general software/database administration."},
            {"label": "Systems and Computational Biology", "scope": "Mathematical/computational modeling and analysis of biological systems, networks, dynamics and mechanisms.", "route_boundary": "A computational-science pathway; methods support biology questions and do not imply a specific clinical or laboratory occupation."},
            {"label": "Bioinformatics Infrastructure and Reproducible Data Science", "scope": "Biological data resources, workflow engineering, reproducible computing, software and computational support for research teams.", "route_boundary": "Candidate practice area supported by core-facility/professional competency evidence; confirm it is a learner specialization rather than a role-only service function before promotion."}
        ],
        "decision": "ISCB's curriculum-guideline work defines bioinformatics core competencies from career opportunities, core-facility needs and existing curricula, and describes practice in research, medical labs, software organizations and pharma/instrument companies. This supports differentiating data-centric bioinformatics from model-centric computational biology, while infrastructure/service competencies may form a distinct route if student learning objectives validate it. Four candidates are provisional; a single broad umbrella remains defensible if the local evidence does not support independent pathways.",
        "omissions_and_over_splitting": "Do not split every organism, disease, assay, omics type or algorithm into an area. Do not classify all biology researchers who use statistics or a programming language as bioinformaticians. Keep clinical health informatics, general data engineering and experimental laboratory specialisms distinct unless the learning path explicitly crosses them.",
        "computational_signal": "Computation is constitutive of this domain rather than an optional overlay: programming, statistics, data management, workflows, algorithms and modeling are core. Distinguish bioinformatics data analysis/infrastructure from computational biology modeling, and do not assume each role uses the same tool stack.",
        "jurisdiction_note": "The discipline is global; privacy, clinical-data access, human-subjects rules and genomic-data governance vary by jurisdiction. ISCB curriculum guidelines are professional/educational guidance, not licensing requirements.",
        "no_specialization_disposition": None,
        "sources": [
            {"publisher": "International Society for Computational Biology (ISCB)", "title": "Bioinformatics Curriculum Guidelines: Toward a Definition of Core Competencies", "url": "https://www.iscb.org/about-iscb/society-communications/announcements/2014apr21-bioinformatics-curriculum-guidelines", "locator": "ISCB Education Committee describes curriculum guidance informed by career opportunities, bioinformatics core facilities and existing education programmes; names practice settings in research, medical labs, software development and pharma/instrument companies.", "supports": "Primary professional-society evidence that the umbrella spans distinct competency contexts and that curriculum routes must be based on actual practice/learning objectives.", "limitation": "Guidelines are from 2014 and are an educational framework, not a current exhaustive global specialization count."},
            {"publisher": "National Center for Biotechnology Information (NCBI), US National Library of Medicine", "title": "Computational Biology", "url": "https://www.ncbi.nlm.nih.gov/books/NBK550339/", "locator": "NCBI Bookshelf collection includes distinct chapters/workflows on biological sequence analysis, high-throughput/omics analysis, systems biology and computational modeling.", "supports": "Technical corroboration that data-centric bioinformatics and model-centric computational biology contain connected but distinguishable work themes.", "limitation": "US public biomedical reference collection; it is explanatory and not an occupational or curriculum standard."}
        ],
        "review_status": "source_reviewed_candidate_internal_routes_needs_learning_path_validation"
    }
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh", action="store_true", help="refresh the six D137-D142 artifacts produced by this exact batch")
    args = parser.parse_args()
    batch = {
        "schema_version": "2026-10-05.specialization-domain-review-batch.v1",
        "range": {"first_domain_id": "D137", "last_domain_id": "D142", "count": 6},
        "review_method": "Individual scope, subgroup-count/label and boundary review against primary international professional, technical and educational sources. Existing role membership is not used to infer subgroup fit. Candidates are not canonical findings until reconciliation; jurisdictional practices remain labeled.",
        "canonical_changes": 0,
        "role_specialization_assignments": 0,
        "domains": ROWS,
    }
    batch_path = HERE / "D137_D142_reviews_checkpoint_005.json"
    batch_path.write_text(json.dumps(batch, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for row in ROWS:
        json_path = HERE / f"{row['domain_id']}_specialization_candidate_review_2026_10_05.json"
        md_path = HERE / f"{row['domain_id']}_specialization_candidate_review_2026_10_05.md"
        if (json_path.exists() or md_path.exists()) and not args.refresh:
            raise FileExistsError(f"Refusing to overwrite existing review for {row['domain_id']}")
        json_path.write_text(json.dumps(row, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        areas = "\n".join(f"- **{a['label']}** — {a['scope']} Boundary: {a['route_boundary']}" for a in row["candidate_areas"])
        sources = "\n".join(f"- [{s['publisher']}: {s['title']}]({s['url']}) — {s['locator']} Supports: {s['supports']} Limitation: {s['limitation']}" for s in row["sources"])
        groups = "; ".join(row["current_subgroups"])
        md = f"""# {row['domain_id']}: {row['domain_name']} — specialization audit

Status: `{row['review_status']}`. This is a source-grounded candidate review, not canonical taxonomy approval or academic-body sign-off.

## Existing structure

Current subgroup-record count: **{row['current_subgroup_count']}**. Current records: {groups}

{row['current_state']}

## Scope and proposed disposition

Parent boundary: {row['parent_scope_disposition']}

{row['decision']}

## Candidate areas of specialization

{areas}

## Boundary audit

- Omissions / over-splitting: {row['omissions_and_over_splitting']}
- Computational signals: {row['computational_signal']}
- Jurisdiction note: {row['jurisdiction_note']}

## Evidence and limits

{sources}

Sources support discipline and practice distinctions; they do not by themselves establish a universal number of student-facing areas. Current occupational-group membership is not used as proof of domain/subgroup correctness. No role-to-specialization mapping is made.
"""
        md_path.write_text(md, encoding="utf-8")
    print(f"Wrote {len(ROWS)} domain reviews and batch checkpoint: {batch_path.name}")


if __name__ == "__main__":
    main()
